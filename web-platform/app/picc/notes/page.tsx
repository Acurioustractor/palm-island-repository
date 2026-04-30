/**
 * /picc/notes — admin scratchpad for staff-only observations.
 *
 * Internal quick-capture surface for staff to jot reflections during
 * community work — without a title, narrative arc, or publication
 * intent. Distinct from /share-note (public) and from full stories.
 *
 * Stored in stories with:
 *   story_type:   'community_story'
 *   category:     'admin-note'
 *   access_level: 'restricted'
 *   is_public:    false
 *   metadata:     { is_admin_note: true, author?, tags? }
 *
 * Admin reviews + adds inline. Server-rendered list with a client
 * composer at the top.
 */
import { createServerSupabase } from '@/lib/supabase/client'
import NotesScratchpadClient from './NotesScratchpadClient'

export const metadata = {
  title: 'Notes — PICC Admin',
  description: 'Internal staff scratchpad for observations and field notes.',
}

export const dynamic = 'force-dynamic'

export interface AdminNote {
  id: string
  content: string | null
  metadata: Record<string, any> | null
  created_at: string
}

export default async function NotesPage() {
  const supabase = createServerSupabase()
  const { data, error } = await supabase
    .from('stories')
    .select('id, content, metadata, created_at')
    .filter('metadata->>is_admin_note', 'eq', 'true')
    .is('deleted_at', null)
    .order('created_at', { ascending: false })
    .limit(200)

  const notes = (data || []) as AdminNote[]

  return <NotesScratchpadClient initialNotes={notes} loadError={error?.message ?? null} />
}
