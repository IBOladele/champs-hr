/**
 * k6 Load Test for Champs HR API
 *
 * Run against Railway production:
 *   k6 run --env API_URL=https://champs-hr-production.up.railway.app api/tests/stress/load-test.js
 *
 * Run against local server:
 *   k6 run api/tests/stress/load-test.js
 *
 * Requires k6 installed: https://k6.io/docs/getting-started/installation/
 */

import http from 'k6/http';
import { check, group, sleep } from 'k6';
import { Rate, Trend } from 'k6/metrics';

// Custom metrics
const errorRate    = new Rate('errors');
const responseTime = new Trend('response_time', true);

export const options = {
  stages: [
    { duration: '30s', target: 10  },  // warm up
    { duration: '1m',  target: 50  },  // normal load
    { duration: '30s', target: 150 },  // peak (payroll day spike)
    { duration: '1m',  target: 150 },  // sustained peak
    { duration: '30s', target: 0   },  // ramp down
  ],
  thresholds: {
    http_req_duration: ['p(95)<300', 'p(99)<800'],  // p95 under 300ms
    http_req_failed:   ['rate<0.005'],               // < 0.5% HTTP errors
    errors:            ['rate<0.02'],                // < 2% check failures
  },
};

const BASE_URL = __ENV.API_URL || 'http://localhost:3000';

/**
 * setup() runs once before the load test begins.
 * Creates a single warm test employer account and seeds data.
 * Returns the cookie jar and baseUrl shared across all VUs.
 */
export function setup() {
  const jar = http.cookieJar();
  const tag  = `loadtest-${Date.now()}`;

  // 1. Sign up a test employer — jar captures the champs_session cookie automatically
  const signupPayload = JSON.stringify({
    email:       `${tag}@loadtest.com`,
    password:    'LoadTest123!',
    fullName:    'Load Test Employer',
    companyName: `Load Test Corp ${tag}`,
  });

  const signupRes = http.post(
    `${BASE_URL}/api/v1/auth/signup`,
    signupPayload,
    { headers: { 'Content-Type': 'application/json' }, jar },
  );

  const signupOk = check(signupRes, {
    'setup: signup status 201': (r) => r.status === 201,
  });

  if (!signupOk) {
    console.error(`Setup signup failed: ${signupRes.status} ${signupRes.body}`);
    return { jar: null, baseUrl: BASE_URL };
  }

  const authHeaders = { 'Content-Type': 'application/json' };

  // 2. Create 5 test employees
  for (let i = 1; i <= 5; i++) {
    const empPayload = JSON.stringify({
      email:          `${tag}-emp-${i}@loadtest.com`,
      fullName:       `Load Test Employee ${i}`,
      jobTitle:       'Engineer',
      employeeNumber: `EMP-LT-${tag}-${i}`,
      grossSalary:    50000,
      startDate:      '2024-01-01',
      employmentType: 'full_time',
      payFrequency:   'monthly',
    });

    const empRes = http.post(
      `${BASE_URL}/api/v1/employees`,
      empPayload,
      { headers: authHeaders, jar },
    );

    check(empRes, {
      [`setup: create employee ${i} status 201`]: (r) => r.status === 201,
    });
  }

  // 3. Create a payroll run
  const payrollPayload = JSON.stringify({
    periodStart: '2024-01-01',
    periodEnd:   '2024-01-31',
  });

  const payrollRes = http.post(
    `${BASE_URL}/api/v1/payroll`,
    payrollPayload,
    { headers: authHeaders, jar },
  );

  check(payrollRes, {
    'setup: create payroll run status 201': (r) => r.status === 201,
  });

  // 4. Create 3 leave requests using first employee — log in as them first
  const loginRes = http.post(
    `${BASE_URL}/api/v1/auth/login`,
    JSON.stringify({ email: `${tag}-emp-1@loadtest.com`, password: 'Welcome123!' }),
    { headers: authHeaders },
  );

  if (loginRes.status === 200) {
    const empJar = http.cookieJar();
    // re-login with empJar so we capture their cookie
    const loginRes2 = http.post(
      `${BASE_URL}/api/v1/auth/login`,
      JSON.stringify({ email: `${tag}-emp-1@loadtest.com`, password: 'Welcome123!' }),
      { headers: authHeaders, jar: empJar },
    );

    if (loginRes2.status === 200) {
      for (let i = 1; i <= 3; i++) {
        const leavePayload = JSON.stringify({
          leaveType:     'annual',
          startDate:     `2024-0${i + 1}-01`,
          endDate:       `2024-0${i + 1}-05`,
          daysRequested: 5,
          reason:        `Load test leave ${i}`,
        });

        http.post(
          `${BASE_URL}/api/v1/leave`,
          leavePayload,
          { headers: authHeaders, jar: empJar },
        );
      }
    }
  }

  return { jar, baseUrl: BASE_URL };
}

/**
 * default() is the main VU function — called repeatedly for each virtual user.
 * Weighted random routing across all major endpoints.
 */
