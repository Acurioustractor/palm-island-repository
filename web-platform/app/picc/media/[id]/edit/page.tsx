'use client'

import { useEffect, useMemo, useState } from 'react'
import Link from 'next/link'
import { useParams, useRouter } from 'next/navigation'
import { ArrowLeft, CheckCircle2, Loader2, Save, XCircle } from 'lucide-react'

type MediaRecord = {
  id: string
  public_url: string
  original_filename: string
  title?: string | null
  caption?: string | null
  description?: string | null
  alt_text?: string | null
  tags?: string[] | null
  location?: string | null
  page_context?: string | null
  page_section?: string | null
  usage_context?: string | null
  is_public?: boolean | null
  is_featured?: boolean | null
  display_order?: number | null
  metadata?: Record<string, any> | null
  context_metadata?: Record<string, any> | null
}

type Taxonomy = {
  services: Array<{ id: string; service_name: string; service_slug: string; service_category: string }>
  projects: Array<{ id: string; name: string; slug: string; project_type: string | null; status: string | null }>
}

export default function MediaEditPage() {
  const params = useParams<{ id: string }>()
  const router = useRouter()
  const mediaId = params.id

  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [saved, setSaved] = useState(false)

  const [media, setMedia] = useState<MediaRecord | null>(null)
  const [taxonomy, setTaxonomy] = useState<Taxonomy>({ services: [], projects: [] })
  const [form, setForm] = useState({
    title: '',
    caption: '',
    description: '',
    alt_text: '',
    tags: '',
    location: '',
    page_context: '',
    page_section: '',
    usage_context: '',
    annual_report_fiscal_year: '',
    annual_report: false,
    service_slug: '',
    project_slug: '',
    is_public: true,
    is_featured: false,
    display_order: '',
  })

  const placementHint = useMemo(() => {
    if (form.page_context === 'home' && form.page_section === 'quotes') {
      return 'This will become the homepage quote background image.'
    }
    if (form.page_context === 'home' && form.page_section === 'hero') {
      return 'This will become the homepage hero image (if featured).'
    }
    return null
  }, [form.page_context, form.page_section])

  useEffect(() => {
    let cancelled = false

    async function load() {
      try {
        setLoading(true)
        setError(null)
        const [res, taxonomyRes] = await Promise.all([
          fetch(`/api/media/${mediaId}`, { cache: 'no-store' }),
          fetch('/api/media/taxonomy', { cache: 'no-store' }),
        ])

        const json = await res.json().catch(() => ({}))
        const taxonomyJson = await taxonomyRes.json().catch(() => ({}))
        if (!res.ok) throw new Error(json?.error || 'Failed to load media')
        if (taxonomyRes.ok) {
          setTaxonomy({ services: taxonomyJson.services || [], projects: taxonomyJson.projects || [] })
        }
        if (cancelled) return

        const record = json.media as MediaRecord
        setMedia(record)
        const fiscalYear = String(record.metadata?.fiscal_year || '')
        const tags = record.tags || []
        const serviceSlug = String(record.context_metadata?.service_slug || '')
        const projectSlug = String(record.context_metadata?.project_slug || '')
        setForm({
          title: record.title || '',
          caption: record.caption || '',
          description: record.description || '',
          alt_text: record.alt_text || '',
          tags: tags.join(', '),
          location: record.location || '',
          page_context: record.page_context || '',
          page_section: record.page_section || '',
          usage_context: record.usage_context || '',
          annual_report_fiscal_year: fiscalYear,
          annual_report: tags.includes('annual-report'),
          service_slug: serviceSlug,
          project_slug: projectSlug,
          is_public: record.is_public ?? true,
          is_featured: record.is_featured ?? false,
          display_order: record.display_order == null ? '' : String(record.display_order),
        })
      } catch (e: any) {
        if (!cancelled) setError(e?.message || 'Failed to load')
      } finally {
        if (!cancelled) setLoading(false)
      }
    }

    load()
    return () => {
      cancelled = true
    }
  }, [mediaId])

  const save = async () => {
    try {
      setSaving(true)
      setSaved(false)
      setError(null)

      const rawTags = form.tags
        ? form.tags
            .split(',')
            .map((t) => t.trim())
            .filter(Boolean)
        : []

      const sanitized = rawTags.filter(
        (t) => !t.startsWith('service:') && !t.startsWith('project:') && !t.startsWith('fy:')
      )

      if (form.annual_report) sanitized.push('annual-report')
      if (form.service_slug) sanitized.push(`service:${form.service_slug}`)
      if (form.project_slug) sanitized.push(`project:${form.project_slug}`)
      if (form.annual_report_fiscal_year) sanitized.push(`fy:${form.annual_report_fiscal_year}`)

      const finalTags = Array.from(new Set(sanitized))

      const payload = {
        title: form.title || null,
        caption: form.caption || null,
        description: form.description || null,
        alt_text: form.alt_text || null,
        tags: finalTags,
        location: form.location || null,
        page_context: form.page_context || null,
        page_section: form.page_section || null,
        usage_context: form.usage_context || null,
        is_public: form.is_public,
        is_featured: form.is_featured,
        display_order: form.display_order === '' ? null : Number(form.display_order),
        context_metadata: {
          ...(media?.context_metadata || {}),
          ...(form.service_slug ? { service_slug: form.service_slug } : {}),
          ...(form.project_slug ? { project_slug: form.project_slug } : {}),
        },
        metadata: {
          ...(media?.metadata || {}),
          ...(form.annual_report_fiscal_year ? { fiscal_year: form.annual_report_fiscal_year } : {}),
        },
      }

      const res = await fetch(`/api/media/${mediaId}`, {
        method: 'PATCH',
        headers: { 'content-type': 'application/json' },
        body: JSON.stringify(payload),
      })
      const json = await res.json().catch(() => ({}))
      if (!res.ok) throw new Error(json?.error || 'Failed to save')

      setMedia(json.media as MediaRecord)
      setSaved(true)
    } catch (e: any) {
      setError(e?.message || 'Failed to save')
    } finally {
      setSaving(false)
    }
  }

  if (loading) {
    return (
      <div className="p-8 max-w-5xl mx-auto">
        <div className="flex items-center gap-2 text-gray-600">
          <Loader2 className="w-5 h-5 animate-spin" />
          Loading media…
        </div>
      </div>
    )
  }

  if (!media) {
    return (
      <div className="p-8 max-w-5xl mx-auto">
        <div className="mb-4">
          <Link href="/picc/media/gallery" className="inline-flex items-center gap-2 text-sm text-gray-600 hover:text-gray-900">
            <ArrowLeft className="w-4 h-4" />
            Back to Gallery
          </Link>
        </div>
        <div className="bg-red-50 border border-red-200 rounded-xl p-4 text-red-800">
          {error || 'Media not found'}
        </div>
      </div>
    )
  }

  return (
    <div className="p-8 max-w-5xl mx-auto">
      <div className="mb-6 flex items-center justify-between">
        <Link href="/picc/media/gallery" className="inline-flex items-center gap-2 text-sm text-gray-600 hover:text-gray-900">
          <ArrowLeft className="w-4 h-4" />
          Back to Gallery
        </Link>
        <button
          onClick={() => router.back()}
          className="text-sm text-gray-600 hover:text-gray-900"
        >
          Close
        </button>
      </div>

      <div className="bg-white rounded-xl border border-gray-200 shadow-sm overflow-hidden">
        <div className="p-6 border-b border-gray-200">
          <div className="flex items-start gap-4">
            <img
              src={media.public_url}
              alt={media.alt_text || 'Media'}
              className="w-36 h-24 object-cover rounded-lg border border-gray-200"
            />
            <div className="flex-1">
              <h1 className="text-2xl font-bold text-gray-900">Edit Media</h1>
              <p className="text-sm text-gray-600 mt-1">{media.original_filename}</p>
              <p className="text-xs text-gray-500 mt-1 font-mono">ID: {media.id}</p>
            </div>
          </div>
        </div>

        <div className="p-6 space-y-5">
          {error && (
            <div className="flex items-center gap-2 bg-red-50 border border-red-200 rounded-lg px-4 py-3 text-red-700">
              <XCircle className="w-4 h-4" />
              <span className="text-sm">{error}</span>
            </div>
          )}

          {saved && (
            <div className="flex items-center gap-2 bg-green-50 border border-green-200 rounded-lg px-4 py-3 text-green-700">
              <CheckCircle2 className="w-4 h-4" />
              <span className="text-sm">Saved</span>
            </div>
          )}

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Title</label>
              <input
                value={form.title}
                onChange={(e) => setForm((p) => ({ ...p, title: e.target.value }))}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Caption</label>
              <input
                value={form.caption}
                onChange={(e) => setForm((p) => ({ ...p, caption: e.target.value }))}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg"
                placeholder="Optional caption shown in galleries"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Alt Text</label>
              <input
                value={form.alt_text}
                onChange={(e) => setForm((p) => ({ ...p, alt_text: e.target.value }))}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg"
                placeholder="Describe the image for accessibility"
              />
            </div>
            <div className="md:col-span-2">
              <label className="block text-sm font-medium text-gray-700 mb-2">Description</label>
              <textarea
                value={form.description}
                onChange={(e) => setForm((p) => ({ ...p, description: e.target.value }))}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg"
                rows={3}
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Tags (comma-separated)</label>
              <input
                value={form.tags}
                onChange={(e) => setForm((p) => ({ ...p, tags: e.target.value }))}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg"
                placeholder="home, quotes, ceo, rachel"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Location</label>
              <input
                value={form.location}
                onChange={(e) => setForm((p) => ({ ...p, location: e.target.value }))}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg"
              />
            </div>
          </div>

            <div className="border-t border-gray-200 pt-5">
              <h2 className="text-lg font-semibold text-gray-900 mb-3">Placement (Public Pages)</h2>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Page Context</label>
                <select
                  value={form.page_context}
                  onChange={(e) => setForm((p) => ({ ...p, page_context: e.target.value }))}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg bg-white"
                >
                  <option value="">(none)</option>
                  <option value="home">home</option>
                  <option value="about">about</option>
                  <option value="stories">stories</option>
                  <option value="impact">impact</option>
                  <option value="annual-report">annual-report</option>
                </select>
              </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Page Section</label>
                  <input
                    value={form.page_section}
                    onChange={(e) => setForm((p) => ({ ...p, page_section: e.target.value }))}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg"
                    placeholder="hero, quotes, features, gallery…"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Display Order</label>
                  <input
                    value={form.display_order}
                    onChange={(e) => setForm((p) => ({ ...p, display_order: e.target.value }))}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg"
                    placeholder="1"
                    inputMode="numeric"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Usage Context</label>
                  <input
                    value={form.usage_context}
                    onChange={(e) => setForm((p) => ({ ...p, usage_context: e.target.value }))}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg"
                    placeholder="story_hero, report_hero, gallery…"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Fiscal Year</label>
                  <input
                    value={form.annual_report_fiscal_year}
                    onChange={(e) => setForm((p) => ({ ...p, annual_report_fiscal_year: e.target.value }))}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg"
                    placeholder="2024-25"
                  />
                  <p className="text-xs text-gray-500 mt-1">
                    Stored as <span className="font-mono">metadata.fiscal_year</span> and tag <span className="font-mono">fy:YYYY-YY</span>.
                  </p>
                </div>
              </div>

              <div className="mt-4 flex flex-col gap-2">
                <label className="inline-flex items-center gap-2 text-sm text-gray-800">
                  <input
                    type="checkbox"
                    checked={form.annual_report}
                    onChange={(e) => setForm((p) => ({ ...p, annual_report: e.target.checked }))}
                  />
                  Annual report media (adds tag <span className="font-mono">annual-report</span>)
                </label>
                <label className="inline-flex items-center gap-2 text-sm text-gray-800">
                  <input
                    type="checkbox"
                    checked={form.is_public}
                  onChange={(e) => setForm((p) => ({ ...p, is_public: e.target.checked }))}
                />
                Public (can be used on public pages)
              </label>
              <label className="inline-flex items-center gap-2 text-sm text-gray-800">
                <input
                  type="checkbox"
                  checked={form.is_featured}
                  onChange={(e) => setForm((p) => ({ ...p, is_featured: e.target.checked }))}
                />
                Featured (preferred pick for hero backgrounds)
              </label>
              {placementHint && <div className="text-xs text-gray-600">{placementHint}</div>}
            </div>
          </div>

          <div className="border-t border-gray-200 pt-5">
            <h2 className="text-lg font-semibold text-gray-900 mb-3">Linking (Services & Projects)</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Service</label>
                <select
                  value={form.service_slug}
                  onChange={(e) => setForm((p) => ({ ...p, service_slug: e.target.value }))}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg bg-white"
                >
                  <option value="">(none)</option>
                  {taxonomy.services.map((s) => (
                    <option key={s.id} value={s.service_slug}>
                      {s.service_name}
                    </option>
                  ))}
                </select>
                <p className="text-xs text-gray-500 mt-1">Adds tag <span className="font-mono">service:slug</span>.</p>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Innovation Project</label>
                <select
                  value={form.project_slug}
                  onChange={(e) => setForm((p) => ({ ...p, project_slug: e.target.value }))}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg bg-white"
                >
                  <option value="">(none)</option>
                  {taxonomy.projects.map((p) => (
                    <option key={p.id} value={p.slug}>
                      {p.name}
                    </option>
                  ))}
                </select>
                <p className="text-xs text-gray-500 mt-1">Adds tag <span className="font-mono">project:slug</span>.</p>
              </div>
            </div>
          </div>
        </div>

        <div className="p-6 border-t border-gray-200 flex items-center justify-end gap-3">
          <Link
            href="/picc/media/gallery"
            className="px-4 py-2 rounded-lg border border-gray-300 text-gray-700 hover:bg-gray-50"
          >
            Cancel
          </Link>
          <button
            onClick={save}
            disabled={saving}
            className="inline-flex items-center gap-2 px-5 py-2.5 rounded-lg bg-blue-600 text-white hover:bg-blue-700 disabled:opacity-60"
          >
            {saving ? <Loader2 className="w-4 h-4 animate-spin" /> : <Save className="w-4 h-4" />}
            Save
          </button>
        </div>
      </div>
    </div>
  )
}
