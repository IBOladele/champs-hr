import { useState, useEffect, useCallback } from 'react'
import { useNavigate } from 'react-router-dom'
import { Check, ChevronDown, Mail, RefreshCw, Loader2 } from 'lucide-react'
import { useAuth } from '../../context/AuthContext'
import { auth, onboarding } from '../../lib/api'
import { Logo } from '../../components/Logo'
import { usePageTitle } from '../../hooks/usePageTitle'

// ── Shared field components ───────────────────────────────────────────────────

function Field({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <div>
      <label className="block text-xs font-medium text-gray-600 mb-1.5">{label}</label>
      {children}
    </div>
  )
}

function Input({
  value, onChange, placeholder, type = 'text',
}: { value: string; onChange: (v: string) => void; placeholder?: string; type?: string }) {
  return (
    <input
      type={type}
      value={value}
      onChange={(e) => onChange(e.target.value)}
      placeholder={placeholder}
      className="w-full px-3 py-2.5 text-sm border border-gray-200 rounded-lg
                 focus:outline-none focus:border-[#22c55e] bg-white"
    />
  )
}

function Select({
  value, onChange, placeholder, options,
}: { value: string; onChange: (v: string) => void; placeholder?: string; options: { value: string; label: string }[] }) {
  return (
    <div className="relative">
      <select
        value={value}
        onChange={(e) => onChange(e.target.value)}
        className={`w-full px-3 py-2.5 text-sm border border-gray-200 rounded-lg appearance-none
                    focus:outline-none focus:border-[#22c55e] bg-white
                    ${!value ? 'text-gray-400' : 'text-gray-900'}`}
      >
        <option value="" disabled>{placeholder}</option>
        {options.map((o) => (
          <option key={o.value} value={o.value}>{o.label}</option>
        ))}
      </select>
      <ChevronDown size={14} className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 pointer-events-none" />
    </div>
  )
}

// ── Step 0: Company profile ───────────────────────────────────────────────────

interface Step0Data {
  companyName: string; country: string; businessSize: string; industry: string
  timezone: string; currency: string; address: string; website: string
}

const BUSINESS_SIZES = [
  { value: '1-10', label: '1–10 employees' },
  { value: '11-50', label: '11–50 employees' },
  { value: '51-200', label: '51–200 employees' },
  { value: '201-500', label: '201–500 employees' },
  { value: '500+', label: '500+ employees' },
]

const INDUSTRIES = [
  { value: 'technology', label: 'Technology' },
  { value: 'finance', label: 'Finance & Banking' },
  { value: 'healthcare', label: 'Healthcare' },
  { value: 'retail', label: 'Retail & E-commerce' },
  { value: 'manufacturing', label: 'Manufacturing' },
  { value: 'education', label: 'Education' },
  { value: 'construction', label: 'Construction' },
  { value: 'hospitality', label: 'Hospitality & Tourism' },
  { value: 'logistics', label: 'Logistics & Transport' },
  { value: 'professional_services', label: 'Professional Services' },
  { value: 'other', label: 'Other' },
]

const TIMEZONES = [
  { value: 'Europe/London', label: 'London (GMT/BST)' },
  { value: 'America/New_York', label: 'New York (ET)' },
  { value: 'America/Chicago', label: 'Chicago (CT)' },
  { value: 'America/Denver', label: 'Denver (MT)' },
  { value: 'America/Los_Angeles', label: 'Los Angeles (PT)' },
  { value: 'Europe/Paris', label: 'Paris (CET)' },
  { value: 'Asia/Lagos', label: 'Lagos (WAT)' },
  { value: 'Africa/Nairobi', label: 'Nairobi (EAT)' },
  { value: 'Asia/Dubai', label: 'Dubai (GST)' },
  { value: 'Asia/Singapore', label: 'Singapore (SGT)' },
]

const CURRENCIES = [
  { value: 'GBP', label: 'GBP – British Pound' },
  { value: 'USD', label: 'USD – US Dollar' },
  { value: 'EUR', label: 'EUR – Euro' },
  { value: 'NGN', label: 'NGN – Nigerian Naira' },
  { value: 'KES', label: 'KES – Kenyan Shilling' },
  { value: 'CAD', label: 'CAD – Canadian Dollar' },
  { value: 'AUD', label: 'AUD – Australian Dollar' },
  { value: 'AED', label: 'AED – UAE Dirham' },
]

function Step0({ data, set }: { data: Step0Data; set: (d: Step0Data) => void }) {
  const f = <K extends keyof Step0Data>(k: K) => (v: string) => set({ ...data, [k]: v })
  return (
    <div className="space-y-4">
      <div className="grid grid-cols-2 gap-4">
        <Field label="Company name">
          <Input value={data.companyName} onChange={f('companyName')} placeholder="Enter company name" />
        </Field>
        <Field label="Country">
          <Input value={data.country} onChange={f('country')} placeholder="e.g. United Kingdom" />
        </Field>
      </div>
      <div className="grid grid-cols-2 gap-4">
        <Field label="Business size">
          <Select value={data.businessSize} onChange={f('businessSize')} placeholder="Select size" options={BUSINESS_SIZES} />
        </Field>
        <Field label="Industry">
          <Select value={data.industry} onChange={f('industry')} placeholder="Select industry" options={INDUSTRIES} />
        </Field>
      </div>
      <div className="grid grid-cols-2 gap-4">
        <Field label="Timezone">
          <Select value={data.timezone} onChange={f('timezone')} placeholder="Select timezone" options={TIMEZONES} />
        </Field>
        <Field label="Currency">
          <Select value={data.currency} onChange={f('currency')} placeholder="Select currency" options={CURRENCIES} />
        </Field>
      </div>
      <Field label="Registered office address">
        <Input value={data.address} onChange={f('address')} placeholder="Enter registered address" />
      </Field>
      <Field label="Website address">
        <Input value={data.website} onChange={f('website')} placeholder="https://" type="url" />
      </Field>
    </div>
  )
}

// ── Step 1: Compliance ────────────────────────────────────────────────────────

interface Step1Data {
  registrationNumber: string; taxId: string; companyType: string
  incorporationDate: string; hmrcRegistered: string; payeReference: string
}

const COMPANY_TYPES = [
  { value: 'ltd', label: 'Limited Company (Ltd)' },
  { value: 'plc', label: 'Public Limited Company (PLC)' },
  { value: 'llp', label: 'Limited Liability Partnership (LLP)' },
  { value: 'sole_trader', label: 'Sole Trader' },
  { value: 'partnership', label: 'Partnership' },
  { value: 'charity', label: 'Charity / Non-profit' },
  { value: 'other', label: 'Other' },
]

function Step1({ data, set }: { data: Step1Data; set: (d: Step1Data) => void }) {
  const f = <K extends keyof Step1Data>(k: K) => (v: string) => set({ ...data, [k]: v })
  return (
    <div className="space-y-4">
      <Field label="Company registration number">
        <Input value={data.registrationNumber} onChange={f('registrationNumber')} placeholder="Enter registration number" />
      </Field>
      <Field label="Tax identification number">
        <Input value={data.taxId} onChange={f('taxId')} placeholder="Enter tax ID" />
      </Field>
      <div className="grid grid-cols-2 gap-4">
        <Field label="Company type">
          <Select value={data.companyType} onChange={f('companyType')} placeholder="Select type" options={COMPANY_TYPES} />
        </Field>
        <Field label="Date of incorporation">
          <Input value={data.incorporationDate} onChange={f('incorporationDate')} placeholder="YYYY-MM-DD" type="date" />
        </Field>
      </div>
      <Field label="Registered with HMRC?">
        <Select
          value={data.hmrcRegistered}
          onChange={f('hmrcRegistered')}
          placeholder="Select"
          options={[{ value: 'yes', label: 'Yes' }, { value: 'no', label: 'No' }, { value: 'pending', label: 'Pending' }]}
        />
      </Field>
      <Field label="PAYE reference number">
        <Input value={data.payeReference} onChange={f('payeReference')} placeholder="Enter PAYE reference" />
      </Field>
    </div>
  )
}

// ── Step 2: Compliance (2) ────────────────────────────────────────────────────

interface Step2Data {
  niNumber: string; vatNumber: string; pensionProvider: string
  autoEnrolmentDate: string; dataProtectionOfficer: string
}

const PENSION_PROVIDERS = [
  { value: 'nest', label: 'NEST' },
  { value: 'peoples_pension', label: "The People's Pension" },
  { value: 'now_pensions', label: 'NOW: Pensions' },
  { value: 'aviva', label: 'Aviva' },
  { value: 'standard_life', label: 'Standard Life' },
  { value: 'legal_general', label: 'Legal & General' },
  { value: 'other', label: 'Other' },
  { value: 'none', label: 'Not applicable' },
]

function Step2({ data, set }: { data: Step2Data; set: (d: Step2Data) => void }) {
  const f = <K extends keyof Step2Data>(k: K) => (v: string) => set({ ...data, [k]: v })
  return (
    <div className="space-y-4">
      <Field label="National insurance number">
        <Input value={data.niNumber} onChange={f('niNumber')} placeholder="Enter NI number" />
      </Field>
      <Field label="VAT registration number">
        <Input value={data.vatNumber} onChange={f('vatNumber')} placeholder="Enter VAT number" />
      </Field>
      <Field label="Pension provider">
        <Select value={data.pensionProvider} onChange={f('pensionProvider')} placeholder="Select provider" options={PENSION_PROVIDERS} />
      </Field>
      <Field label="Auto-enrolment staging date">
        <Input value={data.autoEnrolmentDate} onChange={f('autoEnrolmentDate')} placeholder="YYYY-MM-DD" type="date" />
      </Field>
      <Field label="Data protection officer">
        <Input value={data.dataProtectionOfficer} onChange={f('dataProtectionOfficer')} placeholder="Enter name or N/A" />
      </Field>
    </div>
  )
}

// ── Step 3: Payroll setup ─────────────────────────────────────────────────────

interface Step3Data {
  payFrequency: string; payDay: string; payrollStart: string
  baseCurrency: string; overtimePolicy: string; workingHours: string
}

const PAY_FREQUENCIES = [
  { value: 'weekly', label: 'Weekly' },
  { value: 'biweekly', label: 'Bi-weekly (every 2 weeks)' },
  { value: 'semimonthly', label: 'Semi-monthly (1st & 15th)' },
  { value: 'monthly', label: 'Monthly' },
]

const OVERTIME_POLICIES = [
  { value: 'time_and_half', label: '1.5× rate (time and a half)' },
  { value: 'double_time', label: '2× rate (double time)' },
  { value: 'toil', label: 'Time off in lieu (TOIL)' },
  { value: 'none', label: 'No overtime policy' },
]

function Step3({ data, set }: { data: Step3Data; set: (d: Step3Data) => void }) {
  const f = <K extends keyof Step3Data>(k: K) => (v: string) => set({ ...data, [k]: v })
  return (
    <div className="space-y-4">
      <div className="grid grid-cols-2 gap-4">
        <Field label="Pay frequency">
          <Select value={data.payFrequency} onChange={f('payFrequency')} placeholder="Select frequency" options={PAY_FREQUENCIES} />
        </Field>
        <Field label="Pay day">
          <Input value={data.payDay} onChange={f('payDay')} placeholder="e.g. Last working day" />
        </Field>
      </div>
      <Field label="Payroll start date">
        <Input value={data.payrollStart} onChange={f('payrollStart')} placeholder="YYYY-MM-DD" type="date" />
      </Field>
      <Field label="Base currency">
        <Select value={data.baseCurrency} onChange={f('baseCurrency')} placeholder="Select currency" options={CURRENCIES} />
      </Field>
      <Field label="Overtime policy">
        <Select value={data.overtimePolicy} onChange={f('overtimePolicy')} placeholder="Select policy" options={OVERTIME_POLICIES} />
      </Field>
      <Field label="Default working hours per week">
        <Input value={data.workingHours} onChange={f('workingHours')} placeholder="e.g. 40" />
      </Field>
    </div>
  )
}

// ── Step 4: Payment setup ─────────────────────────────────────────────────────

interface Step4Data {
  bankName: string; accountName: string; accountNumber: string
  sortCode: string; paymentMethod: string
}

const PAYMENT_METHODS = [
  { value: 'bacs', label: 'BACS (UK bank transfer)' },
  { value: 'chaps', label: 'CHAPS (same-day UK transfer)' },
  { value: 'faster_payments', label: 'Faster Payments' },
  { value: 'ach', label: 'ACH (US)' },
  { value: 'wire', label: 'Wire transfer' },
]

function Step4({ data, set }: { data: Step4Data; set: (d: Step4Data) => void }) {
  const f = <K extends keyof Step4Data>(k: K) => (v: string) => set({ ...data, [k]: v })
  return (
    <div className="space-y-4">
      <Field label="Bank name">
        <Input value={data.bankName} onChange={f('bankName')} placeholder="Enter bank name" />
      </Field>
      <Field label="Account name">
        <Input value={data.accountName} onChange={f('accountName')} placeholder="Enter account name" />
      </Field>
      <Field label="Account number">
        <Input value={data.accountNumber} onChange={f('accountNumber')} placeholder="Enter account number" />
      </Field>
      <Field label="Sort code">
        <Input value={data.sortCode} onChange={f('sortCode')} placeholder="XX-XX-XX" />
      </Field>
      <Field label="Payment method">
        <Select value={data.paymentMethod} onChange={f('paymentMethod')} placeholder="Select method" options={PAYMENT_METHODS} />
      </Field>
    </div>
  )
}

// ── Step 5: Invite team ───────────────────────────────────────────────────────

function Step5({
  emails, setEmails, inviteResult,
}: {
  emails: string[]
  setEmails: (e: string[]) => void
  inviteResult: { sent: string[]; skipped: string[] } | null
}) {
  function updateEmail(i: number, val: string) {
    const next = [...emails]
    next[i] = val
    setEmails(next)
  }

  function addRow() { setEmails([...emails, '']) }
  function removeRow(i: number) { setEmails(emails.filter((_, idx) => idx !== i)) }

  return (
    <div className="space-y-4">
      <p className="text-sm text-gray-500">
        Invite team members by email. They'll receive a setup link to create their account.
        You can skip this step and invite them from the dashboard later.
      </p>

      {emails.map((email, i) => (
        <div key={i} className="flex gap-2">
          <div className="flex-1">
            <Input
              value={email}
              onChange={(v) => updateEmail(i, v)}
              placeholder={`colleague${i + 1}@company.com`}
              type="email"
            />
          </div>
          {emails.length > 1 && (
            <button
              onClick={() => removeRow(i)}
              className="text-gray-400 hover:text-red-500 px-2 transition-colors"
              type="button"
            >
              ✕
            </button>
          )}
        </div>
      ))}

      <button
        onClick={addRow}
        type="button"
        className="w-full border border-dashed border-[#22c55e] text-[#22c55e] text-sm
                   font-medium py-2.5 rounded-lg hover:bg-green-50 transition-colors"
      >
        + Add another
      </button>

      {inviteResult && (
        <div className="bg-green-50 border border-green-200 rounded-lg p-3 text-sm text-green-800">
          {inviteResult.sent.length > 0 && (
            <p>Invites sent to: {inviteResult.sent.join(', ')}</p>
          )}
          {inviteResult.skipped.length > 0 && (
            <p className="text-amber-700 mt-1">Already exists: {inviteResult.skipped.join(', ')}</p>
          )}
        </div>
      )}
    </div>
  )
}

// ── Email verification banner ─────────────────────────────────────────────────

function EmailVerificationBanner() {
  const { user } = useAuth()
  const [sending, setSending] = useState(false)
  const [sent, setSent] = useState(false)
  const [error, setError] = useState('')

  if (!user || user.emailVerified) return null

  async function handleResend() {
    setSending(true)
    setError('')
    try {
      await auth.resendVerification()
      setSent(true)
      setTimeout(() => setSent(false), 30_000)
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : 'Failed to resend')
    } finally {
      setSending(false)
    }
  }

  return (
    <div className="bg-amber-50 border-b border-amber-200 px-12 py-3 flex items-center gap-3">
      <Mail size={16} className="text-amber-600 flex-shrink-0" />
      <p className="text-sm text-amber-800 flex-1">
        Please verify your email address. We sent a link to <strong>{user.email}</strong>.
      </p>
      {error && <p className="text-xs text-red-600">{error}</p>}
      <button
        onClick={handleResend}
        disabled={sending || sent}
        className="flex items-center gap-1.5 text-xs font-medium text-amber-700
                   hover:text-amber-900 disabled:opacity-50 whitespace-nowrap"
      >
        <RefreshCw size={12} className={sending ? 'animate-spin' : ''} />
        {sent ? 'Email sent!' : sending ? 'Sending…' : 'Resend email'}
      </button>
    </div>
  )
}

