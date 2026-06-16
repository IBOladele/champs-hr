import { FileText, Download, Search, ChevronDown, Eye } from 'lucide-react'

type PayslipStatus = 'Loaded' | 'Pending' | 'Refund'

interface PayslipRow {
  period: string
  payDate: string
  netPay: string
  accountNumber: string
  status: PayslipStatus
}

const rows: PayslipRow[] = [
  { period: 'October 2024',   payDate: 'Oct 1 - 31, 2024',  netPay: '$24,900', accountNumber: '24567326', status: 'Loaded'  },
  { period: 'Sector Pay 2024',payDate: 'Oct 1 - 29, 2024',  netPay: '$74,500', accountNumber: '24567326', status: 'Loaded'  },
  { period: 'August 2024',    payDate: 'Oct 1 - 31, 2024',  netPay: '$24,900', accountNumber: '24567326', status: 'Refund'  },
  { period: 'July 2024',      payDate: 'Oct 1 - 24, 2024',  netPay: '$81,980', accountNumber: '07108122', status: 'Pending' },
  { period: 'July 2024',      payDate: 'Oct 1 - 24, 2024',  netPay: '$18,980', accountNumber: '24567026', status: 'Loaded'  },
  { period: 'June 2024',      payDate: 'Oct 1 - 29, 2024',  netPay: '$37,590', accountNumber: '24567026', status: 'Pending' },
  { period: 'May 2024',       payDate: 'Oct 1 - 30, 2024',  netPay: '$31,900', accountNumber: '34087026', status: 'Refund'  },
  { period: 'April 2024',     payDate: 'Oct 1 - 31, 2024',  netPay: '$33,980', accountNumber: '34087026', status: 'Loaded'  },
  { period: 'May 2021',       payDate: 'Dec 1 - 31, 2014',  netPay: '$37,980', accountNumber: '34087026', status: 'Loaded'  },
]

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
  return (
    <div className="px-8 py-6">

      {/* Page heading */}
      <h1 className="text-2xl font-bold text-gray-900 mb-6">Payslips</h1>

      {/* Stat cards */}
      <div className="grid grid-cols-3 gap-4 mb-6">
        {[
          { label: 'Last pay',       value: '$385,045', iconCls: 'text-green-500',  bg: 'bg-green-50'  },
          { label: 'Total sync avg', value: '$342,645', iconCls: 'text-blue-500',   bg: 'bg-blue-50'   },
          { label: 'Top collection', value: '$82,645',  iconCls: 'text-amber-500',  bg: 'bg-amber-50'  },
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
              {rows.map((row, i) => (
                <tr key={i} className="hover:bg-gray-50 transition-colors">
                  <td className="px-6 py-4 font-medium text-gray-900 whitespace-nowrap">{row.period}</td>
                  <td className="px-6 py-4 text-gray-600 whitespace-nowrap">{row.payDate}</td>
                  <td className="px-6 py-4 text-gray-900 font-medium whitespace-nowrap">{row.netPay}</td>
                  <td className="px-6 py-4 text-gray-500 whitespace-nowrap">{row.accountNumber}</td>
                  <td className="px-6 py-4"><StatusPill status={row.status} /></td>
                  <td className="px-6 py-4">
                    <div className="flex items-center gap-3">
                      <button className="flex items-center gap-1 text-xs text-gray-600 hover:text-gray-900">
                        <Eye size={12} /> View details
                      </button>
                      <button className="flex items-center gap-1 text-xs text-gray-600 hover:text-gray-900">
                        <Download size={12} /> Download
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

    </div>
  )
}
