'use client'

import { useState } from 'react'
import { StoryImageUpload } from '@/components/StoryImageUpload'
import { PhotoGallery, GalleryImage } from '@/components/PhotoGallery'
import { createClient } from '@/lib/supabase/client'
import { useEffect } from 'react'

// PICC Stories ready for photos
const PICC_STORIES = [
  {
    id: '497b714d-39b7-4a44-8cd9-44e459cbb6e2',
    title: 'Building Youth Leadership on Palm Island',
    storyteller: 'Roy Prior',
    service: 'youth-services',
    serviceName: 'Youth Services'
  },
  {
    id: '3be1ca08-998a-4642-a846-8dbf095b39b9',
    title: 'Keeping Language and Culture Strong',
    storyteller: 'Uncle Frank Daniel Landers',
    service: 'cultural-centre',
    serviceName: 'Cultural Centre'
  },
  {
    id: '18921fc1-a5b9-4aba-9e54-74b4207efd66',
    title: 'Caring for Our Elders with Respect',
    storyteller: 'Uncle Alan Palm Island',
    service: 'elder-support',
    serviceName: 'Elder Support Services'
  },
  {
    id: '33b147b9-392f-4f4e-8b33-ae2a4d524b80',
    title: "Women's Healing and Empowerment",
    storyteller: 'Ruby Sibley',
    service: 'womens-services',
    serviceName: "Women's Services"
  },
  {
    id: '3c215579-9800-48ea-8bec-e9fd8886e6a7',
    title: 'Strengthening Families Through Culture',
    storyteller: 'Ferdys staff',
    service: 'family-wellbeing',
    serviceName: 'Family Wellbeing Centre'
  },
  {
    id: '6164a188-8bb9-47c1-b611-a152ffce9cb3',
    title: 'Healing Body and Spirit Together',
    storyteller: 'Goonyun Anderson',
    service: 'bwgcolman-healing',
    serviceName: 'Bwgcolman Healing Service'
  }
]

