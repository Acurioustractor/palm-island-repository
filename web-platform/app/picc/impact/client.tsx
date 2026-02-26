'use client'

import {
  BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer,
  CartesianGrid, Cell
} from 'recharts'
import type { ServiceImpactData } from '@/lib/services/get-service-impact'

const CATEGORY_COLORS: Record<string, string> = {
  health: '#059669',
  family: '#D97706',
  justice: '#7C3AED',
  education: '#2563EB',
  economic: '#0891B2',
  cultural: '#DC2626',
  digital: '#6366F1',
}

function getColor(category: string | null): string {
  if (!category) return '#94a3b8'
  const lower = category.toLowerCase()
  for (const [key, color] of Object.entries(CATEGORY_COLORS)) {
    if (lower.includes(key)) return color
  }
  return '#94a3b8'
}

function StatCard({ label, value, delta, sub }: {
  label: string; value: string; delta?: number; sub?: string
}) {
  const deltaColor = delta == null ? '' : delta >= 0 ? 'text-green-600' : 'text-red-500'
  const deltaStr = delta == null ? null : delta >= 0 ? `+${delta}` : `${delta}`

  return (
    <div className="rounded-xl border border-gray-200 bg-white p-5">
      <div className="text-xs font-medium text-gray-500 uppercase tracking-wide">{label}</div>
      <div className="text-2xl font-bold mt-1 text-gray-900">{value}</div>
      <div className="text-xs text-gray-400 mt-0.5 flex items-center gap-1.5">
        {deltaStr != null && <span className={`font-medium ${deltaColor}`}>{deltaStr} YoY</span>}
        {sub && <span>{sub}</span>}
      </div>
    </div>
  )
}

function HealthBar({ label, value, threshold }: {
  label: string; value: number; threshold: number
}) {
  const status = value >= threshold ? 'bg-green-500' : value >= threshold * 0.6 ? 'bg-amber-500' : 'bg-red-500'

  return (
    <div className="flex items-center gap-3">
      <span className="text-sm text-gray-600 w-40 shrink-0">{label}</span>
      <div className="flex-1 h-3 bg-gray-100 rounded-full overflow-hidden">
        <div className={`h-full rounded-full ${status}`} style={{ width: `${Math.min(value, 100)}%` }} />
      </div>
      <span className="text-sm font-medium text-gray-900 w-12 text-right">{value}%</span>
    </div>
  )
}

function ProgressSection({ label, current, total, sub }: {
  label: string; current: number; total: number; sub: string
}) {
  const pct = total > 0 ? Math.round((current / total) * 100) : 0

  return (
    <div className="rounded-xl border border-gray-200 bg-white p-5">
      <div className="flex justify-between items-baseline mb-2">
        <span className="text-sm font-medium text-gray-700">{label}</span>
        <span className="text-sm text-gray-500">{current} / {total}</span>
      </div>
      <div className="h-3 bg-gray-100 rounded-full overflow-hidden">
        <div
          className="h-full rounded-full bg-gray-900 transition-all"
          style={{ width: `${Math.min(pct, 100)}%` }}
        />
      </div>
      <div className="text-xs text-gray-400 mt-1.5">{sub}</div>
    </div>
  )
}

// eslint-disable-next-line @typescript-eslint/no-explicit-any
function fmtTooltip(value: any) {
  return Number(value).toLocaleString()
}

export function ImpactDashboardClient({ data }: { data: ServiceImpactData }) {
  const { totals, priorYear, services, staffComposition, coverage, journey } = data

  const clientsDelta = priorYear.clients > 0 ? totals.clients - priorYear.clients : undefined
  const sessionsDelta = priorYear.sessions > 0 ? totals.sessions - priorYear.sessions : undefined
  const eventsDelta = priorYear.events > 0 ? totals.events - priorYear.events : undefined
  const staffDelta = priorYear.staff > 0 ? totals.staff - priorYear.staff : undefined

  // Chart data — only services with clients > 0
  const chartData = services
    .filter(s => s.clients > 0)
    .map(s => ({
      name: s.name.length > 25 ? s.name.slice(0, 22) + '...' : s.name,
      clients: s.clients,
      color: getColor(s.category),
    }))

  const hasChartData = chartData.length > 0

  return (
    <div className="space-y-8">
      {/* Stat Cards */}
      <section>
        <h2 className="text-sm font-semibold text-gray-400 uppercase tracking-wide mb-3">Overview</h2>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          <StatCard label="Clients Served" value={totals.clients.toLocaleString()} delta={clientsDelta} />
          <StatCard label="Sessions" value={totals.sessions.toLocaleString()} delta={sessionsDelta} />
          <StatCard label="Events" value={totals.events.toLocaleString()} delta={eventsDelta} />
          <StatCard label="Staff" value={totals.staff.toLocaleString()} delta={staffDelta} />
        </div>
      </section>

      {/* Clients per service */}
      {hasChartData && (
        <section>
          <h2 className="text-sm font-semibold text-gray-400 uppercase tracking-wide mb-3">Clients by Service</h2>
          <div className="rounded-xl border border-gray-200 bg-white p-5">
            <ResponsiveContainer width="100%" height={Math.max(chartData.length * 40, 200)}>
              <BarChart data={chartData} layout="vertical" margin={{ left: 130, right: 30, top: 5, bottom: 5 }}>
                <CartesianGrid strokeDasharray="3 3" horizontal={false} />
                <XAxis type="number" tickFormatter={fmtTooltip} />
                <YAxis type="category" dataKey="name" width={125} tick={{ fontSize: 12 }} />
                <Tooltip formatter={fmtTooltip} />
                <Bar dataKey="clients" radius={[0, 4, 4, 0]}>
                  {chartData.map((entry, i) => (
                    <Cell key={i} fill={entry.color} />
                  ))}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          </div>
        </section>
      )}

      {/* Staff Composition + Coverage + Journey */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        <section>
          <h2 className="text-sm font-semibold text-gray-400 uppercase tracking-wide mb-3">Staff Composition</h2>
          <div className="rounded-xl border border-gray-200 bg-white p-5 space-y-4">
            <div className="text-sm text-gray-600">{staffComposition.total} total staff</div>
            <HealthBar label="Indigenous Employment" value={staffComposition.indigenousPct} threshold={70} />
            <HealthBar label="Palm Island Residents" value={staffComposition.residentPct} threshold={60} />
          </div>
        </section>

        <section className="space-y-4">
          <div>
            <h2 className="text-sm font-semibold text-gray-400 uppercase tracking-wide mb-3">Service Coverage</h2>
            <ProgressSection
              label="Services Reporting Metrics"
              current={coverage.reporting}
              total={coverage.total}
              sub={coverage.reporting === coverage.total
                ? 'All services reporting'
                : `${coverage.total - coverage.reporting} services still need metrics`}
            />
          </div>
          <div>
            <h2 className="text-sm font-semibold text-gray-400 uppercase tracking-wide mb-3">20-Year Journey</h2>
            <ProgressSection
              label={`Year ${journey.currentYear} of 20`}
              current={journey.currentYear}
              total={20}
              sub={`${journey.yearsRemaining} years to ${journey.targetYear} milestone`}
            />
          </div>
        </section>
      </div>

      {/* Empty state if no data at all */}
      {!hasChartData && totals.clients === 0 && totals.sessions === 0 && (
        <div className="rounded-xl border border-gray-200 bg-gray-50 p-12 text-center text-gray-500">
          No service metrics data found. Add records to the <code className="text-xs bg-gray-100 px-1.5 py-0.5 rounded">service_metrics</code> table to see impact data here.
        </div>
      )}
    </div>
  )
}
