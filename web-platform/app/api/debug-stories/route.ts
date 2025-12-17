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

  const supabase = createClient(supabaseUrl, supabaseServiceKey, {
    auth: { autoRefreshToken: false, persistSession: false }
  })

  try {
    // Get all stories with relevant fields
    const { data: allStories, error: allError } = await supabase
      .from('stories')
      .select('id, title, is_public, access_level, status, organization_id')
      .order('created_at', { ascending: false })

    // Get stories with is_public = true
    const { data: publicStories, error: publicError } = await supabase
      .from('stories')
      .select('id, title, is_public, access_level, status, organization_id')
      .eq('is_public', true)

    // Get stories with access_level = 'public'
    const { data: accessLevelPublic, error: accessError } = await supabase
      .from('stories')
      .select('id, title, is_public, access_level, status, organization_id')
      .eq('access_level', 'public')

    // Get stories matching wiki query (is_public=true AND specific org_id)
    const { data: wikiStories, error: wikiError } = await supabase
      .from('stories')
      .select('id, title, is_public, access_level, status, organization_id')
      .eq('is_public', true)
      .eq('organization_id', '3c2011b9-f80d-4289-b300-0cd383cff479')

    // Get published stories
    const { data: publishedStories, error: pubError } = await supabase
      .from('stories')
      .select('id, title, is_public, access_level, status, organization_id')
      .eq('status', 'published')

    // Get unique values of is_public and access_level
    const isPublicValues = Array.from(new Set((allStories || []).map(s => s.is_public)))
    const accessLevelValues = Array.from(new Set((allStories || []).map(s => s.access_level)))
    const statusValues = Array.from(new Set((allStories || []).map(s => s.status)))
    const orgIds = Array.from(new Set((allStories || []).map(s => s.organization_id)))

    return NextResponse.json({
      timestamp: new Date().toISOString(),
      analysis: {
        total_stories: allStories?.length || 0,
        is_public_true_count: publicStories?.length || 0,
        access_level_public_count: accessLevelPublic?.length || 0,
        wiki_query_result_count: wikiStories?.length || 0,
        published_count: publishedStories?.length || 0,
      },
      unique_values: {
        is_public: isPublicValues,
        access_level: accessLevelValues,
        status: statusValues,
        organization_ids: orgIds,
      },
      sample_stories: (allStories || []).slice(0, 5).map(s => ({
        id: s.id,
        title: s.title,
        is_public: s.is_public,
        access_level: s.access_level,
        status: s.status,
        organization_id: s.organization_id,
      })),
      wiki_query_stories: wikiStories || [],
      errors: {
        all: allError?.message,
        public: publicError?.message,
        access: accessError?.message,
        wiki: wikiError?.message,
        published: pubError?.message,
      },
    })
  } catch (error: any) {
    return NextResponse.json({
      error: 'Database query failed',
      message: error.message,
    }, { status: 500 })
  }
}
