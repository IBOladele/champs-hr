import { CheckCircle2, X, ArrowRight } from 'lucide-react'
import { useNavigate } from 'react-router-dom'
import { usePageTitle } from '../../hooks/usePageTitle'
import MarketingShell from '../../components/MarketingShell'

const rows = [
  { feature: 'Contract length', paychamps: 'Month-to-month', rippling: 'Annual contract' },
  { feature: 'US payroll support', paychamps: 'Full US payroll + tax filing', rippling: 'Yes, via Rippling Payroll' },
  { feature: 'Multi-currency', paychamps: 'Yes, 150+ currencies', rippling: 'Yes, additional modules' },
  { feature: 'Dedicated account manager', paychamps: 'Growth & Enterprise plans', rippling: 'Enterprise only' },
  { feature: 'Data residency', paychamps: 'US data residency', rippling: 'US-primary' },
  { feature: 'Employee self-service', paychamps: 'Included on all plans', rippling: 'Included' },
  { feature: 'Benefits administration', paychamps: 'Full admin + employee portal', rippling: 'Full (US-focused)' },
  { feature: 'Time to go live', paychamps: '2 weeks', rippling: '4–6 weeks' },
]

const reasons = [
  {
    title: 'Built for US payroll',
    description: 'PayChamps was built from the ground up for US payroll — federal, state, and local tax, W-2s, 1099s, and direct deposit are first-class features, not bolted on.',
  },
  {
    title: 'No modular pricing complexity',
    description: 'Rippling charges per module — each feature you add costs more. PayChamps tiers are clear and all-inclusive. No surprises when your team needs a new feature.',
  },
  {
    title: 'Month-to-month contracts',
    description: 'Rippling typically requires annual commitments. PayChamps is month-to-month — if it\'s not working for you, you\'re not stuck.',
  },
]

export default function CompareRippling() {
  usePageTitle('PayChamps vs Rippling')
  const navigate = useNavigate()

  return (
    <MarketingShell>
      {/* Hero */}
      <section className="py-20 bg-gray-50">
        <div className="max-w-3xl mx-auto px-6 text-center">
          <p className="text-sm font-semibold uppercase tracking-wider mb-3" style={{ color: '#22c55e' }}>
            PayChamps vs Rippling
          </p>
          <h1 className="text-4xl font-extrabold text-gray-900 mb-4">
            Why US teams choose PayChamps over Rippling
          </h1>
          <p className="text-lg text-gray-500">
            Rippling is a powerful all-in-one platform. But for US teams who want simple payroll pricing and a fast setup without annual contracts, PayChamps is the better fit.
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
                  <th className="text-center py-4 px-4 text-gray-500 font-medium">Rippling</th>
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
                    <td className="py-3.5 px-4 text-center text-gray-500">{row.rippling}</td>
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
            <h2 className="text-3xl font-bold text-gray-900">Where PayChamps wins</h2>
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

      {/* Fair note */}
      <section className="py-12">
        <div className="max-w-3xl mx-auto px-6">
          <div className="bg-gray-50 rounded-2xl border border-gray-100 p-8">
            <div className="flex items-start gap-3">
              <X size={18} className="text-gray-300 mt-0.5 flex-shrink-0" />
              <div>
                <p className="text-sm font-semibold text-gray-900 mb-1">Where Rippling is stronger</p>
                <p className="text-sm text-gray-500 leading-relaxed">
                  If you need deep IT management, device management, or a fully unified HRIS alongside payroll, Rippling's all-in-one approach is hard to beat. PayChamps focuses on US payroll and HR — we do fewer things and do them better for growing US teams.
                </p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="py-20" style={{ background: 'linear-gradient(135deg, #0d1b2a 0%, #1a3a2a 100%)' }}>
        <div className="max-w-2xl mx-auto px-6 text-center">
          <h2 className="text-3xl font-bold text-white mb-4">Switch from Rippling in 2 weeks</h2>
          <p className="text-gray-300 mb-8">
            Our migration team knows Rippling's export format. We'll have you fully live on PayChamps before your next payroll run.
          </p>
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
