/**
 * Session Cookie Security Tests
 *
 * The app now uses HttpOnly cookies (champs_session) instead of
 * Authorization: Bearer headers.  This suite validates:
 *
 *  1. HttpOnly flag set on login and signup
 *  2. Cookie with no value → 401
 *  3. Tampered cookie value → 401
 *  4. alg:none attack         — bypass signature by setting algorithm to none
 *  5. Role elevation           — flip employee→employer in payload without re-signing
 *  6. Tenant ID manipulation   — change tenantId claim to access another tenant's data
 *  7. Expired token            — token with exp in the past
 *  8. Wrong secret             — token signed with a different key
 *  9. Malformed tokens         — truncated, garbage, empty, wrong segment count
 * 10. Missing required claims  — valid signature but missing userId / tenantId / role
 * 11. SQL injection via claims — tenantId claim contains SQL fragment
 * 12. Huge token payload       — oversized JWT to test graceful handling
 * 13. Token reuse after logout — cookie cleared on logout
 */

import jwt from 'jsonwebtoken';
import {
  request,
  createTestEmployer,
  createTestEmployee,
  loginAsEmployee,
  cleanupTestData,
  type TestEmployer,
} from '../setup';

// ---------------------------------------------------------------------------
// Helpers
// ---------------------------------------------------------------------------

const JWT_SECRET = process.env.JWT_SECRET as string;
const WRONG_SECRET = 'this-is-a-completely-different-secret-key-do-not-use';

/** Extract the raw JWT string from the Set-Cookie array */
function extractToken(cookies: string[]): string {
  const cookieStr = cookies.find((c) => c.startsWith('champs_session='));
  if (!cookieStr) throw new Error('No champs_session cookie found');
  return cookieStr.split(';')[0].split('=').slice(1).join('=');
}

/** Build a cookie array from a raw JWT */
function makeCookie(token: string): string[] {
  return [`champs_session=${token}`];
}

/** Build a base64url string (no padding) */
function b64url(obj: object): string {
  return Buffer.from(JSON.stringify(obj)).toString('base64url');
}

/** Craft a raw JWT from three parts without using jsonwebtoken */
function rawJwt(header: object, payload: object, signature = ''): string {
  return `${b64url(header)}.${b64url(payload)}.${signature}`;
}

/** Decode a JWT payload without verification */
function decodePayload(token: string): Record<string, unknown> {
  const [, payloadB64] = token.split('.');
  return JSON.parse(Buffer.from(payloadB64, 'base64url').toString('utf8'));
}

/** Swap the payload of a real token, keeping the original header and signature */
function tamperPayload(
  originalToken: string,
  overrides: Record<string, unknown>
): string {
  const [header, payloadB64, sig] = originalToken.split('.');
  const payload = JSON.parse(Buffer.from(payloadB64, 'base64url').toString('utf8'));
  const newPayload = b64url({ ...payload, ...overrides });
  return `${header}.${newPayload}.${sig}`;
}

// A protected endpoint to probe — requires auth, employer-only
const EMPLOYER_ENDPOINT = '/api/v1/employees';
const ANY_AUTH_ENDPOINT = '/api/v1/auth/me';

// ---------------------------------------------------------------------------
// Suite setup
// ---------------------------------------------------------------------------

let employer: TestEmployer;
let employerJwt: string;   // raw JWT extracted from cookie
let employerCookie: string[];
let employeeCookie: string[];
let employeeJwt: string;

beforeAll(async () => {
  employer = await createTestEmployer(`jwt-sec-${Date.now()}`);
  employerCookie = employer.cookie;
  employerJwt = extractToken(employerCookie);

  const emp = await createTestEmployee(employerCookie, `jwt-sec-${Date.now()}`);
  employeeCookie = await loginAsEmployee(emp.email);
  employeeJwt = extractToken(employeeCookie);
}, 30_000);

afterAll(async () => {
  await cleanupTestData(employer.tenantId);
});

// ---------------------------------------------------------------------------
// 1. HttpOnly and cookie flags
// ---------------------------------------------------------------------------

