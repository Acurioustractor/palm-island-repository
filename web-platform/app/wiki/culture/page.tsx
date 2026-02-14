'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { createClient } from '@/lib/supabase/client';
import { Globe, BookOpen, Heart, Users, Sparkles } from 'lucide-react';
import { BespokeIcon } from '@/components/ui/BespokeIcon';
import Breadcrumbs from '@/components/wiki/Breadcrumbs';

interface CulturalStory {
  id: string;
  title: string;
  summary?: string;
  story_category?: string;
  traditional_knowledge?: boolean;
  language_used?: string;
  is_public?: boolean;
  storyteller?: {
    full_name: string;
    preferred_name?: string;
    is_elder?: boolean;
    traditional_country?: string;
    language_group?: string;
  } | {
    full_name: string;
    preferred_name?: string;
    is_elder?: boolean;
    traditional_country?: string;
    language_group?: string;
  }[];
}

export default function CulturePage() {
  const [stories, setStories] = useState<CulturalStory[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function fetchCulturalContent() {
      const supabase = createClient();

      // Fetch stories with cultural significance
      const { data, error } = await supabase
        .from('stories')
        .select(`
          id,
          title,
          summary,
          story_category,
          traditional_knowledge,
          language_used,
          is_public,
          storyteller:storyteller_id (
            full_name,
            preferred_name,
            is_elder,
            traditional_country,
            language_group
          )
        `)
        .eq('is_public', true)
        .order('created_at', { ascending: false });

      if (error) {
        console.error('Error fetching culture:', error);
      } else {
        setStories((data || []) as unknown as CulturalStory[]);
      }

      setLoading(false);
    }

    fetchCulturalContent();
  }, []);

  const culturalStories = stories.filter(s =>
    s.story_category === 'culture_language' ||
    s.traditional_knowledge
  );
  const elderStories = stories.filter(s => {
    const storyteller = Array.isArray(s.storyteller) ? s.storyteller[0] : s.storyteller;
    return storyteller?.is_elder;
  });

  const breadcrumbs = [
    { label: 'Wiki', href: '/wiki' },
    { label: 'Culture & Language', href: '/wiki/culture' },
  ];

  if (loading) {
    return (
      <div className="container mx-auto px-4 py-8">
        <div className="text-center">
          <div className="animate-spin rounded-full h-16 w-16 border-b-2 border-picc-ochre mx-auto mb-4"></div>
          <p className="text-xl text-gray-700">Loading cultural content...</p>
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
          <Globe className="h-10 w-10 text-picc-ochre" />
          Culture & Language
        </h1>
        <p className="text-xl text-gray-600">
          Preserving and celebrating Manbarra & Bwgcolman heritage
        </p>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
        <div className="bg-picc-ochre-50 rounded-lg p-4 text-center border border-picc-ochre-200">
          <div className="text-3xl font-bold text-picc-ochre">{culturalStories.length}</div>
          <div className="text-sm text-gray-600">Cultural Stories</div>
        </div>
        <div className="bg-warm-50 rounded-lg p-4 text-center border border-warm-200">
          <div className="text-3xl font-bold text-picc-red">{elderStories.length}</div>
          <div className="text-sm text-gray-600">Elder Knowledge</div>
        </div>
        <div className="bg-warm-100 rounded-lg p-4 text-center border border-warm-200">
          <div className="text-3xl font-bold text-picc-ochre">
            {stories.filter(s => s.traditional_knowledge).length}
          </div>
          <div className="text-sm text-gray-600">Traditional Knowledge</div>
        </div>
        <div className="bg-picc-ochre-50 rounded-lg p-4 text-center border border-picc-ochre-200">
          <div className="text-3xl font-bold text-picc-ochre">{stories.length}</div>
          <div className="text-sm text-gray-600">Total Stories</div>
        </div>
      </div>

      {/* Cultural Overview */}
      <div className="bg-gradient-to-r from-picc-ochre-50 to-warm-50 border border-picc-ochre-200 rounded-lg p-8 mb-8">
        <h2 className="text-2xl font-bold text-gray-900 mb-4 flex items-center gap-2">
          <Heart className="h-6 w-6 text-picc-ochre" />
          Our Cultural Heritage
        </h2>
        <div className="prose max-w-none text-gray-700 space-y-4">
          <p>
            The Manbarra people and Bwgcolman community maintain strong cultural connections
            to land, sea, and traditional practices that have been passed down through generations.
          </p>
          <div className="grid md:grid-cols-3 gap-6 mt-6">
            <div className="bg-white rounded-lg p-6 border border-picc-ochre-200">
              <div className="mb-2"><BespokeIcon name="ocean" size={32} /></div>
              <h3 className="font-bold text-picc-ochre-900 mb-2">Traditional Country</h3>
              <p className="text-sm text-gray-600">
                Manbarra Country encompasses Palm Island and surrounding waters,
                with deep spiritual and cultural significance.
              </p>
            </div>
            <div className="bg-white rounded-lg p-6 border border-picc-ochre-200">
              <div className="mb-2"><BespokeIcon name="culture" size={32} /></div>
              <h3 className="font-bold text-picc-ochre-900 mb-2">Language Preservation</h3>
              <p className="text-sm text-gray-600">
                Efforts to preserve and revitalize traditional languages and Bwgcolman
                Creole are central to cultural maintenance.
              </p>
            </div>
            <div className="bg-white rounded-lg p-6 border border-picc-ochre-200">
              <div className="mb-2"><BespokeIcon name="knowledge" size={32} /></div>
              <h3 className="font-bold text-picc-ochre-900 mb-2">Elder Knowledge</h3>
              <p className="text-sm text-gray-600">
                Elders hold and share traditional knowledge, ensuring cultural
                continuity for future generations.
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Traditional Knowledge Stories */}
      {stories.filter(s => s.traditional_knowledge).length > 0 && (
        <div className="mb-8">
          <div className="bg-white rounded-lg border border-stone-300 shadow-sm overflow-hidden">
            <div className="bg-gradient-to-r from-stone-100 to-picc-ochre-50 border-b border-stone-200 px-6 py-4">
              <div className="flex items-center justify-between">
                <h2 className="text-2xl font-bold text-gray-900 flex items-center gap-2">
                  <Sparkles className="h-6 w-6 text-picc-ochre" />
                  Traditional Knowledge
                </h2>
                <span className="px-3 py-1 bg-picc-ochre-100 text-picc-ochre-800 rounded-full text-sm font-medium border border-picc-ochre-300">
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
                {stories.filter(s => s.traditional_knowledge).slice(0, 6).map((story) => (
                  <Link
                    key={story.id}
                    href={`/stories/${story.id}`}
                    className="block p-4 border border-gray-200 rounded-lg hover:border-picc-ochre-300 hover:bg-picc-ochre-50/50 transition-all group"
                  >
                    <div className="flex items-start gap-3">
                      <Sparkles className="h-5 w-5 text-picc-ochre mt-0.5 flex-shrink-0" />
                      <div className="flex-1 min-w-0">
                        <h3 className="font-semibold text-gray-900 group-hover:text-picc-ochre-700">
                          {story.title}
                        </h3>
                        {story.summary && (
                          <p className="text-sm text-gray-600 line-clamp-2 mt-1">
                            {story.summary}
                          </p>
                        )}
                        <div className="flex flex-wrap gap-2 mt-2 text-xs">
                          {(() => {
                            const storyteller = Array.isArray(story.storyteller) ? story.storyteller[0] : story.storyteller;
                            return (
                              <>
                                {storyteller?.is_elder && (
                                  <span className="px-2 py-1 bg-warm-50 text-picc-red rounded border border-warm-200">
                                    Elder Knowledge
                                  </span>
                                )}
                                {story.language_used && (
                                  <span className="px-2 py-1 bg-warm-100 text-picc-ochre rounded border border-warm-200">
                                    {story.language_used}
                                  </span>
                                )}
                                {storyteller?.traditional_country && (
                                  <span className="px-2 py-1 bg-sage-50 text-sage-700 rounded border border-sage-200">
                                    {storyteller.traditional_country}
                                  </span>
                                )}
                              </>
                            );
                          })()}
                        </div>
                      </div>
                    </div>
                  </Link>
                ))}
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Elder Stories */}
      {elderStories.length > 0 && (
        <div className="mb-8">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-2xl font-bold text-gray-900 flex items-center gap-2">
              <Users className="h-6 w-6 text-picc-red" />
              Stories from Elders
            </h2>
            <Link
              href="/wiki/people?filter=elder"
              className="text-picc-ochre-700 hover:text-picc-ochre-900 font-medium text-sm"
            >
              View all elders →
            </Link>
          </div>
          <div className="grid md:grid-cols-2 gap-4">
            {elderStories.slice(0, 4).map((story) => (
              <Link
                key={story.id}
                href={`/stories/${story.id}`}
                className="block p-4 bg-white border border-stone-300 rounded-lg hover:border-picc-ochre-400 hover:bg-picc-ochre-50/50 transition-all group"
              >
                <div className="flex items-start gap-3">
                  <BookOpen className="h-5 w-5 text-picc-ochre mt-0.5 flex-shrink-0" />
                  <div className="flex-1 min-w-0">
                    <h3 className="font-semibold text-gray-900 group-hover:text-picc-ochre-700 mb-1">
                      {story.title}
                    </h3>
                    {story.summary && (
                      <p className="text-sm text-gray-600 line-clamp-2 mb-2">
                        {story.summary}
                      </p>
                    )}
                    {(() => {
                      const storyteller = Array.isArray(story.storyteller) ? story.storyteller[0] : story.storyteller;
                      return storyteller && (
                        <p className="text-xs text-gray-500">
                          by {storyteller.preferred_name || storyteller.full_name}
                        </p>
                      );
                    })()}
                  </div>
                </div>
              </Link>
            ))}
          </div>
        </div>
      )}

      {/* All Cultural Stories */}
      <div className="bg-white rounded-lg border border-stone-300 shadow-sm overflow-hidden">
        <div className="bg-gradient-to-r from-stone-100 to-picc-ochre-50 border-b border-stone-200 px-6 py-4">
          <h2 className="text-2xl font-bold text-gray-900">All Cultural Stories</h2>
        </div>
        <div className="p-6">
          {stories.length > 0 ? (
            <div className="space-y-3">
              {stories.map((story) => (
                <Link
                  key={story.id}
                  href={`/stories/${story.id}`}
                  className="block p-4 border border-gray-200 rounded-lg hover:border-picc-ochre-300 hover:bg-picc-ochre-50/50 transition-all group"
                >
                  <div className="flex items-start justify-between gap-4">
                    <div className="flex-1 min-w-0">
                      <h3 className="font-semibold text-gray-900 group-hover:text-picc-ochre-700">
                        {story.title}
                      </h3>
                      {story.summary && (
                        <p className="text-sm text-gray-600 line-clamp-1 mt-1">
                          {story.summary}
                        </p>
                      )}
                      <div className="flex flex-wrap gap-2 mt-2 text-xs">
                        {story.story_category && (
                          <span className="px-2 py-1 bg-stone-100 rounded border border-stone-300">
                            {story.story_category.replace(/_/g, ' ')}
                          </span>
                        )}
                        {(() => {
                          const storyteller = Array.isArray(story.storyteller) ? story.storyteller[0] : story.storyteller;
                          return storyteller && (
                            <span className="text-gray-500">
                              by {storyteller.preferred_name || storyteller.full_name}
                            </span>
                          );
                        })()}
                      </div>
                    </div>
                  </div>
                </Link>
              ))}
            </div>
          ) : (
            <div className="text-center py-8 text-gray-500">
              <p>Cultural stories will appear here as they are added to the collection.</p>
            </div>
          )}
        </div>
      </div>

      {/* Links to Related Pages */}
      <div className="mt-8 grid md:grid-cols-3 gap-4">
        <Link
          href="/wiki/people?filter=elder"
          className="block p-6 bg-gradient-to-r from-warm-50 to-picc-ochre-50 border border-warm-200 rounded-lg hover:shadow-md transition-all group"
        >
          <Users className="h-8 w-8 text-picc-red mb-2" />
          <h3 className="font-bold text-picc-earth mb-2 group-hover:text-picc-red">
            Meet Our Elders
          </h3>
          <p className="text-sm text-gray-700">
            Learn from knowledge keepers
          </p>
        </Link>
        <Link
          href="/wiki/history"
          className="block p-6 bg-gradient-to-r from-picc-ochre-50 to-orange-50 border border-picc-ochre-200 rounded-lg hover:shadow-md transition-all group"
        >
          <BookOpen className="h-8 w-8 text-picc-ochre mb-2" />
          <h3 className="font-bold text-picc-earth mb-2 group-hover:text-picc-ochre">
            History & Heritage
          </h3>
          <p className="text-sm text-gray-700">
            Our journey and milestones
          </p>
        </Link>
        <Link
          href="/stories"
          className="block p-6 bg-gradient-to-r from-warm-100 to-warm-50 border border-warm-200 rounded-lg hover:shadow-md transition-all group"
        >
          <Heart className="h-8 w-8 text-picc-ochre mb-2" />
          <h3 className="font-bold text-picc-earth-600 mb-2 group-hover:text-picc-ochre">
            All Stories
          </h3>
          <p className="text-sm text-gray-700">
            Browse the full collection
          </p>
        </Link>
      </div>
    </div>
  );
}
