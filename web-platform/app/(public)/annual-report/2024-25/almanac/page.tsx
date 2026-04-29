/**
 * The Saltwater Almanac — digital companion to the FY24-25 annual report.
 *
 * Reads from the existing data layer:
 *   - getReportData('2024-25') returns leadership messages, highlights, board,
 *     stats, services, financials, sections, history, communityVoices
 *   - getCuratedQuotes() returns validated Elder quotes
 *   - data is already there. We render it.
 *
 * URL: /annual-report/2024-25/almanac
 */
import { getReportData } from '@/lib/annual-report/fetch-report-data'
import { getCuratedQuotes } from '@/lib/quotes/get-curated-quotes'
import { assetUrl } from '@/lib/media/asset-url'
import {
  Cover,
  Acknowledgement,
  AmbientSection,
  Cartouche,
  Reliquary,
  Lantern,
  Hearth,
  Horizon,
  Fold,
  MarginNote,
} from '@/components/annual-report/2024-25/almanac/elements'
import { VideoBreak } from '@/components/annual-report/2024-25/almanac/VideoBreak'
import { StatHeroHorizon } from '@/components/annual-report/2024-25/almanac/StatHeroHorizon'
import { ServicesAroundIsland } from '@/components/annual-report/2024-25/almanac/ServicesAroundIsland'
import { IslandServiceMap } from '@/components/annual-report/2024-25/almanac/IslandServiceMap'
import { getServiceCoord } from '@/lib/maps/picc-service-coords'
import { getPiccServices } from '@/lib/services/el-services'
import { SaltwaterRings } from '@/components/annual-report/2024-25/almanac/SaltwaterRings'
import { ReefLayers } from '@/components/annual-report/2024-25/almanac/ReefLayers'
import { C, SECTION_COLOURS, type SectionKey } from '@/components/annual-report/2024-25/almanac/tokens'
import { FORWARD_COMMITMENTS } from '@/lib/annual-report/2024-25/content'
import { VIDEO_TAGS_2025 } from '@/lib/annual-report/data-2025'

export const dynamic = 'force-dynamic'
export const revalidate = 3600

export const metadata = {
  title: 'The Saltwater Almanac — PICC Annual Report 2024-25',
  description:
    'A small museum about a place. Walking through Year 17 of Palm Island Community Company.',
}

