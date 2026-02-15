'use client';

import { useState, useEffect, useRef, useCallback } from 'react';
import Link from 'next/link';
import {
  Search, BookOpen, Users, Heart, Database, Image,
  Loader2, X, ArrowRight
} from 'lucide-react';

type TabKey = 'all' | 'stories' | 'people' | 'services' | 'media' | 'knowledge';

interface SearchResult {
  id: string;
  title?: string;
  full_name?: string;
  preferred_name?: string;
  service_name?: string;
  summary?: string;
  bio?: string;
  description?: string;
  type: string;
  url: string;
  story_category?: string;
  entry_type?: string;
  category?: string;
  storyteller_type?: string;
  is_elder?: boolean;
  service_category?: string;
  public_url?: string;
  file_type?: string;
  caption?: string;
  alt_text?: string;
}

const tabs: { key: TabKey; label: string; icon: React.ComponentType<any> }[] = [
  { key: 'all', label: 'All', icon: Search },
  { key: 'stories', label: 'Stories', icon: BookOpen },
  { key: 'people', label: 'People', icon: Users },
  { key: 'services', label: 'Services', icon: Heart },
  { key: 'media', label: 'Media', icon: Image },
  { key: 'knowledge', label: 'Knowledge', icon: Database },
];

function getDisplayName(result: SearchResult): string {
  return result.title || result.full_name || result.preferred_name || result.service_name || 'Untitled';
}

function getExcerpt(result: SearchResult): string {
  const text = result.summary || result.bio || result.description || result.caption || result.alt_text || '';
  if (text.length > 160) return text.substring(0, 160) + '...';
  return text;
}

function getEditUrl(result: SearchResult): string {
  switch (result.type) {
    case 'story': return `/picc/stories/${result.id}/edit`;
    case 'person': return `/picc/storytellers/${result.id}`;
    case 'service': return result.url;
    case 'knowledge': return `/picc/knowledge/${result.url.split('/').pop()}`;
    case 'media': return `/picc/media/${result.id}/edit`;
    default: return result.url;
  }
}

function getTypeBadge(result: SearchResult): { label: string; color: string } {
  switch (result.type) {
    case 'story': return { label: result.story_category || 'Story', color: 'bg-warm-100 text-picc-red' };
    case 'person': return { label: result.is_elder ? 'Elder' : (result.storyteller_type || 'Person'), color: 'bg-blue-100 text-blue-700' };
    case 'service': return { label: result.service_category || 'Service', color: 'bg-green-100 text-green-700' };
    case 'knowledge': return { label: result.entry_type || 'Knowledge', color: 'bg-purple-100 text-purple-700' };
    case 'media': return { label: result.file_type || 'Media', color: 'bg-pink-100 text-pink-700' };
    default: return { label: result.type, color: 'bg-gray-100 text-gray-700' };
  }
}

