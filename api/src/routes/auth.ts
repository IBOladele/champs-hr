import { Router, Request, Response, NextFunction } from 'express';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import { z } from 'zod';
import pool from '../db';
import { requireAuth } from '../middleware/auth';

const router = Router();
const JWT_SECRET = process.env.JWT_SECRET as string;

function makeSlug(name: string): string {
  return name
    .toLowerCase()
    .replace(/\s+/g, '-')
    .replace(/[^a-z0-9-]/g, '');
}

function signToken(payload: {
  userId: string;
  tenantId: string;
  role: 'employer' | 'employee';
}): string {
  return jwt.sign(payload, JWT_SECRET, { expiresIn: '7d' });
}

// POST /auth/signup
const signupSchema = z.object({
  email: z.string().email(),
  password: z.string().min(8),
  fullName: z.string().min(1),
  companyName: z.string().min(1),
});

router.post(
  '/signup',
  async (req: Request, res: Response, next: NextFunction) => {
    try {
      const body = signupSchema.parse(req.body);
      const passwordHash = await bcrypt.hash(body.password, 10);

      const client = await pool.connect();
      try {
        await client.query('BEGIN');

        // Create tenant
        const slug = makeSlug(body.companyName);
        const tenantResult = await client.query<{ id: string }>(
          `INSERT INTO tenants (name, slug) VALUES ($1, $2) RETURNING id`,
          [body.companyName, slug]
        );
        const tenantId = tenantResult.rows[0].id;

        // Create employer user
        const userResult = await client.query<{
          id: string;
          email: string;
          role: string;
          tenant_id: string;
          full_name: string;
        }>(
          `INSERT INTO users (tenant_id, email, password_hash, role, full_name)
           VALUES ($1, $2, $3, 'employer', $4)
           RETURNING id, email, role, tenant_id, full_name`,
          [tenantId, body.email, passwordHash, body.fullName]
        );
        const user = userResult.rows[0];

        await client.query('COMMIT');

        const accessToken = signToken({
          userId: user.id,
          tenantId: user.tenant_id,
          role: 'employer',
        });

        res.status(201).json({
          accessToken,
          user: {
            id: user.id,
            email: user.email,
            role: user.role,
            tenantId: user.tenant_id,
            fullName: user.full_name,
          },
        });
      } catch (err) {
        await client.query('ROLLBACK');
        throw err;
      } finally {
        client.release();
      }
    } catch (err) {
      if (err instanceof z.ZodError) {
        res.status(400).json({ error: err.errors });
        return;
      }
      // Duplicate email — unique constraint violation
      if ((err as { code?: string }).code === '23505') {
        res.status(409).json({ error: 'An account with this email already exists' });
        return;
      }
      next(err);
    }
  }
);

// POST /auth/login
const loginSchema = z.object({
  email: z.string().email(),
  password: z.string().min(1),
});

router.post(
  '/login',
  async (req: Request, res: Response, next: NextFunction) => {
    try {
      const body = loginSchema.parse(req.body);

      const result = await pool.query<{
        id: string;
        email: string;
        role: 'employer' | 'employee';
        tenant_id: string;
        full_name: string;
        password_hash: string;
      }>(
        `SELECT id, email, role, tenant_id, full_name, password_hash
         FROM users WHERE email = $1`,
        [body.email]
      );

      const user = result.rows[0];
      if (!user) {
        res.status(401).json({ error: 'Invalid credentials' });
        return;
      }

      const valid = await bcrypt.compare(body.password, user.password_hash);
      if (!valid) {
        res.status(401).json({ error: 'Invalid credentials' });
        return;
      }

      const accessToken = signToken({
        userId: user.id,
        tenantId: user.tenant_id,
        role: user.role,
      });

      res.json({
        accessToken,
        user: {
          id: user.id,
          email: user.email,
          role: user.role,
          tenantId: user.tenant_id,
          fullName: user.full_name,
        },
      });
    } catch (err) {
      if (err instanceof z.ZodError) {
        res.status(400).json({ error: err.errors });
        return;
      }
      next(err);
    }
  }
);

// GET /auth/me
router.get(
  '/me',
  requireAuth,
  async (req: Request, res: Response, next: NextFunction) => {
    try {
      const result = await pool.query<{
        id: string;
        email: string;
        role: string;
        tenant_id: string;
        full_name: string;
        phone: string | null;
        avatar_url: string | null;
        created_at: string;
      }>(
        `SELECT id, email, role, tenant_id, full_name, phone, avatar_url, created_at
         FROM users WHERE id = $1 AND tenant_id = $2`,
        [req.user!.userId, req.user!.tenantId]
      );

      const user = result.rows[0];
      if (!user) {
        res.status(404).json({ error: 'User not found' });
        return;
      }

      res.json({
        id: user.id,
        email: user.email,
        role: user.role,
        tenantId: user.tenant_id,
        fullName: user.full_name,
        phone: user.phone,
        avatarUrl: user.avatar_url,
        createdAt: user.created_at,
      });
    } catch (err) {
      next(err);
    }
  }
);

export default router;
