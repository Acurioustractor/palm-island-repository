'use client';

import { useState, useEffect, useMemo } from 'react';
import { createClient } from '@/lib/supabase/client';
import VoiceQuoteCard, { type VoiceQuote } from './VoiceQuoteCard';
import { BespokeIcon } from '@/components/ui/BespokeIcon';

const THEMES = [
  'community', 'culture', 'healing', 'family', 'country',
  'language', 'youth', 'services', 'achievement', 'resilience',
];

export interface StorytellerLookup {
  /** Display name as it appears in EL v2. */
  name: string;
  /** Slug used by /voices/<slug> route. */
  slug: string;
}

interface VoiceWallProps {
  className?: string;
  /** Optional EL v2 storyteller index. When provided, quote speakers that
      match by normalised display_name get a "→ See profile" link to the
      per-person route at /voices/<slug>. */
  storytellerIndex?: StorytellerLookup[];
}

function normaliseName(name: string): string {
  return name
    .toLowerCase()
    .normalize('NFKD')
    .replace(/[\u0300-\u036f]/g, '')
    .replace(/[^a-z0-9 ]+/g, ' ')
    .replace(/\s+/g, ' ')
    .trim();
}

export default function VoiceWall({ className = '', storytellerIndex = [] }: VoiceWallProps) {
  const [quotes, setQuotes] = useState<VoiceQuote[]>([]);
  const [loading, setLoading] = useState(true);
  const [activeThemes, setActiveThemes] = useState<Set<string>>(new Set());

  // Build the name → slug map once. Used to resolve speaker_slug on each
  // quote so the "→ See profile" link can render.
  const nameToSlug = useMemo(() => {
    const map = new Map<string, string>();
    for (const s of storytellerIndex) {
      map.set(normaliseName(s.name), s.slug);
    }
    return map;
  }, [storytellerIndex]);

  useEffect(() => {
    async function loadQuotes() {
      const supabase = createClient();
      const allQuotes: VoiceQuote[] = [];

      // 1. Elder quotes — only culturally appropriate ones
      const { data: elderQuotes } = await supabase
        .from('elder_quotes')
        .select('id, text, speaker_name, speaker_role, theme, category, cultural_sensitivity, permission_level, source_story_id')
        .in('permission_level', ['public', 'community'])
        .neq('cultural_sensitivity', 'restricted')
        .limit(100);

      if (elderQuotes) {
        elderQuotes.forEach((q: any) => {
          allQuotes.push({
            id: q.id,
            quote_text: q.text,
            speaker_name: q.speaker_name,
            speaker_role: q.speaker_role || undefined,
            theme: q.theme || q.category || undefined,
            story_id: q.source_story_id || undefined,
            source: 'elder',
          });
        });
      }

      // 2. Extracted quotes — only validated/featured ones
      const { data: extractedQuotes } = await supabase
        .from('extracted_quotes')
        .select('id, quote_text, attribution, theme, sentiment, impact_area, is_validated, suggested_for_report')
        .or('is_validated.eq.true,suggested_for_report.eq.true')
        .limit(100);

      if (extractedQuotes) {
        extractedQuotes.forEach((q: any) => {
          allQuotes.push({
            id: q.id,
            quote_text: q.quote_text,
            speaker_name: q.attribution || 'Community Member',
            theme: q.theme || q.impact_area || undefined,
            sentiment: q.sentiment || undefined,
            source: 'extracted',
          });
        });
      }

      // Resolve speaker_slug per quote against the EL v2 storyteller
      // index so the "→ See profile" link can render. Falls through to
      // undefined for "Community Member" / unknown / unmatched speakers.
      for (const q of allQuotes) {
        const lookup = nameToSlug.get(normaliseName(q.speaker_name));
        if (lookup) q.speaker_slug = lookup;
      }

      // Shuffle for visual variety
      for (let i = allQuotes.length - 1; i > 0; i--) {
        const j = Math.floor(Math.random() * (i + 1));
        [allQuotes[i], allQuotes[j]] = [allQuotes[j], allQuotes[i]];
      }

      setQuotes(allQuotes);
      setLoading(false);
    }

    loadQuotes();
  }, [nameToSlug]);

  const toggleTheme = (theme: string) => {
    setActiveThemes(prev => {
      const next = new Set(prev);
      if (next.has(theme)) {
        next.delete(theme);
      } else {
        next.add(theme);
      }
      return next;
    });
  };

  const filteredQuotes = useMemo(() => {
    if (activeThemes.size === 0) return quotes;
    return quotes.filter(q => q.theme && activeThemes.has(q.theme.toLowerCase()));
  }, [quotes, activeThemes]);

  // Assign sizes: every 5th is large, every 3rd is small, rest medium
  const sizedQuotes = filteredQuotes.map((q, i) => ({
    quote: q,
    size: (i % 7 === 0 ? 'lg' : i % 3 === 0 ? 'sm' : 'md') as 'sm' | 'md' | 'lg',
  }));

  if (loading) {
    return (
      <div className={`flex items-center justify-center py-20 ${className}`}>
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-picc-ochre mx-auto mb-4" />
          <p className="text-picc-earth-300">Loading community voices...</p>
        </div>
      </div>
    );
  }

  return (
    <div className={className}>
      {/* Theme filters */}
      <div className="flex flex-wrap gap-2 mb-8">
        {THEMES.map(theme => (
          <button
            key={theme}
            onClick={() => toggleTheme(theme)}
            className={`px-3 py-1.5 rounded-xl border text-sm capitalize transition-all ${
              activeThemes.has(theme)
                ? 'bg-picc-ochre text-white border-picc-ochre'
                : 'bg-white/60 text-picc-earth-300 border-warm-200 hover:border-picc-ochre'
            }`}
          >
            {theme}
          </button>
        ))}
        {activeThemes.size > 0 && (
          <button
            onClick={() => setActiveThemes(new Set())}
            className="px-3 py-1.5 rounded-xl border border-warm-200 text-sm text-picc-earth-200 hover:text-picc-earth transition-all"
          >
            Clear
          </button>
        )}
      </div>

      {/* Stats */}
      <div className="flex items-center gap-6 mb-6 text-sm text-picc-earth-300">
        <span><strong className="text-picc-earth">{filteredQuotes.length}</strong> voices</span>
        <span><strong className="text-picc-earth">{quotes.filter(q => q.source === 'elder').length}</strong> Elder quotes</span>
      </div>

      {/* Masonry grid */}
      {filteredQuotes.length > 0 ? (
        <div className="columns-1 sm:columns-2 lg:columns-3 gap-4 space-y-4">
          {sizedQuotes.map(({ quote, size }) => (
            <VoiceQuoteCard
              key={quote.id}
              quote={quote}
              size={size}
              className="break-inside-avoid"
            />
          ))}
        </div>
      ) : (
        <div className="text-center py-16 text-picc-earth-300">
          <BespokeIcon name="quote" size={48} className="mx-auto mb-4 opacity-50" />
          <p>No voices found for the selected themes.</p>
        </div>
      )}
    </div>
  );
}
