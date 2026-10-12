import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { ChevronLeft, ChevronDown, BarChart2, Download } from 'lucide-react'
import {
  employees as employeesApi,
  payroll as payrollApi,
  attendance as attendanceApi,
  leave as leaveApi,
  departments as departmentsApi,
  type Department,
} from '../../lib/api'

type Format = 'CSV' | 'PDF' | 'Excel'
type ReportType = 'Employees' | 'Payroll' | 'Attendance' | 'Leave'

function toCSV(rows: Record<string, string | number | null | undefined>[]): string {
  if (!rows.length) return ''
  const headers = Object.keys(rows[0])
  const escape = (v: string | number | null | undefined) => {
    const s = v == null ? '' : String(v)
    return s.includes(',') || s.includes('"') || s.includes('\n')
      ? `"${s.replace(/"/g, '""')}"`
      : s
  }
  return [
    headers.join(','),
    ...rows.map(r => headers.map(h => escape(r[h])).join(','))
  ].join('\n')
}

function downloadCSV(csv: string, filename: string) {
  const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' })
  const url = URL.createObjectURL(blob)
  const a = document.createElement('a')
  a.href = url
  a.download = filename
  a.click()
  URL.revokeObjectURL(url)
}

export default function CreateReport() {
  const navigate = useNavigate()
  const [format, setFormat] = useState<Format>('CSV')
  const [reportName, setReportName] = useState('')
  const [reportType, setReportType] = useState<ReportType | ''>('')
  const [startDate, setStartDate] = useState('')
  const [endDate, setEndDate] = useState('')
  const [departmentId, setDepartmentId] = useState('all')
  const [depts, setDepts] = useState<Department[]>([])
  const [generating, setGenerating] = useState(false)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    departmentsApi.list().then(setDepts).catch(() => {})
  }, [])

  const formats: Format[] = ['CSV', 'PDF', 'Excel']

  async function handleGenerate() {
    if (!reportType) return
    setGenerating(true)
    setError(null)
    try {
      let csv = ''
      const name = reportName || `${reportType} Report`

      if (reportType === 'Employees') {
        const data = await employeesApi.list()
        const rows = data
          .filter(e => !departmentId || departmentId === 'all' || e.departmentId === departmentId)
          .map(e => ({
            Name: e.fullName,
            Email: e.email,
            'Employee Number': e.employeeNumber,
            'Job Title': e.jobTitle ?? '',
            Department: e.departmentName ?? '',
            'Employment Type': e.employmentType ?? '',
            Status: e.employmentStatus,
            'Start Date': e.startDate ?? '',
          }))
        csv = toCSV(rows)
      } else if (reportType === 'Payroll') {
        const data = await payrollApi.list()
        const rows = data
          .filter(r => {
            if (startDate && r.periodStart < startDate) return false
            if (endDate && r.periodEnd > endDate) return false
            return true
          })
          .map(r => ({
            'Period Start': r.periodStart,
            'Period End': r.periodEnd,
            Status: r.status,
            'Total Gross': r.totalGross ?? '',
            'Total Net': r.totalNet ?? '',
            'Total Deductions': r.totalDeductions ?? '',
            'Run By': r.runByName ?? '',
          }))
        csv = toCSV(rows)
      } else if (reportType === 'Attendance') {
        const data = await attendanceApi.list()
        const rows = data
          .filter(r => {
            if (startDate && r.date < startDate) return false
            if (endDate && r.date > endDate) return false
            return true
          })
          .map(r => ({
            Employee: r.employeeName ?? r.employeeId,
            Date: r.date,
            'Clock In': r.clockIn ?? '',
            'Clock Out': r.clockOut ?? '',
            Status: r.status,
            Notes: r.notes ?? '',
          }))
        csv = toCSV(rows)
      } else if (reportType === 'Leave') {
        const data = await leaveApi.list()
        const rows = data
          .filter(r => {
            if (startDate && r.startDate < startDate) return false
            if (endDate && r.endDate > endDate) return false
            return true
          })
          .map(r => ({
            Employee: r.employeeName ?? r.employeeId,
            'Leave Type': r.leaveType,
            'Start Date': r.startDate,
            'End Date': r.endDate,
            Days: r.daysRequested,
            Status: r.status,
            Reason: r.reason ?? '',
          }))
        csv = toCSV(rows)
      }

      if (!csv) {
        setError('No data found for the selected criteria')
        return
      }

      downloadCSV(csv, `${name.replace(/\s+/g, '_')}.csv`)
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : 'Failed to generate report')
    } finally {
      setGenerating(false)
    }
  }

  return (
    <div className="">
      <button
        onClick={() => navigate('/employer/reports')}
        className="flex items-center gap-1.5 text-sm font-medium mb-5 transition-colors"
        style={{ color: '#22c55e' }}
      >
        <ChevronLeft size={16} />
        Back to reports
      </button>

      <h1 className="text-2xl font-bold text-gray-900 mb-6">Create report</h1>

      {error && (
        <div className="mb-5 px-4 py-3 bg-red-50 text-red-700 text-sm rounded-lg">{error}</div>
      )}

      <div className="grid grid-cols-5 gap-6">
        <div className="col-span-3 bg-white rounded-xl border border-gray-200 p-6">
          <h2 className="text-base font-semibold text-gray-900 mb-5">Report configuration</h2>

          <div className="flex flex-col gap-5">
            <div className="flex flex-col gap-1.5">
              <label className="text-sm font-medium text-gray-700">Report name</label>
              <input
                type="text"
                placeholder="Enter report name"
                value={reportName}
                onChange={e => setReportName(e.target.value)}
                className="w-full px-3 py-2.5 text-sm border border-gray-200 rounded-lg focus:outline-none focus:ring-1 focus:ring-green-400 focus:border-green-400"
              />
            </div>

            <div className="flex flex-col gap-1.5">
              <label className="text-sm font-medium text-gray-700">Report type</label>
              <div className="relative">
                <select
                  value={reportType}
                  onChange={e => setReportType(e.target.value as ReportType | '')}
                  className="w-full appearance-none px-3 py-2.5 text-sm border border-gray-200 rounded-lg focus:outline-none focus:ring-1 focus:ring-green-400 focus:border-green-400 bg-white text-gray-700 pr-8"
                >
                  <option value="">Select report type</option>
                  <option>Employees</option>
                  <option>Payroll</option>
                  <option>Attendance</option>
                  <option>Leave</option>
                </select>
                <ChevronDown size={14} className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 pointer-events-none" />
              </div>
            </div>

            <div>
              <label className="text-sm font-medium text-gray-700 block mb-1.5">Date range</label>
              <div className="grid grid-cols-2 gap-3">
                <div className="flex flex-col gap-1">
                  <label className="text-xs text-gray-500">Start date</label>
                  <input type="date" value={startDate} onChange={e => setStartDate(e.target.value)}
                    className="w-full px-3 py-2.5 text-sm border border-gray-200 rounded-lg focus:outline-none focus:ring-1 focus:ring-green-400 focus:border-green-400" />
                </div>
                <div className="flex flex-col gap-1">
                  <label className="text-xs text-gray-500">End date</label>
                  <input type="date" value={endDate} onChange={e => setEndDate(e.target.value)}
                    className="w-full px-3 py-2.5 text-sm border border-gray-200 rounded-lg focus:outline-none focus:ring-1 focus:ring-green-400 focus:border-green-400" />
                </div>
              </div>
            </div>

            <div className="flex flex-col gap-1.5">
              <label className="text-sm font-medium text-gray-700">Department</label>
              <div className="relative">
                <select value={departmentId} onChange={e => setDepartmentId(e.target.value)}
                  className="w-full appearance-none px-3 py-2.5 text-sm border border-gray-200 rounded-lg focus:outline-none focus:ring-1 focus:ring-green-400 bg-white text-gray-700 pr-8">
                  <option value="all">All departments</option>
                  {depts.map(d => <option key={d.id} value={d.id}>{d.name}</option>)}
                </select>
                <ChevronDown size={14} className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 pointer-events-none" />
              </div>
            </div>

            <div>
              <label className="text-sm font-medium text-gray-700 block mb-2">Format</label>
              <div className="flex items-center gap-2">
                {formats.map(f => (
                  <button key={f} onClick={() => setFormat(f)}
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
              {format !== 'CSV' && (
                <p className="text-xs text-gray-400 mt-1.5">Only CSV export is available. PDF/Excel coming soon.</p>
              )}
            </div>
          </div>
        </div>

        <div className="col-span-2 bg-white rounded-xl border border-gray-200 p-6">
          <h2 className="text-base font-semibold text-gray-900 mb-5">Preview</h2>
          {reportType ? (
            <div className="bg-gray-50 rounded-xl flex flex-col items-center justify-center gap-3 h-64">
              <Download size={32} className="text-[#22c55e]" />
              <p className="text-sm font-medium text-gray-700">{reportType} Report</p>
              <p className="text-xs text-gray-400 text-center">
                {startDate && endDate ? `${startDate} to ${endDate}` : 'All time'}
              </p>
              <p className="text-xs text-gray-400">Format: {format}</p>
            </div>
          ) : (
            <div className="bg-gray-50 rounded-xl flex flex-col items-center justify-center gap-3 h-64">
              <BarChart2 size={40} className="text-gray-300" />
              <p className="text-sm text-gray-400 text-center max-w-xs">
                Configure your report settings to see a preview
              </p>
            </div>
          )}
        </div>
      </div>

      <div className="flex items-center justify-end gap-3 mt-6">
        <button
          onClick={() => navigate('/employer/reports')}
          className="px-4 py-2 text-sm font-medium text-gray-600 border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors"
        >
          Cancel
        </button>
        <button
          onClick={handleGenerate}
          disabled={!reportType || generating}
          className="px-5 py-2 text-sm font-medium text-white rounded-lg transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
          style={{ backgroundColor: '#22c55e' }}
        >
          {generating ? 'Generating...' : 'Generate report'}
        </button>
      </div>
    </div>
  )
}
