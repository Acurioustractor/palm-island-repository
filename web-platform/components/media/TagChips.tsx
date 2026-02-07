'use client';

import { X } from 'lucide-react';

interface TagChipsProps {
  tags: string[];
  onRemove?: (tag: string) => void;
  size?: 'sm' | 'md';
  maxVisible?: number;
}

const TAG_COLORS: Record<string, string> = {
  'service:': 'bg-emerald-500',
  'project:': 'bg-blue-500',
  'fy:': 'bg-purple-500',
  'page:': 'bg-amber-500',
  'annual-report': 'bg-pink-500',
  'story:': 'bg-cyan-500',
};

function getTagColor(tag: string): string {
  for (const [prefix, color] of Object.entries(TAG_COLORS)) {
    if (tag.startsWith(prefix) || tag === prefix) return color;
  }
  return 'bg-gray-400';
}

function getTagLabel(tag: string): string {
  // For service:xyz → xyz
  const parts = tag.split(':');
  if (parts.length > 1) return parts.slice(1).join(':');
  return tag;
}

export function TagDots({ tags, maxVisible = 4 }: { tags: string[]; maxVisible?: number }) {
  const serviceTags = tags.filter(t => t.startsWith('service:'));
  const visible = serviceTags.slice(0, maxVisible);
  const remaining = serviceTags.length - visible.length;

  if (visible.length === 0) return null;

  return (
    <div className="flex items-center gap-0.5">
      {visible.map(tag => (
        <div
          key={tag}
          className={`w-2 h-2 rounded-full ${getTagColor(tag)}`}
          title={tag}
        />
      ))}
      {remaining > 0 && (
        <span className="text-[9px] text-white/80 ml-0.5">+{remaining}</span>
      )}
    </div>
  );
}

export default function TagChips({ tags, onRemove, size = 'sm', maxVisible }: TagChipsProps) {
  const visible = maxVisible ? tags.slice(0, maxVisible) : tags;
  const remaining = maxVisible ? tags.length - visible.length : 0;

  return (
    <div className="flex flex-wrap gap-1">
      {visible.map(tag => (
        <span
          key={tag}
          className={`inline-flex items-center gap-1 rounded-full font-medium ${
            size === 'sm'
              ? 'px-1.5 py-0.5 text-[10px]'
              : 'px-2.5 py-1 text-xs'
          } ${getTagColor(tag)} text-white`}
        >
          {getTagLabel(tag)}
          {onRemove && (
            <button
              onClick={(e) => {
                e.stopPropagation();
                onRemove(tag);
              }}
              className="hover:bg-white/20 rounded-full p-0.5"
            >
              <X className={size === 'sm' ? 'w-2.5 h-2.5' : 'w-3 h-3'} />
            </button>
          )}
        </span>
      ))}
      {remaining > 0 && (
        <span className={`text-gray-500 ${size === 'sm' ? 'text-[10px]' : 'text-xs'}`}>
          +{remaining} more
        </span>
      )}
    </div>
  );
}
