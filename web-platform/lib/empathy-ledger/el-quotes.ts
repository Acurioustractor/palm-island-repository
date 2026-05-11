/**
 * Empathy Ledger v2 — PICC approved extracted_quotes.
 *
 * EL has 1,048 PICC quotes. After the Elder-authorised bulk release, all
 * pending rows flipped to approval_status='approved'. This fetcher pulls
 * the approved set (now ~1,048) so the Atlas folds them into the
 * quotes_by_speaker map alongside PICC's local mirror.
 *
 * Returns rich metadata the PICC mirror doesn't carry: sentiment,
 * impact_score, emotional_tone, era_label, event_year_min/max,
 * historical_markers.
 */

const EL_REST = 'https://yvnuayzslukamizrlhwb.supabase.co/rest/v1'
const PICC_ORG_ID_EL = '084f851c-72e0-41fb-b5ba-f3088f44862d'

export interface ELApprovedQuote {
  id: string
  quote_text: string
  author_name: string | null
  themes: string[]
  sentiment: string | null
  emotional_tone: string | null
  impact_score: number | null
  category: string | null
  era_label: string | null
  event_year_min: number | null
  event_year_max: number | null
  historical_markers: string[]
  is_featured: boolean
}

function flattenStrings(input: unknown): string[] {
  if (!Array.isArray(input)) return []
  return input
    .map((t) => {
      if (typeof t === 'string') return t
      if (t && typeof t === 'object' && 'name' in t) {
        return String((t as { name: unknown }).name ?? '')
      }
      return ''
    })
    .filter((s): s is string => s.length > 0)
}

export async function getPiccApprovedELQuotes(
  limit = 1200,
): Promise<ELApprovedQuote[]> {
  const key = process.env.EMPATHY_LEDGER_SERVICE_KEY
  if (!key) return []
  const ctrl = new AbortController()
  const timer = setTimeout(() => ctrl.abort(), 20_000)
  try {
    const url =
      `${EL_REST}/extracted_quotes?organization_id=eq.${PICC_ORG_ID_EL}` +
      `&approval_status=eq.approved` +
      `&select=id,quote_text,author_name,themes,sentiment,emotional_tone,impact_score,` +
      `category,era_label,event_year_min,event_year_max,historical_markers,is_featured` +
      `&order=is_featured.desc,impact_score.desc.nullslast` +
      `&limit=${limit}`
    const res = await fetch(url, {
      headers: { apikey: key, Authorization: `Bearer ${key}` },
      cache: 'no-store',
      signal: ctrl.signal,
    })
    if (!res.ok) return []
    const arr = (await res.json()) as Array<Record<string, unknown>>
    return arr.map((r) => ({
      id: r.id as string,
      quote_text: ((r.quote_text as string) ?? '').trim(),
      author_name: (r.author_name as string | null) ?? null,
      themes: flattenStrings(r.themes),
      sentiment: (r.sentiment as string | null) ?? null,
      emotional_tone: (r.emotional_tone as string | null) ?? null,
      impact_score: (r.impact_score as number | null) ?? null,
      category: (r.category as string | null) ?? null,
      era_label: (r.era_label as string | null) ?? null,
      event_year_min: (r.event_year_min as number | null) ?? null,
      event_year_max: (r.event_year_max as number | null) ?? null,
      historical_markers: flattenStrings(r.historical_markers),
      is_featured: Boolean(r.is_featured),
    }))
  } catch {
    return []
  } finally {
    clearTimeout(timer)
  }
}
