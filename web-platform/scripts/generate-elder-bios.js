#!/usr/bin/env node

/**
 * Generate draft Elders bios from approved/quotable interview transcripts.
 *
 * Defaults are safe:
 * - Only updates Elders with missing bios
 * - Skips restricted / not-quotable / unapproved interviews
 * - Dry-run by default (use --apply to write to DB)
 *
 * Requires (web-platform/.env.local):
 * - NEXT_PUBLIC_SUPABASE_URL
 * - SUPABASE_SERVICE_ROLE_KEY
 * - ANTHROPIC_API_KEY
 *
 * Usage:
 *   node scripts/generate-elder-bios.js
 *   node scripts/generate-elder-bios.js --apply
 *   node scripts/generate-elder-bios.js --apply --force
 *   node scripts/generate-elder-bios.js --limit 3 --dry-run
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
const FORCE = hasFlag('--force')
const LIMIT = Number(getArgValue('--limit', '0')) || 0

const MAX_TRANSCRIPT_CHARS = Math.max(2000, Number(getArgValue('--max-transcript-chars', '14000')) || 14000)
const MAX_INTERVIEWS = Math.max(1, Number(getArgValue('--max-interviews', '3')) || 3)

const supabase = createClient(SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY, {
  auth: { autoRefreshToken: false, persistSession: false },
})

const anthropic = new Anthropic({ apiKey: ANTHROPIC_API_KEY })

const TIME_RANGE_REGEX = /^\s*\d{1,2}:\d{2}:\d{2}(?:[.,]\d{1,3})?\s*-->\s*\d{1,2}:\d{2}:\d{2}(?:[.,]\d{1,3})?\s*$/
const LEADING_TIME_REGEX = /^\s*(?:\[\s*)?(?:\d{1,2}:)?\d{1,2}:\d{2}(?::\d{2})?(?:[.,]\d{1,3})?(?:\s*\])?\s*[-–—]?\s*/i
const SPEAKER_LABEL_REGEX =
  /^\s*(?:(?:speaker\s*\d+)|(?:interviewer)|(?:interviewee)|(?:facilitator)|(?:host)|(?:narrator)|(?:participant))\s*[:\-–—]\s*/i
const ALL_CAPS_LABEL_REGEX = /^\s*[A-Z][A-Z\s]{1,25}\s*[:\-–—]\s*/

function displayName(p) {
  return String(p?.preferred_name || p?.full_name || '').trim() || 'Elder'
}

function safeString(v) {
  const s = String(v ?? '').trim()
  return s || null
}

