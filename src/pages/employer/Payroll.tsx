import { useState } from 'react'
import {
  Download, Plus, ChevronDown, MoreHorizontal,
  ChevronLeft, ChevronRight, PoundSterling, Users, Clock, Calendar
} from 'lucide-react'

type PayTab = 'cycle' | 'employees' | 'components'
type CycleStatus = 'Completed' | 'Pending' | 'Processing'

interface PayCycle {
  id: string
  cycleMonth: string
  payDate: string
  numEmployees: number | null
  totalGross: string | null
  totalNet: string | null
  status: CycleStatus
}

const payCycles: PayCycle[] = [
  {
    id: '1',
    cycleMonth: 'November 2024',
    payDate: 'Nov 30, 2024',
    numEmployees: 231,
    totalGross: '£52,340',
    totalNet: '£48,250',
    status: 'Completed',
  },
  {
    id: '2',
    cycleMonth: 'October 2024',
    payDate: 'Oct 31, 2024',
    numEmployees: 228,
    totalGross: '£51,890',
    totalNet: '£47,800',
    status: 'Completed',
  },
  {
    id: '3',
    cycleMonth: 'September 2024',
    payDate: 'Sep 30, 2024',
    numEmployees: 225,
    totalGross: '£50,720',
    totalNet: '£46,660',
    status: 'Completed',
  },
  {
    id: '4',
    cycleMonth: 'August 2024',
    payDate: 'Aug 31, 2024',
    numEmployees: 225,
    totalGross: '£50,320',
    totalNet: '£46,295',
    status: 'Completed',
  },
  {
    id: '5',
    cycleMonth: 'December 2024',
    payDate: 'Dec 31, 2024',
    numEmployees: 231,
    totalGross: null,
    totalNet: null,
    status: 'Pending',
  },
]

const statCards = [
  {
    label: 'Total payroll',
    value: '£48,250',
    sub: 'this month',
    icon: <PoundSterling size={18} className="text-emerald-600" />,
    iconBg: 'bg-emerald-50',
  },
  {
    label: 'Employees paid',
    value: '231',
    sub: null,
    icon: <Users size={18} className="text-blue-600" />,
    iconBg: 'bg-blue-50',
  },
  {
    label: 'Pending approvals',
    value: '3',
    sub: null,
    icon: <Clock size={18} className="text-amber-600" />,
    iconBg: 'bg-amber-50',
  },
  {
    label: 'Next pay date',
    value: 'Dec 31, 2024',
    sub: null,
    icon: <Calendar size={18} className="text-purple-600" />,
    iconBg: 'bg-purple-50',
  },
]

const payTabs: { key: PayTab; label: string }[] = [
  { key: 'cycle', label: 'Pay cycle' },
  { key: 'employees', label: 'Employees' },
  { key: 'components', label: 'Pay components' },
]

function StatusPill({ status }: { status: CycleStatus }) {
  if (status === 'Completed') {
    return (
      <span className="inline-flex items-center bg-emerald-50 text-emerald-700 rounded-full px-2 py-0.5 text-xs font-medium">
        Completed
      </span>
    )
  }
  if (status === 'Pending') {
    return (
      <span className="inline-flex items-center bg-amber-50 text-amber-700 rounded-full px-2 py-0.5 text-xs font-medium">
        Pending
      </span>
    )
  }
  if (status === 'Processing') {
    return (
      <span className="inline-flex items-center bg-blue-50 text-blue-700 rounded-full px-2 py-0.5 text-xs font-medium">
        Processing
      </span>
    )
  }
  return null
}

