import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { Settings, Search, ChevronDown, Users, UserCheck, Clock, Calendar } from 'lucide-react'

type HrTab = 'Attendance' | 'Leave requests'
type EmpStatus = 'Online' | 'Active' | 'Away' | 'Inactive'

interface EmployeeRow {
  name: string
  initials: string
  color: string
  id: string
  totalWorked: string
  totalClockIn: string
  totalClockOut: string
  status: EmpStatus
}

function StatusPill({ status }: { status: EmpStatus }) {
  const cls =
    status === 'Online'
      ? 'bg-green-100 text-green-700'
      : status === 'Active'
      ? 'bg-blue-100 text-blue-700'
      : status === 'Away'
      ? 'bg-amber-100 text-amber-700'
      : 'bg-gray-100 text-gray-500'
  return (
    <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${cls}`}>
      {status}
    </span>
  )
}

export default function HrOps() {
  const navigate = useNavigate()
  const [activeTab, setActiveTab] = useState<HrTab>('Attendance')
  const [search, setSearch] = useState('')
  const [employees] = useState<EmployeeRow[]>([])

  const filtered = employees.filter(e =>
    e.name.toLowerCase().includes(search.toLowerCase())
  )

  return (
    <div className="px-8 py-6">
      {/* Page heading */}
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-2xl font-bold text-gray-900">HR operations</h1>
        <button className="flex items-center gap-1.5 text-sm text-gray-600 hover:text-gray-800">
          <Settings size={14} />
          HR settings
        </button>
      </div>

      {/* Sub-tabs */}
      <div className="flex items-center border-b border-gray-200 mb-6">
        {(['Attendance', 'Leave requests'] as HrTab[]).map(tab => (
          <button
            key={tab}
            onClick={() => setActiveTab(tab)}
            className={`px-5 py-2.5 text-sm font-medium -mb-px transition-colors ${
              activeTab === tab
                ? 'border-b-2 border-gray-900 text-gray-900'
                : 'border-b-2 border-transparent text-gray-500 hover:text-gray-700'
            }`}
          >
            {tab}
          </button>
        ))}
      </div>

      {activeTab === 'Attendance' && (
        <>
          {/* Sub-heading */}
          <h2 className="text-lg font-semibold text-gray-900 mb-4">Attendance</h2>

          {/* Stat cards */}
          <div className="grid grid-cols-4 gap-4 mb-6">
            {[
              { label: 'Total employees',  value: '0', icon: Users,       iconCls: 'text-green-500',  bg: 'bg-green-50'  },
              { label: 'Active employees', value: '0', icon: UserCheck,   iconCls: 'text-amber-500',  bg: 'bg-amber-50'  },
              { label: 'Late arrivals',    value: '0', icon: Clock,       iconCls: 'text-blue-500',   bg: 'bg-blue-50'   },
              { label: 'Early employees', value: '0',  icon: Calendar,    iconCls: 'text-blue-400',   bg: 'bg-blue-50'   },
            ].map(({ label, value, icon: Icon, iconCls, bg }) => (
              <div key={label} className="bg-white rounded-xl border border-gray-100 shadow-sm p-5 flex items-start justify-between">
                <div>
                  <p className="text-xs text-gray-500 mb-1">{label}</p>
                  <p className="text-2xl font-bold text-gray-900">{value}</p>
                </div>
                <div className={`w-9 h-9 ${bg} rounded-lg flex items-center justify-center flex-shrink-0`}>
                  <Icon size={18} className={iconCls} />
                </div>
              </div>
            ))}
          </div>

          {/* Search + Sort */}
          <div className="flex items-center gap-3 mb-4">
            <div className="relative flex-1 max-w-sm">
              <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
              <input
                type="text"
                placeholder="Search for an employee"
                value={search}
                onChange={e => setSearch(e.target.value)}
                className="w-full pl-9 pr-4 py-2 text-sm border border-gray-200 rounded-lg focus:outline-none focus:border-[#22c55e]"
              />
            </div>
            <button className="flex items-center gap-1.5 text-sm text-gray-600 border border-gray-200 rounded-lg px-3 py-2 hover:bg-gray-50">
              Sort by status <ChevronDown size={13} />
            </button>
          </div>

          {/* Counter */}
          <p className="text-sm text-gray-500 mb-3">{filtered.length} employees</p>

          {/* Table */}
          <div className="bg-white rounded-xl border border-gray-100 shadow-sm overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="bg-gray-50 border-b border-gray-100">
                    {['Employee name', 'Employee ID', 'Total worked', 'Total clock in', 'Total clock out', 'Status', 'Actions'].map(col => (
                      <th key={col} className="text-left px-6 py-3 text-xs font-semibold text-gray-500 uppercase tracking-wide whitespace-nowrap">
                        {col}
                      </th>
                    ))}
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-100">
                  {filtered.map((row, i) => (
                    <tr key={i} className="hover:bg-gray-50 transition-colors">
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="flex items-center gap-2.5">
                          <div className={`w-7 h-7 rounded-full ${row.color} flex items-center justify-center text-white text-xs font-semibold flex-shrink-0`}>
                            {row.initials}
                          </div>
                          <span className="font-medium text-gray-900">{row.name}</span>
                        </div>
                      </td>
                      <td className="px-6 py-4 text-gray-500 whitespace-nowrap">{row.id}</td>
                      <td className="px-6 py-4 text-gray-600 whitespace-nowrap">{row.totalWorked}</td>
                      <td className="px-6 py-4 text-gray-600 whitespace-nowrap">{row.totalClockIn}</td>
                      <td className="px-6 py-4 text-gray-600 whitespace-nowrap">{row.totalClockOut}</td>
                      <td className="px-6 py-4"><StatusPill status={row.status} /></td>
                      <td className="px-6 py-4">
                        <button
                          onClick={() => navigate('/employer/hr-ops/employee/1')}
                          className="text-xs text-gray-500 hover:text-gray-800 whitespace-nowrap"
                        >
                          ↳ View attendance history
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            {filtered.length === 0 && (
              <div className="flex flex-col items-center justify-center py-16 text-center">
                <Users size={40} className="text-gray-300 mb-3" />
                <p className="text-sm font-medium text-gray-500">No employees yet</p>
                <p className="text-xs text-gray-400 mt-1">Attendance records will appear once employees are added</p>
              </div>
            )}
          </div>
        </>
      )}

      {activeTab === 'Leave requests' && (
        <div className="bg-white rounded-xl border border-gray-100 shadow-sm p-8 text-center">
          <p className="text-sm text-gray-400">Leave requests management</p>
        </div>
      )}
    </div>
  )
}
