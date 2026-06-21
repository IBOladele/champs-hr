import { Router, Request, Response, NextFunction } from 'express';
import pool from '../db';
import { requireAuth } from '../middleware/auth';

const router = Router();

// GET / — employer sees all; employee sees own
router.get(
  '/',
  requireAuth,
  async (req: Request, res: Response, next: NextFunction) => {
    try {
      const { tenantId, role, userId } = req.user!;

      let query: string;
      let values: unknown[];

      if (role === 'employer') {
        query = `
          SELECT
            ar.id, ar.date, ar.clock_in, ar.clock_out, ar.status, ar.notes, ar.created_at,
            e.id AS employee_id, e.employee_number,
            u.full_name AS employee_name
          FROM attendance_records ar
          JOIN employees e ON e.id = ar.employee_id
          JOIN users u ON u.id = e.user_id
          WHERE ar.tenant_id = $1
          ORDER BY ar.date DESC, u.full_name ASC`;
        values = [tenantId];
      } else {
        query = `
          SELECT
            ar.id, ar.date, ar.clock_in, ar.clock_out, ar.status, ar.notes, ar.created_at,
            e.id AS employee_id, e.employee_number,
            u.full_name AS employee_name
          FROM attendance_records ar
          JOIN employees e ON e.id = ar.employee_id
          JOIN users u ON u.id = e.user_id
          WHERE ar.tenant_id = $1 AND u.id = $2
          ORDER BY ar.date DESC`;
        values = [tenantId, userId];
      }

      const result = await pool.query(query, values);
      res.json(result.rows);
    } catch (err) {
      next(err);
    }
  }
);

// POST /clock-in — insert or update today's record with clock_in
router.post(
  '/clock-in',
  requireAuth,
  async (req: Request, res: Response, next: NextFunction) => {
    try {
      const { tenantId, userId } = req.user!;

      const empResult = await pool.query<{ id: string }>(
        `SELECT id FROM employees WHERE user_id = $1 AND tenant_id = $2`,
        [userId, tenantId]
      );
      if (!empResult.rows[0]) {
        res.status(404).json({ error: 'Employee profile not found' });
        return;
      }
      const employeeId = empResult.rows[0].id;

      // Use today's date in UTC
      const today = new Date().toISOString().slice(0, 10);

      const result = await pool.query(
        `INSERT INTO attendance_records (tenant_id, employee_id, date, clock_in, status)
         VALUES ($1, $2, $3, NOW(), 'present')
         ON CONFLICT (tenant_id, employee_id, date)
         DO UPDATE SET clock_in = EXCLUDED.clock_in
         RETURNING *`,
        [tenantId, employeeId, today]
      );

      res.status(200).json(result.rows[0]);
    } catch (err) {
      next(err);
    }
  }
);

// POST /clock-out — update today's record with clock_out
router.post(
  '/clock-out',
  requireAuth,
  async (req: Request, res: Response, next: NextFunction) => {
    try {
      const { tenantId, userId } = req.user!;

      const empResult = await pool.query<{ id: string }>(
        `SELECT id FROM employees WHERE user_id = $1 AND tenant_id = $2`,
        [userId, tenantId]
      );
      if (!empResult.rows[0]) {
        res.status(404).json({ error: 'Employee profile not found' });
        return;
      }
      const employeeId = empResult.rows[0].id;

      const today = new Date().toISOString().slice(0, 10);

      const result = await pool.query(
        `UPDATE attendance_records
         SET clock_out = NOW()
         WHERE tenant_id = $1 AND employee_id = $2 AND date = $3
         RETURNING *`,
        [tenantId, employeeId, today]
      );

      if (!result.rows[0]) {
        res.status(404).json({ error: 'No clock-in record found for today. Clock in first.' });
        return;
      }

      res.json(result.rows[0]);
    } catch (err) {
      next(err);
    }
  }
);

export default router;
