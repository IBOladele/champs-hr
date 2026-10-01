import {
  request,
  createTestEmployer,
  createTestEmployee,
  loginAsEmployee,
  cleanupTestData,
  type TestEmployer,
} from './setup';

describe('Stats Routes', () => {
  let employer: TestEmployer;
  let employeeCookie: string[];

  beforeAll(async () => {
    const ts = Date.now();
    employer = await createTestEmployer(`stats-${ts}`);
    const emp = await createTestEmployee(employer.cookie, `stats-emp-${ts}`);
    employeeCookie = await loginAsEmployee(emp.email);
  }, 30_000);

  afterAll(async () => {
    await cleanupTestData(employer.tenantId);
  });

  it('GET /stats returns aggregate stats for employer', async () => {
    const res = await request
      .get('/api/v1/stats')
      .set('Cookie', employer.cookie);

    expect(res.status).toBe(200);
    expect(res.body).toHaveProperty('employees');
    expect(res.body).toHaveProperty('leave');
    expect(res.body).toHaveProperty('payroll');
    expect(res.body).toHaveProperty('attendance');
    expect(typeof res.body.employees.total).toBe('number');
    expect(typeof res.body.employees.active).toBe('number');
    expect(typeof res.body.leave.pendingRequests).toBe('number');
    expect(typeof res.body.payroll.totalRuns).toBe('number');
    expect(typeof res.body.attendance.today.present).toBe('number');
  });

  it('GET /stats reflects the employee we created', async () => {
    const res = await request
      .get('/api/v1/stats')
      .set('Cookie', employer.cookie);

    expect(res.status).toBe(200);
    expect(res.body.employees.total).toBeGreaterThanOrEqual(1);
  });

  it('GET /stats requires employer role → 403 for employee', async () => {
    const res = await request
      .get('/api/v1/stats')
      .set('Cookie', employeeCookie);

    expect(res.status).toBe(403);
  });

  it('GET /stats requires auth → 401 without token', async () => {
    const res = await request.get('/api/v1/stats');
    expect(res.status).toBe(401);
  });
});
