/**
 * PICC Knowledge Vault Generator
 *
 * Compiles the Empathy Ledger into a navigable Obsidian-compatible wiki.
 * Run this any time to regenerate the vault from the latest EL data.
 *
 * Output structure:
 *   picc-vault/
 *     storytellers/   — one page per named voice
 *     themes/         — one page per extracted theme
 *     transcripts/    — one page per analysed interview
 *     projects/       — one page per PICC project
 *     services/       — one page per PICC service
 *     index.md        — master catalog
 *     log.md          — generation timestamp & stats
 *
 * Usage: npx tsx scripts/generate-picc-vault.ts [output-dir]
 */

import { createClient } from '@supabase/supabase-js'
import * as fs from 'fs'
import * as path from 'path'
import 'dotenv/config'

const EL_URL = 'https://yvnuayzslukamizrlhwb.supabase.co'
const PICC_ORG_ID = '084f851c-72e0-41fb-b5ba-f3088f44862d'

const elKey = process.env.EMPATHY_LEDGER_SERVICE_KEY || process.env.SUPABASE_SERVICE_ROLE_KEY
if (!elKey) {
  console.error('❌ Missing EMPATHY_LEDGER_SERVICE_KEY or SUPABASE_SERVICE_ROLE_KEY')
  process.exit(1)
}

const el = createClient(EL_URL, elKey)

const piccUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!
const piccKey = process.env.SUPABASE_SERVICE_ROLE_KEY!
const picc = createClient(piccUrl, piccKey)

// Output directory
const OUT_DIR = path.resolve(process.argv[2] || './picc-vault')

// ---------------------------------------------------------------------------
// Helpers
// ---------------------------------------------------------------------------

function slugify(s: string): string {
  return (s || '')
    .toLowerCase()
    .trim()
    .replace(/[^\w\s-]/g, '')
    .replace(/\s+/g, '-')
    .replace(/-+/g, '-')
    .substring(0, 80)
}

function normalizeAuthor(name: string | null | undefined): string {
  const raw = (name || '').trim()
  if (!raw || raw.toLowerCase() === 'unknown') return 'Community Member'
  return raw
}

function wikiLink(title: string): string {
  return `[[${title}]]`
}

function ensureDir(dir: string) {
  if (!fs.existsSync(dir)) fs.mkdirSync(dir, { recursive: true })
}

function writeFile(filePath: string, content: string) {
  ensureDir(path.dirname(filePath))
  fs.writeFileSync(filePath, content, 'utf8')
}

function frontmatter(meta: Record<string, any>): string {
  const lines = ['---']
  for (const [k, v] of Object.entries(meta)) {
    if (v == null) continue
    if (Array.isArray(v)) {
      lines.push(`${k}:`)
      for (const item of v) lines.push(`  - ${item}`)
    } else {
      lines.push(`${k}: ${typeof v === 'string' ? `"${v.replace(/"/g, '\\"')}"` : v}`)
    }
  }
  lines.push('---', '')
  return lines.join('\n')
}

// ---------------------------------------------------------------------------
// Data fetching
// ---------------------------------------------------------------------------

async function fetchAll() {
  console.log('📥 Fetching from Empathy Ledger...')

  // Quotes — paginated
  let allQuotes: any[] = []
  let offset = 0
  while (true) {
    const { data, error } = await el
      .from('extracted_quotes')
      .select('id, quote_text, author_name, themes, sentiment, impact_score, category, source_id, source_type, project_id, approval_status')
      .eq('organization_id', PICC_ORG_ID)
      .order('impact_score', { ascending: false })
      .range(offset, offset + 999)
    if (error || !data || data.length === 0) break
    allQuotes.push(...data)
    if (data.length < 1000) break
    offset += 1000
  }
  console.log(`  ✓ ${allQuotes.length} quotes`)

  // Transcripts
  const { data: transcripts } = await el
    .from('transcripts')
    .select('id, title, ai_summary, ai_processing_status, themes, word_count, storyteller_id, project_id, key_quotes, ai_model_version, recording_date')
    .eq('organization_id', PICC_ORG_ID)
    .order('word_count', { ascending: false })
    .limit(500)
  console.log(`  ✓ ${transcripts?.length || 0} transcripts`)

  // Storytellers
  const { data: storytellers } = await el
    .from('storytellers')
    .select('id, display_name, location, profile_id, cultural_background')
    .ilike('location', '%palm%')
    .limit(200)
  console.log(`  ✓ ${storytellers?.length || 0} storytellers`)

  // Projects
  const { data: projects } = await el
    .from('projects')
    .select('id, name, slug, description')
    .eq('organization_id', PICC_ORG_ID)
  console.log(`  ✓ ${projects?.length || 0} projects`)

  // PICC services (from PICC DB)
  const { data: services } = await picc
    .from('organization_services')
    .select('name, slug, description, service_category')
    .order('name')
  console.log(`  ✓ ${services?.length || 0} services`)

  return {
    quotes: allQuotes,
    transcripts: transcripts || [],
    storytellers: storytellers || [],
    projects: projects || [],
    services: services || [],
  }
}

