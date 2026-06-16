import { BrowserRouter, Routes, Route } from 'react-router-dom'

// Auth
import RoleSelect from './pages/auth/RoleSelect'
import Signup from './pages/auth/Signup'
import OtpVerify from './pages/auth/OtpVerify'
import Login from './pages/auth/Login'
import Onboarding from './pages/auth/Onboarding'

// Employer
import EmployerLayout from './layouts/EmployerLayout'
import Dashboard from './pages/employer/Dashboard'
import Analytics from './pages/employer/Analytics'
import Employees from './pages/employer/Employees'
import HrOps from './pages/employer/HrOps'
import Payroll from './pages/employer/Payroll'
import UserAccess from './pages/employer/UserAccess'
import Reports from './pages/employer/Reports'
import Documents from './pages/employer/Documents'
import Benefits from './pages/employer/Benefits'
import Config from './pages/employer/Config'

// Employee
import EmployeeLayout from './layouts/EmployeeLayout'
import EmployeeDashboard from './pages/employee/Dashboard'
import Attendance from './pages/employee/Attendance'
import Payslips from './pages/employee/Payslips'
import LeaveRequests from './pages/employee/LeaveRequests'
import EmployeeBenefits from './pages/employee/Benefits'
import EmployeeConfig from './pages/employee/Config'

export default function App() {
  return (
    <BrowserRouter>
      <Routes>
        {/* Auth flow */}
        <Route path="/" element={<RoleSelect />} />
        <Route path="/signup" element={<Signup />} />
        <Route path="/otp" element={<OtpVerify />} />
        <Route path="/login" element={<Login />} />
        <Route path="/onboarding" element={<Onboarding />} />

        {/* Employer flow */}
        <Route path="/employer" element={<EmployerLayout />}>
          <Route index element={<Dashboard />} />
          <Route path="analytics"   element={<Analytics />} />
          <Route path="employees"   element={<Employees />} />
          <Route path="hr-ops"      element={<HrOps />} />
          <Route path="payroll"     element={<Payroll />} />
          <Route path="user-access" element={<UserAccess />} />
          <Route path="reports"     element={<Reports />} />
          <Route path="documents"   element={<Documents />} />
          <Route path="benefits"    element={<Benefits />} />
          <Route path="config"      element={<Config />} />
        </Route>

        {/* Employee flow */}
        <Route path="/employee" element={<EmployeeLayout />}>
          <Route index element={<EmployeeDashboard />} />
          <Route path="attendance" element={<Attendance />} />
          <Route path="payslips"   element={<Payslips />} />
          <Route path="leave"      element={<LeaveRequests />} />
          <Route path="benefits"   element={<EmployeeBenefits />} />
          <Route path="config"     element={<EmployeeConfig />} />
        </Route>
      </Routes>
    </BrowserRouter>
  )
}
