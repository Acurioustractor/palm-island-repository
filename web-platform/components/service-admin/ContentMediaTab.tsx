'use client'

import { useEffect, useState } from 'react'
import Link from 'next/link'
import {
  Camera, Film, FileText, Loader2, Plus, Image as ImageIcon, ExternalLink, X, Link2
} from 'lucide-react'
import MediaPickerDialog from '@/components/admin/MediaPickerDialog'
import type { ServiceData } from './ServiceAdminDetail'

type MediaFile = {
  id: string
  public_url: string
  title?: string | null
  caption?: string | null
  tags?: string[] | null
  file_type: string
  created_at?: string | null
}

type Story = {
  id: string
  title: string
  slug?: string | null
  status?: string | null
  featured_image_url?: string | null
  created_at?: string | null
}

type Props = {
  service: ServiceData
}

export default function ContentMediaTab({ service }: Props) {
  const serviceTag = `service:${service.slug}`

  // Photos
  const [photos, setPhotos] = useState<MediaFile[]>([])
  const [photosLoading, setPhotosLoading] = useState(true)
  const [photoPickerOpen, setPhotoPickerOpen] = useState(false)
  const [addingPhoto, setAddingPhoto] = useState(false)

  // Videos
  const [videos, setVideos] = useState<MediaFile[]>([])
  const [videosLoading, setVideosLoading] = useState(true)

  // Stories
  const [stories, setStories] = useState<Story[]>([])
  const [storiesLoading, setStoriesLoading] = useState(true)

  // Removing photos
  const [removingPhotoId, setRemovingPhotoId] = useState<string | null>(null)

  // Video picker
  const [videoPickerOpen, setVideoPickerOpen] = useState(false)
  const [addingVideo, setAddingVideo] = useState(false)

  // Video link form
  const [videoLinkFormOpen, setVideoLinkFormOpen] = useState(false)
  const [videoLinkUrl, setVideoLinkUrl] = useState('')
  const [videoLinkTitle, setVideoLinkTitle] = useState('')
  const [videoLinkSubmitting, setVideoLinkSubmitting] = useState(false)

  // Story linker
  const [allStories, setAllStories] = useState<Story[]>([])
  const [storySearchOpen, setStorySearchOpen] = useState(false)
  const [storySearch, setStorySearch] = useState('')
  const [linkingStoryId, setLinkingStoryId] = useState<string | null>(null)
  const [unlinkingStoryId, setUnlinkingStoryId] = useState<string | null>(null)

  // Cover photo
  const [coverPhoto, setCoverPhoto] = useState<MediaFile | null>(null)
  const [coverPickerOpen, setCoverPickerOpen] = useState(false)
  const [settingCover, setSettingCover] = useState(false)

  useEffect(() => {
    loadPhotos()
    loadVideos()
    loadStories()
    loadCover()
  }, [service.slug])

  const loadPhotos = async () => {
    setPhotosLoading(true)
    try {
      const res = await fetch(`/api/media/list?limit=50&fileType=image&tags=${encodeURIComponent(serviceTag)}`)
      if (res.ok) {
        const data = await res.json()
        setPhotos(data.data || [])
      }
    } catch {}
    setPhotosLoading(false)
  }

  const loadVideos = async () => {
    setVideosLoading(true)
    try {
      const res = await fetch(`/api/media/list?limit=20&fileType=video&tags=${encodeURIComponent(serviceTag)}`)
      if (res.ok) {
        const data = await res.json()
        setVideos(data.data || [])
      }
    } catch {}
    setVideosLoading(false)
  }

  const loadStories = async () => {
    setStoriesLoading(true)
    try {
      // Stories may be linked by tags containing the service slug
      const res = await fetch(`/api/stories?limit=100`)
      if (res.ok) {
        const data = await res.json()
        const allStories = data.data || data.stories || []
        // Filter to stories that have this service's tag or slug in tags
        const filtered = allStories.filter((s: any) => {
          const tags = Array.isArray(s.tags) ? s.tags : []
          return tags.includes(serviceTag) || tags.includes(service.slug)
        })
        setStories(filtered)
      }
    } catch {}
    setStoriesLoading(false)
  }

  const loadCover = async () => {
    try {
      const heroTags = `${serviceTag},hero`
      const res = await fetch(`/api/media/list?limit=1&fileType=image&tags=${encodeURIComponent(heroTags)}`)
      if (res.ok) {
        const data = await res.json()
        setCoverPhoto(data.data?.[0] || null)
      }
    } catch {}
  }

  const handleAddPhoto = async (media: any) => {
    setAddingPhoto(true)
    setPhotoPickerOpen(false)
    try {
      await fetch('/api/media/bulk', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ mediaIds: [media.id], addTags: [serviceTag] }),
      })
      await loadPhotos()
    } catch (err) {
      console.error('Failed to add photo:', err)
    }
    setAddingPhoto(false)
  }

  const handleAddMultiplePhotos = async (mediaList: any[]) => {
    setAddingPhoto(true)
    setPhotoPickerOpen(false)
    try {
      const mediaIds = mediaList.map((m: any) => m.id)
      await fetch('/api/media/bulk', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ mediaIds, addTags: [serviceTag] }),
      })
      await loadPhotos()
    } catch (err) {
      console.error('Failed to add photos:', err)
    }
    setAddingPhoto(false)
  }

  const handleRemovePhoto = async (photoId: string) => {
    setRemovingPhotoId(photoId)
    try {
      await fetch('/api/media/bulk', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ mediaIds: [photoId], removeTags: [serviceTag] }),
      })
      setPhotos(prev => prev.filter(p => p.id !== photoId))
    } catch (err) {
      console.error('Failed to remove photo:', err)
    }
    setRemovingPhotoId(null)
  }

  const handleAddVideoLink = async () => {
    if (!videoLinkUrl.trim()) return
    setVideoLinkSubmitting(true)
    try {
      const res = await fetch('/api/media/add-link', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          url: videoLinkUrl.trim(),
          title: videoLinkTitle.trim() || undefined,
          service_slug: service.slug,
        }),
      })
      if (res.ok) {
        setVideoLinkUrl('')
        setVideoLinkTitle('')
        setVideoLinkFormOpen(false)
        await loadVideos()
      }
    } catch (err) {
      console.error('Failed to add video link:', err)
    }
    setVideoLinkSubmitting(false)
  }

  const handleAddVideo = async (media: any) => {
    setAddingVideo(true)
    setVideoPickerOpen(false)
    try {
      await fetch('/api/media/bulk', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ mediaIds: [media.id], addTags: [serviceTag] }),
      })
      await loadVideos()
    } catch (err) {
      console.error('Failed to add video:', err)
    }
    setAddingVideo(false)
  }

  const loadAllStories = async () => {
    try {
      const res = await fetch('/api/stories?limit=200')
      if (res.ok) {
        const data = await res.json()
        setAllStories(data.data || data.stories || [])
      }
    } catch {}
  }

  const handleLinkStory = async (story: Story & { tags?: string[] }) => {
    setLinkingStoryId(story.id)
    try {
      const currentTags = Array.isArray(story.tags) ? story.tags : []
      const newTags = Array.from(new Set([...currentTags, serviceTag]))
      await fetch('/api/stories', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ id: story.id, tags: newTags }),
      })
      await loadStories()
    } catch (err) {
      console.error('Failed to link story:', err)
    }
    setLinkingStoryId(null)
    setStorySearchOpen(false)
    setStorySearch('')
  }

  const handleUnlinkStory = async (story: Story) => {
    setUnlinkingStoryId(story.id)
    try {
      // Re-fetch the story to get current tags
      const allRes = await fetch('/api/stories?limit=200')
      if (allRes.ok) {
        const allData = await allRes.json()
        const fullStory = (allData.data || allData.stories || []).find((s: any) => s.id === story.id)
        const currentTags: string[] = Array.isArray(fullStory?.tags) ? fullStory.tags : []
        const newTags = currentTags.filter(t => t !== serviceTag && t !== service.slug)
        await fetch('/api/stories', {
          method: 'PATCH',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ id: story.id, tags: newTags }),
        })
      }
      await loadStories()
    } catch (err) {
      console.error('Failed to unlink story:', err)
    }
    setUnlinkingStoryId(null)
  }

  const handleSetCover = async (media: any) => {
    setSettingCover(true)
    setCoverPickerOpen(false)
    try {
      // Remove existing hero
      if (coverPhoto) {
        await fetch('/api/media/bulk', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ mediaIds: [coverPhoto.id], removeTags: ['hero'] }),
        })
      }
      // Add service + hero tags
      await fetch('/api/media/bulk', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ mediaIds: [media.id], addTags: [serviceTag, 'hero'] }),
      })
      setCoverPhoto({ ...media, tags: [...(media.tags || []), serviceTag, 'hero'] })
    } catch (err) {
      console.error('Failed to set cover:', err)
    }
    setSettingCover(false)
  }

  return (
    <div className="space-y-6">
      {/* Cover Photo Section */}
      <div className="bg-white rounded-xl border border-gray-200 p-5">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-sm font-semibold text-gray-500 uppercase tracking-wider">Cover Photo</h2>
          <button
            onClick={() => setCoverPickerOpen(true)}
            disabled={settingCover}
            className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium text-picc-red bg-picc-red/10 rounded-full hover:bg-picc-red/20 transition-colors disabled:opacity-50"
          >
            {settingCover ? (
              <><Loader2 className="w-3 h-3 animate-spin" /> Setting...</>
            ) : (
              <><Camera className="w-3 h-3" /> {coverPhoto ? 'Change' : 'Set Cover'}</>
            )}
          </button>
        </div>
        {coverPhoto ? (
          <div className="aspect-[16/7] rounded-lg overflow-hidden bg-gray-100">
            <img src={coverPhoto.public_url} alt="Cover" className="w-full h-full object-cover" />
          </div>
        ) : (
          <div className="aspect-[16/7] rounded-lg bg-gray-50 flex items-center justify-center border-2 border-dashed border-gray-200">
            <div className="text-center text-gray-400">
              <ImageIcon className="w-8 h-8 mx-auto mb-1" />
              <p className="text-sm">No cover photo set</p>
            </div>
          </div>
        )}
      </div>

      {/* Photo Gallery */}
      <div className="bg-white rounded-xl border border-gray-200 p-5">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-sm font-semibold text-gray-500 uppercase tracking-wider">
            Photos <span className="text-gray-400 font-normal">({photos.length})</span>
          </h2>
          <button
            onClick={() => setPhotoPickerOpen(true)}
            disabled={addingPhoto}
            className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium text-white bg-picc-red rounded-full hover:bg-picc-red/90 transition-colors disabled:opacity-50"
          >
            {addingPhoto ? (
              <><Loader2 className="w-3 h-3 animate-spin" /> Adding...</>
            ) : (
              <><Plus className="w-3 h-3" /> Add Photos</>
            )}
          </button>
        </div>

        {photosLoading ? (
          <div className="flex items-center justify-center py-8">
            <Loader2 className="w-5 h-5 animate-spin text-gray-300" />
          </div>
        ) : photos.length === 0 ? (
          <div className="text-center py-8 text-gray-400">
            <Camera className="w-8 h-8 mx-auto mb-2 text-gray-300" />
            <p className="text-sm">No photos tagged with <code className="bg-gray-100 px-1 rounded">{serviceTag}</code></p>
          </div>
        ) : (
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-2">
            {photos.map(photo => (
              <div key={photo.id} className="aspect-square rounded-lg overflow-hidden bg-gray-100 relative group">
                <img
                  src={photo.public_url}
                  alt={photo.title || photo.caption || ''}
                  className="w-full h-full object-cover"
                  loading="lazy"
                />
                {photo.tags?.includes('hero') && (
                  <div className="absolute top-1 left-1 px-1.5 py-0.5 bg-picc-red text-white text-[10px] font-medium rounded">
                    Cover
                  </div>
                )}
                <button
                  onClick={() => handleRemovePhoto(photo.id)}
                  disabled={removingPhotoId === photo.id}
                  className="absolute top-1 right-1 w-6 h-6 bg-black/60 hover:bg-red-600 text-white rounded-full flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity disabled:opacity-50"
                  title="Remove from service"
                >
                  {removingPhotoId === photo.id ? (
                    <Loader2 className="w-3 h-3 animate-spin" />
                  ) : (
                    <X className="w-3 h-3" />
                  )}
                </button>
              </div>
            ))}
          </div>
        )}

        <div className="mt-3 text-center">
          <Link
            href={`/picc/media/gallery?serviceFilter=${service.slug}`}
            className="inline-flex items-center gap-1.5 text-xs text-picc-red hover:underline"
          >
            <ExternalLink className="w-3 h-3" />
            Manage all in Media Gallery
          </Link>
        </div>
      </div>

      {/* Videos */}
      <div className="bg-white rounded-xl border border-gray-200 p-5">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-sm font-semibold text-gray-500 uppercase tracking-wider">
            Videos <span className="text-gray-400 font-normal">({videos.length})</span>
          </h2>
          <div className="flex items-center gap-2">
            <button
              onClick={() => setVideoLinkFormOpen(!videoLinkFormOpen)}
              className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium text-picc-red bg-picc-red/10 rounded-full hover:bg-picc-red/20 transition-colors"
            >
              <Link2 className="w-3 h-3" /> Add Link
            </button>
            <button
              onClick={() => setVideoPickerOpen(true)}
              disabled={addingVideo}
              className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium text-white bg-picc-red rounded-full hover:bg-picc-red/90 transition-colors disabled:opacity-50"
            >
              {addingVideo ? (
                <><Loader2 className="w-3 h-3 animate-spin" /> Adding...</>
              ) : (
                <><Plus className="w-3 h-3" /> Add Video</>
              )}
            </button>
          </div>
        </div>

        {videoLinkFormOpen && (
          <div className="mb-4 p-4 bg-gray-50 rounded-lg border border-gray-200 space-y-3">
            <div>
              <label className="block text-xs font-medium text-gray-600 mb-1">Video URL *</label>
              <input
                type="url"
                value={videoLinkUrl}
                onChange={e => setVideoLinkUrl(e.target.value)}
                className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-picc-red/20 focus:border-picc-red"
                placeholder="https://youtube.com/watch?v=..."
                autoFocus
              />
            </div>
            <div>
              <label className="block text-xs font-medium text-gray-600 mb-1">Title</label>
              <input
                type="text"
                value={videoLinkTitle}
                onChange={e => setVideoLinkTitle(e.target.value)}
                className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-picc-red/20 focus:border-picc-red"
                placeholder="Video title"
              />
            </div>
            <div className="flex items-center gap-2">
              <button
                onClick={handleAddVideoLink}
                disabled={videoLinkSubmitting || !videoLinkUrl.trim()}
                className="px-4 py-2 bg-picc-red text-white text-xs font-medium rounded-lg hover:bg-picc-red/90 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
              >
                {videoLinkSubmitting ? 'Adding...' : 'Add Link'}
              </button>
              <button
                onClick={() => { setVideoLinkFormOpen(false); setVideoLinkUrl(''); setVideoLinkTitle('') }}
                className="px-4 py-2 text-gray-500 text-xs font-medium rounded-lg hover:bg-gray-100 transition-colors"
              >
                Cancel
              </button>
            </div>
          </div>
        )}

        {videosLoading ? (
          <div className="flex items-center justify-center py-8">
            <Loader2 className="w-5 h-5 animate-spin text-gray-300" />
          </div>
        ) : videos.length === 0 ? (
          <div className="text-center py-6 text-gray-400">
            <Film className="w-8 h-8 mx-auto mb-2 text-gray-300" />
            <p className="text-sm">No videos tagged with this service</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            {videos.map(video => (
              <div key={video.id} className="border border-gray-200 rounded-lg p-3">
                <div className="flex items-center gap-2">
                  <Film className="w-4 h-4 text-gray-400 flex-shrink-0" />
                  <span className="text-sm text-gray-700 truncate">{video.title || 'Untitled video'}</span>
                </div>
                {video.public_url && (
                  <a
                    href={video.public_url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="mt-1 text-xs text-picc-red hover:underline truncate block"
                  >
                    {video.public_url}
                  </a>
                )}
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Linked Stories */}
      <div className="bg-white rounded-xl border border-gray-200 p-5">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-sm font-semibold text-gray-500 uppercase tracking-wider">
            Linked Stories <span className="text-gray-400 font-normal">({stories.length})</span>
          </h2>
          <button
            onClick={() => { setStorySearchOpen(true); loadAllStories() }}
            className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium text-white bg-picc-red rounded-full hover:bg-picc-red/90 transition-colors"
          >
            <Link2 className="w-3 h-3" />
            Link Story
          </button>
        </div>

        {storiesLoading ? (
          <div className="flex items-center justify-center py-8">
            <Loader2 className="w-5 h-5 animate-spin text-gray-300" />
          </div>
        ) : stories.length === 0 ? (
          <div className="text-center py-6 text-gray-400">
            <FileText className="w-8 h-8 mx-auto mb-2 text-gray-300" />
            <p className="text-sm">No stories linked to this service</p>
          </div>
        ) : (
          <div className="space-y-2">
            {stories.map(story => (
              <div key={story.id} className="flex items-center gap-3 p-3 border border-gray-100 rounded-lg hover:bg-gray-50 transition-colors group">
                {story.featured_image_url ? (
                  <img
                    src={story.featured_image_url}
                    alt=""
                    className="w-12 h-12 rounded-lg object-cover flex-shrink-0"
                  />
                ) : (
                  <div className="w-12 h-12 rounded-lg bg-gray-100 flex items-center justify-center flex-shrink-0">
                    <FileText className="w-5 h-5 text-gray-300" />
                  </div>
                )}
                <div className="flex-1 min-w-0">
                  <div className="text-sm font-medium text-gray-900 truncate">{story.title}</div>
                  {story.status && (
                    <span className={`inline-flex mt-0.5 px-1.5 py-0.5 text-[10px] font-medium rounded-full ${
                      story.status === 'published' ? 'bg-green-100 text-green-700' :
                      story.status === 'draft' ? 'bg-yellow-100 text-yellow-700' :
                      'bg-gray-100 text-gray-500'
                    }`}>
                      {story.status}
                    </span>
                  )}
                </div>
                <button
                  onClick={() => handleUnlinkStory(story)}
                  disabled={unlinkingStoryId === story.id}
                  className="flex-shrink-0 w-7 h-7 flex items-center justify-center rounded-full text-gray-400 hover:bg-red-50 hover:text-red-500 opacity-0 group-hover:opacity-100 transition-all disabled:opacity-50"
                  title="Unlink from service"
                >
                  {unlinkingStoryId === story.id ? (
                    <Loader2 className="w-3.5 h-3.5 animate-spin" />
                  ) : (
                    <X className="w-3.5 h-3.5" />
                  )}
                </button>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Story Search Modal */}
      {storySearchOpen && (
        <div className="fixed inset-0 z-50 bg-black/50 flex items-center justify-center p-4" onClick={() => setStorySearchOpen(false)}>
          <div className="bg-white rounded-2xl w-full max-w-lg shadow-xl border border-gray-200 overflow-hidden" onClick={e => e.stopPropagation()}>
            <div className="p-4 border-b border-gray-200 flex items-center justify-between">
              <h3 className="font-semibold text-gray-900">Link a Story</h3>
              <button onClick={() => setStorySearchOpen(false)} className="p-1 text-gray-400 hover:text-gray-600">
                <X className="w-5 h-5" />
              </button>
            </div>
            <div className="p-4">
              <input
                type="text"
                placeholder="Search stories..."
                value={storySearch}
                onChange={e => setStorySearch(e.target.value)}
                autoFocus
                className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-picc-red/20 focus:border-picc-red"
              />
            </div>
            <div className="max-h-80 overflow-y-auto px-4 pb-4">
              {allStories.length === 0 ? (
                <div className="text-center py-6 text-sm text-gray-400">
                  <Loader2 className="w-5 h-5 animate-spin mx-auto mb-2" />
                  Loading stories...
                </div>
              ) : (
                (() => {
                  const linkedIds = new Set(stories.map(s => s.id))
                  const q = storySearch.toLowerCase()
                  const filtered = allStories.filter(s =>
                    !linkedIds.has(s.id) && (!q || s.title.toLowerCase().includes(q))
                  )
                  if (filtered.length === 0) return (
                    <div className="text-center py-6 text-sm text-gray-400">No matching stories</div>
                  )
                  return filtered.map(story => (
                    <button
                      key={story.id}
                      onClick={() => handleLinkStory(story as any)}
                      disabled={linkingStoryId === story.id}
                      className="w-full flex items-center gap-3 p-3 rounded-lg hover:bg-gray-50 transition-colors text-left disabled:opacity-50 mb-1"
                    >
                      {story.featured_image_url ? (
                        <img src={story.featured_image_url} alt="" className="w-10 h-10 rounded-lg object-cover flex-shrink-0" />
                      ) : (
                        <div className="w-10 h-10 rounded-lg bg-gray-100 flex items-center justify-center flex-shrink-0">
                          <FileText className="w-4 h-4 text-gray-300" />
                        </div>
                      )}
                      <div className="flex-1 min-w-0">
                        <div className="text-sm font-medium text-gray-800 truncate">{story.title}</div>
                        {story.status && (
                          <span className="text-[10px] text-gray-400">{story.status}</span>
                        )}
                      </div>
                      {linkingStoryId === story.id ? (
                        <Loader2 className="w-4 h-4 animate-spin text-gray-400 flex-shrink-0" />
                      ) : (
                        <Plus className="w-4 h-4 text-picc-red flex-shrink-0" />
                      )}
                    </button>
                  ))
                })()
              )}
            </div>
          </div>
        </div>
      )}

      {/* Media Pickers */}
      <MediaPickerDialog
        open={photoPickerOpen}
        kind="image"
        onClose={() => setPhotoPickerOpen(false)}
        onPick={handleAddPhoto}
        onPickMultiple={handleAddMultiplePhotos}
        multiSelect
        initialQuery={service.name}
      />
      <MediaPickerDialog
        open={coverPickerOpen}
        kind="image"
        onClose={() => setCoverPickerOpen(false)}
        onPick={handleSetCover}
        initialQuery={service.name}
      />
      <MediaPickerDialog
        open={videoPickerOpen}
        kind="video"
        onClose={() => setVideoPickerOpen(false)}
        onPick={handleAddVideo}
        initialQuery={service.name}
      />
    </div>
  )
}
