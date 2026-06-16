import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import {
  Search, Plus, Users, UserCheck, UserPlus, Clock,
  ChevronLeft, ChevronRight, CirclePlus, ChevronsUpDown, Eye
} from 'lucide-react'

type Tab = 'active' | 'invited' | 'pending' | 'terminated'

interface Employee {
  id: string
  employeeId: string
  name: string
  initial: string
  avatarColor: string
  email: string
  department: string
  jobTitle: string
  status: 'Active' | 'Invited' | 'Pending review' | 'Terminated'
}

const employees: Employee[] = [
  {
    id: '1',
    employeeId: '67890434',
    name: 'Smith meyer',
    initial: 'J',
    avatarColor: 'bg-orange-200 text-orange-800',
    email: 'jamisondowling@gmail.com',
    department: 'Design',
    jobTitle: 'Project lead',
    status: 'Active',
  },
  {
    id: '2',
    employeeId: '45678657',
    name: 'Lana Mejias',
    initial: 'L',
    avatarColor: 'bg-purple-200 text-purple-800',
    email: 'lana.mejias@gmail.com',
    department: 'Engineering',
    jobTitle: 'UX Architect',
    status: 'Active',
  },
  {
    id: '3',
    employeeId: '78901975',
    name: 'Keisha Locklear',
    initial: 'K',
    avatarColor: 'bg-green-200 text-green-800',
    email: 'keishalocklear@gmail.com',
    department: 'Product',
    jobTitle: 'Data analyst',
    status: 'Active',
  },
  {
    id: '4',
    employeeId: '89012975',
    name: 'Miley Little',
    initial: 'M',
    avatarColor: 'bg-blue-200 text-blue-800',
    email: 'mileylittle@gmail.com',
    department: 'Marketing',
    jobTitle: 'Software Engineer',
    status: 'Active',
  },
  {
    id: '5',
    employeeId: '90123456',
    name: 'Diana Torres',
    initial: 'D',
    avatarColor: 'bg-rose-200 text-rose-800',
    email: 'diana.torres@gmail.com',
    department: 'HR',
    jobTitle: 'HR Manager',
    status: 'Active',
  },
  {
    id: '6',
    employeeId: '01234567',
    name: 'Aaron Blunt',
    initial: 'A',
    avatarColor: 'bg-teal-200 text-teal-800',
    email: 'aaron.blunt@gmail.com',
    department: 'Finance',
    jobTitle: 'Financial Analyst',
    status: 'Active',
  },
]

const tabs: { key: Tab; label: string }[] = [
  { key: 'active', label: 'Active' },
  { key: 'invited', label: 'Invited' },
  { key: 'pending', label: 'Pending review' },
  { key: 'terminated', label: 'Terminated' },
]

