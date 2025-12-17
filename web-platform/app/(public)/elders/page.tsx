import EldersPageClient from '@/components/elders/EldersPageClient'
import { createServerSupabase } from '@/lib/supabase/client'
import { cleanupQuoteText, isLikelyJunkQuote, pickBestQuotes } from '@/lib/transcripts/quotable'

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

export const metadata = {
  title: 'Our Elders | PICC',
  description:
    'Meet the Palm Island Community Company Elders group — voices of culture, history, and guidance.',
}

function displayName(p: { preferred_name?: string | null; full_name: string }) {
  return (p.preferred_name || p.full_name || '').trim()
}

function safeText(input: unknown) {
  const s = String(input ?? '').trim()
  return s || null
}

export default async function EldersPage() {
  const supabase = createServerSupabase() as any

  let elders: ElderProfileRow[] = []
  let quotes: QuoteRow[] = []
  let stories: StoryRow[] = []
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
    <EldersPageClient
      elders={eldersView}
      hero={heroMedia}
      trip={{
        project: eldersTripProject ? { name: eldersTripProject.name, slug: eldersTripProject.slug } : null,
        video: tripVideoView,
        images: tripImagesView,
        storyHref: tripStoryHref,
        immersiveStoryHref,
      }}
    />
  )
}
