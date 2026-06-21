import { Router, Request, Response, NextFunction } from 'express';
import bcrypt from 'bcryptjs';
import { z } from 'zod';
import pool from '../db';
import { requireAuth, requireEmployer } from '../middleware/auth';

const router = Router();

// GET / — list all employees (employer only)
router.get(
  '/',
  requireEmployer,
  async (req: Request, res: Response, next: NextFunction) => {
    try {
      const { tenantId } = req.user!;
      const result = await pool.query(
        `SELECT
           e.id, e.employee_number, e.job_title, e.employment_type,
           e.employment_status, e.start_date, e.gross_salary, e.pay_frequency,
           e.created_at,
           u.id AS user_id, u.email, u.full_name, u.phone, u.avatar_url,
           d.id AS department_id, d.name AS department_name
         FROM employees e
         JOIN users u ON u.id = e.user_id
         LEFT JOIN departments d ON d.id = e.department_id
         WHERE e.tenant_id = $1
         ORDER BY u.full_name ASC`,
        [tenantId]
      );

      res.json(result.rows.map(mapEmployee));
    } catch (err) {
      next(err);
    }
  }
);

// POST / — create employee
const createEmployeeSchema = z.object({
  email: z.string().email(),
  fullName: z.string().min(1),
  jobTitle: z.string().min(1),
  departmentId: z.string().uuid().optional().nullable(),
  employeeNumber: z.string().min(1),
  grossSalary: z.number().positive(),
  startDate: z.string().regex(/^\d{4}-\d{2}-\d{2}$/),
  employmentType: z.string().min(1).default('full_time'),
  payFrequency: z.string().min(1).default('monthly'),
});

