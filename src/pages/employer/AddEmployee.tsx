import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { Check, ChevronDown, Upload } from 'lucide-react'
import { employees as employeesApi, departments as departmentsApi, type Department } from '../../lib/api'

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
  value,
  onChange,
}: {
  label: string
  placeholder?: string
  dropdown?: boolean
  type?: string
  value: string
  onChange: (v: string) => void
}) {
  return (
    <div className="flex flex-col gap-1.5">
      <label className="text-sm font-medium text-gray-700">{label}</label>
      <div className="relative">
        <input
          type={type}
          placeholder={placeholder ?? label}
          value={value}
          onChange={e => onChange(e.target.value)}
          className="w-full px-3 py-2.5 text-sm border border-gray-200 rounded-lg focus:outline-none focus:ring-1 focus:ring-green-400 focus:border-green-400 pr-8"
        />
        {dropdown && (
          <ChevronDown size={14} className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 pointer-events-none" />
        )}
      </div>
    </div>
  )
}

function SelectField({
  label,
  value,
  onChange,
  children,
}: {
  label: string
  value: string
  onChange: (v: string) => void
  children: React.ReactNode
}) {
  return (
    <div className="flex flex-col gap-1.5">
      <label className="text-sm font-medium text-gray-700">{label}</label>
      <select
        value={value}
        onChange={e => onChange(e.target.value)}
        className="w-full px-3 py-2.5 text-sm border border-gray-200 rounded-lg focus:outline-none focus:ring-1 focus:ring-green-400 focus:border-green-400"
      >
        {children}
      </select>
    </div>
  )
}

interface FormState {
  firstName: string; lastName: string; email: string; phone: string
  dob: string; gender: string; nationality: string
  jobTitle: string; departmentId: string; employmentType: string; startDate: string
  grossSalary: string; payFrequency: string
  notes: string
}

const empty: FormState = {
  firstName: '', lastName: '', email: '', phone: '',
  dob: '', gender: '', nationality: '',
  jobTitle: '', departmentId: '', employmentType: '', startDate: '',
  grossSalary: '', payFrequency: '',
  notes: '',
}

