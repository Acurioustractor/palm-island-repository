#!/usr/bin/env node

/**
 * Export Elders’ bios + quotes into shareable JSON + Markdown.
 *
 * Defaults are “safe for production sharing”:
 * - Elders only (`profiles.is_elder = true`)
 * - Directory-visible only (`show_in_directory = true`) unless --include-hidden
 * - Excludes `profile_visibility = 'private'` unless --include-private
 * - Quotes validated only (`extracted_quotes.is_validated = true`) unless --include-unvalidated
 *
 * Requires (web-platform/.env.local):
 * - NEXT_PUBLIC_SUPABASE_URL
 * - SUPABASE_SERVICE_ROLE_KEY
 *
 * Usage:
 *   node scripts/export-elders-bios-quotes.js
 *   node scripts/export-elders-bios-quotes.js --include-unvalidated
 *   node scripts/export-elders-bios-quotes.js --include-hidden --include-private
 *   node scripts/export-elders-bios-quotes.js --include-citations
 */

const fs = require('fs')
const path = require('path')

const dotenv = require('dotenv')
dotenv.config({ path: path.join(__dirname, '..', '.env.local') })

const { createClient } = require('@supabase/supabase-js')

const SUPABASE_URL = process.env.NEXT_PUBLIC_SUPABASE_URL
const SUPABASE_SERVICE_ROLE_KEY = process.env.SUPABASE_SERVICE_ROLE_KEY

if (!SUPABASE_URL || !SUPABASE_SERVICE_ROLE_KEY) {
  console.error('Missing required env vars: NEXT_PUBLIC_SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY')
  process.exit(1)
}

const args = process.argv.slice(2)
const hasFlag = (name) => args.includes(name)
const getArgValue = (name, fallback = null) => {
  const idx = args.indexOf(name)
  if (idx === -1) return fallback
  return args[idx + 1] ?? fallback
}

const INCLUDE_UNVALIDATED = hasFlag('--include-unvalidated')
const INCLUDE_HIDDEN = hasFlag('--include-hidden')
const INCLUDE_PRIVATE = hasFlag('--include-private')
const INCLUDE_CITATIONS = hasFlag('--include-citations')
const MAX_QUOTES_PER_ELDER = Math.max(0, Number(getArgValue('--max-quotes-per-elder', '0')) || 0) // 0 = no limit

const supabase = createClient(SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY, {
  auth: { autoRefreshToken: false, persistSession: false },
})

function displayName(p) {
  return String(p?.preferred_name || p?.full_name || '').trim() || 'Elder'
}

function mdEscape(s) {
  return String(s || '')
    .replace(/\\/g, '\\\\')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
}

function safeString(v) {
  const s = String(v ?? '').trim()
  return s || null
}

async function fetchAll(queryFactory, pageSize = 1000) {
  const out = []
  let from = 0
  let guard = 0
  while (guard < 500) {
    guard++
    const to = from + pageSize - 1
    const res = await queryFactory().range(from, to)
    if (res?.error) throw res.error
    const rows = Array.isArray(res?.data) ? res.data : []
    out.push(...rows)
    if (rows.length < pageSize) break
    from += pageSize
  }
  return out
}

function groupBy(arr, keyFn) {
  const m = new Map()
  for (const item of Array.isArray(arr) ? arr : []) {
    const k = keyFn(item)
    if (!m.has(k)) m.set(k, [])
    m.get(k).push(item)
  }
  return m
}

