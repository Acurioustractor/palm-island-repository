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

type BulkBody = {
  mediaIds?: string[]
  addTags?: string[]
  removeTags?: string[]
  mergeMetadata?: Record<string, unknown>
  mergeContextMetadata?: Record<string, unknown>
  facesDetected?: string[]
  deletedAt?: string | null
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

export async function POST(request: NextRequest) {
  try {
    // Safety: this endpoint bypasses RLS using the service role; keep it dev-only.
    if (!isDev(request)) {
      return NextResponse.json({ error: 'Not available' }, { status: 403 })
    }

    const body = (await request.json().catch(() => ({}))) as BulkBody
    const mediaIds = uniqStrings(body.mediaIds)
    const addTags = uniqStrings(body.addTags)
    const removeTags = uniqStrings(body.removeTags)
    const mergeMetadata = isPlainObject(body.mergeMetadata) ? body.mergeMetadata : undefined
    const mergeContextMetadata = isPlainObject(body.mergeContextMetadata) ? body.mergeContextMetadata : undefined
    const facesDetected = uniqStrings(body.facesDetected)
    const deletedAt =
      body.deletedAt === null ? null : typeof body.deletedAt === 'string' && body.deletedAt.trim() ? body.deletedAt : undefined

    if (mediaIds.length === 0) return NextResponse.json({ error: 'mediaIds required' }, { status: 400 })

    const supabase = getServerClient()

    const chunkSize = 200
    let updatedCount = 0

    for (let i = 0; i < mediaIds.length; i += chunkSize) {
      const chunk = mediaIds.slice(i, i + chunkSize)

      const { data, error } = await (supabase as any)
        .from('media_files')
        .select('id,tags,metadata,context_metadata')
        .in('id', chunk)

      if (error) return NextResponse.json({ error: error.message }, { status: 500 })

      const updates = (data || []).map((row: any) => {
        const currentTags = Array.isArray(row.tags) ? row.tags.filter((t: any) => typeof t === 'string') : []
        const nextTags = [...currentTags]

        for (const t of addTags) {
          if (!nextTags.includes(t)) nextTags.push(t)
        }
        const cleanedTags = removeTags.length ? nextTags.filter((t) => !removeTags.includes(t)) : nextTags

        const currentMetadata = isPlainObject(row.metadata) ? row.metadata : {}
        const nextMetadata = mergeMetadata ? { ...currentMetadata, ...mergeMetadata } : currentMetadata

        const currentContextMetadata = isPlainObject(row.context_metadata) ? row.context_metadata : {}
        const nextContextMetadata = mergeContextMetadata
          ? { ...currentContextMetadata, ...mergeContextMetadata }
          : currentContextMetadata

        const update: any = {
          id: row.id,
          tags: cleanedTags,
          metadata: nextMetadata,
          context_metadata: nextContextMetadata,
        }

        if (facesDetected.length) update.faces_detected = facesDetected
        if (deletedAt !== undefined) update.deleted_at = deletedAt

        return update
      })


      if (updates.length === 0) continue

      for (const update of updates) {
        const { id, ...payload } = update
        const { error: rowError } = await (supabase as any)
          .from('media_files')
          .update(payload)
          .eq('id', id)

        if (rowError) {
          return NextResponse.json({ error: rowError.message }, { status: 500 })
        }

        updatedCount += 1
      }
    }

    return NextResponse.json({ ok: true, updated: updatedCount })
  } catch (error: any) {
    return NextResponse.json({ error: error?.message || 'Bulk update failed' }, { status: 500 })
  }
}
