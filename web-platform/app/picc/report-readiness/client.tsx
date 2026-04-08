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

function getGuidance(section: string, fy: string): { link: string; howTo: string; action: string } {
  const guidance: Record<string, { link: string; howTo: string; action: string }> = {
    'CEO Message': { 
      link: '/picc/report-readiness/add/ceo-message', 
      howTo: 'Write the CEO/Leadership message for your annual report',
      action: 'Write Message'
    },
    'Chair Message': { 
      link: '/picc/report-readiness/add/ceo-message', 
      howTo: 'Write the Chair/Acknowledgements message for your annual report',
      action: 'Write Message'
    },
    'Financial Data': { 
      link: `/picc/report-readiness/add/financials?fy=${fy}`, 
      howTo: 'Add revenue, expenses, grants, and other financial data for this fiscal year',
      action: 'Add Financials'
    },
    'Community Voices': { 
      link: '/picc/report-readiness/add/quote', 
      howTo: 'Add community quotes that can be curated for your annual report',
      action: 'Add Quote'
    },
    'Gallery Photos': { 
      link: `/picc/report-readiness/add/photos?fy=${fy}&section=annual-report`, 
      howTo: 'Upload photos for your annual report - they will be automatically tagged',
      action: 'Upload Photos'
    },
    'Elder Quotes': { 
      link: '/picc/report-readiness/add/quote?type=elder', 
      howTo: 'Add quotes from Elders - mark attribution with "Elder", "Aunty", or "Uncle"',
      action: 'Add Elder Quote'
    },
    'Board Photos': { 
      link: `/picc/report-readiness/add/photos?fy=${fy}&section=board-member`, 
      howTo: 'Upload photos of board members for your annual report',
      action: 'Upload Board Photos'
    },
    'Service Stories': { 
      link: `/picc/report-readiness/add/story?fy=${fy}`, 
      howTo: 'Create stories about your services for this fiscal year',
      action: 'Create Story'
    },
    'Innovation Projects': { 
      link: '/picc/report-readiness/add/innovation', 
      howTo: 'Add innovation project entries for this fiscal year',
      action: 'Add Project'
    },
  }
  return guidance[section] || { link: '/picc/report-readiness', howTo: 'Contact support', action: 'Get Help' }
}

function ScoreRing({ score, fy }: { score: number, fy: string }) {
  const color = score >= 70 ? 'text-green-600' : score >= 40 ? 'text-amber-500' : 'text-red-500'
  const bg = score >= 70 ? 'bg-green-50 border-green-200' : score >= 40 ? 'bg-amber-50 border-amber-200' : 'bg-red-50 border-red-200'

  return (
    <div className={`rounded-2xl border-2 ${bg} p-6 flex flex-col items-center justify-center`}>
      <div className={`text-5xl font-bold ${color}`}>{score}</div>
      <div className="text-sm text-gray-500 mt-1">Overall Score</div>
      <div className="text-xs text-gray-400 mt-1">{fy}</div>
      <div className={`text-xs font-medium mt-2 px-3 py-1 rounded-full ${
        score >= 70 ? 'bg-green-100 text-green-700' : score >= 40 ? 'bg-amber-100 text-amber-700' : 'bg-red-100 text-red-700'
      }`}>
        {score >= 70 ? 'On Track' : score >= 40 ? 'Needs Attention' : 'Action Required'}
      </div>
    </div>
  )
}

function ProgressBar({ have, needed }: { have: number, needed: number }) {
  const pct = Math.min(100, (have / needed) * 100)
  const color = pct >= 100 ? 'bg-green-500' : pct >= 50 ? 'bg-amber-500' : 'bg-red-500'
  
  return (
    <div className="flex items-center gap-2">
      <div className="flex-1 h-2 bg-gray-100 rounded-full overflow-hidden">
        <div className={`h-full ${color} rounded-full transition-all`} style={{ width: `${pct}%` }} />
      </div>
      <span className="text-xs text-gray-500 w-16 text-right">
        {have}/{needed}
      </span>
    </div>
  )
}

export function ReportReadinessClient({ report }: { report: CompletenessReport }) {
  const { reportSections, services, overallScore, fiscalYear } = report

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
        <ScoreRing score={overallScore} fy={fiscalYear} />

        <div className="lg:col-span-2">
          <h2 className="text-sm font-semibold text-gray-400 uppercase tracking-wide mb-3">Report Sections</h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            {reportSections.map(section => {
              const cfg = STATUS_CONFIG[section.status]
              const guidance = getGuidance(section.section, fiscalYear)
              const link = section.link || guidance?.link
              return (
                <div key={section.section} className="rounded-xl border border-gray-200 bg-white p-4 flex items-start gap-3">
                  <div className={`w-2.5 h-2.5 rounded-full mt-1 shrink-0 ${cfg.dot}`} />
                  <div className="flex-1 min-w-0">
                    <div className="text-sm font-medium text-gray-900 flex items-center gap-2">
                      {section.section}
                      <span className="text-xs text-gray-400 font-normal">({section.category})</span>
                    </div>
                    <div className="text-xs text-gray-500 mt-0.5 line-clamp-2">{section.details}</div>
                    {section.needed > 1 && (
                      <div className="mt-2">
                        <ProgressBar have={section.have} needed={section.needed} />
                      </div>
                    )}
                    {guidance && section.status !== 'green' && (
                      <div className="text-xs text-blue-600 mt-2">{guidance.howTo}</div>
                    )}
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
              const guidance = getGuidance(gap.section, fiscalYear)
              const link = gap.link || guidance?.link

              return (
                <div key={gap.section} className="p-4 flex items-center gap-3">
                  <div className={`w-2.5 h-2.5 rounded-full shrink-0 ${cfg.dot}`} />
                  <div className="flex-1 min-w-0">
                    <div className="text-sm font-medium text-gray-900">{gap.section}</div>
                    <div className="text-xs text-gray-500 mt-0.5">{gap.details}</div>
                    {guidance && (
                      <div className="text-xs text-blue-600 mt-1">{guidance.howTo}</div>
                    )}
                    {gap.needed > 1 && (
                      <div className="mt-1.5">
                        <ProgressBar have={gap.have} needed={gap.needed} />
                      </div>
                    )}
                  </div>
                  {link && (
                    <Link
                      href={link}
                      className="text-xs font-medium text-gray-600 hover:text-gray-900 px-3 py-1.5 rounded-lg border border-gray-200 hover:bg-gray-50 transition-colors shrink-0"
                    >
                      {guidance?.action || 'Fix'} &rarr;
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
          <Link 
            href="/picc/annual-reports"
            className="inline-flex items-center gap-2 mt-4 px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors"
          >
            Generate Report &rarr;
          </Link>
        </div>
      )}
    </div>
  )
}
