import {
  request,
  createTestEmployer,
  createTestEmployee,
  loginAsEmployee,
  cleanupTestData,
  TestEmployer,
  TestEmployee,
} from './setup';

describe('Payroll Routes', () => {
  let employer: TestEmployer;
  let employeeRecord: TestEmployee;
  let employeeToken: string;

  beforeAll(async () => {
    const ts = Date.now();
    employer = await createTestEmployer(`payroll-${ts}`);
    employeeRecord = await createTestEmployee(employer.token, `payroll-emp-${ts}`);
    employeeToken = await loginAsEmployee(employeeRecord.email);
  });

  afterAll(async () => {
    await cleanupTestData(employer.tenantId);
  });

  // -----------------------------------------------------------------------
  // POST /api/v1/payroll — create payroll run
  // -----------------------------------------------------------------------
  describe('POST /api/v1/payroll', () => {
    it('employer creates payroll run → 201 with run record', async () => {
      const res = await request
        .post('/api/v1/payroll')
        .set('Authorization', `Bearer ${employer.token}`)
        .send({
          periodStart: '2025-07-01',
          periodEnd: '2025-07-31',
        });

      expect(res.status).toBe(201);
      expect(res.body).toHaveProperty('id');
      expect(res.body.status).toBe('draft');
      // PostgreSQL DATE columns may return timestamps offset by timezone. Check the date is
      // within 1 day of what was sent (handles BST/UTC boundary shifts).
      const startDate = new Date(res.body.period_start);
      const endDate   = new Date(res.body.period_end);
      const diffStart = Math.abs(startDate.getTime() - new Date('2025-07-01').getTime());
      const diffEnd   = Math.abs(endDate.getTime()   - new Date('2025-07-31').getTime());
      expect(diffStart).toBeLessThanOrEqual(24 * 60 * 60 * 1000); // within 1 day
      expect(diffEnd).toBeLessThanOrEqual(24 * 60 * 60 * 1000);
      expect(parseFloat(res.body.total_gross)).toBeGreaterThan(0);
      expect(parseFloat(res.body.total_net)).toBeGreaterThan(0);
      expect(parseFloat(res.body.total_deductions)).toBeGreaterThan(0);
    });

    it('payroll run total_net = total_gross - total_deductions', async () => {
      const res = await request
        .post('/api/v1/payroll')
        .set('Authorization', `Bearer ${employer.token}`)
        .send({
          periodStart: '2025-08-01',
          periodEnd: '2025-08-31',
        });

      expect(res.status).toBe(201);
      const gross = parseFloat(res.body.total_gross);
      const deductions = parseFloat(res.body.total_deductions);
      const net = parseFloat(res.body.total_net);
      expect(Math.abs(gross - deductions - net)).toBeLessThan(0.02); // floating point tolerance
    });

    it('employee tries to create payroll → 403', async () => {
      const res = await request
        .post('/api/v1/payroll')
        .set('Authorization', `Bearer ${employeeToken}`)
        .send({
          periodStart: '2025-07-01',
          periodEnd: '2025-07-31',
        });

      expect(res.status).toBe(403);
      expect(res.body).toEqual({ error: 'Employer access required' });
    });

    it('missing periodStart → 400', async () => {
      const res = await request
        .post('/api/v1/payroll')
        .set('Authorization', `Bearer ${employer.token}`)
        .send({ periodEnd: '2025-07-31' });

      expect(res.status).toBe(400);
      expect(res.body).toHaveProperty('error');
    });

    it('no token → 401', async () => {
      const res = await request.post('/api/v1/payroll').send({
        periodStart: '2025-07-01',
        periodEnd: '2025-07-31',
      });

      expect(res.status).toBe(401);
    });
  });

  // -----------------------------------------------------------------------
  // GET /api/v1/payroll — list payroll runs
  // -----------------------------------------------------------------------
  describe('GET /api/v1/payroll', () => {
    beforeAll(async () => {
      // Ensure at least two runs exist so we can verify ordering
      await request
        .post('/api/v1/payroll')
        .set('Authorization', `Bearer ${employer.token}`)
        .send({ periodStart: '2025-05-01', periodEnd: '2025-05-31' });

      await request
        .post('/api/v1/payroll')
        .set('Authorization', `Bearer ${employer.token}`)
        .send({ periodStart: '2025-06-01', periodEnd: '2025-06-30' });
    });

    it('employer gets list sorted by created_at desc → 200', async () => {
      const res = await request
        .get('/api/v1/payroll')
        .set('Authorization', `Bearer ${employer.token}`);

      expect(res.status).toBe(200);
      expect(Array.isArray(res.body)).toBe(true);
      expect(res.body.length).toBeGreaterThanOrEqual(2);

      // Verify descending order
      const dates = (res.body as Array<{ created_at: string }>).map(
        (r) => new Date(r.created_at).getTime()
      );
      for (let i = 1; i < dates.length; i++) {
        expect(dates[i - 1]).toBeGreaterThanOrEqual(dates[i]);
      }
    });

    it('each run in list has expected fields', async () => {
      const res = await request
        .get('/api/v1/payroll')
        .set('Authorization', `Bearer ${employer.token}`);

      expect(res.status).toBe(200);
      const run = res.body[0];
      expect(run).toHaveProperty('id');
      expect(run).toHaveProperty('period_start');
      expect(run).toHaveProperty('period_end');
      expect(run).toHaveProperty('status');
      expect(run).toHaveProperty('total_gross');
      expect(run).toHaveProperty('total_net');
      expect(run).toHaveProperty('total_deductions');
      expect(run).toHaveProperty('created_at');
    });

    it('employee cannot list payroll runs → 403', async () => {
      const res = await request
        .get('/api/v1/payroll')
        .set('Authorization', `Bearer ${employeeToken}`);

      expect(res.status).toBe(403);
    });
  });

  // -----------------------------------------------------------------------
  // GET /api/v1/payroll/:id — get run with items
  // -----------------------------------------------------------------------
  describe('GET /api/v1/payroll/:id', () => {
    let runId: string;

    beforeAll(async () => {
      const res = await request
        .post('/api/v1/payroll')
        .set('Authorization', `Bearer ${employer.token}`)
        .send({ periodStart: '2025-09-01', periodEnd: '2025-09-30' });
      runId = res.body.id as string;
    });

    it('employer gets payroll run with items → 200', async () => {
      const res = await request
        .get(`/api/v1/payroll/${runId}`)
        .set('Authorization', `Bearer ${employer.token}`);

      expect(res.status).toBe(200);
      expect(res.body.id).toBe(runId);
      expect(Array.isArray(res.body.items)).toBe(true);
      expect(res.body.items.length).toBeGreaterThanOrEqual(1);

      const item = res.body.items[0];
      expect(item).toHaveProperty('employee_id');
      expect(item).toHaveProperty('employee_name');
      expect(item).toHaveProperty('gross_pay');
      expect(item).toHaveProperty('net_pay');
      expect(item).toHaveProperty('deductions');
    });

    it('each payroll item has expected deduction fields', async () => {
      const res = await request
        .get(`/api/v1/payroll/${runId}`)
        .set('Authorization', `Bearer ${employer.token}`);

      const item = res.body.items[0];
      const deductions = item.deductions as {
        tax: number;
        nationalInsurance: number;
        total: number;
      };
      expect(deductions).toHaveProperty('tax');
      expect(deductions).toHaveProperty('nationalInsurance');
      expect(deductions).toHaveProperty('total');
      // gross * 0.2 = tax, gross * 0.05 = NI
      const gross = parseFloat(item.gross_pay);
      expect(Math.abs(deductions.tax - gross * 0.2)).toBeLessThan(0.02);
      expect(Math.abs(deductions.nationalInsurance - gross * 0.05)).toBeLessThan(0.02);
    });

    it('nonexistent run id → 404', async () => {
      const res = await request
        .get('/api/v1/payroll/00000000-0000-0000-0000-000000000000')
        .set('Authorization', `Bearer ${employer.token}`);

      expect(res.status).toBe(404);
      expect(res.body).toEqual({ error: 'Payroll run not found' });
    });
  });

  // -----------------------------------------------------------------------
  // PATCH /api/v1/payroll/:id/approve — mark run as completed
  // -----------------------------------------------------------------------
  describe('PATCH /api/v1/payroll/:id/approve', () => {
    let runId: string;

    beforeAll(async () => {
      const res = await request
        .post('/api/v1/payroll')
        .set('Authorization', `Bearer ${employer.token}`)
        .send({ periodStart: '2025-10-01', periodEnd: '2025-10-31' });
      runId = res.body.id as string;
    });

    it('employer approves payroll run → status = completed', async () => {
      const res = await request
        .patch(`/api/v1/payroll/${runId}/approve`)
        .set('Authorization', `Bearer ${employer.token}`);

      expect(res.status).toBe(200);
      expect(res.body.status).toBe('completed');
    });

    it('employee tries to approve payroll → 403', async () => {
      const res = await request
        .patch(`/api/v1/payroll/${runId}/approve`)
        .set('Authorization', `Bearer ${employeeToken}`);

      expect(res.status).toBe(403);
    });

    it('approve nonexistent run → 404', async () => {
      const res = await request
        .patch('/api/v1/payroll/00000000-0000-0000-0000-000000000000/approve')
        .set('Authorization', `Bearer ${employer.token}`);

      expect(res.status).toBe(404);
      expect(res.body).toEqual({ error: 'Payroll run not found' });
    });
  });
});
