'use client'

/**
 * CanvasField — `react-force-graph-2d` backed alternative to the SVG stage.
 *
 * Built for the kiosk / TV use case where SVG starts to struggle at higher
 * face counts. Renders into a single canvas element + GPU; supports drag,
 * pinch zoom, pan, and per-node hover all on the same surface.
 *
 * Same props shape as the SVG stage: face list, theme well count and key,
 * onFaceClick. Themes are drawn as fixed labelled rings; faces drift in a
 * simple gravitational layout managed by the library.
 *
 * Behind a feature flag (`?renderer=canvas` on /living-atlas) so we can
 * A/B against SVG.
 */

import { useCallback, useEffect, useMemo, useRef, useState } from 'react'
import type { FaceNode, ThemeWell } from '@/lib/constellation/types'

// Dynamically import to keep the canvas lib out of the SSR bundle.
import dynamic from 'next/dynamic'
const ForceGraph2D = dynamic(
  () => import('react-force-graph-2d').then((m) => m.default),
  { ssr: false },
)

interface CanvasFieldProps {
  faces: FaceNode[]
  themes: ThemeWell[]
  height?: number
  /** Currently-selected theme key; matched faces stay opaque, others fade. */
  activeTheme?: string | null
  /** Click handler for a face node. */
  onFaceClick?: (face: FaceNode) => void
  /** Click handler for a theme node. */
  onThemeClick?: (theme: ThemeWell) => void
}

interface Node {
  id: string
  kind: 'face' | 'theme'
  label: string
  /** Pre-loaded HTMLImageElement for face nodes; ref to themeWell otherwise. */
  img?: HTMLImageElement
  count?: number
  face?: FaceNode
  theme?: ThemeWell
  fx?: number
  fy?: number
}

interface Link {
  source: string
  target: string
}

const FACE_RADIUS = 14
const THEME_RADIUS = 22
const ELDER_RING = '#B8860B'
const VOICE_RINGS: Record<string, string> = {
  organisation: '#2D5F4F',
  staff: '#5B8A72',
  community: '#D4A373',
  supporter: '#D97757',
  governance: '#2C2C2C',
}

function ringColour(face: FaceNode): string {
  if (face.is_elder) return ELDER_RING
  if (face.kind === 'leadership') return VOICE_RINGS.organisation
  if (face.kind === 'board') return VOICE_RINGS.governance
  if (face.is_featured) return VOICE_RINGS.staff
  return VOICE_RINGS.community
}

