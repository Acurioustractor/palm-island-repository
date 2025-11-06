'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { Calendar, BookOpen, Clock, Tag } from 'lucide-react';

interface Story {
  id: string;
  title: string;
  summary?: string;
  content?: string;
  story_category: string;
  created_at: string;
}

interface StoryTimelineProps {
  stories: Story[];
}

export default function StoryTimeline({ stories }: StoryTimelineProps) {
  const [filterCategory, setFilterCategory] = useState<string>('all');
  const [sortOrder, setSortOrder] = useState<'newest' | 'oldest'>('newest');

  if (stories.length === 0) {
    return (
      <div className="text-center py-12 card-modern">
        <BookOpen className="w-16 h-16 mx-auto mb-4 text-earth-medium" />
        <p className="text-earth-medium text-lg">No stories yet. Be the first to hear them!</p>
      </div>
    );
  }

  // Get unique categories
  const categories = Array.from(new Set(stories.map(s => s.story_category)));

  // Filter and sort stories
  let filteredStories = stories.filter(story =>
    filterCategory === 'all' || story.story_category === filterCategory
  );

  filteredStories = [...filteredStories].sort((a, b) => {
    const dateA = new Date(a.created_at).getTime();
    const dateB = new Date(b.created_at).getTime();
    return sortOrder === 'newest' ? dateB - dateA : dateA - dateB;
  });

  // Group stories by year
  const storiesByYear: Record<string, Story[]> = {};
  filteredStories.forEach(story => {
    const year = new Date(story.created_at).getFullYear().toString();
    if (!storiesByYear[year]) {
      storiesByYear[year] = [];
    }
    storiesByYear[year].push(story);
  });

  const years = Object.keys(storiesByYear).sort((a, b) =>
    sortOrder === 'newest' ? parseInt(b) - parseInt(a) : parseInt(a) - parseInt(b)
  );

  // Calculate reading time (approximately 250 words per minute)
  const getReadingTime = (content?: string) => {
    if (!content) return 0;
    const words = content.split(/\s+/).length;
    return Math.ceil(words / 250);
  };

  // Get category label
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

  return (
    <div>
      {/* Filters */}
      <div className="card-modern mb-6 p-4">
        <div className="flex flex-col md:flex-row gap-4 items-center justify-between">
          {/* Category Filter */}
          <div className="flex items-center gap-2 flex-wrap">
            <span className="text-sm font-medium text-earth-dark">Category:</span>
            <button
              onClick={() => setFilterCategory('all')}
              className={`px-3 py-1 rounded-lg text-sm transition-all ${
                filterCategory === 'all'
                  ? 'bg-coral-warm text-white'
                  : 'bg-earth-bg text-earth-dark hover:bg-earth-light'
              }`}
            >
              All ({stories.length})
            </button>
            {categories.map(cat => (
              <button
                key={cat}
                onClick={() => setFilterCategory(cat)}
                className={`px-3 py-1 rounded-lg text-sm transition-all ${
                  filterCategory === cat
                    ? 'bg-coral-warm text-white'
                    : 'bg-earth-bg text-earth-dark hover:bg-earth-light'
                }`}
              >
                {getCategoryLabel(cat)} ({stories.filter(s => s.story_category === cat).length})
              </button>
            ))}
          </div>

          {/* Sort Order */}
          <div className="flex items-center gap-2">
            <span className="text-sm font-medium text-earth-dark">Sort:</span>
            <button
              onClick={() => setSortOrder('newest')}
              className={`px-3 py-1 rounded-lg text-sm transition-all ${
                sortOrder === 'newest'
                  ? 'bg-ocean-medium text-white'
                  : 'bg-earth-bg text-earth-dark hover:bg-earth-light'
              }`}
            >
              Newest First
            </button>
            <button
              onClick={() => setSortOrder('oldest')}
              className={`px-3 py-1 rounded-lg text-sm transition-all ${
                sortOrder === 'oldest'
                  ? 'bg-ocean-medium text-white'
                  : 'bg-earth-bg text-earth-dark hover:bg-earth-light'
              }`}
            >
              Oldest First
            </button>
          </div>
        </div>
      </div>

      {/* Timeline */}
      <div className="space-y-8">
        {years.map((year) => (
          <div key={year}>
            {/* Year Header */}
            <div className="flex items-center gap-4 mb-4">
              <h3 className="text-2xl font-bold text-ocean-deep">{year}</h3>
              <div className="flex-1 border-t-2 border-coral-warm"></div>
              <span className="text-sm text-earth-medium">
                {storiesByYear[year].length} {storiesByYear[year].length === 1 ? 'story' : 'stories'}
              </span>
            </div>

            {/* Stories for this year */}
            <div className="space-y-4 pl-4 border-l-2 border-earth-light">
              {storiesByYear[year].map((story) => {
                const readingTime = getReadingTime(story.content);

                return (
                  <Link
                    key={story.id}
                    href={`/stories/${story.id}`}
                    className="block group"
                  >
                    <div className="card-modern hover:shadow-lg transition-all transform hover:-translate-y-1 relative ml-6">
                      {/* Timeline Dot */}
                      <div className="absolute -left-10 top-6 w-4 h-4 bg-coral-warm rounded-full border-4 border-white"></div>

                      <div className="p-4">
                        <h4 className="text-lg font-bold text-ocean-deep group-hover:text-coral-warm transition-colors mb-2">
                          {story.title}
                        </h4>

                        {story.summary && (
                          <p className="text-earth-medium text-sm mb-3 line-clamp-2">
                            {story.summary}
                          </p>
                        )}

                        <div className="flex flex-wrap items-center gap-4 text-sm text-earth-medium">
                          <div className="flex items-center gap-1">
                            <Calendar className="w-4 h-4" />
                            <span>{new Date(story.created_at).toLocaleDateString('en-US', {
                              month: 'long',
                              day: 'numeric',
                              year: 'numeric'
                            })}</span>
                          </div>

                          {readingTime > 0 && (
                            <div className="flex items-center gap-1">
                              <Clock className="w-4 h-4" />
                              <span>{readingTime} min read</span>
                            </div>
                          )}

                          <div className="flex items-center gap-1">
                            <Tag className="w-4 h-4" />
                            <span className="px-2 py-0.5 bg-ocean-light/10 text-ocean-medium rounded">
                              {getCategoryLabel(story.story_category)}
                            </span>
                          </div>
                        </div>
                      </div>
                    </div>
                  </Link>
                );
              })}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
