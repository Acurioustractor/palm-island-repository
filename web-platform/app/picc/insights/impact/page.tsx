'use client';

import { useState, useEffect } from 'react';
import { createClient } from '@/lib/supabase/client';
import {
  Target, Users, BookOpen, TrendingUp, Calendar, Award,
  Heart, MessageSquare, Eye, Share2, Activity, BarChart3
} from 'lucide-react';

interface ImpactStats {
  totalStories: number;
  totalStorytellers: number;
  totalViews: number;
  totalShares: number;
  storiesThisMonth: number;
  storiesLastMonth: number;
  newStorytellersThisMonth: number;
  elderContributions: number;
  youthContributions: number;
  communityVoiceStories: number;
  storiesByCategory: { category: string; count: number }[];
  storytellersByType: { type: string; count: number }[];
  monthlyGrowth: { month: string; stories: number; storytellers: number }[];
}

export default function ImpactDashboardPage() {
  const [stats, setStats] = useState<ImpactStats | null>(null);
  const [loading, setLoading] = useState(true);
  const [timeRange, setTimeRange] = useState('all'); // all, month, quarter, year

  useEffect(() => {
    loadImpactStats();
  }, [timeRange]);

  const loadImpactStats = async () => {
    try {
      const supabase = createClient();

      // Get date range
      const now = new Date();
      let startDate = new Date(0); // Beginning of time
      if (timeRange === 'month') {
        startDate = new Date(now.getFullYear(), now.getMonth(), 1);
      } else if (timeRange === 'quarter') {
        const quarter = Math.floor(now.getMonth() / 3);
        startDate = new Date(now.getFullYear(), quarter * 3, 1);
      } else if (timeRange === 'year') {
        startDate = new Date(now.getFullYear(), 0, 1);
      }

      // Load stories
      const { data: stories, error: storiesError } = await supabase
        .from('stories')
        .select('*');

      if (storiesError) throw storiesError;

      // Load profiles (storytellers)
      const { data: profiles, error: profilesError } = await supabase
        .from('profiles')
        .select('*');

      if (profilesError) throw profilesError;

      // Calculate stats
      const totalStories = stories?.length || 0;
      const totalStorytellers = profiles?.length || 0;

      // Stories this month
      const thisMonthStart = new Date(now.getFullYear(), now.getMonth(), 1);
      const storiesThisMonth = stories?.filter(s =>
        new Date(s.created_at) >= thisMonthStart
      ).length || 0;

      // Stories last month
      const lastMonthStart = new Date(now.getFullYear(), now.getMonth() - 1, 1);
      const lastMonthEnd = new Date(now.getFullYear(), now.getMonth(), 0);
      const storiesLastMonth = stories?.filter(s => {
        const date = new Date(s.created_at);
        return date >= lastMonthStart && date <= lastMonthEnd;
      }).length || 0;

      // New storytellers this month
      const newStorytellersThisMonth = profiles?.filter(p =>
        new Date(p.created_at) >= thisMonthStart
      ).length || 0;

      // Elder and Youth contributions
      const elderProfiles = profiles?.filter(p => p.is_elder) || [];
      const elderIds = new Set(elderProfiles.map(p => p.id));
      const elderContributions = stories?.filter(s =>
        elderIds.has(s.storyteller_id)
      ).length || 0;

      const youthProfiles = profiles?.filter(p => p.storyteller_type === 'youth') || [];
      const youthIds = new Set(youthProfiles.map(p => p.id));
      const youthContributions = stories?.filter(s =>
        youthIds.has(s.storyteller_id)
      ).length || 0;

      // Community Voice stories (anonymous or community level)
      const communityVoiceStories = stories?.filter(s =>
        s.privacy_level === 'community' || !s.storyteller_id
      ).length || 0;

      // Stories by category
      const categoryCount: { [key: string]: number } = {};
      stories?.forEach(s => {
        const category = s.story_category || 'uncategorized';
        categoryCount[category] = (categoryCount[category] || 0) + 1;
      });
      const storiesByCategory = Object.entries(categoryCount)
        .map(([category, count]) => ({ category, count }))
        .sort((a, b) => b.count - a.count)
        .slice(0, 5);

      // Storytellers by type
      const typeCount: { [key: string]: number } = {};
      profiles?.forEach(p => {
        const type = p.storyteller_type || 'community_member';
        typeCount[type] = (typeCount[type] || 0) + 1;
      });
      const storytellersByType = Object.entries(typeCount)
        .map(([type, count]) => ({ type, count }))
        .sort((a, b) => b.count - a.count);

      // Monthly growth (last 6 months)
      const monthlyGrowth = [];
      for (let i = 5; i >= 0; i--) {
        const month = new Date(now.getFullYear(), now.getMonth() - i, 1);
        const monthEnd = new Date(now.getFullYear(), now.getMonth() - i + 1, 0);

        const monthStories = stories?.filter(s => {
          const date = new Date(s.created_at);
          return date >= month && date <= monthEnd;
        }).length || 0;

        const monthStorytellers = profiles?.filter(p => {
          const date = new Date(p.created_at);
          return date >= month && date <= monthEnd;
        }).length || 0;

        monthlyGrowth.push({
          month: month.toLocaleDateString('en-US', { month: 'short' }),
          stories: monthStories,
          storytellers: monthStorytellers
        });
      }

      setStats({
        totalStories,
        totalStorytellers,
        totalViews: 0, // TODO: Implement view tracking
        totalShares: 0, // TODO: Implement share tracking
        storiesThisMonth,
        storiesLastMonth,
        newStorytellersThisMonth,
        elderContributions,
        youthContributions,
        communityVoiceStories,
        storiesByCategory,
        storytellersByType,
        monthlyGrowth
      });
    } catch (error) {
      console.error('Error loading impact stats:', error);
    } finally {
      setLoading(false);
    }
  };

  const getGrowthPercentage = () => {
    if (!stats || stats.storiesLastMonth === 0) return 0;
    return Math.round(((stats.storiesThisMonth - stats.storiesLastMonth) / stats.storiesLastMonth) * 100);
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Loading impact data...</p>
        </div>
      </div>
    );
  }

  if (!stats) {
    return <div className="p-8">Error loading stats</div>;
  }

  return (
    <div className="p-8 max-w-7xl mx-auto">
      {/* Header */}
      <div className="mb-8">
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-3">
            <Target className="w-8 h-8 text-green-600" />
            <h1 className="text-3xl font-bold text-gray-900">Impact Dashboard</h1>
          </div>

          <select
            value={timeRange}
            onChange={(e) => setTimeRange(e.target.value)}
            className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
          >
            <option value="all">All Time</option>
            <option value="year">This Year</option>
            <option value="quarter">This Quarter</option>
            <option value="month">This Month</option>
          </select>
        </div>
        <p className="text-gray-600">
          Track community engagement, story impact, and storyteller growth
        </p>
      </div>

      {/* Key Metrics */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
        <div className="bg-gradient-to-br from-blue-500 to-blue-600 rounded-lg p-6 text-white">
          <div className="flex items-center justify-between mb-2">
            <BookOpen className="w-8 h-8 opacity-80" />
          </div>
          <div className="text-3xl font-bold mb-1">{stats.totalStories}</div>
          <div className="text-blue-100 text-sm">Total Stories</div>
        </div>

        <div className="bg-gradient-to-br from-purple-500 to-purple-600 rounded-lg p-6 text-white">
          <div className="flex items-center justify-between mb-2">
            <Users className="w-8 h-8 opacity-80" />
          </div>
          <div className="text-3xl font-bold mb-1">{stats.totalStorytellers}</div>
          <div className="text-purple-100 text-sm">Storytellers</div>
        </div>

        <div className="bg-gradient-to-br from-green-500 to-green-600 rounded-lg p-6 text-white">
          <div className="flex items-center justify-between mb-2">
            <TrendingUp className="w-8 h-8 opacity-80" />
            <span className={`text-sm font-bold ${getGrowthPercentage() >= 0 ? 'text-green-100' : 'text-red-100'}`}>
              {getGrowthPercentage() > 0 ? '+' : ''}{getGrowthPercentage()}%
            </span>
          </div>
          <div className="text-3xl font-bold mb-1">{stats.storiesThisMonth}</div>
          <div className="text-green-100 text-sm">Stories This Month</div>
        </div>

        <div className="bg-gradient-to-br from-orange-500 to-orange-600 rounded-lg p-6 text-white">
          <div className="flex items-center justify-between mb-2">
            <Heart className="w-8 h-8 opacity-80" />
          </div>
          <div className="text-3xl font-bold mb-1">{stats.newStorytellersThisMonth}</div>
          <div className="text-orange-100 text-sm">New Storytellers</div>
        </div>
      </div>

      {/* Community Impact */}
      <div className="grid md:grid-cols-3 gap-6 mb-8">
        <div className="bg-white rounded-lg border border-gray-200 p-6">
          <div className="flex items-center gap-3 mb-4">
            <Award className="w-6 h-6 text-yellow-600" />
            <h2 className="text-lg font-bold text-gray-900">Elder Contributions</h2>
          </div>
          <div className="text-4xl font-bold text-gray-900 mb-2">{stats.elderContributions}</div>
          <p className="text-sm text-gray-600">Stories shared by Elders</p>
        </div>

        <div className="bg-white rounded-lg border border-gray-200 p-6">
          <div className="flex items-center gap-3 mb-4">
            <Activity className="w-6 h-6 text-teal-600" />
            <h2 className="text-lg font-bold text-gray-900">Youth Engagement</h2>
          </div>
          <div className="text-4xl font-bold text-gray-900 mb-2">{stats.youthContributions}</div>
          <p className="text-sm text-gray-600">Stories from youth</p>
        </div>

        <div className="bg-white rounded-lg border border-gray-200 p-6">
          <div className="flex items-center gap-3 mb-4">
            <MessageSquare className="w-6 h-6 text-purple-600" />
            <h2 className="text-lg font-bold text-gray-900">Community Voice</h2>
          </div>
          <div className="text-4xl font-bold text-gray-900 mb-2">{stats.communityVoiceStories}</div>
          <p className="text-sm text-gray-600">Anonymous submissions</p>
        </div>
      </div>

      {/* Charts Row */}
      <div className="grid md:grid-cols-2 gap-6 mb-8">
        {/* Monthly Growth */}
        <div className="bg-white rounded-lg border border-gray-200 p-6">
          <h2 className="text-lg font-bold text-gray-900 mb-4 flex items-center gap-2">
            <BarChart3 className="w-5 h-5" />
            Monthly Growth (Last 6 Months)
          </h2>
          <div className="space-y-3">
            {stats.monthlyGrowth.map((month, index) => (
              <div key={index}>
                <div className="flex items-center justify-between text-sm mb-1">
                  <span className="font-medium text-gray-700">{month.month}</span>
                  <span className="text-gray-600">{month.stories} stories</span>
                </div>
                <div className="w-full bg-gray-200 rounded-full h-2">
                  <div
                    className="bg-blue-600 h-2 rounded-full"
                    style={{
                      width: `${Math.min((month.stories / Math.max(...stats.monthlyGrowth.map(m => m.stories))) * 100, 100)}%`
                    }}
                  />
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Top Categories */}
        <div className="bg-white rounded-lg border border-gray-200 p-6">
          <h2 className="text-lg font-bold text-gray-900 mb-4">Top Story Categories</h2>
          <div className="space-y-3">
            {stats.storiesByCategory.map((cat, index) => (
              <div key={index}>
                <div className="flex items-center justify-between text-sm mb-1">
                  <span className="font-medium text-gray-700 capitalize">
                    {cat.category.replace('_', ' ')}
                  </span>
                  <span className="text-gray-600">{cat.count} stories</span>
                </div>
                <div className="w-full bg-gray-200 rounded-full h-2">
                  <div
                    className="bg-purple-600 h-2 rounded-full"
                    style={{
                      width: `${(cat.count / stats.totalStories) * 100}%`
                    }}
                  />
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Storyteller Breakdown */}
      <div className="bg-white rounded-lg border border-gray-200 p-6">
        <h2 className="text-lg font-bold text-gray-900 mb-4">Storyteller Breakdown</h2>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          {stats.storytellersByType.map((type, index) => (
            <div key={index} className="text-center p-4 bg-gray-50 rounded-lg">
              <div className="text-2xl font-bold text-gray-900 mb-1">{type.count}</div>
              <div className="text-sm text-gray-600 capitalize">
                {type.type.replace('_', ' ')}
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Insights */}
      <div className="mt-8 grid md:grid-cols-2 gap-6">
        <div className="bg-blue-50 border border-blue-200 rounded-lg p-6">
          <h3 className="text-lg font-bold text-blue-900 mb-3">📈 Growth Insights</h3>
          <ul className="space-y-2 text-sm text-blue-800">
            <li>
              • Story submissions {getGrowthPercentage() >= 0 ? 'increased' : 'decreased'} by{' '}
              <strong>{Math.abs(getGrowthPercentage())}%</strong> this month
            </li>
            <li>
              • <strong>{stats.newStorytellersThisMonth}</strong> new storytellers joined this month
            </li>
            <li>
              • Elders have contributed <strong>{stats.elderContributions}</strong> stories total
            </li>
            <li>
              • Youth engagement: <strong>{stats.youthContributions}</strong> stories from young people
            </li>
          </ul>
        </div>

        <div className="bg-green-50 border border-green-200 rounded-lg p-6">
          <h3 className="text-lg font-bold text-green-900 mb-3">💡 Recommendations</h3>
          <ul className="space-y-2 text-sm text-green-800">
            {stats.storiesThisMonth < stats.storiesLastMonth && (
              <li>• Consider running a story collection campaign to boost engagement</li>
            )}
            {stats.youthContributions < stats.totalStories * 0.2 && (
              <li>• Increase youth outreach - youth stories are below 20%</li>
            )}
            {stats.communityVoiceStories < stats.totalStories * 0.1 && (
              <li>• Promote anonymous submission form for community voice</li>
            )}
            <li>• Continue Elder engagement - valuable cultural knowledge being preserved</li>
            <li>• Share impact metrics with community to demonstrate value</li>
          </ul>
        </div>
      </div>
    </div>
  );
}
