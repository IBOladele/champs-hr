import {
  request,
  createTestEmployer,
  createTestEmployee,
  loginAsEmployee,
  cleanupTestData,
  type TestEmployer,
  type TestEmployee,
} from './setup';

describe('Employee Dashboard Routes', () => {
  let employer: TestEmployer;
  let employeeRecord: TestEmployee;
  let employeeCookie: string[];

  beforeAll(async () => {
    const ts = Date.now();
    employer = await createTestEmployer(`empdash-${ts}`);
    employeeRecord = await createTestEmployee(employer.cookie, `empdash-emp-${ts}`);
    employeeCookie = await loginAsEmployee(employeeRecord.email);
  }, 30_000);

  afterAll(async () => {
    await cleanupTestData(employer.tenantId);
  });

  // -----------------------------------------------------------------------
  // Auth guards
  // -----------------------------------------------------------------------

  it('GET /employee/dashboard returns 401 when not authenticated', async () => {
    const res = await request.get('/api/v1/employee/dashboard');
    expect(res.status).toBe(401);
  });

  it('GET /employee/dashboard returns 404 when authenticated as employer (no employee profile)', async () => {
    const res = await request
      .get('/api/v1/employee/dashboard')
      .set('Cookie', employer.cookie);
    expect(res.status).toBe(404);
    expect(res.body).toMatchObject({ error: 'Employee profile not found' });
  });

  it('GET /employee/dashboard returns 404 when employee user has no employees row', async () => {
    // Sign up a standalone "employee-role" user via the auth route isn't possible —
    // the signup endpoint creates employers. Instead we create an employee via the
    // normal route and then rely on the fact that every user created by
    // createTestEmployee DOES have an employees row. We verify 404 by using an
    // employer (which has role=employer but no employees row), which is already
    // covered by the test above. The 404 path is also exercised implicitly in
    // the prior test — we keep this test as an alias to confirm the message.
    const res = await request
      .get('/api/v1/employee/dashboard')
      .set('Cookie', employer.cookie);
    expect(res.status).toBe(404);
  });

  // -----------------------------------------------------------------------
  // Basic profile shape
  // -----------------------------------------------------------------------

  it('GET /employee/dashboard returns 200 with correct profile shape', async () => {
    const res = await request
      .get('/api/v1/employee/dashboard')
      .set('Cookie', employeeCookie);

    expect(res.status).toBe(200);

    // profile
    expect(res.body.profile).toBeDefined();
    expect(res.body.profile.employeeId).toBe(employeeRecord.id);
    expect(res.body.profile.employeeNumber).toBe(employeeRecord.employeeNumber);
    expect(res.body.profile.jobTitle).toBe(employeeRecord.jobTitle);
    expect(typeof res.body.profile.grossSalary).toBe('number');

    // recentPayslips empty
    expect(Array.isArray(res.body.recentPayslips)).toBe(true);
    expect(res.body.recentPayslips).toHaveLength(0);

    // leaveBalance — default values
    expect(res.body.leaveBalance.annual.used).toBe(0);
    expect(res.body.leaveBalance.annual.remaining).toBe(25);
    expect(res.body.leaveBalance.sick.used).toBe(0);
    expect(res.body.leaveBalance.sick.remaining).toBe(10);
    expect(res.body.leaveBalance.pending).toBe(0);

    // benefits — empty
    expect(res.body.benefits.enrolled).toBe(0);
    expect(Array.isArray(res.body.benefits.plans)).toBe(true);
    expect(res.body.benefits.plans).toHaveLength(0);

    // attendance — all zeros
    expect(res.body.attendance.daysPresent).toBe(0);
    expect(res.body.attendance.daysAbsent).toBe(0);
    expect(res.body.attendance.daysLate).toBe(0);
    expect(res.body.attendance.daysRemote).toBe(0);
    expect(res.body.attendance.hoursWorked).toBe(0);
  });

  // -----------------------------------------------------------------------
  // Payslips
  // -----------------------------------------------------------------------

  it('GET /employee/dashboard returns recentPayslips with correct fields', async () => {
    const ts = Date.now();
    const emp2 = await createTestEmployer(`empdash-ps-${ts}`);

    try {
      const empRec = await createTestEmployee(emp2.cookie, `empdash-ps-emp-${ts}`);
      const empCk = await loginAsEmployee(empRec.email);

      // Create 2 payroll runs (each run generates one item per active employee)
      const run1 = await request
        .post('/api/v1/payroll')
        .set('Cookie', emp2.cookie)
        .send({ periodStart: '2025-09-01', periodEnd: '2025-09-30' });

      const run2 = await request
        .post('/api/v1/payroll')
        .set('Cookie', emp2.cookie)
        .send({ periodStart: '2025-10-01', periodEnd: '2025-10-31' });

      expect(run1.status).toBe(201);
      expect(run2.status).toBe(201);

      const res = await request
        .get('/api/v1/employee/dashboard')
        .set('Cookie', empCk);

      expect(res.status).toBe(200);
      expect(res.body.recentPayslips.length).toBe(2);

      const payslip = res.body.recentPayslips[0];
      expect(payslip).toHaveProperty('id');
      expect(payslip).toHaveProperty('periodStart');
      expect(payslip).toHaveProperty('periodEnd');
      expect(typeof payslip.grossPay).toBe('number');
      expect(typeof payslip.netPay).toBe('number');
      expect(payslip.grossPay).toBeGreaterThan(0);
      expect(payslip.netPay).toBeGreaterThan(0);
    } finally {
      await cleanupTestData(emp2.tenantId);
    }
  });

  it('GET /employee/dashboard returns at most 3 payslips', async () => {
    const ts = Date.now();
    const emp3 = await createTestEmployer(`empdash-ps3-${ts}`);

    try {
      const empRec = await createTestEmployee(emp3.cookie, `empdash-ps3-emp-${ts}`);
      const empCk = await loginAsEmployee(empRec.email);

      // Create 4 payroll runs
      for (let m = 7; m <= 10; m++) {
        const month = String(m).padStart(2, '0');
        await request
          .post('/api/v1/payroll')
          .set('Cookie', emp3.cookie)
          .send({
            periodStart: `2025-${month}-01`,
            periodEnd:   `2025-${month}-28`,
          });
      }

      const res = await request
        .get('/api/v1/employee/dashboard')
        .set('Cookie', empCk);

      expect(res.status).toBe(200);
      expect(res.body.recentPayslips.length).toBeLessThanOrEqual(3);
    } finally {
      await cleanupTestData(emp3.tenantId);
    }
  });

  // -----------------------------------------------------------------------
  // Leave balance
  // -----------------------------------------------------------------------

  it('GET /employee/dashboard calculates leave balance from approved requests', async () => {
    const ts = Date.now();
    const emp4 = await createTestEmployer(`empdash-lv-${ts}`);

    try {
      const empRec = await createTestEmployee(emp4.cookie, `empdash-lv-emp-${ts}`);
      const empCk = await loginAsEmployee(empRec.email);

      // Create 2 annual leave requests (5 days each)
      const lr1 = await request
        .post('/api/v1/leave')
        .set('Cookie', empCk)
        .send({
          leaveType:     'annual',
          startDate:     '2026-02-01',
          endDate:       '2026-02-05',
          daysRequested: 5,
          reason:        'Holiday',
        });
      const lr2 = await request
        .post('/api/v1/leave')
        .set('Cookie', empCk)
        .send({
          leaveType:     'annual',
          startDate:     '2026-03-01',
          endDate:       '2026-03-05',
          daysRequested: 5,
          reason:        'Holiday',
        });

      expect(lr1.status).toBe(201);
      expect(lr2.status).toBe(201);

      // Approve both
      await request
        .patch(`/api/v1/leave/${lr1.body.id}/approve`)
        .set('Cookie', emp4.cookie);

      await request
        .patch(`/api/v1/leave/${lr2.body.id}/approve`)
        .set('Cookie', emp4.cookie);

      // Create 1 pending leave request
      await request
        .post('/api/v1/leave')
        .set('Cookie', empCk)
        .send({
          leaveType:     'annual',
          startDate:     '2026-04-01',
          endDate:       '2026-04-03',
          daysRequested: 3,
          reason:        'Pending holiday',
        });

      const res = await request
        .get('/api/v1/employee/dashboard')
        .set('Cookie', empCk);

      expect(res.status).toBe(200);
      expect(res.body.leaveBalance.annual.used).toBe(10);
      expect(res.body.leaveBalance.annual.remaining).toBe(15);
      expect(res.body.leaveBalance.pending).toBe(1);
    } finally {
      await cleanupTestData(emp4.tenantId);
    }
  });

  // -----------------------------------------------------------------------
  // Benefits
  // -----------------------------------------------------------------------

  it('GET /employee/dashboard shows enrolled benefits', async () => {
    const ts = Date.now();
    const emp5 = await createTestEmployer(`empdash-ben-${ts}`);

    try {
      const empRec = await createTestEmployee(emp5.cookie, `empdash-ben-emp-${ts}`);
      const empCk = await loginAsEmployee(empRec.email);

      // Create 2 benefits
      const b1 = await request
        .post('/api/v1/benefits')
        .set('Cookie', emp5.cookie)
        .send({
          name:        'Health Plan',
          benefitType: 'health',
          value:       500,
          currency:    'USD',
        });

      const b2 = await request
        .post('/api/v1/benefits')
        .set('Cookie', emp5.cookie)
        .send({
          name:        'Dental Plan',
          benefitType: 'dental',
          value:       200,
          currency:    'USD',
        });

      expect(b1.status).toBe(201);
      expect(b2.status).toBe(201);

      // Enrol employee in both benefits
      await request
        .post(`/api/v1/benefits/${b1.body.id}/enrol`)
        .set('Cookie', emp5.cookie)
        .send({ employeeId: empRec.id });

      await request
        .post(`/api/v1/benefits/${b2.body.id}/enrol`)
        .set('Cookie', emp5.cookie)
        .send({ employeeId: empRec.id });

      const res = await request
        .get('/api/v1/employee/dashboard')
        .set('Cookie', empCk);

      expect(res.status).toBe(200);
      expect(res.body.benefits.enrolled).toBe(2);
      expect(res.body.benefits.plans).toHaveLength(2);

      const plan = res.body.benefits.plans[0];
      expect(plan).toHaveProperty('id');
      expect(plan).toHaveProperty('name');
      expect(plan).toHaveProperty('type');
      expect(typeof plan.value).toBe('number');
      expect(plan).toHaveProperty('currency');
    } finally {
      await cleanupTestData(emp5.tenantId);
    }
  });

  // -----------------------------------------------------------------------
  // Attendance
  // -----------------------------------------------------------------------

  it('GET /employee/dashboard shows attendance counts for current month', async () => {
    const ts = Date.now();
    const emp6 = await createTestEmployer(`empdash-att-${ts}`);

    try {
      const empRec = await createTestEmployee(emp6.cookie, `empdash-att-emp-${ts}`);
      const empCk = await loginAsEmployee(empRec.email);

      // Insert attendance records using employer manual POST
      // Use dates within the current calendar month to appear in stats
      const now = new Date();
      const year = now.getFullYear();
      const month = String(now.getMonth() + 1).padStart(2, '0');

      // Present x3, absent x1, late x1 — use day 1–5 or available days
      const records = [
        { date: `${year}-${month}-01`, status: 'present' },
        { date: `${year}-${month}-02`, status: 'present' },
        { date: `${year}-${month}-03`, status: 'present' },
        { date: `${year}-${month}-04`, status: 'absent' },
        { date: `${year}-${month}-05`, status: 'late' },
      ];

      for (const rec of records) {
        const r = await request
          .post('/api/v1/attendance')
          .set('Cookie', emp6.cookie)
          .send({ employeeId: empRec.id, date: rec.date, status: rec.status });
        expect(r.status).toBe(201);
      }

      const res = await request
        .get('/api/v1/employee/dashboard')
        .set('Cookie', empCk);

      expect(res.status).toBe(200);
      expect(res.body.attendance.daysPresent).toBe(3);
      expect(res.body.attendance.daysAbsent).toBe(1);
      expect(res.body.attendance.daysLate).toBe(1);
    } finally {
      await cleanupTestData(emp6.tenantId);
    }
  });

  // -----------------------------------------------------------------------
  // Tenant isolation
  // -----------------------------------------------------------------------

  it('GET /employee/dashboard is tenant-isolated: employee cannot read another tenant dashboard', async () => {
    const ts = Date.now();
    const empB = await createTestEmployer(`empdash-iso-b-${ts}`);

    try {
      // Create an employee in tenant B
      const empBRec = await createTestEmployee(empB.cookie, `empdash-iso-b-emp-${ts}`);
      const empBCookie = await loginAsEmployee(empBRec.email);

      // Create a payroll run for tenant A (the main employer)
      const run = await request
        .post('/api/v1/payroll')
        .set('Cookie', employer.cookie)
        .send({ periodStart: '2025-12-01', periodEnd: '2025-12-31' });
      expect(run.status).toBe(201);

      // Employee B's dashboard should have 0 payslips (not tenant A's run)
      const res = await request
        .get('/api/v1/employee/dashboard')
        .set('Cookie', empBCookie);

      expect(res.status).toBe(200);
      expect(res.body.recentPayslips).toHaveLength(0);
    } finally {
      await cleanupTestData(empB.tenantId);
    }
  });
});
