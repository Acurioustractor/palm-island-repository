'use client'

import { useState } from 'react'
import Image from 'next/image'
import { X, ChevronLeft, ChevronRight } from 'lucide-react'
import type { PhotoData } from './ToolResultRenderer'

interface PhotoGalleryInlineProps {
  photos: PhotoData[]
}

export function PhotoGalleryInline({ photos }: PhotoGalleryInlineProps) {
  const [lightboxIndex, setLightboxIndex] = useState<number | null>(null)

  if (!photos || photos.length === 0) {
    return (
      <div className="my-4 rounded-2xl bg-gray-50 p-6 text-center text-gray-500 text-sm">
        No photos found for this topic.
      </div>
    )
  }

  const columns = photos.length <= 2 ? 'grid-cols-2' : photos.length <= 4 ? 'grid-cols-2 sm:grid-cols-4' : 'grid-cols-2 sm:grid-cols-3'

  return (
    <>
      <div className={`my-4 grid ${columns} gap-2 rounded-2xl overflow-hidden`}>
        {photos.map((photo, i) => (
          <button
            key={photo.id}
            onClick={() => setLightboxIndex(i)}
            className="relative aspect-square bg-gray-100 overflow-hidden group cursor-pointer"
          >
            <Image
              src={photo.url}
              alt={photo.alt || 'PICC photo'}
              fill
              className="object-cover group-hover:scale-105 transition-transform duration-500"
              sizes="(max-width: 640px) 50vw, 33vw"
            />
            {photo.caption && (
              <div className="absolute inset-x-0 bottom-0 p-2 bg-gradient-to-t from-black/60 to-transparent opacity-0 group-hover:opacity-100 transition-opacity">
                <p className="text-xs text-white line-clamp-2">{photo.caption}</p>
              </div>
            )}
          </button>
        ))}
      </div>

      {/* Lightbox */}
      {lightboxIndex !== null && (
        <div
          className="fixed inset-0 z-50 bg-black/90 flex items-center justify-center"
          onClick={() => setLightboxIndex(null)}
        >
          <button
            onClick={(e) => { e.stopPropagation(); setLightboxIndex(null) }}
            className="absolute top-4 right-4 p-2 text-white/80 hover:text-white transition-colors"
          >
            <X className="w-6 h-6" />
          </button>

          {lightboxIndex > 0 && (
            <button
              onClick={(e) => { e.stopPropagation(); setLightboxIndex(lightboxIndex - 1) }}
              className="absolute left-4 p-2 text-white/80 hover:text-white transition-colors"
            >
              <ChevronLeft className="w-8 h-8" />
            </button>
          )}

          {lightboxIndex < photos.length - 1 && (
            <button
              onClick={(e) => { e.stopPropagation(); setLightboxIndex(lightboxIndex + 1) }}
              className="absolute right-4 p-2 text-white/80 hover:text-white transition-colors"
            >
              <ChevronRight className="w-8 h-8" />
            </button>
          )}

          <div className="relative w-full max-w-4xl max-h-[80vh] aspect-auto mx-8" onClick={e => e.stopPropagation()}>
            <Image
              src={photos[lightboxIndex].url}
              alt={photos[lightboxIndex].alt || 'PICC photo'}
              fill
              className="object-contain"
              sizes="100vw"
              priority
            />
          </div>

          {photos[lightboxIndex].caption && (
            <p className="absolute bottom-8 text-center text-white/80 text-sm max-w-xl mx-auto px-4">
              {photos[lightboxIndex].caption}
            </p>
          )}
        </div>
      )}
    </>
  )
}
