'use client';

import Link from 'next/link';
import { Shield } from 'lucide-react';
import { useState } from 'react';

interface ElderStoryCardProps {
  storyId: string;
  storytellerName: string;
  profileImageUrl?: string | null;
  keyQuote?: string;
  storyTitle: string;
}

export default function ElderStoryCard({
  storyId,
  storytellerName,
  profileImageUrl,
  keyQuote,
  storyTitle,
}: ElderStoryCardProps) {
  const [imageError, setImageError] = useState(false);
  const showGradient = !profileImageUrl || imageError;

  return (
    <Link href={`/stories/${storyId}`} className="group block">
      <div className="relative aspect-[4/5] rounded-2xl overflow-hidden shadow-xl hover:shadow-2xl transition-all duration-500">
        {/* Background - profile image or gradient */}
        {!showGradient ? (
          <div className="absolute inset-0">
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img
              src={profileImageUrl!}
              alt={storytellerName}
              className="w-full h-full object-cover"
              onError={() => setImageError(true)}
            />
          </div>
        ) : (
          <div className="absolute inset-0 bg-gradient-to-br from-purple-900 via-purple-800 to-purple-900">
            <div className="absolute inset-0 flex items-center justify-center opacity-10">
              <span className="text-[20rem] font-bold text-white">
                {storytellerName.charAt(0)}
              </span>
            </div>
          </div>
        )}

        {/* Content overlay */}
        <div className="relative h-full flex flex-col justify-end p-8 bg-gradient-to-t from-black/90 via-black/50 to-transparent">
          {/* Quote - center of card */}
          {keyQuote && (
            <div className="flex-1 flex items-center justify-center mb-8">
              <blockquote className="text-white text-xl md:text-2xl font-light italic leading-relaxed text-center">
                "{keyQuote.replace(/^["']|["']$/g, '').substring(0, 120)}"
              </blockquote>
            </div>
          )}

          {/* Elder info at bottom */}
          <div className="text-white">
            <div className="flex items-center gap-2 mb-2">
              <Shield className="w-5 h-5" />
              <span className="text-sm font-semibold uppercase tracking-wide opacity-90">
                Elder Wisdom
              </span>
            </div>
            <h3 className="text-2xl font-bold mb-1">{storytellerName}</h3>
            <p className="text-sm opacity-75 line-clamp-1">{storyTitle}</p>
          </div>

          {/* Hover arrow */}
          <div className="absolute top-6 right-6 opacity-0 group-hover:opacity-100 transition-opacity">
            <div className="w-12 h-12 rounded-full bg-white/20 backdrop-blur-sm flex items-center justify-center">
              <span className="text-white text-2xl">→</span>
            </div>
          </div>
        </div>
      </div>
    </Link>
  );
}
