/**
 * Concurrent stress tests for the Champs HR API.
 *
 * Run with:
 *   cd api && npx jest tests/stress/concurrent --testTimeout=60000 --no-coverage --forceExit
 *
 * These tests hit the real database (same as the rest of the Jest suite).
 * They prove correctness under parallel load: tenant isolation, no deadlocks,
 * no phantom 500s, and consistent aggregate counts.
 */

import {
  request,
  createTestEmployer,
  createTestEmployee,
  cleanupTestData,
  loginAsEmployee,
} from '../setup';

jest.setTimeout(60_000);

// ---------------------------------------------------------------------------
// Helpers
// ---------------------------------------------------------------------------

async function timedRequest(fn: () => Promise<import('supertest').Response>) {
  const start = Date.now();
  const res   = await fn();
  return { res, ms: Date.now() - start };
}

function percentile(sorted: number[], p: number): number {
  if (sorted.length === 0) return 0;
  return sorted[Math.floor(sorted.length * p / 100)] ?? sorted[sorted.length - 1];
}

function logTiming(label: string, times: number[]) {
  const sorted = [...times].sort((a, b) => a - b);
  const p50    = percentile(sorted, 50);
  const p95    = percentile(sorted, 95);
  const max    = sorted[sorted.length - 1];
  console.log(`[${label}] p50=${p50}ms  p95=${p95}ms  max=${max}ms  n=${times.length}`);
}

function countByStatus(responses: import('supertest').Response[]): Record<number, number> {
  const counts: Record<number, number> = {};
  for (const r of responses) {
    counts[r.status] = (counts[r.status] ?? 0) + 1;
  }
  return counts;
}

// ---------------------------------------------------------------------------
// Test 1: Concurrent reads — employer dashboard
// ---------------------------------------------------------------------------

describe('Test 1: Concurrent reads — employer dashboard', () => {
  let tenantId: string;
  let cookie: string[];

  beforeAll(async () => {
    const employer = await createTestEmployer('t1');
    tenantId = employer.tenantId;
    cookie   = employer.cookie;

    await Promise.all([
      createTestEmployee(cookie, 't1-e1'),
      createTestEmployee(cookie, 't1-e2'),
      createTestEmployee(cookie, 't1-e3'),
    ]);
  });

  afterAll(async () => { await cleanupTestData(tenantId); });

  it('30 concurrent dashboard GETs all return 200 with correct employee count', async () => {
    const wallStart = Date.now();
    const results   = await Promise.all(
      Array.from({ length: 30 }, () =>
        timedRequest(() =>
          request.get('/api/v1/dashboard').set('Cookie', cookie)
        )
      )
    );
    const wallMs = Date.now() - wallStart;

    const times    = results.map((r) => r.ms);
    const statuses = countByStatus(results.map((r) => r.res));
    logTiming('Test1:dashboard', times);
    console.log('[Test1] status counts:', statuses, `wall-clock=${wallMs}ms`);

    for (const { res } of results) {
      expect(res.status).toBe(200);
      expect(res.body.employees.total).toBe(3);
    }

    expect(wallMs).toBeLessThan(5_000);
  });
});

// ---------------------------------------------------------------------------
// Test 2: Concurrent reads — multiple tenants (tenant isolation)
// ---------------------------------------------------------------------------

describe('Test 2: Concurrent reads — multiple tenants', () => {
  let tenantIds: string[];
  let cookies: string[][];

  beforeAll(async () => {
    const employers = await Promise.all([
      createTestEmployer('t2-a'),
      createTestEmployer('t2-b'),
      createTestEmployer('t2-c'),
    ]);
    tenantIds = employers.map((e) => e.tenantId);
    cookies   = employers.map((e) => e.cookie);

    await Promise.all(
      employers.flatMap((e, i) => [
        createTestEmployee(e.cookie, `t2-${i}-e1`),
        createTestEmployee(e.cookie, `t2-${i}-e2`),
      ])
    );
  });

  afterAll(async () => {
    await Promise.all(tenantIds.map((id) => cleanupTestData(id)));
  });

  it('10 concurrent requests per tenant — all 200 with correct count and isolated data', async () => {
    // 30 total requests, all fired simultaneously
    const allRequests = cookies.flatMap((cookie, i) =>
      Array.from({ length: 10 }, () =>
        timedRequest(() =>
          request.get('/api/v1/dashboard').set('Cookie', cookie)
        ).then(({ res, ms }) => ({ res, ms, tenantIndex: i }))
      )
    );

    const results = await Promise.all(allRequests);
    const times   = results.map((r) => r.ms);
    logTiming('Test2:multi-tenant-dashboard', times);

    for (const { res } of results) {
      expect(res.status).toBe(200);
      // Each tenant has exactly 2 employees
      expect(res.body.employees.total).toBe(2);
    }
  });
});

// ---------------------------------------------------------------------------
// Test 3: Concurrent employee creation (race condition)
// ---------------------------------------------------------------------------

