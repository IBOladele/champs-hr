import { useNavigate } from 'react-router-dom'
import { Clock, MapPin, ChevronLeft, ChevronRight, ChevronDown, FileText } from 'lucide-react'

type AttendanceStatus = 'Early' | 'Overtime' | 'Absent' | 'Late'

interface AttendanceRow {
  date: string
  clockIn: string
  clockOut: string
  hours: string
  location: string
  status: AttendanceStatus
}

const rows: AttendanceRow[] = [
  { date: 'Jan 1, 2025',   clockIn: '03:00', clockOut: '17:00', hours: '40 hours', location: 'New York, USA',     status: 'Early'    },
  { date: 'Feb 14, 2025',  clockIn: '03:00', clockOut: '17:00', hours: '35 hours', location: 'Los Angeles, USA',  status: 'Overtime' },
  { date: 'Feb 14, 2025',  clockIn: '05:00', clockOut: '17:00', hours: '35 hours', location: 'Los Angeles, USA',  status: 'Absent'   },
  { date: 'Feb 14, 2025',  clockIn: '05:00', clockOut: '17:00', hours: '35 hours', location: 'Los Angeles, USA',  status: 'Overtime' },
  { date: 'Feb 14, 2025',  clockIn: '05:00', clockOut: '17:00', hours: '35 hours', location: 'Los Angeles, USA',  status: 'Early'    },
  { date: 'Feb 14, 2025',  clockIn: '05:30', clockOut: '17:00', hours: '35 hours', location: 'Los Angeles, USA',  status: 'Overtime' },
  { date: 'Feb 14, 2025',  clockIn: '05:30', clockOut: '17:00', hours: '35 hours', location: 'Los Angeles, USA',  status: 'Absent'   },
  { date: 'Feb 14, 2025',  clockIn: '05:30', clockOut: '17:00', hours: '35 hours', location: 'Los Angeles, USA',  status: 'Early'    },
]

function StatusPill({ status }: { status: AttendanceStatus }) {
  const cls =
    status === 'Early'
      ? 'bg-green-100 text-green-700'
      : status === 'Overtime'
      ? 'bg-amber-100 text-amber-700'
      : status === 'Absent'
      ? 'bg-red-100 text-red-700'
      : 'bg-orange-100 text-orange-700'
  return (
    <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${cls}`}>
      {status}
    </span>
  )
}

export default function Attendance() {
  const navigate = useNavigate()

  return (
    <div className="px-8 py-6">

      {/* Page heading */}
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-2xl font-bold text-gray-900">Attendance</h1>
        <button className="flex items-center gap-2 bg-[#22c55e] text-white px-4 py-2 rounded-lg text-sm font-medium hover:bg-green-600 transition-colors">
          <Clock size={14} />
          Clock in time
        </button>
      </div>

      {/* Stats row */}
      <div className="grid grid-cols-4 gap-4 mb-6">
        <div className="bg-[#1b2838] rounded-xl p-4 text-white flex flex-col justify-between min-h-[90px]">
          <p className="text-xs text-gray-400">Clock in time</p>
          <p className="text-xl font-bold font-mono tracking-widest">00:00:00</p>
          <div className="w-7 h-7 bg-[#22c55e] rounded-lg flex items-center justify-center self-end">
            <Clock size={13} />
          </div>
        </div>
        {[
          { label: 'Total worked',  value: '100 hrs',   icon: Clock,    iconCls: 'text-blue-500',  bg: 'bg-blue-50'  },
          { label: 'Leave days',    value: '10 days',   icon: FileText, iconCls: 'text-amber-500', bg: 'bg-amber-50' },
          { label: 'Overtime work', value: '30 hrs',    icon: Clock,    iconCls: 'text-amber-500', bg: 'bg-amber-50' },
        ].map(({ label, value, icon: Icon, iconCls, bg }) => (
          <div key={label} className="bg-white rounded-xl border border-gray-100 shadow-sm p-4 flex items-start justify-between">
            <div>
              <p className="text-xs text-gray-500 mb-1">{label}</p>
              <p className="text-xl font-bold text-gray-900">{value}</p>
            </div>
            <div className={`w-8 h-8 ${bg} rounded-lg flex items-center justify-center flex-shrink-0`}>
              <Icon size={16} className={iconCls} />
            </div>
          </div>
        ))}
      </div>

      {/* Filters */}
      <div className="flex items-center gap-3 mb-4">
        <div className="text-sm text-gray-500">Jan 2025 – Feb 2025</div>
        <button
          onClick={() => navigate('/employee/attendance/detail')}
          className="ml-auto flex items-center gap-1.5 text-sm text-[#22c55e] font-medium border border-[#22c55e] rounded-lg px-3 py-1.5 hover:bg-green-50 transition-colors"
        >
          View detailed log
        </button>
        <button className="flex items-center gap-1.5 text-sm text-gray-600 border border-gray-200 rounded-lg px-3 py-1.5 hover:bg-gray-50">
          Filter by <ChevronDown size={13} />
        </button>
        <button className="flex items-center gap-1.5 text-sm text-gray-600 border border-gray-200 rounded-lg px-3 py-1.5 hover:bg-gray-50">
          Sort by <ChevronDown size={13} />
        </button>
      </div>

      {/* Table */}
      <div className="bg-white rounded-xl border border-gray-100 shadow-sm overflow-hidden">
        <div className="px-6 py-4 border-b border-gray-100">
          <h2 className="text-sm font-semibold text-gray-900">Attendance Info</h2>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="bg-gray-50 border-b border-gray-100">
                {['Date', 'Clock in', 'Clock out', 'Hours worked', 'Location', 'Status'].map(col => (
                  <th key={col} className="text-left px-6 py-3 text-xs font-semibold text-gray-500 uppercase tracking-wide whitespace-nowrap">
                    {col}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {rows.map((row, i) => (
                <tr key={i} className="hover:bg-gray-50 transition-colors">
                  <td className="px-6 py-4 font-medium text-gray-900 whitespace-nowrap">{row.date}</td>
                  <td className="px-6 py-4 text-gray-600 whitespace-nowrap">{row.clockIn}</td>
                  <td className="px-6 py-4 text-gray-600 whitespace-nowrap">{row.clockOut}</td>
                  <td className="px-6 py-4 text-gray-600 whitespace-nowrap">{row.hours}</td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <span className="flex items-center gap-1.5 text-gray-600">
                      <MapPin size={12} className="text-gray-400" />
                      {row.location}
                    </span>
                  </td>
                  <td className="px-6 py-4">
                    <StatusPill status={row.status} />
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Pagination */}
      <div className="flex items-center gap-1 mt-5">
        <button className="flex items-center gap-1 px-3 py-1.5 text-sm text-gray-500 hover:text-gray-700 transition-colors">
          <ChevronLeft size={14} /> Previous
        </button>
        {[1, 2, 3, 4].map(p => (
          <button key={p} className={`w-8 h-8 rounded text-sm font-medium transition-colors ${p === 2 ? 'bg-gray-900 text-white' : 'text-gray-500 hover:bg-gray-100'}`}>
            {p}
          </button>
        ))}
        <span className="px-1 text-gray-400 text-sm">...</span>
        <button className="w-8 h-8 rounded text-sm text-gray-500 hover:bg-gray-100">10</button>
        <button className="w-8 h-8 rounded text-sm text-gray-500 hover:bg-gray-100">11</button>
        <button className="flex items-center gap-1 px-3 py-1.5 text-sm text-gray-500 hover:text-gray-700 transition-colors">
          Next <ChevronRight size={14} />
        </button>
      </div>

    </div>
  )
}
