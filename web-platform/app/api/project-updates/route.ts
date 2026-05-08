import { NextRequest, NextResponse } from 'next/server'
import { cookies, headers } from 'next/headers'
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
  if (isDev(request)) return { ok: true as const, userId: null }

  const userId = await getUserIdFromCookies()
  if (!userId) return { ok: false as const, userId: null }
  return { ok: true as const, userId }
}

function stripHtmlToText(html: string) {
  return html
    .replace(/<script[\s\S]*?>[\s\S]*?<\/script>/gi, '')
    .replace(/<style[\s\S]*?>[\s\S]*?<\/style>/gi, '')
    .replace(/<\/(p|div|br|li|h[1-6])>/gi, '\n')
    .replace(/<[^>]+>/g, ' ')
    .replace(/\s+/g, ' ')
    .trim()
}

function sanitizeHtmlBasic(html: string) {
  // Minimal protection for admin-entered HTML: remove scripts and event handlers.
  return html
    .replace(/<script[\s\S]*?>[\s\S]*?<\/script>/gi, '')
    .replace(/\son\w+\s*=\s*"[^"]*"/gi, '')
    .replace(/\son\w+\s*=\s*'[^']*'/gi, '')
}

async function getFallbackAuthorId(supabase: any): Promise<string | null> {
  const { data } = await supabase.from('profiles').select('id').order('created_at', { ascending: true }).limit(1).maybeSingle()
  return data?.id || null
}

export async function POST(request: NextRequest) {
  try {
    const access = await ensureAccess(request)
    if (!access.ok) {
      return NextResponse.json({ error: 'Authentication required' }, { status: 403 })
    }

    const body = await request.json()

    const projectSlug = String(body?.projectSlug || '').trim()
    const updateId = body?.updateId ? String(body.updateId).trim() : null
    const title = String(body?.title || '').trim()
    const contentHtml = String(body?.contentHtml || '').trim()
    const updateType = String(body?.updateType || 'progress').trim()
    const featuredImageUrl = body?.featuredImageUrl ? String(body.featuredImageUrl).trim() : null
    const isPublished = body?.isPublished === true
    const publishedAt = body?.publishedAt ? String(body.publishedAt).trim() : null

    if (!projectSlug) return NextResponse.json({ error: 'Missing projectSlug' }, { status: 400 })
    if (!title) return NextResponse.json({ error: 'Missing title' }, { status: 400 })
    if (!contentHtml) return NextResponse.json({ error: 'Missing content' }, { status: 400 })

    const supabase = createServerSupabase() as any

    // NOTE: this lookup intentionally still hits the legacy PICC `projects`
    // table — `project_updates.project_id` is an FK against PICC `projects.id`,
    // not the EL canonical UUID. Migrating this to EL would break the FK.
    // Phase 1 of the canonical migration is read-only; the writes here
    // (`project_updates` is a PICC-only operational table) stay until Phase 5
    // resolves the FK story. See thoughts/shared/plans/2026-05-08-el-canonical-migration.md.
    const { data: project, error: projectError } = await supabase
      .from('projects')
      .select('id')
      .eq('slug', projectSlug)
      .single()

    if (projectError || !project) return NextResponse.json({ error: 'Project not found' }, { status: 404 })

    let authorId = access.userId || (await getUserIdFromCookies())
    let authorAutofilled = false
    if (!authorId) {
      authorId = await getFallbackAuthorId(supabase)
      authorAutofilled = true
    }
    if (!authorId) {
      return NextResponse.json(
        { error: 'No author profile available (create a profile or sign in)' },
        { status: 400 }
      )
    }

    const safeHtml = sanitizeHtmlBasic(contentHtml)
    const excerptText = stripHtmlToText(safeHtml)
    const excerpt = String(body?.excerpt || '').trim() || excerptText.slice(0, 240)

    const nowIso = new Date().toISOString()
    const toSave: any = {
      project_id: project.id,
      author_id: authorId,
      title,
      content: safeHtml,
      excerpt,
      update_type: updateType,
      featured_image_url: featuredImageUrl,
      is_published: isPublished,
      published_at: isPublished ? (publishedAt || nowIso) : null,
      updated_at: nowIso,
      metadata: {
        ...(body?.metadata || {}),
        editor: 'rich-text-v1',
        author_autofilled: authorAutofilled,
      },
    }

    if (!updateId) {
      toSave.created_at = nowIso
      const { data, error } = await supabase.from('project_updates').insert(toSave).select('id').single()
      if (error || !data) return NextResponse.json({ error: error?.message || 'Failed to create update' }, { status: 500 })
      return NextResponse.json({ updateId: data.id })
    }

    const { error: updateError } = await supabase
      .from('project_updates')
      .update(toSave)
      .eq('id', updateId)

    if (updateError) return NextResponse.json({ error: updateError.message }, { status: 500 })
    return NextResponse.json({ updateId })
  } catch (error: any) {
    return NextResponse.json({ error: error?.message || 'Failed to save update' }, { status: 500 })
  }
}

export async function GET(request: NextRequest) {
  try {
    const access = await ensureAccess(request)
    if (!access.ok) {
      return NextResponse.json({ error: 'Authentication required' }, { status: 403 })
    }

    const { searchParams } = new URL(request.url)
    const updateId = (searchParams.get('updateId') || '').trim()
    if (!updateId) return NextResponse.json({ error: 'Missing updateId' }, { status: 400 })

    const supabase = createServerSupabase() as any
    const { data, error } = await supabase
      .from('project_updates')
      .select('id, title, content, excerpt, update_type, featured_image_url, is_published, published_at, project_id')
      .eq('id', updateId)
      .single()

    if (error || !data) return NextResponse.json({ error: 'Update not found' }, { status: 404 })
    return NextResponse.json({ update: data })
  } catch (error: any) {
    return NextResponse.json({ error: error?.message || 'Failed to load update' }, { status: 500 })
  }
}

