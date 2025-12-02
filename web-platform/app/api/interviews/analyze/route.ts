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

interface ExtractedQuote {
  quote_text: string
  context: string
  theme: string
  sentiment: string
  impact_area: string
  significance: string
  suggested_for_report: boolean
}

interface TranscriptAnalysis {
  summary: string
  key_themes: string[]
  extracted_quotes: ExtractedQuote[]
  recommendations: string[]
  total_quotes_found: number
}

// POST - Analyze an interview transcript and extract quotes
export async function POST(request: NextRequest) {
  try {
    const supabase = getSupabase()
    const body = await request.json()
    const { interview_id, transcript_text, storyteller_id, storyteller_name } = body

    if (!transcript_text && !interview_id) {
      return NextResponse.json(
        { error: 'Either transcript_text or interview_id is required' },
        { status: 400 }
      )
    }

    let transcript = transcript_text
    let interviewData: any = null
    let profileId = storyteller_id
    let profileName = storyteller_name

    // If interview_id provided, fetch the interview
    if (interview_id) {
      const { data, error } = await (supabase as any)
        .from('interviews')
        .select(`
          *,
          storyteller:storyteller_id(id, full_name, preferred_name)
        `)
        .eq('id', interview_id)
        .single()

      if (error || !data) {
        return NextResponse.json(
          { error: 'Interview not found' },
          { status: 404 }
        )
      }

      interviewData = data
      transcript = data.raw_transcript || data.edited_transcript
      profileId = data.storyteller_id
      profileName = data.storyteller?.preferred_name || data.storyteller?.full_name || 'Community Member'
    }

    if (!transcript) {
      return NextResponse.json(
        { error: 'No transcript content found' },
        { status: 400 }
      )
    }

    // Use Claude to analyze the transcript
    const response = await anthropic.messages.create({
      model: 'claude-sonnet-4-5-20250929',
      max_tokens: 4000,
      messages: [{
        role: 'user',
        content: `Analyze this interview transcript from ${profileName || 'a community member'} at Palm Island Community Company. Extract meaningful quotes that could be used in annual reports, community stories, or promotional materials.

TRANSCRIPT:
${transcript}

Please analyze and return JSON in this exact format:
{
  "summary": "A 2-3 sentence summary of the interview content and main points discussed",
  "key_themes": ["array", "of", "main", "themes", "discussed"],
  "extracted_quotes": [
    {
      "quote_text": "The exact quote from the transcript, properly cleaned up for grammar if needed but preserving the speaker's voice",
      "context": "Brief context about what prompted this quote or what it relates to",
      "theme": "One of: community | services | culture | history | achievement | resilience | youth | elders | innovation | connection",
      "sentiment": "One of: positive | inspiring | reflective | grateful | hopeful | determined | proud",
      "impact_area": "One of: community_wellbeing | cultural_preservation | youth_development | employment | health | education | housing | environment",
      "significance": "Why this quote is meaningful or impactful",
      "suggested_for_report": true or false - whether this quote would work well in an annual report
    }
  ],
  "recommendations": ["Suggestions for follow-up questions or stories to explore based on this interview"]
}

Guidelines:
- Extract 3-10 meaningful quotes depending on transcript length
- Prioritize quotes that show community impact, personal growth, cultural connection, or gratitude
- Clean up quotes for readability but maintain authentic voice
- Look for quotes that tell a story or express emotion
- Flag the most powerful quotes as suggested_for_report: true
- Be culturally respectful and sensitive to Indigenous perspectives
- Recognize the strength and resilience of the Palm Island community

Return ONLY the JSON, no other text.`
      }]
    })

    // Parse the AI response
    const aiText = response.content[0].type === 'text' ? response.content[0].text : ''
    let analysis: TranscriptAnalysis

    try {
      const jsonMatch = aiText.match(/\{[\s\S]*\}/)
      if (jsonMatch) {
        analysis = JSON.parse(jsonMatch[0])
      } else {
        throw new Error('No JSON found in response')
      }
    } catch (parseError) {
      console.error('Failed to parse AI response:', aiText)
      return NextResponse.json(
        { error: 'Failed to parse AI analysis' },
        { status: 500 }
      )
    }

    // Store extracted quotes in the database
    const quotesToInsert = analysis.extracted_quotes.map((quote, index) => ({
      profile_id: profileId || null,
      quote_text: quote.quote_text,
      attribution: profileName || 'Community Member',
      context: quote.context,
      theme: quote.theme,
      sentiment: quote.sentiment,
      impact_area: quote.impact_area,
      suggested_for_report: quote.suggested_for_report,
      is_validated: false, // Requires manual validation
      tenant_id: '9c4e5de2-d80a-4e0b-8a89-1bbf09485532',
      metadata: {
        significance: quote.significance,
        source: interview_id ? 'interview' : 'direct_transcript',
        interview_id: interview_id || null,
        extraction_date: new Date().toISOString()
      }
    }))

    if (quotesToInsert.length > 0) {
      const { data: insertedQuotes, error: insertError } = await (supabase as any)
        .from('extracted_quotes')
        .insert(quotesToInsert)
        .select()

      if (insertError) {
        console.error('Error inserting quotes:', insertError)
      }
    }

    // Update interview with analysis if interview_id provided
    if (interview_id) {
      await (supabase as any)
        .from('interviews')
        .update({
          key_themes: analysis.key_themes,
          interview_notes: analysis.summary,
          status: 'transcribed',
          metadata: {
            ai_analysis: {
              summary: analysis.summary,
              key_themes: analysis.key_themes,
              quotes_extracted: analysis.extracted_quotes.length,
              recommendations: analysis.recommendations,
              analyzed_at: new Date().toISOString()
            }
          }
        })
        .eq('id', interview_id)
    }

    return NextResponse.json({
      success: true,
      analysis: {
        ...analysis,
        total_quotes_found: analysis.extracted_quotes.length
      },
      quotes_stored: quotesToInsert.length,
      interview_id
    })

  } catch (error: any) {
    console.error('Transcript analysis error:', error)
    return NextResponse.json(
      { error: error.message || 'Failed to analyze transcript' },
      { status: 500 }
    )
  }
}

