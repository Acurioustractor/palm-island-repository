#!/usr/bin/env node
/**
 * check-walk — verify every URL on the CEO demo path is live.
 *
 * Hits each URL with a short HEAD/GET and reports HTTP status. Run
 * before any presentation to catch 404s / 500s / unexpected redirects.
 *
 * Usage:
 *   npm run check-walk                         # against picc.studio
 *   npm run check-walk -- http://localhost:3006  # against local dev
 *   BASE=https://… node scripts/check-walk.mjs
 *
 * Exit code = number of non-2xx URLs (so CI can gate on it).
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
const baseArg = process.argv[2]
const BASE = (baseArg || env.BASE || 'https://picc.studio').replace(/\/$/, '')

const c = {
  reset: '\x1b[0m', red: '\x1b[31m', green: '\x1b[32m',
  yellow: '\x1b[33m', cyan: '\x1b[36m', dim: '\x1b[2m', bold: '\x1b[1m',
}

// CEO demo path — domain by domain. Treats 200 as ok, 308 as ok-redirect
// (we use them to consolidate legacy URLs), anything else as a fail.
const WALKS = [
  {
    name: 'Killer 16 — every domain entry point',
    paths: [
      '/',
      '/atlas',
      '/showcase',
      '/voices',
      '/voices/who',
      '/voices/network',
      '/voices/themes',
      '/services',
      '/projects',
      '/elders',
      '/elders/leadership',
      '/sign-the-vision',
      '/share-note',
      '/design-system',
      '/20-years',
      '/innovation',
      '/bwgcolman',
    ],
  },
  {
    name: 'Detail pages — sample of /voices/[slug] · /services/[slug] · /projects/[slug]',
    paths: [
      '/voices/allan-palm-island',
      '/voices/aunty-ethel-taylor-robertson',
      '/voices/uncle-frank-daniel-anderson',
      '/services/bwg-way',
      '/services/aged',
      '/services/bhs',
      '/projects/picc-elders',
      '/projects/picc-photo',
      '/projects/picc-annual-report',
    ],
  },
  {
    name: 'Operator surfaces (admin — should be 200)',
    paths: ['/picc/atlas', '/picc/demo', '/picc/vision', '/picc/next-20', '/picc/next-20?presenter=1'],
  },
  {
    name: 'Legacy → canonical redirects (should all 308)',
    paths: [
      '/road-to-20-years',
      '/timeline',
      '/history',
      '/community',
      '/storytellers',
      '/voices/notes',
      '/voices/ask',
      '/voices/pulse',
      '/voices/this-month',
      '/share-art',
      '/share-story',
      '/share-voice',
      '/empathy-ledger',
      '/calendar',
      '/about',
      '/explore',
      '/publications',
      '/stories',
      '/thematic-reports',
    ],
    expect: [301, 308],
  },
]

let total = 0
let failures = 0

;(async () => {
  console.log(`\n${c.bold}${c.cyan}check-walk${c.reset}  ${c.dim}base = ${BASE}${c.reset}\n`)

  for (const block of WALKS) {
    console.log(`${c.bold}${block.name}${c.reset}`)
    console.log('─'.repeat(72))
    for (const p of block.paths) {
      total += 1
      const url = `${BASE}${p}`
      let code = 0
      let label = '???'
      try {
        const res = await fetch(url, { redirect: 'manual', cache: 'no-store' })
        code = res.status
      } catch (e) {
        label = `ERR ${e.message.slice(0, 60)}`
      }
      const ok = block.expect ? block.expect.includes(code) : code >= 200 && code < 300
      const colour = ok ? c.green : c.red
      const sym = ok ? '✓' : '✗'
      if (!ok) failures += 1
      const codeOrErr = code > 0 ? String(code) : label
      console.log(`  ${colour}${sym}${c.reset} ${p.padEnd(46)} ${codeOrErr}`)
    }
    console.log('')
  }

  if (failures === 0) {
    console.log(`${c.green}${c.bold}All ${total} URLs are healthy.${c.reset}\n`)
    process.exit(0)
  } else {
    console.log(`${c.red}${c.bold}${failures} of ${total} URLs failed.${c.reset}\n`)
    process.exit(failures)
  }
})()