router.post(
  '/',
  requireEmployer,
  async (req: Request, res: Response, next: NextFunction) => {
    try {
      const body = createEmployeeSchema.parse(req.body);
      const { tenantId } = req.user!;

      const passwordHash = await bcrypt.hash('Welcome123!', 10);

      const client = await pool.connect();
      try {
        await client.query('BEGIN');

        const userResult = await client.query<{ id: string }>(
          `INSERT INTO users (tenant_id, email, password_hash, role, full_name)
           VALUES ($1, $2, $3, 'employee', $4)
           RETURNING id`,
          [tenantId, body.email, passwordHash, body.fullName]
        );
        const userId = userResult.rows[0].id;

        const empResult = await client.query(
          `INSERT INTO employees
             (tenant_id, user_id, department_id, employee_number, job_title,
              employment_type, start_date, gross_salary, pay_frequency)
           VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9)
           RETURNING *`,
          [
            tenantId,
            userId,
            body.departmentId ?? null,
            body.employeeNumber,
            body.jobTitle,
            body.employmentType,
            body.startDate,
            body.grossSalary,
            body.payFrequency,
          ]
        );

        await client.query('COMMIT');

        const newEmp = empResult.rows[0];
        res.status(201).json({
          id: newEmp.id,
          userId,
          email: body.email,
          fullName: body.fullName,
          employeeNumber: newEmp.employee_number,
          jobTitle: newEmp.job_title,
          departmentId: newEmp.department_id,
          employmentType: newEmp.employment_type,
          employmentStatus: newEmp.employment_status,
          grossSalary: newEmp.gross_salary,
          payFrequency: newEmp.pay_frequency,
          startDate: newEmp.start_date,
          createdAt: newEmp.created_at,
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
      next(err);
    }
  }
);

// GET /:id — employer sees any; employee can only see own
router.get(
  '/:id',
  requireAuth,
  async (req: Request, res: Response, next: NextFunction) => {
    try {
      const { tenantId, role, userId } = req.user!;
      const { id } = req.params;

      const result = await pool.query(
        `SELECT
           e.id, e.employee_number, e.job_title, e.employment_type,
           e.employment_status, e.start_date, e.gross_salary, e.pay_frequency,
           e.created_at,
           u.id AS user_id, u.email, u.full_name, u.phone, u.avatar_url,
           d.id AS department_id, d.name AS department_name
         FROM employees e
         JOIN users u ON u.id = e.user_id
         LEFT JOIN departments d ON d.id = e.department_id
         WHERE e.id = $1 AND e.tenant_id = $2`,
        [id, tenantId]
      );

      const emp = result.rows[0];
      if (!emp) {
        res.status(404).json({ error: 'Employee not found' });
        return;
      }

      if (role === 'employee' && emp.user_id !== userId) {
        res.status(403).json({ error: 'Access denied' });
        return;
      }

      res.json(mapEmployee(emp));
    } catch (err) {
      next(err);
    }
  }
);

// PATCH /:id — update employee (employer only)
const updateEmployeeSchema = z.object({
  fullName: z.string().min(1).optional(),
  jobTitle: z.string().min(1).optional(),
  departmentId: z.string().uuid().nullable().optional(),
  grossSalary: z.number().positive().optional(),
  employmentType: z.string().min(1).optional(),
  employmentStatus: z.string().min(1).optional(),
  payFrequency: z.string().min(1).optional(),
  phone: z.string().optional(),
});

router.patch(
  '/:id',
  requireEmployer,
  async (req: Request, res: Response, next: NextFunction) => {
    try {
      const body = updateEmployeeSchema.parse(req.body);
      const { tenantId } = req.user!;
      const { id } = req.params;

      // Check employee exists in this tenant
      const existing = await pool.query<{ user_id: string }>(
        `SELECT user_id FROM employees WHERE id = $1 AND tenant_id = $2`,
        [id, tenantId]
      );
      if (!existing.rows[0]) {
        res.status(404).json({ error: 'Employee not found' });
        return;
      }
      const userId = existing.rows[0].user_id;

      const client = await pool.connect();
      try {
        await client.query('BEGIN');

        // Update user fields if any
        if (body.fullName !== undefined || body.phone !== undefined) {
          const userUpdates: string[] = [];
          const userValues: unknown[] = [];
          let idx = 1;
          if (body.fullName !== undefined) {
            userUpdates.push(`full_name = $${idx++}`);
            userValues.push(body.fullName);
          }
          if (body.phone !== undefined) {
            userUpdates.push(`phone = $${idx++}`);
            userValues.push(body.phone);
          }
          if (userUpdates.length > 0) {
            userValues.push(userId);
            await client.query(
              `UPDATE users SET ${userUpdates.join(', ')} WHERE id = $${idx}`,
              userValues
            );
          }
        }

        // Update employee fields
        const empUpdates: string[] = [];
        const empValues: unknown[] = [];
        let idx = 1;

        if (body.jobTitle !== undefined) {
          empUpdates.push(`job_title = $${idx++}`);
          empValues.push(body.jobTitle);
        }
        if (body.departmentId !== undefined) {
          empUpdates.push(`department_id = $${idx++}`);
          empValues.push(body.departmentId);
        }
        if (body.grossSalary !== undefined) {
          empUpdates.push(`gross_salary = $${idx++}`);
          empValues.push(body.grossSalary);
        }
        if (body.employmentType !== undefined) {
          empUpdates.push(`employment_type = $${idx++}`);
          empValues.push(body.employmentType);
        }
        if (body.employmentStatus !== undefined) {
          empUpdates.push(`employment_status = $${idx++}`);
          empValues.push(body.employmentStatus);
        }
        if (body.payFrequency !== undefined) {
          empUpdates.push(`pay_frequency = $${idx++}`);
          empValues.push(body.payFrequency);
        }

        let updatedEmp: Record<string, unknown> | null = null;
        if (empUpdates.length > 0) {
          empValues.push(id, tenantId);
          const result = await client.query(
            `UPDATE employees SET ${empUpdates.join(', ')}
             WHERE id = $${idx++} AND tenant_id = $${idx}
             RETURNING *`,
            empValues
          );
          updatedEmp = result.rows[0];
        }

        await client.query('COMMIT');

        // Fetch updated record
        const fresh = await pool.query(
          `SELECT
             e.id, e.employee_number, e.job_title, e.employment_type,
             e.employment_status, e.start_date, e.gross_salary, e.pay_frequency,
             e.created_at,
             u.id AS user_id, u.email, u.full_name, u.phone, u.avatar_url,
             d.id AS department_id, d.name AS department_name
           FROM employees e
           JOIN users u ON u.id = e.user_id
           LEFT JOIN departments d ON d.id = e.department_id
           WHERE e.id = $1 AND e.tenant_id = $2`,
          [id, tenantId]
        );

        res.json(mapEmployee(fresh.rows[0]));
        void updatedEmp; // suppress unused variable warning
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
      next(err);
    }
  }
);

// DELETE /:id — delete employee + user (employer only)
router.delete(
  '/:id',
  requireEmployer,
  async (req: Request, res: Response, next: NextFunction) => {
    try {
      const { tenantId } = req.user!;
      const { id } = req.params;

      const existing = await pool.query<{ user_id: string }>(
        `SELECT user_id FROM employees WHERE id = $1 AND tenant_id = $2`,
        [id, tenantId]
      );
      if (!existing.rows[0]) {
        res.status(404).json({ error: 'Employee not found' });
        return;
      }
      const userId = existing.rows[0].user_id;

      const client = await pool.connect();
      try {
        await client.query('BEGIN');
        await client.query(
          `DELETE FROM employees WHERE id = $1 AND tenant_id = $2`,
          [id, tenantId]
        );
        await client.query(
          `DELETE FROM users WHERE id = $1 AND tenant_id = $2`,
          [userId, tenantId]
        );
        await client.query('COMMIT');
        res.status(204).send();
      } catch (err) {
        await client.query('ROLLBACK');
        throw err;
      } finally {
        client.release();
      }
    } catch (err) {
      next(err);
    }
  }
);

function mapEmployee(row: Record<string, unknown>) {
  return {
    id: row['id'],
    employeeNumber: row['employee_number'],
    jobTitle: row['job_title'],
    employmentType: row['employment_type'],
    employmentStatus: row['employment_status'],
    startDate: row['start_date'],
    grossSalary: row['gross_salary'],
    payFrequency: row['pay_frequency'],
    createdAt: row['created_at'],
    userId: row['user_id'],
    email: row['email'],
    fullName: row['full_name'],
    phone: row['phone'],
    avatarUrl: row['avatar_url'],
    departmentId: row['department_id'],
    departmentName: row['department_name'],
  };
}

export default router;
