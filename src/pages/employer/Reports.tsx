import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { Users, DollarSign, Gift, Calendar, Umbrella, Lock } from 'lucide-react'

type SubTab = 'All reports' | 'My reports'

interface ReportCard {
  title: string
  icon: React.ReactNode
  iconBg: string
}

const subTabs: SubTab[] = ['All reports', 'My reports']

const reportCards: ReportCard[] = [
  {
    title: 'Employees report',
    icon: <Users size={18} className="text-[#22c55e]" />,
    iconBg: 'bg-green-100',
  },
  {
    title: 'Payroll reports',
    icon: <DollarSign size={18} className="text-blue-500" />,
    iconBg: 'bg-blue-100',
  },
  {
    title: 'Benefits report',
    icon: <Gift size={18} className="text-orange-500" />,
    iconBg: 'bg-orange-100',
  },
  {
    title: 'Attendance report',
    icon: <Calendar size={18} className="text-red-500" />,
    iconBg: 'bg-red-100',
  },
  {
    title: 'Leave report',
    icon: <Umbrella size={18} className="text-teal-500" />,
    iconBg: 'bg-teal-100',
  },
  {
    title: 'User access',
    icon: <Lock size={18} className="text-purple-500" />,
    iconBg: 'bg-purple-100',
  },
]

const myReportCards = [
  { title: 'Q1 Payroll Summary', subtitle: 'Payroll · Jan – Mar 2025' },
  { title: 'Annual Leave Analysis', subtitle: 'Leave · FY 2024' },
  { title: 'Headcount Report', subtitle: 'Employees · Q4 2024' },
]

export default function Reports() {
  const navigate = useNavigate()
  const [activeTab, setActiveTab] = useState<SubTab>('All reports')

  return (
    <div className="px-8 py-6">
      {/* Page heading + Create button */}
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-2xl font-bold text-gray-900">Reports</h1>
        <button
          onClick={() => navigate('/employer/reports/create')}
          className="bg-[#22c55e] text-white px-4 py-2 rounded-lg text-sm font-medium hover:bg-green-600 transition-colors"
        >
          + Create reports
        </button>
      </div>

      {/* Sub-tabs */}
      <div className="flex items-center border-b border-gray-200 mb-6">
        {subTabs.map((tab) => (
          <button
            key={tab}
            onClick={() => setActiveTab(tab)}
            className={`px-5 py-2.5 text-sm -mb-px transition-colors ${
              activeTab === tab
                ? 'border-b-2 border-gray-900 text-gray-900 font-medium'
                : 'text-gray-500 hover:text-gray-700'
            }`}
          >
            {tab}
          </button>
        ))}
      </div>

      {activeTab === 'All reports' && (
        <>
          {/* Sub-section heading */}
          <h2 className="text-base font-semibold text-gray-900 mb-5">All reports</h2>

          {/* Card grid — 3 columns × 2 rows */}
          <div className="grid grid-cols-3 gap-5">
            {reportCards.map((card) => (
              <div
                key={card.title}
                className="bg-white rounded-xl border border-gray-100 p-6 shadow-sm flex flex-col gap-4"
              >
                {/* Icon */}
                <div className={`w-10 h-10 rounded-lg ${card.iconBg} flex items-center justify-center`}>
                  {card.icon}
                </div>
                {/* Title */}
                <p className="text-sm font-semibold text-gray-900">{card.title}</p>
                {/* Link */}
                <button
                  onClick={() => navigate('/employer/reports/create')}
                  className="text-sm text-[#22c55e] font-medium hover:underline text-left mt-auto"
                >
                  + Create report
                </button>
              </div>
            ))}
          </div>
        </>
      )}

      {activeTab === 'My reports' && (
        <>
          {/* Sub-section heading */}
          <h2 className="text-base font-semibold text-gray-900 mb-5">My reports</h2>

          {/* Saved report cards */}
          <div className="grid grid-cols-3 gap-5">
            {myReportCards.map((card) => (
              <div
                key={card.title}
                className="bg-white rounded-xl border border-gray-100 p-6 shadow-sm flex flex-col gap-3"
              >
                <div className="w-10 h-10 rounded-lg bg-gray-100 flex items-center justify-center">
                  <Users size={18} className="text-gray-500" />
                </div>
                <div>
                  <p className="text-sm font-semibold text-gray-900">{card.title}</p>
                  <p className="text-xs text-gray-500 mt-0.5">{card.subtitle}</p>
                </div>
                <div className="flex items-center gap-4 mt-auto pt-2 border-t border-gray-100">
                  <button className="text-sm text-[#22c55e] font-medium hover:underline">
                    View
                  </button>
                  <button className="text-sm text-gray-500 font-medium hover:underline">
                    Customize
                  </button>
                </div>
              </div>
            ))}
          </div>
        </>
      )}
    </div>
  )
}
