/**
 * GET /api/trips/[slug] — fetch trip with all jsonb data
 * PATCH /api/trips/[slug] — partial update; can set name/description/location/
 *   target_start/target_end/status/origin_meeting_id and/or merge new keys
 *   into data jsonb (caller passes { data: { milestones: [...], ... } } and the
 *   handler does jsonb merge by overwriting only the keys provided).
 *
 * Degrades gracefully if the trips table doesn't exist yet — GET returns a
 * static seed for the Atherton Tablelands trip so the demo page works in
 * read-only mode. PATCH returns 503 with the migration path.
 */
import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@supabase/supabase-js'
import { ATHERTON_TABLELANDS_SEED } from '@/lib/trips/seed'

export const dynamic = 'force-dynamic'

function getSupabase() {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL
  const key = process.env.SUPABASE_SERVICE_ROLE_KEY
  if (!url || !key) throw new Error('Missing Supabase credentials')
  return createClient(url, key, { auth: { autoRefreshToken: false, persistSession: false } })
}

function isMissingTableError(err: any): boolean {
  const msg = String(err?.message || '')
  const code = String(err?.code || '')
  return code === '42P01' || /relation .* does not exist/i.test(msg)
}

export async function GET(
  _request: NextRequest,
  { params }: { params: Promise<{ slug: string }> },
) {
  const { slug } = await params
  try {
    const supabase = getSupabase()
    const { data, error } = await supabase
      .from('trips')
      .select('*')
      .eq('slug', slug)
      .maybeSingle()

    if (error) {
      if (isMissingTableError(error)) {
        // Static fallback so the page renders during demo
        if (slug === ATHERTON_TABLELANDS_SEED.slug) {
          return NextResponse.json({ data: ATHERTON_TABLELANDS_SEED, degraded: true })
        }
        return NextResponse.json({ error: 'Trips table not yet migrated', degraded: true }, { status: 404 })
      }
      throw error
    }
    if (!data) {
      // Trip not in DB but might be a known seed
      if (slug === ATHERTON_TABLELANDS_SEED.slug) {
        return NextResponse.json({ data: ATHERTON_TABLELANDS_SEED, degraded: true })
      }
      return NextResponse.json({ error: 'Trip not found' }, { status: 404 })
    }
    return NextResponse.json({ data, degraded: false })
  } catch (err: any) {
    return NextResponse.json({ error: err?.message || 'Failed' }, { status: 500 })
  }
}

export async function PATCH(
  request: NextRequest,
  { params }: { params: Promise<{ slug: string }> },
) {
  const { slug } = await params
  try {
    const body = await request.json()
    const supabase = getSupabase()

    // Fetch existing data jsonb so we can merge top-level keys
    const existingRes = await supabase.from('trips').select('data').eq('slug', slug).maybeSingle()
    if (existingRes.error) {
      if (isMissingTableError(existingRes.error)) {
        return NextResponse.json(
          {
            error: 'Trips table not migrated — run web-platform/supabase/migrations/20260512_trips.sql',
            migration: 'web-platform/supabase/migrations/20260512_trips.sql',
          },
          { status: 503 },
        )
      }
      throw existingRes.error
    }

    const merged = body?.data
      ? { ...((existingRes.data?.data as Record<string, any>) || {}), ...body.data }
      : undefined

    const update: Record<string, any> = {}
    for (const key of ['name', 'description', 'location', 'target_start', 'target_end', 'status', 'origin_meeting_id']) {
      if (key in body) update[key] = body[key]
    }
    if (merged !== undefined) update.data = merged

    if (Object.keys(update).length === 0) {
      return NextResponse.json({ error: 'No fields to update' }, { status: 400 })
    }

    const { data, error } = await supabase
      .from('trips')
      .update(update)
      .eq('slug', slug)
      .select()
      .maybeSingle()

    if (error) throw error
    if (!data) return NextResponse.json({ error: 'Trip not found' }, { status: 404 })
    return NextResponse.json({ data })
  } catch (err: any) {
    return NextResponse.json({ error: err?.message || 'Failed' }, { status: 500 })
  }
}
