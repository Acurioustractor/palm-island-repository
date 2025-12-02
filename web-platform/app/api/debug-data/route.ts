import { NextResponse } from 'next/server'
import { createClient } from '@supabase/supabase-js'

export async function GET() {
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
  const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY

  if (!supabaseUrl || !supabaseServiceKey) {
    return NextResponse.json({
      error: 'Missing Supabase credentials',
      hasUrl: !!supabaseUrl,
      hasServiceKey: !!supabaseServiceKey,
    })
  }

  // Use service role to bypass RLS
  const supabase = createClient(supabaseUrl, supabaseServiceKey, {
    auth: { autoRefreshToken: false, persistSession: false }
  })

  try {
    // Count all tables
    const [orgs, services, profiles, stories, reports, indicators] = await Promise.all([
      supabase.from('organizations').select('id, name, short_name'),
      supabase.from('organization_services').select('id, name', { count: 'exact' }),
      supabase.from('profiles').select('id, full_name, profile_visibility', { count: 'exact' }),
      supabase.from('stories').select('id, title, status, access_level', { count: 'exact' }),
      supabase.from('annual_reports').select('id, title, report_year'),
      supabase.from('impact_indicators').select('id, indicator_name', { count: 'exact' }),
    ])

    return NextResponse.json({
      timestamp: new Date().toISOString(),
      organizations: {
        count: orgs.data?.length || 0,
        data: orgs.data,
        error: orgs.error?.message,
      },
      services: {
        count: services.count || services.data?.length || 0,
        sample: services.data?.slice(0, 3),
        error: services.error?.message,
      },
      profiles: {
        count: profiles.count || profiles.data?.length || 0,
        sample: profiles.data?.slice(0, 3),
        error: profiles.error?.message,
      },
      stories: {
        count: stories.count || stories.data?.length || 0,
        sample: stories.data?.slice(0, 3),
        error: stories.error?.message,
      },
      annual_reports: {
        count: reports.data?.length || 0,
        data: reports.data,
        error: reports.error?.message,
      },
      impact_indicators: {
        count: indicators.count || indicators.data?.length || 0,
        sample: indicators.data?.slice(0, 3),
        error: indicators.error?.message,
      },
    })
  } catch (error: any) {
    return NextResponse.json({
      error: 'Database query failed',
      message: error.message,
    }, { status: 500 })
  }
}
