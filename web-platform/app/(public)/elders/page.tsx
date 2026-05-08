import EldersPageClient from '@/components/elders/EldersPageClient'
import { createServerSupabase } from '@/lib/supabase/client'
import { cleanupQuoteText, isLikelyJunkQuote, pickBestQuotes } from '@/lib/transcripts/quotable'
import { getELQuotes, findQuotesForPerson, type ELQuote } from '@/lib/empathy-ledger/el-server'
import { getPiccElders } from '@/lib/empathy-ledger/el-storytellers'

export const dynamic = 'force-dynamic'
type ElderProfileRow = {
  id: string
  full_name: string
  preferred_name: string | null
  profile_image_url: string | null
  bio: string | null
  storyteller_type: string | null
  location: string | null
  community_role: string | null
  traditional_country: string | null
  language_group: string | null
  show_in_directory: boolean | null
  profile_visibility: string | null
  is_elder: boolean | null
}

type QuoteRow = {
  id: string
  quote_text: string
  attribution: string | null
  context: string | null
  theme: string | null
  sentiment: string | null
  impact_area: string | null
  is_validated: boolean
  suggested_for_report: boolean
  photo_url: string | null
  profile_id: string | null
  created_at: string
}

type StoryRow = {
  id: string
  title: string
  excerpt: string | null
  created_at: string
  storyteller_id: string
}

type MediaRow = {
  id: string
  title: string | null
  description: string | null
  public_url: string
  file_type: string
  tags: string[] | null
  is_featured: boolean | null
  is_public: boolean | null
  created_at: string
  metadata: any
  deleted_at: string | null
}

type ProjectRow = { id: string; name: string; slug: string }

type InterviewRow = {
  id: string
  storyteller_id: string | null
  interview_title: string | null
  status: string | null
  key_themes: string[] | null
  created_at: string | null
}

type EldersInsights = {
  stats: {
    totalElders: number
    eldersWithQuotes: number
    eldersWithInterviews: number
    totalQuotes: number
    validatedQuotes: number
    totalInterviews: number
  }
  themes: Array<{
    name: string
    count: number
    fromQuotes: number
    fromInterviews: number
    sampleQuote: { id: string; text: string; elderName: string | null } | null
  }>
  highlightedQuotes: Array<{
    id: string
    text: string
    theme: string | null
    elderName: string | null
    createdAt: string
  }>
}

import { ogMeta } from '@/lib/seo/og'

export const metadata = ogMeta({
  title: 'Our Elders — Palm Island Community Company',
  description:
    'Meet the Palm Island Community Company Elders — voices of culture, history, and guidance.',
  path: '/elders',
})

function displayName(p: { preferred_name?: string | null; full_name: string }) {
  return (p.preferred_name || p.full_name || '').trim()
}

function safeText(input: unknown) {
  const s = String(input ?? '').trim()
  return s || null
}

function formatThemeLabel(input: unknown) {
  const s = safeText(input)
  if (!s) return 'Community voice'
  return s
    .replace(/[_-]+/g, ' ')
    .split(/\s+/)
    .filter(Boolean)
    .map((word) => word.charAt(0).toUpperCase() + word.slice(1))
    .join(' ')
}

