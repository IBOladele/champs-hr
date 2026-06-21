import {
  request,
  createTestEmployer,
  cleanupTestData,
  TestEmployer,
} from './setup';

describe('Auth Routes', () => {
  let employer: TestEmployer;

  beforeAll(async () => {
    employer = await createTestEmployer(`auth-${Date.now()}`);
  });

  afterAll(async () => {
    await cleanupTestData(employer.tenantId);
  });

  // -----------------------------------------------------------------------
  // POST /api/v1/auth/signup
  // -----------------------------------------------------------------------
  describe('POST /api/v1/auth/signup', () => {
    it('valid data → 201 with accessToken and employer user', async () => {
      const tag = Date.now();
      const res = await request.post('/api/v1/auth/signup').send({
        email: `signup-new-${tag}@test-champs.com`,
        password: 'Password123!',
        fullName: 'New Employer',
        companyName: `New Corp ${tag}`,
      });

      expect(res.status).toBe(201);
      expect(res.body).toHaveProperty('accessToken');
      expect(typeof res.body.accessToken).toBe('string');
      expect(res.body.user).toMatchObject({
        email: `signup-new-${tag}@test-champs.com`,
        role: 'employer',
        fullName: 'New Employer',
      });
      expect(res.body.user).toHaveProperty('id');
      expect(res.body.user).toHaveProperty('tenantId');

      // Clean up the extra tenant created by this test
      await cleanupTestData(res.body.user.tenantId);
    });

    it('duplicate email → 400 or 409 error', async () => {
      // employer.user.email was already registered in beforeAll
      const res = await request.post('/api/v1/auth/signup').send({
        email: employer.user.email,
        password: 'Password123!',
        fullName: 'Duplicate User',
        companyName: `Duplicate Corp ${Date.now()}`,
      });

      expect(res.status).toBeGreaterThanOrEqual(400);
      expect(res.status).toBeLessThan(500);
    });

    it('missing required fields → 400 with error array', async () => {
      const res = await request.post('/api/v1/auth/signup').send({
        email: 'incomplete@test-champs.com',
        // missing password, fullName, companyName
      });

      expect(res.status).toBe(400);
      expect(res.body).toHaveProperty('error');
      expect(Array.isArray(res.body.error)).toBe(true);
    });

    it('invalid email format → 400', async () => {
      const res = await request.post('/api/v1/auth/signup').send({
        email: 'not-an-email',
        password: 'Password123!',
        fullName: 'Someone',
        companyName: 'Some Corp',
      });

      expect(res.status).toBe(400);
      expect(res.body).toHaveProperty('error');
    });

    it('password too short (< 8 chars) → 400', async () => {
      const res = await request.post('/api/v1/auth/signup').send({
        email: `short-pw-${Date.now()}@test-champs.com`,
        password: 'abc',
        fullName: 'Someone',
        companyName: 'Some Corp',
      });

      expect(res.status).toBe(400);
      expect(res.body).toHaveProperty('error');
    });
  });

  // -----------------------------------------------------------------------
  // POST /api/v1/auth/login
  // -----------------------------------------------------------------------
  describe('POST /api/v1/auth/login', () => {
    it('valid credentials → 200 with accessToken and user', async () => {
      const res = await request.post('/api/v1/auth/login').send({
        email: employer.user.email,
        password: 'Password123!',
      });

      expect(res.status).toBe(200);
      expect(res.body).toHaveProperty('accessToken');
      expect(typeof res.body.accessToken).toBe('string');
      expect(res.body.user).toMatchObject({
        email: employer.user.email,
        role: 'employer',
      });
    });

    it('wrong password → 401 with Invalid credentials', async () => {
      const res = await request.post('/api/v1/auth/login').send({
        email: employer.user.email,
        password: 'WrongPassword!',
      });

      expect(res.status).toBe(401);
      expect(res.body).toEqual({ error: 'Invalid credentials' });
    });

    it('unknown email → 401 with Invalid credentials', async () => {
      const res = await request.post('/api/v1/auth/login').send({
        email: 'nobody-exists@test-champs.com',
        password: 'Password123!',
      });

      expect(res.status).toBe(401);
      expect(res.body).toEqual({ error: 'Invalid credentials' });
    });

    it('missing email field → 400', async () => {
      const res = await request.post('/api/v1/auth/login').send({
        password: 'Password123!',
      });

      expect(res.status).toBe(400);
      expect(res.body).toHaveProperty('error');
    });
  });

  // -----------------------------------------------------------------------
  // GET /api/v1/auth/me
  // -----------------------------------------------------------------------
  describe('GET /api/v1/auth/me', () => {
    it('valid token → 200 with full user object', async () => {
      const res = await request
        .get('/api/v1/auth/me')
        .set('Authorization', `Bearer ${employer.token}`);

      expect(res.status).toBe(200);
      expect(res.body).toMatchObject({
        id: employer.user.id,
        email: employer.user.email,
        role: 'employer',
        tenantId: employer.tenantId,
        fullName: employer.user.fullName,
      });
      expect(res.body).toHaveProperty('createdAt');
    });

    it('no token → 401 with Missing or malformed Authorization header', async () => {
      const res = await request.get('/api/v1/auth/me');

      expect(res.status).toBe(401);
      expect(res.body).toEqual({
        error: 'Missing or malformed Authorization header',
      });
    });

    it('invalid/tampered token → 401 with Invalid or expired token', async () => {
      const res = await request
        .get('/api/v1/auth/me')
        .set('Authorization', 'Bearer this.is.not.a.real.jwt');

      expect(res.status).toBe(401);
      expect(res.body).toEqual({ error: 'Invalid or expired token' });
    });

    it('Bearer prefix missing → 401', async () => {
      const res = await request
        .get('/api/v1/auth/me')
        .set('Authorization', employer.token); // no "Bearer " prefix

      expect(res.status).toBe(401);
      expect(res.body).toEqual({
        error: 'Missing or malformed Authorization header',
      });
    });
  });
});