// ── Steps metadata ────────────────────────────────────────────────────────────

const STEPS = [
  { label: 'Company profile',       sub: 'Tell us about your company'      },
  { label: 'Compliance (1)',         sub: 'Legal & regulatory details'       },
  { label: 'Compliance (2)',         sub: 'Additional compliance info'       },
  { label: 'Payroll setup',          sub: 'Configure your payroll'           },
  { label: 'Payment setup',          sub: 'Set up payment methods'           },
  { label: 'Invite team',            sub: 'Add your team members'            },
  { label: 'Setup complete',         sub: 'You are ready to go!'             },
]

// ── Main Onboarding component ─────────────────────────────────────────────────

export default function Onboarding() {
  usePageTitle('Set up your workspace')

  const navigate = useNavigate()

  const [currentStep, setCurrentStep] = useState(0)
  const [saving, setSaving] = useState(false)
  const [error, setError] = useState('')
  const [initialising, setInitialising] = useState(true)

  // Step data states
  const [step0, setStep0] = useState<Step0Data>({
    companyName: '', country: '', businessSize: '', industry: '',
    timezone: '', currency: '', address: '', website: '',
  })
  const [step1, setStep1] = useState<Step1Data>({
    registrationNumber: '', taxId: '', companyType: '',
    incorporationDate: '', hmrcRegistered: '', payeReference: '',
  })
  const [step2, setStep2] = useState<Step2Data>({
    niNumber: '', vatNumber: '', pensionProvider: '',
    autoEnrolmentDate: '', dataProtectionOfficer: '',
  })
  const [step3, setStep3] = useState<Step3Data>({
    payFrequency: '', payDay: '', payrollStart: '',
    baseCurrency: '', overtimePolicy: '', workingHours: '',
  })
  const [step4, setStep4] = useState<Step4Data>({
    bankName: '', accountName: '', accountNumber: '', sortCode: '', paymentMethod: '',
  })
  const [inviteEmails, setInviteEmails] = useState<string[]>([''])
  const [inviteResult, setInviteResult] = useState<{ sent: string[]; skipped: string[] } | null>(null)

  // Load saved progress on mount
  useEffect(() => {
    onboarding.get()
      .then(({ step, settings }) => {
        setCurrentStep(step)
        const s = settings as Record<string, string>
        if (step > 0) {
          setStep0({ companyName: s.companyName ?? '', country: s.country ?? '', businessSize: s.businessSize ?? '', industry: s.industry ?? '', timezone: s.timezone ?? '', currency: s.currency ?? '', address: s.address ?? '', website: s.website ?? '' })
        }
        if (step > 1) {
          setStep1({ registrationNumber: s.registrationNumber ?? '', taxId: s.taxId ?? '', companyType: s.companyType ?? '', incorporationDate: s.incorporationDate ?? '', hmrcRegistered: s.hmrcRegistered ?? '', payeReference: s.payeReference ?? '' })
        }
        if (step > 2) {
          setStep2({ niNumber: s.niNumber ?? '', vatNumber: s.vatNumber ?? '', pensionProvider: s.pensionProvider ?? '', autoEnrolmentDate: s.autoEnrolmentDate ?? '', dataProtectionOfficer: s.dataProtectionOfficer ?? '' })
        }
        if (step > 3) {
          setStep3({ payFrequency: s.payFrequency ?? '', payDay: s.payDay ?? '', payrollStart: s.payrollStart ?? '', baseCurrency: s.baseCurrency ?? '', overtimePolicy: s.overtimePolicy ?? '', workingHours: s.workingHours ?? '' })
        }
        if (step > 4) {
          setStep4({ bankName: s.bankName ?? '', accountName: s.accountName ?? '', accountNumber: s.accountNumber ?? '', sortCode: s.sortCode ?? '', paymentMethod: s.paymentMethod ?? '' })
        }
      })
      .catch(() => {}) // non-fatal — user starts fresh
      .finally(() => setInitialising(false))
  }, [])

  const getStepData = useCallback((): Record<string, string> => {
    switch (currentStep) {
      case 0: return step0 as unknown as Record<string, string>
      case 1: return step1 as unknown as Record<string, string>
      case 2: return step2 as unknown as Record<string, string>
      case 3: return step3 as unknown as Record<string, string>
      case 4: return step4 as unknown as Record<string, string>
      default: return {}
    }
  }, [currentStep, step0, step1, step2, step3, step4])

  async function handleNext() {
    setError('')

    // Final step — just navigate
    if (currentStep === 6) { navigate('/employer'); return }

    // Success screen — complete onboarding
    if (currentStep === 5) {
      setSaving(true)
      try {
        const filled = inviteEmails.filter((e) => e.trim())
        if (filled.length > 0) {
          const result = await onboarding.invite(filled)
          setInviteResult(result)
          await new Promise((r) => setTimeout(r, 1200)) // brief pause to show result
        }
        await onboarding.complete()
        setCurrentStep(6)
      } catch (err: unknown) {
        setError(err instanceof Error ? err.message : 'Failed to save')
      } finally {
        setSaving(false)
      }
      return
    }

    // Steps 0–4 — save data then advance
    setSaving(true)
    try {
      await onboarding.saveStep(currentStep, getStepData())
      setCurrentStep((s) => s + 1)
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : 'Failed to save')
    } finally {
      setSaving(false)
    }
  }

  const isLast = currentStep === STEPS.length - 1

  if (initialising) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-white">
        <Loader2 size={28} className="animate-spin text-[#22c55e]" />
      </div>
    )
  }

  return (
    <div className="min-h-screen flex bg-white">
      {/* Left — step sidebar */}
      <div className="w-72 flex-shrink-0 bg-[#0d1b2a] flex flex-col">
        <div className="px-8 pt-10 pb-8">
          <Logo theme="dark" size={28} />
        </div>

        <div className="px-6 flex-1 overflow-y-auto">
          <p className="text-xs font-medium text-white/40 uppercase tracking-widest mb-6">Setup steps</p>
          <div className="space-y-1">
            {STEPS.map((step, i) => {
              const done = i < currentStep
              const active = i === currentStep
              return (
                <button
                  key={i}
                  onClick={() => i < currentStep && setCurrentStep(i)}
                  disabled={i > currentStep}
                  className={`w-full flex items-center gap-3 px-3 py-3 rounded-xl text-left transition-colors ${
                    active ? 'bg-white/10' : done ? 'hover:bg-white/5 cursor-pointer' : 'opacity-40 cursor-not-allowed'
                  }`}
                >
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

        <div className="px-8 py-6">
          <div className="flex items-center justify-between mb-2">
            <p className="text-xs text-white/50">Progress</p>
            <p className="text-xs text-white/70 font-medium">{Math.min(currentStep + 1, STEPS.length)} / {STEPS.length}</p>
          </div>
          <div className="h-1.5 bg-white/10 rounded-full overflow-hidden">
            <div
              className="h-full bg-[#22c55e] rounded-full transition-all duration-300"
              style={{ width: `${(Math.min(currentStep + 1, STEPS.length) / STEPS.length) * 100}%` }}
            />
          </div>
        </div>
      </div>

      {/* Right — form content */}
      <div className="flex-1 flex flex-col overflow-y-auto">
        <EmailVerificationBanner />

        <div className="flex-1 px-12 py-10 max-w-2xl">
          <div className="mb-8">
            <p className="text-xs font-medium text-[#22c55e] uppercase tracking-widest mb-1">
              Step {Math.min(currentStep + 1, STEPS.length)} of {STEPS.length}
            </p>
            <h1 className="text-2xl font-bold text-gray-900">{STEPS[currentStep]?.label}</h1>
            <p className="text-sm text-gray-500 mt-1">{STEPS[currentStep]?.sub}</p>
          </div>

          {currentStep === 0 && <Step0 data={step0} set={setStep0} />}
          {currentStep === 1 && <Step1 data={step1} set={setStep1} />}
          {currentStep === 2 && <Step2 data={step2} set={setStep2} />}
          {currentStep === 3 && <Step3 data={step3} set={setStep3} />}
          {currentStep === 4 && <Step4 data={step4} set={setStep4} />}
          {currentStep === 5 && (
            <Step5
              emails={inviteEmails}
              setEmails={setInviteEmails}
              inviteResult={inviteResult}
            />
          )}
          {currentStep === 6 && (
            <div className="text-center py-8">
              <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <Check size={28} className="text-[#22c55e]" />
              </div>
              <h3 className="text-xl font-bold text-gray-900 mb-2">You're all set!</h3>
              <p className="text-sm text-gray-500 max-w-xs mx-auto">
                Your CHAMP workspace is ready. You can now start managing your team, payroll, and benefits.
              </p>
            </div>
          )}

          {error && (
            <p className="mt-4 text-sm text-red-600">{error}</p>
          )}
        </div>

        <div className="border-t border-gray-100 px-12 py-5 flex items-center justify-between">
          <button
            onClick={() => currentStep > 0 && setCurrentStep((s) => s - 1)}
            disabled={currentStep === 0 || saving}
            className="flex items-center gap-1.5 text-sm text-gray-500 hover:text-gray-700
                       disabled:opacity-30 disabled:cursor-not-allowed"
          >
            ← Back
          </button>
          <button
            onClick={handleNext}
            disabled={saving}
            className="bg-[#22c55e] hover:bg-green-600 disabled:opacity-60
                       text-white font-semibold px-8 py-2.5 rounded-xl transition-colors
                       text-sm flex items-center gap-2"
          >
            {saving && <Loader2 size={14} className="animate-spin" />}
            {currentStep === 5 ? 'Send invites & finish' : isLast ? 'Go to dashboard' : 'Save and continue'}
          </button>
        </div>
      </div>
    </div>
  )
}
