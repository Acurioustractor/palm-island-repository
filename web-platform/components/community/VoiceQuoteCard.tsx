'use client';

import { BespokeIcon, type BespokeIconName } from '@/components/ui/BespokeIcon';
import Link from 'next/link';

export interface VoiceQuote {
  id: string;
  quote_text: string;
  speaker_name: string;
  speaker_role?: string;
  theme?: string;
  sentiment?: string;
  profile_image_url?: string;
  story_id?: string;
  storyteller_id?: string;
  /** Slug of the matched EL v2 storyteller, when speaker_name resolves to a known profile. Drives the "→ See profile" link. */
  speaker_slug?: string;
  source: 'elder' | 'extracted';
}

const THEME_STYLES: Record<string, { bg: string; accent: string }> = {
  community: { bg: 'bg-warm-50', accent: 'text-picc-red' },
  culture: { bg: 'bg-picc-ochre-50', accent: 'text-picc-ochre' },
  healing: { bg: 'bg-sage-50', accent: 'text-sage-600' },
  family: { bg: 'bg-warm-100', accent: 'text-picc-earth' },
  country: { bg: 'bg-sage-50', accent: 'text-sage-700' },
  language: { bg: 'bg-picc-ochre-50', accent: 'text-picc-ochre-700' },
  youth: { bg: 'bg-picc-red-50', accent: 'text-picc-red' },
  services: { bg: 'bg-warm-50', accent: 'text-picc-ochre' },
  history: { bg: 'bg-warm-100', accent: 'text-picc-earth' },
  achievement: { bg: 'bg-sage-50', accent: 'text-sage-600' },
  resilience: { bg: 'bg-warm-100', accent: 'text-picc-red' },
  innovation: { bg: 'bg-warm-50', accent: 'text-picc-ochre' },
  connection: { bg: 'bg-warm-50', accent: 'text-picc-earth' },
};

const SENTIMENT_ICONS: Record<string, BespokeIconName> = {
  positive: 'positive',
  inspiring: 'inspiring',
  reflective: 'reflective',
  grateful: 'grateful',
  hopeful: 'hopeful',
  determined: 'determined',
  proud: 'proud',
};

interface VoiceQuoteCardProps {
  quote: VoiceQuote;
  size?: 'sm' | 'md' | 'lg';
  className?: string;
}

export default function VoiceQuoteCard({ quote, size = 'md', className = '' }: VoiceQuoteCardProps) {
  const theme = quote.theme?.toLowerCase() || 'community';
  const styles = THEME_STYLES[theme] || THEME_STYLES.community;

  const textSize = size === 'lg' ? 'text-lg lg:text-xl' : size === 'sm' ? 'text-sm' : 'text-base';
  const padding = size === 'lg' ? 'p-8' : size === 'sm' ? 'p-4' : 'p-6';

  return (
    <div className={`${styles.bg} rounded-2xl border border-warm-200 ${padding} hover:shadow-md transition-all group ${className}`}>
      {/* Quote icon */}
      <BespokeIcon name="quote" size={size === 'lg' ? 28 : 20} className={`${styles.accent} opacity-40 mb-3`} />

      {/* Quote text */}
      <blockquote className={`${textSize} text-picc-earth leading-relaxed font-serif italic mb-4`}>
        &ldquo;{quote.quote_text}&rdquo;
      </blockquote>

      {/* Attribution */}
      <div className="flex items-center gap-3">
        {quote.profile_image_url ? (
          <img
            src={quote.profile_image_url}
            alt={quote.speaker_name}
            className="w-10 h-10 rounded-full object-cover border-2 border-white shadow-sm"
          />
        ) : (
          <div className="w-10 h-10 rounded-full bg-gradient-to-br from-picc-ochre to-picc-red flex items-center justify-center text-white font-bold text-sm border-2 border-white shadow-sm">
            {quote.speaker_name.charAt(0)}
          </div>
        )}
        <div className="flex-1 min-w-0">
          <p className="font-semibold text-picc-earth text-sm truncate">{quote.speaker_name}</p>
          {quote.speaker_role && (
            <p className="text-xs text-picc-earth-300 truncate">{quote.speaker_role}</p>
          )}
        </div>
        {quote.sentiment && SENTIMENT_ICONS[quote.sentiment] && (
          <BespokeIcon name={SENTIMENT_ICONS[quote.sentiment]} size={18} className="opacity-60" />
        )}
      </div>

      {/* Theme + link */}
      <div className="flex items-center justify-between mt-3 pt-3 border-t border-warm-200/50">
        {quote.theme && (
          <span className={`text-xs font-medium ${styles.accent} capitalize`}>{quote.theme}</span>
        )}
        <div className="flex items-center gap-3">
          {quote.speaker_slug && (
            <Link
              href={`/voices/${quote.speaker_slug}`}
              className="text-xs text-picc-ochre hover:underline opacity-0 group-hover:opacity-100 transition-opacity"
            >
              See profile →
            </Link>
          )}
          {quote.story_id && (
            <Link
              href={`/stories/${quote.story_id}`}
              className="text-xs text-picc-ochre hover:underline opacity-0 group-hover:opacity-100 transition-opacity"
            >
              Read story →
            </Link>
          )}
        </div>
      </div>
    </div>
  );
}
