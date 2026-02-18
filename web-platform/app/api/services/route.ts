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

function slugify(input: string) {
  return input
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '')
}

const DEFAULT_PICC_ORG_ID = '3c2011b9-f80d-4289-b300-0cd383cff479'

export async function GET() {
  try {
    const supabase = getServerClient()
    const { data, error } = await supabase
      .from('organization_services')
      .select('id, name, slug, service_category, description, is_active, metadata, organization_id, created_at, updated_at')
      .order('name', { ascending: true })
      .limit(500)

    if (error) return NextResponse.json({ error: error.message }, { status: 500 })
    return NextResponse.json({ services: data || [] })
  } catch (error: any) {
    return NextResponse.json({ error: error?.message || 'Failed to load services' }, { status: 500 })
  }
}

export async function POST(request: NextRequest) {
  try {
    if (!(await isAuthenticated())) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

    const body = (await request.json().catch(() => ({}))) as {
      name?: string
      slug?: string
      service_category?: string
      description?: string
      is_active?: boolean
      organization_id?: string
      metadata?: Record<string, unknown>
    }

    const name = String(body.name || '').trim()
    if (!name) return NextResponse.json({ error: 'name required' }, { status: 400 })

    const slug = String(body.slug || slugify(name)).trim()
    if (!slug) return NextResponse.json({ error: 'slug required' }, { status: 400 })

    const organizationId = String(body.organization_id || process.env.NEXT_PUBLIC_ORGANIZATION_ID || DEFAULT_PICC_ORG_ID)

    const supabase = getServerClient()
    const { data, error } = await (supabase as any)
      .from('organization_services')
      .insert({
        organization_id: organizationId,
        name,
        slug,
        service_category: body.service_category || null,
        description: body.description || null,
        is_active: body.is_active ?? true,
        metadata: body.metadata || {},
      })
      .select('id, name, slug, service_category, description, is_active, metadata')
      .single()

    if (error) return NextResponse.json({ error: error.message }, { status: 500 })
    return NextResponse.json({ ok: true, service: data })
  } catch (error: any) {
    return NextResponse.json({ error: error?.message || 'Failed to create service' }, { status: 500 })
  }
}
