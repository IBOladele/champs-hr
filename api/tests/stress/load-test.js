/**
 * k6 Load Test for Champs HR API
 *
 * Run with:
 *   k6 run --env API_URL=https://your-api.up.railway.app api/tests/stress/load-test.js
 *
 * Requires k6 installed: https://k6.io/docs/getting-started/installation/
 */

import http from 'k6/http';
import { check, sleep } from 'k6';
import { Rate } from 'k6/metrics';

const errorRate = new Rate('errors');

export const options = {
  stages: [
    { duration: '30s', target: 20 },   // ramp up to 20 users
    { duration: '1m',  target: 50 },   // stay at 50 users for 1 minute
    { duration: '30s', target: 100 },  // spike to 100 users
    { duration: '30s', target: 0 },    // ramp down
  ],
  thresholds: {
    http_req_duration: ['p(95)<500'],  // 95% of requests under 500ms
    http_req_failed:   ['rate<0.01'],  // less than 1% errors
    errors:            ['rate<0.05'],  // less than 5% check failures
  },
};

const BASE_URL = __ENV.API_URL || 'http://localhost:3000';

/**
 * setup() runs once before the load test begins.
 * Returns data shared with all VUs via the `data` parameter in default().
 */
export function setup() {
  const tag = `loadtest-${Date.now()}`;
  const signupPayload = JSON.stringify({
    email: `${tag}@loadtest.com`,
    password: 'LoadTest123!',
    fullName: 'Load Test Employer',
    companyName: `Load Test Corp ${tag}`,
  });

  const signupRes = http.post(`${BASE_URL}/api/v1/auth/signup`, signupPayload, {
    headers: { 'Content-Type': 'application/json' },
  });

  const signupOk = check(signupRes, {
    'setup: signup status 201': (r) => r.status === 201,
    'setup: has accessToken': (r) => {
      try {
        return !!JSON.parse(r.body).accessToken;
      } catch {
        return false;
      }
    },
  });

  if (!signupOk) {
    console.error(`Setup signup failed: ${signupRes.status} ${signupRes.body}`);
    return { token: null };
  }

  const body = JSON.parse(signupRes.body);
  const token = body.accessToken;

  // Create one employee so payroll endpoints have something to return
  const empPayload = JSON.stringify({
    email: `loadtest-emp-${Date.now()}@loadtest.com`,
    fullName: 'Load Test Employee',
    jobTitle: 'Engineer',
    employeeNumber: `EMP-LT-${Date.now()}`,
    grossSalary: 40000,
    startDate: '2024-01-01',
    employmentType: 'full_time',
    payFrequency: 'monthly',
  });

  http.post(`${BASE_URL}/api/v1/employees`, empPayload, {
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${token}`,
    },
  });

  return { token };
}

/**
 * default() is the main VU function, called repeatedly for each virtual user.
 */
export default function (data) {
  const token = data.token;

  if (!token) {
    console.warn('No token available, skipping VU iteration');
    sleep(1);
    return;
  }

  const headers = {
    'Content-Type': 'application/json',
    Authorization: `Bearer ${token}`,
  };

  // Randomly pick a scenario weighted by a random number
  const roll = Math.random();

  if (roll < 0.20) {
    // 20% — GET /health (no auth required)
    const res = http.get(`${BASE_URL}/health`);
    const ok = check(res, {
      'health: status 200': (r) => r.status === 200,
      'health: ok=true': (r) => {
        try {
          return JSON.parse(r.body).ok === true;
        } catch {
          return false;
        }
      },
    });
    errorRate.add(!ok);

  } else if (roll < 0.50) {
    // 30% — GET /api/v1/employees
    const res = http.get(`${BASE_URL}/api/v1/employees`, { headers });
    const ok = check(res, {
      'employees: status 200': (r) => r.status === 200,
      'employees: is array': (r) => {
        try {
          return Array.isArray(JSON.parse(r.body));
        } catch {
          return false;
        }
      },
    });
    errorRate.add(!ok);

  } else if (roll < 0.70) {
    // 20% — GET /api/v1/leave
    const res = http.get(`${BASE_URL}/api/v1/leave`, { headers });
    const ok = check(res, {
      'leave: status 200': (r) => r.status === 200,
    });
    errorRate.add(!ok);

  } else if (roll < 0.85) {
    // 15% — GET /api/v1/payroll
    const res = http.get(`${BASE_URL}/api/v1/payroll`, { headers });
    const ok = check(res, {
      'payroll: status 200': (r) => r.status === 200,
    });
    errorRate.add(!ok);

  } else {
    // 15% — GET /api/v1/attendance
    const res = http.get(`${BASE_URL}/api/v1/attendance`, { headers });
    const ok = check(res, {
      'attendance: status 200': (r) => r.status === 200,
    });
    errorRate.add(!ok);
  }

  sleep(1);
}

/**
 * teardown() runs once after the load test ends.
 * We leave test data in the database — it will be cleaned up by
 * running the Jest test suite or manually.
 */
export function teardown(data) {
  // Nothing to tear down — test data is left in the database
  console.log(`Load test complete. Test employer token was: ${data.token ? '[present]' : '[missing]'}`);
}
