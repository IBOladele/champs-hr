import React from 'react'
import {
  Users, CreditCard, FileText, Key,
  Briefcase, BarChart2, Gift, ShieldCheck, Settings,
  FolderOpen, ChevronRight, Calendar, Mail
} from 'lucide-react'

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

// ── Task item (Your tasks card) ────────────────────────────────────────

interface TaskItemProps {
  icon: React.ElementType
  iconBg: string
  iconColor: string
  title: string
  subtitle: string
}

function TaskItem({ icon: Icon, iconBg, iconColor, title, subtitle }: TaskItemProps) {
  return (
    <div className="flex items-center gap-3 py-3 border-b border-gray-100 last:border-0">
      <div className={`w-9 h-9 rounded-full ${iconBg} flex items-center justify-center shrink-0`}>
        <Icon size={16} className={iconColor} />
      </div>
      <div className="flex-1 min-w-0">
        <p className="text-sm font-medium text-gray-800 truncate">{title}</p>
        <p className="text-xs text-gray-400 mt-0.5">{subtitle}</p>
      </div>
      <div className="flex items-center gap-2 shrink-0">
        <span className="text-xs bg-yellow-100 text-yellow-700 font-medium px-2 py-0.5 rounded-full">
          Pending
        </span>
        <button className="text-xs text-gray-600 border border-gray-200 rounded-lg px-2.5 py-1 hover:bg-gray-50 transition-colors whitespace-nowrap">
          + Start task
        </button>
      </div>
    </div>
  )
}

// ── Team overview item (document requests) ────────────────────────────

interface TeamOverviewItemProps {
  title: string
  person: string
  lastSent: string
}

function TeamOverviewItem({ title, person, lastSent }: TeamOverviewItemProps) {
  return (
    <div className="flex items-center gap-3 py-3 border-b border-gray-100 last:border-0">
      <div className="w-9 h-9 rounded-full bg-blue-50 flex items-center justify-center shrink-0">
        <FileText size={16} className="text-blue-500" />
      </div>
      <div className="flex-1 min-w-0">
        <p className="text-sm font-medium text-gray-800 truncate">{title}</p>
        <p className="text-xs text-gray-400 mt-0.5">{person} • {lastSent}</p>
      </div>
      <div className="flex items-center gap-2 shrink-0">
        <span className="text-xs bg-amber-100 text-amber-700 font-medium px-2 py-0.5 rounded-full">
          Action needed
        </span>
        <button className="flex items-center gap-1 text-xs text-gray-600 border border-gray-200 rounded-lg px-2.5 py-1 hover:bg-gray-50 transition-colors whitespace-nowrap">
          <Mail size={11} />
          Request to resend
        </button>
      </div>
    </div>
  )
}

// ── Team related task item ─────────────────────────────────────────────

interface TeamRelatedTaskItemProps {
  icon: React.ElementType
  iconBg: string
  iconColor: string
  name: string
  subtitle: string
  badge: { label: string; className: string }
  action: { label: string; icon?: React.ElementType }
}

function TeamRelatedTaskItem({ icon: Icon, iconBg, iconColor, name, subtitle, badge, action }: TeamRelatedTaskItemProps) {
  return (
    <div className="flex items-center gap-3 py-3 border-b border-gray-100 last:border-0">
      <div className={`w-9 h-9 rounded-full ${iconBg} flex items-center justify-center shrink-0`}>
        <Icon size={16} className={iconColor} />
      </div>
      <div className="flex-1 min-w-0">
        <p className="text-sm font-medium text-gray-800 truncate">{name}</p>
        <p className="text-xs text-gray-400 mt-0.5">{subtitle}</p>
      </div>
      <div className="flex items-center gap-2 shrink-0">
        <span className={`text-xs font-medium px-2 py-0.5 rounded-full ${badge.className}`}>
          {badge.label}
        </span>
        <button className="flex items-center gap-1 text-xs text-gray-600 border border-gray-200 rounded-lg px-2.5 py-1 hover:bg-gray-50 transition-colors whitespace-nowrap">
          {action.icon && <action.icon size={11} />}
          {action.label}
        </button>
      </div>
    </div>
  )
}

// ── Payslip item ──────────────────────────────────────────────────────

interface PayslipItemProps {
  label: string
  subtitle: string
}

