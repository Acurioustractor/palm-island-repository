/**
 * /picc/walk — the stage walkthrough.
 *
 * One-page presenter map for walking the platform with the CEO,
 * funders, partners, or any external audience. Each "stop" surfaces:
 *   - Live URL on picc.studio
 *   - Pencil source file (where the design lives)
 *   - Empathy Ledger admin (where the data is managed)
 *   - One-line stage note ("what to say")
 *
 * Three lenses read in parallel:
 *   - PUBLIC          — what they see (picc.studio)
 *   - DESIGN          — Pencil .pen files (picc-almanac-web.pen)
 *   - DATA            — EL v2 admin URLs that feed this surface
 *
 * Designed to be projected on a TV during the walk-through. Operator
 * uses it as a clicker map. Audience sees the public side.
 */
import Link from 'next/link'
import { C, SECTION_COLOURS } from '@/components/annual-report/2024-25/almanac/tokens'

export const dynamic = 'force-dynamic'

const EL_ADMIN_BASE = process.env.NEXT_PUBLIC_EL_V2_URL || 'https://empathy-ledger-v2.vercel.app'
const PICC_ORG_ID = '084f851c-72e0-41fb-b5ba-f3088f44862d'

interface Stop {
  num: string
  title: string
  blurb: string
  stageNote: string
  publicUrl: string
  publicLabel: string
  pencilFile?: string
  pencilFrame?: string
  elAdmin?: { label: string; href: string }[]
  colour: string
}

export const metadata = {
  title: 'Stage walk — PICC',
  description: 'Presenter map for the PICC platform walk-through.',
}

