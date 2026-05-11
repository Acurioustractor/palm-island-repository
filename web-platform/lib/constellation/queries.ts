/**
 * Bwgcolman Constellation — server-side data fetching.
 *
 * Pulls from PICC's own Supabase + EL v2's photo feed and merges into the
 * payload that drives /picc/constellation. Every quote is validator-flagged,
 * every photo is consent-cleared upstream.
 */

import { createServerSupabase } from '@/lib/supabase/client'
import { getAnyConsentedPhotos } from '@/lib/media/el-photos'
import type {
  AnnualReportItem,
  BwgcolmanNation,
  CommunityVision,
  ConstellationPayload,
  FaceNode,
  FoundationEvent,
  ForwardCommitment,
  NamedElder,
  ProjectItem,
  ServiceItem,
  ThemeWell,
  TimelineMarker,
  TopQuote,
  YearDetail,
} from './types'

const PICC_ORG_ID = '3c2011b9-f80d-4289-b300-0cd383cff479'
const QUOTES_PER_THEME = 3
// Default face count is bounded for a snappy first paint. The viz can
// request more on demand via a "show all" control.
const FACE_LIMIT = 80

// Forward commitments are sourced verbatim from
// PICC-Narelle-Rachel-Workshop/PICC-20-Year-Launchpad-Plan.md so the workshop
// canvas + the constellation tell the same story.
const FORWARD_COMMITMENTS: ForwardCommitment[] = [
  {
    target_year: 2028,
    title: 'Aged care on Palm',
    body:
      'A dedicated aged care facility so our Elders never have to leave Country.',
  },
  {
    target_year: 2030,
    title: 'Bwgcolman Way expanded',
    body:
      'Delegated Authority extended beyond child safety — into health and justice.',
  },
  {
    target_year: 2045,
    title: 'Sovereign story archive',
    body: 'Every Palm Island story captured, consented, and sovereign by 2045.',
  },
]

function capitalise(s: string): string {
  return s.length === 0 ? s : s[0].toUpperCase() + s.slice(1)
}

function yearFromTimestamp(ts: string | null | undefined): number | null {
  if (!ts) return null
  const y = new Date(ts).getUTCFullYear()
  return Number.isFinite(y) ? y : null
}

function inferElder(slot: string | null, alt: string | null): boolean {
  const text = `${slot ?? ''} ${alt ?? ''}`.toLowerCase()
  return /\belder|aunt(y|ie)|uncle\b/.test(text)
}

/**
 * Build a small Supabase-Storage transform URL so the constellation pulls
 * 80 × 64-px thumbnails instead of 80 full-res photos. Cuts initial face-
 * paint cost by ~50× vs. full URLs. Non-Supabase URLs are returned as-is.
 */
function thumbnailUrl(url: string | null, size = 80): string {
  if (!url) return ''
  if (!url.includes('/storage/v1/object/')) return url
  const transformed = url.replace(
    '/storage/v1/object/',
    '/storage/v1/render/image/',
  )
  const sep = transformed.includes('?') ? '&' : '?'
  return `${transformed}${sep}width=${size}&height=${size}&resize=cover&quality=70`
}

