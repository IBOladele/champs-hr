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

describe('Cascade Delete Behaviour (relational)', () => {
  let employer: TestEmployer;

  beforeAll(async () => {
    const suffix = `casc-${Date.now()}`;
    employer = await createTestEmployer(`relational-cascade-${suffix}`);
  });

  afterAll(async () => {
    await cleanupTestData(employer.tenantId);
  });

  // Helper: delete an employee via the API and return the response
  async function deleteEmployee(empId: string) {
    return request
      .delete(`/api/v1/employees/${empId}`)
      .set('Cookie', employer.cookie);
  }

  // --- 1. Delete employee → leave requests are also gone (CASCADE) ---
  it('deleting employee cascades to leave_requests', async () => {
    const tag = `casc-leave-${Date.now()}`;
    const emp = await createTestEmployee(employer.cookie, tag);
    const empCookieLocal = await loginAsEmployee(emp.email);

    // Submit 2 leave requests
    for (let i = 0; i < 2; i++) {
      const res = await request
        .post('/api/v1/leave')
        .set('Cookie', empCookieLocal)
        .send({
          leaveType: 'annual',
          startDate: `2025-0${i + 1}-10`,
          endDate: `2025-0${i + 1}-15`,
          daysRequested: 5,
        });
      expect(res.status).toBe(201);
    }

    // Confirm 2 leave rows in DB
    const before = await pool.query(
      `SELECT COUNT(*) AS cnt FROM leave_requests WHERE employee_id = $1`,
      [emp.id]
    );
    expect(parseInt(before.rows[0].cnt, 10)).toBe(2);

    // Delete employee
    const del = await deleteEmployee(emp.id);
    expect(del.status).toBe(204);

    // Leave requests should be gone
    const after = await pool.query(
      `SELECT COUNT(*) AS cnt FROM leave_requests WHERE employee_id = $1`,
      [emp.id]
    );
    expect(parseInt(after.rows[0].cnt, 10)).toBe(0);
  });

  // --- 2. Delete employee → attendance_records are gone ---
  it('deleting employee cascades to attendance_records', async () => {
    const tag = `casc-att-${Date.now()}`;
    const emp = await createTestEmployee(employer.cookie, tag);
    const empCookieLocal = await loginAsEmployee(emp.email);

    // Clock in (creates 1 record for today)
    await request
      .post('/api/v1/attendance/clock-in')
      .set('Cookie', empCookieLocal);

    // Manually insert 2 more rows for different dates via DB
    const today = new Date().toISOString().slice(0, 10);
    for (const offset of [1, 2]) {
      const d = new Date();
      d.setDate(d.getDate() - offset);
      const dateStr = d.toISOString().slice(0, 10);
      await pool.query(
        `INSERT INTO attendance_records (tenant_id, employee_id, date, status)
         VALUES ($1, $2, $3, 'present')
         ON CONFLICT DO NOTHING`,
        [employer.tenantId, emp.id, dateStr]
      );
    }

    const before = await pool.query(
      `SELECT COUNT(*) AS cnt FROM attendance_records WHERE employee_id = $1`,
      [emp.id]
    );
    expect(parseInt(before.rows[0].cnt, 10)).toBeGreaterThanOrEqual(1);

    const del = await deleteEmployee(emp.id);
    expect(del.status).toBe(204);

    const after = await pool.query(
      `SELECT COUNT(*) AS cnt FROM attendance_records WHERE employee_id = $1`,
      [emp.id]
    );
    expect(parseInt(after.rows[0].cnt, 10)).toBe(0);
  });

  // --- 3. Delete employee → employee_benefits are gone ---
  it('deleting employee cascades to employee_benefits', async () => {
    const tag = `casc-ben-${Date.now()}`;

    const benefitRes = await request
      .post('/api/v1/benefits')
      .set('Cookie', employer.cookie)
      .send({ name: `Cascade Benefit ${tag}`, benefitType: 'health', value: 200, currency: 'GBP' });
    expect(benefitRes.status).toBe(201);
    const benefitId = benefitRes.body.id;

    const emp = await createTestEmployee(employer.cookie, tag);

    await request
      .post(`/api/v1/benefits/${benefitId}/enrol`)
      .set('Cookie', employer.cookie)
      .send({ employeeId: emp.id });

    const before = await pool.query(
      `SELECT COUNT(*) AS cnt FROM employee_benefits WHERE employee_id = $1`,
      [emp.id]
    );
    expect(parseInt(before.rows[0].cnt, 10)).toBe(1);

    const del = await deleteEmployee(emp.id);
    expect(del.status).toBe(204);

    const after = await pool.query(
      `SELECT COUNT(*) AS cnt FROM employee_benefits WHERE employee_id = $1`,
      [emp.id]
    );
    expect(parseInt(after.rows[0].cnt, 10)).toBe(0);
  });

  // --- 4. Delete employee → payroll_run_items are gone (employee_id FK ON DELETE CASCADE) ---
  it('deleting employee cascades to payroll_run_items', async () => {
    const tag = `casc-pay-${Date.now()}`;
    const emp = await createTestEmployee(employer.cookie, tag);

    // Run payroll (creates items for all active employees, including this one)
    const payrollRes = await request
      .post('/api/v1/payroll')
      .set('Cookie', employer.cookie)
      .send({ periodStart: '2025-09-01', periodEnd: '2025-09-30' });
    expect(payrollRes.status).toBe(201);
    const runId = payrollRes.body.id;

    // Confirm at least 1 item for our employee
    const before = await pool.query(
      `SELECT COUNT(*) AS cnt FROM payroll_run_items
       WHERE payroll_run_id = $1 AND employee_id = $2`,
      [runId, emp.id]
    );
    expect(parseInt(before.rows[0].cnt, 10)).toBeGreaterThanOrEqual(1);

    const del = await deleteEmployee(emp.id);
    expect(del.status).toBe(204);

    // payroll_run_items for this employee should be gone (CASCADE) or employee_id nulled
    const after = await pool.query(
      `SELECT COUNT(*) AS cnt FROM payroll_run_items
       WHERE payroll_run_id = $1 AND employee_id = $2`,
      [runId, emp.id]
    );
    // CASCADE → 0 rows remain with that employee_id
    expect(parseInt(after.rows[0].cnt, 10)).toBe(0);
  });

  // --- 5. Delete department → employees.department_id is SET NULL ---
  it('deleting a department sets department_id to null for its employees (SET NULL)', async () => {
    const tag = `casc-dept-${Date.now()}`;

    const deptRes = await request
      .post('/api/v1/departments')
      .set('Cookie', employer.cookie)
      .send({ name: `Cascade Dept ${tag}` });
    expect(deptRes.status).toBe(201);
    const deptId = deptRes.body.id;

    // Create 2 employees in this department
    const emp1 = await createTestEmployee(employer.cookie, `cdept-e1-${tag}`);
    await request
      .patch(`/api/v1/employees/${emp1.id}`)
      .set('Cookie', employer.cookie)
      .send({ departmentId: deptId });

    const emp2 = await createTestEmployee(employer.cookie, `cdept-e2-${tag}`);
    await request
      .patch(`/api/v1/employees/${emp2.id}`)
      .set('Cookie', employer.cookie)
      .send({ departmentId: deptId });

    // Confirm employees have this dept
    const beforeRes = await pool.query(
      `SELECT COUNT(*) AS cnt FROM employees WHERE department_id = $1`,
      [deptId]
    );
    expect(parseInt(beforeRes.rows[0].cnt, 10)).toBe(2);

    // Delete the department via API
    const delRes = await request
      .delete(`/api/v1/departments/${deptId}`)
      .set('Cookie', employer.cookie);

    // DB schema has ON DELETE SET NULL → deletion should succeed
    expect([204, 200]).toContain(delRes.status);

    if (delRes.status === 204 || delRes.status === 200) {
      // Employees should now have department_id = null
      const afterRes = await pool.query(
        `SELECT department_id FROM employees WHERE id = ANY($1::uuid[])`,
        [[emp1.id, emp2.id]]
      );
      for (const row of afterRes.rows) {
        expect(row.department_id).toBeNull();
      }
    }
  });

  // --- 6. cleanupTestData removes all associated data for a tenant ---
  it('cleanupTestData removes all tenant data (explicit cascade coverage)', async () => {
    const suffix = `casc-cleanup-${Date.now()}`;
    const tempEmployer = await createTestEmployer(`cascade-cleanup-${suffix}`);
    const tenantId = tempEmployer.tenantId;

    // Create some data
    const emp = await createTestEmployee(tempEmployer.cookie, suffix);
    const empCookieLocal = await loginAsEmployee(emp.email);

    await request
      .post('/api/v1/leave')
      .set('Cookie', empCookieLocal)
      .send({
        leaveType: 'annual',
        startDate: '2025-10-01',
        endDate: '2025-10-03',
        daysRequested: 3,
      });

    await request
      .post('/api/v1/attendance/clock-in')
      .set('Cookie', empCookieLocal);

    // Run cleanup
    await cleanupTestData(tenantId);

    // Verify everything is gone
    const tenantRow = await pool.query(`SELECT id FROM tenants WHERE id = $1`, [tenantId]);
    expect(tenantRow.rows.length).toBe(0);

    const userRows = await pool.query(`SELECT id FROM users WHERE tenant_id = $1`, [tenantId]);
    expect(userRows.rows.length).toBe(0);

    const empRows = await pool.query(`SELECT id FROM employees WHERE tenant_id = $1`, [tenantId]);
    expect(empRows.rows.length).toBe(0);

    const leaveRows = await pool.query(`SELECT id FROM leave_requests WHERE tenant_id = $1`, [tenantId]);
    expect(leaveRows.rows.length).toBe(0);

    const attRows = await pool.query(`SELECT id FROM attendance_records WHERE tenant_id = $1`, [tenantId]);
    expect(attRows.rows.length).toBe(0);
  });
});
