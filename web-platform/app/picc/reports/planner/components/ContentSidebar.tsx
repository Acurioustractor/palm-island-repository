'use client'

import React, { useState } from 'react'
import { X, Image, Quote, Hash, Type, UserCircle, BarChart } from 'lucide-react'
import type { PageConfig, ContentSlot, SlotValue } from '@/lib/annual-report/planner-types'
import { PhotoPicker } from './PhotoPicker'
import { QuotePicker } from './QuotePicker'
import { StatEditor } from './StatEditor'
import { TextEditor } from './TextEditor'

const SLOT_ICONS: Record<string, React.ElementType> = {
  photo: Image,
  quote: Quote,
  stat: Hash,
  text: Type,
  chart: BarChart,
  person: UserCircle,
}

interface ContentSidebarProps {
  page: PageConfig
  pageKey: string
  onSlotUpdate: (slotId: string, value: SlotValue | null) => void
  onClose: () => void
}

export function ContentSidebar({ page, pageKey, onSlotUpdate, onClose }: ContentSidebarProps) {
  const [expandedSlot, setExpandedSlot] = useState<string | null>(null)

  return (
    <div className="flex flex-col h-full">
      {/* Header */}
      <div className="p-4 border-b border-gray-100">
        <div className="flex items-center justify-between mb-1">
          <h2 className="text-sm font-bold text-gray-900">{page.label}</h2>
          <button onClick={onClose} className="p-1 text-gray-400 hover:text-gray-600 rounded">
            <X className="h-4 w-4" />
          </button>
        </div>
        <p className="text-xs text-gray-500">{page.description}</p>
        <div className="mt-2 flex items-center gap-2">
          <div className="w-3 h-3 rounded-full" style={{ backgroundColor: page.accentColor }} />
          <span className="text-xs text-gray-400">
            {page.slots.filter((s) => s.value !== null).length}/{page.slots.length} slots filled
          </span>
        </div>
      </div>

      {/* Slot list */}
      <div className="flex-1 overflow-auto p-3 space-y-2">
        {page.slots.map((slot) => {
          const Icon = SLOT_ICONS[slot.type] || Type
          const isExpanded = expandedSlot === slot.id
          const hasValue = slot.value !== null

          return (
            <div key={slot.id} className="border border-gray-200 rounded-lg overflow-hidden">
              {/* Slot header */}
              <button
                onClick={() => setExpandedSlot(isExpanded ? null : slot.id)}
                className={`w-full flex items-center gap-2.5 p-3 text-left transition-colors ${
                  isExpanded ? 'bg-gray-50' : 'hover:bg-gray-50'
                }`}
              >
                <Icon className="h-4 w-4 flex-shrink-0" style={{ color: page.accentColor }} />
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2">
                    <span className="text-xs font-medium text-gray-900 truncate">
                      {slot.label}
                    </span>
                    {slot.required && (
                      <span className="text-[9px] text-red-500 font-medium">REQ</span>
                    )}
                  </div>
                  {hasValue && (
                    <SlotPreview slot={slot} />
                  )}
                </div>
                <div className={`w-2 h-2 rounded-full flex-shrink-0 ${hasValue ? 'bg-green-400' : 'bg-gray-200'}`} />
              </button>

              {/* Expanded content picker */}
              {isExpanded && (
                <div className="border-t border-gray-100 p-3 bg-white">
                  <SlotPicker
                    slot={slot}
                    pageKey={pageKey}
                    onSelect={(value) => {
                      onSlotUpdate(slot.id, value)
                      setExpandedSlot(null)
                    }}
                    onClear={() => {
                      onSlotUpdate(slot.id, null)
                    }}
                  />
                </div>
              )}
            </div>
          )
        })}
      </div>
    </div>
  )
}

/** Preview of the current slot value */
function SlotPreview({ slot }: { slot: ContentSlot }) {
  if (!slot.value) return null
  const v = slot.value

  switch (v.type) {
    case 'photo':
      return (
        <div className="flex items-center gap-1.5 mt-1">
          {v.url && (
            // eslint-disable-next-line @next/next/no-img-element
            <img src={v.url} alt="" className="w-12 h-12 rounded object-cover border border-gray-200" />
          )}
          <span className="text-[10px] text-gray-400 truncate">{v.caption || 'Photo selected'}</span>
        </div>
      )
    case 'quote':
      return (
        <p className="text-[10px] text-gray-400 mt-0.5 line-clamp-2">
          &ldquo;{v.text.slice(0, 60)}{v.text.length > 60 ? '...' : ''}&rdquo; — {v.author || 'Anonymous'}
        </p>
      )
    case 'stat':
      return (
        <p className="text-[10px] mt-0.5">
          <span className="font-semibold text-gray-600">{v.value}</span>
          {v.unit && <span className="text-gray-400"> {v.unit}</span>}
          <span className="text-gray-400"> — {v.label}</span>
        </p>
      )
    case 'text':
      return (
        <p className="text-[10px] text-gray-400 mt-0.5 line-clamp-2">
          {v.content.slice(0, 80)}{v.content.length > 80 ? '...' : ''}
        </p>
      )
    case 'chart':
      return (
        <div className="flex items-center gap-1.5 mt-1">
          {v.url && (
            // eslint-disable-next-line @next/next/no-img-element
            <img src={v.url} alt="" className="w-12 h-12 rounded object-cover border border-gray-200" />
          )}
          <span className="text-[10px] text-gray-400">Chart generated</span>
        </div>
      )
    case 'person':
      return (
        <div className="flex items-center gap-1.5 mt-1">
          {v.photoUrl ? (
            // eslint-disable-next-line @next/next/no-img-element
            <img src={v.photoUrl} alt="" className="w-8 h-8 rounded-full object-cover border border-gray-200" />
          ) : (
            <div className="w-8 h-8 rounded-full bg-gray-200 flex items-center justify-center text-[10px] font-bold text-gray-500">
              {v.name.charAt(0)}
            </div>
          )}
          <div>
            <span className="text-[10px] font-medium text-gray-600">{v.name}</span>
            <span className="text-[10px] text-gray-400"> — {v.role}</span>
          </div>
        </div>
      )
    default:
      return null
  }
}

