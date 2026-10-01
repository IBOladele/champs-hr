import { useEffect, useState } from 'react'
import { useNavigate, useSearchParams } from 'react-router-dom'
import { auth } from '../../lib/api'
import { useAuth } from '../../context/AuthContext'

export default function VerifyEmail() {
  const [params] = useSearchParams()
  const navigate = useNavigate()
  const { refreshUser } = useAuth()
  const [status, setStatus] = useState<'loading' | 'success' | 'error'>('loading')
  const [message, setMessage] = useState('')

  useEffect(() => {
    const token = params.get('token')
    if (!token) {
      setStatus('error')
      setMessage('No verification token found.')
      return
    }

    auth.verifyEmail(token)
      .then(async () => {
        await refreshUser()
        setStatus('success')
      })
      .catch((err) => {
        setStatus('error')
        setMessage(err.message ?? 'Verification failed.')
      })
  }, [params, refreshUser])

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 px-4">
      <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-10 max-w-sm w-full text-center">
        {status === 'loading' && (
          <>
            <div className="w-12 h-12 border-4 border-[#22c55e] border-t-transparent rounded-full animate-spin mx-auto mb-4" />
            <p className="text-sm text-gray-500">Verifying your email…</p>
          </>
        )}

        {status === 'success' && (
          <>
            <div className="w-14 h-14 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <svg className="w-7 h-7 text-[#22c55e]" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
              </svg>
            </div>
            <h2 className="text-xl font-bold text-gray-900 mb-2">Email verified!</h2>
            <p className="text-sm text-gray-500 mb-6">Your email has been confirmed. You're all set.</p>
            <button
              onClick={() => navigate('/employer')}
              className="bg-[#22c55e] hover:bg-green-600 text-white font-semibold px-6 py-2.5 rounded-xl transition-colors text-sm w-full"
            >
              Go to dashboard
            </button>
          </>
        )}

        {status === 'error' && (
          <>
            <div className="w-14 h-14 bg-red-50 rounded-full flex items-center justify-center mx-auto mb-4">
              <svg className="w-7 h-7 text-red-500" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
              </svg>
            </div>
            <h2 className="text-xl font-bold text-gray-900 mb-2">Verification failed</h2>
            <p className="text-sm text-gray-500 mb-6">{message || 'This link is invalid or has expired.'}</p>
            <button
              onClick={() => navigate('/onboarding')}
              className="text-sm text-[#22c55e] hover:underline"
            >
              Back to onboarding
            </button>
          </>
        )}
      </div>
    </div>
  )
}
