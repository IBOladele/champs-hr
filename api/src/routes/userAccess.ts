import { Router, Request, Response, NextFunction } from 'express';
import { z } from 'zod';
import pool from '../db';
import { requireEmployer } from '../middleware/auth';

const router = Router();

// ── Types ──────────────────────────────────────────────────────────────────────

export interface PortalUser {
  id: string
  fullName: string
  email: string
  employeeNumber: string | null
  jobTitle: string | null
  portalRole: string | null
  portalPermissions: Record<string, boolean>
  isOwner: boolean
  createdAt: string
}

function mapUser(row: Record<string, unknown>): PortalUser {
  return {
    id:                 row.id as string,
    fullName:           row.full_name as string,
    email:              row.email as string,
    employeeNumber:     row.employee_number as string | null,
    jobTitle:           row.job_title as string | null,
    portalRole:         row.portal_role as string | null,
    portalPermissions:  (row.portal_permissions ?? {}) as Record<string, boolean>,
    isOwner:            row.role === 'employer',
    createdAt:          row.created_at as string,
  }
}

// ── GET /user-access — list all portal users ───────────────────────────────────
router.get('/', requireEmployer, async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { tenantId } = req.user!
    const result = await pool.query<Record<string, unknown>>(
      `SELECT u.id, u.email, u.full_name, u.role, u.portal_role, u.portal_permissions, u.created_at,
              e.employee_number, e.job_title
       FROM users u
       LEFT JOIN employees e ON e.user_id = u.id AND e.tenant_id = $1
       WHERE u.tenant_id = $1
         AND (u.role = 'employer' OR u.portal_role IS NOT NULL)
       ORDER BY u.role DESC, u.full_name ASC`,
      [tenantId],
    )
    res.json(result.rows.map(mapUser))
  } catch (err) { next(err) }
})

// ── POST /user-access — grant or update access ─────────────────────────────────
const grantSchema = z.object({
  userId:      z.string().uuid(),
  portalRole:  z.string().min(1).max(60),
  permissions: z.record(z.boolean()),
  expiresAt:   z.string().datetime({ offset: true }).nullable().optional(),
})

router.post('/', requireEmployer, async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { tenantId } = req.user!
    const { userId, portalRole, permissions } = grantSchema.parse(req.body)

    // Confirm the target user belongs to this tenant
    const check = await pool.query<Record<string, unknown>>(
      `SELECT id, role FROM users WHERE id = $1 AND tenant_id = $2`,
      [userId, tenantId],
    )
    if (check.rows.length === 0) { res.status(404).json({ error: 'User not found' }); return }
    if (check.rows[0].role === 'employer') {
      res.status(400).json({ error: 'Owner access cannot be modified' }); return
    }

    const result = await pool.query<Record<string, unknown>>(
      `UPDATE users
       SET portal_role = $1, portal_permissions = $2
       WHERE id = $3 AND tenant_id = $4
       RETURNING id, email, full_name, role, portal_role, portal_permissions, created_at`,
      [portalRole, JSON.stringify(permissions), userId, tenantId],
    )

    // Fetch employee details for the response
    const emp = await pool.query<Record<string, unknown>>(
      `SELECT employee_number, job_title FROM employees WHERE user_id = $1 AND tenant_id = $2`,
      [userId, tenantId],
    )
    const row = { ...result.rows[0], ...emp.rows[0] }
    res.status(201).json(mapUser(row))
  } catch (err) {
    if (err instanceof z.ZodError) { res.status(400).json({ error: err.errors }); return }
    next(err)
  }
})

// ── DELETE /user-access/:userId — revoke access ────────────────────────────────
router.delete('/:userId', requireEmployer, async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { tenantId } = req.user!
    const { userId } = req.params

    const check = await pool.query<Record<string, unknown>>(
      `SELECT role FROM users WHERE id = $1 AND tenant_id = $2`,
      [userId, tenantId],
    )
    if (check.rows.length === 0) { res.status(404).json({ error: 'User not found' }); return }
    if (check.rows[0].role === 'employer') {
      res.status(400).json({ error: 'Owner access cannot be revoked' }); return
    }

    await pool.query(
      `UPDATE users SET portal_role = NULL, portal_permissions = '{}' WHERE id = $1 AND tenant_id = $2`,
      [userId, tenantId],
    )
    res.status(204).end()
  } catch (err) { next(err) }
})

export default router
