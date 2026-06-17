import { useNavigate, useParams } from 'react-router-dom'
import { ArrowLeft, CheckCircle2, Download } from 'lucide-react'

const planTitles: Record<string, string> = {
  health:  'Health Plan',
  pension: 'Pension Plan',
  leave:   'Paid Time Off',
}

const coverageItems = [
  'GP visits',
  'Specialist consultations',
  'Hospital stays',
  'Dental (basic)',
  'Prescription drugs',
  'Mental health support',
  'Emergency abroad',
]

interface ClaimRow {
  date: string
  description: string
  amount: string
  status: 'Approved' | 'Pending' | 'Rejected'
}

const claims: ClaimRow[] = [
  { date: 'Jun 2025', description: 'GP visit',     amount: '£45.00',  status: 'Approved' },
  { date: 'Mar 2025', description: 'Specialist',   amount: '£200.00', status: 'Approved' },
  { date: 'Jan 2025', description: 'Prescription', amount: '£18.50',  status: 'Approved' },
]

function ClaimStatusPill({ status }: { status: ClaimRow['status'] }) {
  const cls =
    status === 'Approved'  ? 'bg-green-100 text-green-700'
    : status === 'Pending' ? 'bg-amber-100 text-amber-700'
    :                        'bg-red-100 text-red-700'
  return (
    <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${cls}`}>
      {status}
    </span>
  )
}

export default function BenefitDetail() {
  const navigate = useNavigate()
  const { planId } = useParams<{ planId: string }>()

  const planTitle = planId && planTitles[planId] ? planTitles[planId] : 'Benefit Plan'

  return (
    <div className="px-8 py-6">
      {/* Header */}
      <div className="mb-6">
        <button
          onClick={() => navigate('/employee/benefits')}
          className="flex items-center gap-1.5 text-sm text-[#22c55e] font-medium hover:text-green-700 mb-2"
        >
          <ArrowLeft size={14} /> Back to benefits
        </button>
        <h1 className="text-2xl font-bold text-gray-900">{planTitle}</h1>
      </div>

      {/* Plan header card */}
      <div className="bg-white rounded-xl border border-gray-100 shadow-sm p-6 mb-5 flex items-center justify-between">
        <div>
          <h2 className="text-xl font-bold text-gray-900">{planTitle}</h2>
          <p className="text-sm text-gray-500 mt-0.5">Provider: Aviva</p>
          <span className="inline-flex items-center mt-2 px-2.5 py-0.5 rounded-full text-xs font-medium bg-green-100 text-green-700">
            Active
          </span>
        </div>
        <button className="flex items-center gap-2 border border-gray-200 text-gray-700 px-4 py-2 rounded-lg text-sm font-medium hover:bg-gray-50 transition-colors">
          <Download size={14} /> Download policy document
        </button>
      </div>

      {/* Two-column layout */}
      <div className="grid grid-cols-2 gap-5 mb-5">
        {/* Plan details */}
        <div className="bg-white rounded-xl border border-gray-100 shadow-sm p-6">
          <h3 className="text-sm font-semibold text-gray-900 mb-4">Plan details</h3>
          <div className="space-y-3">
            {[
              { label: 'Coverage',              value: 'Employee + Family' },
              { label: 'Start date',            value: '1st January 2025' },
              { label: 'Renewal date',          value: '31st December 2025' },
              { label: 'Monthly premium',       value: '£120' },
              { label: 'Employer contribution', value: '£96' },
              { label: 'Employee contribution', value: '£24' },
              { label: 'Policy number',         value: 'AVV-2025-SM-4821' },
            ].map(({ label, value }) => (
              <div key={label} className="flex justify-between text-sm">
                <span className="text-gray-500">{label}</span>
                <span className="font-medium text-gray-900">{value}</span>
              </div>
            ))}
          </div>
        </div>

        {/* Coverage includes */}
        <div className="bg-white rounded-xl border border-gray-100 shadow-sm p-6">
          <h3 className="text-sm font-semibold text-gray-900 mb-4">Coverage includes</h3>
          <ul className="space-y-2.5">
            {coverageItems.map(item => (
              <li key={item} className="flex items-center gap-2.5 text-sm text-gray-700">
                <CheckCircle2 size={16} className="text-[#22c55e] flex-shrink-0" />
                {item}
              </li>
            ))}
          </ul>
        </div>
      </div>

      {/* Claims history */}
      <div className="bg-white rounded-xl border border-gray-100 shadow-sm overflow-hidden">
        <div className="px-6 py-4 border-b border-gray-100">
          <h3 className="text-sm font-semibold text-gray-900">Claims history</h3>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="bg-gray-50 border-b border-gray-100">
                {['Date', 'Description', 'Amount', 'Status'].map(col => (
                  <th key={col} className="text-left px-6 py-3 text-xs font-semibold text-gray-500 uppercase tracking-wide whitespace-nowrap">
                    {col}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {claims.map((row, i) => (
                <tr key={i} className="hover:bg-gray-50 transition-colors">
                  <td className="px-6 py-4 text-gray-600 whitespace-nowrap">{row.date}</td>
                  <td className="px-6 py-4 font-medium text-gray-900 whitespace-nowrap">{row.description}</td>
                  <td className="px-6 py-4 text-gray-700 whitespace-nowrap">{row.amount}</td>
                  <td className="px-6 py-4"><ClaimStatusPill status={row.status} /></td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  )
}
