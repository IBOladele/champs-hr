import { useState, useEffect } from 'react'
import { useNavigate, useSearchParams } from 'react-router-dom'
import { Eye, EyeOff, CheckCircle2, AlertCircle, Loader2 } from 'lucide-react'
import { invites, ApiError } from '../../lib/api'
import type { InviteDetails } from '../../lib/api'
import { Logo } from '../../components/Logo'
import { usePageTitle } from '../../hooks/usePageTitle'

export default function AcceptInvite() {
  usePageTitle('Set up your account')

  const [searchParams] = useSearchParams()
  const token = searchParams.get('token') ?? ''
  const navigate = useNavigate()

  const [invite, setInvite] = useState<InviteDetails | null>(null)
  const [loadError, setLoadError] = useState<string | null>(null)
  const [loading, setLoading] = useState(true)

  const [fullName, setFullName] = useState('')
  const [password, setPassword] = useState('')
  const [confirm, setConfirm] = useState('')
  const [showPw, setShowPw] = useState(false)
  const [showConfirm, setShowConfirm] = useState(false)
  const [submitting, setSubmitting] = useState(false)
  const [submitError, setSubmitError] = useState<string | null>(null)

  useEffect(() => {
    if (!token) {
      setLoadError('No invite token found. Please use the link from your email.')
      setLoading(false)
      return
    }
    invites.get(token)
      .then(data => {
        setInvite(data)
        if (data.fullName) setFullName(data.fullName)
      })
      .catch(() => setLoadError('This invite link is invalid, expired, or has already been used.'))
      .finally(() => setLoading(false))
  }, [token])

  async function handleSubmit() {
    setSubmitError(null)
    if (!fullName.trim()) { setSubmitError('Please enter your full name'); return }
    if (!password) { setSubmitError('Please enter a password'); return }
    if (password !== confirm) { setSubmitError('Passwords do not match'); return }

    setSubmitting(true)
    try {
      await invites.accept(token, { password, fullName: fullName.trim() })
      navigate('/employee', { replace: true })
    } catch (err) {
      if (err instanceof ApiError) {
        const msg = Array.isArray((err as unknown as { message: { message: string }[] }).message)
          ? (err as unknown as { message: { message: string }[] }).message[0]?.message
          : err.message
        setSubmitError(msg ?? 'Something went wrong. Please try again.')
      } else {
        setSubmitError('Something went wrong. Please try again.')
      }
    } finally {
      setSubmitting(false)
    }
  }

  function handleKeyDown(e: React.KeyboardEvent) {
    if (e.key === 'Enter') handleSubmit()
  }

  const inputCls =
    'w-full px-3 py-3 text-sm border border-gray-200 rounded-lg focus:outline-none focus:border-[#22c55e] focus:ring-2 focus:ring-[#22c55e]/10'

  // ── Loading state ─────────────────────────────────────────────────────────
  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <Loader2 size={28} className="animate-spin text-[#22c55e]" />
      </div>
    )
  }

  // ── Invalid / expired invite ──────────────────────────────────────────────
  if (loadError || !invite) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center px-4">
        <div className="w-full max-w-sm bg-white rounded-2xl border border-gray-100 shadow-sm px-7 py-9 text-center">
          <AlertCircle size={40} className="text-red-400 mx-auto mb-4" />
          <h1 className="text-xl font-bold text-gray-900 mb-2">Invite not found</h1>
          <p className="text-sm text-gray-500 leading-relaxed mb-6">
            {loadError}
          </p>
          <button
            onClick={() => navigate('/login')}
            className="text-sm text-[#22c55e] font-semibold hover:underline"
          >
            Go to login
          </button>
        </div>
      </div>
    )
  }

  // ── Accept form ───────────────────────────────────────────────────────────
  return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center px-4 py-10">
      <div className="w-full max-w-sm bg-white rounded-2xl border border-gray-100 shadow-sm px-7 py-9">
        <div className="mb-7">
          <Logo size={28} />
        </div>

        {/* Invite banner */}
        <div className="flex items-start gap-3 bg-green-50 border border-green-100 rounded-xl px-4 py-3 mb-7">
          <CheckCircle2 size={16} className="text-[#22c55e] flex-shrink-0 mt-0.5" />
          <div>
            <p className="text-sm font-semibold text-gray-900">{invite.companyName}</p>
            <p className="text-xs text-gray-500 mt-0.5">
              You've been invited to join their PayChamps workspace.
            </p>
          </div>
        </div>

        <h1 className="text-2xl font-bold text-gray-900 mb-1">Set up your account</h1>
        <p className="text-sm text-gray-500 mb-7">
          You're signing in as <span className="font-medium text-gray-700">{invite.email}</span>
        </p>

        <div className="space-y-4">
          <div>
            <label className="block text-xs font-medium text-gray-700 mb-1.5">Full name</label>
            <input
              type="text"
              placeholder="Your full name"
              value={fullName}
              onChange={e => setFullName(e.target.value)}
              onKeyDown={handleKeyDown}
              autoComplete="name"
              className={inputCls}
            />
          </div>

          <div>
            <label className="block text-xs font-medium text-gray-700 mb-1.5">Create a password</label>
            <div className="relative">
              <input
                type={showPw ? 'text' : 'password'}
                placeholder="Min 8 chars, upper, lower, number, symbol"
                value={password}
                onChange={e => setPassword(e.target.value)}
                onKeyDown={handleKeyDown}
                autoComplete="new-password"
                className={`${inputCls} pr-10`}
              />
              <button
                type="button"
                aria-label="Toggle password visibility"
                onClick={() => setShowPw(v => !v)}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600"
              >
                {showPw ? <EyeOff size={15} /> : <Eye size={15} />}
              </button>
            </div>
          </div>

          <div>
            <label className="block text-xs font-medium text-gray-700 mb-1.5">Confirm password</label>
            <div className="relative">
              <input
                type={showConfirm ? 'text' : 'password'}
                placeholder="Re-enter your password"
                value={confirm}
                onChange={e => setConfirm(e.target.value)}
                onKeyDown={handleKeyDown}
                autoComplete="new-password"
                className={`${inputCls} pr-10`}
              />
              <button
                type="button"
                aria-label="Toggle confirm password visibility"
                onClick={() => setShowConfirm(v => !v)}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600"
              >
                {showConfirm ? <EyeOff size={15} /> : <Eye size={15} />}
              </button>
            </div>
          </div>
        </div>

        {submitError && (
          <p className="mt-4 text-sm text-red-600 bg-red-50 rounded-lg px-3 py-2">{submitError}</p>
        )}

        <button
          onClick={handleSubmit}
          disabled={submitting}
          className="w-full mt-7 bg-[#22c55e] hover:bg-green-600 disabled:opacity-60 disabled:cursor-not-allowed text-white font-semibold py-3 rounded-xl transition-colors text-sm flex items-center justify-center gap-2"
        >
          {submitting && <span className="w-4 h-4 border-2 border-white/40 border-t-white rounded-full animate-spin" />}
          {submitting ? 'Setting up...' : 'Activate my account'}
        </button>

        <p className="text-center text-sm text-gray-500 mt-5">
          Already have an account?{' '}
          <button onClick={() => navigate('/login')} className="text-[#22c55e] font-semibold hover:underline">
            Login
          </button>
        </p>
      </div>
    </div>
  )
}
