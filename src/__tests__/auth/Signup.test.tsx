import { describe, it, expect, beforeEach } from 'vitest'
import { render, screen, waitFor } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { MemoryRouter, Routes, Route } from 'react-router-dom'
import { http, HttpResponse } from 'msw'
import { server } from '../../test/msw/server'
import { AuthProvider } from '../../context/AuthContext'
import Signup from '../../pages/auth/Signup'

// Default: no session
beforeEach(() => {
  server.use(
    http.get('http://localhost:3000/api/v1/auth/me', () =>
      HttpResponse.json({ error: 'Not authenticated' }, { status: 401 })
    ),
  )
})

function renderSignup() {
  return render(
    <MemoryRouter initialEntries={['/get-started']}>
      <AuthProvider>
        <Routes>
          <Route path="/get-started" element={<Signup />} />
          <Route path="/onboarding" element={<div>Onboarding</div>} />
          <Route path="/employee" element={<div>Employee Dashboard</div>} />
        </Routes>
      </AuthProvider>
    </MemoryRouter>
  )
}

async function fillForm(user: ReturnType<typeof userEvent.setup>, opts?: { skipName?: boolean; skipCompany?: boolean; skipEmail?: boolean; skipPassword?: boolean }) {
  await waitFor(() => screen.getByPlaceholderText('First name'))
  if (!opts?.skipName) {
    await user.type(screen.getByPlaceholderText('First name'), 'Ibrahim')
    await user.type(screen.getByPlaceholderText('Last name'), 'Oladele')
  }
  if (!opts?.skipCompany) {
    await user.type(screen.getByPlaceholderText('Acme Corp'), 'MonsterLabs')
  }
  if (!opts?.skipEmail) {
    await user.type(screen.getByPlaceholderText('you@company.com'), 'ibrahim@monsterlabs.org')
  }
  if (!opts?.skipPassword) {
    await user.type(screen.getByPlaceholderText('Min 8 chars, upper, lower, number, symbol'), 'Password123!')
  }
}

describe('Signup page', () => {
  it('renders all form fields', async () => {
    renderSignup()
    await waitFor(() => {
      expect(screen.getByPlaceholderText('First name')).toBeInTheDocument()
      expect(screen.getByPlaceholderText('Last name')).toBeInTheDocument()
      expect(screen.getByPlaceholderText('Acme Corp')).toBeInTheDocument()
      expect(screen.getByPlaceholderText('you@company.com')).toBeInTheDocument()
      expect(screen.getByPlaceholderText('Min 8 chars, upper, lower, number, symbol')).toBeInTheDocument()
    })
  })

  it('shows error when name is missing', async () => {
    const user = userEvent.setup()
    renderSignup()
    await waitFor(() => screen.getByRole('button', { name: 'Continue' }))
    await user.click(screen.getByRole('button', { name: 'Continue' }))
    await waitFor(() => {
      expect(screen.getByText(/please enter your first and last name/i)).toBeInTheDocument()
    })
  })

  it('shows error when company name is missing', async () => {
    const user = userEvent.setup()
    renderSignup()
    await fillForm(user, { skipCompany: true })
    await user.click(screen.getByRole('button', { name: 'Continue' }))
    await waitFor(() => {
      expect(screen.getByText(/please enter your company name/i)).toBeInTheDocument()
    })
  })

  it('redirects employer to /onboarding after signup', async () => {
    server.use(
      http.post('http://localhost:3000/api/v1/auth/signup', () =>
        HttpResponse.json(
          { user: { id: 'u1', email: 'ibrahim@monsterlabs.org', role: 'employer', tenantId: 't1', fullName: 'Ibrahim Oladele', emailVerified: false } },
          { status: 201 }
        )
      ),
    )
    const user = userEvent.setup()
    renderSignup()
    await fillForm(user)
    await user.click(screen.getByRole('button', { name: 'Continue' }))
    await waitFor(() => {
      expect(screen.getByText('Onboarding')).toBeInTheDocument()
    })
  })

  it('shows error for duplicate email', async () => {
    server.use(
      http.post('http://localhost:3000/api/v1/auth/signup', () =>
        HttpResponse.json({ error: 'Email already registered' }, { status: 409 })
      ),
    )
    const user = userEvent.setup()
    renderSignup()
    await fillForm(user)
    await user.click(screen.getByRole('button', { name: 'Continue' }))
    await waitFor(() => {
      expect(screen.getByText(/email already registered/i)).toBeInTheDocument()
    })
  })

  it('extracts message from Zod validation error array', async () => {
    server.use(
      http.post('http://localhost:3000/api/v1/auth/signup', () =>
        HttpResponse.json(
          { error: [{ message: 'Password must contain at least one uppercase letter' }] },
          { status: 422 }
        )
      ),
    )
    const user = userEvent.setup()
    renderSignup()
    await fillForm(user)
    await user.click(screen.getByRole('button', { name: 'Continue' }))
    await waitFor(() => {
      expect(screen.getByText(/password must contain at least one uppercase letter/i)).toBeInTheDocument()
    })
  })

  it('toggles password visibility', async () => {
    const user = userEvent.setup()
    renderSignup()
    await waitFor(() => screen.getByPlaceholderText('Min 8 chars, upper, lower, number, symbol'))
    const pwField = screen.getByPlaceholderText('Min 8 chars, upper, lower, number, symbol')
    expect(pwField).toHaveAttribute('type', 'password')
    await user.click(screen.getByRole('button', { name: /toggle password visibility/i }))
    expect(pwField).toHaveAttribute('type', 'text')
  })

  it('shows loading state while submitting', async () => {
    let resolve!: (r: Response) => void
    server.use(
      http.post('http://localhost:3000/api/v1/auth/signup', () =>
        new Promise<Response>((res) => { resolve = res as (r: Response) => void })
      ),
    )
    const user = userEvent.setup()
    renderSignup()
    await fillForm(user)
    await user.click(screen.getByRole('button', { name: 'Continue' }))
    await waitFor(() => {
      expect(screen.getByText('Creating account…')).toBeInTheDocument()
    })
    resolve(HttpResponse.json({ error: 'err' }, { status: 500 }) as unknown as Response)
  })
})
