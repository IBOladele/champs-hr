import { Router, Request, Response, NextFunction } from 'express';
import bcrypt from 'bcryptjs';
import crypto from 'crypto';
import jwt from 'jsonwebtoken';
import { z } from 'zod';
import pool from '../db';
import { requireAuth, SESSION_COOKIE, cookieOptions } from '../middleware/auth';
import { sendVerificationEmail } from '../lib/email';

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
  email:       z.string().email().max(254).transform((e) => e.toLowerCase().trim()),
  password:    z.string()
    .min(8,  'Password must be at least 8 characters')
    .max(128, 'Password too long')
    .regex(/[A-Z]/,         'Password must contain at least one uppercase letter')
    .regex(/[a-z]/,         'Password must contain at least one lowercase letter')
    .regex(/[0-9]/,         'Password must contain at least one number')
    .regex(/[^A-Za-z0-9]/, 'Password must contain at least one special character'),
  fullName:    z.string().min(1).max(120).trim(),
  companyName: z.string().min(1).max(200).trim(),
});

router.post('/signup', async (req: Request, res: Response, next: NextFunction) => {
  try {
    const body = signupSchema.parse(req.body);
    const passwordHash = await bcrypt.hash(body.password, 10);

    const client = await pool.connect();
    try {
      await client.query('BEGIN');

      const slug = makeSlug(body.companyName);
      const tenantResult = await client.query<{ id: string }>(
        `INSERT INTO tenants (name, slug) VALUES ($1, $2) RETURNING id`,
        [body.companyName, slug],
      );
      const tenantId = tenantResult.rows[0].id;

      const verificationToken = crypto.randomBytes(32).toString('hex');

      const userResult = await client.query<{
        id: string; email: string; role: string; tenant_id: string; full_name: string;
      }>(
        `INSERT INTO users (tenant_id, email, password_hash, role, full_name,
                            email_verification_token, email_verification_sent_at)
         VALUES ($1, $2, $3, 'employer', $4, $5, NOW())
         RETURNING id, email, role, tenant_id, full_name`,
        [tenantId, body.email, passwordHash, body.fullName, verificationToken],
      );
      const user = userResult.rows[0];

      await client.query('COMMIT');

      // Fire-and-forget — don't block signup if email fails
      sendVerificationEmail(body.email, verificationToken).catch((err) =>
        console.error('[email] Failed to send verification email:', err),
      );

      const token = signToken({ userId: user.id, tenantId: user.tenant_id, role: 'employer' });
      res.cookie(SESSION_COOKIE, token, cookieOptions);

      res.status(201).json({
        user: {
          id:            user.id,
          email:         user.email,
          role:          user.role,
          tenantId:      user.tenant_id,
          fullName:      user.full_name,
          emailVerified: false,
        },
      });
    } catch (err) {
      await client.query('ROLLBACK');
      throw err;
    } finally {
      client.release();
    }
  } catch (err) {
    if (err instanceof z.ZodError) { res.status(400).json({ error: err.errors }); return; }
    if ((err as { code?: string }).code === '23505') {
      res.status(409).json({ error: 'An account with this email already exists' });
      return;
    }
    next(err);
  }
});

// POST /auth/login
const loginSchema = z.object({
  email:    z.string().email().max(254).transform((e) => e.toLowerCase().trim()),
  password: z.string().min(1).max(128),
});

router.post('/login', async (req: Request, res: Response, next: NextFunction) => {
  try {
    const body = loginSchema.parse(req.body);

    const result = await pool.query<{
      id: string; email: string; role: 'employer' | 'employee';
      tenant_id: string; full_name: string; password_hash: string;
      email_verified: boolean;
    }>(
      `SELECT id, email, role, tenant_id, full_name, password_hash, email_verified
       FROM users WHERE email = $1`,
      [body.email],
    );

    const user = result.rows[0];
    // Constant-time compare even on missing user to prevent timing attacks
    const hash = user?.password_hash ?? '$2b$10$invalidhashpaddingtomakeconstanttime';
    const valid = await bcrypt.compare(body.password, hash);

    if (!user || !valid) {
      res.status(401).json({ error: 'Invalid credentials' });
      return;
    }

    const token = signToken({ userId: user.id, tenantId: user.tenant_id, role: user.role });
    res.cookie(SESSION_COOKIE, token, cookieOptions);

    res.json({
      user: {
        id:            user.id,
        email:         user.email,
        role:          user.role,
        tenantId:      user.tenant_id,
        fullName:      user.full_name,
        emailVerified: user.email_verified,
      },
    });
  } catch (err) {
    if (err instanceof z.ZodError) { res.status(400).json({ error: err.errors }); return; }
    next(err);
  }
});

