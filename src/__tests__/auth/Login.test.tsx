import { describe, it, expect, beforeEach } from 'vitest'
import { render, screen, waitFor } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { MemoryRouter, Routes, Route } from 'react-router-dom'
import { http, HttpResponse } from 'msw'
import { server } from '../../test/msw/server'
import { AuthProvider } from '../../context/AuthContext'
import Login from '../../pages/auth/Login'

// Default: no active session so Login doesn't immediately redirect
beforeEach(() => {
  server.use(
    http.get('http://localhost:3000/api/v1/auth/me', () =>
      HttpResponse.json({ error: 'Not authenticated' }, { status: 401 })
    ),
  )
})

function renderLogin() {
  return render(
    <MemoryRouter initialEntries={['/login']}>
      <AuthProvider>
        <Routes>
          <Route path="/login" element={<Login />} />
          <Route path="/employer" element={<div>Employer Dashboard</div>} />
          <Route path="/employee" element={<div>Employee Dashboard</div>} />
          <Route path="/onboarding" element={<div>Onboarding</div>} />
        </Routes>
      </AuthProvider>
    </MemoryRouter>
  )
}

describe('Login page', () => {
  it('renders email and password fields', async () => {
    renderLogin()
    await waitFor(() => {
      expect(screen.getByPlaceholderText('you@company.com')).toBeInTheDocument()
      expect(screen.getByPlaceholderText('••••••••••••••')).toBeInTheDocument()
    })
  })

  it('shows error when email is empty', async () => {
    const user = userEvent.setup()
    renderLogin()
    await waitFor(() => screen.getByRole('button', { name: 'Login' }))
    await user.click(screen.getByRole('button', { name: 'Login' }))
    await waitFor(() => {
      expect(screen.getByText(/please enter your email address/i)).toBeInTheDocument()
    })
  })

  it('shows error when password is empty', async () => {
    const user = userEvent.setup()
    renderLogin()
    await waitFor(() => screen.getByRole('button', { name: 'Login' }))
    await user.type(screen.getByPlaceholderText('you@company.com'), 'test@example.com')
    await user.click(screen.getByRole('button', { name: 'Login' }))
    await waitFor(() => {
      expect(screen.getByText(/please enter your password/i)).toBeInTheDocument()
    })
  })

  it('redirects employer to /employer after successful login', async () => {
    server.use(
      http.post('http://localhost:3000/api/v1/auth/login', () =>
        HttpResponse.json({
          user: { id: 'u1', email: 'boss@co.com', role: 'employer', tenantId: 't1', fullName: 'Boss', emailVerified: false },
        })
      ),
    )
    const user = userEvent.setup()
    renderLogin()
    await waitFor(() => screen.getByPlaceholderText('you@company.com'))
    await user.type(screen.getByPlaceholderText('you@company.com'), 'boss@co.com')
    await user.type(screen.getByPlaceholderText('••••••••••••••'), 'Password123!')
    await user.click(screen.getByRole('button', { name: 'Login' }))
    await waitFor(() => {
      expect(screen.getByText('Employer Dashboard')).toBeInTheDocument()
    })
  })

  it('redirects employee to /employee after successful login', async () => {
    server.use(
      http.post('http://localhost:3000/api/v1/auth/login', () =>
        HttpResponse.json({
          user: { id: 'u2', email: 'emp@co.com', role: 'employee', tenantId: 't1', fullName: 'Jane', emailVerified: true },
        })
      ),
    )
    const user = userEvent.setup()
    renderLogin()
    await waitFor(() => screen.getByPlaceholderText('you@company.com'))
    await user.type(screen.getByPlaceholderText('you@company.com'), 'emp@co.com')
    await user.type(screen.getByPlaceholderText('••••••••••••••'), 'Password123!')
    await user.click(screen.getByRole('button', { name: 'Login' }))
    await waitFor(() => {
      expect(screen.getByText('Employee Dashboard')).toBeInTheDocument()
    })
  })

  it('shows error on invalid credentials', async () => {
    server.use(
      http.post('http://localhost:3000/api/v1/auth/login', () =>
        HttpResponse.json({ error: 'Invalid credentials' }, { status: 401 })
      ),
    )
    const user = userEvent.setup()
    renderLogin()
    await waitFor(() => screen.getByPlaceholderText('you@company.com'))
    await user.type(screen.getByPlaceholderText('you@company.com'), 'bad@co.com')
    await user.type(screen.getByPlaceholderText('••••••••••••••'), 'wrongpass')
    await user.click(screen.getByRole('button', { name: 'Login' }))
    await waitFor(() => {
      expect(screen.getByText(/invalid credentials/i)).toBeInTheDocument()
    })
  })

  it('toggles password visibility', async () => {
    const user = userEvent.setup()
    renderLogin()
    await waitFor(() => screen.getByPlaceholderText('••••••••••••••'))
    const pwField = screen.getByPlaceholderText('••••••••••••••')
    expect(pwField).toHaveAttribute('type', 'password')
    await user.click(screen.getByRole('button', { name: /toggle password visibility/i }))
    expect(pwField).toHaveAttribute('type', 'text')
  })

  it('shows loading state while submitting', async () => {
    let resolve!: (r: Response) => void
    server.use(
      http.post('http://localhost:3000/api/v1/auth/login', () =>
        new Promise<Response>((res) => { resolve = res as (r: Response) => void })
      ),
    )
    const user = userEvent.setup()
    renderLogin()
    await waitFor(() => screen.getByPlaceholderText('you@company.com'))
    await user.type(screen.getByPlaceholderText('you@company.com'), 'test@co.com')
    await user.type(screen.getByPlaceholderText('••••••••••••••'), 'Password123!')
    await user.click(screen.getByRole('button', { name: 'Login' }))
    await waitFor(() => {
      expect(screen.getByText('Logging in…')).toBeInTheDocument()
    })
    // Resolve the pending request to clean up
    resolve(HttpResponse.json({ error: 'err' }, { status: 401 }) as unknown as Response)
  })
})
