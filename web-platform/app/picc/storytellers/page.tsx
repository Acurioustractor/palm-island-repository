'use client';

import { useState, useEffect, useMemo, useCallback } from 'react';
import Link from 'next/link';
import {
  Users,
  Search,
  Filter,
  Grid,
  List,
  Table2,
  Plus,
  Tag,
  Trash2,
  Download,
  X,
  Loader2,
  Eye,
  Edit,
  MoreHorizontal,
  UserCheck,
  UserX,
  BookOpen,
  Mic,
  ExternalLink,
  FileText,
  Upload,
} from 'lucide-react';
import { BulkActionsBar, BulkTagModal } from '@/components/admin';
import {
  STORYTELLER_PLACEMENT_CATEGORIES,
  STORYTELLER_TYPES,
  getTagLabel,
  getTagColorClass,
} from '@/lib/taxonomy/placement-tags';

interface Storyteller {
  id: string;
  full_name: string;
  preferred_name?: string;
  profile_image_url?: string;
  bio?: string;
  storyteller_type: string;
  is_elder: boolean;
  is_cultural_advisor?: boolean;
  show_in_directory?: boolean;
  location?: string;
  placement_tags?: string[];
  stories_contributed: number;
  interviews_completed: number;
  created_at: string;
  updated_at?: string;
}

type ViewMode = 'table' | 'grid' | 'compact';
type SortField = 'full_name' | 'stories_contributed' | 'created_at' | 'updated_at';
type SortOrder = 'asc' | 'desc';

