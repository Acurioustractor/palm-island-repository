/**
 * Server helper for retrieving curated design elements.
 *
 * Page builders use this to pull from the priority palette instead of
 * picking elements ad-hoc:
 *
 *   const heroes = await getPromotedElements({ category: 'infographic' });
 *
 * Defaults to status='priority' so only top-voted elements come through.
 */
import { createClient as createServiceClient } from '@supabase/supabase-js'
import { ELEMENTS, type DesignElement, type ElementCategory } from './elements-registry'
import { assetUrl } from '@/lib/media/asset-url'

type Status = 'concept' | 'approved' | 'priority' | 'retire'

export interface PromotedElement extends DesignElement {
  status: Status
  score: number
  intended_use: string | null
  notes: string | null
  previewUrl: string | null
  variantUrl: string | null
}

export async function getPromotedElements(opts: {
  category?: ElementCategory
  status?: Status | Status[]
  minScore?: number
} = {}): Promise<PromotedElement[]> {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL
  const key = process.env.SUPABASE_SERVICE_ROLE_KEY
  if (!url || !key) return []

  const supabase = createServiceClient(url, key, { auth: { persistSession: false } })

  let q = supabase.from('design_element_votes').select('*')
  const wantedStatus = opts.status ?? 'priority'
  q = Array.isArray(wantedStatus) ? q.in('status', wantedStatus) : q.eq('status', wantedStatus)
  if (opts.minScore !== undefined) q = q.gte('score', opts.minScore)

  const { data: votes } = await q
  const voteBySlug = new Map((votes ?? []).map((v: any) => [v.slug as string, v]))

  return ELEMENTS
    .filter((el) => (opts.category ? el.category === opts.category : true))
    .filter((el) => voteBySlug.has(el.slug))
    .map((el) => {
      const v = voteBySlug.get(el.slug)!
      return {
        ...el,
        status: v.status as Status,
        score: v.score as number,
        intended_use: (v.intended_use ?? null) as string | null,
        notes: (v.notes ?? null) as string | null,
        previewUrl: el.previewType === 'image' ? assetUrl(el.previewSrc) : null,
        variantUrl: el.variantSrc ? assetUrl(el.variantSrc) : null,
      }
    })
    .sort((a, b) => b.score - a.score)
}
