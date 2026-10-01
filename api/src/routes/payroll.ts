import { Router, Request, Response, NextFunction } from 'express';
import { z } from 'zod';
import pool from '../db';
import { requireEmployer } from '../middleware/auth';
import {
  computeFederalWithholding,
  computeFica,
  DEFAULT_W4,
  PAY_PERIODS,
  type W4Elections,
  type PayFrequency,
} from '../lib/withholding';

const router = Router();

// GET / — list all payroll runs for tenant
router.get(
  '/',
  requireEmployer,
  async (req: Request, res: Response, next: NextFunction) => {
    try {
      const { tenantId } = req.user!;
      const result = await pool.query(
        `SELECT
           pr.id, pr.period_start, pr.period_end, pr.status,
           pr.total_gross, pr.total_net, pr.total_deductions, pr.created_at,
           u.full_name AS run_by_name
         FROM payroll_runs pr
         LEFT JOIN users u ON u.id = pr.run_by
         WHERE pr.tenant_id = $1
         ORDER BY pr.created_at DESC`,
        [tenantId]
      );
      res.json(result.rows);
    } catch (err) {
      next(err);
    }
  }
);

// POST / — create payroll run and auto-generate items from active employees
const createPayrollSchema = z.object({
  periodStart: z.string().regex(/^\d{4}-\d{2}-\d{2}$/),
  periodEnd: z.string().regex(/^\d{4}-\d{2}-\d{2}$/),
});

router.post(
  '/',
  requireEmployer,
  async (req: Request, res: Response, next: NextFunction) => {
    try {
      const body = createPayrollSchema.parse(req.body);
      const { tenantId, userId } = req.user!;

      const client = await pool.connect();
      try {
        await client.query('BEGIN');

        // Fetch all active employees + their W-4 elections for this tenant
        const employees = await client.query<{
          id: string;
          gross_salary: string;
          pay_frequency: string;
          filing_status: string | null;
          multiple_jobs: boolean | null;
          dependents_amount: string | null;
          other_income: string | null;
          extra_deductions: string | null;
          extra_withholding: string | null;
          exempt: boolean | null;
        }>(
          `SELECT
             e.id, e.gross_salary, e.pay_frequency,
             w.filing_status, w.multiple_jobs, w.dependents_amount,
             w.other_income, w.extra_deductions, w.extra_withholding, w.exempt
           FROM employees e
           LEFT JOIN employee_w4 w ON w.employee_id = e.id
           WHERE e.tenant_id = $1 AND e.employment_status = 'active'`,
          [tenantId]
        );

        if (employees.rows.length === 0) {
          await client.query('ROLLBACK');
          res.status(422).json({ error: 'No active employees found to run payroll for' });
          return;
        }

        let totalGross = 0;
        let totalNet = 0;
        let totalDeductions = 0;

        const items = employees.rows.map((emp) => {
          const annualGross = parseFloat(emp.gross_salary);
          const frequency   = (emp.pay_frequency as PayFrequency) in PAY_PERIODS
            ? emp.pay_frequency as PayFrequency
            : 'monthly';
          const periods     = PAY_PERIODS[frequency];
          const periodGross = parseFloat((annualGross / periods).toFixed(2));

          // Build W-4 elections — fall back to DEFAULT_W4 if none on file
          const w4: W4Elections = emp.filing_status ? {
            filingStatus:     emp.filing_status as W4Elections['filingStatus'],
            multipleJobs:     emp.multiple_jobs ?? false,
            dependentsAmount: parseFloat(emp.dependents_amount ?? '0'),
            otherIncome:      parseFloat(emp.other_income ?? '0'),
            extraDeductions:  parseFloat(emp.extra_deductions ?? '0'),
            extraWithholding: parseFloat(emp.extra_withholding ?? '0'),
            exempt:           emp.exempt ?? false,
          } : DEFAULT_W4;

          const federalTax     = computeFederalWithholding(periodGross, frequency, w4);
          const { socialSecurity, medicare } = computeFica(periodGross, frequency);
          const deductionsTotal = parseFloat((federalTax + socialSecurity + medicare).toFixed(2));
          const net             = parseFloat((periodGross - deductionsTotal).toFixed(2));

          totalGross      += periodGross;
          totalDeductions += deductionsTotal;
          totalNet        += net;

          return {
            employeeId: emp.id,
            grossPay:   periodGross,
            deductions: { federalTax, socialSecurity, medicare, total: deductionsTotal },
            netPay:     net,
          };
        });

        // Create payroll run
        const runResult = await client.query<{ id: string }>(
          `INSERT INTO payroll_runs
             (tenant_id, period_start, period_end, total_gross, total_net, total_deductions, run_by)
           VALUES ($1, $2, $3, $4, $5, $6, $7)
           RETURNING id`,
          [
            tenantId,
            body.periodStart,
            body.periodEnd,
            totalGross.toFixed(2),
            totalNet.toFixed(2),
            totalDeductions.toFixed(2),
            userId,
          ]
        );
        const runId = runResult.rows[0].id;

        // Insert payroll items
        for (const item of items) {
          await client.query(
            `INSERT INTO payroll_run_items
               (tenant_id, payroll_run_id, employee_id, gross_pay, deductions, net_pay)
             VALUES ($1, $2, $3, $4, $5, $6)`,
            [
              tenantId,
              runId,
              item.employeeId,
              item.grossPay,
              JSON.stringify(item.deductions),
              item.netPay,
            ]
          );
        }

        await client.query('COMMIT');

        const fresh = await pool.query(
          `SELECT * FROM payroll_runs WHERE id = $1`,
          [runId]
        );
        res.status(201).json(fresh.rows[0]);
      } catch (err) {
        await client.query('ROLLBACK');
        throw err;
      } finally {
        client.release();
      }
    } catch (err) {
      if (err instanceof z.ZodError) {
        res.status(400).json({ error: err.errors });
        return;
      }
      next(err);
    }
  }
);

