import { NextResponse, NextRequest } from 'next/server'
import { createClient } from '@supabase/supabase-js'

export const runtime = 'nodejs'

function isDev(request: NextRequest) {
  if (process.env.NODE_ENV === 'production') return false
  const host = request.headers.get('host') || ''
  return host.includes('localhost') || host.includes('127.0.0.1')
}

// Server-side Supabase client with service role (bypasses RLS)
function getServerClient() {
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
  const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY

  if (!supabaseUrl || !supabaseServiceKey) {
    throw new Error('Missing Supabase credentials')
  }

  return createClient(supabaseUrl, supabaseServiceKey, {
    auth: {
      autoRefreshToken: false,
      persistSession: false,
    },
  })
}

function slugify(input: string) {
  return input
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '')
}

function uniqStrings(values: unknown) {
  const out: string[] = []
  if (!Array.isArray(values)) return out
  for (const v of values) {
    if (typeof v !== 'string') continue
    const s = v.trim()
    if (!s) continue
    if (!out.includes(s)) out.push(s)
  }
  return out
}

function extractVideoId(url: string): { platform: string; videoId: string | null } {
  // YouTube
  const youtubeMatch = url.match(/(?:youtube\.com\/(?:watch\?v=|embed\/)|youtu\.be\/)([^&\s?]+)/)
  if (youtubeMatch) return { platform: 'youtube', videoId: youtubeMatch[1] }

  // Vimeo
  const vimeoMatch = url.match(/vimeo\.com\/(\d+)/)
  if (vimeoMatch) return { platform: 'vimeo', videoId: vimeoMatch[1] }

  // Descript
  if (url.includes('descript.com')) return { platform: 'descript', videoId: null }

  // Facebook
  if (url.includes('facebook.com') || url.includes('fb.watch')) return { platform: 'facebook', videoId: null }

  // TikTok
  if (url.includes('tiktok.com')) return { platform: 'tiktok', videoId: null }

  return { platform: 'other', videoId: null }
}

function getThumbnailUrl(platform: string, videoId: string | null): string | null {
  if (platform === 'youtube' && videoId) return `https://img.youtube.com/vi/${videoId}/hqdefault.jpg`
  return null
}

function toExternalVideoRow(media: any) {
  const meta = (media?.metadata && typeof media.metadata === 'object') ? media.metadata : {}
  const ext = (meta as any)?.external_video || {}

  return {
    id: media.id,
    title: media.title,
    description: media.description ?? null,
    video_url: media.public_url,
    platform: ext.platform || 'other',
    video_id: ext.video_id ?? null,
    thumbnail_url: ext.thumbnail_url ?? (meta as any)?.thumbnail_url ?? null,
    category: ext.category ?? (meta as any)?.category ?? null,
    tags: Array.isArray(media.tags) ? media.tags : [],
    event_name: ext.event_name ?? null,
    event_date: ext.event_date ?? null,
    location: media.location ?? null,
    is_featured: media.is_featured === true,
    is_public: media.is_public !== false,
    is_hero_eligible: ext.is_hero_eligible === true,
    view_count: Number(media.view_count) || 0,
    use_count: Number(ext.use_count) || 0,
    created_at: media.created_at,
  }
}

export async function GET(request: NextRequest) {
  try {
    const supabase = getServerClient()
    const { searchParams } = new URL(request.url)

    const category = (searchParams.get('category') || '').trim()
    const isFeatured = searchParams.get('is_featured')
    const isPublic = searchParams.get('is_public')
    const limit = Math.max(1, Math.min(300, parseInt(searchParams.get('limit') || '100', 10)))

    let query = (supabase as any)
      .from('media_files')
      .select('id,title,description,public_url,file_type,tags,location,is_featured,is_public,view_count,created_at,metadata,deleted_at')
      .eq('file_type', 'video')
      .is('deleted_at', null)
      .contains('tags', ['external-video'])
      .order('created_at', { ascending: false })
      .limit(limit)

    if (isFeatured === 'true') query = query.eq('is_featured', true)
    if (isPublic === 'true') query = query.eq('is_public', true)

    const { data, error } = await query
    if (error) return NextResponse.json({ error: error.message }, { status: 500 })

    let rows = (data || []) as any[]
    if (category) {
      rows = rows.filter((r) => String((r?.metadata as any)?.external_video?.category || '').toLowerCase() === category.toLowerCase())
    }

    return NextResponse.json({ data: rows.map(toExternalVideoRow), tableExists: true })
  } catch (err: any) {
    return NextResponse.json({ error: err.message || 'Server error' }, { status: 500 })
  }
}

