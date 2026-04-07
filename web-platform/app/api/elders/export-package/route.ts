import { NextRequest, NextResponse } from 'next/server'
import { createServerSupabase } from '@/lib/supabase/client'
import React from 'react'

export const runtime = 'nodejs'
export const maxDuration = 60

// ---------------------------------------------------------------------------
// Types
// ---------------------------------------------------------------------------

type PackageType = 'grant' | 'cultural' | 'travel' | 'community_report'

interface ExportRequest {
  elderId: string
  packageType: PackageType
}

const VALID_TYPES: PackageType[] = ['grant', 'cultural', 'travel', 'community_report']

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

  const { elderId, packageType } = body

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
      .from('profiles')
      .select('id, full_name, preferred_name, bio, profile_image_url, community_role, traditional_country, language_group')
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
      .eq('visibility', 'public')
      .order('created_at', { ascending: false })
      .limit(20)

    // Fetch quotes
    const { data: quotes } = await supabase
      .from('extracted_quotes')
      .select('id, quote_text, theme, source_type')
      .eq('profile_id', elderId)
      .eq('is_validated', true)
      .limit(20)

    // Fetch interview count for milestones
    const { count: interviewCount } = await supabase
      .from('interviews')
      .select('id', { count: 'exact', head: true })
      .eq('storyteller_id', elderId)

    // Build milestones from real data
    const storyCount = stories?.length ?? 0
    const quoteCount = quotes?.length ?? 0
    const milestones = [
      { label: 'First Story Shared', achieved: storyCount >= 1, date: stories?.[stories.length - 1]?.created_at ?? null },
      { label: '5+ Stories Contributed', achieved: storyCount >= 5, date: null },
      { label: '10+ Quotes of Wisdom', achieved: quoteCount >= 10, date: null },
      { label: 'Interview Recorded', achieved: (interviewCount ?? 0) >= 1, date: null },
      { label: 'Cultural Contributor', achieved: storyCount >= 3 && quoteCount >= 5, date: null },
      { label: 'Community Leader', achieved: storyCount >= 10, date: null },
    ]

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
        // EL syndication is best-effort
      }
    }

    // Generate PDF
    const [{ renderToBuffer }, { default: ElderPackagePDF }] = await Promise.all([
      import('@react-pdf/renderer'),
      import('@/lib/pdf/templates/ElderPackagePDF'),
    ])

    const pdfData = {
      packageType,
      elder: {
        name: profile.preferred_name || profile.full_name,
        role: profile.community_role,
        bio: profile.bio,
        traditionalCountry: profile.traditional_country,
        languageGroup: profile.language_group,
      },
      stories: (stories ?? []).map((s) => ({
        title: s.title || 'Untitled',
        excerpt: (s.content || '').slice(0, 300) + ((s.content || '').length > 300 ? '...' : ''),
        created_at: s.created_at,
      })),
      quotes: (quotes ?? []).map((q) => ({
        quote_text: q.quote_text,
        theme: q.theme,
      })),
      milestones,
      generatedAt: new Date().toISOString(),
    }

    const buffer = await renderToBuffer(
      React.createElement(ElderPackagePDF, { data: pdfData }) as any
    )

    const elderSlug = (profile.preferred_name || profile.full_name).replace(/\s+/g, '-').toLowerCase()
    const filename = `PICC-Elder-${elderSlug}-${packageType}.pdf`

    return new NextResponse(buffer as any, {
      headers: {
        'Content-Type': 'application/pdf',
        'Content-Disposition': `attachment; filename="${filename}"`,
      },
    })
  } catch (err) {
    console.error('Error generating export package:', err)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}
