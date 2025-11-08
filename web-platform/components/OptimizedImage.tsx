'use client';

import { useState } from 'react';
import Image from 'next/image';

interface OptimizedImageProps {
  src: string;
  alt: string;
  width?: number;
  height?: number;
  className?: string;
  priority?: boolean;
  fill?: boolean;
  sizes?: string;
}

export default function OptimizedImage({
  src,
  alt,
  width,
  height,
  className = '',
  priority = false,
  fill = false,
  sizes = '100vw'
}: OptimizedImageProps) {
  const [isLoading, setIsLoading] = useState(true);
  const [hasError, setHasError] = useState(false);

  // Check if it's a Supabase URL
  const isSupabaseUrl = src.includes('supabase');

  // For Supabase images, we need to use the unoptimized prop
  const imageProps = {
    src,
    alt,
    className: `${className} transition-all duration-300 ${
      isLoading ? 'blur-sm scale-105' : 'blur-0 scale-100'
    }`,
    onLoad: () => setIsLoading(false),
    onError: () => {
      setHasError(true);
      setIsLoading(false);
    },
    ...(isSupabaseUrl && { unoptimized: true }),
    ...(priority && { priority: true }),
    ...(fill && { fill: true }),
    ...(!fill && width && height && { width, height }),
    ...(fill && { sizes })
  };

  if (hasError) {
    // Fallback UI for broken images
    return (
      <div className={`${className} bg-gradient-to-br from-palm-100 to-palm-200 flex items-center justify-center`}>
        <div className="text-center p-4">
          <div className="text-palm-600 text-4xl mb-2">🖼️</div>
          <p className="text-sm text-palm-700">Image unavailable</p>
        </div>
      </div>
    );
  }

  return (
    <div className="relative">
      {isLoading && (
        <div className="absolute inset-0 bg-gradient-to-r from-gray-200 via-gray-300 to-gray-200 animate-shimmer" />
      )}
      <Image {...imageProps} />
    </div>
  );
}
