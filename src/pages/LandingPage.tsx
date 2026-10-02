import { useNavigate } from 'react-router-dom'
import {
  Users, BarChart2, FileText, Shield, Clock, CreditCard,
  CheckCircle2, ArrowRight, ChevronRight,
  Zap, Globe, Lock
} from 'lucide-react'
import { usePageTitle } from '../hooks/usePageTitle'
import MarketingShell from '../components/MarketingShell'

const features = [
  {
    icon: Users,
    title: 'Employee Management',
    description: 'Onboard, manage, and track your entire workforce from a single dashboard. Real-time profiles, role management, and org charts.',
    color: 'bg-green-50 text-green-600',
  },
  {
    icon: CreditCard,
    title: 'Payroll & Compensation',
    description: 'Run accurate payroll in minutes. Automated tax calculations, pay schedules, deductions, and instant payslip generation.',
    color: 'bg-blue-50 text-blue-600',
  },
  {
    icon: BarChart2,
    title: 'Analytics & Reporting',
    description: 'Make smarter decisions with real-time HR insights. Track headcount, payroll costs, attendance trends, and benefits utilisation.',
    color: 'bg-purple-50 text-purple-600',
  },
  {
    icon: Clock,
    title: 'Attendance & Leave',
    description: 'Clock-in tracking, leave request workflows, and absence management — all automated and synced with payroll.',
    color: 'bg-amber-50 text-amber-600',
  },
  {
    icon: FileText,
    title: 'Documents',
    description: 'Store, manage, and share HR documents securely. E-signatures, version control, and automated expiry alerts.',
    color: 'bg-rose-50 text-rose-600',
  },
  {
    icon: Shield,
    title: 'Benefits Administration',
    description: 'Create and manage benefit plans across health, 401(k), and more. Let employees self-enroll and track their coverage.',
    color: 'bg-teal-50 text-teal-600',
  },
]

const stats = [
  { value: '< 5 min', label: 'Average payroll run time' },
  { value: '100%', label: 'Automated tax calculations' },
  { value: '99.9%', label: 'Platform uptime SLA' },
  { value: 'Same day', label: 'Direct deposit processing' },
]

