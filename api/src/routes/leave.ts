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
            lr.id, lr.leave_type, lr.start_date, lr.end_date,
            lr.days_requested, lr.reason, lr.status,
            lr.reviewed_at, lr.created_at,
            e.id AS employee_id, e.employee_number,
            u.full_name AS employee_name, u.email AS employee_email,
            ru.full_name AS reviewed_by_name
          FROM leave_requests lr
          JOIN employees e ON e.id = lr.employee_id
          JOIN users u ON u.id = e.user_id
          LEFT JOIN users ru ON ru.id = lr.reviewed_by
          WHERE lr.tenant_id = $1
          ORDER BY lr.created_at DESC`;
        values = [tenantId];
      } else {
        query = `
          SELECT
            lr.id, lr.leave_type, lr.start_date, lr.end_date,
            lr.days_requested, lr.reason, lr.status,
            lr.reviewed_at, lr.created_at,
            e.id AS employee_id, e.employee_number,
            u.full_name AS employee_name, u.email AS employee_email,
            ru.full_name AS reviewed_by_name
          FROM leave_requests lr
          JOIN employees e ON e.id = lr.employee_id
          JOIN users u ON u.id = e.user_id
          LEFT JOIN users ru ON ru.id = lr.reviewed_by
          WHERE lr.tenant_id = $1 AND u.id = $2
          ORDER BY lr.created_at DESC`;
        values = [tenantId, userId];
      }

      const result = await pool.query(query, values);
      res.json(result.rows);
    } catch (err) {
      next(err);
    }
  }
);

// POST / — create leave request (any authenticated user)
const createLeaveSchema = z.object({
  leaveType: z.string().min(1),
  startDate: z.string().regex(/^\d{4}-\d{2}-\d{2}$/),
  endDate: z.string().regex(/^\d{4}-\d{2}-\d{2}$/),
  daysRequested: z.number().positive(),
  reason: z.string().optional(),
});

router.post(
  '/',
  requireAuth,
  async (req: Request, res: Response, next: NextFunction) => {
    try {
      const body = createLeaveSchema.parse(req.body);
      const { tenantId, userId } = req.user!;

      // Find the employee record for this user
      const empResult = await pool.query<{ id: string }>(
        `SELECT id FROM employees WHERE user_id = $1 AND tenant_id = $2`,
        [userId, tenantId]
      );
      if (!empResult.rows[0]) {
        res.status(404).json({ error: 'Employee profile not found for this user' });
        return;
      }
      const employeeId = empResult.rows[0].id;

      const result = await pool.query(
        `INSERT INTO leave_requests
           (tenant_id, employee_id, leave_type, start_date, end_date, days_requested, reason)
         VALUES ($1, $2, $3, $4, $5, $6, $7)
         RETURNING *`,
        [
          tenantId,
          employeeId,
          body.leaveType,
          body.startDate,
          body.endDate,
          body.daysRequested,
          body.reason ?? null,
        ]
      );

      res.status(201).json(result.rows[0]);
    } catch (err) {
      if (err instanceof z.ZodError) {
        res.status(400).json({ error: err.errors });
        return;
      }
      next(err);
    }
  }
);

// PATCH /:id/approve — approve leave (employer only)
router.patch(
  '/:id/approve',
  requireEmployer,
  async (req: Request, res: Response, next: NextFunction) => {
    try {
      const { tenantId, userId } = req.user!;
      const { id } = req.params;

      const result = await pool.query(
        `UPDATE leave_requests
         SET status = 'approved', reviewed_by = $1, reviewed_at = NOW()
         WHERE id = $2 AND tenant_id = $3
         RETURNING *`,
        [userId, id, tenantId]
      );

      if (!result.rows[0]) {
        res.status(404).json({ error: 'Leave request not found' });
        return;
      }

      res.json(result.rows[0]);
    } catch (err) {
      next(err);
    }
  }
);

// PATCH /:id/reject — reject leave (employer only)
router.patch(
  '/:id/reject',
  requireEmployer,
  async (req: Request, res: Response, next: NextFunction) => {
    try {
      const { tenantId, userId } = req.user!;
      const { id } = req.params;

      const result = await pool.query(
        `UPDATE leave_requests
         SET status = 'rejected', reviewed_by = $1, reviewed_at = NOW()
         WHERE id = $2 AND tenant_id = $3
         RETURNING *`,
        [userId, id, tenantId]
      );

      if (!result.rows[0]) {
        res.status(404).json({ error: 'Leave request not found' });
        return;
      }

      res.json(result.rows[0]);
    } catch (err) {
      next(err);
    }
  }
);

export default router;
