import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@supabase/supabase-js'
import type { CreateTimelineEventInput } from '@/lib/knowledge-base/types'

// GET - List timeline events with filtering
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

    const event_type = searchParams.get('event_type')
    const category = searchParams.get('category')
    const date_from = searchParams.get('date_from')
    const date_to = searchParams.get('date_to')
    const year = searchParams.get('year')
    const decade = searchParams.get('decade')
    const location = searchParams.get('location')
    const limit = parseInt(searchParams.get('limit') || '100')
    const offset = parseInt(searchParams.get('offset') || '0')

    let query = supabase
      .from('timeline_events')
      .select(`
        *,
        knowledge_entry:knowledge_entries(id, slug, title, entry_type)
      `)
      .order('event_date', { ascending: true })

    // Filter by event type
    if (event_type) {
      query = query.eq('event_type', event_type)
    }

    // Filter by category
    if (category) {
      query = query.eq('category', category)
    }

    // Filter by date range
    if (date_from) {
      query = query.gte('event_date', date_from)
    }
    if (date_to) {
      query = query.lte('event_date', date_to)
    }

    // Filter by specific year
    if (year) {
      query = query
        .gte('event_date', `${year}-01-01`)
        .lte('event_date', `${year}-12-31`)
    }

    // Filter by decade (e.g., "1910s", "2020s")
    if (decade) {
      const decadeStart = parseInt(decade.replace('s', ''))
      if (!isNaN(decadeStart)) {
        query = query
          .gte('event_date', `${decadeStart}-01-01`)
          .lt('event_date', `${decadeStart + 10}-01-01`)
      }
    }

    // Filter by location (partial match)
    if (location) {
      query = query.ilike('location', `%${location}%`)
    }

    query = query.range(offset, offset + limit - 1)

    const { data: events, error } = await query

    if (error) {
      return NextResponse.json({ error: error.message }, { status: 500 })
    }

    // Group events by year for timeline visualization
    const eventsByYear: Record<string, any[]> = {}
    if (events) {
      for (const event of events) {
        const year = event.event_date ? new Date(event.event_date).getFullYear().toString() : 'Unknown'
        if (!eventsByYear[year]) {
          eventsByYear[year] = []
        }
        eventsByYear[year].push(event)
      }
    }

    return NextResponse.json({
      events,
      events_by_year: eventsByYear,
      total_count: events?.length || 0
    })

  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 })
  }
}

// POST - Create timeline event
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
    const body: CreateTimelineEventInput = await request.json()

    if (!body.title || !body.event_date) {
      return NextResponse.json({
        error: 'Missing required fields: title, event_date'
      }, { status: 400 })
    }

    const { data: event, error } = await supabase
      .from('timeline_events')
      .insert({
        title: body.title,
        description: body.description,
        event_date: body.event_date,
        end_date: body.end_date,
        event_type: body.event_type || 'event',
        category: body.category,
        location: body.location,
        location_coordinates: body.location_coordinates,
        significance: body.significance || 'medium',
        people_involved: body.people_involved,
        knowledge_entry_id: body.knowledge_entry_id,
        metadata: body.metadata
      })
      .select()
      .single()

    if (error) {
      return NextResponse.json({ error: error.message }, { status: 500 })
    }

    return NextResponse.json({ event, created: true })

  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 })
  }
}

// PUT - Bulk import timeline events (useful for historical data)
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
    const { events } = body

    if (!Array.isArray(events) || events.length === 0) {
      return NextResponse.json({
        error: 'Events array is required and must not be empty'
      }, { status: 400 })
    }

    // Validate all events have required fields
    for (const event of events) {
      if (!event.title || !event.event_date) {
        return NextResponse.json({
          error: 'All events must have title and event_date'
        }, { status: 400 })
      }
    }

    const eventsToInsert = events.map(e => ({
      title: e.title,
      description: e.description,
      event_date: e.event_date,
      end_date: e.end_date,
      event_type: e.event_type || 'event',
      category: e.category,
      location: e.location,
      location_coordinates: e.location_coordinates,
      significance: e.significance || 'medium',
      people_involved: e.people_involved,
      knowledge_entry_id: e.knowledge_entry_id,
      metadata: e.metadata
    }))

    const { data: insertedEvents, error } = await supabase
      .from('timeline_events')
      .insert(eventsToInsert)
      .select()

    if (error) {
      return NextResponse.json({ error: error.message }, { status: 500 })
    }

    return NextResponse.json({
      events: insertedEvents,
      imported_count: insertedEvents?.length || 0
    })

  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 })
  }
}
