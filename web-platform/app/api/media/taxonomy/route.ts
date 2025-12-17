import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@supabase/supabase-js'

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

export async function GET(_request: NextRequest) {
  try {
    const supabase = getServerClient()

    const [servicesResult, projectsResult] = await Promise.all([
      supabase
        .from('organization_services')
        .select('id, name, slug, service_category')
        .eq('is_active', true)
        .order('name', { ascending: true })
        .limit(200),
      supabase
        .from('projects')
        .select('id, name, slug, project_type, status')
        .order('featured', { ascending: false })
        .order('name', { ascending: true })
        .limit(200),
    ])

    if (servicesResult.error) return NextResponse.json({ error: servicesResult.error.message }, { status: 500 })
    if (projectsResult.error) return NextResponse.json({ error: projectsResult.error.message }, { status: 500 })

    return NextResponse.json({
      // Normalize to the shape used by the PICC media UI.
      services: (servicesResult.data || []).map((s: any) => ({
        id: s.id,
        service_name: s.name,
        service_slug: s.slug,
        service_category: s.service_category,
      })),
      projects: projectsResult.data || [],
    })
  } catch (error: any) {
    return NextResponse.json({ error: error?.message || 'Failed to load taxonomy' }, { status: 500 })
  }
}
