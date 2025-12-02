import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@supabase/supabase-js'

// Comprehensive search across all knowledge base entities
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

    const query = searchParams.get('q') || searchParams.get('query')
    const types = searchParams.get('types')?.split(',') || ['all']
    const date_from = searchParams.get('date_from')
    const date_to = searchParams.get('date_to')
    const limit = parseInt(searchParams.get('limit') || '20')

    if (!query || query.length < 2) {
      return NextResponse.json({
        error: 'Search query must be at least 2 characters'
      }, { status: 400 })
    }

    const results: Record<string, any[]> = {}
    const searchAll = types.includes('all')

    // Search knowledge entries
    if (searchAll || types.includes('entries')) {
      let entriesQuery = supabase
        .from('knowledge_entries')
        .select('id, slug, title, entry_type, category, summary, created_at')
        .textSearch('search_vector', query)
        .limit(limit)

      if (date_from) {
        entriesQuery = entriesQuery.gte('created_at', date_from)
      }
      if (date_to) {
        entriesQuery = entriesQuery.lte('created_at', date_to)
      }

      const { data: entries } = await entriesQuery
      results.entries = entries || []
    }

    // Search timeline events
    if (searchAll || types.includes('timeline')) {
      let timelineQuery = supabase
        .from('timeline_events')
        .select('id, title, description, event_date, event_type, category, location')
        .or(`title.ilike.%${query}%,description.ilike.%${query}%`)
        .order('event_date', { ascending: false })
        .limit(limit)

      if (date_from) {
        timelineQuery = timelineQuery.gte('event_date', date_from)
      }
      if (date_to) {
        timelineQuery = timelineQuery.lte('event_date', date_to)
      }

      const { data: timeline } = await timelineQuery
      results.timeline = timeline || []
    }

    // Search research sources
    if (searchAll || types.includes('sources')) {
      const { data: sources } = await supabase
        .from('research_sources')
        .select('id, title, source_type, author, publisher, is_verified, is_primary_source')
        .or(`title.ilike.%${query}%,description.ilike.%${query}%,author.ilike.%${query}%`)
        .limit(limit)

      results.sources = sources || []
    }

    // Search financial records
    if (searchAll || types.includes('financial')) {
      let financialQuery = supabase
        .from('financial_records')
        .select('id, record_type, fiscal_year, category, subcategory, description, amount')
        .or(`category.ilike.%${query}%,subcategory.ilike.%${query}%,description.ilike.%${query}%`)
        .limit(limit)

      const { data: financial } = await financialQuery
      results.financial = financial || []
    }

    // Search stories
    if (searchAll || types.includes('stories')) {
      const { data: stories } = await supabase
        .from('stories')
        .select('id, title, excerpt, themes, story_type, location, created_at')
        .or(`title.ilike.%${query}%,content.ilike.%${query}%,excerpt.ilike.%${query}%`)
        .limit(limit)

      results.stories = stories || []
    }

    // Search profiles
    if (searchAll || types.includes('profiles')) {
      const { data: profiles } = await supabase
        .from('profiles')
        .select('id, full_name, bio, role, community_role')
        .or(`full_name.ilike.%${query}%,bio.ilike.%${query}%,community_role.ilike.%${query}%`)
        .limit(limit)

      results.profiles = profiles || []
    }

    // Calculate totals
    const totalResults = Object.values(results).reduce(
      (sum, arr) => sum + (arr?.length || 0), 0
    )

    return NextResponse.json({
      query,
      results,
      summary: {
        total: totalResults,
        by_type: Object.fromEntries(
          Object.entries(results).map(([key, arr]) => [key, arr?.length || 0])
        )
      }
    })

  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 })
  }
}

// POST - Advanced search with more options
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
    const {
      query,
      filters = {},
      types = ['all'],
      date_range,
      location,
      fiscal_year,
      limit = 20,
      offset = 0
    } = body

    if (!query || query.length < 2) {
      return NextResponse.json({
        error: 'Search query must be at least 2 characters'
      }, { status: 400 })
    }

    const results: Record<string, any[]> = {}
    const searchAll = types.includes('all')

    // Use the search_knowledge function for entries if available
    if (searchAll || types.includes('entries')) {
      // Build filters for knowledge search
      const entryFilters: Record<string, any> = {}
      if (filters.entry_type) entryFilters.entry_type = filters.entry_type
      if (filters.category) entryFilters.category = filters.category

      const { data: entries } = await supabase
        .from('knowledge_entries')
        .select(`
          id, slug, title, entry_type, category, summary,
          primary_date, primary_location, created_at,
          tags:knowledge_tags(tag)
        `)
        .textSearch('search_vector', query)
        .limit(limit)
        .range(offset, offset + limit - 1)

      results.entries = entries || []
    }

    // Search timeline with location filter
    if (searchAll || types.includes('timeline')) {
      let timelineQuery = supabase
        .from('timeline_events')
        .select('*')
        .or(`title.ilike.%${query}%,description.ilike.%${query}%`)

      if (location) {
        timelineQuery = timelineQuery.ilike('location', `%${location}%`)
      }

      if (date_range?.from) {
        timelineQuery = timelineQuery.gte('event_date', date_range.from)
      }
      if (date_range?.to) {
        timelineQuery = timelineQuery.lte('event_date', date_range.to)
      }

      const { data: timeline } = await timelineQuery
        .order('event_date', { ascending: false })
        .limit(limit)

      results.timeline = timeline || []
    }

    // Search financial records with fiscal year filter
    if (searchAll || types.includes('financial')) {
      let financialQuery = supabase
        .from('financial_records')
        .select('*')
        .or(`category.ilike.%${query}%,subcategory.ilike.%${query}%,description.ilike.%${query}%`)

      if (fiscal_year) {
        financialQuery = financialQuery.eq('fiscal_year', fiscal_year)
      }

      if (filters.record_type) {
        financialQuery = financialQuery.eq('record_type', filters.record_type)
      }

      const { data: financial } = await financialQuery.limit(limit)
      results.financial = financial || []
    }

    const totalResults = Object.values(results).reduce(
      (sum, arr) => sum + (arr?.length || 0), 0
    )

    return NextResponse.json({
      query,
      filters,
      results,
      summary: {
        total: totalResults,
        by_type: Object.fromEntries(
          Object.entries(results).map(([key, arr]) => [key, arr?.length || 0])
        )
      },
      pagination: {
        limit,
        offset,
        has_more: totalResults >= limit
      }
    })

  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 })
  }
}
