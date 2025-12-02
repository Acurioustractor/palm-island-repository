'use client';

import React, { useState, useEffect } from 'react';
import Image from 'next/image';
import { MessageSquareQuote, ChevronLeft, ChevronRight } from 'lucide-react';

interface Quote {
  id: string;
  quote_text: string;
  attribution: string;
  context?: string;
  theme?: string;
  sentiment?: string;
  impact_area?: string;
  photo_url?: string;
}

interface QuoteShowcaseProps {
  quotes: Quote[];
  layout?: 'carousel' | 'grid' | 'masonry' | 'featured';
  autoPlay?: boolean;
  autoPlayInterval?: number;
  showAnalysis?: boolean;
  className?: string;
}

export function QuoteShowcase({
  quotes,
  layout = 'carousel',
  autoPlay = true,
  autoPlayInterval = 8000,
  showAnalysis = false,
  className = '',
}: QuoteShowcaseProps) {
  const [activeIndex, setActiveIndex] = useState(0);

  useEffect(() => {
    if (!autoPlay || layout !== 'carousel' || quotes.length <= 1) return;

    const timer = setInterval(() => {
      setActiveIndex((prev) => (prev + 1) % quotes.length);
    }, autoPlayInterval);

    return () => clearInterval(timer);
  }, [autoPlay, autoPlayInterval, quotes.length, layout]);

  const themeGradients: Record<string, string> = {
    community: 'from-purple-600 to-pink-600',
    services: 'from-blue-600 to-cyan-600',
    culture: 'from-amber-600 to-orange-600',
    history: 'from-emerald-600 to-teal-600',
    achievement: 'from-yellow-500 to-amber-600',
    youth: 'from-pink-600 to-rose-600',
    employment: 'from-indigo-600 to-purple-600',
    health: 'from-green-600 to-emerald-600',
  };

  if (quotes.length === 0) return null;

  // Carousel Layout
  if (layout === 'carousel') {
    const quote = quotes[activeIndex];

    return (
      <section className={`relative py-16 md:py-24 ${className}`}>
        <div className="max-w-6xl mx-auto px-6 md:px-8">
          {/* Main Quote Card */}
          <div className="relative">
            <div
              className={`relative rounded-3xl overflow-hidden shadow-2xl bg-gradient-to-br ${
                themeGradients[quote.theme || ''] || 'from-purple-600 to-pink-600'
              }`}
            >
              {/* Background Pattern */}
              <div className="absolute inset-0 opacity-10">
                <svg className="w-full h-full" viewBox="0 0 100 100" preserveAspectRatio="none">
                  <defs>
                    <pattern id="quote-pattern" x="0" y="0" width="20" height="20" patternUnits="userSpaceOnUse">
                      <circle cx="10" cy="10" r="2" fill="white" />
                    </pattern>
                  </defs>
                  <rect fill="url(#quote-pattern)" width="100%" height="100%" />
                </svg>
              </div>

              <div className="relative grid grid-cols-1 md:grid-cols-5 min-h-[400px] md:min-h-[500px]">
                {/* Photo Section */}
                {quote.photo_url && (
                  <div className="md:col-span-2 relative">
                    <Image
                      src={quote.photo_url}
                      alt={quote.attribution || 'Quote author'}
                      fill
                      className="object-cover"
                    />
                    <div className="absolute inset-0 bg-gradient-to-r from-transparent via-transparent to-black/30 md:bg-gradient-to-l" />
                  </div>
                )}

                {/* Quote Content */}
                <div
                  className={`${
                    quote.photo_url ? 'md:col-span-3' : 'md:col-span-5'
                  } flex flex-col justify-center p-8 md:p-12 text-white`}
                >
                  {/* Quote Icon */}
                  <svg
                    className="w-12 h-12 md:w-16 md:h-16 text-white/30 mb-6"
                    fill="currentColor"
                    viewBox="0 0 32 32"
                  >
                    <path d="M10 8c-3.3 0-6 2.7-6 6v10h10V14h-6c0-2.2 1.8-4 4-4V8zm16 0c-3.3 0-6 2.7-6 6v10h10V14h-6c0-2.2 1.8-4 4-4V8z" />
                  </svg>

                  {/* Quote Text */}
                  <blockquote className="text-2xl md:text-4xl font-bold leading-tight mb-6">
                    &ldquo;{quote.quote_text}&rdquo;
                  </blockquote>

                  {/* Attribution */}
                  {quote.attribution && (
                    <div className="text-lg md:text-xl font-semibold text-white/90">
                      — {quote.attribution}
                    </div>
                  )}

                  {/* Context */}
                  {quote.context && (
                    <p className="mt-3 text-white/70 italic">{quote.context}</p>
                  )}

                  {/* Analysis Tags */}
                  {showAnalysis && (quote.theme || quote.impact_area) && (
                    <div className="flex flex-wrap gap-2 mt-6">
                      {quote.theme && (
                        <span className="px-3 py-1 rounded-full text-sm font-medium bg-white/20 backdrop-blur-sm capitalize">
                          {quote.theme}
                        </span>
                      )}
                      {quote.impact_area && (
                        <span className="px-3 py-1 rounded-full text-sm font-medium bg-white/20 backdrop-blur-sm">
                          Impact: {quote.impact_area}
                        </span>
                      )}
                    </div>
                  )}
                </div>
              </div>
            </div>

            {/* Navigation */}
            {quotes.length > 1 && (
              <>
                <button
                  onClick={() =>
                    setActiveIndex((prev) => (prev - 1 + quotes.length) % quotes.length)
                  }
                  className="absolute left-4 top-1/2 -translate-y-1/2 p-3 rounded-full bg-white/90 hover:bg-white shadow-lg transition-all hover:scale-110"
                  aria-label="Previous quote"
                >
                  <ChevronLeft className="w-6 h-6 text-gray-800" />
                </button>
                <button
                  onClick={() =>
                    setActiveIndex((prev) => (prev + 1) % quotes.length)
                  }
                  className="absolute right-4 top-1/2 -translate-y-1/2 p-3 rounded-full bg-white/90 hover:bg-white shadow-lg transition-all hover:scale-110"
                  aria-label="Next quote"
                >
                  <ChevronRight className="w-6 h-6 text-gray-800" />
                </button>
              </>
            )}
          </div>

          {/* Dots Indicator */}
          {quotes.length > 1 && (
            <div className="flex justify-center gap-2 mt-6">
              {quotes.map((_, index) => (
                <button
                  key={index}
                  onClick={() => setActiveIndex(index)}
                  className={`w-3 h-3 rounded-full transition-all ${
                    index === activeIndex
                      ? 'bg-purple-600 w-8'
                      : 'bg-gray-300 hover:bg-gray-400'
                  }`}
                  aria-label={`Go to quote ${index + 1}`}
                />
              ))}
            </div>
          )}
        </div>
      </section>
    );
  }

  // Grid Layout
  if (layout === 'grid') {
    return (
      <section className={`py-16 md:py-24 ${className}`}>
        <div className="max-w-7xl mx-auto px-6 md:px-8">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {quotes.map((quote) => (
              <QuoteCard
                key={quote.id}
                quote={quote}
                themeGradients={themeGradients}
                showAnalysis={showAnalysis}
              />
            ))}
          </div>
        </div>
      </section>
    );
  }

  // Masonry Layout
  if (layout === 'masonry') {
    const columns = [
      quotes.filter((_, i) => i % 3 === 0),
      quotes.filter((_, i) => i % 3 === 1),
      quotes.filter((_, i) => i % 3 === 2),
    ];

    return (
      <section className={`py-16 md:py-24 ${className}`}>
        <div className="max-w-7xl mx-auto px-6 md:px-8">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {columns.map((columnQuotes, colIndex) => (
              <div key={colIndex} className="space-y-6">
                {columnQuotes.map((quote, index) => (
                  <QuoteCard
                    key={quote.id}
                    quote={quote}
                    themeGradients={themeGradients}
                    showAnalysis={showAnalysis}
                    size={index === 0 ? 'large' : 'small'}
                  />
                ))}
              </div>
            ))}
          </div>
        </div>
      </section>
    );
  }

  // Featured Layout - One large quote with smaller ones below
  if (layout === 'featured') {
    const [featured, ...rest] = quotes;

    return (
      <section className={`py-16 md:py-24 ${className}`}>
        <div className="max-w-7xl mx-auto px-6 md:px-8 space-y-8">
          {/* Featured Quote */}
          <div
            className={`relative rounded-3xl overflow-hidden shadow-2xl bg-gradient-to-br ${
              themeGradients[featured.theme || ''] || 'from-purple-600 to-pink-600'
            }`}
          >
            <div className="grid grid-cols-1 md:grid-cols-2 min-h-[500px]">
              {featured.photo_url && (
                <div className="relative">
                  <Image
                    src={featured.photo_url}
                    alt={featured.attribution || 'Quote author'}
                    fill
                    className="object-cover"
                  />
                </div>
              )}
              <div
                className={`${
                  featured.photo_url ? '' : 'md:col-span-2'
                } flex flex-col justify-center p-10 md:p-16 text-white`}
              >
                <svg
                  className="w-16 h-16 text-white/30 mb-8"
                  fill="currentColor"
                  viewBox="0 0 32 32"
                >
                  <path d="M10 8c-3.3 0-6 2.7-6 6v10h10V14h-6c0-2.2 1.8-4 4-4V8zm16 0c-3.3 0-6 2.7-6 6v10h10V14h-6c0-2.2 1.8-4 4-4V8z" />
                </svg>
                <blockquote className="text-3xl md:text-5xl font-bold leading-tight mb-8">
                  &ldquo;{featured.quote_text}&rdquo;
                </blockquote>
                {featured.attribution && (
                  <div className="text-xl md:text-2xl font-semibold text-white/90">
                    — {featured.attribution}
                  </div>
                )}
                {featured.context && (
                  <p className="mt-4 text-white/70 italic text-lg">{featured.context}</p>
                )}
              </div>
            </div>
          </div>

          {/* Supporting Quotes */}
          {rest.length > 0 && (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {rest.slice(0, 3).map((quote) => (
                <QuoteCard
                  key={quote.id}
                  quote={quote}
                  themeGradients={themeGradients}
                  showAnalysis={showAnalysis}
                  size="small"
                />
              ))}
            </div>
          )}
        </div>
      </section>
    );
  }

  return null;
}

