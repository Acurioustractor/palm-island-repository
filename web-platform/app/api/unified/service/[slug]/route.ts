import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@supabase/supabase-js'

function getSupabase() {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL
  const key = process.env.SUPABASE_SERVICE_ROLE_KEY
  if (!url || !key) throw new Error('Missing Supabase credentials')
  return createClient(url, key, { auth: { autoRefreshToken: false, persistSession: false } })
}

/**
 * GET /api/unified/service/[slug]
 *
 * Returns everything about a service in one call:
 * service details, metrics, related stories, quotes, media, achievements
 */
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ slug: string }> }
) {
  try {
    const { slug } = await params
    const supabase = getSupabase()

    // 1. Get the service
    const { data: service, error: serviceError } = await supabase
      .from('organization_services')
      .select('*')
      .eq('slug', slug)
      .single()

    if (serviceError || !service) {
      return NextResponse.json({ error: 'Service not found' }, { status: 404 })
    }

    // 2. Parallel fetch related data
    const [metricsResult, storiesResult, mediaResult, achievementsResult] = await Promise.all([
      // Service metrics
      supabase
        .from('service_metrics')
        .select('*')
        .eq('service_id', service.id)
        .order('fiscal_year', { ascending: false })
        .limit(5),

      // Related stories (by category match or service tag)
      supabase
        .from('stories')
        .select('id, title, summary, category, fiscal_year, featured_image_url, status, profiles:storyteller_id(full_name)')
        .or(`category.ilike.%${service.service_category}%,tags.cs.{${slug}}`)
        .eq('status', 'published')
        .order('created_at', { ascending: false })
        .limit(10),

      // Related media
      supabase
        .from('media_files')
        .select('id, title, caption, public_url, file_type, tags, page_context')
        .or(`page_context.ilike.%${slug}%,tags.cs.{${slug}},tags.cs.{${service.service_category}}`)
        .is('deleted_at', null)
        .limit(20),

      // Governance achievements matching service category
      supabase
        .from('governance_achievements')
        .select('title, description, year, category')
        .ilike('category', `%${service.service_category}%`)
        .order('year', { ascending: false })
        .limit(5)
    ])

    // 3. Get quotes from related stories
    const storyIds = (storiesResult.data || []).map((s: any) => s.id)
    let quotes: any[] = []
    if (storyIds.length > 0) {
      const { data: storyQuotes } = await supabase
        .from('extracted_quotes')
        .select('id, quote_text, speaker_name, theme, sentiment')
        .in('story_id', storyIds)
        .limit(10)
      quotes = storyQuotes || []
    }

    // Also check elder_quotes that match the service theme
    const { data: elderQuotes } = await supabase
      .from('elder_quotes')
      .select('id, quote_text, speaker_name, context, theme')
      .or(`theme.ilike.%${service.service_category}%,context.ilike.%${service.name}%`)
      .limit(5)

    return NextResponse.json({
      service,
      metrics: metricsResult.data || [],
      stories: storiesResult.data || [],
      quotes: [...quotes, ...(elderQuotes || [])],
      media: mediaResult.data || [],
      achievements: achievementsResult.data || [],
      counts: {
        metrics: metricsResult.data?.length || 0,
        stories: storiesResult.data?.length || 0,
        quotes: quotes.length + (elderQuotes?.length || 0),
        media: mediaResult.data?.length || 0,
        achievements: achievementsResult.data?.length || 0
      }
    })
  } catch (error: any) {
    console.error('Unified service error:', error)
    return NextResponse.json({ error: error.message }, { status: 500 })
  }
}
