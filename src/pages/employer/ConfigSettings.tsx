import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import {
  Building2, DollarSign, CalendarDays, Bell, Plug, ShieldCheck,
} from 'lucide-react'
import { config } from '../../lib/api'
import type { CompanyConfig } from '../../lib/api'

type SettingsSection = 'company' | 'payroll' | 'leave' | 'notifications' | 'integrations' | 'security'
type PayFrequency = 'Monthly' | 'Weekly' | 'Bi-weekly'

const AMBER = '#22c55e'
const AMBER_HOVER = '#16a34a'

const sidebarItems: { key: SettingsSection; label: string; icon: React.ReactNode }[] = [
  { key: 'company',       label: 'Company profile',    icon: <Building2 size={16} />    },
  { key: 'payroll',       label: 'Payroll settings',   icon: <DollarSign size={16} />   },
  { key: 'leave',         label: 'Leave & attendance', icon: <CalendarDays size={16} /> },
  { key: 'notifications', label: 'Notifications',      icon: <Bell size={16} />         },
  { key: 'integrations',  label: 'Integrations',       icon: <Plug size={16} />         },
  { key: 'security',      label: 'Security',           icon: <ShieldCheck size={16} />  },
]

const inputCls = 'border border-gray-200 rounded-lg px-3 py-2.5 text-sm focus:outline-none focus:border-[#22c55e] w-full'

function SaveBtn({ saving, onClick }: { saving: boolean; onClick: () => void }) {
  return (
    <button
      onClick={onClick}
      disabled={saving}
      style={{ background: saving ? '#d1d5db' : AMBER }}
      className="px-5 py-2.5 text-sm font-medium text-white rounded-lg transition-colors disabled:cursor-not-allowed"
      onMouseEnter={e => { if (!saving) (e.currentTarget as HTMLButtonElement).style.background = AMBER_HOVER }}
      onMouseLeave={e => { if (!saving) (e.currentTarget as HTMLButtonElement).style.background = AMBER }}
    >
      {saving ? 'Saving...' : 'Save changes'}
    </button>
  )
}

function Toggle({ on, onToggle }: { on: boolean; onToggle: () => void }) {
  return (
    <button
      onClick={onToggle}
      style={{ background: on ? AMBER : '#e5e7eb' }}
      className="relative w-10 h-5 rounded-full transition-colors flex-shrink-0"
    >
      <span className={`absolute top-0.5 w-4 h-4 rounded-full bg-white shadow transition-all ${on ? 'left-5' : 'left-0.5'}`} />
    </button>
  )
}

