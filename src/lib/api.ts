const BASE_URL = import.meta.env.VITE_API_URL ?? 'http://localhost:3000'

function getToken(): string | null {
  return localStorage.getItem('champs_token')
}

function saveToken(token: string) {
  localStorage.setItem('champs_token', token)
}

function clearToken() {
  localStorage.removeItem('champs_token')
  localStorage.removeItem('champs_user')
}

function saveUser(user: AuthUser) {
  localStorage.setItem('champs_user', JSON.stringify(user))
}

function loadUser(): AuthUser | null {
  const raw = localStorage.getItem('champs_user')
  return raw ? JSON.parse(raw) : null
}

async function request<T>(
  path: string,
  options: RequestInit = {}
): Promise<T> {
  const token = getToken()
  const res = await fetch(`${BASE_URL}/api/v1${path}`, {
    ...options,
    headers: {
      'Content-Type': 'application/json',
      ...(token ? { Authorization: `Bearer ${token}` } : {}),
      ...(options.headers ?? {}),
    },
  })

  if (!res.ok) {
    const body = await res.json().catch(() => ({ error: 'Request failed' }))
    throw new ApiError(res.status, body.error ?? 'Request failed')
  }

  return res.json() as Promise<T>
}

export class ApiError extends Error {
  constructor(public status: number, message: string) {
    super(message)
    this.name = 'ApiError'
  }
}

// ── Types ─────────────────────────────────────────────────────────────────────

export interface AuthUser {
  id: string
  email: string
  role: 'employer' | 'employee'
  tenantId: string
  fullName: string
}

export interface AuthResponse {
  accessToken: string
  user: AuthUser
}

export interface Employee {
  id: string
  tenantId: string
  userId: string
  departmentId: string | null
  employeeNumber: string
  jobTitle: string | null
  employmentType: string | null
  employmentStatus: string
  startDate: string | null
  grossSalary: string | null
  payFrequency: string | null
  createdAt: string
  fullName: string
  email: string
  avatarUrl: string | null
  departmentName: string | null
}

export interface Department {
  id: string
  tenantId: string
  name: string
  createdAt: string
}

export interface LeaveRequest {
  id: string
  tenantId: string
  employeeId: string
  leaveType: string
  startDate: string
  endDate: string
  daysRequested: string
  reason: string | null
  status: 'pending' | 'approved' | 'rejected' | 'cancelled'
  reviewedAt: string | null
  createdAt: string
  employeeName?: string
}

export interface PayrollRun {
  id: string
  tenantId: string
  periodStart: string
  periodEnd: string
  status: 'draft' | 'processing' | 'completed' | 'failed'
  totalGross: string | null
  totalNet: string | null
  totalDeductions: string | null
  createdAt: string
  items?: PayrollRunItem[]
}

export interface PayrollRunItem {
  id: string
  employeeId: string
  grossPay: string
  deductions: Record<string, number>
  netPay: string
  status: string
  fullName: string
}

export interface AttendanceRecord {
  id: string
  employeeId: string
  date: string
  clockIn: string | null
  clockOut: string | null
  status: string
  notes: string | null
  fullName?: string
}

export interface Benefit {
  id: string
  tenantId: string
  name: string
  description: string | null
  benefitType: string | null
  value: string | null
  currency: string
  isActive: boolean
  createdAt: string
}

// ── Auth ──────────────────────────────────────────────────────────────────────

export const auth = {
  signup: async (data: {
    email: string
    password: string
    fullName: string
    companyName: string
  }): Promise<AuthResponse> => {
    const res = await request<AuthResponse>('/auth/signup', {
      method: 'POST',
      body: JSON.stringify(data),
    })
    saveToken(res.accessToken)
    saveUser(res.user)
    return res
  },

  login: async (email: string, password: string): Promise<AuthResponse> => {
    const res = await request<AuthResponse>('/auth/login', {
      method: 'POST',
      body: JSON.stringify({ email, password }),
    })
    saveToken(res.accessToken)
    saveUser(res.user)
    return res
  },

  me: (): Promise<AuthUser> => request<AuthUser>('/auth/me'),

  logout: () => {
    clearToken()
  },

  getStoredUser: loadUser,
  getToken,
}

