'use client'

import { createContext, useContext, useState, ReactNode, useCallback, useEffect } from 'react'
import {
  X, Save, Plus, FileText, Image as ImageIcon, Film, BarChart3, Quote,
  User, Users, Calendar, Award, Layout, Loader2, Check, AlertCircle
} from 'lucide-react'
import ImagePicker, { MediaItem } from './ImagePicker'
import { setEditorHook } from './EditableSection'
import {
  TextEditor,
  QuoteEditor,
  LeadershipEditor,
  StatsEditor,
  VideoEditor,
  ImageSectionEditor,
} from './SectionEditors'

// Section types available for adding
export const SECTION_TYPES = [
  { id: 'text', label: 'Text Section', icon: FileText, description: 'Rich text content' },
  { id: 'hero_image', label: 'Hero Image', icon: ImageIcon, description: 'Full-width image' },
  { id: 'photo_gallery', label: 'Photo Gallery', icon: ImageIcon, description: 'Image gallery' },
  { id: 'video', label: 'Video Embed', icon: Film, description: 'YouTube or video' },
  { id: 'stats_bar', label: 'Stats Bar', icon: BarChart3, description: 'Key metrics' },
  { id: 'quote', label: 'Featured Quote', icon: Quote, description: 'Quote with attribution' },
  { id: 'leadership_message', label: 'Leadership Message', icon: User, description: 'CEO/Chair message' },
  { id: 'community_voices', label: 'Community Voices', icon: Users, description: 'People quotes' },
  { id: 'timeline', label: 'Timeline', icon: Calendar, description: 'Milestones' },
  { id: 'project_showcase', label: 'Projects', icon: Award, description: 'Innovation projects' },
  { id: 'divider', label: 'Divider', icon: Layout, description: 'Section separator' },
] as const

export type SectionType = typeof SECTION_TYPES[number]['id']

export interface EditingSection {
  id: string
  type: SectionType
  data: Record<string, any>
  originalData?: Record<string, any>
}

interface EditorContextValue {
  isEditMode: boolean
  activeSection: string | null
  activeSectionType: string | null
  editingData: Record<string, any> | null
  setActiveSection: (id: string, data: Record<string, any>, sectionType?: string) => void
  updateEditingData: (updates: Record<string, any>) => void
  saveSection: () => Promise<void>
  cancelEdit: () => void
  deleteSection: (id: string) => Promise<void>
  openImagePicker: (onSelect: (media: MediaItem) => void, title?: string) => void
  openAddSectionMenu: (insertAfter?: string) => void
  saving: boolean
  error: string | null
}

const EditorContext = createContext<EditorContextValue | null>(null)

export function useEditor() {
  const ctx = useContext(EditorContext)
  if (!ctx) throw new Error('useEditor must be used within InlineReportEditor')
  return ctx
}

// Register the hook with EditableSection
setEditorHook(useEditor)

interface InlineReportEditorProps {
  reportId: string
  reportYear: number
  fiscalYear: string
  isEditMode: boolean
  children: ReactNode
  onSectionUpdated?: () => void
}

