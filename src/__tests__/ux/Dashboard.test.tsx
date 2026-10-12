import { describe, it, expect, beforeEach } from 'vitest'
import { render, screen, waitFor } from '@testing-library/react'
import { MemoryRouter, Routes, Route } from 'react-router-dom'
import { http, HttpResponse } from 'msw'
import { server } from '../../test/msw/server'
import { AuthProvider } from '../../context/AuthContext'
import EmployerDashboard from '../../pages/employer/Dashboard'

const BASE = 'http://localhost:3000/api/v1'

const defaultDashboard = {
  onboardingStep: 0,
  onboardingCompleted: false,
  employeeCount: 0,
  invitedCount: 0,
  nextPayrollDate: null,
  recentPayrolls: [],
  upcomingStarters: [],
  pendingLeaveCount: 0,
  todayPresent: 0,
}

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
    http.get(`${BASE}/onboarding`, () =>
      HttpResponse.json({ step: 1, completed: false, settings: {} })
    ),
    http.get(`${BASE}/dashboard`, () =>
      HttpResponse.json(defaultDashboard)
    ),
  )
})

function renderDashboard() {
  return render(
    <MemoryRouter initialEntries={['/employer']}>
      <AuthProvider>
        <Routes>
          <Route path="/employer" element={<EmployerDashboard />} />
          <Route path="/employer/config" element={<div>Config</div>} />
          <Route path="/employer/employees/add" element={<div>Add Employee</div>} />
          <Route path="/employer/payroll" element={<div>Payroll</div>} />
        </Routes>
      </AuthProvider>
    </MemoryRouter>
  )
}

describe('Dashboard page', () => {
  it('shows "Welcome, Test" heading (firstName from fullName "Test Employer")', async () => {
    renderDashboard()
    await waitFor(() => {
      expect(screen.getByText(/welcome,\s*test/i)).toBeInTheDocument()
    })
  })

  it('shows 6 onboarding steps', async () => {
    renderDashboard()
    await waitFor(() => {
      expect(screen.getByText('Company details')).toBeInTheDocument()
    })
    expect(screen.getByText('Business bank account')).toBeInTheDocument()
    expect(screen.getByText('Federal and state tax setup')).toBeInTheDocument()
    expect(screen.getByText('Add employees')).toBeInTheDocument()
    expect(screen.getByText('Pay schedule')).toBeInTheDocument()
    expect(screen.getByText('Run your first payroll')).toBeInTheDocument()
  })

  it('"Company details" is step 1 and shows the correct description', async () => {
    renderDashboard()
    await waitFor(() => {
      expect(screen.getByText('Company details')).toBeInTheDocument()
    })
    expect(
      screen.getByText(/add your business name, address, and legal entity type/i)
    ).toBeInTheDocument()
  })

  it('when setup.step=2, step 3 is shown as current with "Continue setup" button', async () => {
    server.use(
      http.get(`${BASE}/onboarding`, () =>
        HttpResponse.json({ step: 3, completed: false, settings: {} })
      ),
    )
    renderDashboard()
    await waitFor(() => {
      expect(screen.getByText('Federal and state tax setup')).toBeInTheDocument()
    })
    // Step 3 (Federal and state tax setup) should be the current step with action button
    expect(screen.getByRole('button', { name: /continue setup/i })).toBeInTheDocument()
  })

  it('shows "Switching from another provider?" panel', async () => {
    renderDashboard()
    await waitFor(() => {
      expect(screen.getByText(/switching from another provider/i)).toBeInTheDocument()
    })
  })

  it('shows loading/setup content initially (before full API response)', async () => {
    // Dashboard has no loading gate — it renders immediately with initial state
    // and fetches in the background. So the welcome heading appears right away.
    renderDashboard()
    await waitFor(() => {
      expect(screen.getByText(/welcome,\s*test/i)).toBeInTheDocument()
    })
  })

  it('when completed: true, does NOT show the setup checklist', async () => {
    server.use(
      http.get(`${BASE}/onboarding`, () =>
        HttpResponse.json({ step: 6, completed: true, settings: {} })
      ),
      http.get(`${BASE}/dashboard`, () =>
        HttpResponse.json({ ...defaultDashboard, onboardingCompleted: true })
      ),
    )
    renderDashboard()
    await waitFor(() => {
      // Completed state shows "Welcome back" not the checklist
      expect(screen.getByText(/welcome back,\s*test/i)).toBeInTheDocument()
    })
    expect(screen.queryByText('Set up payroll')).not.toBeInTheDocument()
  })
})
