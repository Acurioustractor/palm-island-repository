'use client'

import React, { useState, useEffect, useCallback } from 'react'
import {
  FileText, Download, Loader2, Save, RotateCcw, Eye,
} from 'lucide-react'
import { PageGrid } from './components/PageGrid'
import { ContentSidebar } from './components/ContentSidebar'
import { getDefaultPageConfigs, getOrderedPageKeys } from '@/lib/annual-report/planner-config'
import { shouldShow, type ReportAudience, AUDIENCE_CONFIGS } from '@/lib/annual-report/audience-config'
import type { PageConfig, PlannerConfig, ContentSlot, SlotValue } from '@/lib/annual-report/planner-types'

const AUDIENCES: { id: ReportAudience; label: string }[] = [
  { id: null, label: 'All Pages' },
  { id: 'community', label: 'Community' },
  { id: 'funder', label: 'Funders' },
  { id: 'supporter', label: 'Supporters' },
  { id: 'board', label: 'Board' },
  { id: 'government', label: 'Government' },
]

const YEARS = ['2024-25', '2023-24'] as const

export function PlannerClient() {
  const [fiscalYear, setFiscalYear] = useState<string>('2024-25')
  const [audience, setAudience] = useState<ReportAudience>(null)
  const [pages, setPages] = useState<Record<string, PageConfig>>(() => getDefaultPageConfigs())
  const [selectedPageKey, setSelectedPageKey] = useState<string | null>(null)
  const [saving, setSaving] = useState(false)
  const [generating, setGenerating] = useState(false)
  const [configId, setConfigId] = useState<string | null>(null)
  const [dirty, setDirty] = useState(false)

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

    // No saved config — try to pre-populate from existing report data
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
  }, [])

  const handleSave = async () => {
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
    } catch (err) {
      console.error('Failed to save planner config:', err)
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
      a.download = `PICC-Annual-Report-${fiscalYear}${audience ? `-${audience}` : ''}-planner.pdf`
      document.body.appendChild(a)
      a.click()
      document.body.removeChild(a)
      URL.revokeObjectURL(url)
    } catch (err) {
      console.error('PDF generation failed:', err)
      alert('PDF generation failed. Please try again.')
    } finally {
      setGenerating(false)
    }
  }

  const [previewing, setPreviewing] = useState(false)

  const handlePreview = async () => {
    setPreviewing(true)
    try {
      const res = await fetch('/api/report-planner/generate', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ fiscalYear, audience, config: pages }),
      })
      if (!res.ok) throw new Error('Preview generation failed')

      const blob = await res.blob()
      const url = URL.createObjectURL(blob)
      window.open(url, '_blank')
    } catch (err) {
      console.error('Preview failed:', err)
      alert('Preview generation failed. Please try again.')
    } finally {
      setPreviewing(false)
    }
  }

  const handleReset = () => {
    if (!confirm('Reset all content to defaults? Unsaved changes will be lost.')) return
    setPages(getDefaultPageConfigs())
    setDirty(true)
  }

  const selectedPage = selectedPageKey ? pages[selectedPageKey] : null
  const orderedKeys = getOrderedPageKeys()

  // Count filled slots across all pages
  const filledSlots = Object.values(pages).reduce(
    (acc, page) => acc + page.slots.filter((s) => s.value !== null).length,
    0
  )
  const totalSlots = Object.values(pages).reduce(
    (acc, page) => acc + page.slots.length,
    0
  )

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Top bar */}
      <div className="bg-white border-b border-gray-200 sticky top-0 z-30">
        <div className="max-w-[1600px] mx-auto px-4 py-3 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <FileText className="h-5 w-5 text-[#0B4F6C]" />
            <h1 className="text-lg font-bold text-gray-900">Report Content Planner</h1>
            <span className="text-sm text-gray-400">
              {filledSlots}/{totalSlots} slots configured
            </span>
            {dirty && (
              <span className="text-xs text-amber-600 bg-amber-50 px-2 py-0.5 rounded-full">
                Unsaved changes
              </span>
            )}
          </div>
          <div className="flex items-center gap-2">
            <button
              onClick={handleReset}
              className="flex items-center gap-1.5 px-3 py-1.5 text-sm text-gray-500 hover:text-gray-700 border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors"
            >
              <RotateCcw className="h-3.5 w-3.5" />
              Reset
            </button>
            <button
              onClick={handleSave}
              disabled={saving || !dirty}
              className="flex items-center gap-1.5 px-3 py-1.5 text-sm bg-gray-900 text-white rounded-lg hover:bg-gray-800 disabled:opacity-50 transition-colors"
            >
              {saving ? <Loader2 className="h-3.5 w-3.5 animate-spin" /> : <Save className="h-3.5 w-3.5" />}
              Save
            </button>
            <button
              onClick={handlePreview}
              disabled={previewing}
              className="flex items-center gap-1.5 px-3 py-1.5 text-sm text-[#0B4F6C] border border-[#0B4F6C]/30 rounded-lg hover:bg-blue-50 disabled:opacity-50 transition-colors"
            >
              {previewing ? <Loader2 className="h-3.5 w-3.5 animate-spin" /> : <Eye className="h-3.5 w-3.5" />}
              Preview
            </button>
            <button
              onClick={handleGenerate}
              disabled={generating}
              className="flex items-center gap-1.5 px-4 py-1.5 text-sm bg-[#0B4F6C] text-white rounded-lg hover:bg-[#0A4560] disabled:opacity-50 transition-colors"
            >
              {generating ? <Loader2 className="h-3.5 w-3.5 animate-spin" /> : <Download className="h-3.5 w-3.5" />}
              Generate PDF
            </button>
          </div>
        </div>

        {/* Audience + Year selectors */}
        <div className="max-w-[1600px] mx-auto px-4 pb-3 flex items-center gap-4">
          <div className="flex items-center gap-2">
            <span className="text-xs font-medium text-gray-500 uppercase tracking-wider">Year</span>
            {YEARS.map((yr) => (
              <button
                key={yr}
                onClick={() => setFiscalYear(yr)}
                className={`px-3 py-1 text-xs rounded-full border transition-colors ${
                  fiscalYear === yr
                    ? 'bg-gray-900 text-white border-gray-900'
                    : 'bg-white text-gray-600 border-gray-200 hover:border-gray-400'
                }`}
              >
                {yr}
              </button>
            ))}
          </div>
          <div className="w-px h-5 bg-gray-200" />
          <div className="flex items-center gap-2">
            <span className="text-xs font-medium text-gray-500 uppercase tracking-wider">Audience</span>
            {AUDIENCES.map((aud) => (
              <button
                key={aud.id ?? 'all'}
                onClick={() => setAudience(aud.id)}
                className={`px-3 py-1 text-xs rounded-full border transition-colors ${
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

      {/* Main content: grid + sidebar */}
      <div className="max-w-[1600px] mx-auto flex">
        {/* Page grid — left side */}
        <div className="flex-1 p-4 overflow-auto" style={{ maxHeight: 'calc(100vh - 120px)' }}>
          <PageGrid
            pages={pages}
            orderedKeys={orderedKeys}
            audience={audience}
            selectedPageKey={selectedPageKey}
            onSelectPage={setSelectedPageKey}
          />
        </div>

        {/* Content sidebar — right side */}
        {selectedPage && selectedPageKey && (
          <div className="w-[420px] border-l border-gray-200 bg-white overflow-auto" style={{ maxHeight: 'calc(100vh - 120px)' }}>
            <ContentSidebar
              page={selectedPage}
              pageKey={selectedPageKey}
              onSlotUpdate={(slotId, value) => handleSlotUpdate(selectedPageKey, slotId, value)}
              onClose={() => setSelectedPageKey(null)}
            />
          </div>
        )}
      </div>
    </div>
  )
}
