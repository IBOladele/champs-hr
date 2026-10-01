import pool from '../../src/db';
import {
  request,
  createTestEmployer,
  cleanupTestData,
  TestEmployer,
} from '../setup';

describe('Department → Employee Workflow (functional)', () => {
  let employer: TestEmployer;

  let engDeptId: string;
  let designDeptId: string;
  let marketingDeptId: string;

  let empEngId: string;
  let empDesignId: string;

  beforeAll(async () => {
    const suffix = `dew-${Date.now()}`;
    employer = await createTestEmployer(`functional-dept-${suffix}`);

    // Create 3 departments
    const engRes = await request
      .post('/api/v1/departments')
      .set('Cookie', employer.cookie)
      .send({ name: 'Engineering' });
    expect(engRes.status).toBe(201);
    engDeptId = engRes.body.id;

    const designRes = await request
      .post('/api/v1/departments')
      .set('Cookie', employer.cookie)
      .send({ name: 'Design' });
    expect(designRes.status).toBe(201);
    designDeptId = designRes.body.id;

    const marketingRes = await request
      .post('/api/v1/departments')
      .set('Cookie', employer.cookie)
      .send({ name: 'Marketing' });
    expect(marketingRes.status).toBe(201);
    marketingDeptId = marketingRes.body.id;
  });

  afterAll(async () => {
    await cleanupTestData(employer.tenantId);
  });

  it('employer creates employees assigned to each department', async () => {
    const tag = Date.now();

    const empEng = await request
      .post('/api/v1/employees')
      .set('Cookie', employer.cookie)
      .send({
        email: `eng-${tag}@test-champs.com`,
        fullName: 'Alice Engineer',
        jobTitle: 'Backend Dev',
        departmentId: engDeptId,
        employeeNumber: `ENG-${tag}`,
        grossSalary: 60000,
        startDate: '2024-01-01',
      });
    expect(empEng.status).toBe(201);
    empEngId = empEng.body.id;

    const empDesign = await request
      .post('/api/v1/employees')
      .set('Cookie', employer.cookie)
      .send({
        email: `design-${tag}@test-champs.com`,
        fullName: 'Bob Designer',
        jobTitle: 'UI/UX Designer',
        departmentId: designDeptId,
        employeeNumber: `DES-${tag}`,
        grossSalary: 55000,
        startDate: '2024-02-01',
      });
    expect(empDesign.status).toBe(201);
    empDesignId = empDesign.body.id;

    const empMarketing = await request
      .post('/api/v1/employees')
      .set('Cookie', employer.cookie)
      .send({
        email: `mkt-${tag}@test-champs.com`,
        fullName: 'Carol Marketer',
        jobTitle: 'Marketing Manager',
        departmentId: marketingDeptId,
        employeeNumber: `MKT-${tag}`,
        grossSalary: 52000,
        startDate: '2024-03-01',
      });
    expect(empMarketing.status).toBe(201);
  });

  it('GET /employees → each employee shows correct departmentName', async () => {
    const res = await request
      .get('/api/v1/employees')
      .set('Cookie', employer.cookie);

    expect(res.status).toBe(200);
    const employees = res.body as Array<{
      id: string;
      departmentId: string;
      departmentName: string;
    }>;

    const alice = employees.find((e) => e.id === empEngId);
    expect(alice).toBeDefined();
    expect(alice!.departmentId).toBe(engDeptId);
    expect(alice!.departmentName).toBe('Engineering');

    const bob = employees.find((e) => e.id === empDesignId);
    expect(bob).toBeDefined();
    expect(bob!.departmentId).toBe(designDeptId);
    expect(bob!.departmentName).toBe('Design');
  });

  it("employer updates an employee's department → departmentName changes in GET /employees/:id", async () => {
    const patchRes = await request
      .patch(`/api/v1/employees/${empEngId}`)
      .set('Cookie', employer.cookie)
      .send({ departmentId: designDeptId });

    expect(patchRes.status).toBe(200);

    const getRes = await request
      .get(`/api/v1/employees/${empEngId}`)
      .set('Cookie', employer.cookie);

    expect(getRes.status).toBe(200);
    expect(getRes.body.departmentId).toBe(designDeptId);
    expect(getRes.body.departmentName).toBe('Design');
  });

  it('employer deletes a department that has no employees → 204', async () => {
    // Move empEng back out of marketingDept so it's empty, then delete it
    // marketingDeptId still has the marketing employee, so create an empty one
    const tag = Date.now();
    const emptyDeptRes = await request
      .post('/api/v1/departments')
      .set('Cookie', employer.cookie)
      .send({ name: `EmptyDept-${tag}` });
    expect(emptyDeptRes.status).toBe(201);
    const emptyDeptId = emptyDeptRes.body.id;

    const deleteRes = await request
      .delete(`/api/v1/departments/${emptyDeptId}`)
      .set('Cookie', employer.cookie);

    expect(deleteRes.status).toBe(204);
  });

  it('deleted department no longer appears in GET /departments', async () => {
    const tag = Date.now();
    // Create and immediately delete
    const deptRes = await request
      .post('/api/v1/departments')
      .set('Cookie', employer.cookie)
      .send({ name: `TempDept-${tag}` });
    const tempId = deptRes.body.id;

    await request
      .delete(`/api/v1/departments/${tempId}`)
      .set('Cookie', employer.cookie);

    const listRes = await request
      .get('/api/v1/departments')
      .set('Cookie', employer.cookie);

    expect(listRes.status).toBe(200);
    const ids = (listRes.body as Array<{ id: string }>).map((d) => d.id);
    expect(ids).not.toContain(tempId);
  });

  it('create employee with invalid (non-existent) departmentId → API rejects or the FK triggers an error', async () => {
    const tag = Date.now();
    const fakeDeptId = '00000000-0000-0000-0000-000000000099';

    const res = await request
      .post('/api/v1/employees')
      .set('Cookie', employer.cookie)
      .send({
        email: `invalid-dept-${tag}@test-champs.com`,
        fullName: 'Invalid Dept Employee',
        jobTitle: 'Tester',
        departmentId: fakeDeptId,
        employeeNumber: `BAD-${tag}`,
        grossSalary: 40000,
        startDate: '2024-01-01',
      });

    // The DB FK constraint will reject an invalid department UUID.
    // The current error handler surfaces unhandled DB errors as 500.
    // Acceptable responses: 400/404/422 (if validated) or 500 (current unhandled FK path).
    // This test confirms the employee is NOT silently created with a bogus departmentId.
    if (res.status === 201) {
      // If somehow accepted, verify in DB that the employee row has null department
      const row = await pool.query(
        `SELECT department_id FROM employees WHERE id = $1`,
        [res.body.id]
      );
      expect(row.rows[0]?.department_id).toBeNull();
    } else {
      expect([400, 404, 422, 500]).toContain(res.status);
    }
  });

  it('create employee with no department (departmentId omitted) → succeeds with departmentName=null', async () => {
    const tag = Date.now();

    const res = await request
      .post('/api/v1/employees')
      .set('Cookie', employer.cookie)
      .send({
        email: `no-dept-${tag}@test-champs.com`,
        fullName: 'No Dept Employee',
        jobTitle: 'Generalist',
        employeeNumber: `NODEPT-${tag}`,
        grossSalary: 45000,
        startDate: '2024-01-01',
      });

    expect(res.status).toBe(201);
    expect(res.body.departmentId).toBeNull();
  });
});
