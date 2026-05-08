#!/usr/bin/env node
/**
 * Data coverage audit — storytellers · services · projects · elders.
 *
 * One-shot probe across EL v2 and PICC Supabase to answer:
 *   - How many entities are there in each domain?
 *   - How many have a usable image (avatar / hero / gallery cover)?
 *   - Which specific rows are missing what?
 *
 * Usage: cd web-platform && node scripts/audit-coverage.mjs
 *
 * No writes. No UI. Output is a structured markdown report on stdout.
 */
import fs from 'node:fs'
import path from 'node:path'
import { fileURLToPath } from 'node:url'

const __dirname = path.dirname(fileURLToPath(import.meta.url))

const c = {
  reset: '\x1b[0m', red: '\x1b[31m', green: '\x1b[32m',
  yellow: '\x1b[33m', cyan: '\x1b[36m', dim: '\x1b[2m', bold: '\x1b[1m',
}

function loadEnv() {
  const p = path.join(__dirname, '..', '.env.local')
  if (!fs.existsSync(p)) return {}
  const env = {}
  for (const line of fs.readFileSync(p, 'utf8').split('\n')) {
    const t = line.trim()
    if (!t || t.startsWith('#')) continue
    const eq = t.indexOf('=')
    if (eq < 0) continue
    let v = t.slice(eq + 1).trim()
    if ((v.startsWith('"') && v.endsWith('"')) || (v.startsWith("'") && v.endsWith("'"))) v = v.slice(1, -1)
    env[t.slice(0, eq).trim()] = v
  }
  return env
}

const env = { ...loadEnv(), ...process.env }
const SUPABASE_URL = env.NEXT_PUBLIC_SUPABASE_URL
const SUPABASE_KEY = env.SUPABASE_SERVICE_ROLE_KEY || env.NEXT_PUBLIC_SUPABASE_ANON_KEY
const EL_V2_URL = (env.EL_V2_API_URL || '').replace(/\/$/, '')
const EL_V2_KEY = env.EL_V2_API_KEY || ''

if (!SUPABASE_URL || !SUPABASE_KEY) {
  console.error('Missing NEXT_PUBLIC_SUPABASE_URL or service-role key in .env.local')
  process.exit(1)
}
if (!EL_V2_URL || !EL_V2_KEY) {
  console.error('Missing EL_V2_API_URL or EL_V2_API_KEY in .env.local')
  process.exit(1)
}

async function elGet(path) {
  const res = await fetch(`${EL_V2_URL}${path}`, {
    headers: { 'x-picc-api-key': EL_V2_KEY },
    cache: 'no-store',
  })
  if (!res.ok) throw new Error(`EL ${path} → ${res.status}`)
  return res.json()
}

async function supabase(method, table, query = '', body = null) {
  const url = `${SUPABASE_URL}/rest/v1/${table}${query}`
  const init = {
    method,
    headers: {
      apikey: SUPABASE_KEY,
      Authorization: `Bearer ${SUPABASE_KEY}`,
      'Content-Type': 'application/json',
      Prefer: 'count=exact',
    },
  }
  if (body) init.body = JSON.stringify(body)
  const res = await fetch(url, init)
  const text = await res.text()
  let json = []
  try { json = JSON.parse(text) } catch {}
  if (!res.ok) throw new Error(`Supabase ${table} → ${res.status} ${text.slice(0, 200)}`)
  return { rows: json, count: parseInt(res.headers.get('content-range')?.split('/')[1] || '0', 10) }
}

function pct(n, d) {
  if (!d) return '0%'
  return `${Math.round((n / d) * 100)}%`
}

const report = []
function out(s = '') { report.push(s); console.log(s) }
function header(s) { out(`\n${c.bold}${c.cyan}${s}${c.reset}`); out('─'.repeat(60)) }
function pass(s) { out(`  ${c.green}✓${c.reset} ${s}`) }
function warn(s) { out(`  ${c.yellow}⚠${c.reset} ${s}`) }
function fail(s) { out(`  ${c.red}✗${c.reset} ${s}`) }
function info(s) { out(`  ${c.dim}${s}${c.reset}`) }

