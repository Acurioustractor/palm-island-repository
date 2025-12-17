import { NextRequest, NextResponse } from 'next/server'
import { cookies } from 'next/headers'
import { createServerClient, type CookieOptions } from '@supabase/ssr'
import { createServerSupabase } from '@/lib/supabase/client'

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
  if (isDev(request)) return { ok: true }
  const userId = await getUserIdFromCookies()
  return { ok: !!userId }
}

function formatDateForTimeline(d: Date) {
  return d.toLocaleDateString('en-AU', { day: 'numeric', month: 'short', year: 'numeric' })
}

export async function GET(request: NextRequest) {
  try {
    const access = await ensureAccess(request)
    if (!access.ok) return NextResponse.json({ error: 'Authentication required' }, { status: 403 })

    const { searchParams } = new URL(request.url)
    const projectSlug = (searchParams.get('projectSlug') || '').trim()
    if (!projectSlug) return NextResponse.json({ error: 'Missing projectSlug' }, { status: 400 })

    const supabase = createServerSupabase() as any

    const { data: project, error: projectError } = await supabase
      .from('projects')
      .select('id, name, slug, tagline, description, hero_image_url')
      .eq('slug', projectSlug)
      .single()

    if (projectError || !project) return NextResponse.json({ error: 'Project not found' }, { status: 404 })

    // Pick recent media tagged to this project (or with project_id).
    const { data: byProjectId } = await supabase
      .from('media_files')
      .select('id, public_url, file_type, title, created_at, tags')
      .is('deleted_at', null)
      .eq('is_public', true)
      .eq('project_id', project.id)
      .order('created_at', { ascending: false })
      .limit(24)

    const { data: byTag } = await supabase
      .from('media_files')
      .select('id, public_url, file_type, title, created_at, tags')
      .is('deleted_at', null)
      .eq('is_public', true)
      .contains('tags', [`project:${projectSlug}`])
      .order('created_at', { ascending: false })
      .limit(24)

    const merged: any[] = []
    const seen = new Set<string>()
    for (const row of [...(byProjectId || []), ...(byTag || [])]) {
      if (!row?.id || seen.has(row.id)) continue
      seen.add(row.id)
      merged.push(row)
    }

    const images = merged.filter((m: any) => m.file_type === 'image')
    const videos = merged.filter((m: any) => m.file_type === 'video')

    const hero = images[0] || videos[0]
    const heroMedia = hero
      ? { url: hero.public_url, type: hero.file_type === 'video' ? 'video' : 'image' }
      : project.hero_image_url
        ? { url: project.hero_image_url, type: 'image' }
        : { url: '', type: 'image' }

    // Use published project updates as a draft timeline.
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

    const galleryImages = images.slice(0, 10).map((img: any) => ({
      url: img.public_url,
      alt: '',
      caption: img.title || '',
    }))

    const sections: any[] = []
    if (project.description) {
      sections.push({
        id: `gen-${Date.now()}-intro`,
        type: 'text',
        order: 0,
        data: { title: 'About the Project', content: project.description },
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
