import { createClient } from '@supabase/supabase-js'

function getSupabase() {
  return createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    { auth: { autoRefreshToken: false, persistSession: false } }
  )
}

export async function GET(request: Request) {
  try {
  const url = new URL(request.url)
  const days = Math.min(Math.max(parseInt(url.searchParams.get('days') || '7', 10), 1), 90)
  const since = new Date(Date.now() - days * 86400_000).toISOString()

  const supabase = getSupabase()

  // Parallel queries for dashboard data
  const [sessionsResult, analyticsResult, feedbackResult, recentSessionsResult] = await Promise.all([
    // Session counts by day
    supabase
      .from('chat_sessions')
      .select('started_at, audience, message_count')
      .gte('started_at', since)
      .order('started_at', { ascending: false }),

    // Analytics (classified sessions)
    supabase
      .from('chat_analytics')
      .select('topics, sentiment, intent, was_resolved, tools_used, audience')
      .gte('analyzed_at', since),

    // Feedback counts
    supabase
      .from('chat_feedback')
      .select('rating, created_at')
      .gte('created_at', since),

    // Recent sessions (for "unanswered" view)
    supabase
      .from('chat_sessions')
      .select('session_id, messages, audience, started_at, message_count')
      .gte('started_at', since)
      .order('started_at', { ascending: false })
      .limit(50),
  ])

  const sessions = sessionsResult.data || []
  const analytics = analyticsResult.data || []
  const feedback = feedbackResult.data || []
  const recentSessions = recentSessionsResult.data || []

  // Aggregate: sessions per day
  const sessionsPerDay: Record<string, number> = {}
  for (const s of sessions) {
    const day = s.started_at?.split('T')[0] || 'unknown'
    sessionsPerDay[day] = (sessionsPerDay[day] || 0) + 1
  }

  // Aggregate: audience breakdown
  const audienceBreakdown: Record<string, number> = {}
  for (const s of sessions) {
    const aud = s.audience || 'community'
    audienceBreakdown[aud] = (audienceBreakdown[aud] || 0) + 1
  }

  // Aggregate: top topics
  const topicCounts: Record<string, number> = {}
  for (const a of analytics) {
    for (const t of (a.topics || [])) {
      topicCounts[t] = (topicCounts[t] || 0) + 1
    }
  }
  const topTopics = Object.entries(topicCounts)
    .sort(([, a], [, b]) => b - a)
    .slice(0, 10)
    .map(([topic, count]) => ({ topic, count }))

  // Aggregate: sentiment breakdown
  const sentimentBreakdown: Record<string, number> = {}
  for (const a of analytics) {
    if (a.sentiment) {
      sentimentBreakdown[a.sentiment] = (sentimentBreakdown[a.sentiment] || 0) + 1
    }
  }

  // Aggregate: tool usage
  const toolCounts: Record<string, number> = {}
  for (const a of analytics) {
    for (const t of (a.tools_used || [])) {
      toolCounts[t] = (toolCounts[t] || 0) + 1
    }
  }
  const topTools = Object.entries(toolCounts)
    .sort(([, a], [, b]) => b - a)
    .slice(0, 10)
    .map(([tool, count]) => ({ tool, count }))

  // Aggregate: feedback
  const feedbackSummary = {
    helpful: feedback.filter(f => f.rating === 'helpful').length,
    not_helpful: feedback.filter(f => f.rating === 'not_helpful').length,
    total: feedback.length,
  }

  // Aggregate: usage by hour (AEST = UTC+10)
  const hourlyUsage: Record<number, number> = {}
  for (const s of sessions) {
    if (s.started_at) {
      const aestHour = parseInt(
        new Date(s.started_at).toLocaleString('en-AU', { timeZone: 'Australia/Brisbane', hour: 'numeric', hour12: false }),
        10
      )
      hourlyUsage[aestHour] = (hourlyUsage[aestHour] || 0) + 1
    }
  }

  // Resolution rate
  const resolved = analytics.filter(a => a.was_resolved === true).length
  const unresolved = analytics.filter(a => a.was_resolved === false).length

  return new Response(JSON.stringify({
    period: { days, since },
    summary: {
      totalSessions: sessions.length,
      totalMessages: sessions.reduce((sum, s) => sum + (s.message_count || 0), 0),
      avgMessagesPerSession: sessions.length > 0
        ? (sessions.reduce((sum, s) => sum + (s.message_count || 0), 0) / sessions.length).toFixed(1)
        : '0',
      resolutionRate: analytics.length > 0
        ? `${((resolved / analytics.length) * 100).toFixed(0)}%`
        : 'N/A',
    },
    sessionsPerDay,
    audienceBreakdown,
    topTopics,
    sentimentBreakdown,
    topTools,
    feedbackSummary,
    hourlyUsage,
    resolved,
    unresolved,
    recentSessions: recentSessions.map(s => ({
      sessionId: s.session_id,
      audience: s.audience,
      messageCount: s.message_count,
      startedAt: s.started_at,
      firstMessage: Array.isArray(s.messages) && s.messages.length > 0
        ? (s.messages[0] as { content?: string }).content?.substring(0, 100) || ''
        : '',
    })),
  }), {
    headers: { 'Content-Type': 'application/json' },
  })
  } catch (err) {
    console.error('Chat analytics error:', err)
    return new Response(JSON.stringify({ error: 'Failed to load analytics' }), {
      status: 500,
      headers: { 'Content-Type': 'application/json' },
    })
  }
}
