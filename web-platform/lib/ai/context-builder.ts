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
    // Search segments FIRST (content-level), then get parent interviews
    const { data: segments } = await supabase
      .from('interview_segments')
      .select('interview_id, segment_text')
      .ilike('segment_text', `%${query}%`)
      .limit(limit * 2)

    // Also search by interview title
    const { data: titleMatches } = await supabase
      .from('interviews')
      .select('id, interview_title, storyteller_id, profiles:storyteller_id(full_name)')
      .ilike('interview_title', `%${query}%`)
      .limit(limit)

    // Combine unique interview IDs
    const interviewIds = new Set<string>()
    segments?.forEach((s: any) => interviewIds.add(s.interview_id))
    titleMatches?.forEach((i: any) => interviewIds.add(i.id))

    if (interviewIds.size === 0) return { text: '', sources: [] }

    // Fetch interview details for all matched IDs
    const { data: interviews } = await supabase
      .from('interviews')
      .select('id, interview_title, storyteller_id, profiles:storyteller_id(full_name)')
      .in('id', Array.from(interviewIds))
      .limit(limit)

    if (!interviews || interviews.length === 0) return { text: '', sources: [] }

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

// ─── Stories search ─────────────────────────────────────────────────────────

async function searchStories(supabase: SupabaseClient, query: string, limit = 5): Promise<{ text: string; sources: ExpandedSource[] }> {
  try {
    // Split query into keywords for broader matching
    const keywords = query.toLowerCase().split(/\s+/).filter(w => w.length >= 4)

    let stories: any[] = []

    // Try exact phrase first
    const { data: exactMatches } = await supabase
      .from('stories')
      .select('id, title, excerpt, category, slug')
      .or(`title.ilike.%${query}%,excerpt.ilike.%${query}%`)
      .eq('status', 'published')
      .limit(limit)

    stories = exactMatches || []

    // If not enough, try keyword matching
    if (stories.length < limit && keywords.length > 0) {
      const keywordFilters = keywords.map(kw => `title.ilike.%${kw}%`).join(',')
      const { data: kwMatches } = await supabase
        .from('stories')
        .select('id, title, excerpt, category, slug')
        .or(keywordFilters)
        .eq('status', 'published')
        .limit(limit)

      const existingIds = new Set(stories.map(s => s.id))
      for (const s of (kwMatches || [])) {
        if (!existingIds.has(s.id) && stories.length < limit) {
          stories.push(s)
        }
      }
    }

    if (stories.length === 0) return { text: '', sources: [] }

    const parts = stories.map((s: any) =>
      `"${s.title}" (${s.category || 'story'}): ${s.excerpt?.substring(0, 200) || 'No excerpt'}`
    )
    const sources = stories.map((s: any) => ({
      title: s.title,
      url: `/stories/${s.id}`,
      type: 'story'
    }))

    return { text: parts.join('\n'), sources }
  } catch {
    return { text: '', sources: [] }
  }
}

// ─── Projects search ────────────────────────────────────────────────────────

async function getProjectsContext(supabase: SupabaseClient, query: string): Promise<{ text: string; sources: ExpandedSource[] }> {
  try {
    const { data: projects } = await supabase
      .from('projects')
      .select('id, name, slug, description, tagline, status')
      .order('name')

    if (!projects || projects.length === 0) return { text: '', sources: [] }

    const parts = [`PICC runs ${projects.length} innovation projects:\n`]
    for (const p of projects) {
      parts.push(`- **${p.name}** (${p.status}): ${p.tagline || p.description?.substring(0, 120) || ''}`)
    }

    // Source cards for keyword-matched projects
    const lower = query.toLowerCase()
    const matched = projects.filter((p: any) =>
      p.name?.toLowerCase().includes(lower) ||
      p.slug?.toLowerCase().includes(lower) ||
      p.description?.toLowerCase().includes(lower)
    )

    const sources: ExpandedSource[] = matched.length >= 1 && matched.length <= 3
      ? matched.map((p: any) => ({ title: p.name, url: `/wiki/innovation/${p.slug}`, type: 'project' }))
      : [{ title: 'PICC Innovation Projects', url: '/wiki/innovation', type: 'project' }]

    return { text: parts.join('\n'), sources }
  } catch {
    return { text: '', sources: [] }
  }
}

// ─── Extracted quotes search ────────────────────────────────────────────────

