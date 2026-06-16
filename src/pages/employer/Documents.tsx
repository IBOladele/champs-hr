import { useState } from 'react'
import { Search, FileText, History, Clock, ChevronDown, MoreHorizontal } from 'lucide-react'

type SubTab = 'Documents uploaded' | 'Assigned documents' | 'Archived documents'
type DocStatus = 'Live' | 'Due' | 'Exp' | ''

interface DocRow {
  id: string
  name: string
  type: string
  uploadedBy: string
  uploadedByInitial: string
  uploadedByColor: string
  expiryDate: string
  status: DocStatus
}

const subTabs: SubTab[] = ['Documents uploaded', 'Assigned documents', 'Archived documents']

const documents: DocRow[] = [
  {
    id: '1',
    name: 'Company handbook',
    type: 'Policy, pov...',
    uploadedBy: 'J Smith meyer',
    uploadedByInitial: 'J',
    uploadedByColor: 'bg-[#22c55e]',
    expiryDate: 'Jan 1, 2025',
    status: 'Live',
  },
  {
    id: '2',
    name: 'Company handbook',
    type: 'Budget plan',
    uploadedBy: 'L Lana Mejias',
    uploadedByInitial: 'L',
    uploadedByColor: 'bg-blue-500',
    expiryDate: 'Feb 14, 2025',
    status: '',
  },
  {
    id: '3',
    name: 'Company handbook',
    type: 'Handbook',
    uploadedBy: 'K Keisha Locklear',
    uploadedByInitial: 'K',
    uploadedByColor: 'bg-purple-500',
    expiryDate: 'Feb 14, 2025',
    status: 'Live',
  },
  {
    id: '4',
    name: 'Company handbook',
    type: 'Verification docs',
    uploadedBy: 'M Miley Little',
    uploadedByInitial: 'M',
    uploadedByColor: 'bg-pink-500',
    expiryDate: 'Feb 14, 2025',
    status: '',
  },
  {
    id: '5',
    name: 'Company handbook',
    type: 'Handbook',
    uploadedBy: 'C Cyril Madril',
    uploadedByInitial: 'C',
    uploadedByColor: 'bg-orange-500',
    expiryDate: 'Feb 14, 2035',
    status: '',
  },
]

function StatusPill({ status }: { status: DocStatus }) {
  if (status === 'Live') {
    return (
      <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-green-100 text-green-700">
        Live
      </span>
    )
  }
  if (status === 'Due') {
    return (
      <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-amber-100 text-amber-700">
        Due
      </span>
    )
  }
  if (status === 'Exp') {
    return (
      <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-red-100 text-red-700">
        Exp
      </span>
    )
  }
  return null
}

