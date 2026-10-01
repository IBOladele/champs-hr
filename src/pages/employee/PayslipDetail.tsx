import { useNavigate } from 'react-router-dom'
import { ArrowLeft, FileText } from 'lucide-react'

export default function PayslipDetail() {
  const navigate = useNavigate()

  return (
    <div className="">
      {/* Header */}
      <div className="mb-6">
        <button
          onClick={() => navigate('/employee/payslips')}
          className="flex items-center gap-1.5 text-sm text-[#22c55e] font-medium hover:text-green-700 mb-2"
        >
          <ArrowLeft size={14} /> Back to payslips
        </button>
        <h1 className="text-2xl font-bold text-gray-900">Payslip detail</h1>
      </div>

      {/* Not found state */}
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
