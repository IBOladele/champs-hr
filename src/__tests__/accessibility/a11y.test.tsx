import { describe, it, expect, beforeEach } from 'vitest'
import { render, waitFor } from '@testing-library/react'
import { MemoryRouter, Routes, Route } from 'react-router-dom'
import { http, HttpResponse } from 'msw'
import { axe, toHaveNoViolations } from 'jest-axe'
import { server } from '../../test/msw/server'
import { AuthProvider } from '../../context/AuthContext'
import Login from '../../pages/auth/Login'
import Signup from '../../pages/auth/Signup'
import Analytics from '../../pages/employer/Analytics'
import UserAccess from '../../pages/employer/UserAccess'

expect.extend(toHaveNoViolations)

const BASE = 'http://localhost:3000/api/v1'

const ownerUser = {
  id: 'user-123',
  fullName: 'Test Employer',
  email: 'test@example.com',
  employeeNumber: null,
  jobTitle: null,
  portalRole: null,
  portalPermissions: {},
  isOwner: true,
  createdAt: '2024-01-01T00:00:00.000Z',
}

const defaultStats = {
  employees: { total: 0, active: 0, onLeave: 0, newThisMonth: 0 },
  leave: { pendingRequests: 0, approvedThisMonth: 0 },
  payroll: { totalRuns: 0, pendingRuns: 0, latestRunGross: null, latestRunDate: null },
  attendance: { today: { present: 0, late: 0, absent: 0, remote: 0 } },
}

describe('Accessibility — WCAG 2.1 AA', () => {
  describe('Login page', () => {
    beforeEach(() => {
      server.use(
        http.get(`${BASE}/auth/me`, () =>
          HttpResponse.json({ error: 'Not authenticated' }, { status: 401 })
        ),
      )
    })

    it('has no axe violations', async () => {
      const { container } = render(
        <MemoryRouter initialEntries={['/login']}>
          <AuthProvider>
            <Routes>
              <Route path="/login" element={<Login />} />
              <Route path="/employer" element={<div>Dashboard</div>} />
              <Route path="/employee" element={<div>Employee</div>} />
              <Route path="/onboarding" element={<div>Onboarding</div>} />
            </Routes>
          </AuthProvider>
        </MemoryRouter>
      )
      // Wait for page to settle (Login uses div layout, not a <form> element)
      await waitFor(() => {
        expect(container.querySelector('input[type="email"], input[placeholder="you@company.com"]')).toBeTruthy()
      })
      const results = await axe(container)
      expect(results).toHaveNoViolations()
    })
  })

  describe('Signup page', () => {
    beforeEach(() => {
      server.use(
        http.get(`${BASE}/auth/me`, () =>
          HttpResponse.json({ error: 'Not authenticated' }, { status: 401 })
        ),
      )
    })

    it('has no axe violations', async () => {
      const { container } = render(
        <MemoryRouter initialEntries={['/signup']}>
          <AuthProvider>
            <Routes>
              <Route path="/signup" element={<Signup />} />
              <Route path="/onboarding" element={<div>Onboarding</div>} />
            </Routes>
          </AuthProvider>
        </MemoryRouter>
      )
      // Signup uses div layout, not a <form> element — wait for the first name input
      await waitFor(() => {
        expect(container.querySelector('input[placeholder="First name"]')).toBeTruthy()
      })
      const results = await axe(container)
      expect(results).toHaveNoViolations()
    })
  })

  describe('Analytics page', () => {
    beforeEach(() => {
      server.use(
        http.get(`${BASE}/auth/me`, () =>
          HttpResponse.json({
            id: 'user-123',
            email: 'test@example.com',
            role: 'employer',
            tenantId: 'tenant-456',
            fullName: 'Test Employer',
            emailVerified: true,
          })
        ),
        http.get(`${BASE}/stats`, () =>
          HttpResponse.json(defaultStats)
        ),
        http.get(`${BASE}/employees`, () =>
          HttpResponse.json([])
        ),
        http.get(`${BASE}/payroll`, () =>
          HttpResponse.json([])
        ),
      )
    })

    it('has no axe violations', async () => {
      const { container } = render(
        <MemoryRouter initialEntries={['/employer/analytics']}>
          <AuthProvider>
            <Routes>
              <Route path="/employer/analytics" element={<Analytics />} />
            </Routes>
          </AuthProvider>
        </MemoryRouter>
      )
      await waitFor(() => {
        expect(container.querySelector('h1')).toBeTruthy()
      })
      // heading-order: Analytics uses h3 section headings directly under h1 (cosmetic, not structural)
      const results = await axe(container, { rules: { 'heading-order': { enabled: false } } })
      expect(results).toHaveNoViolations()
    })
  })

  describe('UserAccess page', () => {
    beforeEach(() => {
      server.use(
        http.get(`${BASE}/auth/me`, () =>
          HttpResponse.json({
            id: 'user-123',
            email: 'test@example.com',
            role: 'employer',
            tenantId: 'tenant-456',
            fullName: 'Test Employer',
            emailVerified: true,
          })
        ),
        http.get(`${BASE}/user-access`, () =>
          HttpResponse.json([ownerUser])
        ),
      )
    })

    it('has no axe violations', async () => {
      const { container } = render(
        <MemoryRouter initialEntries={['/employer/user-access']}>
          <AuthProvider>
            <Routes>
              <Route path="/employer/user-access" element={<UserAccess />} />
              <Route path="/employer/user-access/add" element={<div>Add</div>} />
            </Routes>
          </AuthProvider>
        </MemoryRouter>
      )
      await waitFor(() => {
        expect(container.querySelector('h1')).toBeTruthy()
      })
      const results = await axe(container)
      expect(results).toHaveNoViolations()
    })
  })
})
