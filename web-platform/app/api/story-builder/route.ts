import { NextRequest, NextResponse } from 'next/server'
import { cookies } from 'next/headers'
import { createServerClient, type CookieOptions } from '@supabase/ssr'
import { createServerSupabase } from '@/lib/supabase/client'

export const runtime = 'nodejs'

function isDev(request: NextRequest) {
  if (process.env.NODE_ENV === 'production') return false
  const host = request.headers.get('host') || ''
  return host.includes('localhost') || host.includes('127.0.0.1')
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
  if (isDev(request)) return { ok: true as const, userId: null }

  const userId = await getUserIdFromCookies()
  if (!userId) return { ok: false as const, userId: null }

  return { ok: true as const, userId }
}

async function tagMediaFilesForProject(params: {
  supabase: any
  urls: string[]
  projectId: string
  projectSlug: string
  usageContext: string
}) {
  const { supabase, urls, projectId, projectSlug, usageContext } = params
  const uniqueUrls = Array.from(new Set(urls.map((u) => String(u || '').trim()).filter(Boolean)))
  if (uniqueUrls.length === 0) return

  for (const url of uniqueUrls) {
    const { data: rows } = await supabase
      .from('media_files')
      .select('id, tags')
      .eq('public_url', url)
      .is('deleted_at', null)

    if (!rows || rows.length === 0) continue

    for (const row of rows) {
      const tags = new Set<string>(Array.isArray(row.tags) ? row.tags : [])
      tags.add(`project:${projectSlug}`)
      tags.add(`usage:${usageContext}`)

      await supabase
        .from('media_files')
        .update({
          project_id: projectId,
          usage_context: usageContext,
          tags: Array.from(tags),
        })
        .eq('id', row.id)
    }
  }
}

function mapDbSectionToEditor(section: any, extra: { events?: any[]; images?: any[] }) {
  const data: any = {
    title: section.title,
    content: section.content,
    mediaUrl: section.media_url,
    mediaType: section.media_type,
    mediaPosition: section.media_position,
    caption: section.media_caption,
    alt: section.media_alt,
    photoUrl: section.media_url,
    quote: section.content,
    author: section.quote_author,
    role: section.quote_role,
    videoUrl: section.media_url,
    imageUrl: section.media_url,
    text: section.title,
    subtitle: section.content,
    images:
      extra.images?.map((img: any) => ({
        url: img.image_url,
        alt: img.image_alt,
        caption: img.image_caption,
      })) || [],
    events: extra.events || [],
  }

  return {
    id: section.id,
    type: section.section_type,
    order: section.section_order,
    data,
  }
}

export async function GET(request: NextRequest) {
  try {
    const access = await ensureAccess(request)
    if (!access.ok) {
      return NextResponse.json({ error: 'Authentication required' }, { status: 403 })
    }

    const { searchParams } = new URL(request.url)
    const projectSlug = (searchParams.get('projectSlug') || '').trim()
    if (!projectSlug) {
      return NextResponse.json({ error: 'Missing projectSlug' }, { status: 400 })
    }

    const supabase = createServerSupabase() as any

    const { data: project, error: projectError } = await supabase
      .from('projects')
      .select('id, name, slug')
      .eq('slug', projectSlug)
      .single()

    if (projectError || !project) {
      return NextResponse.json({ error: 'Project not found' }, { status: 404 })
    }

    const { data: story, error: storyError } = await supabase
      .from('immersive_stories')
      .select('*')
      .eq('project_id', project.id)
      .order('created_at', { ascending: false })
      .limit(1)
      .maybeSingle()

    if (storyError) {
      return NextResponse.json({ error: storyError.message }, { status: 500 })
    }

    if (!story) {
      return NextResponse.json({ project, story: null, sections: [] })
    }

    const { data: sections, error: sectionsError } = await supabase
      .from('story_sections')
      .select('*')
      .eq('story_id', story.id)
      .order('section_order')

    if (sectionsError) {
      return NextResponse.json({ error: sectionsError.message }, { status: 500 })
    }

    const sectionsWithData = await Promise.all(
      (sections || []).map(async (section: any) => {
        if (section.section_type === 'timeline') {
          const { data: events, error } = await supabase
            .from('story_timeline_events')
            .select('*')
            .eq('section_id', section.id)
            .order('event_order')
          if (error) throw error
          return mapDbSectionToEditor(section, { events: events || [] })
        }

        if (section.section_type === 'gallery') {
          const { data: images, error } = await supabase
            .from('story_gallery_images')
            .select('*')
            .eq('section_id', section.id)
            .order('image_order')
          if (error) throw error
          return mapDbSectionToEditor(section, { images: images || [] })
        }

        return mapDbSectionToEditor(section, {})
      })
    )

    return NextResponse.json({ project, story, sections: sectionsWithData })
  } catch (error: any) {
    return NextResponse.json(
      { error: error?.message || 'Failed to load story' },
      { status: 500 }
    )
  }
}

