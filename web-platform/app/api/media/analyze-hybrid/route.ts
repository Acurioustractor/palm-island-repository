import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@supabase/supabase-js'
import Anthropic from '@anthropic-ai/sdk'

// NOTE: To use Google Cloud Vision, install: npm install @google-cloud/vision
// And set GOOGLE_APPLICATION_CREDENTIALS env var to your service account JSON

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

interface VisionAnalysis {
  labels: string[]
  faces_detected: number
  text_in_image: string[]
  dominant_colors: string[]
  safe_search: {
    adult: string
    violence: string
    racy: string
  }
  landmarks: string[]
}

interface ClaudeAnalysis {
  description: string
  alt_text: string
  cultural_context: string
  suggested_caption: string
  mood: string
  cultural_sensitivity: {
    is_sensitive: boolean
    notes: string
    requires_elder_review: boolean
  }
  storytelling_potential: string
}

interface HybridAnalysis {
  technical: VisionAnalysis
  cultural: ClaudeAnalysis
  combined_tags: string[]
  confidence_score: number
}

// Google Cloud Vision analysis (fast, accurate technical detection)
// NOTE: Google Vision is optional. Install @google-cloud/vision and set
// GOOGLE_CLOUD_PROJECT_ID if you want to use it.
async function analyzeWithGoogleVision(_imageUrl: string): Promise<VisionAnalysis | null> {
  // Google Vision is not configured/installed - skip technical analysis
  // This uses Claude-only analysis which works great for community photos
  console.log('Google Vision not configured, using Claude-only analysis')
  return null
}

// Claude analysis (cultural context, nuance, storytelling)
async function analyzeWithClaude(
  imageUrl: string,
  technicalData?: VisionAnalysis | null
): Promise<ClaudeAnalysis> {
  const technicalContext = technicalData
    ? `
Technical analysis already detected:
- Objects/labels: ${technicalData.labels.join(', ')}
- People visible: ${technicalData.faces_detected}
- Text in image: ${technicalData.text_in_image.join(', ') || 'None'}
- Landmarks: ${technicalData.landmarks.join(', ') || 'None'}
`
    : ''

  const response = await anthropic.messages.create({
    model: 'claude-sonnet-4-5-20250929',
    max_tokens: 1500,
    messages: [{
      role: 'user',
      content: [
        {
          type: 'image',
          source: { type: 'url', url: imageUrl }
        },
        {
          type: 'text',
          text: `You are helping the Palm Island Community Company (an Indigenous Australian organization) analyze this photo for their community archive and annual reports.

${technicalContext}

Focus on what YOU do best - understanding cultural context, nuance, and storytelling potential. Provide analysis in JSON:

{
  "description": "2-3 sentences describing the scene, focusing on human elements and story",
  "alt_text": "Concise accessibility description (max 125 chars)",
  "cultural_context": "What cultural significance might this image have? What story does it tell about community life?",
  "suggested_caption": "An engaging caption for social media or reports",
  "mood": "The emotional tone/atmosphere of the image",
  "cultural_sensitivity": {
    "is_sensitive": true/false,
    "notes": "Explain any cultural considerations",
    "requires_elder_review": true/false if contains ceremony, sacred sites, or deceased persons
  },
  "storytelling_potential": "How could this image be used in community storytelling or annual reports?"
}

Be respectful, culturally aware, and recognize the strength and resilience of Indigenous communities.
Return ONLY the JSON.`
        }
      ]
    }]
  })

  const aiText = response.content[0].type === 'text' ? response.content[0].text : ''

  try {
    const jsonMatch = aiText.match(/\{[\s\S]*\}/)
    if (jsonMatch) {
      return JSON.parse(jsonMatch[0])
    }
  } catch (e) {
    console.error('Failed to parse Claude response')
  }

  // Default response
  return {
    description: 'Community photo',
    alt_text: 'Community photo from Palm Island',
    cultural_context: 'Part of community documentation',
    suggested_caption: 'Community moment captured',
    mood: 'neutral',
    cultural_sensitivity: {
      is_sensitive: false,
      notes: '',
      requires_elder_review: false
    },
    storytelling_potential: 'Could be used in community archives'
  }
}

// Combine tags intelligently
function combineTags(technical: VisionAnalysis | null, cultural: ClaudeAnalysis): string[] {
  const tags = new Set<string>()

  // Add technical labels (normalized)
  if (technical?.labels) {
    technical.labels.forEach(label => {
      const normalized = label.toLowerCase().replace(/\s+/g, '-')
      tags.add(normalized)
    })
  }

  // Add mood as tag
  if (cultural.mood) {
    tags.add(cultural.mood.toLowerCase())
  }

  // Add community-specific tags based on description
  const description = cultural.description.toLowerCase()
  if (description.includes('elder')) tags.add('elders')
  if (description.includes('youth') || description.includes('children')) tags.add('youth')
  if (description.includes('ceremony') || description.includes('cultural')) tags.add('culture')
  if (description.includes('community')) tags.add('community')
  if (description.includes('celebration') || description.includes('event')) tags.add('events')

  // Palm Island specific tags
  tags.add('palm-island')

  return Array.from(tags).slice(0, 20) // Limit to 20 tags
}

// POST - Hybrid analysis
export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { image_url, media_id, use_google_vision = true } = body

    if (!image_url) {
      return NextResponse.json(
        { error: 'image_url is required' },
        { status: 400 }
      )
    }

    // Step 1: Technical analysis with Google Vision (fast)
    let technicalAnalysis: VisionAnalysis | null = null
    if (use_google_vision) {
      technicalAnalysis = await analyzeWithGoogleVision(image_url)
    }

    // Step 2: Cultural/contextual analysis with Claude
    const culturalAnalysis = await analyzeWithClaude(image_url, technicalAnalysis)

    // Step 3: Combine results
    const combinedTags = combineTags(technicalAnalysis, culturalAnalysis)

    const hybridAnalysis: HybridAnalysis = {
      technical: technicalAnalysis || {
        labels: [],
        faces_detected: 0,
        text_in_image: [],
        dominant_colors: [],
        safe_search: { adult: 'UNKNOWN', violence: 'UNKNOWN', racy: 'UNKNOWN' },
        landmarks: []
      },
      cultural: culturalAnalysis,
      combined_tags: combinedTags,
      confidence_score: technicalAnalysis ? 0.9 : 0.7
    }

    // Step 4: Update database if media_id provided
    if (media_id) {
      const supabase = getSupabase()

      await (supabase as any)
        .from('media_files')
        .update({
          description: culturalAnalysis.description,
          alt_text: culturalAnalysis.alt_text,
          tags: combinedTags,
          requires_elder_approval: culturalAnalysis.cultural_sensitivity.requires_elder_review,
          cultural_sensitivity_notes: culturalAnalysis.cultural_sensitivity.notes || null,
          metadata: {
            hybrid_analysis: {
              technical: technicalAnalysis,
              cultural: culturalAnalysis,
              analyzed_at: new Date().toISOString(),
              analysis_version: 'hybrid-v1'
            }
          }
        })
        .eq('id', media_id)
    }

    return NextResponse.json({
      success: true,
      analysis: hybridAnalysis,
      media_id,
      providers_used: {
        google_vision: !!technicalAnalysis,
        claude: true
      }
    })

  } catch (error: any) {
    console.error('Hybrid analysis error:', error)
    return NextResponse.json(
      { error: error.message || 'Analysis failed' },
      { status: 500 }
    )
  }
}
