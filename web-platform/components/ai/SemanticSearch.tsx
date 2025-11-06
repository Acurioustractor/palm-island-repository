'use client';

import React, { useState } from 'react';
import { Search, Loader2, FileText, BookOpen, Sparkles } from 'lucide-react';
import Link from 'next/link';

interface SearchResult {
  stories: any[];
  documents: any[];
  totalResults: number;
  query: string;
}

export default function SemanticSearch() {
  const [query, setQuery] = useState('');
  const [searchType, setSearchType] = useState<'all' | 'stories' | 'documents'>('all');
  const [results, setResults] = useState<SearchResult | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleSearch = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!query.trim()) {
      setError('Please enter a search query');
      return;
    }

    setLoading(true);
    setError(null);

    try {
      const response = await fetch('/api/ai/search/semantic', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          query: query.trim(),
          searchType,
          limit: 20
        })
      });

      if (!response.ok) {
        throw new Error('Search failed');
      }

      const data = await response.json();
      setResults(data);
    } catch (err: any) {
      setError(err.message || 'Failed to perform search');
      console.error('Search error:', err);
    } finally {
      setLoading(false);
    }
  };

  const highlightText = (text: string, maxLength: number = 200) => {
    if (!text) return '';
    return text.length > maxLength ? text.substring(0, maxLength) + '...' : text;
  };

  return (
    <div className="space-y-6">
      {/* Search Form */}
      <form onSubmit={handleSearch} className="space-y-4">
        <div className="relative">
          <Sparkles className="absolute left-4 top-1/2 transform -translate-y-1/2 w-5 h-5 text-coral-warm" />
          <input
            type="text"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Ask a question or describe what you're looking for..."
            className="w-full pl-12 pr-4 py-4 text-lg border-2 border-ocean-medium rounded-xl focus:outline-none focus:ring-2 focus:ring-coral-warm"
            disabled={loading}
          />
        </div>

        {/* Search Type Selector */}
        <div className="flex items-center gap-4">
          <span className="text-sm text-earth-dark font-medium">Search in:</span>
          <div className="flex gap-2">
            {(['all', 'stories', 'documents'] as const).map((type) => (
              <button
                key={type}
                type="button"
                onClick={() => setSearchType(type)}
                className={`px-4 py-2 rounded-lg text-sm font-medium transition-all ${
                  searchType === type
                    ? 'bg-ocean-medium text-white'
                    : 'bg-earth-bg text-earth-dark hover:bg-earth-light'
                }`}
              >
                {type === 'all' ? 'All Content' : type.charAt(0).toUpperCase() + type.slice(1)}
              </button>
            ))}
          </div>
        </div>

        {/* Search Button */}
        <button
          type="submit"
          disabled={loading || !query.trim()}
          className="btn-primary w-full md:w-auto px-8 py-3 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
        >
          {loading ? (
            <>
              <Loader2 className="w-5 h-5 animate-spin" />
              Searching...
            </>
          ) : (
            <>
              <Search className="w-5 h-5" />
              Search
            </>
          )}
        </button>
      </form>

      {/* Example Queries */}
      {!results && !loading && (
        <div className="bg-earth-bg rounded-xl p-6">
          <h3 className="font-bold text-ocean-deep mb-3">Try asking:</h3>
          <div className="space-y-2">
            {[
              'Stories about traditional fishing practices',
              'Experiences during Cyclone 2019',
              'Community leaders and elders',
              'Housing and infrastructure challenges',
              'Cultural ceremonies and celebrations'
            ].map((example, index) => (
              <button
                key={index}
                onClick={() => setQuery(example)}
                className="block w-full text-left px-4 py-2 text-sm text-ocean-medium hover:bg-white rounded-lg transition-all"
              >
                "{example}"
              </button>
            ))}
          </div>
        </div>
      )}

      {/* Error Message */}
      {error && (
        <div className="bg-error/10 border border-error rounded-lg p-4">
          <p className="text-error">{error}</p>
        </div>
      )}

      {/* Search Results */}
      {results && !loading && (
        <div className="space-y-6">
          {/* Results Summary */}
          <div className="flex items-center justify-between">
            <h2 className="text-2xl font-bold text-ocean-deep">
              {results.totalResults} {results.totalResults === 1 ? 'Result' : 'Results'}
            </h2>
            <p className="text-sm text-earth-medium">
              for "{results.query}"
            </p>
          </div>

          {results.totalResults === 0 && (
            <div className="card-modern p-12 text-center">
              <Search className="w-16 h-16 mx-auto mb-4 text-earth-medium" />
              <p className="text-earth-medium text-lg mb-2">No results found</p>
              <p className="text-sm text-earth-medium">
                Try different keywords or broaden your search
              </p>
            </div>
          )}

          {/* Story Results */}
          {results.stories.length > 0 && (
            <div className="space-y-4">
              <h3 className="text-xl font-bold text-ocean-deep flex items-center gap-2">
                <BookOpen className="w-5 h-5 text-coral-warm" />
                Stories ({results.stories.length})
              </h3>
              <div className="space-y-3">
                {results.stories.map((story: any) => (
                  <Link
                    key={story.id}
                    href={`/stories/${story.id}`}
                    className="card-modern p-6 hover:shadow-lg transition-all block"
                  >
                    <div className="flex items-start justify-between mb-2">
                      <h4 className="text-lg font-bold text-ocean-deep group-hover:text-coral-warm">
                        {story.title}
                      </h4>
                      <span className="text-xs px-3 py-1 bg-coral-warm/10 text-coral-warm rounded-full font-medium">
                        {Math.round(story.similarity * 100)}% match
                      </span>
                    </div>
                    {story.profiles && (
                      <p className="text-sm text-earth-medium mb-2">
                        by {story.profiles.preferred_name || story.profiles.full_name}
                      </p>
                    )}
                    <p className="text-earth-dark line-clamp-3">
                      {story.summary || highlightText(story.content, 200)}
                    </p>
                    <p className="text-xs text-earth-medium mt-2">
                      {new Date(story.created_at).toLocaleDateString('en-AU', {
                        year: 'numeric',
                        month: 'long',
                        day: 'numeric'
                      })}
                    </p>
                  </Link>
                ))}
              </div>
            </div>
          )}

          {/* Document Results */}
          {results.documents.length > 0 && (
            <div className="space-y-4">
              <h3 className="text-xl font-bold text-ocean-deep flex items-center gap-2">
                <FileText className="w-5 h-5 text-coral-warm" />
                Documents ({results.documents.length})
              </h3>
              <div className="space-y-3">
                {results.documents.map((doc: any) => (
                  <Link
                    key={doc.id}
                    href={`/documents`}
                    className="card-modern p-6 hover:shadow-lg transition-all block"
                  >
                    <div className="flex items-start justify-between mb-2">
                      <h4 className="text-lg font-bold text-ocean-deep">
                        {doc.title}
                      </h4>
                      <span className="text-xs px-3 py-1 bg-coral-warm/10 text-coral-warm rounded-full font-medium">
                        {Math.round(doc.similarity * 100)}% match
                      </span>
                    </div>
                    {doc.description && (
                      <p className="text-earth-dark line-clamp-2 mb-2">
                        {doc.description}
                      </p>
                    )}
                    <div className="flex items-center gap-3 text-xs text-earth-medium">
                      <span className="px-2 py-1 bg-earth-bg rounded">
                        {doc.category}
                      </span>
                      {doc.author && <span>by {doc.author}</span>}
                      {doc.document_date && (
                        <span>
                          {new Date(doc.document_date).toLocaleDateString('en-AU', {
                            year: 'numeric',
                            month: 'short'
                          })}
                        </span>
                      )}
                    </div>
                  </Link>
                ))}
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
