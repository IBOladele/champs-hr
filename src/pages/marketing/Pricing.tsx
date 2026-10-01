import { useState } from 'react'
import { CheckCircle2, ChevronDown, ChevronUp, ArrowRight } from 'lucide-react'
import { useNavigate } from 'react-router-dom'
import { usePageTitle } from '../../hooks/usePageTitle'
import MarketingShell from '../../components/MarketingShell'

const tiers = [
  {
    name: 'Starter',
    price: '£6',
    unit: '/employee/month',
    description: 'Up to 50 employees',
    features: [
      'Payroll',
      'Leave management',
      'Attendance',
      'Basic reporting',
      'Employee self-service',
      'Email support',
    ],
    cta: 'Get started free',
    highlight: false,
  },
  {
    name: 'Growth',
    price: '£10',
    unit: '/employee/month',
    description: '50–200 employees',
    features: [
      'Everything in Starter',
      'Benefits administration',
      'Advanced analytics',
      'Priority support',
      'API access',
      'Multi-currency payroll',
    ],
    cta: 'Get started free',
    highlight: true,
  },
  {
    name: 'Enterprise',
    price: 'Custom',
    unit: '',
    description: '200+ employees',
    features: [
      'Everything in Growth',
      'Dedicated account manager',
      'Custom integrations',
      'SLA guarantee',
      'On-site onboarding',
      'Data residency options',
    ],
    cta: 'Talk to sales',
    highlight: false,
  },
]

const comparisonRows = [
  { feature: 'Payroll runs', starter: true, growth: true, enterprise: true },
  { feature: 'Leave management', starter: true, growth: true, enterprise: true },
  { feature: 'Attendance tracking', starter: true, growth: true, enterprise: true },
  { feature: 'Employee self-service', starter: true, growth: true, enterprise: true },
  { feature: 'Basic reporting', starter: true, growth: true, enterprise: true },
  { feature: 'Benefits administration', starter: false, growth: true, enterprise: true },
  { feature: 'Advanced analytics', starter: false, growth: true, enterprise: true },
  { feature: 'API access', starter: false, growth: true, enterprise: true },
  { feature: 'Multi-currency payroll', starter: false, growth: true, enterprise: true },
  { feature: 'Priority support', starter: false, growth: true, enterprise: true },
  { feature: 'Dedicated account manager', starter: false, growth: false, enterprise: true },
  { feature: 'Custom integrations', starter: false, growth: false, enterprise: true },
  { feature: 'SLA guarantee', starter: false, growth: false, enterprise: true },
  { feature: 'On-site onboarding', starter: false, growth: false, enterprise: true },
  { feature: 'Data residency options', starter: false, growth: false, enterprise: true },
]

const faqs = [
  {
    q: 'Is there a setup fee?',
    a: 'No. There are no setup fees, implementation fees, or hidden charges. You pay only your monthly per-employee rate.',
  },
  {
    q: 'Can I change plans?',
    a: 'Yes. You can upgrade or downgrade your plan at any time. Changes take effect at the start of your next billing cycle.',
  },
  {
    q: 'How does billing work?',
    a: 'You\'re billed monthly based on the number of active employees on your account at the end of the billing period. No long-term commitment required.',
  },
  {
    q: 'Is there a free trial?',
    a: 'Yes — all plans include a 30-day free trial. No credit card required to start. You only pay when you\'re ready to go live.',
  },
  {
    q: 'What\'s in the contract?',
    a: 'Nothing you wouldn\'t expect. We use a simple month-to-month agreement. No lock-in, no auto-renewing annual contracts. Cancel any time.',
  },
  {
    q: 'Can I pay annually?',
    a: 'Yes. Annual billing is available at a 15% discount. Contact our team to set it up.',
  },
]

