import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { ChevronLeft, ChevronDown, BarChart2 } from 'lucide-react'

type Format = 'PDF' | 'CSV' | 'Excel'

function SelectField({ label, placeholder }: { label: string; placeholder: string }) {
  return (
    <div className="flex flex-col gap-1.5">
      <label className="text-sm font-medium text-gray-700">{label}</label>
      <div className="relative">
        <select className="w-full appearance-none px-3 py-2.5 text-sm border border-gray-200 rounded-lg focus:outline-none focus:ring-1 focus:ring-green-400 focus:border-green-400 bg-white text-gray-700 pr-8">
          <option value="">{placeholder}</option>
        </select>
        <ChevronDown
          size={14}
          className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 pointer-events-none"
        />
      </div>
    </div>
  )
}

export default function CreateReport() {
  const navigate = useNavigate()
  const [format, setFormat] = useState<Format>('PDF')

  const formats: Format[] = ['PDF', 'CSV', 'Excel']

  function handleGenerate() {
    navigate('/employer/reports')
  }

  return (
    <div className="max-w-7xl mx-auto">
      {/* Breadcrumb */}
      <button
        onClick={() => navigate('/employer/reports')}
        className="flex items-center gap-1.5 text-sm font-medium mb-5 transition-colors"
        style={{ color: '#22c55e' }}
      >
        <ChevronLeft size={16} />
        Back to reports
      </button>

      {/* Header */}
      <h1 className="text-2xl font-bold text-gray-900 mb-6">Create report</h1>

      {/* Two-column grid */}
      <div className="grid grid-cols-5 gap-6">
        {/* Left: configuration */}
        <div className="col-span-3 bg-white rounded-xl border border-gray-200 p-6">
          <h2 className="text-base font-semibold text-gray-900 mb-5">Report configuration</h2>

          <div className="flex flex-col gap-5">
            {/* Report name */}
            <div className="flex flex-col gap-1.5">
              <label className="text-sm font-medium text-gray-700">Report name</label>
              <input
                type="text"
                placeholder="Enter report name"
                className="w-full px-3 py-2.5 text-sm border border-gray-200 rounded-lg focus:outline-none focus:ring-1 focus:ring-green-400 focus:border-green-400"
              />
            </div>

            {/* Report type */}
            <SelectField
              label="Report type"
              placeholder="Select report type"
            />

            {/* Date range */}
            <div>
              <label className="text-sm font-medium text-gray-700 block mb-1.5">Date range</label>
              <div className="grid grid-cols-2 gap-3">
                <div className="flex flex-col gap-1">
                  <label className="text-xs text-gray-500">Start date</label>
                  <input
                    type="date"
                    className="w-full px-3 py-2.5 text-sm border border-gray-200 rounded-lg focus:outline-none focus:ring-1 focus:ring-green-400 focus:border-green-400"
                  />
                </div>
                <div className="flex flex-col gap-1">
                  <label className="text-xs text-gray-500">End date</label>
                  <input
                    type="date"
                    className="w-full px-3 py-2.5 text-sm border border-gray-200 rounded-lg focus:outline-none focus:ring-1 focus:ring-green-400 focus:border-green-400"
                  />
                </div>
              </div>
            </div>

            {/* Department */}
            <div className="flex flex-col gap-1.5">
              <label className="text-sm font-medium text-gray-700">Department</label>
              <div className="relative">
                <select className="w-full appearance-none px-3 py-2.5 text-sm border border-gray-200 rounded-lg focus:outline-none focus:ring-1 focus:ring-green-400 bg-white text-gray-700 pr-8">
                  <option>All departments</option>
                  <option>Engineering</option>
                  <option>Marketing</option>
                  <option>HR</option>
                  <option>Finance</option>
                  <option>Product</option>
                </select>
                <ChevronDown size={14} className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 pointer-events-none" />
              </div>
            </div>

            {/* Group by */}
            <div className="flex flex-col gap-1.5">
              <label className="text-sm font-medium text-gray-700">Group by</label>
              <div className="relative">
                <select className="w-full appearance-none px-3 py-2.5 text-sm border border-gray-200 rounded-lg focus:outline-none focus:ring-1 focus:ring-green-400 bg-white text-gray-700 pr-8">
                  <option>Department</option>
                  <option>Location</option>
                  <option>Level</option>
                  <option>Employment type</option>
                </select>
                <ChevronDown size={14} className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 pointer-events-none" />
              </div>
            </div>

            {/* Format */}
            <div>
              <label className="text-sm font-medium text-gray-700 block mb-2">Format</label>
              <div className="flex items-center gap-2">
                {formats.map((f) => (
                  <button
                    key={f}
                    onClick={() => setFormat(f)}
                    className="px-4 py-2 text-sm font-medium rounded-lg border transition-colors"
                    style={{
                      backgroundColor: format === f ? '#111827' : '#fff',
                      color: format === f ? '#fff' : '#374151',
                      borderColor: format === f ? '#111827' : '#d1d5db',
                    }}
                  >
                    {f}
                  </button>
                ))}
              </div>
            </div>
          </div>
        </div>

        {/* Right: preview */}
        <div className="col-span-2 bg-white rounded-xl border border-gray-200 p-6">
          <h2 className="text-base font-semibold text-gray-900 mb-5">Preview</h2>
          <div className="bg-gray-50 rounded-xl flex flex-col items-center justify-center gap-3 h-64">
            <BarChart2 size={40} className="text-gray-300" />
            <p className="text-sm text-gray-400 text-center max-w-xs">
              Configure your report settings to see a preview
            </p>
          </div>
        </div>
      </div>

      {/* Bottom buttons */}
      <div className="flex items-center justify-end gap-3 mt-6">
        <button
          onClick={() => navigate('/employer/reports')}
          className="px-4 py-2 text-sm font-medium text-gray-600 border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors"
        >
          Cancel
        </button>
        <button
          onClick={handleGenerate}
          className="px-5 py-2 text-sm font-medium text-white rounded-lg transition-colors"
          style={{ backgroundColor: '#22c55e' }}
        >
          Generate report
        </button>
      </div>
    </div>
  )
}
