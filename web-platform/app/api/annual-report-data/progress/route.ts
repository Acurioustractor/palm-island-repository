import { NextResponse } from 'next/server'
import { createClient } from '@supabase/supabase-js'

export const runtime = 'nodejs'

function getSupabase() {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL
  const key = process.env.SUPABASE_SERVICE_ROLE_KEY
  if (!url || !key) throw new Error('Missing Supabase credentials')
  return createClient(url, key, { auth: { autoRefreshToken: false, persistSession: false } })
}

function getCurrentFYLabel(): string {
  const now = new Date()
  const startYear = now.getMonth() >= 6 ? now.getFullYear() : now.getFullYear() - 1
  const endYear = startYear + 1
  return `${startYear}-${String(endYear).slice(-2)}`
}

export async function GET() {
  try {
    const supabase = getSupabase()
    const fyLabel = getCurrentFYLabel()

    const [
      metricsRes,
      highlightsRes,
      boardRes,
      storiesRes,
      projectsRes,
      mediaRes,
      reportRes,
    ] = await Promise.all([
      supabase.from('service_metrics').select('id', { count: 'exact', head: true }).eq('fiscal_year', fyLabel),
      supabase.from('report_highlights').select('id', { count: 'exact', head: true }),
      supabase.from('board_members').select('id', { count: 'exact', head: true }),
      supabase.from('annual_report_stories').select('id', { count: 'exact', head: true }),
      supabase.from('projects').select('id', { count: 'exact', head: true }),
      supabase.from('media_files').select('id', { count: 'exact', head: true }).contains('tags', ['annual-report']),
      supabase.from('annual_reports').select('id').eq('fiscal_year', fyLabel).limit(1).single(),
    ])

    const sections = [
      { key: 'services', label: 'Services', count: metricsRes.count ?? 0, href: '/picc/annual-report-data#services' },
      { key: 'financials', label: 'Financials', count: null, href: '/picc/annual-report-data#financials' },
      { key: 'highlights', label: 'Highlights', count: highlightsRes.count ?? 0, href: '/picc/annual-report-data#highlights' },
      { key: 'stories', label: 'Stories', count: storiesRes.count ?? 0, href: '/picc/annual-report-data#stories' },
      { key: 'board', label: 'Board', count: boardRes.count ?? 0, href: '/picc/annual-report-data#board' },
      { key: 'photos', label: 'Photos', count: mediaRes.count ?? 0, href: '/picc/annual-report-data#photos' },
      { key: 'projects', label: 'Projects', count: projectsRes.count ?? 0, href: '/picc/annual-report-data#projects' },
    ]

    return NextResponse.json({
      sections,
      fiscal_year: fyLabel,
      report_id: reportRes.data?.id || null,
    })
  } catch (error: any) {
    console.error('Progress API error:', error)
    return NextResponse.json({ error: error.message }, { status: 500 })
  }
}
