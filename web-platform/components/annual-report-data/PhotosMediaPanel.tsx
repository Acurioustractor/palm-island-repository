'use client';

import { useState, useEffect } from 'react';
import { Image, Tag, ExternalLink, AlertCircle, CheckSquare, Square, X, Heart, ArrowUpDown } from 'lucide-react';
import EmptyState from './EmptyState';

interface MediaFile {
  id: string;
  filename: string;
  public_url: string | null;
  mime_type: string | null;
  tags: string[];
  alt_text: string | null;
  width: number | null;
  height: number | null;
  created_at: string;
}

interface PhotosMediaPanelProps {
  media: MediaFile[];
  sectionCounts: Record<string, number>;
  gaps: string[];
  fyLabel: string;
  onMediaChange: (media: MediaFile[]) => void;
  reportId?: string | null;
}

const REPORT_SECTIONS = [
  { id: 'hero', label: 'Hero / Cover' },
  { id: 'ceo', label: 'CEO Message' },
  { id: 'chair', label: 'Chair Message' },
  { id: 'gallery', label: 'Photo Gallery' },
  { id: 'services', label: 'Services' },
  { id: 'board', label: 'Board' },
];

export default function PhotosMediaPanel({
  media,
  sectionCounts,
  gaps,
  fyLabel,
  onMediaChange,
  reportId,
}: PhotosMediaPanelProps) {
  const [saving, setSaving] = useState<string | null>(null);
  const [filterSection, setFilterSection] = useState<string>('all');
  const [bulkMode, setBulkMode] = useState(false);
  const [selectedIds, setSelectedIds] = useState<Set<string>>(new Set());
  const [bulkSaving, setBulkSaving] = useState(false);
  const [sortBy, setSortBy] = useState<'recent' | 'most_voted'>('recent');
  const [photoVotes, setPhotoVotes] = useState<Record<string, number>>({});
  const [userPhotoVotes, setUserPhotoVotes] = useState<Set<string>>(new Set());
  const [votingId, setVotingId] = useState<string | null>(null);

  // Fetch vote counts for photos
  useEffect(() => {
    if (!reportId) return;
    fetch(`/api/annual-report-data/votes?report_id=${reportId}&content_type=media`)
      .then(r => r.json())
      .then(data => {
        const counts: Record<string, number> = {};
        if (Array.isArray(data.counts)) {
          for (const c of data.counts) counts[c.content_id] = c.total_votes;
        } else if (data.counts && typeof data.counts === 'object') {
          for (const [key, val] of Object.entries(data.counts as Record<string, any>)) {
            counts[key.replace('media:', '')] = (val as any).total_votes || 0;
          }
        }
        setPhotoVotes(counts);
        if (data.user_votes) setUserPhotoVotes(new Set(data.user_votes));
      })
      .catch(() => {});
  }, [reportId]);

  const handlePhotoVote = async (mediaId: string) => {
    if (!reportId) return;
    const voteKey = `media:${mediaId}:love`;
    const hasVoted = userPhotoVotes.has(voteKey);
    setVotingId(mediaId);

    try {
      if (hasVoted) {
        await fetch(
          `/api/annual-report-data/votes?report_id=${reportId}&content_type=media&content_id=${mediaId}&user_id=anonymous`,
          { method: 'DELETE' }
        );
        setUserPhotoVotes(prev => { const next = new Set(prev); next.delete(voteKey); return next; });
        setPhotoVotes(prev => ({ ...prev, [mediaId]: Math.max(0, (prev[mediaId] || 0) - 1) }));
      } else {
        await fetch('/api/annual-report-data/votes', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            report_id: reportId,
            content_type: 'media',
            content_id: mediaId,
            user_id: 'anonymous',
            vote_type: 'love',
          }),
        });
        setUserPhotoVotes(prev => new Set(prev).add(voteKey));
        setPhotoVotes(prev => ({ ...prev, [mediaId]: (prev[mediaId] || 0) + 1 }));
      }
    } catch {
      // Silently fail
    } finally {
      setVotingId(null);
    }
  };

  const handleToggleSection = async (mediaId: string, sectionTag: string, currentTags: string[]) => {
    const hasTag = currentTags.includes(sectionTag);
    setSaving(mediaId);
    try {
      const res = await fetch('/api/annual-report-data/media', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          media_id: mediaId,
          action: hasTag ? 'remove' : 'add',
          tag: sectionTag,
        }),
      });
      if (!res.ok) throw new Error('Tag update failed');
      const data = await res.json();
      onMediaChange(media.map(m => m.id === mediaId ? { ...m, tags: data.media.tags } : m));
    } catch (error) {
      console.error('Tag toggle error:', error);
    } finally {
      setSaving(null);
    }
  };

  const filteredMedia = (() => {
    let result = filterSection === 'all'
      ? media
      : media.filter(m => m.tags.includes(`section:${filterSection}`));
    if (sortBy === 'most_voted') {
      result = [...result].sort((a, b) => (photoVotes[b.id] || 0) - (photoVotes[a.id] || 0));
    }
    return result;
  })();

  const toggleSelected = (id: string) => {
    setSelectedIds(prev => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });
  };

  const selectAll = () => {
    setSelectedIds(new Set(filteredMedia.map(m => m.id)));
  };

  const clearSelection = () => {
    setSelectedIds(new Set());
    setBulkMode(false);
  };

  const bulkAddTag = async (sectionTag: string) => {
    if (selectedIds.size === 0) return;
    setBulkSaving(true);
    try {
      const results = await Promise.all(
        Array.from(selectedIds).map(async (mediaId) => {
          const file = media.find(m => m.id === mediaId);
          if (file?.tags.includes(sectionTag)) return null;
          const res = await fetch('/api/annual-report-data/media', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ media_id: mediaId, action: 'add', tag: sectionTag }),
          });
          if (!res.ok) return null;
          const data = await res.json();
          return { id: mediaId, tags: data.media.tags };
        })
      );
      const tagMap = new Map(results.filter(Boolean).map(r => [r!.id, r!.tags]));
      onMediaChange(media.map(m => tagMap.has(m.id) ? { ...m, tags: tagMap.get(m.id)! } : m));
      clearSelection();
    } catch (error) {
      console.error('Bulk tag error:', error);
    } finally {
      setBulkSaving(false);
    }
  };

  const bulkRemoveTag = async (sectionTag: string) => {
    if (selectedIds.size === 0) return;
    setBulkSaving(true);
    try {
      const results = await Promise.all(
        Array.from(selectedIds).map(async (mediaId) => {
          const file = media.find(m => m.id === mediaId);
          if (!file?.tags.includes(sectionTag)) return null;
          const res = await fetch('/api/annual-report-data/media', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ media_id: mediaId, action: 'remove', tag: sectionTag }),
          });
          if (!res.ok) return null;
          const data = await res.json();
          return { id: mediaId, tags: data.media.tags };
        })
      );
      const tagMap = new Map(results.filter(Boolean).map(r => [r!.id, r!.tags]));
      onMediaChange(media.map(m => tagMap.has(m.id) ? { ...m, tags: tagMap.get(m.id)! } : m));
      clearSelection();
    } catch (error) {
      console.error('Bulk remove tag error:', error);
    } finally {
      setBulkSaving(false);
    }
  };

  return (
    <div className="max-w-5xl space-y-6">
      {/* Stats */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <div className="bg-white rounded-xl border border-gray-200 p-4">
          <div className="text-xs font-medium text-gray-500 mb-1">Total Tagged</div>
          <div className="text-2xl font-bold text-gray-900">{media.length}</div>
        </div>
        {REPORT_SECTIONS.slice(0, 3).map(s => (
          <div key={s.id} className="bg-white rounded-xl border border-gray-200 p-4">
            <div className="text-xs font-medium text-gray-500 mb-1">{s.label}</div>
            <div className="text-2xl font-bold text-gray-900">{sectionCounts[s.id] || 0}</div>
          </div>
        ))}
      </div>

      {/* Gaps warning */}
      {gaps.length > 0 && (
        <div className="bg-picc-ochre-50 border border-picc-ochre-200 rounded-lg p-4 flex items-start gap-3">
          <AlertCircle className="w-5 h-5 text-picc-ochre flex-shrink-0 mt-0.5" />
          <div>
            <div className="text-sm font-medium text-picc-ochre">Missing photos for sections</div>
            <div className="text-sm text-picc-ochre mt-1">
              {gaps.map(g => REPORT_SECTIONS.find(s => s.id === g)?.label || g).join(', ')}
            </div>
          </div>
        </div>
      )}

      {/* Section filter + link to gallery */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="flex items-center gap-2">
            <label className="text-sm font-medium text-gray-600">Filter:</label>
            <select
              value={filterSection}
              onChange={e => setFilterSection(e.target.value)}
              className="px-3 py-1.5 text-sm border border-gray-200 rounded-lg focus:border-picc-ochre-300 focus:outline-none"
            >
              <option value="all">All ({media.length})</option>
              {REPORT_SECTIONS.map(s => (
                <option key={s.id} value={s.id}>
                  {s.label} ({sectionCounts[s.id] || 0})
                </option>
              ))}
            </select>
          </div>
          <div className="flex items-center gap-2">
            <ArrowUpDown className="w-4 h-4 text-gray-400" />
            <select
              value={sortBy}
              onChange={e => setSortBy(e.target.value as 'recent' | 'most_voted')}
              className="px-3 py-1.5 text-sm border border-gray-200 rounded-lg focus:border-picc-ochre-300 focus:outline-none"
            >
              <option value="recent">Most Recent</option>
              <option value="most_voted">Most Voted</option>
            </select>
          </div>
        </div>
        <div className="flex items-center gap-2">
          {filteredMedia.length > 0 && (
            <button
              onClick={() => { setBulkMode(!bulkMode); setSelectedIds(new Set()); }}
              className={`flex items-center gap-1.5 px-3 py-1.5 text-sm font-medium rounded-lg transition-colors ${
                bulkMode
                  ? 'text-picc-ochre bg-warm-100 border border-warm-300'
                  : 'text-gray-600 border border-gray-200 hover:bg-gray-50'
              }`}
            >
              <CheckSquare className="w-4 h-4" />
              {bulkMode ? 'Cancel' : 'Select'}
            </button>
          )}
          <a
            href="/picc/media/gallery"
            className="flex items-center gap-1.5 px-3 py-1.5 text-sm font-medium text-picc-ochre border border-warm-200 rounded-lg hover:bg-warm-50 transition-colors"
          >
            <ExternalLink className="w-4 h-4" />
            Full Media Gallery
          </a>
        </div>
      </div>

      {/* Photo grid */}
      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
        {filteredMedia.map(file => (
          <div
            key={file.id}
            className={`bg-white rounded-xl border overflow-hidden ${
              bulkMode && selectedIds.has(file.id) ? 'border-warm-300 ring-2 ring-warm-100' : 'border-gray-200'
            }`}
            onClick={bulkMode ? () => toggleSelected(file.id) : undefined}
          >
            <div className="aspect-square bg-gray-100 relative group">
              {bulkMode && (
                <div className="absolute top-2 left-2 z-10">
                  {selectedIds.has(file.id) ? (
                    <CheckSquare className="w-5 h-5 text-picc-ochre drop-shadow" />
                  ) : (
                    <Square className="w-5 h-5 text-white drop-shadow" />
                  )}
                </div>
              )}
              {/* Vote heart overlay */}
              {!bulkMode && reportId && (
                <button
                  onClick={(e) => { e.stopPropagation(); handlePhotoVote(file.id); }}
                  disabled={votingId === file.id}
                  className={`absolute top-2 right-2 z-10 flex items-center gap-1 px-1.5 py-1 rounded-full text-xs font-medium backdrop-blur-sm transition-all ${
                    userPhotoVotes.has(`media:${file.id}:love`)
                      ? 'bg-pink-500/90 text-white'
                      : 'bg-black/40 text-white opacity-0 group-hover:opacity-100'
                  }`}
                >
                  <Heart className="w-3.5 h-3.5" fill={userPhotoVotes.has(`media:${file.id}:love`) ? 'currentColor' : 'none'} />
                  {(photoVotes[file.id] || 0) > 0 && (
                    <span>{photoVotes[file.id]}</span>
                  )}
                </button>
              )}
              {file.public_url ? (
                <img
                  src={file.public_url}
                  alt={file.alt_text || file.filename}
                  className="w-full h-full object-cover"
                />
              ) : (
                <div className="w-full h-full flex items-center justify-center">
                  <Image className="w-8 h-8 text-gray-300" />
                </div>
              )}
            </div>
            <div className="p-3">
              <div className="text-xs font-medium text-gray-700 truncate mb-2">
                {file.filename}
              </div>
              {/* Section tag buttons */}
              <div className="flex flex-wrap gap-1">
                {REPORT_SECTIONS.map(section => {
                  const tag = `section:${section.id}`;
                  const hasTag = file.tags.includes(tag);
                  return (
                    <button
                      key={section.id}
                      onClick={() => handleToggleSection(file.id, tag, file.tags)}
                      disabled={saving === file.id}
                      className={`px-1.5 py-0.5 text-[10px] font-medium rounded transition-colors ${
                        hasTag
                          ? 'bg-warm-100 text-picc-ochre border border-warm-200'
                          : 'bg-gray-50 text-gray-400 border border-gray-100 hover:border-gray-300'
                      }`}
                    >
                      {section.label}
                    </button>
                  );
                })}
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Bulk Action Bar */}
      {bulkMode && selectedIds.size > 0 && (
        <div className="sticky bottom-4 mx-auto max-w-3xl bg-white rounded-xl border border-warm-200 shadow-lg p-3 flex items-center gap-3 z-40">
          <div className="flex items-center gap-2 text-sm font-medium text-picc-ochre">
            <CheckSquare className="w-4 h-4" />
            {selectedIds.size} selected
          </div>
          <button
            onClick={selectAll}
            className="text-xs text-picc-ochre hover:underline"
          >
            Select all
          </button>
          <div className="flex-1" />
          <select
            onChange={e => { if (e.target.value) bulkAddTag(`section:${e.target.value}`); e.target.value = ''; }}
            disabled={bulkSaving}
            className="px-2 py-1.5 text-xs border border-gray-200 rounded-lg focus:border-picc-ochre-300 focus:outline-none"
            defaultValue=""
          >
            <option value="" disabled>Add Tag...</option>
            {REPORT_SECTIONS.map(s => (
              <option key={s.id} value={s.id}>{s.label}</option>
            ))}
          </select>
          <select
            onChange={e => { if (e.target.value) bulkRemoveTag(`section:${e.target.value}`); e.target.value = ''; }}
            disabled={bulkSaving}
            className="px-2 py-1.5 text-xs border border-gray-200 rounded-lg focus:border-picc-ochre-300 focus:outline-none"
            defaultValue=""
          >
            <option value="" disabled>Remove Tag...</option>
            {REPORT_SECTIONS.map(s => (
              <option key={s.id} value={s.id}>{s.label}</option>
            ))}
          </select>
          <button
            onClick={clearSelection}
            className="p-1.5 text-gray-400 hover:text-gray-600 transition-colors"
          >
            <X className="w-4 h-4" />
          </button>
        </div>
      )}

      {filteredMedia.length === 0 && (
        <EmptyState
          icon={<Image className="w-6 h-6" />}
          title="No photos tagged"
          description={`Tag photos with "annual-report" and "fy:${fyLabel}" in the media gallery to include them in the report.`}
          secondaryAction={{ label: 'Open Media Gallery', href: '/picc/media/gallery' }}
        />
      )}
    </div>
  );
}
