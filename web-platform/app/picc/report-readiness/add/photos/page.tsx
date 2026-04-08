'use client'

import { useState, useEffect, Suspense } from 'react'
import { createClient } from '@/lib/supabase/client'
import { useRouter, useSearchParams } from 'next/navigation'
import { Upload as UploadIcon, Image, Check, AlertCircle, ArrowLeft, X } from 'lucide-react'
import Link from 'next/link'

interface UploadFile {
  file: File
  preview?: string
  status: 'pending' | 'uploading' | 'success' | 'error'
  error?: string
  progress: number
}

export default function AddPhotosPage() {
  return (
    <Suspense fallback={<div className="flex items-center justify-center min-h-[400px]"><div className="animate-spin rounded-full h-8 w-8 border-b-2 border-gray-900" /></div>}>
      <AddPhotosContent />
    </Suspense>
  )
}

function AddPhotosContent() {
  const router = useRouter()
  const searchParams = useSearchParams()
  const supabase = createClient()
  const [files, setFiles] = useState<UploadFile[]>([])
  const [uploading, setUploading] = useState(false)
  const [uploadedCount, setUploadedCount] = useState(0)
  const [title, setTitle] = useState('')
  const [description, setDescription] = useState('')
  const [location, setLocation] = useState('')
  const bucket = 'story-media'

  // Pre-filled tags from URL
  const fy = searchParams.get('fy') || '2025-26'
  const section = searchParams.get('section') || 'annual-report'
  const defaultTags = [section, `fy:${fy}`]

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const selectedFiles = Array.from(e.target.files || [])
    const newFiles: UploadFile[] = selectedFiles.map(file => {
      const uploadFile: UploadFile = { file, status: 'pending', progress: 0 }
      if (file.type.startsWith('image/')) {
        const reader = new FileReader()
        reader.onloadend = () => {
          uploadFile.preview = reader.result as string
          setFiles(prev => [...prev])
        }
        reader.readAsDataURL(file)
      }
      return uploadFile
    })
    setFiles(prev => [...prev, ...newFiles])
  }

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault()
    const droppedFiles = Array.from(e.dataTransfer.files)
    const newFiles: UploadFile[] = droppedFiles.map(file => {
      const uploadFile: UploadFile = { file, status: 'pending', progress: 0 }
      if (file.type.startsWith('image/')) {
        const reader = new FileReader()
        reader.onloadend = () => {
          uploadFile.preview = reader.result as string
          setFiles(prev => [...prev])
        }
        reader.readAsDataURL(file)
      }
      return uploadFile
    })
    setFiles(prev => [...prev, ...newFiles])
  }

  const removeFile = (index: number) => {
    setFiles(prev => prev.filter((_, i) => i !== index))
  }

  const uploadFiles = async () => {
    if (files.length === 0) return
    setUploading(true)
    setUploadedCount(0)

    const { data: { user } } = await supabase.auth.getUser()
    const pendingFiles = files.filter(f => f.status === 'pending')

    for (let i = 0; i < pendingFiles.length; i++) {
      const uploadFile = pendingFiles[i]
      const fileIndex = files.indexOf(uploadFile)

      setFiles(prev => prev.map((f, idx) =>
        idx === fileIndex ? { ...f, status: 'uploading' as const, progress: 0 } : f
      ))

      try {
        const fileExt = uploadFile.file.name.split('.').pop()
        const uniqueName = `${Date.now()}-${Math.random().toString(36).substring(2, 8)}.${fileExt}`
        const filePath = `picc-website/annual-report/${uniqueName}`

        const { error: uploadError } = await supabase.storage
          .from(bucket)
          .upload(filePath, uploadFile.file, {
            cacheControl: '3600',
            upsert: false,
          })

        if (uploadError) throw uploadError

        const { data: { publicUrl } } = supabase.storage
          .from(bucket)
          .getPublicUrl(filePath)

        let width, height
        if (uploadFile.file.type.startsWith('image/')) {
          const dimensions = await getImageDimensions(uploadFile.file)
          width = dimensions.width
          height = dimensions.height
        }

        const { error: dbError } = await supabase
          .from('media_files')
          .insert({
            filename: uniqueName,
            original_filename: uploadFile.file.name,
            file_path: filePath,
            bucket_name: bucket,
            public_url: publicUrl,
            file_type: 'image',
            mime_type: uploadFile.file.type,
            file_size: uploadFile.file.size,
            width,
            height,
            uploaded_by: user?.id,
            title: title || uploadFile.file.name.replace(/\.[^.]+$/, ''),
            description: description || null,
            location: location || null,
            tags: defaultTags,
            metadata: {
              upload_source: 'report-readiness-add-photos',
              fiscal_year: fy,
            },
            tenant_id: '9c4e5de2-d80a-4e0b-8a89-1bbf09485532'
          })

        if (dbError) throw dbError

        setFiles(prev => prev.map((f, idx) =>
          idx === fileIndex ? { ...f, status: 'success' as const, progress: 100 } : f
        ))
        setUploadedCount(prev => prev + 1)

      } catch (error: any) {
        setFiles(prev => prev.map((f, idx) =>
          idx === fileIndex ? { ...f, status: 'error' as const, error: error.message } : f
        ))
      }
    }

    setUploading(false)
  }

  const getImageDimensions = (file: File): Promise<{ width: number; height: number }> => {
    return new Promise((resolve) => {
      const img = new window.Image()
      img.onload = () => resolve({ width: img.width, height: img.height })
      img.src = URL.createObjectURL(file)
    })
  }

  const formatFileSize = (bytes: number): string => {
    if (bytes === 0) return '0 Bytes'
    const k = 1024
    const sizes = ['Bytes', 'KB', 'MB', 'GB']
    const i = Math.floor(Math.log(bytes) / Math.log(k))
    return Math.round(bytes / Math.pow(k, i) * 100) / 100 + ' ' + sizes[i]
  }

  const successCount = files.filter(f => f.status === 'success').length
  const pendingCount = files.filter(f => f.status === 'pending').length

  return (
    <div className="p-8 max-w-4xl mx-auto">
      {/* Header */}
      <div className="mb-8">
        <Link
          href="/picc/report-readiness"
          className="inline-flex items-center gap-2 text-picc-red hover:text-picc-red/80 mb-4"
        >
          <ArrowLeft className="w-4 h-4" />
          Back to Report Readiness
        </Link>

        <div className="flex items-center gap-3 mb-2">
          <Image className="w-8 h-8 text-picc-red" />
          <h1 className="text-3xl font-bold text-gray-900">Add Report Photos</h1>
        </div>
        <p className="text-gray-600">
          Add photos from <strong>FY {fiscalYearDisplay(fy)}</strong> to include in your annual report. Great photos make the report special!
        </p>

        {/* Tips */}
        <div className="mt-3 p-3 bg-blue-50 border border-blue-100 rounded-lg">
          <p className="text-sm text-blue-800">
            <strong>💡 Good photos to include:</strong> Community events, programs in action, happy faces, celebrations, facilities. Make sure you have permission to share photos of people.
          </p>
        </div>

        {/* Tags preview */}
        <div className="mt-3 flex gap-2">
          {defaultTags.map(tag => (
            <span key={tag} className="text-xs bg-blue-100 text-blue-700 px-2 py-1 rounded">
              {tag}
            </span>
          ))}
        </div>
      </div>

      <div className="space-y-6">
        {/* Details */}
        <div className="bg-white rounded-lg border border-gray-200 p-6">
          <h2 className="text-lg font-bold text-gray-900 mb-4">About these photos</h2>
          <div className="grid gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                What's in these photos? <span className="text-gray-400">(optional title)</span>
              </label>
              <input
                type="text"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-picc-red/20 focus:border-picc-red text-sm"
                placeholder="e.g., NAIDOC Week Celebration"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                What's happening? <span className="text-gray-400">(describe the event)</span>
              </label>
              <textarea
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-picc-red/20 focus:border-picc-red text-sm"
                placeholder="e.g., Community members gathered to celebrate NAIDOC Week..."
                rows={2}
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Where was this? <span className="text-gray-400">(location)</span>
              </label>
              <input
                type="text"
                value={location}
                onChange={(e) => setLocation(e.target.value)}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-picc-red/20 focus:border-picc-red text-sm"
                placeholder="e.g., Palm Island Community Centre"
              />
            </div>
          </div>
        </div>

        {/* Upload Area */}
        <div className="bg-white rounded-lg border border-gray-200 p-6">
          <h2 className="text-lg font-bold text-gray-900 mb-4">Choose your photos</h2>
          <label
            className="cursor-pointer block"
            onDragOver={e => e.preventDefault()}
            onDrop={handleDrop}
          >
            <div className="border-2 border-dashed border-gray-300 rounded-lg p-12 text-center hover:border-picc-red hover:bg-warm-50 transition-colors">
              <UploadIcon className="w-12 h-12 text-gray-400 mx-auto mb-4" />
              <p className="text-gray-700 font-medium mb-1">📷 Click to choose photos from your device</p>
              <p className="text-sm text-gray-500">Or drag and drop files here • You can select multiple photos</p>
            </div>
            <input
              type="file"
              multiple
              accept="image/*"
              onChange={handleFileSelect}
              className="hidden"
            />
          </label>
        </div>

        {/* File List */}
        {files.length > 0 && (
          <div className="bg-white rounded-lg border border-gray-200 p-6">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-lg font-bold text-gray-900">Files ({files.length})</h2>
              {!uploading && (
                <button onClick={() => setFiles([])} className="text-xs text-gray-400 hover:text-red-500">
                  Clear all
                </button>
              )}
            </div>

            {successCount > 0 && !uploading && (
              <div className="mb-4 p-3 bg-green-50 border border-green-200 rounded-lg">
                <p className="text-sm font-medium text-green-700">
                  {successCount} photo{successCount > 1 ? 's' : ''} uploaded successfully!
                </p>
              </div>
            )}

            <div className="space-y-2 max-h-[300px] overflow-y-auto">
              {files.map((uploadFile, index) => (
                <div
                  key={index}
                  className={`border rounded-lg p-3 flex items-center gap-3 ${
                    uploadFile.status === 'success' ? 'border-green-300 bg-green-50' :
                    uploadFile.status === 'error' ? 'border-red-300 bg-red-50' :
                    uploadFile.status === 'uploading' ? 'border-picc-red/30 bg-warm-50' :
                    'border-gray-200'
                  }`}
                >
                  {uploadFile.preview ? (
                    <img src={uploadFile.preview} alt="" className="w-12 h-12 object-cover rounded" />
                  ) : (
                    <div className="w-12 h-12 bg-gray-100 rounded flex items-center justify-center">
                      <Image className="w-6 h-6 text-gray-400" />
                    </div>
                  )}
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium text-gray-900 truncate">{uploadFile.file.name}</p>
                    <p className="text-xs text-gray-500">{formatFileSize(uploadFile.file.size)}</p>
                  </div>
                  <div className="flex-shrink-0">
                    {uploadFile.status === 'success' && <Check className="w-5 h-5 text-green-600" />}
                    {uploadFile.status === 'error' && <AlertCircle className="w-5 h-5 text-red-600" />}
                    {uploadFile.status === 'pending' && (
                      <button onClick={() => removeFile(index)} className="text-gray-400 hover:text-red-600">
                        <X className="w-5 h-5" />
                      </button>
                    )}
                  </div>
                </div>
              ))}
            </div>

            {pendingCount > 0 && (
              <button
                onClick={uploadFiles}
                disabled={uploading}
                className="w-full mt-4 px-6 py-3 bg-picc-red text-white rounded-lg hover:bg-picc-red/90 disabled:opacity-50 disabled:cursor-not-allowed transition-colors font-medium"
              >
                {uploading ? `Uploading...` : `Upload ${pendingCount} Photo${pendingCount > 1 ? 's' : ''}`}
              </button>
            )}

            {successCount > 0 && pendingCount === 0 && (
              <Link
                href="/picc/report-readiness"
                className="block w-full mt-3 text-center text-sm text-picc-red hover:underline"
              >
                ← Back to Report Readiness
              </Link>
            )}
          </div>
        )}
      </div>
    </div>
  )
}

function fiscalYearDisplay(fy: string): string {
  const parts = fy.split('-')
  if (parts.length === 2) {
    return `${parts[0]}-${parts[1]}`
  }
  return fy
}
