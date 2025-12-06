'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { createClient } from '@/lib/supabase/client';
import {
  Search, BookOpen, Users, MapPin, Clock, Globe, Heart,
  Sparkles, TrendingUp, ArrowRight, Bot, Lightbulb,
  Calendar, Tag, BarChart3, Mic, Play, Image as ImageIcon
} from 'lucide-react';

interface WikiStats {
  stories: number;
  people: number;
  services: number;
  topics: number;
}

interface RecentItem {
  id: string;
  title: string;
  type: 'story' | 'person' | 'service';
  created_at: string;
  category?: string;
}

interface FeaturedStory {
  id: string;
  title: string;
  summary?: string;
  storyteller?: {
    full_name: string;
    preferred_name?: string;
  };
}

export default function WikiIndexPage() {
  const [searchQuery, setSearchQuery] = useState('');
  const [isSearching, setIsSearching] = useState(false);
  const [stats, setStats] = useState<WikiStats>({ stories: 0, people: 0, services: 0, topics: 0 });
  const [recentItems, setRecentItems] = useState<RecentItem[]>([]);
  const [featuredStories, setFeaturedStories] = useState<FeaturedStory[]>([]);
  const [searchResults, setSearchResults] = useState<any[]>([]);

  useEffect(() => {
    fetchStats();
    fetchRecentItems();
    fetchFeaturedStories();
  }, []);

  async function fetchStats() {
    const supabase = createClient();

    const [storiesRes, peopleRes, servicesRes] = await Promise.all([
      supabase.from('stories').select('id', { count: 'exact', head: true }).eq('is_public', true),
      supabase.from('profiles').select('id', { count: 'exact', head: true }).eq('show_in_directory', true),
      supabase.from('services').select('id', { count: 'exact', head: true }),
    ]);

    setStats({
      stories: storiesRes.count || 0,
      people: peopleRes.count || 0,
      services: servicesRes.count || 0,
      topics: 12, // Fixed categories
    });
  }

  async function fetchRecentItems() {
    const supabase = createClient();

    const { data } = await supabase
      .from('stories')
      .select('id, title, created_at, story_category')
      .eq('is_public', true)
      .order('created_at', { ascending: false })
      .limit(5);

    if (data) {
      setRecentItems(data.map(item => ({
        ...item,
        type: 'story' as const,
        category: item.story_category
      })));
    }
  }

  async function fetchFeaturedStories() {
    const supabase = createClient();

    const { data } = await supabase
      .from('stories')
      .select(`
        id,
        title,
        summary,
        storyteller:storyteller_id (
          full_name,
          preferred_name
        )
      `)
      .eq('is_public', true)
      .eq('is_featured', true)
      .limit(3);

    if (data) {
      setFeaturedStories(data as FeaturedStory[]);
    }
  }

  async function handleSearch(e: React.FormEvent) {
    e.preventDefault();
    if (!searchQuery.trim()) return;

    setIsSearching(true);

    try {
      // Use semantic search API for AI-powered results
      const response = await fetch(`/api/wiki/search?q=${encodeURIComponent(searchQuery)}&limit=5&semantic=true`);
      const data = await response.json();

      if (data.results) {
        // Combine stories and knowledge results
        const combinedResults = [
          ...data.results.stories.map((s: any) => ({ ...s, resultType: 'story' })),
          ...data.results.knowledge.map((k: any) => ({ ...k, resultType: 'knowledge' })),
          ...data.results.people.map((p: any) => ({ ...p, resultType: 'person' })),
        ].slice(0, 5);

        setSearchResults(combinedResults);
      }
    } catch (error) {
      console.error('Search error:', error);
      // Fallback to basic search
      const supabase = createClient();
      const { data } = await supabase
        .from('stories')
        .select('id, title, summary, story_category')
        .eq('is_public', true)
        .or(`title.ilike.%${searchQuery}%,summary.ilike.%${searchQuery}%`)
        .limit(5);
      setSearchResults(data || []);
    } finally {
      setIsSearching(false);
    }
  }

  const categories = [
    {
      title: 'Stories',
      description: 'First-person narratives from community members',
      href: '/wiki/stories',
      icon: BookOpen,
      color: 'bg-blue-500',
      lightColor: 'bg-blue-50',
      textColor: 'text-blue-700',
      count: stats.stories
    },
    {
      title: 'People',
      description: 'Storytellers, Elders, and community members',
      href: '/wiki/people',
      icon: Users,
      color: 'bg-emerald-500',
      lightColor: 'bg-emerald-50',
      textColor: 'text-emerald-700',
      count: stats.people
    },
    {
      title: 'Services',
      description: 'PICC programs and community services',
      href: '/wiki/services',
      icon: Heart,
      color: 'bg-pink-500',
      lightColor: 'bg-pink-50',
      textColor: 'text-pink-700',
      count: stats.services
    },
    {
      title: 'History',
      description: 'Palm Island heritage and milestones',
      href: '/wiki/history',
      icon: Clock,
      color: 'bg-amber-500',
      lightColor: 'bg-amber-50',
      textColor: 'text-amber-700',
    },
    {
      title: 'Culture',
      description: 'Language, traditions, and cultural knowledge',
      href: '/wiki/culture',
      icon: Globe,
      color: 'bg-purple-500',
      lightColor: 'bg-purple-50',
      textColor: 'text-purple-700',
    },
    {
      title: 'Places',
      description: 'Significant locations and landmarks',
      href: '/wiki/places',
      icon: MapPin,
      color: 'bg-rose-500',
      lightColor: 'bg-rose-50',
      textColor: 'text-rose-700',
    },
    {
      title: 'Timeline',
      description: 'Chronological journey through history',
      href: '/wiki/timeline',
      icon: Calendar,
      color: 'bg-indigo-500',
      lightColor: 'bg-indigo-50',
      textColor: 'text-indigo-700',
    },
    {
      title: 'Achievements',
      description: 'Community accomplishments and awards',
      href: '/wiki/achievements',
      icon: Sparkles,
      color: 'bg-yellow-500',
      lightColor: 'bg-yellow-50',
      textColor: 'text-yellow-700',
    },
    {
      title: 'Innovation',
      description: 'Community-led projects and initiatives',
      href: '/wiki/innovation',
      icon: Lightbulb,
      color: 'bg-orange-500',
      lightColor: 'bg-orange-50',
      textColor: 'text-orange-700',
    },
  ];

  return (
    <div className="min-h-screen">
      <div className="max-w-7xl mx-auto px-4 py-8">

        {/* Hero Section with AI Search */}
        <div className="relative mb-12 rounded-3xl bg-gradient-to-br from-blue-600 via-indigo-600 to-purple-700 p-8 md:p-12 overflow-hidden">
          {/* Background Pattern */}
          <div className="absolute inset-0 opacity-10">
            <div className="absolute top-0 right-0 w-96 h-96 bg-white rounded-full blur-3xl transform translate-x-1/2 -translate-y-1/2" />
            <div className="absolute bottom-0 left-0 w-64 h-64 bg-white rounded-full blur-3xl transform -translate-x-1/2 translate-y-1/2" />
          </div>

          <div className="relative z-10">
            <div className="flex items-center gap-3 mb-4">
              <div className="p-2 bg-white/20 rounded-lg backdrop-blur-sm">
                <BookOpen className="h-8 w-8 text-white" />
              </div>
              <div>
                <h1 className="text-3xl md:text-4xl font-bold text-white">
                  Palm Island Knowledge Base
                </h1>
                <p className="text-blue-100">
                  Manbarra & Bwgcolman Country
                </p>
              </div>
            </div>

            <p className="text-lg text-blue-100 mb-8 max-w-2xl">
              Explore 15+ years of community stories, cultural knowledge, and collective wisdom.
              Search naturally - our AI understands what you're looking for.
            </p>

            {/* AI-Powered Search */}
            <form onSubmit={handleSearch} className="relative max-w-2xl">
              <div className="relative">
                <Bot className="absolute left-4 top-1/2 -translate-y-1/2 h-5 w-5 text-gray-400" />
                <input
                  type="text"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  placeholder="Ask anything... e.g., 'stories about health programs' or 'who are the elders?'"
                  className="w-full pl-12 pr-32 py-4 text-lg bg-white rounded-2xl border-0 shadow-xl focus:ring-4 focus:ring-white/30 transition-all"
                />
                <button
                  type="submit"
                  disabled={isSearching}
                  className="absolute right-2 top-1/2 -translate-y-1/2 px-6 py-2 bg-gradient-to-r from-blue-600 to-indigo-600 text-white font-medium rounded-xl hover:from-blue-700 hover:to-indigo-700 transition-all disabled:opacity-50"
                >
                  {isSearching ? 'Searching...' : 'Search'}
                </button>
              </div>

              {/* Search Suggestions */}
              <div className="flex flex-wrap gap-2 mt-4">
                <span className="text-sm text-blue-200">Try:</span>
                {['Elder stories', 'Youth programs', 'Cultural heritage', 'Health services'].map((suggestion) => (
                  <button
                    key={suggestion}
                    type="button"
                    onClick={() => setSearchQuery(suggestion)}
                    className="px-3 py-1 text-sm bg-white/20 hover:bg-white/30 text-white rounded-full transition-colors"
                  >
                    {suggestion}
                  </button>
                ))}
              </div>
            </form>

            {/* Search Results Preview */}
            {searchResults.length > 0 && (
              <div className="mt-4 bg-white rounded-xl shadow-xl p-4 max-w-2xl">
                <p className="text-sm text-gray-500 mb-3">Found {searchResults.length} results</p>
                <div className="space-y-2">
                  {searchResults.map((result: any) => {
                    const href = result.url || (
                      result.resultType === 'person' ? `/wiki/people/${result.id}` :
                      result.resultType === 'knowledge' ? `/wiki/${result.slug || result.id}` :
                      `/stories/${result.id}`
                    );
                    const title = result.title || result.full_name || result.name;
                    const subtitle = result.summary || result.bio || result.description;
                    const badge = result.resultType === 'person' ? 'Person' :
                                  result.resultType === 'knowledge' ? 'Knowledge' : 'Story';
                    const badgeColor = result.resultType === 'person' ? 'bg-emerald-100 text-emerald-700' :
                                       result.resultType === 'knowledge' ? 'bg-purple-100 text-purple-700' :
                                       'bg-blue-100 text-blue-700';

                    return (
                      <Link
                        key={result.id}
                        href={href}
                        className="block p-3 hover:bg-gray-50 rounded-lg transition-colors"
                      >
                        <div className="flex items-center gap-2 mb-1">
                          <h4 className="font-medium text-gray-900">{title}</h4>
                          <span className={`text-xs px-2 py-0.5 rounded-full ${badgeColor}`}>
                            {badge}
                          </span>
                        </div>
                        {subtitle && (
                          <p className="text-sm text-gray-600 line-clamp-1">{subtitle}</p>
                        )}
                      </Link>
                    );
                  })}
                </div>
                <Link
                  href={`/search?q=${encodeURIComponent(searchQuery)}`}
                  className="block mt-3 text-center text-sm text-blue-600 hover:text-blue-700 font-medium"
                >
                  View all results →
                </Link>
              </div>
            )}
          </div>
        </div>

        {/* Quick Stats */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-12">
          {[
            { label: 'Stories', value: stats.stories, icon: BookOpen, color: 'text-blue-600' },
            { label: 'People', value: stats.people, icon: Users, color: 'text-emerald-600' },
            { label: 'Services', value: stats.services, icon: Heart, color: 'text-pink-600' },
            { label: 'Topics', value: stats.topics, icon: Tag, color: 'text-purple-600' },
          ].map((stat) => (
            <div key={stat.label} className="bg-white rounded-xl border border-gray-200 p-4 text-center">
              <stat.icon className={`h-6 w-6 ${stat.color} mx-auto mb-2`} />
              <p className="text-2xl font-bold text-gray-900">{stat.value}</p>
              <p className="text-sm text-gray-600">{stat.label}</p>
            </div>
          ))}
        </div>

        {/* Category Grid */}
        <section className="mb-12">
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-2xl font-bold text-gray-900">Explore by Category</h2>
            <Link href="/wiki/categories" className="text-blue-600 hover:text-blue-700 font-medium flex items-center gap-1">
              View all <ArrowRight className="h-4 w-4" />
            </Link>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {categories.map((category) => (
              <Link
                key={category.href}
                href={category.href}
                className="group bg-white rounded-xl border border-gray-200 p-6 hover:border-gray-300 hover:shadow-lg transition-all"
              >
                <div className="flex items-start gap-4">
                  <div className={`p-3 ${category.lightColor} rounded-xl group-hover:scale-110 transition-transform`}>
                    <category.icon className={`h-6 w-6 ${category.textColor}`} />
                  </div>
                  <div className="flex-1">
                    <div className="flex items-center justify-between">
                      <h3 className="font-semibold text-gray-900 group-hover:text-blue-600 transition-colors">
                        {category.title}
                      </h3>
                      {category.count !== undefined && (
                        <span className="text-sm text-gray-500">{category.count}</span>
                      )}
                    </div>
                    <p className="text-sm text-gray-600 mt-1">{category.description}</p>
                  </div>
                </div>
              </Link>
            ))}
          </div>
        </section>

        {/* Two Column Layout: Featured + Recent */}
        <div className="grid md:grid-cols-2 gap-8 mb-12">

          {/* Featured Stories */}
          <section>
            <div className="flex items-center gap-2 mb-4">
              <Sparkles className="h-5 w-5 text-yellow-500" />
              <h2 className="text-xl font-bold text-gray-900">Featured Stories</h2>
            </div>
            <div className="space-y-4">
              {featuredStories.length > 0 ? (
                featuredStories.map((story) => (
                  <Link
                    key={story.id}
                    href={`/stories/${story.id}`}
                    className="block bg-white rounded-xl border border-gray-200 p-5 hover:border-blue-300 hover:shadow-md transition-all"
                  >
                    <h3 className="font-semibold text-gray-900 mb-2 line-clamp-1">{story.title}</h3>
                    {story.summary && (
                      <p className="text-sm text-gray-600 line-clamp-2 mb-3">{story.summary}</p>
                    )}
                    {story.storyteller && (
                      <p className="text-xs text-gray-500">
                        By {story.storyteller.preferred_name || story.storyteller.full_name}
                      </p>
                    )}
                  </Link>
                ))
              ) : (
                <div className="bg-gray-50 rounded-xl p-6 text-center text-gray-500">
                  <BookOpen className="h-8 w-8 mx-auto mb-2 opacity-50" />
                  <p>No featured stories yet</p>
                </div>
              )}
            </div>
          </section>

          {/* Recent Activity */}
          <section>
            <div className="flex items-center gap-2 mb-4">
              <Clock className="h-5 w-5 text-blue-500" />
              <h2 className="text-xl font-bold text-gray-900">Recent Additions</h2>
            </div>
            <div className="bg-white rounded-xl border border-gray-200 divide-y divide-gray-100">
              {recentItems.length > 0 ? (
                recentItems.map((item) => (
                  <Link
                    key={item.id}
                    href={`/stories/${item.id}`}
                    className="flex items-center gap-3 p-4 hover:bg-gray-50 transition-colors"
                  >
                    <div className="p-2 bg-blue-50 rounded-lg">
                      <BookOpen className="h-4 w-4 text-blue-600" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="font-medium text-gray-900 truncate">{item.title}</p>
                      <p className="text-xs text-gray-500">
                        {new Date(item.created_at).toLocaleDateString('en-AU')}
                        {item.category && ` • ${item.category.replace('_', ' ')}`}
                      </p>
                    </div>
                    <ArrowRight className="h-4 w-4 text-gray-400" />
                  </Link>
                ))
              ) : (
                <div className="p-6 text-center text-gray-500">
                  <Clock className="h-8 w-8 mx-auto mb-2 opacity-50" />
                  <p>No recent items</p>
                </div>
              )}
            </div>
          </section>
        </div>

        {/* AI Assistant CTA */}
        <section className="mb-12">
          <div className="bg-gradient-to-r from-indigo-500 via-purple-500 to-pink-500 rounded-2xl p-8 text-white">
            <div className="flex flex-col md:flex-row items-center gap-6">
              <div className="p-4 bg-white/20 rounded-2xl backdrop-blur-sm">
                <Bot className="h-12 w-12" />
              </div>
              <div className="flex-1 text-center md:text-left">
                <h2 className="text-2xl font-bold mb-2">Ask Our AI Assistant</h2>
                <p className="text-white/90 mb-4">
                  Have questions about PICC's programs, history, or community stories?
                  Our AI assistant has access to 15 years of knowledge and can help you find answers.
                </p>
                <Link
                  href="/chat"
                  className="inline-flex items-center gap-2 px-6 py-3 bg-white text-purple-600 font-semibold rounded-xl hover:bg-gray-100 transition-colors"
                >
                  <Bot className="h-5 w-5" />
                  Start a Conversation
                </Link>
              </div>
            </div>
          </div>
        </section>

        {/* Contribute CTA */}
        <section className="bg-gradient-to-br from-rose-50 to-pink-50 rounded-2xl border border-rose-200 p-8">
          <div className="flex flex-col md:flex-row items-center gap-6">
            <div className="p-4 bg-rose-100 rounded-2xl">
              <Mic className="h-10 w-10 text-rose-600" />
            </div>
            <div className="flex-1 text-center md:text-left">
              <h2 className="text-2xl font-bold text-gray-900 mb-2">Share Your Voice</h2>
              <p className="text-gray-600 mb-4">
                Your story matters. Contribute to our community knowledge base and help preserve
                Palm Island's heritage for future generations.
              </p>
              <Link
                href="/share-voice"
                className="inline-flex items-center gap-2 px-6 py-3 bg-rose-600 text-white font-semibold rounded-xl hover:bg-rose-700 transition-colors"
              >
                <Mic className="h-5 w-5" />
                Share Your Story
              </Link>
            </div>
          </div>
        </section>

      </div>
    </div>
  );
}
