import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { Check, ChevronDown } from 'lucide-react'

const steps = [
  { label: 'Company profile info',          sub: 'Tell us about your company'          },
  { label: 'Compliance information',         sub: 'Legal & regulatory details'          },
  { label: 'Compliance information',         sub: 'Additional compliance info'          },
  { label: 'Payroll setup',                  sub: 'Configure your payroll'              },
  { label: 'Payment setup',                  sub: 'Set up payment methods'              },
  { label: 'Invite team',                    sub: 'Add your team members'               },
  { label: 'Setup complete',                 sub: 'You are ready to go!'                },
]

function InputField({ label, placeholder, hasDropdown = false }: { label: string; placeholder?: string; hasDropdown?: boolean }) {
  return (
    <div>
      <label className="block text-xs font-medium text-gray-600 mb-1.5">{label}</label>
      <div className="relative">
        <input
          type="text"
          placeholder={placeholder}
          className="w-full px-3 py-2.5 text-sm border border-gray-200 rounded-lg focus:outline-none focus:border-[#22c55e]"
        />
        {hasDropdown && (
          <ChevronDown size={14} className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 pointer-events-none" />
        )}
      </div>
    </div>
  )
}

function StepContent({ step }: { step: number }) {
  if (step === 0) return (
    <div className="space-y-4">
      <div className="grid grid-cols-2 gap-4">
        <InputField label="Company name" placeholder="Enter company name" />
        <InputField label="Country / State" placeholder="Select country" hasDropdown />
      </div>
      <div className="grid grid-cols-2 gap-4">
        <InputField label="Business size" placeholder="Select size" hasDropdown />
        <InputField label="Industry" placeholder="Select industry" hasDropdown />
      </div>
      <div className="grid grid-cols-2 gap-4">
        <InputField label="Timezone" placeholder="Select timezone" hasDropdown />
        <InputField label="Currency" placeholder="Select currency" hasDropdown />
      </div>
      <InputField label="Registered office address" placeholder="Enter registered address" />
      <InputField label="Website address" placeholder="https://" />
    </div>
  )

  if (step === 1) return (
    <div className="space-y-4">
      <InputField label="Company registration number" placeholder="Enter registration number" />
      <InputField label="Tax identification number" placeholder="Enter tax ID" />
      <div className="grid grid-cols-2 gap-4">
        <InputField label="Company type" placeholder="Select type" hasDropdown />
        <InputField label="Date of incorporation" placeholder="DD / MM / YYYY" hasDropdown />
      </div>
      <InputField label="Registered with HMRC?" placeholder="Yes / No" hasDropdown />
      <InputField label="PAYE reference number" placeholder="Enter PAYE reference" />
    </div>
  )

  if (step === 2) return (
    <div className="space-y-4">
      <InputField label="National insurance number" placeholder="Enter NI number" />
      <InputField label="VAT registration number" placeholder="Enter VAT number" />
      <InputField label="Pension provider" placeholder="Select provider" hasDropdown />
      <InputField label="Auto-enrolment staging date" placeholder="DD / MM / YYYY" hasDropdown />
      <InputField label="Data protection officer" placeholder="Enter name or N/A" />
    </div>
  )

  if (step === 3) return (
    <div className="space-y-4">
      <div className="grid grid-cols-2 gap-4">
        <InputField label="Pay frequency" placeholder="Monthly / Weekly" hasDropdown />
        <InputField label="Pay day" placeholder="Select day" hasDropdown />
      </div>
      <InputField label="Payroll start date" placeholder="DD / MM / YYYY" hasDropdown />
      <InputField label="Base currency" placeholder="GBP / USD" hasDropdown />
      <InputField label="Overtime policy" placeholder="Select policy" hasDropdown />
      <InputField label="Default working hours" placeholder="e.g. 40 hours/week" />
    </div>
  )

  if (step === 4) return (
    <div className="space-y-4">
      <InputField label="Bank name" placeholder="Enter bank name" />
      <InputField label="Account name" placeholder="Enter account name" />
      <InputField label="Account number" placeholder="Enter account number" />
      <InputField label="Sort code" placeholder="XX-XX-XX" />
      <InputField label="Payment method" placeholder="BACS / CHAPS" hasDropdown />
    </div>
  )

  if (step === 5) return (
    <div className="space-y-4">
      <p className="text-sm text-gray-500 mb-4">
        Invite your team members via CSV or email. They'll receive a welcome email with setup instructions.
      </p>
      <div className="border-2 border-dashed border-gray-200 rounded-xl p-8 text-center">
        <p className="text-sm font-medium text-gray-700 mb-1">Upload CSV file</p>
        <p className="text-xs text-gray-400 mb-4">Drag & drop or click to browse</p>
        <button className="text-xs bg-gray-100 hover:bg-gray-200 text-gray-700 px-4 py-2 rounded-lg transition-colors">
          Browse files
        </button>
      </div>
      <div className="text-center text-gray-400 text-xs">— or invite by email —</div>
      <InputField label="Email address" placeholder="colleague@company.com" />
      <button className="w-full border border-[#22c55e] text-[#22c55e] text-sm font-medium py-2.5 rounded-lg hover:bg-green-50 transition-colors">
        + Add another
      </button>
    </div>
  )

  // Step 6 — success
  return (
    <div className="text-center py-8">
      <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
        <Check size={28} className="text-[#22c55e]" />
      </div>
      <h3 className="text-xl font-bold text-gray-900 mb-2">You're all set!</h3>
      <p className="text-sm text-gray-500 max-w-xs mx-auto">
        Your CHAMP workspace is ready. You can now start managing your team, payroll, and benefits.
      </p>
    </div>
  )
}