async function searchExtractedQuotes(supabase: SupabaseClient, query: string, limit = 5): Promise<{ text: string; sources: ExpandedSource[] }> {
  try {
    const { data: quotes } = await supabase
      .from('extracted_quotes')
      .select('id, quote_text, speaker_name, themes, story_id')
      .or(`quote_text.ilike.%${query}%,speaker_name.ilike.%${query}%`)
      .limit(limit)

    if (!quotes || quotes.length === 0) return { text: '', sources: [] }

    const parts = quotes.map((q: any) =>
      `"${q.quote_text}" — ${q.speaker_name || 'Community member'}${q.themes ? ` [${q.themes.join(', ')}]` : ''}`
    )

    return {
      text: parts.join('\n'),
      sources: [{ title: 'Community Voices', url: '/voices', type: 'quote' }]
    }
  } catch {
    return { text: '', sources: [] }
  }
}

// ─── Knowledge entries search ───────────────────────────────────────────────

async function searchKnowledgeEntries(supabase: SupabaseClient, query: string, limit = 3): Promise<{ text: string; sources: ExpandedSource[] }> {
  try {
    const { data: entries } = await supabase
      .from('knowledge_entries')
      .select('id, slug, title, summary, content, entry_type, category')
      .or(`title.ilike.%${query}%,content.ilike.%${query}%,summary.ilike.%${query}%`)
      .limit(limit)

    if (!entries || entries.length === 0) return { text: '', sources: [] }

    const parts = entries.map((e: any) =>
      `[${e.title}]: ${e.summary || e.content?.substring(0, 300) || ''}`
    )
    const sources = entries.map((e: any) => ({
      title: e.title,
      url: `/wiki/${e.slug}`,
      type: 'knowledge'
    }))

    return { text: parts.join('\n'), sources }
  } catch {
    return { text: '', sources: [] }
  }
}

