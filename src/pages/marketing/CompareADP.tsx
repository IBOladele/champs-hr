import { CheckCircle2, X, ArrowRight } from 'lucide-react'
import { useNavigate } from 'react-router-dom'
import { usePageTitle } from '../../hooks/usePageTitle'
import MarketingShell from '../../components/MarketingShell'

const rows = [
  { feature: 'Pricing model', paychamps: 'From £6/emp/mo', adp: 'Custom/opaque pricing' },
  { feature: 'Contract length', paychamps: 'Month-to-month', adp: '12-24 month contracts' },
  { feature: 'UK payroll support', paychamps: 'Native UK payroll + RTI', adp: 'Yes, complex setup' },
  { feature: 'Multi-currency', paychamps: 'Yes, 150+ currencies', adp: 'Yes, extra cost' },
  { feature: 'Dedicated account manager', paychamps: 'Growth & Enterprise plans', adp: 'Yes, add-on cost' },
  { feature: 'Data residency', paychamps: 'EU/UK data residency', adp: 'US/EU' },
  { feature: 'Employee self-service', paychamps: 'Included on all plans', adp: 'Yes, add-on' },
  { feature: 'Benefits administration', paychamps: 'Full admin + employee portal', adp: 'Full' },
  { feature: 'Time to go live', paychamps: '2 weeks', adp: '8-12 weeks' },
]

const reasons = [
  {
    title: 'No long-term contracts',
    description: 'ADP typically requires 12–24 month contracts with steep cancellation penalties. PayChamps is month-to-month. Cancel any time, no questions asked.',
  },
  {
    title: 'Transparent pricing',
    description: 'ADP pricing is notoriously opaque — quotes vary widely, and add-ons accumulate quickly. PayChamps publishes one clear rate per employee with no hidden line items.',
  },
  {
    title: 'Setup in 2 weeks, not 2 months',
    description: 'ADP implementations typically take 8–12 weeks and require a dedicated project manager. PayChamps has you live in 2 weeks with a guided migration process.',
  },
]

export default function CompareADP() {
  usePageTitle('PayChamps vs ADP')
  const navigate = useNavigate()

  return (
    <MarketingShell>
      {/* Hero */}
      <section className="py-20 bg-gray-50">
        <div className="max-w-3xl mx-auto px-6 text-center">
          <p className="text-sm font-semibold uppercase tracking-wider mb-3" style={{ color: '#22c55e' }}>
            PayChamps vs ADP
          </p>
          <h1 className="text-4xl font-extrabold text-gray-900 mb-4">
            Why companies leave ADP for PayChamps
          </h1>
          <p className="text-lg text-gray-500">
            ADP is enterprise payroll infrastructure from the 1990s. PayChamps is what your team actually wants to use in 2026.
          </p>
        </div>
      </section>

      {/* Key callouts */}
      <section className="py-10">
        <div className="max-w-4xl mx-auto px-6 grid grid-cols-1 md:grid-cols-3 gap-4">
          {[
            { label: 'ADP contract length', value: '12–24 months', bad: true },
            { label: 'ADP setup time', value: '8–12 weeks', bad: true },
            { label: 'ADP pricing', value: 'Custom / opaque', bad: true },
          ].map((item) => (
            <div key={item.label} className="bg-red-50 border border-red-100 rounded-xl p-4 text-center">
              <p className="text-xs text-red-400 mb-1">{item.label}</p>
              <p className="text-lg font-bold text-red-700">{item.value}</p>
            </div>
          ))}
        </div>
        <div className="max-w-4xl mx-auto px-6 grid grid-cols-1 md:grid-cols-3 gap-4 mt-4">
          {[
            { label: 'PayChamps contract', value: 'Month-to-month' },
            { label: 'PayChamps setup', value: '2 weeks' },
            { label: 'PayChamps pricing', value: 'From £6/emp/mo' },
          ].map((item) => (
            <div key={item.label} className="bg-green-50 border border-green-100 rounded-xl p-4 text-center">
              <p className="text-xs text-green-600 mb-1">{item.label}</p>
              <p className="text-lg font-bold text-green-800">{item.value}</p>
            </div>
          ))}
        </div>
      </section>

      {/* Comparison table */}
      <section className="py-12">
        <div className="max-w-4xl mx-auto px-6">
          <div className="overflow-x-auto rounded-2xl border border-gray-100 bg-white shadow-sm">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-gray-100">
                  <th className="text-left py-4 px-6 text-gray-500 font-medium w-1/3">Feature</th>
                  <th className="text-center py-4 px-4 font-semibold" style={{ color: '#22c55e' }}>PayChamps</th>
                  <th className="text-center py-4 px-4 text-gray-500 font-medium">ADP</th>
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
                    <td className="py-3.5 px-4 text-center text-gray-500">{row.adp}</td>
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
            <h2 className="text-3xl font-bold text-gray-900">Why companies make the switch</h2>
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
                <p className="text-sm font-semibold text-gray-900 mb-1">Fair comparison note</p>
                <p className="text-sm text-gray-500 leading-relaxed">
                  ADP is a mature, capable product used by large enterprises. For companies with complex multi-country payroll or deep HR needs, ADP may be appropriate. PayChamps is a better fit for growing UK businesses that want speed, transparency, and a modern experience without the enterprise overhead.
                </p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="py-20" style={{ background: 'linear-gradient(135deg, #0d1b2a 0%, #1a3a2a 100%)' }}>
        <div className="max-w-2xl mx-auto px-6 text-center">
          <h2 className="text-3xl font-bold text-white mb-4">Ready to escape the ADP contract?</h2>
          <p className="text-gray-300 mb-8">
            We handle the migration from ADP. Our team knows the export formats and can have you live in 2 weeks.
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
