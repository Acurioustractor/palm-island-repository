import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@supabase/supabase-js'
import { cookies } from 'next/headers'
import { createServerClient } from '@supabase/ssr'

export const runtime = 'nodejs'

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

async function getAuthenticatedAdmin(): Promise<boolean> {
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
    if (!user) return false

    const { data: profile } = await (supabase as any)
      .from('profiles')
      .select('role')
      .eq('user_id', user.id)
      .single()

    return profile?.role === 'admin' || profile?.role === 'staff'
  } catch {
    return false
  }
}

type Body = {
  mediaId?: string
  pageContext?: string
  pageSection?: string
}

export async function POST(request: NextRequest) {
  try {
    const isAdmin = await getAuthenticatedAdmin()
    if (!isAdmin) {
      return NextResponse.json({ error: 'Admin access required' }, { status: 403 })
    }

    const body = (await request.json().catch(() => ({}))) as Body
    const mediaId = String(body.mediaId || '').trim()
    const pageContext = String(body.pageContext || '').trim()
    const pageSection = String(body.pageSection || '').trim()

    if (!mediaId) return NextResponse.json({ error: 'mediaId required' }, { status: 400 })
    if (!pageContext) return NextResponse.json({ error: 'pageContext required' }, { status: 400 })
    if (!pageSection) return NextResponse.json({ error: 'pageSection required' }, { status: 400 })

    const supabase = getServerClient()

    // Unfeatured any existing image in this slot
    await (supabase as any)
      .from('media_files')
      .update({ is_featured: false })
      .eq('page_context', pageContext)
      .eq('page_section', pageSection)
      .eq('is_featured', true)

    // Feature the new image in this slot
    const { error: updateError } = await (supabase as any)
      .from('media_files')
      .update({
        page_context: pageContext,
        page_section: pageSection,
        is_featured: true,
      })
      .eq('id', mediaId)

    if (updateError) {
      return NextResponse.json({ error: updateError.message }, { status: 500 })
    }

    return NextResponse.json({ ok: true })
  } catch (error: any) {
    return NextResponse.json({ error: error?.message || 'Assign failed' }, { status: 500 })
  }
}
