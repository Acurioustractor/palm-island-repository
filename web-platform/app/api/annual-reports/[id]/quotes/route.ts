import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@supabase/supabase-js'

function getSupabase() {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL
  const key = process.env.SUPABASE_SERVICE_ROLE_KEY

  if (!url || !key) {
    throw new Error('Missing Supabase credentials')
  }

  return createClient(url, key, {
    auth: { autoRefreshToken: false, persistSession: false }
  })
}

// GET - Get quotes for an annual report
export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const supabase = getSupabase()
    const reportId = params.id

    // Get quotes already assigned to this report
    const { data: assignedQuotes, error: assignedError } = await supabase
      .from('extracted_quotes')
      .select('*')
      .eq('used_in_report_id', reportId)
      .order('display_order')

    // Get validated quotes available for reports
    const { data: availableQuotes, error: availableError } = await supabase
      .from('extracted_quotes')
      .select('*')
      .eq('is_validated', true)
      .eq('suggested_for_report', true)
      .is('used_in_report_id', null)
      .order('created_at', { ascending: false })

    if (assignedError || availableError) {
      return NextResponse.json({
        error: assignedError?.message || availableError?.message
      }, { status: 500 })
    }

    return NextResponse.json({
      assigned: assignedQuotes || [],
      available: availableQuotes || []
    })
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 })
  }
}

// POST - Assign quotes to an annual report section
export async function POST(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const supabase = getSupabase()
    const reportId = params.id
    const body = await request.json()
    const { quote_ids, section_type } = body

    if (!quote_ids || !Array.isArray(quote_ids)) {
      return NextResponse.json({ error: 'quote_ids array is required' }, { status: 400 })
    }

    // Assign quotes to this report
    const results = []
    for (let i = 0; i < quote_ids.length; i++) {
      const { data, error } = await supabase
        .from('extracted_quotes')
        .update({
          used_in_report_id: reportId,
          display_order: i + 1
        })
        .eq('id', quote_ids[i])
        .select()
        .single()

      if (!error && data) {
        results.push(data)
      }
    }

    return NextResponse.json({
      success: true,
      assigned_count: results.length,
      quotes: results
    })
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 })
  }
}

// DELETE - Remove quote from report
export async function DELETE(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const supabase = getSupabase()
    const { searchParams } = new URL(request.url)
    const quoteId = searchParams.get('quote_id')

    if (!quoteId) {
      return NextResponse.json({ error: 'quote_id is required' }, { status: 400 })
    }

    const { error } = await supabase
      .from('extracted_quotes')
      .update({
        used_in_report_id: null,
        display_order: null
      })
      .eq('id', quoteId)

    if (error) {
      return NextResponse.json({ error: error.message }, { status: 500 })
    }

    return NextResponse.json({ success: true })
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 })
  }
}
