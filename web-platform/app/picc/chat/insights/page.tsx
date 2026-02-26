'use client'

import { useState, useEffect } from 'react'
import Link from 'next/link'
import { ArrowLeft, MessageSquare, ThumbsUp, ThumbsDown, TrendingUp, Clock, Users } from 'lucide-react'

interface AnalyticsData {
  period: { days: number; since: string }
  summary: {
    totalSessions: number
    totalMessages: number
    avgMessagesPerSession: string
    resolutionRate: string
  }
  sessionsPerDay: Record<string, number>
  audienceBreakdown: Record<string, number>
  topTopics: Array<{ topic: string; count: number }>
  sentimentBreakdown: Record<string, number>
  topTools: Array<{ tool: string; count: number }>
  feedbackSummary: { helpful: number; not_helpful: number; total: number }
  hourlyUsage: Record<number, number>
  resolved: number
  unresolved: number
  recentSessions: Array<{
    sessionId: string
    audience: string
    messageCount: number
    startedAt: string
    firstMessage: string
  }>
}

function StatCard({ label, value, icon: Icon, subtext }: {
  label: string
  value: string | number
  icon: React.ElementType
  subtext?: string
}) {
  return (
    <div className="bg-white rounded-2xl border border-warm-200 p-5">
      <div className="flex items-center gap-3">
        <div className="w-10 h-10 rounded-xl bg-picc-ochre/10 flex items-center justify-center text-picc-ochre">
          <Icon className="w-5 h-5" />
        </div>
        <div>
          <div className="text-2xl font-bold text-picc-earth">{value}</div>
          <div className="text-xs text-picc-earth-300">{label}</div>
        </div>
      </div>
      {subtext && <p className="text-xs text-picc-earth-200 mt-2">{subtext}</p>}
    </div>
  )
}

function BarChart({ data, maxBars = 10 }: { data: Array<{ label: string; value: number }>; maxBars?: number }) {
  const items = data.slice(0, maxBars)
  const maxVal = Math.max(...items.map(d => d.value), 1)

  return (
    <div className="space-y-2">
      {items.map((item) => (
        <div key={item.label} className="flex items-center gap-3">
          <span className="text-xs text-picc-earth-300 w-28 truncate text-right">{item.label}</span>
          <div className="flex-1 h-6 bg-warm-50 rounded-full overflow-hidden">
            <div
              className="h-full bg-picc-ochre/70 rounded-full transition-all duration-500"
              style={{ width: `${(item.value / maxVal) * 100}%` }}
            />
          </div>
          <span className="text-xs font-medium text-picc-earth w-8 text-right">{item.value}</span>
        </div>
      ))}
    </div>
  )
}

function HourlyHeatmap({ data }: { data: Record<number, number> }) {
  const maxVal = Math.max(...Object.values(data), 1)
  const hours = Array.from({ length: 24 }, (_, i) => i)

  return (
    <div className="flex gap-1 items-end h-24">
      {hours.map((hour) => {
        const count = data[hour] || 0
        const height = count > 0 ? Math.max(8, (count / maxVal) * 100) : 4
        return (
          <div key={hour} className="flex-1 flex flex-col items-center gap-1">
            <div
              className={`w-full rounded-sm transition-all ${count > 0 ? 'bg-picc-ochre' : 'bg-warm-100'}`}
              style={{ height: `${height}%`, opacity: count > 0 ? 0.3 + (count / maxVal) * 0.7 : 0.3 }}
              title={`${hour}:00 — ${count} sessions`}
            />
            {hour % 4 === 0 && (
              <span className="text-[9px] text-picc-earth-200">{hour}</span>
            )}
          </div>
        )
      })}
    </div>
  )
}

