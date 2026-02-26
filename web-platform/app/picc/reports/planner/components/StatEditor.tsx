'use client'

import React, { useState } from 'react'
import { Loader2, Sparkles } from 'lucide-react'
import type { ContentSlot, SlotValue, StatSlotValue, ChartSlotValue } from '@/lib/annual-report/planner-types'

interface StatEditorProps {
  slot: ContentSlot
  onSelect: (value: SlotValue) => void
}

export function StatEditor({ slot, onSelect }: StatEditorProps) {
  const currentStat = slot.value?.type === 'stat' ? slot.value : null
  const currentChart = slot.value?.type === 'chart' ? slot.value : null

  const [label, setLabel] = useState(currentStat?.label || slot.label)
  const [value, setValue] = useState(currentStat?.value || '')
  const [unit, setUnit] = useState(currentStat?.unit || '')
  const [generatingChart, setGeneratingChart] = useState(false)

  const handleApplyStat = () => {
    if (!value.trim()) return
    const sv: StatSlotValue = {
      type: 'stat',
      label: label.trim(),
      value: value.trim(),
      unit: unit.trim() || undefined,
    }
    onSelect(sv)
  }

  const handleGenerateChart = async () => {
    setGeneratingChart(true)
    try {
      const res = await fetch('/api/report-planner/generate-chart', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          slotId: slot.id,
          label: label.trim(),
          value: value.trim(),
          unit: unit.trim(),
        }),
      })

      if (!res.ok) throw new Error('Chart generation failed')
      const data = await res.json()

      const cv: ChartSlotValue = {
        type: 'chart',
        mediaFileId: data.mediaFileId || '',
        url: data.url,
        prompt: data.prompt || '',
        chartData: { label, value, unit },
      }
      onSelect(cv)
    } catch (err) {
      console.error('Chart generation failed:', err)
      alert('Chart generation failed. Please try again.')
    } finally {
      setGeneratingChart(false)
    }
  }

  if (slot.type === 'chart') {
    return (
      <div>
        {currentChart?.url && (
          <div className="mb-2">
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img src={currentChart.url} alt="Generated chart" className="w-full rounded-lg border" />
          </div>
        )}

        <div className="space-y-1.5 mb-2">
          <input
            type="text"
            value={label}
            onChange={(e) => setLabel(e.target.value)}
            placeholder="Chart description..."
            className="w-full text-xs border border-gray-200 rounded-md px-2 py-1 focus:outline-none focus:ring-1 focus:ring-[#0B4F6C]"
          />
        </div>

        <button
          onClick={handleGenerateChart}
          disabled={generatingChart || !label.trim()}
          className="flex items-center gap-1.5 px-3 py-1.5 text-xs bg-gradient-to-r from-[#0B4F6C] to-[#2A9D8F] text-white rounded-md hover:opacity-90 disabled:opacity-50 transition-all"
        >
          {generatingChart ? (
            <Loader2 className="h-3 w-3 animate-spin" />
          ) : (
            <Sparkles className="h-3 w-3" />
          )}
          Generate Chart with AI
        </button>
      </div>
    )
  }

  // Regular stat editor
  return (
    <div className="space-y-1.5">
      <input
        type="text"
        value={label}
        onChange={(e) => setLabel(e.target.value)}
        placeholder="Stat label..."
        className="w-full text-xs border border-gray-200 rounded-md px-2 py-1 focus:outline-none focus:ring-1 focus:ring-[#0B4F6C]"
      />
      <div className="flex gap-1.5">
        <input
          type="text"
          value={value}
          onChange={(e) => setValue(e.target.value)}
          placeholder="Value (e.g. 197, $23.4M)"
          className="flex-1 text-xs border border-gray-200 rounded-md px-2 py-1 focus:outline-none focus:ring-1 focus:ring-[#0B4F6C]"
        />
        <input
          type="text"
          value={unit}
          onChange={(e) => setUnit(e.target.value)}
          placeholder="Unit"
          className="w-16 text-xs border border-gray-200 rounded-md px-2 py-1 focus:outline-none focus:ring-1 focus:ring-[#0B4F6C]"
        />
      </div>
      <div className="flex gap-1.5">
        <button
          onClick={handleApplyStat}
          disabled={!value.trim()}
          className="px-3 py-1 text-xs bg-gray-900 text-white rounded-md hover:bg-gray-800 disabled:opacity-50 transition-colors"
        >
          Apply
        </button>
        <button
          onClick={handleGenerateChart}
          disabled={generatingChart || !label.trim()}
          className="flex items-center gap-1 px-3 py-1 text-xs bg-gradient-to-r from-[#0B4F6C] to-[#2A9D8F] text-white rounded-md hover:opacity-90 disabled:opacity-50 transition-all"
        >
          {generatingChart ? (
            <Loader2 className="h-3 w-3 animate-spin" />
          ) : (
            <Sparkles className="h-3 w-3" />
          )}
          Chart
        </button>
      </div>
    </div>
  )
}
