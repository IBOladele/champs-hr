import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { Settings, Search, ChevronDown, Users, UserCheck, Clock, Calendar, CalendarDays, Check, X } from 'lucide-react'
import {
  attendance as attendanceApi,
  leave as leaveApi,
  type AttendanceRecord,
  type LeaveRequest,
} from '../../lib/api'
import { usePageTitle } from '../../hooks/usePageTitle'

type HrTab = 'Attendance' | 'Leave requests'
type EmpStatus = 'Present' | 'Late' | 'Absent' | 'Remote'

const AVATAR_COLORS = ['bg-violet-500','bg-blue-500','bg-green-500','bg-amber-500','bg-pink-500']

interface AttRow {
  id: string; name: string; initials: string; color: string; empId: string
  date: string; clockIn: string; clockOut: string; status: EmpStatus
}

function StatusPill({ status }: { status: EmpStatus }) {
  const cls =
    status === 'Present' ? 'bg-green-100 text-green-700' :
    status === 'Late'    ? 'bg-amber-100 text-amber-700' :
    status === 'Remote'  ? 'bg-blue-100 text-blue-700'   :
                           'bg-gray-100 text-gray-500'
  return (
    <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${cls}`}>
      {status}
    </span>
  )
}

function LeaveStatusPill({ status }: { status: LeaveRequest['status'] }) {
  const cls =
    status === 'approved' ? 'bg-green-100 text-green-700' :
    status === 'pending'  ? 'bg-amber-100 text-amber-700' :
    status === 'rejected' ? 'bg-red-100 text-red-700'     :
                            'bg-gray-100 text-gray-500'
  return (
    <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${cls}`}>
      {status.charAt(0).toUpperCase() + status.slice(1)}
    </span>
  )
}

function mapAtt(r: AttendanceRecord, i: number): AttRow {
  const name = r.employeeName ?? 'Unknown'
  const raw = r.status.toLowerCase()
  const status: EmpStatus =
    raw === 'present' ? 'Present' :
    raw === 'late'    ? 'Late'    :
    raw === 'remote'  ? 'Remote'  : 'Absent'
  return {
    id: r.id,
    name,
    initials: name.split(' ').map(w => w[0]).join('').toUpperCase().slice(0, 2),
    color: AVATAR_COLORS[i % AVATAR_COLORS.length],
    empId: r.employeeId,
    date: new Date(r.date).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' }),
    clockIn: r.clockIn ? new Date(r.clockIn).toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' }) : '—',
    clockOut: r.clockOut ? new Date(r.clockOut).toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' }) : '—',
    status,
  }
}

