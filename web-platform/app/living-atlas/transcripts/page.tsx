/**
 * /living-atlas/transcripts — released oral history transcripts.
 *
 * After the 2026-05-12 Elder-authorised bulk release (audit file in
 * scripts/audit/), all 137 PICC transcripts in EL v2 are public.
 * This page surfaces them: title, era, themes, duration, AI summary,
 * audio/video flags. Click a card → full transcript detail.
 *
 * Cultural protocol stays first-class: the bulk release rolled all
 * sensitivities through (standard, sensitive, sacred). The card visual
 * encodes which is which so readers see the protocol level at a glance.
 */

import Link from 'next/link'
import { ArrowLeft, Mic, Video as VideoIcon, Search } from 'lucide-react'
import { getPiccTranscriptMetadata } from '@/lib/empathy-ledger/el-transcripts'
import { getPiccStorytellers } from '@/lib/empathy-ledger/el-storytellers'

export const metadata = {
  title: 'Oral history transcripts — Palm Island Living Atlas',
  description:
    '137 PICC oral history transcripts released by Elder authorisation. Search by era, theme, or speaker.',
}

export const dynamic = 'force-dynamic'
export const revalidate = 0

function fmtDuration(sec: number | null): string {
  if (!sec) return '—'
  const m = Math.floor(sec / 60)
  if (m >= 60) {
    const h = Math.floor(m / 60)
    return `${h}h ${m % 60}m`
  }
  return `${m}m`
}

interface PageProps {
  searchParams: Promise<{ q?: string; era?: string; sensitivity?: string }>
}

