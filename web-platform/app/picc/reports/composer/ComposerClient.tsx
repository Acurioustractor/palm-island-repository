'use client'

import React, { useState, useEffect, useCallback, useRef } from 'react'
import { Download, Loader2, Save, Eye } from 'lucide-react'
import DistributionPanel from '@/components/reports/DistributionPanel'
import { PageStrip } from './components/PageStrip'
import { PagePreview } from './components/PagePreview'
import { ContentPickerPanel } from './components/ContentPickerPanel'
import { getDefaultPageConfigs, getOrderedPageKeys } from '@/lib/annual-report/planner-config'
import { shouldShow, type ReportAudience } from '@/lib/annual-report/audience-config'
import type { PageConfig, SlotValue, ContentSlot } from '@/lib/annual-report/planner-types'

const AUDIENCES: { id: ReportAudience; label: string }[] = [
  { id: null, label: 'All Pages' },
  { id: 'community', label: 'Community' },
  { id: 'funder', label: 'Funders' },
  { id: 'supporter', label: 'Supporters' },
  { id: 'board', label: 'Board' },
  { id: 'government', label: 'Government' },
]

const YEARS = ['2024-25', '2023-24'] as const

export function ComposerClient() {
  const [fiscalYear, setFiscalYear] = useState<string>('2024-25')
  const [audience, setAudience] = useState<ReportAudience>(null)
  const [pages, setPages] = useState<Record<string, PageConfig>>(() => getDefaultPageConfigs())
  const [selectedPageKey, setSelectedPageKey] = useState<string>('cover')
  const [activeSlot, setActiveSlot] = useState<ContentSlot | null>(null)
  const [saving, setSaving] = useState(false)
  const [generating, setGenerating] = useState(false)
  const [generated, setGenerated] = useState(false)
  const [previewing, setPreviewing] = useState(false)
  const [configId, setConfigId] = useState<string | null>(null)
  const [dirty, setDirty] = useState(false)
  const [lastSaved, setLastSaved] = useState<string | null>(null)
  const saveTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null)

  // Load saved config on mount or when year/audience changes
  useEffect(() => {
    loadConfig()
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [fiscalYear, audience])

  const loadConfig = useCallback(async () => {
    try {
      const params = new URLSearchParams({ fiscalYear })
      if (audience) params.set('audience', audience)
      const res = await fetch(`/api/report-planner?${params}`)
      if (res.ok) {
        const data = await res.json()
        if (data.config) {
          setPages(data.config)
          setConfigId(data.id || null)
          setDirty(false)
          return
        }
      }
    } catch {
      // Fall through to prefill
    }

    try {
      const prefillRes = await fetch(`/api/report-planner/prefill?fiscalYear=${fiscalYear}`)
      if (prefillRes.ok) {
        const prefillData = await prefillRes.json()
        if (prefillData.config && prefillData.prefilled) {
          setPages(prefillData.config)
          setConfigId(null)
          setDirty(false)
          return
        }
      }
    } catch {
      // Fall through to defaults
    }

    setPages(getDefaultPageConfigs())
    setConfigId(null)
    setDirty(false)
  }, [fiscalYear, audience])

  const handleSlotUpdate = useCallback((pageKey: string, slotId: string, value: SlotValue | null) => {
    setPages((prev) => {
      const page = prev[pageKey]
      if (!page) return prev
      const newSlots = page.slots.map((slot) =>
        slot.id === slotId ? { ...slot, value } : slot
      )
      return {
        ...prev,
        [pageKey]: { ...page, slots: newSlots },
      }
    })
    setDirty(true)

    // Auto-save with debounce
    if (saveTimerRef.current) clearTimeout(saveTimerRef.current)
    saveTimerRef.current = setTimeout(() => {
      autoSave()
    }, 2000)
  }, []) // eslint-disable-line react-hooks/exhaustive-deps

  const autoSave = async () => {
    setSaving(true)
    try {
      const body: Record<string, unknown> = {
        fiscalYear,
        audience,
        config: pages,
      }
      if (configId) body.id = configId
      const res = await fetch('/api/report-planner', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(body),
      })
      if (res.ok) {
        const data = await res.json()
        setConfigId(data.id)
        setDirty(false)
        setLastSaved(new Date().toLocaleTimeString())
      }
    } catch {
      // Silent fail for auto-save
    } finally {
      setSaving(false)
    }
  }

  const handleSave = async () => {
    if (saveTimerRef.current) clearTimeout(saveTimerRef.current)
    setSaving(true)
    try {
      const body: Record<string, unknown> = {
        fiscalYear,
        audience,
        config: pages,
      }
      if (configId) body.id = configId
      const res = await fetch('/api/report-planner', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(body),
      })
      if (!res.ok) throw new Error('Save failed')
      const data = await res.json()
      setConfigId(data.id)
      setDirty(false)
      setLastSaved(new Date().toLocaleTimeString())
    } catch {
      alert('Failed to save. Please try again.')
    } finally {
      setSaving(false)
    }
  }

  const handleGenerate = async () => {
    setGenerating(true)
    try {
      const res = await fetch('/api/report-planner/generate', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ fiscalYear, audience, config: pages }),
      })
      if (!res.ok) throw new Error('Generation failed')
      const blob = await res.blob()
      const url = URL.createObjectURL(blob)
      const a = document.createElement('a')
      a.href = url
      a.download = `PICC-Annual-Report-${fiscalYear}${audience ? `-${audience}` : ''}.pdf`
      document.body.appendChild(a)
      a.click()
      document.body.removeChild(a)
      URL.revokeObjectURL(url)
      setGenerated(true)
    } catch {
      alert('PDF generation failed. Please try again.')
    } finally {
      setGenerating(false)
    }
  }

  const handlePreview = async () => {
    setPreviewing(true)
    try {
      const res = await fetch('/api/report-planner/generate', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ fiscalYear, audience, config: pages }),
      })
      if (!res.ok) throw new Error('Preview failed')
      const blob = await res.blob()
      const url = URL.createObjectURL(blob)
      window.open(url, '_blank')
    } catch {
      alert('Preview generation failed. Please try again.')
    } finally {
      setPreviewing(false)
    }
  }

  // Handle slot click from preview — open picker for that slot
  const handleSlotClick = useCallback((slot: ContentSlot) => {
    setActiveSlot(slot)
  }, [])

  // After picking content, auto-advance to next empty slot on same page
  const handlePickerSelect = useCallback((slotId: string, value: SlotValue) => {
    if (!selectedPageKey) return
    handleSlotUpdate(selectedPageKey, slotId, value)

    // Auto-advance to next empty slot
    const page = pages[selectedPageKey]
    if (!page) return
    const currentIdx = page.slots.findIndex(s => s.id === slotId)
    const nextEmpty = page.slots.find((s, i) => i > currentIdx && s.value === null)
    if (nextEmpty) {
      setActiveSlot(nextEmpty)
    } else {
      setActiveSlot(null)
    }
  }, [selectedPageKey, pages, handleSlotUpdate])

  const handlePickerClear = useCallback((slotId: string) => {
    if (!selectedPageKey) return
    handleSlotUpdate(selectedPageKey, slotId, null)
  }, [selectedPageKey, handleSlotUpdate])

  const orderedKeys = getOrderedPageKeys()
  const visibleKeys = orderedKeys.filter(k => shouldShow(k, audience))
  const hiddenKeys = orderedKeys.filter(k => !shouldShow(k, audience))

  const selectedPage = selectedPageKey ? pages[selectedPageKey] : null

  // Progress tracking
  const totalVisibleSlots = visibleKeys.reduce(
    (acc, key) => acc + (pages[key]?.slots.length || 0), 0
  )
  const filledVisibleSlots = visibleKeys.reduce(
    (acc, key) => acc + (pages[key]?.slots.filter(s => s.value !== null).length || 0), 0
  )
  const readyPages = visibleKeys.filter(key => {
    const page = pages[key]
    if (!page) return false
    return page.slots.every(s => s.value !== null)
  }).length

  return (
    <div className="min-h-screen bg-[#F7F6F4] flex flex-col">
      {/* Top Bar */}
      <header className="bg-white border-b border-gray-200 sticky top-0 z-30">
        <div className="max-w-[1600px] mx-auto px-4 py-3">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img src="/picc-logo.png" alt="PICC" className="h-8 w-8 object-contain" />
              <div>
                <h1 className="text-base font-bold text-gray-900">Report Composer</h1>
                <p className="text-xs text-gray-400">
                  {readyPages} of {visibleKeys.length} pages ready
                  {lastSaved && !dirty && <span className="ml-2 text-green-600">Saved {lastSaved}</span>}
                  {dirty && <span className="ml-2 text-amber-600">Unsaved</span>}
                </p>
              </div>
            </div>

            <div className="flex items-center gap-2">
              <button
                onClick={handleSave}
                disabled={saving || !dirty}
                className="flex items-center gap-1.5 px-4 py-2 text-sm border border-gray-200 rounded-lg hover:bg-gray-50 disabled:opacity-40 transition-colors"
              >
                {saving ? <Loader2 className="h-4 w-4 animate-spin" /> : <Save className="h-4 w-4" />}
                Save
              </button>
              <button
                onClick={handlePreview}
                disabled={previewing}
                className="flex items-center gap-1.5 px-4 py-2 text-sm text-[#0B4F6C] border border-[#0B4F6C]/30 rounded-lg hover:bg-blue-50 disabled:opacity-40 transition-colors"
              >
                {previewing ? <Loader2 className="h-4 w-4 animate-spin" /> : <Eye className="h-4 w-4" />}
                Preview
              </button>
              <button
                onClick={handleGenerate}
                disabled={generating}
                className="flex items-center gap-1.5 px-5 py-2 text-sm bg-[#0B4F6C] text-white rounded-lg hover:bg-[#0A4560] disabled:opacity-40 transition-colors font-medium"
              >
                {generating ? <Loader2 className="h-4 w-4 animate-spin" /> : <Download className="h-4 w-4" />}
                Download PDF
              </button>
            </div>
          </div>

          {/* Year + Audience pills */}
          <div className="flex items-center gap-4 mt-3">
            <div className="flex items-center gap-2">
              <span className="text-xs font-medium text-gray-500 uppercase tracking-wider">Year</span>
              {YEARS.map((yr) => (
                <button
                  key={yr}
                  onClick={() => setFiscalYear(yr)}
                  className={`px-4 py-1.5 text-sm rounded-full border transition-colors ${
                    fiscalYear === yr
                      ? 'bg-gray-900 text-white border-gray-900'
                      : 'bg-white text-gray-600 border-gray-200 hover:border-gray-400'
                  }`}
                >
                  {yr}
                </button>
              ))}
            </div>
            <div className="w-px h-6 bg-gray-200" />
            <div className="flex items-center gap-2">
              <span className="text-xs font-medium text-gray-500 uppercase tracking-wider">For</span>
              {AUDIENCES.map((aud) => (
                <button
                  key={aud.id ?? 'all'}
                  onClick={() => setAudience(aud.id)}
                  className={`px-4 py-1.5 text-sm rounded-full border transition-colors ${
                    audience === aud.id
                      ? 'bg-[#0B4F6C] text-white border-[#0B4F6C]'
                      : 'bg-white text-gray-600 border-gray-200 hover:border-gray-400'
                  }`}
                >
                  {aud.label}
                </button>
              ))}
            </div>
          </div>
        </div>
      </header>

      {/* Page Strip */}
      <div className="bg-white border-b border-gray-200">
        <div className="max-w-[1600px] mx-auto">
          <PageStrip
            pages={pages}
            visibleKeys={visibleKeys}
            hiddenKeys={hiddenKeys}
            selectedPageKey={selectedPageKey}
            onSelectPage={(key) => {
              setSelectedPageKey(key)
              setActiveSlot(null)
            }}
          />
        </div>
      </div>

      {/* Main content: Preview + Picker */}
      <div className="flex-1 flex max-w-[1600px] mx-auto w-full">
        {/* Page Preview */}
        <div className="flex-1 p-6 flex items-start justify-center overflow-auto">
          {selectedPage && selectedPageKey && (
            <PagePreview
              page={selectedPage}
              pageKey={selectedPageKey}
              activeSlotId={activeSlot?.id || null}
              onSlotClick={handleSlotClick}
            />
          )}
        </div>

        {/* Content Picker Panel */}
        <div className="w-[400px] border-l border-gray-200 bg-white overflow-auto" style={{ maxHeight: 'calc(100vh - 180px)' }}>
          {selectedPage && selectedPageKey && (
            <ContentPickerPanel
              page={selectedPage}
              pageKey={selectedPageKey}
              activeSlot={activeSlot}
              onSlotSelect={setActiveSlot}
              onPickerSelect={handlePickerSelect}
              onPickerClear={handlePickerClear}
            />
          )}
        </div>
      </div>

      {/* Distribution Panel — shown after PDF generation */}
      {generated && (
        <div className="max-w-[1600px] mx-auto w-full px-4 pb-6">
          <DistributionPanel
            fiscalYear={fiscalYear}
            audience={audience || 'all'}
            reportUrl={`/api/pdf/generate?type=annual-report&year=${fiscalYear}${audience ? `&audience=${audience}` : ''}`}
          />
        </div>
      )}
    </div>
  )
}
