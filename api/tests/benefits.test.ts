import {
  request,
  createTestEmployer,
  createTestEmployee,
  loginAsEmployee,
  cleanupTestData,
  TestEmployer,
  TestEmployee,
} from './setup';

describe('Benefits Routes', () => {
  let employer: TestEmployer;
  let employeeRecord: TestEmployee;
  let employeeToken: string;

  beforeAll(async () => {
    const ts = Date.now();
    employer = await createTestEmployer(`ben-${ts}`);
    employeeRecord = await createTestEmployee(employer.token, `ben-emp-${ts}`);
    employeeToken = await loginAsEmployee(employeeRecord.email);
  });

  afterAll(async () => {
    await cleanupTestData(employer.tenantId);
  });

  // -----------------------------------------------------------------------
  // POST /api/v1/benefits — create benefit
  // -----------------------------------------------------------------------
  describe('POST /api/v1/benefits', () => {
    it('employer creates benefit → 201 with full benefit record', async () => {
      const res = await request
        .post('/api/v1/benefits')
        .set('Authorization', `Bearer ${employer.token}`)
        .send({
          name: 'Private Health Insurance',
          description: 'Comprehensive health cover',
          benefitType: 'health',
          value: 500,
          currency: 'GBP',
        });

      expect(res.status).toBe(201);
      expect(res.body).toMatchObject({
        name: 'Private Health Insurance',
        description: 'Comprehensive health cover',
        benefit_type: 'health',
        currency: 'GBP',
        is_active: true,
      });
      expect(res.body).toHaveProperty('id');
      expect(res.body).toHaveProperty('created_at');
      expect(parseFloat(res.body.value)).toBe(500);
    });

    it('benefit without description → 201 (description optional)', async () => {
      const res = await request
        .post('/api/v1/benefits')
        .set('Authorization', `Bearer ${employer.token}`)
        .send({
          name: 'Life Assurance',
          benefitType: 'life',
          value: 0,
          currency: 'GBP',
        });

      expect(res.status).toBe(201);
      expect(res.body.name).toBe('Life Assurance');
      expect(res.body.description).toBeNull();
    });

    it('currency defaults to GBP when not provided', async () => {
      const res = await request
        .post('/api/v1/benefits')
        .set('Authorization', `Bearer ${employer.token}`)
        .send({
          name: 'Gym Membership',
          benefitType: 'wellness',
          value: 50,
        });

      expect(res.status).toBe(201);
      expect(res.body.currency).toBe('GBP');
    });

    it('employee cannot create benefit → 403', async () => {
      const res = await request
        .post('/api/v1/benefits')
        .set('Authorization', `Bearer ${employeeToken}`)
        .send({
          name: 'Employee Attempt',
          benefitType: 'misc',
          value: 100,
        });

      expect(res.status).toBe(403);
      expect(res.body).toEqual({ error: 'Employer access required' });
    });

    it('missing required fields → 400', async () => {
      const res = await request
        .post('/api/v1/benefits')
        .set('Authorization', `Bearer ${employer.token}`)
        .send({
          name: 'Incomplete Benefit',
          // missing benefitType, value
        });

      expect(res.status).toBe(400);
      expect(res.body).toHaveProperty('error');
    });

    it('no token → 401', async () => {
      const res = await request.post('/api/v1/benefits').send({
        name: 'No Auth Benefit',
        benefitType: 'misc',
        value: 100,
      });

      expect(res.status).toBe(401);
    });
  });

  // -----------------------------------------------------------------------
  // GET /api/v1/benefits — list benefits
  // -----------------------------------------------------------------------
  describe('GET /api/v1/benefits', () => {
    beforeAll(async () => {
      await request
        .post('/api/v1/benefits')
        .set('Authorization', `Bearer ${employer.token}`)
        .send({
          name: 'Dental Plan',
          benefitType: 'dental',
          value: 200,
          currency: 'GBP',
        });
    });

    it('employer can list benefits → 200 with array', async () => {
      const res = await request
        .get('/api/v1/benefits')
        .set('Authorization', `Bearer ${employer.token}`);

      expect(res.status).toBe(200);
      expect(Array.isArray(res.body)).toBe(true);
      expect(res.body.length).toBeGreaterThanOrEqual(1);
    });

    it('employee can list benefits → 200', async () => {
      const res = await request
        .get('/api/v1/benefits')
        .set('Authorization', `Bearer ${employeeToken}`);

      expect(res.status).toBe(200);
      expect(Array.isArray(res.body)).toBe(true);
    });

    it('benefits are sorted by name ASC', async () => {
      const res = await request
        .get('/api/v1/benefits')
        .set('Authorization', `Bearer ${employer.token}`);

      const names = (res.body as Array<{ name: string }>).map((b) => b.name);
      const sorted = [...names].sort();
      expect(names).toEqual(sorted);
    });

    it('each benefit has expected fields', async () => {
      const res = await request
        .get('/api/v1/benefits')
        .set('Authorization', `Bearer ${employer.token}`);

      const benefit = res.body[0];
      expect(benefit).toHaveProperty('id');
      expect(benefit).toHaveProperty('name');
      expect(benefit).toHaveProperty('benefit_type');
      expect(benefit).toHaveProperty('value');
      expect(benefit).toHaveProperty('currency');
      expect(benefit).toHaveProperty('is_active');
      expect(benefit).toHaveProperty('created_at');
    });

    it('no token → 401', async () => {
      const res = await request.get('/api/v1/benefits');

      expect(res.status).toBe(401);
    });
  });

  // -----------------------------------------------------------------------
  // POST /api/v1/benefits/:id/enrol — enrol employee in benefit
  // -----------------------------------------------------------------------
  describe('POST /api/v1/benefits/:id/enrol', () => {
    let benefitId: string;

    beforeAll(async () => {
      const res = await request
        .post('/api/v1/benefits')
        .set('Authorization', `Bearer ${employer.token}`)
        .send({
          name: 'Pension Scheme',
          benefitType: 'pension',
          value: 1000,
          currency: 'GBP',
        });
      benefitId = res.body.id as string;
    });

    it('employer enrols employee in benefit → 201 with enrolment record', async () => {
      const res = await request
        .post(`/api/v1/benefits/${benefitId}/enrol`)
        .set('Authorization', `Bearer ${employer.token}`)
        .send({ employeeId: employeeRecord.id });

      expect(res.status).toBe(201);
      expect(res.body).toHaveProperty('id');
      expect(res.body.employee_id).toBe(employeeRecord.id);
      expect(res.body.benefit_id).toBe(benefitId);
      expect(res.body.status).toBe('active');
    });

    it('re-enrolment (idempotent upsert) → 201 with active status', async () => {
      const res = await request
        .post(`/api/v1/benefits/${benefitId}/enrol`)
        .set('Authorization', `Bearer ${employer.token}`)
        .send({ employeeId: employeeRecord.id });

      expect(res.status).toBe(201);
      expect(res.body.status).toBe('active');
    });

    it('enrol with nonexistent employee → 404', async () => {
      const res = await request
        .post(`/api/v1/benefits/${benefitId}/enrol`)
        .set('Authorization', `Bearer ${employer.token}`)
        .send({ employeeId: '00000000-0000-0000-0000-000000000000' });

      expect(res.status).toBe(404);
      expect(res.body).toEqual({ error: 'Employee not found' });
    });

    it('enrol with nonexistent benefit → 404', async () => {
      const res = await request
        .post('/api/v1/benefits/00000000-0000-0000-0000-000000000000/enrol')
        .set('Authorization', `Bearer ${employer.token}`)
        .send({ employeeId: employeeRecord.id });

      expect(res.status).toBe(404);
      expect(res.body).toEqual({ error: 'Benefit not found' });
    });

    it('employee cannot enrol → 403', async () => {
      const res = await request
        .post(`/api/v1/benefits/${benefitId}/enrol`)
        .set('Authorization', `Bearer ${employeeToken}`)
        .send({ employeeId: employeeRecord.id });

      expect(res.status).toBe(403);
      expect(res.body).toEqual({ error: 'Employer access required' });
    });

    it('missing employeeId → 400', async () => {
      const res = await request
        .post(`/api/v1/benefits/${benefitId}/enrol`)
        .set('Authorization', `Bearer ${employer.token}`)
        .send({});

      expect(res.status).toBe(400);
      expect(res.body).toHaveProperty('error');
    });

    it('non-UUID employeeId → 400', async () => {
      const res = await request
        .post(`/api/v1/benefits/${benefitId}/enrol`)
        .set('Authorization', `Bearer ${employer.token}`)
        .send({ employeeId: 'not-a-uuid' });

      expect(res.status).toBe(400);
      expect(res.body).toHaveProperty('error');
    });
  });
});
