'use client'

import { ReactNode } from 'react'
import { motion, useScroll, useTransform } from 'framer-motion'
import { useVideoBackground } from './useVideoBackground'
import { OVERLAY_PRESETS, type OverlayPreset } from './overlayPresets'

interface VideoBackgroundProps {
  /** Direct video URL (mp4/webm) */
  videoSrc?: string
  /** Mobile-optimized video (smaller file) */
  videoSrcMobile?: string
  /** Poster image shown during load and as mobile/reduced-motion fallback */
  poster?: string
  /** Overlay style preset */
  overlay?: OverlayPreset
  /** Custom overlay opacity override (0-100) — overrides preset */
  overlayOpacity?: number
  /** Section height */
  height?: 'screen' | 'tall' | 'medium' | 'short'
  /** Content alignment */
  contentPosition?: 'center' | 'bottom-left' | 'bottom-center' | 'top-center'
  /** Subtle parallax zoom on scroll */
  parallax?: boolean
  /** Fade out section on scroll */
  fadeOnScroll?: boolean
  /** Content rendered on top of video */
  children?: ReactNode
  /** Additional CSS class for the container */
  className?: string
  /** Accessible section label */
  'aria-label'?: string
}

const HEIGHT_CLASSES = {
  screen: 'min-h-screen',
  tall: 'min-h-[80vh]',
  medium: 'min-h-[60vh]',
  short: 'min-h-[40vh]',
} as const

const POSITION_CLASSES = {
  center: 'items-center justify-center text-center',
  'bottom-left': 'items-end justify-start text-left pb-16 pl-8',
  'bottom-center': 'items-end justify-center text-center pb-16',
  'top-center': 'items-start justify-center text-center pt-32',
} as const

export default function VideoBackground({
  videoSrc,
  videoSrcMobile,
  poster,
  overlay = 'gradient-brand',
  overlayOpacity,
  height = 'screen',
  contentPosition = 'center',
  parallax = false,
  fadeOnScroll = false,
  children,
  className = '',
  'aria-label': ariaLabel,
}: VideoBackgroundProps) {
  const {
    videoRef,
    containerRef,
    isLoaded,
    isMobile,
    prefersReducedMotion,
  } = useVideoBackground()

  // Scroll-linked transforms
  const { scrollYProgress } = useScroll({
    target: containerRef as React.RefObject<HTMLElement>,
    offset: ['start start', 'end start'],
  })

  const scale = useTransform(scrollYProgress, [0, 1], [1, parallax ? 1.1 : 1])
  const opacity = useTransform(scrollYProgress, [0, 0.6], [1, fadeOnScroll ? 0 : 1])

  // Determine which video source to use
  const activeVideoSrc = isMobile
    ? videoSrcMobile || videoSrc
    : videoSrc

  // Show video only if: we have a source, user doesn't prefer reduced motion
  const showVideo = activeVideoSrc && !prefersReducedMotion

  // Overlay class — use preset or custom opacity
  const overlayClass = overlayOpacity !== undefined
    ? `bg-black/${overlayOpacity}`
    : OVERLAY_PRESETS[overlay]

  return (
    <motion.section
      ref={containerRef}
      style={fadeOnScroll ? { opacity } : undefined}
      className={`relative ${HEIGHT_CLASSES[height]} overflow-hidden flex ${POSITION_CLASSES[contentPosition]} ${className}`}
      aria-label={ariaLabel}
    >
      {/* Background layer — video or poster */}
      <motion.div
        style={parallax ? { scale } : undefined}
        className="absolute inset-0 w-full h-full"
      >
        {/* Poster image (always rendered, behind video) */}
        {poster && (
          <div
            className="absolute inset-0 w-full h-full bg-cover bg-center"
            style={{ backgroundImage: `url(${poster})` }}
            role="img"
            aria-hidden="true"
          />
        )}

        {/* Fallback gradient when no poster */}
        {!poster && (
          <div className="absolute inset-0 w-full h-full bg-gradient-to-br from-picc-earth to-picc-red" />
        )}

        {/* Video element */}
        {showVideo && (
          <video
            ref={videoRef}
            autoPlay
            loop
            muted
            playsInline
            className={`absolute inset-0 w-full h-full object-cover transition-opacity duration-1000 ${
              isLoaded ? 'opacity-100' : 'opacity-0'
            }`}
            tabIndex={-1}
            aria-hidden="true"
          >
            <source src={activeVideoSrc} type="video/mp4" />
          </video>
        )}
      </motion.div>

      {/* Overlay */}
      {overlay !== 'none' && (
        <div className={`absolute inset-0 ${overlayClass}`} aria-hidden="true" />
      )}

      {/* Content */}
      <div className="relative z-10 w-full max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {children}
      </div>
    </motion.section>
  )
}