export default function LandingPage() {
  usePageTitle('Payroll & HR for Growing Teams')

  const navigate = useNavigate()

  return (
    <MarketingShell>
      {/* ── Hero ── */}
      <section
        className="relative overflow-hidden"
        style={{ background: 'linear-gradient(135deg, #0d1b2a 0%, #1a3a2a 100%)' }}
      >
        {/* Background decorations */}
        <div className="absolute inset-0 pointer-events-none overflow-hidden">
          <div
            className="absolute top-20 right-1/4 w-96 h-96 rounded-full opacity-10"
            style={{ background: '#22c55e', filter: 'blur(80px)' }}
          />
          <div
            className="absolute bottom-0 left-1/3 w-64 h-64 rounded-full opacity-5"
            style={{ background: '#22c55e', filter: 'blur(60px)' }}
          />
        </div>

        <div className="relative max-w-7xl mx-auto px-6 py-28 text-center">
          {/* Badge */}
          <div
            className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full border mb-8 text-xs font-medium"
            style={{ borderColor: '#22c55e33', color: '#22c55e', background: '#22c55e11' }}
          >
            <Zap size={12} />
            The modern HR platform for growing teams
          </div>

          <h1 className="text-5xl md:text-6xl font-extrabold text-white leading-tight mb-6 max-w-3xl mx-auto">
            Payroll &amp; HR for{' '}
            <span style={{ color: '#22c55e' }}>teams of 10–500</span>
          </h1>

          <p className="text-lg text-gray-300 max-w-2xl mx-auto mb-10 leading-relaxed">
            Run payroll in minutes, not days. No PEO lock-in, no surprise fees, no 18-month contracts.
          </p>

          <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
            <button
              onClick={() => navigate('/get-started')}
              className="flex items-center gap-2 px-6 py-3 text-sm font-semibold text-white rounded-xl shadow-lg transition-all hover:scale-105"
              style={{ backgroundColor: '#22c55e' }}
            >
              Start for free
              <ArrowRight size={16} />
            </button>
            <button
              onClick={() => navigate('/pricing')}
              className="flex items-center gap-2 px-6 py-3 text-sm font-semibold text-white rounded-xl border border-white/20 hover:bg-white/10 transition-colors"
            >
              See pricing
              <ChevronRight size={16} />
            </button>
          </div>

          <p className="mt-5 text-xs text-gray-500">No credit card required · Free 30-day trial</p>

          {/* Hero dashboard mockup */}
          <div className="mt-16 relative mx-auto max-w-5xl">
            <div className="bg-white/5 border border-white/10 rounded-2xl overflow-hidden shadow-2xl">
              {/* Fake browser bar */}
              <div className="flex items-center gap-2 px-4 py-3 border-b border-white/10 bg-white/5">
                <div className="w-3 h-3 rounded-full bg-red-400/60" />
                <div className="w-3 h-3 rounded-full bg-yellow-400/60" />
                <div className="w-3 h-3 rounded-full bg-green-400/60" />
                <div className="flex-1 mx-4 h-6 bg-white/10 rounded-md" />
              </div>
              {/* Dashboard preview rows */}
              <div className="p-6 grid grid-cols-4 gap-4">
                {['Total employees', 'Active', 'On payroll', 'Pending'].map((label, i) => (
                  <div key={label} className="bg-white/10 rounded-xl p-4">
                    <p className="text-xs text-gray-400 mb-1">{label}</p>
                    <p className="text-xl font-bold text-white">
                      {['48', '45', '44', '3'][i]}
                    </p>
                  </div>
                ))}
              </div>
              <div className="px-6 pb-6 grid grid-cols-3 gap-4">
                <div className="col-span-2 bg-white/10 rounded-xl h-36 flex items-center justify-center">
                  <div className="flex items-end gap-2 h-20">
                    {[60, 80, 50, 90, 70, 85, 65].map((h, i) => (
                      <div
                        key={i}
                        className="w-6 rounded-sm opacity-70"
                        style={{ height: `${h}%`, backgroundColor: '#22c55e' }}
                      />
                    ))}
                  </div>
                </div>
                <div className="space-y-3">
                  {['Payroll processed', 'Leave approved', 'Docs uploaded'].map((item) => (
                    <div key={item} className="bg-white/10 rounded-lg p-3 flex items-center gap-2">
                      <CheckCircle2 size={14} style={{ color: '#22c55e' }} />
                      <span className="text-xs text-gray-300">{item}</span>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ── Stats ── */}
      <section className="border-b border-gray-100">
        <div className="max-w-7xl mx-auto px-6 py-14 grid grid-cols-2 md:grid-cols-4 gap-8">
          {stats.map((s) => (
            <div key={s.label} className="text-center">
              <p className="text-3xl font-extrabold text-gray-900 mb-1">{s.value}</p>
              <p className="text-sm text-gray-500">{s.label}</p>
            </div>
          ))}
        </div>
      </section>

      {/* ── Features ── */}
      <section className="py-24 bg-gray-50">
        <div className="max-w-7xl mx-auto px-6">
          <div className="text-center mb-14">
            <p className="text-sm font-semibold uppercase tracking-wider mb-3" style={{ color: '#22c55e' }}>Everything in one place</p>
            <h2 className="text-4xl font-bold text-gray-900 mb-4">Built for modern HR teams</h2>
            <p className="text-gray-500 max-w-xl mx-auto text-lg">From hire to retire — PayChamps handles every HR workflow so your team doesn't have to juggle tools.</p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {features.map((f) => (
              <div key={f.title} className="bg-white rounded-2xl p-6 border border-gray-100 hover:shadow-md transition-shadow">
                <div className={`w-11 h-11 rounded-xl flex items-center justify-center mb-4 ${f.color}`}>
                  <f.icon size={20} />
                </div>
                <h3 className="text-base font-semibold text-gray-900 mb-2">{f.title}</h3>
                <p className="text-sm text-gray-500 leading-relaxed">{f.description}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── Why PayChamps ── */}
      <section className="py-24">
        <div className="max-w-7xl mx-auto px-6 grid md:grid-cols-2 gap-16 items-center">
          {/* Left: text */}
          <div>
            <p className="text-sm font-semibold uppercase tracking-wider mb-3" style={{ color: '#22c55e' }}>Why PayChamps</p>
            <h2 className="text-4xl font-bold text-gray-900 mb-6 leading-snug">
              The only HR platform your team will actually use
            </h2>
            <p className="text-gray-500 mb-8 leading-relaxed">
              Most HR software is built for admins. PayChamps is built for everyone — clean interfaces for employees, powerful tools for HR, and real-time insights for leadership.
            </p>
            <div className="space-y-4">
              {[
                { icon: Zap, text: 'Set up in minutes, not months' },
                { icon: Globe, text: 'Multi-state payroll & tax compliance' },
                { icon: Lock, text: 'Enterprise-grade security & compliance' },
                { icon: Users, text: 'Self-service portal for employees' },
              ].map(({ icon: Icon, text }) => (
                <div key={text} className="flex items-center gap-3">
                  <div className="w-8 h-8 rounded-lg bg-green-50 flex items-center justify-center flex-shrink-0">
                    <Icon size={15} style={{ color: '#22c55e' }} />
                  </div>
                  <span className="text-sm text-gray-700">{text}</span>
                </div>
              ))}
            </div>
          </div>

          {/* Right: visual card stack */}
          <div className="relative h-80 hidden md:block">
            <div className="absolute top-0 right-0 w-72 bg-white rounded-2xl border border-gray-100 shadow-xl p-5">
              <p className="text-xs text-gray-400 mb-1">Monthly payroll</p>
              <p className="text-2xl font-bold text-gray-900 mb-3">$94,200</p>
              <div className="flex items-center gap-2">
                <span className="text-xs px-2 py-0.5 rounded-full bg-green-50 text-green-600 border border-green-200">Approved ✓</span>
                <span className="text-xs text-gray-400">40 employees paid</span>
              </div>
            </div>
            <div className="absolute top-24 left-0 w-64 bg-white rounded-2xl border border-gray-100 shadow-lg p-5">
              <p className="text-xs text-gray-400 mb-2">Leave requests</p>
              {['Annual leave · 5 days', 'Sick leave · 2 days', 'Maternity · 90 days'].map((item, i) => (
                <div key={item} className="flex items-center justify-between py-1.5 text-xs">
                  <span className="text-gray-700">{item}</span>
                  <span className={`px-2 py-0.5 rounded-full border ${i === 0 ? 'bg-green-50 text-green-600 border-green-200' : i === 1 ? 'bg-amber-50 text-amber-600 border-amber-200' : 'bg-blue-50 text-blue-600 border-blue-200'}`}>
                    {i === 0 ? 'Approved' : i === 1 ? 'Pending' : 'Active'}
                  </span>
                </div>
              ))}
            </div>
            <div className="absolute bottom-0 right-8 w-60 bg-white rounded-2xl border border-gray-100 shadow-lg p-5">
              <p className="text-xs text-gray-400 mb-2">Team attendance today</p>
              <div className="flex items-end gap-1.5 h-14">
                {[70, 90, 60, 85, 75].map((h, i) => (
                  <div key={i} className="flex-1 rounded-sm" style={{ height: `${h}%`, backgroundColor: '#22c55e', opacity: 0.7 + i * 0.05 }} />
                ))}
              </div>
              <p className="text-xs text-gray-500 mt-2">92% on time this week</p>
            </div>
          </div>
        </div>
      </section>

      {/* ── Early access ── */}
      <section className="py-24 bg-gray-50">
        <div className="max-w-3xl mx-auto px-6 text-center">
          <p className="text-sm font-semibold uppercase tracking-wider mb-3" style={{ color: '#22c55e' }}>
            Early access
          </p>
          <h2 className="text-4xl font-bold text-gray-900 mb-4">
            Be among the first
          </h2>
          <p className="text-lg text-gray-500 max-w-xl mx-auto mb-8 leading-relaxed">
            PayChamps is rolling out to early customers now. Get full access, hands-on onboarding from our team, and a seat at the table as we build.
          </p>
          <button
            onClick={() => navigate('/get-started')}
            className="inline-flex items-center gap-2 px-6 py-3 text-sm font-semibold text-white rounded-xl shadow-lg transition-all hover:scale-105"
            style={{ backgroundColor: '#22c55e' }}
          >
            Request early access
            <ArrowRight size={16} />
          </button>
        </div>
      </section>

      {/* ── CTA ── */}
      <section className="py-24" style={{ background: 'linear-gradient(135deg, #0d1b2a 0%, #1a3a2a 100%)' }}>
        <div className="max-w-3xl mx-auto px-6 text-center">
          <h2 className="text-4xl font-bold text-white mb-4">Ready to simplify your HR?</h2>
          <p className="text-gray-300 mb-8 text-lg">Join thousands of companies that run their HR on PayChamps. No setup fees, no long contracts.</p>
          <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
            <button
              onClick={() => navigate('/get-started')}
              className="flex items-center gap-2 px-8 py-3.5 text-sm font-semibold text-white rounded-xl shadow-lg hover:scale-105 transition-all"
              style={{ backgroundColor: '#22c55e' }}
            >
              Get started for free
              <ArrowRight size={16} />
            </button>
            <button
              onClick={() => navigate('/pricing')}
              className="px-8 py-3.5 text-sm font-semibold text-white rounded-xl border border-white/20 hover:bg-white/10 transition-colors"
            >
              See pricing
            </button>
          </div>
        </div>
      </section>
    </MarketingShell>
  )
}
