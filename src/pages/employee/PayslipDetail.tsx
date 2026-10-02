import { useState, useEffect } from 'react'
import { useNavigate, useParams } from 'react-router-dom'
import { ArrowLeft, FileText } from 'lucide-react'
import { employeeDashboard, type EmployeeDashboardData } from '../../lib/api'
import type { PayrollRunItem } from '../../lib/api'

function fmt(v: string | null | undefined) {
  if (!v) return '—'
  return `$${parseFloat(v).toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`
}

function InfoRow({ label, value }: { label: string; value: string }) {
  return (
    <div className="flex items-center justify-between py-3 border-b border-gray-100 last:border-0">
      <span className="text-sm text-gray-500">{label}</span>
      <span className="text-sm font-medium text-gray-900">{value}</span>
    </div>
  )
}

export default function PayslipDetail() {
  const navigate = useNavigate()
  const { id } = useParams<{ id: string }>()
  const [payslip, setPayslip] = useState<PayrollRunItem | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    if (!id) return
    employeeDashboard.get()
      .then((data: EmployeeDashboardData) => {
        const found = data.recentPayslips.find(p => p.id === id) ?? null
        setPayslip(found)
      })
      .catch(() => setPayslip(null))
      .finally(() => setLoading(false))
  }, [id])

  if (loading) {
    return (
      <div className="flex items-center justify-center py-24">
        <div className="w-6 h-6 border-2 border-gray-200 border-t-green-500 rounded-full animate-spin" />
      </div>
    )
  }

  if (!payslip) {
    return (
      <div className="">
        <button
          onClick={() => navigate('/employee/payslips')}
          className="flex items-center gap-1.5 text-sm text-[#22c55e] font-medium hover:text-green-700 mb-2"
        >
          <ArrowLeft size={14} /> Back to payslips
        </button>
        <div className="max-w-2xl bg-white rounded-xl border border-gray-100 shadow-sm p-16 flex flex-col items-center justify-center text-center">
          <FileText size={48} className="text-gray-300 mb-4" />
          <p className="text-base font-semibold text-gray-700">Payslip not found</p>
          <p className="text-sm text-gray-400 mt-1 mb-6">This payslip does not exist or has not been generated yet.</p>
          <button
            onClick={() => navigate('/employee/payslips')}
            className="px-4 py-2 bg-gray-900 text-white text-sm font-medium rounded-lg hover:bg-gray-800 transition-colors"
          >
            Back to payslips
          </button>
        </div>
      </div>
    )
  }

  const periodLabel = payslip.periodStart
    ? new Date(payslip.periodStart).toLocaleDateString('en-US', { month: 'long', year: 'numeric' })
    : 'Payslip'

  const deductionEntries = Object.entries(payslip.deductions ?? {})

  return (
    <div className="">
      <button
        onClick={() => navigate('/employee/payslips')}
        className="flex items-center gap-1.5 text-sm text-[#22c55e] font-medium hover:text-green-700 mb-2"
      >
        <ArrowLeft size={14} /> Back to payslips
      </button>
      <h1 className="text-2xl font-bold text-gray-900 mb-6">{periodLabel}</h1>

      <div className="max-w-2xl space-y-5">
        <div className="bg-white rounded-xl border border-gray-100 shadow-sm p-6">
          <h2 className="text-sm font-semibold text-gray-900 mb-4">Earnings</h2>
          <InfoRow label="Gross pay" value={fmt(payslip.grossPay)} />
          <InfoRow label="Net pay" value={fmt(payslip.netPay)} />
        </div>

        {deductionEntries.length > 0 && (
          <div className="bg-white rounded-xl border border-gray-100 shadow-sm p-6">
            <h2 className="text-sm font-semibold text-gray-900 mb-4">Deductions</h2>
            {deductionEntries.map(([key, val]) => (
              <InfoRow key={key} label={key} value={`$${(val as number).toFixed(2)}`} />
            ))}
          </div>
        )}

        <div className="bg-white rounded-xl border border-gray-100 shadow-sm p-6">
          <h2 className="text-sm font-semibold text-gray-900 mb-4">Summary</h2>
          <InfoRow label="Status" value={payslip.status} />
          {payslip.periodStart && (
            <InfoRow
              label="Period"
              value={`${new Date(payslip.periodStart).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })} – ${payslip.periodEnd ? new Date(payslip.periodEnd).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' }) : '—'}`}
            />
          )}
        </div>
      </div>
    </div>
  )
}