async function searchElderQuotes(supabase: SupabaseClient, query: string, limit = 5): Promise<{ text: string; sources: ExpandedSource[] }> {
  try {
    const { data: quotes } = await supabase
      .from('elder_quotes')
      .select('id, text, speaker_name, speaker_role, theme, category')
      .or(`text.ilike.%${query}%,theme.ilike.%${query}%,category.ilike.%${query}%,speaker_name.ilike.%${query}%`)
      .limit(limit)

    if (!quotes || quotes.length === 0) return { text: '', sources: [] }

    const parts = quotes.map((q: any) =>
      `"${q.text}" — ${q.speaker_name || 'Elder'}${q.speaker_role ? ` (${q.speaker_role})` : ''}`
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
    // Always fetch ALL active services for comprehensive answers
    const { data: all } = await supabase
      .from('organization_services')
      .select('id, name, slug, description, service_category, is_active, staff_count, clients_served_annual')
      .eq('is_active', true)
      .order('service_category')

    if (!all || all.length === 0) return { text: '', sources: [] }

    // Group by category with full details
    const byCategory = all.reduce((acc: Record<string, any[]>, s: any) => {
      const cat = s.service_category || 'Other'
      if (!acc[cat]) acc[cat] = []
      acc[cat].push(s)
      return acc
    }, {})

    const parts: string[] = [`PICC operates ${all.length} services across ${Object.keys(byCategory).length} categories:\n`]

    for (const [cat, services] of Object.entries(byCategory)) {
      parts.push(`### ${cat}`)
      for (const s of services as any[]) {
        let line = `- **${s.name}**: ${s.description || 'No description'}`
        if (s.staff_count) line += ` (${s.staff_count} staff`
        if (s.clients_served_annual) line += s.staff_count ? `, ${s.clients_served_annual} clients/year)` : ` (${s.clients_served_annual} clients/year)`
        else if (s.staff_count) line += ')'
        parts.push(line)
      }
    }

    // When 1-3 services match the query, return individual source cards;
    // otherwise return one aggregated source
    const lower = query.toLowerCase()
    const matched = all.filter((s: any) =>
      s.name?.toLowerCase().includes(lower) ||
      s.slug?.toLowerCase().includes(lower) ||
      s.description?.toLowerCase().includes(lower) ||
      s.service_category?.toLowerCase().includes(lower)
    )

    const sources: ExpandedSource[] = matched.length >= 1 && matched.length <= 3
      ? matched.map((s: any) => ({
          title: s.name,
          url: `/services/${s.slug}`,
          type: 'service' as const,
        }))
      : [{ title: 'PICC Services', url: '/services', type: 'service' }]

    return { text: parts.join('\n'), sources }
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

async function getCommunityVisionsContext(supabase: SupabaseClient): Promise<{ text: string; sources: ExpandedSource[] }> {
  try {
    const { data: visions } = await supabase
      .from('community_visions')
      .select('vision_text, category, author_name, is_anonymous')
      .order('created_at', { ascending: false })
      .limit(10)

    if (!visions || visions.length === 0) return { text: '', sources: [] }

    const parts = visions.map((v: any) => {
      const author = v.is_anonymous ? 'Community member' : (v.author_name || 'Community member')
      return `"${v.vision_text}" — ${author} (${v.category || 'general'})`
    })

    return {
      text: `Community visions for PICC's next 20 years (${visions.length} recorded):\n${parts.join('\n')}`,
      sources: [{ title: 'Community Visions for the Future', url: '/voices', type: 'vision' }]
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
  const maxChars = maxTokens * 4 // rough estimate (4 chars/token)
  if (text.length <= maxChars) return text
  // Find the last sentence boundary before the limit
  const truncated = text.substring(0, maxChars)
  const lastSentence = truncated.search(/[.!?\n][^.!?\n]*$/)
  if (lastSentence > maxChars * 0.8) {
    return truncated.substring(0, lastSentence + 1)
  }
  // Fallback: break at last whitespace
  const lastSpace = truncated.lastIndexOf(' ')
  if (lastSpace > maxChars * 0.8) {
    return truncated.substring(0, lastSpace) + '...'
  }
  return truncated + '...'
}

// ---------------------------------------------------------------------------
// Main export: getExpandedContext
// ---------------------------------------------------------------------------

export async function getExpandedContext(
  query: string,
  options: { maxContextTokens?: number; limit?: number } = {}
): Promise<ExpandedContextResult> {
  const { maxContextTokens = 25000, limit = 10 } = options
  const supabase = getSupabase()
  const intents = detectIntents(query)
  const allSources: ExpandedSource[] = []
  const sections: Record<string, string> = {}

  // 1. Always include org identity (condensed)
  sections['PICC Organization'] = getOrgIdentityContext()

  // 2. Search ALL key tables in parallel for maximum recall
  const searches: Promise<void>[] = []

  // Stories — richest content source
  searches.push(
    searchStories(supabase, query, 5).then(r => { if (r.text) { sections['Stories'] = r.text; allSources.push(...r.sources) } })
  )

  // Services
  searches.push(
    getServicesContext(supabase, query).then(r => { if (r.text) { sections['Services'] = r.text; allSources.push(...r.sources) } })
  )

  // Innovation projects
  searches.push(
    getProjectsContext(supabase, query).then(r => { if (r.text) { sections['Innovation Projects'] = r.text; allSources.push(...r.sources) } })
  )

  // People/leadership
  searches.push(
    getPeopleContext(supabase).then(r => { if (r.text) { sections['People & Leadership'] = r.text; allSources.push(...r.sources) } })
  )

  // Elder quotes
  searches.push(
    searchElderQuotes(supabase, query, intents.quotes ? 8 : 3).then(r => { if (r.text) { sections['Elder Voices'] = r.text; allSources.push(...r.sources) } })
  )

  // Extracted quotes from stories
  searches.push(
    searchExtractedQuotes(supabase, query, 5).then(r => { if (r.text) { sections['Community Quotes'] = r.text; allSources.push(...r.sources) } })
  )

  // Interviews — search segments, not just titles
  searches.push(
    searchInterviews(supabase, query, intents.quotes ? 5 : 2).then(r => { if (r.text) { sections['Interviews'] = r.text; allSources.push(...r.sources) } })
  )

  // History
  searches.push(
    getHistoryContext(supabase, query).then(r => { if (r.text) { sections['History & Governance'] = r.text; allSources.push(...r.sources) } })
  )

  // Financials
  searches.push(
    getFinancialContext(supabase).then(r => { if (r.text) { sections['Financial Data'] = r.text; allSources.push(...r.sources) } })
  )

  // Partners
  searches.push(
    getPartnersContext(supabase).then(r => { if (r.text) { sections['Partners'] = r.text; allSources.push(...r.sources) } })
  )

  // Community visions
  searches.push(
    getCommunityVisionsContext(supabase).then(r => { if (r.text) { sections['Community Visions & Future'] = r.text; allSources.push(...r.sources) } })
  )

  // Knowledge entries (wiki)
  searches.push(
    searchKnowledgeEntries(supabase, query, 3).then(r => { if (r.text) { sections['Knowledge Base'] = r.text; allSources.push(...r.sources) } })
  )

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
