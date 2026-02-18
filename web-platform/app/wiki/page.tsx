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
  } | {
    full_name: string;
    preferred_name?: string;
  }[];
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
      supabase.from('stories').select('id', { count: 'exact', head: true }).eq('access_level', 'public').eq('status', 'published'),
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
      .eq('access_level', 'public')
      .eq('status', 'published')
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
      .eq('access_level', 'public')
      .eq('status', 'published')
      .eq('is_featured', true)
      .limit(3);

    if (data) {
      setFeaturedStories(data as unknown as FeaturedStory[]);
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
      color: 'bg-picc-red',
      lightColor: 'bg-warm-50',
      textColor: 'text-picc-red',
      count: stats.stories
    },
    {
      title: 'People',
      description: 'Storytellers, Elders, and community members',
      href: '/wiki/people',
      icon: Users,
      color: 'bg-sage-500',
      lightColor: 'bg-sage-50',
      textColor: 'text-sage-700',
      count: stats.people
    },
    {
      title: 'Services',
      description: 'PICC programs and community services',
      href: '/wiki/services',
      icon: Heart,
      color: 'bg-warm-500',
      lightColor: 'bg-warm-50',
      textColor: 'text-picc-red',
      count: stats.services
    },
    {
      title: 'History',
      description: 'Palm Island heritage and milestones',
      href: '/wiki/history',
      icon: Clock,
      color: 'bg-picc-ochre-500',
      lightColor: 'bg-picc-ochre-50',
      textColor: 'text-picc-ochre',
    },
    {
      title: 'Culture',
      description: 'Language, traditions, and cultural knowledge',
      href: '/wiki/culture',
      icon: Globe,
      color: 'bg-picc-ochre',
      lightColor: 'bg-warm-100',
      textColor: 'text-picc-ochre',
    },
    {
      title: 'Places',
      description: 'Significant locations and landmarks',
      href: '/wiki/places',
      icon: MapPin,
      color: 'bg-warm-500',
      lightColor: 'bg-warm-50',
      textColor: 'text-picc-red',
    },
    {
      title: 'Timeline',
      description: 'Chronological journey through history',
      href: '/wiki/timeline',
      icon: Calendar,
      color: 'bg-picc-ochre',
      lightColor: 'bg-warm-50',
      textColor: 'text-picc-ochre',
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
        <div className="relative mb-12 rounded-3xl bg-gradient-to-br from-picc-red via-picc-ochre to-picc-ochre p-8 md:p-12 overflow-hidden">
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
                <p className="text-warm-100">
                  Manbarra & Bwgcolman Country
                </p>
              </div>
            </div>

            <p className="text-lg text-warm-100 mb-8 max-w-2xl">
              Explore 17 years of community stories, cultural knowledge, and collective wisdom.
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
                  className="absolute right-2 top-1/2 -translate-y-1/2 px-6 py-2 bg-gradient-to-r from-picc-red to-picc-ochre text-white font-medium rounded-xl hover:from-picc-red hover:to-picc-ochre transition-all disabled:opacity-50"
                >
                  {isSearching ? 'Searching...' : 'Search'}
                </button>
              </div>

              {/* Search Suggestions */}
              <div className="flex flex-wrap gap-2 mt-4">
                <span className="text-sm text-warm-200">Try:</span>
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
                    const badgeColor = result.resultType === 'person' ? 'bg-sage-100 text-sage-700' :
                                       result.resultType === 'knowledge' ? 'bg-warm-100 text-picc-ochre' :
                                       'bg-warm-100 text-picc-red';

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
                  className="block mt-3 text-center text-sm text-picc-red hover:text-picc-red font-medium"
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
            { label: 'Stories', value: stats.stories, icon: BookOpen, color: 'text-picc-red' },
            { label: 'People', value: stats.people, icon: Users, color: 'text-sage-600' },
            { label: 'Services', value: stats.services, icon: Heart, color: 'text-picc-red' },
            { label: 'Topics', value: stats.topics, icon: Tag, color: 'text-picc-ochre' },
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
            <Link href="/wiki/categories" className="text-picc-red hover:text-picc-red font-medium flex items-center gap-1">
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
                      <h3 className="font-semibold text-gray-900 group-hover:text-picc-red transition-colors">
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
                    className="block bg-white rounded-xl border border-gray-200 p-5 hover:border-picc-red-300 hover:shadow-md transition-all"
                  >
                    <h3 className="font-semibold text-gray-900 mb-2 line-clamp-1">{story.title}</h3>
                    {story.summary && (
                      <p className="text-sm text-gray-600 line-clamp-2 mb-3">{story.summary}</p>
                    )}
                    {story.storyteller && (() => {
                      const teller = Array.isArray(story.storyteller) ? story.storyteller[0] : story.storyteller;
                      return teller ? (
                        <p className="text-xs text-gray-500">
                          By {teller.preferred_name || teller.full_name}
                        </p>
                      ) : null;
                    })()}
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
              <Clock className="h-5 w-5 text-picc-red" />
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
                    <div className="p-2 bg-warm-50 rounded-lg">
                      <BookOpen className="h-4 w-4 text-picc-red" />
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
          <div className="bg-gradient-to-r from-picc-ochre via-picc-ochre to-warm-500 rounded-2xl p-8 text-white">
            <div className="flex flex-col md:flex-row items-center gap-6">
              <div className="p-4 bg-white/20 rounded-2xl backdrop-blur-sm">
                <Bot className="h-12 w-12" />
              </div>
              <div className="flex-1 text-center md:text-left">
                <h2 className="text-2xl font-bold mb-2">Ask Our AI Assistant</h2>
                <p className="text-white/90 mb-4">
                  Have questions about PICC's programs, history, or community stories?
                  Our AI assistant has access to 17 years of knowledge and can help you find answers.
                </p>
                <Link
                  href="/chat"
                  className="inline-flex items-center gap-2 px-6 py-3 bg-white text-picc-ochre font-semibold rounded-xl hover:bg-gray-100 transition-colors"
                >
                  <Bot className="h-5 w-5" />
                  Start a Conversation
                </Link>
              </div>
            </div>
          </div>
        </section>

        {/* Contribute CTA */}
        <section className="bg-gradient-to-br from-warm-50 to-warm-50 rounded-2xl border border-picc-red-200 p-8">
          <div className="flex flex-col md:flex-row items-center gap-6">
            <div className="p-4 bg-picc-red-100 rounded-2xl">
              <Mic className="h-10 w-10 text-picc-red" />
            </div>
            <div className="flex-1 text-center md:text-left">
              <h2 className="text-2xl font-bold text-gray-900 mb-2">Share Your Voice</h2>
              <p className="text-gray-600 mb-4">
                Your story matters. Contribute to our community knowledge base and help preserve
                Palm Island's heritage for future generations.
              </p>
              <Link
                href="/share-voice"
                className="inline-flex items-center gap-2 px-6 py-3 bg-picc-red text-white font-semibold rounded-xl hover:bg-picc-red transition-colors"
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
