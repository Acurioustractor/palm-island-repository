'use client'

import { useEffect, useState, useRef } from 'react'
import { motion, useInView, AnimatePresence } from 'framer-motion'
import {
  Users,
  DollarSign,
  Briefcase,
  TrendingUp,
  Award,
  Quote,
  ChevronDown,
  ChevronRight,
  Loader2,
  BarChart3,
  ArrowUpRight,
  ArrowDownRight,
  Minus,
  MapPin,
  Calendar,
  Heart,
  Shield,
} from 'lucide-react'
import {
  ResponsiveContainer,
  AreaChart,
  Area,
  BarChart,
  Bar,
  LineChart,
  Line,
  XAxis,
  YAxis,
  Tooltip,
  CartesianGrid,
  PieChart,
  Pie,
  Cell,
  RadarChart,
  Radar,
  PolarGrid,
  PolarAngleAxis,
  PolarRadiusAxis,
  Legend,
  ComposedChart,
} from 'recharts'
import Link from 'next/link'
import { C } from '@/components/annual-report/2024-25/almanac/tokens'

// ─── Types ───────────────────────────────────────────────────────────────────

interface HistoryYear {
  fiscalYear: string
  era: string
  staffCount: number | null
  serviceCount: number | null
  peopleServed: string | null
  indigenousPercent: string | null
  annualBudget: number | null
  totalExpenditure: number | null
  totalAssets: number | null
  achievements: Array<{ text: string; category: string }>
  images: Array<{ id: string; url: string; alt: string; caption?: string }>
  imageCount: number
  staff: {
    total: number
    fullTime: number | null
    partTime: number | null
    casual: number | null
    indigenous: number | null
  } | null
}

interface HistoryEra {
  id: string
  name: string
  subtitle: string
  years: string
  color: string
  gradient: string
  description: string
  years_data: HistoryYear[]
  quote: { text: string; speaker_name: string; speaker_role: string } | null
  quotes: Array<{ text: string; speaker_name: string; speaker_role: string }>
  boardMembers: Array<{ name: string; role: string }>
  images: Array<{ url: string; alt: string; caption?: string }>
  latestStats: {
    staff: number | null
    services: number | null
    budget: number | null
    indigenousPercent: string | null
  } | null
}

interface HistoryData {
  years: HistoryYear[]
  chartYears?: HistoryYear[]
  eras: HistoryEra[]
  summary: {
    totalYears: number
    yearsSpanned: string
    latestStaff: number | null
    latestBudget: number | null
    latestServices: number | null
    latestIndigenous: string | null
    totalImages: number
    totalQuotes: number
  }
}

// ─── Helpers ─────────────────────────────────────────────────────────────────

function fmtBudget(v: number | null): string {
  if (!v) return '—'
  if (v >= 1_000_000) return `$${(v / 1_000_000).toFixed(1)}M`
  if (v >= 1_000) return `$${(v / 1_000).toFixed(0)}K`
  return `$${v}`
}

function pctStr(s: string | null): number {
  if (!s) return 0
  return parseInt(s.replace(/[^0-9]/g, '')) || 0
}

function growth(a: number | null, b: number | null): { pct: number; dir: 'up' | 'down' | 'flat' } {
  if (!a || !b || b === 0) return { pct: 0, dir: 'flat' }
  const pct = Math.round(((a - b) / b) * 100)
  return { pct: Math.abs(pct), dir: pct > 0 ? 'up' : pct < 0 ? 'down' : 'flat' }
}

const ERA_COLORS: Record<string, string> = {
  foundation: '#C8922A',
  growth: '#C8922A',
  transition: '#5B7B5E',
  'community-controlled': '#8B1A1A',
}

const ERA_GRADIENTS: Record<string, string> = {
  foundation: 'from-picc-ochre to-orange-600',
  growth: 'from-picc-ochre to-picc-ochre',
  transition: 'from-sage-500 to-picc-ochre',
  'community-controlled': 'from-picc-red to-picc-ochre',
}

const ERA_BG: Record<string, string> = {
  foundation: 'bg-picc-ochre-50 border-picc-ochre-200',
  growth: 'bg-warm-100 border-warm-200',
  transition: 'bg-sage-50 border-sage-200',
  'community-controlled': 'bg-warm-50 border-warm-200',
}

const ERA_TEXT: Record<string, string> = {
  foundation: 'text-picc-ochre',
  growth: 'text-picc-ochre',
  transition: 'text-sage-700',
  'community-controlled': 'text-picc-red',
}

// ─── Sub-Components ──────────────────────────────────────────────────────────

