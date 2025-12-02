'use client';

import { useState } from 'react';
import { X, ChevronLeft, ChevronRight, ZoomIn, Camera } from 'lucide-react';
import { ScrollReveal } from './ScrollReveal';

interface Photo {
  url: string;
  caption?: string;
  credit?: string;
  category?: string;
}

interface PhotoGalleryProps {
  photos: Photo[];
  title?: string;
  layout?: 'masonry' | 'grid' | 'featured';
  columns?: 2 | 3 | 4;
}

export function PhotoGallery({
  photos,
  title,
  layout = 'grid',
  columns = 3,
}: PhotoGalleryProps) {
  const [lightboxIndex, setLightboxIndex] = useState<number | null>(null);

  const openLightbox = (index: number) => setLightboxIndex(index);
  const closeLightbox = () => setLightboxIndex(null);
  const nextPhoto = () => setLightboxIndex((i) => (i !== null ? (i + 1) % photos.length : null));
  const prevPhoto = () => setLightboxIndex((i) => (i !== null ? (i - 1 + photos.length) % photos.length : null));

  const colClass = {
    2: 'md:grid-cols-2',
    3: 'md:grid-cols-3',
    4: 'md:grid-cols-4',
  };

  if (layout === 'featured' && photos.length >= 3) {
    return (
      <>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          {/* Featured large image */}
          <div className="col-span-2 row-span-2">
            <div
              onClick={() => openLightbox(0)}
              className="relative aspect-square bg-gray-100 rounded-2xl overflow-hidden cursor-pointer group"
            >
              <img
                src={photos[0].url}
                alt={photos[0].caption || 'Gallery image'}
                className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity">
                <div className="absolute bottom-4 left-4 right-4">
                  {photos[0].caption && (
                    <p className="text-white font-medium">{photos[0].caption}</p>
                  )}
                </div>
                <div className="absolute top-4 right-4">
                  <ZoomIn className="w-6 h-6 text-white" />
                </div>
              </div>
            </div>
          </div>

          {/* Smaller images */}
          {photos.slice(1, 5).map((photo, index) => (
            <div
              key={index}
              onClick={() => openLightbox(index + 1)}
              className="relative aspect-square bg-gray-100 rounded-xl overflow-hidden cursor-pointer group"
            >
              <img
                src={photo.url}
                alt={photo.caption || 'Gallery image'}
                className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
              />
              <div className="absolute inset-0 bg-black/0 group-hover:bg-black/30 transition-colors flex items-center justify-center">
                <ZoomIn className="w-6 h-6 text-white opacity-0 group-hover:opacity-100 transition-opacity" />
              </div>
            </div>
          ))}

          {/* Show more button if needed */}
          {photos.length > 5 && (
            <div
              onClick={() => openLightbox(5)}
              className="relative aspect-square bg-gray-900 rounded-xl overflow-hidden cursor-pointer flex items-center justify-center text-white"
            >
              <div className="text-center">
                <span className="text-3xl font-bold">+{photos.length - 5}</span>
                <p className="text-sm text-white/70">more photos</p>
              </div>
            </div>
          )}
        </div>

        <Lightbox
          photos={photos}
          currentIndex={lightboxIndex}
          onClose={closeLightbox}
          onNext={nextPhoto}
          onPrev={prevPhoto}
        />
      </>
    );
  }

  if (layout === 'masonry') {
    return (
      <>
        <div className={`columns-1 ${colClass[columns]} gap-4 space-y-4`}>
          {photos.map((photo, index) => (
            <ScrollReveal key={index} animation="fadeUp" delay={index * 50}>
              <div
                onClick={() => openLightbox(index)}
                className="relative break-inside-avoid bg-gray-100 rounded-xl overflow-hidden cursor-pointer group mb-4"
              >
                <img
                  src={photo.url}
                  alt={photo.caption || 'Gallery image'}
                  className="w-full h-auto group-hover:scale-105 transition-transform duration-500"
                />
                {photo.caption && (
                  <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity flex items-end p-4">
                    <p className="text-white text-sm">{photo.caption}</p>
                  </div>
                )}
              </div>
            </ScrollReveal>
          ))}
        </div>

        <Lightbox
          photos={photos}
          currentIndex={lightboxIndex}
          onClose={closeLightbox}
          onNext={nextPhoto}
          onPrev={prevPhoto}
        />
      </>
    );
  }

  // Default grid layout
  return (
    <>
      <div className={`grid grid-cols-2 ${colClass[columns]} gap-4`}>
        {photos.map((photo, index) => (
          <ScrollReveal key={index} animation="scale" delay={index * 50}>
            <div
              onClick={() => openLightbox(index)}
              className="relative aspect-square bg-gray-100 rounded-xl overflow-hidden cursor-pointer group"
            >
              <img
                src={photo.url}
                alt={photo.caption || 'Gallery image'}
                className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
              />
              <div className="absolute inset-0 bg-black/0 group-hover:bg-black/30 transition-colors flex items-center justify-center">
                <ZoomIn className="w-6 h-6 text-white opacity-0 group-hover:opacity-100 transition-opacity" />
              </div>
              {photo.category && (
                <div className="absolute top-3 left-3">
                  <span className="px-2 py-1 bg-white/90 text-xs font-medium rounded-full">
                    {photo.category}
                  </span>
                </div>
              )}
            </div>
          </ScrollReveal>
        ))}
      </div>

      <Lightbox
        photos={photos}
        currentIndex={lightboxIndex}
        onClose={closeLightbox}
        onNext={nextPhoto}
        onPrev={prevPhoto}
      />
    </>
  );
}

