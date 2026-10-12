import { Router, Request, Response, NextFunction } from 'express';
import multer from 'multer';
import { z } from 'zod';
import pool from '../db';
import { requireAuth, requireEmployer } from '../middleware/auth';

const router = Router();

// Store file in memory (BYTEA in Postgres — fine for documents up to ~10 MB)
const upload = multer({
  storage: multer.memoryStorage(),
  limits: { fileSize: 10 * 1024 * 1024 },
});

// ── GET / — list all documents in tenant ─────────────────────────────────────
router.get(
  '/',
  requireAuth,
  async (req: Request, res: Response, next: NextFunction) => {
    try {
      const { tenantId } = req.user!;
      const result = await pool.query(
        `SELECT
           d.id, d.name, d.doc_type, d.description, d.file_name,
           d.file_size, d.mime_type, d.expiry_date, d.status,
           d.require_signature, d.created_at, d.employee_id,
           u.full_name AS uploaded_by_name
         FROM documents d
         LEFT JOIN users u ON u.id = d.uploaded_by
         WHERE d.tenant_id = $1
         ORDER BY d.created_at DESC`,
        [tenantId]
      );
      res.json(result.rows);
    } catch (err) {
      next(err);
    }
  }
);

// ── POST / — upload a document (employer only) ────────────────────────────────
const metaSchema = z.object({
  name: z.string().min(1),
  docType: z.string().min(1).default('Other'),
  description: z.string().optional(),
  employeeId: z.string().uuid().optional(),
  expiryDate: z.string().optional(),
  requireSignature: z.coerce.boolean().default(false),
});

router.post(
  '/',
  requireEmployer,
  upload.single('file'),
  async (req: Request, res: Response, next: NextFunction) => {
    try {
      const body = metaSchema.parse(req.body);
      const { tenantId, userId } = req.user!;
      const file = req.file;

      if (!file) {
        res.status(400).json({ error: 'file is required' });
        return;
      }

      const result = await pool.query(
        `INSERT INTO documents
           (tenant_id, uploaded_by, employee_id, name, doc_type, description,
            file_name, file_size, mime_type, file_data, expiry_date, require_signature)
         VALUES ($1,$2,$3,$4,$5,$6,$7,$8,$9,$10,$11,$12)
         RETURNING id, name, doc_type, description, file_name, file_size,
                   mime_type, expiry_date, status, require_signature, created_at, employee_id`,
        [
          tenantId,
          userId,
          body.employeeId ?? null,
          body.name,
          body.docType,
          body.description ?? null,
          file.originalname,
          file.size,
          file.mimetype,
          file.buffer,
          body.expiryDate || null,
          body.requireSignature,
        ]
      );

      res.status(201).json(result.rows[0]);
    } catch (err) {
      next(err);
    }
  }
);

// ── GET /:id/download — download file bytes ───────────────────────────────────
router.get(
  '/:id/download',
  requireAuth,
  async (req: Request, res: Response, next: NextFunction) => {
    try {
      const { tenantId } = req.user!;
      const result = await pool.query(
        `SELECT file_name, mime_type, file_data FROM documents WHERE id = $1 AND tenant_id = $2`,
        [req.params.id, tenantId]
      );
      if (!result.rows.length) {
        res.status(404).json({ error: 'not found' });
        return;
      }
      const { file_name, mime_type, file_data } = result.rows[0];
      res.setHeader('Content-Disposition', `attachment; filename="${file_name}"`);
      res.setHeader('Content-Type', mime_type ?? 'application/octet-stream');
      res.send(file_data);
    } catch (err) {
      next(err);
    }
  }
);

// ── PATCH /:id/archive ────────────────────────────────────────────────────────
router.patch(
  '/:id/archive',
  requireEmployer,
  async (req: Request, res: Response, next: NextFunction) => {
    try {
      const { tenantId } = req.user!;
      const result = await pool.query(
        `UPDATE documents SET status = 'archived', updated_at = NOW()
         WHERE id = $1 AND tenant_id = $2
         RETURNING id, name, status`,
        [req.params.id, tenantId]
      );
      if (!result.rows.length) {
        res.status(404).json({ error: 'not found' });
        return;
      }
      res.json(result.rows[0]);
    } catch (err) {
      next(err);
    }
  }
);

// ── DELETE /:id ───────────────────────────────────────────────────────────────
router.delete(
  '/:id',
  requireEmployer,
  async (req: Request, res: Response, next: NextFunction) => {
    try {
      const { tenantId } = req.user!;
      await pool.query(
        `DELETE FROM documents WHERE id = $1 AND tenant_id = $2`,
        [req.params.id, tenantId]
      );
      res.status(204).send();
    } catch (err) {
      next(err);
    }
  }
);

export default router;
