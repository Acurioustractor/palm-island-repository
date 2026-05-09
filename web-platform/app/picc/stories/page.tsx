'use client';

import { useState, useEffect, useMemo, useCallback } from 'react';
import Link from 'next/link';
import {
  BookOpen,
  Search,
  Filter,
  Plus,
  Tag,
  Trash2,
  Download,
  Loader2,
  Eye,
  Edit,
  MoreHorizontal,
  Check,
  Archive,
  Globe,
  Lock,
  Users,
  Clock,
  Star,
  StarOff,
  Copy,
  ExternalLink,
  ChevronDown,
  Image as ImageIcon,
} from 'lucide-react';
import { BulkActionsBar, BulkTagModal } from '@/components/admin';
import {
  STORY_PLACEMENT_CATEGORIES,
  STORY_STATUSES,
  STORY_ACCESS_LEVELS,
  getTagLabel,
  getTagColorClass,
} from '@/lib/taxonomy/placement-tags';

interface Story {
  id: string;
  title: string;
  content?: string;
  excerpt?: string;
  featured_image_url?: string;
  created_at: string;
  updated_at?: string;
  published_at?: string;
  category: string;
  story_type: string;
  status: string;
  access_level: string;
  is_featured?: boolean;
  storyteller_id?: string;
  tags?: string[];
  location?: string;
  views?: number;
  storyteller?: {
    id: string;
    full_name: string;
    preferred_name?: string;
    profile_image_url?: string;
  };
  storyteller_name?: string;
}

type StatusTab = 'all' | 'published' | 'draft' | 'submitted' | 'pending' | 'archived';
type SortField = 'created_at' | 'updated_at' | 'title' | 'views';
type SortOrder = 'asc' | 'desc';

const CATEGORIES = [
  { id: 'community', label: 'Community' },
  { id: 'health', label: 'Health & Wellbeing' },
  { id: 'education', label: 'Education' },
  { id: 'culture', label: 'Culture & Heritage' },
  { id: 'environment', label: 'Environment' },
  { id: 'youth', label: 'Youth' },
  { id: 'family', label: 'Family Services' },
];

const VALID_STATUS_TABS: StatusTab[] = ['all', 'submitted', 'pending', 'draft', 'published', 'archived']

