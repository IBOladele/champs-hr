import { useRef } from 'react'
import { useNavigate } from 'react-router-dom'

export default function OtpVerify() {
  const navigate = useNavigate()
  const inputs = useRef<(HTMLInputElement | null)[]>([])

  function handleInput(i: number, e: React.ChangeEvent<HTMLInputElement>) {
    if (e.target.value && i < 5) inputs.current[i + 1]?.focus()
  }
  function handleKeyDown(i: number, e: React.KeyboardEvent<HTMLInputElement>) {
    if (e.key === 'Backspace' && !e.currentTarget.value && i > 0) inputs.current[i - 1]?.focus()
  }

  return (
    <div className="min-h-screen flex">
      {/* Left — marketing panel */}
      <div className="hidden lg:flex lg:w-[45%] relative bg-[#0f2d1a] overflow-hidden flex-col">
        <div className="absolute top-0 left-0 w-72 h-72 rounded-full bg-[#22c55e] opacity-20 -translate-x-1/3 -translate-y-1/3" />
        <div className="absolute top-1/3 right-0 w-48 h-48 rounded-full bg-[#bbf7d0] opacity-15 translate-x-1/3" />
        <div className="absolute bottom-0 left-1/3 w-56 h-56 rounded-full bg-[#22c55e] opacity-10 translate-y-1/3" />

        {/* Logo */}
        <div className="relative z-10 px-10 pt-10">
          <span className="text-2xl font-bold text-white tracking-widest">CHAMP</span>
        </div>

        {/* Illustration */}
        <div className="relative z-10 flex-1 flex flex-col justify-center px-10">
          <div className="bg-white/10 rounded-2xl p-5 max-w-xs">
            <p className="text-xs text-white/60 mb-3">Benefit enrollment by plan</p>
            {[
              { name: 'Health plan',    value: '78% of all employees', bar: 78,  color: 'bg-[#22c55e]' },
              { name: 'Paid time off',  value: '$4,500 Balance',        bar: 60,  color: 'bg-blue-400' },
              { name: 'Remote worktions',value: 'Full-time employees', bar: 45,  color: 'bg-amber-400' },
              { name: 'Professional dev',value: '480 of employees',    bar: 35,  color: 'bg-pink-400' },
            ].map((item, i) => (
              <div key={i} className="mb-3 last:mb-0">
                <div className="flex items-center justify-between mb-1">
                  <p className="text-xs text-white font-medium">{item.name}</p>
                  <p className="text-[10px] text-white/60">{item.value}</p>
                </div>
                <div className="h-1.5 bg-white/10 rounded-full overflow-hidden">
                  <div className={`h-full ${item.color} rounded-full`} style={{ width: `${item.bar}%` }} />
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Bottom copy */}
        <div className="relative z-10 px-10 pb-12">
          <h2 className="text-3xl font-bold text-white leading-tight mb-3">
            Benefits your people<br />will{' '}
            <span className="text-[#22c55e]">actually love</span>
          </h2>
          <p className="text-sm text-white/60 leading-relaxed max-w-xs">
            Health, pension, leave, and perks — all managed in one place. Employees self-enrol, HR approves, and everyone stays aligned in real time.
          </p>
        </div>
      </div>

      {/* Right — form panel */}
      <div className="flex-1 flex items-center justify-center px-8 py-12 bg-white">
        <div className="w-full max-w-sm">
          <div className="lg:hidden mb-8">
            <span className="text-2xl font-bold text-gray-900 tracking-widest">CHAMP</span>
          </div>

          {/* Icon */}
          <div className="w-12 h-12 bg-green-100 rounded-full flex items-center justify-center mb-6">
            <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="#22c55e" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <path d="M4 4h16c1.1 0 2 .9 2 2v12c0 1.1-.9 2-2 2H4c-1.1 0-2-.9-2-2V6c0-1.1.9-2 2-2z"/>
              <polyline points="22,6 12,13 2,6"/>
            </svg>
          </div>

          <h1 className="text-2xl font-bold text-gray-900 mb-1">Enter OTP info</h1>
          <p className="text-sm text-gray-500 mb-1">
            Please enter the OTP information that was sent to
          </p>
          <p className="text-sm font-medium text-gray-700 mb-7">***@gmail@champs.com</p>

          {/* OTP boxes */}
          <div className="flex gap-3 mb-2">
            {Array.from({ length: 6 }).map((_, i) => (
              <input
                key={i}
                ref={el => { inputs.current[i] = el }}
                type="text"
                maxLength={1}
                onChange={e => handleInput(i, e)}
                onKeyDown={e => handleKeyDown(i, e)}
                className="w-12 h-12 text-center text-lg font-bold border-2 border-gray-200 rounded-xl focus:outline-none focus:border-[#22c55e] transition-colors"
              />
            ))}
          </div>

          <p className="text-xs text-gray-400 mb-7">Resend code in <span className="text-gray-600 font-medium">23 Sec.</span></p>

          <button
            onClick={() => navigate('/onboarding')}
            className="w-full bg-[#22c55e] hover:bg-green-600 text-white font-semibold py-3 rounded-xl transition-colors text-sm"
          >
            Verify Account
          </button>
        </div>
      </div>
    </div>
  )
}
