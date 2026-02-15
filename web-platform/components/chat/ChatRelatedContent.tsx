'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { BespokeIcon, type BespokeIconName } from '@/components/ui/BespokeIcon';

interface Source {
  id?: string;
  type?: string;
  title?: string;
  url?: string;
}

interface RelatedItem {
  id: string;
  type: string;
  title: string;
  summary?: string;
  url: string;
  similarity: number;
  relationship?: string;
}

const TYPE_ICONS: Record<string, BespokeIconName> = {
  story: 'story',
  person: 'person',
  knowledge: 'knowledge',
  media: 'photo',
  service: 'community',
  financial: 'economic',
  quote: 'quote',
  interview: 'audio',
};

const TYPE_COLORS: Record<string, string> = {
  story: 'bg-warm-100 text-picc-earth',
  person: 'bg-sage-50 text-sage-600',
  knowledge: 'bg-warm-50 text-picc-ochre',
  media: 'bg-picc-ochre-100 text-picc-ochre-800',
  service: 'bg-warm-50 text-picc-earth',
  financial: 'bg-warm-50 text-picc-earth',
  quote: 'bg-warm-100 text-picc-ochre',
  interview: 'bg-sage-50 text-sage-600',
};

interface ChatRelatedContentProps {
  sources: Source[];
  className?: string;
}

export default function ChatRelatedContent({ sources, className = '' }: ChatRelatedContentProps) {
  const [related, setRelated] = useState<RelatedItem[]>([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    // Collect all sources with valid IDs (not just the first)
    const sourcesWithIds = (sources || []).filter(s => s.id && s.type);
    if (sourcesWithIds.length === 0) return;

    async function fetchRelated() {
      setLoading(true);
      try {
        // Fetch related content for up to 3 sources concurrently
        const fetches = sourcesWithIds.slice(0, 3).map(async (source) => {
          try {
            const res = await fetch(
              `/api/ai/related?id=${source.id}&type=${source.type}&limit=4`
            );
            if (!res.ok) return [];
            const data = await res.json();
            return (data.relatedItems || []) as RelatedItem[];
          } catch {
            return [] as RelatedItem[];
          }
        });

        const results = await Promise.all(fetches);
        const allItems = results.flat();

        // Deduplicate by ID, keep highest similarity
        const seen = new Map<string, RelatedItem>();
        for (const item of allItems) {
          const existing = seen.get(item.id);
          if (!existing || item.similarity > existing.similarity) {
            seen.set(item.id, item);
          }
        }

        // Sort by similarity descending, take top 6
        const deduped = Array.from(seen.values())
          .sort((a, b) => b.similarity - a.similarity)
          .slice(0, 6);

        setRelated(deduped);
      } catch {
        // Fail silently — related content is optional
      } finally {
        setLoading(false);
      }
    }

    fetchRelated();
  }, [sources]);

  if (!loading && related.length === 0) return null;

  return (
    <div className={`mt-4 ${className}`}>
      <p className="text-xs font-semibold text-picc-earth-300 uppercase tracking-wider mb-2">
        Explore More
      </p>

      {loading ? (
        <div className="flex gap-2">
          {[1, 2, 3].map(i => (
            <div key={i} className="animate-pulse bg-warm-100 rounded-xl h-16 w-40" />
          ))}
        </div>
      ) : (
        <div className="flex overflow-x-auto gap-2 pb-1">
          {related.map((item) => {
            const icon = TYPE_ICONS[item.type] || 'search';
            const colors = TYPE_COLORS[item.type] || TYPE_COLORS.knowledge;

            return (
              <Link
                key={item.id}
                href={item.url}
                className={`flex-shrink-0 flex items-start gap-2 px-3 py-2 rounded-xl ${colors} hover:shadow-sm transition-all max-w-[220px]`}
              >
                <BespokeIcon name={icon} size={16} className="mt-0.5 flex-shrink-0" />
                <div className="min-w-0">
                  <p className="text-sm font-medium truncate">{item.title}</p>
                  {item.relationship && (
                    <p className="text-xs opacity-60 truncate">{item.relationship}</p>
                  )}
                </div>
              </Link>
            );
          })}
        </div>
      )}
    </div>
  );
}
