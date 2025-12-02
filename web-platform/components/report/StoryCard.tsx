'use client';

import { User, Calendar, Tag, ArrowRight } from 'lucide-react';
import Link from 'next/link';
import { ScrollReveal } from './ScrollReveal';

interface Story {
  id: string;
  title: string;
  content: string;
  excerpt?: string;
  category?: string;
  author?: {
    name: string;
    image?: string;
    role?: string;
  };
  image?: string;
  date?: string;
  featured?: boolean;
}

interface StoryCardProps {
  story: Story;
  variant?: 'default' | 'featured' | 'compact' | 'horizontal';
  showImage?: boolean;
  showExcerpt?: boolean;
  excerptLength?: number;
  linkTo?: string;
  className?: string;
}

export function StoryCard({
  story,
  variant = 'default',
  showImage = true,
  showExcerpt = true,
  excerptLength = 150,
  linkTo,
  className = '',
}: StoryCardProps) {
  const excerpt = story.excerpt || story.content?.substring(0, excerptLength) + '...';

  const CardWrapper = linkTo
    ? ({ children, className: cn }: { children: React.ReactNode; className: string }) => (
        <Link href={linkTo} className={cn}>
          {children}
        </Link>
      )
    : ({ children, className: cn }: { children: React.ReactNode; className: string }) => (
        <div className={cn}>{children}</div>
      );

  if (variant === 'featured') {
    return (
      <CardWrapper
        className={`group block bg-white rounded-2xl shadow-lg overflow-hidden hover:shadow-xl transition-all duration-300 ${className}`}
      >
        <div className="grid md:grid-cols-2">
          {/* Image */}
          {showImage && (
            <div className="relative h-64 md:h-full bg-gradient-to-br from-[#1e3a5f] to-[#2d6a4f]">
              {story.image ? (
                <img
                  src={story.image}
                  alt={story.title}
                  className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                />
              ) : (
                <div className="w-full h-full flex items-center justify-center">
                  <span className="text-6xl text-white/20">{story.title.charAt(0)}</span>
                </div>
              )}
              {/* Category badge */}
              {story.category && (
                <span className="absolute top-4 left-4 px-3 py-1 bg-white/90 backdrop-blur-sm text-sm font-medium text-gray-800 rounded-full">
                  {story.category}
                </span>
              )}
            </div>
          )}

          {/* Content */}
          <div className="p-8 flex flex-col justify-center">
            <h3 className="text-2xl font-bold text-gray-900 mb-4 group-hover:text-[#1e3a5f] transition-colors">
              {story.title}
            </h3>

            {showExcerpt && (
              <p className="text-gray-600 mb-6 line-clamp-4">{excerpt}</p>
            )}

            {/* Author */}
            {story.author && (
              <div className="flex items-center gap-3 mb-4">
                {story.author.image ? (
                  <img
                    src={story.author.image}
                    alt={story.author.name}
                    className="w-10 h-10 rounded-full object-cover"
                  />
                ) : (
                  <div className="w-10 h-10 rounded-full bg-gray-200 flex items-center justify-center">
                    <User className="w-5 h-5 text-gray-500" />
                  </div>
                )}
                <div>
                  <p className="font-medium text-gray-900">{story.author.name}</p>
                  {story.author.role && (
                    <p className="text-sm text-gray-500">{story.author.role}</p>
                  )}
                </div>
              </div>
            )}

            {linkTo && (
              <span className="inline-flex items-center gap-2 text-[#1e3a5f] font-medium group-hover:gap-3 transition-all">
                Read Story
                <ArrowRight className="w-4 h-4" />
              </span>
            )}
          </div>
        </div>
      </CardWrapper>
    );
  }

  if (variant === 'horizontal') {
    return (
      <CardWrapper
        className={`group flex gap-6 bg-white rounded-xl shadow-md hover:shadow-lg transition-all duration-300 overflow-hidden ${className}`}
      >
        {showImage && (
          <div className="w-32 h-32 flex-shrink-0 bg-gradient-to-br from-[#1e3a5f] to-[#2d6a4f]">
            {story.image ? (
              <img
                src={story.image}
                alt={story.title}
                className="w-full h-full object-cover"
              />
            ) : (
              <div className="w-full h-full flex items-center justify-center">
                <span className="text-2xl text-white/30">{story.title.charAt(0)}</span>
              </div>
            )}
          </div>
        )}
        <div className="flex-1 py-4 pr-4">
          <h4 className="font-bold text-gray-900 mb-2 group-hover:text-[#1e3a5f] transition-colors">
            {story.title}
          </h4>
          {showExcerpt && (
            <p className="text-sm text-gray-600 line-clamp-2">{excerpt}</p>
          )}
          <div className="flex items-center gap-4 mt-3 text-xs text-gray-500">
            {story.author && (
              <span className="flex items-center gap-1">
                <User className="w-3 h-3" />
                {story.author.name}
              </span>
            )}
            {story.category && (
              <span className="flex items-center gap-1">
                <Tag className="w-3 h-3" />
                {story.category}
              </span>
            )}
          </div>
        </div>
      </CardWrapper>
    );
  }

  if (variant === 'compact') {
    return (
      <CardWrapper
        className={`group block p-4 border border-gray-200 rounded-lg hover:border-[#1e3a5f]/30 hover:shadow-md transition-all duration-300 ${className}`}
      >
        <h4 className="font-semibold text-gray-900 mb-2 group-hover:text-[#1e3a5f] transition-colors">
          {story.title}
        </h4>
        <p className="text-sm text-gray-600 line-clamp-2 mb-3">{excerpt}</p>
        <div className="flex items-center justify-between text-xs text-gray-500">
          {story.author && <span>{story.author.name}</span>}
          {story.category && (
            <span className="px-2 py-0.5 bg-gray-100 rounded text-gray-600">
              {story.category}
            </span>
          )}
        </div>
      </CardWrapper>
    );
  }

  // Default variant
  return (
    <CardWrapper
      className={`group block bg-white rounded-2xl shadow-md hover:shadow-xl transition-all duration-300 overflow-hidden ${className}`}
    >
      {/* Image */}
      {showImage && (
        <div className="relative h-48 bg-gradient-to-br from-[#1e3a5f] to-[#2d6a4f] overflow-hidden">
          {story.image ? (
            <img
              src={story.image}
              alt={story.title}
              className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
            />
          ) : (
            <div className="w-full h-full flex items-center justify-center">
              <span className="text-4xl text-white/20">{story.title.charAt(0)}</span>
            </div>
          )}

          {/* Category badge */}
          {story.category && (
            <span className="absolute top-3 right-3 px-2 py-1 bg-white/90 backdrop-blur-sm text-xs font-medium text-gray-800 rounded-full">
              {story.category}
            </span>
          )}
        </div>
      )}

      {/* Content */}
      <div className="p-6">
        <h3 className="text-lg font-bold text-gray-900 mb-3 group-hover:text-[#1e3a5f] transition-colors">
          {story.title}
        </h3>

        {showExcerpt && (
          <p className="text-gray-600 text-sm mb-4 line-clamp-3">{excerpt}</p>
        )}

        {/* Author & Meta */}
        <div className="flex items-center justify-between pt-4 border-t border-gray-100">
          {story.author && (
            <div className="flex items-center gap-2">
              {story.author.image ? (
                <img
                  src={story.author.image}
                  alt={story.author.name}
                  className="w-8 h-8 rounded-full object-cover"
                />
              ) : (
                <div className="w-8 h-8 rounded-full bg-gray-200 flex items-center justify-center">
                  <User className="w-4 h-4 text-gray-500" />
                </div>
              )}
              <span className="text-sm text-gray-700">{story.author.name}</span>
            </div>
          )}

          {linkTo && (
            <span className="text-[#1e3a5f] group-hover:translate-x-1 transition-transform">
              <ArrowRight className="w-5 h-5" />
            </span>
          )}
        </div>
      </div>
    </CardWrapper>
  );
}

// Story grid wrapper
interface StoryGridProps {
  children: React.ReactNode;
  columns?: 2 | 3 | 4;
  className?: string;
}

export function StoryGrid({
  children,
  columns = 3,
  className = '',
}: StoryGridProps) {
  const columnStyles = {
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
