import { useState } from 'react'
import { NavLink, Outlet, useNavigate, useLocation } from 'react-router-dom'
import {
  LayoutDashboard, Users, CreditCard,
  FileText, Gift, Settings, Bell, Search,
  ChevronDown
} from 'lucide-react'
import { useAuth } from '../context/AuthContext'
import { Logo } from '../components/Logo'

function initials(name: string): string {
  return name
    .split(' ')
    .filter(Boolean)
    .slice(0, 2)
    .map(n => n[0].toUpperCase())
    .join('')
}

interface NavItemProps {
  label: string
  path: string
  icon: React.ElementType
  end?: boolean
}

function SidebarNavItem({ label, path, icon: Icon, end }: NavItemProps) {
  return (
    <NavLink
      to={path}
      end={end}
      className={({ isActive }) =>
        isActive
          ? 'flex items-center gap-2.5 px-[10px] py-[9px] rounded-[7px] text-[14px] font-semibold bg-white text-[#1b2838]'
          : 'flex items-center gap-2.5 px-[10px] py-[9px] rounded-[7px] text-[14px] text-gray-300 hover:bg-white/10 transition-colors'
      }
    >
      <Icon size={15} />
      {label}
    </NavLink>
  )
}

interface SubItemProps {
  label: string
  path: string
}

function SidebarSubItem({ label, path }: SubItemProps) {
  return (
    <NavLink
      to={path}
      className={({ isActive }) =>
        isActive
          ? 'flex items-center pl-[22px] pr-[10px] py-[6px] rounded-[7px] text-[13px] font-semibold bg-white text-[#1b2838]'
          : 'flex items-center pl-[22px] pr-[10px] py-[6px] rounded-[7px] text-[13px] text-gray-400 hover:bg-white/10 transition-colors'
      }
    >
      {label}
    </NavLink>
  )
}

interface CollapsibleGroupProps {
  label: string
  icon: React.ElementType
  childPaths: string[]
  children: React.ReactNode
}

function CollapsibleGroup({ label, icon: Icon, childPaths, children }: CollapsibleGroupProps) {
  const { pathname } = useLocation()
  const isChildActive = childPaths.some(p => pathname === p || pathname.startsWith(p + '/'))
  const [open, setOpen] = useState(isChildActive)

  return (
    <div>
      <button
        onClick={() => setOpen(o => !o)}
        className={`w-full flex items-center gap-2.5 px-[10px] py-[9px] rounded-[7px] text-[14px] transition-colors ${
          isChildActive ? 'text-white font-semibold' : 'text-gray-300 hover:bg-white/10'
        }`}
      >
        <Icon size={15} />
        <span className="flex-1 text-left">{label}</span>
        <ChevronDown
          size={14}
          className={`transition-transform duration-150 ${open ? 'rotate-180' : ''}`}
        />
      </button>
      {open && (
        <div className="flex flex-col gap-0.5 mt-0.5">
          {children}
        </div>
      )}
    </div>
  )
}

