import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@supabase/supabase-js'
import { cookies } from 'next/headers'
import { createServerClient } from '@supabase/ssr'

export const runtime = 'nodejs'

function isDev(request: NextRequest) {
  if (process.env.NODE_ENV === 'production') return false
  const host = request.headers.get('host') || ''
  return host.includes('localhost') || host.includes('127.0.0.1')
}

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

async function isAuthenticated(): Promise<boolean> {
  try {
    const cookieStore = await cookies()
    const supabase = createServerClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
      {
        cookies: {
          getAll() {
            return cookieStore.getAll()
          },
          setAll(cookiesToSet: any) {
            cookiesToSet.forEach(({ name, value, options }: any) => {
              try { cookieStore.set(name, value, options) } catch {}
            })
          },
        } as any,
      }
    )
    const { data: { user } } = await supabase.auth.getUser()
    return !!user
  } catch {
    return false
  }
}

function splitCsv(value: string | null) {
  if (!value) return []
  return value
    .split(',')
    .map((s) => s.trim())
    .filter(Boolean)
}

export async function GET(request: NextRequest) {
  try {
    // Allow in dev mode OR for authenticated users (admin panel)
    const isDevMode = isDev(request)
    const isAuth = await isAuthenticated()
    if (!isDevMode && !isAuth) {
      return NextResponse.json({ error: 'Authentication required' }, { status: 403 })
    }

    const supabase = getServerClient()
    const { searchParams } = new URL(request.url)

    const limit = Math.max(1, Math.min(500, Number(searchParams.get('limit') || 200)))
    const offset = Math.max(0, Number(searchParams.get('offset') || 0))
    const fileType = (searchParams.get('fileType') || '').trim()
    const tags = splitCsv(searchParams.get('tags'))
    const q = (searchParams.get('q') || '').trim()
    const person = (searchParams.get('person') || '').trim()

    let query = (supabase as any)
      .from('media_files')
      .select('*', { count: 'exact' })
      .eq('is_public', true)
      .is('deleted_at', null)

    // Sorting
    const sortParam = (searchParams.get('sort') || '').trim()
    switch (sortParam) {
      case 'oldest':
        query = query.order('created_at', { ascending: true })
        break
      case 'filename':
        query = query.order('original_filename', { ascending: true })
        break
      case 'size':
        query = query.order('file_size', { ascending: false })
        break
      case 'rating':
        query = query.order('rating', { ascending: false })
        break
      case 'newest':
      default:
        query = query.order('created_at', { ascending: false })
        break
    }

    query = query.range(offset, offset + limit - 1)

    const featured = searchParams.get('featured')
    const pageContext = (searchParams.get('pageContext') || '').trim()
    const pageSection = (searchParams.get('pageSection') || '').trim()

    const minRating = Number(searchParams.get('minRating') || 0)
    const colorLabelParam = (searchParams.get('colorLabel') || '').trim()

    if (fileType && fileType !== 'all') query = query.eq('file_type', fileType)
    if (tags.length > 0) query = query.contains('tags', tags)
    if (featured === 'true') query = query.eq('is_featured', true)
    if (pageContext) query = query.eq('page_context', pageContext)
    if (pageSection) query = query.eq('page_section', pageSection)
    if (minRating > 0) query = query.gte('rating', minRating)
    if (colorLabelParam) query = query.eq('color_label', colorLabelParam)

    if (person && person !== 'all') {
      // faces_detected is stored as an array of profile IDs.
      query = query.contains('faces_detected', [person])
    }

    // Service tag filter (shortcut for contains('tags', ['service:{slug}']))
    const service = (searchParams.get('service') || '').trim()
    if (service) query = query.contains('tags', [`service:${service}`])

    if (q) {
      const like = `%${q.replace(/%/g, '\\%')}%`
      query = query.or(`title.ilike.${like},description.ilike.${like},original_filename.ilike.${like}`)
    }

    const { data, error, count } = await query
    if (error) return NextResponse.json({ error: error.message }, { status: 500 })

    return NextResponse.json({ data: data || [], count: count || 0 })
  } catch (error: any) {
    return NextResponse.json({ error: error?.message || 'Failed to load media' }, { status: 500 })
  }
}

