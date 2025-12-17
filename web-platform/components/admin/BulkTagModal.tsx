'use client';

import { useState } from 'react';
import { X, Check, Loader2, Plus, Minus } from 'lucide-react';
import { TagPicker } from './TagPicker';
import { TagCategory } from '@/lib/taxonomy/placement-tags';

type TagMode = 'add' | 'remove';

interface BulkTagModalProps {
  isOpen: boolean;
  onClose: () => void;
  onApply: (tags: string[], mode: TagMode) => Promise<void>;
  categories: TagCategory[];
  selectedCount: number;
  itemLabel?: string;
  title?: string;
}

export function BulkTagModal({
  isOpen,
  onClose,
  onApply,
  categories,
  selectedCount,
  itemLabel = 'item',
  title = 'Manage Tags',
}: BulkTagModalProps) {
  const [selectedTags, setSelectedTags] = useState<string[]>([]);
  const [mode, setMode] = useState<TagMode>('add');
  const [isApplying, setIsApplying] = useState(false);

  if (!isOpen) return null;

  const pluralLabel = selectedCount === 1 ? itemLabel : `${itemLabel}s`;

  const handleApply = async () => {
    if (selectedTags.length === 0) return;

    setIsApplying(true);
    try {
      await onApply(selectedTags, mode);
      setSelectedTags([]);
      onClose();
    } catch (error) {
      console.error('Failed to apply tags:', error);
    } finally {
      setIsApplying(false);
    }
  };

  const handleClose = () => {
    if (!isApplying) {
      setSelectedTags([]);
      onClose();
    }
  };

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-xl w-full max-w-lg shadow-xl">
        {/* Header */}
        <div className="p-6 border-b border-gray-200">
          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-xl font-bold text-gray-900">{title}</h2>
              <p className="text-sm text-gray-600 mt-1">
                {mode === 'add' ? 'Add tags to' : 'Remove tags from'} {selectedCount}{' '}
                {pluralLabel}
              </p>
            </div>
            <button
              onClick={handleClose}
              disabled={isApplying}
              className="p-2 text-gray-400 hover:text-gray-600 hover:bg-gray-100 rounded-lg disabled:opacity-50"
            >
              <X className="w-5 h-5" />
            </button>
          </div>

          {/* Mode toggle */}
          <div className="flex items-center gap-2 mt-4">
            <button
              onClick={() => setMode('add')}
              className={`flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
                mode === 'add'
                  ? 'bg-green-100 text-green-700 border-2 border-green-300'
                  : 'bg-gray-100 text-gray-600 border-2 border-transparent hover:bg-gray-200'
              }`}
            >
              <Plus className="w-4 h-4" />
              Add Tags
            </button>
            <button
              onClick={() => setMode('remove')}
              className={`flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
                mode === 'remove'
                  ? 'bg-red-100 text-red-700 border-2 border-red-300'
                  : 'bg-gray-100 text-gray-600 border-2 border-transparent hover:bg-gray-200'
              }`}
            >
              <Minus className="w-4 h-4" />
              Remove Tags
            </button>
          </div>
        </div>

        {/* Tag picker */}
        <div className="p-6">
          <TagPicker
            categories={categories}
            selectedTags={selectedTags}
            onChange={setSelectedTags}
            maxHeight="350px"
          />
        </div>

        {/* Footer */}
        <div className="p-6 border-t border-gray-200 flex items-center justify-between">
          <div className="text-sm text-gray-500">
            {selectedTags.length > 0 ? (
              <>
                <span className="font-medium">{selectedTags.length}</span> tag
                {selectedTags.length !== 1 ? 's' : ''} selected
              </>
            ) : (
              'Select tags to apply'
            )}
          </div>

          <div className="flex gap-3">
            <button
              onClick={handleClose}
              disabled={isApplying}
              className="px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 disabled:opacity-50"
            >
              Cancel
            </button>
            <button
              onClick={handleApply}
              disabled={isApplying || selectedTags.length === 0}
              className={`px-4 py-2 rounded-lg disabled:opacity-50 disabled:cursor-not-allowed inline-flex items-center gap-2 font-medium ${
                mode === 'add'
                  ? 'bg-green-600 text-white hover:bg-green-700'
                  : 'bg-red-600 text-white hover:bg-red-700'
              }`}
            >
              {isApplying ? (
                <>
                  <Loader2 className="w-4 h-4 animate-spin" />
                  Applying...
                </>
              ) : (
                <>
                  <Check className="w-4 h-4" />
                  {mode === 'add' ? 'Add Tags' : 'Remove Tags'}
                </>
              )}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

export default BulkTagModal;
