import { NextRequest, NextResponse } from 'next/server'
import { cookies } from 'next/headers'
import { createServerClient, type CookieOptions } from '@supabase/ssr'
import { createServerSupabase } from '@/lib/supabase/client'
import { cleanupQuoteText, extractQuoteCandidatesFromTranscript, isLikelyJunkQuote, pickBestQuotes } from '@/lib/transcripts/quotable'

export const runtime = 'nodejs'

function isDev(request: NextRequest) {
  if (process.env.NODE_ENV === 'production') return false
  const host = request.headers.get('host') || ''
  return host.includes('localhost') || host.includes('127.0.0.1') || host.includes('::1')
}

async function getUserIdFromCookies(): Promise<string | null> {
  try {
    const cookieStore = await cookies()
    const supabase = createServerClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
      {
        cookies: {
          get(key: string) {
            return cookieStore.get(key)?.value
          },
          set(key: string, value: string, options: CookieOptions) {
            try {
              cookieStore.set(key, value, options)
            } catch {}
          },
          remove(key: string, options: CookieOptions) {
            try {
              cookieStore.delete(key)
            } catch {}
          },
        },
      }
    )
    const {
      data: { user },
    } = await supabase.auth.getUser()
    return user?.id || null
  } catch {
    return null
  }
}

async function ensureAccess(request: NextRequest) {
  if (isDev(request)) return true
  return !!(await getUserIdFromCookies())
}

function uniq<T>(arr: T[]) {
  return Array.from(new Set(arr))
}

function pickTopThemes(values: Array<string | null | undefined>, max = 6) {
  const counts = new Map<string, number>()
  for (const v of values) {
    const s = String(v || '').trim()
    if (!s) continue
    counts.set(s, (counts.get(s) || 0) + 1)
  }
  return Array.from(counts.entries())
    .sort((a, b) => b[1] - a[1])
    .slice(0, max)
    .map(([k]) => k)
}

function formatDateForTimeline(d: Date) {
  return d.toLocaleDateString('en-AU', { day: 'numeric', month: 'short', year: 'numeric' })
}

type QuoteRow = {
  id?: string
  quote_text: string
  attribution?: string | null
  context?: string | null
  theme?: string | null
  profile_id?: string | null
  photo_url?: string | null
  created_at?: string | null
  is_validated?: boolean | null
  suggested_for_report?: boolean | null
}

function roundRobinPickByProfile(quotes: QuoteRow[], storytellerIds: string[], max: number) {
  const byProfile = new Map<string, QuoteRow[]>()
  for (const q of quotes) {
    const profileId = String(q.profile_id || '').trim()
    if (!profileId) continue
    const list: QuoteRow[] = byProfile.get(profileId) || []
    list.push(q)
    byProfile.set(profileId, list)
  }

  const perProfileBest = new Map<string, QuoteRow[]>()
  for (const [profileId, list] of Array.from(byProfile.entries())) {
    const cleaned = list
      .map((q) => ({ ...q, quote_text: cleanupQuoteText(q.quote_text || '') }))
      .filter((q) => !isLikelyJunkQuote(q.quote_text))

    const preferredPool = cleaned.filter((q) => q.suggested_for_report || q.is_validated)
    const preferred = pickBestQuotes(preferredPool, Math.min(6, max))
    const fallbackNeeded = Math.max(0, Math.min(6, max) - preferred.length)
    const fallback = fallbackNeeded > 0 ? pickBestQuotes(cleaned, Math.min(10, max)) : []

    const merged: QuoteRow[] = []
    const seen = new Set<string>()
    for (const q of [...preferred, ...fallback]) {
      const key = cleanupQuoteText(q.quote_text).toLowerCase()
      if (!key || seen.has(key)) continue
      seen.add(key)
      merged.push(q)
    }
    perProfileBest.set(profileId, merged)
  }

  const picked: QuoteRow[] = []
  let guard = 0
  while (picked.length < max && guard < 200) {
    guard++
    let madeProgress = false
    for (const id of storytellerIds) {
      const list: QuoteRow[] = perProfileBest.get(id) || []
      const next = list.shift()
      if (!next) continue
      picked.push(next)
      madeProgress = true
      if (picked.length >= max) break
    }
    if (!madeProgress) break
  }

  return picked
}

