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
    const fy = searchParams.get('fy')

    if (!fy) {
      return NextResponse.json({ error: 'fiscal year (fy) required' }, { status: 400 })
    }

    // Convert fiscal year label (e.g. "2024-25") to report_year integer (2025)
    // Also handle plain integers like "2025"
    const reportYear = fy.includes('-')
      ? parseInt(fy.split('-')[0]) + 1
      : parseInt(fy)

    // Get report for this fiscal year
    const { data: report } = await supabase
      .from('annual_reports')
      .select('id')
      .eq('report_year', reportYear)
      .limit(1)
      .maybeSingle()

    if (!report) {
      return NextResponse.json({ highlights: [], leadership_messages: [], fiscal_year: fy })
    }

    // Get highlights
    const { data: highlights, error: hlError } = await supabase
      .from('report_highlights')
      .select('*')
      .eq('report_id', report.id)
      .order('display_order')

    if (hlError) throw hlError

    // Get leadership messages
    const { data: leadership, error: ldError } = await supabase
      .from('leadership')
      .select('*')
      .eq('is_active', true)
      .order('position_order')

    if (ldError) throw ldError

    return NextResponse.json({
      report_id: report.id,
      fiscal_year: fy,
      highlights: highlights || [],
      leadership_messages: leadership || [],
    })
  } catch (error: any) {
    console.error('Highlights GET error:', error)
    return NextResponse.json({ error: error.message }, { status: 500 })
  }
}

export async function POST(request: NextRequest) {
  try {
    const supabase = getSupabase()
    const body = await request.json()

    if (body.type === 'highlight') {
      const { report_id, title, subtitle, description, impact_achieved, metrics, highlight_type, is_featured, display_order } = body

      if (!report_id || !title) {
        return NextResponse.json({ error: 'report_id and title required' }, { status: 400 })
      }

      const { data, error } = await supabase
        .from('report_highlights')
        .upsert(
          {
            id: body.id || undefined,
            report_id,
            title,
            subtitle: subtitle ?? null,
            description: description ?? null,
            impact_achieved: impact_achieved ?? null,
            metrics: metrics ?? {},
            highlight_type: highlight_type ?? null,
            is_featured: is_featured ?? false,
            display_order: display_order ?? 0,
          },
          { onConflict: 'id' }
        )
        .select()
        .single()

      if (error) throw error
      return NextResponse.json({ highlight: data })
    }

    if (body.type === 'leadership_message') {
      const { id, message_title, message_content, message_excerpt, featured_quote } = body

      if (!id) {
        return NextResponse.json({ error: 'leadership id required' }, { status: 400 })
      }

      const { data, error } = await supabase
        .from('leadership')
        .update({
          message_title: message_title ?? null,
          message_content: message_content ?? null,
          message_excerpt: message_excerpt ?? null,
          featured_quote: featured_quote ?? null,
        })
        .eq('id', id)
        .select()
        .single()

      if (error) throw error
      return NextResponse.json({ leadership: data })
    }

    return NextResponse.json({ error: 'type must be "highlight" or "leadership_message"' }, { status: 400 })
  } catch (error: any) {
    console.error('Highlights POST error:', error)
    return NextResponse.json({ error: error.message }, { status: 500 })
  }
}

export async function DELETE(request: NextRequest) {
  try {
    const supabase = getSupabase()
    const { searchParams } = new URL(request.url)
    const id = searchParams.get('id')

    if (!id) {
      return NextResponse.json({ error: 'id required' }, { status: 400 })
    }

    const { error } = await supabase
      .from('report_highlights')
      .delete()
      .eq('id', id)

    if (error) throw error

    return NextResponse.json({ success: true })
  } catch (error: any) {
    console.error('Highlights DELETE error:', error)
    return NextResponse.json({ error: error.message }, { status: 500 })
  }
}
