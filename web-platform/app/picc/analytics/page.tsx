'use client';

import React, { useState, useEffect } from 'react';
import { createClient } from '@/lib/supabase/client';
import { Loader2 } from 'lucide-react';
import Link from 'next/link';

export default function AnalyticsPage() {
  const [stats, setStats] = useState({
    totalStories: 0,
    totalStorytellers: 0,
    totalViews: 0,
    storiesThisMonth: 0,
    elderStories: 0,
    traditionalKnowledge: 0,
    categoryCounts: [] as any[],
    serviceCounts: [] as any[],
    topStorytellers: [] as any[],
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

      // Elder stories and traditional knowledge
      const { data: allStoriesWithDetails } = await supabase
        .from('stories')
        .select(`
          id,
          traditional_knowledge,
          storyteller:storyteller_id (
            is_elder
          )
        `)
        .eq('is_public', true);

      const elderStories = allStoriesWithDetails?.filter((s: any) => {
        const storyteller = Array.isArray(s.storyteller) ? s.storyteller[0] : s.storyteller;
        return storyteller?.is_elder;
      }).length || 0;
      const traditionalKnowledge = allStoriesWithDetails?.filter(s => s.traditional_knowledge).length || 0;

      // Service breakdown
      const { data: storiesWithService } = await supabase
        .from('stories')
        .select(`
          id,
          service:service_id (
            id,
            service_name
          )
        `)
        .eq('is_public', true)
        .not('service_id', 'is', null);

      const serviceMap = new Map<string, { name: string; count: number }>();
      storiesWithService?.forEach((story: any) => {
        if (story.service) {
          const existing = serviceMap.get(story.service.id);
          if (existing) {
            existing.count++;
          } else {
            serviceMap.set(story.service.id, {
              name: story.service.service_name,
              count: 1,
            });
          }
        }
      });

      const serviceCounts = Array.from(serviceMap.values())
        .sort((a, b) => b.count - a.count);

      // Top storytellers (leaderboard)
      const { data: storiesWithStorytellers } = await supabase
        .from('stories')
        .select(`
          id,
          storyteller:storyteller_id (
            id,
            preferred_name,
            full_name
          )
        `)
        .eq('is_public', true)
        .not('storyteller_id', 'is', null);

      const storytellerMap = new Map<string, { id: string; name: string; count: number }>();
      storiesWithStorytellers?.forEach((story: any) => {
        if (story.storyteller) {
          const existing = storytellerMap.get(story.storyteller.id);
          if (existing) {
            existing.count++;
          } else {
            storytellerMap.set(story.storyteller.id, {
              id: story.storyteller.id,
              name: story.storyteller.preferred_name || story.storyteller.full_name,
              count: 1,
            });
          }
        }
      });

      const topStorytellers = Array.from(storytellerMap.values())
        .sort((a, b) => b.count - a.count)
        .slice(0, 10);

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
        totalViews: 0,
        storiesThisMonth: monthCount || 0,
        elderStories,
        traditionalKnowledge,
        categoryCounts,
        serviceCounts,
        topStorytellers,
        recentActivity: recentStories || [],
      });

      setLoading(false);
    }

    fetchAnalytics();
  }, []);

  if (loading) {
    return (
      <div className="flex items-center justify-center py-24">
        <Loader2 className="h-8 w-8 animate-spin text-gray-400" />
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto">
      {/* Header */}
      <div className="mb-8">
        <p className="text-xs font-semibold uppercase tracking-wider text-gray-400">Insights</p>
        <h1 className="text-4xl font-bold text-gray-900 mt-1">Community Analytics</h1>
      </div>

      {/* Key Metrics */}
      <div className="grid grid-cols-2 md:grid-cols-3 gap-6 mb-10">
        <div>
          <p className="text-3xl font-bold text-gray-900">{stats.totalStories}</p>
          <p className="text-sm text-gray-500 mt-1">Total stories</p>
        </div>
        <div>
          <p className="text-3xl font-bold text-gray-900">{stats.totalStorytellers}</p>
          <p className="text-sm text-gray-500 mt-1">Active storytellers</p>
        </div>
        <div>
          <p className="text-3xl font-bold text-gray-900">{stats.storiesThisMonth}</p>
          <p className="text-sm text-gray-500 mt-1">This month</p>
        </div>
      </div>

      {/* Cultural Metrics */}
      <div className="grid grid-cols-2 md:grid-cols-3 gap-6 mb-10">
        <div>
          <p className="text-3xl font-bold text-gray-900">{stats.elderStories}</p>
          <p className="text-sm text-gray-500 mt-1">Elder stories</p>
        </div>
        <div>
          <p className="text-3xl font-bold text-gray-900">{stats.traditionalKnowledge}</p>
          <p className="text-sm text-gray-500 mt-1">Traditional knowledge</p>
        </div>
        <div>
          <p className="text-3xl font-bold text-gray-900">{stats.serviceCounts.length}</p>
          <p className="text-sm text-gray-500 mt-1">Active services</p>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 mb-10">
        {/* Category Breakdown */}
        <div className="border border-gray-200 rounded-xl p-6">
          <p className="text-xs font-semibold uppercase tracking-wider text-gray-400 mb-6">Stories by Category</p>
          <div className="space-y-4">
            {stats.categoryCounts.map((item: any) => {
              const percentage = (item.count / stats.totalStories) * 100;
              return (
                <div key={item.category}>
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-sm font-medium text-gray-900 capitalize">
                      {item.category.replace('_', ' ')}
                    </span>
                    <span className="text-sm text-gray-500">{item.count}</span>
                  </div>
                  <div className="h-2 bg-gray-100 rounded-full overflow-hidden">
                    <div
                      className="h-full bg-gray-900 rounded-full"
                      style={{ width: `${percentage}%` }}
                    />
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Recent Activity */}
        <div className="border border-gray-200 rounded-xl p-6">
          <p className="text-xs font-semibold uppercase tracking-wider text-gray-400 mb-6">Recent Activity</p>
          <div className="space-y-4">
            {stats.recentActivity.map((story: any) => (
              <div
                key={story.id}
                className="flex items-start gap-3 pb-4 border-b border-gray-100 last:border-0 last:pb-0"
              >
                <div className="h-8 w-8 rounded-full bg-gray-100 flex-shrink-0 flex items-center justify-center text-gray-500 font-medium text-xs">
                  {story.title[0]}
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium text-gray-900 line-clamp-1">
                    {story.title}
                  </p>
                  <div className="flex items-center gap-2 text-xs text-gray-500 mt-0.5">
                    <span>
                      {story.storyteller?.preferred_name ||
                        story.storyteller?.full_name ||
                        'Community Voice'}
                    </span>
                    <span>&middot;</span>
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

      {/* Service Breakdown & Top Storytellers */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 mb-10">
        {/* Service Breakdown */}
        <div className="border border-gray-200 rounded-xl p-6">
          <div className="flex items-center justify-between mb-6">
            <p className="text-xs font-semibold uppercase tracking-wider text-gray-400">Stories by Service</p>
            <Link href="/wiki/services" className="text-xs text-gray-500 hover:text-gray-900 transition-colors">
              View all &rarr;
            </Link>
          </div>
          {stats.serviceCounts.length > 0 ? (
            <div className="space-y-4">
              {stats.serviceCounts.slice(0, 8).map((service: any, idx) => {
                const percentage = (service.count / stats.totalStories) * 100;
                return (
                  <div key={idx}>
                    <div className="flex items-center justify-between mb-2">
                      <span className="text-sm font-medium text-gray-900 truncate">
                        {service.name}
                      </span>
                      <span className="text-sm text-gray-500 ml-2">{service.count}</span>
                    </div>
                    <div className="h-2 bg-gray-100 rounded-full overflow-hidden">
                      <div
                        className="h-full bg-gray-900 rounded-full"
                        style={{ width: `${percentage}%` }}
                      />
                    </div>
                  </div>
                );
              })}
            </div>
          ) : (
            <p className="text-sm text-gray-500 text-center py-8">No service data available</p>
          )}
        </div>

        {/* Top Storytellers */}
        <div className="border border-gray-200 rounded-xl p-6">
          <div className="flex items-center justify-between mb-6">
            <p className="text-xs font-semibold uppercase tracking-wider text-gray-400">Top Contributors</p>
            <Link href="/wiki/people" className="text-xs text-gray-500 hover:text-gray-900 transition-colors">
              View all &rarr;
            </Link>
          </div>
          <div className="space-y-1">
            {stats.topStorytellers.map((storyteller: any, idx) => (
              <Link
                key={storyteller.id}
                href={`/wiki/people/${storyteller.id}`}
                className="flex items-center gap-3 px-3 py-3 rounded-lg hover:bg-gray-50 transition-colors group"
              >
                <span className="flex-shrink-0 w-6 text-xs font-medium text-gray-400 text-right">
                  {idx + 1}
                </span>
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium text-gray-900 truncate group-hover:text-gray-700">
                    {storyteller.name}
                  </p>
                </div>
                <span className="text-xs text-gray-500">
                  {storyteller.count} {storyteller.count === 1 ? 'story' : 'stories'}
                </span>
              </Link>
            ))}
          </div>
        </div>
      </div>

      {/* Growth Insights */}
      <div className="border border-gray-200 rounded-xl p-6">
        <p className="text-xs font-semibold uppercase tracking-wider text-gray-400 mb-6">Community Growth</p>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div>
            <p className="text-3xl font-bold text-gray-900">{stats.storiesThisMonth}</p>
            <p className="text-sm text-gray-500 mt-1">Stories this month</p>
          </div>
          <div>
            <p className="text-3xl font-bold text-gray-900">
              {(stats.totalStories / stats.totalStorytellers || 0).toFixed(1)}
            </p>
            <p className="text-sm text-gray-500 mt-1">Avg per storyteller</p>
          </div>
          <div>
            <p className="text-3xl font-bold text-gray-900">{stats.totalStorytellers}</p>
            <p className="text-sm text-gray-500 mt-1">Active contributors</p>
          </div>
        </div>
      </div>
    </div>
  );
}
