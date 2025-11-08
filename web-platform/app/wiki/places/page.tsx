'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { createClient } from '@/lib/supabase/client';
import { MapPin, BookOpen, Search } from 'lucide-react';
import Breadcrumbs from '@/components/wiki/Breadcrumbs';

interface LocationGroup {
  location: string;
  story_count: number;
  stories: Array<{
    id: string;
    title: string;
    summary?: string;
    created_at: string;
    story_category?: string;
  }>;
}

export default function PlacesPage() {
  const [locations, setLocations] = useState<LocationGroup[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');

  useEffect(() => {
    async function fetchPlaces() {
      const supabase = createClient();

      // Fetch all stories with locations
      const { data: stories, error } = await supabase
        .from('stories')
        .select('id, title, summary, location, created_at, story_category, is_public')
        .eq('is_public', true)
        .not('location', 'is', null)
        .order('location');

      if (error) {
        console.error('Error fetching places:', error);
        setLoading(false);
        return;
      }

      // Group stories by location
      const locationMap = new Map<string, LocationGroup>();

      stories?.forEach((story) => {
        const loc = story.location || 'Unknown Location';

        if (!locationMap.has(loc)) {
          locationMap.set(loc, {
            location: loc,
            story_count: 0,
            stories: [],
          });
        }

        const group = locationMap.get(loc)!;
        group.story_count++;
        group.stories.push({
          id: story.id,
          title: story.title,
          summary: story.summary,
          created_at: story.created_at,
          story_category: story.story_category,
        });
      });

      // Convert to array and sort by story count
      const locationsArray = Array.from(locationMap.values()).sort(
        (a, b) => b.story_count - a.story_count
      );

      setLocations(locationsArray);
      setLoading(false);
    }

    fetchPlaces();
  }, []);

  const filteredLocations = locations.filter((loc) =>
    loc.location.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const breadcrumbs = [
    { label: 'Wiki', href: '/wiki' },
    { label: 'Places', href: '/wiki/places' },
  ];

  if (loading) {
    return (
      <div className="container mx-auto px-4 py-8">
        <div className="text-center">
          <div className="animate-spin rounded-full h-16 w-16 border-b-2 border-amber-600 mx-auto mb-4"></div>
          <p className="text-xl text-gray-700">Loading places...</p>
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
          <MapPin className="h-10 w-10 text-emerald-600" />
          Stories by Place
        </h1>
        <p className="text-xl text-gray-600">
          Explore stories from different locations across Palm Island and beyond
        </p>
      </div>

      {/* Search */}
      <div className="bg-white rounded-lg border border-gray-200 p-4 mb-8">
        <div className="relative">
          <Search className="absolute left-3 top-3 h-5 w-5 text-gray-400" />
          <input
            type="text"
            placeholder="Search locations..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-amber-300 focus:border-transparent"
          />
        </div>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 md:grid-cols-3 gap-4 mb-8">
        <div className="bg-emerald-50 rounded-lg p-4 text-center border border-emerald-200">
          <div className="text-3xl font-bold text-emerald-600">{locations.length}</div>
          <div className="text-sm text-gray-600">Locations</div>
        </div>
        <div className="bg-blue-50 rounded-lg p-4 text-center border border-blue-200">
          <div className="text-3xl font-bold text-blue-600">
            {locations.reduce((sum, loc) => sum + loc.story_count, 0)}
          </div>
          <div className="text-sm text-gray-600">Total Stories</div>
        </div>
        <div className="bg-amber-50 rounded-lg p-4 text-center border border-amber-200">
          <div className="text-3xl font-bold text-amber-600">
            {filteredLocations.length}
          </div>
          <div className="text-sm text-gray-600">Showing</div>
        </div>
      </div>

      {/* Locations List */}
      <div className="space-y-6">
        {filteredLocations.map((location) => (
          <div
            key={location.location}
            className="bg-white rounded-lg border border-stone-300 shadow-sm overflow-hidden"
          >
            {/* Location Header */}
            <div className="bg-gradient-to-r from-stone-100 to-amber-50 border-b border-stone-200 px-6 py-4">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <MapPin className="h-6 w-6 text-emerald-600" />
                  <div>
                    <h2 className="text-2xl font-bold text-gray-900">
                      {location.location}
                    </h2>
                    <p className="text-sm text-gray-600">
                      {location.story_count} {location.story_count === 1 ? 'story' : 'stories'}
                    </p>
                  </div>
                </div>
              </div>
            </div>

            {/* Stories from this location */}
            <div className="p-6">
              <div className="space-y-4">
                {location.stories.slice(0, 5).map((story) => (
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
                        <div className="flex items-center gap-4 text-xs text-gray-500">
                          {story.story_category && (
                            <span className="px-2 py-1 bg-stone-100 rounded border border-stone-300">
                              {story.story_category.replace(/_/g, ' ')}
                            </span>
                          )}
                          <span>
                            {new Date(story.created_at).toLocaleDateString()}
                          </span>
                        </div>
                      </div>
                    </div>
                  </Link>
                ))}

                {location.stories.length > 5 && (
                  <Link
                    href={`/stories?location=${encodeURIComponent(location.location)}`}
                    className="block text-center py-3 text-amber-700 hover:text-amber-900 font-medium hover:bg-amber-50 rounded-lg transition-all"
                  >
                    View all {location.story_count} stories from {location.location} →
                  </Link>
                )}
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* No results */}
      {filteredLocations.length === 0 && (
        <div className="text-center py-12 bg-white rounded-xl border border-gray-200">
          <MapPin className="h-16 w-16 text-gray-400 mx-auto mb-4" />
          <h3 className="text-xl font-semibold text-gray-900 mb-2">
            No locations found
          </h3>
          <p className="text-gray-600">Try adjusting your search</p>
        </div>
      )}
    </div>
  );
}