function AnimatedNumber({ value, suffix = '', prefix = '' }: { value: number; suffix?: string; prefix?: string }) {
  const ref = useRef<HTMLSpanElement>(null)
  const isInView = useInView(ref, { once: true })
  const [display, setDisplay] = useState(0)

  useEffect(() => {
    if (!isInView) return
    const start = performance.now()
    const dur = 1500
    function tick(now: number) {
      const p = Math.min((now - start) / dur, 1)
      const eased = 1 - Math.pow(1 - p, 3)
      setDisplay(Math.round(value * eased))
      if (p < 1) requestAnimationFrame(tick)
    }
    requestAnimationFrame(tick)
  }, [isInView, value])

  return <span ref={ref}>{prefix}{display.toLocaleString()}{suffix}</span>
}

function StatCard({
  icon: Icon,
  label,
  value,
  subValue,
  change,
  color = 'blue',
}: {
  icon: any
  label: string
  value: string | number
  subValue?: string
  change?: { pct: number; dir: 'up' | 'down' | 'flat' }
  color?: string
}) {
  const colorMap: Record<string, { bg: string; text: string; icon: string }> = {
    blue: { bg: 'bg-blue-50', text: 'text-picc-red', icon: 'bg-warm-100 text-picc-red' },
    purple: { bg: 'bg-warm-100', text: 'text-picc-ochre', icon: 'bg-warm-100 text-picc-ochre' },
    green: { bg: 'bg-sage-50', text: 'text-sage-600', icon: 'bg-sage-100 text-sage-600' },
    amber: { bg: 'bg-picc-ochre-50', text: 'text-picc-ochre', icon: 'bg-picc-ochre-100 text-picc-ochre' },
  }
  const c = colorMap[color] || colorMap.blue

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true }}
      className="bg-white rounded-2xl shadow-md hover:shadow-lg transition-shadow p-6 border border-gray-100"
    >
      <div className="flex items-start justify-between mb-4">
        <div className={`p-3 rounded-xl ${c.icon}`}>
          <Icon className="w-5 h-5" />
        </div>
        {change && change.dir !== 'flat' && (
          <div className={`flex items-center gap-1 text-sm font-medium ${change.dir === 'up' ? 'text-sage-600' : 'text-red-500'}`}>
            {change.dir === 'up' ? <ArrowUpRight className="w-4 h-4" /> : <ArrowDownRight className="w-4 h-4" />}
            {change.pct}%
          </div>
        )}
      </div>
      <div className={`text-3xl font-bold ${c.text} mb-1`}>
        {typeof value === 'number' ? <AnimatedNumber value={value} /> : value}
      </div>
      <div className="text-sm text-gray-500">{label}</div>
      {subValue && <div className="text-xs text-gray-400 mt-1">{subValue}</div>}
    </motion.div>
  )
}

function SectionHeader({ title, subtitle, icon: Icon }: { title: string; subtitle?: string; icon?: any }) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true }}
      className="mb-8"
    >
      <div className="flex items-center gap-3 mb-2">
        {Icon && (
          <div className="p-2 rounded-lg" style={{ backgroundColor: C.ochre + '22' }}>
            <Icon className="w-5 h-5" style={{ color: C.ochre }} />
          </div>
        )}
        <h2
          className="font-fraunces font-bold"
          style={{ color: C.ocean, fontSize: 'clamp(22px, 3vw, 32px)', lineHeight: 1.15 }}
        >
          {title}
        </h2>
      </div>
      {subtitle && <p className="font-fraunces ml-12" style={{ color: C.driftwood, fontSize: 16 }}>{subtitle}</p>}
    </motion.div>
  )
}

function ChartCard({ title, children, className = '' }: { title: string; children: React.ReactNode; className?: string }) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true }}
      className={`rounded-2xl shadow-sm overflow-hidden ${className}`}
      style={{ backgroundColor: '#FFFFFF', border: `1px solid ${C.border}`, borderTopWidth: 3, borderTopColor: C.ochre }}
    >
      <div className="px-6 pt-6 pb-2">
        <h3 className="font-fraunces font-bold" style={{ color: C.ocean, fontSize: 17 }}>{title}</h3>
      </div>
      <div className="px-4 pb-6">{children}</div>
    </motion.div>
  )
}