// ---------------------------------------------------------------------------
// Generators
// ---------------------------------------------------------------------------

function generateStorytellerPages(quotes: any[], outDir: string) {
  // Group quotes by author
  const byAuthor = new Map<string, any[]>()
  for (const q of quotes) {
    const name = normalizeAuthor(q.author_name)
    if (!byAuthor.has(name)) byAuthor.set(name, [])
    byAuthor.get(name)!.push(q)
  }

  let count = 0
  for (const [name, voiceQuotes] of byAuthor.entries()) {
    if (name === 'Community Member' || voiceQuotes.length < 1) continue

    // Aggregate themes for this person
    const themeSet = new Set<string>()
    for (const q of voiceQuotes) {
      for (const t of q.themes || []) themeSet.add(t)
    }

    // Sort quotes by impact
    const sorted = voiceQuotes.sort((a, b) => (b.impact_score || 0) - (a.impact_score || 0))

    const lines: string[] = []
    lines.push(frontmatter({
      type: 'storyteller',
      name,
      quote_count: voiceQuotes.length,
      themes: Array.from(themeSet).slice(0, 10),
      tags: ['storyteller', 'picc'],
    }))

    lines.push(`# ${name}`, '')
    lines.push(`> ${voiceQuotes.length} quotes captured in the Empathy Ledger`, '')

    if (themeSet.size > 0) {
      lines.push('## Themes', '')
      lines.push(
        Array.from(themeSet).slice(0, 12).map(t => wikiLink(t.replace(/_/g, ' '))).join(' · '),
        ''
      )
    }

    lines.push('## Voices', '')
    for (const q of sorted.slice(0, 30)) {
      const themes = (q.themes || []).slice(0, 2).map((t: string) => wikiLink(t.replace(/_/g, ' '))).join(' · ')
      lines.push(`> "${q.quote_text}"`)
      const meta: string[] = []
      if (q.impact_score) meta.push(`impact ${q.impact_score}`)
      if (q.sentiment) meta.push(q.sentiment)
      if (themes) meta.push(themes)
      if (meta.length > 0) lines.push(`> — *${meta.join(' · ')}*`)
      lines.push('')
    }

    if (sorted.length > 30) {
      lines.push(`*+ ${sorted.length - 30} more quotes*`, '')
    }

    lines.push('---', '')
    lines.push(`Source: Empathy Ledger · Generated ${new Date().toISOString().split('T')[0]}`)

    writeFile(path.join(outDir, 'storytellers', `${slugify(name)}.md`), lines.join('\n'))
    count++
  }
  console.log(`  ✓ Wrote ${count} storyteller pages`)
  return count
}

function generateThemePages(quotes: any[], outDir: string) {
  const byTheme = new Map<string, any[]>()
  for (const q of quotes) {
    for (const t of q.themes || []) {
      if (!byTheme.has(t)) byTheme.set(t, [])
      byTheme.get(t)!.push(q)
    }
  }

  let count = 0
  for (const [theme, themeQuotes] of byTheme.entries()) {
    if (themeQuotes.length < 2) continue // Skip single-mention themes

    const sorted = themeQuotes.sort((a, b) => (b.impact_score || 0) - (a.impact_score || 0))
    const display = theme.replace(/_/g, ' ')
    const authors = new Set<string>()
    for (const q of themeQuotes) authors.add(normalizeAuthor(q.author_name))

    const lines: string[] = []
    lines.push(frontmatter({
      type: 'theme',
      theme: display,
      quote_count: themeQuotes.length,
      voice_count: authors.size,
      tags: ['theme', 'picc'],
    }))

    lines.push(`# ${display}`, '')
    lines.push(`> ${themeQuotes.length} quotes from ${authors.size} ${authors.size === 1 ? 'voice' : 'voices'}`, '')

    lines.push('## Voices on this theme', '')
    for (const q of sorted.slice(0, 25)) {
      const author = normalizeAuthor(q.author_name)
      lines.push(`> "${q.quote_text}"`)
      lines.push(`> — ${wikiLink(author)}`)
      lines.push('')
    }

    if (sorted.length > 25) {
      lines.push(`*+ ${sorted.length - 25} more quotes*`, '')
    }

    lines.push('## Storytellers', '')
    lines.push(Array.from(authors).map(a => wikiLink(a)).join(' · '), '')

    lines.push('---', '')
    lines.push(`Source: Empathy Ledger · Generated ${new Date().toISOString().split('T')[0]}`)

    writeFile(path.join(outDir, 'themes', `${slugify(theme)}.md`), lines.join('\n'))
    count++
  }
  console.log(`  ✓ Wrote ${count} theme pages`)
  return count
}

