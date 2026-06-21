import { Router, Request, Response, NextFunction } from 'express';
import { z } from 'zod';
import pool from '../db';
import { requireAuth, requireEmployer } from '../middleware/auth';

const router = Router();

// GET / — all benefits in tenant (all authenticated users)
router.get(
  '/',
  requireAuth,
  async (req: Request, res: Response, next: NextFunction) => {
    try {
      const { tenantId } = req.user!;
      const result = await pool.query(
        `SELECT id, name, description, benefit_type, value, currency, is_active, created_at
         FROM benefits
         WHERE tenant_id = $1
         ORDER BY name ASC`,
        [tenantId]
      );
      res.json(result.rows);
    } catch (err) {
      next(err);
    }
  }
);

// POST / — create benefit (employer only)
const createBenefitSchema = z.object({
  name: z.string().min(1),
  description: z.string().optional(),
  benefitType: z.string().min(1),
  value: z.number().nonnegative(),
  currency: z.string().length(3).default('GBP'),
});

router.post(
  '/',
  requireEmployer,
  async (req: Request, res: Response, next: NextFunction) => {
    try {
      const body = createBenefitSchema.parse(req.body);
      const { tenantId } = req.user!;

      const result = await pool.query(
        `INSERT INTO benefits (tenant_id, name, description, benefit_type, value, currency)
         VALUES ($1, $2, $3, $4, $5, $6)
         RETURNING *`,
        [
          tenantId,
          body.name,
          body.description ?? null,
          body.benefitType,
          body.value,
          body.currency,
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

// POST /:id/enrol — enrol an employee in a benefit (employer only)
const enrolSchema = z.object({
  employeeId: z.string().uuid(),
});

router.post(
  '/:id/enrol',
  requireEmployer,
  async (req: Request, res: Response, next: NextFunction) => {
    try {
      const body = enrolSchema.parse(req.body);
      const { tenantId } = req.user!;
      const { id: benefitId } = req.params;

      // Verify benefit belongs to this tenant
      const benefitCheck = await pool.query(
        `SELECT id FROM benefits WHERE id = $1 AND tenant_id = $2`,
        [benefitId, tenantId]
      );
      if (!benefitCheck.rows[0]) {
        res.status(404).json({ error: 'Benefit not found' });
        return;
      }

      // Verify employee belongs to this tenant
      const empCheck = await pool.query(
        `SELECT id FROM employees WHERE id = $1 AND tenant_id = $2`,
        [body.employeeId, tenantId]
      );
      if (!empCheck.rows[0]) {
        res.status(404).json({ error: 'Employee not found' });
        return;
      }

      const today = new Date().toISOString().slice(0, 10);

      const result = await pool.query(
        `INSERT INTO employee_benefits (tenant_id, employee_id, benefit_id, enrolled_at)
         VALUES ($1, $2, $3, $4)
         ON CONFLICT (employee_id, benefit_id)
         DO UPDATE SET status = 'active', enrolled_at = EXCLUDED.enrolled_at
         RETURNING *`,
        [tenantId, body.employeeId, benefitId, today]
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

export default router;
