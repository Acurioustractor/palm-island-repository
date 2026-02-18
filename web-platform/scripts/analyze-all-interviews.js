#!/usr/bin/env node

/**
 * Batch analyze ALL unprocessed interviews (elders + non-elders).
 *
 * Requires:
 * - NEXT_PUBLIC_SUPABASE_URL
 * - SUPABASE_SERVICE_ROLE_KEY
 * - ANTHROPIC_API_KEY
 *
 * Usage:
 *   node scripts/analyze-all-interviews.js
 *   node scripts/analyze-all-interviews.js --force
 *   node scripts/analyze-all-interviews.js --limit 3
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
const getArgValue = (name, fallback = null) => {
  const idx = args.indexOf(name)
  if (idx === -1) return fallback
  return args[idx + 1] ?? fallback
}

const FORCE = args.includes('--force')
const LIMIT = Number(getArgValue('--limit', '0')) || 0

const supabase = createClient(SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY, {
  auth: { autoRefreshToken: false, persistSession: false },
})

const anthropic = new Anthropic({ apiKey: ANTHROPIC_API_KEY })

const TIME_RANGE_REGEX = /^\s*\d{1,2}:\d{2}:\d{2}(?:[.,]\d{1,3})?\s*-->\s*\d{1,2}:\d{2}:\d{2}(?:[.,]\d{1,3})?\s*$/
const LEADING_TIME_REGEX = /^\s*(?:\[\s*)?(?:\d{1,2}:)?\d{1,2}:\d{2}(?::\d{2})?(?:[.,]\d{1,3})?(?:\s*\])?\s*[-–—]?\s*/i
const INLINE_TIME_REGEX = /\b\d{1,2}:\d{2}(?::\d{2})?(?:[.,]\d{1,3})?\b/
const SPEAKER_LABEL_REGEX =
  /^\s*(?:(?:speaker\s*\d+)|(?:interviewer)|(?:interviewee)|(?:facilitator)|(?:host)|(?:narrator)|(?:participant))\s*[:\-–—]\s*/i
const ALL_CAPS_LABEL_REGEX = /^\s*[A-Z][A-Z\s]{1,25}\s*[:\-–—]\s*/

const ALLOWED_SENTIMENTS = new Set(['positive', 'neutral', 'negative', 'inspiring', 'reflective'])

function normalizeSentiment(input) {
  const raw = String(input ?? '').trim().toLowerCase()
  if (!raw) return null
  if (ALLOWED_SENTIMENTS.has(raw)) return raw
  if (/inspir|hope|determin|empower|uplift/.test(raw)) return 'inspiring'
  if (/reflect|thought|nostalg|bittersweet|mixed|complex/.test(raw)) return 'reflective'
  if (/grate|proud|happy|joy|optim/.test(raw)) return 'positive'
  if (/sad|ang|fear|worr|neg/.test(raw)) return 'negative'
  if (/neut/.test(raw)) return 'neutral'
  return null
}

