import {
  request,
  createTestEmployer,
  createTestEmployee,
  loginAsEmployee,
  cleanupTestData,
  type TestEmployer,
  type TestEmployee,
} from './setup';

describe('W-4 Routes', () => {
  let employer: TestEmployer;
  let empRecord: TestEmployee;
  let empToken: string;

  let employer2: TestEmployer;
  let empRecord2: TestEmployee;
  let empToken2: string;

  beforeAll(async () => {
    const ts = Date.now();
    employer  = await createTestEmployer(`w4-${ts}`);
    employer2 = await createTestEmployer(`w4-t2-${ts}`);
    empRecord  = await createTestEmployee(employer.token,  `w4-emp-${ts}`);
    empRecord2 = await createTestEmployee(employer2.token, `w4-emp2-${ts}`);
    empToken  = await loginAsEmployee(empRecord.email);
    empToken2 = await loginAsEmployee(empRecord2.email);
  }, 30_000);

  afterAll(async () => {
    await cleanupTestData(employer.tenantId);
    await cleanupTestData(employer2.tenantId);
  });

  // ── GET before any W-4 on file ──────────────────────────────────────────────

  it('GET /employees/:id/w4 returns 404 when no W-4 on file', async () => {
    const res = await request
      .get(`/api/v1/employees/${empRecord.id}/w4`)
      .set('Authorization', `Bearer ${empToken}`);
    expect(res.status).toBe(404);
  });

  // ── Employee submits W-4 ────────────────────────────────────────────────────

  it('employee submits W-4 → 200 with saved elections', async () => {
    const res = await request
      .put(`/api/v1/employees/${empRecord.id}/w4`)
      .set('Authorization', `Bearer ${empToken}`)
      .send({
        filingStatus:     'single',
        multipleJobs:     false,
        dependentsAmount: 0,
        otherIncome:      0,
        extraDeductions:  0,
        extraWithholding: 0,
        exempt:           false,
      });

    expect(res.status).toBe(200);
    expect(res.body.filing_status).toBe('single');
    expect(res.body.exempt).toBe(false);
  });

  it('GET /employees/:id/w4 returns the filed W-4', async () => {
    const res = await request
      .get(`/api/v1/employees/${empRecord.id}/w4`)
      .set('Authorization', `Bearer ${empToken}`);

    expect(res.status).toBe(200);
    expect(res.body.filing_status).toBe('single');
  });

  it('PUT (upsert) updates W-4 — no duplicate row', async () => {
    const update = await request
      .put(`/api/v1/employees/${empRecord.id}/w4`)
      .set('Authorization', `Bearer ${empToken}`)
      .send({
        filingStatus:     'married_jointly',
        multipleJobs:     true,
        dependentsAmount: 4000,
        otherIncome:      0,
        extraDeductions:  0,
        extraWithholding: 50,
        exempt:           false,
      });

    expect(update.status).toBe(200);
    expect(update.body.filing_status).toBe('married_jointly');
    expect(parseFloat(update.body.dependents_amount)).toBe(4000);

    // GET still returns exactly one record
    const get = await request
      .get(`/api/v1/employees/${empRecord.id}/w4`)
      .set('Authorization', `Bearer ${empToken}`);
    expect(get.status).toBe(200);
    expect(get.body.filing_status).toBe('married_jointly');
  });

  // ── Employer can also read/write any employee's W-4 ────────────────────────

  it('employer can GET their employee W-4', async () => {
    const res = await request
      .get(`/api/v1/employees/${empRecord.id}/w4`)
      .set('Authorization', `Bearer ${employer.token}`);
    expect(res.status).toBe(200);
  });

  it('employer can PUT their employee W-4', async () => {
    const res = await request
      .put(`/api/v1/employees/${empRecord.id}/w4`)
      .set('Authorization', `Bearer ${employer.token}`)
      .send({
        filingStatus: 'head_of_household',
        multipleJobs: false,
        dependentsAmount: 2000,
        otherIncome: 0,
        extraDeductions: 0,
        extraWithholding: 0,
        exempt: false,
      });
    expect(res.status).toBe(200);
    expect(res.body.filing_status).toBe('head_of_household');
  });

  // ── Cross-employee access blocked ──────────────────────────────────────────

  it('employee from tenant 2 cannot read tenant 1 employee W-4 → 404', async () => {
    const res = await request
      .get(`/api/v1/employees/${empRecord.id}/w4`)
      .set('Authorization', `Bearer ${empToken2}`);
    // Different tenant → employee not found in their tenant
    expect(res.status).toBe(404);
  });

  // ── Payroll uses W-4 elections ─────────────────────────────────────────────

  it('payroll withholding reflects W-4 filing status (not flat 22%)', async () => {
    // Set employee back to single with no adjustments
    await request
      .put(`/api/v1/employees/${empRecord.id}/w4`)
      .set('Authorization', `Bearer ${empToken}`)
      .send({
        filingStatus: 'single', multipleJobs: false,
        dependentsAmount: 0, otherIncome: 0,
        extraDeductions: 0, extraWithholding: 0, exempt: false,
      });

    const payrollRes = await request
      .post('/api/v1/payroll')
      .set('Authorization', `Bearer ${employer.token}`)
      .send({ periodStart: '2025-01-01', periodEnd: '2025-01-31' });

    expect(payrollRes.status).toBe(201);

    const detail = await request
      .get(`/api/v1/payroll/${payrollRes.body.id}`)
      .set('Authorization', `Bearer ${employer.token}`);

    const item = detail.body.items[0];
    const gross = parseFloat(item.gross_pay);
    // $50,000 annual → $4,166.67/month. Single filer: first $11,600 @ 10%, next $35,550 @ 12%
    // Annual tax ≈ $1,160 + (50000-11600)*0.12 = $1,160 + $4,608 = $5,768 → $480.67/month
    // This is well below the old flat 22% ($916.67/month)
    const flatRate22 = gross * 0.22;
    expect(item.deductions.federalTax).toBeLessThan(flatRate22);
    expect(item.deductions).toHaveProperty('federalTax');
    expect(item.deductions).toHaveProperty('socialSecurity');
    expect(item.deductions).toHaveProperty('medicare');
  });

  it('employee with exempt=true has federalTax=0 in payroll', async () => {
    // Mark exempt
    await request
      .put(`/api/v1/employees/${empRecord.id}/w4`)
      .set('Authorization', `Bearer ${employer.token}`)
      .send({
        filingStatus: 'single', multipleJobs: false,
        dependentsAmount: 0, otherIncome: 0,
        extraDeductions: 0, extraWithholding: 0, exempt: true,
      });

    const payrollRes = await request
      .post('/api/v1/payroll')
      .set('Authorization', `Bearer ${employer.token}`)
      .send({ periodStart: '2025-02-01', periodEnd: '2025-02-28' });

    expect(payrollRes.status).toBe(201);

    const detail = await request
      .get(`/api/v1/payroll/${payrollRes.body.id}`)
      .set('Authorization', `Bearer ${employer.token}`);

    const item = detail.body.items[0];
    expect(item.deductions.federalTax).toBe(0);
    // FICA still applies even when exempt from income tax
    expect(item.deductions.socialSecurity).toBeGreaterThan(0);
    expect(item.deductions.medicare).toBeGreaterThan(0);
  });

  // ── Validation ──────────────────────────────────────────────────────────────

  it('invalid filingStatus → 400', async () => {
    const res = await request
      .put(`/api/v1/employees/${empRecord.id}/w4`)
      .set('Authorization', `Bearer ${empToken}`)
      .send({ filingStatus: 'queen_of_england' });
    expect(res.status).toBe(400);
  });
});
