import { createServerComponentClient } from '@/lib/supabase/server'
import { getELQuotes, getELStats } from '@/lib/empathy-ledger/el-server'
import TwentyYearsClient from './TwentyYearsClient'
import { assetUrl } from '@/lib/media/asset-url'

export const dynamic = 'force-dynamic'
export const revalidate = 300

export default async function TwentyYearsPage() {
  const supabase = await createServerComponentClient()

  // Fetch hero image via tags (20-years is not a standard page_context value)
  const { data: heroImageData } = await (supabase as any)
    .from('media_files')
    .select('public_url')
    .contains('tags', ['page:20-years', 'hero'])
    .eq('file_type', 'image')
    .is('deleted_at', null)
    .order('is_featured', { ascending: false })
    .limit(1)
    .maybeSingle()

  // Fetch hero video via same tags
  const { data: heroVideoData } = await (supabase as any)
    .from('media_files')
    .select('public_url')
    .contains('tags', ['page:20-years', 'hero'])
    .eq('file_type', 'video')
    .is('deleted_at', null)
    .order('is_featured', { ascending: false })
    .limit(1)
    .maybeSingle()

  // ─── Empathy Ledger voices for 20 years ───
  const elQuotes = await getELQuotes({ limit: 400, minImpact: 60 }).catch(() => [])
  const elStats = await getELStats().catch(() => ({ quotes: 0, transcripts: 0, stories: 0, media: 0 }))

  // Rachel's legacy quote — the strategic centerpiece
  const rachelLegacy = elQuotes.find(q =>
    (q.author_name || '').toLowerCase().includes('rachel') &&
    /(legacy|future|kids|generation|ancestors|right|safe)/i.test(q.quote_text || '') &&
    (q.quote_text || '').length > 60 &&
    (q.quote_text || '').length < 280
  )

  // 6 voices with rich, varied themes
  const seenAuthors = new Set<string>()
  const voices: { text: string; author: string; theme: string | null }[] = []
  for (const q of elQuotes) {
    const raw = (q.author_name || '').trim()
    const name = !raw || raw.toLowerCase() === 'unknown' ? 'Community Member' : raw
    if (seenAuthors.has(name)) continue
    if (!q.quote_text || q.quote_text.length < 50 || q.quote_text.length > 300) continue
    if (rachelLegacy && q.quote_text === rachelLegacy.quote_text) continue
    seenAuthors.add(name)
    voices.push({
      text: q.quote_text,
      author: name,
      theme: Array.isArray(q.themes) && q.themes.length > 0 ? q.themes[0] : null,
    })
    if (voices.length >= 6) break
  }

  return (
    <TwentyYearsClient
      heroImage={heroImageData?.public_url || null}
      heroVideo={heroVideoData?.public_url || assetUrl('/hero-assets/clips/palm-island-sunset.mp4')}
      voices={voices}
      elQuoteCount={elStats.quotes}
      elTranscriptCount={elStats.transcripts}
      rachelLegacy={rachelLegacy ? { text: rachelLegacy.quote_text, author: rachelLegacy.author_name || 'Rachel Atkinson' } : null}
    />
  )
}
