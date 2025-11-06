'use client';

import React, { useState } from 'react';
import { X, ChevronLeft, ChevronRight, Calendar, User } from 'lucide-react';

interface Photo {
  id: string;
  file_path: string;
  caption?: string;
  photo_type?: string;
  taken_date?: string;
  uploaded_by?: string;
}

interface PhotoGalleryProps {
  photos: Photo[];
  storytellerName: string;
}

export default function PhotoGallery({ photos, storytellerName }: PhotoGalleryProps) {
  const [selectedIndex, setSelectedIndex] = useState<number | null>(null);

  if (photos.length === 0) {
    return (
      <div className="text-center py-12 card-modern">
        <p className="text-earth-medium">No photos yet. Photos can be added through the admin panel.</p>
      </div>
    );
  }

  const openLightbox = (index: number) => {
    setSelectedIndex(index);
  };

  const closeLightbox = () => {
    setSelectedIndex(null);
  };

  const goToPrevious = () => {
    if (selectedIndex !== null && selectedIndex > 0) {
      setSelectedIndex(selectedIndex - 1);
    }
  };

  const goToNext = () => {
    if (selectedIndex !== null && selectedIndex < photos.length - 1) {
      setSelectedIndex(selectedIndex + 1);
    }
  };

  const currentPhoto = selectedIndex !== null ? photos[selectedIndex] : null;

  return (
    <div>
      {/* Photo Grid */}
      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
        {photos.map((photo, index) => (
          <div
            key={photo.id}
            className="group relative aspect-square bg-earth-bg rounded-lg overflow-hidden cursor-pointer hover:shadow-xl transition-all transform hover:scale-105"
            onClick={() => openLightbox(index)}
          >
            <img
              src={photo.file_path}
              alt={photo.caption || `Photo ${index + 1}`}
              className="w-full h-full object-cover"
            />
            <div className="absolute inset-0 bg-black bg-opacity-0 group-hover:bg-opacity-30 transition-all flex items-center justify-center">
              <div className="opacity-0 group-hover:opacity-100 transition-opacity text-white">
                <p className="text-sm font-medium">View</p>
              </div>
            </div>
            {photo.photo_type && (
              <div className="absolute top-2 right-2 bg-ocean-deep/80 text-white text-xs px-2 py-1 rounded">
                {photo.photo_type}
              </div>
            )}
          </div>
        ))}
      </div>

      {/* Lightbox Modal */}
      {selectedIndex !== null && currentPhoto && (
        <div className="fixed inset-0 z-[100] bg-black bg-opacity-95 flex items-center justify-center p-4">
          {/* Close Button */}
          <button
            onClick={closeLightbox}
            className="absolute top-4 right-4 z-10 bg-white/10 hover:bg-white/20 text-white p-3 rounded-full transition-all"
            aria-label="Close"
          >
            <X className="w-6 h-6" />
          </button>

          {/* Previous Button */}
          {selectedIndex > 0 && (
            <button
              onClick={goToPrevious}
              className="absolute left-4 z-10 bg-white/10 hover:bg-white/20 text-white p-3 rounded-full transition-all"
              aria-label="Previous"
            >
              <ChevronLeft className="w-6 h-6" />
            </button>
          )}

          {/* Next Button */}
          {selectedIndex < photos.length - 1 && (
            <button
              onClick={goToNext}
              className="absolute right-4 z-10 bg-white/10 hover:bg-white/20 text-white p-3 rounded-full transition-all"
              aria-label="Next"
            >
              <ChevronRight className="w-6 h-6" />
            </button>
          )}

          {/* Main Image */}
          <div className="max-w-6xl max-h-[90vh] w-full flex flex-col">
            <img
              src={currentPhoto.file_path}
              alt={currentPhoto.caption || `Photo ${selectedIndex + 1}`}
              className="max-h-[75vh] w-full object-contain rounded-lg"
            />

            {/* Photo Info */}
            <div className="mt-4 bg-white/10 backdrop-blur-sm rounded-lg p-4 text-white">
              <div className="flex items-center justify-between">
                <div className="flex-1">
                  {currentPhoto.caption && (
                    <p className="text-lg font-medium mb-2">{currentPhoto.caption}</p>
                  )}
                  <div className="flex items-center gap-4 text-sm text-white/70">
                    {currentPhoto.taken_date && (
                      <div className="flex items-center gap-1">
                        <Calendar className="w-4 h-4" />
                        <span>{new Date(currentPhoto.taken_date).toLocaleDateString()}</span>
                      </div>
                    )}
                    {currentPhoto.photo_type && (
                      <span className="px-2 py-1 bg-coral-warm rounded text-white capitalize">
                        {currentPhoto.photo_type}
                      </span>
                    )}
                  </div>
                </div>
                <div className="text-sm text-white/70">
                  {selectedIndex + 1} / {photos.length}
                </div>
              </div>
            </div>
          </div>

          {/* Keyboard Navigation Hint */}
          <div className="absolute bottom-4 left-1/2 transform -translate-x-1/2 text-white/50 text-sm">
            Use ← → arrow keys to navigate
          </div>
        </div>
      )}
    </div>
  );
}
