'use client'

import { useEffect, useState, useMemo } from 'react'
import { X, Search, Loader2, Filter, Users, FolderOpen, Calendar, ChevronDown } from 'lucide-react'

export interface MediaItem {
  id: string
  public_url: string
  title?: string | null
  caption?: string | null
  alt_text?: string | null
  tags?: string[] | null
  file_type?: string | null
  description?: string | null
  original_filename?: string | null
}

interface Profile {
  id: string
  full_name: string
  preferred_name?: string | null
}

interface ServiceTaxonomy {
  id: string
  service_name: string
  service_slug: string
}

interface ProjectTaxonomy {
  id: string
  name: string
  slug: string
}

export interface ImagePickerProps {
  open: boolean
  onClose: () => void
  onSelect: (media: MediaItem) => void
  title?: string
  fileType?: 'image' | 'video' | 'all'
  searchHint?: string
  initialQuery?: string
}

export default function ImagePicker({
  open,
  onClose,
  onSelect,
  title = 'Select Image',
  fileType = 'image',
  searchHint = 'Search by title, description, or filename...',
  initialQuery = '',
}: ImagePickerProps) {
  const [query, setQuery] = useState(initialQuery)
  const [loading, setLoading] = useState(false)
  const [results, setResults] = useState<MediaItem[]>([])
  const [error, setError] = useState<string | null>(null)

  // Filter states
  const [showFilters, setShowFilters] = useState(false)
  const [personFilter, setPersonFilter] = useState('all')
  const [serviceFilter, setServiceFilter] = useState('all')
  const [projectFilter, setProjectFilter] = useState('all')
  const [annualReportOnly, setAnnualReportOnly] = useState(false)
  const [fiscalYearFilter, setFiscalYearFilter] = useState('all')

  // Taxonomy data
  const [profiles, setProfiles] = useState<Profile[]>([])
  const [services, setServices] = useState<ServiceTaxonomy[]>([])
  const [projects, setProjects] = useState<ProjectTaxonomy[]>([])
  const [taxonomyLoaded, setTaxonomyLoaded] = useState(false)

  // Generate fiscal year options
  const fiscalYearOptions = useMemo(() => {
    const now = new Date()
    const fyStart = now.getMonth() >= 6 ? now.getFullYear() : now.getFullYear() - 1
    return Array.from({ length: 6 }).map((_, i) => {
      const start = fyStart - i
      const end = start + 1
      return `${start}-${String(end).slice(-2)}`
    })
  }, [])

  // Count active filters
  const activeFilterCount = useMemo(() => {
    let count = 0
    if (personFilter !== 'all') count++
    if (serviceFilter !== 'all') count++
    if (projectFilter !== 'all') count++
    if (annualReportOnly) count++
    if (fiscalYearFilter !== 'all') count++
    return count
  }, [personFilter, serviceFilter, projectFilter, annualReportOnly, fiscalYearFilter])

  // Load taxonomy data when modal opens
  useEffect(() => {
    if (!open || taxonomyLoaded) return

    const loadTaxonomy = async () => {
      try {
        // Load profiles and taxonomy in parallel
        const [profilesRes, taxonomyRes] = await Promise.all([
          fetch('/api/storytellers', { signal: AbortSignal.timeout(5000) }),
          fetch('/api/media/taxonomy', { signal: AbortSignal.timeout(5000) }),
        ])

        if (profilesRes.ok) {
          const profileData = await profilesRes.json().catch(() => ({}))
          setProfiles(profileData?.data || [])
        }

        if (taxonomyRes.ok) {
          const taxonomyData = await taxonomyRes.json().catch(() => ({}))
          setServices(taxonomyData?.services || [])
          setProjects(taxonomyData?.projects || [])
        }

        setTaxonomyLoaded(true)
      } catch (e) {
        console.error('Failed to load taxonomy:', e)
      }
    }

    loadTaxonomy()
  }, [open, taxonomyLoaded])

  // Reset state when modal closes
  useEffect(() => {
    if (!open) {
      setQuery(initialQuery)
      setResults([])
      setError(null)
      // Don't reset filters - keep them for convenience
      return
    }
  }, [open, initialQuery])

  // Search media with filters
  useEffect(() => {
    if (!open) return

    let cancelled = false

    const search = async () => {
      setLoading(true)
      setError(null)
      try {
        const params = new URLSearchParams()
        if (fileType !== 'all') params.set('fileType', fileType)
        params.set('limit', '80')
        if (query.trim()) params.set('q', query.trim())

        // Person filter
        if (personFilter !== 'all') {
          params.set('person', personFilter)
        }

        // Build tags array for service, project, annual report filters
        const tags: string[] = []
        if (serviceFilter !== 'all') tags.push(`service:${serviceFilter}`)
        if (projectFilter !== 'all') tags.push(`project:${projectFilter}`)
        if (annualReportOnly) {
          tags.push('annual-report')
          if (fiscalYearFilter !== 'all') tags.push(`fy:${fiscalYearFilter}`)
        }
        if (tags.length > 0) params.set('tags', tags.join(','))

        const res = await fetch(`/api/media/list?${params.toString()}`, { cache: 'no-store' })
        const json = await res.json().catch(() => ({}))

        if (!res.ok) throw new Error(json?.error || 'Failed to search media')
        if (cancelled) return

        setResults((json.data || []) as MediaItem[])
      } catch (e: any) {
        if (!cancelled) setError(e?.message || 'Failed to search media')
      } finally {
        if (!cancelled) setLoading(false)
      }
    }

    // Debounce search
    const timeout = setTimeout(search, 300)
    return () => {
      cancelled = true
      clearTimeout(timeout)
    }
  }, [open, query, fileType, personFilter, serviceFilter, projectFilter, annualReportOnly, fiscalYearFilter])

  const clearFilters = () => {
    setPersonFilter('all')
    setServiceFilter('all')
    setProjectFilter('all')
    setAnnualReportOnly(false)
    setFiscalYearFilter('all')
  }

  if (!open) return null

  return (
    <div className="fixed inset-0 z-[80] bg-black/50 flex items-center justify-center p-4 print:hidden">
      <div className="bg-white rounded-2xl w-full max-w-4xl max-h-[85vh] overflow-hidden border border-gray-200 shadow-2xl flex flex-col">
        {/* Header */}
        <div className="p-4 border-b border-gray-200 flex items-center justify-between gap-3 flex-shrink-0">
          <h2 className="font-semibold text-gray-900 text-lg">{title}</h2>
          <button
            onClick={onClose}
            className="p-2 rounded-lg hover:bg-gray-100 transition-colors"
            aria-label="Close"
          >
            <X className="w-5 h-5 text-gray-600" />
          </button>
        </div>

        {/* Search and Filters */}
        <div className="p-4 border-b border-gray-200 flex-shrink-0 space-y-3">
          <div className="flex gap-2">
            {/* Search input */}
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
              <input
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                className="w-full pl-10 pr-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                placeholder={searchHint}
                autoFocus
              />
            </div>
            {/* Filter toggle button */}
            <button
              onClick={() => setShowFilters(!showFilters)}
              className={`
                flex items-center gap-2 px-4 py-2.5 rounded-lg border transition-colors
                ${showFilters || activeFilterCount > 0
                  ? 'bg-purple-50 border-purple-300 text-purple-700'
                  : 'bg-white border-gray-300 text-gray-700 hover:bg-gray-50'
                }
              `}
            >
              <Filter className="w-4 h-4" />
              Filters
              {activeFilterCount > 0 && (
                <span className="px-1.5 py-0.5 bg-purple-600 text-white text-xs rounded-full">
                  {activeFilterCount}
                </span>
              )}
            </button>
          </div>

          {/* Filter panel */}
          {showFilters && (
            <div className="bg-gray-50 rounded-lg p-4 space-y-4">
              <div className="grid grid-cols-2 gap-4">
                {/* Person filter */}
                <div>
                  <label className="flex items-center gap-1.5 text-xs font-medium text-gray-600 mb-1.5">
                    <Users className="w-3.5 h-3.5" />
                    Person
                  </label>
                  <select
                    value={personFilter}
                    onChange={(e) => setPersonFilter(e.target.value)}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                  >
                    <option value="all">All People</option>
                    {profiles.map((p) => (
                      <option key={p.id} value={p.id}>
                        {p.preferred_name || p.full_name}
                      </option>
                    ))}
                  </select>
                </div>

                {/* Service filter */}
                <div>
                  <label className="flex items-center gap-1.5 text-xs font-medium text-gray-600 mb-1.5">
                    <FolderOpen className="w-3.5 h-3.5" />
                    Service
                  </label>
                  <select
                    value={serviceFilter}
                    onChange={(e) => setServiceFilter(e.target.value)}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                  >
                    <option value="all">All Services</option>
                    {services.map((s) => (
                      <option key={s.id} value={s.service_slug}>
                        {s.service_name}
                      </option>
                    ))}
                  </select>
                </div>

                {/* Project filter */}
                <div>
                  <label className="flex items-center gap-1.5 text-xs font-medium text-gray-600 mb-1.5">
                    <FolderOpen className="w-3.5 h-3.5" />
                    Project
                  </label>
                  <select
                    value={projectFilter}
                    onChange={(e) => setProjectFilter(e.target.value)}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                  >
                    <option value="all">All Projects</option>
                    {projects.map((p) => (
                      <option key={p.id} value={p.slug}>
                        {p.name}
                      </option>
                    ))}
                  </select>
                </div>

                {/* Annual Report / Fiscal Year */}
                <div>
                  <label className="flex items-center gap-1.5 text-xs font-medium text-gray-600 mb-1.5">
                    <Calendar className="w-3.5 h-3.5" />
                    Annual Report
                  </label>
                  <div className="flex gap-2">
                    <label className="flex items-center gap-2 px-3 py-2 border border-gray-300 rounded-lg bg-white cursor-pointer hover:bg-gray-50">
                      <input
                        type="checkbox"
                        checked={annualReportOnly}
                        onChange={(e) => {
                          setAnnualReportOnly(e.target.checked)
                          if (!e.target.checked) setFiscalYearFilter('all')
                        }}
                        className="rounded border-gray-300 text-purple-600 focus:ring-purple-500"
                      />
                      <span className="text-sm text-gray-700">AR Only</span>
                    </label>
                    <select
                      value={fiscalYearFilter}
                      onChange={(e) => setFiscalYearFilter(e.target.value)}
                      disabled={!annualReportOnly}
                      className="flex-1 px-3 py-2 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-purple-500 disabled:bg-gray-100 disabled:text-gray-400"
                    >
                      <option value="all">All Years</option>
                      {fiscalYearOptions.map((fy) => (
                        <option key={fy} value={fy}>
                          FY {fy}
                        </option>
                      ))}
                    </select>
                  </div>
                </div>
              </div>

              {/* Clear filters button */}
              {activeFilterCount > 0 && (
                <div className="flex justify-end">
                  <button
                    onClick={clearFilters}
                    className="text-sm text-purple-600 hover:text-purple-700 font-medium"
                  >
                    Clear all filters
                  </button>
                </div>
              )}
            </div>
          )}
        </div>

        {/* Results */}
        <div className="p-4 overflow-auto flex-1">
          {error && (
            <div className="text-red-600 text-sm mb-4 p-3 bg-red-50 rounded-lg">{error}</div>
          )}

          {loading ? (
            <div className="flex items-center justify-center py-12">
              <Loader2 className="w-8 h-8 text-purple-600 animate-spin" />
            </div>
          ) : results.length === 0 ? (
            <div className="text-center py-12 text-gray-500">
              <p className="mb-2">No results found</p>
              <p className="text-sm text-gray-400">Try a different search term</p>
            </div>
          ) : (
            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-3">
              {results.map((item) => (
                <button
                  key={item.id}
                  onClick={() => {
                    onSelect(item)
                    onClose()
                  }}
                  className="text-left rounded-xl border border-gray-200 overflow-hidden hover:border-purple-400 hover:shadow-md transition-all group"
                >
                  {item.file_type === 'video' ? (
                    <div className="w-full h-32 bg-gray-100 flex items-center justify-center">
                      <span className="text-gray-500 text-sm">Video</span>
                    </div>
                  ) : (
                    <img
                      src={item.public_url}
                      alt={item.alt_text || item.title || ''}
                      className="w-full h-32 object-cover bg-gray-100 group-hover:opacity-90 transition-opacity"
                    />
                  )}
                  <div className="p-2">
                    <div className="text-xs font-medium text-gray-900 truncate">
                      {item.title || item.description || item.original_filename || 'Untitled'}
                    </div>
                    {item.tags && item.tags.length > 0 && (
                      <div className="text-[10px] text-gray-500 truncate mt-0.5">
                        {item.tags.slice(0, 3).join(', ')}
                      </div>
                    )}
                  </div>
                </button>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
