import { useNavigate } from 'react-router-dom'
import { CalendarDays, Plus, ChevronDown, ChevronLeft, ChevronRight, Eye } from 'lucide-react'

type LeaveStatus = 'Pending' | 'Approved' | 'Denied'

interface LeaveRow {
  name: string
  type: string
  startDate: string
  endDate: string
  totalDays: string
  status: LeaveStatus
}

const rows: LeaveRow[] = [
  { name: 'Health check-up',   type: 'Sick day',     startDate: 'Aug 15, 2025', endDate: 'Aug 15, 2025', totalDays: '1 day',   status: 'Pending'  },
  { name: 'Project deadline',  type: 'Vacation',     startDate: 'Jun 20, 2025', endDate: 'Jun 27, 2025', totalDays: '7 days',  status: 'Approved' },
  { name: 'Team meeting',      type: 'Personal day', startDate: 'Jul 1, 2025',  endDate: 'Jul 1, 2025',  totalDays: '1 day',   status: 'Pending'  },
  { name: 'Doctor visit',      type: 'Sick day',     startDate: 'Jul 10, 2025', endDate: 'Jul 10, 2025', totalDays: '1 day',   status: 'Approved' },
  { name: 'Family event',      type: 'Personal day', startDate: 'Aug 1, 2025',  endDate: 'Aug 3, 2025',  totalDays: '3 days',  status: 'Denied'   },
  { name: 'Annual leave',      type: 'Vacation',     startDate: 'Sep 1, 2025',  endDate: 'Sep 14, 2025', totalDays: '14 days', status: 'Pending'  },
]

function StatusPill({ status }: { status: LeaveStatus }) {
  const cls =
    status === 'Approved'
      ? 'bg-green-100 text-green-700'
      : status === 'Pending'
      ? 'bg-amber-100 text-amber-700'
      : 'bg-red-100 text-red-700'
  return (
    <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${cls}`}>
      {status}
    </span>
  )
}

export default function LeaveRequests() {
  const navigate = useNavigate()

  return (
    <div className="px-8 py-6">

      {/* Page heading */}
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-2xl font-bold text-gray-900">Leave requests</h1>
        <button
          onClick={() => navigate('/employee/leave/submit')}
          className="flex items-center gap-2 bg-[#22c55e] text-white px-4 py-2 rounded-lg text-sm font-medium hover:bg-green-600 transition-colors"
        >
          <Plus size={14} />
          Submit leave request
        </button>
      </div>

      {/* Stat cards */}
      <div className="grid grid-cols-3 gap-4 mb-6">
        {[
          { label: 'Annual leave', value: '100', iconCls: 'text-green-500', bg: 'bg-green-50' },
          { label: 'Sick leave',   value: '35',  iconCls: 'text-red-400',   bg: 'bg-red-50'   },
          { label: 'Unpaid leave', value: '20',  iconCls: 'text-amber-500', bg: 'bg-amber-50' },
        ].map(({ label, value, iconCls, bg }) => (
          <div key={label} className="bg-white rounded-xl border border-gray-100 shadow-sm p-5 flex items-start justify-between">
            <div>
              <p className="text-xs text-gray-500 mb-1">{label}</p>
              <p className="text-2xl font-bold text-gray-900">{value}</p>
            </div>
            <div className={`w-9 h-9 ${bg} rounded-lg flex items-center justify-center flex-shrink-0`}>
              <CalendarDays size={18} className={iconCls} />
            </div>
          </div>
        ))}
      </div>

      {/* Filter bar */}
      <div className="flex items-center gap-3 mb-4">
        <button className="flex items-center gap-1.5 text-sm text-gray-600 border border-gray-200 rounded-lg px-3 py-2 hover:bg-gray-50">
          All types <ChevronDown size={13} />
        </button>
        <button className="flex items-center gap-1.5 text-sm text-gray-600 border border-gray-200 rounded-lg px-3 py-2 hover:bg-gray-50">
          Sort by status <ChevronDown size={13} />
        </button>
      </div>

      {/* Table */}
      <div className="bg-white rounded-xl border border-gray-100 shadow-sm overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="bg-gray-50 border-b border-gray-100">
                {['Leave name', 'Type', 'Start date', 'End date', 'Total days', 'Status', 'Actions'].map(col => (
                  <th key={col} className="text-left px-6 py-3 text-xs font-semibold text-gray-500 uppercase tracking-wide whitespace-nowrap">
                    {col}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {rows.map((row, i) => (
                <tr key={i} className="hover:bg-gray-50 transition-colors">
                  <td className="px-6 py-4 font-medium text-gray-900 whitespace-nowrap">{row.name}</td>
                  <td className="px-6 py-4 text-gray-600 whitespace-nowrap">{row.type}</td>
                  <td className="px-6 py-4 text-gray-600 whitespace-nowrap">{row.startDate}</td>
                  <td className="px-6 py-4 text-gray-600 whitespace-nowrap">{row.endDate}</td>
                  <td className="px-6 py-4 text-gray-600 whitespace-nowrap">{row.totalDays}</td>
                  <td className="px-6 py-4"><StatusPill status={row.status} /></td>
                  <td className="px-6 py-4">
                    <button className="flex items-center gap-1 text-xs text-gray-600 hover:text-gray-900">
                      <Eye size={12} /> View details
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Pagination */}
      <div className="flex items-center gap-1 mt-5">
        <button className="flex items-center gap-1 px-3 py-1.5 text-sm text-gray-500 hover:text-gray-700">
          <ChevronLeft size={14} /> Previous
        </button>
        {[1, 2, 3, 4].map(p => (
          <button key={p} className={`w-8 h-8 rounded text-sm font-medium ${p === 1 ? 'bg-gray-900 text-white' : 'text-gray-500 hover:bg-gray-100'}`}>
            {p}
          </button>
        ))}
        <span className="px-1 text-gray-400 text-sm">...</span>
        <button className="w-8 h-8 rounded text-sm text-gray-500 hover:bg-gray-100">10</button>
        <button className="flex items-center gap-1 px-3 py-1.5 text-sm text-gray-500 hover:text-gray-700">
          Next <ChevronRight size={14} />
        </button>
      </div>

    </div>
  )
}
