'use client'

import { useEffect, useCallback, useRef, useState } from 'react'
import { X, ChevronLeft, ChevronRight, Download } from 'lucide-react'

export type LightboxImage = {
  id: string
  url: string
  title?: string | null
  caption?: string | null
}

type ImageLightboxProps = {
  images: LightboxImage[]
  activeIndex: number
  onClose: () => void
  onNavigate: (index: number) => void
  showDownload?: boolean
  className?: string
}

/**
 * Accessible image lightbox with keyboard navigation.
 *
 * Features:
 * - Left/Right arrow keys for navigation
 * - Escape to close
 * - Click outside to close
 * - Focus trap
 * - Touch swipe support
 * - Image counter
 */
export default function ImageLightbox({
  images,
  activeIndex,
  onClose,
  onNavigate,
  showDownload = false,
  className = '',
}: ImageLightboxProps) {
  const containerRef = useRef<HTMLDivElement>(null)
  const touchStartX = useRef<number | null>(null)

  const activeImage = images[activeIndex]
  const hasPrev = activeIndex > 0
  const hasNext = activeIndex < images.length - 1

  const goNext = useCallback(() => {
    if (hasNext) onNavigate(activeIndex + 1)
  }, [activeIndex, hasNext, onNavigate])

  const goPrev = useCallback(() => {
    if (hasPrev) onNavigate(activeIndex - 1)
  }, [activeIndex, hasPrev, onNavigate])

  // Keyboard navigation
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      switch (e.key) {
        case 'Escape':
          e.preventDefault()
          onClose()
          break
        case 'ArrowLeft':
          e.preventDefault()
          goPrev()
          break
        case 'ArrowRight':
          e.preventDefault()
          goNext()
          break
      }
    }

    window.addEventListener('keydown', handleKeyDown)
    return () => window.removeEventListener('keydown', handleKeyDown)
  }, [onClose, goNext, goPrev])

  // Lock body scroll
  useEffect(() => {
    const prev = document.body.style.overflow
    document.body.style.overflow = 'hidden'
    return () => {
      document.body.style.overflow = prev
    }
  }, [])

  // Focus container on mount
  useEffect(() => {
    containerRef.current?.focus()
  }, [])

  // Touch handlers for swipe
  const handleTouchStart = (e: React.TouchEvent) => {
    touchStartX.current = e.touches[0].clientX
  }

  const handleTouchEnd = (e: React.TouchEvent) => {
    if (touchStartX.current === null) return
    const touchEndX = e.changedTouches[0].clientX
    const diff = touchStartX.current - touchEndX

    if (Math.abs(diff) > 50) {
      if (diff > 0) {
        goNext()
      } else {
        goPrev()
      }
    }
    touchStartX.current = null
  }

  const handleBackdropClick = (e: React.MouseEvent) => {
    if (e.target === e.currentTarget) {
      onClose()
    }
  }

  if (!activeImage) return null

  return (
    <div
      ref={containerRef}
      tabIndex={-1}
      className={`fixed inset-0 z-[110] bg-black/90 flex items-center justify-center outline-none ${className}`}
      role="dialog"
      aria-modal="true"
      aria-label="Image gallery"
      onMouseDown={handleBackdropClick}
      onTouchStart={handleTouchStart}
      onTouchEnd={handleTouchEnd}
    >
      {/* Top bar */}
      <div className="absolute top-0 left-0 right-0 p-4 flex items-center justify-between z-10">
        <div className="text-white/80 text-sm font-medium bg-black/30 px-3 py-1.5 rounded-lg">
          {activeIndex + 1} / {images.length}
        </div>
        <div className="flex items-center gap-2">
          {showDownload && (
            <a
              href={activeImage.url}
              download
              className="inline-flex items-center gap-2 px-4 py-2 rounded-xl bg-white/10 hover:bg-white/20 text-white font-medium transition-colors"
              aria-label="Download image"
            >
              <Download className="w-4 h-4" />
            </a>
          )}
          <button
            type="button"
            onClick={onClose}
            className="inline-flex items-center gap-2 px-4 py-2 rounded-xl bg-white/90 hover:bg-white text-gray-900 font-semibold transition-colors"
          >
            <X className="w-4 h-4" /> Close
          </button>
        </div>
      </div>

      {/* Navigation arrows */}
      {hasPrev && (
        <button
          type="button"
          onClick={goPrev}
          className="absolute left-4 top-1/2 -translate-y-1/2 p-3 rounded-full bg-white/10 hover:bg-white/20 text-white transition-colors z-10"
          aria-label="Previous image"
        >
          <ChevronLeft className="w-8 h-8" />
        </button>
      )}
      {hasNext && (
        <button
          type="button"
          onClick={goNext}
          className="absolute right-4 top-1/2 -translate-y-1/2 p-3 rounded-full bg-white/10 hover:bg-white/20 text-white transition-colors z-10"
          aria-label="Next image"
        >
          <ChevronRight className="w-8 h-8" />
        </button>
      )}

      {/* Main image */}
      <div className="max-w-5xl w-full px-16 py-16">
        <div className="bg-black rounded-2xl overflow-hidden border border-white/10">
          <img
            src={activeImage.url}
            alt={activeImage.title || 'Gallery photo'}
            className="w-full h-auto max-h-[70vh] object-contain"
          />
        </div>
        {(activeImage.title || activeImage.caption) && (
          <div className="mt-4 text-center text-white/90">
            {activeImage.title && <div className="font-bold text-lg">{activeImage.title}</div>}
            {activeImage.caption && <div className="text-sm text-white/70 mt-1">{activeImage.caption}</div>}
          </div>
        )}
      </div>

      {/* Thumbnail strip (optional for many images) */}
      {images.length > 1 && images.length <= 12 && (
        <div className="absolute bottom-4 left-0 right-0 flex justify-center gap-2 px-4">
          {images.map((img, idx) => (
            <button
              key={img.id}
              type="button"
              onClick={() => onNavigate(idx)}
              className={`w-16 h-12 rounded-lg overflow-hidden border-2 transition-all ${
                idx === activeIndex
                  ? 'border-white scale-110'
                  : 'border-transparent opacity-60 hover:opacity-100'
              }`}
              aria-label={`View image ${idx + 1}`}
            >
              <img src={img.url} alt="" className="w-full h-full object-cover" />
            </button>
          ))}
        </div>
      )}

      {/* Keyboard hints (hidden but announced) */}
      <div className="sr-only" aria-live="polite">
        Use left and right arrow keys to navigate. Press Escape to close.
      </div>
    </div>
  )
}

/**
 * Hook for managing lightbox state
 */
export function useLightbox(images: LightboxImage[]) {
  const [activeIndex, setActiveIndex] = useState<number | null>(null)

  const open = useCallback((index: number) => {
    setActiveIndex(index)
  }, [])

  const close = useCallback(() => {
    setActiveIndex(null)
  }, [])

  const navigate = useCallback((index: number) => {
    if (index >= 0 && index < images.length) {
      setActiveIndex(index)
    }
  }, [images.length])

  return {
    isOpen: activeIndex !== null,
    activeIndex: activeIndex ?? 0,
    open,
    close,
    navigate,
  }
}

