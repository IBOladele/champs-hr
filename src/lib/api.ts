const BASE_URL = (import.meta.env.VITE_API_URL ?? 'http://localhost:3000').replace(/\/$/, '')

// ── Token storage ─────────────────────────────────────────────────────────────

/** Decode a JWT payload without verifying the signature (server does that). */
function decodeJwtPayload(token: string): Record<string, unknown> | null {
  try {
    const [, part] = token.split('.')
    if (!part) return null
    return JSON.parse(atob(part.replace(/-/g, '+').replace(/_/g, '/')))
  } catch {
    return null
  }
}

/** Returns stored token only if it exists and hasn't expired. */
export function getToken(): string | null {
  try {
    const token = localStorage.getItem('champs_token')
    if (!token) return null
    const payload = decodeJwtPayload(token)
    if (!payload) {
      localStorage.removeItem('champs_token')
      return null
    }
    const exp = payload.exp as number | undefined
    if (exp && Date.now() / 1000 > exp) {
      localStorage.removeItem('champs_token')
      localStorage.removeItem('champs_user')
      return null
    }
    return token
  } catch {
    return null
  }
}

function saveToken(token: string): void {
  try { localStorage.setItem('champs_token', token) } catch { /* storage blocked */ }
}

function clearStorage(): void {
  try {
    localStorage.removeItem('champs_token')
    localStorage.removeItem('champs_user')
  } catch { /* storage blocked */ }
}

function saveUser(user: AuthUser): void {
  try { localStorage.setItem('champs_user', JSON.stringify(user)) } catch { /* storage blocked */ }
}

function loadUser(): AuthUser | null {
  try {
    const raw = localStorage.getItem('champs_user')
    return raw ? (JSON.parse(raw) as AuthUser) : null
  } catch {
    return null
  }
}

// ── Error class ───────────────────────────────────────────────────────────────

export class ApiError extends Error {
  constructor(public readonly status: number, message: string) {
    super(message)
    this.name = 'ApiError'
  }
}

// ── Core fetch wrapper ────────────────────────────────────────────────────────

async function request<T>(path: string, options: RequestInit = {}): Promise<T> {
  const token = getToken()
  const res = await fetch(`${BASE_URL}/api/v1${path}`, {
    ...options,
    headers: {
      'Content-Type': 'application/json',
      ...(token ? { Authorization: `Bearer ${token}` } : {}),
      ...(options.headers ?? {}),
    },
  })

  // 401 — token rejected by server (expired, tampered, revoked)
  if (res.status === 401) {
    clearStorage()
    // Let callers decide whether to redirect — throw so AuthContext can handle it
    const body = await res.json().catch(() => ({ error: 'Unauthorised' }))
    throw new ApiError(401, body.error ?? 'Unauthorised')
  }

  // 204 No Content — nothing to parse
  if (res.status === 204) return undefined as unknown as T

  const body = await res.json().catch(() => ({ error: 'Unexpected response' }))

  if (!res.ok) {
    throw new ApiError(res.status, body.error ?? 'Request failed')
  }

  return body as T
}

// ── Types ─────────────────────────────────────────────────────────────────────

export interface AuthUser {
  id: string
  email: string
  role: 'employer' | 'employee'
  tenantId: string
  fullName: string
  phone?: string | null
  avatarUrl?: string | null
}

export interface AuthResponse {
  accessToken: string
  user: AuthUser
}

export interface Employee {
  id: string
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
  phone: string | null
  avatarUrl: string | null
  departmentName: string | null
}

export interface Department {
  id: string
  name: string
  createdAt: string
}

export interface LeaveRequest {
  id: string
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
  periodStart: string
  periodEnd: string
  status: 'pending' | 'completed'
  totalGross: string | null
  totalNet: string | null
  totalDeductions: string | null
  createdAt: string
  runByName?: string | null
  items?: PayrollRunItem[]
}

export interface PayrollRunItem {
  id: string
  employeeId: string
  grossPay: string
  deductions: Record<string, number>
  netPay: string
  status: string
  employeeName: string
  periodStart?: string
  periodEnd?: string
}

export interface AttendanceRecord {
  id: string
  employeeId: string
  date: string
  clockIn: string | null
  clockOut: string | null
  status: string
  notes: string | null
  employeeName?: string
}