export default function StorytellersPage() {
  // Data state
  const [storytellers, setStorytellers] = useState<Storyteller[]>([]);
  const [loading, setLoading] = useState(true);
  const [loadingMore, setLoadingMore] = useState(false);
  const [hasMore, setHasMore] = useState(false);
  const [totalCount, setTotalCount] = useState(0);
  const [offset, setOffset] = useState(0);
  const PAGE_SIZE = 50;

  // Selection state
  const [selectedIds, setSelectedIds] = useState<Set<string>>(new Set());

  // View state
  const [viewMode, setViewMode] = useState<ViewMode>('table');

  // Filter state
  const [searchQuery, setSearchQuery] = useState('');
  const [typeFilter, setTypeFilter] = useState('all');
  const [tagFilter, setTagFilter] = useState<string[]>([]);
  const [hasStoriesFilter, setHasStoriesFilter] = useState('all');
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

      if (typeFilter !== 'all') {
        params.set('type', typeFilter);
      }

      if (tagFilter.length > 0) {
        params.set('tags', tagFilter.join(','));
      }

      if (searchQuery.trim()) {
        params.set('search', searchQuery.trim());
      }

      if (hasStoriesFilter !== 'all') {
        params.set('hasStories', hasStoriesFilter);
      }

      return `/api/storytellers/bulk?${params.toString()}`;
    },
    [typeFilter, tagFilter, searchQuery, hasStoriesFilter]
  );

  // Load storytellers
  const loadStorytellers = useCallback(async () => {
    setLoading(true);
    try {
      const response = await fetch(buildQueryUrl(PAGE_SIZE, 0), {
        signal: AbortSignal.timeout(10000),
      });

      if (!response.ok) {
        throw new Error('Failed to fetch storytellers');
      }

      const { data, count, hasMore: more } = await response.json();
      setStorytellers(data || []);
      setTotalCount(count || 0);
      setHasMore(more || false);
      setOffset(PAGE_SIZE);
    } catch (error) {
      console.error('Error loading storytellers:', error);
      setStorytellers([]);
    } finally {
      setLoading(false);
    }
  }, [buildQueryUrl]);

  // Load more storytellers
  const loadMore = async () => {
    if (loadingMore || !hasMore) return;

    setLoadingMore(true);
    try {
      const response = await fetch(buildQueryUrl(PAGE_SIZE, offset), {
        signal: AbortSignal.timeout(10000),
      });

      if (!response.ok) {
        throw new Error('Failed to fetch more storytellers');
      }

      const { data, hasMore: more } = await response.json();
      setStorytellers((prev) => [...prev, ...(data || [])]);
      setHasMore(more || false);
      setOffset((prev) => prev + PAGE_SIZE);
    } catch (error) {
      console.error('Error loading more storytellers:', error);
    } finally {
      setLoadingMore(false);
    }
  };

  // Initial load and filter changes
  useEffect(() => {
    const timeoutId = setTimeout(loadStorytellers, searchQuery ? 300 : 0);
    return () => clearTimeout(timeoutId);
  }, [loadStorytellers, searchQuery, typeFilter, tagFilter, hasStoriesFilter]);

  // Sort storytellers client-side
  const sortedStorytellers = useMemo(() => {
    return [...storytellers].sort((a, b) => {
      let comparison = 0;

      switch (sortField) {
        case 'full_name':
          comparison = (a.full_name || '').localeCompare(b.full_name || '');
          break;
        case 'stories_contributed':
          comparison = (a.stories_contributed || 0) - (b.stories_contributed || 0);
          break;
        case 'created_at':
          comparison = new Date(a.created_at).getTime() - new Date(b.created_at).getTime();
          break;
        case 'updated_at':
          comparison =
            new Date(a.updated_at || a.created_at).getTime() -
            new Date(b.updated_at || b.created_at).getTime();
          break;
      }

      return sortOrder === 'asc' ? comparison : -comparison;
    });
  }, [storytellers, sortField, sortOrder]);

  // Selection handlers
  const toggleSelectAll = () => {
    if (selectedIds.size === storytellers.length) {
      setSelectedIds(new Set());
    } else {
      setSelectedIds(new Set(storytellers.map((s) => s.id)));
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
      const response = await fetch('/api/storytellers/bulk', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          profileIds: Array.from(selectedIds),
          action: mode === 'add' ? 'add_tags' : 'remove_tags',
          tags,
        }),
      });

      if (!response.ok) {
        throw new Error('Failed to update tags');
      }

      await loadStorytellers();
      clearSelection();
    } catch (error) {
      console.error('Error updating tags:', error);
      alert('Failed to update tags');
    } finally {
      setBulkActionLoading(false);
    }
  };

  const handleBulkAction = async (action: string, value?: boolean | string) => {
    if (!confirm(`Apply "${action}" to ${selectedIds.size} storyteller(s)?`)) return;

    setBulkActionLoading(true);
    try {
      const body: any = {
        profileIds: Array.from(selectedIds),
        action,
      };

      if (typeof value === 'boolean') {
        body.value = value;
      } else if (typeof value === 'string') {
        body.type = value;
      }

      const response = await fetch('/api/storytellers/bulk', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(body),
      });

      if (!response.ok) {
        throw new Error('Failed to perform bulk action');
      }

      await loadStorytellers();
      clearSelection();
    } catch (error) {
      console.error('Error performing bulk action:', error);
      alert('Failed to perform action');
    } finally {
      setBulkActionLoading(false);
    }
  };

  const handleBulkDelete = async () => {
    if (
      !confirm(
        `Are you sure you want to delete ${selectedIds.size} storyteller(s)? This cannot be undone.`
      )
    )
      return;

    setBulkActionLoading(true);
    try {
      const response = await fetch('/api/storytellers/bulk', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          profileIds: Array.from(selectedIds),
          action: 'delete',
        }),
      });

      if (!response.ok) {
        throw new Error('Failed to delete storytellers');
      }

      await loadStorytellers();
      clearSelection();
    } catch (error) {
      console.error('Error deleting storytellers:', error);
      alert('Failed to delete storytellers');
    } finally {
      setBulkActionLoading(false);
    }
  };

  // Quick inline actions
  const handleQuickToggle = async (
    id: string,
    field: 'is_elder' | 'show_in_directory',
    value: boolean
  ) => {
    try {
      const response = await fetch('/api/storytellers', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ id, [field]: value }),
      });

      if (!response.ok) {
        throw new Error('Failed to update');
      }

      // Update local state
      setStorytellers((prev) =>
        prev.map((s) => (s.id === id ? { ...s, [field]: value } : s))
      );
    } catch (error) {
      console.error('Error updating storyteller:', error);
    }
  };

  // Export to CSV
  const exportToCsv = () => {
    const selected = storytellers.filter((s) => selectedIds.has(s.id));
    const data = selected.length > 0 ? selected : storytellers;

    const headers = [
      'Name',
      'Type',
      'Elder',
      'Location',
      'Stories',
      'Interviews',
      'Tags',
      'Created',
    ];

    const rows = data.map((s) => [
      s.preferred_name || s.full_name,
      s.storyteller_type,
      s.is_elder ? 'Yes' : 'No',
      s.location || '',
      s.stories_contributed,
      s.interviews_completed,
      (s.placement_tags || []).join('; '),
      new Date(s.created_at).toLocaleDateString(),
    ]);

    const csv = [headers.join(','), ...rows.map((r) => r.join(','))].join('\n');
    const blob = new Blob([csv], { type: 'text/csv' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `storytellers-${new Date().toISOString().split('T')[0]}.csv`;
    a.click();
    URL.revokeObjectURL(url);
  };

  // Stats
  const stats = useMemo(() => {
    return {
      total: totalCount,
      elders: storytellers.filter((s) => s.is_elder).length,
      withStories: storytellers.filter((s) => s.stories_contributed > 0).length,
      totalStories: storytellers.reduce((sum, s) => sum + (s.stories_contributed || 0), 0),
      totalInterviews: storytellers.reduce((sum, s) => sum + (s.interviews_completed || 0), 0),
    };
  }, [storytellers, totalCount]);

  // Active filters count
  const activeFiltersCount = [
    typeFilter !== 'all',
    tagFilter.length > 0,
    hasStoriesFilter !== 'all',
    searchQuery.trim() !== '',
  ].filter(Boolean).length;

  return (
    <div className="p-6 lg:p-8 max-w-7xl mx-auto">
      {/* Header */}
      <div className="mb-8">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl lg:text-3xl font-bold text-gray-900">Storyteller Management</h1>
            <p className="text-gray-600 mt-1">
              Manage community storytellers, their profiles, and content placement
            </p>
          </div>
          <div className="flex items-center gap-2">
            <Link
              href="/picc/media/upload"
              className="hidden sm:flex items-center gap-2 px-4 py-2 bg-white border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors"
            >
              <Upload className="w-4 h-4" />
              Upload Media
            </Link>
            <Link
              href="/picc/storytellers/new"
              className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
            >
              <Plus className="w-4 h-4" />
              Add Storyteller
            </Link>
          </div>
        </div>

        {/* Quick links */}
        <div className="mt-3 flex flex-wrap items-center gap-2 text-sm">
          <Link
            href="/elders"
            target="_blank"
            className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-amber-50 text-amber-800 border border-amber-100 hover:bg-amber-100"
          >
            <ExternalLink className="w-3 h-3" />
            View Elders Page
          </Link>
          <Link
            href="/picc/stories"
            className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-purple-50 text-purple-800 border border-purple-100 hover:bg-purple-100"
          >
            <BookOpen className="w-3 h-3" />
            Manage Stories
          </Link>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-5 gap-4 mt-6">
          <div className="bg-blue-50 rounded-lg p-4 text-center">
            <div className="text-2xl font-bold text-blue-700">{stats.total}</div>
            <div className="text-sm text-blue-600">Total</div>
          </div>
          <div className="bg-amber-50 rounded-lg p-4 text-center">
            <div className="text-2xl font-bold text-amber-700">{stats.elders}</div>
            <div className="text-sm text-amber-600">Elders</div>
          </div>
          <div className="bg-green-50 rounded-lg p-4 text-center">
            <div className="text-2xl font-bold text-green-700">{stats.withStories}</div>
            <div className="text-sm text-green-600">With Stories</div>
          </div>
          <div className="bg-purple-50 rounded-lg p-4 text-center">
            <div className="text-2xl font-bold text-purple-700">{stats.totalStories}</div>
            <div className="text-sm text-purple-600">Total Stories</div>
          </div>
          <div className="bg-teal-50 rounded-lg p-4 text-center">
            <div className="text-2xl font-bold text-teal-700">{stats.totalInterviews}</div>
            <div className="text-sm text-teal-600">Interviews</div>
          </div>
        </div>
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
                placeholder="Search by name..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
              />
            </div>
          </div>

          {/* Type Filter */}
          <select
            value={typeFilter}
            onChange={(e) => setTypeFilter(e.target.value)}
            className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
          >
            <option value="all">All Types</option>
            {STORYTELLER_TYPES.map((type) => (
              <option key={type.id} value={type.id}>
                {type.label}
              </option>
            ))}
          </select>

          {/* Has Stories Filter */}
          <select
            value={hasStoriesFilter}
            onChange={(e) => setHasStoriesFilter(e.target.value)}
            className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
          >
            <option value="all">Stories: Any</option>
            <option value="yes">Has Stories</option>
            <option value="no">No Stories</option>
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

          {/* View Mode */}
          <div className="flex border border-gray-300 rounded-lg overflow-hidden">
            <button
              onClick={() => setViewMode('table')}
              className={`p-2 ${
                viewMode === 'table'
                  ? 'bg-blue-600 text-white'
                  : 'bg-white text-gray-600 hover:bg-gray-50'
              }`}
              title="Table view"
            >
              <Table2 className="w-5 h-5" />
            </button>
            <button
              onClick={() => setViewMode('grid')}
              className={`p-2 ${
                viewMode === 'grid'
                  ? 'bg-blue-600 text-white'
                  : 'bg-white text-gray-600 hover:bg-gray-50'
              }`}
              title="Grid view"
            >
              <Grid className="w-5 h-5" />
            </button>
            <button
              onClick={() => setViewMode('compact')}
              className={`p-2 ${
                viewMode === 'compact'
                  ? 'bg-blue-600 text-white'
                  : 'bg-white text-gray-600 hover:bg-gray-50'
              }`}
              title="Compact view"
            >
              <List className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Expanded Filters */}
        {showFilters && (
          <div className="mt-4 pt-4 border-t border-gray-200">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              {/* Tag Filter */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Placement Tags
                </label>
                <div className="flex flex-wrap gap-2">
                  {STORYTELLER_PLACEMENT_CATEGORIES.flatMap((cat) => cat.tags)
                    .slice(0, 8)
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

              {/* Sort Options */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Sort By</label>
                <div className="flex gap-2">
                  <select
                    value={sortField}
                    onChange={(e) => setSortField(e.target.value as SortField)}
                    className="flex-1 px-3 py-2 border border-gray-300 rounded-lg text-sm"
                  >
                    <option value="created_at">Date Added</option>
                    <option value="full_name">Name</option>
                    <option value="stories_contributed">Stories</option>
                    <option value="updated_at">Last Updated</option>
                  </select>
                  <button
                    onClick={() => setSortOrder(sortOrder === 'asc' ? 'desc' : 'asc')}
                    className="px-3 py-2 border border-gray-300 rounded-lg hover:bg-gray-50"
                  >
                    {sortOrder === 'asc' ? '↑' : '↓'}
                  </button>
                </div>
              </div>

              {/* Quick Stats */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Showing</label>
                <p className="text-sm text-gray-600">
                  {storytellers.length} of {totalCount} storytellers
                  {selectedIds.size > 0 && (
                    <span className="ml-2 text-blue-600">({selectedIds.size} selected)</span>
                  )}
                </p>
              </div>
            </div>

            {/* Clear Filters */}
            {activeFiltersCount > 0 && (
              <button
                onClick={() => {
                  setSearchQuery('');
                  setTypeFilter('all');
                  setTagFilter([]);
                  setHasStoriesFilter('all');
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
        itemLabel="storyteller"
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
            id: 'set_elder_true',
            label: 'Mark as Elder',
            icon: <UserCheck className="w-4 h-4" />,
            onClick: () => handleBulkAction('set_elder', true),
            loading: bulkActionLoading,
          },
          {
            id: 'set_directory_true',
            label: 'Show in Directory',
            icon: <Eye className="w-4 h-4" />,
            onClick: () => handleBulkAction('set_directory', true),
            loading: bulkActionLoading,
          },
          {
            id: 'export',
            label: 'Export',
            icon: <Download className="w-4 h-4" />,
            onClick: exportToCsv,
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
          <p className="text-gray-500">Loading storytellers...</p>
        </div>
      ) : storytellers.length === 0 ? (
        <div className="text-center py-12 bg-gray-50 rounded-xl">
          <Users className="w-12 h-12 mx-auto text-gray-300 mb-4" />
          <p className="text-gray-700 font-medium mb-1">
            {activeFiltersCount > 0 ? 'No storytellers match your filters' : 'No storytellers yet'}
          </p>
          <p className="text-gray-500 mb-4">
            {activeFiltersCount > 0
              ? 'Try adjusting your filters'
              : 'Add your first storyteller to get started'}
          </p>
          {activeFiltersCount > 0 ? (
            <button
              onClick={() => {
                setSearchQuery('');
                setTypeFilter('all');
                setTagFilter([]);
                setHasStoriesFilter('all');
              }}
              className="px-4 py-2 bg-white border border-gray-300 rounded-lg hover:bg-gray-50"
            >
              Clear filters
            </button>
          ) : (
            <Link
              href="/picc/storytellers/new"
              className="inline-flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
            >
              <Plus className="w-4 h-4" />
              Add Storyteller
            </Link>
          )}
        </div>
      ) : viewMode === 'table' ? (
        /* Table View */
        <div className="bg-white rounded-xl border border-gray-200 overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-gray-50 border-b border-gray-200">
                <tr>
                  <th className="w-12 px-4 py-3">
                    <input
                      type="checkbox"
                      checked={selectedIds.size === storytellers.length && storytellers.length > 0}
                      onChange={toggleSelectAll}
                      className="w-4 h-4 rounded border-gray-300 text-blue-600"
                    />
                  </th>
                  <th className="px-4 py-3 text-left text-sm font-medium text-gray-700">Photo</th>
                  <th className="px-4 py-3 text-left text-sm font-medium text-gray-700">Name</th>
                  <th className="px-4 py-3 text-left text-sm font-medium text-gray-700">Type</th>
                  <th className="px-4 py-3 text-left text-sm font-medium text-gray-700">Tags</th>
                  <th className="px-4 py-3 text-center text-sm font-medium text-gray-700">Stories</th>
                  <th className="px-4 py-3 text-center text-sm font-medium text-gray-700">Interviews</th>
                  <th className="px-4 py-3 text-right text-sm font-medium text-gray-700">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-200">
                {sortedStorytellers.map((storyteller) => (
                  <tr
                    key={storyteller.id}
                    className={`hover:bg-gray-50 ${selectedIds.has(storyteller.id) ? 'bg-blue-50' : ''}`}
                  >
                    <td className="px-4 py-3">
                      <input
                        type="checkbox"
                        checked={selectedIds.has(storyteller.id)}
                        onChange={() => toggleSelect(storyteller.id)}
                        className="w-4 h-4 rounded border-gray-300 text-blue-600"
                      />
                    </td>
                    <td className="px-4 py-3">
                      {storyteller.profile_image_url ? (
                        <img
                          src={storyteller.profile_image_url}
                          alt=""
                          className="w-10 h-10 rounded-full object-cover"
                        />
                      ) : (
                        <div className="w-10 h-10 rounded-full bg-gradient-to-br from-blue-500 to-purple-600 text-white flex items-center justify-center font-bold text-sm">
                          {(storyteller.preferred_name || storyteller.full_name || 'PI')
                            .trim()
                            .slice(0, 2)
                            .toUpperCase()}
                        </div>
                      )}
                    </td>
                    <td className="px-4 py-3">
                      <div>
                        <Link
                          href={`/picc/storytellers/${storyteller.id}`}
                          className="font-medium text-gray-900 hover:text-blue-600"
                        >
                          {storyteller.preferred_name || storyteller.full_name}
                        </Link>
                        {storyteller.location && (
                          <p className="text-xs text-gray-500">{storyteller.location}</p>
                        )}
                      </div>
                    </td>
                    <td className="px-4 py-3">
                      <div className="flex items-center gap-2">
                        <span
                          className={`px-2 py-0.5 text-xs rounded-full ${
                            storyteller.is_elder
                              ? 'bg-amber-100 text-amber-700'
                              : 'bg-gray-100 text-gray-600'
                          }`}
                        >
                          {STORYTELLER_TYPES.find((t) => t.id === storyteller.storyteller_type)
                            ?.label || storyteller.storyteller_type?.replace(/_/g, ' ')}
                        </span>
                        {storyteller.is_elder && (
                          <span className="px-1.5 py-0.5 bg-amber-500 text-white text-xs rounded">
                            Elder
                          </span>
                        )}
                      </div>
                    </td>
                    <td className="px-4 py-3">
                      <div className="flex flex-wrap gap-1 max-w-xs">
                        {(storyteller.placement_tags || []).slice(0, 3).map((tag) => (
                          <span
                            key={tag}
                            className={`px-1.5 py-0.5 text-xs rounded ${getTagColorClass(tag)} ${getTagColorClass(tag, 'text')}`}
                          >
                            {getTagLabel(tag)}
                          </span>
                        ))}
                        {(storyteller.placement_tags || []).length > 3 && (
                          <span className="px-1.5 py-0.5 text-xs text-gray-500">
                            +{(storyteller.placement_tags || []).length - 3}
                          </span>
                        )}
                      </div>
                    </td>
                    <td className="px-4 py-3 text-center">
                      <span className="inline-flex items-center gap-1 text-sm text-gray-600">
                        <BookOpen className="w-4 h-4" />
                        {storyteller.stories_contributed || 0}
                      </span>
                    </td>
                    <td className="px-4 py-3 text-center">
                      <span className="inline-flex items-center gap-1 text-sm text-gray-600">
                        <Mic className="w-4 h-4" />
                        {storyteller.interviews_completed || 0}
                      </span>
                    </td>
                    <td className="px-4 py-3">
                      <div className="flex items-center justify-end gap-1">
                        <Link
                          href={`/picc/storytellers/${storyteller.id}`}
                          className="p-2 text-gray-600 hover:text-gray-900 hover:bg-gray-100 rounded-lg"
                          title="Review"
                        >
                          <Eye className="w-4 h-4" />
                        </Link>
                        <Link
                          href={`/picc/storytellers/${storyteller.id}/edit`}
                          className="p-2 text-gray-600 hover:text-gray-900 hover:bg-gray-100 rounded-lg"
                          title="Edit"
                        >
                          <Edit className="w-4 h-4" />
                        </Link>
                        <Link
                          href={`/picc/storytellers/${storyteller.id}/interviews`}
                          className="p-2 text-gray-600 hover:text-gray-900 hover:bg-gray-100 rounded-lg"
                          title="Interviews"
                        >
                          <FileText className="w-4 h-4" />
                        </Link>
                        <div className="relative">
                          <button
                            onClick={() =>
                              setOpenDropdown(
                                openDropdown === storyteller.id ? null : storyteller.id
                              )
                            }
                            className="p-2 text-gray-600 hover:text-gray-900 hover:bg-gray-100 rounded-lg"
                          >
                            <MoreHorizontal className="w-4 h-4" />
                          </button>
                          {openDropdown === storyteller.id && (
                            <div className="absolute right-0 top-full mt-1 w-48 bg-white border border-gray-200 rounded-lg shadow-lg z-10">
                              <button
                                onClick={() => {
                                  handleQuickToggle(
                                    storyteller.id,
                                    'is_elder',
                                    !storyteller.is_elder
                                  );
                                  setOpenDropdown(null);
                                }}
                                className="w-full px-4 py-2 text-left text-sm hover:bg-gray-50 flex items-center gap-2"
                              >
                                {storyteller.is_elder ? (
                                  <>
                                    <UserX className="w-4 h-4" />
                                    Remove Elder Status
                                  </>
                                ) : (
                                  <>
                                    <UserCheck className="w-4 h-4" />
                                    Mark as Elder
                                  </>
                                )}
                              </button>
                              <button
                                onClick={() => {
                                  handleQuickToggle(
                                    storyteller.id,
                                    'show_in_directory',
                                    !storyteller.show_in_directory
                                  );
                                  setOpenDropdown(null);
                                }}
                                className="w-full px-4 py-2 text-left text-sm hover:bg-gray-50 flex items-center gap-2"
                              >
                                <Eye className="w-4 h-4" />
                                {storyteller.show_in_directory
                                  ? 'Hide from Directory'
                                  : 'Show in Directory'}
                              </button>
                              <Link
                                href={`/wiki/people/${storyteller.id}`}
                                target="_blank"
                                className="w-full px-4 py-2 text-left text-sm hover:bg-gray-50 flex items-center gap-2"
                              >
                                <ExternalLink className="w-4 h-4" />
                                View Public Profile
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
      ) : viewMode === 'grid' ? (
        /* Grid View */
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-4">
          {sortedStorytellers.map((storyteller) => (
            <div
              key={storyteller.id}
              className={`bg-white rounded-xl border overflow-hidden transition-all relative ${
                selectedIds.has(storyteller.id)
                  ? 'border-blue-400 ring-2 ring-blue-200'
                  : 'border-gray-200 hover:border-gray-300'
              }`}
            >
              {/* Selection checkbox */}
              <div className="absolute top-2 left-2 z-10">
                <input
                  type="checkbox"
                  checked={selectedIds.has(storyteller.id)}
                  onChange={() => toggleSelect(storyteller.id)}
                  className="w-5 h-5 rounded border-2 border-white shadow-lg accent-blue-600"
                />
              </div>

              {/* Photo */}
              <div className="relative aspect-square bg-gradient-to-br from-blue-500 to-purple-600">
                {storyteller.profile_image_url ? (
                  <img
                    src={storyteller.profile_image_url}
                    alt=""
                    className="w-full h-full object-cover"
                  />
                ) : (
                  <div className="w-full h-full flex items-center justify-center">
                    <Users className="w-16 h-16 text-white opacity-50" />
                  </div>
                )}
                {storyteller.is_elder && (
                  <div className="absolute top-2 right-2 px-2 py-0.5 bg-amber-500 text-white text-xs rounded">
                    Elder
                  </div>
                )}
              </div>

              {/* Info */}
              <div className="p-3">
                <Link
                  href={`/picc/storytellers/${storyteller.id}`}
                  className="font-medium text-gray-900 hover:text-blue-600 line-clamp-1"
                >
                  {storyteller.preferred_name || storyteller.full_name}
                </Link>
                <p className="text-xs text-gray-500 mt-0.5">
                  {STORYTELLER_TYPES.find((t) => t.id === storyteller.storyteller_type)?.label ||
                    storyteller.storyteller_type?.replace(/_/g, ' ')}
                </p>
                <div className="flex items-center gap-3 mt-2 text-xs text-gray-500">
                  <span className="flex items-center gap-1">
                    <BookOpen className="w-3 h-3" />
                    {storyteller.stories_contributed}
                  </span>
                  <span className="flex items-center gap-1">
                    <Mic className="w-3 h-3" />
                    {storyteller.interviews_completed}
                  </span>
                </div>
                {/* Tags */}
                {(storyteller.placement_tags || []).length > 0 && (
                  <div className="flex flex-wrap gap-1 mt-2">
                    {(storyteller.placement_tags || []).slice(0, 2).map((tag) => (
                      <span
                        key={tag}
                        className={`px-1.5 py-0.5 text-xs rounded ${getTagColorClass(tag)} ${getTagColorClass(tag, 'text')}`}
                      >
                        {getTagLabel(tag)}
                      </span>
                    ))}
                  </div>
                )}
              </div>
            </div>
          ))}
        </div>
      ) : (
        /* Compact View */
        <div className="bg-white rounded-xl border border-gray-200 divide-y divide-gray-200">
          {sortedStorytellers.map((storyteller) => (
            <div
              key={storyteller.id}
              className={`flex items-center gap-4 px-4 py-3 hover:bg-gray-50 ${
                selectedIds.has(storyteller.id) ? 'bg-blue-50' : ''
              }`}
            >
              <input
                type="checkbox"
                checked={selectedIds.has(storyteller.id)}
                onChange={() => toggleSelect(storyteller.id)}
                className="w-4 h-4 rounded border-gray-300 text-blue-600"
              />
              {storyteller.profile_image_url ? (
                <img
                  src={storyteller.profile_image_url}
                  alt=""
                  className="w-8 h-8 rounded-full object-cover"
                />
              ) : (
                <div className="w-8 h-8 rounded-full bg-gradient-to-br from-blue-500 to-purple-600 text-white flex items-center justify-center font-bold text-xs">
                  {(storyteller.preferred_name || storyteller.full_name || 'PI')
                    .trim()
                    .slice(0, 2)
                    .toUpperCase()}
                </div>
              )}
              <div className="flex-1 min-w-0">
                <Link
                  href={`/picc/storytellers/${storyteller.id}`}
                  className="font-medium text-gray-900 hover:text-blue-600"
                >
                  {storyteller.preferred_name || storyteller.full_name}
                </Link>
              </div>
              <span className="text-xs text-gray-500">{storyteller.stories_contributed} stories</span>
              <span className="text-xs text-gray-500">{storyteller.interviews_completed || 0} interviews</span>
              {storyteller.is_elder && (
                <span className="px-1.5 py-0.5 bg-amber-100 text-amber-700 text-xs rounded">
                  Elder
                </span>
              )}
              <Link
                href={`/picc/storytellers/${storyteller.id}/edit`}
                className="p-1 text-gray-400 hover:text-gray-600"
              >
                <Edit className="w-4 h-4" />
              </Link>
            </div>
          ))}
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
              `Load More (${storytellers.length} of ${totalCount})`
            )}
          </button>
        </div>
      )}

      {/* Tag Modal */}
      <BulkTagModal
        isOpen={showTagModal}
        onClose={() => setShowTagModal(false)}
        onApply={handleBulkTags}
        categories={STORYTELLER_PLACEMENT_CATEGORIES}
        selectedCount={selectedIds.size}
        itemLabel="storyteller"
        title="Manage Storyteller Tags"
      />

      {/* Click outside to close dropdown */}
      {openDropdown && (
        <div className="fixed inset-0 z-0" onClick={() => setOpenDropdown(null)} />
      )}
    </div>
  );
}
