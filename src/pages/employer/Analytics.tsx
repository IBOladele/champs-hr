import { useState } from 'react'
import { TrendingUp, Users, UserCheck, UserPlus, Activity, BarChart2 } from 'lucide-react'

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
        <TrendingUp size={12} />
        <span>{trend}</span>
      </div>
    </div>
  )
}

// ── Empty chart state ─────────────────────────────────────────────────

function EmptyChartState({ title, sub }: { title: string; sub: string }) {
  return (
    <div className="bg-white rounded-lg border border-gray-100 p-5">
      <h3 className="text-sm font-semibold text-gray-900 mb-1">{title}</h3>
      <p className="text-xs text-gray-400 mb-4">{sub}</p>
      <div className="flex flex-col items-center justify-center py-10 text-center">
        <BarChart2 size={40} className="text-gray-300 mb-3" />
        <p className="text-sm font-medium text-gray-500">No data yet</p>
        <p className="text-xs text-gray-400 mt-1">Data will appear once employees are added</p>
      </div>
    </div>
  )
}

// ── Main Analytics page ──────────────────────────────────────────────

export default function Analytics() {
  const [activeTab, setActiveTab] = useState<AnalyticsTab>('all')

  return (
    <div className="bg-gray-50 min-h-full">
      <div className="space-y-6">

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
                value="0"
                trend="No data yet"
                positive
                icon={<Users size={18} />}
              />
              <StatCard
                label="Active employees"
                value="0"
                trend="No data yet"
                positive
                icon={<UserCheck size={18} />}
              />
              <StatCard
                label="New hires"
                value="0"
                trend="No data yet"
                positive
                icon={<UserPlus size={18} />}
              />
              <StatCard
                label="Attrition rate"
                value="0%"
                trend="No data yet"
                positive={false}
                icon={<Activity size={18} />}
              />
            </div>

            {/* Charts row 1 */}
            <div className="grid grid-cols-2 gap-6">
              <EmptyChartState
                title="Employee Demographics"
                sub="Headcount by department"
              />
              <EmptyChartState
                title="Gender breakdown"
                sub="All employees"
              />
            </div>

            {/* Charts row 2 */}
            <div className="grid grid-cols-2 gap-6">
              <EmptyChartState
                title="Employee type breakdown"
                sub="By employment classification"
              />
              <div className="bg-white rounded-lg border border-gray-100 p-5">
                <h3 className="text-sm font-semibold text-gray-900 mb-1">Staffing by department</h3>
                <p className="text-xs text-gray-400 mb-4">Total of 0 employees</p>
                <div className="flex flex-col items-center justify-center py-10 text-center">
                  <Users size={40} className="text-gray-300 mb-3" />
                  <p className="text-sm font-medium text-gray-500">No staffing data yet</p>
                </div>
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