export default function Employees() {
  const [activeTab, setActiveTab] = useState<Tab>('active')
  const [search, setSearch] = useState('')
  const navigate = useNavigate()

  const filtered = employees.filter(
    (e) =>
      e.name.toLowerCase().includes(search.toLowerCase()) ||
      e.email.toLowerCase().includes(search.toLowerCase()) ||
      e.department.toLowerCase().includes(search.toLowerCase()) ||
      e.jobTitle.toLowerCase().includes(search.toLowerCase())
  )

  return (
    <div className="max-w-7xl mx-auto">
      {/* Page header row */}
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-2xl font-bold text-gray-900">Employees</h1>
        <div className="flex items-center gap-3">
          <button className="flex items-center gap-2 px-4 py-2 text-sm font-medium text-gray-600 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors">
            <CirclePlus size={15} />
            Import Employees
          </button>
          <button
            onClick={() => navigate('/employer/employees/add')}
            className="flex items-center gap-2 px-4 py-2 text-sm font-medium text-white rounded-lg transition-colors" style={{ backgroundColor: '#22c55e' }}>
            <Plus size={15} />
            Add new employee
          </button>
        </div>
      </div>

      {/* Stat cards */}
      <div className="grid grid-cols-4 gap-4 mb-6">
        {/* Total employees */}
        <div className="bg-white rounded-xl border border-gray-100 p-5 relative">
          <div className="absolute top-4 right-4">
            <div className="bg-green-100 text-green-600 rounded-lg p-2 flex items-center justify-center">
              <Users size={18} />
            </div>
          </div>
          <p className="text-sm text-gray-500 mb-1">Total employees</p>
          <p className="text-2xl font-bold text-gray-900">54,567</p>
        </div>

        {/* Active employees */}
        <div className="bg-white rounded-xl border border-gray-100 p-5 relative">
          <div className="absolute top-4 right-4">
            <div className="bg-amber-100 text-amber-600 rounded-lg p-2 flex items-center justify-center">
              <UserCheck size={18} />
            </div>
          </div>
          <p className="text-sm text-gray-500 mb-1">Active employees</p>
          <p className="text-2xl font-bold text-gray-900">24,585</p>
        </div>

        {/* Invited employees */}
        <div className="bg-white rounded-xl border border-gray-100 p-5 relative">
          <div className="absolute top-4 right-4">
            <div className="bg-blue-100 text-blue-600 rounded-lg p-2 flex items-center justify-center">
              <UserPlus size={18} />
            </div>
          </div>
          <p className="text-sm text-gray-500 mb-1">Invited employees</p>
          <p className="text-2xl font-bold text-gray-900">958</p>
        </div>

        {/* Pending review */}
        <div className="bg-white rounded-xl border border-gray-100 p-5 relative">
          <div className="absolute top-4 right-4">
            <div className="bg-gray-200 text-gray-600 rounded-lg p-2 flex items-center justify-center">
              <Clock size={18} />
            </div>
          </div>
          <p className="text-sm text-gray-500 mb-1">Pending review</p>
          <p className="text-2xl font-bold text-gray-900">30</p>
        </div>
      </div>

      {/* Sub-tabs */}
      <div className="flex items-center border-b border-gray-200 mb-0">
        {tabs.map((tab) => (
          <button
            key={tab.key}
            onClick={() => setActiveTab(tab.key)}
            className={`px-4 py-2.5 text-sm transition-colors ${
              activeTab === tab.key
                ? 'font-medium text-gray-900 border-b-2 border-gray-900'
                : 'text-gray-400 hover:text-gray-600 border-b-2 border-transparent'
            }`}
          >
            {tab.label}
          </button>
        ))}
      </div>

      {/* Filter/Search + Table card */}
      <div className="bg-white rounded-xl border border-gray-100 overflow-hidden">
        {/* Filter row */}
        <div className="flex items-center gap-3 p-4 border-b border-gray-100">
          {/* Search */}
          <div className="flex-1 relative">
            <Search size={15} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
            <input
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Search for an employee"
              className="w-full pl-9 pr-4 py-2 text-sm border border-gray-200 rounded-lg focus:outline-none focus:ring-1 focus:ring-gray-300 focus:border-gray-300"
            />
          </div>

          {/* Sort dropdowns */}
          <button className="flex items-center gap-2 px-3 py-2 text-sm text-gray-600 border border-gray-200 rounded-lg hover:bg-gray-50 whitespace-nowrap">
            Sort by departments
            <ChevronsUpDown size={14} className="text-gray-400" />
          </button>
          <button className="flex items-center gap-2 px-3 py-2 text-sm text-gray-600 border border-gray-200 rounded-lg hover:bg-gray-50 whitespace-nowrap">
            Sort by status
            <ChevronsUpDown size={14} className="text-gray-400" />
          </button>
          <button className="flex items-center gap-2 px-3 py-2 text-sm text-gray-600 border border-gray-200 rounded-lg hover:bg-gray-50 whitespace-nowrap">
            Sort by groups
            <ChevronsUpDown size={14} className="text-gray-400" />
          </button>
        </div>

        {/* Count label */}
        <div className="px-4 py-3 border-b border-gray-100">
          <span className="text-xs text-gray-400">10 of 50 employees</span>
        </div>

        {/* Table */}
        <table className="w-full">
          <thead>
            <tr className="bg-white border-b border-gray-100">
              <th className="px-4 py-3 text-left w-8">
                <input type="checkbox" className="rounded border-gray-300" />
              </th>
              <th className="px-4 py-3 text-left text-xs font-medium text-gray-400 uppercase tracking-wide">
                Employee name
              </th>
              <th className="px-4 py-3 text-left text-xs font-medium text-gray-400 uppercase tracking-wide">
                Employee ID
              </th>
              <th className="px-4 py-3 text-left text-xs font-medium text-gray-400 uppercase tracking-wide">
                Email
              </th>
              <th className="px-4 py-3 text-left text-xs font-medium text-gray-400 uppercase tracking-wide">
                Department
              </th>
              <th className="px-4 py-3 text-left text-xs font-medium text-gray-400 uppercase tracking-wide">
                Job Title
              </th>
              <th className="px-4 py-3 text-left text-xs font-medium text-gray-400 uppercase tracking-wide">
                Status
              </th>
              <th className="px-4 py-3 text-left text-xs font-medium text-gray-400 uppercase tracking-wide">
                Actions
              </th>
            </tr>
          </thead>
          <tbody>
            {filtered.map((emp) => (
              <tr
                key={emp.id}
                className="border-b border-gray-100 hover:bg-gray-50 transition-colors"
              >
                {/* Checkbox */}
                <td className="px-4 py-4">
                  <input type="checkbox" className="rounded border-gray-300" />
                </td>

                {/* Employee name */}
                <td className="px-4 py-4">
                  <div className="flex items-center gap-2.5">
                    <div
                      className={`w-7 h-7 rounded-full flex items-center justify-center text-xs font-semibold flex-shrink-0 ${emp.avatarColor}`}
                    >
                      {emp.initial}
                    </div>
                    <span className="text-sm text-gray-800">{emp.name}</span>
                  </div>
                </td>

                {/* Employee ID */}
                <td className="px-4 py-4 text-sm text-gray-600">{emp.employeeId}</td>

                {/* Email */}
                <td className="px-4 py-4 text-sm text-gray-600">{emp.email}</td>

                {/* Department */}
                <td className="px-4 py-4 text-sm text-gray-600">{emp.department}</td>

                {/* Job Title */}
                <td className="px-4 py-4 text-sm text-gray-600">{emp.jobTitle}</td>

                {/* Status */}
                <td className="px-4 py-4">
                  <span className="inline-flex items-center text-xs bg-green-50 text-green-600 border border-green-200 rounded-full px-2 py-0.5">
                    {emp.status}
                  </span>
                </td>

                {/* Actions */}
                <td className="px-4 py-4">
                  <button
                    onClick={() => navigate(`/employer/employees/${emp.id}`)}
                    className="flex items-center gap-1.5 text-sm text-gray-500 hover:text-gray-700 transition-colors"
                  >
                    <Eye size={13} />
                    View employee
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>

        {filtered.length === 0 && (
          <div className="py-16 text-center text-gray-400">
            <Users size={32} className="mx-auto mb-3 opacity-30" />
            <p className="text-sm">No employees match your search</p>
          </div>
        )}

        {/* Pagination */}
        <div className="flex items-center justify-between px-4 py-3 border-t border-gray-100">
          <p className="text-sm text-gray-500">Showing 1-6 of 50</p>
          <div className="flex items-center gap-2">
            <button
              className="flex items-center gap-1 px-3 py-1.5 text-sm border border-gray-200 rounded-lg text-gray-600 hover:bg-gray-50 disabled:opacity-40 disabled:cursor-not-allowed"
              disabled
            >
              <ChevronLeft size={14} />
              Prev
            </button>
            <button className="flex items-center gap-1 px-3 py-1.5 text-sm border border-gray-200 rounded-lg text-gray-600 hover:bg-gray-50">
              Next
              <ChevronRight size={14} />
            </button>
          </div>
        </div>
      </div>
    </div>
  )
}
