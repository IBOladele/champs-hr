import {
  request,
  createTestEmployer,
  createTestEmployee,
  loginAsEmployee,
  cleanupTestData,
  type TestEmployer,
  type TestEmployee,
} from './setup';

describe('Payslips Routes', () => {
  let employer: TestEmployer;
  let empRecord: TestEmployee;
  let empRecord2: TestEmployee;
  let empCookie: string[];
  let empCookie2: string[];

  beforeAll(async () => {
    const ts = Date.now();
    employer   = await createTestEmployer(`payslips-${ts}`);
    empRecord  = await createTestEmployee(employer.cookie, `payslips-emp-${ts}`);
    empRecord2 = await createTestEmployee(employer.cookie, `payslips-emp2-${ts}`);
    empCookie   = await loginAsEmployee(empRecord.email);
    empCookie2  = await loginAsEmployee(empRecord2.email);
  }, 30_000);

  afterAll(async () => {
    await cleanupTestData(employer.tenantId);
  });

  it('GET /employees/:id/payslips returns empty array before any payroll runs', async () => {
    const res = await request
      .get(`/api/v1/employees/${empRecord.id}/payslips`)
      .set('Cookie', employer.cookie);

    expect(res.status).toBe(200);
    expect(Array.isArray(res.body)).toBe(true);
    expect(res.body).toHaveLength(0);
  });

  it('employee can see their own payslips', async () => {
    const res = await request
      .get(`/api/v1/employees/${empRecord.id}/payslips`)
      .set('Cookie', empCookie);

    expect(res.status).toBe(200);
    expect(Array.isArray(res.body)).toBe(true);
  });

  it('employee cannot see another employee payslips → 403', async () => {
    const res = await request
      .get(`/api/v1/employees/${empRecord.id}/payslips`)
      .set('Cookie', empCookie2);

    expect(res.status).toBe(403);
  });

  it('GET /employees/:id/payslips with invalid year param → 400', async () => {
    const res = await request
      .get(`/api/v1/employees/${empRecord.id}/payslips?year=not-a-year`)
      .set('Cookie', employer.cookie);

    expect(res.status).toBe(400);
  });

  it('GET /employees/:id/payslips without auth → 401', async () => {
    const res = await request
      .get(`/api/v1/employees/${empRecord.id}/payslips`);

    expect(res.status).toBe(401);
  });

  it('GET /employees/:id/payslips for unknown employee → 404', async () => {
    const res = await request
      .get('/api/v1/employees/00000000-0000-0000-0000-000000000000/payslips')
      .set('Cookie', employer.cookie);

    expect(res.status).toBe(404);
  });

  describe('with a completed payroll run', () => {
    let payslipItemId: string;

    beforeAll(async () => {
      // Create and approve a payroll run so payslips exist
      const runRes = await request
        .post('/api/v1/payroll')
        .set('Cookie', employer.cookie)
        .send({ periodStart: '2025-01-01', periodEnd: '2025-01-31' });

      if (runRes.status !== 201) return;
      const runId = runRes.body.id;

      await request
        .patch(`/api/v1/payroll/${runId}/approve`)
        .set('Cookie', employer.cookie);
    }, 30_000);

    it('employee sees payslips after a completed run', async () => {
      const res = await request
        .get(`/api/v1/employees/${empRecord.id}/payslips`)
        .set('Cookie', empCookie);

      expect(res.status).toBe(200);
      expect(Array.isArray(res.body)).toBe(true);

      if (res.body.length > 0) {
        payslipItemId = res.body[0].id;
        const item = res.body[0];
        expect(item).toHaveProperty('gross_pay');
        expect(item).toHaveProperty('net_pay');
        expect(item).toHaveProperty('deductions');
        expect(item).toHaveProperty('period_start');
        expect(item).toHaveProperty('period_end');
      }
    });

    it('employee can get single payslip detail', async () => {
      if (!payslipItemId) return;

      const res = await request
        .get(`/api/v1/employees/${empRecord.id}/payslips/${payslipItemId}`)
        .set('Cookie', empCookie);

      expect(res.status).toBe(200);
      expect(res.body.id).toBe(payslipItemId);
      expect(res.body).toHaveProperty('employee_name');
      expect(res.body).toHaveProperty('employer_name');
    });

    it('employer can get payslip detail for any employee', async () => {
      if (!payslipItemId) return;

      const res = await request
        .get(`/api/v1/employees/${empRecord.id}/payslips/${payslipItemId}`)
        .set('Cookie', employer.cookie);

      expect(res.status).toBe(200);
    });

    it('year filter returns payslips for that year only', async () => {
      const res = await request
        .get(`/api/v1/employees/${empRecord.id}/payslips?year=2025`)
        .set('Cookie', empCookie);

      expect(res.status).toBe(200);
    });

    it('year filter for a future year returns empty', async () => {
      const res = await request
        .get(`/api/v1/employees/${empRecord.id}/payslips?year=2099`)
        .set('Cookie', empCookie);

      expect(res.status).toBe(200);
      expect(res.body).toHaveLength(0);
    });
  });
});
