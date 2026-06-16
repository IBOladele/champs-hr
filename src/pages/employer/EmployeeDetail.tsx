import { useState } from 'react'
import { useNavigate, useParams } from 'react-router-dom'
import {
  ChevronLeft, Pencil, FileText, Calendar, Clock,
  DollarSign, User, Briefcase, Shield, Activity,
  MapPin, Phone, Building2, Download, MoreHorizontal,
  CheckCircle2, XCircle, AlertCircle
} from 'lucide-react'

// ── Mock employee data ────────────────────────────────────────────────────

const employeeData: Record<string, {
  id: string
  name: string
  role: string
  department: string
  workLocation: string
  phone: string
  employmentStatus: string
  monthlySalary: string
  hireDate: string
  timeInPosition: string
  payType: string
  level: string
  managerName: string
  status: 'Onboarded' | 'Pending' | 'Invited'
  avatarColor: string
  initial: string
  email: string
  address: string
  emergencyContact: string
  emergencyPhone: string
  nationality: string
  dateOfBirth: string
  gender: string
  bankName: string
  accountNumber: string
  sortCode: string
  paySchedule: string
}> = {
  '1': {
    id: '1',
    name: 'Smith Meyer',
    role: 'Senior product designer',
    department: 'Marketing and comms',
    workLocation: 'United States',
    phone: '+47478575744',
    employmentStatus: 'Fulltime 40hrs/week',
    monthlySalary: '$348,000',
    hireDate: '24th April 2021',
    timeInPosition: '4 years',
    payType: 'Monthly',
    level: 'Level 3',
    managerName: 'Awo Bangalee',
    status: 'Onboarded',
    avatarColor: 'bg-orange-200 text-orange-800',
    initial: 'S',
    email: 'smith.meyer@company.com',
    address: '123 Main St, New York, NY 10001',
    emergencyContact: 'Jane Meyer',
    emergencyPhone: '+1 555 234 5678',
    nationality: 'American',
    dateOfBirth: '12th March 1990',
    gender: 'Male',
    bankName: 'Chase Bank',
    accountNumber: '****4521',
    sortCode: '20-45-67',
    paySchedule: 'Monthly — 28th of each month',
  },
  '2': {
    id: '2',
    name: 'Lana Mejias',
    role: 'UX Architect',
    department: 'Engineering',
    workLocation: 'United Kingdom',
    phone: '+44 7911 123456',
    employmentStatus: 'Fulltime 40hrs/week',
    monthlySalary: '$210,000',
    hireDate: '3rd September 2022',
    timeInPosition: '2 years',
    payType: 'Monthly',
    level: 'Level 2',
    managerName: 'Tom Richards',
    status: 'Onboarded',
    avatarColor: 'bg-purple-200 text-purple-800',
    initial: 'L',
    email: 'lana.mejias@company.com',
    address: '45 Oxford St, London, W1D 2DZ',
    emergencyContact: 'Carlos Mejias',
    emergencyPhone: '+44 7700 900123',
    nationality: 'British',
    dateOfBirth: '5th July 1994',
    gender: 'Female',
    bankName: 'Barclays',
    accountNumber: '****8812',
    sortCode: '20-32-11',
    paySchedule: 'Monthly — 28th of each month',
  },
}

type DetailTab =
  | 'overview' | 'personal' | 'employment' | 'payroll'
  | 'compensation' | 'benefits' | 'attendance' | 'leave'
  | 'document' | 'logs'

const tabs: { key: DetailTab; label: string }[] = [
  { key: 'overview',      label: 'Overview'      },
  { key: 'personal',      label: 'Personal info'  },
  { key: 'employment',    label: 'Employment'     },
  { key: 'payroll',       label: 'Payroll'        },
  { key: 'compensation',  label: 'Compensation'   },
  { key: 'benefits',      label: 'Benefits'       },
  { key: 'attendance',    label: 'Attendance'     },
  { key: 'leave',         label: 'Leave'          },
  { key: 'document',      label: 'Document'       },
  { key: 'logs',          label: 'Logs'           },
]

// ── Sub-components ────────────────────────────────────────────────────────

