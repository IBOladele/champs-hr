import { useState } from 'react'
import {
  Building2, ShieldCheck, Coins, Wallet, Clock, CalendarDays,
  Pencil, ChevronDown, Plus
} from 'lucide-react'

type SidebarKey = 'organisation' | 'compliance' | 'compensation' | 'bank' | 'hours' | 'leave'
type MainTab = 'organization' | 'profile'

const sidebarItems: { key: SidebarKey; label: string; icon: React.ReactNode }[] = [
  { key: 'organisation', label: 'Organisation information', icon: <Building2 size={16} /> },
  { key: 'compliance', label: 'Compliance information', icon: <ShieldCheck size={16} /> },
  { key: 'compensation', label: 'Compensation', icon: <Coins size={16} /> },
  { key: 'bank', label: 'Bank details', icon: <Wallet size={16} /> },
  { key: 'hours', label: 'Working hours', icon: <Clock size={16} /> },
  { key: 'leave', label: 'Leave requests', icon: <CalendarDays size={16} /> },
]

function InputField({
  label,
  placeholder,
  hasDropdown = false,
}: {
  label: string
  placeholder?: string
  hasDropdown?: boolean
}) {
  return (
    <div>
      <label className="block text-xs font-medium text-gray-500 mb-1.5">{label}</label>
      <div className="relative">
        <input
          type="text"
          placeholder={placeholder}
          className="w-full px-3 py-2.5 text-sm border border-gray-200 rounded-lg focus:outline-none focus:border-[#2ecc71] pr-8"
        />
        {hasDropdown && (
          <ChevronDown
            size={14}
            className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 pointer-events-none"
          />
        )}
      </div>
    </div>
  )
}

function BankDetailsContent() {
  return (
    <div className="bg-white rounded-lg border border-gray-100 shadow-sm flex-1">
      {/* Header */}
      <div className="flex items-start justify-between px-6 py-5 border-b border-gray-100">
        <div>
          <h2 className="text-base font-semibold text-gray-900">Bank details</h2>
          <p className="text-xs text-gray-400 mt-0.5">
            Define your payment method you want to use for transactions
          </p>
        </div>
        <button className="flex items-center gap-1.5 px-3 py-2 border border-gray-200 rounded-lg text-xs font-medium text-gray-600 hover:bg-gray-50 flex-shrink-0">
          <Pencil size={12} />
          Edit information
        </button>
      </div>

      <div className="px-6 py-5">
        {/* Payment information section */}
        <p className="text-xs font-semibold text-gray-500 uppercase tracking-wide mb-4">
          Payment information
        </p>
        <div className="grid grid-cols-2 gap-4 mb-8">
          <InputField label="Bank name" placeholder="Enter your first name" hasDropdown />
          <InputField label="Account number" placeholder="Enter account number" />
          <InputField label="Bank country" placeholder="Select country" hasDropdown />
          <InputField label="Sort/Swift code" placeholder="Enter sort or swift code" />
          <InputField label="Routing number" placeholder="Enter routing number" hasDropdown />
          <InputField label="IBAN code" placeholder="Enter IBAN code" />
        </div>

        {/* Payment gateways section */}
        <p className="text-xs font-semibold text-gray-500 uppercase tracking-wide mb-4">
          Payment information
        </p>
        <div className="flex items-center justify-between p-4 border border-gray-100 rounded-lg">
          <div className="flex items-center gap-3">
            {/* Stripe "S" logo */}
            <div className="w-8 h-8 rounded-md bg-[#635BFF] flex items-center justify-center">
              <span className="text-white text-sm font-bold">S</span>
            </div>
            <span className="text-sm font-medium text-gray-800">Stripe payments</span>
          </div>
          <button className="flex items-center gap-1.5 px-3 py-1.5 border border-gray-200 rounded-lg text-xs font-medium text-gray-600 hover:bg-gray-50">
            <Plus size={12} />
            Connect App
          </button>
        </div>
      </div>
    </div>
  )
}

