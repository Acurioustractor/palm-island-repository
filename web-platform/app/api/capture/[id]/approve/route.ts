import { NextRequest, NextResponse } from 'next/server'
import { createServerSupabase } from '@/lib/supabase/client'

/**
 * POST /api/capture/[id]/approve
 * Approve a capture and create a canonical story from enriched data
 */
export async function POST(
  _request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params
    const supabase = createServerSupabase()

    // Get the capture
    const { data: capture, error: fetchErr } = await supabase
      .from('story_captures')
      .select('*')
      .eq('id', id)
      .single()

    if (fetchErr || !capture) {
      return NextResponse.json({ error: 'Capture not found' }, { status: 404 })
    }

    if (capture.status === 'approved' || capture.status === 'published') {
      return NextResponse.json(
        { error: `Capture already ${capture.status}` },
        { status: 400 }
      )
    }

    // Cultural safety check
    if (capture.elder_review_required && capture.cultural_sensitivity !== 'standard') {
      return NextResponse.json(
        { error: 'Elder review required before approval. Content flagged for cultural sensitivity.' },
        { status: 403 }
      )
    }

    // Create story from enriched data
    const { data: story, error: storyErr } = await supabase
      .from('stories')
      .insert({
        title: capture.enriched_title || capture.raw_content.slice(0, 80),
        content: capture.enriched_content || capture.raw_content,
        story_type: capture.enriched_story_type || 'impact',
        tags: capture.enriched_tags || [],
        source: capture.source,
        service_id: capture.service_id,
        cultural_sensitivity_level: capture.cultural_sensitivity || 'standard',
        is_public: capture.cultural_sensitivity === 'standard',
        access_level: capture.cultural_sensitivity === 'restricted' ? 'restricted' : 'public',
      })
      .select()
      .single()

    if (storyErr) {
      return NextResponse.json({ error: storyErr.message }, { status: 500 })
    }

    // Update capture with story link
    await supabase
      .from('story_captures')
      .update({
        status: 'approved',
        story_id: story.id,
        updated_at: new Date().toISOString(),
      })
      .eq('id', id)

    // Create notification
    await supabase.from('notifications').insert({
      type: 'success',
      title: 'Story Approved',
      message: `"${story.title}" has been approved and added to the story library`,
      action_url: `/picc/stories/${story.id}`,
    })

    return NextResponse.json({ story, capture_id: id })
  } catch (err) {
    console.error('Approve error:', err)
    return NextResponse.json({ error: 'Internal error' }, { status: 500 })
  }
}
