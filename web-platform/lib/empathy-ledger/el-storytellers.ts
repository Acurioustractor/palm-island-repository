/**
 * Empathy Ledger v2 — canonical PICC storyteller roster.
 *
 * EL v2 is the source of truth for every named voice in the PICC
 * archive. This module is the only place PICC fetches storytellers
 * from EL v2. Replaces the patchwork that used voices-pool subset
 * + getPalmStorytellers() with a location-LIKE filter.
 *
 * Endpoint: GET /api/picc/storytellers
 * Returns 44 storytellers (per the EL admin) including:
 *   - photo + bio + cultural_background
 *   - is_elder + is_featured flags
 *   - service_slugs[] (linked services)
 *   - project_slugs[] (linked via tagged photos)
 *   - quote_count (merged from storyteller_quotes + extracted_quotes)
 */

export interface ELStoryteller {
  id: string
  slug: string
  display_name: string
  role: string | null
  location: string | null
  cultural_background: string | null
  bio: string | null
  photo_url: string | null
  is_elder: boolean
  is_featured: boolean
  quote_count: number
  service_slugs: string[]
  project_slugs: string[]
  updated_at: string
}

const base = () => process.env.EL_V2_API_URL?.replace(/\/$/, '')
const key = () => process.env.EL_V2_API_KEY

async function call<T>(path: string): Promise<T | null> {
  const b = base()
  const k = key()
  if (!b || !k) return null
  const ctrl = new AbortController()
  const timer = setTimeout(() => ctrl.abort(), 15_000)
  try {
    const res = await fetch(`${b}${path}`, {
      headers: { 'x-picc-api-key': k },
      cache: 'no-store',
      signal: ctrl.signal,
    })
    if (!res.ok) return null
    return (await res.json()) as T
  } catch {
    return null
  } finally {
    clearTimeout(timer)
  }
}

/**
 * Get all PICC storytellers (canonical full roster, ~44 today).
 * Returns [] when EL is unreachable — pages should handle empty
 * gracefully (no parallel fallback path).
 */
export async function getPiccStorytellers(opts: {
  elders?: boolean
  withQuotes?: boolean
  service?: string
  limit?: number
} = {}): Promise<ELStoryteller[]> {
  const params = new URLSearchParams()
  if (opts.elders) params.set('elders', 'true')
  if (opts.withQuotes) params.set('with_quotes', 'true')
  if (opts.service) params.set('service', opts.service)
  if (opts.limit) params.set('limit', String(opts.limit))
  const q = params.toString()
  const r = await call<{ count: number; storytellers: ELStoryteller[] }>(
    `/api/picc/storytellers${q ? `?${q}` : ''}`,
  )
  return r?.storytellers ?? []
}

/**
 * Single-storyteller lookup by slug. Returns null if not found
 * or EL unreachable. Used by /voices/[slug].
 */
export async function getPiccStoryteller(slug: string): Promise<ELStoryteller | null> {
  const all = await getPiccStorytellers({ limit: 500 })
  return all.find((s) => s.slug === slug) || null
}

/**
 * Convenience for the elders directory — only returns is_elder=true.
 */
export async function getPiccElders(): Promise<ELStoryteller[]> {
  return getPiccStorytellers({ elders: true })
}
