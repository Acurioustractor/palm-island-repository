#!/usr/bin/env node

/**
 * Draft a full Elders Trip story from trip-related interview transcripts + extracted quotes.
 *
 * Safe defaults:
 * - Uses only quotable / approved / non-restricted interviews
 * - Prefers suggested/validated extracted quotes as grounded anchors
 * - Dry-run by default (use --apply to write into the story)
 *
 * Requires (web-platform/.env.local):
 * - NEXT_PUBLIC_SUPABASE_URL
 * - SUPABASE_SERVICE_ROLE_KEY
 * - ANTHROPIC_API_KEY
 *
 * Usage:
 *   node scripts/draft-elders-trip-story.js
 *   node scripts/draft-elders-trip-story.js --apply
 *   node scripts/draft-elders-trip-story.js --story-id <uuid> --apply
 */

const fs = require('fs')
const path = require('path')
const dotenv = require('dotenv')
dotenv.config({ path: path.join(__dirname, '..', '.env.local') })

const { createClient } = require('@supabase/supabase-js')
const Anthropic = require('@anthropic-ai/sdk').default

const SUPABASE_URL = process.env.NEXT_PUBLIC_SUPABASE_URL
const SUPABASE_SERVICE_ROLE_KEY = process.env.SUPABASE_SERVICE_ROLE_KEY
const ANTHROPIC_API_KEY = process.env.ANTHROPIC_API_KEY

if (!SUPABASE_URL || !SUPABASE_SERVICE_ROLE_KEY || !ANTHROPIC_API_KEY) {
  console.error('Missing required env vars: NEXT_PUBLIC_SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY, ANTHROPIC_API_KEY')
  process.exit(1)
}

const args = process.argv.slice(2)
const hasFlag = (name) => args.includes(name)
const getArgValue = (name, fallback = null) => {
  const idx = args.indexOf(name)
  if (idx === -1) return fallback
  return args[idx + 1] ?? fallback
}

const APPLY = hasFlag('--apply')
const DRY_RUN = hasFlag('--dry-run') || !APPLY
const STORY_ID = String(getArgValue('--story-id', '6cb23cd9-c060-452a-be40-910dea4333aa') || '').trim()
const MAX_QUOTES = Math.max(6, Number(getArgValue('--max-quotes', '14')) || 14)
const MAX_TRANSCRIPTS = Math.max(6, Number(getArgValue('--max-transcripts', '12')) || 12)
const MAX_TRANSCRIPT_CHARS = Math.max(6000, Number(getArgValue('--max-transcript-chars', '22000')) || 22000)

const supabase = createClient(SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY, {
  auth: { autoRefreshToken: false, persistSession: false },
})

const anthropic = new Anthropic({ apiKey: ANTHROPIC_API_KEY })

const TIME_RANGE_REGEX = /^\s*\d{1,2}:\d{2}:\d{2}(?:[.,]\d{1,3})?\s*-->\s*\d{1,2}:\d{2}:\d{2}(?:[.,]\d{1,3})?\s*$/
const LEADING_TIME_REGEX = /^\s*(?:\[\s*)?(?:\d{1,2}:)?\d{1,2}:\d{2}(?::\d{2})?(?:[.,]\d{1,3})?(?:\s*\])?\s*[-–—]?\s*/i
const SPEAKER_LABEL_REGEX =
  /^\s*(?:(?:speaker\s*\d+)|(?:interviewer)|(?:interviewee)|(?:facilitator)|(?:host)|(?:narrator)|(?:participant))\s*[:\-–—]\s*/i
const ALL_CAPS_LABEL_REGEX = /^\s*[A-Z][A-Z\s]{1,25}\s*[:\-–—]\s*/

function safeString(v) {
  const s = String(v ?? '').trim()
  return s || null
}

