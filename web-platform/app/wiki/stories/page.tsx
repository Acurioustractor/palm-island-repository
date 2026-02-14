'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { createClient } from '@/lib/supabase/client';
import { BookOpen, Heart, Users, Sparkles, Calendar, Video, Image as ImageIcon, Mic } from 'lucide-react';
import Breadcrumbs from '@/components/wiki/Breadcrumbs';

interface Story {
  id: string;
  title: string;
  summary?: string;
  content?: string;
  story_category: string;
  emotional_theme?: string;
  created_at: string;
  traditional_knowledge?: boolean;
  storyteller?: {
    full_name: string;
    preferred_name?: string;
    is_elder?: boolean;
    profile_image_url?: string;
  };
  story_media?: Array<{
    id: string;
    media_type: string;
  }>;
}

export default function WikiStoriesPage() {
  const [stories, setStories] = useState<Story[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function fetchStories() {
      const supabase = createClient();

      const { data, error } = await supabase
        .from('stories')
        .select(`
          id,
          title,
          summary,
          content,
          story_category,
          emotional_theme,
          created_at,
          traditional_knowledge,
          storyteller:storyteller_id (
            full_name,
            preferred_name,
            is_elder,
            profile_image_url
          ),
          story_media (
            id,
            media_type
          )
        `)
        .eq('is_public', true)
        .eq('organization_id', '3c2011b9-f80d-4289-b300-0cd383cff479')
        .order('created_at', { ascending: false });

      if (error) {
        console.error('Error fetching stories:', error);
      } else {
        setStories(
          (data || []).map((s: any) => ({
            ...s,
            storyteller: Array.isArray(s.storyteller) ? s.storyteller[0] || null : s.storyteller,
            story_media: Array.isArray(s.story_media) ? s.story_media : [],
          }))
        );
      }

      setLoading(false);
    }

    fetchStories();
  }, []);

  const breadcrumbs = [
    { label: 'Wiki', href: '/wiki' },
    { label: 'Stories', href: '/wiki/stories' },
  ];

  const categoryCounts = stories.reduce((acc: Record<string, number>, story) => {
    acc[story.story_category] = (acc[story.story_category] || 0) + 1;
    return acc;
  }, {});

  const elderStories = stories.filter(s => s.storyteller?.is_elder);
  const traditionalKnowledge = stories.filter(s => s.traditional_knowledge);

  if (loading) {
    return (
      <div className="container mx-auto px-4 py-8">
        <div className="text-center">
          <div className="animate-spin rounded-full h-16 w-16 border-b-2 border-picc-red mx-auto mb-4"></div>
          <p className="text-xl text-gray-700">Loading stories...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-8 max-w-6xl">
      <Breadcrumbs items={breadcrumbs} className="mb-6" />

      {/* Header */}
      <div className="mb-8">
        <h1 className="text-4xl font-bold text-gray-900 mb-4 flex items-center gap-3">
          <BookOpen className="h-10 w-10 text-picc-red" />
          Community Stories
        </h1>
        <p className="text-xl text-gray-600">
          Every voice matters. Every story shapes our future.
        </p>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
        <div className="bg-warm-50 rounded-lg p-4 text-center border border-warm-200">
          <div className="text-3xl font-bold text-picc-red">{stories.length}</div>
          <div className="text-sm text-gray-600">Total Stories</div>
        </div>
        <div className="bg-warm-100 rounded-lg p-4 text-center border border-warm-200">
          <div className="text-3xl font-bold text-picc-ochre">{elderStories.length}</div>
          <div className="text-sm text-gray-600">Elder Stories</div>
        </div>
        <div className="bg-picc-ochre-50 rounded-lg p-4 text-center border border-picc-ochre-200">
          <div className="text-3xl font-bold text-picc-ochre">{traditionalKnowledge.length}</div>
          <div className="text-sm text-gray-600">Traditional Knowledge</div>
        </div>
        <div className="bg-picc-ochre-50 rounded-lg p-4 text-center border border-picc-ochre-200">
          <div className="text-3xl font-bold text-picc-ochre">
            {Object.keys(categoryCounts).length}
          </div>
          <div className="text-sm text-gray-600">Categories</div>
        </div>
      </div>

      {/* Traditional Knowledge Stories */}
      {traditionalKnowledge.length > 0 && (
        <div className="mb-8">
          <div className="bg-white rounded-lg border border-stone-300 shadow-sm overflow-hidden">
            <div className="bg-gradient-to-r from-stone-100 to-picc-ochre-50 border-b border-stone-200 px-6 py-4">
              <div className="flex items-center justify-between">
                <h2 className="text-2xl font-bold text-gray-900 flex items-center gap-2">
                  <Sparkles className="h-6 w-6 text-picc-ochre" />
                  Traditional Knowledge
                </h2>
                <span className="px-3 py-1 bg-picc-ochre-100 text-picc-earth rounded-full text-sm font-medium border border-picc-ochre-300">
                  Cultural Sensitivity
                </span>
              </div>
            </div>
            <div className="p-6">
              <p className="text-sm text-gray-600 mb-4 bg-picc-ochre-50 border border-picc-ochre-200 rounded p-3">
                These stories contain traditional knowledge shared with permission from elders
                and knowledge keepers. Please treat with respect and cultural sensitivity.
              </p>
              <div className="space-y-3">
                {traditionalKnowledge.slice(0, 6).map((story) => (
                  <Link
                    key={story.id}
                    href={`/stories/${story.id}`}
                    className="block p-4 border border-gray-200 rounded-lg hover:border-picc-ochre-300 hover:bg-picc-ochre-50/50 transition-all group"
                  >
                    <div className="flex items-start gap-3">
                      <Sparkles className="h-5 w-5 text-picc-ochre mt-0.5 flex-shrink-0" />
                      <div className="flex-1 min-w-0">
                        <h3 className="font-semibold text-gray-900 group-hover:text-picc-ochre">
                          {story.title}
                        </h3>
                        {story.summary && (
                          <p className="text-sm text-gray-600 line-clamp-2 mt-1">
                            {story.summary}
                          </p>
                        )}
                        {story.storyteller && (
                          <p className="text-xs text-gray-500 mt-2">
                            by {story.storyteller.preferred_name || story.storyteller.full_name}
                            {story.storyteller.is_elder && ' (Elder)'}
                          </p>
                        )}
                      </div>
                    </div>
                  </Link>
                ))}
              </div>
            </div>
          </div>
        </div>
      )}

      {/* All Stories */}
      <div className="bg-white rounded-lg border border-stone-300 shadow-sm overflow-hidden">
        <div className="bg-gradient-to-r from-stone-100 to-warm-50 border-b border-stone-200 px-6 py-4">
          <h2 className="text-2xl font-bold text-gray-900">All Stories</h2>
        </div>
        <div className="p-6">
          {stories.length > 0 ? (
            <div className="space-y-3">
              {stories.map((story) => (
                <Link
                  key={story.id}
                  href={`/stories/${story.id}`}
                  className="block p-4 border border-gray-200 rounded-lg hover:border-picc-red-300 hover:bg-warm-50/50 transition-all group"
                >
                  <div className="flex items-start justify-between gap-4">
                    <div className="flex-1 min-w-0">
                      <h3 className="font-semibold text-gray-900 group-hover:text-picc-red">
                        {story.title}
                      </h3>
                      {story.summary && (
                        <p className="text-sm text-gray-600 line-clamp-2 mt-1">
                          {story.summary}
                        </p>
                      )}
                      <div className="flex flex-wrap items-center gap-2 mt-2 text-xs">
                        {story.story_category && (
                          <span className="px-2 py-1 bg-stone-100 rounded border border-stone-300">
                            {story.story_category.replace(/_/g, ' ')}
                          </span>
                        )}
                        {story.storyteller && (
                          <span className="text-gray-500 flex items-center gap-1">
                            <Users className="h-3 w-3" />
                            {story.storyteller.preferred_name || story.storyteller.full_name}
                            {story.storyteller.is_elder && ' (Elder)'}
                          </span>
                        )}
                        {story.story_media && story.story_media.length > 0 && (
                          <span className="text-gray-500 flex items-center gap-1">
                            {story.story_media.some(m => m.media_type === 'video') && <Video className="h-3 w-3" />}
                            {story.story_media.some(m => m.media_type === 'photo') && <ImageIcon className="h-3 w-3" />}
                            {story.story_media.some(m => m.media_type === 'audio') && <Mic className="h-3 w-3" />}
                            {story.story_media.length} media
                          </span>
                        )}
                        <span className="text-gray-400 flex items-center gap-1 ml-auto">
                          <Calendar className="h-3 w-3" />
                          {new Date(story.created_at).toLocaleDateString()}
                        </span>
                      </div>
                    </div>
                  </div>
                </Link>
              ))}
            </div>
          ) : (
            <div className="text-center py-8 text-gray-500">
              <p>Stories will appear here as they are added to the collection.</p>
            </div>
          )}
        </div>
      </div>

      {/* Related Pages */}
      <div className="mt-8 grid md:grid-cols-3 gap-4">
        <Link
          href="/stories"
          className="block p-6 bg-gradient-to-r from-warm-50 to-warm-100 border border-warm-200 rounded-lg hover:shadow-md transition-all group"
        >
          <Heart className="h-8 w-8 text-picc-red mb-2" />
          <h3 className="font-bold text-picc-earth mb-2 group-hover:text-picc-red">
            Public Gallery
          </h3>
          <p className="text-sm text-gray-700">
            Browse stories in gallery view
          </p>
        </Link>
        <Link
          href="/wiki/culture"
          className="block p-6 bg-gradient-to-r from-picc-ochre-50 to-warm-50 border border-picc-ochre-200 rounded-lg hover:shadow-md transition-all group"
        >
          <Sparkles className="h-8 w-8 text-picc-ochre mb-2" />
          <h3 className="font-bold text-picc-ochre-900 mb-2 group-hover:text-picc-ochre-700">
            Culture & Language
          </h3>
          <p className="text-sm text-gray-700">
            Traditional knowledge & heritage
          </p>
        </Link>
        <Link
          href="/wiki/people?filter=elder"
          className="block p-6 bg-gradient-to-r from-warm-100 to-warm-50 border border-warm-200 rounded-lg hover:shadow-md transition-all group"
        >
          <Users className="h-8 w-8 text-picc-ochre mb-2" />
          <h3 className="font-bold text-picc-earth-600 mb-2 group-hover:text-picc-ochre">
            Meet Our Storytellers
          </h3>
          <p className="text-sm text-gray-700">
            Learn from community voices
          </p>
        </Link>
      </div>
    </div>
  );
}