export default function (data) {
  if (!data.jar) {
    console.warn('No session jar available, skipping VU iteration');
    sleep(1);
    return;
  }

  const { jar, baseUrl } = data;
  const headers = { 'Content-Type': 'application/json' };
  const roll    = Math.random();

  // 0–0.20 → 20% health (no auth)
  if (roll < 0.20) {
    group('health', () => {
      const start = Date.now();
      const res   = http.get(`${baseUrl}/health`);
      responseTime.add(Date.now() - start);

      const ok = check(res, {
        'health: status 200':  (r) => r.status === 200,
        'health: body is JSON': (r) => {
          try { JSON.parse(r.body); return true; } catch { return false; }
        },
        'health: response < 500ms': (r) => r.timings.duration < 500,
      });
      errorRate.add(!ok);
    });

  // 0.20–0.35 → 15% dashboard
  } else if (roll < 0.35) {
    group('dashboard', () => {
      const start = Date.now();
      const res   = http.get(`${baseUrl}/api/v1/dashboard`, { headers, jar });
      responseTime.add(Date.now() - start);

      const ok = check(res, {
        'dashboard: status 200':  (r) => r.status === 200,
        'dashboard: body is JSON': (r) => {
          try { JSON.parse(r.body); return true; } catch { return false; }
        },
        'dashboard: response < 500ms': (r) => r.timings.duration < 500,
      });
      errorRate.add(!ok);
    });

  // 0.35–0.50 → 15% stats
  } else if (roll < 0.50) {
    group('stats', () => {
      const start = Date.now();
      const res   = http.get(`${baseUrl}/api/v1/stats`, { headers, jar });
      responseTime.add(Date.now() - start);

      const ok = check(res, {
        'stats: status 200':  (r) => r.status === 200,
        'stats: body is JSON': (r) => {
          try { JSON.parse(r.body); return true; } catch { return false; }
        },
        'stats: response < 500ms': (r) => r.timings.duration < 500,
      });
      errorRate.add(!ok);
    });

  // 0.50–0.65 → 15% employees
  } else if (roll < 0.65) {
    group('employees', () => {
      const start = Date.now();
      const res   = http.get(`${baseUrl}/api/v1/employees`, { headers, jar });
      responseTime.add(Date.now() - start);

      const ok = check(res, {
        'employees: status 200':  (r) => r.status === 200,
        'employees: body is array': (r) => {
          try { return Array.isArray(JSON.parse(r.body)); } catch { return false; }
        },
        'employees: response < 500ms': (r) => r.timings.duration < 500,
      });
      errorRate.add(!ok);
    });

  // 0.65–0.75 → 10% payroll
  } else if (roll < 0.75) {
    group('payroll', () => {
      const start = Date.now();
      const res   = http.get(`${baseUrl}/api/v1/payroll`, { headers, jar });
      responseTime.add(Date.now() - start);

      const ok = check(res, {
        'payroll: status 200':  (r) => r.status === 200,
        'payroll: body is JSON': (r) => {
          try { JSON.parse(r.body); return true; } catch { return false; }
        },
        'payroll: response < 500ms': (r) => r.timings.duration < 500,
      });
      errorRate.add(!ok);
    });

  // 0.75–0.85 → 10% leave
  } else if (roll < 0.85) {
    group('leave', () => {
      const start = Date.now();
      const res   = http.get(`${baseUrl}/api/v1/leave`, { headers, jar });
      responseTime.add(Date.now() - start);

      const ok = check(res, {
        'leave: status 200':  (r) => r.status === 200,
        'leave: body is JSON': (r) => {
          try { JSON.parse(r.body); return true; } catch { return false; }
        },
        'leave: response < 500ms': (r) => r.timings.duration < 500,
      });
      errorRate.add(!ok);
    });

  // 0.85–0.95 → 10% attendance
  } else if (roll < 0.95) {
    group('attendance', () => {
      const start = Date.now();
      const res   = http.get(`${baseUrl}/api/v1/attendance`, { headers, jar });
      responseTime.add(Date.now() - start);

      const ok = check(res, {
        'attendance: status 200':  (r) => r.status === 200,
        'attendance: body is JSON': (r) => {
          try { JSON.parse(r.body); return true; } catch { return false; }
        },
        'attendance: response < 500ms': (r) => r.timings.duration < 500,
      });
      errorRate.add(!ok);
    });

  // 0.95–1.00 → 5% benefits
  } else {
    group('benefits', () => {
      const start = Date.now();
      const res   = http.get(`${baseUrl}/api/v1/benefits`, { headers, jar });
      responseTime.add(Date.now() - start);

      const ok = check(res, {
        'benefits: status 200':  (r) => r.status === 200,
        'benefits: body is JSON': (r) => {
          try { JSON.parse(r.body); return true; } catch { return false; }
        },
        'benefits: response < 500ms': (r) => r.timings.duration < 500,
      });
      errorRate.add(!ok);
    });
  }

  sleep(1);
}

/**
 * teardown() runs once after the load test ends.
 * Test data is left in the DB — clean up manually or via Jest test suite.
 */
export function teardown(data) {
  console.log(`Load test complete. Session jar: ${data.jar ? '[present]' : '[missing]'}`);
}
