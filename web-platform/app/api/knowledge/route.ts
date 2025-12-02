import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@supabase/supabase-js'
import type { KnowledgeSearchParams, CreateKnowledgeEntryInput } from '@/lib/knowledge-base/types'

// GET - Search and list knowledge entries
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

    const query = searchParams.get('query')
    const entry_type = searchParams.get('entry_type')
    const category = searchParams.get('category')
    const fiscal_year = searchParams.get('fiscal_year')
    const date_from = searchParams.get('date_from')
    const date_to = searchParams.get('date_to')
    const is_verified = searchParams.get('is_verified')
    const is_featured = searchParams.get('is_featured')
    const limit = parseInt(searchParams.get('limit') || '50')
    const offset = parseInt(searchParams.get('offset') || '0')

    let dbQuery = supabase
      .from('knowledge_entries')
      .select(`
        id,
        slug,
        title,
        subtitle,
        summary,
        entry_type,
        category,
        subcategory,
        date_from,
        date_to,
        fiscal_year,
        location_name,
        location_type,
        importance,
        is_featured,
        is_verified,
        keywords,
        created_at,
        updated_at
      `)
      .eq('is_public', true)
      .order('importance', { ascending: false })
      .order('updated_at', { ascending: false })

    // Apply filters
    if (query) {
      dbQuery = dbQuery.textSearch('search_vector', query, { type: 'websearch' })
    }

    if (entry_type) {
      dbQuery = dbQuery.eq('entry_type', entry_type)
    }

    if (category) {
      dbQuery = dbQuery.eq('category', category)
    }

    if (fiscal_year) {
      dbQuery = dbQuery.eq('fiscal_year', fiscal_year)
    }

    if (date_from) {
      dbQuery = dbQuery.gte('date_from', date_from)
    }

    if (date_to) {
      dbQuery = dbQuery.lte('date_to', date_to)
    }

    if (is_verified === 'true') {
      dbQuery = dbQuery.eq('is_verified', true)
    }

    if (is_featured === 'true') {
      dbQuery = dbQuery.eq('is_featured', true)
    }

    // Pagination
    dbQuery = dbQuery.range(offset, offset + limit - 1)

    const { data: entries, error, count } = await dbQuery

    if (error) {
      console.error('Knowledge search error:', error)
      return NextResponse.json({ error: error.message }, { status: 500 })
    }

    // Get total count
    const { count: totalCount } = await supabase
      .from('knowledge_entries')
      .select('*', { count: 'exact', head: true })
      .eq('is_public', true)

    return NextResponse.json({
      entries,
      pagination: {
        total: totalCount,
        limit,
        offset,
        has_more: offset + limit < (totalCount || 0)
      }
    })

  } catch (error: any) {
    console.error('Knowledge API error:', error)
    return NextResponse.json({ error: error.message }, { status: 500 })
  }
}

// POST - Create new knowledge entry
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
    const body: CreateKnowledgeEntryInput = await request.json()

    // Validate required fields
    if (!body.slug || !body.title || !body.content || !body.entry_type) {
      return NextResponse.json({
        error: 'Missing required fields: slug, title, content, entry_type'
      }, { status: 400 })
    }

    // Create the entry
    const { data: entry, error: createError } = await supabase
      .from('knowledge_entries')
      .insert({
        slug: body.slug,
        title: body.title,
        subtitle: body.subtitle,
        content: body.content,
        summary: body.summary,
        entry_type: body.entry_type,
        category: body.category,
        subcategory: body.subcategory,
        date_from: body.date_from,
        date_to: body.date_to,
        date_precision: body.date_precision,
        fiscal_year: body.fiscal_year,
        location_name: body.location_name,
        location_type: body.location_type,
        coordinates: body.coordinates,
        importance: body.importance || 5,
        is_featured: body.is_featured || false,
        is_public: body.is_public !== false,
        keywords: body.keywords,
        structured_data: body.structured_data || {}
      })
      .select()
      .single()

    if (createError) {
      console.error('Create entry error:', createError)
      return NextResponse.json({ error: createError.message }, { status: 500 })
    }

    // Create initial version
    await supabase
      .from('knowledge_versions')
      .insert({
        entry_id: entry.id,
        version_number: 1,
        title: body.title,
        content: body.content,
        summary: body.summary,
        structured_data: body.structured_data,
        change_type: 'created',
        change_summary: 'Initial creation'
      })

    // Add tags if provided
    if (body.tags && body.tags.length > 0) {
      // Get or create tags
      for (const tagSlug of body.tags) {
        const { data: tag } = await supabase
          .from('knowledge_tags')
          .select('id')
          .eq('slug', tagSlug)
          .single()

        if (tag) {
          await supabase
            .from('knowledge_entry_tags')
            .insert({ entry_id: entry.id, tag_id: tag.id })

          // Update usage count
          await supabase.rpc('increment_tag_usage', { tag_id: tag.id })
        }
      }
    }

    // Link sources if provided
    if (body.source_ids && body.source_ids.length > 0) {
      const sourceLinks = body.source_ids.map(source_id => ({
        entry_id: entry.id,
        source_id,
        relationship: 'primary_source'
      }))

      await supabase
        .from('knowledge_source_links')
        .insert(sourceLinks)
    }

    return NextResponse.json({ entry, created: true })

  } catch (error: any) {
    console.error('Create knowledge entry error:', error)
    return NextResponse.json({ error: error.message }, { status: 500 })
  }
}
