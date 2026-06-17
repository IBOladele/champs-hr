import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { Eye, EyeOff } from 'lucide-react'

export default function Login() {
  const [showPassword, setShowPassword] = useState(false)
  const navigate = useNavigate()

  return (
    <div className="min-h-screen flex">
      {/* Left — marketing panel */}
      <div className="hidden lg:flex lg:w-[45%] relative bg-[#0d1b2a] overflow-hidden flex-col">
        <div className="absolute top-0 right-0 w-80 h-80 rounded-full bg-[#22c55e] opacity-20 translate-x-1/3 -translate-y-1/3" />
        <div className="absolute bottom-0 left-0 w-64 h-64 rounded-full bg-[#f0f4c3] opacity-10 -translate-x-1/4 translate-y-1/4" />
        <div className="absolute top-1/2 right-1/4 w-40 h-40 rounded-full bg-[#22c55e] opacity-10" />

        {/* Logo */}
        <div className="relative z-10 px-10 pt-10">
          <span className="text-2xl font-bold text-white tracking-widest">CHAMP</span>
        </div>

        {/* Illustration */}
        <div className="relative z-10 flex-1 flex flex-col justify-center px-10">
          <div className="bg-white/10 rounded-2xl p-5 shadow-xl mb-6 max-w-sm">
            <div className="flex items-center justify-between mb-4">
              <p className="text-xs text-white/60">Total payroll</p>
              <span className="text-xs bg-[#22c55e]/20 text-[#22c55e] px-2 py-0.5 rounded-full">↑ 12.5%</span>
            </div>
            <p className="text-2xl font-bold text-white mb-4">$870,000</p>
            <div className="space-y-2">
              {[
                { role: 'Marketing Manager', salary: '$90,000' },
                { role: 'Product Manager',   salary: '$115,000' },
                { role: 'Software Engineer', salary: '$120,000' },
              ].map((r, i) => (
                <div key={i} className="flex items-center justify-between">
                  <p className="text-xs text-white/70">{r.role}</p>
                  <p className="text-xs font-semibold text-white">{r.salary}</p>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Bottom copy */}
        <div className="relative z-10 px-10 pb-12">
          <h2 className="text-3xl font-bold text-white leading-tight mb-3">
            Run your{' '}
            <span className="text-[#22c55e]">Global payroll</span>
            <br />in minutes
          </h2>
          <p className="text-sm text-gray-400 leading-relaxed max-w-xs">
            Pay contractors and full-time employees in 150+ countries, stay compliant, and scale with confidence.
          </p>
        </div>
      </div>

      {/* Right — form panel */}
      <div className="flex-1 flex items-center justify-center px-8 py-12 bg-white">
        <div className="w-full max-w-sm">
          <div className="lg:hidden mb-8">
            <span className="text-2xl font-bold text-gray-900 tracking-widest">CHAMP</span>
          </div>

          <h1 className="text-2xl font-bold text-gray-900 mb-1">Login to your account</h1>
          <p className="text-sm text-gray-500 mb-7">Enter your credentials to access your workspace</p>

          <div className="space-y-4">
            <div>
              <label className="block text-xs font-medium text-gray-700 mb-1.5">Email Address</label>
              <input
                type="email"
                placeholder="Enter email address"
                className="w-full px-3 py-2.5 text-sm border border-gray-200 rounded-lg focus:outline-none focus:border-[#22c55e]"
              />
            </div>

            <div>
              <div className="flex items-center justify-between mb-1.5">
                <label className="text-xs font-medium text-gray-700">Password</label>
                <button className="text-xs text-[#22c55e] hover:underline">Forgot password?</button>
              </div>
              <div className="relative">
                <input
                  type={showPassword ? 'text' : 'password'}
                  placeholder="••••••••••••••"
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

          <button
            onClick={() => navigate('/employer')}
            className="w-full mt-7 bg-[#22c55e] hover:bg-green-600 text-white font-semibold py-3 rounded-xl transition-colors text-sm"
          >
            Login
          </button>

          <p className="text-center text-sm text-gray-500 mt-4">
            Don't have an account?{' '}
            <button onClick={() => navigate('/get-started')} className="text-[#22c55e] font-semibold hover:underline">
              Get started
            </button>
          </p>
        </div>
      </div>
    </div>
  )
}