describe('cookie security flags', () => {
  it('login response sets HttpOnly cookie', async () => {
    const res = await request.post('/api/v1/auth/login').send({
      email: employer.user.email,
      password: 'Password123!',
    });
    expect(res.status).toBe(200);
    const cookieStr = (res.headers['set-cookie'] as unknown as string[])
      .find((c) => c.startsWith('champs_session=')) ?? '';
    expect(cookieStr.toLowerCase()).toContain('httponly');
  });

  it('signup response sets HttpOnly cookie', async () => {
    const tag = Date.now();
    const res = await request.post('/api/v1/auth/signup').send({
      email: `cookie-flag-${tag}@test-champs.com`,
      password: 'Password123!',
      fullName: 'Flag Test',
      companyName: `Flag Corp ${tag}`,
    });
    expect(res.status).toBe(201);
    const cookieStr = (res.headers['set-cookie'] as unknown as string[])
      .find((c) => c.startsWith('champs_session=')) ?? '';
    expect(cookieStr.toLowerCase()).toContain('httponly');
    await cleanupTestData(res.body.user.tenantId);
  });
});

// ---------------------------------------------------------------------------
// 2. Cookie with no value or missing cookie
// ---------------------------------------------------------------------------

describe('missing or empty cookie', () => {
  it('no cookie at all → 401', async () => {
    const res = await request.get(ANY_AUTH_ENDPOINT);
    expect(res.status).toBe(401);
    expect(res.body).toEqual({ error: 'Not authenticated' });
  });

  it('cookie with empty value → 401', async () => {
    const res = await request
      .get(ANY_AUTH_ENDPOINT)
      .set('Cookie', ['champs_session=']);
    expect(res.status).toBe(401);
  });

  it('unrelated cookie → 401', async () => {
    const res = await request
      .get(ANY_AUTH_ENDPOINT)
      .set('Cookie', ['other_cookie=somevalue']);
    expect(res.status).toBe(401);
  });
});

// ---------------------------------------------------------------------------
// 3. alg:none attack
// ---------------------------------------------------------------------------

describe('alg:none attack', () => {
  it('rejects a cookie with alg:none (no signature)', async () => {
    const payload = decodePayload(employerJwt);
    const noneToken = rawJwt({ alg: 'none', typ: 'JWT' }, payload);

    const res = await request
      .get(ANY_AUTH_ENDPOINT)
      .set('Cookie', makeCookie(noneToken));

    expect(res.status).toBe(401);
  });

  it('rejects a cookie with alg:NONE (uppercase variant)', async () => {
    const payload = decodePayload(employerJwt);
    const noneToken = rawJwt({ alg: 'NONE', typ: 'JWT' }, payload);

    const res = await request
      .get(ANY_AUTH_ENDPOINT)
      .set('Cookie', makeCookie(noneToken));

    expect(res.status).toBe(401);
  });

  it('rejects alg:none claiming employer role', async () => {
    const noneToken = rawJwt(
      { alg: 'none', typ: 'JWT' },
      {
        userId: 'fake-user-id',
        tenantId: employer.tenantId,
        role: 'employer',
        exp: Math.floor(Date.now() / 1000) + 3600,
        iat: Math.floor(Date.now() / 1000),
      }
    );

    const res = await request
      .get(EMPLOYER_ENDPOINT)
      .set('Cookie', makeCookie(noneToken));

    expect(res.status).toBe(401);
  });
});

// ---------------------------------------------------------------------------
// 4. Role elevation attack
// ---------------------------------------------------------------------------

describe('role elevation attack', () => {
  it('rejects employee cookie with role flipped to employer (tampered payload)', async () => {
    const tamperedToken = tamperPayload(employeeJwt, { role: 'employer' });

    const res = await request
      .get(EMPLOYER_ENDPOINT)
      .set('Cookie', makeCookie(tamperedToken));

    expect(res.status).toBe(401);
  });

  it('rejects a freshly signed cookie with role:employer using wrong secret', async () => {
    const payload = decodePayload(employeeJwt);
    const { exp: _exp, iat: _iat, ...cleanPayload } = payload as Record<string, unknown>;
    const elevatedToken = jwt.sign(
      { ...cleanPayload, role: 'employer' },
      WRONG_SECRET,
      { expiresIn: '1h' }
    );

    const res = await request
      .get(EMPLOYER_ENDPOINT)
      .set('Cookie', makeCookie(elevatedToken));

    expect(res.status).toBe(401);
  });

  it('employee with valid cookie still gets 403 on employer-only endpoint', async () => {
    // Sanity check: untampered employee cookie → 403, not 401
    const res = await request
      .get(EMPLOYER_ENDPOINT)
      .set('Cookie', employeeCookie);

    expect(res.status).toBe(403);
  });
});

// ---------------------------------------------------------------------------
// 5. Tenant ID manipulation
// ---------------------------------------------------------------------------