export default function Onboarding() {
  const [currentStep, setCurrentStep] = useState(0)
  const navigate = useNavigate()

  const isLast = currentStep === steps.length - 1

  function handleNext() {
    if (isLast) {
      navigate('/employer')
    } else {
      setCurrentStep(s => s + 1)
    }
  }

  return (
    <div className="min-h-screen flex bg-white">
      {/* Left — step sidebar */}
      <div className="w-72 flex-shrink-0 bg-[#0d1b2a] flex flex-col">
        {/* Logo */}
        <div className="px-8 pt-10 pb-8">
          <span className="text-2xl font-bold text-white tracking-widest">CHAMP</span>
        </div>

        {/* Steps */}
        <div className="px-6 flex-1 overflow-y-auto">
          <p className="text-xs font-medium text-white/40 uppercase tracking-widest mb-6">Setup steps</p>
          <div className="space-y-1">
            {steps.map((step, i) => {
              const done = i < currentStep
              const active = i === currentStep
              return (
                <button
                  key={i}
                  onClick={() => i <= currentStep && setCurrentStep(i)}
                  className={`w-full flex items-center gap-3 px-3 py-3 rounded-xl text-left transition-colors ${
                    active ? 'bg-white/10' : done ? 'hover:bg-white/5' : 'opacity-50'
                  }`}
                >
                  {/* Circle */}
                  <div className={`w-7 h-7 rounded-full flex items-center justify-center flex-shrink-0 text-xs font-bold transition-colors ${
                    done ? 'bg-[#22c55e]' : active ? 'bg-white text-gray-900' : 'bg-white/20 text-white'
                  }`}>
                    {done ? <Check size={13} className="text-white" /> : i + 1}
                  </div>
                  <div>
                    <p className={`text-sm font-medium leading-tight ${active ? 'text-white' : 'text-white/70'}`}>
                      {step.label}
                    </p>
                    <p className="text-[10px] text-white/40 mt-0.5">{step.sub}</p>
                  </div>
                </button>
              )
            })}
          </div>
        </div>

        {/* Progress */}
        <div className="px-8 py-6">
          <div className="flex items-center justify-between mb-2">
            <p className="text-xs text-white/50">Progress</p>
            <p className="text-xs text-white/70 font-medium">{currentStep + 1} / {steps.length}</p>
          </div>
          <div className="h-1.5 bg-white/10 rounded-full overflow-hidden">
            <div
              className="h-full bg-[#22c55e] rounded-full transition-all duration-300"
              style={{ width: `${((currentStep + 1) / steps.length) * 100}%` }}
            />
          </div>
        </div>
      </div>

      {/* Right — form content */}
      <div className="flex-1 flex flex-col overflow-y-auto">
        <div className="flex-1 px-12 py-10 max-w-2xl">
          {/* Step header */}
          <div className="mb-8">
            <p className="text-xs font-medium text-[#22c55e] uppercase tracking-widest mb-1">
              Step {currentStep + 1} of {steps.length}
            </p>
            <h1 className="text-2xl font-bold text-gray-900">{steps[currentStep].label}</h1>
            <p className="text-sm text-gray-500 mt-1">{steps[currentStep].sub}</p>
          </div>

          {/* Form */}
          <StepContent step={currentStep} />
        </div>

        {/* Bottom nav */}
        <div className="border-t border-gray-100 px-12 py-5 flex items-center justify-between">
          <button
            onClick={() => currentStep > 0 && setCurrentStep(s => s - 1)}
            disabled={currentStep === 0}
            className="flex items-center gap-1.5 text-sm text-gray-500 hover:text-gray-700 disabled:opacity-30 disabled:cursor-not-allowed"
          >
            ← Back
          </button>
          <button
            onClick={handleNext}
            className="bg-[#22c55e] hover:bg-green-600 text-white font-semibold px-8 py-2.5 rounded-xl transition-colors text-sm"
          >
            {isLast ? 'Go to dashboard' : 'Save and continue'}
          </button>
        </div>
      </div>
    </div>
  )
}