function cleanTranscript(input) {
  const raw = String(input || '')
  if (!raw) return ''
  const lines = raw.replace(/\r\n/g, '\n').replace(/\r/g, '\n').split('\n')
  const cleaned = []
  for (let line of lines) {
    line = String(line || '').trim()
    if (!line) { cleaned.push(''); continue }
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
  return cleaned.join('\n').replace(/\n{3,}/g, '\n\n').trim()
}

function cleanupQuoteText(input) {
  let s = String(input || '').replace(/\s+/g, ' ').trim()
  s = s.replace(/^["'""]+/, '').replace(/["'""]+$/, '').trim()
  s = s.replace(/^\s*[-–—•]+\s*/g, '')
  s = s.replace(/\s*\[(?:music|laughter|applause|inaudible|crosstalk)\]\s*/gi, ' ')
  s = s.replace(/\*{1,3}([^*]+)\*{1,3}/g, '$1')
  s = s.replace(/_{1,3}([^_]+)_{1,3}/g, '$1')
  s = s.replace(/~~([^~]+)~~/g, '$1')
  s = s.replace(/^#{1,6}\s+/gm, '')
  s = s.replace(/^>\s+/gm, '')
  s = s.replace(/\[([^\]]+)\]\([^)]+\)/g, '$1')
  s = s.replace(/`([^`]+)`/g, '$1')
  s = s.replace(/\s+/g, ' ').trim()
  return s
}

function isLikelyJunkQuote(input) {
  const s = cleanupQuoteText(input)
  if (!s) return true
  if (/^[-–—]+$/.test(s)) return true
  if (/(https?:\/\/|www\.)/i.test(s)) return true
  if (/\b(um+|uh+|erm+)\b/i.test(s) && s.split(/\s+/).length < 10) return true
  if (s.length < 40) return true
  if (s.length > 320) return true
  return false
}

function looksLikeEncryptedTranscript(input) {
  const s = String(input || '').trim()
  if (!s || s.length < 80) return false
  if (/\s/.test(s)) return false
  if (s.startsWith('gAAAA') && /^[A-Za-z0-9_-]+$/.test(s)) return true
  return false
}

function truncateForModel(text, maxChars = 24000) {
  const s = String(text || '')
  if (s.length <= maxChars) return s
  const head = Math.floor(maxChars * 0.65)
  const tail = maxChars - head
  return `${s.slice(0, head)}\n\n[... transcript truncated ...]\n\n${s.slice(-tail)}`
}

function chunkTextBySentence(input, maxLen = 420) {
  const s = String(input || '').replace(/\s+/g, ' ').trim()
  if (!s) return []
  if (s.length <= maxLen) return [s]
  const parts = /[.!?]/.test(s) ? s.split(/(?<=[.!?])\s+/g).map((t) => t.trim()).filter(Boolean) : [s]
  const chunks = []
  let buf = ''
  for (const part of parts) {
    if (!buf) { buf = part; continue }
    if ((buf + ' ' + part).length <= maxLen) { buf = buf + ' ' + part; continue }
    chunks.push(buf)
    buf = part
  }
  if (buf) chunks.push(buf)
  const hardWrapped = []
  for (const c of chunks) {
    if (c.length <= maxLen * 1.6) { hardWrapped.push(c); continue }
    for (let i = 0; i < c.length; i += maxLen) hardWrapped.push(c.slice(i, i + maxLen).trim())
  }
  return hardWrapped.filter(Boolean)
}

function buildTranscriptSegments(transcript, maxSegments = 400) {
  const cleaned = cleanTranscript(transcript)
  if (!cleaned) return []
  const paragraphs = cleaned.split(/\n{2,}/g).map((p) => p.replace(/\n/g, ' ').trim()).filter(Boolean)
  const segments = []
  for (const p of paragraphs) {
    const chunks = chunkTextBySentence(p, 420)
    for (const text of chunks) {
      segments.push({ segment_index: segments.length, text })
      if (segments.length >= maxSegments) return segments
    }
  }
  return segments
}

function pickSegmentsForModel(segments, max = 120) {
  if (segments.length <= max) return segments
  const head = Math.floor(max * 0.65)
  const tail = max - head
  return [...segments.slice(0, head), ...segments.slice(-tail)]
}

function normalizeAndFilterQuotes(quotes) {
  const seen = new Set()
  const cleaned = []
  for (const q of Array.isArray(quotes) ? quotes : []) {
    const quoteText = cleanupQuoteText(q?.quote_text || '')
    if (!quoteText || isLikelyJunkQuote(quoteText)) continue
    const key = quoteText.toLowerCase()
    if (seen.has(key)) continue
    seen.add(key)
    const evidenceSegments = Array.isArray(q?.evidence_segments)
      ? q.evidence_segments.map((n) => Number(n)).filter((n) => Number.isInteger(n) && n >= 0).slice(0, 6)
      : []
    cleaned.push({
      ...q,
      quote_text: quoteText,
      context: String(q?.context || '').trim(),
      theme: String(q?.theme || '').trim(),
      sentiment: normalizeSentiment(q?.sentiment),
      impact_area: String(q?.impact_area || '').trim(),
      significance: String(q?.significance || '').trim(),
      suggested_for_report: Boolean(q?.suggested_for_report),
      evidence_segments: evidenceSegments,
    })
  }
  return cleaned
}

async function insertQuotesWithSchemaFallback(rows) {
  if (!rows.length) return { inserted: 0, data: [], error: null }
  const attempt = async (payload) => supabase.from('extracted_quotes').insert(payload).select()
  let payload = rows
  let lastError = null
  for (let i = 0; i < 6; i++) {
    const res = await attempt(payload)
    if (!res?.error) return { inserted: (res?.data || []).length, data: res?.data || [], error: null }
    lastError = res.error
    const message = String(res.error?.message || '')
    const missingCol =
      message.match(/Could not find the '([^']+)' column/i)?.[1] ||
      message.match(/column "([^"]+)" of relation "extracted_quotes" does not exist/i)?.[1] || null
    if (!missingCol) break
    payload = payload.map((r) => { const next = { ...r }; delete next[missingCol]; return next })
  }
  return { inserted: 0, data: [], error: lastError }
}

function sleep(ms) { return new Promise((resolve) => setTimeout(resolve, ms)) }

async function countExistingQuotesForInterview(interviewId) {
  const id = String(interviewId || '').trim()
  if (!id) return 0
  try {
    const direct = await supabase.from('extracted_quotes').select('id', { count: 'exact', head: true }).eq('interview_id', id)
    if (!direct?.error) {
      const c = Number(direct?.count || 0)
      if (c > 0) return c
    }
  } catch { /* fall through */ }
  try {
    const legacy = await supabase.from('extracted_quotes').select('id', { count: 'exact', head: true }).eq('metadata->>interview_id', id)
    if (!legacy?.error) return Number(legacy?.count || 0)
  } catch { /* ignore */ }
  return 0
}

async function main() {
  const startedAt = new Date().toISOString()
  const report = {
    startedAt,
    force: FORCE,
    limit: LIMIT || null,
    interviews: [],
    totals: { total: 0, analyzed: 0, skipped: 0, quotesInserted: 0, errors: 0 },
  }

  // Fetch ALL interviews (not just elder ones)
  const query = supabase
    .from('interviews')
    .select('*, profiles!storyteller_id(id, full_name, preferred_name, is_elder)')
    .order('created_at', { ascending: true })

  if (LIMIT > 0) query.limit(LIMIT)

  const { data: interviews, error: fetchError } = await query
  if (fetchError) throw fetchError

  const rows = Array.isArray(interviews) ? interviews : []
  report.totals.total = rows.length

  console.log(`Found ${rows.length} interviews${LIMIT ? ` (limit=${LIMIT})` : ''}. Starting analysis...\n`)

  for (const interview of rows) {
    const profile = interview.profiles || {}
    const speakerName = String(profile.preferred_name || profile.full_name || '').trim() || 'Community Member'
    const interviewTitle = String(interview.interview_title || 'Interview').trim()

    const item = {
      interview_id: interview.id,
      title: interviewTitle,
      speaker: speakerName,
      is_elder: Boolean(profile.is_elder),
      status: interview.status || null,
      action: null,
      quotesInserted: 0,
      error: null,
    }
    report.interviews.push(item)

    const transcript = interview.edited_transcript || interview.raw_transcript || ''

    if (!String(transcript).trim()) {
      item.action = 'skipped_no_transcript'
      report.totals.skipped++
      continue
    }

    if (looksLikeEncryptedTranscript(transcript)) {
      item.action = 'skipped_encrypted'
      report.totals.skipped++
      continue
    }

    if (interview?.can_be_quoted === false) {
      item.action = 'skipped_not_quotable'
      report.totals.skipped++
      continue
    }

    if (interview?.requires_elder_approval === true && !interview?.approved_at) {
      item.action = 'skipped_needs_approval'
      report.totals.skipped++
      continue
    }

    if (String(interview?.privacy_level || '').toLowerCase() === 'restricted') {
      item.action = 'skipped_restricted'
      report.totals.skipped++
      continue
    }

    if (!FORCE) {
      const existingCount = await countExistingQuotesForInterview(interview.id)
      if (existingCount > 0) {
        item.action = 'skipped_already_analyzed'
        report.totals.skipped++
        continue
      }
    }

    console.log(`Analyzing: ${speakerName} — ${interviewTitle}`)

    try {
      const allSegments = buildTranscriptSegments(transcript, 400)
      const segmentsForModel = pickSegmentsForModel(allSegments, 120)
      const segmentTextForModel = segmentsForModel.map((s) => `[${s.segment_index}] ${s.text}`).join('\n')

      const response = await anthropic.messages.create({
        model: 'claude-sonnet-4-5-20250929',
        max_tokens: 4000,
        messages: [
          {
            role: 'user',
            content: `Analyze these interview transcript segments from ${speakerName} at Palm Island Community Company. Extract meaningful, print-ready quotes for annual reports, community stories, and immersive story experiences.

TRANSCRIPT SEGMENTS (each line starts with a segment index in brackets):
${truncateForModel(segmentTextForModel, 24000)}

Please analyze and return JSON in this exact format:
{
  "summary": "A 2-3 sentence summary of the interview content and main points discussed",
  "key_themes": ["array", "of", "main", "themes", "discussed"],
  "extracted_quotes": [
    {
      "quote_text": "A direct quote from the transcript (light grammar cleanup OK), with NO timestamps/timecodes, NO speaker labels, and no filler like 'um/uh' unless meaningful",
      "context": "Brief context about what prompted this quote or what it relates to",
      "theme": "One of: community | services | culture | history | achievement | resilience | youth | elders | innovation | connection",
      "sentiment": "One of: positive | neutral | negative | inspiring | reflective",
      "impact_area": "One of: community_wellbeing | cultural_preservation | youth_development | employment | health | education | housing | environment",
      "significance": "Why this quote is meaningful or impactful",
      "suggested_for_report": true or false - whether this quote would work well in an annual report,
      "evidence_segments": [0, 12] - array of 1-3 segment indices that support this quote
    }
  ],
  "recommendations": ["Suggestions for follow-up questions or stories to explore"]
}

Guidelines:
- Extract 3-10 meaningful quotes depending on transcript length
- Each quote should stand alone and be 12-45 words where possible
- Prioritize quotes that show community impact, personal growth, cultural connection, or gratitude
- Clean up quotes for readability but maintain authentic voice
- Look for quotes that tell a story or express emotion
- Flag the most powerful quotes as suggested_for_report: true
- Do NOT include timestamps, time ranges, or speaker tags
- For each quote, include evidence_segments pointing to source context
- Be culturally respectful and sensitive to Indigenous perspectives
- Recognize the strength and resilience of the Palm Island community

Return ONLY the JSON, no other text.`,
          },
        ],
      })

      const aiText = response?.content?.[0]?.type === 'text' ? response.content[0].text : ''
      const jsonMatch = String(aiText || '').match(/\{[\s\S]*\}/)
      if (!jsonMatch) throw new Error('No JSON found in model response')

      let analysis
      try { analysis = JSON.parse(jsonMatch[0]) } catch { throw new Error('Failed to parse JSON from model response') }

      analysis.extracted_quotes = normalizeAndFilterQuotes(analysis.extracted_quotes)

      // Upsert segments
      const segmentIdByIndex = new Map()
      const segmentTextByIndex = new Map()
      for (const s of allSegments) segmentTextByIndex.set(s.segment_index, s.text)

      if (allSegments.length > 0) {
        try {
          const payload = allSegments.map((s) => ({
            interview_id: interview.id,
            segment_index: s.segment_index,
            segment_text: s.text,
          }))
          const { data: segRows } = await supabase
            .from('interview_segments')
            .upsert(payload, { onConflict: 'interview_id,segment_index' })
            .select('id, segment_index')
          for (const row of Array.isArray(segRows) ? segRows : []) {
            segmentIdByIndex.set(Number(row.segment_index), String(row.id))
          }
        } catch { /* optional */ }
      }

      const quotesToInsert = analysis.extracted_quotes.map((q) => ({
        profile_id: interview.storyteller_id,
        interview_id: interview.id,
        quote_text: q.quote_text,
        attribution: speakerName,
        context: q.context,
        theme: q.theme,
        sentiment: q.sentiment || null,
        impact_area: q.impact_area,
        suggested_for_report: q.suggested_for_report,
        is_validated: false,
        tenant_id: '9c4e5de2-d80a-4e0b-8a89-1bbf09485532',
        metadata: {
          significance: q.significance,
          source: 'interview',
          interview_id: interview.id,
          evidence_segments: Array.isArray(q.evidence_segments) ? q.evidence_segments : [],
          extraction_date: new Date().toISOString(),
        },
      }))

      const { data: inserted, error: insertError } = await insertQuotesWithSchemaFallback(quotesToInsert)
      if (insertError) throw insertError

      item.quotesInserted = Array.isArray(inserted) ? inserted.length : 0
      item.action = 'analyzed'
      report.totals.analyzed++
      report.totals.quotesInserted += item.quotesInserted

      // Store citations
      try {
        const insertedQuoteRows = Array.isArray(inserted) ? inserted : []
        const quoteIdByText = new Map()
        for (const row of insertedQuoteRows) {
          const key = cleanupQuoteText(String(row?.quote_text || '')).toLowerCase()
          if (key) quoteIdByText.set(key, String(row.id))
        }
        const citations = []
        for (const q of analysis.extracted_quotes) {
          const key = cleanupQuoteText(q.quote_text || '').toLowerCase()
          const quoteId = quoteIdByText.get(key)
          if (!quoteId) continue
          const evidence = Array.isArray(q.evidence_segments) ? q.evidence_segments : []
          for (const idx of evidence) {
            const segmentIndex = Number(idx)
            if (!Number.isInteger(segmentIndex) || segmentIndex < 0) continue
            citations.push({
              quote_id: quoteId,
              interview_id: interview.id,
              segment_id: segmentIdByIndex.get(segmentIndex) || null,
              segment_index: segmentIndex,
              excerpt: segmentTextByIndex.get(segmentIndex) || null,
              metadata: { source: 'ai', collected_at: new Date().toISOString() },
            })
          }
        }
        if (citations.length > 0) await supabase.from('extracted_quote_citations').insert(citations)
      } catch { /* optional */ }

      // Store review artifact
      try {
        await supabase.from('interview_review_artifacts').insert({
          interview_id: interview.id,
          profile_id: interview.storyteller_id,
          artifact_type: 'quote_library',
          title: `Quote library: ${speakerName} — ${interviewTitle}`,
          status: 'draft',
          visibility: 'internal',
          content: {
            summary: analysis.summary,
            key_themes: analysis.key_themes,
            recommendations: analysis.recommendations,
            extracted_quotes: analysis.extracted_quotes,
            segments_used_for_model: segmentsForModel.map((s) => s.segment_index),
          },
          metadata: { model: 'claude-sonnet-4-5-20250929', generated_at: new Date().toISOString() },
        })
      } catch { /* optional */ }

      // Update interview fields
      try {
        const existingMeta = interview?.metadata && typeof interview.metadata === 'object' ? interview.metadata : {}
        const mergedMeta = {
          ...existingMeta,
          ai_analysis: {
            summary: analysis.summary,
            key_themes: analysis.key_themes,
            quotes_extracted: analysis.extracted_quotes.length,
            recommendations: analysis.recommendations,
            analyzed_at: new Date().toISOString(),
          },
        }
        const updateRes = await supabase
          .from('interviews')
          .update({ key_themes: analysis.key_themes, interview_notes: analysis.summary, status: 'transcribed', metadata: mergedMeta })
          .eq('id', interview.id)
        if (updateRes?.error) {
          await supabase
            .from('interviews')
            .update({ key_themes: analysis.key_themes, interview_notes: analysis.summary, metadata: mergedMeta })
            .eq('id', interview.id)
        }
      } catch { /* optional */ }

      console.log(`  → ${item.quotesInserted} quotes extracted (themes: ${analysis.key_themes?.join(', ') || 'none'})`)

      await sleep(650)
    } catch (err) {
      item.action = 'error'
      item.error = String(err?.message || err)
      report.totals.errors++
      console.error(`  ✗ Error: ${item.error}`)
    }
  }

  const finishedAt = new Date().toISOString()
  report.finishedAt = finishedAt

  const outDir = path.join(__dirname, 'reports')
  fs.mkdirSync(outDir, { recursive: true })
  const outPath = path.join(outDir, `all-interview-analysis-${startedAt.replace(/[:.]/g, '-')}.json`)
  fs.writeFileSync(outPath, JSON.stringify(report, null, 2), 'utf8')

  console.log('')
  console.log('Done.')
  console.log(`Analyzed: ${report.totals.analyzed}, skipped: ${report.totals.skipped}, quotes inserted: ${report.totals.quotesInserted}, errors: ${report.totals.errors}`)
  console.log(`Report: ${outPath}`)
}

main().catch((err) => {
  console.error(String(err?.message || err))
  process.exit(1)
})
