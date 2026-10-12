import { useState, useEffect, useRef } from 'react'
import { useNavigate } from 'react-router-dom'
import { UploadCloud, FileText, Check } from 'lucide-react'
import { documents as documentsApi, employees as employeesApi, type Employee } from '../../lib/api'

export default function UploadDocument() {
  const navigate = useNavigate()
  const fileInputRef = useRef<HTMLInputElement>(null)

  const [requireSignature, setRequireSignature] = useState(false)
  const [sendNotification, setSendNotification] = useState(true)
  const [docName, setDocName] = useState('')
  const [docType, setDocType] = useState('')
  const [assignedTo, setAssignedTo] = useState('')
  const [description, setDescription] = useState('')
  const [expiryDate, setExpiryDate] = useState('')
  const [selectedFile, setSelectedFile] = useState<File | null>(null)
  const [uploading, setUploading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [empList, setEmpList] = useState<Employee[]>([])

  useEffect(() => {
    employeesApi.list().then(setEmpList).catch(() => {})
  }, [])

  const inputCls = 'border border-gray-200 rounded-lg px-3 py-2.5 text-sm focus:outline-none focus:border-[#22c55e] w-full'

  const checks = [
    { label: 'Document details filled',          done: docName.length > 0 && docType.length > 0 },
    { label: 'File selected',                    done: selectedFile !== null },
    { label: 'Employee assigned (optional)',     done: assignedTo.length > 0 },
    { label: 'Notification settings configured', done: true },
  ]

  function handleFileChange(e: React.ChangeEvent<HTMLInputElement>) {
    const f = e.target.files?.[0] ?? null
    setSelectedFile(f)
    if (f && !docName) setDocName(f.name.replace(/\.[^.]+$/, ''))
  }

  function handleDrop(e: React.DragEvent) {
    e.preventDefault()
    const f = e.dataTransfer.files[0]
    if (f) {
      setSelectedFile(f)
      if (!docName) setDocName(f.name.replace(/\.[^.]+$/, ''))
    }
  }

  async function handleSubmit() {
    if (!selectedFile || !docName || !docType) return
    setUploading(true)
    setError(null)
    try {
      const fd = new FormData()
      fd.append('file', selectedFile)
      fd.append('name', docName)
      fd.append('docType', docType)
      if (description) fd.append('description', description)
      if (assignedTo) fd.append('employeeId', assignedTo)
      if (expiryDate) fd.append('expiryDate', expiryDate)
      fd.append('requireSignature', String(requireSignature))
      await documentsApi.upload(fd)
      navigate('/employer/documents')
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : 'Upload failed')
    } finally {
      setUploading(false)
    }
  }

  const canUpload = docName.length > 0 && docType.length > 0 && selectedFile !== null

  return (
    <div className="">
      {/* Header */}
      <div className="mb-6">
        <button
          onClick={() => navigate('/employer/documents')}
          className="text-sm text-[#22c55e] hover:text-green-700 mb-3 flex items-center gap-1"
        >
          ← Back to documents
        </button>
        <h1 className="text-2xl font-bold text-gray-900">Upload document</h1>
      </div>

      {error && (
        <div className="mb-4 px-4 py-3 rounded-lg bg-red-50 text-red-700 text-sm">{error}</div>
      )}

      {/* Two-column layout */}
      <div className="grid grid-cols-5 gap-6">
        {/* Left — col-span-3 */}
        <div className="col-span-3 space-y-4">
          {/* Document details card */}
          <div className="bg-white rounded-xl border border-gray-100 shadow-sm p-6">
            <h2 className="text-base font-semibold text-gray-900 mb-5">Document details</h2>
            <div className="space-y-4">
              <div>
                <label className="block text-xs font-medium text-gray-500 mb-1.5">Document name</label>
                <input
                  type="text"
                  placeholder="Enter document name"
                  value={docName}
                  onChange={e => setDocName(e.target.value)}
                  className={inputCls}
                />
              </div>

              <div>
                <label className="block text-xs font-medium text-gray-500 mb-1.5">Document type</label>
                <select value={docType} onChange={e => setDocType(e.target.value)} className={inputCls}>
                  <option value="">Select document type</option>
                  <option>Contract</option>
                  <option>Compliance</option>
                  <option>Tax</option>
                  <option>Offer letter</option>
                  <option>Policy</option>
                  <option>Other</option>
                </select>
              </div>

              <div>
                <label className="block text-xs font-medium text-gray-500 mb-1.5">
                  Assign to employee <span className="text-gray-400 font-normal">(optional)</span>
                </label>
                <select value={assignedTo} onChange={e => setAssignedTo(e.target.value)} className={inputCls}>
                  <option value="">Select employee</option>
                  {empList.map(e => (
                    <option key={e.id} value={e.id}>{e.fullName}</option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-xs font-medium text-gray-500 mb-1.5">Description</label>
                <textarea
                  rows={3}
                  placeholder="Enter a description for this document"
                  value={description}
                  onChange={e => setDescription(e.target.value)}
                  className={`${inputCls} resize-none`}
                />
              </div>

              <div>
                <label className="block text-xs font-medium text-gray-500 mb-1.5">
                  Expiry date <span className="text-gray-400 font-normal">(optional)</span>
                </label>
                <input
                  type="date"
                  value={expiryDate}
                  onChange={e => setExpiryDate(e.target.value)}
                  className={inputCls}
                />
                <p className="text-xs text-gray-400 mt-1">Leave blank if document doesn't expire</p>
              </div>

              <div className="flex items-center justify-between py-1">
                <div>
                  <p className="text-sm font-medium text-gray-800">Require signature</p>
                  <p className="text-xs text-gray-400 mt-0.5">Employee must sign this document</p>
                </div>
                <button
                  onClick={() => setRequireSignature(v => !v)}
                  className={`relative w-10 h-5 rounded-full transition-colors flex-shrink-0 ${requireSignature ? 'bg-[#22c55e]' : 'bg-gray-200'}`}
                >
                  <span className={`absolute top-0.5 w-4 h-4 rounded-full bg-white shadow transition-all ${requireSignature ? 'left-5' : 'left-0.5'}`} />
                </button>
              </div>

              <div className="flex items-center justify-between py-1">
                <div>
                  <p className="text-sm font-medium text-gray-800">Send notification to employee</p>
                  <p className="text-xs text-gray-400 mt-0.5">Notify employee when document is uploaded</p>
                </div>
                <button
                  onClick={() => setSendNotification(v => !v)}
                  className={`relative w-10 h-5 rounded-full transition-colors flex-shrink-0 ${sendNotification ? 'bg-[#22c55e]' : 'bg-gray-200'}`}
                >
                  <span className={`absolute top-0.5 w-4 h-4 rounded-full bg-white shadow transition-all ${sendNotification ? 'left-5' : 'left-0.5'}`} />
                </button>
              </div>
            </div>
          </div>

          {/* Upload area */}
          <input
            ref={fileInputRef}
            type="file"
            accept=".pdf,.docx,.doc,.png,.jpg,.jpeg"
            className="hidden"
            onChange={handleFileChange}
          />
          <div
            className="border-2 border-dashed border-gray-200 rounded-xl p-8 text-center bg-white cursor-pointer hover:border-[#22c55e] transition-colors"
            onClick={() => fileInputRef.current?.click()}
            onDragOver={e => e.preventDefault()}
            onDrop={handleDrop}
          >
            <div className="w-12 h-12 rounded-xl bg-green-50 flex items-center justify-center mx-auto mb-3">
              <UploadCloud size={24} className="text-[#22c55e]" />
            </div>
            {selectedFile ? (
              <>
                <p className="text-sm font-semibold text-gray-800 mb-1">{selectedFile.name}</p>
                <p className="text-xs text-gray-400">{(selectedFile.size / 1024 / 1024).toFixed(2)} MB</p>
              </>
            ) : (
              <>
                <p className="text-sm font-semibold text-gray-800 mb-1">Drag & drop your document here</p>
                <p className="text-xs text-gray-400 mb-4">Supports PDF, DOCX, PNG up to 10MB</p>
                <button
                  type="button"
                  className="px-4 py-2 text-sm text-gray-600 border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors"
                  onClick={e => { e.stopPropagation(); fileInputRef.current?.click() }}
                >
                  Browse files
                </button>
              </>
            )}
          </div>
        </div>

        {/* Right — col-span-2 */}
        <div className="col-span-2">
          <div className="bg-white rounded-xl border border-gray-100 shadow-sm p-6 sticky top-6">
            <h2 className="text-base font-semibold text-gray-900 mb-5">Upload summary</h2>

            {!selectedFile ? (
              <div className="flex flex-col items-center justify-center py-8 text-center">
                <div className="w-12 h-12 rounded-xl bg-gray-100 flex items-center justify-center mb-3">
                  <FileText size={20} className="text-gray-400" />
                </div>
                <p className="text-sm text-gray-400">No document selected</p>
              </div>
            ) : (
              <div className="bg-gray-50 rounded-lg p-4 mb-5 flex items-start gap-3">
                <div className="w-9 h-9 rounded-lg bg-blue-100 flex items-center justify-center flex-shrink-0">
                  <FileText size={16} className="text-blue-600" />
                </div>
                <div className="min-w-0">
                  <p className="text-sm font-medium text-gray-900 truncate">{selectedFile.name}</p>
                  <p className="text-xs text-gray-400 mt-0.5">
                    {(selectedFile.size / 1024 / 1024).toFixed(2)} MB · {selectedFile.type || 'file'}
                  </p>
                </div>
              </div>
            )}

            <div className="space-y-3">
              {checks.map(({ label, done }) => (
                <div key={label} className="flex items-center gap-2.5">
                  <div className={`w-5 h-5 rounded-full flex items-center justify-center flex-shrink-0 ${done ? 'bg-green-100' : 'bg-gray-100'}`}>
                    <Check size={11} className={done ? 'text-[#22c55e]' : 'text-gray-300'} />
                  </div>
                  <span className={`text-sm ${done ? 'text-gray-800' : 'text-gray-400'}`}>{label}</span>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* Bottom buttons */}
      <div className="flex items-center gap-3 mt-6">
        <button
          onClick={() => navigate('/employer/documents')}
          className="px-5 py-2.5 text-sm text-gray-600 border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors"
        >
          Cancel
        </button>
        <button
          onClick={handleSubmit}
          disabled={!canUpload || uploading}
          className="px-5 py-2.5 text-sm font-medium text-white bg-[#22c55e] rounded-lg hover:bg-green-600 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
        >
          {uploading ? 'Uploading...' : 'Upload document'}
        </button>
      </div>
    </div>
  )
}
