/**
 * PICC Finances — Internal dashboard
 *
 * Server-rendered. Pulls live from `annual_financials`. Designed for the
 * Narelle services + projects + finances check and the Rachel workshop.
 *
 * Three things this page does:
 *   1. Shows the latest audited year (2023-24) clean and clear
 *   2. Shows the 16-year revenue curve so the growth story is visible
 *   3. Flags the 2024-25 preliminary figures as awaiting Narelle interview
 *      Part C — never presents them as final
 *
 * Internal route at /picc/finances.
 */

import { createServerSupabase } from '@/lib/supabase/client'
import {
  TrendingUp,
  Coins,
  Users,
  Briefcase,
  Car,
  Home,
  GraduationCap,
  Heart,
  AlertCircle,
} from 'lucide-react'

export const metadata = {
  title: 'Finances — PICC Admin',
  description: 'PICC financial position, 16-year growth curve, and 2024-25 status — sourced live from annual_financials.',
}

export const dynamic = 'force-dynamic'
export const revalidate = 0

interface AnnualFinancial {
  fiscal_year: number
  total_income: number | null
  labour_costs: number | null
  administration_expenses: number | null
  property_energy_expenses: number | null
  motor_vehicle_expenses: number | null
  travel_training_expenses: number | null
  client_related_costs: number | null
  audited: boolean | null
}

function fmt(value: number | null | undefined): string {
  if (value == null) return '—'
  if (value >= 1_000_000) return `$${(value / 1_000_000).toFixed(2)}M`
  if (value >= 1_000) return `$${Math.round(value / 1_000)}k`
  return `$${value.toFixed(0)}`
}

function fmtMillions(value: number | null | undefined): string {
  if (value == null) return '—'
  return `$${(value / 1_000_000).toFixed(1)}M`
}

function fyText(year: number): string {
  return `${year - 1}-${String(year).slice(-2)}`
}

function totalExpenses(f: AnnualFinancial): number {
  return [
    f.labour_costs,
    f.administration_expenses,
    f.property_energy_expenses,
    f.motor_vehicle_expenses,
    f.travel_training_expenses,
    f.client_related_costs,
  ].reduce<number>((sum, v) => sum + (Number(v) || 0), 0)
}

function labourPercentage(f: AnnualFinancial): number | null {
  const labour = Number(f.labour_costs) || 0
  const total = totalExpenses(f)
  if (total === 0) return null
  return Math.round((labour / total) * 100)
}

