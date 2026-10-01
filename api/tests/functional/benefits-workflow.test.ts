import pool from '../../src/db';
import {
  request,
  createTestEmployer,
  createTestEmployee,
  loginAsEmployee,
  cleanupTestData,
  TestEmployer,
  TestEmployee,
} from '../setup';

describe('Benefits Workflow (functional)', () => {
  let employer: TestEmployer;
  let empA: TestEmployee;
  let empB: TestEmployee;
  let empAToken: string;

  let healthId: string;
  let pensionId: string;
  let transportId: string;

  beforeAll(async () => {
    const suffix = `bw-${Date.now()}`;
    employer = await createTestEmployer(`functional-benefits-${suffix}`);

    empA = await createTestEmployee(employer.token, `bw-a-${suffix}`);
    empB = await createTestEmployee(employer.token, `bw-b-${suffix}`);

    empAToken = await loginAsEmployee(empA.email);

    // Create 3 benefit plans
    const healthRes = await request
      .post('/api/v1/benefits')
      .set('Authorization', `Bearer ${employer.token}`)
      .send({ name: 'Health Insurance', benefitType: 'health', value: 500, currency: 'GBP' });
    expect(healthRes.status).toBe(201);
    healthId = healthRes.body.id;

    const pensionRes = await request
      .post('/api/v1/benefits')
      .set('Authorization', `Bearer ${employer.token}`)
      .send({ name: 'Pension Plan', benefitType: 'pension', value: 300, currency: 'GBP' });
    expect(pensionRes.status).toBe(201);
    pensionId = pensionRes.body.id;

    const transportRes = await request
      .post('/api/v1/benefits')
      .set('Authorization', `Bearer ${employer.token}`)
      .send({ name: 'Transport Allowance', benefitType: 'transport', value: 150, currency: 'GBP' });
    expect(transportRes.status).toBe(201);
    transportId = transportRes.body.id;
  });

  afterAll(async () => {
    await cleanupTestData(employer.tenantId);
  });

  it('employer enrols employee A in health + pension', async () => {
    const healthEnrol = await request
      .post(`/api/v1/benefits/${healthId}/enrol`)
      .set('Authorization', `Bearer ${employer.token}`)
      .send({ employeeId: empA.id });
    expect(healthEnrol.status).toBe(201);

    const pensionEnrol = await request
      .post(`/api/v1/benefits/${pensionId}/enrol`)
      .set('Authorization', `Bearer ${employer.token}`)
      .send({ employeeId: empA.id });
    expect(pensionEnrol.status).toBe(201);
  });

  it('employer enrols employee B in all 3 benefits', async () => {
    for (const benefitId of [healthId, pensionId, transportId]) {
      const res = await request
        .post(`/api/v1/benefits/${benefitId}/enrol`)
        .set('Authorization', `Bearer ${employer.token}`)
        .send({ employeeId: empB.id });
      expect(res.status).toBe(201);
    }
  });

  it('employee A logs in → GET /benefits shows all 3 plans', async () => {
    const res = await request
      .get('/api/v1/benefits')
      .set('Authorization', `Bearer ${empAToken}`);

    expect(res.status).toBe(200);
    const ids = (res.body as Array<{ id: string }>).map((b) => b.id);
    expect(ids).toContain(healthId);
    expect(ids).toContain(pensionId);
    expect(ids).toContain(transportId);
  });

  it('enrolment record for employee A has enrolled_at set to today', async () => {
    const today = new Date().toISOString().slice(0, 10);

    const result = await pool.query(
      `SELECT enrolled_at FROM employee_benefits
       WHERE employee_id = $1 AND benefit_id = $2`,
      [empA.id, healthId]
    );
    expect(result.rows.length).toBe(1);
    const enrolledAt = result.rows[0].enrolled_at;
    // enrolled_at may be a Date object or string; normalise to ms for comparison.
    // Allow ±1 day tolerance because the DB stores UTC and local date may differ.
    const enrolledMs =
      enrolledAt instanceof Date ? enrolledAt.getTime() : new Date(String(enrolledAt)).getTime();
    const todayMs = new Date(today).getTime();
    expect(Math.abs(enrolledMs - todayMs)).toBeLessThanOrEqual(24 * 60 * 60 * 1000);
  });

  it('employer enrols employee A in health again → idempotent (no duplicate, 200 or 201)', async () => {
    const res = await request
      .post(`/api/v1/benefits/${healthId}/enrol`)
      .set('Authorization', `Bearer ${employer.token}`)
      .send({ employeeId: empA.id });

    // Route uses ON CONFLICT DO UPDATE so always 201; no duplicate row
    expect([200, 201]).toContain(res.status);

    const countRes = await pool.query(
      `SELECT COUNT(*) AS cnt FROM employee_benefits
       WHERE employee_id = $1 AND benefit_id = $2`,
      [empA.id, healthId]
    );
    expect(parseInt(countRes.rows[0].cnt, 10)).toBe(1);
  });

  it('employer tries to enrol non-existent employee → 404', async () => {
    const fakeEmpId = '00000000-0000-0000-0000-000000000001';
    const res = await request
      .post(`/api/v1/benefits/${healthId}/enrol`)
      .set('Authorization', `Bearer ${employer.token}`)
      .send({ employeeId: fakeEmpId });

    expect(res.status).toBe(404);
  });

  it('employer tries to enrol employee in non-existent benefit → 404', async () => {
    const fakeBenefitId = '00000000-0000-0000-0000-000000000002';
    const res = await request
      .post(`/api/v1/benefits/${fakeBenefitId}/enrol`)
      .set('Authorization', `Bearer ${employer.token}`)
      .send({ employeeId: empA.id });

    expect(res.status).toBe(404);
  });

  it('employee A cannot create a benefit plan → 403', async () => {
    const res = await request
      .post('/api/v1/benefits')
      .set('Authorization', `Bearer ${empAToken}`)
      .send({ name: 'Sneaky Benefit', benefitType: 'other', value: 999, currency: 'GBP' });

    expect(res.status).toBe(403);
  });
});
