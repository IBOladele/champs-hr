import { Router, Request, Response, NextFunction } from 'express';
import pool from '../db';
import { requireEmployer } from '../middleware/auth';

const router = Router();

// GET /stats — employer dashboard aggregate stats
router.get(
  '/',
  requireEmployer,
  async (req: Request, res: Response, next: NextFunction) => {
    try {
      const { tenantId } = req.user!;

      const [employees, leave, payroll, attendance] = await Promise.all([
        // Employee counts
        pool.query<{
          total: string;
          active: string;
          on_leave: string;
          new_this_month: string;
        }>(
          `SELECT
             COUNT(*)                                                                    AS total,
             COUNT(*) FILTER (WHERE employment_status = 'active')                       AS active,
             COUNT(*) FILTER (WHERE employment_status = 'on_leave')                     AS on_leave,
             COUNT(*) FILTER (WHERE DATE_TRUNC('month', created_at) = DATE_TRUNC('month', NOW())) AS new_this_month
           FROM employees WHERE tenant_id = $1`,
          [tenantId],
        ),

        // Leave request counts
        pool.query<{
          pending: string;
          approved_this_month: string;
        }>(
          `SELECT
             COUNT(*) FILTER (WHERE status = 'pending')                                 AS pending,
             COUNT(*) FILTER (
               WHERE status = 'approved'
               AND DATE_TRUNC('month', reviewed_at) = DATE_TRUNC('month', NOW())
             )                                                                           AS approved_this_month
           FROM leave_requests WHERE tenant_id = $1`,
          [tenantId],
        ),

        // Payroll stats
        pool.query<{
          total_runs: string;
          latest_run_gross: string | null;
          latest_run_date: string | null;
          pending_runs: string;
        }>(
          `SELECT
             COUNT(*)                                                                    AS total_runs,
             (SELECT total_gross FROM payroll_runs
              WHERE tenant_id = $1 ORDER BY created_at DESC LIMIT 1)                    AS latest_run_gross,
             (SELECT period_end  FROM payroll_runs
              WHERE tenant_id = $1 ORDER BY created_at DESC LIMIT 1)                    AS latest_run_date,
             COUNT(*) FILTER (WHERE status = 'pending')                                 AS pending_runs
           FROM payroll_runs WHERE tenant_id = $1`,
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
             COUNT(*) FILTER (WHERE status = 'present')   AS present,
             COUNT(*) FILTER (WHERE status = 'late')      AS late,
             COUNT(*) FILTER (WHERE status = 'absent')    AS absent,
             COUNT(*) FILTER (WHERE status = 'remote')    AS remote
           FROM attendance_records
           WHERE tenant_id = $1 AND date = CURRENT_DATE`,
          [tenantId],
        ),
      ]);

      const emp = employees.rows[0];
      const lv  = leave.rows[0];
      const pr  = payroll.rows[0];
      const att = attendance.rows[0];

      res.json({
        employees: {
          total:        parseInt(emp.total, 10),
          active:       parseInt(emp.active, 10),
          onLeave:      parseInt(emp.on_leave, 10),
          newThisMonth: parseInt(emp.new_this_month, 10),
        },
        leave: {
          pendingRequests:     parseInt(lv.pending, 10),
          approvedThisMonth:   parseInt(lv.approved_this_month, 10),
        },
        payroll: {
          totalRuns:      parseInt(pr.total_runs, 10),
          pendingRuns:    parseInt(pr.pending_runs, 10),
          latestRunGross: pr.latest_run_gross ? parseFloat(pr.latest_run_gross) : null,
          latestRunDate:  pr.latest_run_date ?? null,
        },
        attendance: {
          today: {
            present: parseInt(att.present, 10),
            late:    parseInt(att.late, 10),
            absent:  parseInt(att.absent, 10),
            remote:  parseInt(att.remote, 10),
          },
        },
      });
    } catch (err) {
      next(err);
    }
  },
);

export default router;
