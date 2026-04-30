import { createServerSupabase } from '@/lib/supabase/client'
import EldersRoomClient from './EldersRoomClient'

export const dynamic = 'force-dynamic'
export const metadata = {
  title: 'Elders Room | PICC',
  description: 'Your space to curate stories, review youth messages, and manage your Elder profile.',
}

export default async function EldersRoomPage() {
  const supabase = createServerSupabase()

  // Fetch all elders for the selector (in case admin is managing on behalf)
  const { data: elders } = await supabase
    .from('profiles')
    .select('id, full_name, preferred_name, profile_image_url')
    .eq('is_elder', true)
    .eq('show_in_directory', true)
    .order('full_name')

  // Fetch pending youth engagements
  const { data: pendingEngagements } = await supabase
    .from('youth_engagement')
    .select('*')
    .eq('status', 'pending')
    .order('created_at', { ascending: false })
    .limit(100)

  return (
    <div className="min-h-screen bg-warm-50">
      <div className="max-w-5xl mx-auto px-4 py-10">
        {/* Header */}
        <div className="mb-10">
          <h1 className="text-3xl font-bold text-stone-800">
            Elders Room
          </h1>
          <p className="text-stone-600 mt-1">
            Your Space, Your Stories
          </p>
        </div>

        <EldersRoomClient
          elders={elders ?? []}
          initialPendingEngagements={pendingEngagements ?? []}
        />
      </div>
    </div>
  )
}
