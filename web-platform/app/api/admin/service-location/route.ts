/**
 * POST /api/admin/service-location
 *
 * Persists service GPS coordinates to BOTH PICC organization_services
 * (operator workflow) AND EL canonical services (single source of truth
 * for /services + /picc/twenty-years map).
 *
 * Body: {
 *   service_id: string         // PICC organization_services.id
 *   slug: string               // canonical EL slug (also used by PICC)
 *   latitude: number
 *   longitude: number
 *   address?: string | null
 * }
 *
 * Auth: assumes admin context (the page lives under /picc/* with the
 * AdminProvider gate; service-role key is only used server-side here).
 *
 * Strategy:
 *   1. Best-effort write to EL canonical first (it's the source of truth)
 *   2. Mirror to PICC organization_services.metadata for legacy consumers
 *   3. Return both results so the UI can confirm both wrote
 */
import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@supabase/supabase-js'

export const runtime = 'nodejs'
export const dynamic = 'force-dynamic'

function piccClient() {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL
  const key = process.env.SUPABASE_SERVICE_ROLE_KEY
  if (!url || !key) throw new Error('Missing Supabase credentials')
  return createClient(url, key, {
    auth: { autoRefreshToken: false, persistSession: false },
  })
}

interface Body {
  service_id?: string
  slug?: string
  latitude?: number
  longitude?: number
  address?: string | null
}

export async function POST(req: NextRequest) {
  let body: Body
  try {
    body = (await req.json()) as Body
  } catch {
    return NextResponse.json({ error: 'invalid json' }, { status: 400 })
  }
  if (!body.service_id || !body.slug) {
    return NextResponse.json({ error: 'service_id and slug required' }, { status: 400 })
  }
  const lat = typeof body.latitude === 'number' ? body.latitude : null
  const lng = typeof body.longitude === 'number' ? body.longitude : null
  if (lat === null || lng === null) {
    return NextResponse.json({ error: 'latitude and longitude required (numbers)' }, { status: 400 })
  }

  const result: {
    el: { ok: boolean; error?: string; service?: any }
    picc: { ok: boolean; error?: string; service?: any }
  } = {
    el: { ok: false },
    picc: { ok: false },
  }

  // ── EL canonical (best-effort, doesn't block PICC mirror) ──────────────
  const elBase = process.env.EL_V2_API_URL?.replace(/\/$/, '')
  const elKey = process.env.EL_V2_API_KEY
  if (elBase && elKey) {
    try {
      const r = await fetch(`${elBase}/api/picc/services/${encodeURIComponent(body.slug)}/location`, {
        method: 'POST',
        headers: {
          'content-type': 'application/json',
          'x-picc-api-key': elKey,
        },
        body: JSON.stringify({ latitude: lat, longitude: lng, address: body.address ?? null }),
        cache: 'no-store',
      })
      if (r.ok) {
        const j = await r.json()
        result.el = { ok: true, service: j.service }
      } else {
        const t = await r.text().catch(() => 'unknown')
        result.el = { ok: false, error: `EL ${r.status}: ${t.slice(0, 200)}` }
      }
    } catch (err: any) {
      result.el = { ok: false, error: err?.message || String(err) }
    }
  } else {
    result.el = { ok: false, error: 'EL_V2_API_URL or EL_V2_API_KEY missing' }
  }

  // ── PICC mirror (organization_services.metadata) ───────────────────────
  try {
    const sb = piccClient()
    // Read current metadata to merge
    const { data: existing } = await sb
      .from('organization_services')
      .select('id, metadata')
      .eq('id', body.service_id)
      .maybeSingle()
    const currentMeta = (existing?.metadata as Record<string, any> | null) || {}
    const newMeta = {
      ...currentMeta,
      latitude: lat,
      longitude: lng,
      ...(body.address !== undefined ? { address: body.address } : {}),
    }
    const { data, error } = await sb
      .from('organization_services')
      .update({ metadata: newMeta })
      .eq('id', body.service_id)
      .select('id, slug, name, metadata')
      .single()
    if (error) result.picc = { ok: false, error: error.message }
    else result.picc = { ok: true, service: data }
  } catch (err: any) {
    result.picc = { ok: false, error: err?.message || String(err) }
  }

  // Return 200 if EITHER wrote successfully — UI can show partial success
  const status = result.el.ok || result.picc.ok ? 200 : 500
  return NextResponse.json(result, { status })
}
