import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { ChevronLeft, Download, FileText } from 'lucide-react'

type DetailTab = 'summary' | 'breakdown' | 'deductions' | 'tax'

const tabs: { key: DetailTab; label: string }[] = [
  { key: 'summary', label: 'Summary' },
  { key: 'breakdown', label: 'Employee breakdown' },
  { key: 'deductions', label: 'Deductions' },
  { key: 'tax', label: 'Tax' },
]

const statCards = [
  { label: 'Total gross pay', value: '£0' },
  { label: 'Total deductions', value: '£0' },
  { label: 'Net pay', value: '£0' },
  { label: 'Employees paid', value: '0' },
]

function EmptyTableState({ message }: { message: string }) {
  return (
    <div className="flex flex-col items-center justify-center py-16 text-center">
      <FileText size={40} className="text-gray-300 mb-3" />
      <p className="text-sm font-medium text-gray-500">{message}</p>
    </div>
  )
}

function SummaryTab() {
  return (
    <div className="flex flex-col gap-5">
      <div className="grid grid-cols-2 gap-5">
        {/* Pay components */}
        <div className="bg-white rounded-xl border border-gray-200 p-5">
          <h3 className="text-sm font-semibold text-gray-900 mb-4">Pay components</h3>
          <table className="w-full">
            <thead>
              <tr className="border-b border-gray-100">
                <th className="text-left text-xs font-medium text-gray-400 uppercase pb-2">Item</th>
                <th className="text-right text-xs font-medium text-gray-400 uppercase pb-2">Amount</th>
                <th className="text-right text-xs font-medium text-gray-400 uppercase pb-2">Employees</th>
              </tr>
            </thead>
            <tbody>
              <tr>
                <td colSpan={3}>
                  <EmptyTableState message="No pay component data" />
                </td>
              </tr>
            </tbody>
          </table>
        </div>

        {/* Deduction summary */}
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
              <tr>
                <td colSpan={2}>
                  <EmptyTableState message="No deduction data" />
                </td>
              </tr>
            </tbody>
          </table>
        </div>
      </div>

      {/* Payroll status */}
      <div className="bg-white rounded-xl border border-gray-200 p-5">
        <h3 className="text-sm font-semibold text-gray-900 mb-4">Payroll status</h3>
        <div className="flex items-start justify-between">
          <div className="flex flex-col gap-2">
            <span className="inline-flex items-center bg-amber-50 text-amber-700 border border-amber-200 rounded-full px-3 py-1 text-xs font-medium w-fit">
              Pending approval
            </span>
            <p className="text-sm text-gray-500">
              This payroll run is awaiting approval before processing.
            </p>
          </div>
          <div className="flex items-center gap-3">
            <button className="px-4 py-2 text-sm font-medium text-gray-600 border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors">
              Reject
            </button>
            <button
              className="px-4 py-2 text-sm font-medium text-white rounded-lg transition-colors"
              style={{ backgroundColor: '#22c55e' }}
            >
              Approve payroll
            </button>
          </div>
        </div>
      </div>
    </div>
  )
}

function BreakdownTab() {
  return (
    <div className="bg-white rounded-xl border border-gray-200 overflow-hidden">
      <table className="w-full">
        <thead>
          <tr className="bg-gray-50 border-b border-gray-200">
            <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wide">Employee name</th>
            <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wide">Department</th>
            <th className="px-4 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wide">Gross pay</th>
            <th className="px-4 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wide">Deductions</th>
            <th className="px-4 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wide">Net pay</th>
            <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wide">Status</th>
          </tr>
        </thead>
        <tbody>
          <tr>
            <td colSpan={6}>
              <EmptyTableState message="No breakdown data" />
            </td>
          </tr>
        </tbody>
      </table>
    </div>
  )
}

function DeductionsTab() {
  return (
    <div className="bg-white rounded-xl border border-gray-200 overflow-hidden">
      <table className="w-full">
        <thead>
          <tr className="bg-gray-50 border-b border-gray-200">
            <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wide">Employee</th>
            <th className="px-4 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wide">Income tax</th>
            <th className="px-4 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wide">Nat. Insurance</th>
            <th className="px-4 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wide">Pension</th>
            <th className="px-4 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wide">Total</th>
          </tr>
        </thead>
        <tbody>
          <tr>
            <td colSpan={5}>
              <EmptyTableState message="No deductions data" />
            </td>
          </tr>
        </tbody>
        {/* Totals row */}
        <tfoot>
          <tr className="bg-gray-50 border-t border-gray-200">
            <td className="px-4 py-3.5 text-sm font-bold text-gray-900">Total</td>
            <td className="px-4 py-3.5 text-sm font-bold text-gray-900 text-right">£0</td>
            <td className="px-4 py-3.5 text-sm font-bold text-gray-900 text-right">£0</td>
            <td className="px-4 py-3.5 text-sm font-bold text-gray-900 text-right">£0</td>
            <td className="px-4 py-3.5 text-sm font-bold text-gray-900 text-right">£0</td>
          </tr>
        </tfoot>
      </table>
    </div>
  )
}

function TaxTab() {
  const taxRows = [
    { label: 'PAYE', value: '—' },
    { label: 'National Insurance (NI)', value: '—' },
    { label: 'Total submitted', value: '—' },
    { label: 'HMRC submission status', value: 'No data' },
  ]
  return (
    <div className="bg-white rounded-xl border border-gray-200 p-6">
      <h3 className="text-sm font-semibold text-gray-900 mb-5">Tax summary</h3>
      <div className="flex flex-col gap-4">
        {taxRows.map((row) => (
          <div key={row.label} className="flex items-center justify-between py-3 border-b border-gray-100 last:border-0">
            <span className="text-sm text-gray-600">{row.label}</span>
            <span className="text-sm font-semibold text-gray-400">
              {row.value}
            </span>
          </div>
        ))}
      </div>
    </div>
  )
}

export default function PayrollDetail() {
  const navigate = useNavigate()
  const [activeTab, setActiveTab] = useState<DetailTab>('summary')

  return (
    <div className="">
      {/* Breadcrumb */}
      <button
        onClick={() => navigate('/employer/payroll')}
        className="flex items-center gap-1.5 text-sm font-medium mb-5 transition-colors"
        style={{ color: '#22c55e' }}
      >
        <ChevronLeft size={16} />
        Back to payroll
      </button>

      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-2xl font-bold text-gray-900">Payroll Run</h1>
        <div className="flex items-center gap-3">
          <button className="flex items-center gap-2 px-4 py-2 text-sm font-medium text-gray-600 border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors">
            <Download size={14} />
            Export
          </button>
          <button
            className="px-4 py-2 text-sm font-medium text-white rounded-lg transition-colors"
            style={{ backgroundColor: '#22c55e' }}
          >
            Approve payroll
          </button>
        </div>
      </div>

      {/* Stat cards */}
      <div className="grid grid-cols-4 gap-4 mb-6">
        {statCards.map((card) => (
          <div key={card.label} className="bg-white rounded-xl border border-gray-200 p-5">
            <p className="text-sm text-gray-500 mb-1">{card.label}</p>
            <p className="text-2xl font-bold text-gray-900">{card.value}</p>
          </div>
        ))}
      </div>

      {/* Tabs */}
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

      {/* Tab content */}
      {activeTab === 'summary' && <SummaryTab />}
      {activeTab === 'breakdown' && <BreakdownTab />}
      {activeTab === 'deductions' && <DeductionsTab />}
      {activeTab === 'tax' && <TaxTab />}
    </div>
  )
}
