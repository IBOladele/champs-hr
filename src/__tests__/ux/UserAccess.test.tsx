import { describe, it, expect, beforeEach, vi } from 'vitest'
import { render, screen, waitFor } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { MemoryRouter, Routes, Route } from 'react-router-dom'
import { http, HttpResponse } from 'msw'
import { server } from '../../test/msw/server'
import { AuthProvider } from '../../context/AuthContext'
import UserAccess from '../../pages/employer/UserAccess'

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

const hrUser = {
  id: 'user-456',
  fullName: 'Jane Smith',
  email: 'jane@example.com',
  employeeNumber: 'EMP-001',
  jobTitle: 'HR Coordinator',
  portalRole: 'HR_Manager',
  portalPermissions: {},
  isOwner: false,
  createdAt: '2024-02-01T00:00:00.000Z',
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
    http.get(`${BASE}/user-access`, () =>
      HttpResponse.json([ownerUser, hrUser])
    ),
    http.delete(`${BASE}/user-access/:userId`, () =>
      new HttpResponse(null, { status: 204 })
    ),
  )
})

function renderUserAccess() {
  return render(
    <MemoryRouter initialEntries={['/employer/user-access']}>
      <AuthProvider>
        <Routes>
          <Route path="/employer/user-access" element={<UserAccess />} />
          <Route path="/employer/user-access/add" element={<div>Add User Access</div>} />
        </Routes>
      </AuthProvider>
    </MemoryRouter>
  )
}

describe('UserAccess page', () => {
  it('shows "User Access" heading', async () => {
    renderUserAccess()
    await waitFor(() => {
      expect(screen.getByRole('heading', { name: /user access/i })).toBeInTheDocument()
    })
  })

  it('shows 3 subtabs (User accounts, Roles, Security)', async () => {
    renderUserAccess()
    await waitFor(() => {
      expect(screen.getByRole('button', { name: /user accounts/i })).toBeInTheDocument()
    })
    expect(screen.getByRole('button', { name: /^roles$/i })).toBeInTheDocument()
    expect(screen.getByRole('button', { name: /security/i })).toBeInTheDocument()
  })

  it('with owner only: shows "1 account" and owner name/email', async () => {
    server.use(
      http.get(`${BASE}/user-access`, () =>
        HttpResponse.json([ownerUser])
      ),
    )
    renderUserAccess()
    await waitFor(() => {
      expect(screen.getByText(/1 account/i)).toBeInTheDocument()
    })
    expect(screen.getByText('Test Employer')).toBeInTheDocument()
    expect(screen.getByText('test@example.com')).toBeInTheDocument()
  })

  it('owner row shows "Owner" label (not a revoke button)', async () => {
    renderUserAccess()
    await waitFor(() => {
      expect(screen.getByText('Owner')).toBeInTheDocument()
    })
    // The owner row should not have a Revoke button
    const ownerRow = screen.getByText('Test Employer').closest('tr')
    expect(ownerRow).not.toContain(screen.queryByRole('button', { name: /revoke/i }))
  })

  it('non-owner user shows role badge and Revoke action', async () => {
    renderUserAccess()
    await waitFor(() => {
      expect(screen.getByText('Jane Smith')).toBeInTheDocument()
    })
    expect(screen.getByText('HR Manager')).toBeInTheDocument()
    expect(screen.getByRole('button', { name: /revoke/i })).toBeInTheDocument()
  })

  it('clicking "Roles" tab switches content', async () => {
    const user = userEvent.setup()
    renderUserAccess()
    await waitFor(() => screen.getByRole('button', { name: /^roles$/i }))
    await user.click(screen.getByRole('button', { name: /^roles$/i }))
    await waitFor(() => {
      expect(screen.getByText(/admin/i)).toBeInTheDocument()
    })
    // Roles tab shows role definitions
    expect(screen.getByText(/full access to all modules/i)).toBeInTheDocument()
  })

  it('"+ Add access" button is present', async () => {
    renderUserAccess()
    await waitFor(() => {
      expect(screen.getByRole('button', { name: /\+ add access/i })).toBeInTheDocument()
    })
  })

  it('empty state shows "No user accounts yet" when API returns []', async () => {
    server.use(
      http.get(`${BASE}/user-access`, () =>
        HttpResponse.json([])
      ),
    )
    renderUserAccess()
    await waitFor(() => {
      expect(screen.getByText(/no user accounts yet/i)).toBeInTheDocument()
    })
  })

  it('after revoke, user disappears from list', async () => {
    // Mock confirm dialog
    vi.spyOn(window, 'confirm').mockReturnValue(true)
    const user = userEvent.setup()
    renderUserAccess()
    await waitFor(() => screen.getByText('Jane Smith'))
    await user.click(screen.getByRole('button', { name: /revoke/i }))
    await waitFor(() => {
      expect(screen.queryByText('Jane Smith')).not.toBeInTheDocument()
    })
    vi.restoreAllMocks()
  })
})
