import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { Building2, User } from 'lucide-react'

export default function RoleSelect() {
  const [role, setRole] = useState<'business' | 'employee'>('business')
  const navigate = useNavigate()

  return (
    <div className="min-h-screen flex">
      {/* Left — marketing panel */}
      <div className="hidden lg:flex lg:w-[45%] relative bg-[#0d1b2a] overflow-hidden flex-col">
        {/* Abstract organic shapes */}
        <div className="absolute top-0 left-0 w-72 h-72 rounded-full bg-[#22c55e] opacity-20 -translate-x-1/2 -translate-y-1/2" />
        <div className="absolute top-32 right-0 w-56 h-56 rounded-full bg-[#f0f4c3] opacity-15 translate-x-1/3" />
        <div className="absolute bottom-32 left-12 w-40 h-40 rounded-full bg-[#22c55e] opacity-15" />

        {/* Logo */}
        <div className="relative z-10 px-10 pt-10">
          <span className="text-2xl font-bold text-white tracking-widest">CHAMP</span>
        </div>

        {/* Illustration card */}
        <div className="relative z-10 flex-1 flex flex-col justify-center px-10">
          <div className="bg-white rounded-2xl p-5 shadow-xl mb-8 max-w-sm">
            <p className="text-xs text-gray-500 mb-3">Your employees</p>
            {[
              { name: 'Dave Johnson', role: 'Product Monitor · San Francisco, US', status: 'Active', color: 'bg-blue-500' },
              { name: 'Lian Brown',  role: 'CO-Design · Team Denver',              status: '$4,420', color: 'bg-pink-500' },
              { name: 'LN/WLMC',    role: 'Data monster · London, LK',             status: 'Onboarding', color: 'bg-green-500' },
              { name: 'Muriel Ian', role: 'Sr. AppDeveloper · Sydney, Australia',  status: '★',         color: 'bg-orange-400' },
            ].map((e, i) => (
              <div key={i} className="flex items-center gap-3 py-2 border-b border-gray-50 last:border-0">
                <div className={`w-7 h-7 rounded-full ${e.color} flex items-center justify-center text-white text-xs font-semibold flex-shrink-0`}>
                  {e.name[0]}
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-xs font-medium text-gray-800 truncate">{e.name}</p>
                  <p className="text-[10px] text-gray-400 truncate">{e.role}</p>
                </div>
                <span className="text-[10px] text-green-600 font-medium flex-shrink-0">{e.status}</span>
              </div>
            ))}
          </div>
        </div>

        {/* Bottom copy */}
        <div className="relative z-10 px-10 pb-12">
          <h2 className="text-3xl font-bold text-white leading-tight mb-3">
            Onboard employees<br />
            <span className="text-[#22c55e]">3× faster</span>
          </h2>
          <p className="text-sm text-gray-400 leading-relaxed max-w-xs">
            Powerful tools to run payroll, manage benefits, and keep your entire team aligned — all in one place.
          </p>
        </div>
      </div>

      {/* Right — form panel */}
      <div className="flex-1 flex items-center justify-center px-8 py-12 bg-white">
        <div className="w-full max-w-sm">
          {/* Mobile logo */}
          <div className="lg:hidden mb-8">
            <span className="text-2xl font-bold text-gray-900 tracking-widest">CHAMP</span>
          </div>

          <h1 className="text-2xl font-bold text-gray-900 mb-1">How will you use CHAMP</h1>
          <p className="text-sm text-gray-500 mb-6">Please select an option below</p>

          <p className="text-xs font-medium text-gray-500 mb-3 uppercase tracking-wide">How do you plan to use us</p>

          <div className="space-y-3 mb-8">
            {/* As a Business */}
            <label
              className={`flex items-start gap-3 p-4 rounded-xl border-2 cursor-pointer transition-colors ${
                role === 'business' ? 'border-[#22c55e] bg-green-50' : 'border-gray-200 hover:border-gray-300'
              }`}
            >
              <input
                type="radio"
                name="role"
                value="business"
                checked={role === 'business'}
                onChange={() => setRole('business')}
                className="mt-0.5 accent-[#22c55e]"
              />
              <div className="flex-1">
                <div className="flex items-center gap-2">
                  <Building2 size={15} className="text-gray-600" />
                  <p className="text-sm font-semibold text-gray-900">As a Business</p>
                </div>
                <p className="text-xs text-gray-500 mt-0.5">Manage your business operations all in one</p>
              </div>
            </label>

            {/* As an employee */}
            <label
              className={`flex items-start gap-3 p-4 rounded-xl border-2 cursor-pointer transition-colors ${
                role === 'employee' ? 'border-[#22c55e] bg-green-50' : 'border-gray-200 hover:border-gray-300'
              }`}
            >
              <input
                type="radio"
                name="role"
                value="employee"
                checked={role === 'employee'}
                onChange={() => setRole('employee')}
                className="mt-0.5 accent-[#22c55e]"
              />
              <div className="flex-1">
                <div className="flex items-center gap-2">
                  <User size={15} className="text-gray-600" />
                  <p className="text-sm font-semibold text-gray-900">As an employee</p>
                </div>
                <p className="text-xs text-gray-500 mt-0.5">Use CHAMP to connect to your employer</p>
              </div>
            </label>
          </div>

          <button
            onClick={() => navigate('/signup')}
            className="w-full bg-[#22c55e] hover:bg-green-600 text-white font-semibold py-3 rounded-xl transition-colors text-sm"
          >
            Continue
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
