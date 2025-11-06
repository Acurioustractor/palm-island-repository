'use client';

import React, { useState, useEffect } from 'react';
import { createClient } from '@/lib/supabase/client';
import Link from 'next/link';
import { User, BookOpen, Calendar, MapPin, Search } from 'lucide-react';
import AppLayout from '@/components/AppLayout';

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

        // Fetch all storytellers directly from profiles
        const { data: profiles, error: profilesError } = await supabase
          .from('profiles')
          .select('*')
          .order('full_name');

        if (profilesError) throw profilesError;

        // For each storyteller, count their stories
        const storytellersWithCounts = await Promise.all(
          (profiles || []).map(async (profile) => {
            const { count } = await supabase
              .from('stories')
              .select('*', { count: 'exact', head: true })
              .eq('storyteller_id', profile.id);

            return {
              id: profile.id,
              full_name: profile.full_name,
              preferred_name: profile.preferred_name,
              profile_image_url: profile.profile_image_url,
              bio: profile.bio,
              location: profile.location || 'Palm Island',
              date_of_birth: profile.date_of_birth,
              created_at: profile.created_at,
              story_count: count || 0,
            };
          })
        );

        console.log('✅ Successfully fetched storytellers:', storytellersWithCounts.length, 'storytellers');
        setStorytellers(storytellersWithCounts);
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
      <AppLayout>
        <div className="min-h-screen flex items-center justify-center">
          <div className="text-center">
            <div className="animate-spin rounded-full h-16 w-16 border-b-2 border-coral-warm mx-auto mb-4"></div>
            <p className="text-xl text-earth-dark">Loading storytellers...</p>
          </div>
        </div>
      </AppLayout>
    );
  }

  return (
    <AppLayout>
      <div className="min-h-screen">
        {/* Hero Header */}
        <div className="bg-gradient-to-r from-ocean-deep to-ocean-medium text-white py-16 px-8">
          <div className="max-w-6xl mx-auto">
            <div className="max-w-4xl mx-auto text-center">
              <h1 className="text-5xl md:text-6xl font-bold mb-4">Community Storytellers</h1>
              <p className="text-xl md:text-2xl mb-6">
                The voices of Palm Island—sharing knowledge, experience, and vision.
              </p>
              <p className="text-lg text-white/70 italic">
                Manbarra & Bwgcolman Country • Palm Island
              </p>

              <div className="mt-8 flex justify-center gap-4">
                <Link
                  href="/stories"
                  className="btn-primary transform hover:scale-105 shadow-xl"
                >
                  View Stories
                </Link>
                <Link
                  href="/"
                  className="bg-ocean-light text-white px-8 py-4 rounded-lg font-bold text-lg hover:bg-ocean-medium transition-all"
                >
                  Back to Home
                </Link>
              </div>
            </div>
          </div>
        </div>

        {/* Stats Bar */}
        <div className="bg-white shadow-lg py-6">
          <div className="max-w-6xl mx-auto px-8">
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4 max-w-4xl mx-auto">
              <div className="text-center">
                <div className="text-3xl font-bold text-coral-warm">{storytellers.length}</div>
                <div className="text-sm text-earth-medium">Active Storytellers</div>
              </div>
              <div className="text-center">
                <div className="text-3xl font-bold text-ocean-medium">
                  {storytellers.reduce((sum, s) => sum + (s.story_count || 0), 0)}
                </div>
                <div className="text-sm text-earth-medium">Total Stories</div>
              </div>
              <div className="text-center">
                <div className="text-3xl font-bold text-success">
                  {storytellers.filter(s => s.profile_image_url).length}
                </div>
                <div className="text-sm text-earth-medium">With Photos</div>
              </div>
              <div className="text-center">
                <div className="text-3xl font-bold text-sunset-orange">100%</div>
                <div className="text-sm text-earth-medium">Community Owned</div>
              </div>
            </div>
          </div>
        </div>

        {/* Search */}
        <div className="max-w-6xl mx-auto px-8 py-8">
          <div className="mb-8">
            <div className="card-modern">
              <div className="flex flex-col md:flex-row gap-4">
                <div className="flex-1 relative">
                  <Search className="absolute left-3 top-3 h-5 w-5 text-earth-medium" />
                  <input
                    type="text"
                    placeholder="Search storytellers by name or location..."
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    className="input-field pl-10"
                  />
                </div>
              </div>
            </div>
          </div>

          {/* Storytellers Grid */}
          <div>
            {filteredStorytellers.length === 0 ? (
              <div className="text-center py-12 card-modern">
                <p className="text-xl text-earth-medium">No storytellers found. Try adjusting your search.</p>
              </div>
            ) : (
              <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
                {filteredStorytellers.map((storyteller) => (
                  <div
                    key={storyteller.id}
                    className="group bg-white rounded-xl shadow-lg overflow-hidden hover:shadow-2xl transition-all transform hover:scale-105 border-2 border-earth-light hover:border-coral-warm"
                  >
                    {/* Profile Photo or Avatar */}
                    <div className="h-64 relative overflow-hidden bg-gradient-to-br from-earth-bg to-ocean-light/10">
                      {storyteller.profile_image_url ? (
                        <img
                          src={storyteller.profile_image_url}
                          alt={storyteller.preferred_name || storyteller.full_name}
                          className="w-full h-full object-cover"
                        />
                      ) : (
                        <div className="h-full flex items-center justify-center">
                          <div className="h-32 w-32 rounded-full bg-gradient-to-br from-ocean-medium to-ocean-light flex items-center justify-center text-white font-bold text-5xl shadow-2xl">
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
                      <h3 className="text-2xl font-bold text-ocean-deep mb-1">
                        {storyteller.preferred_name || storyteller.full_name}
                      </h3>

                      {storyteller.preferred_name && storyteller.preferred_name !== storyteller.full_name && (
                        <p className="text-sm text-earth-medium mb-3">{storyteller.full_name}</p>
                      )}

                      {storyteller.location && (
                        <div className="flex items-center text-sm text-earth-dark mb-2">
                          <MapPin className="h-4 w-4 mr-1" />
                          <span>{storyteller.location}</span>
                        </div>
                      )}

                      {storyteller.bio && (
                        <p className="text-earth-medium text-sm mb-4 line-clamp-3">
                          {storyteller.bio}
                        </p>
                      )}

                      <div className="flex items-center justify-between pt-4 border-t border-earth-light">
                        <div className="flex items-center text-coral-warm">
                          <BookOpen className="h-5 w-5 mr-2" />
                          <span className="font-bold text-lg">{storyteller.story_count}</span>
                          <span className="text-sm ml-1 text-earth-medium">
                            {storyteller.story_count === 1 ? 'story' : 'stories'}
                          </span>
                        </div>
                      </div>

                      <div className="mt-4">
                        <Link
                          href={`/storytellers/${storyteller.id}`}
                          className="block w-full text-center btn-primary"
                        >
                          View Profile →
                        </Link>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* CTA Section */}
          <div className="max-w-4xl mx-auto mt-12 bg-gradient-to-r from-coral-warm to-sunset-orange text-white rounded-xl shadow-2xl p-8 text-center">
            <h2 className="text-3xl font-bold mb-4">Become a Storyteller</h2>
            <p className="text-lg mb-6">
              Every Palm Islander has a story worth sharing. Join our community of storytellers
              and help preserve our collective knowledge and experience.
            </p>
            <Link
              href="/stories/submit"
              className="inline-block bg-white text-ocean-deep px-8 py-4 rounded-lg font-bold text-lg hover:bg-earth-bg transition-all transform hover:scale-105 shadow-xl"
            >
              Share Your Story Now
            </Link>
          </div>
        </div>

        {/* Footer */}
        <footer className="bg-ocean-deep text-white py-8 mt-12">
          <div className="max-w-6xl mx-auto px-8 text-center">
            <p className="text-lg font-medium mb-2">Palm Island Community Storytellers</p>
            <p className="text-sm text-white/70 italic">
              Every voice matters. Every story strengthens our community.
            </p>
            <p className="text-xs text-white/50 mt-4">Manbarra & Bwgcolman Country</p>
          </div>
        </footer>
      </div>
    </AppLayout>
  );
}