function InfoField({ label, value }: { label: string; value: string }) {
  return (
    <div>
      <p className="text-xs text-gray-400 mb-0.5">{label}</p>
      <p className="text-sm font-medium text-gray-800">{value}</p>
    </div>
  )
}

function SectionCard({ title, children, action }: { title: string; children: React.ReactNode; action?: React.ReactNode }) {
  return (
    <div className="bg-white rounded-xl border border-gray-100 p-6">
      <div className="flex items-center justify-between mb-5">
        <h3 className="text-base font-semibold text-gray-900">{title}</h3>
        {action}
      </div>
      {children}
    </div>
  )
}

function EditBtn({ label = 'Edit information' }: { label?: string }) {
  return (
    <button className="flex items-center gap-1.5 text-sm text-gray-600 border border-gray-200 rounded-lg px-3 py-1.5 hover:bg-gray-50 transition-colors">
      <Pencil size={13} />
      {label}
    </button>
  )
}

// ── Tab content panels ────────────────────────────────────────────────────

function OverviewTab({ emp }: { emp: typeof employeeData['1'] }) {
  return (
    <div className="space-y-5">
      <SectionCard title="Personal information" action={<EditBtn />}>
        <div className="grid grid-cols-3 gap-x-8 gap-y-5">
          <InfoField label="Email address"      value={emp.email} />
          <InfoField label="Phone number"       value={emp.phone} />
          <InfoField label="Nationality"        value={emp.nationality} />
          <InfoField label="Date of birth"      value={emp.dateOfBirth} />
          <InfoField label="Gender"             value={emp.gender} />
          <InfoField label="Address"            value={emp.address} />
        </div>
      </SectionCard>
      <SectionCard title="Employment details" action={<EditBtn />}>
        <div className="grid grid-cols-3 gap-x-8 gap-y-5">
          <InfoField label="Department"         value={emp.department} />
          <InfoField label="Job title"          value={emp.role} />
          <InfoField label="Employment status"  value={emp.employmentStatus} />
          <InfoField label="Pay type"           value={emp.payType} />
          <InfoField label="Level"              value={emp.level} />
          <InfoField label="Manager"            value={emp.managerName} />
        </div>
      </SectionCard>
      <SectionCard title="Emergency contact" action={<EditBtn />}>
        <div className="grid grid-cols-3 gap-x-8 gap-y-5">
          <InfoField label="Contact name"       value={emp.emergencyContact} />
          <InfoField label="Phone number"       value={emp.emergencyPhone} />
          <InfoField label="Relationship"       value="Spouse" />
        </div>
      </SectionCard>
    </div>
  )
}

function PersonalTab({ emp }: { emp: typeof employeeData['1'] }) {
  return (
    <div className="space-y-5">
      <SectionCard title="Personal details" action={<EditBtn />}>
        <div className="grid grid-cols-3 gap-x-8 gap-y-5">
          <InfoField label="Full name"          value={emp.name} />
          <InfoField label="Email address"      value={emp.email} />
          <InfoField label="Phone number"       value={emp.phone} />
          <InfoField label="Date of birth"      value={emp.dateOfBirth} />
          <InfoField label="Gender"             value={emp.gender} />
          <InfoField label="Nationality"        value={emp.nationality} />
          <InfoField label="Address"            value={emp.address} />
        </div>
      </SectionCard>
      <SectionCard title="Emergency contact" action={<EditBtn />}>
        <div className="grid grid-cols-3 gap-x-8 gap-y-5">
          <InfoField label="Name"               value={emp.emergencyContact} />
          <InfoField label="Phone"              value={emp.emergencyPhone} />
          <InfoField label="Relationship"       value="Spouse" />
        </div>
      </SectionCard>
    </div>
  )
}

