'use client';

import React, { useState, useEffect } from 'react';
import { createClient } from '@/lib/supabase/client';
import Link from 'next/link';
import { Search, Filter, Calendar, User, Tag, BookOpen } from 'lucide-react';
import Breadcrumbs from '@/components/wiki/Breadcrumbs';

export default function SearchPage() {
  const [query, setQuery] = useState('');
  const [results, setResults] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);
  const [heroImage, setHeroImage] = useState<string | null>(null);
  const [filters, setFilters] = useState({
    category: 'all',
    dateFrom: '',
    dateTo: '',
  });

  const handleSearch = async () => {
    if (!query.trim()) return;

    setLoading(true);
    const supabase = createClient();

    try {
      let queryBuilder = supabase
        .from('stories')
        .select(`
          id,
          title,
          summary,
          content,
          story_category,
          created_at,
          storyteller:storyteller_id (
            full_name,
            preferred_name
          )
        `)
        .eq('is_public', true)
        .or(`title.ilike.%${query}%,summary.ilike.%${query}%,content.ilike.%${query}%`);

      if (filters.category !== 'all') {
        queryBuilder = queryBuilder.eq('story_category', filters.category);
      }

      if (filters.dateFrom) {
        queryBuilder = queryBuilder.gte('created_at', filters.dateFrom);
      }

      if (filters.dateTo) {
        queryBuilder = queryBuilder.lte('created_at', filters.dateTo);
      }

      const { data, error } = await queryBuilder.limit(50);

      if (error) throw error;

      setResults(data || []);
    } catch (error) {
      console.error('Search error:', error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    const delaySearch = setTimeout(() => {
      if (query) {
        handleSearch();
      }
    }, 500);

    return () => clearTimeout(delaySearch);
  }, [query, filters]);

  useEffect(() => {
    async function fetchHeroImage() {
      try {
        const supabase = createClient();
        const { data } = await supabase
          .from('media_files')
          .select('public_url')
          .eq('page_context', 'search')
          .eq('page_section', 'hero')
          .eq('is_public', true)
          .eq('is_featured', true)
          .limit(1)
          .single();
        if (data?.public_url) {
          setHeroImage(data.public_url);
        }
      } catch (error) {
        // Hero image is optional, fail silently
      }
    }
    fetchHeroImage();
  }, []);

  const breadcrumbs = [
    { label: 'Wiki', href: '/wiki', icon: BookOpen },
    { label: 'Search', href: '/search' },
  ];

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="container mx-auto px-4 py-8 max-w-6xl">
        <Breadcrumbs items={breadcrumbs} className="mb-6" />

        {/* Header */}
        <div
          className="mb-8 rounded-2xl p-8"
          style={heroImage ? {
            backgroundImage: `linear-gradient(rgba(249, 250, 251, 0.92), rgba(249, 250, 251, 0.95)), url(${heroImage})`,
            backgroundSize: 'cover',
            backgroundPosition: 'center'
          } : undefined}
        >
          <h1 className="text-4xl font-bold text-gray-900 mb-4 flex items-center gap-3">
            <Search className="h-10 w-10 text-gray-900" />
            Search Knowledge Base
          </h1>
          <p className="text-xl text-gray-600">
            Find stories, people, and information across the community repository
          </p>
        </div>

        {/* Search Bar */}
        <div className="bg-white rounded-2xl border border-gray-100 p-6 mb-8">
          <div className="relative mb-4">
            <Search className="absolute left-6 top-1/2 -translate-y-1/2 h-6 w-6 text-gray-400" />
            <input
              type="text"
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder="Search for stories, topics, people..."
              className="w-full pl-14 pr-6 py-4 text-lg border-2 border-gray-200 rounded-full focus:border-gray-400 focus:outline-none transition-colors"
              autoFocus
            />
          </div>

          {/* Filters */}
          <div className="flex flex-wrap items-center gap-4 pt-4 border-t border-gray-100">
            <div className="flex items-center gap-2">
              <Filter className="h-5 w-5 text-gray-600" />
              <span className="text-sm font-medium text-gray-700">Filters:</span>
            </div>

            <select
              value={filters.category}
              onChange={(e) => setFilters({ ...filters, category: e.target.value })}
              className="px-3 py-2 border border-gray-200 rounded-full text-sm focus:border-gray-400 focus:outline-none transition-colors"
            >
              <option value="all">All Categories</option>
              <option value="health">Health</option>
              <option value="culture">Culture</option>
              <option value="youth">Youth</option>
              <option value="community">Community</option>
              <option value="elder_care">Elder Care</option>
            </select>

            <div className="flex items-center gap-2">
              <span className="text-sm text-gray-600">From:</span>
              <input
                type="date"
                value={filters.dateFrom}
                onChange={(e) => setFilters({ ...filters, dateFrom: e.target.value })}
                className="px-3 py-2 border border-gray-200 rounded-full text-sm focus:border-gray-400 focus:outline-none transition-colors"
              />
            </div>

            <div className="flex items-center gap-2">
              <span className="text-sm text-gray-600">To:</span>
              <input
                type="date"
                value={filters.dateTo}
                onChange={(e) => setFilters({ ...filters, dateTo: e.target.value })}
                className="px-3 py-2 border border-gray-200 rounded-full text-sm focus:border-gray-400 focus:outline-none transition-colors"
              />
            </div>

            {(filters.category !== 'all' || filters.dateFrom || filters.dateTo) && (
              <button
                onClick={() => setFilters({ category: 'all', dateFrom: '', dateTo: '' })}
                className="text-sm text-gray-600 hover:text-gray-900 font-medium transition-colors"
              >
                Clear filters
              </button>
            )}
          </div>
        </div>

        {/* Results */}
        {loading ? (
          <div className="text-center py-12">
            <div className="animate-spin rounded-full h-12 w-12 border-b-4 border-gray-900 mx-auto mb-4"></div>
            <p className="text-gray-600">Searching...</p>
          </div>
        ) : query && results.length > 0 ? (
          <div>
            <div className="mb-4 text-sm text-gray-600">
              Found <span className="font-semibold text-gray-900">{results.length}</span> results for "{query}"
            </div>

            <div className="space-y-4">
              {results.map((result) => (
                <Link
                  key={result.id}
                  href={`/stories/${result.id}`}
                  className="block bg-white rounded-2xl border border-gray-200 p-6 hover:border-gray-900 transition-all"
                >
                  <h3 className="text-xl font-bold text-gray-900 mb-2">
                    {result.title}
                  </h3>

                  {result.summary && (
                    <p className="text-gray-600 mb-4 line-clamp-2">{result.summary}</p>
                  )}

                  <div className="flex flex-wrap items-center gap-4 text-sm text-gray-600">
                    {result.storyteller && (
                      <div className="flex items-center gap-1">
                        <User className="h-4 w-4" />
                        <span>{result.storyteller.preferred_name || result.storyteller.full_name}</span>
                      </div>
                    )}
                    <div className="flex items-center gap-1">
                      <Calendar className="h-4 w-4" />
                      <span>{new Date(result.created_at).toLocaleDateString('en-AU')}</span>
                    </div>
                    <div className="flex items-center gap-1">
                      <Tag className="h-4 w-4" />
                      <span className="capitalize">{result.story_category.replace('_', ' ')}</span>
                    </div>
                  </div>
                </Link>
              ))}
            </div>
          </div>
        ) : query ? (
          <div className="text-center py-12 bg-white rounded-2xl border border-gray-100">
            <Search className="h-16 w-16 text-gray-400 mx-auto mb-4" />
            <h3 className="text-xl font-semibold text-gray-900 mb-2">No results found</h3>
            <p className="text-gray-600 mb-4">Try adjusting your search or filters</p>
            <button
              onClick={() => {
                setQuery('');
                setResults([]);
              }}
              className="text-gray-600 hover:text-gray-900 font-medium transition-colors"
            >
              Clear search
            </button>
          </div>
        ) : (
          <div className="text-center py-12 bg-white rounded-2xl border border-gray-100">
            <Search className="h-16 w-16 text-gray-400 mx-auto mb-4" />
            <h3 className="text-xl font-semibold text-gray-900 mb-2">Start searching</h3>
            <p className="text-gray-600">Enter keywords to search across all stories and content</p>
          </div>
        )}
      </div>
    </div>
  );
}
