'use client'

import React, { useCallback, useEffect, useMemo, useRef, useState } from 'react'
import Link from 'next/link'
import { Bold, Italic, List, ListOrdered, Eye, Save, Send, Image as ImageIcon, Calendar } from 'lucide-react'

type UpdateType = 'progress' | 'milestone' | 'announcement' | 'media' | 'blog' | 'event' | 'other'

type SaveMode = 'draft' | 'publish' | 'schedule'

type ProjectUpdateEditorProps = {
  projectSlug: string
  projectName: string
}

const DRAFT_KEY_PREFIX = 'project-update-draft:'

function nowLocalInputValue() {
  const d = new Date()
  d.setMinutes(d.getMinutes() - d.getTimezoneOffset())
  return d.toISOString().slice(0, 16)
}

function stripHtmlToText(html: string) {
  return html
    .replace(/<script[\s\S]*?>[\s\S]*?<\/script>/gi, '')
    .replace(/<style[\s\S]*?>[\s\S]*?<\/style>/gi, '')
    .replace(/<[^>]+>/g, ' ')
    .replace(/\s+/g, ' ')
    .trim()
}

function insertHtmlAtCaret(html: string) {
  document.execCommand('insertHTML', false, html)
}

async function uploadImage(file: File) {
  const form = new FormData()
  form.append('file', file)
  form.append('tags', JSON.stringify(['project-update']))
  form.append('year', String(new Date().getFullYear()))
  form.append('description', '')
  form.append('collection', 'project-updates')
  form.append('enableAI', 'false')

  const res = await fetch('/api/media/upload', { method: 'POST', body: form })
  const json = await res.json()
  if (!res.ok) throw new Error(json?.error || json?.message || 'Upload failed')
  return json?.file?.public_url as string
}

