import { useState } from 'react'
import { useNavigate, useParams } from 'react-router-dom'
import {
  ChevronLeft, Pencil, FileText,
  User,
  CheckCircle2, XCircle, AlertCircle
} from 'lucide-react'

type DetailTab =
  | 'personal' | 'employment' | 'payroll'
  | 'compensation' | 'attendance'
  | 'document' | 'logs'

const tabs: { key: DetailTab; label: string }[] = [
  { key: 'personal',      label: 'Personal info'       },
  { key: 'employment',    label: 'Employment'          },
  { key: 'payroll',       label: 'Payroll'             },
  { key: 'compensation',  label: 'Compensation details'},
  { key: 'attendance',    label: 'Attendance'          },
  { key: 'document',      label: 'Documents'           },
  { key: 'logs',          label: 'Logs'                },
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

function EmptyTabState({ icon: Icon, message, sub }: { icon: React.ElementType; message: string; sub?: string }) {
  return (
    <div className="flex flex-col items-center justify-center py-16 text-center">
      <Icon size={40} className="text-gray-300 mb-3" />
      <p className="text-sm font-medium text-gray-500">{message}</p>
      {sub && <p className="text-xs text-gray-400 mt-1">{sub}</p>}
    </div>
  )
}

// ── Tab content panels ────────────────────────────────────────────────────

function PayrollTab() {
  return (
    <div className="space-y-5">
      <SectionCard title="Salary details" action={<EditBtn />}>
        <div className="grid grid-cols-3 gap-x-8 gap-y-5">
          <InfoField label="Monthly salary"     value="—" />
          <InfoField label="Pay type"           value="—" />
          <InfoField label="Pay schedule"       value="—" />
        </div>
      </SectionCard>
      <SectionCard title="Payslip history">
        <EmptyTabState icon={FileText} message="No payslips" sub="Payslips will appear here after payroll is run" />
      </SectionCard>
    </div>
  )
}

function AttendanceTab() {
  return (
    <div className="space-y-5">
      <div className="grid grid-cols-3 gap-4">
        {[
          { label: 'Present days',  value: '0', icon: CheckCircle2, color: 'text-green-500', bg: 'bg-green-50' },
          { label: 'Absent days',   value: '0', icon: XCircle,      color: 'text-red-500',   bg: 'bg-red-50'   },
          { label: 'Late arrivals', value: '0', icon: AlertCircle,  color: 'text-amber-500', bg: 'bg-amber-50' },
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
        <EmptyTabState icon={CheckCircle2} message="No attendance records" sub="Records will appear as the employee clocks in" />
      </SectionCard>
    </div>
  )
}

function DocumentTab() {
  return (
    <div className="space-y-5">
      <SectionCard title="Documents">
        <EmptyTabState icon={FileText} message="No documents" sub="Upload documents to share with this employee" />
      </SectionCard>
    </div>
  )
}

function LogsTab() {
  return (
    <div className="space-y-5">
      <SectionCard title="Activity log">
        <EmptyTabState icon={User} message="No activity logs" sub="Activity will be recorded as changes are made" />
      </SectionCard>
    </div>
  )
}

// ── Main component ────────────────────────────────────────────────────────

export default function EmployeeDetail() {
  const { id } = useParams<{ id: string }>()
  const navigate = useNavigate()
  const [activeTab, setActiveTab] = useState<DetailTab>('personal')

  // No employee data — show not found state
  const emp = null

  if (!emp) {
    return (
      <div className="">
        <button
          onClick={() => navigate('/employer/employees')}
          className="flex items-center gap-1 text-sm text-[#22c55e] hover:text-green-600 transition-colors mb-6"
        >
          <ChevronLeft size={16} />
          Back to employees
        </button>
        <div className="flex flex-col items-center justify-center py-24 text-center">
          <User size={48} className="text-gray-300 mb-4" />
          <h2 className="text-lg font-semibold text-gray-700">Employee not found</h2>
          <p className="text-sm text-gray-400 mt-1">No data available for employee #{id}</p>
          <button
            onClick={() => navigate('/employer/employees')}
            className="mt-6 px-4 py-2 text-sm font-medium text-white rounded-lg transition-colors"
            style={{ backgroundColor: '#22c55e' }}
          >
            Back to employees
          </button>
        </div>
      </div>
    )
  }

  return (
    <div className="">

      {/* Breadcrumb */}
      <button
        onClick={() => navigate('/employer/employees')}
        className="flex items-center gap-1 text-sm text-[#22c55e] hover:text-green-600 transition-colors mb-2"
      >
        <ChevronLeft size={16} />
        Back to employees
      </button>

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
        {activeTab === 'payroll' && <PayrollTab />}
        {activeTab === 'attendance' && <AttendanceTab />}
        {activeTab === 'document' && <DocumentTab />}
        {activeTab === 'logs' && <LogsTab />}
        {(activeTab === 'personal' || activeTab === 'employment' || activeTab === 'compensation') && (
          <EmptyTabState icon={User} message="No data available" sub="Employee data will appear once added" />
        )}
      </div>

    </div>
  )
}
