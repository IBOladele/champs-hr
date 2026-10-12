import { useState, useEffect } from 'react'
import { TrendingUp, TrendingDown, Users, UserCheck, UserPlus, Activity, Calendar, DollarSign, Clock } from 'lucide-react'
import { stats, employees as employeesApi, payroll as payrollApi } from '../../lib/api'
import type { DashboardStats, Employee, PayrollRun } from '../../lib/api'

type AnalyticsTab = 'all' | 'payroll' | 'employee' | 'attendance'

const AMBER = '#d97706'

const tabs: { key: AnalyticsTab; label: string }[] = [
  { key: 'all',        label: 'Overview'                       },
  { key: 'employee',   label: 'Employee analytics'             },
  { key: 'payroll',    label: 'Payroll analytics'              },
  { key: 'attendance', label: 'Attendance & leave'             },
]

// ── Stat card ──────────────────────────────────────────────────────────────────
function StatCard({
  label, value, sub, positive, icon, accent = false,
}: {
  label: string; value: string; sub?: string; positive?: boolean; icon: React.ReactNode; accent?: boolean
}) {
  return (
    <div className={`bg-white rounded-xl border p-5 relative overflow-hidden ${accent ? 'border-amber-200' : 'border-gray-100'}`}>
      {accent && <div className="absolute inset-0 bg-amber-50 opacity-40 pointer-events-none" />}
      <div className="relative">
        <div className="flex items-center justify-between mb-3">
          <p className="text-xs font-medium text-gray-400 uppercase tracking-wide">{label}</p>
          <div className="w-8 h-8 rounded-lg bg-gray-50 flex items-center justify-center text-gray-400">
            {icon}
          </div>
        </div>
        <p className="text-3xl font-bold text-gray-900 tracking-tight">{value}</p>
        {sub && (
          <div className={`flex items-center gap-1 mt-1.5 text-xs font-medium ${
            positive === undefined ? 'text-gray-400' : positive ? 'text-emerald-600' : 'text-red-500'
          }`}>
            {positive !== undefined && (positive ? <TrendingUp size={11} /> : <TrendingDown size={11} />)}
            <span>{sub}</span>
          </div>
        )}
      </div>
    </div>
  )
}

// ── Inline bar chart (SVG) ─────────────────────────────────────────────────────
function BarChart({ data, color = AMBER }: { data: { label: string; value: number }[]; color?: string }) {
  const max = Math.max(...data.map(d => d.value), 1)
  return (
    <div className="flex items-end gap-2 h-32">
      {data.map((d, i) => (
        <div key={i} className="flex flex-col items-center flex-1 gap-1">
          <span className="text-xs text-gray-500 font-medium tabular-nums">
            {d.value > 0 ? (d.value >= 1000 ? `$${(d.value / 1000).toFixed(0)}k` : d.value) : ''}
          </span>
          <div
            className="w-full rounded-t-md transition-all"
            style={{
              height: `${Math.max((d.value / max) * 88, d.value > 0 ? 6 : 2)}px`,
              background: i === data.length - 1 ? color : '#f0f4f8',
              minHeight: 2,
            }}
          />
          <span className="text-xs text-gray-400">{d.label}</span>
        </div>
      ))}
    </div>
  )
}

// ── Donut chart (SVG) ─────────────────────────────────────────────────────────
function DonutChart({ segments }: { segments: { label: string; value: number; color: string }[] }) {
  const total = segments.reduce((s, d) => s + d.value, 0) || 1
  let offset = 0
  const r = 40
  const circ = 2 * Math.PI * r
  return (
    <div className="flex items-center gap-5">
      <svg width="96" height="96" viewBox="0 0 96 96">
        {total === 0 ? (
          <circle cx="48" cy="48" r={r} fill="none" stroke="#e5e7eb" strokeWidth="14" />
        ) : (
          segments.map((seg, i) => {
            const pct = seg.value / total
            const dash = pct * circ
            const gap = circ - dash
            const rotate = offset * 360 - 90
            offset += pct
            return (
              <circle
                key={i}
                cx="48" cy="48" r={r}
                fill="none"
                stroke={seg.color}
                strokeWidth="14"
                strokeDasharray={`${dash} ${gap}`}
                transform={`rotate(${rotate} 48 48)`}
                strokeLinecap="butt"
              />
            )
          })
        )}
        <text x="48" y="52" textAnchor="middle" fontSize="14" fontWeight="700" fill="#111827">
          {total}
        </text>
      </svg>
      <div className="flex flex-col gap-2">
        {segments.map((seg, i) => (
          <div key={i} className="flex items-center gap-2 text-xs text-gray-600">
            <div className="w-2.5 h-2.5 rounded-full flex-shrink-0" style={{ background: seg.color }} />
            <span className="font-medium">{seg.label}</span>
            <span className="text-gray-400 ml-auto pl-4">{seg.value}</span>
          </div>
        ))}
      </div>
    </div>
  )
}

