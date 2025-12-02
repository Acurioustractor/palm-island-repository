'use client'

import { useState, useCallback, useRef } from 'react'
import { createClient } from '@/lib/supabase/client'
import { Upload, X, Image as ImageIcon, Loader2, Check } from 'lucide-react'
import { cn } from '@/lib/utils'

interface StoryImageUploadProps {
  storyId: string
  organizationSlug?: string
  serviceSlug?: string
  onUploadComplete?: (imageUrl: string, imageId: string) => void
  maxFiles?: number
  className?: string
}

interface UploadedImage {
  id: string
  url: string
  file: File
  status: 'uploading' | 'success' | 'error'
  progress: number
}

export function StoryImageUpload({
  storyId,
  organizationSlug = 'picc',
  serviceSlug,
  onUploadComplete,
  maxFiles = 10,
  className
}: StoryImageUploadProps) {
  const [images, setImages] = useState<UploadedImage[]>([])
  const [isDragging, setIsDragging] = useState(false)
  const fileInputRef = useRef<HTMLInputElement>(null)
  const supabase = createClient()

  const uploadImage = useCallback(
    async (file: File, tempId: string) => {
      try {
        // Update status to uploading
        setImages(prev =>
          prev.map(img => (img.id === tempId ? { ...img, status: 'uploading' as const } : img))
        )

        // Generate unique filename
        const fileExt = file.name.split('.').pop()
        const fileName = `${organizationSlug}/${serviceSlug || 'general'}/${Date.now()}-${storyId}.${fileExt}`

        // Upload to Supabase Storage
        const { data: uploadData, error: uploadError } = await supabase.storage
          .from('story-images')
          .upload(fileName, file, {
            cacheControl: '3600',
            upsert: false
          })

        if (uploadError) throw uploadError

        // Get public URL
        const {
          data: { publicUrl }
        } = supabase.storage.from('story-images').getPublicUrl(fileName)

        // Get image dimensions
        const dimensions = await getImageDimensions(file)

        // Insert into story_images table
        const { data: imageData, error: dbError } = await supabase
          .from('story_images')
          .insert({
            story_id: storyId,
            storage_path: fileName,
            public_url: publicUrl,
            mime_type: file.type,
            file_size: file.size,
            width: dimensions.width,
            height: dimensions.height
          })
          .select()
          .single()

        if (dbError) throw dbError

        // Update status to success
        setImages(prev =>
          prev.map(img =>
            img.id === tempId
              ? { ...img, status: 'success' as const, progress: 100, url: publicUrl }
              : img
          )
        )

        // Call callback
        onUploadComplete?.(publicUrl, imageData.id)
      } catch (error) {
        console.error('Upload error:', error)
        setImages(prev =>
          prev.map(img => (img.id === tempId ? { ...img, status: 'error' as const } : img))
        )
      }
    },
    [storyId, organizationSlug, serviceSlug, supabase, onUploadComplete]
  )

  const handleFiles = useCallback(
    (files: FileList | null) => {
      if (!files) return

      const fileArray = Array.from(files).slice(0, maxFiles - images.length)

      fileArray.forEach(file => {
        if (!file.type.startsWith('image/')) return

        const tempId = `temp-${Date.now()}-${Math.random()}`
        const reader = new FileReader()

        reader.onload = e => {
          const newImage: UploadedImage = {
            id: tempId,
            url: e.target?.result as string,
            file,
            status: 'uploading',
            progress: 0
          }

          setImages(prev => [...prev, newImage])
          uploadImage(file, tempId)
        }

        reader.readAsDataURL(file)
      })
    },
    [images.length, maxFiles, uploadImage]
  )

  const handleDragOver = useCallback((e: React.DragEvent) => {
    e.preventDefault()
    setIsDragging(true)
  }, [])

  const handleDragLeave = useCallback((e: React.DragEvent) => {
    e.preventDefault()
    setIsDragging(false)
  }, [])

  const handleDrop = useCallback(
    (e: React.DragEvent) => {
      e.preventDefault()
      setIsDragging(false)
      handleFiles(e.dataTransfer.files)
    },
    [handleFiles]
  )

  const handleFileInput = useCallback(
    (e: React.ChangeEvent<HTMLInputElement>) => {
      handleFiles(e.target.files)
    },
    [handleFiles]
  )

  const removeImage = useCallback((id: string) => {
    setImages(prev => prev.filter(img => img.id !== id))
  }, [])

  return (
    <div className={cn('space-y-4', className)}>
      {/* Drop Zone */}
      <div
        onDragOver={handleDragOver}
        onDragLeave={handleDragLeave}
        onDrop={handleDrop}
        onClick={() => fileInputRef.current?.click()}
        className={cn(
          'relative cursor-pointer rounded-lg border-2 border-dashed p-8 transition-colors',
          isDragging
            ? 'border-blue-500 bg-blue-50'
            : 'border-gray-300 hover:border-gray-400 hover:bg-gray-50',
          images.length >= maxFiles && 'pointer-events-none opacity-50'
        )}
      >
        <input
          ref={fileInputRef}
          type="file"
          accept="image/*"
          multiple
          onChange={handleFileInput}
          className="hidden"
          disabled={images.length >= maxFiles}
        />

        <div className="flex flex-col items-center justify-center space-y-3 text-center">
          <div className="rounded-full bg-gray-100 p-4">
            <Upload className="h-8 w-8 text-gray-600" />
          </div>
          <div>
            <p className="text-sm font-medium text-gray-900">
              Drop images here or click to browse
            </p>
            <p className="text-xs text-gray-500">
              PNG, JPG, WebP up to 10MB • {images.length}/{maxFiles} uploaded
            </p>
          </div>
        </div>
      </div>

      {/* Image Previews */}
      {images.length > 0 && (
        <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 md:grid-cols-4">
          {images.map(image => (
            <div key={image.id} className="group relative aspect-square overflow-hidden rounded-lg">
              <img
                src={image.url}
                alt="Upload preview"
                className="h-full w-full object-cover"
              />

              {/* Status Overlay */}
              <div
                className={cn(
                  'absolute inset-0 flex items-center justify-center transition-opacity',
                  image.status === 'uploading'
                    ? 'bg-black/50'
                    : 'bg-black/0 group-hover:bg-black/30'
                )}
              >
                {image.status === 'uploading' && (
                  <Loader2 className="h-8 w-8 animate-spin text-white" />
                )}
                {image.status === 'success' && (
                  <Check className="h-8 w-8 text-green-500 opacity-0 transition-opacity group-hover:opacity-100" />
                )}
                {image.status === 'error' && (
                  <div className="text-center text-white">
                    <X className="mx-auto h-8 w-8" />
                    <p className="mt-1 text-xs">Upload failed</p>
                  </div>
                )}
              </div>

              {/* Remove Button */}
              <button
                onClick={() => removeImage(image.id)}
                className="absolute right-2 top-2 rounded-full bg-red-500 p-1 text-white opacity-0 transition-opacity hover:bg-red-600 group-hover:opacity-100"
              >
                <X className="h-4 w-4" />
              </button>
            </div>
          ))}
        </div>
      )}
    </div>
  )
}

// Helper function to get image dimensions
function getImageDimensions(file: File): Promise<{ width: number; height: number }> {
  return new Promise((resolve, reject) => {
    const img = new Image()
    const url = URL.createObjectURL(file)

    img.onload = () => {
      URL.revokeObjectURL(url)
      resolve({ width: img.width, height: img.height })
    }

    img.onerror = () => {
      URL.revokeObjectURL(url)
      reject(new Error('Failed to load image'))
    }

    img.src = url
  })
}
