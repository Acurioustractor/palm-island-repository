'use client';

import { User, Calendar, Tag, ArrowRight, AlertCircle, Shield, Quote, Sparkles } from 'lucide-react';
import Link from 'next/link';
import Image from 'next/image';
import type { Story } from '@/lib/stories/types';
import { getCulturalWarning } from '@/lib/stories/cultural-protocols';
import { getStoryExcerpt, getStorytellerName, getStoryImage } from '@/lib/stories/client-utils';

export interface StoryCardProps {
  story: Story;
  variant?: 'default' | 'featured' | 'compact' | 'list';
  showExcerpt?: boolean;
  showStorytellerInfo?: boolean;
  showCulturalWarning?: boolean;
  showQuote?: boolean;
  excerptLength?: number;
  className?: string;
}

// Helper to extract and format a key quote from the story
function getKeyQuote(story: Story): string | null {
  // Try to get from metadata first (AI-generated stories have key_quotes)
  if (story.metadata && typeof story.metadata === 'object') {
    const metadata = story.metadata as any;
    if (metadata.key_quotes && Array.isArray(metadata.key_quotes) && metadata.key_quotes.length > 0) {
      // Get first quote and clean it
      let quote = metadata.key_quotes[0];
      // Remove existing quotes if present
      quote = quote.replace(/^["']|["']$/g, '');
      // Limit length
      if (quote.length > 120) {
        quote = quote.substring(0, 120).trim() + '...';
      }
      return quote;
    }
  }

  // Fallback: extract from content
  if (story.content) {
    // Look for text in quotes
    const quoteMatch = story.content.match(/"([^"]{20,120})"/);
    if (quoteMatch && quoteMatch[1]) {
      return quoteMatch[1];
    }

    // Otherwise return first sentence
    const sentences = story.content.split(/[.!?]+/);
    if (sentences.length > 0 && sentences[0].length > 20) {
      let quote = sentences[0].trim();
      if (quote.length > 120) {
        quote = quote.substring(0, 120).trim() + '...';
      }
      return quote;
    }
  }

  return null;
}

export function StoryCard({
  story,
  variant = 'default',
  showExcerpt = true,
  showStorytellerInfo = true,
  showCulturalWarning = true,
  showQuote = true,
  excerptLength = 150,
  className = '',
}: StoryCardProps) {
  const excerpt = getStoryExcerpt(story.content, excerptLength);
  const storytellerName = getStorytellerName(story.storyteller);
  const storyImage = getStoryImage(story);
  const culturalWarning = getCulturalWarning(story);
  const keyQuote = getKeyQuote(story);
  const storyUrl = `/stories/${story.id}`;

  // Cultural badge
  const CulturalBadge = () => {
    if (!story.contains_traditional_knowledge) return null;

    return (
      <div className="inline-flex items-center gap-1.5 px-2.5 py-1 bg-amber-100 text-amber-800 rounded-full text-xs font-medium shadow-sm">
        <Shield className="w-3 h-3" />
        Traditional Knowledge
      </div>
    );
  };

  // Elder badge - enhanced with better styling
  const ElderBadge = () => {
    if (!story.storyteller?.is_elder) return null;

    return (
      <div className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-gradient-to-r from-purple-600 to-purple-700 text-white rounded-full text-xs font-semibold shadow-md">
        <Shield className="w-3.5 h-3.5" />
        Elder Wisdom
      </div>
    );
  };

  // Storyteller info component - enhanced
  const StorytellerInfo = ({ showRole = true }: { showRole?: boolean }) => {
    if (!story.storyteller) return null;

    const isElder = story.storyteller.is_elder;
    const isCulturalAdvisor = story.storyteller.is_cultural_advisor;
    const profileImageUrl = story.storyteller.profile_image_url;

    return (
      <div className="flex items-center gap-3">
        {/* Avatar - profile image or initial */}
        <div className={`flex-shrink-0 w-10 h-10 rounded-full overflow-hidden ${
          isElder
            ? 'ring-2 ring-purple-200'
            : ''
        }`}>
          {profileImageUrl ? (
            <Image
              src={profileImageUrl}
              alt={storytellerName}
              width={40}
              height={40}
              className="w-full h-full object-cover"
            />
          ) : (
            <div className={`w-full h-full flex items-center justify-center text-white font-semibold text-sm ${
              isElder
                ? 'bg-gradient-to-br from-purple-600 to-purple-700'
                : 'bg-gradient-to-br from-picc-primary to-picc-secondary'
            }`}>
              {storytellerName.charAt(0)}
            </div>
          )}
        </div>

        {/* Name and role */}
        <div className="flex-1 min-w-0">
          <p className="font-semibold text-gray-900 truncate">
            {storytellerName}
          </p>
          {showRole && (isElder || isCulturalAdvisor) && (
            <p className="text-xs font-medium text-purple-600 flex items-center gap-1">
              <Shield className="w-3 h-3" />
              {isElder ? 'Elder' : 'Cultural Advisor'}
            </p>
          )}
        </div>
      </div>
    );
  };

  // Quote display component
  const QuoteDisplay = ({ compact = false }: { compact?: boolean }) => {
    if (!showQuote || !keyQuote) return null;

    return (
      <div className={`relative ${compact ? 'py-2' : 'py-3 px-4'} bg-gray-50 rounded-lg border-l-3 border-picc-primary`}>
        <Quote className="absolute top-2 left-2 w-4 h-4 text-picc-primary/30" />
        <p className={`${compact ? 'text-xs' : 'text-sm'} text-gray-700 italic pl-6 leading-relaxed`}>
          "{keyQuote}"
        </p>
        {storytellerName && !compact && (
          <p className="text-xs text-gray-500 mt-1 pl-6">— {storytellerName}</p>
        )}
      </div>
    );
  };

  // Featured variant - large vertical card with profile image background
  if (variant === 'featured') {
    const isElder = story.storyteller?.is_elder;
    const profileImageUrl = story.storyteller?.profile_image_url;
    const bgGradient = isElder
      ? 'from-purple-900 via-purple-800 to-purple-900'
      : 'from-picc-primary via-picc-secondary to-picc-primary';

    return (
      <Link
        href={storyUrl}
        className={`group block ${className}`}
      >
        <div className="relative aspect-[4/5] rounded-2xl overflow-hidden shadow-2xl hover:shadow-3xl transition-all duration-500">
          {/* Background - storyteller profile image or gradient */}
          {profileImageUrl ? (
            <Image
              src={profileImageUrl}
              alt={storytellerName}
              fill
              className="object-cover"
            />
          ) : (
            <div className={`absolute inset-0 bg-gradient-to-br ${bgGradient}`}>
              {/* Large initial watermark */}
              <div className="absolute inset-0 flex items-center justify-center opacity-5">
                <span className="text-[20rem] font-bold text-white">
                  {storytellerName.charAt(0)}
                </span>
              </div>
            </div>
          )}

          {/* Gradient overlay for text readability - lighter */}
          <div className="absolute inset-0 bg-gradient-to-t from-black/90 via-black/40 to-transparent" />

          {/* Combined badge - top left, smaller */}
          <div className="absolute top-4 left-4">
            <div className="flex items-center gap-1.5 px-3 py-1.5 bg-white/90 backdrop-blur-sm rounded-full shadow-md">
              <Sparkles className="w-3.5 h-3.5 text-amber-500" />
              {isElder && <Shield className="w-3.5 h-3.5 text-purple-600" />}
              <span className="text-xs font-bold text-gray-900">
                {isElder ? 'Featured Elder' : 'Featured'}
              </span>
            </div>
          </div>

          {/* Content - simplified bottom section */}
          <div className="absolute bottom-0 left-0 right-0 p-6 text-white">
            {/* Story title - larger and more prominent */}
            <h3 className="text-2xl font-bold mb-3 line-clamp-2 group-hover:text-white transition-colors">
              {story.title}
            </h3>

            {/* Simple storyteller name */}
            {showStorytellerInfo && story.storyteller && (
              <p className="text-base text-white/90 mb-2">
                {storytellerName}
              </p>
            )}

            {/* Read more indicator */}
            <div className="flex items-center gap-2 text-white/80 text-sm font-medium group-hover:text-white transition-colors">
              <span>Read story</span>
              <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
            </div>
          </div>

          {/* Hover effect overlay */}
          <div className="absolute inset-0 bg-picc-primary/0 group-hover:bg-picc-primary/10 transition-colors duration-300" />
        </div>
      </Link>
    );
  }

  // List variant - horizontal compact
  if (variant === 'list') {
    return (
      <Link
        href={storyUrl}
        className={`group flex gap-4 bg-white p-4 rounded-xl hover:shadow-md transition-all duration-300 ${className}`}
      >
        {storyImage && (
          <div className="w-24 h-24 flex-shrink-0 rounded-lg overflow-hidden bg-gradient-to-br from-picc-primary to-picc-secondary">
            <Image
              src={storyImage}
              alt={story.title}
              width={96}
              height={96}
              className="w-full h-full object-cover"
            />
          </div>
        )}

        <div className="flex-1 min-w-0">
          <div className="flex items-start gap-2 mb-2">
            <h4 className="font-semibold text-gray-900 group-hover:text-picc-primary transition-colors line-clamp-2 flex-1">
              {story.title}
            </h4>
            {story.storyteller?.is_elder && (
              <Shield className="w-4 h-4 text-purple-600 flex-shrink-0" />
            )}
          </div>

          {showExcerpt && excerpt && (
            <p className="text-sm text-gray-600 line-clamp-2 mb-2">{excerpt}</p>
          )}

          <div className="flex items-center gap-3 text-xs text-gray-500">
            {showStorytellerInfo && (
              <span className="flex items-center gap-1">
                <User className="w-3 h-3" />
                {storytellerName}
              </span>
            )}
            {story.emotional_theme && (
              <span className="flex items-center gap-1">
                <Tag className="w-3 h-3" />
                {story.emotional_theme.replace('_', ' ')}
              </span>
            )}
          </div>
        </div>
      </Link>
    );
  }

  // Compact variant - small card
  if (variant === 'compact') {
    return (
      <Link
        href={storyUrl}
        className={`group block p-4 border border-gray-200 rounded-xl hover:border-picc-primary/30 hover:shadow-md transition-all duration-300 ${className}`}
      >
        <div className="flex items-start gap-2 mb-2">
          <h4 className="font-semibold text-gray-900 group-hover:text-picc-primary transition-colors line-clamp-2 flex-1">
            {story.title}
          </h4>
          {story.storyteller?.is_elder && (
            <Shield className="w-4 h-4 text-purple-600 flex-shrink-0" />
          )}
        </div>

        {showExcerpt && excerpt && (
          <p className="text-sm text-gray-600 line-clamp-2 mb-3">{excerpt}</p>
        )}

        <div className="flex items-center justify-between text-xs">
          {showStorytellerInfo && (
            <span className="text-gray-600">{storytellerName}</span>
          )}
          {story.story_type && (
            <span className="px-2 py-0.5 bg-gray-100 rounded text-gray-600 capitalize">
              {story.story_type.replace('_', ' ')}
            </span>
          )}
        </div>
      </Link>
    );
  }

  // Default variant - elegant, image-focused card
  const isElder = story.storyteller?.is_elder;
  const profileImageUrl = story.storyteller?.profile_image_url;
  const bgGradient = isElder
    ? 'from-purple-900 via-purple-800 to-purple-900'
    : 'from-picc-primary via-picc-secondary to-picc-primary';

  return (
    <Link
      href={storyUrl}
      className={`group block ${className}`}
    >
      <div className="relative aspect-[3/4] rounded-2xl overflow-hidden shadow-lg hover:shadow-2xl transition-all duration-500">
        {/* Background - storyteller profile image or gradient */}
        {profileImageUrl ? (
          <Image
            src={profileImageUrl}
            alt={storytellerName}
            fill
            className="object-cover"
          />
        ) : (
          <div className={`absolute inset-0 bg-gradient-to-br ${bgGradient}`}>
            {/* Large initial watermark */}
            <div className="absolute inset-0 flex items-center justify-center opacity-5">
              <span className="text-[16rem] font-bold text-white">
                {storytellerName.charAt(0)}
              </span>
            </div>
          </div>
        )}

        {/* Gradient overlay for text readability */}
        <div className="absolute inset-0 bg-gradient-to-t from-black/90 via-black/50 to-transparent" />

        {/* Elder badge - top corner */}
        {isElder && (
          <div className="absolute top-4 left-4">
            <div className="flex items-center gap-1.5 px-3 py-1.5 bg-white/90 backdrop-blur-sm rounded-full">
              <Shield className="w-3.5 h-3.5 text-purple-600" />
              <span className="text-xs font-bold text-purple-900">Elder</span>
            </div>
          </div>
        )}

        {/* Content - bottom of card */}
        <div className="absolute bottom-0 left-0 right-0 p-6 text-white">
          {/* Quote - if available and short */}
          {keyQuote && keyQuote.length < 150 && (
            <blockquote className="text-lg italic mb-4 leading-relaxed line-clamp-2">
              "{keyQuote.replace(/^["']|["']$/g, '')}"
            </blockquote>
          )}

          {/* Title */}
          <h3 className="text-xl font-bold mb-2 line-clamp-2 group-hover:text-white transition-colors">
            {story.title}
          </h3>

          {/* Storyteller name */}
          {showStorytellerInfo && (
            <p className="text-sm text-white/80 font-medium">
              — {storytellerName}
            </p>
          )}

          {/* Hover arrow */}
          <div className="absolute top-0 right-6 opacity-0 group-hover:opacity-100 transition-opacity transform -translate-y-full -mt-6">
            <div className="w-10 h-10 rounded-full bg-white/20 backdrop-blur-sm flex items-center justify-center">
              <ArrowRight className="w-5 h-5" />
            </div>
          </div>
        </div>
      </div>
    </Link>
  );
}

// Story Grid Component
interface StoryGridProps {
  children: React.ReactNode;
  columns?: 1 | 2 | 3 | 4;
  className?: string;
}

export function StoryGrid({
  children,
  columns = 3,
  className = '',
}: StoryGridProps) {
  const columnStyles = {
    1: 'grid-cols-1',
    2: 'grid-cols-1 md:grid-cols-2',
    3: 'grid-cols-1 md:grid-cols-2 lg:grid-cols-3',
    4: 'grid-cols-1 sm:grid-cols-2 lg:grid-cols-4',
  };

  return (
    <div className={`grid ${columnStyles[columns]} gap-6 ${className}`}>
      {children}
    </div>
  );
}

export default StoryCard;
