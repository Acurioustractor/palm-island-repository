/**
 * Tag Existing Photos with AI
 *
 * Reads all images from public/annual-report-photos/ and uses Gemini vision
 * to generate descriptions, tags, and metadata. Stores results in media_files table.
 *
 * Usage:
 *   npx tsx scripts/tag-existing-photos.ts
 *   npx tsx scripts/tag-existing-photos.ts --dry-run
 *   npx tsx scripts/tag-existing-photos.ts --year 2023-24
 *   npx tsx scripts/tag-existing-photos.ts --limit 10
 */

import { config } from 'dotenv'
import { resolve, join, basename } from 'path'
import { promises as fs } from 'fs'
import { createClient } from '@supabase/supabase-js'
import { GoogleGenerativeAI } from '@google/generative-ai'

config({ path: resolve(__dirname, '../.env.local') })

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
)

const genAI = new GoogleGenerativeAI(process.env.GOOGLE_AI_API_KEY!)
const model = genAI.getGenerativeModel({ model: 'gemini-2.5-flash' })

// ─── Config ──────────────────────────────────────────────────────────────────

const PHOTOS_DIR = resolve(__dirname, '../public/annual-report-photos')
const DRY_RUN = process.argv.includes('--dry-run')
const YEAR_FILTER = process.argv.find(a => a.startsWith('--year='))?.split('=')?.[1]
const LIMIT = parseInt(process.argv.find(a => a.startsWith('--limit='))?.split('=')?.[1] || '0')
const RATE_LIMIT_MS = 4500 // Gemini free tier: 15 RPM → ~4s between calls

// ─── Types ───────────────────────────────────────────────────────────────────

interface PhotoAnalysis {
  description: string
  alt_text: string
  tags: string[]
  people_count: number
  setting: 'indoor' | 'outdoor' | 'aerial' | 'mixed'
  content_type: 'portrait' | 'group' | 'landscape' | 'event' | 'building' | 'document' | 'artwork' | 'activity'
  hero_quality: boolean
  cultural_sensitivity: 'low' | 'medium' | 'high'
  palm_island_relevant: boolean
}

// ─── Helpers ─────────────────────────────────────────────────────────────────

function sleep(ms: number) {
  return new Promise(resolve => setTimeout(resolve, ms))
}

async function getImageDirs(): Promise<string[]> {
  const entries = await fs.readdir(PHOTOS_DIR, { withFileTypes: true })
  return entries
    .filter(e => e.isDirectory() && !e.name.startsWith('.'))
    .map(e => e.name)
    .filter(name => !YEAR_FILTER || name === YEAR_FILTER)
    .sort()
}

async function getImagesInDir(dir: string): Promise<string[]> {
  const fullPath = join(PHOTOS_DIR, dir)
  const entries = await fs.readdir(fullPath)
  return entries
    .filter(f => /\.(jpg|jpeg|png|webp)$/i.test(f))
    .sort()
}

function getMimeType(filename: string): string {
  const ext = filename.toLowerCase().split('.').pop()
  if (ext === 'png') return 'image/png'
  if (ext === 'webp') return 'image/webp'
  return 'image/jpeg'
}

async function analyzeImage(imagePath: string, fiscalYear: string): Promise<PhotoAnalysis> {
  const imageData = await fs.readFile(imagePath)
  const base64 = imageData.toString('base64')
  const mimeType = getMimeType(basename(imagePath))

  const prompt = `Analyze this photo from a Palm Island Community Company annual report (fiscal year ${fiscalYear}).

Return a JSON object with these fields:
- description: 1-2 sentence description of what's in the image
- alt_text: concise alt text for accessibility (max 125 chars)
- tags: array of descriptive tags (e.g., ["community", "children", "outdoor", "event", "sport"])
- people_count: number of people visible (0 if none, estimate if crowd)
- setting: "indoor" | "outdoor" | "aerial" | "mixed"
- content_type: "portrait" | "group" | "landscape" | "event" | "building" | "document" | "artwork" | "activity"
- hero_quality: true if this is a striking, high-quality image suitable as a hero/banner image
- cultural_sensitivity: "low" | "medium" | "high" — high for ceremony/sacred, medium for identifiable individuals
- palm_island_relevant: true if clearly shows Palm Island community, landscape, or activities

Return ONLY valid JSON, no markdown fences.`

  const result = await model.generateContent([
    {
      inlineData: {
        mimeType,
        data: base64,
      },
    },
    { text: prompt },
  ])

  const text = result.response.text()

  try {
    const cleaned = text.replace(/```json?\n?/g, '').replace(/```/g, '').trim()
    return JSON.parse(cleaned)
  } catch {
    return {
      description: 'Unanalyzed photo from Palm Island annual report',
      alt_text: 'Palm Island annual report photo',
      tags: ['annual-report', 'untagged'],
      people_count: 0,
      setting: 'mixed',
      content_type: 'activity',
      hero_quality: false,
      cultural_sensitivity: 'low',
      palm_island_relevant: true,
    }
  }
}

