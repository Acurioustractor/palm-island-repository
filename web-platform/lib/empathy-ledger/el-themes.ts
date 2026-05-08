/**
 * EL v2 themes client. Replaces the old read-from-PICC-supabase path on
 * /voices/themes (which was reading an empty PICC mirror table).
 *
 * The canonical theme data is in EL — both extracted_quotes (big) and
 * storyteller_quotes (curated) contribute. The /api/picc/themes endpoint
 * does the merge + aggregation server-side; we just consume.
 */

const base = () => process.env.EL_V2_API_URL?.replace(/\/$/, '')
const key = () => process.env.EL_V2_API_KEY

async function call<T>(path: string): Promise<T | null> {
  const b = base()
  const k = key()
  if (!b || !k) return null
  const ctrl = new AbortController()
  const t = setTimeout(() => ctrl.abort(), 15_000)
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
    clearTimeout(t)
  }
}

export interface ThemeAggregate {
  theme: string
  count: number
}

export interface ThemesIndex {
  total_themes: number
  total_tagged: number
  themes: ThemeAggregate[]
}

export async function getThemesIndex(): Promise<ThemesIndex> {
  const r = await call<ThemesIndex>('/api/picc/themes')
  return (
    r ?? {
      total_themes: 0,
      total_tagged: 0,
      themes: [],
    }
  )
}

export interface ThemeQuote {
  id: string
  quote: string
  attribution: string | null
  storyteller_id: string | null
  storyteller_slug: string | null
  photo_url: string | null
  is_elder: boolean
  source: 'extracted' | 'curated'
  recorded_at: string | null
}

export interface ThemeDetail {
  theme: string
  count: number
  quotes: ThemeQuote[]
}

export async function getTheme(theme: string): Promise<ThemeDetail> {
  const path = `/api/picc/themes?theme=${encodeURIComponent(theme)}`
  const r = await call<ThemeDetail>(path)
  return r ?? { theme: theme.toLowerCase(), count: 0, quotes: [] }
}
