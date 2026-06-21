/**
 * Tenant Isolation Tests
 *
 * These are the most critical security tests. Two completely separate
 * employer accounts (different tenants) must not be able to see or
 * modify each other's data.
 */
import {
  request,
  createTestEmployer,
  createTestEmployee,
  cleanupTestData,
  TestEmployer,
  TestEmployee,
} from './setup';

describe('Tenant Isolation', () => {
  let employerA: TestEmployer;
  let employerB: TestEmployer;
  let employeeA1: TestEmployee;

  beforeAll(async () => {
    const ts = Date.now();
    employerA = await createTestEmployer(`iso-a-${ts}`);
    employerB = await createTestEmployer(`iso-b-${ts}`);
    employeeA1 = await createTestEmployee(
      employerA.token,
      `iso-emp-${ts}`
    );
  });

  afterAll(async () => {
    await cleanupTestData(employerA.tenantId);
    await cleanupTestData(employerB.tenantId);
  });

  // -----------------------------------------------------------------------
  // Employee isolation
  // -----------------------------------------------------------------------
  it('Employer B cannot see Employer A employees in GET /employees list', async () => {
    const res = await request
      .get('/api/v1/employees')
      .set('Authorization', `Bearer ${employerB.token}`);

    expect(res.status).toBe(200);
    const ids = (res.body as Array<{ id: string }>).map((e) => e.id);
    expect(ids).not.toContain(employeeA1.id);
  });

  it('Employer B GET /employees/:id for A1 → 404 (not 403)', async () => {
    const res = await request
      .get(`/api/v1/employees/${employeeA1.id}`)
      .set('Authorization', `Bearer ${employerB.token}`);

    expect(res.status).toBe(404);
    expect(res.body).toEqual({ error: 'Employee not found' });
  });

  it('Employer B DELETE /employees/:id for A1 → 404', async () => {
    const res = await request
      .delete(`/api/v1/employees/${employeeA1.id}`)
      .set('Authorization', `Bearer ${employerB.token}`);

    expect(res.status).toBe(404);
    expect(res.body).toEqual({ error: 'Employee not found' });
  });

  it('Employer B PATCH /employees/:id for A1 → 404', async () => {
    const res = await request
      .patch(`/api/v1/employees/${employeeA1.id}`)
      .set('Authorization', `Bearer ${employerB.token}`)
      .send({ jobTitle: 'Stolen Title' });

    expect(res.status).toBe(404);
  });

  // -----------------------------------------------------------------------
  // Leave isolation
  // -----------------------------------------------------------------------
  it('Employer B cannot see Employer A leave requests', async () => {
    // First create a leave request in tenant A — requires an employee with
    // an employee profile. We use the employer token but we need an employee.
    // The leave POST requires an employee profile (user linked to employees table).
    // employeeA1 has an employee profile; log in as them.
    const loginRes = await request.post('/api/v1/auth/login').send({
      email: employeeA1.email,
      password: 'Welcome123!',
    });
    const employeeAToken = loginRes.body.accessToken as string;

    const leaveRes = await request
      .post('/api/v1/leave')
      .set('Authorization', `Bearer ${employeeAToken}`)
      .send({
        leaveType: 'annual',
        startDate: '2025-08-01',
        endDate: '2025-08-05',
        daysRequested: 5,
        reason: 'Holiday',
      });
    expect(leaveRes.status).toBe(201);
    const leaveId = leaveRes.body.id as string;

    // Employer B fetches all leave — should not include leaveId
    const listRes = await request
      .get('/api/v1/leave')
      .set('Authorization', `Bearer ${employerB.token}`);

    expect(listRes.status).toBe(200);
    const ids = (listRes.body as Array<{ id: string }>).map((l) => l.id);
    expect(ids).not.toContain(leaveId);

    // Employer B tries to approve leave A's request — should 404
    const approveRes = await request
      .patch(`/api/v1/leave/${leaveId}/approve`)
      .set('Authorization', `Bearer ${employerB.token}`);

    expect(approveRes.status).toBe(404);
  });

  // -----------------------------------------------------------------------
  // Payroll isolation
  // -----------------------------------------------------------------------
  it('Employer B cannot see Employer A payroll runs', async () => {
    const payrollRes = await request
      .post('/api/v1/payroll')
      .set('Authorization', `Bearer ${employerA.token}`)
      .send({
        periodStart: '2025-07-01',
        periodEnd: '2025-07-31',
      });
    expect(payrollRes.status).toBe(201);
    const runId = payrollRes.body.id as string;

    const listRes = await request
      .get('/api/v1/payroll')
      .set('Authorization', `Bearer ${employerB.token}`);

    expect(listRes.status).toBe(200);
    const ids = (listRes.body as Array<{ id: string }>).map((p) => p.id);
    expect(ids).not.toContain(runId);

    // Employer B tries to GET the specific run by id → 404
    const getRes = await request
      .get(`/api/v1/payroll/${runId}`)
      .set('Authorization', `Bearer ${employerB.token}`);

    expect(getRes.status).toBe(404);

    // Employer B tries to approve it → 404
    const approveRes = await request
      .patch(`/api/v1/payroll/${runId}/approve`)
      .set('Authorization', `Bearer ${employerB.token}`);

    expect(approveRes.status).toBe(404);
  });

  // -----------------------------------------------------------------------
  // Benefits isolation
  // -----------------------------------------------------------------------
  it('Employer B cannot see Employer A benefits', async () => {
    const benefitRes = await request
      .post('/api/v1/benefits')
      .set('Authorization', `Bearer ${employerA.token}`)
      .send({
        name: 'Tenant A Health Plan',
        benefitType: 'health',
        value: 500,
        currency: 'GBP',
      });
    expect(benefitRes.status).toBe(201);
    const benefitId = benefitRes.body.id as string;

    const listRes = await request
      .get('/api/v1/benefits')
      .set('Authorization', `Bearer ${employerB.token}`);

    expect(listRes.status).toBe(200);
    const ids = (listRes.body as Array<{ id: string }>).map((b) => b.id);
    expect(ids).not.toContain(benefitId);

    // Employer B tries to enrol their own (non-existent) employee into A's benefit
    const enrolRes = await request
      .post(`/api/v1/benefits/${benefitId}/enrol`)
      .set('Authorization', `Bearer ${employerB.token}`)
      .send({ employeeId: employeeA1.id });

    expect(enrolRes.status).toBe(404); // benefit not found in B's tenant
  });

  // -----------------------------------------------------------------------
  // Department isolation
  // -----------------------------------------------------------------------
  it('Employer B cannot see Employer A departments', async () => {
    const deptRes = await request
      .post('/api/v1/departments')
      .set('Authorization', `Bearer ${employerA.token}`)
      .send({ name: 'Tenant A Engineering' });
    expect(deptRes.status).toBe(201);
    const deptId = deptRes.body.id as string;

    const listRes = await request
      .get('/api/v1/departments')
      .set('Authorization', `Bearer ${employerB.token}`);

    expect(listRes.status).toBe(200);
    const ids = (listRes.body as Array<{ id: string }>).map((d) => d.id);
    expect(ids).not.toContain(deptId);
  });

  // -----------------------------------------------------------------------
  // Attendance isolation
  // -----------------------------------------------------------------------
  it('Employer B cannot see Employer A attendance records', async () => {
    const loginRes = await request.post('/api/v1/auth/login').send({
      email: employeeA1.email,
      password: 'Welcome123!',
    });
    const employeeAToken = loginRes.body.accessToken as string;

    // Employee A clocks in
    const clockInRes = await request
      .post('/api/v1/attendance/clock-in')
      .set('Authorization', `Bearer ${employeeAToken}`);
    expect(clockInRes.status).toBe(200);

    // Employer B fetches attendance
    const listRes = await request
      .get('/api/v1/attendance')
      .set('Authorization', `Bearer ${employerB.token}`);

    expect(listRes.status).toBe(200);
    const empIds = (
      listRes.body as Array<{ employee_id: string }>
    ).map((r) => r.employee_id);
    expect(empIds).not.toContain(employeeA1.id);
  });
});
