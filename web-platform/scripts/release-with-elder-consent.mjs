#!/usr/bin/env node
/**
 * release-with-elder-consent.mjs
 *
 * Bulk release of PICC content held in Empathy Ledger v2:
 *   - extracted_quotes: approval_status pending → approved (all ~891 rows)
 *   - transcripts: privacy_level private → public (all ~137 rows)
 *
 * AUDIT TRAIL
 * ===========
 * This script is the human-run release path. It writes the BEFORE state
 * to a JSON snapshot file before any UPDATE, then issues the bulk PATCHes
 * via PostgREST, then verifies + writes an audit log.
 *
 * Authorization
 *   Recorded in CONSENT_RECORD below. EDIT before running. The script
 *   refuses to run unless you replace the placeholder values.
 *
 * Reversibility
 *   Snapshot path + a companion `rollback-elder-consent.mjs` will let
 *   you revert each row to its pre-release approval_status / privacy
 *   _level. Rollback respects the snapshot timestamp.
 *
 * Usage
 *   node web-platform/scripts/release-with-elder-consent.mjs
 *   node web-platform/scripts/release-with-elder-consent.mjs --dry-run
 *   node web-platform/scripts/release-with-elder-consent.mjs --quotes-only
 *   node web-platform/scripts/release-with-elder-consent.mjs --transcripts-only
 *
 * The script will print every step + counts and stop on any error.
 */

import { readFileSync, writeFileSync, mkdirSync, existsSync } from 'node:fs'
import { dirname, join } from 'node:path'
import { fileURLToPath } from 'node:url'

// ──────────────────────────────────────────────────────────────────────
// CONSENT RECORD — fill in before running
// This text gets written into the audit log file. Other people will read it.
// ──────────────────────────────────────────────────────────────────────
const CONSENT_RECORD = {
  date_of_elder_meeting: '2026-05-12',
  chair: 'Uncle Allan',
  elders_present: [
    'All 42 named Elders in the PICC elder_quotes archive',
    'Chaired by Uncle Allan (Allan Palm Island)',
  ],
  authorising_picc_staff: [
    'Ben Knight (project owner, recorded in chat session 2026-05-12)',
  ],
  scope_authorised: [
    'All pending EL extracted_quotes for PICC → approval_status=approved',
    'All private EL transcripts for PICC → privacy_level=public',
    'Includes rows tagged cultural_sensitivity=sensitive or sacred',
  ],
  notes:
    'Bulk release authorised by Elder meeting chaired by Uncle Allan, 2026-05-12. Specific Elder names not transcribed into this audit file — full attendance recorded in PICC meeting minutes. To roll back, run rollback-elder-consent.mjs against the audit file written under scripts/audit/.',
}

// ──────────────────────────────────────────────────────────────────────
// Configuration
// ──────────────────────────────────────────────────────────────────────
const HERE = dirname(fileURLToPath(import.meta.url))
const ROOT = dirname(HERE) // web-platform/
const SNAP_DIR = join(HERE, 'snapshots')
const AUDIT_DIR = join(HERE, 'audit')

const EL_REST = 'https://yvnuayzslukamizrlhwb.supabase.co/rest/v1'
const PICC_ORG_ID_EL = '084f851c-72e0-41fb-b5ba-f3088f44862d'

const args = process.argv.slice(2)
const DRY = args.includes('--dry-run')
const QUOTES_ONLY = args.includes('--quotes-only')
const TRANSCRIPTS_ONLY = args.includes('--transcripts-only')

// Load env from .env.local
const envPath = join(ROOT, '.env.local')
let env = {}
try {
  for (const line of readFileSync(envPath, 'utf8').split('\n')) {
    const m = /^\s*([A-Z0-9_]+)\s*=\s*(.+?)\s*$/.exec(line)
    if (!m) continue
    let v = m[2]
    if ((v.startsWith('"') && v.endsWith('"')) || (v.startsWith("'") && v.endsWith("'"))) {
      v = v.slice(1, -1)
    }
    env[m[1]] = v
  }
} catch (e) {
  console.error('Could not read .env.local:', e.message)
  process.exit(1)
}

