/**
 * /living-atlas — Palm Island Living Atlas (preview).
 *
 * Parallel surface to /picc/constellation. Adds:
 *   - the seven-lens rail (variant='atlas' on the shared component)
 *   - PalmIslandMap section below the stage — services pinned on Country
 *   - ChatWidget overlay (Ask PICC) — community can ask the atlas a
 *     question and get a sourced answer
 *
 * Per plan (i-want-to-lock-zesty-mochi.md, "Decisions locked"):
 *   /picc/constellation stays frozen for the 13 May workshop.
 *   /living-atlas is the preview Rachel & Narelle see the direction of.
 */

import Link from 'next/link'
import { loadConstellation } from '@/lib/constellation/queries'
import PalmIslandMap, { type PinService } from '../picc/twenty-years/PalmIslandMap'
import ChatWidget from '@/components/chat/ChatWidget'
import SavePath from './SavePath'
import CanvasStage from './CanvasStage'

export const metadata = {
  title: 'Palm Island Living Atlas',
  description:
    'One borderless map of Palm Island storytelling — every face consented, every theme named by community. Touch any service, year, person, or place to enter.',
}

export const dynamic = 'force-dynamic'
export const revalidate = 0

function nf(n: number): string {
  return n.toLocaleString()
}

export default async function LivingAtlasPage() {
  const data = await loadConstellation()
  const hasData = data.faces.length > 0

  // Build map pins from services with lat/long.
  const mapServices: PinService[] = data.services
    .filter((s) => s.latitude != null && s.longitude != null)
    .map((s) => ({
      id: s.id,
      slug: s.slug,
      name: s.name,
      service_category: s.category,
      latitude: s.latitude as number,
      longitude: s.longitude as number,
    }))

  return (
    <div className="min-h-screen bg-cream">
      <div className="max-w-[1500px] mx-auto px-4 py-6">
        <header className="mb-4 flex items-end justify-between gap-4 flex-wrap">
          <div>
            <div className="text-[11px] uppercase tracking-[0.3em] text-ochre font-bold mb-1">
              Preview · Atlas direction
            </div>
            <h1 className="font-serif text-3xl md:text-4xl text-charcoal">
              Palm Island Living Atlas
            </h1>
          </div>
          <div className="flex items-end gap-3">
            <div className="text-xs text-stone-600 max-w-sm leading-relaxed">
              One borderless surface — people, services, projects, places,
              years, visions. Every face passed an explicit consent gate.
            </div>
            <SavePath />
            <Link
              href="/atlas/capture"
              className="rounded-md px-3 py-2 font-semibold text-white text-sm whitespace-nowrap"
              style={{ backgroundColor: '#2D5F4F' }}
            >
              Share a thought
            </Link>
          </div>
        </header>

        {hasData ? (
          <div className="rounded-xl border border-stone-200 bg-white shadow-md overflow-hidden">
            <CanvasStage data={data} />
          </div>
        ) : (
          <div className="rounded-xl border border-amber-200 bg-amber-50 p-8 text-amber-900">
            <div className="font-serif text-lg mb-2">No faces returned</div>
            <p className="text-sm">
              Check <code className="bg-amber-100 px-1 py-0.5 rounded text-xs">EL_V2_API_URL</code> and{' '}
              <code className="bg-amber-100 px-1 py-0.5 rounded text-xs">EL_V2_API_KEY</code>.
            </p>
          </div>
        )}

        {/* Compact stats row */}
        <div className="mt-4 grid grid-cols-3 md:grid-cols-7 gap-2 text-xs">
          <Pill value={nf(data.faces.length)} label="people" />
          <Pill value={nf(data.services.length)} label="services" />
          <Pill value={nf(data.projects.length)} label="projects" />
          <Pill value={nf(data.named_elders.length)} label="named elders" />
          <Pill value={nf(data.annual_reports.length)} label="annual reports" />
          <Pill
            value={nf(data.stats.voices_validated_elder + data.stats.voices_extracted)}
            label="quotes"
          />
          <Pill value={nf(data.bwgcolman.language_groups)} label="language groups" />
        </div>

        {/* Map lens — services pinned on Country */}
        {mapServices.length > 0 && (
          <section className="mt-6">
            <div className="mb-3 flex items-baseline justify-between">
              <h2 className="font-serif text-xl text-charcoal">
                Where the work happens
              </h2>
              <span className="text-[11px] text-stone-500">
                {mapServices.length} of {data.services.length} services pinned on
                Country
              </span>
            </div>
            <PalmIslandMap services={mapServices} />
          </section>
        )}

        {/* Place pages — deep-dives anchored in geography */}
        <section className="mt-6">
          <div className="mb-3">
            <h2 className="font-serif text-xl text-charcoal">Places</h2>
            <p className="text-[11px] text-stone-500">
              Foundational locations in the Bwgcolman story — each opens its
              own page with timeline, map, and Elder voices.
            </p>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
            <Link
              href="/living-atlas/places/hull-river"
              className="rounded-xl border border-stone-200 bg-white p-4 hover:shadow-md transition group"
              style={{ borderLeftWidth: 4, borderLeftColor: '#8B1A1A' }}
            >
              <div className="text-[10px] uppercase tracking-[0.2em] font-semibold mb-1"
                style={{ color: '#8B1A1A' }}>
                1914 — 1919
              </div>
              <div className="font-serif text-lg text-charcoal group-hover:underline">
                Hull River
              </div>
              <p className="text-[11.5px] text-stone-600 mt-1 leading-snug">
                The foundational journey — settlement at Tully Heads, the
                1918 cyclone Leonte, the transfer to Great Palm Island.
              </p>
            </Link>

            <div
              className="rounded-xl border border-dashed border-stone-300 bg-white/50 p-4 opacity-70"
              style={{ borderLeftWidth: 4, borderLeftColor: '#5B8A72' }}
            >
              <div
                className="text-[10px] uppercase tracking-[0.2em] font-semibold mb-1"
                style={{ color: '#5B8A72' }}
              >
                Coming · Stage 4
              </div>
              <div className="font-serif text-lg text-charcoal">
                Bwgcolman Way
              </div>
              <p className="text-[11.5px] text-stone-600 mt-1 leading-snug">
                Delegated authority — the journey from 2018 to 2024 and the
                community-controlled child protection model that followed.
              </p>
            </div>

            <div
              className="rounded-xl border border-dashed border-stone-300 bg-white/50 p-4 opacity-70"
              style={{ borderLeftWidth: 4, borderLeftColor: '#D97757' }}
            >
              <div
                className="text-[10px] uppercase tracking-[0.2em] font-semibold mb-1"
                style={{ color: '#D97757' }}
              >
                Coming · Stage 7
              </div>
              <div className="font-serif text-lg text-charcoal">
                The next 20 years
              </div>
              <p className="text-[11.5px] text-stone-600 mt-1 leading-snug">
                The anniversary page. 2007 → 2027 timeline, 20 voices for 20
                years, community vision for 2045.
              </p>
            </div>
          </div>
        </section>

        <p className="mt-6 text-xs text-stone-500 italic max-w-3xl">
          Preview surface. The workshop demo lives at /picc/constellation —
          this route is where the post-workshop seven-lens Atlas takes shape
          (Now · Services · Projects · Elders · Stories · Reports · Futures).
          Tap the chat button (bottom-right) to ask PICC anything.
        </p>
      </div>

      {/* Ask PICC chat overlay — bottom-right floating widget */}
      <ChatWidget
        position="bottom-right"
        welcomeMessage="Welcome to the Palm Island Living Atlas. Ask me about any service, project, Elder, annual report year, or the Hull River journey. I'll cite the source so you can keep exploring."
      />
    </div>
  )
}

function Pill({ value, label }: { value: string; label: string }) {
  return (
    <div className="rounded-md border border-stone-200 bg-white px-3 py-1.5">
      <div
        className="font-serif text-base leading-none"
        style={{ color: '#2D5F4F' }}
      >
        {value}
      </div>
      <div className="text-[9px] uppercase tracking-wide text-stone-500 mt-1">
        {label}
      </div>
    </div>
  )
}
