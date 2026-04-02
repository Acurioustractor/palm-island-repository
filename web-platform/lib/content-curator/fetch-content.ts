import { createServerSupabase } from '@/lib/supabase/client'
import type { ContentItem, CurationContext } from './types'

function daysSince(dateStr: string | null | undefined): number {
  if (!dateStr) return 365
  const diff = Date.now() - new Date(dateStr).getTime()
  return Math.max(0, Math.floor(diff / (1000 * 60 * 60 * 24)))
}

function recencyBonus(dateStr: string | null | undefined): number {
  const days = daysSince(dateStr)
  if (days < 30) return 15
  if (days < 90) return 10
  if (days < 180) return 5
  return 0
}

export async function fetchAvailableContent(
  context?: CurationContext
): Promise<ContentItem[]> {
  const supabase = createServerSupabase()
  const items: ContentItem[] = []

  // Fetch stories (is_public = true)
  const { data: stories } = await (supabase as any)
    .from('stories')
    .select('id, title, content, excerpt, attribution, created_at, tags, quality_score, engagement_score, is_featured, report_worthy, featured_image_url, status')
    .eq('is_public', true)
    .order('created_at', { ascending: false })
    .limit(200)

  if (stories) {
    for (const s of stories as any[]) {
      const qualityScore = (s.quality_score ?? 50) + (s.engagement_score ?? 0)
      const base = Math.min(qualityScore, 80)
      const boost =
        (s.is_featured ? 15 : 0) +
        (s.report_worthy ? 10 : 0) +
        recencyBonus(s.created_at)

      items.push({
        id: s.id,
        type: 'story',
        title: s.title || 'Untitled Story',
        preview: s.excerpt || (s.content || '').slice(0, 180) + ((s.content || '').length > 180 ? '...' : ''),
        imageUrl: s.featured_image_url ?? null,
        author: s.attribution ?? null,
        date: s.created_at ?? null,
        tags: Array.isArray(s.tags) ? s.tags : [],
        score: Math.min(100, base + boost),
        selected: false,
        metadata: {
          status: s.status,
          is_featured: s.is_featured,
          report_worthy: s.report_worthy,
        },
      })
    }
  }

  // Fetch validated quotes
  const { data: quotes } = await (supabase as any)
    .from('extracted_quotes')
    .select('id, quote_text, attribution, theme, created_at, suggested_for_report, story_id')
    .eq('is_validated', true)
    .order('created_at', { ascending: false })
    .limit(200)

  if (quotes) {
    for (const q of quotes as any[]) {
      const base = 50
      const boost =
        (q.suggested_for_report ? 20 : 0) +
        (q.theme ? 10 : 0) +
        recencyBonus(q.created_at)

      items.push({
        id: q.id,
        type: 'quote',
        title: q.attribution ? `Quote by ${q.attribution}` : 'Community Quote',
        preview: (q.quote_text || '').slice(0, 200),
        imageUrl: null,
        author: q.attribution ?? null,
        date: q.created_at ?? null,
        tags: q.theme ? [q.theme] : [],
        score: Math.min(100, base + boost),
        selected: false,
        metadata: {
          suggested_for_report: q.suggested_for_report,
          source_story_id: q.story_id,
          theme: q.theme,
        },
      })
    }
  }

  // Fetch public photos
  const { data: photos } = await (supabase as any)
    .from('media_files')
    .select('id, title, description, public_url, created_at, is_featured, tags, file_type')
    .eq('is_public', true)
    .is('deleted_at', null)
    .eq('file_type', 'image')
    .order('created_at', { ascending: false })
    .limit(200)

  if (photos) {
    for (const p of photos as any[]) {
      const base = 55
      const boost =
        (p.is_featured ? 20 : 0) +
        recencyBonus(p.created_at)

      items.push({
        id: p.id,
        type: 'photo',
        title: p.title || 'Photo',
        preview: p.description || '',
        imageUrl: p.public_url ?? null,
        author: null,
        date: p.created_at ?? null,
        tags: Array.isArray(p.tags) ? p.tags : [],
        score: Math.min(100, base + boost),
        selected: false,
        metadata: {
          is_featured: p.is_featured,
        },
      })
    }
  }

  // Fetch public videos
  const { data: videos } = await (supabase as any)
    .from('media_files')
    .select('id, title, description, public_url, created_at, is_featured, tags, file_type')
    .eq('is_public', true)
    .is('deleted_at', null)
    .eq('file_type', 'video')
    .order('created_at', { ascending: false })
    .limit(50)

  if (videos) {
    for (const v of videos as any[]) {
      items.push({
        id: v.id,
        type: 'video',
        title: v.title || 'Video',
        preview: v.description || '',
        imageUrl: null,
        author: null,
        date: v.created_at ?? null,
        tags: Array.isArray(v.tags) ? v.tags : [],
        score: Math.min(100, 80 + recencyBonus(v.created_at)),
        selected: false,
        metadata: {
          is_featured: v.is_featured,
        },
      })
    }
  }

  // Fetch people (elders with directory visibility)
  const { data: people } = await (supabase as any)
    .from('profiles')
    .select('id, full_name, bio, profile_image_url, created_at, is_elder')
    .eq('is_elder', true)
    .eq('show_in_directory', true)
    .order('full_name', { ascending: true })
    .limit(100)

  if (people) {
    for (const p of people as any[]) {
      const base = 60
      const boost = (p.profile_image_url ? 20 : 0)

      items.push({
        id: p.id,
        type: 'person',
        title: p.full_name || 'Community Member',
        preview: (p.bio || '').slice(0, 180),
        imageUrl: p.profile_image_url ?? null,
        author: null,
        date: p.created_at ?? null,
        tags: ['elder'],
        score: Math.min(100, base + boost),
        selected: false,
        metadata: {
          is_elder: p.is_elder,
        },
      })
    }
  }

  // Sort by score descending
  items.sort((a, b) => b.score - a.score)

  return items
}
