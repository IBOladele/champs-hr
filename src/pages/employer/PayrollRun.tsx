import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { ChevronLeft, Check } from 'lucide-react'

const STEPS = ['Review employees', 'Review deductions', 'Confirm & submit']

const employeeRows = [
  { name: 'Smith Meyer', dept: 'Marketing', basePay: '$29,000', adjustments: '$0', net: '$29,000' },
  { name: 'Lana Mejias', dept: 'Engineering', basePay: '$31,000', adjustments: '$0', net: '$31,000' },
  { name: 'Keisha Locklear', dept: 'Product', basePay: '$27,500', adjustments: '$0', net: '$27,500' },
  { name: 'Miley Little', dept: 'Marketing', basePay: '$25,000', adjustments: '$0', net: '$25,000' },
  { name: 'Diana Torres', dept: 'HR', basePay: '$32,500', adjustments: '$0', net: '$32,500' },
]

const deductionRows = [
  { name: 'Smith Meyer', incomeTax: '$1,740', ni: '$870', pension: '$290', total: '$2,900' },
  { name: 'Lana Mejias', incomeTax: '$1,860', ni: '$930', pension: '$310', total: '$3,100' },
  { name: 'Keisha Locklear', incomeTax: '$1,650', ni: '$825', pension: '$275', total: '$2,750' },
  { name: 'Miley Little', incomeTax: '$1,500', ni: '$750', pension: '$250', total: '$2,500' },
  { name: 'Diana Torres', incomeTax: '$1,950', ni: '$975', pension: '$325', total: '$3,250' },
]

function StepIndicator({ currentStep }: { currentStep: number }) {
  return (
    <div className="flex items-center mb-8">
      {STEPS.map((label, i) => {
        const done = i < currentStep
        const active = i === currentStep
        return (
          <div key={i} className="flex items-center">
            {/* Circle */}
            <div className="flex flex-col items-center">
              <div
                className="w-8 h-8 rounded-full flex items-center justify-center text-sm font-semibold"
                style={{
                  backgroundColor: done ? '#22c55e' : active ? '#22c55e' : '#e5e7eb',
                  color: done || active ? '#fff' : '#9ca3af',
                }}
              >
                {done ? <Check size={14} /> : i + 1}
              </div>
              <span
                className="text-xs mt-1.5 whitespace-nowrap"
                style={{
                  color: active ? '#111827' : done ? '#22c55e' : '#9ca3af',
                  fontWeight: active ? 600 : 400,
                }}
              >
                {label}
              </span>
            </div>
            {/* Connector line */}
            {i < STEPS.length - 1 && (
              <div
                className="h-0.5 w-24 mx-2 mb-5"
                style={{ backgroundColor: i < currentStep ? '#22c55e' : '#e5e7eb' }}
              />
            )}
          </div>
        )
      })}
    </div>
  )
}

function ReviewEmployeesStep() {
  return (
    <div className="bg-white rounded-xl border border-gray-200 overflow-hidden">
      <table className="w-full">
        <thead>
          <tr className="bg-gray-50 border-b border-gray-200">
            <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wide">Employee name</th>
            <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wide">Department</th>
            <th className="px-4 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wide">Base pay</th>
            <th className="px-4 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wide">Adjustments</th>
            <th className="px-4 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wide">Net pay</th>
            <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wide"></th>
          </tr>
        </thead>
        <tbody>
          {employeeRows.map((row) => (
            <tr key={row.name} className="border-b border-gray-100 hover:bg-gray-50 transition-colors">
              <td className="px-4 py-3.5 text-sm font-medium text-gray-800">{row.name}</td>
              <td className="px-4 py-3.5 text-sm text-gray-600">{row.dept}</td>
              <td className="px-4 py-3.5 text-sm text-gray-700 text-right">{row.basePay}</td>
              <td className="px-4 py-3.5 text-sm text-gray-700 text-right">{row.adjustments}</td>
              <td className="px-4 py-3.5 text-sm text-gray-700 text-right">{row.net}</td>
              <td className="px-4 py-3.5">
                <button className="text-xs font-medium hover:underline" style={{ color: '#22c55e' }}>
                  Add adjustment
                </button>
              </td>
            </tr>
          ))}
          {/* Total row */}
          <tr className="bg-gray-50 border-t border-gray-200">
            <td className="px-4 py-3.5 text-sm font-bold text-gray-900">Total</td>
            <td className="px-4 py-3.5 text-sm text-gray-400">—</td>
            <td className="px-4 py-3.5 text-sm font-bold text-gray-900 text-right">$145,000</td>
            <td className="px-4 py-3.5 text-sm font-bold text-gray-900 text-right">$0</td>
            <td className="px-4 py-3.5 text-sm font-bold text-gray-900 text-right">$145,000</td>
            <td className="px-4 py-3.5"></td>
          </tr>
        </tbody>
      </table>
    </div>
  )
}

