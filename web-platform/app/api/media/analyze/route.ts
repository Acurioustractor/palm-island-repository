import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@supabase/supabase-js'
import Anthropic from '@anthropic-ai/sdk'

function getSupabase() {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL
  const key = process.env.SUPABASE_SERVICE_ROLE_KEY

  if (!url || !key) {
    throw new Error('Missing Supabase credentials')
  }

  return createClient(url, key, {
    auth: { autoRefreshToken: false, persistSession: false }
  })
}

const anthropic = new Anthropic({
  apiKey: process.env.ANTHROPIC_API_KEY
})

interface PhotoAnalysis {
  description: string
  alt_text: string
  suggested_tags: string[]
  detected_themes: string[]
  people_count: number
  location_hints: string[]
  mood: string
  cultural_elements: string[]
  suggested_caption: string
  is_sensitive: boolean
  sensitivity_notes?: string
}

// POST - Analyze a photo with AI
export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { image_url, image_base64, media_id } = body

    if (!image_url && !image_base64) {
      return NextResponse.json(
        { error: 'Either image_url or image_base64 is required' },
        { status: 400 }
      )
    }

    // Prepare the image for Claude
    let imageContent: any

    if (image_base64) {
      // Direct base64 image
      const mediaType = image_base64.startsWith('/9j/') ? 'image/jpeg' :
                       image_base64.startsWith('iVBOR') ? 'image/png' :
                       'image/jpeg'
      imageContent = {
        type: 'image',
        source: {
          type: 'base64',
          media_type: mediaType,
          data: image_base64
        }
      }
    } else {
      // URL-based image
      imageContent = {
        type: 'image',
        source: {
          type: 'url',
          url: image_url
        }
      }
    }

    // Use Claude to analyze the image
    const response = await anthropic.messages.create({
      model: 'claude-sonnet-4-5-20250929',
      max_tokens: 2000,
      messages: [{
        role: 'user',
        content: [
          imageContent,
          {
            type: 'text',
            text: `Analyze this photo for the Palm Island Community Company platform. This is an Indigenous Australian community organization.

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

Be respectful and culturally aware. Focus on:
- Community activities and events
- Cultural significance
- People and relationships
- Environmental/location context
- Potential use in annual reports or community stories

Return ONLY the JSON, no other text.`
          }
        ]
      }]
    })

    // Parse the AI response
    const aiText = response.content[0].type === 'text' ? response.content[0].text : ''
    let analysis: PhotoAnalysis

    try {
      // Extract JSON from the response
      const jsonMatch = aiText.match(/\{[\s\S]*\}/)
      if (jsonMatch) {
        analysis = JSON.parse(jsonMatch[0])
      } else {
        throw new Error('No JSON found in response')
      }
    } catch (parseError) {
      console.error('Failed to parse AI response:', aiText)
      // Return a default analysis
      analysis = {
        description: 'Photo from Palm Island community',
        alt_text: 'Community photo',
        suggested_tags: ['community', 'palm-island'],
        detected_themes: ['community'],
        people_count: 0,
        location_hints: ['Palm Island'],
        mood: 'neutral',
        cultural_elements: [],
        suggested_caption: 'Community moment captured',
        is_sensitive: false
      }
    }

    // If media_id provided, update the database
    if (media_id) {
      const supabase = getSupabase()

      await (supabase as any)
        .from('media_files')
        .update({
          description: analysis.description,
          alt_text: analysis.alt_text,
          tags: analysis.suggested_tags,
          requires_elder_approval: analysis.is_sensitive,
          cultural_sensitivity_notes: analysis.sensitivity_notes || null,
          metadata: {
            ai_analysis: {
              themes: analysis.detected_themes,
              people_count: analysis.people_count,
              location_hints: analysis.location_hints,
              mood: analysis.mood,
              cultural_elements: analysis.cultural_elements,
              suggested_caption: analysis.suggested_caption,
              analyzed_at: new Date().toISOString()
            }
          }
        })
        .eq('id', media_id)
    }

    return NextResponse.json({
      success: true,
      analysis,
      media_id
    })

  } catch (error: any) {
    console.error('Photo analysis error:', error)
    return NextResponse.json(
      { error: error.message || 'Failed to analyze photo' },
      { status: 500 }
    )
  }
}

// GET - Get analysis for existing media
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const media_id = searchParams.get('media_id')

    if (!media_id) {
      return NextResponse.json(
        { error: 'media_id is required' },
        { status: 400 }
      )
    }

    const supabase = getSupabase()

    const { data, error } = await (supabase as any)
      .from('media_files')
      .select('id, description, alt_text, tags, metadata, requires_elder_approval, cultural_sensitivity_notes')
      .eq('id', media_id)
      .single()

    if (error || !data) {
      return NextResponse.json(
        { error: 'Media not found' },
        { status: 404 }
      )
    }

    return NextResponse.json({
      media_id: data.id,
      analysis: {
        description: data.description,
        alt_text: data.alt_text,
        suggested_tags: data.tags || [],
        ...data.metadata?.ai_analysis
      }
    })

  } catch (error: any) {
    return NextResponse.json(
      { error: error.message },
      { status: 500 }
    )
  }
}
