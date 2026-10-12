import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { Pencil, Trash2, Users, Shield, Crown } from 'lucide-react'
import { userAccess as userAccessApi } from '../../lib/api'
import type { PortalUser } from '../../lib/api'

type SubTab = 'User accounts' | 'Roles' | 'Security'

const subTabs: SubTab[] = ['User accounts', 'Roles', 'Security']

const ROLE_LABELS: Record<string, string> = {
  Admin:            'Admin',
  HR_Manager:       'HR Manager',
  Finance_Manager:  'Finance Manager',
  Department_Head:  'Department Head',
  Viewer:           'Viewer',
}

function initials(name: string) {
  return name.split(' ').map(p => p[0]).filter(Boolean).slice(0, 2).join('').toUpperCase() || '?'
}

function avatarBg(name: string) {
  const colors = ['bg-amber-500', 'bg-blue-500', 'bg-purple-500', 'bg-rose-500', 'bg-teal-500', 'bg-indigo-500']
  let h = 0; for (const c of name) h = (h * 31 + c.charCodeAt(0)) & 0xffffffff
  return colors[Math.abs(h) % colors.length]
}

export default function UserAccess() {
  const navigate = useNavigate()
  const [activeTab, setActiveTab] = useState<SubTab>('User accounts')
  const [users, setUsers] = useState<PortalUser[]>([])
  const [loading, setLoading] = useState(true)
  const [revoking, setRevoking] = useState<string | null>(null)

  useEffect(() => {
    userAccessApi.list().then(setUsers).catch(() => {}).finally(() => setLoading(false))
  }, [])

  async function handleRevoke(user: PortalUser) {
    if (!confirm(`Remove portal access for ${user.fullName}?`)) return
    setRevoking(user.id)
    try {
      await userAccessApi.revoke(user.id)
      setUsers(prev => prev.filter(u => u.id !== user.id))
    } finally {
      setRevoking(null)
    }
  }

  const nonOwners = users.filter(u => !u.isOwner)
  const owner = users.find(u => u.isOwner)

  return (
    <div>
      <h1 className="text-2xl font-bold text-gray-900 mb-6">User Access</h1>

      {/* Tabs */}
      <div className="flex items-center border-b border-gray-200 mb-6">
        {subTabs.map(tab => (
          <button
            key={tab}
            onClick={() => setActiveTab(tab)}
            className={`px-5 py-2.5 text-sm -mb-px transition-colors ${
              activeTab === tab
                ? 'border-b-2 border-gray-900 text-gray-900 font-medium'
                : 'text-gray-500 hover:text-gray-700'
            }`}
          >
            {tab}
          </button>
        ))}
      </div>

      {/* ── User accounts tab ── */}
      {activeTab === 'User accounts' && (
        <>
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-base font-semibold text-gray-900">User accounts</h2>
            <button
              onClick={() => navigate('/employer/user-access/add')}
              className="bg-[#d97706] text-white px-4 py-2 rounded-lg text-sm font-medium hover:bg-[#b45309] transition-colors"
            >
              + Add access
            </button>
          </div>

          <p className="text-sm text-gray-500 mb-4">{users.length} {users.length === 1 ? 'account' : 'accounts'}</p>

          <div className="bg-white rounded-xl border border-gray-100 shadow-sm overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="bg-gray-50 border-b border-gray-100">
                    <th className="text-left px-6 py-3 text-xs font-semibold text-gray-500 uppercase tracking-wide whitespace-nowrap">Name</th>
                    <th className="text-left px-6 py-3 text-xs font-semibold text-gray-500 uppercase tracking-wide whitespace-nowrap">Email</th>
                    <th className="text-left px-6 py-3 text-xs font-semibold text-gray-500 uppercase tracking-wide whitespace-nowrap">Job title</th>
                    <th className="text-left px-6 py-3 text-xs font-semibold text-gray-500 uppercase tracking-wide whitespace-nowrap">Role</th>
                    <th className="text-left px-6 py-3 text-xs font-semibold text-gray-500 uppercase tracking-wide whitespace-nowrap">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-100">
                  {loading && (
                    <tr>
                      <td colSpan={5} className="px-6 py-8 text-center text-sm text-gray-400">Loading...</td>
                    </tr>
                  )}
                  {!loading && users.map(user => (
                    <tr key={user.id} className="hover:bg-gray-50 transition-colors">
                      <td className="px-6 py-4">
                        <div className="flex items-center gap-3">
                          <div className={`w-8 h-8 rounded-full ${avatarBg(user.fullName)} flex items-center justify-center text-white text-xs font-semibold flex-shrink-0`}>
                            {initials(user.fullName)}
                          </div>
                          <span className="font-medium text-gray-900">{user.fullName}</span>
                        </div>
                      </td>
                      <td className="px-6 py-4 text-gray-500 whitespace-nowrap">{user.email}</td>
                      <td className="px-6 py-4 text-gray-600 whitespace-nowrap">{user.jobTitle ?? <span className="text-gray-300">—</span>}</td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        {user.isOwner ? (
                          <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-amber-100 text-amber-700 text-xs font-medium">
                            <Crown size={11} />
                            Owner
                          </span>
                        ) : (
                          <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-blue-100 text-blue-700 text-xs font-medium">
                            <Shield size={11} />
                            {ROLE_LABELS[user.portalRole ?? ''] ?? user.portalRole}
                          </span>
                        )}
                      </td>
                      <td className="px-6 py-4">
                        {user.isOwner ? (
                          <span className="text-xs text-gray-400">—</span>
                        ) : (
                          <div className="flex items-center gap-4">
                            <button
                              onClick={() => navigate('/employer/user-access/add', { state: { user } })}
                              className="flex items-center gap-1 text-sm text-gray-600 hover:text-gray-900 transition-colors"
                            >
                              <Pencil size={13} />
                              Edit
                            </button>
                            <button
                              onClick={() => handleRevoke(user)}
                              disabled={revoking === user.id}
                              className="flex items-center gap-1 text-sm text-red-500 hover:text-red-700 transition-colors disabled:opacity-50"
                            >
                              <Trash2 size={13} />
                              {revoking === user.id ? 'Removing...' : 'Revoke'}
                            </button>
                          </div>
                        )}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            {!loading && users.length === 0 && (
              <div className="flex flex-col items-center justify-center py-16 text-center">
                <Users size={40} className="text-gray-300 mb-3" />
                <p className="text-sm font-medium text-gray-500">No user accounts yet</p>
                <p className="text-xs text-gray-400 mt-1">Grant portal access to team members</p>
              </div>
            )}
          </div>
        </>
      )}

      {/* ── Roles tab ── */}
      {activeTab === 'Roles' && (
        <div className="grid grid-cols-3 gap-4">
          {[
            { role: 'Admin',           desc: 'Full access to all modules and settings',           color: 'bg-amber-100 text-amber-700' },
            { role: 'HR Manager',      desc: 'Employees, HR Ops, Leave, Documents, Benefits',     color: 'bg-blue-100 text-blue-700'   },
            { role: 'Finance Manager', desc: 'Payroll, Analytics, Reports, Documents',            color: 'bg-purple-100 text-purple-700' },
            { role: 'Department Head', desc: 'View team members, approve leave, attendance',      color: 'bg-teal-100 text-teal-700'   },
            { role: 'Viewer',          desc: 'Read-only access to assigned modules',              color: 'bg-gray-100 text-gray-600'   },
          ].map(({ role, desc, color }) => {
            const count = nonOwners.filter(u => (ROLE_LABELS[u.portalRole ?? ''] ?? u.portalRole) === role).length
            return (
              <div key={role} className="bg-white rounded-xl border border-gray-100 p-5">
                <div className="flex items-start justify-between mb-3">
                  <span className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-medium ${color}`}>
                    <Shield size={11} />
                    {role}
                  </span>
                  <span className="text-xs text-gray-400">{count} {count === 1 ? 'user' : 'users'}</span>
                </div>
                <p className="text-xs text-gray-500 leading-relaxed">{desc}</p>
              </div>
            )
          })}
          {/* Owner */}
          <div className="bg-white rounded-xl border border-amber-100 p-5">
            <div className="flex items-start justify-between mb-3">
              <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-amber-100 text-amber-700 text-xs font-medium">
                <Crown size={11} />
                Owner
              </span>
              <span className="text-xs text-gray-400">{owner ? `${owner.fullName}` : '—'}</span>
            </div>
            <p className="text-xs text-gray-500 leading-relaxed">Unrestricted access. Account creator.</p>
          </div>
        </div>
      )}

      {/* ── Security tab ── */}
      {activeTab === 'Security' && (
        <div className="max-w-xl space-y-4">
          {[
            { label: 'Two-factor authentication', desc: 'Require 2FA for all portal users', enabled: false },
            { label: 'Session timeout', desc: 'Automatically log out inactive sessions after 30 minutes', enabled: true },
            { label: 'Single sign-on (SSO)', desc: 'Allow login via your identity provider', enabled: false },
          ].map(({ label, desc, enabled }) => (
            <div key={label} className="bg-white rounded-xl border border-gray-100 p-5 flex items-center justify-between gap-4">
              <div>
                <p className="text-sm font-medium text-gray-900">{label}</p>
                <p className="text-xs text-gray-400 mt-0.5">{desc}</p>
              </div>
              <div className={`relative w-10 h-5 rounded-full flex-shrink-0 ${enabled ? 'bg-[#d97706]' : 'bg-gray-200'}`}>
                <span className={`absolute top-0.5 w-4 h-4 rounded-full bg-white shadow transition-all ${enabled ? 'left-5' : 'left-0.5'}`} />
              </div>
            </div>
          ))}
          <p className="text-xs text-gray-400 pl-1">Security settings coming soon.</p>
        </div>
      )}
    </div>
  )
}
