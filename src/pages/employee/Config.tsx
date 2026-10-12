import { useState, useEffect } from 'react'
import { User, CreditCard } from 'lucide-react'
import { auth } from '../../lib/api'
import { useAuth } from '../../context/AuthContext'

type SidebarKey = 'account' | 'payment'

const AMBER = '#22c55e'
const AMBER_HOVER = '#16a34a'

const sidebarItems: { key: SidebarKey; label: string; icon: React.ReactNode }[] = [
  { key: 'account', label: 'Personal information', icon: <User size={16} />       },
  { key: 'payment', label: 'Payment information',  icon: <CreditCard size={16} /> },
]

const inputCls = 'w-full px-3 py-2.5 text-sm border border-gray-200 rounded-lg focus:outline-none focus:border-[#22c55e]'

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

function AccountContent() {
  const { user, refreshUser } = useAuth()
  const [firstName, setFirstName] = useState('')
  const [lastName, setLastName] = useState('')
  const [phone, setPhone] = useState('')
  const [saving, setSaving] = useState(false)
  const [saved, setSaved] = useState(false)
  const [error, setError] = useState('')

  useEffect(() => {
    if (!user) return
    const parts = user.fullName?.split(' ') ?? []
    setFirstName(parts[0] ?? '')
    setLastName(parts.slice(1).join(' '))
    setPhone(user.phone ?? '')
  }, [user])

  const handleSave = async () => {
    setSaving(true)
    setError('')
    setSaved(false)
    try {
      const fullName = [firstName.trim(), lastName.trim()].filter(Boolean).join(' ')
      await auth.updateMe({ fullName: fullName || undefined, phone: phone || null })
      await refreshUser()
      setSaved(true)
      setTimeout(() => setSaved(false), 2500)
    } catch {
      setError('Failed to save. Please try again.')
    } finally {
      setSaving(false)
    }
  }

  const initials = [firstName[0], lastName[0]].filter(Boolean).join('').toUpperCase() || 'ME'

  return (
    <div className="bg-white rounded-lg border border-gray-100 shadow-sm flex-1">
      <div className="flex items-start justify-between px-6 py-5 border-b border-gray-100">
        <div>
          <h2 className="text-base font-semibold text-gray-900">Personal information</h2>
          <p className="text-xs text-gray-400 mt-0.5">Update your name, phone, and contact details.</p>
        </div>
      </div>

      <div className="px-6 py-5">
        {/* Avatar */}
        <div className="flex items-center gap-3 mb-6">
          <div
            className="w-12 h-12 rounded-full flex items-center justify-center text-white text-sm font-bold"
            style={{ background: AMBER }}
          >
            {initials}
          </div>
          <div>
            <p className="text-sm font-semibold text-gray-900">{[firstName, lastName].filter(Boolean).join(' ') || 'Your name'}</p>
            <p className="text-xs text-gray-400">{user?.email}</p>
          </div>
        </div>

        <div className="grid grid-cols-2 gap-x-6 gap-y-4">
          <div>
            <label className="block text-xs font-medium text-gray-500 mb-1.5">First name</label>
            <input
              type="text"
              className={inputCls}
              value={firstName}
              onChange={e => setFirstName(e.target.value)}
              placeholder="First name"
            />
          </div>
          <div>
            <label className="block text-xs font-medium text-gray-500 mb-1.5">Last name</label>
            <input
              type="text"
              className={inputCls}
              value={lastName}
              onChange={e => setLastName(e.target.value)}
              placeholder="Last name"
            />
          </div>
          <div>
            <label className="block text-xs font-medium text-gray-500 mb-1.5">Email address</label>
            <input
              type="email"
              className={`${inputCls} bg-gray-50 text-gray-400 cursor-not-allowed`}
              value={user?.email ?? ''}
              readOnly
              title="Email cannot be changed here"
            />
          </div>
          <div>
            <label className="block text-xs font-medium text-gray-500 mb-1.5">Phone number</label>
            <input
              type="tel"
              className={inputCls}
              value={phone}
              onChange={e => setPhone(e.target.value)}
              placeholder="+1 555 000 0000"
            />
          </div>
        </div>

        <div className="mt-6 pt-5 border-t border-gray-100 flex items-center gap-3">
          <SaveBtn saving={saving} onClick={handleSave} />
          {saved && <span className="text-sm text-green-600 font-medium">Saved.</span>}
          {error && <span className="text-sm text-red-500">{error}</span>}
        </div>
      </div>
    </div>
  )
}

function PlaceholderContent({ title }: { title: string }) {
  return (
    <div className="bg-white rounded-lg border border-gray-100 shadow-sm flex-1 px-6 py-8 text-center">
      <p className="text-sm font-medium text-gray-600">{title}</p>
      <p className="text-xs text-gray-400 mt-1">Manage your {title.toLowerCase()} settings here.</p>
    </div>
  )
}

export default function EmployeeConfig() {
  const [activeSection, setActiveSection] = useState<SidebarKey>('account')

  return (
    <div className="max-w-3xl">
      <h1 className="text-2xl font-bold text-gray-900 mb-6">Configuration</h1>

      <div className="flex gap-5">
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
