// Static data for June 2025
// June 1 = Sunday (day-of-week index 0 in JS, but in Mon-Sun grid it's position 6)

type DayStatus = 'present' | 'absent' | 'late' | 'weekend' | 'holiday' | 'empty'

interface CalendarDay {
  date: number | null
  status: DayStatus
}

// June 2025: starts on Sunday. In a Mon–Sun grid the first day lands in column 7 (index 6).
// Build 35 cells (5 rows × 7): 6 leading empties, then 30 days.
const calendarCells: CalendarDay[] = [
  // Week 1: Mon–Sat empty, Sun = 1 June
  { date: null, status: 'empty' },
  { date: null, status: 'empty' },
  { date: null, status: 'empty' },
  { date: null, status: 'empty' },
  { date: null, status: 'empty' },
  { date: null, status: 'empty' },
  { date: 1,    status: 'weekend' },
  // Week 2
  { date: 2,  status: 'present' },
  { date: 3,  status: 'present' },
  { date: 4,  status: 'present' },
  { date: 5,  status: 'late'    },
  { date: 6,  status: 'present' },
  { date: 7,  status: 'weekend' },
  { date: 8,  status: 'weekend' },
  // Week 3
  { date: 9,  status: 'present' },
  { date: 10, status: 'present' },
  { date: 11, status: 'absent'  },
  { date: 12, status: 'present' },
  { date: 13, status: 'late'    },
  { date: 14, status: 'weekend' },
  { date: 15, status: 'weekend' },
  // Week 4
  { date: 16, status: 'present' },
  { date: 17, status: 'present' },
  { date: 18, status: 'present' },
  { date: 19, status: 'present' },
  { date: 20, status: 'present' },
  { date: 21, status: 'weekend' },
  { date: 22, status: 'weekend' },
  // Week 5
  { date: 23, status: 'present' },
  { date: 24, status: 'present' },
  { date: 25, status: 'present' },
  { date: 26, status: 'present' },
  { date: 27, status: 'present' },
  { date: 28, status: 'weekend' },
  { date: 29, status: 'weekend' },
  // Week 6 (partial)
  { date: 30, status: 'present' },
  { date: null, status: 'empty' },
  { date: null, status: 'empty' },
  { date: null, status: 'empty' },
  { date: null, status: 'empty' },
  { date: null, status: 'empty' },
  { date: null, status: 'empty' },
]

const dotColors: Record<DayStatus, string> = {
  present: 'bg-green-500',
  absent:  'bg-red-500',
  late:    'bg-amber-400',
  weekend: 'bg-gray-200',
  holiday: 'bg-blue-400',
  empty:   'bg-transparent',
}

type AttendanceStatus = 'Present' | 'Absent' | 'Late'

interface AttendanceRecord {
  date: string
  clockIn: string
  clockOut: string
  total: string
  status: AttendanceStatus
}

const records: AttendanceRecord[] = [
  { date: 'Jun 2, 2025',  clockIn: '08:55', clockOut: '17:10', total: '8h 15m', status: 'Present' },
  { date: 'Jun 3, 2025',  clockIn: '09:02', clockOut: '17:00', total: '7h 58m', status: 'Present' },
  { date: 'Jun 4, 2025',  clockIn: '08:48', clockOut: '17:05', total: '8h 17m', status: 'Present' },
  { date: 'Jun 5, 2025',  clockIn: '09:22', clockOut: '17:15', total: '7h 53m', status: 'Late'    },
  { date: 'Jun 6, 2025',  clockIn: '08:59', clockOut: '17:00', total: '8h 01m', status: 'Present' },
  { date: 'Jun 9, 2025',  clockIn: '09:00', clockOut: '17:00', total: '8h 00m', status: 'Present' },
  { date: 'Jun 10, 2025', clockIn: '08:50', clockOut: '17:12', total: '8h 22m', status: 'Present' },
  { date: 'Jun 11, 2025', clockIn: '—',     clockOut: '—',     total: '—',      status: 'Absent'  },
  { date: 'Jun 12, 2025', clockIn: '09:01', clockOut: '17:00', total: '7h 59m', status: 'Present' },
  { date: 'Jun 13, 2025', clockIn: '09:35', clockOut: '17:30', total: '7h 55m', status: 'Late'    },
]

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
  return (
    <div className="px-8 py-6">
      {/* Header */}
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-gray-900">My attendance</h1>
        <p className="text-sm text-gray-500 mt-0.5">June 2025</p>
      </div>

      {/* Stat cards */}
      <div className="grid grid-cols-3 gap-4 mb-6">
        {[
          { label: 'Days present',  value: '18', color: 'text-green-600', bg: 'bg-green-50' },
          { label: 'Days absent',   value: '1',  color: 'text-red-600',   bg: 'bg-red-50'   },
          { label: 'Late arrivals', value: '2',  color: 'text-amber-600', bg: 'bg-amber-50' },
        ].map(({ label, value, color, bg }) => (
          <div key={label} className="bg-white rounded-xl border border-gray-100 shadow-sm p-5">
            <p className="text-xs text-gray-500 mb-1">{label}</p>
            <p className={`text-3xl font-bold ${color}`}>{value}</p>
          </div>
        ))}
      </div>

      {/* Calendar */}
      <div className="bg-white rounded-xl border border-gray-100 shadow-sm p-6 mb-6">
        <h2 className="text-sm font-semibold text-gray-900 mb-4">June 2025</h2>

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

        {/* Date cells */}
        <div className="grid grid-cols-7 gap-y-1">
          {calendarCells.map((cell, i) => (
            <div
              key={i}
              className={`flex flex-col items-center py-2 rounded-lg ${
                cell.status === 'weekend' ? 'bg-gray-50' : cell.date ? 'hover:bg-gray-50' : ''
              }`}
            >
              {cell.date !== null && (
                <>
                  <span className={`text-sm font-medium ${cell.status === 'weekend' ? 'text-gray-400' : 'text-gray-800'}`}>
                    {cell.date}
                  </span>
                  <span className={`w-1.5 h-1.5 rounded-full mt-1 ${dotColors[cell.status]}`} />
                </>
              )}
            </div>
          ))}
        </div>
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
        </div>
      </div>
    </div>
  )
}