function QuoteCarousel({ quotes }: { quotes: Array<{ text: string; speaker_name: string; speaker_role: string }> }) {
  const [idx, setIdx] = useState(0)
  const q = quotes[idx]
  if (!q) return null

  return (
    <motion.div
      initial={{ opacity: 0 }}
      whileInView={{ opacity: 1 }}
      viewport={{ once: true }}
      className="bg-gradient-to-br from-picc-red to-picc-ochre rounded-2xl p-8 md:p-12 text-white relative overflow-hidden"
    >
      <div className="absolute top-6 right-8 opacity-10">
        <Quote className="w-24 h-24" />
      </div>
      <AnimatePresence mode="wait">
        <motion.div
          key={idx}
          initial={{ opacity: 0, x: 20 }}
          animate={{ opacity: 1, x: 0 }}
          exit={{ opacity: 0, x: -20 }}
          transition={{ duration: 0.3 }}
        >
          <p className="text-xl md:text-2xl font-medium leading-relaxed mb-6 relative z-10">
            &ldquo;{q.text}&rdquo;
          </p>
          <div>
            <div className="font-bold text-lg">{q.speaker_name}</div>
            <div className="text-warm-200">{q.speaker_role}</div>
          </div>
        </motion.div>
      </AnimatePresence>
      {quotes.length > 1 && (
        <div className="flex gap-2 mt-6">
          {quotes.map((_, i) => (
            <button
              key={i}
              onClick={() => setIdx(i)}
              className={`w-2.5 h-2.5 rounded-full transition-all ${i === idx ? 'bg-white scale-125' : 'bg-white/40 hover:bg-white/60'}`}
            />
          ))}
        </div>
      )}
    </motion.div>
  )
}