export default function InlineReportEditor({
  reportId,
  reportYear,
  fiscalYear,
  isEditMode,
  children,
  onSectionUpdated,
}: InlineReportEditorProps) {
  const [activeSection, setActiveSectionState] = useState<string | null>(null)
  const [activeSectionType, setActiveSectionType] = useState<string | null>(null)
  const [editingData, setEditingData] = useState<Record<string, any> | null>(null)
  const [originalData, setOriginalData] = useState<Record<string, any> | null>(null)
  const [saving, setSaving] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [toast, setToast] = useState<{ type: 'success' | 'error'; message: string } | null>(null)

  // Image picker state
  const [imagePicker, setImagePicker] = useState<{
    open: boolean
    title: string
    onSelect: ((media: MediaItem) => void) | null
  }>({ open: false, title: 'Select Image', onSelect: null })

  // Add section dropdown
  const [addSectionOpen, setAddSectionOpen] = useState(false)
  const [insertAfterSectionId, setInsertAfterSectionId] = useState<string | null>(null)

  const openImagePicker = useCallback((onSelect: (media: MediaItem) => void, title = 'Select Image') => {
    setImagePicker({ open: true, title, onSelect })
  }, [])

  const closeImagePicker = useCallback(() => {
    setImagePicker({ open: false, title: 'Select Image', onSelect: null })
  }, [])

  const handleImageSelect = useCallback((media: MediaItem) => {
    if (imagePicker.onSelect) {
      imagePicker.onSelect(media)
    }
    closeImagePicker()
  }, [imagePicker.onSelect, closeImagePicker])

  const updateEditingData = useCallback((updates: Record<string, any>) => {
    setEditingData(prev => prev ? { ...prev, ...updates } : updates)
  }, [])

  const startEdit = useCallback((sectionId: string, data: Record<string, any>, sectionType?: string) => {
    setActiveSectionState(sectionId)
    setActiveSectionType(sectionType || null)
    setEditingData(data)
    setOriginalData(data)
    setError(null)
  }, [])

  const cancelEdit = useCallback(() => {
    setActiveSectionState(null)
    setActiveSectionType(null)
    setEditingData(null)
    setOriginalData(null)
    setError(null)
  }, [])

  const saveSection = useCallback(async () => {
    if (!activeSection || !editingData) return

    setSaving(true)
    setError(null)

    try {
      const res = await fetch(`/api/annual-reports/${reportId}/sections`, {
        method: 'PATCH',
        headers: { 'content-type': 'application/json' },
        body: JSON.stringify({
          sectionId: activeSection,
          sectionType: activeSectionType,
          updates: editingData,
          reportYear,
          fiscalYear,
        }),
      })

      const json = await res.json().catch(() => ({}))
      if (!res.ok) throw new Error(json?.error || 'Failed to save')

      setToast({ type: 'success', message: 'Saved!' })
      setTimeout(() => setToast(null), 2000)

      cancelEdit()
      onSectionUpdated?.()
    } catch (e: any) {
      setError(e?.message || 'Failed to save')
      setToast({ type: 'error', message: e?.message || 'Failed to save' })
      setTimeout(() => setToast(null), 3000)
    } finally {
      setSaving(false)
    }
  }, [activeSection, activeSectionType, editingData, reportId, reportYear, fiscalYear, cancelEdit, onSectionUpdated])

  const deleteSection = useCallback(async (sectionId: string) => {
    if (!confirm('Are you sure you want to delete this section?')) return

    setSaving(true)
    try {
      const res = await fetch(`/api/annual-reports/${reportId}/sections`, {
        method: 'DELETE',
        headers: { 'content-type': 'application/json' },
        body: JSON.stringify({ sectionId }),
      })

      const json = await res.json().catch(() => ({}))
      if (!res.ok) throw new Error(json?.error || 'Failed to delete')

      setToast({ type: 'success', message: 'Section deleted' })
      setTimeout(() => setToast(null), 2000)

      cancelEdit()
      onSectionUpdated?.()
    } catch (e: any) {
      setToast({ type: 'error', message: e?.message || 'Failed to delete' })
      setTimeout(() => setToast(null), 3000)
    } finally {
      setSaving(false)
    }
  }, [reportId, cancelEdit, onSectionUpdated])

  const openAddSectionMenu = useCallback((insertAfter?: string) => {
    setInsertAfterSectionId(insertAfter || null)
    setAddSectionOpen(true)
  }, [])

  const closeAddSectionMenu = useCallback(() => {
    setAddSectionOpen(false)
    setInsertAfterSectionId(null)
  }, [])

  const addSection = useCallback(async (type: SectionType) => {
    setSaving(true)
    const insertAfter = insertAfterSectionId
    closeAddSectionMenu()

    try {
      const res = await fetch(`/api/annual-reports/${reportId}/sections`, {
        method: 'POST',
        headers: { 'content-type': 'application/json' },
        body: JSON.stringify({
          section_type: type,
          section_title: SECTION_TYPES.find(t => t.id === type)?.label || 'New Section',
          section_content: '',
          insertAfter: insertAfter || undefined,
        }),
      })

      const json = await res.json().catch(() => ({}))
      if (!res.ok) throw new Error(json?.error || 'Failed to add section')

      setToast({ type: 'success', message: 'Section added!' })
      setTimeout(() => setToast(null), 2000)

      onSectionUpdated?.()
    } catch (e: any) {
      setToast({ type: 'error', message: e?.message || 'Failed to add section' })
      setTimeout(() => setToast(null), 3000)
    } finally {
      setSaving(false)
    }
  }, [reportId, insertAfterSectionId, closeAddSectionMenu, onSectionUpdated])

  // Get section label
  const getSectionLabel = () => {
    if (!activeSection) return 'Section'
    // Try to find from section type
    const typeInfo = SECTION_TYPES.find(t => t.id === activeSectionType)
    if (typeInfo) return typeInfo.label
    // Fall back to section ID formatting
    return activeSection.replace(/-/g, ' ').replace(/\b\w/g, c => c.toUpperCase())
  }

  // Render the appropriate editor based on section type
  const renderEditor = () => {
    if (!editingData) return null

    // Determine section type from activeSectionType or infer from data
    const sectionType = activeSectionType || inferSectionType()

    switch (sectionType) {
      case 'text':
        return <TextEditor />
      case 'quote':
        return <QuoteEditor />
      case 'leadership_message':
        return <LeadershipEditor />
      case 'stats_bar':
        return <StatsEditor />
      case 'video':
        return <VideoEditor />
      case 'hero_image':
      case 'photo_gallery':
        return <ImageSectionEditor />
      default:
        // Generic text editor for unknown types
        return <TextEditor />
    }
  }

  // Infer section type from editingData structure
  const inferSectionType = (): string => {
    if (!editingData) return 'text'
    if ('quote' in editingData && 'author' in editingData) return 'quote'
    if ('message' in editingData && 'signature' in editingData) return 'leadership_message'
    if ('url' in editingData && ('thumbnail' in editingData || editingData.url?.includes('youtube'))) return 'video'
    if ('image' in editingData && !('content' in editingData)) return 'hero_image'
    if ('stats' in editingData || Array.isArray(editingData.items)) return 'stats_bar'
    return 'text'
  }

  const contextValue: EditorContextValue = {
    isEditMode,
    activeSection,
    activeSectionType,
    editingData,
    setActiveSection: startEdit,
    updateEditingData,
    saveSection,
    cancelEdit,
    deleteSection,
    openImagePicker,
    openAddSectionMenu,
    saving,
    error,
  }

  return (
    <EditorContext.Provider value={contextValue}>
      {children}

      {/* Slide-in Edit Panel - shows when section is active */}
      {isEditMode && activeSection && editingData && (
        <div className="fixed inset-y-0 right-0 z-[70] w-96 bg-white border-l border-gray-200 shadow-2xl flex flex-col print:hidden">
          {/* Header */}
          <div className="px-4 py-3 border-b border-gray-200 bg-purple-50 flex items-center justify-between flex-shrink-0">
            <div className="font-semibold text-purple-900">{getSectionLabel()}</div>
            <button
              onClick={cancelEdit}
              className="p-1.5 rounded-lg hover:bg-purple-100 transition-colors"
            >
              <X className="w-4 h-4 text-purple-700" />
            </button>
          </div>

          {error && (
            <div className="px-4 py-2 bg-red-50 text-red-700 text-sm flex items-center gap-2 flex-shrink-0">
              <AlertCircle className="w-4 h-4" />
              {error}
            </div>
          )}

          {/* Editor Content */}
          <div className="flex-1 overflow-auto p-4">
            {renderEditor()}
          </div>

          {/* Footer */}
          <div className="px-4 py-3 border-t border-gray-200 bg-gray-50 flex items-center justify-end gap-2 flex-shrink-0">
            <button
              onClick={cancelEdit}
              disabled={saving}
              className="px-4 py-2 text-sm font-medium text-gray-700 hover:bg-gray-100 rounded-lg transition-colors"
            >
              Cancel
            </button>
            <button
              onClick={saveSection}
              disabled={saving}
              className="px-4 py-2 text-sm font-medium text-white bg-purple-600 hover:bg-purple-700 rounded-lg transition-colors flex items-center gap-2 disabled:opacity-60"
            >
              {saving ? (
                <Loader2 className="w-4 h-4 animate-spin" />
              ) : (
                <Save className="w-4 h-4" />
              )}
              Save
            </button>
          </div>
        </div>
      )}

      {/* Add Section Button */}
      {isEditMode && !activeSection && (
        <div className="fixed bottom-4 right-4 z-[60] print:hidden">
          <div className="relative">
            <button
              onClick={() => openAddSectionMenu()}
              className="flex items-center gap-2 px-4 py-3 bg-purple-600 text-white rounded-full shadow-lg hover:bg-purple-700 transition-colors font-medium"
            >
              <Plus className="w-5 h-5" />
              Add Section
            </button>

            {addSectionOpen && (
              <>
                <div className="fixed inset-0 z-10" onClick={closeAddSectionMenu} />
                <div className="absolute bottom-full right-0 mb-2 w-72 bg-white rounded-xl border border-gray-200 shadow-xl z-20 overflow-hidden">
                  {/* Header showing where we're inserting */}
                  <div className="px-4 py-2 bg-purple-50 border-b border-purple-100">
                    <div className="text-xs font-medium text-purple-700">
                      {insertAfterSectionId ? 'Insert after this section' : 'Add at end of report'}
                    </div>
                  </div>
                  <div className="py-2 max-h-72 overflow-y-auto">
                    {SECTION_TYPES.map((type) => {
                      const Icon = type.icon
                      return (
                        <button
                          key={type.id}
                          onClick={() => addSection(type.id)}
                          disabled={saving}
                          className="w-full flex items-start gap-3 px-4 py-2.5 hover:bg-purple-50 text-left disabled:opacity-50 transition-colors"
                        >
                          <Icon className="w-4 h-4 text-purple-600 mt-0.5 flex-shrink-0" />
                          <div>
                            <div className="text-sm font-medium text-gray-900">{type.label}</div>
                            <div className="text-xs text-gray-500">{type.description}</div>
                          </div>
                        </button>
                      )
                    })}
                  </div>
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
            fixed bottom-20 right-4 z-[80] px-4 py-3 rounded-lg shadow-lg flex items-center gap-2 print:hidden
            ${toast.type === 'success' ? 'bg-green-600 text-white' : 'bg-red-600 text-white'}
          `}
        >
          {toast.type === 'success' ? (
            <Check className="w-4 h-4" />
          ) : (
            <AlertCircle className="w-4 h-4" />
          )}
          {toast.message}
        </div>
      )}

      {/* Image Picker Modal */}
      <ImagePicker
        open={imagePicker.open}
        onClose={closeImagePicker}
        onSelect={handleImageSelect}
        title={imagePicker.title}
      />
    </EditorContext.Provider>
  )
}
