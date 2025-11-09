'use client';

import React, { useState, useEffect } from 'react';
import { createClient } from '@/lib/supabase/client';
import Link from 'next/link';
import {
  TrendingUp, Network, MapPin, Calendar, Tag, Users, Heart,
  BarChart3, PieChart, Activity, Sparkles, Globe
} from 'lucide-react';
import Breadcrumbs from '@/components/wiki/Breadcrumbs';

interface PatternAnalysis {
  topCategories: Array<{ category: string; count: number; percentage: number }>;
  topLocations: Array<{ location: string; count: number }>;
  topStorytel

lers: Array<{ name: string; count: number }>;
  topServices: Array<{ name: string; count: number }>;
  monthlyTrends: Array<{ month: string; count: number }>;
  culturalMetrics: {
    elderStories: number;
    traditionalKnowledge: number;
    communityMembers: number;
    languages: number;
  };
  keywords: Array<{ word: string; frequency: number }>;
}

export default function PatternsPage() {
  const [patterns, setPatterns] = useState<PatternAnalysis | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function analyzePatterns() {
      const supabase = createClient();

      // Fetch all stories with related data
      const { data: stories } = await supabase
        .from('stories')
        .select(`
          id,
          title,
          summary,
          story_category,
          location,
          traditional_knowledge,
          created_at,
          storyteller:storyteller_id (
            id,
            preferred_name,
            full_name,
            is_elder,
            language_group
          ),
          service:service_id (
            id,
            service_name
          )
        `)
        .eq('is_public', true);

      if (!stories) {
        setLoading(false);
        return;
      }

      // Analyze categories
      const categoryMap = new Map<string, number>();
      stories.forEach(s => {
        if (s.story_category) {
          categoryMap.set(s.story_category, (categoryMap.get(s.story_category) || 0) + 1);
        }
      });
      const topCategories = Array.from(categoryMap.entries())
        .map(([category, count]) => ({
          category,
          count,
          percentage: (count / stories.length) * 100
        }))
        .sort((a, b) => b.count - a.count)
        .slice(0, 8);

      // Analyze locations
      const locationMap = new Map<string, number>();
      stories.forEach(s => {
        if (s.location) {
          locationMap.set(s.location, (locationMap.get(s.location) || 0) + 1);
        }
      });
      const topLocations = Array.from(locationMap.entries())
        .map(([location, count]) => ({ location, count }))
        .sort((a, b) => b.count - a.count)
        .slice(0, 5);

      // Analyze storytellers
      const storytellerMap = new Map<string, { name: string; count: number }>();
      stories.forEach(s => {
        if (s.storyteller) {
          const existing = storytellerMap.get(s.storyteller.id);
          const name = s.storyteller.preferred_name || s.storyteller.full_name;
          if (existing) {
            existing.count++;
          } else {
            storytellerMap.set(s.storyteller.id, { name, count: 1 });
          }
        }
      });
      const topStorytellers = Array.from(storytellerMap.values())
        .sort((a, b) => b.count - a.count)
        .slice(0, 5);

      // Analyze services
      const serviceMap = new Map<string, { name: string; count: number }>();
      stories.forEach(s => {
        if (s.service) {
          const existing = serviceMap.get(s.service.id);
          if (existing) {
            existing.count++;
          } else {
            serviceMap.set(s.service.id, { name: s.service.service_name, count: 1 });
          }
        }
      });
      const topServices = Array.from(serviceMap.values())
        .sort((a, b) => b.count - a.count)
        .slice(0, 5);

      // Analyze monthly trends (last 6 months)
      const now = new Date();
      const monthlyMap = new Map<string, number>();
      for (let i = 5; i >= 0; i--) {
        const date = new Date(now.getFullYear(), now.getMonth() - i, 1);
        const key = date.toLocaleDateString('en-US', { month: 'short', year: '2-digit' });
        monthlyMap.set(key, 0);
      }
      stories.forEach(s => {
        const date = new Date(s.created_at);
        const key = date.toLocaleDateString('en-US', { month: 'short', year: '2-digit' });
        if (monthlyMap.has(key)) {
          monthlyMap.set(key, (monthlyMap.get(key) || 0) + 1);
        }
      });
      const monthlyTrends = Array.from(monthlyMap.entries()).map(([month, count]) => ({ month, count }));

      // Cultural metrics
      const elderStories = stories.filter(s => s.storyteller?.is_elder).length;
      const traditionalKnowledge = stories.filter(s => s.traditional_knowledge).length;
      const uniqueStorytellers = new Set(stories.map(s => s.storyteller?.id).filter(Boolean)).size;
      const uniqueLanguages = new Set(stories.map(s => s.storyteller?.language_group).filter(Boolean)).size;

      // Extract keywords from summaries (simple word frequency)
      const allText = stories
        .map(s => `${s.title} ${s.summary || ''}`)
        .join(' ')
        .toLowerCase();

      const stopWords = new Set(['the', 'a', 'an', 'and', 'or', 'but', 'in', 'on', 'at', 'to', 'for', 'of', 'with', 'by', 'from', 'as', 'is', 'was', 'are', 'were', 'been', 'be', 'have', 'has', 'had', 'do', 'does', 'did', 'will', 'would', 'could', 'should', 'may', 'might', 'can', 'this', 'that', 'these', 'those', 'i', 'you', 'he', 'she', 'it', 'we', 'they', 'them', 'their', 'our', 'your']);

      const words = allText.match(/\b[a-z]{4,}\b/g) || [];
      const wordMap = new Map<string, number>();
      words.forEach(word => {
        if (!stopWords.has(word)) {
          wordMap.set(word, (wordMap.get(word) || 0) + 1);
        }
      });
      const keywords = Array.from(wordMap.entries())
        .map(([word, frequency]) => ({ word, frequency }))
        .sort((a, b) => b.frequency - a.frequency)
        .slice(0, 12);

      setPatterns({
        topCategories,
        topLocations,
        topStorytellers,
        topServices,
        monthlyTrends,
        culturalMetrics: {
          elderStories,
          traditionalKnowledge,
          communityMembers: uniqueStorytellers,
          languages: uniqueLanguages,
        },
        keywords,
      });

      setLoading(false);
    }

    analyzePatterns();
  }, []);

  const breadcrumbs = [
    { label: 'Wiki', href: '/wiki' },
    { label: 'Insights', href: '/analytics' },
    { label: 'Patterns & Trends', href: '/insights/patterns' },
  ];

  if (loading) {
    return (
      <div className="container mx-auto px-4 py-8">
        <div className="text-center">
          <div className="animate-spin rounded-full h-16 w-16 border-b-2 border-purple-600 mx-auto mb-4"></div>
          <p className="text-xl text-gray-700">Analyzing story patterns...</p>
        </div>
      </div>
    );
  }

  if (!patterns) {
    return (
      <div className="container mx-auto px-4 py-8">
        <p className="text-center text-gray-600">No data available for analysis</p>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-8 max-w-7xl">
      <Breadcrumbs items={breadcrumbs} className="mb-6" />

      {/* Header */}
      <div className="mb-8">
        <h1 className="text-4xl font-bold text-gray-900 mb-4 flex items-center gap-3">
          <TrendingUp className="h-10 w-10 text-purple-600" />
          Story Patterns & Trends
        </h1>
        <p className="text-xl text-gray-600">
          Analyzing community knowledge to identify themes, connections, and insights
        </p>
      </div>

      {/* Cultural Metrics */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
        <div className="bg-gradient-to-br from-amber-500 to-amber-600 rounded-xl p-6 text-white shadow-lg">
          <Sparkles className="h-8 w-8 mb-3" />
          <div className="text-3xl font-bold mb-1">{patterns.culturalMetrics.elderStories}</div>
          <div className="text-amber-100 text-sm">Elder Stories</div>
        </div>
        <div className="bg-gradient-to-br from-teal-500 to-teal-600 rounded-xl p-6 text-white shadow-lg">
          <Globe className="h-8 w-8 mb-3" />
          <div className="text-3xl font-bold mb-1">{patterns.culturalMetrics.traditionalKnowledge}</div>
          <div className="text-teal-100 text-sm">Traditional Knowledge</div>
        </div>
        <div className="bg-gradient-to-br from-purple-500 to-purple-600 rounded-xl p-6 text-white shadow-lg">
          <Users className="h-8 w-8 mb-3" />
          <div className="text-3xl font-bold mb-1">{patterns.culturalMetrics.communityMembers}</div>
          <div className="text-purple-100 text-sm">Contributors</div>
        </div>
        <div className="bg-gradient-to-br from-blue-500 to-blue-600 rounded-xl p-6 text-white shadow-lg">
          <Activity className="h-8 w-8 mb-3" />
          <div className="text-3xl font-bold mb-1">{patterns.culturalMetrics.languages}</div>
          <div className="text-blue-100 text-sm">Language Groups</div>
        </div>
      </div>

      {/* Monthly Trends */}
      <div className="bg-white rounded-xl border border-gray-200 shadow-sm p-6 mb-8">
        <h2 className="text-2xl font-bold text-gray-900 mb-6 flex items-center gap-2">
          <Calendar className="h-6 w-6 text-blue-600" />
          Story Creation Trends (Last 6 Months)
        </h2>
        <div className="space-y-4">
          {patterns.monthlyTrends.map((item) => {
            const maxCount = Math.max(...patterns.monthlyTrends.map(m => m.count), 1);
            const percentage = (item.count / maxCount) * 100;
            return (
              <div key={item.month}>
                <div className="flex items-center justify-between mb-2">
                  <span className="text-sm font-medium text-gray-900">{item.month}</span>
                  <span className="text-sm text-gray-600">{item.count} stories</span>
                </div>
                <div className="h-4 bg-gray-200 rounded-full overflow-hidden">
                  <div
                    className="h-full bg-gradient-to-r from-blue-500 to-purple-500 rounded-full transition-all"
                    style={{ width: `${percentage}%` }}
                  />
                </div>
              </div>
            );
          })}
        </div>
      </div>

      <div className="grid md:grid-cols-2 gap-8 mb-8">
        {/* Top Categories */}
        <div className="bg-white rounded-xl border border-gray-200 shadow-sm p-6">
          <h2 className="text-2xl font-bold text-gray-900 mb-6 flex items-center gap-2">
            <Tag className="h-6 w-6 text-emerald-600" />
            Top Story Categories
          </h2>
          <div className="space-y-3">
            {patterns.topCategories.map((item) => (
              <div key={item.category}>
                <div className="flex items-center justify-between mb-1">
                  <span className="text-sm font-medium text-gray-900 capitalize">
                    {item.category.replace(/_/g, ' ')}
                  </span>
                  <span className="text-sm text-gray-600">{item.count} ({item.percentage.toFixed(0)}%)</span>
                </div>
                <div className="h-2 bg-gray-200 rounded-full overflow-hidden">
                  <div
                    className="h-full bg-gradient-to-r from-emerald-500 to-teal-500"
                    style={{ width: `${item.percentage}%` }}
                  />
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Top Locations */}
        <div className="bg-white rounded-xl border border-gray-200 shadow-sm p-6">
          <h2 className="text-2xl font-bold text-gray-900 mb-6 flex items-center gap-2">
            <MapPin className="h-6 w-6 text-rose-600" />
            Stories by Location
          </h2>
          {patterns.topLocations.length > 0 ? (
            <div className="space-y-4">
              {patterns.topLocations.map((item, idx) => (
                <Link
                  key={item.location}
                  href={`/wiki/places`}
                  className="flex items-center gap-3 p-3 rounded-lg hover:bg-rose-50 transition-colors group"
                >
                  <div className="flex-shrink-0 w-10 h-10 bg-gradient-to-br from-rose-500 to-pink-500 rounded-full flex items-center justify-center text-white font-bold text-sm">
                    {idx + 1}
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="font-medium text-gray-900 truncate group-hover:text-rose-700">
                      {item.location}
                    </div>
                    <div className="text-xs text-gray-500">
                      {item.count} {item.count === 1 ? 'story' : 'stories'}
                    </div>
                  </div>
                </Link>
              ))}
            </div>
          ) : (
            <p className="text-gray-500 text-center py-8">No location data available</p>
          )}
        </div>
      </div>

      <div className="grid md:grid-cols-2 gap-8 mb-8">
        {/* Top Storytellers */}
        <div className="bg-white rounded-xl border border-gray-200 shadow-sm p-6">
          <h2 className="text-2xl font-bold text-gray-900 mb-6 flex items-center gap-2">
            <Users className="h-6 w-6 text-purple-600" />
            Most Active Storytellers
          </h2>
          <div className="space-y-3">
            {patterns.topStorytellers.map((item, idx) => (
              <div
                key={idx}
                className="flex items-center gap-3 p-3 rounded-lg bg-purple-50"
              >
                <div className="flex-shrink-0 w-10 h-10 bg-gradient-to-br from-purple-500 to-blue-500 rounded-full flex items-center justify-center text-white font-bold text-sm">
                  {idx + 1}
                </div>
                <div className="flex-1 min-w-0">
                  <div className="font-medium text-gray-900 truncate">
                    {item.name}
                  </div>
                  <div className="text-xs text-gray-500">
                    {item.count} {item.count === 1 ? 'story' : 'stories'}
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Top Services */}
        <div className="bg-white rounded-xl border border-gray-200 shadow-sm p-6">
          <h2 className="text-2xl font-bold text-gray-900 mb-6 flex items-center gap-2">
            <Heart className="h-6 w-6 text-rose-600" />
            Services with Stories
          </h2>
          {patterns.topServices.length > 0 ? (
            <div className="space-y-3">
              {patterns.topServices.map((item, idx) => (
                <Link
                  key={idx}
                  href="/wiki/services"
                  className="flex items-center gap-3 p-3 rounded-lg hover:bg-rose-50 transition-colors group"
                >
                  <div className="flex-shrink-0 w-10 h-10 bg-gradient-to-br from-rose-500 to-pink-500 rounded-full flex items-center justify-center text-white font-bold text-sm">
                    {idx + 1}
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="font-medium text-gray-900 truncate group-hover:text-rose-700">
                      {item.name}
                    </div>
                    <div className="text-xs text-gray-500">
                      {item.count} {item.count === 1 ? 'story' : 'stories'}
                    </div>
                  </div>
                </Link>
              ))}
            </div>
          ) : (
            <p className="text-gray-500 text-center py-8">No service data available</p>
          )}
        </div>
      </div>

      {/* Keywords Cloud */}
      <div className="bg-white rounded-xl border border-gray-200 shadow-sm p-6">
        <h2 className="text-2xl font-bold text-gray-900 mb-6 flex items-center gap-2">
          <Network className="h-6 w-6 text-blue-600" />
          Common Themes & Keywords
        </h2>
        <div className="flex flex-wrap gap-3">
          {patterns.keywords.map((item) => {
            const size = Math.min(Math.max(item.frequency / 2, 12), 32);
            return (
              <span
                key={item.word}
                className="px-4 py-2 bg-gradient-to-br from-blue-50 to-purple-50 text-gray-800 rounded-lg border border-blue-200 font-medium capitalize hover:shadow-md transition-all cursor-default"
                style={{ fontSize: `${size}px` }}
              >
                {item.word}
                <span className="text-xs text-gray-500 ml-2">({item.frequency})</span>
              </span>
            );
          })}
        </div>
      </div>

      {/* Insights Summary */}
      <div className="mt-8 bg-gradient-to-br from-purple-50 to-blue-50 rounded-xl border-2 border-purple-200 p-8">
        <h2 className="text-2xl font-bold text-gray-900 mb-4 flex items-center gap-2">
          <BarChart3 className="h-6 w-6 text-purple-600" />
          Key Insights
        </h2>
        <div className="grid md:grid-cols-2 gap-6">
          <div className="bg-white rounded-lg p-4 border border-purple-200">
            <h3 className="font-bold text-purple-900 mb-2">Cultural Preservation</h3>
            <p className="text-sm text-gray-700">
              {patterns.culturalMetrics.elderStories} elder stories and {patterns.culturalMetrics.traditionalKnowledge} pieces of traditional knowledge documented, preserving cultural wisdom for future generations.
            </p>
          </div>
          <div className="bg-white rounded-lg p-4 border border-purple-200">
            <h3 className="font-bold text-purple-900 mb-2">Community Engagement</h3>
            <p className="text-sm text-gray-700">
              {patterns.culturalMetrics.communityMembers} active storytellers from {patterns.culturalMetrics.languages} language groups, demonstrating broad community participation.
            </p>
          </div>
          <div className="bg-white rounded-lg p-4 border border-purple-200">
            <h3 className="font-bold text-purple-900 mb-2">Service Impact</h3>
            <p className="text-sm text-gray-700">
              {patterns.topServices.length} PICC services actively documenting their impact through stories, proving service effectiveness through community voice.
            </p>
          </div>
          <div className="bg-white rounded-lg p-4 border border-purple-200">
            <h3 className="font-bold text-purple-900 mb-2">Geographic Coverage</h3>
            <p className="text-sm text-gray-700">
              Stories from {patterns.topLocations.length} different locations, showing diverse geographic representation across traditional country and beyond.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
