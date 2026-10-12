/**
 * User Access Workflow Tests (functional)
 *
 * Full CRUD lifecycle for portal user access management:
 *   list → grant → update → revoke
 */

import {
  request,
  createTestEmployer,
  createTestEmployee,
  cleanupTestData,
  type TestEmployer,
  type TestEmployee,
} from '../setup';

describe('User Access Workflow (functional)', () => {
  let employer: TestEmployer;
  let employee: TestEmployee;

  beforeAll(async () => {
    const ts = Date.now();
    employer = await createTestEmployer(`ua-wf-${ts}`);
    employee = await createTestEmployee(employer.cookie, `ua-wf-emp-${ts}`);
  });

  afterAll(async () => {
    await cleanupTestData(employer.tenantId);
  });

  it('1. Employer can list their own portal users (initially just themselves as owner)', async () => {
    const res = await request
      .get('/api/v1/user-access')
      .set('Cookie', employer.cookie);

    expect(res.status).toBe(200);
    expect(Array.isArray(res.body)).toBe(true);

    // Owner should be present
    const owner = (res.body as Array<{ isOwner: boolean; id: string }>).find((u) => u.isOwner);
    expect(owner).toBeDefined();
    expect(owner!.id).toBe(employer.user.id);

    // The employee we created has no portalRole yet so should not appear
    const empEntry = (res.body as Array<{ id: string }>).find((u) => u.id === employee.userId);
    expect(empEntry).toBeUndefined();
  });

  it('2. Employer creates an employee and grants them portal access with HR_Manager role', async () => {
    const res = await request
      .post('/api/v1/user-access')
      .set('Cookie', employer.cookie)
      .send({
        userId: employee.userId,
        portalRole: 'HR_Manager',
        permissions: { canViewPayroll: false, canManageLeave: true, canViewEmployees: true },
      });

    expect(res.status).toBe(201);
    expect(res.body.id).toBe(employee.userId);
    expect(res.body.portalRole).toBe('HR_Manager');
    expect(res.body.isOwner).toBe(false);
    expect(res.body.portalPermissions).toMatchObject({
      canViewPayroll: false,
      canManageLeave: true,
      canViewEmployees: true,
    });
  });

  it('3. GET /user-access now shows 2 users (owner + employee with HR_Manager role)', async () => {
    const res = await request
      .get('/api/v1/user-access')
      .set('Cookie', employer.cookie);

    expect(res.status).toBe(200);
    expect(res.body).toHaveLength(2);

    const owner = (res.body as Array<{ isOwner: boolean }>).find((u) => u.isOwner);
    expect(owner).toBeDefined();

    const grantedUser = (res.body as Array<{ id: string; portalRole: string | null }>)
      .find((u) => u.id === employee.userId);
    expect(grantedUser).toBeDefined();
    expect(grantedUser!.portalRole).toBe('HR_Manager');
  });

  it('4. Update the employee\'s portal role to "Viewer" via POST (upsert)', async () => {
    const res = await request
      .post('/api/v1/user-access')
      .set('Cookie', employer.cookie)
      .send({
        userId: employee.userId,
        portalRole: 'Viewer',
        permissions: { canViewPayroll: false, canManageLeave: false, canViewEmployees: true },
      });

    expect(res.status).toBe(201);
    expect(res.body.portalRole).toBe('Viewer');
  });

  it('5. GET /user-access shows updated role as "Viewer"', async () => {
    const res = await request
      .get('/api/v1/user-access')
      .set('Cookie', employer.cookie);

    expect(res.status).toBe(200);
    const grantedUser = (res.body as Array<{ id: string; portalRole: string | null }>)
      .find((u) => u.id === employee.userId);
    expect(grantedUser).toBeDefined();
    expect(grantedUser!.portalRole).toBe('Viewer');
  });

  it('6. DELETE /user-access/:userId revokes access', async () => {
    const res = await request
      .delete(`/api/v1/user-access/${employee.userId}`)
      .set('Cookie', employer.cookie);

    expect(res.status).toBe(204);
  });

  it('7. GET /user-access shows only 1 user (owner) after revocation', async () => {
    const res = await request
      .get('/api/v1/user-access')
      .set('Cookie', employer.cookie);

    expect(res.status).toBe(200);
    // Only owner remains
    expect(res.body).toHaveLength(1);

    const onlyUser = res.body[0] as { isOwner: boolean; id: string };
    expect(onlyUser.isOwner).toBe(true);
    expect(onlyUser.id).toBe(employer.user.id);

    // Revoked employee should not appear
    const empEntry = (res.body as Array<{ id: string }>).find((u) => u.id === employee.userId);
    expect(empEntry).toBeUndefined();
  });

  it('8. Owner always has isOwner: true and cannot be revoked', async () => {
    const listRes = await request
      .get('/api/v1/user-access')
      .set('Cookie', employer.cookie);
    expect(listRes.status).toBe(200);

    const owner = (listRes.body as Array<{ isOwner: boolean; id: string }>).find((u) => u.isOwner);
    expect(owner).toBeDefined();
    expect(owner!.isOwner).toBe(true);

    // Attempt to revoke owner
    const revokeRes = await request
      .delete(`/api/v1/user-access/${employer.user.id}`)
      .set('Cookie', employer.cookie);
    expect(revokeRes.status).toBe(400);
    expect(revokeRes.body.error).toBe('Owner access cannot be revoked');

    // Owner still appears after failed revoke
    const afterRes = await request
      .get('/api/v1/user-access')
      .set('Cookie', employer.cookie);
    const stillOwner = (afterRes.body as Array<{ isOwner: boolean; id: string }>)
      .find((u) => u.id === employer.user.id);
    expect(stillOwner).toBeDefined();
    expect(stillOwner!.isOwner).toBe(true);
  });
});
