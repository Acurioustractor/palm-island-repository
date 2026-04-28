import { NextResponse } from 'next/server'
import { createRouteHandlerClient } from '@/lib/supabase/server'
import { ELEMENTS, CATEGORIES } from '@/lib/design-system/elements-registry'
import { assetUrl } from '@/lib/media/asset-url'

export const dynamic = 'force-dynamic'

interface VoteRow {
  slug: string
  status: 'concept' | 'approved' | 'priority' | 'retire'
  vote: 'fire' | 'up' | 'meh' | 'down' | null
  score: number
  intended_use: string | null
  notes: string | null
  updated_at: string
}

export async function GET() {
  const supabase = await createRouteHandlerClient()
  const { data: votes } = await (supabase as any).from('design_element_votes').select('*')

  const voteBySlug = new Map<string, VoteRow>(
    (votes ?? []).map((v: any) => [v.slug as string, v as VoteRow]),
  )

  const enriched = ELEMENTS.map((el) => {
    const v = voteBySlug.get(el.slug)
    return {
      ...el,
      previewUrl:  el.previewType === 'image' ? assetUrl(el.previewSrc) : null,
      variantUrl:  el.variantSrc ? assetUrl(el.variantSrc) : null,
      status:       v?.status       ?? 'concept',
      vote:         v?.vote         ?? null,
      score:        v?.score        ?? 0,
      intended_use: v?.intended_use ?? null,
      notes:        v?.notes        ?? null,
      updated_at:   v?.updated_at   ?? null,
    }
  })

  return NextResponse.json({ categories: CATEGORIES, elements: enriched })
}
