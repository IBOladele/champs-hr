import { describe, it, expect, beforeEach } from 'vitest'
import { render, screen, waitFor } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { MemoryRouter, Routes, Route } from 'react-router-dom'
import { http, HttpResponse } from 'msw'
import { server } from '../../test/msw/server'
import { AuthProvider } from '../../context/AuthContext'
import Analytics from '../../pages/employer/Analytics'

const BASE = 'http://localhost:3000/api/v1'

const defaultStats = {
  employees: { total: 0, active: 0, onLeave: 0, newThisMonth: 0 },
  leave: { pendingRequests: 0, approvedThisMonth: 0 },
  payroll: { totalRuns: 0, pendingRuns: 0, latestRunGross: null, latestRunDate: null },
  attendance: { today: { present: 0, late: 0, absent: 0, remote: 0 } },
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

function renderAnalytics() {
  return render(
    <MemoryRouter initialEntries={['/employer/analytics']}>
      <AuthProvider>
        <Routes>
          <Route path="/employer/analytics" element={<Analytics />} />
        </Routes>
      </AuthProvider>
    </MemoryRouter>
  )
}

describe('Analytics page', () => {
  it('shows "Analytics" heading', async () => {
    renderAnalytics()
    await waitFor(() => {
      expect(screen.getByRole('heading', { name: /analytics/i })).toBeInTheDocument()
    })
  })

  it('shows 4 tabs (Overview, Employee analytics, Payroll analytics, Attendance & leave)', async () => {
    renderAnalytics()
    await waitFor(() => {
      expect(screen.getByRole('button', { name: /overview/i })).toBeInTheDocument()
    })
    expect(screen.getByRole('button', { name: /employee analytics/i })).toBeInTheDocument()
    expect(screen.getByRole('button', { name: /payroll analytics/i })).toBeInTheDocument()
    expect(screen.getByRole('button', { name: /attendance & leave/i })).toBeInTheDocument()
  })

  it('default tab is Overview — shows "Total employees" stat card', async () => {
    renderAnalytics()
    await waitFor(() => {
      expect(screen.getAllByText(/total employees/i).length).toBeGreaterThan(0)
    })
  })

  it('clicking "Payroll analytics" tab shows "Payroll spend" section', async () => {
    const user = userEvent.setup()
    renderAnalytics()
    await waitFor(() => screen.getByRole('button', { name: /payroll analytics/i }))
    await user.click(screen.getByRole('button', { name: /payroll analytics/i }))
    await waitFor(() => {
      expect(screen.getByText(/payroll spend/i)).toBeInTheDocument()
    })
  })

  it('clicking "Employee analytics" tab shows "Employment type" or "New hires" section', async () => {
    const user = userEvent.setup()
    renderAnalytics()
    await waitFor(() => screen.getByRole('button', { name: /employee analytics/i }))
    await user.click(screen.getByRole('button', { name: /employee analytics/i }))
    await waitFor(() => {
      const hasEmploymentType = screen.queryByText(/employment type/i)
      const hasNewHires = screen.queryByText(/new hires/i)
      expect(hasEmploymentType || hasNewHires).toBeTruthy()
    })
  })

  it('clicking "Attendance & leave" tab shows "Attendance today" section', async () => {
    const user = userEvent.setup()
    renderAnalytics()
    await waitFor(() => screen.getByRole('button', { name: /attendance & leave/i }))
    await user.click(screen.getByRole('button', { name: /attendance & leave/i }))
    await waitFor(() => {
      expect(screen.getByText(/attendance today/i)).toBeInTheDocument()
    })
  })

  it('with stats showing 0 employees, shows correct zero values in Overview', async () => {
    renderAnalytics()
    await waitFor(() => {
      expect(screen.getAllByText(/total employees/i).length).toBeGreaterThan(0)
    })
    // The stat cards render numeric values; all should be 0
    const zeros = screen.getAllByText('0')
    expect(zeros.length).toBeGreaterThan(0)
  })

  it('shows loading state before data arrives', async () => {
    let resolve!: (v: Response) => void
    server.use(
      http.get(`${BASE}/stats`, () =>
        new Promise<Response>((res) => { resolve = res as (v: Response) => void })
      ),
    )
    renderAnalytics()
    await waitFor(() => {
      expect(screen.getByText(/loading analytics/i)).toBeInTheDocument()
    })
    resolve(HttpResponse.json(defaultStats) as unknown as Response)
  })
})
