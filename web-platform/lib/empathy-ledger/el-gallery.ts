/**
 * Empathy Ledger v2 — paginated gallery browse.
 *
 * EL holds 2,647 consented PICC media_assets. /api/photos caps at 200.
 * For the Atlas gallery we use a direct PostgREST query with Range headers
 * for pagination + filtering.
 *
 * Cultural protocol: only elder_approved AND consent_obtained rows ever
 * leave EL via this path. cultural_tags carry slot tags (picc:slot:*) +
 * year tags (fy:*) so the gallery can filter.
 */

const EL_REST = 'https://yvnuayzslukamizrlhwb.supabase.co/rest/v1'
const PICC_ORG_ID_EL = '084f851c-72e0-41fb-b5ba-f3088f44862d'

export interface GalleryPhoto {
  id: string
  url: string
  thumbnail_url: string | null
  alt_text: string | null
  caption: string | null
  attribution: string | null
  taken_at: string | null
  storyteller_id: string | null
  cultural_tags: string[]
  is_featured: boolean
}

export interface GalleryFilters {
  /** Slot tag without the "picc:slot:" prefix. */
  slot?: string
  /** Fiscal year tag without the "fy:" prefix. */
  fy?: string
  /** Search alt_text / caption / attribution. */
  q?: string
  /** Only featured. */
  featured?: boolean
}

export interface GalleryPage {
  photos: GalleryPhoto[]
  total: number
  page: number
  page_size: number
  available_slots: string[]
  available_years: string[]
}

const PAGE_SIZE = 48

export async function getGalleryPage(
  page: number,
  filters: GalleryFilters = {},
): Promise<GalleryPage | null> {
  const key = process.env.EMPATHY_LEDGER_SERVICE_KEY
  if (!key) return null
  const offset = Math.max(0, page) * PAGE_SIZE

  const url = new URL(`${EL_REST}/media_assets`)
  url.searchParams.set('organization_id', `eq.${PICC_ORG_ID_EL}`)
  url.searchParams.set('elder_approved', 'eq.true')
  url.searchParams.set('consent_obtained', 'eq.true')
  url.searchParams.set(
    'select',
    'id,cdn_url,url,thumbnail_url,alt_text,caption,attribution_text,taken_at,storyteller_id,cultural_tags,is_featured',
  )
  url.searchParams.set('order', 'is_featured.desc,taken_at.desc.nullslast')

  if (filters.featured) url.searchParams.set('is_featured', 'eq.true')
  if (filters.slot) {
    url.searchParams.set('cultural_tags', `cs.{picc:slot:${filters.slot}}`)
  }
  if (filters.fy) {
    // Override or augment cultural_tags filter — PostgREST allows one
    // value per key. If both slot + fy are set, fall back to or.()
    const conds: string[] = []
    if (filters.slot) conds.push(`cultural_tags.cs.{picc:slot:${filters.slot}}`)
    conds.push(`cultural_tags.cs.{fy:${filters.fy}}`)
    if (conds.length > 1) {
      url.searchParams.delete('cultural_tags')
      url.searchParams.set('and', `(${conds.join(',')})`)
    } else {
      url.searchParams.set('cultural_tags', `cs.{fy:${filters.fy}}`)
    }
  }
  if (filters.q && filters.q.trim().length > 0) {
    // ILIKE search across the three text fields via or().
    const q = filters.q.trim().replace(/[%_]/g, '\\$&')
    url.searchParams.set(
      'or',
      `(alt_text.ilike.*${q}*,caption.ilike.*${q}*,attribution_text.ilike.*${q}*)`,
    )
  }

  const ctrl = new AbortController()
  const timer = setTimeout(() => ctrl.abort(), 15_000)
  try {
    const res = await fetch(url.toString(), {
      headers: {
        apikey: key,
        Authorization: `Bearer ${key}`,
        Range: `${offset}-${offset + PAGE_SIZE - 1}`,
        'Range-Unit': 'items',
        Prefer: 'count=exact',
      },
      cache: 'no-store',
      signal: ctrl.signal,
    })
    if (!res.ok && res.status !== 206) return null
    const range = res.headers.get('content-range') ?? ''
    const total = parseInt(range.split('/')[1] ?? '0', 10) || 0
    const arr = (await res.json()) as Array<Record<string, unknown>>
    const photos: GalleryPhoto[] = arr.map((r) => ({
      id: r.id as string,
      url: (r.cdn_url as string) ?? (r.url as string) ?? '',
      thumbnail_url: (r.thumbnail_url as string | null) ?? null,
      alt_text: (r.alt_text as string | null) ?? null,
      caption: (r.caption as string | null) ?? null,
      attribution: (r.attribution_text as string | null) ?? null,
      taken_at: (r.taken_at as string | null) ?? null,
      storyteller_id: (r.storyteller_id as string | null) ?? null,
      cultural_tags: Array.isArray(r.cultural_tags)
        ? (r.cultural_tags as string[])
        : [],
      is_featured: Boolean(r.is_featured),
    }))

    // Available slots + years discovered in this page's tags.
    const slotSet = new Set<string>()
    const yearSet = new Set<string>()
    for (const p of photos) {
      for (const t of p.cultural_tags) {
        if (t.startsWith('picc:slot:')) slotSet.add(t.slice('picc:slot:'.length))
        if (t.startsWith('fy:')) yearSet.add(t.slice('fy:'.length))
      }
    }

    return {
      photos,
      total,
      page,
      page_size: PAGE_SIZE,
      available_slots: Array.from(slotSet).sort(),
      available_years: Array.from(yearSet).sort().reverse(),
    }
  } catch {
    return null
  } finally {
    clearTimeout(timer)
  }
}
