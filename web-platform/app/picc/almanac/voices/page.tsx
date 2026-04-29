/**
 * /picc/almanac/voices — sprint tracker for the 20 *new* named voices
 * the almanac targets. Editors add captures as they happen, mark
 * consent, push through draft → review → approved → published.
 *
 * Existing-voice context (right column): how many extracted_quotes,
 * elder_quotes, and community_visions already exist in the DB so
 * editors can pull from those if they need filler.
 */
import { createServerComponentClient } from '@/lib/supabase/server'
import { getPiccServices } from '@/lib/services/el-services'
import VoicesClient, { type AlmanacVoice, type VoiceContext } from './VoicesClient'

export const metadata = {
  title: 'Almanac Voices — PICC Admin',
  description: 'Sprint tracker for the 20 new voices the almanac targets.',
}

export const dynamic = 'force-dynamic'

const TARGET = 20

async function loadVoices(): Promise<AlmanacVoice[]> {
  const supabase = await createServerComponentClient()
  const { data, error } = await (supabase as any)
    .from('almanac_voices')
    .select('*')
    .order('created_at', { ascending: false })
  if (error) {
    console.error('voices load failed', error)
    return []
  }
  return (data ?? []) as AlmanacVoice[]
}

async function loadContext(): Promise<VoiceContext> {
  const supabase = await createServerComponentClient()

  const [eq, eqReady, elder, vis] = await Promise.all([
    (supabase as any).from('extracted_quotes').select('id', { count: 'exact', head: true }),
    (supabase as any).from('extracted_quotes').select('id', { count: 'exact', head: true })
      .eq('suggested_for_report', true).eq('is_validated', true),
    (supabase as any).from('elder_quotes').select('id', { count: 'exact', head: true })
      .eq('is_validated', true).eq('permission_level', 'public'),
    (supabase as any).from('community_visions').select('id', { count: 'exact', head: true })
      .eq('is_approved', true),
  ])

  return {
    extracted_total: eq.count ?? 0,
    extracted_ready: eqReady.count ?? 0,
    elder_public: elder.count ?? 0,
    visions_approved: vis.count ?? 0,
  }
}

export default async function AlmanacVoicesPage() {
  const [voices, context, services] = await Promise.all([
    loadVoices(),
    loadContext(),
    getPiccServices().catch(() => []),
  ])
  return (
    <VoicesClient
      voices={voices}
      context={context}
      target={TARGET}
      services={services.map((s) => ({ slug: s.slug, name: s.name }))}
    />
  )
}
