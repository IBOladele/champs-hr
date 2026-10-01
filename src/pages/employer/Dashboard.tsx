import React from 'react'
import { useNavigate } from 'react-router-dom'
import {
  Users, CreditCard, FileText, Key,
  Briefcase, BarChart2, Gift, ShieldCheck, Settings,
  FolderOpen, ChevronRight, Calendar, AlertCircle
} from 'lucide-react'

import { usePageTitle } from '../../hooks/usePageTitle'
import { useAuth } from '../../context/AuthContext'

// ── To-do card ────────────────────────────────────────────────────────

interface TodoCardProps {
  icon: React.ElementType
  iconBg: string
  iconColor: string
  title: string
  description: string
  action: string
}

function TodoCard({ icon: Icon, iconBg, iconColor, title, description, action }: TodoCardProps) {
  return (
    <div className="bg-white rounded-xl border border-gray-100 p-5 flex flex-col">
      <div className={`w-10 h-10 rounded-full ${iconBg} flex items-center justify-center`}>
        <Icon size={18} className={iconColor} />
      </div>
      <p className="text-gray-900 font-medium mt-3 text-sm leading-snug">{title}</p>
      <p className="text-gray-500 text-sm mt-1 leading-relaxed">{description}</p>
      <button className="text-emerald-500 text-sm mt-4 text-left hover:text-emerald-600 transition-colors">
        {action}
      </button>
    </div>
  )
}

// ── Quick action card ─────────────────────────────────────────────────

interface QuickActionCardProps {
  icon: React.ElementType
  iconBg: string
  iconColor: string
  label: string
}

function QuickActionCard({ icon: Icon, iconBg, iconColor, label }: QuickActionCardProps) {
  return (
    <button className="bg-white rounded-xl border border-gray-100 p-4 flex flex-col w-full hover:shadow-sm transition-shadow">
      <div className="flex items-start justify-between w-full">
        <div className={`w-9 h-9 rounded-full ${iconBg} flex items-center justify-center`}>
          <Icon size={16} className={iconColor} />
        </div>
        <ChevronRight size={14} className="text-gray-400 mt-0.5" />
      </div>
      <span className="text-gray-700 text-sm font-medium mt-3 text-left">{label}</span>
    </button>
  )
}

// ── View all button ───────────────────────────────────────────────────

function ViewAllButton({ label }: { label: string }) {
  return (
    <button className="w-full mt-4 py-2 text-sm text-gray-600 border border-gray-200 rounded-xl hover:bg-gray-50 transition-colors font-medium">
      {label}
    </button>
  )
}

// ── Empty section state ───────────────────────────────────────────────

function EmptySection({ icon: Icon, message, sub }: { icon: React.ElementType; message: string; sub?: string }) {
  return (
    <div className="flex flex-col items-center justify-center py-10 text-center">
      <Icon size={32} className="text-gray-300 mb-3" />
      <p className="text-sm font-medium text-gray-500">{message}</p>
      {sub && <p className="text-xs text-gray-400 mt-1">{sub}</p>}
    </div>
  )
}

// ── Main Dashboard ────────────────────────────────────────────────────

const ONBOARDING_STEPS = [
  'Company profile',
  'Compliance',
  'Pay schedule',
  'Pay elements',
  'Work locations',
  'Invite employees',
]

