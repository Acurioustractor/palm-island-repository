/**
 * Photo assignment system for annual report pages.
 *
 * Maps real community photos to specific report pages with fallback logic:
 *   1. Supabase media_files tagged for that page
 *   2. Manifest keyword match from photo-manifest.json
 *   3. Year-specific photos from annual-report-photos/
 *   4. AI-generated fallback from report-assets/
 */

import { createClient } from '@supabase/supabase-js'
import { assetUrl } from '@/lib/media/asset-url'

// Use URLs instead of filesystem paths to avoid bundling public/ into serverless functions
const getBaseUrl = () => {
  if (process.env.VERCEL_URL) return `https://${process.env.VERCEL_URL}`
  return `http://localhost:${process.env.PORT || 3000}`
}

// ── Types ─────────────────────────────────────────────

export interface PagePhoto {
  /** Primary photo path (resolved to absolute for React PDF) */
  hero: string
  /** AI fallback if hero is unavailable */
  fallback: string
  /** Optional gallery photos for pages that show multiple */
  gallery?: string[]
  /** Caption for the hero photo */
  caption?: string
}

export type PagePhotoMap = Record<string, PagePhoto>

// ── Manifest types ────────────────────────────────────

interface ManifestEntry {
  path: string
  year: string
  description: string
}

interface PhotoManifest {
  generated_at: string
  total_processed: number
  hero_images: ManifestEntry[]
  group_shots?: ManifestEntry[]
  service_delivery?: ManifestEntry[]
  community_events?: ManifestEntry[]
  facilities?: ManifestEntry[]
  other?: ManifestEntry[]
}

// ── Helpers ───────────────────────────────────────────

const publicPath = (relativePath: string) =>
  `${getBaseUrl()}/${relativePath}`

const assetPath = (filename: string) =>
  `${getBaseUrl()}${assetUrl(`/report-assets/${filename}`)}`

const photoPath = (manifestPath: string) =>
  `${getBaseUrl()}${assetUrl(manifestPath)}`

/**
 * Search the photo manifest for photos matching any of the given keywords.
 * Returns the first match found across all manifest categories.
 */
export function getManifestPhotoByKeywords(
  manifest: PhotoManifest,
  keywords: string[],
  preferYear?: string
): ManifestEntry | null {
  const allEntries = [
    ...(manifest.hero_images || []),
    ...(manifest.group_shots || []),
    ...(manifest.service_delivery || []),
    ...(manifest.community_events || []),
    ...(manifest.facilities || []),
    ...(manifest.other || []),
  ]

  const lowerKeywords = keywords.map((k) => k.toLowerCase())

  // Score entries by keyword matches
  const scored = allEntries
    .map((entry) => {
      const desc = entry.description.toLowerCase()
      let score = 0
      for (const kw of lowerKeywords) {
        if (desc.includes(kw)) score++
      }
      // Boost entries from preferred year
      if (preferYear && entry.year === preferYear) score += 0.5
      return { entry, score }
    })
    .filter((s) => s.score > 0)
    .sort((a, b) => b.score - a.score)

  return scored[0]?.entry || null
}

// ── Default photo assignments ─────────────────────────

/**
 * Static photo assignments mapping specific known photos to pages.
 * These are curated selections from the PICC photo archive.
 */
const DEFAULT_ASSIGNMENTS: Record<string, { photoPath: string; fallbackAsset: string; caption?: string }> = {
  cover: {
    photoPath: '/annual-report-photos/2009-10/photo-020.jpg',
    fallbackAsset: 'cover-hero.jpg',
    caption: 'Palm Island — tropical beach and hills',
  },
  acknowledgement: {
    photoPath: '/annual-report-photos/2009-10/photo-020.jpg',
    fallbackAsset: 'acknowledgement-art.jpg',
    caption: 'Palm Island landscape',
  },
  contents: {
    photoPath: '',
    fallbackAsset: 'palm-island-map-v2.jpg',
  },
  messages: {
    photoPath: '/annual-report-photos/2009-10/photo-022.jpg',
    fallbackAsset: '',
    caption: 'PICC leader at the office',
  },
  numbers: {
    photoPath: '',
    fallbackAsset: '',
  },
  photos: {
    photoPath: '',
    fallbackAsset: 'photo-spread-bg.jpg',
  },
  communityVoices: {
    photoPath: '/annual-report-photos/2015-16/photo-000.jpg',
    fallbackAsset: 'community-gathering.jpg',
    caption: 'Women and children from the Palm Island community',
  },
  youthVoices: {
    photoPath: '',
    fallbackAsset: 'youth-energy.jpg',
  },
  governance: {
    photoPath: '/annual-report-photos/2018-19/photo-006.jpg',
    fallbackAsset: 'governance-board.jpg',
    caption: 'Board members in art shirts',
  },
  services: {
    photoPath: '/annual-report-photos/2021-22/photo-057.jpg',
    fallbackAsset: 'services-delivery.jpg',
    caption: 'Healthcare workers serving the community',
  },
  journey: {
    photoPath: '/annual-report-photos/2009-10/photo-018.jpg',
    fallbackAsset: 'journey-timeline-v2.jpg',
    caption: 'Aerial view of Palm Island community',
  },
  resilience: {
    photoPath: '',
    fallbackAsset: 'next-20-sunrise.jpg',
  },
  financials: {
    photoPath: '',
    fallbackAsset: 'expenditure-donut.jpg',
  },
  backCover: {
    photoPath: '',
    fallbackAsset: 'back-cover-reef.jpg',
  },
  highlights: {
    photoPath: '',
    fallbackAsset: 'highlights-mosaic.jpg',
  },
}