export default async function FinancesPage() {
  const supabase = createServerSupabase()

  const { data } = await supabase
    .from('annual_financials')
    .select('fiscal_year, total_income, labour_costs, administration_expenses, property_energy_expenses, motor_vehicle_expenses, travel_training_expenses, client_related_costs, audited')
    .order('fiscal_year', { ascending: true })

  const rows: AnnualFinancial[] = (data || []) as AnnualFinancial[]
  const latest = rows[rows.length - 1] || null
  const previous = rows[rows.length - 2] || null
  const earliest = rows[0] || null

  // 2024-25 (fiscal_year 2025) is the year currently being checked with Narelle.
  // Treat anything newer than the previous-year audited row as preliminary.
  const isPreliminary = (f: AnnualFinancial) => f.fiscal_year >= 2025

  const latestExpenses = latest ? totalExpenses(latest) : 0
  const latestLabourPct = latest ? labourPercentage(latest) : null
  const latestSurplus = latest ? Number(latest.total_income || 0) - latestExpenses : 0

  // Growth from earliest year to latest
  const growthMultiple =
    latest && earliest && Number(earliest.total_income)
      ? (Number(latest.total_income) / Number(earliest.total_income)).toFixed(1)
      : null

  // Build the bar-chart row for the revenue curve
  const maxIncome = Math.max(...rows.map((r) => Number(r.total_income) || 0))

  return (
    <div className="min-h-screen bg-[#FAF8F5]">
      <div className="max-w-6xl mx-auto px-6 py-12">
        {/* ── HEADER ── */}
        <div className="mb-12">
          <p className="text-xs font-semibold tracking-[0.2em] uppercase text-picc-ochre mb-3">
            Internal · Finance Dashboard
          </p>
          <h1 className="font-serif text-4xl md:text-5xl text-stone-800 italic mb-4 leading-tight">
            PICC finances
          </h1>
          <p className="text-lg text-stone-600 max-w-3xl leading-relaxed">
            16 years of audited income and expenses, the latest position, and where the
            2024-25 figures stand. Built for the Narelle services + projects + finances
            check and the Rachel workshop. Live from <code className="text-xs bg-stone-100 px-1.5 py-0.5 rounded">annual_financials</code>.
          </p>
        </div>

        {/* ── 24-25 PRELIMINARY FLAG ── */}
        {latest && isPreliminary(latest) && (
          <div className="mb-12 rounded-2xl border-2 border-amber-300 bg-amber-50 p-6">
            <div className="flex items-start gap-3">
              <AlertCircle className="w-6 h-6 text-amber-600 flex-shrink-0 mt-0.5" />
              <div className="flex-1">
                <p className="font-semibold text-amber-900 mb-1">
                  2024-25 figures are preliminary — awaiting Narelle interview Part C
                </p>
                <p className="text-sm text-amber-800 leading-relaxed">
                  The 2024-25 row in <code className="text-xs bg-amber-100 px-1 py-0.5 rounded">annual_financials</code> contains
                  draft estimates. Final audited numbers come from PICC finance and the
                  external auditor — captured through the Narelle interview Part C numbers
                  round. Until then, **only 2023-24 should be quoted as final** in any
                  external communication or annual report.
                </p>
              </div>
            </div>
          </div>
        )}

        {/* ── LATEST AUDITED YEAR HERO ── */}
        {previous && (
          <section className="mb-12">
            <p className="text-xs font-semibold tracking-[0.2em] uppercase text-picc-ochre mb-4">
              Latest audited year · {fyText(previous.fiscal_year)}
            </p>
            <div className="grid md:grid-cols-4 gap-4 mb-4">
              <BigNumber
                icon={<Coins className="w-5 h-5" />}
                label="Total income"
                value={fmtMillions(previous.total_income)}
                sub="Revenue from grants, contracts, and enterprises"
              />
              <BigNumber
                icon={<Users className="w-5 h-5" />}
                label="Labour costs"
                value={fmtMillions(previous.labour_costs)}
                sub={`${labourPercentage(previous)}% of total expenses`}
              />
              <BigNumber
                icon={<TrendingUp className="w-5 h-5" />}
                label="Total expenses"
                value={fmtMillions(totalExpenses(previous))}
                sub="Sum of six major categories"
              />
              <BigNumber
                icon={<Heart className="w-5 h-5" />}
                label="Surplus / deficit"
                value={fmtMillions(Number(previous.total_income || 0) - totalExpenses(previous))}
                sub={
                  Number(previous.total_income || 0) - totalExpenses(previous) >= 0
                    ? 'Surplus'
                    : 'Operating deficit — labour-intensive model'
                }
              />
            </div>
            <div className="rounded-xl bg-picc-ochre/5 border border-picc-ochre/20 p-5">
              <p className="text-xs font-semibold tracking-wide uppercase text-picc-ochre mb-2">
                The Ipsos finding
              </p>
              <p className="text-sm text-stone-700 leading-relaxed">
                The 2019 Ipsos evaluation observed PICC&apos;s labour costs at roughly{' '}
                <strong>60% of spending</strong> — characteristic of a labour-intensive
                community service model with some enterprise activity around the edges, not a
                profit-maximising business model. The 2023-24 figure ({labourPercentage(previous)}%)
                confirms that pattern still holds. Most of every PICC dollar pays a Palm Islander to
                deliver a service to another Palm Islander.
              </p>
            </div>
          </section>
        )}

        {/* ── EXPENSE BREAKDOWN ── */}
        {previous && (
          <section className="mb-12">
            <p className="text-xs font-semibold tracking-[0.2em] uppercase text-picc-ochre mb-4">
              Expense breakdown · {fyText(previous.fiscal_year)}
            </p>
            <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-4">
              <ExpenseCategory
                icon={<Users className="w-5 h-5" />}
                label="Labour costs"
                value={Number(previous.labour_costs)}
                total={totalExpenses(previous)}
              />
              <ExpenseCategory
                icon={<Briefcase className="w-5 h-5" />}
                label="Administration"
                value={Number(previous.administration_expenses)}
                total={totalExpenses(previous)}
              />
              <ExpenseCategory
                icon={<Heart className="w-5 h-5" />}
                label="Client-related costs"
                value={Number(previous.client_related_costs)}
                total={totalExpenses(previous)}
              />
              <ExpenseCategory
                icon={<GraduationCap className="w-5 h-5" />}
                label="Travel & training"
                value={Number(previous.travel_training_expenses)}
                total={totalExpenses(previous)}
              />
              <ExpenseCategory
                icon={<Home className="w-5 h-5" />}
                label="Property & energy"
                value={Number(previous.property_energy_expenses)}
                total={totalExpenses(previous)}
              />
              <ExpenseCategory
                icon={<Car className="w-5 h-5" />}
                label="Motor vehicles"
                value={Number(previous.motor_vehicle_expenses)}
                total={totalExpenses(previous)}
              />
            </div>
          </section>
        )}

        {/* ── 16-YEAR REVENUE CURVE ── */}
        <section className="mb-12">
          <p className="text-xs font-semibold tracking-[0.2em] uppercase text-picc-ochre mb-4">
            16-year revenue curve
          </p>
          <div className="rounded-2xl border border-stone-200 bg-white p-8">
            {growthMultiple && earliest && latest && (
              <p className="text-sm text-stone-600 mb-6 leading-relaxed">
                Revenue grew from <strong>{fmtMillions(earliest.total_income)}</strong> in{' '}
                <strong>{fyText(earliest.fiscal_year)}</strong> to{' '}
                <strong>{fmtMillions(latest.total_income)}</strong> in{' '}
                <strong>{fyText(latest.fiscal_year)}</strong> — a{' '}
                <strong>{growthMultiple}x</strong> increase in 15 years. Most of the growth
                came after 2019 as PICC took on more contracts and the 2021 community-control
                transition stabilised funder confidence.
              </p>
            )}
            <div className="space-y-2">
              {rows.map((r) => {
                const income = Number(r.total_income) || 0
                const widthPct = maxIncome > 0 ? (income / maxIncome) * 100 : 0
                const preliminary = isPreliminary(r)
                return (
                  <div key={r.fiscal_year} className="flex items-center gap-3">
                    <div className="w-16 text-xs font-mono text-stone-500 flex-shrink-0">
                      {fyText(r.fiscal_year)}
                    </div>
                    <div className="flex-1 relative">
                      <div className="h-7 bg-stone-100 rounded">
                        <div
                          className={`h-7 rounded transition-all ${
                            preliminary
                              ? 'bg-amber-300 border border-amber-500 border-dashed'
                              : 'bg-picc-ochre'
                          }`}
                          style={{ width: `${widthPct}%` }}
                        />
                      </div>
                    </div>
                    <div className="w-24 text-right text-sm font-semibold text-stone-700 flex-shrink-0">
                      {fmtMillions(r.total_income)}
                      {preliminary && (
                        <span className="ml-1 text-[10px] text-amber-600 uppercase tracking-wide">
                          prelim
                        </span>
                      )}
                    </div>
                  </div>
                )
              })}
            </div>
          </div>
        </section>

        {/* ── 24-25 PRELIMINARY DETAIL ── */}
        {latest && isPreliminary(latest) && (
          <section className="mb-12">
            <p className="text-xs font-semibold tracking-[0.2em] uppercase text-picc-ochre mb-4">
              2024-25 preliminary · for Narelle review
            </p>
            <div className="rounded-2xl border-2 border-dashed border-amber-300 bg-amber-50/30 p-8">
              <div className="grid md:grid-cols-4 gap-4 mb-6">
                <BigNumber
                  icon={<Coins className="w-5 h-5" />}
                  label="Income (preliminary)"
                  value={fmtMillions(latest.total_income)}
                  sub="Held flat from 2023-24 in draft estimate"
                />
                <BigNumber
                  icon={<Users className="w-5 h-5" />}
                  label="Labour (preliminary)"
                  value={fmtMillions(latest.labour_costs)}
                  sub="3% increase on prior year"
                />
                <BigNumber
                  icon={<TrendingUp className="w-5 h-5" />}
                  label="Total expenses (preliminary)"
                  value={fmtMillions(totalExpenses(latest))}
                />
                <BigNumber
                  icon={<Heart className="w-5 h-5" />}
                  label="Surplus / deficit"
                  value={fmtMillions(Number(latest.total_income || 0) - totalExpenses(latest))}
                />
              </div>
              <div className="rounded-xl bg-white border border-amber-200 p-5">
                <p className="text-xs font-semibold tracking-wide uppercase text-amber-700 mb-2">
                  What Narelle Part C unlocks
                </p>
                <ul className="text-sm text-stone-700 space-y-1.5 leading-relaxed">
                  <li>• <strong>Auditor sign-off date</strong> — when do final 24-25 figures land?</li>
                  <li>• <strong>Total income</strong> — confirmed actuals vs preliminary $23.4M placeholder</li>
                  <li>• <strong>Total expenditure</strong> — six categories audited</li>
                  <li>• <strong>Total assets and net assets</strong> — currently NULL in DB for 2024-25</li>
                  <li>• <strong>197 → ? staff count</strong> — see /20-years for full workforce trajectory</li>
                </ul>
              </div>
            </div>
          </section>
        )}

        {/* ── HOW THIS PAGE IS WIRED ── */}
        <div className="rounded-2xl border border-stone-200 bg-white p-6 mb-8">
          <p className="text-xs text-stone-500 leading-relaxed">
            <strong className="text-stone-700">Source:</strong> live from{' '}
            <code className="text-xs bg-stone-100 px-1 py-0.5 rounded">annual_financials</code>{' '}
            in PICC Supabase. Cross-referenced with the EL v2 17-year archive
            (timeline.md), the Ipsos 2019 evaluation, and the
            PICC-Sector-Context-Deep-Research.md (vault doc #8).
          </p>
          <p className="text-xs text-stone-400 mt-2">
            2024-25 figures are preliminary draft estimates and must not be quoted externally
            until verified through the Narelle interview Part C numbers round and signed off
            by the auditor.
          </p>
        </div>

        <div className="flex flex-wrap gap-3 text-xs">
          <a href="/picc/launchpad" className="px-3 py-1.5 rounded-full bg-stone-100 text-stone-600 hover:bg-stone-200">
            ← The Launchpad strategic plan
          </a>
          <a href="/picc/governance" className="px-3 py-1.5 rounded-full bg-stone-100 text-stone-600 hover:bg-stone-200">
            How PICC is governed
          </a>
          <a href="/picc/sector-map" className="px-3 py-1.5 rounded-full bg-stone-100 text-stone-600 hover:bg-stone-200">
            Sector map
          </a>
          <a href="/20-years" className="px-3 py-1.5 rounded-full bg-stone-100 text-stone-600 hover:bg-stone-200">
            17-year history walk
          </a>
          <a href="/picc/reports/builder" className="px-3 py-1.5 rounded-full bg-stone-100 text-stone-600 hover:bg-stone-200">
            Annual report builder
          </a>
        </div>
      </div>
    </div>
  )
}

// ─── COMPONENTS ───────────────────────────────────────────────────────────

function BigNumber({
  icon,
  label,
  value,
  sub,
}: {
  icon: React.ReactNode
  label: string
  value: string
  sub?: string
}) {
  return (
    <div className="rounded-2xl border border-stone-200 bg-white p-6">
      <div className="flex items-center gap-2 mb-3 text-picc-ochre">
        {icon}
        <p className="text-xs font-semibold tracking-wide uppercase">{label}</p>
      </div>
      <p className="text-3xl font-bold text-picc-earth mb-1">{value}</p>
      {sub && <p className="text-xs text-stone-500 leading-relaxed">{sub}</p>}
    </div>
  )
}

function ExpenseCategory({
  icon,
  label,
  value,
  total,
}: {
  icon: React.ReactNode
  label: string
  value: number
  total: number
}) {
  const pct = total > 0 ? Math.round((value / total) * 100) : 0
  return (
    <div className="rounded-xl border border-stone-200 bg-white p-5">
      <div className="flex items-center justify-between mb-3">
        <div className="flex items-center gap-2 text-picc-ochre">
          {icon}
          <p className="text-sm font-semibold text-stone-800">{label}</p>
        </div>
        <span className="text-xs font-mono text-stone-400">{pct}%</span>
      </div>
      <p className="text-2xl font-bold text-picc-earth mb-2">
        {value >= 1_000_000 ? `$${(value / 1_000_000).toFixed(2)}M` : `$${Math.round(value / 1_000)}k`}
      </p>
      <div className="h-1.5 bg-stone-100 rounded-full overflow-hidden">
        <div className="h-full bg-picc-ochre rounded-full" style={{ width: `${pct}%` }} />
      </div>
    </div>
  )
}
