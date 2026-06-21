import * as dotenv from 'dotenv';
import * as path from 'path';
import supertest from 'supertest';

// Load .env.test first, fall back to .env
dotenv.config({ path: path.resolve(__dirname, '../.env.test') });
dotenv.config({ path: path.resolve(__dirname, '../.env') });

// Import pool after env is loaded so DATABASE_URL is available
import pool from '../src/db';

// Import app after env is loaded so JWT_SECRET is available
import { app } from '../src/index';

export const request = supertest(app);

/**
 * Delete all test data for a given tenantId in FK-safe order.
 */
export async function cleanupTestData(tenantId: string): Promise<void> {
  const client = await pool.connect();
  try {
    await client.query('BEGIN');
    await client.query(
      `DELETE FROM attendance_records WHERE tenant_id = $1`,
      [tenantId]
    );
    await client.query(
      `DELETE FROM employee_benefits WHERE tenant_id = $1`,
      [tenantId]
    );
    await client.query(
      `DELETE FROM payroll_run_items WHERE tenant_id = $1`,
      [tenantId]
    );
    await client.query(
      `DELETE FROM payroll_runs WHERE tenant_id = $1`,
      [tenantId]
    );
    await client.query(
      `DELETE FROM leave_requests WHERE tenant_id = $1`,
      [tenantId]
    );
    await client.query(
      `DELETE FROM employees WHERE tenant_id = $1`,
      [tenantId]
    );
    await client.query(
      `DELETE FROM departments WHERE tenant_id = $1`,
      [tenantId]
    );
    await client.query(
      `DELETE FROM benefits WHERE tenant_id = $1`,
      [tenantId]
    );
    await client.query(
      `DELETE FROM users WHERE tenant_id = $1`,
      [tenantId]
    );
    await client.query(
      `DELETE FROM tenants WHERE id = $1`,
      [tenantId]
    );
    await client.query('COMMIT');
  } catch (err) {
    await client.query('ROLLBACK');
    throw err;
  } finally {
    client.release();
  }
}

export interface TestEmployer {
  token: string;
  user: {
    id: string;
    email: string;
    role: string;
    tenantId: string;
    fullName: string;
  };
  tenantId: string;
}

/**
 * Sign up a unique employer and return their token, user object, and tenantId.
 */
export async function createTestEmployer(
  suffix?: string
): Promise<TestEmployer> {
  const tag = suffix ?? Date.now().toString();
  const email = `employer-${tag}@test-champs.com`;
  const companyName = `Test Corp ${tag}`;

  const res = await request.post('/api/v1/auth/signup').send({
    email,
    password: 'Password123!',
    fullName: 'Test Employer',
    companyName,
  });

  if (res.status !== 201) {
    throw new Error(
      `createTestEmployer failed: ${res.status} ${JSON.stringify(res.body)}`
    );
  }

  return {
    token: res.body.accessToken,
    user: res.body.user,
    tenantId: res.body.user.tenantId,
  };
}

export interface TestEmployee {
  id: string;
  userId: string;
  email: string;
  fullName: string;
  employeeNumber: string;
  jobTitle: string;
  grossSalary: number | string;
  startDate: string;
  employmentType: string;
  employmentStatus: string;
  payFrequency: string;
  createdAt: string;
}

/**
 * Create a test employee under the given employer's tenant.
 */
export async function createTestEmployee(
  employerToken: string,
  suffix?: string
): Promise<TestEmployee> {
  const tag = suffix ?? Date.now().toString();

  const res = await request
    .post('/api/v1/employees')
    .set('Authorization', `Bearer ${employerToken}`)
    .send({
      email: `employee-${tag}@test-champs.com`,
      fullName: 'Test Employee',
      jobTitle: 'Software Engineer',
      employeeNumber: `EMP-${tag}`,
      grossSalary: 50000,
      startDate: '2024-01-15',
      employmentType: 'full_time',
      payFrequency: 'monthly',
    });

  if (res.status !== 201) {
    throw new Error(
      `createTestEmployee failed: ${res.status} ${JSON.stringify(res.body)}`
    );
  }

  return res.body as TestEmployee;
}

/**
 * Log in with employee credentials and return their token.
 */
export async function loginAsEmployee(email: string): Promise<string> {
  const res = await request.post('/api/v1/auth/login').send({
    email,
    password: 'Welcome123!', // default password set by employees route
  });

  if (res.status !== 200) {
    throw new Error(
      `loginAsEmployee failed: ${res.status} ${JSON.stringify(res.body)}`
    );
  }

  return res.body.accessToken as string;
}

// Pool is closed by --forceExit; don't call pool.end() here because
// setupFilesAfterEnv runs once per test FILE so end() would fire between
// files and break subsequent suites running in the same process.
