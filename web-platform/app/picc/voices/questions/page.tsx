/**
 * /picc/voices/questions — admin queue for community questions.
 *
 * Mirror of /picc/design-system/submissions but for the question flow
 * shipped at /voices/ask. Lists every story where metadata.is_question
 * is true, with controls to compose an answer + publish, edit existing
 * answers, or archive.
 *
 * Approve flow:
 *   metadata.answer = "<text>"
 *   metadata.question_status = "answered"
 *   is_public = true
 *
 * Archive flow:
 *   deleted_at = now()
 *
 * Once published, answered questions surface on /voices/questions.
 */
import Link from 'next/link'
import { createServerSupabase } from '@/lib/supabase/client'
import QuestionsQueueClient from './QuestionsQueueClient'

export const metadata = {
  title: 'Questions queue — PICC Admin',
  description: 'Review and answer community questions submitted via /voices/ask.',
}

export const dynamic = 'force-dynamic'

export interface CommunityQuestion {
  id: string
  title: string | null
  content: string | null
  category: string | null
  metadata: Record<string, any> | null
  created_at: string
  updated_at: string | null
  is_public: boolean
}

export default async function QuestionsAdminPage() {
  const supabase = createServerSupabase()
  const { data, error } = await supabase
    .from('stories')
    .select('id, title, content, category, metadata, created_at, updated_at, is_public')
    .filter('metadata->>is_question', 'eq', 'true')
    .is('deleted_at', null)
    .order('created_at', { ascending: false })
    .limit(200)

  const questions = (data || []) as CommunityQuestion[]

  return (
    <QuestionsQueueClient
      questions={questions}
      loadError={error?.message ?? null}
    />
  )
}
