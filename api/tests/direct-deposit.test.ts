import {
  request,
  createTestEmployer,
  createTestEmployee,
  loginAsEmployee,
  cleanupTestData,
  type TestEmployer,
  type TestEmployee,
} from './setup';

describe('Direct Deposit Routes', () => {
  let employer: TestEmployer;
  let empRecord: TestEmployee;
  let empCookie: string[];
  let empRecord2: TestEmployee;
  let empCookie2: string[];

  beforeAll(async () => {
    const ts = Date.now();
    employer   = await createTestEmployer(`dd-${ts}`);
    empRecord  = await createTestEmployee(employer.cookie, `dd-emp-${ts}`);
    empRecord2 = await createTestEmployee(employer.cookie, `dd-emp2-${ts}`);
    empCookie   = await loginAsEmployee(empRecord.email);
    empCookie2  = await loginAsEmployee(empRecord2.email);
  }, 30_000);

  afterAll(async () => {
    await cleanupTestData(employer.tenantId);
  });

  it('GET returns empty array before any bank info saved', async () => {
    const res = await request
      .get(`/api/v1/employees/${empRecord.id}/direct-deposit`)
      .set('Cookie', empCookie);
    expect(res.status).toBe(200);
    expect(res.body).toEqual([]);
  });

  it('employee saves direct deposit → 200 with masked account', async () => {
    const res = await request
      .put(`/api/v1/employees/${empRecord.id}/direct-deposit`)
      .set('Cookie', empCookie)
      .send({
        bankName:      'Chase Bank',
        routingNumber: '021000021',
        accountNumber: '123456789012',
        accountType:   'checking',
        isPrimary:     true,
      });

    expect(res.status).toBe(200);
    expect(res.body.bank_name).toBe('Chase Bank');
    expect(res.body.account_type).toBe('checking');
    // Full account number must NOT appear in response
    expect(res.body.account_number).not.toContain('12345678');
    // Last 4 digits must be visible
    expect(res.body.account_number).toContain('9012');
  });

  it('GET returns masked account and routing', async () => {
    const res = await request
      .get(`/api/v1/employees/${empRecord.id}/direct-deposit`)
      .set('Cookie', empCookie);

    expect(res.status).toBe(200);
    expect(res.body.length).toBe(1);
    const acct = res.body[0];
    expect(acct.account_number).toContain('9012');
    expect(acct.routing_number).not.toBe('021000021'); // must be masked
    expect(acct.routing_number).toContain('0021');     // last 4 visible
  });

  it('routing number must be exactly 9 digits → 400 otherwise', async () => {
    const res = await request
      .put(`/api/v1/employees/${empRecord.id}/direct-deposit`)
      .set('Cookie', empCookie)
      .send({
        bankName: 'Bad Bank', routingNumber: '1234', accountNumber: '999999',
        accountType: 'checking',
      });
    expect(res.status).toBe(400);
  });

  it('employer can read their employee direct deposit', async () => {
    const res = await request
      .get(`/api/v1/employees/${empRecord.id}/direct-deposit`)
      .set('Cookie', employer.cookie);
    expect(res.status).toBe(200);
    expect(res.body.length).toBeGreaterThan(0);
  });

  it('employee cannot read another employee direct deposit → 403', async () => {
    const res = await request
      .get(`/api/v1/employees/${empRecord.id}/direct-deposit`)
      .set('Cookie', empCookie2);
    expect(res.status).toBe(403);
  });

  it('savings account type accepted', async () => {
    const res = await request
      .put(`/api/v1/employees/${empRecord2.id}/direct-deposit`)
      .set('Cookie', empCookie2)
      .send({
        bankName: 'Bank of America', routingNumber: '026009593',
        accountNumber: '987654321', accountType: 'savings',
      });
    expect(res.status).toBe(200);
    expect(res.body.account_type).toBe('savings');
  });
});
