'use client';

import { useState, useMemo } from 'react';
import { X, Loader2, Trash2 } from 'lucide-react';

interface MediaFile {
  id: string;
  tags?: string[];
}

interface BulkTagRemoveModalProps {
  selectedMedia: MediaFile[];
  open: boolean;
  onClose: () => void;
  onRemove: (tags: string[]) => Promise<void>;
}

export default function BulkTagRemoveModal({ selectedMedia, open, onClose, onRemove }: BulkTagRemoveModalProps) {
  const [selectedTags, setSelectedTags] = useState<Set<string>>(new Set());
  const [removing, setRemoving] = useState(false);

  // Collect all unique tags from selected media
  const allTags = useMemo(() => {
    const tagCounts = new Map<string, number>();
    selectedMedia.forEach(m => {
      (m.tags || []).forEach(tag => {
        tagCounts.set(tag, (tagCounts.get(tag) || 0) + 1);
      });
    });
    return Array.from(tagCounts.entries())
      .sort((a, b) => b[1] - a[1])
      .map(([tag, count]) => ({ tag, count }));
  }, [selectedMedia]);

  const toggleTag = (tag: string) => {
    const next = new Set(selectedTags);
    if (next.has(tag)) next.delete(tag);
    else next.add(tag);
    setSelectedTags(next);
  };

  const handleRemove = async () => {
    if (selectedTags.size === 0) return;
    setRemoving(true);
    try {
      await onRemove(Array.from(selectedTags));
      setSelectedTags(new Set());
      onClose();
    } catch (error) {
      console.error('Remove tags error:', error);
    } finally {
      setRemoving(false);
    }
  };

  if (!open) return null;

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-xl w-full max-w-lg shadow-xl border border-gray-200">
        <div className="p-6 border-b border-gray-200 flex items-center justify-between">
          <div>
            <h3 className="text-lg font-semibold text-gray-900">
              Remove Tags from {selectedMedia.length} item(s)
            </h3>
            <p className="text-sm text-gray-600 mt-1">
              Select tags to remove. This won't delete the media.
            </p>
          </div>
          <button onClick={onClose} className="p-2 hover:bg-gray-100 rounded-lg" disabled={removing}>
            <X className="w-5 h-5 text-gray-500" />
          </button>
        </div>

        <div className="p-6">
          {allTags.length === 0 ? (
            <p className="text-sm text-gray-500 text-center py-4">
              Selected media has no tags to remove.
            </p>
          ) : (
            <div className="space-y-1.5 max-h-[300px] overflow-y-auto">
              {allTags.map(({ tag, count }) => (
                <label
                  key={tag}
                  className={`flex items-center gap-3 px-3 py-2 rounded-lg cursor-pointer transition-colors ${
                    selectedTags.has(tag) ? 'bg-red-50 border border-red-200' : 'hover:bg-gray-50 border border-transparent'
                  }`}
                >
                  <input
                    type="checkbox"
                    checked={selectedTags.has(tag)}
                    onChange={() => toggleTag(tag)}
                    className="w-4 h-4 rounded border-gray-300 text-red-600 focus:ring-red-500"
                  />
                  <span className="flex-1 text-sm font-medium text-gray-900">{tag}</span>
                  <span className="text-xs text-gray-400">
                    {count} item{count !== 1 ? 's' : ''}
                  </span>
                </label>
              ))}
            </div>
          )}
        </div>

        <div className="p-6 border-t border-gray-200 flex items-center justify-between">
          <span className="text-sm text-gray-500">
            {selectedTags.size} tag{selectedTags.size !== 1 ? 's' : ''} selected
          </span>
          <div className="flex gap-2">
            <button
              onClick={onClose}
              className="px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50 text-sm"
              disabled={removing}
            >
              Cancel
            </button>
            <button
              onClick={handleRemove}
              disabled={removing || selectedTags.size === 0}
              className="flex items-center gap-2 px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 disabled:opacity-50 text-sm"
            >
              {removing ? (
                <>
                  <Loader2 className="w-4 h-4 animate-spin" />
                  Removing...
                </>
              ) : (
                <>
                  <Trash2 className="w-4 h-4" />
                  Remove Tags
                </>
              )}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
