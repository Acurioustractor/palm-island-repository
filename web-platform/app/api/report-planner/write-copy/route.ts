/**
 * AI copy writing for report planner text slots.
 *
 * POST /api/report-planner/write-copy
 * Body: { pageKey, slotId, slotLabel, fiscalYear, audience?, existingText? }
 * Returns: { text }
 */

import { NextRequest, NextResponse } from 'next/server'
import Anthropic from '@anthropic-ai/sdk'
import { createClient } from '@supabase/supabase-js'

const PAGE_CONTEXT: Record<string, string> = {
  cover: 'The cover page of the annual report. Sets the tone for the entire document.',
  acknowledgement: 'Acknowledgement of Country — respectful recognition of Traditional Owners of Palm Island (Bwgcolman).',
  messages: 'Leadership messages from the CEO and Chair. Should convey accomplishment, gratitude, and forward vision.',
  numbers: 'Year in Numbers page — headline statistics and impact metrics.',
  highlights: 'Key achievements and milestones from the fiscal year.',
  communityVoices: 'Community voices section — stories and quotes from community members, elders, and clients.',
  youthVoices: 'Youth voices section — perspectives from young community members.',
  resilience: 'Resilience and traditional knowledge — flood preparedness, cultural wisdom.',
  governance: 'Board of Directors and governance structure.',
  compliance: 'CATSI Act compliance, auditor information, regulatory requirements.',
  directorsReport: 'Directors\' declaration and formal report to members.',
  services: 'Overview of programs and services delivered to the community.',
  innovation: 'Innovation projects and new initiatives.',
  financials: 'Financial summary — income, expenditure, and net result.',
  financialDetail: 'Detailed financial breakdown by funder and year-on-year comparison.',
  journey: 'Organizational history timeline from foundation to present.',
  nextTwenty: 'Vision for the next 20 years — goals, aspirations, and CEO outlook.',
  backCover: 'Back cover with mission statement and contact details.',
}

export async function POST(request: NextRequest) {
  const apiKey = process.env.ANTHROPIC_API_KEY
  if (!apiKey) {
    return NextResponse.json({ error: 'AI writing not configured' }, { status: 503 })
  }

  try {
    const body = await request.json()
    const { pageKey, slotId, slotLabel, fiscalYear = '2024-25', audience, existingText } = body

    if (!pageKey || !slotId || !slotLabel) {
      return NextResponse.json({ error: 'Missing required fields' }, { status: 400 })
    }

    // Fetch contextual data from Supabase for richer generation
    const contextData = await fetchContext(pageKey, fiscalYear)

    const pageDesc = PAGE_CONTEXT[pageKey] || 'A section of the annual report.'
    const audienceNote = audience
      ? `The target audience is "${audience}" — tailor tone and emphasis accordingly.`
      : 'This is for a general audience.'

    const systemPrompt = `You are a professional copywriter for Palm Island Community Company (PICC), an Aboriginal community organisation on Bwgcolman (Palm Island), Queensland, Australia. Founded in 2004, PICC delivers health, family, justice, housing, and economic development services.

Writing voice:
- Warm, community-centred, strength-based (never deficit language)
- Professional but accessible — avoid jargon
- Respectful of Aboriginal culture and protocols
- Use "we" when speaking as the organisation
- Celebrate achievements without exaggeration
- Acknowledge challenges with resilience framing

The fiscal year is ${fiscalYear} (July to June).
${audienceNote}`

    const userPrompt = `Write content for the "${slotLabel}" slot on the "${pageDesc}" page of PICC's annual report.

Page context: ${pageDesc}
Slot: ${slotLabel} (ID: ${slotId})

${contextData ? `Relevant data for context:\n${contextData}\n` : ''}
${existingText ? `Existing text (improve or rewrite as needed):\n${existingText}\n` : ''}
Write the content directly — no introductions, headings, or meta-commentary. Just the text that will appear in the report. Keep it concise and impactful (2-4 paragraphs for body text, 1-2 sentences for shorter slots like titles or statements).`

    const client = new Anthropic({ apiKey })
    const message = await client.messages.create({
      model: 'claude-sonnet-4-6',
      max_tokens: 1024,
      system: systemPrompt,
      messages: [{ role: 'user', content: userPrompt }],
    })

    const textBlock = message.content.find(b => b.type === 'text')
    const generatedText = textBlock ? textBlock.text.trim() : ''

    if (!generatedText) {
      return NextResponse.json({ error: 'No text generated' }, { status: 500 })
    }

    return NextResponse.json({ text: generatedText })
  } catch (err: any) {
    console.error('Write copy failed:', err)
    return NextResponse.json(
      { error: err.message || 'AI generation failed' },
      { status: 500 }
    )
  }
}

/** Fetch relevant Supabase data to give the AI context for this page */
async function fetchContext(pageKey: string, fiscalYear: string): Promise<string | null> {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL
  const key = process.env.SUPABASE_SERVICE_ROLE_KEY
  if (!url || !key) return null

  const supabase = createClient(url, key, {
    auth: { autoRefreshToken: false, persistSession: false },
  })

  try {
    const snippets: string[] = []

    // Get report stats for context
    if (['numbers', 'highlights', 'services', 'financials', 'nextTwenty'].includes(pageKey)) {
      const reportYear = parseInt(fiscalYear.split('-')[0], 10) + 1
      const { data: stats } = await supabase
        .from('report_statistics')
        .select('stat_label, stat_value, stat_unit, category')
        .limit(10)
      if (stats?.length) {
        snippets.push('Key statistics: ' + stats.map(s =>
          `${s.stat_label}: ${s.stat_value}${s.stat_unit ? ' ' + s.stat_unit : ''}`
        ).join(', '))
      }
    }

    // Get services for services/innovation pages
    if (['services', 'innovation'].includes(pageKey)) {
      const { data: services } = await supabase
        .from('organization_services')
        .select('name, service_category, staff_count, clients_served_annual')
        .eq('is_active', true)
        .limit(10)
      if (services?.length) {
        snippets.push('Active services: ' + services.map(s =>
          `${s.name} (${s.service_category}${s.staff_count ? ', ' + s.staff_count + ' staff' : ''})`
        ).join('; '))
      }
    }

    // Get highlights
    if (['highlights', 'messages'].includes(pageKey)) {
      const { data: highlights } = await supabase
        .from('report_highlights')
        .select('title, description, impact_achieved')
        .eq('is_featured', true)
        .limit(5)
      if (highlights?.length) {
        snippets.push('Featured highlights: ' + highlights.map(h =>
          `${h.title}: ${h.impact_achieved || h.description}`
        ).join('; '))
      }
    }

    return snippets.length > 0 ? snippets.join('\n') : null
  } catch {
    return null
  }
}
