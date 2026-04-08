import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@supabase/supabase-js'
import { createRouteHandlerClient } from '@/lib/supabase/server'
import { scoreAndRankStories } from '@/lib/auto-link/score-stories'

/**
 * One-click API to auto-link stories to an annual report
 *
 * Query params:
 * - reportId: The ID of the annual report
 * - fiscalYear: Optional fiscal year (defaults to current)
 *
 * This is a simplified wrapper around the populate endpoint
 * that focuses just on story linking.
 */

export async function POST(request: NextRequest) {
  // Auth: require login in production
  const isDev = process.env.NODE_ENV === 'development'
  if (!isDev) {
    const supabaseAuth = await createRouteHandlerClient()
    const { data: { user } } = await supabaseAuth.auth.getUser()
    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }
  }

  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
  const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY

  if (!supabaseUrl || !supabaseServiceKey) {
    return NextResponse.json({ error: 'Missing Supabase credentials' }, { status: 500 })
  }

  const supabase = createClient(supabaseUrl, supabaseServiceKey, {
    auth: { autoRefreshToken: false, persistSession: false }
  })

  try {
    const body = await request.json().catch(() => ({}))
    const { reportId, fiscalYear } = body

    if (!reportId) {
      return NextResponse.json({ error: 'Report ID is required' }, { status: 400 })
    }

    // Get the report
    const { data: report, error: reportError } = await supabase
      .from('annual_reports')
      .select('id, title, report_year, fiscal_year')
      .eq('id', reportId)
      .single()

    if (reportError || !report) {
      return NextResponse.json({ error: 'Report not found' }, { status: 404 })
    }

    const reportYear = Number(report.report_year)
    const fy = fiscalYear || report.fiscal_year || `${reportYear - 1}-${reportYear.toString().slice(-2)}`
    
    // Calculate date range for FY
    const startYear = parseInt(fy.split('-')[0])
    const periodStart = `${startYear}-07-01`
    const periodEnd = `${startYear + 1}-06-30`

    // Clear existing story links
    await supabase
      .from('annual_report_stories')
      .delete()
      .eq('report_id', reportId)

    // Get candidate stories for this reporting period
    const { data: candidates, error: storiesError } = await supabase
      .from('stories')
      .select(`
        id,
        title,
        category,
        quality_score,
        total_score,
        views,
        shares,
        likes,
        is_featured,
        is_verified,
        contains_traditional_knowledge,
        elder_approval_given,
        created_at,
        auto_include,
        report_worthy,
        tags
      `)
      .eq('status', 'published')
      .gte('created_at', periodStart)
      .lte('created_at', `${periodEnd}T23:59:59.999Z`)
      .order('total_score', { ascending: false })
      .limit(100)

    if (storiesError) {
      return NextResponse.json({ error: storiesError.message }, { status: 500 })
    }

    // Score and rank stories (pure logic extracted to lib/auto-link/score-stories.ts)
    const finalStories = scoreAndRankStories(candidates || [])

    // Link stories to report
    if (finalStories.length > 0) {
      const storyLinks = finalStories.map((item: any, index: number) => ({
        report_id: reportId,
        story_id: item.story.id,
        display_order: index + 1,
        is_featured: index < 5,
        inclusion_reason: item.story.auto_include ? 'auto_include' :
                         item.story.report_worthy ? 'report_worthy' : 'auto_selected',
        section_placement: 'community_stories'
      }))

      const { error: linkError } = await supabase
        .from('annual_report_stories')
        .insert(storyLinks)

      if (linkError) {
        return NextResponse.json({ error: linkError.message }, { status: 500 })
      }
    }

    // Also auto-tag media from selected stories
    if (finalStories.length > 0) {
      const storyIds = finalStories.map((s: any) => s.story.id)
      
      // Get media for these stories
      const { data: media } = await supabase
        .from('media_files')
        .select('id, tags')
        .in('story_id', storyIds)
        .eq('is_public', true)
        .is('deleted_at', null)

      // Add annual-report and fy tags
      if (media && media.length > 0) {
        const updates = media.map((m: any) => {
          const existingTags = Array.isArray(m.tags) ? m.tags : []
          const allTags = [...existingTags, 'annual-report', `fy:${fy}`]
          const uniqueTags = allTags.filter((tag, index, arr) => arr.indexOf(tag) === index)
          return {
            id: m.id,
            tags: uniqueTags
          }
        })

        await supabase.from('media_files').upsert(updates, { onConflict: 'id' })
      }
    }

    return NextResponse.json({
      success: true,
      fiscalYear: fy,
      storiesLinked: finalStories.length,
      reportTitle: report.title,
      message: `Auto-linked ${finalStories.length} stories to ${report.title}`
    })

  } catch (error: any) {
    console.error('Auto-link error:', error)
    return NextResponse.json({ error: error.message }, { status: 500 })
  }
}