// ─────────────────────────────────────────────────────────────────────
// 1. STORYTELLERS
// ─────────────────────────────────────────────────────────────────────
async function auditStorytellers() {
  header('1 · STORYTELLERS')

  // Source: EL v2 — there isn't a single endpoint that lists all storytellers
  // with avatars, but voices-pool returns enriched rows. Combine with the
  // public storytellers connections endpoint pattern.
  const voicesData = await elGet('/api/picc/voices-pool')
  const voices = voicesData.voices || []

  // Distinct storytellers from voices-pool
  const byId = new Map()
  for (const v of voices) {
    if (!v.storyteller_id) continue
    if (!byId.has(v.storyteller_id)) {
      byId.set(v.storyteller_id, {
        id: v.storyteller_id,
        name: v.speaker_name || null,
        role: v.speaker_role || null,
        photo_url: v.photo_url || null,
        quote_count: 0,
      })
    }
    byId.get(v.storyteller_id).quote_count++
  }

  const storytellers = Array.from(byId.values())
  const named = storytellers.filter((s) => s.name)
  const withPhoto = storytellers.filter((s) => s.photo_url)
  const namedWithPhoto = storytellers.filter((s) => s.name && s.photo_url)

  out(`  Total storytellers in voices-pool: ${c.bold}${storytellers.length}${c.reset}`)
  out(`  Named (display_name present):     ${c.bold}${named.length}${c.reset} (${pct(named.length, storytellers.length)})`)
  out(`  With photo_url:                   ${c.bold}${withPhoto.length}${c.reset} (${pct(withPhoto.length, storytellers.length)})`)
  out(`  Named AND with photo:             ${c.bold}${namedWithPhoto.length}${c.reset} (${pct(namedWithPhoto.length, storytellers.length)})`)

  if (named.length > namedWithPhoto.length) {
    warn(`${named.length - namedWithPhoto.length} named storytellers are missing a profile photo:`)
    for (const s of named.filter((x) => !x.photo_url).slice(0, 8)) {
      info(`    - ${s.name} (${s.role || 'no role'}) · ${s.quote_count} quote(s)`)
    }
  }

  return storytellers
}

// ─────────────────────────────────────────────────────────────────────
// 2. SERVICES
// ─────────────────────────────────────────────────────────────────────
async function auditServices() {
  header('2 · SERVICES')

  // EL v2 coverage endpoint already exists — use it.
  const cov = await elGet('/api/picc/coverage')
  const services = cov.services || []

  const total = services.length
  const active = services.filter((s) => s.status === 'active')
  const withDescription = active.filter((s) => s.has_description)
  const withGallery = active.filter((s) => s.gallery_id)
  const withPhotos = active.filter((s) => s.photos_publishable > 0)
  const withStories = active.filter((s) => s.stories > 0)
  const withQuotes = active.filter((s) => s.quotes > 0)

  out(`  Total services:                  ${c.bold}${total}${c.reset}`)
  out(`  Active:                          ${c.bold}${active.length}${c.reset}`)
  out(`  Active · has description:        ${c.bold}${withDescription.length}${c.reset} (${pct(withDescription.length, active.length)})`)
  out(`  Active · linked gallery:         ${c.bold}${withGallery.length}${c.reset} (${pct(withGallery.length, active.length)})`)
  out(`  Active · ≥1 publishable photo:   ${c.bold}${withPhotos.length}${c.reset} (${pct(withPhotos.length, active.length)})`)
  out(`  Active · ≥1 story:               ${c.bold}${withStories.length}${c.reset} (${pct(withStories.length, active.length)})`)
  out(`  Active · ≥1 quote:               ${c.bold}${withQuotes.length}${c.reset} (${pct(withQuotes.length, active.length)})`)

  const missingHero = active.filter((s) => s.photos_publishable === 0)
  if (missingHero.length > 0) {
    warn(`${missingHero.length} active services have NO publishable photo (hero gap):`)
    for (const s of missingHero.slice(0, 12)) {
      info(`    - ${s.slug.padEnd(40)} ${s.name}`)
    }
    if (missingHero.length > 12) info(`    ... and ${missingHero.length - 12} more`)
  }

  return services
}

