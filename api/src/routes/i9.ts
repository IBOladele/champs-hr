import { Router, Request, Response, NextFunction } from 'express';
import { z } from 'zod';
import pool from '../db';
import { requireAuth, requireEmployer } from '../middleware/auth';

const router = Router();

async function resolveEmployee(id: string, tenantId: string) {
  const r = await pool.query<{ id: string; user_id: string }>(
    `SELECT id, user_id FROM employees WHERE id = $1 AND tenant_id = $2`,
    [id, tenantId],
  );
  return r.rows[0] ?? null;
}

// GET /employees/:id/i9  — employer only (contains sensitive doc info)
router.get(
  '/employees/:id/i9',
  requireEmployer,
  async (req: Request, res: Response, next: NextFunction) => {
    try {
      const { tenantId } = req.user!;
      const emp = await resolveEmployee(req.params.id, tenantId);
      if (!emp) { res.status(404).json({ error: 'Employee not found' }); return; }

      const result = await pool.query(
        `SELECT * FROM employee_i9 WHERE employee_id = $1`,
        [emp.id],
      );
      if (!result.rows[0]) { res.status(404).json({ error: 'No I-9 on file' }); return; }
      res.json(result.rows[0]);
    } catch (err) { next(err); }
  },
);

// PUT /employees/:id/i9/section1 — employee completes their own Section 1
const section1Schema = z.object({
  citizenshipStatus: z.enum([
    'us_citizen', 'noncitizen_national', 'lawful_permanent_resident', 'alien_authorized',
  ]),
  alienRegNumber:         z.string().optional().nullable(),
  i94Number:              z.string().optional().nullable(),
  foreignPassportCountry: z.string().optional().nullable(),
  authorizedThrough:      z.string().regex(/^\d{4}-\d{2}-\d{2}$/).optional().nullable(),
});

router.put(
  '/employees/:id/i9/section1',
  requireAuth,
  async (req: Request, res: Response, next: NextFunction) => {
    try {
      const { tenantId, role, userId } = req.user!;
      const body = section1Schema.parse(req.body);

      const emp = await resolveEmployee(req.params.id, tenantId);
      if (!emp) { res.status(404).json({ error: 'Employee not found' }); return; }

      // Only the employee themselves (or employer) can submit Section 1
      if (role === 'employee' && emp.user_id !== userId) {
        res.status(403).json({ error: 'Access denied' }); return;
      }

      const result = await pool.query(
        `INSERT INTO employee_i9
           (tenant_id, employee_id, citizenship_status, alien_reg_number,
            i94_number, foreign_passport_country, authorized_through,
            section1_completed_at, updated_at)
         VALUES ($1,$2,$3,$4,$5,$6,$7,NOW(),NOW())
         ON CONFLICT (employee_id) DO UPDATE SET
           citizenship_status       = EXCLUDED.citizenship_status,
           alien_reg_number         = EXCLUDED.alien_reg_number,
           i94_number               = EXCLUDED.i94_number,
           foreign_passport_country = EXCLUDED.foreign_passport_country,
           authorized_through       = EXCLUDED.authorized_through,
           section1_completed_at    = NOW(),
           updated_at               = NOW()
         RETURNING *`,
        [
          tenantId, emp.id,
          body.citizenshipStatus, body.alienRegNumber ?? null,
          body.i94Number ?? null, body.foreignPassportCountry ?? null,
          body.authorizedThrough ?? null,
        ],
      );
      res.json(result.rows[0]);
    } catch (err) {
      if (err instanceof z.ZodError) { res.status(400).json({ error: err.errors }); return; }
      next(err);
    }
  },
);

// PUT /employees/:id/i9/section2 — employer verifies documents (Section 2)
const section2Schema = z.object({
  docListUsed:        z.enum(['list_a', 'list_b_c']),
  docTitle:           z.string().min(1),
  docIssuingAuthority: z.string().min(1),
  docNumber:          z.string().min(1),
  docExpiry:          z.string().regex(/^\d{4}-\d{2}-\d{2}$/).optional().nullable(),
});

router.put(
  '/employees/:id/i9/section2',
  requireEmployer,
  async (req: Request, res: Response, next: NextFunction) => {
    try {
      const { tenantId, userId } = req.user!;
      const body = section2Schema.parse(req.body);

      const emp = await resolveEmployee(req.params.id, tenantId);
      if (!emp) { res.status(404).json({ error: 'Employee not found' }); return; }

      const result = await pool.query(
        `UPDATE employee_i9 SET
           doc_list_used          = $1,
           doc_title              = $2,
           doc_issuing_authority  = $3,
           doc_number             = $4,
           doc_expiry             = $5,
           section2_completed_at  = NOW(),
           section2_completed_by  = $6,
           status                 = 'completed',
           updated_at             = NOW()
         WHERE employee_id = $7
         RETURNING *`,
        [
          body.docListUsed, body.docTitle, body.docIssuingAuthority,
          body.docNumber, body.docExpiry ?? null, userId, emp.id,
        ],
      );
      if (!result.rows[0]) { res.status(404).json({ error: 'No I-9 found — employee must complete Section 1 first' }); return; }
      res.json(result.rows[0]);
    } catch (err) {
      if (err instanceof z.ZodError) { res.status(400).json({ error: err.errors }); return; }
      next(err);
    }
  },
);

export default router;
