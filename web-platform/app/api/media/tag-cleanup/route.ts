import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@supabase/supabase-js'

export const runtime = 'nodejs'
export const maxDuration = 300

function getServerClient() {
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
  const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY

  if (!supabaseUrl || !supabaseServiceKey) {
    throw new Error('Missing Supabase credentials')
  }

  return createClient(supabaseUrl, supabaseServiceKey, {
    auth: { autoRefreshToken: false, persistSession: false },
  })
}

// ---------------------------------------------------------------------------
// Tag classification
// ---------------------------------------------------------------------------

/** Tags that are pure noise and should always be removed */
const NOISE_TAGS = new Set([
  'photo',
  'page-render',
  'pdf-extract',
  'picc',
  'palm-island',
  'annual-report',
  'high-resolution',
  'bwgcolman',
  'aboriginal',
  'indigenous',
  'torres-strait',
  'queensland',
])

/** Prefixed namespaces that should be stripped entirely (value discarded) */
const STRIP_PREFIXES = [
  'section:',
  'content:',
  'page:',
  'audit:',
  'source:',
  'setting:',
  'program:',
  'collection:',
  'innovation:',
  'profile:',
  'usage:',
  'subject:',
]

/** Prefixed namespaces whose values are kept as-is */
const KEEP_PREFIXES = ['fy:', 'event:', 'person:', 'role:', 'project:']

/** Returns true if a tag is purely numeric (noise) */
function isNumericTag(tag: string): boolean {
  return /^\d+$/.test(tag)
}

/**
 * Classify a single tag. Returns the list of tags it should become
 * (empty array means remove it).
 */
function cleanTag(tag: string): string[] {
  const t = tag.trim().toLowerCase()
  if (!t) return []

  // Pure noise
  if (NOISE_TAGS.has(t)) return []

  // Numeric-only noise
  if (isNumericTag(t)) return []

  // service:X -> keep the prefixed tag AND add "services" flat tag
  if (t.startsWith('service:')) {
    const slug = t.slice('service:'.length).trim()
    if (!slug) return []
    return [t, 'services']
  }

  // Keep-as-is prefixed tags
  for (const prefix of KEEP_PREFIXES) {
    if (t.startsWith(prefix)) return [t]
  }

  // Strip prefixed tags (discard value)
  for (const prefix of STRIP_PREFIXES) {
    if (t.startsWith(prefix)) return []
  }

  // Everything else: keep
  return [t]
}

/**
 * Given an array of tags, return the cleaned deduplicated array.
 */
function cleanTags(tags: string[]): string[] {
  const result: string[] = []
  for (const tag of tags) {
    for (const cleaned of cleanTag(tag)) {
      if (!result.includes(cleaned)) {
        result.push(cleaned)
      }
    }
  }
  return result
}

function isNoiseTag(tag: string): boolean {
  return cleanTag(tag).length === 0
}

// ---------------------------------------------------------------------------
// GET - Tag health stats
// ---------------------------------------------------------------------------

