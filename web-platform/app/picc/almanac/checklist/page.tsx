/**
 * /picc/almanac/checklist — single pane of every blocker before the
 * 2024-25 almanac can ship. Pulls from `almanac_checklist_items` (the
 * known data/sign-off/content/video items) and joins live counts from
 * `almanac_photo_flags` so editors see one readiness number.
 */
import { createServerComponentClient } from '@/lib/supabase/server'
import ChecklistClient, { type ChecklistItem, type PhotoFlagSummary } from './ChecklistClient'

export const metadata = {
  title: 'Almanac Checklist — PICC Admin',
  description: 'Every blocker before the 2024-25 almanac ships. Data, sign-offs, photos, content, video.',
}

export const dynamic = 'force-dynamic'

async function loadItems(): Promise<ChecklistItem[]> {
  const supabase = await createServerComponentClient()
  const { data, error } = await (supabase as any)
    .from('almanac_checklist_items')
    .select('*')
    .order('urgency', { ascending: true })
    .order('sort_order', { ascending: true })

  if (error) {
    console.error('checklist load failed', error)
    return []
  }
  return (data ?? []) as ChecklistItem[]
}

async function loadPhotoFlagSummary(): Promise<PhotoFlagSummary> {
  const supabase = await createServerComponentClient()
  const { data } = await (supabase as any)
    .from('almanac_photo_flags')
    .select('flag_type, resolved_at')

  const summary: PhotoFlagSummary = {
    total: 0,
    wrong: 0,
    review: 0,
    placeholder: 0,
    approved: 0,
    unresolved: 0,
  }
  for (const row of data ?? []) {
    summary.total += 1
    summary[row.flag_type as keyof PhotoFlagSummary] =
      (summary[row.flag_type as keyof PhotoFlagSummary] as number) + 1
    if (!row.resolved_at && row.flag_type !== 'approved') summary.unresolved += 1
  }
  return summary
}

export default async function AlmanacChecklistPage() {
  const [items, photoFlags] = await Promise.all([loadItems(), loadPhotoFlagSummary()])
  return <ChecklistClient items={items} photoFlags={photoFlags} />
}
