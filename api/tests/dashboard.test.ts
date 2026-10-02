import {
  request,
  createTestEmployer,
  createTestEmployee,
  loginAsEmployee,
  cleanupTestData,
  type TestEmployer,
  type TestEmployee,
} from './setup';

describe('Employer Dashboard Routes', () => {
  let employer: TestEmployer;
  let employeeRecord: TestEmployee;
  let employeeCookie: string[];

  beforeAll(async () => {
    const ts = Date.now();
    employer = await createTestEmployer(`dash-${ts}`);
    employeeRecord = await createTestEmployee(employer.cookie, `dash-emp-${ts}`);
    employeeCookie = await loginAsEmployee(employeeRecord.email);
  }, 30_000);

  afterAll(async () => {
    await cleanupTestData(employer.tenantId);
  });

  // -----------------------------------------------------------------------
  // Auth guards
  // -----------------------------------------------------------------------

  it('GET /dashboard returns 401 when not authenticated', async () => {
    const res = await request.get('/api/v1/dashboard');
    expect(res.status).toBe(401);
  });

  it('GET /dashboard returns 403 when authenticated as employee', async () => {
    const res = await request
      .get('/api/v1/dashboard')
      .set('Cookie', employeeCookie);
    expect(res.status).toBe(403);
  });

  // -----------------------------------------------------------------------
  // Basic shape with fresh employer (minimal data)
  // -----------------------------------------------------------------------

  it('GET /dashboard returns 200 with correct shape for a new employer', async () => {
    const ts = Date.now();
    const freshEmployer = await createTestEmployer(`dash-fresh-${ts}`);

    try {
      const res = await request
        .get('/api/v1/dashboard')
        .set('Cookie', freshEmployer.cookie);

      expect(res.status).toBe(200);

      // setup block
      expect(res.body.setup).toBeDefined();
      expect(res.body.setup.step).toBe(0);
      expect(res.body.setup.completed).toBe(false);

      // employees block — all zeros
      expect(res.body.employees.total).toBe(0);
      expect(res.body.employees.active).toBe(0);
      expect(res.body.employees.onLeave).toBe(0);
      expect(res.body.employees.newThisMonth).toBe(0);

      // nextPayroll is null
      expect(res.body.nextPayroll).toBeNull();

      // recentPayrolls empty
      expect(Array.isArray(res.body.recentPayrolls)).toBe(true);
      expect(res.body.recentPayrolls).toHaveLength(0);

      // upcomingStarters empty
      expect(Array.isArray(res.body.upcomingStarters)).toBe(true);
      expect(res.body.upcomingStarters).toHaveLength(0);

      // pendingLeave zero
      expect(res.body.pendingLeave).toBe(0);

      // attendance zeros
      expect(res.body.attendance.present).toBe(0);
      expect(res.body.attendance.late).toBe(0);
      expect(res.body.attendance.absent).toBe(0);
      expect(res.body.attendance.remote).toBe(0);
    } finally {
      await cleanupTestData(freshEmployer.tenantId);
    }
  });

  // -----------------------------------------------------------------------
  // Employee counts
  // -----------------------------------------------------------------------

  it('GET /dashboard reflects correct employee counts by status', async () => {
    const ts = Date.now();
    const emp2 = await createTestEmployer(`dash-counts-${ts}`);

    try {
      // Create 2 active employees
      const e1 = await createTestEmployee(emp2.cookie, `dash-a1-${ts}`);
      const e2 = await createTestEmployee(emp2.cookie, `dash-a2-${ts}`);

      // Create 1 more and set to on_leave
      const e3 = await createTestEmployee(emp2.cookie, `dash-ol-${ts}`);
      await request
        .patch(`/api/v1/employees/${e3.id}`)
        .set('Cookie', emp2.cookie)
        .send({ employmentStatus: 'on_leave' });

      const res = await request
        .get('/api/v1/dashboard')
        .set('Cookie', emp2.cookie);

      expect(res.status).toBe(200);
      expect(res.body.employees.total).toBe(3);
      expect(res.body.employees.active).toBe(2);
      expect(res.body.employees.onLeave).toBe(1);
    } finally {
      await cleanupTestData(emp2.tenantId);
    }
  });

  // -----------------------------------------------------------------------
  // Draft payroll run
  // -----------------------------------------------------------------------

  it('GET /dashboard shows nextPayroll with employeeCount when draft run exists', async () => {
    const ts = Date.now();
    const emp3 = await createTestEmployer(`dash-payroll-${ts}`);

    try {
      // Create 2 active employees so payroll run gets 2 items
      await createTestEmployee(emp3.cookie, `dash-pe1-${ts}`);
      await createTestEmployee(emp3.cookie, `dash-pe2-${ts}`);

      // POST /payroll creates a draft run automatically
      const runRes = await request
        .post('/api/v1/payroll')
        .set('Cookie', emp3.cookie)
        .send({ periodStart: '2025-11-01', periodEnd: '2025-11-30' });

      expect(runRes.status).toBe(201);
      expect(runRes.body.status).toBe('draft');

      const res = await request
        .get('/api/v1/dashboard')
        .set('Cookie', emp3.cookie);

      expect(res.status).toBe(200);
      expect(res.body.nextPayroll).not.toBeNull();
      expect(res.body.nextPayroll.id).toBe(runRes.body.id);
      expect(res.body.nextPayroll.status).toBe('draft');
      expect(res.body.nextPayroll.employeeCount).toBe(2);
    } finally {
      await cleanupTestData(emp3.tenantId);
    }
  });

  // -----------------------------------------------------------------------
  // Upcoming starters
  // -----------------------------------------------------------------------

  it('GET /dashboard shows upcoming starters (today + 30 days) but not past starters', async () => {
    const ts = Date.now();
    const emp4 = await createTestEmployer(`dash-starters-${ts}`);

    try {
      // Employee with start_date 7 days in the future — should appear
      const futureDate = new Date();
      futureDate.setDate(futureDate.getDate() + 7);
      const futureDateStr = futureDate.toISOString().slice(0, 10);

      const futureRes = await request
        .post('/api/v1/employees')
        .set('Cookie', emp4.cookie)
        .send({
          email:          `future-${ts}@test-champs.com`,
          fullName:       'Future Starter',
          jobTitle:       'Engineer',
          employeeNumber: `FUTURE-${ts}`,
          grossSalary:    50000,
          startDate:      futureDateStr,
          employmentType: 'full_time',
          payFrequency:   'monthly',
        });
      expect(futureRes.status).toBe(201);

      // Employee with start_date 30 days in the past — should NOT appear
      const pastDate = new Date();
      pastDate.setDate(pastDate.getDate() - 30);
      const pastDateStr = pastDate.toISOString().slice(0, 10);

      const pastRes = await request
        .post('/api/v1/employees')
        .set('Cookie', emp4.cookie)
        .send({
          email:          `past-${ts}@test-champs.com`,
          fullName:       'Past Starter',
          jobTitle:       'Designer',
          employeeNumber: `PAST-${ts}`,
          grossSalary:    45000,
          startDate:      pastDateStr,
          employmentType: 'full_time',
          payFrequency:   'monthly',
        });
      expect(pastRes.status).toBe(201);

      const res = await request
        .get('/api/v1/dashboard')
        .set('Cookie', emp4.cookie);

      expect(res.status).toBe(200);
      expect(Array.isArray(res.body.upcomingStarters)).toBe(true);

      const starterIds = (res.body.upcomingStarters as Array<{ id: string }>).map(
        (s) => s.id
      );
      expect(starterIds).toContain(futureRes.body.id);
      expect(starterIds).not.toContain(pastRes.body.id);
    } finally {
      await cleanupTestData(emp4.tenantId);
    }
  });

  // -----------------------------------------------------------------------
  // Tenant isolation
  // -----------------------------------------------------------------------

  it('GET /dashboard does not expose data from another tenant', async () => {
    const ts = Date.now();
    const empA = await createTestEmployer(`dash-iso-a-${ts}`);
    const empB = await createTestEmployer(`dash-iso-b-${ts}`);

    try {
      // Create 3 employees for tenant A
      await createTestEmployee(empA.cookie, `dash-iso-ae1-${ts}`);
      await createTestEmployee(empA.cookie, `dash-iso-ae2-${ts}`);
      await createTestEmployee(empA.cookie, `dash-iso-ae3-${ts}`);

      // Employer B should see only their own data (0 employees)
      const res = await request
        .get('/api/v1/dashboard')
        .set('Cookie', empB.cookie);

      expect(res.status).toBe(200);
      expect(res.body.employees.total).toBe(0);
    } finally {
      await cleanupTestData(empA.tenantId);
      await cleanupTestData(empB.tenantId);
    }
  });

  // -----------------------------------------------------------------------
  // Pending leave count
  // -----------------------------------------------------------------------

  it('GET /dashboard reflects pending leave count', async () => {
    const ts = Date.now();
    const emp5 = await createTestEmployer(`dash-leave-${ts}`);

    try {
      const empRec = await createTestEmployee(emp5.cookie, `dash-leave-emp-${ts}`);
      const empCookie = await loginAsEmployee(empRec.email);

      // Create 2 pending leave requests
      await request
        .post('/api/v1/leave')
        .set('Cookie', empCookie)
        .send({
          leaveType:     'annual',
          startDate:     '2026-11-01',
          endDate:       '2026-11-05',
          daysRequested: 5,
          reason:        'Holiday',
        });

      await request
        .post('/api/v1/leave')
        .set('Cookie', empCookie)
        .send({
          leaveType:     'sick',
          startDate:     '2026-11-10',
          endDate:       '2026-11-11',
          daysRequested: 2,
          reason:        'Unwell',
        });

      const res = await request
        .get('/api/v1/dashboard')
        .set('Cookie', emp5.cookie);

      expect(res.status).toBe(200);
      expect(res.body.pendingLeave).toBe(2);
    } finally {
      await cleanupTestData(emp5.tenantId);
    }
  });
});
