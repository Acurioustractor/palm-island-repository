import { NextResponse } from 'next/server'
import { createClient } from '@supabase/supabase-js'

export const runtime = 'nodejs'

function getServerClient() {
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
  const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY
  if (!supabaseUrl || !supabaseServiceKey) throw new Error('Missing Supabase credentials')
  return createClient(supabaseUrl, supabaseServiceKey, {
    auth: { autoRefreshToken: false, persistSession: false },
  })
}

export async function GET() {
  try {
    const supabase = getServerClient()

    // Count embeddings by type
    const { data: embeddings } = await supabase
      .from('content_embeddings')
      .select('content_type')

    const embeddingCounts: Record<string, number> = {}
    for (const row of embeddings || []) {
      const t = (row as any).content_type
      embeddingCounts[t] = (embeddingCounts[t] || 0) + 1
    }

    // Count source content for gap analysis
    const [stories, services, stats, knowledge] = await Promise.all([
      supabase.from('stories').select('id', { count: 'exact', head: true }).eq('is_public', true),
      supabase.from('organization_services').select('id', { count: 'exact', head: true }).eq('is_active', true),
      supabase.from('report_statistics').select('id', { count: 'exact', head: true }),
      supabase.from('knowledge_entries').select('id', { count: 'exact', head: true }),
    ])

    return NextResponse.json({
      embeddings: embeddingCounts,
      totalEmbeddings: Object.values(embeddingCounts).reduce((a, b) => a + b, 0),
      sources: {
        story: { total: stories.count || 0, embedded: embeddingCounts['story'] || 0 },
        service: { total: services.count || 0, embedded: embeddingCounts['service'] || 0 },
        annual_report: { total: stats.count || 0, embedded: embeddingCounts['annual_report'] || 0 },
        knowledge: { total: knowledge.count || 0, embedded: embeddingCounts['knowledge'] || 0 },
      },
    })
  } catch (error: any) {
    return NextResponse.json({ error: error?.message || 'Failed' }, { status: 500 })
  }
}
