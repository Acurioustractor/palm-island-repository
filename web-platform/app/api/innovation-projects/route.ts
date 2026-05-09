/**
 * GET /api/innovation-projects
 *
 * Lightweight read endpoint for the Vision Board admin (/picc/vision)
 * and any future innovation surface that needs the project list.
 *
 * Returns innovation_projects ordered by status (active → planning →
 * completed → archived), then by people_impacted desc.
 */
import { NextResponse } from 'next/server'
import { createClient } from '@supabase/supabase-js'

export const runtime = 'nodejs'
export const dynamic = 'force-dynamic'

function getServerClient() {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL
  const key = process.env.SUPABASE_SERVICE_ROLE_KEY
  if (!url || !key) throw new Error('Missing Supabase credentials')
  return createClient(url, key, {
    auth: { autoRefreshToken: false, persistSession: false },
  })
}

export async function GET() {
  try {
    const supabase = getServerClient()
    const { data, error } = await supabase
      .from('innovation_projects')
      .select('id, slug, name, category, status, people_impacted, jobs_created, hero_image_url, description')
      .order('status')
      .order('people_impacted', { ascending: false, nullsFirst: false })
    if (error) return NextResponse.json({ error: error.message }, { status: 500 })
    return NextResponse.json(data || [])
  } catch (err: any) {
    return NextResponse.json({ error: err?.message || 'Failed' }, { status: 500 })
  }
}
