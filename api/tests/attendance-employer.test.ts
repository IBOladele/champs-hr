import {
  request,
  createTestEmployer,
  createTestEmployee,
  loginAsEmployee,
  cleanupTestData,
  type TestEmployer,
  type TestEmployee,
} from './setup';

describe('Attendance — Employer Manual Operations', () => {
  let employer: TestEmployer;
  let empRecord: TestEmployee;
  let employeeCookie: string[];

  beforeAll(async () => {
    const ts = Date.now();
    employer    = await createTestEmployer(`att-emp-${ts}`);
    empRecord   = await createTestEmployee(employer.cookie, `att-emp-emp-${ts}`);
    employeeCookie = await loginAsEmployee(empRecord.email);
  }, 30_000);

  afterAll(async () => {
    await cleanupTestData(employer.tenantId);
  });

  it('employer can POST a manual attendance record', async () => {
    const res = await request
      .post('/api/v1/attendance')
      .set('Cookie', employer.cookie)
      .send({
        employeeId: empRecord.id,
        date:       '2025-03-15',
        status:     'present',
        notes:      'Manual entry',
      });

    expect(res.status).toBe(201);
    expect(res.body.status).toBe('present');
    expect(res.body.employee_id).toBe(empRecord.id);
  });

  it('employer POST is idempotent (upsert on same date)', async () => {
    await request
      .post('/api/v1/attendance')
      .set('Cookie', employer.cookie)
      .send({ employeeId: empRecord.id, date: '2025-03-20', status: 'present' });

    const res = await request
      .post('/api/v1/attendance')
      .set('Cookie', employer.cookie)
      .send({ employeeId: empRecord.id, date: '2025-03-20', status: 'absent' });

    expect(res.status).toBe(201);
    expect(res.body.status).toBe('absent');
  });

  it('employee cannot POST a manual attendance record → 403', async () => {
    const res = await request
      .post('/api/v1/attendance')
      .set('Cookie', employeeCookie)
      .send({ employeeId: empRecord.id, date: '2025-03-16', status: 'present' });

    expect(res.status).toBe(403);
  });

  it('POST with invalid status → 400', async () => {
    const res = await request
      .post('/api/v1/attendance')
      .set('Cookie', employer.cookie)
      .send({ employeeId: empRecord.id, date: '2025-03-17', status: 'invalid_status' });

    expect(res.status).toBe(400);
  });

  it('employer can PATCH an existing attendance record status', async () => {
    const createRes = await request
      .post('/api/v1/attendance')
      .set('Cookie', employer.cookie)
      .send({ employeeId: empRecord.id, date: '2025-04-01', status: 'present' });

    expect(createRes.status).toBe(201);
    const recordId = createRes.body.id;

    const patchRes = await request
      .patch(`/api/v1/attendance/${recordId}`)
      .set('Cookie', employer.cookie)
      .send({ status: 'late', notes: 'Updated note' });

    expect(patchRes.status).toBe(200);
    expect(patchRes.body.status).toBe('late');
    expect(patchRes.body.notes).toBe('Updated note');
  });

  it('PATCH unknown attendance record → 404', async () => {
    const res = await request
      .patch('/api/v1/attendance/00000000-0000-0000-0000-000000000000')
      .set('Cookie', employer.cookie)
      .send({ status: 'absent' });

    expect(res.status).toBe(404);
  });

  it('employee cannot PATCH attendance records → 403', async () => {
    const createRes = await request
      .post('/api/v1/attendance')
      .set('Cookie', employer.cookie)
      .send({ employeeId: empRecord.id, date: '2025-04-05', status: 'present' });

    const recordId = createRes.body.id;

    const res = await request
      .patch(`/api/v1/attendance/${recordId}`)
      .set('Cookie', employeeCookie)
      .send({ status: 'absent' });

    expect(res.status).toBe(403);
  });
});
