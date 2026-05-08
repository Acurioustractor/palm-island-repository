import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@supabase/supabase-js'
import { getPiccProjects } from '@/lib/empathy-ledger/el-projects'

function getSupabase() {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL
  const key = process.env.SUPABASE_SERVICE_ROLE_KEY
  if (!url || !key) throw new Error('Missing Supabase credentials')
  return createClient(url, key, { auth: { autoRefreshToken: false, persistSession: false } })
}

export async function GET(request: NextRequest) {
  // Phase 1 canonical migration: project list now comes from Empathy
  // Ledger v2 (see thoughts/shared/plans/2026-05-08-el-canonical-migration.md).
  // PICC-only fields the legacy admin used (budget_total, featured) are
  // not exposed by EL — featured_count is reported as 0 here; the PATCH
  // writer below still operates on the legacy table for now (Phase 5
  // drops those after the read pipeline is verified live).
  try {
    const { searchParams } = new URL(request.url)
    const fy = searchParams.get('fy')

    if (!fy) {
      return NextResponse.json({ error: 'fiscal year (fy) required' }, { status: 400 })
    }

    const elProjects = await getPiccProjects({ status: 'all' })
    const all = elProjects
      .slice()
      .sort((a, b) => (a.name || '').localeCompare(b.name || ''))
      .map((p) => ({
        id: p.id,
        name: p.name,
        slug: p.slug,
        project_type: p.project_type,
        status: p.status,
        hero_image_url: p.cover_image_url,
        tagline: p.tagline,
        // EL doesn't carry budget_total / featured — keep nullable for shape parity.
        budget_total: null as number | null,
        featured: false,
        start_date: p.start_date,
        created_at: p.updated_at,
      }))

    return NextResponse.json({
      projects: all,
      total: all.length,
      featured_count: 0,
      by_type: all.reduce((acc: Record<string, number>, p) => {
        const t = p.project_type || 'other'
        acc[t] = (acc[t] || 0) + 1
        return acc
      }, {}),
    })
  } catch (error: any) {
    console.error('Projects GET error:', error)
    return NextResponse.json({ error: error.message }, { status: 500 })
  }
}

export async function PATCH(request: NextRequest) {
  try {
    const supabase = getSupabase()
    const body = await request.json()
    const { id, featured } = body

    if (!id || typeof featured !== 'boolean') {
      return NextResponse.json({ error: 'id and featured (boolean) required' }, { status: 400 })
    }

    const { data, error } = await supabase
      .from('projects')
      .update({ featured })
      .eq('id', id)
      .select()
      .single()

    if (error) throw error
    return NextResponse.json({ project: data })
  } catch (error: any) {
    console.error('Projects PATCH error:', error)
    return NextResponse.json({ error: error.message }, { status: 500 })
  }
}
