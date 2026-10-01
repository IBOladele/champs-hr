import { http, HttpResponse } from 'msw'

const BASE = 'http://localhost:3000/api/v1'

export const employer: { id: string; email: string; role: 'employer'; tenantId: string; fullName: string; emailVerified: boolean } = {
  id: 'user-123',
  email: 'test@example.com',
  role: 'employer',
  tenantId: 'tenant-456',
  fullName: 'Test Employer',
  emailVerified: false,
}

export const handlers = [
  // Auth
  http.post(`${BASE}/auth/signup`, () =>
    HttpResponse.json({ user: { ...employer, emailVerified: false } }, { status: 201 })
  ),

  http.post(`${BASE}/auth/login`, () =>
    HttpResponse.json({ user: employer })
  ),

  http.post(`${BASE}/auth/logout`, () =>
    HttpResponse.json({ ok: true })
  ),

  http.get(`${BASE}/auth/me`, () =>
    HttpResponse.json(employer)
  ),

  http.post(`${BASE}/auth/verify-email`, () =>
    HttpResponse.json({ ok: true })
  ),

  http.post(`${BASE}/auth/resend-verification`, () =>
    HttpResponse.json({ ok: true })
  ),

  // Onboarding
  http.get(`${BASE}/onboarding`, () =>
    HttpResponse.json({ step: 0, completed: false, settings: {} })
  ),

  http.patch(`${BASE}/onboarding/step/:step`, () =>
    HttpResponse.json({ ok: true, step: 1 })
  ),

  http.post(`${BASE}/onboarding/invite`, () =>
    HttpResponse.json({ ok: true, sent: ['colleague@company.com'], skipped: [] })
  ),

  http.post(`${BASE}/onboarding/complete`, () =>
    HttpResponse.json({ ok: true })
  ),

  // Employees
  http.get(`${BASE}/employees`, () =>
    HttpResponse.json([])
  ),

  http.post(`${BASE}/employees`, () =>
    HttpResponse.json({
      id: 'emp-1', userId: 'user-emp-1', email: 'emp@example.com',
      fullName: 'Jane Smith', employeeNumber: 'EMP-001', jobTitle: 'Engineer',
      employmentType: 'full_time', employmentStatus: 'active',
      grossSalary: '60000', payFrequency: 'monthly', startDate: '2024-01-01',
      departmentId: null, departmentName: null, phone: null, avatarUrl: null, createdAt: new Date().toISOString(),
    }, { status: 201 })
  ),

  // Stats
  http.get(`${BASE}/stats`, () =>
    HttpResponse.json({
      employees: { total: 0, active: 0, onLeave: 0, newThisMonth: 0 },
      leave: { pendingRequests: 0, approvedThisMonth: 0 },
      payroll: { totalRuns: 0, pendingRuns: 0, latestRunGross: null, latestRunDate: null },
      attendance: { today: { present: 0, late: 0, absent: 0, remote: 0 } },
    })
  ),
]