// ─── Main ────────────────────────────────────────────────────────────────────

async function main() {
  console.log('═══════════════════════════════════════')
  console.log(' Photo Tagging — Annual Report Photos')
  console.log('═══════════════════════════════════════')
  if (DRY_RUN) console.log('🔍 DRY RUN — no database writes')
  console.log(`Using: Gemini 2.0 Flash (${RATE_LIMIT_MS}ms rate limit)\n`)

  const yearDirs = await getImageDirs()
  console.log(`Found ${yearDirs.length} year directories: ${yearDirs.join(', ')}`)

  let totalProcessed = 0
  let totalSkipped = 0
  let totalErrors = 0
  let heroImages: { path: string; year: string; description: string }[] = []

  for (const yearDir of yearDirs) {
    const images = await getImagesInDir(yearDir)
    console.log(`\n📁 ${yearDir}: ${images.length} images`)

    for (const imageFile of images) {
      if (LIMIT && totalProcessed >= LIMIT) break

      const imagePath = join(PHOTOS_DIR, yearDir, imageFile)
      const publicPath = `/annual-report-photos/${yearDir}/${imageFile}`

      // Check if already tagged
      const { data: existing } = await supabase
        .from('media_files')
        .select('id')
        .eq('file_path', publicPath)
        .single()

      if (existing) {
        totalSkipped++
        continue
      }

      try {
        await sleep(RATE_LIMIT_MS)
        const analysis = await analyzeImage(imagePath, yearDir)

        if (analysis.hero_quality) {
          heroImages.push({
            path: publicPath,
            year: yearDir,
            description: analysis.description,
          })
        }

        if (!DRY_RUN) {
          const { error } = await supabase.from('media_files').insert({
            filename: imageFile,
            original_filename: imageFile,
            file_path: publicPath,
            public_url: publicPath,
            bucket_name: 'story-media',
            tenant_id: '9c4e5de2-d80a-4e0b-8a89-1bbf09485532',
            file_type: 'image',
            mime_type: getMimeType(imageFile),
            title: analysis.alt_text,
            alt_text: analysis.alt_text,
            description: analysis.description,
            tags: [
              'annual-report',
              yearDir,
              ...analysis.tags,
              ...(analysis.hero_quality ? ['hero-quality'] : []),
            ],
            page_context: 'annual-report',
            page_section: yearDir,
            is_public: true,
            is_featured: analysis.hero_quality,
            metadata: {
              fiscal_year: yearDir,
              people_count: analysis.people_count,
              setting: analysis.setting,
              content_type: analysis.content_type,
              cultural_sensitivity: analysis.cultural_sensitivity,
              palm_island_relevant: analysis.palm_island_relevant,
              ai_analyzed_at: new Date().toISOString(),
              ai_model: 'gemini-2.5-flash',
            },
          })

          if (error) {
            console.error(`  ❌ ${imageFile}: ${error.message}`)
            totalErrors++
            continue
          }
        }

        console.log(`  ✅ ${imageFile}: ${analysis.description.slice(0, 80)}`)
        totalProcessed++
      } catch (err) {
        console.error(`  ❌ ${imageFile}: ${err instanceof Error ? err.message : err}`)
        totalErrors++
      }
    }
    if (LIMIT && totalProcessed >= LIMIT) break
  }

  // Write hero images manifest
  if (heroImages.length > 0) {
    console.log(`\n⭐ Hero-quality images found: ${heroImages.length}`)
    for (const hero of heroImages) {
      console.log(`  ${hero.year}: ${hero.path} — ${hero.description}`)
    }

    if (!DRY_RUN) {
      const manifestDir = resolve(__dirname, '../content')
      await fs.mkdir(manifestDir, { recursive: true })
      const manifestPath = join(manifestDir, 'photo-manifest.json')
      await fs.writeFile(
        manifestPath,
        JSON.stringify(
          {
            generated_at: new Date().toISOString(),
            total_processed: totalProcessed,
            hero_images: heroImages,
          },
          null,
          2
        )
      )
      console.log(`\n📝 Manifest written to content/photo-manifest.json`)
    }
  }

  console.log(`\n═══════════════════════════════════════`)
  console.log(`Processed: ${totalProcessed}`)
  console.log(`Skipped (already tagged): ${totalSkipped}`)
  console.log(`Errors: ${totalErrors}`)
  console.log(`Hero images: ${heroImages.length}`)
}

main().catch(err => {
  console.error('Fatal error:', err)
  process.exit(1)
})
