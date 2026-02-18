/**
 * Expanded Context Builder for Palm AI Chat
 *
 * Wraps existing RAG vector search AND adds text-based queries
 * across all major data tables so the chat can see everything:
 * - Stories, interviews, elder quotes
 * - Services, metrics, financials
 * - Board, leadership, staff, partners
 * - Governance achievements, timeline events
 * - Plus the hardcoded PICC knowledge base for org identity
 */

import { createClient, SupabaseClient } from '@supabase/supabase-js'
import { getRAGContext } from '@/lib/scraper/rag-search'
import PICC_KNOWLEDGE_BASE, { generateExecutiveSummary } from '@/lib/picc-knowledge-base'

// ---------------------------------------------------------------------------
// Types
// ---------------------------------------------------------------------------

export interface ExpandedSource {
  title: string
  url: string
  type: string
}

export interface ExpandedContextResult {
  context: string
  sources: ExpandedSource[]
}

// ---------------------------------------------------------------------------
// Supabase helper
// ---------------------------------------------------------------------------

function getSupabase(): SupabaseClient {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL
  const key = process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY
  if (!url || !key) throw new Error('Missing Supabase credentials')
  return createClient(url, key, { auth: { autoRefreshToken: false, persistSession: false } })
}

// ---------------------------------------------------------------------------
// Intent detection — lightweight keyword matching (no LLM call)
// ---------------------------------------------------------------------------

interface DetectedIntents {
  financial: boolean
  services: boolean
  people: boolean
  quotes: boolean
  history: boolean
  partners: boolean
}

const INTENT_KEYWORDS: Record<keyof DetectedIntents, string[]> = {
  financial: ['budget', 'income', 'revenue', 'expenditure', 'financial', 'money', 'funding', 'dollar', 'assets', 'liabilities', 'audit', 'turnover', 'expense', 'cost', 'surplus', 'deficit'],
  services: ['service', 'program', 'health', 'family', 'youth', 'healing', 'safe house', 'safe haven', 'ndis', 'justice', 'digital', 'telstra', 'education', 'employment', 'ranger', 'housing', 'crisis', 'wellbeing', 'medical', 'child', 'innovation', 'project', 'photo studio', 'healthy meals', 'elders trip', 'the centre', 'movember', 'recycling', 'goods'],
  people: ['board', 'director', 'leadership', 'ceo', 'chair', 'staff', 'team', 'employee', 'worker', 'workforce', 'member', 'secretary'],
  quotes: ['interview', 'said', 'quote', 'elder', 'told', 'voice', 'wisdom', 'aunty', 'uncle', 'story', 'storyteller'],
  history: ['history', 'achievement', 'milestone', 'governance', 'timeline', 'hull river', 'cyclone', 'reserve', 'removal', 'stolen', 'manbarra', 'bwgcolman', 'founded', 'transition'],
  partners: ['partner', 'funder', 'government', 'collaboration', 'queensland', 'niaa', 'telstra', 'snaicc']
}

function detectIntents(query: string): DetectedIntents {
  const lower = query.toLowerCase()
  const intents: DetectedIntents = {
    financial: false,
    services: false,
    people: false,
    quotes: false,
    history: false,
    partners: false
  }

  for (const [intent, keywords] of Object.entries(INTENT_KEYWORDS)) {
    intents[intent as keyof DetectedIntents] = keywords.some(kw => lower.includes(kw))
  }

  return intents
}

// ---------------------------------------------------------------------------
// Data fetchers — text-based search across all tables
// ---------------------------------------------------------------------------

async function searchInterviews(supabase: SupabaseClient, query: string, limit = 3): Promise<{ text: string; sources: ExpandedSource[] }> {
  try {
    const { data: interviews } = await supabase
      .from('interviews')
      .select('id, interview_title, storyteller_id, profiles:storyteller_id(full_name)')
      .or(`interview_title.ilike.%${query}%`)
      .limit(limit)

    if (!interviews || interviews.length === 0) return { text: '', sources: [] }

    // Get segments for matched interviews
    const interviewIds = interviews.map((i: any) => i.id)
    const { data: segments } = await supabase
      .from('interview_segments')
      .select('interview_id, segment_text')
      .in('interview_id', interviewIds)
      .ilike('segment_text', `%${query}%`)
      .limit(5)

    const parts: string[] = []
    const sources: ExpandedSource[] = []

    for (const interview of interviews) {
      const name = (interview as any).profiles?.full_name || 'Community member'
      const relevantSegments = (segments || []).filter((s: any) => s.interview_id === interview.id)
      const segmentText = relevantSegments.map((s: any) => s.segment_text).join(' ').substring(0, 400)

      parts.push(`Interview with ${name}: "${interview.interview_title}"${segmentText ? `\n${segmentText}` : ''}`)
      sources.push({ title: `Interview: ${interview.interview_title}`, url: `/wiki/people/${interview.storyteller_id}`, type: 'interview' })
    }

    return { text: parts.join('\n'), sources }
  } catch {
    return { text: '', sources: [] }
  }
}

