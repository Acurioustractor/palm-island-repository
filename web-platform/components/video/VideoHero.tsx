'use client'

import { ReactNode } from 'react'
import VideoBackground from './VideoBackground'
import type { OverlayPreset } from './overlayPresets'

interface VideoHeroProps {
  /** Poster image (also used as fallback) */
  poster?: string
  /** Video source — defaults to shared hero video */
  videoSrc?: string
  /** Mobile video — defaults to shared mobile hero video */
  videoSrcMobile?: string
  /** Overlay preset */
  overlay?: OverlayPreset
  /** Section height */
  height?: 'screen' | 'tall' | 'medium' | 'short'
  /** Content position */
  contentPosition?: 'center' | 'bottom-left' | 'bottom-center' | 'top-center'
  /** Enable parallax zoom */
  parallax?: boolean
  /** Fade on scroll */
  fadeOnScroll?: boolean
  /** Accessible label */
  'aria-label'?: string
  /** Content */
  children: ReactNode
}

/**
 * Client-side wrapper around VideoBackground for use in server components.
 * Defaults to the shared PICC hero video assets.
 */
export default function VideoHero({
  poster,
  videoSrc = '/video/hero-desktop-web.mp4',
  videoSrcMobile = '/video/hero-mobile.mp4',
  overlay = 'gradient-brand',
  height = 'tall',
  contentPosition = 'center',
  parallax = true,
  fadeOnScroll = false,
  children,
  'aria-label': ariaLabel,
}: VideoHeroProps) {
  return (
    <VideoBackground
      videoSrc={videoSrc}
      videoSrcMobile={videoSrcMobile}
      poster={poster}
      overlay={overlay}
      height={height}
      contentPosition={contentPosition}
      parallax={parallax}
      fadeOnScroll={fadeOnScroll}
      aria-label={ariaLabel}
    >
      {children}
    </VideoBackground>
  )
}
