/**
 * Save/Load planner configurations
 *
 * GET  /api/report-planner?fiscalYear=2024-25&audience=community
 * POST /api/report-planner  { fiscalYear, audience, config, id? }
 */

import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@supabase/supabase-js'

function getSupabase() {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL
  const key = process.env.SUPABASE_SERVICE_ROLE_KEY
  if (!url || !key) return null
  return createClient(url, key, {
    auth: { autoRefreshToken: false, persistSession: false },
  })
}

export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url)
  const fiscalYear = searchParams.get('fiscalYear')
  const audience = searchParams.get('audience') || null

  if (!fiscalYear) {
    return NextResponse.json({ error: 'Missing fiscalYear' }, { status: 400 })
  }

  const supabase = getSupabase()
  if (!supabase) {
    return NextResponse.json({ config: null })
  }

  try {
    let query = supabase
      .from('report_planner_configs')
      .select('id, fiscal_year, audience, config, created_at, updated_at')
      .eq('fiscal_year', fiscalYear)

    if (audience) {
      query = query.eq('audience', audience)
    } else {
      query = query.is('audience', null)
    }

    const { data, error } = await query
      .order('updated_at', { ascending: false })
      .limit(1)
      .maybeSingle()

    if (error) throw error

    if (data) {
      return NextResponse.json({
        id: data.id,
        config: data.config,
        createdAt: data.created_at,
        updatedAt: data.updated_at,
      })
    }

    return NextResponse.json({ config: null })
  } catch (err: unknown) {
    console.error('Failed to load planner config:', err)
    return NextResponse.json({ config: null })
  }
}

export async function POST(request: NextRequest) {
  const body = await request.json()
  const { fiscalYear, audience, config, id } = body

  if (!fiscalYear || !config) {
    return NextResponse.json({ error: 'Missing fiscalYear or config' }, { status: 400 })
  }

  const supabase = getSupabase()
  if (!supabase) {
    return NextResponse.json({ error: 'Database not available' }, { status: 500 })
  }

  try {
    if (id) {
      // Update existing
      const { data, error } = await supabase
        .from('report_planner_configs')
        .update({
          config,
          audience: audience || null,
          updated_at: new Date().toISOString(),
        })
        .eq('id', id)
        .select('id')
        .single()

      if (error) throw error
      return NextResponse.json({ id: data.id, saved: true })
    } else {
      // Insert new
      const { data, error } = await supabase
        .from('report_planner_configs')
        .insert({
          fiscal_year: fiscalYear,
          audience: audience || null,
          config,
        })
        .select('id')
        .single()

      if (error) throw error
      return NextResponse.json({ id: data.id, saved: true })
    }
  } catch (err: unknown) {
    console.error('Failed to save planner config:', err)
    return NextResponse.json({ error: 'Save failed' }, { status: 500 })
  }
}
