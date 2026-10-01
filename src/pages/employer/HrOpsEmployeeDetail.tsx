import { useState } from 'react'
import { useNavigate, useParams } from 'react-router-dom'
import { CheckSquare, Clock, Calendar, AlertCircle, ClipboardList } from 'lucide-react'

type DetailTab = 'attendance' | 'leave'

interface AttendanceRow {
  date: string
  day: string
  clockIn: string
  clockOut: string
  totalHours: string
  status: 'Present' | 'Late' | 'Absent'
}

interface LeaveRow {
  leaveType: string
  from: string
  to: string
  days: number
  requestedOn: string
  status: 'Approved' | 'Pending'
}

function AttendanceStatusBadge({ status }: { status: AttendanceRow['status'] }) {
  const cls =
    status === 'Present'
      ? 'border-green-200 text-green-700 bg-green-50'
      : status === 'Late'
      ? 'border-amber-200 text-amber-700 bg-amber-50'
      : 'border-red-200 text-red-600 bg-red-50'
  return (
    <span className={`text-xs border rounded-full px-2.5 py-0.5 font-medium ${cls}`}>
      {status}
    </span>
  )
}

function LeaveStatusBadge({ status }: { status: LeaveRow['status'] }) {
  const cls =
    status === 'Approved'
      ? 'border-green-200 text-green-700 bg-green-50'
      : 'border-amber-200 text-amber-700 bg-amber-50'
  return (
    <span className={`text-xs border rounded-full px-2.5 py-0.5 font-medium ${cls}`}>
      {status}
    </span>
  )
}

export default function HrOpsEmployeeDetail() {
  const navigate = useNavigate()
  const { id } = useParams<{ id: string }>()
  const [activeTab, setActiveTab] = useState<DetailTab>('attendance')
  const [attendanceData] = useState<AttendanceRow[]>([])
  const [leaveData] = useState<LeaveRow[]>([])

  return (
    <div className="px-8 py-6">
      {/* Header */}
      <div className="flex items-start justify-between mb-6">
        <div>
          <button
            onClick={() => navigate('/employer/hr-ops')}
            className="text-sm text-[#22c55e] hover:text-green-700 mb-3 flex items-center gap-1"
          >
            ← Back to HR operations
          </button>
          <h1 className="text-2xl font-bold text-gray-900">Employee #{id} — Attendance history</h1>
          <p className="text-sm text-gray-500 mt-1">
            Attendance and leave records
          </p>
        </div>
        <button className="px-4 py-2 text-sm text-gray-600 border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors">
          Export
        </button>
      </div>

      {/* Stat cards */}
      <div className="grid grid-cols-4 gap-4 mb-6">
        {[
          { label: 'Total days worked', value: '0', icon: CheckSquare, iconCls: 'text-green-500',  bg: 'bg-green-50'  },
          { label: 'On time',           value: '0', icon: Clock,        iconCls: 'text-blue-500',   bg: 'bg-blue-50'   },
          { label: 'Late arrivals',     value: '0', icon: Calendar,     iconCls: 'text-amber-500',  bg: 'bg-amber-50'  },
          { label: 'Absent',            value: '0', icon: AlertCircle,  iconCls: 'text-red-400',    bg: 'bg-red-50'    },
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

      {/* Tabs */}
      <div className="flex items-center border-b border-gray-200 mb-6">
        {(['attendance', 'leave'] as DetailTab[]).map(tab => (
          <button
            key={tab}
            onClick={() => setActiveTab(tab)}
            className={`px-5 py-2.5 text-sm font-medium -mb-px capitalize transition-colors ${
              activeTab === tab
                ? 'border-b-2 border-gray-900 text-gray-900'
                : 'border-b-2 border-transparent text-gray-500 hover:text-gray-700'
            }`}
          >
            {tab === 'attendance' ? 'Attendance' : 'Leave requests'}
          </button>
        ))}
      </div>

      {/* Attendance tab */}
      {activeTab === 'attendance' && (
        <div className="bg-white rounded-xl border border-gray-100 shadow-sm overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="bg-gray-50 border-b border-gray-100">
                  {['Date', 'Day', 'Clock in', 'Clock out', 'Total hours', 'Status'].map(col => (
                    <th key={col} className="text-left px-6 py-3 text-xs font-semibold text-gray-500 uppercase tracking-wide whitespace-nowrap">
                      {col}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100">
                {attendanceData.map((row, i) => (
                  <tr key={i} className="hover:bg-gray-50 transition-colors">
                    <td className="px-6 py-4 text-gray-900 whitespace-nowrap font-medium">{row.date}</td>
                    <td className="px-6 py-4 text-gray-500 whitespace-nowrap">{row.day}</td>
                    <td className="px-6 py-4 text-gray-600 whitespace-nowrap">{row.clockIn}</td>
                    <td className="px-6 py-4 text-gray-600 whitespace-nowrap">{row.clockOut}</td>
                    <td className="px-6 py-4 text-gray-600 whitespace-nowrap">{row.totalHours}</td>
                    <td className="px-6 py-4"><AttendanceStatusBadge status={row.status} /></td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {attendanceData.length === 0 && (
            <div className="flex flex-col items-center justify-center py-16 text-center">
              <ClipboardList size={40} className="text-gray-300 mb-3" />
              <p className="text-sm font-medium text-gray-500">No attendance records</p>
              <p className="text-xs text-gray-400 mt-1">Records will appear as the employee clocks in</p>
            </div>
          )}
        </div>
      )}

      {/* Leave requests tab */}
      {activeTab === 'leave' && (
        <div className="bg-white rounded-xl border border-gray-100 shadow-sm overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="bg-gray-50 border-b border-gray-100">
                  {['Leave type', 'From', 'To', 'Days', 'Requested on', 'Status', 'Actions'].map(col => (
                    <th key={col} className="text-left px-6 py-3 text-xs font-semibold text-gray-500 uppercase tracking-wide whitespace-nowrap">
                      {col}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100">
                {leaveData.map((row, i) => (
                  <tr key={i} className="hover:bg-gray-50 transition-colors">
                    <td className="px-6 py-4 text-gray-900 whitespace-nowrap font-medium">{row.leaveType}</td>
                    <td className="px-6 py-4 text-gray-600 whitespace-nowrap">{row.from}</td>
                    <td className="px-6 py-4 text-gray-600 whitespace-nowrap">{row.to}</td>
                    <td className="px-6 py-4 text-gray-600 whitespace-nowrap">{row.days}</td>
                    <td className="px-6 py-4 text-gray-600 whitespace-nowrap">{row.requestedOn}</td>
                    <td className="px-6 py-4"><LeaveStatusBadge status={row.status} /></td>
                    <td className="px-6 py-4">
                      <button className="text-sm text-gray-600 hover:text-gray-900 transition-colors">
                        View
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {leaveData.length === 0 && (
            <div className="flex flex-col items-center justify-center py-16 text-center">
              <Calendar size={40} className="text-gray-300 mb-3" />
              <p className="text-sm font-medium text-gray-500">No leave requests</p>
              <p className="text-xs text-gray-400 mt-1">Leave requests will appear here once submitted</p>
            </div>
          )}
        </div>
      )}
    </div>
  )
}
