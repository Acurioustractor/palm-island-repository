'use client'

import { useEffect, useState, useCallback } from 'react'
import { useParams } from 'next/navigation'
import Link from 'next/link'
import {
  ArrowLeft, Loader2, Check, X, Image as ImageIcon,
  User, Users, Camera, Star, RefreshCw, Save, Eye,
  Film, ChevronDown, ChevronUp, Search, Filter
} from 'lucide-react'

interface MediaFile {
  id: string
  public_url: string
  title?: string
  caption?: string
  alt_text?: string
  tags?: string[]
  is_featured?: boolean
  is_public?: boolean
  file_type?: string
  metadata?: Record<string, any>
  created_at: string
}

interface AnnualReport {
  id: string
  title: string
  report_year: number
  metadata?: Record<string, any>
}

// Report sections that can have images
const REPORT_SECTIONS = [
  { id: 'hero', label: 'Hero Background', icon: ImageIcon, description: 'Main cover image', max: 1 },
  { id: 'ceo', label: 'CEO Portrait', icon: User, description: 'Rachel Atkinson photo', max: 1 },
  { id: 'chair', label: 'Chair Portrait', icon: User, description: 'Luella Bligh photo', max: 1 },
  { id: 'gallery', label: 'Year in Pictures', icon: Camera, description: 'Community photos for gallery', max: 30 },
  { id: 'stories', label: 'Story Images', icon: Users, description: 'Photos for community stories section', max: 10 },
  { id: 'projects', label: 'Project Photos', icon: Star, description: 'Innovation project images', max: 6 },
  { id: 'video_thumb', label: 'Video Thumbnails', icon: Film, description: 'Featured video thumbnails', max: 2 },
]