export default function EmployerLayout() {
  const { user, logout } = useAuth()
  const navigate = useNavigate()

  function handleLogout() {
    logout()
    navigate('/login', { replace: true })
  }

  const avatarText = user ? initials(user.fullName) : '?'
  const companyName = (user as any)?.tenantId ?? 'Your company'

  return (
    <div className="min-h-screen flex" style={{ fontFamily: 'inherit' }}>

      {/* ── Sidebar ───────────────────────────────────────────────── */}
      <aside
        className="flex flex-col shrink-0"
        style={{
          width: 232,
          background: '#1b2838',
          padding: '22px 14px',
          gap: 22,
          minHeight: '100vh',
        }}
      >
        {/* Logo */}
        <div className="ml-[10px]">
          <Logo theme="dark" size={24} />
        </div>

        {/* Company switcher */}
        <div
          className="rounded-lg cursor-pointer hover:bg-white/10 transition-colors"
          style={{ background: 'rgba(255,255,255,0.06)', padding: 10 }}
        >
          <div className="flex items-center justify-between">
            <div>
              <p className="text-[11px] text-gray-400">Company</p>
              <p className="text-[13px] font-semibold text-white">{companyName}</p>
            </div>
            <ChevronDown size={14} className="text-gray-400" />
          </div>
        </div>

        {/* Nav */}
        <nav className="flex flex-col gap-0.5">
          <SidebarNavItem label="Home" path="/employer" icon={LayoutDashboard} end />

          <CollapsibleGroup
            label="People"
            icon={Users}
            childPaths={['/employer/employees', '/employer/hr-ops', '/employer/documents']}
          >
            <SidebarSubItem label="Employees"  path="/employer/employees" />
            <SidebarSubItem label="HR ops"     path="/employer/hr-ops" />
            <SidebarSubItem label="Documents"  path="/employer/documents" />
          </CollapsibleGroup>

          <SidebarNavItem label="Payroll"  path="/employer/payroll"  icon={CreditCard} />
          <SidebarNavItem label="Benefits" path="/employer/benefits" icon={Gift} />

          <CollapsibleGroup
            label="Reports"
            icon={FileText}
            childPaths={['/employer/reports', '/employer/analytics']}
          >
            <SidebarSubItem label="Saved reports" path="/employer/reports" />
            <SidebarSubItem label="Analytics"     path="/employer/analytics" />
          </CollapsibleGroup>
        </nav>

        {/* Footer */}
        <div className="mt-auto flex flex-col gap-0.5">
          <CollapsibleGroup
            label="Settings"
            icon={Settings}
            childPaths={['/employer/user-access', '/employer/config']}
          >
            <SidebarSubItem label="User access"   path="/employer/user-access" />
            <SidebarSubItem label="Configuration" path="/employer/config" />
          </CollapsibleGroup>

          <div
            className="flex items-center gap-2.5 mt-2 pt-3"
            style={{ borderTop: '1px solid rgba(255,255,255,0.1)' }}
          >
            <div
              className="shrink-0 flex items-center justify-center rounded-full text-[12px] font-bold select-none"
              style={{ width: 30, height: 30, background: '#22c55e', color: '#1b2838' }}
            >
              {avatarText}
            </div>
            <div className="min-w-0">
              <p className="text-[13px] font-semibold text-white truncate">
                {user?.fullName ?? ''}
              </p>
              <p className="text-[11px] text-gray-400">
                Owner ·{' '}
                <button
                  onClick={handleLogout}
                  className="underline hover:text-white transition-colors"
                >
                  Sign out
                </button>
              </p>
            </div>
          </div>
        </div>
      </aside>

      {/* ── Right side ────────────────────────────────────────────── */}
      <div className="flex flex-col flex-1 min-w-0">

        {/* Top bar */}
        <header className="h-16 bg-white border-b border-gray-200 px-10 flex items-center gap-4 shrink-0">
          <div className="relative" style={{ width: 420 }}>
            <Search size={15} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
            <input
              type="text"
              placeholder="Search employees, documents, reports…"
              className="w-full h-[38px] border border-gray-200 rounded-[8px] pl-9 pr-14 text-[14px] placeholder-gray-400 outline-none focus:ring-1 focus:ring-[#22c55e]/50"
            />
            <span className="absolute right-3 top-1/2 -translate-y-1/2 text-[11px] text-gray-400 select-none">
              ⌘K
            </span>
          </div>

          <div className="ml-auto flex items-center gap-3">
            <span className="text-[14px] text-gray-500 cursor-pointer hover:text-gray-700">Help</span>
            <button
              className="flex items-center justify-center rounded-[8px] border border-gray-200 text-gray-500 hover:text-gray-700 transition-colors"
              style={{ width: 34, height: 34 }}
            >
              <Bell size={16} />
            </button>
          </div>
        </header>

        {/* Main content */}
        <main className="flex-1 bg-gray-50 p-6 overflow-y-auto">
          <Outlet />
        </main>
      </div>
    </div>
  )
}
