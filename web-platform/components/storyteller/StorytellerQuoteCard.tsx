'use client';

import React from 'react';
import Link from 'next/link';
import { Quote, Star, BookOpen, Calendar, MapPin, Sparkles, CheckCircle } from 'lucide-react';

interface ExtractedQuote {
  id: string;
  quote_text: string;
  theme?: string;
  sentiment?: string;
  impact_area?: string;
  is_validated: boolean;
  suggested_for_report: boolean;
  created_at: string;
}

interface StorytellerQuoteCardProps {
  storyteller: {
    id: string;
    full_name: string;
    preferred_name?: string;
    community_role?: string;
    bio?: string;
    storyteller_type?: string;
    is_elder?: boolean;
    location?: string;
    traditional_country?: string;
    profile_image_url?: string;
    stories_contributed?: number;
  };
  quotes: ExtractedQuote[];
  featuredQuote?: ExtractedQuote;
  showAllQuotes?: boolean;
  variant?: 'default' | 'compact' | 'featured';
  className?: string;
}

const themeColors: Record<string, { bg: string; text: string; border: string }> = {
  community: { bg: 'bg-blue-50', text: 'text-blue-700', border: 'border-blue-200' },
  culture: { bg: 'bg-purple-50', text: 'text-purple-700', border: 'border-purple-200' },
  services: { bg: 'bg-teal-50', text: 'text-teal-700', border: 'border-teal-200' },
  history: { bg: 'bg-amber-50', text: 'text-amber-700', border: 'border-amber-200' },
  achievement: { bg: 'bg-green-50', text: 'text-green-700', border: 'border-green-200' },
  resilience: { bg: 'bg-rose-50', text: 'text-rose-700', border: 'border-rose-200' },
  youth: { bg: 'bg-pink-50', text: 'text-pink-700', border: 'border-pink-200' },
  elders: { bg: 'bg-orange-50', text: 'text-orange-700', border: 'border-orange-200' },
  innovation: { bg: 'bg-indigo-50', text: 'text-indigo-700', border: 'border-indigo-200' },
  connection: { bg: 'bg-cyan-50', text: 'text-cyan-700', border: 'border-cyan-200' },
};

const sentimentEmoji: Record<string, string> = {
  positive: '😊',
  inspiring: '✨',
  reflective: '💭',
  grateful: '🙏',
  hopeful: '🌟',
  determined: '💪',
  proud: '🎉',
};