export default function StoriesPage() {
  // Data state
  const [stories, setStories] = useState<Story[]>([]);
  const [loading, setLoading] = useState(true);
  const [loadingMore, setLoadingMore] = useState(false);
  const [hasMore, setHasMore] = useState(false);
  const [totalCount, setTotalCount] = useState(0);
  const [offset, setOffset] = useState(0);
  const PAGE_SIZE = 50;

  // Selection state
  const [selectedIds, setSelectedIds] = useState<Set<string>>(new Set());

  // Filter state
  const [statusTab, setStatusTab] = useState<StatusTab>('all');

  // Read ?status=<tab> from URL on mount (window-based to avoid the
  // useSearchParams Suspense requirement in Next 14 production builds).
  // Lets /picc/inbox link `?status=submitted` actually filter.
  useEffect(() => {
    if (typeof window === 'undefined') return;
    const params = new URLSearchParams(window.location.search);
    const fromUrl = params.get('status') as StatusTab | null;
    if (fromUrl && VALID_STATUS_TABS.includes(fromUrl)) {
      setStatusTab(fromUrl);
    }
  }, []);
  const [searchQuery, setSearchQuery] = useState('');
  const [categoryFilter, setCategoryFilter] = useState('all');
  const [tagFilter, setTagFilter] = useState<string[]>([]);
  const [showFilters, setShowFilters] = useState(false);

  // Sort state
  const [sortField, setSortField] = useState<SortField>('created_at');
  const [sortOrder, setSortOrder] = useState<SortOrder>('desc');

  // Modal state
  const [showTagModal, setShowTagModal] = useState(false);
  const [bulkActionLoading, setBulkActionLoading] = useState(false);

  // Dropdown state
  const [openDropdown, setOpenDropdown] = useState<string | null>(null);

  // Build query URL
  const buildQueryUrl = useCallback(
    (limit: number, offsetValue: number) => {
      const params = new URLSearchParams();
      params.set('limit', String(limit));
      params.set('offset', String(offsetValue));
      params.set('sort_by', sortField);
      params.set('sort_order', sortOrder);

      if (statusTab !== 'all') {
        params.set('status', statusTab);
      }

      if (categoryFilter !== 'all') {
        params.set('category', categoryFilter);
      }

      if (tagFilter.length > 0) {
        params.set('tags', tagFilter.join(','));
      }

      if (searchQuery.trim()) {
        params.set('search', searchQuery.trim());
      }

      return `/api/stories/bulk?${params.toString()}`;
    },
    [statusTab, categoryFilter, tagFilter, searchQuery, sortField, sortOrder]
  );

  // Load stories
  const loadStories = useCallback(async () => {
    setLoading(true);
    try {
      const response = await fetch(buildQueryUrl(PAGE_SIZE, 0), {
        signal: AbortSignal.timeout(10000),
      });

      if (!response.ok) {
        throw new Error('Failed to fetch stories');
      }

      const { data, count, hasMore: more } = await response.json();
      setStories(data || []);
      setTotalCount(count || 0);
      setHasMore(more || false);
      setOffset(PAGE_SIZE);
    } catch (error) {
      console.error('Error loading stories:', error);
      setStories([]);
    } finally {
      setLoading(false);
    }
  }, [buildQueryUrl]);

  // Load more stories
  const loadMore = async () => {
    if (loadingMore || !hasMore) return;

    setLoadingMore(true);
    try {
      const response = await fetch(buildQueryUrl(PAGE_SIZE, offset), {
        signal: AbortSignal.timeout(10000),
      });

      if (!response.ok) {
        throw new Error('Failed to fetch more stories');
      }

      const { data, hasMore: more } = await response.json();
      setStories((prev) => [...prev, ...(data || [])]);
      setHasMore(more || false);
      setOffset((prev) => prev + PAGE_SIZE);
    } catch (error) {
      console.error('Error loading more stories:', error);
    } finally {
      setLoadingMore(false);
    }
  };

  // Initial load and filter changes
  useEffect(() => {
    const timeoutId = setTimeout(loadStories, searchQuery ? 300 : 0);
    return () => clearTimeout(timeoutId);
  }, [loadStories]);

  // Selection handlers
  const toggleSelectAll = () => {
    if (selectedIds.size === stories.length) {
      setSelectedIds(new Set());
    } else {
      setSelectedIds(new Set(stories.map((s) => s.id)));
    }
  };

  const toggleSelect = (id: string) => {
    const next = new Set(selectedIds);
    if (next.has(id)) {
      next.delete(id);
    } else {
      next.add(id);
    }
    setSelectedIds(next);
  };

  const clearSelection = () => setSelectedIds(new Set());

  // Bulk actions
  const handleBulkTags = async (tags: string[], mode: 'add' | 'remove') => {
    setBulkActionLoading(true);
    try {
      const response = await fetch('/api/stories/bulk', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          storyIds: Array.from(selectedIds),
          action: mode === 'add' ? 'add_tags' : 'remove_tags',
          tags,
        }),
      });

      if (!response.ok) {
        throw new Error('Failed to update tags');
      }

      await loadStories();
      clearSelection();
    } catch (error) {
      console.error('Error updating tags:', error);
      alert('Failed to update tags');
    } finally {
      setBulkActionLoading(false);
    }
  };

  const handleBulkStatus = async (status: string) => {
    if (!confirm(`Set ${selectedIds.size} story/stories to "${status}"?`)) return;

    setBulkActionLoading(true);
    try {
      const response = await fetch('/api/stories/bulk', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          storyIds: Array.from(selectedIds),
          action: 'set_status',
          status,
        }),
      });

      if (!response.ok) {
        throw new Error('Failed to update status');
      }

      await loadStories();
      clearSelection();
    } catch (error) {
      console.error('Error updating status:', error);
      alert('Failed to update status');
    } finally {
      setBulkActionLoading(false);
    }
  };

  const handleBulkDelete = async () => {
    if (
      !confirm(
        `Are you sure you want to delete ${selectedIds.size} story/stories? This cannot be undone.`
      )
    )
      return;

    setBulkActionLoading(true);
    try {
      const response = await fetch('/api/stories/bulk', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          storyIds: Array.from(selectedIds),
          action: 'delete',
        }),
      });

      if (!response.ok) {
        throw new Error('Failed to delete stories');
      }

      await loadStories();
      clearSelection();
    } catch (error) {
      console.error('Error deleting stories:', error);
      alert('Failed to delete stories');
    } finally {
      setBulkActionLoading(false);
    }
  };

  // Quick inline actions
  const handleQuickStatusChange = async (id: string, status: string) => {
    try {
      const response = await fetch('/api/stories', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ id, status }),
      });

      if (!response.ok) {
        throw new Error('Failed to update');
      }

      setStories((prev) => prev.map((s) => (s.id === id ? { ...s, status } : s)));
    } catch (error) {
      console.error('Error updating story:', error);
    }
  };

  // Status counts
  const statusCounts = useMemo<Record<StatusTab, number>>(() => {
    return {
      all: totalCount,
      submitted: stories.filter((s) => s.status === 'submitted').length,
      pending: stories.filter((s) => s.status === 'pending').length,
      draft: stories.filter((s) => s.status === 'draft').length,
      published: stories.filter((s) => s.status === 'published').length,
      archived: stories.filter((s) => s.status === 'archived').length,
    };
  }, [stories, totalCount]);

  // Active filters count
  const activeFiltersCount = [
    categoryFilter !== 'all',
    tagFilter.length > 0,
    searchQuery.trim() !== '',
  ].filter(Boolean).length;

  const getStatusBadge = (status: string) => {
    const statusConfig = STORY_STATUSES.find((s) => s.id === status);
    const colors: Record<string, string> = {
      draft: 'bg-gray-100 text-gray-700',
      pending: 'bg-picc-ochre-100 text-picc-ochre-700',
      published: 'bg-green-100 text-green-700',
      archived: 'bg-red-100 text-red-700',
    };
    return (
      <span className={`px-2 py-0.5 text-xs rounded-full ${colors[status] || colors.draft}`}>
        {statusConfig?.label || status}
      </span>
    );
  };

  const getAccessIcon = (level: string) => {
    switch (level) {
      case 'public':
        return <span title="Public"><Globe className="w-4 h-4 text-green-600" /></span>;
      case 'community':
        return <span title="Community only"><Users className="w-4 h-4 text-blue-600" /></span>;
      case 'restricted':
        return <span title="Restricted"><Lock className="w-4 h-4 text-red-600" /></span>;
      default:
        return <Globe className="w-4 h-4 text-gray-400" />;
    }
  };

  return (
    <div className="p-6 lg:p-8 max-w-7xl mx-auto">
      {/* Header */}
      <div className="mb-8">
        <p className="uppercase font-bold mb-2" style={{ color: '#8B1A1A', fontSize: 11, letterSpacing: '0.3em' }}>
          PICC admin · stories
        </p>
        <div className="flex items-end justify-between gap-4 flex-wrap">
          <div>
            <h1 className="font-fraunces font-bold leading-tight" style={{ color: '#0B4F6C', fontSize: 'clamp(28px, 4vw, 40px)' }}>
              Story library.
            </h1>
            <p className="mt-2 text-sm" style={{ color: '#6B6560' }}>
              92 stories total · 74 public. Manage content, edit, and control publication.
            </p>
          </div>
          <Link
            href="/picc/stories/new"
            className="flex items-center gap-2 px-4 py-2 text-sm font-bold uppercase tracking-widest rounded-md hover:opacity-90 transition"
            style={{ backgroundColor: '#0B4F6C', color: '#FBF8EE', letterSpacing: '0.15em' }}
          >
            <Plus className="w-4 h-4" />
            New story
          </Link>
        </div>

        {/* Quick links */}
        <div className="mt-3 flex flex-wrap items-center gap-2 text-sm">
          <Link
            href="/picc/storytellers"
            className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-blue-50 text-blue-800 border border-blue-100 hover:bg-blue-100"
          >
            <Users className="w-3 h-3" />
            Manage Storytellers
          </Link>
          <Link
            href="/stories"
            target="_blank"
            className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-green-50 text-green-800 border border-green-100 hover:bg-green-100"
          >
            <ExternalLink className="w-3 h-3" />
            View Public Stories
          </Link>
        </div>
      </div>

      {/* Status Tabs */}
      <div className="flex items-center gap-1 mb-4 border-b border-gray-200">
        {(['all', 'submitted', 'pending', 'draft', 'published', 'archived'] as StatusTab[]).map((tab) => (
          <button
            key={tab}
            onClick={() => setStatusTab(tab)}
            className={`px-4 py-2 text-sm font-medium border-b-2 transition-colors ${
              statusTab === tab
                ? 'border-blue-600 text-blue-600'
                : 'border-transparent text-gray-600 hover:text-gray-900'
            }`}
          >
            {tab.charAt(0).toUpperCase() + tab.slice(1)}
            <span className="ml-1.5 px-1.5 py-0.5 text-xs bg-gray-100 text-gray-600 rounded-full">
              {statusCounts[tab]}
            </span>
          </button>
        ))}
      </div>

      {/* Filters Bar */}
      <div className="bg-white rounded-xl border border-gray-200 p-4 mb-4 shadow-sm">
        <div className="flex flex-wrap items-center gap-4">
          {/* Search */}
          <div className="flex-1 min-w-[200px]">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
              <input
                type="text"
                placeholder="Search stories..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
              />
            </div>
          </div>

          {/* Category Filter */}
          <select
            value={categoryFilter}
            onChange={(e) => setCategoryFilter(e.target.value)}
            className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
          >
            <option value="all">All Categories</option>
            {CATEGORIES.map((cat) => (
              <option key={cat.id} value={cat.id}>
                {cat.label}
              </option>
            ))}
          </select>

          {/* More Filters Toggle */}
          <button
            onClick={() => setShowFilters(!showFilters)}
            className={`flex items-center gap-2 px-4 py-2 border rounded-lg transition-colors ${
              activeFiltersCount > 0
                ? 'border-blue-300 bg-blue-50 text-blue-700'
                : 'border-gray-300 text-gray-700 hover:bg-gray-50'
            }`}
          >
            <Filter className="w-4 h-4" />
            Filters
            {activeFiltersCount > 0 && (
              <span className="px-1.5 py-0.5 bg-blue-600 text-white text-xs rounded-full">
                {activeFiltersCount}
              </span>
            )}
          </button>

          {/* Sort */}
          <div className="flex items-center gap-2">
            <select
              value={sortField}
              onChange={(e) => setSortField(e.target.value as SortField)}
              className="px-3 py-2 border border-gray-300 rounded-lg text-sm"
            >
              <option value="created_at">Date Created</option>
              <option value="updated_at">Last Updated</option>
              <option value="title">Title</option>
              <option value="views">Views</option>
            </select>
            <button
              onClick={() => setSortOrder(sortOrder === 'asc' ? 'desc' : 'asc')}
              className="px-3 py-2 border border-gray-300 rounded-lg hover:bg-gray-50"
            >
              {sortOrder === 'asc' ? '↑' : '↓'}
            </button>
          </div>
        </div>

        {/* Expanded Filters */}
        {showFilters && (
          <div className="mt-4 pt-4 border-t border-gray-200">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Tags</label>
              <div className="flex flex-wrap gap-2">
                {STORY_PLACEMENT_CATEGORIES.flatMap((cat) => cat.tags)
                  .slice(0, 12)
                  .map((tag) => (
                    <button
                      key={tag.id}
                      onClick={() => {
                        if (tagFilter.includes(tag.id)) {
                          setTagFilter(tagFilter.filter((t) => t !== tag.id));
                        } else {
                          setTagFilter([...tagFilter, tag.id]);
                        }
                      }}
                      className={`px-2 py-1 text-xs rounded-full transition-colors ${
                        tagFilter.includes(tag.id)
                          ? 'bg-blue-600 text-white'
                          : `${getTagColorClass(tag.id)} ${getTagColorClass(tag.id, 'text')}`
                      }`}
                    >
                      {tag.label}
                    </button>
                  ))}
              </div>
            </div>

            {activeFiltersCount > 0 && (
              <button
                onClick={() => {
                  setSearchQuery('');
                  setCategoryFilter('all');
                  setTagFilter([]);
                }}
                className="mt-4 text-sm text-blue-600 hover:text-blue-700"
              >
                Clear all filters
              </button>
            )}
          </div>
        )}
      </div>

      {/* Bulk Actions Bar */}
      <BulkActionsBar
        selectedCount={selectedIds.size}
        onClearSelection={clearSelection}
        itemLabel="story"
        actions={[
          {
            id: 'tags',
            label: 'Manage Tags',
            icon: <Tag className="w-4 h-4" />,
            onClick: () => setShowTagModal(true),
            variant: 'primary',
            loading: bulkActionLoading,
          },
          {
            id: 'publish',
            label: 'Publish',
            icon: <Check className="w-4 h-4" />,
            onClick: () => handleBulkStatus('published'),
            loading: bulkActionLoading,
          },
          {
            id: 'archive',
            label: 'Archive',
            icon: <Archive className="w-4 h-4" />,
            onClick: () => handleBulkStatus('archived'),
            loading: bulkActionLoading,
          },
          {
            id: 'delete',
            label: 'Delete',
            icon: <Trash2 className="w-4 h-4" />,
            onClick: handleBulkDelete,
            variant: 'danger',
            loading: bulkActionLoading,
          },
        ]}
      />

      {/* Content */}
      {loading ? (
        <div className="text-center py-12">
          <Loader2 className="w-8 h-8 animate-spin mx-auto text-blue-600 mb-2" />
          <p className="text-gray-500">Loading stories...</p>
        </div>
      ) : stories.length === 0 ? (
        <div className="text-center py-12 bg-gray-50 rounded-xl">
          <BookOpen className="w-12 h-12 mx-auto text-gray-300 mb-4" />
          <p className="text-gray-700 font-medium mb-1">
            {activeFiltersCount > 0 || statusTab !== 'all'
              ? 'No stories match your filters'
              : 'No stories yet'}
          </p>
          <p className="text-gray-500 mb-4">
            {activeFiltersCount > 0 || statusTab !== 'all'
              ? 'Try adjusting your filters'
              : 'Create your first story to get started'}
          </p>
          {activeFiltersCount > 0 || statusTab !== 'all' ? (
            <button
              onClick={() => {
                setSearchQuery('');
                setCategoryFilter('all');
                setTagFilter([]);
                setStatusTab('all');
              }}
              className="px-4 py-2 bg-white border border-gray-300 rounded-lg hover:bg-gray-50"
            >
              Clear filters
            </button>
          ) : (
            <Link
              href="/picc/stories/new"
              className="inline-flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
            >
              <Plus className="w-4 h-4" />
              New Story
            </Link>
          )}
        </div>
      ) : (
        /* Table View */
        <div className="bg-white rounded-xl border border-gray-200 overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-gray-50 border-b border-gray-200">
                <tr>
                  <th className="w-12 px-4 py-3">
                    <input
                      type="checkbox"
                      checked={selectedIds.size === stories.length && stories.length > 0}
                      onChange={toggleSelectAll}
                      className="w-4 h-4 rounded border-gray-300 text-blue-600"
                    />
                  </th>
                  <th className="px-4 py-3 text-left text-sm font-medium text-gray-700">Title</th>
                  <th className="px-4 py-3 text-left text-sm font-medium text-gray-700">
                    Storyteller
                  </th>
                  <th className="px-4 py-3 text-left text-sm font-medium text-gray-700">Category</th>
                  <th className="px-4 py-3 text-left text-sm font-medium text-gray-700">Status</th>
                  <th className="px-4 py-3 text-left text-sm font-medium text-gray-700">Tags</th>
                  <th className="px-4 py-3 text-left text-sm font-medium text-gray-700">Date</th>
                  <th className="px-4 py-3 text-right text-sm font-medium text-gray-700">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-200">
                {stories.map((story) => (
                  <tr
                    key={story.id}
                    className={`hover:bg-gray-50 ${selectedIds.has(story.id) ? 'bg-blue-50' : ''}`}
                  >
                    <td className="px-4 py-3">
                      <input
                        type="checkbox"
                        checked={selectedIds.has(story.id)}
                        onChange={() => toggleSelect(story.id)}
                        className="w-4 h-4 rounded border-gray-300 text-blue-600"
                      />
                    </td>
                    <td className="px-4 py-3">
                      <div className="flex items-start gap-3">
                        {story.featured_image_url ? (
                          <img
                            src={story.featured_image_url}
                            alt=""
                            className="w-12 h-12 rounded object-cover flex-shrink-0"
                          />
                        ) : (
                          <div className="w-12 h-12 rounded bg-gray-100 flex items-center justify-center flex-shrink-0">
                            <ImageIcon className="w-5 h-5 text-gray-400" />
                          </div>
                        )}
                        <div className="min-w-0">
                          <Link
                            href={`/picc/stories/${story.id}/edit`}
                            className="font-medium text-gray-900 hover:text-blue-600 line-clamp-1"
                          >
                            {story.title || 'Untitled'}
                          </Link>
                          {story.excerpt && (
                            <p className="text-xs text-gray-500 line-clamp-1 mt-0.5">
                              {story.excerpt}
                            </p>
                          )}
                          <div className="flex items-center gap-2 mt-1">
                            {getAccessIcon(story.access_level)}
                            {story.is_featured && (
                              <span title="Featured"><Star className="w-4 h-4 text-picc-ochre-500" /></span>
                            )}
                          </div>
                        </div>
                      </div>
                    </td>
                    <td className="px-4 py-3">
                      {story.storyteller ? (
                        <Link
                          href={`/picc/storytellers/${story.storyteller.id}`}
                          className="flex items-center gap-2 text-sm text-gray-700 hover:text-blue-600"
                        >
                          {story.storyteller.profile_image_url ? (
                            <img
                              src={story.storyteller.profile_image_url}
                              alt=""
                              className="w-6 h-6 rounded-full object-cover"
                            />
                          ) : (
                            <div className="w-6 h-6 rounded-full bg-gray-200 flex items-center justify-center">
                              <Users className="w-3 h-3 text-gray-400" />
                            </div>
                          )}
                          <span className="truncate max-w-[120px]">
                            {story.storyteller.preferred_name || story.storyteller.full_name}
                          </span>
                        </Link>
                      ) : (
                        <span className="text-sm text-gray-400">No storyteller</span>
                      )}
                    </td>
                    <td className="px-4 py-3">
                      <span className="px-2 py-0.5 text-xs bg-gray-100 text-gray-700 rounded-full capitalize">
                        {story.category?.replace(/_/g, ' ') || 'Uncategorized'}
                      </span>
                    </td>
                    <td className="px-4 py-3">{getStatusBadge(story.status)}</td>
                    <td className="px-4 py-3">
                      <div className="flex flex-wrap gap-1 max-w-[150px]">
                        {(story.tags || []).slice(0, 2).map((tag) => (
                          <span
                            key={tag}
                            className={`px-1.5 py-0.5 text-xs rounded ${getTagColorClass(tag)} ${getTagColorClass(tag, 'text')}`}
                          >
                            {getTagLabel(tag)}
                          </span>
                        ))}
                        {(story.tags || []).length > 2 && (
                          <span className="px-1.5 py-0.5 text-xs text-gray-500">
                            +{(story.tags || []).length - 2}
                          </span>
                        )}
                      </div>
                    </td>
                    <td className="px-4 py-3">
                      <div className="text-sm text-gray-600">
                        {new Date(story.created_at).toLocaleDateString()}
                      </div>
                      {story.published_at && (
                        <div className="text-xs text-green-600">
                          Published {new Date(story.published_at).toLocaleDateString()}
                        </div>
                      )}
                    </td>
                    <td className="px-4 py-3">
                      <div className="flex items-center justify-end gap-1">
                        <Link
                          href={`/picc/stories/${story.id}/edit`}
                          className="p-2 text-gray-600 hover:text-gray-900 hover:bg-gray-100 rounded-lg"
                          title="Edit"
                        >
                          <Edit className="w-4 h-4" />
                        </Link>
                        <Link
                          href={`/stories/${story.id}`}
                          target="_blank"
                          className="p-2 text-gray-600 hover:text-gray-900 hover:bg-gray-100 rounded-lg"
                          title="Preview"
                        >
                          <Eye className="w-4 h-4" />
                        </Link>
                        <div className="relative">
                          <button
                            onClick={() =>
                              setOpenDropdown(openDropdown === story.id ? null : story.id)
                            }
                            className="p-2 text-gray-600 hover:text-gray-900 hover:bg-gray-100 rounded-lg"
                          >
                            <MoreHorizontal className="w-4 h-4" />
                          </button>
                          {openDropdown === story.id && (
                            <div className="absolute right-0 top-full mt-1 w-48 bg-white border border-gray-200 rounded-lg shadow-lg z-10">
                              {story.status !== 'published' && (
                                <button
                                  onClick={() => {
                                    handleQuickStatusChange(story.id, 'published');
                                    setOpenDropdown(null);
                                  }}
                                  className="w-full px-4 py-2 text-left text-sm hover:bg-gray-50 flex items-center gap-2 text-green-600"
                                >
                                  <Check className="w-4 h-4" />
                                  Publish
                                </button>
                              )}
                              {story.status === 'published' && (
                                <button
                                  onClick={() => {
                                    handleQuickStatusChange(story.id, 'draft');
                                    setOpenDropdown(null);
                                  }}
                                  className="w-full px-4 py-2 text-left text-sm hover:bg-gray-50 flex items-center gap-2"
                                >
                                  <Clock className="w-4 h-4" />
                                  Unpublish (Draft)
                                </button>
                              )}
                              <button
                                onClick={() => {
                                  handleQuickStatusChange(story.id, 'archived');
                                  setOpenDropdown(null);
                                }}
                                className="w-full px-4 py-2 text-left text-sm hover:bg-gray-50 flex items-center gap-2"
                              >
                                <Archive className="w-4 h-4" />
                                Archive
                              </button>
                              <Link
                                href={`/picc/stories/new?duplicate=${story.id}`}
                                className="w-full px-4 py-2 text-left text-sm hover:bg-gray-50 flex items-center gap-2"
                              >
                                <Copy className="w-4 h-4" />
                                Duplicate
                              </Link>
                            </div>
                          )}
                        </div>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Load More */}
      {!loading && hasMore && (
        <div className="mt-6 text-center">
          <button
            onClick={loadMore}
            disabled={loadingMore}
            className="px-6 py-2 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 disabled:opacity-50"
          >
            {loadingMore ? (
              <>
                <Loader2 className="w-4 h-4 animate-spin inline mr-2" />
                Loading...
              </>
            ) : (
              `Load More (${stories.length} of ${totalCount})`
            )}
          </button>
        </div>
      )}

      {/* Tag Modal */}
      <BulkTagModal
        isOpen={showTagModal}
        onClose={() => setShowTagModal(false)}
        onApply={handleBulkTags}
        categories={STORY_PLACEMENT_CATEGORIES}
        selectedCount={selectedIds.size}
        itemLabel="story"
        title="Manage Story Tags"
      />

      {/* Click outside to close dropdown */}
      {openDropdown && (
        <div className="fixed inset-0 z-0" onClick={() => setOpenDropdown(null)} />
      )}
    </div>
  );
}