export async function POST(request: NextRequest) {
  try {
    if (!isDev(request)) return NextResponse.json({ error: 'Not available' }, { status: 403 })

    const supabase = getServerClient()
    const body = await request.json().catch(() => ({} as any))

    const videoUrl = String(body.video_url || '').trim()
    const title = String(body.title || '').trim()
    if (!videoUrl) return NextResponse.json({ error: 'video_url required' }, { status: 400 })
    if (!title) return NextResponse.json({ error: 'title required' }, { status: 400 })

    const { platform, videoId } = extractVideoId(videoUrl)
    const thumbnail = body.thumbnail_url || getThumbnailUrl(platform, videoId)

    const baseSlug = slugify(title) || slugify(videoUrl) || 'external-video'
    const stamp = Date.now()

    const tags = Array.from(
      new Set([
        ...uniqStrings(body.tags),
        'external-video',
        `platform:${body.platform || platform || 'other'}`,
      ])
    )

    const metadata = {
      ...(typeof body.metadata === 'object' && body.metadata ? body.metadata : {}),
      thumbnail_url: thumbnail || null,
      external_video: {
        platform: body.platform || platform || 'other',
        video_id: body.video_id || videoId || null,
        thumbnail_url: thumbnail || null,
        category: body.category || null,
        event_name: body.event_name || null,
        event_date: body.event_date || null,
        is_hero_eligible: body.is_hero_eligible === true,
        use_count: 0,
        source_url: videoUrl,
      },
    }

    const insertData: any = {
      // Required fields for media_files
      filename: `${baseSlug}-${stamp}.link`,
      original_filename: `${title}.link`,
      file_path: `external-videos/${baseSlug}-${stamp}.link`,
      bucket_name: 'story-media',
      public_url: videoUrl,
      file_type: 'video',
      mime_type: 'text/url',
      file_size: 0,

      title,
      description: body.description || null,
      tags,
      location: body.location || null,
      is_featured: body.is_featured === true,
      is_public: body.is_public !== false,
      metadata,
    }

    // If your DB has these newer columns, allow passing them through (safe to omit if absent).
    if (typeof body.page_context === 'string') insertData.page_context = body.page_context
    if (typeof body.page_section === 'string') insertData.page_section = body.page_section
    if (typeof body.context_metadata === 'object' && body.context_metadata) insertData.context_metadata = body.context_metadata

    const { data, error } = await (supabase as any)
      .from('media_files')
      .insert(insertData)
      .select('id,title,description,public_url,tags,location,is_featured,is_public,view_count,created_at,metadata')
      .single()

    if (error) return NextResponse.json({ error: error.message }, { status: 500 })
    return NextResponse.json({ data: toExternalVideoRow(data) })
  } catch (err: any) {
    return NextResponse.json({ error: err.message || 'Server error' }, { status: 500 })
  }
}

export async function PATCH(request: NextRequest) {
  try {
    if (!isDev(request)) return NextResponse.json({ error: 'Not available' }, { status: 403 })

    const supabase = getServerClient()
    const body = await request.json().catch(() => ({} as any))
    const id = String(body.id || '').trim()
    if (!id) return NextResponse.json({ error: 'Video ID required' }, { status: 400 })

    const { data: existing, error: existingError } = await (supabase as any)
      .from('media_files')
      .select('id,metadata,tags')
      .eq('id', id)
      .single()

    if (existingError) return NextResponse.json({ error: existingError.message }, { status: 404 })

    const videoUrl = typeof body.video_url === 'string' ? body.video_url.trim() : undefined
    const { platform, videoId } = videoUrl ? extractVideoId(videoUrl) : { platform: undefined, videoId: null }
    const thumbnail = body.thumbnail_url || (videoUrl ? getThumbnailUrl(platform as any, videoId) : undefined)

    const prevMeta = (existing?.metadata && typeof existing.metadata === 'object') ? existing.metadata : {}
    const prevExt = (prevMeta as any)?.external_video || {}

    const nextExt = {
      ...prevExt,
      platform: body.platform || prevExt.platform || platform || 'other',
      video_id: body.video_id || prevExt.video_id || videoId || null,
      thumbnail_url: body.thumbnail_url || prevExt.thumbnail_url || thumbnail || null,
      category: body.category !== undefined ? body.category : prevExt.category ?? null,
      event_name: body.event_name !== undefined ? body.event_name : prevExt.event_name ?? null,
      event_date: body.event_date !== undefined ? body.event_date : prevExt.event_date ?? null,
      is_hero_eligible: body.is_hero_eligible !== undefined ? body.is_hero_eligible === true : prevExt.is_hero_eligible === true,
    }

    const nextMeta = {
      ...prevMeta,
      thumbnail_url: nextExt.thumbnail_url ?? (prevMeta as any)?.thumbnail_url ?? null,
      external_video: nextExt,
    }

    const nextTags = Array.from(
      new Set([
        ...uniqStrings(body.tags ?? existing.tags),
        'external-video',
        `platform:${nextExt.platform || 'other'}`,
      ])
    )

    const update: any = {
      title: body.title,
      description: body.description ?? null,
      public_url: videoUrl,
      location: body.location ?? null,
      tags: nextTags,
      is_featured: body.is_featured === true,
      is_public: body.is_public !== false,
      metadata: nextMeta,
    }

    Object.keys(update).forEach((k) => update[k] === undefined && delete update[k])

    const { data, error } = await (supabase as any)
      .from('media_files')
      .update(update)
      .eq('id', id)
      .select('id,title,description,public_url,tags,location,is_featured,is_public,view_count,created_at,metadata')
      .single()

    if (error) return NextResponse.json({ error: error.message }, { status: 500 })
    return NextResponse.json({ data: toExternalVideoRow(data) })
  } catch (err: any) {
    return NextResponse.json({ error: err.message || 'Server error' }, { status: 500 })
  }
}

export async function DELETE(request: NextRequest) {
  try {
    if (!isDev(request)) return NextResponse.json({ error: 'Not available' }, { status: 403 })

    const supabase = getServerClient()
    const { searchParams } = new URL(request.url)
    const id = searchParams.get('id')
    if (!id) return NextResponse.json({ error: 'Video ID required' }, { status: 400 })

    const { error } = await (supabase as any)
      .from('media_files')
      .update({ deleted_at: new Date().toISOString(), is_public: false })
      .eq('id', id)

    if (error) return NextResponse.json({ error: error.message }, { status: 500 })
    return NextResponse.json({ success: true })
  } catch (err: any) {
    return NextResponse.json({ error: err.message || 'Server error' }, { status: 500 })
  }
}