export default function EmployerDashboard() {
  usePageTitle('Dashboard')
  const { user } = useAuth()
  const navigate = useNavigate()
  const firstName = user?.fullName?.split(' ')[0] ?? 'there'
  const onboardingDone = user?.onboardingCompleted === true

  return (
    <div className="space-y-6">

      {/* Greeting */}
      <h1 className="text-2xl font-bold text-gray-900">Hello {firstName}</h1>

      {/* Onboarding banner */}
      {!onboardingDone && (
        <section className="bg-amber-50 border border-amber-200 rounded-xl p-5">
          <div className="flex items-start gap-3 mb-4">
            <AlertCircle size={20} className="text-amber-500 mt-0.5 shrink-0" />
            <div>
              <p className="text-sm font-semibold text-amber-900">Complete your account setup</p>
              <p className="text-xs text-amber-700 mt-0.5">Finish onboarding to unlock payroll and invite your team.</p>
            </div>
            <button
              onClick={() => navigate('/onboarding')}
              className="ml-auto shrink-0 px-4 py-1.5 text-sm font-medium text-white rounded-lg"
              style={{ backgroundColor: '#22c55e' }}
            >
              Continue setup →
            </button>
          </div>
          <div className="flex items-center gap-2">
            {ONBOARDING_STEPS.map((step, i) => (
              <div key={step} className="flex items-center gap-2">
                <div className="flex items-center gap-1.5">
                  <div className="w-5 h-5 rounded-full border-2 border-amber-300 bg-white flex items-center justify-center">
                    <span className="text-[10px] font-semibold text-amber-500">{i + 1}</span>
                  </div>
                  <span className="text-xs text-amber-800 whitespace-nowrap">{step}</span>
                </div>
                {i < ONBOARDING_STEPS.length - 1 && (
                  <div className="w-6 h-px bg-amber-200" />
                )}
              </div>
            ))}
          </div>
        </section>
      )}

      {/* Section 1: To-do items */}
      <section className="bg-white rounded-xl border border-gray-100 p-6">
        <h2 className="text-base font-semibold text-gray-900 mb-4">To-do items</h2>
        <div className="grid grid-cols-4 gap-4">
          <TodoCard
            icon={Users}
            iconBg="bg-emerald-100"
            iconColor="text-emerald-600"
            title="Add your employees"
            description="Add a list of all your employees to help you"
            action="+ Add your employees"
          />
          <TodoCard
            icon={CreditCard}
            iconBg="bg-amber-100"
            iconColor="text-amber-600"
            title="Add benefits"
            description="Create benefit plans for your business"
            action="+ Add benefits"
          />
          <TodoCard
            icon={FileText}
            iconBg="bg-blue-100"
            iconColor="text-blue-600"
            title="Add documents to sign"
            description="Add documents for your employees to make"
            action="+ Add documents"
          />
          <TodoCard
            icon={Key}
            iconBg="bg-cyan-100"
            iconColor="text-cyan-600"
            title="Setup user access"
            description="Add departments, user groups and admin"
            action="+ Setup user access"
          />
        </div>
      </section>

      {/* Section 2: Quick actions */}
      <section className="bg-white rounded-xl border border-gray-100 p-6">
        <h2 className="text-base font-semibold text-gray-900 mb-4">Quick actions</h2>
        <div className="grid grid-cols-4 gap-4">
          <QuickActionCard icon={Briefcase}  iconBg="bg-yellow-100"  iconColor="text-yellow-600"  label="Manage payroll"      />
          <QuickActionCard icon={Users}      iconBg="bg-green-100"   iconColor="text-green-600"   label="Invite employees"    />
          <QuickActionCard icon={BarChart2}  iconBg="bg-gray-100"    iconColor="text-gray-500"    label="View analytics"      />
          <QuickActionCard icon={FileText}   iconBg="bg-blue-100"    iconColor="text-blue-600"    label="Generate reports"    />
          <QuickActionCard icon={FileText}   iconBg="bg-indigo-100"  iconColor="text-indigo-600"  label="Create documents"    />
          <QuickActionCard icon={Gift}       iconBg="bg-amber-100"   iconColor="text-amber-600"   label="Manage benefits"     />
          <QuickActionCard icon={ShieldCheck} iconBg="bg-teal-100"   iconColor="text-teal-600"    label="Manage Admin"        />
          <QuickActionCard icon={Settings}   iconBg="bg-slate-100"   iconColor="text-slate-600"   label="Configure Business"  />
        </div>
      </section>

      {/* Row A: Your tasks + Team overview */}
      <div className="grid grid-cols-2 gap-6">

        {/* Your tasks */}
        <div className="bg-white rounded-xl border border-gray-100 p-6">
          <h2 className="text-base font-semibold text-gray-900 mb-2">Your tasks</h2>
          <EmptySection icon={Briefcase} message="No team tasks" sub="Tasks assigned to you will appear here" />
          <ViewAllButton label="View all tasks" />
        </div>

        {/* Team overview */}
        <div className="bg-white rounded-xl border border-gray-100 p-6">
          <h2 className="text-base font-semibold text-gray-900 mb-2">Team overview</h2>
          <EmptySection icon={Users} message="No recent payroll activity" sub="Payroll activity will appear here" />
          <ViewAllButton label="View all team tasks" />
        </div>

      </div>

      {/* Row B: Team related tasks + Last 3 months payslips */}
      <div className="grid grid-cols-2 gap-6">

        {/* Team related tasks */}
        <div className="bg-white rounded-xl border border-gray-100 p-6">
          <h2 className="text-base font-semibold text-gray-900 mb-2">Team related tasks</h2>
          <EmptySection icon={Calendar} message="No team tasks" sub="Team related tasks will appear here" />
          <ViewAllButton label="View all tasks" />
        </div>

        {/* Last 3 months payslips */}
        <div className="bg-white rounded-xl border border-gray-100 p-6">
          <h2 className="text-base font-semibold text-gray-900 mb-2">Last 3 months payslips</h2>
          <EmptySection icon={FolderOpen} message="No recent payslips" sub="Payslips will appear here once payroll has been run" />
          <ViewAllButton label="View all payslips" />
        </div>

      </div>

    </div>
  )
}
