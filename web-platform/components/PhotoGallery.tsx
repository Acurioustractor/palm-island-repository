'use client'

import { useState, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { X, ChevronLeft, ChevronRight, Download, User, Calendar, MapPin } from 'lucide-react'
import { cn } from '@/lib/utils'

export interface GalleryImage {
  id: string
  url: string
  thumbnailUrl?: string
  alt?: string
  caption?: string
  photographer?: string
  location?: string
  date?: string
  storyTitle?: string
  storytellerName?: string
}

interface PhotoGalleryProps {
  images: GalleryImage[]
  columns?: 2 | 3 | 4
  gap?: 2 | 4 | 6 | 8
  className?: string
}

export function PhotoGallery({ images, columns = 3, gap = 4, className }: PhotoGalleryProps) {
  const [lightboxOpen, setLightboxOpen] = useState(false)
  const [currentIndex, setCurrentIndex] = useState(0)

  // Keyboard navigation
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (!lightboxOpen) return

      if (e.key === 'Escape') {
        setLightboxOpen(false)
      } else if (e.key === 'ArrowLeft') {
        goToPrevious()
      } else if (e.key === 'ArrowRight') {
        goToNext()
      }
    }

    window.addEventListener('keydown', handleKeyDown)
    return () => window.removeEventListener('keydown', handleKeyDown)
  }, [lightboxOpen, currentIndex])

  // Prevent body scroll when lightbox is open
  useEffect(() => {
    if (lightboxOpen) {
      document.body.style.overflow = 'hidden'
    } else {
      document.body.style.overflow = 'unset'
    }
  }, [lightboxOpen])

  const openLightbox = (index: number) => {
    setCurrentIndex(index)
    setLightboxOpen(true)
  }

  const goToNext = () => {
    setCurrentIndex(prev => (prev + 1) % images.length)
  }

  const goToPrevious = () => {
    setCurrentIndex(prev => (prev - 1 + images.length) % images.length)
  }

  const currentImage = images[currentIndex]

  const gridCols = {
    2: 'md:grid-cols-2',
    3: 'md:grid-cols-2 lg:grid-cols-3',
    4: 'md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4'
  }

  const gridGap = {
    2: 'gap-2',
    4: 'gap-4',
    6: 'gap-6',
    8: 'gap-8'
  }

  return (
    <>
      {/* Masonry Grid */}
      <div className={cn('grid grid-cols-1', gridCols[columns], gridGap[gap], className)}>
        {images.map((image, index) => (
          <motion.div
            key={image.id}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: index * 0.05 }}
            className="group relative cursor-pointer overflow-hidden rounded-lg bg-gray-100"
            onClick={() => openLightbox(index)}
          >
            <img
              src={image.thumbnailUrl || image.url}
              alt={image.alt || image.caption || 'Gallery image'}
              className="h-full w-full object-cover transition-transform duration-300 group-hover:scale-105"
              loading="lazy"
            />

            {/* Hover Overlay */}
            <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-black/0 to-black/0 opacity-0 transition-opacity duration-300 group-hover:opacity-100">
              <div className="absolute bottom-0 left-0 right-0 p-4 text-white">
                {image.caption && (
                  <p className="text-sm font-medium line-clamp-2">{image.caption}</p>
                )}
                {image.photographer && (
                  <p className="mt-1 text-xs opacity-90">Photo by {image.photographer}</p>
                )}
              </div>
            </div>
          </motion.div>
        ))}
      </div>

      {/* Lightbox Modal */}
      <AnimatePresence>
        {lightboxOpen && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 flex items-center justify-center bg-black/95"
            onClick={() => setLightboxOpen(false)}
          >
            {/* Close Button */}
            <button
              onClick={() => setLightboxOpen(false)}
              className="absolute right-4 top-4 z-10 rounded-full bg-white/10 p-2 text-white backdrop-blur-sm transition-colors hover:bg-white/20"
            >
              <X className="h-6 w-6" />
            </button>

            {/* Navigation Buttons */}
            {images.length > 1 && (
              <>
                <button
                  onClick={e => {
                    e.stopPropagation()
                    goToPrevious()
                  }}
                  className="absolute left-4 top-1/2 z-10 -translate-y-1/2 rounded-full bg-white/10 p-3 text-white backdrop-blur-sm transition-colors hover:bg-white/20"
                >
                  <ChevronLeft className="h-6 w-6" />
                </button>
                <button
                  onClick={e => {
                    e.stopPropagation()
                    goToNext()
                  }}
                  className="absolute right-4 top-1/2 z-10 -translate-y-1/2 rounded-full bg-white/10 p-3 text-white backdrop-blur-sm transition-colors hover:bg-white/20"
                >
                  <ChevronRight className="h-6 w-6" />
                </button>
              </>
            )}

            {/* Image Counter */}
            <div className="absolute left-4 top-4 z-10 rounded-full bg-white/10 px-4 py-2 text-sm text-white backdrop-blur-sm">
              {currentIndex + 1} / {images.length}
            </div>

            {/* Main Image */}
            <motion.div
              key={currentIndex}
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.9 }}
              transition={{ duration: 0.2 }}
              className="relative flex h-full w-full items-center justify-center p-20"
              onClick={e => e.stopPropagation()}
            >
              <img
                src={currentImage.url}
                alt={currentImage.alt || currentImage.caption || 'Gallery image'}
                className="max-h-full max-w-full object-contain"
              />
            </motion.div>

            {/* Image Info Panel */}
            {(currentImage.caption ||
              currentImage.photographer ||
              currentImage.location ||
              currentImage.date ||
              currentImage.storyTitle) && (
              <motion.div
                initial={{ y: 100, opacity: 0 }}
                animate={{ y: 0, opacity: 1 }}
                exit={{ y: 100, opacity: 0 }}
                className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black via-black/90 to-transparent p-6 text-white"
                onClick={e => e.stopPropagation()}
              >
                <div className="mx-auto max-w-4xl space-y-3">
                  {currentImage.caption && (
                    <h3 className="text-lg font-medium">{currentImage.caption}</h3>
                  )}

                  <div className="flex flex-wrap gap-4 text-sm text-white/80">
                    {currentImage.photographer && (
                      <div className="flex items-center gap-2">
                        <User className="h-4 w-4" />
                        <span>{currentImage.photographer}</span>
                      </div>
                    )}

                    {currentImage.location && (
                      <div className="flex items-center gap-2">
                        <MapPin className="h-4 w-4" />
                        <span>{currentImage.location}</span>
                      </div>
                    )}

                    {currentImage.date && (
                      <div className="flex items-center gap-2">
                        <Calendar className="h-4 w-4" />
                        <span>{currentImage.date}</span>
                      </div>
                    )}
                  </div>

                  {currentImage.storyTitle && (
                    <div className="border-t border-white/20 pt-3">
                      <p className="text-sm text-white/70">From the story</p>
                      <p className="font-medium">{currentImage.storyTitle}</p>
                      {currentImage.storytellerName && (
                        <p className="text-sm text-white/80">by {currentImage.storytellerName}</p>
                      )}
                    </div>
                  )}

                  {/* Download Button */}
                  <a
                    href={currentImage.url}
                    download
                    onClick={e => e.stopPropagation()}
                    className="mt-4 inline-flex items-center gap-2 rounded-lg bg-white/10 px-4 py-2 text-sm backdrop-blur-sm transition-colors hover:bg-white/20"
                  >
                    <Download className="h-4 w-4" />
                    Download Image
                  </a>
                </div>
              </motion.div>
            )}
          </motion.div>
        )}
      </AnimatePresence>
    </>
  )
}

// Simplified version for smaller galleries
export function SimplePhotoGallery({
  images,
  className
}: {
  images: GalleryImage[]
  className?: string
}) {
  return (
    <div className={cn('grid grid-cols-2 gap-2 sm:grid-cols-3 md:grid-cols-4', className)}>
      {images.map(image => (
        <div key={image.id} className="aspect-square overflow-hidden rounded-lg">
          <img
            src={image.thumbnailUrl || image.url}
            alt={image.alt || image.caption || 'Photo'}
            className="h-full w-full object-cover"
            loading="lazy"
          />
        </div>
      ))}
    </div>
  )
}
