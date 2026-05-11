/**
 * Empathy Ledger v2 — transcript archive.
 *
 * EL holds 137 PICC interview transcripts (audio + video + text). ALL are
 * currently `privacy_level=private` — they sit in the archive awaiting
 * explicit Elder / community publishing approval before any content can
 * be displayed publicly.
 *
 * This module exposes ONLY metadata-safe fields (title, era, duration,
 * sensitivity, status, themes-only-if-allowed) for the Atlas Transcripts
 * lens. transcript_content / text / formatted_text / segments are never
 * pulled here.
 */

const EL_REST = 'https://yvnuayzslukamizrlhwb.supabase.co/rest/v1'
const PICC_ORG_ID_EL = '084f851c-72e0-41fb-b5ba-f3088f44862d'

export interface ELTranscriptMeta {
  id: string
  title: string | null
  storyteller_id: string | null
  recording_date: string | null
  duration_seconds: number | null
  word_count: number | null
  cultural_sensitivity: string | null
  privacy_level: string | null
  status: string | null
  has_audio: boolean
  has_video: boolean
  era_label: string | null
  event_year_min: number | null
  event_year_max: number | null
  ai_summary: string | null
  themes: string[] | null
  requires_elder_review: boolean
  elder_reviewed_at: string | null
}

export async function getPiccTranscriptMetadata(): Promise<ELTranscriptMeta[]> {
  const key = process.env.EMPATHY_LEDGER_SERVICE_KEY
  if (!key) return []
  const ctrl = new AbortController()
  const timer = setTimeout(() => ctrl.abort(), 15_000)
  try {
    const url =
      `${EL_REST}/transcripts?organization_id=eq.${PICC_ORG_ID_EL}` +
      `&select=id,title,storyteller_id,recording_date,duration_seconds,word_count,` +
      `cultural_sensitivity,privacy_level,status,audio_url,video_url,era_label,` +
      `event_year_min,event_year_max,ai_summary,themes,requires_elder_review,elder_reviewed_at` +
      `&order=recording_date.desc.nullslast` +
      `&limit=200`
    const res = await fetch(url, {
      headers: { apikey: key, Authorization: `Bearer ${key}` },
      cache: 'no-store',
      signal: ctrl.signal,
    })
    if (!res.ok) return []
    const arr = (await res.json()) as Array<Record<string, unknown>>
    return arr.map((r) => ({
      id: r.id as string,
      title: (r.title as string | null) ?? null,
      storyteller_id: (r.storyteller_id as string | null) ?? null,
      recording_date: (r.recording_date as string | null) ?? null,
      duration_seconds: (r.duration_seconds as number | null) ?? null,
      word_count: (r.word_count as number | null) ?? null,
      cultural_sensitivity: (r.cultural_sensitivity as string | null) ?? null,
      privacy_level: (r.privacy_level as string | null) ?? null,
      status: (r.status as string | null) ?? null,
      has_audio: Boolean(r.audio_url),
      has_video: Boolean(r.video_url),
      era_label: (r.era_label as string | null) ?? null,
      event_year_min: (r.event_year_min as number | null) ?? null,
      event_year_max: (r.event_year_max as number | null) ?? null,
      ai_summary: (r.ai_summary as string | null) ?? null,
      themes: Array.isArray(r.themes) ? (r.themes as string[]) : null,
      requires_elder_review: Boolean(r.requires_elder_review),
      elder_reviewed_at: (r.elder_reviewed_at as string | null) ?? null,
    }))
  } catch {
    return []
  } finally {
    clearTimeout(timer)
  }
}
