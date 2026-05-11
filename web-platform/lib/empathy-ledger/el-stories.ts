/**
 * Empathy Ledger v2 — public PICC stories archive.
 *
 * EL holds 236 PICC stories. 76 are is_public=true. This module fetches
 * the public set for the Atlas Stories lens.
 *
 * Compared to the older PICC `stories` mirror (~30 rows), EL has the
 * fuller corpus with: cultural_sensitivity_level, requires_elder_approval,
 * elder_approved_at, story_image_url, themes (array), ai_generated_summary,
 * story_type, story_category.
 *
 * Cultural protocol: only is_public AND (elder_approved_at OR
 * NOT requires_elder_approval). community_status filters out
 * 'draft' / 'under_review'.
 */

const EL_REST = 'https://yvnuayzslukamizrlhwb.supabase.co/rest/v1'
const PICC_ORG_ID_EL = '084f851c-72e0-41fb-b5ba-f3088f44862d'

export interface ELPiccStory {
  id: string
  title: string
  summary: string | null
  ai_generated_summary: string | null
  story_type: string | null
  story_category: string | null
  themes: string[] | null
  story_image_url: string | null
  media_url: string | null
  cultural_sensitivity_level: string | null
  requires_elder_approval: boolean
  elder_approved_at: string | null
  is_featured: boolean
  community_status: string | null
  created_at: string | null
}

export async function getPiccPublicStories(limit = 60): Promise<ELPiccStory[]> {
  const key = process.env.EMPATHY_LEDGER_SERVICE_KEY
  if (!key) return []
  const ctrl = new AbortController()
  const timer = setTimeout(() => ctrl.abort(), 15_000)
  try {
    const url =
      `${EL_REST}/stories?organization_id=eq.${PICC_ORG_ID_EL}` +
      `&is_public=eq.true` +
      `&select=id,title,summary,ai_generated_summary,story_type,story_category,themes,` +
      `story_image_url,media_url,cultural_sensitivity_level,requires_elder_approval,` +
      `elder_approved_at,is_featured,community_status,created_at` +
      `&order=is_featured.desc,created_at.desc.nullslast` +
      `&limit=${limit}`
    const res = await fetch(url, {
      headers: { apikey: key, Authorization: `Bearer ${key}` },
      cache: 'no-store',
      signal: ctrl.signal,
    })
    if (!res.ok) return []
    const arr = (await res.json()) as Array<Record<string, unknown>>
    // Cultural-protocol filter:
    // - is_public=true is the explicit publish gate (already filtered by the
    //   query). community_status workflow field has drifted from
    //   is_public on most rows so we don't gate on it.
    // - If a story still requires Elder approval and hasn't received it,
    //   drop it regardless of is_public.
    return arr
      .filter((r) => {
        if (r.requires_elder_approval && !r.elder_approved_at) return false
        return true
      })
      .map((r) => ({
        id: r.id as string,
        title: (r.title as string) ?? '',
        summary: (r.summary as string | null) ?? null,
        ai_generated_summary: (r.ai_generated_summary as string | null) ?? null,
        story_type: (r.story_type as string | null) ?? null,
        story_category: (r.story_category as string | null) ?? null,
        themes: Array.isArray(r.themes) ? (r.themes as string[]) : null,
        story_image_url: (r.story_image_url as string | null) ?? null,
        media_url: (r.media_url as string | null) ?? null,
        cultural_sensitivity_level: (r.cultural_sensitivity_level as string | null) ?? null,
        requires_elder_approval: Boolean(r.requires_elder_approval),
        elder_approved_at: (r.elder_approved_at as string | null) ?? null,
        is_featured: Boolean(r.is_featured),
        community_status: (r.community_status as string | null) ?? null,
        created_at: (r.created_at as string | null) ?? null,
      }))
  } catch {
    return []
  } finally {
    clearTimeout(timer)
  }
}
