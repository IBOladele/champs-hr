-- Enable UUID generation
CREATE EXTENSION IF NOT EXISTS "pgcrypto";

-- Tenants
CREATE TABLE IF NOT EXISTS tenants (
  id          UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name        TEXT NOT NULL,
  slug        TEXT NOT NULL UNIQUE,
  plan        TEXT NOT NULL DEFAULT 'trial',
  created_at  TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_tenants_slug ON tenants (slug);

-- Users
CREATE TABLE IF NOT EXISTS users (
  id            UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  tenant_id     UUID NOT NULL REFERENCES tenants (id) ON DELETE CASCADE,
  email         TEXT NOT NULL UNIQUE,
  password_hash TEXT NOT NULL,
  role          TEXT NOT NULL CHECK (role IN ('employer', 'employee')),
  full_name     TEXT NOT NULL,
  phone         TEXT,
  avatar_url    TEXT,
  created_at    TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_users_tenant_id ON users (tenant_id);
CREATE INDEX IF NOT EXISTS idx_users_email ON users (email);

-- Departments
CREATE TABLE IF NOT EXISTS departments (
  id          UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  tenant_id   UUID NOT NULL REFERENCES tenants (id) ON DELETE CASCADE,
  name        TEXT NOT NULL,
  created_at  TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_departments_tenant_id ON departments (tenant_id);

-- Employees
CREATE TABLE IF NOT EXISTS employees (
  id                UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  tenant_id         UUID NOT NULL REFERENCES tenants (id) ON DELETE CASCADE,
  user_id           UUID NOT NULL REFERENCES users (id) ON DELETE CASCADE,
  department_id     UUID REFERENCES departments (id) ON DELETE SET NULL,
  employee_number   TEXT NOT NULL,
  job_title         TEXT NOT NULL,
  employment_type   TEXT NOT NULL,
  employment_status TEXT NOT NULL DEFAULT 'active',
  start_date        DATE NOT NULL,
  gross_salary      NUMERIC(12, 2) NOT NULL,
  pay_frequency     TEXT NOT NULL,
  created_at        TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  UNIQUE (tenant_id, employee_number)
);

CREATE INDEX IF NOT EXISTS idx_employees_tenant_id ON employees (tenant_id);
CREATE INDEX IF NOT EXISTS idx_employees_user_id ON employees (user_id);
CREATE INDEX IF NOT EXISTS idx_employees_department_id ON employees (department_id);

-- Payroll Runs
CREATE TABLE IF NOT EXISTS payroll_runs (
  id               UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  tenant_id        UUID NOT NULL REFERENCES tenants (id) ON DELETE CASCADE,
  period_start     DATE NOT NULL,
  period_end       DATE NOT NULL,
  status           TEXT NOT NULL DEFAULT 'draft',
  total_gross      NUMERIC(12, 2),
  total_net        NUMERIC(12, 2),
  total_deductions NUMERIC(12, 2),
  run_by           UUID REFERENCES users (id) ON DELETE SET NULL,
  created_at       TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_payroll_runs_tenant_id ON payroll_runs (tenant_id);

-- Payroll Run Items
CREATE TABLE IF NOT EXISTS payroll_run_items (
  id             UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  tenant_id      UUID NOT NULL REFERENCES tenants (id) ON DELETE CASCADE,
  payroll_run_id UUID NOT NULL REFERENCES payroll_runs (id) ON DELETE CASCADE,
  employee_id    UUID NOT NULL REFERENCES employees (id) ON DELETE CASCADE,
  gross_pay      NUMERIC(12, 2) NOT NULL,
  deductions     JSONB NOT NULL DEFAULT '{}',
  net_pay        NUMERIC(12, 2) NOT NULL,
  status         TEXT NOT NULL DEFAULT 'pending'
);

CREATE INDEX IF NOT EXISTS idx_payroll_run_items_run_id ON payroll_run_items (payroll_run_id);
CREATE INDEX IF NOT EXISTS idx_payroll_run_items_tenant_id ON payroll_run_items (tenant_id);
CREATE INDEX IF NOT EXISTS idx_payroll_run_items_employee_id ON payroll_run_items (employee_id);

-- Leave Requests
CREATE TABLE IF NOT EXISTS leave_requests (
  id             UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  tenant_id      UUID NOT NULL REFERENCES tenants (id) ON DELETE CASCADE,
  employee_id    UUID NOT NULL REFERENCES employees (id) ON DELETE CASCADE,
  leave_type     TEXT NOT NULL,
  start_date     DATE NOT NULL,
  end_date       DATE NOT NULL,
  days_requested NUMERIC(4, 1) NOT NULL,
  reason         TEXT,
  status         TEXT NOT NULL DEFAULT 'pending' CHECK (status IN ('pending', 'approved', 'rejected', 'cancelled')),
  reviewed_by    UUID REFERENCES users (id) ON DELETE SET NULL,
  reviewed_at    TIMESTAMPTZ,
  created_at     TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_leave_requests_tenant_id ON leave_requests (tenant_id);
CREATE INDEX IF NOT EXISTS idx_leave_requests_employee_id ON leave_requests (employee_id);

-- Benefits
CREATE TABLE IF NOT EXISTS benefits (
  id           UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  tenant_id    UUID NOT NULL REFERENCES tenants (id) ON DELETE CASCADE,
  name         TEXT NOT NULL,
  description  TEXT,
  benefit_type TEXT NOT NULL,
  value        NUMERIC(12, 2) NOT NULL,
  currency     TEXT NOT NULL DEFAULT 'GBP',
  is_active    BOOLEAN NOT NULL DEFAULT TRUE,
  created_at   TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_benefits_tenant_id ON benefits (tenant_id);

-- Employee Benefits
CREATE TABLE IF NOT EXISTS employee_benefits (
  id          UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  tenant_id   UUID NOT NULL REFERENCES tenants (id) ON DELETE CASCADE,
  employee_id UUID NOT NULL REFERENCES employees (id) ON DELETE CASCADE,
  benefit_id  UUID NOT NULL REFERENCES benefits (id) ON DELETE CASCADE,
  enrolled_at DATE NOT NULL,
  status      TEXT NOT NULL DEFAULT 'active',
  UNIQUE (employee_id, benefit_id)
);

CREATE INDEX IF NOT EXISTS idx_employee_benefits_tenant_id ON employee_benefits (tenant_id);
CREATE INDEX IF NOT EXISTS idx_employee_benefits_employee_id ON employee_benefits (employee_id);

-- Attendance Records
CREATE TABLE IF NOT EXISTS attendance_records (
  id          UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  tenant_id   UUID NOT NULL REFERENCES tenants (id) ON DELETE CASCADE,
  employee_id UUID NOT NULL REFERENCES employees (id) ON DELETE CASCADE,
  date        DATE NOT NULL,
  clock_in    TIMESTAMPTZ,
  clock_out   TIMESTAMPTZ,
  status      TEXT NOT NULL DEFAULT 'present' CHECK (status IN ('present', 'absent', 'late', 'half_day', 'remote')),
  notes       TEXT,
  created_at  TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  UNIQUE (tenant_id, employee_id, date)
);

CREATE INDEX IF NOT EXISTS idx_attendance_records_tenant_id ON attendance_records (tenant_id);
CREATE INDEX IF NOT EXISTS idx_attendance_records_employee_id ON attendance_records (employee_id);
CREATE INDEX IF NOT EXISTS idx_attendance_records_date ON attendance_records (date);
