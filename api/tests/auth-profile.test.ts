import {
  request,
  createTestEmployer,
  createTestEmployee,
  loginAsEmployee,
  cleanupTestData,
  type TestEmployer,
} from './setup';

describe('Auth — Profile Update (PATCH /me)', () => {
  let employer: TestEmployer;
  let employeeToken: string;

  beforeAll(async () => {
    const ts = Date.now();
    employer = await createTestEmployer(`auth-profile-${ts}`);
    const emp = await createTestEmployee(employer.token, `auth-profile-emp-${ts}`);
    employeeToken = await loginAsEmployee(emp.email);
  }, 30_000);

  afterAll(async () => {
    await cleanupTestData(employer.tenantId);
  });

  it('employer can update their own full name', async () => {
    const res = await request
      .patch('/api/v1/auth/me')
      .set('Authorization', `Bearer ${employer.token}`)
      .send({ fullName: 'Updated Employer Name' });

    expect(res.status).toBe(200);
    expect(res.body.fullName).toBe('Updated Employer Name');
  });

  it('employer can add a phone number', async () => {
    const res = await request
      .patch('/api/v1/auth/me')
      .set('Authorization', `Bearer ${employer.token}`)
      .send({ phone: '+1-555-000-1234' });

    expect(res.status).toBe(200);
    expect(res.body.phone).toBe('+1-555-000-1234');
  });

  it('employee can update their own profile', async () => {
    const res = await request
      .patch('/api/v1/auth/me')
      .set('Authorization', `Bearer ${employeeToken}`)
      .send({ fullName: 'Updated Employee Name' });

    expect(res.status).toBe(200);
    expect(res.body.fullName).toBe('Updated Employee Name');
  });

  it('PATCH /me with no fields → 400', async () => {
    const res = await request
      .patch('/api/v1/auth/me')
      .set('Authorization', `Bearer ${employer.token}`)
      .send({});

    expect(res.status).toBe(400);
  });

  it('PATCH /me without auth → 401', async () => {
    const res = await request
      .patch('/api/v1/auth/me')
      .send({ fullName: 'Hacker' });

    expect(res.status).toBe(401);
  });

  it('PATCH /me returns updated user (phone can be cleared to null)', async () => {
    // Set phone first
    await request
      .patch('/api/v1/auth/me')
      .set('Authorization', `Bearer ${employer.token}`)
      .send({ phone: '+44-20-7946-0958' });

    // Clear it
    const res = await request
      .patch('/api/v1/auth/me')
      .set('Authorization', `Bearer ${employer.token}`)
      .send({ phone: null });

    expect(res.status).toBe(200);
    expect(res.body.phone).toBeNull();
  });
});
