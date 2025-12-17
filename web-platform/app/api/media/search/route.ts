import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@supabase/supabase-js'

export const runtime = 'nodejs'

function isDev(request: NextRequest) {
  if (process.env.NODE_ENV === 'production') return false
  const host = request.headers.get('host') || ''
  return host.includes('localhost') || host.includes('127.0.0.1')
}

function getServerClient() {
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
  const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY

  if (!supabaseUrl || !supabaseServiceKey) {
    throw new Error('Missing Supabase credentials')
  }

  return createClient(supabaseUrl, supabaseServiceKey, {
    auth: { autoRefreshToken: false, persistSession: false },
  })
}

function splitCsv(value: string | null) {
  if (!value) return []
  return value
    .split(',')
    .map((s) => s.trim())
    .filter(Boolean)
}

export async function GET(request: NextRequest) {
  try {
    // Safety: this endpoint bypasses RLS using the service role; keep it dev-only.
    if (!isDev(request)) return NextResponse.json({ error: 'Not available' }, { status: 403 })

    const supabase = getServerClient()
    const { searchParams } = new URL(request.url)
    const q = (searchParams.get('q') || '').trim()
    const fileType = (searchParams.get('fileType') || '').trim()
    const pageContext = (searchParams.get('pageContext') || '').trim()
    const pageSection = (searchParams.get('pageSection') || '').trim()
    const tags = splitCsv(searchParams.get('tags'))
    const limit = Math.max(1, Math.min(200, Number(searchParams.get('limit') || 60)))

    let query = (supabase as any)
      .from('media_files')
      .select('id, public_url, title, caption, alt_text, tags, file_type, created_at, page_context, page_section')
      .eq('is_public', true)
      .is('deleted_at', null)
      .order('created_at', { ascending: false })
      .limit(limit)

    if (fileType) query = query.eq('file_type', fileType)
    if (pageContext) query = query.eq('page_context', pageContext)
    if (pageSection) query = query.eq('page_section', pageSection)
    if (tags.length > 0) query = query.overlaps('tags', tags)

    if (q) {
      // Supabase "or" syntax: col.op.value
      const like = `%${q.replace(/%/g, '\\%')}%`
      query = query.or(`title.ilike.${like},caption.ilike.${like},alt_text.ilike.${like}`)
    }

    const { data, error } = await query
    if (error) return NextResponse.json({ error: error.message }, { status: 500 })

    return NextResponse.json({ data: data || [] })
  } catch (error: any) {
    return NextResponse.json({ error: error?.message || 'Search failed' }, { status: 500 })
  }
}

