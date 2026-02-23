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
  Eye, Trash2, Edit, RefreshCw, UserPlus, FolderPlus, Play, XCircle,
  RotateCw, RotateCcw, FlipHorizontal2, FlipVertical2, Star
} from 'lucide-react';

const COLOR_LABELS = [
  { key: 'red', hex: '#EF4444', label: 'Red' },
  { key: 'orange', hex: '#F97316', label: 'Orange' },
  { key: 'yellow', hex: '#EAB308', label: 'Yellow' },
  { key: 'green', hex: '#22C55E', label: 'Green' },
  { key: 'blue', hex: '#3B82F6', label: 'Blue' },
  { key: 'purple', hex: '#8B5CF6', label: 'Purple' },
] as const;

const USAGE_TYPES = [
  { key: 'header', label: 'Header / Hero' },
  { key: 'overlay', label: 'Background Overlay' },
  { key: 'story', label: 'Story / Interview' },
  { key: 'training', label: 'Training' },
  { key: 'event', label: 'Event' },
  { key: 'promo', label: 'Promotional' },
] as const;
/** Lazy video thumbnail: renders a real <video> element only when near the viewport */
function VideoThumb({ src, alt, className }: { src: string; alt: string; className?: string }) {
  const containerRef = useRef<HTMLDivElement>(null);
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    const el = containerRef.current;
    if (!el) return;
    const observer = new IntersectionObserver(
      ([entry]) => { if (entry.isIntersecting) { setVisible(true); observer.disconnect(); } },
      { rootMargin: '400px' }
    );
    observer.observe(el);
    return () => observer.disconnect();
  }, []);

  return (
    <div ref={containerRef} className={`relative bg-gray-900 overflow-hidden ${className || ''}`} style={{ minHeight: 80 }}>
      {visible && (
        <video
          src={`${src}#t=0.5`}
          preload="auto"
          muted
          playsInline
          onLoadedData={(e) => { e.currentTarget.currentTime = 0.5; }}
          className="absolute inset-0 w-full h-full object-cover"
        />
      )}
      {!visible && (
        <div className="absolute inset-0 flex items-center justify-center">
          <Video className="w-10 h-10 text-gray-500" />
        </div>
      )}
      <div className="absolute inset-0 bg-black/20 pointer-events-none" />
      <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
        <div className="w-12 h-12 bg-white/90 rounded-full flex items-center justify-center">
          <Play className="w-5 h-5 text-gray-900 ml-0.5" />
        </div>
      </div>
    </div>
  );
}