describe('Test 3: Concurrent employee creation — race condition', () => {
  let tenantId: string;
  let cookie: string[];

  beforeAll(async () => {
    const employer = await createTestEmployer('t3');
    tenantId = employer.tenantId;
    cookie   = employer.cookie;
  });

  afterAll(async () => { await cleanupTestData(tenantId); });

  it('10 simultaneous employee creations all succeed without deadlock', async () => {
    const results = await Promise.all(
      Array.from({ length: 10 }, (_, i) =>
        timedRequest(() =>
          request
            .post('/api/v1/employees')
            .set('Cookie', cookie)
            .send({
              email:          `t3-race-emp-${i}@test-champs.com`,
              fullName:       `Race Employee ${i}`,
              jobTitle:       'Engineer',
              employeeNumber: `EMP-T3-RACE-${i}-${Date.now()}`,
              grossSalary:    45000,
              startDate:      '2024-01-15',
              employmentType: 'full_time',
              payFrequency:   'monthly',
            })
        )
      )
    );

    const times    = results.map((r) => r.ms);
    const statuses = countByStatus(results.map((r) => r.res));
    logTiming('Test3:race-creation', times);
    console.log('[Test3] status counts:', statuses);

    // All must succeed
    for (const { res } of results) {
      expect(res.status).toBe(201);
    }

    // Verify final count
    const listRes = await request.get('/api/v1/employees').set('Cookie', cookie);
    expect(listRes.status).toBe(200);
    expect(listRes.body).toHaveLength(10);
  });
});

// ---------------------------------------------------------------------------
// Test 4: Duplicate prevention under concurrency
// ---------------------------------------------------------------------------

describe('Test 4: Duplicate signup prevention under concurrency', () => {
  const sharedEmail = `dup-test-${Date.now()}@test-champs.com`;
  const tenantIds: string[] = [];

  afterAll(async () => {
    await Promise.all(tenantIds.map((id) => cleanupTestData(id)));
  });

  it('5 simultaneous signups with same email: exactly 1 succeeds (201), rest are 409', async () => {
    const results = await Promise.all(
      Array.from({ length: 5 }, (_, i) =>
        timedRequest(() =>
          request.post('/api/v1/auth/signup').send({
            email:       sharedEmail,
            password:    'Password123!',
            fullName:    'Dup Test User',
            companyName: `Dup Corp ${i} ${Date.now()}`,
          })
        )
      )
    );

    const times    = results.map((r) => r.ms);
    const statuses = countByStatus(results.map((r) => r.res));
    logTiming('Test4:dup-signup', times);
    console.log('[Test4] status counts:', statuses);

    // Collect tenantIds from the successful signup(s) so we can clean up
    for (const { res } of results) {
      if (res.status === 201 && res.body.user?.tenantId) {
        tenantIds.push(res.body.user.tenantId);
      }
    }

    const created  = results.filter((r) => r.res.status === 201).length;
    const conflict = results.filter((r) => r.res.status === 409).length;

    // No 500s
    for (const { res } of results) {
      expect(res.status).not.toBe(500);
    }

    expect(created).toBe(1);
    expect(conflict).toBe(4);
  });
});

// ---------------------------------------------------------------------------
// Test 5: Payroll run concurrency
// ---------------------------------------------------------------------------

describe('Test 5: Payroll run concurrency — non-overlapping periods', () => {
  let tenantId: string;
  let cookie: string[];

  beforeAll(async () => {
    const employer = await createTestEmployer('t5');
    tenantId = employer.tenantId;
    cookie   = employer.cookie;

    // Need at least one active employee to run payroll
    await Promise.all([
      createTestEmployee(cookie, 't5-e1'),
      createTestEmployee(cookie, 't5-e2'),
      createTestEmployee(cookie, 't5-e3'),
      createTestEmployee(cookie, 't5-e4'),
      createTestEmployee(cookie, 't5-e5'),
    ]);
  });

  afterAll(async () => { await cleanupTestData(tenantId); });

  it('3 simultaneous payroll runs with non-overlapping periods all succeed', async () => {
    const periods = [
      { periodStart: '2024-01-01', periodEnd: '2024-01-31' },
      { periodStart: '2024-02-01', periodEnd: '2024-02-29' },
      { periodStart: '2024-03-01', periodEnd: '2024-03-31' },
    ];

    const results = await Promise.all(
      periods.map((period) =>
        timedRequest(() =>
          request
            .post('/api/v1/payroll')
            .set('Cookie', cookie)
            .send(period)
        )
      )
    );

    const times    = results.map((r) => r.ms);
    const statuses = countByStatus(results.map((r) => r.res));
    logTiming('Test5:concurrent-payroll', times);
    console.log('[Test5] status counts:', statuses);

    for (const { res } of results) {
      expect(res.status).toBe(201);
    }

    // Verify exactly 3 payroll runs exist
    const listRes = await request.get('/api/v1/payroll').set('Cookie', cookie);
    expect(listRes.status).toBe(200);
    expect(listRes.body).toHaveLength(3);
  });
});

