import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { ChevronLeft, Download } from 'lucide-react'

type DetailTab = 'summary' | 'breakdown' | 'deductions' | 'tax'

const tabs: { key: DetailTab; label: string }[] = [
  { key: 'summary', label: 'Summary' },
  { key: 'breakdown', label: 'Employee breakdown' },
  { key: 'deductions', label: 'Deductions' },
  { key: 'tax', label: 'Tax' },
]

const statCards = [
  { label: 'Total gross pay', value: '$453,300' },
  { label: 'Total deductions', value: '$45,330' },
  { label: 'Net pay', value: '$407,970' },
  { label: 'Employees paid', value: '40' },
]

const payComponents = [
  { item: 'Base salary', amount: '$430,000', employees: 40 },
  { item: 'Overtime', amount: '$18,000', employees: 12 },
  { item: 'Bonuses', amount: '$5,300', employees: 5 },
]

const deductionSummary = [
  { item: 'Income tax', amount: '$28,000' },
  { item: 'National insurance', amount: '$9,500' },
  { item: 'Pension contribution', amount: '$7,830' },
]

const breakdownRows = [
  { name: 'Smith Meyer', dept: 'Marketing', gross: '$29,000', deductions: '$2,900', net: '$26,100' },
  { name: 'Lana Mejias', dept: 'Engineering', gross: '$31,000', deductions: '$3,100', net: '$27,900' },
  { name: 'Keisha Locklear', dept: 'Product', gross: '$27,500', deductions: '$2,750', net: '$24,750' },
  { name: 'Miley Little', dept: 'Marketing', gross: '$25,000', deductions: '$2,500', net: '$22,500' },
  { name: 'Diana Torres', dept: 'HR', gross: '$32,800', deductions: '$3,280', net: '$29,520' },
]

const deductionRows = [
  { name: 'Smith Meyer', incomeTax: '$1,740', ni: '$870', pension: '$290', total: '$2,900' },
  { name: 'Lana Mejias', incomeTax: '$1,860', ni: '$930', pension: '$310', total: '$3,100' },
  { name: 'Keisha Locklear', incomeTax: '$1,650', ni: '$825', pension: '$275', total: '$2,750' },
  { name: 'Miley Little', incomeTax: '$1,500', ni: '$750', pension: '$250', total: '$2,500' },
  { name: 'Diana Torres', incomeTax: '$1,968', ni: '$984', pension: '$328', total: '$3,280' },
]

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
              {payComponents.map((row) => (
                <tr key={row.item} className="border-b border-gray-50">
                  <td className="py-3 text-sm text-gray-700">{row.item}</td>
                  <td className="py-3 text-sm text-gray-700 text-right">{row.amount}</td>
                  <td className="py-3 text-sm text-gray-700 text-right">{row.employees}</td>
                </tr>
              ))}
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
              {deductionSummary.map((row) => (
                <tr key={row.item} className="border-b border-gray-50">
                  <td className="py-3 text-sm text-gray-700">{row.item}</td>
                  <td className="py-3 text-sm text-gray-700 text-right">{row.amount}</td>
                </tr>
              ))}
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
          {breakdownRows.map((row) => (
            <tr key={row.name} className="border-b border-gray-100 hover:bg-gray-50 transition-colors">
              <td className="px-4 py-3.5 text-sm font-medium text-gray-800">{row.name}</td>
              <td className="px-4 py-3.5 text-sm text-gray-600">{row.dept}</td>
              <td className="px-4 py-3.5 text-sm text-gray-700 text-right">{row.gross}</td>
              <td className="px-4 py-3.5 text-sm text-gray-700 text-right">{row.deductions}</td>
              <td className="px-4 py-3.5 text-sm text-gray-700 text-right">{row.net}</td>
              <td className="px-4 py-3.5">
                <span className="inline-flex items-center bg-green-50 text-green-700 rounded-full px-2 py-0.5 text-xs font-medium">
                  Active
                </span>
              </td>
            </tr>
          ))}
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
          {deductionRows.map((row) => (
            <tr key={row.name} className="border-b border-gray-100 hover:bg-gray-50 transition-colors">
              <td className="px-4 py-3.5 text-sm font-medium text-gray-800">{row.name}</td>
              <td className="px-4 py-3.5 text-sm text-gray-600 text-right">{row.incomeTax}</td>
              <td className="px-4 py-3.5 text-sm text-gray-600 text-right">{row.ni}</td>
              <td className="px-4 py-3.5 text-sm text-gray-600 text-right">{row.pension}</td>
              <td className="px-4 py-3.5 text-sm font-semibold text-gray-800 text-right">{row.total}</td>
            </tr>
          ))}
          {/* Totals row */}
          <tr className="bg-gray-50 border-t border-gray-200">
            <td className="px-4 py-3.5 text-sm font-bold text-gray-900">Total</td>
            <td className="px-4 py-3.5 text-sm font-bold text-gray-900 text-right">$8,718</td>
            <td className="px-4 py-3.5 text-sm font-bold text-gray-900 text-right">$4,359</td>
            <td className="px-4 py-3.5 text-sm font-bold text-gray-900 text-right">$1,453</td>
            <td className="px-4 py-3.5 text-sm font-bold text-gray-900 text-right">$14,530</td>
          </tr>
        </tbody>
      </table>
    </div>
  )
}

function TaxTab() {
  const taxRows = [
    { label: 'PAYE', value: '$28,000' },
    { label: 'National Insurance (NI)', value: '$9,500' },
    { label: 'Total submitted', value: '$37,500' },
    { label: 'HMRC submission status', value: 'Pending' },
  ]
  return (
    <div className="bg-white rounded-xl border border-gray-200 p-6">
      <h3 className="text-sm font-semibold text-gray-900 mb-5">Tax summary for February 2025</h3>
      <div className="flex flex-col gap-4">
        {taxRows.map((row) => (
          <div key={row.label} className="flex items-center justify-between py-3 border-b border-gray-100 last:border-0">
            <span className="text-sm text-gray-600">{row.label}</span>
            <span className={`text-sm font-semibold ${row.label === 'HMRC submission status' ? 'text-amber-600' : 'text-gray-900'}`}>
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
    <div className="max-w-7xl mx-auto">
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
        <h1 className="text-2xl font-bold text-gray-900">February 2025 Payroll Run</h1>
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
