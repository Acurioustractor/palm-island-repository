'use client';

import { Suspense, useState, useEffect, useMemo, useRef, useCallback } from 'react';
import { useSearchParams } from 'next/navigation';
import { createClient } from '@/lib/supabase/client';
import Link from 'next/link';
import { VideoEmbed } from '@/components/report/VideoEmbed';
import {
  Image as ImageIcon, Video, Music, File, Search, Filter,
  Grid, List, Sparkles, Users, Tag, MapPin, Calendar,
  ChevronDown, X, Check, Loader2, ArrowLeft, Download,
  Eye, Trash2, Edit, RefreshCw, UserPlus, FolderPlus, Play, XCircle
} from 'lucide-react';
import ServiceTagBar from '@/components/media/ServiceTagBar';
import { TagDots } from '@/components/media/TagChips';
import BulkTagRemoveModal from '@/components/media/BulkTagRemoveModal';
import { ToastProvider, useToast } from '@/components/ui/Toast';

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

interface ServiceTaxonomy {
  id: string;
  service_name: string;
  service_slug: string;
  service_category: string;
}

interface ProjectTaxonomy {
  id: string;
  name: string;
  slug: string;
  project_type?: string | null;
  status?: string | null;
}

export default function MediaGalleryPageWrapper() {
  return (
    <ToastProvider>
      <Suspense fallback={<div className="p-8 text-center text-gray-500">Loading gallery...</div>}>
        <MediaGalleryPage />
      </Suspense>
    </ToastProvider>
  );
}