export default async function AlmanacPage() {
  // Pull EVERYTHING that already exists.
  // Services are now sourced from EL v2 (canonical 26-service roster
  // at /api/picc/services). Falls back to data-2025.ts SERVICES_2025
  // if EL v2 is unreachable so the page always renders.
  const [reportData, elderQuotes, communityVoices, piccServices] = await Promise.all([
    getReportData('2024-25'),
    getCuratedQuotes({ source_type: 'elder', limit: 6 }),
    getCuratedQuotes({ limit: 6 }),
    getPiccServices(),
  ])

  // Resolve real CEO + Chair messages
  const ceo = reportData.leadershipMessages.find((m) => m.role === 'ceo')
  const chair = reportData.leadershipMessages.find((m) => m.role === 'chair')

  // Real stats — only the key metrics for headline display
  const keyStats = reportData.statistics.filter((s) => s.is_key_metric).slice(0, 8)

  // Real highlights — featured ones first
  const featuredHighlights = reportData.highlights
    .filter((h) => h.is_featured)
    .sort((a, b) => a.display_order - b.display_order)

  // Find specific anchor highlights
  const bwgcolmanWayHighlight = reportData.highlights.find((h) =>
    h.title.toLowerCase().includes('bwgcolman') || h.title.toLowerCase().includes('delegated'),
  )
  const dscHighlight = reportData.highlights.find((h) => h.title.toLowerCase().includes('digital service'))
  const enterpriseHighlight = reportData.highlights.find((h) => h.title.toLowerCase().includes('enterprise'))

  // Group services by category
  const servicesByCategory = piccServices.reduce<Record<string, typeof piccServices>>(
    (acc, s) => {
      const cat = s.service_category || 'other'
      if (!acc[cat]) acc[cat] = []
      acc[cat].push(s)
      return acc
    },
    {},
  )

  return (
    <main className="min-h-screen" style={{ backgroundColor: '#FBF8EE' }}>
      {/* COVER — video hero. Highest priority of the report. */}
      <Cover
        title="Many tribes, one people."
        subtitle="Palm Island Community Company · Year 17 of 20."
        yearTag="Annual Report 2024–25"
        videoUrl="/hero-assets/clips/kids-beach.mp4"
        photoUrl={
          reportData.coverPhoto?.url ||
          assetUrl('/hero-assets/stills/kids-beach-palm.jpg') ||
          '/report-assets/2024-25-pool/00-cover/kids-beach-palm.jpg'
        }
      />

      {/* ACKNOWLEDGEMENT — uses real text from reportData.report.acknowledgments if available */}
      <Acknowledgement
        body={
          reportData.report.acknowledgments ||
          `We acknowledge the Manbarra people as the Traditional Custodians of Palm Island, and the Bwgcolman people — the descendants of the more than forty First Nations forcibly relocated here from across Queensland between 1914 and 1972. We pay our respects to Elders past, present, and emerging.`
        }
      />


      {/* VIDEO BREAK — Country, before the leadership messages */}
      <VideoBreak
        videoUrl={VIDEO_TAGS_2025['acknowledgement']}
        caption="Bwgcolman."
        subcaption="Many tribes, one people."
        height="65vh"
      />

      {/* CEO MESSAGE — real text */}
      {ceo && (
        <AmbientSection section="all" id="ceo-message">
          <div className="max-w-6xl mx-auto px-6 md:px-12 py-16 md:py-24">
            <div className="grid grid-cols-1 md:grid-cols-12 gap-8 md:gap-12 items-start">
              {/* Portrait */}
              <div className="md:col-span-5">
                {ceo.photo_url && (
                  <div className="relative aspect-[4/5] overflow-hidden rounded-md">
                    {/* eslint-disable-next-line @next/next/no-img-element */}
                    <img
                      src={ceo.photo_url}
                      alt={ceo.person_name}
                      className="w-full h-full object-cover"
                      style={{ objectPosition: 'center top' }}
                    />
                  </div>
                )}
                <div className="mt-3 font-caveat" style={{ color: C.ochre, fontSize: 18 }}>
                  {ceo.person_name} · {ceo.person_title}
                </div>
              </div>

              {/* Message — REAL text from data */}
              <div className="md:col-span-7">
                <div className="uppercase font-bold mb-4" style={{ color: C.ocean, fontSize: 10, letterSpacing: '0.3em' }}>
                  {ceo.message_title}
                </div>
                <h2 className="font-fraunces font-bold leading-tight mb-6" style={{ color: C.ocean, fontSize: 'clamp(40px, 5vw, 60px)' }}>
                  {ceo.message_excerpt}
                </h2>

                <div className="space-y-4" style={{ color: C.driftwood, fontSize: 15, lineHeight: 1.75, maxWidth: 620 }}>
                  {ceo.message_content.split('\n\n').map((para, i) => (
                    <p key={i}>{para.trim()}</p>
                  ))}
                </div>

                <div className="mt-8 font-caveat" style={{ color: C.ochre, fontSize: 18 }}>
                  — {ceo.person_name}, {ceo.person_title}
                </div>

                {ceo.featured_quote && (
                  <div className="mt-10 p-6 border-l-4 rounded-r-md" style={{ borderColor: C.ochre, backgroundColor: C.sand, maxWidth: 620 }}>
                    <p className="font-fraunces italic leading-snug" style={{ color: C.earth, fontSize: 'clamp(18px, 2vw, 22px)' }}>
                      “{ceo.featured_quote}”
                    </p>
                  </div>
                )}
              </div>
            </div>
          </div>
        </AmbientSection>
      )}

      {/* CHAIR MESSAGE — real text */}
      {chair && (
        <AmbientSection section="all" id="chair-message">
          <div className="max-w-5xl mx-auto px-6 md:px-12 py-20 md:py-28">
            <div className="flex items-start gap-6 mb-10">
              {chair.photo_url && (
                <div className="w-24 h-24 rounded-full overflow-hidden flex-shrink-0">
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img
                    src={chair.photo_url}
                    alt={chair.person_name}
                    className="w-full h-full object-cover"
                    style={{ objectPosition: 'center top' }}
                  />
                </div>
              )}
              <div>
                <div className="uppercase font-bold mb-2" style={{ color: C.coral, fontSize: 10, letterSpacing: '0.3em' }}>
                  {chair.message_title}
                </div>
                <h2 className="font-fraunces font-bold leading-tight" style={{ color: C.ocean, fontSize: 'clamp(36px, 5vw, 52px)' }}>
                  {chair.message_excerpt}
                </h2>
              </div>
            </div>

            <div className="space-y-4" style={{ color: C.driftwood, fontSize: 15, lineHeight: 1.75 }}>
              {chair.message_content.split('\n\n').map((para, i) => (
                <p key={i}>{para.trim()}</p>
              ))}
            </div>

            {chair.featured_quote && (
              <div className="my-12 p-8 border-l-4 rounded-r-md" style={{ borderColor: C.coral, backgroundColor: '#FBF6E4' }}>
                <p className="font-fraunces italic leading-snug" style={{ color: C.coral, fontSize: 'clamp(20px, 2.4vw, 26px)' }}>
                  “{chair.featured_quote}”
                </p>
              </div>
            )}

            <div className="mt-8 font-caveat" style={{ color: C.coral, fontSize: 18 }}>
              — {chair.person_name}, {chair.person_title}
            </div>
          </div>
        </AmbientSection>
      )}

      {/* YEAR IN NUMBERS — REAL stats */}
      <AmbientSection section="all" id="year-in-numbers">
        <div className="px-6 md:px-12 py-20 md:py-28 max-w-6xl mx-auto">
          <div className="text-center mb-16">
            <div className="uppercase font-bold mb-3" style={{ color: C.ocean, fontSize: 10, letterSpacing: '0.3em' }}>
              The year in numbers
            </div>
            <h2 className="font-fraunces font-bold leading-tight" style={{ color: C.ocean, fontSize: 'clamp(40px, 6vw, 64px)' }}>
              Year 17.
            </h2>
          </div>

          {/* HERO 1 — painted island anchor with categorical service
              clusters at compass positions. Each dot is one real
              service from data-2025.ts (24 total, 6 groups). */}
          <div className="mb-24">
            <div className="mx-auto max-w-3xl text-center mb-10 px-6">
              <h3
                className="font-fraunces font-bold leading-tight mb-4"
                style={{ color: C.ocean, fontSize: 'clamp(28px, 4vw, 42px)' }}
              >
                {piccServices.length} services. 6 categories. Bwgcolman-led.
              </h3>
              <p
                className="leading-relaxed mx-auto"
                style={{ color: C.driftwood, fontSize: 'clamp(14px, 1.5vw, 16px)', maxWidth: 600 }}
              >
                Year 17 closed with {piccServices.length} active services across the island —
                from kinship care and early childhood through to health, justice,
                youth, economic, and community programs. Every service is led
                entirely by Bwgcolman people. Hover any dot for the service name.
              </p>
            </div>
            {/* Geographically-real Palm Island silhouette (OSM coastline)
                with services positioned by lib/maps/picc-service-coords. */}
            <IslandServiceMap
              services={piccServices.map((s: any) => ({
                id: s.id,
                name: s.name,
                service_category: s.service_category,
                ...(getServiceCoord(s.id) ?? {}),
              }))}
            />
          </div>

          {/* HERO 2 — painted concentric rings as workforce anchor.
              Center stat = 210, breakdown chips for Indigenous / local. */}
          <div className="mb-20">
            <div className="mx-auto max-w-3xl text-center mb-10 px-6">
              <h3
                className="font-fraunces font-bold leading-tight mb-4"
                style={{ color: C.ochre, fontSize: 'clamp(28px, 4vw, 42px)' }}
              >
                A workforce of the place, by the place.
              </h3>
              <p
                className="leading-relaxed mx-auto"
                style={{ color: C.driftwood, fontSize: 'clamp(14px, 1.5vw, 16px)', maxWidth: 600 }}
              >
                Year 17 finished with around two hundred and ten staff — three
                in four Indigenous, seven in ten Palm Island residents. PICC's
                workforce is its first community measure: jobs that stay on
                Country, decisions made by people who walk the same shore.
              </p>
            </div>
            <SaltwaterRings
              eyebrow="Year 17 workforce"
              stat="~210"
              subtitle="Total staff"
              breakdowns={[
                { value: '75%', label: 'Indigenous', caption: 'Of the workforce, three in four', colour: C.ochre },
                { value: '70%', label: 'Palm Island resident', caption: 'Seven in ten staff live on Country', colour: C.mangrove },
              ]}
            />
          </div>

          {/* SUPPORTING stats grid — clean, no icon spam. The "Active
              Services" stat is now the hero above so we filter it out
              of the grid to avoid duplication. */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-x-8 gap-y-12">
            {keyStats
              .filter((s) => !/active services?|total staff/i.test(s.stat_label))
              .map((stat, i) => {
                const sectionColours = [C.ocean, C.mangrove, C.ochre, C.turtleRed, C.starGold, C.reef, C.coral, C.earth]
                const colour = sectionColours[i % sectionColours.length]
                return (
                  <div key={stat.id} className="text-center">
                    <div
                      className="font-fraunces font-bold leading-none"
                      style={{ color: colour, fontSize: 'clamp(40px, 5vw, 64px)' }}
                    >
                      {stat.stat_value}
                    </div>
                    <div className="mt-2 uppercase" style={{ color: C.driftwood, fontSize: 10, letterSpacing: '0.15em' }}>
                      {stat.stat_label}
                    </div>
                    {stat.stat_description && (
                      <div className="mt-2 font-caveat" style={{ color: C.earth, opacity: 0.7, fontSize: 13, lineHeight: 1.3 }}>
                        {stat.stat_description}
                      </div>
                    )}
                    <div className="mx-auto mt-3" style={{ width: '40%', height: 1, backgroundColor: colour, opacity: 0.5 }} />
                  </div>
                )
              })}
          </div>
        </div>
      </AmbientSection>

      {/* VIDEO BREAK — between numbers and the year's stories */}
      <VideoBreak
        videoUrl={VIDEO_TAGS_2025['children-families']}
        caption="What we did this year."
        subcaption="Six anchor stories from Year 17."
        height="55vh"
      />

      {/* HIGHLIGHTS — REAL with descriptions and impact */}
      <AmbientSection section="all" id="highlights">
        <div className="px-6 md:px-12 py-20 md:py-28 max-w-5xl mx-auto">
          <div className="text-center mb-16">
            <div className="uppercase font-bold mb-3" style={{ color: C.ocean, fontSize: 10, letterSpacing: '0.3em' }}>
              What we did this year
            </div>
            <h2 className="font-fraunces font-bold leading-tight" style={{ color: C.ocean, fontSize: 'clamp(36px, 5vw, 56px)' }}>
              Six anchor stories.
            </h2>
          </div>

          <div className="space-y-12">
            {featuredHighlights.map((h, i) => {
              const sectionColours: Array<keyof typeof SECTION_COLOURS> = [
                'economic',
                'childrenFamilies',
                'healthWellbeing',
                'economic',
                'all',
                'all',
              ]
              const sectionKey = sectionColours[i % sectionColours.length] as SectionKey
              const colour = SECTION_COLOURS[sectionKey]
              return (
                <div key={h.id} className="grid grid-cols-1 md:grid-cols-12 gap-6 md:gap-10 pb-12 border-b" style={{ borderColor: '#E8E6E3' }}>
                  <div className="md:col-span-1">
                    <div
                      className="font-fraunces font-bold"
                      style={{ color: colour, fontSize: 48, lineHeight: 1 }}
                    >
                      {String(i + 1).padStart(2, '0')}
                    </div>
                  </div>

                  <div className="md:col-span-7">
                    <div className="uppercase font-bold mb-2" style={{ color: colour, fontSize: 9, letterSpacing: '0.2em' }}>
                      {h.highlight_type.replace(/_/g, ' ')}
                    </div>
                    <h3 className="font-fraunces font-bold leading-tight" style={{ color: C.ocean, fontSize: 'clamp(24px, 3vw, 36px)' }}>
                      {h.title}
                    </h3>
                    <div className="font-fraunces mt-1" style={{ color: C.earth, opacity: 0.8, fontSize: 18 }}>
                      {h.subtitle}
                    </div>
                    <p className="mt-4 leading-relaxed" style={{ color: C.driftwood, fontSize: 15, lineHeight: 1.7 }}>
                      {h.description}
                    </p>
                    {h.impact_achieved && (
                      <div className="mt-4 p-4 rounded-md" style={{ backgroundColor: '#FBF6E4' }}>
                        <div className="uppercase font-bold mb-1" style={{ color: colour, fontSize: 9, letterSpacing: '0.15em' }}>
                          Impact
                        </div>
                        <p style={{ color: C.earth, fontSize: 14, lineHeight: 1.6 }}>{h.impact_achieved}</p>
                      </div>
                    )}
                  </div>

                  <div className="md:col-span-4">
                    {h.metrics && Object.keys(h.metrics).length > 0 && (
                      <div className="space-y-3">
                        {Object.entries(h.metrics).map(([key, value]) => (
                          <div key={key}>
                            <div className="uppercase" style={{ color: C.muted, fontSize: 9, letterSpacing: '0.15em' }}>
                              {key.replace(/_/g, ' ')}
                            </div>
                            <div className="font-fraunces font-bold" style={{ color: colour, fontSize: 22 }}>
                              {String(value)}
                            </div>
                          </div>
                        ))}
                      </div>
                    )}
                  </div>
                </div>
              )
            })}
          </div>
        </div>
      </AmbientSection>

      {/* SERVICES BY CATEGORY — REAL list */}
      <AmbientSection section="all" id="services">
        <div className="px-6 md:px-12 py-20 md:py-28 max-w-6xl mx-auto">
          <div className="text-center mb-16">
            <div className="uppercase font-bold mb-3" style={{ color: C.ocean, fontSize: 10, letterSpacing: '0.3em' }}>
              {piccServices.length} services
            </div>
            <h2 className="font-fraunces font-bold leading-tight" style={{ color: C.ocean, fontSize: 'clamp(36px, 5vw, 56px)' }}>
              Across the island.
            </h2>
          </div>

          {Object.entries(servicesByCategory).map(([category, services]) => {
            const categoryToSection: Record<string, keyof typeof SECTION_COLOURS> = {
              health: 'healthWellbeing',
              family: 'childrenFamilies',
              justice: 'justiceSafety',
              youth: 'youth',
              economic: 'economic',
              education: 'educationCommunity',
              community: 'educationCommunity',
            }
            const sectionKey = (categoryToSection[category] || 'all') as SectionKey
            const colour = SECTION_COLOURS[sectionKey]

            return (
              <div key={category} className="mb-12">
                <div className="flex items-baseline gap-4 mb-6 pb-3 border-b" style={{ borderColor: colour, opacity: 1 }}>
                  <h3 className="font-fraunces font-bold" style={{ color: colour, fontSize: 'clamp(24px, 3vw, 32px)' }}>
                    {category.replace(/_/g, ' ')}
                  </h3>
                  <span style={{ color: C.muted, fontSize: 12 }}>{services.length} services</span>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                  {services.map((service) => (
                    <div key={service.id} className="p-4 rounded-md" style={{ backgroundColor: 'rgba(255,255,255,0.6)' }}>
                      <div className="font-fraunces font-bold mb-1" style={{ color: C.ocean, fontSize: 18 }}>
                        {service.name}
                      </div>
                      {service.description && (
                        <p className="leading-relaxed mb-3" style={{ color: C.driftwood, fontSize: 13 }}>
                          {service.description}
                        </p>
                      )}
                      <div className="flex gap-3 text-xs" style={{ color: C.muted }}>
                        {service.staff_count && (
                          <span>
                            <strong style={{ color: colour }}>{service.staff_count}</strong> staff
                          </span>
                        )}
                        {service.clients_served_annual && (
                          <span>
                            <strong style={{ color: colour }}>{service.clients_served_annual.toLocaleString()}</strong> clients/year
                          </span>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )
          })}
        </div>
      </AmbientSection>

      {/* OUR BOARD — REAL members with photos */}
      <AmbientSection section="all" id="board">
        <div className="px-6 md:px-12 py-20 md:py-28 max-w-6xl mx-auto">
          <div className="text-center mb-16">
            <div className="uppercase font-bold mb-3" style={{ color: C.turtleRed, fontSize: 10, letterSpacing: '0.3em' }}>
              Governance
            </div>
            <h2 className="font-fraunces font-bold leading-tight" style={{ color: C.ocean, fontSize: 'clamp(36px, 5vw, 56px)' }}>
              Our Board.
            </h2>
            <p className="mt-4 mx-auto" style={{ color: C.driftwood, fontSize: 15, maxWidth: 560 }}>
              All directors are Aboriginal and Torres Strait Islander people. Member-elected, Traditional-Owner-nominated, skills-appointed.
            </p>
          </div>

          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-8">
            {reportData.boardMembers
              .sort((a, b) => a.display_order - b.display_order)
              .map((member) => (
                <div key={member.id} className="text-center">
                  {member.photo_url ? (
                    <div className="w-32 h-32 mx-auto rounded-full overflow-hidden mb-4">
                      {/* eslint-disable-next-line @next/next/no-img-element */}
                      <img
                        src={member.photo_url}
                        alt={member.full_name}
                        className="w-full h-full object-cover"
                        style={{ objectPosition: 'center top' }}
                      />
                    </div>
                  ) : (
                    <div
                      className="w-32 h-32 mx-auto rounded-full mb-4 flex items-center justify-center"
                      style={{ backgroundColor: C.sand }}
                    >
                      <span className="font-fraunces" style={{ color: C.turtleRed, fontSize: 36 }}>
                        {member.full_name
                          .split(' ')
                          .map((n) => n[0])
                          .slice(0, 2)
                          .join('')}
                      </span>
                    </div>
                  )}
                  <div className="font-fraunces font-bold" style={{ color: C.ocean, fontSize: 18 }}>
                    {member.full_name}
                  </div>
                  <div className="uppercase mt-1" style={{ color: C.driftwood, fontSize: 10, letterSpacing: '0.1em' }}>
                    {member.position}
                  </div>
                </div>
              ))}
          </div>
        </div>
      </AmbientSection>

      {/* VIDEO BREAK — Elders on Country, before the Lanterns */}
      <VideoBreak
        videoUrl={VIDEO_TAGS_2025['elders']}
        caption="Our Elders."
        subcaption="The hush of the exhibition."
        height="65vh"
      />

      {/* ELDER LANTERNS — real curated quotes */}
      {elderQuotes && elderQuotes.length > 0 && (
        <AmbientSection section="all" id="elder-lanterns">
          <div className="px-4 md:px-12 py-20 md:py-28 max-w-5xl mx-auto">
            <div className="text-center mb-12">
              <div className="uppercase font-bold mb-3" style={{ color: C.turtleRed, fontSize: 10, letterSpacing: '0.3em' }}>
                Our Elders
              </div>
              <h2 className="font-fraunces font-bold leading-tight" style={{ color: C.turtleRed, fontSize: 'clamp(36px, 5vw, 56px)' }}>
                The hush of the exhibition.
              </h2>
            </div>

            <div className="space-y-2">
              {elderQuotes.slice(0, 4).map((q: any, i: number) => (
                <Lantern
                  key={q.id}
                  quote={q.quote_text || q.text}
                  speaker={q.attribution || q.author || 'Bwgcolman Elder'}
                  role={q.context || q.role || 'Elder · Empathy Ledger'}
                  side={i % 2 === 0 ? 'left' : 'right'}
                  portraitUrl={q.photo_url}
                  consent="Recorded with consent · Validated · Empathy Ledger"
                />
              ))}
            </div>
          </div>
        </AmbientSection>
      )}

      {/* COMMUNITY VOICES — real voices */}
      {communityVoices && communityVoices.length > 0 && (
        <AmbientSection section="all" id="community-voices">
          <div className="px-6 md:px-12 py-20 md:py-28 max-w-5xl mx-auto">
            <div className="text-center mb-12">
              <div className="uppercase font-bold mb-3" style={{ color: C.ocean, fontSize: 10, letterSpacing: '0.3em' }}>
                Voices behind the work
              </div>
              <h2 className="font-fraunces font-bold leading-tight" style={{ color: C.ocean, fontSize: 'clamp(32px, 4.5vw, 48px)' }}>
                Where stories meet evidence.
              </h2>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {communityVoices.slice(0, 6).map((q: any) => (
                <Hearth
                  key={q.id}
                  section="all"
                  quote={q.quote_text || q.text}
                  speaker={q.attribution || q.author || 'PICC team member'}
                  role={q.context || q.role || 'PICC team'}
                  portraitUrl={q.photo_url}
                />
              ))}
            </div>
          </div>
        </AmbientSection>
      )}

      {/* INNOVATION PROJECTS — real */}
      {reportData.innovationProjects.length > 0 && (
        <AmbientSection section="all" id="innovation">
          <div className="px-6 md:px-12 py-20 md:py-28 max-w-6xl mx-auto">
            <div className="text-center mb-12">
              <div className="uppercase font-bold mb-3" style={{ color: C.starGold, fontSize: 10, letterSpacing: '0.3em' }}>
                Innovation
              </div>
              <h2 className="font-fraunces font-bold leading-tight" style={{ color: C.ocean, fontSize: 'clamp(32px, 4.5vw, 48px)' }}>
                What we built alongside the work.
              </h2>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
              {reportData.innovationProjects.map((p) => (
                <div key={p.id} className="p-6 rounded-md" style={{ backgroundColor: '#FBF6E4' }}>
                  {p.hero_image_url && (
                    <div className="aspect-[16/9] overflow-hidden rounded-md mb-4">
                      {/* eslint-disable-next-line @next/next/no-img-element */}
                      <img src={p.hero_image_url} alt={p.title} className="w-full h-full object-cover" />
                    </div>
                  )}
                  <div className="uppercase font-bold mb-2" style={{ color: C.starGold, fontSize: 9, letterSpacing: '0.2em' }}>
                    {p.status}
                  </div>
                  <h3 className="font-fraunces font-bold" style={{ color: C.ocean, fontSize: 22 }}>
                    {p.title}
                  </h3>
                  <p className="mt-3 leading-relaxed" style={{ color: C.driftwood, fontSize: 14 }}>
                    {p.description}
                  </p>
                  {p.impact_summary && (
                    <p className="mt-3 font-caveat" style={{ color: C.earth, opacity: 0.8, fontSize: 16 }}>
                      {p.impact_summary}
                    </p>
                  )}
                </div>
              ))}
            </div>
          </div>
        </AmbientSection>
      )}

      {/* FINANCIALS — real */}
      {reportData.financials && (
        <AmbientSection section="all" id="financials">
          <div className="px-6 md:px-12 py-20 md:py-28 max-w-5xl mx-auto">
            <div className="text-center mb-12">
              <div className="uppercase font-bold mb-3" style={{ color: C.mangrove, fontSize: 10, letterSpacing: '0.3em' }}>
                Financials
              </div>
              <h2 className="font-fraunces font-bold leading-tight" style={{ color: C.ocean, fontSize: 'clamp(32px, 4.5vw, 48px)' }}>
                Where the money goes.
              </h2>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-8 mb-12">
              <FinancialBox label="Total Income" amount={reportData.financials.total_income} colour={C.mangrove} />
              <FinancialBox label="Total Expenditure" amount={reportData.financials.total_expenditure} colour={C.coral} />
              <FinancialBox
                label="Net Result"
                amount={reportData.financials.net_result}
                colour={reportData.financials.net_result >= 0 ? C.mangrove : C.coral}
              />
            </div>

            {reportData.financials.breakdown && reportData.financials.breakdown.length > 0 && (
              <div className="mt-6">
                <div className="text-center mb-4 uppercase font-bold" style={{ color: C.driftwood, fontSize: 10, letterSpacing: '0.25em' }}>
                  Expenditure across the reef
                </div>
                <ReefLayers
                  items={[...reportData.financials.breakdown]}
                  caption="Each layer of the reef holds a different part of the work — Children & Families the deepest band, Education & Community the lightest. Together they make the year."
                />
              </div>
            )}
          </div>
        </AmbientSection>
      )}

      {/* VIDEO BREAK — looking forward */}
      <VideoBreak
        videoUrl={VIDEO_TAGS_2025['forward-commitments']}
        caption="The next 20 years."
        subcaption="Three commitments. Three generations."
        height="65vh"
      />

      {/* THREE FORWARD COMMITMENTS */}
      <AmbientSection section="all" id="forward">
        <div className="px-6 md:px-12 py-20 max-w-4xl mx-auto">
          <div className="text-center mb-12">
            <div className="uppercase font-bold mb-3" style={{ color: C.ocean, fontSize: 10, letterSpacing: '0.3em' }}>
              The next 20 years
            </div>
            <h2 className="font-fraunces font-bold leading-tight" style={{ color: C.ocean, fontSize: 'clamp(32px, 4.5vw, 48px)' }}>
              Three commitments. Three generations.
            </h2>
          </div>

          <div className="space-y-6">
            {FORWARD_COMMITMENTS.map((c) => (
              <Horizon
                key={c.id}
                section={c.section}
                year={c.year}
                title={c.title}
                statement={c.statement}
                detail={c.detail}
              />
            ))}
          </div>
        </div>
      </AmbientSection>

      {/* BACK COVER */}
      <BackCoverSection ceoQuote={ceo?.featured_quote} />
    </main>
  )
}

function FinancialBox({ label, amount, colour }: { label: string; amount: number; colour: string }) {
  const formatted =
    Math.abs(amount) >= 1_000_000 ? `$${(amount / 1_000_000).toFixed(1)}M` : `$${(amount / 1_000).toFixed(0)}K`
  return (
    <div className="text-center">
      <div className="font-fraunces font-bold" style={{ color: colour, fontSize: 'clamp(40px, 5vw, 56px)' }}>
        {amount < 0 ? `(${formatted.replace('-', '')})` : formatted}
      </div>
      <div className="uppercase mt-2" style={{ color: C.driftwood, fontSize: 10, letterSpacing: '0.15em' }}>
        {label}
      </div>
    </div>
  )
}

function BackCoverSection({ ceoQuote }: { ceoQuote?: string }) {
  return (
    <section
      id="back-cover"
      className="relative flex flex-col items-center justify-center text-white px-8 py-24 overflow-hidden"
      style={{ backgroundColor: C.midnight, minHeight: '70vh' }}
    >
      <div aria-hidden className="absolute inset-0 pointer-events-none">
        {Array.from({ length: 32 }).map((_, i) => {
          const x = Math.abs(Math.sin(i * 12.7)) * 90 + 5
          const y = Math.abs(Math.cos(i * 7.3)) * 90 + 5
          const size = 1 + Math.abs(Math.sin(i * 3.1)) * 3
          return (
            <span
              key={i}
              className="absolute rounded-full"
              style={{
                top: `${y}%`,
                left: `${x}%`,
                width: size,
                height: size,
                backgroundColor: C.starGold,
                opacity: 0.5,
              }}
            />
          )
        })}
      </div>

      <div className="relative z-10 text-center max-w-2xl">
        {ceoQuote && (
          <p className="font-fraunces italic leading-relaxed mb-12" style={{ fontSize: 'clamp(20px, 2.6vw, 28px)' }}>
            “{ceoQuote}”
          </p>
        )}

        <div className="mb-2 font-caveat" style={{ color: C.ochre, fontSize: 16, opacity: 0.85 }}>
          — Rachel Atkinson, CEO
        </div>

        <div className="mt-12 mx-auto" style={{ width: 60, height: 1, backgroundColor: 'white', opacity: 0.4 }} />

        <div className="mt-12 space-y-3">
          {FORWARD_COMMITMENTS.map((c) => (
            <div key={c.id} className="uppercase" style={{ fontSize: 12, letterSpacing: '0.2em', opacity: 0.85 }}>
              {c.title} by {c.year}.
            </div>
          ))}
        </div>

        <div className="mt-12 mx-auto" style={{ width: 60, height: 1, backgroundColor: 'white', opacity: 0.4 }} />

        <div className="mt-12 space-y-1" style={{ color: '#d1d5db', fontSize: 11, opacity: 0.85 }}>
          <div>Palm Island Community Company Ltd</div>
          <div>ABN 14 640 793 728</div>
          <div>picc.com.au</div>
        </div>

        <div className="mt-16" style={{ fontSize: 9, opacity: 0.5 }}>
          © 2026 Palm Island Community Company. Year 17 of 20. Made on Palm Island. Owned on Palm Island.
        </div>
      </div>
    </section>
  )
}
