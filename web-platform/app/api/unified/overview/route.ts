import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@supabase/supabase-js'
import {
  fetchFinancials,
  fetchStaffStatistics,
  fetchServices,
  fetchPartners,
  fetchBoardMembers,
  fetchLeadership
} from '@/lib/data-intelligence/queries'
import PICC_KNOWLEDGE_BASE from '@/lib/picc-knowledge-base'

function getSupabase() {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL
  const key = process.env.SUPABASE_SERVICE_ROLE_KEY
  if (!url || !key) throw new Error('Missing Supabase credentials')
  return createClient(url, key, { auth: { autoRefreshToken: false, persistSession: false } })
}

/**
 * GET /api/unified/overview?fy=2024
 *
 * Returns org-wide summary with key stats from all tables in one call.
 * Optional fiscal year filter (defaults to latest available).
 */
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const fyParam = searchParams.get('fy')
    const supabase = getSupabase()

    // Run ALL queries in parallel
    const [
      financials,
      staffStats,
      services,
      partners,
      boardMembers,
      leadership,
      storiesCount,
      interviewsCount,
      elderQuotesCount,
      mediaCount,
      knowledgeCount,
      recentAchievements
    ] = await Promise.all([
      fetchFinancials(2010, 2026),
      fetchStaffStatistics(2010, 2026),
      fetchServices(),
      fetchPartners(),
      fetchBoardMembers(),
      fetchLeadership(),
      supabase.from('stories').select('id', { count: 'exact', head: true }),
      supabase.from('interviews').select('id', { count: 'exact', head: true }),
      supabase.from('elder_quotes').select('id', { count: 'exact', head: true }),
      supabase.from('media_files').select('id', { count: 'exact', head: true }).is('deleted_at', null),
      supabase.from('knowledge_entries').select('id', { count: 'exact', head: true }),
      supabase.from('governance_achievements').select('title, description, year, category').order('year', { ascending: false }).limit(10)
    ])

    // Find the requested fiscal year's data (or latest)
    const targetFy = fyParam ? parseInt(fyParam) : null
    const latestFinancial = targetFy
      ? financials.find((f: any) => f.fiscal_year === targetFy) || financials[financials.length - 1]
      : financials[financials.length - 1]

    const latestStaff = targetFy
      ? staffStats.find((s: any) => s.fiscal_year === targetFy) || staffStats[staffStats.length - 1]
      : staffStats[staffStats.length - 1]

    // Service summary by category
    const activeServices = services.filter((s: any) => s.is_active)
    const servicesByCategory = activeServices.reduce((acc: Record<string, number>, s: any) => {
      const cat = s.service_category || 'other'
      acc[cat] = (acc[cat] || 0) + 1
      return acc
    }, {})

    // Top services by staff count
    const topServices = [...activeServices]
      .sort((a: any, b: any) => (b.staff_count || 0) - (a.staff_count || 0))
      .slice(0, 5)
      .map((s: any) => ({
        name: s.name,
        slug: s.slug,
        category: s.service_category,
        staff_count: s.staff_count,
        clients_served: s.clients_served_annual
      }))

    return NextResponse.json({
      org: {
        name: PICC_KNOWLEDGE_BASE.organization.name,
        short_name: PICC_KNOWLEDGE_BASE.organization.short_name,
        mission: PICC_KNOWLEDGE_BASE.organization.mission,
        tagline: PICC_KNOWLEDGE_BASE.organization.tagline,
        location: PICC_KNOWLEDGE_BASE.organization.location,
        ceo: PICC_KNOWLEDGE_BASE.leadership.ceo,
        governance: PICC_KNOWLEDGE_BASE.leadership.governance
      },
      financials: latestFinancial || null,
      financials_history: financials,
      staff: latestStaff || null,
      staff_history: staffStats,
      services: {
        total: activeServices.length,
        by_category: servicesByCategory,
        top: topServices
      },
      governance: {
        board: boardMembers,
        leadership,
        recent_achievements: recentAchievements.data || []
      },
      partners,
      counts: {
        stories: storiesCount.count || 0,
        interviews: interviewsCount.count || 0,
        elder_quotes: elderQuotesCount.count || 0,
        media_files: mediaCount.count || 0,
        knowledge_entries: knowledgeCount.count || 0,
        services: activeServices.length,
        board_members: boardMembers.length,
        partners: partners.length
      }
    })
  } catch (error: any) {
    console.error('Unified overview error:', error)
    return NextResponse.json({ error: error.message }, { status: 500 })
  }
}
