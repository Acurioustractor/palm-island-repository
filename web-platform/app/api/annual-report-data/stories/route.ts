import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@supabase/supabase-js'

function getSupabase() {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL
  const key = process.env.SUPABASE_SERVICE_ROLE_KEY
  if (!url || !key) throw new Error('Missing Supabase credentials')
  return createClient(url, key, { auth: { autoRefreshToken: false, persistSession: false } })
}

export async function GET(request: NextRequest) {
  try {
    const supabase = getSupabase()
    const { searchParams } = new URL(request.url)
    const reportId = searchParams.get('report_id')
    const all = searchParams.get('all') === 'true'

    if (!reportId && !all) {
      return NextResponse.json({ error: 'report_id or all=true required' }, { status: 400 })
    }

    // Build query — either for one report or all reports
    let query = supabase
      .from('annual_report_stories')
      .select(`
        id,
        report_id,
        story_id,
        is_featured,
        section_placement,
        display_order,
        stories (
          id,
          title,
          storyteller_id,
          category,
          quality_score,
          quote_text,
          featured_image_url,
          status
        ),
        annual_reports (
          report_year,
          title
        )
      `)
      .order('display_order')

    if (reportId && !all) {
      query = query.eq('report_id', reportId)
    }

    const { data: linked, error: linkError } = await query
    if (linkError) throw linkError

    // Get report year mapping for grouping
    const reportYears: Record<string, number> = {}
    ;(linked || []).forEach((l: any) => {
      if (l.annual_reports?.report_year) {
        reportYears[l.report_id] = l.annual_reports.report_year
      }
    })

    return NextResponse.json({
      stories: (linked || []).map((l: any) => ({
        link_id: l.id,
        report_id: l.report_id,
        story_id: l.story_id,
        is_featured: l.is_featured,
        section_placement: l.section_placement,
        display_order: l.display_order,
        title: l.stories?.title || 'Untitled',
        storyteller_name: l.stories?.storyteller_id || null,
        category: l.stories?.category || null,
        quality_score: l.stories?.quality_score || null,
        featured_quote: l.stories?.quote_text || null,
        hero_image_url: l.stories?.featured_image_url || null,
        status: l.stories?.status || null,
        report_year: reportYears[l.report_id] || null,
      })),
      report_years: reportYears,
    })
  } catch (error: any) {
    console.error('Stories GET error:', error)
    return NextResponse.json({ error: error.message }, { status: 500 })
  }
}

export async function POST(request: NextRequest) {
  try {
    const supabase = getSupabase()
    const body = await request.json()

    if (body.action === 'link') {
      const { report_id, story_id, section_placement } = body
      if (!report_id || !story_id) {
        return NextResponse.json({ error: 'report_id and story_id required' }, { status: 400 })
      }

      const { data, error } = await supabase
        .from('annual_report_stories')
        .upsert(
          {
            report_id,
            story_id,
            section_placement: section_placement ?? null,
            is_featured: body.is_featured ?? false,
            display_order: body.display_order ?? 0,
          },
          { onConflict: 'report_id,story_id' }
        )
        .select()
        .single()

      if (error) throw error
      return NextResponse.json({ link: data })
    }

    if (body.action === 'unlink') {
      const { report_id, story_id } = body
      if (!report_id || !story_id) {
        return NextResponse.json({ error: 'report_id and story_id required' }, { status: 400 })
      }

      const { error } = await supabase
        .from('annual_report_stories')
        .delete()
        .eq('report_id', report_id)
        .eq('story_id', story_id)

      if (error) throw error
      return NextResponse.json({ success: true })
    }

    return NextResponse.json({ error: 'action must be "link" or "unlink"' }, { status: 400 })
  } catch (error: any) {
    console.error('Stories POST error:', error)
    return NextResponse.json({ error: error.message }, { status: 500 })
  }
}

export async function PATCH(request: NextRequest) {
  try {
    const supabase = getSupabase()
    const body = await request.json()
    const { link_id, ...updates } = body

    if (!link_id) {
      return NextResponse.json({ error: 'link_id required' }, { status: 400 })
    }

    const allowed: Record<string, any> = {}
    if ('is_featured' in updates) allowed.is_featured = updates.is_featured
    if ('section_placement' in updates) allowed.section_placement = updates.section_placement
    if ('display_order' in updates) allowed.display_order = updates.display_order

    const { data, error } = await supabase
      .from('annual_report_stories')
      .update(allowed)
      .eq('id', link_id)
      .select()
      .single()

    if (error) throw error
    return NextResponse.json({ link: data })
  } catch (error: any) {
    console.error('Stories PATCH error:', error)
    return NextResponse.json({ error: error.message }, { status: 500 })
  }
}
