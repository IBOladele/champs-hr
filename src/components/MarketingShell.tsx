import { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { Menu, X, ChevronDown } from 'lucide-react'
import { Logo } from './Logo'

interface MarketingShellProps {
  children: React.ReactNode
  title?: string
  description?: string
}

export default function MarketingShell({ children }: MarketingShellProps) {
  const navigate = useNavigate()
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false)
  const [compareOpen, setCompareOpen] = useState(false)

  return (
    <div className="min-h-screen bg-white font-sans flex flex-col">
      {/* ── Header ── */}
      <header className="sticky top-0 z-50 bg-white/90 backdrop-blur border-b border-gray-100">
        <div className="max-w-7xl mx-auto px-6 py-4 flex items-center justify-between">
          {/* Logo */}
          <Link to="/" className="flex items-center">
            <Logo size={28} />
          </Link>

          {/* Desktop nav */}
          <nav className="hidden md:flex items-center gap-8">
            <Link to="/features" className="text-sm text-gray-500 hover:text-gray-900 transition-colors">
              Features
            </Link>
            <Link to="/pricing" className="text-sm text-gray-500 hover:text-gray-900 transition-colors">
              Pricing
            </Link>
            <Link to="/security" className="text-sm text-gray-500 hover:text-gray-900 transition-colors">
              Security
            </Link>
            <Link to="/switch" className="text-sm text-gray-500 hover:text-gray-900 transition-colors">
              Switch
            </Link>
            {/* Compare dropdown */}
            <div className="relative">
              <button
                className="flex items-center gap-1 text-sm text-gray-500 hover:text-gray-900 transition-colors"
                onMouseEnter={() => setCompareOpen(true)}
                onMouseLeave={() => setCompareOpen(false)}
                onClick={() => setCompareOpen(!compareOpen)}
              >
                Compare
                <ChevronDown size={14} />
              </button>
              {compareOpen && (
                <div
                  className="absolute top-full left-0 mt-1 bg-white border border-gray-100 rounded-xl shadow-lg py-2 min-w-44 z-50"
                  onMouseEnter={() => setCompareOpen(true)}
                  onMouseLeave={() => setCompareOpen(false)}
                >
                  <Link
                    to="/compare/gusto"
                    className="block px-4 py-2 text-sm text-gray-600 hover:text-gray-900 hover:bg-gray-50"
                    onClick={() => setCompareOpen(false)}
                  >
                    vs Gusto
                  </Link>
                  <Link
                    to="/compare/adp"
                    className="block px-4 py-2 text-sm text-gray-600 hover:text-gray-900 hover:bg-gray-50"
                    onClick={() => setCompareOpen(false)}
                  >
                    vs ADP
                  </Link>
                  <Link
                    to="/compare/rippling"
                    className="block px-4 py-2 text-sm text-gray-600 hover:text-gray-900 hover:bg-gray-50"
                    onClick={() => setCompareOpen(false)}
                  >
                    vs Rippling
                  </Link>
                </div>
              )}
            </div>
          </nav>

          {/* CTA buttons */}
          <div className="hidden md:flex items-center gap-3">
            <button
              onClick={() => navigate('/login')}
              className="px-4 py-2 text-sm font-medium text-gray-700 hover:text-gray-900 transition-colors"
            >
              Log in
            </button>
            <button
              onClick={() => navigate('/get-started')}
              className="px-4 py-2 text-sm font-medium text-white rounded-lg transition-colors"
              style={{ backgroundColor: '#22c55e' }}
            >
              Get started free
            </button>
          </div>

          {/* Mobile toggle */}
          <button
            className="md:hidden p-2 text-gray-500"
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
          >
            {mobileMenuOpen ? <X size={20} /> : <Menu size={20} />}
          </button>
        </div>

        {/* Mobile menu */}
        {mobileMenuOpen && (
          <div className="md:hidden border-t border-gray-100 px-6 py-4 flex flex-col gap-4 bg-white">
            <Link to="/features" className="text-sm text-gray-600" onClick={() => setMobileMenuOpen(false)}>Features</Link>
            <Link to="/pricing" className="text-sm text-gray-600" onClick={() => setMobileMenuOpen(false)}>Pricing</Link>
            <Link to="/security" className="text-sm text-gray-600" onClick={() => setMobileMenuOpen(false)}>Security</Link>
            <Link to="/switch" className="text-sm text-gray-600" onClick={() => setMobileMenuOpen(false)}>Switch</Link>
            <div className="pl-2 flex flex-col gap-2 border-l border-gray-100">
              <Link to="/compare/gusto" className="text-sm text-gray-500" onClick={() => setMobileMenuOpen(false)}>vs Gusto</Link>
              <Link to="/compare/adp" className="text-sm text-gray-500" onClick={() => setMobileMenuOpen(false)}>vs ADP</Link>
              <Link to="/compare/rippling" className="text-sm text-gray-500" onClick={() => setMobileMenuOpen(false)}>vs Rippling</Link>
            </div>
            <div className="flex flex-col gap-2 pt-2 border-t border-gray-100">
              <button
                onClick={() => { navigate('/login'); setMobileMenuOpen(false) }}
                className="px-4 py-2 text-sm font-medium text-gray-700 border border-gray-200 rounded-lg"
              >
                Log in
              </button>
              <button
                onClick={() => { navigate('/get-started'); setMobileMenuOpen(false) }}
                className="px-4 py-2 text-sm font-medium text-white rounded-lg"
                style={{ backgroundColor: '#22c55e' }}
              >
                Get started free
              </button>
            </div>
          </div>
        )}
      </header>

      {/* ── Page content ── */}
      <main className="flex-1">{children}</main>

      {/* ── Footer ── */}
      <footer className="bg-gray-50 border-t border-gray-100 py-14">
        <div className="max-w-7xl mx-auto px-6">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-10 mb-10">
            {/* Brand */}
            <div className="md:col-span-2">
              <Link to="/" className="inline-flex mb-3">
                <Logo size={24} />
              </Link>
              <p className="text-xs text-gray-500 leading-relaxed max-w-xs">
                Payroll and HR software for teams of 10–500. Built for US businesses.
              </p>
              <p className="text-xs text-gray-400 mt-4">
                PayChamps Inc., incorporated in Delaware<br />
                123 Market Street, San Francisco CA 94105
              </p>
              <p className="text-xs text-gray-400 mt-2">
                <a href="mailto:support@paychamps.com" className="hover:text-gray-600">
                  support@paychamps.com
                </a>
                <span className="mx-2">·</span>
                +1 (800) 000-0000
              </p>
            </div>

            {/* Product links */}
            <div>
              <p className="text-xs font-semibold uppercase tracking-wider text-gray-400 mb-4">Product</p>
              <ul className="space-y-2 text-sm text-gray-500">
                <li><Link to="/features" className="hover:text-gray-900">Features</Link></li>
                <li><Link to="/pricing" className="hover:text-gray-900">Pricing</Link></li>
                <li><Link to="/security" className="hover:text-gray-900">Security</Link></li>
                <li><Link to="/switch" className="hover:text-gray-900">Switch</Link></li>
              </ul>
            </div>

            {/* Legal links */}
            <div>
              <p className="text-xs font-semibold uppercase tracking-wider text-gray-400 mb-4">Legal</p>
              <ul className="space-y-2 text-sm text-gray-500">
                <li><a href="/privacy" className="hover:text-gray-900">Privacy policy</a></li>
                <li><a href="/terms" className="hover:text-gray-900">Terms of service</a></li>
                <li><Link to="/security" className="hover:text-gray-900">Security</Link></li>
                <li><a href="/accessibility" className="hover:text-gray-900">Accessibility statement</a></li>
              </ul>
            </div>
          </div>

          <div className="border-t border-gray-200 pt-6">
            <p className="text-xs text-gray-400 text-center">
              © 2026 PayChamps Inc. All rights reserved. Incorporated in Delaware.
            </p>
          </div>
        </div>
      </footer>
    </div>
  )
}
