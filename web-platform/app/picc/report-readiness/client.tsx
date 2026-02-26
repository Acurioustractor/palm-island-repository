'use client'

import Link from 'next/link'
import {
  BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer,
  CartesianGrid, Cell
} from 'recharts'
import type { CompletenessReport, CompletenessStatus } from '@/lib/content-readiness/check-completeness'

const STATUS_CONFIG: Record<CompletenessStatus, { dot: string; bg: string; text: string; label: string }> = {
  green: { dot: 'bg-green-500', bg: 'bg-green-50', text: 'text-green-700', label: 'Complete' },
  amber: { dot: 'bg-amber-500', bg: 'bg-amber-50', text: 'text-amber-700', label: 'Partial' },
  red: { dot: 'bg-red-500', bg: 'bg-red-50', text: 'text-red-700', label: 'Missing' },
}

const SECTION_LINKS: Record<string, string> = {
  'CEO Message': '/picc/annual-reports',
  'Chair Message': '/picc/annual-reports',
  'Financial Data': '/picc/financials',
  'Community Voices': '/picc/stories',
  'Gallery Photos': '/picc/media',
  'Elder Quotes': '/picc/stories',
  'Board Photos': '/picc/media',
}

function ScoreRing({ score }: { score: number }) {
  const color = score >= 70 ? 'text-green-600' : score >= 40 ? 'text-amber-500' : 'text-red-500'
  const bg = score >= 70 ? 'bg-green-50 border-green-200' : score >= 40 ? 'bg-amber-50 border-amber-200' : 'bg-red-50 border-red-200'

  return (
    <div className={`rounded-2xl border-2 ${bg} p-8 flex flex-col items-center justify-center`}>
      <div className={`text-5xl font-bold ${color}`}>{score}</div>
      <div className="text-sm text-gray-500 mt-1">Overall Score</div>
      <div className={`text-xs font-medium mt-2 px-3 py-1 rounded-full ${
        score >= 70 ? 'bg-green-100 text-green-700' : score >= 40 ? 'bg-amber-100 text-amber-700' : 'bg-red-100 text-red-700'
      }`}>
        {score >= 70 ? 'On Track' : score >= 40 ? 'Needs Attention' : 'Action Required'}
      </div>
    </div>
  )
}

export function ReportReadinessClient({ report }: { report: CompletenessReport }) {
  const { reportSections, services, overallScore } = report

  // Service chart data sorted by score descending
  const serviceChartData = [...services]
    .sort((a, b) => b.score - a.score)
    .map(s => ({
      name: s.name.length > 25 ? s.name.slice(0, 22) + '...' : s.name,
      score: s.score,
      color: s.status === 'green' ? '#059669' : s.status === 'amber' ? '#D97706' : '#DC2626',
    }))

  // Gaps: red first, then amber
  const gaps = reportSections
    .filter(s => s.status !== 'green')
    .sort((a, b) => {
      if (a.status === 'red' && b.status !== 'red') return -1
      if (a.status !== 'red' && b.status === 'red') return 1
      return 0
    })

  const hasServiceData = serviceChartData.length > 0

  return (
    <div className="space-y-8">
      {/* Overall Score + Section Status */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <ScoreRing score={overallScore} />

        <div className="lg:col-span-2">
          <h2 className="text-sm font-semibold text-gray-400 uppercase tracking-wide mb-3">Report Sections</h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            {reportSections.map(section => {
              const cfg = STATUS_CONFIG[section.status]
              return (
                <div key={section.section} className="rounded-xl border border-gray-200 bg-white p-4 flex items-start gap-3">
                  <div className={`w-2.5 h-2.5 rounded-full mt-1 shrink-0 ${cfg.dot}`} />
                  <div className="flex-1 min-w-0">
                    <div className="text-sm font-medium text-gray-900">{section.section}</div>
                    <div className="text-xs text-gray-500 mt-0.5 line-clamp-2">{section.details}</div>
                  </div>
                  <span className={`text-xs px-2 py-0.5 rounded-full font-medium shrink-0 ${cfg.bg} ${cfg.text}`}>
                    {cfg.label}
                  </span>
                </div>
              )
            })}
          </div>
        </div>
      </div>

      {/* Service Completeness */}
      {hasServiceData && (
        <section>
          <h2 className="text-sm font-semibold text-gray-400 uppercase tracking-wide mb-3">Service Completeness</h2>
          <div className="rounded-xl border border-gray-200 bg-white p-5">
            <ResponsiveContainer width="100%" height={Math.max(serviceChartData.length * 40, 200)}>
              <BarChart data={serviceChartData} layout="vertical" margin={{ left: 130, right: 30, top: 5, bottom: 5 }}>
                <CartesianGrid strokeDasharray="3 3" horizontal={false} />
                <XAxis type="number" domain={[0, 100]} tickFormatter={(v) => `${v}%`} />
                <YAxis type="category" dataKey="name" width={125} tick={{ fontSize: 12 }} />
                <Tooltip formatter={(value) => `${value}%`} />
                <Bar dataKey="score" radius={[0, 4, 4, 0]}>
                  {serviceChartData.map((entry, i) => (
                    <Cell key={i} fill={entry.color} />
                  ))}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          </div>
        </section>
      )}

      {/* Gaps List */}
      {gaps.length > 0 && (
        <section>
          <h2 className="text-sm font-semibold text-gray-400 uppercase tracking-wide mb-3">
            Gaps to Address ({gaps.length})
          </h2>
          <div className="rounded-xl border border-gray-200 bg-white divide-y divide-gray-100">
            {gaps.map(gap => {
              const cfg = STATUS_CONFIG[gap.status]
              const link = SECTION_LINKS[gap.section]

              return (
                <div key={gap.section} className="p-4 flex items-center gap-3">
                  <div className={`w-2.5 h-2.5 rounded-full shrink-0 ${cfg.dot}`} />
                  <div className="flex-1 min-w-0">
                    <div className="text-sm font-medium text-gray-900">{gap.section}</div>
                    <div className="text-xs text-gray-500 mt-0.5">{gap.details}</div>
                  </div>
                  {link && (
                    <Link
                      href={link}
                      className="text-xs font-medium text-gray-600 hover:text-gray-900 px-3 py-1.5 rounded-lg border border-gray-200 hover:bg-gray-50 transition-colors shrink-0"
                    >
                      Fix &rarr;
                    </Link>
                  )}
                </div>
              )
            })}
          </div>
        </section>
      )}

      {/* All green state */}
      {gaps.length === 0 && (
        <div className="rounded-xl border-2 border-green-200 bg-green-50 p-8 text-center">
          <div className="text-lg font-medium text-green-800">All report sections are complete</div>
          <div className="text-sm text-green-600 mt-1">Ready to generate the annual report</div>
        </div>
      )}
    </div>
  )
}
