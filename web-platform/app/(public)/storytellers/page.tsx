'use client';

import React, { useState, useEffect } from 'react';
import { createClient } from '@/lib/supabase/client';
import Link from 'next/link';
import { User, BookOpen, MapPin, Search, UserPlus, ArrowRight } from 'lucide-react';

interface Storyteller {
  id: string;
  full_name: string;
  preferred_name: string;
  profile_image_url?: string;
  bio?: string;
  location?: string;
  date_of_birth?: string;
  created_at: string;
  story_count?: number;
}

export default function StorytellerGalleryPage() {
  const [storytellers, setStorytellers] = useState<Storyteller[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');

  useEffect(() => {
    async function fetchStorytellers() {
      try {
        const supabase = createClient();

        const { data: stories, error } = await supabase
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
              date_of_birth,
              created_at
            )
          `)
          .eq('organization_id', '3c2011b9-f80d-4289-b300-0cd383cff479')
          .eq('is_public', true)
          .not('storyteller_id', 'is', null);

        if (error) throw error;

        const storytellerMap = new Map<string, Storyteller>();

        stories?.forEach((story: any) => {
          if (story.storyteller && story.storyteller.id) {
            const existing = storytellerMap.get(story.storyteller.id);
            if (existing) {
              existing.story_count = (existing.story_count || 0) + 1;
            } else {
              storytellerMap.set(story.storyteller.id, {
                ...story.storyteller,
                story_count: 1,
              });
            }
          }
        });

        const uniqueStorytellers = Array.from(storytellerMap.values()).sort((a, b) =>
          (a.preferred_name || a.full_name).localeCompare(b.preferred_name || b.full_name)
        );

        setStorytellers(uniqueStorytellers);
        setLoading(false);
      } catch (error) {
        console.error('Error fetching storytellers:', error);
        setLoading(false);
      }
    }

    fetchStorytellers();
  }, []);

  const filteredStorytellers = storytellers.filter(storyteller => {
    const matchesSearch = !searchQuery ||
      storyteller.full_name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      storyteller.preferred_name?.toLowerCase().includes(searchQuery.toLowerCase()) ||
      storyteller.location?.toLowerCase().includes(searchQuery.toLowerCase());
    return matchesSearch;
  });

  if (loading) {
    return (
      <div className="min-h-screen bg-white flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-16 w-16 border-b-2 border-gray-900 mx-auto mb-4"></div>
          <p className="text-lg text-gray-500">Loading storytellers...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-white">
      {/* Editorial Hero */}
      <section className="editorial-section border-b border-gray-100">
        <div className="max-w-7xl mx-auto px-6 lg:px-8">
          <span className="text-xs font-semibold uppercase tracking-[0.15em] text-gray-400">
            Voices of Palm Island
          </span>
          <h1 className="text-4xl md:text-5xl lg:text-6xl font-extrabold text-gray-900 tracking-[-0.02em] leading-[1.1] mt-4 mb-6">
            Community Storytellers
          </h1>
          <p className="text-lg text-gray-500 max-w-2xl leading-relaxed mb-2">
            The voices of Palm Island — sharing knowledge, experience, and vision.
          </p>
          <p className="text-sm text-gray-400 italic">
            Manbarra &amp; Bwgcolman Country
          </p>
        </div>
      </section>

      {/* Stats Bar */}
      <section className="border-b border-gray-100 py-8">
        <div className="max-w-7xl mx-auto px-6 lg:px-8">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
            <div>
              <div className="text-3xl font-extrabold text-gray-900 tracking-[-0.02em]">{storytellers.length}</div>
              <div className="text-xs text-gray-400 uppercase tracking-[0.1em] font-medium mt-1">Active Storytellers</div>
            </div>
            <div>
              <div className="text-3xl font-extrabold text-gray-900 tracking-[-0.02em]">
                {storytellers.reduce((sum, s) => sum + (s.story_count || 0), 0)}
              </div>
              <div className="text-xs text-gray-400 uppercase tracking-[0.1em] font-medium mt-1">Total Stories</div>
            </div>
            <div>
              <div className="text-3xl font-extrabold text-gray-900 tracking-[-0.02em]">
                {storytellers.filter(s => s.profile_image_url).length}
              </div>
              <div className="text-xs text-gray-400 uppercase tracking-[0.1em] font-medium mt-1">With Photos</div>
            </div>
            <div>
              <div className="text-3xl font-extrabold text-gray-900 tracking-[-0.02em]">100%</div>
              <div className="text-xs text-gray-400 uppercase tracking-[0.1em] font-medium mt-1">Community Owned</div>
            </div>
          </div>
        </div>
      </section>

      {/* Search */}
      <section className="max-w-7xl mx-auto px-6 lg:px-8 py-10">
        <div className="flex flex-col md:flex-row gap-4">
          <div className="flex-1 relative">
            <Search className="absolute left-4 top-3.5 h-4 w-4 text-gray-400" />
            <input
              type="text"
              placeholder="Search storytellers by name or location..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-11 pr-4 py-3 border border-gray-200 rounded-xl text-sm focus:ring-2 focus:ring-gray-900 focus:border-gray-900 transition-all duration-300 ease-elegant"
            />
          </div>
          <Link
            href="/storytellers/add"
            className="flex items-center justify-center gap-2 bg-gray-900 hover:bg-gray-800 text-white px-6 py-3 rounded-full text-sm font-medium transition-all duration-300 ease-elegant hover:scale-[0.98] active:scale-95"
          >
            <UserPlus className="w-4 h-4" />
            Add Storyteller
          </Link>
        </div>
      </section>

      {/* Storytellers Grid */}
      <section className="max-w-7xl mx-auto px-6 lg:px-8 pb-20">
        {filteredStorytellers.length === 0 ? (
          <div className="text-center py-16 bg-gray-50 rounded-2xl">
            <p className="text-gray-500">No storytellers found. Try adjusting your search.</p>
          </div>
        ) : (
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
            {filteredStorytellers.map((storyteller) => (
              <Link
                key={storyteller.id}
                href={`/stories?storyteller=${storyteller.id}`}
                className="group bg-white rounded-2xl border border-gray-100 overflow-hidden hover:border-gray-300 hover:shadow-lg transition-all duration-500 ease-elegant"
              >
                {/* Profile Photo or Avatar */}
                <div className="h-64 relative overflow-hidden bg-gray-50">
                  {storyteller.profile_image_url ? (
                    <img
                      src={storyteller.profile_image_url}
                      alt={storyteller.preferred_name || storyteller.full_name}
                      className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-700 ease-elegant"
                    />
                  ) : (
                    <div className="h-full flex items-center justify-center">
                      <div className="h-28 w-28 rounded-full bg-gray-200 flex items-center justify-center text-gray-500 font-extrabold text-4xl">
                        {(storyteller.preferred_name || storyteller.full_name)
                          .split(' ')
                          .map(n => n[0])
                          .join('')
                          .slice(0, 2)
                          .toUpperCase()}
                      </div>
                    </div>
                  )}
                </div>

                <div className="p-6">
                  <h3 className="text-xl font-extrabold text-gray-900 tracking-[-0.02em] mb-1 group-hover:text-gray-700 transition-colors duration-300">
                    {storyteller.preferred_name || storyteller.full_name}
                  </h3>

                  {storyteller.preferred_name && storyteller.preferred_name !== storyteller.full_name && (
                    <p className="text-sm text-gray-400 mb-3">{storyteller.full_name}</p>
                  )}

                  {storyteller.location && (
                    <div className="flex items-center text-sm text-gray-500 mb-2">
                      <MapPin className="h-3.5 w-3.5 mr-1.5" />
                      <span>{storyteller.location}</span>
                    </div>
                  )}

                  {storyteller.bio && (
                    <p className="text-gray-500 text-sm mb-4 line-clamp-3 leading-relaxed">
                      {storyteller.bio}
                    </p>
                  )}

                  <div className="flex items-center justify-between pt-4 border-t border-gray-100">
                    <div className="flex items-center text-gray-900">
                      <BookOpen className="h-4 w-4 mr-2" />
                      <span className="font-bold">{storyteller.story_count}</span>
                      <span className="text-sm ml-1 text-gray-500">
                        {storyteller.story_count === 1 ? 'story' : 'stories'}
                      </span>
                    </div>
                    <span className="animated-underline text-sm font-medium text-gray-900 flex items-center gap-1">
                      View
                      <ArrowRight className="w-3.5 h-3.5 group-hover:translate-x-1 transition-transform duration-300 ease-elegant" />
                    </span>
                  </div>
                </div>
              </Link>
            ))}
          </div>
        )}
      </section>

      {/* CTA Section */}
      <section className="editorial-section bg-gray-900 text-white">
        <div className="max-w-3xl mx-auto px-6 lg:px-8 text-center">
          <span className="text-xs font-semibold uppercase tracking-[0.15em] text-white/50">
            Join Us
          </span>
          <h2 className="text-3xl md:text-4xl font-extrabold tracking-[-0.02em] leading-[1.1] mt-4 mb-6">
            Become a Storyteller
          </h2>
          <p className="text-lg text-white/60 mb-8 leading-relaxed">
            Every Palm Islander has a story worth sharing. Join our community of storytellers
            and help preserve our collective knowledge and experience.
          </p>
          <Link
            href="/stories/submit"
            className="inline-flex items-center gap-2 px-8 py-4 bg-white text-gray-900 rounded-full font-semibold hover:bg-gray-100 hover:scale-[0.98] active:scale-95 transition-all duration-300 ease-elegant"
          >
            Share Your Story Now
            <ArrowRight className="w-4 h-4" />
          </Link>
        </div>
      </section>
    </div>
  );
}
