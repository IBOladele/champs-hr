import { Router, Request, Response, NextFunction } from 'express';
import pool from '../db';
import { requireAuth } from '../middleware/auth';

const router = Router();

// GET /employee/dashboard — employee's own dashboard
router.get(
  '/',
  requireAuth,
  async (req: Request, res: Response, next: NextFunction) => {
    try {
      const { userId, tenantId } = req.user!;

      // Look up the employee record for this user
      const empRow = await pool.query<{
        id: string;
        employee_number: string;
        job_title: string;
        employment_type: string;
        start_date: string;
        gross_salary: string;
        department_name: string | null;
      }>(
        `SELECT
           e.id, e.employee_number, e.job_title, e.employment_type,
           e.start_date, e.gross_salary,
           d.name AS department_name
         FROM employees e
         LEFT JOIN departments d ON d.id = e.department_id
         WHERE e.user_id = $1 AND e.tenant_id = $2
         LIMIT 1`,
        [userId, tenantId],
      );

      if (!empRow.rows[0]) {
        res.status(404).json({ error: 'Employee profile not found' });
        return;
      }

      const emp = empRow.rows[0];
      const employeeId = emp.id;

      const [
        payslips,
        annualLeave,
        sickLeave,
        pendingLeaveCount,
        enrolledBenefits,
        benefitPlans,
        attendanceStats,
      ] = await Promise.all([
        // Last 3 payslips
        pool.query<{
          id: string;
          period_start: string;
          period_end: string;
          gross_pay: string;
          net_pay: string;
          status: string;
        }>(
          `SELECT pri.id, pr.period_start, pr.period_end,
                  pri.gross_pay, pri.net_pay, pri.status
           FROM payroll_run_items pri
           JOIN payroll_runs pr ON pr.id = pri.payroll_run_id
           WHERE pri.employee_id = $1
           ORDER BY pr.period_end DESC
           LIMIT 3`,
          [employeeId],
        ),

        // Annual leave used this calendar year
        pool.query<{ days_used: string }>(
          `SELECT COALESCE(SUM(days_requested), 0) AS days_used
           FROM leave_requests
           WHERE employee_id = $1
             AND leave_type = 'annual'
             AND status = 'approved'
             AND DATE_PART('year', start_date) = DATE_PART('year', CURRENT_DATE)`,
          [employeeId],
        ),

        // Sick leave used this calendar year
        pool.query<{ days_used: string }>(
          `SELECT COALESCE(SUM(days_requested), 0) AS days_used
           FROM leave_requests
           WHERE employee_id = $1
             AND leave_type = 'sick'
             AND status = 'approved'
             AND DATE_PART('year', start_date) = DATE_PART('year', CURRENT_DATE)`,
          [employeeId],
        ),

        // Pending leave requests count
        pool.query<{ count: string }>(
          `SELECT COUNT(*) AS count
           FROM leave_requests
           WHERE employee_id = $1 AND status = 'pending'`,
          [employeeId],
        ),

        // Count of active enrolled benefits
        pool.query<{ count: string }>(
          `SELECT COUNT(*) AS count
           FROM employee_benefits
           WHERE employee_id = $1 AND status = 'active'`,
          [employeeId],
        ),

        // Benefit plan details
        pool.query<{
          id: string;
          name: string;
          benefit_type: string;
          value: string;
          currency: string;
        }>(
          `SELECT b.id, b.name, b.benefit_type, b.value, b.currency
           FROM employee_benefits eb
           JOIN benefits b ON b.id = eb.benefit_id
           WHERE eb.employee_id = $1 AND eb.status = 'active'`,
          [employeeId],
        ),

        // Attendance for current calendar month
        pool.query<{
          days_present: string;
          days_absent: string;
          days_late: string;
          days_remote: string;
          hours_worked: string;
        }>(
          `SELECT
             COUNT(*) FILTER (WHERE status = 'present') AS days_present,
             COUNT(*) FILTER (WHERE status = 'absent')  AS days_absent,
             COUNT(*) FILTER (WHERE status = 'late')    AS days_late,
             COUNT(*) FILTER (WHERE status = 'remote')  AS days_remote,
             ROUND(
               CAST(COALESCE(EXTRACT(EPOCH FROM SUM(clock_out - clock_in)) / 3600, 0) AS NUMERIC),
               1
             ) AS hours_worked
           FROM attendance_records
           WHERE employee_id = $1
             AND DATE_TRUNC('month', date) = DATE_TRUNC('month', CURRENT_DATE)`,
          [employeeId],
        ),
      ]);

      const annualUsed = parseFloat(annualLeave.rows[0].days_used);
      const sickUsed   = parseFloat(sickLeave.rows[0].days_used);
      const att        = attendanceStats.rows[0];

      res.json({
        profile: {
          employeeId:     emp.id,
          employeeNumber: emp.employee_number,
          jobTitle:       emp.job_title,
          employmentType: emp.employment_type,
          startDate:      emp.start_date,
          grossSalary:    parseFloat(emp.gross_salary),
          department:     emp.department_name ?? null,
        },
        recentPayslips: payslips.rows.map((p) => ({
          id:          p.id,
          periodStart: p.period_start,
          periodEnd:   p.period_end,
          grossPay:    parseFloat(p.gross_pay),
          netPay:      parseFloat(p.net_pay),
          status:      p.status,
        })),
        leaveBalance: {
          annual: {
            used:      annualUsed,
            remaining: 25 - annualUsed,
          },
          sick: {
            used:      sickUsed,
            remaining: 10 - sickUsed,
          },
          pending: parseInt(pendingLeaveCount.rows[0].count, 10),
        },
        benefits: {
          enrolled: parseInt(enrolledBenefits.rows[0].count, 10),
          plans: benefitPlans.rows.map((b) => ({
            id:       b.id,
            name:     b.name,
            type:     b.benefit_type,
            value:    parseFloat(b.value),
            currency: b.currency,
          })),
        },
        attendance: {
          daysPresent:  parseInt(att.days_present, 10),
          daysAbsent:   parseInt(att.days_absent, 10),
          daysLate:     parseInt(att.days_late, 10),
          daysRemote:   parseInt(att.days_remote, 10),
          hoursWorked:  parseFloat(att.hours_worked),
        },
      });
    } catch (err) {
      next(err);
    }
  },
);

export default router;
