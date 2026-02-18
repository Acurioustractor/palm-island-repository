/**
 * Server-side curated quotes function.
 *
 * Queries extracted_quotes, elder_quotes, and community_visions directly
 * from Supabase — no HTTP round-trip. Reuses the logic from
 * /api/public/curated-quotes but callable from any server component.
 */

import { createClient } from '@supabase/supabase-js'

export interface CuratedQuote {
  id: string
  quote: string
  speaker_name: string | null
  speaker_role: string | null
  source_type: 'extracted' | 'elder' | 'vision'
  photo_url: string | null
  theme: string | null
  is_elder: boolean
}

interface GetCuratedQuotesOptions {
  limit?: number
  source_type?: 'extracted' | 'elder' | 'vision'
  theme?: string
}

function createServiceClient() {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL
  const key = process.env.SUPABASE_SERVICE_ROLE_KEY
  if (!url || !key) return null
  return createClient(url, key, {
    auth: { autoRefreshToken: false, persistSession: false },
  })
}

export async function getCuratedQuotes(
  options: GetCuratedQuotesOptions = {}
): Promise<CuratedQuote[]> {
  const { limit = 6, source_type, theme } = options
  const supabase = createServiceClient()
  if (!supabase) return []

  const quotes: CuratedQuote[] = []

  // ── Extracted Quotes ──
  if (!source_type || source_type === 'extracted') {
    const q = supabase
      .from('extracted_quotes')
      .select(`
        id, quote_text, attribution, theme, photo_url,
        profiles:profile_id (full_name, preferred_name, profile_image_url, is_elder, community_role)
      `)
      .eq('is_validated', true)

    if (theme) q.eq('theme', theme)
    q.limit(limit * 2)

    const { data } = await q
    for (const row of data || []) {
      const text = String(row.quote_text || '').trim()
      if (!text || text.length < 30) continue

      const profile = row.profiles as any
      quotes.push({
        id: row.id,
        quote: text,
        speaker_name: profile?.preferred_name || profile?.full_name || row.attribution || null,
        speaker_role: profile?.community_role || (profile?.is_elder ? 'Elder' : null),
        source_type: 'extracted',
        photo_url: profile?.profile_image_url || row.photo_url || null,
        theme: row.theme || null,
        is_elder: Boolean(profile?.is_elder),
      })
    }
  }

  // ── Elder Quotes ──
  if (!source_type || source_type === 'elder') {
    const q = supabase
      .from('elder_quotes')
      .select('id, text, speaker_name, speaker_role, theme, category')
      .eq('is_validated', true)
      .eq('permission_level', 'public')

    if (theme) q.eq('theme', theme)
    q.limit(limit * 2)

    const { data } = await q
    for (const row of data || []) {
      const text = String(row.text || '').trim()
      if (!text || text.length < 30) continue

      quotes.push({
        id: row.id,
        quote: text,
        speaker_name: row.speaker_name || null,
        speaker_role: row.speaker_role || 'Elder',
        source_type: 'elder',
        photo_url: null,
        theme: row.theme || row.category || null,
        is_elder: true,
      })
    }
  }

  // ── Community Visions ──
  if (!source_type || source_type === 'vision') {
    const q = supabase
      .from('community_visions')
      .select('id, vision_text, author_name, author_role, theme')
      .eq('is_approved', true)
      .limit(limit * 2)

    const { data } = await q
    for (const row of data || []) {
      const text = String(row.vision_text || '').trim()
      if (!text || text.length < 20) continue

      quotes.push({
        id: row.id,
        quote: text,
        speaker_name: row.author_name || null,
        speaker_role: row.author_role || 'Community Member',
        source_type: 'vision',
        photo_url: null,
        theme: row.theme || null,
        is_elder: false,
      })
    }
  }

  // ── Deduplicate by first 60 chars ──
  const seen = new Set<string>()
  const deduped = quotes.filter((q) => {
    const key = q.quote.slice(0, 60).toLowerCase().replace(/\s+/g, ' ')
    if (seen.has(key)) return false
    seen.add(key)
    return true
  })

  // ── Sort: elders first, then by medium-length preference ──
  deduped.sort((a, b) => {
    if (a.is_elder !== b.is_elder) return a.is_elder ? -1 : 1
    if (a.photo_url && !b.photo_url) return -1
    if (!a.photo_url && b.photo_url) return 1
    const aScore = Math.abs(a.quote.length - 140)
    const bScore = Math.abs(b.quote.length - 140)
    return aScore - bScore
  })

  return deduped.slice(0, limit)
}