export default function ChatInsightsPage() {
  const [data, setData] = useState<AnalyticsData | null>(null)
  const [loading, setLoading] = useState(true)
  const [days, setDays] = useState(7)

  useEffect(() => {
    setLoading(true)
    fetch(`/api/chat/analytics?days=${days}`)
      .then(r => r.json())
      .then(setData)
      .catch(console.error)
      .finally(() => setLoading(false))
  }, [days])

  const sentimentColors: Record<string, string> = {
    positive: 'bg-green-100 text-green-800',
    neutral: 'bg-gray-100 text-gray-700',
    negative: 'bg-red-100 text-red-800',
    urgent: 'bg-orange-100 text-orange-800',
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-warm-50 to-cream">
      <div className="max-w-6xl mx-auto px-6 py-8">
        {/* Header */}
        <div className="flex items-center justify-between mb-8">
          <div className="flex items-center gap-3">
            <Link href="/picc" className="p-2 rounded-lg hover:bg-warm-100 text-picc-earth-300 transition-colors">
              <ArrowLeft className="w-5 h-5" />
            </Link>
            <div>
              <h1 className="text-2xl font-bold text-picc-earth">Chat Insights</h1>
              <p className="text-sm text-picc-earth-300">What the community is asking about</p>
            </div>
          </div>
          <div className="flex gap-2">
            {[7, 14, 30].map((d) => (
              <button
                key={d}
                onClick={() => setDays(d)}
                className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-colors ${
                  days === d
                    ? 'bg-picc-ochre text-white'
                    : 'bg-white text-picc-earth-300 border border-warm-200 hover:bg-warm-50'
                }`}
              >
                {d}d
              </button>
            ))}
          </div>
        </div>

        {loading && (
          <div className="text-center py-20 text-picc-earth-200">Loading analytics...</div>
        )}

        {data && !loading && (
          <div className="space-y-6">
            {/* Summary cards */}
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
              <StatCard label="Total Sessions" value={data.summary.totalSessions} icon={MessageSquare} />
              <StatCard label="Total Messages" value={data.summary.totalMessages} icon={TrendingUp} />
              <StatCard
                label="Avg Messages/Session"
                value={data.summary.avgMessagesPerSession}
                icon={Clock}
              />
              <StatCard
                label="Feedback"
                value={data.feedbackSummary.total}
                icon={ThumbsUp}
                subtext={data.feedbackSummary.total > 0
                  ? `${data.feedbackSummary.helpful} helpful, ${data.feedbackSummary.not_helpful} not helpful`
                  : 'No feedback yet'}
              />
            </div>

            {/* Two column layout */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              {/* Top queries */}
              <div className="bg-white rounded-2xl border border-warm-200 p-5">
                <h2 className="text-sm font-semibold text-picc-earth uppercase tracking-wide mb-4">Top Topics</h2>
                {data.topTopics.length > 0 ? (
                  <BarChart data={data.topTopics.map(t => ({ label: t.topic, value: t.count }))} />
                ) : (
                  <p className="text-sm text-picc-earth-200">No classified topics yet. Run the nightly analysis script.</p>
                )}
              </div>

              {/* Tool usage */}
              <div className="bg-white rounded-2xl border border-warm-200 p-5">
                <h2 className="text-sm font-semibold text-picc-earth uppercase tracking-wide mb-4">Tool Usage</h2>
                {data.topTools.length > 0 ? (
                  <BarChart data={data.topTools.map(t => ({ label: t.tool.replace(/^get/, '').replace(/([A-Z])/g, ' $1').trim(), value: t.count }))} />
                ) : (
                  <p className="text-sm text-picc-earth-200">No tool usage data yet.</p>
                )}
              </div>

              {/* Sentiment */}
              <div className="bg-white rounded-2xl border border-warm-200 p-5">
                <h2 className="text-sm font-semibold text-picc-earth uppercase tracking-wide mb-4">Sentiment</h2>
                {Object.keys(data.sentimentBreakdown).length > 0 ? (
                  <div className="flex flex-wrap gap-2">
                    {Object.entries(data.sentimentBreakdown).map(([sentiment, count]) => (
                      <div key={sentiment} className={`px-3 py-2 rounded-xl text-sm font-medium ${sentimentColors[sentiment] || 'bg-gray-100 text-gray-700'}`}>
                        <span className="capitalize">{sentiment}</span>
                        <span className="ml-2 font-bold">{count}</span>
                      </div>
                    ))}
                  </div>
                ) : (
                  <p className="text-sm text-picc-earth-200">No sentiment data yet.</p>
                )}

                <h3 className="text-xs font-semibold text-picc-earth-300 uppercase tracking-wide mt-6 mb-3">Audience Breakdown</h3>
                <div className="flex flex-wrap gap-2">
                  {Object.entries(data.audienceBreakdown).map(([aud, count]) => (
                    <div key={aud} className="flex items-center gap-2 px-3 py-1.5 rounded-lg bg-warm-50 border border-warm-200">
                      <Users className="w-3.5 h-3.5 text-picc-earth-200" />
                      <span className="text-xs capitalize text-picc-earth-300">{aud}</span>
                      <span className="text-xs font-bold text-picc-earth">{count}</span>
                    </div>
                  ))}
                </div>
              </div>

              {/* Hourly usage */}
              <div className="bg-white rounded-2xl border border-warm-200 p-5">
                <h2 className="text-sm font-semibold text-picc-earth uppercase tracking-wide mb-4">Usage by Hour</h2>
                <HourlyHeatmap data={data.hourlyUsage} />
                <p className="text-xs text-picc-earth-200 mt-2 text-center">Hours (AEST)</p>
              </div>
            </div>

            {/* Recent sessions table */}
            <div className="bg-white rounded-2xl border border-warm-200 overflow-hidden">
              <div className="px-5 py-4 border-b border-warm-200">
                <h2 className="text-sm font-semibold text-picc-earth uppercase tracking-wide">Recent Sessions</h2>
              </div>
              <div className="divide-y divide-warm-100 max-h-[400px] overflow-y-auto">
                {data.recentSessions.length > 0 ? (
                  data.recentSessions.map((s) => (
                    <div key={s.sessionId} className="px-5 py-3 flex items-center gap-4">
                      <div className="flex-1 min-w-0">
                        <p className="text-sm text-picc-earth truncate">
                          {s.firstMessage || '(empty)'}
                        </p>
                        <p className="text-xs text-picc-earth-200 mt-0.5">
                          {new Date(s.startedAt).toLocaleDateString('en-AU', { day: 'numeric', month: 'short', hour: '2-digit', minute: '2-digit' })}
                          {' · '}{s.messageCount} messages
                        </p>
                      </div>
                      <span className="text-xs px-2 py-0.5 rounded-full bg-warm-50 text-picc-earth-300 capitalize flex-shrink-0">
                        {s.audience}
                      </span>
                    </div>
                  ))
                ) : (
                  <div className="px-5 py-8 text-center text-sm text-picc-earth-200">
                    No chat sessions recorded yet. Sessions will appear here once users interact with Ask Palm AI.
                  </div>
                )}
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  )
}
