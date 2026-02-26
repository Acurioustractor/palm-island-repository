'use client'

import React, { useState } from 'react'
import { Sparkles, Loader2, Check, RotateCcw } from 'lucide-react'

interface TextEditorProps {
  currentValue: string
  onSave: (content: string) => void
  slotLabel?: string
  slotId?: string
  pageKey?: string
  fiscalYear?: string
  audience?: string
}

export function TextEditor({
  currentValue,
  onSave,
  slotLabel,
  slotId,
  pageKey,
  fiscalYear = '2024-25',
  audience,
}: TextEditorProps) {
  const [text, setText] = useState(currentValue)
  const [aiDraft, setAiDraft] = useState<string | null>(null)
  const [generating, setGenerating] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const handleWriteWithAI = async () => {
    setGenerating(true)
    setError(null)
    try {
      const res = await fetch('/api/report-planner/write-copy', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          pageKey,
          slotId,
          slotLabel,
          fiscalYear,
          audience,
          existingText: text || undefined,
        }),
      })
      if (!res.ok) {
        const data = await res.json().catch(() => ({}))
        throw new Error(data.error || 'AI generation failed')
      }
      const data = await res.json()
      setAiDraft(data.text)
    } catch (err: any) {
      setError(err.message || 'Failed to generate copy')
    } finally {
      setGenerating(false)
    }
  }

  const handleUseDraft = () => {
    if (aiDraft) {
      setText(aiDraft)
      setAiDraft(null)
    }
  }

  const handleDismissDraft = () => {
    setAiDraft(null)
  }

  return (
    <div>
      <textarea
        value={text}
        onChange={(e) => setText(e.target.value)}
        rows={4}
        className="w-full text-xs border border-gray-200 rounded-lg p-2 focus:outline-none focus:ring-1 focus:ring-[#0B4F6C] resize-y"
        placeholder="Enter text content..."
      />

      <div className="flex items-center gap-2 mt-1.5">
        <button
          onClick={() => onSave(text)}
          disabled={!text.trim()}
          className="px-3 py-1 text-xs bg-gray-900 text-white rounded-md hover:bg-gray-800 disabled:opacity-50 transition-colors"
        >
          Apply
        </button>

        {pageKey && slotId && (
          <button
            onClick={handleWriteWithAI}
            disabled={generating}
            className="flex items-center gap-1 px-3 py-1 text-xs text-[#0B4F6C] border border-[#0B4F6C]/30 rounded-md hover:bg-blue-50 disabled:opacity-50 transition-colors"
          >
            {generating ? (
              <>
                <Loader2 className="h-3 w-3 animate-spin" />
                Writing...
              </>
            ) : (
              <>
                <Sparkles className="h-3 w-3" />
                Write with AI
              </>
            )}
          </button>
        )}
      </div>

      {error && (
        <p className="mt-1.5 text-[10px] text-red-500">{error}</p>
      )}

      {/* AI Draft preview */}
      {aiDraft && (
        <div className="mt-2 border border-blue-200 rounded-lg bg-blue-50/50 p-2.5">
          <div className="flex items-center gap-1.5 mb-1.5">
            <Sparkles className="h-3 w-3 text-[#0B4F6C]" />
            <span className="text-[10px] font-medium text-[#0B4F6C]">AI Draft</span>
          </div>
          <p className="text-xs text-gray-700 whitespace-pre-wrap leading-relaxed max-h-32 overflow-auto">
            {aiDraft}
          </p>
          <div className="flex items-center gap-2 mt-2">
            <button
              onClick={handleUseDraft}
              className="flex items-center gap-1 px-2.5 py-1 text-[10px] bg-[#0B4F6C] text-white rounded-md hover:bg-[#0A4560] transition-colors"
            >
              <Check className="h-2.5 w-2.5" />
              Use This
            </button>
            <button
              onClick={handleDismissDraft}
              className="flex items-center gap-1 px-2.5 py-1 text-[10px] text-gray-500 border border-gray-200 rounded-md hover:bg-gray-50 transition-colors"
            >
              <RotateCcw className="h-2.5 w-2.5" />
              Discard
            </button>
          </div>
        </div>
      )}
    </div>
  )
}
