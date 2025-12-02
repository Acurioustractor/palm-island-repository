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

// GET - List content pending validation
export async function GET(request: NextRequest) {
  try {
    const supabase = getSupabase()
    const { searchParams } = new URL(request.url)
    const status = searchParams.get('status') || 'pending' // pending, validated, all
    const limit = parseInt(searchParams.get('limit') || '20')

    let query = supabase
      .from('scraped_content')
      .select(`
        *,
        source:scrape_sources(id, name, source_type, url),
        chunks:content_chunks(id, chunk_text, is_quotable)
      `)
      .order('scraped_at', { ascending: false })
      .limit(limit)

    if (status === 'pending') {
      query = query.eq('is_validated', false)
    } else if (status === 'validated') {
      query = query.eq('is_validated', true)
    }

    const { data, error } = await query

    if (error) {
      return NextResponse.json({ error: error.message }, { status: 500 })
    }

    return NextResponse.json(data)
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 })
  }
}

// POST - Validate content
export async function POST(request: NextRequest) {
  try {
    const supabase = getSupabase()
    const body = await request.json()
    const {
      content_id,
      is_validated,
      is_featured,
      quality_score,
      validation_notes,
      quotable_chunks // Array of chunk IDs that are quotable
    } = body

    if (!content_id) {
      return NextResponse.json({ error: 'content_id is required' }, { status: 400 })
    }

    // Update content validation status
    const { data: content, error: contentError } = await supabase
      .from('scraped_content')
      .update({
        is_validated: is_validated !== false,
        is_featured: is_featured || false,
        quality_score: quality_score || null,
        validation_notes: validation_notes || null,
        validated_at: new Date().toISOString()
      })
      .eq('id', content_id)
      .select()
      .single()

    if (contentError) {
      return NextResponse.json({ error: contentError.message }, { status: 500 })
    }

    // Update quotable chunks if provided
    if (quotable_chunks && Array.isArray(quotable_chunks)) {
      // First, set all chunks for this content to not quotable
      await supabase
        .from('content_chunks')
        .update({ is_quotable: false, is_validated: is_validated !== false })
        .eq('content_id', content_id)

      // Then mark selected chunks as quotable
      if (quotable_chunks.length > 0) {
        await supabase
          .from('content_chunks')
          .update({ is_quotable: true })
          .in('id', quotable_chunks)
      }
    }

    return NextResponse.json({
      success: true,
      content,
      message: is_validated ? 'Content validated and approved' : 'Content rejected'
    })
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 })
  }
}