/** Small video thumbnail for list view */
function VideoThumbSmall({ src, alt }: { src: string; alt: string }) {
  const containerRef = useRef<HTMLDivElement>(null);
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    const el = containerRef.current;
    if (!el) return;
    const observer = new IntersectionObserver(
      ([entry]) => { if (entry.isIntersecting) { setVisible(true); observer.disconnect(); } },
      { rootMargin: '400px' }
    );
    observer.observe(el);
    return () => observer.disconnect();
  }, []);

  return (
    <div ref={containerRef} className="relative w-16 h-16 rounded overflow-hidden bg-gray-900">
      {visible && (
        <video
          src={`${src}#t=0.5`}
          preload="auto"
          muted
          playsInline
          onLoadedData={(e) => { e.currentTarget.currentTime = 0.5; }}
          className="absolute inset-0 w-full h-full object-cover"
        />
      )}
      {!visible && (
        <div className="absolute inset-0 flex items-center justify-center">
          <Video className="w-6 h-6 text-gray-500" />
        </div>
      )}
      <div className="absolute inset-0 bg-black/10 pointer-events-none" />
      <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
        <Play className="w-5 h-5 text-white" />
      </div>
    </div>
  );
}

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
  page_context?: string | null;
  page_section?: string | null;
  display_order?: number;
  rating?: number;
  color_label?: string | null;
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
  // Lightroom-style: focused item for keyboard shortcuts
  const [focusedMediaId, setFocusedMediaId] = useState<string | null>(null);
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
  const [rotating, setRotating] = useState<string | null>(null);
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
  const [roleFilter, setRoleFilter] = useState<string>('all');
  const [usageFilter, setUsageFilter] = useState<string>('all');
  const [featuredOnly, setFeaturedOnly] = useState(false);
  const [minRatingFilter, setMinRatingFilter] = useState(0);
  const [colorLabelFilter, setColorLabelFilter] = useState<string>('');
  const [showAdvancedFilters, setShowAdvancedFilters] = useState(false);

  // Batch AI analysis
  const [batchAnalyzing, setBatchAnalyzing] = useState(false);
  const [batchProgress, setBatchProgress] = useState<{ current: number; total: number } | null>(null);

  // Tag intelligence panel
  const [showIntelPanel, setShowIntelPanel] = useState(false);
  const [tagStats, setTagStats] = useState<{
    total: number; analyzed: number; unanalyzed: number; percentTagged: number;
    noiseTagCount?: number; junkCount?: number;
  } | null>(null);
  const [cleaningTags, setCleaningTags] = useState(false);
  const [cleanupResult, setCleanupResult] = useState<{ cleaned: number; totalTagsRemoved: number } | null>(null);

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
  const [bulkCustomTags, setBulkCustomTags] = useState<string>('');
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
    const fileTypeParam = searchParams.get('fileType');
    if (fileTypeParam && ['image', 'video', 'audio'].includes(fileTypeParam)) {
      setFileTypeFilter(fileTypeParam);
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

    if (tagFilter) {
      requiredTags.push(tagFilter);
    }
    if (annualReportFiscalYear !== 'all') {
      requiredTags.push(`fy:${annualReportFiscalYear}`);
    }

    if (serviceFilter !== 'all') requiredTags.push(`service:${serviceFilter}`);
    if (projectFilter !== 'all') requiredTags.push(`project:${projectFilter}`);
    if (eventFilter !== 'all') requiredTags.push(eventFilter);
    if (sectionFilter !== 'all') requiredTags.push(sectionFilter);
    if (contentFilter !== 'all') requiredTags.push(contentFilter);
    if (roleFilter !== 'all') requiredTags.push(`role:${roleFilter}`);
    if (usageFilter !== 'all') requiredTags.push(`use:${usageFilter}`);
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

    if (minRatingFilter > 0) {
      params.set('minRating', String(minRatingFilter));
    }
    if (colorLabelFilter) {
      params.set('colorLabel', colorLabelFilter);
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
  }, [fileTypeFilter, searchQuery, tagFilter, personFilter, annualReportOnly, annualReportFiscalYear, serviceFilter, projectFilter, eventFilter, sectionFilter, contentFilter, roleFilter, featuredOnly, sortBy, minRatingFilter, colorLabelFilter, supabase]);

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

  const loadAll = async () => {
    if (loadingMore || !hasMore) return;
    setLoadingMore(true);
    try {
      let currentOffset = offset;
      let allNew: MediaFile[] = [];
      while (true) {
        const response = await fetch(
          buildMediaQueryUrl(500, currentOffset),
          { signal: AbortSignal.timeout(15000) }
        );
        if (!response.ok) break;
        const payload = await response.json().catch(() => ({} as any));
        const newData = payload?.data || [];
        if (newData.length === 0) break;
        allNew = [...allNew, ...newData];
        currentOffset += newData.length;
        if (newData.length < 500) break;
      }
      if (allNew.length > 0) {
        setMedia(prev => [...prev, ...allNew]);
        setOffset(currentOffset);
      }
      setHasMore(false);
    } catch (err) {
      console.error('loadAll error:', err);
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

  const analyzeBatch = async (mode: 'selected' | 'unanalyzed') => {
    setBatchAnalyzing(true);
    setBatchProgress(null);
    try {
      if (mode === 'selected') {
        // Analyze specific selected photos via single-photo endpoint
        const ids = Array.from(selectedFiles);
        const total = ids.length;
        setBatchProgress({ current: 0, total });
        let done = 0;
        for (const id of ids) {
          const item = media.find((m: any) => m.id === id);
          if (!item?.public_url) continue;
          await fetch('/api/media/analyze', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ image_url: item.public_url, media_id: id }),
          });
          done++;
          setBatchProgress({ current: done, total });
        }
        toast.success(`Analyzed ${done} photo(s)`);
        setSelectedFiles(new Set());
      } else {
        // Batch analyze untagged photos
        const limit = 10;
        setBatchProgress({ current: 0, total: limit });

        const response = await fetch('/api/media/batch-analyze', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ limit }),
          signal: AbortSignal.timeout(300000),
        });

        const result = await response.json();
        if (!response.ok) throw new Error(result?.error || 'Batch analysis failed');

        setBatchProgress({ current: result.processed, total: result.processed + result.remaining });
        toast.success(
          `Analyzed ${result.processed} photo(s)` +
          (result.failed > 0 ? ` (${result.failed} failed)` : '') +
          (result.remaining > 0 ? ` — ${result.remaining} remaining` : '')
        );
      }
      await loadMedia();
    } catch (err: any) {
      console.error('Batch analysis error:', err);
      toast.error('Batch analysis failed', err?.message || String(err));
    } finally {
      setBatchAnalyzing(false);
      setBatchProgress(null);
    }
  };

  // Load tag intelligence stats
  const loadTagStats = async () => {
    try {
      const res = await fetch('/api/media/batch-analyze', { signal: AbortSignal.timeout(10000) });
      if (res.ok) {
        const stats = await res.json();
        setTagStats(stats);
      }
    } catch (err) {
      console.error('Failed to load tag stats:', err);
    }
  };

  // Clean noise tags from all media
  const cleanNoiseTags = async () => {
    setCleaningTags(true);
    setCleanupResult(null);
    try {
      const res = await fetch('/api/media/tag-cleanup', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({}),
        signal: AbortSignal.timeout(300000),
      });
      const result = await res.json();
      if (!res.ok) throw new Error(result?.error || 'Cleanup failed');
      setCleanupResult({ cleaned: result.cleaned, totalTagsRemoved: result.totalTagsRemoved });
      toast.success(`Cleaned ${result.cleaned} photos, removed ${result.totalTagsRemoved} noise tags`);
      await loadMedia();
      await loadTagStats();
    } catch (err: any) {
      console.error('Tag cleanup error:', err);
      toast.error('Tag cleanup failed', err?.message || String(err));
    } finally {
      setCleaningTags(false);
    }
  };

  // Run batch AI analysis with auto-polling
  const runBatchAnalysis = async (batchSize: number = 10) => {
    setBatchAnalyzing(true);
    setBatchProgress({ current: 0, total: batchSize });
    let totalProcessed = 0;
    let totalRemaining = 1; // Start with 1 to enter loop

    try {
      while (totalRemaining > 0 && totalProcessed < 50) {
        const res = await fetch('/api/media/batch-analyze', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ limit: batchSize }),
          signal: AbortSignal.timeout(300000),
        });
        const result = await res.json();
        if (!res.ok) throw new Error(result?.error || 'Batch analysis failed');

        totalProcessed += result.processed;
        totalRemaining = result.remaining;
        setBatchProgress({ current: totalProcessed, total: totalProcessed + totalRemaining });

        if (result.processed === 0) break; // No more to process
      }

      toast.success(`AI analyzed ${totalProcessed} photos`);
      await loadMedia();
      await loadTagStats();
    } catch (err: any) {
      console.error('Batch analysis error:', err);
      toast.error('Batch analysis failed', err?.message || String(err));
    } finally {
      setBatchAnalyzing(false);
      setBatchProgress(null);
    }
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

    // Custom free-text tags
    if (bulkCustomTags.trim()) {
      const custom = bulkCustomTags.split(',').map(t => t.trim()).filter(Boolean);
      addTags.push(...custom);
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
        signal: AbortSignal.timeout(120000),
      });

      const json = await response.json().catch(() => ({}));
      if (!response.ok) {
        throw new Error(json?.error || 'Bulk update failed');
      }

      const message = options?.successMessage ?? `Updated ${selectedFiles.size} item(s).`;
      toast.success(message);

      if (options?.closeModal ?? true) {
        setShowBulkTagModal(false);
        setBulkCustomTags('');
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

  // Lightroom-style keyboard shortcuts: 1-5 = rating, 6-9 = color, 0 = clear rating
  useEffect(() => {
    const handleKeyDown = async (e: KeyboardEvent) => {
      // Don't trigger when typing in inputs
      const tag = (e.target as HTMLElement)?.tagName;
      if (tag === 'INPUT' || tag === 'TEXTAREA' || tag === 'SELECT') return;
      // Don't trigger when modal is open
      if (selectedMedia) return;

      const targetIds = focusedMediaId ? [focusedMediaId] : Array.from(selectedFiles);
      if (targetIds.length === 0) return;

      // Rating: 1-5 to set, 0 to clear
      if (/^[0-5]$/.test(e.key) && !e.shiftKey && !e.ctrlKey && !e.metaKey) {
        e.preventDefault();
        const rating = parseInt(e.key);
        try {
          const res = await fetch('/api/media/bulk', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ mediaIds: targetIds, rating }),
          });
          if (!res.ok) throw new Error('Failed');
          const idSet = new Set(targetIds);
          setMedia(prev => prev.map(m => idSet.has(m.id) ? { ...m, rating } : m));
          toast.success(rating > 0 ? `${rating} star${rating > 1 ? 's' : ''}` : 'Rating cleared');
        } catch {
          toast.error('Failed to set rating');
        }
        return;
      }

      // Color labels: 6=red, 7=orange, 8=yellow, 9=green, Shift+0=clear
      const colorMap: Record<string, string | null> = { '6': 'red', '7': 'orange', '8': 'yellow', '9': 'green' };
      if (colorMap[e.key] !== undefined && !e.shiftKey && !e.ctrlKey && !e.metaKey) {
        e.preventDefault();
        const colorLabel = colorMap[e.key];
        try {
          const res = await fetch('/api/media/bulk', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ mediaIds: targetIds, colorLabel }),
          });
          if (!res.ok) throw new Error('Failed');
          const idSet = new Set(targetIds);
          setMedia(prev => prev.map(m => idSet.has(m.id) ? { ...m, color_label: colorLabel } : m));
          const label = COLOR_LABELS.find(c => c.key === colorLabel)?.label || 'Cleared';
          toast.success(label);
        } catch {
          toast.error('Failed to set color');
        }
        return;
      }

      // Shift+6 = blue, Shift+7 = purple, Shift+0 = clear color
      if (e.shiftKey && ['6', '7', '0'].includes(e.key)) {
        e.preventDefault();
        const shiftColorMap: Record<string, string | null> = { '6': 'blue', '7': 'purple', '0': null };
        const colorLabel = shiftColorMap[e.key] ?? null;
        try {
          const res = await fetch('/api/media/bulk', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ mediaIds: targetIds, colorLabel }),
          });
          if (!res.ok) throw new Error('Failed');
          const idSet = new Set(targetIds);
          setMedia(prev => prev.map(m => idSet.has(m.id) ? { ...m, color_label: colorLabel } : m));
          const label = colorLabel ? COLOR_LABELS.find(c => c.key === colorLabel)?.label || '' : 'Color cleared';
          toast.success(label);
        } catch {
          toast.error('Failed to set color');
        }
        return;
      }

      // Arrow keys to navigate focus
      if ((e.key === 'ArrowRight' || e.key === 'ArrowLeft') && focusedMediaId) {
        e.preventDefault();
        const idx = displayMedia.findIndex(m => m.id === focusedMediaId);
        if (idx === -1) return;
        const nextIdx = e.key === 'ArrowRight' ? Math.min(idx + 1, displayMedia.length - 1) : Math.max(idx - 1, 0);
        const next = displayMedia[nextIdx];
        setFocusedMediaId(next.id);
        setSelectedFiles(new Set([next.id]));
        setLastClickedIndex(nextIdx);
        // Scroll into view
        document.querySelector(`[data-media-id="${next.id}"]`)?.scrollIntoView({ block: 'nearest', behavior: 'smooth' });
        return;
      }

      // Enter = open focused item
      if (e.key === 'Enter' && focusedMediaId) {
        e.preventDefault();
        const item = displayMedia.find(m => m.id === focusedMediaId);
        if (item) { setSelectedMedia(item); setNewTagInput(''); }
        return;
      }

      // Escape = clear focus and selection
      if (e.key === 'Escape') {
        setFocusedMediaId(null);
        setSelectedFiles(new Set());
        return;
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [focusedMediaId, selectedFiles, selectedMedia, displayMedia, toast]);

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
    roleFilter !== 'all' ||
    usageFilter !== 'all' ||
    featuredOnly ||
    untaggedOnly ||
    minRatingFilter > 0 ||
    Boolean(colorLabelFilter);

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
              <button
                onClick={() => {
                  setShowIntelPanel(!showIntelPanel);
                  if (!tagStats) loadTagStats();
                }}
                className={`inline-flex items-center gap-2 px-4 py-2 rounded-lg transition-colors ${
                  showIntelPanel
                    ? 'bg-purple-600 text-white'
                    : 'bg-purple-50 border border-purple-200 text-purple-700 hover:bg-purple-100'
                }`}
              >
                <Sparkles className="w-4 h-4" />
                Intelligence
              </button>
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
      <div className="bg-white rounded-xl border border-gray-200 p-3 mb-4 shadow-sm">
        {/* Primary row: Search + essentials */}
        <div className="flex items-center gap-2">
          <div className="flex-1 min-w-[180px]">
            <div className="relative">
              <Search className="absolute left-2.5 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
              <input
                type="text"
                placeholder="Search..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full pl-9 pr-3 py-1.5 text-sm border border-gray-200 rounded-lg focus:ring-2 focus:ring-picc-red focus:border-transparent"
              />
            </div>
          </div>

          <select
            value={fileTypeFilter}
            onChange={(e) => setFileTypeFilter(e.target.value)}
            className="text-sm pl-2.5 pr-7 py-1.5 border border-gray-200 rounded-lg focus:ring-2 focus:ring-picc-red"
          >
            <option value="all">All Types</option>
            <option value="image">Images</option>
            <option value="video">Videos</option>
            <option value="audio">Audio</option>
          </select>

          <select
            value={sortBy}
            onChange={(e) => setSortBy(e.target.value)}
            className="text-sm pl-2.5 pr-7 py-1.5 border border-gray-200 rounded-lg focus:ring-2 focus:ring-picc-red"
          >
            <option value="newest">Newest</option>
            <option value="oldest">Oldest</option>
            <option value="filename">A-Z</option>
            <option value="size">Largest</option>
            <option value="rating">Top Rated</option>
          </select>

          {/* Rating filter inline */}
          <div className="flex items-center gap-0.5 bg-gray-50 rounded-lg px-2 py-1">
            {[1, 2, 3, 4, 5].map((star) => (
              <button
                key={star}
                onClick={() => setMinRatingFilter(minRatingFilter === star ? 0 : star)}
                className="p-0"
                title={`${star}+ stars`}
              >
                <Star className={`w-4 h-4 ${star <= minRatingFilter ? 'fill-amber-400 text-amber-400' : 'text-gray-300 hover:text-amber-300'}`} />
              </button>
            ))}
          </div>

          {/* Color filter inline */}
          <div className="flex items-center gap-1 bg-gray-50 rounded-lg px-2 py-1.5">
            {COLOR_LABELS.map((c) => (
              <button
                key={c.key}
                onClick={() => setColorLabelFilter(colorLabelFilter === c.key ? '' : c.key)}
                title={c.label}
                className={`w-3.5 h-3.5 rounded-full transition-all ${
                  colorLabelFilter === c.key ? 'ring-2 ring-gray-700 ring-offset-1 scale-110' : 'hover:scale-110'
                }`}
                style={{ backgroundColor: c.hex }}
              />
            ))}
          </div>

          {/* View mode */}
          <div className="flex border border-gray-200 rounded-lg overflow-hidden">
            <button
              onClick={() => setViewMode('grid')}
              className={`p-1.5 ${viewMode === 'grid' ? 'bg-picc-red text-white' : 'bg-white text-gray-500 hover:bg-gray-50'}`}
            >
              <Grid className="w-4 h-4" />
            </button>
            <button
              onClick={() => setViewMode('list')}
              className={`p-1.5 ${viewMode === 'list' ? 'bg-picc-red text-white' : 'bg-white text-gray-500 hover:bg-gray-50'}`}
            >
              <List className="w-4 h-4" />
            </button>
          </div>

          {/* More filters toggle */}
          <button
            onClick={() => setShowAdvancedFilters(!showAdvancedFilters)}
            className={`inline-flex items-center gap-1 text-sm px-2.5 py-1.5 rounded-lg transition-colors ${
              showAdvancedFilters ? 'bg-picc-red text-white' : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
            }`}
          >
            <Filter className="w-3.5 h-3.5" />
            More
            <ChevronDown className={`w-3 h-3 transition-transform ${showAdvancedFilters ? 'rotate-180' : ''}`} />
          </button>
        </div>

        {/* Quick chips row */}
        <div className="flex flex-wrap items-center gap-1.5 mt-2">
          {[
            { label: 'Community', tag: 'community' },
            { label: 'Youth', tag: 'youth' },
            { label: 'Culture', tag: 'culture' },
            { label: 'Services', tag: 'services' },
            { label: 'Staff', tag: 'staff' },
            { label: 'Landscape', tag: 'landscape' },
            { label: 'Events', tag: 'event' },
            { label: 'Heroes', tag: 'hero-quality' },
            { label: 'Portraits', tag: 'portrait' },
            { label: 'Groups', tag: 'group' },
          ].map((chip) => (
            <button
              key={chip.tag}
              onClick={() => setTagFilter(tagFilter === chip.tag ? '' : chip.tag)}
              className={`px-2.5 py-1 rounded-full text-xs font-medium transition-colors ${
                tagFilter === chip.tag
                  ? 'bg-picc-red text-white'
                  : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
              }`}
            >
              {chip.label}
            </button>
          ))}
          {/* Service dropdown */}
          <select
            value={serviceFilter}
            onChange={(e) => setServiceFilter(e.target.value)}
            className={`text-xs px-2 py-1 rounded-full border-0 transition-colors cursor-pointer ${
              serviceFilter !== 'all'
                ? 'bg-picc-red text-white font-medium'
                : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
            }`}
          >
            <option value="all">Service...</option>
            {services.map((s) => (
              <option key={s.service_slug} value={s.service_slug}>{s.service_name}</option>
            ))}
          </select>

          {/* Project dropdown */}
          <select
            value={projectFilter}
            onChange={(e) => setProjectFilter(e.target.value)}
            className={`text-xs px-2 py-1 rounded-full border-0 transition-colors cursor-pointer ${
              projectFilter !== 'all'
                ? 'bg-picc-red text-white font-medium'
                : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
            }`}
          >
            <option value="all">Project...</option>
            {projects.map((p) => (
              <option key={p.slug} value={p.slug}>{p.name}</option>
            ))}
          </select>

          {/* Usage dropdown */}
          <select
            value={usageFilter}
            onChange={(e) => setUsageFilter(e.target.value)}
            className={`text-xs px-2 py-1 rounded-full border-0 transition-colors cursor-pointer ${
              usageFilter !== 'all'
                ? 'bg-picc-red text-white font-medium'
                : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
            }`}
          >
            <option value="all">Usage...</option>
            {USAGE_TYPES.map((u) => (
              <option key={u.key} value={u.key}>{u.label}</option>
            ))}
          </select>

          <button
            onClick={() => setFeaturedOnly(!featuredOnly)}
            className={`px-2.5 py-1 rounded-full text-xs font-medium transition-colors ${
              featuredOnly ? 'bg-amber-500 text-white' : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
            }`}
          >
            Featured
          </button>
          <button
            onClick={() => setUntaggedOnly(!untaggedOnly)}
            className={`px-2.5 py-1 rounded-full text-xs font-medium transition-colors ${
              untaggedOnly ? 'bg-orange-500 text-white' : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
            }`}
          >
            Untagged
          </button>

          {hasActiveFilters && (
            <button
              onClick={() => {
                setSearchQuery(''); setFileTypeFilter('all'); setTagFilter('');
                setPersonFilter('all'); setAnnualReportOnly(false);
                setAnnualReportFiscalYear('all'); setServiceFilter('all');
                setProjectFilter('all'); setEventFilter('all');
                setSectionFilter('all'); setContentFilter('all');
                setRoleFilter('all'); setUsageFilter('all');
                setFeaturedOnly(false); setUntaggedOnly(false);
                setMinRatingFilter(0); setColorLabelFilter('');
              }}
              className="px-2.5 py-1 rounded-full text-xs font-medium bg-orange-100 text-orange-700 hover:bg-orange-200 transition-colors"
            >
              Clear all
            </button>
          )}
        </div>

        {/* Secondary filters — Year + Person + Role */}
        {showAdvancedFilters && (
          <div className="mt-3 pt-3 border-t border-gray-100 flex flex-wrap items-end gap-3">
            <div>
              <label className="text-[11px] text-gray-500 mb-0.5 block">Year</label>
              <select value={annualReportFiscalYear} onChange={(e) => setAnnualReportFiscalYear(e.target.value)} className="text-sm pl-2 pr-7 py-1.5 border border-gray-200 rounded-lg">
                <option value="all">All Years</option>
                {fiscalYearOptions.map((fy) => (<option key={fy} value={fy}>{fy}</option>))}
              </select>
            </div>
            <div>
              <label className="text-[11px] text-gray-500 mb-0.5 block">Person</label>
              <select value={personFilter} onChange={(e) => setPersonFilter(e.target.value)} className="text-sm pl-2 pr-7 py-1.5 border border-gray-200 rounded-lg">
                <option value="all">All People</option>
                {profiles.map((p) => (<option key={p.id} value={p.id}>{p.preferred_name || p.full_name}</option>))}
              </select>
            </div>
            <div>
              <label className="text-[11px] text-gray-500 mb-0.5 block">Role</label>
              <select value={roleFilter} onChange={(e) => setRoleFilter(e.target.value)} className="text-sm pl-2 pr-7 py-1.5 border border-gray-200 rounded-lg">
                <option value="all">All Roles</option>
                <option value="board-member">Board Member</option>
                <option value="staff">Staff</option>
                <option value="elder-advisor">Elder Advisor</option>
              </select>
            </div>
          </div>
        )}
      </div>

      {/* AI Intelligence Panel */}
      {showIntelPanel && (
        <div className="bg-gradient-to-r from-purple-50 to-indigo-50 rounded-xl border border-purple-200 p-4 mb-4 shadow-sm">
          <div className="flex items-center justify-between mb-3">
            <div className="flex items-center gap-2">
              <Sparkles className="w-5 h-5 text-purple-600" />
              <h3 className="font-semibold text-purple-900">Media Intelligence</h3>
            </div>
            <button onClick={() => setShowIntelPanel(false)} className="p-1 hover:bg-purple-100 rounded">
              <X className="w-4 h-4 text-purple-400" />
            </button>
          </div>

          {!tagStats ? (
            <div className="flex items-center gap-2 text-sm text-purple-600">
              <Loader2 className="w-4 h-4 animate-spin" />
              Loading stats...
            </div>
          ) : (
            <div className="space-y-4">
              {/* Stats grid */}
              <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                <div className="bg-white/80 rounded-lg p-3">
                  <p className="text-2xl font-bold text-gray-900">{tagStats.total.toLocaleString()}</p>
                  <p className="text-xs text-gray-500">Total photos</p>
                </div>
                <div className="bg-white/80 rounded-lg p-3">
                  <p className="text-2xl font-bold text-green-600">{tagStats.analyzed.toLocaleString()}</p>
                  <p className="text-xs text-gray-500">AI analyzed</p>
                </div>
                <div className="bg-white/80 rounded-lg p-3">
                  <p className="text-2xl font-bold text-orange-600">{tagStats.unanalyzed.toLocaleString()}</p>
                  <p className="text-xs text-gray-500">Need analysis</p>
                </div>
                <div className="bg-white/80 rounded-lg p-3">
                  <p className="text-2xl font-bold text-purple-600">{tagStats.percentTagged}%</p>
                  <p className="text-xs text-gray-500">Coverage</p>
                </div>
              </div>

              {/* Progress bar */}
              <div>
                <div className="flex justify-between text-xs text-gray-500 mb-1">
                  <span>AI Analysis Progress</span>
                  <span>{tagStats.percentTagged}%</span>
                </div>
                <div className="w-full bg-gray-200 rounded-full h-2">
                  <div
                    className="bg-gradient-to-r from-purple-500 to-indigo-500 h-2 rounded-full transition-all duration-500"
                    style={{ width: `${tagStats.percentTagged}%` }}
                  />
                </div>
              </div>

              {/* Action buttons */}
              <div className="flex flex-wrap gap-2">
                <button
                  onClick={cleanNoiseTags}
                  disabled={cleaningTags}
                  className="inline-flex items-center gap-1.5 px-3 py-2 text-sm font-medium bg-white text-orange-700 border border-orange-200 rounded-lg hover:bg-orange-50 disabled:opacity-50 transition-colors"
                >
                  {cleaningTags ? <Loader2 className="w-4 h-4 animate-spin" /> : <Trash2 className="w-4 h-4" />}
                  Clean Noise Tags
                </button>
                <button
                  onClick={() => runBatchAnalysis(10)}
                  disabled={batchAnalyzing}
                  className="inline-flex items-center gap-1.5 px-3 py-2 text-sm font-medium bg-white text-purple-700 border border-purple-200 rounded-lg hover:bg-purple-50 disabled:opacity-50 transition-colors"
                >
                  {batchAnalyzing ? <Loader2 className="w-4 h-4 animate-spin" /> : <Sparkles className="w-4 h-4" />}
                  {batchAnalyzing && batchProgress
                    ? `Analyzing ${batchProgress.current}/${batchProgress.total}...`
                    : `AI Tag ${tagStats.unanalyzed > 0 ? tagStats.unanalyzed.toLocaleString() : 'All'} Photos`
                  }
                </button>
                <button
                  onClick={() => runBatchAnalysis(50)}
                  disabled={batchAnalyzing}
                  className="inline-flex items-center gap-1.5 px-3 py-2 text-sm font-medium bg-purple-600 text-white rounded-lg hover:bg-purple-700 disabled:opacity-50 transition-colors"
                >
                  {batchAnalyzing ? <Loader2 className="w-4 h-4 animate-spin" /> : <RefreshCw className="w-4 h-4" />}
                  Deep Analysis (50 batch)
                </button>
              </div>

              {/* Cleanup result */}
              {cleanupResult && (
                <div className="bg-green-50 border border-green-200 rounded-lg p-3 text-sm text-green-800">
                  <Check className="w-4 h-4 inline mr-1" />
                  Cleaned {cleanupResult.cleaned} photos — removed {cleanupResult.totalTagsRemoved} noise tags
                </div>
              )}

              {/* Batch progress */}
              {batchAnalyzing && batchProgress && (
                <div className="bg-purple-100 border border-purple-200 rounded-lg p-3">
                  <div className="flex justify-between text-xs text-purple-700 mb-1">
                    <span>Processing...</span>
                    <span>{batchProgress.current} / {batchProgress.total}</span>
                  </div>
                  <div className="w-full bg-purple-200 rounded-full h-1.5">
                    <div
                      className="bg-purple-600 h-1.5 rounded-full transition-all duration-300"
                      style={{ width: `${batchProgress.total > 0 ? (batchProgress.current / batchProgress.total) * 100 : 0}%` }}
                    />
                  </div>
                </div>
              )}
            </div>
          )}
        </div>
      )}

      {/* Compact Toolbar */}
      {displayMedia.length > 0 && (
        <div className="bg-white rounded-xl border border-gray-200 px-4 py-2.5 mb-4 shadow-sm">
          <div className="flex items-center gap-3">
            {/* Select all */}
            <label className="flex items-center gap-2 cursor-pointer shrink-0">
              <input
                type="checkbox"
                checked={selectedFiles.size === displayMedia.length && displayMedia.length > 0}
                onChange={toggleSelectAll}
                className="w-4 h-4 rounded border-gray-300 text-picc-red focus:ring-2 focus:ring-picc-red"
              />
              <span className="text-sm font-medium text-gray-700">
                {selectedFiles.size === 0 ? 'All' : `${selectedFiles.size}`}
              </span>
            </label>
            <div className="w-px h-6 bg-gray-200" />
            <span className="text-[11px] text-gray-400 hidden lg:inline shrink-0">
              Click select · Dbl-click open · 1-5 rate · 6-9 color · ←→ nav
            </span>
            <div className="flex-1" />

            {/* Actions — compact */}
            {selectedFiles.size === 0 ? (
              <button
                onClick={() => {
                  setShowIntelPanel(true);
                  if (!tagStats) loadTagStats();
                }}
                title="Open AI Intelligence panel"
                className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium bg-purple-50 text-purple-700 rounded-lg hover:bg-purple-100 transition-colors"
              >
                <Sparkles className="w-3.5 h-3.5" />
                Intelligence
              </button>
            ) : (
              <div className="flex items-center gap-1.5 flex-wrap">
                {/* Inline rating stars */}
                <div className="flex items-center bg-gray-50 rounded-lg px-2 py-1 gap-0.5" title="Set rating (or press 1-5)">
                  {[1, 2, 3, 4, 5].map((star) => (
                    <button
                      key={star}
                      onClick={async () => {
                        try {
                          const res = await fetch('/api/media/bulk', {
                            method: 'POST',
                            headers: { 'Content-Type': 'application/json' },
                            body: JSON.stringify({ mediaIds: Array.from(selectedFiles), rating: star }),
                          });
                          if (!res.ok) throw new Error('Failed');
                          setMedia(prev => prev.map(m => selectedFiles.has(m.id) ? { ...m, rating: star } : m));
                          toast.success(`${star} star${star > 1 ? 's' : ''} → ${selectedFiles.size} items`);
                          setSelectedFiles(new Set());
                        } catch (err: any) {
                          toast.error('Failed to set rating', err?.message || String(err));
                        }
                      }}
                      className="p-0.5 hover:scale-125 transition-transform"
                    >
                      <Star className="w-4 h-4 text-amber-400 hover:fill-amber-400" />
                    </button>
                  ))}
                  <button
                    onClick={async () => {
                      try {
                        const res = await fetch('/api/media/bulk', {
                          method: 'POST',
                          headers: { 'Content-Type': 'application/json' },
                          body: JSON.stringify({ mediaIds: Array.from(selectedFiles), rating: 0 }),
                        });
                        if (!res.ok) throw new Error('Failed');
                        setMedia(prev => prev.map(m => selectedFiles.has(m.id) ? { ...m, rating: 0 } : m));
                        toast.success(`Rating cleared`);
                        setSelectedFiles(new Set());
                      } catch (err: any) {
                        toast.error('Failed', err?.message || String(err));
                      }
                    }}
                    className="ml-0.5 p-0.5 hover:scale-110 transition-transform"
                    title="Clear rating (press 0)"
                  >
                    <X className="w-3.5 h-3.5 text-gray-400" />
                  </button>
                </div>

                {/* Inline color dots */}
                <div className="flex items-center bg-gray-50 rounded-lg px-2 py-1 gap-1" title="Set color (or press 6-9)">
                  {COLOR_LABELS.map((c) => (
                    <button
                      key={c.key}
                      onClick={async () => {
                        try {
                          const res = await fetch('/api/media/bulk', {
                            method: 'POST',
                            headers: { 'Content-Type': 'application/json' },
                            body: JSON.stringify({ mediaIds: Array.from(selectedFiles), colorLabel: c.key }),
                          });
                          if (!res.ok) throw new Error('Failed');
                          setMedia(prev => prev.map(m => selectedFiles.has(m.id) ? { ...m, color_label: c.key } : m));
                          toast.success(`${c.label} → ${selectedFiles.size} items`);
                          setSelectedFiles(new Set());
                        } catch (err: any) {
                          toast.error('Failed', err?.message || String(err));
                        }
                      }}
                      title={c.label}
                      className="w-4 h-4 rounded-full hover:scale-125 transition-transform border border-white shadow-sm"
                      style={{ backgroundColor: c.hex }}
                    />
                  ))}
                  <button
                    onClick={async () => {
                      try {
                        const res = await fetch('/api/media/bulk', {
                          method: 'POST',
                          headers: { 'Content-Type': 'application/json' },
                          body: JSON.stringify({ mediaIds: Array.from(selectedFiles), colorLabel: null }),
                        });
                        if (!res.ok) throw new Error('Failed');
                        setMedia(prev => prev.map(m => selectedFiles.has(m.id) ? { ...m, color_label: null } : m));
                        toast.success(`Color cleared`);
                        setSelectedFiles(new Set());
                      } catch (err: any) {
                        toast.error('Failed', err?.message || String(err));
                      }
                    }}
                    className="p-0.5 hover:scale-110 transition-transform"
                    title="Clear color (Shift+0)"
                  >
                    <X className="w-3.5 h-3.5 text-gray-400" />
                  </button>
                </div>

                <div className="w-px h-5 bg-gray-200" />

                {/* Tag / Service / Collection — small buttons */}
                <button
                  onClick={() => {
                    setBulkAnnualReport(annualReportOnly);
                    setBulkFiscalYear(annualReportFiscalYear !== 'all' ? annualReportFiscalYear : (fiscalYearOptions[0] || 'all'));
                    setBulkService(serviceFilter);
                    setBulkProject(projectFilter);
                    setShowBulkTagModal(true);
                  }}
                  title="Bulk tag"
                  className="inline-flex items-center gap-1.5 px-2.5 py-1.5 text-xs font-medium bg-warm-100 text-picc-red rounded-lg hover:bg-warm-200 transition-colors"
                >
                  <Tag className="w-3.5 h-3.5" /> Tag
                </button>
                <button
                  onClick={() => setShowRemoveTagsModal(true)}
                  title="Remove tags"
                  className="inline-flex items-center px-2 py-1.5 text-xs font-medium bg-orange-50 text-orange-700 rounded-lg hover:bg-orange-100 transition-colors"
                >
                  <XCircle className="w-3.5 h-3.5" />
                </button>

                {/* Service dropdown */}
                <div className="relative group/svc">
                  <button
                    title="Quick assign service"
                    className="inline-flex items-center gap-1 px-2.5 py-1.5 text-xs font-medium bg-gray-50 text-gray-700 rounded-lg hover:bg-gray-100 transition-colors"
                  >
                    <MapPin className="w-3.5 h-3.5" /> Service <ChevronDown className="w-3 h-3" />
                  </button>
                  <div className="hidden group-hover/svc:block absolute top-full right-0 mt-1 bg-white border border-gray-200 rounded-lg shadow-lg z-50 w-64 max-h-60 overflow-y-auto">
                    {services.map(svc => (
                      <button
                        key={svc.id}
                        onClick={() => handleServiceQuickAssign(svc.service_slug)}
                        className="w-full text-left px-3 py-1.5 text-sm hover:bg-warm-50 transition-colors"
                      >
                        {svc.service_name}
                      </button>
                    ))}
                  </div>
                </div>

                {/* Project dropdown */}
                <div className="relative group/prj">
                  <button
                    title="Quick assign project"
                    className="inline-flex items-center gap-1 px-2.5 py-1.5 text-xs font-medium bg-gray-50 text-gray-700 rounded-lg hover:bg-gray-100 transition-colors"
                  >
                    <FolderPlus className="w-3.5 h-3.5" /> Project <ChevronDown className="w-3 h-3" />
                  </button>
                  <div className="hidden group-hover/prj:block absolute top-full right-0 mt-1 bg-white border border-gray-200 rounded-lg shadow-lg z-50 w-64 max-h-60 overflow-y-auto">
                    {projects.map(proj => (
                      <button
                        key={proj.id}
                        onClick={async () => {
                          if (selectedFiles.size === 0) return;
                          try {
                            await applyBulkTags(
                              { addTags: [`project:${proj.slug}`], mergeContextMetadata: { project_slug: proj.slug } },
                              { closeModal: false, successMessage: `Tagged ${selectedFiles.size} item(s) with project:${proj.slug}` }
                            );
                          } catch {}
                        }}
                        className="w-full text-left px-3 py-1.5 text-sm hover:bg-warm-50 transition-colors"
                      >
                        {proj.name}
                      </button>
                    ))}
                  </div>
                </div>

                {/* Usage dropdown */}
                <div className="relative group/use">
                  <button
                    title="Quick assign usage"
                    className="inline-flex items-center gap-1 px-2.5 py-1.5 text-xs font-medium bg-gray-50 text-gray-700 rounded-lg hover:bg-gray-100 transition-colors"
                  >
                    <Video className="w-3.5 h-3.5" /> Usage <ChevronDown className="w-3 h-3" />
                  </button>
                  <div className="hidden group-hover/use:block absolute top-full right-0 mt-1 bg-white border border-gray-200 rounded-lg shadow-lg z-50 w-48 max-h-60 overflow-y-auto">
                    {USAGE_TYPES.map(u => (
                      <button
                        key={u.key}
                        onClick={async () => {
                          if (selectedFiles.size === 0) return;
                          try {
                            await applyBulkTags(
                              { addTags: [`use:${u.key}`] },
                              { closeModal: false, successMessage: `Tagged ${selectedFiles.size} item(s) with use:${u.key}` }
                            );
                          } catch {}
                        }}
                        className="w-full text-left px-3 py-1.5 text-sm hover:bg-warm-50 transition-colors"
                      >
                        {u.label}
                      </button>
                    ))}
                  </div>
                </div>

                <button
                  onClick={() => setShowCollectionModal(true)}
                  title="Add to collection"
                  className="inline-flex items-center px-2 py-1.5 text-xs font-medium bg-gray-50 text-gray-700 rounded-lg hover:bg-gray-100 transition-colors"
                >
                  <FolderPlus className="w-3.5 h-3.5" />
                </button>
                <button
                  onClick={() => analyzeBatch('selected')}
                  disabled={batchAnalyzing}
                  title="AI analyze selected"
                  className="inline-flex items-center px-2 py-1.5 text-xs font-medium bg-purple-50 text-purple-700 rounded-lg hover:bg-purple-100 disabled:opacity-50 transition-colors"
                >
                  {batchAnalyzing ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <Sparkles className="w-3.5 h-3.5" />}
                </button>

                {selectedFiles.size === 1 && (
                  <div className="relative">
                    <button
                      onClick={() => setShowCoverDropdown(!showCoverDropdown)}
                      disabled={settingCover}
                      title="Set as cover photo"
                      className="inline-flex items-center gap-1 px-2.5 py-1.5 text-xs font-medium bg-picc-ochre/10 text-picc-ochre rounded-lg hover:bg-picc-ochre/20 disabled:opacity-50 transition-colors"
                    >
                      {settingCover ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <ImageIcon className="w-3.5 h-3.5" />}
                      Cover
                    </button>
                    {showCoverDropdown && (
                      <div className="absolute top-full right-0 mt-1 bg-white border border-gray-200 rounded-lg shadow-lg z-50 w-64 max-h-60 overflow-y-auto">
                        <div className="p-2 text-xs text-gray-500 font-medium border-b">Select service:</div>
                        {services.map(svc => (
                          <button
                            key={svc.id}
                            onClick={() => setCoverPhoto(svc.service_slug)}
                            className="w-full text-left px-3 py-1.5 text-sm hover:bg-warm-50 transition-colors"
                          >
                            {svc.service_name}
                          </button>
                        ))}
                      </div>
                    )}
                  </div>
                )}

                <div className="w-px h-5 bg-gray-200" />

                <button
                  onClick={bulkDelete}
                  disabled={isDeleting}
                  title="Delete selected"
                  className="inline-flex items-center px-2 py-1.5 text-xs font-medium text-red-600 rounded-lg hover:bg-red-50 disabled:opacity-50 transition-colors"
                >
                  {isDeleting ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <Trash2 className="w-3.5 h-3.5" />}
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
                data-media-id={item.id}
                onClick={(e) => {
                  if (isDragging) return;
                  if (e.shiftKey) {
                    e.preventDefault();
                    handleShiftClick(idx);
                    setLastClickedIndex(idx);
                    return;
                  }
                  // Single click = select + focus (Lightroom style)
                  setFocusedMediaId(item.id);
                  toggleSelect(item.id);
                  setLastClickedIndex(idx);
                }}
                onDoubleClick={() => {
                  // Double click = open detail modal
                  setSelectedMedia(item); setNewTagInput('');
                }}
                onMouseDown={(e) => handleItemMouseDown(e, idx)}
                onMouseEnter={() => handleItemMouseEnter(idx)}
                className={`group relative aspect-square bg-gray-100 rounded-lg overflow-hidden cursor-pointer transition-all ${
                  focusedMediaId === item.id
                    ? 'ring-3 ring-amber-400 ring-offset-1'
                    : selectedFiles.has(item.id)
                      ? 'ring-2 ring-picc-red'
                      : 'hover:ring-2 hover:ring-picc-red'
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
                  getVideoThumbnail(item) ? (
                    <div className="relative w-full h-full bg-gray-900">
                      <img src={getVideoThumbnail(item)!} alt={item.title || 'Video'} className="w-full h-full object-cover" loading="lazy" />
                      <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
                        <div className="w-12 h-12 bg-white/90 rounded-full flex items-center justify-center">
                          <Play className="w-5 h-5 text-gray-900 ml-0.5" />
                        </div>
                      </div>
                    </div>
                  ) : isExternalVideo(item) ? (
                    <div className="w-full h-full bg-gray-900 flex flex-col items-center justify-center gap-2">
                      <div className="w-12 h-12 bg-white/90 rounded-full flex items-center justify-center">
                        <Play className="w-5 h-5 text-gray-900 ml-0.5" />
                      </div>
                      <span className="text-[10px] text-white/70 px-2 text-center truncate max-w-full">{item.title || 'External Video'}</span>
                    </div>
                  ) : (
                    <VideoThumb src={item.public_url} alt={item.title || 'Video'} className="w-full h-full" />
                  )
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

                {/* Page Placement Badge */}
                {item.page_context && (
                  <div
                    className="absolute top-2 right-8 z-10"
                    title={`${item.page_context}${item.page_section ? ` → ${item.page_section}` : ''}${item.display_order ? ` (slot ${item.display_order})` : ''}`}
                  >
                    <div className="w-5 h-5 bg-blue-500 rounded-full flex items-center justify-center">
                      <MapPin className="w-3 h-3 text-white" />
                    </div>
                  </div>
                )}

                {/* Analyzing Indicator */}
                {isAnalyzing && (
                  <div className="absolute inset-0 bg-black/50 flex items-center justify-center">
                    <Loader2 className="w-8 h-8 text-white animate-spin" />
                  </div>
                )}

                {/* Service tag dots + color label dot */}
                <div className="absolute bottom-2 left-2 z-10 flex items-center gap-1.5">
                  {item.tags && item.tags.some(t => t.startsWith('service:')) && (
                    <TagDots tags={item.tags} />
                  )}
                  {item.color_label && (
                    <span
                      className="w-3 h-3 rounded-full border border-white/60 shadow-sm"
                      style={{ backgroundColor: COLOR_LABELS.find(c => c.key === item.color_label)?.hex }}
                      title={item.color_label}
                    />
                  )}
                </div>

                {/* Star rating badge */}
                {(item.rating ?? 0) > 0 && (
                  <div className="absolute bottom-2 right-2 z-10 flex items-center gap-0.5 bg-black/50 rounded px-1.5 py-0.5">
                    <Star className="w-3 h-3 fill-amber-400 text-amber-400" />
                    <span className="text-[10px] text-amber-300 font-medium">{item.rating}</span>
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
                  getVideoThumbnail(item) ? (
                    <div className="relative w-16 h-16 bg-gray-900 rounded overflow-hidden">
                      <img src={getVideoThumbnail(item)!} alt={item.title || 'Video'} className="w-full h-full object-cover" loading="lazy" />
                      <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
                        <div className="w-6 h-6 bg-white/90 rounded-full flex items-center justify-center">
                          <Play className="w-3 h-3 text-gray-900 ml-0.5" />
                        </div>
                      </div>
                    </div>
                  ) : (
                    <div className="w-16 h-16 bg-gray-900 rounded flex items-center justify-center">
                      <Play className="w-6 h-6 text-white/80" />
                    </div>
                  )
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

      {/* Load More / Load All Buttons */}
      {!loading && hasMore && media.length > 0 && (
        <div className="mt-8 text-center flex items-center justify-center gap-3">
          <button
            onClick={loadMore}
            disabled={loadingMore}
            className="px-6 py-2.5 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 disabled:opacity-50 disabled:cursor-not-allowed transition-colors font-medium inline-flex items-center gap-2"
          >
            {loadingMore ? (
              <>
                <Loader2 className="w-4 h-4 animate-spin" />
                Loading...
              </>
            ) : (
              <>Load More</>
            )}
          </button>
          <button
            onClick={loadAll}
            disabled={loadingMore}
            className="px-6 py-2.5 bg-picc-red text-white rounded-lg hover:bg-picc-red/90 disabled:opacity-50 disabled:cursor-not-allowed transition-colors font-medium inline-flex items-center gap-2"
          >
            {loadingMore ? (
              <>
                <Loader2 className="w-4 h-4 animate-spin" />
                Loading all...
              </>
            ) : (
              <>Load All ({totalCount - media.length} remaining)</>
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

              <div>
                <div className="text-xs text-gray-500 mb-1">Custom tags (comma-separated)</div>
                <input
                  type="text"
                  value={bulkCustomTags}
                  onChange={(e) => setBulkCustomTags(e.target.value)}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-picc-red"
                  placeholder="e.g. hero, palm-island, cultural-programs"
                />
                <p className="text-[11px] text-gray-400 mt-1">Add any tags — separate multiple with commas</p>
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

                {/* Rotate / Flip */}
                {selectedMedia.file_type === 'image' && (
                  <div>
                    <span className="text-sm font-medium text-gray-700 mb-2 block">Orientation</span>
                    <div className="flex gap-1.5">
                      {([
                        { icon: RotateCcw, label: 'Rotate left', body: { degrees: -90 } },
                        { icon: RotateCw, label: 'Rotate right', body: { degrees: 90 } },
                        { icon: FlipHorizontal2, label: 'Flip horizontal', body: { flip: 'horizontal' } },
                        { icon: FlipVertical2, label: 'Flip vertical', body: { flip: 'vertical' } },
                      ] as const).map(({ icon: Icon, label, body }) => (
                        <button
                          key={label}
                          title={label}
                          disabled={rotating === selectedMedia.id}
                          onClick={async () => {
                            setRotating(selectedMedia.id);
                            try {
                              const res = await fetch(`/api/media/${selectedMedia.id}/rotate`, {
                                method: 'POST',
                                headers: { 'Content-Type': 'application/json' },
                                body: JSON.stringify(body),
                              });
                              if (!res.ok) {
                                const err = await res.json();
                                throw new Error(err.error || 'Rotation failed');
                              }
                              const result = await res.json();
                              // Bust browser cache by appending timestamp
                              const bustUrl = selectedMedia.public_url.split('?')[0] + `?t=${Date.now()}`;
                              setSelectedMedia({ ...selectedMedia, public_url: bustUrl, width: result.width, height: result.height });
                              setMedia(prev => prev.map(m => m.id === selectedMedia.id ? { ...m, public_url: bustUrl, width: result.width, height: result.height } : m));
                              toast.success(label + ' applied');
                            } catch (err: any) {
                              toast.error('Failed', err.message || String(err));
                            } finally {
                              setRotating(null);
                            }
                          }}
                          className="flex-1 flex items-center justify-center gap-1.5 px-3 py-2 bg-gray-100 text-gray-700 text-xs font-medium rounded-lg hover:bg-gray-200 disabled:opacity-50 transition-colors"
                        >
                          {rotating === selectedMedia.id ? (
                            <Loader2 className="w-4 h-4 animate-spin" />
                          ) : (
                            <Icon className="w-4 h-4" />
                          )}
                        </button>
                      ))}
                    </div>
                  </div>
                )}

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

                {/* Quick-tag: Service / Project / Usage */}
                <div className="grid grid-cols-3 gap-2">
                  {/* Service quick-tag */}
                  <div>
                    <label className="text-[11px] text-gray-500 mb-0.5 block">Service</label>
                    <select
                      value={selectedMedia.tags?.find(t => t.startsWith('service:'))?.replace('service:', '') || ''}
                      onChange={async (e) => {
                        const newVal = e.target.value;
                        const currentTag = selectedMedia.tags?.find(t => t.startsWith('service:'));
                        try {
                          const removeTags = currentTag ? [currentTag] : [];
                          const addTags = newVal ? [`service:${newVal}`] : [];
                          if (removeTags.length === 0 && addTags.length === 0) return;
                          const res = await fetch('/api/media/bulk', {
                            method: 'POST',
                            headers: { 'Content-Type': 'application/json' },
                            body: JSON.stringify({ mediaIds: [selectedMedia.id], addTags, removeTags }),
                          });
                          if (!res.ok) throw new Error('Failed to update service tag');
                          let updatedTags = (selectedMedia.tags || []).filter(t => !t.startsWith('service:'));
                          if (newVal) updatedTags.push(`service:${newVal}`);
                          setSelectedMedia({ ...selectedMedia, tags: updatedTags });
                          setMedia(prev => prev.map(m => m.id === selectedMedia.id ? { ...m, tags: updatedTags } : m));
                          toast.success(newVal ? `Service: ${newVal}` : 'Service cleared');
                        } catch (err) {
                          toast.error('Failed to update service', String(err));
                        }
                      }}
                      className="w-full text-xs px-2 py-1.5 border border-gray-200 rounded-lg"
                    >
                      <option value="">None</option>
                      {services.map(s => (
                        <option key={s.service_slug} value={s.service_slug}>{s.service_name}</option>
                      ))}
                    </select>
                  </div>

                  {/* Project quick-tag */}
                  <div>
                    <label className="text-[11px] text-gray-500 mb-0.5 block">Project</label>
                    <select
                      value={selectedMedia.tags?.find(t => t.startsWith('project:'))?.replace('project:', '') || ''}
                      onChange={async (e) => {
                        const newVal = e.target.value;
                        const currentTag = selectedMedia.tags?.find(t => t.startsWith('project:'));
                        try {
                          const removeTags = currentTag ? [currentTag] : [];
                          const addTags = newVal ? [`project:${newVal}`] : [];
                          if (removeTags.length === 0 && addTags.length === 0) return;
                          const res = await fetch('/api/media/bulk', {
                            method: 'POST',
                            headers: { 'Content-Type': 'application/json' },
                            body: JSON.stringify({ mediaIds: [selectedMedia.id], addTags, removeTags }),
                          });
                          if (!res.ok) throw new Error('Failed to update project tag');
                          let updatedTags = (selectedMedia.tags || []).filter(t => !t.startsWith('project:'));
                          if (newVal) updatedTags.push(`project:${newVal}`);
                          setSelectedMedia({ ...selectedMedia, tags: updatedTags });
                          setMedia(prev => prev.map(m => m.id === selectedMedia.id ? { ...m, tags: updatedTags } : m));
                          toast.success(newVal ? `Project: ${newVal}` : 'Project cleared');
                        } catch (err) {
                          toast.error('Failed to update project', String(err));
                        }
                      }}
                      className="w-full text-xs px-2 py-1.5 border border-gray-200 rounded-lg"
                    >
                      <option value="">None</option>
                      {projects.map(p => (
                        <option key={p.slug} value={p.slug}>{p.name}</option>
                      ))}
                    </select>
                  </div>

                  {/* Usage quick-tag */}
                  <div>
                    <label className="text-[11px] text-gray-500 mb-0.5 block">Usage</label>
                    <select
                      value={selectedMedia.tags?.find(t => t.startsWith('use:'))?.replace('use:', '') || ''}
                      onChange={async (e) => {
                        const newVal = e.target.value;
                        const currentTag = selectedMedia.tags?.find(t => t.startsWith('use:'));
                        try {
                          const removeTags = currentTag ? [currentTag] : [];
                          const addTags = newVal ? [`use:${newVal}`] : [];
                          if (removeTags.length === 0 && addTags.length === 0) return;
                          const res = await fetch('/api/media/bulk', {
                            method: 'POST',
                            headers: { 'Content-Type': 'application/json' },
                            body: JSON.stringify({ mediaIds: [selectedMedia.id], addTags, removeTags }),
                          });
                          if (!res.ok) throw new Error('Failed to update usage tag');
                          let updatedTags = (selectedMedia.tags || []).filter(t => !t.startsWith('use:'));
                          if (newVal) updatedTags.push(`use:${newVal}`);
                          setSelectedMedia({ ...selectedMedia, tags: updatedTags });
                          setMedia(prev => prev.map(m => m.id === selectedMedia.id ? { ...m, tags: updatedTags } : m));
                          toast.success(newVal ? `Usage: ${newVal}` : 'Usage cleared');
                        } catch (err) {
                          toast.error('Failed to update usage', String(err));
                        }
                      }}
                      className="w-full text-xs px-2 py-1.5 border border-gray-200 rounded-lg"
                    >
                      <option value="">None</option>
                      {USAGE_TYPES.map(u => (
                        <option key={u.key} value={u.key}>{u.label}</option>
                      ))}
                    </select>
                  </div>
                </div>

                {/* Star Rating */}
                <div>
                  <div className="flex items-center gap-2 mb-2">
                    <Star className="w-4 h-4 text-gray-400" />
                    <span className="text-sm font-medium text-gray-700">Rating</span>
                  </div>
                  <div className="flex items-center gap-1">
                    {[1, 2, 3, 4, 5].map((star) => (
                      <button
                        key={star}
                        onClick={async () => {
                          const newRating = (selectedMedia.rating ?? 0) === star ? 0 : star;
                          // Optimistic update
                          const updated = { ...selectedMedia, rating: newRating };
                          setSelectedMedia(updated);
                          setMedia(prev => prev.map(m => m.id === selectedMedia.id ? { ...m, rating: newRating } : m));
                          try {
                            const res = await fetch(`/api/media/${selectedMedia.id}`, {
                              method: 'PATCH',
                              headers: { 'Content-Type': 'application/json' },
                              body: JSON.stringify({ rating: newRating }),
                            });
                            if (!res.ok) throw new Error('Failed to update rating');
                          } catch (err) {
                            // Revert on error
                            setSelectedMedia(selectedMedia);
                            setMedia(prev => prev.map(m => m.id === selectedMedia.id ? selectedMedia : m));
                            toast.error('Failed to update rating', String(err));
                          }
                        }}
                        className="p-0.5 hover:scale-110 transition-transform"
                        title={`${star} star${star > 1 ? 's' : ''}`}
                      >
                        <Star
                          className={`w-6 h-6 ${star <= (selectedMedia.rating ?? 0) ? 'fill-amber-400 text-amber-400' : 'text-gray-300 hover:text-amber-200'}`}
                        />
                      </button>
                    ))}
                    {(selectedMedia.rating ?? 0) > 0 && (
                      <span className="ml-2 text-xs text-gray-400">{selectedMedia.rating}/5</span>
                    )}
                  </div>
                </div>

                {/* Color Label */}
                <div>
                  <div className="flex items-center gap-2 mb-2">
                    <span className="w-4 h-4 rounded-full bg-gradient-to-br from-red-400 via-green-400 to-blue-400" />
                    <span className="text-sm font-medium text-gray-700">Color Label</span>
                  </div>
                  <div className="flex items-center gap-2">
                    {COLOR_LABELS.map((c) => (
                      <button
                        key={c.key}
                        onClick={async () => {
                          const newColor = selectedMedia.color_label === c.key ? null : c.key;
                          // Optimistic update
                          const updated = { ...selectedMedia, color_label: newColor };
                          setSelectedMedia(updated);
                          setMedia(prev => prev.map(m => m.id === selectedMedia.id ? { ...m, color_label: newColor } : m));
                          try {
                            const res = await fetch(`/api/media/${selectedMedia.id}`, {
                              method: 'PATCH',
                              headers: { 'Content-Type': 'application/json' },
                              body: JSON.stringify({ color_label: newColor }),
                            });
                            if (!res.ok) throw new Error('Failed to update color label');
                          } catch (err) {
                            setSelectedMedia(selectedMedia);
                            setMedia(prev => prev.map(m => m.id === selectedMedia.id ? selectedMedia : m));
                            toast.error('Failed to update color label', String(err));
                          }
                        }}
                        title={c.label}
                        className={`w-7 h-7 rounded-full border-2 transition-all hover:scale-110 ${
                          selectedMedia.color_label === c.key ? 'border-gray-800 scale-110 ring-2 ring-gray-300' : 'border-gray-200'
                        }`}
                        style={{ backgroundColor: c.hex }}
                      />
                    ))}
                    {selectedMedia.color_label && (
                      <button
                        onClick={async () => {
                          const updated = { ...selectedMedia, color_label: null };
                          setSelectedMedia(updated);
                          setMedia(prev => prev.map(m => m.id === selectedMedia.id ? { ...m, color_label: null } : m));
                          try {
                            const res = await fetch(`/api/media/${selectedMedia.id}`, {
                              method: 'PATCH',
                              headers: { 'Content-Type': 'application/json' },
                              body: JSON.stringify({ color_label: null }),
                            });
                            if (!res.ok) throw new Error('Failed to clear color label');
                          } catch (err) {
                            setSelectedMedia(selectedMedia);
                            setMedia(prev => prev.map(m => m.id === selectedMedia.id ? selectedMedia : m));
                            toast.error('Failed to clear color label', String(err));
                          }
                        }}
                        className="ml-1 text-xs text-gray-400 hover:text-gray-600"
                        title="Clear color"
                      >
                        <X className="w-4 h-4" />
                      </button>
                    )}
                  </div>
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

                {/* Page Placement */}
                <div className="border-t border-gray-100 pt-4">
                  <div className="flex items-center justify-between mb-2">
                    <div className="flex items-center gap-2">
                      <MapPin className="w-4 h-4 text-gray-400" />
                      <span className="text-sm font-medium text-gray-700">Page Placement</span>
                    </div>
                    {selectedMedia.page_context && (
                      <button
                        onClick={async () => {
                          try {
                            const res = await fetch(`/api/media/${selectedMedia.id}`, {
                              method: 'PATCH',
                              headers: { 'Content-Type': 'application/json' },
                              body: JSON.stringify({ page_context: null, page_section: null, display_order: 0 }),
                            });
                            if (!res.ok) throw new Error('Failed to clear placement');
                            const updated = { ...selectedMedia, page_context: null, page_section: null, display_order: 0 };
                            setSelectedMedia(updated);
                            setMedia(prev => prev.map(m => m.id === selectedMedia.id ? { ...m, page_context: null, page_section: null, display_order: 0 } : m));
                            toast.success('Placement cleared');
                          } catch (err) {
                            toast.error('Failed to clear placement', String(err));
                          }
                        }}
                        className="text-xs text-red-500 hover:text-red-700"
                      >
                        Clear
                      </button>
                    )}
                  </div>
                  <div className="grid grid-cols-2 gap-2">
                    <div>
                      <label className="text-xs text-gray-500 mb-1 block">Page</label>
                      <select
                        value={selectedMedia.page_context || ''}
                        onChange={async (e) => {
                          const val = e.target.value || null;
                          try {
                            const res = await fetch(`/api/media/${selectedMedia.id}`, {
                              method: 'PATCH',
                              headers: { 'Content-Type': 'application/json' },
                              body: JSON.stringify({ page_context: val }),
                            });
                            if (!res.ok) throw new Error('Failed to update');
                            const updated = { ...selectedMedia, page_context: val };
                            setSelectedMedia(updated);
                            setMedia(prev => prev.map(m => m.id === selectedMedia.id ? { ...m, page_context: val } : m));
                            toast.success('Page context updated');
                          } catch (err) {
                            toast.error('Failed to update', String(err));
                          }
                        }}
                        className="w-full px-2 py-1.5 border border-gray-300 rounded-lg text-sm"
                      >
                        <option value="">None</option>
                        {['home','about','impact','community','services','innovation','explore','20-years','stories','publications','annual-report'].map(p => (
                          <option key={p} value={p}>{p}</option>
                        ))}
                      </select>
                    </div>
                    <div>
                      <label className="text-xs text-gray-500 mb-1 block">Section</label>
                      <input
                        type="text"
                        value={selectedMedia.page_section || ''}
                        placeholder="e.g. hero, timeline"
                        onChange={async (e) => {
                          const val = e.target.value || null;
                          // Debounce: only save on blur
                          const updated = { ...selectedMedia, page_section: val };
                          setSelectedMedia(updated);
                        }}
                        onBlur={async (e) => {
                          const val = e.target.value || null;
                          try {
                            const res = await fetch(`/api/media/${selectedMedia.id}`, {
                              method: 'PATCH',
                              headers: { 'Content-Type': 'application/json' },
                              body: JSON.stringify({ page_section: val }),
                            });
                            if (!res.ok) throw new Error('Failed to update');
                            setMedia(prev => prev.map(m => m.id === selectedMedia.id ? { ...m, page_section: val } : m));
                          } catch (err) {
                            toast.error('Failed to update section', String(err));
                          }
                        }}
                        className="w-full px-2 py-1.5 border border-gray-300 rounded-lg text-sm"
                      />
                    </div>
                  </div>
                  <div className="mt-2">
                    <label className="text-xs text-gray-500 mb-1 block">Display Order</label>
                    <input
                      type="number"
                      min={0}
                      value={selectedMedia.display_order ?? 0}
                      onChange={async (e) => {
                        const val = parseInt(e.target.value) || 0;
                        const updated = { ...selectedMedia, display_order: val };
                        setSelectedMedia(updated);
                      }}
                      onBlur={async (e) => {
                        const val = parseInt(e.target.value) || 0;
                        try {
                          const res = await fetch(`/api/media/${selectedMedia.id}`, {
                            method: 'PATCH',
                            headers: { 'Content-Type': 'application/json' },
                            body: JSON.stringify({ display_order: val }),
                          });
                          if (!res.ok) throw new Error('Failed to update');
                          setMedia(prev => prev.map(m => m.id === selectedMedia.id ? { ...m, display_order: val } : m));
                        } catch (err) {
                          toast.error('Failed to update order', String(err));
                        }
                      }}
                      className="w-20 px-2 py-1.5 border border-gray-300 rounded-lg text-sm"
                    />
                  </div>
                  {selectedMedia.page_context && (
                    <p className="mt-2 text-xs text-blue-600">
                      Placed on: {selectedMedia.page_context}{selectedMedia.page_section ? ` → ${selectedMedia.page_section}` : ''}
                      {selectedMedia.display_order ? ` (slot ${selectedMedia.display_order})` : ''}
                    </p>
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
          <div className="bg-white rounded-xl shadow-xl max-w-lg w-full max-h-[80vh] flex flex-col">
            <div className="p-6 border-b border-gray-200 shrink-0">
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

            <div className="p-6 overflow-y-auto flex-1 min-h-0">
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
              <div className="p-6 border-t border-gray-200 flex gap-3 shrink-0">
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
