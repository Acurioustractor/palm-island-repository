'use client'

import { useState, useEffect } from 'react'
import Link from 'next/link'
import { ArrowLeft, MessageSquare, ThumbsUp, TrendingUp, Clock, Users, AlertCircle, Phone, Check } from 'lucide-react'

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
  unresolvedSessions: Array<{
    sessionId: string
    firstMessage: string
    audience: string
    sentiment: string
    hasContact: boolean
    startedAt: string
  }>
  contactRequests: Array<{
    sessionId: string
    name: string
    contactMethod: string
    reason: string
    firstMessage: string
    startedAt: string
    followedUp: boolean
    followedUpAt: string | null
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

function BarChart({ data, maxBars = 10, onBarClick, activeLabel }: {
  data: Array<{ label: string; value: number }>
  maxBars?: number
  onBarClick?: (label: string) => void
  activeLabel?: string | null
}) {
  const items = data.slice(0, maxBars)
  const maxVal = Math.max(...items.map(d => d.value), 1)

  return (
    <div className="space-y-2">
      {items.map((item) => (
        <div
          key={item.label}
          className={`flex items-center gap-3 ${onBarClick ? 'cursor-pointer hover:bg-warm-50 -mx-2 px-2 py-0.5 rounded-lg transition-colors' : ''} ${activeLabel === item.label ? 'bg-picc-ochre/5 ring-1 ring-picc-ochre/20 -mx-2 px-2 py-0.5 rounded-lg' : ''}`}
          onClick={() => onBarClick?.(item.label)}
        >
          <span className="text-xs text-picc-earth-300 w-28 truncate text-right">{item.label}</span>
          <div className="flex-1 h-6 bg-warm-50 rounded-full overflow-hidden">
            <div
              className={`h-full rounded-full transition-all duration-500 ${activeLabel === item.label ? 'bg-picc-ochre' : 'bg-picc-ochre/70'}`}
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
  const [topicFilter, setTopicFilter] = useState<string | null>(null)
  const [followUpLoading, setFollowUpLoading] = useState<string | null>(null)

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

  const handleMarkFollowedUp = async (sessionId: string) => {
    setFollowUpLoading(sessionId)
    try {
      await fetch('/api/chat/contact/follow-up', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ sessionId }),
      })
      // Update local state
      if (data) {
        setData({
          ...data,
          contactRequests: data.contactRequests.map(c =>
            c.sessionId === sessionId
              ? { ...c, followedUp: true, followedUpAt: new Date().toISOString() }
              : c
          ),
        })
      }
    } catch {
      // Non-fatal
    } finally {
      setFollowUpLoading(null)
    }
  }

  // Filter recent sessions by selected topic (searches firstMessage text)
  const filteredSessions = topicFilter && data
    ? data.recentSessions.filter(s =>
        s.firstMessage.toLowerCase().includes(topicFilter.toLowerCase())
      )
    : data?.recentSessions || []

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
              {/* Top topics (clickable for drill-down) */}
              <div className="bg-white rounded-2xl border border-warm-200 p-5">
                <div className="flex items-center justify-between mb-4">
                  <h2 className="text-sm font-semibold text-picc-earth uppercase tracking-wide">Top Topics</h2>
                  {topicFilter && (
                    <button
                      onClick={() => setTopicFilter(null)}
                      className="text-xs text-picc-ochre hover:underline"
                    >
                      Clear filter
                    </button>
                  )}
                </div>
                {data.topTopics.length > 0 ? (
                  <BarChart
                    data={data.topTopics.map(t => ({ label: t.topic, value: t.count }))}
                    onBarClick={(label) => setTopicFilter(topicFilter === label ? null : label)}
                    activeLabel={topicFilter}
                  />
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

            {/* Unanswered Questions panel */}
            {data.unresolvedSessions && data.unresolvedSessions.length > 0 && (
              <div className="bg-white rounded-2xl border border-red-200 overflow-hidden">
                <div className="px-5 py-4 border-b border-red-100 bg-red-50/50 flex items-center gap-2">
                  <AlertCircle className="w-4 h-4 text-red-500" />
                  <h2 className="text-sm font-semibold text-picc-earth uppercase tracking-wide">
                    Unanswered Questions ({data.unresolvedSessions.length})
                  </h2>
                </div>
                <div className="divide-y divide-warm-100 max-h-[350px] overflow-y-auto">
                  {data.unresolvedSessions.map((s) => (
                    <div key={s.sessionId} className="px-5 py-3 flex items-center gap-4">
                      <div className="flex-1 min-w-0">
                        <p className="text-sm text-picc-earth">
                          {s.firstMessage || '(empty)'}
                        </p>
                        <p className="text-xs text-picc-earth-200 mt-0.5">
                          {new Date(s.startedAt).toLocaleDateString('en-AU', { day: 'numeric', month: 'short', hour: '2-digit', minute: '2-digit' })}
                          {s.sentiment && <span className={`ml-2 px-1.5 py-0.5 rounded text-[10px] ${sentimentColors[s.sentiment] || 'bg-gray-100 text-gray-700'}`}>{s.sentiment}</span>}
                        </p>
                      </div>
                      <div className="flex items-center gap-2 flex-shrink-0">
                        {s.hasContact && (
                          <span className="text-xs px-2 py-0.5 rounded-full bg-green-50 text-green-700 border border-green-200">
                            Has contact
                          </span>
                        )}
                        <span className="text-xs px-2 py-0.5 rounded-full bg-warm-50 text-picc-earth-300 capitalize">
                          {s.audience}
                        </span>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Contact Follow-ups panel */}
            {data.contactRequests && data.contactRequests.length > 0 && (
              <div className="bg-white rounded-2xl border border-picc-ochre/30 overflow-hidden">
                <div className="px-5 py-4 border-b border-picc-ochre/20 bg-picc-ochre/5 flex items-center gap-2">
                  <Phone className="w-4 h-4 text-picc-ochre" />
                  <h2 className="text-sm font-semibold text-picc-earth uppercase tracking-wide">
                    Contact Follow-ups ({data.contactRequests.filter(c => !c.followedUp).length} pending)
                  </h2>
                </div>
                <div className="divide-y divide-warm-100 max-h-[400px] overflow-y-auto">
                  {data.contactRequests.map((c) => (
                    <div key={c.sessionId} className={`px-5 py-3 ${c.followedUp ? 'opacity-60' : ''}`}>
                      <div className="flex items-start justify-between gap-4">
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center gap-2">
                            <span className="text-sm font-medium text-picc-earth">{c.name}</span>
                            <span className="text-xs text-picc-earth-200">{c.contactMethod}</span>
                          </div>
                          <p className="text-sm text-picc-earth-300 mt-0.5 truncate">
                            {c.firstMessage || '(no message)'}
                          </p>
                          <p className="text-xs text-picc-earth-200 mt-0.5">
                            {new Date(c.startedAt).toLocaleDateString('en-AU', { day: 'numeric', month: 'short', hour: '2-digit', minute: '2-digit' })}
                            {c.reason && <span className="ml-2 text-picc-earth-200">· {c.reason}</span>}
                          </p>
                        </div>
                        <div className="flex-shrink-0">
                          {c.followedUp ? (
                            <span className="flex items-center gap-1 text-xs text-green-700 px-2 py-1 rounded-lg bg-green-50">
                              <Check className="w-3 h-3" />
                              Done
                            </span>
                          ) : (
                            <button
                              onClick={() => handleMarkFollowedUp(c.sessionId)}
                              disabled={followUpLoading === c.sessionId}
                              className="text-xs px-3 py-1.5 rounded-lg bg-picc-ochre text-white hover:bg-picc-ochre-600 disabled:opacity-50 transition-colors"
                            >
                              {followUpLoading === c.sessionId ? 'Saving...' : 'Mark followed up'}
                            </button>
                          )}
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Recent sessions table (filtered by topic when active) */}
            <div className="bg-white rounded-2xl border border-warm-200 overflow-hidden">
              <div className="px-5 py-4 border-b border-warm-200 flex items-center justify-between">
                <h2 className="text-sm font-semibold text-picc-earth uppercase tracking-wide">
                  {topicFilter ? `Sessions about "${topicFilter}"` : 'Recent Sessions'}
                </h2>
                {topicFilter && (
                  <span className="text-xs text-picc-earth-200">{filteredSessions.length} results</span>
                )}
              </div>
              <div className="divide-y divide-warm-100 max-h-[400px] overflow-y-auto">
                {filteredSessions.length > 0 ? (
                  filteredSessions.map((s) => (
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
                    {topicFilter
                      ? `No sessions found matching "${topicFilter}".`
                      : 'No chat sessions recorded yet. Sessions will appear here once users interact with Ask Palm AI.'
                    }
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