// ── Main function ─────────────────────────────────────

/**
 * Build the page photo map for a given report year.
 *
 * Priority chain:
 *   1. Supabase media_files with page-specific tags (passed in as overrides)
 *   2. Static curated assignments from DEFAULT_ASSIGNMENTS
 *   3. Manifest keyword search
 *   4. AI fallback illustration
 *
 * @param reportYear - The fiscal year string (e.g. '2024-25')
 * @param supabaseOverrides - Photos from media_files tagged per page
 * @param manifest - The parsed photo-manifest.json (optional)
 */
export function getPagePhotos(
  reportYear?: string,
  supabaseOverrides?: Record<string, { url: string; caption?: string }>,
  manifest?: PhotoManifest | null
): PagePhotoMap {
  const result: PagePhotoMap = {}

  for (const [pageKey, assignment] of Object.entries(DEFAULT_ASSIGNMENTS)) {
    // Check Supabase overrides first
    const override = supabaseOverrides?.[pageKey]

    if (override) {
      result[pageKey] = {
        hero: override.url,
        fallback: assignment.fallbackAsset ? assetPath(assignment.fallbackAsset) : '',
        caption: override.caption,
      }
      continue
    }

    // Use curated static assignment
    if (assignment.photoPath) {
      result[pageKey] = {
        hero: photoPath(assignment.photoPath),
        fallback: assignment.fallbackAsset ? assetPath(assignment.fallbackAsset) : '',
        caption: assignment.caption,
      }
      continue
    }

    // Try manifest keyword search for pages without a static assignment
    if (manifest && MANIFEST_KEYWORDS[pageKey]) {
      const match = getManifestPhotoByKeywords(manifest, MANIFEST_KEYWORDS[pageKey], reportYear)
      if (match) {
        result[pageKey] = {
          hero: photoPath(match.path),
          fallback: assignment.fallbackAsset ? assetPath(assignment.fallbackAsset) : '',
          caption: match.description,
        }
        continue
      }
    }

    // Fall back to AI illustration
    result[pageKey] = {
      hero: assignment.fallbackAsset ? assetPath(assignment.fallbackAsset) : '',
      fallback: assignment.fallbackAsset ? assetPath(assignment.fallbackAsset) : '',
      caption: assignment.caption,
    }
  }

  return result
}

/**
 * Keywords used to search the photo manifest for each page type.
 * Only used when no static assignment or Supabase override exists.
 */
const MANIFEST_KEYWORDS: Record<string, string[]> = {
  numbers: ['staff', 'group', 'team'],
  photos: ['community', 'celebration', 'event', 'gathering'],
  youthVoices: ['youth', 'children', 'young', 'kids', 'school'],
  resilience: ['aerial', 'cyclone', 'flood', 'history'],
}

// ── Map page_section values to DEFAULT_ASSIGNMENTS keys ──

const SECTION_TO_PAGE_KEY: Record<string, string> = {
  'cover': 'cover',
  'acknowledgement': 'acknowledgement',
  'messages': 'messages',
  'numbers': 'numbers',
  'community-voices': 'communityVoices',
  'youth-voices': 'youthVoices',
  'services': 'services',
  'governance': 'governance',
  'photos': 'photos',
  'journey': 'journey',
  'next-20': 'resilience',
  'highlights': 'backCover',
}

/**
 * Query media_files for photos assigned to annual report pages.
 * Returns overrides keyed by page key (matching DEFAULT_ASSIGNMENTS).
 */
export async function getSupabaseOverrides(): Promise<Record<string, { url: string; caption?: string }>> {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL
  const key = process.env.SUPABASE_SERVICE_ROLE_KEY
  if (!url || !key) return {}

  const supabase = createClient(url, key, {
    auth: { autoRefreshToken: false, persistSession: false },
  })

  const { data } = await supabase
    .from('media_files')
    .select('public_url, caption, page_section, display_order')
    .eq('page_context', 'annual-report')
    .not('page_section', 'is', null)
    .order('display_order')

  const overrides: Record<string, { url: string; caption?: string }> = {}
  for (const row of data || []) {
    const pageKey = SECTION_TO_PAGE_KEY[row.page_section] || row.page_section
    // Only take the first match per page key (highest priority by display_order)
    if (!overrides[pageKey]) {
      overrides[pageKey] = { url: row.public_url, caption: row.caption || undefined }
    }
  }
  return overrides
}
