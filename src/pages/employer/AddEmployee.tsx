import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { Check, ChevronDown, Upload } from 'lucide-react'

const STEPS = [
  { label: 'Employee details', subtitle: 'Enter basic personal information for the new employee.' },
  { label: 'Employment information', subtitle: 'Specify role, department and employment terms.' },
  { label: 'Contract info', subtitle: 'Define contract type, salary and probation period.' },
  { label: 'Offer letter info', subtitle: 'Configure offer letter and signing deadline.' },
  { label: 'Review and send invites', subtitle: 'Review all details and send the invite.' },
]

function InputField({
  label,
  placeholder,
  dropdown,
  type = 'text',
}: {
  label: string
  placeholder?: string
  dropdown?: boolean
  type?: string
}) {
  return (
    <div className="flex flex-col gap-1.5">
      <label className="text-sm font-medium text-gray-700">{label}</label>
      <div className="relative">
        <input
          type={type}
          placeholder={placeholder ?? label}
          className="w-full px-3 py-2.5 text-sm border border-gray-200 rounded-lg focus:outline-none focus:ring-1 focus:ring-green-400 focus:border-green-400 pr-8"
        />
        {dropdown && (
          <ChevronDown
            size={14}
            className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 pointer-events-none"
          />
        )}
      </div>
    </div>
  )
}

function Step0() {
  return (
    <div className="flex flex-col gap-5">
      <div className="grid grid-cols-2 gap-4">
        <InputField label="First name" placeholder="First name" />
        <InputField label="Last name" placeholder="Last name" />
      </div>
      <InputField label="Email" placeholder="email@company.com" type="email" />
      <InputField label="Phone number" placeholder="+1 000 000 0000" type="tel" />
      <InputField label="Date of birth" placeholder="DD/MM/YYYY" type="date" />
      <InputField label="Gender" placeholder="Select gender" dropdown />
      <InputField label="Nationality" placeholder="Select nationality" dropdown />
    </div>
  )
}

function Step1() {
  return (
    <div className="flex flex-col gap-5">
      <div className="grid grid-cols-2 gap-4">
        <InputField label="Job title" placeholder="e.g. Software Engineer" />
        <InputField label="Department" placeholder="Select department" dropdown />
      </div>
      <InputField label="Work location" placeholder="Select location" dropdown />
      <InputField label="Employment type" placeholder="Select type" dropdown />
      <InputField label="Start date" type="date" />
      <InputField label="Reporting manager" placeholder="Search employee" />
      <InputField label="Level" placeholder="Select level" dropdown />
    </div>
  )
}

function Step2() {
  return (
    <div className="flex flex-col gap-5">
      <InputField label="Contract type" placeholder="Select contract type" dropdown />
      <div className="grid grid-cols-2 gap-4">
        <InputField label="Start date" type="date" />
        <InputField label="End date" type="date" />
      </div>
      <InputField label="Monthly salary" placeholder="0.00" type="number" />
      <InputField label="Pay currency" placeholder="Select currency" dropdown />
      <InputField label="Pay schedule" placeholder="Select schedule" dropdown />
      <InputField label="Probation period" placeholder="Select period" dropdown />
    </div>
  )
}

function Step3() {
  return (
    <div className="flex flex-col gap-5">
      <InputField label="Offer letter template" placeholder="Select template" dropdown />
      <InputField label="Signing deadline" type="date" />
      <div className="flex flex-col gap-1.5">
        <label className="text-sm font-medium text-gray-700">Additional notes</label>
        <textarea
          rows={3}
          placeholder="Add any additional notes..."
          className="w-full px-3 py-2.5 text-sm border border-gray-200 rounded-lg focus:outline-none focus:ring-1 focus:ring-green-400 focus:border-green-400 resize-none"
        />
      </div>
      <div>
        <label className="text-sm font-medium text-gray-700 block mb-1.5">Upload offer letter</label>
        <div className="border-2 border-dashed border-gray-200 rounded-lg p-8 flex flex-col items-center justify-center gap-3 hover:bg-gray-50 cursor-pointer transition-colors">
          <div className="w-10 h-10 bg-gray-100 rounded-full flex items-center justify-center">
            <Upload size={18} className="text-gray-400" />
          </div>
          <p className="text-sm text-gray-500">Upload offer letter</p>
          <p className="text-xs text-gray-400">PDF, DOCX up to 10MB</p>
        </div>
      </div>
    </div>
  )
}

