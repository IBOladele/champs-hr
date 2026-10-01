import { Shield, Lock, Server, Database, AlertCircle, FileCheck } from 'lucide-react'
import { usePageTitle } from '../../hooks/usePageTitle'
import MarketingShell from '../../components/MarketingShell'

const sections = [
  {
    icon: Lock,
    title: 'Data Encryption',
    color: 'bg-blue-50 text-blue-600',
    items: [
      'AES-256 encryption at rest for all stored data',
      'TLS 1.3 for all data in transit',
      'Encryption keys managed via AWS KMS',
      'Encrypted backups with automatic rotation',
    ],
  },
  {
    icon: Shield,
    title: 'Access Control',
    color: 'bg-green-50 text-green-600',
    items: [
      'Multi-factor authentication (MFA) on all accounts',
      'Role-based access control (RBAC)',
      'Single sign-on (SSO) via SAML 2.0 and OIDC',
      'Session management with automatic timeout',
    ],
  },
  {
    icon: Server,
    title: 'Infrastructure',
    color: 'bg-purple-50 text-purple-600',
    items: [
      'Hosted on AWS (eu-west-2 and eu-west-1 regions)',
      'SOC 2 Type II audit in progress',
      '99.9% uptime SLA with automated failover',
      'Daily penetration testing and vulnerability scans',
    ],
  },
  {
    icon: Database,
    title: 'Data Privacy',
    color: 'bg-amber-50 text-amber-600',
    items: [
      'UK GDPR and EU GDPR compliant',
      'EU/UK data residency options on Enterprise plans',
      'Data Processing Agreement (DPA) available on request',
      'Right to erasure and data portability supported',
    ],
  },
  {
    icon: AlertCircle,
    title: 'Incident Response',
    color: 'bg-rose-50 text-rose-600',
    items: [
      '24-hour disclosure SLA for security incidents',
      'Dedicated security team on call 24/7',
      'Automated alerting and anomaly detection',
      'Customers notified within 72 hours of a breach',
    ],
  },
  {
    icon: FileCheck,
    title: 'Compliance',
    color: 'bg-teal-50 text-teal-600',
    items: [
      'UK GDPR and Data Protection Act 2018',
      'PAYE compliance and RTI submissions to HMRC',
      'Auto-enrolment pension compliance',
      'IR35 and off-payroll working support',
    ],
  },
]

export default function Security() {
  usePageTitle('Security')

  return (
    <MarketingShell>
      {/* Hero */}
      <section
        className="py-24 text-center"
        style={{ background: 'linear-gradient(135deg, #0d1b2a 0%, #1a3a2a 100%)' }}
      >
        <div className="max-w-3xl mx-auto px-6">
          <div
            className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full border mb-8 text-xs font-medium"
            style={{ borderColor: '#22c55e33', color: '#22c55e', background: '#22c55e11' }}
          >
            <Shield size={12} />
            Security
          </div>
          <h1 className="text-5xl font-extrabold text-white mb-6 leading-tight">
            Enterprise-grade security,{' '}
            <span style={{ color: '#22c55e' }}>built in from day one</span>
          </h1>
          <p className="text-lg text-gray-300 leading-relaxed">
            Your payroll and HR data is some of the most sensitive information your business handles. We treat it that way.
          </p>
        </div>
      </section>

      {/* Security sections */}
      <section className="py-20">
        <div className="max-w-6xl mx-auto px-6 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {sections.map((s) => (
            <div key={s.title} className="bg-white rounded-2xl border border-gray-100 p-6 hover:shadow-md transition-shadow">
              <div className={`w-11 h-11 rounded-xl flex items-center justify-center mb-4 ${s.color}`}>
                <s.icon size={20} />
              </div>
              <h2 className="text-base font-semibold text-gray-900 mb-4">{s.title}</h2>
              <ul className="space-y-2">
                {s.items.map((item) => (
                  <li key={item} className="flex items-start gap-2 text-sm text-gray-500">
                    <span className="mt-1 w-1.5 h-1.5 rounded-full flex-shrink-0" style={{ backgroundColor: '#22c55e' }} />
                    {item}
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>
      </section>

      {/* Trust badges */}
      <section className="py-16 bg-gray-50">
        <div className="max-w-4xl mx-auto px-6 text-center">
          <h2 className="text-2xl font-bold text-gray-900 mb-3">Built for trust</h2>
          <p className="text-gray-500 mb-12">
            We follow industry-leading standards and best practices so you don't have to think about it.
          </p>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
            {['AWS Hosted', 'AES-256', 'TLS 1.3', 'UK GDPR'].map((badge) => (
              <div key={badge} className="bg-white rounded-xl border border-gray-100 p-5 text-center shadow-sm">
                <p className="text-sm font-semibold text-gray-900">{badge}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Contact CTA */}
      <section className="py-16">
        <div className="max-w-xl mx-auto px-6 text-center">
          <h2 className="text-2xl font-bold text-gray-900 mb-3">Have a security question?</h2>
          <p className="text-gray-500 mb-6">
            Our security team is available to answer questions, review your requirements, or provide documentation for vendor assessments.
          </p>
          <a
            href="mailto:security@paychamps.com"
            className="inline-flex items-center gap-2 px-6 py-3 text-sm font-semibold text-white rounded-xl transition-all hover:opacity-90"
            style={{ backgroundColor: '#22c55e' }}
          >
            Contact security team
          </a>
        </div>
      </section>
    </MarketingShell>
  )
}