// GET - Get analysis for an interview
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const interview_id = searchParams.get('interview_id')
    const storyteller_id = searchParams.get('storyteller_id')

    const supabase = getSupabase()

    if (interview_id) {
      // Get specific interview analysis
      const { data: interview } = await (supabase as any)
        .from('interviews')
        .select('id, interview_title, key_themes, interview_notes, metadata')
        .eq('id', interview_id)
        .single()

      const { data: quotes } = await (supabase as any)
        .from('extracted_quotes')
        .select('*')
        .eq('metadata->>interview_id', interview_id)
        .order('created_at')

      return NextResponse.json({
        interview,
        quotes: quotes || [],
        analysis: interview?.metadata?.ai_analysis
      })
    }

    if (storyteller_id) {
      // Get all quotes for a storyteller
      const { data: quotes } = await (supabase as any)
        .from('extracted_quotes')
        .select('*')
        .eq('profile_id', storyteller_id)
        .order('created_at', { ascending: false })

      const { data: interviews } = await (supabase as any)
        .from('interviews')
        .select('id, interview_title, interview_date, key_themes, status')
        .eq('storyteller_id', storyteller_id)
        .order('interview_date', { ascending: false })

      return NextResponse.json({
        quotes: quotes || [],
        interviews: interviews || [],
        total_quotes: quotes?.length || 0
      })
    }

    return NextResponse.json(
      { error: 'Either interview_id or storyteller_id is required' },
      { status: 400 }
    )

  } catch (error: any) {
    return NextResponse.json(
      { error: error.message },
      { status: 500 }
    )
  }
}
