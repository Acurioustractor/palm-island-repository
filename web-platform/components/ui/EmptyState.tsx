import React from 'react';
import Link from 'next/link';
import { LucideIcon, Mic, BookOpen, Search, Users, FolderOpen } from 'lucide-react';
import { Button } from './Button';

type EmptyStateType = 'stories' | 'search' | 'people' | 'general' | 'filter';

interface EmptyStateProps {
  type?: EmptyStateType;
  title?: string;
  description?: string;
  icon?: LucideIcon;
  actionLabel?: string;
  actionHref?: string;
  onAction?: () => void;
  className?: string;
}

const defaultContent: Record<EmptyStateType, { icon: LucideIcon; title: string; description: string; actionLabel?: string; actionHref?: string }> = {
  stories: {
    icon: BookOpen,
    title: 'No stories yet',
    description: 'Be the first to share your voice and inspire the community. Every story matters.',
    actionLabel: 'Share Your Story',
    actionHref: '/share-voice',
  },
  search: {
    icon: Search,
    title: 'No results found',
    description: 'Try adjusting your search terms or filters to find what you\'re looking for.',
  },
  people: {
    icon: Users,
    title: 'No storytellers found',
    description: 'Community members who share their stories will appear here.',
    actionLabel: 'View All People',
    actionHref: '/wiki/people',
  },
  filter: {
    icon: FolderOpen,
    title: 'No items match your filter',
    description: 'Try adjusting your filters or clearing them to see more results.',
  },
  general: {
    icon: FolderOpen,
    title: 'Nothing here yet',
    description: 'Content will appear here once it\'s been added.',
  },
};

export function EmptyState({
  type = 'general',
  title,
  description,
  icon,
  actionLabel,
  actionHref,
  onAction,
  className = '',
}: EmptyStateProps) {
  const defaults = defaultContent[type];
  const Icon = icon || defaults.icon;
  const displayTitle = title || defaults.title;
  const displayDescription = description || defaults.description;
  const displayActionLabel = actionLabel || defaults.actionLabel;
  const displayActionHref = actionHref || defaults.actionHref;

  return (
    <div className={`text-center py-16 px-8 ${className}`}>
      {/* Icon with decorative background */}
      <div className="relative inline-block mb-8">
        <div className="absolute inset-0 bg-gradient-to-br from-warm-100 to-picc-ochre-100 rounded-full blur-xl opacity-40" />
        <div className="relative p-5 bg-gradient-to-br from-warm-50 to-picc-ochre-50 rounded-full border border-warm-100">
          <Icon className="w-10 h-10 text-picc-red" />
        </div>
      </div>

      {/* Title */}
      <h3 className="text-lg font-semibold text-gray-900 mb-2">{displayTitle}</h3>

      {/* Description */}
      <p className="text-gray-500 text-sm max-w-sm mx-auto mb-8">{displayDescription}</p>

      {/* Action Button */}
      {(displayActionHref || onAction) && displayActionLabel && (
        <Button
          variant="cta"
          href={displayActionHref}
          onClick={onAction}
          icon={type === 'stories' ? Mic : undefined}
        >
          {displayActionLabel}
        </Button>
      )}

      {/* Encouraging message */}
      <p className="mt-10 text-xs text-gray-400 italic">
        Every voice strengthens our community.
      </p>
    </div>
  );
}

export default EmptyState;
