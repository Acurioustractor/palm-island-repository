'use client'

import { useEffect, useMemo, useState } from 'react'
import Link from 'next/link'
import { useRouter, useSearchParams } from 'next/navigation'
import {
  CheckCircle,
  ChevronDown,
  ExternalLink,
  Filter,
  Loader2,
  Quote as QuoteIcon,
  Search,
  Send,
  Star,
  User,
  X,
} from 'lucide-react'

type Profile = {
  id: string
  full_name: string
  preferred_name?: string | null
  profile_image_url?: string | null
  is_elder?: boolean | null
  storyteller_type?: string | null
}

type QuoteRow = {
  id: string
  quote_text: string
  attribution: string | null
  context?: string | null
  theme?: string | null
  sentiment?: string | null
  impact_area?: string | null
  is_validated: boolean
  suggested_for_report: boolean
  photo_url?: string | null
  profile_id?: string | null
  created_at: string
  profile?: Profile | null
}

type Project = { id: string; name: string; slug: string }

const THEMES = [
  'community',
  'services',
  'culture',
  'history',
  'achievement',
  'resilience',
  'youth',
  'elders',
  'innovation',
  'connection',
]

const SENTIMENTS = ['positive', 'neutral', 'negative', 'inspiring', 'reflective', 'grateful', 'hopeful', 'determined', 'proud']

const IMPACT_AREAS = [
  'community_wellbeing',
  'cultural_preservation',
  'youth_development',
  'employment',
  'health',
  'education',
  'housing',
  'environment',
]

const IMPORT_KEY = 'picc:story_builder_quote_import'

function displayName(p?: Profile | null) {
  if (!p) return ''
  return (p.preferred_name || p.full_name || '').trim()
}