export default function Payroll() {
  const [activeTab, setActiveTab] = useState<PayTab>('cycle')

  return (
    <div className="max-w-7xl mx-auto">
      {/* Page title */}
      <h1 className="text-2xl font-bold text-gray-900 mb-6">Payroll</h1>

      {/* Stat cards */}
      <div className="grid grid-cols-4 gap-4 mb-6">
        {statCards.map((card) => (
          <div
            key={card.label}
            className="bg-white rounded-lg p-4 border border-gray-200"
          >
            <div className="flex items-center gap-3 mb-3">
              <div className={`w-8 h-8 rounded-lg flex items-center justify-center ${card.iconBg}`}>
                {card.icon}
              </div>
            </div>
            <p className="text-2xl font-bold text-gray-900">{card.value}</p>
            <div className="flex items-center gap-1 mt-0.5">
              <p className="text-sm text-gray-500">{card.label}</p>
              {card.sub && (
                <p className="text-sm text-gray-400">{card.sub}</p>
              )}
            </div>
          </div>
        ))}
      </div>

      {/* Sub-tabs */}
      <div className="flex items-center gap-0 border-b border-gray-200 mb-5">
        {payTabs.map((tab) => (
          <button
            key={tab.key}
            onClick={() => setActiveTab(tab.key)}
            className={`px-4 py-2.5 text-sm font-medium border-b-2 transition-colors ${
              activeTab === tab.key
                ? 'border-emerald-500 text-emerald-600'
                : 'border-transparent text-gray-500 hover:text-gray-700'
            }`}
          >
            {tab.label}
          </button>
        ))}
      </div>

      {/* Action row */}
      <div className="flex items-center justify-between mb-5">
        {/* Left: Pay cycle dropdown */}
        <button className="flex items-center gap-2 px-3 py-2 text-sm border border-gray-200 rounded-lg text-gray-700 hover:bg-gray-50">
          <span>November 2024</span>
          <ChevronDown size={14} className="text-gray-400" />
        </button>

        {/* Right: action buttons */}
        <div className="flex items-center gap-3">
          <button className="flex items-center gap-2 px-3 py-2 text-sm border border-gray-200 rounded-lg text-gray-600 hover:bg-gray-50">
            <Download size={14} />
            Export
          </button>
          <button className="flex items-center gap-2 px-4 py-2 bg-emerald-500 hover:bg-emerald-600 text-white text-sm font-medium rounded-lg transition-colors">
            <Plus size={15} />
            New pay cycle
          </button>
        </div>
      </div>

      {/* Pay cycles table */}
      {activeTab === 'cycle' && (
        <>
          <div className="bg-white rounded-lg border border-gray-200 overflow-hidden">
            <table className="w-full">
              <thead>
                <tr className="bg-gray-50 border-b border-gray-200">
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wide">
                    Cycle month
                  </th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wide">
                    Pay date
                  </th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wide">
                    No of employees
                  </th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wide">
                    Total Gross
                  </th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wide">
                    Total Net
                  </th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wide">
                    Status
                  </th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wide">
                    Actions
                  </th>
                </tr>
              </thead>
              <tbody>
                {payCycles.map((cycle) => (
                  <tr
                    key={cycle.id}
                    className="border-b border-gray-100 hover:bg-gray-50 transition-colors"
                  >
                    {/* Cycle month */}
                    <td className="px-4 py-3.5 text-sm font-medium text-gray-800">
                      {cycle.cycleMonth}
                    </td>

                    {/* Pay date */}
                    <td className="px-4 py-3.5 text-sm text-gray-600">{cycle.payDate}</td>

                    {/* No of employees */}
                    <td className="px-4 py-3.5 text-sm text-gray-600">
                      {cycle.numEmployees ?? '—'}
                    </td>

                    {/* Total Gross */}
                    <td className="px-4 py-3.5 text-sm text-gray-600">
                      {cycle.totalGross ?? '—'}
                    </td>

                    {/* Total Net */}
                    <td className="px-4 py-3.5 text-sm text-gray-600">
                      {cycle.totalNet ?? '—'}
                    </td>

                    {/* Status */}
                    <td className="px-4 py-3.5">
                      <StatusPill status={cycle.status} />
                    </td>

                    {/* Actions */}
                    <td className="px-4 py-3.5">
                      <div className="flex items-center gap-2">
                        {cycle.status === 'Completed' && (
                          <button className="text-xs font-medium text-emerald-600 hover:text-emerald-700">
                            View
                          </button>
                        )}
                        {cycle.status === 'Pending' && (
                          <button className="text-xs font-medium text-emerald-600 hover:text-emerald-700">
                            Process
                          </button>
                        )}
                        <button className="p-1 rounded hover:bg-gray-100 text-gray-400 transition-colors">
                          <MoreHorizontal size={16} />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {/* Pagination */}
          <div className="flex items-center justify-between mt-4">
            <p className="text-sm text-gray-500">Showing 1-5 of 12</p>
            <div className="flex items-center gap-2">
              <button
                className="flex items-center gap-1 px-3 py-1.5 text-sm border border-gray-200 rounded-lg text-gray-600 hover:bg-gray-50 disabled:opacity-40 disabled:cursor-not-allowed"
                disabled
              >
                <ChevronLeft size={14} />
                Prev
              </button>
              <button className="flex items-center gap-1 px-3 py-1.5 text-sm border border-gray-200 rounded-lg text-gray-600 hover:bg-gray-50">
                Next
                <ChevronRight size={14} />
              </button>
            </div>
          </div>
        </>
      )}

      {/* Employees tab placeholder */}
      {activeTab === 'employees' && (
        <div className="bg-white rounded-lg border border-gray-200 p-16 text-center text-gray-400">
          <Users size={32} className="mx-auto mb-3 opacity-30" />
          <p className="text-sm">Employee pay details will appear here</p>
        </div>
      )}

      {/* Pay components tab placeholder */}
      {activeTab === 'components' && (
        <div className="bg-white rounded-lg border border-gray-200 p-16 text-center text-gray-400">
          <PoundSterling size={32} className="mx-auto mb-3 opacity-30" />
          <p className="text-sm">Pay components will appear here</p>
        </div>
      )}
    </div>
  )
}
