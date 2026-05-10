import { NextResponse } from 'next/server'
import { getPiccElders } from '@/lib/empathy-ledger/el-storytellers'

export const dynamic = 'force-dynamic'
export const revalidate = 0

// GET — name + role list of PICC Elders for autocomplete pickers (e.g.
// meeting attendees on /picc/meetings/process). Reads from EL v2 via
// getPiccElders(). Returns [] if EL v2 unreachable.
export async function GET() {
  try {
    const elders = await getPiccElders()
    const data = elders
      .map((e) => ({
        id: e.id,
        slug: e.slug,
        name: e.display_name,
        role: e.role,
        photo_url: e.photo_url,
        location: e.location,
        quote_count: e.quote_count,
      }))
      .filter((e) => e.name)
      .sort((a, b) => a.name.localeCompare(b.name))
    return NextResponse.json({ data, count: data.length })
  } catch (err: any) {
    return NextResponse.json({ data: [], count: 0, error: err?.message || 'Failed' }, { status: 200 })
  }
}
