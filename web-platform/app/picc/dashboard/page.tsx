import Link from 'next/link';
import { createServerSupabase } from '@/lib/supabase/client';
import { ChevronRight } from 'lucide-react';

export default async function PICCDashboard() {
  const supabase = createServerSupabase();

  // Get counts
  const { count: totalStories } = await supabase
    .from('stories')
    .select('*', { count: 'exact', head: true });

  const { count: publishedStories } = await supabase
    .from('stories')
    .select('*', { count: 'exact', head: true })
    .eq('status', 'published');

  const { count: submittedStories } = await supabase
    .from('stories')
    .select('*', { count: 'exact', head: true })
    .eq('status', 'submitted');

  const { count: storytellers } = await supabase
    .from('profiles')
    .select('*', { count: 'exact', head: true });

  const { count: mediaFiles } = await supabase
    .from('media_files')
    .select('*', { count: 'exact', head: true })
    .eq('is_public', true)
    .is('deleted_at', null);

  // Get recent submissions
  const { data: recentSubmissions } = await supabase
    .from('stories')
    .select(`
      id,
      title,
      created_at,
      status,
      storyteller_id,
      profiles!inner(full_name, preferred_name)
    `)
    .eq('status', 'submitted')
    .order('created_at', { ascending: false })
    .limit(5);

  return (
    <div>
      {/* Header */}
      <div className="mb-8">
        <p className="text-xs font-semibold uppercase tracking-wider text-gray-400">PICC Admin</p>
        <h1 className="text-4xl font-bold text-gray-900 mt-1">Dashboard</h1>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-6 mb-10">
        <div>
          <p className="text-3xl font-bold text-gray-900">{totalStories || 0}</p>
          <p className="text-sm text-gray-500 mt-1">Total stories</p>
          <p className="text-xs text-gray-400 mt-2">{publishedStories || 0} published</p>
        </div>
        <div>
          <p className="text-3xl font-bold text-gray-900">{submittedStories || 0}</p>
          <p className="text-sm text-gray-500 mt-1">Pending review</p>
          <p className="text-xs text-gray-400 mt-2">{submittedStories ? 'Needs attention' : 'All caught up'}</p>
        </div>
        <div>
          <p className="text-3xl font-bold text-gray-900">{storytellers || 0}</p>
          <p className="text-sm text-gray-500 mt-1">Storytellers</p>
          <p className="text-xs text-gray-400 mt-2">Community members</p>
        </div>
        <div>
          <p className="text-3xl font-bold text-gray-900">{mediaFiles || 0}</p>
          <p className="text-sm text-gray-500 mt-1">Photos & media</p>
          <p className="text-xs text-gray-400 mt-2">Community library</p>
        </div>
      </div>

      {/* Quick Actions */}
      <div className="mb-10">
        <p className="text-xs font-semibold uppercase tracking-wider text-gray-400 mb-3">Quick actions</p>
        <div className="border border-gray-200 rounded-xl divide-y divide-gray-100">
          <Link
            href="/picc/stories"
            className="flex items-center justify-between px-6 py-5 hover:bg-gray-50 transition-colors group"
          >
            <div>
              <p className="text-sm font-medium text-gray-900">Stories</p>
              <p className="text-xs text-gray-500 mt-0.5">View, edit, and publish community stories</p>
            </div>
            <ChevronRight className="h-4 w-4 text-gray-300 group-hover:text-gray-500 transition-colors" />
          </Link>
          <Link
            href="/picc/analytics"
            className="flex items-center justify-between px-6 py-5 hover:bg-gray-50 transition-colors group"
          >
            <div>
              <p className="text-sm font-medium text-gray-900">Analytics</p>
              <p className="text-xs text-gray-500 mt-0.5">View impact metrics and engagement data</p>
            </div>
            <ChevronRight className="h-4 w-4 text-gray-300 group-hover:text-gray-500 transition-colors" />
          </Link>
          <Link
            href="/picc/media"
            className="flex items-center justify-between px-6 py-5 hover:bg-gray-50 transition-colors group"
          >
            <div>
              <p className="text-sm font-medium text-gray-900">Media Library</p>
              <p className="text-xs text-gray-500 mt-0.5">Browse and manage community photos and media</p>
            </div>
            <ChevronRight className="h-4 w-4 text-gray-300 group-hover:text-gray-500 transition-colors" />
          </Link>
          <Link
            href="/picc/annual-report-data"
            className="flex items-center justify-between px-6 py-5 hover:bg-gray-50 transition-colors group"
          >
            <div>
              <p className="text-sm font-medium text-gray-900">Annual Report Data</p>
              <p className="text-xs text-gray-500 mt-0.5">Manage data and metrics for annual reports</p>
            </div>
            <ChevronRight className="h-4 w-4 text-gray-300 group-hover:text-gray-500 transition-colors" />
          </Link>
        </div>
      </div>

      {/* Pending Review */}
      {(submittedStories ?? 0) > 0 && (
        <div className="mb-8">
          <div className="flex items-center justify-between mb-3">
            <p className="text-xs font-semibold uppercase tracking-wider text-gray-400">Pending review</p>
            <Link
              href="/picc/stories"
              className="text-sm text-gray-500 hover:text-gray-900 transition-colors"
            >
              View all &rarr;
            </Link>
          </div>

          <div className="border border-gray-200 rounded-xl divide-y divide-gray-100">
            {recentSubmissions && recentSubmissions.length > 0 ? (
              recentSubmissions.map((story: any) => (
                <div
                  key={story.id}
                  className="flex items-center justify-between px-6 py-4"
                >
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium text-gray-900 truncate">{story.title}</p>
                    <div className="flex items-center gap-3 text-xs text-gray-500 mt-1">
                      <span>
                        {story.profiles?.preferred_name || story.profiles?.full_name || 'Community Voice'}
                      </span>
                      <span>&middot;</span>
                      <span>
                        {new Date(story.created_at).toLocaleDateString()}
                      </span>
                    </div>
                  </div>
                  <Link
                    href={`/stories/${story.id}`}
                    className="text-sm text-gray-500 hover:text-gray-900 font-medium transition-colors ml-4"
                  >
                    Review &rarr;
                  </Link>
                </div>
              ))
            ) : (
              <p className="text-gray-500 text-center py-8 text-sm">No submissions pending review</p>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
