import { NextRequest, NextResponse } from 'next/server'
import { cookies } from 'next/headers'
import { createServerClient, type CookieOptions } from '@supabase/ssr'
import { getPiccProjects } from '@/lib/empathy-ledger/el-projects'

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
    const q = (searchParams.get('q') || '').trim().toLowerCase()
    const limit = Math.max(1, Math.min(100, Number(searchParams.get('limit') || 50)))

    // Phase 1 canonical migration: projects come from Empathy Ledger v2.
    // EL doesn't expose `is_public` / `featured` (PICC-only flags); callers
    // that care about those used to filter out cancelled rows by hand —
    // we surface `is_public: status !== 'cancelled'` as the equivalent and
    // omit `featured` (drop on read; was advisory anyway).
    const projects = await getPiccProjects({ status: 'all' })
    const filtered = q
      ? projects.filter(
          (p) =>
            p.name?.toLowerCase().includes(q) ||
            p.slug.toLowerCase().includes(q) ||
            p.tagline?.toLowerCase().includes(q),
        )
      : projects
    const data = filtered.slice(0, limit).map((p) => ({
      id: p.id,
      name: p.name,
      slug: p.slug,
      status: p.status,
      project_type: p.project_type,
      is_public: p.status !== 'cancelled',
      featured: false,
      updated_at: p.updated_at,
    }))
    return NextResponse.json({ projects: data })
  } catch (error: any) {
    return NextResponse.json({ error: error?.message || 'Failed to load projects' }, { status: 500 })
  }
}