// POST /auth/logout
router.post('/logout', (_req: Request, res: Response) => {
  res.clearCookie(SESSION_COOKIE, { path: '/' });
  res.json({ ok: true });
});

// GET /auth/me
router.get('/me', requireAuth, async (req: Request, res: Response, next: NextFunction) => {
  try {
    const result = await pool.query<{
      id: string; email: string; role: string; tenant_id: string;
      full_name: string; phone: string | null; avatar_url: string | null;
      email_verified: boolean; created_at: string;
    }>(
      `SELECT id, email, role, tenant_id, full_name, phone, avatar_url, email_verified, created_at
       FROM users WHERE id = $1 AND tenant_id = $2`,
      [req.user!.userId, req.user!.tenantId],
    );

    const user = result.rows[0];
    if (!user) { res.status(404).json({ error: 'User not found' }); return; }

    res.json({
      id:            user.id,
      email:         user.email,
      role:          user.role,
      tenantId:      user.tenant_id,
      fullName:      user.full_name,
      phone:         user.phone,
      avatarUrl:     user.avatar_url,
      emailVerified: user.email_verified,
      createdAt:     user.created_at,
    });
  } catch (err) {
    next(err);
  }
});

// POST /auth/verify-email
router.post('/verify-email', async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { token } = z.object({ token: z.string().min(1) }).parse(req.body);

    const result = await pool.query<{ id: string }>(
      `UPDATE users
       SET email_verified = TRUE, email_verification_token = NULL
       WHERE email_verification_token = $1
         AND email_verification_sent_at > NOW() - INTERVAL '24 hours'
         AND email_verified = FALSE
       RETURNING id`,
      [token],
    );

    if (result.rowCount === 0) {
      res.status(400).json({ error: 'Invalid or expired verification link' });
      return;
    }

    res.json({ ok: true });
  } catch (err) {
    if (err instanceof z.ZodError) { res.status(400).json({ error: err.errors }); return; }
    next(err);
  }
});

// POST /auth/resend-verification
router.post('/resend-verification', requireAuth, async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { userId, tenantId } = req.user!;

    const result = await pool.query<{
      email: string; email_verified: boolean; email_verification_sent_at: Date | null;
    }>(
      `SELECT email, email_verified, email_verification_sent_at
       FROM users WHERE id = $1 AND tenant_id = $2`,
      [userId, tenantId],
    );

    const user = result.rows[0];
    if (!user) { res.status(404).json({ error: 'User not found' }); return; }
    if (user.email_verified) { res.status(400).json({ error: 'Email already verified' }); return; }

    // Rate-limit: one resend per minute
    if (user.email_verification_sent_at) {
      const sentAt = new Date(user.email_verification_sent_at).getTime();
      if (Date.now() - sentAt < 60_000) {
        res.status(429).json({ error: 'Please wait a moment before requesting another email' });
        return;
      }
    }

    const token = crypto.randomBytes(32).toString('hex');
    await pool.query(
      `UPDATE users SET email_verification_token = $1, email_verification_sent_at = NOW()
       WHERE id = $2`,
      [token, userId],
    );

    sendVerificationEmail(user.email, token).catch((err) =>
      console.error('[email] Failed to resend verification email:', err),
    );

    res.json({ ok: true });
  } catch (err) {
    next(err);
  }
});

// PATCH /auth/me
const updateMeSchema = z.object({
  fullName: z.string().min(1).max(120).optional(),
  phone:    z.string().max(30).optional().nullable(),
});

router.patch('/me', requireAuth, async (req: Request, res: Response, next: NextFunction) => {
  try {
    const body = updateMeSchema.parse(req.body);
    const { userId, tenantId } = req.user!;

    const fields: string[] = [];
    const values: unknown[] = [userId, tenantId];

    if (body.fullName !== undefined) { values.push(body.fullName); fields.push(`full_name = $${values.length}`); }
    if (body.phone    !== undefined) { values.push(body.phone);    fields.push(`phone = $${values.length}`); }

    if (fields.length === 0) { res.status(400).json({ error: 'No fields to update' }); return; }

    const result = await pool.query(
      `UPDATE users SET ${fields.join(', ')}
       WHERE id = $1 AND tenant_id = $2
       RETURNING id, email, role, tenant_id, full_name, phone, avatar_url, email_verified`,
      values,
    );

    const u = result.rows[0];
    res.json({
      id: u.id, email: u.email, role: u.role,
      tenantId: u.tenant_id, fullName: u.full_name,
      phone: u.phone, avatarUrl: u.avatar_url,
      emailVerified: u.email_verified,
    });
  } catch (err) {
    if (err instanceof z.ZodError) { res.status(400).json({ error: err.errors }); return; }
    next(err);
  }
});

export default router;