const STOPS: Stop[] = [
  {
    num: '01',
    title: 'The vision',
    blurb: 'Open with what Palm Island is naming for 2045. Live signature counter, signed visions on the canvas.',
    stageNote: 'Twenty years in. We asked: what next? This is what the community said.',
    publicUrl: '/sign-the-vision',
    publicLabel: 'picc.studio/sign-the-vision',
    pencilFile: 'picc-almanac-web.pen',
    pencilFrame: '🌅 20-year vision · canvas',
    elAdmin: [
      { label: 'Manage approved visions', href: `${EL_ADMIN_BASE}/admin/organisations/${PICC_ORG_ID}/visions` },
    ],
    colour: SECTION_COLOURS.governance,
  },
  {
    num: '02',
    title: 'The voices',
    blurb: 'Bento mosaic of the 42 named, photographed, consented storytellers — Elders gold-pilled, sorted by quote count.',
    stageNote: 'Every face is consented. Every name is named. Every photo is held under cultural protocol.',
    publicUrl: '/voices',
    publicLabel: 'picc.studio/voices',
    pencilFile: 'picc-almanac-web.pen',
    pencilFrame: '👥 Voices Bento · grid',
    elAdmin: [
      { label: 'Manage storytellers (58)', href: `${EL_ADMIN_BASE}/admin/organisations/${PICC_ORG_ID}/storytellers` },
      { label: 'Photo tagging tool', href: `${EL_ADMIN_BASE}/admin/picc-tagging` },
      { label: 'Face clusters', href: `${EL_ADMIN_BASE}/admin/picc-clusters` },
    ],
    colour: SECTION_COLOURS.educationCommunity,
  },
  {
    num: '03',
    title: 'The themes',
    blurb: 'What the community has been speaking to — tagged across both quote tables, ranked by voice count.',
    stageNote: 'Editors chose the featured ones with Elder review. The wider grid is everything else surfacing organically.',
    publicUrl: '/voices/themes',
    publicLabel: 'picc.studio/voices/themes',
    pencilFile: 'picc-almanac-web.pen',
    pencilFrame: '🏷 Themes index',
    elAdmin: [
      { label: 'Manage extracted quotes', href: `${EL_ADMIN_BASE}/admin/extracted-quotes` },
      { label: 'Featured themes (PICC table)', href: `${EL_ADMIN_BASE}/admin/featured-themes` },
    ],
    colour: SECTION_COLOURS.healthWellbeing,
  },
  {
    num: '04',
    title: 'The stories',
    blurb: '74 public stories grouped by type — community conversations, flood narratives, elder wisdom, services in action.',
    stageNote: 'These were locked behind direct slug links. We unlocked them today.',
    publicUrl: '/stories',
    publicLabel: 'picc.studio/stories',
    pencilFile: 'picc-almanac-web.pen',
    pencilFrame: '📖 Stories archive',
    elAdmin: [
      { label: 'Manage stories', href: `${EL_ADMIN_BASE}/admin/organisations/${PICC_ORG_ID}/stories` },
    ],
    colour: SECTION_COLOURS.justiceSafety,
  },
  {
    num: '05',
    title: 'The work — services',
    blurb: '26 active services, EL-canonical, with covers, descriptions, metrics, voices, projects connected.',
    stageNote: 'Click any service. Watch the page load: cover photo, real metrics, real voices, real projects connected by shared storytellers.',
    publicUrl: '/services',
    publicLabel: 'picc.studio/services',
    pencilFile: 'picc-almanac-web.pen',
    pencilFrame: '🛠 Services list + detail',
    elAdmin: [
      { label: 'Manage services (26)', href: `${EL_ADMIN_BASE}/admin/organisations/${PICC_ORG_ID}/services` },
      { label: 'Coverage gaps dashboard', href: '/picc/services/coverage' },
    ],
    colour: SECTION_COLOURS.economic,
  },
  {
    num: '06',
    title: 'The work — projects',
    blurb: '10 projects with covers, photo galleries, connected storytellers, connected services.',
    stageNote: 'Same pattern as services. Soft-linkage to services through shared storytellers — the human bridge.',
    publicUrl: '/projects',
    publicLabel: 'picc.studio/projects',
    pencilFile: 'picc-almanac-web.pen',
    pencilFrame: '📦 Projects list + detail',
    elAdmin: [
      { label: 'Manage projects', href: `${EL_ADMIN_BASE}/admin/organisations/${PICC_ORG_ID}/projects` },
      { label: 'Coverage gaps dashboard', href: '/picc/projects/coverage' },
    ],
    colour: SECTION_COLOURS.governance,
  },
  {
    num: '07',
    title: 'The Elders',
    blurb: 'Cultural authority. 10 Elders, named, consented, with portraits and quotes.',
    stageNote: 'Elder content has its own approval gate in EL admin. Nothing surfaces without family + Elder review.',
    publicUrl: '/elders',
    publicLabel: 'picc.studio/elders',
    pencilFile: 'picc-almanac-web.pen',
    pencilFrame: '👴 Elders directory',
    elAdmin: [
      { label: 'Filter to Elders', href: `${EL_ADMIN_BASE}/admin/organisations/${PICC_ORG_ID}/storytellers?is_elder=true` },
    ],
    colour: SECTION_COLOURS.educationCommunity,
  },
  {
    num: '08',
    title: 'The 20-year arc',
    blurb: 'Bwgcolman Way, the 20-year story — flood and rebuild are the same story.',
    stageNote: 'Anchor for funders. This is the spine — community-controlled child protection won statewide implications.',
    publicUrl: '/20-years',
    publicLabel: 'picc.studio/20-years',
    pencilFile: 'picc-almanac-web.pen',
    pencilFrame: '⏳ 20-years narrative',
    colour: SECTION_COLOURS.justiceSafety,
  },
  {
    num: '09',
    title: 'The connection map',
    blurb: 'Force-directed network of every storyteller — shared photos, shared themes, shared family lines.',
    stageNote: 'This is the kinship view. Click any node, walk the chain.',
    publicUrl: '/voices/network',
    publicLabel: 'picc.studio/voices/network',
    pencilFile: 'picc-almanac-web.pen',
    pencilFrame: '🕸 Connection graph',
    elAdmin: [
      { label: 'Storyteller connections data', href: `${EL_ADMIN_BASE}/admin/storyteller-connections` },
    ],
    colour: SECTION_COLOURS.healthWellbeing,
  },
  {
    num: '10',
    title: 'The atlas',
    blurb: 'Public master directory. Every domain reachable from one place.',
    stageNote: 'For visitors who don\'t know where to start. For us, the menu.',
    publicUrl: '/atlas',
    publicLabel: 'picc.studio/atlas',
    pencilFile: 'picc-almanac-web.pen',
    pencilFrame: '🗺 Atlas',
    colour: SECTION_COLOURS.economic,
  },
  {
    num: '11',
    title: 'Get involved',
    blurb: 'Five ways in: vision · note · story · photo · partner. The closing CTA.',
    stageNote: 'Close here. "If anything we just walked, you want to be part of — here\'s how."',
    publicUrl: '/get-involved',
    publicLabel: 'picc.studio/get-involved',
    pencilFile: 'picc-almanac-web.pen',
    pencilFrame: '🤝 Get involved',
    colour: SECTION_COLOURS.governance,
  },
  {
    num: '12',
    title: 'The printed annual report',
    blurb: 'PDF generation pipeline. React-PDF + Inter/Caveat fonts on /tmp. Audience-targeted: community · funder · supporter · board.',
    stageNote: 'Same data, four lenses. Funders see the funder cut. Community sees the community cut. Print is print — the platform is the source.',
    publicUrl: '/picc/reports/builder',
    publicLabel: 'picc.studio/picc/reports/builder',
    pencilFile: 'picc-annual-report.pen',
    pencilFrame: '📄 Annual report cover · spreads',
    elAdmin: [
      { label: 'Annual report data composer', href: '/picc/annual-report-data' },
      { label: 'Direct PDF (community)', href: '/api/pdf/generate?type=annual-report&year=2024-25&audience=community' },
      { label: 'Direct PDF (funder)', href: '/api/pdf/generate?type=annual-report&year=2024-25&audience=funder' },
    ],
    colour: SECTION_COLOURS.economic,
  },
  {
    num: '13',
    title: 'Operator command centres',
    blurb: 'Behind the scenes — six command centres in operator-day order: Vision · Canonical · Capture · Curate · Govern · Ship.',
    stageNote: 'Audience won\'t see this. Show only if a partner asks "how do you maintain it?"',
    publicUrl: '/picc',
    publicLabel: 'picc.studio/picc (operator)',
    pencilFile: 'picc-almanac-web.pen',
    pencilFrame: '⚙️ Operator dashboard',
    elAdmin: [
      { label: 'EL v2 admin', href: `${EL_ADMIN_BASE}/admin` },
    ],
    colour: SECTION_COLOURS.justiceSafety,
  },
]

