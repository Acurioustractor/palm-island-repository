'use client'

/**
 * CanvasStage — A/B harness for `?renderer=canvas` on /living-atlas.
 *
 * Reads the renderer query param client-side. If `canvas`, swaps the SVG
 * Constellation stage for the CanvasField. Otherwise renders the SVG
 * Constellation. Both surfaces stay available so we can compare perf
 * side-by-side without forking routes.
 */

import { useSearchParams } from 'next/navigation'
import { useState } from 'react'
import Constellation from '../picc/constellation/Constellation'
import CanvasField from '../picc/constellation/CanvasField'
import type {
  ConstellationPayload,
  FaceNode,
  ThemeWell,
} from '@/lib/constellation/types'

export default function CanvasStage({
  data,
  immersive = false,
}: {
  data: ConstellationPayload
  immersive?: boolean
}) {
  const params = useSearchParams()
  const renderer = params.get('renderer')
  const [activeFace, setActiveFace] = useState<FaceNode | null>(null)
  const [activeTheme, setActiveTheme] = useState<string | null>(null)

  if (renderer !== 'canvas') {
    return <Constellation data={data} variant="atlas" immersive={immersive} />
  }

  // Canvas variant — minimal chrome on top of CanvasField. Future stages
  // can fold in the rails + tabs once the canvas surface is field-tested.
  return (
    <div className="bg-cream">
      <div className="flex items-center justify-between px-4 py-2.5 border-b border-stone-200 bg-white/80">
        <div className="flex items-baseline gap-3">
          <span className="text-[10px] uppercase tracking-[0.3em] text-ochre font-bold">
            Atlas · canvas renderer (experimental)
          </span>
          <a
            href="?renderer=svg"
            className="text-[11px] underline text-stone-600 hover:text-charcoal"
          >
            switch to SVG
          </a>
        </div>
        {activeFace && (
          <div className="text-xs text-stone-700">
            <span className="font-serif">{activeFace.name}</span>
            {activeFace.role && (
              <span className="text-stone-500"> · {activeFace.role}</span>
            )}
            <button
              type="button"
              onClick={() => setActiveFace(null)}
              className="ml-3 text-stone-500 hover:text-charcoal"
            >
              clear
            </button>
          </div>
        )}
      </div>
      <CanvasField
        faces={data.faces}
        themes={data.themes}
        height={640}
        activeTheme={activeTheme}
        onFaceClick={(f) => setActiveFace(f)}
        onThemeClick={(t: ThemeWell) =>
          setActiveTheme((curr) => (curr === t.key ? null : t.key))
        }
      />
      <div className="px-4 py-3 text-[11px] text-stone-500 italic border-t border-stone-200">
        Canvas renderer preview · ~{data.faces.length} faces, {data.themes.length}{' '}
        themes. Drag to pan, scroll to zoom, click any face or theme.
        Stage 5 acceptance: 60fps on a 2020 MacBook.
      </div>
    </div>
  )
}