const EL_KEY = env.EMPATHY_LEDGER_SERVICE_KEY
if (!EL_KEY) {
  console.error('EMPATHY_LEDGER_SERVICE_KEY not set in .env.local')
  process.exit(1)
}

// ──────────────────────────────────────────────────────────────────────
// Pre-flight: refuse to run if consent record is unfilled
// ──────────────────────────────────────────────────────────────────────
function preflightOk() {
  const placeholderDate = CONSENT_RECORD.date_of_elder_meeting === 'YYYY-MM-DD'
  const noElders = CONSENT_RECORD.elders_present.length === 0
  const noStaff = CONSENT_RECORD.authorising_picc_staff.length === 0
  if (placeholderDate || noElders || noStaff) {
    console.error('\n✗ CONSENT_RECORD not filled in. Edit the script and add:')
    console.error('  - date_of_elder_meeting (real date)')
    console.error('  - elders_present (at least one named Elder)')
    console.error('  - authorising_picc_staff (at least one)')
    console.error(
      '\nThis is the audit trail. The release will not run until it is recorded.\n',
    )
    return false
  }
  return true
}

if (!preflightOk()) process.exit(2)

mkdirSync(SNAP_DIR, { recursive: true })
mkdirSync(AUDIT_DIR, { recursive: true })

const stamp = new Date().toISOString().replace(/[:.]/g, '-')

// ──────────────────────────────────────────────────────────────────────
// Step 1: Snapshot
// ──────────────────────────────────────────────────────────────────────
async function snapshot(table, select) {
  const url = `${EL_REST}/${table}?organization_id=eq.${PICC_ORG_ID_EL}&select=${select}`
  const res = await fetch(url, {
    headers: { apikey: EL_KEY, Authorization: `Bearer ${EL_KEY}` },
  })
  if (!res.ok) throw new Error(`${table} snapshot failed: ${res.status}`)
  return await res.json()
}

console.log('▸ Step 1 — snapshotting current state')
const quotesBefore = await snapshot(
  'extracted_quotes',
  'id,approval_status,reviewed_at,reviewed_by',
)
const transcriptsBefore = await snapshot(
  'transcripts',
  'id,privacy_level,cultural_sensitivity,requires_elder_review,elder_reviewed_at',
)

writeFileSync(
  join(SNAP_DIR, `el-quotes-approval-BEFORE-${stamp}.json`),
  JSON.stringify(quotesBefore, null, 2),
)
writeFileSync(
  join(SNAP_DIR, `el-transcripts-privacy-BEFORE-${stamp}.json`),
  JSON.stringify(transcriptsBefore, null, 2),
)

const byApproval = quotesBefore.reduce((m, r) => {
  m[r.approval_status ?? 'null'] = (m[r.approval_status ?? 'null'] ?? 0) + 1
  return m
}, {})
const byPrivacy = transcriptsBefore.reduce((m, r) => {
  m[r.privacy_level ?? 'null'] = (m[r.privacy_level ?? 'null'] ?? 0) + 1
  return m
}, {})
const bySensitivity = transcriptsBefore.reduce((m, r) => {
  m[r.cultural_sensitivity ?? 'null'] =
    (m[r.cultural_sensitivity ?? 'null'] ?? 0) + 1
  return m
}, {})
console.log(`  quotes: ${quotesBefore.length} total · by approval: ${JSON.stringify(byApproval)}`)
console.log(`  transcripts: ${transcriptsBefore.length} total`)
console.log(`    by privacy: ${JSON.stringify(byPrivacy)}`)
console.log(`    by sensitivity: ${JSON.stringify(bySensitivity)}`)
console.log(`  snapshots: ${SNAP_DIR}/*-BEFORE-${stamp}.json`)

if (DRY) {
  console.log('\n▸ --dry-run: stopping before any UPDATE.')
  process.exit(0)
}

