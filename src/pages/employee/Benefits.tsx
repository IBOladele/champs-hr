import { Gift, ChevronRight } from 'lucide-react'

type BenefitStatus = 'Active' | 'Pending' | 'Inactive'
type SideSection = 'plans' | 'dependants'

interface BenefitItem {
  name: string
  provider: string
  dependants: number
  coverage: string
  renewalDate: string
  status: BenefitStatus
}

const benefits: BenefitItem[] = [
  { name: 'Dental plan premium',  provider: 'Meyers Inc', dependants: 2, coverage: '$5,000/yr',  renewalDate: 'Jan 1, 2026',  status: 'Active'   },
  { name: 'Dental plan premium',  provider: 'Meyers Inc', dependants: 2, coverage: '$5,000/yr',  renewalDate: 'Jan 1, 2026',  status: 'Active'   },
  { name: 'Dental plan premium',  provider: 'Meyers Inc', dependants: 2, coverage: '$5,000/yr',  renewalDate: 'Mar 1, 2026',  status: 'Pending'  },
  { name: 'Health Insurance',     provider: 'BlueCross',  dependants: 3, coverage: '$20,000/yr', renewalDate: 'Jun 1, 2026',  status: 'Active'   },
  { name: 'Life Insurance',       provider: 'AXA Group',  dependants: 0, coverage: '$50,000',    renewalDate: 'Dec 1, 2025',  status: 'Active'   },
  { name: 'Gym Membership',       provider: 'Fitness Co', dependants: 0, coverage: 'Unlimited',  renewalDate: 'Feb 1, 2026',  status: 'Inactive' },
]

function StatusPill({ status }: { status: BenefitStatus }) {
  const cls =
    status === 'Active'
      ? 'bg-green-100 text-green-700'
      : status === 'Pending'
      ? 'bg-amber-100 text-amber-700'
      : 'bg-gray-100 text-gray-500'
  return (
    <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${cls}`}>
      {status}
    </span>
  )
}

import { useState } from 'react'

export default function Benefits() {
  const [activeSection, setActiveSection] = useState<SideSection>('plans')

  const sidebarItems: { key: SideSection; label: string; sub: string }[] = [
    { key: 'plans',     label: 'Benefit plans',         sub: 'This is the list of benefits that the employer qualifies for' },
    { key: 'dependants', label: 'Dependant information', sub: 'Manage your dependant details here' },
  ]

  return (
    <div className="px-8 py-6">
      <h1 className="text-2xl font-bold text-gray-900 mb-6">Benefits</h1>

      <div className="flex gap-5">
        {/* Sidebar */}
        <div className="w-56 flex-shrink-0 space-y-1">
          {sidebarItems.map(item => (
            <button
              key={item.key}
              onClick={() => setActiveSection(item.key)}
              className={`w-full text-left px-4 py-3 rounded-lg transition-colors ${
                activeSection === item.key
                  ? 'bg-gray-900 text-white'
                  : 'text-gray-600 hover:bg-gray-100'
              }`}
            >
              <p className={`text-sm font-medium ${activeSection === item.key ? 'text-white' : 'text-gray-900'}`}>
                {item.label}
              </p>
            </button>
          ))}
        </div>

        {/* Content */}
        <div className="flex-1">
          {activeSection === 'plans' && (
            <div className="bg-white rounded-lg border border-gray-100 shadow-sm overflow-hidden">
              <div className="px-6 py-4 border-b border-gray-100">
                <h2 className="text-sm font-semibold text-gray-900">Benefit plans</h2>
                <p className="text-xs text-gray-400 mt-0.5">This is the list of benefits that the employer qualifies for</p>
              </div>
              <div className="divide-y divide-gray-100">
                {benefits.map((item, i) => (
                  <div key={i} className="flex items-center justify-between px-6 py-4 hover:bg-gray-50 transition-colors">
                    <div className="flex items-center gap-4">
                      <div className="w-10 h-10 bg-green-50 rounded-xl flex items-center justify-center flex-shrink-0">
                        <Gift size={18} className="text-green-600" />
                      </div>
                      <div>
                        <p className="text-sm font-medium text-gray-900">{item.name}</p>
                        <p className="text-xs text-gray-400 mt-0.5">
                          {item.provider} · {item.dependants > 0 ? `${item.dependants} dependants` : 'No dependants'}
                        </p>
                      </div>
                    </div>
                    <div className="flex items-center gap-8">
                      <div className="text-center">
                        <p className="text-xs text-gray-400">Coverage</p>
                        <p className="text-sm font-medium text-gray-700">{item.coverage}</p>
                      </div>
                      <div className="text-center">
                        <p className="text-xs text-gray-400">Renewal date</p>
                        <p className="text-sm font-medium text-gray-700">{item.renewalDate}</p>
                      </div>
                      <StatusPill status={item.status} />
                      <button className="flex items-center gap-1 text-sm text-gray-500 hover:text-gray-700">
                        View details <ChevronRight size={14} />
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {activeSection === 'dependants' && (
            <div className="bg-white rounded-lg border border-gray-100 shadow-sm px-6 py-5">
              <h2 className="text-sm font-semibold text-gray-900 mb-1">Dependant information</h2>
              <p className="text-xs text-gray-400">Manage your dependant details here.</p>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
