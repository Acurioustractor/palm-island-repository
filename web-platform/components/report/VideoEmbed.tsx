'use client';

import { useState } from 'react';
import { Play, X, Volume2, VolumeX, Maximize2 } from 'lucide-react';

interface VideoEmbedProps {
  url: string;
  title: string;
  description?: string;
  thumbnail?: string;
  aspectRatio?: '16:9' | '4:3' | '1:1';
  autoplay?: boolean;
}

export function VideoEmbed({
  url,
  title,
  description,
  thumbnail,
  aspectRatio = '16:9',
}: VideoEmbedProps) {
  const [isPlaying, setIsPlaying] = useState(false);

  // Parse video ID from various sources
  const getEmbedUrl = (videoUrl: string) => {
    // YouTube
    const youtubeMatch = videoUrl.match(/(?:youtube\.com\/(?:watch\?v=|embed\/)|youtu\.be\/)([^&\s]+)/);
    if (youtubeMatch) {
      return `https://www.youtube.com/embed/${youtubeMatch[1]}?autoplay=1&rel=0`;
    }
    // Vimeo
    const vimeoMatch = videoUrl.match(/vimeo\.com\/(\d+)/);
    if (vimeoMatch) {
      return `https://player.vimeo.com/video/${vimeoMatch[1]}?autoplay=1`;
    }
    return videoUrl;
  };

  const aspectRatioClass = {
    '16:9': 'aspect-video',
    '4:3': 'aspect-[4/3]',
    '1:1': 'aspect-square',
  };

  return (
    <div className="relative group">
      <div className={`relative ${aspectRatioClass[aspectRatio]} bg-gray-900 rounded-2xl overflow-hidden shadow-2xl`}>
        {!isPlaying ? (
          <>
            {/* Thumbnail */}
            {thumbnail ? (
              <img
                src={thumbnail}
                alt={title}
                className="absolute inset-0 w-full h-full object-cover"
              />
            ) : (
              <div className="absolute inset-0 bg-gradient-to-br from-[#1e3a5f] to-[#2d6a4f]" />
            )}

            {/* Overlay gradient */}
            <div className="absolute inset-0 bg-black/30 group-hover:bg-black/40 transition-colors" />

            {/* Play button */}
            <button
              onClick={() => setIsPlaying(true)}
              className="absolute inset-0 flex items-center justify-center"
            >
              <div className="w-20 h-20 bg-white/90 rounded-full flex items-center justify-center shadow-lg transform group-hover:scale-110 transition-transform">
                <Play className="w-8 h-8 text-[#1e3a5f] ml-1" fill="currentColor" />
              </div>
            </button>

            {/* Title overlay */}
            <div className="absolute bottom-0 left-0 right-0 p-6 bg-gradient-to-t from-black/80 to-transparent">
              <h3 className="text-xl font-bold text-white mb-1">{title}</h3>
              {description && (
                <p className="text-sm text-white/80 line-clamp-2">{description}</p>
              )}
            </div>
          </>
        ) : (
          <iframe
            src={getEmbedUrl(url)}
            title={title}
            className="absolute inset-0 w-full h-full"
            allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
            allowFullScreen
          />
        )}
      </div>
    </div>
  );
}

// Featured video with more prominent styling
interface FeaturedVideoProps extends VideoEmbedProps {
  badge?: string;
}

export function FeaturedVideo({
  url,
  title,
  description,
  thumbnail,
  badge,
}: FeaturedVideoProps) {
  const [isPlaying, setIsPlaying] = useState(false);

  const getEmbedUrl = (videoUrl: string) => {
    const youtubeMatch = videoUrl.match(/(?:youtube\.com\/(?:watch\?v=|embed\/)|youtu\.be\/)([^&\s]+)/);
    if (youtubeMatch) {
      return `https://www.youtube.com/embed/${youtubeMatch[1]}?autoplay=1&rel=0`;
    }
    const vimeoMatch = videoUrl.match(/vimeo\.com\/(\d+)/);
    if (vimeoMatch) {
      return `https://player.vimeo.com/video/${vimeoMatch[1]}?autoplay=1`;
    }
    return videoUrl;
  };

  return (
    <div className="relative">
      {badge && (
        <div className="absolute -top-3 left-6 z-10 px-4 py-1 bg-[#e85d04] text-white text-sm font-medium rounded-full shadow-lg">
          {badge}
        </div>
      )}

      <div className="relative aspect-video bg-gray-900 rounded-3xl overflow-hidden shadow-2xl ring-1 ring-white/10">
        {!isPlaying ? (
          <>
            {thumbnail ? (
              <img
                src={thumbnail}
                alt={title}
                className="absolute inset-0 w-full h-full object-cover"
              />
            ) : (
              <div className="absolute inset-0 bg-gradient-to-br from-[#1e3a5f] via-[#2d4a6f] to-[#2d6a4f]">
                {/* Decorative pattern */}
                <div className="absolute inset-0 opacity-10">
                  <div className="absolute top-10 left-10 w-40 h-40 border-2 border-white rounded-full" />
                  <div className="absolute bottom-10 right-10 w-60 h-60 border-2 border-white rounded-full" />
                </div>
              </div>
            )}

            <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-black/20 to-transparent" />

            <button
              onClick={() => setIsPlaying(true)}
              className="absolute inset-0 flex flex-col items-center justify-center text-center p-8"
            >
              <div className="w-24 h-24 bg-white rounded-full flex items-center justify-center shadow-2xl mb-6 transform hover:scale-110 transition-transform">
                <Play className="w-10 h-10 text-[#1e3a5f] ml-1" fill="currentColor" />
              </div>
              <h3 className="text-2xl md:text-3xl font-bold text-white mb-2">{title}</h3>
              {description && (
                <p className="text-white/80 max-w-lg">{description}</p>
              )}
            </button>
          </>
        ) : (
          <iframe
            src={getEmbedUrl(url)}
            title={title}
            className="absolute inset-0 w-full h-full"
            allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
            allowFullScreen
          />
        )}
      </div>
    </div>
  );
}

// Video grid for multiple videos
interface VideoGridProps {
  videos: Array<{
    url: string;
    title: string;
    description?: string;
    thumbnail?: string;
  }>;
  columns?: 2 | 3;
}

export function VideoGrid({ videos, columns = 2 }: VideoGridProps) {
  const colClass = columns === 2 ? 'md:grid-cols-2' : 'md:grid-cols-3';

  return (
    <div className={`grid grid-cols-1 ${colClass} gap-6`}>
      {videos.map((video, index) => (
        <VideoEmbed key={index} {...video} />
      ))}
    </div>
  );
}
