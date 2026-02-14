'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { createClient } from '@/lib/supabase/client';
import { Clock, BookOpen, Calendar, MapPin } from 'lucide-react';
import Breadcrumbs from '@/components/wiki/Breadcrumbs';

interface HistoricalStory {
  id: string;
  title: string;
  summary?: string;
  story_date?: string;
  created_at: string;
  location?: string;
  story_category?: string;
  is_public?: boolean;
  storyteller?: {
    full_name: string;
    preferred_name?: string;
    is_elder?: boolean;
  } | {
    full_name: string;
    preferred_name?: string;
    is_elder?: boolean;
  }[];
}

export default function HistoryPage() {
  const [stories, setStories] = useState<HistoricalStory[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function fetchHistoricalContent() {
      const supabase = createClient();

      // Fetch stories with historical/cultural significance
      const { data, error } = await supabase
        .from('stories')
        .select(`
          id,
          title,
          summary,
          story_date,
          created_at,
          location,
          story_category,
          is_public,
          storyteller:storyteller_id (
            full_name,
            preferred_name,
            is_elder
          )
        `)
        .eq('is_public', true)
        .order('story_date', { ascending: true, nullsFirst: false });

      if (error) {
        console.error('Error fetching history:', error);
      } else {
        setStories((data || []) as unknown as HistoricalStory[]);
      }

      setLoading(false);
    }

    fetchHistoricalContent();
  }, []);

  const elderStories = stories.filter(s => {
    const storyteller = Array.isArray(s.storyteller) ? s.storyteller[0] : s.storyteller;
    return storyteller?.is_elder;
  });
  const oldestStory = stories.length > 0 ? stories[0] : null;

  const breadcrumbs = [
    { label: 'Wiki', href: '/wiki' },
    { label: 'History & Heritage', href: '/wiki/history' },
  ];

  if (loading) {
    return (
      <div className="container mx-auto px-4 py-8">
        <div className="text-center">
          <div className="animate-spin rounded-full h-16 w-16 border-b-2 border-picc-ochre mx-auto mb-4"></div>
          <p className="text-xl text-gray-700">Loading history...</p>
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
          <Clock className="h-10 w-10 text-picc-ochre" />
          History & Heritage
        </h1>
        <p className="text-xl text-gray-600">
          Manbarra & Bwgcolman Country - Our Journey, Our Stories
        </p>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 md:grid-cols-3 gap-4 mb-8">
        <div className="bg-picc-ochre-50 rounded-lg p-4 text-center border border-picc-ochre-200">
          <div className="text-3xl font-bold text-picc-ochre">{stories.length}</div>
          <div className="text-sm text-gray-600">Historical Stories</div>
        </div>
        <div className="bg-warm-50 rounded-lg p-4 text-center border border-warm-200">
          <div className="text-3xl font-bold text-picc-red">{elderStories.length}</div>
          <div className="text-sm text-gray-600">Elder Stories</div>
        </div>
        <div className="bg-sage-50 rounded-lg p-4 text-center border border-sage-200">
          <div className="text-3xl font-bold text-sage-600">2021</div>
          <div className="text-sm text-gray-600">PICC Established</div>
        </div>
      </div>

      {/* Historical Context */}
      <div className="bg-gradient-to-r from-picc-ochre-50 to-orange-50 border border-picc-ochre-200 rounded-lg p-8 mb-8">
        <h2 className="text-2xl font-bold text-gray-900 mb-4 flex items-center gap-2">
          <MapPin className="h-6 w-6 text-picc-ochre" />
          Palm Island: Manbarra & Bwgcolman Country
        </h2>
        <div className="prose max-w-none text-gray-700 space-y-4">
          <p>
            Palm Island is home to the Manbarra people and the Bwgcolman community. Our history
            is one of resilience, resistance, and the ongoing journey toward self-determination.
          </p>
          <div className="grid md:grid-cols-2 gap-6 mt-6">
            <div className="bg-white rounded-lg p-6 border border-picc-ochre-200">
              <h3 className="font-bold text-picc-earth mb-2">Traditional Owners</h3>
              <p className="text-sm text-gray-600">
                The Manbarra people are the traditional owners of Palm Island, with deep
                cultural connections to land and sea spanning thousands of years.
              </p>
            </div>
            <div className="bg-white rounded-lg p-6 border border-picc-ochre-200">
              <h3 className="font-bold text-picc-earth mb-2">Community Sovereignty</h3>
              <p className="text-sm text-gray-600">
                In 2021, PICC achieved 100% community control, operating 16+ integrated
                services with 197 staff members - proving Indigenous self-determination works.
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Timeline of Key Events */}
      <div className="bg-white rounded-lg border border-stone-300 shadow-sm overflow-hidden mb-8">
        <div className="bg-gradient-to-r from-stone-100 to-picc-ochre-50 border-b border-stone-200 px-6 py-4">
          <h2 className="text-2xl font-bold text-gray-900 flex items-center gap-2">
            <Calendar className="h-6 w-6 text-picc-ochre" />
            Key Milestones
          </h2>
        </div>
        <div className="p-6">
          <div className="space-y-4">
            <div className="flex gap-4 pb-4 border-b border-gray-200">
              <div className="flex-shrink-0 w-24 font-bold text-picc-ochre">2021</div>
              <div className="flex-1">
                <h3 className="font-semibold text-gray-900">PICC Achieves Full Community Control</h3>
                <p className="text-sm text-gray-600">
                  Palm Island Community Company takes over all services, becoming 100% community-controlled
                </p>
              </div>
            </div>
            <div className="flex gap-4 pb-4 border-b border-gray-200">
              <div className="flex-shrink-0 w-24 font-bold text-picc-ochre">2024</div>
              <div className="flex-1">
                <h3 className="font-semibold text-gray-900">February Floods</h3>
                <p className="text-sm text-gray-600">
                  Community resilience during natural disaster, 26 stories of recovery documented
                </p>
              </div>
            </div>
            <div className="flex gap-4">
              <div className="flex-shrink-0 w-24 font-bold text-picc-ochre">Present</div>
              <div className="flex-1">
                <h3 className="font-semibold text-gray-900">Ongoing Journey</h3>
                <p className="text-sm text-gray-600">
                  Continuing to build community capacity, preserve culture, and demonstrate Indigenous excellence
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Elder Stories Section */}
      {elderStories.length > 0 && (
        <div className="mb-8">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-2xl font-bold text-gray-900">Elder Knowledge & Wisdom</h2>
            <Link
              href="/wiki/people?filter=elder"
              className="text-picc-ochre hover:text-picc-earth font-medium text-sm"
            >
              View all elders →
            </Link>
          </div>
          <div className="grid md:grid-cols-2 gap-4">
            {elderStories.slice(0, 4).map((story) => (
              <Link
                key={story.id}
                href={`/stories/${story.id}`}
                className="block p-4 bg-white border border-stone-300 rounded-lg hover:border-picc-ochre-300 hover:bg-picc-ochre-50/50 transition-all group"
              >
                <div className="flex items-start gap-3">
                  <BookOpen className="h-5 w-5 text-picc-ochre mt-0.5 flex-shrink-0" />
                  <div className="flex-1 min-w-0">
                    <h3 className="font-semibold text-gray-900 group-hover:text-picc-ochre mb-1">
                      {story.title}
                    </h3>
                    {story.summary && (
                      <p className="text-sm text-gray-600 line-clamp-2 mb-2">
                        {story.summary}
                      </p>
                    )}
                    <div className="text-xs text-gray-500">
                      {story.storyteller && (() => {
                        const teller = Array.isArray(story.storyteller) ? story.storyteller[0] : story.storyteller;
                        return teller ? <span>by {teller.preferred_name || teller.full_name}</span> : null;
                      })()}
                    </div>
                  </div>
                </div>
              </Link>
            ))}
          </div>
        </div>
      )}

      {/* All Historical Stories */}
      <div className="bg-white rounded-lg border border-stone-300 shadow-sm overflow-hidden">
        <div className="bg-gradient-to-r from-stone-100 to-picc-ochre-50 border-b border-stone-200 px-6 py-4">
          <h2 className="text-2xl font-bold text-gray-900">Historical Stories & Accounts</h2>
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
                      <h3 className="font-semibold text-gray-900 group-hover:text-picc-ochre">
                        {story.title}
                      </h3>
                      {story.summary && (
                        <p className="text-sm text-gray-600 line-clamp-1 mt-1">
                          {story.summary}
                        </p>
                      )}
                      <div className="flex flex-wrap gap-2 mt-2 text-xs text-gray-500">
                        {story.story_date && (
                          <span className="px-2 py-1 bg-picc-ochre-50 text-picc-ochre rounded border border-picc-ochre-200">
                            {new Date(story.story_date).toLocaleDateString()}
                          </span>
                        )}
                        {story.location && (
                          <span className="px-2 py-1 bg-sage-50 text-sage-700 rounded border border-sage-200">
                            {story.location}
                          </span>
                        )}
                        {(() => {
                          const teller = Array.isArray(story.storyteller) ? story.storyteller[0] : story.storyteller;
                          return teller?.is_elder ? (
                            <span className="px-2 py-1 bg-warm-50 text-picc-red rounded border border-warm-200">
                              Elder Story
                            </span>
                          ) : null;
                        })()}
                      </div>
                    </div>
                  </div>
                </Link>
              ))}
            </div>
          ) : (
            <div className="text-center py-8 text-gray-500">
              <p>Historical stories will appear here as they are added to the collection.</p>
            </div>
          )}
        </div>
      </div>

      {/* Links to Related Pages */}
      <div className="mt-8 grid md:grid-cols-2 gap-4">
        <Link
          href="/wiki/timeline"
          className="block p-6 bg-gradient-to-r from-warm-50 to-picc-ochre-50 border border-warm-200 rounded-lg hover:shadow-md transition-all group"
        >
          <Clock className="h-8 w-8 text-picc-red mb-2" />
          <h3 className="font-bold text-picc-earth mb-2 group-hover:text-picc-red">
            View Timeline
          </h3>
          <p className="text-sm text-gray-700">
            Explore stories in chronological order
          </p>
        </Link>
        <Link
          href="/wiki/people?filter=elder"
          className="block p-6 bg-gradient-to-r from-picc-ochre-50 to-orange-50 border border-picc-ochre-200 rounded-lg hover:shadow-md transition-all group"
        >
          <BookOpen className="h-8 w-8 text-picc-ochre mb-2" />
          <h3 className="font-bold text-picc-earth mb-2 group-hover:text-picc-ochre">
            Meet Our Elders
          </h3>
          <p className="text-sm text-gray-700">
            Learn from our knowledge keepers
          </p>
        </Link>
      </div>
    </div>
  );
}
