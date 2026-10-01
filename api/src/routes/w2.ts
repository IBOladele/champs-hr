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

// GET /employees/:id/w2?year=YYYY
// Generates W-2 summary data from approved payroll run items
router.get(
  '/employees/:id/w2',
  requireAuth,
  async (req: Request, res: Response, next: NextFunction) => {
    try {
      const { tenantId, role, userId } = req.user!;

      // Validate year param
      const yearParam = req.query.year as string | undefined;
      const parsed = z.string().regex(/^\d{4}$/).safeParse(yearParam);
      if (!parsed.success) {
        res.status(400).json({ error: 'year query param is required (YYYY)' }); return;
      }
      const year = parseInt(parsed.data, 10);

      const emp = await resolveEmployee(req.params.id, tenantId);
      if (!emp) { res.status(404).json({ error: 'Employee not found' }); return; }

      if (role === 'employee' && emp.user_id !== userId) {
        res.status(403).json({ error: 'Access denied' }); return;
      }

      // Fetch employee + employer details for the W-2 header
      const empDetails = await pool.query<{
        full_name: string; email: string;
        tenant_name: string; tenant_slug: string;
      }>(
        `SELECT u.full_name, u.email, t.name AS tenant_name, t.slug AS tenant_slug
         FROM employees e
         JOIN users u ON u.id = e.user_id
         JOIN tenants t ON t.id = e.tenant_id
         WHERE e.id = $1`,
        [emp.id],
      );
      const info = empDetails.rows[0];

      // Sum payroll items from completed runs within the calendar year
      const itemsResult = await pool.query<{
        total_wages: string;
        federal_tax: string;
        social_security: string;
        medicare: string;
        run_count: string;
      }>(
        `SELECT
           COALESCE(SUM(pri.gross_pay), 0)                                          AS total_wages,
           COALESCE(SUM((pri.deductions->>'federalTax')::numeric), 0)               AS federal_tax,
           COALESCE(SUM((pri.deductions->>'socialSecurity')::numeric), 0)           AS social_security,
           COALESCE(SUM((pri.deductions->>'medicare')::numeric), 0)                 AS medicare,
           COUNT(DISTINCT pr.id)                                                    AS run_count
         FROM payroll_run_items pri
         JOIN payroll_runs pr ON pr.id = pri.payroll_run_id
         WHERE pri.employee_id = $1
           AND pri.tenant_id   = $2
           AND pr.status       = 'completed'
           AND EXTRACT(YEAR FROM pr.period_start) = $3`,
        [emp.id, tenantId, year],
      );

      const row = itemsResult.rows[0];
      const wages          = parseFloat(row.total_wages);
      const federalTax     = parseFloat(row.federal_tax);
      const socialSecurity = parseFloat(row.social_security);
      const medicare       = parseFloat(row.medicare);

      if (wages === 0) {
        res.status(404).json({ error: `No completed payroll found for year ${year}` }); return;
      }

      res.json({
        taxYear:           year,
        employee: {
          name:  info.full_name,
          email: info.email,
        },
        employer: {
          name: info.tenant_name,
          slug: info.tenant_slug,
        },
        // W-2 box numbers (IRS reference)
        box1_wagesTipsOther:          wages.toFixed(2),
        box2_federalIncomeTaxWithheld: federalTax.toFixed(2),
        box3_socialSecurityWages:      wages.toFixed(2),
        box4_socialSecurityTaxWithheld: socialSecurity.toFixed(2),
        box5_medicareWages:            wages.toFixed(2),
        box6_medicareTaxWithheld:      medicare.toFixed(2),
        payrollRunsIncluded: parseInt(row.run_count, 10),
      });
    } catch (err) { next(err); }
  },
);

export default router;
