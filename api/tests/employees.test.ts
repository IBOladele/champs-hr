import {
  request,
  createTestEmployer,
  createTestEmployee,
  loginAsEmployee,
  cleanupTestData,
  TestEmployer,
  TestEmployee,
} from './setup';

describe('Employees Routes', () => {
  let employer: TestEmployer;
  let employeeRecord: TestEmployee;
  let employeeToken: string;

  beforeAll(async () => {
    employer = await createTestEmployer(`emp-${Date.now()}`);
    employeeRecord = await createTestEmployee(employer.token, `emp-${Date.now()}`);
    employeeToken = await loginAsEmployee(employeeRecord.email);
  });

  afterAll(async () => {
    await cleanupTestData(employer.tenantId);
  });

  // -----------------------------------------------------------------------
  // GET /api/v1/employees
  // -----------------------------------------------------------------------
  describe('GET /api/v1/employees', () => {
    it('employer token → 200, returns array', async () => {
      const res = await request
        .get('/api/v1/employees')
        .set('Authorization', `Bearer ${employer.token}`);

      expect(res.status).toBe(200);
      expect(Array.isArray(res.body)).toBe(true);
      expect(res.body.length).toBeGreaterThanOrEqual(1);
      // check shape of first item
      expect(res.body[0]).toHaveProperty('id');
      expect(res.body[0]).toHaveProperty('email');
      expect(res.body[0]).toHaveProperty('fullName');
      expect(res.body[0]).toHaveProperty('jobTitle');
    });

    it('employee token → 403 Employer access required', async () => {
      const res = await request
        .get('/api/v1/employees')
        .set('Authorization', `Bearer ${employeeToken}`);

      expect(res.status).toBe(403);
      expect(res.body).toEqual({ error: 'Employer access required' });
    });

    it('no token → 401', async () => {
      const res = await request.get('/api/v1/employees');

      expect(res.status).toBe(401);
      expect(res.body).toHaveProperty('error');
    });
  });

  // -----------------------------------------------------------------------
  // POST /api/v1/employees
  // -----------------------------------------------------------------------
  describe('POST /api/v1/employees', () => {
    it('employer creates employee → 201 with correct shape', async () => {
      const tag = Date.now();
      const res = await request
        .post('/api/v1/employees')
        .set('Authorization', `Bearer ${employer.token}`)
        .send({
          email: `new-emp-${tag}@test-champs.com`,
          fullName: 'Jane Smith',
          jobTitle: 'Designer',
          employeeNumber: `EMP-NEW-${tag}`,
          grossSalary: 45000,
          startDate: '2024-03-01',
          employmentType: 'full_time',
          payFrequency: 'monthly',
        });

      expect(res.status).toBe(201);
      expect(res.body).toMatchObject({
        email: `new-emp-${tag}@test-champs.com`,
        fullName: 'Jane Smith',
        jobTitle: 'Designer',
        employeeNumber: `EMP-NEW-${tag}`,
        employmentType: 'full_time',
        employmentStatus: 'active',
        payFrequency: 'monthly',
      });
      expect(res.body).toHaveProperty('id');
      expect(res.body).toHaveProperty('userId');
      expect(res.body).toHaveProperty('startDate');
      expect(res.body).toHaveProperty('createdAt');
    });

    it('employee tries to create → 403', async () => {
      const res = await request
        .post('/api/v1/employees')
        .set('Authorization', `Bearer ${employeeToken}`)
        .send({
          email: `blocked-${Date.now()}@test-champs.com`,
          fullName: 'Blocked',
          jobTitle: 'Engineer',
          employeeNumber: `EMP-BLK-${Date.now()}`,
          grossSalary: 30000,
          startDate: '2024-01-01',
        });

      expect(res.status).toBe(403);
      expect(res.body).toEqual({ error: 'Employer access required' });
    });

    it('missing required fields → 400 with error array', async () => {
      const res = await request
        .post('/api/v1/employees')
        .set('Authorization', `Bearer ${employer.token}`)
        .send({
          email: `missing-${Date.now()}@test-champs.com`,
          // missing fullName, jobTitle, employeeNumber, grossSalary, startDate
        });

      expect(res.status).toBe(400);
      expect(res.body).toHaveProperty('error');
      expect(Array.isArray(res.body.error)).toBe(true);
    });

    it('negative grossSalary → 400', async () => {
      const res = await request
        .post('/api/v1/employees')
        .set('Authorization', `Bearer ${employer.token}`)
        .send({
          email: `neg-sal-${Date.now()}@test-champs.com`,
          fullName: 'Bad Salary',
          jobTitle: 'Engineer',
          employeeNumber: `EMP-NEG-${Date.now()}`,
          grossSalary: -5000,
          startDate: '2024-01-01',
        });

      expect(res.status).toBe(400);
      expect(res.body).toHaveProperty('error');
    });
  });

  // -----------------------------------------------------------------------
  // GET /api/v1/employees/:id
  // -----------------------------------------------------------------------
  describe('GET /api/v1/employees/:id', () => {
    it('employer gets any employee by id → 200 with employee object', async () => {
      const res = await request
        .get(`/api/v1/employees/${employeeRecord.id}`)
        .set('Authorization', `Bearer ${employer.token}`);

      expect(res.status).toBe(200);
      expect(res.body).toMatchObject({
        id: employeeRecord.id,
        email: employeeRecord.email,
        fullName: employeeRecord.fullName,
      });
    });

    it('employee can get their own record → 200', async () => {
      const res = await request
        .get(`/api/v1/employees/${employeeRecord.id}`)
        .set('Authorization', `Bearer ${employeeToken}`);

      expect(res.status).toBe(200);
      expect(res.body.id).toBe(employeeRecord.id);
    });

    it('nonexistent UUID → 404', async () => {
      const res = await request
        .get('/api/v1/employees/00000000-0000-0000-0000-000000000000')
        .set('Authorization', `Bearer ${employer.token}`);

      expect(res.status).toBe(404);
      expect(res.body).toEqual({ error: 'Employee not found' });
    });
  });

  // -----------------------------------------------------------------------
  // PATCH /api/v1/employees/:id
  // -----------------------------------------------------------------------
  describe('PATCH /api/v1/employees/:id', () => {
    it('employer updates employee → 200 with updated data', async () => {
      const res = await request
        .patch(`/api/v1/employees/${employeeRecord.id}`)
        .set('Authorization', `Bearer ${employer.token}`)
        .send({
          jobTitle: 'Senior Software Engineer',
          grossSalary: 65000,
        });

      expect(res.status).toBe(200);
      expect(res.body.jobTitle).toBe('Senior Software Engineer');
      expect(parseFloat(String(res.body.grossSalary))).toBe(65000);
    });

    it('employer updates fullName via patch → 200', async () => {
      const res = await request
        .patch(`/api/v1/employees/${employeeRecord.id}`)
        .set('Authorization', `Bearer ${employer.token}`)
        .send({ fullName: 'Updated Name' });

      expect(res.status).toBe(200);
      expect(res.body.fullName).toBe('Updated Name');
    });

    it('employee tries to patch → 403', async () => {
      const res = await request
        .patch(`/api/v1/employees/${employeeRecord.id}`)
        .set('Authorization', `Bearer ${employeeToken}`)
        .send({ jobTitle: 'Hacker' });

      expect(res.status).toBe(403);
    });

    it('patch nonexistent employee → 404', async () => {
      const res = await request
        .patch('/api/v1/employees/00000000-0000-0000-0000-000000000000')
        .set('Authorization', `Bearer ${employer.token}`)
        .send({ jobTitle: 'Ghost' });

      expect(res.status).toBe(404);
      expect(res.body).toEqual({ error: 'Employee not found' });
    });
  });

  // -----------------------------------------------------------------------
  // DELETE /api/v1/employees/:id
  // -----------------------------------------------------------------------
  describe('DELETE /api/v1/employees/:id', () => {
    it('employer deletes employee → 204 no content', async () => {
      // Create a disposable employee to delete
      const disposable = await createTestEmployee(
        employer.token,
        `del-${Date.now()}`
      );

      const res = await request
        .delete(`/api/v1/employees/${disposable.id}`)
        .set('Authorization', `Bearer ${employer.token}`);

      expect(res.status).toBe(204);
      expect(res.text).toBe('');
    });

    it('deleted employee no longer retrievable → 404', async () => {
      const disposable = await createTestEmployee(
        employer.token,
        `del2-${Date.now()}`
      );
      await request
        .delete(`/api/v1/employees/${disposable.id}`)
        .set('Authorization', `Bearer ${employer.token}`);

      const res = await request
        .get(`/api/v1/employees/${disposable.id}`)
        .set('Authorization', `Bearer ${employer.token}`);

      expect(res.status).toBe(404);
    });

    it('employee tries to delete → 403', async () => {
      const res = await request
        .delete(`/api/v1/employees/${employeeRecord.id}`)
        .set('Authorization', `Bearer ${employeeToken}`);

      expect(res.status).toBe(403);
    });

    it('delete nonexistent employee → 404', async () => {
      const res = await request
        .delete('/api/v1/employees/00000000-0000-0000-0000-000000000000')
        .set('Authorization', `Bearer ${employer.token}`);

      expect(res.status).toBe(404);
      expect(res.body).toEqual({ error: 'Employee not found' });
    });
  });
});
