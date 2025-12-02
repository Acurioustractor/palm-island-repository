'use client';

import Link from 'next/link';
import { Quote, ArrowRight } from 'lucide-react';

interface PersonQuoteCardProps {
  name: string;
  role?: string;
  quote: string;
  image?: string;
  storyLink?: string;
  storyTitle?: string;
  variant?: 'default' | 'featured' | 'compact';
}

export function PersonQuoteCard({
  name,
  role,
  quote,
  image,
  storyLink,
  storyTitle,
  variant = 'default',
}: PersonQuoteCardProps) {
  const cardContent = (
    <div
      className={`group relative overflow-hidden rounded-2xl transition-all duration-300 ${
        variant === 'featured'
          ? 'bg-gradient-to-br from-[#1e3a5f] to-[#2d6a4f] text-white'
          : variant === 'compact'
          ? 'bg-white shadow-sm hover:shadow-md border border-gray-100'
          : 'bg-white shadow-lg hover:shadow-xl'
      } ${storyLink ? 'cursor-pointer hover:-translate-y-1' : ''}`}
    >
      <div className={`flex ${variant === 'compact' ? 'flex-row items-center gap-4 p-4' : 'flex-col'}`}>
        {/* Person Image */}
        <div
          className={`relative overflow-hidden ${
            variant === 'compact'
              ? 'w-16 h-16 rounded-full flex-shrink-0'
              : variant === 'featured'
              ? 'h-72'
              : 'h-64'
          }`}
        >
          {image ? (
            <img
              src={image}
              alt={name}
              className={`w-full h-full object-cover ${
                variant !== 'compact' ? 'group-hover:scale-105 transition-transform duration-500' : ''
              }`}
            />
          ) : (
            <div
              className={`w-full h-full flex items-center justify-center ${
                variant === 'featured'
                  ? 'bg-white/10'
                  : 'bg-gradient-to-br from-[#1e3a5f]/10 to-[#2d6a4f]/20'
              }`}
            >
              <div
                className={`rounded-full bg-gradient-to-br from-[#1e3a5f] to-[#2d6a4f] flex items-center justify-center text-white font-bold ${
                  variant === 'compact' ? 'w-12 h-12 text-lg' : 'w-24 h-24 text-3xl'
                }`}
              >
                {name
                  .split(' ')
                  .map((n) => n[0])
                  .join('')
                  .slice(0, 2)
                  .toUpperCase()}
              </div>
            </div>
          )}

          {/* Gradient overlay for non-compact */}
          {variant !== 'compact' && (
            <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-black/20 to-transparent" />
          )}

          {/* Name overlay on image for non-compact */}
          {variant !== 'compact' && (
            <div className="absolute bottom-0 left-0 right-0 p-4">
              <h3 className="text-xl font-bold text-white">{name}</h3>
              {role && <p className="text-sm text-white/80">{role}</p>}
            </div>
          )}
        </div>

        {/* Quote Content */}
        <div className={variant === 'compact' ? 'flex-1 min-w-0' : 'p-6'}>
          {variant === 'compact' && (
            <h3 className="font-semibold text-gray-900 text-sm">{name}</h3>
          )}

          <div className="relative">
            {variant !== 'compact' && (
              <Quote
                className={`w-8 h-8 mb-2 ${
                  variant === 'featured' ? 'text-white/30' : 'text-[#e85d04]/30'
                }`}
              />
            )}
            <p
              className={`${
                variant === 'compact'
                  ? 'text-gray-600 text-sm line-clamp-2'
                  : variant === 'featured'
                  ? 'text-white/90 text-lg leading-relaxed'
                  : 'text-gray-700 leading-relaxed'
              }`}
            >
              "{variant === 'compact' ? quote.slice(0, 100) + (quote.length > 100 ? '...' : '') : quote}"
            </p>
          </div>

          {/* Story Link */}
          {storyLink && variant !== 'compact' && (
            <div className="mt-4 pt-4 border-t border-gray-100/20">
              <div
                className={`flex items-center gap-2 text-sm font-medium ${
                  variant === 'featured'
                    ? 'text-[#e85d04]'
                    : 'text-[#1e3a5f] group-hover:text-[#e85d04]'
                } transition-colors`}
              >
                <span>{storyTitle || 'Read their story'}</span>
                <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );

  if (storyLink) {
    return <Link href={storyLink}>{cardContent}</Link>;
  }

  return cardContent;
}

// Grid component for multiple person quote cards
interface PersonQuoteGridProps {
  people: Array<{
    name: string;
    role?: string;
    quote: string;
    image?: string;
    storyLink?: string;
    storyTitle?: string;
  }>;
  columns?: 2 | 3 | 4;
  variant?: 'default' | 'featured' | 'compact';
}

export function PersonQuoteGrid({
  people,
  columns = 3,
  variant = 'default',
}: PersonQuoteGridProps) {
  const colClass = {
    2: 'md:grid-cols-2',
    3: 'md:grid-cols-2 lg:grid-cols-3',
    4: 'md:grid-cols-2 lg:grid-cols-4',
  };

  return (
    <div className={`grid grid-cols-1 ${colClass[columns]} gap-6`}>
      {people.map((person, index) => (
        <PersonQuoteCard key={index} {...person} variant={variant} />
      ))}
    </div>
  );
}