export default async function EldersPage() {
  const supabase = createServerSupabase() as any

  let elders: ElderProfileRow[] = []
  let quotes: QuoteRow[] = []
  let stories: StoryRow[] = []
  let interviews: InterviewRow[] = []
  let tripImages: MediaRow[] = []
  let tripVideo: MediaRow | null = null
  let eldersTripProject: ProjectRow | null = null
  let heroMedia: { type: 'image' | 'video'; url: string; title: string | null } | null = null
  let heroRow: { id: string; title: string | null; public_url: string; file_type: 'image' | 'video' } | null = null
  let tripStoryHref = '/stories/6cb23cd9-c060-452a-be40-910dea4333aa'

  try {
    const { data } = await supabase
      .from('profiles')
      .select(
        'id, full_name, preferred_name, profile_image_url, bio, storyteller_type, location, community_role, traditional_country, language_group, show_in_directory, profile_visibility, is_elder'
      )
      .eq('is_elder', true)
      .eq('show_in_directory', true)
      .order('full_name', { ascending: true })
      .limit(200)
    elders = Array.isArray(data) ? (data as ElderProfileRow[]) : []
    elders = elders.filter((e) => String(e.profile_visibility || '').toLowerCase() !== 'private')
  } catch {
    elders = []
  }

  // Merge in canonical EL elders so anyone the EL admin has flagged
  // is_elder=true also surfaces here, even if PICC's profiles table
  // hasn't been backfilled. Dedup by display_name (case-insensitive).
  try {
    const elElders = await getPiccElders()
    const seen = new Set(
      elders.map((e) => (e.full_name || e.preferred_name || '').trim().toLowerCase()).filter(Boolean),
    )
    for (const el of elElders) {
      const key = (el.display_name || '').trim().toLowerCase()
      if (!key || seen.has(key)) continue
      seen.add(key)
      elders.push({
        id: el.id,
        full_name: el.display_name,
        preferred_name: null,
        profile_image_url: el.photo_url,
        bio: el.bio,
        storyteller_type: el.is_elder ? 'elder' : null,
        location: el.location,
        community_role: 'Elder',
        traditional_country: el.cultural_background,
        language_group: null,
        show_in_directory: true,
        profile_visibility: 'public',
        is_elder: true,
      })
    }
    elders.sort((a, b) => (a.full_name || '').localeCompare(b.full_name || ''))
  } catch {
    /* canonical EL fetch is best-effort — keep PICC-only list */
  }

  // Optional hero background media for the Elders page
  try {
    const base = supabase
      .from('media_files')
      .select('id, title, public_url, file_type, tags, is_featured, is_public, created_at, deleted_at')
      .eq('is_public', true)
      .is('deleted_at', null)
      .contains('tags', ['page:elders', 'hero'])
      .order('is_featured', { ascending: false })
      .order('created_at', { ascending: false })
      .limit(1)

    const { data } = await base
    const first = Array.isArray(data) ? data[0] : null
    if (first?.public_url && (first.file_type === 'image' || first.file_type === 'video')) {
      heroRow = { id: first.id, title: first.title ?? null, public_url: first.public_url, file_type: first.file_type }
      heroMedia = { type: first.file_type, url: first.public_url, title: first.title ?? null }
    }
  } catch {
    heroMedia = null
    heroRow = null
  }

  if (!heroMedia) {
    try {
      const { data } = await supabase
        .from('media_files')
        .select('id, title, public_url, file_type, tags, is_featured, is_public, created_at, deleted_at')
        .eq('is_public', true)
        .is('deleted_at', null)
        .contains('tags', ['page:elders'])
        .order('is_featured', { ascending: false })
        .order('created_at', { ascending: false })
        .limit(1)
      const first = Array.isArray(data) ? data[0] : null
      if (first?.public_url && (first.file_type === 'image' || first.file_type === 'video')) {
        heroRow = { id: first.id, title: first.title ?? null, public_url: first.public_url, file_type: first.file_type }
        heroMedia = { type: first.file_type, url: first.public_url, title: first.title ?? null }
      }
    } catch {
      heroMedia = null
      heroRow = null
    }
  }

  const elderIds = elders.map((e) => e.id).filter(Boolean)

  if (elderIds.length > 0) {
    try {
      const { data } = await supabase
        .from('interviews')
        .select('id, storyteller_id, interview_title, status, key_themes, created_at')
        .in('storyteller_id', elderIds)
        .order('created_at', { ascending: false })
        .limit(400)
      interviews = Array.isArray(data) ? (data as InterviewRow[]) : []
    } catch {
      interviews = []
    }

    try {
      const { data } = await supabase
        .from('extracted_quotes')
        .select(
          'id, quote_text, attribution, context, theme, sentiment, impact_area, is_validated, suggested_for_report, photo_url, profile_id, created_at'
        )
        .in('profile_id', elderIds)
        // Prefer validated quotes, but fall back to "suggested_for_report" to ensure each Elder can
        // have at least one good candidate quote for their card while validation is in progress.
        .or('is_validated.eq.true,suggested_for_report.eq.true')
        .order('is_validated', { ascending: false })
        .order('suggested_for_report', { ascending: false })
        .order('created_at', { ascending: false })
        .limit(800)

      const raw = Array.isArray(data) ? (data as QuoteRow[]) : []
      quotes = raw
        .map((q) => ({ ...q, quote_text: cleanupQuoteText(q.quote_text || '') }))
        .filter((q) => q.profile_id && q.quote_text && !isLikelyJunkQuote(q.quote_text))
    } catch {
      quotes = []
    }

    try {
      const { data } = await supabase
        .from('stories')
        .select('id, title, excerpt, created_at, storyteller_id')
        .in('storyteller_id', elderIds)
        .eq('is_public', true)
        .order('created_at', { ascending: false })
        .limit(400)
      stories = Array.isArray(data) ? (data as StoryRow[]) : []
    } catch {
      stories = []
    }
  }

  // Elders Trips media
  try {
    const { data: project } = await supabase
      .from('projects')
      .select('id, name, slug')
      .eq('slug', 'elders-trips')
      .maybeSingle()
    if (project?.id) eldersTripProject = project as ProjectRow
  } catch {
    eldersTripProject = null
  }

  try {
    // Prefer a featured external video tagged to the project
    const base = supabase
      .from('media_files')
      .select(
        'id, title, description, public_url, file_type, tags, is_featured, is_public, created_at, metadata, deleted_at'
      )
      .eq('file_type', 'video')
      .eq('is_public', true)
      .is('deleted_at', null)
      .contains('tags', ['external-video', 'project:elders-trips', 'platform:descript'])
      .order('is_featured', { ascending: false })
      .order('created_at', { ascending: false })
      .limit(1)

    const { data } = await base
    const first = Array.isArray(data) ? (data[0] as MediaRow) : null
    tripVideo = first || null
  } catch {
    tripVideo = null
  }

  if (!tripVideo) {
    try {
      const { data } = await supabase
        .from('media_files')
        .select(
          'id, title, description, public_url, file_type, tags, is_featured, is_public, created_at, metadata, deleted_at'
        )
        .eq('file_type', 'video')
        .eq('is_public', true)
        .is('deleted_at', null)
        .contains('tags', ['external-video', 'project:elders-trips'])
        .order('is_featured', { ascending: false })
        .order('created_at', { ascending: false })
        .limit(1)
      tripVideo = Array.isArray(data) ? ((data[0] as MediaRow) || null) : null
    } catch {
      tripVideo = null
    }
  }

  if (!tripVideo) {
    try {
      const { data } = await supabase
        .from('media_files')
        .select(
          'id, title, description, public_url, file_type, tags, is_featured, is_public, created_at, metadata, deleted_at'
        )
        .eq('file_type', 'video')
        .eq('is_public', true)
        .is('deleted_at', null)
        .contains('tags', ['external-video'])
        .order('is_featured', { ascending: false })
        .order('created_at', { ascending: false })
        .limit(1)
      tripVideo = Array.isArray(data) ? ((data[0] as MediaRow) || null) : null
    } catch {
      tripVideo = null
    }
  }

  const MAX_TRIP_IMAGES = 200
  const tripImagesById = new Map<string, MediaRow>()

  const mergeTripImages = (rows: MediaRow[]) => {
    for (const row of rows) {
      if (row?.id) {
        tripImagesById.set(row.id, row)
      }
    }
  }

  if (eldersTripProject?.id) {
    try {
      const { data } = await supabase
        .from('media_files')
        .select(
          'id, title, description, public_url, file_type, tags, is_featured, is_public, created_at, metadata, deleted_at'
        )
        .eq('file_type', 'image')
        .eq('project_id', eldersTripProject.id)
        .eq('is_public', true)
        .is('deleted_at', null)
        .order('created_at', { ascending: false })
        .limit(MAX_TRIP_IMAGES)
      mergeTripImages(Array.isArray(data) ? (data as MediaRow[]) : [])
    } catch {
      // Ignore and fall back to tag-based query below.
    }
  }

  try {
    const { data } = await supabase
      .from('media_files')
      .select(
        'id, title, description, public_url, file_type, tags, is_featured, is_public, created_at, metadata, deleted_at'
      )
      .eq('file_type', 'image')
      .eq('is_public', true)
      .is('deleted_at', null)
      .contains('tags', ['project:elders-trips'])
      .order('created_at', { ascending: false })
      .limit(MAX_TRIP_IMAGES)
    mergeTripImages(Array.isArray(data) ? (data as MediaRow[]) : [])
  } catch {
    // Ignore tag-based errors and rely on project-based results if available.
  }

  tripImages = Array.from(tripImagesById.values()).sort((a, b) =>
    String(b.created_at).localeCompare(String(a.created_at))
  )

  // If no explicit hero is set, fall back to the newest Elders Trip photo.
  if (!heroMedia && tripImages.length > 0) {
    const first = tripImages[0]
    if (first?.public_url) {
      heroRow = { id: first.id, title: first.title ?? null, public_url: first.public_url, file_type: 'image' }
      heroMedia = { type: 'image', url: first.public_url, title: first.title ?? null }
    }
  }

  try {
    const { data } = await supabase
      .from('stories')
      .select('id, tags, is_public, created_at')
      .eq('is_public', true)
      .contains('tags', ['elders-trip'])
      .order('created_at', { ascending: false })
      .limit(1)
    const first = Array.isArray(data) ? data[0] : null
    if (first?.id) {
      tripStoryHref = `/stories/${first.id}`
    }
  } catch {
    // Keep the default direct link if the tag query fails.
  }

  // ─── Augment from Empathy Ledger (sovereign source of truth) ───
  // Pull all PICC quotes from EL, then match each elder to their voices by name.
  let elQuotes: ELQuote[] = []
  try {
    elQuotes = await getELQuotes({ limit: 1500 })
  } catch {
    elQuotes = []
  }

  // Convert EL quotes into the local QuoteRow shape so the page can render them
  // alongside the existing PICC quotes. Match each elder by name.
  const elQuotesAsLocal: QuoteRow[] = []
  for (const elder of elders) {
    const elderName = displayName({ preferred_name: elder.preferred_name, full_name: elder.full_name })
    const matched = findQuotesForPerson(elQuotes, elderName)
    for (const eq of matched) {
      const cleaned = cleanupQuoteText(eq.quote_text || '')
      if (!cleaned || isLikelyJunkQuote(cleaned)) continue
      elQuotesAsLocal.push({
        id: `el-${eq.id}`,
        quote_text: cleaned,
        attribution: eq.author_name,
        context: null,
        theme: Array.isArray(eq.themes) && eq.themes.length > 0 ? eq.themes[0] : null,
        sentiment: eq.sentiment,
        impact_area: eq.category,
        is_validated: eq.approval_status === 'approved',
        suggested_for_report: (eq.impact_score || 0) >= 50,
        photo_url: null,
        profile_id: elder.id,
        created_at: new Date().toISOString(),
      })
    }
  }

  // Merge local + EL quotes, dedupe by quote text
  const seenQuoteText = new Set<string>()
  const mergedQuotes: QuoteRow[] = []
  for (const q of [...quotes, ...elQuotesAsLocal]) {
    const key = (q.quote_text || '').trim().toLowerCase()
    if (!key || seenQuoteText.has(key)) continue
    seenQuoteText.add(key)
    mergedQuotes.push(q)
  }
  quotes = mergedQuotes

  const quotesByProfile = new Map<string, QuoteRow[]>()
  for (const q of quotes) {
    const profileId = q.profile_id || ''
    if (!profileId) continue
    const list = quotesByProfile.get(profileId) || []
    list.push(q)
    quotesByProfile.set(profileId, list)
  }

  const storiesByProfile = new Map<string, StoryRow[]>()
  for (const s of stories) {
    const list = storiesByProfile.get(s.storyteller_id) || []
    list.push(s)
    storiesByProfile.set(s.storyteller_id, list)
  }

  const elderNameById = new Map<string, string>()
  elders.forEach((e) => elderNameById.set(e.id, displayName({ preferred_name: e.preferred_name, full_name: e.full_name })))

  const themeBuckets = new Map<
    string,
    { label: string; fromQuotes: number; fromInterviews: number; quotes: QuoteRow[] }
  >()

  const registerTheme = (raw: unknown, source: 'quote' | 'interview', quote?: QuoteRow) => {
    const label = formatThemeLabel(raw)
    const key = label.toLowerCase()
    const bucket =
      themeBuckets.get(key) || { label, fromQuotes: 0, fromInterviews: 0, quotes: [] }
    if (source === 'quote') bucket.fromQuotes += 1
    if (source === 'interview') bucket.fromInterviews += 1
    if (quote) bucket.quotes.push(quote)
    themeBuckets.set(key, bucket)
  }

  for (const q of quotes) {
    registerTheme(q.theme, 'quote', q)
  }

  for (const interview of interviews) {
    const themes = Array.isArray(interview?.key_themes) ? interview.key_themes : []
    if (themes.length === 0) {
      registerTheme('Transcript reflections', 'interview')
      continue
    }
    for (const theme of themes) {
      registerTheme(theme, 'interview')
    }
  }

  const themeInsightList = Array.from(themeBuckets.values())
    .map((bucket) => {
      const best = pickBestQuotes(bucket.quotes, 1)[0] || null
      return {
        name: bucket.label,
        count: bucket.fromQuotes + bucket.fromInterviews,
        fromQuotes: bucket.fromQuotes,
        fromInterviews: bucket.fromInterviews,
        sampleQuote: best
          ? {
              id: best.id,
              text: best.quote_text,
              elderName: elderNameById.get(best.profile_id || '') || safeText(best.attribution),
            }
          : null,
      }
    })
    .sort((a, b) => b.count - a.count)
    .slice(0, 6)

  const highlightedQuotes = pickBestQuotes(quotes, 8).map((q) => ({
    id: q.id,
    text: q.quote_text,
    theme: formatThemeLabel(q.theme),
    elderName: elderNameById.get(q.profile_id || '') || safeText(q.attribution),
    createdAt: q.created_at,
  }))

  const insights: EldersInsights = {
    stats: {
      totalElders: elders.length,
      eldersWithQuotes: elders.filter((e) => (quotesByProfile.get(e.id) || []).length > 0).length,
      eldersWithInterviews: elders.filter((e) => interviews.some((i) => i.storyteller_id === e.id)).length,
      totalQuotes: quotes.length,
      validatedQuotes: quotes.filter((q) => q.is_validated).length,
      totalInterviews: interviews.length,
    },
    themes: themeInsightList,
    highlightedQuotes,
  }

  // Group interviews by storyteller
  const interviewsByProfile = new Map<string, InterviewRow[]>()
  for (const i of interviews) {
    const pid = i.storyteller_id || ''
    if (!pid) continue
    const list = interviewsByProfile.get(pid) || []
    list.push(i)
    interviewsByProfile.set(pid, list)
  }

  // Fetch dynamic trip stops (fall back to empty if table doesn't exist yet)
  let tripStops: Array<{ id: string; name: string; description: string | null; lat: number; lng: number; stop_order: number }> = []
  try {
    const { data } = await supabase
      .from('elder_trip_stops')
      .select('id, name, description, lat, lng, stop_order')
      .eq('trip_name', 'elders-trip-2024')
      .order('stop_order', { ascending: true })
      .limit(50)
    tripStops = Array.isArray(data) ? data : []
  } catch {
    tripStops = []
  }

  const eldersView = elders
    .filter((e) => e && e.id)
    .map((e) => {
      const elderQuotes = quotesByProfile.get(e.id) || []
      const best = pickBestQuotes(elderQuotes, 6)
      const featured = best[0] || null

      const elderStories = (storiesByProfile.get(e.id) || [])
        .slice()
        .sort((a, b) => String(b.created_at).localeCompare(String(a.created_at)))
        .slice(0, 8)

      const elderInterviews = (interviewsByProfile.get(e.id) || [])
        .slice()
        .sort((a, b) => String(b.created_at).localeCompare(String(a.created_at)))
        .slice(0, 10)

      return {
        id: e.id,
        name: displayName({ preferred_name: e.preferred_name, full_name: e.full_name }),
        fullName: e.full_name,
        preferredName: e.preferred_name,
        profileImageUrl: e.profile_image_url,
        bio: safeText(e.bio),
        location: safeText(e.location),
        communityRole: safeText(e.community_role),
        traditionalCountry: safeText(e.traditional_country),
        languageGroup: safeText(e.language_group),
        featuredQuote: featured
          ? {
              id: featured.id,
              quoteText: featured.quote_text,
              theme: safeText(featured.theme),
              createdAt: featured.created_at,
            }
          : null,
        quotes: best.map((q) => ({
          id: q.id,
          quoteText: q.quote_text,
          theme: safeText(q.theme),
          createdAt: q.created_at,
        })),
        stories: elderStories.map((s) => ({
          id: s.id,
          title: s.title,
          summary: safeText(s.excerpt),
          createdAt: s.created_at,
          href: `/stories/${s.id}`,
        })),
        interviews: elderInterviews.map((i) => ({
          id: i.id,
          title: i.interview_title || 'Untitled Interview',
          date: i.created_at,
          status: i.status || undefined,
          href: `/picc/interviews/${i.id}`,
        })),
        profileHref: `/wiki/people/${e.id}`,
      }
    })
    .sort((a, b) => a.name.localeCompare(b.name))

  const tripVideoView = tripVideo
    ? {
        id: tripVideo.id,
        title: safeText(tripVideo.title),
        description: safeText(tripVideo.description),
        videoUrl: tripVideo.public_url,
      }
    : null

  const tripImagesView = (tripImages || []).map((img) => ({
    id: img.id,
    url: img.public_url,
    title: safeText(img.title),
    caption: safeText(img.description),
  }))

  // Ensure the hero image appears in the Elders Trip gallery (dedup by URL).
  if (heroRow?.file_type === 'image' && heroRow.public_url) {
    const heroUrl = heroRow.public_url
    const has = tripImagesView.some((i) => i.url === heroUrl)
    if (!has) {
      tripImagesView.unshift({
        id: heroRow.id,
        url: heroUrl,
        title: safeText(heroRow.title) || 'Elders Trip',
        caption: 'Hero image',
      })
    }
  }

  const immersiveStoryHref = '/immersive-stories/elders-trips-story'

  return (
    <>
      <EldersPageClient
        elders={eldersView}
        hero={heroMedia}
        insights={insights}
        trip={{
          project: eldersTripProject ? { name: eldersTripProject.name, slug: eldersTripProject.slug } : null,
          video: tripVideoView,
          images: tripImagesView,
          storyHref: tripStoryHref,
          immersiveStoryHref,
          stops: tripStops.map((s) => ({
            id: s.id,
            name: s.name,
            description: s.description,
            lat: s.lat,
            lng: s.lng,
          })),
        }}
      />

      {/* Upcoming trip + family tree (connections) — added in the
          curation pass. Lives below the existing client render so we
          don't bend the deep component. Saltwater Almanac grammar. */}
      <section className="px-6 md:px-12 py-20" style={{ backgroundColor: '#0B4F6C', color: '#fff' }}>
        <div className="max-w-6xl mx-auto grid md:grid-cols-2 gap-8">
          {/* Upcoming */}
          <div>
            <div
              className="uppercase font-bold mb-3"
              style={{ color: '#F5A623', fontSize: 11, letterSpacing: '0.3em' }}
            >
              Upcoming · Elders on Country
            </div>
            <h2
              className="font-fraunces font-bold leading-tight mb-4"
              style={{ fontSize: 'clamp(28px, 4.5vw, 42px)' }}
            >
              Atherton Tablelands · 2025–26
            </h2>
            <p
              className="font-fraunces"
              style={{ color: 'rgba(255,255,255,0.85)', fontSize: 18, lineHeight: 1.55 }}
            >
              The next Elders trip retraces the country lines from Palm Island to the Atherton Tablelands — Mamu, Warrongo, Gungandji and Djiru land. Photos, stops and voices captured along the way will land here as the trip unfolds, alongside the 2024 trip already documented above.
            </p>
          </div>

          {/* Family tree / connections */}
          <div>
            <div
              className="uppercase font-bold mb-3"
              style={{ color: '#F5A623', fontSize: 11, letterSpacing: '0.3em' }}
            >
              Family tree · Connections
            </div>
            <h2
              className="font-fraunces font-bold leading-tight mb-4"
              style={{ fontSize: 'clamp(28px, 4.5vw, 42px)' }}
            >
              Threads between voices.
            </h2>
            <p
              className="font-fraunces mb-6"
              style={{ color: 'rgba(255,255,255,0.85)', fontSize: 18, lineHeight: 1.55 }}
            >
              Every Elder is woven through the archive — shared photos, shared themes, kinship lines being mapped with consent. The connection graph renders the threads.
            </p>
            <a
              href="/voices/network"
              className="inline-flex items-center gap-2 px-5 py-3 rounded-md font-bold uppercase text-xs"
              style={{ backgroundColor: '#F5A623', color: '#1A1A2E', letterSpacing: '0.15em' }}
            >
              Open the connection map →
            </a>
          </div>
        </div>
      </section>
    </>
  )
}
