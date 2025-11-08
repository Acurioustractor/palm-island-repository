'use client';

import React, { useState, useEffect } from 'react';
import { createClient } from '@/lib/supabase/client';
import Link from 'next/link';
import { Heart, Calendar, User, MapPin, Search, Filter, Image as ImageIcon, Video, Mic, Sparkles } from 'lucide-react';
import SemanticSearch from '@/components/SemanticSearch';

interface Story {
  id: string;
  title: string;
  summary?: string;
  content?: string;
  story_category: string;
  emotional_theme?: string;
  created_at: string;
  storyteller?: {
    full_name: string;
    preferred_name: string;
    profile_image_url?: string;
  };
  organization?: {
    id: string;
    name: string;
    short_name: string;
    logo_url?: string;
  };
  service?: {
    id: string;
    service_name: string;
    service_color?: string;
    icon_name?: string;
  };
  project?: {
    id: string;
    name: string;
  };
  story_media?: Array<{
    id: string;
    media_type: string;
    file_path: string;
    supabase_bucket: string;
  }>;
}

export default function StoriesGalleryPage() {
  const [stories, setStories] = useState<Story[]>([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState<string>('all');
  const [searchQuery, setSearchQuery] = useState('');
  const [searchMode, setSearchMode] = useState<'keyword' | 'semantic'>('keyword');

  // Get PICC organization ID from environment variable
  const PICC_ORG_ID = process.env.NEXT_PUBLIC_PICC_ORGANIZATION_ID || '3c2011b9-f80d-4289-b300-0cd383cff479';

  useEffect(() => {
    async function fetchStories() {
      try {
        const supabase = createClient();

        // Try the full query first
        let { data, error } = await supabase
          .from('stories')
          .select(`
            id,
            title,
            summary,
            content,
            story_category,
            created_at,
            storyteller:storyteller_id (
              full_name,
              preferred_name,
              profile_image_url
            ),
            organization:organization_id (
              id,
              name,
              short_name,
              logo_url
            ),
            service:service_id (
              id,
              service_name,
              service_color,
              icon_name
            ),
            project:project_id (
              id,
              name
            ),
            story_media (
              id,
              media_type,
              file_path,
              supabase_bucket
            )
          `)
          .eq('is_public', true)
          .eq('organization_id', PICC_ORG_ID)
          .order('created_at', { ascending: false });

        // If query fails (likely due to missing columns), fall back to minimal query
        if (error) {
          console.warn('Full query failed, using minimal query:', error.message);
          const basicResult = await supabase
            .from('stories')
            .select(`
              id,
              title,
              summary,
              content,
              story_category,
              created_at,
              storyteller:storyteller_id (
                full_name,
                preferred_name,
                profile_image_url
              )
            `)
            .eq('is_public', true)
            .eq('organization_id', PICC_ORG_ID)
            .order('created_at', { ascending: false });

          data = basicResult.data;
          error = basicResult.error;
        }

        if (error) {
          console.error('Final error after fallback:', error);
          throw error;
        }

        console.log('✅ Successfully fetched stories:', data?.length || 0, 'stories');
        setStories(data || []);
        setLoading(false);
      } catch (error) {
        console.error('Error fetching stories:', error);
        setLoading(false);
      }
    }

    fetchStories();
  }, []);

  const emotionColors: Record<string, { bg: string; text: string; border: string }> = {
    hope_aspiration: { bg: 'bg-pink-50', text: 'text-pink-800', border: 'border-pink-300' },
    pride_accomplishment: { bg: 'bg-purple-50', text: 'text-purple-800', border: 'border-purple-300' },
    connection_belonging: { bg: 'bg-blue-50', text: 'text-blue-800', border: 'border-blue-300' },
    resilience: { bg: 'bg-green-50', text: 'text-green-800', border: 'border-green-300' },
    healing: { bg: 'bg-teal-50', text: 'text-teal-800', border: 'border-teal-300' },
    empowerment: { bg: 'bg-orange-50', text: 'text-orange-800', border: 'border-orange-300' },
    innovation: { bg: 'bg-indigo-50', text: 'text-indigo-800', border: 'border-indigo-300' },
  };

  const getEmotionLabel = (theme?: string) => {
    const labels: Record<string, string> = {
      hope_aspiration: 'Hope & Aspiration',
      pride_accomplishment: 'Pride & Achievement',
      connection_belonging: 'Connection & Belonging',
      resilience: 'Transformative Resilience',
      healing: 'Healing',
      empowerment: 'Empowerment',
      innovation: 'Innovation',
    };
    return theme ? labels[theme] || 'Community Spirit' : 'Community Spirit';
  };

  const getCategoryLabel = (category: string) => {
    const labels: Record<string, string> = {
      mens_health: "Men's Health",
      womens_health: "Women's Health",
      elder_care: 'Elder Care',
      youth: 'Youth',
      community: 'Community',
      health: 'Health',
      culture: 'Culture',
      education: 'Education',
      housing: 'Housing',
      justice: 'Justice',
      environment: 'Environment',
      family_support: 'Family Support',
    };
    return labels[category] || category;
  };

  const filteredStories = stories.filter(story => {
    const matchesFilter = filter === 'all' || story.story_category === filter;
    const matchesSearch = !searchQuery ||
      story.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      story.summary?.toLowerCase().includes(searchQuery.toLowerCase());
    return matchesFilter && matchesSearch;
  });

  const categories = [
    { value: 'all', label: 'All Stories', count: stories.length },
    { value: 'community', label: 'Community', count: stories.filter(s => s.story_category === 'community').length },
    { value: 'mens_health', label: "Men's Health", count: stories.filter(s => s.story_category === 'mens_health').length },
    { value: 'elder_care', label: 'Elder Care', count: stories.filter(s => s.story_category === 'elder_care').length },
    { value: 'youth', label: 'Youth', count: stories.filter(s => s.story_category === 'youth').length },
    { value: 'health', label: 'Health', count: stories.filter(s => s.story_category === 'health').length },
    { value: 'culture', label: 'Culture', count: stories.filter(s => s.story_category === 'culture').length },
  ].filter(cat => cat.count > 0);

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 to-teal-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-16 w-16 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-xl text-gray-700">Loading stories...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-teal-50">
      {/* Hero Header */}
      <div className="bg-gradient-to-r from-blue-900 to-teal-800 text-white py-16">
        <div className="container mx-auto px-4">
          <div className="max-w-4xl mx-auto text-center">
            <h1 className="text-5xl md:text-6xl font-bold mb-4">Community Stories</h1>
            <p className="text-xl md:text-2xl mb-6">
              Every voice matters. Every story shapes our future.
            </p>
            <p className="text-lg text-blue-100 italic">
              Manbarra & Bwgcolman Country • Palm Island
            </p>

            <div className="mt-8 flex justify-center gap-4 flex-wrap">
              <Link
                href="/stories/submit"
                className="bg-white text-blue-900 px-8 py-4 rounded-lg font-bold text-lg hover:bg-blue-50 transition-all transform hover:scale-105 shadow-xl"
              >
                Share Your Story
              </Link>
              <Link
                href="/storytellers"
                className="bg-purple-600 text-white px-8 py-4 rounded-lg font-bold text-lg hover:bg-purple-700 transition-all transform hover:scale-105 shadow-xl"
              >
                View Storytellers
              </Link>
              <Link
                href="/"
                className="bg-blue-800 text-white px-8 py-4 rounded-lg font-bold text-lg hover:bg-blue-700 transition-all"
              >
                Back to Home
              </Link>
            </div>
          </div>
        </div>
      </div>

      {/* Stats Bar */}
      <div className="bg-white shadow-lg py-6">
        <div className="container mx-auto px-4">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 max-w-4xl mx-auto">
            <div className="text-center">
              <div className="text-3xl font-bold text-blue-600">{stories.length}</div>
              <div className="text-sm text-gray-600">Total Stories</div>
            </div>
            <div className="text-center">
              <div className="text-3xl font-bold text-green-600">26</div>
              <div className="text-sm text-gray-600">Storm Stories</div>
            </div>
            <div className="text-center">
              <div className="text-3xl font-bold text-purple-600">100%</div>
              <div className="text-sm text-gray-600">Community Owned</div>
            </div>
            <div className="text-center">
              <div className="text-3xl font-bold text-orange-600">∞</div>
              <div className="text-sm text-gray-600">Impact</div>
            </div>
          </div>
        </div>
      </div>

      {/* Search and Filter */}
      <div className="container mx-auto px-4 py-8">
        <div className="max-w-6xl mx-auto mb-8">
          <div className="bg-white rounded-xl shadow-lg p-6">
            {/* Search Mode Toggle */}
            <div className="flex gap-2 mb-6 border-b border-gray-200">
              <button
                onClick={() => setSearchMode('keyword')}
                className={`flex items-center gap-2 px-4 py-3 font-medium transition-all border-b-2 ${
                  searchMode === 'keyword'
                    ? 'border-palm-600 text-palm-700'
                    : 'border-transparent text-gray-500 hover:text-gray-700'
                }`}
              >
                <Search className="h-5 w-5" />
                Keyword Search
              </button>
              <button
                onClick={() => setSearchMode('semantic')}
                className={`flex items-center gap-2 px-4 py-3 font-medium transition-all border-b-2 ${
                  searchMode === 'semantic'
                    ? 'border-palm-600 text-palm-700'
                    : 'border-transparent text-gray-500 hover:text-gray-700'
                }`}
              >
                <Sparkles className="h-5 w-5" />
                AI Semantic Search
                <span className="px-2 py-0.5 bg-palm-100 text-palm-700 text-xs rounded-full font-semibold">
                  NEW
                </span>
              </button>
            </div>

            {/* Conditional Rendering Based on Search Mode */}
            {searchMode === 'keyword' ? (
              <>
                <div className="flex flex-col md:flex-row gap-4 mb-6">
                  <div className="flex-1 relative">
                    <Search className="absolute left-3 top-3 h-5 w-5 text-gray-400" />
                    <input
                      type="text"
                      placeholder="Search stories by title or summary..."
                      value={searchQuery}
                      onChange={(e) => setSearchQuery(e.target.value)}
                      className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-palm-500 focus:border-transparent"
                    />
                  </div>
                </div>

                <div className="flex items-center gap-2 mb-4">
                  <Filter className="h-5 w-5 text-gray-600" />
                  <span className="font-medium text-gray-700">Filter by category:</span>
                </div>

                <div className="flex flex-wrap gap-2">
                  {categories.map(cat => (
                    <button
                      key={cat.value}
                      onClick={() => setFilter(cat.value)}
                      className={`px-4 py-2 rounded-lg font-medium transition-all ${
                        filter === cat.value
                          ? 'bg-palm-600 text-white shadow-lg'
                          : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                      }`}
                    >
                      {cat.label} ({cat.count})
                    </button>
                  ))}
                </div>
              </>
            ) : (
              <SemanticSearch />
            )}
          </div>
        </div>

        {/* Stories Grid - Only show in keyword mode */}
        {searchMode === 'keyword' && (
          <div className="max-w-6xl mx-auto">
            {filteredStories.length === 0 ? (
              <div className="text-center py-12 bg-white rounded-xl shadow-lg">
                <p className="text-xl text-gray-600">No stories found. Try adjusting your filters.</p>
              </div>
            ) : (
            <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
              {filteredStories.map((story) => {
                const emotionTheme = story.emotional_theme || 'resilience';
                const colors = emotionColors[emotionTheme] || emotionColors.resilience;

                return (
                  <Link
                    key={story.id}
                    href={`/stories/${story.id}`}
                    className={`group bg-white rounded-xl shadow-lg overflow-hidden hover:shadow-2xl transition-all transform hover:scale-105 border-2 ${colors.border}`}
                  >
                    {/* Story Image - Shows story photo or beautiful gradient */}
                    <div className="h-48 relative overflow-hidden">
                      {story.story_media && story.story_media.length > 0 && story.story_media[0].media_type === 'photo' ? (
                        <>
                          <img
                            src={`${process.env.NEXT_PUBLIC_SUPABASE_URL}/storage/v1/object/public/${story.story_media[0].supabase_bucket}/${story.story_media[0].file_path}`}
                            alt={story.title}
                            className="w-full h-full object-cover"
                          />
                          <div className="absolute bottom-2 right-2">
                            <div className={`text-xs font-medium ${colors.text} px-3 py-1 rounded-full bg-white/90 shadow-lg`}>
                              {getEmotionLabel(story.emotional_theme)}
                            </div>
                          </div>
                        </>
                      ) : (
                        <div className={`h-full ${colors.bg} flex items-center justify-center relative`}>
                          <div className="absolute inset-0 bg-gradient-to-br from-blue-400/20 to-teal-400/20"></div>
                          <div className="relative z-10 text-center">
                            <Heart className={`h-16 w-16 ${colors.text} mx-auto mb-2 opacity-50`} />
                            <div className={`text-sm font-medium ${colors.text} px-4 py-1 rounded-full bg-white/80 inline-block`}>
                              {getEmotionLabel(story.emotional_theme)}
                            </div>
                          </div>
                        </div>
                      )}
                    </div>

                    <div className="p-6">
                      <div className="flex items-center flex-wrap gap-2 mb-3">
                        {story.organization && (
                          <span className="bg-blue-600 text-white text-xs font-bold px-2 py-1 rounded">
                            🏢 {story.organization.short_name || story.organization.name}
                          </span>
                        )}
                        {story.service && (
                          <span
                            className="text-xs font-medium px-2 py-1 rounded text-white"
                            style={{ backgroundColor: story.service.service_color || '#3B82F6' }}
                          >
                            {story.service.service_name}
                          </span>
                        )}
                        {story.project && (
                          <span className="bg-green-100 text-green-800 text-xs font-medium px-2 py-1 rounded">
                            📋 {story.project.name}
                          </span>
                        )}
                        <span className="bg-gray-100 text-gray-700 text-xs font-medium px-2 py-1 rounded">
                          {getCategoryLabel(story.story_category)}
                        </span>
                      </div>

                      <h3 className="text-xl font-bold text-gray-900 mb-2 group-hover:text-blue-600 transition-colors line-clamp-2">
                        {story.title}
                      </h3>

                      {story.summary && (
                        <p className="text-gray-600 text-sm mb-4 line-clamp-3">
                          {story.summary}
                        </p>
                      )}

                      {/* Media indicators */}
                      {story.story_media && story.story_media.length > 0 && (
                        <div className="flex items-center gap-3 mb-3 text-xs text-gray-600">
                          {story.story_media.filter(m => m.media_type === 'photo').length > 0 && (
                            <div className="flex items-center">
                              <ImageIcon className="h-3 w-3 mr-1" />
                              {story.story_media.filter(m => m.media_type === 'photo').length} photos
                            </div>
                          )}
                          {story.story_media.filter(m => m.media_type === 'video').length > 0 && (
                            <div className="flex items-center">
                              <Video className="h-3 w-3 mr-1" />
                              {story.story_media.filter(m => m.media_type === 'video').length} videos
                            </div>
                          )}
                          {story.story_media.filter(m => m.media_type === 'audio').length > 0 && (
                            <div className="flex items-center">
                              <Mic className="h-3 w-3 mr-1" />
                              {story.story_media.filter(m => m.media_type === 'audio').length} audio
                            </div>
                          )}
                        </div>
                      )}

                      <div className="flex items-center justify-between text-sm text-gray-500 pt-4 border-t border-gray-200">
                        <div className="flex items-center gap-2">
                          {/* Avatar - profile photo or initials fallback */}
                          {story.storyteller?.profile_image_url ? (
                            <img
                              src={story.storyteller.profile_image_url}
                              alt={story.storyteller.preferred_name || story.storyteller.full_name}
                              className="h-8 w-8 rounded-full object-cover border-2 border-blue-300"
                            />
                          ) : (
                            <div className="h-8 w-8 rounded-full bg-gradient-to-br from-blue-500 to-teal-500 flex items-center justify-center text-white font-bold text-xs">
                              {(story.storyteller?.preferred_name || story.storyteller?.full_name || 'Community Voice')
                                .split(' ')
                                .map(n => n[0])
                                .join('')
                                .slice(0, 2)
                                .toUpperCase()}
                            </div>
                          )}
                          <span className="font-medium text-gray-700">
                            {story.storyteller?.preferred_name || story.storyteller?.full_name || 'Community Voice'}
                          </span>
                        </div>
                        <div className="flex items-center">
                          <Calendar className="h-4 w-4 mr-1" />
                          <span>{new Date(story.created_at).toLocaleDateString()}</span>
                        </div>
                      </div>

                      <div className="mt-4 text-blue-600 font-medium group-hover:text-blue-800 flex items-center">
                        Read story <span className="ml-2">→</span>
                      </div>
                    </div>
                  </Link>
                );
              })}
            </div>
            )}
          </div>
        )}

        {/* CTA Section */}
        <div className="max-w-4xl mx-auto mt-12 bg-gradient-to-r from-purple-600 to-blue-600 text-white rounded-xl shadow-2xl p-8 text-center">
          <h2 className="text-3xl font-bold mb-4">Your Story Matters</h2>
          <p className="text-lg mb-6">
            Whether it's a moment of pride, a lesson learned, or a vision for the future—
            your voice strengthens our community.
          </p>
          <Link
            href="/stories/submit"
            className="inline-block bg-white text-blue-900 px-8 py-4 rounded-lg font-bold text-lg hover:bg-blue-50 transition-all transform hover:scale-105 shadow-xl"
          >
            Share Your Story Now
          </Link>
        </div>
      </div>

      {/* Footer */}
      <footer className="bg-gray-800 text-white py-8 mt-12">
        <div className="container mx-auto px-4 text-center">
          <p className="text-lg font-medium mb-2">Palm Island Community Stories</p>
          <p className="text-sm text-gray-300 italic">
            Every story is owned by the community, protected by Indigenous data sovereignty
          </p>
          <p className="text-xs text-gray-400 mt-4">Manbarra & Bwgcolman Country</p>
        </div>
      </footer>
    </div>
  );
}
