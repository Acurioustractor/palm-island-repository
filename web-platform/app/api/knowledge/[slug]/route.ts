import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@supabase/supabase-js'

// GET - Get single knowledge entry with all related data
export async function GET(
  request: NextRequest,
  { params }: { params: { slug: string } }
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
    const { slug } = params

    // Get the entry
    const { data: entry, error: entryError } = await supabase
      .from('knowledge_entries')
      .select('*')
      .eq('slug', slug)
      .single()

    if (entryError || !entry) {
      return NextResponse.json({ error: 'Entry not found' }, { status: 404 })
    }

    // Get tags
    const { data: tags } = await supabase
      .from('knowledge_entry_tags')
      .select(`
        knowledge_tags (
          id,
          name,
          slug,
          tag_type,
          color
        )
      `)
      .eq('entry_id', entry.id)

    // Get sources with full source data
    const { data: sourceLinks } = await supabase
      .from('knowledge_source_links')
      .select(`
        id,
        page_numbers,
        section_reference,
        timestamp_start,
        timestamp_end,
        quote,
        relationship,
        notes,
        research_sources (
          id,
          source_type,
          title,
          author,
          publisher,
          publication_date,
          url,
          citation_text,
          reliability_score,
          is_primary_source
        )
      `)
      .eq('entry_id', entry.id)

    // Get media
    const { data: media } = await supabase
      .from('knowledge_media')
      .select('*')
      .eq('entry_id', entry.id)
      .order('created_at', { ascending: false })

    // Get related entries
    const { data: relationships } = await supabase
      .from('knowledge_relationships')
      .select(`
        id,
        relationship_type,
        description,
        strength,
        to_entry:knowledge_entries!to_entry_id (
          id,
          slug,
          title,
          entry_type,
          category,
          summary
        )
      `)
      .eq('from_entry_id', entry.id)

    // Get versions (most recent first)
    const { data: versions } = await supabase
      .from('knowledge_versions')
      .select('*')
      .eq('entry_id', entry.id)
      .order('version_number', { ascending: false })
      .limit(10)

    return NextResponse.json({
      entry,
      tags: tags?.map((t: any) => t.knowledge_tags).filter(Boolean) || [],
      sources: sourceLinks?.map((sl: any) => ({
        ...sl,
        source: sl.research_sources
      })) || [],
      media: media || [],
      relationships: relationships || [],
      versions: versions || []
    })

  } catch (error: any) {
    console.error('Get knowledge entry error:', error)
    return NextResponse.json({ error: error.message }, { status: 500 })
  }
}

// PUT - Update knowledge entry
export async function PUT(
  request: NextRequest,
  { params }: { params: { slug: string } }
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
    const { slug } = params
    const body = await request.json()

    // Get existing entry
    const { data: existing, error: fetchError } = await supabase
      .from('knowledge_entries')
      .select('id, current_version')
      .eq('slug', slug)
      .single()

    if (fetchError || !existing) {
      return NextResponse.json({ error: 'Entry not found' }, { status: 404 })
    }

    // Prepare update data
    const updateData: any = {
      updated_at: new Date().toISOString()
    }

    // Only update provided fields
    const allowedFields = [
      'title', 'subtitle', 'content', 'summary', 'entry_type',
      'category', 'subcategory', 'date_from', 'date_to', 'date_precision',
      'fiscal_year', 'location_name', 'location_type', 'coordinates',
      'importance', 'is_featured', 'is_public', 'is_verified',
      'keywords', 'structured_data'
    ]

    for (const field of allowedFields) {
      if (body[field] !== undefined) {
        updateData[field] = body[field]
      }
    }

    // If content changed, increment version
    const contentChanged = body.title || body.content || body.summary || body.structured_data
    if (contentChanged) {
      updateData.current_version = existing.current_version + 1
    }

    // Update the entry
    const { data: entry, error: updateError } = await supabase
      .from('knowledge_entries')
      .update(updateData)
      .eq('id', existing.id)
      .select()
      .single()

    if (updateError) {
      console.error('Update entry error:', updateError)
      return NextResponse.json({ error: updateError.message }, { status: 500 })
    }

    // Create version record if content changed
    if (contentChanged) {
      await supabase
        .from('knowledge_versions')
        .insert({
          entry_id: existing.id,
          version_number: updateData.current_version,
          title: entry.title,
          content: entry.content,
          summary: entry.summary,
          structured_data: entry.structured_data,
          change_type: 'updated',
          change_summary: body.change_summary || 'Content updated'
        })
    }

    return NextResponse.json({ entry, updated: true })

  } catch (error: any) {
    console.error('Update knowledge entry error:', error)
    return NextResponse.json({ error: error.message }, { status: 500 })
  }
}

// DELETE - Delete knowledge entry
export async function DELETE(
  request: NextRequest,
  { params }: { params: { slug: string } }
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
    const { slug } = params

    const { error } = await supabase
      .from('knowledge_entries')
      .delete()
      .eq('slug', slug)

    if (error) {
      console.error('Delete entry error:', error)
      return NextResponse.json({ error: error.message }, { status: 500 })
    }

    return NextResponse.json({ deleted: true })

  } catch (error: any) {
    console.error('Delete knowledge entry error:', error)
    return NextResponse.json({ error: error.message }, { status: 500 })
  }
}
