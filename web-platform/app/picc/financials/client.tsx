'use client'

import {
  BarChart, Bar, LineChart, Line, XAxis, YAxis, Tooltip, ResponsiveContainer,
  CartesianGrid, Legend, Cell
} from 'recharts'
import type { FinancialRecord } from '@/lib/financials/get-financials'

interface Props {
  records: FinancialRecord[]
  latest: FinancialRecord
}

const EXPENSE_COLORS: Record<string, string> = {
  labour_costs: '#D97706',
  administration_expenses: '#2563EB',
  property_energy_expenses: '#059669',
  motor_vehicle_expenses: '#7C3AED',
  travel_training_expenses: '#DC2626',
  client_related_costs: '#0891B2',
}

const EXPENSE_LABELS: Record<string, string> = {
  labour_costs: 'Labour',
  administration_expenses: 'Admin',
  property_energy_expenses: 'Property & Energy',
  motor_vehicle_expenses: 'Motor Vehicles',
  travel_training_expenses: 'Travel & Training',
  client_related_costs: 'Client Costs',
}

function fmt(n: number): string {
  if (Math.abs(n) >= 1_000_000) return `$${(n / 1_000_000).toFixed(1)}M`
  if (Math.abs(n) >= 1_000) return `$${(n / 1_000).toFixed(0)}K`
  return `$${n.toFixed(0)}`
}

function pct(part: number, whole: number): string {
  if (!whole) return '0%'
  return `${((part / whole) * 100).toFixed(1)}%`
}

function StatCard({ label, value, sub, color }: { label: string; value: string; sub?: string; color?: string }) {
  return (
    <div className="rounded-xl border border-gray-200 bg-white p-5">
      <div className="text-xs font-medium text-gray-500 uppercase tracking-wide">{label}</div>
      <div className={`text-2xl font-bold mt-1 ${color || 'text-gray-900'}`}>{value}</div>
      {sub && <div className="text-xs text-gray-400 mt-0.5">{sub}</div>}
    </div>
  )
}

function RatioIndicator({ label, value, unit, thresholds }: {
  label: string; value: number; unit: string
  thresholds: { good: [number, number]; warn: [number, number] }
}) {
  const status = value >= thresholds.good[0] && value <= thresholds.good[1] ? 'healthy'
    : value >= thresholds.warn[0] && value <= thresholds.warn[1] ? 'watch' : 'concern'
  const dot = status === 'healthy' ? 'bg-green-500' : status === 'watch' ? 'bg-amber-500' : 'bg-red-500'
  const statusLabel = status === 'healthy' ? 'Healthy' : status === 'watch' ? 'Watch' : 'Concern'

  return (
    <div className="rounded-xl border border-gray-200 bg-white p-4 flex items-center gap-4">
      <div className={`w-3 h-3 rounded-full ${dot}`} />
      <div className="flex-1">
        <div className="text-xs text-gray-500">{label}</div>
        <div className="text-lg font-bold text-gray-900">{value.toFixed(1)}{unit}</div>
      </div>
      <span className={`text-xs px-2 py-0.5 rounded-full font-medium ${
        status === 'healthy' ? 'bg-green-100 text-green-700' :
        status === 'watch' ? 'bg-amber-100 text-amber-700' :
        'bg-red-100 text-red-700'
      }`}>{statusLabel}</span>
    </div>
  )
}

// eslint-disable-next-line @typescript-eslint/no-explicit-any
function fmtTooltip(value: any) {
  return fmt(Number(value))
}

