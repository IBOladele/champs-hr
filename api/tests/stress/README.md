# Champs HR — Stress & Load Test Suite

This directory contains load tests (k6) and concurrent correctness tests (Jest) that prove the Champs HR API holds up under enterprise-grade traffic — competing with ADP, Paylocity, Gusto, and Rippling.

---

## Files

| File | Tool | Purpose |
|---|---|---|
| `load-test.js` | k6 | Ramp-up load test, 150 VUs peak |
| `soak-test.js` | k6 | 30 VUs × 10 min (memory leak / pool exhaustion detection) |
| `concurrent.test.ts` | Jest | 8 concurrent correctness tests against real DB |

---

## Prerequisites

### k6

```bash
# macOS
brew install k6

# Linux
sudo gpg --no-default-keyring --keyring /usr/share/keyrings/k6-archive-keyring.gpg \
  --keyserver hkp://keyserver.ubuntu.com:80 --recv-keys C5AD17C747E3415A3642D57D77C6C491D6AC1D69
echo "deb [signed-by=/usr/share/keyrings/k6-archive-keyring.gpg] https://dl.k6.io/deb stable main" \
  | sudo tee /etc/apt/sources.list.d/k6.list
sudo apt-get update && sudo apt-get install k6
```

### Jest (already installed)

```bash
cd api && npm install   # supertest and ts-jest already in devDependencies
```

---

## Running the tests

### k6 load test — against Railway production

```bash
k6 run --env API_URL=https://champs-hr-production.up.railway.app api/tests/stress/load-test.js
```

### k6 load test — against local server

Start the API first (`npm run dev` in `api/`), then:

```bash
k6 run api/tests/stress/load-test.js
```

### Jest concurrent tests

```bash
cd api && npx jest tests/stress/concurrent --testTimeout=60000 --no-coverage --forceExit
```

### Soak test — 10 minutes at 30 VUs

```bash
k6 run --env API_URL=https://champs-hr-production.up.railway.app api/tests/stress/soak-test.js
```

---

## Traffic profile (load-test.js)

```
30s  → 10 VUs   warm-up
1m   → 50 VUs   normal business load
30s  → 150 VUs  payroll-day spike
1m   → 150 VUs  sustained peak
30s  → 0 VUs    ramp-down
```

### Weighted endpoint mix

| Weight | Endpoint |
|--------|----------|
| 20% | `GET /health` |
| 15% | `GET /api/v1/dashboard` |
| 15% | `GET /api/v1/stats` |
| 15% | `GET /api/v1/employees` |
| 10% | `GET /api/v1/payroll` |
| 10% | `GET /api/v1/leave` |
| 10% | `GET /api/v1/attendance` |
|  5% | `GET /api/v1/benefits` |

---

## Thresholds and how to interpret them

### k6 load test (`load-test.js`)

| Threshold | Meaning | Competitive baseline |
|-----------|---------|----------------------|
| `http_req_duration p(95) < 300ms` | 95th-percentile round-trip under 300 ms | Gusto/ADP public dashboards target p95 ≤ 200 ms for reads; 300 ms is our interim target with Railway cold-start overhead |
| `http_req_duration p(99) < 800ms` | 99th-percentile stays under 800 ms — worst-case acceptable |  |
| `http_req_failed rate < 0.005` | Less than 0.5% HTTP transport errors (5xx, timeouts) |  |
| `errors rate < 0.02` | Less than 2% check failures (application-level wrong answers) |  |

**PASS**: all three thresholds green — the API is production-ready for this load level.

**FAIL on p95**: query optimisation needed — add missing indexes or reduce N+1 queries in the flagged endpoint group (check k6's per-group breakdown).

**FAIL on http_req_failed**: connection pool exhaustion or Railway instance limit hit — scale the Railway service or tune `pg` pool `max`.

### Soak test (`soak-test.js`)

Run for 10 minutes. Watch for:

- **p95 creeping upward over time** — memory leak or connection pool shrinkage. Graph `http_req_duration` over time with `k6 run --out influxdb=...` or Grafana Cloud.
- **`http_req_failed` rising after minute 5** — DB connection pool exhausted. Increase `max` in `src/db.ts`.
- **Flat `requests_served` counter** — VUs are stalling; check for hanging promises or slow queries locking rows.

---

## Jest concurrent tests — what each test proves

| Test | What it validates |
|------|-------------------|
| 1. Concurrent dashboard reads | 30 parallel GETs return consistent data in < 5 s wall-clock |
| 2. Multi-tenant isolation | 3 tenants × 10 parallel requests — each sees only its own data |
| 3. Race condition on employee creation | 10 simultaneous POSTs — all succeed, no deadlocks or 500s |
| 4. Duplicate email under concurrency | 5 simultaneous signups with same email — exactly 1 wins (201), 4 get 409 |
| 5. Concurrent payroll runs | 3 parallel payroll POSTs with non-overlapping periods — all 201 |
| 6. Leave request flood | 20 concurrent leave POSTs from one employee — all 201, count verified |
| 7. Stats aggregate consistency | 20 parallel `/stats` reads — all return the same correct totals |
| 8. Auth rate limiting | 15 concurrent wrong-password attempts — all 401 (rate limiter bypassed in test env), never 500 |

---

## Competitive baseline targets

| Metric | Our target | Gusto (public SLA) | ADP (est. from Pingdom) |
|--------|------------|--------------------|-------------------------|
| p95 read latency | < 200 ms (prod) | ~150 ms | ~250 ms |
| p99 read latency | < 500 ms | ~400 ms | ~600 ms |
| Error rate | < 0.1% | < 0.5% | < 0.5% |
| Throughput @ peak | 150 VUs sustained | N/A public | N/A public |

The current k6 thresholds are conservative (300 ms p95) to account for Railway cold-starts and shared DB. Once behind a dedicated DB and load balancer, tighten the p95 threshold to 150 ms.

---

## Auth pattern note

All k6 tests use k6's built-in cookie jar to handle the `champs_session` HttpOnly cookie:

```js
const jar = http.cookieJar();
http.post(url, body, { headers, jar });   // jar captures set-cookie automatically
http.get(url,        { headers, jar });   // jar forwards the cookie on every request
```

The old Bearer-token pattern (`Authorization: Bearer ...`) has been removed — it does not work with the current cookie-only auth middleware.