export async function loadConstellation(): Promise<ConstellationPayload> {
  const supabase = createServerSupabase()

  const [
    photos,
    themeRowsRes,
    topQuotesRes,
    annualReportsRes,
    annualFinancialsRes,
    timelineRes,
    foundationRes,
    governanceRes,
    visionsRes,
    elderCountRes,
    extractedCountRes,
    storiesCountRes,
    governanceCountRes,
    boardCountRes,
    knowledgeCountRes,
    servicesRes,
    projectsRes,
    elderQuotesRes,
    annualReportsFullRes,
  ] = await Promise.all([
    getAnyConsentedPhotos(FACE_LIMIT),
    supabase.from('extracted_quotes').select('theme').not('theme', 'is', null),
    supabase
      .from('extracted_quotes')
      .select('theme, quote_text, attribution, suggested_for_report, display_order')
      .not('theme', 'is', null)
      .not('quote_text', 'is', null)
      .order('suggested_for_report', { ascending: false })
      .order('display_order', { ascending: true, nullsFirst: false })
      .limit(500),
    supabase
      .from('annual_reports')
      .select('fiscal_year, title, subtitle, cover_photo_url')
      .eq('organization_id', PICC_ORG_ID)
      .order('fiscal_year', { ascending: true }),
    supabase
      .from('annual_financials')
      .select('fiscal_year, total_income, audited')
      .eq('organization_id', PICC_ORG_ID)
      .order('fiscal_year', { ascending: true }),
    supabase
      .from('timeline_events')
      .select('event_date, title, event_type, significance, is_featured, image_url')
      .gte('event_date', '2008-01-01')
      .order('event_date', { ascending: true }),
    supabase
      .from('timeline_events')
      .select('event_date, title, description, event_type, significance')
      .lt('event_date', '2008-01-01')
      .gte('significance', 7)
      .order('event_date', { ascending: true }),
    supabase
      .from('governance_achievements')
      .select('fiscal_year, achievement_text')
      .eq('organization_id', PICC_ORG_ID)
      .order('fiscal_year', { ascending: true })
      .order('display_order', { ascending: true, nullsFirst: false }),
    supabase
      .from('community_visions')
      .select('vision_text, author_name, author_role, category')
      .eq('is_approved', true)
      .order('created_at', { ascending: false }),
    supabase
      .from('elder_quotes')
      .select('id', { count: 'exact', head: true })
      .eq('organization_id', PICC_ORG_ID)
      .eq('is_validated', true)
      .eq('permission_level', 'public'),
    supabase.from('extracted_quotes').select('id', { count: 'exact', head: true }),
    supabase
      .from('stories')
      .select('id', { count: 'exact', head: true })
      .eq('organization_id', PICC_ORG_ID),
    supabase
      .from('governance_achievements')
      .select('id', { count: 'exact', head: true })
      .eq('organization_id', PICC_ORG_ID),
    supabase
      .from('board_members')
      .select('id', { count: 'exact', head: true })
      .eq('organization_id', PICC_ORG_ID),
    supabase.from('knowledge_entries').select('id', { count: 'exact', head: true }),
    supabase
      .from('organization_services')
      .select('id, name, slug, description, start_date')
      .eq('is_active', true)
      .order('name', { ascending: true }),
    supabase
      .from('projects')
      .select('id, name, slug, description, status, start_date')
      .order('start_date', { ascending: false, nullsFirst: false }),
    supabase
      .from('elder_quotes')
      .select('speaker_name, text')
      .eq('organization_id', PICC_ORG_ID)
      .eq('is_validated', true)
      .eq('permission_level', 'public')
      .not('speaker_name', 'is', null),
    supabase
      .from('annual_reports')
      .select('fiscal_year, title, subtitle, cover_photo_url, pdf_url, published_date')
      .eq('organization_id', PICC_ORG_ID)
      .order('fiscal_year', { ascending: false }),
  ])

  // ── FACES ──────────────────────────────────────────────────────────────
  const faces: FaceNode[] = photos
    .filter((p) => Boolean(p.url))
    .map((p) => ({
      id: p.id,
      name: p.alt_text ?? p.caption ?? p.attribution ?? null,
      avatar_url: p.url,
      // Prefer EL v2's pre-built thumbnail when present, else generate a
      // Supabase Storage transform URL on the fly (80 × 80, quality 70) so
      // the SVG paints small images instead of full-res ones.
      thumb_url: p.thumbnail_url ?? thumbnailUrl(p.url),
      attribution: p.attribution,
      year: yearFromTimestamp(p.taken_at),
      slot: p.slot,
      is_elder: inferElder(p.slot, p.alt_text),
    }))

  // ── THEMES (count + top quotes) ────────────────────────────────────────
  const themeCounts = new Map<string, number>()
  for (const row of themeRowsRes.data ?? []) {
    const t = (row.theme as string | null)?.trim().toLowerCase()
    if (!t) continue
    themeCounts.set(t, (themeCounts.get(t) ?? 0) + 1)
  }

  const quotesByTheme = new Map<string, TopQuote[]>()
  for (const row of topQuotesRes.data ?? []) {
    const theme = (row.theme as string | null)?.trim().toLowerCase()
    const text = (row.quote_text as string | null)?.trim()
    if (!theme || !text) continue
    const existing = quotesByTheme.get(theme) ?? []
    if (existing.length >= QUOTES_PER_THEME) continue
    existing.push({
      text,
      attribution: (row.attribution as string | null) ?? null,
      suggested: Boolean(row.suggested_for_report),
    })
    quotesByTheme.set(theme, existing)
  }

  const themes: ThemeWell[] = Array.from(themeCounts.entries())
    .map(([key, count]) => ({
      key,
      label: capitalise(key),
      count,
      top_quotes: quotesByTheme.get(key) ?? [],
    }))
    .sort((a, b) => b.count - a.count)

  // ── YEARS ──────────────────────────────────────────────────────────────
  const reportsByYear = new Map<number, { title: string | null; subtitle: string | null; cover_url: string | null }>()
  for (const r of annualReportsRes.data ?? []) {
    const fy =
      typeof r.fiscal_year === 'string'
        ? parseInt(r.fiscal_year, 10)
        : (r.fiscal_year as number | null)
    if (!fy) continue
    reportsByYear.set(fy, {
      title: (r.title as string | null) ?? null,
      subtitle: (r.subtitle as string | null) ?? null,
      cover_url: (r.cover_photo_url as string | null) ?? null,
    })
  }

  const eventsByYear = new Map<number, TimelineMarker[]>()
  for (const e of timelineRes.data ?? []) {
    const date = e.event_date as string | null
    if (!date) continue
    const y = new Date(date).getUTCFullYear()
    const list = eventsByYear.get(y) ?? []
    list.push({
      year: y,
      title: (e.title as string) ?? '',
      significance: (e.significance as number | null) ?? 5,
      event_type: (e.event_type as string | null) ?? null,
      is_featured: Boolean(e.is_featured),
      image_url: (e.image_url as string | null) ?? null,
    })
    eventsByYear.set(y, list)
  }

  const achievementsByYear = new Map<number, string[]>()
  for (const a of governanceRes.data ?? []) {
    const fy =
      typeof a.fiscal_year === 'string'
        ? parseInt(a.fiscal_year, 10)
        : (a.fiscal_year as number | null)
    if (!fy) continue
    const list = achievementsByYear.get(fy) ?? []
    if (list.length < 5) {
      const text = (a.achievement_text as string | null)?.trim()
      if (text) list.push(text)
    }
    achievementsByYear.set(fy, list)
  }

  const yearSet = new Set<number>()
  for (const r of annualFinancialsRes.data ?? []) {
    if (r.fiscal_year != null) yearSet.add(r.fiscal_year as number)
  }
  reportsByYear.forEach((_v, y) => yearSet.add(y))
  eventsByYear.forEach((_v, y) => yearSet.add(y))
  achievementsByYear.forEach((_v, y) => yearSet.add(y))

  const financialsByYear = new Map<number, { revenue: number | null; audited: boolean }>()
  for (const r of annualFinancialsRes.data ?? []) {
    if (r.fiscal_year == null) continue
    const income =
      r.total_income == null ? null : Number(r.total_income as unknown as string)
    financialsByYear.set(r.fiscal_year as number, {
      revenue: Number.isFinite(income) ? (income as number) : null,
      audited: Boolean(r.audited),
    })
  }

  const years: YearDetail[] = Array.from(yearSet)
    .sort((a, b) => a - b)
    .map((fy) => {
      const fin = financialsByYear.get(fy)
      const rep = reportsByYear.get(fy)
      const evs = (eventsByYear.get(fy) ?? []).sort(
        (a, b) => b.significance - a.significance,
      )
      return {
        fiscal_year: fy,
        revenue: fin?.revenue ?? null,
        audited: fin?.audited ?? false,
        report_title: rep?.title ?? null,
        report_subtitle: rep?.subtitle ?? null,
        report_cover_url: rep?.cover_url ?? null,
        events: evs.slice(0, 5),
        achievements: achievementsByYear.get(fy) ?? [],
      }
    })

  // ── FOUNDATION (pre-2008 anchors) ──────────────────────────────────────
  const foundation: FoundationEvent[] = (foundationRes.data ?? []).map((e) => {
    const date = e.event_date as string | null
    const y = date ? new Date(date).getUTCFullYear() : 0
    return {
      year: y,
      title: (e.title as string) ?? '',
      description: (e.description as string | null) ?? null,
      event_type: (e.event_type as string | null) ?? null,
      significance: (e.significance as number | null) ?? 7,
    }
  })

  // ── VISIONS ────────────────────────────────────────────────────────────
  const visions: CommunityVision[] = (visionsRes.data ?? []).map((v) => ({
    text: (v.vision_text as string | null) ?? '',
    author_name: (v.author_name as string | null) ?? null,
    author_role: (v.author_role as string | null) ?? null,
    category: (v.category as string | null) ?? null,
  }))

  // Helper: which face ids match a given slug/name pattern. Builds a tiny
  // index up front so each service / project / elder is an O(n) scan, not
  // an O(services × faces) blowup.
  function facesMatching(predicate: (face: FaceNode) => boolean): string[] {
    const out: string[] = []
    for (const f of faces) if (predicate(f)) out.push(f.id)
    return out
  }

  // ── SERVICES ───────────────────────────────────────────────────────────
  const services: ServiceItem[] = (servicesRes.data ?? []).map((s) => {
    const sd = s.start_date as string | null
    const slug = (s.slug as string | null) ?? null
    return {
      id: s.id as string,
      name: (s.name as string) ?? '',
      slug,
      description: (s.description as string | null) ?? null,
      start_year: sd ? new Date(sd).getUTCFullYear() : null,
      photo_ids: slug
        ? facesMatching((f) => Boolean(f.slot?.includes(slug)))
        : [],
    }
  })

  // ── PROJECTS ───────────────────────────────────────────────────────────
  const projects: ProjectItem[] = (projectsRes.data ?? []).map((p) => {
    const sd = p.start_date as string | null
    const slug = (p.slug as string | null) ?? null
    return {
      id: p.id as string,
      name: (p.name as string) ?? '',
      slug,
      description: (p.description as string | null) ?? null,
      status: (p.status as string | null) ?? null,
      start_year: sd ? new Date(sd).getUTCFullYear() : null,
      photo_ids: slug
        ? facesMatching((f) => Boolean(f.slot?.includes(slug)))
        : [],
    }
  })

  // ── NAMED ELDERS (top voices) ──────────────────────────────────────────
  const elderBuckets = new Map<string, string[]>()
  for (const row of elderQuotesRes.data ?? []) {
    const name = (row.speaker_name as string | null)?.trim()
    const text = (row.text as string | null)?.trim()
    if (!name || !text) continue
    const list = elderBuckets.get(name) ?? []
    list.push(text)
    elderBuckets.set(name, list)
  }
  const named_elders: NamedElder[] = Array.from(elderBuckets.entries())
    .map(([name, quotes]) => {
      const lname = name.toLowerCase()
      const photo_ids = facesMatching((f) => {
        const blob = `${f.name ?? ''} ${f.attribution ?? ''} ${f.slot ?? ''}`.toLowerCase()
        return blob.includes(lname)
      })
      return {
        name,
        quote_count: quotes.length,
        quotes: quotes.slice(0, 5),
        photo_ids,
      }
    })
    .sort((a, b) => b.quote_count - a.quote_count)

  // ── ANNUAL REPORTS (full list) ─────────────────────────────────────────
  const annual_reports: AnnualReportItem[] = (annualReportsFullRes.data ?? []).map(
    (r) => {
      const fy =
        typeof r.fiscal_year === 'string'
          ? parseInt(r.fiscal_year, 10)
          : (r.fiscal_year as number | null)
      return {
        fiscal_year: fy ?? 0,
        title: (r.title as string | null) ?? null,
        subtitle: (r.subtitle as string | null) ?? null,
        cover_photo_url: (r.cover_photo_url as string | null) ?? null,
        pdf_url: (r.pdf_url as string | null) ?? null,
        published_date: (r.published_date as string | null) ?? null,
      }
    },
  )

  // ── BWGCOLMAN — the composite name and the 42 language groups ──────────
  const bwgcolman: BwgcolmanNation = {
    name: 'Bwgcolman',
    meaning: 'Many tribes — 42 language groups brought together',
    language_groups: 42,
    founded_year: 1918,
  }

  return {
    faces,
    themes,
    years,
    foundation,
    visions,
    commitments: FORWARD_COMMITMENTS,
    services,
    projects,
    named_elders,
    annual_reports,
    bwgcolman,
    stats: {
      faces_consented: faces.length,
      voices_validated_elder: elderCountRes.count ?? 0,
      voices_extracted: extractedCountRes.count ?? 0,
      stories: storiesCountRes.count ?? 0,
      governance_achievements: governanceCountRes.count ?? 0,
      board_members: boardCountRes.count ?? 0,
      knowledge_entries: knowledgeCountRes.count ?? 0,
    },
    meta: {
      elder_approvals_current_as_of: new Date().toISOString().slice(0, 10),
    },
  }
}
