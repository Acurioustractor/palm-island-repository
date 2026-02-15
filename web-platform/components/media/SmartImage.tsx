'use client'

import { useEffect, useState } from 'react'
import Image from 'next/image'
import AdminImage from '@/components/admin/AdminImage'

interface SmartImageProps {
  pageContext: string
  pageSection: string
  fallbackGradient?: string
  className?: string
  fill?: boolean
  width?: number
  height?: number
  alt?: string
  sizes?: string
  priority?: boolean
}

interface MediaRecord {
  id: string
  public_url: string
  alt_text?: string | null
  title?: string | null
}

export default function SmartImage({
  pageContext,
  pageSection,
  fallbackGradient = 'from-warm-50 to-warm-100',
  className = '',
  fill,
  width,
  height,
  alt,
  sizes,
  priority,
}: SmartImageProps) {
  const [media, setMedia] = useState<MediaRecord | null>(null)
  const [loading, setLoading] = useState(true)
  const [imgError, setImgError] = useState(false)

  useEffect(() => {
    const params = new URLSearchParams({
      fileType: 'image',
      featured: 'true',
      pageContext,
      pageSection,
      limit: '1',
    })

    fetch(`/api/media/list?${params}`)
      .then((res) => (res.ok ? res.json() : null))
      .then((payload) => {
        const items = payload?.data
        if (Array.isArray(items) && items.length > 0) {
          setMedia(items[0])
        }
      })
      .catch(() => {})
      .finally(() => setLoading(false))
  }, [pageContext, pageSection])

  const handleSwap = (picked: { id: string; public_url: string; alt_text?: string | null }) => {
    setMedia(picked)
    setImgError(false)
  }

  // Loading state
  if (loading) {
    return (
      <div className={`animate-pulse bg-gradient-to-br ${fallbackGradient} ${className}`}>
        {fill ? null : <div style={{ width: width || '100%', height: height || 200 }} />}
      </div>
    )
  }

  // No image assigned — show gradient placeholder
  if (!media || imgError) {
    return (
      <AdminImage pageContext={pageContext} pageSection={pageSection} onSwap={handleSwap}>
        <div className={`bg-gradient-to-br ${fallbackGradient} ${className}`}>
          {fill ? null : <div style={{ width: width || '100%', height: height || 200 }} />}
        </div>
      </AdminImage>
    )
  }

  const altText = alt || media.alt_text || media.title || `${pageContext} ${pageSection}`

  return (
    <AdminImage
      pageContext={pageContext}
      pageSection={pageSection}
      mediaId={media.id}
      onSwap={handleSwap}
    >
      {fill ? (
        <Image
          src={media.public_url}
          alt={altText}
          fill
          className={className}
          sizes={sizes}
          priority={priority}
          onError={() => setImgError(true)}
        />
      ) : (
        <img
          src={media.public_url}
          alt={altText}
          width={width}
          height={height}
          className={className}
          onError={() => setImgError(true)}
        />
      )}
    </AdminImage>
  )
}

/**
 * SmartImageGallery — fetches multiple featured images for a page section.
 */
interface SmartImageGalleryProps {
  pageContext: string
  pageSection: string
  limit?: number
  fallbackGradient?: string
  className?: string
  renderItem: (media: MediaRecord, index: number) => React.ReactNode
  renderEmpty?: () => React.ReactNode
}

export function SmartImageGallery({
  pageContext,
  pageSection,
  limit = 8,
  renderItem,
  renderEmpty,
}: SmartImageGalleryProps) {
  const [items, setItems] = useState<MediaRecord[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const params = new URLSearchParams({
      fileType: 'image',
      pageContext,
      pageSection,
      limit: String(limit),
    })

    fetch(`/api/media/list?${params}`)
      .then((res) => (res.ok ? res.json() : null))
      .then((payload) => {
        const data = payload?.data
        if (Array.isArray(data)) setItems(data)
      })
      .catch(() => {})
      .finally(() => setLoading(false))
  }, [pageContext, pageSection, limit])

  if (loading) {
    return (
      <div className="grid grid-cols-2 md:grid-cols-4 gap-3 md:gap-4">
        {Array.from({ length: limit }).map((_, i) => (
          <div key={i} className="aspect-square rounded-2xl animate-pulse bg-gray-100" />
        ))}
      </div>
    )
  }

  if (items.length === 0 && renderEmpty) {
    return <>{renderEmpty()}</>
  }

  return <>{items.map((item, i) => renderItem(item, i))}</>
}
