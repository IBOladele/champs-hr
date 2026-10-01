import { Router, Request, Response, NextFunction } from 'express';
import { z } from 'zod';
import pool from '../db';
import { requireAuth } from '../middleware/auth';

const router = Router();

/** Resolve an employee record — ensures it belongs to the caller's tenant */
async function resolveEmployee(
  employeeId: string,
  tenantId: string,
): Promise<{ id: string; user_id: string } | null> {
  const result = await pool.query<{ id: string; user_id: string }>(
    `SELECT id, user_id FROM employees WHERE id = $1 AND tenant_id = $2`,
    [employeeId, tenantId],
  );
  return result.rows[0] ?? null;
}

// GET /employees/:id/w4
router.get(
  '/employees/:id/w4',
  requireAuth,
  async (req: Request, res: Response, next: NextFunction) => {
    try {
      const { tenantId, role, userId } = req.user!;
      const emp = await resolveEmployee(req.params.id, tenantId);
      if (!emp) { res.status(404).json({ error: 'Employee not found' }); return; }

      // Employee can only see their own W-4
      if (role === 'employee' && emp.user_id !== userId) {
        res.status(403).json({ error: 'Access denied' }); return;
      }

      const result = await pool.query(
        `SELECT * FROM employee_w4 WHERE employee_id = $1`,
        [emp.id],
      );
      if (!result.rows[0]) { res.status(404).json({ error: 'No W-4 on file' }); return; }
      res.json(result.rows[0]);
    } catch (err) { next(err); }
  },
);

const w4Schema = z.object({
  filingStatus:     z.enum(['single', 'married_jointly', 'head_of_household']),
  multipleJobs:     z.boolean().default(false),
  dependentsAmount: z.number().min(0).default(0),
  otherIncome:      z.number().min(0).default(0),
  extraDeductions:  z.number().min(0).default(0),
  extraWithholding: z.number().min(0).default(0),
  exempt:           z.boolean().default(false),
  signedAt:         z.string().datetime().optional(),
});

// PUT /employees/:id/w4
router.put(
  '/employees/:id/w4',
  requireAuth,
  async (req: Request, res: Response, next: NextFunction) => {
    try {
      const { tenantId, role, userId } = req.user!;
      const body = w4Schema.parse(req.body);

      const emp = await resolveEmployee(req.params.id, tenantId);
      if (!emp) { res.status(404).json({ error: 'Employee not found' }); return; }

      // Employee can only update their own W-4; employer can update any
      if (role === 'employee' && emp.user_id !== userId) {
        res.status(403).json({ error: 'Access denied' }); return;
      }

      const result = await pool.query(
        `INSERT INTO employee_w4
           (tenant_id, employee_id, filing_status, multiple_jobs, dependents_amount,
            other_income, extra_deductions, extra_withholding, exempt, signed_at, updated_at)
         VALUES ($1,$2,$3,$4,$5,$6,$7,$8,$9,$10,NOW())
         ON CONFLICT (employee_id) DO UPDATE SET
           filing_status     = EXCLUDED.filing_status,
           multiple_jobs     = EXCLUDED.multiple_jobs,
           dependents_amount = EXCLUDED.dependents_amount,
           other_income      = EXCLUDED.other_income,
           extra_deductions  = EXCLUDED.extra_deductions,
           extra_withholding = EXCLUDED.extra_withholding,
           exempt            = EXCLUDED.exempt,
           signed_at         = EXCLUDED.signed_at,
           updated_at        = NOW()
         RETURNING *`,
        [
          tenantId, emp.id,
          body.filingStatus, body.multipleJobs, body.dependentsAmount,
          body.otherIncome, body.extraDeductions, body.extraWithholding,
          body.exempt, body.signedAt ?? null,
        ],
      );
      res.json(result.rows[0]);
    } catch (err) {
      if (err instanceof z.ZodError) { res.status(400).json({ error: err.errors }); return; }
      next(err);
    }
  },
);

export default router;