export async function GET(_request: NextRequest) {
  try {
    const supabase = getServerClient()

    // Fetch all media_files with their tags
    const PAGE_SIZE = 1000
    let allRows: { id: string; tags: string[] }[] = []
    let from = 0

    while (true) {
      const { data, error } = await supabase
        .from('media_files')
        .select('id, tags')
        .not('tags', 'is', null)
        .range(from, from + PAGE_SIZE - 1)

      if (error) {
        return NextResponse.json({ error: error.message }, { status: 500 })
      }

      if (!data || data.length === 0) break

      for (const row of data) {
        if (Array.isArray(row.tags) && row.tags.length > 0) {
          allRows.push({ id: row.id, tags: row.tags })
        }
      }

      if (data.length < PAGE_SIZE) break
      from += PAGE_SIZE
    }

    // Also count total photos (including those with null/empty tags)
    const { count: totalPhotos, error: countError } = await supabase
      .from('media_files')
      .select('id', { count: 'exact', head: true })

    if (countError) {
      return NextResponse.json({ error: countError.message }, { status: 500 })
    }

    // Compute stats
    const noiseTagCounts: Record<string, number> = {}
    let photosWithNoiseTags = 0
    let photosOnlyNoiseTags = 0
    let auditJunkCount = 0

    for (const row of allRows) {
      const tags = row.tags.filter((t): t is string => typeof t === 'string')
      let hasNoise = false
      let allNoise = true

      for (const tag of tags) {
        const t = tag.trim().toLowerCase()
        if (t === 'audit:junk') auditJunkCount++

        if (isNoiseTag(tag)) {
          hasNoise = true
          noiseTagCounts[t] = (noiseTagCounts[t] || 0) + 1
        } else {
          allNoise = false
        }
      }

      if (hasNoise) photosWithNoiseTags++
      if (allNoise && tags.length > 0) photosOnlyNoiseTags++
    }

    // Top noise tags sorted by count descending
    const topNoiseTags = Object.entries(noiseTagCounts)
      .sort((a, b) => b[1] - a[1])
      .slice(0, 30)
      .map(([tag, count]) => ({ tag, count }))

    return NextResponse.json({
      totalPhotos: totalPhotos ?? 0,
      photosWithTags: allRows.length,
      photosWithNoiseTags,
      photosOnlyNoiseTags,
      auditJunkCount,
      topNoiseTags,
    })
  } catch (error: any) {
    return NextResponse.json(
      { error: error?.message || 'Failed to compute tag health stats' },
      { status: 500 }
    )
  }
}

// ---------------------------------------------------------------------------
// POST - Run tag cleanup pipeline
// ---------------------------------------------------------------------------

export async function POST(_request: NextRequest) {
  try {
    const supabase = getServerClient()

    // Fetch all media_files with tags in pages
    const PAGE_SIZE = 1000
    let totalTagsRemoved = 0
    let photosAffected = 0
    let cleaned = 0

    let from = 0

    while (true) {
      const { data, error } = await supabase
        .from('media_files')
        .select('id, tags')
        .not('tags', 'is', null)
        .range(from, from + PAGE_SIZE - 1)

      if (error) {
        return NextResponse.json({ error: error.message }, { status: 500 })
      }

      if (!data || data.length === 0) break

      for (const row of data) {
        const tags = Array.isArray(row.tags)
          ? row.tags.filter((t: unknown): t is string => typeof t === 'string')
          : []

        if (tags.length === 0) continue

        const cleanedTags = cleanTags(tags)

        // Check if anything changed
        const changed =
          cleanedTags.length !== tags.length ||
          cleanedTags.some((t, i) => t !== tags[i]?.trim().toLowerCase())

        if (!changed) continue

        const removed = tags.length - cleanedTags.length
        // Account for tags that were transformed (e.g. service:X -> slug + services)
        // by counting original tags that produced no output
        const originalNoiseCount = tags.filter((t: string) => isNoiseTag(t)).length

        const { error: updateError } = await supabase
          .from('media_files')
          .update({ tags: cleanedTags })
          .eq('id', row.id)

        if (updateError) {
          return NextResponse.json({ error: updateError.message }, { status: 500 })
        }

        cleaned++
        photosAffected++
        totalTagsRemoved += originalNoiseCount > 0 ? originalNoiseCount : Math.max(removed, 0)
      }

      if (data.length < PAGE_SIZE) break
      from += PAGE_SIZE
    }

    return NextResponse.json({
      ok: true,
      cleaned,
      totalTagsRemoved,
      photosAffected,
    })
  } catch (error: any) {
    return NextResponse.json(
      { error: error?.message || 'Tag cleanup failed' },
      { status: 500 }
    )
  }
}

// ---------------------------------------------------------------------------
// PUT - Auto-tag photos from service & project relationships
// ---------------------------------------------------------------------------

