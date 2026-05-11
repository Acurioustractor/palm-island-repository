/**
 * /living-atlas/transcripts — the held archive.
 *
 * EL holds 137 oral history transcripts for PICC. ALL are currently
 * privacy_level=private — they sit in the community archive awaiting
 * explicit Elder / community publishing approval before any content can
 * surface publicly.
 *
 * This page shows the SHAPE of the archive (counts, eras, sensitivities,
 * duration, AI summary if approved) without exposing transcript_content.
 * Sovereignty made visible: the system surfaces that the recordings exist,
 * then waits for the people to decide what comes out.
 */

import Link from 'next/link'
import { ArrowLeft, Lock, Mic, Video as VideoIcon, Eye } from 'lucide-react'
import { getPiccTranscriptMetadata } from '@/lib/empathy-ledger/el-transcripts'

export const metadata = {
  title: 'Oral history transcripts — Palm Island Living Atlas',
  description:
    'The held archive: 137 oral history transcripts in Empathy Ledger v2, awaiting community publishing approval.',
}

export const dynamic = 'force-dynamic'
export const revalidate = 0

function fmtDuration(sec: number | null): string {
  if (!sec) return '—'
  const m = Math.floor(sec / 60)
  const s = sec % 60
  if (m >= 60) {
    const h = Math.floor(m / 60)
    return `${h}h ${m % 60}m`
  }
  return `${m}m ${s}s`
}