/** Slot-type-specific picker */
function SlotPicker({
  slot,
  pageKey,
  onSelect,
  onClear,
}: {
  slot: ContentSlot
  pageKey: string
  onSelect: (value: SlotValue) => void
  onClear: () => void
}) {
  const hasValue = slot.value !== null

  return (
    <div>
      {slot.type === 'photo' && (
        <PhotoPicker
          currentValue={slot.value?.type === 'photo' ? slot.value : null}
          onSelect={(photo) => onSelect({ type: 'photo', ...photo })}
          pageContext={pageKey}
        />
      )}

      {slot.type === 'quote' && (
        <QuotePicker
          currentValue={slot.value?.type === 'quote' ? slot.value : null}
          onSelect={(quote) => onSelect({ type: 'quote', ...quote })}
        />
      )}

      {(slot.type === 'stat' || slot.type === 'chart') && (
        <StatEditor
          slot={slot}
          onSelect={onSelect}
        />
      )}

      {slot.type === 'text' && (
        <TextEditor
          currentValue={slot.value?.type === 'text' ? slot.value.content : ''}
          onSave={(content) => onSelect({ type: 'text', content })}
          slotLabel={slot.label}
          slotId={slot.id}
          pageKey={pageKey}
        />
      )}

      {slot.type === 'person' && (
        <PersonPicker
          currentValue={slot.value?.type === 'person' ? slot.value : null}
          onSelect={(person) => onSelect({ type: 'person', ...person })}
        />
      )}

      {hasValue && (
        <button
          onClick={onClear}
          className="mt-2 text-xs text-red-500 hover:text-red-700 transition-colors"
        >
          Clear slot
        </button>
      )}
    </div>
  )
}

/** Person picker — searches board members + leadership */
function PersonPicker({
  currentValue,
  onSelect,
}: {
  currentValue: { name: string; role: string; photoUrl: string | null } | null
  onSelect: (person: { personId: string; name: string; role: string; photoUrl: string | null }) => void
}) {
  const [people, setPeople] = useState<Array<{ id: string; name: string; role: string; photo_url: string | null }>>([])
  const [loading, setLoading] = useState(false)
  const [loaded, setLoaded] = useState(false)

  const loadPeople = async () => {
    if (loaded) return
    setLoading(true)
    try {
      const res = await fetch('/api/report-planner/people')
      if (res.ok) {
        const data = await res.json()
        setPeople(data.people || [])
      }
    } catch {
      // ignore
    } finally {
      setLoading(false)
      setLoaded(true)
    }
  }

  return (
    <div>
      {!loaded && (
        <button
          onClick={loadPeople}
          disabled={loading}
          className="text-xs text-[#0B4F6C] hover:underline"
        >
          {loading ? 'Loading...' : 'Browse people'}
        </button>
      )}
      {loaded && people.length === 0 && (
        <p className="text-xs text-gray-400">No people found</p>
      )}
      {people.length > 0 && (
        <div className="space-y-1.5 max-h-48 overflow-auto">
          {people.map((p) => (
            <button
              key={p.id}
              onClick={() => onSelect({ personId: p.id, name: p.name, role: p.role, photoUrl: p.photo_url })}
              className={`w-full flex items-center gap-2 p-2 rounded-lg text-left border transition-colors ${
                currentValue?.name === p.name
                  ? 'border-[#0B4F6C] bg-blue-50'
                  : 'border-gray-100 hover:border-gray-200 hover:bg-gray-50'
              }`}
            >
              {p.photo_url ? (
                // eslint-disable-next-line @next/next/no-img-element
                <img src={p.photo_url} alt="" className="w-8 h-8 rounded-full object-cover" />
              ) : (
                <div className="w-8 h-8 rounded-full bg-gray-200 flex items-center justify-center text-xs font-bold text-gray-500">
                  {p.name.charAt(0)}
                </div>
              )}
              <div>
                <div className="text-xs font-medium text-gray-900">{p.name}</div>
                <div className="text-[10px] text-gray-400">{p.role}</div>
              </div>
            </button>
          ))}
        </div>
      )}
    </div>
  )
}
