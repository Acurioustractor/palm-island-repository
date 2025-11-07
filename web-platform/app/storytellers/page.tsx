'use client';

import React, { useState, useEffect } from 'react';
import { createClient } from '@/lib/supabase/client';
import Link from 'next/link';
import { User, BookOpen, Calendar, MapPin, Search, ChevronLeft, ChevronRight } from 'lucide-react';

interface Storyteller {
  id: string;
  full_name: string;
  preferred_name: string;
  profile_image_url?: string;
  bio?: string;
  location?: string;
  traditional_country?: string;
  language_group?: string;
  date_of_birth?: string;
  storyteller_type?: string;
  is_elder?: boolean;
  is_cultural_advisor?: boolean;
  is_service_provider?: boolean;
  created_at: string;
  story_count?: number;
}

export default function StorytellerGalleryPage() {
  const [storytellers, setStorytellers] = useState<Storyteller[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [typeFilter, setTypeFilter] = useState<string>('all');
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 12; // 12 storytellers per page (fits nicely in 3-column grid)

  // Get PICC organization ID from environment variable
  const PICC_ORG_ID = process.env.NEXT_PUBLIC_PICC_ORGANIZATION_ID || '3c2011b9-f80d-4289-b300-0cd383cff479';

  useEffect(() => {
    async function fetchStorytellers() {
      try {
        const supabase = createClient();

        // Fetch all PICC stories with their storytellers
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
              traditional_country,
              language_group,
              date_of_birth,
              storyteller_type,
              is_elder,
              is_cultural_advisor,
              is_service_provider,
              created_at
            )
          `)
          .eq('organization_id', PICC_ORG_ID)
          .eq('is_public', true)
          .not('storyteller_id', 'is', null);

        if (error) throw error;

        // Extract unique storytellers and count their stories
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

        // Convert to array and sort by name
        const uniqueStorytellers = Array.from(storytellerMap.values()).sort((a, b) =>
          (a.preferred_name || a.full_name).localeCompare(b.preferred_name || b.full_name)
        );

        console.log('✅ Successfully fetched storytellers:', uniqueStorytellers.length, 'storytellers');
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

    const matchesType = typeFilter === 'all' ||
      (typeFilter === 'elder' && storyteller.is_elder) ||
      (typeFilter === 'cultural_advisor' && storyteller.is_cultural_advisor) ||
      (typeFilter === 'service_provider' && storyteller.is_service_provider) ||
      (typeFilter === storyteller.storyteller_type);

    return matchesSearch && matchesType;
  });

  // Pagination calculations
  const totalPages = Math.ceil(filteredStorytellers.length / itemsPerPage);
  const startIndex = (currentPage - 1) * itemsPerPage;
  const endIndex = startIndex + itemsPerPage;
  const paginatedStorytellers = filteredStorytellers.slice(startIndex, endIndex);

  // Reset to page 1 when filters change
  useEffect(() => {
    setCurrentPage(1);
  }, [searchQuery, typeFilter]);

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 to-teal-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-16 w-16 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-xl text-gray-700">Loading storytellers...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-teal-50">
      {/* Hero Header */}
      <div className="bg-gradient-to-r from-palm-800 to-palm-700 text-white py-16">
        <div className="container mx-auto px-4">
          <div className="max-w-4xl mx-auto text-center">
            <h1 className="text-5xl md:text-6xl font-bold mb-4">Community Storytellers</h1>
            <p className="text-xl md:text-2xl mb-6">
              The voices of Palm Island—sharing knowledge, experience, and vision.
            </p>
            <p className="text-lg text-blue-100 italic">
              Manbarra & Bwgcolman Country • Palm Island
            </p>

            <div className="mt-8 flex justify-center gap-4">
              <Link
                href="/stories"
                className="bg-white text-palm-900 px-8 py-4 rounded-lg font-bold text-lg hover:bg-palm-50 transition-all transform hover:scale-105 shadow-xl"
              >
                View Stories
              </Link>
              <Link
                href="/"
                className="bg-palm-900 text-white px-8 py-4 rounded-lg font-bold text-lg hover:bg-palm-800 transition-all"
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
              <div className="text-3xl font-bold text-purple-700">{storytellers.length}</div>
              <div className="text-sm text-gray-600">Active Storytellers</div>
            </div>
            <div className="text-center">
              <div className="text-3xl font-bold text-blue-600">
                {storytellers.reduce((sum, s) => sum + (s.story_count || 0), 0)}
              </div>
              <div className="text-sm text-gray-600">Total Stories</div>
            </div>
            <div className="text-center">
              <div className="text-3xl font-bold text-green-600">
                {storytellers.filter(s => s.profile_image_url).length}
              </div>
              <div className="text-sm text-gray-600">With Photos</div>
            </div>
            <div className="text-center">
              <div className="text-3xl font-bold text-orange-600">100%</div>
              <div className="text-sm text-gray-600">Community Owned</div>
            </div>
          </div>
        </div>
      </div>

      {/* Search and Filter */}
      <div className="container mx-auto px-4 py-8">
        <div className="max-w-6xl mx-auto mb-8">
          <div className="bg-white rounded-xl shadow-lg p-6">
            <div className="flex flex-col md:flex-row gap-4">
              <div className="flex-1 relative">
                <Search className="absolute left-3 top-3 h-5 w-5 text-gray-400" />
                <input
                  type="text"
                  placeholder="Search storytellers by name or location..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  aria-label="Search storytellers"
                  className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-palm-500 focus:border-transparent"
                />
              </div>
              <div className="md:w-64">
                <select
                  value={typeFilter}
                  onChange={(e) => setTypeFilter(e.target.value)}
                  aria-label="Filter by storyteller type"
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-palm-500 focus:border-transparent bg-white"
                >
                  <option value="all">All Storytellers</option>
                  <option value="elder">Elders</option>
                  <option value="cultural_advisor">Cultural Advisors</option>
                  <option value="youth">Youth</option>
                  <option value="service_provider">Service Providers</option>
                  <option value="community_member">Community Members</option>
                </select>
              </div>
            </div>
            <div className="mt-4 flex items-center justify-between text-sm text-gray-600">
              <div>
                Showing {filteredStorytellers.length === 0 ? 0 : startIndex + 1}-{Math.min(endIndex, filteredStorytellers.length)} of {filteredStorytellers.length} storytellers
                {(searchQuery || typeFilter !== 'all') && ` (filtered from ${storytellers.length} total)`}
              </div>
              {totalPages > 1 && (
                <div className="text-gray-500">
                  Page {currentPage} of {totalPages}
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Storytellers Grid */}
        <div className="max-w-6xl mx-auto">
          {filteredStorytellers.length === 0 ? (
            <div className="text-center py-12 bg-white rounded-xl shadow-lg">
              <p className="text-xl text-gray-600">No storytellers found. Try adjusting your search.</p>
            </div>
          ) : (
            <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
              {paginatedStorytellers.map((storyteller) => (
                <div
                  key={storyteller.id}
                  className="group bg-white rounded-xl shadow-lg overflow-hidden hover:shadow-2xl transition-all transform hover:scale-105 border-2 border-palm-200 hover:border-palm-400"
                >
                  {/* Profile Photo or Avatar */}
                  <div className="h-64 relative overflow-hidden bg-gradient-to-br from-palm-100 to-palm-50">
                    {storyteller.profile_image_url ? (
                      <img
                        src={storyteller.profile_image_url}
                        alt={storyteller.preferred_name || storyteller.full_name}
                        className="w-full h-full object-cover"
                      />
                    ) : (
                      <div className="h-full flex items-center justify-center">
                        <div className="h-32 w-32 rounded-full bg-gradient-to-br from-palm-500 to-palm-700 flex items-center justify-center text-white font-bold text-5xl shadow-2xl">
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
                    <div className="flex flex-wrap gap-2 mb-2">
                      {storyteller.is_elder && (
                        <span className="px-2 py-1 bg-palm-800 text-white rounded-full text-xs font-medium">
                          Elder
                        </span>
                      )}
                      {storyteller.is_cultural_advisor && (
                        <span className="px-2 py-1 bg-palm-700 text-white rounded-full text-xs font-medium">
                          Cultural Advisor
                        </span>
                      )}
                      {storyteller.is_service_provider && (
                        <span className="px-2 py-1 bg-blue-600 text-white rounded-full text-xs font-medium">
                          Service Provider
                        </span>
                      )}
                    </div>

                    <h3 className="text-2xl font-bold text-gray-900 mb-1">
                      {storyteller.preferred_name || storyteller.full_name}
                    </h3>

                    {storyteller.preferred_name && storyteller.preferred_name !== storyteller.full_name && (
                      <p className="text-sm text-gray-500 mb-3">{storyteller.full_name}</p>
                    )}

                    {storyteller.location && (
                      <div className="flex items-center text-sm text-gray-600 mb-2">
                        <MapPin className="h-4 w-4 mr-1" />
                        <span>{storyteller.location}</span>
                      </div>
                    )}

                    {(storyteller.traditional_country || storyteller.language_group) && (
                      <div className="mb-3 p-2 bg-palm-50 rounded-lg border border-palm-200">
                        {storyteller.traditional_country && (
                          <div className="text-xs text-palm-800 mb-1">
                            <span className="font-medium">Country:</span> {storyteller.traditional_country}
                          </div>
                        )}
                        {storyteller.language_group && (
                          <div className="text-xs text-palm-800">
                            <span className="font-medium">Language:</span> {storyteller.language_group}
                          </div>
                        )}
                      </div>
                    )}

                    {storyteller.bio && (
                      <p className="text-gray-600 text-sm mb-4 line-clamp-3">
                        {storyteller.bio}
                      </p>
                    )}

                    <div className="flex items-center justify-between pt-4 border-t border-gray-200">
                      <div className="flex items-center text-purple-700">
                        <BookOpen className="h-5 w-5 mr-2" />
                        <span className="font-bold text-lg">{storyteller.story_count}</span>
                        <span className="text-sm ml-1 text-gray-600">
                          {storyteller.story_count === 1 ? 'story' : 'stories'}
                        </span>
                      </div>
                    </div>

                    <div className="mt-4">
                      <Link
                        href={`/storytellers/${storyteller.id}`}
                        className="block w-full text-center bg-palm-600 hover:bg-palm-700 text-white font-medium py-2 px-4 rounded-lg transition-all"
                      >
                        View Profile →
                      </Link>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}

          {/* Pagination Controls */}
          {totalPages > 1 && (
            <div className="mt-8 flex items-center justify-center gap-2">
              <button
                onClick={() => setCurrentPage(prev => Math.max(1, prev - 1))}
                disabled={currentPage === 1}
                className="flex items-center gap-2 px-4 py-2 border-2 border-palm-300 text-palm-700 rounded-lg hover:bg-palm-50 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
              >
                <ChevronLeft className="h-5 w-5" />
                Previous
              </button>

              <div className="flex gap-2">
                {Array.from({ length: totalPages }, (_, i) => i + 1).map(page => {
                  // Show first page, last page, current page, and pages around current
                  const showPage = page === 1 ||
                                  page === totalPages ||
                                  Math.abs(page - currentPage) <= 1;

                  const showEllipsis = (page === 2 && currentPage > 3) ||
                                      (page === totalPages - 1 && currentPage < totalPages - 2);

                  if (showEllipsis) {
                    return <span key={page} className="px-2 text-gray-400">...</span>;
                  }

                  if (!showPage) return null;

                  return (
                    <button
                      key={page}
                      onClick={() => setCurrentPage(page)}
                      className={`px-4 py-2 rounded-lg font-medium transition-colors ${
                        currentPage === page
                          ? 'bg-palm-600 text-white'
                          : 'border-2 border-palm-300 text-palm-700 hover:bg-palm-50'
                      }`}
                    >
                      {page}
                    </button>
                  );
                })}
              </div>

              <button
                onClick={() => setCurrentPage(prev => Math.min(totalPages, prev + 1))}
                disabled={currentPage === totalPages}
                className="flex items-center gap-2 px-4 py-2 border-2 border-palm-300 text-palm-700 rounded-lg hover:bg-palm-50 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
              >
                Next
                <ChevronRight className="h-5 w-5" />
              </button>
            </div>
          )}
        </div>

        {/* CTA Section */}
        <div className="max-w-4xl mx-auto mt-12 bg-gradient-to-r from-palm-600 to-palm-700 text-white rounded-xl shadow-2xl p-8 text-center">
          <h2 className="text-3xl font-bold mb-4">Become a Storyteller</h2>
          <p className="text-lg mb-6">
            Every Palm Islander has a story worth sharing. Join our community of storytellers
            and help preserve our collective knowledge and experience.
          </p>
          <Link
            href="/stories/submit"
            className="inline-block bg-white text-palm-900 px-8 py-4 rounded-lg font-bold text-lg hover:bg-palm-50 transition-all transform hover:scale-105 shadow-xl"
          >
            Share Your Story Now
          </Link>
        </div>
      </div>

      {/* Footer */}
      <footer className="bg-gray-800 text-white py-8 mt-12">
        <div className="container mx-auto px-4 text-center">
          <p className="text-lg font-medium mb-2">Palm Island Community Storytellers</p>
          <p className="text-sm text-gray-300 italic">
            Every voice matters. Every story strengthens our community.
          </p>
          <p className="text-xs text-gray-400 mt-4">Manbarra & Bwgcolman Country</p>
        </div>
      </footer>
    </div>
  );
}
