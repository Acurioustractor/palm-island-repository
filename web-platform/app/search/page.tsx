'use client';

import React, { useState, useEffect } from 'react';
import { createClient } from '@/lib/supabase/client';
import Link from 'next/link';
import { Search, BookOpen, Users, Loader, X } from 'lucide-react';

interface SearchResult {
  id: string;
  type: 'story' | 'storyteller';
  title: string;
  content: string;
  author?: string;
  author_id?: string;
  image_url?: string;
  relevance?: number;
}

export default function SearchPage() {
  const [query, setQuery] = useState('');
  const [results, setResults] = useState<SearchResult[]>([]);
  const [loading, setLoading] = useState(false);
  const [searchType, setSearchType] = useState<'all' | 'stories' | 'storytellers'>('all');

  // Debounced search
  useEffect(() => {
    if (!query || query.length < 2) {
      setResults([]);
      return;
    }

    const timeoutId = setTimeout(() => {
      performSearch(query);
    }, 300); // 300ms debounce

    return () => clearTimeout(timeoutId);
  }, [query, searchType]);

  async function performSearch(searchQuery: string) {
    setLoading(true);
    const supabase = createClient();

    try {
      let allResults: SearchResult[] = [];

      // Search stories (if not filtering to storytellers only)
      if (searchType === 'all' || searchType === 'stories') {
        const { data: stories, error: storiesError } = await supabase
          .from('stories')
          .select(`
            id,
            title,
            content,
            storyteller:storyteller_id (
              id,
              full_name,
              profile_image_url
            )
          `)
          .or(`title.ilike.%${searchQuery}%,content.ilike.%${searchQuery}%`)
          .eq('status', 'published')
          .limit(20);

        if (!storiesError && stories) {
          // Transform storyteller from array to object
          const transformedStories = stories.map((story: any) => ({
            ...story,
            storyteller: Array.isArray(story.storyteller) && story.storyteller.length > 0
              ? story.storyteller[0]
              : story.storyteller
          }));

          const storyResults: SearchResult[] = transformedStories.map((story: any) => ({
            id: story.id,
            type: 'story' as const,
            title: story.title || 'Untitled Story',
            content: story.content?.substring(0, 200) || '',
            author: story.storyteller?.full_name,
            author_id: story.storyteller?.id,
            image_url: story.storyteller?.profile_image_url,
          }));
          allResults = [...allResults, ...storyResults];
        }
      }

      // Search storytellers (if not filtering to stories only)
      if (searchType === 'all' || searchType === 'storytellers') {
        const { data: storytellers, error: storytellersError } = await supabase
          .from('profiles')
          .select('id, full_name, preferred_name, bio, profile_image_url')
          .or(`full_name.ilike.%${searchQuery}%,preferred_name.ilike.%${searchQuery}%,bio.ilike.%${searchQuery}%`)
          .limit(20);

        if (!storytellersError && storytellers) {
          const storytellerResults: SearchResult[] = storytellers.map((profile) => ({
            id: profile.id,
            type: 'storyteller' as const,
            title: profile.preferred_name || profile.full_name,
            content: profile.bio?.substring(0, 200) || '',
            image_url: profile.profile_image_url,
          }));
          allResults = [...allResults, ...storytellerResults];
        }
      }

      setResults(allResults);
    } catch (error) {
      console.error('Search error:', error);
    } finally {
      setLoading(false);
    }
  }

  function highlightText(text: string, query: string) {
    if (!query) return text;

    const regex = new RegExp(`(${query})`, 'gi');
    const parts = text.split(regex);

    return parts.map((part, i) =>
      regex.test(part) ? (
        <mark key={i} className="bg-yellow-200 text-ocean-deep px-1 rounded">
          {part}
        </mark>
      ) : (
        part
      )
    );
  }

  return (
    
      <div className="min-h-screen">
        {/* Hero Section */}
        <div className="bg-gradient-to-r from-ocean-deep to-ocean-medium text-white py-16">
        <div className="container mx-auto px-4">
          <div className="max-w-4xl mx-auto">
            <h1 className="text-5xl font-bold mb-4 text-center">
              Search Stories & Storytellers
            </h1>
            <p className="text-xl text-center text-purple-100 mb-8">
              Find stories, people, and experiences from the Palm Island community
            </p>

            {/* Search Bar */}
            <div className="relative">
              <Search className="absolute left-4 top-4 h-6 w-6 text-gray-400" />
              <input
                type="text"
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                placeholder="Search for stories, people, topics..."
                className="w-full pl-14 pr-14 py-4 rounded-xl text-lg text-ocean-deep focus:ring-4 focus:ring-purple-300 outline-none shadow-2xl"
                autoFocus
              />
              {query && (
                <button
                  onClick={() => {
                    setQuery('');
                    setResults([]);
                  }}
                  className="absolute right-4 top-4 text-gray-400 hover:text-earth-medium"
                >
                  <X className="h-6 w-6" />
                </button>
              )}
            </div>

            {/* Filter Tabs */}
            <div className="flex gap-4 mt-6 justify-center">
              <button
                onClick={() => setSearchType('all')}
                className={`px-6 py-2 rounded-lg font-medium transition-all ${
                  searchType === 'all'
                    ? 'bg-white text-coral-warm shadow-lg'
                    : 'bg-purple-500/50 text-white hover:bg-purple-500'
                }`}
              >
                All Results
              </button>
              <button
                onClick={() => setSearchType('stories')}
                className={`px-6 py-2 rounded-lg font-medium transition-all flex items-center ${
                  searchType === 'stories'
                    ? 'bg-white text-coral-warm shadow-lg'
                    : 'bg-purple-500/50 text-white hover:bg-purple-500'
                }`}
              >
                <BookOpen className="w-4 h-4 mr-2" />
                Stories Only
              </button>
              <button
                onClick={() => setSearchType('storytellers')}
                className={`px-6 py-2 rounded-lg font-medium transition-all flex items-center ${
                  searchType === 'storytellers'
                    ? 'bg-white text-coral-warm shadow-lg'
                    : 'bg-purple-500/50 text-white hover:bg-purple-500'
                }`}
              >
                <Users className="w-4 h-4 mr-2" />
                People Only
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Results */}
      <div className="container mx-auto px-4 py-12">
        <div className="max-w-4xl mx-auto">
          {loading ? (
            <div className="text-center py-12">
              <Loader className="w-12 h-12 mx-auto animate-spin text-coral-warm mb-4" />
              <p className="text-earth-medium text-lg">Searching...</p>
            </div>
          ) : query.length < 2 ? (
            <div className="text-center py-12">
              <Search className="w-16 h-16 mx-auto text-gray-300 mb-4" />
              <p className="text-earth-medium text-lg">
                Enter at least 2 characters to search
              </p>
              <p className="text-gray-500 mt-2">
                Try searching for names, topics, or keywords
              </p>
            </div>
          ) : results.length === 0 ? (
            <div className="text-center py-12">
              <div className="bg-white rounded-xl shadow-lg p-12">
                <p className="text-earth-dark text-xl mb-2">
                  No results found for "<strong>{query}</strong>"
                </p>
                <p className="text-gray-500">
                  Try different keywords or search terms
                </p>
              </div>
            </div>
          ) : (
            <>
              <div className="mb-6">
                <p className="text-earth-dark text-lg">
                  Found <strong>{results.length}</strong> result{results.length !== 1 ? 's' : ''} for "
                  <strong>{query}</strong>"
                </p>
              </div>

              <div className="space-y-4">
                {results.map((result) => (
                  <Link
                    key={`${result.type}-${result.id}`}
                    href={
                      result.type === 'story'
                        ? `/stories/${result.id}`
                        : `/storytellers/${result.id}`
                    }
                    className="block bg-white rounded-xl shadow-lg p-6 hover:shadow-2xl transition-all transform hover:-translate-y-1"
                  >
                    <div className="flex gap-4">
                      {/* Icon or Image */}
                      <div className="flex-shrink-0">
                        {result.image_url ? (
                          <img
                            src={result.image_url}
                            alt={result.title}
                            className="w-16 h-16 rounded-full object-cover"
                          />
                        ) : (
                          <div className={`w-16 h-16 rounded-full flex items-center justify-center ${
                            result.type === 'story'
                              ? 'bg-purple-100'
                              : 'bg-blue-100'
                          }`}>
                            {result.type === 'story' ? (
                              <BookOpen className="w-8 h-8 text-coral-warm" />
                            ) : (
                              <Users className="w-8 h-8 text-ocean-medium" />
                            )}
                          </div>
                        )}
                      </div>

                      {/* Content */}
                      <div className="flex-1">
                        <div className="flex items-center gap-2 mb-2">
                          <span className={`px-2 py-1 rounded text-xs font-medium ${
                            result.type === 'story'
                              ? 'bg-purple-100 text-purple-700'
                              : 'bg-blue-100 text-blue-700'
                          }`}>
                            {result.type === 'story' ? 'Story' : 'Storyteller'}
                          </span>
                        </div>

                        <h3 className="text-xl font-bold text-ocean-deep mb-2">
                          {highlightText(result.title, query)}
                        </h3>

                        {result.author && (
                          <p className="text-sm text-earth-medium mb-2">
                            by {result.author}
                          </p>
                        )}

                        <p className="text-earth-dark line-clamp-2">
                          {highlightText(result.content, query)}
                        </p>
                      </div>

                      {/* Arrow */}
                      <div className="flex-shrink-0 self-center">
                        <div className="w-8 h-8 rounded-full bg-purple-100 flex items-center justify-center group-hover:bg-purple-200">
                          <span className="text-coral-warm font-bold">→</span>
                        </div>
                      </div>
                    </div>
                  </Link>
                ))}
              </div>
            </>
          )}
        </div>
      </div>

      {/* Help Section */}
      {!query && (
        <div className="container mx-auto px-4 pb-16">
          <div className="max-w-4xl mx-auto">
            <div className="bg-white rounded-xl shadow-lg p-8">
              <h2 className="text-2xl font-bold text-ocean-deep mb-4">
                Search Tips
              </h2>
              <ul className="space-y-2 text-earth-dark">
                <li>• Search by name to find specific storytellers</li>
                <li>• Use keywords to find stories about topics that interest you</li>
                <li>• Try searching for "cyclone", "family", "culture", etc.</li>
                <li>• Filter results to show only stories or only people</li>
                <li>• Search works across story titles, content, names, and biographies</li>
              </ul>
            </div>
          </div>
        </div>
      )}
      </div>
    
  );
}