export default function CanvasField({
  faces,
  themes,
  height = 640,
  activeTheme = null,
  onFaceClick,
  onThemeClick,
}: CanvasFieldProps) {
  const containerRef = useRef<HTMLDivElement>(null)
  const [width, setWidth] = useState(900)
  const [imageCache, setImageCache] = useState<Map<string, HTMLImageElement>>(
    new Map(),
  )

  // Responsive width
  useEffect(() => {
    if (!containerRef.current) return
    const ro = new ResizeObserver((entries) => {
      const w = entries[0].contentRect.width
      if (w > 200) setWidth(w)
    })
    ro.observe(containerRef.current)
    return () => ro.disconnect()
  }, [])

  // Preload face thumbnails into HTMLImageElement objects so the canvas
  // renderer can draw them directly per frame without re-decoding.
  useEffect(() => {
    let cancelled = false
    const map = new Map<string, HTMLImageElement>()
    let pending = faces.length
    if (pending === 0) {
      setImageCache(map)
      return
    }
    faces.forEach((f) => {
      const img = new Image()
      img.crossOrigin = 'anonymous'
      img.onload = () => {
        map.set(f.id, img)
        pending -= 1
        if (pending === 0 && !cancelled) setImageCache(new Map(map))
      }
      img.onerror = () => {
        pending -= 1
        if (pending === 0 && !cancelled) setImageCache(new Map(map))
      }
      img.src = f.thumb_url
    })
    return () => {
      cancelled = true
    }
  }, [faces])

  // Build nodes + links — themes are pinned in a ring, faces are free.
  const graph = useMemo(() => {
    const cx = 0
    const cy = 0
    const ringRadius = Math.min(width, height) * 0.34
    const themeNodes: Node[] = themes.map((t, i) => {
      const angle = (i / Math.max(1, themes.length)) * Math.PI * 2 - Math.PI / 2
      return {
        id: `theme:${t.key}`,
        kind: 'theme',
        label: t.label,
        count: t.count,
        theme: t,
        fx: cx + Math.cos(angle) * ringRadius,
        fy: cy + Math.sin(angle) * ringRadius,
      }
    })
    const faceNodes: Node[] = faces.map((f) => ({
      id: f.id,
      kind: 'face',
      label: f.name ?? f.attribution ?? '',
      face: f,
      img: imageCache.get(f.id),
    }))
    // Light links from each face to one theme (round-robin) so the force
    // simulation has structure to pull on.
    const links: Link[] =
      themes.length === 0
        ? []
        : faces.map((f, i) => ({
            source: f.id,
            target: `theme:${themes[i % themes.length].key}`,
          }))
    return {
      nodes: [...themeNodes, ...faceNodes],
      links,
    }
  }, [faces, themes, width, height, imageCache])

  const draw = useCallback(
    (
      node: Node,
      ctx: CanvasRenderingContext2D,
      _globalScale: number,
    ) => {
      if (node.kind === 'theme' && node.theme) {
        // Theme well — filled circle, label, count.
        const isActive = activeTheme === node.theme.key
        const r = THEME_RADIUS + Math.sqrt(node.theme.count) * 1.4
        ctx.beginPath()
        ctx.arc(node.fx ?? 0, node.fy ?? 0, r, 0, Math.PI * 2)
        ctx.fillStyle = isActive ? '#2D5F4F' : '#F4E9DC'
        ctx.fill()
        ctx.lineWidth = 1.5
        ctx.strokeStyle = '#2D5F4F'
        ctx.stroke()
        ctx.fillStyle = isActive ? '#FBF6EE' : '#2C2C2C'
        ctx.font = '700 12px Georgia'
        ctx.textAlign = 'center'
        ctx.textBaseline = 'middle'
        ctx.fillText(node.theme.label, node.fx ?? 0, node.fy ?? 0)
        ctx.font = '10px Inter'
        ctx.fillStyle = isActive ? '#E7D7C4' : '#6B5D4F'
        ctx.fillText(
          String(node.theme.count),
          node.fx ?? 0,
          (node.fy ?? 0) + r - 10,
        )
        return
      }
      if (!node.face) return
      const x = (node as any).x ?? 0
      const y = (node as any).y ?? 0
      const matchedTheme =
        activeTheme === null ||
        (node.face.service_slugs.length === 0 &&
          node.face.project_slugs.length === 0)
      // Faces stay opaque when no theme active; otherwise dim.
      const opacity = activeTheme === null ? 1 : matchedTheme ? 1 : 0.25
      const ring = ringColour(node.face)
      // Outer ring
      ctx.globalAlpha = opacity
      ctx.beginPath()
      ctx.arc(x, y, FACE_RADIUS + (node.face.is_elder ? 3 : 2), 0, Math.PI * 2)
      ctx.lineWidth = node.face.is_elder ? 2.5 : 1.8
      ctx.strokeStyle = ring
      ctx.stroke()
      // Photo (or placeholder)
      if (node.img && node.img.complete && node.img.naturalWidth > 0) {
        ctx.save()
        ctx.beginPath()
        ctx.arc(x, y, FACE_RADIUS, 0, Math.PI * 2)
        ctx.clip()
        ctx.drawImage(
          node.img,
          x - FACE_RADIUS,
          y - FACE_RADIUS,
          FACE_RADIUS * 2,
          FACE_RADIUS * 2,
        )
        ctx.restore()
      } else {
        ctx.beginPath()
        ctx.arc(x, y, FACE_RADIUS, 0, Math.PI * 2)
        ctx.fillStyle = '#E3D5C5'
        ctx.fill()
      }
      ctx.globalAlpha = 1
    },
    [activeTheme],
  )

  return (
    <div ref={containerRef} className="w-full" style={{ height }}>
      <ForceGraph2D
        width={width}
        height={height}
        graphData={graph as any}
        nodeRelSize={1}
        nodeCanvasObject={(node: any, ctx, scale) =>
          draw(node as Node, ctx, scale)
        }
        nodePointerAreaPaint={(node: any, color, ctx) => {
          const r = (node as Node).kind === 'theme' ? THEME_RADIUS + 6 : FACE_RADIUS + 4
          ctx.fillStyle = color
          ctx.beginPath()
          ctx.arc(node.x ?? 0, node.y ?? 0, r, 0, Math.PI * 2)
          ctx.fill()
        }}
        linkColor={() => 'rgba(199, 168, 126, 0.15)'}
        linkWidth={0.6}
        backgroundColor="rgba(0,0,0,0)"
        cooldownTicks={120}
        d3AlphaDecay={0.04}
        d3VelocityDecay={0.55}
        enableZoomInteraction
        enablePanInteraction
        onNodeClick={(node: any) => {
          const n = node as Node
          if (n.kind === 'face' && n.face && onFaceClick) onFaceClick(n.face)
          if (n.kind === 'theme' && n.theme && onThemeClick) onThemeClick(n.theme)
        }}
      />
    </div>
  )
}
