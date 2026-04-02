import { NextRequest, NextResponse } from 'next/server'
import { createServerSupabase } from '@/lib/supabase/client'

// ---------------------------------------------------------------------------
// Types
// ---------------------------------------------------------------------------

type PackageType = 'grant' | 'cultural' | 'travel' | 'community_report'

interface ExportRequest {
  elderId: string
  packageType: PackageType
  options?: Record<string, unknown>
}

const VALID_TYPES: PackageType[] = ['grant', 'cultural', 'travel', 'community_report']

// Section lists per package type
const PACKAGE_SECTIONS: Record<PackageType, string[]> = {
  grant: [
    'Elder Profile',
    'Story Summaries',
    'Cultural Contributions',
    'Impact Statistics',
    'Community Endorsements',
  ],
  cultural: [
    'Elder Profile',
    'Featured Stories',
    'Cultural Quotes',
    'Photo Gallery',
    'Cultural Significance',
  ],
  travel: [
    'Elder Profile',
    'Travel History',
    'Story Highlights',
    'Milestone Summary',
    'Proposed Itinerary',
    'Budget Estimate',
  ],
  community_report: [
    'Elder Profile',
    'Story Contributions',
    'Quotes & Wisdom',
    'Year in Review',
    'Community Impact',
  ],
}

// ---------------------------------------------------------------------------
// POST /api/elders/export-package
// ---------------------------------------------------------------------------

export async function POST(req: NextRequest) {
  let body: ExportRequest

  try {
    body = await req.json()
  } catch {
    return NextResponse.json({ error: 'Invalid JSON body' }, { status: 400 })
  }

  const { elderId, packageType, options } = body

  if (!elderId || !packageType) {
    return NextResponse.json(
      { error: 'elderId and packageType are required' },
      { status: 400 }
    )
  }

  if (!VALID_TYPES.includes(packageType)) {
    return NextResponse.json(
      { error: `packageType must be one of: ${VALID_TYPES.join(', ')}` },
      { status: 400 }
    )
  }

  try {
    const supabase = createServerSupabase()

    // Fetch elder profile
    const { data: profile, error: profileErr } = await supabase
      .from('community_profiles')
      .select('id, full_name, role, bio, photo_url')
      .eq('id', elderId)
      .single()

    if (profileErr || !profile) {
      return NextResponse.json(
        { error: 'Elder profile not found' },
        { status: 404 }
      )
    }

    // Fetch stories
    const { data: stories } = await supabase
      .from('stories')
      .select('id, title, content, created_at')
      .eq('storyteller_id', elderId)
      .order('created_at', { ascending: false })

    // Fetch quotes
    const { data: quotes } = await supabase
      .from('extracted_quotes')
      .select('id, quote_text, theme, source_type')
      .eq('profile_id', elderId)

    const storyCount = stories?.length ?? 0
    const quoteCount = quotes?.length ?? 0

    // Syndicate via Empathy Ledger if available
    if (process.env.EMPATHY_LEDGER_API_URL) {
      try {
        const { getClient } = await import('@/lib/empathy-ledger/el-api-client')
        const el = getClient()
        await el.syndicateContent({
          contentType: 'elder_profile',
          contentId: elderId,
          destinationType: `export_${packageType}`,
          attributionText: `${profile.full_name} — Palm Island Community Company`,
          requestedBy: 'picc-web-platform',
        })
      } catch {
        // EL syndication is best-effort — continue without it
      }
    }

    // Generate a deterministic package ID
    const packageId = `pkg_${elderId.slice(0, 8)}_${packageType}_${Date.now()}`

    return NextResponse.json({
      packageId,
      type: packageType,
      elder: {
        id: profile.id,
        name: profile.full_name,
      },
      contents: {
        stories: storyCount,
        quotes: quoteCount,
        sections: PACKAGE_SECTIONS[packageType],
      },
      options: options ?? {},
      status: 'ready' as const,
    })
  } catch (err) {
    console.error('Error generating export package:', err)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}
