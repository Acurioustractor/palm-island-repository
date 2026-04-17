import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@supabase/supabase-js'
import Anthropic from '@anthropic-ai/sdk'

function getSupabase() {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL
  const key = process.env.SUPABASE_SERVICE_ROLE_KEY
  if (!url || !key) throw new Error('Missing Supabase credentials')
  return createClient(url, key, { auth: { autoRefreshToken: false, persistSession: false } })
}

export async function POST(request: NextRequest) {
  try {
    const apiKey = process.env.ANTHROPIC_API_KEY
    if (!apiKey) {
      return NextResponse.json({ error: 'ANTHROPIC_API_KEY not configured' }, { status: 500 })
    }

    const body = await request.json()
    const { fy_label, report_id } = body

    if (!fy_label) {
      return NextResponse.json({ error: 'fy_label required' }, { status: 400 })
    }

    const supabase = getSupabase()

    // Gather all data for the overview
    const [
      servicesRes,
      highlightsRes,
      boardRes,
      leadershipRes,
      projectsRes,
      storiesRes,
    ] = await Promise.all([
      supabase.from('service_metrics').select('*, organization_services(service_name)').eq('fiscal_year', fy_label),
      supabase.from('report_highlights').select('*').eq('report_id', report_id || '').limit(20),
      supabase.from('board_members').select('name, role').order('display_order'),
      supabase.from('leadership').select('name, position, leadership_type, bio'),
      supabase.from('projects').select('name, project_type, status, tagline, budget_total'),
      report_id
        ? supabase.from('annual_report_stories').select('*, stories(title, storyteller_id, category, content)').eq('report_id', report_id).limit(20)
        : Promise.resolve({ data: [], error: null }),
    ])

    // Build context document
    const services = servicesRes.data || []
    const highlights = highlightsRes.data || []
    const board = boardRes.data || []
    const leadership = leadershipRes.data || []
    const projects = projectsRes.data || []
    const stories = storiesRes.data || []

    const contextParts: string[] = []

    contextParts.push(`# PICC Annual Report Data — FY ${fy_label}`)
    contextParts.push(`Palm Island Community Company (PICC) is a First Nations community-controlled organisation on Palm Island, Queensland. Established in 2008 when community control was transferred from government.`)

    if (services.length > 0) {
      contextParts.push(`\n## Services (${services.length} programs)`)
      services.forEach((s: any) => {
        const name = s.organization_services?.service_name || 'Unknown'
        contextParts.push(`- ${name}: ${s.clients_served || '?'} clients, ${s.staff_count || '?'} staff`)
      })
    }

    if (highlights.length > 0) {
      contextParts.push(`\n## Key Highlights`)
      highlights.forEach((h: any) => {
        contextParts.push(`- ${h.title}${h.description ? ': ' + h.description : ''}`)
      })
    }

    if (board.length > 0) {
      contextParts.push(`\n## Board (${board.length} members)`)
      board.forEach((b: any) => contextParts.push(`- ${b.name} (${b.role || 'Director'})`))
    }

    if (leadership.length > 0) {
      contextParts.push(`\n## Leadership`)
      leadership.forEach((l: any) => contextParts.push(`- ${l.name}, ${l.position}${l.bio ? ' — ' + l.bio.slice(0, 100) : ''}`))
    }

    if (projects.length > 0) {
      contextParts.push(`\n## Innovation Projects (${projects.length})`)
      projects.forEach((p: any) => {
        contextParts.push(`- ${p.name} (${p.project_type || 'other'}, ${p.status || 'unknown'})${p.tagline ? ': ' + p.tagline : ''}`)
      })
    }

    if (stories.length > 0) {
      contextParts.push(`\n## Community Stories (${stories.length} linked)`)
      stories.forEach((s: any) => {
        const story = s.stories
        if (story) {
          contextParts.push(`- "${story.title}" (${story.category || 'general'})`)
        }
      })
    }

    const contextDoc = contextParts.join('\n')

    const anthropic = new Anthropic({ apiKey })

    const response = await anthropic.messages.create({
      model: 'claude-sonnet-4-6',
      max_tokens: 2000,
      messages: [{
        role: 'user',
        content: `You are writing a thematic overview summary for the Palm Island Community Company (PICC) annual report for FY ${fy_label}.

Based on the data below, produce a JSON response with this structure:
{
  "executive_summary": "2-3 sentence overview of the year",
  "themes": [
    {
      "title": "Theme name",
      "icon": "one of: heart, shield, users, lightbulb, leaf, building, book, star",
      "summary": "2-3 sentence summary of this theme",
      "key_stats": ["stat 1", "stat 2"],
      "related_sections": ["services", "stories", etc]
    }
  ],
  "strengths": ["strength 1", "strength 2", "strength 3"],
  "opportunities": ["opportunity 1", "opportunity 2"]
}

Generate 4-6 themes that group the data thematically (e.g. "Health & Wellbeing", "Cultural Strength", "Innovation & Growth", "Community Safety", "Youth & Families", "Governance & Leadership"). Each theme should draw from multiple data sources.

Use respectful, strengths-based language appropriate for a First Nations community organisation. Focus on achievements and community impact.

Data:
${contextDoc}

Respond with ONLY valid JSON, no markdown fences.`
      }],
    })

    const text = response.content[0].type === 'text' ? response.content[0].text : ''
    let overview
    try {
      overview = JSON.parse(text)
    } catch {
      const match = text.match(/\{[\s\S]*\}/)
      if (match) {
        overview = JSON.parse(match[0])
      } else {
        return NextResponse.json({ error: 'Failed to parse AI response', raw: text }, { status: 500 })
      }
    }

    return NextResponse.json({ overview, generated_at: new Date().toISOString() })
  } catch (error: any) {
    console.error('Overview generation error:', error)
    return NextResponse.json({ error: error.message }, { status: 500 })
  }
}
