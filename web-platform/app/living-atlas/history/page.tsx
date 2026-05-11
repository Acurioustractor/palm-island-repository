/**
 * /living-atlas/history — the long ground.
 *
 * Three threads on one page:
 *   1. The PICC eras (4 named eras from organization_history)
 *   2. The historical archive (573 newspaper articles 1911-2014 + court +
 *      government records + photographs from historical_artifacts)
 *   3. The research sources / citation graph (research_sources)
 *
 * Cultural protocol: only artifacts with is_verified=true. Anything tagged
 * sensitive at the row level (cultural_sensitivity_level / elder_approval
 * _required) is filtered at the data layer.
 */

import Link from 'next/link'
import { ArrowLeft, ExternalLink, BookOpen, Newspaper } from 'lucide-react'
import { loadConstellation } from '@/lib/constellation/queries'
import type { HistoricalArtifact } from '@/lib/constellation/types'

export const metadata = {
  title: 'History — Palm Island Living Atlas',
  description:
    'The long ground: 573 newspaper articles from 1911 to 2014, four PICC eras, and the research sources behind every claim.',
}

export const dynamic = 'force-dynamic'
export const revalidate = 0

function parseYear(s: string | null): number | null {
  if (!s) return null
  const m = /^(\d{4})/.exec(s)
  return m ? parseInt(m[1], 10) : null
}

function groupByDecade(items: HistoricalArtifact[]) {
  const out = new Map<number, HistoricalArtifact[]>()
  for (const a of items) {
    const y = parseYear(a.date_original)
    if (y === null) continue
    const decade = Math.floor(y / 10) * 10
    const list = out.get(decade) ?? []
    list.push(a)
    out.set(decade, list)
  }
  return Array.from(out.entries()).sort((a, b) => a[0] - b[0])
}

function typeIcon(type: string) {
  if (type === 'newspaper') return <Newspaper className="w-3.5 h-3.5" />
  if (type === 'photograph') return null
  return <BookOpen className="w-3.5 h-3.5" />
}

