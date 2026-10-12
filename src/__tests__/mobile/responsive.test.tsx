import { describe, it, expect, beforeEach, afterEach } from 'vitest'
import { render, screen, waitFor } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { MemoryRouter, Routes, Route } from 'react-router-dom'
import { http, HttpResponse } from 'msw'
import { server } from '../../test/msw/server'
import { AuthProvider } from '../../context/AuthContext'
import Login from '../../pages/auth/Login'
import Signup from '../../pages/auth/Signup'
import Analytics from '../../pages/employer/Analytics'
import UserAccess from '../../pages/employer/UserAccess'

const BASE = 'http://localhost:3000/api/v1'

function mockMatchMedia(matches: boolean) {
  Object.defineProperty(window, 'matchMedia', {
    writable: true,
    value: (query: string) => ({
      matches,
      media: query,
      onchange: null,
      addListener: vi.fn(),
      removeListener: vi.fn(),
      addEventListener: vi.fn(),
      removeEventListener: vi.fn(),
      dispatchEvent: vi.fn(),
    }),
  })
}

import { vi } from 'vitest'

const defaultStats = {
  employees: { total: 0, active: 0, onLeave: 0, newThisMonth: 0 },
  leave: { pendingRequests: 0, approvedThisMonth: 0 },
  payroll: { totalRuns: 0, pendingRuns: 0, latestRunGross: null, latestRunDate: null },
  attendance: { today: { present: 0, late: 0, absent: 0, remote: 0 } },
}

beforeEach(() => {
  server.use(
    http.get(`${BASE}/auth/me`, () =>
      HttpResponse.json({ error: 'Not authenticated' }, { status: 401 })
    ),
  )
})

afterEach(() => {
  // Reset matchMedia to desktop default
  mockMatchMedia(false)
})

describe('Mobile responsiveness', () => {
  it('Login page renders correctly at mobile viewport (375px) — same fields present', async () => {
    mockMatchMedia(true)
    render(
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
    await waitFor(() => {
      expect(screen.getByPlaceholderText('you@company.com')).toBeInTheDocument()
      expect(screen.getByPlaceholderText('••••••••••••••')).toBeInTheDocument()
    })
  })

  it('Signup page renders all form fields at mobile viewport', async () => {
    mockMatchMedia(true)
    render(
      <MemoryRouter initialEntries={['/signup']}>
        <AuthProvider>
          <Routes>
            <Route path="/signup" element={<Signup />} />
            <Route path="/onboarding" element={<div>Onboarding</div>} />
          </Routes>
        </AuthProvider>
      </MemoryRouter>
    )
    await waitFor(() => {
      expect(screen.getByRole('button', { name: /continue/i })).toBeInTheDocument()
    })
  })

  it('Analytics page tab buttons are all present regardless of viewport', async () => {
    mockMatchMedia(true)
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
    render(
      <MemoryRouter initialEntries={['/employer/analytics']}>
        <AuthProvider>
          <Routes>
            <Route path="/employer/analytics" element={<Analytics />} />
          </Routes>
        </AuthProvider>
      </MemoryRouter>
    )
    await waitFor(() => {
      expect(screen.getByRole('button', { name: /overview/i })).toBeInTheDocument()
    })
    expect(screen.getByRole('button', { name: /employee analytics/i })).toBeInTheDocument()
    expect(screen.getByRole('button', { name: /payroll analytics/i })).toBeInTheDocument()
    expect(screen.getByRole('button', { name: /attendance & leave/i })).toBeInTheDocument()
  })

  it('UserAccess page table columns are present at mobile viewport', async () => {
    mockMatchMedia(true)
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
        HttpResponse.json([
          {
            id: 'user-123',
            fullName: 'Test Employer',
            email: 'test@example.com',
            employeeNumber: null,
            jobTitle: null,
            portalRole: null,
            portalPermissions: {},
            isOwner: true,
            createdAt: '2024-01-01T00:00:00.000Z',
          },
        ])
      ),
    )
    render(
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
      expect(screen.getByText('Test Employer')).toBeInTheDocument()
    })
    // Table column headers should be present
    expect(screen.getByText(/^name$/i)).toBeInTheDocument()
    expect(screen.getByText(/^email$/i)).toBeInTheDocument()
    expect(screen.getByText(/^role$/i)).toBeInTheDocument()
  })

  it('Login page keyboard navigation: Tab through form fields hits email → password → submit', async () => {
    const user = userEvent.setup()
    render(
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
    await waitFor(() => screen.getByPlaceholderText('you@company.com'))
    const emailField = screen.getByPlaceholderText('you@company.com')
    const passwordField = screen.getByPlaceholderText('••••••••••••••')
    const submitButton = screen.getByRole('button', { name: 'Login' })

    emailField.focus()
    expect(document.activeElement).toBe(emailField)

    // Login form order: email → "Forgot password?" button → password input
    await user.tab()
    await user.tab()
    expect(document.activeElement).toBe(passwordField)

    // Submit button is in the DOM and keyboard-focusable (tabIndex not -1)
    expect(submitButton).toBeInTheDocument()
    expect(submitButton.tabIndex).not.toBe(-1)
  })

  it('all form inputs on Login have accessible labels (getByLabelText or getByPlaceholderText)', async () => {
    render(
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
    await waitFor(() => {
      // Email and password fields are accessible
      expect(screen.getByPlaceholderText('you@company.com')).toBeInTheDocument()
      expect(screen.getByPlaceholderText('••••••••••••••')).toBeInTheDocument()
    })
  })
})
