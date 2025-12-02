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

interface AnalysisResult {
  summary: {
    total_quotes: number
    total_stories: number
    themes_covered: string[]
    impact_areas: string[]
    sentiment_breakdown: Record<string, number>
  }
  key_themes: {
    theme: string
    count: number
    representative_quote?: string
    insight: string
  }[]
  impact_analysis: {
    area: string
    story_count: number
    quote_count: number
    highlights: string[]
  }[]
  ai_narrative: string
  recommendations: string[]
  generated_at: string
}

// GET - Get or generate analysis for an annual report
export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const supabase = getSupabase()
    const reportId = params.id
    const { searchParams } = new URL(request.url)
    const regenerate = searchParams.get('regenerate') === 'true'

    // Get the report
    const { data: report, error: reportError } = await supabase
      .from('annual_reports')
      .select('*, organizations(name, short_name)')
      .eq('id', reportId)
      .single()

    if (reportError || !report) {
      return NextResponse.json({ error: 'Report not found' }, { status: 404 })
    }

    // Check if we have cached analysis
    const { data: existingAnalysis } = await supabase
      .from('content_analysis')
      .select('*')
      .eq('content_type', 'annual_report')
      .eq('content_id', reportId)
      .order('created_at', { ascending: false })
      .limit(1)
      .single()

    if (existingAnalysis && !regenerate) {
      return NextResponse.json({
        analysis: existingAnalysis.analysis_result,
        cached: true,
        generated_at: existingAnalysis.created_at
      })
    }

    // Get quotes assigned to this report
    const { data: quotes } = await supabase
      .from('extracted_quotes')
      .select('*')
      .eq('used_in_report_id', reportId)
      .order('display_order')

    // Get stories for the report period
    const { data: stories } = await supabase
      .from('stories')
      .select('id, title, category, impact_area, created_at')
      .gte('created_at', report.reporting_period_start)
      .lte('created_at', report.reporting_period_end)

    // Calculate basic stats
    const quotesArray = quotes || []
    const storiesArray = stories || []

    const themes = Array.from(new Set(quotesArray.map(q => q.theme).filter(Boolean)))
    const impactAreas = Array.from(new Set([
      ...quotesArray.map(q => q.impact_area).filter(Boolean),
      ...storiesArray.map(s => s.impact_area).filter(Boolean)
    ]))

    const sentimentBreakdown: Record<string, number> = {}
    quotesArray.forEach(q => {
      if (q.sentiment) {
        sentimentBreakdown[q.sentiment] = (sentimentBreakdown[q.sentiment] || 0) + 1
      }
    })

    // Calculate theme counts
    const themeCounts: Record<string, { count: number; quotes: typeof quotesArray }> = {}
    quotesArray.forEach(q => {
      if (q.theme) {
        if (!themeCounts[q.theme]) {
          themeCounts[q.theme] = { count: 0, quotes: [] }
        }
        themeCounts[q.theme].count++
        themeCounts[q.theme].quotes.push(q)
      }
    })

    // Calculate impact area stats
    const impactStats: Record<string, { stories: number; quotes: number }> = {}
    impactAreas.forEach(area => {
      impactStats[area] = {
        stories: storiesArray.filter(s => s.impact_area === area).length,
        quotes: quotesArray.filter(q => q.impact_area === area).length
      }
    })

    // Generate AI narrative if we have content
    let aiNarrative = ''
    let recommendations: string[] = []

    if (quotesArray.length > 0 || storiesArray.length > 0) {
      const contentSummary = `
Annual Report: ${report.title}
Organization: ${report.organizations?.name || 'PICC'}
Reporting Period: ${report.reporting_period_start} to ${report.reporting_period_end}

Quotes (${quotesArray.length}):
${quotesArray.map(q => `- "${q.quote_text}" - ${q.attribution || 'Anonymous'} (Theme: ${q.theme || 'N/A'}, Impact: ${q.impact_area || 'N/A'})`).join('\n')}

Stories (${storiesArray.length}):
${storiesArray.map(s => `- ${s.title} (Category: ${s.category || 'N/A'}, Impact: ${s.impact_area || 'N/A'})`).join('\n')}

Themes covered: ${themes.join(', ') || 'None identified'}
Impact areas: ${impactAreas.join(', ') || 'None identified'}
Sentiment breakdown: ${Object.entries(sentimentBreakdown).map(([k, v]) => `${k}: ${v}`).join(', ') || 'Not analyzed'}
`

      try {
        const response = await anthropic.messages.create({
          model: 'claude-sonnet-4-5-20250929',
          max_tokens: 2000,
          messages: [{
            role: 'user',
            content: `Analyze this annual report content for Palm Island Community Company and provide:

1. A compelling narrative summary (2-3 paragraphs) that captures the essence of the community's achievements and impact during this reporting period. Make it engaging and suitable for an annual report.

2. 3-5 specific recommendations for how the organization could improve their storytelling or community engagement based on the content.

Content to analyze:
${contentSummary}

Return as JSON:
{
  "narrative": "The narrative summary...",
  "recommendations": ["recommendation 1", "recommendation 2", ...]
}

Important: Be respectful and culturally sensitive. Acknowledge the strength and resilience of the Palm Island community.`
          }]
        })

        const aiText = response.content[0].type === 'text' ? response.content[0].text : ''
        const jsonMatch = aiText.match(/\{[\s\S]*\}/)
        if (jsonMatch) {
          const parsed = JSON.parse(jsonMatch[0])
          aiNarrative = parsed.narrative || ''
          recommendations = parsed.recommendations || []
        }
      } catch (aiError) {
        console.error('AI analysis error:', aiError)
        aiNarrative = 'AI analysis not available.'
      }
    }

    // Build the analysis result
    const analysis: AnalysisResult = {
      summary: {
        total_quotes: quotesArray.length,
        total_stories: storiesArray.length,
        themes_covered: themes,
        impact_areas: impactAreas,
        sentiment_breakdown: sentimentBreakdown
      },
      key_themes: Object.entries(themeCounts)
        .sort((a, b) => b[1].count - a[1].count)
        .map(([theme, data]) => ({
          theme,
          count: data.count,
          representative_quote: data.quotes[0]?.quote_text,
          insight: `${data.count} quote${data.count === 1 ? '' : 's'} captured the ${theme} theme.`
        })),
      impact_analysis: impactAreas.map(area => ({
        area,
        story_count: impactStats[area]?.stories || 0,
        quote_count: impactStats[area]?.quotes || 0,
        highlights: quotesArray
          .filter(q => q.impact_area === area)
          .slice(0, 2)
          .map(q => q.quote_text)
      })),
      ai_narrative: aiNarrative,
      recommendations,
      generated_at: new Date().toISOString()
    }

    // Cache the analysis
    await supabase
      .from('content_analysis')
      .insert({
        content_type: 'annual_report',
        content_id: reportId,
        analysis_result: analysis,
        ai_model: 'claude-sonnet-4-5-20250929'
      })

    return NextResponse.json({
      analysis,
      cached: false,
      generated_at: analysis.generated_at
    })
  } catch (error: any) {
    console.error('Analysis error:', error)
    return NextResponse.json({ error: error.message }, { status: 500 })
  }
}