export default function StageWalkPage() {
  return (
    <main className="min-h-screen" style={{ backgroundColor: C.shell }}>
      {/* Header */}
      <section
        className="px-6 md:px-12 pt-12 md:pt-16 pb-8"
        style={{ backgroundColor: C.midnight }}
      >
        <div className="max-w-6xl mx-auto">
          <div
            className="uppercase font-bold mb-3"
            style={{ color: C.starGold, fontSize: 11, letterSpacing: '0.3em' }}
          >
            Stage walk · presenter map
          </div>
          <h1
            className="font-fraunces font-bold leading-[1.05] mb-3"
            style={{ color: '#FBF8EE', fontSize: 'clamp(40px, 6vw, 64px)' }}
          >
            {STOPS.length} stops. One platform. Three lenses.
          </h1>
          <p
            className="font-fraunces max-w-3xl"
            style={{ color: '#FBF8EE', opacity: 0.85, fontSize: 18, lineHeight: 1.55 }}
          >
            Each stop links the live page (what the audience sees), the
            Pencil file (where the design lives), and the EL admin (where
            the data lives). Project this on the TV. Click through. The
            audience sees the public side, you see the wiring.
          </p>

          {/* Lens key */}
          <div className="mt-6 flex flex-wrap gap-3 text-xs">
            <span className="px-3 py-1.5 rounded-full font-mono" style={{ backgroundColor: '#FBF8EE22', color: '#FBF8EE' }}>
              <strong style={{ color: C.starGold }}>PUBLIC</strong> · picc.studio
            </span>
            <span className="px-3 py-1.5 rounded-full font-mono" style={{ backgroundColor: '#FBF8EE22', color: '#FBF8EE' }}>
              <strong style={{ color: C.ochre }}>DESIGN</strong> · picc-almanac-web.pen
            </span>
            <span className="px-3 py-1.5 rounded-full font-mono" style={{ backgroundColor: '#FBF8EE22', color: '#FBF8EE' }}>
              <strong style={{ color: '#7DD3FC' }}>DATA</strong> · empathy ledger admin
            </span>
          </div>
        </div>
      </section>

      {/* Quick-jump strip */}
      <section className="px-6 md:px-12 py-4 sticky top-0 z-10" style={{ backgroundColor: C.shell, borderBottom: `1px solid ${C.border}` }}>
        <div className="max-w-6xl mx-auto flex flex-wrap gap-2">
          {STOPS.map((s) => (
            <a
              key={s.num}
              href={`#stop-${s.num}`}
              className="text-[10px] uppercase font-bold px-2 py-1 rounded-full hover:opacity-80 transition"
              style={{ color: s.colour, backgroundColor: '#fff', letterSpacing: '0.2em' }}
            >
              {s.num} · {s.title.split(' — ')[0]}
            </a>
          ))}
        </div>
      </section>

      {/* Stops */}
      <section className="px-6 md:px-12 py-8 md:py-12">
        <div className="max-w-6xl mx-auto flex flex-col gap-6">
          {STOPS.map((s) => (
            <article
              key={s.num}
              id={`stop-${s.num}`}
              className="rounded-2xl overflow-hidden bg-white"
              style={{ border: `1px solid ${s.colour}33` }}
            >
              <div className="grid grid-cols-1 md:grid-cols-12">
                {/* Header strip */}
                <div
                  className="md:col-span-3 lg:col-span-2 p-6 flex flex-col justify-between"
                  style={{ backgroundColor: s.colour + '15', borderRight: `1px solid ${s.colour}22` }}
                >
                  <div>
                    <div
                      className="font-mono"
                      style={{ color: s.colour, fontSize: 12, letterSpacing: '0.2em' }}
                    >
                      Stop {s.num}
                    </div>
                  </div>
                </div>

                {/* Body */}
                <div className="md:col-span-9 lg:col-span-10 p-6 md:p-8">
                  <h2
                    className="font-fraunces font-bold leading-tight mb-2"
                    style={{ color: C.ocean, fontSize: 'clamp(22px, 3vw, 30px)' }}
                  >
                    {s.title}
                  </h2>
                  <p className="text-sm mb-3" style={{ color: C.driftwood, lineHeight: 1.6 }}>
                    {s.blurb}
                  </p>

                  {/* Stage note */}
                  <blockquote
                    className="my-4 px-4 py-3 rounded-md font-fraunces italic"
                    style={{
                      borderLeft: `3px solid ${s.colour}`,
                      backgroundColor: s.colour + '08',
                      color: C.earth,
                      fontSize: 16,
                      lineHeight: 1.5,
                    }}
                  >
                    &ldquo;{s.stageNote}&rdquo;
                  </blockquote>

                  {/* Three-lens grid */}
                  <div className="mt-5 grid grid-cols-1 md:grid-cols-3 gap-4">
                    {/* PUBLIC */}
                    <div className="p-4 rounded-md" style={{ backgroundColor: C.shell, border: `1px solid ${C.border}` }}>
                      <div
                        className="uppercase font-bold mb-2"
                        style={{ color: C.starGold, fontSize: 10, letterSpacing: '0.3em' }}
                      >
                        Public
                      </div>
                      <Link
                        href={s.publicUrl}
                        target="_blank"
                        className="text-sm font-mono hover:underline break-all"
                        style={{ color: C.ocean }}
                      >
                        {s.publicLabel} →
                      </Link>
                    </div>

                    {/* DESIGN */}
                    <div className="p-4 rounded-md" style={{ backgroundColor: C.shell, border: `1px solid ${C.border}` }}>
                      <div
                        className="uppercase font-bold mb-2"
                        style={{ color: C.ochre, fontSize: 10, letterSpacing: '0.3em' }}
                      >
                        Design (Pencil)
                      </div>
                      {s.pencilFile ? (
                        <>
                          <div className="font-mono text-xs" style={{ color: C.driftwood }}>
                            {s.pencilFile}
                          </div>
                          {s.pencilFrame && (
                            <div className="mt-1 text-sm font-fraunces" style={{ color: C.ocean }}>
                              {s.pencilFrame}
                            </div>
                          )}
                        </>
                      ) : (
                        <div className="italic text-xs" style={{ color: C.muted }}>
                          Code-only stop
                        </div>
                      )}
                    </div>

                    {/* DATA */}
                    <div className="p-4 rounded-md" style={{ backgroundColor: C.shell, border: `1px solid ${C.border}` }}>
                      <div
                        className="uppercase font-bold mb-2"
                        style={{ color: '#0EA5E9', fontSize: 10, letterSpacing: '0.3em' }}
                      >
                        Data (EL admin)
                      </div>
                      {s.elAdmin && s.elAdmin.length > 0 ? (
                        <div className="flex flex-col gap-1">
                          {s.elAdmin.map((a) => (
                            <a
                              key={a.href}
                              href={a.href}
                              target="_blank"
                              rel="noopener noreferrer"
                              className="text-xs hover:underline"
                              style={{ color: '#0EA5E9' }}
                            >
                              {a.label} →
                            </a>
                          ))}
                        </div>
                      ) : (
                        <div className="italic text-xs" style={{ color: C.muted }}>
                          Static / no admin path
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              </div>
            </article>
          ))}
        </div>
      </section>

      {/* Footer reference */}
      <section className="px-6 md:px-12 py-12" style={{ backgroundColor: C.midnight }}>
        <div className="max-w-4xl mx-auto text-center">
          <div
            className="uppercase font-bold mb-3"
            style={{ color: C.starGold, fontSize: 11, letterSpacing: '0.3em' }}
          >
            Reference
          </div>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-sm">
            <a
              href={`${EL_ADMIN_BASE}/admin`}
              target="_blank"
              rel="noopener noreferrer"
              className="px-4 py-3 rounded-md hover:opacity-90 transition"
              style={{ backgroundColor: '#FBF8EE22', color: '#FBF8EE' }}
            >
              <div className="font-bold mb-1">EL v2 admin home</div>
              <div className="font-mono text-xs opacity-70">{EL_ADMIN_BASE}/admin</div>
            </a>
            <Link
              href="/picc"
              className="px-4 py-3 rounded-md hover:opacity-90 transition"
              style={{ backgroundColor: '#FBF8EE22', color: '#FBF8EE' }}
            >
              <div className="font-bold mb-1">Operator dashboard</div>
              <div className="font-mono text-xs opacity-70">/picc</div>
            </Link>
            <Link
              href="/atlas"
              className="px-4 py-3 rounded-md hover:opacity-90 transition"
              style={{ backgroundColor: '#FBF8EE22', color: '#FBF8EE' }}
            >
              <div className="font-bold mb-1">Public atlas</div>
              <div className="font-mono text-xs opacity-70">/atlas</div>
            </Link>
          </div>
          <p className="mt-8 italic font-fraunces" style={{ color: '#FBF8EE', opacity: 0.6, fontSize: 13 }}>
            Design source: <code className="font-mono">picc-almanac-web.pen</code> ·
            Data canonical: <code className="font-mono">empathy-ledger-v2</code> ·
            Render: <code className="font-mono">web-platform</code> (this app)
          </p>
        </div>
      </section>
    </main>
  )
}
