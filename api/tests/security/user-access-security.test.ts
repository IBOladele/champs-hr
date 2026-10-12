/**
 * User Access Security Tests
 *
 * Covers authentication, authorization, and tenant isolation
 * for the /user-access routes.
 */

import {
  request,
  createTestEmployer,
  createTestEmployee,
  loginAsEmployee,
  cleanupTestData,
  type TestEmployer,
  type TestEmployee,
} from '../setup';

describe('User Access Security', () => {
  let employer: TestEmployer;
  let employerB: TestEmployer;
  let employee: TestEmployee;
  let employeeCookie: string[];

  beforeAll(async () => {
    const ts = Date.now();
    employer = await createTestEmployer(`ua-sec-a-${ts}`);
    employerB = await createTestEmployer(`ua-sec-b-${ts}`);
    employee = await createTestEmployee(employer.cookie, `ua-emp-${ts}`);
    employeeCookie = await loginAsEmployee(employee.email);
  });

  afterAll(async () => {
    await cleanupTestData(employer.tenantId);
    await cleanupTestData(employerB.tenantId);
  });

  it('GET /user-access without auth → 401', async () => {
    const res = await request.get('/api/v1/user-access');
    expect(res.status).toBe(401);
  });

  it('GET /user-access with employee cookie → 403', async () => {
    const res = await request
      .get('/api/v1/user-access')
      .set('Cookie', employeeCookie);
    expect(res.status).toBe(403);
  });

  it('POST /user-access without auth → 401', async () => {
    const res = await request.post('/api/v1/user-access').send({
      userId: employee.userId,
      portalRole: 'Viewer',
      permissions: {},
    });
    expect(res.status).toBe(401);
  });

  it('DELETE /user-access/:userId without auth → 401', async () => {
    const res = await request.delete(`/api/v1/user-access/${employee.userId}`);
    expect(res.status).toBe(401);
  });

  it('POST /user-access — employer cannot grant access to user from another tenant → 404', async () => {
    // Create an employee under employerB
    const empB = await createTestEmployee(employerB.cookie, `ua-empb-${Date.now()}`);

    // EmployerA tries to grant access to EmployerB's employee
    const res = await request
      .post('/api/v1/user-access')
      .set('Cookie', employer.cookie)
      .send({
        userId: empB.userId,
        portalRole: 'Viewer',
        permissions: {},
      });
    expect(res.status).toBe(404);
  });

  it('POST /user-access — cannot modify owner\'s access → 400 "Owner access cannot be modified"', async () => {
    // employer.user.id is the owner of their tenant
    const res = await request
      .post('/api/v1/user-access')
      .set('Cookie', employer.cookie)
      .send({
        userId: employer.user.id,
        portalRole: 'Viewer',
        permissions: {},
      });
    expect(res.status).toBe(400);
    expect(res.body.error).toBe('Owner access cannot be modified');
  });

  it('DELETE /user-access/:userId — cannot revoke owner → 400 "Owner access cannot be revoked"', async () => {
    const res = await request
      .delete(`/api/v1/user-access/${employer.user.id}`)
      .set('Cookie', employer.cookie);
    expect(res.status).toBe(400);
    expect(res.body.error).toBe('Owner access cannot be revoked');
  });

  it('GET /user-access — returns only users from current tenant (tenant isolation)', async () => {
    // employerB should not see employer's users
    const res = await request
      .get('/api/v1/user-access')
      .set('Cookie', employerB.cookie);
    expect(res.status).toBe(200);
    const ids = (res.body as Array<{ id: string }>).map((u) => u.id);
    // employer's user and employee should not appear in employerB's list
    expect(ids).not.toContain(employer.user.id);
    expect(ids).not.toContain(employee.userId);
  });

  it('POST /user-access — granting access then GET shows the user with portalRole', async () => {
    // Grant access to employee
    const grantRes = await request
      .post('/api/v1/user-access')
      .set('Cookie', employer.cookie)
      .send({
        userId: employee.userId,
        portalRole: 'HR_Manager',
        permissions: { canViewPayroll: false, canManageLeave: true },
      });
    expect(grantRes.status).toBe(201);
    expect(grantRes.body.portalRole).toBe('HR_Manager');

    const listRes = await request
      .get('/api/v1/user-access')
      .set('Cookie', employer.cookie);
    expect(listRes.status).toBe(200);
    const grantedUser = (listRes.body as Array<{ id: string; portalRole: string | null }>)
      .find((u) => u.id === employee.userId);
    expect(grantedUser).toBeDefined();
    expect(grantedUser!.portalRole).toBe('HR_Manager');
  });

  it('DELETE /user-access/:userId — after revoke, user no longer appears in list', async () => {
    // First grant access (in case previous test cleaned up)
    await request
      .post('/api/v1/user-access')
      .set('Cookie', employer.cookie)
      .send({
        userId: employee.userId,
        portalRole: 'Viewer',
        permissions: {},
      });

    // Now revoke
    const revokeRes = await request
      .delete(`/api/v1/user-access/${employee.userId}`)
      .set('Cookie', employer.cookie);
    expect(revokeRes.status).toBe(204);

    // GET should no longer include this user
    const listRes = await request
      .get('/api/v1/user-access')
      .set('Cookie', employer.cookie);
    expect(listRes.status).toBe(200);
    const found = (listRes.body as Array<{ id: string }>).find((u) => u.id === employee.userId);
    expect(found).toBeUndefined();
  });

  it('POST /user-access with invalid UUID userId → 400', async () => {
    const res = await request
      .post('/api/v1/user-access')
      .set('Cookie', employer.cookie)
      .send({
        userId: 'not-a-uuid',
        portalRole: 'Viewer',
        permissions: {},
      });
    expect(res.status).toBe(400);
    expect(res.body).toHaveProperty('error');
  });

  it('POST /user-access with missing permissions field → 400', async () => {
    const res = await request
      .post('/api/v1/user-access')
      .set('Cookie', employer.cookie)
      .send({
        userId: employee.userId,
        portalRole: 'Viewer',
        // permissions field is missing
      });
    expect(res.status).toBe(400);
    expect(res.body).toHaveProperty('error');
  });
});
