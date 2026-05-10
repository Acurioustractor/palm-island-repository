import { NextResponse } from 'next/server'
import { getPiccStorytellers } from '@/lib/empathy-ledger/el-storytellers'

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
    const data = everyone
      .map((e) => ({
        id: e.id,
        slug: e.slug,
        name: e.display_name,
        role: e.role,
        photo_url: e.photo_url,
        location: e.location,
        quote_count: e.quote_count,
        is_elder: e.is_elder,
      }))
      .filter((e) => e.name)
      .sort((a, b) => {
        // Elders first, then alphabetical
        if (a.is_elder !== b.is_elder) return a.is_elder ? -1 : 1
        return a.name.localeCompare(b.name)
      })
    return NextResponse.json({ data, count: data.length })
  } catch (err: any) {
    return NextResponse.json({ data: [], count: 0, error: err?.message || 'Failed' }, { status: 200 })
  }
}
