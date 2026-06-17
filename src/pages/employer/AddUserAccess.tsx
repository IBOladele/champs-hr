import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import {
  LayoutDashboard, Users, Clipboard, DollarSign, BarChart2,
  FileText, Gift, Settings, UserCog, TrendingUp,
} from 'lucide-react'

type AccessLevel = 'Full access' | 'Limited access' | 'View only'

interface Permission {
  key: string
  label: string
  icon: React.ReactNode
  defaultOn: boolean
}

const permissions: Permission[] = [
  { key: 'dashboard',   label: 'Dashboard',       icon: <LayoutDashboard size={16} />, defaultOn: true  },
  { key: 'employees',   label: 'Employees',        icon: <Users size={16} />,           defaultOn: true  },
  { key: 'hrops',       label: 'HR Operations',    icon: <Clipboard size={16} />,       defaultOn: true  },
  { key: 'payroll',     label: 'Payroll',          icon: <DollarSign size={16} />,      defaultOn: false },
  { key: 'reports',     label: 'Reports',          icon: <BarChart2 size={16} />,       defaultOn: false },
  { key: 'documents',   label: 'Documents',        icon: <FileText size={16} />,        defaultOn: true  },
  { key: 'benefits',    label: 'Benefits',         icon: <Gift size={16} />,            defaultOn: false },
  { key: 'config',      label: 'Configuration',    icon: <Settings size={16} />,        defaultOn: false },
  { key: 'useraccess',  label: 'User Access',      icon: <UserCog size={16} />,         defaultOn: false },
  { key: 'analytics',   label: 'Analytics',        icon: <TrendingUp size={16} />,      defaultOn: false },
]

export default function AddUserAccess() {
  const navigate = useNavigate()

  const [employee, setEmployee] = useState('')
  const [role, setRole] = useState('')
  const [accessLevel, setAccessLevel] = useState<AccessLevel>('Limited access')
  const [expiry, setExpiry] = useState('')
  const [perms, setPerms] = useState<Record<string, boolean>>(
    Object.fromEntries(permissions.map(p => [p.key, p.defaultOn]))
  )

  const inputCls = 'border border-gray-200 rounded-lg px-3 py-2.5 text-sm focus:outline-none focus:border-[#22c55e] w-full'
  const accessLevels: AccessLevel[] = ['Full access', 'Limited access', 'View only']

  function togglePerm(key: string) {
    setPerms(prev => ({ ...prev, [key]: !prev[key] }))
  }

  return (
    <div className="px-8 py-6">
      {/* Header */}
      <div className="mb-6">
        <button
          onClick={() => navigate('/employer/user-access')}
          className="text-sm text-[#22c55e] hover:text-green-700 mb-3 flex items-center gap-1"
        >
          ← Back to user access
        </button>
        <h1 className="text-2xl font-bold text-gray-900">Add user access</h1>
      </div>

      {/* Two-column layout */}
      <div className="grid grid-cols-2 gap-6">
        {/* Left — User details */}
        <div className="bg-white rounded-xl border border-gray-100 shadow-sm p-6">
          <h2 className="text-base font-semibold text-gray-900 mb-5">User details</h2>
          <div className="space-y-4">
            {/* Select employee */}
            <div>
              <label className="block text-xs font-medium text-gray-500 mb-1.5">Select employee</label>
              <select
                value={employee}
                onChange={e => setEmployee(e.target.value)}
                className={inputCls}
              >
                <option value="">Choose employee</option>
                <option>Smith Meyer</option>
                <option>Lana Mejias</option>
                <option>Keisha Locklear</option>
                <option>Miley Little</option>
                <option>Cyril Madril</option>
                <option>Rayan Petty</option>
                <option>Dania Navas</option>
                <option>John Doesite</option>
              </select>
            </div>

            {/* Role */}
            <div>
              <label className="block text-xs font-medium text-gray-500 mb-1.5">Role</label>
              <select
                value={role}
                onChange={e => setRole(e.target.value)}
                className={inputCls}
              >
                <option value="">Select role</option>
                <option>Admin</option>
                <option>HR Manager</option>
                <option>Finance Manager</option>
                <option>Department Head</option>
                <option>Viewer</option>
              </select>
            </div>

            {/* Access level radio pills */}
            <div>
              <label className="block text-xs font-medium text-gray-500 mb-2">Access level</label>
              <div className="flex gap-2 flex-wrap">
                {accessLevels.map(lvl => (
                  <button
                    key={lvl}
                    onClick={() => setAccessLevel(lvl)}
                    className={`px-3.5 py-1.5 rounded-full text-sm border transition-colors ${
                      accessLevel === lvl
                        ? 'bg-[#22c55e] border-[#22c55e] text-white'
                        : 'border-gray-200 text-gray-600 hover:border-gray-300 hover:bg-gray-50'
                    }`}
                  >
                    {lvl}
                  </button>
                ))}
              </div>
            </div>

            {/* Expiry */}
            <div>
              <label className="block text-xs font-medium text-gray-500 mb-1.5">
                Expiry <span className="text-gray-400 font-normal">(optional)</span>
              </label>
              <input
                type="date"
                value={expiry}
                onChange={e => setExpiry(e.target.value)}
                className={inputCls}
              />
              <p className="text-xs text-gray-400 mt-1">Leave blank for permanent access</p>
            </div>
          </div>
        </div>

        {/* Right — Permissions */}
        <div className="bg-white rounded-xl border border-gray-100 shadow-sm p-6">
          <div className="mb-5">
            <h2 className="text-base font-semibold text-gray-900">Set permissions</h2>
            <p className="text-xs text-gray-400 mt-0.5">Toggle specific module access</p>
          </div>
          <div className="space-y-3">
            {permissions.map(perm => (
              <div key={perm.key} className="flex items-center justify-between py-1">
                <div className="flex items-center gap-3">
                  <div className="w-8 h-8 rounded-lg bg-gray-100 flex items-center justify-center text-gray-500 flex-shrink-0">
                    {perm.icon}
                  </div>
                  <span className="text-sm text-gray-800">{perm.label}</span>
                </div>
                <button
                  onClick={() => togglePerm(perm.key)}
                  className={`relative w-10 h-5 rounded-full transition-colors flex-shrink-0 ${perms[perm.key] ? 'bg-[#22c55e]' : 'bg-gray-200'}`}
                >
                  <span
                    className={`absolute top-0.5 w-4 h-4 rounded-full bg-white shadow transition-all ${perms[perm.key] ? 'left-5' : 'left-0.5'}`}
                  />
                </button>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Bottom buttons */}
      <div className="flex items-center gap-3 mt-6">
        <button
          onClick={() => navigate('/employer/user-access')}
          className="px-5 py-2.5 text-sm text-gray-600 border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors"
        >
          Cancel
        </button>
        <button
          onClick={() => navigate('/employer/user-access')}
          className="px-5 py-2.5 text-sm font-medium text-white bg-[#22c55e] rounded-lg hover:bg-green-600 transition-colors"
        >
          Grant access
        </button>
      </div>
    </div>
  )
}