async function main() {
  const generatedAt = new Date().toISOString()

  const eldersBase = supabase
    .from('profiles')
    .select(
      'id, full_name, preferred_name, profile_image_url, bio, storyteller_type, location, community_role, traditional_country, language_group, show_in_directory, profile_visibility, is_elder, updated_at, created_at'
    )
    .eq('is_elder', true)
    .order('full_name', { ascending: true })
    .limit(500)

  const eldersRes = await eldersBase
  if (eldersRes?.error) throw eldersRes.error
  let elders = Array.isArray(eldersRes?.data) ? eldersRes.data : []

  if (!INCLUDE_HIDDEN) {
    elders = elders.filter((e) => e?.show_in_directory === true || e?.show_in_directory === null)
  }
  if (!INCLUDE_PRIVATE) {
    elders = elders.filter((e) => String(e?.profile_visibility || '').toLowerCase() !== 'private')
  }

  const elderIds = elders.map((e) => e.id).filter(Boolean)

  let quotes = []
  if (elderIds.length > 0) {
    quotes = await fetchAll(
      () => {
        let q = supabase
          .from('extracted_quotes')
          .select(
            'id, quote_text, attribution, context, theme, sentiment, impact_area, is_validated, suggested_for_report, photo_url, profile_id, interview_id, created_at, validated_at'
          )
          .in('profile_id', elderIds)
          .order('suggested_for_report', { ascending: false })
          .order('created_at', { ascending: false })

        if (!INCLUDE_UNVALIDATED) q = q.eq('is_validated', true)
        return q
      },
      1000
    )
  }

  if (MAX_QUOTES_PER_ELDER > 0) {
    const byProfile = groupBy(quotes, (q) => String(q?.profile_id || ''))
    const limited = []
    for (const id of elderIds) {
      const list = byProfile.get(String(id)) || []
      limited.push(...list.slice(0, MAX_QUOTES_PER_ELDER))
    }
    quotes = limited
  }

  let citationsByQuoteId = new Map()
  if (INCLUDE_CITATIONS && quotes.length > 0) {
    const quoteIds = Array.from(new Set(quotes.map((q) => String(q?.id || '')).filter(Boolean)))
    const citations = await fetchAll(
      () =>
        supabase
          .from('extracted_quote_citations')
          .select('quote_id, interview_id, segment_index, excerpt, segment_id, created_at, metadata')
          .in('quote_id', quoteIds)
          .order('created_at', { ascending: true }),
      1000
    ).catch(() => [])
    citationsByQuoteId = groupBy(citations, (c) => String(c?.quote_id || ''))
  }

  const quotesByProfileId = groupBy(quotes, (q) => String(q?.profile_id || ''))

  const payload = {
    generatedAt,
    filters: {
      includeUnvalidated: INCLUDE_UNVALIDATED,
      includeHidden: INCLUDE_HIDDEN,
      includePrivate: INCLUDE_PRIVATE,
      includeCitations: INCLUDE_CITATIONS,
      maxQuotesPerElder: MAX_QUOTES_PER_ELDER || null,
    },
    totals: {
      elders: elders.length,
      quotes: quotes.length,
    },
    elders: elders.map((e) => {
      const id = String(e.id)
      const elderQuotes = quotesByProfileId.get(id) || []
      const mappedQuotes = elderQuotes.map((q) => ({
        id: q.id,
        quote_text: q.quote_text,
        attribution: q.attribution ?? null,
        context: q.context ?? null,
        theme: q.theme ?? null,
        sentiment: q.sentiment ?? null,
        impact_area: q.impact_area ?? null,
        is_validated: Boolean(q.is_validated),
        suggested_for_report: Boolean(q.suggested_for_report),
        photo_url: q.photo_url ?? null,
        interview_id: q.interview_id ?? null,
        created_at: q.created_at ?? null,
        validated_at: q.validated_at ?? null,
        citations: INCLUDE_CITATIONS ? (citationsByQuoteId.get(String(q.id)) || []) : undefined,
      }))

      return {
        id,
        name: displayName(e),
        full_name: safeString(e.full_name),
        preferred_name: safeString(e.preferred_name),
        bio: safeString(e.bio),
        profile_image_url: safeString(e.profile_image_url),
        storyteller_type: safeString(e.storyteller_type),
        location: safeString(e.location),
        community_role: safeString(e.community_role),
        traditional_country: safeString(e.traditional_country),
        language_group: safeString(e.language_group),
        show_in_directory: e.show_in_directory ?? null,
        profile_visibility: safeString(e.profile_visibility),
        created_at: e.created_at ?? null,
        updated_at: e.updated_at ?? null,
        quotes: mappedQuotes,
      }
    }),
  }

  // Markdown “production” doc
  const lines = []
  lines.push(`# Elders — Bios & Quotes`)
  lines.push(``)
  lines.push(`Generated: ${generatedAt}`)
  lines.push(`Elders: ${payload.totals.elders} • Quotes: ${payload.totals.quotes}`)
  lines.push(`Filters: validatedOnly=${!INCLUDE_UNVALIDATED} • includeHidden=${INCLUDE_HIDDEN} • includePrivate=${INCLUDE_PRIVATE} • citations=${INCLUDE_CITATIONS}`)
  lines.push(``)

  for (const elder of payload.elders) {
    lines.push(`---`)
    lines.push(``)
    lines.push(`## ${mdEscape(elder.name)}`)
    const identityBits = [
      safeString(elder.community_role),
      safeString(elder.language_group),
      safeString(elder.traditional_country),
      safeString(elder.location),
    ].filter(Boolean)
    if (identityBits.length) lines.push(`_${mdEscape(identityBits.join(' • '))}_`)
    lines.push(``)
    if (elder.bio) {
      lines.push(mdEscape(elder.bio))
      lines.push(``)
    } else {
      lines.push(`Bio: (missing)`)
      lines.push(``)
    }

    lines.push(`**Quotes (${elder.quotes.length})**`)
    if (elder.quotes.length === 0) {
      lines.push(`- (none)`)
      lines.push(``)
      continue
    }
    for (const q of elder.quotes) {
      const metaBits = []
      if (q.theme) metaBits.push(`theme=${q.theme}`)
      if (q.impact_area) metaBits.push(`impact=${q.impact_area}`)
      if (q.sentiment) metaBits.push(`sentiment=${q.sentiment}`)
      if (q.suggested_for_report) metaBits.push(`suggested_for_report`)
      if (!q.is_validated) metaBits.push(`UNVALIDATED`)
      const meta = metaBits.length ? ` (${metaBits.join(', ')})` : ''
      lines.push(`- “${mdEscape(q.quote_text)}”${meta}`)
      if (q.context) lines.push(`  - Context: ${mdEscape(q.context)}`)
      if (INCLUDE_CITATIONS) {
        const citations = Array.isArray(q.citations) ? q.citations : []
        if (citations.length) {
          for (const c of citations.slice(0, 6)) {
            const seg = Number.isInteger(Number(c.segment_index)) ? `seg ${c.segment_index}` : `seg ?`
            const excerpt = safeString(c.excerpt) ? ` — ${mdEscape(String(c.excerpt))}` : ''
            lines.push(`  - Citation: interview ${c.interview_id || '?'} ${seg}${excerpt}`)
          }
        }
      }
    }
    lines.push(``)
  }

  const outDir = path.join(__dirname, 'reports')
  fs.mkdirSync(outDir, { recursive: true })
  const stamp = generatedAt.replace(/[:.]/g, '-')
  const base = path.join(outDir, `elders-bios-quotes-${stamp}`)
  const jsonPath = `${base}.json`
  const mdPath = `${base}.md`

  fs.writeFileSync(jsonPath, JSON.stringify(payload, null, 2), 'utf8')
  fs.writeFileSync(mdPath, lines.join('\n'), 'utf8')

  console.log(`Done.`)
  console.log(`JSON: ${jsonPath}`)
  console.log(`MD:   ${mdPath}`)
  console.log(`Elders: ${payload.totals.elders} • Quotes: ${payload.totals.quotes}`)
}

main().catch((err) => {
  console.error(String(err?.message || err))
  process.exit(1)
})