// ─────────────────────────────────────────────────────────────────────
// 3. PROJECTS
// ─────────────────────────────────────────────────────────────────────
async function auditProjects() {
  header('3 · PROJECTS')

  // PICC Supabase, not EL.
  const { rows, count } = await supabase('GET', 'projects',
    '?select=id,name,slug,hero_image_url,is_public,project_type,status,description&limit=500')

  const total = count
  const publicProjects = rows.filter((p) => p.is_public)
  const withHero = publicProjects.filter((p) => p.hero_image_url)
  const withDesc = publicProjects.filter((p) => p.description)

  out(`  Total projects in Supabase:      ${c.bold}${total}${c.reset}`)
  out(`  Public:                          ${c.bold}${publicProjects.length}${c.reset}`)
  out(`  Public · has hero_image_url:     ${c.bold}${withHero.length}${c.reset} (${pct(withHero.length, publicProjects.length)})`)
  out(`  Public · has description:        ${c.bold}${withDesc.length}${c.reset} (${pct(withDesc.length, publicProjects.length)})`)

  // Project_type distribution
  const byType = {}
  for (const p of publicProjects) {
    const t = p.project_type || 'unknown'
    byType[t] = (byType[t] || 0) + 1
  }
  out(`  Public · by type:                ${Object.entries(byType).map(([k, v]) => `${k}:${v}`).join('  ')}`)

  // Project_type='innovation' is what /innovation surfaces
  const innovation = publicProjects.filter((p) => p.project_type === 'innovation')
  out(`  Public · type=innovation:        ${c.bold}${innovation.length}${c.reset}`)

  const missingHero = publicProjects.filter((p) => !p.hero_image_url)
  if (missingHero.length > 0) {
    warn(`${missingHero.length} public projects have NO hero_image_url:`)
    for (const p of missingHero.slice(0, 12)) {
      info(`    - ${(p.slug || '?').padEnd(40)} ${p.name || '(no name)'}`)
    }
    if (missingHero.length > 12) info(`    ... and ${missingHero.length - 12} more`)
  }

  // Cross-check: do projects have linked photos in EL v2 by tag?
  // Convention from /projects/[slug]/page.tsx: getPhotosForSlot(`project-${slug}`)
  out(`  ${c.dim}(EL v2 photo tag convention: project-<slug>)${c.reset}`)

  return rows
}

// ─────────────────────────────────────────────────────────────────────
// 4. ELDERS
// ─────────────────────────────────────────────────────────────────────
async function auditElders() {
  header('4 · ELDERS')

  // PICC Supabase: profiles where is_elder=true, show_in_directory=true
  // Plus elder_quotes table.
  const { rows: elderProfiles, count: elderProfilesCount } = await supabase(
    'GET',
    'profiles',
    '?select=id,full_name,preferred_name,profile_image_url,bio,role,is_elder,show_in_directory&is_elder=eq.true&limit=200',
  )

  const directoryVisible = elderProfiles.filter((e) => e.show_in_directory)
  const withPhoto = elderProfiles.filter((e) => e.profile_image_url)
  const withBio = elderProfiles.filter((e) => e.bio && e.bio.length > 30)

  out(`  Elder profiles (is_elder=true):  ${c.bold}${elderProfilesCount}${c.reset}`)
  out(`  Visible in directory:            ${c.bold}${directoryVisible.length}${c.reset}`)
  out(`  With profile_image_url:          ${c.bold}${withPhoto.length}${c.reset} (${pct(withPhoto.length, elderProfilesCount)})`)
  out(`  With bio (>30 chars):            ${c.bold}${withBio.length}${c.reset} (${pct(withBio.length, elderProfilesCount)})`)

  const missingPhoto = directoryVisible.filter((e) => !e.profile_image_url)
  if (missingPhoto.length > 0) {
    warn(`${missingPhoto.length} directory-visible elders missing a profile_image_url:`)
    for (const e of missingPhoto.slice(0, 8)) {
      info(`    - ${(e.preferred_name || e.full_name || '?').padEnd(28)} ${e.role || 'Elder'}`)
    }
  }

  // elder_quotes table
  try {
    const { count: elderQuotesTotal } = await supabase('GET', 'elder_quotes', '?select=id&limit=1')
    const { count: validatedCount } = await supabase('GET', 'elder_quotes', '?select=id&is_validated=eq.true&limit=1')
    const { count: publicCount } = await supabase('GET', 'elder_quotes', '?select=id&permission_level=in.(public,community)&limit=1')

    out(`  elder_quotes total:              ${c.bold}${elderQuotesTotal}${c.reset}`)
    out(`  elder_quotes validated:          ${c.bold}${validatedCount}${c.reset}`)
    out(`  elder_quotes public/community:   ${c.bold}${publicCount}${c.reset}`)
  } catch (e) {
    fail(`elder_quotes probe failed: ${e.message}`)
  }

  // elder_trip_stops
  try {
    const { count: tripStopsCount } = await supabase('GET', 'elder_trip_stops', '?select=id&limit=1')
    out(`  elder_trip_stops rows:           ${c.bold}${tripStopsCount}${c.reset}`)
  } catch (e) {
    info(`elder_trip_stops table not present`)
  }

  return elderProfiles
}

