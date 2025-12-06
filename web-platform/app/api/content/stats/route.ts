/**
 * Content Stats API Endpoint
 *
 * Returns aggregate statistics for the homepage "15 Years of Impact" section
 * including images, knowledge entries, stories, and annual reports counts.
 */

import { NextResponse } from 'next/server'
import { createRouteHandlerClient } from '@/lib/supabase/server'

export async function GET(request: Request) {
  try {
    const supabase = await createRouteHandlerClient()

    // Get image count (annual report images)
    const { count: imageCount, error: imageError } = await supabase
      .from('media_files')
      .select('*', { count: 'exact', head: true })
      .contains('tags', ['annual-report'])
      .is('deleted_at', null)

    if (imageError) {
      console.error('Error fetching image count:', imageError)
    }

    // Get knowledge entries count (all public entries)
    const { count: knowledgeCount, error: knowledgeError } = await supabase
      .from('knowledge_entries')
      .select('*', { count: 'exact', head: true })

    if (knowledgeError) {
      console.error('Error fetching knowledge count:', knowledgeError)
    }

    // Get stories count
    const { count: storiesCount, error: storiesError } = await supabase
      .from('stories')
      .select('*', { count: 'exact', head: true })
      .eq('status', 'published')

    if (storiesError) {
      console.error('Error fetching stories count:', storiesError)
    }

    // Get annual reports count
    const { count: reportsCount, error: reportsError } = await supabase
      .from('knowledge_entries')
      .select('*', { count: 'exact', head: true })
      .eq('entry_type', 'document')
      .ilike('slug', 'picc-annual-report-%-full-pdf')

    if (reportsError) {
      console.error('Error fetching reports count:', reportsError)
    }

    return NextResponse.json({
      images: imageCount || 264, // Default to known count if query fails
      knowledgeEntries: knowledgeCount || 86,
      stories: storiesCount || 31,
      annualReports: reportsCount || 15,
      success: true
    })

  } catch (error) {
    console.error('Content stats API error:', error)
    return NextResponse.json(
      {
        // Return defaults in case of error
        images: 264,
        knowledgeEntries: 86,
        stories: 31,
        annualReports: 15,
        success: false,
        error: 'Failed to fetch stats'
      },
      { status: 200 } // Return 200 with defaults to prevent UI breaking
    )
  }
}
