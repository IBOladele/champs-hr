import { NavLink, Outlet } from 'react-router-dom'
import {
  LayoutDashboard, Clock, FileText, CalendarDays, Gift, Settings, Bell, Search
} from 'lucide-react'

const NAV_ITEMS = [
  { label: 'Dashboard',      path: '/employee',            icon: LayoutDashboard },
  { label: 'Attendance',     path: '/employee/attendance', icon: Clock },
  { label: 'Payslips',       path: '/employee/payslips',   icon: FileText },
  { label: 'Leave requests', path: '/employee/leave',      icon: CalendarDays },
  { label: 'Benefits',       path: '/employee/benefits',   icon: Gift },
  { label: 'Configuration',  path: '/employee/config',     icon: Settings },
]

export default function EmployeeLayout() {
  return (
    <div className="min-h-screen flex flex-col bg-gray-50">
      {/* Dark header */}
      <div className="bg-[#1b2838] flex flex-col">

        {/* Row 1: logo + search + icons */}
        <div className="px-8 py-3 flex items-center gap-4">
          <span className="text-white font-bold text-xl tracking-widest shrink-0">CHAMP</span>

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
            <div className="w-8 h-8 rounded-full bg-[#22c55e] flex items-center justify-center text-white text-sm font-semibold select-none">
              R
            </div>
          </div>
        </div>

        {/* Row 2: nav tabs */}
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

      {/* Page content */}
      <main className="flex-1 bg-gray-50">
        <Outlet />
      </main>
    </div>
  )
}
