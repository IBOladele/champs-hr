import {
  request,
  createTestEmployer,
  createTestEmployee,
  loginAsEmployee,
  cleanupTestData,
  TestEmployer,
  TestEmployee,
} from './setup';

describe('Departments Routes', () => {
  let employer: TestEmployer;
  let employeeRecord: TestEmployee;
  let employeeToken: string;

  beforeAll(async () => {
    const ts = Date.now();
    employer = await createTestEmployer(`dept-${ts}`);
    employeeRecord = await createTestEmployee(employer.token, `dept-emp-${ts}`);
    employeeToken = await loginAsEmployee(employeeRecord.email);
  });

  afterAll(async () => {
    await cleanupTestData(employer.tenantId);
  });

  // -----------------------------------------------------------------------
  // POST /api/v1/departments
  // -----------------------------------------------------------------------
  describe('POST /api/v1/departments', () => {
    it('employer creates department → 201 with id, name, created_at', async () => {
      const res = await request
        .post('/api/v1/departments')
        .set('Authorization', `Bearer ${employer.token}`)
        .send({ name: 'Engineering' });

      expect(res.status).toBe(201);
      expect(res.body).toMatchObject({ name: 'Engineering' });
      expect(res.body).toHaveProperty('id');
      expect(res.body).toHaveProperty('created_at');
    });

    it('employee cannot create department → 403', async () => {
      const res = await request
        .post('/api/v1/departments')
        .set('Authorization', `Bearer ${employeeToken}`)
        .send({ name: 'Forbidden Dept' });

      expect(res.status).toBe(403);
      expect(res.body).toEqual({ error: 'Employer access required' });
    });

    it('missing name → 400', async () => {
      const res = await request
        .post('/api/v1/departments')
        .set('Authorization', `Bearer ${employer.token}`)
        .send({});

      expect(res.status).toBe(400);
      expect(res.body).toHaveProperty('error');
    });

    it('no token → 401', async () => {
      const res = await request
        .post('/api/v1/departments')
        .send({ name: 'No Auth Dept' });

      expect(res.status).toBe(401);
    });
  });

  // -----------------------------------------------------------------------
  // GET /api/v1/departments
  // -----------------------------------------------------------------------
  describe('GET /api/v1/departments', () => {
    beforeAll(async () => {
      // Create a department to list
      await request
        .post('/api/v1/departments')
        .set('Authorization', `Bearer ${employer.token}`)
        .send({ name: 'Marketing' });
    });

    it('employer can read departments → 200 with array', async () => {
      const res = await request
        .get('/api/v1/departments')
        .set('Authorization', `Bearer ${employer.token}`);

      expect(res.status).toBe(200);
      expect(Array.isArray(res.body)).toBe(true);
      expect(res.body.length).toBeGreaterThanOrEqual(1);
      expect(res.body[0]).toHaveProperty('id');
      expect(res.body[0]).toHaveProperty('name');
    });

    it('employee can read departments → 200', async () => {
      const res = await request
        .get('/api/v1/departments')
        .set('Authorization', `Bearer ${employeeToken}`);

      expect(res.status).toBe(200);
      expect(Array.isArray(res.body)).toBe(true);
    });

    it('departments are sorted by name ASC', async () => {
      await request
        .post('/api/v1/departments')
        .set('Authorization', `Bearer ${employer.token}`)
        .send({ name: 'Aardvark Dept' });
      await request
        .post('/api/v1/departments')
        .set('Authorization', `Bearer ${employer.token}`)
        .send({ name: 'Zebra Dept' });

      const res = await request
        .get('/api/v1/departments')
        .set('Authorization', `Bearer ${employer.token}`);

      expect(res.status).toBe(200);
      const names = (res.body as Array<{ name: string }>).map((d) => d.name);
      const sorted = [...names].sort();
      expect(names).toEqual(sorted);
    });

    it('no token → 401', async () => {
      const res = await request.get('/api/v1/departments');

      expect(res.status).toBe(401);
    });
  });

  // -----------------------------------------------------------------------
  // PATCH /api/v1/departments/:id
  // -----------------------------------------------------------------------
  describe('PATCH /api/v1/departments/:id', () => {
    let deptId: string;

    beforeAll(async () => {
      const res = await request
        .post('/api/v1/departments')
        .set('Authorization', `Bearer ${employer.token}`)
        .send({ name: 'Original Name' });
      deptId = res.body.id as string;
    });

    it('employer updates department → 200 with new name', async () => {
      const res = await request
        .patch(`/api/v1/departments/${deptId}`)
        .set('Authorization', `Bearer ${employer.token}`)
        .send({ name: 'Updated Name' });

      expect(res.status).toBe(200);
      expect(res.body.name).toBe('Updated Name');
      expect(res.body.id).toBe(deptId);
    });

    it('employee cannot update department → 403', async () => {
      const res = await request
        .patch(`/api/v1/departments/${deptId}`)
        .set('Authorization', `Bearer ${employeeToken}`)
        .send({ name: 'Employee Try' });

      expect(res.status).toBe(403);
    });

    it('update nonexistent department → 404', async () => {
      const res = await request
        .patch('/api/v1/departments/00000000-0000-0000-0000-000000000000')
        .set('Authorization', `Bearer ${employer.token}`)
        .send({ name: 'Ghost' });

      expect(res.status).toBe(404);
      expect(res.body).toEqual({ error: 'Department not found' });
    });

    it('missing name in body → 400', async () => {
      const res = await request
        .patch(`/api/v1/departments/${deptId}`)
        .set('Authorization', `Bearer ${employer.token}`)
        .send({});

      expect(res.status).toBe(400);
    });
  });

  // -----------------------------------------------------------------------
  // DELETE /api/v1/departments/:id
  // -----------------------------------------------------------------------
  describe('DELETE /api/v1/departments/:id', () => {
    let deptIdToDelete: string;

    beforeAll(async () => {
      const res = await request
        .post('/api/v1/departments')
        .set('Authorization', `Bearer ${employer.token}`)
        .send({ name: 'To Be Deleted' });
      deptIdToDelete = res.body.id as string;
    });

    it('employer deletes department → 204 no content', async () => {
      const res = await request
        .delete(`/api/v1/departments/${deptIdToDelete}`)
        .set('Authorization', `Bearer ${employer.token}`);

      expect(res.status).toBe(204);
      expect(res.text).toBe('');
    });

    it('deleted department no longer appears in list', async () => {
      const res = await request
        .get('/api/v1/departments')
        .set('Authorization', `Bearer ${employer.token}`);

      const ids = (res.body as Array<{ id: string }>).map((d) => d.id);
      expect(ids).not.toContain(deptIdToDelete);
    });

    it('employee cannot delete department → 403', async () => {
      const newDept = await request
        .post('/api/v1/departments')
        .set('Authorization', `Bearer ${employer.token}`)
        .send({ name: 'Protected Dept' });

      const res = await request
        .delete(`/api/v1/departments/${newDept.body.id}`)
        .set('Authorization', `Bearer ${employeeToken}`);

      expect(res.status).toBe(403);
    });

    it('delete nonexistent department → 404', async () => {
      const res = await request
        .delete('/api/v1/departments/00000000-0000-0000-0000-000000000000')
        .set('Authorization', `Bearer ${employer.token}`);

      expect(res.status).toBe(404);
      expect(res.body).toEqual({ error: 'Department not found' });
    });
  });
});
