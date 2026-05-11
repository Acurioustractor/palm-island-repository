#!/usr/bin/env node
/**
 * extract-all-reports.mjs — run EL v2's PDF extraction over every PICC
 * annual report that has a pdf_url but no extracted_summary yet.
 *
 * EL v2 endpoint:
 *   POST /api/organizations/{org}/annual-reports/{reportId}/extract
 *
 * Authentication: the endpoint accepts an internal token via the
 * `x-empathy-internal-token` header, matching EL v2's
 * INTERNAL_API_TOKEN (which falls back to SUPABASE_SERVICE_ROLE_KEY).
 * PICC already has the EL service-role key as EMPATHY_LEDGER_SERVICE_KEY
 * for the photos endpoint, so we reuse it here.
 *
 * Runtime expectation: each call calls Claude vision on a multi-MB PDF;
 * EL has maxDuration=300 (5 min). Up to 15 reports → run in parallel
 * batches of 3 so total wall-time stays around 25 min.
 *
 * Usage:
 *   node scripts/extract-all-reports.mjs            # run unprocessed only
 *   node scripts/extract-all-reports.mjs --force    # re-extract everything
 *   node scripts/extract-all-reports.mjs --year=2023-24    # just one
 */

import { readFileSync } from 'node:fs'
import { dirname, join } from 'node:path'
import { fileURLToPath } from 'node:url'

const HERE = dirname(fileURLToPath(import.meta.url))
const ROOT = dirname(HERE) // web-platform/

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

const EL_URL = env.EL_V2_API_URL || 'https://empathy-ledger-v2.vercel.app'
const EL_REST = 'https://yvnuayzslukamizrlhwb.supabase.co/rest/v1'
const EL_KEY = env.EMPATHY_LEDGER_SERVICE_KEY
const PICC_ORG_ID_EL = '084f851c-72e0-41fb-b5ba-f3088f44862d'
const BATCH_SIZE = 3 // 3 parallel extractions at a time
const REPORT_TIMEOUT_MS = 6 * 60 * 1000 // 6 min per report

if (!EL_KEY) {
  console.error('EMPATHY_LEDGER_SERVICE_KEY not set in .env.local')
  process.exit(1)
}

const args = process.argv.slice(2)
const FORCE = args.includes('--force')
const YEAR_ARG = args.find((a) => a.startsWith('--year='))?.split('=')[1]

async function fetchReports() {
  let path =
    `${EL_REST}/annual_reports?organization_id=eq.${PICC_ORG_ID_EL}` +
    `&select=id,fiscal_year,pdf_url,extraction_status,extracted_summary` +
    `&order=fiscal_year.desc`
  const res = await fetch(path, {
    headers: { apikey: EL_KEY, Authorization: `Bearer ${EL_KEY}` },
  })
  if (!res.ok) {
    throw new Error(`Could not list reports: ${res.status} ${await res.text()}`)
  }
  return await res.json()
}

async function extractOne(report) {
  const start = Date.now()
  const ctrl = new AbortController()
  const timer = setTimeout(() => ctrl.abort(), REPORT_TIMEOUT_MS)
  const url = `${EL_URL}/api/organizations/${PICC_ORG_ID_EL}/annual-reports/${report.id}/extract?queue_objects=true`
  try {
    const res = await fetch(url, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'x-empathy-internal-token': EL_KEY,
      },
      signal: ctrl.signal,
      body: JSON.stringify({}),
    })
    const elapsed = ((Date.now() - start) / 1000).toFixed(1)
    if (!res.ok) {
      const text = await res.text()
      return { fy: report.fiscal_year, ok: false, status: res.status, error: text.slice(0, 200), elapsed }
    }
    const data = await res.json()
    return {
      fy: report.fiscal_year,
      ok: true,
      summary_chars: data?.extraction?.summary?.length ?? 0,
      sections: data?.extraction?.sections_count ?? 0,
      achievements: data?.extraction?.achievements_count ?? 0,
      photos: data?.extraction?.photos_count ?? 0,
      queued: data?.extraction?.queued_review_objects ?? 0,
      elapsed,
    }
  } catch (err) {
    const elapsed = ((Date.now() - start) / 1000).toFixed(1)
    return { fy: report.fiscal_year, ok: false, error: err.message ?? 'unknown', elapsed }
  } finally {
    clearTimeout(timer)
  }
}

async function main() {
  console.log('▸ Fetching PICC annual reports from EL v2…')
  const all = await fetchReports()
  console.log(`  found ${all.length} reports total`)

  let queue = all.filter((r) => r.pdf_url)
  if (YEAR_ARG) queue = queue.filter((r) => r.fiscal_year === YEAR_ARG)
  if (!FORCE) {
    queue = queue.filter((r) => !r.extracted_summary || r.extraction_status !== 'completed')
  }

  console.log(`▸ ${queue.length} report${queue.length === 1 ? '' : 's'} to extract:`)
  queue.forEach((r) =>
    console.log(`    FY ${r.fiscal_year} · ${r.extraction_status ?? 'pending'}`),
  )
  if (queue.length === 0) {
    console.log('▸ Nothing to do.')
    return
  }

  console.log(`\n▸ Running in batches of ${BATCH_SIZE}…\n`)
  const results = []
  for (let i = 0; i < queue.length; i += BATCH_SIZE) {
    const batch = queue.slice(i, i + BATCH_SIZE)
    console.log(`  Batch ${i / BATCH_SIZE + 1} — FY ${batch.map((r) => r.fiscal_year).join(', ')}`)
    const batchResults = await Promise.all(batch.map(extractOne))
    for (const r of batchResults) {
      if (r.ok) {
        console.log(
          `    ✓ FY ${r.fy} · ${r.elapsed}s · ${r.summary_chars} chars · ${r.sections} sections · ${r.achievements} achievements · ${r.photos} photos · ${r.queued} objects`,
        )
      } else {
        console.log(`    ✗ FY ${r.fy} · ${r.elapsed}s · HTTP ${r.status ?? '?'} · ${r.error}`)
      }
      results.push(r)
    }
  }

  const ok = results.filter((r) => r.ok).length
  const fail = results.length - ok
  console.log(`\n▸ Done. ${ok}/${results.length} succeeded, ${fail} failed.`)
}

main().catch((err) => {
  console.error('FATAL:', err)
  process.exit(1)
})