// ─────────────────────────────────────────────────────────────────────
// 5. ARCHITECTURE — where does each photo come from?
// ─────────────────────────────────────────────────────────────────────
async function auditArchitecture() {
  header('5 · ARCHITECTURE — is everything EL-sourced?')

  out(`  ${c.bold}Storytellers:${c.reset}`)
  out(`    photo source       → EL v2 voices-pool.photo_url (canonical) ${c.green}✓${c.reset}`)
  out(`    quote source       → EL v2 extracted_quotes ${c.green}✓${c.reset}`)
  out(`    consent             → enforced server-side in EL v2 ${c.green}✓${c.reset}`)
  out()

  out(`  ${c.bold}Services:${c.reset}`)
  out(`    list source        → EL v2 /api/picc/services (canonical) ${c.green}✓${c.reset}`)
  out(`    fallback           → SERVICES_2025 in lib/annual-report/data-2025.ts (static)`)
  out(`    hero photo         → EL v2 service:<slug> + hero tag (slot mechanism) ${c.green}✓${c.reset}`)
  out(`    gallery            → EL v2 service_galleries.gallery_media_associations ${c.green}✓${c.reset}`)
  out(`    quotes             → EL v2 voices-pool, matched by service_slugs[] ${c.green}✓${c.reset}`)
  out()

  out(`  ${c.bold}Projects:${c.reset}`)
  out(`    list source        → PICC Supabase projects table ${c.yellow}⚠${c.reset} (NOT EL)`)
  out(`    hero photo         → projects.hero_image_url column (PICC) ${c.yellow}⚠${c.reset}`)
  out(`    additional photos  → EL v2 project-<slug> tag convention ${c.green}✓${c.reset}`)
  out(`    ${c.dim}Open question: should projects move to EL v2 like services did?${c.reset}`)
  out()

  out(`  ${c.bold}Elders:${c.reset}`)
  out(`    profile source     → PICC Supabase profiles.is_elder=true ${c.yellow}⚠${c.reset} (NOT EL)`)
  out(`    profile photo      → profiles.profile_image_url column (PICC)`)
  out(`    quotes (curated)   → PICC elder_quotes table`)
  out(`    quotes (extracted) → EL v2 extracted_quotes, name-matched`)
  out(`    trip data          → PICC elder_trip_stops table ${c.yellow}⚠${c.reset} (NOT EL)`)
  out(`    ${c.dim}Open question: should elder profiles + trips move to EL v2?${c.reset}`)
}

// ─────────────────────────────────────────────────────────────────────
// MAIN
// ─────────────────────────────────────────────────────────────────────
;(async () => {
  console.log(`${c.bold}${c.cyan}PICC data coverage audit${c.reset}`)
  console.log(`${c.dim}EL v2: ${EL_V2_URL}${c.reset}`)
  console.log(`${c.dim}Supabase: ${SUPABASE_URL}${c.reset}`)

  try {
    await auditStorytellers()
    await auditServices()
    await auditProjects()
    await auditElders()
    await auditArchitecture()

    console.log(`\n${c.green}${c.bold}Audit complete.${c.reset}`)
  } catch (e) {
    console.error(`\n${c.red}Audit failed: ${e.message}${c.reset}`)
    process.exit(1)
  }
})()
