import { useNavigate } from 'react-router-dom'
import { ArrowLeft, Download, Printer } from 'lucide-react'

export default function PayslipDetail() {
  const navigate = useNavigate()

  return (
    <div className="px-8 py-6">
      {/* Header */}
      <div className="flex items-start justify-between mb-6">
        <div>
          <button
            onClick={() => navigate('/employee/payslips')}
            className="flex items-center gap-1.5 text-sm text-[#22c55e] font-medium hover:text-green-700 mb-2"
          >
            <ArrowLeft size={14} /> Back to payslips
          </button>
          <h1 className="text-2xl font-bold text-gray-900">February 2025 Payslip</h1>
          <p className="text-sm text-gray-500 mt-0.5">Smith Meyer · Employee ID: 67890434</p>
        </div>
        <div className="flex items-center gap-2 mt-6">
          <button className="flex items-center gap-2 bg-[#22c55e] text-white px-4 py-2 rounded-lg text-sm font-medium hover:bg-green-600 transition-colors">
            <Download size={14} /> Download PDF
          </button>
          <button className="flex items-center gap-2 bg-white text-gray-700 border border-gray-200 px-4 py-2 rounded-lg text-sm font-medium hover:bg-gray-50 transition-colors">
            <Printer size={14} /> Print
          </button>
        </div>
      </div>

      {/* Payslip document */}
      <div className="max-w-2xl bg-white rounded-xl border border-gray-100 shadow-sm p-8">

        {/* Top section: company + employee info */}
        <div className="grid grid-cols-2 gap-6 mb-6">
          <div>
            <p className="text-2xl font-black text-gray-900 tracking-tight">CHAMP</p>
            <p className="text-xs text-gray-500 mt-1">123 Business St, London, UK</p>
          </div>
          <div className="text-right">
            <p className="text-xl font-bold text-gray-900">Payslip</p>
            <p className="text-xs text-gray-500 mt-1">Period: February 2025</p>
            <p className="text-xs text-gray-500">Payment date: 28 Feb 2025</p>
          </div>
        </div>

        <hr className="border-gray-100 mb-6" />

        {/* Employee section */}
        <div className="grid grid-cols-2 gap-x-8 gap-y-3 mb-6">
          {[
            { label: 'Employee name', value: 'Smith Meyer' },
            { label: 'Employee ID',   value: '67890434' },
            { label: 'Department',    value: 'Design' },
            { label: 'Job title',     value: 'Project lead' },
            { label: 'NI number',     value: 'AB123456C' },
            { label: 'Tax code',      value: '1257L' },
          ].map(({ label, value }) => (
            <div key={label} className="flex justify-between text-sm">
              <span className="text-gray-500">{label}</span>
              <span className="font-medium text-gray-900">{value}</span>
            </div>
          ))}
        </div>

        <hr className="border-gray-100 mb-6" />

        {/* Earnings + Deductions side by side */}
        <div className="grid grid-cols-2 gap-6 mb-6">
          {/* Earnings */}
          <div>
            <p className="text-xs font-semibold text-gray-500 uppercase tracking-wide mb-3">Earnings</p>
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-gray-100">
                  <th className="text-left py-1.5 text-xs text-gray-400 font-medium">Description</th>
                  <th className="text-right py-1.5 text-xs text-gray-400 font-medium">Hours</th>
                  <th className="text-right py-1.5 text-xs text-gray-400 font-medium">Rate</th>
                  <th className="text-right py-1.5 text-xs text-gray-400 font-medium">Amount</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-50">
                {[
                  { desc: 'Base salary', hours: '160', rate: '—',      amount: '$26,000' },
                  { desc: 'Overtime',    hours: '8',   rate: '$50/hr',  amount: '$400' },
                  { desc: 'Bonus',       hours: '—',   rate: '—',      amount: '$2,600' },
                ].map(row => (
                  <tr key={row.desc}>
                    <td className="py-2 text-gray-700">{row.desc}</td>
                    <td className="py-2 text-right text-gray-500">{row.hours}</td>
                    <td className="py-2 text-right text-gray-500">{row.rate}</td>
                    <td className="py-2 text-right text-gray-700">{row.amount}</td>
                  </tr>
                ))}
              </tbody>
              <tfoot>
                <tr className="border-t border-gray-200">
                  <td colSpan={3} className="pt-2 font-semibold text-gray-900 text-sm">Gross pay</td>
                  <td className="pt-2 text-right font-bold text-gray-900">$29,000</td>
                </tr>
              </tfoot>
            </table>
          </div>

          {/* Deductions */}
          <div>
            <p className="text-xs font-semibold text-gray-500 uppercase tracking-wide mb-3">Deductions</p>
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-gray-100">
                  <th className="text-left py-1.5 text-xs text-gray-400 font-medium">Description</th>
                  <th className="text-right py-1.5 text-xs text-gray-400 font-medium">Amount</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-50">
                {[
                  { desc: 'Income tax',          amount: '$4,350' },
                  { desc: 'National insurance',   amount: '$1,305' },
                  { desc: 'Pension (5%)',          amount: '$1,450' },
                ].map(row => (
                  <tr key={row.desc}>
                    <td className="py-2 text-gray-700">{row.desc}</td>
                    <td className="py-2 text-right text-gray-700">{row.amount}</td>
                  </tr>
                ))}
              </tbody>
              <tfoot>
                <tr className="border-t border-gray-200">
                  <td className="pt-2 font-semibold text-gray-900 text-sm">Total deductions</td>
                  <td className="pt-2 text-right font-bold text-gray-900">$7,105</td>
                </tr>
              </tfoot>
            </table>
          </div>
        </div>

        {/* Net pay summary */}
        <div className="bg-[#22c55e] text-white rounded-xl p-4">
          <p className="text-xl font-bold">Net pay: $21,895</p>
          <p className="text-sm mt-1 text-green-100">Paid on 28th February 2025 via BACS</p>
        </div>
      </div>
    </div>
  )
}