// ── Company ───────────────────────────────────────────────────────────────────
function CompanySection({ cfg, onSave }: { cfg: CompanyConfig; onSave: (patch: Partial<CompanyConfig>) => Promise<void> }) {
  const [form, setForm] = useState({ ...cfg })
  const [saving, setSaving] = useState(false)

  useEffect(() => { setForm({ ...cfg }) }, [cfg])

  const set = (k: keyof CompanyConfig) => (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) =>
    setForm(f => ({ ...f, [k]: e.target.value }))

  const handleSave = async () => {
    setSaving(true)
    try { await onSave(form) } finally { setSaving(false) }
  }

  const initials = (form.companyName ?? 'Co').split(' ').map(w => w[0]).join('').slice(0, 2).toUpperCase()

  return (
    <div className="bg-white rounded-xl border border-gray-100 shadow-sm">
      <div className="px-6 py-5 border-b border-gray-100">
        <h2 className="text-base font-semibold text-gray-900">Company information</h2>
      </div>
      <div className="px-6 py-5">
        <div className="flex items-center gap-4 mb-6">
          <div className="w-12 h-12 rounded-full flex items-center justify-center text-white text-sm font-bold" style={{ background: AMBER }}>
            {initials}
          </div>
          <div>
            <p className="text-sm font-semibold text-gray-900">{form.companyName || 'Your company'}</p>
            <p className="text-xs text-gray-400">Company account</p>
          </div>
        </div>
        <div className="grid grid-cols-2 gap-x-8 gap-y-4">
          <div>
            <label className="block text-xs font-medium text-gray-500 mb-1.5">Company name</label>
            <input className={inputCls} value={form.companyName ?? ''} onChange={set('companyName')} />
          </div>
          <div>
            <label className="block text-xs font-medium text-gray-500 mb-1.5">Industry</label>
            <input className={inputCls} value={form.industry ?? ''} onChange={set('industry')} />
          </div>
          <div>
            <label className="block text-xs font-medium text-gray-500 mb-1.5">Company size</label>
            <select className={inputCls} value={form.companySize ?? ''} onChange={set('companySize')}>
              <option value="1-10">1-10 employees</option>
              <option value="11-50">11-50 employees</option>
              <option value="51-200">51-200 employees</option>
              <option value="201-500">201-500 employees</option>
              <option value="500+">500+ employees</option>
            </select>
          </div>
          <div>
            <label className="block text-xs font-medium text-gray-500 mb-1.5">Timezone</label>
            <select className={inputCls} value={form.timezone ?? ''} onChange={set('timezone')}>
              <option value="America/New_York">US Eastern (EST/EDT)</option>
              <option value="America/Chicago">US Central (CST/CDT)</option>
              <option value="America/Denver">US Mountain (MST/MDT)</option>
              <option value="America/Los_Angeles">US Pacific (PST/PDT)</option>
              <option value="Europe/London">GMT+0, London</option>
              <option value="Africa/Lagos">WAT, Lagos</option>
              <option value="Africa/Nairobi">EAT, Nairobi</option>
            </select>
          </div>
          <div>
            <label className="block text-xs font-medium text-gray-500 mb-1.5">Currency</label>
            <select className={inputCls} value={form.currency ?? ''} onChange={set('currency')}>
              <option value="USD">USD: US Dollar</option>
              <option value="GBP">GBP: British Pound</option>
              <option value="EUR">EUR: Euro</option>
              <option value="NGN">NGN: Nigerian Naira</option>
              <option value="KES">KES: Kenyan Shilling</option>
              <option value="CAD">CAD: Canadian Dollar</option>
            </select>
          </div>
          <div>
            <label className="block text-xs font-medium text-gray-500 mb-1.5">Website</label>
            <input className={inputCls} value={form.website ?? ''} onChange={set('website')} placeholder="www.example.com" />
          </div>
          <div className="col-span-2">
            <label className="block text-xs font-medium text-gray-500 mb-1.5">Registered address</label>
            <input className={inputCls} value={form.registeredAddress ?? ''} onChange={set('registeredAddress')} placeholder="Street, City, Postcode" />
          </div>
        </div>
        <div className="mt-6 pt-5 border-t border-gray-100">
          <SaveBtn saving={saving} onClick={handleSave} />
        </div>
      </div>
    </div>
  )
}