// GET /:id — get run with all items
router.get(
  '/:id',
  requireEmployer,
  async (req: Request, res: Response, next: NextFunction) => {
    try {
      const { tenantId } = req.user!;
      const { id } = req.params;

      const runResult = await pool.query(
        `SELECT
           pr.id, pr.period_start, pr.period_end, pr.status,
           pr.total_gross, pr.total_net, pr.total_deductions, pr.created_at,
           u.full_name AS run_by_name
         FROM payroll_runs pr
         LEFT JOIN users u ON u.id = pr.run_by
         WHERE pr.id = $1 AND pr.tenant_id = $2`,
        [id, tenantId]
      );

      if (!runResult.rows[0]) {
        res.status(404).json({ error: 'Payroll run not found' });
        return;
      }

      const itemsResult = await pool.query(
        `SELECT
           pri.id, pri.gross_pay, pri.deductions, pri.net_pay, pri.status,
           e.id AS employee_id, e.employee_number,
           u.full_name AS employee_name
         FROM payroll_run_items pri
         JOIN employees e ON e.id = pri.employee_id
         JOIN users u ON u.id = e.user_id
         WHERE pri.payroll_run_id = $1 AND pri.tenant_id = $2
         ORDER BY u.full_name ASC`,
        [id, tenantId]
      );

      res.json({
        ...runResult.rows[0],
        items: itemsResult.rows,
      });
    } catch (err) {
      next(err);
    }
  }
);

// PATCH /:id/approve — mark run as completed
router.patch(
  '/:id/approve',
  requireEmployer,
  async (req: Request, res: Response, next: NextFunction) => {
    try {
      const { tenantId } = req.user!;
      const { id } = req.params;

      const runResult = await pool.query(
        `UPDATE payroll_runs SET status = 'completed'
         WHERE id = $1 AND tenant_id = $2
         RETURNING *`,
        [id, tenantId]
      );

      if (!runResult.rows[0]) {
        res.status(404).json({ error: 'Payroll run not found' });
        return;
      }

      // Update all pending items to completed
      await pool.query(
        `UPDATE payroll_run_items SET status = 'completed'
         WHERE payroll_run_id = $1 AND tenant_id = $2`,
        [id, tenantId]
      );

      res.json(runResult.rows[0]);
    } catch (err) {
      next(err);
    }
  }
);

export default router;
