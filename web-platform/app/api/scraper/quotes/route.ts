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

// GET - List extracted quotes
export async function GET(request: NextRequest) {
  try {
    const supabase = getSupabase()
    const { searchParams } = new URL(request.url)
    const theme = searchParams.get('theme')
    const validated = searchParams.get('validated')
    const forReport = searchParams.get('for_report')
    const limit = parseInt(searchParams.get('limit') || '20')

    let query = supabase
      .from('extracted_quotes')
      .select(`
        *,
        chunk:content_chunks(id, chunk_text, content_id),
        profile:profiles(id, full_name, role)
      `)
      .order('created_at', { ascending: false })
      .limit(limit)

    if (theme) {
      query = query.eq('theme', theme)
    }
    if (validated === 'true') {
      query = query.eq('is_validated', true)
    }
    if (forReport === 'true') {
      query = query.eq('suggested_for_report', true)
    }

    const { data, error } = await query

    if (error) {
      return NextResponse.json({ error: error.message }, { status: 500 })
    }

    return NextResponse.json(data)
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 })
  }
}

// POST - Extract quotes from content using AI or manually add
export async function POST(request: NextRequest) {
  try {
    const supabase = getSupabase()
    const body = await request.json()

    // Manual quote addition
    if (body.manual) {
      const { quote_text, attribution, context, theme, sentiment, impact_area, photo_url } = body

      const { data, error } = await supabase
        .from('extracted_quotes')
        .insert({
          quote_text,
          attribution,
          context,
          theme,
          sentiment,
          impact_area,
          photo_url,
          suggested_for_report: true,
          is_validated: true,
          validated_at: new Date().toISOString()
        })
        .select()
        .single()

      if (error) {
        return NextResponse.json({ error: error.message }, { status: 500 })
      }

      return NextResponse.json({ success: true, quote: data })
    }

    // AI-powered quote extraction from content
    const { content_id } = body

    if (!content_id) {
      return NextResponse.json({ error: 'content_id is required for AI extraction' }, { status: 400 })
    }

    // Get the content
    const { data: content, error: contentError } = await supabase
      .from('scraped_content')
      .select('*, chunks:content_chunks(id, chunk_text)')
      .eq('id', content_id)
      .single()

    if (contentError || !content) {
      return NextResponse.json({ error: 'Content not found' }, { status: 404 })
    }

    // Use Claude to extract quotes
    const contentText = content.markdown_content || content.content
    const response = await anthropic.messages.create({
      model: 'claude-sonnet-4-5-20250929',
      max_tokens: 2000,
      messages: [{
        role: 'user',
        content: `Analyze this content from Palm Island Community Company and extract meaningful quotes suitable for an annual report.

Content:
${contentText.substring(0, 8000)}

For each quote, provide:
1. The exact quote text
2. Who said it (if identifiable, otherwise "Community member" or "PICC staff")
3. Context around the quote
4. Theme (one of: community, services, culture, history, achievement, youth, employment, health)
5. Sentiment (positive, inspiring, reflective, or neutral)
6. Impact area (employment, youth, health, culture, infrastructure, community)

Return as JSON array:
[
  {
    "quote_text": "...",
    "attribution": "...",
    "context": "...",
    "theme": "...",
    "sentiment": "...",
    "impact_area": "..."
  }
]

Only extract genuine, impactful quotes that would look good in an annual report. Skip generic or unimportant text.`
      }]
    })

    // Parse the AI response
    const aiText = response.content[0].type === 'text' ? response.content[0].text : ''
    let extractedQuotes: any[] = []

    try {
      // Extract JSON from the response
      const jsonMatch = aiText.match(/\[[\s\S]*\]/)
      if (jsonMatch) {
        extractedQuotes = JSON.parse(jsonMatch[0])
      }
    } catch (e) {
      console.error('Failed to parse AI response:', e)
    }

    // Save extracted quotes
    const savedQuotes = []
    for (const quote of extractedQuotes) {
      const { data, error } = await supabase
        .from('extracted_quotes')
        .insert({
          quote_text: quote.quote_text,
          attribution: quote.attribution,
          context: quote.context,
          theme: quote.theme,
          sentiment: quote.sentiment,
          impact_area: quote.impact_area,
          suggested_for_report: true,
          is_validated: false // Needs admin validation
        })
        .select()
        .single()

      if (!error && data) {
        savedQuotes.push(data)
      }
    }

    return NextResponse.json({
      success: true,
      quotes_extracted: savedQuotes.length,
      quotes: savedQuotes
    })
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 })
  }
}

// PUT - Update/validate a quote
export async function PUT(request: NextRequest) {
  try {
    const supabase = getSupabase()
    const body = await request.json()
    const { quote_id, ...updates } = body

    if (!quote_id) {
      return NextResponse.json({ error: 'quote_id is required' }, { status: 400 })
    }

    // If validating, add timestamp
    if (updates.is_validated) {
      updates.validated_at = new Date().toISOString()
    }

    const { data, error } = await supabase
      .from('extracted_quotes')
      .update(updates)
      .eq('id', quote_id)
      .select()
      .single()

    if (error) {
      return NextResponse.json({ error: error.message }, { status: 500 })
    }

    return NextResponse.json({ success: true, quote: data })
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 })
  }
}
