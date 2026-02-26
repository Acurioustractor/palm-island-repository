/**
 * Generate a branded chart image using Gemini AI
 *
 * POST /api/report-planner/generate-chart
 * Body: { slotId, label, value, unit }
 *
 * Returns: { url, prompt, mediaFileId? }
 */

import { NextRequest, NextResponse } from 'next/server'

export const runtime = 'nodejs'
export const maxDuration = 60

// PICC brand colors for chart generation
const BRAND_COLORS = {
  ocean: '#0B4F6C',
  ochre: '#C8963E',
  reef: '#2A9D8F',
  mangrove: '#386641',
  coral: '#E76F51',
  starGold: '#FFB703',
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { slotId, label, value, unit } = body

    if (!label) {
      return NextResponse.json({ error: 'Missing label' }, { status: 400 })
    }

    // Build a descriptive prompt for Gemini chart generation
    const prompt = buildChartPrompt(slotId, label, value, unit)

    // Return the prompt for client-side Gemini MCP call
    // The client will call mcp__gemini-image__create_asset
    return NextResponse.json({
      prompt,
      brandColors: BRAND_COLORS,
      // The actual image generation happens client-side via Gemini MCP
      // This endpoint provides the prompt and metadata
      instructions: 'Use the returned prompt with the Gemini image generation tool to create the chart.',
    })
  } catch (error: unknown) {
    console.error('Chart prompt generation failed:', error)
    return NextResponse.json(
      { error: 'Chart generation failed' },
      { status: 500 }
    )
  }
}

function buildChartPrompt(slotId: string, label: string, value: string, unit: string): string {
  const isFinancial = slotId?.includes('fin') || label.toLowerCase().includes('revenue') || label.toLowerCase().includes('expenditure')
  const isImpact = slotId?.includes('numbers') || label.toLowerCase().includes('impact')

  const basePrompt = `Create a clean, professional infographic chart for an annual report.

Brand: Palm Island Community Company (PICC)
Brand colors: Ocean Blue (#0B4F6C), Ochre Gold (#C8963E), Reef Teal (#2A9D8F), Mangrove Green (#386641)

Chart subject: ${label}
${value ? `Key value: ${value}${unit ? ` ${unit}` : ''}` : ''}

Style requirements:
- Clean, modern, corporate annual report quality
- Use the brand colors listed above
- White or very light background
- Clear, readable labels
- No decorative elements — pure data visualization
- 16:9 aspect ratio suitable for a printed A4 page`

  if (isFinancial) {
    return `${basePrompt}
- Use horizontal bar chart or clean pie chart style
- Show financial breakdown with currency formatting
- Professional accounting-grade presentation`
  }

  if (isImpact) {
    return `${basePrompt}
- Use large number callouts or icon-driven infographic style
- Bold, impactful visual treatment
- Community-oriented warm feel`
  }

  return basePrompt
}