export async function PUT(_request: NextRequest) {
  try {
    const supabase = getServerClient()
    let tagged = 0
    const details: { source: string; photosTagged: number }[] = []

    // 1. Get all services
    const { data: services } = await supabase
      .from('organization_services')
      .select('id, slug, name')
      .eq('is_active', true)

    // 2. For each service, find photos with page_section matching
    if (services && services.length > 0) {
      for (const svc of services) {
        if (!svc.slug) continue

        // Find photos that have page_section = 'service-{slug}' or page_context = slug
        const { data: photos } = await supabase
          .from('media_files')
          .select('id, tags')
          .is('deleted_at', null)
          .or(`page_section.eq.service-${svc.slug},page_context.eq.${svc.slug}`)

        if (!photos || photos.length === 0) continue

        let svcTagged = 0
        for (const photo of photos) {
          const existing: string[] = Array.isArray(photo.tags) ? photo.tags : []
          const newTags = new Set(existing)
          let changed = false

          if (!newTags.has('services')) { newTags.add('services'); changed = true }
          if (!newTags.has(`service:${svc.slug}`)) { newTags.add(`service:${svc.slug}`); changed = true }

          if (changed) {
            await supabase
              .from('media_files')
              .update({ tags: Array.from(newTags) })
              .eq('id', photo.id)
            tagged++
            svcTagged++
          }
        }
        if (svcTagged > 0) {
          details.push({ source: `service:${svc.slug}`, photosTagged: svcTagged })
        }
      }
    }

    // 3. Get all project_media junction records → tag those photos
    const { data: projectMedia } = await supabase
      .from('project_media')
      .select('media_file_id, project_id')

    if (projectMedia && projectMedia.length > 0) {
      // Get project slugs
      const projectIds = Array.from(new Set(projectMedia.map(pm => pm.project_id)))
      const { data: projects } = await supabase
        .from('projects')
        .select('id, slug, name')
        .in('id', projectIds)

      const projectMap = new Map((projects || []).map(p => [p.id, p]))

      for (const pm of projectMedia) {
        const project = projectMap.get(pm.project_id)
        if (!project?.slug) continue

        const { data: photo } = await supabase
          .from('media_files')
          .select('id, tags')
          .eq('id', pm.media_file_id)
          .is('deleted_at', null)
          .single()

        if (!photo) continue

        const existing: string[] = Array.isArray(photo.tags) ? photo.tags : []
        const newTags = new Set(existing)
        let changed = false

        if (!newTags.has(project.slug)) { newTags.add(project.slug); changed = true }

        if (changed) {
          await supabase
            .from('media_files')
            .update({ tags: Array.from(newTags) })
            .eq('id', photo.id)
          tagged++
        }
      }

      if (projectMedia.length > 0) {
        details.push({ source: 'project_media junction', photosTagged: projectMedia.length })
      }
    }

    return NextResponse.json({
      ok: true,
      tagged,
      details,
    })
  } catch (error: any) {
    return NextResponse.json(
      { error: error?.message || 'Auto-tag from relationships failed' },
      { status: 500 }
    )
  }
}

// ---------------------------------------------------------------------------
// PATCH - Restore service: prefixes on photos that have bare service slugs
// ---------------------------------------------------------------------------

export async function PATCH(_request: NextRequest) {
  try {
    const supabase = getServerClient()

    // 1. Get all service slugs
    const { data: services } = await supabase
      .from('organization_services')
      .select('slug')
      .eq('is_active', true)

    if (!services || services.length === 0) {
      return NextResponse.json({ ok: true, restored: 0, message: 'No services found' })
    }

    const serviceSlugs = Array.from(new Set(services.map(s => s.slug).filter(Boolean)))
    let restored = 0
    const details: { slug: string; count: number }[] = []

    // 2. For each service slug, find photos that have the bare slug tag but NOT service:{slug}
    for (const slug of serviceSlugs) {
      const { data: photos } = await supabase
        .from('media_files')
        .select('id, tags')
        .contains('tags', [slug])
        .is('deleted_at', null)

      if (!photos || photos.length === 0) continue

      let slugCount = 0
      for (const photo of photos) {
        const tags: string[] = Array.isArray(photo.tags) ? photo.tags : []
        const prefixed = `service:${slug}`

        // Skip if already has the prefixed version
        if (tags.includes(prefixed)) continue

        // Add service:{slug} prefix, keep the bare slug too
        const newTags = [...tags, prefixed]

        await supabase
          .from('media_files')
          .update({ tags: newTags })
          .eq('id', photo.id)

        restored++
        slugCount++
      }

      if (slugCount > 0) {
        details.push({ slug, count: slugCount })
      }
    }

    return NextResponse.json({ ok: true, restored, details })
  } catch (error: any) {
    return NextResponse.json(
      { error: error?.message || 'Service prefix restore failed' },
      { status: 500 }
    )
  }
}
