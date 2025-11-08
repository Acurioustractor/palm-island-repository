'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { createClient } from '@/lib/supabase/client';
import { Users, BookOpen, Search, Filter } from 'lucide-react';
import Breadcrumbs from '@/components/wiki/Breadcrumbs';

interface Person {
  id: string;
  full_name: string;
  preferred_name?: string;
  profile_image_url?: string;
  bio?: string;
  location?: string;
  storyteller_type?: string;
  story_count: number;
}

export default function PeoplePage() {
  const [people, setPeople] = useState<Person[]>([]);
  const [filteredPeople, setFilteredPeople] = useState<Person[]>([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [filter, setFilter] = useState('all');
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function fetchPeople() {
      const supabase = createClient();

      // Fetch people with their story counts
      const { data: stories } = await supabase
        .from('stories')
        .select(`
          id,
          storyteller:storyteller_id (
            id,
            full_name,
            preferred_name,
            profile_image_url,
            bio,
            location,
            storyteller_type
          )
        `)
        .eq('is_public', true)
        .not('storyteller_id', 'is', null);

      // Count stories per person
      const peopleMap = new Map<string, Person>();

      stories?.forEach((story: any) => {
        if (story.storyteller) {
          const existing = peopleMap.get(story.storyteller.id);
          if (existing) {
            existing.story_count++;
          } else {
            peopleMap.set(story.storyteller.id, {
              ...story.storyteller,
              story_count: 1,
            });
          }
        }
      });

      const peopleArray = Array.from(peopleMap.values()).sort(
        (a, b) => b.story_count - a.story_count
      );

      setPeople(peopleArray);
      setFilteredPeople(peopleArray);
      setLoading(false);
    }

    fetchPeople();
  }, []);

  useEffect(() => {
    let filtered = people;

    // Apply search
    if (searchQuery) {
      filtered = filtered.filter(
        (person) =>
          person.full_name.toLowerCase().includes(searchQuery.toLowerCase()) ||
          person.preferred_name?.toLowerCase().includes(searchQuery.toLowerCase()) ||
          person.location?.toLowerCase().includes(searchQuery.toLowerCase())
      );
    }

    // Apply filter
    if (filter !== 'all') {
      filtered = filtered.filter((person) => person.storyteller_type === filter);
    }

    setFilteredPeople(filtered);
  }, [searchQuery, filter, people]);

  const breadcrumbs = [
    { label: 'Wiki', href: '/wiki', icon: BookOpen },
    { label: 'People', href: '/wiki/people' },
  ];

  if (loading) {
    return (
      <div className="container mx-auto px-4 py-8">
        <div className="text-center">
          <div className="animate-spin rounded-full h-16 w-16 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-xl text-gray-700">Loading people...</p>
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
          <Users className="h-10 w-10 text-purple-600" />
          Community Storytellers
        </h1>
        <p className="text-xl text-gray-600">
          Meet the voices sharing knowledge, experience, and vision
        </p>
      </div>

      {/* Search and Filter */}
      <div className="bg-white rounded-lg border border-gray-200 p-4 mb-8">
        <div className="flex flex-col md:flex-row gap-4">
          {/* Search */}
          <div className="flex-1 relative">
            <Search className="absolute left-3 top-3 h-5 w-5 text-gray-400" />
            <input
              type="text"
              placeholder="Search by name or location..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
            />
          </div>

          {/* Filter */}
          <div className="flex items-center gap-2">
            <Filter className="h-5 w-5 text-gray-600" />
            <select
              value={filter}
              onChange={(e) => setFilter(e.target.value)}
              className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
            >
              <option value="all">All Storytellers</option>
              <option value="elder">Elders</option>
              <option value="service_provider">Service Providers</option>
              <option value="community_member">Community Members</option>
              <option value="youth">Youth</option>
            </select>
          </div>
        </div>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
        <div className="bg-purple-50 rounded-lg p-4 text-center">
          <div className="text-3xl font-bold text-purple-600">{people.length}</div>
          <div className="text-sm text-gray-600">Total Storytellers</div>
        </div>
        <div className="bg-blue-50 rounded-lg p-4 text-center">
          <div className="text-3xl font-bold text-blue-600">
            {people.reduce((sum, p) => sum + p.story_count, 0)}
          </div>
          <div className="text-sm text-gray-600">Total Stories</div>
        </div>
        <div className="bg-green-50 rounded-lg p-4 text-center">
          <div className="text-3xl font-bold text-green-600">
            {people.filter((p) => p.storyteller_type === 'elder').length}
          </div>
          <div className="text-sm text-gray-600">Elders</div>
        </div>
        <div className="bg-orange-50 rounded-lg p-4 text-center">
          <div className="text-3xl font-bold text-orange-600">
            {filteredPeople.length}
          </div>
          <div className="text-sm text-gray-600">Showing</div>
        </div>
      </div>

      {/* People Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {filteredPeople.map((person) => (
          <Link
            key={person.id}
            href={`/wiki/people/${person.id}`}
            className="group bg-white rounded-xl border-2 border-gray-200 hover:border-purple-500 overflow-hidden transition-all hover:shadow-lg"
          >
            {/* Profile Image */}
            <div className="h-48 bg-gradient-to-br from-purple-100 to-blue-100 relative">
              {person.profile_image_url ? (
                <img
                  src={person.profile_image_url}
                  alt={person.preferred_name || person.full_name}
                  className="w-full h-full object-cover"
                />
              ) : (
                <div className="h-full flex items-center justify-center">
                  <div className="h-24 w-24 rounded-full bg-gradient-to-br from-purple-500 to-blue-500 flex items-center justify-center text-white font-bold text-4xl shadow-xl">
                    {(person.preferred_name || person.full_name)
                      .split(' ')
                      .map((n) => n[0])
                      .join('')
                      .slice(0, 2)
                      .toUpperCase()}
                  </div>
                </div>
              )}
            </div>

            {/* Content */}
            <div className="p-6">
              <h3 className="text-xl font-bold text-gray-900 group-hover:text-purple-600 transition-colors mb-1">
                {person.preferred_name || person.full_name}
              </h3>

              {person.preferred_name &&
                person.preferred_name !== person.full_name && (
                  <p className="text-sm text-gray-500 mb-3">{person.full_name}</p>
                )}

              {person.bio && (
                <p className="text-gray-600 text-sm mb-4 line-clamp-2">{person.bio}</p>
              )}

              <div className="flex items-center justify-between pt-4 border-t border-gray-200">
                <div className="flex items-center text-purple-600">
                  <BookOpen className="h-5 w-5 mr-2" />
                  <span className="font-bold text-lg">{person.story_count}</span>
                  <span className="text-sm ml-1 text-gray-600">
                    {person.story_count === 1 ? 'story' : 'stories'}
                  </span>
                </div>
              </div>
            </div>
          </Link>
        ))}
      </div>

      {/* No results */}
      {filteredPeople.length === 0 && (
        <div className="text-center py-12 bg-white rounded-xl border border-gray-200">
          <Users className="h-16 w-16 text-gray-400 mx-auto mb-4" />
          <h3 className="text-xl font-semibold text-gray-900 mb-2">
            No storytellers found
          </h3>
          <p className="text-gray-600">Try adjusting your search or filter</p>
        </div>
      )}
    </div>
  );
}
