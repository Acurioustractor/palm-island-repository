'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { ChevronLeft, ChevronRight } from 'lucide-react';
import type { Story } from '@/lib/stories/types';

interface StoryCarouselProps {
  stories: Story[];
  autoplay?: boolean;
  interval?: number;
  className?: string;
}

export default function StoryCarousel({
  stories,
  autoplay = true,
  interval = 5000,
  className = '',
}: StoryCarouselProps) {
  const [currentIndex, setCurrentIndex] = useState(0);
  const [isPaused, setIsPaused] = useState(false);

  // Auto-advance carousel
  useEffect(() => {
    if (!autoplay || isPaused || stories.length <= 1) return;

    const timer = setInterval(() => {
      setCurrentIndex((prev) => (prev + 1) % stories.length);
    }, interval);

    return () => clearInterval(timer);
  }, [autoplay, isPaused, interval, stories.length]);

  const goToSlide = (index: number) => {
    setCurrentIndex(index);
    setIsPaused(true);
    setTimeout(() => setIsPaused(false), 3000);
  };

  const goToPrevious = () => {
    setCurrentIndex((prev) => (prev - 1 + stories.length) % stories.length);
    setIsPaused(true);
    setTimeout(() => setIsPaused(false), 3000);
  };

  const goToNext = () => {
    setCurrentIndex((prev) => (prev + 1) % stories.length);
    setIsPaused(true);
    setTimeout(() => setIsPaused(false), 3000);
  };

  if (!stories || stories.length === 0) {
    return (
      <div className="bg-gray-100 rounded-2xl p-12 text-center">
        <p className="text-gray-500">No stories available</p>
      </div>
    );
  }

  const currentStory = stories[currentIndex];

  return (
    <div
      className={`relative overflow-hidden ${className}`}
      onMouseEnter={() => setIsPaused(true)}
      onMouseLeave={() => setIsPaused(false)}
    >
      <div className="relative aspect-[16/9] md:aspect-[21/9] rounded-2xl overflow-hidden shadow-2xl">
        <div
          className="flex transition-transform duration-700 ease-in-out h-full"
          style={{ transform: `translateX(-${currentIndex * 100}%)` }}
        >
          {stories.map((story) => (
            <div key={story.id} className="min-w-full h-full relative">
              <StorySlide story={story} />
            </div>
          ))}
        </div>

        {stories.length > 1 && (
          <>
            <button
              onClick={goToPrevious}
              className="absolute left-4 top-1/2 -translate-y-1/2 w-12 h-12 rounded-full bg-black/30 backdrop-blur-sm hover:bg-black/50 transition-all flex items-center justify-center text-white group"
              aria-label="Previous story"
            >
              <ChevronLeft className="w-6 h-6 group-hover:scale-110 transition-transform" />
            </button>
            <button
              onClick={goToNext}
              className="absolute right-4 top-1/2 -translate-y-1/2 w-12 h-12 rounded-full bg-black/30 backdrop-blur-sm hover:bg-black/50 transition-all flex items-center justify-center text-white group"
              aria-label="Next story"
            >
              <ChevronRight className="w-6 h-6 group-hover:scale-110 transition-transform" />
            </button>
          </>
        )}

        {currentStory.contains_traditional_knowledge && (
          <div className="absolute top-4 right-4 bg-purple-900/90 backdrop-blur-sm text-white px-4 py-2 rounded-lg text-sm">
            🛡️ Traditional Knowledge
          </div>
        )}
      </div>

      {stories.length > 1 && (
        <div className="flex justify-center gap-2 mt-6">
          {stories.map((_, index) => (
            <button
              key={index}
              onClick={() => goToSlide(index)}
              className={`transition-all ${
                index === currentIndex
                  ? 'w-8 h-2 bg-picc-teal'
                  : 'w-2 h-2 bg-gray-300 hover:bg-gray-400'
              } rounded-full`}
              aria-label={`Go to story ${index + 1}`}
            />
          ))}
        </div>
      )}

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mt-6">
        {stories.slice(0, 3).map((story, index) => (
          <Link
            key={story.id}
            href={`/stories/${story.id}`}
            className={`p-4 rounded-lg transition-all ${
              index === currentIndex
                ? 'bg-picc-teal text-white'
                : 'bg-gray-100 hover:bg-gray-200'
            }`}
            onClick={() => goToSlide(index)}
          >
            <h3 className="font-semibold text-lg line-clamp-1">{story.title}</h3>
            <p className={`text-sm mt-1 ${index === currentIndex ? 'text-white/90' : 'text-gray-600'}`}>
              {story.storyteller?.preferred_name || story.storyteller?.full_name}
            </p>
            {story.storyteller?.is_elder && (
              <span className={`text-xs ${index === currentIndex ? 'text-white/80' : 'text-gray-500'}`}>
                Elder
              </span>
            )}
          </Link>
        ))}
      </div>
    </div>
  );
}

