#!/usr/bin/env node

/**
 * Create or update a public "Elders Trip" story and link all Elders as featured people.
 *
 * Defaults:
 * - Dry-run unless --apply is provided
 * - Uses the first public Elder as storyteller unless --storyteller-id is provided
 *
 * Requires (web-platform/.env.local):
 * - NEXT_PUBLIC_SUPABASE_URL
 * - SUPABASE_SERVICE_ROLE_KEY
 *
 * Usage:
 *   node scripts/create-elders-trip-story.js
 *   node scripts/create-elders-trip-story.js --apply
 *   node scripts/create-elders-trip-story.js --apply --storyteller-id <uuid>
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

const APPLY = hasFlag('--apply')
const DRY_RUN = hasFlag('--dry-run') || !APPLY
const STORYTELLER_ID = getArgValue('--storyteller-id', null)

const supabase = createClient(SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY, {
  auth: { autoRefreshToken: false, persistSession: false },
})

function safeString(v) {
  const s = String(v ?? '').trim()
  return s || null
}

async function upsertWithSchemaFallback(payload, existingId) {
  const attempt = async (p) => {
    if (existingId) {
      return supabase.from('stories').update(p).eq('id', existingId).select('id').single()
    }
    return supabase.from('stories').insert(p).select('id').single()
  }

  let p = payload
  let lastError = null
  for (let i = 0; i < 8; i++) {
    const res = await attempt(p)
    if (!res?.error) return res
    lastError = res.error
    const message = String(res.error?.message || '')
    const missingCol =
      message.match(/Could not find the '([^']+)' column/i)?.[1] ||
      message.match(/column \"([^\"]+)\" of relation \"stories\" does not exist/i)?.[1] ||
      null
    if (!missingCol) break
    const next = { ...p }
    delete next[missingCol]
    p = next
  }
  return { data: null, error: lastError }
}

async function main() {
  const startedAt = new Date().toISOString()

  const { data: elders, error: eldersError } = await supabase
    .from('profiles')
    .select('id, full_name, preferred_name, is_elder, show_in_directory, profile_visibility')
    .eq('is_elder', true)
    .order('full_name', { ascending: true })
    .limit(500)

  if (eldersError) throw eldersError

  const elderRows = (Array.isArray(elders) ? elders : [])
    .filter((e) => e?.show_in_directory === true || e?.show_in_directory === null)
    .filter((e) => String(e?.profile_visibility || '').toLowerCase() !== 'private')

  if (elderRows.length === 0) throw new Error('No public elders found to link')

  const featuredPeople = elderRows.map((e) => e.id).filter(Boolean)
  const storytellerId = safeString(STORYTELLER_ID) || String(elderRows[0].id)

  // Find existing story by tag + metadata marker (best-effort)
  let existing = null
  try {
    const { data: found } = await supabase
      .from('stories')
      .select('id, title')
      .contains('tags', ['elders-trip'])
      .order('created_at', { ascending: false })
      .limit(5)
    existing = Array.isArray(found) ? found.find((s) => /elders?\s+trip/i.test(String(s?.title || ''))) : null
  } catch {
    existing = null
  }

  const title = 'The Elders Trip'
  const excerpt =
    'A journey of connection and remembrance — Elders travelled together to return to places of deep significance, share stories, and strengthen pathways for the next generation.'

  const content =
    `This page brings together a growing record of the Elders Trip: a shared journey from Palm Island to the Mission Beach / Hull River region.\n\n` +
    `It is about connection — returning to place, sharing memory, and carrying forward what Elders want young people to know.\n\n` +
    `Over time, this story will expand with more photos, interviews, and reviewed quotes from Elders who took part.\n\n` +
    `If you were part of the trip and want to add details or correct anything, please let PICC know so we can keep this record accurate and respectful.`

  const payload = {
    storyteller_id: storytellerId,
    title,
    excerpt,
    content,
    category: 'culture',
    story_type: 'elder_wisdom',
    access_level: 'public',
    status: 'published',
    is_public: true,
    is_featured: true,
    tags: ['elders-trip', 'elders', 'community', 'culture'],
    location: 'Palm Island / Mission Beach (Hull River region)',
    contains_traditional_knowledge: false,
    cultural_sensitivity_level: 'low',
    featured_people: featuredPeople,
    metadata: {
      generated_by: 'create-elders-trip-story.js',
      generated_at: startedAt,
      featured_people: featuredPeople,
    },
  }

  const report = {
    startedAt,
    dryRun: DRY_RUN,
    existingStoryId: existing?.id || null,
    storytellerId,
    featuredPeopleCount: featuredPeople.length,
    payloadPreview: payload,
    result: null,
    error: null,
  }

  if (DRY_RUN) {
    console.log('Dry run: would upsert Elders Trip story with payload:')
    console.log(JSON.stringify({ storytellerId, featuredPeopleCount: featuredPeople.length, title, tags: payload.tags }, null, 2))
  } else {
    const { data: saved, error } = await upsertWithSchemaFallback(payload, existing?.id || null)
    if (error) throw error
    report.result = { id: saved?.id || null }
    console.log(`Upserted story: ${saved?.id}`)
  }

  const outDir = path.join(__dirname, 'reports')
  fs.mkdirSync(outDir, { recursive: true })
  const stamp = startedAt.replace(/[:.]/g, '-')
  const outPath = path.join(outDir, `elders-trip-story-upsert-${stamp}.json`)
  fs.writeFileSync(outPath, JSON.stringify(report, null, 2), 'utf8')
  console.log(`Report: ${outPath}`)
}

main().catch((err) => {
  console.error(String(err?.message || err))
  process.exit(1)
})
