#!/usr/bin/env node
/**
 * sync-pencil-photos.mjs — pull every almanac photo slot into a local
 * folder beside the .pen file so Pencil image fills (which require
 * relative paths) can use them.
 *
 * Output: web-platform/pencil-photos/<slot-id>.<ext>
 * Manifest: web-platform/pencil-photos/MANIFEST.json
 *
 * Usage:
 *   node scripts/sync-pencil-photos.mjs              # all slots
 *   node scripts/sync-pencil-photos.mjs --slot=cover # one slot
 *   node scripts/sync-pencil-photos.mjs --force      # re-download even if exists
 *
 * Reads EL_V2_API_URL + EL_V2_API_KEY from .env.local.
 */
import { mkdir, writeFile, readFile, stat } from 'node:fs/promises'
import { existsSync } from 'node:fs'
import { join, extname } from 'node:path'
import { fileURLToPath } from 'node:url'
import { dirname } from 'node:path'
import { execSync } from 'node:child_process'

const __filename = fileURLToPath(import.meta.url)
const __dirname = dirname(__filename)
const ROOT = join(__dirname, '..')
const OUT_DIR = join(ROOT, 'pencil-photos')

/**
 * Read JPEG/PNG pixel dimensions via macOS `sips`. Returns { width, height }
 * or null if not measurable. We use this to flag print-readiness.
 */
function getDims(filePath) {
  try {
    const out = execSync(`sips -g pixelWidth -g pixelHeight "${filePath}" 2>/dev/null`, { encoding: 'utf8' })
    const w = parseInt(out.match(/pixelWidth:\s*(\d+)/)?.[1] ?? '0', 10)
    const h = parseInt(out.match(/pixelHeight:\s*(\d+)/)?.[1] ?? '0', 10)
    if (w > 0 && h > 0) return { width: w, height: h }
  } catch {}
  return null
}

/**
 * A4 at 300dpi = 2480 × 3508 px. We score photos against intended use.
 *
 *   "fullbleed"     — long edge ≥ 2400px (safe for full A4 hero)
 *   "halfpage"      — long edge ≥ 1200px (safe for half-page hero)
 *   "quarterpage"   — long edge ≥ 600px  (safe for quarter-page or portrait)
 *   "thumbnail"     — long edge ≥ 300px  (small badges only)
 *   "too-small"     — below that — won't print cleanly anywhere
 */
function printScore(dims) {
  if (!dims) return 'unknown'
  const long = Math.max(dims.width, dims.height)
  if (long >= 2400) return 'fullbleed'
  if (long >= 1200) return 'halfpage'
  if (long >= 600) return 'quarterpage'
  if (long >= 300) return 'thumbnail'
  return 'too-small'
}

// Slots we care about — mirrors lib/almanac/imagery-system.ts EL slots
// + service galleries. Edit pencil-frame-map.ts for full mapping.
const EL_SLOTS = [
  'elders-on-country',
  'voices-wall',
  'cover',
  'acknowledgement',
  'numbers',
  'bwgcolman',
  'first-1000-days',
  'services',
  'governance',
  'financials',
  'journey',
  'forward',
  'back-cover',
]

const args = process.argv.slice(2)
const onlySlot = args.find((a) => a.startsWith('--slot='))?.split('=')[1]
const force = args.includes('--force')

