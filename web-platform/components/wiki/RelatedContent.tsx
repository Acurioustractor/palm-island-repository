'use client';

import React from 'react';
import Link from 'next/link';
import { BookOpen, Users, MapPin, Tag, Clock, ArrowRight } from 'lucide-react';

interface RelatedItem {
  id: string;
  title: string;
  type: 'story' | 'person' | 'place' | 'topic' | 'category';
  href: string;
  thumbnail?: string;
  description?: string;
  metadata?: {
    date?: string;
    author?: string;
    category?: string;
    views?: number;
  };
}

interface RelatedContentProps {
  items: RelatedItem[];
  title?: string;
  maxItems?: number;
  showType?: boolean;
  className?: string;
}

const typeIcons = {
  story: BookOpen,
  person: Users,
  place: MapPin,
  topic: Tag,
  category: Tag,
};

const typeColors = {
  story: 'bg-blue-50 text-blue-700 border-blue-200',
  person: 'bg-purple-50 text-purple-700 border-purple-200',
  place: 'bg-green-50 text-green-700 border-green-200',
  topic: 'bg-orange-50 text-orange-700 border-orange-200',
  category: 'bg-pink-50 text-pink-700 border-pink-200',
};

export function RelatedContent({
  items,
  title = 'Related Content',
  maxItems = 6,
  showType = true,
  className = '',
}: RelatedContentProps) {
  const displayItems = items.slice(0, maxItems);

  if (displayItems.length === 0) {
    return null;
  }

  return (
    <div className={`bg-white rounded-lg border border-gray-200 overflow-hidden ${className}`}>
      {/* Header */}
      <div className="px-4 py-3 border-b border-gray-200 bg-gray-50">
        <h3 className="font-semibold text-gray-900 flex items-center gap-2">
          <ArrowRight className="h-5 w-5 text-gray-600" />
          {title}
        </h3>
      </div>

      {/* Content */}
      <div className="p-4 space-y-3">
        {displayItems.map((item) => {
          const Icon = typeIcons[item.type];
          const colorClasses = typeColors[item.type];

          return (
            <Link
              key={item.id}
              href={item.href}
              className="block group hover:bg-gray-50 -mx-4 px-4 py-2 rounded-lg transition-all"
            >
              <div className="flex items-start gap-3">
                {/* Thumbnail or Icon */}
                {item.thumbnail ? (
                  <img
                    src={item.thumbnail}
                    alt={item.title}
                    className="h-12 w-12 rounded object-cover border border-gray-200 flex-shrink-0"
                  />
                ) : (
                  <div
                    className={`h-12 w-12 rounded flex items-center justify-center border flex-shrink-0 ${colorClasses}`}
                  >
                    <Icon className="h-6 w-6" />
                  </div>
                )}

                {/* Content */}
                <div className="flex-1 min-w-0">
                  <div className="flex items-start justify-between gap-2">
                    <h4 className="text-sm font-medium text-gray-900 group-hover:text-blue-600 transition-colors line-clamp-2">
                      {item.title}
                    </h4>
                    {showType && (
                      <span className={`text-xs px-2 py-0.5 rounded flex-shrink-0 ${colorClasses}`}>
                        {item.type}
                      </span>
                    )}
                  </div>

                  {item.description && (
                    <p className="text-xs text-gray-600 mt-1 line-clamp-2">{item.description}</p>
                  )}

                  {/* Metadata */}
                  {item.metadata && (
                    <div className="flex items-center gap-3 mt-2 text-xs text-gray-500">
                      {item.metadata.author && (
                        <div className="flex items-center gap-1">
                          <Users className="h-3 w-3" />
                          <span>{item.metadata.author}</span>
                        </div>
                      )}
                      {item.metadata.date && (
                        <div className="flex items-center gap-1">
                          <Clock className="h-3 w-3" />
                          <span>
                            {new Date(item.metadata.date).toLocaleDateString('en-AU', {
                              day: 'numeric',
                              month: 'short',
                              year: 'numeric',
                            })}
                          </span>
                        </div>
                      )}
                      {item.metadata.category && (
                        <div className="flex items-center gap-1">
                          <Tag className="h-3 w-3" />
                          <span>{item.metadata.category}</span>
                        </div>
                      )}
                    </div>
                  )}
                </div>
              </div>
            </Link>
          );
        })}
      </div>

      {/* Footer - Show More Link */}
      {items.length > maxItems && (
        <div className="px-4 py-3 border-t border-gray-200 bg-gray-50">
          <button className="text-sm text-blue-600 hover:text-blue-800 font-medium flex items-center gap-1">
            View all {items.length} related items
            <ArrowRight className="h-4 w-4" />
          </button>
        </div>
      )}
    </div>
  );
}

export default RelatedContent;
