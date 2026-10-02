import { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { Check, User } from 'lucide-react'

import { usePageTitle } from '../../hooks/usePageTitle'
import { useAuth } from '../../context/AuthContext'

// ── Step disc marker ──────────────────────────────────────────────────

type StepStatus = 'done' | 'current' | 'upcoming'

function StepDisc({ status, number }: { status: StepStatus; number: number }) {
  if (status === 'done') {
    return (
      <div
        className="shrink-0 flex items-center justify-center rounded-full"
        style={{ width: 26, height: 26, background: '#1b2838' }}
      >
        <Check size={13} color="white" strokeWidth={2.5} />
      </div>
    )
  }
  if (status === 'current') {
    return (
      <div
        className="shrink-0 flex items-center justify-center rounded-full text-[13px] font-semibold"
        style={{
          width: 26,
          height: 26,
          border: '2px solid #22c55e',
          color: '#15803d',
        }}
      >
        {number}
      </div>
    )
  }
  // upcoming
  return (
    <div
      className="shrink-0 flex items-center justify-center rounded-full text-[13px] font-semibold text-gray-400"
      style={{ width: 26, height: 26, border: '1.5px solid #d1d5db' }}
    >
      {number}
    </div>
  )
}

// ── Checklist step ────────────────────────────────────────────────────

interface Step {
  id: number
  title: string
  description?: string
  estMinutes?: number
  status: StepStatus
  actionLabel?: string
  secondaryLabel?: string
  path?: string
  secondaryPath?: string
}

const SETUP_STEPS: Step[] = [
  {
    id: 1,
    title: 'Company details',
    status: 'current',
    description: 'Add your business name, address, and legal entity type.',
    estMinutes: 5,
    actionLabel: 'Continue setup',
    path: '/employer/config',
  },
  {
    id: 2,
    title: 'Business bank account',
    status: 'upcoming',
    description: 'Connect the account PayChamps will pull funds from on payroll day.',
    estMinutes: 3,
    actionLabel: 'Set up bank account',
    path: '/employer/config',
  },
  {
    id: 3,
    title: 'Federal and state tax setup',
    status: 'upcoming',
    description:
      'Add your EIN and state withholding and unemployment account numbers. Don\'t have a state ID yet? We\'ll register for you.',
    estMinutes: 8,
    actionLabel: 'Continue setup',
    secondaryLabel: 'Register a state ID for me',
    path: '/employer/config',
    secondaryPath: '/employer/config',
  },
  {
    id: 4,
    title: 'Add employees',
    status: 'upcoming',
    description: 'Import a CSV or invite people to fill in their own details.',
    actionLabel: 'Add employees',
    path: '/employer/employees/add',
  },
  {
    id: 5,
    title: 'Pay schedule',
    status: 'upcoming',
    description: 'Weekly, biweekly, semi-monthly or monthly.',
    actionLabel: 'Set pay schedule',
    path: '/employer/payroll',
  },
  {
    id: 6,
    title: 'Run your first payroll',
    status: 'upcoming',
    description: 'Preview it before anything is paid.',
    actionLabel: 'Run payroll',
    path: '/employer/payroll',
  },
]

function ChecklistStep({ step, isExpanded, onToggle }: {
  step: Step
  isExpanded: boolean
  onToggle: () => void
}) {
  const navigate = useNavigate()
  const { status, id, title, description, estMinutes, actionLabel, secondaryLabel, path, secondaryPath } = step

  const rowBg = status === 'current' ? '#f0fdf4' : 'white'

  return (
    <div
      className="px-6 py-4 border-b border-gray-100 last:border-b-0 cursor-pointer"
      style={{ background: rowBg }}
      onClick={status !== 'done' ? onToggle : undefined}
    >
      <div className="flex items-start gap-3">
        <StepDisc status={status} number={id} />
        <div className="flex-1 min-w-0">
          <div className="flex items-center justify-between gap-2">
            <p
              className={`text-[15px] font-medium ${
                status === 'done' ? 'line-through text-gray-400' : 'text-gray-800'
              }`}
            >
              {title}
            </p>
            {status === 'done' && (
              <button className="text-[13px] text-emerald-600 hover:text-emerald-700 shrink-0">
                Edit
              </button>
            )}
          </div>

          {/* Expanded content for current or if user toggled open */}
          {(status === 'current' || isExpanded) && description && (
            <div className="mt-2">
              <p className="text-[13px] text-gray-500">{description}</p>
              {(actionLabel || secondaryLabel) && (
                <div className="flex items-center gap-3 mt-3 flex-wrap">
                  {actionLabel && (
                    <button
                      onClick={() => path && navigate(path)}
                      className="px-4 py-1.5 rounded-lg text-[13px] font-medium text-white"
                      style={{ background: '#22c55e' }}
                    >
                      {actionLabel}
                    </button>
                  )}
                  {secondaryLabel && (
                    <button
                      onClick={() => (secondaryPath || path) && navigate(secondaryPath ?? path!)}
                      className="px-4 py-1.5 rounded-lg text-[13px] font-medium text-gray-600 border border-gray-200 hover:bg-gray-50"
                    >
                      {secondaryLabel}
                    </button>
                  )}
                  {estMinutes && (
                    <span className="text-[12px] text-gray-400">~{estMinutes} min</span>
                  )}
                </div>
              )}
            </div>
          )}

          {/* Collapsed upcoming: show description dimmed */}
          {status === 'upcoming' && !isExpanded && description && (
            <p className="text-[13px] text-gray-400 mt-0.5">{description}</p>
          )}
        </div>
      </div>
    </div>
  )
}

// ── Recommended next ──────────────────────────────────────────────────

interface RecommendedItem {
  label: string
  description: string
  linkLabel: string
  path: string
}

const RECOMMENDED: RecommendedItem[] = [
  {
    label: 'Add benefits',
    description: 'Create health, dental and 401(k) plans for your business',
    linkLabel: 'Add benefits',
    path: '/employer/benefits',
  },
  {
    label: 'Add documents to sign',
    description: 'Handbooks, offer letters and policies for employees to e-sign',
    linkLabel: 'Add documents',
    path: '/employer/documents',
  },
  {
    label: 'Set up user access',
    description: 'Departments, user groups and admins',
    linkLabel: 'Set up access',
    path: '/employer/user-access',
  },
]

// ── Main Dashboard ────────────────────────────────────────────────────

export default function EmployerDashboard() {
  usePageTitle('Dashboard')
  const { user } = useAuth()
  const firstName = user?.fullName?.split(' ')[0] ?? 'there'

  // For now always show State A (no firstPayrollRunAt yet)
  const firstPayrollRunAt: string | null = null

  const steps = SETUP_STEPS
  const doneCount = steps.filter(s => s.status === 'done').length
  const totalSteps = steps.length
  const remainingCount = totalSteps - doneCount
  const progressPct = (doneCount / totalSteps) * 100

  // Which step is expanded (besides the current step which is always expanded)
  const [expandedStep, setExpandedStep] = useState<number | null>(null)

  function toggleStep(id: number) {
    setExpandedStep(prev => (prev === id ? null : id))
  }

  if (firstPayrollRunAt) {
    // State B placeholder — not reached yet
    return (
      <div>
        <h1 className="text-2xl font-bold text-gray-900">Good morning, {firstName}</h1>
      </div>
    )
  }

  return (
    // Two-column grid: main + right sidebar
    <div
      className="grid gap-7"
      style={{ gridTemplateColumns: 'minmax(0,1fr) 340px', alignItems: 'start' }}
    >
      {/* ── Left column ─────────────────────────────────────────── */}
      <div className="flex flex-col gap-6">

        {/* Heading */}
        <div>
          <h1
            className="text-[28px] font-semibold text-gray-900"
            style={{ letterSpacing: '-0.02em' }}
          >
            Welcome, {firstName}
          </h1>
          <p className="text-[15px] text-gray-500 mt-1">
            {remainingCount} step{remainingCount !== 1 ? 's' : ''} left before you can run your first payroll.
            Most teams finish in about 20 minutes.
          </p>
        </div>

        {/* Checklist card */}
        <div className="bg-white rounded-xl border border-gray-200 overflow-hidden">
          {/* Card header */}
          <div className="px-6 py-4 border-b border-gray-100">
            <div className="flex items-center justify-between mb-3">
              <p className="text-[14px] font-semibold text-gray-900">Set up payroll</p>
              <p className="text-[13px] text-gray-400">{doneCount} of {totalSteps} complete</p>
            </div>
            {/* Progress bar */}
            <div className="h-[6px] rounded-full" style={{ background: '#f3f2ee' }}>
              <div
                className="h-full rounded-full transition-all duration-300"
                style={{ width: `${progressPct}%`, background: '#22c55e' }}
              />
            </div>
          </div>

          {/* Steps */}
          <div>
            {steps.map(step => (
              <ChecklistStep
                key={step.id}
                step={step}
                isExpanded={expandedStep === step.id}
                onToggle={() => toggleStep(step.id)}
              />
            ))}
          </div>
        </div>

        {/* Recommended next card */}
        <div className="bg-white rounded-xl border border-gray-200 overflow-hidden">
          <div className="px-6 py-4 border-b border-gray-100 flex items-center justify-between">
            <p className="text-[14px] font-semibold text-gray-900">Recommended next</p>
            <p className="text-[13px] text-gray-400">Optional · do anytime</p>
          </div>
          <div>
            {RECOMMENDED.map((item, i) => (
              <div
                key={item.label}
                className={`px-6 py-4 flex items-start gap-3 ${
                  i < RECOMMENDED.length - 1 ? 'border-b border-gray-100' : ''
                }`}
              >
                {/* Dashed square marker */}
                <div
                  className="shrink-0 rounded-[6px]"
                  style={{
                    width: 26,
                    height: 26,
                    border: '1.5px dashed #d1d5db',
                    marginTop: 1,
                  }}
                />
                <div>
                  <p className="text-[13px] text-gray-500">{item.description}</p>
                  <Link
                    to={item.path}
                    className="text-[13px] font-medium text-emerald-600 hover:text-emerald-700 mt-0.5 inline-block"
                  >
                    {item.linkLabel}
                  </Link>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* ── Right column ────────────────────────────────────────── */}
      <div className="flex flex-col gap-5">

        {/* Onboarding specialist card */}
        <div className="bg-white rounded-xl border border-gray-200 p-6">
          <p className="text-[11px] font-medium text-gray-400 tracking-wider uppercase mb-4">
            Your onboarding specialist
          </p>
          <div className="flex items-center gap-3 mb-4">
            <div
              className="shrink-0 rounded-full bg-gray-200 flex items-center justify-center"
              style={{ width: 44, height: 44 }}
            >
              <User size={20} className="text-gray-400" />
            </div>
            <div>
              <p className="text-[15px] font-semibold text-gray-900">Your specialist</p>
              <p className="text-[13px] text-gray-500">US-based · replies within 1 hour</p>
            </div>
          </div>
          <div className="grid grid-cols-2 gap-3">
            <button className="py-2 rounded-lg text-[13px] font-medium text-gray-700 border border-gray-200 hover:bg-gray-50 transition-colors">
              Book a call
            </button>
            <button className="py-2 rounded-lg text-[13px] font-medium text-gray-700 border border-gray-200 hover:bg-gray-50 transition-colors">
              Message
            </button>
          </div>
        </div>

        {/* Switching from another provider card */}
        <div className="bg-white rounded-xl border border-gray-200 p-6">
          <p className="text-[15px] font-semibold text-gray-900 mb-2">
            Switching from another provider?
          </p>
          <p className="text-[13px] text-gray-500 mb-3">
            Import employees, year-to-date pay and tax filings from ADP, Paylocity, Gusto or
            Paychex. Your W-2s stay accurate for the whole year.
          </p>
          <button className="text-[13px] font-medium text-emerald-600 hover:text-emerald-700 transition-colors">
            Start an import →
          </button>
        </div>

      </div>
    </div>
  )
}
