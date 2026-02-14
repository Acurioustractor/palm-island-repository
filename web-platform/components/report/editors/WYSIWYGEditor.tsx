'use client'

import { useState, useCallback, ReactNode } from 'react'
import {
  X, Save, Plus, FileText, Image as ImageIcon, Film, BarChart3, Quote,
  User, Users, Calendar, Award, Layout, Loader2, Check, AlertCircle, Edit3
} from 'lucide-react'
import ImagePicker, { MediaItem } from './ImagePicker'

// Section type definitions
const SECTION_TYPES = [
  { id: 'text', label: 'Text Section', icon: FileText },
  { id: 'hero_image', label: 'Hero Image', icon: ImageIcon },
  { id: 'photo_gallery', label: 'Photo Gallery', icon: ImageIcon },
  { id: 'video', label: 'Video Embed', icon: Film },
  { id: 'stats_bar', label: 'Stats Bar', icon: BarChart3 },
  { id: 'quote', label: 'Featured Quote', icon: Quote },
  { id: 'leadership_message', label: 'Leadership Message', icon: User },
  { id: 'community_voices', label: 'Community Voices', icon: Users },
  { id: 'timeline', label: 'Timeline', icon: Calendar },
  { id: 'project_showcase', label: 'Projects', icon: Award },
  { id: 'divider', label: 'Divider', icon: Layout },
] as const

type SectionType = typeof SECTION_TYPES[number]['id']

interface EditableData {
  [key: string]: any
}

interface WYSIWYGEditorProps {
  reportId: string
  reportYear: number
  fiscalYear: string
  isEditMode: boolean
  children: ReactNode
  onRefresh?: () => void
}

