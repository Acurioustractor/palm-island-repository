'use client';

import { useState, useEffect, useMemo } from 'react';
import { createClient } from '@/lib/supabase/client';
import Link from 'next/link';
import {
  Image as ImageIcon, Video, Music, File, Search, Filter,
  Grid, List, Sparkles, Users, Tag, MapPin, Calendar,
  ChevronDown, X, Check, Loader2, ArrowLeft, Download,
  Eye, Trash2, Edit, RefreshCw, UserPlus, FolderPlus
} from 'lucide-react';

interface MediaFile {
  id: string;
  filename: string;
  original_filename: string;
  public_url: string;
  file_type: string;
  mime_type: string;
  file_size: number;
  width?: number;
  height?: number;
  title?: string;
  description?: string;
  alt_text?: string;
  tags?: string[];
  location?: string;
  taken_at?: string;
  faces_detected?: string[];
  requires_elder_approval: boolean;
  is_public: boolean;
  is_featured: boolean;
  created_at: string;
  metadata?: any;
  storyteller?: {
    id: string;
    full_name: string;
    preferred_name?: string;
  };
}

interface Profile {
  id: string;
  full_name: string;
  preferred_name?: string;
}

export default function MediaGalleryPage() {
  const [media, setMedia] = useState<MediaFile[]>([]);
  const [profiles, setProfiles] = useState<Profile[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedMedia, setSelectedMedia] = useState<MediaFile | null>(null);
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid');
  const [analyzing, setAnalyzing] = useState<string | null>(null);
  const [selectedFiles, setSelectedFiles] = useState<Set<string>>(new Set());
  const [isDeleting, setIsDeleting] = useState(false);
  const [hasMore, setHasMore] = useState(true);
  const [loadingMore, setLoadingMore] = useState(false);
  const [offset, setOffset] = useState(0);
  const PAGE_SIZE = 200; // Load 200 photos at a time

  // Filters
  const [searchQuery, setSearchQuery] = useState('');
  const [fileTypeFilter, setFileTypeFilter] = useState<string>('all');
  const [tagFilter, setTagFilter] = useState<string>('');

  // People tagging
  const [showPeopleTag, setShowPeopleTag] = useState(false);
  const [selectedPeople, setSelectedPeople] = useState<string[]>([]);

  // Collections
  const [showCollectionModal, setShowCollectionModal] = useState(false);
  const [collections, setCollections] = useState<any[]>([]);
  const [selectedCollectionId, setSelectedCollectionId] = useState<string>('');
  const [addingToCollection, setAddingToCollection] = useState(false);

  // Memoize supabase client to prevent recreation on every render
  const supabase = useMemo(() => createClient(), []);

  useEffect(() => {
    // Failsafe: Force loading to false after 15 seconds no matter what
    const failsafeTimeout = setTimeout(() => {
      console.warn('FAILSAFE: Forcing loading to false after 15 seconds');
      setLoading(false);
    }, 15000);

    // Debounce search - only run query after user stops typing
    const timeoutId = setTimeout(() => {
      const loadData = async () => {
        console.log('Loading media...', { fileTypeFilter, searchQuery, tagFilter });
        setLoading(true);

        try {
          // Load media
          let query = (supabase as any)
            .from('media_files')
            .select(`
              *,
              storyteller:storyteller_id(id, full_name, preferred_name)
            `)
            .is('deleted_at', null)
            .order('created_at', { ascending: false })
            .limit(1000);

          if (fileTypeFilter !== 'all') {
            query = query.eq('file_type', fileTypeFilter);
          }

          if (searchQuery) {
            query = query.or(`title.ilike.%${searchQuery}%,description.ilike.%${searchQuery}%,original_filename.ilike.%${searchQuery}%`);
          }

          if (tagFilter) {
            query = query.contains('tags', [tagFilter]);
          }

          console.log('Using DIRECT FETCH for media and profiles...');

          const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
          const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

          // Fetch first page of media files (200 at a time for faster loading)
          const mediaResponse = await fetch(
            `${supabaseUrl}/rest/v1/media_files?select=*&deleted_at=is.null&order=created_at.desc&limit=${PAGE_SIZE}&offset=0`,
            {
              headers: {
                'apikey': supabaseKey!,
                'Authorization': `Bearer ${supabaseKey}`,
                'Content-Type': 'application/json',
                'Prefer': 'count=exact', // Get total count
              },
              signal: AbortSignal.timeout(5000),
            }
          );

          if (!mediaResponse.ok) {
            const errorText = await mediaResponse.text();
            console.error('Media fetch error:', mediaResponse.status, errorText);
            setMedia([]);
            setHasMore(false);
          } else {
            const mediaData = await mediaResponse.json();
            const totalCount = parseInt(mediaResponse.headers.get('content-range')?.split('/')[1] || '0');
            console.log('Media fetch SUCCESS!', { count: mediaData?.length, total: totalCount });
            setMedia(mediaData || []);
            setOffset(PAGE_SIZE);
            setHasMore(mediaData.length === PAGE_SIZE && totalCount > PAGE_SIZE);
          }

          // Fetch profiles (also using fetch to avoid hanging)
          console.log('Fetching profiles...');
          const profilesResponse = await fetch(
            `${supabaseUrl}/rest/v1/profiles?select=id,full_name,preferred_name&order=full_name`,
            {
              headers: {
                'apikey': supabaseKey!,
                'Authorization': `Bearer ${supabaseKey}`,
                'Content-Type': 'application/json',
              },
              signal: AbortSignal.timeout(5000),
            }
          );

          if (!profilesResponse.ok) {
            console.error('Profiles fetch error:', profilesResponse.status);
          } else {
            const profileData = await profilesResponse.json();
            console.log('Profiles fetch SUCCESS!', { count: profileData?.length });
            setProfiles(profileData || []);
          }
        } catch (err) {
          console.error('CAUGHT ERROR loading data:', err);
          setMedia([]);
        } finally {
          // ALWAYS set loading to false, even if there's an error
          console.log('Setting loading to false');
          clearTimeout(failsafeTimeout);
          setLoading(false);
        }
      };

      loadData();
    }, searchQuery ? 500 : 0); // 500ms debounce for search, instant for filters

    // Cleanup timeouts on unmount or when dependencies change
    return () => {
      clearTimeout(timeoutId);
      clearTimeout(failsafeTimeout);
    };
  }, [fileTypeFilter, searchQuery, tagFilter, supabase]);

  // Load collections for "Add to Collection" feature
  useEffect(() => {
    const loadCollections = async () => {
      try {
        const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
        const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

        const response = await fetch(
          `${supabaseUrl}/rest/v1/photo_collections?select=id,name,slug,item_count&order=name`,
          {
            headers: {
              'apikey': supabaseKey!,
              'Authorization': `Bearer ${supabaseKey}`,
            },
            signal: AbortSignal.timeout(5000),
          }
        );

        if (response.ok) {
          const data = await response.json();
          setCollections(data || []);
        }
      } catch (err) {
        console.error('Error loading collections:', err);
      }
    };

    loadCollections();
  }, []);

  const loadMedia = async () => {
    setLoading(true);

    try {
      console.log('loadMedia: Using DIRECT FETCH...');

      const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
      const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

      const response = await fetch(
        `${supabaseUrl}/rest/v1/media_files?select=*&deleted_at=is.null&order=created_at.desc&limit=1000`,
        {
          headers: {
            'apikey': supabaseKey!,
            'Authorization': `Bearer ${supabaseKey}`,
            'Content-Type': 'application/json',
          },
          signal: AbortSignal.timeout(5000),
        }
      );

      if (!response.ok) {
        const errorText = await response.text();
        console.error('loadMedia: Fetch error:', response.status, errorText);
        setMedia([]);
      } else {
        const data = await response.json();
        console.log('loadMedia: SUCCESS!', { count: data?.length });
        setMedia(data || []);
      }
    } catch (err) {
      console.error('loadMedia: Error:', err);
      setMedia([]);
    } finally {
      setLoading(false);
    }
  };

  const loadMore = async () => {
    if (loadingMore || !hasMore) return;

    setLoadingMore(true);

    try {
      console.log('loadMore: Fetching next page...', { offset });

      const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
      const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

      const response = await fetch(
        `${supabaseUrl}/rest/v1/media_files?select=*&deleted_at=is.null&order=created_at.desc&limit=${PAGE_SIZE}&offset=${offset}`,
        {
          headers: {
            'apikey': supabaseKey!,
            'Authorization': `Bearer ${supabaseKey}`,
            'Content-Type': 'application/json',
            'Prefer': 'count=exact',
          },
          signal: AbortSignal.timeout(5000),
        }
      );

      if (!response.ok) {
        const errorText = await response.text();
        console.error('loadMore: Fetch error:', response.status, errorText);
        setHasMore(false);
      } else {
        const newData = await response.json();
        const totalCount = parseInt(response.headers.get('content-range')?.split('/')[1] || '0');
        console.log('loadMore: SUCCESS!', { count: newData?.length, total: totalCount, newOffset: offset + PAGE_SIZE });

        // Append new data to existing media
        setMedia(prev => [...prev, ...(newData || [])]);
        setOffset(prev => prev + PAGE_SIZE);
        setHasMore(newData.length === PAGE_SIZE && (offset + PAGE_SIZE) < totalCount);
      }
    } catch (err) {
      console.error('loadMore: Error:', err);
      setHasMore(false);
    } finally {
      setLoadingMore(false);
    }
  };

  const analyzePhoto = async (mediaItem: MediaFile) => {
    setAnalyzing(mediaItem.id);

    try {
      const response = await fetch('/api/media/analyze', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          image_url: mediaItem.public_url,
          media_id: mediaItem.id
        })
      });

      const result = await response.json();

      if (result.success) {
        // Refresh the media list
        loadMedia();

        // Update selected media if it's the one being analyzed
        if (selectedMedia?.id === mediaItem.id) {
          setSelectedMedia({
            ...selectedMedia,
            description: result.analysis.description,
            alt_text: result.analysis.alt_text,
            tags: result.analysis.suggested_tags,
            metadata: {
              ...selectedMedia.metadata,
              ai_analysis: result.analysis
            }
          });
        }
      }
    } catch (error) {
      console.error('Analysis error:', error);
    }

    setAnalyzing(null);
  };

  const updatePeopleTags = async (mediaId: string, peopleIds: string[]) => {
    const { error } = await (supabase as any)
      .from('media_files')
      .update({ faces_detected: peopleIds })
      .eq('id', mediaId);

    if (!error) {
      loadMedia();
      if (selectedMedia?.id === mediaId) {
        setSelectedMedia({
          ...selectedMedia,
          faces_detected: peopleIds
        });
      }
    }
  };

  const toggleSelectAll = () => {
    if (selectedFiles.size === media.length) {
      setSelectedFiles(new Set());
    } else {
      setSelectedFiles(new Set(media.map(m => m.id)));
    }
  };

  const toggleSelect = (id: string) => {
    const newSelected = new Set(selectedFiles);
    if (newSelected.has(id)) {
      newSelected.delete(id);
    } else {
      newSelected.add(id);
    }
    setSelectedFiles(newSelected);
  };

  const bulkDelete = async () => {
    if (selectedFiles.size === 0) return;
    if (!confirm(`Delete ${selectedFiles.size} photos? This cannot be undone.`)) return;

    setIsDeleting(true);

    try {
      const idsToDelete = Array.from(selectedFiles);

      // Soft delete by setting deleted_at timestamp
      const { error } = await (supabase as any)
        .from('media_files')
        .update({ deleted_at: new Date().toISOString() })
        .in('id', idsToDelete);

      if (error) {
        console.error('Delete error:', error);
        alert('Failed to delete photos: ' + error.message);
      } else {
        // Reload media to show updated list
        await loadMedia();
        setSelectedFiles(new Set());
        alert(`Successfully deleted ${idsToDelete.length} photos`);
      }
    } catch (err: any) {
      console.error('Delete error:', err);
      alert('Failed to delete photos: ' + err.message);
    }

    setIsDeleting(false);
  };

  const handleAddToCollection = async () => {
    if (!selectedCollectionId || selectedFiles.size === 0) {
      alert('Please select a collection');
      return;
    }

    setAddingToCollection(true);

    try {
      const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
      const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

      // Prepare collection items data
      const items = Array.from(selectedFiles).map(mediaId => ({
        collection_id: selectedCollectionId,
        media_id: mediaId,
      }));

      const response = await fetch(
        `${supabaseUrl}/rest/v1/collection_items`,
        {
          method: 'POST',
          headers: {
            'apikey': supabaseKey!,
            'Authorization': `Bearer ${supabaseKey}`,
            'Content-Type': 'application/json',
            'Prefer': 'return=minimal',
          },
          body: JSON.stringify(items),
          signal: AbortSignal.timeout(10000),
        }
      );

      if (!response.ok) {
        const errorText = await response.text();
        throw new Error(`Failed to add to collection: ${errorText}`);
      }

      alert(`Successfully added ${selectedFiles.size} photos to collection!`);
      setSelectedFiles(new Set());
      setShowCollectionModal(false);
      setSelectedCollectionId('');
    } catch (err: any) {
      console.error('Error adding to collection:', err);
      alert('Failed to add photos to collection: ' + err.message);
    }

    setAddingToCollection(false);
  };

  const formatFileSize = (bytes: number): string => {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return Math.round(bytes / Math.pow(k, i) * 100) / 100 + ' ' + sizes[i];
  };

  const getFileIcon = (type: string) => {
    switch (type) {
      case 'image': return ImageIcon;
      case 'video': return Video;
      case 'audio': return Music;
      default: return File;
    }
  };

  // Get unique tags from all media
  const allTags = Array.from(new Set(media.flatMap(m => m.tags || [])));

  return (
    <div className="p-6 lg:p-8 max-w-7xl mx-auto">
      {/* Header */}
      <div className="mb-8">
        <Link
          href="/picc/media"
          className="inline-flex items-center gap-2 text-blue-600 hover:text-blue-700 mb-4"
        >
          <ArrowLeft className="w-4 h-4" />
          Back to Media
        </Link>

        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl lg:text-3xl font-bold text-gray-900">Photo Gallery</h1>
            <p className="text-gray-600 mt-1">Browse, tag, and organize your community photos</p>
          </div>
          <Link
            href="/picc/media/upload"
            className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
          >
            Upload Photos
          </Link>
        </div>

        {/* Pagination Info Banner */}
        {media.length > 0 && (
          <div className="mt-4 bg-blue-50 border border-blue-200 rounded-lg p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-blue-900 font-medium">
                  📸 Showing {media.length} photos (Page 1)
                </p>
                <p className="text-blue-700 text-sm mt-1">
                  <strong>Total in database:</strong> 1,214 photos •
                  <strong> Loading:</strong> 200 photos per page •
                  <strong> Scroll down</strong> to load more automatically
                </p>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Filters */}
      <div className="bg-white rounded-xl border border-gray-200 p-4 mb-6 shadow-sm">
        <div className="flex flex-wrap gap-4">
          {/* Search */}
          <div className="flex-1 min-w-[200px]">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
              <input
                type="text"
                placeholder="Search photos..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
              />
            </div>
          </div>

          {/* File Type Filter */}
          <select
            value={fileTypeFilter}
            onChange={(e) => setFileTypeFilter(e.target.value)}
            className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
          >
            <option value="all">All Types</option>
            <option value="image">Images</option>
            <option value="video">Videos</option>
            <option value="audio">Audio</option>
          </select>

          {/* Tag Filter */}
          <select
            value={tagFilter}
            onChange={(e) => setTagFilter(e.target.value)}
            className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
          >
            <option value="">All Tags</option>
            {allTags.map(tag => (
              <option key={tag} value={tag}>{tag}</option>
            ))}
          </select>

          {/* View Mode */}
          <div className="flex border border-gray-300 rounded-lg overflow-hidden">
            <button
              onClick={() => setViewMode('grid')}
              className={`p-2 ${viewMode === 'grid' ? 'bg-blue-600 text-white' : 'bg-white text-gray-600 hover:bg-gray-50'}`}
            >
              <Grid className="w-5 h-5" />
            </button>
            <button
              onClick={() => setViewMode('list')}
              className={`p-2 ${viewMode === 'list' ? 'bg-blue-600 text-white' : 'bg-white text-gray-600 hover:bg-gray-50'}`}
            >
              <List className="w-5 h-5" />
            </button>
          </div>
        </div>
      </div>

      {/* Bulk Actions Bar */}
      {media.length > 0 && (
        <div className="bg-white rounded-xl border border-gray-200 p-4 mb-4 shadow-sm">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <label className="flex items-center gap-2 cursor-pointer">
                <input
                  type="checkbox"
                  checked={selectedFiles.size === media.length && media.length > 0}
                  onChange={toggleSelectAll}
                  className="w-5 h-5 rounded border-gray-300 text-blue-600 focus:ring-2 focus:ring-blue-500"
                />
                <span className="text-sm font-medium text-gray-700">
                  {selectedFiles.size === 0 ? 'Select All' : `${selectedFiles.size} selected`}
                </span>
              </label>
            </div>

            {selectedFiles.size > 0 && (
              <div className="flex gap-2">
                <button
                  onClick={() => setShowCollectionModal(true)}
                  className="flex items-center gap-2 px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors"
                >
                  <FolderPlus className="w-4 h-4" />
                  Add to Collection
                </button>
                <button
                  onClick={bulkDelete}
                  disabled={isDeleting}
                  className="flex items-center gap-2 px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 disabled:opacity-50 transition-colors"
                >
                  {isDeleting ? (
                    <>
                      <Loader2 className="w-4 h-4 animate-spin" />
                      Deleting...
                    </>
                  ) : (
                    <>
                      <Trash2 className="w-4 h-4" />
                      Delete Selected
                    </>
                  )}
                </button>
              </div>
            )}
          </div>
        </div>
      )}

      {/* Stats */}
      <div className="grid grid-cols-4 gap-4 mb-6">
        <div className="bg-purple-50 rounded-lg p-4 text-center">
          <div className="text-2xl font-bold text-purple-700">{media.filter(m => m.file_type === 'image').length}</div>
          <div className="text-sm text-purple-600">Photos</div>
        </div>
        <div className="bg-pink-50 rounded-lg p-4 text-center">
          <div className="text-2xl font-bold text-pink-700">{media.filter(m => m.file_type === 'video').length}</div>
          <div className="text-sm text-pink-600">Videos</div>
        </div>
        <div className="bg-amber-50 rounded-lg p-4 text-center">
          <div className="text-2xl font-bold text-amber-700">{media.filter(m => m.tags && m.tags.length > 0).length}</div>
          <div className="text-sm text-amber-600">Tagged</div>
        </div>
        <div className="bg-teal-50 rounded-lg p-4 text-center">
          <div className="text-2xl font-bold text-teal-700">{media.filter(m => m.faces_detected && m.faces_detected.length > 0).length}</div>
          <div className="text-sm text-teal-600">People Tagged</div>
        </div>
      </div>

      {/* Content */}
      {loading ? (
        <div className="text-center py-12">
          <Loader2 className="w-8 h-8 animate-spin mx-auto text-blue-600 mb-2" />
          <p className="text-gray-500">Loading media...</p>
        </div>
      ) : media.length === 0 ? (
        <div className="text-center py-12 bg-gray-50 rounded-xl">
          <ImageIcon className="w-12 h-12 mx-auto text-gray-300 mb-4" />
          <p className="text-gray-500 mb-4">No media found</p>
          <Link
            href="/picc/media/upload"
            className="text-blue-600 hover:text-blue-700 font-medium"
          >
            Upload your first photo
          </Link>
        </div>
      ) : viewMode === 'grid' ? (
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-4">
          {media.map((item) => {
            const Icon = getFileIcon(item.file_type);
            const isAnalyzing = analyzing === item.id;

            return (
              <div
                key={item.id}
                onClick={() => setSelectedMedia(item)}
                className="group relative aspect-square bg-gray-100 rounded-lg overflow-hidden cursor-pointer hover:ring-2 hover:ring-blue-500 transition-all"
              >
                {/* Selection Checkbox */}
                <div className="absolute top-2 left-2 z-20">
                  <input
                    type="checkbox"
                    checked={selectedFiles.has(item.id)}
                    onChange={(e) => {
                      e.stopPropagation();
                      toggleSelect(item.id);
                    }}
                    onClick={(e) => e.stopPropagation()}
                    className="w-5 h-5 rounded border-2 border-white shadow-lg cursor-pointer accent-blue-600"
                  />
                </div>

                {item.file_type === 'image' ? (
                  <img
                    src={item.public_url}
                    alt={item.alt_text || item.title || 'Photo'}
                    className="w-full h-full object-cover"
                    loading="lazy"
                  />
                ) : (
                  <div className="w-full h-full flex items-center justify-center bg-gray-200">
                    <Icon className="w-12 h-12 text-gray-400" />
                  </div>
                )}

                {/* Overlay */}
                <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity">
                  <div className="absolute bottom-0 left-0 right-0 p-3">
                    <p className="text-white text-sm font-medium truncate">
                      {item.title || item.original_filename}
                    </p>
                    <div className="flex items-center gap-2 mt-1">
                      {item.tags && item.tags.length > 0 && (
                        <span className="text-xs text-white/80 flex items-center gap-1">
                          <Tag className="w-3 h-3" />
                          {item.tags.length}
                        </span>
                      )}
                      {item.faces_detected && item.faces_detected.length > 0 && (
                        <span className="text-xs text-white/80 flex items-center gap-1">
                          <Users className="w-3 h-3" />
                          {item.faces_detected.length}
                        </span>
                      )}
                    </div>
                  </div>
                </div>

                {/* AI Analysis Badge */}
                {item.metadata?.ai_analysis && (
                  <div className="absolute top-2 right-2">
                    <div className="p-1 bg-purple-600 rounded-full">
                      <Sparkles className="w-3 h-3 text-white" />
                    </div>
                  </div>
                )}

                {/* Analyzing Indicator */}
                {isAnalyzing && (
                  <div className="absolute inset-0 bg-black/50 flex items-center justify-center">
                    <Loader2 className="w-8 h-8 text-white animate-spin" />
                  </div>
                )}

                {/* Elder Approval Badge - moved down slightly to avoid checkbox */}
                {item.requires_elder_approval && (
                  <div className="absolute top-10 left-2">
                    <div className="px-2 py-0.5 bg-amber-500 text-white text-xs rounded">
                      Elder Review
                    </div>
                  </div>
                )}
              </div>
            );
          })}
        </div>
      ) : (
        <div className="space-y-2">
          {media.map((item) => {
            const Icon = getFileIcon(item.file_type);

            return (
              <div
                key={item.id}
                onClick={() => setSelectedMedia(item)}
                className="flex items-center gap-4 p-4 bg-white rounded-lg border border-gray-200 hover:border-blue-300 cursor-pointer transition-colors"
              >
                {/* Selection Checkbox */}
                <input
                  type="checkbox"
                  checked={selectedFiles.has(item.id)}
                  onChange={(e) => {
                    e.stopPropagation();
                    toggleSelect(item.id);
                  }}
                  onClick={(e) => e.stopPropagation()}
                  className="w-5 h-5 rounded border-gray-300 cursor-pointer accent-blue-600 flex-shrink-0"
                />

                {item.file_type === 'image' ? (
                  <img
                    src={item.public_url}
                    alt={item.alt_text || 'Photo'}
                    className="w-16 h-16 object-cover rounded"
                  />
                ) : (
                  <div className="w-16 h-16 bg-gray-100 rounded flex items-center justify-center">
                    <Icon className="w-8 h-8 text-gray-400" />
                  </div>
                )}

                <div className="flex-1 min-w-0">
                  <p className="font-medium text-gray-900 truncate">
                    {item.title || item.original_filename}
                  </p>
                  <p className="text-sm text-gray-500 truncate">
                    {item.description || 'No description'}
                  </p>
                  <div className="flex items-center gap-3 mt-1 text-xs text-gray-400">
                    <span>{formatFileSize(item.file_size)}</span>
                    <span>{new Date(item.created_at).toLocaleDateString()}</span>
                    {item.tags && item.tags.length > 0 && (
                      <span className="flex items-center gap-1">
                        <Tag className="w-3 h-3" />
                        {item.tags.slice(0, 3).join(', ')}
                      </span>
                    )}
                  </div>
                </div>

                {item.metadata?.ai_analysis && (
                  <div className="p-2 bg-purple-100 rounded-full">
                    <Sparkles className="w-4 h-4 text-purple-600" />
                  </div>
                )}
              </div>
            );
          })}
        </div>
      )}

      {/* Load More Button */}
      {!loading && hasMore && media.length > 0 && (
        <div className="mt-8 text-center">
          <button
            onClick={loadMore}
            disabled={loadingMore}
            className="px-8 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors font-medium inline-flex items-center gap-2"
          >
            {loadingMore ? (
              <>
                <Loader2 className="w-5 h-5 animate-spin" />
                Loading more photos...
              </>
            ) : (
              <>
                <RefreshCw className="w-5 h-5" />
                Load More ({media.length} of 1,214+ photos)
              </>
            )}
          </button>
        </div>
      )}

      {/* Detail Modal */}
      {selectedMedia && (
        <div className="fixed inset-0 bg-black/80 z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl max-w-5xl w-full max-h-[90vh] overflow-hidden flex">
            {/* Image */}
            <div className="flex-1 bg-black flex items-center justify-center">
              {selectedMedia.file_type === 'image' ? (
                <img
                  src={selectedMedia.public_url}
                  alt={selectedMedia.alt_text || 'Photo'}
                  className="max-w-full max-h-[85vh] object-contain"
                />
              ) : selectedMedia.file_type === 'video' ? (
                <video
                  src={selectedMedia.public_url}
                  controls
                  className="max-w-full max-h-[85vh]"
                />
              ) : (
                <div className="text-white text-center">
                  <File className="w-16 h-16 mx-auto mb-4" />
                  <p>{selectedMedia.original_filename}</p>
                </div>
              )}
            </div>

            {/* Details Panel */}
            <div className="w-96 flex flex-col bg-white">
              {/* Header */}
              <div className="p-4 border-b border-gray-200 flex items-center justify-between">
                <h2 className="font-semibold text-gray-900">Photo Details</h2>
                <button
                  onClick={() => setSelectedMedia(null)}
                  className="p-1 hover:bg-gray-100 rounded"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>

              {/* Content */}
              <div className="flex-1 overflow-y-auto p-4 space-y-6">
                {/* Title & Description */}
                <div>
                  <h3 className="font-medium text-gray-900 mb-1">
                    {selectedMedia.title || selectedMedia.original_filename}
                  </h3>
                  <p className="text-sm text-gray-600">
                    {selectedMedia.description || 'No description yet'}
                  </p>
                </div>

                {/* AI Analysis Button */}
                <div>
                  <button
                    onClick={() => analyzePhoto(selectedMedia)}
                    disabled={analyzing === selectedMedia.id}
                    className="w-full flex items-center justify-center gap-2 px-4 py-2 bg-gradient-to-r from-purple-600 to-pink-600 text-white rounded-lg hover:from-purple-700 hover:to-pink-700 disabled:opacity-50 transition-colors"
                  >
                    {analyzing === selectedMedia.id ? (
                      <>
                        <Loader2 className="w-4 h-4 animate-spin" />
                        Analyzing with AI...
                      </>
                    ) : (
                      <>
                        <Sparkles className="w-4 h-4" />
                        {selectedMedia.metadata?.ai_analysis ? 'Re-analyze with AI' : 'Analyze with AI'}
                      </>
                    )}
                  </button>

                  {selectedMedia.metadata?.ai_analysis && (
                    <div className="mt-3 p-3 bg-purple-50 rounded-lg text-sm">
                      <div className="flex items-center gap-2 text-purple-700 font-medium mb-2">
                        <Sparkles className="w-4 h-4" />
                        AI Analysis
                      </div>
                      {selectedMedia.metadata.ai_analysis.mood && (
                        <p className="text-purple-600 mb-1">
                          <strong>Mood:</strong> {selectedMedia.metadata.ai_analysis.mood}
                        </p>
                      )}
                      {selectedMedia.metadata.ai_analysis.people_count > 0 && (
                        <p className="text-purple-600 mb-1">
                          <strong>People:</strong> {selectedMedia.metadata.ai_analysis.people_count} detected
                        </p>
                      )}
                      {selectedMedia.metadata.ai_analysis.suggested_caption && (
                        <p className="text-purple-600 italic mt-2">
                          "{selectedMedia.metadata.ai_analysis.suggested_caption}"
                        </p>
                      )}
                    </div>
                  )}
                </div>

                {/* Tags */}
                <div>
                  <div className="flex items-center gap-2 mb-2">
                    <Tag className="w-4 h-4 text-gray-400" />
                    <span className="text-sm font-medium text-gray-700">Tags</span>
                  </div>
                  {selectedMedia.tags && selectedMedia.tags.length > 0 ? (
                    <div className="flex flex-wrap gap-2">
                      {selectedMedia.tags.map((tag, idx) => (
                        <span
                          key={idx}
                          className="px-2 py-1 bg-blue-100 text-blue-700 text-xs rounded-full"
                        >
                          {tag}
                        </span>
                      ))}
                    </div>
                  ) : (
                    <p className="text-sm text-gray-400">No tags - use AI to generate</p>
                  )}
                </div>

                {/* People Tagged */}
                <div>
                  <div className="flex items-center justify-between mb-2">
                    <div className="flex items-center gap-2">
                      <Users className="w-4 h-4 text-gray-400" />
                      <span className="text-sm font-medium text-gray-700">People in Photo</span>
                    </div>
                    <button
                      onClick={() => {
                        setSelectedPeople(selectedMedia.faces_detected || []);
                        setShowPeopleTag(true);
                      }}
                      className="text-xs text-blue-600 hover:text-blue-700"
                    >
                      <UserPlus className="w-4 h-4" />
                    </button>
                  </div>

                  {showPeopleTag ? (
                    <div className="border border-gray-200 rounded-lg p-3">
                      <div className="max-h-40 overflow-y-auto space-y-1 mb-3">
                        {profiles.map(profile => (
                          <label
                            key={profile.id}
                            className="flex items-center gap-2 p-2 hover:bg-gray-50 rounded cursor-pointer"
                          >
                            <input
                              type="checkbox"
                              checked={selectedPeople.includes(profile.id)}
                              onChange={(e) => {
                                if (e.target.checked) {
                                  setSelectedPeople([...selectedPeople, profile.id]);
                                } else {
                                  setSelectedPeople(selectedPeople.filter(id => id !== profile.id));
                                }
                              }}
                              className="rounded"
                            />
                            <span className="text-sm">
                              {profile.preferred_name || profile.full_name}
                            </span>
                          </label>
                        ))}
                      </div>
                      <div className="flex gap-2">
                        <button
                          onClick={() => {
                            updatePeopleTags(selectedMedia.id, selectedPeople);
                            setShowPeopleTag(false);
                          }}
                          className="flex-1 px-3 py-1.5 bg-teal-600 text-white text-sm rounded hover:bg-teal-700"
                        >
                          Save
                        </button>
                        <button
                          onClick={() => setShowPeopleTag(false)}
                          className="px-3 py-1.5 border border-gray-300 text-sm rounded hover:bg-gray-50"
                        >
                          Cancel
                        </button>
                      </div>
                    </div>
                  ) : selectedMedia.faces_detected && selectedMedia.faces_detected.length > 0 ? (
                    <div className="flex flex-wrap gap-2">
                      {selectedMedia.faces_detected.map((personId) => {
                        const person = profiles.find(p => p.id === personId);
                        return person ? (
                          <Link
                            key={personId}
                            href={`/picc/storytellers/${personId}`}
                            className="px-2 py-1 bg-teal-100 text-teal-700 text-xs rounded-full hover:bg-teal-200"
                          >
                            {person.preferred_name || person.full_name}
                          </Link>
                        ) : null;
                      })}
                    </div>
                  ) : (
                    <p className="text-sm text-gray-400">No people tagged yet</p>
                  )}
                </div>

                {/* Metadata */}
                <div className="text-xs text-gray-500 space-y-1 border-t border-gray-100 pt-4">
                  <div className="flex justify-between">
                    <span>Size:</span>
                    <span>{formatFileSize(selectedMedia.file_size)}</span>
                  </div>
                  {selectedMedia.width && selectedMedia.height && (
                    <div className="flex justify-between">
                      <span>Dimensions:</span>
                      <span>{selectedMedia.width} × {selectedMedia.height}</span>
                    </div>
                  )}
                  <div className="flex justify-between">
                    <span>Uploaded:</span>
                    <span>{new Date(selectedMedia.created_at).toLocaleDateString()}</span>
                  </div>
                  {selectedMedia.location && (
                    <div className="flex justify-between">
                      <span>Location:</span>
                      <span>{selectedMedia.location}</span>
                    </div>
                  )}
                </div>

                {/* Cultural Sensitivity */}
                {selectedMedia.requires_elder_approval && (
                  <div className="p-3 bg-amber-50 border border-amber-200 rounded-lg">
                    <div className="flex items-center gap-2 text-amber-700 font-medium text-sm mb-1">
                      <Eye className="w-4 h-4" />
                      Requires Elder Review
                    </div>
                    {selectedMedia.metadata?.ai_analysis?.sensitivity_notes && (
                      <p className="text-xs text-amber-600">
                        {selectedMedia.metadata.ai_analysis.sensitivity_notes}
                      </p>
                    )}
                  </div>
                )}
              </div>

              {/* Actions */}
              <div className="p-4 border-t border-gray-200 flex gap-2">
                <a
                  href={selectedMedia.public_url}
                  download
                  className="flex-1 flex items-center justify-center gap-2 px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50 text-sm"
                >
                  <Download className="w-4 h-4" />
                  Download
                </a>
                <Link
                  href={`/picc/media/${selectedMedia.id}/edit`}
                  className="flex-1 flex items-center justify-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 text-sm"
                >
                  <Edit className="w-4 h-4" />
                  Edit
                </Link>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Add to Collection Modal */}
      {showCollectionModal && (
        <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-xl shadow-xl max-w-lg w-full">
            <div className="p-6 border-b border-gray-200">
              <div className="flex items-center justify-between">
                <h2 className="text-xl font-bold text-gray-900">
                  Add to Collection
                </h2>
                <button
                  onClick={() => {
                    setShowCollectionModal(false);
                    setSelectedCollectionId('');
                  }}
                  className="p-2 text-gray-400 hover:text-gray-600"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>
              <p className="text-sm text-gray-600 mt-1">
                Adding {selectedFiles.size} photo{selectedFiles.size !== 1 ? 's' : ''} to a collection
              </p>
            </div>

            <div className="p-6">
              {collections.length === 0 ? (
                <div className="text-center py-8">
                  <FolderPlus className="w-12 h-12 text-gray-400 mx-auto mb-3" />
                  <p className="text-gray-600 mb-4">No collections yet</p>
                  <Link
                    href="/picc/media/collections"
                    className="inline-flex items-center gap-2 px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700"
                  >
                    Create Collection
                  </Link>
                </div>
              ) : (
                <div className="space-y-3">
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Select a collection:
                  </label>
                  {collections.map(collection => (
                    <label
                      key={collection.id}
                      className={`flex items-center gap-3 p-3 border rounded-lg cursor-pointer transition-all ${
                        selectedCollectionId === collection.id
                          ? 'border-green-500 bg-green-50'
                          : 'border-gray-200 hover:border-green-300'
                      }`}
                    >
                      <input
                        type="radio"
                        name="collection"
                        value={collection.id}
                        checked={selectedCollectionId === collection.id}
                        onChange={(e) => setSelectedCollectionId(e.target.value)}
                        className="w-4 h-4 text-green-600"
                      />
                      <div className="flex-1">
                        <div className="font-medium text-gray-900">{collection.name}</div>
                        <div className="text-sm text-gray-500">
                          {collection.item_count || 0} items
                        </div>
                      </div>
                    </label>
                  ))}
                </div>
              )}
            </div>

            {collections.length > 0 && (
              <div className="p-6 border-t border-gray-200 flex gap-3">
                <button
                  onClick={() => {
                    setShowCollectionModal(false);
                    setSelectedCollectionId('');
                  }}
                  className="flex-1 px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50"
                >
                  Cancel
                </button>
                <button
                  onClick={handleAddToCollection}
                  disabled={!selectedCollectionId || addingToCollection}
                  className="flex-1 px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {addingToCollection ? (
                    <>
                      <Loader2 className="w-4 h-4 animate-spin inline mr-2" />
                      Adding...
                    </>
                  ) : (
                    'Add to Collection'
                  )}
                </button>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
