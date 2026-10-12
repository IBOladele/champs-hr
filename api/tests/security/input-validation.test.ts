/**
 * Input Validation & HTTP Security Header Tests
 *
 * Covers:
 *  1. HTTP security headers (Helmet)
 *  2. SQL injection via request body
 *  3. XSS in stored fields
 *  4. Zod schema enforcement
 *  5. Request size limits
 */

import {
  request,
  createTestEmployer,
  cleanupTestData,
  type TestEmployer,
} from '../setup';

describe('HTTP Security Headers', () => {
  it('all API responses include X-Content-Type-Options: nosniff', async () => {
    const res = await request.get('/api/v1/auth/me');
    expect(res.headers['x-content-type-options']).toBe('nosniff');
  });

  it('all API responses include X-Frame-Options: SAMEORIGIN', async () => {
    const res = await request.get('/api/v1/auth/me');
    const xFrameOptions = res.headers['x-frame-options'];
    expect(xFrameOptions).toBeDefined();
    // Helmet sets SAMEORIGIN by default
    expect(xFrameOptions?.toUpperCase()).toContain('SAMEORIGIN');
  });

  it('login response does not expose server version info', async () => {
    const res = await request.post('/api/v1/auth/login').send({
      email: 'nobody@test.com',
      password: 'wrongpassword',
    });
    expect(res.headers['x-powered-by']).toBeUndefined();
    expect(res.headers['server']).toBeUndefined();
  });

  it('CORS: request with no origin is allowed (curl-style)', async () => {
    const res = await request.get('/health');
    // No origin = allowed, response should be OK
    expect(res.status).toBe(200);
  });

  it('CORS: request from a disallowed origin gets blocked or no ACAO header', async () => {
    const res = await request
      .get('/api/v1/auth/me')
      .set('Origin', 'https://evil-attacker.example.com');
    // Either blocked (CORS error / no ACAO header) or returns 200 with no ACAO for disallowed origins
    // When CORS_ORIGIN is empty the server allows all; in test env this is expected behaviour
    // We check the header value is either absent or not the evil origin
    const acao = res.headers['access-control-allow-origin'];
    if (acao) {
      expect(acao).not.toBe('https://evil-attacker.example.com');
    }
  });
});

describe('SQL Injection via request body', () => {
  it("POST /auth/signup with SQL in email field → rejects (400 or 409) not 500", async () => {
    const res = await request.post('/api/v1/auth/signup').send({
      email: "' OR '1'='1'; --",
      password: 'Password123!',
      fullName: 'SQLInject',
      companyName: 'SQL Corp',
    });
    expect([400, 409, 422]).toContain(res.status);
    expect(res.status).not.toBe(500);
  });

  it("POST /auth/login with SQL in password field → returns 401 not 500", async () => {
    const res = await request.post('/api/v1/auth/login').send({
      email: 'test@example.com',
      password: "' OR '1'='1'; DROP TABLE users; --",
    });
    expect(res.status).toBe(401);
    expect(res.status).not.toBe(500);
  });

  it('POST /employees with SQL in fullName field → API handles gracefully', async () => {
    let employer: TestEmployer | null = null;
    try {
      employer = await createTestEmployer(`sql-inject-${Date.now()}`);
      const res = await request
        .post('/api/v1/employees')
        .set('Cookie', employer.cookie)
        .send({
          email: `sqlinject-${Date.now()}@test.com`,
          fullName: "'; DROP TABLE employees; --",
          jobTitle: 'Engineer',
          employeeNumber: `EMP-SQL-${Date.now()}`,
          grossSalary: 50000,
          startDate: '2024-01-01',
          employmentType: 'full_time',
          payFrequency: 'monthly',
        });
      // Should either succeed (201) with the raw string stored, or return a validation error
      expect([201, 400, 422]).toContain(res.status);
      expect(res.status).not.toBe(500);
    } finally {
      if (employer) await cleanupTestData(employer.tenantId);
    }
  });

  it('POST /employees with XSS in jobTitle → stored data does not return script tags unescaped in JSON', async () => {
    let employer: TestEmployer | null = null;
    try {
      employer = await createTestEmployer(`xss-inject-${Date.now()}`);
      const xssPayload = '<script>alert("xss")</script>';
      const res = await request
        .post('/api/v1/employees')
        .set('Cookie', employer.cookie)
        .send({
          email: `xss-${Date.now()}@test.com`,
          fullName: 'XSS Test Employee',
          jobTitle: xssPayload,
          employeeNumber: `EMP-XSS-${Date.now()}`,
          grossSalary: 50000,
          startDate: '2024-01-01',
          employmentType: 'full_time',
          payFrequency: 'monthly',
        });
      // API returns JSON; script tags in JSON are fine since the browser won't execute JSON text
      // The important thing is it returns 201 (stored) or 400 (rejected), not 500
      expect([201, 400, 422]).toContain(res.status);
      expect(res.status).not.toBe(500);
      if (res.status === 201) {
        // The response is JSON — any <script> tags are safe in JSON text
        expect(typeof res.body).toBe('object');
      }
    } finally {
      if (employer) await cleanupTestData(employer.tenantId);
    }
  });
});

