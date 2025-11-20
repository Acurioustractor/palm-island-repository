'use client';

import React, { useState, useEffect } from 'react';
import { createClient } from '@/lib/supabase/client';
import { BarChart3, TrendingUp, Users, BookOpen, Heart, Eye, Award, Sparkles, Globe } from 'lucide-react';
import Breadcrumbs from '@/components/wiki/Breadcrumbs';
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

      const elderStories = allStoriesWithDetails?.filter(s => s.storyteller?.is_elder).length || 0;
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
        totalViews: 0, // Would need analytics table
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
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-8">
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
      </div>

      {/* Cultural Metrics */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
        <div className="bg-gradient-to-br from-amber-500 to-amber-600 rounded-xl p-6 text-white shadow-lg">
          <div className="flex items-center justify-between mb-4">
            <Award className="h-8 w-8" />
            <Globe className="h-6 w-6 opacity-75" />
          </div>
          <div className="text-4xl font-bold mb-1">{stats.elderStories}</div>
          <div className="text-amber-100">Elder Stories</div>
        </div>

        <div className="bg-gradient-to-br from-teal-500 to-teal-600 rounded-xl p-6 text-white shadow-lg">
          <div className="flex items-center justify-between mb-4">
            <Sparkles className="h-8 w-8" />
            <Globe className="h-6 w-6 opacity-75" />
          </div>
          <div className="text-4xl font-bold mb-1">{stats.traditionalKnowledge}</div>
          <div className="text-teal-100">Traditional Knowledge</div>
        </div>

        <div className="bg-gradient-to-br from-rose-500 to-rose-600 rounded-xl p-6 text-white shadow-lg">
          <div className="flex items-center justify-between mb-4">
            <Heart className="h-8 w-8" />
            <TrendingUp className="h-6 w-6 opacity-75" />
          </div>
          <div className="text-4xl font-bold mb-1">{stats.serviceCounts.length}</div>
          <div className="text-rose-100">Active Services</div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 mb-8">
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

      {/* Service Breakdown & Top Storytellers */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 mb-8">
        {/* Service Breakdown */}
        <div className="bg-white rounded-xl border border-gray-200 p-6">
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-2xl font-bold text-gray-900">Stories by Service</h2>
            <Link href="/wiki/services" className="text-sm text-rose-600 hover:text-rose-700 font-medium">
              View all →
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
                      <span className="text-sm text-gray-600 ml-2">{service.count}</span>
                    </div>
                    <div className="h-3 bg-gray-200 rounded-full overflow-hidden">
                      <div
                        className="h-full bg-gradient-to-r from-rose-500 to-pink-500"
                        style={{ width: `${percentage}%` }}
                      />
                    </div>
                  </div>
                );
              })}
            </div>
          ) : (
            <p className="text-gray-500 text-center py-8">No service data available</p>
          )}
        </div>

        {/* Top Storytellers */}
        <div className="bg-white rounded-xl border border-gray-200 p-6">
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-2xl font-bold text-gray-900">Top Contributors</h2>
            <Link href="/wiki/people" className="text-sm text-purple-600 hover:text-purple-700 font-medium">
              View all →
            </Link>
          </div>
          <div className="space-y-3">
            {stats.topStorytellers.map((storyteller: any, idx) => (
              <Link
                key={storyteller.id}
                href={`/wiki/people/${storyteller.id}`}
                className="flex items-center gap-3 p-3 rounded-lg hover:bg-purple-50 transition-colors group"
              >
                <div className="flex-shrink-0 w-10 h-10 bg-gradient-to-br from-purple-500 to-blue-500 rounded-full flex items-center justify-center text-white font-bold text-sm">
                  {idx + 1}
                </div>
                <div className="flex-1 min-w-0">
                  <div className="font-medium text-gray-900 truncate group-hover:text-purple-700">
                    {storyteller.name}
                  </div>
                  <div className="text-xs text-gray-500">
                    {storyteller.count} {storyteller.count === 1 ? 'story' : 'stories'}
                  </div>
                </div>
                <Award className={`h-5 w-5 flex-shrink-0 ${
                  idx === 0 ? 'text-amber-500' : idx === 1 ? 'text-gray-400' : idx === 2 ? 'text-amber-700' : 'text-gray-300'
                }`} />
              </Link>
            ))}
          </div>
        </div>
      </div>

      {/* Growth Insights */}
      <div className="bg-gradient-to-br from-blue-50 to-teal-50 rounded-xl border-2 border-blue-200 p-6">
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