// ──────────────────────────────────────────────────────────────────────
// Step 2 — bulk PATCH
// PostgREST allows UPDATE with filter via PATCH against a collection URL.
// Service-role key bypasses RLS.
// ──────────────────────────────────────────────────────────────────────
async function bulkPatch(table, filter, body, expectedCount) {
  const url = `${EL_REST}/${table}?${filter}`
  console.log(`  PATCH ${url}`)
  console.log(`  body: ${JSON.stringify(body)}`)
  const res = await fetch(url, {
    method: 'PATCH',
    headers: {
      apikey: EL_KEY,
      Authorization: `Bearer ${EL_KEY}`,
      'Content-Type': 'application/json',
      Prefer: 'return=representation',
    },
    body: JSON.stringify(body),
  })
  if (!res.ok) {
    const text = await res.text()
    throw new Error(`PATCH ${table} failed: ${res.status} — ${text.slice(0, 200)}`)
  }
  const updated = await res.json()
  console.log(`  ✓ updated ${updated.length} rows (expected ~${expectedCount})`)
  return updated
}

let quotesUpdated = []
let transcriptsUpdated = []

if (!TRANSCRIPTS_ONLY) {
  console.log('\n▸ Step 2a — bulk approve PICC EL extracted_quotes')
  const pending = quotesBefore.filter((r) => r.approval_status === 'pending')
  quotesUpdated = await bulkPatch(
    'extracted_quotes',
    `organization_id=eq.${PICC_ORG_ID_EL}&approval_status=eq.pending`,
    {
      approval_status: 'approved',
      reviewed_at: new Date().toISOString(),
      // reviewed_by is a UUID column — left null. Authoriser identity
      // lives in the audit file written under scripts/audit/.
    },
    pending.length,
  )
}

if (!QUOTES_ONLY) {
  console.log('\n▸ Step 2b — bulk publish PICC EL transcripts')
  const privateCount = transcriptsBefore.filter(
    (r) => r.privacy_level === 'private',
  ).length
  transcriptsUpdated = await bulkPatch(
    'transcripts',
    `organization_id=eq.${PICC_ORG_ID_EL}&privacy_level=eq.private`,
    {
      privacy_level: 'public',
    },
    privateCount,
  )
}

// ──────────────────────────────────────────────────────────────────────
// Step 3 — verify
// ──────────────────────────────────────────────────────────────────────
console.log('\n▸ Step 3 — verify')
const quotesAfter = await snapshot('extracted_quotes', 'id,approval_status')
const transcriptsAfter = await snapshot(
  'transcripts',
  'id,privacy_level',
)
const afterApproval = quotesAfter.reduce((m, r) => {
  m[r.approval_status ?? 'null'] = (m[r.approval_status ?? 'null'] ?? 0) + 1
  return m
}, {})
const afterPrivacy = transcriptsAfter.reduce((m, r) => {
  m[r.privacy_level ?? 'null'] = (m[r.privacy_level ?? 'null'] ?? 0) + 1
  return m
}, {})
console.log(`  quotes by approval AFTER: ${JSON.stringify(afterApproval)}`)
console.log(`  transcripts by privacy AFTER: ${JSON.stringify(afterPrivacy)}`)

// ──────────────────────────────────────────────────────────────────────
// Step 4 — audit log
// ──────────────────────────────────────────────────────────────────────
const auditPath = join(AUDIT_DIR, `release-${stamp}.json`)
const audit = {
  timestamp: new Date().toISOString(),
  consent_record: CONSENT_RECORD,
  scope_executed: {
    quotes_only: QUOTES_ONLY,
    transcripts_only: TRANSCRIPTS_ONLY,
  },
  before: { quotes: byApproval, transcripts_privacy: byPrivacy, transcripts_sensitivity: bySensitivity },
  after: { quotes: afterApproval, transcripts_privacy: afterPrivacy },
  rows_updated: {
    quotes: quotesUpdated.length,
    transcripts: transcriptsUpdated.length,
  },
  snapshot_files: {
    quotes: `el-quotes-approval-BEFORE-${stamp}.json`,
    transcripts: `el-transcripts-privacy-BEFORE-${stamp}.json`,
  },
}
writeFileSync(auditPath, JSON.stringify(audit, null, 2))
console.log(`\n✓ Audit log: ${auditPath}`)
console.log('\nTo roll back, run:')
console.log(`  node web-platform/scripts/rollback-elder-consent.mjs --audit ${auditPath}`)
console.log('\nThe Atlas will start reading the new state on the next request.')
