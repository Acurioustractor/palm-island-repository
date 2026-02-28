/**
 * Fetch historical artifacts for the history page
 *
 * Provides server-side data access to the historical_artifacts table,
 * grouped by chapter reference for easy integration with the history page.
 */

import { createClient } from '@supabase/supabase-js'

export interface HistoricalArtifact {
  id: string
  title: string
  artifact_type: string
  source_name: string | null
  source_url: string | null
  date_original: string | null
  content_summary: string | null
  image_url: string | null
  tags: string[]
  chapter_ref: string | null
  provenance_notes: string | null
}

export interface ChapterArtifacts {
  [chapterRef: string]: HistoricalArtifact[]
}

function getSupabase() {
  return createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
  )
}

/**
 * Fetch all verified artifacts grouped by chapter
 */
export async function getArtifactsByChapter(): Promise<ChapterArtifacts> {
  const supabase = getSupabase()

  const { data, error } = await supabase
    .from('historical_artifacts')
    .select(
      'id, title, artifact_type, source_name, source_url, date_original, content_summary, image_url, tags, chapter_ref, provenance_notes'
    )
    .eq('is_verified', true)
    .neq('cultural_sensitivity_level', 'restricted')
    .order('date_original', { ascending: true, nullsFirst: false })

  if (error || !data) {
    console.error('Failed to fetch artifacts:', error?.message)
    return {}
  }

  const grouped: ChapterArtifacts = {}
  for (const artifact of data) {
    const ref = artifact.chapter_ref || 'uncategorized'
    if (!grouped[ref]) grouped[ref] = []
    grouped[ref].push(artifact)
  }

  return grouped
}

/**
 * Fetch artifacts for a specific chapter
 */
export async function getChapterArtifacts(
  chapterRef: string,
  limit = 10
): Promise<HistoricalArtifact[]> {
  const supabase = getSupabase()

  const { data, error } = await supabase
    .from('historical_artifacts')
    .select(
      'id, title, artifact_type, source_name, source_url, date_original, content_summary, image_url, tags, chapter_ref, provenance_notes'
    )
    .eq('chapter_ref', chapterRef)
    .eq('is_verified', true)
    .neq('cultural_sensitivity_level', 'restricted')
    .order('date_original', { ascending: true, nullsFirst: false })
    .limit(limit)

  if (error) {
    console.error(`Failed to fetch artifacts for ${chapterRef}:`, error.message)
    return []
  }

  return data || []
}

/**
 * Get artifact counts per chapter (for showing badge counts)
 */
export async function getArtifactCounts(): Promise<Record<string, number>> {
  const supabase = getSupabase()

  const { data, error } = await supabase
    .from('historical_artifacts')
    .select('chapter_ref')
    .eq('is_verified', true)
    .neq('cultural_sensitivity_level', 'restricted')

  if (error || !data) return {}

  const counts: Record<string, number> = {}
  for (const row of data) {
    const ref = row.chapter_ref || 'uncategorized'
    counts[ref] = (counts[ref] || 0) + 1
  }
  return counts
}
