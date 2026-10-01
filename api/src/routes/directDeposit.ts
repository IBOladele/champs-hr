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

/** Mask all but last 4 digits of account number */
function maskAccount(raw: string): string {
  if (raw.length <= 4) return raw;
  return '•'.repeat(raw.length - 4) + raw.slice(-4);
}

// GET /employees/:id/direct-deposit
router.get(
  '/employees/:id/direct-deposit',
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
        `SELECT id, bank_name, routing_number, account_number, account_type,
                is_primary, is_active, created_at, updated_at
         FROM employee_direct_deposit
         WHERE employee_id = $1 AND is_active = TRUE
         ORDER BY is_primary DESC`,
        [emp.id],
      );

      // Always return masked values
      const rows = result.rows.map((r) => ({
        ...r,
        routing_number: '•'.repeat(5) + String(r.routing_number).slice(-4),
        account_number: maskAccount(String(r.account_number)),
      }));

      res.json(rows);
    } catch (err) { next(err); }
  },
);

const directDepositSchema = z.object({
  bankName:      z.string().min(1),
  routingNumber: z.string().regex(/^\d{9}$/, 'Routing number must be exactly 9 digits'),
  accountNumber: z.string().min(4).max(17),
  accountType:   z.enum(['checking', 'savings']).default('checking'),
  isPrimary:     z.boolean().default(true),
});

// PUT /employees/:id/direct-deposit — upsert (deactivate old primary, insert new)
router.put(
  '/employees/:id/direct-deposit',
  requireAuth,
  async (req: Request, res: Response, next: NextFunction) => {
    try {
      const { tenantId, role, userId } = req.user!;
      const body = directDepositSchema.parse(req.body);

      const emp = await resolveEmployee(req.params.id, tenantId);
      if (!emp) { res.status(404).json({ error: 'Employee not found' }); return; }

      if (role === 'employee' && emp.user_id !== userId) {
        res.status(403).json({ error: 'Access denied' }); return;
      }

      // Mask the account number before storing — never persist raw account numbers
      const maskedAccount = maskAccount(body.accountNumber);
      // Store only last 4 of routing as well (full routing used for validation only)
      const maskedRouting = '•'.repeat(5) + body.routingNumber.slice(-4);

      const client = await pool.connect();
      try {
        await client.query('BEGIN');

        // Deactivate existing primary if this will be primary
        if (body.isPrimary) {
          await client.query(
            `UPDATE employee_direct_deposit SET is_primary = FALSE
             WHERE employee_id = $1`,
            [emp.id],
          );
        }

        const result = await client.query(
          `INSERT INTO employee_direct_deposit
             (tenant_id, employee_id, bank_name, routing_number, account_number,
              account_type, is_primary, updated_at)
           VALUES ($1,$2,$3,$4,$5,$6,$7,NOW())
           RETURNING id, bank_name, routing_number, account_number, account_type,
                     is_primary, is_active, created_at, updated_at`,
          [tenantId, emp.id, body.bankName, maskedRouting, maskedAccount,
           body.accountType, body.isPrimary],
        );

        await client.query('COMMIT');
        res.json(result.rows[0]);
      } catch (err) {
        await client.query('ROLLBACK');
        throw err;
      } finally {
        client.release();
      }
    } catch (err) {
      if (err instanceof z.ZodError) { res.status(400).json({ error: err.errors }); return; }
      next(err);
    }
  },
);

export default router;
