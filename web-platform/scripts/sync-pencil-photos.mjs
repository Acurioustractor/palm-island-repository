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

  // ─── STORYTELLERS ────────────────────────────────────────────
  // Two photo sources per storyteller:
  //   1. `photo_url` field on the storyteller object (canonical portrait
  //      uploaded via EL admin) — matches services/projects pattern.
  //   2. `/api/picc/storytellers/<id>/photos` — additional photos linked
  //      via media_storytellers join (where the person appears).
  // We pull both. The `photo_url` is index 0, additional photos are 2+.
  console.log()
  console.log(`→ storytellers (photo_url + media_storytellers)`)
  try {
    const sRes = await fetch(`${base}/api/picc/storytellers?limit=200`, {
      headers: { 'x-picc-api-key': key },
    })
    if (sRes.ok) {
      const sData = await sRes.json()
      const storytellers = sData.storytellers ?? []
      console.log(`  ${storytellers.length} storytellers in EL`)

      for (const st of storytellers) {
        let nextIndex = 0

        // 1) Direct photo_url on the storyteller object
        if (st.photo_url && /\.(jpe?g|png|webp|gif)$/i.test(st.photo_url)) {
          const e = extFromUrl(st.photo_url)
          const name = `storyteller-${st.slug}${e}`
          const dest = join(OUT_DIR, name)
          try {
            const dlRes = await downloadOne(st.photo_url, dest)
            if (dlRes.skipped) totalSkip++
            else totalDl++
            const dims = getDims(dest)
            const score = printScore(dims)
            manifest.push({
              slot: `storyteller-${st.slug}`,
              index: 0,
              file: name,
              pencilPath: `./pencil-photos/${name}`,
              source_url: st.photo_url,
              alt: st.display_name,
              caption: st.bio?.slice(0, 200) ?? null,
              storyteller_id: st.id,
              storyteller_slug: st.slug,
              storyteller_name: st.display_name,
              storyteller_is_elder: st.is_elder,
              el_id: st.id,
              bytes: dlRes.size,
              width: dims?.width ?? null,
              height: dims?.height ?? null,
              print_score: score,
            })
            nextIndex = 1
            const tag = dlRes.skipped ? 'skip' : 'dl'
            const dimStr = dims ? `${dims.width}×${dims.height}` : '?'
            const elderTag = st.is_elder ? '✦' : ' '
            console.log(`  ${tag === 'dl' ? '↓' : '·'} ${elderTag} ${(st.display_name ?? st.slug).padEnd(36)} → ${name} (${dimStr}, ${score})`)
          } catch (err) {
            console.warn(`  ! storyteller ${st.slug}: ${err.message}`)
          }
        }

        // 2) Additional photos via media_storytellers (where the person appears)
        const pr = await fetch(
          `${base}/api/picc/storytellers/${encodeURIComponent(st.id)}/photos?limit=4`,
          { headers: { 'x-picc-api-key': key } },
        )
        if (!pr.ok) continue
        const pd = await pr.json()
        const photos = (pd.photos ?? []).filter((p) =>
          /\.(jpe?g|png|webp|gif)$/i.test(p.url ?? ''),
        )
        for (let i = 0; i < photos.length; i++) {
          const p = photos[i]
          // Don't re-download if it's the same URL as photo_url
          if (p.url === st.photo_url) continue
          const e = extFromUrl(p.url)
          const name = `storyteller-${st.slug}-${nextIndex + 1}${e}`
          const dest = join(OUT_DIR, name)
          try {
            const dlRes = await downloadOne(p.url, dest)
            if (dlRes.skipped) totalSkip++
            else totalDl++
            const dims = getDims(dest)
            const score = printScore(dims)
            manifest.push({
              slot: `storyteller-${st.slug}`,
              index: nextIndex,
              file: name,
              pencilPath: `./pencil-photos/${name}`,
              source_url: p.url,
              alt: p.alt_text,
              caption: p.caption,
              storyteller_id: st.id,
              storyteller_slug: st.slug,
              storyteller_name: st.display_name,
              storyteller_is_elder: st.is_elder,
              el_id: p.id ?? null,
              bytes: dlRes.size,
              width: dims?.width ?? null,
              height: dims?.height ?? null,
              print_score: score,
            })
            nextIndex++
          } catch (err) {
            console.warn(`  ! storyteller ${st.slug} #${nextIndex}: ${err.message}`)
          }
        }
      }
    }
  } catch (err) {
    console.warn(`  ! storytellers fetch failed: ${err.message}`)
  }

  // ─── SERVICES ────────────────────────────────────────────────
  // Use the service's own `image_url` field (set by EL admin when a
  // cover photo is uploaded). This is the canonical service photo —
  // NOT gallery_media_associations which we used to query.
  console.log()
  console.log(`→ services (image_url field)`)
  try {
    const svcRes = await fetch(`${base}/api/picc/services?limit=200`, { headers: { 'x-picc-api-key': key } })
    if (svcRes.ok) {
      const svcData = await svcRes.json()
      const services = svcData.services ?? []
      console.log(`  ${services.length} services in EL`)
      for (const svc of services) {
        if (!svc.image_url) {
          console.log(`  · ${svc.slug.padEnd(15)} no image_url`)
          continue
        }
        const e = extFromUrl(svc.image_url)
        const name = `service-${svc.slug}${e}`
        const dest = join(OUT_DIR, name)
        try {
          const dlRes = await downloadOne(svc.image_url, dest)
          if (dlRes.skipped) totalSkip++
          else totalDl++
          const dims = getDims(dest)
          const score = printScore(dims)
          manifest.push({
            slot: `service-${svc.slug}`,
            index: 0,
            file: name,
            pencilPath: `./pencil-photos/${name}`,
            source_url: svc.image_url,
            alt: null,
            caption: svc.description ?? null,
            service_slug: svc.slug,
            service_name: svc.name,
            service_category: svc.category ?? null,
            el_id: svc.id,
            bytes: dlRes.size,
            width: dims?.width ?? null,
            height: dims?.height ?? null,
            print_score: score,
          })
          const tag = dlRes.skipped ? 'skip' : 'dl'
          const dimStr = dims ? `${dims.width}×${dims.height}` : '?'
          console.log(`  ${tag === 'dl' ? '↓' : '·'} service ${svc.slug.padEnd(15)} → ${name.padEnd(28)} (${dimStr}, ${score})`)
        } catch (err) {
          console.warn(`  ! service ${svc.slug}: ${err.message}`)
        }
      }
    }
  } catch (err) {
    console.warn(`  ! services failed: ${err.message}`)
  }

  // ─── PROJECTS ────────────────────────────────────────────────
  // Projects have `cover_image_url` set by EL admin. Same pattern.
  console.log()
  console.log(`→ projects (cover_image_url field)`)
  try {
    const pRes = await fetch(`${base}/api/picc/projects?limit=200`, { headers: { 'x-picc-api-key': key } })
    if (pRes.ok) {
      const pData = await pRes.json()
      const projects = pData.projects ?? []
      console.log(`  ${projects.length} projects in EL`)
      for (const prj of projects) {
        if (!prj.cover_image_url) {
          console.log(`  · ${prj.slug.padEnd(20)} no cover_image_url`)
          continue
        }
        const e = extFromUrl(prj.cover_image_url)
        const name = `project-${prj.slug}${e}`
        const dest = join(OUT_DIR, name)
        try {
          const dlRes = await downloadOne(prj.cover_image_url, dest)
          if (dlRes.skipped) totalSkip++
          else totalDl++
          const dims = getDims(dest)
          const score = printScore(dims)
          manifest.push({
            slot: `project-${prj.slug}`,
            index: 0,
            file: name,
            pencilPath: `./pencil-photos/${name}`,
            source_url: prj.cover_image_url,
            alt: null,
            caption: prj.description ?? null,
            project_slug: prj.slug,
            project_name: prj.name,
            project_status: prj.status ?? null,
            el_id: prj.id,
            bytes: dlRes.size,
            width: dims?.width ?? null,
            height: dims?.height ?? null,
            print_score: score,
          })
          const tag = dlRes.skipped ? 'skip' : 'dl'
          const dimStr = dims ? `${dims.width}×${dims.height}` : '?'
          console.log(`  ${tag === 'dl' ? '↓' : '·'} project ${prj.slug.padEnd(20)} → ${name.padEnd(32)} (${dimStr}, ${score})`)
        } catch (err) {
          console.warn(`  ! project ${prj.slug}: ${err.message}`)
        }
      }
    }
  } catch (err) {
    console.warn(`  ! projects failed: ${err.message}`)
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