export default function HrOps() {
  usePageTitle('HR Operations')
  const navigate = useNavigate()
  const [activeTab, setActiveTab] = useState<HrTab>('Attendance')
  const [search, setSearch] = useState('')
  const [attRows, setAttRows] = useState<AttRow[]>([])
  const [leaveRows, setLeaveRows] = useState<LeaveRequest[]>([])
  const [actioning, setActioning] = useState<string | null>(null)

  useEffect(() => {
    attendanceApi.list().then(data => setAttRows(data.map(mapAtt))).catch(() => {})
    leaveApi.list().then(setLeaveRows).catch(() => {})
  }, [])

  const filteredAtt = attRows.filter(r => r.name.toLowerCase().includes(search.toLowerCase()))
  const filteredLeave = leaveRows.filter(r =>
    (r.employeeName ?? '').toLowerCase().includes(search.toLowerCase()) ||
    r.leaveType.toLowerCase().includes(search.toLowerCase())
  )

  const presentCount = attRows.filter(r => r.status === 'Present').length
  const lateCount    = attRows.filter(r => r.status === 'Late').length

  async function handleApprove(id: string) {
    setActioning(id)
    try {
      const updated = await leaveApi.approve(id)
      setLeaveRows(prev => prev.map(r => r.id === id ? updated : r))
    } finally {
      setActioning(null)
    }
  }

  async function handleReject(id: string) {
    setActioning(id)
    try {
      const updated = await leaveApi.reject(id)
      setLeaveRows(prev => prev.map(r => r.id === id ? updated : r))
    } finally {
      setActioning(null)
    }
  }

  return (
    <div className="">
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-2xl font-bold text-gray-900">HR operations</h1>
        <button className="flex items-center gap-1.5 text-sm text-gray-600 hover:text-gray-800">
          <Settings size={14} />
          HR settings
        </button>
      </div>

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
          <h2 className="text-lg font-semibold text-gray-900 mb-4">Attendance</h2>

          <div className="grid grid-cols-4 gap-4 mb-6">
            {[
              { label: 'Total employees',  value: String(attRows.length),  icon: Users,     iconCls: 'text-green-500', bg: 'bg-green-50' },
              { label: 'Present today',    value: String(presentCount),    icon: UserCheck, iconCls: 'text-amber-500', bg: 'bg-amber-50' },
              { label: 'Late arrivals',    value: String(lateCount),       icon: Clock,     iconCls: 'text-blue-500',  bg: 'bg-blue-50'  },
              { label: 'Absent today',     value: String(attRows.filter(r => r.status === 'Absent').length), icon: Calendar, iconCls: 'text-blue-400', bg: 'bg-blue-50' },
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

          <p className="text-sm text-gray-500 mb-3">{filteredAtt.length} records</p>

          <div className="bg-white rounded-xl border border-gray-100 shadow-sm overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="bg-gray-50 border-b border-gray-100">
                    {['Employee name', 'Date', 'Clock in', 'Clock out', 'Status', 'Actions'].map(col => (
                      <th key={col} className="text-left px-6 py-3 text-xs font-semibold text-gray-500 uppercase tracking-wide whitespace-nowrap">
                        {col}
                      </th>
                    ))}
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-100">
                  {filteredAtt.map(row => (
                    <tr key={row.id} className="hover:bg-gray-50 transition-colors">
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="flex items-center gap-2.5">
                          <div className={`w-7 h-7 rounded-full ${row.color} flex items-center justify-center text-white text-xs font-semibold flex-shrink-0`}>
                            {row.initials}
                          </div>
                          <span className="font-medium text-gray-900">{row.name}</span>
                        </div>
                      </td>
                      <td className="px-6 py-4 text-gray-600 whitespace-nowrap">{row.date}</td>
                      <td className="px-6 py-4 text-gray-600 whitespace-nowrap">{row.clockIn}</td>
                      <td className="px-6 py-4 text-gray-600 whitespace-nowrap">{row.clockOut}</td>
                      <td className="px-6 py-4"><StatusPill status={row.status} /></td>
                      <td className="px-6 py-4">
                        <button
                          onClick={() => navigate(`/employer/hr-ops/employee/${row.empId}`)}
                          className="text-xs text-gray-500 hover:text-gray-800 whitespace-nowrap"
                        >
                          ↳ View history
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
            {filteredAtt.length === 0 && (
              <div className="flex flex-col items-center justify-center py-16 text-center">
                <Users size={40} className="text-gray-300 mb-3" />
                <p className="text-sm font-medium text-gray-500">No attendance records</p>
                <p className="text-xs text-gray-400 mt-1">Records will appear once employees clock in</p>
              </div>
            )}
          </div>
        </>
      )}

      {activeTab === 'Leave requests' && (
        <>
          <h2 className="text-lg font-semibold text-gray-900 mb-4">Leave requests</h2>

          <div className="grid grid-cols-3 gap-4 mb-6">
            {[
              { label: 'Total requests', value: String(leaveRows.length),                                   icon: CalendarDays, iconCls: 'text-green-500', bg: 'bg-green-50' },
              { label: 'Pending review', value: String(leaveRows.filter(r => r.status === 'pending').length),  icon: Clock,        iconCls: 'text-amber-500', bg: 'bg-amber-50' },
              { label: 'Approved',       value: String(leaveRows.filter(r => r.status === 'approved').length), icon: Check,        iconCls: 'text-blue-500',  bg: 'bg-blue-50'  },
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

          <div className="flex items-center gap-3 mb-4">
            <div className="relative flex-1 max-w-sm">
              <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
              <input
                type="text"
                placeholder="Search by employee or type"
                value={search}
                onChange={e => setSearch(e.target.value)}
                className="w-full pl-9 pr-4 py-2 text-sm border border-gray-200 rounded-lg focus:outline-none focus:border-[#22c55e]"
              />
            </div>
          </div>

          <p className="text-sm text-gray-500 mb-3">{filteredLeave.length} requests</p>

          <div className="bg-white rounded-xl border border-gray-100 shadow-sm overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="bg-gray-50 border-b border-gray-100">
                    {['Employee', 'Type', 'Start', 'End', 'Days', 'Status', 'Actions'].map(col => (
                      <th key={col} className="text-left px-6 py-3 text-xs font-semibold text-gray-500 uppercase tracking-wide whitespace-nowrap">
                        {col}
                      </th>
                    ))}
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-100">
                  {filteredLeave.map(row => (
                    <tr key={row.id} className="hover:bg-gray-50 transition-colors">
                      <td className="px-6 py-4 font-medium text-gray-900 whitespace-nowrap">
                        {row.employeeName ?? '—'}
                      </td>
                      <td className="px-6 py-4 text-gray-600 whitespace-nowrap">{row.leaveType}</td>
                      <td className="px-6 py-4 text-gray-600 whitespace-nowrap">
                        {new Date(row.startDate).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}
                      </td>
                      <td className="px-6 py-4 text-gray-600 whitespace-nowrap">
                        {new Date(row.endDate).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}
                      </td>
                      <td className="px-6 py-4 text-gray-600 whitespace-nowrap">{row.daysRequested}</td>
                      <td className="px-6 py-4"><LeaveStatusPill status={row.status} /></td>
                      <td className="px-6 py-4">
                        {row.status === 'pending' ? (
                          <div className="flex items-center gap-2">
                            <button
                              onClick={() => handleApprove(row.id)}
                              disabled={actioning === row.id}
                              className="w-7 h-7 rounded-full bg-green-50 hover:bg-green-100 flex items-center justify-center transition-colors disabled:opacity-50"
                              title="Approve"
                            >
                              <Check size={13} className="text-green-600" />
                            </button>
                            <button
                              onClick={() => handleReject(row.id)}
                              disabled={actioning === row.id}
                              className="w-7 h-7 rounded-full bg-red-50 hover:bg-red-100 flex items-center justify-center transition-colors disabled:opacity-50"
                              title="Reject"
                            >
                              <X size={13} className="text-red-500" />
                            </button>
                          </div>
                        ) : (
                          <span className="text-xs text-gray-400">—</span>
                        )}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
            {filteredLeave.length === 0 && (
              <div className="flex flex-col items-center justify-center py-16 text-center">
                <CalendarDays size={40} className="text-gray-300 mb-3" />
                <p className="text-sm font-medium text-gray-500">No leave requests</p>
                <p className="text-xs text-gray-400 mt-1">Leave requests from employees will appear here</p>
              </div>
            )}
          </div>
        </>
      )}
    </div>
  )
}
