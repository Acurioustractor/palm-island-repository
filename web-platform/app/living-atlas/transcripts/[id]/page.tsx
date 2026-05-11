/**
 * /living-atlas/transcripts/[id] — single transcript detail.
 *
 * Renders the AI summary, themes, era, key quotes, audio/video when
 * present, and the full transcript_content. Server-side fetched directly
 * from EL v2 (only loads when privacy_level=public — held rows return
 * notFound).
 */

import Link from 'next/link'
import { ArrowLeft, Mic, Video as VideoIcon, Clock, User } from 'lucide-react'
import { notFound } from 'next/navigation'
import { getPiccTranscriptById } from '@/lib/empathy-ledger/el-transcripts'
import { getPiccStorytellers } from '@/lib/empathy-ledger/el-storytellers'

export const dynamic = 'force-dynamic'
export const revalidate = 0

export async function generateMetadata({
  params,
}: {
  params: Promise<{ id: string }>
}) {
  const { id } = await params
  const t = await getPiccTranscriptById(id)
  return {
    title: t ? `${t.title ?? 'Transcript'} — Palm Island Living Atlas` : 'Transcript',
    description: t?.ai_summary ?? 'PICC oral history transcript.',
  }
}

function fmtDuration(sec: number | null): string {
  if (!sec) return ''
  const m = Math.floor(sec / 60)
  if (m >= 60) {
    const h = Math.floor(m / 60)
    return `${h}h ${m % 60}m`
  }
  return `${m}m ${sec % 60}s`
}

interface SegmentLike {
  speaker?: string | null
  text?: string | null
  start?: number | null
  end?: number | null
  start_time_seconds?: number | null
  end_time_seconds?: number | null
  segment_text?: string | null
}

function fmtTime(sec: number | null | undefined): string {
  if (sec == null) return ''
  const m = Math.floor(sec / 60)
  const s = Math.floor(sec % 60)
  return `${m.toString().padStart(2, '0')}:${s.toString().padStart(2, '0')}`
}

