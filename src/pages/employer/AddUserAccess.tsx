import { useState, useEffect } from 'react'
import { useNavigate, useLocation } from 'react-router-dom'
import {
  LayoutDashboard, Users, Clipboard, DollarSign, BarChart2,
  FileText, Gift, Settings, UserCog, TrendingUp,
} from 'lucide-react'
import { employees as employeesApi, userAccess as userAccessApi } from '../../lib/api'
import type { Employee, PortalUser } from '../../lib/api'

type AccessLevel = 'Full access' | 'Limited access' | 'View only'

interface Permission {
  key: string
  label: string
  icon: React.ReactNode
  defaultOn: boolean
}

const PERMISSION_LIST: Permission[] = [
  { key: 'dashboard',   label: 'Dashboard',      icon: <LayoutDashboard size={16} />, defaultOn: true  },
  { key: 'employees',   label: 'Employees',       icon: <Users size={16} />,           defaultOn: true  },
  { key: 'hrops',       label: 'HR Operations',   icon: <Clipboard size={16} />,       defaultOn: true  },
  { key: 'payroll',     label: 'Payroll',         icon: <DollarSign size={16} />,      defaultOn: false },
  { key: 'reports',     label: 'Reports',         icon: <BarChart2 size={16} />,       defaultOn: false },
  { key: 'documents',   label: 'Documents',       icon: <FileText size={16} />,        defaultOn: true  },
  { key: 'benefits',    label: 'Benefits',        icon: <Gift size={16} />,            defaultOn: false },
  { key: 'config',      label: 'Configuration',   icon: <Settings size={16} />,        defaultOn: false },
  { key: 'useraccess',  label: 'User Access',     icon: <UserCog size={16} />,         defaultOn: false },
  { key: 'analytics',   label: 'Analytics',       icon: <TrendingUp size={16} />,      defaultOn: false },
]

const ACCESS_LEVEL_PRESETS: Record<AccessLevel, string[]> = {
  'Full access':     PERMISSION_LIST.map(p => p.key),
  'Limited access':  ['dashboard', 'employees', 'hrops', 'documents'],
  'View only':       ['dashboard'],
}

const ROLES = ['Admin', 'HR_Manager', 'Finance_Manager', 'Department_Head', 'Viewer']
const ROLE_LABELS: Record<string, string> = {
  Admin:            'Admin',
  HR_Manager:       'HR Manager',
  Finance_Manager:  'Finance Manager',
  Department_Head:  'Department Head',
  Viewer:           'Viewer',
}

const inputCls = 'border border-gray-200 rounded-lg px-3 py-2.5 text-sm focus:outline-none focus:border-[#22c55e] w-full'
const accessLevels: AccessLevel[] = ['Full access', 'Limited access', 'View only']

export default function AddUserAccess() {
  const navigate = useNavigate()
  const location = useLocation()
  const existing: PortalUser | undefined = (location.state as { user?: PortalUser } | null)?.user

  const [empList, setEmpList] = useState<Employee[]>([])
  const [userId, setUserId] = useState(existing?.id ?? '')
  const [portalRole, setPortalRole] = useState(existing?.portalRole ?? '')
  const [accessLevel, setAccessLevel] = useState<AccessLevel>('Limited access')
  const [perms, setPerms] = useState<Record<string, boolean>>(
    existing?.portalPermissions && Object.keys(existing.portalPermissions).length > 0
      ? existing.portalPermissions
      : Object.fromEntries(PERMISSION_LIST.map(p => [p.key, p.defaultOn]))
  )
  const [saving, setSaving] = useState(false)
  const [error, setError] = useState('')

  useEffect(() => {
    employeesApi.list().then(setEmpList).catch(() => {})
  }, [])

  function applyPreset(level: AccessLevel) {
    setAccessLevel(level)
    const on = new Set(ACCESS_LEVEL_PRESETS[level])
    setPerms(Object.fromEntries(PERMISSION_LIST.map(p => [p.key, on.has(p.key)])))
  }

  function togglePerm(key: string) {
    setPerms(prev => ({ ...prev, [key]: !prev[key] }))
  }

  async function handleSubmit() {
    if (!userId) { setError('Please select an employee.'); return }
    if (!portalRole) { setError('Please select a role.'); return }
    setSaving(true)
    setError('')
    try {
      await userAccessApi.grant({ userId, portalRole, permissions: perms })
      navigate('/employer/user-access')
    } catch (e: unknown) {
      setError(e instanceof Error ? e.message : 'Failed to save. Please try again.')
    } finally {
      setSaving(false)
    }
  }

  return (
    <div>
      {/* Header */}
      <div className="mb-6">
        <button
          onClick={() => navigate('/employer/user-access')}
          className="text-sm text-[#22c55e] hover:text-[#16a34a] mb-3 flex items-center gap-1 transition-colors"
        >
          Back to user access
        </button>
        <h1 className="text-2xl font-bold text-gray-900">
          {existing ? 'Edit access' : 'Add user access'}
        </h1>
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
                value={userId}
                onChange={e => setUserId(e.target.value)}
                className={inputCls}
                disabled={!!existing}
              >
                <option value="">Choose employee</option>
                {empList.map(e => (
                  <option key={e.userId} value={e.userId}>
                    {e.fullName} {e.employeeNumber ? `(${e.employeeNumber})` : ''}
                  </option>
                ))}
              </select>
            </div>

            {/* Role */}
            <div>
              <label className="block text-xs font-medium text-gray-500 mb-1.5">Portal role</label>
              <select
                value={portalRole}
                onChange={e => setPortalRole(e.target.value)}
                className={inputCls}
              >
                <option value="">Select role</option>
                {ROLES.map(r => (
                  <option key={r} value={r}>{ROLE_LABELS[r]}</option>
                ))}
              </select>
            </div>

            {/* Access level presets */}
            <div>
              <label className="block text-xs font-medium text-gray-500 mb-2">Access preset</label>
              <div className="flex gap-2 flex-wrap">
                {accessLevels.map(lvl => (
                  <button
                    key={lvl}
                    onClick={() => applyPreset(lvl)}
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
              <p className="text-xs text-gray-400 mt-2">Preset fills toggles below — adjust individually after.</p>
            </div>
          </div>
        </div>

        {/* Right — Permissions */}
        <div className="bg-white rounded-xl border border-gray-100 shadow-sm p-6">
          <div className="mb-5">
            <h2 className="text-base font-semibold text-gray-900">Module permissions</h2>
            <p className="text-xs text-gray-400 mt-0.5">Toggle specific module access</p>
          </div>
          <div className="space-y-3">
            {PERMISSION_LIST.map(perm => (
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

      {/* Error */}
      {error && <p className="mt-4 text-sm text-red-500">{error}</p>}

      {/* Buttons */}
      <div className="flex items-center gap-3 mt-6">
        <button
          onClick={() => navigate('/employer/user-access')}
          className="px-5 py-2.5 text-sm text-gray-600 border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors"
        >
          Cancel
        </button>
        <button
          onClick={handleSubmit}
          disabled={saving}
          className="px-5 py-2.5 text-sm font-medium text-white bg-[#22c55e] rounded-lg hover:bg-[#16a34a] transition-colors disabled:opacity-60 disabled:cursor-not-allowed"
        >
          {saving ? 'Saving...' : existing ? 'Update access' : 'Grant access'}
        </button>
      </div>
    </div>
  )
}