export default function Pricing() {
  usePageTitle('Pricing')
  const navigate = useNavigate()
  const [openFaq, setOpenFaq] = useState<number | null>(null)

  return (
    <MarketingShell>
      {/* Hero */}
      <section className="py-20 bg-gray-50">
        <div className="max-w-3xl mx-auto px-6 text-center">
          <p className="text-sm font-semibold uppercase tracking-wider mb-3" style={{ color: '#22c55e' }}>Pricing</p>
          <h1 className="text-5xl font-extrabold text-gray-900 mb-4">Simple, transparent pricing</h1>
          <p className="text-lg text-gray-500">Pay per employee, per month. No setup fees, no lock-in, no surprises.</p>
        </div>
      </section>

      {/* Pricing cards */}
      <section className="py-16">
        <div className="max-w-6xl mx-auto px-6 grid grid-cols-1 md:grid-cols-3 gap-6">
          {tiers.map((tier) => (
            <div
              key={tier.name}
              className={`rounded-2xl p-8 border ${
                tier.highlight
                  ? 'border-transparent shadow-xl'
                  : 'border-gray-100 bg-white'
              }`}
              style={tier.highlight ? { background: '#0d1b2a', color: 'white' } : {}}
            >
              <p
                className={`text-xs font-semibold uppercase tracking-wider mb-2 ${
                  tier.highlight ? 'text-green-400' : ''
                }`}
                style={!tier.highlight ? { color: '#22c55e' } : {}}
              >
                {tier.name}
              </p>
              <div className="flex items-baseline gap-1 mb-1">
                <span className={`text-4xl font-extrabold ${tier.highlight ? 'text-white' : 'text-gray-900'}`}>
                  {tier.price}
                </span>
                {tier.unit && (
                  <span className={`text-sm ${tier.highlight ? 'text-gray-300' : 'text-gray-500'}`}>
                    {tier.unit}
                  </span>
                )}
              </div>
              <p className={`text-sm mb-6 ${tier.highlight ? 'text-gray-300' : 'text-gray-500'}`}>
                {tier.description}
              </p>
              <button
                onClick={() => navigate(tier.cta === 'Talk to sales' ? '/get-started' : '/get-started')}
                className={`w-full py-2.5 rounded-xl text-sm font-semibold mb-6 transition-all ${
                  tier.highlight
                    ? 'text-gray-900 hover:opacity-90'
                    : 'text-white hover:opacity-90'
                }`}
                style={tier.highlight ? { backgroundColor: '#22c55e' } : { backgroundColor: '#0d1b2a' }}
              >
                {tier.cta}
              </button>
              <ul className="space-y-3">
                {tier.features.map((f) => (
                  <li key={f} className="flex items-center gap-2 text-sm">
                    <CheckCircle2
                      size={15}
                      style={{ color: tier.highlight ? '#22c55e' : '#22c55e', flexShrink: 0 }}
                    />
                    <span className={tier.highlight ? 'text-gray-200' : 'text-gray-600'}>{f}</span>
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>
      </section>

      {/* Comparison table */}
      <section className="py-16 bg-gray-50">
        <div className="max-w-5xl mx-auto px-6">
          <h2 className="text-3xl font-bold text-gray-900 text-center mb-10">Full feature comparison</h2>
          <div className="overflow-x-auto rounded-2xl border border-gray-100 bg-white">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-gray-100">
                  <th className="text-left py-4 px-6 text-gray-500 font-medium w-1/2">Feature</th>
                  <th className="text-center py-4 px-4 text-gray-900 font-semibold">Starter</th>
                  <th className="text-center py-4 px-4 font-semibold" style={{ color: '#22c55e' }}>Growth</th>
                  <th className="text-center py-4 px-4 text-gray-900 font-semibold">Enterprise</th>
                </tr>
              </thead>
              <tbody>
                {comparisonRows.map((row, i) => (
                  <tr key={row.feature} className={i % 2 === 0 ? 'bg-white' : 'bg-gray-50'}>
                    <td className="py-3 px-6 text-gray-700">{row.feature}</td>
                    <td className="py-3 px-4 text-center">
                      {row.starter ? <CheckCircle2 size={16} className="mx-auto" style={{ color: '#22c55e' }} /> : <span className="text-gray-300">—</span>}
                    </td>
                    <td className="py-3 px-4 text-center">
                      {row.growth ? <CheckCircle2 size={16} className="mx-auto" style={{ color: '#22c55e' }} /> : <span className="text-gray-300">—</span>}
                    </td>
                    <td className="py-3 px-4 text-center">
                      {row.enterprise ? <CheckCircle2 size={16} className="mx-auto" style={{ color: '#22c55e' }} /> : <span className="text-gray-300">—</span>}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </section>

      {/* FAQ */}
      <section className="py-16">
        <div className="max-w-3xl mx-auto px-6">
          <h2 className="text-3xl font-bold text-gray-900 text-center mb-10">Frequently asked questions</h2>
          <div className="space-y-3">
            {faqs.map((faq, i) => (
              <div key={i} className="border border-gray-100 rounded-xl overflow-hidden bg-white">
                <button
                  className="w-full flex items-center justify-between px-6 py-4 text-left"
                  onClick={() => setOpenFaq(openFaq === i ? null : i)}
                >
                  <span className="text-sm font-semibold text-gray-900">{faq.q}</span>
                  {openFaq === i ? (
                    <ChevronUp size={16} className="text-gray-400 flex-shrink-0" />
                  ) : (
                    <ChevronDown size={16} className="text-gray-400 flex-shrink-0" />
                  )}
                </button>
                {openFaq === i && (
                  <div className="px-6 pb-4 text-sm text-gray-500 leading-relaxed">{faq.a}</div>
                )}
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="py-20" style={{ background: 'linear-gradient(135deg, #0d1b2a 0%, #1a3a2a 100%)' }}>
        <div className="max-w-2xl mx-auto px-6 text-center">
          <h2 className="text-3xl font-bold text-white mb-4">Start your free trial today</h2>
          <p className="text-gray-300 mb-8">No credit card required. 30-day trial on any plan.</p>
          <button
            onClick={() => navigate('/get-started')}
            className="inline-flex items-center gap-2 px-8 py-3.5 text-sm font-semibold text-white rounded-xl shadow-lg hover:scale-105 transition-all"
            style={{ backgroundColor: '#22c55e' }}
          >
            Get started free
            <ArrowRight size={16} />
          </button>
        </div>
      </section>
    </MarketingShell>
  )
}