function EraTimeline({ eras }: { eras: HistoryEra[] }) {
  const [selected, setSelected] = useState<string | null>(null)

  return (
    <div className="space-y-4">
      {eras.map((era) => {
        const isOpen = selected === era.id
        return (
          <motion.div
            key={era.id}
            initial={{ opacity: 0, y: 10 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className={`border rounded-xl overflow-hidden transition-colors ${ERA_BG[era.id] || 'bg-gray-50 border-gray-200'}`}
          >
            <button
              onClick={() => setSelected(isOpen ? null : era.id)}
              className="w-full flex items-center justify-between p-5 text-left"
            >
              <div className="flex items-center gap-4">
                <div
                  className="w-4 h-4 rounded-full flex-shrink-0"
                  style={{ backgroundColor: ERA_COLORS[era.id] }}
                />
                <div>
                  <div className={`font-bold text-lg ${ERA_TEXT[era.id] || 'text-gray-900'}`}>
                    {era.name}
                  </div>
                  <div className="text-sm text-gray-500">{era.years}</div>
                </div>
              </div>
              <div className="flex items-center gap-6">
                {era.latestStats && (
                  <div className="hidden md:flex gap-6 text-sm">
                    {era.latestStats.staff && (
                      <div className="text-center">
                        <div className="font-bold text-gray-900">{era.latestStats.staff}</div>
                        <div className="text-gray-400">Staff</div>
                      </div>
                    )}
                    {era.latestStats.budget && (
                      <div className="text-center">
                        <div className="font-bold text-gray-900">{fmtBudget(era.latestStats.budget)}</div>
                        <div className="text-gray-400">Budget</div>
                      </div>
                    )}
                    {era.latestStats.services && (
                      <div className="text-center">
                        <div className="font-bold text-gray-900">{era.latestStats.services}</div>
                        <div className="text-gray-400">Services</div>
                      </div>
                    )}
                  </div>
                )}
                <ChevronDown className={`w-5 h-5 text-gray-400 transition-transform ${isOpen ? 'rotate-180' : ''}`} />
              </div>
            </button>
            <AnimatePresence>
              {isOpen && (
                <motion.div
                  initial={{ height: 0, opacity: 0 }}
                  animate={{ height: 'auto', opacity: 1 }}
                  exit={{ height: 0, opacity: 0 }}
                  transition={{ duration: 0.3 }}
                  className="overflow-hidden"
                >
                  <div className="px-5 pb-5 space-y-4">
                    <p className="text-gray-600">{era.description}</p>
                    {era.years_data.length > 0 && (
                      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-3">
                        {era.years_data.map((y) => (
                          <div key={y.fiscalYear} className="bg-white rounded-lg p-3 border border-gray-100 text-sm">
                            <div className="font-bold text-gray-900 mb-1">{y.fiscalYear}</div>
                            <div className="space-y-0.5 text-gray-500">
                              {y.staffCount && <div>Staff: <span className="text-gray-900 font-medium">{y.staffCount}</span></div>}
                              {y.annualBudget && <div>Budget: <span className="text-gray-900 font-medium">{fmtBudget(y.annualBudget)}</span></div>}
                              {y.serviceCount && <div>Services: <span className="text-gray-900 font-medium">{y.serviceCount}</span></div>}
                            </div>
                          </div>
                        ))}
                      </div>
                    )}
                    {era.boardMembers.length > 0 && (
                      <div>
                        <div className="text-sm font-semibold text-gray-700 mb-2">Board Members</div>
                        <div className="flex flex-wrap gap-2">
                          {era.boardMembers.map((bm) => (
                            <span key={bm.name} className="text-xs bg-white border border-gray-200 rounded-full px-3 py-1 text-gray-600">
                              {bm.name} <span className="text-gray-400">({bm.role})</span>
                            </span>
                          ))}
                        </div>
                      </div>
                    )}
                  </div>
                </motion.div>
              )}
            </AnimatePresence>
          </motion.div>
        )
      })}
    </div>
  )
}

function AchievementsList({ years }: { years: HistoryYear[] }) {
  return (
    <div className="space-y-6">
      {years.filter(y => y.achievements.length > 0).map((y) => (
        <motion.div
          key={y.fiscalYear}
          initial={{ opacity: 0, x: -10 }}
          whileInView={{ opacity: 1, x: 0 }}
          viewport={{ once: true }}
          className="flex gap-4"
        >
          <div className="flex-shrink-0 w-20 pt-1">
            <span
              className="inline-block px-2.5 py-1 rounded-full text-xs font-bold text-white"
              style={{ backgroundColor: ERA_COLORS[y.era] || '#6B7280' }}
            >
              {y.fiscalYear}
            </span>
          </div>
          <div className="space-y-1.5 flex-1">
            {y.achievements.slice(0, 2).map((a, i) => (
              <div key={i} className="flex items-start gap-2 text-sm">
                <Award className="w-3.5 h-3.5 text-picc-ochre mt-0.5 flex-shrink-0" />
                <span className="text-gray-600">{a.text}</span>
              </div>
            ))}
          </div>
        </motion.div>
      ))}
    </div>
  )
}

// ─── Custom Tooltip ──────────────────────────────────────────────────────────

function CustomTooltip({ active, payload, label }: any) {
  if (!active || !payload?.length) return null
  return (
    <div className="bg-gray-900 text-white rounded-lg px-4 py-3 shadow-xl text-sm">
      <div className="font-bold mb-1">{label}</div>
      {payload.map((p: any, i: number) => (
        <div key={i} className="flex items-center gap-2">
          <div className="w-2.5 h-2.5 rounded-full" style={{ backgroundColor: p.color }} />
          <span className="text-gray-300">{p.name}:</span>
          <span className="font-medium">
            {p.name.toLowerCase().includes('budget') || p.name.toLowerCase().includes('income')
              ? fmtBudget(p.value)
              : p.value?.toLocaleString()}
          </span>
        </div>
      ))}
    </div>
  )
}

// ─── Main Page ───────────────────────────────────────────────────────────────

export default function DashboardPage() {
  const [data, setData] = useState<HistoryData | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    fetch('/api/public/history')
      .then((r) => r.json())
      .then((d) => { setData(d); setLoading(false) })
      .catch(() => setLoading(false))
  }, [])

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="text-center">
          <Loader2 className="w-8 h-8 animate-spin text-picc-red mx-auto mb-4" />
          <p className="text-gray-500">Loading dashboard data...</p>
        </div>
      </div>
    )
  }

  if (!data) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <p className="text-red-500">Failed to load data.</p>
      </div>
    )
  }

  const { years, chartYears, eras, summary } = data
  const smoothYears = chartYears || years

  // ─── Derived Data ────────────────────────────────────────────────────────

  // Growth chart data — use interpolated chartYears for smooth lines
  const chartData = smoothYears
    .filter((y) => y.staffCount || y.annualBudget)
    .map((y) => ({
      year: y.fiscalYear,
      staff: y.staffCount || 0,
      budget: y.annualBudget || 0,
      services: y.serviceCount || 0,
      era: y.era,
    }))

  // Staff composition for latest year
  const latestWithStaff = [...years].reverse().find((y) => y.staff?.total)
  const staffComposition = latestWithStaff?.staff
    ? [
        { name: 'Indigenous', value: latestWithStaff.staff.indigenous || 0, color: '#3B82F6' },
        { name: 'Non-Indigenous', value: (latestWithStaff.staff.total || 0) - (latestWithStaff.staff.indigenous || 0), color: '#E5E7EB' },
      ]
    : []

  // Budget by era
  const budgetByEra = eras.map((era) => {
    const eraYears = era.years_data.filter((y) => y.annualBudget)
    const avg = eraYears.length
      ? eraYears.reduce((sum, y) => sum + (y.annualBudget || 0), 0) / eraYears.length
      : 0
    const peak = eraYears.length
      ? Math.max(...eraYears.map((y) => y.annualBudget || 0))
      : 0
    return { era: era.name, avg, peak, color: ERA_COLORS[era.id] }
  })

  // Year-over-year growth — use smoothed data for consistent chart
  const yoyGrowth = smoothYears
    .filter((y) => y.staffCount)
    .map((y, i, arr) => {
      const prev = i > 0 ? arr[i - 1] : null
      return {
        year: y.fiscalYear,
        staffGrowth: prev?.staffCount && y.staffCount
          ? Math.round(((y.staffCount - prev.staffCount) / prev.staffCount) * 100)
          : 0,
        budgetGrowth: prev?.annualBudget && y.annualBudget
          ? Math.round(((y.annualBudget - prev.annualBudget) / prev.annualBudget) * 100)
          : 0,
      }
    })

  // All quotes
  const allQuotes = eras.flatMap((e) => e.quotes)

  // Latest + earliest for comparison
  const latest = years[years.length - 1]
  const earliest = years.find((y) => y.staffCount)

  const staffGrowth = growth(latest?.staffCount ?? null, earliest?.staffCount ?? null)
  const budgetGrowth = growth(latest?.annualBudget ?? null, earliest?.annualBudget ?? null)

  // Achievement category counts
  const achievementCategories = years.flatMap((y) => y.achievements).reduce((acc, a) => {
    const cat = a.category?.replace(/ \(ai-extraction.*\)/, '') || 'other'
    acc[cat] = (acc[cat] || 0) + 1
    return acc
  }, {} as Record<string, number>)

  const categoryData = Object.entries(achievementCategories)
    .sort((a, b) => b[1] - a[1])
    .slice(0, 6)
    .map(([name, count]) => ({ name: name.charAt(0).toUpperCase() + name.slice(1), count }))

  const CATEGORY_COLORS = ['#3B82F6', '#8B5CF6', '#10B981', '#F59E0B', '#EF4444', '#6366F1']

  // ─── Render ──────────────────────────────────────────────────────────────

  return (
    <div className="min-h-screen" style={{ backgroundColor: C.shell }}>
      {/* HERO HEADER */}
      <div
        className="text-white"
        style={{ background: `linear-gradient(135deg, ${C.ocean}, ${C.midnight} 60%, ${C.earth})` }}
      >
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12 md:py-16">
          <div className="flex flex-col md:flex-row md:items-end md:justify-between gap-6">
            <div>
              <div className="flex items-center gap-3 mb-4">
                <div className="p-2 rounded-lg" style={{ backgroundColor: 'rgba(255,255,255,0.15)' }}>
                  <BarChart3 className="w-5 h-5" />
                </div>
                <span
                  className="font-bold uppercase"
                  style={{ color: C.ochre, fontSize: 11, letterSpacing: '0.3em' }}
                >
                  Data dashboard
                </span>
              </div>
              <h1
                className="font-fraunces font-bold mb-3"
                style={{ fontSize: 'clamp(32px, 5.5vw, 56px)', lineHeight: 1.1, textShadow: '0 2px 8px rgba(0,0,0,0.3)' }}
              >
                17 years of impact
              </h1>
              <p
                className="font-fraunces max-w-2xl"
                style={{ color: 'rgba(255,255,255,0.85)', fontSize: 'clamp(16px, 2vw, 19px)', lineHeight: 1.55 }}
              >
                Every number tells a story of community growth, self-determination, and resilience on Palm Island.
              </p>
            </div>
            <Link
              href="/20-years"
              className="inline-flex items-center gap-2 px-6 py-3 rounded-md font-bold uppercase text-xs hover:opacity-90 transition flex-shrink-0"
              style={{ backgroundColor: 'rgba(255,255,255,0.15)', color: '#FFFFFF', border: '1px solid rgba(255,255,255,0.3)', letterSpacing: '0.15em' }}
            >
              View story
              <ChevronRight className="w-3.5 h-3.5" />
            </Link>
          </div>
        </div>
      </div>

      {/* HERO STATS ROW */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 -mt-8 relative z-10">
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
          <StatCard
            icon={Users}
            label="Staff Today"
            value={summary.latestStaff || 0}
            subValue={`From ${earliest?.staffCount || '?'} in ${earliest?.fiscalYear || '2009'}`}
            change={staffGrowth}
            color="blue"
          />
          <StatCard
            icon={DollarSign}
            label="Annual Budget"
            value={fmtBudget(summary.latestBudget)}
            subValue="Total income FY 2023-24"
            change={budgetGrowth}
            color="purple"
          />
          <StatCard
            icon={Briefcase}
            label="Active Services"
            value={summary.latestServices || 0}
            subValue="Community programs"
            color="green"
          />
          <StatCard
            icon={Heart}
            label="Indigenous Employment"
            value={summary.latestIndigenous || '80%+'}
            subValue="Of total workforce"
            color="amber"
          />
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12 space-y-16">

        {/* ─── SECTION: Growth Over Time ─────────────────────────────────── */}
        <section>
          <SectionHeader
            title="Growth Over Time"
            subtitle="Staff and budget trajectory across 17 years"
            icon={TrendingUp}
          />
          <div className="grid lg:grid-cols-3 gap-6">
            {/* Main chart */}
            <ChartCard title="Staff & Budget Trend" className="lg:col-span-2">
              <ResponsiveContainer width="100%" height={350}>
                <ComposedChart data={chartData} margin={{ top: 10, right: 10, left: 0, bottom: 0 }}>
                  <defs>
                    <linearGradient id="staffFill" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="#8B5CF6" stopOpacity={0.2} />
                      <stop offset="95%" stopColor="#8B5CF6" stopOpacity={0} />
                    </linearGradient>
                    <linearGradient id="budgetFill" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="#3B82F6" stopOpacity={0.2} />
                      <stop offset="95%" stopColor="#3B82F6" stopOpacity={0} />
                    </linearGradient>
                  </defs>
                  <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
                  <XAxis dataKey="year" tick={{ fontSize: 11, fill: '#9CA3AF' }} interval="preserveStartEnd" />
                  <YAxis yAxisId="staff" tick={{ fontSize: 11, fill: '#9CA3AF' }} width={35} />
                  <YAxis yAxisId="budget" orientation="right" tick={{ fontSize: 11, fill: '#9CA3AF' }} tickFormatter={fmtBudget} width={55} />
                  <Tooltip content={<CustomTooltip />} />
                  <Area yAxisId="staff" type="monotone" dataKey="staff" name="Staff" stroke="#8B5CF6" strokeWidth={2.5} fill="url(#staffFill)" dot={{ r: 3, fill: '#8B5CF6' }} activeDot={{ r: 5 }} />
                  <Line yAxisId="budget" type="monotone" dataKey="budget" name="Budget" stroke="#3B82F6" strokeWidth={2.5} dot={{ r: 3, fill: '#3B82F6' }} activeDot={{ r: 5 }} />
                </ComposedChart>
              </ResponsiveContainer>
              <div className="flex justify-center gap-6 mt-2 text-xs text-gray-500">
                <div className="flex items-center gap-1.5"><div className="w-3 h-1.5 rounded bg-picc-ochre" /> Staff (left axis)</div>
                <div className="flex items-center gap-1.5"><div className="w-3 h-1.5 rounded bg-picc-red" /> Budget (right axis)</div>
              </div>
            </ChartCard>

            {/* YoY Growth */}
            <ChartCard title="Year-over-Year Growth %">
              <ResponsiveContainer width="100%" height={350}>
                <BarChart data={yoyGrowth} margin={{ top: 10, right: 5, left: -10, bottom: 0 }}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
                  <XAxis dataKey="year" tick={{ fontSize: 9, fill: '#9CA3AF' }} angle={-45} textAnchor="end" height={50} />
                  <YAxis tick={{ fontSize: 10, fill: '#9CA3AF' }} tickFormatter={(v: number) => `${v}%`} />
                  <Tooltip content={<CustomTooltip />} />
                  <Bar dataKey="staffGrowth" name="Staff Growth" fill="#8B5CF6" radius={[4, 4, 0, 0]} />
                  <Bar dataKey="budgetGrowth" name="Budget Growth" fill="#3B82F6" radius={[4, 4, 0, 0]} />
                </BarChart>
              </ResponsiveContainer>
            </ChartCard>
          </div>
        </section>

        {/* ─── SECTION: Workforce ──────────────────────────────────────── */}
        <section>
          <SectionHeader
            title="Workforce"
            subtitle="Indigenous-led employment on Palm Island"
            icon={Users}
          />
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
            {/* Indigenous % pie */}
            <ChartCard title="Indigenous Employment">
              <div className="flex items-center justify-center">
                <ResponsiveContainer width="100%" height={250}>
                  <PieChart>
                    <Pie
                      data={staffComposition}
                      cx="50%"
                      cy="50%"
                      innerRadius={60}
                      outerRadius={90}
                      dataKey="value"
                      stroke="none"
                    >
                      {staffComposition.map((entry, i) => (
                        <Cell key={i} fill={entry.color} />
                      ))}
                    </Pie>
                    <Tooltip />
                  </PieChart>
                </ResponsiveContainer>
              </div>
              <div className="text-center -mt-4">
                <div className="text-3xl font-bold text-picc-red">
                  {summary.latestIndigenous || '80%+'}
                </div>
                <div className="text-sm text-gray-500">Indigenous staff ({latest?.fiscalYear})</div>
              </div>
              <div className="flex justify-center gap-4 mt-3 text-xs">
                {staffComposition.map((s) => (
                  <div key={s.name} className="flex items-center gap-1.5">
                    <div className="w-2.5 h-2.5 rounded-full" style={{ backgroundColor: s.color }} />
                    {s.name}: {s.value}
                  </div>
                ))}
              </div>
            </ChartCard>

            {/* Staff growth area */}
            <ChartCard title="Staff Growth Path" className="lg:col-span-2">
              <ResponsiveContainer width="100%" height={280}>
                <AreaChart data={chartData} margin={{ top: 10, right: 10, left: 0, bottom: 0 }}>
                  <defs>
                    <linearGradient id="staffGrad" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="#8B5CF6" stopOpacity={0.3} />
                      <stop offset="95%" stopColor="#8B5CF6" stopOpacity={0.02} />
                    </linearGradient>
                  </defs>
                  <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
                  <XAxis dataKey="year" tick={{ fontSize: 10, fill: '#9CA3AF' }} interval="preserveStartEnd" />
                  <YAxis tick={{ fontSize: 10, fill: '#9CA3AF' }} />
                  <Tooltip content={<CustomTooltip />} />
                  <Area type="monotone" dataKey="staff" name="Total Staff" stroke="#8B5CF6" strokeWidth={3} fill="url(#staffGrad)" dot={(props: any) => {
                    const { cx, cy, payload } = props
                    return (
                      <circle
                        cx={cx}
                        cy={cy}
                        r={4}
                        fill={ERA_COLORS[payload.era] || '#8B5CF6'}
                        stroke="white"
                        strokeWidth={2}
                      />
                    )
                  }} />
                </AreaChart>
              </ResponsiveContainer>
              <div className="flex justify-center gap-4 mt-2 text-xs text-gray-500">
                {eras.map((e) => (
                  <div key={e.id} className="flex items-center gap-1.5">
                    <div className="w-2.5 h-2.5 rounded-full" style={{ backgroundColor: ERA_COLORS[e.id] }} />
                    {e.name}
                  </div>
                ))}
              </div>
            </ChartCard>
          </div>
        </section>

        {/* ─── SECTION: Financial Performance ──────────────────────────── */}
        <section>
          <SectionHeader
            title="Financial Performance"
            subtitle="Revenue growth and era comparisons"
            icon={DollarSign}
          />
          <div className="grid md:grid-cols-2 gap-6">
            {/* Budget by era */}
            <ChartCard title="Budget by Era (Average vs Peak)">
              <ResponsiveContainer width="100%" height={280}>
                <BarChart data={budgetByEra} margin={{ top: 10, right: 10, left: 0, bottom: 0 }}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
                  <XAxis dataKey="era" tick={{ fontSize: 10, fill: '#9CA3AF' }} />
                  <YAxis tick={{ fontSize: 10, fill: '#9CA3AF' }} tickFormatter={fmtBudget} />
                  <Tooltip content={<CustomTooltip />} />
                  <Bar dataKey="avg" name="Average Budget" radius={[4, 4, 0, 0]}>
                    {budgetByEra.map((entry, i) => (
                      <Cell key={i} fill={entry.color} opacity={0.6} />
                    ))}
                  </Bar>
                  <Bar dataKey="peak" name="Peak Budget" radius={[4, 4, 0, 0]}>
                    {budgetByEra.map((entry, i) => (
                      <Cell key={i} fill={entry.color} />
                    ))}
                  </Bar>
                </BarChart>
              </ResponsiveContainer>
            </ChartCard>

            {/* Services line */}
            <ChartCard title="Service Expansion">
              <ResponsiveContainer width="100%" height={280}>
                <AreaChart data={chartData.filter(d => d.services > 0)} margin={{ top: 10, right: 10, left: 0, bottom: 0 }}>
                  <defs>
                    <linearGradient id="servGrad" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="#10B981" stopOpacity={0.3} />
                      <stop offset="95%" stopColor="#10B981" stopOpacity={0} />
                    </linearGradient>
                  </defs>
                  <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
                  <XAxis dataKey="year" tick={{ fontSize: 10, fill: '#9CA3AF' }} interval="preserveStartEnd" />
                  <YAxis tick={{ fontSize: 10, fill: '#9CA3AF' }} />
                  <Tooltip content={<CustomTooltip />} />
                  <Area type="monotone" dataKey="services" name="Services" stroke="#10B981" strokeWidth={2.5} fill="url(#servGrad)" dot={{ r: 3, fill: '#10B981' }} />
                </AreaChart>
              </ResponsiveContainer>
            </ChartCard>
          </div>
        </section>

        {/* ─── SECTION: Achievements & Quotes ─────────────────────────── */}
        <section>
          <SectionHeader
            title="Achievements & Voices"
            subtitle="Key milestones and community voices across 17 years"
            icon={Award}
          />
          <div className="grid lg:grid-cols-5 gap-6">
            {/* Achievement categories */}
            <ChartCard title="Achievement Categories" className="lg:col-span-2">
              <ResponsiveContainer width="100%" height={280}>
                <BarChart data={categoryData} layout="vertical" margin={{ top: 5, right: 10, left: 0, bottom: 5 }}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" horizontal={false} />
                  <XAxis type="number" tick={{ fontSize: 10, fill: '#9CA3AF' }} />
                  <YAxis type="category" dataKey="name" tick={{ fontSize: 11, fill: '#6B7280' }} width={90} />
                  <Tooltip />
                  <Bar dataKey="count" name="Count" radius={[0, 4, 4, 0]}>
                    {categoryData.map((_, i) => (
                      <Cell key={i} fill={CATEGORY_COLORS[i % CATEGORY_COLORS.length]} />
                    ))}
                  </Bar>
                </BarChart>
              </ResponsiveContainer>
            </ChartCard>

            {/* Quotes carousel */}
            <div className="lg:col-span-3">
              {allQuotes.length > 0 && <QuoteCarousel quotes={allQuotes} />}
            </div>
          </div>
        </section>

        {/* ─── SECTION: Era Deep Dive ─────────────────────────────────── */}
        <section>
          <SectionHeader
            title="Era Deep Dive"
            subtitle="Expand each era to explore detailed year-by-year data"
            icon={Calendar}
          />
          <EraTimeline eras={eras} />
        </section>

        {/* ─── SECTION: Milestones Timeline ───────────────────────────── */}
        <section>
          <SectionHeader
            title="Key Milestones"
            subtitle={`${years.flatMap(y => y.achievements).length} achievements across ${summary.totalYears} years`}
            icon={Shield}
          />
          <div className="bg-white rounded-2xl shadow-md border border-gray-100 p-6 md:p-8 max-h-[600px] overflow-y-auto">
            <AchievementsList years={years} />
          </div>
        </section>

        {/* ─── SECTION: Photo Gallery ─────────────────────────────────── */}
        {years.some(y => y.images.length > 0) && (
          <section>
            <SectionHeader
              title="Photo Archive"
              subtitle={`${summary.totalImages} photos preserved from annual reports`}
              icon={MapPin}
            />
            <div className="columns-2 md:columns-3 lg:columns-4 gap-4">
              {years
                .flatMap((y) => y.images.map((img) => ({ ...img, era: y.era, year: y.fiscalYear })))
                .slice(0, 24)
                .map((img, i) => (
                  <motion.div
                    key={img.id || i}
                    initial={{ opacity: 0, scale: 0.95 }}
                    whileInView={{ opacity: 1, scale: 1 }}
                    viewport={{ once: true }}
                    className="mb-4 break-inside-avoid"
                  >
                    <div className="relative group rounded-xl overflow-hidden shadow-md hover:shadow-xl transition-shadow">
                      <img
                        src={img.url}
                        alt={img.alt}
                        loading="lazy"
                        className="w-full object-cover"
                      />
                      <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity">
                        <div className="absolute bottom-0 left-0 right-0 p-3">
                          <span
                            className="text-xs font-bold text-white px-2 py-0.5 rounded-full"
                            style={{ backgroundColor: ERA_COLORS[img.era] || '#6B7280' }}
                          >
                            {img.year}
                          </span>
                          {img.caption && (
                            <p className="text-white text-xs mt-1 line-clamp-2">{img.caption}</p>
                          )}
                        </div>
                      </div>
                    </div>
                  </motion.div>
                ))}
            </div>
          </section>
        )}

      </div>

      {/* FOOTER CTA */}
      <div
        className="text-white py-20"
        style={{ background: `linear-gradient(135deg, ${C.midnight}, ${C.earth})` }}
      >
        <div className="max-w-3xl mx-auto px-6 text-center">
          <p
            className="font-bold uppercase mb-4"
            style={{ color: C.ochre, fontSize: 11, letterSpacing: '0.3em' }}
          >
            The full picture
          </p>
          <h2
            className="font-fraunces font-bold mb-4"
            style={{ fontSize: 'clamp(28px, 4.5vw, 44px)', lineHeight: 1.1 }}
          >
            From 18 staff to 197
          </h2>
          <p
            className="font-fraunces mb-10"
            style={{ color: 'rgba(255,255,255,0.78)', fontSize: 'clamp(16px, 2vw, 19px)', lineHeight: 1.6 }}
          >
            Every number represents a real person, a real service, a real impact on the Palm Island
            community. This is what self-determination looks like in data.
          </p>
          <div className="flex flex-wrap justify-center gap-3">
            <Link
              href="/20-years"
              className="inline-flex items-center gap-2 px-6 py-3 rounded-md font-bold uppercase text-xs hover:opacity-90 transition"
              style={{ backgroundColor: '#FFFFFF', color: C.ocean, letterSpacing: '0.15em' }}
            >
              Read our story
            </Link>
            <Link
              href="/publications"
              className="inline-flex items-center gap-2 px-6 py-3 rounded-md font-bold uppercase text-xs hover:bg-white/15 transition"
              style={{ backgroundColor: 'rgba(255,255,255,0.1)', color: '#FFFFFF', border: '1px solid rgba(255,255,255,0.4)', letterSpacing: '0.15em' }}
            >
              View annual reports
            </Link>
          </div>
        </div>
      </div>
    </div>
  )
}