function Step4() {
  return (
    <div className="flex gap-8">
      {/* Left: step checklist */}
      <div className="flex-1 flex flex-col gap-3">
        {STEPS.map((step, i) => (
          <div key={i} className="flex items-center gap-3">
            <div className="w-6 h-6 rounded-full flex items-center justify-center flex-shrink-0" style={{ backgroundColor: '#22c55e' }}>
              <Check size={12} className="text-white" />
            </div>
            <span className="text-sm text-gray-700">{step.label}</span>
          </div>
        ))}
      </div>

      {/* Right: invite sent card */}
      <div className="flex-1">
        <div className="bg-white border border-gray-200 rounded-xl p-8 flex flex-col items-center text-center gap-4">
          <div className="w-16 h-16 rounded-full flex items-center justify-center" style={{ backgroundColor: '#dcfce7' }}>
            <Check size={28} style={{ color: '#22c55e' }} />
          </div>
          <div>
            <p className="text-base font-semibold text-gray-900 mb-1">Invite sent!</p>
            <p className="text-sm text-gray-500">
              An invitation email has been sent to the employee. They will be prompted to complete their profile setup.
            </p>
          </div>
        </div>
      </div>
    </div>
  )
}

export default function AddEmployee() {
  const navigate = useNavigate()
  const [currentStep, setCurrentStep] = useState(0)

  const progress = ((currentStep + 1) / STEPS.length) * 100

  const stepForms = [<Step0 />, <Step1 />, <Step2 />, <Step3 />, <Step4 />]

  function handleNext() {
    if (currentStep < STEPS.length - 1) {
      setCurrentStep((s) => s + 1)
    } else {
      navigate('/employer/employees')
    }
  }

  function handleBack() {
    if (currentStep > 0) setCurrentStep((s) => s - 1)
  }

  return (
    <div className="min-h-screen flex" style={{ backgroundColor: '#f8fafc' }}>
      {/* Left sidebar */}
      <div
        className="w-64 flex flex-col flex-shrink-0"
        style={{ backgroundColor: '#0d1b2a' }}
      >
        {/* Logo */}
        <div className="px-6 py-7 border-b border-white/10">
          <span className="text-xl font-bold text-white tracking-tight">CHAMP</span>
        </div>

        {/* Steps */}
        <nav className="flex-1 px-4 py-6 flex flex-col gap-2">
          {STEPS.map((step, i) => {
            const completed = i < currentStep
            const active = i === currentStep
            return (
              <div key={i} className="flex items-center gap-3 px-2 py-2.5 rounded-lg">
                {/* Circle */}
                <div
                  className="w-7 h-7 rounded-full flex items-center justify-center flex-shrink-0 text-xs font-semibold"
                  style={{
                    backgroundColor: completed
                      ? '#22c55e'
                      : active
                      ? '#ffffff'
                      : 'rgba(255,255,255,0.15)',
                    color: completed ? '#fff' : active ? '#111827' : '#fff',
                  }}
                >
                  {completed ? <Check size={12} /> : i + 1}
                </div>
                {/* Label */}
                <span
                  className="text-sm leading-tight"
                  style={{
                    color: active ? '#fff' : completed ? '#22c55e' : 'rgba(255,255,255,0.55)',
                    fontWeight: active ? 600 : 400,
                  }}
                >
                  {step.label}
                </span>
              </div>
            )
          })}
        </nav>

        {/* Progress bar */}
        <div className="px-6 py-5">
          <div className="flex justify-between text-xs text-white/50 mb-1.5">
            <span>Progress</span>
            <span>{Math.round(progress)}%</span>
          </div>
          <div className="h-1.5 bg-white/10 rounded-full overflow-hidden">
            <div
              className="h-full rounded-full transition-all duration-300"
              style={{ width: `${progress}%`, backgroundColor: '#22c55e' }}
            />
          </div>
        </div>
      </div>

      {/* Right form area */}
      <div className="flex-1 flex flex-col bg-white">
        {/* Form content */}
        <div className="flex-1 overflow-y-auto px-10 py-10">
          <p className="text-xs font-semibold uppercase tracking-widest mb-2" style={{ color: '#22c55e' }}>
            Step {currentStep + 1} of {STEPS.length}
          </p>
          <h1 className="text-2xl font-bold text-gray-900 mb-1">{STEPS[currentStep].label}</h1>
          <p className="text-sm text-gray-500 mb-8">{STEPS[currentStep].subtitle}</p>

          {stepForms[currentStep]}
        </div>

        {/* Bottom nav bar */}
        <div className="px-10 py-5 border-t border-gray-100 flex items-center justify-between bg-white">
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
            {currentStep === STEPS.length - 1 ? 'Continue' : 'Save and continue'}
          </button>
        </div>
      </div>
    </div>
  )
}
