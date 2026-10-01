import {
  request,
  createTestEmployer,
  createTestEmployee,
  loginAsEmployee,
  cleanupTestData,
  type TestEmployer,
  type TestEmployee,
} from './setup';

describe('I-9 Routes', () => {
  let employer: TestEmployer;
  let empRecord: TestEmployee;
  let empToken: string;
  let empRecord2: TestEmployee;
  let empToken2: string;

  beforeAll(async () => {
    const ts = Date.now();
    employer   = await createTestEmployer(`i9-${ts}`);
    empRecord  = await createTestEmployee(employer.token, `i9-emp-${ts}`);
    empRecord2 = await createTestEmployee(employer.token, `i9-emp2-${ts}`);
    empToken   = await loginAsEmployee(empRecord.email);
    empToken2  = await loginAsEmployee(empRecord2.email);
  }, 30_000);

  afterAll(async () => {
    await cleanupTestData(employer.tenantId);
  });

  it('GET /employees/:id/i9 returns 404 before anything is filed', async () => {
    const res = await request
      .get(`/api/v1/employees/${empRecord.id}/i9`)
      .set('Authorization', `Bearer ${employer.token}`);
    expect(res.status).toBe(404);
  });

  it('employee submits Section 1 → status remains pending', async () => {
    const res = await request
      .put(`/api/v1/employees/${empRecord.id}/i9/section1`)
      .set('Authorization', `Bearer ${empToken}`)
      .send({ citizenshipStatus: 'us_citizen' });

    expect(res.status).toBe(200);
    expect(res.body.citizenship_status).toBe('us_citizen');
    expect(res.body.status).toBe('pending');
    expect(res.body.section1_completed_at).toBeTruthy();
  });

  it('GET /employees/:id/i9 shows pending after Section 1', async () => {
    const res = await request
      .get(`/api/v1/employees/${empRecord.id}/i9`)
      .set('Authorization', `Bearer ${employer.token}`);

    expect(res.status).toBe(200);
    expect(res.body.status).toBe('pending');
    expect(res.body.section2_completed_at).toBeNull();
  });

  it('employee cannot complete Section 2 → 403', async () => {
    const res = await request
      .put(`/api/v1/employees/${empRecord.id}/i9/section2`)
      .set('Authorization', `Bearer ${empToken}`)
      .send({
        docListUsed: 'list_a',
        docTitle: 'US Passport',
        docIssuingAuthority: 'US State Dept',
        docNumber: 'ABC123456',
        docExpiry: '2030-01-01',
      });
    expect(res.status).toBe(403);
  });

  it('employer completes Section 2 → status becomes completed', async () => {
    const res = await request
      .put(`/api/v1/employees/${empRecord.id}/i9/section2`)
      .set('Authorization', `Bearer ${employer.token}`)
      .send({
        docListUsed: 'list_a',
        docTitle: 'US Passport',
        docIssuingAuthority: 'US State Dept',
        docNumber: 'ABC123456',
        docExpiry: '2030-01-01',
      });

    expect(res.status).toBe(200);
    expect(res.body.status).toBe('completed');
    expect(res.body.section2_completed_at).toBeTruthy();
    expect(res.body.doc_list_used).toBe('list_a');
  });

  it('GET after Section 2 shows completed', async () => {
    const res = await request
      .get(`/api/v1/employees/${empRecord.id}/i9`)
      .set('Authorization', `Bearer ${employer.token}`);
    expect(res.status).toBe(200);
    expect(res.body.status).toBe('completed');
  });

  it('Section 2 without Section 1 first → 404', async () => {
    const res = await request
      .put(`/api/v1/employees/${empRecord2.id}/i9/section2`)
      .set('Authorization', `Bearer ${employer.token}`)
      .send({
        docListUsed: 'list_b_c',
        docTitle: "Driver's License + Social Security Card",
        docIssuingAuthority: 'DMV / SSA',
        docNumber: 'DL9876543',
      });
    expect(res.status).toBe(404);
  });

  it('alien_authorized citizenship includes authorized_through date', async () => {
    const res = await request
      .put(`/api/v1/employees/${empRecord2.id}/i9/section1`)
      .set('Authorization', `Bearer ${empToken2}`)
      .send({
        citizenshipStatus: 'alien_authorized',
        alienRegNumber: 'A123456789',
        authorizedThrough: '2027-06-30',
      });

    expect(res.status).toBe(200);
    expect(res.body.citizenship_status).toBe('alien_authorized');
    expect(res.body.authorized_through).toBe('2027-06-30');
  });

  it('employee cannot read another employee I-9 (employer-only route) → 403', async () => {
    const res = await request
      .get(`/api/v1/employees/${empRecord.id}/i9`)
      .set('Authorization', `Bearer ${empToken}`);
    expect(res.status).toBe(403);
  });
});
