import Link from 'next/link';
import { createServerSupabase } from '@/lib/supabase/client';
import {
  BarChart3, Users, BookOpen, Clock, TrendingUp,
  FileText, Mic, Settings, ArrowRight, AlertCircle
} from 'lucide-react';

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
    <div className="p-8">
      {/* Header */}
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900">Dashboard Overview</h1>
        <p className="text-gray-600 mt-1">Manage content, analytics, and community engagement</p>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          <div className="bg-white p-6 rounded-xl shadow-md border-l-4 border-blue-600">
            <div className="flex items-center justify-between mb-4">
              <div className="p-3 bg-blue-100 rounded-lg">
                <BookOpen className="w-6 h-6 text-blue-600" />
              </div>
              <div className="text-right">
                <div className="text-3xl font-bold text-gray-900">{totalStories || 0}</div>
                <div className="text-sm text-gray-600">Total Stories</div>
              </div>
            </div>
            <div className="text-sm text-gray-600">
              {publishedStories || 0} published
            </div>
          </div>

          <div className="bg-white p-6 rounded-xl shadow-md border-l-4 border-amber-600">
            <div className="flex items-center justify-between mb-4">
              <div className="p-3 bg-amber-100 rounded-lg">
                <Clock className="w-6 h-6 text-amber-600" />
              </div>
              <div className="text-right">
                <div className="text-3xl font-bold text-gray-900">{submittedStories || 0}</div>
                <div className="text-sm text-gray-600">Pending Review</div>
              </div>
            </div>
            <div className="text-sm text-amber-600 font-medium">
              {submittedStories ? 'Needs attention' : 'All caught up'}
            </div>
          </div>

          <div className="bg-white p-6 rounded-xl shadow-md border-l-4 border-teal-600">
            <div className="flex items-center justify-between mb-4">
              <div className="p-3 bg-teal-100 rounded-lg">
                <Users className="w-6 h-6 text-teal-600" />
              </div>
              <div className="text-right">
                <div className="text-3xl font-bold text-gray-900">{storytellers || 0}</div>
                <div className="text-sm text-gray-600">Storytellers</div>
              </div>
            </div>
            <div className="text-sm text-gray-600">
              Community members
            </div>
          </div>

          <div className="bg-white p-6 rounded-xl shadow-md border-l-4 border-purple-600">
            <div className="flex items-center justify-between mb-4">
              <div className="p-3 bg-purple-100 rounded-lg">
                <TrendingUp className="w-6 h-6 text-purple-600" />
              </div>
              <div className="text-right">
                <div className="text-3xl font-bold text-gray-900">100%</div>
                <div className="text-sm text-gray-600">Data Sovereignty</div>
              </div>
            </div>
            <div className="text-sm text-gray-600">
              Community controlled
            </div>
          </div>
      </div>

      {/* Quick Actions */}
      <div className="grid md:grid-cols-3 gap-6 mb-8">
          <Link
            href="/picc/admin/storytellers"
            className="bg-white p-6 rounded-xl shadow-md hover:shadow-lg border border-gray-200 hover:border-blue-300 transition-all group"
          >
            <div className="flex items-center gap-4 mb-4">
              <div className="p-3 bg-blue-100 rounded-lg group-hover:bg-blue-200 transition-colors">
                <Users className="w-6 h-6 text-blue-600" />
              </div>
              <h3 className="text-lg font-bold text-gray-900">Manage Stories</h3>
            </div>
            <p className="text-gray-600 text-sm mb-4">
              View, edit, and publish community stories
            </p>
            <div className="flex items-center gap-2 text-blue-600 font-semibold group-hover:gap-3 transition-all">
              <span>Manage</span>
              <ArrowRight className="w-4 h-4" />
            </div>
          </Link>

          <Link
            href="/picc/analytics"
            className="bg-white p-6 rounded-xl shadow-md hover:shadow-lg border border-gray-200 hover:border-teal-300 transition-all group"
          >
            <div className="flex items-center gap-4 mb-4">
              <div className="p-3 bg-teal-100 rounded-lg group-hover:bg-teal-200 transition-colors">
                <BarChart3 className="w-6 h-6 text-teal-600" />
              </div>
              <h3 className="text-lg font-bold text-gray-900">Analytics</h3>
            </div>
            <p className="text-gray-600 text-sm mb-4">
              View impact metrics and engagement data
            </p>
            <div className="flex items-center gap-2 text-teal-600 font-semibold group-hover:gap-3 transition-all">
              <span>View Analytics</span>
              <ArrowRight className="w-4 h-4" />
            </div>
          </Link>

          <div className="bg-gradient-to-br from-gray-50 to-gray-100 p-6 rounded-xl shadow-md border border-gray-300">
            <div className="flex items-center gap-4 mb-4">
              <div className="p-3 bg-gray-200 rounded-lg">
                <FileText className="w-6 h-6 text-gray-600" />
              </div>
              <h3 className="text-lg font-bold text-gray-900">Content Studio</h3>
            </div>
            <p className="text-gray-600 text-sm mb-4">
              Social media export and newsletter tools
            </p>
            <div className="flex items-center gap-2 text-gray-500 font-medium">
              <AlertCircle className="w-4 h-4" />
              <span className="text-sm">Coming in Phase 2</span>
            </div>
          </div>
      </div>

      {/* Pending Review */}
      {submittedStories && submittedStories > 0 && (
        <div className="bg-white p-6 rounded-xl shadow-md border border-gray-200 mb-8">
            <div className="flex items-center justify-between mb-6">
              <div className="flex items-center gap-3">
                <Clock className="w-6 h-6 text-amber-600" />
                <h2 className="text-xl font-bold text-gray-900">Pending Review</h2>
              </div>
              <Link
                href="/picc/admin/storytellers"
                className="text-blue-600 hover:text-blue-700 font-semibold text-sm"
              >
                View All →
              </Link>
            </div>

            {recentSubmissions && recentSubmissions.length > 0 ? (
              <div className="space-y-3">
                {recentSubmissions.map((story: any) => (
                  <div
                    key={story.id}
                    className="flex items-center justify-between p-4 bg-amber-50 border border-amber-200 rounded-lg hover:bg-amber-100 transition-colors"
                  >
                    <div className="flex-1">
                      <h3 className="font-semibold text-gray-900 mb-1">{story.title}</h3>
                      <div className="flex items-center gap-4 text-sm text-gray-600">
                        <span>
                          By: {story.profiles?.preferred_name || story.profiles?.full_name || 'Community Voice'}
                        </span>
                        <span>•</span>
                        <span>
                          {new Date(story.created_at).toLocaleDateString()}
                        </span>
                      </div>
                    </div>
                    <Link
                      href={`/stories/${story.id}`}
                      className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white font-semibold rounded-lg transition-all"
                    >
                      Review
                    </Link>
                  </div>
                ))}
              </div>
            ) : (
              <p className="text-gray-600 text-center py-8">No submissions pending review</p>
            )}
        </div>
      )}

      {/* Phase 2 Preview */}
      <div className="bg-gradient-to-r from-blue-900 to-purple-900 text-white p-8 rounded-xl shadow-lg">
        <h2 className="text-2xl font-bold mb-4">Coming Soon: Phase 2 Features</h2>
        <p className="text-blue-100 mb-6">
          Enhanced tools for content management, social media, and community engagement
        </p>
        <div className="grid md:grid-cols-3 gap-6">
          <div>
            <div className="font-semibold mb-2 flex items-center gap-2">
              <FileText className="w-5 h-5" />
              Content Studio
            </div>
            <p className="text-sm text-blue-200">
              Export stories to social media, create quote cards, generate newsletters
            </p>
          </div>
          <div>
            <div className="font-semibold mb-2 flex items-center gap-2">
              <Mic className="w-5 h-5" />
              Newsletter Builder
            </div>
            <p className="text-sm text-blue-200">
              Create and send newsletters with story highlights and impact metrics
            </p>
          </div>
          <div>
            <div className="font-semibold mb-2 flex items-center gap-2">
              <BarChart3 className="w-5 h-5" />
              Advanced Analytics
            </div>
            <p className="text-sm text-blue-200">
              Detailed insights, custom reports, and funder-ready exports
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
