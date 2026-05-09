#!/usr/bin/env node
/**
 * align-services-from-narelle — push canonical descriptions
 * from PICC-Services-Projects-Review-for-Narelle.md to EL canonical.
 *
 * Phase 1: replace thin/DRAFT descriptions on the 4 worst offenders.
 *
 * Usage:
 *   cd web-platform && node scripts/align-services-from-narelle.mjs        # dry-run
 *   cd web-platform && node scripts/align-services-from-narelle.mjs --go   # actually write
 *
 * Source of truth: PICC-Narelle-Rachel-Workshop/PICC-Services-Projects-Review-for-Narelle.md
 *   - Diversionary Centre (section 18)
 *   - Retail (section 27)
 *   - Safe Haven (section 9)
 *   - Social Enterprises (section 28)
 *
 * Each update goes through the new EL endpoint
 * /api/picc/services/[slug]/update so the change is auditable
 * (org-pinned, auth-checked, returns the updated row).
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
    const k = t.slice(0, eq)
    let v = t.slice(eq + 1)
    if (v.startsWith('"') && v.endsWith('"')) v = v.slice(1, -1)
    env[k] = v
  }
  return env
}

const env = { ...process.env, ...loadEnv() }
const EL = (env.EL_V2_API_URL || 'https://empathy-ledger-v2.vercel.app').replace(/\/$/, '')
const KEY = env.EL_V2_API_KEY
const GO = process.argv.includes('--go')

if (!KEY) {
  console.error('Missing EL_V2_API_KEY in .env.local')
  process.exit(1)
}

// ── canonical descriptions per Narelle doc ────────────────────────────────
const UPDATES = [
  {
    slug: 'divers',
    name: 'Diversionary Centre',
    description:
      'Community patrol, wrong-day programs to divert from substance misuse, and sobering-up centre. Diverts people from contact with the law rather than locking them up. Not male-focused — runs diversionary programs for all. Source: PICC-Narelle review §18.',
  },
  {
    slug: 'retail',
    name: 'Retail',
    description:
      'Retail arm: bakery, fuel station, mechanics shop, coffee shop, variety store. Keeping money circulating locally. Part of operations alongside Logistics. Staff at record high in 23/24 across community enterprises. Source: PICC-Narelle review §27.',
  },
  {
    slug: 'safe-haven',
    name: 'Safe Haven Service',
    description:
      'Funded service running youth patrol, night cafe, and crisis support. Safe space for community members in immediate need. Distinct from Safe House — Safe Haven is the outreach and activity arm. Source: PICC-Narelle review §9.',
  },
  {
    slug: 'enterprises',
    name: 'Social Enterprises',
    description:
      "The umbrella for PICC's community-owned enterprises — Digital Service Centre (21 Palm Islanders in partnership with Telstra taking calls from customers across Australia), Retail (bakery, store, fuel, mechanic operations at the Retail Centre), and Logistics (catering, equipment, event support, supply chain for all PICC programs). Approximately 25% of PICC's entire workforce. Social enterprises demonstrate that community-owned businesses can create sustainable employment in a remote community — jobs created through enterprise, not grants. Source: PICC-Narelle review §28 (auto-drafted from 23/24 annual report content, awaiting Narelle final approval).",
  },
]

async function pushOne(u) {
  const res = await fetch(`${EL}/api/picc/services/${encodeURIComponent(u.slug)}/update`, {
    method: 'POST',
    headers: {
      'content-type': 'application/json',
      'x-picc-api-key': KEY,
    },
    body: JSON.stringify({ description: u.description }),
  })
  const text = await res.text()
  let json = {}
  try { json = JSON.parse(text) } catch { /* keep text */ }
  return { status: res.status, ok: res.ok, body: json, raw: text.slice(0, 300) }
}

async function main() {
  console.log(`\nAligning ${UPDATES.length} service descriptions to PICC-Narelle review`)
  console.log(`Target: ${EL}`)
  console.log(`Mode:   ${GO ? '🟢 LIVE — writing to EL canonical' : '🟡 DRY-RUN — pass --go to actually write'}\n`)

  for (const u of UPDATES) {
    console.log(`▸ ${u.slug.padEnd(14)} ${u.name}`)
    console.log(`  new description (${u.description.length} chars):`)
    console.log(`  ${u.description.slice(0, 120)}…\n`)
    if (!GO) continue
    try {
      const r = await pushOne(u)
      if (r.ok) {
        console.log(`  ✓ saved (${r.body?.service?.description?.length} chars)\n`)
      } else {
        console.log(`  ✗ FAILED ${r.status} — ${r.raw}\n`)
      }
    } catch (err) {
      console.log(`  ✗ ERROR — ${err?.message || err}\n`)
    }
  }

  if (!GO) {
    console.log('Run with --go to actually write.\n')
  } else {
    console.log('Done.\n')
  }
}

main()
