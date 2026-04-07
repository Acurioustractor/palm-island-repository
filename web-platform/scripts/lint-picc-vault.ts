/**
 * PICC Knowledge Vault Linter
 *
 * Audits the Empathy Ledger for data quality issues:
 * - Themes mentioned in only 1 quote (signal vs noise)
 * - Quotes with missing themes
 * - Storytellers with only 1 quote (incomplete capture)
 * - Transcripts not yet analysed
 * - Quotes pending approval
 * - Duplicate quote text
 *
 * Writes report to picc-vault/lint-report.json + log
 *
 * Usage: npx tsx scripts/lint-picc-vault.ts
 */

import { createClient } from '@supabase/supabase-js'
import * as fs from 'fs'
import * as path from 'path'
import 'dotenv/config'

const EL_URL = 'https://yvnuayzslukamizrlhwb.supabase.co'
const PICC_ORG_ID = '084f851c-72e0-41fb-b5ba-f3088f44862d'

const elKey = process.env.EMPATHY_LEDGER_SERVICE_KEY || process.env.SUPABASE_SERVICE_ROLE_KEY
if (!elKey) { console.error('❌ Missing service key'); process.exit(1) }

const el = createClient(EL_URL, elKey)

interface LintIssue {
  severity: 'info' | 'warn' | 'error'
  category: string
  message: string
  count?: number
}