function OrganisationContent() {
  return (
    <div className="bg-white rounded-lg border border-gray-100 shadow-sm flex-1">
      {/* Header */}
      <div className="flex items-start justify-between px-6 py-5 border-b border-gray-100">
        <div>
          <h2 className="text-base font-semibold text-gray-900">Organisation information</h2>
          <p className="text-xs text-gray-400 mt-0.5">
            Learn more you will be. And also about your organisation settings here.
          </p>
        </div>
        <button className="flex items-center gap-1.5 px-3 py-2 border border-gray-200 rounded-lg text-xs font-medium text-gray-600 hover:bg-gray-50 flex-shrink-0">
          <Pencil size={12} />
          Edit information
        </button>
      </div>

      <div className="px-6 py-5">
        {/* Logo row */}
        <div className="flex items-center gap-3 mb-6">
          <div className="w-12 h-12 rounded-full bg-gray-200 flex items-center justify-center text-gray-600 text-sm font-semibold">
            NP
          </div>
          <button className="flex items-center gap-1.5 text-xs text-gray-500 hover:text-gray-700">
            <Pencil size={11} />
            Add brand logo
          </button>
        </div>

        {/* Form grid */}
        <div className="grid grid-cols-2 gap-x-6 gap-y-4">
          <InputField label="Company name" placeholder="Company name" />
          <InputField label="Country/state" placeholder="Country/state" />
          <InputField label="Business size" placeholder="Type your field here" hasDropdown />
          <InputField label="Industry" placeholder="Type your field here" hasDropdown />
          <InputField label="Company size" placeholder="Type your field here" hasDropdown />
          <InputField label="County" placeholder="Type your field here" hasDropdown />
          <InputField label="Timezone" placeholder="Type your field here" hasDropdown />
          <InputField label="Currency" placeholder="Type your field here" hasDropdown />
          <InputField label="Registered office Address" placeholder="Type address here" />
          <InputField label="Website address" placeholder="Type address here" />
        </div>
      </div>
    </div>
  )
}

function PlaceholderContent({ title }: { title: string }) {
  return (
    <div className="bg-white rounded-lg border border-gray-100 shadow-sm flex-1 px-6 py-5">
      <h2 className="text-base font-semibold text-gray-900 mb-1">{title}</h2>
      <p className="text-xs text-gray-400">Configure your {title.toLowerCase()} settings here.</p>
    </div>
  )
}

export default function Config() {
  const [mainTab, setMainTab] = useState<MainTab>('organization')
  const [activeSection, setActiveSection] = useState<SidebarKey>('organisation')

  return (
    <div className="px-8 py-6 max-w-6xl">
      {/* Page title */}
      <div className="mb-5">
        <h1 className="text-2xl font-bold text-gray-900">Configuration</h1>
      </div>

      {/* Main tabs */}
      <div className="flex gap-0 border-b border-gray-200 mb-6">
        {[
          { key: 'organization' as MainTab, label: 'Organization' },
          { key: 'profile' as MainTab, label: 'Profile' },
        ].map(tab => (
          <button
            key={tab.key}
            onClick={() => setMainTab(tab.key)}
            className={`px-4 py-2.5 text-sm font-medium border-b-2 transition-colors -mb-px ${
              mainTab === tab.key
                ? 'border-gray-900 text-gray-900'
                : 'border-transparent text-gray-500 hover:text-gray-700'
            }`}
          >
            {tab.label}
          </button>
        ))}
      </div>

      {/* Two-column layout */}
      <div className="flex gap-5">
        {/* LEFT SIDEBAR */}
        <div className="w-56 flex-shrink-0 bg-white rounded-lg border border-gray-100 shadow-sm p-2 h-fit">
          {sidebarItems.map(item => (
            <button
              key={item.key}
              onClick={() => setActiveSection(item.key)}
              className={`w-full flex items-center gap-2.5 px-3 py-2.5 rounded-lg text-sm font-medium transition-colors text-left ${
                activeSection === item.key
                  ? 'bg-gray-900 text-white'
                  : 'text-gray-600 hover:bg-gray-50'
              }`}
            >
              <span className="flex-shrink-0">{item.icon}</span>
              <span className="leading-tight">{item.label}</span>
            </button>
          ))}
        </div>

        {/* RIGHT CONTENT */}
        {activeSection === 'organisation' ? (
          <OrganisationContent />
        ) : activeSection === 'bank' ? (
          <BankDetailsContent />
        ) : (
          <PlaceholderContent
            title={sidebarItems.find(s => s.key === activeSection)?.label ?? ''}
          />
        )}
      </div>
    </div>
  )
}