// POST - Generate specific analysis
export async function POST(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const supabase = getSupabase()
    const reportId = params.id
    const body = await request.json()
    const { analysis_type } = body

    // Get the report and its content
    const { data: report } = await supabase
      .from('annual_reports')
      .select('*')
      .eq('id', reportId)
      .single()

    if (!report) {
      return NextResponse.json({ error: 'Report not found' }, { status: 404 })
    }

    const { data: quotes } = await supabase
      .from('extracted_quotes')
      .select('*')
      .eq('used_in_report_id', reportId)

    const quotesArray = quotes || []

    switch (analysis_type) {
      case 'executive_summary': {
        // Generate executive summary
        if (quotesArray.length === 0) {
          return NextResponse.json({
            result: 'No quotes available to generate executive summary.'
          })
        }

        const response = await anthropic.messages.create({
          model: 'claude-sonnet-4-5-20250929',
          max_tokens: 1000,
          messages: [{
            role: 'user',
            content: `Write a brief executive summary (150-200 words) for an annual report based on these community quotes:

${quotesArray.map(q => `"${q.quote_text}" - ${q.attribution || 'Community member'}`).join('\n\n')}

The summary should:
- Highlight key achievements
- Emphasize community voice and impact
- Be suitable for the opening of an annual report
- Be respectful and culturally appropriate for an Indigenous community`
          }]
        })

        return NextResponse.json({
          result: response.content[0].type === 'text' ? response.content[0].text : ''
        })
      }

      case 'theme_deep_dive': {
        const { theme } = body
        const themeQuotes = quotesArray.filter(q => q.theme === theme)

        if (themeQuotes.length === 0) {
          return NextResponse.json({
            result: `No quotes found for theme: ${theme}`
          })
        }

        const response = await anthropic.messages.create({
          model: 'claude-sonnet-4-5-20250929',
          max_tokens: 800,
          messages: [{
            role: 'user',
            content: `Write a paragraph (100-150 words) analyzing the "${theme}" theme for an annual report section, based on these quotes:

${themeQuotes.map(q => `"${q.quote_text}" - ${q.attribution || 'Community member'}`).join('\n\n')}

The analysis should weave together the quotes into a cohesive narrative about how this theme manifests in the community.`
          }]
        })

        return NextResponse.json({
          result: response.content[0].type === 'text' ? response.content[0].text : '',
          quotes: themeQuotes
        })
      }

      case 'impact_summary': {
        const { impact_area } = body
        const impactQuotes = quotesArray.filter(q => q.impact_area === impact_area)

        const response = await anthropic.messages.create({
          model: 'claude-sonnet-4-5-20250929',
          max_tokens: 500,
          messages: [{
            role: 'user',
            content: `Write a brief impact statement (80-100 words) for the "${impact_area}" area of an annual report${impactQuotes.length > 0 ? `, incorporating these community voices:\n\n${impactQuotes.map(q => `"${q.quote_text}"`).join('\n')}` : '.'}`
          }]
        })

        return NextResponse.json({
          result: response.content[0].type === 'text' ? response.content[0].text : ''
        })
      }

      default:
        return NextResponse.json(
          { error: 'Unknown analysis type' },
          { status: 400 }
        )
    }
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 })
  }
}
