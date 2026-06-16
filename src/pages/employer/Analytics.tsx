import { useState } from 'react'
import { TrendingUp, TrendingDown, Users, UserCheck, UserPlus, Activity } from 'lucide-react'

type AnalyticsTab = 'all' | 'payroll' | 'employee' | 'benefit' | 'attendance'

const tabs: { key: AnalyticsTab; label: string }[] = [
  { key: 'all',        label: 'All analytics'                  },
  { key: 'payroll',    label: 'Payroll analytics'              },
  { key: 'employee',   label: 'Employee analytics'             },
  { key: 'benefit',    label: 'Benefit analytics'              },
  { key: 'attendance', label: 'Attendance and leave analytics' },
]

// ── Stat card ────────────────────────────────────────────────────────

interface StatCardProps {
  label: string
  value: string
  trend: string
  positive: boolean
  icon: React.ReactNode
}

function StatCard({ label, value, trend, positive, icon }: StatCardProps) {
  return (
    <div className="bg-white rounded-lg border border-gray-100 p-4 relative">
      <div className="absolute top-4 right-4 w-9 h-9 rounded-lg bg-gray-50 flex items-center justify-center text-gray-400">
        {icon}
      </div>
      <p className="text-3xl font-bold text-gray-900 mt-1">{value}</p>
      <p className="text-sm text-gray-500 mt-1">{label}</p>
      <div className={`flex items-center gap-1 mt-2 text-xs font-medium ${positive ? 'text-emerald-600' : 'text-red-500'}`}>
        {positive ? <TrendingUp size={12} /> : <TrendingDown size={12} />}
        <span>{trend}</span>
      </div>
    </div>
  )
}

// ── Horizontal bar chart ─────────────────────────────────────────────

const deptData = [
  { dept: 'Engineering', count: 78  },
  { dept: 'Sales',       count: 45  },
  { dept: 'Marketing',   count: 32  },
  { dept: 'Operations',  count: 28  },
  { dept: 'Other',       count: 30  },
  { dept: 'Finance',     count: 20  },
  { dept: 'HR',          count: 14  },
]

function DeptBarChart() {
  const max = Math.max(...deptData.map(d => d.count))
  return (
    <div className="space-y-3">
      {deptData.map((d, i) => (
        <div key={d.dept} className="flex items-center gap-3">
          <span className="text-xs text-gray-500 w-24 shrink-0 text-right">{d.dept}</span>
          <div className="flex-1 h-6 bg-gray-100 rounded-sm overflow-hidden">
            <div
              className={`h-full rounded-sm flex items-center justify-end pr-2 transition-all ${i === 0 ? 'bg-emerald-500' : i === 1 ? 'bg-emerald-400' : i === 2 ? 'bg-emerald-300' : 'bg-emerald-200'}`}
              style={{ width: `${(d.count / max) * 100}%` }}
            >
            </div>
          </div>
          <span className="text-xs font-semibold text-gray-700 w-6 text-right">{d.count}</span>
        </div>
      ))}
    </div>
  )
}

// ── Gender donut ─────────────────────────────────────────────────────

function GenderDonut() {
  // Male 58%, Female 38%, Other 4%
  const gradient = `conic-gradient(
    #3b82f6 0% 58%,
    #f472b6 58% 96%,
    #a3a3a3 96% 100%
  )`

  const items = [
    { label: 'Male',   pct: 58, color: 'bg-blue-500'  },
    { label: 'Female', pct: 38, color: 'bg-pink-400'   },
    { label: 'Other',  pct: 4,  color: 'bg-gray-400'   },
  ]

  return (
    <div className="flex flex-col items-center gap-5">
      <div className="relative w-36 h-36">
        <div className="w-full h-full rounded-full" style={{ background: gradient }} />
        <div className="absolute inset-[22%] rounded-full bg-white flex flex-col items-center justify-center">
          <span className="text-sm font-bold text-gray-900">247</span>
          <span className="text-[9px] text-gray-400 text-center leading-tight">Total</span>
        </div>
      </div>
      <div className="w-full space-y-2">
        {items.map(item => (
          <div key={item.label} className="flex items-center gap-2">
            <span className={`w-3 h-3 rounded-full shrink-0 ${item.color}`} />
            <span className="text-sm text-gray-600 flex-1">{item.label}</span>
            <span className="text-sm font-semibold text-gray-800">{item.pct}%</span>
          </div>
        ))}
      </div>
    </div>
  )
}

// ── Employee type donut ──────────────────────────────────────────────

function EmployeeTypeDonut() {
  const total = 185 + 42 + 20
  const ftPct  = Math.round((185 / total) * 100)
  const ptPct  = Math.round((42  / total) * 100)
  // contract fills rest

  const gradient = `conic-gradient(
    #22c55e 0% ${ftPct}%,
    #f59e0b ${ftPct}% ${ftPct + ptPct}%,
    #3b82f6 ${ftPct + ptPct}% 100%
  )`

  const items = [
    { label: 'Full-time', count: 185, color: 'bg-emerald-500' },
    { label: 'Part-time', count: 42,  color: 'bg-amber-400'   },
    { label: 'Contract',  count: 20,  color: 'bg-blue-500'    },
  ]

  return (
    <div className="flex items-center gap-6">
      <div className="relative w-32 h-32 shrink-0">
        <div className="w-full h-full rounded-full" style={{ background: gradient }} />
        <div className="absolute inset-[22%] rounded-full bg-white flex flex-col items-center justify-center">
          <span className="text-sm font-bold text-gray-900">{total}</span>
          <span className="text-[9px] text-gray-400 text-center leading-tight">Total</span>
        </div>
      </div>
      <div className="flex-1 space-y-3">
        {items.map(item => (
          <div key={item.label} className="flex items-center gap-2">
            <span className={`w-3 h-3 rounded-full shrink-0 ${item.color}`} />
            <span className="text-sm text-gray-600 flex-1">{item.label}</span>
            <span className="text-sm font-bold text-gray-900">{item.count}</span>
          </div>
        ))}
      </div>
    </div>
  )
}

