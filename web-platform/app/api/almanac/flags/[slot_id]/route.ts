import { NextResponse } from 'next/server'
import { createRouteHandlerClient } from '@/lib/supabase/server'

export const dynamic = 'force-dynamic'

export async function DELETE(
  _req: Request,
  { params }: { params: Promise<{ slot_id: string }> },
) {
  const { slot_id } = await params
  const supabase = await createRouteHandlerClient()
  const { error } = await (supabase as any)
    .from('almanac_photo_flags')
    .delete()
    .eq('slot_id', slot_id)
  if (error) return NextResponse.json({ error: error.message }, { status: 500 })
  return NextResponse.json({ ok: true })
}