function EmploymentTab({ emp }: { emp: typeof employeeData['1'] }) {
  return (
    <div className="space-y-5">
      <SectionCard title="Employment details" action={<EditBtn />}>
        <div className="grid grid-cols-3 gap-x-8 gap-y-5">
          <InfoField label="Department"          value={emp.department} />
          <InfoField label="Job title"           value={emp.role} />
          <InfoField label="Work location"       value={emp.workLocation} />
          <InfoField label="Employment status"   value={emp.employmentStatus} />
          <InfoField label="Hire date"           value={emp.hireDate} />
          <InfoField label="Time in position"    value={emp.timeInPosition} />
          <InfoField label="Level"               value={emp.level} />
          <InfoField label="Pay type"            value={emp.payType} />
          <InfoField label="Reporting manager"   value={emp.managerName} />
        </div>
      </SectionCard>
      <SectionCard title="Probation" action={<EditBtn />}>
        <div className="grid grid-cols-3 gap-x-8 gap-y-5">
          <InfoField label="Probation period"    value="3 months" />
          <InfoField label="Probation end date"  value="24th July 2021" />
          <InfoField label="Probation status"    value="Completed" />
        </div>
      </SectionCard>
    </div>
  )
}

function PayrollTab({ emp }: { emp: typeof employeeData['1'] }) {
  const payslips = [
    { month: 'March 2025', gross: '$29,000', net: '$21,500', date: 'Mar 28, 2025' },
    { month: 'February 2025', gross: '$29,000', net: '$21,500', date: 'Feb 28, 2025' },
    { month: 'January 2025', gross: '$29,000', net: '$21,500', date: 'Jan 28, 2025' },
  ]
  return (
    <div className="space-y-5">
      <SectionCard title="Salary details" action={<EditBtn />}>
        <div className="grid grid-cols-3 gap-x-8 gap-y-5">
          <InfoField label="Monthly salary"     value={emp.monthlySalary} />
          <InfoField label="Pay type"           value={emp.payType} />
          <InfoField label="Pay schedule"       value={emp.paySchedule} />
        </div>
      </SectionCard>
      <SectionCard title="Payslip history">
        <table className="w-full">
          <thead>
            <tr className="border-b border-gray-100">
              <th className="pb-3 text-left text-xs font-medium text-gray-400 uppercase tracking-wide">Period</th>
              <th className="pb-3 text-left text-xs font-medium text-gray-400 uppercase tracking-wide">Gross pay</th>
              <th className="pb-3 text-left text-xs font-medium text-gray-400 uppercase tracking-wide">Net pay</th>
              <th className="pb-3 text-left text-xs font-medium text-gray-400 uppercase tracking-wide">Date paid</th>
              <th className="pb-3 text-left text-xs font-medium text-gray-400 uppercase tracking-wide">Actions</th>
            </tr>
          </thead>
          <tbody>
            {payslips.map((p, i) => (
              <tr key={i} className="border-b border-gray-100 last:border-0">
                <td className="py-3 text-sm text-gray-800 font-medium">{p.month}</td>
                <td className="py-3 text-sm text-gray-600">{p.gross}</td>
                <td className="py-3 text-sm text-gray-600">{p.net}</td>
                <td className="py-3 text-sm text-gray-600">{p.date}</td>
                <td className="py-3">
                  <button className="flex items-center gap-1.5 text-xs text-gray-600 border border-gray-200 rounded-lg px-3 py-1.5 hover:bg-gray-50">
                    <Download size={12} />
                    Download
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </SectionCard>
    </div>
  )
}

function CompensationTab({ emp }: { emp: typeof employeeData['1'] }) {
  const [subTab, setSubTab] = useState<'schedules' | 'bank'>('bank')
  return (
    <div className="space-y-5">
      <SectionCard
        title="Compensation details"
        action={<EditBtn />}
      >
        {/* Sub-tabs */}
        <div className="flex gap-2 mb-5">
          <button
            onClick={() => setSubTab('schedules')}
            className={`px-4 py-1.5 rounded-full text-sm font-medium border transition-colors ${
              subTab === 'schedules'
                ? 'bg-gray-900 text-white border-gray-900'
                : 'text-gray-600 border-gray-200 hover:bg-gray-50'
            }`}
          >
            Pay schedules
          </button>
          <button
            onClick={() => setSubTab('bank')}
            className={`px-4 py-1.5 rounded-full text-sm font-medium border transition-colors ${
              subTab === 'bank'
                ? 'bg-gray-900 text-white border-gray-900'
                : 'text-gray-600 border-gray-200 hover:bg-gray-50'
            }`}
          >
            Bank details
          </button>
        </div>

        {subTab === 'bank' && (
          <div className="bg-gray-50 rounded-xl p-5">
            <p className="text-sm font-medium text-gray-700 mb-4">Payment information</p>
            <div className="grid grid-cols-2 gap-x-8 gap-y-4">
              <InfoField label="Bank name"       value={emp.bankName} />
              <InfoField label="Account number"  value={emp.accountNumber} />
              <InfoField label="Sort code"       value={emp.sortCode} />
              <InfoField label="Payment method"  value="BACS" />
            </div>
          </div>
        )}

        {subTab === 'schedules' && (
          <div className="bg-gray-50 rounded-xl p-5">
            <p className="text-sm font-medium text-gray-700 mb-4">Pay schedule</p>
            <div className="grid grid-cols-2 gap-x-8 gap-y-4">
              <InfoField label="Schedule"        value={emp.paySchedule} />
              <InfoField label="Frequency"       value="Monthly" />
              <InfoField label="Next pay date"   value="28th June 2025" />
              <InfoField label="Base salary"     value={emp.monthlySalary} />
            </div>
          </div>
        )}
      </SectionCard>
    </div>
  )
}

function BenefitsTab() {
  const plans = [
    { name: 'Health plan',      provider: 'Aviva',    coverage: 'Employee + Family', renewal: 'Jan 2026',  status: 'Active' },
    { name: 'Pension plan',     provider: 'Nest',     coverage: 'Employee',          renewal: 'Apr 2026',  status: 'Active' },
    { name: 'Paid time off',    provider: 'Internal', coverage: '25 days/year',      renewal: 'Jan 2026',  status: 'Active' },
  ]
  return (
    <div className="space-y-5">
      <SectionCard title="Enrolled benefit plans">
        <div className="space-y-3">
          {plans.map((plan, i) => (
            <div key={i} className="flex items-center justify-between p-4 bg-gray-50 rounded-xl">
              <div>
                <p className="text-sm font-medium text-gray-800">{plan.name}</p>
                <p className="text-xs text-gray-400 mt-0.5">{plan.provider} · {plan.coverage}</p>
              </div>
              <div className="flex items-center gap-4">
                <div className="text-right">
                  <p className="text-xs text-gray-400">Renewal</p>
                  <p className="text-sm font-medium text-gray-700">{plan.renewal}</p>
                </div>
                <span className="text-xs bg-green-50 text-green-600 border border-green-200 rounded-full px-2.5 py-0.5">
                  {plan.status}
                </span>
                <button className="text-xs text-gray-600 border border-gray-200 rounded-lg px-3 py-1.5 hover:bg-gray-100">
                  View details
                </button>
              </div>
            </div>
          ))}
        </div>
      </SectionCard>
    </div>
  )
}

function AttendanceTab() {
  const records = [
    { date: 'Mon, Jun 9 2025',  clockIn: '09:02 AM', clockOut: '06:01 PM', total: '8h 59m', status: 'Present' },
    { date: 'Tue, Jun 10 2025', clockIn: '08:55 AM', clockOut: '05:58 PM', total: '9h 03m', status: 'Present' },
    { date: 'Wed, Jun 11 2025', clockIn: '—',         clockOut: '—',        total: '—',      status: 'Absent'  },
    { date: 'Thu, Jun 12 2025', clockIn: '09:15 AM', clockOut: '06:00 PM', total: '8h 45m', status: 'Late'    },
    { date: 'Fri, Jun 13 2025', clockIn: '09:00 AM', clockOut: '05:30 PM', total: '8h 30m', status: 'Present' },
  ]
  const statusStyle: Record<string, string> = {
    Present: 'bg-green-50 text-green-600 border-green-200',
    Absent:  'bg-red-50 text-red-600 border-red-200',
    Late:    'bg-amber-50 text-amber-600 border-amber-200',
  }
  return (
    <div className="space-y-5">
      <div className="grid grid-cols-3 gap-4">
        {[
          { label: 'Present days',  value: '18', icon: CheckCircle2, color: 'text-green-500', bg: 'bg-green-50' },
          { label: 'Absent days',   value: '2',  icon: XCircle,      color: 'text-red-500',   bg: 'bg-red-50'   },
          { label: 'Late arrivals', value: '3',  icon: AlertCircle,  color: 'text-amber-500', bg: 'bg-amber-50' },
        ].map((s, i) => (
          <div key={i} className="bg-white rounded-xl border border-gray-100 p-5 flex items-center gap-4">
            <div className={`w-10 h-10 rounded-full ${s.bg} flex items-center justify-center`}>
              <s.icon size={18} className={s.color} />
            </div>
            <div>
              <p className="text-xs text-gray-400">{s.label}</p>
              <p className="text-xl font-bold text-gray-900">{s.value}</p>
            </div>
          </div>
        ))}
      </div>
      <SectionCard title="Attendance history">
        <table className="w-full">
          <thead>
            <tr className="border-b border-gray-100">
              {['Date', 'Clock in', 'Clock out', 'Total hours', 'Status'].map(h => (
                <th key={h} className="pb-3 text-left text-xs font-medium text-gray-400 uppercase tracking-wide">{h}</th>
              ))}
            </tr>
          </thead>
          <tbody>
            {records.map((r, i) => (
              <tr key={i} className="border-b border-gray-100 last:border-0">
                <td className="py-3 text-sm text-gray-800">{r.date}</td>
                <td className="py-3 text-sm text-gray-600">{r.clockIn}</td>
                <td className="py-3 text-sm text-gray-600">{r.clockOut}</td>
                <td className="py-3 text-sm text-gray-600">{r.total}</td>
                <td className="py-3">
                  <span className={`text-xs border rounded-full px-2.5 py-0.5 ${statusStyle[r.status]}`}>
                    {r.status}
                  </span>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </SectionCard>
    </div>
  )
}

function LeaveTab() {
  const requests = [
    { type: 'Annual leave',   from: 'Jun 23, 2025', to: 'Jun 27, 2025', days: 5, status: 'Approved' },
    { type: 'Sick leave',     from: 'May 12, 2025', to: 'May 13, 2025', days: 2, status: 'Approved' },
    { type: 'Paternal leave', from: 'Jul 1, 2025',  to: 'Jul 31, 2025', days: 23, status: 'Pending' },
  ]
  const statusStyle: Record<string, string> = {
    Approved: 'bg-green-50 text-green-600 border-green-200',
    Pending:  'bg-amber-50 text-amber-600 border-amber-200',
    Rejected: 'bg-red-50 text-red-600 border-red-200',
  }
  return (
    <div className="space-y-5">
      <div className="grid grid-cols-3 gap-4">
        {[
          { label: 'Annual leave balance',  value: '20 days' },
          { label: 'Days taken',            value: '7 days'  },
          { label: 'Days remaining',        value: '13 days' },
        ].map((s, i) => (
          <div key={i} className="bg-white rounded-xl border border-gray-100 p-5">
            <p className="text-xs text-gray-400 mb-1">{s.label}</p>
            <p className="text-xl font-bold text-gray-900">{s.value}</p>
          </div>
        ))}
      </div>
      <SectionCard title="Leave requests">
        <table className="w-full">
          <thead>
            <tr className="border-b border-gray-100">
              {['Type', 'From', 'To', 'Days', 'Status', 'Actions'].map(h => (
                <th key={h} className="pb-3 text-left text-xs font-medium text-gray-400 uppercase tracking-wide">{h}</th>
              ))}
            </tr>
          </thead>
          <tbody>
            {requests.map((r, i) => (
              <tr key={i} className="border-b border-gray-100 last:border-0">
                <td className="py-3 text-sm font-medium text-gray-800">{r.type}</td>
                <td className="py-3 text-sm text-gray-600">{r.from}</td>
                <td className="py-3 text-sm text-gray-600">{r.to}</td>
                <td className="py-3 text-sm text-gray-600">{r.days}</td>
                <td className="py-3">
                  <span className={`text-xs border rounded-full px-2.5 py-0.5 ${statusStyle[r.status]}`}>
                    {r.status}
                  </span>
                </td>
                <td className="py-3">
                  <button className="text-xs text-gray-600 border border-gray-200 rounded-lg px-3 py-1.5 hover:bg-gray-50">
                    View
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </SectionCard>
    </div>
  )
}

function DocumentTab() {
  const docs = [
    { name: 'Employment contract.pdf', type: 'Contract',     size: '245 KB',  date: 'Apr 24, 2021', status: 'Signed'   },
    { name: 'Offer letter.pdf',        type: 'Offer letter', size: '120 KB',  date: 'Apr 10, 2021', status: 'Signed'   },
    { name: 'I-9 form.pdf',            type: 'Compliance',   size: '98 KB',   date: 'Apr 24, 2021', status: 'Missing'  },
    { name: 'W-2 2024.pdf',            type: 'Tax',          size: '310 KB',  date: 'Jan 31, 2025', status: 'Uploaded' },
  ]
  const statusStyle: Record<string, string> = {
    Signed:   'bg-green-50 text-green-600 border-green-200',
    Missing:  'bg-red-50 text-red-600 border-red-200',
    Uploaded: 'bg-blue-50 text-blue-600 border-blue-200',
  }
  return (
    <div className="space-y-5">
      <SectionCard title="Documents">
        <table className="w-full">
          <thead>
            <tr className="border-b border-gray-100">
              {['Document name', 'Type', 'Size', 'Date uploaded', 'Status', 'Actions'].map(h => (
                <th key={h} className="pb-3 text-left text-xs font-medium text-gray-400 uppercase tracking-wide">{h}</th>
              ))}
            </tr>
          </thead>
          <tbody>
            {docs.map((d, i) => (
              <tr key={i} className="border-b border-gray-100 last:border-0">
                <td className="py-3">
                  <div className="flex items-center gap-2">
                    <div className="w-8 h-8 bg-red-50 rounded-lg flex items-center justify-center">
                      <FileText size={14} className="text-red-500" />
                    </div>
                    <span className="text-sm font-medium text-gray-800">{d.name}</span>
                  </div>
                </td>
                <td className="py-3 text-sm text-gray-600">{d.type}</td>
                <td className="py-3 text-sm text-gray-600">{d.size}</td>
                <td className="py-3 text-sm text-gray-600">{d.date}</td>
                <td className="py-3">
                  <span className={`text-xs border rounded-full px-2.5 py-0.5 ${statusStyle[d.status]}`}>
                    {d.status}
                  </span>
                </td>
                <td className="py-3">
                  <div className="flex items-center gap-2">
                    <button className="text-xs text-gray-600 border border-gray-200 rounded-lg px-2.5 py-1.5 hover:bg-gray-50 flex items-center gap-1">
                      <Download size={11} /> Download
                    </button>
                    <button className="text-gray-400 hover:text-gray-600 p-1">
                      <MoreHorizontal size={14} />
                    </button>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </SectionCard>
    </div>
  )
}

function LogsTab() {
  const logs = [
    { action: 'Employee profile updated',    actor: 'Awo Bangalee',   time: 'Today at 2:34 PM',     icon: Pencil,    color: 'bg-blue-50 text-blue-500'   },
    { action: 'Leave request approved',      actor: 'Tom Richards',   time: 'Jun 12 at 10:15 AM',   icon: CheckCircle2, color: 'bg-green-50 text-green-500' },
    { action: 'Payslip generated',           actor: 'System',         time: 'May 28 at 12:00 AM',   icon: DollarSign, color: 'bg-purple-50 text-purple-500' },
    { action: 'Document uploaded',           actor: 'Smith Meyer',    time: 'Apr 24 at 9:00 AM',    icon: FileText,  color: 'bg-amber-50 text-amber-500'  },
    { action: 'Employee onboarded',          actor: 'HR Admin',       time: 'Apr 24 2021 at 8:00 AM', icon: User,    color: 'bg-teal-50 text-teal-500'    },
  ]
  return (
    <div className="space-y-5">
      <SectionCard title="Activity log">
        <div className="space-y-4">
          {logs.map((log, i) => (
            <div key={i} className="flex items-start gap-3">
              <div className={`w-8 h-8 rounded-full flex items-center justify-center flex-shrink-0 ${log.color}`}>
                <log.icon size={14} />
              </div>
              <div className="flex-1">
                <p className="text-sm font-medium text-gray-800">{log.action}</p>
                <p className="text-xs text-gray-400 mt-0.5">by {log.actor} · {log.time}</p>
              </div>
            </div>
          ))}
        </div>
      </SectionCard>
    </div>
  )
}

// ── Main component ────────────────────────────────────────────────────────

export default function EmployeeDetail() {
  const { id } = useParams<{ id: string }>()
  const navigate = useNavigate()
  const [activeTab, setActiveTab] = useState<DetailTab>('overview')

  const emp = employeeData[id ?? '1'] ?? employeeData['1']

  const statusStyle = {
    Onboarded: 'bg-green-50 text-green-700 border border-green-200',
    Pending:   'bg-amber-50 text-amber-700 border border-amber-200',
    Invited:   'bg-blue-50 text-blue-700 border border-blue-200',
  }[emp.status]

  function renderTab() {
    switch (activeTab) {
      case 'overview':     return <OverviewTab emp={emp} />
      case 'personal':     return <PersonalTab emp={emp} />
      case 'employment':   return <EmploymentTab emp={emp} />
      case 'payroll':      return <PayrollTab emp={emp} />
      case 'compensation': return <CompensationTab emp={emp} />
      case 'benefits':     return <BenefitsTab />
      case 'attendance':   return <AttendanceTab />
      case 'leave':        return <LeaveTab />
      case 'document':     return <DocumentTab />
      case 'logs':         return <LogsTab />
    }
  }

  return (
    <div className="max-w-full px-8 py-6">

      {/* Breadcrumb */}
      <button
        onClick={() => navigate('/employer/employees')}
        className="flex items-center gap-1 text-sm text-[#22c55e] hover:text-green-600 transition-colors mb-2"
      >
        <ChevronLeft size={16} />
        Back to employees
      </button>
      <h1 className="text-2xl font-bold text-gray-900 mb-6">
        Employees / {emp.name}
      </h1>

      {/* Profile card */}
      <div className="bg-white rounded-xl border border-gray-100 p-6 mb-0">
        {/* Top row: avatar + name + status */}
        <div className="flex items-start justify-between mb-5">
          <div className="flex items-center gap-4">
            <div className={`w-14 h-14 rounded-full flex items-center justify-center text-lg font-bold flex-shrink-0 ${emp.avatarColor}`}>
              {emp.initial}
            </div>
            <div>
              <p className="text-lg font-bold text-gray-900">{emp.name}</p>
              <p className="text-sm text-gray-500">{emp.role}</p>
            </div>
          </div>
          <div className="flex items-center gap-3">
            <span className={`text-sm font-medium px-3 py-1 rounded-lg ${statusStyle}`}>
              {emp.status}
            </span>
            <button className="flex items-center gap-1.5 text-sm text-gray-600 border border-gray-200 rounded-lg px-3 py-1.5 hover:bg-gray-50 transition-colors">
              <Pencil size={13} />
              Change role
            </button>
          </div>
        </div>

        {/* Info grid — 2 rows × 5 cols */}
        <div className="border-t border-gray-100 pt-5 grid grid-cols-5 gap-x-6 gap-y-4">
          <InfoField label="Department"         value={emp.department} />
          <InfoField label="Work location"      value={emp.workLocation} />
          <InfoField label="Phone number"       value={emp.phone} />
          <InfoField label="Employment Status"  value={emp.employmentStatus} />
          <InfoField label="Monthly Salary"     value={emp.monthlySalary} />
          <InfoField label="Hire date"          value={emp.hireDate} />
          <InfoField label="Time in position"   value={emp.timeInPosition} />
          <InfoField label="Pay type"           value={emp.payType} />
          <InfoField label="Level"              value={emp.level} />
          <InfoField label="Manager Name"       value={emp.managerName} />
        </div>
      </div>

      {/* Tabs */}
      <div className="flex border-b border-gray-200 bg-white -mt-px">
        {tabs.map((tab) => (
          <button
            key={tab.key}
            onClick={() => setActiveTab(tab.key)}
            className={`px-4 py-3 text-sm transition-colors whitespace-nowrap ${
              activeTab === tab.key
                ? 'font-semibold text-gray-900 border-b-2 border-gray-900 -mb-px'
                : 'text-gray-400 hover:text-gray-600 border-b-2 border-transparent'
            }`}
          >
            {tab.label}
          </button>
        ))}
      </div>

      {/* Tab content */}
      <div className="mt-5">
        {renderTab()}
      </div>

    </div>
  )
}
