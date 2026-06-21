import { Router, Request, Response, NextFunction } from 'express';
import { z } from 'zod';
import pool from '../db';
import { requireAuth, requireEmployer } from '../middleware/auth';

const router = Router();

// GET / — all departments in tenant
router.get(
  '/',
  requireAuth,
  async (req: Request, res: Response, next: NextFunction) => {
    try {
      const { tenantId } = req.user!;
      const result = await pool.query(
        `SELECT id, name, created_at FROM departments
         WHERE tenant_id = $1 ORDER BY name ASC`,
        [tenantId]
      );
      res.json(result.rows);
    } catch (err) {
      next(err);
    }
  }
);

// POST / — create department (employer only)
const createDeptSchema = z.object({
  name: z.string().min(1),
});

router.post(
  '/',
  requireEmployer,
  async (req: Request, res: Response, next: NextFunction) => {
    try {
      const body = createDeptSchema.parse(req.body);
      const { tenantId } = req.user!;

      const result = await pool.query(
        `INSERT INTO departments (tenant_id, name) VALUES ($1, $2)
         RETURNING id, name, created_at`,
        [tenantId, body.name]
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

// PATCH /:id — update department name (employer only)
const updateDeptSchema = z.object({
  name: z.string().min(1),
});

router.patch(
  '/:id',
  requireEmployer,
  async (req: Request, res: Response, next: NextFunction) => {
    try {
      const body = updateDeptSchema.parse(req.body);
      const { tenantId } = req.user!;
      const { id } = req.params;

      const result = await pool.query(
        `UPDATE departments SET name = $1
         WHERE id = $2 AND tenant_id = $3
         RETURNING id, name, created_at`,
        [body.name, id, tenantId]
      );

      if (!result.rows[0]) {
        res.status(404).json({ error: 'Department not found' });
        return;
      }

      res.json(result.rows[0]);
    } catch (err) {
      if (err instanceof z.ZodError) {
        res.status(400).json({ error: err.errors });
        return;
      }
      next(err);
    }
  }
);

// DELETE /:id — delete department (employer only)
router.delete(
  '/:id',
  requireEmployer,
  async (req: Request, res: Response, next: NextFunction) => {
    try {
      const { tenantId } = req.user!;
      const { id } = req.params;

      const result = await pool.query(
        `DELETE FROM departments WHERE id = $1 AND tenant_id = $2`,
        [id, tenantId]
      );

      if (result.rowCount === 0) {
        res.status(404).json({ error: 'Department not found' });
        return;
      }

      res.status(204).send();
    } catch (err) {
      next(err);
    }
  }
);

export default router;