export default async function TranscriptsPage() {
  const transcripts = await getPiccTranscriptMetadata()

  const total = transcripts.length
  const bySensitivity = transcripts.reduce<Record<string, number>>(
    (acc, t) => {
      const k = t.cultural_sensitivity ?? 'unknown'
      acc[k] = (acc[k] ?? 0) + 1
      return acc
    },
    {},
  )
  const byEra = transcripts.reduce<Record<string, number>>((acc, t) => {
    const k = t.era_label ?? 'no era set'
    acc[k] = (acc[k] ?? 0) + 1
    return acc
  }, {})
  const totalSeconds = transcripts.reduce(
    (n, t) => n + (t.duration_seconds ?? 0),
    0,
  )
  const totalWords = transcripts.reduce(
    (n, t) => n + (t.word_count ?? 0),
    0,
  )
  const withAudio = transcripts.filter((t) => t.has_audio).length
  const withVideo = transcripts.filter((t) => t.has_video).length
  const elderReviewed = transcripts.filter((t) => t.elder_reviewed_at).length
  const publicCount = transcripts.filter(
    (t) => t.privacy_level === 'public',
  ).length

  const totalHours = Math.round(totalSeconds / 3600)

  return (
    <div className="min-h-screen bg-cream">
      <div className="max-w-4xl mx-auto px-4 py-6">
        <Link
          href="/living-atlas"
          className="inline-flex items-center gap-1.5 text-xs text-stone-600 hover:text-charcoal mb-3"
        >
          <ArrowLeft className="w-3.5 h-3.5" />
          Living Atlas
        </Link>

        <header className="mb-6">
          <div className="text-[11px] uppercase tracking-[0.3em] text-ochre font-bold mb-1">
            The held archive · oral history transcripts
          </div>
          <h1 className="font-serif text-4xl md:text-5xl text-charcoal mb-2">
            {total} transcripts in community archive
          </h1>
          <p className="text-stone-700 max-w-2xl leading-relaxed">
            Empathy Ledger v2 holds <strong>{total} oral history recordings</strong>{' '}
            for PICC, totalling roughly <strong>{totalHours} hours</strong>{' '}
            and <strong>{totalWords.toLocaleString()} words</strong>. None of
            them are open for public reading today. They live in the
            community archive until Elders and PICC decide what releases.
          </p>
        </header>

        {/* Stats grid */}
        <section className="grid grid-cols-2 md:grid-cols-4 gap-3 mb-6">
          <Stat label="transcripts" value={total.toString()} />
          <Stat label="hours recorded" value={`${totalHours}h`} />
          <Stat
            label="with audio"
            value={`${withAudio}`}
            icon={<Mic className="w-3.5 h-3.5" />}
          />
          <Stat
            label="with video"
            value={`${withVideo}`}
            icon={<VideoIcon className="w-3.5 h-3.5" />}
          />
        </section>

        {/* Sensitivity + privacy bands */}
        <section className="rounded-xl border border-stone-200 bg-white p-5 mb-6">
          <div className="text-[10px] uppercase tracking-wide text-stone-500 font-semibold mb-3">
            Cultural sensitivity & privacy
          </div>
          <div className="space-y-2 text-sm">
            <ProtocolRow
              icon={<Lock className="w-4 h-4" />}
              label="Currently private — held in archive"
              value={total - publicCount}
              color="#8B1A1A"
            />
            {publicCount > 0 && (
              <ProtocolRow
                icon={<Eye className="w-4 h-4" />}
                label="Approved for public reading"
                value={publicCount}
                color="#2D5F4F"
              />
            )}
            <div className="border-t border-stone-200 my-3" />
            {Object.entries(bySensitivity).map(([k, v]) => (
              <ProtocolRow
                key={k}
                icon={null}
                label={`Cultural sensitivity: ${k}`}
                value={v}
                color={
                  k === 'sacred'
                    ? '#8B1A1A'
                    : k === 'sensitive'
                      ? '#D97757'
                      : '#2D5F4F'
                }
              />
            ))}
            <div className="border-t border-stone-200 my-3" />
            <ProtocolRow
              icon={null}
              label="Elder review completed"
              value={elderReviewed}
              color="#B8860B"
            />
          </div>
          <p className="text-[11px] text-stone-600 italic mt-4 leading-snug">
            The Atlas counts these recordings so the archive is visible to
            community and partners. The text itself does not appear here
            until Elders + PICC publish it.
          </p>
        </section>

        {/* Era breakdown */}
        {Object.keys(byEra).length > 0 && (
          <section className="rounded-xl border border-stone-200 bg-white p-5 mb-6">
            <div className="text-[10px] uppercase tracking-wide text-stone-500 font-semibold mb-3">
              Era coverage
            </div>
            <div className="space-y-1.5 text-sm">
              {Object.entries(byEra)
                .sort((a, b) => b[1] - a[1])
                .map(([era, n]) => (
                  <div key={era} className="flex justify-between items-baseline">
                    <span className="text-stone-700">{era}</span>
                    <span
                      className="font-semibold"
                      style={{ color: '#2D5F4F' }}
                    >
                      {n}
                    </span>
                  </div>
                ))}
            </div>
          </section>
        )}

        {/* Public list — only transcripts with privacy_level=public */}
        {publicCount > 0 ? (
          <section className="rounded-xl border border-stone-200 bg-white p-5 mb-6">
            <div className="text-[10px] uppercase tracking-wide text-stone-500 font-semibold mb-3">
              Released for public reading ({publicCount})
            </div>
            <ul className="space-y-2 text-sm">
              {transcripts
                .filter((t) => t.privacy_level === 'public')
                .map((t) => (
                  <li
                    key={t.id}
                    className="rounded-md border border-stone-200 bg-white p-3"
                  >
                    <div className="font-serif text-charcoal mb-0.5">
                      {t.title ?? 'Untitled'}
                    </div>
                    <div className="text-[11px] text-stone-500">
                      {fmtDuration(t.duration_seconds)} ·{' '}
                      {t.recording_date?.slice(0, 10) ?? 'undated'} ·{' '}
                      {t.cultural_sensitivity ?? 'standard'}
                    </div>
                    {t.ai_summary && (
                      <p className="text-xs text-stone-700 mt-2 italic">
                        {t.ai_summary}
                      </p>
                    )}
                  </li>
                ))}
            </ul>
          </section>
        ) : (
          <section className="rounded-xl border border-amber-200 bg-amber-50 p-5">
            <div className="font-serif text-base mb-1 text-amber-900">
              No transcripts approved for public release yet
            </div>
            <p className="text-sm text-amber-900 leading-relaxed">
              Every recording in the archive is held under{' '}
              <code className="bg-amber-100 px-1 rounded text-xs">
                privacy_level=&apos;private&apos;
              </code>{' '}
              by default. The Atlas surfaces only what Elders + PICC
              explicitly release. That is the work of community review,
              not of a release schedule.
            </p>
          </section>
        )}

        <section className="mt-8 rounded-xl border border-stone-200 bg-white p-5">
          <div className="text-[10px] uppercase tracking-wide text-ochre font-semibold mb-2">
            Why count what we don&rsquo;t show?
          </div>
          <p className="text-sm text-stone-700 leading-relaxed">
            Counting the archive without exposing it is sovereignty in
            practice. Community and partners can see that <strong>{total} stories</strong>{' '}
            have been recorded, AI-analysed, transcribed and held; the
            decision to publish stays with the people. When more recordings
            are released, they appear here automatically.
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
        <div
          className="font-serif text-2xl"
          style={{ color: '#2D5F4F' }}
        >
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

function ProtocolRow({
  icon,
  label,
  value,
  color,
}: {
  icon: React.ReactNode
  label: string
  value: number
  color: string
}) {
  return (
    <div className="flex items-center gap-2">
      {icon && (
        <span className="flex-shrink-0" style={{ color }}>
          {icon}
        </span>
      )}
      <span className="text-stone-700 flex-1">{label}</span>
      <span className="font-semibold" style={{ color }}>
        {value}
      </span>
    </div>
  )
}