export async function POST(request: NextRequest) {
  try {
    const access = await ensureAccess(request)
    if (!access.ok) {
      return NextResponse.json({ error: 'Authentication required' }, { status: 403 })
    }

    const body = await request.json()
    const projectSlug = (body?.projectSlug || '').trim()
    const title = (body?.title || '').trim()
    const subtitle = (body?.subtitle || '').trim()
    const heroMediaUrl = (body?.heroMedia?.url || '').trim()
    const heroMediaType = body?.heroMedia?.type === 'video' ? 'video' : 'image'
    const sections = Array.isArray(body?.sections) ? body.sections : []

    if (!projectSlug) {
      return NextResponse.json({ error: 'Missing projectSlug' }, { status: 400 })
    }
    if (!title) {
      return NextResponse.json({ error: 'Missing title' }, { status: 400 })
    }

    const supabase = createServerSupabase() as any

    const { data: project, error: projectError } = await supabase
      .from('projects')
      .select('id')
      .eq('slug', projectSlug)
      .single()

    if (projectError || !project) {
      return NextResponse.json({ error: 'Project not found' }, { status: 404 })
    }

    const slug = `${projectSlug}-story`
    const storyUpsert: any = {
      project_id: project.id,
      title,
      subtitle: subtitle || null,
      slug,
      hero_media_url: heroMediaUrl || null,
      hero_media_type: heroMediaType,
    }

    const userId = access.userId || (await getUserIdFromCookies())
    if (userId) storyUpsert.created_by = userId

    const { data: story, error: storyError } = await supabase
      .from('immersive_stories')
      .upsert(storyUpsert, { onConflict: 'slug' })
      .select('*')
      .single()

    if (storyError || !story) {
      return NextResponse.json(
        { error: storyError?.message || 'Failed to create story' },
        { status: 500 }
      )
    }

    const { error: deleteSectionsError } = await supabase
      .from('story_sections')
      .delete()
      .eq('story_id', story.id)

    if (deleteSectionsError) {
      return NextResponse.json({ error: deleteSectionsError.message }, { status: 500 })
    }

    const usedMediaUrls: string[] = []
    if (heroMediaUrl) usedMediaUrls.push(heroMediaUrl)

    for (const section of sections) {
      const sectionData = section?.data || {}
      const sectionType = String(section?.type || '').trim()
      if (sectionData.mediaUrl) usedMediaUrls.push(sectionData.mediaUrl)
      if (sectionData.videoUrl) usedMediaUrls.push(sectionData.videoUrl)
      if (sectionData.imageUrl) usedMediaUrls.push(sectionData.imageUrl)
      if (sectionType === 'gallery' && Array.isArray(sectionData.images)) {
        for (const img of sectionData.images) {
          if (img?.url) usedMediaUrls.push(img.url)
        }
      }
    }

    for (let i = 0; i < sections.length; i++) {
      const section = sections[i]
      const sectionType = String(section?.type || '').trim()
      const sectionData = section?.data || {}

      const { data: savedSection, error: sectionError } = await supabase
        .from('story_sections')
        .insert({
          story_id: story.id,
          section_order: i,
          section_type: sectionType,
          title: sectionData.title || sectionData.text || null,
          content: sectionData.content || sectionData.quote || sectionData.subtitle || null,
          media_url: sectionData.mediaUrl || sectionData.videoUrl || sectionData.imageUrl || sectionData.photoUrl || null,
          media_type: sectionData.mediaType || (sectionData.photoUrl ? 'image' : null),
          media_position: sectionData.mediaPosition || null,
          media_caption: sectionData.caption || null,
          media_alt: sectionData.alt || null,
          quote_author: sectionData.author || null,
          quote_role: sectionData.role || null,
        })
        .select('id')
        .single()

      if (sectionError || !savedSection) {
        return NextResponse.json(
          { error: sectionError?.message || 'Failed to save section' },
          { status: 500 }
        )
      }

      if (sectionType === 'timeline' && Array.isArray(sectionData.events)) {
        const rows = sectionData.events
          .map((event: any) => {
            const eventDate = String(event?.date ?? '').trim()
            const eventTitle = String(event?.title ?? '').trim()
            const eventDescription = String(event?.description ?? '').trim()

            // Skip completely empty rows (common while drafting).
            if (!eventDate && !eventTitle && !eventDescription) return null

            return {
              section_id: savedSection.id,
              event_date: eventDate,
              event_title: eventTitle,
              event_description: eventDescription,
              is_complete: event?.isComplete !== false,
            }
          })
          .filter(Boolean)
          .map((row: any, idx: number) => ({ ...row, event_order: idx }))

        if (rows.length > 0) {
          const { error } = await supabase.from('story_timeline_events').insert(rows)
          if (error) return NextResponse.json({ error: error.message }, { status: 500 })
        }
      }

      if (sectionType === 'gallery' && Array.isArray(sectionData.images)) {
        const rows = sectionData.images
          .map((image: any, idx: number) => ({
            section_id: savedSection.id,
            image_order: idx,
            image_url: image.url,
            // DB schema requires NOT NULL; allow empty alt text for drafts.
            image_alt: String(image?.alt ?? ''),
            image_caption: image.caption,
          }))
          .filter((row: any) => !!row.image_url)
        if (rows.length > 0) {
          const { error } = await supabase.from('story_gallery_images').insert(rows)
          if (error) return NextResponse.json({ error: error.message }, { status: 500 })
        }
      }
    }

    // Ensure any media referenced by the story is discoverable from the Media Library.
    await tagMediaFilesForProject({
      supabase,
      urls: usedMediaUrls,
      projectId: project.id,
      projectSlug,
      usageContext: 'immersive_story',
    })

    return NextResponse.json({ storyId: story.id, slug: story.slug })
  } catch (error: any) {
    return NextResponse.json(
      { error: error?.message || 'Failed to save story' },
      { status: 500 }
    )
  }
}