function generateTranscriptPages(transcripts: any[], outDir: string) {
  let count = 0
  for (const t of transcripts) {
    if (!t.ai_summary && (!t.themes || t.themes.length === 0)) continue

    const lines: string[] = []
    lines.push(frontmatter({
      type: 'transcript',
      title: t.title || 'Untitled',
      word_count: t.word_count,
      analyzed: t.ai_processing_status === 'analyzed',
      model: t.ai_model_version,
      recording_date: t.recording_date,
      themes: t.themes?.slice(0, 8),
      tags: ['transcript', 'picc'],
    }))

    lines.push(`# ${t.title || 'Untitled Interview'}`, '')

    const meta: string[] = []
    if (t.word_count) meta.push(`${t.word_count.toLocaleString()} words`)
    if (t.ai_model_version) meta.push(`analyzed by ${t.ai_model_version}`)
    if (t.recording_date) meta.push(t.recording_date)
    if (meta.length > 0) lines.push(`> ${meta.join(' · ')}`, '')

    if (t.ai_summary) {
      lines.push('## Summary', '', t.ai_summary, '')
    }

    if (Array.isArray(t.themes) && t.themes.length > 0) {
      lines.push('## Themes', '')
      lines.push(t.themes.map((th: string) => wikiLink(th.replace(/_/g, ' '))).join(' · '), '')
    }

    if (Array.isArray(t.key_quotes) && t.key_quotes.length > 0) {
      lines.push('## Key quotes', '')
      for (const q of t.key_quotes) {
        lines.push(`> "${q}"`, '')
      }
    }

    lines.push('---', '')
    lines.push(`Source: Empathy Ledger · Generated ${new Date().toISOString().split('T')[0]}`)

    writeFile(path.join(outDir, 'transcripts', `${slugify(t.title || t.id)}.md`), lines.join('\n'))
    count++
  }
  console.log(`  ✓ Wrote ${count} transcript pages`)
  return count
}

function generateProjectPages(projects: any[], quotes: any[], outDir: string) {
  let count = 0
  for (const p of projects) {
    const projectQuotes = quotes.filter(q => q.project_id === p.id)
    const authors = new Set<string>()
    for (const q of projectQuotes) authors.add(normalizeAuthor(q.author_name))

    const lines: string[] = []
    lines.push(frontmatter({
      type: 'project',
      name: p.name,
      slug: p.slug,
      quote_count: projectQuotes.length,
      voice_count: authors.size,
      tags: ['project', 'picc'],
    }))

    lines.push(`# ${p.name}`, '')
    if (p.description) lines.push(p.description, '')
    lines.push(`> ${projectQuotes.length} quotes from ${authors.size} voices`, '')

    if (projectQuotes.length > 0) {
      lines.push('## Voices from this project', '')
      const top = projectQuotes
        .sort((a, b) => (b.impact_score || 0) - (a.impact_score || 0))
        .slice(0, 15)
      for (const q of top) {
        lines.push(`> "${q.quote_text}"`)
        lines.push(`> — ${wikiLink(normalizeAuthor(q.author_name))}`)
        lines.push('')
      }
    }

    if (authors.size > 0) {
      lines.push('## Storytellers', '')
      lines.push(Array.from(authors).map(a => wikiLink(a)).join(' · '), '')
    }

    lines.push('---', '')
    lines.push(`Source: Empathy Ledger · Generated ${new Date().toISOString().split('T')[0]}`)

    writeFile(path.join(outDir, 'projects', `${slugify(p.name)}.md`), lines.join('\n'))
    count++
  }
  console.log(`  ✓ Wrote ${count} project pages`)
  return count
}

function generateServicePages(services: any[], outDir: string) {
  let count = 0
  for (const s of services) {
    const lines: string[] = []
    lines.push(frontmatter({
      type: 'service',
      name: s.name,
      slug: s.slug,
      category: s.service_category,
      tags: ['service', 'picc'],
    }))

    lines.push(`# ${s.name}`, '')
    if (s.description) lines.push(s.description, '')

    lines.push('---', '')
    lines.push(`Source: PICC Services · Generated ${new Date().toISOString().split('T')[0]}`)

    writeFile(path.join(outDir, 'services', `${slugify(s.name)}.md`), lines.join('\n'))
    count++
  }
  console.log(`  ✓ Wrote ${count} service pages`)
  return count
}

