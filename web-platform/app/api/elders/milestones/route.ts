import { NextRequest, NextResponse } from 'next/server'
import { createServerSupabase } from '@/lib/supabase/client'

// ---------------------------------------------------------------------------
// Types
// ---------------------------------------------------------------------------

interface Milestone {
  id: string
  type: string
  title: string
  description?: string | null
  achieved_at?: string | null
  progress_percentage?: number
  status: 'achieved' | 'in_progress' | 'planned'
  badge_earned?: string | null
}

// ---------------------------------------------------------------------------
// GET /api/elders/milestones?elderId=<uuid>
// ---------------------------------------------------------------------------

export async function GET(req: NextRequest) {
  const elderId = req.nextUrl.searchParams.get('elderId')

  if (!elderId) {
    return NextResponse.json(
      { error: 'elderId query parameter is required' },
      { status: 400 }
    )
  }

  // 1. Try Empathy Ledger if configured
  if (process.env.EMPATHY_LEDGER_API_URL) {
    try {
      const { getClient } = await import('@/lib/empathy-ledger/el-api-client')
      const el = getClient()
      // Future: el.getStorytellerMilestones(elderId)
      // For now this will likely fail — fall through to local data
      void el
    } catch {
      // EL not available — fall through
    }
  }

  // 2. Build milestones from local Supabase data
  try {
    const supabase = createServerSupabase()

    // Fetch story count and first story date
    const { data: stories, error: storiesErr } = await supabase
      .from('stories')
      .select('id, created_at')
      .eq('storyteller_id', elderId)
      .order('created_at', { ascending: true })

    if (storiesErr) {
      console.error('Error fetching stories for milestones:', storiesErr)
    }

    const storyCount = stories?.length ?? 0
    const firstStoryDate = stories?.[0]?.created_at ?? null

    // Fetch quote count
    const { count: quoteCount, error: quotesErr } = await supabase
      .from('extracted_quotes')
      .select('id', { count: 'exact', head: true })
      .eq('profile_id', elderId)

    if (quotesErr) {
      console.error('Error fetching quotes for milestones:', quotesErr)
    }

    const quotes = quoteCount ?? 0

    // Fetch interview count
    const { count: interviewCount, error: interviewsErr } = await supabase
      .from('interviews')
      .select('id', { count: 'exact', head: true })
      .eq('storyteller_id', elderId)

    if (interviewsErr) {
      // interviews table may not exist yet — not an error
    }

    const interviews = interviewCount ?? 0

    // Build milestones from real data
    const milestones: Milestone[] = [
      {
        id: `${elderId}-first-story`,
        type: 'first_story',
        title: 'First Story Shared',
        description: storyCount > 0 ? 'Began their storytelling journey' : 'Share the first story to begin',
        achieved_at: firstStoryDate,
        status: storyCount > 0 ? 'achieved' : 'planned',
        badge_earned: storyCount > 0 ? 'Storyteller' : null,
      },
      {
        id: `${elderId}-story-count-5`,
        type: 'story_count',
        title: '5 Stories Shared',
        description: `${storyCount} of 5 stories shared`,
        status: storyCount >= 5 ? 'achieved' : storyCount > 0 ? 'in_progress' : 'planned',
        progress_percentage: Math.min(Math.round((storyCount / 5) * 100), 100),
        achieved_at: storyCount >= 5 ? stories?.[4]?.created_at ?? null : null,
        badge_earned: storyCount >= 5 ? 'Prolific Storyteller' : null,
      },
      {
        id: `${elderId}-cultural-contributor`,
        type: 'cultural_contributor',
        title: 'Cultural Knowledge Contributor',
        description: `${quotes} of 3 cultural quotes shared`,
        status: quotes >= 3 ? 'achieved' : quotes > 0 ? 'in_progress' : 'planned',
        progress_percentage: Math.min(Math.round((quotes / 3) * 100), 100),
        badge_earned: quotes >= 3 ? 'Knowledge Keeper' : null,
      },
      {
        id: `${elderId}-community-leader`,
        type: 'community_leader',
        title: 'Community Leader',
        description:
          interviews >= 2
            ? 'Recognised as a community voice'
            : `${interviews} of 2 interviews completed`,
        status: interviews >= 2 ? 'achieved' : interviews > 0 ? 'in_progress' : 'planned',
        progress_percentage: Math.min(Math.round((interviews / 2) * 100), 100),
        badge_earned: interviews >= 2 ? 'Community Voice' : null,
      },
      {
        id: `${elderId}-mentor`,
        type: 'mentor_recognition',
        title: 'Youth Mentor',
        status: 'planned',
        description: 'Connect with young people through stories',
      },
      {
        id: `${elderId}-travel`,
        type: 'travel',
        title: 'Cultural Travel Ambassador',
        status: 'planned',
        description: 'Share culture through travel and community visits',
      },
    ]

    return NextResponse.json({ milestones, elderId })
  } catch (err) {
    console.error('Error building elder milestones:', err)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}