function ReviewDeductionsStep() {
  return (
    <div className="bg-white rounded-xl border border-gray-200 overflow-hidden">
      <table className="w-full">
        <thead>
          <tr className="bg-gray-50 border-b border-gray-200">
            <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wide">Employee name</th>
            <th className="px-4 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wide">Income tax</th>
            <th className="px-4 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wide">Nat. Insurance</th>
            <th className="px-4 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wide">Pension</th>
            <th className="px-4 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wide">Total deductions</th>
          </tr>
        </thead>
        <tbody>
          {deductionRows.map((row) => (
            <tr key={row.name} className="border-b border-gray-100 hover:bg-gray-50 transition-colors">
              <td className="px-4 py-3.5 text-sm font-medium text-gray-800">{row.name}</td>
              <td className="px-4 py-3.5 text-sm text-gray-700 text-right">{row.incomeTax}</td>
              <td className="px-4 py-3.5 text-sm text-gray-700 text-right">{row.ni}</td>
              <td className="px-4 py-3.5 text-sm text-gray-700 text-right">{row.pension}</td>
              <td className="px-4 py-3.5 text-sm font-semibold text-gray-800 text-right">{row.total}</td>
            </tr>
          ))}
          {/* Totals row */}
          <tr className="bg-gray-50 border-t border-gray-200">
            <td className="px-4 py-3.5 text-sm font-bold text-gray-900">Totals</td>
            <td className="px-4 py-3.5 text-sm font-bold text-gray-900 text-right">$8,700</td>
            <td className="px-4 py-3.5 text-sm font-bold text-gray-900 text-right">$4,350</td>
            <td className="px-4 py-3.5 text-sm font-bold text-gray-900 text-right">$1,450</td>
            <td className="px-4 py-3.5 text-sm font-bold text-gray-900 text-right">$14,500</td>
          </tr>
        </tbody>
      </table>
    </div>
  )
}

function ConfirmStep() {
  const summaryRows = [
    { label: 'Pay period', value: 'March 2025' },
    { label: 'Total employees', value: '40' },
    { label: 'Total gross pay', value: '$453,300' },
    { label: 'Total deductions', value: '$45,330' },
    { label: 'Net pay', value: '$407,970' },
    { label: 'Processing date', value: '28th March 2025' },
  ]

  return (
    <div className="max-w-xl">
      <div className="bg-white rounded-xl border border-gray-200 p-6 mb-4">
        <h3 className="text-sm font-semibold text-gray-900 mb-4">Payroll summary</h3>
        <div className="flex flex-col gap-0">
          {summaryRows.map((row) => (
            <div
              key={row.label}
              className="flex items-center justify-between py-3 border-b border-gray-100 last:border-0"
            >
              <span className="text-sm text-gray-600">{row.label}</span>
              <span className="text-sm font-semibold text-gray-900">{row.value}</span>
            </div>
          ))}
        </div>
      </div>

      {/* Info note */}
      <div className="bg-amber-50 border border-amber-200 rounded-lg px-4 py-3 mb-5">
        <p className="text-xs text-amber-700">
          Once submitted, payroll will be processed on the scheduled date. This action cannot be undone.
        </p>
      </div>

      {/* Submit button */}
      <button
        className="w-full py-3 text-sm font-semibold text-white rounded-lg transition-colors"
        style={{ backgroundColor: '#22c55e' }}
      >
        Submit payroll
      </button>
    </div>
  )
}

export default function PayrollRun() {
  const navigate = useNavigate()
  const [currentStep, setCurrentStep] = useState(0)

  function handleNext() {
    if (currentStep < STEPS.length - 1) setCurrentStep((s) => s + 1)
  }

  function handleBack() {
    if (currentStep > 0) setCurrentStep((s) => s - 1)
  }

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
      <div className="mb-2">
        <h1 className="text-2xl font-bold text-gray-900">Run Payroll</h1>
        <p className="text-sm text-gray-500 mt-1">Period: March 2025</p>
      </div>

      {/* Step indicator */}
      <div className="mt-8">
        <StepIndicator currentStep={currentStep} />
      </div>

      {/* Step content */}
      <div className="mb-8">
        {currentStep === 0 && <ReviewEmployeesStep />}
        {currentStep === 1 && <ReviewDeductionsStep />}
        {currentStep === 2 && <ConfirmStep />}
      </div>

      {/* Bottom nav */}
      {currentStep < 2 && (
        <div className="flex items-center justify-between pt-4 border-t border-gray-100">
          <button
            onClick={handleBack}
            disabled={currentStep === 0}
            className="flex items-center gap-2 px-4 py-2 text-sm font-medium text-gray-600 border border-gray-200 rounded-lg hover:bg-gray-50 disabled:opacity-40 disabled:cursor-not-allowed transition-colors"
          >
            ← Back
          </button>
          <button
            onClick={handleNext}
            className="px-5 py-2 text-sm font-medium text-white rounded-lg transition-colors"
            style={{ backgroundColor: '#22c55e' }}
          >
            Continue
          </button>
        </div>
      )}
    </div>
  )
}