export async function POST(request: NextRequest) {
  try {
    const ok = await ensureAccess(request)
    if (!ok) return NextResponse.json({ error: 'Authentication required' }, { status: 403 })

    const body = await request.json().catch(() => ({} as any))
    const projectSlug = String(body?.projectSlug || '').trim()
    const storytellerIds = Array.isArray(body?.storytellerIds) ? body.storytellerIds.map((s: any) => String(s).trim()).filter(Boolean) : []
    const maxQuotes = Math.max(1, Math.min(12, Number(body?.maxQuotes || 8)))

    if (!projectSlug) return NextResponse.json({ error: 'Missing projectSlug' }, { status: 400 })
    if (storytellerIds.length === 0) return NextResponse.json({ error: 'Select at least one storyteller' }, { status: 400 })

    const supabase = createServerSupabase() as any

    const { data: project, error: projectError } = await supabase
      .from('projects')
      .select('id, name, slug, tagline, description, hero_image_url')
      .eq('slug', projectSlug)
      .single()
    if (projectError || !project) return NextResponse.json({ error: 'Project not found' }, { status: 404 })

    const { data: profiles } = await supabase
      .from('profiles')
      .select('id, full_name, preferred_name, profile_image_url, storyteller_type, is_elder')
      .in('id', storytellerIds)

    const profileById = new Map<string, any>((profiles || []).map((p: any) => [p.id, p]))

    const { data: interviews } = await supabase
      .from('interviews')
      .select('id, storyteller_id, interview_title, interview_date, interview_location, edited_transcript, raw_transcript, key_themes, can_be_quoted, requires_elder_approval, approved_at')
      .in('storyteller_id', storytellerIds)
      .order('interview_date', { ascending: false })
      .limit(50)

    const usableInterviews = (interviews || []).filter((i: any) => {
      if (i?.can_be_quoted === false) return false
      if (i?.requires_elder_approval === true && !i?.approved_at) return false
      return true
    })

    // Try to use extracted_quotes if present in DB; otherwise fall back to sentence extraction from transcripts.
    let quotes: QuoteRow[] = []
    try {
      const { data: extracted } = await supabase
        .from('extracted_quotes')
        .select('id, quote_text, attribution, context, theme, profile_id, photo_url, created_at, is_validated, suggested_for_report')
        .in('profile_id', storytellerIds)
        .order('created_at', { ascending: false })
        .limit(maxQuotes * 3)
      quotes = (extracted || [])
        .map((q: any) => ({ ...q, quote_text: cleanupQuoteText(q?.quote_text || '') }))
        .filter((q: any) => !isLikelyJunkQuote(q.quote_text))
    } catch {
      quotes = []
    }

    if (quotes.length < Math.min(4, maxQuotes) && usableInterviews.length > 0) {
      for (const interview of usableInterviews) {
        const transcript = interview.edited_transcript || interview.raw_transcript || ''
        const candidates = extractQuoteCandidatesFromTranscript(transcript, 3)
        const p = profileById.get(interview.storyteller_id)
        for (const quoteText of candidates) {
          quotes.push({
            quote_text: quoteText,
            attribution: p?.preferred_name || p?.full_name || 'Community Member',
            profile_id: interview.storyteller_id,
            theme: null,
            suggested_for_report: false,
            is_validated: false,
          })
        }
      }
    }

    const chosenQuotes = roundRobinPickByProfile(quotes, storytellerIds, maxQuotes)

    const themes = pickTopThemes([
      ...(usableInterviews || []).flatMap((i: any) => Array.isArray(i.key_themes) ? i.key_themes : []),
      ...chosenQuotes.map((q: any) => q.theme),
    ])

    // Media: prioritize project-tagged images that include selected storytellers in faces_detected.
    const { data: taggedImages } = await supabase
      .from('media_files')
      .select('id, public_url, file_type, title, faces_detected, tags, created_at')
      .is('deleted_at', null)
      .eq('file_type', 'image')
      .contains('tags', [`project:${projectSlug}`])
      .order('created_at', { ascending: false })
      .limit(60)

    const facesFirst = (taggedImages || []).sort((a: any, b: any) => {
      const aHas = Array.isArray(a.faces_detected) && a.faces_detected.some((id: string) => storytellerIds.includes(id))
      const bHas = Array.isArray(b.faces_detected) && b.faces_detected.some((id: string) => storytellerIds.includes(id))
      return Number(bHas) - Number(aHas)
    })

    const galleryImages = facesFirst.slice(0, 10).map((img: any) => ({
      url: img.public_url,
      alt: '',
      caption: img.title || '',
    }))

    // Timeline from project updates
    const nowIso = new Date().toISOString()
    const { data: updates } = await supabase
      .from('project_updates')
      .select('title, excerpt, content, published_at, created_at')
      .eq('project_id', project.id)
      .eq('is_published', true)
      .or(`published_at.is.null,published_at.lte.${nowIso}`)
      .order('published_at', { ascending: false })
      .limit(12)

    const timelineEvents = (updates || [])
      .slice()
      .reverse()
      .map((u: any) => {
        const d = u.published_at ? new Date(u.published_at) : new Date(u.created_at)
        return {
          date: formatDateForTimeline(d),
          title: u.title,
          description: u.excerpt || (u.content ? String(u.content).slice(0, 180) : ''),
          isComplete: true,
        }
      })

    const heroCandidate = galleryImages[0]?.url || project.hero_image_url || ''
    const heroMedia = heroCandidate ? { url: heroCandidate, type: 'image' as const } : { url: '', type: 'image' as const }

    const storytellerNames = storytellerIds
      .map((id: string) => profileById.get(id))
      .filter(Boolean)
      .map((p: any) => p.preferred_name || p.full_name)

    const intro = [
      project.description ? project.description.trim() : '',
      themes.length ? `Themes: ${themes.join(', ')}.` : '',
      storytellerNames.length ? `Voices: ${uniq(storytellerNames).join(', ')}.` : '',
    ].filter(Boolean).join('\n\n')

    const sections: any[] = []
    sections.push({
      id: `gen-${Date.now()}-intro`,
      type: 'text',
      order: 0,
      data: { title: 'The Trip', content: intro || 'Draft your story here…' },
    })

    for (let i = 0; i < Math.min(6, chosenQuotes.length); i++) {
      const q = chosenQuotes[i]
      const p = q.profile_id ? profileById.get(q.profile_id) : null
      sections.push({
        id: `gen-${Date.now()}-quote-${i}`,
        type: 'quote',
        order: sections.length,
        data: {
          quote: q.quote_text,
          author: q.attribution || (p?.preferred_name || p?.full_name || ''),
          role: p?.is_elder ? 'Elder' : (p?.storyteller_type || ''),
          photoUrl: p?.profile_image_url || q.photo_url || '',
        },
      })
    }

    if (galleryImages.length > 0) {
      sections.push({
        id: `gen-${Date.now()}-gallery`,
        type: 'gallery',
        order: sections.length,
        data: { title: 'Gallery', images: galleryImages },
      })
    }

    if (timelineEvents.length > 0) {
      sections.push({
        id: `gen-${Date.now()}-timeline`,
        type: 'timeline',
        order: sections.length,
        data: { title: 'Timeline', events: timelineEvents },
      })
    }

    return NextResponse.json({
      storyTitle: project.name,
      storySubtitle: project.tagline || '',
      heroMedia,
      sections,
    })
  } catch (error: any) {
    return NextResponse.json({ error: error?.message || 'Failed to generate story' }, { status: 500 })
  }
}
