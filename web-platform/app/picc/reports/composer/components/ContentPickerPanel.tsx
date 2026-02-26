'use client'

import React, { useState, useEffect } from 'react'
import { Image, Quote, Hash, Type, UserCircle, BarChart, Sparkles, Loader2 } from 'lucide-react'
import type { PageConfig, ContentSlot, SlotType, SlotValue } from '@/lib/annual-report/planner-types'
import { PhotoPicker } from '@/app/picc/reports/planner/components/PhotoPicker'
import { QuotePicker } from '@/app/picc/reports/planner/components/QuotePicker'
import { StatEditor } from '@/app/picc/reports/planner/components/StatEditor'
import { TextEditor } from '@/app/picc/reports/planner/components/TextEditor'
import { SlotCard } from './SlotCard'

const SLOT_ICONS: Record<SlotType, React.ElementType> = {
  photo: Image,
  quote: Quote,
  stat: Hash,
  text: Type,
  chart: BarChart,
  person: UserCircle,
}

interface ContentPickerPanelProps {
  page: PageConfig
  pageKey: string
  activeSlot: ContentSlot | null
  onSlotSelect: (slot: ContentSlot | null) => void
  onPickerSelect: (slotId: string, value: SlotValue) => void
  onPickerClear: (slotId: string) => void
}

export function ContentPickerPanel({
  page,
  pageKey,
  activeSlot,
  onSlotSelect,
  onPickerSelect,
  onPickerClear,
}: ContentPickerPanelProps) {
  const [prefilling, setPrefilling] = useState(false)

  // Progress
  const filled = page.slots.filter(s => s.value !== null).length
  const total = page.slots.length
  const pct = total > 0 ? Math.round((filled / total) * 100) : 0

  // If no active slot, show slot list
  if (!activeSlot) {
    return (
      <div className="flex flex-col h-full">
        {/* Header */}
        <div className="p-4 border-b border-gray-100">
          <div className="flex items-center gap-2 mb-2">
            <div className="w-3 h-3 rounded-full" style={{ backgroundColor: page.accentColor }} />
            <h2 className="text-sm font-bold text-gray-900">{page.label}</h2>
          </div>
          <p className="text-xs text-gray-500 mb-3">{page.description}</p>

          {/* Progress bar */}
          <div className="flex items-center gap-2">
            <div className="flex-1 h-2 bg-gray-100 rounded-full overflow-hidden">
              <div
                className="h-full rounded-full transition-all duration-500"
                style={{
                  width: `${pct}%`,
                  backgroundColor: pct === 100 ? '#22C55E' : pct > 0 ? '#F59E0B' : '#E5E7EB',
                }}
              />
            </div>
            <span className="text-xs font-medium text-gray-500">{filled}/{total}</span>
          </div>
        </div>

        {/* Slot cards */}
        <div className="flex-1 overflow-auto p-3 space-y-2">
          {page.slots.map((slot) => (
            <SlotCard
              key={slot.id}
              slot={slot}
              isActive={false}
              accentColor={page.accentColor}
              onClick={() => onSlotSelect(slot)}
              onClear={() => onPickerClear(slot.id)}
            />
          ))}
        </div>

        {/* Auto-fill button */}
        <div className="p-3 border-t border-gray-100">
          <button
            onClick={async () => {
              setPrefilling(true)
              try {
                const res = await fetch('/api/report-planner/prefill?fiscalYear=2024-25')
                if (res.ok) {
                  const data = await res.json()
                  if (data.config?.[pageKey]) {
                    const prefilled = data.config[pageKey] as PageConfig
                    prefilled.slots.forEach(slot => {
                      if (slot.value) {
                        onPickerSelect(slot.id, slot.value)
                      }
                    })
                  }
                }
              } catch {
                // ignore
              } finally {
                setPrefilling(false)
              }
            }}
            disabled={prefilling}
            className="w-full flex items-center justify-center gap-2 px-4 py-2.5 text-sm bg-gradient-to-r from-[#0B4F6C] to-[#2A9D8F] text-white rounded-xl hover:opacity-90 disabled:opacity-50 transition-all font-medium"
          >
            {prefilling ? <Loader2 className="h-4 w-4 animate-spin" /> : <Sparkles className="h-4 w-4" />}
            Fill Page with AI
          </button>
        </div>
      </div>
    )
  }

  // Active slot — show the picker
  return (
    <div className="flex flex-col h-full">
      {/* Slot context bar */}
      <div className="p-4 border-b border-gray-100 bg-blue-50/50">
        <button
          onClick={() => onSlotSelect(null)}
          className="flex items-center gap-1 text-xs text-[#0B4F6C] hover:underline mb-2"
        >
          &larr; Back to all slots
        </button>
        <div className="flex items-center gap-2">
          {React.createElement(SLOT_ICONS[activeSlot.type], { className: 'h-4 w-4', style: { color: page.accentColor } })}
          <div>
            <p className="text-sm font-bold text-gray-900">{activeSlot.label}</p>
            <p className="text-[10px] text-gray-500 uppercase tracking-wider">
              Picking: {activeSlot.type}
            </p>
          </div>
        </div>
      </div>

      {/* Picker content */}
      <div className="flex-1 overflow-auto p-3">
        <SlotPicker
          slot={activeSlot}
          pageKey={pageKey}
          onSelect={(value) => onPickerSelect(activeSlot.id, value)}
          onClear={() => onPickerClear(activeSlot.id)}
        />
      </div>
    </div>
  )
}

