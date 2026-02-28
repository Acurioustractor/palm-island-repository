'use client';

import { useState } from 'react';
import Link from 'next/link';
import { Bot, Search } from 'lucide-react';

export function WikiSearchBar() {
  const [searchQuery, setSearchQuery] = useState('');
  const [isSearching, setIsSearching] = useState(false);
  const [searchResults, setSearchResults] = useState<any[]>([]);

  async function handleSearch(e: React.FormEvent) {
    e.preventDefault();
    if (!searchQuery.trim()) return;

    setIsSearching(true);
    try {
      const response = await fetch(`/api/wiki/search?q=${encodeURIComponent(searchQuery)}&limit=5&semantic=true`);
      const data = await response.json();

      if (data.results) {
        const combinedResults = [
          ...data.results.stories.map((s: any) => ({ ...s, resultType: 'story' })),
          ...data.results.knowledge.map((k: any) => ({ ...k, resultType: 'knowledge' })),
          ...data.results.people.map((p: any) => ({ ...p, resultType: 'person' })),
          ...(data.results.artifacts || []).map((a: any) => ({ ...a, resultType: 'artifact' })),
        ].slice(0, 8);
        setSearchResults(combinedResults);
      }
    } catch {
      setSearchResults([]);
    } finally {
      setIsSearching(false);
    }
  }

  return (
    <div>
      <form onSubmit={handleSearch} className="relative max-w-2xl">
        <div className="relative">
          <Bot className="absolute left-4 top-1/2 -translate-y-1/2 h-5 w-5 text-gray-400" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Ask anything... e.g., 'Hull River cyclone' or '1957 strike'"
            className="w-full pl-12 pr-32 py-4 text-lg bg-white rounded-2xl border-0 shadow-xl focus:ring-4 focus:ring-white/30 transition-all"
          />
          <button
            type="submit"
            disabled={isSearching}
            className="absolute right-2 top-1/2 -translate-y-1/2 px-6 py-2 bg-gradient-to-r from-picc-red to-picc-ochre text-white font-medium rounded-xl hover:opacity-90 transition-all disabled:opacity-50"
          >
            {isSearching ? 'Searching...' : 'Search'}
          </button>
        </div>

        <div className="flex flex-wrap gap-2 mt-4">
          <span className="text-sm text-warm-200">Try:</span>
          {['Hull River cyclone', 'Elder stories', '1957 strike', 'Manbarra country', 'Self-determination'].map((suggestion) => (
            <button
              key={suggestion}
              type="button"
              onClick={() => setSearchQuery(suggestion)}
              className="px-3 py-1 text-sm bg-white/20 hover:bg-white/30 text-white rounded-full transition-colors"
            >
              {suggestion}
            </button>
          ))}
        </div>
      </form>

      {searchResults.length > 0 && (
        <div className="mt-4 bg-white rounded-xl shadow-xl p-4 max-w-2xl">
          <p className="text-sm text-gray-500 mb-3">Found {searchResults.length} results</p>
          <div className="space-y-2">
            {searchResults.map((result: any) => {
              const href = result.url || (
                result.resultType === 'person' ? `/wiki/people/${result.id}` :
                result.resultType === 'artifact' ? `/wiki/artifact/${result.id}` :
                result.resultType === 'knowledge' ? `/wiki/${result.slug || result.id}` :
                `/stories/${result.id}`
              );
              const title = result.title || result.full_name || result.name;
              const subtitle = result.summary || result.bio || result.description || result.content_summary;
              const badge = result.resultType === 'person' ? 'Person' :
                            result.resultType === 'artifact' ? 'Artifact' :
                            result.resultType === 'knowledge' ? 'Knowledge' : 'Story';
              const badgeColor = result.resultType === 'person' ? 'bg-sage-100 text-sage-700' :
                                 result.resultType === 'artifact' ? 'bg-stone-100 text-stone-700' :
                                 result.resultType === 'knowledge' ? 'bg-warm-100 text-picc-ochre' :
                                 'bg-warm-100 text-picc-red';

              return (
                <Link
                  key={result.id}
                  href={href}
                  className="block p-3 hover:bg-gray-50 rounded-lg transition-colors"
                >
                  <div className="flex items-center gap-2 mb-1">
                    <h4 className="font-medium text-gray-900">{title}</h4>
                    <span className={`text-xs px-2 py-0.5 rounded-full ${badgeColor}`}>{badge}</span>
                  </div>
                  {subtitle && (
                    <p className="text-sm text-gray-600 line-clamp-1">{subtitle}</p>
                  )}
                </Link>
              );
            })}
          </div>
          <Link
            href={`/search?q=${encodeURIComponent(searchQuery)}`}
            className="block mt-3 text-center text-sm text-picc-red hover:text-picc-red/80 font-medium"
          >
            View all results →
          </Link>
        </div>
      )}
    </div>
  );
}
