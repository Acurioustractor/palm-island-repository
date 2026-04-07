/**
 * PICC Knowledge Vault — Internal Browser
 *
 * The "second brain" for PICC. Browse storytellers, themes, transcripts.
 * See lint health. Drop new sources. Run queries.
 */

import Link from 'next/link'
import * as fs from 'fs'
import * as path from 'path'
import { createClient } from '@supabase/supabase-js'
import {
  Sparkles,
  BookOpen,
  Users,
  Mic,
  Tag,
  AlertCircle,
  CheckCircle2,
  TrendingUp,
  RefreshCw,
  ExternalLink,
  Heart,
  Brain,
} from 'lucide-react'
import { getELQuotes, getELStats, groupQuotesByAuthor, PICC_ORG_ID } from '@/lib/empathy-ledger/el-server'

const EL_URL = 'https://yvnuayzslukamizrlhwb.supabase.co'

export const metadata = {
  title: 'Knowledge Vault | PICC',
  description: 'PICC Knowledge Vault — the second brain for community sovereignty.',
}

export const dynamic = 'force-dynamic'
export const revalidate = 60

interface LintReport {
  generated_at: string
  total_quotes: number
  total_transcripts: number
  total_themes: number
  total_storytellers: number
  health_score: number
  issues: Array<{
    severity: 'info' | 'warn' | 'error'
    category: string
    message: string
    count?: number
  }>
}

async function getLintReport(): Promise<LintReport | null> {
  try {
    const reportPath = path.resolve(process.cwd(), 'picc-vault', 'lint-report.json')
    if (!fs.existsSync(reportPath)) return null
    return JSON.parse(fs.readFileSync(reportPath, 'utf8'))
  } catch {
    return null
  }
}

async function getVaultData() {
  const elKey = process.env.EMPATHY_LEDGER_SERVICE_KEY || process.env.SUPABASE_SERVICE_ROLE_KEY
  if (!elKey) return null

  const client = createClient(EL_URL, elKey)

  const [quotes, stats, transcriptsRes, projectsRes] = await Promise.all([
    getELQuotes({ limit: 1500 }),
    getELStats(),
    client
      .from('transcripts')
      .select('id, title, ai_processing_status, word_count, themes, recording_date')
      .eq('organization_id', PICC_ORG_ID)
      .order('word_count', { ascending: false })
      .limit(20),
    client
      .from('projects')
      .select('id, name')
      .eq('organization_id', PICC_ORG_ID),
  ])

  const grouped = groupQuotesByAuthor(quotes)
  const topAuthors = Array.from(grouped.entries())
    .sort((a, b) => b[1].length - a[1].length)
    .slice(0, 12)

  // Theme distribution
  const themeMap = new Map<string, number>()
  for (const q of quotes) {
    for (const t of q.themes || []) {
      themeMap.set(t, (themeMap.get(t) || 0) + 1)
    }
  }
  const topThemes = Array.from(themeMap.entries())
    .sort((a, b) => b[1] - a[1])
    .slice(0, 20)

  return {
    quotes,
    stats,
    transcripts: transcriptsRes.data || [],
    projects: projectsRes.data || [],
    grouped,
    topAuthors,
    topThemes,
    totalThemes: themeMap.size,
    totalAuthors: grouped.size,
  }
}

