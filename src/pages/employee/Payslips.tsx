import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { FileText, Download, Search, ChevronDown, Eye } from 'lucide-react'
import { usePageTitle } from '../../hooks/usePageTitle'
import { employeeDashboard, type EmployeeDashboardData } from '../../lib/api'

type PayslipStatus = 'Loaded' | 'Pending' | 'Refund'

interface PayslipRow {
  id: string
  period: string
  payDate: string
  netPay: string
  accountNumber: string
  status: PayslipStatus
}

function StatusPill({ status }: { status: PayslipStatus }) {
  const cls =
    status === 'Loaded'
      ? 'bg-green-100 text-green-700'
      : status === 'Pending'
      ? 'bg-amber-100 text-amber-700'
      : 'bg-red-100 text-red-700'
  return (
    <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${cls}`}>
      {status}
    </span>
  )
}

export default function Payslips() {
  usePageTitle('My Payslips')

  const navigate = useNavigate()
  const [rows, setRows] = useState<PayslipRow[]>([])
  const [search, setSearch] = useState('')

  useEffect(() => {
    employeeDashboard.get()
      .then((data: EmployeeDashboardData) => {
        setRows(data.recentPayslips.map(p => ({
          period: p.periodStart
            ? new Date(p.periodStart).toLocaleDateString('en-US', { month: 'long', year: 'numeric' })
            : '—',
          payDate: p.periodEnd
            ? new Date(p.periodEnd).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })
            : '—',
          netPay: p.netPay ? `$${parseFloat(p.netPay).toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}` : '—',
          accountNumber: '****',
          status: p.status === 'completed' ? 'Loaded' : 'Pending' as PayslipStatus,
          id: p.id,
        })))
      })
      .catch(() => {})
  }, [])

  const filtered = rows.filter(r =>
    r.period.toLowerCase().includes(search.toLowerCase()) ||
    r.payDate.toLowerCase().includes(search.toLowerCase())
  )

  return (
    <div className="">

      {/* Page heading */}
      <h1 className="text-2xl font-bold text-gray-900 mb-6">Payslips</h1>

      {/* Stat cards */}
      <div className="grid grid-cols-3 gap-4 mb-6">
        {[
          { label: 'Last pay',      value: rows[0]?.netPay ?? '—', iconCls: 'text-green-500',  bg: 'bg-green-50'  },
          { label: 'Total payslips', value: String(rows.length),   iconCls: 'text-blue-500',   bg: 'bg-blue-50'   },
          { label: 'Pending',       value: String(rows.filter(r => r.status === 'Pending').length), iconCls: 'text-amber-500', bg: 'bg-amber-50' },
        ].map(({ label, value, iconCls, bg }) => (
          <div key={label} className="bg-white rounded-xl border border-gray-100 shadow-sm p-5 flex items-start justify-between">
            <div>
              <p className="text-xs text-gray-500 mb-1">{label}</p>
              <p className="text-2xl font-bold text-gray-900">{value}</p>
            </div>
            <div className={`w-9 h-9 ${bg} rounded-lg flex items-center justify-center flex-shrink-0`}>
              <FileText size={18} className={iconCls} />
            </div>
          </div>
        ))}
      </div>

      {/* Search + filter bar */}
      <div className="flex items-center gap-3 mb-4">
        <div className="relative flex-1 max-w-xs">
          <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
          <input
            type="text"
            value={search}
            onChange={e => setSearch(e.target.value)}
            placeholder="Search for payslip..."
            className="w-full pl-9 pr-4 py-2 text-sm border border-gray-200 rounded-lg focus:outline-none focus:border-[#22c55e]"
          />
        </div>
        <button className="flex items-center gap-1.5 text-sm text-gray-600 border border-gray-200 rounded-lg px-3 py-2 hover:bg-gray-50">
          Archive payslips
        </button>
        <button className="flex items-center gap-1.5 text-sm text-gray-600 border border-gray-200 rounded-lg px-3 py-2 hover:bg-gray-50 ml-auto">
          Sort by status <ChevronDown size={13} />
        </button>
      </div>

      {/* Table */}
      <div className="bg-white rounded-xl border border-gray-100 shadow-sm overflow-hidden">
        <div className="px-6 py-4 border-b border-gray-100">
          <h2 className="text-sm font-semibold text-gray-900">My payslips</h2>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="bg-gray-50 border-b border-gray-100">
                {['Period', 'Pay date', 'Net Pay', 'Account number', 'Status', 'Actions'].map(col => (
                  <th key={col} className="text-left px-6 py-3 text-xs font-semibold text-gray-500 uppercase tracking-wide whitespace-nowrap">
                    {col}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {filtered.map((row) => (
                <tr
                  key={row.id}
                  className="hover:bg-gray-50 transition-colors cursor-pointer"
                  onClick={() => navigate(`/employee/payslips/${row.id}`)}
                >
                  <td className="px-6 py-4 font-medium text-gray-900 whitespace-nowrap">{row.period}</td>
                  <td className="px-6 py-4 text-gray-600 whitespace-nowrap">{row.payDate}</td>
                  <td className="px-6 py-4 text-gray-900 font-medium whitespace-nowrap">{row.netPay}</td>
                  <td className="px-6 py-4 text-gray-500 whitespace-nowrap">{row.accountNumber}</td>
                  <td className="px-6 py-4"><StatusPill status={row.status} /></td>
                  <td className="px-6 py-4">
                    <div className="flex items-center gap-3">
                      <button
                        className="flex items-center gap-1 text-xs text-gray-600 hover:text-gray-900"
                        onClick={e => { e.stopPropagation(); navigate(`/employee/payslips/${row.id}`) }}
                      >
                        <Eye size={12} /> View details
                      </button>
                      <button
                        className="flex items-center gap-1 text-xs text-gray-600 hover:text-gray-900"
                        onClick={e => e.stopPropagation()}
                      >
                        <Download size={12} /> Download
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
          {filtered.length === 0 && (
            <div className="flex flex-col items-center justify-center py-16 text-center">
              <FileText size={40} className="text-gray-300 mb-3" />
              <p className="text-sm font-medium text-gray-500">No payslips yet</p>
              <p className="text-xs text-gray-400 mt-1">Payslips will appear here after payroll has been run</p>
            </div>
          )}
        </div>
      </div>

    </div>
  )
}
