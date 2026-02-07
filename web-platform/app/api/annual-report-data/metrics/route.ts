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

    // Get all organization services with their metrics for this fiscal year
    const { data: services, error: servicesError } = await supabase
      .from('organization_services')
      .select('id, name, slug, service_category, is_active')
      .eq('is_active', true)
      .order('name')

    if (servicesError) throw servicesError

    // Get metrics for this fiscal year
    const { data: metrics, error: metricsError } = await supabase
      .from('service_metrics')
      .select('*')
      .eq('fiscal_year', fiscalYear)

    if (metricsError) throw metricsError

    // Merge services with their metrics
    const metricsMap = new Map(
      (metrics || []).map((m: any) => [m.organization_service_id, m])
    )

    const result = (services || []).map((svc: any) => ({
      organization_service_id: svc.id,
      service_name: svc.name || 'Unknown',
      service_slug: svc.slug,
      service_category: svc.service_category,
      metrics: metricsMap.get(svc.id) || null,
    }))

    return NextResponse.json({
      fiscal_year: fiscalYear,
      services: result,
      total_services: result.length,
      services_with_data: result.filter((r: any) => r.metrics).length,
    })
  } catch (error: any) {
    console.error('Service metrics GET error:', error)
    return NextResponse.json({ error: error.message }, { status: 500 })
  }
}

export async function POST(request: NextRequest) {
  try {
    const supabase = getSupabase()
    const body = await request.json()

    const {
      organization_service_id,
      fiscal_year,
      clients_served,
      sessions_delivered,
      events_held,
      staff_count,
      key_achievement,
      headline_stat_value,
      headline_stat_label,
      notes,
    } = body

    if (!organization_service_id || !fiscal_year) {
      return NextResponse.json(
        { error: 'organization_service_id and fiscal_year required' },
        { status: 400 }
      )
    }

    // Upsert: insert or update on conflict
    const { data, error } = await supabase
      .from('service_metrics')
      .upsert(
        {
          organization_service_id,
          fiscal_year,
          clients_served: clients_served ?? null,
          sessions_delivered: sessions_delivered ?? null,
          events_held: events_held ?? null,
          staff_count: staff_count ?? null,
          key_achievement: key_achievement ?? null,
          headline_stat_value: headline_stat_value ?? null,
          headline_stat_label: headline_stat_label ?? null,
          notes: notes ?? null,
        },
        { onConflict: 'organization_service_id,fiscal_year' }
      )
      .select()
      .single()

    if (error) throw error

    return NextResponse.json({ metric: data })
  } catch (error: any) {
    console.error('Service metrics POST error:', error)
    return NextResponse.json({ error: error.message }, { status: 500 })
  }
}
