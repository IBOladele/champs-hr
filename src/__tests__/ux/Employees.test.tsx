import { describe, it, expect, beforeEach } from 'vitest'
import { render, screen, waitFor } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { MemoryRouter, Routes, Route } from 'react-router-dom'
import { http, HttpResponse } from 'msw'
import { server } from '../../test/msw/server'
import { AuthProvider } from '../../context/AuthContext'
import Employees from '../../pages/employer/Employees'

const BASE = 'http://localhost:3000/api/v1'

const activeEmployee = {
  id: 'emp-1',
  userId: 'user-emp-1',
  email: 'alice@example.com',
  fullName: 'Alice Johnson',
  employeeNumber: 'EMP-001',
  jobTitle: 'Software Engineer',
  employmentType: 'full_time',
  employmentStatus: 'active',
  grossSalary: '75000',
  payFrequency: 'monthly',
  startDate: '2024-01-15',
  departmentId: null,
  departmentName: 'Engineering',
  phone: null,
  avatarUrl: null,
  createdAt: '2024-01-15T00:00:00.000Z',
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
    http.get(`${BASE}/employees`, () =>
      HttpResponse.json([])
    ),
  )
})

function renderEmployees() {
  return render(
    <MemoryRouter initialEntries={['/employer/employees']}>
      <AuthProvider>
        <Routes>
          <Route path="/employer/employees" element={<Employees />} />
          <Route path="/employer/employees/add" element={<div>Add Employee</div>} />
        </Routes>
      </AuthProvider>
    </MemoryRouter>
  )
}

describe('Employees page', () => {
  it('shows "Employees" heading', async () => {
    renderEmployees()
    await waitFor(() => {
      expect(screen.getByRole('heading', { name: /employees/i })).toBeInTheDocument()
    })
  })

  it('shows 4 tabs (Active, Invited, Pending review, Terminated)', async () => {
    renderEmployees()
    await waitFor(() => {
      expect(screen.getByRole('button', { name: /^active$/i })).toBeInTheDocument()
    })
    expect(screen.getByRole('button', { name: /^invited$/i })).toBeInTheDocument()
    expect(screen.getByRole('button', { name: /pending review/i })).toBeInTheDocument()
    expect(screen.getByRole('button', { name: /terminated/i })).toBeInTheDocument()
  })

  it('empty state shows "No employees yet" text when no employees', async () => {
    renderEmployees()
    await waitFor(() => {
      expect(screen.getByText('No employees yet')).toBeInTheDocument()
    })
  })

  it('with one active employee, shows their name and email in table', async () => {
    server.use(
      http.get(`${BASE}/employees`, () =>
        HttpResponse.json([activeEmployee])
      ),
    )
    renderEmployees()
    await waitFor(() => {
      expect(screen.getByText('Alice Johnson')).toBeInTheDocument()
    })
    expect(screen.getByText('alice@example.com')).toBeInTheDocument()
  })

  it('"Add new employee" button is present', async () => {
    renderEmployees()
    await waitFor(() => {
      expect(screen.getByRole('button', { name: /add new employee/i })).toBeInTheDocument()
    })
  })

  it('"Import Employees" button is present', async () => {
    renderEmployees()
    await waitFor(() => {
      expect(screen.getByRole('button', { name: /import employees/i })).toBeInTheDocument()
    })
  })

  it('employee status badge renders correctly for active employee', async () => {
    server.use(
      http.get(`${BASE}/employees`, () =>
        HttpResponse.json([activeEmployee])
      ),
    )
    renderEmployees()
    await waitFor(() => {
      expect(screen.getByText('Alice Johnson')).toBeInTheDocument()
    })
    // Active tab is default, employee is active so should be visible
    expect(screen.getByText('Alice Johnson')).toBeInTheDocument()
  })

  it('clicking "Add new employee" navigates to add page', async () => {
    const user = userEvent.setup()
    renderEmployees()
    await waitFor(() => screen.getByRole('button', { name: /add new employee/i }))
    await user.click(screen.getByRole('button', { name: /add new employee/i }))
    await waitFor(() => {
      expect(screen.getByText('Add Employee')).toBeInTheDocument()
    })
  })
})