export default async function TranscriptDetailPage({
  params,
}: {
  params: Promise<{ id: string }>
}) {
  const { id } = await params
  const t = await getPiccTranscriptById(id)
  if (!t) notFound()

  // Resolve the storyteller_id to a name + slug so the detail page links
  // back to the person's full profile.
  const storyteller = t.storyteller_id
    ? (await getPiccStorytellers({ limit: 500 })).find(
        (s) => s.id === t.storyteller_id,
      ) ?? null
    : null

  const segments: SegmentLike[] = Array.isArray(t.segments) ? t.segments : []
  const keyQuotes: Array<{ text?: string; speaker?: string }> = Array.isArray(t.key_quotes)
    ? t.key_quotes
    : []

  return (
    <div className="min-h-screen bg-cream">
      <div className="max-w-3xl mx-auto px-4 py-6">
        <Link
          href="/living-atlas/transcripts"
          className="inline-flex items-center gap-1.5 text-xs text-stone-600 hover:text-charcoal mb-3"
        >
          <ArrowLeft className="w-3.5 h-3.5" />
          Transcripts
        </Link>

        <header className="mb-5">
          <div className="text-[11px] uppercase tracking-[0.3em] text-ochre font-bold mb-1 flex items-center gap-2 flex-wrap">
            <span>Oral history transcript</span>
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
          <h1 className="font-serif text-3xl md:text-4xl text-charcoal mb-2">
            {t.title ?? 'Untitled transcript'}
          </h1>
          {storyteller && (
            <Link
              href={`/living-atlas/people/${storyteller.slug}`}
              className="inline-flex items-center gap-2 text-sm text-stone-700 hover:text-charcoal mb-2 group"
            >
              {storyteller.photo_url ? (
                <img
                  src={storyteller.photo_url}
                  alt=""
                  className="w-6 h-6 rounded-full object-cover"
                  style={{
                    border: `2px solid ${storyteller.is_elder ? '#B8860B' : '#FBF6EE'}`,
                  }}
                />
              ) : (
                <User className="w-4 h-4 text-stone-500" />
              )}
              <span>
                <span>by </span>
                <span className="font-semibold group-hover:underline">
                  {storyteller.display_name}
                </span>
                {storyteller.is_elder && (
                  <span className="ml-1.5 text-[9px] uppercase tracking-wider font-bold text-ochre">
                    Elder
                  </span>
                )}
              </span>
            </Link>
          )}
          <div className="flex items-center gap-3 text-[11px] text-stone-600 flex-wrap">
            {t.duration_seconds && (
              <span className="inline-flex items-center gap-1">
                <Clock className="w-3 h-3" />
                {fmtDuration(t.duration_seconds)}
              </span>
            )}
            {t.word_count && <span>{t.word_count.toLocaleString()} words</span>}
            {t.recording_date && <span>{t.recording_date.slice(0, 10)}</span>}
            {t.era_label && <span>· {t.era_label}</span>}
          </div>
        </header>

        {/* Audio / video */}
        {(t.audio_url || t.video_url) && (
          <section className="mb-5 rounded-xl border border-stone-200 bg-white p-3">
            {t.video_url && (
              <video
                src={t.video_url}
                controls
                className="w-full rounded-md mb-2"
              />
            )}
            {t.audio_url && !t.video_url && (
              <audio src={t.audio_url} controls className="w-full" />
            )}
            <div className="text-[10px] text-stone-500 mt-1 flex items-center gap-2">
              {t.has_video ? (
                <VideoIcon className="w-3.5 h-3.5" />
              ) : (
                <Mic className="w-3.5 h-3.5" />
              )}
              Recording from PICC archive
            </div>
          </section>
        )}

        {/* AI summary */}
        {t.ai_summary && (
          <section className="mb-5 rounded-xl border border-stone-200 bg-white p-5">
            <div className="text-[10px] uppercase tracking-wide text-stone-500 font-semibold mb-2">
              Summary
            </div>
            <p className="font-serif italic text-stone-800 leading-relaxed">
              {t.ai_summary}
            </p>
          </section>
        )}

        {/* Themes */}
        {t.themes && t.themes.length > 0 && (
          <section className="mb-5">
            <div className="text-[10px] uppercase tracking-wide text-stone-500 font-semibold mb-2">
              Themes
            </div>
            <div className="flex flex-wrap gap-1.5 text-xs">
              {t.themes.map((th, i) => (
                <Link
                  key={i}
                  href={`/living-atlas/themes/${th
                    .toLowerCase()
                    .replace(/\s+/g, '-')}`}
                  className="rounded-full px-2.5 py-0.5 hover:underline"
                  style={{ backgroundColor: '#F4E9DC', color: '#2C2C2C' }}
                >
                  {th}
                </Link>
              ))}
            </div>
          </section>
        )}

        {/* Key quotes */}
        {keyQuotes.length > 0 && (
          <section className="mb-5">
            <div className="text-[10px] uppercase tracking-wide text-stone-500 font-semibold mb-2">
              Key quotes
            </div>
            <div className="space-y-2">
              {keyQuotes.slice(0, 6).map((q, i) => (
                <blockquote
                  key={i}
                  className="rounded-md border border-stone-200 bg-white p-3"
                >
                  <p className="font-serif italic text-sm text-stone-800 leading-snug">
                    “{q.text ?? ''}”
                  </p>
                  {q.speaker && (
                    <div className="text-[11px] text-stone-600 mt-1">
                      — {q.speaker}
                    </div>
                  )}
                </blockquote>
              ))}
            </div>
          </section>
        )}

        {/* Segments (time-coded) */}
        {segments.length > 0 ? (
          <section className="mb-5">
            <div className="text-[10px] uppercase tracking-wide text-stone-500 font-semibold mb-2">
              Transcript · {segments.length} segments
            </div>
            <div className="rounded-xl border border-stone-200 bg-white p-4 space-y-3 text-sm">
              {segments.slice(0, 200).map((s, i) => {
                const start = s.start_time_seconds ?? s.start ?? null
                const text = s.segment_text ?? s.text ?? ''
                return (
                  <div key={i} className="flex gap-3">
                    <span className="text-[10.5px] font-mono text-stone-500 w-12 flex-shrink-0 mt-0.5">
                      {fmtTime(start) || ''}
                    </span>
                    <div className="flex-1">
                      {s.speaker && (
                        <div className="text-[11px] uppercase tracking-wider font-semibold text-stone-500 mb-0.5">
                          {s.speaker}
                        </div>
                      )}
                      <p className="text-stone-800 leading-relaxed">{text}</p>
                    </div>
                  </div>
                )
              })}
              {segments.length > 200 && (
                <div className="text-[11px] text-stone-500 italic">
                  +{segments.length - 200} more segments (truncated for
                  display).
                </div>
              )}
            </div>
          </section>
        ) : t.transcript_content ? (
          <section className="mb-5">
            <div className="text-[10px] uppercase tracking-wide text-stone-500 font-semibold mb-2">
              Transcript
            </div>
            <article
              className="rounded-xl border border-stone-200 bg-white p-5 text-sm text-stone-800 leading-relaxed whitespace-pre-wrap font-serif"
              style={{ maxHeight: '70vh', overflowY: 'auto' }}
            >
              {t.transcript_content}
            </article>
          </section>
        ) : null}

        <section className="rounded-xl border border-stone-200 bg-white p-5 text-sm text-stone-700">
          <div className="text-[10px] uppercase tracking-wide text-ochre font-semibold mb-2">
            Provenance
          </div>
          <p className="leading-relaxed">
            Released by Elder authorisation on 12 May 2026 (audit file in{' '}
            <code className="bg-stone-100 px-1 rounded text-xs">
              web-platform/scripts/audit/
            </code>
            ). If this transcript needs to be re-held at any point,
            running{' '}
            <code className="bg-stone-100 px-1 rounded text-xs">
              rollback-elder-consent.mjs
            </code>{' '}
            with the audit file will restore it to private within seconds.
          </p>
        </section>
      </div>
    </div>
  )
}
