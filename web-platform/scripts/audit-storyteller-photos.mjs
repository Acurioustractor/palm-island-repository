#!/usr/bin/env node
/**
 * audit-storyteller-photos — produces a backfill list for EL admin.
 *
 * Queries EL v2's canonical /api/picc/storytellers and writes a CSV
 * of every named storyteller WITHOUT a `public_avatar_url` /
 * `profile_image_url`. The list is what Narelle / the user then
 * works through in EL admin to backfill photos before any public
 * walkthrough.
 *
 * Usage:
 *   cd web-platform && node scripts/audit-storyteller-photos.mjs
 *   → prints to stdout AND writes /tmp/storytellers-without-photos.csv
 *
 * Exit code = number of storytellers missing a photo (so this can
 * gate a release pipeline if you wanted).
 */
import fs from 'node:fs'
import path from 'node:path'
import { fileURLToPath } from 'node:url'

const __dirname = path.dirname(fileURLToPath(import.meta.url))

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
    if ((v.startsWith('"') && v.endsWith('"')) || (v.startsWith("'") && v.endsWith("'"))) {
      v = v.slice(1, -1)
    }
    env[t.slice(0, eq).trim()] = v
  }
  return env
}

const env = { ...loadEnv(), ...process.env }
const EL_URL = (env.EL_V2_API_URL || '').replace(/\/$/, '')
const EL_KEY = env.EL_V2_API_KEY || ''

if (!EL_URL || !EL_KEY) {
  console.error('Missing EL_V2_API_URL or EL_V2_API_KEY in .env.local')
  process.exit(2)
}

const c = {
  reset: '\x1b[0m', red: '\x1b[31m', green: '\x1b[32m',
  yellow: '\x1b[33m', cyan: '\x1b[36m', dim: '\x1b[2m', bold: '\x1b[1m',
}

;(async () => {
  const res = await fetch(`${EL_URL}/api/picc/storytellers?limit=500`, {
    headers: { 'x-picc-api-key': EL_KEY },
    cache: 'no-store',
  })
  if (!res.ok) {
    console.error(`EL endpoint returned ${res.status}`)
    process.exit(2)
  }
  const data = await res.json()
  const all = data.storytellers || []

  const named = all.filter((s) => s.display_name && s.display_name.trim() !== '')
  const withPhoto = named.filter((s) => s.photo_url)
  const missing = named.filter((s) => !s.photo_url)
  const elders = named.filter((s) => s.is_elder)
  const eldersMissing = elders.filter((s) => !s.photo_url)

  console.log(`\n${c.bold}${c.cyan}Storyteller photo coverage${c.reset}`)
  console.log(`${c.dim}Source: ${EL_URL}/api/picc/storytellers${c.reset}\n`)
  console.log(`Total named:           ${c.bold}${named.length}${c.reset}`)
  console.log(`With photo:            ${c.bold}${c.green}${withPhoto.length}${c.reset} (${pct(withPhoto.length, named.length)})`)
  console.log(`Missing photo:         ${c.bold}${c.yellow}${missing.length}${c.reset} (${pct(missing.length, named.length)})`)
  console.log(`Elders:                ${c.bold}${elders.length}${c.reset}`)
  console.log(`Elders missing photo:  ${c.bold}${eldersMissing.length === 0 ? c.green : c.red}${eldersMissing.length}${c.reset}`)

  if (missing.length === 0) {
    console.log(`\n${c.green}All named storytellers have photos.${c.reset}\n`)
    process.exit(0)
  }

  // Sort: elders first, then alphabetical
  missing.sort((a, b) => {
    if (a.is_elder !== b.is_elder) return a.is_elder ? -1 : 1
    return (a.display_name || '').localeCompare(b.display_name || '')
  })

  console.log(`\n${c.bold}${c.yellow}Missing photo — backfill in EL admin${c.reset}`)
  console.log(`${c.dim}Set public_avatar_url on each storyteller in the EL admin (/admin/storytellers).${c.reset}\n`)
  console.log(`${'#'.padStart(3)}  ${'Name'.padEnd(34)} ${'Elder'.padEnd(6)} ${'Quotes'.padStart(7)}  ${'Role / location'}`)
  console.log('─'.repeat(100))
  missing.forEach((s, i) => {
    const name = (s.display_name || '?').padEnd(34).slice(0, 34)
    const elder = s.is_elder ? '  ✓  ' : '     '
    const quotes = String(s.quote_count || 0).padStart(6)
    const role = (s.role || s.location || '').slice(0, 50)
    console.log(`${String(i + 1).padStart(3)}.  ${name} ${elder}  ${quotes}  ${role}`)
  })

  // Write CSV
  const csvPath = '/tmp/storytellers-without-photos.csv'
  const csv = [
    'name,is_elder,quote_count,role,location,cultural_background,bio_excerpt,el_id',
    ...missing.map((s) =>
      [
        csvField(s.display_name),
        s.is_elder ? 'true' : 'false',
        s.quote_count || 0,
        csvField(s.role || ''),
        csvField(s.location || ''),
        csvField(s.cultural_background || ''),
        csvField((s.bio || '').slice(0, 120).replace(/\s+/g, ' ').trim()),
        s.id,
      ].join(','),
    ),
  ].join('\n')
  fs.writeFileSync(csvPath, csv)
  console.log(`\n${c.dim}Wrote: ${csvPath}${c.reset}`)
  console.log(`${c.dim}Open in any spreadsheet to track backfill progress.${c.reset}\n`)

  process.exit(missing.length)
})().catch((e) => {
  console.error(`${c.red}Audit failed: ${e.message}${c.reset}`)
  process.exit(2)
})

function pct(n, d) {
  return d > 0 ? `${Math.round((n / d) * 100)}%` : '—'
}

function csvField(v) {
  if (v == null) return ''
  const s = String(v)
  if (s.includes(',') || s.includes('"') || s.includes('\n')) {
    return `"${s.replace(/"/g, '""')}"`
  }
  return s
}
