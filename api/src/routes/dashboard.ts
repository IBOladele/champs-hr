import { Router, Request, Response, NextFunction } from 'express';
import pool from '../db';
import { requireEmployer } from '../middleware/auth';

const router = Router();

// GET /dashboard — employer dashboard aggregate
router.get(
  '/',
  requireEmployer,
  async (req: Request, res: Response, next: NextFunction) => {
    try {
      const { tenantId } = req.user!;

      const [
        tenantRow,
        employees,
        invited,
        nextPayrollRow,
        recentPayrolls,
        upcomingStarters,
        pendingLeave,
        attendance,
      ] = await Promise.all([
        // Tenant setup info
        pool.query<{ onboarding_step: number; onboarding_completed: boolean }>(
          `SELECT onboarding_step, onboarding_completed FROM tenants WHERE id = $1`,
          [tenantId],
        ),

        // Employee counts by status
        pool.query<{
          total: string;
          active: string;
          on_leave: string;
          new_this_month: string;
        }>(
          `SELECT
             COUNT(*)                                                                        AS total,
             COUNT(*) FILTER (WHERE employment_status = 'active')                           AS active,
             COUNT(*) FILTER (WHERE employment_status = 'on_leave')                         AS on_leave,
             COUNT(*) FILTER (WHERE DATE_TRUNC('month', created_at) = DATE_TRUNC('month', NOW())) AS new_this_month
           FROM employees WHERE tenant_id = $1`,
          [tenantId],
        ),

        // Invited: employee-role users with no employees row yet
        pool.query<{ count: string }>(
          `SELECT COUNT(*) AS count
           FROM users
           WHERE tenant_id = $1
             AND role = 'employee'
             AND id NOT IN (SELECT user_id FROM employees WHERE tenant_id = $1)`,
          [tenantId],
        ),

        // Next payroll: most recent draft or pending run
        pool.query<{
          id: string;
          period_start: string;
          period_end: string;
          status: string;
          total_gross: string | null;
        }>(
          `SELECT id, period_start, period_end, status, total_gross
           FROM payroll_runs
           WHERE tenant_id = $1 AND status IN ('draft', 'pending')
           ORDER BY created_at DESC
           LIMIT 1`,
          [tenantId],
        ),

        // Recent paid/approved payroll runs (last 3)
        pool.query<{
          id: string;
          period_start: string;
          period_end: string;
          total_gross: string | null;
          total_net: string | null;
          status: string;
          created_at: string;
        }>(
          `SELECT id, period_start, period_end, total_gross, total_net, status, created_at
           FROM payroll_runs
           WHERE tenant_id = $1 AND status IN ('paid', 'approved')
           ORDER BY created_at DESC
           LIMIT 3`,
          [tenantId],
        ),

        // Upcoming starters: start_date today or within next 30 days
        pool.query<{
          id: string;
          full_name: string;
          job_title: string;
          start_date: string;
        }>(
          `SELECT e.id, u.full_name, e.job_title, e.start_date
           FROM employees e
           JOIN users u ON u.id = e.user_id
           WHERE e.tenant_id = $1
             AND e.start_date >= CURRENT_DATE
             AND e.start_date <= CURRENT_DATE + INTERVAL '30 days'
           ORDER BY e.start_date ASC`,
          [tenantId],
        ),

        // Pending leave count
        pool.query<{ count: string }>(
          `SELECT COUNT(*) AS count
           FROM leave_requests
           WHERE tenant_id = $1 AND status = 'pending'`,
          [tenantId],
        ),

        // Today's attendance
        pool.query<{
          present: string;
          late: string;
          absent: string;
          remote: string;
        }>(
          `SELECT
             COUNT(*) FILTER (WHERE status = 'present') AS present,
             COUNT(*) FILTER (WHERE status = 'late')    AS late,
             COUNT(*) FILTER (WHERE status = 'absent')  AS absent,
             COUNT(*) FILTER (WHERE status = 'remote')  AS remote
           FROM attendance_records
           WHERE tenant_id = $1 AND date = CURRENT_DATE`,
          [tenantId],
        ),
      ]);

      const tenant = tenantRow.rows[0];
      const emp    = employees.rows[0];
      const att    = attendance.rows[0];

      // Resolve nextPayroll employee count if a run exists
      let nextPayroll = null;
      if (nextPayrollRow.rows[0]) {
        const run = nextPayrollRow.rows[0];
        const countRes = await pool.query<{ count: string }>(
          `SELECT COUNT(*) AS count FROM payroll_run_items WHERE payroll_run_id = $1`,
          [run.id],
        );
        nextPayroll = {
          id: run.id,
          periodStart: run.period_start,
          periodEnd: run.period_end,
          status: run.status,
          totalGross: run.total_gross != null ? parseFloat(run.total_gross) : null,
          employeeCount: parseInt(countRes.rows[0].count, 10),
        };
      }

      res.json({
        setup: {
          step:      tenant?.onboarding_step ?? 0,
          completed: tenant?.onboarding_completed ?? false,
        },
        employees: {
          total:        parseInt(emp.total, 10),
          active:       parseInt(emp.active, 10),
          onLeave:      parseInt(emp.on_leave, 10),
          newThisMonth: parseInt(emp.new_this_month, 10),
          invited:      parseInt(invited.rows[0].count, 10),
        },
        nextPayroll,
        recentPayrolls: recentPayrolls.rows.map((r) => ({
          id:          r.id,
          periodStart: r.period_start,
          periodEnd:   r.period_end,
          totalGross:  r.total_gross != null ? parseFloat(r.total_gross) : null,
          totalNet:    r.total_net   != null ? parseFloat(r.total_net)   : null,
          status:      r.status,
          createdAt:   r.created_at,
        })),
        upcomingStarters: upcomingStarters.rows.map((s) => ({
          id:        s.id,
          fullName:  s.full_name,
          jobTitle:  s.job_title,
          startDate: s.start_date,
        })),
        pendingLeave: parseInt(pendingLeave.rows[0].count, 10),
        attendance: {
          present: parseInt(att.present, 10),
          late:    parseInt(att.late, 10),
          absent:  parseInt(att.absent, 10),
          remote:  parseInt(att.remote, 10),
        },
      });
    } catch (err) {
      next(err);
    }
  },
);

export default router;
