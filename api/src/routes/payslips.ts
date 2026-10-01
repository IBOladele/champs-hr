import { Router, Request, Response, NextFunction } from 'express';
import { z } from 'zod';
import pool from '../db';
import { requireAuth } from '../middleware/auth';

const router = Router();

async function resolveEmployee(id: string, tenantId: string) {
  const r = await pool.query<{ id: string; user_id: string }>(
    `SELECT id, user_id FROM employees WHERE id = $1 AND tenant_id = $2`,
    [id, tenantId],
  );
  return r.rows[0] ?? null;
}

// GET /employees/:id/payslips  — employee sees own; employer sees any
router.get(
  '/employees/:id/payslips',
  requireAuth,
  async (req: Request, res: Response, next: NextFunction) => {
    try {
      const { tenantId, role, userId } = req.user!;

      const yearParam = req.query.year as string | undefined;
      if (yearParam) {
        const yearCheck = z.string().regex(/^\d{4}$/).safeParse(yearParam);
        if (!yearCheck.success) {
          res.status(400).json({ error: 'year must be a 4-digit number' }); return;
        }
      }

      const emp = await resolveEmployee(req.params.id, tenantId);
      if (!emp) { res.status(404).json({ error: 'Employee not found' }); return; }

      if (role === 'employee' && emp.user_id !== userId) {
        res.status(403).json({ error: 'Access denied' }); return;
      }

      const values: unknown[] = [emp.id, tenantId];
      let yearFilter = '';
      if (yearParam) {
        values.push(parseInt(yearParam, 10));
        yearFilter = `AND EXTRACT(YEAR FROM pr.period_start) = $${values.length}`;
      }

      const result = await pool.query(
        `SELECT
           pri.id,
           pri.gross_pay,
           pri.deductions,
           pri.net_pay,
           pri.status,
           pr.id          AS payroll_run_id,
           pr.period_start,
           pr.period_end,
           pr.status      AS run_status,
           pr.created_at  AS run_created_at
         FROM payroll_run_items pri
         JOIN payroll_runs pr ON pr.id = pri.payroll_run_id
         WHERE pri.employee_id = $1
           AND pri.tenant_id   = $2
           AND pr.status       = 'completed'
           ${yearFilter}
         ORDER BY pr.period_start DESC`,
        values,
      );

      res.json(result.rows);
    } catch (err) { next(err); }
  },
);

// GET /employees/:id/payslips/:itemId  — single payslip detail
router.get(
  '/employees/:id/payslips/:itemId',
  requireAuth,
  async (req: Request, res: Response, next: NextFunction) => {
    try {
      const { tenantId, role, userId } = req.user!;

      const emp = await resolveEmployee(req.params.id, tenantId);
      if (!emp) { res.status(404).json({ error: 'Employee not found' }); return; }

      if (role === 'employee' && emp.user_id !== userId) {
        res.status(403).json({ error: 'Access denied' }); return;
      }

      const result = await pool.query(
        `SELECT
           pri.id,
           pri.gross_pay,
           pri.deductions,
           pri.net_pay,
           pri.status,
           pr.id          AS payroll_run_id,
           pr.period_start,
           pr.period_end,
           pr.status      AS run_status,
           pr.created_at  AS run_created_at,
           u.full_name    AS employee_name,
           u.email        AS employee_email,
           t.name         AS employer_name
         FROM payroll_run_items pri
         JOIN payroll_runs pr  ON pr.id  = pri.payroll_run_id
         JOIN employees   e   ON e.id   = pri.employee_id
         JOIN users       u   ON u.id   = e.user_id
         JOIN tenants     t   ON t.id   = e.tenant_id
         WHERE pri.id          = $1
           AND pri.employee_id = $2
           AND pri.tenant_id   = $3
           AND pr.status       = 'completed'`,
        [req.params.itemId, emp.id, tenantId],
      );

      if (!result.rows[0]) { res.status(404).json({ error: 'Payslip not found' }); return; }
      res.json(result.rows[0]);
    } catch (err) { next(err); }
  },
);

export default router;
