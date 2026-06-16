import { useState } from 'react'
import { Search, ChevronDown } from 'lucide-react'

type SubTab = 'Benefit plans' | 'Benefit sync' | 'Benefit requests'
type BenefitStatus = 'Active' | 'Inactive' | 'Disable'

interface Benefit {
  id: string
  dateCreated: string
  provider: string
  providerInitial: string
  providerColor: string
  planName: string
  monthlyCost: string
  documentRequired: boolean
  status: BenefitStatus
}

const subTabs: SubTab[] = ['Benefit plans', 'Benefit sync', 'Benefit requests']

const benefits: Benefit[] = [
  { id: '1', dateCreated: 'Jan 1, 2025',  provider: 'John Insurance', providerInitial: 'J', providerColor: 'bg-yellow-400', planName: 'Valucar/Silver',         monthlyCost: '$995,457', documentRequired: true,  status: 'Active'   },
  { id: '2', dateCreated: 'Feb 14, 2025', provider: 'Lada care',      providerInitial: 'L', providerColor: 'bg-blue-400',   planName: 'Dental plan Fn',         monthlyCost: '$925,457', documentRequired: false, status: 'Inactive' },
  { id: '3', dateCreated: 'Feb 14, 2025', provider: 'Kaya health',    providerInitial: 'K', providerColor: 'bg-green-500',  planName: 'Life Insurance Basic',   monthlyCost: '$995,457', documentRequired: false, status: 'Active'   },
  { id: '4', dateCreated: 'Feb 14, 2025', provider: 'Kaya health',    providerInitial: 'K', providerColor: 'bg-green-500',  planName: 'Disability Adv.',        monthlyCost: '$995,457', documentRequired: false, status: 'Disable'  },
  { id: '5', dateCreated: 'Feb 14, 2025', provider: 'Kaya health',    providerInitial: 'K', providerColor: 'bg-green-500',  planName: 'Retirement Gold 401k',   monthlyCost: '$995,457', documentRequired: false, status: 'Disable'  },
  { id: '6', dateCreated: 'Feb 14, 2025', provider: 'Kaya health',    providerInitial: 'K', providerColor: 'bg-green-500',  planName: 'PTO Enhanced',           monthlyCost: '$995,457', documentRequired: false, status: 'Disable'  },
  { id: '7', dateCreated: 'Feb 14, 2025', provider: 'Kaya health',    providerInitial: 'K', providerColor: 'bg-green-500',  planName: 'Wellness Platinum',      monthlyCost: '$905,457', documentRequired: false, status: 'Inactive' },
  { id: '8', dateCreated: 'Feb 14, 2025', provider: 'Kaya health',    providerInitial: 'K', providerColor: 'bg-green-500',  planName: 'Wellness Platinum',      monthlyCost: '$905,457', documentRequired: false, status: 'Inactive' },
]

function StatusPill({ status }: { status: BenefitStatus }) {
  const cls =
    status === 'Active'
      ? 'bg-green-100 text-green-700'
      : status === 'Inactive'
      ? 'bg-amber-100 text-amber-700'
      : 'bg-red-100 text-red-600'
  return (
    <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${cls}`}>
      {status}
    </span>
  )
}

export default function Benefits() {
  const [activeTab, setActiveTab] = useState<SubTab>('Benefit plans')
  const [search, setSearch] = useState('')

  const filtered = benefits.filter((b) =>
    b.planName.toLowerCase().includes(search.toLowerCase()) ||
    b.provider.toLowerCase().includes(search.toLowerCase()),
  )

  return (
    <div className="px-8 py-6">
      {/* Page heading */}
      <h1 className="text-2xl font-bold text-gray-900 mb-6">Benefits</h1>

      {/* Sub-tabs */}
      <div className="flex items-center border-b border-gray-200 mb-6">
        {subTabs.map((tab) => (
          <button
            key={tab}
            onClick={() => setActiveTab(tab)}
            className={`px-5 py-2.5 text-sm -mb-px transition-colors ${
              activeTab === tab
                ? 'border-b-2 border-gray-900 text-gray-900 font-medium'
                : 'border-b-2 border-transparent text-gray-500 hover:text-gray-700'
            }`}
          >
            {tab}
          </button>
        ))}
      </div>

      {/* Section heading + Add button */}
      <div className="flex items-center justify-between mb-5">
        <h2 className="text-base font-semibold text-gray-900">Your benefit plans</h2>
        <button className="bg-[#22c55e] text-white px-4 py-2 rounded-lg text-sm font-medium hover:bg-green-600 transition-colors">
          + Create benefit plan
        </button>
      </div>

      {/* Filter row */}
      <div className="flex items-center gap-3 mb-4">
        <div className="relative flex-1 max-w-xs">
          <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
          <input
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search benefits..."
            className="w-full pl-9 pr-3 py-2 text-sm border border-gray-200 rounded-lg focus:outline-none focus:border-[#22c55e]"
          />
        </div>
        <button className="flex items-center gap-2 px-4 py-2 text-sm text-gray-600 border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors">
          Filter
          <ChevronDown size={14} />
        </button>
      </div>

      {/* Counter */}
      <p className="text-sm text-gray-500 mb-4">{filtered.length} benefits</p>

      {/* Table */}
      <div className="bg-white rounded-xl border border-gray-100 shadow-sm overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="bg-gray-50 border-b border-gray-100">
                {['Date created', 'Benefit provider', 'Plan name', 'Monthly cost', 'Document required', 'Status', 'Actions'].map(col => (
                  <th key={col} className="text-left px-6 py-3 text-xs font-semibold text-gray-500 uppercase tracking-wide whitespace-nowrap">
                    {col}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {filtered.map((benefit) => (
                <tr key={benefit.id} className="hover:bg-gray-50 transition-colors">
                  <td className="px-6 py-4 text-gray-600 whitespace-nowrap">{benefit.dateCreated}</td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="flex items-center gap-2">
                      <div className={`w-6 h-6 rounded-full ${benefit.providerColor} flex items-center justify-center text-white text-xs font-semibold flex-shrink-0`}>
                        {benefit.providerInitial}
                      </div>
                      <span className="text-gray-700">{benefit.provider}</span>
                    </div>
                  </td>
                  <td className="px-6 py-4 font-medium text-gray-900 whitespace-nowrap">{benefit.planName}</td>
                  <td className="px-6 py-4 text-gray-600 whitespace-nowrap">{benefit.monthlyCost}</td>
                  <td className="px-6 py-4 text-gray-600 whitespace-nowrap">
                    {benefit.documentRequired ? 'Yes' : 'No'}
                  </td>
                  <td className="px-6 py-4">
                    <StatusPill status={benefit.status} />
                  </td>
                  <td className="px-6 py-4">
                    <div className="flex items-center gap-3">
                      <button className="flex items-center gap-1 text-xs text-gray-600 hover:text-gray-900">
                        ↳ View
                      </button>
                      <button className="flex items-center gap-1 text-xs text-gray-600 hover:text-gray-900">
                        ✎ Edit
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>

          {filtered.length === 0 && (
            <div className="text-center py-12 text-gray-400">
              <p className="text-sm">No benefits found.</p>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
