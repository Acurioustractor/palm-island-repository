'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { createClient } from '@/lib/supabase/client';
import { Clock, BookOpen, Calendar, Filter } from 'lucide-react';
import Breadcrumbs from '@/components/wiki/Breadcrumbs';

interface Story {
  id: string;
  title: string;
  summary?: string;
  created_at: string;
  story_date?: string;
  story_category?: string;
  location?: string;
  storyteller?: {
    full_name: string;
    preferred_name?: string;
  };
}

interface TimelineGroup {
  period: string;
  year: number;
  month?: number;
  stories: Story[];
}

export default function TimelinePage() {
  const [stories, setStories] = useState<Story[]>([]);
  const [timeline, setTimeline] = useState<TimelineGroup[]>([]);
  const [loading, setLoading] = useState(true);
  const [groupBy, setGroupBy] = useState<'year' | 'month'>('year');

  useEffect(() => {
    async function fetchStories() {
      const supabase = createClient();

      const { data, error } = await supabase
        .from('stories')
        .select(`
          id,
          title,
          summary,
          created_at,
          story_date,
          story_category,
          location,
          is_public,
          storyteller:storyteller_id (
            full_name,
            preferred_name
          )
        `)
        .eq('is_public', true)
        .order('story_date', { ascending: false, nullsFirst: false })
        .order('created_at', { ascending: false });

      if (error) {
        console.error('Error fetching timeline:', error);
        setLoading(false);
        return;
      }

      setStories(data || []);
      setLoading(false);
    }

    fetchStories();
  }, []);

  useEffect(() => {
    // Group stories by time period
    const groups = new Map<string, TimelineGroup>();

    stories.forEach((story) => {
      const date = new Date(story.story_date || story.created_at);
      const year = date.getFullYear();
      const month = date.getMonth();

      let key: string;
      let period: string;

      if (groupBy === 'year') {
        key = `${year}`;
        period = `${year}`;
      } else {
        key = `${year}-${month}`;
        const monthName = date.toLocaleDateString('en-US', { month: 'long' });
        period = `${monthName} ${year}`;
      }

      if (!groups.has(key)) {
        groups.set(key, {
          period,
          year,
          month: groupBy === 'month' ? month : undefined,
          stories: [],
        });
      }

      groups.get(key)!.stories.push(story);
    });

    // Convert to array and sort
    const timelineArray = Array.from(groups.values()).sort((a, b) => {
      if (a.year !== b.year) return b.year - a.year;
      if (a.month !== undefined && b.month !== undefined) {
        return b.month - a.month;
      }
      return 0;
    });

    setTimeline(timelineArray);
  }, [stories, groupBy]);

  const breadcrumbs = [
    { label: 'Wiki', href: '/wiki' },
    { label: 'Timeline', href: '/wiki/timeline' },
  ];

  if (loading) {
    return (
      <div className="container mx-auto px-4 py-8">
        <div className="text-center">
          <div className="animate-spin rounded-full h-16 w-16 border-b-2 border-amber-600 mx-auto mb-4"></div>
          <p className="text-xl text-gray-700">Loading timeline...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-8 max-w-5xl">
      <Breadcrumbs items={breadcrumbs} className="mb-6" />

      {/* Header */}
      <div className="mb-8">
        <h1 className="text-4xl font-bold text-gray-900 mb-4 flex items-center gap-3">
          <Clock className="h-10 w-10 text-blue-600" />
          Story Timeline
        </h1>
        <p className="text-xl text-gray-600">
          Explore stories in chronological order
        </p>
      </div>

      {/* Controls */}
      <div className="bg-white rounded-lg border border-gray-200 p-4 mb-8">
        <div className="flex items-center gap-4">
          <Filter className="h-5 w-5 text-gray-600" />
          <span className="text-sm font-medium text-gray-700">Group by:</span>
          <button
            onClick={() => setGroupBy('year')}
            className={`px-4 py-2 rounded-lg font-medium transition-all ${
              groupBy === 'year'
                ? 'bg-amber-600 text-white'
                : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
            }`}
          >
            Year
          </button>
          <button
            onClick={() => setGroupBy('month')}
            className={`px-4 py-2 rounded-lg font-medium transition-all ${
              groupBy === 'month'
                ? 'bg-amber-600 text-white'
                : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
            }`}
          >
            Month
          </button>
        </div>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-3 gap-4 mb-8">
        <div className="bg-blue-50 rounded-lg p-4 text-center border border-blue-200">
          <div className="text-3xl font-bold text-blue-600">{stories.length}</div>
          <div className="text-sm text-gray-600">Total Stories</div>
        </div>
        <div className="bg-green-50 rounded-lg p-4 text-center border border-green-200">
          <div className="text-3xl font-bold text-green-600">{timeline.length}</div>
          <div className="text-sm text-gray-600">Time Periods</div>
        </div>
        <div className="bg-amber-50 rounded-lg p-4 text-center border border-amber-200">
          <div className="text-3xl font-bold text-amber-600">
            {timeline.length > 0 ? timeline[0].year : new Date().getFullYear()}
          </div>
          <div className="text-sm text-gray-600">Latest Year</div>
        </div>
      </div>

      {/* Timeline */}
      <div className="relative">
        {/* Vertical line */}
        <div className="absolute left-8 top-0 bottom-0 w-0.5 bg-gradient-to-b from-blue-200 via-amber-200 to-stone-200"></div>

        <div className="space-y-8">
          {timeline.map((group) => (
            <div key={group.period} className="relative pl-20">
              {/* Period marker */}
              <div className="absolute left-0 top-0 flex items-center">
                <div className="h-16 w-16 rounded-full bg-white border-4 border-amber-500 flex items-center justify-center shadow-lg">
                  <Calendar className="h-6 w-6 text-amber-600" />
                </div>
              </div>

              {/* Period content */}
              <div className="bg-white rounded-lg border border-stone-300 shadow-sm overflow-hidden">
                {/* Header */}
                <div className="bg-gradient-to-r from-stone-100 to-amber-50 border-b border-stone-200 px-6 py-4">
                  <h2 className="text-2xl font-bold text-gray-900">{group.period}</h2>
                  <p className="text-sm text-gray-600">
                    {group.stories.length} {group.stories.length === 1 ? 'story' : 'stories'}
                  </p>
                </div>

                {/* Stories */}
                <div className="p-6 space-y-4">
                  {group.stories.map((story) => (
                    <Link
                      key={story.id}
                      href={`/stories/${story.id}`}
                      className="block p-4 border border-gray-200 rounded-lg hover:border-amber-300 hover:bg-amber-50/50 transition-all group"
                    >
                      <div className="flex items-start gap-3">
                        <BookOpen className="h-5 w-5 text-amber-600 mt-0.5 flex-shrink-0" />
                        <div className="flex-1 min-w-0">
                          <h3 className="font-semibold text-gray-900 group-hover:text-amber-700 mb-1">
                            {story.title}
                          </h3>
                          {story.summary && (
                            <p className="text-sm text-gray-600 line-clamp-2 mb-2">
                              {story.summary}
                            </p>
                          )}
                          <div className="flex flex-wrap items-center gap-3 text-xs text-gray-500">
                            {story.story_date && (
                              <span className="flex items-center gap-1">
                                <Calendar className="h-3 w-3" />
                                {new Date(story.story_date).toLocaleDateString()}
                              </span>
                            )}
                            {story.location && (
                              <span className="px-2 py-1 bg-emerald-50 text-emerald-700 rounded border border-emerald-200">
                                {story.location}
                              </span>
                            )}
                            {story.story_category && (
                              <span className="px-2 py-1 bg-stone-100 rounded border border-stone-300">
                                {story.story_category.replace(/_/g, ' ')}
                              </span>
                            )}
                            {story.storyteller && (
                              <span>
                                by {story.storyteller.preferred_name || story.storyteller.full_name}
                              </span>
                            )}
                          </div>
                        </div>
                      </div>
                    </Link>
                  ))}
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* No stories */}
      {timeline.length === 0 && (
        <div className="text-center py-12 bg-white rounded-xl border border-gray-200">
          <Clock className="h-16 w-16 text-gray-400 mx-auto mb-4" />
          <h3 className="text-xl font-semibold text-gray-900 mb-2">
            No stories found
          </h3>
          <p className="text-gray-600">Stories will appear here once they're added</p>
        </div>
      )}
    </div>
  );
}
