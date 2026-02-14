'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { BespokeIcon, type BespokeIconName } from '@/components/ui/BespokeIcon';

interface RelatedItem {
  id: string;
  type: 'story' | 'person' | 'knowledge' | 'media';
  title: string;
  summary?: string;
  url: string;
  similarity: number;
  relationship?: string;
  imageUrl?: string;
}

interface RelatedContentSidebarProps {
  contentId: string;
  contentType: 'story' | 'person' | 'knowledge';
  className?: string;
}

const TYPE_ICONS: Record<string, BespokeIconName> = {
  story: 'story',
  person: 'person',
  knowledge: 'knowledge',
  media: 'photo'
};

const TYPE_COLORS: Record<string, string> = {
  story: 'bg-warm-100 text-picc-earth',
  person: 'bg-sage-50 text-sage-600',
  knowledge: 'bg-warm-50 text-picc-ochre',
  media: 'bg-picc-ochre-100 text-picc-ochre-800'
};

export default function RelatedContentSidebar({
  contentId,
  contentType,
  className = ''
}: RelatedContentSidebarProps) {
  const [related, setRelated] = useState<RelatedItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    async function fetchRelated() {
      try {
        setLoading(true);
        const response = await fetch(
          `/api/ai/related?id=${contentId}&type=${contentType}&limit=5`
        );
        const data = await response.json();

        if (data.error) {
          throw new Error(data.error);
        }

        setRelated(data.relatedItems || []);
      } catch (e: any) {
        setError(e.message);
      } finally {
        setLoading(false);
      }
    }

    if (contentId) {
      fetchRelated();
    }
  }, [contentId, contentType]);

  if (loading) {
    return (
      <div className={`bg-white rounded-xl border border-gray-200 p-4 ${className}`}>
        <h3 className="font-semibold text-gray-900 mb-4">Related Content</h3>
        <div className="space-y-3">
          {[1, 2, 3].map((i) => (
            <div key={i} className="animate-pulse">
              <div className="h-4 bg-gray-200 rounded w-3/4 mb-2"></div>
              <div className="h-3 bg-gray-100 rounded w-1/2"></div>
            </div>
          ))}
        </div>
      </div>
    );
  }

  if (error || related.length === 0) {
    return null; // Don't show sidebar if no related content
  }

  return (
    <div className={`bg-white rounded-xl border border-gray-200 p-4 ${className}`}>
      <h3 className="font-semibold text-gray-900 mb-4 flex items-center gap-2">
        <svg className="w-5 h-5 text-picc-ochre" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13.828 10.172a4 4 0 00-5.656 0l-4 4a4 4 0 105.656 5.656l1.102-1.101m-.758-4.899a4 4 0 005.656 0l4-4a4 4 0 00-5.656-5.656l-1.1 1.1" />
        </svg>
        Related Content
      </h3>

      <div className="space-y-3">
        {related.map((item) => (
          <Link
            key={item.id}
            href={item.url}
            className="block p-3 rounded-lg bg-gray-50 hover:bg-gray-100 transition-colors group"
          >
            <div className="flex items-start gap-3">
              {item.imageUrl ? (
                <div className="relative w-12 h-12 rounded-lg overflow-hidden flex-shrink-0">
                  <Image
                    src={item.imageUrl}
                    alt={item.title}
                    fill
                    className="object-cover"
                  />
                </div>
              ) : (
                <div className="w-12 h-12 rounded-lg bg-gray-200 flex items-center justify-center flex-shrink-0">
                  <BespokeIcon name={TYPE_ICONS[item.type] || 'story'} size={24} />
                </div>
              )}
              <div className="flex-1 min-w-0">
                <h4 className="font-medium text-gray-900 text-sm group-hover:text-picc-ochre transition-colors line-clamp-2">
                  {item.title}
                </h4>
                <div className="flex items-center gap-2 mt-1">
                  <span className={`text-xs px-2 py-0.5 rounded-full ${TYPE_COLORS[item.type]}`}>
                    {item.type}
                  </span>
                  {item.relationship && (
                    <span className="text-xs text-gray-500 truncate">
                      {item.relationship}
                    </span>
                  )}
                </div>
              </div>
            </div>
          </Link>
        ))}
      </div>

      {/* Explore more link */}
      <Link
        href="/wiki/explore"
        className="mt-4 block text-center text-sm text-picc-ochre hover:text-picc-ochre font-medium"
      >
        Explore Knowledge Graph →
      </Link>
    </div>
  );
}
