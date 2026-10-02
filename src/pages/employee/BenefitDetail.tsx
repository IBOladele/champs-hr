import { useState } from 'react'
import { useNavigate, useParams } from 'react-router-dom'
import { ArrowLeft, Gift, Download } from 'lucide-react'

interface ClaimRow {
  date: string
  description: string
  amount: string
  status: 'Approved' | 'Pending' | 'Rejected'
}

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
  const [claims] = useState<ClaimRow[]>([])

  // planId must match a known plan — otherwise show not-found state
  const knownPlans: Record<string, string> = {
    health:  'Health Plan',
    '401k':  '401(k) Plan',
    leave:   'Paid Time Off',
    dental:  'Dental Plan',
  }

  const planTitle = planId && knownPlans[planId] ? knownPlans[planId] : null

  if (!planTitle) {
    return (
      <div className="">
        <button
          onClick={() => navigate('/employee/benefits')}
          className="flex items-center gap-1.5 text-sm text-[#22c55e] font-medium hover:text-green-700 mb-4"
        >
          <ArrowLeft size={14} /> Back to benefits
        </button>
        <div className="bg-white rounded-xl border border-gray-100 shadow-sm p-16 flex flex-col items-center justify-center text-center">
          <Gift size={48} className="text-gray-300 mb-4" />
          <p className="text-base font-semibold text-gray-700">Plan not found</p>
          <p className="text-sm text-gray-400 mt-1 mb-6">This benefit plan does not exist or you are not enrolled.</p>
          <button
            onClick={() => navigate('/employee/benefits')}
            className="px-4 py-2 bg-gray-900 text-white text-sm font-medium rounded-lg hover:bg-gray-800 transition-colors"
          >
            Back to benefits
          </button>
        </div>
      </div>
    )
  }

  return (
    <div className="">
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
          <p className="text-sm text-gray-500 mt-0.5">Provider: —</p>
          <span className="inline-flex items-center mt-2 px-2.5 py-0.5 rounded-full text-xs font-medium bg-gray-100 text-gray-500">
            No data
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
              { label: 'Coverage',              value: '—' },
              { label: 'Start date',            value: '—' },
              { label: 'Renewal date',          value: '—' },
              { label: 'Monthly premium',       value: '—' },
              { label: 'Employer contribution', value: '—' },
              { label: 'Employee contribution', value: '—' },
              { label: 'Policy number',         value: '—' },
            ].map(({ label, value }) => (
              <div key={label} className="flex justify-between text-sm">
                <span className="text-gray-500">{label}</span>
                <span className="font-medium text-gray-400">{value}</span>
              </div>
            ))}
          </div>
        </div>

        {/* Coverage includes */}
        <div className="bg-white rounded-xl border border-gray-100 shadow-sm p-6">
          <h3 className="text-sm font-semibold text-gray-900 mb-4">Coverage includes</h3>
          <div className="flex flex-col items-center justify-center py-8 text-center">
            <Gift size={32} className="text-gray-300 mb-2" />
            <p className="text-sm text-gray-500">No coverage details available</p>
          </div>
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
          {claims.length === 0 && (
            <div className="flex flex-col items-center justify-center py-16 text-center">
              <Gift size={40} className="text-gray-300 mb-3" />
              <p className="text-sm font-medium text-gray-500">No claims yet</p>
              <p className="text-xs text-gray-400 mt-1">Claims you submit will appear here</p>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
