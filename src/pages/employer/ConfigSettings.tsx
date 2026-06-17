import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import {
  Building2, DollarSign, CalendarDays, Bell, Plug, ShieldCheck,
} from 'lucide-react'

type SettingsSection = 'company' | 'payroll' | 'leave' | 'notifications' | 'integrations' | 'security'

type PayFrequency = 'Monthly' | 'Weekly' | 'Bi-weekly'

interface SidebarItem {
  key: SettingsSection
  label: string
  icon: React.ReactNode
}

const sidebarItems: SidebarItem[] = [
  { key: 'company',       label: 'Company profile',    icon: <Building2 size={16} />    },
  { key: 'payroll',       label: 'Payroll settings',   icon: <DollarSign size={16} />   },
  { key: 'leave',         label: 'Leave & attendance', icon: <CalendarDays size={16} /> },
  { key: 'notifications', label: 'Notifications',      icon: <Bell size={16} />         },
  { key: 'integrations',  label: 'Integrations',       icon: <Plug size={16} />         },
  { key: 'security',      label: 'Security',           icon: <ShieldCheck size={16} />  },
]

function InfoField({ label, value }: { label: string; value: string }) {
  return (
    <div>
      <p className="text-xs font-medium text-gray-400 mb-0.5">{label}</p>
      <p className="text-sm text-gray-800">{value}</p>
    </div>
  )
}

function Toggle({ on, onToggle }: { on: boolean; onToggle: () => void }) {
  return (
    <button
      onClick={onToggle}
      className={`relative w-10 h-5 rounded-full transition-colors flex-shrink-0 ${on ? 'bg-[#22c55e]' : 'bg-gray-200'}`}
    >
      <span className={`absolute top-0.5 w-4 h-4 rounded-full bg-white shadow transition-all ${on ? 'left-5' : 'left-0.5'}`} />
    </button>
  )
}

function CompanySection() {
  return (
    <div className="bg-white rounded-xl border border-gray-100 shadow-sm">
      <div className="flex items-center justify-between px-6 py-5 border-b border-gray-100">
        <h2 className="text-base font-semibold text-gray-900">Company information</h2>
        <button className="px-3 py-1.5 text-xs text-gray-600 border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors">
          Edit
        </button>
      </div>
      <div className="px-6 py-5">
        <div className="flex items-center gap-4 mb-6">
          <div className="w-12 h-12 rounded-full bg-[#22c55e] flex items-center justify-center text-white text-sm font-bold">
            SC
          </div>
          <div>
            <p className="text-sm font-semibold text-gray-900">Skywrapper Corp</p>
            <p className="text-xs text-gray-400">Company account</p>
          </div>
        </div>
        <div className="grid grid-cols-2 gap-x-8 gap-y-5">
          <InfoField label="Company name"        value="Skywrapper Corp"       />
          <InfoField label="Industry"            value="Technology"             />
          <InfoField label="Company size"        value="201 – 500 employees"    />
          <InfoField label="Timezone"            value="GMT+0 — London"         />
          <InfoField label="Currency"            value="GBP (£)"                />
          <InfoField label="Website"             value="www.skywrapper.io"      />
          <InfoField label="Registered address"  value="12 Finsbury Square, London, EC2A 1AB" />
        </div>
        <div className="mt-6 pt-5 border-t border-gray-100">
          <button className="px-5 py-2.5 text-sm font-medium text-white bg-[#22c55e] rounded-lg hover:bg-green-600 transition-colors">
            Save changes
          </button>
        </div>
      </div>
    </div>
  )
}

function PayrollSection() {
  const [payFreq, setPayFreq] = useState<PayFrequency>('Monthly')
  const payFreqs: PayFrequency[] = ['Monthly', 'Weekly', 'Bi-weekly']

  const inputCls = 'border border-gray-200 rounded-lg px-3 py-2.5 text-sm focus:outline-none focus:border-[#22c55e] w-full'

  return (
    <div className="bg-white rounded-xl border border-gray-100 shadow-sm">
      <div className="px-6 py-5 border-b border-gray-100">
        <h2 className="text-base font-semibold text-gray-900">Payroll settings</h2>
      </div>
      <div className="px-6 py-5 space-y-5">
        <div>
          <label className="block text-xs font-medium text-gray-500 mb-2">Pay frequency</label>
          <div className="flex gap-2">
            {payFreqs.map(f => (
              <button
                key={f}
                onClick={() => setPayFreq(f)}
                className={`px-4 py-2 rounded-full text-sm border transition-colors ${
                  payFreq === f
                    ? 'bg-[#22c55e] border-[#22c55e] text-white'
                    : 'border-gray-200 text-gray-600 hover:border-gray-300'
                }`}
              >
                {f}
              </button>
            ))}
          </div>
        </div>
        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className="block text-xs font-medium text-gray-500 mb-1.5">Pay day</label>
            <select className={inputCls}>
              <option>Last working day</option>
              <option>25th of month</option>
              <option>1st of month</option>
            </select>
          </div>
          <div>
            <label className="block text-xs font-medium text-gray-500 mb-1.5">Base currency</label>
            <select className={inputCls}>
              <option>GBP (£)</option>
              <option>USD ($)</option>
              <option>EUR (€)</option>
            </select>
          </div>
          <div className="col-span-2">
            <label className="block text-xs font-medium text-gray-500 mb-1.5">Overtime policy</label>
            <select className={inputCls}>
              <option>1.5× rate after 40hrs/week</option>
              <option>2× rate after 40hrs/week</option>
              <option>No overtime pay</option>
            </select>
          </div>
        </div>
        <div className="pt-2">
          <button className="px-5 py-2.5 text-sm font-medium text-white bg-[#22c55e] rounded-lg hover:bg-green-600 transition-colors">
            Save changes
          </button>
        </div>
      </div>
    </div>
  )
}

