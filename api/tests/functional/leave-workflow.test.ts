import {
  request,
  createTestEmployer,
  createTestEmployee,
  loginAsEmployee,
  cleanupTestData,
  TestEmployer,
  TestEmployee,
} from '../setup';

describe('Leave Workflow (functional)', () => {
  let employer: TestEmployer;
  let empA: TestEmployee;
  let empB: TestEmployee;
  let empAToken: string;
  let empBToken: string;

  beforeAll(async () => {
    const suffix = `lw-${Date.now()}`;
    employer = await createTestEmployer(`functional-leave-${suffix}`);

    empA = await createTestEmployee(employer.token, `lw-a-${suffix}`);
    empB = await createTestEmployee(employer.token, `lw-b-${suffix}`);

    empAToken = await loginAsEmployee(empA.email);
    empBToken = await loginAsEmployee(empB.email);
  });

  afterAll(async () => {
    await cleanupTestData(employer.tenantId);
  });

  let leaveIdA: string;
  let leaveIdB: string;

  it('employee submits leave request → status is pending', async () => {
    const res = await request
      .post('/api/v1/leave')
      .set('Authorization', `Bearer ${empAToken}`)
      .send({
        leaveType: 'annual',
        startDate: '2025-03-10',
        endDate: '2025-03-14',
        daysRequested: 5,
        reason: 'Holiday',
      });

    expect(res.status).toBe(201);
    expect(res.body.status).toBe('pending');
    leaveIdA = res.body.id;
  });

  it('employer sees the pending leave request in GET /leave list', async () => {
    const res = await request
      .get('/api/v1/leave')
      .set('Authorization', `Bearer ${employer.token}`);

    expect(res.status).toBe(200);
    const ids = (res.body as Array<{ id: string }>).map((r) => r.id);
    expect(ids).toContain(leaveIdA);
  });

  it("a second employee CANNOT see the first employee's leave request", async () => {
    const res = await request
      .get('/api/v1/leave')
      .set('Authorization', `Bearer ${empBToken}`);

    expect(res.status).toBe(200);
    const ids = (res.body as Array<{ id: string }>).map((r) => r.id);
    expect(ids).not.toContain(leaveIdA);
  });

  it('employer approves the leave → status becomes approved, reviewed_at and reviewed_by are set', async () => {
    const res = await request
      .patch(`/api/v1/leave/${leaveIdA}/approve`)
      .set('Authorization', `Bearer ${employer.token}`);

    expect(res.status).toBe(200);
    expect(res.body.status).toBe('approved');
    expect(res.body.reviewed_at).toBeTruthy();
    expect(res.body.reviewed_by).toBe(employer.user.id);
  });

  it('employer approves the same leave again → idempotent or client error, not 500', async () => {
    const res = await request
      .patch(`/api/v1/leave/${leaveIdA}/approve`)
      .set('Authorization', `Bearer ${employer.token}`);

    expect(res.status).not.toBe(500);
    // Either idempotent 200 with approved status, or 400/409
    if (res.status === 200) {
      expect(res.body.status).toBe('approved');
    }
  });

  it('employer rejects a different pending leave → status becomes rejected', async () => {
    // Employee B submits a leave request first
    const submitRes = await request
      .post('/api/v1/leave')
      .set('Authorization', `Bearer ${empBToken}`)
      .send({
        leaveType: 'sick',
        startDate: '2025-04-01',
        endDate: '2025-04-02',
        daysRequested: 2,
        reason: 'Unwell',
      });
    expect(submitRes.status).toBe(201);
    leaveIdB = submitRes.body.id;

    const res = await request
      .patch(`/api/v1/leave/${leaveIdB}/reject`)
      .set('Authorization', `Bearer ${employer.token}`);

    expect(res.status).toBe(200);
    expect(res.body.status).toBe('rejected');
    expect(res.body.reviewed_by).toBe(employer.user.id);
  });

  it('employee trying to approve own leave returns 403', async () => {
    // Employee A submits another leave
    const submitRes = await request
      .post('/api/v1/leave')
      .set('Authorization', `Bearer ${empAToken}`)
      .send({
        leaveType: 'other',
        startDate: '2025-05-01',
        endDate: '2025-05-01',
        daysRequested: 1,
      });
    expect(submitRes.status).toBe(201);
    const newLeaveId = submitRes.body.id;

    const res = await request
      .patch(`/api/v1/leave/${newLeaveId}/approve`)
      .set('Authorization', `Bearer ${empAToken}`);

    expect(res.status).toBe(403);
  });

  it("employee trying to reject someone else's leave returns 403", async () => {
    // Employee A tries to reject Employee B's leave
    const res = await request
      .patch(`/api/v1/leave/${leaveIdB}/reject`)
      .set('Authorization', `Bearer ${empAToken}`);

    expect(res.status).toBe(403);
  });

  it('employer trying to approve non-existent leave returns 404', async () => {
    const fakeId = '00000000-0000-0000-0000-000000000000';
    const res = await request
      .patch(`/api/v1/leave/${fakeId}/approve`)
      .set('Authorization', `Bearer ${employer.token}`);

    expect(res.status).toBe(404);
  });

  it('employee can submit multiple leave types (annual, sick, other) in one run', async () => {
    const leaveTypes = [
      { leaveType: 'annual', startDate: '2025-06-01', endDate: '2025-06-05', daysRequested: 5 },
      { leaveType: 'sick', startDate: '2025-07-10', endDate: '2025-07-11', daysRequested: 2 },
      { leaveType: 'other', startDate: '2025-08-15', endDate: '2025-08-15', daysRequested: 1 },
    ];

    for (const payload of leaveTypes) {
      const res = await request
        .post('/api/v1/leave')
        .set('Authorization', `Bearer ${empAToken}`)
        .send(payload);

      expect(res.status).toBe(201);
      expect(res.body.leave_type).toBe(payload.leaveType);
      expect(res.body.status).toBe('pending');
    }
  });
});
