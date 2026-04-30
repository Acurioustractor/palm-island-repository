/**
 * /voices/notes — public view of approved community notes.
 *
 * Notes are short observations submitted via /share-note that have
 * passed admin review (is_public = true, metadata.is_note = true).
 * Lighter than the quote wall — these are reactions, half-thoughts,
 * field-of-vision moments rather than full quotes.
 */
import Link from 'next/link'
import { createServerSupabase } from '@/lib/supabase/client'
import { C } from '@/components/annual-report/2024-25/almanac/tokens'
import { StickyNote } from 'lucide-react'

export const dynamic = 'force-dynamic'
export const revalidate = 1800

export const metadata = {
  title: 'Notes — Palm Island Community Company',
  description: 'Short observations and reactions left by Palm Island community members.',
}

interface NoteRow {
  id: string
  content: string | null
  metadata: Record<string, any> | null
  created_at: string
}

export default async function NotesPage() {
  const supabase = createServerSupabase()
  const { data } = await supabase
    .from('stories')
    .select('id, content, metadata, created_at')
    .eq('is_public', true)
    .eq('category', 'note')
    .filter('metadata->>is_note', 'eq', 'true')
    .is('deleted_at', null)
    .order('created_at', { ascending: false })
    .limit(120)

  const notes = (data || []) as NoteRow[]

  return (
    <main className="min-h-screen" style={{ backgroundColor: '#FBF8EE' }}>
      {/* Hero */}
      <section
        className="px-6 md:px-12 py-16 md:py-20"
        style={{ backgroundColor: C.shell }}
      >
        <div className="max-w-5xl mx-auto">
          <Link
            href="/voices"
            className="text-xs uppercase font-bold tracking-widest hover:opacity-80"
            style={{ color: C.driftwood }}
          >
            ← Voices
          </Link>
          <div className="flex items-center gap-3 mt-8 mb-4">
            <StickyNote className="w-7 h-7" style={{ color: C.ochre }} />
            <div
              className="uppercase font-bold"
              style={{ color: C.turtleRed, fontSize: 11, letterSpacing: '0.3em' }}
            >
              Notes · {notes.length}
            </div>
          </div>
          <h1
            className="font-fraunces font-bold leading-tight"
            style={{ color: C.ocean, fontSize: 'clamp(36px, 6vw, 64px)' }}
          >
            Half-thoughts, full feelings.
          </h1>
          <p
            className="mt-6 leading-relaxed max-w-2xl"
            style={{ color: C.driftwood, fontSize: 16 }}
          >
            Short observations from community members — quick reactions,
            half-thoughts, things noticed in passing. Lighter than the quote
            wall, but every one of them matters.
          </p>
          <Link
            href="/share-note"
            className="inline-block mt-6 px-5 py-2.5 rounded-full font-bold uppercase tracking-widest hover:opacity-90"
            style={{
              backgroundColor: C.ochre,
              color: 'white',
              fontSize: 11,
              letterSpacing: '0.2em',
            }}
          >
            Leave a note →
          </Link>
        </div>
      </section>

      {/* Notes grid */}
      <section className="px-6 md:px-12 py-12 md:py-16">
        <div className="max-w-5xl mx-auto">
          {notes.length === 0 ? (
            <div className="rounded-md p-8 text-center" style={{ backgroundColor: C.shell }}>
              <p style={{ color: C.driftwood, fontSize: 15, lineHeight: 1.6 }}>
                No notes published yet. Be the first to{' '}
                <Link href="/share-note" className="underline" style={{ color: C.ochre }}>
                  leave one
                </Link>
                .
              </p>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {notes.map((n) => {
                const author = n.metadata?.anonymous
                  ? 'Community member'
                  : n.metadata?.asker_name || 'Community member'
                const created = new Date(n.created_at)
                return (
                  <article
                    key={n.id}
                    className="rounded-md p-5 flex flex-col gap-3"
                    style={{ backgroundColor: C.sand }}
                  >
                    <p
                      className="leading-relaxed whitespace-pre-wrap"
                      style={{ color: C.earth, fontSize: 15, lineHeight: 1.6 }}
                    >
                      {n.content}
                    </p>
                    <div
                      className="mt-auto pt-2 flex items-center justify-between text-xs"
                      style={{ color: C.muted, borderTop: `1px solid ${C.border}` }}
                    >
                      <span className="font-semibold" style={{ color: C.ocean }}>
                        {author}
                      </span>
                      <span>{created.toLocaleDateString()}</span>
                    </div>
                  </article>
                )
              })}
            </div>
          )}
        </div>
      </section>

      {/* Footer CTA */}
      <section
        className="px-6 md:px-12 py-16 md:py-20 text-center"
        style={{ backgroundColor: C.midnight }}
      >
        <div className="max-w-xl mx-auto">
          <h2
            className="font-fraunces font-bold"
            style={{ color: C.starGold, fontSize: 'clamp(28px, 4.5vw, 42px)' }}
          >
            Got a thought?
          </h2>
          <p className="mt-4 text-white/85 leading-relaxed">
            Leave a note — short, half-formed, anything. It joins the others here once
            reviewed.
          </p>
          <Link
            href="/share-note"
            className="inline-block mt-6 px-6 py-3 rounded-full font-bold uppercase tracking-widest hover:opacity-90"
            style={{
              backgroundColor: C.starGold,
              color: C.midnight,
              fontSize: 11,
              letterSpacing: '0.2em',
            }}
          >
            Leave a note →
          </Link>
        </div>
      </section>
    </main>
  )
}
