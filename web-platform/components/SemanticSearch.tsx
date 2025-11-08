'use client';

import { useState } from 'react';
import Link from 'next/link';

interface SearchResult {
  id: string;
  score: number;
  title: string;
  content_preview: string;
  story_type: string;
  created_at: string;
}

export default function SemanticSearch() {
  const [query, setQuery] = useState('');
  const [results, setResults] = useState<SearchResult[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [searched, setSearched] = useState(false);

  const handleSearch = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!query.trim()) return;

    setLoading(true);
    setError(null);
    setSearched(true);

    try {
      const response = await fetch('/api/ai/search', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          query: query.trim(),
          limit: 10,
        }),
      });

      if (!response.ok) {
        throw new Error('Search failed');
      }

      const data = await response.json();
      setResults(data);

    } catch (err) {
      setError('Failed to search stories. Please try again.');
      console.error('Search error:', err);
    } finally {
      setLoading(false);
    }
  };

  const getRelevanceColor = (score: number) => {
    if (score >= 0.4) return 'text-green-600 bg-green-50';
    if (score >= 0.3) return 'text-palm-600 bg-palm-50';
    return 'text-gray-600 bg-gray-50';
  };

  const getRelevanceLabel = (score: number) => {
    if (score >= 0.4) return 'Highly Relevant';
    if (score >= 0.3) return 'Relevant';
    return 'Somewhat Relevant';
  };

  const formatStoryType = (type: string) => {
    return type
      .split('_')
      .map(word => word.charAt(0).toUpperCase() + word.slice(1))
      .join(' ');
  };

  return (
    <div className="w-full">
      {/* Search Form */}
      <form onSubmit={handleSearch} className="mb-8">
        <div className="relative">
          <div className="flex gap-2">
            <div className="relative flex-1">
              <input
                type="text"
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                placeholder="Search by meaning... (e.g., 'traditional fishing with elders')"
                className="w-full px-4 py-3 pr-12 border border-palm-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-palm-500 focus:border-transparent"
                disabled={loading}
              />
              <div className="absolute right-3 top-3 text-palm-400">
                <svg
                  className="w-6 h-6"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"
                  />
                </svg>
              </div>
            </div>
            <button
              type="submit"
              disabled={loading || !query.trim()}
              className="px-6 py-3 bg-palm-600 text-white rounded-lg hover:bg-palm-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors font-medium"
            >
              {loading ? 'Searching...' : 'Search'}
            </button>
          </div>
        </div>

        {/* Search Info */}
        <div className="mt-2 flex items-center gap-2 text-sm text-palm-600">
          <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
            <path
              fillRule="evenodd"
              d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2v-3a1 1 0 00-1-1H9z"
              clipRule="evenodd"
            />
          </svg>
          <span>AI-powered semantic search finds stories by meaning, not just keywords</span>
        </div>
      </form>

      {/* Error State */}
      {error && (
        <div className="mb-6 p-4 bg-red-50 border border-red-200 rounded-lg text-red-700">
          {error}
        </div>
      )}

      {/* Results */}
      {searched && !loading && (
        <div>
          <div className="mb-4 flex items-center justify-between">
            <h3 className="text-lg font-semibold text-palm-900">
              {results.length > 0
                ? `Found ${results.length} relevant ${results.length === 1 ? 'story' : 'stories'}`
                : 'No stories found'}
            </h3>
            {results.length > 0 && (
              <span className="text-sm text-palm-600">
                Sorted by relevance
              </span>
            )}
          </div>

          {results.length === 0 ? (
            <div className="text-center py-12 bg-gray-50 rounded-lg">
              <svg
                className="mx-auto h-12 w-12 text-gray-400"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M9.172 16.172a4 4 0 015.656 0M9 10h.01M15 10h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
                />
              </svg>
              <p className="mt-4 text-gray-600">
                No stories match your search. Try different words or phrases.
              </p>
            </div>
          ) : (
            <div className="space-y-4">
              {results.map((result, index) => (
                <Link
                  key={result.id}
                  href={`/stories/${result.id}`}
                  className="block p-6 bg-white border border-palm-100 rounded-lg hover:shadow-md hover:border-palm-300 transition-all"
                >
                  <div className="flex items-start justify-between gap-4 mb-3">
                    <div className="flex-1">
                      <h4 className="text-lg font-semibold text-palm-900 mb-1 hover:text-palm-600">
                        {result.title}
                      </h4>
                      <div className="flex items-center gap-3 text-sm text-palm-600">
                        <span className="px-2 py-1 bg-palm-50 rounded">
                          {formatStoryType(result.story_type)}
                        </span>
                        <span>•</span>
                        <span>
                          {new Date(result.created_at).toLocaleDateString()}
                        </span>
                      </div>
                    </div>
                    <div className="flex flex-col items-end gap-2">
                      <div
                        className={`px-3 py-1 rounded-full text-xs font-medium ${getRelevanceColor(result.score)}`}
                      >
                        {getRelevanceLabel(result.score)}
                      </div>
                      <div className="text-xs text-gray-500">
                        {(result.score * 100).toFixed(1)}% match
                      </div>
                    </div>
                  </div>
                  <p className="text-gray-700 line-clamp-3">
                    {result.content_preview}
                  </p>
                  <div className="mt-3 text-palm-600 text-sm font-medium flex items-center gap-1">
                    Read full story
                    <svg
                      className="w-4 h-4"
                      fill="none"
                      stroke="currentColor"
                      viewBox="0 0 24 24"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M9 5l7 7-7 7"
                      />
                    </svg>
                  </div>
                </Link>
              ))}
            </div>
          )}
        </div>
      )}

      {/* Example Queries */}
      {!searched && !loading && (
        <div className="mt-8 p-6 bg-palm-50 rounded-lg border border-palm-100">
          <h4 className="font-semibold text-palm-900 mb-3">Try these example searches:</h4>
          <div className="flex flex-wrap gap-2">
            {[
              'traditional fishing methods',
              'stories from elders',
              'storm and community',
              'healing and recovery',
              'cultural knowledge',
              'language preservation',
            ].map((example) => (
              <button
                key={example}
                onClick={() => setQuery(example)}
                className="px-3 py-1.5 bg-white border border-palm-200 rounded-full text-sm text-palm-700 hover:bg-palm-100 hover:border-palm-300 transition-colors"
              >
                {example}
              </button>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
