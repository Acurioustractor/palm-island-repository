'use client'

import { useState, type ReactNode } from 'react'
import { useAdmin } from '@/lib/admin/AdminContext'
import MediaPickerDialog from '@/components/admin/MediaPickerDialog'
import { Camera, AlertTriangle } from 'lucide-react'

interface AdminImageProps {
  pageContext: string
  pageSection: string
  mediaId?: string
  onSwap?: (media: { id: string; public_url: string; alt_text?: string | null }) => void
  children: ReactNode
}

export default function AdminImage({ pageContext, pageSection, mediaId, onSwap, children }: AdminImageProps) {
  const { isAdmin, isEditMode } = useAdmin()
  const [pickerOpen, setPickerOpen] = useState(false)
  const [broken, setBroken] = useState(false)

  // Not admin or not in edit mode — render children with no overhead
  if (!isAdmin || !isEditMode) {
    return <>{children}</>
  }

  const handlePick = async (media: { id: string; public_url: string; alt_text?: string | null }) => {
    setPickerOpen(false)

    try {
      await fetch('/api/media/assign', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          mediaId: media.id,
          pageContext,
          pageSection,
        }),
      })
    } catch (err) {
      console.error('Failed to assign media:', err)
    }

    onSwap?.(media)
  }

  return (
    <>
      <div
        className="relative group cursor-pointer"
        onClick={() => setPickerOpen(true)}
        onError={() => setBroken(true)}
      >
        {children}

        {/* Edit overlay on hover */}
        <div className="absolute top-2 right-2 z-10 opacity-0 group-hover:opacity-100 transition-opacity">
          <div className="flex items-center gap-1.5 px-2.5 py-1.5 bg-black/70 backdrop-blur-sm text-white text-xs font-medium rounded-full">
            <Camera className="w-3.5 h-3.5" />
            Swap
          </div>
        </div>

        {/* Broken image badge */}
        {broken && (
          <div className="absolute top-2 left-2 z-10">
            <div className="flex items-center gap-1 px-2 py-1 bg-red-500 text-white text-xs font-medium rounded-full">
              <AlertTriangle className="w-3 h-3" />
              Broken
            </div>
          </div>
        )}

        {/* Subtle border to indicate editable */}
        <div className="absolute inset-0 border-2 border-transparent group-hover:border-picc-red/40 rounded-[inherit] pointer-events-none transition-colors" />
      </div>

      <MediaPickerDialog
        open={pickerOpen}
        kind="image"
        onClose={() => setPickerOpen(false)}
        onPick={handlePick}
      />
    </>
  )
}
