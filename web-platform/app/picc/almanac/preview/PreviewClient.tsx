'use client'

import { useState } from 'react'

export interface SectionFlagCount {
  id: string
  label: string
  flagCount: number
}

interface Props {
  almanacUrl: string
  sections: SectionFlagCount[]
  checklist: { total: number; done: number; urgentOpen: number; pct: number }
  voices: { counted: number; target: number }
  flagsTotal: number
}

export default function PreviewClient({ almanacUrl, sections, checklist, voices, flagsTotal }: Props) {
  const [activeSection, setActiveSection] = useState<string>('ceo-message')
  const [iframeKey, setIframeKey] = useState(0)
  const [width, setWidth] = useState<'desktop' | 'tablet' | 'mobile'>('desktop')

  function jumpTo(id: string) {
    setActiveSection(id)
    const iframe = document.getElementById('almanac-preview-iframe') as HTMLIFrameElement | null
    if (!iframe || !iframe.contentWindow) return
    try {
      const doc = iframe.contentWindow.document
      const target = doc.getElementById(id)
      if (target) target.scrollIntoView({ behavior: 'smooth', block: 'start' })
    } catch (e) {
      // Cross-origin should never happen (same-origin iframe), but be defensive.
      console.warn('iframe nav blocked', e)
    }
  }

  const widthClass =
    width === 'mobile' ? 'max-w-[420px]' :
    width === 'tablet' ? 'max-w-[820px]' :
    'max-w-none'

  return (
    <div className="grid grid-cols-1 lg:grid-cols-[260px_1fr] gap-0 min-h-[calc(100vh-90px)]">
      {/* ── Sidebar ── */}
      <aside className="bg-white border-r border-stone-200 p-4 sticky top-0 h-screen overflow-y-auto">
        {/* Readiness mini-card */}
        <div className="rounded-lg bg-stone-50 border border-stone-200 p-3 mb-4">
          <div className="text-xs uppercase tracking-wider text-stone-500 mb-1">Readiness</div>
          <div className="font-serif text-3xl text-stone-800 italic">{checklist.pct}%</div>
          <div className="mt-2 h-1.5 w-full rounded-full bg-stone-200 overflow-hidden">
            <div
              className={`h-full ${checklist.pct === 100 && checklist.urgentOpen === 0 ? 'bg-emerald-500' : 'bg-picc-ochre'}`}
              style={{ width: `${checklist.pct}%` }}
            />
          </div>
          <div className="mt-3 text-xs text-stone-600 space-y-1">
            <div className="flex justify-between"><span>Urgent open</span><span className={checklist.urgentOpen ? 'text-red-700 font-semibold' : ''}>{checklist.urgentOpen}</span></div>
            <div className="flex justify-between"><span>Flagged photos</span><span className={flagsTotal ? 'text-red-700 font-semibold' : ''}>{flagsTotal}</span></div>
            <div className="flex justify-between"><span>Voices</span><span>{voices.counted}/{voices.target}</span></div>
          </div>
        </div>

        {/* Section nav */}
        <div className="text-xs font-semibold tracking-[0.15em] uppercase text-stone-500 mb-2">
          Sections
        </div>
        <div className="space-y-1">
          {sections.map((s) => (
            <button
              key={s.id}
              onClick={() => jumpTo(s.id)}
              className={`w-full text-left px-3 py-2 rounded-md text-sm flex items-center justify-between transition ${
                activeSection === s.id
                  ? 'bg-picc-ochre/15 text-stone-900 font-semibold'
                  : 'text-stone-700 hover:bg-stone-100'
              }`}
            >
              <span>{s.label}</span>
              {s.flagCount > 0 && (
                <span className="text-[10px] px-1.5 py-0.5 rounded-full bg-red-600 text-white font-semibold">
                  {s.flagCount}
                </span>
              )}
            </button>
          ))}
        </div>

        {/* Width controls */}
        <div className="mt-6">
          <div className="text-xs font-semibold tracking-[0.15em] uppercase text-stone-500 mb-2">
            Viewport
          </div>
          <div className="flex gap-1">
            {(['mobile', 'tablet', 'desktop'] as const).map((w) => (
              <button
                key={w}
                onClick={() => setWidth(w)}
                className={`flex-1 px-2 py-1.5 rounded text-xs ${
                  width === w ? 'bg-stone-800 text-white' : 'bg-stone-100 text-stone-700 hover:bg-stone-200'
                }`}
              >
                {w === 'mobile' && '📱'}
                {w === 'tablet' && '📱'}
                {w === 'desktop' && '🖥'}
                {' '}
                {w[0].toUpperCase() + w.slice(1)}
              </button>
            ))}
          </div>
          <button
            onClick={() => setIframeKey((k) => k + 1)}
            className="mt-3 w-full px-3 py-2 rounded text-xs bg-stone-100 hover:bg-stone-200 text-stone-700"
          >
            ↻ Reload preview
          </button>
        </div>
      </aside>

      {/* ── Iframe stage ── */}
      <main className="bg-stone-100 p-4">
        <div className={`mx-auto ${widthClass} bg-white rounded-lg shadow-lg overflow-hidden border border-stone-200`}>
          <iframe
            key={iframeKey}
            id="almanac-preview-iframe"
            src={almanacUrl}
            title="Almanac preview"
            className="w-full"
            style={{ height: 'calc(100vh - 130px)' }}
          />
        </div>
      </main>
    </div>
  )
}