export default async function HistoryPage() {
  const data = await loadConstellation()

  const eras = data.picc_eras
  const artifacts = data.historical_artifacts
  const decades = groupByDecade(artifacts)
  const undatedCount = artifacts.length - decades.reduce((n, [, list]) => n + list.length, 0)

  // Type counts for the legend
  const byType = new Map<string, number>()
  for (const a of artifacts) {
    byType.set(a.artifact_type, (byType.get(a.artifact_type) ?? 0) + 1)
  }

  return (
    <div className="min-h-screen bg-cream">
      <div className="max-w-5xl mx-auto px-4 py-6">
        <Link
          href="/living-atlas"
          className="inline-flex items-center gap-1.5 text-xs text-stone-600 hover:text-charcoal mb-3"
        >
          <ArrowLeft className="w-3.5 h-3.5" />
          Living Atlas
        </Link>

        <header className="mb-6">
          <div className="text-[11px] uppercase tracking-[0.3em] text-ochre font-bold mb-1">
            The long ground · 1911 → today
          </div>
          <h1 className="font-serif text-4xl md:text-5xl text-charcoal mb-2">
            History of Palm Island and PICC
          </h1>
          <p className="text-stone-700 max-w-2xl leading-relaxed">
            <strong>{artifacts.length.toLocaleString()}</strong> verified
            historical artifacts in the archive, going back to{' '}
            <strong>1911</strong> — three years before the Hull River
            Settlement was built. Plus the four PICC eras and the research
            sources behind every claim.
          </p>
          <div className="mt-3 flex gap-3 flex-wrap text-[11px] text-stone-600">
            {Array.from(byType.entries()).map(([type, n]) => (
              <span key={type} className="inline-flex items-center gap-1">
                {typeIcon(type)}
                <strong>{n}</strong> {type.replace(/_/g, ' ')}
              </span>
            ))}
          </div>
        </header>

        {/* PICC eras */}
        <section className="mb-8">
          <div className="text-[10px] uppercase tracking-wide text-stone-500 font-semibold mb-3">
            PICC&rsquo;s own four eras
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
            {eras.map((era, i) => (
              <article
                key={i}
                className="rounded-xl border bg-white p-4"
                style={{
                  borderColor: '#E8E6E3',
                  borderLeftWidth: 4,
                  borderLeftColor: ['#8B6F47', '#D4A373', '#D97757', '#2D5F4F'][i] ?? '#2D5F4F',
                }}
              >
                <div className="text-[10px] uppercase tracking-wider text-stone-500 font-semibold">
                  {era.year_start ?? '—'} {era.year_end ? `– ${era.year_end}` : '– now'}
                </div>
                <h2
                  className="font-serif text-lg mt-0.5 mb-2"
                  style={{ color: '#2D5F4F' }}
                >
                  {era.name}
                </h2>
                {era.description && (
                  <p className="text-xs text-stone-700 leading-snug">
                    {era.description.length > 220
                      ? era.description.slice(0, 220) + '…'
                      : era.description}
                  </p>
                )}
              </article>
            ))}
          </div>
        </section>

        {/* The decade-by-decade archive */}
        <section className="mb-8">
          <div className="text-[10px] uppercase tracking-wide text-stone-500 font-semibold mb-3">
            The archive · decade by decade
          </div>
          <div className="space-y-6">
            {decades.map(([decade, items]) => (
              <article key={decade}>
                <div className="flex items-baseline gap-3 mb-2">
                  <h3
                    className="font-serif text-2xl"
                    style={{ color: '#2D5F4F' }}
                  >
                    {decade}s
                  </h3>
                  <span className="text-[11px] text-stone-500">
                    {items.length} artifact{items.length === 1 ? '' : 's'}
                  </span>
                </div>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
                  {items.slice(0, 12).map((a) => (
                    <a
                      key={a.id}
                      href={a.source_url ?? '#'}
                      target={a.source_url ? '_blank' : undefined}
                      rel={a.source_url ? 'noopener noreferrer' : undefined}
                      className="block rounded-lg border border-stone-200 bg-white p-3 hover:shadow-md transition"
                    >
                      <div className="flex items-baseline justify-between gap-2 mb-1">
                        <span className="text-[10px] uppercase tracking-wider text-stone-500 font-semibold inline-flex items-center gap-1">
                          {typeIcon(a.artifact_type)}
                          {a.artifact_type.replace(/_/g, ' ')}
                        </span>
                        <span className="text-[10px] text-stone-500 font-mono">
                          {a.date_original?.slice(0, 10) ?? '—'}
                        </span>
                      </div>
                      <div className="font-serif text-sm text-charcoal leading-snug">
                        {a.title.length > 120 ? a.title.slice(0, 120) + '…' : a.title}
                      </div>
                      {a.content_summary && (
                        <div className="text-[11px] text-stone-600 mt-1 line-clamp-2 leading-snug">
                          {a.content_summary}
                        </div>
                      )}
                      <div className="flex items-baseline justify-between mt-1.5">
                        {a.source_name && (
                          <div className="text-[10px] italic text-stone-500">
                            {a.source_name}
                          </div>
                        )}
                        {a.source_url && (
                          <span className="text-[10px] text-sage-700 inline-flex items-center gap-0.5">
                            source <ExternalLink className="w-2.5 h-2.5" />
                          </span>
                        )}
                      </div>
                    </a>
                  ))}
                </div>
                {items.length > 12 && (
                  <div className="text-[11px] text-stone-500 italic mt-2">
                    +{items.length - 12} more from this decade in the archive
                  </div>
                )}
              </article>
            ))}
          </div>
          {undatedCount > 0 && (
            <div className="text-[11px] text-stone-500 italic mt-4">
              +{undatedCount} undated artifact{undatedCount === 1 ? '' : 's'} in the archive (no
              date_original on record)
            </div>
          )}
        </section>

        {/* Research sources */}
        {data.research_sources.length > 0 && (
          <section className="mb-8">
            <div className="text-[10px] uppercase tracking-wide text-stone-500 font-semibold mb-3">
              Research sources · {data.research_sources.length} cited
            </div>
            <div className="space-y-2">
              {data.research_sources.map((r) => (
                <article
                  key={r.id}
                  className="rounded-md border border-stone-200 bg-white p-3"
                >
                  <div className="flex items-baseline justify-between gap-2 mb-1">
                    <span className="text-[10px] uppercase tracking-wider text-stone-500 font-semibold">
                      {r.source_type.replace(/_/g, ' ')}
                      {r.is_primary_source && (
                        <span
                          className="ml-2 px-1.5 py-0.5 rounded text-[8.5px] font-semibold uppercase tracking-wider"
                          style={{ backgroundColor: '#E7EFE4', color: '#2D5F4F' }}
                        >
                          primary
                        </span>
                      )}
                    </span>
                    {r.publication_date && (
                      <span className="text-[10px] text-stone-500 font-mono">
                        {r.publication_date.slice(0, 10)}
                      </span>
                    )}
                  </div>
                  <div className="font-serif text-sm text-charcoal">{r.title}</div>
                  <div className="text-[11px] text-stone-600 mt-0.5">
                    {[r.author, r.publisher].filter(Boolean).join(' · ')}
                  </div>
                  {r.citation_text && (
                    <div className="text-[10.5px] italic text-stone-500 mt-1">
                      {r.citation_text}
                    </div>
                  )}
                  {r.url && (
                    <a
                      href={r.url}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="mt-1 inline-flex items-center gap-0.5 text-[11px] text-sage-700 hover:underline"
                    >
                      Open source <ExternalLink className="w-2.5 h-2.5" />
                    </a>
                  )}
                </article>
              ))}
            </div>
          </section>
        )}

        <section className="rounded-xl border border-stone-200 bg-white p-5">
          <div className="text-[10px] uppercase tracking-wide text-ochre font-semibold mb-2">
            Cultural protocol
          </div>
          <p className="text-sm text-stone-700 leading-relaxed">
            Only artifacts marked <code className="bg-stone-100 px-1 rounded text-xs">is_verified = true</code> appear here.
            Content tagged restricted or requiring Elder approval stays in
            the archive and is not displayed. Newspaper coverage going back
            to 1911 — three years before Hull River — gives the deep ground;
            the four eras give PICC&rsquo;s own framing on top.
          </p>
        </section>
      </div>
    </div>
  )
}