// ---------------------------------------------------------------------------
// Test 6: Leave request flood
// ---------------------------------------------------------------------------

describe('Test 6: Leave request flood — 20 concurrent requests', () => {
  let tenantId: string;
  let employerCookie: string[];
  let employeeCookie: string[];

  beforeAll(async () => {
    const employer = await createTestEmployer('t6');
    tenantId      = employer.tenantId;
    employerCookie = employer.cookie;

    // Create one employee
    await createTestEmployee(employerCookie, 't6-emp1');

    // Log in as the employee to obtain their session cookie
    employeeCookie = await loginAsEmployee('employee-t6-emp1@test-champs.com');
  });

  afterAll(async () => { await cleanupTestData(tenantId); });

  it('20 concurrent leave requests all return 201', async () => {
    const results = await Promise.all(
      Array.from({ length: 20 }, (_, i) =>
        timedRequest(() =>
          request
            .post('/api/v1/leave')
            .set('Cookie', employeeCookie)
            .send({
              leaveType:     'annual',
              startDate:     '2025-01-01',
              endDate:       '2025-01-05',
              daysRequested: 5,
              reason:        `Flood test leave ${i}`,
            })
        )
      )
    );

    const times    = results.map((r) => r.ms);
    const statuses = countByStatus(results.map((r) => r.res));
    logTiming('Test6:leave-flood', times);
    console.log('[Test6] status counts:', statuses);

    for (const { res } of results) {
      expect(res.status).toBe(201);
    }

    // Employer should see all 20
    const listRes = await request.get('/api/v1/leave').set('Cookie', employerCookie);
    expect(listRes.status).toBe(200);
    expect(listRes.body).toHaveLength(20);
  });
});

// ---------------------------------------------------------------------------
// Test 7: Stats endpoint under load — correctness
// ---------------------------------------------------------------------------

describe('Test 7: Stats endpoint — correctness under concurrency', () => {
  let tenantId: string;
  let cookie: string[];

  beforeAll(async () => {
    const employer = await createTestEmployer('t7');
    tenantId = employer.tenantId;
    cookie   = employer.cookie;

    // Create 7 employees total; we'll mark 2 as on_leave after creation
    const employees = await Promise.all(
      Array.from({ length: 7 }, (_, i) =>
        createTestEmployee(cookie, `t7-e${i}`)
      )
    );

    // Mark employees 5 and 6 as on_leave via direct DB update
    // (no public API for status change, so use the pool from setup)
    const pool = (await import('../../src/db')).default;
    await pool.query(
      `UPDATE employees SET employment_status = 'on_leave'
       WHERE id = ANY($1::uuid[])`,
      [[employees[5].id, employees[6].id]],
    );
  });

  afterAll(async () => { await cleanupTestData(tenantId); });

  it('20 concurrent /stats GETs return consistent employee counts', async () => {
    const results = await Promise.all(
      Array.from({ length: 20 }, () =>
        timedRequest(() =>
          request.get('/api/v1/stats').set('Cookie', cookie)
        )
      )
    );

    const times    = results.map((r) => r.ms);
    const statuses = countByStatus(results.map((r) => r.res));
    logTiming('Test7:stats-concurrency', times);
    console.log('[Test7] status counts:', statuses);

    for (const { res } of results) {
      expect(res.status).toBe(200);
      expect(res.body.employees.total).toBe(7);
      expect(res.body.employees.active).toBe(5);
    }
  });
});

// ---------------------------------------------------------------------------
// Test 8: Rate limit — auth endpoint
// ---------------------------------------------------------------------------

describe('Test 8: Rate limit — auth endpoint under concurrent wrong-credential attempts', () => {
  it('15 concurrent bad logins return only 401 (rate limiter bypassed in test env)', async () => {
    const results = await Promise.all(
      Array.from({ length: 15 }, () =>
        timedRequest(() =>
          request.post('/api/v1/auth/login').send({
            email:    `nonexistent-${Date.now()}@nowhere.com`,
            password: 'WrongPassword1!',
          })
        )
      )
    );

    const times    = results.map((r) => r.ms);
    const statuses = countByStatus(results.map((r) => r.res));
    logTiming('Test8:rate-limit', times);
    console.log('[Test8] status counts:', statuses);

    for (const { res } of results) {
      // In test env (NODE_ENV=test) rate limiter is bypassed — all must be 401
      // In prod these could be 429 (rate limited), but never 500
      expect([401, 429]).toContain(res.status);
      expect(res.status).not.toBe(500);
    }

    // All should be 401 (no rate limiter in test env)
    const unauthorized = results.filter((r) => r.res.status === 401).length;
    expect(unauthorized).toBe(15);
  });
});
