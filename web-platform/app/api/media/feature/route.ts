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

function uniqStrings(values: unknown) {
  const out: string[] = []
  if (!Array.isArray(values)) return out
  for (const v of values) {
    if (typeof v !== 'string') continue
    const s = v.trim()
    if (!s) continue
    if (!out.includes(s)) out.push(s)
  }
  return out
}

function isPlainObject(value: unknown): value is Record<string, unknown> {
  if (!value || typeof value !== 'object') return false
  return Object.getPrototypeOf(value) === Object.prototype
}

type Body = {
  mediaId?: string
  pageContext?: string
  pageSection?: string
  fileType?: string
  addTags?: string[]
  mergeContextMetadata?: Record<string, unknown>
}

export async function POST(request: NextRequest) {
  try {
    // Safety: this endpoint bypasses RLS using the service role; keep it dev-only.
    if (!isDev(request)) return NextResponse.json({ error: 'Not available' }, { status: 403 })

    const body = (await request.json().catch(() => ({}))) as Body
    const mediaId = String(body.mediaId || '').trim()
    const pageContext = String(body.pageContext || '').trim()
    const pageSection = String(body.pageSection || '').trim()
    const fileType = String(body.fileType || '').trim()
    const addTags = uniqStrings(body.addTags)
    const mergeContextMetadata = isPlainObject(body.mergeContextMetadata) ? body.mergeContextMetadata : undefined

    if (!mediaId) return NextResponse.json({ error: 'mediaId required' }, { status: 400 })
    if (!pageContext) return NextResponse.json({ error: 'pageContext required' }, { status: 400 })
    if (!pageSection) return NextResponse.json({ error: 'pageSection required' }, { status: 400 })
    if (!fileType) return NextResponse.json({ error: 'fileType required' }, { status: 400 })

    const supabase = getServerClient()

    const { data: current, error: currentError } = await (supabase as any)
      .from('media_files')
      .select('id,tags,context_metadata')
      .eq('id', mediaId)
      .single()

    if (currentError || !current) return NextResponse.json({ error: currentError?.message || 'Media not found' }, { status: 404 })

    // Clear existing featured for this page/section/type. If report_year provided, scope to it.
    let clearQuery = (supabase as any)
      .from('media_files')
      .update({ is_featured: false })
      .eq('page_context', pageContext)
      .eq('page_section', pageSection)
      .eq('file_type', fileType)

    const reportYear = (mergeContextMetadata as any)?.report_year
    if (typeof reportYear === 'number' || typeof reportYear === 'string') {
      clearQuery = clearQuery.contains('context_metadata', { report_year: reportYear })
    }

    await clearQuery

    const nextTags = addTags.length ? Array.from(new Set([...uniqStrings(current.tags), ...addTags])) : uniqStrings(current.tags)
    const nextContextMetadata = mergeContextMetadata ? { ...(isPlainObject(current.context_metadata) ? current.context_metadata : {}), ...mergeContextMetadata } : current.context_metadata

    const { error: updateError } = await (supabase as any)
      .from('media_files')
      .update({
        page_context: pageContext,
        page_section: pageSection,
        file_type: fileType,
        is_featured: true,
        tags: nextTags,
        context_metadata: nextContextMetadata,
      })
      .eq('id', mediaId)

    if (updateError) return NextResponse.json({ error: updateError.message }, { status: 500 })

    return NextResponse.json({ ok: true })
  } catch (error: any) {
    return NextResponse.json({ error: error?.message || 'Feature update failed' }, { status: 500 })
  }
}