export default function AnnualReportImagesPage() {
  const params = useParams<{ id: string }>()
  const reportId = params.id

  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [report, setReport] = useState<AnnualReport | null>(null)
  const [allMedia, setAllMedia] = useState<MediaFile[]>([])
  const [taggedMedia, setTaggedMedia] = useState<Record<string, string[]>>({}) // section -> media ids
  const [activeSection, setActiveSection] = useState<string>('hero')
  const [searchQuery, setSearchQuery] = useState('')
  const [filterType, setFilterType] = useState<'all' | 'images' | 'videos'>('all')
  const [showOnlyTagged, setShowOnlyTagged] = useState(false)

  const fiscalYear = report?.report_year
    ? `${report.report_year - 1}-${String(report.report_year).slice(-2)}`
    : null

  const loadData = useCallback(async () => {
    setLoading(true)
    setError(null)
    try {
      // Load report info and all media in parallel
      const [reportRes, mediaRes] = await Promise.all([
        fetch(`/api/annual-reports/${reportId}`),
        fetch('/api/media/list?limit=500'),
      ])

      const reportJson = await reportRes.json().catch(() => ({}))
      const mediaJson = await mediaRes.json().catch(() => ({}))

      if (!reportRes.ok) throw new Error(reportJson?.error || 'Failed to load report')

      setReport(reportJson.report || reportJson)
      setAllMedia((mediaJson.data || mediaJson.media || []) as MediaFile[])

      // Build tagged media map from existing tags
      const fy = reportJson.report?.report_year || reportJson.report_year
      const fyTag = fy ? `fy:${fy - 1}-${String(fy).slice(-2)}` : null
      const tagged: Record<string, string[]> = {}

      for (const section of REPORT_SECTIONS) {
        tagged[section.id] = []
      }

      for (const media of (mediaJson.media || []) as MediaFile[]) {
        if (!Array.isArray(media.tags)) continue
        const hasAnnualReport = media.tags.includes('annual-report')
        const hasFY = fyTag && media.tags.includes(fyTag)

        if (!hasAnnualReport && !hasFY) continue

        // Check for section-specific tags
        for (const section of REPORT_SECTIONS) {
          if (media.tags.includes(`report-section:${section.id}`)) {
            tagged[section.id].push(media.id)
          }
        }

        // Also check usage_context or general placement
        if (media.is_featured && !tagged['hero'].includes(media.id)) {
          tagged['hero'].push(media.id)
        }
      }

      setTaggedMedia(tagged)
    } catch (e: any) {
      setError(e?.message || 'Failed to load data')
    } finally {
      setLoading(false)
    }
  }, [reportId])

  useEffect(() => {
    loadData()
  }, [loadData])

  const toggleMediaSelection = (mediaId: string) => {
    setTaggedMedia(prev => {
      const section = activeSection
      const current = prev[section] || []
      const maxItems = REPORT_SECTIONS.find(s => s.id === section)?.max || 10

      if (current.includes(mediaId)) {
        return { ...prev, [section]: current.filter(id => id !== mediaId) }
      } else {
        if (current.length >= maxItems) {
          // Remove oldest if at max
          return { ...prev, [section]: [...current.slice(1), mediaId] }
        }
        return { ...prev, [section]: [...current, mediaId] }
      }
    })
  }

  const saveSelections = async () => {
    if (!fiscalYear) return
    setSaving(true)
    setError(null)

    try {
      // Collect all selected media IDs with their sections
      const updates: { mediaId: string; sections: string[] }[] = []
      const allSelectedIds = new Set<string>()

      for (const [section, ids] of Object.entries(taggedMedia)) {
        for (const id of ids) {
          allSelectedIds.add(id)
          const existing = updates.find(u => u.mediaId === id)
          if (existing) {
            existing.sections.push(section)
          } else {
            updates.push({ mediaId: id, sections: [section] })
          }
        }
      }

      // Update each media file with tags
      for (const update of updates) {
        const media = allMedia.find(m => m.id === update.mediaId)
        if (!media) continue

        const existingTags = (media.tags || []).filter(t =>
          !t.startsWith('report-section:') &&
          t !== 'annual-report' &&
          !t.startsWith('fy:')
        )

        const newTags = [
          ...existingTags,
          'annual-report',
          `fy:${fiscalYear}`,
          ...update.sections.map(s => `report-section:${s}`)
        ]

        await fetch(`/api/media/${update.mediaId}`, {
          method: 'PATCH',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            tags: Array.from(new Set(newTags)),
            is_public: true,
            metadata: {
              ...(media.metadata || {}),
              fiscal_year: fiscalYear,
            },
          }),
        })
      }

      // Remove annual report tags from media that was unselected
      const unselectedMedia = allMedia.filter(m =>
        Array.isArray(m.tags) &&
        m.tags.includes('annual-report') &&
        !allSelectedIds.has(m.id)
      )

      for (const media of unselectedMedia) {
        const cleanedTags = (media.tags || []).filter(t =>
          !t.startsWith('report-section:') &&
          t !== 'annual-report' &&
          !t.startsWith('fy:')
        )

        await fetch(`/api/media/${media.id}`, {
          method: 'PATCH',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ tags: cleanedTags }),
        })
      }

      // Reload to get fresh data
      await loadData()
    } catch (e: any) {
      setError(e?.message || 'Failed to save')
    } finally {
      setSaving(false)
    }
  }

  const filteredMedia = allMedia.filter(media => {
    // Type filter
    if (filterType === 'images' && media.file_type === 'video') return false
    if (filterType === 'videos' && media.file_type !== 'video') return false

    // Search filter
    if (searchQuery) {
      const q = searchQuery.toLowerCase()
      const matches =
        media.title?.toLowerCase().includes(q) ||
        media.caption?.toLowerCase().includes(q) ||
        media.alt_text?.toLowerCase().includes(q) ||
        media.tags?.some(t => t.toLowerCase().includes(q))
      if (!matches) return false
    }

    // Tagged filter
    if (showOnlyTagged) {
      const isTagged = Object.values(taggedMedia).some(ids => ids.includes(media.id))
      if (!isTagged) return false
    }

    return true
  })

  const activeSectionConfig = REPORT_SECTIONS.find(s => s.id === activeSection)
  const selectedCount = taggedMedia[activeSection]?.length || 0

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 p-8">
        <div className="max-w-7xl mx-auto flex items-center justify-center py-20">
          <Loader2 className="w-8 h-8 animate-spin text-purple-600" />
          <span className="ml-3 text-gray-600">Loading media library...</span>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white border-b border-gray-200 sticky top-0 z-20">
        <div className="max-w-7xl mx-auto px-6 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <Link
                href={`/picc/reports/${reportId}`}
                className="p-2 text-gray-500 hover:text-gray-700 hover:bg-gray-100 rounded-lg"
              >
                <ArrowLeft className="w-5 h-5" />
              </Link>
              <div>
                <h1 className="text-xl font-bold text-gray-900">
                  Annual Report Images
                </h1>
                <p className="text-sm text-gray-600">
                  {report?.title || `FY${report?.report_year} Report`} • Select images for each section
                </p>
              </div>
            </div>
            <div className="flex items-center gap-3">
              <Link
                href={`/annual-report/${report?.report_year}?print=1`}
                target="_blank"
                className="flex items-center gap-2 px-4 py-2 text-gray-700 border border-gray-300 rounded-lg hover:bg-gray-50"
              >
                <Eye className="w-4 h-4" />
                Preview Report
              </Link>
              <button
                onClick={saveSelections}
                disabled={saving}
                className="flex items-center gap-2 px-5 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 disabled:opacity-50"
              >
                {saving ? <Loader2 className="w-4 h-4 animate-spin" /> : <Save className="w-4 h-4" />}
                Save Selections
              </button>
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-6 py-6">
        {error && (
          <div className="mb-6 bg-red-50 border border-red-200 rounded-xl p-4 text-red-700">
            {error}
          </div>
        )}

        <div className="grid grid-cols-12 gap-6">
          {/* Sidebar - Section Selection */}
          <div className="col-span-3">
            <div className="bg-white rounded-xl border border-gray-200 p-4 sticky top-24">
              <h2 className="font-semibold text-gray-900 mb-4">Report Sections</h2>
              <div className="space-y-2">
                {REPORT_SECTIONS.map(section => {
                  const count = taggedMedia[section.id]?.length || 0
                  const Icon = section.icon
                  const isActive = activeSection === section.id

                  return (
                    <button
                      key={section.id}
                      onClick={() => setActiveSection(section.id)}
                      className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-lg text-left transition-colors ${
                        isActive
                          ? 'bg-purple-100 text-purple-700 border border-purple-200'
                          : 'hover:bg-gray-100 text-gray-700'
                      }`}
                    >
                      <Icon className="w-5 h-5 flex-shrink-0" />
                      <div className="flex-1 min-w-0">
                        <div className="font-medium text-sm truncate">{section.label}</div>
                        <div className="text-xs text-gray-500">{section.description}</div>
                      </div>
                      <div className={`px-2 py-0.5 rounded-full text-xs font-medium ${
                        count > 0
                          ? 'bg-purple-600 text-white'
                          : 'bg-gray-200 text-gray-600'
                      }`}>
                        {count}/{section.max}
                      </div>
                    </button>
                  )
                })}
              </div>

              <div className="mt-6 pt-4 border-t border-gray-200">
                <div className="text-xs text-gray-500 mb-2">Quick Stats</div>
                <div className="text-sm text-gray-700">
                  <div className="flex justify-between py-1">
                    <span>Total Media</span>
                    <span className="font-medium">{allMedia.length}</span>
                  </div>
                  <div className="flex justify-between py-1">
                    <span>Selected for Report</span>
                    <span className="font-medium text-purple-600">
                      {Object.values(taggedMedia).flat().length}
                    </span>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Main Content - Media Grid */}
          <div className="col-span-9">
            {/* Filters */}
            <div className="bg-white rounded-xl border border-gray-200 p-4 mb-6">
              <div className="flex items-center gap-4">
                <div className="flex-1 relative">
                  <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                  <input
                    type="text"
                    value={searchQuery}
                    onChange={e => setSearchQuery(e.target.value)}
                    placeholder="Search by title, caption, or tags..."
                    className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg"
                  />
                </div>
                <select
                  value={filterType}
                  onChange={e => setFilterType(e.target.value as any)}
                  className="px-3 py-2 border border-gray-300 rounded-lg bg-white"
                >
                  <option value="all">All Types</option>
                  <option value="images">Images Only</option>
                  <option value="videos">Videos Only</option>
                </select>
                <label className="flex items-center gap-2 text-sm text-gray-700">
                  <input
                    type="checkbox"
                    checked={showOnlyTagged}
                    onChange={e => setShowOnlyTagged(e.target.checked)}
                    className="rounded"
                  />
                  Show selected only
                </label>
                <button
                  onClick={loadData}
                  className="p-2 text-gray-500 hover:text-gray-700 hover:bg-gray-100 rounded-lg"
                >
                  <RefreshCw className="w-4 h-4" />
                </button>
              </div>
            </div>

            {/* Section Header */}
            <div className="bg-gradient-to-r from-purple-600 to-purple-700 rounded-xl p-4 mb-6 text-white">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  {activeSectionConfig && <activeSectionConfig.icon className="w-6 h-6" />}
                  <div>
                    <h3 className="font-semibold text-lg">{activeSectionConfig?.label}</h3>
                    <p className="text-white/80 text-sm">{activeSectionConfig?.description}</p>
                  </div>
                </div>
                <div className="text-right">
                  <div className="text-2xl font-bold">{selectedCount}</div>
                  <div className="text-white/80 text-sm">of {activeSectionConfig?.max} selected</div>
                </div>
              </div>
            </div>

            {/* Media Grid */}
            {filteredMedia.length === 0 ? (
              <div className="bg-white rounded-xl border border-gray-200 p-12 text-center">
                <ImageIcon className="w-12 h-12 text-gray-300 mx-auto mb-4" />
                <h3 className="text-lg font-medium text-gray-900 mb-2">No Media Found</h3>
                <p className="text-gray-600 mb-4">
                  {searchQuery || showOnlyTagged
                    ? 'Try adjusting your filters'
                    : 'Upload images to the media gallery first'}
                </p>
                <Link
                  href="/picc/media/gallery"
                  className="inline-flex items-center gap-2 px-4 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700"
                >
                  <Camera className="w-4 h-4" />
                  Go to Media Gallery
                </Link>
              </div>
            ) : (
              <div className="grid grid-cols-4 gap-4">
                {filteredMedia.map(media => {
                  const isSelected = taggedMedia[activeSection]?.includes(media.id)
                  const selectedInOther = Object.entries(taggedMedia)
                    .filter(([section]) => section !== activeSection)
                    .some(([, ids]) => ids.includes(media.id))

                  return (
                    <div
                      key={media.id}
                      onClick={() => toggleMediaSelection(media.id)}
                      className={`relative group cursor-pointer rounded-xl overflow-hidden border-2 transition-all ${
                        isSelected
                          ? 'border-purple-600 ring-2 ring-purple-200'
                          : selectedInOther
                          ? 'border-amber-400 opacity-75'
                          : 'border-transparent hover:border-gray-300'
                      }`}
                    >
                      <div className="aspect-square bg-gray-100">
                        {media.file_type === 'video' ? (
                          <div className="w-full h-full flex items-center justify-center bg-gray-800">
                            <Film className="w-12 h-12 text-white/50" />
                          </div>
                        ) : (
                          <img
                            src={media.public_url}
                            alt={media.alt_text || media.title || 'Media'}
                            className="w-full h-full object-cover"
                          />
                        )}
                      </div>

                      {/* Selection Indicator */}
                      <div className={`absolute top-2 right-2 w-6 h-6 rounded-full flex items-center justify-center transition-all ${
                        isSelected
                          ? 'bg-purple-600 text-white'
                          : 'bg-white/90 text-gray-400 opacity-0 group-hover:opacity-100'
                      }`}>
                        {isSelected ? <Check className="w-4 h-4" /> : <div className="w-3 h-3 border-2 border-current rounded-full" />}
                      </div>

                      {/* Used in other sections indicator */}
                      {selectedInOther && !isSelected && (
                        <div className="absolute top-2 left-2 px-2 py-0.5 bg-amber-500 text-white text-xs rounded-full">
                          Used elsewhere
                        </div>
                      )}

                      {/* Title/Caption */}
                      <div className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black/70 to-transparent p-3">
                        <p className="text-white text-sm font-medium truncate">
                          {media.title || media.caption || media.alt_text || 'Untitled'}
                        </p>
                        {media.tags && media.tags.length > 0 && (
                          <div className="flex flex-wrap gap-1 mt-1">
                            {media.tags.slice(0, 3).map(tag => (
                              <span key={tag} className="px-1.5 py-0.5 bg-white/20 rounded text-xs text-white/80">
                                {tag}
                              </span>
                            ))}
                          </div>
                        )}
                      </div>
                    </div>
                  )
                })}
              </div>
            )}

            {/* Selected Preview */}
            {selectedCount > 0 && (
              <div className="mt-6 bg-white rounded-xl border border-gray-200 p-4">
                <h3 className="font-medium text-gray-900 mb-3">
                  Selected for {activeSectionConfig?.label} ({selectedCount})
                </h3>
                <div className="flex flex-wrap gap-2">
                  {taggedMedia[activeSection]?.map(id => {
                    const media = allMedia.find(m => m.id === id)
                    if (!media) return null
                    return (
                      <div key={id} className="relative group">
                        <img
                          src={media.public_url}
                          alt=""
                          className="w-16 h-16 object-cover rounded-lg"
                        />
                        <button
                          onClick={(e) => {
                            e.stopPropagation()
                            toggleMediaSelection(id)
                          }}
                          className="absolute -top-1 -right-1 w-5 h-5 bg-red-500 text-white rounded-full opacity-0 group-hover:opacity-100 flex items-center justify-center"
                        >
                          <X className="w-3 h-3" />
                        </button>
                      </div>
                    )
                  })}
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}