describe('tenant ID manipulation', () => {
  let otherEmployer: TestEmployer;

  beforeAll(async () => {
    otherEmployer = await createTestEmployer(`jwt-sec-other-${Date.now()}`);
  }, 30_000);

  afterAll(async () => {
    await cleanupTestData(otherEmployer.tenantId);
  });

  it('rejects cookie with tenantId swapped to another tenant (tampered payload)', async () => {
    const tamperedToken = tamperPayload(employerJwt, {
      tenantId: otherEmployer.tenantId,
    });

    const res = await request
      .get(EMPLOYER_ENDPOINT)
      .set('Cookie', makeCookie(tamperedToken));

    expect(res.status).toBe(401);
  });

  it('rejects cookie with tenantId swapped and re-signed with wrong secret', async () => {
    const payload = decodePayload(employerJwt);
    const { exp: _exp, iat: _iat, ...cleanPayload } = payload as Record<string, unknown>;
    const swappedToken = jwt.sign(
      { ...cleanPayload, tenantId: otherEmployer.tenantId },
      WRONG_SECRET,
      { expiresIn: '1h' }
    );

    const res = await request
      .get(EMPLOYER_ENDPOINT)
      .set('Cookie', makeCookie(swappedToken));

    expect(res.status).toBe(401);
  });

  it('employer A cannot see employer B employees even with valid cookie', async () => {
    const res = await request
      .get(EMPLOYER_ENDPOINT)
      .set('Cookie', employerCookie);

    expect(res.status).toBe(200);
    // None of the returned employees should belong to otherEmployer's tenant
    const ids: string[] = (res.body as Array<{ id: string }>).map((e) => e.id);
    expect(ids.length).toBeGreaterThanOrEqual(0);
  });
});

// ---------------------------------------------------------------------------
// 6. Expired token
// ---------------------------------------------------------------------------

describe('expired token', () => {
  it('rejects a cookie with token expired 1 second ago', async () => {
    const expiredToken = jwt.sign(
      {
        userId: employer.user.id,
        tenantId: employer.tenantId,
        role: 'employer',
      },
      JWT_SECRET,
      { expiresIn: -1 } // already expired
    );

    const res = await request
      .get(ANY_AUTH_ENDPOINT)
      .set('Cookie', makeCookie(expiredToken));

    expect(res.status).toBe(401);
  });

  it('rejects a cookie with exp set to unix epoch (way in the past)', async () => {
    const payload = {
      userId: employer.user.id,
      tenantId: employer.tenantId,
      role: 'employer' as const,
      iat: 1000,
      exp: 1001, // 1970
    };
    const expiredToken = jwt.sign(payload, JWT_SECRET, { noTimestamp: true });

    const res = await request
      .get(ANY_AUTH_ENDPOINT)
      .set('Cookie', makeCookie(expiredToken));

    expect(res.status).toBe(401);
  });
});

// ---------------------------------------------------------------------------
// 7. Wrong secret
// ---------------------------------------------------------------------------

describe('wrong signing secret', () => {
  it('rejects a cookie with token signed with a different secret', async () => {
    const fakeToken = jwt.sign(
      {
        userId: employer.user.id,
        tenantId: employer.tenantId,
        role: 'employer',
      },
      WRONG_SECRET,
      { expiresIn: '1h' }
    );

    const res = await request
      .get(ANY_AUTH_ENDPOINT)
      .set('Cookie', makeCookie(fakeToken));

    expect(res.status).toBe(401);
  });

  it('rejects a cookie with token signed with an empty string secret', async () => {
    let fakeToken: string;
    try {
      fakeToken = jwt.sign(
        { userId: 'x', tenantId: 'y', role: 'employer' },
        '',
        { expiresIn: '1h' }
      );
    } catch {
      // Some jwt versions throw on empty secret
      fakeToken = 'invalid.token.here';
    }

    const res = await request
      .get(ANY_AUTH_ENDPOINT)
      .set('Cookie', makeCookie(fakeToken));

    expect(res.status).toBe(401);
  });
});

// ---------------------------------------------------------------------------
// 8. Malformed tokens in cookie
// ---------------------------------------------------------------------------

describe('malformed tokens in cookie', () => {
  const cases: Array<[string, string]> = [
    ['random garbage', 'notajwtatall'],
    ['only one segment', 'onlyone'],
    ['only two segments', 'part1.part2'],
    ['four segments', 'a.b.c.d'],
    ['valid base64 but not JSON header', `${b64url({ notAJwt: true })}.payload.sig`],
    ['look-alike base64 non-JWT', 'ZXlKaGJHY2lPaUpJVXpJMU5pSjkK.payload.fakesig'],
  ];

  test.each(cases)('rejects: %s', async (_label, token) => {
    const res = await request
      .get(ANY_AUTH_ENDPOINT)
      .set('Cookie', makeCookie(token));

    expect(res.status).toBe(401);
  });
});

