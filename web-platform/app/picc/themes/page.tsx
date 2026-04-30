/**
 * /picc/themes — admin curation for featured themes on /voices/pulse.
 *
 * The wider thematic aggregation on /voices/pulse stays real-time
 * (driven by extracted_quotes.theme + themes[]). This surface lets
 * editors lift specific themes to the top of that page with an
 * optional curator note framing why the theme matters this period.
 *
 * Each row points at a theme key already in use — adding a new feature
 * doesn't create the theme, it editorially elevates it.
 */
import { createServerSupabase } from '@/lib/supabase/client'
import FeaturedThemesClient from './FeaturedThemesClient'

export const metadata = {
  title: 'Featured themes — PICC Admin',
  description: 'Curate which community themes get top placement on /voices/pulse.',
}

export const dynamic = 'force-dynamic'

export interface FeaturedTheme {
  id: string
  theme: string
  curator_note: string | null
  display_order: number
  fiscal_year: string | null
  is_active: boolean
  created_at: string
  updated_at: string
}

export interface ThemeUsage {
  theme: string
  count: number
}

export default async function FeaturedThemesAdminPage() {
  const supabase = createServerSupabase()

  const [{ data: featured }, { data: usage }] = await Promise.all([
    supabase
      .from('featured_themes')
      .select('id, theme, curator_note, display_order, fiscal_year, is_active, created_at, updated_at')
      .order('display_order'),
    supabase
      .from('extracted_quotes')
      .select('theme')
      .or('is_validated.eq.true,suggested_for_report.eq.true')
      .not('theme', 'is', null)
      .limit(2000),
  ])

  const featuredRows = (featured || []) as FeaturedTheme[]

  // Aggregate theme usage from validated quotes (top 30 themes by count)
  const counts: Record<string, number> = {}
  for (const row of (usage || []) as { theme: string | null }[]) {
    const t = row.theme?.toLowerCase()
    if (!t) continue
    counts[t] = (counts[t] || 0) + 1
  }
  const topThemes: ThemeUsage[] = Object.entries(counts)
    .map(([theme, count]) => ({ theme, count }))
    .sort((a, b) => b.count - a.count)
    .slice(0, 30)

  return <FeaturedThemesClient initialFeatured={featuredRows} topThemes={topThemes} />
}
