/**
 * Enriched data layer for the live annual report page.
 *
 * Composes existing utilities into a single fetch function so the live page
 * gets its data from the same canonical sources as the PDF generator.
 */

import { getReportData, type ReportData } from './fetch-report-data'
import { getLiveStats, FALLBACKS, FINANCIALS } from '@/lib/stats/current-stats'
import { getCuratedQuotes, type CuratedQuote } from '@/lib/quotes/get-curated-quotes'
import { getHeroImage, getMediaByTags } from '@/lib/media/utils'
import { getFeaturedStories } from '@/lib/stories/utils'
import { createServerComponentClient } from '@/lib/supabase/server'
import type { MediaFile } from '@/lib/media/types'

// ── Types ──

export interface LiveStats {
  staff: number
  staffTarget: number
  services: number
  servicesTarget: number
  income: number
  incomeTarget: number
}

export interface CommunityVision {
  id: string
  vision_text: string
  author_name: string | null
  category: string | null
}

export interface GalleryPhoto {
  url: string
  caption?: string
  category?: string
}

export interface LiveReportData {
  reportData: ReportData
  liveStats: LiveStats
  curatedQuotes: CuratedQuote[]
  galleryPhotos: GalleryPhoto[]
  boardPhotos: GalleryPhoto[]
  communityVisions: CommunityVision[]
  stories: any[]
  storyImages: Record<string, string>
  heroImage: string | null
  mapImage: string | null
}

// ── Helpers ──

function sample<T>(items: T[], count: number): T[] {
  const arr = items.slice()
  for (let i = arr.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1))
    const tmp = arr[i]
    arr[i] = arr[j]
    arr[j] = tmp
  }
  return arr.slice(0, Math.max(0, count))
}

function pickNiceCategory(tags: unknown): string | undefined {
  const list = Array.isArray(tags) ? tags : []
  const ignore = (t: string) =>
    t === 'annual-report' ||
    t.startsWith('fy:') ||
    t.startsWith('service:') ||
    t.startsWith('project:')
  const candidate = list.find((t: string) => typeof t === 'string' && !ignore(t))
  return candidate || undefined
}

function mediaToGalleryPhoto(m: MediaFile, category?: string): GalleryPhoto {
  return {
    url: m.public_url,
    caption: m.caption || m.title || m.alt_text || undefined,
    category: category || pickNiceCategory(m.tags),
  }
}

function mergeUniqueById(primary: any[], fallback: any[], limit: number): any[] {
  const out: any[] = []
  const seen = new Set<string>()
  for (const arr of [primary, fallback]) {
    for (const s of arr || []) {
      if (!s?.id || seen.has(s.id)) continue
      seen.add(s.id)
      out.push(s)
      if (out.length >= limit) return out
    }
  }
  return out
}

// ── Fiscal year helpers ──

export function getCurrentFiscalYear() {
  const now = new Date()
  const startYear = now.getMonth() >= 6 ? now.getFullYear() : now.getFullYear() - 1
  const endYear = startYear + 1
  return {
    currentFiscalYear: `${startYear}-${String(endYear).slice(-2)}`,
    reportingPeriod: `July 1, ${startYear} - June 30, ${endYear}`,
    reportYear: endYear,
  }
}

export function getFiscalYearBounds(reportYear: number) {
  const startYear = reportYear - 1
  return {
    startDate: `${startYear}-07-01`,
    endDate: `${reportYear}-06-30`,
  }
}

// ── Private fetchers for data not covered by existing utilities ──

async function fetchCommunityGallery(fiscalYear: string, limit: number): Promise<GalleryPhoto[]> {
  const primaryTags = ['annual-report', `fy:${fiscalYear}`]
  let media = await getMediaByTags(primaryTags, 180, 'image')
  if (media.length === 0) {
    media = await getMediaByTags(['community', 'event', 'culture', 'youth', 'health'], 180, 'image')
  }
  return sample(media, limit).map((m) => mediaToGalleryPhoto(m))
}

async function fetchBoardPhotos(limit: number): Promise<GalleryPhoto[]> {
  const media = await getMediaByTags(['board'], 80, 'image')
  return sample(media, limit).map((m) => mediaToGalleryPhoto(m, 'Board'))
}

async function fetchMapImage(): Promise<string | null> {
  const supabase = await createServerComponentClient()
  const { data } = await (supabase as any)
    .from('media_files')
    .select('public_url')
    .eq('is_public', true)
    .is('deleted_at', null)
    .eq('page_context', 'annual-report')
    .eq('page_section', 'map')
    .eq('file_type', 'image')
    .order('is_featured', { ascending: false })
    .order('display_order', { ascending: true })
    .limit(1)
    .single()
  return (data as any)?.public_url || null
}

