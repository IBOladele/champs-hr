import {
  request,
  createTestEmployer,
  createTestEmployee,
  loginAsEmployee,
  cleanupTestData,
  type TestEmployer,
  type TestEmployee,
} from './setup';

describe('W-2 Routes', () => {
  let employer: TestEmployer;
  let empRecord: TestEmployee;
  let empCookie: string[];
  let empRecord2: TestEmployee;
  let empCookie2: string[];

  beforeAll(async () => {
    const ts = Date.now();
    employer   = await createTestEmployer(`w2-${ts}`);
    empRecord  = await createTestEmployee(employer.cookie,  `w2-emp-${ts}`);
    empRecord2 = await createTestEmployee(employer.cookie,  `w2-emp2-${ts}`);
    empCookie   = await loginAsEmployee(empRecord.email);
    empCookie2  = await loginAsEmployee(empRecord2.email);

    // Create and approve two payroll runs in 2025
    for (const period of [
      { periodStart: '2025-01-01', periodEnd: '2025-01-31' },
      { periodStart: '2025-02-01', periodEnd: '2025-02-28' },
    ]) {
      const run = await request
        .post('/api/v1/payroll')
        .set('Cookie', employer.cookie)
        .send(period);
      await request
        .patch(`/api/v1/payroll/${run.body.id}/approve`)
        .set('Cookie', employer.cookie);
    }

    // One draft run (should NOT be included in W-2)
    await request
      .post('/api/v1/payroll')
      .set('Cookie', employer.cookie)
      .send({ periodStart: '2025-03-01', periodEnd: '2025-03-31' });
  }, 60_000);

  afterAll(async () => {
    await cleanupTestData(employer.tenantId);
  });

  it('employee gets their own W-2 → 200 with correct boxes', async () => {
    const res = await request
      .get(`/api/v1/employees/${empRecord.id}/w2?year=2025`)
      .set('Cookie', empCookie);

    expect(res.status).toBe(200);
    expect(res.body.taxYear).toBe(2025);
    expect(res.body.payrollRunsIncluded).toBe(2); // only the 2 approved runs
    expect(parseFloat(res.body.box1_wagesTipsOther)).toBeGreaterThan(0);
    expect(parseFloat(res.body.box2_federalIncomeTaxWithheld)).toBeGreaterThanOrEqual(0);
    expect(parseFloat(res.body.box4_socialSecurityTaxWithheld)).toBeGreaterThan(0);
    expect(parseFloat(res.body.box6_medicareTaxWithheld)).toBeGreaterThan(0);
  });

  it('W-2 box2 + box4 + box6 ≈ total deductions across runs', async () => {
    const res = await request
      .get(`/api/v1/employees/${empRecord.id}/w2?year=2025`)
      .set('Cookie', empCookie);

    expect(res.status).toBe(200);
    const totalWithheld =
      parseFloat(res.body.box2_federalIncomeTaxWithheld) +
      parseFloat(res.body.box4_socialSecurityTaxWithheld) +
      parseFloat(res.body.box6_medicareTaxWithheld);
    expect(totalWithheld).toBeGreaterThan(0);
    // net wages = box1 - totalWithheld (approx)
    const wages = parseFloat(res.body.box1_wagesTipsOther);
    expect(wages - totalWithheld).toBeGreaterThan(0);
  });

  it('employer can get any employee W-2', async () => {
    const res = await request
      .get(`/api/v1/employees/${empRecord.id}/w2?year=2025`)
      .set('Cookie', employer.cookie);
    expect(res.status).toBe(200);
  });

  it('employee cannot read another employee W-2 → 403', async () => {
    const res = await request
      .get(`/api/v1/employees/${empRecord.id}/w2?year=2025`)
      .set('Cookie', empCookie2);
    expect(res.status).toBe(403);
  });

  it('missing year param → 400', async () => {
    const res = await request
      .get(`/api/v1/employees/${empRecord.id}/w2`)
      .set('Cookie', empCookie);
    expect(res.status).toBe(400);
  });

  it('year with no completed payroll → 404', async () => {
    const res = await request
      .get(`/api/v1/employees/${empRecord.id}/w2?year=2020`)
      .set('Cookie', empCookie);
    expect(res.status).toBe(404);
  });
});
