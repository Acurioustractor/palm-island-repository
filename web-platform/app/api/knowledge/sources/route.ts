import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@supabase/supabase-js'
import type { CreateResearchSourceInput } from '@/lib/knowledge-base/types'

// GET - List research sources
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

    const source_type = searchParams.get('source_type')
    const is_verified = searchParams.get('is_verified')
    const limit = parseInt(searchParams.get('limit') || '50')
    const offset = parseInt(searchParams.get('offset') || '0')

    let query = supabase
      .from('research_sources')
      .select('*')
      .order('created_at', { ascending: false })

    if (source_type) {
      query = query.eq('source_type', source_type)
    }

    if (is_verified === 'true') {
      query = query.eq('is_verified', true)
    }

    query = query.range(offset, offset + limit - 1)

    const { data: sources, error } = await query

    if (error) {
      return NextResponse.json({ error: error.message }, { status: 500 })
    }

    return NextResponse.json({ sources })

  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 })
  }
}

// POST - Create research source
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
    const body: CreateResearchSourceInput = await request.json()

    if (!body.source_type || !body.title) {
      return NextResponse.json({
        error: 'Missing required fields: source_type, title'
      }, { status: 400 })
    }

    const { data: source, error } = await supabase
      .from('research_sources')
      .insert({
        source_type: body.source_type,
        title: body.title,
        description: body.description,
        author: body.author,
        publisher: body.publisher,
        publication_date: body.publication_date,
        url: body.url,
        citation_text: body.citation_text,
        reliability_score: body.reliability_score,
        is_primary_source: body.is_primary_source || false,
        extracted_text: body.extracted_text,
        extracted_data: body.extracted_data,
        accessed_at: new Date().toISOString()
      })
      .select()
      .single()

    if (error) {
      return NextResponse.json({ error: error.message }, { status: 500 })
    }

    return NextResponse.json({ source, created: true })

  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 })
  }
}
