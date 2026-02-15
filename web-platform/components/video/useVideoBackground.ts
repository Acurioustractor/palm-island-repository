'use client'

import { useRef, useState, useEffect, useCallback } from 'react'

interface UseVideoBackgroundOptions {
  /** Viewport width below which we use mobile video or poster fallback */
  mobileBreakpoint?: number
  /** IntersectionObserver threshold (0-1) */
  threshold?: number
}

interface UseVideoBackgroundReturn {
  videoRef: React.RefObject<HTMLVideoElement>
  containerRef: React.RefObject<HTMLDivElement>
  isInView: boolean
  isLoaded: boolean
  isMobile: boolean
  prefersReducedMotion: boolean
}

export function useVideoBackground(
  options: UseVideoBackgroundOptions = {}
): UseVideoBackgroundReturn {
  const { mobileBreakpoint = 768, threshold = 0.1 } = options

  const videoRef = useRef<HTMLVideoElement>(null)
  const containerRef = useRef<HTMLDivElement>(null)
  const [isInView, setIsInView] = useState(false)
  const [isLoaded, setIsLoaded] = useState(false)
  const [isMobile, setIsMobile] = useState(false)
  const [prefersReducedMotion, setPrefersReducedMotion] = useState(false)

  // Check reduced motion preference
  useEffect(() => {
    const mq = window.matchMedia('(prefers-reduced-motion: reduce)')
    setPrefersReducedMotion(mq.matches)
    const handler = (e: MediaQueryListEvent) => setPrefersReducedMotion(e.matches)
    mq.addEventListener('change', handler)
    return () => mq.removeEventListener('change', handler)
  }, [])

  // Check mobile
  useEffect(() => {
    const check = () => setIsMobile(window.innerWidth < mobileBreakpoint)
    check()
    window.addEventListener('resize', check)
    return () => window.removeEventListener('resize', check)
  }, [mobileBreakpoint])

  // Video loaded
  const handleLoaded = useCallback(() => setIsLoaded(true), [])

  useEffect(() => {
    const video = videoRef.current
    if (!video) return
    // If video already loaded before effect ran, mark loaded immediately
    if (video.readyState >= 2) {
      setIsLoaded(true)
      return
    }
    video.addEventListener('loadeddata', handleLoaded)
    return () => video.removeEventListener('loadeddata', handleLoaded)
  }, [handleLoaded])

  // IntersectionObserver — play/pause based on visibility
  useEffect(() => {
    const container = containerRef.current
    if (!container) return

    const observer = new IntersectionObserver(
      ([entry]) => {
        setIsInView(entry.isIntersecting)
        const video = videoRef.current
        if (!video || prefersReducedMotion) return

        if (entry.isIntersecting) {
          video.play().catch(() => {
            // Autoplay blocked — poster will show
          })
        } else {
          video.pause()
        }
      },
      { threshold }
    )

    observer.observe(container)
    return () => observer.disconnect()
  }, [threshold, prefersReducedMotion])

  return {
    videoRef,
    containerRef,
    isInView,
    isLoaded,
    isMobile,
    prefersReducedMotion,
  }
}
