'use client';

import { ScrollReveal } from './ScrollReveal';
import Image from 'next/image';

interface GalleryImage {
  url: string;
  alt: string;
  caption?: string;
}

interface ImageGalleryProps {
  title?: string;
  images: GalleryImage[];
  columns?: 2 | 3 | 4;
  backgroundColor?: string;
}

export function ImageGallery({
  title,
  images,
  columns = 3,
  backgroundColor = 'bg-white',
}: ImageGalleryProps) {
  const gridClasses = {
    2: 'grid-cols-1 md:grid-cols-2',
    3: 'grid-cols-1 md:grid-cols-2 lg:grid-cols-3',
    4: 'grid-cols-1 md:grid-cols-2 lg:grid-cols-4',
  };

  return (
    <section className={`${backgroundColor} py-20`}>
      <div className="max-w-7xl mx-auto px-8">
        {title && (
          <ScrollReveal direction="up">
            <h2 className="text-3xl md:text-5xl font-bold text-gray-900 mb-12 text-center">
              {title}
            </h2>
          </ScrollReveal>
        )}

        <div className={`grid ${gridClasses[columns]} gap-6`}>
          {images.map((image, index) => (
            <ScrollReveal key={index} direction="up" delay={index * 0.1}>
              <div className="group relative aspect-square overflow-hidden rounded-lg shadow-lg hover:shadow-2xl transition-shadow">
                <Image
                  src={image.url}
                  alt={image.alt}
                  fill
                  className="object-cover group-hover:scale-105 transition-transform duration-500"
                  sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
                />
                {image.caption && (
                  <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/0 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300 flex items-end">
                    <p className="text-white p-4 text-sm font-medium">
                      {image.caption}
                    </p>
                  </div>
                )}
              </div>
            </ScrollReveal>
          ))}
        </div>
      </div>
    </section>
  );
}
