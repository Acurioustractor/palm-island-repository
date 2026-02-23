'use client'

import { useCallback, useEffect, useState } from 'react'
import Link from 'next/link'
import {
  ArrowLeft, Camera, Check, ExternalLink, Image as ImageIcon,
  Loader2, Save, Lightbulb, Film, FileText, Plus, X, Link2, Download
} from 'lucide-react'
import MediaPickerDialog from '@/components/admin/MediaPickerDialog'
import LocationMapPicker from './LocationMapPicker'
import ProjectConversationsTab from './ProjectConversationsTab'

export type ProjectData = {
  id: string
  name: string
  slug: string
  tagline: string | null
  description: string | null
  status: string
  project_type: string | null
  start_date: string | null
  target_completion_date: string | null
  actual_completion_date: string | null
  hero_image_url: string | null
  is_public: boolean
  featured: boolean
  impact_areas: string[] | null
  target_beneficiaries: number | null
  actual_beneficiaries: number | null
  budget_total: number | null
  budget_spent: number | null
  funding_sources: string[] | null
  team_members: string[] | null
  project_lead: string | null
  gallery_images: string[] | null
  metadata: Record<string, any> | null
  created_at: string
  updated_at: string
}

const STATUS_OPTIONS = [
  { value: 'planning', label: 'Planning' },
  { value: 'in_progress', label: 'Active' },
  { value: 'completed', label: 'Completed' },
]

const statusColors: Record<string, { bg: string; text: string; label: string }> = {
  active: { bg: 'bg-green-100', text: 'text-green-800', label: 'Active' },
  in_progress: { bg: 'bg-green-100', text: 'text-green-800', label: 'Active' },
  planning: { bg: 'bg-amber-100', text: 'text-amber-800', label: 'Planning' },
  completed: { bg: 'bg-blue-100', text: 'text-blue-800', label: 'Completed' },
}

const TABS = [
  { key: 'overview', label: 'Overview' },
  { key: 'content', label: 'Content & Media' },
  { key: 'impact', label: 'Impact & Budget' },
  { key: 'notes', label: 'Notes & Journey' },
] as const

type TabKey = (typeof TABS)[number]['key']

export default function InnovationAdminDetail({ project: initialProject }: { project: ProjectData }) {
  const [project, setProject] = useState<ProjectData>(initialProject)
  const [activeTab, setActiveTab] = useState<TabKey>('overview')
  const [pdfLoading, setPdfLoading] = useState(false)

  const handleGenerateReport = async () => {
    setPdfLoading(true)
    try {
      const res = await fetch(`/api/pdf/generate?type=focus-report&focus=project&id=${project.slug}`)
      if (!res.ok) throw new Error('PDF generation failed')
      const blob = await res.blob()
      const url = URL.createObjectURL(blob)
      const a = document.createElement('a')
      a.href = url
      a.download = `PICC-${project.name.replace(/\s+/g, '-')}-Report.pdf`
      document.body.appendChild(a)
      a.click()
      document.body.removeChild(a)
      URL.revokeObjectURL(url)
    } catch (err) {
      console.error('Report generation failed:', err)
    } finally {
      setPdfLoading(false)
    }
  }

  const handleProjectUpdate = (updated: Partial<ProjectData>) => {
    setProject(prev => ({ ...prev, ...updated }))
  }

  const status = statusColors[project.status] || statusColors.planning

  return (
    <div className="p-6 lg:p-8 max-w-7xl mx-auto">
      {/* Header */}
      <div className="mb-6">
        <Link
          href="/picc/innovation"
          className="inline-flex items-center gap-2 text-picc-red hover:text-picc-red/80 mb-4 text-sm"
        >
          <ArrowLeft className="w-4 h-4" />
          All Innovation Projects
        </Link>

        <div className="flex items-center justify-between gap-4">
          <div>
            <div className="flex items-center gap-3">
              <Lightbulb className="w-6 h-6 text-amber-500" />
              <h1 className="text-2xl lg:text-3xl font-bold text-gray-900">{project.name}</h1>
              <span className={`px-2.5 py-1 text-xs font-medium rounded-full ${status.bg} ${status.text}`}>
                {status.label}
              </span>
            </div>
            {project.tagline && (
              <p className="text-sm text-gray-500 mt-1">{project.tagline}</p>
            )}
          </div>
          <div className="flex items-center gap-2">
            <button
              onClick={handleGenerateReport}
              disabled={pdfLoading}
              className="inline-flex items-center gap-2 px-3 py-2 text-sm text-gray-600 border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors disabled:opacity-50"
            >
              {pdfLoading ? <Loader2 className="w-4 h-4 animate-spin" /> : <FileText className="w-4 h-4" />}
              Generate Report
            </button>
            <Link
              href="/innovation"
              target="_blank"
              className="inline-flex items-center gap-2 px-3 py-2 text-sm text-gray-600 border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors"
            >
              <ExternalLink className="w-4 h-4" />
              View Public Page
            </Link>
          </div>
        </div>
      </div>

      {/* Tab Navigation */}
      <div className="flex items-center gap-1 mb-6 overflow-x-auto pb-1">
        {TABS.map(tab => (
          <button
            key={tab.key}
            onClick={() => setActiveTab(tab.key)}
            className={`px-4 py-2 rounded-full text-sm font-medium whitespace-nowrap transition-colors ${
              activeTab === tab.key
                ? 'bg-picc-red text-white'
                : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
            }`}
          >
            {tab.label}
          </button>
        ))}
      </div>

      {/* Tab Content */}
      {activeTab === 'overview' && (
        <OverviewTab project={project} onUpdate={handleProjectUpdate} />
      )}
      {activeTab === 'content' && (
        <ContentMediaTab project={project} onUpdate={handleProjectUpdate} />
      )}
      {activeTab === 'impact' && (
        <ImpactBudgetTab project={project} onUpdate={handleProjectUpdate} />
      )}
      {activeTab === 'notes' && (
        <ProjectConversationsTab project={project} />
      )}
    </div>
  )
}