export default async function TranscriptsPage({ searchParams }: PageProps) {
  const sp = await searchParams
  const q = (sp.q ?? '').toLowerCase().trim()
  const era = (sp.era ?? '').trim()
  const sensitivity = (sp.sensitivity ?? '').trim()

  const [all, storytellers] = await Promise.all([
    getPiccTranscriptMetadata(),
    getPiccStorytellers({ limit: 500 }),
  ])
  const public_ = all.filter((t) => t.privacy_level === 'public')

  // Storyteller UUID → { name, slug } for per-card speaker attribution.
  const speakerById = new Map<
    string,
    { name: string; slug: string; is_elder: boolean; photo_url: string | null }
  >()
  for (const s of storytellers) {
    speakerById.set(s.id, {
      name: s.display_name,
      slug: s.slug,
      is_elder: s.is_elder,
      photo_url: s.photo_url,
    })
  }

  // Filter — speaker name is part of the search blob now.
  let filtered = public_
  if (q) {
    filtered = filtered.filter((t) => {
      const speakerName = t.storyteller_id
        ? speakerById.get(t.storyteller_id)?.name ?? ''
        : ''
      const blob =
        `${t.title ?? ''} ${t.ai_summary ?? ''} ${t.era_label ?? ''} ${speakerName} ${(t.themes ?? []).join(' ')}`.toLowerCase()
      return blob.includes(q)
    })
  }
  if (era) filtered = filtered.filter((t) => t.era_label === era)
  if (sensitivity) filtered = filtered.filter((t) => t.cultural_sensitivity === sensitivity)

  // Aggregations for filter chips
  const byEra = public_.reduce<Record<string, number>>((m, t) => {
    if (t.era_label) m[t.era_label] = (m[t.era_label] ?? 0) + 1
    return m
  }, {})
  const bySensitivity = public_.reduce<Record<string, number>>((m, t) => {
    const k = t.cultural_sensitivity ?? 'unset'
    m[k] = (m[k] ?? 0) + 1
    return m
  }, {})
  const totalSeconds = public_.reduce(
    (n, t) => n + (t.duration_seconds ?? 0),
    0,
  )
  const totalHours = Math.round(totalSeconds / 3600)
  const totalWords = public_.reduce((n, t) => n + (t.word_count ?? 0), 0)
  const withAudio = public_.filter((t) => t.has_audio).length
  const withVideo = public_.filter((t) => t.has_video).length

  function chipHref(overrides: Record<string, string | undefined>): string {
    const params = new URLSearchParams()
    const merged = { q, era, sensitivity, ...overrides }
    for (const [k, v] of Object.entries(merged)) {
      if (v) params.set(k, v)
    }
    const qs = params.toString()
    return qs ? `/living-atlas/transcripts?${qs}` : '/living-atlas/transcripts'
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
            Oral history transcripts · released
          </div>
          <h1 className="font-serif text-4xl md:text-5xl text-charcoal mb-2">
            {public_.length} community voices
          </h1>
          <p className="text-stone-700 max-w-2xl leading-relaxed">
            Released by Elder authorisation on{' '}
            <strong>12 May 2026</strong> (audit file in{' '}
            <code className="bg-stone-100 px-1 rounded text-xs">
              scripts/audit/
            </code>
            ). Roughly <strong>{totalHours} hours</strong> and{' '}
            <strong>{totalWords.toLocaleString()} words</strong> of community
            voice now public.
          </p>
        </header>

        {/* Top stats */}
        <section className="grid grid-cols-2 md:grid-cols-4 gap-3 mb-5">
          <Stat label="transcripts" value={String(public_.length)} />
          <Stat label="hours" value={`${totalHours}h`} />
          <Stat
            label="with audio"
            value={String(withAudio)}
            icon={<Mic className="w-3.5 h-3.5" />}
          />
          <Stat
            label="with video"
            value={String(withVideo)}
            icon={<VideoIcon className="w-3.5 h-3.5" />}
          />
        </section>

        {/* Search */}
        <form
          method="get"
          action="/living-atlas/transcripts"
          className="mb-4 flex items-center gap-2"
        >
          <div className="flex items-center gap-1.5 flex-1 rounded-md border border-stone-300 bg-white px-3 py-2">
            <Search className="w-4 h-4 text-stone-400 flex-shrink-0" />
            <input
              name="q"
              defaultValue={q}
              placeholder="Search by speaker, title, theme, era…"
              className="flex-1 outline-none text-sm bg-transparent"
            />
          </div>
          {era && <input type="hidden" name="era" value={era} />}
          {sensitivity && (
            <input type="hidden" name="sensitivity" value={sensitivity} />
          )}
          <button
            type="submit"
            className="rounded-md px-4 py-2 font-semibold text-white text-sm"
            style={{ backgroundColor: '#2D5F4F' }}
          >
            Search
          </button>
          {(q || era || sensitivity) && (
            <Link
              href="/living-atlas/transcripts"
              className="text-xs underline text-stone-600"
            >
              Clear
            </Link>
          )}
        </form>

        {/* Filter chips — eras + sensitivity */}
        <div className="mb-4 space-y-1.5">
          {Object.keys(byEra).length > 0 && (
            <div className="flex flex-wrap gap-1 text-[11px]">
              <span className="text-stone-500 mr-1">Era:</span>
              {Object.entries(byEra)
                .sort((a, b) => b[1] - a[1])
                .map(([k, n]) => (
                  <Link
                    key={k}
                    href={chipHref({ era: era === k ? undefined : k })}
                    className="rounded-full px-2 py-0.5 hover:bg-stone-200"
                    style={
                      era === k
                        ? { backgroundColor: '#E7EFE4', color: '#2D5F4F', fontWeight: 600 }
                        : { backgroundColor: '#F1ECE3' }
                    }
                  >
                    {k} · {n}
                  </Link>
                ))}
            </div>
          )}
          <div className="flex flex-wrap gap-1 text-[11px]">
            <span className="text-stone-500 mr-1">Sensitivity:</span>
            {Object.entries(bySensitivity)
              .sort((a, b) => b[1] - a[1])
              .map(([k, n]) => (
                <Link
                  key={k}
                  href={chipHref({
                    sensitivity: sensitivity === k ? undefined : k,
                  })}
                  className="rounded-full px-2 py-0.5"
                  style={
                    sensitivity === k
                      ? { backgroundColor: '#E7EFE4', color: '#2D5F4F', fontWeight: 600 }
                      : k === 'sacred'
                        ? { backgroundColor: '#FDE3E3', color: '#8B1A1A' }
                        : k === 'sensitive'
                          ? { backgroundColor: '#FCEEDF', color: '#8B6F47' }
                          : { backgroundColor: '#F1ECE3' }
                  }
                >
                  {k} · {n}
                </Link>
              ))}
          </div>
        </div>

        <div className="text-[11px] text-stone-500 mb-3">
          Showing {filtered.length} of {public_.length}
          {(q || era || sensitivity) && ' filtered'}
        </div>

        {/* List */}
        {filtered.length === 0 ? (
          <div className="rounded-xl border border-amber-200 bg-amber-50 p-5 text-amber-900 text-sm">
            No transcripts match these filters.
          </div>
        ) : (
          <ul className="space-y-3">
            {filtered.map((t) => {
              const speaker = t.storyteller_id
                ? speakerById.get(t.storyteller_id) ?? null
                : null
              return (
              <li
                key={t.id}
                className="rounded-xl border border-stone-200 bg-white p-4"
              >
                <Link
                  href={`/living-atlas/transcripts/${t.id}`}
                  className="block hover:bg-stone-50 -m-4 p-4 rounded-xl"
                >
                  <div className="flex items-start justify-between gap-3 flex-wrap">
                    <div className="flex-1 min-w-0">
                      {speaker && (
                        <div className="flex items-center gap-1.5 text-[11px] text-stone-600 mb-1.5">
                          {speaker.photo_url && (
                            <img
                              src={speaker.photo_url}
                              alt=""
                              className="w-5 h-5 rounded-full object-cover"
                              style={{
                                border: `1.5px solid ${speaker.is_elder ? '#B8860B' : '#FBF6EE'}`,
                              }}
                            />
                          )}
                          <span className="font-semibold">{speaker.name}</span>
                          {speaker.is_elder && (
                            <span className="text-[9px] uppercase tracking-wider font-bold text-ochre">
                              Elder
                            </span>
                          )}
                        </div>
                      )}
                      <div className="flex items-baseline gap-2 flex-wrap mb-1">
                        <h2 className="font-serif text-lg text-charcoal">
                          {t.title ?? 'Untitled'}
                        </h2>
                        {t.cultural_sensitivity === 'sensitive' && (
                          <span
                            className="text-[9px] uppercase tracking-wider font-semibold px-1.5 py-0.5 rounded"
                            style={{ backgroundColor: '#FCEEDF', color: '#8B6F47' }}
                          >
                            sensitive
                          </span>
                        )}
                        {t.cultural_sensitivity === 'sacred' && (
                          <span
                            className="text-[9px] uppercase tracking-wider font-semibold px-1.5 py-0.5 rounded"
                            style={{ backgroundColor: '#FDE3E3', color: '#8B1A1A' }}
                          >
                            sacred
                          </span>
                        )}
                      </div>
                      <div className="text-[11px] text-stone-500 mb-2 flex items-center gap-2 flex-wrap">
                        <span>{fmtDuration(t.duration_seconds)}</span>
                        {t.word_count && (
                          <>
                            <span className="text-stone-300">·</span>
                            <span>{t.word_count.toLocaleString()} words</span>
                          </>
                        )}
                        {t.recording_date && (
                          <>
                            <span className="text-stone-300">·</span>
                            <span>{t.recording_date.slice(0, 10)}</span>
                          </>
                        )}
                        {t.era_label && (
                          <>
                            <span className="text-stone-300">·</span>
                            <span>{t.era_label}</span>
                          </>
                        )}
                        {t.has_audio && (
                          <Mic className="w-3 h-3 text-stone-400" />
                        )}
                        {t.has_video && (
                          <VideoIcon className="w-3 h-3 text-stone-400" />
                        )}
                      </div>
                      {t.ai_summary && (
                        <p className="text-sm text-stone-700 leading-relaxed line-clamp-3">
                          {t.ai_summary}
                        </p>
                      )}
                      {t.themes && t.themes.length > 0 && (
                        <div className="mt-2 flex flex-wrap gap-1 text-[10px]">
                          {t.themes.slice(0, 8).map((th, i) => (
                            <span
                              key={i}
                              className="rounded-full px-1.5 py-0.5"
                              style={{ backgroundColor: '#F1ECE3', color: '#6B5D4F' }}
                            >
                              #{th}
                            </span>
                          ))}
                        </div>
                      )}
                    </div>
                  </div>
                </Link>
              </li>
              )
            })}
          </ul>
        )}

        <section className="mt-8 rounded-xl border border-stone-200 bg-white p-5">
          <div className="text-[10px] uppercase tracking-wide text-ochre font-semibold mb-2">
            Cultural protocol
          </div>
          <p className="text-sm text-stone-700 leading-relaxed">
            All transcripts here were released by Elder authorisation
            recorded on 12 May 2026. The full audit trail (consent record,
            BEFORE-state snapshots, scope) lives in{' '}
            <code className="bg-stone-100 px-1 rounded text-xs">
              web-platform/scripts/audit/
            </code>
            . If any voice needs to be re-held, run{' '}
            <code className="bg-stone-100 px-1 rounded text-xs">
              rollback-elder-consent.mjs
            </code>{' '}
            against the audit file and the row returns to private within
            seconds.
          </p>
        </section>
      </div>
    </div>
  )
}

function Stat({
  label,
  value,
  icon,
}: {
  label: string
  value: string
  icon?: React.ReactNode
}) {
  return (
    <div className="rounded-xl border border-stone-200 bg-white px-4 py-3">
      <div className="flex items-baseline justify-between gap-2">
        <div className="font-serif text-2xl" style={{ color: '#2D5F4F' }}>
          {value}
        </div>
        {icon && <span className="text-stone-400">{icon}</span>}
      </div>
      <div className="text-[10px] uppercase tracking-wide text-stone-500 mt-1">
        {label}
      </div>
    </div>
  )
}