export interface Benefit {
  id: string
  name: string
  description: string | null
  benefitType: string | null
  value: string | null
  currency: string
  isActive: boolean
  createdAt: string
}

export interface DashboardStats {
  employees: {
    total: number
    active: number
    onLeave: number
    newThisMonth: number
  }
  leave: {
    pendingRequests: number
    approvedThisMonth: number
  }
  payroll: {
    totalRuns: number
    pendingRuns: number
    latestRunGross: number | null
    latestRunDate: string | null
  }
  attendance: {
    today: {
      present: number
      late: number
      absent: number
      remote: number
    }
  }
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

  updateMe: (data: { fullName?: string; phone?: string | null }): Promise<AuthUser> =>
    request<AuthUser>('/auth/me', { method: 'PATCH', body: JSON.stringify(data) }),

  logout: () => clearStorage(),

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
    employmentType?: string
    grossSalary?: number
    startDate?: string
    payFrequency?: string
  }): Promise<Employee> =>
    request<Employee>('/employees', { method: 'POST', body: JSON.stringify(data) }),
  update: (id: string, data: Partial<Pick<Employee, 'fullName' | 'phone' | 'jobTitle'>>): Promise<Employee> =>
    request<Employee>(`/employees/${id}`, { method: 'PATCH', body: JSON.stringify(data) }),
  delete: (id: string): Promise<void> =>
    request<void>(`/employees/${id}`, { method: 'DELETE' }),
  payslips: (id: string, year?: number): Promise<PayrollRunItem[]> =>
    request<PayrollRunItem[]>(`/employees/${id}/payslips${year ? `?year=${year}` : ''}`),
  payslip: (employeeId: string, itemId: string): Promise<PayrollRunItem> =>
    request<PayrollRunItem>(`/employees/${employeeId}/payslips/${itemId}`),
}

// ── Departments ───────────────────────────────────────────────────────────────

export const departments = {
  list: (): Promise<Department[]> => request<Department[]>('/departments'),
  create: (name: string): Promise<Department> =>
    request<Department>('/departments', { method: 'POST', body: JSON.stringify({ name }) }),
  update: (id: string, name: string): Promise<Department> =>
    request<Department>(`/departments/${id}`, { method: 'PATCH', body: JSON.stringify({ name }) }),
  delete: (id: string): Promise<void> =>
    request<void>(`/departments/${id}`, { method: 'DELETE' }),
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
  cancel: (id: string): Promise<LeaveRequest> =>
    request<LeaveRequest>(`/leave/${id}/cancel`, { method: 'PATCH' }),
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
  create: (data: {
    employeeId: string
    date: string
    status: string
    clockIn?: string | null
    clockOut?: string | null
    notes?: string | null
  }): Promise<AttendanceRecord> =>
    request<AttendanceRecord>('/attendance', { method: 'POST', body: JSON.stringify(data) }),
  update: (id: string, data: {
    status?: string
    clockIn?: string | null
    clockOut?: string | null
    notes?: string | null
  }): Promise<AttendanceRecord> =>
    request<AttendanceRecord>(`/attendance/${id}`, { method: 'PATCH', body: JSON.stringify(data) }),
}

// ── Benefits ──────────────────────────────────────────────────────────────────

export const benefits = {
  list: (): Promise<Benefit[]> => request<Benefit[]>('/benefits'),
  create: (data: {
    name: string
    description?: string
    benefitType: string
    value: number
    currency?: string
  }): Promise<Benefit> =>
    request<Benefit>('/benefits', { method: 'POST', body: JSON.stringify(data) }),
  enrol: (id: string, employeeId: string): Promise<unknown> =>
    request<unknown>(`/benefits/${id}/enrol`, {
      method: 'POST',
      body: JSON.stringify({ employeeId }),
    }),
}

// ── Stats ─────────────────────────────────────────────────────────────────────

export const stats = {
  get: (): Promise<DashboardStats> => request<DashboardStats>('/stats'),
}

// ── Health ────────────────────────────────────────────────────────────────────

export const health = {
  check: (): Promise<{ ok: boolean; timestamp: string }> =>
    fetch(`${BASE_URL}/health`).then((r) => r.json()) as Promise<{ ok: boolean; timestamp: string }>,
}