// Lightbox component
interface LightboxProps {
  photos: Photo[];
  currentIndex: number | null;
  onClose: () => void;
  onNext: () => void;
  onPrev: () => void;
}

function Lightbox({ photos, currentIndex, onClose, onNext, onPrev }: LightboxProps) {
  if (currentIndex === null) return null;

  const photo = photos[currentIndex];

  return (
    <div className="fixed inset-0 z-50 bg-black/95 flex items-center justify-center">
      {/* Close button */}
      <button
        onClick={onClose}
        className="absolute top-4 right-4 p-2 text-white/70 hover:text-white transition-colors z-10"
      >
        <X className="w-8 h-8" />
      </button>

      {/* Navigation */}
      <button
        onClick={onPrev}
        className="absolute left-4 p-2 text-white/70 hover:text-white transition-colors"
      >
        <ChevronLeft className="w-10 h-10" />
      </button>
      <button
        onClick={onNext}
        className="absolute right-4 p-2 text-white/70 hover:text-white transition-colors"
      >
        <ChevronRight className="w-10 h-10" />
      </button>

      {/* Image */}
      <div className="max-w-5xl max-h-[80vh] px-16">
        <img
          src={photo.url}
          alt={photo.caption || 'Gallery image'}
          className="max-w-full max-h-[70vh] object-contain mx-auto"
        />
        {(photo.caption || photo.credit) && (
          <div className="text-center mt-4">
            {photo.caption && (
              <p className="text-white text-lg">{photo.caption}</p>
            )}
            {photo.credit && (
              <p className="text-white/60 text-sm mt-1">Photo: {photo.credit}</p>
            )}
          </div>
        )}
      </div>

      {/* Counter */}
      <div className="absolute bottom-4 left-1/2 -translate-x-1/2 text-white/70 text-sm">
        {currentIndex + 1} / {photos.length}
      </div>
    </div>
  );
}

// Hero gallery with parallax effect
interface HeroGalleryProps {
  photos: Photo[];
  title?: string;
  subtitle?: string;
}

export function HeroGallery({ photos, title, subtitle }: HeroGalleryProps) {
  return (
    <div className="relative h-[60vh] min-h-[500px] overflow-hidden">
      {/* Background grid of photos */}
      <div className="absolute inset-0 grid grid-cols-3 gap-2 opacity-40">
        {photos.slice(0, 9).map((photo, index) => (
          <div key={index} className="relative overflow-hidden">
            <img
              src={photo.url}
              alt=""
              className="w-full h-full object-cover"
            />
          </div>
        ))}
      </div>

      {/* Overlay gradient */}
      <div className="absolute inset-0 bg-gradient-to-b from-[#1e3a5f]/80 via-[#1e3a5f]/90 to-[#1e3a5f]" />

      {/* Content */}
      <div className="relative z-10 h-full flex flex-col items-center justify-center text-center px-6">
        <Camera className="w-12 h-12 text-white/60 mb-6" />
        {title && (
          <h2 className="text-4xl md:text-5xl font-bold text-white mb-4">{title}</h2>
        )}
        {subtitle && (
          <p className="text-xl text-white/80 max-w-2xl">{subtitle}</p>
        )}
        <div className="mt-8 flex items-center gap-2 text-white/60">
          <span className="text-lg font-medium">{photos.length}</span>
          <span>photos from our community</span>
        </div>
      </div>
    </div>
  );
}