function cleanupQuoteText(input) {
  let s = String(input || '').replace(/\s+/g, ' ').trim()
  s = s.replace(/^["'“”]+/, '').replace(/["'“”]+$/, '').trim()
  s = s.replace(/^\s*[-–—•]+\s*/g, '')
  s = s.replace(/\s*\[(?:music|laughter|applause|inaudible|crosstalk)\]\s*/gi, ' ')
  s = s.replace(/\s+/g, ' ').trim()
  return s
}

function cleanTranscript(input) {
  const raw = String(input || '')
  if (!raw) return ''
  const lines = raw.replace(/\r\n/g, '\n').replace(/\r/g, '\n').split('\n')
  const cleaned = []
  for (let line of lines) {
    line = String(line || '').trim()
    if (!line) continue
    if (line === 'WEBVTT') continue
    if (/^\d+$/.test(line)) continue
    if (TIME_RANGE_REGEX.test(line)) continue
    line = line.replace(LEADING_TIME_REGEX, '')
    line = line.replace(SPEAKER_LABEL_REGEX, '')
    if (ALL_CAPS_LABEL_REGEX.test(line)) line = line.replace(ALL_CAPS_LABEL_REGEX, '')
    line = line.replace(/\s+/g, ' ').trim()
    if (!line) continue
    cleaned.push(line)
  }
  return cleaned.join('\n').trim()
}

function wordCount(s) {
  return String(s || '').trim().split(/\s+/).filter(Boolean).length
}

function scoreQuoteText(input) {
  const s = cleanupQuoteText(input)
  if (!s) return -100
  const wc = wordCount(s)
  let score = 0
  if (/[.!?]"?$/.test(s)) score += 3
  if (wc >= 12 && wc <= 42) score += 4
  if (wc < 10) score -= 2
  if (wc > 55) score -= 2
  if (/\b(i|we|my|our|us)\b/i.test(s)) score += 2
  if (/\b(country|culture|community|elders?|young|youth|family|mob|respect|healing|connection)\b/i.test(s)) score += 2
  if (/\b(proud|grateful|strong|resilient|hope|healed|love|joy)\b/i.test(s)) score += 1
  return score
}

function pickBestQuotes(quotes, max) {
  const seen = new Set()
  const scored = quotes
    .map((q) => ({ q, score: scoreQuoteText(q.quote_text) }))
    .filter((x) => x.score > -50)
    .sort((a, b) => b.score - a.score)

  const out = []
  for (const { q } of scored) {
    const key = cleanupQuoteText(q.quote_text).toLowerCase()
    if (!key || seen.has(key)) continue
    seen.add(key)
    out.push(q)
    if (out.length >= max) break
  }
  return out
}

function extractMissingColumnFromMessage(message) {
  return (
    message.match(/Could not find the '([^']+)' column/i)?.[1] ||
    message.match(/column \"([^\"]+)\" of relation \"stories\" does not exist/i)?.[1] ||
    null
  )
}

async function updateStoryWithSchemaFallback(id, update) {
  let payload = { ...update }
  let lastError = null

  for (let i = 0; i < 10; i++) {
    const res = await supabase.from('stories').update(payload).eq('id', id).select('id').single()
    if (!res?.error) return res

    lastError = res.error
    const missing = extractMissingColumnFromMessage(String(res.error?.message || ''))
    if (!missing) break
    delete payload[missing]
  }

  return { data: null, error: lastError }
}

function isTripInterviewTitle(title) {
  const t = String(title || '').toLowerCase()
  return (
    t.includes('elders trip') ||
    t.includes('elders trips') ||
    t.includes('hull river') ||
    t.includes('mission beach') ||
    t.includes('pre trip') ||
    t.includes('mountain welcome')
  )
}

async function main() {
  const startedAt = new Date().toISOString()

  if (!STORY_ID) throw new Error('Missing --story-id')

  const { data: story, error: storyError } = await supabase.from('stories').select('*').eq('id', STORY_ID).single()
  if (storyError) throw storyError

  // Determine elders to tag from story metadata (fallback), otherwise all public elders.
  let elderIds = Array.isArray(story?.featured_people)
    ? story.featured_people
    : Array.isArray(story?.metadata?.featured_people)
      ? story.metadata.featured_people
      : []

  if (!elderIds.length) {
    const { data: elders } = await supabase
      .from('profiles')
      .select('id, full_name, preferred_name, is_elder, show_in_directory, profile_visibility')
      .eq('is_elder', true)
      .order('full_name', { ascending: true })
      .limit(200)
    const rows = Array.isArray(elders) ? elders : []
    elderIds = rows
      .filter((e) => e?.show_in_directory === true || e?.show_in_directory === null)
      .filter((e) => String(e?.profile_visibility || '').toLowerCase() !== 'private')
      .map((e) => String(e.id))
      .filter(Boolean)
  }

  if (!elderIds.length) throw new Error('No elders found to include')

  const { data: elderProfiles, error: elderProfilesError } = await supabase
    .from('profiles')
    .select('id, full_name, preferred_name, bio, profile_image_url, community_role, traditional_country, language_group, location')
    .in('id', elderIds)
    .limit(200)

  if (elderProfilesError) throw elderProfilesError

  const elderList = Array.isArray(elderProfiles) ? elderProfiles : []
  const elderById = new Map(elderList.map((e) => [String(e.id), e]))

  // Fetch trip-related interviews for these elders.
  const { data: interviews, error: interviewsError } = await supabase
    .from('interviews')
    .select(
      'id, storyteller_id, interview_title, interview_date, raw_transcript, edited_transcript, can_be_quoted, requires_elder_approval, approved_at, privacy_level, status'
    )
    .in('storyteller_id', elderIds)
    .order('interview_date', { ascending: false })
    .limit(600)

  if (interviewsError) throw interviewsError

  const interviewRows = Array.isArray(interviews) ? interviews : []
  const usableInterviews = interviewRows
    .filter((i) => i?.can_be_quoted !== false)
    .filter((i) => !(i?.requires_elder_approval === true && !i?.approved_at))
    .filter((i) => String(i?.privacy_level || '').toLowerCase() !== 'restricted')
    .filter((i) => isTripInterviewTitle(i?.interview_title))
    .slice(0, MAX_TRANSCRIPTS)

  const interviewIds = usableInterviews.map((i) => String(i.id)).filter(Boolean)

  // Prefer extracted quotes anchored to trip interviews (suggested/validated).
  let quoteRows = []
  if (interviewIds.length > 0) {
    const { data: quotes, error: quotesError } = await supabase
      .from('extracted_quotes')
      .select('id, quote_text, attribution, context, theme, sentiment, impact_area, is_validated, suggested_for_report, profile_id, interview_id, created_at')
      .in('interview_id', interviewIds)
      .order('is_validated', { ascending: false })
      .order('suggested_for_report', { ascending: false })
      .order('created_at', { ascending: false })
      .limit(1200)
    if (!quotesError) quoteRows = Array.isArray(quotes) ? quotes : []
  }

  // If none, fall back to any elder quotes.
  if (!quoteRows.length) {
    const { data: quotes } = await supabase
      .from('extracted_quotes')
      .select('id, quote_text, attribution, context, theme, sentiment, impact_area, is_validated, suggested_for_report, profile_id, interview_id, created_at')
      .in('profile_id', elderIds)
      .order('is_validated', { ascending: false })
      .order('suggested_for_report', { ascending: false })
      .order('created_at', { ascending: false })
      .limit(1200)
    quoteRows = Array.isArray(quotes) ? quotes : []
  }

  quoteRows = quoteRows
    .map((q) => ({ ...q, quote_text: cleanupQuoteText(q.quote_text || '') }))
    .filter((q) => q.profile_id && q.quote_text)

  const byProfile = new Map()
  for (const q of quoteRows) {
    const pid = String(q.profile_id || '')
    if (!pid) continue
    const list = byProfile.get(pid) || []
    list.push(q)
    byProfile.set(pid, list)
  }

  // Pick a small set of best quotes overall while trying to cover many Elders.
  const picked = []
  const remaining = new Map()
  for (const id of elderIds) remaining.set(String(id), pickBestQuotes(byProfile.get(String(id)) || [], 6))

  // Round-robin: take 1 per elder first, then fill.
  for (let round = 0; round < 3 && picked.length < MAX_QUOTES; round++) {
    for (const id of elderIds) {
      const list = remaining.get(String(id)) || []
      const next = list.shift()
      if (next) picked.push(next)
      if (picked.length >= MAX_QUOTES) break
    }
  }

  // If still short, take best remaining regardless of elder.
  if (picked.length < MAX_QUOTES) {
    const allRemaining = []
    for (const list of remaining.values()) allRemaining.push(...list)
    picked.push(...pickBestQuotes(allRemaining, MAX_QUOTES - picked.length))
  }

  // Build transcript excerpts (short, cleaned) to support non-quote narration.
  const transcriptExcerpts = usableInterviews
    .map((i) => {
      const elder = elderById.get(String(i.storyteller_id))
      const name = safeString(elder?.preferred_name) || safeString(elder?.full_name) || 'Elder'
      const t = cleanTranscript(i.edited_transcript || i.raw_transcript || '')
      if (!t) return null
      const excerpt = t.slice(0, 1200).trim()
      if (!excerpt) return null
      return `--- ${name} — ${String(i.interview_title || 'Interview').trim()} (${i.id})\n${excerpt}`
    })
    .filter(Boolean)
    .join('\n\n')

  const transcriptBundle = transcriptExcerpts.slice(0, MAX_TRANSCRIPT_CHARS)

  const eldersForPrompt = elderIds
    .map((id) => {
      const e = elderById.get(String(id))
      if (!e) return null
      const name = safeString(e.preferred_name) || safeString(e.full_name) || 'Elder'
      const identity = [safeString(e.community_role), safeString(e.language_group), safeString(e.traditional_country), safeString(e.location)]
        .filter(Boolean)
        .join(' • ')
      return identity ? `${name} (${identity})` : name
    })
    .filter(Boolean)

  const quoteLines = picked.map((q) => {
    const e = elderById.get(String(q.profile_id))
    const name = safeString(e?.preferred_name) || safeString(e?.full_name) || safeString(q.attribution) || 'Elder'
    const title = safeString(
      usableInterviews.find((i) => String(i.id) === String(q.interview_id))?.interview_title
    )
    const ctx = safeString(q.context)
    const meta = [title ? `interview=${title}` : null, safeString(q.theme) ? `theme=${q.theme}` : null].filter(Boolean).join(' • ')
    return `- ${name}: “${cleanupQuoteText(q.quote_text)}”${meta ? ` (${meta})` : ''}${ctx ? `\n  Context: ${ctx}` : ''}`
  })

  const routeNotes = [
    'Palm Island → Townsville → Ingham → Hull River (Mission Beach region) → return',
    'Trip focus: connection, memory, respect, learning, and future pathways for young people',
  ]

  const prompt = `You are drafting a public-facing community story for Palm Island Community Company.

Task:
Write a full, detailed Elders Trip story (plain text, no Markdown formatting requirements) grounded ONLY in the provided interview excerpts + extracted quotes + route notes. Do not invent facts, dates, names, or events beyond what's given.

Style:
- Warm, respectful, community voice; third person narration with occasional "we" only if present in quotes.
- Avoid traumatic detail; acknowledge history gently if referenced in quotes.
- Use short section headings as simple lines (e.g., "Overview", "The Journey", "What Elders shared", "What comes next").
- Include 8–14 quotes from the list below, attributed by Elder name, woven into the story naturally.
- Keep the story suitable for the public website; include a short note that quotes are draft until reviewed/validated.

Output JSON ONLY in this shape:
{
  "title": "...",
  "summary": "... (1-2 sentences)",
  "content": "... (approx 1200-2200 words, with headings and paragraph breaks)",
  "metadata": {
    "key_quotes": ["...", "...", "..."] // 3 short standout quotes (no attribution, no quotation marks)
  }
}

Route notes:
${routeNotes.map((x) => `- ${x}`).join('\n')}

Elders to acknowledge (for a short "Featured Elders" list near the end):
${eldersForPrompt.map((x) => `- ${x}`).join('\n')}

Extracted quotes (use these; do NOT fabricate new quotes):
${quoteLines.join('\n')}

Interview transcript excerpts (supporting context; keep narration consistent with these):
${transcriptBundle || '(none)'}
`

console.log(`Drafting story for ${STORY_ID} (${DRY_RUN ? 'dry-run' : 'apply'})...`)
console.log(`Elders: ${elderIds.length} • Trip interviews: ${usableInterviews.length} • Quote candidates: ${quoteRows.length} • Using quotes: ${picked.length}`)

const response = await anthropic.messages.create({
  model: 'claude-sonnet-4-6',
  max_tokens: 2200,
  messages: [{ role: 'user', content: prompt }],
})

const aiText = response?.content?.[0]?.type === 'text' ? response.content[0].text : ''
const jsonMatch = String(aiText || '').match(/\{[\s\S]*\}/)
if (!jsonMatch) throw new Error('No JSON found in model response')

let draft
try {
  draft = JSON.parse(jsonMatch[0])
} catch {
  throw new Error('Failed to parse JSON from model response')
}

const title = safeString(draft?.title) || 'The Elders Trip'
const summary = safeString(draft?.summary) || safeString(story?.summary) || null
const content = safeString(draft?.content) || safeString(story?.content) || null
const excerpt =
  safeString(draft?.summary) ||
  safeString(draft?.excerpt) ||
  (content ? safeString(String(content).split('\n').find((l) => String(l).trim()) || '') : null) ||
  null
const keyQuotes = Array.isArray(draft?.metadata?.key_quotes) ? draft.metadata.key_quotes.map((q) => safeString(q)).filter(Boolean).slice(0, 3) : []

const nextMetadata = {
  ...(typeof story?.metadata === 'object' && story.metadata ? story.metadata : {}),
  ...(typeof draft?.metadata === 'object' && draft.metadata ? draft.metadata : {}),
  key_quotes: keyQuotes,
  featured_people: elderIds,
  last_story_draft_at: startedAt,
  last_story_draft_model: 'claude-sonnet-4-6',
}

const nextTags = Array.isArray(story?.tags) ? story.tags.slice() : []
for (const t of ['elders-trip', 'elders', 'culture']) {
  if (!nextTags.includes(t)) nextTags.push(t)
}

const update = {
  title,
  excerpt,
  content,
  tags: nextTags,
  story_type: story?.story_type || 'elder_wisdom',
  category: story?.category || 'culture',
  status: 'published',
  is_public: true,
  is_featured: true,
  featured_people: elderIds,
  metadata: nextMetadata,
}

const report = {
  startedAt,
  storyId: STORY_ID,
  dryRun: DRY_RUN,
  elders: elderIds.length,
  tripInterviews: usableInterviews.map((i) => ({ id: i.id, title: i.interview_title, storyteller_id: i.storyteller_id })),
  quotesUsed: picked.map((q) => ({ id: q.id, profile_id: q.profile_id, interview_id: q.interview_id })),
  updatePreview: { title, excerptLength: excerpt ? excerpt.length : 0, contentLength: content ? content.length : 0, keyQuotes },
  error: null,
}

if (!DRY_RUN) {
  const res = await updateStoryWithSchemaFallback(STORY_ID, update)
  if (res?.error) throw res.error
  console.log(`Updated story: ${STORY_ID}`)
} else {
  console.log('Dry run: generated story draft (not saved).')
}

const outDir = path.join(__dirname, 'reports')
fs.mkdirSync(outDir, { recursive: true })
const stamp = startedAt.replace(/[:.]/g, '-')
const outPath = path.join(outDir, `elders-trip-story-draft-${stamp}.json`)
fs.writeFileSync(outPath, JSON.stringify(report, null, 2), 'utf8')
console.log(`Report: ${outPath}`)
}

main().catch((err) => {
  console.error(String(err?.message || err))
  process.exit(1)
})