export default function UploadPhotosDemo() {
  const [selectedStory, setSelectedStory] = useState(PICC_STORIES[0])
  const [uploadedImages, setUploadedImages] = useState<GalleryImage[]>([])
  const [loading, setLoading] = useState(false)
  const supabase = createClient()

  // Load existing images when story changes
  useEffect(() => {
    loadStoryImages()
  }, [selectedStory.id])

  const loadStoryImages = async () => {
    setLoading(true)
    try {
      const { data, error } = await supabase
        .from('story_images')
        .select('*')
        .eq('story_id', selectedStory.id)
        .order('display_order')

      if (error) throw error

      const images: GalleryImage[] =
        data?.map(img => ({
          id: img.id,
          url: img.public_url,
          alt: img.alt_text || undefined,
          caption: img.caption || undefined,
          photographer: img.photographer_name || undefined,
          location: img.photo_location || undefined,
          date: img.photo_date || undefined
        })) || []

      setUploadedImages(images)
    } catch (error) {
      console.error('Error loading images:', error)
    } finally {
      setLoading(false)
    }
  }

  const handleUploadComplete = (imageUrl: string, imageId: string) => {
    console.log('✅ Image uploaded!', { imageUrl, imageId })
    // Reload images to show the new one
    loadStoryImages()
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white shadow">
        <div className="mx-auto max-w-7xl px-4 py-6 sm:px-6 lg:px-8">
          <h1 className="text-3xl font-bold text-gray-900">
            📸 PICC Story Photo Upload Demo
          </h1>
          <p className="mt-2 text-sm text-gray-600">
            Upload photos to PICC stories for the 2024 Annual Report
          </p>
        </div>
      </div>

      <div className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8">
        {/* Story Selector */}
        <div className="mb-8 rounded-lg bg-white p-6 shadow">
          <label className="block text-sm font-medium text-gray-700 mb-3">
            Select a Story:
          </label>
          <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
            {PICC_STORIES.map(story => (
              <button
                key={story.id}
                onClick={() => setSelectedStory(story)}
                className={`rounded-lg border-2 p-4 text-left transition-all ${
                  selectedStory.id === story.id
                    ? 'border-blue-500 bg-blue-50'
                    : 'border-gray-200 hover:border-gray-300 hover:bg-gray-50'
                }`}
              >
                <div className="font-medium text-gray-900">{story.title}</div>
                <div className="mt-1 text-sm text-gray-600">{story.storyteller}</div>
                <div className="mt-1 text-xs text-gray-500">{story.serviceName}</div>
              </button>
            ))}
          </div>
        </div>

        {/* Current Story Info */}
        <div className="mb-8 rounded-lg bg-gradient-to-r from-blue-500 to-blue-600 p-6 text-white shadow-lg">
          <h2 className="text-2xl font-bold mb-2">{selectedStory.title}</h2>
          <div className="flex items-center gap-4 text-sm">
            <span>👤 {selectedStory.storyteller}</span>
            <span>•</span>
            <span>🏢 {selectedStory.serviceName}</span>
            <span>•</span>
            <span>📸 {uploadedImages.length} photos</span>
          </div>
        </div>

        {/* Upload Section */}
        <div className="mb-8 rounded-lg bg-white p-6 shadow">
          <h3 className="mb-4 text-lg font-semibold text-gray-900">Upload Photos</h3>
          <StoryImageUpload
            storyId={selectedStory.id}
            organizationSlug="picc"
            serviceSlug={selectedStory.service}
            onUploadComplete={handleUploadComplete}
            maxFiles={10}
          />
        </div>

        {/* Gallery Section */}
        {uploadedImages.length > 0 && (
          <div className="rounded-lg bg-white p-6 shadow">
            <div className="mb-4 flex items-center justify-between">
              <h3 className="text-lg font-semibold text-gray-900">
                Photo Gallery ({uploadedImages.length})
              </h3>
              <button
                onClick={loadStoryImages}
                className="rounded-lg bg-gray-100 px-4 py-2 text-sm font-medium text-gray-700 hover:bg-gray-200"
              >
                🔄 Refresh
              </button>
            </div>
            <PhotoGallery images={uploadedImages} columns={3} gap={4} />
          </div>
        )}

        {loading && (
          <div className="rounded-lg bg-white p-12 text-center shadow">
            <div className="text-gray-500">Loading images...</div>
          </div>
        )}

        {!loading && uploadedImages.length === 0 && (
          <div className="rounded-lg bg-white p-12 text-center shadow">
            <div className="text-gray-400">
              No photos uploaded yet. Drag and drop some images above!
            </div>
          </div>
        )}

        {/* Instructions */}
        <div className="mt-8 rounded-lg bg-blue-50 p-6">
          <h4 className="mb-3 font-semibold text-blue-900">📝 How to Use:</h4>
          <ol className="space-y-2 text-sm text-blue-800">
            <li>
              <strong>1.</strong> Select a story from the grid above
            </li>
            <li>
              <strong>2.</strong> Drag and drop images or click to browse
            </li>
            <li>
              <strong>3.</strong> Images automatically upload to Supabase Storage
            </li>
            <li>
              <strong>4.</strong> Metadata is saved to the database
            </li>
            <li>
              <strong>5.</strong> View uploaded photos in the gallery below
            </li>
            <li>
              <strong>6.</strong> Click any image to view full-screen lightbox
            </li>
          </ol>
        </div>

        {/* Database Info */}
        <div className="mt-4 rounded-lg bg-gray-100 p-6">
          <h4 className="mb-3 font-semibold text-gray-900">🗄️ Database Structure:</h4>
          <div className="space-y-2 font-mono text-xs text-gray-700">
            <div>
              <strong>Storage:</strong> story-images/picc/{selectedStory.service}/
            </div>
            <div>
              <strong>Table:</strong> story_images (story_id, public_url, caption, etc.)
            </div>
            <div>
              <strong>Story ID:</strong> {selectedStory.id}
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
