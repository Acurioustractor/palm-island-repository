import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@supabase/supabase-js'

function getSupabase() {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL
  const key = process.env.SUPABASE_SERVICE_ROLE_KEY
  if (!url || !key) throw new Error('Missing Supabase credentials')
  return createClient(url, key, { auth: { autoRefreshToken: false, persistSession: false } })
}

export async function GET(request: NextRequest) {
  try {
    const supabase = getSupabase()
    const { searchParams } = new URL(request.url)
    const fy = searchParams.get('fy')

    if (!fy) {
      return NextResponse.json({ error: 'fiscal year (fy) required' }, { status: 400 })
    }

    const fiscalYear = parseInt(fy)

    // Show all projects regardless of FY — they're all innovation projects
    const { data: projects, error } = await supabase
      .from('projects')
      .select('id, name, slug, project_type, status, hero_image_url, tagline, budget_total, featured, start_date, created_at')
      .order('name')

    if (error) throw error

    const all = projects || []

    return NextResponse.json({
      projects: all,
      total: all.length,
      featured_count: all.filter((p: any) => p.featured).length,
      by_type: all.reduce((acc: Record<string, number>, p: any) => {
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