// ── Employees ─────────────────────────────────────────────────────────────────

export const employees = {
  list: (): Promise<Employee[]> => request<Employee[]>('/employees'),

  get: (id: string): Promise<Employee> => request<Employee>(`/employees/${id}`),

  create: (data: {
    email: string
    fullName: string
    jobTitle?: string
    departmentId?: string
    employeeNumber: string
    grossSalary?: number
    startDate?: string
  }): Promise<Employee> =>
    request<Employee>('/employees', { method: 'POST', body: JSON.stringify(data) }),

  update: (id: string, data: Partial<Employee>): Promise<Employee> =>
    request<Employee>(`/employees/${id}`, { method: 'PATCH', body: JSON.stringify(data) }),

  delete: (id: string): Promise<{ message: string }> =>
    request<{ message: string }>(`/employees/${id}`, { method: 'DELETE' }),
}

// ── Departments ───────────────────────────────────────────────────────────────

export const departments = {
  list: (): Promise<Department[]> => request<Department[]>('/departments'),

  create: (name: string): Promise<Department> =>
    request<Department>('/departments', { method: 'POST', body: JSON.stringify({ name }) }),

  update: (id: string, name: string): Promise<Department> =>
    request<Department>(`/departments/${id}`, { method: 'PATCH', body: JSON.stringify({ name }) }),

  delete: (id: string): Promise<{ message: string }> =>
    request<{ message: string }>(`/departments/${id}`, { method: 'DELETE' }),
}

// ── Leave ─────────────────────────────────────────────────────────────────────

export const leave = {
  list: (): Promise<LeaveRequest[]> => request<LeaveRequest[]>('/leave'),

  create: (data: {
    leaveType: string
    startDate: string
    endDate: string
    daysRequested: number
    reason?: string
  }): Promise<LeaveRequest> =>
    request<LeaveRequest>('/leave', { method: 'POST', body: JSON.stringify(data) }),

  approve: (id: string): Promise<LeaveRequest> =>
    request<LeaveRequest>(`/leave/${id}/approve`, { method: 'PATCH' }),

  reject: (id: string): Promise<LeaveRequest> =>
    request<LeaveRequest>(`/leave/${id}/reject`, { method: 'PATCH' }),
}

// ── Payroll ───────────────────────────────────────────────────────────────────

export const payroll = {
  list: (): Promise<PayrollRun[]> => request<PayrollRun[]>('/payroll'),

  create: (data: { periodStart: string; periodEnd: string }): Promise<PayrollRun> =>
    request<PayrollRun>('/payroll', { method: 'POST', body: JSON.stringify(data) }),

  get: (id: string): Promise<PayrollRun> => request<PayrollRun>(`/payroll/${id}`),

  approve: (id: string): Promise<PayrollRun> =>
    request<PayrollRun>(`/payroll/${id}/approve`, { method: 'PATCH' }),
}

// ── Attendance ────────────────────────────────────────────────────────────────

export const attendance = {
  list: (): Promise<AttendanceRecord[]> => request<AttendanceRecord[]>('/attendance'),

  clockIn: (): Promise<AttendanceRecord> =>
    request<AttendanceRecord>('/attendance/clock-in', { method: 'POST' }),

  clockOut: (): Promise<AttendanceRecord> =>
    request<AttendanceRecord>('/attendance/clock-out', { method: 'POST' }),
}

// ── Benefits ──────────────────────────────────────────────────────────────────

export const benefits = {
  list: (): Promise<Benefit[]> => request<Benefit[]>('/benefits'),

  create: (data: Partial<Benefit>): Promise<Benefit> =>
    request<Benefit>('/benefits', { method: 'POST', body: JSON.stringify(data) }),

  enrol: (id: string, employeeId: string): Promise<{ message: string }> =>
    request<{ message: string }>(`/benefits/${id}/enrol`, {
      method: 'POST',
      body: JSON.stringify({ employeeId }),
    }),
}

// ── Health ────────────────────────────────────────────────────────────────────

export const health = {
  check: (): Promise<{ ok: boolean; timestamp: string }> =>
    fetch(`${BASE_URL}/health`).then((r) => r.json()),
}
