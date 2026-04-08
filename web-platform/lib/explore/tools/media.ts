import { z } from 'zod'
import { defineTool, getSupabase, buildPublicUrl, resolveMediaUrl } from './_shared'

// ─── Schema definitions ──────────────────────────────────────────────────────

const getPhotoGallerySchema = z.object({
  topic: z.string().optional().describe('Topic to search photos for (e.g. "photo studio", "elders trip", "community event")'),
  storyId: z.string().optional().describe('Specific story ID to get photos from'),
  serviceSlug: z.string().optional().describe('Service slug to find related photos'),
  limit: z.number().min(1).max(12).default(6).describe('Number of photos to return'),
})

type GetPhotoGalleryInput = z.infer<typeof getPhotoGallerySchema>

const getPhotoCollectionsSchema = z.object({
  slug: z.string().optional().describe('Get a specific collection by slug'),
})

type GetPhotoCollectionsInput = z.infer<typeof getPhotoCollectionsSchema>

// ─── getPhotoGallery ─────────────────────────────────────────────────────────

export const getPhotoGallery = defineTool({
  description: 'Get photos from PICC media library and stories by topic, story, service, or tags.',
  parameters: getPhotoGallerySchema,
  execute: async (input: GetPhotoGalleryInput) => {
    const { topic, storyId, serviceSlug, limit } = input
    const supabase = getSupabase()

    // 1. If a specific story is requested, get its attached media
    if (storyId) {
      const { data } = await supabase
        .from('story_media')
        .select('id, file_path, file_name, alt_text, caption, supabase_bucket')
        .eq('story_id', storyId)
        .eq('media_type', 'image')
        .limit(limit)

      return {
        photos: (data || []).map(m => ({
          id: m.id,
          url: buildPublicUrl(m.supabase_bucket, m.file_path),
          alt: m.alt_text || m.file_name,
          caption: m.caption,
        })),
        total: data?.length || 0,
      }
    }

    // 2. Search media_files library by tags first (most reliable source)
    let photos: { id: string; url: string; alt: string; caption: string | null }[] = []

    // Build tag candidates from the topic/service
    const tagCandidates: string[] = []
    if (serviceSlug) {
      tagCandidates.push(`service:${serviceSlug}`)
    } else if (topic) {
      const topicLower = topic.toLowerCase()
      // Map topic keywords to known project/event tags
      const tagMap: Array<{ keywords: string[]; tag: string }> = [
        { keywords: ['elder', 'cultural trip', 'elders trip'], tag: 'project:elders-trips' },
        { keywords: ['photo studio', 'photo shoot', 'professional photo'], tag: 'event:photo-shoot-oct-2025' },
        { keywords: ['storm', 'cyclone', 'recovery', 'kirrilee'], tag: 'project:storm-recovery' },
        { keywords: ['server', 'local server', 'digital', 'internet'], tag: 'project:local-server' },
        { keywords: ['centre', 'station', 'the centre'], tag: 'project:the-centre-the-station' },
        { keywords: ['health'], tag: 'service:health-services' },
        { keywords: ['family', 'children'], tag: 'service:family-services' },
        { keywords: ['justice'], tag: 'service:justice-services' },
        { keywords: ['youth'], tag: 'service:youth-services' },
        { keywords: ['housing'], tag: 'service:housing' },
        { keywords: ['crisis', 'safe house'], tag: 'service:crisis-services' },
      ]
      for (const { keywords, tag } of tagMap) {
        if (keywords.some(kw => topicLower.includes(kw))) {
          tagCandidates.push(tag)
        }
      }
      // Also try generic kebab-case as a tag and as project: prefix
      const kebab = topicLower.replace(/\s+/g, '-')
      tagCandidates.push(kebab, `project:${kebab}`)
    }

    // Tag-based search on media_files
    if (tagCandidates.length > 0) {
      const { data } = await supabase
        .from('media_files')
        .select('id, public_url, file_path, bucket_name, original_filename, title, description, tags, rating')
        .eq('file_type', 'image')
        .is('deleted_at', null)
        .overlaps('tags', tagCandidates)
        .order('rating', { ascending: false, nullsFirst: false })
        .order('created_at', { ascending: false })
        .limit(limit)

      photos = (data || [])
        .map(m => ({ id: m.id, url: resolveMediaUrl(m), alt: m.title || m.original_filename, caption: m.description }))
        .filter((p): p is typeof p & { url: string } => p.url !== null)
    }

    // 3. Fallback: text search on media_files filename/title/description
    if (photos.length < limit && topic) {
      const remaining = limit - photos.length
      const likeTerm = `%${topic}%`
      const { data } = await supabase
        .from('media_files')
        .select('id, public_url, file_path, bucket_name, original_filename, title, description, tags, rating')
        .eq('file_type', 'image')
        .is('deleted_at', null)
        .or(`original_filename.ilike.${likeTerm},title.ilike.${likeTerm},description.ilike.${likeTerm}`)
        .order('rating', { ascending: false, nullsFirst: false })
        .order('created_at', { ascending: false })
        .limit(remaining)

      const existingIds = new Set(photos.map(p => p.id))
      const extra = (data || [])
        .map(m => ({ id: m.id, url: resolveMediaUrl(m), alt: m.title || m.original_filename, caption: m.description }))
        .filter((p): p is typeof p & { url: string } => p.url !== null)
        .filter(m => !existingIds.has(m.id))
      photos = [...photos, ...extra].slice(0, limit)
    }

    // 4. Last resort: search story_media via related stories
    if (photos.length < limit) {
      const remaining = limit - photos.length
      let storyQuery = supabase
        .from('stories')
        .select('id')
        .eq('status', 'published')
        .limit(10)

      if (serviceSlug) {
        storyQuery = storyQuery.eq('related_service', serviceSlug)
      } else if (topic) {
        storyQuery = storyQuery.or(`title.ilike.%${topic}%,tags.cs.{${topic}}`)
      }

      const { data: storyData } = await storyQuery
      if (storyData && storyData.length > 0) {
        const storyIds = storyData.map(s => s.id)
        const { data: mediaData } = await supabase
          .from('story_media')
          .select('id, file_path, file_name, alt_text, caption, supabase_bucket')
          .eq('media_type', 'image')
          .in('story_id', storyIds)
          .limit(remaining)

        const existingIds = new Set(photos.map(p => p.id))
        const storyPhotos = (mediaData || [])
          .filter(m => !existingIds.has(m.id))
          .map(m => ({
            id: m.id,
            url: buildPublicUrl(m.supabase_bucket, m.file_path),
            alt: m.alt_text || m.file_name,
            caption: m.caption,
          }))
        photos = [...photos, ...storyPhotos].slice(0, limit)
      }
    }

    return {
      photos,
      total: photos.length,
    }
  },
})

// ─── getPhotoCollections ────────────────────────────────────────────────────

export const getPhotoCollections = defineTool({
  description: 'Get curated photo collections — named galleries of photos grouped by theme, event, or project.',
  parameters: getPhotoCollectionsSchema,
  execute: async (input: GetPhotoCollectionsInput) => {
    const { slug } = input
    const supabase = getSupabase()

    if (slug) {
      const { data: collection } = await supabase
        .from('photo_collections')
        .select('id, name, slug, description, item_count, is_public')
        .eq('slug', slug)
        .eq('is_public', true)
        .single()

      if (!collection) return { found: false }

      // Get photos in this collection via collection_items
      const { data: items } = await supabase
        .from('collection_items')
        .select('media_files(id, file_url, alt_text, caption, tags)')
        .eq('collection_id', collection.id)
        .limit(20)

      return {
        found: true,
        collection,
        photos: items?.map((i: any) => i.media_files).filter(Boolean) || [],
      }
    }

    const { data: collections } = await supabase
      .from('photo_collections')
      .select('name, slug, description, item_count, is_public')
      .eq('is_public', true)
      .order('created_at', { ascending: false })

    return { collections: collections || [], count: collections?.length || 0 }
  },
})