async function searchElderQuotes(supabase: SupabaseClient, query: string, limit = 5): Promise<{ text: string; sources: ExpandedSource[] }> {
  try {
    const { data: quotes } = await supabase
      .from('elder_quotes')
      .select('id, quote_text, speaker_name, context, theme')
      .or(`quote_text.ilike.%${query}%,context.ilike.%${query}%,theme.ilike.%${query}%`)
      .limit(limit)

    if (!quotes || quotes.length === 0) return { text: '', sources: [] }

    const parts = quotes.map((q: any) =>
      `"${q.quote_text}" — ${q.speaker_name || 'Elder'}${q.context ? ` (${q.context})` : ''}`
    )

    return {
      text: parts.join('\n'),
      sources: quotes.map((q: any) => ({
        title: `Elder Quote: ${q.speaker_name || 'Elder'}`,
        url: '/voices',
        type: 'quote'
      }))
    }
  } catch {
    return { text: '', sources: [] }
  }
}

async function getFinancialContext(supabase: SupabaseClient): Promise<{ text: string; sources: ExpandedSource[] }> {
  try {
    const { data: financials } = await supabase
      .from('annual_financials')
      .select('*')
      .order('fiscal_year', { ascending: false })
      .limit(5)

    if (!financials || financials.length === 0) return { text: '', sources: [] }

    const parts = financials.map((f: any) => {
      const totalExpenses = (f.labour_costs || 0) + (f.administration_expenses || 0) +
        (f.property_energy_expenses || 0) + (f.motor_vehicle_expenses || 0) +
        (f.travel_training_expenses || 0) + (f.client_related_costs || 0)
      const fmt = (n: number) => `$${(n / 1000000).toFixed(1)}M`

      return `FY${f.fiscal_year}: Income ${fmt(f.total_income || 0)}, Expenses ${fmt(totalExpenses)}, ` +
        `Assets ${fmt((f.current_assets || 0) + (f.non_current_assets || 0))}, ` +
        `Labour costs ${fmt(f.labour_costs || 0)}${f.audited ? ' (audited)' : ''}`
    })

    return {
      text: parts.join('\n'),
      sources: [{ title: 'PICC Annual Financials', url: '/impact', type: 'financial' }]
    }
  } catch {
    return { text: '', sources: [] }
  }
}

async function getServicesContext(supabase: SupabaseClient, query: string): Promise<{ text: string; sources: ExpandedSource[] }> {
  try {
    const { data: services } = await supabase
      .from('organization_services')
      .select('id, name, slug, description, service_category, is_active, staff_count, clients_served_annual')
      .eq('is_active', true)
      .or(`name.ilike.%${query}%,description.ilike.%${query}%,service_category.ilike.%${query}%`)
      .limit(5)

    if (!services || services.length === 0) {
      // If no matches, return a summary of all services
      const { data: all } = await supabase
        .from('organization_services')
        .select('name, service_category, staff_count, clients_served_annual')
        .eq('is_active', true)
        .order('name')

      if (!all || all.length === 0) return { text: '', sources: [] }

      const byCategory = all.reduce((acc: Record<string, string[]>, s: any) => {
        const cat = s.service_category || 'other'
        if (!acc[cat]) acc[cat] = []
        acc[cat].push(s.name)
        return acc
      }, {})

      const text = Object.entries(byCategory)
        .map(([cat, names]) => `${cat}: ${(names as string[]).join(', ')}`)
        .join('\n')

      return {
        text: `PICC operates ${all.length} services:\n${text}`,
        sources: [{ title: 'PICC Services', url: '/picc/services', type: 'service' }]
      }
    }

    const parts = services.map((s: any) => {
      let line = `${s.name} (${s.service_category}): ${s.description || ''}`
      if (s.staff_count) line += ` — ${s.staff_count} staff`
      if (s.clients_served_annual) line += `, ${s.clients_served_annual} clients/year`
      return line
    })

    return {
      text: parts.join('\n'),
      sources: services.map((s: any) => ({
        title: s.name,
        url: `/services`,
        type: 'service'
      }))
    }
  } catch {
    return { text: '', sources: [] }
  }
}

