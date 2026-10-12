import { Router, Request, Response, NextFunction } from 'express';
import { z } from 'zod';
import pool from '../db';
import { requireEmployer } from '../middleware/auth';

const router = Router();

const configSchema = z.object({
  companyName:       z.string().optional(),
  country:           z.string().optional(),
  businessSize:      z.string().optional(),
  industry:          z.string().optional(),
  companySize:       z.string().optional(),
  county:            z.string().optional(),
  timezone:          z.string().optional(),
  currency:          z.string().optional(),
  registeredAddress: z.string().optional(),
  website:           z.string().optional(),
}).passthrough();

// GET /config — returns current settings
router.get(
  '/',
  requireEmployer,
  async (req: Request, res: Response, next: NextFunction) => {
    try {
      const { tenantId } = req.user!;
      const result = await pool.query(
        `SELECT settings, name AS company_name FROM tenants WHERE id = $1`,
        [tenantId]
      );
      if (!result.rows.length) { res.status(404).json({ error: 'not found' }); return; }
      const { settings, company_name } = result.rows[0];
      res.json({ companyName: company_name, ...settings });
    } catch (err) {
      next(err);
    }
  }
);

// PATCH /config — merge-update settings
router.patch(
  '/',
  requireEmployer,
  async (req: Request, res: Response, next: NextFunction) => {
    try {
      const { tenantId } = req.user!;
      const patch = configSchema.parse(req.body);

      // Extract companyName separately — it lives on the tenants row
      const { companyName, ...rest } = patch;

      const updateClauses: string[] = [];
      const values: unknown[] = [tenantId];

      if (companyName !== undefined) {
        values.push(companyName);
        updateClauses.push(`name = $${values.length}`);
      }

      // Merge JSONB settings
      values.push(JSON.stringify(rest));
      updateClauses.push(`settings = settings || $${values.length}::jsonb`);

      const result = await pool.query(
        `UPDATE tenants SET ${updateClauses.join(', ')} WHERE id = $1
         RETURNING settings, name AS company_name`,
        values
      );

      const { settings, company_name } = result.rows[0];
      res.json({ companyName: company_name, ...settings });
    } catch (err) {
      next(err);
    }
  }
);

export default router;
