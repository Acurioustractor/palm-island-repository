#!/usr/bin/env node
/**
 * rollback-elder-consent.mjs
 *
 * Reverts a previous run of release-with-elder-consent.mjs by reading
 * the BEFORE-snapshot JSON files and re-applying each row's prior
 * approval_status / privacy_level / reviewed_at / reviewed_by.
 *
 * Usage:
 *   node web-platform/scripts/rollback-elder-consent.mjs --audit <audit-file>
 *   node web-platform/scripts/rollback-elder-consent.mjs --quotes <snapshot.json>
 *   node web-platform/scripts/rollback-elder-consent.mjs --transcripts <snapshot.json>
 *
 * One-row-at-a-time PATCHes so a partial failure doesn't lose state.
 * Slow but safe.
 */

import { readFileSync } from 'node:fs'
import { dirname, join, isAbsolute } from 'node:path'
import { fileURLToPath } from 'node:url'

const HERE = dirname(fileURLToPath(import.meta.url))
const ROOT = dirname(HERE)
const SNAP_DIR = join(HERE, 'snapshots')

const EL_REST = 'https://yvnuayzslukamizrlhwb.supabase.co/rest/v1'

// Load env
const envPath = join(ROOT, '.env.local')
let env = {}
for (const line of readFileSync(envPath, 'utf8').split('\n')) {
  const m = /^\s*([A-Z0-9_]+)\s*=\s*(.+?)\s*$/.exec(line)
  if (!m) continue
  let v = m[2]
  if ((v.startsWith('"') && v.endsWith('"')) || (v.startsWith("'") && v.endsWith("'"))) {
    v = v.slice(1, -1)
  }
  env[m[1]] = v
}
const EL_KEY = env.EMPATHY_LEDGER_SERVICE_KEY
if (!EL_KEY) {
  console.error('EMPATHY_LEDGER_SERVICE_KEY not set')
  process.exit(1)
}

function readJson(path) {
  const full = isAbsolute(path) ? path : join(SNAP_DIR, path)
  return JSON.parse(readFileSync(full, 'utf8'))
}

const args = process.argv.slice(2)
function flag(name) {
  const i = args.indexOf(name)
  return i >= 0 ? args[i + 1] : null
}

let quotesSnapshot = null
let transcriptsSnapshot = null

const auditFile = flag('--audit')
if (auditFile) {
  const audit = readJson(auditFile)
  if (audit.snapshot_files?.quotes) quotesSnapshot = readJson(audit.snapshot_files.quotes)
  if (audit.snapshot_files?.transcripts) transcriptsSnapshot = readJson(audit.snapshot_files.transcripts)
}
const qSnap = flag('--quotes')
if (qSnap) quotesSnapshot = readJson(qSnap)
const tSnap = flag('--transcripts')
if (tSnap) transcriptsSnapshot = readJson(tSnap)

if (!quotesSnapshot && !transcriptsSnapshot) {
  console.error('No snapshot specified. Use --audit <path> or --quotes/--transcripts <path>.')
  process.exit(1)
}

async function patchOne(table, id, body) {
  const res = await fetch(`${EL_REST}/${table}?id=eq.${id}`, {
    method: 'PATCH',
    headers: {
      apikey: EL_KEY,
      Authorization: `Bearer ${EL_KEY}`,
      'Content-Type': 'application/json',
      Prefer: 'return=minimal',
    },
    body: JSON.stringify(body),
  })
  if (!res.ok) {
    const text = await res.text()
    throw new Error(`PATCH ${table}/${id} failed ${res.status}: ${text.slice(0, 120)}`)
  }
}

let errors = 0
let updated = 0

if (quotesSnapshot) {
  console.log(`▸ Rolling back ${quotesSnapshot.length} extracted_quotes`)
  for (let i = 0; i < quotesSnapshot.length; i++) {
    const r = quotesSnapshot[i]
    try {
      await patchOne('extracted_quotes', r.id, {
        approval_status: r.approval_status,
        reviewed_at: r.reviewed_at,
        reviewed_by: r.reviewed_by,
      })
      updated++
      if (i % 100 === 0) console.log(`  ${i + 1}/${quotesSnapshot.length}`)
    } catch (e) {
      errors++
      console.error(`  ✗ ${r.id}: ${e.message}`)
    }
  }
}

if (transcriptsSnapshot) {
  console.log(`▸ Rolling back ${transcriptsSnapshot.length} transcripts`)
  for (let i = 0; i < transcriptsSnapshot.length; i++) {
    const r = transcriptsSnapshot[i]
    try {
      await patchOne('transcripts', r.id, {
        privacy_level: r.privacy_level,
      })
      updated++
      if (i % 20 === 0) console.log(`  ${i + 1}/${transcriptsSnapshot.length}`)
    } catch (e) {
      errors++
      console.error(`  ✗ ${r.id}: ${e.message}`)
    }
  }
}

console.log(`\nDone. ${updated} rolled back, ${errors} errors.`)
process.exit(errors > 0 ? 1 : 0)
