import { useState } from 'react'
import { useNavigate } from 'react-router-dom'

type CoverageType = 'Employee only' | 'Employee + Spouse' | 'Employee + Family'

export default function CreateBenefitPlan() {
  const navigate = useNavigate()

  const [planName, setPlanName] = useState('')
  const [provider, setProvider] = useState('')
  const [providerWebsite, setProviderWebsite] = useState('')
  const [planType, setPlanType] = useState('')
  const [description, setDescription] = useState('')
  const [monthlyCost, setMonthlyCost] = useState('')
  const [coverage, setCoverage] = useState<CoverageType>('Employee only')
  const [docRequired, setDocRequired] = useState(false)
  const [enrolmentDeadline, setEnrolmentDeadline] = useState('')
  const [availability, setAvailability] = useState<string[]>(['All employees'])
  const [countries, setCountries] = useState('All countries')

  const inputCls = 'border border-gray-200 rounded-lg px-3 py-2.5 text-sm focus:outline-none focus:border-[#22c55e] w-full'

  const coverageOptions: CoverageType[] = ['Employee only', 'Employee + Spouse', 'Employee + Family']
  const availabilityOptions = ['All employees', 'Full-time only', 'Part-time only', 'Contractors']

  function toggleAvailability(option: string) {
    setAvailability(prev =>
      prev.includes(option) ? prev.filter(v => v !== option) : [...prev, option]
    )
  }

  return (
    <div className="px-8 py-6">
      {/* Header */}
      <div className="mb-6">
        <button
          onClick={() => navigate('/employer/benefits')}
          className="text-sm text-[#22c55e] hover:text-green-700 mb-3 flex items-center gap-1"
        >
          ← Back to benefits
        </button>
        <h1 className="text-2xl font-bold text-gray-900">Create benefit plan</h1>
      </div>

      {/* Single wide card */}
      <div className="bg-white rounded-xl border border-gray-100 shadow-sm p-8 max-w-3xl">

        {/* Section 1 — Plan details */}
        <h2 className="text-base font-semibold text-gray-900 mb-5">Plan details</h2>
        <div className="space-y-4">
          <div>
            <label className="block text-xs font-medium text-gray-500 mb-1.5">Plan name</label>
            <input
              type="text"
              placeholder="e.g. Gold Health Plan"
              value={planName}
              onChange={e => setPlanName(e.target.value)}
              className={inputCls}
            />
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-medium text-gray-500 mb-1.5">Benefit provider</label>
              <input
                type="text"
                placeholder="e.g. Bupa"
                value={provider}
                onChange={e => setProvider(e.target.value)}
                className={inputCls}
              />
            </div>
            <div>
              <label className="block text-xs font-medium text-gray-500 mb-1.5">Provider website</label>
              <input
                type="text"
                placeholder="https://"
                value={providerWebsite}
                onChange={e => setProviderWebsite(e.target.value)}
                className={inputCls}
              />
            </div>
          </div>
          <div>
            <label className="block text-xs font-medium text-gray-500 mb-1.5">Plan type</label>
            <select
              value={planType}
              onChange={e => setPlanType(e.target.value)}
              className={inputCls}
            >
              <option value="">Select plan type</option>
              <option>Health</option>
              <option>Dental</option>
              <option>Vision</option>
              <option>Life insurance</option>
              <option>Pension</option>
              <option>Paid time off</option>
              <option>Remote work</option>
              <option>Professional development</option>
            </select>
          </div>
          <div>
            <label className="block text-xs font-medium text-gray-500 mb-1.5">Description</label>
            <textarea
              rows={3}
              placeholder="Describe the benefit plan..."
              value={description}
              onChange={e => setDescription(e.target.value)}
              className={`${inputCls} resize-none`}
            />
          </div>
        </div>

        {/* Section 2 — Coverage & cost */}
        <div className="mt-6 border-t border-gray-100 pt-6">
          <h2 className="text-base font-semibold text-gray-900 mb-5">Coverage &amp; cost</h2>
          <div className="space-y-4">
            {/* Monthly cost */}
            <div>
              <label className="block text-xs font-medium text-gray-500 mb-1.5">Monthly cost per employee</label>
              <div className="relative">
                <span className="absolute left-3 top-1/2 -translate-y-1/2 text-sm text-gray-400">£</span>
                <input
                  type="number"
                  placeholder="0.00"
                  value={monthlyCost}
                  onChange={e => setMonthlyCost(e.target.value)}
                  className={`${inputCls} pl-7`}
                />
              </div>
            </div>

            {/* Coverage type radio pills */}
            <div>
              <label className="block text-xs font-medium text-gray-500 mb-2">Coverage type</label>
              <div className="flex gap-2 flex-wrap">
                {coverageOptions.map(opt => (
                  <button
                    key={opt}
                    onClick={() => setCoverage(opt)}
                    className={`px-4 py-2 rounded-full text-sm border transition-colors ${
                      coverage === opt
                        ? 'bg-[#22c55e] border-[#22c55e] text-white'
                        : 'border-gray-200 text-gray-600 hover:border-gray-300 hover:bg-gray-50'
                    }`}
                  >
                    {opt}
                  </button>
                ))}
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              {/* Document required toggle */}
              <div className="flex items-center justify-between py-1 col-span-2 sm:col-span-1">
                <div>
                  <p className="text-sm font-medium text-gray-800">Document required</p>
                  <p className="text-xs text-gray-400 mt-0.5">Employees must submit a document to enrol</p>
                </div>
                <button
                  onClick={() => setDocRequired(v => !v)}
                  className={`relative w-10 h-5 rounded-full transition-colors flex-shrink-0 ml-4 ${docRequired ? 'bg-[#22c55e]' : 'bg-gray-200'}`}
                >
                  <span className={`absolute top-0.5 w-4 h-4 rounded-full bg-white shadow transition-all ${docRequired ? 'left-5' : 'left-0.5'}`} />
                </button>
              </div>

              {/* Enrolment deadline */}
              <div>
                <label className="block text-xs font-medium text-gray-500 mb-1.5">Enrolment deadline</label>
                <input
                  type="date"
                  value={enrolmentDeadline}
                  onChange={e => setEnrolmentDeadline(e.target.value)}
                  className={inputCls}
                />
              </div>
            </div>
          </div>
        </div>

        {/* Section 3 — Availability */}
        <div className="mt-6 border-t border-gray-100 pt-6">
          <h2 className="text-base font-semibold text-gray-900 mb-5">Availability</h2>
          <div className="space-y-4">
            {/* Available to checkboxes */}
            <div>
              <label className="block text-xs font-medium text-gray-500 mb-2">Available to</label>
              <div className="flex flex-wrap gap-3">
                {availabilityOptions.map(opt => (
                  <label key={opt} className="flex items-center gap-2 cursor-pointer">
                    <input
                      type="checkbox"
                      checked={availability.includes(opt)}
                      onChange={() => toggleAvailability(opt)}
                      className="w-4 h-4 rounded border-gray-300 accent-[#22c55e]"
                    />
                    <span className="text-sm text-gray-700">{opt}</span>
                  </label>
                ))}
              </div>
            </div>

            {/* Departments */}
            <div>
              <label className="block text-xs font-medium text-gray-500 mb-1.5">Departments</label>
              <div className="flex items-center gap-2 flex-wrap">
                <span className="inline-flex items-center gap-1 px-3 py-1.5 text-sm bg-gray-100 text-gray-700 rounded-full">
                  All departments
                  <button className="text-gray-400 hover:text-gray-600 ml-1 leading-none">×</button>
                </span>
                <button className="text-sm text-[#22c55e] hover:text-green-700">+ Add department</button>
              </div>
            </div>

            {/* Countries */}
            <div>
              <label className="block text-xs font-medium text-gray-500 mb-1.5">Countries</label>
              <input
                type="text"
                value={countries}
                onChange={e => setCountries(e.target.value)}
                className={inputCls}
              />
            </div>
          </div>
        </div>
      </div>

      {/* Bottom buttons */}
      <div className="flex items-center gap-3 mt-6">
        <button
          onClick={() => navigate('/employer/benefits')}
          className="px-5 py-2.5 text-sm text-gray-600 border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors"
        >
          Cancel
        </button>
        <button className="px-5 py-2.5 text-sm text-gray-600 border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors">
          Save as draft
        </button>
        <button
          onClick={() => navigate('/employer/benefits')}
          className="px-5 py-2.5 text-sm font-medium text-white bg-[#22c55e] rounded-lg hover:bg-green-600 transition-colors"
        >
          Create benefit plan
        </button>
      </div>
    </div>
  )
}
