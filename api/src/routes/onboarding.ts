import { Router, Request, Response, NextFunction } from 'express';
import { z } from 'zod';
import pool from '../db';
import { requireEmployer } from '../middleware/auth';
import { sendVerificationEmail } from '../lib/email';
import bcrypt from 'bcryptjs';
import crypto from 'crypto';

const router = Router();

// All onboarding routes require an authenticated employer
router.use(requireEmployer);

// GET /onboarding — load saved progress for this tenant
router.get('/', async (req: Request, res: Response, next: NextFunction) => {
  try {
    const result = await pool.query<{
      settings: Record<string, unknown>;
      onboarding_step: number;
      onboarding_completed: boolean;
    }>(
      `SELECT settings, onboarding_step, onboarding_completed FROM tenants WHERE id = $1`,
      [req.user!.tenantId],
    );

    const tenant = result.rows[0];
    if (!tenant) { res.status(404).json({ error: 'Tenant not found' }); return; }

    res.json({
      step: tenant.onboarding_step,
      completed: tenant.onboarding_completed,
      settings: tenant.settings,
    });
  } catch (err) { next(err); }
});

// ── Step schemas ──────────────────────────────────────────────────────────────

const step0Schema = z.object({
  companyName:  z.string().min(1).max(200).trim(),
  country:      z.string().min(1).max(100).trim(),
  businessSize: z.string().min(1).max(50).trim(),
  industry:     z.string().min(1).max(100).trim(),
  timezone:     z.string().min(1).max(100).trim(),
  currency:     z.string().min(1).max(10).trim(),
  address:      z.string().min(1).max(500).trim(),
  website:      z.string().max(300).trim().optional(),
});

const step1Schema = z.object({
  registrationNumber: z.string().max(100).trim().optional(),
  taxId:              z.string().max(100).trim().optional(),
  companyType:        z.string().max(100).trim().optional(),
  incorporationDate:  z.string().max(20).trim().optional(),
  hmrcRegistered:     z.string().max(10).trim().optional(),
  payeReference:      z.string().max(100).trim().optional(),
});

const step2Schema = z.object({
  niNumber:              z.string().max(100).trim().optional(),
  vatNumber:             z.string().max(100).trim().optional(),
  pensionProvider:       z.string().max(100).trim().optional(),
  autoEnrolmentDate:     z.string().max(20).trim().optional(),
  dataProtectionOfficer: z.string().max(200).trim().optional(),
});

const step3Schema = z.object({
  payFrequency:  z.enum(['weekly', 'biweekly', 'monthly', 'semimonthly']),
  payDay:        z.string().min(1).max(20).trim(),
  payrollStart:  z.string().max(20).trim().optional(),
  baseCurrency:  z.string().min(1).max(10).trim(),
  overtimePolicy: z.string().max(100).trim().optional(),
  workingHours:  z.string().max(50).trim().optional(),
});

const step4Schema = z.object({
  bankName:      z.string().min(1).max(200).trim(),
  accountName:   z.string().min(1).max(200).trim(),
  accountNumber: z.string().min(1).max(50).trim(),
  sortCode:      z.string().min(1).max(20).trim(),
  paymentMethod: z.string().min(1).max(50).trim(),
});

const stepSchemas: Record<number, z.ZodTypeAny> = {
  0: step0Schema,
  1: step1Schema,
  2: step2Schema,
  3: step3Schema,
  4: step4Schema,
};

// PATCH /onboarding/step/:step — save a step's data and advance progress
router.patch('/step/:step', async (req: Request, res: Response, next: NextFunction) => {
  try {
    const stepNum = parseInt(req.params.step, 10);
    if (isNaN(stepNum) || stepNum < 0 || stepNum > 4) {
      res.status(400).json({ error: 'Invalid step number' });
      return;
    }

    const schema = stepSchemas[stepNum];
    const data = schema.parse(req.body);

    // Merge into tenant settings and advance the step pointer
    await pool.query(
      `UPDATE tenants
       SET settings        = settings || $1::jsonb,
           onboarding_step = GREATEST(onboarding_step, $2)
       WHERE id = $3`,
      [JSON.stringify(data), stepNum + 1, req.user!.tenantId],
    );

    res.json({ ok: true, step: stepNum + 1 });
  } catch (err) {
    if (err instanceof z.ZodError) { res.status(400).json({ error: err.errors }); return; }
    next(err);
  }
});

// POST /onboarding/invite — send employee invitations
const inviteSchema = z.object({
  emails: z.array(z.string().email().max(254)).min(1).max(50),
});

router.post('/invite', async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { emails } = inviteSchema.parse(req.body);
    const { tenantId } = req.user!;

    const sent: string[] = [];
    const skipped: string[] = [];

    for (const email of emails) {
      const norm = email.toLowerCase().trim();

      // Check if user already exists for this tenant
      const existing = await pool.query(
        `SELECT id FROM users WHERE email = $1`,
        [norm],
      );
      if (existing.rows.length > 0) { skipped.push(norm); continue; }

      // Create a pending employee user with a random temp password
      const tempPassword = crypto.randomBytes(16).toString('hex');
      const hash = await bcrypt.hash(tempPassword, 10);
      const verificationToken = crypto.randomBytes(32).toString('hex');

      await pool.query(
        `INSERT INTO users (tenant_id, email, password_hash, role, full_name,
                            email_verification_token, email_verification_sent_at)
         VALUES ($1, $2, $3, 'employee', $2, $4, NOW())`,
        [tenantId, norm, hash, verificationToken],
      );

      // Reuse verification email as invite — employee sets password on verify
      sendVerificationEmail(norm, verificationToken).catch((e) =>
        console.error('[email] Failed to send invite:', e),
      );

      sent.push(norm);
    }

    res.json({ ok: true, sent, skipped });
  } catch (err) {
    if (err instanceof z.ZodError) { res.status(400).json({ error: err.errors }); return; }
    next(err);
  }
});

// POST /onboarding/complete — mark onboarding done
router.post('/complete', async (req: Request, res: Response, next: NextFunction) => {
  try {
    await pool.query(
      `UPDATE tenants SET onboarding_completed = TRUE, onboarding_step = 6 WHERE id = $1`,
      [req.user!.tenantId],
    );
    res.json({ ok: true });
  } catch (err) { next(err); }
});

export default router;
