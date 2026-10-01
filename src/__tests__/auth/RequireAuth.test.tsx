import { describe, it, expect } from 'vitest'
import { render, screen, waitFor } from '@testing-library/react'
import { MemoryRouter, Routes, Route } from 'react-router-dom'
import { http, HttpResponse } from 'msw'
import { server } from '../../test/msw/server'
import { AuthProvider } from '../../context/AuthContext'
import RequireAuth from '../../components/RequireAuth'

function Protected({ role }: { role?: 'employer' | 'employee' }) {
  return (
    <MemoryRouter initialEntries={['/protected']}>
      <AuthProvider>
        <Routes>
          <Route path="/login" element={<div>Login page</div>} />
          <Route path="/employer" element={<div>Employer Dashboard</div>} />
          <Route path="/employee" element={<div>Employee Dashboard</div>} />
          <Route
            path="/protected"
            element={
              <RequireAuth role={role}>
                <div>Protected content</div>
              </RequireAuth>
            }
          />
        </Routes>
      </AuthProvider>
    </MemoryRouter>
  )
}

describe('RequireAuth', () => {
  it('shows protected content when user is authenticated', async () => {
    render(<Protected />)
    await waitFor(() => {
      expect(screen.getByText('Protected content')).toBeInTheDocument()
    })
  })

  it('redirects to /login when no session', async () => {
    server.use(
      http.get('http://localhost:3000/api/v1/auth/me', () =>
        HttpResponse.json({ error: 'Not authenticated' }, { status: 401 })
      ),
    )
    render(<Protected />)
    await waitFor(() => {
      expect(screen.getByText('Login page')).toBeInTheDocument()
    })
  })

  it('redirects employer to /employer when role is employee', async () => {
    // User is employer but route requires employee
    render(<Protected role="employee" />)
    await waitFor(() => {
      expect(screen.getByText('Employer Dashboard')).toBeInTheDocument()
    })
  })

  it('redirects employee to /employee when route requires employer', async () => {
    server.use(
      http.get('http://localhost:3000/api/v1/auth/me', () =>
        HttpResponse.json({
          id: 'u', email: 'e@e.com', role: 'employee',
          tenantId: 't', fullName: 'Jane', emailVerified: true,
        })
      ),
    )
    render(<Protected role="employer" />)
    await waitFor(() => {
      expect(screen.getByText('Employee Dashboard')).toBeInTheDocument()
    })
  })

  it('shows spinner while loading auth state', () => {
    server.use(
      http.get('http://localhost:3000/api/v1/auth/me', async () => {
        await new Promise(r => setTimeout(r, 500))
        return HttpResponse.json({ error: 'Not authenticated' }, { status: 401 })
      }),
    )
    render(<Protected />)
    // Should show a spinner, not the content or redirect yet
    expect(screen.queryByText('Protected content')).not.toBeInTheDocument()
    expect(screen.queryByText('Login page')).not.toBeInTheDocument()
  })
})
