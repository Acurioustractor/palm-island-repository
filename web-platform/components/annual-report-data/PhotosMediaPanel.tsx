'use client';

import { useState } from 'react';
import { Image, Tag, ExternalLink, AlertCircle } from 'lucide-react';

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
}: PhotosMediaPanelProps) {
  const [saving, setSaving] = useState<string | null>(null);
  const [filterSection, setFilterSection] = useState<string>('all');

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

  const filteredMedia = filterSection === 'all'
    ? media
    : media.filter(m => m.tags.includes(`section:${filterSection}`));

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
        <div className="bg-amber-50 border border-amber-200 rounded-lg p-4 flex items-start gap-3">
          <AlertCircle className="w-5 h-5 text-amber-500 flex-shrink-0 mt-0.5" />
          <div>
            <div className="text-sm font-medium text-amber-800">Missing photos for sections</div>
            <div className="text-sm text-amber-700 mt-1">
              {gaps.map(g => REPORT_SECTIONS.find(s => s.id === g)?.label || g).join(', ')}
            </div>
          </div>
        </div>
      )}

      {/* Section filter + link to gallery */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <label className="text-sm font-medium text-gray-600">Filter:</label>
          <select
            value={filterSection}
            onChange={e => setFilterSection(e.target.value)}
            className="px-3 py-1.5 text-sm border border-gray-200 rounded-lg focus:border-purple-400 focus:outline-none"
          >
            <option value="all">All ({media.length})</option>
            {REPORT_SECTIONS.map(s => (
              <option key={s.id} value={s.id}>
                {s.label} ({sectionCounts[s.id] || 0})
              </option>
            ))}
          </select>
        </div>
        <a
          href="/picc/media/gallery"
          className="flex items-center gap-1.5 px-3 py-1.5 text-sm font-medium text-purple-600 border border-purple-200 rounded-lg hover:bg-purple-50 transition-colors"
        >
          <ExternalLink className="w-4 h-4" />
          Full Media Gallery
        </a>
      </div>

      {/* Photo grid */}
      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
        {filteredMedia.map(file => (
          <div key={file.id} className="bg-white rounded-xl border border-gray-200 overflow-hidden">
            <div className="aspect-square bg-gray-100 relative">
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
                          ? 'bg-purple-100 text-purple-700 border border-purple-200'
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

      {filteredMedia.length === 0 && (
        <div className="text-sm text-gray-500 bg-gray-50 rounded-lg p-8 text-center">
          No photos tagged for this report. Tag photos with &ldquo;annual-report&rdquo; and
          &ldquo;fy:{fyLabel}&rdquo; in the{' '}
          <a href="/picc/media/gallery" className="text-purple-600 underline">
            media gallery
          </a>
          .
        </div>
      )}
    </div>
  );
}
