'use client';

import React, { useState, useEffect } from 'react';
import { createClient } from '@/lib/supabase/client';
import { BarChart3, TrendingUp, Users, BookOpen, Heart, Eye } from 'lucide-react';
import Breadcrumbs from '@/components/wiki/Breadcrumbs';

export default function AnalyticsPage() {
  const [stats, setStats] = useState({
    totalStories: 0,
    totalStorytellers: 0,
    totalViews: 0,
    storiesThisMonth: 0,
    categoryCounts: [] as any[],
    recentActivity: [] as any[],
  });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function fetchAnalytics() {
      const supabase = createClient();

      // Fetch total stories
      const { count: storyCount } = await supabase
        .from('stories')
        .select('*', { count: 'exact', head: true })
        .eq('is_public', true);

      // Fetch unique storytellers
      const { data: stories } = await supabase
        .from('stories')
        .select('storyteller_id')
        .eq('is_public', true);

      const uniqueStorytellers = new Set(stories?.map(s => s.storyteller_id).filter(Boolean));

      // Stories this month
      const monthAgo = new Date();
      monthAgo.setMonth(monthAgo.getMonth() - 1);

      const { count: monthCount } = await supabase
        .from('stories')
        .select('*', { count: 'exact', head: true })
        .eq('is_public', true)
        .gte('created_at', monthAgo.toISOString());

      // Category breakdown
      const { data: allStories } = await supabase
        .from('stories')
        .select('story_category')
        .eq('is_public', true);

      const categoryCounts = Object.entries(
        allStories?.reduce((acc: any, story: any) => {
          acc[story.story_category] = (acc[story.story_category] || 0) + 1;
          return acc;
        }, {}) || {}
      )
        .map(([category, count]) => ({ category, count }))
        .sort((a, b) => (b.count as number) - (a.count as number));

      // Recent activity
      const { data: recentStories } = await supabase
        .from('stories')
        .select(`
          id,
          title,
          created_at,
          storyteller:storyteller_id (
            preferred_name,
            full_name
          )
        `)
        .eq('is_public', true)
        .order('created_at', { ascending: false })
        .limit(10);

      setStats({
        totalStories: storyCount || 0,
        totalStorytellers: uniqueStorytellers.size,
        totalViews: 0, // Would need analytics table
        storiesThisMonth: monthCount || 0,
        categoryCounts,
        recentActivity: recentStories || [],
      });

      setLoading(false);
    }

    fetchAnalytics();
  }, []);

  const breadcrumbs = [
    { label: 'Wiki', href: '/wiki', icon: BookOpen },
    { label: 'Analytics', href: '/analytics' },
  ];

  if (loading) {
    return (
      <div className="container mx-auto px-4 py-8">
        <div className="text-center">
          <div className="animate-spin rounded-full h-16 w-16 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-xl text-gray-700">Loading analytics...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-8 max-w-7xl">
      <Breadcrumbs items={breadcrumbs} className="mb-6" />

      {/* Header */}
      <div className="mb-8">
        <h1 className="text-4xl font-bold text-gray-900 mb-4 flex items-center gap-3">
          <BarChart3 className="h-10 w-10 text-blue-600" />
          Community Analytics
        </h1>
        <p className="text-xl text-gray-600">
          Insights and metrics about community storytelling and engagement
        </p>
      </div>

      {/* Key Metrics */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
        <div className="bg-gradient-to-br from-blue-500 to-blue-600 rounded-xl p-6 text-white shadow-lg">
          <div className="flex items-center justify-between mb-4">
            <BookOpen className="h-8 w-8" />
            <TrendingUp className="h-6 w-6 opacity-75" />
          </div>
          <div className="text-4xl font-bold mb-1">{stats.totalStories}</div>
          <div className="text-blue-100">Total Stories</div>
        </div>

        <div className="bg-gradient-to-br from-purple-500 to-purple-600 rounded-xl p-6 text-white shadow-lg">
          <div className="flex items-center justify-between mb-4">
            <Users className="h-8 w-8" />
            <TrendingUp className="h-6 w-6 opacity-75" />
          </div>
          <div className="text-4xl font-bold mb-1">{stats.totalStorytellers}</div>
          <div className="text-purple-100">Active Storytellers</div>
        </div>

        <div className="bg-gradient-to-br from-green-500 to-green-600 rounded-xl p-6 text-white shadow-lg">
          <div className="flex items-center justify-between mb-4">
            <Heart className="h-8 w-8" />
            <TrendingUp className="h-6 w-6 opacity-75" />
          </div>
          <div className="text-4xl font-bold mb-1">{stats.storiesThisMonth}</div>
          <div className="text-green-100">This Month</div>
        </div>

        <div className="bg-gradient-to-br from-orange-500 to-orange-600 rounded-xl p-6 text-white shadow-lg">
          <div className="flex items-center justify-between mb-4">
            <Eye className="h-8 w-8" />
            <TrendingUp className="h-6 w-6 opacity-75" />
          </div>
          <div className="text-4xl font-bold mb-1">{stats.totalViews || 'N/A'}</div>
          <div className="text-orange-100">Total Views</div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {/* Category Breakdown */}
        <div className="bg-white rounded-xl border border-gray-200 p-6">
          <h2 className="text-2xl font-bold text-gray-900 mb-6">Stories by Category</h2>
          <div className="space-y-4">
            {stats.categoryCounts.map((item: any) => {
              const percentage = (item.count / stats.totalStories) * 100;
              return (
                <div key={item.category}>
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-sm font-medium text-gray-900 capitalize">
                      {item.category.replace('_', ' ')}
                    </span>
                    <span className="text-sm text-gray-600">{item.count} stories</span>
                  </div>
                  <div className="h-3 bg-gray-200 rounded-full overflow-hidden">
                    <div
                      className="h-full bg-gradient-to-r from-blue-500 to-teal-500"
                      style={{ width: `${percentage}%` }}
                    />
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Recent Activity */}
        <div className="bg-white rounded-xl border border-gray-200 p-6">
          <h2 className="text-2xl font-bold text-gray-900 mb-6">Recent Activity</h2>
          <div className="space-y-4">
            {stats.recentActivity.map((story: any) => (
              <div
                key={story.id}
                className="flex items-start gap-3 pb-4 border-b border-gray-100 last:border-0 last:pb-0"
              >
                <div className="h-10 w-10 rounded-full bg-gradient-to-br from-blue-500 to-teal-500 flex-shrink-0 flex items-center justify-center text-white font-bold text-sm">
                  {story.title[0]}
                </div>
                <div className="flex-1 min-w-0">
                  <div className="font-medium text-gray-900 mb-1 line-clamp-1">
                    {story.title}
                  </div>
                  <div className="flex items-center gap-2 text-xs text-gray-600">
                    <span>
                      {story.storyteller?.preferred_name ||
                        story.storyteller?.full_name ||
                        'Community Voice'}
                    </span>
                    <span>•</span>
                    <span>
                      {new Date(story.created_at).toLocaleDateString('en-AU', {
                        day: 'numeric',
                        month: 'short',
                      })}
                    </span>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Growth Insights */}
      <div className="mt-8 bg-gradient-to-br from-blue-50 to-teal-50 rounded-xl border-2 border-blue-200 p-6">
        <h2 className="text-2xl font-bold text-gray-900 mb-4 flex items-center gap-2">
          <TrendingUp className="h-6 w-6 text-blue-600" />
          Community Growth
        </h2>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 text-center">
          <div>
            <div className="text-3xl font-bold text-blue-600 mb-1">
              {stats.storiesThisMonth}
            </div>
            <div className="text-gray-700">Stories this month</div>
          </div>
          <div>
            <div className="text-3xl font-bold text-purple-600 mb-1">
              {(stats.totalStories / stats.totalStorytellers || 0).toFixed(1)}
            </div>
            <div className="text-gray-700">Avg stories per storyteller</div>
          </div>
          <div>
            <div className="text-3xl font-bold text-green-600 mb-1">
              {stats.totalStorytellers}
            </div>
            <div className="text-gray-700">Active contributors</div>
          </div>
        </div>
      </div>
    </div>
  );
}
