/**
 * /picc/almanac/photos/reference — editor's map for the EL v2 photo
 * slot system.
 *
 * Faithful port of Pencil "📸 Photo Slot Reference · editor's map" (iU28D
 * in picc-almanac-web.pen). Documents what slot keys exist, how photos
 * land in the almanac, and how the priority mark works. Static content
 * — operational state lives on the parent /picc/almanac/photos page.
 */
import Link from 'next/link'
import { C } from '@/components/annual-report/2024-25/almanac/tokens'

export const metadata = {
  title: 'Photo Slot Reference — PICC Admin',
  description: 'Editor reference for how photos land in the almanac via the EL v2 slot system.',
}

const wholeSectionSlots = [
  {
    label: 'COVER',
    key: 'picc:slot:cover',
    note: "Edge-to-edge cover photo · still fallback when video doesn't autoplay",
  },
  {
    label: 'ACKNOWLEDGEMENT',
    key: 'picc:slot:acknowledgement',
    note: 'Painted island/horizon hero — Country opener',
  },
  {
    label: 'CEO PORTRAIT',
    key: 'picc:slot:messages',
    note: 'Rachel Atkinson · Chair Luella Bligh · 2 portraits ordered',
  },
  {
    label: 'BACK COVER',
    key: 'picc:slot:back-cover',
    note: 'Closing photo with CEO quote overlay',
  },
]

const serviceSlugsByCategory: Array<{ label: string; tint: string; slugs: string }> = [
  { label: 'FAMILY · 7', tint: C.ochre, slugs: 'bwg-way · cfc · 1000d · fc · fpp · fwc · safe-house' },
  { label: 'HEALTH · 6', tint: C.mangrove, slugs: 'bhs · sewb · whs · ferdys · shelter · aged' },
  { label: 'JUSTICE · 3', tint: C.coral, slugs: 'cjg · dfv · divers' },
  { label: 'YOUTH · 2', tint: C.reef, slugs: 'safe-haven · youth' },
  { label: 'ECONOMIC · 4', tint: C.starGold, slugs: 'dsc · retail · logistics · enterprises' },
  { label: 'COMMUNITY · 3', tint: C.ocean, slugs: 'hub · blue-card · ndis' },
  { label: 'EDUCATION · 1', tint: C.ocean, slugs: 'beai' },
]

const namedPriorities =
  'Aunty Iris May Whitey · Aunty Ethel Robertson · Cassie Lang · Cyndel Louise Pryor · Henry Doyle · Rachel Atkinson · Luella Bligh · Rhonda Phillips · Harriet Hulthen · Matthew Lindsay · Allan Palm Island · Gurtrude Grace Richardson · plus the full voices wall (30+ EL slot-tagged)'

const anchorStories = [
  {
    label: 'BWGCOLMAN WAY',
    key: 'picc:slot:anchor-bwgcolman-way',
    note: '3-photo strip · daycare opening / Delegated Authority handover / community gathering',
  },
  {
    label: 'FIRST 1,000 DAYS',
    key: 'picc:slot:anchor-1000d',
    note: '3 generations reading · CHN+AHW+GP team · CFC integration',
  },
  {
    label: 'NDIS · 3× GROWTH',
    key: 'picc:slot:anchor-ndis',
    note: 'Townsville office opening · home care visits · elder care moments',
  },
]

const videoOverlays = [
  {
    label: 'COVER LOOP',
    key: 'picc:slot:video-cover',
    note: '60-90s loop · 16:9 · auto-mute · poster fallback',
  },
  {
    label: 'BWGCOLMAN BREAK',
    key: 'picc:slot:video-acknowledgement',
    note: '5-8s · 16:9 · sits between Year-in-Numbers and anchor stories · text overlay',
  },
]

