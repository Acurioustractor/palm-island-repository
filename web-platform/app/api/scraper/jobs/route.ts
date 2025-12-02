import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@supabase/supabase-js'
import { runScrapeJob, getSourcesDueForScraping } from '@/lib/scraper'

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

// GET - List scrape jobs
export async function GET(request: NextRequest) {
  try {
    const supabase = getSupabase()
    const { searchParams } = new URL(request.url)
    const sourceId = searchParams.get('source_id')
    const status = searchParams.get('status')
    const limit = parseInt(searchParams.get('limit') || '20')

    let query = supabase
      .from('scrape_jobs')
      .select(`
        *,
        source:scrape_sources(id, name, url)
      `)
      .order('created_at', { ascending: false })
      .limit(limit)

    if (sourceId) {
      query = query.eq('source_id', sourceId)
    }

    if (status) {
      query = query.eq('status', status)
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

// POST - Start a new scrape job
export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { source_id, config } = body

    if (!source_id) {
      return NextResponse.json(
        { error: 'source_id is required' },
        { status: 400 }
      )
    }

    const result = await runScrapeJob(source_id, config)

    if (!result.success) {
      return NextResponse.json(
        { error: 'Scrape job failed', details: result.errors },
        { status: 500 }
      )
    }

    return NextResponse.json(result, { status: 201 })
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 })
  }
}
