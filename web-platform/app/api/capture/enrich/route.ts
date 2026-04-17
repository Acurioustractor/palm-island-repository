import { NextRequest, NextResponse } from 'next/server'
import { createServerSupabase } from '@/lib/supabase/client'

/**
 * POST /api/capture/enrich
 * AI enrichment of a story capture via Claude
 */
export async function POST(request: NextRequest) {
  try {
    const supabase = createServerSupabase()
    const body = await request.json()
    const { captureId } = body

    if (!captureId) {
      return NextResponse.json({ error: 'captureId is required' }, { status: 400 })
    }

    // Get the capture
    const { data: capture, error: fetchErr } = await supabase
      .from('story_captures')
      .select('*')
      .eq('id', captureId)
      .single()

    if (fetchErr || !capture) {
      return NextResponse.json({ error: 'Capture not found' }, { status: 404 })
    }

    if (capture.status !== 'pending') {
      return NextResponse.json(
        { error: `Capture is already ${capture.status}` },
        { status: 400 }
      )
    }

    // Mark as enriching
    await supabase
      .from('story_captures')
      .update({ status: 'enriching', updated_at: new Date().toISOString() })
      .eq('id', captureId)

    // Call Claude for enrichment
    const anthropicKey = process.env.ANTHROPIC_API_KEY
    let enriched = {
      title: '',
      content: '',
      tags: [] as string[],
      story_type: 'impact',
      cultural_sensitivity: 'standard',
      elder_review_required: false,
      confidence: 0.5,
    }

    if (anthropicKey) {
      try {
        const res = await fetch('https://api.anthropic.com/v1/messages', {
          method: 'POST',
          headers: {
            'x-api-key': anthropicKey,
            'anthropic-version': '2023-06-01',
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            model: 'claude-sonnet-4-6',
            max_tokens: 1024,
            messages: [
              {
                role: 'user',
                content: `Analyze this community story from an Indigenous Australian community organization on Palm Island. Extract:
1. A concise title (max 80 chars)
2. A cleaned-up version of the content (fix grammar, preserve voice)
3. Tags (array of relevant keywords)
4. Story type: one of "impact", "journey", "community", "culture", "youth", "elder", "service"
5. Cultural sensitivity: "standard", "sensitive", or "restricted"
6. Whether elder review is required (true if content mentions traditional knowledge, sacred sites, ceremony, or cultural practices)
7. Confidence score 0-1

Respond in JSON only: { "title": "...", "content": "...", "tags": [...], "story_type": "...", "cultural_sensitivity": "...", "elder_review_required": bool, "confidence": 0.X }

Raw story:
${capture.raw_content}`,
              },
            ],
          }),
        })

        if (res.ok) {
          const aiRes = await res.json()
          const text = aiRes.content?.[0]?.text || ''
          const jsonMatch = text.match(/\{[\s\S]*\}/)
          if (jsonMatch) {
            enriched = JSON.parse(jsonMatch[0])
          }
        }
      } catch (aiErr) {
        console.error('Claude enrichment failed:', aiErr)
      }
    } else {
      // Fallback: basic enrichment without AI
      enriched.title = capture.raw_content.slice(0, 80)
      enriched.content = capture.raw_content
      enriched.tags = ['unprocessed']
      enriched.confidence = 0.2
    }

    // Update capture with enriched data
    const { data: updated, error: updateErr } = await supabase
      .from('story_captures')
      .update({
        status: 'review',
        enriched_title: enriched.title,
        enriched_content: enriched.content,
        enriched_tags: enriched.tags,
        enriched_story_type: enriched.story_type,
        cultural_sensitivity: enriched.cultural_sensitivity,
        elder_review_required: enriched.elder_review_required,
        ai_confidence: enriched.confidence,
        updated_at: new Date().toISOString(),
      })
      .eq('id', captureId)
      .select()
      .single()

    if (updateErr) {
      return NextResponse.json({ error: updateErr.message }, { status: 500 })
    }

    return NextResponse.json({ capture: updated })
  } catch (err) {
    console.error('Enrich error:', err)
    return NextResponse.json({ error: 'Internal error' }, { status: 500 })
  }
}
