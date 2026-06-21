import {
  request,
  createTestEmployer,
  createTestEmployee,
  loginAsEmployee,
  cleanupTestData,
  TestEmployer,
  TestEmployee,
} from './setup';

describe('Attendance Routes', () => {
  let employer: TestEmployer;
  let employeeRecord: TestEmployee;
  let employeeToken: string;

  beforeAll(async () => {
    const ts = Date.now();
    employer = await createTestEmployer(`att-${ts}`);
    employeeRecord = await createTestEmployee(employer.token, `att-emp-${ts}`);
    employeeToken = await loginAsEmployee(employeeRecord.email);
  });

  afterAll(async () => {
    await cleanupTestData(employer.tenantId);
  });

  // -----------------------------------------------------------------------
  // POST /api/v1/attendance/clock-in
  // -----------------------------------------------------------------------
  describe('POST /api/v1/attendance/clock-in', () => {
    it('employee clocks in → 200, record has clock_in set and status=present', async () => {
      const res = await request
        .post('/api/v1/attendance/clock-in')
        .set('Authorization', `Bearer ${employeeToken}`);

      expect(res.status).toBe(200);
      expect(res.body).toHaveProperty('id');
      expect(res.body).toHaveProperty('clock_in');
      expect(res.body.clock_in).not.toBeNull();
      expect(res.body.status).toBe('present');
      expect(res.body.employee_id).toBe(employeeRecord.id);
    });

    it('employee clocks in again same day → 200 (upsert, not duplicate)', async () => {
      // Clock in twice — should still be 200 (ON CONFLICT DO UPDATE)
      const res1 = await request
        .post('/api/v1/attendance/clock-in')
        .set('Authorization', `Bearer ${employeeToken}`);
      const res2 = await request
        .post('/api/v1/attendance/clock-in')
        .set('Authorization', `Bearer ${employeeToken}`);

      // Both should succeed — second is an upsert
      expect(res1.status).toBe(200);
      expect(res2.status).toBe(200);
      // Same record id (upsert preserves id via ON CONFLICT DO UPDATE)
      expect(res1.body.id).toBe(res2.body.id);
    });

    it('no token → 401', async () => {
      const res = await request.post('/api/v1/attendance/clock-in');

      expect(res.status).toBe(401);
    });
  });

  // -----------------------------------------------------------------------
  // POST /api/v1/attendance/clock-out
  // -----------------------------------------------------------------------
  describe('POST /api/v1/attendance/clock-out', () => {
    it('employee clocks out after clock-in → 200, record has clock_out set', async () => {
      // Ensure clocked in first
      await request
        .post('/api/v1/attendance/clock-in')
        .set('Authorization', `Bearer ${employeeToken}`);

      const res = await request
        .post('/api/v1/attendance/clock-out')
        .set('Authorization', `Bearer ${employeeToken}`);

      expect(res.status).toBe(200);
      expect(res.body).toHaveProperty('clock_out');
      expect(res.body.clock_out).not.toBeNull();
    });

    it('no token → 401', async () => {
      const res = await request.post('/api/v1/attendance/clock-out');

      expect(res.status).toBe(401);
    });
  });

  // -----------------------------------------------------------------------
  // GET /api/v1/attendance
  // -----------------------------------------------------------------------
  describe('GET /api/v1/attendance', () => {
    let secondEmpToken: string;
    let secondEmployeeRecord: TestEmployee;

    beforeAll(async () => {
      // Create a second employee so we can test scoping
      secondEmployeeRecord = await createTestEmployee(
        employer.token,
        `att-emp2-${Date.now()}`
      );
      secondEmpToken = await loginAsEmployee(secondEmployeeRecord.email);

      // Both employees clock in
      await request
        .post('/api/v1/attendance/clock-in')
        .set('Authorization', `Bearer ${employeeToken}`);
      await request
        .post('/api/v1/attendance/clock-in')
        .set('Authorization', `Bearer ${secondEmpToken}`);
    });

    it('employee sees only own attendance records', async () => {
      const res = await request
        .get('/api/v1/attendance')
        .set('Authorization', `Bearer ${employeeToken}`);

      expect(res.status).toBe(200);
      expect(Array.isArray(res.body)).toBe(true);
      // All records should belong to the first employee
      const empIds = (
        res.body as Array<{ employee_id: string }>
      ).map((r) => r.employee_id);
      const uniqueIds = [...new Set(empIds)];
      expect(uniqueIds).toHaveLength(1);
      expect(uniqueIds[0]).toBe(employeeRecord.id);
    });

    it('employer sees all attendance records in tenant', async () => {
      const res = await request
        .get('/api/v1/attendance')
        .set('Authorization', `Bearer ${employer.token}`);

      expect(res.status).toBe(200);
      expect(Array.isArray(res.body)).toBe(true);

      const empIds = (
        res.body as Array<{ employee_id: string }>
      ).map((r) => r.employee_id);

      // Should contain both employees
      expect(empIds).toContain(employeeRecord.id);
      expect(empIds).toContain(secondEmployeeRecord.id);
    });

    it('each attendance record has expected fields', async () => {
      const res = await request
        .get('/api/v1/attendance')
        .set('Authorization', `Bearer ${employer.token}`);

      const record = res.body[0];
      expect(record).toHaveProperty('id');
      expect(record).toHaveProperty('date');
      expect(record).toHaveProperty('clock_in');
      expect(record).toHaveProperty('clock_out');
      expect(record).toHaveProperty('status');
      expect(record).toHaveProperty('employee_id');
      expect(record).toHaveProperty('employee_name');
    });

    it('no token → 401', async () => {
      const res = await request.get('/api/v1/attendance');

      expect(res.status).toBe(401);
    });
  });
});