function PayslipItem({ label, subtitle }: PayslipItemProps) {
  return (
    <div className="flex items-center gap-3 py-3 border-b border-gray-100 last:border-0">
      <div className="w-9 h-9 rounded-full bg-gray-100 flex items-center justify-center shrink-0">
        <FolderOpen size={16} className="text-gray-500" />
      </div>
      <div className="flex-1 min-w-0">
        <p className="text-sm font-medium text-gray-800">{label}</p>
        <p className="text-xs text-gray-400 mt-0.5">{subtitle}</p>
      </div>
      <button className="flex items-center gap-1 text-xs text-gray-600 border border-gray-200 rounded-lg px-2.5 py-1 hover:bg-gray-50 transition-colors whitespace-nowrap">
        ⊙ Download payslips
      </button>
    </div>
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

// ── Main Dashboard ────────────────────────────────────────────────────

export default function EmployerDashboard() {
  return (
    <div className="max-w-full px-8 py-6 space-y-6">

      {/* Greeting */}
      <h1 className="text-2xl font-bold text-gray-900">Hello Skywrapper</h1>

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
          <TaskItem
            icon={Briefcase}
            iconBg="bg-blue-50"
            iconColor="text-blue-500"
            title="Feburary 2025 payroll"
            subtitle="$453,300 paid • 40 employees"
          />
          <TaskItem
            icon={Gift}
            iconBg="bg-purple-50"
            iconColor="text-purple-500"
            title="February benefit sync"
            subtitle="$453,300 deducted • 20 plans"
          />
          <TaskItem
            icon={CreditCard}
            iconBg="bg-green-50"
            iconColor="text-green-500"
            title="January 2025 payroll"
            subtitle="$453,300 paid • 40 employees"
          />
          <ViewAllButton label="View all tasks" />
        </div>

        {/* Team overview */}
        <div className="bg-white rounded-xl border border-gray-100 p-6">
          <h2 className="text-base font-semibold text-gray-900 mb-2">Team overview</h2>
          <TeamOverviewItem
            title="Document missing - I-9 form"
            person="Kemi Adebayo"
            lastSent="Last sent Mar 1"
          />
          <TeamOverviewItem
            title="Missing - W-2 form"
            person="Kailash Balaji"
            lastSent="Last sent Mar 1"
          />
          <TeamOverviewItem
            title="Document missing - Handbook"
            person="Kemi Adebayo"
            lastSent="Last sent Mar 1"
          />
          <ViewAllButton label="View all team tasks" />
        </div>

      </div>

      {/* Row B: Team related tasks + Last 3 months payslips */}
      <div className="grid grid-cols-2 gap-6">

        {/* Team related tasks */}
        <div className="bg-white rounded-xl border border-gray-100 p-6">
          <h2 className="text-base font-semibold text-gray-900 mb-2">Team related tasks</h2>
          <TeamRelatedTaskItem
            icon={CreditCard}
            iconBg="bg-blue-50"
            iconColor="text-blue-500"
            name="Marcus smith - 12838444"
            subtitle="Ava health plan • 3 dependants"
            badge={{ label: 'Pending review', className: 'bg-amber-100 text-amber-700' }}
            action={{ label: '+ Start task' }}
          />
          <TeamRelatedTaskItem
            icon={Calendar}
            iconBg="bg-purple-50"
            iconColor="text-purple-500"
            name="John doe - 12838444"
            subtitle="Paternal leave • April 4 - June 16"
            badge={{ label: 'Pending review', className: 'bg-amber-100 text-amber-700' }}
            action={{ label: '+ Start task' }}
          />
          <TeamRelatedTaskItem
            icon={Users}
            iconBg="bg-gray-100"
            iconColor="text-gray-500"
            name="Aaliyah stanson - 12838444"
            subtitle="Product designer • $67k salary"
            badge={{ label: 'Not filled', className: 'bg-gray-100 text-gray-500' }}
            action={{ label: '✉ Resend invite', icon: undefined }}
          />
          <ViewAllButton label="View all tasks" />
        </div>

        {/* Last 3 months payslips */}
        <div className="bg-white rounded-xl border border-gray-100 p-6">
          <h2 className="text-base font-semibold text-gray-900 mb-2">Last 3 months payslips</h2>
          <PayslipItem
            label="March 2025 payslips"
            subtitle="$470,100 paid • March 1, 2025"
          />
          <PayslipItem
            label="Feburary 2025 payslips"
            subtitle="$470,100 paid • Feb 1, 2025"
          />
          <PayslipItem
            label="January 2025 payslips"
            subtitle="$470,100 paid • Jan 1, 2025"
          />
          <ViewAllButton label="View all payslips" />
        </div>

      </div>

    </div>
  )
}
