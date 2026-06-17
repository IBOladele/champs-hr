import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { ArrowLeft, Upload } from 'lucide-react'

const leaveTypes = [
  'Annual leave',
  'Sick leave',
  'Maternity/Paternity leave',
  'Compassionate leave',
  'Unpaid leave',
  'Other',
]

function daysBetween(start: string, end: string): number {
  const s = new Date(start)
  const e = new Date(end)
  const diff = Math.ceil((e.getTime() - s.getTime()) / (1000 * 60 * 60 * 24)) + 1
  return diff > 0 ? diff : 0
}

export default function SubmitLeave() {
  const navigate = useNavigate()
  const [leaveType, setLeaveType] = useState('')
  const [startDate, setStartDate] = useState('')
  const [endDate, setEndDate] = useState('')
  const [reason, setReason] = useState('')
  const [cover, setCover] = useState('')

  const numDays = startDate && endDate ? daysBetween(startDate, endDate) : null

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    navigate('/employee/leave')
  }

  return (
    <div className="px-8 py-6">
      {/* Header */}
      <div className="mb-6">
        <button
          onClick={() => navigate('/employee/leave')}
          className="flex items-center gap-1.5 text-sm text-[#22c55e] font-medium hover:text-green-700 mb-2"
        >
          <ArrowLeft size={14} /> Back to leave requests
        </button>
        <h1 className="text-2xl font-bold text-gray-900">Submit leave request</h1>
      </div>

      <div className="max-w-xl">
        {/* Leave balance row */}
        <div className="grid grid-cols-3 gap-3 mb-6">
          {[
            { label: 'Annual leave', value: '20 days available', color: 'text-green-600', bg: 'bg-green-50' },
            { label: 'Sick leave',   value: '10 days available', color: 'text-blue-600',  bg: 'bg-blue-50'  },
            { label: 'Other',        value: '5 days available',  color: 'text-amber-600', bg: 'bg-amber-50' },
          ].map(({ label, value, color, bg }) => (
            <div key={label} className={`${bg} rounded-xl p-3 text-center`}>
              <p className="text-xs text-gray-500 mb-0.5">{label}</p>
              <p className={`text-sm font-semibold ${color}`}>{value}</p>
            </div>
          ))}
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} className="bg-white rounded-xl border border-gray-100 shadow-sm p-6 space-y-5">

          {/* Leave type */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1.5">Leave type</label>
            <select
              value={leaveType}
              onChange={e => setLeaveType(e.target.value)}
              className="border border-gray-200 rounded-lg px-3 py-2.5 text-sm focus:outline-none focus:border-[#22c55e] w-full bg-white text-gray-700"
              required
            >
              <option value="" disabled>Select leave type</option>
              {leaveTypes.map(t => (
                <option key={t} value={t}>{t}</option>
              ))}
            </select>
          </div>

          {/* Start + End date */}
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1.5">Start date</label>
              <input
                type="date"
                value={startDate}
                onChange={e => setStartDate(e.target.value)}
                className="border border-gray-200 rounded-lg px-3 py-2.5 text-sm focus:outline-none focus:border-[#22c55e] w-full"
                required
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1.5">End date</label>
              <input
                type="date"
                value={endDate}
                onChange={e => setEndDate(e.target.value)}
                className="border border-gray-200 rounded-lg px-3 py-2.5 text-sm focus:outline-none focus:border-[#22c55e] w-full"
                required
              />
            </div>
          </div>

          {/* Number of days (read-only) */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1.5">Number of days</label>
            <input
              type="text"
              readOnly
              value={numDays !== null ? `${numDays} day${numDays !== 1 ? 's' : ''}` : '—'}
              className="border border-gray-200 rounded-lg px-3 py-2.5 text-sm w-full bg-gray-50 text-gray-500 cursor-default focus:outline-none"
            />
          </div>

          {/* Reason / notes */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1.5">Reason / notes</label>
            <textarea
              rows={4}
              value={reason}
              onChange={e => setReason(e.target.value)}
              placeholder="Add any notes for your manager..."
              className="border border-gray-200 rounded-lg px-3 py-2.5 text-sm focus:outline-none focus:border-[#22c55e] w-full resize-none"
            />
          </div>

          {/* Cover arrangement */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1.5">Cover arrangement</label>
            <textarea
              rows={2}
              value={cover}
              onChange={e => setCover(e.target.value)}
              placeholder="Who will cover your responsibilities?"
              className="border border-gray-200 rounded-lg px-3 py-2.5 text-sm focus:outline-none focus:border-[#22c55e] w-full resize-none"
            />
          </div>

          {/* File upload */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1.5">
              Attach medical certificate
              <span className="ml-1.5 text-xs text-amber-600 font-normal">Required for sick leave</span>
            </label>
            <label className="flex flex-col items-center justify-center gap-2 border-2 border-dashed border-gray-200 rounded-xl py-6 cursor-pointer hover:border-[#22c55e] hover:bg-green-50 transition-colors">
              <Upload size={20} className="text-gray-400" />
              <span className="text-sm text-gray-500">Click to upload or drag and drop</span>
              <span className="text-xs text-gray-400">PDF, JPG, PNG up to 10MB</span>
              <input type="file" className="hidden" accept=".pdf,.jpg,.jpeg,.png" />
            </label>
          </div>

          {/* Actions */}
          <div className="flex items-center justify-end gap-3 pt-2">
            <button
              type="button"
              onClick={() => navigate('/employee/leave')}
              className="px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="px-5 py-2 text-sm font-medium text-white bg-[#22c55e] rounded-lg hover:bg-green-600 transition-colors"
            >
              Submit request
            </button>
          </div>
        </form>
      </div>
    </div>
  )
}