export default async function VaultBrowserPage() {
  const [data, lint] = await Promise.all([getVaultData(), getLintReport()])

  if (!data) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-warm-50">
        <p className="text-stone-500">Vault unavailable.</p>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-[#FAF8F5]">
      <div className="max-w-6xl mx-auto px-6 py-12">
        {/* ─── HEADER ─── */}
        <div className="mb-12">
          <p className="text-xs font-semibold tracking-[0.2em] uppercase text-picc-ochre mb-3">
            PICC Second Brain · Internal
          </p>
          <h1 className="font-serif text-4xl md:text-5xl text-stone-800 italic mb-3">
            Knowledge Vault
          </h1>
          <p className="text-stone-500 max-w-2xl">
            The complete community knowledge graph. Every voice, theme, transcript,
            and project — sovereign, queryable, regeneratable. Your second brain for
            PICC's stories.
          </p>
        </div>

        {/* ─── HEALTH BAR ─── */}
        {lint && (
          <div className="mb-12 rounded-2xl border border-stone-200 bg-white p-6">
            <div className="flex items-center justify-between mb-4">
              <div>
                <p className="text-xs font-semibold tracking-wide uppercase text-stone-400">Vault health</p>
                <p className="text-3xl font-serif text-stone-800 mt-1">
                  {lint.health_score}<span className="text-stone-300 text-xl">/100</span>
                </p>
              </div>
              <div className="text-xs text-stone-400">
                Last checked: {new Date(lint.generated_at).toLocaleString('en-AU', { day: 'numeric', month: 'short', hour: '2-digit', minute: '2-digit' })}
              </div>
            </div>
            <div className="h-2 bg-stone-100 rounded-full overflow-hidden">
              <div
                className="h-full bg-gradient-to-r from-picc-ochre to-green-500 rounded-full"
                style={{ width: `${lint.health_score}%` }}
              />
            </div>
            <p className="text-xs text-stone-400 mt-3">
              Run <code className="px-1.5 py-0.5 bg-stone-100 rounded text-stone-600">npx tsx scripts/lint-picc-vault.ts</code> to refresh
            </p>
          </div>
        )}

        {/* ─── STATS GRID ─── */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-12">
          <StatCard
            icon={Mic}
            label="Voices"
            value={data.stats.quotes}
            sub="extracted quotes"
          />
          <StatCard
            icon={BookOpen}
            label="Transcripts"
            value={data.stats.transcripts}
            sub="interviews captured"
          />
          <StatCard
            icon={Users}
            label="Storytellers"
            value={data.totalAuthors}
            sub="named voices"
          />
          <StatCard
            icon={Tag}
            label="Themes"
            value={data.totalThemes}
            sub="extracted by AI"
          />
        </div>

        {/* ─── THE FOUR OPERATIONS ─── */}
        <div className="mb-12">
          <h2 className="text-xs font-semibold tracking-[0.2em] uppercase text-picc-ochre mb-4">
            The four operations
          </h2>
          <div className="grid md:grid-cols-2 gap-4">
            <OperationCard
              icon={RefreshCw}
              title="Generate"
              command="npx tsx scripts/generate-picc-vault.ts"
              desc="Compiles the EL into 322+ markdown wiki pages — open in Obsidian"
            />
            <OperationCard
              icon={CheckCircle2}
              title="Lint"
              command="npx tsx scripts/lint-picc-vault.ts"
              desc="Audits for missing themes, duplicates, anonymous voices, pending approvals"
            />
            <OperationCard
              icon={Brain}
              title="Query"
              command="Ask Palm AI"
              desc="The chat interface searches across all 600+ voices with citations"
              href="/chat"
            />
            <OperationCard
              icon={Sparkles}
              title="Showcase"
              command="/empathy-ledger"
              desc="Public showcase page — share with funders, board, community"
              href="/empathy-ledger"
            />
          </div>
        </div>

        {/* ─── LINT ISSUES ─── */}
        {lint && lint.issues.length > 0 && (
          <div className="mb-12">
            <h2 className="text-xs font-semibold tracking-[0.2em] uppercase text-picc-ochre mb-4">
              Lint findings ({lint.issues.length})
            </h2>
            <div className="space-y-2">
              {lint.issues.map((issue, i) => (
                <div
                  key={i}
                  className={`flex items-start gap-3 p-4 rounded-xl border ${
                    issue.severity === 'error'
                      ? 'border-red-200 bg-red-50'
                      : issue.severity === 'warn'
                      ? 'border-amber-200 bg-amber-50'
                      : 'border-blue-200 bg-blue-50'
                  }`}
                >
                  <AlertCircle
                    className={`w-4 h-4 flex-shrink-0 mt-0.5 ${
                      issue.severity === 'error'
                        ? 'text-red-500'
                        : issue.severity === 'warn'
                        ? 'text-amber-500'
                        : 'text-blue-500'
                    }`}
                  />
                  <div>
                    <p className="text-xs font-mono text-stone-400 uppercase tracking-wide">
                      {issue.category}
                    </p>
                    <p className="text-sm text-stone-700 mt-0.5">{issue.message}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* ─── TOP STORYTELLERS ─── */}
        <div className="mb-12">
          <h2 className="text-xs font-semibold tracking-[0.2em] uppercase text-picc-ochre mb-4">
            Top voices in the vault
          </h2>
          <div className="grid md:grid-cols-2 gap-x-12 gap-y-3">
            {data.topAuthors.map(([name, qs], i) => (
              <div
                key={name}
                className="flex items-baseline justify-between border-b border-stone-200 pb-3"
              >
                <div className="flex items-baseline gap-3 min-w-0">
                  <span className="text-xs text-stone-300 font-mono w-6">
                    {String(i + 1).padStart(2, '0')}
                  </span>
                  <span className="text-stone-800 font-medium truncate">{name}</span>
                </div>
                <span className="text-sm text-picc-ochre flex-shrink-0">
                  {qs.length} {qs.length === 1 ? 'quote' : 'quotes'}
                </span>
              </div>
            ))}
          </div>
        </div>

        {/* ─── TOP THEMES ─── */}
        <div className="mb-12">
          <h2 className="text-xs font-semibold tracking-[0.2em] uppercase text-picc-ochre mb-4">
            Most-discussed themes
          </h2>
          <div className="flex flex-wrap gap-2">
            {data.topThemes.map(([theme, count]) => (
              <span
                key={theme}
                className="px-4 py-2 rounded-full bg-white border border-stone-200 text-sm text-stone-700 capitalize"
              >
                {theme.replace(/_/g, ' ')}
                <span className="ml-2 text-xs text-stone-400">{count}</span>
              </span>
            ))}
          </div>
        </div>

        {/* ─── RECENT TRANSCRIPTS ─── */}
        <div className="mb-12">
          <h2 className="text-xs font-semibold tracking-[0.2em] uppercase text-picc-ochre mb-4">
            Largest transcripts
          </h2>
          <div className="space-y-2">
            {data.transcripts.slice(0, 8).map((t: any) => (
              <div
                key={t.id}
                className="flex items-center justify-between p-4 rounded-xl border border-stone-200 bg-white hover:border-picc-ochre transition-colors"
              >
                <div className="min-w-0 flex-1">
                  <p className="text-sm font-semibold text-stone-800 truncate">
                    {t.title || 'Untitled'}
                  </p>
                  <p className="text-xs text-stone-400 mt-0.5">
                    {t.word_count?.toLocaleString() || '?'} words
                    {t.themes && t.themes.length > 0 && ` · ${t.themes.length} themes`}
                  </p>
                </div>
                {t.ai_processing_status === 'analyzed' ? (
                  <CheckCircle2 className="w-4 h-4 text-green-500 flex-shrink-0" />
                ) : (
                  <span className="text-xs text-amber-600 flex-shrink-0">{t.ai_processing_status}</span>
                )}
              </div>
            ))}
          </div>
        </div>

        {/* ─── HOW TO USE ─── */}
        <div className="rounded-2xl bg-[#0B4F6C] text-white p-8">
          <h2 className="font-serif italic text-2xl mb-4">How to use the vault</h2>
          <ol className="space-y-3 text-sm text-white/80">
            <li className="flex gap-3">
              <span className="text-picc-ochre font-bold">1.</span>
              <span>
                Run <code className="px-1.5 py-0.5 bg-white/10 rounded text-picc-ochre">npx tsx scripts/generate-picc-vault.ts</code> to
                compile the latest EL data into <code className="px-1.5 py-0.5 bg-white/10 rounded">picc-vault/</code>
              </span>
            </li>
            <li className="flex gap-3">
              <span className="text-picc-ochre font-bold">2.</span>
              <span>
                Open <code className="px-1.5 py-0.5 bg-white/10 rounded">picc-vault/</code> in Obsidian
                (File → Open Vault → Open folder as vault)
              </span>
            </li>
            <li className="flex gap-3">
              <span className="text-picc-ochre font-bold">3.</span>
              <span>
                Browse storytellers, themes, transcripts, projects with full backlinks
              </span>
            </li>
            <li className="flex gap-3">
              <span className="text-picc-ochre font-bold">4.</span>
              <span>
                Run lint monthly to keep the data healthy. Re-generate any time the EL has new content.
              </span>
            </li>
            <li className="flex gap-3">
              <span className="text-picc-ochre font-bold">5.</span>
              <span>
                Use Ask Palm AI to query across all voices — it cites real sources from the ledger.
              </span>
            </li>
          </ol>
        </div>
      </div>
    </div>
  )
}

// ---------------------------------------------------------------------------
// Helpers
// ---------------------------------------------------------------------------

function StatCard({
  icon: Icon,
  label,
  value,
  sub,
}: {
  icon: any
  label: string
  value: number
  sub: string
}) {
  return (
    <div className="rounded-2xl border border-stone-200 bg-white p-5">
      <Icon className="w-4 h-4 text-picc-ochre mb-3" />
      <p className="font-serif text-3xl text-stone-800">{value.toLocaleString()}</p>
      <p className="text-xs font-semibold text-stone-700 mt-1">{label}</p>
      <p className="text-xs text-stone-400 mt-0.5">{sub}</p>
    </div>
  )
}

function OperationCard({
  icon: Icon,
  title,
  command,
  desc,
  href,
}: {
  icon: any
  title: string
  command: string
  desc: string
  href?: string
}) {
  const inner = (
    <div className="rounded-2xl border border-stone-200 bg-white p-6 hover:border-picc-ochre transition-colors h-full">
      <div className="flex items-center gap-3 mb-3">
        <div className="w-9 h-9 rounded-xl bg-picc-ochre/10 flex items-center justify-center">
          <Icon className="w-4 h-4 text-picc-ochre" />
        </div>
        <h3 className="font-semibold text-stone-800">{title}</h3>
        {href && <ExternalLink className="w-3 h-3 text-stone-300 ml-auto" />}
      </div>
      <code className="block text-xs font-mono text-picc-ochre bg-picc-ochre/5 px-2 py-1.5 rounded mb-3 truncate">
        {command}
      </code>
      <p className="text-sm text-stone-500 leading-relaxed">{desc}</p>
    </div>
  )

  return href ? <Link href={href}>{inner}</Link> : inner
}