function LeaveSection() {
  const [annualLeave, setAnnualLeave] = useState(25)
  const [sickLeave, setSickLeave] = useState(10)
  const [workingHours, setWorkingHours] = useState(8)

  const inputCls = 'border border-gray-200 rounded-lg px-3 py-2.5 text-sm focus:outline-none focus:border-[#22c55e] w-full'

  return (
    <div className="bg-white rounded-xl border border-gray-100 shadow-sm">
      <div className="px-6 py-5 border-b border-gray-100">
        <h2 className="text-base font-semibold text-gray-900">Leave &amp; attendance</h2>
      </div>
      <div className="px-6 py-5 space-y-5">
        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className="block text-xs font-medium text-gray-500 mb-1.5">Annual leave days</label>
            <input
              type="number"
              value={annualLeave}
              onChange={e => setAnnualLeave(Number(e.target.value))}
              className={inputCls}
            />
          </div>
          <div>
            <label className="block text-xs font-medium text-gray-500 mb-1.5">Sick leave days</label>
            <input
              type="number"
              value={sickLeave}
              onChange={e => setSickLeave(Number(e.target.value))}
              className={inputCls}
            />
          </div>
          <div>
            <label className="block text-xs font-medium text-gray-500 mb-1.5">Public holidays</label>
            <select className={inputCls}>
              <option>United Kingdom</option>
              <option>United States</option>
              <option>Nigeria</option>
            </select>
          </div>
          <div>
            <label className="block text-xs font-medium text-gray-500 mb-1.5">Working hours per day</label>
            <input
              type="number"
              value={workingHours}
              onChange={e => setWorkingHours(Number(e.target.value))}
              className={inputCls}
            />
          </div>
        </div>
        <div className="pt-2">
          <button className="px-5 py-2.5 text-sm font-medium text-white bg-[#22c55e] rounded-lg hover:bg-green-600 transition-colors">
            Save changes
          </button>
        </div>
      </div>
    </div>
  )
}

function NotificationsSection() {
  const notifs = [
    { key: 'payroll',   label: 'Payroll processed',        desc: 'Notify when a payroll run completes'              },
    { key: 'employee',  label: 'New employee onboarded',    desc: 'Notify when a new hire finishes onboarding'       },
    { key: 'leave',     label: 'Leave request submitted',   desc: 'Notify when an employee submits a leave request'  },
    { key: 'document',  label: 'Document uploaded',         desc: 'Notify when a new document is added'              },
    { key: 'benefit',   label: 'Benefit enrollment',        desc: 'Notify when an employee enrolls in a benefit'     },
  ]
  const [enabled, setEnabled] = useState<Record<string, boolean>>(
    Object.fromEntries(notifs.map(n => [n.key, true]))
  )

  return (
    <div className="bg-white rounded-xl border border-gray-100 shadow-sm">
      <div className="px-6 py-5 border-b border-gray-100">
        <h2 className="text-base font-semibold text-gray-900">Notifications</h2>
      </div>
      <div className="divide-y divide-gray-100">
        {notifs.map(n => (
          <div key={n.key} className="flex items-center justify-between px-6 py-4">
            <div>
              <p className="text-sm font-medium text-gray-800">{n.label}</p>
              <p className="text-xs text-gray-400 mt-0.5">{n.desc}</p>
            </div>
            <Toggle
              on={enabled[n.key]}
              onToggle={() => setEnabled(prev => ({ ...prev, [n.key]: !prev[n.key] }))}
            />
          </div>
        ))}
      </div>
    </div>
  )
}

function PlaceholderSection({ title }: { title: string }) {
  return (
    <div className="bg-white rounded-xl border border-gray-100 shadow-sm px-6 py-8 text-center">
      <p className="text-sm font-medium text-gray-600">{title}</p>
      <p className="text-xs text-gray-400 mt-1">Configure your {title.toLowerCase()} settings here.</p>
    </div>
  )
}

export default function ConfigSettings() {
  const navigate = useNavigate()
  const [activeSection, setActiveSection] = useState<SettingsSection>('company')

  return (
    <div className="px-8 py-6">
      {/* Header */}
      <div className="mb-6">
        <button
          onClick={() => navigate('/employer/config')}
          className="text-sm text-[#22c55e] hover:text-green-700 mb-3 flex items-center gap-1"
        >
          ← Back to configuration
        </button>
        <h1 className="text-2xl font-bold text-gray-900">Settings</h1>
      </div>

      {/* Two-column layout */}
      <div className="flex gap-5">
        {/* Sidebar */}
        <div className="w-56 flex-shrink-0 bg-white rounded-xl border border-gray-100 shadow-sm p-2 h-fit">
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
        <div className="flex-1">
          {activeSection === 'company'       && <CompanySection />}
          {activeSection === 'payroll'       && <PayrollSection />}
          {activeSection === 'leave'         && <LeaveSection />}
          {activeSection === 'notifications' && <NotificationsSection />}
          {activeSection === 'integrations'  && <PlaceholderSection title="Integrations" />}
          {activeSection === 'security'      && <PlaceholderSection title="Security" />}
        </div>
      </div>
    </div>
  )
}
