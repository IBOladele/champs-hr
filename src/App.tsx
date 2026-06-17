import { BrowserRouter, Routes, Route } from 'react-router-dom'

// Landing
import LandingPage from './pages/LandingPage'

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
import EmployeeDetail from './pages/employer/EmployeeDetail'
import AddEmployee from './pages/employer/AddEmployee'
import HrOps from './pages/employer/HrOps'
import Payroll from './pages/employer/Payroll'
import PayrollDetail from './pages/employer/PayrollDetail'
import PayrollRun from './pages/employer/PayrollRun'
import UserAccess from './pages/employer/UserAccess'
import Reports from './pages/employer/Reports'
import CreateReport from './pages/employer/CreateReport'
import Documents from './pages/employer/Documents'
import Benefits from './pages/employer/Benefits'
import Config from './pages/employer/Config'
import HrOpsEmployeeDetail from './pages/employer/HrOpsEmployeeDetail'
import UploadDocument from './pages/employer/UploadDocument'
import CreateBenefitPlan from './pages/employer/CreateBenefitPlan'
import AddUserAccess from './pages/employer/AddUserAccess'
import ConfigSettings from './pages/employer/ConfigSettings'

// Employee
import EmployeeLayout from './layouts/EmployeeLayout'
import EmployeeDashboard from './pages/employee/Dashboard'
import Attendance from './pages/employee/Attendance'
import AttendanceDetail from './pages/employee/AttendanceDetail'
import Payslips from './pages/employee/Payslips'
import PayslipDetail from './pages/employee/PayslipDetail'
import LeaveRequests from './pages/employee/LeaveRequests'
import SubmitLeave from './pages/employee/SubmitLeave'
import EmployeeBenefits from './pages/employee/Benefits'
import BenefitDetail from './pages/employee/BenefitDetail'
import EmployeeConfig from './pages/employee/Config'

export default function App() {
  return (
    <BrowserRouter>
      <Routes>
        {/* Landing */}
        <Route path="/" element={<LandingPage />} />

        {/* Auth flow */}
        <Route path="/get-started" element={<RoleSelect />} />
        <Route path="/signup" element={<Signup />} />
        <Route path="/otp" element={<OtpVerify />} />
        <Route path="/login" element={<Login />} />
        <Route path="/onboarding" element={<Onboarding />} />

        {/* Employer flow */}
        <Route path="/employer" element={<EmployerLayout />}>
          <Route index element={<Dashboard />} />
          <Route path="analytics"   element={<Analytics />} />
          <Route path="employees"        element={<Employees />} />
          <Route path="employees/add"    element={<AddEmployee />} />
          <Route path="employees/:id"    element={<EmployeeDetail />} />
          <Route path="hr-ops"           element={<HrOps />} />
          <Route path="hr-ops/employee/:id" element={<HrOpsEmployeeDetail />} />
          <Route path="payroll"          element={<Payroll />} />
          <Route path="payroll/run"      element={<PayrollRun />} />
          <Route path="payroll/:runId"   element={<PayrollDetail />} />
          <Route path="user-access" element={<UserAccess />} />
          <Route path="reports"          element={<Reports />} />
          <Route path="reports/create"   element={<CreateReport />} />
          <Route path="documents"        element={<Documents />} />
          <Route path="documents/upload" element={<UploadDocument />} />
          <Route path="benefits"         element={<Benefits />} />
          <Route path="benefits/create"  element={<CreateBenefitPlan />} />
          <Route path="user-access/add"  element={<AddUserAccess />} />
          <Route path="config"           element={<Config />} />
          <Route path="config/settings"  element={<ConfigSettings />} />
        </Route>

        {/* Employee flow */}
        <Route path="/employee" element={<EmployeeLayout />}>
          <Route index element={<EmployeeDashboard />} />
          <Route path="attendance"        element={<Attendance />} />
          <Route path="attendance/detail" element={<AttendanceDetail />} />
          <Route path="payslips"          element={<Payslips />} />
          <Route path="payslips/:id"      element={<PayslipDetail />} />
          <Route path="leave"             element={<LeaveRequests />} />
          <Route path="leave/submit"      element={<SubmitLeave />} />
          <Route path="benefits"          element={<EmployeeBenefits />} />
          <Route path="benefits/:planId"  element={<BenefitDetail />} />
          <Route path="config"            element={<EmployeeConfig />} />
        </Route>
      </Routes>
    </BrowserRouter>
  )
}
