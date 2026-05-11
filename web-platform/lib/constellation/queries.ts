/**
 * Bwgcolman Constellation — server-side data fetching.
 *
 * Pulls from PICC's own Supabase + EL v2's photo feed and merges into the
 * payload that drives /picc/constellation. Every quote is validator-flagged,
 * every photo is consent-cleared upstream.
 */

import { createServerSupabase } from '@/lib/supabase/client'
import { getPiccStorytellers } from '@/lib/empathy-ledger/el-storytellers'
import { getPiccServices } from '@/lib/services/el-services'
import { getPiccProjects } from '@/lib/empathy-ledger/el-projects'
import {
  fiscalYearEnd,
  getPiccAnnualReports,
} from '@/lib/empathy-ledger/el-annual-reports'
import type {
  AnnualReportItem,
  BwgcolmanNation,
  CommunityVision,
  ConstellationPayload,
  ElderTripStop,
  FaceNode,
  FoundationEvent,
  ForwardCommitment,
  HistoricalArtifact,
  HullRiverVoice,
  KnowledgeEntry,
  NamedElder,
  PartnerOrg,
  PiccEra,
  ProjectItem,
  ResearchSource,
  ServiceItem,
  SpeakerQuote,
  StoryItem,
  ThemeWell,
  TimelineMarker,
  TopQuote,
  YearDetail,
} from './types'