export default function WYSIWYGEditor({
  reportId,
  reportYear,
  fiscalYear,
  isEditMode,
  children,
  onRefresh,
}: WYSIWYGEditorProps) {
  // Editor state
  const [activeEditor, setActiveEditor] = useState<{
    type: 'text' | 'quote' | 'leadership' | 'stats' | 'video' | 'image' | 'gallery'
    sectionId: string
    data: EditableData
  } | null>(null)

  const [saving, setSaving] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [toast, setToast] = useState<{ type: 'success' | 'error'; message: string } | null>(null)
  const [addSectionOpen, setAddSectionOpen] = useState(false)

  // Image picker
  const [imagePicker, setImagePicker] = useState<{
    open: boolean
    field: string
    title: string
  }>({ open: false, field: '', title: 'Select Image' })

  const showToast = useCallback((type: 'success' | 'error', message: string) => {
    setToast({ type, message })
    setTimeout(() => setToast(null), 3000)
  }, [])

  const closeEditor = useCallback(() => {
    setActiveEditor(null)
    setError(null)
  }, [])

  const updateData = useCallback((field: string, value: any) => {
    setActiveEditor(prev => prev ? {
      ...prev,
      data: { ...prev.data, [field]: value }
    } : null)
  }, [])

  const saveChanges = useCallback(async () => {
    if (!activeEditor) return

    setSaving(true)
    setError(null)

    try {
      const res = await fetch(`/api/annual-reports/${reportId}/sections`, {
        method: 'PATCH',
        headers: { 'content-type': 'application/json' },
        body: JSON.stringify({
          sectionId: activeEditor.sectionId,
          updates: activeEditor.data,
          reportYear,
          fiscalYear,
        }),
      })

      const json = await res.json().catch(() => ({}))
      if (!res.ok) throw new Error(json?.error || 'Failed to save')

      showToast('success', 'Saved!')
      closeEditor()
      onRefresh?.()
    } catch (e: any) {
      setError(e?.message || 'Failed to save')
    } finally {
      setSaving(false)
    }
  }, [activeEditor, reportId, reportYear, fiscalYear, closeEditor, onRefresh, showToast])

  const addSection = useCallback(async (type: SectionType) => {
    setSaving(true)
    setAddSectionOpen(false)

    try {
      const sectionInfo = SECTION_TYPES.find(t => t.id === type)
      const res = await fetch(`/api/annual-reports/${reportId}/sections`, {
        method: 'POST',
        headers: { 'content-type': 'application/json' },
        body: JSON.stringify({
          section_type: type,
          section_title: sectionInfo?.label || 'New Section',
          section_content: '',
          reportYear,
          fiscalYear,
        }),
      })

      const json = await res.json().catch(() => ({}))
      if (!res.ok) throw new Error(json?.error || 'Failed to add')

      showToast('success', 'Section added!')
      onRefresh?.()
    } catch (e: any) {
      showToast('error', e?.message || 'Failed to add section')
    } finally {
      setSaving(false)
    }
  }, [reportId, reportYear, fiscalYear, onRefresh, showToast])

  const handleImageSelect = useCallback((media: MediaItem) => {
    if (imagePicker.field) {
      updateData(imagePicker.field, media.public_url)
    }
    setImagePicker({ open: false, field: '', title: 'Select Image' })
  }, [imagePicker.field, updateData])

  if (!isEditMode) {
    return <>{children}</>
  }

  // Render different editor panels based on type
  const renderEditor = () => {
    if (!activeEditor) return null

    const { type, data } = activeEditor

    switch (type) {
      case 'text':
        return (
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Title</label>
              <input
                value={data.title || ''}
                onChange={(e) => updateData('title', e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-picc-ochre"
                placeholder="Section title"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Content</label>
              <textarea
                value={data.content || ''}
                onChange={(e) => updateData('content', e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-picc-ochre min-h-[200px]"
                placeholder="Enter content..."
              />
            </div>
          </div>
        )

      case 'quote':
        return (
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Quote</label>
              <textarea
                value={data.quote || ''}
                onChange={(e) => updateData('quote', e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-picc-ochre min-h-[100px]"
                placeholder="The quote text..."
              />
            </div>
            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Author</label>
                <input
                  value={data.author || ''}
                  onChange={(e) => updateData('author', e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg"
                  placeholder="Person's name"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Role</label>
                <input
                  value={data.role || ''}
                  onChange={(e) => updateData('role', e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg"
                  placeholder="Community Elder"
                />
              </div>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Photo</label>
              <div className="flex items-center gap-3">
                {data.imageUrl ? (
                  <img src={data.imageUrl} alt="" className="w-16 h-16 object-cover rounded-lg" />
                ) : (
                  <div className="w-16 h-16 bg-gray-100 rounded-lg flex items-center justify-center">
                    <ImageIcon className="w-6 h-6 text-gray-400" />
                  </div>
                )}
                <button
                  onClick={() => setImagePicker({ open: true, field: 'imageUrl', title: 'Select Photo' })}
                  className="text-sm text-picc-ochre hover:text-picc-earth-500"
                >
                  {data.imageUrl ? 'Change' : 'Select'} photo
                </button>
              </div>
            </div>
          </div>
        )

      case 'leadership':
        return (
          <div className="space-y-4">
            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Name</label>
                <input
                  value={data.name || ''}
                  onChange={(e) => updateData('name', e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg"
                  placeholder="Rachel Atkinson"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Role</label>
                <select
                  value={data.role || 'CEO'}
                  onChange={(e) => updateData('role', e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg bg-white"
                >
                  <option value="Chief Executive Officer">CEO</option>
                  <option value="Board Chairperson">Chairperson</option>
                  <option value="Deputy CEO">Deputy CEO</option>
                </select>
              </div>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Photo</label>
              <div className="flex items-center gap-3">
                {data.imageUrl ? (
                  <img src={data.imageUrl} alt="" className="w-20 h-20 object-cover rounded-lg" />
                ) : (
                  <div className="w-20 h-20 bg-gray-100 rounded-lg flex items-center justify-center">
                    <User className="w-8 h-8 text-gray-400" />
                  </div>
                )}
                <button
                  onClick={() => setImagePicker({ open: true, field: 'imageUrl', title: 'Select Leadership Photo' })}
                  className="text-sm text-picc-ochre hover:text-picc-earth-500"
                >
                  {data.imageUrl ? 'Change' : 'Select'} photo
                </button>
              </div>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Message</label>
              <textarea
                value={data.message || ''}
                onChange={(e) => updateData('message', e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-picc-ochre min-h-[200px]"
                placeholder="Leadership message..."
              />
            </div>
          </div>
        )

      case 'video':
        return (
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Video Title</label>
              <input
                value={data.title || ''}
                onChange={(e) => updateData('title', e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg"
                placeholder="Video title"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Video URL</label>
              <input
                value={data.videoUrl || ''}
                onChange={(e) => updateData('videoUrl', e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg"
                placeholder="https://youtube.com/watch?v=..."
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Description</label>
              <textarea
                value={data.description || ''}
                onChange={(e) => updateData('description', e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg"
                rows={2}
              />
            </div>
          </div>
        )

      case 'image':
        return (
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Image</label>
              <div
                onClick={() => setImagePicker({ open: true, field: 'imageUrl', title: 'Select Image' })}
                className="cursor-pointer"
              >
                {data.imageUrl ? (
                  <img src={data.imageUrl} alt="" className="w-full h-48 object-cover rounded-lg hover:opacity-90" />
                ) : (
                  <div className="w-full h-48 border-2 border-dashed border-gray-300 rounded-lg flex items-center justify-center hover:border-picc-ochre-300">
                    <div className="text-center">
                      <ImageIcon className="w-10 h-10 text-gray-400 mx-auto mb-2" />
                      <span className="text-sm text-gray-500">Click to select</span>
                    </div>
                  </div>
                )}
              </div>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Caption</label>
              <input
                value={data.caption || ''}
                onChange={(e) => updateData('caption', e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg"
                placeholder="Image caption"
              />
            </div>
          </div>
        )

      default:
        return (
          <div className="text-gray-500 text-sm">
            Editor for this section type is not yet implemented.
          </div>
        )
    }
  }

  return (
    <>
      {children}

      {/* Editor Slide-in Panel */}
      {activeEditor && (
        <div className="fixed inset-y-0 right-0 w-full sm:w-[400px] z-[75] bg-white shadow-2xl border-l border-gray-200 flex flex-col print:hidden">
          <div className="px-4 py-3 border-b border-gray-200 bg-warm-100 flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Edit3 className="w-5 h-5 text-picc-ochre" />
              <span className="font-semibold text-picc-earth-600">Edit Section</span>
            </div>
            <button
              onClick={closeEditor}
              className="p-1.5 rounded-lg hover:bg-warm-100 transition-colors"
            >
              <X className="w-5 h-5 text-picc-ochre" />
            </button>
          </div>

          {error && (
            <div className="px-4 py-2 bg-red-50 text-red-700 text-sm flex items-center gap-2 border-b border-red-100">
              <AlertCircle className="w-4 h-4" />
              {error}
            </div>
          )}

          <div className="flex-1 overflow-auto p-4">
            {renderEditor()}
          </div>

          <div className="px-4 py-3 border-t border-gray-200 bg-gray-50 flex items-center justify-end gap-2">
            <button
              onClick={closeEditor}
              disabled={saving}
              className="px-4 py-2 text-sm font-medium text-gray-700 hover:bg-gray-100 rounded-lg transition-colors"
            >
              Cancel
            </button>
            <button
              onClick={saveChanges}
              disabled={saving}
              className="px-4 py-2 text-sm font-medium text-white bg-picc-ochre hover:bg-picc-ochre rounded-lg transition-colors flex items-center gap-2 disabled:opacity-60"
            >
              {saving ? <Loader2 className="w-4 h-4 animate-spin" /> : <Save className="w-4 h-4" />}
              Save Changes
            </button>
          </div>
        </div>
      )}

      {/* Add Section Button */}
      {!activeEditor && (
        <div className="fixed bottom-6 right-6 z-[60] print:hidden">
          <div className="relative">
            <button
              onClick={() => setAddSectionOpen(!addSectionOpen)}
              disabled={saving}
              className="flex items-center gap-2 px-5 py-3 bg-picc-ochre text-white rounded-full shadow-lg hover:bg-picc-ochre transition-all font-medium hover:scale-105"
            >
              <Plus className="w-5 h-5" />
              Add Section
            </button>

            {addSectionOpen && (
              <>
                <div className="fixed inset-0 z-10" onClick={() => setAddSectionOpen(false)} />
                <div className="absolute bottom-full right-0 mb-2 w-64 bg-white rounded-xl border border-gray-200 shadow-xl z-20 py-2 max-h-80 overflow-y-auto">
                  {SECTION_TYPES.map((type) => {
                    const Icon = type.icon
                    return (
                      <button
                        key={type.id}
                        onClick={() => addSection(type.id)}
                        disabled={saving}
                        className="w-full flex items-center gap-3 px-4 py-2.5 hover:bg-warm-100 text-left"
                      >
                        <Icon className="w-4 h-4 text-picc-ochre" />
                        <span className="text-sm font-medium text-gray-900">{type.label}</span>
                      </button>
                    )
                  })}
                </div>
              </>
            )}
          </div>
        </div>
      )}

      {/* Toast Notifications */}
      {toast && (
        <div
          className={`
            fixed bottom-20 left-1/2 -translate-x-1/2 z-[80] px-5 py-3 rounded-lg shadow-lg flex items-center gap-2 print:hidden
            ${toast.type === 'success' ? 'bg-green-600 text-white' : 'bg-red-600 text-white'}
          `}
        >
          {toast.type === 'success' ? <Check className="w-5 h-5" /> : <AlertCircle className="w-5 h-5" />}
          {toast.message}
        </div>
      )}

      {/* Image Picker Modal */}
      <ImagePicker
        open={imagePicker.open}
        onClose={() => setImagePicker({ open: false, field: '', title: 'Select Image' })}
        onSelect={handleImageSelect}
        title={imagePicker.title}
      />
    </>
  )
}

// Export helper to open editor from anywhere
export function useWYSIWYGEditor() {
  // This would be used with context in a real implementation
  return {
    openTextEditor: (sectionId: string, data: { title?: string; content?: string }) => {},
    openQuoteEditor: (sectionId: string, data: { quote?: string; author?: string; role?: string }) => {},
    openLeadershipEditor: (sectionId: string, data: { name?: string; role?: string; message?: string; imageUrl?: string }) => {},
    openImageEditor: (sectionId: string, data: { imageUrl?: string; caption?: string }) => {},
    openVideoEditor: (sectionId: string, data: { title?: string; videoUrl?: string; description?: string }) => {},
  }
}