export default function AddEmployee() {
  const navigate = useNavigate()
  const [currentStep, setCurrentStep] = useState(0)
  const [form, setForm] = useState<FormState>(empty)
  const [depts, setDepts] = useState<Department[]>([])
  const [submitting, setSubmitting] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [done, setDone] = useState(false)

  useEffect(() => {
    departmentsApi.list().then(setDepts).catch(() => {})
  }, [])

  const set = (key: keyof FormState) => (v: string) => setForm(f => ({ ...f, [key]: v }))

  const progress = ((currentStep + 1) / STEPS.length) * 100

  async function handleNext() {
    if (currentStep === 3) {
      // submit to API before moving to review step
      setSubmitting(true)
      setError(null)
      try {
        const empNum = `EMP-${Date.now().toString(36).toUpperCase()}`
        await employeesApi.create({
          email: form.email,
          fullName: `${form.firstName} ${form.lastName}`.trim(),
          jobTitle: form.jobTitle || undefined,
          departmentId: form.departmentId || undefined,
          employeeNumber: empNum,
          employmentType: form.employmentType || undefined,
          grossSalary: form.grossSalary ? parseFloat(form.grossSalary) : undefined,
          startDate: form.startDate || undefined,
          payFrequency: form.payFrequency || undefined,
        })
        setDone(true)
        setCurrentStep(4)
      } catch (err: unknown) {
        setError(err instanceof Error ? err.message : 'Failed to create employee')
      } finally {
        setSubmitting(false)
      }
      return
    }
    if (currentStep < STEPS.length - 1) {
      setCurrentStep(s => s + 1)
    } else {
      navigate('/employer/employees')
    }
  }

  function handleBack() {
    if (currentStep > 0) setCurrentStep(s => s - 1)
  }

  const stepForms = [
    // Step 0
    <div className="flex flex-col gap-5">
      <div className="grid grid-cols-2 gap-4">
        <InputField label="First name" placeholder="First name" value={form.firstName} onChange={set('firstName')} />
        <InputField label="Last name" placeholder="Last name" value={form.lastName} onChange={set('lastName')} />
      </div>
      <InputField label="Email" placeholder="email@company.com" type="email" value={form.email} onChange={set('email')} />
      <InputField label="Phone number" placeholder="+1 000 000 0000" type="tel" value={form.phone} onChange={set('phone')} />
      <InputField label="Date of birth" type="date" value={form.dob} onChange={set('dob')} />
      <SelectField label="Gender" value={form.gender} onChange={set('gender')}>
        <option value="">Select gender</option>
        <option>Male</option>
        <option>Female</option>
        <option>Non-binary</option>
        <option>Prefer not to say</option>
      </SelectField>
      <InputField label="Nationality" placeholder="e.g. British" value={form.nationality} onChange={set('nationality')} />
    </div>,

    // Step 1
    <div className="flex flex-col gap-5">
      <div className="grid grid-cols-2 gap-4">
        <InputField label="Job title" placeholder="e.g. Software Engineer" value={form.jobTitle} onChange={set('jobTitle')} />
        <SelectField label="Department" value={form.departmentId} onChange={set('departmentId')}>
          <option value="">Select department</option>
          {depts.map(d => <option key={d.id} value={d.id}>{d.name}</option>)}
        </SelectField>
      </div>
      <SelectField label="Employment type" value={form.employmentType} onChange={set('employmentType')}>
        <option value="">Select type</option>
        <option value="full_time">Full time</option>
        <option value="part_time">Part time</option>
        <option value="contractor">Contractor</option>
        <option value="intern">Intern</option>
      </SelectField>
      <InputField label="Start date" type="date" value={form.startDate} onChange={set('startDate')} />
    </div>,

    // Step 2
    <div className="flex flex-col gap-5">
      <InputField label="Monthly salary" placeholder="0.00" type="number" value={form.grossSalary} onChange={set('grossSalary')} />
      <SelectField label="Pay schedule" value={form.payFrequency} onChange={set('payFrequency')}>
        <option value="">Select schedule</option>
        <option value="monthly">Monthly</option>
        <option value="biweekly">Bi-weekly</option>
        <option value="weekly">Weekly</option>
      </SelectField>
    </div>,

    // Step 3
    <div className="flex flex-col gap-5">
      <div className="flex flex-col gap-1.5">
        <label className="text-sm font-medium text-gray-700">Additional notes</label>
        <textarea
          rows={3}
          placeholder="Add any additional notes..."
          value={form.notes}
          onChange={e => set('notes')(e.target.value)}
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
    </div>,

    // Step 4 — review
    <div className="flex gap-8">
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
      <div className="flex-1">
        {done ? (
          <div className="bg-white border border-gray-200 rounded-xl p-8 flex flex-col items-center text-center gap-4">
            <div className="w-16 h-16 rounded-full flex items-center justify-center" style={{ backgroundColor: '#dcfce7' }}>
              <Check size={28} style={{ color: '#22c55e' }} />
            </div>
            <div>
              <p className="text-base font-semibold text-gray-900 mb-1">Invite sent!</p>
              <p className="text-sm text-gray-500">
                An invitation email has been sent to <strong>{form.email}</strong>. They will be prompted to complete their profile setup.
              </p>
            </div>
          </div>
        ) : (
          <div className="bg-white border border-gray-200 rounded-xl p-8 flex flex-col items-center text-center gap-4">
            <p className="text-sm text-gray-500">Preparing invite...</p>
          </div>
        )}
      </div>
    </div>,
  ]

  return (
    <div className="min-h-screen flex" style={{ backgroundColor: '#f8fafc' }}>
      {/* Left sidebar */}
      <div className="w-64 flex flex-col flex-shrink-0" style={{ backgroundColor: '#0d1b2a' }}>
        <div className="px-6 py-7 border-b border-white/10">
          <span className="text-xl font-bold text-white tracking-tight">CHAMP</span>
        </div>
        <nav className="flex-1 px-4 py-6 flex flex-col gap-2">
          {STEPS.map((step, i) => {
            const completed = i < currentStep
            const active = i === currentStep
            return (
              <div key={i} className="flex items-center gap-3 px-2 py-2.5 rounded-lg">
                <div
                  className="w-7 h-7 rounded-full flex items-center justify-center flex-shrink-0 text-xs font-semibold"
                  style={{
                    backgroundColor: completed ? '#22c55e' : active ? '#ffffff' : 'rgba(255,255,255,0.15)',
                    color: completed ? '#fff' : active ? '#111827' : '#fff',
                  }}
                >
                  {completed ? <Check size={12} /> : i + 1}
                </div>
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
        <div className="flex-1 overflow-y-auto px-10 py-10">
          <p className="text-xs font-semibold uppercase tracking-widest mb-2" style={{ color: '#22c55e' }}>
            Step {currentStep + 1} of {STEPS.length}
          </p>
          <h1 className="text-2xl font-bold text-gray-900 mb-1">{STEPS[currentStep].label}</h1>
          <p className="text-sm text-gray-500 mb-8">{STEPS[currentStep].subtitle}</p>

          {error && (
            <div className="mb-5 px-4 py-3 bg-red-50 text-red-700 text-sm rounded-lg">{error}</div>
          )}

          {stepForms[currentStep]}
        </div>

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
            disabled={submitting}
            className="px-5 py-2 text-sm font-medium text-white rounded-lg transition-colors disabled:opacity-50"
            style={{ backgroundColor: '#22c55e' }}
          >
            {submitting ? 'Creating...' : currentStep === STEPS.length - 1 ? 'Continue' : 'Save and continue'}
          </button>
        </div>
      </div>
    </div>
  )
}