const ENV_PATH = join(ROOT, '.env.local')
async function loadEnv() {
  if (!existsSync(ENV_PATH)) return {}
  const txt = await readFile(ENV_PATH, 'utf8')
  const out = {}
  for (const line of txt.split('\n')) {
    const m = line.match(/^([A-Z_][A-Z0-9_]*)=(.*)$/)
    if (m) out[m[1]] = m[2].replace(/^["']|["']$/g, '')
  }
  return out
}

function extFromUrl(url) {
  try {
    const p = new URL(url).pathname
    const e = extname(p).toLowerCase()
    if (['.jpg', '.jpeg', '.png', '.webp', '.gif', '.mp4', '.mov'].includes(e)) return e
  } catch {}
  return '.jpg'
}

async function fetchSlotPhotos(base, key, slot) {
  const r = await fetch(`${base}/api/photos?slot=${encodeURIComponent(slot)}&limit=10`, {
    headers: { 'x-picc-api-key': key },
  })
  if (!r.ok) {
    console.warn(`  ! ${slot}: ${r.status} ${r.statusText}`)
    return []
  }
  const j = await r.json()
  return j.photos ?? []
}

async function downloadOne(url, destPath) {
  if (!force && existsSync(destPath)) {
    const st = await stat(destPath)
    if (st.size > 1024) return { skipped: true, size: st.size }
  }
  const r = await fetch(url)
  if (!r.ok) throw new Error(`HTTP ${r.status}`)
  const buf = Buffer.from(await r.arrayBuffer())
  await writeFile(destPath, buf)
  return { skipped: false, size: buf.byteLength }
}

async function main() {
  const env = await loadEnv()
  const base = (process.env.EL_V2_API_URL ?? env.EL_V2_API_URL ?? 'https://empathy-ledger-v2.vercel.app').replace(/\/$/, '')
  const key = process.env.EL_V2_API_KEY ?? env.EL_V2_API_KEY
  if (!key) {
    console.error('Missing EL_V2_API_KEY in .env.local')
    process.exit(1)
  }

  await mkdir(OUT_DIR, { recursive: true })
  console.log(`→ pencil-photos/  (relative path for Pencil image fills: ./pencil-photos/<file>)`)
  console.log()

  const slots = onlySlot ? [onlySlot] : EL_SLOTS
  const manifest = []
  let totalDl = 0
  let totalSkip = 0

  for (const slot of slots) {
    const photos = await fetchSlotPhotos(base, key, slot)
    if (photos.length === 0) {
      console.log(`  · ${slot.padEnd(28)} no photos`)
      continue
    }

    // Hero (first photo) gets the canonical name `<slot>.<ext>`. Extras
    // get `<slot>-<n>.<ext>` so designers can swap in a beat.
    for (let i = 0; i < photos.length; i++) {
      const p = photos[i]
      const e = extFromUrl(p.url)
      const name = i === 0 ? `${slot}${e}` : `${slot}-${i + 1}${e}`
      const dest = join(OUT_DIR, name)
      try {
        const r = await downloadOne(p.url, dest)
        if (r.skipped) totalSkip++
        else totalDl++
        const dims = getDims(dest)
        const score = printScore(dims)
        manifest.push({
          slot,
          index: i,
          file: name,
          pencilPath: `./pencil-photos/${name}`,
          source_url: p.url,
          alt: p.alt_text,
          caption: p.caption,
          el_id: p.id,
          bytes: r.size,
          width: dims?.width ?? null,
          height: dims?.height ?? null,
          print_score: score,
        })
        const tag = r.skipped ? 'skip' : 'dl'
        const dimStr = dims ? `${dims.width}×${dims.height}` : '?'
        console.log(`  ${tag === 'dl' ? '↓' : '·'} ${slot.padEnd(28)} → ${name.padEnd(36)} (${tag}, ${(r.size / 1024).toFixed(0)}KB, ${dimStr}, ${score})`)
      } catch (err) {
        console.warn(`  ! ${slot} #${i + 1}: ${err.message}`)
      }
    }
  }

  // Add service galleries (per-service)
  console.log()
  console.log(`→ service galleries`)
  try {
    const svcRes = await fetch(`${base}/api/picc/services`, { headers: { 'x-picc-api-key': key } })
    if (svcRes.ok) {
      const svcData = await svcRes.json()
      const services = svcData.services ?? []
      for (const svc of services) {
        const r = await fetch(`${base}/api/picc/services/${encodeURIComponent(svc.slug)}/photos?limit=4`, {
          headers: { 'x-picc-api-key': key },
        })
        if (!r.ok) continue
        const j = await r.json()
        const all = j.all ?? []
        for (let i = 0; i < all.length; i++) {
          const p = all[i]
          const e = extFromUrl(p.url)
          const name = i === 0 ? `service-${svc.slug}${e}` : `service-${svc.slug}-${i + 1}${e}`
          const dest = join(OUT_DIR, name)
          try {
            const dlRes = await downloadOne(p.url, dest)
            if (dlRes.skipped) totalSkip++
            else totalDl++
            const dims = getDims(dest)
            const score = printScore(dims)
            manifest.push({
              slot: `service-${svc.slug}`,
              index: i,
              file: name,
              pencilPath: `./pencil-photos/${name}`,
              source_url: p.url,
              alt: p.alt_text,
              caption: p.caption,
              service_slug: svc.slug,
              service_name: svc.name,
              el_id: p.id,
              bytes: dlRes.size,
              width: dims?.width ?? null,
              height: dims?.height ?? null,
              print_score: score,
            })
            const tag = dlRes.skipped ? 'skip' : 'dl'
            const dimStr = dims ? `${dims.width}×${dims.height}` : '?'
            console.log(`  ${tag === 'dl' ? '↓' : '·'} service ${svc.slug.padEnd(36)} → ${name} (${dimStr}, ${score})`)
          } catch (err) {
            console.warn(`  ! service ${svc.slug} #${i + 1}: ${err.message}`)
          }
        }
      }
    }
  } catch (err) {
    console.warn(`  ! service galleries failed: ${err.message}`)
  }

  await writeFile(
    join(OUT_DIR, 'MANIFEST.json'),
    JSON.stringify(
      { generated_at: new Date().toISOString(), count: manifest.length, photos: manifest },
      null,
      2,
    ),
  )

  // Print-readiness rollup
  const tally = manifest.reduce((acc, p) => {
    acc[p.print_score] = (acc[p.print_score] ?? 0) + 1
    return acc
  }, {})

  console.log()
  console.log(`✓ ${totalDl} downloaded · ${totalSkip} skipped (already cached) · ${manifest.length} entries in MANIFEST.json`)
  console.log(`  Pencil paste: ./pencil-photos/<file>`)
  console.log(`  Force re-download: --force`)
  console.log()
  console.log(`Print-readiness:`)
  for (const score of ['fullbleed', 'halfpage', 'quarterpage', 'thumbnail', 'too-small', 'unknown']) {
    if (tally[score]) {
      console.log(`  ${score.padEnd(14)} ${tally[score]}`)
    }
  }
}

main().catch((err) => {
  console.error('FATAL:', err)
  process.exit(1)
})