// ============= OVERVIEW TAB =============
function OverviewTab({ project, onUpdate }: { project: ProjectData; onUpdate: (u: Partial<ProjectData>) => void }) {
  const [name, setName] = useState(project.name)
  const [tagline, setTagline] = useState(project.tagline || '')
  const [description, setDescription] = useState(project.description || '')
  const [status, setStatus] = useState(project.status)
  const [startDate, setStartDate] = useState(project.start_date || '')
  const [targetDate, setTargetDate] = useState(project.target_completion_date || '')
  const [actualDate, setActualDate] = useState(project.actual_completion_date || '')
  const [saving, setSaving] = useState(false)
  const [saved, setSaved] = useState(false)

  // Hero image
  const [photoPickerOpen, setPhotoPickerOpen] = useState(false)
  const [settingHero, setSettingHero] = useState(false)

  const saveField = useCallback(async (fields: Record<string, unknown>) => {
    setSaving(true)
    setSaved(false)
    try {
      const res = await fetch('/api/projects', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ id: project.id, ...fields }),
      })
      if (res.ok) {
        // Only update the fields we saved — avoids overwriting concurrent changes
        // (e.g. hero_image_url set by another handler in parallel)
        onUpdate(fields as Partial<ProjectData>)
        setSaved(true)
        setTimeout(() => setSaved(false), 2000)
      }
    } catch {}
    setSaving(false)
  }, [project.id, onUpdate])

  const handleNameBlur = () => {
    if (name.trim() !== project.name) saveField({ name: name.trim() })
  }
  const handleTaglineBlur = () => {
    if (tagline.trim() !== (project.tagline || '')) saveField({ tagline: tagline.trim() || null })
  }
  const handleDescriptionBlur = () => {
    if (description.trim() !== (project.description || '')) saveField({ description: description.trim() || null })
  }
  const handleStatusChange = (val: string) => {
    setStatus(val)
    saveField({ status: val })
  }
  const handleStartDateBlur = () => {
    if (startDate !== (project.start_date || '')) saveField({ start_date: startDate || null })
  }
  const handleTargetDateBlur = () => {
    if (targetDate !== (project.target_completion_date || '')) saveField({ target_completion_date: targetDate || null })
  }
  const handleActualDateBlur = () => {
    if (actualDate !== (project.actual_completion_date || '')) saveField({ actual_completion_date: actualDate || null })
  }

  const handleSetHeroImage = async (media: any) => {
    setSettingHero(true)
    setPhotoPickerOpen(false)
    try {
      const res = await fetch('/api/projects', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ id: project.id, hero_image_url: media.public_url }),
      })
      if (res.ok) {
        onUpdate({ hero_image_url: media.public_url })
      } else {
        console.error('Failed to set hero image: HTTP', res.status, await res.text().catch(() => ''))
      }
    } catch (err) {
      console.error('Failed to set hero image:', err)
    }
    setSettingHero(false)
  }

  return (
    <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
      {/* Left column */}
      <div className="lg:col-span-2 space-y-6">
        {/* Hero Image */}
        <div className="bg-white rounded-xl border border-gray-200 overflow-hidden">
          <div className="aspect-[16/7] bg-gray-100 relative">
            {project.hero_image_url ? (
              <img src={project.hero_image_url} alt={project.name} className="w-full h-full object-cover" />
            ) : (
              <div className="w-full h-full flex items-center justify-center">
                <div className="text-center text-gray-300">
                  <ImageIcon className="w-12 h-12 mx-auto mb-2" />
                  <p className="text-sm">No hero image</p>
                </div>
              </div>
            )}
            <button
              onClick={() => setPhotoPickerOpen(true)}
              disabled={settingHero}
              className="absolute bottom-3 right-3 inline-flex items-center gap-2 px-3 py-2 bg-white/90 backdrop-blur-sm text-sm font-medium text-gray-700 rounded-lg hover:bg-white transition-colors shadow-sm disabled:opacity-50"
            >
              {settingHero ? (
                <><Loader2 className="w-4 h-4 animate-spin" /> Setting...</>
              ) : (
                <><Camera className="w-4 h-4" /> {project.hero_image_url ? 'Change' : 'Set Hero Image'}</>
              )}
            </button>
          </div>
        </div>

        {/* Name, Tagline & Description */}
        <div className="bg-white rounded-xl border border-gray-200 p-5 space-y-4">
          <div className="flex items-center justify-between">
            <h2 className="text-sm font-semibold text-gray-500 uppercase tracking-wider">Details</h2>
            <div className="flex items-center gap-1 text-xs text-gray-400">
              {saving && <><Loader2 className="w-3 h-3 animate-spin" /> Saving...</>}
              {saved && <><Check className="w-3 h-3 text-green-500" /> Saved</>}
              {!saving && !saved && 'Auto-saves on blur'}
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Project Name</label>
            <input
              value={name}
              onChange={e => setName(e.target.value)}
              onBlur={handleNameBlur}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:border-picc-red focus:ring-1 focus:ring-picc-red focus:outline-none"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Tagline</label>
            <input
              value={tagline}
              onChange={e => setTagline(e.target.value)}
              onBlur={handleTaglineBlur}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:border-picc-red focus:ring-1 focus:ring-picc-red focus:outline-none"
              placeholder="A short tagline for the project"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Description</label>
            <textarea
              value={description}
              onChange={e => setDescription(e.target.value)}
              onBlur={handleDescriptionBlur}
              rows={4}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:border-picc-red focus:ring-1 focus:ring-picc-red focus:outline-none"
              placeholder="Describe what this project is about"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Status</label>
            <select
              value={status}
              onChange={e => handleStatusChange(e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:border-picc-red focus:ring-1 focus:ring-picc-red focus:outline-none bg-white"
            >
              {STATUS_OPTIONS.map(o => (
                <option key={o.value} value={o.value}>{o.label}</option>
              ))}
            </select>
          </div>
        </div>

        {/* Dates */}
        <div className="bg-white rounded-xl border border-gray-200 p-5 space-y-4">
          <h2 className="text-sm font-semibold text-gray-500 uppercase tracking-wider">Dates</h2>
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <div>
              <label className="block text-xs text-gray-500 mb-1">Start Date</label>
              <input
                type="date"
                value={startDate}
                onChange={e => setStartDate(e.target.value)}
                onBlur={handleStartDateBlur}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:border-picc-red focus:ring-1 focus:ring-picc-red focus:outline-none"
              />
            </div>
            <div>
              <label className="block text-xs text-gray-500 mb-1">Target Completion</label>
              <input
                type="date"
                value={targetDate}
                onChange={e => setTargetDate(e.target.value)}
                onBlur={handleTargetDateBlur}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:border-picc-red focus:ring-1 focus:ring-picc-red focus:outline-none"
              />
            </div>
            <div>
              <label className="block text-xs text-gray-500 mb-1">Actual Completion</label>
              <input
                type="date"
                value={actualDate}
                onChange={e => setActualDate(e.target.value)}
                onBlur={handleActualDateBlur}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:border-picc-red focus:ring-1 focus:ring-picc-red focus:outline-none"
              />
            </div>
          </div>
        </div>
      </div>

      {/* Right column: Quick info */}
      <div className="space-y-6">
        <div className="bg-white rounded-xl border border-gray-200 p-5">
          <h2 className="text-sm font-semibold text-gray-500 uppercase tracking-wider mb-4">Info</h2>
          <div className="space-y-3 text-sm">
            <div className="flex justify-between">
              <span className="text-gray-500">Slug</span>
              <code className="bg-gray-100 px-2 py-0.5 rounded text-xs">{project.slug}</code>
            </div>
            <div className="flex justify-between">
              <span className="text-gray-500">Type</span>
              <span className="text-xs font-medium text-gray-700">{project.project_type || '\u2014'}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-gray-500">Public</span>
              <span className={`text-xs font-medium ${project.is_public ? 'text-green-600' : 'text-gray-400'}`}>
                {project.is_public ? 'Yes' : 'No'}
              </span>
            </div>
            <div className="flex justify-between">
              <span className="text-gray-500">Featured</span>
              <span className={`text-xs font-medium ${project.featured ? 'text-yellow-600' : 'text-gray-400'}`}>
                {project.featured ? 'Yes' : 'No'}
              </span>
            </div>
            {project.created_at && (
              <div className="flex justify-between">
                <span className="text-gray-500">Created</span>
                <span className="text-xs text-gray-600">
                  {new Date(project.created_at).toLocaleDateString()}
                </span>
              </div>
            )}
            {project.updated_at && (
              <div className="flex justify-between">
                <span className="text-gray-500">Updated</span>
                <span className="text-xs text-gray-600">
                  {new Date(project.updated_at).toLocaleDateString()}
                </span>
              </div>
            )}
          </div>
        </div>

        {/* Quick Links */}
        <div className="bg-white rounded-xl border border-gray-200 p-5">
          <h2 className="text-sm font-semibold text-gray-500 uppercase tracking-wider mb-4">Links</h2>
          <div className="space-y-2">
            <Link
              href="/innovation"
              className="flex items-center gap-2 px-3 py-2 text-sm text-gray-700 hover:bg-gray-50 rounded-lg transition-colors"
            >
              <Lightbulb className="w-4 h-4 text-gray-400" />
              Public Innovation Page
            </Link>
            <Link
              href={`/picc/media/gallery?q=innovation:${project.slug}`}
              className="flex items-center gap-2 px-3 py-2 text-sm text-gray-700 hover:bg-gray-50 rounded-lg transition-colors"
            >
              <Camera className="w-4 h-4 text-gray-400" />
              Project Photos
            </Link>
            {project.metadata?.website_url && (
              <a
                href={project.metadata.website_url}
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center gap-2 px-3 py-2 text-sm text-gray-700 hover:bg-gray-50 rounded-lg transition-colors"
              >
                <ExternalLink className="w-4 h-4 text-gray-400" />
                Project Website
              </a>
            )}
          </div>
        </div>

        {/* Location Map */}
        <LocationMapPicker
          projectId={project.id}
          metadata={project.metadata}
          onUpdate={(updated) => onUpdate(updated as Partial<ProjectData>)}
        />
      </div>

      <MediaPickerDialog
        open={photoPickerOpen}
        kind="image"
        onClose={() => setPhotoPickerOpen(false)}
        onPick={handleSetHeroImage}
        initialQuery={project.name}
      />
    </div>
  )
}

// ============= CONTENT & MEDIA TAB =============
function ContentMediaTab({ project, onUpdate }: { project: ProjectData; onUpdate: (u: Partial<ProjectData>) => void }) {
  const innovationTag = `innovation:${project.slug}`
  const projectTag = `project:${project.slug}`

  // Photos
  const [photos, setPhotos] = useState<any[]>([])
  const [photosLoading, setPhotosLoading] = useState(true)
  const [photoPickerOpen, setPhotoPickerOpen] = useState(false)
  const [addingPhoto, setAddingPhoto] = useState(false)
  const [removingPhotoId, setRemovingPhotoId] = useState<string | null>(null)

  // Hero
  const [heroPickerOpen, setHeroPickerOpen] = useState(false)
  const [settingHero, setSettingHero] = useState(false)

  // Videos
  const [videos, setVideos] = useState<any[]>([])
  const [videosLoading, setVideosLoading] = useState(true)
  const [videoPickerOpen, setVideoPickerOpen] = useState(false)
  const [addingVideo, setAddingVideo] = useState(false)
  const [videoLinkFormOpen, setVideoLinkFormOpen] = useState(false)
  const [videoLinkUrl, setVideoLinkUrl] = useState('')
  const [videoLinkTitle, setVideoLinkTitle] = useState('')
  const [videoLinkSubmitting, setVideoLinkSubmitting] = useState(false)

  // Stories
  const [stories, setStories] = useState<any[]>([])
  const [storiesLoading, setStoriesLoading] = useState(true)
  const [allStories, setAllStories] = useState<any[]>([])
  const [storySearchOpen, setStorySearchOpen] = useState(false)
  const [storySearch, setStorySearch] = useState('')
  const [linkingStoryId, setLinkingStoryId] = useState<string | null>(null)
  const [unlinkingStoryId, setUnlinkingStoryId] = useState<string | null>(null)

  useEffect(() => {
    loadPhotos()
    loadVideos()
    loadStories()
  }, [project.slug])

  const loadPhotos = async () => {
    setPhotosLoading(true)
    try {
      // Fetch both innovation: and project: tagged photos, deduplicate
      const [res1, res2] = await Promise.all([
        fetch(`/api/media/list?limit=50&fileType=image&tags=${encodeURIComponent(innovationTag)}`),
        fetch(`/api/media/list?limit=50&fileType=image&tags=${encodeURIComponent(projectTag)}`),
      ])
      const d1 = res1.ok ? (await res1.json()).data || [] : []
      const d2 = res2.ok ? (await res2.json()).data || [] : []
      const seen = new Set<string>()
      const merged = [...d1, ...d2].filter((p: any) => {
        if (seen.has(p.id)) return false
        seen.add(p.id)
        return true
      })
      setPhotos(merged)
    } catch {}
    setPhotosLoading(false)
  }

  const loadVideos = async () => {
    setVideosLoading(true)
    try {
      const [res1, res2] = await Promise.all([
        fetch(`/api/media/list?limit=20&fileType=video&tags=${encodeURIComponent(innovationTag)}`),
        fetch(`/api/media/list?limit=20&fileType=video&tags=${encodeURIComponent(projectTag)}`),
      ])
      const d1 = res1.ok ? (await res1.json()).data || [] : []
      const d2 = res2.ok ? (await res2.json()).data || [] : []
      const seen = new Set<string>()
      const merged = [...d1, ...d2].filter((v: any) => {
        if (seen.has(v.id)) return false
        seen.add(v.id)
        return true
      })
      setVideos(merged)
    } catch {}
    setVideosLoading(false)
  }

  const loadStories = async () => {
    setStoriesLoading(true)
    try {
      const res = await fetch('/api/stories?limit=100')
      if (res.ok) {
        const data = await res.json()
        const all = data.data || data.stories || []
        const filtered = all.filter((s: any) => {
          const tags = Array.isArray(s.tags) ? s.tags : []
          return tags.includes(innovationTag) || tags.includes(projectTag) || tags.includes(project.slug)
        })
        setStories(filtered)
      }
    } catch {}
    setStoriesLoading(false)
  }

  const handleSetHeroImage = async (media: any) => {
    setSettingHero(true)
    setHeroPickerOpen(false)
    try {
      const res = await fetch('/api/projects', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ id: project.id, hero_image_url: media.public_url }),
      })
      if (res.ok) {
        onUpdate({ hero_image_url: media.public_url })
      }
    } catch (err) {
      console.error('Failed to set hero image:', err)
    }
    setSettingHero(false)
  }

  const handleAddPhoto = async (media: any) => {
    setAddingPhoto(true)
    setPhotoPickerOpen(false)
    try {
      await fetch('/api/media/bulk', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ mediaIds: [media.id], addTags: [innovationTag] }),
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
        body: JSON.stringify({ mediaIds, addTags: [innovationTag] }),
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
        body: JSON.stringify({ mediaIds: [photoId], removeTags: [innovationTag] }),
      })
      setPhotos(prev => prev.filter(p => p.id !== photoId))
    } catch (err) {
      console.error('Failed to remove photo:', err)
    }
    setRemovingPhotoId(null)
  }

  const handleAddVideo = async (media: any) => {
    setAddingVideo(true)
    setVideoPickerOpen(false)
    try {
      await fetch('/api/media/bulk', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ mediaIds: [media.id], addTags: [innovationTag] }),
      })
      await loadVideos()
    } catch (err) {
      console.error('Failed to add video:', err)
    }
    setAddingVideo(false)
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
          tags: [innovationTag],
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

  const loadAllStories = async () => {
    try {
      const res = await fetch('/api/stories?limit=200')
      if (res.ok) {
        const data = await res.json()
        setAllStories(data.data || data.stories || [])
      }
    } catch {}
  }

  const handleLinkStory = async (story: any) => {
    setLinkingStoryId(story.id)
    try {
      const currentTags = Array.isArray(story.tags) ? story.tags : []
      const newTags = Array.from(new Set([...currentTags, innovationTag]))
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

  const handleUnlinkStory = async (story: any) => {
    setUnlinkingStoryId(story.id)
    try {
      const allRes = await fetch('/api/stories?limit=200')
      if (allRes.ok) {
        const allData = await allRes.json()
        const fullStory = (allData.data || allData.stories || []).find((s: any) => s.id === story.id)
        const currentTags: string[] = Array.isArray(fullStory?.tags) ? fullStory.tags : []
        const newTags = currentTags.filter((t: string) => t !== innovationTag && t !== project.slug)
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

  return (
    <div className="space-y-6">
      {/* Hero Image */}
      <div className="bg-white rounded-xl border border-gray-200 p-5">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-sm font-semibold text-gray-500 uppercase tracking-wider">Hero Image</h2>
          <button
            onClick={() => setHeroPickerOpen(true)}
            disabled={settingHero}
            className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium text-picc-red bg-picc-red/10 rounded-full hover:bg-picc-red/20 transition-colors disabled:opacity-50"
          >
            {settingHero ? (
              <><Loader2 className="w-3 h-3 animate-spin" /> Setting...</>
            ) : (
              <><Camera className="w-3 h-3" /> {project.hero_image_url ? 'Change' : 'Set Hero'}</>
            )}
          </button>
        </div>
        {project.hero_image_url ? (
          <div className="aspect-[16/7] rounded-lg overflow-hidden bg-gray-100">
            <img src={project.hero_image_url} alt={project.name} className="w-full h-full object-cover" />
          </div>
        ) : (
          <div className="aspect-[16/7] rounded-lg bg-gray-50 flex items-center justify-center border-2 border-dashed border-gray-200">
            <div className="text-center text-gray-400">
              <ImageIcon className="w-8 h-8 mx-auto mb-1" />
              <p className="text-sm">No hero image</p>
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
            <p className="text-sm">No photos tagged with <code className="bg-gray-100 px-1 rounded">{innovationTag}</code></p>
          </div>
        ) : (
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-2">
            {photos.map((photo: any) => (
              <div key={photo.id} className="aspect-square rounded-lg overflow-hidden bg-gray-100 relative group">
                <img src={photo.public_url} alt={photo.title || ''} className="w-full h-full object-cover" loading="lazy" />
                <button
                  onClick={() => handleRemovePhoto(photo.id)}
                  disabled={removingPhotoId === photo.id}
                  className="absolute top-1 right-1 w-6 h-6 bg-black/60 hover:bg-red-600 text-white rounded-full flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity disabled:opacity-50"
                  title="Remove from project"
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
          <a
            href={`/picc/media/gallery?q=innovation:${project.slug}`}
            className="inline-flex items-center gap-1.5 text-xs text-picc-red hover:underline"
          >
            <ExternalLink className="w-3 h-3" />
            Manage all in Media Gallery
          </a>
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
            <p className="text-sm">No videos tagged with this project</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            {videos.map((video: any) => (
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
            <p className="text-sm">No stories linked to this project</p>
          </div>
        ) : (
          <div className="space-y-2">
            {stories.map((story: any) => (
              <div key={story.id} className="flex items-center gap-3 p-3 border border-gray-100 rounded-lg hover:bg-gray-50 transition-colors group">
                {story.featured_image_url ? (
                  <img src={story.featured_image_url} alt="" className="w-12 h-12 rounded-lg object-cover flex-shrink-0" />
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
                  title="Unlink from project"
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
                  const linkedIds = new Set(stories.map((s: any) => s.id))
                  const q = storySearch.toLowerCase()
                  const filtered = allStories.filter((s: any) =>
                    !linkedIds.has(s.id) && (!q || s.title.toLowerCase().includes(q))
                  )
                  if (filtered.length === 0) return (
                    <div className="text-center py-6 text-sm text-gray-400">No matching stories</div>
                  )
                  return filtered.map((story: any) => (
                    <button
                      key={story.id}
                      onClick={() => handleLinkStory(story)}
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
        initialQuery={project.name}
      />
      <MediaPickerDialog
        open={heroPickerOpen}
        kind="image"
        onClose={() => setHeroPickerOpen(false)}
        onPick={handleSetHeroImage}
        initialQuery={project.name}
      />
      <MediaPickerDialog
        open={videoPickerOpen}
        kind="video"
        onClose={() => setVideoPickerOpen(false)}
        onPick={handleAddVideo}
        initialQuery={project.name}
      />
    </div>
  )
}

// ============= IMPACT & BUDGET TAB =============
function ImpactBudgetTab({ project, onUpdate }: { project: ProjectData; onUpdate: (u: Partial<ProjectData>) => void }) {
  const [impactAreas, setImpactAreas] = useState((project.impact_areas || []).join(', '))
  const [targetBeneficiaries, setTargetBeneficiaries] = useState(project.target_beneficiaries != null ? String(project.target_beneficiaries) : '')
  const [actualBeneficiaries, setActualBeneficiaries] = useState(project.actual_beneficiaries != null ? String(project.actual_beneficiaries) : '')
  const [budgetTotal, setBudgetTotal] = useState(project.budget_total != null ? String(project.budget_total) : '')
  const [budgetSpent, setBudgetSpent] = useState(project.budget_spent != null ? String(project.budget_spent) : '')
  const [fundingSources, setFundingSources] = useState((project.funding_sources || []).join(', '))
  const [teamMembers, setTeamMembers] = useState((project.team_members || []).join(', '))
  const [projectLead, setProjectLead] = useState(project.project_lead || '')
  const [saving, setSaving] = useState(false)
  const [saved, setSaved] = useState(false)

  const saveField = useCallback(async (fields: Record<string, unknown>) => {
    setSaving(true)
    setSaved(false)
    try {
      const res = await fetch('/api/projects', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ id: project.id, ...fields }),
      })
      if (res.ok) {
        // Only update the fields we saved — avoids overwriting concurrent changes
        onUpdate(fields as Partial<ProjectData>)
        setSaved(true)
        setTimeout(() => setSaved(false), 2000)
      }
    } catch {}
    setSaving(false)
  }, [project.id, onUpdate])

  const parseNumber = (val: string) => {
    const n = parseFloat(val)
    return isNaN(n) ? null : n
  }

  const parseArray = (val: string) => {
    const items = val.split(',').map(s => s.trim()).filter(Boolean)
    return items.length > 0 ? items : null
  }

  return (
    <div className="space-y-6">
      {/* Impact */}
      <div className="bg-white rounded-xl border border-gray-200 p-5 space-y-4">
        <div className="flex items-center justify-between">
          <h2 className="text-sm font-semibold text-gray-500 uppercase tracking-wider">Impact</h2>
          <div className="flex items-center gap-1 text-xs text-gray-400">
            {saving && <><Loader2 className="w-3 h-3 animate-spin" /> Saving...</>}
            {saved && <><Check className="w-3 h-3 text-green-500" /> Saved</>}
            {!saving && !saved && 'Auto-saves on blur'}
          </div>
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Impact Areas</label>
          <input
            value={impactAreas}
            onChange={e => setImpactAreas(e.target.value)}
            onBlur={() => saveField({ impact_areas: parseArray(impactAreas) })}
            className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:border-picc-red focus:ring-1 focus:ring-picc-red focus:outline-none"
            placeholder="e.g. culture, technology, education (comma-separated)"
          />
        </div>
        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className="block text-xs text-gray-500 mb-1">Target Beneficiaries</label>
            <input
              type="number"
              value={targetBeneficiaries}
              onChange={e => setTargetBeneficiaries(e.target.value)}
              onBlur={() => saveField({ target_beneficiaries: parseNumber(targetBeneficiaries) })}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:border-picc-red focus:ring-1 focus:ring-picc-red focus:outline-none"
              placeholder="e.g. 500"
            />
          </div>
          <div>
            <label className="block text-xs text-gray-500 mb-1">Actual Beneficiaries</label>
            <input
              type="number"
              value={actualBeneficiaries}
              onChange={e => setActualBeneficiaries(e.target.value)}
              onBlur={() => saveField({ actual_beneficiaries: parseNumber(actualBeneficiaries) })}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:border-picc-red focus:ring-1 focus:ring-picc-red focus:outline-none"
              placeholder="e.g. 320"
            />
          </div>
        </div>
      </div>

      {/* Budget */}
      <div className="bg-white rounded-xl border border-gray-200 p-5 space-y-4">
        <h2 className="text-sm font-semibold text-gray-500 uppercase tracking-wider">Budget</h2>
        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className="block text-xs text-gray-500 mb-1">Total Budget ($)</label>
            <input
              type="number"
              value={budgetTotal}
              onChange={e => setBudgetTotal(e.target.value)}
              onBlur={() => saveField({ budget_total: parseNumber(budgetTotal) })}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:border-picc-red focus:ring-1 focus:ring-picc-red focus:outline-none"
              placeholder="e.g. 50000"
            />
          </div>
          <div>
            <label className="block text-xs text-gray-500 mb-1">Spent ($)</label>
            <input
              type="number"
              value={budgetSpent}
              onChange={e => setBudgetSpent(e.target.value)}
              onBlur={() => saveField({ budget_spent: parseNumber(budgetSpent) })}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:border-picc-red focus:ring-1 focus:ring-picc-red focus:outline-none"
              placeholder="e.g. 12000"
            />
          </div>
        </div>
        {budgetTotal && budgetSpent && (
          <div>
            <div className="flex items-center justify-between text-xs text-gray-500 mb-1">
              <span>Budget Progress</span>
              <span>{Math.round((parseFloat(budgetSpent) / parseFloat(budgetTotal)) * 100)}%</span>
            </div>
            <div className="h-2 bg-gray-100 rounded-full overflow-hidden">
              <div
                className={`h-full rounded-full ${
                  (parseFloat(budgetSpent) / parseFloat(budgetTotal)) > 0.9
                    ? 'bg-red-500'
                    : (parseFloat(budgetSpent) / parseFloat(budgetTotal)) > 0.7
                      ? 'bg-amber-500'
                      : 'bg-green-500'
                }`}
                style={{ width: `${Math.min(100, (parseFloat(budgetSpent) / parseFloat(budgetTotal)) * 100)}%` }}
              />
            </div>
          </div>
        )}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Funding Sources</label>
          <input
            value={fundingSources}
            onChange={e => setFundingSources(e.target.value)}
            onBlur={() => saveField({ funding_sources: parseArray(fundingSources) })}
            className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:border-picc-red focus:ring-1 focus:ring-picc-red focus:outline-none"
            placeholder="e.g. NIAA, QLD Government, Self-funded (comma-separated)"
          />
        </div>
      </div>

      {/* Team */}
      <div className="bg-white rounded-xl border border-gray-200 p-5 space-y-4">
        <h2 className="text-sm font-semibold text-gray-500 uppercase tracking-wider">Team</h2>
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Project Lead</label>
          <input
            value={projectLead}
            onChange={e => setProjectLead(e.target.value)}
            onBlur={() => saveField({ project_lead: projectLead.trim() || null })}
            className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:border-picc-red focus:ring-1 focus:ring-picc-red focus:outline-none"
            placeholder="e.g. Jane Smith"
          />
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Team Members</label>
          <input
            value={teamMembers}
            onChange={e => setTeamMembers(e.target.value)}
            onBlur={() => saveField({ team_members: parseArray(teamMembers) })}
            className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:border-picc-red focus:ring-1 focus:ring-picc-red focus:outline-none"
            placeholder="e.g. Alice, Bob, Charlie (comma-separated)"
          />
        </div>
      </div>
    </div>
  )
}
