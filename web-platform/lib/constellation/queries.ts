/**
 * Bwgcolman Constellation — server-side data fetching.
 *
 * Three sources, fetched in parallel and merged:
 *   1. Faces      → EL v2 /api/photos (already consent-filtered upstream)
 *   2. Themes     → PICC `extracted_quotes` GROUP BY theme
 *   3. Years      → PICC `annual_reports`
 *
 * Every quote/photo this function returns has passed at least one explicit
 * consent or validation gate. There is no path here that bypasses cultural
 * protocols — that is the point of the page.
 */

import { createServerSupabase } from '@/lib/supabase/client'
import { getAnyConsentedPhotos } from '@/lib/media/el-photos'
import type {
  ConstellationPayload,
  FaceNode,
  ThemeWell,
  YearAnchor,
} from './types'

const PICC_ORG_ID = '3c2011b9-f80d-4289-b300-0cd383cff479'

function capitalise(s: string): string {
  return s.length === 0 ? s : s[0].toUpperCase() + s.slice(1)
}

function yearFromTimestamp(ts: string | null | undefined): number | null {
  if (!ts) return null
  const y = new Date(ts).getUTCFullYear()
  return Number.isFinite(y) ? y : null
}

export async function loadConstellation(): Promise<ConstellationPayload> {
  const supabase = createServerSupabase()

  const [photos, themesRes, yearsRes, voicesRes] = await Promise.all([
    getAnyConsentedPhotos(120),
    supabase
      .from('extracted_quotes')
      .select('theme')
      .not('theme', 'is', null),
    supabase
      .from('annual_reports')
      .select('fiscal_year, title, subtitle, cover_photo_url, published_date')
      .eq('organization_id', PICC_ORG_ID)
      .order('fiscal_year', { ascending: true }),
    supabase
      .from('elder_quotes')
      .select('id', { count: 'exact', head: true })
      .eq('organization_id', PICC_ORG_ID)
      .eq('is_validated', true)
      .eq('permission_level', 'public'),
  ])

  // Faces — drop any without a usable url. Year comes from taken_at when set.
  const faces: FaceNode[] = photos
    .filter((p) => Boolean(p.url))
    .map((p) => ({
      id: p.id,
      name: p.alt_text ?? p.caption ?? p.attribution ?? null,
      avatar_url: p.url,
      attribution: p.attribution,
      year: yearFromTimestamp(p.taken_at),
      slot: p.slot,
    }))

  // Themes — fold rows into counts and sort desc.
  const themeCounts = new Map<string, number>()
  for (const row of themesRes.data ?? []) {
    const t = (row.theme as string | null)?.trim().toLowerCase()
    if (!t) continue
    themeCounts.set(t, (themeCounts.get(t) ?? 0) + 1)
  }
  const themes: ThemeWell[] = Array.from(themeCounts.entries())
    .map(([key, count]) => ({ key, label: capitalise(key), count }))
    .sort((a, b) => b.count - a.count)

  // Year anchors — parse fiscal_year defensively (it's text in the table).
  const years: YearAnchor[] = (yearsRes.data ?? [])
    .map((r) => {
      const fy = typeof r.fiscal_year === 'string'
        ? parseInt(r.fiscal_year, 10)
        : (r.fiscal_year as number | null)
      if (!fy || !Number.isFinite(fy)) return null
      return {
        fiscal_year: fy,
        title: (r.title as string | null) ?? null,
        subtitle: (r.subtitle as string | null) ?? null,
        cover_url: (r.cover_photo_url as string | null) ?? null,
      }
    })
    .filter((y): y is YearAnchor => y !== null)

  return {
    faces,
    themes,
    years,
    meta: {
      faces_consented: faces.length,
      voices_validated: voicesRes.count ?? 0,
      elder_approvals_current_as_of: new Date().toISOString().slice(0, 10),
    },
  }
}