export default function ProjectUpdateEditor({ projectSlug, projectName }: ProjectUpdateEditorProps) {
  const draftKey = `${DRAFT_KEY_PREFIX}${projectSlug}`

  const editorRef = useRef<HTMLDivElement | null>(null)
  const [updateId, setUpdateId] = useState<string | null>(null)
  const [title, setTitle] = useState('')
  const [updateType, setUpdateType] = useState<UpdateType>('progress')
  const [saveMode, setSaveMode] = useState<SaveMode>('draft')
  const [scheduledAt, setScheduledAt] = useState(nowLocalInputValue())
  const [saving, setSaving] = useState(false)
  const [autosaveStatus, setAutosaveStatus] = useState<'idle' | 'saving' | 'saved' | 'error'>('idle')
  const [showPreview, setShowPreview] = useState(false)
  const [uploadingImage, setUploadingImage] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [contentHtml, setContentHtmlState] = useState('')

  const getContentHtml = useCallback(() => contentHtml || editorRef.current?.innerHTML || '', [contentHtml])

  const setContentHtml = useCallback((html: string) => {
    if (editorRef.current) editorRef.current.innerHTML = html
    setContentHtmlState(html)
  }, [])

  const loadDraft = useCallback(() => {
    try {
      const raw = localStorage.getItem(draftKey)
      if (!raw) return
      const parsed = JSON.parse(raw)
      if (typeof parsed?.title === 'string') setTitle(parsed.title)
      if (typeof parsed?.updateType === 'string') setUpdateType(parsed.updateType)
      if (typeof parsed?.saveMode === 'string') setSaveMode(parsed.saveMode)
      if (typeof parsed?.scheduledAt === 'string') setScheduledAt(parsed.scheduledAt)
      if (typeof parsed?.contentHtml === 'string') setContentHtml(parsed.contentHtml)
      if (typeof parsed?.updateId === 'string') setUpdateId(parsed.updateId)
    } catch {}
  }, [draftKey, setContentHtml])

  useEffect(() => {
    loadDraft()
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [projectSlug])

  const format = useCallback((command: string) => {
    editorRef.current?.focus()
    document.execCommand(command, false)
  }, [])

  const handleDrop = useCallback(async (e: React.DragEvent) => {
    e.preventDefault()
    setError(null)

    const files = Array.from(e.dataTransfer.files || [])
    const images = files.filter((f) => f.type.startsWith('image/'))
    if (images.length === 0) return

    try {
      setUploadingImage(true)
      for (const file of images.slice(0, 3)) {
        const url = await uploadImage(file)
        editorRef.current?.focus()
        insertHtmlAtCaret(`<p><img src="${url}" alt="" style="max-width:100%;border-radius:12px" /></p>`)
      }
      setContentHtmlState(editorRef.current?.innerHTML || '')
    } catch (err: any) {
      setError(err?.message || 'Failed to embed image')
    } finally {
      setUploadingImage(false)
    }
  }, [])

  const persistLocalDraft = useCallback(() => {
    const payload = {
      updateId,
      title,
      updateType,
      saveMode,
      scheduledAt,
      contentHtml: getContentHtml(),
      savedAt: new Date().toISOString(),
    }
    localStorage.setItem(draftKey, JSON.stringify(payload))
  }, [draftKey, getContentHtml, saveMode, scheduledAt, title, updateId, updateType])

  const saveToServer = useCallback(
    async (mode: SaveMode, explicit: boolean) => {
      setError(null)
      if (!title.trim()) {
        if (explicit) setError('Please add a title')
        return
      }

      const html = getContentHtml().trim()
      if (!html) {
        if (explicit) setError('Please write some content')
        return
      }

      const excerpt = stripHtmlToText(html).slice(0, 240)

      const isPublished = mode === 'publish' || mode === 'schedule'
      const publishedAt =
        mode === 'schedule' && scheduledAt ? new Date(scheduledAt).toISOString() : undefined

      const res = await fetch('/api/project-updates', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          updateId,
          projectSlug,
          title,
          contentHtml: html,
          excerpt,
          updateType,
          isPublished,
          publishedAt,
        }),
      })
      const json = await res.json()
      if (!res.ok) throw new Error(json?.error || 'Failed to save update')

      if (json?.updateId) setUpdateId(json.updateId)
    },
    [getContentHtml, projectSlug, scheduledAt, title, updateId, updateType]
  )

  useEffect(() => {
    const handle = window.setTimeout(() => {
      persistLocalDraft()
    }, 800)
    return () => window.clearTimeout(handle)
  }, [persistLocalDraft, title, updateType, saveMode, scheduledAt, contentHtml])

  useEffect(() => {
    const handle = window.setTimeout(async () => {
      const html = getContentHtml().trim()
      if (!title.trim() && !html) {
        setAutosaveStatus('idle')
        return
      }
      if (!title.trim() || !html) {
        setAutosaveStatus('idle')
        return
      }

      try {
        setAutosaveStatus('saving')
        await saveToServer('draft', false)
        setAutosaveStatus('saved')
      } catch {
        setAutosaveStatus('error')
      }
    }, 5000)
    return () => window.clearTimeout(handle)
  }, [getContentHtml, saveToServer, scheduledAt, title, updateType, contentHtml])

  const handleExplicitSaveDraft = useCallback(async () => {
    setSaving(true)
    try {
      await saveToServer('draft', true)
      setAutosaveStatus('saved')
    } catch (err: any) {
      setError(err?.message || 'Failed to save draft')
    } finally {
      setSaving(false)
    }
  }, [saveToServer])

  const handlePublish = useCallback(async () => {
    setSaving(true)
    try {
      await saveToServer(saveMode === 'schedule' ? 'schedule' : 'publish', true)
      localStorage.removeItem(draftKey)
      setAutosaveStatus('saved')
      window.location.href = `/picc/projects/${projectSlug}`
    } catch (err: any) {
      setError(err?.message || 'Failed to publish')
    } finally {
      setSaving(false)
    }
  }, [draftKey, projectSlug, saveMode, saveToServer])

  const previewHtml = useMemo(() => {
    const html = getContentHtml()
    return html || '<p class="text-gray-500">No content yet.</p>'
  }, [getContentHtml, contentHtml])

  return (
    <div className="bg-white rounded-xl shadow-md border border-gray-200 p-6">
      <div className="flex items-start justify-between gap-6 flex-wrap mb-6">
        <div>
          <h2 className="text-xl font-bold text-gray-900 mb-1">Write Update</h2>
          <p className="text-sm text-gray-600">
            Rich text editor with drag-and-drop image embeds, autosave drafts, preview, and scheduled publishing.
          </p>
        </div>
        <div className="text-xs text-gray-600">
          {autosaveStatus === 'saving' && <span className="inline-flex items-center gap-2"><span className="w-2 h-2 rounded-full bg-blue-500" />Autosaving…</span>}
          {autosaveStatus === 'saved' && <span className="inline-flex items-center gap-2"><span className="w-2 h-2 rounded-full bg-green-500" />Saved</span>}
          {autosaveStatus === 'error' && <span className="inline-flex items-center gap-2"><span className="w-2 h-2 rounded-full bg-red-500" />Autosave failed</span>}
        </div>
      </div>

      {error && (
        <div className="mb-4 p-3 bg-red-50 border border-red-200 rounded-lg text-sm text-red-700">
          {error}
        </div>
      )}

      <div className="grid lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2 space-y-4">
          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-2">Title</label>
            <input
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-transparent"
              placeholder={`e.g., Elders Trip Highlights (${projectName})`}
            />
          </div>

          <div className="flex flex-wrap items-center gap-2 border border-gray-200 rounded-lg p-2 bg-gray-50">
            <button
              type="button"
              className="px-3 py-2 rounded-lg hover:bg-white border border-transparent hover:border-gray-200 flex items-center gap-2 text-sm"
              onClick={() => format('bold')}
              title="Bold"
            >
              <Bold className="w-4 h-4" />
              <span className="hidden sm:inline">Bold</span>
            </button>
            <button
              type="button"
              className="px-3 py-2 rounded-lg hover:bg-white border border-transparent hover:border-gray-200 flex items-center gap-2 text-sm"
              onClick={() => format('italic')}
              title="Italic"
            >
              <Italic className="w-4 h-4" />
              <span className="hidden sm:inline">Italic</span>
            </button>
            <button
              type="button"
              className="px-3 py-2 rounded-lg hover:bg-white border border-transparent hover:border-gray-200 flex items-center gap-2 text-sm"
              onClick={() => format('insertUnorderedList')}
              title="Bulleted list"
            >
              <List className="w-4 h-4" />
              <span className="hidden sm:inline">List</span>
            </button>
            <button
              type="button"
              className="px-3 py-2 rounded-lg hover:bg-white border border-transparent hover:border-gray-200 flex items-center gap-2 text-sm"
              onClick={() => format('insertOrderedList')}
              title="Numbered list"
            >
              <ListOrdered className="w-4 h-4" />
              <span className="hidden sm:inline">Numbered</span>
            </button>

            <div className="flex-1" />

            <button
              type="button"
              className="px-3 py-2 rounded-lg hover:bg-white border border-transparent hover:border-gray-200 flex items-center gap-2 text-sm"
              onClick={() => setShowPreview(true)}
              title="Preview"
            >
              <Eye className="w-4 h-4" />
              <span className="hidden sm:inline">Preview</span>
            </button>
          </div>

          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-2">
              Content
              <span className="ml-2 text-xs text-gray-500 font-normal">
                Tip: drag images into the editor to embed them.
              </span>
            </label>
            <div
              ref={editorRef}
              contentEditable
              suppressContentEditableWarning
              onDrop={handleDrop}
              onDragOver={(e) => e.preventDefault()}
              onInput={() => setContentHtmlState(editorRef.current?.innerHTML || '')}
              className="min-h-[320px] w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-orange-500 focus:border-transparent prose prose-sm max-w-none"
              style={{ whiteSpace: 'pre-wrap' }}
            />
            {uploadingImage && (
              <div className="mt-2 text-sm text-gray-600 flex items-center gap-2">
                <ImageIcon className="w-4 h-4" />
                Uploading image…
              </div>
            )}
          </div>
        </div>

        <div className="space-y-4">
          <div className="bg-gray-50 border border-gray-200 rounded-xl p-4">
            <h3 className="font-bold text-gray-900 mb-3">Settings</h3>

            <label className="block text-sm font-semibold text-gray-700 mb-2">Update Type</label>
            <select
              value={updateType}
              onChange={(e) => setUpdateType(e.target.value as UpdateType)}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg bg-white"
            >
              <option value="progress">Progress</option>
              <option value="milestone">Milestone</option>
              <option value="announcement">Announcement</option>
              <option value="media">Media</option>
              <option value="blog">Blog</option>
              <option value="event">Event</option>
              <option value="other">Other</option>
            </select>

            <div className="mt-4">
              <label className="block text-sm font-semibold text-gray-700 mb-2">Publishing</label>
              <div className="space-y-2">
                <label className="flex items-center gap-2 text-sm text-gray-700">
                  <input
                    type="radio"
                    name="publishMode"
                    value="draft"
                    checked={saveMode === 'draft'}
                    onChange={() => setSaveMode('draft')}
                  />
                  Draft (auto-saved)
                </label>
                <label className="flex items-center gap-2 text-sm text-gray-700">
                  <input
                    type="radio"
                    name="publishMode"
                    value="publish"
                    checked={saveMode === 'publish'}
                    onChange={() => setSaveMode('publish')}
                  />
                  Publish now
                </label>
                <label className="flex items-center gap-2 text-sm text-gray-700">
                  <input
                    type="radio"
                    name="publishMode"
                    value="schedule"
                    checked={saveMode === 'schedule'}
                    onChange={() => setSaveMode('schedule')}
                  />
                  Schedule
                </label>

                {saveMode === 'schedule' && (
                  <div className="mt-2">
                    <div className="flex items-center gap-2 text-sm text-gray-700 mb-2">
                      <Calendar className="w-4 h-4" />
                      <span>Publish date/time</span>
                    </div>
                    <input
                      type="datetime-local"
                      value={scheduledAt}
                      onChange={(e) => setScheduledAt(e.target.value)}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg bg-white"
                    />
                    <p className="mt-2 text-xs text-gray-500">
                      Scheduled posts won’t appear on the project page until this time.
                    </p>
                  </div>
                )}
              </div>
            </div>
          </div>

          <div className="flex flex-col gap-2">
            <button
              type="button"
              disabled={saving}
              onClick={handleExplicitSaveDraft}
              className="w-full px-4 py-2 bg-white hover:bg-gray-50 border border-gray-300 text-gray-800 font-semibold rounded-lg transition-all flex items-center justify-center gap-2 disabled:opacity-50"
            >
              <Save className="w-4 h-4" />
              <span>Save Draft</span>
            </button>

            <button
              type="button"
              disabled={saving}
              onClick={handlePublish}
              className="w-full px-4 py-2 bg-orange-600 hover:bg-orange-700 text-white font-semibold rounded-lg transition-all flex items-center justify-center gap-2 disabled:opacity-50"
            >
              <Send className="w-4 h-4" />
              <span>{saveMode === 'schedule' ? 'Schedule' : 'Publish'}</span>
            </button>

            <Link
              href={`/picc/projects/${projectSlug}`}
              className="w-full px-4 py-2 text-center text-sm text-gray-600 hover:text-gray-900"
            >
              Cancel
            </Link>
          </div>
        </div>
      </div>

      {showPreview && (
        <div className="fixed inset-0 z-50 bg-black/50 flex items-center justify-center p-6">
          <div className="bg-white rounded-xl shadow-2xl max-w-4xl w-full max-h-[85vh] overflow-hidden border border-gray-200">
            <div className="p-4 border-b border-gray-200 flex items-center justify-between">
              <div>
                <div className="font-bold text-gray-900">Preview</div>
                <div className="text-xs text-gray-600">{title || 'Untitled update'}</div>
              </div>
              <button
                type="button"
                onClick={() => setShowPreview(false)}
                className="px-3 py-1.5 bg-gray-100 hover:bg-gray-200 text-gray-800 rounded-lg text-sm"
              >
                Close
              </button>
            </div>
            <div className="p-6 overflow-y-auto max-h-[calc(85vh-56px)]">
              <div className="prose max-w-none" dangerouslySetInnerHTML={{ __html: previewHtml }} />
            </div>
          </div>
        </div>
      )}

      <details className="mt-6">
        <summary className="cursor-pointer text-sm text-gray-600 hover:text-gray-900">
          Need SQL instead?
        </summary>
        <div className="mt-3 p-4 bg-gray-900 rounded-lg overflow-x-auto">
          <pre className="text-xs text-green-400 font-mono whitespace-pre-wrap">
{`-- Insert a project update (manual)
-- Find project_id via: SELECT id FROM projects WHERE slug = '${projectSlug}';

INSERT INTO project_updates (
  project_id, author_id, title, content, excerpt, update_type, is_published, published_at, created_at
) VALUES (
  '<PROJECT_ID>',
  '<AUTHOR_PROFILE_ID>',
  'Update title',
  'Update content',
  'Short summary',
  'progress',
  TRUE,
  NOW(),
  NOW()
);`}
          </pre>
        </div>
      </details>
    </div>
  )
}