// ── Horizontal bar ─────────────────────────────────────────────────────────────
function HBar({ label, value, max, color = AMBER }: { label: string; value: number; max: number; color?: string }) {
  const pct = max > 0 ? (value / max) * 100 : 0
  return (
    <div className="flex items-center gap-3">
      <span className="text-xs text-gray-500 w-28 truncate flex-shrink-0">{label}</span>
      <div className="flex-1 h-2 bg-gray-100 rounded-full overflow-hidden">
        <div className="h-full rounded-full transition-all" style={{ width: `${pct}%`, background: color }} />
      </div>
      <span className="text-xs font-medium text-gray-700 w-6 text-right tabular-nums">{value}</span>
    </div>
  )
}

// ── Main ──────────────────────────────────────────────────────────────────────
export default function Analytics() {
  const [activeTab, setActiveTab] = useState<AnalyticsTab>('all')
  const [data, setData] = useState<DashboardStats | null>(null)
  const [empList, setEmpList] = useState<Employee[]>([])
  const [payrollList, setPayrollList] = useState<PayrollRun[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    Promise.all([
      stats.get().catch(() => null),
      employeesApi.list().catch(() => []),
      payrollApi.list().catch(() => []),
    ]).then(([s, e, p]) => {
      if (s) setData(s)
      setEmpList(e)
      setPayrollList(p)
    }).finally(() => setLoading(false))
  }, [])

  // Derive department counts
  const deptMap: Record<string, number> = {}
  for (const e of empList) {
    const d = e.departmentName ?? 'Unassigned'
    deptMap[d] = (deptMap[d] ?? 0) + 1
  }
  const deptEntries = Object.entries(deptMap).sort((a, b) => b[1] - a[1])
  const maxDept = deptEntries[0]?.[1] ?? 1

  // Payroll spend bars (last 6 runs)
  const MONTHS = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec']
  const payBars = payrollList.slice(0, 6).reverse().map(r => ({
    label: r.createdAt ? MONTHS[new Date(r.createdAt).getMonth()] : '?',
    value: r.totalGross ? parseFloat(r.totalGross) : 0,
  }))
  while (payBars.length < 6) payBars.unshift({ label: '-', value: 0 })

  // Employment type breakdown
  const typeMap: Record<string, number> = {}
  for (const e of empList) {
    const t = e.employmentType ?? 'Unknown'
    typeMap[t] = (typeMap[t] ?? 0) + 1
  }
  const TYPE_COLORS = ['#d97706', '#0891b2', '#7c3aed', '#be185d', '#15803d']
  const typeSeg = Object.entries(typeMap).map(([k, v], i) => ({
    label: k, value: v, color: TYPE_COLORS[i % TYPE_COLORS.length],
  }))

  // Attendance today
  const att = data?.attendance.today ?? { present: 0, late: 0, absent: 0, remote: 0 }
  const attTotal = att.present + att.late + att.absent + att.remote

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64 text-gray-400 text-sm">
        Loading analytics...
      </div>
    )
  }

  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-bold text-gray-900">Analytics</h1>

      {/* Tabs */}
      <div className="flex gap-0 border-b border-gray-200">
        {tabs.map(tab => (
          <button
            key={tab.key}
            onClick={() => setActiveTab(tab.key)}
            className={`px-5 py-2.5 text-sm font-medium -mb-px transition-colors ${
              activeTab === tab.key
                ? 'border-b-2 border-gray-900 text-gray-900'
                : 'border-b-2 border-transparent text-gray-500 hover:text-gray-700'
            }`}
          >
            {tab.label}
          </button>
        ))}
      </div>

      {/* ── OVERVIEW ── */}
      {(activeTab === 'all') && (
        <div className="space-y-6">
          <div className="grid grid-cols-4 gap-4">
            <StatCard label="Total employees" value={String(data?.employees.total ?? empList.length)} sub="All time" icon={<Users size={16} />} />
            <StatCard label="Active"          value={String(data?.employees.active ?? 0)} sub="Currently employed" positive icon={<UserCheck size={16} />} />
            <StatCard label="New this month"  value={String(data?.employees.newThisMonth ?? 0)} sub="Onboarded" positive={true} icon={<UserPlus size={16} />} />
            <StatCard label="On leave"        value={String(data?.employees.onLeave ?? 0)} sub="Right now" icon={<Calendar size={16} />} accent />
          </div>

          <div className="grid grid-cols-2 gap-6">
            {/* Payroll spend */}
            <div className="bg-white rounded-xl border border-gray-100 p-5">
              <h3 className="text-sm font-semibold text-gray-900 mb-0.5">Payroll spend</h3>
              <p className="text-xs text-gray-400 mb-4">Last {payBars.filter(b => b.value > 0).length || 6} payroll runs</p>
              {payBars.every(b => b.value === 0) ? (
                <div className="flex flex-col items-center justify-center py-8 text-center">
                  <DollarSign size={32} className="text-gray-300 mb-2" />
                  <p className="text-sm text-gray-400">No payroll runs yet</p>
                </div>
              ) : (
                <BarChart data={payBars} />
              )}
            </div>

            {/* Department breakdown */}
            <div className="bg-white rounded-xl border border-gray-100 p-5">
              <h3 className="text-sm font-semibold text-gray-900 mb-0.5">Headcount by department</h3>
              <p className="text-xs text-gray-400 mb-4">{empList.length} total employees</p>
              {deptEntries.length === 0 ? (
                <div className="flex flex-col items-center justify-center py-8 text-center">
                  <Users size={32} className="text-gray-300 mb-2" />
                  <p className="text-sm text-gray-400">No employees yet</p>
                </div>
              ) : (
                <div className="flex flex-col gap-3">
                  {deptEntries.slice(0, 6).map(([dept, count]) => (
                    <HBar key={dept} label={dept} value={count} max={maxDept} />
                  ))}
                </div>
              )}
            </div>
          </div>

          {/* Attendance + leave row */}
          <div className="grid grid-cols-2 gap-6">
            <div className="bg-white rounded-xl border border-gray-100 p-5">
              <h3 className="text-sm font-semibold text-gray-900 mb-0.5">Attendance today</h3>
              <p className="text-xs text-gray-400 mb-4">{attTotal} employees tracked</p>
              <DonutChart segments={[
                { label: 'Present', value: att.present, color: '#22c55e' },
                { label: 'Late',    value: att.late,    color: AMBER },
                { label: 'Absent',  value: att.absent,  color: '#ef4444' },
                { label: 'Remote',  value: att.remote,  color: '#0891b2' },
              ]} />
            </div>
            <div className="bg-white rounded-xl border border-gray-100 p-5">
              <h3 className="text-sm font-semibold text-gray-900 mb-0.5">Leave overview</h3>
              <p className="text-xs text-gray-400 mb-4">This month</p>
              <div className="grid grid-cols-2 gap-4 mt-2">
                <div className="text-center py-4 bg-amber-50 rounded-xl">
                  <p className="text-3xl font-bold text-amber-700">{data?.leave.pendingRequests ?? 0}</p>
                  <p className="text-xs text-amber-600 mt-1">Pending</p>
                </div>
                <div className="text-center py-4 bg-green-50 rounded-xl">
                  <p className="text-3xl font-bold text-green-700">{data?.leave.approvedThisMonth ?? 0}</p>
                  <p className="text-xs text-green-600 mt-1">Approved this month</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* ── EMPLOYEE ── */}
      {activeTab === 'employee' && (
        <div className="space-y-6">
          <div className="grid grid-cols-4 gap-4">
            <StatCard label="Total headcount" value={String(data?.employees.total ?? empList.length)} icon={<Users size={16} />} />
            <StatCard label="Active"          value={String(data?.employees.active ?? 0)} positive icon={<UserCheck size={16} />} />
            <StatCard label="New this month"  value={String(data?.employees.newThisMonth ?? 0)} positive icon={<UserPlus size={16} />} />
            <StatCard label="On leave"        value={String(data?.employees.onLeave ?? 0)} icon={<Activity size={16} />} accent />
          </div>
          <div className="grid grid-cols-2 gap-6">
            <div className="bg-white rounded-xl border border-gray-100 p-5">
              <h3 className="text-sm font-semibold text-gray-900 mb-0.5">Employment type</h3>
              <p className="text-xs text-gray-400 mb-4">{empList.length} employees</p>
              {typeSeg.length === 0 ? (
                <p className="text-sm text-gray-400 text-center py-8">No employees yet</p>
              ) : (
                <DonutChart segments={typeSeg} />
              )}
            </div>
            <div className="bg-white rounded-xl border border-gray-100 p-5">
              <h3 className="text-sm font-semibold text-gray-900 mb-0.5">Headcount by department</h3>
              <p className="text-xs text-gray-400 mb-4">{deptEntries.length} departments</p>
              <div className="flex flex-col gap-3">
                {deptEntries.length === 0
                  ? <p className="text-sm text-gray-400 text-center py-8">No employees yet</p>
                  : deptEntries.map(([dept, count]) => (
                    <HBar key={dept} label={dept} value={count} max={maxDept} />
                  ))
                }
              </div>
            </div>
          </div>
        </div>
      )}

      {/* ── PAYROLL ── */}
      {activeTab === 'payroll' && (
        <div className="space-y-6">
          <div className="grid grid-cols-3 gap-4">
            <StatCard label="Total runs"    value={String(data?.payroll.totalRuns ?? payrollList.length)} icon={<DollarSign size={16} />} />
            <StatCard label="Pending runs"  value={String(data?.payroll.pendingRuns ?? 0)} positive={data?.payroll.pendingRuns === 0} icon={<Clock size={16} />} accent={!!data?.payroll.pendingRuns} />
            <StatCard
              label="Latest run gross"
              value={data?.payroll.latestRunGross
                ? `$${parseFloat(String(data.payroll.latestRunGross)).toLocaleString('en-US', { minimumFractionDigits: 0 })}`
                : '-'}
              sub={data?.payroll.latestRunDate ? new Date(data.payroll.latestRunDate).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' }) : undefined}
              icon={<TrendingUp size={16} />}
            />
          </div>
          <div className="bg-white rounded-xl border border-gray-100 p-5">
            <h3 className="text-sm font-semibold text-gray-900 mb-0.5">Payroll spend by run</h3>
            <p className="text-xs text-gray-400 mb-4">Last {payBars.filter(b => b.value > 0).length || 6} payroll runs</p>
            {payBars.every(b => b.value === 0) ? (
              <div className="flex flex-col items-center justify-center py-8 text-center">
                <DollarSign size={32} className="text-gray-300 mb-2" />
                <p className="text-sm text-gray-400">No payroll data yet</p>
              </div>
            ) : (
              <BarChart data={payBars} />
            )}
          </div>
        </div>
      )}

      {/* ── ATTENDANCE ── */}
      {activeTab === 'attendance' && (
        <div className="space-y-6">
          <div className="grid grid-cols-4 gap-4">
            <StatCard label="Present today" value={String(att.present)} positive icon={<UserCheck size={16} />} />
            <StatCard label="Late today"    value={String(att.late)} positive={att.late === 0} icon={<Clock size={16} />} accent={att.late > 0} />
            <StatCard label="Absent today"  value={String(att.absent)} positive={att.absent === 0} icon={<Activity size={16} />} />
            <StatCard label="Remote"        value={String(att.remote)} icon={<Users size={16} />} />
          </div>
          <div className="grid grid-cols-2 gap-6">
            <div className="bg-white rounded-xl border border-gray-100 p-5">
              <h3 className="text-sm font-semibold text-gray-900 mb-0.5">Attendance today</h3>
              <p className="text-xs text-gray-400 mb-4">{attTotal} employees tracked</p>
              <DonutChart segments={[
                { label: 'Present', value: att.present, color: '#22c55e' },
                { label: 'Late',    value: att.late,    color: AMBER },
                { label: 'Absent',  value: att.absent,  color: '#ef4444' },
                { label: 'Remote',  value: att.remote,  color: '#0891b2' },
              ]} />
            </div>
            <div className="bg-white rounded-xl border border-gray-100 p-5">
              <h3 className="text-sm font-semibold text-gray-900 mb-0.5">Leave requests</h3>
              <p className="text-xs text-gray-400 mb-4">This month</p>
              <div className="grid grid-cols-2 gap-4 mt-2">
                <div className="text-center py-4 bg-amber-50 rounded-xl">
                  <p className="text-3xl font-bold text-amber-700">{data?.leave.pendingRequests ?? 0}</p>
                  <p className="text-xs text-amber-600 mt-1">Pending</p>
                </div>
                <div className="text-center py-4 bg-green-50 rounded-xl">
                  <p className="text-3xl font-bold text-green-700">{data?.leave.approvedThisMonth ?? 0}</p>
                  <p className="text-xs text-green-600 mt-1">Approved</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
