import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@supabase/supabase-js'

export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
  const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY

  if (!supabaseUrl || !supabaseServiceKey) {
    return NextResponse.json({ error: 'Missing Supabase credentials' }, { status: 500 })
  }

  const supabase = createClient(supabaseUrl, supabaseServiceKey, {
    auth: { autoRefreshToken: false, persistSession: false }
  })

  try {
    const { id } = params

    if (!id) {
      return NextResponse.json({ error: 'Report ID required' }, { status: 400 })
    }

    // Load the report with organization
    const { data: report, error: reportError } = await supabase
      .from('annual_reports')
      .select(`
        *,
        organizations (
          id,
          name,
          short_name
        )
      `)
      .eq('id', id)
      .single()

    if (reportError) {
      console.error('Report query error:', reportError)
      return NextResponse.json({ error: reportError.message }, { status: 404 })
    }

    // Load linked stories with storyteller profiles
    const { data: stories, error: storiesError } = await supabase
      .from('annual_report_stories')
      .select(`
        id,
        display_order,
        is_featured,
        custom_excerpt,
        inclusion_reason,
        section_placement,
        stories (
          id,
          title,
          content,
          category,
          created_at,
          storyteller_id
        )
      `)
      .eq('report_id', id)
      .order('display_order', { ascending: true })

    if (storiesError) {
      console.warn('Stories query error:', storiesError)
    }

    // Enrich stories with storyteller profiles
    let enrichedStories = stories || []
    if (enrichedStories.length > 0) {
      const storytellerIds = enrichedStories
        .map((s: any) => s.stories?.storyteller_id)
        .filter(Boolean)

      if (storytellerIds.length > 0) {
        const { data: profiles } = await supabase
          .from('profiles')
          .select('id, full_name')
          .in('id', storytellerIds)

        const profileMap = new Map(profiles?.map((p: any) => [p.id, p]) || [])

        enrichedStories = enrichedStories.map((s: any) => ({
          ...s,
          stories: {
            ...s.stories,
            profiles: s.stories?.storyteller_id
              ? profileMap.get(s.stories.storyteller_id) || null
              : null
          }
        }))
      }
    }

    // Load report sections
    const { data: sections, error: sectionsError } = await supabase
      .from('report_sections')
      .select('*')
      .eq('report_id', id)
      .order('display_order', { ascending: true })

    if (sectionsError) {
      console.warn('Sections query error:', sectionsError)
    }

    return NextResponse.json({
      report,
      stories: enrichedStories,
      sections: sections || []
    })
  } catch (error: any) {
    console.error('Get report error:', error)
    return NextResponse.json({ error: error.message }, { status: 500 })
  }
}

// Update a report
export async function PUT(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
  const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY

  if (!supabaseUrl || !supabaseServiceKey) {
    return NextResponse.json({ error: 'Missing Supabase credentials' }, { status: 500 })
  }

  const supabase = createClient(supabaseUrl, supabaseServiceKey, {
    auth: { autoRefreshToken: false, persistSession: false }
  })

  try {
    const { id } = params
    const body = await request.json()

    if (!id) {
      return NextResponse.json({ error: 'Report ID required' }, { status: 400 })
    }

    const updateData: any = {}

    // Only include fields that are provided
    if (body.title !== undefined) updateData.title = body.title
    if (body.subtitle !== undefined) updateData.subtitle = body.subtitle
    if (body.theme !== undefined) updateData.theme = body.theme
    if (body.status !== undefined) updateData.status = body.status
    if (body.executive_summary !== undefined) updateData.executive_summary = body.executive_summary
    if (body.year_highlights !== undefined) updateData.year_highlights = body.year_highlights
    if (body.statistics !== undefined) updateData.statistics = body.statistics
    if (body.metadata !== undefined) updateData.metadata = body.metadata
    if (body.template_name !== undefined) updateData.template_name = body.template_name

    const { data: report, error } = await supabase
      .from('annual_reports')
      .update(updateData)
      .eq('id', id)
      .select()
      .single()

    if (error) {
      console.error('Update report error:', error)
      return NextResponse.json({ error: error.message }, { status: 500 })
    }

    return NextResponse.json({ report, updated: true })
  } catch (error: any) {
    console.error('Update report error:', error)
    return NextResponse.json({ error: error.message }, { status: 500 })
  }
}

// Delete a report
export async function DELETE(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
  const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY

  if (!supabaseUrl || !supabaseServiceKey) {
    return NextResponse.json({ error: 'Missing Supabase credentials' }, { status: 500 })
  }

  const supabase = createClient(supabaseUrl, supabaseServiceKey, {
    auth: { autoRefreshToken: false, persistSession: false }
  })

  try {
    const { id } = params

    if (!id) {
      return NextResponse.json({ error: 'Report ID required' }, { status: 400 })
    }

    // Delete linked stories first
    await supabase
      .from('annual_report_stories')
      .delete()
      .eq('report_id', id)

    // Delete sections
    await supabase
      .from('report_sections')
      .delete()
      .eq('report_id', id)

    // Delete the report
    const { error } = await supabase
      .from('annual_reports')
      .delete()
      .eq('id', id)

    if (error) {
      console.error('Delete report error:', error)
      return NextResponse.json({ error: error.message }, { status: 500 })
    }

    return NextResponse.json({ success: true })
  } catch (error: any) {
    console.error('Delete report error:', error)
    return NextResponse.json({ error: error.message }, { status: 500 })
  }
}
