import pool from '../../src/db';
import {
  request,
  createTestEmployer,
  createTestEmployee,
  cleanupTestData,
  TestEmployer,
  TestEmployee,
} from '../setup';

describe('Database Constraint Enforcement (relational)', () => {
  let employer: TestEmployer;
  let employer2: TestEmployer;

  beforeAll(async () => {
    const suffix = `rc-${Date.now()}`;
    employer = await createTestEmployer(`relational-constraints-${suffix}`);
    employer2 = await createTestEmployer(`relational-constraints-t2-${suffix}`);
  });

  afterAll(async () => {
    await cleanupTestData(employer.tenantId);
    await cleanupTestData(employer2.tenantId);
  });

  // --- 1. Duplicate employee_number same tenant ---
  it('posting same employeeNumber twice in same tenant returns 409 or 400', async () => {
    const tag = `dup-${Date.now()}`;

    const first = await request
      .post('/api/v1/employees')
      .set('Cookie', employer.cookie)
      .send({
        email: `dup1-${tag}@test-champs.com`,
        fullName: 'Duplicate One',
        jobTitle: 'Tester',
        employeeNumber: `DUPNUM-${tag}`,
        grossSalary: 40000,
        startDate: '2024-01-01',
      });
    expect(first.status).toBe(201);

    const second = await request
      .post('/api/v1/employees')
      .set('Cookie', employer.cookie)
      .send({
        email: `dup2-${tag}@test-champs.com`,
        fullName: 'Duplicate Two',
        jobTitle: 'Tester',
        employeeNumber: `DUPNUM-${tag}`, // same number, same tenant
        grossSalary: 40000,
        startDate: '2024-01-01',
      });

    expect([400, 409, 422]).toContain(second.status);
  });

  // --- 2. Same employee_number is allowed across different tenants ---
  it('same employeeNumber in different tenants is allowed', async () => {
    const tag = `cross-tenant-${Date.now()}`;
    const empNum = `SHARED-${tag}`;

    const t1 = await request
      .post('/api/v1/employees')
      .set('Cookie', employer.cookie)
      .send({
        email: `ct1-${tag}@test-champs.com`,
        fullName: 'Cross Tenant One',
        jobTitle: 'Engineer',
        employeeNumber: empNum,
        grossSalary: 50000,
        startDate: '2024-01-01',
      });
    expect(t1.status).toBe(201);

    const t2 = await request
      .post('/api/v1/employees')
      .set('Cookie', employer2.cookie)
      .send({
        email: `ct2-${tag}@test-champs.com`,
        fullName: 'Cross Tenant Two',
        jobTitle: 'Engineer',
        employeeNumber: empNum, // same number, different tenant
        grossSalary: 50000,
        startDate: '2024-01-01',
      });
    expect(t2.status).toBe(201);
  });

  // --- 3. Invalid departmentId → DB FK rejects it ---
  it('employee with non-existent departmentId is not silently created with a bogus department', async () => {
    const tag = `bad-dept-${Date.now()}`;
    const fakeDeptId = '00000000-0000-0000-0000-ffffffffffff';

    const res = await request
      .post('/api/v1/employees')
      .set('Cookie', employer.cookie)
      .send({
        email: `bad-dept-${tag}@test-champs.com`,
        fullName: 'Bad Dept Employee',
        jobTitle: 'Tester',
        departmentId: fakeDeptId,
        employeeNumber: `BADDEPT-${tag}`,
        grossSalary: 40000,
        startDate: '2024-01-01',
      });

    // DB FK constraint on department_id → should fail with an error response.
    // Current unhandled DB errors surface as 500; future API improvement would map to 400/404.
    if (res.status === 201) {
      // Employee must not have been created with the bogus department
      const row = await pool.query(
        `SELECT department_id FROM employees WHERE id = $1`,
        [res.body.id]
      );
      expect(row.rows[0]?.department_id).toBeNull();
    } else {
      expect([400, 404, 422, 500]).toContain(res.status);
    }
  });

  // --- 4. Cross-tenant departmentId → rejected or ignored ---
  it("employer A cannot assign an employee to employer B's departmentId", async () => {
    const tag = `cross-dept-${Date.now()}`;

    // Create a department under tenant 2
    const deptRes = await request
      .post('/api/v1/departments')
      .set('Cookie', employer2.cookie)
      .send({ name: `T2 Dept ${tag}` });
    expect(deptRes.status).toBe(201);
    const t2DeptId = deptRes.body.id;

    // Tenant 1 employer tries to assign employee to tenant 2's dept
    const res = await request
      .post('/api/v1/employees')
      .set('Cookie', employer.cookie)
      .send({
        email: `cross-dept-${tag}@test-champs.com`,
        fullName: 'Cross Dept Employee',
        jobTitle: 'Tester',
        departmentId: t2DeptId,
        employeeNumber: `CDEPT-${tag}`,
        grossSalary: 40000,
        startDate: '2024-01-01',
      });

    // Either the DB FK rejects it (400/404/422/500 shouldn't propagate as-is)
    // or it succeeds but employee has null/wrong department (still not a security issue for read)
    // The key assertion: it must not silently put the employee in T2's department while scoped to T1
    if (res.status === 201) {
      // If it succeeded, fetch it back and verify the department is null (FK mismatch → SET NULL or ignored)
      const getRes = await request
        .get(`/api/v1/employees/${res.body.id}`)
        .set('Cookie', employer.cookie);
      // The department should either be null or the response should show it wasn't found in T1
      expect(
        getRes.body.departmentId === null || getRes.body.departmentId !== t2DeptId
      ).toBe(true);
    } else {
      expect([400, 404, 422]).toContain(res.status);
    }
  });

  // --- 5. Payroll approve transition: completed→draft should not be allowed ---
  it('payroll run status cannot be moved back from completed to draft via approve', async () => {
    // Create an employee to run payroll
    const tag = `payroll-state-${Date.now()}`;
    await createTestEmployee(employer.cookie, tag);

    const createRes = await request
      .post('/api/v1/payroll')
      .set('Cookie', employer.cookie)
      .send({ periodStart: '2025-06-01', periodEnd: '2025-06-30' });
    expect(createRes.status).toBe(201);
    const runId = createRes.body.id;

    // Approve → completed
    await request
      .patch(`/api/v1/payroll/${runId}/approve`)
      .set('Cookie', employer.cookie);

    // Verify completed
    const getRes = await request
      .get(`/api/v1/payroll/${runId}`)
      .set('Cookie', employer.cookie);
    expect(getRes.body.status).toBe('completed');

    // There is no PATCH /payroll/:id/draft endpoint → confirm it returns 404
    const draftRes = await request
      .patch(`/api/v1/payroll/${runId}/draft`)
      .set('Cookie', employer.cookie);
    expect(draftRes.status).toBe(404);
  });

  // --- 6. Attendance unique constraint: two clock-ins same day → exactly 1 row ---
  it('two clock-ins on same day for same employee yield exactly 1 attendance row', async () => {
    const tag = `att-uniq-${Date.now()}`;
    const emp = await createTestEmployee(employer.cookie, tag);

    // Login as employee
    const loginRes = await request
      .post('/api/v1/auth/login')
      .send({ email: emp.email, password: 'Welcome123!' });
    const empCookieLocal2 = loginRes.headers["set-cookie"] as unknown as string[];

    await request
      .post('/api/v1/attendance/clock-in')
      .set('Cookie', empCookieLocal2);
    await request
      .post('/api/v1/attendance/clock-in')
      .set('Cookie', empCookieLocal2);

    const today = new Date().toISOString().slice(0, 10);
    const countRes = await pool.query(
      `SELECT COUNT(*) AS cnt FROM attendance_records
       WHERE employee_id = $1 AND date = $2`,
      [emp.id, today]
    );
    expect(parseInt(countRes.rows[0].cnt, 10)).toBe(1);
  });

  // --- 7. employee_benefits unique constraint: enrol same pair twice → 1 row ---
  it('enrolling same employee in same benefit twice yields exactly 1 enrolment row', async () => {
    const tag = `ben-uniq-${Date.now()}`;

    const benefitRes = await request
      .post('/api/v1/benefits')
      .set('Cookie', employer.cookie)
      .send({ name: `Unique Benefit ${tag}`, benefitType: 'health', value: 100, currency: 'GBP' });
    expect(benefitRes.status).toBe(201);
    const benefitId = benefitRes.body.id;

    const emp = await createTestEmployee(employer.cookie, tag);

    // Enrol twice
    await request
      .post(`/api/v1/benefits/${benefitId}/enrol`)
      .set('Cookie', employer.cookie)
      .send({ employeeId: emp.id });
    await request
      .post(`/api/v1/benefits/${benefitId}/enrol`)
      .set('Cookie', employer.cookie)
      .send({ employeeId: emp.id });

    const countRes = await pool.query(
      `SELECT COUNT(*) AS cnt FROM employee_benefits
       WHERE employee_id = $1 AND benefit_id = $2`,
      [emp.id, benefitId]
    );
    expect(parseInt(countRes.rows[0].cnt, 10)).toBe(1);
  });
});