async function main() {
  console.log('🔍 Linting PICC vault...\n')

  // Fetch all data
  let allQuotes: any[] = []
  let offset = 0
  while (true) {
    const { data } = await el
      .from('extracted_quotes')
      .select('id, quote_text, author_name, themes, sentiment, impact_score, approval_status, source_id')
      .eq('organization_id', PICC_ORG_ID)
      .range(offset, offset + 999)
    if (!data || data.length === 0) break
    allQuotes.push(...data)
    if (data.length < 1000) break
    offset += 1000
  }

  const { data: transcripts } = await el
    .from('transcripts')
    .select('id, title, ai_processing_status, word_count')
    .eq('organization_id', PICC_ORG_ID)

  const issues: LintIssue[] = []

  // Check 1: Themes with only 1 quote (noise)
  const themeCounts = new Map<string, number>()
  for (const q of allQuotes) {
    for (const t of q.themes || []) {
      themeCounts.set(t, (themeCounts.get(t) || 0) + 1)
    }
  }
  const singletonThemes = Array.from(themeCounts.entries()).filter(([, n]) => n === 1)
  if (singletonThemes.length > 0) {
    issues.push({
      severity: 'info',
      category: 'theme_noise',
      message: `${singletonThemes.length} themes appear in only 1 quote (likely noise, not patterns)`,
      count: singletonThemes.length,
    })
  }

  // Check 2: Quotes with no themes
  const noThemeQuotes = allQuotes.filter(q => !Array.isArray(q.themes) || q.themes.length === 0)
  if (noThemeQuotes.length > 0) {
    issues.push({
      severity: 'warn',
      category: 'missing_themes',
      message: `${noThemeQuotes.length} quotes have no themes extracted (re-analyse?)`,
      count: noThemeQuotes.length,
    })
  }

  // Check 3: Storytellers with only 1 quote
  const authorCounts = new Map<string, number>()
  for (const q of allQuotes) {
    const name = (q.author_name || '').trim()
    if (!name || name.toLowerCase() === 'unknown') continue
    authorCounts.set(name, (authorCounts.get(name) || 0) + 1)
  }
  const singletonAuthors = Array.from(authorCounts.entries()).filter(([, n]) => n === 1)
  if (singletonAuthors.length > 0) {
    issues.push({
      severity: 'info',
      category: 'thin_voices',
      message: `${singletonAuthors.length} storytellers have only 1 quote (capture more from them)`,
      count: singletonAuthors.length,
    })
  }

  // Check 4: Transcripts not analysed
  const pending = (transcripts || []).filter(t => t.ai_processing_status !== 'analyzed')
  if (pending.length > 0) {
    issues.push({
      severity: 'warn',
      category: 'pending_analysis',
      message: `${pending.length} transcripts haven't been analysed by AI yet`,
      count: pending.length,
    })
  }

  // Check 5: Quotes pending approval
  const pendingApproval = allQuotes.filter(q => q.approval_status === 'pending').length
  if (pendingApproval > 0) {
    issues.push({
      severity: 'info',
      category: 'pending_approval',
      message: `${pendingApproval} quotes are awaiting community approval`,
      count: pendingApproval,
    })
  }

  // Check 6: Duplicate quote text
  const seen = new Map<string, number>()
  for (const q of allQuotes) {
    const key = (q.quote_text || '').trim().toLowerCase().substring(0, 100)
    if (!key) continue
    seen.set(key, (seen.get(key) || 0) + 1)
  }
  const dupes = Array.from(seen.entries()).filter(([, n]) => n > 1)
  if (dupes.length > 0) {
    issues.push({
      severity: 'warn',
      category: 'duplicates',
      message: `${dupes.length} duplicate quotes (same text used multiple times)`,
      count: dupes.length,
    })
  }

  // Check 7: Anonymous quotes
  const anonymous = allQuotes.filter(q => {
    const n = (q.author_name || '').trim().toLowerCase()
    return !n || n === 'unknown'
  }).length
  if (anonymous > 0) {
    issues.push({
      severity: 'info',
      category: 'anonymous_voices',
      message: `${anonymous} quotes have no named author (need attribution)`,
      count: anonymous,
    })
  }

  // Compile report
  const report = {
    generated_at: new Date().toISOString(),
    total_quotes: allQuotes.length,
    total_transcripts: transcripts?.length || 0,
    total_themes: themeCounts.size,
    total_storytellers: authorCounts.size,
    issues,
    health_score: Math.max(0, Math.min(100, 100 - issues.filter(i => i.severity === 'error').length * 20 - issues.filter(i => i.severity === 'warn').length * 5)),
  }

  // Write report
  const outDir = path.resolve('./picc-vault')
  if (!fs.existsSync(outDir)) fs.mkdirSync(outDir, { recursive: true })
  fs.writeFileSync(path.join(outDir, 'lint-report.json'), JSON.stringify(report, null, 2))

  // Write markdown version
  const lines: string[] = ['# Vault Lint Report', '']
  lines.push(`Generated ${new Date().toISOString()}`, '')
  lines.push(`**Health Score: ${report.health_score}/100**`, '')
  lines.push('## Stats', '')
  lines.push(`- ${report.total_quotes} quotes`)
  lines.push(`- ${report.total_transcripts} transcripts`)
  lines.push(`- ${report.total_themes} themes`)
  lines.push(`- ${report.total_storytellers} storytellers`, '')
  lines.push('## Issues', '')
  for (const issue of issues) {
    const icon = issue.severity === 'error' ? '🔴' : issue.severity === 'warn' ? '🟡' : '🔵'
    lines.push(`- ${icon} **${issue.category}** — ${issue.message}`)
  }
  fs.writeFileSync(path.join(outDir, 'lint-report.md'), lines.join('\n'))

  // Print summary
  console.log(`📊 Quotes: ${report.total_quotes}`)
  console.log(`📝 Transcripts: ${report.total_transcripts}`)
  console.log(`🏷️  Themes: ${report.total_themes}`)
  console.log(`🎤 Storytellers: ${report.total_storytellers}`)
  console.log(`💯 Health: ${report.health_score}/100\n`)
  console.log(`Issues found: ${issues.length}`)
  for (const issue of issues) {
    const icon = issue.severity === 'error' ? '🔴' : issue.severity === 'warn' ? '🟡' : '🔵'
    console.log(`  ${icon} ${issue.message}`)
  }
  console.log(`\n📄 Reports written to:`)
  console.log(`   ${path.join(outDir, 'lint-report.json')}`)
  console.log(`   ${path.join(outDir, 'lint-report.md')}`)
}

main().catch(e => { console.error('❌', e); process.exit(1) })