async function fetchCommunityVisions(limit: number): Promise<CommunityVision[]> {
  const supabase = await createServerComponentClient()
  const { data } = await (supabase as any)
    .from('community_visions')
    .select('id, vision_text, author_name, category, created_at')
    .eq('is_approved', true)
    .order('created_at', { ascending: false })
    .limit(limit)
  return (data || []) as CommunityVision[]
}

async function fetchLinkedStories(reportYear: number): Promise<any[]> {
  const supabase = await createServerComponentClient()
  const { data: report } = await (supabase as any)
    .from('annual_reports')
    .select('id')
    .eq('report_year', reportYear)
    .limit(1)
    .single()

  if (!report?.id) return []

  const { data: links } = await (supabase as any)
    .from('annual_report_stories')
    .select(`
      story_id, is_featured, display_order, section_placement,
      story:stories (
        *, storyteller:storyteller_id (
          id, full_name, preferred_name, is_elder, is_cultural_advisor, profile_image_url
        )
      )
    `)
    .eq('report_id', report.id)
    .order('display_order')

  if (!links || links.length === 0) return []

  return links
    .filter((link: any) => link.story && link.story.is_public && link.story.status === 'published')
    .map((link: any) => ({
      ...link.story,
      _is_featured: link.is_featured,
      _section: link.section_placement,
      _display_order: link.display_order,
    }))
}

async function fetchThisYearStories(reportYear: number, limit: number): Promise<any[]> {
  const supabase = await createServerComponentClient()
  const { startDate, endDate } = getFiscalYearBounds(reportYear)

  const { data } = await (supabase as any)
    .from('stories')
    .select(`
      *, storyteller:storyteller_id (
        id, full_name, preferred_name, is_elder, is_cultural_advisor, profile_image_url
      )
    `)
    .eq('is_public', true)
    .eq('status', 'published')
    .gte('created_at', startDate)
    .lte('created_at', endDate)
    .order('total_score', { ascending: false })
    .order('created_at', { ascending: false })
    .limit(Math.max(1, limit))

  return (data || []) as any[]
}

async function fetchStoryImages(storyIds: string[]): Promise<Record<string, string>> {
  const map: Record<string, string> = {}
  if (!storyIds || storyIds.length === 0) return map

  const supabase = await createServerComponentClient()
  const { data } = await (supabase as any)
    .from('media_files')
    .select('story_id, public_url, is_featured, created_at, deleted_at, is_public, file_type')
    .in('story_id', storyIds)
    .eq('is_public', true)
    .is('deleted_at', null)
    .eq('file_type', 'image')
    .order('is_featured', { ascending: false })
    .order('created_at', { ascending: false })
    .limit(200)

  for (const row of (data || []) as any[]) {
    const sid = row.story_id as string | null
    if (sid && !map[sid]) map[sid] = row.public_url
  }
  return map
}

// ── Main fetch function ──

export async function fetchLiveReportData(fiscalYear: string): Promise<LiveReportData> {
  const { reportYear } = getCurrentFiscalYear()

  // Phase 1: parallel fetches for all data sources
  const [
    reportData,
    liveStats,
    curatedQuotes,
    heroImage,
    galleryPhotos,
    boardPhotos,
    mapImage,
    communityVisions,
    linkedStories,
    thisYearStories,
    fallbackStories,
  ] = await Promise.all([
    getReportData(fiscalYear),
    getLiveStats(),
    getCuratedQuotes({ limit: 8 }),
    getHeroImage('annual-report'),
    fetchCommunityGallery(fiscalYear, 18),
    fetchBoardPhotos(12),
    fetchMapImage(),
    fetchCommunityVisions(6),
    fetchLinkedStories(reportYear),
    fetchThisYearStories(reportYear, 6),
    getFeaturedStories(8),
  ])

  // Phase 2: merge stories (linked > this-year > featured fallback)
  const stories = mergeUniqueById(
    linkedStories,
    mergeUniqueById(thisYearStories, fallbackStories, 12),
    6
  )

  // Phase 3: fetch story images (depends on story IDs)
  const storyIds = stories.map((s: any) => s.id).filter(Boolean)
  const storyImages = await fetchStoryImages(storyIds)
  // Also use featured_image_url from story records
  for (const story of stories) {
    if (story.featured_image_url && !storyImages[story.id]) {
      storyImages[story.id] = story.featured_image_url
    }
  }

  // Deduplicate quotes by speaker (max 1 per person)
  const seenSpeakers = new Set<string>()
  const dedupedQuotes = curatedQuotes.filter((q) => {
    const name = (q.speaker_name || 'unknown').toLowerCase().trim()
    if (seenSpeakers.has(name)) return false
    seenSpeakers.add(name)
    return true
  })

  return {
    reportData,
    liveStats,
    curatedQuotes: dedupedQuotes,
    galleryPhotos,
    boardPhotos,
    communityVisions,
    stories,
    storyImages,
    heroImage,
    mapImage,
  }
}