export default function AdminSearchPage() {
  const [query, setQuery] = useState('');
  const [activeTab, setActiveTab] = useState<TabKey>('all');
  const [loading, setLoading] = useState(false);
  const [results, setResults] = useState<{
    stories: SearchResult[];
    people: SearchResult[];
    services: SearchResult[];
    knowledge: SearchResult[];
    media: SearchResult[];
  }>({ stories: [], people: [], services: [], knowledge: [], media: [] });
  const [hasSearched, setHasSearched] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);
  const debounceRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  useEffect(() => {
    inputRef.current?.focus();
  }, []);

  const performSearch = useCallback(async (searchQuery: string) => {
    if (searchQuery.trim().length < 2) {
      setResults({ stories: [], people: [], services: [], knowledge: [], media: [] });
      setHasSearched(false);
      return;
    }

    setLoading(true);
    setHasSearched(true);

    try {
      const [wikiRes, mediaRes] = await Promise.all([
        fetch(`/api/wiki/search?q=${encodeURIComponent(searchQuery)}&type=all&limit=20&semantic=false&expand=false`),
        fetch(`/api/media/list?q=${encodeURIComponent(searchQuery)}&limit=20`),
      ]);

      const wikiData = wikiRes.ok ? await wikiRes.json() : { results: {} };
      const mediaData = mediaRes.ok ? await mediaRes.json() : { data: [] };

      const mediaResults: SearchResult[] = (mediaData.data || []).map((m: any) => ({
        id: m.id,
        title: m.title || m.original_filename || 'Untitled media',
        caption: m.caption,
        alt_text: m.alt_text,
        public_url: m.public_url,
        file_type: m.file_type,
        type: 'media',
        url: `/picc/media/${m.id}/edit`,
      }));

      setResults({
        stories: wikiData.results?.stories || [],
        people: wikiData.results?.people || [],
        services: wikiData.results?.services || [],
        knowledge: wikiData.results?.knowledge || [],
        media: mediaResults,
      });
    } catch {
      setResults({ stories: [], people: [], services: [], knowledge: [], media: [] });
    } finally {
      setLoading(false);
    }
  }, []);

  const handleInputChange = (value: string) => {
    setQuery(value);
    if (debounceRef.current) clearTimeout(debounceRef.current);
    debounceRef.current = setTimeout(() => performSearch(value), 500);
  };

  const clearSearch = () => {
    setQuery('');
    setResults({ stories: [], people: [], services: [], knowledge: [], media: [] });
    setHasSearched(false);
    inputRef.current?.focus();
  };

  const totalResults = results.stories.length + results.people.length + results.services.length + results.knowledge.length + results.media.length;

  const getTabResults = (tab: TabKey): SearchResult[] => {
    switch (tab) {
      case 'stories': return results.stories;
      case 'people': return results.people;
      case 'services': return results.services;
      case 'knowledge': return results.knowledge;
      case 'media': return results.media;
      default: return [];
    }
  };

  const getTabCount = (tab: TabKey): number => {
    if (tab === 'all') return totalResults;
    return getTabResults(tab).length;
  };

  const renderResultCard = (result: SearchResult) => {
    const badge = getTypeBadge(result);
    return (
      <Link
        key={`${result.type}-${result.id}`}
        href={getEditUrl(result)}
        className="block bg-white p-4 rounded-lg border border-gray-200 hover:border-warm-300 hover:shadow-md transition-all group"
      >
        <div className="flex items-start justify-between gap-3">
          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-2 mb-1">
              <span className={`px-2 py-0.5 text-xs font-semibold rounded-full ${badge.color}`}>
                {badge.label}
              </span>
            </div>
            <h3 className="font-semibold text-gray-900 truncate group-hover:text-picc-red transition-colors">
              {getDisplayName(result)}
            </h3>
            {getExcerpt(result) && (
              <p className="text-sm text-gray-600 mt-1 line-clamp-2">{getExcerpt(result)}</p>
            )}
          </div>
          <ArrowRight className="w-4 h-4 text-gray-400 group-hover:text-picc-red flex-shrink-0 mt-1 transition-colors" />
        </div>
      </Link>
    );
  };

  const renderAllTab = () => {
    const allSections: { key: TabKey; label: string; items: SearchResult[] }[] = [
      { key: 'stories', label: 'Stories', items: results.stories.slice(0, 5) },
      { key: 'people', label: 'People', items: results.people.slice(0, 5) },
      { key: 'services', label: 'Services', items: results.services.slice(0, 5) },
      { key: 'media', label: 'Media', items: results.media.slice(0, 5) },
      { key: 'knowledge', label: 'Knowledge', items: results.knowledge.slice(0, 5) },
    ];
    const sections = allSections.filter(s => s.items.length > 0);

    if (sections.length === 0) return renderNoResults();

    return (
      <div className="space-y-8">
        {sections.map(section => (
          <div key={section.key}>
            <div className="flex items-center justify-between mb-3">
              <h3 className="text-sm font-semibold text-gray-500 uppercase tracking-wider">
                {section.label} ({getTabCount(section.key)})
              </h3>
              {getTabCount(section.key) > 5 && (
                <button
                  onClick={() => setActiveTab(section.key)}
                  className="text-sm text-picc-red hover:text-picc-red font-medium"
                >
                  View all →
                </button>
              )}
            </div>
            <div className="space-y-2">
              {section.items.map(renderResultCard)}
            </div>
          </div>
        ))}
      </div>
    );
  };

  const renderNoResults = () => (
    <div className="text-center py-16">
      <Search className="w-12 h-12 text-gray-300 mx-auto mb-4" />
      <h3 className="text-lg font-semibold text-gray-700 mb-2">No results found</h3>
      <p className="text-gray-500 text-sm">Try different keywords or check the spelling</p>
    </div>
  );

  const renderEmptyState = () => (
    <div className="text-center py-16">
      <Search className="w-16 h-16 text-gray-200 mx-auto mb-4" />
      <h3 className="text-lg font-semibold text-gray-600 mb-2">Search everything</h3>
      <p className="text-gray-400 text-sm">Stories, people, services, media, and knowledge entries</p>
    </div>
  );

  return (
    <div className="p-8 max-w-4xl mx-auto">
      <div className="mb-8">
        <span className="text-xs font-semibold uppercase tracking-[0.15em] text-gray-400">PICC Admin</span>
        <h1 className="text-2xl md:text-3xl font-extrabold text-gray-900 tracking-[-0.02em] mt-1">Search</h1>
      </div>

      {/* Search Bar */}
      <div className="relative mb-6">
        <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
        <input
          ref={inputRef}
          type="text"
          value={query}
          onChange={(e) => handleInputChange(e.target.value)}
          placeholder="Search stories, people, media, services..."
          className="w-full pl-12 pr-12 py-4 bg-white border border-gray-200 rounded-xl text-lg focus:outline-none focus:ring-2 focus:ring-picc-red focus:border-transparent shadow-sm"
        />
        {query && (
          <button
            onClick={clearSearch}
            className="absolute right-4 top-1/2 -translate-y-1/2 p-1 text-gray-400 hover:text-gray-600 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        )}
      </div>

      {/* Tabs */}
      {hasSearched && (
        <div className="flex gap-1 mb-6 overflow-x-auto border-b border-gray-200">
          {tabs.map(tab => {
            const count = getTabCount(tab.key);
            const TabIcon = tab.icon;
            return (
              <button
                key={tab.key}
                onClick={() => setActiveTab(tab.key)}
                className={`flex items-center gap-2 px-4 py-3 text-sm font-medium whitespace-nowrap border-b-2 transition-colors ${
                  activeTab === tab.key
                    ? 'border-picc-red text-picc-red'
                    : 'border-transparent text-gray-500 hover:text-gray-700'
                }`}
              >
                <TabIcon className="w-4 h-4" />
                <span>{tab.label}</span>
                <span className={`px-1.5 py-0.5 text-xs rounded-full ${
                  activeTab === tab.key ? 'bg-warm-100 text-picc-red' : 'bg-gray-100 text-gray-500'
                }`}>
                  {count}
                </span>
              </button>
            );
          })}
        </div>
      )}

      {/* Results */}
      {loading ? (
        <div className="flex items-center justify-center py-16">
          <Loader2 className="w-8 h-8 text-picc-red animate-spin" />
        </div>
      ) : !hasSearched ? (
        renderEmptyState()
      ) : activeTab === 'all' ? (
        renderAllTab()
      ) : getTabResults(activeTab).length === 0 ? (
        renderNoResults()
      ) : (
        <div className="space-y-2">
          {getTabResults(activeTab).map(renderResultCard)}
        </div>
      )}
    </div>
  );
}
