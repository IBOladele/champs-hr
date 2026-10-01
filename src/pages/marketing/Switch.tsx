import { ArrowRight, CheckCircle2, Users, Upload, Zap } from 'lucide-react'
import { useNavigate } from 'react-router-dom'
import { usePageTitle } from '../../hooks/usePageTitle'
import MarketingShell from '../../components/MarketingShell'

const steps = [
  {
    number: '01',
    icon: Upload,
    title: 'Data export',
    description: 'We handle the extraction from your current system. Our team works with your existing provider to pull employee records, payroll history, and documents — so you don\'t have to.',
  },
  {
    number: '02',
    icon: CheckCircle2,
    title: 'Payroll history import',
    description: 'Mid-year transitions are fully supported. We import historical payroll data so your year-to-date figures stay accurate from day one. No manual re-entry required.',
  },
  {
    number: '03',
    icon: Users,
    title: 'Employee self-service setup',
    description: 'Each employee gets an activation link and a guided onboarding flow. They update their own details, verify their information, and are ready within hours.',
  },
  {
    number: '04',
    icon: Zap,
    title: 'Go live',
    description: 'Your first PayChamps payroll run is supported by your dedicated migration specialist. We stay on the call until everything is confirmed and your team is confident.',
  },
]

const guarantees = [
  {
    title: 'Dedicated onboarding specialist',
    description: 'A named expert manages your entire migration from start to finish. Same person, every call.',
  },
  {
    title: 'No data loss guarantee',
    description: 'Your data is validated at every stage. If anything is missing or incorrect, we fix it before go-live — not after.',
  },
  {
    title: 'Free parallel run during transition',
    description: 'Run your old system and PayChamps side by side for one full payroll cycle at no extra cost. Verify everything matches before you cut over.',
  },
]

export default function Switch() {
  usePageTitle('Switch to PayChamps')
  const navigate = useNavigate()

  return (
    <MarketingShell>
      {/* Hero */}
      <section
        className="py-24 text-center"
        style={{ background: 'linear-gradient(135deg, #0d1b2a 0%, #1a3a2a 100%)' }}
      >
        <div className="max-w-3xl mx-auto px-6">
          <p
            className="text-sm font-semibold uppercase tracking-wider mb-4"
            style={{ color: '#22c55e' }}
          >
            Migration
          </p>
          <h1 className="text-5xl font-extrabold text-white mb-6 leading-tight">
            Switch from your current HR software{' '}
            <span style={{ color: '#22c55e' }}>in 2 weeks</span>
          </h1>
          <p className="text-lg text-gray-300 mb-8 leading-relaxed">
            Currently on ADP? Gusto? Rippling? We've done it before. Our migration team handles the heavy lifting so your team can stay focused on what matters.
          </p>
          <button
            onClick={() => navigate('/get-started')}
            className="inline-flex items-center gap-2 px-8 py-3.5 text-sm font-semibold text-white rounded-xl shadow-lg hover:scale-105 transition-all"
            style={{ backgroundColor: '#22c55e' }}
          >
            Book a migration call
            <ArrowRight size={16} />
          </button>
        </div>
      </section>

      {/* Migration steps */}
      <section className="py-20">
        <div className="max-w-5xl mx-auto px-6">
          <div className="text-center mb-14">
            <p className="text-sm font-semibold uppercase tracking-wider mb-3" style={{ color: '#22c55e' }}>How it works</p>
            <h2 className="text-3xl font-bold text-gray-900">4 steps to your new HR platform</h2>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {steps.map((step) => (
              <div key={step.number} className="bg-white rounded-2xl border border-gray-100 p-6 hover:shadow-md transition-shadow">
                <div className="flex items-center gap-3 mb-4">
                  <span className="text-2xl font-extrabold" style={{ color: '#22c55e' }}>{step.number}</span>
                  <div className="w-10 h-10 rounded-xl bg-green-50 flex items-center justify-center">
                    <step.icon size={18} style={{ color: '#22c55e' }} />
                  </div>
                </div>
                <h3 className="text-base font-semibold text-gray-900 mb-2">{step.title}</h3>
                <p className="text-sm text-gray-500 leading-relaxed">{step.description}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Guarantees */}
      <section className="py-20 bg-gray-50">
        <div className="max-w-5xl mx-auto px-6">
          <div className="text-center mb-14">
            <p className="text-sm font-semibold uppercase tracking-wider mb-3" style={{ color: '#22c55e' }}>Our promise</p>
            <h2 className="text-3xl font-bold text-gray-900">3 guarantees every migration comes with</h2>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {guarantees.map((g) => (
              <div key={g.title} className="bg-white rounded-2xl border border-gray-100 p-6 shadow-sm">
                <CheckCircle2 size={24} className="mb-4" style={{ color: '#22c55e' }} />
                <h3 className="text-base font-semibold text-gray-900 mb-2">{g.title}</h3>
                <p className="text-sm text-gray-500 leading-relaxed">{g.description}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Prior migrations callout */}
      <section className="py-16">
        <div className="max-w-3xl mx-auto px-6 text-center">
          <h2 className="text-2xl font-bold text-gray-900 mb-4">We've migrated from them all</h2>
          <p className="text-gray-500 mb-8">
            Our team has run migrations from ADP, Gusto, Rippling, BambooHR, Sage HR, Moorepay, and more. Whatever system you're on, we know the export format — and we know the pitfalls.
          </p>
          <div className="flex flex-wrap justify-center gap-3">
            {['ADP', 'Gusto', 'Rippling', 'BambooHR', 'Sage HR', 'Moorepay'].map((name) => (
              <span key={name} className="px-4 py-2 bg-gray-100 rounded-full text-sm text-gray-600 font-medium">
                {name}
              </span>
            ))}
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="py-20" style={{ background: 'linear-gradient(135deg, #0d1b2a 0%, #1a3a2a 100%)' }}>
        <div className="max-w-2xl mx-auto px-6 text-center">
          <h2 className="text-3xl font-bold text-white mb-4">Ready to make the switch?</h2>
          <p className="text-gray-300 mb-8">
            Book a 30-minute migration call. We'll assess your current setup and give you a concrete timeline.
          </p>
          <button
            onClick={() => navigate('/get-started')}
            className="inline-flex items-center gap-2 px-8 py-3.5 text-sm font-semibold text-white rounded-xl shadow-lg hover:scale-105 transition-all"
            style={{ backgroundColor: '#22c55e' }}
          >
            Book a migration call
            <ArrowRight size={16} />
          </button>
        </div>
      </section>
    </MarketingShell>
  )
}
