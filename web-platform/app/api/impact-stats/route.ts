import { NextResponse } from 'next/server'
import { createClient } from '@supabase/supabase-js'

export async function GET() {
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
  const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY

  if (!supabaseUrl || !supabaseServiceKey) {
    return NextResponse.json({ error: 'Missing Supabase credentials' }, { status: 500 })
  }

  const supabase = createClient(supabaseUrl, supabaseServiceKey, {
    auth: { autoRefreshToken: false, persistSession: false }
  })

  try {
    const now = new Date()
    const thisMonthStart = new Date(now.getFullYear(), now.getMonth(), 1)
    const lastMonthStart = new Date(now.getFullYear(), now.getMonth() - 1, 1)
    const lastMonthEnd = new Date(now.getFullYear(), now.getMonth(), 0)

    // Fetch all data
    const [storiesRes, profilesRes] = await Promise.all([
      supabase.from('stories').select('*'),
      supabase.from('profiles').select('*'),
    ])

    const stories = storiesRes.data || []
    const profiles = profilesRes.data || []

    // Calculate stats
    const totalStories = stories.length
    const totalStorytellers = profiles.length

    // Stories this month
    const storiesThisMonth = stories.filter((s: any) =>
      new Date(s.created_at) >= thisMonthStart
    ).length

    // Stories last month
    const storiesLastMonth = stories.filter((s: any) => {
      const date = new Date(s.created_at)
      return date >= lastMonthStart && date <= lastMonthEnd
    }).length

    // New storytellers this month
    const newStorytellersThisMonth = profiles.filter((p: any) =>
      new Date(p.created_at) >= thisMonthStart
    ).length

    // Elder and Youth contributions
    const elderProfiles = profiles.filter((p: any) => p.is_elder)
    const elderIds = new Set(elderProfiles.map((p: any) => p.id))
    const elderContributions = stories.filter((s: any) =>
      elderIds.has(s.storyteller_id)
    ).length

    const youthProfiles = profiles.filter((p: any) => p.storyteller_type === 'youth')
    const youthIds = new Set(youthProfiles.map((p: any) => p.id))
    const youthContributions = stories.filter((s: any) =>
      youthIds.has(s.storyteller_id)
    ).length

    // Community Voice stories
    const communityVoiceStories = stories.filter((s: any) =>
      s.access_level === 'community' || !s.storyteller_id
    ).length

    // Stories by category
    const categoryCount: { [key: string]: number } = {}
    stories.forEach((s: any) => {
      const category = s.category || 'uncategorized'
      categoryCount[category] = (categoryCount[category] || 0) + 1
    })
    const storiesByCategory = Object.entries(categoryCount)
      .map(([category, count]) => ({ category, count }))
      .sort((a, b) => b.count - a.count)
      .slice(0, 5)

    // Storytellers by type
    const typeCount: { [key: string]: number } = {}
    profiles.forEach((p: any) => {
      const type = p.storyteller_type || 'community_member'
      typeCount[type] = (typeCount[type] || 0) + 1
    })
    const storytellersByType = Object.entries(typeCount)
      .map(([type, count]) => ({ type, count }))
      .sort((a, b) => b.count - a.count)

    // Monthly growth (last 6 months)
    const monthlyGrowth = []
    for (let i = 5; i >= 0; i--) {
      const month = new Date(now.getFullYear(), now.getMonth() - i, 1)
      const monthEnd = new Date(now.getFullYear(), now.getMonth() - i + 1, 0)

      const monthStories = stories.filter((s: any) => {
        const date = new Date(s.created_at)
        return date >= month && date <= monthEnd
      }).length

      const monthStorytellers = profiles.filter((p: any) => {
        const date = new Date(p.created_at)
        return date >= month && date <= monthEnd
      }).length

      monthlyGrowth.push({
        month: month.toLocaleDateString('en-US', { month: 'short' }),
        stories: monthStories,
        storytellers: monthStorytellers
      })
    }

    return NextResponse.json({
      totalStories,
      totalStorytellers,
      totalViews: 0,
      totalShares: 0,
      storiesThisMonth,
      storiesLastMonth,
      newStorytellersThisMonth,
      elderContributions,
      youthContributions,
      communityVoiceStories,
      storiesByCategory,
      storytellersByType,
      monthlyGrowth,
    })
  } catch (error: any) {
    console.error('Impact stats error:', error)
    return NextResponse.json({ error: error.message }, { status: 500 })
  }
}
