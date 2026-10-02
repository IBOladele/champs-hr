import { CheckCircle2, X, ArrowRight } from 'lucide-react'
import { useNavigate } from 'react-router-dom'
import { usePageTitle } from '../../hooks/usePageTitle'
import MarketingShell from '../../components/MarketingShell'

const rows = [
  { feature: 'Contract length', paychamps: 'Month-to-month', gusto: 'Month-to-month' },
  { feature: 'Transparent pricing', paychamps: 'Per-employee, no base fee', gusto: 'Base fee + per-employee' },
  { feature: 'Multi-currency', paychamps: 'Yes, 150+ currencies', gusto: 'USD only' },
  { feature: 'Dedicated account manager', paychamps: 'Growth & Enterprise plans', gusto: 'Add-on cost' },
  { feature: 'Data residency', paychamps: 'US data residency', gusto: 'US data only' },
  { feature: 'Employee self-service', paychamps: 'Included on all plans', gusto: 'Included' },
  { feature: 'Benefits administration', paychamps: 'Full admin + employee portal', gusto: 'Admin only' },
  { feature: 'Time to go live', paychamps: '2 weeks', gusto: '2–4 weeks' },
]

const reasons = [
  {
    title: 'Built for US payroll',
    description: 'PayChamps was built for US payroll from the ground up — federal + state tax filing, W-2s, 1099s, and 401(k) enrollment are first-class features.',
  },
  {
    title: 'Multi-currency from day one',
    description: 'Pay employees in 150+ currencies. Whether your team is in New York, Lagos, or Lisbon, PayChamps handles it without add-ons.',
  },
  {
    title: 'Transparent pricing',
    description: 'No base platform fee layered on top of per-employee costs. PayChamps charges one simple rate per employee, per month.',
  },
]

export default function CompareGusto() {
  usePageTitle('PayChamps vs Gusto')
  const navigate = useNavigate()

  return (
    <MarketingShell>
      {/* Hero */}
      <section className="py-20 bg-gray-50">
        <div className="max-w-3xl mx-auto px-6 text-center">
          <p className="text-sm font-semibold uppercase tracking-wider mb-3" style={{ color: '#22c55e' }}>
            PayChamps vs Gusto
          </p>
          <h1 className="text-4xl font-extrabold text-gray-900 mb-4">
            Why teams switch from Gusto to PayChamps
          </h1>
          <p className="text-lg text-gray-500">
            Gusto is a solid product, but its base fee and per-employee cost add up fast. PayChamps is built for US payroll with transparent per-employee pricing and no hidden platform charges.
          </p>
        </div>
      </section>

      {/* Comparison table */}
      <section className="py-16">
        <div className="max-w-4xl mx-auto px-6">
          <div className="overflow-x-auto rounded-2xl border border-gray-100 bg-white shadow-sm">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-gray-100">
                  <th className="text-left py-4 px-6 text-gray-500 font-medium w-1/3">Feature</th>
                  <th className="text-center py-4 px-4 font-semibold" style={{ color: '#22c55e' }}>PayChamps</th>
                  <th className="text-center py-4 px-4 text-gray-500 font-medium">Gusto</th>
                </tr>
              </thead>
              <tbody>
                {rows.map((row, i) => (
                  <tr key={row.feature} className={i % 2 === 0 ? 'bg-white' : 'bg-gray-50'}>
                    <td className="py-3.5 px-6 text-gray-700 font-medium">{row.feature}</td>
                    <td className="py-3.5 px-4 text-center">
                      <span className="inline-flex items-center gap-1.5 text-green-700 font-medium">
                        <CheckCircle2 size={14} style={{ color: '#22c55e' }} />
                        {row.paychamps}
                      </span>
                    </td>
                    <td className="py-3.5 px-4 text-center text-gray-500">{row.gusto}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </section>

      {/* Why switch */}
      <section className="py-16 bg-gray-50">
        <div className="max-w-5xl mx-auto px-6">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-bold text-gray-900">Why switch?</h2>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {reasons.map((r) => (
              <div key={r.title} className="bg-white rounded-2xl border border-gray-100 p-6 shadow-sm">
                <CheckCircle2 size={22} className="mb-4" style={{ color: '#22c55e' }} />
                <h3 className="text-base font-semibold text-gray-900 mb-2">{r.title}</h3>
                <p className="text-sm text-gray-500 leading-relaxed">{r.description}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Not a knock */}
      <section className="py-12">
        <div className="max-w-3xl mx-auto px-6">
          <div className="bg-gray-50 rounded-2xl border border-gray-100 p-8">
            <div className="flex items-start gap-3">
              <X size={18} className="text-gray-300 mt-0.5 flex-shrink-0" />
              <div>
                <p className="text-sm font-semibold text-gray-900 mb-1">Not a knock on Gusto</p>
                <p className="text-sm text-gray-500 leading-relaxed">
                  Gusto is a genuinely good product for US-based companies. If their pricing model works for your headcount and you don't need multi-currency support, Gusto may serve you well. PayChamps is a better fit for growing US businesses that want transparent per-employee pricing with no base fee.
                </p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="py-20" style={{ background: 'linear-gradient(135deg, #0d1b2a 0%, #1a3a2a 100%)' }}>
        <div className="max-w-2xl mx-auto px-6 text-center">
          <h2 className="text-3xl font-bold text-white mb-4">Make the switch in 2 weeks</h2>
          <p className="text-gray-300 mb-8">Our migration team handles the data export from Gusto. You'll be live on PayChamps before your next payroll run.</p>
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