/** Routes to the correct picker by slot type */
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
        <PersonPickerInline
          currentValue={slot.value?.type === 'person' ? slot.value : null}
          onSelect={(person) => onSelect({ type: 'person', ...person })}
        />
      )}

      {hasValue && (
        <button
          onClick={onClear}
          className="mt-3 w-full py-2 text-sm text-red-500 hover:text-red-700 hover:bg-red-50 rounded-lg border border-red-200 transition-colors"
        >
          Clear this slot
        </button>
      )}
    </div>
  )
}

/** Inline person picker */
function PersonPickerInline({
  currentValue,
  onSelect,
}: {
  currentValue: { name: string; role: string; photoUrl: string | null } | null
  onSelect: (person: { personId: string; name: string; role: string; photoUrl: string | null }) => void
}) {
  const [people, setPeople] = useState<Array<{ id: string; name: string; role: string; photo_url: string | null }>>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const load = async () => {
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
      }
    }
    load()
  }, [])

  if (loading) {
    return (
      <div className="flex items-center justify-center py-8">
        <Loader2 className="h-5 w-5 animate-spin text-gray-400" />
      </div>
    )
  }

  if (people.length === 0) {
    return <p className="text-sm text-gray-400 text-center py-6">No people found</p>
  }

  return (
    <div className="space-y-2">
      {people.map((p) => (
        <button
          key={p.id}
          onClick={() => onSelect({ personId: p.id, name: p.name, role: p.role, photoUrl: p.photo_url })}
          className={`w-full flex items-center gap-3 p-3 rounded-xl text-left border transition-all ${
            currentValue?.name === p.name
              ? 'border-[#0B4F6C] bg-blue-50 shadow-sm'
              : 'border-gray-100 hover:border-gray-200 hover:bg-gray-50'
          }`}
        >
          {p.photo_url ? (
            // eslint-disable-next-line @next/next/no-img-element
            <img src={p.photo_url} alt="" className="w-10 h-10 rounded-full object-cover" />
          ) : (
            <div className="w-10 h-10 rounded-full bg-gray-200 flex items-center justify-center text-sm font-bold text-gray-500">
              {p.name.charAt(0)}
            </div>
          )}
          <div>
            <div className="text-sm font-medium text-gray-900">{p.name}</div>
            <div className="text-xs text-gray-400">{p.role}</div>
          </div>
        </button>
      ))}
    </div>
  )
}
