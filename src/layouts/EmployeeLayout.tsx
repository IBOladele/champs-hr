import { NavLink, Outlet, useNavigate } from 'react-router-dom'
import {
  LayoutDashboard, Clock, FileText, CalendarDays, Gift, Settings, Bell, Search, LogOut
} from 'lucide-react'
import { useAuth } from '../context/AuthContext'
import { Logo } from '../components/Logo'

const NAV_ITEMS = [
  { label: 'Dashboard',      path: '/employee',            icon: LayoutDashboard },
  { label: 'Attendance',     path: '/employee/attendance', icon: Clock },
  { label: 'Payslips',       path: '/employee/payslips',   icon: FileText },
  { label: 'Leave requests', path: '/employee/leave',      icon: CalendarDays },
  { label: 'Benefits',       path: '/employee/benefits',   icon: Gift },
  { label: 'Configuration',  path: '/employee/config',     icon: Settings },
]

function initials(name: string): string {
  return name
    .split(' ')
    .filter(Boolean)
    .slice(0, 2)
    .map(n => n[0].toUpperCase())
    .join('')
}

export default function EmployeeLayout() {
  const { user, logout } = useAuth()
  const navigate = useNavigate()

  function handleLogout() {
    logout()
    navigate('/login', { replace: true })
  }

  const avatarText = user ? initials(user.fullName) : '?'

  return (
    <div className="min-h-screen flex flex-col bg-gray-50">
      <div className="bg-[#1b2838] flex flex-col">

        <div className="px-8 py-3 flex items-center gap-4">
          <Logo theme="dark" size={28} className="shrink-0" />

          <div className="flex-1 max-w-xl relative">
            <Search size={15} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
            <input
              type="text"
              placeholder="Search for payslips, attendance, benefits..."
              className="w-full bg-[#243447] text-gray-300 placeholder-gray-500 text-sm rounded-lg pl-9 pr-4 py-2 outline-none focus:ring-1 focus:ring-[#22c55e]/50"
            />
          </div>

          <div className="flex items-center gap-3 ml-auto">
            <button className="relative text-gray-400 hover:text-white transition-colors">
              <Bell size={20} />
              <span className="absolute -top-0.5 -right-0.5 w-2 h-2 bg-[#22c55e] rounded-full" />
            </button>

            <div className="flex items-center gap-2">
              <div className="w-8 h-8 rounded-full bg-[#22c55e] flex items-center justify-center text-white text-sm font-semibold select-none">
                {avatarText}
              </div>
              {user && (
                <span className="hidden xl:block text-sm text-gray-300 max-w-[120px] truncate">{user.fullName}</span>
              )}
            </div>

            <button
              onClick={handleLogout}
              title="Log out"
              className="text-gray-400 hover:text-white transition-colors"
            >
              <LogOut size={18} />
            </button>
          </div>
        </div>

        <div className="px-4 pb-2 flex items-center gap-1 overflow-x-auto">
          {NAV_ITEMS.map(({ label, path, icon: Icon }) => (
            <NavLink
              key={path}
              to={path}
              end={path === '/employee'}
              className={({ isActive }) =>
                isActive
                  ? 'bg-[#22c55e] text-white rounded-full px-4 py-1.5 flex items-center gap-1.5 text-sm font-medium whitespace-nowrap'
                  : 'text-gray-300 hover:text-white px-3 py-1.5 flex items-center gap-1.5 text-sm whitespace-nowrap transition-colors'
              }
            >
              <Icon size={14} />
              {label}
            </NavLink>
          ))}
        </div>

      </div>

      <main className="flex-1 bg-gray-50 p-6">
        <div className="max-w-7xl mx-auto">
          <Outlet />
        </div>
      </main>
    </div>
  )
}
