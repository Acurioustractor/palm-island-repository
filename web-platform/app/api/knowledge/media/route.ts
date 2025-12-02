import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@supabase/supabase-js'
import type { CreateKnowledgeMediaInput } from '@/lib/knowledge-base/types'

// GET - List media files with filtering
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

    const media_type = searchParams.get('media_type')
    const knowledge_entry_id = searchParams.get('knowledge_entry_id')
    const has_transcript = searchParams.get('has_transcript')
    const limit = parseInt(searchParams.get('limit') || '50')
    const offset = parseInt(searchParams.get('offset') || '0')

    let query = supabase
      .from('knowledge_media')
      .select(`
        *,
        knowledge_entry:knowledge_entries(id, slug, title, entry_type)
      `)
      .order('created_at', { ascending: false })

    // Filter by media type
    if (media_type) {
      query = query.eq('media_type', media_type)
    }

    // Filter by knowledge entry
    if (knowledge_entry_id) {
      query = query.eq('knowledge_entry_id', knowledge_entry_id)
    }

    // Filter by whether media has transcript
    if (has_transcript === 'true') {
      query = query.not('transcript', 'is', null)
    }

    query = query.range(offset, offset + limit - 1)

    const { data: media, error } = await query

    if (error) {
      return NextResponse.json({ error: error.message }, { status: 500 })
    }

    // Group by media type for summary
    const byType: Record<string, number> = {}
    if (media) {
      for (const item of media) {
        const type = item.media_type || 'unknown'
        byType[type] = (byType[type] || 0) + 1
      }
    }

    return NextResponse.json({
      media,
      summary: {
        total: media?.length || 0,
        by_type: byType
      }
    })

  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 })
  }
}

// POST - Create media record
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
    const body: CreateKnowledgeMediaInput = await request.json()

    if (!body.media_type || !body.storage_path) {
      return NextResponse.json({
        error: 'Missing required fields: media_type, storage_path'
      }, { status: 400 })
    }

    const { data: mediaRecord, error } = await supabase
      .from('knowledge_media')
      .insert({
        knowledge_entry_id: body.knowledge_entry_id,
        media_type: body.media_type,
        storage_path: body.storage_path,
        original_filename: body.original_filename,
        file_size: body.file_size,
        mime_type: body.mime_type,
        duration_seconds: body.duration_seconds,
        width: body.width,
        height: body.height,
        thumbnail_path: body.thumbnail_path,
        transcript: body.transcript,
        alt_text: body.alt_text,
        caption: body.caption,
        credits: body.credits,
        captured_date: body.captured_date,
        captured_location: body.captured_location,
        metadata: body.metadata
      })
      .select(`
        *,
        knowledge_entry:knowledge_entries(id, slug, title, entry_type)
      `)
      .single()

    if (error) {
      return NextResponse.json({ error: error.message }, { status: 500 })
    }

    return NextResponse.json({ media: mediaRecord, created: true })

  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 })
  }
}

// PUT - Update media record (add transcript, etc.)
export async function PUT(request: NextRequest) {
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
    const { id, ...updates } = body

    if (!id) {
      return NextResponse.json({ error: 'Media ID is required' }, { status: 400 })
    }

    // Only allow updating specific fields
    const allowedUpdates: Record<string, any> = {}
    const allowedFields = [
      'transcript', 'alt_text', 'caption', 'credits',
      'thumbnail_path', 'captured_date', 'captured_location', 'metadata'
    ]

    for (const field of allowedFields) {
      if (field in updates) {
        allowedUpdates[field] = updates[field]
      }
    }

    if (Object.keys(allowedUpdates).length === 0) {
      return NextResponse.json({
        error: 'No valid fields to update'
      }, { status: 400 })
    }

    allowedUpdates.updated_at = new Date().toISOString()

    const { data: mediaRecord, error } = await supabase
      .from('knowledge_media')
      .update(allowedUpdates)
      .eq('id', id)
      .select(`
        *,
        knowledge_entry:knowledge_entries(id, slug, title, entry_type)
      `)
      .single()

    if (error) {
      return NextResponse.json({ error: error.message }, { status: 500 })
    }

    return NextResponse.json({ media: mediaRecord, updated: true })

  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 })
  }
}
