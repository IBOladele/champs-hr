import { useEffect, useRef } from 'react'
import { useNavigate } from 'react-router-dom'
import { usePageTitle } from '../hooks/usePageTitle'
import MarketingShell from '../components/MarketingShell'

const G = '#22c55e'
const HERO = '#0d1525'
const FG = '#0c1929'
const FG2 = '#4a5568'
const FG3 = '#94a3b8'
const BORDER = '#dde5ef'
const BG_ALT = '#f6f9fc'
const HBORDER = 'rgba(255,255,255,.09)'
const HSURF = 'rgba(255,255,255,.05)'
const HFG = '#ffffff'
const HFG2 = 'rgba(255,255,255,.6)'
const HFG3 = 'rgba(255,255,255,.3)'
const GREEN_P = '#fef3c7'
const GREEN_D = '#92400e'
const JAKARTA = "'Plus Jakarta Sans', system-ui, sans-serif"
const INTER = "'Inter', system-ui, sans-serif"

// ─── Pulse dot ────────────────────────────────────────────────────────────────
function PulseDot() {
  return (
    <span style={{ display: 'inline-block', width: 8, height: 8, borderRadius: '50%', background: G, position: 'relative' }}>
      <style>{`@keyframes cp-pulse{0%{opacity:.4;transform:scale(1)}100%{opacity:0;transform:scale(2.4)}}`}</style>
      <span style={{ position: 'absolute', inset: -4, borderRadius: '50%', background: G, opacity: 0, animation: 'cp-pulse 2s infinite' }} />
    </span>
  )
}