export function FinancialDashboardClient({ records, latest }: Props) {
  const netColor = latest.net_result >= 0 ? 'text-green-600' : 'text-red-500'

  // Build expense breakdown sorted by amount
  const expenseEntries = Object.entries(latest.expense_breakdown)
    .sort(([, a], [, b]) => b - a)

  // Income trend data (oldest first for chart)
  const trendData = [...records].reverse().map(r => ({
    year: r.fiscal_year_display,
    income: r.total_income,
    expenditure: r.total_expenditure,
  }))

  // Balance sheet
  const currentRatio = latest.total_liabilities > 0
    ? Math.round((latest.total_assets / latest.total_liabilities) * 100) / 100
    : null

  const labourRatio = latest.total_expenditure > 0
    ? (latest.expense_breakdown.labour_costs / latest.total_expenditure) * 100
    : 0
  const adminRatio = latest.total_expenditure > 0
    ? (latest.expense_breakdown.administration_expenses / latest.total_expenditure) * 100
    : 0

  // Expense breakdown chart data
  const expenseChartData = expenseEntries.map(([key, amount]) => ({
    name: EXPENSE_LABELS[key] || key,
    amount,
    color: EXPENSE_COLORS[key] || '#94a3b8',
  }))

  return (
    <div className="space-y-8">
      {/* Current Position */}
      <section>
        <h2 className="text-sm font-semibold text-gray-400 uppercase tracking-wide mb-3">Current Position</h2>
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          <StatCard label="Total Revenue" value={fmt(latest.total_income)} sub={`FY ${latest.fiscal_year_display}`} />
          <StatCard label="Total Expenditure" value={fmt(latest.total_expenditure)} />
          <StatCard
            label="Net Result"
            value={fmt(latest.net_result)}
            color={netColor}
            sub={latest.net_result >= 0 ? 'Surplus' : 'Deficit'}
          />
        </div>
      </section>

      {/* Expense Breakdown */}
      <section>
        <h2 className="text-sm font-semibold text-gray-400 uppercase tracking-wide mb-3">Expense Breakdown</h2>
        <div className="rounded-xl border border-gray-200 bg-white p-5">
          <ResponsiveContainer width="100%" height={280}>
            <BarChart data={expenseChartData} layout="vertical" margin={{ left: 100, right: 30, top: 5, bottom: 5 }}>
              <CartesianGrid strokeDasharray="3 3" horizontal={false} />
              <XAxis type="number" tickFormatter={fmtTooltip} />
              <YAxis type="category" dataKey="name" width={95} tick={{ fontSize: 12 }} />
              <Tooltip formatter={fmtTooltip} />
              <Bar dataKey="amount" radius={[0, 4, 4, 0]}>
                {expenseChartData.map((entry, i) => (
                  <Cell key={i} fill={entry.color} />
                ))}
              </Bar>
            </BarChart>
          </ResponsiveContainer>
          <div className="mt-3 grid grid-cols-2 sm:grid-cols-3 gap-2 text-xs">
            {expenseEntries.map(([key, amount]) => (
              <div key={key} className="flex justify-between px-2 py-1 rounded bg-gray-50">
                <span className="text-gray-600">{EXPENSE_LABELS[key]}</span>
                <span className="font-medium text-gray-800">{fmt(amount)} ({pct(amount, latest.total_expenditure)})</span>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Income Trend */}
      {trendData.length > 1 && (
        <section>
          <h2 className="text-sm font-semibold text-gray-400 uppercase tracking-wide mb-3">Income vs Expenditure Trend</h2>
          <div className="rounded-xl border border-gray-200 bg-white p-5">
            <ResponsiveContainer width="100%" height={300}>
              <LineChart data={trendData} margin={{ left: 20, right: 20, top: 5, bottom: 5 }}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="year" tick={{ fontSize: 11 }} />
                <YAxis tickFormatter={fmtTooltip} tick={{ fontSize: 11 }} />
                <Tooltip formatter={fmtTooltip} />
                <Legend />
                <Line type="monotone" dataKey="income" name="Income" stroke="#059669" strokeWidth={2} dot={{ r: 4 }} />
                <Line type="monotone" dataKey="expenditure" name="Expenditure" stroke="#DC2626" strokeWidth={2} dot={{ r: 4 }} />
              </LineChart>
            </ResponsiveContainer>
          </div>
        </section>
      )}

      {/* Balance Sheet + Key Ratios */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        <section>
          <h2 className="text-sm font-semibold text-gray-400 uppercase tracking-wide mb-3">Balance Sheet</h2>
          <div className="space-y-3">
            <StatCard label="Total Assets" value={fmt(latest.total_assets)} />
            <StatCard label="Total Liabilities" value={fmt(latest.total_liabilities)} />
            <StatCard label="Net Assets" value={fmt(latest.net_assets)} color={latest.net_assets >= 0 ? 'text-green-600' : 'text-red-500'} />
          </div>
        </section>

        <section>
          <h2 className="text-sm font-semibold text-gray-400 uppercase tracking-wide mb-3">Key Ratios</h2>
          <div className="space-y-3">
            <RatioIndicator label="Labour Cost Ratio" value={labourRatio} unit="%" thresholds={{ good: [50, 65], warn: [40, 70] }} />
            <RatioIndicator label="Admin Overhead" value={adminRatio} unit="%" thresholds={{ good: [10, 20], warn: [5, 30] }} />
            {currentRatio != null && (
              <RatioIndicator label="Current Ratio" value={currentRatio} unit="x" thresholds={{ good: [1.2, 3], warn: [1, 5] }} />
            )}
          </div>
        </section>
      </div>

      {/* Audit Status */}
      <section>
        <h2 className="text-sm font-semibold text-gray-400 uppercase tracking-wide mb-3">Audit Status</h2>
        <div className="rounded-xl border border-gray-200 bg-white p-5 flex items-center gap-4">
          <div className={`w-10 h-10 rounded-full flex items-center justify-center ${
            latest.audited ? 'bg-green-100 text-green-600' : 'bg-amber-100 text-amber-600'
          }`}>
            {latest.audited ? (
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
              </svg>
            ) : (
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01" />
              </svg>
            )}
          </div>
          <div>
            <div className="text-sm font-medium text-gray-900">
              {latest.audited ? 'Audited' : 'Unaudited'}
            </div>
            <div className="text-xs text-gray-500">
              {latest.auditor_name
                ? `Audited by ${latest.auditor_name}`
                : latest.audited
                  ? 'Financial statements have been audited'
                  : 'Audit pending for this fiscal year'}
            </div>
          </div>
        </div>
      </section>
    </div>
  )
}
