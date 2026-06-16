import { Clock, FileText, CalendarDays, Gift, Settings, ChevronRight, Download, MapPin } from 'lucide-react'

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
  { label: 'Manage payslips',       icon: FileText },
  { label: 'Manage attendance',     icon: Clock },
  { label: 'Manage benefits',       icon: Gift },
  { label: 'Manage leave requests', icon: CalendarDays },
  { label: 'Configure settings',    icon: Settings },
]

const benefits = [
  { name: 'Dental plan premium', sub: 'Meyers inc · 2 dependants', status: 'Active',   action: 'View details' },
  { name: 'Dental plan premium', sub: 'Meyers inc · 2 dependants', status: 'Active',   action: 'View details' },
  { name: 'Dental plan premium', sub: 'Meyers inc · 2 dependants', status: 'Pending',  action: 'Edit benefit' },
]

const payslips = [
  { name: 'March 2025 payslips',    info: '$470,100 paid · March 1, 2025' },
  { name: 'Feburary 2025 payslips', info: '$470,100 paid · Feb 1, 2025' },
  { name: 'January 2025 payslips',  info: '$470,100 paid · Jan 1, 2025' },
]

const leaveRequests = [
  { name: 'Health check-up',  sub: 'Sick day · August 15 - August 15',  status: 'Pending',  action: 'Edit request'  },
  { name: 'Project deadline', sub: 'Vacation · June 20 - June 27',       status: 'Approved', action: 'View details'  },
  { name: 'Team meeting',     sub: 'Personal day · July 1 - July 1',     status: 'Pending',  action: 'Edit request'  },
]

const attendance = [
  { time: '09:00 AM - 18:00 PM', sub: 'Mar 8, 2024 · Los Angeles, USA', status: 'Early'    },
  { time: '09:00 AM - 18:00 PM', sub: 'Mar 7, 2024 · Los Angeles, USA', status: 'Overtime' },
  { time: '09:00 AM - 18:00 PM', sub: 'Mar 6, 2024 · Los Angeles, USA', status: 'Absent'   },
]

export default function EmployeeDashboard() {
  return (
    <div className="px-8 py-6">

      {/* Welcome row */}
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-2xl font-bold text-gray-900">Welcome Rolan</h1>
        <button className="flex items-center gap-2 bg-[#22c55e] text-white px-4 py-2 rounded-lg text-sm font-medium hover:bg-green-600 transition-colors">
          <Clock size={14} />
          Clock in time
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
          { label: 'Total worked',  value: '100 hrs',   icon: Clock,        iconCls: 'text-blue-500',  bg: 'bg-blue-50'  },
          { label: 'Total paid',    value: '100 hours', icon: FileText,     iconCls: 'text-amber-500', bg: 'bg-amber-50' },
          { label: 'Leave days',    value: '100 hours', icon: CalendarDays, iconCls: 'text-blue-500',  bg: 'bg-blue-50'  },
          { label: 'Benefit plans', value: '8 plans',   icon: Gift,         iconCls: 'text-green-500', bg: 'bg-green-50' },
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
          {quickActions.map(({ label, icon: Icon }) => (
            <button
              key={label}
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
            <button className="mt-4 text-sm text-gray-500 hover:text-gray-700 w-full text-center border-t border-gray-50 pt-3">
              View all benefits
            </button>
          </div>

          {/* Leave requests */}
          <div className="bg-white rounded-xl border border-gray-100 shadow-sm p-5">
            <h2 className="text-sm font-semibold text-gray-900 mb-4">Leave requests</h2>
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
            <button className="mt-4 text-sm text-gray-500 hover:text-gray-700 w-full text-center border-t border-gray-50 pt-3">
              View all tasks
            </button>
          </div>

        </div>

        {/* RIGHT COLUMN */}
        <div className="flex flex-col gap-6">

          {/* Payslips */}
          <div className="bg-white rounded-xl border border-gray-100 shadow-sm p-5">
            <h2 className="text-sm font-semibold text-gray-900 mb-4">Payslips</h2>
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
                  <button className="flex items-center gap-1 text-xs text-gray-500 hover:text-gray-700 flex-shrink-0">
                    <Download size={12} />
                    Download payslips
                  </button>
                </div>
              ))}
            </div>
            <button className="mt-4 text-sm text-gray-500 hover:text-gray-700 w-full text-center border-t border-gray-50 pt-3">
              View all payslips
            </button>
          </div>

          {/* Attendance */}
          <div className="bg-white rounded-xl border border-gray-100 shadow-sm p-5">
            <h2 className="text-sm font-semibold text-gray-900 mb-4">Attendance</h2>
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
                    <button className="text-xs text-gray-500 hover:text-gray-700">View details</button>
                  </div>
                </div>
              ))}
            </div>
            <button className="mt-4 text-sm text-gray-500 hover:text-gray-700 w-full text-center border-t border-gray-50 pt-3">
              View all attendance
            </button>
          </div>

        </div>
      </div>
    </div>
  )
}