function looksLikeEncryptedTranscript(input) {
  const s = String(input || '').trim()
  if (!s) return false
  if (s.length < 80) return false
  if (/\s/.test(s)) return false
  if (s.startsWith('gAAAA') && /^[A-Za-z0-9_-]+$/.test(s)) return true
  return false
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

function truncate(text, maxChars) {
  const s = String(text || '')
  if (s.length <= maxChars) return s
  return s.slice(0, maxChars).trim()
}

function cleanupBioText(input) {
  let s = String(input ?? '').trim()
  s = s.replace(/^["'“”]+/, '').replace(/["'“”]+$/, '').trim()
  s = s.replace(/\s+/g, ' ').trim()
  return s || null
}

async function main() {
  const startedAt = new Date().toISOString()
  const report = {
    startedAt,
    apply: !DRY_RUN,
    force: FORCE,
    limit: LIMIT || null,
    maxInterviews: MAX_INTERVIEWS,
    maxTranscriptChars: MAX_TRANSCRIPT_CHARS,
    totals: { elders: 0, analyzed: 0, updated: 0, skipped: 0, errors: 0 },
    elders: [],
  }

  const { data: elders, error: eldersError } = await supabase
    .from('profiles')
    .select(
      'id, full_name, preferred_name, bio, is_elder, show_in_directory, profile_visibility, community_role, traditional_country, language_group, location'
    )
    .eq('is_elder', true)
    .order('full_name', { ascending: true })
    .limit(LIMIT > 0 ? LIMIT : 500)

  if (eldersError) throw eldersError

  const elderRows = (Array.isArray(elders) ? elders : [])
    .filter((e) => e?.show_in_directory === true || e?.show_in_directory === null)
    .filter((e) => String(e?.profile_visibility || '').toLowerCase() !== 'private')

  report.totals.elders = elderRows.length

  console.log(`Found ${elderRows.length} elders. ${DRY_RUN ? '(dry-run)' : '(apply)'}`)

  for (const elder of elderRows) {
    const item = {
      id: elder.id,
      name: displayName(elder),
      action: null,
      bio: null,
      error: null,
      source_interviews: [],
    }
    report.elders.push(item)

    const existingBio = safeString(elder.bio)
    if (existingBio && !FORCE) {
      item.action = 'skipped_has_bio'
      report.totals.skipped++
      continue
    }

    try {
      const { data: interviews, error: interviewsError } = await supabase
        .from('interviews')
        .select(
          'id, interview_title, interview_date, status, raw_transcript, edited_transcript, can_be_quoted, requires_elder_approval, approved_at, privacy_level'
        )
        .eq('storyteller_id', elder.id)
        .order('interview_date', { ascending: false })
        .limit(200)

      if (interviewsError) throw interviewsError

      const rows = Array.isArray(interviews) ? interviews : []

      const usable = []
      for (const interview of rows) {
        const transcript = interview.edited_transcript || interview.raw_transcript || ''
        if (!String(transcript).trim()) continue
        if (looksLikeEncryptedTranscript(transcript)) continue
        if (interview?.can_be_quoted === false) continue
        if (interview?.requires_elder_approval === true && !interview?.approved_at) continue
        if (String(interview?.privacy_level || '').toLowerCase() === 'restricted') continue

        const cleaned = cleanTranscript(transcript)
        if (!cleaned) continue
        usable.push({
          id: interview.id,
          title: String(interview?.interview_title || 'Interview').trim(),
          transcript: cleaned,
        })
      }

      if (usable.length === 0) {
        item.action = 'skipped_no_usable_interviews'
        report.totals.skipped++
        continue
      }

      const chosen = usable.slice(0, MAX_INTERVIEWS)
      item.source_interviews = chosen.map((i) => ({ id: i.id, title: i.title }))

      const identityBits = [
        safeString(elder.community_role),
        safeString(elder.language_group),
        safeString(elder.traditional_country),
        safeString(elder.location),
      ].filter(Boolean)

      const transcriptBundle = truncate(chosen.map((i) => `--- ${i.title} (${i.id})\n${i.transcript}`).join('\n\n'), MAX_TRANSCRIPT_CHARS)

      report.totals.analyzed++

      const response = await anthropic.messages.create({
        model: 'claude-sonnet-4-6',
        max_tokens: 400,
        messages: [
          {
            role: 'user',
            content: `Write a short, public-facing biography for an Elder from Palm Island Community Company.

Requirements:
- 2–3 sentences, ~45–90 words.
- Third person.
- Use only what is supported by the provided transcript text + identity fields.
- Do NOT invent facts, dates, achievements, family details, or sensitive information.
- Keep it respectful and general; do not describe traumatic events in detail.
- If identity fields are present, you may weave them in naturally.

Elder name: ${displayName(elder)}
Identity fields: ${identityBits.length ? identityBits.join(' • ') : '(none)'}

Transcript excerpts:
${transcriptBundle}

Return ONLY the bio text, no quotes, no headings.`,
          },
        ],
      })

      const text = response?.content?.[0]?.type === 'text' ? response.content[0].text : ''
      const bio = cleanupBioText(text)
      if (!bio) throw new Error('Model returned empty bio')

      item.bio = bio

      if (DRY_RUN) {
        item.action = 'generated_dry_run'
        continue
      }

      const { error: updateError } = await supabase.from('profiles').update({ bio }).eq('id', elder.id)
      if (updateError) throw updateError

      item.action = 'updated'
      report.totals.updated++
    } catch (err) {
      item.action = 'error'
      item.error = String(err?.message || err)
      report.totals.errors++
    }
  }

  const outDir = path.join(__dirname, 'reports')
  fs.mkdirSync(outDir, { recursive: true })
  const stamp = startedAt.replace(/[:.]/g, '-')
  const outPath = path.join(outDir, `elder-bio-generation-${stamp}.json`)
  fs.writeFileSync(outPath, JSON.stringify(report, null, 2), 'utf8')

  console.log(`Done.`)
  console.log(`Report: ${outPath}`)
  console.log(
    `Elders: ${report.totals.elders} • analyzed: ${report.totals.analyzed} • updated: ${report.totals.updated} • skipped: ${report.totals.skipped} • errors: ${report.totals.errors}`
  )
}

main().catch((err) => {
  console.error(String(err?.message || err))
  process.exit(1)
})

