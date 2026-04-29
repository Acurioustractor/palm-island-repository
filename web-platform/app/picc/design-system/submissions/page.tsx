/**
 * /picc/design-system/submissions — admin review queue for /share-art.
 *
 * Lists every community-submitted artwork awaiting review (page_context
 * = 'community-art' AND is_public = false). Each row has approve /
 * archive controls. Approving sets is_public = true so the piece can
 * be promoted into the curated palette via the design-system voting
 * page (already exists at /picc/design-system).
 *
 * Closes the loop on /share-art — submissions land in media_files,
 * then surface here for human review.
 */
import { createServerSupabase } from '@/lib/supabase/client'
import SubmissionsQueueClient from './SubmissionsQueueClient'

export const metadata = {
  title: 'Art Submissions Queue — PICC Admin',
  description: 'Review and approve community-submitted artwork.',
}

export const dynamic = 'force-dynamic'

export interface ArtSubmission {
  id: string
  public_url: string
  title: string | null
  caption: string | null
  attribution: string | null
  tags: string[] | null
  metadata: Record<string, any> | null
  created_at: string
  is_public: boolean
}

export default async function SubmissionsPage() {
  const supabase = createServerSupabase()
  const { data, error } = await supabase
    .from('media_files')
    .select('id, public_url, title, caption, attribution, tags, metadata, created_at, is_public')
    .eq('page_context', 'community-art')
    .is('deleted_at', null)
    .order('created_at', { ascending: false })
    .limit(200)

  const submissions = (data || []) as ArtSubmission[]

  return (
    <SubmissionsQueueClient
      submissions={submissions}
      loadError={error?.message ?? null}
    />
  )
}