async function getPeopleContext(supabase: SupabaseClient): Promise<{ text: string; sources: ExpandedSource[] }> {
  try {
    const [boardResult, leadershipResult, staffResult] = await Promise.all([
      supabase.from('board_members').select('name, role, bio').order('display_order').limit(10),
      supabase.from('leadership').select('name, position, bio').eq('is_active', true).order('position_order').limit(5),
      supabase.from('staff_statistics').select('*').order('fiscal_year', { ascending: false }).limit(1)
    ])

    const parts: string[] = []
    const sources: ExpandedSource[] = []

    if (boardResult.data && boardResult.data.length > 0) {
      const boardList = boardResult.data.map((b: any) => `${b.name} (${b.role})`).join(', ')
      parts.push(`Board of Directors: ${boardList}`)
      sources.push({ title: 'PICC Board of Directors', url: '/about', type: 'governance' })
    }

    if (leadershipResult.data && leadershipResult.data.length > 0) {
      const leaderList = leadershipResult.data.map((l: any) => `${l.name} — ${l.position}`).join(', ')
      parts.push(`Leadership: ${leaderList}`)
    }

    if (staffResult.data && staffResult.data.length > 0) {
      const stats = staffResult.data[0]
      parts.push(`Staff (FY${stats.fiscal_year}): ${stats.total_staff || 'N/A'} total, ${stats.indigenous_staff_count || 'N/A'} Indigenous, ${stats.palm_island_resident_count || 'N/A'} Palm Islanders`)
    }

    return { text: parts.join('\n'), sources }
  } catch {
    return { text: '', sources: [] }
  }
}

async function getHistoryContext(supabase: SupabaseClient, query: string): Promise<{ text: string; sources: ExpandedSource[] }> {
  try {
    const { data: achievements } = await supabase
      .from('governance_achievements')
      .select('achievement_text, category, fiscal_year')
      .or(`achievement_text.ilike.%${query}%,category.ilike.%${query}%`)
      .order('fiscal_year', { ascending: false })
      .limit(5)

    const parts: string[] = []
    const sources: ExpandedSource[] = []

    // Always include key history from knowledge base
    const history = PICC_KNOWLEDGE_BASE.history
    parts.push(`Traditional Owners: ${history.traditional_owners}`)
    parts.push(`Bwgcolman means "${history.bwgcolman_meaning}"`)
    parts.push(`Palm Island gazetted as Aboriginal reserve: ${history.reserve_gazetted}`)
    parts.push(`Hull River Settlement: established ${history.hull_river_connection.established}, destroyed by Category 5 cyclone ${history.hull_river_connection.cyclone_date}, residents transferred to Palm Island ${history.hull_river_connection.transfer_to_palm}`)
    parts.push(`Documented removals: ${history.removals_documented.total_documented} people from ${history.removals_documented.language_groups} language groups (${history.removals_documented.period})`)

    if (achievements && achievements.length > 0) {
      parts.push('\nRecent achievements:')
      for (const a of achievements) {
        parts.push(`${a.fiscal_year || ''}: ${a.achievement_text}${a.category ? ` (${a.category})` : ''}`)
      }
      sources.push({ title: 'PICC Governance Achievements', url: '/timeline', type: 'history' })
    }

    return { text: parts.join('\n'), sources }
  } catch {
    return { text: '', sources: [] }
  }
}

async function getPartnersContext(supabase: SupabaseClient): Promise<{ text: string; sources: ExpandedSource[] }> {
  try {
    const { data: partners } = await supabase
      .from('partners')
      .select('name, partner_type, description')
      .eq('show_in_annual_report', true)
      .order('display_order')
      .limit(10)

    if (!partners || partners.length === 0) return { text: '', sources: [] }

    const text = partners.map((p: any) =>
      `${p.name} (${p.partner_type || 'partner'})${p.description ? `: ${p.description}` : ''}`
    ).join('\n')

    return {
      text,
      sources: [{ title: 'PICC Partners', url: '/about', type: 'partner' }]
    }
  } catch {
    return { text: '', sources: [] }
  }
}

// ---------------------------------------------------------------------------
// Condensed org identity (always included)
// ---------------------------------------------------------------------------

