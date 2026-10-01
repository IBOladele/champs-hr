import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { Eye, EyeOff } from 'lucide-react'
import { useAuth } from '../../context/AuthContext'
import { ApiError } from '../../lib/api'

export default function Signup() {
  const [firstName, setFirstName] = useState('')
  const [lastName, setLastName] = useState('')
  const [companyName, setCompanyName] = useState('')
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [showPassword, setShowPassword] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [loading, setLoading] = useState(false)

  const { signup } = useAuth()
  const navigate = useNavigate()

  async function handleSubmit() {
    setError(null)
    const fullName = `${firstName.trim()} ${lastName.trim()}`.trim()
    if (!firstName || !lastName) { setError('Please enter your first and last name'); return }
    if (!companyName) { setError('Please enter your company name'); return }
    if (!email) { setError('Please enter your email address'); return }
    if (!password) { setError('Please enter a password'); return }

    setLoading(true)
    try {
      await signup({ email, password, fullName, companyName })
      navigate('/onboarding')
    } catch (err) {
      if (err instanceof ApiError) {
        if (Array.isArray((err as { message: unknown }).message)) {
          // Zod validation array — extract first message
          const first = (err as unknown as { message: { message: string }[] }).message[0]
          setError(first?.message ?? 'Validation failed')
        } else {
          setError(err.message)
        }
      } else {
        setError('Something went wrong. Please try again.')
      }
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen flex">
      {/* Left — marketing panel */}
      <div className="hidden lg:flex lg:w-[45%] relative bg-[#0d2a1a] overflow-hidden flex-col">
        <div className="absolute top-0 right-0 w-80 h-80 rounded-full bg-[#22c55e] opacity-20 translate-x-1/3 -translate-y-1/3" />
        <div className="absolute bottom-0 left-0 w-64 h-64 rounded-full bg-[#bbf7d0] opacity-10 -translate-x-1/4 translate-y-1/4" />
        <div className="absolute top-1/2 left-1/2 w-48 h-48 rounded-full bg-[#22c55e] opacity-10 -translate-x-1/2 -translate-y-1/2" />

        <div className="relative z-10 px-10 pt-10">
          <span className="text-2xl font-bold text-white tracking-widest">CHAMP</span>
        </div>

        <div className="relative z-10 flex-1 flex flex-col justify-center px-10">
          <div className="bg-white/10 rounded-2xl p-5 mb-6 max-w-xs">
            <p className="text-xs text-white/60 mb-3">Attendance hours</p>
            <p className="text-2xl font-bold text-white mb-4">848 hours</p>
            <div className="flex items-end gap-1.5 h-16">
              {[30, 60, 45, 80, 55, 70, 40, 65].map((h, i) => (
                <div key={i} className="flex-1 rounded-t-sm" style={{ height: `${h}%`, backgroundColor: i === 3 ? '#22c55e' : 'rgba(255,255,255,0.25)' }} />
              ))}
            </div>
            <div className="mt-3 flex items-center gap-2 bg-[#22c55e] rounded-lg px-3 py-2">
              <p className="text-xs text-white font-medium">Total payroll</p>
              <p className="text-sm font-bold text-white ml-auto">$456,432</p>
            </div>
          </div>
        </div>

        <div className="relative z-10 px-10 pb-12">
          <h2 className="text-3xl font-bold text-white leading-tight mb-3">
            Real-time HR insights<br />
            <span className="text-[#22c55e]">at a glance</span>
          </h2>
          <p className="text-sm text-white/60 leading-relaxed max-w-xs">
            Track headcount growth, attrition trends, payroll figures — run performance from a single live dashboard.
          </p>
        </div>
      </div>

      {/* Right — form panel */}
      <div className="flex-1 flex items-center justify-center px-8 py-12 bg-white">
        <div className="w-full max-w-sm">
          <div className="lg:hidden mb-8">
            <span className="text-2xl font-bold text-gray-900 tracking-widest">CHAMP</span>
          </div>

          <h1 className="text-2xl font-bold text-gray-900 mb-1">Create your account</h1>
          <p className="text-sm text-gray-500 mb-7">Please enter your personal information</p>

          <div className="space-y-4">
            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="block text-xs font-medium text-gray-700 mb-1.5">First name</label>
                <input
                  type="text"
                  placeholder="First name"
                  value={firstName}
                  onChange={e => setFirstName(e.target.value)}
                  className="w-full px-3 py-2.5 text-sm border border-gray-200 rounded-lg focus:outline-none focus:border-[#22c55e]"
                />
              </div>
              <div>
                <label className="block text-xs font-medium text-gray-700 mb-1.5">Last name</label>
                <input
                  type="text"
                  placeholder="Last name"
                  value={lastName}
                  onChange={e => setLastName(e.target.value)}
                  className="w-full px-3 py-2.5 text-sm border border-gray-200 rounded-lg focus:outline-none focus:border-[#22c55e]"
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-medium text-gray-700 mb-1.5">Company name</label>
              <input
                type="text"
                placeholder="Acme Corp"
                value={companyName}
                onChange={e => setCompanyName(e.target.value)}
                className="w-full px-3 py-2.5 text-sm border border-gray-200 rounded-lg focus:outline-none focus:border-[#22c55e]"
              />
            </div>

            <div>
              <label className="block text-xs font-medium text-gray-700 mb-1.5">Email Address</label>
              <input
                type="email"
                placeholder="you@company.com"
                value={email}
                onChange={e => setEmail(e.target.value)}
                className="w-full px-3 py-2.5 text-sm border border-gray-200 rounded-lg focus:outline-none focus:border-[#22c55e]"
              />
            </div>

            <div>
              <label className="block text-xs font-medium text-gray-700 mb-1.5">Password</label>
              <div className="relative">
                <input
                  type={showPassword ? 'text' : 'password'}
                  placeholder="Min 8 chars, upper, lower, number, symbol"
                  value={password}
                  onChange={e => setPassword(e.target.value)}
                  className="w-full px-3 py-2.5 text-sm border border-gray-200 rounded-lg focus:outline-none focus:border-[#22c55e] pr-10"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600"
                >
                  {showPassword ? <EyeOff size={15} /> : <Eye size={15} />}
                </button>
              </div>
            </div>
          </div>

          {error && (
            <p className="mt-4 text-sm text-red-600 bg-red-50 rounded-lg px-3 py-2">{error}</p>
          )}

          <button
            onClick={handleSubmit}
            disabled={loading}
            className="w-full mt-7 bg-[#22c55e] hover:bg-green-600 disabled:opacity-60 disabled:cursor-not-allowed text-white font-semibold py-3 rounded-xl transition-colors text-sm flex items-center justify-center gap-2"
          >
            {loading && <span className="w-4 h-4 border-2 border-white/40 border-t-white rounded-full animate-spin" />}
            {loading ? 'Creating account…' : 'Continue'}
          </button>

          <p className="text-center text-sm text-gray-500 mt-4">
            Already have an Account?{' '}
            <button onClick={() => navigate('/login')} className="text-[#22c55e] font-semibold hover:underline">
              Login
            </button>
          </p>
        </div>
      </div>
    </div>
  )
}