// ── Staffing table ───────────────────────────────────────────────────

const staffingData = [
  { dept: 'Engineering', employees: 78  },
  { dept: 'Sales',       employees: 45  },
  { dept: 'Marketing',   employees: 32  },
  { dept: 'Operations',  employees: 28  },
  { dept: 'Finance',     employees: 20  },
  { dept: 'Other',       employees: 30  },
  { dept: 'HR',          employees: 14  },
]
const staffingTotal = staffingData.reduce((s, d) => s + d.employees, 0)

function StaffingTable() {
  return (
    <table className="w-full text-sm">
      <thead>
        <tr className="border-b border-gray-100">
          <th className="text-left text-xs font-semibold text-gray-500 uppercase tracking-wide pb-2">Department</th>
          <th className="text-right text-xs font-semibold text-gray-500 uppercase tracking-wide pb-2">Employees</th>
          <th className="text-right text-xs font-semibold text-gray-500 uppercase tracking-wide pb-2">% of Total</th>
        </tr>
      </thead>
      <tbody>
        {staffingData.map(row => (
          <tr key={row.dept} className="border-b border-gray-50 last:border-0">
            <td className="py-2.5 text-gray-700">{row.dept}</td>
            <td className="py-2.5 text-right font-medium text-gray-900">{row.employees}</td>
            <td className="py-2.5 text-right text-gray-500">
              {((row.employees / staffingTotal) * 100).toFixed(1)}%
            </td>
          </tr>
        ))}
      </tbody>
    </table>
  )
}

// ── Main Analytics page ──────────────────────────────────────────────

export default function Analytics() {
  const [activeTab, setActiveTab] = useState<AnalyticsTab>('all')

  return (
    <div className="bg-gray-50 min-h-full">
      <div className="max-w-7xl mx-auto px-6 py-6 space-y-6">

        {/* Page title */}
        <h1 className="text-2xl font-bold text-gray-900">Analytics</h1>

        {/* Sub-nav tabs */}
        <div className="flex gap-0 border-b border-gray-200">
          {tabs.map(tab => (
            <button
              key={tab.key}
              onClick={() => setActiveTab(tab.key)}
              className={`px-5 py-2.5 text-sm font-medium -mb-px transition-colors ${
                activeTab === tab.key
                  ? 'border-b-2 border-gray-900 text-gray-900'
                  : 'border-b-2 border-transparent text-gray-500 hover:text-gray-700'
              }`}
            >
              {tab.label}
            </button>
          ))}
        </div>

        {(activeTab === 'all' || activeTab === 'employee') && (
          <div className="space-y-6">

            {/* 4 stat cards */}
            <div className="grid grid-cols-4 gap-4">
              <StatCard
                label="Total employees"
                value="247"
                trend="+12 this month"
                positive
                icon={<Users size={18} />}
              />
              <StatCard
                label="Active employees"
                value="231"
                trend="+8 this month"
                positive
                icon={<UserCheck size={18} />}
              />
              <StatCard
                label="New hires"
                value="16"
                trend="+4 from last month"
                positive
                icon={<UserPlus size={18} />}
              />
              <StatCard
                label="Attrition rate"
                value="2.4%"
                trend="-0.3% from last month"
                positive={false}
                icon={<Activity size={18} />}
              />
            </div>

            {/* Charts row 1 */}
            <div className="grid grid-cols-2 gap-6">

              {/* Employee demographics horizontal bar chart */}
              <div className="bg-white rounded-lg border border-gray-100 p-5">
                <h3 className="text-sm font-semibold text-gray-900 mb-1">Employee Demographics</h3>
                <p className="text-xs text-gray-400 mb-4">Headcount by department</p>
                <DeptBarChart />
              </div>

              {/* Gender breakdown donut */}
              <div className="bg-white rounded-lg border border-gray-100 p-5">
                <h3 className="text-sm font-semibold text-gray-900 mb-1">Gender breakdown</h3>
                <p className="text-xs text-gray-400 mb-4">All employees</p>
                <GenderDonut />
              </div>

            </div>

            {/* Charts row 2 */}
            <div className="grid grid-cols-2 gap-6">

              {/* Employee type breakdown */}
              <div className="bg-white rounded-lg border border-gray-100 p-5">
                <h3 className="text-sm font-semibold text-gray-900 mb-1">Employee type breakdown</h3>
                <p className="text-xs text-gray-400 mb-4">By employment classification</p>
                <EmployeeTypeDonut />
              </div>

              {/* Staffing by department table */}
              <div className="bg-white rounded-lg border border-gray-100 p-5">
                <h3 className="text-sm font-semibold text-gray-900 mb-1">Staffing by department</h3>
                <p className="text-xs text-gray-400 mb-4">Total of {staffingTotal} employees</p>
                <StaffingTable />
              </div>

            </div>

          </div>
        )}

        {activeTab === 'payroll' && (
          <div className="flex items-center justify-center h-64 text-gray-400 text-sm">
            Payroll analytics coming soon
          </div>
        )}

        {activeTab === 'benefit' && (
          <div className="flex items-center justify-center h-64 text-gray-400 text-sm">
            Benefit analytics coming soon
          </div>
        )}

        {activeTab === 'attendance' && (
          <div className="flex items-center justify-center h-64 text-gray-400 text-sm">
            Attendance and leave analytics coming soon
          </div>
        )}

      </div>
    </div>
  )
}
