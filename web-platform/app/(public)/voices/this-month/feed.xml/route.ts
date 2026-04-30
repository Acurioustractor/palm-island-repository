/**
 * /voices/this-month/feed.xml — Atom feed of recent contributions.
 *
 * Lets staff (and the community) subscribe to the river in any RSS
 * reader. Returns the most recent 30 items across voices, art,
 * answered questions, notes, and stories — published only.
 *
 * Cache for 10 minutes via Cache-Control to keep feed readers honest
 * without hammering the DB.
 */
import { createServerSupabase } from '@/lib/supabase/client'

export const dynamic = 'force-dynamic'
export const revalidate = 600

const SITE_URL = process.env.NEXT_PUBLIC_SITE_URL || 'https://picc.com.au'

interface FeedItem {
  id: string
  kind: 'voice' | 'art' | 'qa' | 'note' | 'story'
  title: string
  summary: string
  url: string
  date: string
}

function escapeXml(s: string): string {
  return s
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&apos;')
}

export async function GET() {
  const supabase = createServerSupabase()

  const sinceIso = new Date(Date.now() - 60 * 24 * 60 * 60 * 1000).toISOString() // last 60 days

  const [
    quotesResult,
    artResult,
    answeredResult,
    notesResult,
    storiesResult,
  ] = await Promise.all([
    supabase
      .from('extracted_quotes')
      .select('id, quote_text, attribution, theme, created_at')
      .or('is_validated.eq.true,suggested_for_report.eq.true')
      .gte('created_at', sinceIso)
      .order('created_at', { ascending: false })
      .limit(20),
    supabase
      .from('media_files')
      .select('id, public_url, title, attribution, created_at')
      .eq('page_context', 'community-art')
      .eq('is_public', true)
      .is('deleted_at', null)
      .gte('created_at', sinceIso)
      .order('created_at', { ascending: false })
      .limit(15),
    supabase
      .from('stories')
      .select('id, content, metadata, updated_at')
      .filter('metadata->>is_question', 'eq', 'true')
      .filter('metadata->>question_status', 'eq', 'answered')
      .eq('is_public', true)
      .gte('updated_at', sinceIso)
      .is('deleted_at', null)
      .order('updated_at', { ascending: false })
      .limit(15),
    supabase
      .from('stories')
      .select('id, content, metadata, created_at')
      .filter('metadata->>is_note', 'eq', 'true')
      .eq('is_public', true)
      .gte('created_at', sinceIso)
      .is('deleted_at', null)
      .order('created_at', { ascending: false })
      .limit(15),
    supabase
      .from('stories')
      .select('id, title, content, summary, category, metadata, created_at')
      .eq('is_public', true)
      .or('metadata->>is_question.is.null,metadata->>is_question.eq.false')
      .or('metadata->>is_note.is.null,metadata->>is_note.eq.false')
      .gte('created_at', sinceIso)
      .is('deleted_at', null)
      .order('created_at', { ascending: false })
      .limit(15),
  ])

  const items: FeedItem[] = []

  for (const q of quotesResult.data || []) {
    items.push({
      id: `voice-${q.id}`,
      kind: 'voice',
      title: `New voice${q.theme ? ` · ${q.theme}` : ''}${q.attribution ? ` — ${q.attribution}` : ''}`,
      summary: q.quote_text,
      url: `${SITE_URL}/voices/pulse`,
      date: q.created_at,
    })
  }
  for (const a of artResult.data || []) {
    items.push({
      id: `art-${a.id}`,
      kind: 'art',
      title: `New artwork${a.title ? `: ${a.title}` : ''}${a.attribution ? ` — ${a.attribution}` : ''}`,
      summary: a.title || 'Community-submitted artwork',
      url: a.public_url,
      date: a.created_at,
    })
  }
  for (const ans of answeredResult.data || []) {
    const answer = (ans.metadata?.answer as string | undefined) || ''
    items.push({
      id: `qa-${ans.id}`,
      kind: 'qa',
      title: `Question answered: ${(ans.content || '').slice(0, 80)}`,
      summary: answer,
      url: `${SITE_URL}/voices/questions`,
      date: ans.updated_at,
    })
  }
  for (const n of notesResult.data || []) {
    items.push({
      id: `note-${n.id}`,
      kind: 'note',
      title: 'New community note',
      summary: n.content || '',
      url: `${SITE_URL}/voices/notes`,
      date: n.created_at,
    })
  }
  for (const s of storiesResult.data || []) {
    items.push({
      id: `story-${s.id}`,
      kind: 'story',
      title: `New story: ${s.title || 'Untitled'}`,
      summary: s.summary || (s.content || '').slice(0, 240),
      url: `${SITE_URL}/stories/${s.id}`,
      date: s.created_at,
    })
  }

  items.sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime())
  const recent = items.slice(0, 30)

  const updated = recent[0]?.date || new Date().toISOString()

  const xml = `<?xml version="1.0" encoding="UTF-8"?>
<feed xmlns="http://www.w3.org/2005/Atom">
  <title>Palm Island Community Company — The river</title>
  <subtitle>Voices, art, questions, notes, and stories from the Bwgcolman community.</subtitle>
  <link href="${SITE_URL}/voices/this-month/feed.xml" rel="self" />
  <link href="${SITE_URL}/voices/this-month" />
  <id>${SITE_URL}/voices/this-month/feed.xml</id>
  <updated>${updated}</updated>
  <author>
    <name>Palm Island Community Company</name>
    <uri>${SITE_URL}</uri>
  </author>
${recent
  .map(
    (item) => `  <entry>
    <id>${SITE_URL}/voices/this-month#${item.id}</id>
    <title>${escapeXml(item.title)}</title>
    <link href="${escapeXml(item.url)}" />
    <updated>${item.date}</updated>
    <category term="${item.kind}" />
    <summary type="text">${escapeXml(item.summary)}</summary>
  </entry>`,
  )
  .join('\n')}
</feed>`

  return new Response(xml, {
    status: 200,
    headers: {
      'Content-Type': 'application/atom+xml; charset=utf-8',
      'Cache-Control': 's-maxage=600, stale-while-revalidate=300',
    },
  })
}
