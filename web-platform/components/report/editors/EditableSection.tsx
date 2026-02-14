'use client'

import { ReactNode, MouseEvent, useContext, createContext } from 'react'
import { Edit3, Trash2, ChevronUp, ChevronDown, Plus } from 'lucide-react'

// Import useEditor from InlineReportEditor - we'll do this via a try-catch
// to avoid circular dependencies
let useEditorHook: (() => any) | null = null

// This will be set by InlineReportEditor
export function setEditorHook(hook: () => any) {
  useEditorHook = hook
}

export interface EditableSectionProps {
  sectionId: string
  sectionType: string
  label: string
  children: ReactNode
  isEditMode: boolean
  data?: Record<string, any>
  // Optional - if not provided, will use context
  isActive?: boolean
  onEdit?: () => void
  onDelete?: () => void
  onMoveUp?: () => void
  onMoveDown?: () => void
  onAddBelow?: () => void
  canMoveUp?: boolean
  canMoveDown?: boolean
  className?: string
}

export default function EditableSection({
  sectionId,
  sectionType,
  label,
  children,
  isEditMode,
  data,
  isActive: isActiveProp,
  onEdit: onEditProp,
  onDelete: onDeleteProp,
  onMoveUp,
  onMoveDown,
  onAddBelow,
  canMoveUp = true,
  canMoveDown = true,
  className = '',
}: EditableSectionProps) {
  // Try to get context values
  let contextValue: any = null
  try {
    if (useEditorHook) {
      contextValue = useEditorHook()
    }
  } catch {
    // Not inside provider, use props
  }

  // Use context values if available, otherwise fall back to props
  const activeSection = contextValue?.activeSection
  const isActive = isActiveProp ?? (activeSection === sectionId)

  const handleEdit = () => {
    if (onEditProp) {
      onEditProp()
    } else if (contextValue?.setActiveSection && data) {
      contextValue.setActiveSection(sectionId, data, sectionType)
    }
  }

  const handleDelete = () => {
    if (onDeleteProp) {
      onDeleteProp()
    } else if (contextValue?.deleteSection) {
      contextValue.deleteSection(sectionId)
    }
  }

  const handleAddBelow = () => {
    if (onAddBelow) {
      onAddBelow()
    } else if (contextValue?.openAddSectionMenu) {
      contextValue.openAddSectionMenu(sectionId)
    }
  }

  // Check if we can add below (either prop provided or context available)
  const canAddBelow = onAddBelow || contextValue?.openAddSectionMenu

  if (!isEditMode) {
    return <>{children}</>
  }

  const handleClick = (e: MouseEvent) => {
    // Don't trigger if clicking on buttons inside
    if ((e.target as HTMLElement).closest('button')) return
    handleEdit()
  }

  const showDelete = onDeleteProp || contextValue?.deleteSection

  return (
    <div
      data-section-id={sectionId}
      data-section-type={sectionType}
      className={`
        relative group
        ${isActive ? 'ring-2 ring-picc-ochre ring-offset-2' : ''}
        ${className}
      `}
    >
      {/* Hover toolbar - shows on hover */}
      <div
        className={`
          absolute -top-10 left-1/2 -translate-x-1/2 z-40
          flex items-center gap-1 px-2 py-1.5 rounded-lg
          bg-white border border-gray-200 shadow-lg
          transition-opacity duration-150
          ${isActive ? 'opacity-100' : 'opacity-0 group-hover:opacity-100'}
          print:hidden
        `}
      >
        <span className="text-xs font-medium text-gray-600 px-2">{label}</span>
        <div className="w-px h-4 bg-gray-200" />

        <button
          onClick={handleEdit}
          className="p-1.5 rounded hover:bg-warm-100 text-gray-600 hover:text-picc-ochre transition-colors"
          title="Edit section"
        >
          <Edit3 className="w-4 h-4" />
        </button>

        {onMoveUp && (
          <button
            onClick={onMoveUp}
            disabled={!canMoveUp}
            className="p-1.5 rounded hover:bg-gray-100 text-gray-600 hover:text-gray-900 disabled:opacity-30 disabled:cursor-not-allowed transition-colors"
            title="Move up"
          >
            <ChevronUp className="w-4 h-4" />
          </button>
        )}

        {onMoveDown && (
          <button
            onClick={onMoveDown}
            disabled={!canMoveDown}
            className="p-1.5 rounded hover:bg-gray-100 text-gray-600 hover:text-gray-900 disabled:opacity-30 disabled:cursor-not-allowed transition-colors"
            title="Move down"
          >
            <ChevronDown className="w-4 h-4" />
          </button>
        )}

        {canAddBelow && (
          <button
            onClick={handleAddBelow}
            className="p-1.5 rounded hover:bg-green-100 text-gray-600 hover:text-green-700 transition-colors"
            title="Add section below"
          >
            <Plus className="w-4 h-4" />
          </button>
        )}

        {showDelete && (
          <>
            <div className="w-px h-4 bg-gray-200" />
            <button
              onClick={handleDelete}
              className="p-1.5 rounded hover:bg-red-100 text-gray-600 hover:text-red-700 transition-colors"
              title="Delete section"
            >
              <Trash2 className="w-4 h-4" />
            </button>
          </>
        )}
      </div>

      {/* Clickable overlay */}
      <div
        onClick={handleClick}
        className={`
          absolute inset-0 z-30 cursor-pointer
          border-2 border-transparent rounded-lg
          transition-colors duration-150
          ${isActive ? 'border-picc-ochre bg-picc-ochre/5' : 'hover:border-picc-ochre-300 hover:bg-warm-100/30'}
          print:hidden
        `}
      />

      {/* Content */}
      <div className="relative z-20 pointer-events-none">
        {children}
      </div>
    </div>
  )
}