export function StorytellerQuoteCard({
  storyteller,
  quotes,
  featuredQuote,
  showAllQuotes = false,
  variant = 'default',
  className = ''
}: StorytellerQuoteCardProps) {
  const displayName = storyteller.preferred_name || storyteller.full_name;
  const quote = featuredQuote || quotes.find(q => q.suggested_for_report) || quotes[0];
  const validatedQuotes = quotes.filter(q => q.is_validated);
  const reportQuotes = quotes.filter(q => q.suggested_for_report);

  if (variant === 'compact') {
    return (
      <div className={`bg-white rounded-xl border border-gray-200 p-4 hover:shadow-md transition-shadow ${className}`}>
        <div className="flex items-start gap-3">
          {/* Avatar */}
          <div className="flex-shrink-0">
            {storyteller.profile_image_url ? (
              <img
                src={storyteller.profile_image_url}
                alt={displayName}
                className="w-12 h-12 rounded-full object-cover"
              />
            ) : (
              <div className="w-12 h-12 rounded-full bg-gradient-to-br from-purple-400 to-pink-400 flex items-center justify-center text-white font-bold text-lg">
                {displayName.charAt(0)}
              </div>
            )}
          </div>

          {/* Content */}
          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-2 mb-1">
              <h3 className="font-semibold text-gray-900 truncate">{displayName}</h3>
              {storyteller.is_elder && (
                <span className="px-1.5 py-0.5 bg-amber-100 text-amber-700 text-xs rounded">Elder</span>
              )}
            </div>
            {quote && (
              <p className="text-sm text-gray-600 line-clamp-2 italic">
                "{quote.quote_text}"
              </p>
            )}
            <div className="flex items-center gap-2 mt-2 text-xs text-gray-400">
              <span>{quotes.length} quotes</span>
              {validatedQuotes.length > 0 && (
                <span className="flex items-center gap-1 text-green-600">
                  <CheckCircle className="w-3 h-3" />
                  {validatedQuotes.length} validated
                </span>
              )}
            </div>
          </div>
        </div>
      </div>
    );
  }

  if (variant === 'featured') {
    const colors = quote?.theme ? themeColors[quote.theme] || themeColors.community : themeColors.community;

    return (
      <div className={`relative overflow-hidden rounded-2xl ${colors.bg} ${colors.border} border-2 ${className}`}>
        {/* Background Pattern */}
        <div className="absolute inset-0 opacity-5">
          <svg className="w-full h-full" xmlns="http://www.w3.org/2000/svg">
            <pattern id="quote-pattern" x="0" y="0" width="40" height="40" patternUnits="userSpaceOnUse">
              <path d="M0 20 L20 0 L40 20 L20 40 Z" fill="currentColor" />
            </pattern>
            <rect width="100%" height="100%" fill="url(#quote-pattern)" />
          </svg>
        </div>

        <div className="relative p-8">
          {/* Large Quote Icon */}
          <Quote className={`w-16 h-16 ${colors.text} opacity-20 absolute top-4 right-4`} />

          {/* Profile Section */}
          <div className="flex items-center gap-4 mb-6">
            {storyteller.profile_image_url ? (
              <img
                src={storyteller.profile_image_url}
                alt={displayName}
                className="w-20 h-20 rounded-full object-cover border-4 border-white shadow-lg"
              />
            ) : (
              <div className="w-20 h-20 rounded-full bg-gradient-to-br from-purple-500 to-pink-500 flex items-center justify-center text-white font-bold text-2xl border-4 border-white shadow-lg">
                {displayName.charAt(0)}
              </div>
            )}
            <div>
              <h2 className="text-2xl font-bold text-gray-900">{displayName}</h2>
              <div className="flex items-center gap-2 mt-1">
                {storyteller.is_elder && (
                  <span className="px-2 py-0.5 bg-amber-500 text-white text-xs font-medium rounded-full">
                    Elder
                  </span>
                )}
                {storyteller.community_role && (
                  <span className={`${colors.text} text-sm`}>{storyteller.community_role}</span>
                )}
              </div>
              {storyteller.traditional_country && (
                <p className="text-sm text-gray-500 mt-1 flex items-center gap-1">
                  <MapPin className="w-3 h-3" />
                  {storyteller.traditional_country}
                </p>
              )}
            </div>
          </div>

          {/* Featured Quote */}
          {quote && (
            <div className="mb-6">
              <blockquote className="text-xl lg:text-2xl font-medium text-gray-800 leading-relaxed">
                "{quote.quote_text}"
              </blockquote>
              <div className="flex items-center gap-3 mt-4">
                {quote.theme && (
                  <span className={`px-3 py-1 ${colors.bg} ${colors.text} text-sm rounded-full border ${colors.border}`}>
                    {quote.theme}
                  </span>
                )}
                {quote.sentiment && sentimentEmoji[quote.sentiment] && (
                  <span className="text-lg">{sentimentEmoji[quote.sentiment]}</span>
                )}
                {quote.is_validated && (
                  <span className="flex items-center gap-1 text-green-600 text-sm">
                    <CheckCircle className="w-4 h-4" />
                    Validated
                  </span>
                )}
              </div>
            </div>
          )}

          {/* Stats */}
          <div className="flex items-center gap-6 pt-4 border-t border-gray-200/50">
            <div className="flex items-center gap-2 text-gray-600">
              <Quote className="w-5 h-5" />
              <span className="font-medium">{quotes.length} Quotes</span>
            </div>
            {storyteller.stories_contributed && storyteller.stories_contributed > 0 && (
              <div className="flex items-center gap-2 text-gray-600">
                <BookOpen className="w-5 h-5" />
                <span className="font-medium">{storyteller.stories_contributed} Stories</span>
              </div>
            )}
            {reportQuotes.length > 0 && (
              <div className="flex items-center gap-2 text-amber-600">
                <Star className="w-5 h-5" />
                <span className="font-medium">{reportQuotes.length} Report-Ready</span>
              </div>
            )}
          </div>

          {/* Link */}
          <Link
            href={`/picc/storytellers/${storyteller.id}`}
            className={`inline-flex items-center gap-2 mt-4 ${colors.text} hover:underline font-medium`}
          >
            View Full Profile
            <span aria-hidden>→</span>
          </Link>
        </div>
      </div>
    );
  }

  // Default variant
  return (
    <div className={`bg-white rounded-xl border border-gray-200 overflow-hidden hover:shadow-lg transition-shadow ${className}`}>
      {/* Header with Profile */}
      <div className="p-6 bg-gradient-to-r from-purple-50 to-pink-50 border-b border-gray-100">
        <div className="flex items-center gap-4">
          {storyteller.profile_image_url ? (
            <img
              src={storyteller.profile_image_url}
              alt={displayName}
              className="w-16 h-16 rounded-full object-cover border-2 border-white shadow-md"
            />
          ) : (
            <div className="w-16 h-16 rounded-full bg-gradient-to-br from-purple-500 to-pink-500 flex items-center justify-center text-white font-bold text-xl border-2 border-white shadow-md">
              {displayName.charAt(0)}
            </div>
          )}
          <div className="flex-1">
            <div className="flex items-center gap-2">
              <h3 className="text-lg font-bold text-gray-900">{displayName}</h3>
              {storyteller.is_elder && (
                <span className="px-2 py-0.5 bg-amber-500 text-white text-xs font-medium rounded-full">
                  Elder
                </span>
              )}
            </div>
            {storyteller.community_role && (
              <p className="text-sm text-gray-600">{storyteller.community_role}</p>
            )}
            {storyteller.location && (
              <p className="text-xs text-gray-400 flex items-center gap-1 mt-1">
                <MapPin className="w-3 h-3" />
                {storyteller.location}
              </p>
            )}
          </div>
        </div>
      </div>

      {/* Quote Section */}
      <div className="p-6">
        {quote ? (
          <>
            <div className="relative">
              <Quote className="absolute -top-2 -left-2 w-8 h-8 text-purple-200" />
              <blockquote className="pl-6 text-gray-700 italic leading-relaxed">
                "{quote.quote_text}"
              </blockquote>
            </div>
            <div className="flex flex-wrap items-center gap-2 mt-4">
              {quote.theme && (
                <span className={`px-2 py-0.5 text-xs rounded-full ${
                  themeColors[quote.theme]?.bg || 'bg-gray-100'
                } ${themeColors[quote.theme]?.text || 'text-gray-600'}`}>
                  {quote.theme}
                </span>
              )}
              {quote.sentiment && sentimentEmoji[quote.sentiment] && (
                <span className="text-sm">{sentimentEmoji[quote.sentiment]}</span>
              )}
              {quote.suggested_for_report && (
                <span className="flex items-center gap-1 px-2 py-0.5 bg-amber-100 text-amber-700 text-xs rounded-full">
                  <Star className="w-3 h-3" />
                  Report Ready
                </span>
              )}
            </div>
          </>
        ) : (
          <p className="text-gray-400 text-sm italic">No quotes extracted yet</p>
        )}
      </div>

      {/* Additional Quotes Preview */}
      {showAllQuotes && quotes.length > 1 && (
        <div className="px-6 pb-4">
          <p className="text-xs text-gray-500 mb-2">More quotes ({quotes.length - 1}):</p>
          <div className="space-y-2 max-h-32 overflow-y-auto">
            {quotes.slice(1, 4).map((q, idx) => (
              <div key={q.id || idx} className="text-xs text-gray-600 bg-gray-50 rounded p-2">
                "{q.quote_text.length > 100 ? q.quote_text.slice(0, 100) + '...' : q.quote_text}"
              </div>
            ))}
            {quotes.length > 4 && (
              <p className="text-xs text-blue-600">+{quotes.length - 4} more quotes</p>
            )}
          </div>
        </div>
      )}

      {/* Footer Stats */}
      <div className="px-6 py-4 bg-gray-50 border-t border-gray-100 flex items-center justify-between">
        <div className="flex items-center gap-4 text-sm text-gray-500">
          <span className="flex items-center gap-1">
            <Quote className="w-4 h-4" />
            {quotes.length}
          </span>
          {validatedQuotes.length > 0 && (
            <span className="flex items-center gap-1 text-green-600">
              <CheckCircle className="w-4 h-4" />
              {validatedQuotes.length}
            </span>
          )}
          {storyteller.stories_contributed && storyteller.stories_contributed > 0 && (
            <span className="flex items-center gap-1">
              <BookOpen className="w-4 h-4" />
              {storyteller.stories_contributed}
            </span>
          )}
        </div>
        <Link
          href={`/picc/storytellers/${storyteller.id}`}
          className="text-sm text-purple-600 hover:text-purple-700 font-medium"
        >
          View Profile →
        </Link>
      </div>
    </div>
  );
}

// Grid component for displaying multiple cards
export function StorytellerQuoteGrid({
  storytellers,
  variant = 'default'
}: {
  storytellers: Array<{
    storyteller: StorytellerQuoteCardProps['storyteller'];
    quotes: ExtractedQuote[];
  }>;
  variant?: 'default' | 'compact';
}) {
  return (
    <div className={`grid gap-6 ${
      variant === 'compact'
        ? 'grid-cols-1 md:grid-cols-2 lg:grid-cols-3'
        : 'grid-cols-1 md:grid-cols-2'
    }`}>
      {storytellers.map((item) => (
        <StorytellerQuoteCard
          key={item.storyteller.id}
          storyteller={item.storyteller}
          quotes={item.quotes}
          variant={variant}
        />
      ))}
    </div>
  );
}

export default StorytellerQuoteCard;
