import { Router, Request, Response, NextFunction } from 'express';
import { z } from 'zod';
import pool from '../db';
import { requireAuth, requireEmployer } from '../middleware/auth';

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

const manualAttendanceSchema = z.object({
  employeeId: z.string().uuid(),
  date: z.string().regex(/^\d{4}-\d{2}-\d{2}$/),
  status: z.enum(['present', 'absent', 'late', 'half_day', 'remote']),
  clockIn: z.string().optional().nullable(),
  clockOut: z.string().optional().nullable(),
  notes: z.string().optional().nullable(),
});

// POST / — employer manually creates an attendance record for any employee
router.post(
  '/',
  requireEmployer,
  async (req: Request, res: Response, next: NextFunction) => {
    try {
      const body = manualAttendanceSchema.parse(req.body);
      const { tenantId } = req.user!;

      const empCheck = await pool.query<{ id: string }>(
        `SELECT id FROM employees WHERE id = $1 AND tenant_id = $2`,
        [body.employeeId, tenantId],
      );
      if (!empCheck.rows[0]) { res.status(404).json({ error: 'Employee not found' }); return; }

      const result = await pool.query(
        `INSERT INTO attendance_records
           (tenant_id, employee_id, date, status, clock_in, clock_out, notes)
         VALUES ($1, $2, $3, $4, $5::timestamptz, $6::timestamptz, $7)
         ON CONFLICT (tenant_id, employee_id, date) DO UPDATE SET
           status    = EXCLUDED.status,
           clock_in  = EXCLUDED.clock_in,
           clock_out = EXCLUDED.clock_out,
           notes     = EXCLUDED.notes
         RETURNING *`,
        [tenantId, body.employeeId, body.date, body.status,
         body.clockIn ?? null, body.clockOut ?? null, body.notes ?? null],
      );

      res.status(201).json(result.rows[0]);
    } catch (err) {
      if (err instanceof z.ZodError) { res.status(400).json({ error: err.errors }); return; }
      next(err);
    }
  },
);

const patchAttendanceSchema = z.object({
  status: z.enum(['present', 'absent', 'late', 'half_day', 'remote']).optional(),
  clockIn: z.string().optional().nullable(),
  clockOut: z.string().optional().nullable(),
  notes: z.string().optional().nullable(),
}).refine((d) => Object.keys(d).length > 0, { message: 'At least one field required' });

// PATCH /:id — employer updates an existing attendance record
router.patch(
  '/:id',
  requireEmployer,
  async (req: Request, res: Response, next: NextFunction) => {
    try {
      const body = patchAttendanceSchema.parse(req.body);
      const { tenantId } = req.user!;

      const fields: string[] = [];
      const values: unknown[] = [req.params.id, tenantId];

      if (body.status    !== undefined) { values.push(body.status);    fields.push(`status = $${values.length}`); }
      if (body.clockIn   !== undefined) { values.push(body.clockIn);   fields.push(`clock_in = $${values.length}::timestamptz`); }
      if (body.clockOut  !== undefined) { values.push(body.clockOut);  fields.push(`clock_out = $${values.length}::timestamptz`); }
      if (body.notes     !== undefined) { values.push(body.notes);     fields.push(`notes = $${values.length}`); }

      const result = await pool.query(
        `UPDATE attendance_records SET ${fields.join(', ')}
         WHERE id = $1 AND tenant_id = $2
         RETURNING *`,
        values,
      );

      if (!result.rows[0]) { res.status(404).json({ error: 'Attendance record not found' }); return; }
      res.json(result.rows[0]);
    } catch (err) {
      if (err instanceof z.ZodError) { res.status(400).json({ error: err.errors }); return; }
      next(err);
    }
  },
);

export default router;