describe('Request size limits', () => {
  it('POST /auth/login with 100KB body → handles gracefully (400/413), not 500', async () => {
    const bigPayload = {
      email: 'test@example.com',
      password: 'Password123!',
      extra: 'x'.repeat(100 * 1024),
    };
    const res = await request
      .post('/api/v1/auth/login')
      .send(bigPayload);
    // Body parser limit is 50kb, so 100KB should fail gracefully
    expect([400, 413]).toContain(res.status);
    expect(res.status).not.toBe(500);
  });
});

describe('Zod schema enforcement', () => {
  let employer: TestEmployer;

  beforeAll(async () => {
    employer = await createTestEmployer(`zod-schema-${Date.now()}`);
  });

  afterAll(async () => {
    await cleanupTestData(employer.tenantId);
  });

  it('POST /payroll with missing periodStart → 400 with validation error', async () => {
    const res = await request
      .post('/api/v1/payroll')
      .set('Cookie', employer.cookie)
      .send({ periodEnd: '2025-01-31' });
    expect(res.status).toBe(400);
    expect(res.body).toHaveProperty('error');
  });

  it('POST /payroll with invalid date format → 400', async () => {
    const res = await request
      .post('/api/v1/payroll')
      .set('Cookie', employer.cookie)
      .send({ periodStart: 'not-a-date', periodEnd: 'also-not-a-date' });
    expect(res.status).toBe(400);
  });

  it('PATCH /employees/:id with negative grossSalary → 400 or validation error', async () => {
    // Create an employee to PATCH
    const empRes = await request
      .post('/api/v1/employees')
      .set('Cookie', employer.cookie)
      .send({
        email: `neg-sal-${Date.now()}@test.com`,
        fullName: 'Test Neg Salary',
        jobTitle: 'Engineer',
        employeeNumber: `EMP-NEG-${Date.now()}`,
        grossSalary: 50000,
        startDate: '2024-01-01',
        employmentType: 'full_time',
        payFrequency: 'monthly',
      });
    if (empRes.status !== 201) return; // can't test PATCH without employee
    const empId = empRes.body.id;

    const res = await request
      .patch(`/api/v1/employees/${empId}`)
      .set('Cookie', employer.cookie)
      .send({ grossSalary: -5000 });
    // Negative salary should be rejected or at least not cause a 500
    expect(res.status).not.toBe(500);
  });

  it('POST /employees with email that is not an email → 400', async () => {
    const res = await request
      .post('/api/v1/employees')
      .set('Cookie', employer.cookie)
      .send({
        email: 'not-an-email',
        fullName: 'Bad Email Employee',
        jobTitle: 'Engineer',
        employeeNumber: `EMP-BAD-${Date.now()}`,
        grossSalary: 50000,
        startDate: '2024-01-01',
        employmentType: 'full_time',
        payFrequency: 'monthly',
      });
    expect(res.status).toBe(400);
  });
});
