import { useState } from 'react'
import {
  User, CreditCard, Bell, ShieldCheck, FolderOpen, Pencil, ChevronDown
} from 'lucide-react'

type SidebarKey = 'account' | 'payment' | 'notifications' | 'security' | 'documents'

const sidebarItems: { key: SidebarKey; label: string; icon: React.ReactNode }[] = [
  { key: 'account',       label: 'Personal information', icon: <User size={16} />        },
  { key: 'payment',       label: 'Payment information',  icon: <CreditCard size={16} />  },
  { key: 'notifications', label: 'Notifications',        icon: <Bell size={16} />        },
  { key: 'security',      label: 'Security',             icon: <ShieldCheck size={16} /> },
  { key: 'documents',     label: 'Documents',            icon: <FolderOpen size={16} />  },
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
          className="w-full px-3 py-2.5 text-sm border border-gray-200 rounded-lg focus:outline-none focus:border-[#22c55e] pr-8"
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

function AccountContent() {
  return (
    <div className="bg-white rounded-lg border border-gray-100 shadow-sm flex-1">
      <div className="flex items-start justify-between px-6 py-5 border-b border-gray-100">
        <div>
          <h2 className="text-base font-semibold text-gray-900">Personal information</h2>
          <p className="text-xs text-gray-400 mt-0.5">This is how you will be details about yourself.</p>
        </div>
        <button className="flex items-center gap-1.5 px-3 py-2 border border-gray-200 rounded-lg text-xs font-medium text-gray-600 hover:bg-gray-50 flex-shrink-0">
          <Pencil size={12} />
          Edit information
        </button>
      </div>

      <div className="px-6 py-5">
        {/* Avatar */}
        <div className="flex items-center gap-3 mb-6">
          <div className="w-12 h-12 rounded-full bg-gray-200 flex items-center justify-center text-gray-600 text-sm font-semibold">
            NP
          </div>
          <button className="flex items-center gap-1.5 text-xs text-gray-500 hover:text-gray-700">
            <Pencil size={11} />
            Add display pic
          </button>
        </div>

        {/* Form grid */}
        <div className="grid grid-cols-2 gap-x-6 gap-y-4">
          <InputField label="First name"          placeholder="Enter first name" />
          <InputField label="Last name"           placeholder="Enter last name" />
          <InputField label="Address"             placeholder="Enter your address" hasDropdown />
          <InputField label="Date of birth"       placeholder="DD / MM / YYYY" hasDropdown />
          <InputField label="Email"               placeholder="Enter email address" />
          <InputField label="Emergency contact"   placeholder="Enter emergency contact" hasDropdown />
        </div>
      </div>
    </div>
  )
}

function PlaceholderContent({ title }: { title: string }) {
  return (
    <div className="bg-white rounded-lg border border-gray-100 shadow-sm flex-1 px-6 py-5">
      <h2 className="text-base font-semibold text-gray-900 mb-1">{title}</h2>
      <p className="text-xs text-gray-400">Manage your {title.toLowerCase()} settings here.</p>
    </div>
  )
}

export default function EmployeeConfig() {
  const [activeSection, setActiveSection] = useState<SidebarKey>('account')

  return (
    <div className="px-8 py-6 max-w-5xl">
      <h1 className="text-2xl font-bold text-gray-900 mb-6">Configuration</h1>

      <div className="flex gap-5">
        {/* Sidebar */}
        <div className="w-52 flex-shrink-0 bg-white rounded-lg border border-gray-100 shadow-sm p-2 h-fit">
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

        {/* Content */}
        {activeSection === 'account' ? (
          <AccountContent />
        ) : (
          <PlaceholderContent
            title={sidebarItems.find(s => s.key === activeSection)?.label ?? ''}
          />
        )}
      </div>
    </div>
  )
}
