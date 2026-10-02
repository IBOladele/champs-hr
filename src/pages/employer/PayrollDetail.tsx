import { useState, useEffect, useCallback } from 'react'
import { useNavigate, useParams } from 'react-router-dom'
import { ChevronLeft, Download, FileText, DollarSign } from 'lucide-react'
import { payroll as payrollApi, type PayrollRun, type PayrollRunItem } from '../../lib/api'

type DetailTab = 'summary' | 'breakdown' | 'deductions' | 'tax'

const tabs: { key: DetailTab; label: string }[] = [
  { key: 'summary', label: 'Summary' },
  { key: 'breakdown', label: 'Employee breakdown' },
  { key: 'deductions', label: 'Deductions' },
  { key: 'tax', label: 'Tax' },
]

function fmt(v: string | null | undefined) {
  if (!v) return '—'
  return `$${parseFloat(v).toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`
}

function EmptyTableState({ message }: { message: string }) {
  return (
    <div className="flex flex-col items-center justify-center py-16 text-center">
      <FileText size={40} className="text-gray-300 mb-3" />
      <p className="text-sm font-medium text-gray-500">{message}</p>
    </div>
  )
}

function SummaryTab({ run, onApprove, approving }: { run: PayrollRun | null; onApprove: () => void; approving: boolean }) {
  const isPending = !run || run.status === 'pending'
  return (
    <div className="flex flex-col gap-5">
      <div className="grid grid-cols-2 gap-5">
        <div className="bg-white rounded-xl border border-gray-200 p-5">
          <h3 className="text-sm font-semibold text-gray-900 mb-4">Pay components</h3>
          <table className="w-full">
            <thead>
              <tr className="border-b border-gray-100">
                <th className="text-left text-xs font-medium text-gray-400 uppercase pb-2">Item</th>
                <th className="text-right text-xs font-medium text-gray-400 uppercase pb-2">Amount</th>
              </tr>
            </thead>
            <tbody>
              {run?.totalGross ? (
                <>
                  <tr className="border-b border-gray-50">
                    <td className="py-2 text-sm text-gray-700">Gross pay</td>
                    <td className="py-2 text-sm text-gray-700 text-right">{fmt(run.totalGross)}</td>
                  </tr>
                  <tr>
                    <td className="py-2 text-sm text-gray-700">Net pay</td>
                    <td className="py-2 text-sm text-gray-700 text-right">{fmt(run.totalNet)}</td>
                  </tr>
                </>
              ) : (
                <tr><td colSpan={2}><EmptyTableState message="No pay component data" /></td></tr>
              )}
            </tbody>
          </table>
        </div>

        <div className="bg-white rounded-xl border border-gray-200 p-5">
          <h3 className="text-sm font-semibold text-gray-900 mb-4">Deduction summary</h3>
          <table className="w-full">
            <thead>
              <tr className="border-b border-gray-100">
                <th className="text-left text-xs font-medium text-gray-400 uppercase pb-2">Item</th>
                <th className="text-right text-xs font-medium text-gray-400 uppercase pb-2">Amount</th>
              </tr>
            </thead>
            <tbody>
              {run?.totalDeductions ? (
                <tr>
                  <td className="py-2 text-sm text-gray-700">Total deductions</td>
                  <td className="py-2 text-sm text-gray-700 text-right">{fmt(run.totalDeductions)}</td>
                </tr>
              ) : (
                <tr><td colSpan={2}><EmptyTableState message="No deduction data" /></td></tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

      <div className="bg-white rounded-xl border border-gray-200 p-5">
        <h3 className="text-sm font-semibold text-gray-900 mb-4">Payroll status</h3>
        <div className="flex items-start justify-between">
          <div className="flex flex-col gap-2">
            {isPending ? (
              <>
                <span className="inline-flex items-center bg-amber-50 text-amber-700 border border-amber-200 rounded-full px-3 py-1 text-xs font-medium w-fit">
                  Pending approval
                </span>
                <p className="text-sm text-gray-500">This payroll run is awaiting approval before processing.</p>
              </>
            ) : (
              <>
                <span className="inline-flex items-center bg-green-50 text-green-700 border border-green-200 rounded-full px-3 py-1 text-xs font-medium w-fit">
                  Completed
                </span>
                <p className="text-sm text-gray-500">This payroll run has been approved and processed.</p>
              </>
            )}
          </div>
          {isPending && (
            <div className="flex items-center gap-3">
              <button className="px-4 py-2 text-sm font-medium text-gray-600 border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors">
                Reject
              </button>
              <button
                onClick={onApprove}
                disabled={approving}
                className="px-4 py-2 text-sm font-medium text-white rounded-lg transition-colors disabled:opacity-60"
                style={{ backgroundColor: '#22c55e' }}
              >
                {approving ? 'Approving…' : 'Approve payroll'}
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}

function BreakdownTab({ items }: { items: PayrollRunItem[] }) {
  if (!items.length) {
    return (
      <div className="bg-white rounded-xl border border-gray-200 overflow-hidden">
        <EmptyTableState message="No breakdown data" />
      </div>
    )
  }
  return (
    <div className="bg-white rounded-xl border border-gray-200 overflow-hidden">
      <table className="w-full">
        <thead>
          <tr className="bg-gray-50 border-b border-gray-200">
            <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wide">Employee</th>
            <th className="px-4 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wide">Gross pay</th>
            <th className="px-4 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wide">Net pay</th>
            <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wide">Status</th>
          </tr>
        </thead>
        <tbody>
          {items.map((item) => (
            <tr key={item.id} className="border-b border-gray-100 last:border-0">
              <td className="px-4 py-3.5 text-sm text-gray-700">{item.employeeId}</td>
              <td className="px-4 py-3.5 text-sm text-gray-700 text-right">{fmt(item.grossPay)}</td>
              <td className="px-4 py-3.5 text-sm text-gray-700 text-right">{fmt(item.netPay)}</td>
              <td className="px-4 py-3.5">
                <span className={`text-xs font-medium px-2 py-0.5 rounded-full ${item.status === 'completed' ? 'bg-green-50 text-green-700' : 'bg-amber-50 text-amber-700'}`}>
                  {item.status}
                </span>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  )
}

function DeductionsTab({ items }: { items: PayrollRunItem[] }) {
  const deductionKeys = items.length > 0 ? Object.keys(items[0].deductions) : []
  if (!items.length || !deductionKeys.length) {
    return (
      <div className="bg-white rounded-xl border border-gray-200 overflow-hidden">
        <EmptyTableState message="No deductions data" />
      </div>
    )
  }
  const totals: Record<string, number> = {}
  for (const key of deductionKeys) totals[key] = items.reduce((s, i) => s + (i.deductions[key] ?? 0), 0)

  return (
    <div className="bg-white rounded-xl border border-gray-200 overflow-hidden">
      <table className="w-full">
        <thead>
          <tr className="bg-gray-50 border-b border-gray-200">
            <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wide">Employee</th>
            {deductionKeys.map(k => (
              <th key={k} className="px-4 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wide">{k}</th>
            ))}
          </tr>
        </thead>
        <tbody>
          {items.map((item) => (
            <tr key={item.id} className="border-b border-gray-100 last:border-0">
              <td className="px-4 py-3.5 text-sm text-gray-700">{item.employeeId}</td>
              {deductionKeys.map(k => (
                <td key={k} className="px-4 py-3.5 text-sm text-gray-700 text-right">
                  {item.deductions[k] != null ? `$${item.deductions[k].toFixed(2)}` : '—'}
                </td>
              ))}
            </tr>
          ))}
        </tbody>
        <tfoot>
          <tr className="bg-gray-50 border-t border-gray-200">
            <td className="px-4 py-3.5 text-sm font-bold text-gray-900">Total</td>
            {deductionKeys.map(k => (
              <td key={k} className="px-4 py-3.5 text-sm font-bold text-gray-900 text-right">${totals[k].toFixed(2)}</td>
            ))}
          </tr>
        </tfoot>
      </table>
    </div>
  )
}

function TaxTab() {
  const taxRows = [
    { label: 'Federal withholding', value: '—' },
    { label: 'FICA (Social Security + Medicare)', value: '—' },
    { label: 'Total submitted', value: '—' },
    { label: 'IRS filing status', value: 'No data' },
  ]
  return (
    <div className="bg-white rounded-xl border border-gray-200 p-6">
      <h3 className="text-sm font-semibold text-gray-900 mb-5">Tax summary</h3>
      <div className="flex flex-col gap-4">
        {taxRows.map((row) => (
          <div key={row.label} className="flex items-center justify-between py-3 border-b border-gray-100 last:border-0">
            <span className="text-sm text-gray-600">{row.label}</span>
            <span className="text-sm font-semibold text-gray-400">{row.value}</span>
          </div>
        ))}
      </div>
    </div>
  )
}

export default function PayrollDetail() {
  const { runId } = useParams<{ runId: string }>()
  const navigate = useNavigate()
  const [activeTab, setActiveTab] = useState<DetailTab>('summary')
  const [run, setRun] = useState<PayrollRun | null>(null)
  const [loading, setLoading] = useState(true)
  const [approving, setApproving] = useState(false)

  useEffect(() => {
    if (!runId) return
    payrollApi.get(runId)
      .then(setRun)
      .catch(() => setRun(null))
      .finally(() => setLoading(false))
  }, [runId])

  const handleApprove = useCallback(async () => {
    if (!runId) return
    setApproving(true)
    try {
      const updated = await payrollApi.approve(runId)
      setRun(updated)
    } finally {
      setApproving(false)
    }
  }, [runId])

  const items = run?.items ?? []

  const statCards = [
    { label: 'Total gross pay', value: fmt(run?.totalGross) },
    { label: 'Total deductions', value: fmt(run?.totalDeductions) },
    { label: 'Net pay', value: fmt(run?.totalNet) },
    { label: 'Employees paid', value: String(items.length || '—') },
  ]

  if (loading) {
    return (
      <div className="flex items-center justify-center py-24">
        <div className="w-6 h-6 border-2 border-gray-200 border-t-green-500 rounded-full animate-spin" />
      </div>
    )
  }

  if (!run) {
    return (
      <div>
        <button
          onClick={() => navigate('/employer/payroll')}
          className="flex items-center gap-1.5 text-sm font-medium mb-5 transition-colors"
          style={{ color: '#22c55e' }}
        >
          <ChevronLeft size={16} />
          Back to payroll
        </button>
        <div className="flex flex-col items-center justify-center py-24 text-center">
          <DollarSign size={48} className="text-gray-300 mb-4" />
          <h2 className="text-lg font-semibold text-gray-700">Payroll run not found</h2>
          <p className="text-sm text-gray-400 mt-1">No data available for run #{runId}</p>
        </div>
      </div>
    )
  }

  const periodLabel = `${new Date(run.periodStart).toLocaleDateString('en-US', { month: 'short', year: 'numeric' })}`

  return (
    <div className="">
      <button
        onClick={() => navigate('/employer/payroll')}
        className="flex items-center gap-1.5 text-sm font-medium mb-5 transition-colors"
        style={{ color: '#22c55e' }}
      >
        <ChevronLeft size={16} />
        Back to payroll
      </button>

      <div className="flex items-center justify-between mb-6">
        <h1 className="text-2xl font-bold text-gray-900">Payroll Run — {periodLabel}</h1>
        <div className="flex items-center gap-3">
          <button className="flex items-center gap-2 px-4 py-2 text-sm font-medium text-gray-600 border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors">
            <Download size={14} />
            Export
          </button>
          {run.status === 'pending' && (
            <button
              onClick={handleApprove}
              disabled={approving}
              className="px-4 py-2 text-sm font-medium text-white rounded-lg transition-colors disabled:opacity-60"
              style={{ backgroundColor: '#22c55e' }}
            >
              {approving ? 'Approving…' : 'Approve payroll'}
            </button>
          )}
        </div>
      </div>

      <div className="grid grid-cols-4 gap-4 mb-6">
        {statCards.map((card) => (
          <div key={card.label} className="bg-white rounded-xl border border-gray-200 p-5">
            <p className="text-sm text-gray-500 mb-1">{card.label}</p>
            <p className="text-2xl font-bold text-gray-900">{card.value}</p>
          </div>
        ))}
      </div>

      <div className="flex items-center border-b border-gray-200 mb-6">
        {tabs.map((tab) => (
          <button
            key={tab.key}
            onClick={() => setActiveTab(tab.key)}
            className={`px-4 py-2.5 text-sm font-medium border-b-2 transition-colors ${
              activeTab === tab.key
                ? 'border-gray-900 text-gray-900'
                : 'border-transparent text-gray-500 hover:text-gray-700'
            }`}
          >
            {tab.label}
          </button>
        ))}
      </div>

      {activeTab === 'summary' && <SummaryTab run={run} onApprove={handleApprove} approving={approving} />}
      {activeTab === 'breakdown' && <BreakdownTab items={items} />}
      {activeTab === 'deductions' && <DeductionsTab items={items} />}
      {activeTab === 'tax' && <TaxTab />}
    </div>
  )
}
