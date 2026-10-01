import { useState } from 'react'
import { Clock } from 'lucide-react'

type DayStatus = 'empty'

interface CalendarDay {
  date: number | null
  status: DayStatus
}

// 35 blank cells — no status data until API supplies it
const calendarCells: CalendarDay[] = Array.from({ length: 35 }, () => ({
  date: null,
  status: 'empty',
}))

type AttendanceStatus = 'Present' | 'Absent' | 'Late'

interface AttendanceRecord {
  date: string
  clockIn: string
  clockOut: string
  total: string
  status: AttendanceStatus
}

function StatusPill({ status }: { status: AttendanceStatus }) {
  const cls =
    status === 'Present' ? 'bg-green-100 text-green-700'
    : status === 'Late'  ? 'bg-amber-100 text-amber-700'
    :                      'bg-red-100 text-red-700'
  return (
    <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${cls}`}>
      {status}
    </span>
  )
}

export default function AttendanceDetail() {
  const [records] = useState<AttendanceRecord[]>([])

  return (
    <div className="">
      {/* Header */}
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-gray-900">My attendance</h1>
        <p className="text-sm text-gray-500 mt-0.5">Detailed log</p>
      </div>

      {/* Stat cards */}
      <div className="grid grid-cols-3 gap-4 mb-6">
        {[
          { label: 'Days present',  value: '0', color: 'text-green-600' },
          { label: 'Days absent',   value: '0', color: 'text-red-600'   },
          { label: 'Late arrivals', value: '0', color: 'text-amber-600' },
        ].map(({ label, value, color }) => (
          <div key={label} className="bg-white rounded-xl border border-gray-100 shadow-sm p-5">
            <p className="text-xs text-gray-500 mb-1">{label}</p>
            <p className={`text-3xl font-bold ${color}`}>{value}</p>
          </div>
        ))}
      </div>

      {/* Calendar */}
      <div className="bg-white rounded-xl border border-gray-100 shadow-sm p-6 mb-6">
        <h2 className="text-sm font-semibold text-gray-900 mb-4">Calendar</h2>

        {/* Legend */}
        <div className="flex items-center gap-4 mb-4 text-xs text-gray-500">
          {[
            { label: 'Present', dot: 'bg-green-500' },
            { label: 'Absent',  dot: 'bg-red-500'   },
            { label: 'Late',    dot: 'bg-amber-400'  },
            { label: 'Weekend', dot: 'bg-gray-200'   },
          ].map(({ label, dot }) => (
            <span key={label} className="flex items-center gap-1.5">
              <span className={`w-2 h-2 rounded-full ${dot}`} />
              {label}
            </span>
          ))}
        </div>

        {/* Day headers */}
        <div className="grid grid-cols-7 mb-1">
          {['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'].map(d => (
            <div key={d} className="text-center text-xs font-semibold text-gray-400 py-1">{d}</div>
          ))}
        </div>

        {/* Date cells — all empty until API fills them */}
        <div className="grid grid-cols-7 gap-y-1">
          {calendarCells.map((_, i) => (
            <div key={i} className="flex flex-col items-center py-2 rounded-lg" />
          ))}
        </div>

        <p className="text-xs text-gray-400 text-center mt-4">No attendance data available yet</p>
      </div>

      {/* Recent records table */}
      <div className="bg-white rounded-xl border border-gray-100 shadow-sm overflow-hidden">
        <div className="px-6 py-4 border-b border-gray-100">
          <h2 className="text-sm font-semibold text-gray-900">Recent records</h2>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="bg-gray-50 border-b border-gray-100">
                {['Date', 'Clock in', 'Clock out', 'Total hours', 'Status'].map(col => (
                  <th key={col} className="text-left px-6 py-3 text-xs font-semibold text-gray-500 uppercase tracking-wide whitespace-nowrap">
                    {col}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {records.map((row, i) => (
                <tr key={i} className="hover:bg-gray-50 transition-colors">
                  <td className="px-6 py-4 font-medium text-gray-900 whitespace-nowrap">{row.date}</td>
                  <td className="px-6 py-4 text-gray-600 whitespace-nowrap">{row.clockIn}</td>
                  <td className="px-6 py-4 text-gray-600 whitespace-nowrap">{row.clockOut}</td>
                  <td className="px-6 py-4 text-gray-600 whitespace-nowrap">{row.total}</td>
                  <td className="px-6 py-4"><StatusPill status={row.status} /></td>
                </tr>
              ))}
            </tbody>
          </table>
          {records.length === 0 && (
            <div className="flex flex-col items-center justify-center py-16 text-center">
              <Clock size={40} className="text-gray-300 mb-3" />
              <p className="text-sm font-medium text-gray-500">No records yet</p>
              <p className="text-xs text-gray-400 mt-1">Records will appear once you start clocking in</p>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