// ── Payroll ───────────────────────────────────────────────────────────────────
function PayrollSection({ cfg, onSave }: { cfg: CompanyConfig; onSave: (patch: Partial<CompanyConfig>) => Promise<void> }) {
  const [payFreq, setPayFreq] = useState<PayFrequency>((cfg.payFrequency as PayFrequency) ?? 'Monthly')
  const [payDay, setPayDay] = useState(cfg.payDay ?? 'Last working day')
  const [currency, setCurrency] = useState(cfg.currency ?? 'USD')
  const [overtime, setOvertime] = useState(cfg.overtimePolicy ?? '1.5x after 40hrs/week')
  const [saving, setSaving] = useState(false)

  useEffect(() => {
    setPayFreq((cfg.payFrequency as PayFrequency) ?? 'Monthly')
    setPayDay(cfg.payDay ?? 'Last working day')
    setCurrency(cfg.currency ?? 'USD')
    setOvertime(cfg.overtimePolicy ?? '1.5x after 40hrs/week')
  }, [cfg])

  const handleSave = async () => {
    setSaving(true)
    try { await onSave({ payFrequency: payFreq, payDay, currency, overtimePolicy: overtime }) }
    finally { setSaving(false) }
  }

  const payFreqs: PayFrequency[] = ['Monthly', 'Weekly', 'Bi-weekly']

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
                style={payFreq === f ? { background: AMBER, borderColor: AMBER, color: '#fff' } : {}}
                className={`px-4 py-2 rounded-full text-sm border transition-colors ${
                  payFreq === f ? '' : 'border-gray-200 text-gray-600 hover:border-gray-300'
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
            <select className={inputCls} value={payDay} onChange={e => setPayDay(e.target.value)}>
              <option>Last working day</option>
              <option>25th of month</option>
              <option>1st of month</option>
              <option>15th of month</option>
            </select>
          </div>
          <div>
            <label className="block text-xs font-medium text-gray-500 mb-1.5">Base currency</label>
            <select className={inputCls} value={currency} onChange={e => setCurrency(e.target.value)}>
              <option value="USD">USD: US Dollar</option>
              <option value="GBP">GBP: British Pound</option>
              <option value="EUR">EUR: Euro</option>
              <option value="NGN">NGN: Nigerian Naira</option>
            </select>
          </div>
          <div className="col-span-2">
            <label className="block text-xs font-medium text-gray-500 mb-1.5">Overtime policy</label>
            <select className={inputCls} value={overtime} onChange={e => setOvertime(e.target.value)}>
              <option>1.5x after 40hrs/week</option>
              <option>2x after 40hrs/week</option>
              <option>No overtime pay</option>
            </select>
          </div>
        </div>
        <div className="pt-2">
          <SaveBtn saving={saving} onClick={handleSave} />
        </div>
      </div>
    </div>
  )
}

// ── Leave ─────────────────────────────────────────────────────────────────────
function LeaveSection({ cfg, onSave }: { cfg: CompanyConfig; onSave: (patch: Partial<CompanyConfig>) => Promise<void> }) {
  const [annualLeave, setAnnualLeave] = useState(cfg.annualLeaveDays ?? '25')
  const [sickLeave, setSickLeave] = useState(cfg.sickLeaveDays ?? '10')
  const [publicHols, setPublicHols] = useState(cfg.publicHolidays ?? 'United States')
  const [workHours, setWorkHours] = useState(cfg.workingHoursPerDay ?? '8')
  const [saving, setSaving] = useState(false)

  useEffect(() => {
    setAnnualLeave(cfg.annualLeaveDays ?? '25')
    setSickLeave(cfg.sickLeaveDays ?? '10')
    setPublicHols(cfg.publicHolidays ?? 'United States')
    setWorkHours(cfg.workingHoursPerDay ?? '8')
  }, [cfg])

  const handleSave = async () => {
    setSaving(true)
    try {
      await onSave({
        annualLeaveDays: annualLeave,
        sickLeaveDays: sickLeave,
        publicHolidays: publicHols,
        workingHoursPerDay: workHours,
      })
    } finally { setSaving(false) }
  }

  return (
    <div className="bg-white rounded-xl border border-gray-100 shadow-sm">
      <div className="px-6 py-5 border-b border-gray-100">
        <h2 className="text-base font-semibold text-gray-900">Leave &amp; attendance</h2>
      </div>
      <div className="px-6 py-5 space-y-5">
        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className="block text-xs font-medium text-gray-500 mb-1.5">Annual leave days</label>
            <input type="number" className={inputCls} value={annualLeave} onChange={e => setAnnualLeave(e.target.value)} />
          </div>
          <div>
            <label className="block text-xs font-medium text-gray-500 mb-1.5">Sick leave days</label>
            <input type="number" className={inputCls} value={sickLeave} onChange={e => setSickLeave(e.target.value)} />
          </div>
          <div>
            <label className="block text-xs font-medium text-gray-500 mb-1.5">Public holidays</label>
            <select className={inputCls} value={publicHols} onChange={e => setPublicHols(e.target.value)}>
              <option>United States</option>
              <option>United Kingdom</option>
              <option>Nigeria</option>
              <option>Kenya</option>
              <option>Canada</option>
              <option>Australia</option>
            </select>
          </div>
          <div>
            <label className="block text-xs font-medium text-gray-500 mb-1.5">Working hours per day</label>
            <input type="number" className={inputCls} value={workHours} onChange={e => setWorkHours(e.target.value)} />
          </div>
        </div>
        <div className="pt-2">
          <SaveBtn saving={saving} onClick={handleSave} />
        </div>
      </div>
    </div>
  )
}

// ── Notifications ─────────────────────────────────────────────────────────────
function NotificationsSection({ cfg, onSave }: { cfg: CompanyConfig; onSave: (patch: Partial<CompanyConfig>) => Promise<void> }) {
  const notifs = [
    { key: 'notifPayroll',   label: 'Payroll processed',        desc: 'Notify when a payroll run completes'             },
    { key: 'notifEmployee',  label: 'New employee onboarded',   desc: 'Notify when a new hire finishes onboarding'      },
    { key: 'notifLeave',     label: 'Leave request submitted',  desc: 'Notify when an employee submits a leave request' },
    { key: 'notifDocument',  label: 'Document uploaded',        desc: 'Notify when a new document is added'             },
    { key: 'notifBenefit',   label: 'Benefit enrollment',       desc: 'Notify when an employee enrolls in a benefit'    },
  ]

  const [enabled, setEnabled] = useState<Record<string, boolean>>(() =>
    Object.fromEntries(notifs.map(n => [n.key, cfg[n.key] !== 'false']))
  )
  const [saving, setSaving] = useState(false)

  useEffect(() => {
    setEnabled(Object.fromEntries(notifs.map(n => [n.key, cfg[n.key] !== 'false'])))
  }, [cfg])

  const toggle = (key: string) => setEnabled(prev => ({ ...prev, [key]: !prev[key] }))

  const handleSave = async () => {
    setSaving(true)
    try {
      const patch = Object.fromEntries(
        Object.entries(enabled).map(([k, v]) => [k, v ? 'true' : 'false'])
      ) as Partial<CompanyConfig>
      await onSave(patch)
    } finally { setSaving(false) }
  }

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
            <Toggle on={enabled[n.key]} onToggle={() => toggle(n.key)} />
          </div>
        ))}
      </div>
      <div className="px-6 py-5 border-t border-gray-100">
        <SaveBtn saving={saving} onClick={handleSave} />
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

// ── Main ──────────────────────────────────────────────────────────────────────
export default function ConfigSettings() {
  const navigate = useNavigate()
  const [activeSection, setActiveSection] = useState<SettingsSection>('company')
  const [cfg, setCfg] = useState<CompanyConfig>({})
  const [loadError, setLoadError] = useState(false)

  useEffect(() => {
    config.get()
      .then(data => setCfg(data))
      .catch(() => setLoadError(true))
  }, [])

  const handleSave = async (patch: Partial<CompanyConfig>) => {
    const merged = { ...cfg, ...patch }
    const saved = await config.save(merged)
    setCfg(saved)
  }

  return (
    <div>
      <div className="mb-6">
        <button
          onClick={() => navigate('/employer/config')}
          className="text-sm mb-3 flex items-center gap-1"
          style={{ color: AMBER }}
          onMouseEnter={e => (e.currentTarget.style.color = AMBER_HOVER)}
          onMouseLeave={e => (e.currentTarget.style.color = AMBER)}
        >
          Back to configuration
        </button>
        <h1 className="text-2xl font-bold text-gray-900">Settings</h1>
        {loadError && <p className="text-sm text-red-500 mt-1">Failed to load settings. Changes may not save.</p>}
      </div>

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
          {activeSection === 'company'       && <CompanySection cfg={cfg} onSave={handleSave} />}
          {activeSection === 'payroll'       && <PayrollSection cfg={cfg} onSave={handleSave} />}
          {activeSection === 'leave'         && <LeaveSection cfg={cfg} onSave={handleSave} />}
          {activeSection === 'notifications' && <NotificationsSection cfg={cfg} onSave={handleSave} />}
          {activeSection === 'integrations'  && <PlaceholderSection title="Integrations" />}
          {activeSection === 'security'      && <PlaceholderSection title="Security" />}
        </div>
      </div>
    </div>
  )
}
