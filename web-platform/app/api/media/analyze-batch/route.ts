import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@supabase/supabase-js'
import Anthropic from '@anthropic-ai/sdk'

export const runtime = 'nodejs'
export const maxDuration = 300 // 5 minutes for batch processing

function getSupabase() {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL
  const key = process.env.SUPABASE_SERVICE_ROLE_KEY
  if (!url || !key) throw new Error('Missing Supabase credentials')
  return createClient(url, key, {
    auth: { autoRefreshToken: false, persistSession: false },
  })
}

interface AnalysisResult {
  media_id: string
  success: boolean
  error?: string
  tags?: string[]
}

const ANALYSIS_PROMPT = `Analyze this photo for the Palm Island Community Company platform. This is an Indigenous Australian community organization.

Please provide a detailed analysis in JSON format:

{
  "description": "A detailed description of what's in the image (2-3 sentences)",
  "alt_text": "Concise accessibility description for screen readers (max 125 chars)",
  "suggested_tags": ["array", "of", "relevant", "tags", "for", "searching"],
  "detected_themes": ["community", "culture", "event", "nature", "portrait", etc - relevant themes],
  "people_count": number of people visible (0 if none),
  "location_hints": ["any", "location", "clues", "visible"],
  "mood": "overall mood/atmosphere (e.g., joyful, contemplative, celebratory)",
  "cultural_elements": ["any", "cultural", "elements", "visible"],
  "suggested_caption": "A suggested caption for social media or reports",
  "is_sensitive": true/false if image contains sensitive cultural content requiring elder review,
  "sensitivity_notes": "explain any sensitivity concerns if is_sensitive is true"
}

IMPORTANT tagging rules for suggested_tags:
- If 3+ people are visible, include "group" tag
- If 1 person is the clear subject (headshot/portrait), include "portrait" tag
- If the image shows a landscape, scenery, or place with no/minimal people, include "landscape" tag
- If the image has high quality, professional composition/lighting (not a casual phone snap), include "professional-photography" tag
- Always include relevant content tags like "content:portrait", "content:group", "content:outdoor", "content:indoor"

Be respectful and culturally aware. Return ONLY the JSON, no other text.`

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { mediaIds, filter, limit = 10 } = body as {
      mediaIds?: string[]
      filter?: 'unanalyzed'
      limit?: number
    }

    const clampedLimit = Math.min(Math.max(1, limit), 50)

    if (!mediaIds && !filter) {
      return NextResponse.json(
        { error: 'Provide mediaIds array or filter: "unanalyzed"' },
        { status: 400 }
      )
    }

    const supabase = getSupabase()
    const anthropic = new Anthropic({ apiKey: process.env.ANTHROPIC_API_KEY })

    // Fetch media records to process
    let query = supabase
      .from('media_files')
      .select('id, public_url, tags, metadata, file_type')
      .eq('file_type', 'image')
      .is('deleted_at', null)

    if (mediaIds && mediaIds.length > 0) {
      query = query.in('id', mediaIds)
    }

    const { data: mediaRecords, error: fetchError } = await query.limit(clampedLimit * 2)

    if (fetchError) throw fetchError
    if (!mediaRecords || mediaRecords.length === 0) {
      return NextResponse.json({ processed: 0, failed: 0, results: [] })
    }

    // Filter to those without AI analysis (unless specific IDs were given)
    const toProcess = filter === 'unanalyzed' || !mediaIds
      ? mediaRecords.filter((m: any) => !m.metadata?.ai_analysis).slice(0, clampedLimit)
      : mediaRecords.slice(0, clampedLimit)

    const results: AnalysisResult[] = []
    let processed = 0
    let failed = 0

    // Process sequentially to avoid rate limits
    for (const item of toProcess) {
      try {
        const response = await anthropic.messages.create({
          model: 'claude-sonnet-4-5-20250929',
          max_tokens: 2000,
          messages: [{
            role: 'user',
            content: [
              {
                type: 'image',
                source: { type: 'url', url: item.public_url },
              },
              { type: 'text', text: ANALYSIS_PROMPT },
            ],
          }],
        })

        const aiText = response.content[0].type === 'text' ? response.content[0].text : ''
        const jsonMatch = aiText.match(/\{[\s\S]*\}/)

        if (!jsonMatch) {
          failed++
          results.push({ media_id: item.id, success: false, error: 'No JSON in AI response' })
          continue
        }

        const analysis = JSON.parse(jsonMatch[0])

        // Merge existing tags with AI-suggested tags (no duplicates)
        const existingTags: string[] = item.tags || []
        const newTags = Array.from(new Set([...existingTags, ...(analysis.suggested_tags || [])]))

        await (supabase as any)
          .from('media_files')
          .update({
            description: analysis.description,
            alt_text: analysis.alt_text,
            tags: newTags,
            requires_elder_approval: analysis.is_sensitive,
            cultural_sensitivity_notes: analysis.sensitivity_notes || null,
            metadata: {
              ...(item.metadata || {}),
              ai_analysis: {
                themes: analysis.detected_themes,
                people_count: analysis.people_count,
                location_hints: analysis.location_hints,
                mood: analysis.mood,
                cultural_elements: analysis.cultural_elements,
                suggested_caption: analysis.suggested_caption,
                analyzed_at: new Date().toISOString(),
              },
            },
          })
          .eq('id', item.id)

        processed++
        results.push({ media_id: item.id, success: true, tags: newTags })
      } catch (err: any) {
        failed++
        results.push({
          media_id: item.id,
          success: false,
          error: err?.message || 'Analysis failed',
        })
      }
    }

    return NextResponse.json({
      processed,
      failed,
      total: toProcess.length,
      results,
    })
  } catch (error: any) {
    console.error('Batch analysis error:', error)
    return NextResponse.json(
      { error: error?.message || 'Batch analysis failed' },
      { status: 500 }
    )
  }
}