export default function Documents() {
  const [activeTab, setActiveTab] = useState<SubTab>('Documents uploaded')
  const [search, setSearch] = useState('')

  const filtered = documents.filter((d) =>
    d.name.toLowerCase().includes(search.toLowerCase()) ||
    d.type.toLowerCase().includes(search.toLowerCase()),
  )

  return (
    <div className="px-8 py-6">
      {/* Page heading */}
      <h1 className="text-2xl font-bold text-gray-900 mb-6">Documents</h1>

      {/* Sub-tabs */}
      <div className="flex items-center border-b border-gray-200 mb-6">
        {subTabs.map((tab) => (
          <button
            key={tab}
            onClick={() => setActiveTab(tab)}
            className={`px-5 py-2.5 text-sm -mb-px transition-colors ${
              activeTab === tab
                ? 'border-b-2 border-gray-900 text-gray-900 font-medium'
                : 'text-gray-500 hover:text-gray-700'
            }`}
          >
            {tab}
          </button>
        ))}
      </div>

      {/* Section heading + Add button */}
      <div className="flex items-center justify-between mb-5">
        <h2 className="text-base font-semibold text-gray-900">Documents uploaded</h2>
        <button className="bg-[#22c55e] text-white px-4 py-2 rounded-lg text-sm font-medium hover:bg-green-600 transition-colors">
          + Add new documents
        </button>
      </div>

      {/* Stat cards */}
      <div className="grid grid-cols-3 gap-4 mb-6">
        {/* Total documents */}
        <div className="bg-white rounded-xl border border-gray-100 p-6 shadow-sm flex items-start gap-4">
          <div className="w-10 h-10 rounded-lg bg-green-50 flex items-center justify-center flex-shrink-0">
            <FileText size={18} className="text-[#22c55e]" />
          </div>
          <div>
            <p className="text-2xl font-bold text-gray-900">54,567</p>
            <p className="text-xs text-gray-500 mt-0.5">Total documents</p>
          </div>
        </div>
        {/* Uploaded this month */}
        <div className="bg-white rounded-xl border border-gray-100 p-6 shadow-sm flex items-start gap-4">
          <div className="w-10 h-10 rounded-lg bg-orange-50 flex items-center justify-center flex-shrink-0">
            <History size={18} className="text-orange-400" />
          </div>
          <div>
            <p className="text-2xl font-bold text-gray-900">24,585</p>
            <p className="text-xs text-gray-500 mt-0.5">Uploaded this month</p>
          </div>
        </div>
        {/* Pending review */}
        <div className="bg-white rounded-xl border border-gray-100 p-6 shadow-sm flex items-start gap-4">
          <div className="w-10 h-10 rounded-lg bg-blue-50 flex items-center justify-center flex-shrink-0">
            <Clock size={18} className="text-blue-500" />
          </div>
          <div>
            <p className="text-2xl font-bold text-gray-900">958</p>
            <p className="text-xs text-gray-500 mt-0.5">Pending review</p>
          </div>
        </div>
      </div>

      {/* Filter row */}
      <div className="flex items-center gap-3 mb-4">
        <div className="relative flex-1 max-w-xs">
          <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
          <input
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search for an employee"
            className="w-full pl-9 pr-3 py-2 text-sm border border-gray-200 rounded-lg focus:outline-none focus:border-[#22c55e] focus:ring-1 focus:ring-[#22c55e]"
          />
        </div>
        <button className="flex items-center gap-2 px-4 py-2 text-sm text-gray-600 border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors">
          Sort by status
          <ChevronDown size={14} />
        </button>
      </div>

      {/* Counter */}
      <p className="text-sm text-gray-500 mb-4">10 documents</p>

      {/* Table */}
      <div className="bg-white rounded-xl border border-gray-100 shadow-sm overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="bg-gray-50 border-b border-gray-100">
                <th className="text-left px-6 py-3 text-xs font-semibold text-gray-500 uppercase tracking-wide whitespace-nowrap">
                  Document name
                </th>
                <th className="text-left px-6 py-3 text-xs font-semibold text-gray-500 uppercase tracking-wide whitespace-nowrap">
                  Type
                </th>
                <th className="text-left px-6 py-3 text-xs font-semibold text-gray-500 uppercase tracking-wide whitespace-nowrap">
                  Uploaded by
                </th>
                <th className="text-left px-6 py-3 text-xs font-semibold text-gray-500 uppercase tracking-wide whitespace-nowrap">
                  Expiry date
                </th>
                <th className="text-left px-6 py-3 text-xs font-semibold text-gray-500 uppercase tracking-wide whitespace-nowrap">
                  Status
                </th>
                <th className="text-left px-6 py-3 text-xs font-semibold text-gray-500 uppercase tracking-wide whitespace-nowrap">
                  Actions
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {filtered.map((doc) => (
                <tr key={doc.id} className="hover:bg-gray-50 transition-colors">
                  {/* Document name */}
                  <td className="px-6 py-4">
                    <div className="flex items-center gap-3">
                      <div className="w-8 h-8 rounded-lg bg-blue-50 flex items-center justify-center flex-shrink-0">
                        <FileText size={14} className="text-blue-500" />
                      </div>
                      <span className="font-medium text-gray-900">{doc.name}</span>
                    </div>
                  </td>
                  {/* Type */}
                  <td className="px-6 py-4 text-gray-500 whitespace-nowrap">{doc.type}</td>
                  {/* Uploaded by */}
                  <td className="px-6 py-4">
                    <div className="flex items-center gap-2">
                      <div
                        className={`w-6 h-6 rounded-full ${doc.uploadedByColor} flex items-center justify-center text-white text-xs font-semibold flex-shrink-0`}
                      >
                        {doc.uploadedByInitial}
                      </div>
                      <span className="text-gray-600 whitespace-nowrap">{doc.uploadedBy}</span>
                    </div>
                  </td>
                  {/* Expiry date */}
                  <td className="px-6 py-4 text-gray-600 whitespace-nowrap">{doc.expiryDate}</td>
                  {/* Status */}
                  <td className="px-6 py-4">
                    <StatusPill status={doc.status} />
                  </td>
                  {/* Actions */}
                  <td className="px-6 py-4">
                    <div className="flex items-center gap-3">
                      <button className="text-sm text-gray-600 hover:text-gray-900 transition-colors">
                        View
                      </button>
                      <button className="p-1 text-gray-400 hover:text-gray-600 hover:bg-gray-100 rounded transition-colors">
                        <MoreHorizontal size={14} />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>

          {filtered.length === 0 && (
            <div className="text-center py-12 text-gray-400">
              <FileText size={28} className="mx-auto mb-2 opacity-30" />
              <p className="text-sm">No documents found.</p>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