// Individual Quote Card Component
function QuoteCard({
  quote,
  themeGradients,
  showAnalysis,
  size = 'medium',
}: {
  quote: Quote;
  themeGradients: Record<string, string>;
  showAnalysis?: boolean;
  size?: 'small' | 'medium' | 'large';
}) {
  const sizeClasses = {
    small: 'text-lg',
    medium: 'text-xl',
    large: 'text-2xl md:text-3xl',
  };

  return (
    <div
      className={`relative rounded-2xl overflow-hidden shadow-xl bg-gradient-to-br ${
        themeGradients[quote.theme || ''] || 'from-gray-700 to-gray-900'
      } hover:shadow-2xl hover:scale-[1.02] transition-all duration-300`}
    >
      {quote.photo_url && (
        <div className="relative h-48">
          <Image
            src={quote.photo_url}
            alt={quote.attribution || 'Quote author'}
            fill
            className="object-cover"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-black/70 to-transparent" />
        </div>
      )}

      <div className={`p-6 text-white ${quote.photo_url ? '' : 'pt-8'}`}>
        {/* Quote Icon */}
        <svg
          className="w-8 h-8 text-white/30 mb-4"
          fill="currentColor"
          viewBox="0 0 32 32"
        >
          <path d="M10 8c-3.3 0-6 2.7-6 6v10h10V14h-6c0-2.2 1.8-4 4-4V8zm16 0c-3.3 0-6 2.7-6 6v10h10V14h-6c0-2.2 1.8-4 4-4V8z" />
        </svg>

        <blockquote className={`${sizeClasses[size]} font-bold leading-tight mb-4`}>
          &ldquo;{quote.quote_text}&rdquo;
        </blockquote>

        {quote.attribution && (
          <div className="font-semibold text-white/90">— {quote.attribution}</div>
        )}

        {showAnalysis && (quote.theme || quote.impact_area) && (
          <div className="flex flex-wrap gap-2 mt-4">
            {quote.theme && (
              <span className="px-2 py-0.5 rounded-full text-xs font-medium bg-white/20 backdrop-blur-sm capitalize">
                {quote.theme}
              </span>
            )}
            {quote.impact_area && (
              <span className="px-2 py-0.5 rounded-full text-xs font-medium bg-white/20 backdrop-blur-sm">
                {quote.impact_area}
              </span>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