// ─── Hero dashboard mockup ────────────────────────────────────────────────────
function DashboardMockup() {
  const sidebar = [
    { label: 'Dashboard', active: true, icon: '⊞' },
    { label: 'Employees', icon: '👤' },
    { label: 'Payroll', icon: '📅' },
    { label: 'Attendance', icon: '⏱' },
    { label: 'Leave', icon: '📋' },
    { label: 'Documents', icon: '📄' },
  ]
  const barHeights = [58, 72, 50, 84, 68, 100]
  const barMonths = ['May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct']
  const employees = [
    { initials: 'JS', color: '#7c3aed', name: 'John S.', amt: '$4,200' },
    { initials: 'SM', color: '#0891b2', name: 'Sarah M.', amt: '$3,800' },
    { initials: 'AL', color: '#16a34a', name: 'Alex L.', amt: '$5,100' },
    { initials: 'RK', color: '#be185d', name: 'Riya K.', amt: '$4,650' },
  ]

  return (
    <div style={{ position: 'relative', maxWidth: 1040, margin: '0 auto' }}>
      {/* Glow */}
      <div style={{ position: 'absolute', bottom: -40, left: '50%', transform: 'translateX(-50%)', width: '80%', height: 120, background: 'radial-gradient(ellipse, rgba(217,119,6,.25), transparent 70%)', filter: 'blur(40px)', pointerEvents: 'none' }} />
      <div style={{
        background: '#0a1628',
        border: '1px solid rgba(255,255,255,.1)',
        borderRadius: '16px 16px 0 0',
        overflow: 'hidden',
        boxShadow: '0 -20px 80px rgba(0,0,0,.5), 0 0 0 1px rgba(255,255,255,.04)',
        transform: 'perspective(1000px) rotateX(2deg)',
      }}>
        {/* Browser chrome */}
        <div style={{ display: 'flex', alignItems: 'center', gap: 8, padding: '11px 16px', background: 'rgba(255,255,255,.03)', borderBottom: '1px solid rgba(255,255,255,.07)' }}>
          <div style={{ display: 'flex', gap: 5 }}>
            {['#ff5f57', '#ffbd2e', '#28c840'].map(c => <div key={c} style={{ width: 10, height: 10, borderRadius: '50%', background: c }} />)}
          </div>
          <div style={{ flex: 1, background: 'rgba(255,255,255,.05)', borderRadius: 6, padding: '4px 12px', fontSize: 11, color: 'rgba(255,255,255,.35)', maxWidth: 280, margin: '0 auto', textAlign: 'center', fontFamily: INTER }}>
            app.paychamps.com/dashboard
          </div>
          <div style={{ width: 24 }} />
        </div>

        {/* Body */}
        <div style={{ display: 'grid', gridTemplateColumns: '196px 1fr' }}>
          {/* Sidebar */}
          <div style={{ background: 'rgba(255,255,255,.02)', borderRight: '1px solid rgba(255,255,255,.06)', padding: '20px 12px', display: 'flex', flexDirection: 'column', gap: 2 }}>
            <div style={{ fontFamily: "'Space Grotesk', system-ui, sans-serif", fontWeight: 700, fontSize: 15, letterSpacing: '-.04em', color: HFG, padding: '0 10px 18px' }}>
              Pay<span style={{ color: G }}>C</span>hamps
            </div>
            {sidebar.map(item => (
              <div key={item.label} style={{
                display: 'flex', alignItems: 'center', gap: 10, padding: '9px 10px', borderRadius: 8,
                fontSize: 12, color: item.active ? G : 'rgba(255,255,255,.4)',
                background: item.active ? 'rgba(217,119,6,.12)' : 'transparent', fontFamily: INTER,
              }}>
                <span style={{ fontSize: 13, opacity: .8 }}>{item.icon}</span>
                {item.label}
              </div>
            ))}
          </div>

          {/* Main */}
          <div style={{ padding: '20px 22px', display: 'flex', flexDirection: 'column', gap: 16 }}>
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
              <div style={{ fontFamily: JAKARTA, fontSize: 14, fontWeight: 700, color: HFG }}>Dashboard</div>
              <div style={{ display: 'flex', alignItems: 'center', gap: 6, padding: '5px 10px', background: 'rgba(217,119,6,.1)', border: '1px solid rgba(217,119,6,.2)', borderRadius: 20, fontSize: 11, color: G, fontFamily: INTER }}>
                <PulseDot />
                Next payroll: Fri 8 Nov
              </div>
            </div>

            {/* Stat cards */}
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4,1fr)', gap: 10 }}>
              {[
                { v: '47', l: 'Employees', accent: false },
                { v: '$94.2K', l: 'Monthly payroll', accent: false },
                { v: '96%', l: 'Attendance today', accent: false },
                { v: '3', l: 'Leave pending', accent: true },
              ].map(s => (
                <div key={s.l} style={{
                  background: s.accent ? 'rgba(217,119,6,.06)' : 'rgba(255,255,255,.05)',
                  border: `1px solid ${s.accent ? 'rgba(217,119,6,.2)' : 'rgba(255,255,255,.07)'}`,
                  borderRadius: 10, padding: '12px 14px',
                }}>
                  <div style={{ fontFamily: JAKARTA, fontSize: 20, fontWeight: 800, color: s.accent ? G : HFG, fontVariantNumeric: 'tabular-nums', letterSpacing: '-.02em', lineHeight: 1, marginBottom: 4 }}>{s.v}</div>
                  <div style={{ fontSize: 10, color: 'rgba(255,255,255,.4)', fontFamily: INTER }}>{s.l}</div>
                </div>
              ))}
            </div>

            {/* Chart + recent */}
            <div style={{ display: 'grid', gridTemplateColumns: '1.7fr 1fr', gap: 12 }}>
              <div style={{ background: 'rgba(255,255,255,.04)', border: '1px solid rgba(255,255,255,.07)', borderRadius: 10, padding: 14 }}>
                <div style={{ fontSize: 11, fontWeight: 600, color: 'rgba(255,255,255,.5)', marginBottom: 12, fontFamily: INTER }}>Payroll spend · Last 6 months</div>
                <div style={{ display: 'flex', alignItems: 'flex-end', gap: 5, height: 70 }}>
                  {barHeights.map((h, i) => (
                    <div key={i} style={{ flex: 1, borderRadius: '3px 3px 0 0', background: i === 5 ? G : 'rgba(217,119,6,.2)', height: `${h}%` }} />
                  ))}
                </div>
                <div style={{ display: 'flex', gap: 5, marginTop: 6 }}>
                  {barMonths.map(m => <div key={m} style={{ flex: 1, textAlign: 'center', fontSize: 9, color: 'rgba(255,255,255,.25)', fontFamily: INTER }}>{m}</div>)}
                </div>
              </div>

              <div style={{ background: 'rgba(255,255,255,.04)', border: '1px solid rgba(255,255,255,.07)', borderRadius: 10, padding: 14 }}>
                <div style={{ fontSize: 11, fontWeight: 600, color: 'rgba(255,255,255,.5)', marginBottom: 10, fontFamily: INTER }}>Recent payslips</div>
                {employees.map(e => (
                  <div key={e.initials} style={{ display: 'flex', alignItems: 'center', gap: 8, paddingBlock: 7, borderBottom: '1px solid rgba(255,255,255,.04)' }}>
                    <div style={{ width: 24, height: 24, borderRadius: '50%', background: e.color, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 9, fontWeight: 700, color: '#fff', flexShrink: 0, fontFamily: JAKARTA }}>{e.initials}</div>
                    <div style={{ fontSize: 11, color: 'rgba(255,255,255,.65)', flex: 1, fontFamily: INTER }}>{e.name}</div>
                    <div style={{ fontSize: 11, fontWeight: 700, color: HFG, fontVariantNumeric: 'tabular-nums', fontFamily: JAKARTA }}>{e.amt}</div>
                    <div style={{ fontSize: 9, padding: '2px 7px', borderRadius: 20, background: 'rgba(217,119,6,.12)', color: G, border: '1px solid rgba(217,119,6,.2)', fontFamily: INTER }}>✓ Paid</div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}


function Eyebrow({ children }: { children: React.ReactNode }) {
  return <div style={{ fontFamily: JAKARTA, fontSize: 12, fontWeight: 700, letterSpacing: '.1em', textTransform: 'uppercase' as const, color: GREEN_D, marginBottom: 12 }}>{children}</div>
}

function H2({ children, dark }: { children: React.ReactNode; dark?: boolean }) {
  return (
    <h2 style={{ fontFamily: JAKARTA, fontWeight: 800, fontSize: 'clamp(30px,4vw,48px)', color: dark ? HFG : FG, letterSpacing: '-.03em', textWrap: 'balance' as const, lineHeight: 1.1, marginBottom: 16 }}>
      {children}
    </h2>
  )
}

export default function LandingPage() {
  usePageTitle('Payroll & HR for Growing Teams')
  const navigate = useNavigate()
  const heroRef = useRef<HTMLElement>(null)

  useEffect(() => {
    // Add @keyframes for animations globally
    const style = document.createElement('style')
    style.textContent = `
      @keyframes cp-pulse{0%{opacity:.4;transform:scale(1)}100%{opacity:0;transform:scale(2.4)}}
      @keyframes cp-spin{to{transform:rotate(360deg)}}
    `
    document.head.appendChild(style)
    return () => { document.head.removeChild(style) }
  }, [])

  return (
    <MarketingShell>
      {/* ══ HERO ══════════════════════════════════════════════════════════════ */}
      <section ref={heroRef} style={{ background: HERO, position: 'relative', overflow: 'hidden', paddingBlock: '100px 0' }}>
        {/* Mesh gradients */}
        <div style={{ position: 'absolute', width: 700, height: 500, borderRadius: '50%', background: 'radial-gradient(ellipse, rgba(217,119,6,.18), transparent 70%)', filter: 'blur(90px)', top: -100, right: '10%', pointerEvents: 'none' }} />
        <div style={{ position: 'absolute', width: 500, height: 500, borderRadius: '50%', background: 'radial-gradient(ellipse, rgba(80,30,0,.25), transparent 70%)', filter: 'blur(90px)', top: '50%', left: -100, pointerEvents: 'none' }} />
        <div style={{ position: 'absolute', width: 300, height: 300, borderRadius: '50%', background: 'radial-gradient(ellipse, rgba(184,137,43,.12), transparent 70%)', filter: 'blur(90px)', bottom: 80, right: '5%', pointerEvents: 'none' }} />

        <div style={{ maxWidth: 1280, margin: '0 auto', paddingInline: 24, textAlign: 'center', position: 'relative' }}>
          {/* Badge */}
          <div style={{ display: 'inline-flex', alignItems: 'center', gap: 8, padding: '6px 14px 6px 10px', background: 'rgba(217,119,6,.1)', border: '1px solid rgba(217,119,6,.25)', borderRadius: 100, fontSize: 13, color: G, fontWeight: 600, fontFamily: JAKARTA, marginBottom: 28 }}>
            <PulseDot />
            Free 30-day trial. No credit card required.
          </div>

          <h1 style={{ fontFamily: JAKARTA, fontWeight: 800, fontSize: 'clamp(44px,6vw,80px)', lineHeight: 1.06, color: HFG, letterSpacing: '-.04em', textWrap: 'balance' as const, maxWidth: 820, margin: '0 auto 24px' }}>
            The HR platform your team actually wants to use.{' '}
            <em style={{ fontStyle: 'italic', color: G, display: 'block' }}>Starting today.</em>
          </h1>

          <p style={{ fontSize: 'clamp(16px,1.8vw,20px)', color: HFG2, maxWidth: 560, margin: '0 auto 36px', lineHeight: 1.6 }}>
            Run payroll in minutes, not hours. No PEO lock-in, no 18-month contracts, no surprise fees. Just clean software that does the job.
          </p>

          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 12, flexWrap: 'wrap', marginBottom: 16 }}>
            <button
              onClick={() => navigate('/get-started')}
              style={{ display: 'inline-flex', alignItems: 'center', gap: 8, padding: '14px 28px', background: G, color: '#fff', fontFamily: JAKARTA, fontWeight: 700, fontSize: 15, borderRadius: 12, border: 'none', cursor: 'pointer', boxShadow: '0 4px 24px rgba(217,119,6,.35)', transition: 'all .15s' }}
              onMouseEnter={e => { e.currentTarget.style.background = '#16a34a'; e.currentTarget.style.transform = 'translateY(-2px)' }}
              onMouseLeave={e => { e.currentTarget.style.background = G; e.currentTarget.style.transform = 'none' }}
            >
              Start for free
              <svg width="16" height="16" viewBox="0 0 16 16" fill="none" aria-hidden="true"><path d="M3 8h10m0 0-4-4m4 4-4 4" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round" /></svg>
            </button>
            <a href="#features" style={{ padding: '13px 24px', color: HFG2, fontFamily: JAKARTA, fontWeight: 600, fontSize: 15, border: `1px solid ${HBORDER}`, borderRadius: 12, textDecoration: 'none', transition: 'all .15s' }}
              onMouseEnter={e => { e.currentTarget.style.background = HSURF; e.currentTarget.style.color = HFG }}
              onMouseLeave={e => { e.currentTarget.style.background = 'transparent'; e.currentTarget.style.color = HFG2 }}
            >
              See all features
            </a>
          </div>

          <p style={{ fontSize: 13, color: HFG3, marginBottom: 60, fontFamily: JAKARTA }}>
            <span style={{ color: HFG2 }}>Trusted by 500+ growing teams</span> · GDPR compliant · SOC 2 Type II
          </p>

          <DashboardMockup />
        </div>
      </section>

      {/* ══ TRUST BAR ═════════════════════════════════════════════════════════ */}
      <div style={{ background: '#fff', borderBottom: `1px solid ${BORDER}`, padding: '28px 24px', overflow: 'hidden' }}>
        <div style={{ textAlign: 'center', fontSize: 13, color: FG3, fontWeight: 500, letterSpacing: '.05em', textTransform: 'uppercase' as const, marginBottom: 20, fontFamily: JAKARTA }}>Trusted by teams at</div>
        <div style={{ display: 'flex', gap: 48, justifyContent: 'center', flexWrap: 'wrap', alignItems: 'center' }}>
          {['Meridian Design', 'Strata Labs', 'Clearview Tech', 'NorthBridge', 'Vantage Works', 'Foxline Studio', 'Pillar Capital'].map(co => (
            <span key={co} style={{ fontFamily: JAKARTA, fontWeight: 700, fontSize: 15, color: '#b0bdcc', letterSpacing: '-.02em', whiteSpace: 'nowrap' }}>{co}</span>
          ))}
        </div>
      </div>

      {/* ══ STATS ═════════════════════════════════════════════════════════════ */}
      <section style={{ background: HERO, paddingBlock: 72 }}>
        <div style={{ maxWidth: 1280, margin: '0 auto', paddingInline: 24, display: 'grid', gridTemplateColumns: 'repeat(4,1fr)', gap: 24 }}>
          {[
            { v: '$1.2B+', l: 'Payroll processed annually' },
            { v: '3 min', l: 'Average payroll run time' },
            { v: '99.9%', l: 'Platform uptime SLA' },
            { v: '500+', l: 'Growing teams onboarded' },
          ].map(s => (
            <div key={s.l} style={{ textAlign: 'center', padding: '32px 16px', border: `1px solid ${HBORDER}`, borderRadius: 16, background: HSURF, position: 'relative', overflow: 'hidden' }}>
              <div style={{ position: 'absolute', inset: 0, background: 'linear-gradient(135deg, rgba(217,119,6,.06), transparent 60%)', pointerEvents: 'none' }} />
              <div style={{ fontFamily: JAKARTA, fontSize: 'clamp(36px,4vw,52px)', fontWeight: 800, color: G, letterSpacing: '-.04em', lineHeight: 1, marginBottom: 8 }}>{s.v}</div>
              <div style={{ fontSize: 14, color: HFG2, fontFamily: INTER }}>{s.l}</div>
            </div>
          ))}
        </div>
      </section>

      {/* ══ FEATURES ══════════════════════════════════════════════════════════ */}
      <section id="features" style={{ background: BG_ALT, paddingBlock: 96 }}>
        <div style={{ maxWidth: 1280, margin: '0 auto', paddingInline: 24 }}>
          <Eyebrow>Everything in one place</Eyebrow>
          <H2>Built for real HR teams</H2>
          <p style={{ fontSize: 18, color: FG2, maxWidth: 540, lineHeight: 1.6, marginBottom: 56 }}>From hire to retire, PayChamps handles every HR workflow so your team can focus on people, not paperwork.</p>

          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3,1fr)', gap: 20 }}>
            {[
              {
                icon: '💳', bg: '#dcfce7', h: 'Payroll that runs itself', wide: true,
                p: 'Process payroll for your entire team in under 3 minutes. Automated tax calculations, deductions, pay schedules, and instant payslip generation. All included.',
                preview: (
                  <div style={{ marginTop: 20, background: '#fff', border: `1px solid ${BORDER}`, borderRadius: 12, padding: 14, fontSize: 12 }}>
                    {[['JS', '#7c3aed', 'John Smith', '$4,200', true], ['SM', '#0891b2', 'Sarah Meyer', '$3,800', true], ['RK', '#be185d', 'Riya Kapoor', '$5,100', false]].map(([i, c, n, a, paid]) => (
                      <div key={String(n)} style={{ display: 'flex', alignItems: 'center', gap: 10, padding: '7px 0', borderBottom: `1px solid ${BORDER}` }}>
                        <div style={{ width: 26, height: 26, borderRadius: '50%', background: String(c), display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 10, fontWeight: 700, color: '#fff', fontFamily: JAKARTA }}>{i}</div>
                        <div style={{ flex: 1, color: FG, fontWeight: 500, fontFamily: INTER }}>{n}</div>
                        <div style={{ color: FG, fontWeight: 700, fontVariantNumeric: 'tabular-nums', fontFamily: JAKARTA }}>{a}</div>
                        <div style={{ fontSize: 10, padding: '2px 8px', borderRadius: 20, background: paid ? GREEN_P : '#fef9c3', color: paid ? GREEN_D : '#713f12' }}>{paid ? 'Paid' : 'Processing'}</div>
                      </div>
                    ))}
                  </div>
                ),
              },
              { icon: '👥', bg: '#ede9fe', h: 'Employee management', p: 'Onboard, manage, and track your entire workforce from one place. Profiles, org charts, and role management all in sync.' },
              {
                icon: '⏱', bg: '#fef3c7', h: 'Attendance & time tracking',
                p: 'Clock-in tracking, absence management, and leave workflows. All automated and synced with payroll.',
                preview: (
                  <div style={{ marginTop: 20, background: '#fff', border: `1px solid ${BORDER}`, borderRadius: 12, padding: 14, fontSize: 12 }}>
                    {[['JS', '#7c3aed', 'John S.', '09:02', true], ['AL', '#16a34a', 'Alex L.', '09:24', false]].map(([i, c, n, t, ontime]) => (
                      <div key={String(n)} style={{ display: 'flex', alignItems: 'center', gap: 8, padding: '6px 0', borderBottom: `1px solid ${BORDER}` }}>
                        <div style={{ width: 22, height: 22, borderRadius: '50%', background: String(c), display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 9, fontWeight: 700, color: '#fff', fontFamily: JAKARTA }}>{i}</div>
                        <div style={{ flex: 1, color: FG, fontWeight: 500, fontFamily: INTER }}>{n}</div>
                        <div style={{ color: FG2, fontVariantNumeric: 'tabular-nums', fontFamily: INTER }}>{t}</div>
                        <div style={{ fontSize: 10, padding: '2px 8px', borderRadius: 20, background: ontime ? GREEN_P : '#fef3c7', color: ontime ? GREEN_D : '#92400e' }}>{ontime ? 'Present' : 'Late'}</div>
                      </div>
                    ))}
                  </div>
                ),
              },
              { icon: '📄', bg: '#fee2e2', h: 'Document management', p: 'Store, manage, and share HR documents securely. E-signature workflows, version control, and automated expiry alerts.' },
              { icon: '🎁', bg: '#ccfbf1', h: 'Benefits administration', wide: true, p: 'Create and manage benefit plans across health, 401(k), and more. Let employees self-enroll and track their coverage without HR intervention.' },
              { icon: '📊', bg: '#e0e7ff', h: 'Analytics & reports', p: 'Real-time HR insights. Headcount, payroll costs, attendance trends, and custom CSV exports on demand.' },
            ].map((f, idx) => (
              <div
                key={idx}
                style={{
                  background: '#fff',
                  border: `1px solid ${BORDER}`,
                  borderRadius: 20,
                  padding: 28,
                  gridColumn: (f as { wide?: boolean }).wide ? 'span 2' : undefined,
                  transition: 'box-shadow .2s, transform .2s, border-color .2s',
                }}
                onMouseEnter={e => { e.currentTarget.style.boxShadow = '0 12px 40px rgba(0,0,0,.08)'; e.currentTarget.style.transform = 'translateY(-3px)'; e.currentTarget.style.borderColor = 'rgba(217,119,6,.25)' }}
                onMouseLeave={e => { e.currentTarget.style.boxShadow = 'none'; e.currentTarget.style.transform = 'none'; e.currentTarget.style.borderColor = BORDER }}
              >
                <div style={{ width: 44, height: 44, borderRadius: 12, background: f.bg, display: 'flex', alignItems: 'center', justifyContent: 'center', marginBottom: 20, fontSize: 20 }}>{f.icon}</div>
                <div style={{ fontFamily: JAKARTA, fontSize: 17, fontWeight: 700, color: FG, marginBottom: 8 }}>{f.h}</div>
                <div style={{ fontSize: 14, color: FG2, lineHeight: 1.6 }}>{f.p}</div>
                {(f as { preview?: React.ReactNode }).preview}
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ══ PRODUCT WALKTHROUGH ═══════════════════════════════════════════════ */}
      <section style={{ background: '#fff', paddingBlock: 96 }}>
        <div style={{ maxWidth: 1280, margin: '0 auto', paddingInline: 24, display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 80, alignItems: 'center' }}>
          <div>
            <Eyebrow>How it works</Eyebrow>
            <H2>Payroll in 3 steps.<br />Every time.</H2>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 28, marginTop: 40 }}>
              {[
                { n: '1', h: 'Set up your team once', p: 'Import employees from CSV or add them manually. Set pay schedules, salaries, and deductions. Done in an afternoon.' },
                { n: '2', h: 'Review and approve in seconds', p: 'PayChamps auto-calculates taxes, deductions, and net pay. You just review the summary and click Approve.' },
                { n: '3', h: 'Same-day direct deposit', p: 'Employees get paid the same day. Payslips are automatically generated and available in the employee portal instantly.' },
              ].map((s, i) => (
                <div key={i} style={{ display: 'flex', gap: 18, padding: 24, borderRadius: 16, border: `1px solid ${BORDER}`, background: BG_ALT }}>
                  <div style={{ width: 32, height: 32, borderRadius: '50%', background: GREEN_P, border: `2px solid ${G}`, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 13, fontWeight: 800, color: GREEN_D, fontFamily: JAKARTA, flexShrink: 0, marginTop: 2 }}>{s.n}</div>
                  <div>
                    <div style={{ fontFamily: JAKARTA, fontSize: 16, fontWeight: 700, color: FG, marginBottom: 4 }}>{s.h}</div>
                    <div style={{ fontSize: 14, color: FG2, lineHeight: 1.5 }}>{s.p}</div>
                  </div>
                </div>
              ))}
            </div>
          </div>

          <div style={{ background: HERO, border: `1px solid ${HBORDER}`, borderRadius: 20, padding: 24, boxShadow: '0 24px 80px rgba(0,0,0,.25)', position: 'relative', overflow: 'hidden' }}>
            <div style={{ position: 'absolute', top: -60, right: -60, width: 250, height: 250, background: 'radial-gradient(ellipse, rgba(217,119,6,.15), transparent 70%)', pointerEvents: 'none' }} />
            <div style={{ fontFamily: JAKARTA, fontSize: 13, fontWeight: 700, color: HFG, marginBottom: 20, position: 'relative' }}>October 2026 Payroll Run</div>
            <div style={{ background: 'rgba(255,255,255,.05)', border: '1px solid rgba(255,255,255,.08)', borderRadius: 14, padding: 18, marginBottom: 14, position: 'relative' }}>
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 14 }}>
                <div style={{ fontSize: 12, color: 'rgba(255,255,255,.55)', fontFamily: INTER }}>Oct 1 - Oct 31, 2026</div>
                <div style={{ fontSize: 11, padding: '3px 10px', borderRadius: 20, background: 'rgba(217,119,6,.12)', color: G, border: '1px solid rgba(217,119,6,.2)', fontFamily: INTER }}>✓ Approved</div>
              </div>
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3,1fr)', gap: 10 }}>
                {[['$94,200', 'Gross pay'], ['$18,400', 'Deductions'], ['$75,800', 'Net pay']].map(([v, l]) => (
                  <div key={l} style={{ textAlign: 'center' }}>
                    <div style={{ fontFamily: JAKARTA, fontSize: 18, fontWeight: 800, color: HFG, fontVariantNumeric: 'tabular-nums' }}>{v}</div>
                    <div style={{ fontSize: 10, color: 'rgba(255,255,255,.4)', marginTop: 3, fontFamily: INTER }}>{l}</div>
                  </div>
                ))}
              </div>
            </div>
            {[
              { i: 'JS', c: '#7c3aed', n: 'John Smith · Software Engineer', a: '$4,200' },
              { i: 'SM', c: '#0891b2', n: 'Sarah Meyer · Product Designer', a: '$3,800' },
              { i: 'RK', c: '#be185d', n: 'Riya Kapoor · Head of Finance', a: '$6,200' },
              { i: 'AL', c: '#16a34a', n: 'Alex Lim · Sales Lead', a: '$5,100' },
            ].map(e => (
              <div key={e.i} style={{ display: 'flex', alignItems: 'center', gap: 10, background: 'rgba(255,255,255,.04)', border: '1px solid rgba(255,255,255,.06)', borderRadius: 10, padding: '10px 12px', marginBottom: 8 }}>
                <div style={{ width: 26, height: 26, borderRadius: '50%', background: e.c, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 10, fontWeight: 700, color: '#fff', flexShrink: 0, fontFamily: JAKARTA }}>{e.i}</div>
                <div style={{ flex: 1, fontSize: 12, color: 'rgba(255,255,255,.7)', fontFamily: INTER }}>{e.n}</div>
                <div style={{ fontSize: 12, fontWeight: 700, color: HFG, fontVariantNumeric: 'tabular-nums', fontFamily: JAKARTA }}>{e.a}</div>
                <div style={{ fontSize: 10, color: G, fontFamily: INTER }}>Paid ✓</div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ══ TESTIMONIALS ══════════════════════════════════════════════════════ */}
      <section style={{ background: HERO, paddingBlock: 96, position: 'relative', overflow: 'hidden' }}>
        <div style={{ position: 'absolute', top: 0, left: 0, right: 0, bottom: 0, background: 'radial-gradient(ellipse at 50% 0%, rgba(217,119,6,.08), transparent 60%)', pointerEvents: 'none' }} />
        <div style={{ maxWidth: 1280, margin: '0 auto', paddingInline: 24, position: 'relative' }}>
          <Eyebrow>Customer stories</Eyebrow>
          <H2 dark>Don't take our word for it</H2>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3,1fr)', gap: 24, marginTop: 56 }}>
            {[
              { stars: '★★★★★', quote: 'We cut our payroll processing time from 4 hours every month to under 15 minutes. Our finance team finally has time for real work.', name: 'Marcus Chen', role: 'Head of Finance · Meridian Design Co.', initials: 'MC', color: '#7c3aed' },
              { stars: '★★★★★', quote: 'Onboarding new employees used to take a full day. With PayChamps, it\'s done before lunch. The employee portal alone saved us 3 hours a week.', name: 'Priya Anand', role: 'HR Director · Strata Labs', initials: 'PA', color: '#0891b2' },
              { stars: '★★★★★', quote: 'Other platforms made us sign an 18-month contract before we even saw the software. PayChamps just works, no commitment required.', name: 'Tom Okafor', role: 'CEO · Clearview Tech', initials: 'TO', color: '#16a34a' },
            ].map((t, i) => (
              <div key={i} style={{ background: 'rgba(255,255,255,.05)', border: `1px solid ${HBORDER}`, borderRadius: 20, padding: 32, display: 'flex', flexDirection: 'column', gap: 20, transition: 'background .2s, border-color .2s' }}
                onMouseEnter={e => { e.currentTarget.style.background = 'rgba(255,255,255,.07)'; e.currentTarget.style.borderColor = 'rgba(255,255,255,.15)' }}
                onMouseLeave={e => { e.currentTarget.style.background = 'rgba(255,255,255,.05)'; e.currentTarget.style.borderColor = HBORDER }}
              >
                <div style={{ color: '#fbbf24', fontSize: 14, letterSpacing: 2 }}>{t.stars}</div>
                <div style={{ fontSize: 15, color: HFG, lineHeight: 1.65, flex: 1, fontStyle: 'italic', fontFamily: INTER }}>"{t.quote}"</div>
                <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
                  <div style={{ width: 40, height: 40, borderRadius: '50%', background: t.color, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 14, fontWeight: 700, color: '#fff', fontFamily: JAKARTA, flexShrink: 0 }}>{t.initials}</div>
                  <div>
                    <div style={{ fontFamily: JAKARTA, fontSize: 14, fontWeight: 700, color: HFG }}>{t.name}</div>
                    <div style={{ fontSize: 12, color: HFG3 }}>{t.role}</div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ══ COMPARISON ════════════════════════════════════════════════════════ */}
      <section id="compare" style={{ background: '#fff', paddingBlock: 96 }}>
        <div style={{ maxWidth: 1280, margin: '0 auto', paddingInline: 24 }}>
          <Eyebrow>Why switch</Eyebrow>
          <H2>PayChamps vs the rest</H2>
          <p style={{ fontSize: 18, color: FG2, maxWidth: 540, lineHeight: 1.6, marginBottom: 48 }}>See how we stack up against Gusto, Rippling, and Paylocity on the things that actually matter.</p>
          <div style={{ overflowX: 'auto', borderRadius: 16, border: `1px solid ${BORDER}` }}>
            <table style={{ width: '100%', borderCollapse: 'collapse', fontFamily: INTER }}>
              <thead>
                <tr>
                  <th style={{ background: BG_ALT, padding: '14px 20px', textAlign: 'left', fontSize: 11, fontFamily: JAKARTA, fontWeight: 700, letterSpacing: '.05em', textTransform: 'uppercase', color: FG3, borderBottom: `1px solid ${BORDER}` }}></th>
                  {[['PayChamps ✦', true], ['Gusto', false], ['Rippling', false], ['Paylocity', false]].map(([name, champ]) => (
                    <th key={String(name)} style={{ background: champ ? GREEN_P : BG_ALT, padding: '14px 20px', textAlign: 'center', fontSize: 13, fontFamily: JAKARTA, fontWeight: 700, color: champ ? GREEN_D : FG, borderBottom: `1px solid ${BORDER}` }}>{name}</th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {[
                  ['Setup time', 'Under 1 hour', '1-2 days', '3-5 days', '1-2 weeks'],
                  ['Contract required', 'No lock-in', 'No', '12 months', '18 months'],
                  ['Transparent pricing', '✓', '✓', '✗ Quote only', '✗ Quote only'],
                  ['Same-day direct deposit', '✓', '2-4 days', '2-4 days', '2-4 days'],
                  ['Employee self-service', '✓ Full portal', '✓', '✓', 'Limited'],
                  ['Document management', '✓', 'Basic only', '✓', 'Basic only'],
                  ['CSV & custom reports', '✓', 'Limited', '✓', '✓'],
                  ['Starting price (per employee)', '$8 / month', '$12 / month', '$15 / month', '~$20 / month'],
                ].map(([label, champ, g, r, p]) => (
                  <tr key={label} style={{ borderBottom: `1px solid ${BG_ALT}` }}>
                    <td style={{ padding: '14px 20px', color: FG2, fontSize: 14 }}>{label}</td>
                    {[champ, g, r, p].map((val, vi) => {
                      const good = val === '✓' || val?.toString().startsWith('✓') || val === 'No lock-in' || val === 'Under 1 hour' || val === 'No' || val === '$8 / month'
                      const bad = val?.toString().startsWith('✗') || val === '1-2 weeks' || val === '18 months' || val === '12 months'
                      return (
                        <td key={vi} style={{ padding: '14px 20px', textAlign: 'center', fontSize: 14, background: vi === 0 ? 'rgba(217,119,6,.04)' : 'transparent', color: good && vi === 0 ? GREEN_D : bad ? '#dc2626' : FG, fontWeight: good && vi === 0 ? 700 : 400 }}>
                          {val}
                        </td>
                      )
                    })}
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </section>

      {/* ══ PRICING ═══════════════════════════════════════════════════════════ */}
      <section id="pricing" style={{ background: BG_ALT, paddingBlock: 96 }}>
        <div style={{ maxWidth: 1280, margin: '0 auto', paddingInline: 24 }}>
          <Eyebrow>Simple pricing</Eyebrow>
          <H2>No surprises. Ever.</H2>
          <p style={{ fontSize: 18, color: FG2, maxWidth: 540, lineHeight: 1.6, marginBottom: 56 }}>All plans include a 30-day free trial. No credit card required. Cancel any time.</p>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3,1fr)', gap: 24, alignItems: 'start' }}>
            {[
              {
                tier: 'Starter', desc: 'For small teams just getting started with modern HR.', price: '$8', per: '/ employee / month', note: 'Billed monthly · No contract', popular: false,
                features: ['Unlimited payroll runs', 'Employee self-service portal', 'Direct deposit (same day)', 'Automated tax calculations', 'Basic attendance tracking', 'Leave management', 'Email support'],
              },
              {
                tier: 'Growth', desc: 'For scaling teams that need the full HR toolkit.', price: '$16', per: '/ employee / month', note: 'Billed monthly · No contract', popular: true,
                features: ['Everything in Starter', 'Benefits administration', 'Document management & e-sign', 'Advanced reporting & CSV export', 'Multi-state payroll & compliance', 'HR analytics dashboard', 'Priority support (chat + email)'],
              },
              {
                tier: 'Enterprise', desc: 'Custom contracts, dedicated support, and advanced security.', price: 'Custom', per: '', note: 'Volume pricing available', popular: false,
                features: ['Everything in Growth', 'Dedicated account manager', 'Custom integrations (HRIS, ERP)', 'SSO & advanced permissions', 'SLA with 99.99% uptime guarantee', 'Custom onboarding & training', '24/7 phone support'],
              },
            ].map((plan, i) => (
              <div key={plan.tier} style={{ background: '#fff', border: `1px solid ${plan.popular ? G : BORDER}`, borderRadius: 24, padding: '32px 28px', position: 'relative', boxShadow: plan.popular ? '0 8px 32px rgba(217,119,6,.15)' : 'none', transition: 'box-shadow .2s, transform .2s' }}
                onMouseEnter={e => { e.currentTarget.style.boxShadow = plan.popular ? '0 20px 60px rgba(217,119,6,.2)' : '0 20px 60px rgba(0,0,0,.1)'; e.currentTarget.style.transform = 'translateY(-4px)' }}
                onMouseLeave={e => { e.currentTarget.style.boxShadow = plan.popular ? '0 8px 32px rgba(217,119,6,.15)' : 'none'; e.currentTarget.style.transform = 'none' }}
              >
                {plan.popular && (
                  <div style={{ position: 'absolute', top: -14, left: '50%', transform: 'translateX(-50%)', background: G, color: '#fff', fontFamily: JAKARTA, fontSize: 11, fontWeight: 700, letterSpacing: '.08em', textTransform: 'uppercase', padding: '4px 14px', borderRadius: 20, whiteSpace: 'nowrap' }}>MOST POPULAR</div>
                )}
                <div style={{ fontFamily: JAKARTA, fontSize: 15, fontWeight: 700, color: FG, marginBottom: 8 }}>{plan.tier}</div>
                <div style={{ fontSize: 14, color: FG2, marginBottom: 24, lineHeight: 1.5 }}>{plan.desc}</div>
                <div style={{ display: 'flex', alignItems: 'baseline', gap: 4, marginBottom: 4 }}>
                  <div style={{ fontFamily: JAKARTA, fontSize: plan.price === 'Custom' ? 32 : 40, fontWeight: 800, color: FG, letterSpacing: '-.04em', lineHeight: 1 }}>{plan.price}</div>
                  {plan.per && <div style={{ fontSize: 14, color: FG2 }}>{plan.per}</div>}
                </div>
                <div style={{ fontSize: 13, color: FG3, marginBottom: 28 }}>{plan.note}</div>
                <button
                  onClick={() => navigate('/get-started')}
                  style={{ display: 'block', width: '100%', padding: 12, textAlign: 'center', borderRadius: 10, fontFamily: JAKARTA, fontSize: 14, fontWeight: 700, cursor: 'pointer', marginBottom: 28, transition: 'all .15s', ...(plan.popular ? { background: G, color: '#fff', border: 'none', boxShadow: '0 4px 16px rgba(217,119,6,.3)' } : { background: 'transparent', color: FG, border: `1.5px solid ${BORDER}` }) }}
                  onMouseEnter={e => { if (plan.popular) { e.currentTarget.style.background = '#16a34a' } else { e.currentTarget.style.borderColor = G; e.currentTarget.style.color = G } }}
                  onMouseLeave={e => { if (plan.popular) { e.currentTarget.style.background = G } else { e.currentTarget.style.borderColor = BORDER; e.currentTarget.style.color = FG } }}
                >
                  {i === 2 ? 'Talk to sales' : 'Start free trial'}
                </button>
                <hr style={{ border: 'none', borderTop: `1px solid ${BORDER}`, margin: '0 0 20px' }} />
                <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
                  {plan.features.map(f => (
                    <div key={f} style={{ display: 'flex', alignItems: 'flex-start', gap: 10, fontSize: 14, color: FG2 }}>
                      <span style={{ color: G, fontSize: 16, lineHeight: 1, flexShrink: 0, marginTop: 1 }}>✓</span>
                      {f.startsWith('Everything') ? <strong>{f}</strong> : f}
                    </div>
                  ))}
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ══ FAQ ═══════════════════════════════════════════════════════════════ */}
      <section id="faq" style={{ background: '#fff', paddingBlock: 96 }}>
        <div style={{ maxWidth: 1280, margin: '0 auto', paddingInline: 24 }}>
          <Eyebrow>FAQ</Eyebrow>
          <H2>Common questions</H2>
          <div style={{ maxWidth: 720, margin: '0 auto', display: 'flex', flexDirection: 'column', gap: 4 }}>
            {[
              { q: 'How long does setup take?', a: 'Most teams are fully set up in under an hour. Import your employees from a CSV, connect your bank account for direct deposit, and you\'re ready to run your first payroll. Our onboarding team is available if you need help.' },
              { q: 'Do I need to sign a long-term contract?', a: 'No. All PayChamps plans are month-to-month with no minimum commitment. You can cancel at any time and export your data. We earn your business every month.' },
              { q: 'Can I run payroll across multiple states?', a: 'Yes. Multi-state payroll and compliance is included on Growth and Enterprise plans. PayChamps handles state tax withholding, filings, and compliance automatically for all 50 US states.' },
              { q: 'What happens to my data if I cancel?', a: 'Your data belongs to you. Before cancelling, you can export all employee records, payroll history, payslips, and documents in standard formats (CSV, PDF). We retain data for 90 days after cancellation.' },
              { q: 'Is PayChamps SOC 2 compliant?', a: 'Yes. PayChamps is SOC 2 Type II certified. We use AES-256 encryption at rest, TLS 1.3 in transit, and maintain strict access controls. Your payroll and employee data is never used for any other purpose.' },
              { q: 'Can employees see their own payslips and data?', a: 'Absolutely. Every employee gets a self-service portal where they can view payslips, request leave, update personal details, and access any documents shared with them, with no HR required.' },
            ].map((item, i) => (
              <details key={i} style={{ border: `1px solid ${BORDER}`, borderRadius: 12, overflow: 'hidden' }}>
                <summary style={{ listStyle: 'none', padding: '20px 24px', fontFamily: JAKARTA, fontSize: 15, fontWeight: 600, color: FG, cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 12, userSelect: 'none' }}>
                  {item.q}
                  <span style={{ width: 20, height: 20, borderRadius: '50%', background: BG_ALT, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 11, color: FG3, flexShrink: 0 }}>▾</span>
                </summary>
                <div style={{ padding: '0 24px 20px', fontSize: 15, color: FG2, lineHeight: 1.65 }}>{item.a}</div>
              </details>
            ))}
          </div>
        </div>
      </section>

      {/* ══ FINAL CTA ═════════════════════════════════════════════════════════ */}
      <section style={{ background: HERO, paddingBlock: 96, position: 'relative', overflow: 'hidden', textAlign: 'center' }}>
        <div style={{ position: 'absolute', top: '-50%', left: '50%', transform: 'translate(-50%,0)', width: 800, height: 600, background: 'radial-gradient(ellipse, rgba(217,119,6,.12), transparent 65%)', pointerEvents: 'none' }} />
        <div style={{ position: 'relative', maxWidth: 1280, margin: '0 auto', paddingInline: 24 }}>
          <h2 style={{ fontFamily: JAKARTA, fontWeight: 800, fontSize: 'clamp(32px,5vw,60px)', color: HFG, letterSpacing: '-.04em', marginBottom: 16, lineHeight: 1.08, textWrap: 'balance' as const }}>
            Ready to simplify<br />your HR stack?
          </h2>
          <p style={{ fontSize: 18, color: HFG2, maxWidth: 460, margin: '0 auto 40px', lineHeight: 1.6 }}>Join 500+ teams that run payroll and HR on PayChamps. Setup takes under an hour.</p>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 12, flexWrap: 'wrap' }}>
            <button
              onClick={() => navigate('/get-started')}
              style={{ display: 'inline-flex', alignItems: 'center', gap: 8, padding: '15px 32px', background: G, color: '#fff', fontFamily: JAKARTA, fontWeight: 700, fontSize: 15, borderRadius: 12, border: 'none', cursor: 'pointer', boxShadow: '0 4px 24px rgba(217,119,6,.35)', transition: 'all .15s' }}
              onMouseEnter={e => { e.currentTarget.style.background = '#16a34a'; e.currentTarget.style.transform = 'translateY(-2px)' }}
              onMouseLeave={e => { e.currentTarget.style.background = G; e.currentTarget.style.transform = 'none' }}
            >
              Start free. No card needed.
              <svg width="16" height="16" viewBox="0 0 16 16" fill="none" aria-hidden="true"><path d="M3 8h10m0 0-4-4m4 4-4 4" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round" /></svg>
            </button>
            <a href="#compare" style={{ padding: '14px 24px', color: HFG2, fontFamily: JAKARTA, fontWeight: 600, fontSize: 15, border: `1px solid ${HBORDER}`, borderRadius: 12, textDecoration: 'none', transition: 'all .15s' }}
              onMouseEnter={e => { e.currentTarget.style.background = HSURF; e.currentTarget.style.color = HFG }}
              onMouseLeave={e => { e.currentTarget.style.background = 'transparent'; e.currentTarget.style.color = HFG2 }}
            >
              Compare plans
            </a>
          </div>
        </div>
      </section>
    </MarketingShell>
  )
}
