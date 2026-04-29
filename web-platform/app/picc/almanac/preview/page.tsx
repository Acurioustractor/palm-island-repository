/**
 * /picc/almanac/preview — full-page preview of the 2024-25 almanac with
 * editor chrome. Iframes the public /annual-report/2024-25/almanac and
 * shows a sticky sidebar with: section jump-nav, photo flag count per
 * section, checklist readiness, sprint progress.
 *
 * Editors get one screen they can scroll the whole almanac in (as it
 * would print/publish) without losing the admin controls.
 */
import Link from 'next/link'
import { createServerComponentClient } from '@/lib/supabase/server'
import PreviewClient, { type SectionFlagCount } from './PreviewClient'
import { IMAGERY_SLOTS } from '@/lib/almanac/imagery-system'

export const metadata = {
  title: 'Almanac Preview — PICC Admin',
  description: 'Full-page preview of the 2024-25 almanac with flag overlays + readiness sidebar.',
}

export const dynamic = 'force-dynamic'

const ALMANAC_URL = '/annual-report/2024-25/almanac'

const SECTIONS = [
  { id: 'ceo-message', label: 'CEO message' },
  { id: 'chair-message', label: 'Chair message' },
  { id: 'year-in-numbers', label: 'Year in numbers' },
  { id: 'highlights', label: 'Highlights' },
  { id: 'services', label: 'Services' },
  { id: 'board', label: 'Board' },
  { id: 'elder-lanterns', label: 'Elder lanterns' },
  { id: 'community-voices', label: 'Community voices' },
  { id: 'innovation', label: 'Innovation' },
  { id: 'financials', label: 'Financials' },
  { id: 'forward', label: 'Forward' },
  { id: 'back-cover', label: 'Back cover' },
]

async function loadFlagSummary(): Promise<{ unresolved: number; bySection: SectionFlagCount[] }> {
  const supabase = await createServerComponentClient()
  const { data } = await (supabase as any)
    .from('almanac_photo_flags')
    .select('slot_id, flag_type, resolved_at')

  // Map slot → section via IMAGERY_SLOTS
  const sectionForSlot: Record<string, string> = {}
  for (const slot of IMAGERY_SLOTS) sectionForSlot[slot.id] = slot.section

  const counter: Record<string, number> = {}
  let unresolved = 0
  for (const row of data ?? []) {
    if (row.flag_type === 'approved') continue
    if (row.resolved_at) continue
    unresolved += 1
    const section = sectionForSlot[row.slot_id] ?? 'unknown'
    counter[section] = (counter[section] ?? 0) + 1
  }

  const bySection: SectionFlagCount[] = SECTIONS.map((s) => ({
    id: s.id,
    label: s.label,
    flagCount: counter[s.id] ?? 0,
  }))

  return { unresolved, bySection }
}

async function loadChecklistSummary() {
  const supabase = await createServerComponentClient()
  const { data } = await (supabase as any)
    .from('almanac_checklist_items')
    .select('status, urgency')
  const items = data ?? []
  const total = items.length
  const done = items.filter((i: any) => i.status === 'done' || i.status === 'n-a').length
  const urgentOpen = items.filter(
    (i: any) => i.urgency === 'urgent' && i.status !== 'done' && i.status !== 'n-a',
  ).length
  return {
    total,
    done,
    urgentOpen,
    pct: total === 0 ? 0 : Math.round((done / total) * 100),
  }
}

async function loadVoiceSummary() {
  const supabase = await createServerComponentClient()
  const { data } = await (supabase as any).from('almanac_voices').select('status')
  const items = data ?? []
  const counted = items.filter((v: any) => v.status !== 'declined').length
  return { counted, target: 20 }
}

export default async function AlmanacPreviewPage() {
  const [flags, checklist, voices] = await Promise.all([
    loadFlagSummary(),
    loadChecklistSummary(),
    loadVoiceSummary(),
  ])

  return (
    <div className="min-h-screen bg-stone-50">
      <div className="px-4 py-4 border-b border-stone-200 bg-white flex items-center justify-between gap-4 flex-wrap">
        <div>
          <p className="text-xs font-semibold tracking-[0.2em] uppercase text-picc-ochre mb-1">
            Internal · Almanac · Preview
          </p>
          <h1 className="font-serif text-xl text-stone-800 italic">
            2024-25 Almanac — preview with flag overlays
          </h1>
        </div>
        <div className="flex gap-3 text-sm">
          <Link href="/picc/almanac/checklist" className="px-3 py-1.5 rounded-lg bg-stone-100 hover:bg-stone-200 text-stone-700">
            Checklist · {checklist.pct}%
          </Link>
          <Link href="/picc/almanac/photos" className="px-3 py-1.5 rounded-lg bg-stone-100 hover:bg-stone-200 text-stone-700">
            Photos · {flags.unresolved} flagged
          </Link>
          <Link href="/picc/almanac/voices" className="px-3 py-1.5 rounded-lg bg-stone-100 hover:bg-stone-200 text-stone-700">
            Voices · {voices.counted}/{voices.target}
          </Link>
          <a
            href={ALMANAC_URL}
            target="_blank"
            rel="noopener"
            className="px-3 py-1.5 rounded-lg bg-stone-800 text-white hover:bg-stone-900"
          >
            Open in new tab ↗
          </a>
        </div>
      </div>

      <PreviewClient
        almanacUrl={ALMANAC_URL}
        sections={flags.bySection}
        checklist={checklist}
        voices={voices}
        flagsTotal={flags.unresolved}
      />
    </div>
  )
}
