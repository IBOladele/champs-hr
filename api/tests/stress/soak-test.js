/**
 * k6 Soak Test for Champs HR API
 *
 * Sustained load for 10 minutes at 30 VUs.
 * Purpose: detect memory leaks, connection pool exhaustion, and
 * performance degradation over time.
 *
 * Run against Railway production:
 *   k6 run --env API_URL=https://champs-hr-production.up.railway.app api/tests/stress/soak-test.js
 *
 * Run against local server:
 *   k6 run api/tests/stress/soak-test.js
 */

import http from 'k6/http';
import { check, group, sleep } from 'k6';
import { Counter, Rate, Trend } from 'k6/metrics';

// Custom metrics
const requestsServed = new Counter('requests_served');
const errorRate      = new Rate('errors');
const responseTime   = new Trend('response_time', true);

export const options = {
  vus:      30,
  duration: '10m',
  thresholds: {
    http_req_duration: ['p(95)<400'],
    http_req_failed:   ['rate<0.01'],
    errors:            ['rate<0.02'],
  },
};

const BASE_URL = __ENV.API_URL || 'http://localhost:3000';

/**
 * setup() signs up a single employer and seeds data.
 * Returns the cookie jar so all VUs share one warm account.
 */
export function setup() {
  const jar = http.cookieJar();
  const tag = `soaktest-${Date.now()}`;

  const signupRes = http.post(
    `${BASE_URL}/api/v1/auth/signup`,
    JSON.stringify({
      email:       `${tag}@soaktest.com`,
      password:    'SoakTest123!',
      fullName:    'Soak Test Employer',
      companyName: `Soak Test Corp ${tag}`,
    }),
    { headers: { 'Content-Type': 'application/json' }, jar },
  );

  if (signupRes.status !== 201) {
    console.error(`Soak setup failed: ${signupRes.status} ${signupRes.body}`);
    return { jar: null, baseUrl: BASE_URL };
  }

  const authHeaders = { 'Content-Type': 'application/json' };

  // Seed 3 employees so aggregate queries have data
  for (let i = 1; i <= 3; i++) {
    http.post(
      `${BASE_URL}/api/v1/employees`,
      JSON.stringify({
        email:          `${tag}-soak-${i}@soaktest.com`,
        fullName:       `Soak Employee ${i}`,
        jobTitle:       'Analyst',
        employeeNumber: `EMP-SOAK-${tag}-${i}`,
        grossSalary:    55000,
        startDate:      '2024-03-01',
        employmentType: 'full_time',
        payFrequency:   'monthly',
      }),
      { headers: authHeaders, jar },
    );
  }

  return { jar, baseUrl: BASE_URL };
}

// Track iteration count for periodic logging
let iterCount = 0;

/**
 * default() — main VU loop.
 * Read-only mix: health, dashboard, stats, employees, attendance.
 * Logs a request count summary every 60 seconds via group().
 */
export default function (data) {
  if (!data.jar) {
    sleep(2);
    return;
  }

  const { jar, baseUrl } = data;
  const headers = { 'Content-Type': 'application/json' };
  const roll    = Math.random();

  iterCount++;

  // Periodic progress log (every ~60 iterations per VU — approximate)
  if (iterCount % 60 === 0) {
    group('progress_log', () => {
      console.log(
        `[soak] VU progress marker — requests_served counter at iteration ${iterCount}`,
      );
    });
  }

  // 25% — health (unauthenticated, fastest path)
  if (roll < 0.25) {
    group('health', () => {
      const start = Date.now();
      const res   = http.get(`${baseUrl}/health`);
      const ms    = Date.now() - start;
      responseTime.add(ms);
      requestsServed.add(1);

      const ok = check(res, {
        'health: 200':           (r) => r.status === 200,
        'health: < 400ms':       (r) => r.timings.duration < 400,
      });
      errorRate.add(!ok);
    });

  // 25% — dashboard (heavy aggregate query — key canary for pool exhaustion)
  } else if (roll < 0.50) {
    group('dashboard', () => {
      const start = Date.now();
      const res   = http.get(`${baseUrl}/api/v1/dashboard`, { headers, jar });
      const ms    = Date.now() - start;
      responseTime.add(ms);
      requestsServed.add(1);

      const ok = check(res, {
        'dashboard: 200':   (r) => r.status === 200,
        'dashboard: < 400ms': (r) => r.timings.duration < 400,
      });
      errorRate.add(!ok);
    });

  // 20% — stats
  } else if (roll < 0.70) {
    group('stats', () => {
      const start = Date.now();
      const res   = http.get(`${baseUrl}/api/v1/stats`, { headers, jar });
      const ms    = Date.now() - start;
      responseTime.add(ms);
      requestsServed.add(1);

      const ok = check(res, {
        'stats: 200':   (r) => r.status === 200,
        'stats: < 400ms': (r) => r.timings.duration < 400,
      });
      errorRate.add(!ok);
    });

  // 20% — employees
  } else if (roll < 0.90) {
    group('employees', () => {
      const start = Date.now();
      const res   = http.get(`${baseUrl}/api/v1/employees`, { headers, jar });
      const ms    = Date.now() - start;
      responseTime.add(ms);
      requestsServed.add(1);

      const ok = check(res, {
        'employees: 200':   (r) => r.status === 200,
        'employees: < 400ms': (r) => r.timings.duration < 400,
      });
      errorRate.add(!ok);
    });

  // 10% — attendance
  } else {
    group('attendance', () => {
      const start = Date.now();
      const res   = http.get(`${baseUrl}/api/v1/attendance`, { headers, jar });
      const ms    = Date.now() - start;
      responseTime.add(ms);
      requestsServed.add(1);

      const ok = check(res, {
        'attendance: 200':   (r) => r.status === 200,
        'attendance: < 400ms': (r) => r.timings.duration < 400,
      });
      errorRate.add(!ok);
    });
  }

  sleep(1);
}

export function teardown(data) {
  console.log(
    `Soak test complete. Total requests_served counter available in k6 summary.`,
  );
}