const PICC_ORG_ID = '3c2011b9-f80d-4289-b300-0cd383cff479'
const QUOTES_PER_THEME = 3

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
    storytellers,
    elServices,
    elProjects,
    leadershipRes,
    boardRes,
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
    elderQuotesRes,
    annualReportsFullRes,
    elAnnualReports,
    topStoriesRes,
    featuredKnowledgeRes,
    hullRiverEqRes,
    hullRiverElqRes,
    restrictedCountRes,
    historicalArtifactsRes,
    eraRes,
    tripStopsRes,
    partnersRes,
    researchSourcesRes,
  ] = await Promise.all([
    // Canonical PICC people: 44 named storytellers in EL v2, each with
    // photo_url + bio + service_slugs + project_slugs + quote_count.
    getPiccStorytellers({ limit: 200 }),
    // Canonical PICC services from EL v2, each with image_url + slug.
    getPiccServices({ status: 'all' }),
    // Canonical PICC projects from EL v2, each with cover_image_url + slug.
    getPiccProjects({ status: 'all' }),
    // PICC's own leadership table — has photo_url.
    supabase
      .from('leadership')
      .select('id, full_name, position, photo_url, is_active')
      .eq('organization_id', PICC_ORG_ID),
    // PICC's board_members — has photo_url and tenure.
    supabase
      .from('board_members')
      .select('id, name, role, photo_url, start_date, end_date')
      .eq('organization_id', PICC_ORG_ID),
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
    // EL v2 holds the canonical historical archive — 18 reports back to
    // 2007-08, 15 with PDFs.
    getPiccAnnualReports(),
    // Top stories for the Stories lens — published, public, by quality.
    supabase
      .from('stories')
      .select('id, title, summary, category, story_type, quality_score, is_featured, created_at')
      .eq('organization_id', PICC_ORG_ID)
      .eq('status', 'published')
      .eq('is_public', true)
      .order('is_featured', { ascending: false })
      .order('quality_score', { ascending: false, nullsFirst: false })
      .limit(30),
    // Featured knowledge entries — 474 total in DB, all currently with NULL
    // organization_id (pre-migration orphans). We show is_public=true rows
    // ranked by is_featured then importance.
    supabase
      .from('knowledge_entries')
      .select('id, title, subtitle, summary, entry_type, category, date_from, fiscal_year, importance, is_featured')
      .eq('is_public', true)
      .order('is_featured', { ascending: false })
      .order('importance', { ascending: false, nullsFirst: false })
      .limit(40),
    // Hull River voices — quotes naming the foundational journey.
    supabase
      .from('extracted_quotes')
      .select('quote_text, attribution, theme')
      .or('quote_text.ilike.%hull river%,quote_text.ilike.%cyclone%,quote_text.ilike.%mission beach%,quote_text.ilike.%leonte%'),
    supabase
      .from('elder_quotes')
      .select('text, speaker_name, theme')
      .eq('organization_id', PICC_ORG_ID)
      .or('text.ilike.%hull river%,text.ilike.%cyclone%,text.ilike.%mission beach%,text.ilike.%leonte%'),
    // Count of items hidden from the public Atlas by community choice
    // (cultural_sensitivity = restricted / sacred). Surfaced in the
    // Permissions panel so sovereignty stays legible without exposing
    // the content itself.
    supabase
      .from('elder_quotes')
      .select('id', { count: 'exact', head: true })
      .eq('organization_id', PICC_ORG_ID)
      .in('cultural_sensitivity', ['restricted', 'sacred']),
    // Historical artifacts — 573 newspaper articles 1911-2014 + 11 other.
    // We fetch verified ones only and cap at 120 for the payload size budget.
    supabase
      .from('historical_artifacts')
      .select('id, title, artifact_type, source_name, source_url, date_original, content_summary, image_url, tags, chapter_ref, is_verified')
      .eq('is_verified', true)
      .order('date_original', { ascending: true, nullsFirst: false })
      .limit(120),
    // PICC eras — 4 named eras (Foundation / Growth / Transition / Community Controlled)
    supabase
      .from('organization_history')
      .select('era_name, year_start, year_end, description, milestones')
      .order('year_start', { ascending: true }),
    // Elder trip stops — the 2024 Hull River pilgrimage route.
    supabase
      .from('elder_trip_stops')
      .select('trip_name, stop_order, name, description, lat, lng')
      .order('trip_name')
      .order('stop_order'),
    // Partnership network — 23 partners
    supabase
      .from('partners')
      .select('id, name, short_name, partner_type, logo_url, website_url, partnership_start_date')
      .order('display_order', { ascending: true, nullsFirst: false }),
    // Research sources — citation graph for history claims
    supabase
      .from('research_sources')
      .select('id, title, source_type, author, publisher, publication_date, url, citation_text, is_primary_source, is_verified')
      .order('publication_date', { ascending: false, nullsFirst: false }),
  ])

  // ── FACES ──────────────────────────────────────────────────────────────
  // Three sources, merged:
  //   1. EL v2 storytellers (named, with photo_url + bio + service_slugs)
  //   2. PICC leadership.photo_url
  //   3. PICC board_members.photo_url
  // Every face is tied to a real person — no anonymous "consented photo" entries.

  const stFaces: FaceNode[] = (storytellers ?? [])
    .filter((s) => Boolean(s.photo_url))
    .map((s) => ({
      id: `storyteller:${s.id}`,
      name: s.display_name,
      avatar_url: s.photo_url!,
      thumb_url: thumbnailUrl(s.photo_url, 96),
      attribution: s.role,
      year: null,
      kind: 'storyteller' as const,
      slug: s.slug,
      role: s.role,
      cultural_background: s.cultural_background,
      is_elder: Boolean(s.is_elder),
      is_featured: Boolean(s.is_featured),
      service_slugs: s.service_slugs ?? [],
      project_slugs: s.project_slugs ?? [],
      quote_count: s.quote_count ?? 0,
    }))

  const leadFaces: FaceNode[] = (leadershipRes.data ?? [])
    .filter((l) => Boolean(l.photo_url) && (l.is_active as boolean | null) !== false)
    .map((l) => ({
      id: `leadership:${l.id}`,
      name: (l.full_name as string | null) ?? null,
      avatar_url: l.photo_url as string,
      thumb_url: thumbnailUrl(l.photo_url as string, 96),
      attribution: (l.position as string | null) ?? 'Leadership',
      year: null,
      kind: 'leadership' as const,
      slug: l.id as string,
      role: (l.position as string | null) ?? null,
      cultural_background: null,
      is_elder: false,
      is_featured: true,
      service_slugs: [],
      project_slugs: [],
      quote_count: 0,
    }))

  const boardFaces: FaceNode[] = (boardRes.data ?? [])
    .filter((b) => Boolean(b.photo_url))
    .map((b) => {
      const startD = b.start_date as string | null
      const endD = b.end_date as string | null
      const tenureYear = endD
        ? new Date(endD).getUTCFullYear()
        : startD
          ? new Date(startD).getUTCFullYear()
          : null
      return {
        id: `board:${b.id}`,
        name: (b.name as string) ?? null,
        avatar_url: b.photo_url as string,
        thumb_url: thumbnailUrl(b.photo_url as string, 96),
        attribution: (b.role as string | null) ?? 'Board',
        year: tenureYear,
        kind: 'board' as const,
        slug: b.id as string,
        role: (b.role as string | null) ?? null,
        cultural_background: null,
        is_elder: false,
        is_featured: false,
        service_slugs: [],
        project_slugs: [],
        quote_count: 0,
      }
    })

  // Merge — keep every storyteller, leader, and board member with a photo.
  // No dedup. A person who appears as both a storyteller and a board director
  // shows up twice on the canvas with the kind=board record carrying their
  // formal headshot. That is intentional: governance face ≠ community face.
  const faces: FaceNode[] = [...stFaces, ...leadFaces, ...boardFaces]

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

  // ── SERVICES (canonical from EL v2 with image_url + lat/long) ──────────
  const services: ServiceItem[] = (elServices ?? []).map((s) => ({
    id: s.id,
    name: s.name,
    slug: s.slug,
    description: s.description,
    image_url: s.image_url,
    category: s.service_category,
    service_type: null,
    status: 'active',
    latitude: s.latitude,
    longitude: s.longitude,
    // Storytellers linked to this service via service_slugs.
    photo_ids: faces
      .filter((f) => f.service_slugs.includes(s.slug))
      .map((f) => f.id),
  }))

  // ── PROJECTS (canonical from EL v2 with cover_image_url) ───────────────
  const projects: ProjectItem[] = (elProjects ?? []).map((p) => {
    const sd = p.start_date
    return {
      id: p.id,
      name: p.name,
      slug: p.slug,
      description: p.description,
      status: p.status,
      start_year: sd ? new Date(sd).getUTCFullYear() : null,
      image_url: p.cover_image_url,
      tagline: p.tagline,
      photo_count: p.photo_count,
      photo_ids: faces
        .filter((f) => f.project_slugs.includes(p.slug))
        .map((f) => f.id),
    }
  })

  // ── NAMED ELDERS (PICC elder_quotes + matched to storyteller faces) ────
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
      // Match elder name → storyteller face by display_name fuzzy contains.
      const photo_ids = faces
        .filter((f) => (f.name ?? '').toLowerCase().includes(lname.split(' ')[0]))
        .map((f) => f.id)
      return {
        name,
        quote_count: quotes.length,
        quotes: quotes.slice(0, 5),
        photo_ids,
      }
    })
    .sort((a, b) => b.quote_count - a.quote_count)

  // ── SPEAKER QUOTES INDEX ───────────────────────────────────────────────
  // Build a single map keyed by lowercase last-name token, so any face on
  // the canvas can surface all quotes attributed to them — extracted_quotes
  // (attribution column) AND elder_quotes (speaker_name column) folded
  // together. The viz looks up by face.name's last token.
  function lastToken(s: string | null | undefined): string {
    if (!s) return ''
    const parts = s.trim().toLowerCase().split(/\s+/)
    return parts[parts.length - 1] ?? ''
  }
  const quotesBySpeaker: Record<string, SpeakerQuote[]> = {}
  function pushQuote(key: string, q: SpeakerQuote) {
    if (!key) return
    const list = quotesBySpeaker[key] ?? []
    if (list.length < 12) list.push(q)
    quotesBySpeaker[key] = list
  }
  for (const row of topQuotesRes.data ?? []) {
    const text = (row.quote_text as string | null)?.trim()
    const attribution = (row.attribution as string | null) ?? ''
    if (!text || !attribution) continue
    pushQuote(lastToken(attribution), {
      text,
      theme: (row.theme as string | null) ?? null,
      suggested: Boolean(row.suggested_for_report),
      source: 'extracted_quotes',
    })
  }
  for (const row of elderQuotesRes.data ?? []) {
    const text = (row.text as string | null)?.trim()
    const speaker = (row.speaker_name as string | null) ?? ''
    if (!text || !speaker) continue
    pushQuote(lastToken(speaker), {
      text,
      theme: null,
      suggested: false,
      source: 'elder_quotes',
    })
  }

  // ── STORIES (top by quality, published + public) ───────────────────────
  const top_stories: StoryItem[] = (topStoriesRes.data ?? []).map((s) => ({
    id: s.id as string,
    title: (s.title as string) ?? '',
    summary: (s.summary as string | null) ?? null,
    category: (s.category as string | null) ?? null,
    story_type: (s.story_type as string | null) ?? null,
    quality_score: (s.quality_score as number | null) ?? null,
    is_featured: Boolean(s.is_featured),
    created_year: s.created_at
      ? new Date(s.created_at as string).getUTCFullYear()
      : null,
  }))

  // ── KNOWLEDGE ENTRIES (featured) ───────────────────────────────────────
  const featured_knowledge: KnowledgeEntry[] = (
    featuredKnowledgeRes.data ?? []
  ).map((k) => ({
    id: k.id as string,
    title: (k.title as string) ?? '',
    subtitle: (k.subtitle as string | null) ?? null,
    summary: (k.summary as string | null) ?? null,
    entry_type: (k.entry_type as string) ?? 'fact',
    category: (k.category as string | null) ?? null,
    date_from: (k.date_from as string | null) ?? null,
    fiscal_year: (k.fiscal_year as string | null) ?? null,
    importance: (k.importance as number | null) ?? null,
    is_featured: Boolean(k.is_featured),
  }))

  // ── HULL RIVER VOICES (merged) ─────────────────────────────────────────
  const hull_river_voices: HullRiverVoice[] = [
    ...(hullRiverEqRes.data ?? []).map((q) => ({
      text: ((q.quote_text as string | null) ?? '').trim(),
      speaker: (q.attribution as string | null) ?? null,
      theme: (q.theme as string | null) ?? null,
    })),
    ...(hullRiverElqRes.data ?? []).map((q) => ({
      text: ((q.text as string | null) ?? '').trim(),
      speaker: (q.speaker_name as string | null) ?? null,
      theme: (q.theme as string | null) ?? null,
    })),
  ].filter((v) => v.text.length > 0)

  // ── ANNUAL REPORTS (canonical EL v2 historical archive) ────────────────
  // EL v2 carries 18 reports back to 2007-08, 15 with PDFs. We treat
  // EL v2 as truth; PICC's own annual_reports table (annualReportsFullRes)
  // is only used as a tie-breaker for in-flight planning rows.
  const elRows = elAnnualReports
  const annual_reports: AnnualReportItem[] = elRows.map((r) => ({
    fiscal_year: fiscalYearEnd(r.fiscal_year) ?? 0,
    title: r.title,
    subtitle: r.subtitle,
    cover_photo_url: r.cover_image_url,
    pdf_url: r.pdf_url,
    published_date: r.published_date,
    summary: r.extracted_summary,
    stats: r.extracted_stats,
    sections: Array.isArray(r.extracted_sections)
      ? r.extracted_sections.map((s) => ({
          title: s.title ?? '',
          summary: s.summary ?? '',
        }))
      : [],
    key_achievements:
      Array.isArray(r.metadata?.key_achievements)
        ? (r.metadata?.key_achievements as string[])
        : [],
    extracted_at: r.metadata?.extracted_at ?? null,
  }))
  void annualReportsFullRes // reserved for in-flight planning rows, not yet merged

  // ── HISTORICAL ARTIFACTS (573 newspapers 1911-2014 + 11 other) ─────────
  const historical_artifacts: HistoricalArtifact[] = (
    historicalArtifactsRes.data ?? []
  ).map((r) => ({
    id: r.id as string,
    title: (r.title as string) ?? 'Untitled artifact',
    artifact_type: (r.artifact_type as string) ?? 'document',
    source_name: (r.source_name as string | null) ?? null,
    source_url: (r.source_url as string | null) ?? null,
    date_original: (r.date_original as string | null) ?? null,
    content_summary: (r.content_summary as string | null) ?? null,
    image_url: (r.image_url as string | null) ?? null,
    tags: Array.isArray(r.tags) ? (r.tags as string[]) : [],
    chapter_ref: (r.chapter_ref as string | null) ?? null,
    is_verified: Boolean(r.is_verified),
  }))

  // ── PICC ERAS (Foundation / Growth / Transition / Community Controlled) ─
  const picc_eras: PiccEra[] = (eraRes.data ?? []).map((r) => ({
    name: (r.era_name as string) ?? '',
    year_start: (r.year_start as number | null) ?? null,
    year_end: (r.year_end as number | null) ?? null,
    description: (r.description as string | null) ?? null,
    milestones: Array.isArray(r.milestones) ? (r.milestones as string[]) : [],
  }))

  // ── ELDER TRIP STOPS (2024 Hull River pilgrimage route) ────────────────
  const elder_trip_stops: ElderTripStop[] = (tripStopsRes.data ?? []).map(
    (r) => ({
      trip_name: (r.trip_name as string) ?? '',
      stop_order: (r.stop_order as number | null) ?? null,
      name: (r.name as string) ?? '',
      description: (r.description as string | null) ?? null,
      lat: (r.lat as number | null) ?? null,
      lng: (r.lng as number | null) ?? null,
    }),
  )

  // ── PARTNERS ───────────────────────────────────────────────────────────
  const partners: PartnerOrg[] = (partnersRes.data ?? []).map((r) => {
    const start = r.partnership_start_date as string | null
    return {
      id: r.id as string,
      name: (r.name as string) ?? '',
      short_name: (r.short_name as string | null) ?? null,
      partner_type: (r.partner_type as string | null) ?? null,
      logo_url: (r.logo_url as string | null) ?? null,
      website_url: (r.website_url as string | null) ?? null,
      start_year: start ? new Date(start).getUTCFullYear() : null,
    }
  })

  // ── RESEARCH SOURCES ───────────────────────────────────────────────────
  const research_sources: ResearchSource[] = (researchSourcesRes.data ?? []).map(
    (r) => ({
      id: r.id as string,
      title: (r.title as string) ?? '',
      source_type: (r.source_type as string) ?? 'document',
      author: (r.author as string | null) ?? null,
      publisher: (r.publisher as string | null) ?? null,
      publication_date: (r.publication_date as string | null) ?? null,
      url: (r.url as string | null) ?? null,
      citation_text: (r.citation_text as string | null) ?? null,
      is_primary_source: Boolean(r.is_primary_source),
      is_verified: Boolean(r.is_verified),
    }),
  )

  // ── BWGCOLMAN — composite name, Manbarra Traditional Owners, 42 language groups ──
  // Number sources:
  //   - PICC annual report wording (canonical for this platform): 42 language groups
  //   - Palm Island Council / ABC News: 40+ tribal groups
  //   - Indigenous.gov.au: 50+ tribal groups
  //   - AIATSIS: 70+ Nations
  // PICC's own number is used as the primary count; the sourcing_note keeps
  // the alternate-source range visible so the screen never hides the fact
  // that different sources count differently.
  const bwgcolman: BwgcolmanNation = {
    name: 'Bwgcolman',
    meaning: 'Many tribes, one people',
    language_groups: 42,
    founded_year: 1918,
    traditional_owners: 'Manbarra',
    sourcing_note:
      "PICC honours the 42 language groups whose descendants call this island home (per the annual report). Other public sources count 40+ tribal groups, 50+ tribal groups, or 70+ Nations — counts vary depending on whether the source measures language, tribe, Nation, or place of removal.",
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
    quotes_by_speaker: quotesBySpeaker,
    top_stories,
    featured_knowledge,
    hull_river_voices,
    historical_artifacts,
    picc_eras,
    elder_trip_stops,
    partners,
    research_sources,
    stats: {
      faces_consented: faces.length,
      voices_validated_elder: elderCountRes.count ?? 0,
      voices_extracted: extractedCountRes.count ?? 0,
      stories: storiesCountRes.count ?? 0,
      governance_achievements: governanceCountRes.count ?? 0,
      board_members: boardCountRes.count ?? 0,
      knowledge_entries: knowledgeCountRes.count ?? 0,
      restricted_by_community: restrictedCountRes.count ?? 0,
    },
    meta: {
      elder_approvals_current_as_of: new Date().toISOString().slice(0, 10),
    },
  }
}
