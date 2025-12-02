import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@supabase/supabase-js'

export async function GET(request: NextRequest) {
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
  const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY

  if (!supabaseUrl || !supabaseServiceKey) {
    return NextResponse.json({ error: 'Missing Supabase credentials' }, { status: 500 })
  }

  const supabase = createClient(supabaseUrl, supabaseServiceKey, {
    auth: { autoRefreshToken: false, persistSession: false }
  })

  try {
    const { searchParams } = new URL(request.url)
    const status = searchParams.get('status')

    let query = supabase
      .from('annual_reports')
      .select(`
        id,
        title,
        subtitle,
        report_year,
        reporting_period_start,
        reporting_period_end,
        status,
        theme,
        template_name,
        executive_summary,
        statistics,
        metadata,
        created_at,
        updated_at,
        organizations (
          id,
          name,
          short_name
        )
      `)
      .order('report_year', { ascending: false })

    if (status && status !== 'all') {
      query = query.eq('status', status)
    }

    const { data, error } = await query

    if (error) {
      console.error('Annual reports query error:', error)
      return NextResponse.json({ error: error.message }, { status: 500 })
    }

    return NextResponse.json({ reports: data || [], count: data?.length || 0 })
  } catch (error: any) {
    console.error('Annual reports API error:', error)
    return NextResponse.json({ error: error.message }, { status: 500 })
  }
}

export async function POST(request: NextRequest) {
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
  const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY

  if (!supabaseUrl || !supabaseServiceKey) {
    return NextResponse.json({ error: 'Missing Supabase credentials' }, { status: 500 })
  }

  const supabase = createClient(supabaseUrl, supabaseServiceKey, {
    auth: { autoRefreshToken: false, persistSession: false }
  })

  try {
    const body = await request.json()

    // Get or create PICC organization
    const { data: orgs } = await supabase
      .from('organizations')
      .select('id')
      .eq('short_name', 'PICC')
      .limit(1)

    let organizationId = orgs?.[0]?.id

    if (!organizationId) {
      const { data: newOrg } = await supabase
        .from('organizations')
        .insert({
          name: 'Palm Island Community Company',
          short_name: 'PICC',
          organization_type: 'community_organization'
        })
        .select('id')
        .single()

      organizationId = newOrg?.id || '00000000-0000-0000-0000-000000000000'
    }

    const reportData = {
      organization_id: organizationId,
      report_year: body.report_year,
      reporting_period_start: body.reporting_period_start,
      reporting_period_end: body.reporting_period_end,
      title: body.title,
      subtitle: body.subtitle,
      theme: body.theme,
      status: body.status || 'drafting',
      template_name: body.template_name || 'traditional',
      executive_summary: body.executive_summary,
      statistics: body.statistics,
      year_highlights: body.year_highlights,
      metadata: body.metadata
    }

    // Try insert, fallback to update if exists
    const { data: report, error: reportError } = await supabase
      .from('annual_reports')
      .insert(reportData)
      .select()
      .single()

    if (reportError) {
      if (reportError.code === '23505') {
        // Unique constraint - update existing
        const { data: existing } = await supabase
          .from('annual_reports')
          .select('id')
          .eq('organization_id', organizationId)
          .eq('report_year', body.report_year)
          .single()

        if (existing) {
          const { data: updated, error: updateError } = await supabase
            .from('annual_reports')
            .update(reportData)
            .eq('id', existing.id)
            .select()
            .single()

          if (updateError) throw updateError
          return NextResponse.json({ report: updated, updated: true })
        }
      }
      throw reportError
    }

    // Link stories if provided
    if (body.story_ids && body.story_ids.length > 0 && report) {
      const storyLinks = body.story_ids.map((storyId: string, index: number) => ({
        report_id: report.id,
        story_id: storyId,
        display_order: index,
        is_featured: index < 3,
        inclusion_reason: index < 3 ? 'featured' : 'auto_selected',
        section_placement: 'community_stories'
      }))

      await supabase.from('annual_report_stories').insert(storyLinks)
    }

    // Create report sections if provided
    if (body.sections && body.sections.length > 0 && report) {
      const sections = body.sections.map((section: any, index: number) => ({
        report_id: report.id,
        section_type: section.type,
        section_title: section.title,
        section_content: section.content,
        display_order: index
      }))

      await supabase.from('report_sections').insert(sections)
    }

    return NextResponse.json({ report, created: true })
  } catch (error: any) {
    console.error('Create report error:', error)
    return NextResponse.json({ error: error.message }, { status: 500 })
  }
}

export async function DELETE(request: NextRequest) {
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
  const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY

  if (!supabaseUrl || !supabaseServiceKey) {
    return NextResponse.json({ error: 'Missing Supabase credentials' }, { status: 500 })
  }

  const supabase = createClient(supabaseUrl, supabaseServiceKey, {
    auth: { autoRefreshToken: false, persistSession: false }
  })

  try {
    const { searchParams } = new URL(request.url)
    const reportId = searchParams.get('id')

    if (!reportId) {
      return NextResponse.json({ error: 'Report ID required' }, { status: 400 })
    }

    // Delete linked stories first
    await supabase.from('annual_report_stories').delete().eq('report_id', reportId)

    // Delete sections
    await supabase.from('report_sections').delete().eq('report_id', reportId)

    // Delete the report
    const { error } = await supabase.from('annual_reports').delete().eq('id', reportId)

    if (error) throw error

    return NextResponse.json({ success: true })
  } catch (error: any) {
    console.error('Delete report error:', error)
    return NextResponse.json({ error: error.message }, { status: 500 })
  }
}