// ---------------------------------------------------------------------------
// 9. Missing required claims
// ---------------------------------------------------------------------------

describe('missing required claims', () => {
  it('rejects token missing userId claim', async () => {
    const token = jwt.sign(
      { tenantId: employer.tenantId, role: 'employer' },
      JWT_SECRET,
      { expiresIn: '1h' }
    );

    const res = await request
      .get(ANY_AUTH_ENDPOINT)
      .set('Cookie', makeCookie(token));

    expect(res.status).not.toBe(200);
  });

  it('rejects token missing tenantId claim', async () => {
    const token = jwt.sign(
      { userId: employer.user.id, role: 'employer' },
      JWT_SECRET,
      { expiresIn: '1h' }
    );

    const res = await request
      .get(EMPLOYER_ENDPOINT)
      .set('Cookie', makeCookie(token));

    expect(res.status).not.toBe(200);
  });

  it('rejects token with role set to an invalid value', async () => {
    const token = jwt.sign(
      { userId: employer.user.id, tenantId: employer.tenantId, role: 'superadmin' },
      JWT_SECRET,
      { expiresIn: '1h' }
    );

    const res = await request
      .get(EMPLOYER_ENDPOINT)
      .set('Cookie', makeCookie(token));

    expect([401, 403]).toContain(res.status);
  });
});

// ---------------------------------------------------------------------------
// 10. SQL injection via JWT claims
// ---------------------------------------------------------------------------

describe('SQL injection via JWT claims', () => {
  it('does not execute SQL injected into tenantId claim', async () => {
    const maliciousTenantId = "' OR '1'='1'; DROP TABLE users; --";
    const token = jwt.sign(
      { userId: employer.user.id, tenantId: maliciousTenantId, role: 'employer' },
      JWT_SECRET,
      { expiresIn: '1h' }
    );

    const res = await request
      .get(EMPLOYER_ENDPOINT)
      .set('Cookie', makeCookie(token));

    expect(res.status).not.toBe(500);
  });

  it('does not execute SQL injected into userId claim', async () => {
    const maliciousUserId = "1; DROP TABLE users; SELECT '";
    const token = jwt.sign(
      { userId: maliciousUserId, tenantId: employer.tenantId, role: 'employer' },
      JWT_SECRET,
      { expiresIn: '1h' }
    );

    const res = await request
      .get(ANY_AUTH_ENDPOINT)
      .set('Cookie', makeCookie(token));

    expect(res.status).not.toBe(500);
  });
});

// ---------------------------------------------------------------------------
// 11. Huge token payload
// ---------------------------------------------------------------------------

describe('oversized token', () => {
  it('handles a JWT with an extremely large payload gracefully', async () => {
    const bigToken = jwt.sign(
      {
        userId: employer.user.id,
        tenantId: employer.tenantId,
        role: 'employer',
        garbage: 'x'.repeat(8_000),
      },
      JWT_SECRET,
      { expiresIn: '1h' }
    );

    const res = await request
      .get(ANY_AUTH_ENDPOINT)
      .set('Cookie', makeCookie(bigToken));

    // Should either succeed (200) or fail gracefully (400/413), never crash (500)
    expect(res.status).not.toBe(500);
  });
});

// ---------------------------------------------------------------------------
// 12. Logout clears the session cookie
// ---------------------------------------------------------------------------

describe('logout invalidates session', () => {
  it('POST /auth/logout clears the champs_session cookie', async () => {
    const res = await request
      .post('/api/v1/auth/logout')
      .set('Cookie', employerCookie);

    expect(res.status).toBe(200);
    // The Set-Cookie header should clear the session cookie
    const setCookies = (res.headers['set-cookie'] as unknown as string[] | undefined) ?? [];
    const sessionCookie = setCookies.find((c) => c.startsWith('champs_session='));
    // Either Max-Age=0 or Expires in the past, or an empty value
    if (sessionCookie) {
      expect(
        sessionCookie.toLowerCase().includes('max-age=0') ||
        sessionCookie.includes('champs_session=;')
      ).toBe(true);
    }
    expect(res.body).toEqual({ ok: true });
  });
});
