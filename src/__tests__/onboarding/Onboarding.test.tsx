import { describe, it, expect, vi } from 'vitest'
import { render, screen, waitFor } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { MemoryRouter, Routes, Route } from 'react-router-dom'
import { http, HttpResponse } from 'msw'
import { server } from '../../test/msw/server'
import { AuthProvider } from '../../context/AuthContext'
import Onboarding from '../../pages/auth/Onboarding'

// Default MSW handlers return employer (emailVerified: false) and onboarding step 0

function renderOnboarding() {
  return render(
    <MemoryRouter initialEntries={['/onboarding']}>
      <AuthProvider>
        <Routes>
          <Route path="/onboarding" element={<Onboarding />} />
          <Route path="/employer" element={<div>Dashboard</div>} />
        </Routes>
      </AuthProvider>
    </MemoryRouter>
  )
}

describe('Onboarding page', () => {
  it('displays "Company profile" heading on step 0', async () => {
    renderOnboarding()
    // Use heading role to avoid matching sidebar button text
    await waitFor(() => {
      expect(screen.getByRole('heading', { name: 'Company profile' })).toBeInTheDocument()
    })
  })

  it('shows email verification banner when email is not verified', async () => {
    renderOnboarding()
    await waitFor(() => {
      expect(screen.getByText(/verify your email/i)).toBeInTheDocument()
    })
  })

  it('hides email verification banner when email is verified', async () => {
    server.use(
      http.get('http://localhost:3000/api/v1/auth/me', () =>
        HttpResponse.json({
          id: 'user-123', email: 'test@example.com', role: 'employer',
          tenantId: 'tenant-456', fullName: 'Test', emailVerified: true,
        })
      ),
    )
    renderOnboarding()
    await waitFor(() => {
      expect(screen.queryByText(/verify your email/i)).not.toBeInTheDocument()
    })
  })

  it('resumes from saved step when progress exists', async () => {
    server.use(
      http.get('http://localhost:3000/api/v1/onboarding', () =>
        HttpResponse.json({
          step: 2,
          completed: false,
          settings: {
            companyName: 'MonsterLabs', country: 'US', businessSize: '1-10',
            industry: 'technology', timezone: 'America/New_York', currency: 'USD',
            address: '1 Test St', website: 'https://monsterlabs.org',
          },
        })
      ),
    )
    renderOnboarding()
    // Step 2 label is "Compliance (2)"
    await waitFor(() => {
      expect(screen.getByRole('heading', { name: 'Compliance (2)' })).toBeInTheDocument()
    })
  })

  it('saves step data and advances when "Save and continue" is clicked', async () => {
    const saveSpy = vi.fn()
    server.use(
      http.patch('http://localhost:3000/api/v1/onboarding/step/:step', async ({ request }) => {
        const body = await request.json()
        saveSpy(body)
        return HttpResponse.json({ ok: true, step: 1 })
      }),
    )
    const user = userEvent.setup()
    renderOnboarding()

    await waitFor(() => screen.getByRole('heading', { name: 'Company profile' }))

    await user.type(screen.getByPlaceholderText('Enter company name'), 'MonsterLabs')
    await user.type(screen.getByPlaceholderText('e.g. United States'), 'United States')
    await user.type(screen.getByPlaceholderText('Enter registered address'), '1 Test Street')

    await user.click(screen.getByRole('button', { name: /save and continue/i }))

    await waitFor(() => {
      expect(saveSpy).toHaveBeenCalled()
    })
  })

  it('shows inline error when step save fails', async () => {
    server.use(
      http.patch('http://localhost:3000/api/v1/onboarding/step/:step', () =>
        HttpResponse.json({ error: 'Validation failed' }, { status: 400 })
      ),
    )
    const user = userEvent.setup()
    renderOnboarding()
    await waitFor(() => screen.getByRole('heading', { name: 'Company profile' }))
    await user.click(screen.getByRole('button', { name: /save and continue/i }))
    await waitFor(() => {
      expect(screen.getByText(/validation failed/i)).toBeInTheDocument()
    })
  })

  it('back button is disabled on first step', async () => {
    renderOnboarding()
    await waitFor(() => screen.getByRole('heading', { name: 'Company profile' }))
    const backBtn = screen.getByRole('button', { name: /← back/i })
    expect(backBtn).toBeDisabled()
  })

  it('navigates to /employer when "Go to dashboard" is clicked on final step', async () => {
    server.use(
      http.get('http://localhost:3000/api/v1/onboarding', () =>
        HttpResponse.json({ step: 6, completed: true, settings: {} })
      ),
    )
    const user = userEvent.setup()
    renderOnboarding()
    await waitFor(() => {
      expect(screen.getByText(/you're all set/i)).toBeInTheDocument()
    })
    await user.click(screen.getByRole('button', { name: /go to dashboard/i }))
    await waitFor(() => {
      expect(screen.getByText('Dashboard')).toBeInTheDocument()
    })
  })
})