export default function PhotoSlotReferencePage() {
  return (
    <main className="min-h-screen" style={{ backgroundColor: '#FBF8EE' }}>
      <div className="max-w-5xl mx-auto px-6 md:px-12 py-16 md:py-24">
        {/* Header */}
        <div className="mb-12">
          <Link
            href="/picc/almanac/photos"
            className="text-xs uppercase font-bold tracking-widest hover:opacity-80"
            style={{ color: C.driftwood }}
          >
            ← Back to photos overview
          </Link>
          <div
            className="uppercase font-bold mt-8 mb-3"
            style={{ color: C.ocean, fontSize: 11, letterSpacing: '0.3em' }}
          >
            Photo Slot Reference · editor&rsquo;s map for /admin/photos
          </div>
          <h1
            className="font-fraunces font-bold leading-tight"
            style={{ color: C.ocean, fontSize: 'clamp(40px, 6vw, 64px)' }}
          >
            How photos land in the almanac.
          </h1>
          <p
            className="mt-6 leading-relaxed"
            style={{ color: C.driftwood, fontSize: 14, maxWidth: 720 }}
          >
            Tag a photo in EL v2 admin (/admin/photos) with the slot key shown below. PICC&rsquo;s almanac picks it up automatically — no code change needed. Star a photo to mark it priority for that slot; PICC picks priority photos first.
          </p>
        </div>

        {/* A · Whole-section slots */}
        <Section
          letter="A"
          title="Whole-section slots — pick one photo for each"
          tint={C.turtleRed}
        >
          <SlotTable rows={wholeSectionSlots} />
        </Section>

        {/* B · Per-service galleries */}
        <Section
          letter="B"
          title="Per-service gallery · 26 services · gallery + cover via service_galleries"
          tint={C.turtleRed}
        >
          <div
            className="rounded-md p-6 mb-6"
            style={{ backgroundColor: C.sand }}
          >
            <div
              className="uppercase font-bold mb-2"
              style={{ color: C.turtleRed, fontSize: 10, letterSpacing: '0.3em' }}
            >
              Preferred path
            </div>
            <p style={{ color: C.earth, fontSize: 13, lineHeight: 1.6 }}>
              In /admin/photos: filter by Service → bulk-select photos → &ldquo;Add to service gallery&rdquo;. Mark one as ★ cover. PICC pulls them via{' '}
              <code className="font-mono text-xs">getCanonicalPhotosForService(slug)</code>. NO slot tag needed.
            </p>

            <div
              className="uppercase font-bold mt-4 mb-2"
              style={{ color: C.turtleRed, fontSize: 10, letterSpacing: '0.3em' }}
            >
              Fallback path
            </div>
            <p style={{ color: C.earth, fontSize: 13, lineHeight: 1.6 }}>
              If a service doesn&rsquo;t have a gallery wired yet, tag photos with{' '}
              <code className="font-mono text-xs">picc:slot:service-&lt;slug&gt;</code>{' '}
              (slug list below). PICC&rsquo;s{' '}
              <code className="font-mono text-xs">getPhotosForService()</code> picks them up via the slot-tag mechanism.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-x-8 gap-y-6">
            {serviceSlugsByCategory.map((cat) => (
              <div key={cat.label}>
                <div
                  className="uppercase font-bold mb-2"
                  style={{ color: cat.tint, fontSize: 10, letterSpacing: '0.2em' }}
                >
                  {cat.label}
                </div>
                <p
                  className="font-mono"
                  style={{ color: C.earth, fontSize: 13, lineHeight: 1.6 }}
                >
                  {cat.slugs}
                </p>
              </div>
            ))}
            <div>
              <div
                className="uppercase font-bold mb-2"
                style={{ color: C.turtleRed, fontSize: 10, letterSpacing: '0.2em' }}
              >
                Projects · 9 (separate from services)
              </div>
              <p
                className="italic"
                style={{ color: C.driftwood, fontSize: 13, lineHeight: 1.6 }}
              >
                Use <code className="font-mono text-xs not-italic">picc:slot:project-&lt;slug&gt;</code>. Slug list lives on EL v2 projects table.
              </p>
            </div>
          </div>
        </Section>

        {/* C · Storyteller portraits */}
        <Section
          letter="C"
          title="Storyteller portraits — per-person galleries"
          tint={C.turtleRed}
        >
          <div
            className="rounded-md p-6"
            style={{ backgroundColor: C.shell }}
          >
            <p style={{ color: C.earth, fontSize: 13, lineHeight: 1.6 }}>
              In /admin/photos: tag a photo with the storyteller (face-tagging) → consent flow runs → PICC&rsquo;s{' '}
              <code className="font-mono text-xs">getPhotosForStoryteller(id)</code>{' '}
              returns it. The Voices section auto-populates from the storyteller&rsquo;s media link, ordered by recency.
            </p>
            <div
              className="uppercase font-bold mt-6 mb-2"
              style={{ color: C.turtleRed, fontSize: 10, letterSpacing: '0.3em' }}
            >
              Named priorities · the people who carry the report
            </div>
            <p
              className="italic"
              style={{ color: C.driftwood, fontSize: 13, lineHeight: 1.6 }}
            >
              {namedPriorities}
            </p>
          </div>
        </Section>

        {/* D · Anchor stories */}
        <Section
          letter="D"
          title="Anchor stories — big editorial photos for each anchor"
          tint={C.turtleRed}
        >
          <SlotTable rows={anchorStories} />
        </Section>

        {/* E · Video overlays */}
        <Section
          letter="E"
          title="Video overlays — 5-30s clips for transitions and heroes"
          tint={C.turtleRed}
        >
          <SlotTable rows={videoOverlays} />
        </Section>

        {/* Priority mark callout */}
        <div
          className="rounded-md p-6 mt-12"
          style={{ backgroundColor: C.ocean }}
        >
          <div
            className="uppercase font-bold mb-2"
            style={{ color: C.starGold, fontSize: 11, letterSpacing: '0.3em' }}
          >
            ★ The priority mark
          </div>
          <p style={{ color: 'white', fontSize: 13, lineHeight: 1.6, opacity: 0.9 }}>
            In /admin/photos, click the ★ on any photo to mark it priority for its slot. PICC will pick priority photos FIRST when filling that slot — falling back to the rest of the gallery if there&rsquo;s no star. Use it to control which photo becomes the hero.
          </p>
        </div>
      </div>
    </main>
  )
}

function Section({
  letter,
  title,
  tint,
  children,
}: {
  letter: string
  title: string
  tint: string
  children: React.ReactNode
}) {
  return (
    <section className="mb-12">
      <div
        className="uppercase font-bold mb-4"
        style={{ color: tint, fontSize: 11, letterSpacing: '0.2em' }}
      >
        {letter} · {title}
      </div>
      {children}
    </section>
  )
}

function SlotTable({ rows }: { rows: Array<{ label: string; key: string; note: string }> }) {
  return (
    <div className="flex flex-col gap-2">
      {rows.map((row) => (
        <div
          key={row.key}
          className="rounded-md grid grid-cols-1 md:grid-cols-12 gap-3 md:gap-6"
          style={{ backgroundColor: C.shell, padding: '12px 16px' }}
        >
          <div
            className="md:col-span-3 uppercase font-bold"
            style={{ color: C.ocean, fontSize: 11, letterSpacing: '0.2em' }}
          >
            {row.label}
          </div>
          <div
            className="md:col-span-4 font-mono"
            style={{ color: C.earth, fontSize: 13, fontWeight: 500 }}
          >
            {row.key}
          </div>
          <div
            className="md:col-span-5"
            style={{ color: C.driftwood, fontSize: 13 }}
          >
            {row.note}
          </div>
        </div>
      ))}
    </div>
  )
}