function getOrgIdentityContext(): string {
  const org = PICC_KNOWLEDGE_BASE.organization
  const stats = PICC_KNOWLEDGE_BASE.statistics
  return [
    `${org.name} (${org.short_name}) — ${org.type}`,
    `Mission: ${org.mission}`,
    `Location: ${org.location.island}, ${org.location.distance_from_townsville} of Townsville, Queensland`,
    `Tagline: "${org.tagline}"`,
    `Traditional Owners: Manbarra (Manburra) people; Bwgcolman = "Many tribes" (${PICC_KNOWLEDGE_BASE.history.removals_documented.language_groups} language groups)`,
    `Staff: ${stats.staff.total_2024} employees, ${stats.staff.palm_island_residents_percentage} Palm Islanders`,
    `Revenue: $${(stats.financial.income / 1000000).toFixed(1)}M (FY2023-24)`,
    `Services: ${stats.service_metrics.total_services} programs across health, family, justice, youth, economic development`,
    `Transition to community control: ${org.transition_to_community_control}`,
    `CEO: ${PICC_KNOWLEDGE_BASE.leadership.ceo}`,
    `Chair: ${PICC_KNOWLEDGE_BASE.leadership.board_members[0].name}`
  ].join('\n')
}

// ---------------------------------------------------------------------------
// Token budget helpers
// ---------------------------------------------------------------------------

function truncateToTokenBudget(text: string, maxTokens: number): string {
  const maxChars = maxTokens * 4 // rough estimate
  if (text.length <= maxChars) return text
  return text.substring(0, maxChars) + '...'
}

// ---------------------------------------------------------------------------
// Main export: getExpandedContext
// ---------------------------------------------------------------------------

export async function getExpandedContext(
  query: string,
  options: { maxContextTokens?: number; limit?: number } = {}
): Promise<ExpandedContextResult> {
  const { maxContextTokens = 4000, limit = 5 } = options
  const supabase = getSupabase()
  const intents = detectIntents(query)
  const allSources: ExpandedSource[] = []
  const sections: Record<string, string> = {}

  // 1. Always include org identity (condensed)
  sections['PICC Organization'] = getOrgIdentityContext()

  // 2. Call existing RAG for vector search results
  try {
    const ragResult = await getRAGContext(query, { limit, maxContextTokens: Math.floor(maxContextTokens * 0.3) })
    if (ragResult.context) {
      sections['Knowledge Base'] = ragResult.context
    }
    allSources.push(...ragResult.sources.map(s => ({ ...s, type: 'knowledge' })))
  } catch (err) {
    console.error('RAG context error (non-fatal):', err)
  }

  // 3. Intent-based table searches (parallel)
  const searches: Promise<void>[] = []

  if (intents.financial) {
    searches.push(
      getFinancialContext(supabase).then(r => { if (r.text) { sections['Financial Data'] = r.text; allSources.push(...r.sources) } })
    )
  }

  if (intents.services) {
    searches.push(
      getServicesContext(supabase, query).then(r => { if (r.text) { sections['Services'] = r.text; allSources.push(...r.sources) } })
    )
  }

  if (intents.people) {
    searches.push(
      getPeopleContext(supabase).then(r => { if (r.text) { sections['People & Leadership'] = r.text; allSources.push(...r.sources) } })
    )
  }

  if (intents.quotes) {
    searches.push(
      searchElderQuotes(supabase, query).then(r => { if (r.text) { sections['Elder Voices'] = r.text; allSources.push(...r.sources) } })
    )
    searches.push(
      searchInterviews(supabase, query).then(r => { if (r.text) { sections['Interviews'] = r.text; allSources.push(...r.sources) } })
    )
  }

  if (intents.history) {
    searches.push(
      getHistoryContext(supabase, query).then(r => { if (r.text) { sections['History & Governance'] = r.text; allSources.push(...r.sources) } })
    )
  }

  if (intents.partners) {
    searches.push(
      getPartnersContext(supabase).then(r => { if (r.text) { sections['Partners'] = r.text; allSources.push(...r.sources) } })
    )
  }

  // If no specific intents detected, do a broad search across key tables
  if (!intents.financial && !intents.services && !intents.people && !intents.quotes && !intents.history && !intents.partners) {
    searches.push(
      searchElderQuotes(supabase, query, 3).then(r => { if (r.text) { sections['Community Voices'] = r.text; allSources.push(...r.sources) } })
    )
    searches.push(
      getServicesContext(supabase, query).then(r => { if (r.text) { sections['Services'] = r.text; allSources.push(...r.sources) } })
    )
  }

  await Promise.all(searches)

  // 4. Assemble context with section headers
  const contextParts: string[] = []
  for (const [heading, content] of Object.entries(sections)) {
    if (content) {
      contextParts.push(`## ${heading}\n${content}`)
    }
  }

  const fullContext = contextParts.join('\n\n')
  const context = truncateToTokenBudget(fullContext, maxContextTokens)

  // Deduplicate sources
  const seen = new Set<string>()
  const uniqueSources = allSources.filter(s => {
    const key = `${s.type}:${s.title}`
    if (seen.has(key)) return false
    seen.add(key)
    return true
  })

  return { context, sources: uniqueSources }
}
