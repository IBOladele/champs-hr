import {
  request,
  createTestEmployer,
  createTestEmployee,
  loginAsEmployee,
  cleanupTestData,
  type TestEmployer,
  type TestEmployee,
} from './setup';

describe('Leave — Cancel', () => {
  let employer: TestEmployer;
  let empRecord: TestEmployee;
  let empRecord2: TestEmployee;
  let empToken: string;
  let empToken2: string;

  beforeAll(async () => {
    const ts = Date.now();
    employer   = await createTestEmployer(`lv-cancel-${ts}`);
    empRecord  = await createTestEmployee(employer.token, `lv-cancel-emp-${ts}`);
    empRecord2 = await createTestEmployee(employer.token, `lv-cancel-emp2-${ts}`);
    empToken   = await loginAsEmployee(empRecord.email);
    empToken2  = await loginAsEmployee(empRecord2.email);
  }, 30_000);

  afterAll(async () => {
    await cleanupTestData(employer.tenantId);
  });

  async function createLeaveRequest(token: string) {
    const res = await request
      .post('/api/v1/leave')
      .set('Authorization', `Bearer ${token}`)
      .send({
        leaveType:     'annual_leave',
        startDate:     '2026-12-01',
        endDate:       '2026-12-05',
        daysRequested: 5,
        reason:        'Vacation',
      });
    expect(res.status).toBe(201);
    return res.body as { id: string; status: string };
  }

  it('employee can cancel their own pending leave request', async () => {
    const leave = await createLeaveRequest(empToken);

    const res = await request
      .patch(`/api/v1/leave/${leave.id}/cancel`)
      .set('Authorization', `Bearer ${empToken}`);

    expect(res.status).toBe(200);
    expect(res.body.status).toBe('cancelled');
  });

  it('employee cannot cancel another employee leave request → 403', async () => {
    const leave = await createLeaveRequest(empToken);

    const res = await request
      .patch(`/api/v1/leave/${leave.id}/cancel`)
      .set('Authorization', `Bearer ${empToken2}`);

    expect(res.status).toBe(403);
  });

  it('employer can cancel any pending leave request', async () => {
    const leave = await createLeaveRequest(empToken);

    const res = await request
      .patch(`/api/v1/leave/${leave.id}/cancel`)
      .set('Authorization', `Bearer ${employer.token}`);

    expect(res.status).toBe(200);
    expect(res.body.status).toBe('cancelled');
  });

  it('cannot cancel an already-approved leave request → 409', async () => {
    const leave = await createLeaveRequest(empToken);

    // Approve it first
    await request
      .patch(`/api/v1/leave/${leave.id}/approve`)
      .set('Authorization', `Bearer ${employer.token}`);

    // Attempt to cancel the approved request
    const res = await request
      .patch(`/api/v1/leave/${leave.id}/cancel`)
      .set('Authorization', `Bearer ${employer.token}`);

    expect(res.status).toBe(409);
  });

  it('cancel unknown leave request → 404', async () => {
    const res = await request
      .patch('/api/v1/leave/00000000-0000-0000-0000-000000000000/cancel')
      .set('Authorization', `Bearer ${employer.token}`);

    expect(res.status).toBe(404);
  });
});
