import { NextResponse } from 'next/server'
import { getPiccStorytellers } from '@/lib/empathy-ledger/el-storytellers'
import { PICC_STAFF_OVERRIDES } from '@/lib/staff/picc-staff'

export const dynamic = 'force-dynamic'
export const revalidate = 0

// GET — full PICC storyteller roster (Elders + staff + community) for
// attendee/contributor pickers. Returns [] when EL is unreachable.
// ?elders_only=true narrows to Elders.
export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url)
    const eldersOnly = searchParams.get('elders_only') === 'true'

    const everyone = await getPiccStorytellers({ elders: eldersOnly, limit: 500 })
    const fromEl = everyone.map((e) => ({
      id: e.id,
      slug: e.slug,
      name: e.display_name,
      role: e.role,
      photo_url: e.photo_url,
      location: e.location,
      quote_count: e.quote_count,
      is_elder: e.is_elder,
      source: 'el' as const,
    }))

    // Merge PICC staff overrides — people not yet surfaced by EL but
    // who are regular attendees. Skip if a same-name record already
    // came from EL (EL wins).
    const fromElNames = new Set(fromEl.map((e) => e.name.toLowerCase().trim()))
    const fromOverrides = eldersOnly
      ? []
      : PICC_STAFF_OVERRIDES
          .filter((s) => !fromElNames.has(s.name.toLowerCase().trim()))
          .map((s) => ({
            id: s.id,
            slug: s.slug || s.id,
            name: s.name,
            role: s.role,
            photo_url: s.photo_url,
            location: s.location || null,
            quote_count: 0,
            is_elder: false,
            source: 'override' as const,
          }))

    const data = [...fromEl, ...fromOverrides]
      .filter((e) => e.name)
      .sort((a, b) => {
        if (a.is_elder !== b.is_elder) return a.is_elder ? -1 : 1
        return a.name.localeCompare(b.name)
      })
    return NextResponse.json({ data, count: data.length, el_count: fromEl.length, override_count: fromOverrides.length })
  } catch (err: any) {
    return NextResponse.json({ data: [], count: 0, error: err?.message || 'Failed' }, { status: 200 })
  }
}
