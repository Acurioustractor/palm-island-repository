/**
 * Empathy Ledger — server-side data fetching
 *
 * Reads sovereign content (quotes, transcripts, stories) from the EL Supabase
 * which is the source of truth for all narrative content. The PICC platform
 * uses these helpers to render community voices on public pages.
 */

import { createClient, type SupabaseClient } from '@supabase/supabase-js'

const EL_URL = 'https://yvnuayzslukamizrlhwb.supabase.co'
export const PICC_ORG_ID = '084f851c-72e0-41fb-b5ba-f3088f44862d'

let cached: SupabaseClient | null = null

function getELClient(): SupabaseClient | null {
  if (cached) return cached
  const key = process.env.EMPATHY_LEDGER_SERVICE_KEY || process.env.SUPABASE_SERVICE_ROLE_KEY
  if (!key) return null
  cached = createClient(EL_URL, key, {
    auth: { autoRefreshToken: false, persistSession: false },
  })
  return cached
}

// ---------------------------------------------------------------------------
// Quotes
// ---------------------------------------------------------------------------

export interface ELQuote {
  id: string
  quote_text: string
  author_name: string
  themes: string[] | null
  sentiment: string | null
  impact_score: number | null
  category: string | null
  source_type: string | null
  source_id: string | null
  approval_status: string | null
  project_id: string | null
}

/**
 * Fetch all PICC quotes from EL, ordered by impact score.
 */
export async function getELQuotes(opts?: { limit?: number; minImpact?: number }): Promise<ELQuote[]> {
  const supabase = getELClient()
  if (!supabase) return []

  const { data } = await supabase
    .from('extracted_quotes')
    .select('id, quote_text, author_name, themes, sentiment, impact_score, category, source_type, source_id, approval_status, project_id')
    .eq('organization_id', PICC_ORG_ID)
    .order('impact_score', { ascending: false })
    .limit(opts?.limit ?? 1000)

  const all = (data || []) as ELQuote[]
  if (opts?.minImpact != null) {
    return all.filter(q => (q.impact_score || 0) >= opts.minImpact!)
  }
  return all
}

/**
 * Group quotes by normalized author name. Anonymous voices become "Community Member".
 */
export function groupQuotesByAuthor(quotes: ELQuote[]): Map<string, ELQuote[]> {
  const map = new Map<string, ELQuote[]>()
  for (const q of quotes) {
    const raw = (q.author_name || '').trim()
    const name = !raw || raw.toLowerCase() === 'unknown' ? 'Community Member' : raw
    if (!map.has(name)) map.set(name, [])
    map.get(name)!.push(q)
  }
  return map
}

/**
 * Find quotes attributed to a specific person (fuzzy match on first name / parts).
 */
export function findQuotesForPerson(allQuotes: ELQuote[], personName: string): ELQuote[] {
  const target = personName.toLowerCase().trim()
  const targetParts = target.split(/\s+/).filter(p => p.length > 2)
  if (targetParts.length === 0) return []

  return allQuotes.filter(q => {
    const author = (q.author_name || '').toLowerCase()
    if (!author) return false
    if (author === target) return true
    // Match if any meaningful part of the target name appears in the author
    return targetParts.some(part => author.includes(part))
  })
}

// ---------------------------------------------------------------------------
// Transcripts
// ---------------------------------------------------------------------------

export interface ELTranscript {
  id: string
  title: string | null
  ai_summary: string | null
  ai_processing_status: string | null
  themes: string[] | null
  word_count: number | null
  storyteller_id: string | null
  project_id: string | null
  key_quotes: string[] | null
  ai_model_version: string | null
}

export async function getELTranscripts(opts?: { limit?: number; analyzedOnly?: boolean }): Promise<ELTranscript[]> {
  const supabase = getELClient()
  if (!supabase) return []

  let query = supabase
    .from('transcripts')
    .select('id, title, ai_summary, ai_processing_status, themes, word_count, storyteller_id, project_id, key_quotes, ai_model_version')
    .eq('organization_id', PICC_ORG_ID)
    .order('word_count', { ascending: false })
    .limit(opts?.limit ?? 200)

  if (opts?.analyzedOnly) {
    query = query.eq('ai_processing_status', 'analyzed')
  }

  const { data } = await query
  return (data || []) as ELTranscript[]
}

// ---------------------------------------------------------------------------
// Stories
// ---------------------------------------------------------------------------

export interface ELStory {
  id: string
  title: string | null
  story_image_url: string | null
  excerpt: string | null
  summary: string | null
  status: string | null
  story_type: string | null
  cultural_sensitivity_level: string | null
  created_at: string
}

export async function getELStories(opts?: { limit?: number; publishedOnly?: boolean }): Promise<ELStory[]> {
  const supabase = getELClient()
  if (!supabase) return []

  let query = supabase
    .from('stories')
    .select('id, title, story_image_url, excerpt, summary, status, story_type, cultural_sensitivity_level, created_at')
    .eq('organization_id', PICC_ORG_ID)
    .order('created_at', { ascending: false })
    .limit(opts?.limit ?? 50)

  if (opts?.publishedOnly) {
    query = query.eq('status', 'published')
  }

  const { data } = await query
  return (data || []) as ELStory[]
}

// ---------------------------------------------------------------------------
// Storytellers
// ---------------------------------------------------------------------------

export interface ELStoryteller {
  id: string
  display_name: string
  location: string | null
  profile_id: string | null
  cultural_background: string[] | null
}

export async function getPalmStorytellers(): Promise<ELStoryteller[]> {
  const supabase = getELClient()
  if (!supabase) return []

  const { data } = await supabase
    .from('storytellers')
    .select('id, display_name, location, profile_id, cultural_background')
    .ilike('location', '%palm%')
    .limit(200)

  return (data || []) as ELStoryteller[]
}

// ---------------------------------------------------------------------------
// Stats (for dashboards)
// ---------------------------------------------------------------------------

export async function getELStats() {
  const supabase = getELClient()
  if (!supabase) return { quotes: 0, transcripts: 0, stories: 0, media: 0 }

  const [q, t, s, m] = await Promise.all([
    supabase.from('extracted_quotes').select('id', { count: 'exact', head: true }).eq('organization_id', PICC_ORG_ID),
    supabase.from('transcripts').select('id', { count: 'exact', head: true }).eq('organization_id', PICC_ORG_ID),
    supabase.from('stories').select('id', { count: 'exact', head: true }).eq('organization_id', PICC_ORG_ID),
    supabase.from('media_assets').select('id', { count: 'exact', head: true }).eq('organization_id', PICC_ORG_ID),
  ])

  return {
    quotes: q.count || 0,
    transcripts: t.count || 0,
    stories: s.count || 0,
    media: m.count || 0,
  }
}