export default function QuoteLibraryPage() {
  const router = useRouter()
  const searchParams = useSearchParams()

  const initialProfileId = (searchParams.get('profile_id') || '').trim()

  const [loading, setLoading] = useState(true)
  const [loadingMore, setLoadingMore] = useState(false)
  const [quotes, setQuotes] = useState<QuoteRow[]>([])
  const [offset, setOffset] = useState(0)
  const [hasMore, setHasMore] = useState(true)
  const [count, setCount] = useState<number | null>(null)

  const [q, setQ] = useState('')
  const [theme, setTheme] = useState('')
  const [sentiment, setSentiment] = useState('')
  const [impactArea, setImpactArea] = useState('')
  const [profileId, setProfileId] = useState(initialProfileId)
  const [validatedOnly, setValidatedOnly] = useState(false)
  const [suggestedOnly, setSuggestedOnly] = useState(false)

  const [profiles, setProfiles] = useState<Profile[]>([])
  const [profilesLoading, setProfilesLoading] = useState(false)

  const [selectedIds, setSelectedIds] = useState<Set<string>>(new Set())
  const selectedQuotes = useMemo(() => quotes.filter((q) => selectedIds.has(q.id)), [quotes, selectedIds])

  const [sendOpen, setSendOpen] = useState(false)
  const [projects, setProjects] = useState<Project[]>([])
  const [projectsLoading, setProjectsLoading] = useState(false)
  const [projectSearch, setProjectSearch] = useState('')
  const [targetProjectSlug, setTargetProjectSlug] = useState('')

  const loadProfiles = async () => {
    setProfilesLoading(true)
    try {
      const res = await fetch('/api/storytellers/list?limit=200')
      if (!res.ok) throw new Error('Failed to load storytellers')
      const data = await res.json()
      const list = Array.isArray(data?.storytellers) ? data.storytellers : Array.isArray(data?.profiles) ? data.profiles : []
      setProfiles(list)
    } catch {
      setProfiles([])
    } finally {
      setProfilesLoading(false)
    }
  }

  const fetchQuotes = async (opts?: { reset?: boolean }) => {
    const reset = opts?.reset === true
    if (reset) {
      setLoading(true)
      setQuotes([])
      setOffset(0)
      setHasMore(true)
      setCount(null)
      setSelectedIds(new Set())
    } else {
      setLoadingMore(true)
    }

    try {
      const params = new URLSearchParams()
      if (q.trim()) params.set('q', q.trim())
      if (theme) params.set('theme', theme)
      if (sentiment) params.set('sentiment', sentiment)
      if (impactArea) params.set('impact_area', impactArea)
      if (profileId) params.set('profile_id', profileId)
      if (validatedOnly) params.set('validated', 'true')
      if (suggestedOnly) params.set('suggested_for_report', 'true')
      params.set('limit', '24')
      params.set('offset', String(reset ? 0 : offset))

      const res = await fetch(`/api/quotes?${params.toString()}`)
      const data = await res.json()
      if (!res.ok) throw new Error(data?.error || 'Failed to load quotes')

      const next = Array.isArray(data?.quotes) ? (data.quotes as QuoteRow[]) : []
      setQuotes((prev) => (reset ? next : [...prev, ...next]))
      setOffset(Number(data?.nextOffset || (reset ? next.length : offset + next.length)))
      setHasMore(Boolean(data?.hasMore))
      setCount(typeof data?.count === 'number' ? data.count : null)
    } catch {
      if (reset) setQuotes([])
      setHasMore(false)
    } finally {
      setLoading(false)
      setLoadingMore(false)
    }
  }

  useEffect(() => {
    loadProfiles()
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  useEffect(() => {
    fetchQuotes({ reset: true })
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [theme, sentiment, impactArea, profileId, validatedOnly, suggestedOnly])

  const onSearchSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    fetchQuotes({ reset: true })
  }

  const toggleSelected = (id: string) => {
    setSelectedIds((prev) => {
      const next = new Set(prev)
      if (next.has(id)) next.delete(id)
      else next.add(id)
      return next
    })
  }

  const setQuotePatch = async (id: string, updates: any) => {
    const res = await fetch('/api/quotes', {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ id, updates }),
    })
    const data = await res.json()
    if (!res.ok) throw new Error(data?.error || 'Failed to update quote')
    const updated: QuoteRow = data.quote
    setQuotes((prev) => prev.map((q) => (q.id === id ? updated : q)))
  }

  const openSendModal = async () => {
    setSendOpen(true)
    if (projects.length > 0) return
    setProjectsLoading(true)
    try {
      const res = await fetch(`/api/projects/list?q=${encodeURIComponent(projectSearch)}&limit=60`)
      const data = await res.json()
      if (!res.ok) throw new Error(data?.error || 'Failed to load projects')
      setProjects(Array.isArray(data?.projects) ? data.projects : [])
    } catch {
      setProjects([])
    } finally {
      setProjectsLoading(false)
    }
  }

  const refreshProjects = async () => {
    setProjectsLoading(true)
    try {
      const res = await fetch(`/api/projects/list?q=${encodeURIComponent(projectSearch)}&limit=60`)
      const data = await res.json()
      if (!res.ok) throw new Error(data?.error || 'Failed to load projects')
      setProjects(Array.isArray(data?.projects) ? data.projects : [])
    } catch {
      setProjects([])
    } finally {
      setProjectsLoading(false)
    }
  }

  const sendToStoryBuilder = () => {
    if (!targetProjectSlug.trim()) return

    const payload = {
      projectSlug: targetProjectSlug.trim(),
      createdAt: new Date().toISOString(),
      quotes: selectedQuotes.map((q) => ({
        id: q.id,
        quote: q.quote_text,
        author: q.attribution || displayName(q.profile) || 'Community Member',
        profileId: q.profile_id || q.profile?.id || null,
        photoUrl: q.photo_url || q.profile?.profile_image_url || '',
        role: q.profile?.is_elder ? 'Elder' : q.profile?.storyteller_type || '',
        theme: q.theme || null,
        sentiment: q.sentiment || null,
        impact_area: q.impact_area || null,
      })),
    }

    localStorage.setItem(IMPORT_KEY, JSON.stringify(payload))
    router.push(`/picc/projects/${encodeURIComponent(payload.projectSlug)}/story-builder?import=quotes`)
  }

  const visibleCountText = useMemo(() => {
    if (count === null) return `${quotes.length} loaded`
    return `${quotes.length} of ${count}`
  }, [count, quotes.length])

  return (
    <div className="p-6 lg:p-8 max-w-7xl mx-auto space-y-6">
      <div className="flex flex-col md:flex-row md:items-end md:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Quote Library</h1>
          <p className="text-gray-600 mt-1">Find, validate, and insert quotes into immersive stories.</p>
        </div>

        <div className="flex items-center gap-2">
          <Link
            href="/picc/quotes"
            className="text-sm px-3 py-2 rounded-lg border bg-white hover:bg-gray-50 text-gray-700 inline-flex items-center gap-2"
          >
            <ExternalLink className="h-4 w-4" />
            Scraper Quotes
          </Link>

          <button
            disabled={selectedQuotes.length === 0}
            onClick={openSendModal}
            className="inline-flex items-center gap-2 px-4 py-2 rounded-lg bg-blue-600 text-white hover:bg-blue-700 disabled:opacity-50"
          >
            <Send className="h-4 w-4" />
            Send to Story Builder ({selectedQuotes.length})
          </button>
        </div>
      </div>

      {/* Filters */}
      <div className="bg-white border rounded-xl p-4 space-y-3">
        <form onSubmit={onSearchSubmit} className="flex flex-col md:flex-row gap-3">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
            <input
              value={q}
              onChange={(e) => setQ(e.target.value)}
              placeholder="Search quote text, attribution, context…"
              className="w-full pl-10 pr-4 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            />
          </div>
          <button
            type="submit"
            className="px-4 py-2 rounded-lg bg-gray-900 text-white hover:bg-gray-800"
          >
            Search
          </button>
        </form>

        <div className="flex flex-wrap items-center gap-3">
          <div className="relative">
            <select
              value={profileId}
              onChange={(e) => setProfileId(e.target.value)}
              className="appearance-none px-4 py-2 pr-10 border rounded-lg bg-white focus:ring-2 focus:ring-blue-500 min-w-[220px]"
            >
              <option value="">All storytellers</option>
              {profiles.map((p) => (
                <option key={p.id} value={p.id}>
                  {displayName(p) || p.id}
                </option>
              ))}
            </select>
            <ChevronDown className="absolute right-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400 pointer-events-none" />
          </div>

          <div className="relative">
            <select
              value={theme}
              onChange={(e) => setTheme(e.target.value)}
              className="appearance-none px-4 py-2 pr-10 border rounded-lg bg-white focus:ring-2 focus:ring-blue-500"
            >
              <option value="">All themes</option>
              {THEMES.map((t) => (
                <option key={t} value={t}>
                  {t}
                </option>
              ))}
            </select>
            <Filter className="absolute right-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400 pointer-events-none" />
          </div>

          <div className="relative">
            <select
              value={sentiment}
              onChange={(e) => setSentiment(e.target.value)}
              className="appearance-none px-4 py-2 pr-10 border rounded-lg bg-white focus:ring-2 focus:ring-blue-500"
            >
              <option value="">All sentiment</option>
              {SENTIMENTS.map((s) => (
                <option key={s} value={s}>
                  {s}
                </option>
              ))}
            </select>
            <ChevronDown className="absolute right-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400 pointer-events-none" />
          </div>

          <div className="relative">
            <select
              value={impactArea}
              onChange={(e) => setImpactArea(e.target.value)}
              className="appearance-none px-4 py-2 pr-10 border rounded-lg bg-white focus:ring-2 focus:ring-blue-500"
            >
              <option value="">All impact areas</option>
              {IMPACT_AREAS.map((a) => (
                <option key={a} value={a}>
                  {a}
                </option>
              ))}
            </select>
            <ChevronDown className="absolute right-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400 pointer-events-none" />
          </div>

          <label className="inline-flex items-center gap-2 text-sm text-gray-700 cursor-pointer">
            <input
              type="checkbox"
              checked={validatedOnly}
              onChange={(e) => setValidatedOnly(e.target.checked)}
              className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
            />
            Validated only
          </label>

          <label className="inline-flex items-center gap-2 text-sm text-gray-700 cursor-pointer">
            <input
              type="checkbox"
              checked={suggestedOnly}
              onChange={(e) => setSuggestedOnly(e.target.checked)}
              className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
            />
            Report-ready only
          </label>

          {profilesLoading && (
            <span className="inline-flex items-center gap-2 text-sm text-gray-500">
              <Loader2 className="h-4 w-4 animate-spin" />
              Loading storytellers…
            </span>
          )}

          <div className="ml-auto text-sm text-gray-500">{visibleCountText}</div>
        </div>
      </div>

      {/* Quotes list */}
      {loading ? (
        <div className="flex items-center justify-center min-h-[50vh]">
          <Loader2 className="h-8 w-8 animate-spin text-blue-600" />
        </div>
      ) : quotes.length === 0 ? (
        <div className="bg-white border rounded-xl p-10 text-center">
          <QuoteIcon className="h-12 w-12 text-gray-300 mx-auto mb-4" />
          <h2 className="text-lg font-semibold text-gray-900">No quotes found</h2>
          <p className="text-gray-500 mt-1">Try changing filters or running interview analysis to extract more quotes.</p>
        </div>
      ) : (
        <div className="grid gap-4 md:grid-cols-2">
          {quotes.map((quote) => {
            const selected = selectedIds.has(quote.id)
            const name = displayName(quote.profile) || quote.attribution || 'Community Member'
            const avatar = quote.profile?.profile_image_url || quote.photo_url || ''

            return (
              <div
                key={quote.id}
                className={`bg-white border rounded-xl p-5 hover:shadow-sm transition-shadow ${
                  selected ? 'ring-2 ring-blue-500' : ''
                }`}
              >
                <div className="flex items-start gap-3">
                  <input
                    type="checkbox"
                    checked={selected}
                    onChange={() => toggleSelected(quote.id)}
                    className="mt-1 rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                  />

                  <div className="flex-1">
                    <div className="relative">
                      <QuoteIcon className="absolute -top-2 -left-2 h-6 w-6 text-gray-200" />
                      <p className="text-gray-900 leading-relaxed pl-4">“{quote.quote_text}”</p>
                    </div>

                    <div className="mt-3 flex flex-wrap items-center gap-3 text-sm text-gray-600">
                      <span className="inline-flex items-center gap-2">
                        {avatar ? (
                          <img src={avatar} alt={name} className="h-7 w-7 rounded-full object-cover border" />
                        ) : (
                          <span className="h-7 w-7 rounded-full bg-gray-100 border flex items-center justify-center">
                            <User className="h-4 w-4 text-gray-400" />
                          </span>
                        )}
                        <span className="font-medium text-gray-800">{name}</span>
                        {quote.profile?.is_elder ? (
                          <span className="px-2 py-0.5 rounded-full bg-amber-100 text-amber-800 text-xs font-semibold">Elder</span>
                        ) : null}
                      </span>

                      {quote.theme ? (
                        <span className="px-2 py-0.5 rounded-full bg-blue-50 text-blue-700 text-xs font-semibold">{quote.theme}</span>
                      ) : null}
                      {quote.sentiment ? (
                        <span className="px-2 py-0.5 rounded-full bg-gray-100 text-gray-700 text-xs font-semibold">{quote.sentiment}</span>
                      ) : null}
                      {quote.impact_area ? (
                        <span className="px-2 py-0.5 rounded-full bg-emerald-50 text-emerald-700 text-xs font-semibold">{quote.impact_area}</span>
                      ) : null}
                    </div>

                    {quote.context ? <p className="mt-3 text-sm text-gray-600 line-clamp-2">{quote.context}</p> : null}

                    <div className="mt-4 flex items-center justify-between pt-4 border-t">
                      <div className="flex items-center gap-3">
                        <button
                          onClick={() =>
                            setQuotePatch(quote.id, {
                              is_validated: !quote.is_validated,
                              validated_at: !quote.is_validated ? new Date().toISOString() : null,
                            })
                          }
                          className={`inline-flex items-center gap-1 text-sm ${
                            quote.is_validated ? 'text-green-700' : 'text-gray-500 hover:text-green-700'
                          }`}
                        >
                          <CheckCircle className="h-4 w-4" />
                          {quote.is_validated ? 'Validated' : 'Validate'}
                        </button>

                        <button
                          onClick={() => setQuotePatch(quote.id, { suggested_for_report: !quote.suggested_for_report })}
                          className={`inline-flex items-center gap-1 text-sm ${
                            quote.suggested_for_report ? 'text-yellow-700' : 'text-gray-500 hover:text-yellow-700'
                          }`}
                        >
                          <Star className="h-4 w-4" />
                          {quote.suggested_for_report ? 'Report-ready' : 'Mark report-ready'}
                        </button>
                      </div>

                      {quote.profile_id ? (
                        <Link
                          href={`/picc/storytellers/${quote.profile_id}`}
                          className="text-sm text-blue-600 hover:text-blue-700 inline-flex items-center gap-1"
                        >
                          View storyteller <ExternalLink className="h-4 w-4" />
                        </Link>
                      ) : null}
                    </div>
                  </div>
                </div>
              </div>
            )
          })}
        </div>
      )}

      {/* Load more */}
      {!loading && quotes.length > 0 && (
        <div className="flex justify-center pt-2">
          <button
            disabled={!hasMore || loadingMore}
            onClick={() => fetchQuotes({ reset: false })}
            className="px-4 py-2 rounded-lg border bg-white hover:bg-gray-50 text-gray-700 disabled:opacity-50 inline-flex items-center gap-2"
          >
            {loadingMore ? <Loader2 className="h-4 w-4 animate-spin" /> : null}
            {hasMore ? 'Load more' : 'No more quotes'}
          </button>
        </div>
      )}

      {/* Send modal */}
      {sendOpen && (
        <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl w-full max-w-2xl overflow-hidden">
            <div className="p-5 border-b flex items-center justify-between">
              <div>
                <h2 className="text-lg font-bold text-gray-900">Send quotes to Story Builder</h2>
                <p className="text-sm text-gray-600 mt-0.5">{selectedQuotes.length} quotes selected</p>
              </div>
              <button onClick={() => setSendOpen(false)} className="p-2 rounded-lg hover:bg-gray-100">
                <X className="h-5 w-5 text-gray-500" />
              </button>
            </div>

            <div className="p-5 space-y-4">
              <div className="flex flex-col md:flex-row gap-3">
                <div className="flex-1">
                  <label className="text-sm font-medium text-gray-700">Choose project</label>
                  <div className="relative mt-1">
                    <input
                      value={projectSearch}
                      onChange={(e) => setProjectSearch(e.target.value)}
                      placeholder="Search projects…"
                      className="w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    />
                  </div>
                </div>
                <div className="flex items-end gap-2">
                  <button
                    onClick={refreshProjects}
                    className="px-3 py-2 rounded-lg border bg-white hover:bg-gray-50 text-gray-700"
                    disabled={projectsLoading}
                  >
                    {projectsLoading ? <Loader2 className="h-4 w-4 animate-spin" /> : 'Search'}
                  </button>
                </div>
              </div>

              <div className="border rounded-xl overflow-hidden">
                <div className="max-h-64 overflow-auto">
                  {projectsLoading ? (
                    <div className="p-6 flex items-center justify-center text-gray-600">
                      <Loader2 className="h-5 w-5 animate-spin mr-2" /> Loading projects…
                    </div>
                  ) : projects.length === 0 ? (
                    <div className="p-6 text-sm text-gray-600">No projects found.</div>
                  ) : (
                    <ul className="divide-y">
                      {projects.map((p) => (
                        <li key={p.id}>
                          <button
                            onClick={() => setTargetProjectSlug(p.slug)}
                            className={`w-full text-left px-4 py-3 hover:bg-gray-50 ${
                              targetProjectSlug === p.slug ? 'bg-blue-50' : ''
                            }`}
                          >
                            <div className="font-medium text-gray-900">{p.name}</div>
                            <div className="text-sm text-gray-600">{p.slug}</div>
                          </button>
                        </li>
                      ))}
                    </ul>
                  )}
                </div>
              </div>

              <div className="flex items-center justify-between pt-2">
                <div className="text-sm text-gray-600">
                  Destination: <span className="font-medium text-gray-900">{targetProjectSlug || 'Select a project'}</span>
                </div>
                <button
                  onClick={sendToStoryBuilder}
                  disabled={!targetProjectSlug || selectedQuotes.length === 0}
                  className="inline-flex items-center gap-2 px-4 py-2 rounded-lg bg-blue-600 text-white hover:bg-blue-700 disabled:opacity-50"
                >
                  <Send className="h-4 w-4" />
                  Open Story Builder
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}

