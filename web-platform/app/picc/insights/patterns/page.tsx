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
  topStorytellers: Array<{ name: string; count: number }>;
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
  const [selectedTimeframe, setSelectedTimeframe] = useState<'all' | 'year' | 'quarter'>('all');

  useEffect(() => {
    async function analyzePatterns() {
      const supabase = createClient();

      // Fetch all public stories with related data
      const { data: stories } = await (supabase as any)
        .from('stories')
        .select(`
          id,
          story_category,
          location,
          created_at,
          traditional_knowledge,
          storyteller:storyteller_id (
            full_name,
            is_elder
          ),
          service:service_id (
            service_name
          )
        `)
        .eq('is_public', true);

      if (!stories) {
        setLoading(false);
        return;
      }

      // Analyze categories
      const categoryCount: Record<string, number> = {};
      stories.forEach((s: any) => {
        if (s.story_category) {
          categoryCount[s.story_category] = (categoryCount[s.story_category] || 0) + 1;
        }
      });
      const totalStories = stories.length;
      const topCategories = Object.entries(categoryCount)
        .map(([category, count]) => ({
          category,
          count,
          percentage: Math.round((count / totalStories) * 100)
        }))
        .sort((a, b) => b.count - a.count)
        .slice(0, 8);

      // Analyze locations
      const locationCount: Record<string, number> = {};
      stories.forEach((s: any) => {
        if (s.location) {
          locationCount[s.location] = (locationCount[s.location] || 0) + 1;
        }
      });
      const topLocations = Object.entries(locationCount)
        .map(([location, count]) => ({ location, count }))
        .sort((a, b) => b.count - a.count)
        .slice(0, 6);

      // Analyze storytellers
      const storytellerCount: Record<string, number> = {};
      stories.forEach((s: any) => {
        const storyteller = Array.isArray(s.storyteller) ? s.storyteller[0] : s.storyteller;
        if (storyteller?.full_name) {
          storytellerCount[storyteller.full_name] = (storytellerCount[storyteller.full_name] || 0) + 1;
        }
      });
      const topStorytellers = Object.entries(storytellerCount)
        .map(([name, count]) => ({ name, count }))
        .sort((a, b) => b.count - a.count)
        .slice(0, 6);

      // Analyze services
      const serviceCount: Record<string, number> = {};
      stories.forEach((s: any) => {
        const service = Array.isArray(s.service) ? s.service[0] : s.service;
        if (service?.service_name) {
          serviceCount[service.service_name] = (serviceCount[service.service_name] || 0) + 1;
        }
      });
      const topServices = Object.entries(serviceCount)
        .map(([name, count]) => ({ name, count }))
        .sort((a, b) => b.count - a.count)
        .slice(0, 6);

      // Monthly trends
      const monthCount: Record<string, number> = {};
      stories.forEach((s: any) => {
        if (s.created_at) {
          const month = new Date(s.created_at).toLocaleDateString('en-AU', {
            year: 'numeric',
            month: 'short'
          });
          monthCount[month] = (monthCount[month] || 0) + 1;
        }
      });
      const monthlyTrends = Object.entries(monthCount)
        .map(([month, count]) => ({ month, count }))
        .slice(-12);

      // Cultural metrics
      let elderStories = 0;
      let traditionalKnowledge = 0;
      stories.forEach((s: any) => {
        const storyteller = Array.isArray(s.storyteller) ? s.storyteller[0] : s.storyteller;
        if (storyteller?.is_elder) elderStories++;
        if (s.traditional_knowledge) traditionalKnowledge++;
      });

      // Get unique community members count
      const { count: communityMembers } = await (supabase as any)
        .from('profiles')
        .select('*', { count: 'exact', head: true });

      // Simple keyword extraction (top words from categories/locations)
      const allText = stories.map((s: any) => `${s.story_category || ''} ${s.location || ''}`).join(' ');
      const words = allText.toLowerCase().split(/\s+/).filter((w: string) => w.length > 3);
      const wordCount: Record<string, number> = {};
      words.forEach((w: string) => {
        wordCount[w] = (wordCount[w] || 0) + 1;
      });
      const keywords = Object.entries(wordCount)
        .map(([word, frequency]) => ({ word, frequency }))
        .sort((a, b) => b.frequency - a.frequency)
        .slice(0, 20);

      setPatterns({
        topCategories,
        topLocations,
        topStorytellers,
        topServices,
        monthlyTrends,
        culturalMetrics: {
          elderStories,
          traditionalKnowledge,
          communityMembers: communityMembers || 0,
          languages: 2 // Placeholder - would need language field
        },
        keywords
      });
      setLoading(false);
    }

    analyzePatterns();
  }, [selectedTimeframe]);

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-[#1e3a5f] mx-auto mb-4" />
          <p className="text-gray-600">Analyzing story patterns...</p>
        </div>
      </div>
    );
  }

  if (!patterns) {
    return (
      <div className="min-h-screen bg-gray-50 p-6">
        <Breadcrumbs items={[
          { label: 'PICC', href: '/picc' },
          { label: 'Insights', href: '/picc/insights' },
          { label: 'Story Patterns', href: '#' }
        ]} />
        <div className="text-center py-20">
          <Network className="w-16 h-16 text-gray-300 mx-auto mb-4" />
          <h2 className="text-xl font-semibold text-gray-900">No Data Available</h2>
          <p className="text-gray-600">Story patterns will appear once stories are published.</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-7xl mx-auto p-6">
        <Breadcrumbs items={[
          { label: 'PICC', href: '/picc' },
          { label: 'Insights', href: '/picc/insights' },
          { label: 'Story Patterns', href: '#' }
        ]} />

        {/* Header */}
        <div className="flex items-center justify-between mb-8">
          <div>
            <h1 className="text-3xl font-bold text-gray-900 flex items-center gap-3">
              <Network className="w-8 h-8 text-purple-600" />
              Story Patterns & Trends
            </h1>
            <p className="text-gray-600 mt-2">
              AI-powered analysis of community storytelling patterns
            </p>
          </div>
          <select
            value={selectedTimeframe}
            onChange={(e) => setSelectedTimeframe(e.target.value as any)}
            className="px-4 py-2 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-purple-500"
          >
            <option value="all">All Time</option>
            <option value="year">Past Year</option>
            <option value="quarter">Past Quarter</option>
          </select>
        </div>

        {/* Cultural Metrics Overview */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
          <div className="bg-gradient-to-br from-amber-50 to-orange-50 rounded-xl p-4 border border-amber-200">
            <div className="flex items-center gap-2 text-amber-700 mb-2">
              <Users className="w-5 h-5" />
              <span className="text-sm font-medium">Elder Stories</span>
            </div>
            <p className="text-2xl font-bold text-amber-900">{patterns.culturalMetrics.elderStories}</p>
          </div>
          <div className="bg-gradient-to-br from-purple-50 to-pink-50 rounded-xl p-4 border border-purple-200">
            <div className="flex items-center gap-2 text-purple-700 mb-2">
              <Heart className="w-5 h-5" />
              <span className="text-sm font-medium">Traditional Knowledge</span>
            </div>
            <p className="text-2xl font-bold text-purple-900">{patterns.culturalMetrics.traditionalKnowledge}</p>
          </div>
          <div className="bg-gradient-to-br from-teal-50 to-cyan-50 rounded-xl p-4 border border-teal-200">
            <div className="flex items-center gap-2 text-teal-700 mb-2">
              <Users className="w-5 h-5" />
              <span className="text-sm font-medium">Community Members</span>
            </div>
            <p className="text-2xl font-bold text-teal-900">{patterns.culturalMetrics.communityMembers}</p>
          </div>
          <div className="bg-gradient-to-br from-blue-50 to-indigo-50 rounded-xl p-4 border border-blue-200">
            <div className="flex items-center gap-2 text-blue-700 mb-2">
              <Globe className="w-5 h-5" />
              <span className="text-sm font-medium">Languages</span>
            </div>
            <p className="text-2xl font-bold text-blue-900">{patterns.culturalMetrics.languages}</p>
          </div>
        </div>

        <div className="grid lg:grid-cols-2 gap-6">
          {/* Top Categories */}
          <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
            <h3 className="text-lg font-semibold text-gray-900 flex items-center gap-2 mb-4">
              <Tag className="w-5 h-5 text-blue-600" />
              Story Categories
            </h3>
            <div className="space-y-3">
              {patterns.topCategories.map((cat, idx) => (
                <div key={cat.category} className="flex items-center gap-3">
                  <span className="w-6 h-6 rounded-full bg-blue-100 text-blue-700 text-xs flex items-center justify-center font-medium">
                    {idx + 1}
                  </span>
                  <div className="flex-1">
                    <div className="flex justify-between mb-1">
                      <span className="text-sm font-medium text-gray-700">{cat.category}</span>
                      <span className="text-sm text-gray-500">{cat.count} ({cat.percentage}%)</span>
                    </div>
                    <div className="h-2 bg-gray-100 rounded-full overflow-hidden">
                      <div
                        className="h-full bg-blue-500 rounded-full"
                        style={{ width: `${cat.percentage}%` }}
                      />
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Top Locations */}
          <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
            <h3 className="text-lg font-semibold text-gray-900 flex items-center gap-2 mb-4">
              <MapPin className="w-5 h-5 text-green-600" />
              Story Locations
            </h3>
            <div className="space-y-3">
              {patterns.topLocations.map((loc, idx) => (
                <div key={loc.location} className="flex items-center justify-between py-2 border-b border-gray-100 last:border-0">
                  <div className="flex items-center gap-3">
                    <span className="w-6 h-6 rounded-full bg-green-100 text-green-700 text-xs flex items-center justify-center font-medium">
                      {idx + 1}
                    </span>
                    <span className="text-sm font-medium text-gray-700">{loc.location}</span>
                  </div>
                  <span className="text-sm text-gray-500">{loc.count} stories</span>
                </div>
              ))}
            </div>
          </div>

          {/* Top Storytellers */}
          <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
            <h3 className="text-lg font-semibold text-gray-900 flex items-center gap-2 mb-4">
              <Users className="w-5 h-5 text-purple-600" />
              Active Storytellers
            </h3>
            <div className="space-y-3">
              {patterns.topStorytellers.map((st, idx) => (
                <div key={st.name} className="flex items-center justify-between py-2 border-b border-gray-100 last:border-0">
                  <div className="flex items-center gap-3">
                    <span className="w-6 h-6 rounded-full bg-purple-100 text-purple-700 text-xs flex items-center justify-center font-medium">
                      {idx + 1}
                    </span>
                    <span className="text-sm font-medium text-gray-700">{st.name}</span>
                  </div>
                  <span className="text-sm text-gray-500">{st.count} stories</span>
                </div>
              ))}
            </div>
          </div>

          {/* Top Services */}
          <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
            <h3 className="text-lg font-semibold text-gray-900 flex items-center gap-2 mb-4">
              <Activity className="w-5 h-5 text-orange-600" />
              Service Areas
            </h3>
            <div className="space-y-3">
              {patterns.topServices.map((svc, idx) => (
                <div key={svc.name} className="flex items-center justify-between py-2 border-b border-gray-100 last:border-0">
                  <div className="flex items-center gap-3">
                    <span className="w-6 h-6 rounded-full bg-orange-100 text-orange-700 text-xs flex items-center justify-center font-medium">
                      {idx + 1}
                    </span>
                    <span className="text-sm font-medium text-gray-700">{svc.name}</span>
                  </div>
                  <span className="text-sm text-gray-500">{svc.count} stories</span>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Keywords Word Cloud Placeholder */}
        <div className="mt-6 bg-white rounded-xl shadow-sm border border-gray-200 p-6">
          <h3 className="text-lg font-semibold text-gray-900 flex items-center gap-2 mb-4">
            <Sparkles className="w-5 h-5 text-pink-600" />
            Common Themes & Keywords
          </h3>
          <div className="flex flex-wrap gap-2">
            {patterns.keywords.slice(0, 15).map((kw) => (
              <span
                key={kw.word}
                className="px-3 py-1 rounded-full text-sm font-medium"
                style={{
                  backgroundColor: `rgba(139, 92, 246, ${Math.min(kw.frequency / 10, 0.3)})`,
                  color: kw.frequency > 5 ? '#5b21b6' : '#6b7280'
                }}
              >
                {kw.word}
              </span>
            ))}
          </div>
        </div>

        {/* Navigation */}
        <div className="mt-8 flex justify-between">
          <Link
            href="/picc/insights"
            className="text-gray-600 hover:text-gray-900"
          >
            ← Back to Insights
          </Link>
          <Link
            href="/picc/insights/themes"
            className="text-purple-600 hover:text-purple-700 font-medium"
          >
            View Theme Analysis →
          </Link>
        </div>
      </div>
    </div>
  );
}