function MediaGalleryPage() {
  const toast = useToast();
  const [media, setMedia] = useState<MediaFile[]>([]);
  const [profiles, setProfiles] = useState<Profile[]>([]);
  // Sorting
  const [sortBy, setSortBy] = useState<string>('newest');
  // Inline tag editing in detail modal
  const [newTagInput, setNewTagInput] = useState('');
  // Bulk selection: shift+click range and drag-select
  const [lastClickedIndex, setLastClickedIndex] = useState<number | null>(null);
  const [isDragging, setIsDragging] = useState(false);
  const dragStartIndexRef = useRef<number | null>(null);
  const dragSelectedRef = useRef<Set<string>>(new Set());

  const [services, setServices] = useState<ServiceTaxonomy[]>([]);
  const [projects, setProjects] = useState<ProjectTaxonomy[]>([]);
  const [taxonomyLoading, setTaxonomyLoading] = useState(false);
  const [taxonomyError, setTaxonomyError] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const [totalCount, setTotalCount] = useState(0);
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
  const [personFilter, setPersonFilter] = useState<string>('all');
  const [annualReportOnly, setAnnualReportOnly] = useState(false);
  const [annualReportFiscalYear, setAnnualReportFiscalYear] = useState<string>('all');
  const [serviceFilter, setServiceFilter] = useState<string>('all');
  const [projectFilter, setProjectFilter] = useState<string>('all');
  const [eventFilter, setEventFilter] = useState<string>('all');
  const [sectionFilter, setSectionFilter] = useState<string>('all');
  const [contentFilter, setContentFilter] = useState<string>('all');
  const [featuredOnly, setFeaturedOnly] = useState(false);

  // People tagging
  const [showPeopleTag, setShowPeopleTag] = useState(false);
  const [selectedPeople, setSelectedPeople] = useState<string[]>([]);
  const [profileSearch, setProfileSearch] = useState('');

  // Bulk tagging
  const [showBulkTagModal, setShowBulkTagModal] = useState(false);
  const [bulkAnnualReport, setBulkAnnualReport] = useState(false);
  const [bulkFiscalYear, setBulkFiscalYear] = useState<string>('all');
  const [bulkService, setBulkService] = useState<string>('all');
  const [bulkProject, setBulkProject] = useState<string>('all');
  const [bulkTagging, setBulkTagging] = useState(false);

  // Cover photo
  const [showCoverDropdown, setShowCoverDropdown] = useState(false);
  const [settingCover, setSettingCover] = useState(false);

  // Close cover dropdown on outside click
  useEffect(() => {
    if (!showCoverDropdown) return;
    const handler = () => setShowCoverDropdown(false);
    const timer = setTimeout(() => document.addEventListener('click', handler), 0);
    return () => { clearTimeout(timer); document.removeEventListener('click', handler); };
  }, [showCoverDropdown]);

  // Tag removal
  const [showRemoveTagsModal, setShowRemoveTagsModal] = useState(false);
  const [untaggedOnly, setUntaggedOnly] = useState(false);
  const [serviceTagBarLoading, setServiceTagBarLoading] = useState(false);

  // Collections
  const [showCollectionModal, setShowCollectionModal] = useState(false);
  const [collections, setCollections] = useState<any[]>([]);
  const [selectedCollectionId, setSelectedCollectionId] = useState<string>('');
  const [addingToCollection, setAddingToCollection] = useState(false);

  // Read URL params for deep-linking (e.g. ?filter=untagged)
  const searchParams = useSearchParams();
  useEffect(() => {
    const filter = searchParams.get('filter');
    if (filter === 'untagged') {
      setUntaggedOnly(true);
    }
    // Support deep-linking from admin toolbar
    const serviceParam = searchParams.get('serviceFilter');
    if (serviceParam && serviceParam !== 'all') {
      setServiceFilter(serviceParam);
    }
    const annualReportParam = searchParams.get('annualReport');
    if (annualReportParam === 'true') {
      setAnnualReportOnly(true);
    }
  }, [searchParams]);

  // Memoize supabase client to prevent recreation on every render
  const supabase = useMemo(() => createClient(), []);

  const fiscalYearOptions = useMemo(() => {
    const now = new Date();
    const fyStart = now.getMonth() >= 6 ? now.getFullYear() : now.getFullYear() - 1;
    return Array.from({ length: 6 }).map((_, i) => {
      const start = fyStart - i;
      const end = start + 1;
      return `${start}-${String(end).slice(-2)}`;
    });
  }, []);

  const buildMediaQueryUrl = (limit: number, offsetValue: number) => {
    const params = new URLSearchParams();
    params.set('limit', String(limit));
    params.set('offset', String(offsetValue));

    if (fileTypeFilter !== 'all') {
      params.set('fileType', fileTypeFilter);
    }

    const requiredTags: string[] = [];

    if (annualReportOnly) {
      requiredTags.push('annual-report');
      if (annualReportFiscalYear !== 'all') requiredTags.push(`fy:${annualReportFiscalYear}`);
    } else if (tagFilter) {
      requiredTags.push(tagFilter);
    }

    if (serviceFilter !== 'all') requiredTags.push(`service:${serviceFilter}`);
    if (projectFilter !== 'all') requiredTags.push(`project:${projectFilter}`);
    if (eventFilter !== 'all') requiredTags.push(eventFilter);
    if (sectionFilter !== 'all') requiredTags.push(sectionFilter);
    if (contentFilter !== 'all') requiredTags.push(contentFilter);
    if (featuredOnly) params.set('featured', 'true');

    if (requiredTags.length > 0) {
      params.set('tags', requiredTags.join(','));
    }

    if (personFilter !== 'all') {
      params.set('person', personFilter);
    }

    const q = searchQuery.trim();
    if (q) {
      params.set('q', q);
    }

    if (sortBy && sortBy !== 'newest') {
      params.set('sort', sortBy);
    }

    return `/api/media/list?${params.toString()}`;
  };

  useEffect(() => {
    // Failsafe: Force loading to false after 15 seconds no matter what
    const failsafeTimeout = setTimeout(() => {
      console.warn('FAILSAFE: Forcing loading to false after 15 seconds');
      setLoading(false);
    }, 15000);

    // Debounce search - only run query after user stops typing
    const timeoutId = setTimeout(() => {
      const loadData = async () => {
        console.log('Loading media...', {
          fileTypeFilter,
          searchQuery,
          tagFilter,
          personFilter,
          annualReportOnly,
          annualReportFiscalYear,
        });
        setLoading(true);

        try {
          console.log('Loading media via server API...');

          // Fetch first page of media files (200 at a time for faster loading)
          const mediaResponse = await fetch(
            buildMediaQueryUrl(PAGE_SIZE, 0),
            {
              signal: AbortSignal.timeout(5000),
            }
          );

          if (!mediaResponse.ok) {
            const errorText = await mediaResponse.text();
            console.error('Media fetch error:', mediaResponse.status, errorText);
            setMedia([]);
            setOffset(0);
            setHasMore(false);
          } else {
            const payload = await mediaResponse.json().catch(() => ({} as any));
            const mediaData = payload?.data || [];
            const apiTotal = Number(payload?.count || 0);
            console.log('Media fetch SUCCESS!', { count: mediaData?.length, total: apiTotal });
            setMedia(mediaData);
            setTotalCount(apiTotal);
            setOffset(PAGE_SIZE);
            setHasMore(mediaData.length === PAGE_SIZE && apiTotal > PAGE_SIZE);
          }

          // Fetch profiles (also using fetch to avoid hanging)
          console.log('Fetching profiles...');
          const profilesResponse = await fetch(`/api/storytellers`, { signal: AbortSignal.timeout(5000) });

          if (!profilesResponse.ok) {
            console.error('Profiles fetch error:', profilesResponse.status);
          } else {
            const profilePayload = await profilesResponse.json().catch(() => ({} as any));
            const profileData = profilePayload?.data || [];
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
  }, [fileTypeFilter, searchQuery, tagFilter, personFilter, annualReportOnly, annualReportFiscalYear, serviceFilter, projectFilter, eventFilter, sectionFilter, contentFilter, featuredOnly, sortBy, supabase]);

  // Load collections for "Add to Collection" feature
  useEffect(() => {
    const loadCollections = async () => {
      try {
        const response = await fetch(`/api/photo-collections`, { signal: AbortSignal.timeout(5000) });

        if (response.ok) {
          const payload = await response.json().catch(() => ({} as any));
          setCollections(payload?.data || []);
        }
      } catch (err) {
        console.error('Error loading collections:', err);
      }
    };

    loadCollections();
  }, []);

  // Load taxonomy for service/project tagging
  useEffect(() => {
    const loadTaxonomy = async () => {
      setTaxonomyLoading(true);
      setTaxonomyError(null);
      try {
        const res = await fetch('/api/media/taxonomy', { cache: 'no-store' });
        const json = await res.json().catch(() => ({}));
        if (!res.ok) {
          setTaxonomyError(json?.error || 'Failed to load services/projects');
          return;
        }
        setServices(json.services || []);
        setProjects(json.projects || []);
      } catch (e) {
        setTaxonomyError('Failed to load services/projects');
      } finally {
        setTaxonomyLoading(false);
      }
    };
    loadTaxonomy();
  }, []);

  const loadMedia = async () => {
    setLoading(true);

    try {
      const response = await fetch(
        buildMediaQueryUrl(PAGE_SIZE, 0),
        {
          signal: AbortSignal.timeout(5000),
        }
      );

      if (!response.ok) {
        const errorText = await response.text();
        console.error('loadMedia: Fetch error:', response.status, errorText);
        setMedia([]);
        setOffset(0);
        setHasMore(false);
      } else {
        const payload = await response.json().catch(() => ({} as any));
        const data = payload?.data || [];
        const apiTotal = Number(payload?.count || 0);
        console.log('loadMedia: SUCCESS!', { count: data?.length, total: apiTotal });
        setMedia(data);
        setTotalCount(apiTotal);
        setOffset(PAGE_SIZE);
        setHasMore(data.length === PAGE_SIZE && apiTotal > PAGE_SIZE);
      }
    } catch (err) {
      console.error('loadMedia: Error:', err);
      setMedia([]);
      setOffset(0);
      setHasMore(false);
    } finally {
      setLoading(false);
    }
  };

  const loadMore = async () => {
    if (loadingMore || !hasMore) return;

    setLoadingMore(true);

    try {
      console.log('loadMore: Fetching next page...', { offset });

      const response = await fetch(
        buildMediaQueryUrl(PAGE_SIZE, offset),
        {
          signal: AbortSignal.timeout(5000),
        }
      );

      if (!response.ok) {
        const errorText = await response.text();
        console.error('loadMore: Fetch error:', response.status, errorText);
        setHasMore(false);
      } else {
        const payload = await response.json().catch(() => ({} as any));
        const newData = payload?.data || [];
        const totalCount = Number(payload?.count || 0);
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

  const getVideoThumbnail = (item: any): string | null => {
    const meta = item?.metadata || {};
    return meta?.external_video?.thumbnail_url || meta?.thumbnail_url || meta?.thumbnail || null;
  };

  const isExternalVideo = (item: any): boolean => {
    const url = String(item?.public_url || '').toLowerCase();
    if (item?.metadata?.external_video) return true;
    if (url.includes('youtube.com') || url.includes('youtu.be')) return true;
    if (url.includes('vimeo.com')) return true;
    if (url.includes('descript.com')) return true;
    if (url.includes('facebook.com') || url.includes('fb.watch')) return true;
    if (url.includes('tiktok.com')) return true;
    if (item?.file_type === 'video' && !url.match(/\.(mp4|webm|ogg)(\?|#|$)/)) return true;
    return false;
  };

  const updatePeopleTags = async (mediaId: string, peopleIds: string[]) => {
    try {
      const res = await fetch('/api/media/bulk', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ mediaIds: [mediaId], facesDetected: peopleIds }),
      });
      const json = await res.json().catch(() => ({}));
      if (!res.ok) throw new Error(json?.error || 'Failed to update people tags');
      loadMedia();
      if (selectedMedia?.id === mediaId) {
        setSelectedMedia({
          ...selectedMedia,
          faces_detected: peopleIds
        });
      }
    } catch (e) {
      console.error('Failed to update people tags:', e);
    }
  };

  const setCoverPhoto = async (serviceSlug: string) => {
    if (selectedFiles.size !== 1) {
      toast.warning('Select exactly 1 photo to set as cover.');
      return;
    }
    const mediaId = Array.from(selectedFiles)[0];
    setSettingCover(true);
    setShowCoverDropdown(false);
    try {
      const res = await fetch('/api/media/set-cover-photo', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ mediaId, serviceSlug }),
      });
      const json = await res.json().catch(() => ({}));
      if (!res.ok) throw new Error(json?.error || 'Failed to set cover');
      toast.success(`Set as cover for ${serviceSlug}`);
      await loadMedia();
      setSelectedFiles(new Set());
    } catch (err: any) {
      toast.error('Failed to set cover photo', err.message);
    } finally {
      setSettingCover(false);
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

      const res = await fetch('/api/media/bulk', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ mediaIds: idsToDelete, deletedAt: new Date().toISOString() }),
      });
      const json = await res.json().catch(() => ({}));
      if (!res.ok) throw new Error(json?.error || 'Failed to delete photos');

      await loadMedia();
      setSelectedFiles(new Set());
      toast.success(`Deleted ${idsToDelete.length} photos`);
    } catch (err: any) {
      console.error('Delete error:', err);
      toast.error('Failed to delete photos', err.message);
    }

    setIsDeleting(false);
  };

  const handleAddToCollection = async () => {
    if (!selectedCollectionId || selectedFiles.size === 0) {
      toast.warning('Please select a collection');
      return;
    }

    setAddingToCollection(true);

    try {
      const response = await fetch(`/api/photo-collections/${selectedCollectionId}/items`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ mediaIds: Array.from(selectedFiles) }),
        signal: AbortSignal.timeout(10000),
      });

      if (!response.ok) {
        const errorText = await response.text();
        throw new Error(errorText);
      }

      toast.success(`Added ${selectedFiles.size} photos to collection`);
      setSelectedFiles(new Set());
      setShowCollectionModal(false);
      setSelectedCollectionId('');
    } catch (err: any) {
      console.error('Error adding to collection:', err);
      toast.error('Failed to add to collection', err.message);
    }

    setAddingToCollection(false);
  };

  interface BulkTagRequestPayload {
    addTags?: string[];
    mergeMetadata?: Record<string, unknown>;
    mergeContextMetadata?: Record<string, unknown>;
  }

  interface BulkTagHandlerOptions {
    closeModal?: boolean;
    successMessage?: string;
  }

  const eldersTripQuickTags = [
    'project:elders-trips',
    'page:elders',
    'story:elders-trip',
    'service:culture',
  ];

  const buildBulkPayload = (): BulkTagRequestPayload => {
    const addTags: string[] = [];
    const mergeMetadata: Record<string, unknown> = {};
    const mergeContextMetadata: Record<string, unknown> = {};

    if (bulkAnnualReport) {
      addTags.push('annual-report');
      if (bulkFiscalYear !== 'all') {
        addTags.push(`fy:${bulkFiscalYear}`);
        mergeMetadata.fiscal_year = bulkFiscalYear;
      }
    }

    if (bulkService !== 'all') {
      addTags.push(`service:${bulkService}`);
      mergeContextMetadata.service_slug = bulkService;
    }

    if (bulkProject !== 'all') {
      addTags.push(`project:${bulkProject}`);
      mergeContextMetadata.project_slug = bulkProject;
    }

    return {
      addTags,
      mergeMetadata: Object.keys(mergeMetadata).length ? mergeMetadata : undefined,
      mergeContextMetadata: Object.keys(mergeContextMetadata).length ? mergeContextMetadata : undefined,
    };
  };

  const applyBulkTags = async (
    payload?: BulkTagRequestPayload,
    options?: BulkTagHandlerOptions
  ) => {
    if (selectedFiles.size === 0) {
      toast.warning('Select at least one photo before tagging.');
      return;
    }

    const finalPayload = payload ?? buildBulkPayload();
    const hasAddTags = (finalPayload.addTags?.length ?? 0) > 0;
    const hasMergeMetadata = Boolean(finalPayload.mergeMetadata && Object.keys(finalPayload.mergeMetadata).length);
    const hasMergeContext = Boolean(
      finalPayload.mergeContextMetadata && Object.keys(finalPayload.mergeContextMetadata).length
    );

    if (!hasAddTags && !hasMergeMetadata && !hasMergeContext) {
      toast.warning('Choose at least one tag or field to apply.');
      return;
    }

    setBulkTagging(true);
    try {
      const response = await fetch('/api/media/bulk', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          mediaIds: Array.from(selectedFiles),
          addTags: finalPayload.addTags,
          mergeMetadata: finalPayload.mergeMetadata,
          mergeContextMetadata: finalPayload.mergeContextMetadata,
        }),
        signal: AbortSignal.timeout(15000),
      });

      const json = await response.json().catch(() => ({}));
      if (!response.ok) {
        throw new Error(json?.error || 'Bulk update failed');
      }

      const message = options?.successMessage ?? `Updated ${selectedFiles.size} item(s).`;
      toast.success(message);

      if (options?.closeModal ?? true) {
        setShowBulkTagModal(false);
      }
      setSelectedFiles(new Set());
      await loadMedia();
    } catch (err: any) {
      console.error('Bulk tag error:', err);
      toast.error('Failed to apply tags', err?.message || String(err));
    } finally {
      setBulkTagging(false);
    }
  };

  const handleServiceQuickAssign = async (serviceSlug: string) => {
    if (selectedFiles.size === 0) return;
    setServiceTagBarLoading(true);
    try {
      await applyBulkTags(
        { addTags: [`service:${serviceSlug}`], mergeContextMetadata: { service_slug: serviceSlug } },
        { closeModal: false, successMessage: `Tagged ${selectedFiles.size} item(s) with service:${serviceSlug}` }
      );
    } finally {
      setServiceTagBarLoading(false);
    }
  };

  const handleBulkRemoveTags = async (tagsToRemove: string[]) => {
    if (selectedFiles.size === 0 || tagsToRemove.length === 0) return;
    try {
      const response = await fetch('/api/media/bulk', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          mediaIds: Array.from(selectedFiles),
          removeTags: tagsToRemove,
        }),
        signal: AbortSignal.timeout(15000),
      });
      const json = await response.json().catch(() => ({}));
      if (!response.ok) throw new Error(json?.error || 'Failed to remove tags');
      toast.success(`Removed ${tagsToRemove.length} tag(s) from ${selectedFiles.size} item(s)`);
      setSelectedFiles(new Set());
      await loadMedia();
    } catch (err: any) {
      console.error('Remove tags error:', err);
      toast.error('Failed to remove tags', err?.message || String(err));
    }
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
  // Filter media client-side for "untagged" since it's not a server filter
  const displayMedia = untaggedOnly
    ? media.filter(m => !m.tags || !m.tags.some(t => t.startsWith('service:')))
    : media;

  // Drag-to-select handlers
  const handleItemMouseDown = useCallback((e: React.MouseEvent, index: number) => {
    if (e.button !== 0 || e.shiftKey) return;
    const target = e.target as HTMLElement;
    if (target.tagName === 'INPUT' || target.closest('input')) return;
    dragStartIndexRef.current = index;
    dragSelectedRef.current = new Set();
  }, []);

  const handleItemMouseEnter = useCallback((index: number) => {
    if (dragStartIndexRef.current === null) return;
    if (dragStartIndexRef.current !== index && !isDragging) {
      setIsDragging(true);
    }
    if (!isDragging && dragStartIndexRef.current === index) return;
    const start = Math.min(dragStartIndexRef.current, index);
    const end = Math.max(dragStartIndexRef.current, index);
    const newDragSelected = new Set<string>();
    for (let i = start; i <= end; i++) {
      if (displayMedia[i]) newDragSelected.add(displayMedia[i].id);
    }
    dragSelectedRef.current = newDragSelected;
    setSelectedFiles(prev => {
      const merged = new Set(prev);
      newDragSelected.forEach(id => merged.add(id));
      return merged;
    });
  }, [isDragging, displayMedia]);

  useEffect(() => {
    const handleMouseUp = () => {
      if (dragStartIndexRef.current !== null) {
        dragStartIndexRef.current = null;
        dragSelectedRef.current = new Set();
        setIsDragging(false);
      }
    };
    window.addEventListener('mouseup', handleMouseUp);
    return () => window.removeEventListener('mouseup', handleMouseUp);
  }, []);

  // Shift+click range selection — toggle: if all in range are selected, deselect them
  const handleShiftClick = useCallback((index: number) => {
    if (lastClickedIndex === null) return;
    const start = Math.min(lastClickedIndex, index);
    const end = Math.max(lastClickedIndex, index);
    const rangeIds: string[] = [];
    for (let i = start; i <= end; i++) {
      if (displayMedia[i]) rangeIds.push(displayMedia[i].id);
    }
    const allSelected = rangeIds.every(id => selectedFiles.has(id));
    const newSelected = new Set(selectedFiles);
    if (allSelected) {
      rangeIds.forEach(id => newSelected.delete(id));
    } else {
      rangeIds.forEach(id => newSelected.add(id));
    }
    setSelectedFiles(newSelected);
  }, [lastClickedIndex, selectedFiles, displayMedia]);

  const hasActiveFilters =
    fileTypeFilter !== 'all' ||
    Boolean(searchQuery.trim()) ||
    Boolean(tagFilter) ||
    personFilter !== 'all' ||
    annualReportOnly ||
    annualReportFiscalYear !== 'all' ||
    serviceFilter !== 'all' ||
    projectFilter !== 'all' ||
    eventFilter !== 'all' ||
    sectionFilter !== 'all' ||
    contentFilter !== 'all' ||
    featuredOnly ||
    untaggedOnly;

  return (
    <div className="p-6 lg:p-8 max-w-7xl mx-auto">
      {/* Header */}
      <div className="mb-8">
        <Link
          href="/picc/media"
          className="inline-flex items-center gap-2 text-picc-red hover:text-picc-red mb-4"
        >
          <ArrowLeft className="w-4 h-4" />
          Back to Media
        </Link>

          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-2xl lg:text-3xl font-bold text-gray-900">Media Gallery</h1>
              <p className="text-gray-600 mt-1">Browse, tag, and organize your community photos</p>
            </div>
            <div className="flex items-center gap-3">
              <Link
                href="/picc/media/external-videos"
                className="px-4 py-2 bg-white border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors"
              >
                Video links
              </Link>
              <Link
                href="/picc/media/upload"
                className="px-4 py-2 bg-picc-red text-white rounded-lg hover:bg-picc-red transition-colors"
              >
                Upload Media
              </Link>
            </div>
          </div>

        {/* Showing count */}
        {media.length > 0 && (
          <p className="mt-4 text-sm text-gray-500">
            {totalCount.toLocaleString()} total · showing {displayMedia.length}
          </p>
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
                className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-picc-red"
              />
            </div>
          </div>

          {/* File Type Filter */}
          <select
            value={fileTypeFilter}
            onChange={(e) => setFileTypeFilter(e.target.value)}
            className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-picc-red"
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
            className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-picc-red"
            disabled={annualReportOnly}
          >
            <option value="">All Tags</option>
            {allTags.map(tag => (
              <option key={tag} value={tag}>{tag}</option>
            ))}
          </select>

          {/* Person Filter */}
          <select
            value={personFilter}
            onChange={(e) => setPersonFilter(e.target.value)}
            className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-picc-red"
          >
            <option value="all">All People</option>
            {profiles.map((p) => (
              <option key={p.id} value={p.id}>
                {p.preferred_name || p.full_name}
              </option>
            ))}
          </select>

          {/* Sort */}
          <select
            value={sortBy}
            onChange={(e) => setSortBy(e.target.value)}
            className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-picc-red"
          >
            <option value="newest">Newest first</option>
            <option value="oldest">Oldest first</option>
            <option value="filename">Filename A-Z</option>
            <option value="size">Largest first</option>
          </select>

          {/* View Mode */}
          <div className="flex border border-gray-300 rounded-lg overflow-hidden">
            <button
              onClick={() => setViewMode('grid')}
              className={`p-2 ${viewMode === 'grid' ? 'bg-picc-red text-white' : 'bg-white text-gray-600 hover:bg-gray-50'}`}
            >
              <Grid className="w-5 h-5" />
            </button>
            <button
              onClick={() => setViewMode('list')}
              className={`p-2 ${viewMode === 'list' ? 'bg-picc-red text-white' : 'bg-white text-gray-600 hover:bg-gray-50'}`}
            >
              <List className="w-5 h-5" />
            </button>
          </div>
        </div>

        {taxonomyError && (
          <div className="mt-3 text-sm text-red-600 flex items-center justify-between gap-3">
            <span>Service/Project lists failed to load: {taxonomyError}</span>
            <button
              type="button"
              onClick={() => window.location.reload()}
              className="px-3 py-1 border border-red-200 rounded-lg hover:bg-red-50"
            >
              Retry
            </button>
          </div>
        )}

        {/* Annual report quick filters */}
        <div className="mt-4 flex flex-wrap items-end gap-4">
          <label className="flex items-center gap-2 text-sm text-gray-700">
            <input
              type="checkbox"
              checked={annualReportOnly}
              onChange={(e) => {
                const checked = e.target.checked;
                setAnnualReportOnly(checked);
                if (!checked) setAnnualReportFiscalYear('all');
              }}
              className="w-4 h-4 rounded border-gray-300 text-picc-red focus:ring-2 focus:ring-picc-red"
            />
            Annual report media
          </label>

          <div>
            <div className="text-xs text-gray-500 mb-1">Fiscal year</div>
            <select
              value={annualReportFiscalYear}
              onChange={(e) => setAnnualReportFiscalYear(e.target.value)}
              disabled={!annualReportOnly}
              className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-picc-red disabled:bg-gray-100"
            >
              <option value="all">All Years</option>
              {fiscalYearOptions.map((fy) => (
                <option key={fy} value={fy}>
                  {fy}
                </option>
              ))}
            </select>
          </div>

          <button
            type="button"
            onClick={() => {
              setAnnualReportOnly(true);
              setAnnualReportFiscalYear(fiscalYearOptions[0] || 'all');
              setTagFilter('');
            }}
            className="px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50 text-sm"
          >
            Quick: this FY
          </button>

          <div>
            <div className="text-xs text-gray-500 mb-1">Service</div>
            <select
              value={serviceFilter}
              onChange={(e) => setServiceFilter(e.target.value)}
              className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-picc-red"
            >
              <option value="all">All Services</option>
              {taxonomyLoading && services.length === 0 && (
                <option value="loading" disabled>
                  Loading…
                </option>
              )}
              {!taxonomyLoading && services.length === 0 && (
                <option value="none" disabled>
                  No services found
                </option>
              )}
              {services.map((s) => (
                <option key={s.id} value={s.service_slug}>
                  {s.service_name}
                </option>
              ))}
            </select>
          </div>

          <div>
            <div className="text-xs text-gray-500 mb-1">Project</div>
            <select
              value={projectFilter}
              onChange={(e) => setProjectFilter(e.target.value)}
              className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-picc-red"
            >
              <option value="all">All Projects</option>
              {taxonomyLoading && projects.length === 0 && (
                <option value="loading" disabled>
                  Loading…
                </option>
              )}
              {!taxonomyLoading && projects.length === 0 && (
                <option value="none" disabled>
                  No projects found
                </option>
              )}
              {projects.map((p) => (
                <option key={p.id} value={p.slug}>
                  {p.name}
                </option>
              ))}
            </select>
          </div>

          <label className="flex items-center gap-2 text-sm text-gray-700 pb-1">
            <input
              type="checkbox"
              checked={untaggedOnly}
              onChange={(e) => setUntaggedOnly(e.target.checked)}
              className="w-4 h-4 rounded border-gray-300 text-orange-600 focus:ring-2 focus:ring-orange-500"
            />
            Untagged (no service)
          </label>

          <div className="flex items-center gap-2 pb-1">
            <Link href="/picc/projects" className="text-sm text-picc-red hover:text-picc-red">
              Manage projects
            </Link>
            <span className="text-gray-300">•</span>
            <Link href="/picc/services" className="text-sm text-picc-red hover:text-picc-red">
              Manage services
            </Link>
          </div>
        </div>

        {/* Event, Section, Content & Featured filters */}
        <div className="mt-4 flex flex-wrap items-end gap-4">
          <div>
            <div className="text-xs text-gray-500 mb-1">Event</div>
            <select
              value={eventFilter}
              onChange={(e) => setEventFilter(e.target.value)}
              className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-picc-red"
            >
              <option value="all">All Events</option>
              <option value="event:spring-festival-2025">Spring Festival 2025</option>
              <option value="event:daycare-opening-2025">Daycare Opening 2025</option>
              <option value="event:community-visit-jun-2025">Community Visit Jun 2025</option>
              <option value="event:photo-shoot-oct-2025">Photo Shoot Oct 2025</option>
            </select>
          </div>

          <div>
            <div className="text-xs text-gray-500 mb-1">Report Section</div>
            <select
              value={sectionFilter}
              onChange={(e) => setSectionFilter(e.target.value)}
              className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-picc-red"
            >
              <option value="all">All Sections</option>
              <option value="section:cover">Covers</option>
              <option value="section:ceo-message">CEO Messages</option>
              <option value="section:chair-message">Chair Messages</option>
              <option value="section:board">Board Members</option>
              <option value="section:governance">Governance</option>
              <option value="section:service-report">Service Reports</option>
              <option value="section:statistics">Statistics &amp; Data</option>
              <option value="section:highlights">Highlights</option>
            </select>
          </div>

          <div>
            <div className="text-xs text-gray-500 mb-1">Content</div>
            <select
              value={contentFilter}
              onChange={(e) => setContentFilter(e.target.value)}
              className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-picc-red"
            >
              <option value="all">All Content</option>
              <optgroup label="Subject">
                <option value="content:portrait">Portraits</option>
                <option value="content:group">Group Shots</option>
                <option value="content:elders">Elders</option>
                <option value="content:youth">Youth</option>
                <option value="content:children">Children</option>
                <option value="content:art">Art &amp; Culture</option>
              </optgroup>
              <optgroup label="Setting">
                <option value="content:indoor">Indoor</option>
                <option value="content:outdoor">Outdoor</option>
                <option value="content:nature">Nature</option>
                <option value="setting:on-country">On Country</option>
                <option value="setting:photobooth">Photobooth</option>
              </optgroup>
              <optgroup label="Quality">
                <option value="quality:professional">Professional</option>
                <option value="content:documentary">Documentary</option>
              </optgroup>
            </select>
          </div>

          <label className="flex items-center gap-2 text-sm text-gray-700 pb-1">
            <input
              type="checkbox"
              checked={featuredOnly}
              onChange={(e) => setFeaturedOnly(e.target.checked)}
              className="w-4 h-4 rounded border-gray-300 text-yellow-600 focus:ring-2 focus:ring-yellow-500"
            />
            Featured only ⭐
          </label>
        </div>
      </div>

      {/* Clear All Filters */}
      {hasActiveFilters && (
        <button
          onClick={() => {
            setSearchQuery(''); setFileTypeFilter('all'); setTagFilter('');
            setPersonFilter('all'); setAnnualReportOnly(false);
            setAnnualReportFiscalYear('all'); setServiceFilter('all');
            setProjectFilter('all'); setEventFilter('all');
            setSectionFilter('all'); setContentFilter('all');
            setFeaturedOnly(false); setUntaggedOnly(false);
          }}
          className="mb-4 px-4 py-2 bg-orange-100 text-orange-800 rounded-full text-sm font-medium hover:bg-orange-200"
        >
          Clear all filters ×
        </button>
      )}

      {/* Service Quick-Assign Bar */}
      <ServiceTagBar
        services={services}
        selectedCount={selectedFiles.size}
        loading={serviceTagBarLoading}
        onAssign={handleServiceQuickAssign}
      />

      {/* Bulk Actions Bar */}
      {displayMedia.length > 0 && (
        <div className="bg-white rounded-xl border border-gray-200 p-4 mb-4 shadow-sm">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <label className="flex items-center gap-2 cursor-pointer">
                <input
                  type="checkbox"
                  checked={selectedFiles.size === displayMedia.length && displayMedia.length > 0}
                  onChange={toggleSelectAll}
                  className="w-5 h-5 rounded border-gray-300 text-picc-red focus:ring-2 focus:ring-picc-red"
                />
                <span className="text-sm font-medium text-gray-700">
                  {selectedFiles.size === 0 ? 'Select All' : `${selectedFiles.size} selected`}
                </span>
              </label>
              <span className="text-xs text-gray-400 hidden md:inline">
                Shift+click for range · Drag across to select multiple
              </span>
            </div>

            {selectedFiles.size > 0 && (
              <div className="flex gap-2">
                <button
                  onClick={() =>
                    applyBulkTags(
                      { addTags: eldersTripQuickTags },
                      {
                        closeModal: false,
                        successMessage: `Elders trip tags applied to ${selectedFiles.size} item(s).`,
                      }
                    )
                  }
                  disabled={bulkTagging}
                  className="flex items-center gap-2 px-4 py-2 bg-picc-ochre text-white rounded-lg hover:bg-picc-ochre transition-colors disabled:opacity-50"
                >
                  <Sparkles className="w-4 h-4" />
                  Quick Tag Elders Trip
                </button>
                <button
                  onClick={() => {
                    setBulkAnnualReport(annualReportOnly);
                    setBulkFiscalYear(
                      annualReportFiscalYear !== 'all'
                        ? annualReportFiscalYear
                        : (fiscalYearOptions[0] || 'all')
                    );
                    setBulkService(serviceFilter);
                    setBulkProject(projectFilter);
                    setShowBulkTagModal(true);
                  }}
                  className="flex items-center gap-2 px-4 py-2 bg-picc-red text-white rounded-lg hover:bg-picc-red transition-colors"
                >
                  <Tag className="w-4 h-4" />
                  Bulk Tag
                </button>
                <button
                  onClick={() => setShowRemoveTagsModal(true)}
                  className="flex items-center gap-2 px-4 py-2 bg-orange-500 text-white rounded-lg hover:bg-orange-600 transition-colors"
                >
                  <XCircle className="w-4 h-4" />
                  Remove Tags
                </button>
                <button
                  onClick={() => setShowCollectionModal(true)}
                  className="flex items-center gap-2 px-4 py-2 bg-sage-600 text-white rounded-lg hover:bg-sage-700 transition-colors"
                >
                  <FolderPlus className="w-4 h-4" />
                  Add to Collection
                </button>
                {/* Set as Cover Photo */}
                {selectedFiles.size === 1 && (
                  <div className="relative">
                    <button
                      onClick={() => setShowCoverDropdown(!showCoverDropdown)}
                      disabled={settingCover}
                      className="flex items-center gap-2 px-4 py-2 bg-picc-ochre text-white rounded-lg hover:opacity-90 transition-colors disabled:opacity-50"
                    >
                      {settingCover ? (
                        <Loader2 className="w-4 h-4 animate-spin" />
                      ) : (
                        <ImageIcon className="w-4 h-4" />
                      )}
                      Set as Cover
                    </button>
                    {showCoverDropdown && (
                      <div className="absolute top-full left-0 mt-1 bg-white border border-gray-200 rounded-lg shadow-lg z-50 w-64 max-h-80 overflow-y-auto">
                        <div className="p-2 text-xs text-gray-500 font-medium border-b">Select service:</div>
                        {services.map(svc => (
                          <button
                            key={svc.id}
                            onClick={() => setCoverPhoto(svc.service_slug)}
                            className="w-full text-left px-3 py-2 text-sm hover:bg-warm-50 transition-colors"
                          >
                            {svc.service_name}
                            <span className="text-xs text-gray-400 ml-1">({svc.service_category})</span>
                          </button>
                        ))}
                      </div>
                    )}
                  </div>
                )}
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


      {/* Content */}
      {loading ? (
        <div className="text-center py-12">
          <Loader2 className="w-8 h-8 animate-spin mx-auto text-picc-red mb-2" />
          <p className="text-gray-500">Loading media...</p>
        </div>
      ) : media.length === 0 ? (
        <div className="text-center py-12 bg-gray-50 rounded-xl">
          <ImageIcon className="w-12 h-12 mx-auto text-gray-300 mb-4" />
          <p className="text-gray-700 font-medium mb-1">
            {hasActiveFilters ? 'No media matches your filters' : 'No media found'}
          </p>
          <p className="text-gray-500 mb-4">
            {hasActiveFilters
              ? 'Try clearing filters, then use Bulk Tag to add Service/Project/FY tags to your photos.'
              : 'Upload your first photo to get started.'}
          </p>
          <div className="flex items-center justify-center gap-3">
            {hasActiveFilters ? (
              <button
                type="button"
                onClick={() => {
                  setSearchQuery(''); setFileTypeFilter('all'); setTagFilter('');
                  setPersonFilter('all'); setAnnualReportOnly(false);
                  setAnnualReportFiscalYear('all'); setServiceFilter('all');
                  setProjectFilter('all'); setEventFilter('all');
                  setSectionFilter('all'); setContentFilter('all');
                  setFeaturedOnly(false); setUntaggedOnly(false);
                }}
                className="px-4 py-2 bg-white border border-gray-300 rounded-lg hover:bg-gray-50"
              >
                Clear filters
              </button>
            ) : (
              <Link
                href="/picc/media/upload"
                className="px-4 py-2 bg-picc-red text-white rounded-lg hover:bg-picc-red transition-colors"
              >
                Upload photos
              </Link>
            )}
            <Link
              href="/picc/media/gallery"
              className="px-4 py-2 text-picc-red hover:text-picc-red"
            >
              Refresh
            </Link>
          </div>
        </div>
      ) : viewMode === 'grid' ? (
        <div
          className={`grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-4 ${isDragging ? 'select-none' : ''}`}
        >
          {displayMedia.map((item, idx) => {
            const Icon = getFileIcon(item.file_type);
            const isAnalyzing = analyzing === item.id;

            return (
              <div
                key={item.id}
                onClick={(e) => {
                  if (isDragging) return; // Don't open modal at end of drag
                  if (e.shiftKey) {
                    e.preventDefault();
                    handleShiftClick(idx);
                    setLastClickedIndex(idx);
                    return;
                  }
                  setSelectedMedia(item); setNewTagInput('');
                }}
                onMouseDown={(e) => handleItemMouseDown(e, idx)}
                onMouseEnter={() => handleItemMouseEnter(idx)}
                className={`group relative aspect-square bg-gray-100 rounded-lg overflow-hidden cursor-pointer transition-all ${
                  selectedFiles.has(item.id) ? 'ring-2 ring-picc-red' : 'hover:ring-2 hover:ring-picc-red'
                }`}
              >
                {/* Selection Checkbox */}
                <div className="absolute top-2 left-2 z-20">
                  <input
                    type="checkbox"
                    checked={selectedFiles.has(item.id)}
                    onChange={(e) => {
                      e.stopPropagation();
                      if (e.nativeEvent instanceof MouseEvent && e.nativeEvent.shiftKey) {
                        handleShiftClick(idx);
                      } else {
                        toggleSelect(item.id);
                      }
                      setLastClickedIndex(idx);
                    }}
                    onClick={(e) => e.stopPropagation()}
                    className="w-5 h-5 rounded border-2 border-white shadow-lg cursor-pointer accent-picc-red"
                  />
                </div>

                {item.file_type === 'image' ? (
                  <img
                    src={item.public_url}
                    alt={item.alt_text || item.title || 'Photo'}
                    className="w-full h-full object-cover"
                    loading="lazy"
                  />
                ) : item.file_type === 'video' ? (
                  (() => {
                    const thumb = getVideoThumbnail(item);
                    if (thumb) {
                      return (
                        <div className="relative w-full h-full">
                          <img
                            src={thumb}
                            alt={item.title || 'Video'}
                            className="w-full h-full object-cover"
                            loading="lazy"
                          />
                          <div className="absolute inset-0 bg-black/30" />
                          <div className="absolute inset-0 flex items-center justify-center">
                            <div className="w-14 h-14 bg-white/90 rounded-full flex items-center justify-center">
                              <Play className="w-6 h-6 text-gray-900 ml-1" />
                            </div>
                          </div>
                        </div>
                      );
                    }
                    return (
                      <div className="w-full h-full flex items-center justify-center bg-gray-200">
                        <Icon className="w-12 h-12 text-gray-400" />
                      </div>
                    );
                  })()
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
                    <div className="p-1 bg-picc-ochre rounded-full">
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

                {/* Service tag dots */}
                {item.tags && item.tags.some(t => t.startsWith('service:')) && (
                  <div className="absolute bottom-2 left-2 z-10">
                    <TagDots tags={item.tags} />
                  </div>
                )}

                {/* Cover/Hero Badge */}
                {item.tags && item.tags.includes('hero') && (
                  <div className="absolute top-10 right-2 z-10">
                    <div className="px-2 py-0.5 bg-picc-ochre text-white text-xs rounded-full font-medium">
                      COVER
                    </div>
                  </div>
                )}

                {/* Untagged Badge */}
                {(!item.tags || item.tags.length === 0) && (
                  <div className="absolute top-10 right-2 z-10">
                    <div className="px-2 py-0.5 bg-orange-500 text-white text-xs rounded font-medium">
                      Untagged
                    </div>
                  </div>
                )}

                {/* Elder Approval Badge - moved down slightly to avoid checkbox */}
                {item.requires_elder_approval && (
                  <div className="absolute top-10 left-2">
                    <div className="px-2 py-0.5 bg-picc-ochre text-white text-xs rounded">
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
          {displayMedia.map((item) => {
            const Icon = getFileIcon(item.file_type);

            return (
              <div
                key={item.id}
                onClick={() => { setSelectedMedia(item); setNewTagInput(''); }}
                className="flex items-center gap-4 p-4 bg-white rounded-lg border border-gray-200 hover:border-warm-300 cursor-pointer transition-colors"
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
                  className="w-5 h-5 rounded border-gray-300 cursor-pointer accent-picc-red flex-shrink-0"
                />

                {item.file_type === 'image' ? (
                  <img
                    src={item.public_url}
                    alt={item.alt_text || 'Photo'}
                    className="w-16 h-16 object-cover rounded"
                  />
                ) : item.file_type === 'video' ? (
                  (() => {
                    const thumb = getVideoThumbnail(item);
                    if (thumb) {
                      return (
                        <div className="relative w-16 h-16 rounded overflow-hidden bg-gray-100">
                          <img src={thumb} alt={item.title || 'Video'} className="w-full h-full object-cover" loading="lazy" />
                          <div className="absolute inset-0 bg-black/20" />
                          <div className="absolute inset-0 flex items-center justify-center">
                            <Play className="w-5 h-5 text-white" />
                          </div>
                        </div>
                      );
                    }
                    return (
                      <div className="w-16 h-16 bg-gray-100 rounded flex items-center justify-center">
                        <Icon className="w-8 h-8 text-gray-400" />
                      </div>
                    );
                  })()
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
                  <div className="p-2 bg-warm-100 rounded-full">
                    <Sparkles className="w-4 h-4 text-picc-ochre" />
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
            className="px-8 py-3 bg-picc-red text-white rounded-lg hover:bg-picc-red disabled:opacity-50 disabled:cursor-not-allowed transition-colors font-medium inline-flex items-center gap-2"
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

      {showBulkTagModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-xl w-full max-w-lg shadow-xl border border-gray-200">
            <div className="p-6 border-b border-gray-200 flex items-center justify-between">
              <div>
                <h3 className="text-lg font-semibold text-gray-900">Bulk tag {selectedFiles.size} item(s)</h3>
                <p className="text-sm text-gray-600 mt-1">Apply tags and metadata in one click.</p>
              </div>
              <button
                onClick={() => setShowBulkTagModal(false)}
                className="p-2 hover:bg-gray-100 rounded-lg"
                disabled={bulkTagging}
              >
                <X className="w-5 h-5 text-gray-500" />
              </button>
            </div>

            <div className="p-6 space-y-4">
              <label className="flex items-center gap-2 text-sm text-gray-700">
                <input
                  type="checkbox"
                  checked={bulkAnnualReport}
                  onChange={(e) => {
                    const checked = e.target.checked;
                    setBulkAnnualReport(checked);
                    if (!checked) setBulkFiscalYear('all');
                    if (checked && bulkFiscalYear === 'all') setBulkFiscalYear(fiscalYearOptions[0] || 'all');
                  }}
                  className="w-4 h-4 rounded border-gray-300 text-picc-red focus:ring-2 focus:ring-picc-red"
                />
                Mark as Annual Report media
              </label>

              <div>
                <div className="text-xs text-gray-500 mb-1">Fiscal year (optional)</div>
                <select
                  value={bulkFiscalYear}
                  onChange={(e) => setBulkFiscalYear(e.target.value)}
                  disabled={!bulkAnnualReport}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-picc-red disabled:bg-gray-100"
                >
                  <option value="all">No FY tag</option>
                  {fiscalYearOptions.map((fy) => (
                    <option key={fy} value={fy}>
                      {fy}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <div className="text-xs text-gray-500 mb-1">Service</div>
                <select
                  value={bulkService}
                  onChange={(e) => setBulkService(e.target.value)}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-picc-red"
                >
                  <option value="all">No service tag</option>
                  {services.map((s) => (
                    <option key={s.id} value={s.service_slug}>
                      {s.service_name}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <div className="text-xs text-gray-500 mb-1">Project</div>
                <select
                  value={bulkProject}
                  onChange={(e) => setBulkProject(e.target.value)}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-picc-red"
                >
                  <option value="all">No project tag</option>
                  {projects.map((p) => (
                    <option key={p.id} value={p.slug}>
                      {p.name}
                    </option>
                  ))}
                </select>
              </div>
            </div>

            <div className="p-6 border-t border-gray-200 flex items-center justify-end gap-2">
              <button
                onClick={() => setShowBulkTagModal(false)}
                className="px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50"
                disabled={bulkTagging}
              >
                Cancel
              </button>
              <button
                onClick={() => applyBulkTags()}
                disabled={bulkTagging}
                className="px-4 py-2 bg-picc-red text-white rounded-lg hover:bg-picc-red disabled:opacity-50 inline-flex items-center gap-2"
              >
                {bulkTagging ? (
                  <>
                    <Loader2 className="w-4 h-4 animate-spin" />
                    Applying...
                  </>
                ) : (
                  <>
                    <Check className="w-4 h-4" />
                    Apply
                  </>
                )}
              </button>
            </div>
          </div>
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
                isExternalVideo(selectedMedia) ? (
                  <div className="w-full max-w-4xl px-6">
                    <VideoEmbed
                      url={selectedMedia.public_url}
                      title={selectedMedia.title || selectedMedia.original_filename || 'Video'}
                      description={selectedMedia.description || undefined}
                      thumbnail={getVideoThumbnail(selectedMedia) || undefined}
                    />
                  </div>
                ) : (
                  <video
                    src={selectedMedia.public_url}
                    controls
                    className="max-w-full max-h-[85vh]"
                  />
                )
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
                <h2 className="font-semibold text-gray-900">
                  {selectedMedia.file_type === 'video' ? 'Video Details' : 'Photo Details'}
                </h2>
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
                    className="w-full flex items-center justify-center gap-2 px-4 py-2 bg-gradient-to-r from-picc-ochre to-picc-red text-white rounded-lg hover:from-picc-ochre hover:to-picc-red disabled:opacity-50 transition-colors"
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
                    <div className="mt-3 p-3 bg-warm-100 rounded-lg text-sm">
                      <div className="flex items-center gap-2 text-picc-ochre font-medium mb-2">
                        <Sparkles className="w-4 h-4" />
                        AI Analysis
                      </div>
                      {selectedMedia.metadata.ai_analysis.mood && (
                        <p className="text-picc-ochre mb-1">
                          <strong>Mood:</strong> {selectedMedia.metadata.ai_analysis.mood}
                        </p>
                      )}
                      {selectedMedia.metadata.ai_analysis.people_count > 0 && (
                        <p className="text-picc-ochre mb-1">
                          <strong>People:</strong> {selectedMedia.metadata.ai_analysis.people_count} detected
                        </p>
                      )}
                      {selectedMedia.metadata.ai_analysis.suggested_caption && (
                        <p className="text-picc-ochre italic mt-2">
                          "{selectedMedia.metadata.ai_analysis.suggested_caption}"
                        </p>
                      )}
                    </div>
                  )}
                </div>

                {/* Tags — inline editable */}
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
                          className="group/tag inline-flex items-center gap-1 px-2 py-1 bg-warm-100 text-picc-red text-xs rounded-full"
                        >
                          {tag}
                          <button
                            onClick={async (e) => {
                              e.stopPropagation();
                              try {
                                const res = await fetch('/api/media/bulk', {
                                  method: 'POST',
                                  headers: { 'Content-Type': 'application/json' },
                                  body: JSON.stringify({ mediaIds: [selectedMedia.id], removeTags: [tag] }),
                                });
                                if (!res.ok) throw new Error('Failed to remove tag');
                                const updatedTags = (selectedMedia.tags || []).filter(t => t !== tag);
                                setSelectedMedia({ ...selectedMedia, tags: updatedTags });
                                setMedia(prev => prev.map(m => m.id === selectedMedia.id ? { ...m, tags: updatedTags } : m));
                                toast.success(`Removed tag: ${tag}`);
                              } catch (err) {
                                toast.error('Failed to remove tag', String(err));
                              }
                            }}
                            className="opacity-0 group-hover/tag:opacity-100 transition-opacity ml-0.5 hover:text-red-700"
                            title={`Remove ${tag}`}
                          >
                            <X className="w-3 h-3" />
                          </button>
                        </span>
                      ))}
                    </div>
                  ) : (
                    <p className="text-sm text-gray-400">No tags yet</p>
                  )}
                  {/* Add tag input */}
                  <form
                    className="mt-2 flex gap-2"
                    onSubmit={async (e) => {
                      e.preventDefault();
                      const tag = newTagInput.trim();
                      if (!tag) return;
                      try {
                        const res = await fetch('/api/media/bulk', {
                          method: 'POST',
                          headers: { 'Content-Type': 'application/json' },
                          body: JSON.stringify({ mediaIds: [selectedMedia.id], addTags: [tag] }),
                        });
                        if (!res.ok) throw new Error('Failed to add tag');
                        const updatedTags = [...(selectedMedia.tags || []), tag];
                        setSelectedMedia({ ...selectedMedia, tags: updatedTags });
                        setMedia(prev => prev.map(m => m.id === selectedMedia.id ? { ...m, tags: updatedTags } : m));
                        setNewTagInput('');
                        toast.success(`Added tag: ${tag}`);
                      } catch (err) {
                        toast.error('Failed to add tag', String(err));
                      }
                    }}
                  >
                    <input
                      type="text"
                      value={newTagInput}
                      onChange={(e) => setNewTagInput(e.target.value)}
                      placeholder="Add tag..."
                      className="flex-1 px-3 py-1.5 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-picc-red focus:border-transparent"
                    />
                    <button
                      type="submit"
                      disabled={!newTagInput.trim()}
                      className="px-3 py-1.5 bg-picc-red text-white text-sm rounded-lg hover:bg-picc-red disabled:opacity-50"
                    >
                      Add
                    </button>
                  </form>
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
                      className="text-xs text-picc-red hover:text-picc-red"
                    >
                      <UserPlus className="w-4 h-4" />
                    </button>
                  </div>

                  {showPeopleTag ? (
                    <div className="border border-gray-200 rounded-lg p-3">
                      <input
                        value={profileSearch}
                        onChange={(e) => setProfileSearch(e.target.value)}
                        placeholder="Search people…"
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm mb-3"
                      />
                      <div className="max-h-40 overflow-y-auto space-y-1 mb-3">
                        {profiles
                          .filter((profile) => {
                            const name = (profile.preferred_name || profile.full_name || '').toLowerCase();
                            const q = profileSearch.trim().toLowerCase();
                            return !q || name.includes(q);
                          })
                          .map(profile => (
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
                          className="flex-1 px-3 py-1.5 bg-picc-ochre text-white text-sm rounded hover:bg-picc-ochre"
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
                            className="px-2 py-1 bg-warm-100 text-picc-ochre text-xs rounded-full hover:bg-warm-200"
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

                {/* Video Info */}
                {selectedMedia.file_type === 'video' && (
                  <div className="border-t border-gray-100 pt-4">
                    <div className="flex items-center gap-2 mb-2">
                      <Video className="w-4 h-4 text-gray-400" />
                      <span className="text-sm font-medium text-gray-700">Video</span>
                    </div>
                    {selectedMedia.metadata?.external_video?.platform && (
                      <div className="flex items-center gap-2 mb-2">
                        <span className="px-2 py-0.5 bg-purple-100 text-purple-700 text-xs rounded-full font-medium capitalize">
                          {selectedMedia.metadata.external_video.platform}
                        </span>
                        {selectedMedia.metadata?.external_video?.category && (
                          <span className="px-2 py-0.5 bg-gray-100 text-gray-600 text-xs rounded-full">
                            {selectedMedia.metadata.external_video.category}
                          </span>
                        )}
                      </div>
                    )}
                    <div className="flex gap-2">
                      <a
                        href={selectedMedia.public_url}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="flex-1 text-center px-3 py-1.5 bg-gray-100 text-gray-700 text-xs rounded-lg hover:bg-gray-200"
                      >
                        Open in new tab
                      </a>
                      <button
                        onClick={() => {
                          navigator.clipboard.writeText(selectedMedia.public_url);
                          toast.success('Video URL copied');
                        }}
                        className="flex-1 px-3 py-1.5 bg-gray-100 text-gray-700 text-xs rounded-lg hover:bg-gray-200"
                      >
                        Copy URL
                      </button>
                    </div>
                  </div>
                )}

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
                  <div className="p-3 bg-picc-ochre-50 border border-picc-ochre-200 rounded-lg">
                    <div className="flex items-center gap-2 text-picc-ochre font-medium text-sm mb-1">
                      <Eye className="w-4 h-4" />
                      Requires Elder Review
                    </div>
                    {selectedMedia.metadata?.ai_analysis?.sensitivity_notes && (
                      <p className="text-xs text-picc-ochre">
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
                  {...(isExternalVideo(selectedMedia) ? { target: '_blank', rel: 'noopener noreferrer' } : { download: true })}
                  className="flex-1 flex items-center justify-center gap-2 px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50 text-sm"
                >
                  {isExternalVideo(selectedMedia) ? (
                    <><Play className="w-4 h-4" /> Open Video</>
                  ) : (
                    <><Download className="w-4 h-4" /> Download</>
                  )}
                </a>
                <Link
                  href={`/picc/media/${selectedMedia.id}/edit`}
                  className="flex-1 flex items-center justify-center gap-2 px-4 py-2 bg-picc-red text-white rounded-lg hover:bg-picc-red text-sm"
                >
                  <Edit className="w-4 h-4" />
                  Edit
                </Link>
                <button
                  onClick={async () => {
                    if (!confirm('Delete this photo? This cannot be undone.')) return;
                    try {
                      const res = await fetch('/api/media/bulk', {
                        method: 'POST',
                        headers: { 'Content-Type': 'application/json' },
                        body: JSON.stringify({
                          mediaIds: [selectedMedia.id],
                          deletedAt: new Date().toISOString()
                        }),
                      });
                      if (!res.ok) throw new Error('Failed to delete');
                      setSelectedMedia(null);
                      toast.success('Photo deleted');
                      await loadMedia();
                    } catch (err) {
                      toast.error('Failed to delete', String(err));
                    }
                  }}
                  className="flex items-center justify-center gap-2 px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 text-sm"
                >
                  <Trash2 className="w-4 h-4" />
                  Delete
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Bulk Tag Remove Modal */}
      <BulkTagRemoveModal
        selectedMedia={media.filter(m => selectedFiles.has(m.id))}
        open={showRemoveTagsModal}
        onClose={() => setShowRemoveTagsModal(false)}
        onRemove={handleBulkRemoveTags}
      />

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
                    className="inline-flex items-center gap-2 px-4 py-2 bg-sage-600 text-white rounded-lg hover:bg-sage-700"
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
                          ? 'border-sage-500 bg-sage-50'
                          : 'border-gray-200 hover:border-sage-300'
                      }`}
                    >
                      <input
                        type="radio"
                        name="collection"
                        value={collection.id}
                        checked={selectedCollectionId === collection.id}
                        onChange={(e) => setSelectedCollectionId(e.target.value)}
                        className="w-4 h-4 text-sage-600"
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
                  className="flex-1 px-4 py-2 bg-sage-600 text-white rounded-lg hover:bg-sage-700 disabled:opacity-50 disabled:cursor-not-allowed"
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
