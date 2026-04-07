/**
 * PICC Raw Intake Watcher
 *
 * Drop a markdown or text file into raw-intake/ and this script will:
 * 1. Read it
 * 2. Push it to the Empathy Ledger as a transcript
 * 3. Trigger MiniMax analysis
 * 4. Move the file to raw-intake/processed/
 *
 * Usage:
 *   npx tsx scripts/intake-raw-folder.ts                    # process once
 *   npx tsx scripts/intake-raw-folder.ts --watch            # watch continuously
 */

import { createClient } from '@supabase/supabase-js'
import * as fs from 'fs'
import * as path from 'path'
import 'dotenv/config'

const EL_URL = 'https://yvnuayzslukamizrlhwb.supabase.co'
const PICC_ORG_ID = '084f851c-72e0-41fb-b5ba-f3088f44862d'
const RAW_DIR = path.resolve('./raw-intake')
const PROCESSED_DIR = path.join(RAW_DIR, 'processed')

const elKey = process.env.EMPATHY_LEDGER_SERVICE_KEY || process.env.SUPABASE_SERVICE_ROLE_KEY
if (!elKey) { console.error('❌ Missing service key'); process.exit(1) }

const el = createClient(EL_URL, elKey)

// ---------------------------------------------------------------------------
// File processing
// ---------------------------------------------------------------------------

async function processFile(filePath: string): Promise<boolean> {
  const filename = path.basename(filePath)
  const content = fs.readFileSync(filePath, 'utf8')

  if (content.length < 100) {
    console.log(`  ⚠️  ${filename} too short, skipping`)
    return false
  }

  // Strip frontmatter if present
  let body = content
  let title = filename.replace(/\.(md|txt)$/, '').replace(/[-_]/g, ' ')
  const fmMatch = content.match(/^---\s*\n([\s\S]*?)\n---\s*\n([\s\S]*)$/)
  if (fmMatch) {
    body = fmMatch[2]
    const titleMatch = fmMatch[1].match(/title:\s*["']?([^"'\n]+)["']?/)
    if (titleMatch) title = titleMatch[1].trim()
  }

  console.log(`  📝 ${title} (${body.length} chars)`)

  try {
    // Create transcript in EL
    const { data: transcript, error } = await el
      .from('transcripts')
      .insert({
        organization_id: PICC_ORG_ID,
        title,
        content: body,
        transcript_content: body,
        word_count: body.split(/\s+/).length,
        ai_processing_status: 'not_started',
        privacy_level: 'community',
        cultural_sensitivity: 'standard',
        metadata: {
          source: 'raw_intake',
          original_filename: filename,
          ingested_at: new Date().toISOString(),
        },
      })
      .select('id, title')
      .single()

    if (error || !transcript) {
      console.log(`  ❌ Failed: ${error?.message}`)
      return false
    }

    console.log(`  ✅ Created transcript: ${transcript.id}`)
    console.log(`     → Run batch analyzer to extract quotes`)

    // Move to processed
    if (!fs.existsSync(PROCESSED_DIR)) fs.mkdirSync(PROCESSED_DIR, { recursive: true })
    const dest = path.join(PROCESSED_DIR, filename)
    fs.renameSync(filePath, dest)

    return true
  } catch (err) {
    console.log(`  ❌ Error: ${err instanceof Error ? err.message : err}`)
    return false
  }
}

async function processOnce(): Promise<{ processed: number; skipped: number }> {
  if (!fs.existsSync(RAW_DIR)) {
    fs.mkdirSync(RAW_DIR, { recursive: true })
    console.log(`📂 Created ${RAW_DIR}`)
    console.log(`   Drop .md or .txt files here, then re-run.`)
    return { processed: 0, skipped: 0 }
  }

  const files = fs.readdirSync(RAW_DIR).filter(f => {
    if (f.startsWith('.')) return false
    if (f === 'processed') return false
    return /\.(md|txt)$/i.test(f)
  })

  if (files.length === 0) {
    console.log(`📂 ${RAW_DIR} empty — drop .md or .txt files to ingest`)
    return { processed: 0, skipped: 0 }
  }

  console.log(`📥 Processing ${files.length} file(s)...\n`)
  let processed = 0
  let skipped = 0
  for (const f of files) {
    const ok = await processFile(path.join(RAW_DIR, f))
    if (ok) processed++
    else skipped++
  }
  return { processed, skipped }
}

async function main() {
  const watch = process.argv.includes('--watch')

  console.log('🔄 PICC Raw Intake')
  console.log(`📂 Watching: ${RAW_DIR}\n`)

  const result = await processOnce()
  console.log('')
  console.log('═'.repeat(50))
  console.log(`✅ Processed: ${result.processed}`)
  console.log(`⏭  Skipped: ${result.skipped}`)
  console.log('═'.repeat(50))

  if (result.processed > 0) {
    console.log('\n💡 Next: run batch analyzer to extract quotes from new transcripts')
    console.log('   cd /Users/benknight/Code/empathy-ledger-v2 && npx tsx scripts/batch-analyze-picc.ts')
  }

  if (watch) {
    console.log('\n👀 Watching for new files... (Ctrl+C to stop)')
    fs.watch(RAW_DIR, { persistent: true }, async (event, filename) => {
      if (!filename || filename.startsWith('.') || filename === 'processed') return
      if (!/\.(md|txt)$/i.test(filename)) return
      const fullPath = path.join(RAW_DIR, filename)
      if (event === 'rename' && fs.existsSync(fullPath)) {
        // Wait briefly for write to settle
        await new Promise(r => setTimeout(r, 1000))
        if (fs.existsSync(fullPath)) {
          console.log(`\n🆕 ${filename}`)
          await processFile(fullPath)
        }
      }
    })
    // Keep alive
    await new Promise(() => {})
  }
}

main().catch(e => { console.error('❌', e); process.exit(1) })
