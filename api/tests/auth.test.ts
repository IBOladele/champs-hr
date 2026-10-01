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
    it('valid data → 201 with session cookie and employer user', async () => {
      const tag = Date.now();
      const res = await request.post('/api/v1/auth/signup').send({
        email: `signup-new-${tag}@test-champs.com`,
        password: 'Password123!',
        fullName: 'New Employer',
        companyName: `New Corp ${tag}`,
      });

      expect(res.status).toBe(201);
      // Cookie-based auth: no accessToken in body
      expect(res.body).not.toHaveProperty('accessToken');
      expect(res.headers['set-cookie']).toBeDefined();
      const cookieHeader = (res.headers['set-cookie'] as unknown as string[]).join(';');
      expect(cookieHeader).toContain('champs_session=');
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
    it('valid credentials → 200 with session cookie and user', async () => {
      const res = await request.post('/api/v1/auth/login').send({
        email: employer.user.email,
        password: 'Password123!',
      });

      expect(res.status).toBe(200);
      expect(res.body).not.toHaveProperty('accessToken');
      expect(res.headers['set-cookie']).toBeDefined();
      const cookieHeader = (res.headers['set-cookie'] as unknown as string[]).join(';');
      expect(cookieHeader).toContain('champs_session=');
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
    it('valid cookie → 200 with full user object', async () => {
      const res = await request
        .get('/api/v1/auth/me')
        .set('Cookie', employer.cookie);

      expect(res.status).toBe(200);
      expect(res.body).toMatchObject({
        id: employer.user.id,
        email: employer.user.email,
        role: 'employer',
        tenantId: employer.tenantId,
        fullName: employer.user.fullName,
      });
    });

    it('no cookie → 401 with Not authenticated', async () => {
      const res = await request.get('/api/v1/auth/me');

      expect(res.status).toBe(401);
      expect(res.body).toEqual({ error: 'Not authenticated' });
    });

    it('tampered cookie value → 401 with Invalid or expired session', async () => {
      const res = await request
        .get('/api/v1/auth/me')
        .set('Cookie', ['champs_session=this.is.not.a.real.jwt']);

      expect(res.status).toBe(401);
      expect(res.body).toEqual({ error: 'Invalid or expired session' });
    });

    it('cookie with empty value → 401', async () => {
      const res = await request
        .get('/api/v1/auth/me')
        .set('Cookie', ['champs_session=']);

      expect(res.status).toBe(401);
    });
  });

  // -----------------------------------------------------------------------
  // POST /api/v1/auth/verify-email
  // -----------------------------------------------------------------------
  describe('POST /api/v1/auth/verify-email', () => {
    it('invalid token → 400 with error message', async () => {
      const res = await request.post('/api/v1/auth/verify-email').send({
        token: 'completely-invalid-token-that-does-not-exist',
      });

      expect(res.status).toBe(400);
      expect(res.body).toHaveProperty('error');
    });

    it('missing token body → 400', async () => {
      const res = await request.post('/api/v1/auth/verify-email').send({});

      expect(res.status).toBe(400);
      expect(res.body).toHaveProperty('error');
    });
  });

  // -----------------------------------------------------------------------
  // POST /api/v1/auth/resend-verification
  // -----------------------------------------------------------------------
  describe('POST /api/v1/auth/resend-verification', () => {
    it('authenticated → 200 or 429 (if sent recently)', async () => {
      const res = await request
        .post('/api/v1/auth/resend-verification')
        .set('Cookie', employer.cookie);

      // 200 ok or 400 already-verified or 429 rate-limit — all are valid
      expect([200, 400, 429]).toContain(res.status);
    });

    it('unauthenticated → 401', async () => {
      const res = await request.post('/api/v1/auth/resend-verification');

      expect(res.status).toBe(401);
    });
  });
});