function generateIndex(stats: Record<string, number>, outDir: string) {
  const lines: string[] = []
  lines.push(frontmatter({
    type: 'index',
    title: 'PICC Knowledge Vault',
    generated: new Date().toISOString(),
  }))

  lines.push('# PICC Knowledge Vault', '')
  lines.push('> Sovereign data from the Empathy Ledger, compiled into a navigable wiki.', '')
  lines.push('Open this folder in Obsidian to browse the entire community knowledge graph.', '')

  lines.push('## Contents', '')
  lines.push(`- **${stats.storytellers}** [[Storytellers]]`)
  lines.push(`- **${stats.themes}** [[Themes]]`)
  lines.push(`- **${stats.transcripts}** [[Transcripts]]`)
  lines.push(`- **${stats.projects}** [[Projects]]`)
  lines.push(`- **${stats.services}** [[Services]]`)
  lines.push(`- **${stats.quotes}** total quotes from the Empathy Ledger`, '')

  lines.push('## How this vault works', '')
  lines.push('Every voice in this vault came from a real PICC community member.')
  lines.push('Every theme was extracted by AI analysis (MiniMax-M2.5).')
  lines.push('Every link is a backlink Obsidian can follow.', '')
  lines.push('This vault is **regenerated** from the Empathy Ledger any time.')
  lines.push('It is a *view* of the sovereign data, not the data itself.', '')

  lines.push('## Folders', '')
  lines.push('- `storytellers/` — one page per named voice with all their quotes')
  lines.push('- `themes/` — one page per theme with every quote tagged to it')
  lines.push('- `transcripts/` — one page per analysed interview')
  lines.push('- `projects/` — one page per PICC project')
  lines.push('- `services/` — one page per PICC service', '')

  lines.push('---', '')
  lines.push('PICC × A Curious Tractor — The Sovereignty of Care')

  writeFile(path.join(outDir, 'index.md'), lines.join('\n'))
}

function generateLog(stats: Record<string, number>, durationMs: number, outDir: string) {
  const now = new Date().toISOString()
  const existing = fs.existsSync(path.join(outDir, 'log.md'))
    ? fs.readFileSync(path.join(outDir, 'log.md'), 'utf8')
    : '# Generation log\n\n'

  const newEntry = [
    `## ${now}`,
    `- Storytellers: ${stats.storytellers}`,
    `- Themes: ${stats.themes}`,
    `- Transcripts: ${stats.transcripts}`,
    `- Projects: ${stats.projects}`,
    `- Services: ${stats.services}`,
    `- Total quotes: ${stats.quotes}`,
    `- Duration: ${(durationMs / 1000).toFixed(1)}s`,
    '',
  ].join('\n')

  writeFile(path.join(outDir, 'log.md'), existing + newEntry)
}

// ---------------------------------------------------------------------------
// Main
// ---------------------------------------------------------------------------

async function main() {
  const startTime = Date.now()

  console.log('🔨 PICC Knowledge Vault Generator')
  console.log(`📂 Output: ${OUT_DIR}\n`)

  // Fresh generation
  if (fs.existsSync(OUT_DIR)) {
    console.log('🧹 Cleaning existing vault...')
    for (const sub of ['storytellers', 'themes', 'transcripts', 'projects', 'services']) {
      const dir = path.join(OUT_DIR, sub)
      if (fs.existsSync(dir)) fs.rmSync(dir, { recursive: true })
    }
  }

  const data = await fetchAll()

  console.log('\n📝 Generating wiki pages...')
  const stats = {
    storytellers: generateStorytellerPages(data.quotes, OUT_DIR),
    themes: generateThemePages(data.quotes, OUT_DIR),
    transcripts: generateTranscriptPages(data.transcripts, OUT_DIR),
    projects: generateProjectPages(data.projects, data.quotes, OUT_DIR),
    services: generateServicePages(data.services, OUT_DIR),
    quotes: data.quotes.length,
  }

  generateIndex(stats, OUT_DIR)
  generateLog(stats, Date.now() - startTime, OUT_DIR)

  const totalPages =
    stats.storytellers + stats.themes + stats.transcripts + stats.projects + stats.services + 2

  console.log('')
  console.log('═'.repeat(50))
  console.log(`✅ Generated ${totalPages} markdown pages`)
  console.log(`⏱️  ${((Date.now() - startTime) / 1000).toFixed(1)}s`)
  console.log(`📂 ${OUT_DIR}`)
  console.log('═'.repeat(50))
  console.log('')
  console.log('💡 To browse: open the folder in Obsidian')
  console.log(`   File → Open Vault → Open folder as vault → ${OUT_DIR}`)
}

main().catch(e => {
  console.error('❌ Error:', e)
  process.exit(1)
})
