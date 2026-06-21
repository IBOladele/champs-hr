import {
  request,
  createTestEmployer,
  createTestEmployee,
  loginAsEmployee,
  cleanupTestData,
  TestEmployer,
  TestEmployee,
} from './setup';

describe('Leave Routes', () => {
  let employer: TestEmployer;
  let employeeRecord: TestEmployee;
  let employeeToken: string;

  beforeAll(async () => {
    const ts = Date.now();
    employer = await createTestEmployer(`leave-${ts}`);
    employeeRecord = await createTestEmployee(employer.token, `leave-emp-${ts}`);
    employeeToken = await loginAsEmployee(employeeRecord.email);
  });

  afterAll(async () => {
    await cleanupTestData(employer.tenantId);
  });

  // -----------------------------------------------------------------------
  // POST /api/v1/leave — create leave request
  // -----------------------------------------------------------------------
  describe('POST /api/v1/leave', () => {
    it('employee creates leave request → 201 with correct fields', async () => {
      const res = await request
        .post('/api/v1/leave')
        .set('Authorization', `Bearer ${employeeToken}`)
        .send({
          leaveType: 'annual',
          startDate: '2025-09-01',
          endDate: '2025-09-05',
          daysRequested: 5,
          reason: 'Summer holiday',
        });

      expect(res.status).toBe(201);
      expect(res.body).toHaveProperty('id');
      expect(res.body).toMatchObject({
        leave_type: 'annual',
        status: 'pending',
        days_requested: '5.0',
        reason: 'Summer holiday',
      });
    });

    it('leave request without reason → 201 (reason is optional)', async () => {
      const res = await request
        .post('/api/v1/leave')
        .set('Authorization', `Bearer ${employeeToken}`)
        .send({
          leaveType: 'sick',
          startDate: '2025-10-01',
          endDate: '2025-10-02',
          daysRequested: 2,
        });

      expect(res.status).toBe(201);
      expect(res.body.leave_type).toBe('sick');
      expect(res.body.reason).toBeNull();
    });

    it('missing required fields → 400', async () => {
      const res = await request
        .post('/api/v1/leave')
        .set('Authorization', `Bearer ${employeeToken}`)
        .send({
          leaveType: 'annual',
          // missing startDate, endDate, daysRequested
        });

      expect(res.status).toBe(400);
      expect(res.body).toHaveProperty('error');
    });

    it('no token → 401', async () => {
      const res = await request.post('/api/v1/leave').send({
        leaveType: 'annual',
        startDate: '2025-09-01',
        endDate: '2025-09-05',
        daysRequested: 5,
      });

      expect(res.status).toBe(401);
    });
  });

  // -----------------------------------------------------------------------
  // GET /api/v1/leave
  // -----------------------------------------------------------------------
  describe('GET /api/v1/leave', () => {
    beforeAll(async () => {
      // Ensure at least one leave request exists
      await request
        .post('/api/v1/leave')
        .set('Authorization', `Bearer ${employeeToken}`)
        .send({
          leaveType: 'annual',
          startDate: '2025-11-01',
          endDate: '2025-11-03',
          daysRequested: 3,
          reason: 'Family event',
        });
    });

    it('employer can see all leave requests in the tenant', async () => {
      const res = await request
        .get('/api/v1/leave')
        .set('Authorization', `Bearer ${employer.token}`);

      expect(res.status).toBe(200);
      expect(Array.isArray(res.body)).toBe(true);
      expect(res.body.length).toBeGreaterThanOrEqual(1);
      // Employer response includes employee info
      expect(res.body[0]).toHaveProperty('employee_id');
      expect(res.body[0]).toHaveProperty('employee_name');
    });

    it('employee can only see their own leave requests', async () => {
      // Create a second employee in same tenant
      const secondEmp = await createTestEmployee(
        employer.token,
        `leave-emp2-${Date.now()}`
      );
      const secondToken = await loginAsEmployee(secondEmp.email);

      // Second employee creates a leave request
      await request
        .post('/api/v1/leave')
        .set('Authorization', `Bearer ${secondToken}`)
        .send({
          leaveType: 'sick',
          startDate: '2025-12-01',
          endDate: '2025-12-01',
          daysRequested: 1,
        });

      // First employee fetches leave — should only see their own
      const res = await request
        .get('/api/v1/leave')
        .set('Authorization', `Bearer ${employeeToken}`);

      expect(res.status).toBe(200);
      const leaveItems = res.body as Array<{ employee_id: string }>;
      const uniqueEmployeeIds = [
        ...new Set(leaveItems.map((l) => l.employee_id)),
      ];
      // All leave items should belong to employeeRecord
      expect(uniqueEmployeeIds).toHaveLength(1);
      expect(uniqueEmployeeIds[0]).toBe(employeeRecord.id);
    });
  });

  // -----------------------------------------------------------------------
  // PATCH /api/v1/leave/:id/approve and /reject
  // -----------------------------------------------------------------------
  describe('Leave approval and rejection', () => {
    let leaveId: string;

    beforeAll(async () => {
      const res = await request
        .post('/api/v1/leave')
        .set('Authorization', `Bearer ${employeeToken}`)
        .send({
          leaveType: 'annual',
          startDate: '2026-01-10',
          endDate: '2026-01-14',
          daysRequested: 5,
          reason: 'New Year break',
        });
      leaveId = res.body.id as string;
    });

    it('employer approves leave → status becomes approved', async () => {
      const res = await request
        .patch(`/api/v1/leave/${leaveId}/approve`)
        .set('Authorization', `Bearer ${employer.token}`);

      expect(res.status).toBe(200);
      expect(res.body.status).toBe('approved');
      expect(res.body.reviewed_at).not.toBeNull();
    });

    it('employee tries to approve own leave → 403', async () => {
      // Create a fresh pending leave to attempt approval
      const newLeave = await request
        .post('/api/v1/leave')
        .set('Authorization', `Bearer ${employeeToken}`)
        .send({
          leaveType: 'sick',
          startDate: '2026-02-01',
          endDate: '2026-02-01',
          daysRequested: 1,
        });
      const newLeaveId = newLeave.body.id as string;

      const res = await request
        .patch(`/api/v1/leave/${newLeaveId}/approve`)
        .set('Authorization', `Bearer ${employeeToken}`);

      expect(res.status).toBe(403);
      expect(res.body).toEqual({ error: 'Employer access required' });
    });

    it('employer rejects leave → status becomes rejected', async () => {
      const rejectTarget = await request
        .post('/api/v1/leave')
        .set('Authorization', `Bearer ${employeeToken}`)
        .send({
          leaveType: 'annual',
          startDate: '2026-03-01',
          endDate: '2026-03-03',
          daysRequested: 3,
        });
      const rejectId = rejectTarget.body.id as string;

      const res = await request
        .patch(`/api/v1/leave/${rejectId}/reject`)
        .set('Authorization', `Bearer ${employer.token}`);

      expect(res.status).toBe(200);
      expect(res.body.status).toBe('rejected');
      expect(res.body.reviewed_at).not.toBeNull();
    });

    it('approve nonexistent leave → 404', async () => {
      const res = await request
        .patch('/api/v1/leave/00000000-0000-0000-0000-000000000000/approve')
        .set('Authorization', `Bearer ${employer.token}`);

      expect(res.status).toBe(404);
      expect(res.body).toEqual({ error: 'Leave request not found' });
    });

    it('employee tries to reject own leave → 403', async () => {
      const newLeave = await request
        .post('/api/v1/leave')
        .set('Authorization', `Bearer ${employeeToken}`)
        .send({
          leaveType: 'sick',
          startDate: '2026-04-01',
          endDate: '2026-04-01',
          daysRequested: 1,
        });

      const res = await request
        .patch(`/api/v1/leave/${newLeave.body.id}/reject`)
        .set('Authorization', `Bearer ${employeeToken}`);

      expect(res.status).toBe(403);
    });
  });
});
