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
  if (isDev(request)) return true
  return !!(await getUserIdFromCookies())
}

export async function GET(request: NextRequest) {
  try {
    const ok = await ensureAccess(request)
    if (!ok) return NextResponse.json({ error: 'Authentication required' }, { status: 403 })

    const { searchParams } = new URL(request.url)
    const q = (searchParams.get('q') || '').trim()
    const limit = Math.max(1, Math.min(100, Number(searchParams.get('limit') || 50)))

    const supabase = createServerSupabase() as any
    let query = supabase
      .from('projects')
      .select('id, name, slug, status, project_type, is_public, featured, updated_at')
      .order('updated_at', { ascending: false })
      .limit(limit)

    if (q) {
      const like = `%${q}%`
      query = query.or(`name.ilike.${like},slug.ilike.${like},tagline.ilike.${like}`)
    }

    const { data, error } = await query
    if (error) return NextResponse.json({ error: error.message }, { status: 500 })
    return NextResponse.json({ projects: data || [] })
  } catch (error: any) {
    return NextResponse.json({ error: error?.message || 'Failed to load projects' }, { status: 500 })
  }
}

