import { useState, useEffect } from 'react'
import { Link, useNavigate, useLocation } from 'react-router-dom'
import { Menu, X } from 'lucide-react'

interface MarketingShellProps {
  children: React.ReactNode
  title?: string
  description?: string
}

export default function MarketingShell({ children }: MarketingShellProps) {
  const navigate = useNavigate()
  const location = useLocation()
  const [mobileOpen, setMobileOpen] = useState(false)
  const [scrolled, setScrolled] = useState(false)

  const onLanding = location.pathname === '/' || location.pathname === ''

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 40)
    window.addEventListener('scroll', onScroll, { passive: true })
    return () => window.removeEventListener('scroll', onScroll)
  }, [])

  const navTransparent = onLanding && !scrolled && !mobileOpen

  return (
    <div className="min-h-screen flex flex-col" style={{ fontFamily: "'Inter', system-ui, sans-serif" }}>
      {/* ── Announcement bar ── */}
      <div style={{ background: '#d97706', color: '#fff', textAlign: 'center', padding: '9px 16px', fontSize: 13, fontFamily: "'Plus Jakarta Sans', system-ui, sans-serif", fontWeight: 500, letterSpacing: '.01em', position: 'relative', zIndex: 100 }}>
        ✦ New: Multi-state payroll &amp; compliance now available
        <a href="#pricing" style={{ color: '#fff', textDecoration: 'underline', marginLeft: 8, opacity: .9 }}>See plans →</a>
      </div>

      {/* ── Sticky header ── */}
      <header
        style={{
          position: 'sticky',
          top: 0,
          zIndex: 90,
          background: navTransparent ? 'transparent' : 'rgba(255,255,255,0.96)',
          backdropFilter: navTransparent ? 'none' : 'blur(12px)',
          borderBottom: `1px solid ${navTransparent ? 'transparent' : '#dde5ef'}`,
          boxShadow: navTransparent ? 'none' : '0 1px 20px rgba(0,0,0,.06)',
          transition: 'background .25s, border-color .25s, box-shadow .25s',
        }}
      >
        <div style={{ maxWidth: 1280, margin: '0 auto', padding: '0 24px', height: 64, display: 'flex', alignItems: 'center', gap: 40 }}>
          {/* Wordmark */}
          <Link
            to="/"
            style={{
              fontFamily: "'Space Grotesk', system-ui, sans-serif",
              fontWeight: 700,
              fontSize: 20,
              letterSpacing: '-0.045em',
              color: navTransparent ? '#fff' : '#1D2230',
              display: 'flex',
              alignItems: 'baseline',
              gap: 0,
              flexShrink: 0,
              textDecoration: 'none',
              transition: 'color .25s',
            }}
          >
            Pay
            <svg width="14" height="14" viewBox="0 0 24 24" style={{ transform: 'translateY(.05em)', margin: '0 .01em' }} aria-hidden="true">
              <circle cx="12" cy="12" r="9" fill="none" stroke={navTransparent ? '#F8F7F3' : '#1D2230'} strokeWidth="4.2" strokeDasharray="47 9.5" transform="rotate(30 12 12)" />
              <circle cx="12" cy="12" r="3.4" fill={navTransparent ? '#E2B85A' : '#B8892B'} />
            </svg>
            hamps
          </Link>

          {/* Desktop nav */}
          <nav style={{ display: 'flex', gap: 32, flex: 1 }} className="hidden md:flex">
            {[
              ['#features', 'Features'],
              ['#compare', 'Compare'],
              ['#pricing', 'Pricing'],
              ['#faq', 'FAQ'],
            ].map(([href, label]) => (
              <a
                key={label}
                href={href}
                style={{
                  fontSize: 14,
                  fontWeight: 500,
                  color: navTransparent ? 'rgba(255,255,255,.6)' : '#4a5568',
                  textDecoration: 'none',
                  transition: 'color .2s',
                  fontFamily: "'Inter', system-ui, sans-serif",
                }}
                onMouseEnter={e => (e.currentTarget.style.color = navTransparent ? '#fff' : '#0c1929')}
                onMouseLeave={e => (e.currentTarget.style.color = navTransparent ? 'rgba(255,255,255,.6)' : '#4a5568')}
              >
                {label}
              </a>
            ))}
          </nav>

          {/* CTA */}
          <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginLeft: 'auto' }} className="hidden md:flex">
            <button
              onClick={() => navigate('/login')}
              style={{
                padding: '8px 16px',
                fontSize: 14,
                fontWeight: 600,
                color: navTransparent ? 'rgba(255,255,255,.6)' : '#4a5568',
                background: 'transparent',
                border: 'none',
                borderRadius: 8,
                cursor: 'pointer',
                fontFamily: "'Plus Jakarta Sans', system-ui, sans-serif",
                transition: 'color .2s, background .2s',
              }}
              onMouseEnter={e => {
                e.currentTarget.style.color = navTransparent ? '#fff' : '#0c1929'
                e.currentTarget.style.background = navTransparent ? 'rgba(255,255,255,.05)' : '#f6f9fc'
              }}
              onMouseLeave={e => {
                e.currentTarget.style.color = navTransparent ? 'rgba(255,255,255,.6)' : '#4a5568'
                e.currentTarget.style.background = 'transparent'
              }}
            >
              Log in
            </button>
            <button
              onClick={() => navigate('/get-started')}
              style={{
                padding: '9px 20px',
                fontSize: 14,
                fontWeight: 700,
                color: '#fff',
                background: '#d97706',
                border: 'none',
                borderRadius: 9,
                cursor: 'pointer',
                fontFamily: "'Plus Jakarta Sans', system-ui, sans-serif",
                transition: 'background .15s, transform .15s',
                whiteSpace: 'nowrap',
              }}
              onMouseEnter={e => { e.currentTarget.style.background = '#b45309'; e.currentTarget.style.transform = 'translateY(-1px)' }}
              onMouseLeave={e => { e.currentTarget.style.background = '#d97706'; e.currentTarget.style.transform = 'none' }}
            >
              Get started free
            </button>
          </div>

          {/* Mobile toggle */}
          <button
            className="md:hidden ml-auto"
            onClick={() => setMobileOpen(!mobileOpen)}
            style={{ background: 'none', border: 'none', cursor: 'pointer', color: navTransparent ? '#fff' : '#4a5568', padding: 4 }}
          >
            {mobileOpen ? <X size={22} /> : <Menu size={22} />}
          </button>
        </div>

        {/* Mobile menu */}
        {mobileOpen && (
          <div style={{ background: '#fff', borderTop: '1px solid #dde5ef', padding: '16px 24px', display: 'flex', flexDirection: 'column', gap: 16 }} className="md:hidden">
            {[['#features', 'Features'], ['#compare', 'Compare'], ['#pricing', 'Pricing'], ['#faq', 'FAQ']].map(([href, label]) => (
              <a key={label} href={href} style={{ fontSize: 14, fontWeight: 500, color: '#4a5568', textDecoration: 'none' }} onClick={() => setMobileOpen(false)}>
                {label}
              </a>
            ))}
            <div style={{ display: 'flex', flexDirection: 'column', gap: 8, paddingTop: 8, borderTop: '1px solid #dde5ef' }}>
              <button
                onClick={() => { navigate('/login'); setMobileOpen(false) }}
                style={{ padding: '10px', fontSize: 14, fontWeight: 600, color: '#4a5568', background: 'none', border: '1.5px solid #dde5ef', borderRadius: 9, cursor: 'pointer', fontFamily: "'Plus Jakarta Sans', system-ui, sans-serif" }}
              >
                Log in
              </button>
              <button
                onClick={() => { navigate('/get-started'); setMobileOpen(false) }}
                style={{ padding: '10px', fontSize: 14, fontWeight: 700, color: '#fff', background: '#d97706', border: 'none', borderRadius: 9, cursor: 'pointer', fontFamily: "'Plus Jakarta Sans', system-ui, sans-serif" }}
              >
                Get started free
              </button>
            </div>
          </div>
        )}
      </header>

      {/* ── Page content ── */}
      <main style={{ flex: 1 }}>{children}</main>

      {/* ── Footer ── */}
      <footer style={{ background: '#040c17', borderTop: '1px solid rgba(255,255,255,.07)', paddingBlock: '60px 32px' }}>
        <div style={{ maxWidth: 1280, margin: '0 auto', padding: '0 24px' }}>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(160px, 1fr))', gap: 40, marginBottom: 48 }}>
            <div style={{ gridColumn: 'span 2' }}>
              <div style={{ fontFamily: "'Space Grotesk', system-ui, sans-serif", fontWeight: 700, fontSize: 20, letterSpacing: '-.04em', color: '#fff', marginBottom: 12 }}>
                Pay<span style={{ color: '#E2B85A' }}>C</span>hamps
              </div>
              <div style={{ fontSize: 13, color: 'rgba(255,255,255,.35)', lineHeight: 1.6, maxWidth: 260, marginBottom: 16 }}>
                Payroll and HR software for teams of 10-500. Built for US businesses, priced fairly.
              </div>
              <div style={{ fontSize: 13, color: 'rgba(255,255,255,.3)' }}>
                PayChamps Inc., Delaware<br />
                <a href="mailto:support@paychamps.com" style={{ color: 'rgba(255,255,255,.3)', textDecoration: 'none' }}>support@paychamps.com</a>
              </div>
            </div>

            {[
              {
                title: 'Product',
                links: [['#features', 'Features'], ['#pricing', 'Pricing'], ['#compare', 'Compare']],
              },
              {
                title: 'Compare',
                links: [['#compare', 'vs Gusto'], ['#compare', 'vs ADP'], ['#compare', 'vs Rippling'], ['#compare', 'vs Paylocity']],
              },
              {
                title: 'Legal',
                links: [['/privacy', 'Privacy policy'], ['/terms', 'Terms of service'], ['/security', 'Security'], ['/accessibility', 'Accessibility']],
              },
            ].map(col => (
              <div key={col.title}>
                <div style={{ fontSize: 11, fontWeight: 700, letterSpacing: '.08em', textTransform: 'uppercase', color: 'rgba(255,255,255,.3)', marginBottom: 16, fontFamily: "'Plus Jakarta Sans', system-ui, sans-serif" }}>
                  {col.title}
                </div>
                <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
                  {col.links.map(([href, label]) => (
                    <a key={label} href={href} style={{ fontSize: 14, color: 'rgba(255,255,255,.45)', textDecoration: 'none', transition: 'color .15s' }}
                      onMouseEnter={e => (e.currentTarget.style.color = '#fff')}
                      onMouseLeave={e => (e.currentTarget.style.color = 'rgba(255,255,255,.45)')}
                    >
                      {label}
                    </a>
                  ))}
                </div>
              </div>
            ))}
          </div>

          <div style={{ borderTop: '1px solid rgba(255,255,255,.07)', paddingTop: 24, display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 16, flexWrap: 'wrap' }}>
            <div style={{ fontSize: 12, color: 'rgba(255,255,255,.25)' }}>
              © 2026 PayChamps Inc. All rights reserved.
            </div>
            <div style={{ display: 'flex', gap: 12 }}>
              {['SOC 2 TYPE II', 'GDPR', '256-BIT ENCRYPTION'].map(b => (
                <div key={b} style={{ fontSize: 10, fontWeight: 700, letterSpacing: '.05em', padding: '4px 10px', border: '1px solid rgba(255,255,255,.12)', borderRadius: 6, color: 'rgba(255,255,255,.3)', fontFamily: "'Plus Jakarta Sans', system-ui, sans-serif" }}>
                  {b}
                </div>
              ))}
            </div>
          </div>
        </div>
      </footer>
    </div>
  )
}
