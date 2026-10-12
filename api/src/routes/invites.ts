import { Router, Request, Response, NextFunction } from 'express';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import { z } from 'zod';
import pool from '../db';
import { cookieOptions, SESSION_COOKIE } from '../middleware/auth';

const router = Router();

const JWT_SECRET = process.env.JWT_SECRET ?? 'dev-secret';

// GET /:token — look up an invite (public — used to prefill the accept form)
router.get(
  '/:token',
  async (req: Request, res: Response, next: NextFunction) => {
    try {
      const { token } = req.params;
      const result = await pool.query(
        `SELECT ei.expires_at, u.email, u.full_name, t.name AS company_name
         FROM employee_invites ei
         JOIN users u ON u.id = ei.user_id
         JOIN tenants t ON t.id = ei.tenant_id
         WHERE ei.token = $1
           AND ei.accepted_at IS NULL
           AND ei.expires_at > NOW()`,
        [token]
      );
      if (!result.rows[0]) {
        res.status(404).json({ error: 'Invite not found, expired, or already accepted' });
        return;
      }
      const row = result.rows[0];
      res.json({
        email: row.email,
        fullName: row.full_name,
        companyName: row.company_name,
        expiresAt: row.expires_at,
      });
    } catch (err) {
      next(err);
    }
  }
);

const acceptSchema = z.object({
  password: z
    .string()
    .min(8, 'Password must be at least 8 characters')
    .regex(/[A-Z]/, 'Password must contain an uppercase letter')
    .regex(/[a-z]/, 'Password must contain a lowercase letter')
    .regex(/[0-9]/, 'Password must contain a number')
    .regex(/[^A-Za-z0-9]/, 'Password must contain a special character'),
  fullName: z.string().min(1).optional(),
});

// POST /:token/accept — employee sets their password and activates their account
router.post(
  '/:token/accept',
  async (req: Request, res: Response, next: NextFunction) => {
    try {
      const { token } = req.params;
      const body = acceptSchema.parse(req.body);

      // Fetch the invite
      const inviteResult = await pool.query<{
        id: string;
        user_id: string;
        tenant_id: string;
      }>(
        `SELECT id, user_id, tenant_id
         FROM employee_invites
         WHERE token = $1
           AND accepted_at IS NULL
           AND expires_at > NOW()`,
        [token]
      );
      if (!inviteResult.rows[0]) {
        res.status(400).json({ error: 'Invite not found, expired, or already accepted' });
        return;
      }
      const { id: inviteId, user_id: userId, tenant_id: tenantId } = inviteResult.rows[0];

      const passwordHash = await bcrypt.hash(body.password, 10);

      const client = await pool.connect();
      try {
        await client.query('BEGIN');

        // Build SET clause dynamically
        const userValues: unknown[] = [passwordHash]; // $1
        let setSql = 'password_hash = $1, email_verified = TRUE';
        if (body.fullName) {
          userValues.push(body.fullName);
          setSql += `, full_name = $${userValues.length}`;
        }
        userValues.push(userId);   // $N-1
        userValues.push(tenantId); // $N
        const idIdx = userValues.length - 1;
        const tidIdx = userValues.length;

        const userResult = await client.query(
          `UPDATE users SET ${setSql}
           WHERE id = $${idIdx} AND tenant_id = $${tidIdx}
           RETURNING id, email, full_name, role`,
          userValues
        );

        await client.query(
          `UPDATE employee_invites SET accepted_at = NOW() WHERE id = $1`,
          [inviteId]
        );

        await client.query('COMMIT');

        const user = userResult.rows[0];
        const jwtPayload = { userId: user.id, tenantId, role: user.role };
        const jwtToken = jwt.sign(jwtPayload, JWT_SECRET, { expiresIn: '7d' });
        res.cookie(SESSION_COOKIE, jwtToken, cookieOptions);
        res.json({
          id: user.id,
          email: user.email,
          fullName: user.full_name,
          role: user.role,
        });
      } catch (err) {
        await client.query('ROLLBACK');
        throw err;
      } finally {
        client.release();
      }
    } catch (err) {
      if (err instanceof z.ZodError) {
        res.status(400).json({ message: err.errors });
        return;
      }
      next(err);
    }
  }
);

export default router;
