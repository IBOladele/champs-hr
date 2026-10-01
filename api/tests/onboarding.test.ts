import {
  request,
  createTestEmployer,
  createTestEmployee,
  loginAsEmployee,
  cleanupTestData,
  type TestEmployer,
} from './setup';

describe('Onboarding Routes', () => {
  let employer: TestEmployer;

  beforeAll(async () => {
    employer = await createTestEmployer(`onboard-${Date.now()}`);
  }, 30_000);

  afterAll(async () => {
    await cleanupTestData(employer.tenantId);
  });

  // -----------------------------------------------------------------------
  // GET /api/v1/onboarding
  // -----------------------------------------------------------------------
  describe('GET /api/v1/onboarding', () => {
    it('fresh employer → 200 with step=0, completed=false, settings={}', async () => {
      const res = await request
        .get('/api/v1/onboarding')
        .set('Cookie', employer.cookie);

      expect(res.status).toBe(200);
      expect(res.body).toMatchObject({
        step: 0,
        completed: false,
      });
      expect(res.body).toHaveProperty('settings');
    });

    it('unauthenticated → 401', async () => {
      const res = await request.get('/api/v1/onboarding');

      expect(res.status).toBe(401);
    });
  });

  // -----------------------------------------------------------------------
  // PATCH /api/v1/onboarding/step/0 — company profile
  // -----------------------------------------------------------------------
  describe('PATCH /api/v1/onboarding/step/0', () => {
    const validStep0 = {
      companyName:  'Acme Industries',
      country:      'United Kingdom',
      businessSize: '10-50',
      industry:     'Technology',
      timezone:     'Europe/London',
      currency:     'GBP',
      address:      '123 Test Street, London',
    };

    it('valid company profile → 200 { ok: true, step: 1 }', async () => {
      const res = await request
        .patch('/api/v1/onboarding/step/0')
        .set('Cookie', employer.cookie)
        .send(validStep0);

      expect(res.status).toBe(200);
      expect(res.body).toEqual({ ok: true, step: 1 });
    });

    it('step advances to 1 — subsequent GET returns step≥1', async () => {
      const res = await request
        .get('/api/v1/onboarding')
        .set('Cookie', employer.cookie);

      expect(res.status).toBe(200);
      expect(res.body.step).toBeGreaterThanOrEqual(1);
    });

    it('missing required fields → 400 with Zod error', async () => {
      const res = await request
        .patch('/api/v1/onboarding/step/0')
        .set('Cookie', employer.cookie)
        .send({
          // missing companyName, country, businessSize, etc.
          currency: 'GBP',
        });

      expect(res.status).toBe(400);
      expect(res.body).toHaveProperty('error');
      expect(Array.isArray(res.body.error)).toBe(true);
    });

    it('unauthenticated → 401', async () => {
      const res = await request
        .patch('/api/v1/onboarding/step/0')
        .send(validStep0);

      expect(res.status).toBe(401);
    });
  });

  // -----------------------------------------------------------------------
  // PATCH /api/v1/onboarding/step/3 — payroll config
  // -----------------------------------------------------------------------
  describe('PATCH /api/v1/onboarding/step/3', () => {
    it('invalid payFrequency → 400 with Zod error', async () => {
      const res = await request
        .patch('/api/v1/onboarding/step/3')
        .set('Cookie', employer.cookie)
        .send({
          payFrequency: 'quarterly', // not in enum
          payDay:       '25',
          baseCurrency: 'GBP',
        });

      expect(res.status).toBe(400);
      expect(res.body).toHaveProperty('error');
      expect(Array.isArray(res.body.error)).toBe(true);
    });

    it('valid step 3 data → 200 { ok: true, step: 4 }', async () => {
      const res = await request
        .patch('/api/v1/onboarding/step/3')
        .set('Cookie', employer.cookie)
        .send({
          payFrequency: 'monthly',
          payDay:       '25',
          baseCurrency: 'GBP',
        });

      expect(res.status).toBe(200);
      expect(res.body).toEqual({ ok: true, step: 4 });
    });
  });

  // -----------------------------------------------------------------------
  // PATCH /api/v1/onboarding/step/99 — invalid step
  // -----------------------------------------------------------------------
  describe('PATCH /api/v1/onboarding/step/:step — invalid step number', () => {
    it('step 99 → 400 invalid step number', async () => {
      const res = await request
        .patch('/api/v1/onboarding/step/99')
        .set('Cookie', employer.cookie)
        .send({ anything: 'ignored' });

      expect(res.status).toBe(400);
      expect(res.body).toHaveProperty('error');
    });

    it('step -1 → 400 invalid step number', async () => {
      const res = await request
        .patch('/api/v1/onboarding/step/-1')
        .set('Cookie', employer.cookie)
        .send({ anything: 'ignored' });

      expect(res.status).toBe(400);
      expect(res.body).toHaveProperty('error');
    });
  });

  // -----------------------------------------------------------------------
  // POST /api/v1/onboarding/invite
  // -----------------------------------------------------------------------
  describe('POST /api/v1/onboarding/invite', () => {
    it('valid emails → 200 { ok: true, sent: [...], skipped: [] }', async () => {
      const tag = Date.now();
      const res = await request
        .post('/api/v1/onboarding/invite')
        .set('Cookie', employer.cookie)
        .send({
          emails: [
            `invite-a-${tag}@test-champs.com`,
            `invite-b-${tag}@test-champs.com`,
          ],
        });

      expect(res.status).toBe(200);
      expect(res.body.ok).toBe(true);
      expect(Array.isArray(res.body.sent)).toBe(true);
      expect(Array.isArray(res.body.skipped)).toBe(true);
      expect(res.body.sent.length).toBeGreaterThanOrEqual(1);
    });

    it('already-invited email → appears in skipped on second invite', async () => {
      const tag = Date.now();
      const email = `dupe-invite-${tag}@test-champs.com`;

      // First invite
      await request
        .post('/api/v1/onboarding/invite')
        .set('Cookie', employer.cookie)
        .send({ emails: [email] });

      // Second invite — should be skipped
      const res = await request
        .post('/api/v1/onboarding/invite')
        .set('Cookie', employer.cookie)
        .send({ emails: [email] });

      expect(res.status).toBe(200);
      expect(res.body.skipped).toContain(email);
    });

    it('invalid email → 400 with Zod error', async () => {
      const res = await request
        .post('/api/v1/onboarding/invite')
        .set('Cookie', employer.cookie)
        .send({ emails: ['not-a-valid-email'] });

      expect(res.status).toBe(400);
      expect(res.body).toHaveProperty('error');
    });

    it('empty emails array → 400', async () => {
      const res = await request
        .post('/api/v1/onboarding/invite')
        .set('Cookie', employer.cookie)
        .send({ emails: [] });

      expect(res.status).toBe(400);
      expect(res.body).toHaveProperty('error');
    });

    it('missing emails field → 400', async () => {
      const res = await request
        .post('/api/v1/onboarding/invite')
        .set('Cookie', employer.cookie)
        .send({});

      expect(res.status).toBe(400);
      expect(res.body).toHaveProperty('error');
    });

    it('unauthenticated → 401', async () => {
      const res = await request
        .post('/api/v1/onboarding/invite')
        .send({ emails: ['test@example.com'] });

      expect(res.status).toBe(401);
    });
  });

  // -----------------------------------------------------------------------
  // POST /api/v1/onboarding/complete
  // -----------------------------------------------------------------------
  describe('POST /api/v1/onboarding/complete', () => {
    it('complete → 200 { ok: true }', async () => {
      const res = await request
        .post('/api/v1/onboarding/complete')
        .set('Cookie', employer.cookie);

      expect(res.status).toBe(200);
      expect(res.body).toEqual({ ok: true });
    });

    it('after complete, GET shows completed=true', async () => {
      const res = await request
        .get('/api/v1/onboarding')
        .set('Cookie', employer.cookie);

      expect(res.status).toBe(200);
      expect(res.body.completed).toBe(true);
    });

    it('unauthenticated → 401', async () => {
      const res = await request.post('/api/v1/onboarding/complete');

      expect(res.status).toBe(401);
    });
  });

  // -----------------------------------------------------------------------
  // Employee role → 403 on all onboarding routes
  // -----------------------------------------------------------------------
  describe('Employee role — access denied', () => {
    let employeeCookie: string[];

    beforeAll(async () => {
      const empRecord = await createTestEmployee(employer.cookie, `onboard-emp-${Date.now()}`);
      employeeCookie = await loginAsEmployee(empRecord.email);
    }, 30_000);

    it('GET /onboarding as employee → 403', async () => {
      const res = await request
        .get('/api/v1/onboarding')
        .set('Cookie', employeeCookie);

      expect(res.status).toBe(403);
    });

    it('PATCH /onboarding/step/0 as employee → 403', async () => {
      const res = await request
        .patch('/api/v1/onboarding/step/0')
        .set('Cookie', employeeCookie)
        .send({
          companyName: 'Hacker Corp',
          country: 'UK',
          businessSize: '1',
          industry: 'Tech',
          timezone: 'UTC',
          currency: 'GBP',
          address: '1 Test St',
        });

      expect(res.status).toBe(403);
    });

    it('POST /onboarding/invite as employee → 403', async () => {
      const res = await request
        .post('/api/v1/onboarding/invite')
        .set('Cookie', employeeCookie)
        .send({ emails: [`employee-invite-${Date.now()}@test.com`] });

      expect(res.status).toBe(403);
    });

    it('POST /onboarding/complete as employee → 403', async () => {
      const res = await request
        .post('/api/v1/onboarding/complete')
        .set('Cookie', employeeCookie);

      expect(res.status).toBe(403);
    });
  });
});
