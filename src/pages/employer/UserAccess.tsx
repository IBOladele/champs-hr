import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { Pencil, Trash2, ChevronLeft, ChevronRight } from 'lucide-react'

type SubTab =
  | 'User accounts'
  | 'Roles'
  | 'Departments'
  | 'Groups'
  | 'Integrations'
  | 'Notification'
  | 'Security'
  | 'Logs'

interface UserRow {
  id: string
  initial: string
  name: string
  employeeId: string
  jobTitle: string
  access: string
  avatarColor: string
}

const subTabs: SubTab[] = [
  'User accounts',
  'Roles',
  'Departments',
  'Groups',
  'Integrations',
  'Notification',
  'Security',
  'Logs',
]

const users: UserRow[] = [
  {
    id: '1',
    initial: 'J',
    name: 'Smith meyer',
    employeeId: '67890434',
    jobTitle: 'Project lead',
    access: 'All',
    avatarColor: 'bg-[#22c55e]',
  },
  {
    id: '2',
    initial: 'L',
    name: 'Lana Mejias',
    employeeId: '67890434',
    jobTitle: 'UX Architect',
    access: 'HR, Employee, Payroll, Reports',
    avatarColor: 'bg-blue-500',
  },
  {
    id: '3',
    initial: 'K',
    name: 'Keisha Locklear',
    employeeId: '67890434',
    jobTitle: 'Data analyst',
    access: 'HR, Employee, Payroll, Reports',
    avatarColor: 'bg-purple-500',
  },
  {
    id: '4',
    initial: 'M',
    name: 'Miley Little',
    employeeId: '67890434',
    jobTitle: 'Software engineer',
    access: 'All',
    avatarColor: 'bg-pink-500',
  },
  {
    id: '5',
    initial: 'C',
    name: 'Cyril Madril',
    employeeId: '67890434',
    jobTitle: 'Accountant',
    access: 'All',
    avatarColor: 'bg-orange-500',
  },
  {
    id: '6',
    initial: 'R',
    name: 'Rayan Petty',
    employeeId: '67890434',
    jobTitle: 'Financial advisor',
    access: 'HR, Employee, Payroll, Reports',
    avatarColor: 'bg-teal-500',
  },
  {
    id: '7',
    initial: 'D',
    name: 'Dania Navas',
    employeeId: '67890434',
    jobTitle: 'Marketing manager',
    access: 'HR, Employee, Payroll, Reports',
    avatarColor: 'bg-indigo-500',
  },
  {
    id: '8',
    initial: 'J',
    name: 'John Doesite',
    employeeId: '67890434',
    jobTitle: 'Sales representative',
    access: 'All',
    avatarColor: 'bg-[#22c55e]',
  },
]

export default function UserAccess() {
  const navigate = useNavigate()
  const [activeTab, setActiveTab] = useState<SubTab>('User accounts')

  return (
    <div className="px-8 py-6">
      {/* Page heading */}
      <h1 className="text-2xl font-bold text-gray-900 mb-6">User Access</h1>

      {/* Sub-tabs */}
      <div className="flex items-center border-b border-gray-200 mb-6 overflow-x-auto">
        {subTabs.map((tab) => (
          <button
            key={tab}
            onClick={() => setActiveTab(tab)}
            className={`flex-shrink-0 px-5 py-2.5 text-sm -mb-px transition-colors ${
              activeTab === tab
                ? 'border-b-2 border-gray-900 text-gray-900 font-medium'
                : 'text-gray-500 hover:text-gray-700'
            }`}
          >
            {tab}
          </button>
        ))}
      </div>

      {/* Section heading + Add button */}
      <div className="flex items-center justify-between mb-4">
        <h2 className="text-base font-semibold text-gray-900">User accounts</h2>
        <button
          onClick={() => navigate('/employer/user-access/add')}
          className="bg-[#22c55e] text-white px-4 py-2 rounded-lg text-sm font-medium hover:bg-green-600 transition-colors"
        >
          + Add new accounts
        </button>
      </div>

      {/* Counter */}
      <p className="text-sm text-gray-500 mb-4">10 of 50 accounts</p>

      {/* Table */}
      <div className="bg-white rounded-xl border border-gray-100 shadow-sm overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="bg-gray-50 border-b border-gray-100">
                <th className="text-left px-6 py-3 text-xs font-semibold text-gray-500 uppercase tracking-wide whitespace-nowrap">
                  Employee name
                </th>
                <th className="text-left px-6 py-3 text-xs font-semibold text-gray-500 uppercase tracking-wide whitespace-nowrap">
                  Employee ID
                </th>
                <th className="text-left px-6 py-3 text-xs font-semibold text-gray-500 uppercase tracking-wide whitespace-nowrap">
                  Job Title
                </th>
                <th className="text-left px-6 py-3 text-xs font-semibold text-gray-500 uppercase tracking-wide whitespace-nowrap">
                  Access
                </th>
                <th className="text-left px-6 py-3 text-xs font-semibold text-gray-500 uppercase tracking-wide whitespace-nowrap">
                  Actions
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {users.map((user) => (
                <tr key={user.id} className="hover:bg-gray-50 transition-colors">
                  {/* Employee name */}
                  <td className="px-6 py-4">
                    <div className="flex items-center gap-3">
                      <div
                        className={`w-8 h-8 rounded-full ${user.avatarColor} flex items-center justify-center text-white text-xs font-semibold flex-shrink-0`}
                      >
                        {user.initial}
                      </div>
                      <span className="font-medium text-gray-900">{user.name}</span>
                    </div>
                  </td>
                  {/* Employee ID */}
                  <td className="px-6 py-4 text-gray-500 whitespace-nowrap">{user.employeeId}</td>
                  {/* Job Title */}
                  <td className="px-6 py-4 text-gray-600 whitespace-nowrap">{user.jobTitle}</td>
                  {/* Access — plain text */}
                  <td className="px-6 py-4 text-gray-700 text-sm">{user.access}</td>
                  {/* Actions */}
                  <td className="px-6 py-4">
                    <div className="flex items-center gap-4">
                      <button className="flex items-center gap-1 text-sm text-gray-600 hover:text-gray-900 transition-colors">
                        <Pencil size={13} />
                        Edit account
                      </button>
                      <button className="flex items-center gap-1 text-sm text-red-500 hover:text-red-700 transition-colors">
                        <Trash2 size={13} />
                        Delete
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Pagination */}
      <div className="flex items-center gap-1 mt-5">
        <button className="flex items-center gap-1 px-3 py-1.5 text-sm text-gray-500 hover:text-gray-700 transition-colors">
          <ChevronLeft size={14} />
          Previous
        </button>
        {[1, 2, 3, 4].map((page) => (
          <button
            key={page}
            className={`w-8 h-8 rounded text-sm font-medium transition-colors ${
              page === 2
                ? 'bg-gray-900 text-white'
                : 'text-gray-500 hover:bg-gray-100 hover:text-gray-700'
            }`}
          >
            {page}
          </button>
        ))}
        <span className="px-1 text-gray-400 text-sm">...</span>
        <button className="w-8 h-8 rounded text-sm font-medium text-gray-500 hover:bg-gray-100 hover:text-gray-700 transition-colors">
          10
        </button>
        <button className="w-8 h-8 rounded text-sm font-medium text-gray-500 hover:bg-gray-100 hover:text-gray-700 transition-colors">
          11
        </button>
        <button className="flex items-center gap-1 px-3 py-1.5 text-sm text-gray-500 hover:text-gray-700 transition-colors">
          Next
          <ChevronRight size={14} />
        </button>
      </div>
    </div>
  )
}
