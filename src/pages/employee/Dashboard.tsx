import { useState, useEffect } from 'react'
import { Clock, FileText, CalendarDays, Gift, Settings, ChevronRight, MapPin } from 'lucide-react'
import { usePageTitle } from '../../hooks/usePageTitle'
import { useAuth } from '../../context/AuthContext'
import { useNavigate } from 'react-router-dom'
import { employeeDashboard, attendance as attendanceApi, type EmployeeDashboardData } from '../../lib/api'

function StatusPill({ status }: { status: string }) {
  const cls =
    status === 'Active' || status === 'Approved' || status === 'Early'
      ? 'bg-green-100 text-green-700'
      : status === 'Pending' || status === 'Overtime'
      ? 'bg-amber-100 text-amber-700'
      : status === 'Absent'
      ? 'bg-red-100 text-red-700'
      : 'bg-gray-100 text-gray-600'
  return (
    <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${cls}`}>
      {status}
    </span>
  )
}

const quickActions = [
  { label: 'Manage payslips',       icon: FileText,     path: '/employee/payslips' },
  { label: 'Manage attendance',     icon: Clock,        path: '/employee/attendance' },
  { label: 'Manage benefits',       icon: Gift,         path: '/employee/benefits' },
  { label: 'Manage leave requests', icon: CalendarDays, path: '/employee/leave' },
  { label: 'Configure settings',    icon: Settings,     path: '/employee/settings' },
]

export default function EmployeeDashboard() {
  usePageTitle('My Dashboard')
  const { user } = useAuth()
  const navigate = useNavigate()
  const firstName = user?.fullName?.split(' ')[0] ?? 'there'

  const [data, setData] = useState<EmployeeDashboardData | null>(null)
  const [clockingIn, setClockingIn] = useState(false)

  useEffect(() => {
    employeeDashboard.get()
      .then(setData)
      .catch(() => {})
  }, [])

  async function handleClockIn() {
    setClockingIn(true)
    try {
      await attendanceApi.clockIn()
      const refreshed = await employeeDashboard.get()
      setData(refreshed)
    } finally {
      setClockingIn(false)
    }
  }

  const benefits = (data?.enrolledBenefits ?? []).map(b => ({
    name: b.name,
    sub: b.benefitType ?? 'Benefit',
    status: b.isActive ? 'Active' : 'Inactive',
    action: 'View',
    id: b.id,
  }))
  const payslips = (data?.recentPayslips ?? []).slice(0, 3).map(p => ({
    name: p.periodStart ? new Date(p.periodStart).toLocaleDateString('en-US', { month: 'long', year: 'numeric' }) : 'Payslip',
    info: `Net: $${p.netPay ? parseFloat(p.netPay).toLocaleString('en-US', { minimumFractionDigits: 2 }) : '—'}`,
    id: p.id,
  }))
  const attendance = (data?.recentAttendance ?? []).slice(0, 3).map(r => ({
    time: new Date(r.date).toLocaleDateString('en-US', { month: 'short', day: 'numeric' }),
    sub: 'Office',
    status: r.status === 'present' ? 'Early' : r.status === 'late' ? 'Overtime' : 'Absent',
  }))

  return (
    <div className="">

      {/* Welcome row */}
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-2xl font-bold text-gray-900">Welcome {firstName}</h1>
        <button
          onClick={handleClockIn}
          disabled={clockingIn}
          className="flex items-center gap-2 bg-[#22c55e] text-white px-4 py-2 rounded-lg text-sm font-medium hover:bg-green-600 transition-colors disabled:opacity-60"
        >
          <Clock size={14} />
          {clockingIn ? 'Clocking in…' : 'Clock in'}
        </button>
      </div>

      {/* Stats row */}
      <div className="grid grid-cols-5 gap-4 mb-6">
        {/* Clock-in card */}
        <div className="bg-[#1b2838] rounded-xl p-4 text-white flex flex-col justify-between min-h-[90px]">
          <p className="text-xs text-gray-400">Clock in time</p>
          <p className="text-xl font-bold font-mono tracking-widest">00:00:00</p>
          <div className="w-7 h-7 bg-[#22c55e] rounded-lg flex items-center justify-center self-end">
            <Clock size={13} />
          </div>
        </div>

        {[
          { label: 'Attendance',    value: `${data?.recentAttendance?.length ?? 0} records`, icon: Clock,        iconCls: 'text-blue-500',  bg: 'bg-blue-50'  },
          { label: 'Last pay',      value: payslips[0]?.info.replace('Net: ', '') ?? '—',    icon: FileText,     iconCls: 'text-amber-500', bg: 'bg-amber-50' },
          { label: 'Annual leave',  value: `${data?.leaveBalances?.annual ?? 0} days`,       icon: CalendarDays, iconCls: 'text-blue-500',  bg: 'bg-blue-50'  },
          { label: 'Benefit plans', value: String(benefits.length),                          icon: Gift,         iconCls: 'text-green-500', bg: 'bg-green-50' },
        ].map(({ label, value, icon: Icon, iconCls, bg }) => (
          <div key={label} className="bg-white rounded-xl border border-gray-100 shadow-sm p-4 flex items-start justify-between">
            <div>
              <p className="text-xs text-gray-500 mb-1">{label}</p>
              <p className="text-lg font-bold text-gray-900">{value}</p>
            </div>
            <div className={`w-8 h-8 ${bg} rounded-lg flex items-center justify-center flex-shrink-0`}>
              <Icon size={16} className={iconCls} />
            </div>
          </div>
        ))}
      </div>

      {/* Quick actions */}
      <div className="bg-white rounded-xl border border-gray-100 shadow-sm p-5 mb-6">
        <h2 className="text-sm font-semibold text-gray-900 mb-4">Quick actions</h2>
        <div className="grid grid-cols-5 gap-3">
          {quickActions.map(({ label, icon: Icon, path }) => (
            <button
              key={label}
              onClick={() => navigate(path)}
              className="flex flex-col gap-3 p-4 border border-gray-100 rounded-xl hover:bg-gray-50 transition-colors text-left"
            >
              <div className="w-9 h-9 bg-gray-100 rounded-lg flex items-center justify-center">
                <Icon size={18} className="text-gray-600" />
              </div>
              <p className="text-xs font-medium text-gray-700 leading-tight">{label}</p>
              <ChevronRight size={13} className="text-gray-400 self-end mt-auto" />
            </button>
          ))}
        </div>
      </div>

      {/* 2-column lower section */}
      <div className="grid grid-cols-2 gap-6">

        {/* LEFT COLUMN */}
        <div className="flex flex-col gap-6">

          {/* Your benefits */}
          <div className="bg-white rounded-xl border border-gray-100 shadow-sm p-5">
            <h2 className="text-sm font-semibold text-gray-900 mb-4">Your benefits</h2>
            {benefits.length === 0 ? (
              <div className="flex flex-col items-center justify-center py-8 text-center">
                <Gift size={32} className="text-gray-300 mb-2" />
                <p className="text-sm font-medium text-gray-500">No benefits enrolled</p>
                <p className="text-xs text-gray-400 mt-0.5">Your enrolled benefit plans will appear here</p>
              </div>
            ) : (
              <div className="divide-y divide-gray-50">
                {benefits.map((item, i) => (
                  <div key={i} className="flex items-center justify-between py-3 first:pt-0 last:pb-0">
                    <div className="flex items-center gap-3">
                      <div className="w-8 h-8 bg-gray-100 rounded-lg flex items-center justify-center flex-shrink-0">
                        <Gift size={14} className="text-gray-500" />
                      </div>
                      <div>
                        <p className="text-sm font-medium text-gray-900">{item.name}</p>
                        <p className="text-xs text-gray-400">{item.sub}</p>
                      </div>
                    </div>
                    <div className="flex items-center gap-2 flex-shrink-0">
                      <StatusPill status={item.status} />
                      <button className="flex items-center gap-1 text-xs text-gray-500 hover:text-gray-700">
                        <ChevronRight size={11} />
                        {item.action}
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            )}
            <button onClick={() => navigate('/employee/benefits')} className="mt-4 text-sm text-gray-500 hover:text-gray-700 w-full text-center border-t border-gray-50 pt-3">
              View all benefits
            </button>
          </div>

          {/* Leave requests */}
          <div className="bg-white rounded-xl border border-gray-100 shadow-sm p-5">
            <h2 className="text-sm font-semibold text-gray-900 mb-4">Leave requests</h2>
            {leaveRequests.length === 0 ? (
              <div className="flex flex-col items-center justify-center py-8 text-center">
                <CalendarDays size={32} className="text-gray-300 mb-2" />
                <p className="text-sm font-medium text-gray-500">No leave requests</p>
                <p className="text-xs text-gray-400 mt-0.5">Your leave requests will appear here</p>
              </div>
            ) : (
              <div className="divide-y divide-gray-50">
                {leaveRequests.map((item, i) => (
                  <div key={i} className="flex items-center justify-between py-3 first:pt-0 last:pb-0">
                    <div className="flex items-center gap-3">
                      <div className="w-8 h-8 bg-gray-100 rounded-lg flex items-center justify-center flex-shrink-0">
                        <CalendarDays size={14} className="text-gray-500" />
                      </div>
                      <div>
                        <p className="text-sm font-medium text-gray-900">{item.name}</p>
                        <p className="text-xs text-gray-400">{item.sub}</p>
                      </div>
                    </div>
                    <div className="flex items-center gap-2 flex-shrink-0">
                      <StatusPill status={item.status} />
                      <button className="text-xs text-gray-500 hover:text-gray-700">{item.action}</button>
                    </div>
                  </div>
                ))}
              </div>
            )}
            <button onClick={() => navigate('/employee/leave')} className="mt-4 text-sm text-gray-500 hover:text-gray-700 w-full text-center border-t border-gray-50 pt-3">
              View all leave requests
            </button>
          </div>

        </div>

        {/* RIGHT COLUMN */}
        <div className="flex flex-col gap-6">

          {/* Payslips */}
          <div className="bg-white rounded-xl border border-gray-100 shadow-sm p-5">
            <h2 className="text-sm font-semibold text-gray-900 mb-4">Payslips</h2>
            {payslips.length === 0 ? (
              <div className="flex flex-col items-center justify-center py-8 text-center">
                <FileText size={32} className="text-gray-300 mb-2" />
                <p className="text-sm font-medium text-gray-500">No recent payslips</p>
                <p className="text-xs text-gray-400 mt-0.5">Payslips will appear here after payroll is run</p>
              </div>
            ) : (
              <div className="divide-y divide-gray-50">
                {payslips.map((item, i) => (
                  <div key={i} className="flex items-center justify-between py-3 first:pt-0 last:pb-0">
                    <div className="flex items-center gap-3">
                      <div className="w-8 h-8 bg-gray-100 rounded-lg flex items-center justify-center flex-shrink-0">
                        <FileText size={14} className="text-gray-500" />
                      </div>
                      <div>
                        <p className="text-sm font-medium text-gray-900">{item.name}</p>
                        <p className="text-xs text-gray-400">{item.info}</p>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
            <button onClick={() => navigate('/employee/payslips')} className="mt-4 text-sm text-gray-500 hover:text-gray-700 w-full text-center border-t border-gray-50 pt-3">
              View all payslips
            </button>
          </div>

          {/* Attendance */}
          <div className="bg-white rounded-xl border border-gray-100 shadow-sm p-5">
            <h2 className="text-sm font-semibold text-gray-900 mb-4">Attendance</h2>
            {attendance.length === 0 ? (
              <div className="flex flex-col items-center justify-center py-8 text-center">
                <CalendarDays size={32} className="text-gray-300 mb-2" />
                <p className="text-sm font-medium text-gray-500">No attendance records</p>
                <p className="text-xs text-gray-400 mt-0.5">Records will appear as you clock in</p>
              </div>
            ) : (
              <div className="divide-y divide-gray-50">
                {attendance.map((item, i) => (
                  <div key={i} className="flex items-center justify-between py-3 first:pt-0 last:pb-0">
                    <div className="flex items-center gap-3">
                      <div className="w-8 h-8 bg-gray-100 rounded-lg flex items-center justify-center flex-shrink-0">
                        <CalendarDays size={14} className="text-gray-500" />
                      </div>
                      <div>
                        <p className="text-sm font-medium text-gray-900">{item.time}</p>
                        <p className="text-xs text-gray-400 flex items-center gap-1">
                          <MapPin size={10} />
                          {item.sub}
                        </p>
                      </div>
                    </div>
                    <div className="flex items-center gap-2 flex-shrink-0">
                      <StatusPill status={item.status} />
                    </div>
                  </div>
                ))}
              </div>
            )}
            <button onClick={() => navigate('/employee/attendance')} className="mt-4 text-sm text-gray-500 hover:text-gray-700 w-full text-center border-t border-gray-50 pt-3">
              View all attendance
            </button>
          </div>

        </div>
      </div>
    </div>
  )
}
