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

describe('Attendance Workflow (functional)', () => {
  let employer: TestEmployer;
  let empA: TestEmployee;
  let empB: TestEmployee;
  let empAToken: string;
  let empBToken: string;

  // Second tenant for cross-tenant isolation test
  let employer2: TestEmployer;
  let empC: TestEmployee;
  let empCToken: string;

  beforeAll(async () => {
    const suffix = `aw-${Date.now()}`;
    employer = await createTestEmployer(`functional-attendance-${suffix}`);
    employer2 = await createTestEmployer(`functional-attendance-t2-${suffix}`);

    empA = await createTestEmployee(employer.token, `aw-a-${suffix}`);
    empB = await createTestEmployee(employer.token, `aw-b-${suffix}`);
    empC = await createTestEmployee(employer2.token, `aw-c-${suffix}`);

    empAToken = await loginAsEmployee(empA.email);
    empBToken = await loginAsEmployee(empB.email);
    empCToken = await loginAsEmployee(empC.email);
  });

  afterAll(async () => {
    await cleanupTestData(employer.tenantId);
    await cleanupTestData(employer2.tenantId);
  });

  it("employee clocks in → GET /attendance shows today's record with clock_in set, clock_out null, status=present", async () => {
    const clockRes = await request
      .post('/api/v1/attendance/clock-in')
      .set('Authorization', `Bearer ${empAToken}`);

    expect(clockRes.status).toBe(200);

    const today = new Date().toISOString().slice(0, 10);

    const listRes = await request
      .get('/api/v1/attendance')
      .set('Authorization', `Bearer ${empAToken}`);

    expect(listRes.status).toBe(200);
    const todayRecord = (listRes.body as Array<{ date: string; clock_in: string; clock_out: string | null; status: string }>).find(
      (r) => r.date.startsWith(today)
    );

    expect(todayRecord).toBeDefined();
    expect(todayRecord!.clock_in).toBeTruthy();
    expect(todayRecord!.clock_out).toBeNull();
    expect(todayRecord!.status).toBe('present');
  });

  it('employee clocks in again same day → upsert, NOT a duplicate row', async () => {
    const today = new Date().toISOString().slice(0, 10);

    // Clock in a second time
    const clockRes = await request
      .post('/api/v1/attendance/clock-in')
      .set('Authorization', `Bearer ${empAToken}`);
    expect(clockRes.status).toBe(200);

    // Query the DB directly to count rows
    const countRes = await pool.query(
      `SELECT COUNT(*) AS cnt FROM attendance_records
       WHERE employee_id = $1 AND date = $2`,
      [empA.id, today]
    );
    expect(parseInt(countRes.rows[0].cnt, 10)).toBe(1);
  });

  it('employee clocks out → same record now has clock_out set', async () => {
    const clockOutRes = await request
      .post('/api/v1/attendance/clock-out')
      .set('Authorization', `Bearer ${empAToken}`);

    expect(clockOutRes.status).toBe(200);
    expect(clockOutRes.body.clock_out).toBeTruthy();
    expect(clockOutRes.body.clock_in).toBeTruthy();
  });

  it("clock-in stores today's date, not a past or future date", async () => {
    // Clock in again to refresh (re-upsert) with today
    await request
      .post('/api/v1/attendance/clock-in')
      .set('Authorization', `Bearer ${empAToken}`);

    const today = new Date().toISOString().slice(0, 10);

    const listRes = await request
      .get('/api/v1/attendance')
      .set('Authorization', `Bearer ${empAToken}`);

    const todayRecord = (listRes.body as Array<{ date: string }>).find(
      (r) => r.date.startsWith(today)
    );
    expect(todayRecord).toBeDefined();
    expect(todayRecord!.date.startsWith(today)).toBe(true);
  });

  it('employer views GET /attendance → sees employee A records', async () => {
    const res = await request
      .get('/api/v1/attendance')
      .set('Authorization', `Bearer ${employer.token}`);

    expect(res.status).toBe(200);
    const employeeIds = (res.body as Array<{ employee_id: string }>).map((r) => r.employee_id);
    expect(employeeIds).toContain(empA.id);
  });

  it('employee views GET /attendance → only sees own records, not other employees', async () => {
    // Clock in empB so there is a record for empB
    await request
      .post('/api/v1/attendance/clock-in')
      .set('Authorization', `Bearer ${empBToken}`);

    const res = await request
      .get('/api/v1/attendance')
      .set('Authorization', `Bearer ${empAToken}`);

    expect(res.status).toBe(200);
    const employeeIds = (res.body as Array<{ employee_id: string }>).map((r) => r.employee_id);
    // empA's records should be present
    for (const eid of employeeIds) {
      expect(eid).toBe(empA.id);
    }
    // empB's records must not appear
    expect(employeeIds).not.toContain(empB.id);
  });

  it('second employee from same tenant clocks in → both records visible to employer', async () => {
    const res = await request
      .get('/api/v1/attendance')
      .set('Authorization', `Bearer ${employer.token}`);

    expect(res.status).toBe(200);
    const employeeIds = (res.body as Array<{ employee_id: string }>).map((r) => r.employee_id);
    expect(employeeIds).toContain(empA.id);
    expect(employeeIds).toContain(empB.id);
  });

  it("employee from different tenant clocks in → NOT visible to first tenant's employer", async () => {
    // Clock in empC (tenant 2)
    await request
      .post('/api/v1/attendance/clock-in')
      .set('Authorization', `Bearer ${empCToken}`);

    // Tenant 1 employer fetches attendance
    const res = await request
      .get('/api/v1/attendance')
      .set('Authorization', `Bearer ${employer.token}`);

    expect(res.status).toBe(200);
    const employeeIds = (res.body as Array<{ employee_id: string }>).map((r) => r.employee_id);
    expect(employeeIds).not.toContain(empC.id);
  });
});