function StorySlide({ story }: { story: Story }) {
  const featuredImage = story.story_media?.[0]?.url || story.featured_image_url;
  const hasImage = !!featuredImage;
  const keyQuote = story.metadata?.key_quotes?.[0] || story.excerpt;

  return (
    <Link href={`/stories/${story.id}`} className="block h-full group">
      <div className="relative h-full">
        {hasImage ? (
          <div className="absolute inset-0">
            <img
              src={featuredImage}
              alt={story.title}
              className="w-full h-full object-cover"
            />
          </div>
        ) : (
          <div className="absolute inset-0 bg-gradient-to-br from-picc-navy via-picc-teal to-picc-navy">
            <div className="absolute inset-0 opacity-10">
              <div className="h-full w-full" style={{
                backgroundImage: `repeating-linear-gradient(45deg, transparent, transparent 35px, rgba(255,255,255,.05) 35px, rgba(255,255,255,.05) 70px)`
              }} />
            </div>
          </div>
        )}

        <div className="relative h-full bg-gradient-to-t from-black/90 via-black/50 to-transparent flex flex-col justify-end p-8 md:p-12">
          {story.story_type && (
            <div className="mb-4">
              <span className="inline-block px-4 py-1 bg-white/20 backdrop-blur-sm text-white text-sm font-medium rounded-full">
                {story.story_type.replace('_', ' ').replace(/\b\w/g, l => l.toUpperCase())}
              </span>
            </div>
          )}

          <div className="max-w-4xl">
            <h2 className="text-3xl md:text-5xl font-bold text-white mb-4 group-hover:text-picc-coral transition-colors">
              {story.title}
            </h2>

            {keyQuote && (
              <blockquote className="text-xl md:text-2xl text-white/90 font-light italic mb-6 line-clamp-2">
                "{keyQuote.replace(/^["']|["']$/g, '')}"
              </blockquote>
            )}

            <div className="flex items-center gap-4 text-white">
              {story.storyteller?.profile_image_url && (
                <div className="w-12 h-12 rounded-full overflow-hidden ring-2 ring-white/30">
                  <img
                    src={story.storyteller.profile_image_url}
                    alt={story.storyteller.preferred_name || story.storyteller.full_name}
                    className="w-full h-full object-cover"
                  />
                </div>
              )}
              <div>
                <p className="font-semibold text-lg">
                  {story.storyteller?.preferred_name || story.storyteller?.full_name || 'Community Member'}
                </p>
                {story.storyteller?.is_elder && (
                  <p className="text-sm text-white/80">Elder</p>
                )}
              </div>

              {(story.views || story.likes || story.shares) && (
                <div className="ml-auto flex gap-4 text-sm text-white/70">
                  {story.views > 0 && <span>👁 {story.views}</span>}
                  {story.likes > 0 && <span>❤️ {story.likes}</span>}
                  {story.shares > 0 && <span>🔗 {story.shares}</span>}
                </div>
              )}
            </div>
          </div>

          <div className="absolute top-1/2 right-8 -translate-y-1/2 opacity-0 group-hover:opacity-100 transition-opacity">
            <div className="w-16 h-16 rounded-full bg-white/20 backdrop-blur-sm flex items-center justify-center">
              <span className="text-white text-3xl">→</span>
            </div>
          </div>
        </div>
      </div>
    </Link>
  );
}
