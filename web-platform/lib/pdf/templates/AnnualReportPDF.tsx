/**
 * PICC Annual Report PDF Template — Saltwater Country Design System v2
 *
 * Visual refresh: magazine-editorial layouts, bolder typography,
 * richer decorative elements, color variety between sections.
 *
 * Pages: Cover, Acknowledgement, Messages, Year in Numbers, Photo Spread,
 *        Highlights, Community Voices, Youth Voices, Governance, Compliance,
 *        Directors Report, Services, Innovation,
 *        Financials (enhanced), Journey Timeline, Next Twenty,
 *        Back Cover
 *
 * Supports audience-targeted generation via `audience` prop.
 */
import React from 'react'
import path from 'path'
import {
  Document,
  Page,
  Text,
  View,
  Image,
  StyleSheet,
  Svg,
  Rect,
} from '@react-pdf/renderer'

import { C, A4_W, A4_H, MARGIN, CONTENT_W, SP, baseStyles, fmtCurrency, fmtFullCurrency } from '../theme'

// ── Local asset resolver (Gemini-generated illustrations) ──
const assetPath = (filename: string) =>
  path.join(process.cwd(), 'public', 'report-assets', filename)
import {
  RunningHeader,
  PageNumber,
  StatBox,
  QuoteBlock,
  Card,
  PhotoCover,
  PersonAvatar,
  CornerBrackets,
  ConstellationPattern,
  WaveLine,
  StatHero,
  ReefGradientBar,
  ArcDots,
  SectionDivider,
} from '../components'
import { registerFonts } from '../register-fonts'
import type { ReportData, CommunityVoice } from '@/lib/annual-report/fetch-report-data'
import { FINANCIALS, STAFF, SERVICES } from '@/lib/stats/current-stats'
import {
  type ReportAudience,
  AUDIENCE_CONFIGS,
  DEFAULT_PAGES,
  shouldShow,
} from '@/lib/annual-report/audience-config'

const s = baseStyles

export type { ReportAudience }

// ── Local styles — Saltwater Country v2 ──────────────
const ls = StyleSheet.create({
  // Acknowledgement
  ackOuter: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 40,
  },
  ackBorder: {
    borderTop: `2pt solid ${C.ochre}`,
    borderBottom: `2pt solid ${C.ochre}`,
    padding: 32,
    marginVertical: 20,
    maxWidth: 420,
  },
  ackTitle: {
    fontFamily: 'PlayfairDisplay',
    fontSize: 24,
    fontWeight: 'bold',
    color: C.ocean,
    marginBottom: 16,
    textAlign: 'center',
  },
  ackText: {
    fontSize: 10,
    color: C.driftwood,
    lineHeight: 1.9,
    textAlign: 'center',
  },

  // Messages — asymmetric 40/60 layout
  messageRow: {
    flexDirection: 'row',
    marginBottom: 20,
  },
  messagePortrait: {
    width: '35%',
    alignItems: 'center',
    paddingRight: 16,
    paddingTop: 4,
  },
  messageContent: {
    width: '65%',
  },
  messageName: {
    fontSize: 13,
    fontWeight: 'bold',
    color: C.ocean,
    marginBottom: 2,
  },
  messageRole: {
    fontSize: 8.5,
    color: C.muted,
    marginBottom: 10,
    textTransform: 'uppercase',
    letterSpacing: 1,
  },
  messageBody: {
    fontSize: 9,
    color: C.driftwood,
    lineHeight: 1.7,
  },

  // Photo spread
  photoLarge: {
    width: '100%',
    height: 240,
    borderRadius: 10,
    objectFit: 'cover',
    marginBottom: 10,
  },
  photoSmall: {
    width: '48%',
    height: 170,
    borderRadius: 8,
    objectFit: 'cover',
  },
  photoCaption: {
    fontSize: 7,
    color: C.muted,
    marginTop: 3,
    textAlign: 'center',
    fontStyle: 'italic',
  },

  // Governance
  boardGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
  },
  boardCard: {
    width: '31%',
    backgroundColor: C.white,
    borderRadius: 8,
    padding: 12,
    marginBottom: 10,
    alignItems: 'center',
  },
  boardName: {
    fontSize: 9,
    fontWeight: 'bold',
    color: C.ocean,
    textAlign: 'center',
    marginTop: 6,
    marginBottom: 2,
  },
  boardPosition: {
    fontSize: 7.5,
    color: C.muted,
    textAlign: 'center',
  },

  // Services
  serviceCategoryTitle: {
    fontSize: 12,
    fontWeight: 'bold',
    color: C.ocean,
    marginTop: 14,
    marginBottom: 8,
    borderBottom: `1pt solid ${C.border}`,
    paddingBottom: 4,
  },

  // Innovation
  innovationCard: {
    width: '48%',
    backgroundColor: C.white,
    borderRadius: 10,
    overflow: 'hidden',
    marginBottom: 10,
    borderBottom: `3pt solid ${C.reef}`,
  },
  innovationBody: {
    padding: 14,
  },
  innovationTitle: {
    fontSize: 11,
    fontWeight: 'bold',
    color: C.ocean,
    marginBottom: 4,
  },
  innovationDesc: {
    fontSize: 8.5,
    color: C.driftwood,
    lineHeight: 1.5,
  },
  innovationBadge: {
    fontSize: 7,
    color: C.reef,
    fontWeight: 'bold',
    textTransform: 'uppercase',
    letterSpacing: 1,
    marginBottom: 6,
  },

  // Financials
  finBar: {
    height: 20,
    borderRadius: 4,
    marginBottom: 6,
  },
  finLabel: {
    fontSize: 9,
    color: C.driftwood,
    marginBottom: 2,
  },
  finValue: {
    fontSize: 9,
    fontWeight: 'bold',
    color: C.ocean,
  },
  finRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 8,
  },

  // Looking Forward / Goals
  goalRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 14,
    padding: 14,
    backgroundColor: C.white,
    borderRadius: 10,
    borderLeft: `4pt solid ${C.ocean}`,
  },
  goalLabel: {
    fontSize: 10,
    fontWeight: 'bold',
    color: C.ocean,
    marginBottom: 2,
  },
  goalSubtext: {
    fontSize: 8,
    color: C.muted,
  },
  progressBarOuter: {
    width: 160,
    height: 12,
    backgroundColor: C.shell,
    borderRadius: 6,
  },
  progressBarInner: {
    height: 12,
    borderRadius: 6,
  },

  // Back cover
  backCover: {
    flexDirection: 'column',
    backgroundColor: C.midnight,
    fontFamily: 'Inter',
    fontSize: 9.5,
    color: C.white,
    justifyContent: 'center',
    alignItems: 'center',
    padding: MARGIN,
  },
  backLogo: {
    width: 140,
    height: 70,
    marginBottom: 30,
  },
  backMission: {
    fontFamily: 'Caveat',
    fontSize: 24,
    color: C.white,
    textAlign: 'center',
    marginBottom: 24,
    lineHeight: 1.35,
    maxWidth: 380,
  },
  backContact: {
    fontSize: 9,
    color: C.white,
    textAlign: 'center',
    lineHeight: 1.8,
    opacity: 0.6,
  },

  // Compliance
  complianceRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 8,
    paddingBottom: 8,
    borderBottom: `0.5pt solid ${C.border}`,
  },
  complianceLabel: {
    fontSize: 9,
    color: C.muted,
    width: '40%',
  },
  complianceValue: {
    fontSize: 9,
    fontWeight: 'bold',
    color: C.ocean,
    width: '58%',
  },

  // Community Voices
  voiceCard: {
    width: '48%',
    backgroundColor: C.white,
    borderRadius: 10,
    padding: 16,
    marginBottom: 12,
  },
  voiceType: {
    fontSize: 7,
    fontWeight: 'bold',
    textTransform: 'uppercase',
    letterSpacing: 1.5,
    marginBottom: 8,
  },
  voiceText: {
    fontSize: 9.5,
    fontStyle: 'italic',
    color: C.rock,
    lineHeight: 1.65,
    marginBottom: 10,
  },
  voiceAuthor: {
    fontSize: 8,
    color: C.driftwood,
    fontWeight: 'bold',
  },

  // Timeline
  eraBlock: {
    flexDirection: 'row',
    marginBottom: 16,
    padding: 14,
    backgroundColor: C.white,
    borderRadius: 10,
  },
  eraIndicator: {
    width: 4,
    borderRadius: 2,
    marginRight: 14,
  },
  eraName: {
    fontSize: 12,
    fontWeight: 'bold',
    color: C.ocean,
    marginBottom: 2,
  },
  eraYears: {
    fontSize: 8,
    color: C.muted,
    marginBottom: 6,
  },
  eraDesc: {
    fontSize: 8.5,
    color: C.driftwood,
    lineHeight: 1.5,
    marginBottom: 6,
  },
  milestone: {
    fontSize: 7.5,
    color: C.driftwood,
    lineHeight: 1.4,
    paddingLeft: 8,
  },
})

// ── Color palette for stat boxes ──────────────────────
const STAT_COLORS = [C.ocean, C.reef, C.mangrove, C.coral, C.reef, C.starGold]

// ── Era colors for timeline ───────────────────────────
const ERA_COLORS = [C.ocean, C.reef, C.mangrove, C.ochre]

// ── Voice type colors ─────────────────────────────────
const VOICE_TYPE_COLORS: Record<string, string> = {
  elder_quote: C.starGold,
  story: C.ocean,
  community_vision: C.mangrove,
  feedback: C.reef,
}

const VOICE_TYPE_LABELS: Record<string, string> = {
  elder_quote: 'Elder Wisdom',
  story: 'Community Story',
  community_vision: 'Community Vision',
  feedback: 'Community Feedback',
}

// ── Helper: fiscal year display ───────────────────────
function fiscalYearRange(reportYear: number): string {
  return `${reportYear - 1}-${String(reportYear).slice(2)}`
}

// ── Helper: group services by category ────────────────
function groupByCategory(
  services: ReportData['services']
): Record<string, ReportData['services']> {
  const grouped: Record<string, ReportData['services']> = {}
  for (const svc of services) {
    const cat = svc.service_category || 'Other'
    if (!grouped[cat]) grouped[cat] = []
    grouped[cat].push(svc)
  }
  return grouped
}

// ── Service category color map ────────────────────────
const CATEGORY_COLORS: Record<string, string> = {
  health: C.mangrove,
  family: C.reef,
  justice: C.coral,
  community: C.ocean,
  economic: C.reef,
  digital: C.starGold,
}

function categoryColor(cat: string): string {
  const key = cat.toLowerCase()
  for (const [k, v] of Object.entries(CATEGORY_COLORS)) {
    if (key.includes(k)) return v
  }
  return C.ocean
}

// ────────────────────────────────────────────────────────
// Main Document Component
// ────────────────────────────────────────────────────────

export default function AnnualReportPDF({
  data,
  audience = null,
}: {
  data: ReportData
  audience?: ReportAudience
}) {
  registerFonts()

  const year = data.report.report_year
  const yearRange = fiscalYearRange(year)
  const yearNumber = year - 2009 // PICC founded ~2009, so year 17 = 2026
  const headerLeft = 'Palm Island Community Company'
  const headerRight = `Annual Report ${yearRange}`

  // Audience config — resolve dynamic year in subtitle
  const audienceConfig = audience ? AUDIENCE_CONFIGS[audience] : null
  const rawSubtitle = audienceConfig?.coverSubtitle || `Annual Report ${yearRange}`
  const coverSubtitle = rawSubtitle.replace(/Year \d+/, `Year ${yearNumber}`)

  // Select up to 6 key metrics for the numbers page
  const keyStats = data.statistics
    .filter((st) => st.is_key_metric)
    .sort((a, b) => a.display_order - b.display_order)
    .slice(0, 6)

  // If fewer than 6 key metrics, pad from remaining stats
  if (keyStats.length < 6) {
    const ids = new Set(keyStats.map((st) => st.id))
    const extras = data.statistics
      .filter((st) => !ids.has(st.id))
      .sort((a, b) => a.display_order - b.display_order)
    for (const ex of extras) {
      if (keyStats.length >= 6) break
      keyStats.push(ex)
    }
  }

  // Sort highlights: featured first, then by display_order
  const sortedHighlights = [...data.highlights].sort((a, b) => {
    if (a.is_featured !== b.is_featured) return a.is_featured ? -1 : 1
    return a.display_order - b.display_order
  })

  // Group services
  const serviceGroups = groupByCategory(data.services)

  // Financials — from DB or fallback to static constants
  const fin = data.financials || {
    total_income: FINANCIALS.totalIncome,
    total_expenditure: FINANCIALS.totalExpenditure,
    net_result: FINANCIALS.netResult,
    breakdown: Object.entries(FINANCIALS.breakdown).map(([key, val]) => ({
      category: key.replace(/([A-Z])/g, ' $1').replace(/^./, (s) => s.toUpperCase()),
      amount: val.amount,
      percentage: val.pct,
    })),
  }

  // Compliance data
  const comp = data.compliance

  // Community voices — use pre-assigned voice distribution
  const allVoices = data.communityVoices || []
  const va = data.voiceAssignments

  // Page photos — real community photos with AI fallbacks
  const pp = data.pagePhotos

  // History eras
  const eras = data.historyEras || []

  // ── 1. CoverPage ───────────────────────────────────
  // Uses DB cover photo, then pagePhotos, falls back to AI illustration
  const CoverPage = () => (
    <PhotoCover
      photoUrl={data.coverPhoto?.url || pp.cover?.hero || assetPath('island-aerial-golden.jpg')}
      title={coverSubtitle}
      subtitle="PALM ISLAND COMMUNITY COMPANY"
      year={yearRange}
    />
  )

  // ── 2. AcknowledgementPage ─────────────────────────
  // Sand background, ochre accents, ArcDots decoration — ceremonial feel
  const AcknowledgementPage = () => (
    <Page size="A4" style={s.pageSand}>
      <RunningHeader left={headerLeft} right={headerRight} />

      {/* Decorative arcs in corners */}
      <ArcDots
        x={40}
        y={60}
        radius={35}
        startAngle={0}
        endAngle={90}
        dotCount={8}
        color={C.ochre}
        opacity={0.12}
        dotSize={2}
        trails={2}
        trailGap={8}
      />
      <ArcDots
        x={A4_W - 90}
        y={A4_H - 130}
        radius={35}
        startAngle={180}
        endAngle={270}
        dotCount={8}
        color={C.ochre}
        opacity={0.12}
        dotSize={2}
        trails={2}
        trailGap={8}
      />

      <View style={ls.ackOuter}>
        {/* Cultural motif — real landscape photo or dot painting turtle fallback */}
        <Image
          src={pp.acknowledgement?.hero || assetPath('dot-pattern-turtle.jpg')}
          style={{ width: 180, height: 100, objectFit: 'contain', marginBottom: 16, opacity: 0.85 }}
        />
        <SectionDivider width={80} color={C.ochre} opacity={0.3} dotCount={7} />
        <View style={ls.ackBorder}>
          <Text style={ls.ackTitle}>Acknowledgement of Country</Text>
          <Text style={ls.ackText}>
            {data.report.acknowledgments ||
              'Palm Island Community Company acknowledges the Traditional Owners of the land on which we work and live, and recognises their continuing connection to land, water and community. We pay our respects to Elders past, present and emerging.'}
          </Text>
        </View>
        <SectionDivider width={80} color={C.ochre} opacity={0.3} dotCount={7} />
      </View>

      <PageNumber />
    </Page>
  )

  // ── 2b. ContentsPage ──────────────────────────────
  // Table of contents with Palm Island map illustration
  const ContentsPage = () => {
    const tocItems = [
      { label: 'Acknowledgement of Country', page: '2' },
      { label: 'From Our Leaders', page: '4' },
      { label: `Year ${yearNumber} in Numbers`, page: '5' },
      { label: 'Life on Palm Island', page: '6' },
      { label: `Year ${yearNumber} Highlights`, page: '7' },
      { label: 'Community Voices', page: '8' },
      { label: 'Youth Voices', page: '9' },
      { label: 'Community Resilience', page: '10' },
      { label: 'Board of Directors', page: '12' },
      { label: 'Compliance & Registration', page: '13' },
      { label: 'Programs & Services', page: '15' },
      { label: 'Innovation Projects', page: '16' },
      { label: 'Financial Summary', page: '17' },
      { label: 'Our Journey', page: '19' },
      { label: 'The Next 20 Years', page: '20' },
      { label: 'Our Partners', page: '21' },
    ]

    return (
      <Page size="A4" style={s.page}>
        <RunningHeader left={headerLeft} right={headerRight} />

        {/* Palm Island map illustration */}
        <Image
          src={assetPath('palm-island-map.jpg')}
          style={{ width: '100%', height: 180, objectFit: 'cover', borderRadius: 10, marginBottom: 20 }}
        />

        <Text style={s.sectionLabel}>Contents</Text>
        <Text style={s.h1}>Inside This Report</Text>

        {/* Dot divider strip */}
        <Image
          src={assetPath('dot-divider-strip.jpg')}
          style={{ width: '100%', height: 24, objectFit: 'cover', marginVertical: 12 }}
        />

        {tocItems.map((item, i) => (
          <View
            key={i}
            style={{
              flexDirection: 'row',
              justifyContent: 'space-between',
              alignItems: 'center',
              paddingVertical: 7,
              borderBottom: `0.5pt solid ${C.border}`,
            }}
          >
            <Text style={{ fontSize: 10, color: C.driftwood }}>{item.label}</Text>
            <Text style={{ fontSize: 10, fontWeight: 'bold', color: C.ocean }}>{item.page}</Text>
          </View>
        ))}

        <PageNumber />
      </Page>
    )
  }

  // ── 2c. PartnersPage ─────────────────────────────
  // Acknowledgement of funders and partners
  const PartnersPage = () => {
    const partners = [
      { name: 'Queensland Government', category: 'Government' },
      { name: 'Australian Government — NIAA', category: 'Government' },
      { name: 'Department of Social Services', category: 'Government' },
      { name: 'Queensland Health', category: 'Government' },
      { name: 'Department of Children, Youth Justice & Multicultural Affairs', category: 'Government' },
      { name: 'Townsville Hospital and Health Service', category: 'Health' },
      { name: 'Palm Island Aboriginal Shire Council', category: 'Community' },
      { name: 'ATSILS (Aboriginal & Torres Strait Islander Legal Service)', category: 'Justice' },
    ]

    const partnersByCategory = partners.reduce((acc, p) => {
      if (!acc[p.category]) acc[p.category] = []
      acc[p.category].push(p.name)
      return acc
    }, {} as Record<string, string[]>)

    return (
      <Page size="A4" style={s.pageShell}>
        <RunningHeader left={headerLeft} right={headerRight} />
        <ConstellationPattern seed={21} opacity={0.04} color={C.ocean} />

        <Text style={s.sectionLabel}>Acknowledgements</Text>
        <Text style={s.h1}>Our Partners</Text>
        <WaveLine width={60} marginVertical={6} color={C.ochre} />
        <Text style={[s.lead, { marginBottom: 10 }]}>
          We gratefully acknowledge the organisations and government agencies that support our work.
        </Text>

        {/* Partners turtle illustration */}
        <Image
          src={assetPath('partners-turtle.jpg')}
          style={{ width: '100%', height: 140, objectFit: 'cover', borderRadius: 10, marginBottom: 16 }}
        />

        {Object.entries(partnersByCategory).map(([category, names]) => (
          <View key={category} wrap={false} style={{ marginBottom: 14 }}>
            <Text style={{ fontSize: 11, fontWeight: 'bold', color: C.ocean, marginBottom: 6, borderBottom: `1pt solid ${C.border}`, paddingBottom: 4 }}>
              {category}
            </Text>
            {names.map((name, i) => (
              <Text key={i} style={{ fontSize: 9.5, color: C.driftwood, lineHeight: 1.8, paddingLeft: 8 }}>
                {name}
              </Text>
            ))}
          </View>
        ))}

        {/* Dot divider */}
        <Image
          src={assetPath('dot-divider-strip.jpg')}
          style={{ width: '100%', height: 20, objectFit: 'cover', marginTop: 16 }}
        />

        <PageNumber />
      </Page>
    )
  }

  // ── 3. MessagesPage ────────────────────────────────
  // Asymmetric portrait/text layout — magazine editorial feel
  const MessagesPage = () => {
    const messages = [...data.leadershipMessages].sort(
      (a, b) => a.display_order - b.display_order
    )

    return (
      <Page size="A4" style={s.page}>
        <RunningHeader left={headerLeft} right={headerRight} />

        <Text style={s.sectionLabel}>Leadership</Text>
        <Text style={s.h1}>From Our Leaders</Text>
        <WaveLine width={60} marginVertical={6} color={C.ochre} />

        {messages.map((msg, i) => {
          const accentColor = i % 2 === 0 ? C.ocean : C.reef
          return (
            <View
              key={msg.id || i}
              wrap={false}
              style={[
                ls.messageRow,
                i % 2 === 1 ? { backgroundColor: C.shell, borderRadius: 10, padding: 16 } : { paddingBottom: 16 },
              ]}
            >
              {/* Portrait column — 35% */}
              <View style={ls.messagePortrait}>
                <PersonAvatar
                  photoUrl={msg.photo_url}
                  name={msg.person_name}
                  size={72}
                  color={accentColor}
                />
                <Text style={[ls.messageName, { marginTop: 8, textAlign: 'center', fontSize: 11 }]}>
                  {msg.person_name}
                </Text>
                <Text style={[ls.messageRole, { textAlign: 'center' }]}>
                  {msg.person_title}
                </Text>
                {/* Accent dash under name */}
                <View style={{ width: 24, height: 2, backgroundColor: accentColor, borderRadius: 1, marginTop: 4 }} />
              </View>

              {/* Content column — 65% */}
              <View style={ls.messageContent}>
                {msg.message_title && (
                  <Text style={[s.h4, { marginBottom: 6, color: accentColor }]}>{msg.message_title}</Text>
                )}

                <Text style={ls.messageBody}>
                  {msg.message_excerpt || msg.message_content}
                </Text>

                {msg.featured_quote && (
                  <View style={{ marginTop: 12 }}>
                    <QuoteBlock
                      text={msg.featured_quote}
                      author={msg.person_name}
                      role={msg.person_title}
                      color={accentColor}
                    />
                  </View>
                )}
              </View>
            </View>
          )
        })}

        <PageNumber />
      </Page>
    )
  }

  // ── 4. YearInNumbersPage ───────────────────────────
  // Infographic-style — hero stat with photo, large numbers, generous spacing
  const YearInNumbersPage = () => (
    <Page size="A4" style={s.pageShell}>
      <RunningHeader left={headerLeft} right={headerRight} />
      <ConstellationPattern seed={4} opacity={0.05} color={C.ocean} />

      <Text style={s.sectionLabel}>Impact</Text>
      <Text style={s.h1}>Year {yearNumber} in Numbers</Text>
      <WaveLine width={60} marginVertical={6} color={C.ochre} />

      {/* Hero stat — 197 Staff overlay */}
      <View style={{ marginBottom: 16 }}>
        <StatHero
          value="197"
          label="Passionate Staff Members"
          description="A diverse team dedicated to delivering excellence across Palm Island."
          variant="overlay"
          photo={data.galleryPhotos[0]?.url}
          valueSize={96}
          height={200}
        />
      </View>

      {/* Four large stat blocks in 2×2 grid */}
      <View style={{ flexDirection: 'row', flexWrap: 'wrap', justifyContent: 'space-between' }}>
        <View style={{ width: '48%', marginBottom: 12 }}>
          <StatHero value="$23.4M" label="Annual Revenue" variant="plain" valueSize={42} accentColor={C.mangrove} bgColor={C.white} />
        </View>
        <View style={{ width: '48%', marginBottom: 12 }}>
          <StatHero value="82%" label="Indigenous Employment" variant="plain" valueSize={42} accentColor={C.ochre} bgColor={C.white} />
        </View>
        <View style={{ width: '48%', marginBottom: 12 }}>
          <StatHero value="20" label="Integrated Services" variant="plain" valueSize={42} accentColor={C.reef} bgColor={C.white} />
        </View>
        <View style={{ width: '48%', marginBottom: 12 }}>
          <StatHero value="3,200+" label="Community Members Served" variant="plain" valueSize={36} accentColor={C.coral} bgColor={C.white} />
        </View>
      </View>

      {/* Dynamic stats from data — smaller row */}
      {keyStats.length > 0 && (
        <View style={{ flexDirection: 'row', flexWrap: 'wrap', justifyContent: 'space-between', marginTop: 4 }}>
          {keyStats.slice(0, 4).map((stat, i) => (
            <StatBox
              key={stat.id || i}
              value={stat.stat_unit ? `${stat.stat_value}${stat.stat_unit}` : stat.stat_value}
              label={stat.stat_label}
              color={STAT_COLORS[i % STAT_COLORS.length]}
              variant="inline"
              width="48%"
            />
          ))}
        </View>
      )}

      <PageNumber />
    </Page>
  )

  // ── 5. PhotoSpreadPage ─────────────────────────────
  // Full gallery feel — minimal chrome, photos dominate
  const PhotoSpreadPage = () => {
    const photos = data.galleryPhotos
    if (photos.length === 0) return null

    return (
      <Page size="A4" style={s.page}>
        <RunningHeader left={headerLeft} right={headerRight} />

        <Text style={s.sectionLabel}>Our Community</Text>
        <Text style={s.h1}>Life on Palm Island</Text>
        <WaveLine width={60} marginVertical={6} color={C.ochre} />
        <Text style={[s.lead, { marginBottom: 12 }]}>
          Moments from across our community and services.
        </Text>

        {/* First photo large — full width */}
        {photos[0] && (
          <View wrap={false} style={{ marginBottom: 10 }}>
            <Image src={photos[0].url} style={ls.photoLarge} />
            {photos[0].caption && (
              <Text style={ls.photoCaption}>{photos[0].caption}</Text>
            )}
          </View>
        )}

        {/* Remaining photos in 2-column grid */}
        <View style={{ flexDirection: 'row', flexWrap: 'wrap', justifyContent: 'space-between' }}>
          {photos.slice(1, 5).map((photo, i) => (
            <View key={i} wrap={false} style={{ width: '48%', marginBottom: 10 }}>
              <Image src={photo.url} style={ls.photoSmall} />
              {photo.caption && (
                <Text style={ls.photoCaption}>{photo.caption}</Text>
              )}
            </View>
          ))}
        </View>

        <PageNumber />
      </Page>
    )
  }

  // ── 6. HighlightsPage ──────────────────────────────
  // Featured highlight gets larger treatment, others in grid
  const HighlightsPage = () => {
    const featured = sortedHighlights.find((h) => h.is_featured)
    const rest = sortedHighlights.filter((h) => !h.is_featured).slice(0, 5)

    return (
      <Page size="A4" style={s.page}>
        <RunningHeader left={headerLeft} right={headerRight} />
        <CornerBrackets inset={30} opacity={0.1} corners={['tl', 'br']} />

        <Text style={s.sectionLabel}>Highlights</Text>
        <Text style={s.h1}>Year {yearNumber} Highlights</Text>
        <WaveLine width={60} marginVertical={6} color={C.ochre} />
        <Text style={[s.lead, { marginBottom: 14 }]}>
          The stories, achievements, and milestones that defined our year.
        </Text>

        {/* Featured highlight — full-width card */}
        {featured && (
          <Card
            title={featured.title}
            description={featured.description || featured.subtitle}
            badge={featured.impact_achieved || undefined}
            color={C.reef}
            width="100%"
            variant="featured"
          />
        )}

        {/* Remaining highlights in 2-column grid */}
        <View style={{ flexDirection: 'row', flexWrap: 'wrap', justifyContent: 'space-between' }}>
          {rest.map((hl, i) => (
            <Card
              key={hl.id || i}
              title={hl.title}
              description={hl.description || hl.subtitle}
              badge={hl.impact_achieved || undefined}
              color={STAT_COLORS[i % STAT_COLORS.length]}
              width="48%"
            />
          ))}
        </View>

        <PageNumber />
      </Page>
    )
  }

  // ── 7. CommunityVoicesPage ─────────────────────────
  // Sand background, larger quotes with portrait pairing, voice-type coding
  const CommunityVoicesPage = () => {
    const voices = va.communityVoices.voices.length > 0 ? va.communityVoices.voices : allVoices.filter((v) => v.type !== 'elder_quote' && v.category !== 'youth').slice(0, 6)
    if (voices.length === 0) return null

    return (
      <Page size="A4" style={s.pageSand}>
        <RunningHeader left={headerLeft} right={headerRight} />
        <ConstellationPattern seed={7} color={C.ocean} opacity={0.03} />

        <Text style={s.sectionLabel}>Community Voices</Text>
        <Text style={s.h1}>What Our Community Says</Text>
        <WaveLine width={60} marginVertical={6} color={C.ochre} />
        <Text style={[s.lead, { marginBottom: 10 }]}>
          Real voices from the people at the heart of everything we do.
        </Text>

        {/* Community photo — real photo or AI fallback */}
        <Image
          src={pp.communityVoices?.hero || assetPath('community-celebration.jpg')}
          style={{ width: '100%', height: 140, objectFit: 'cover', borderRadius: 10, marginBottom: 14 }}
        />

        {/* First voice — large editorial quote */}
        {voices[0] && (
          <View wrap={false} style={{ marginBottom: 16 }}>
            <QuoteBlock
              text={voices[0].text}
              author={voices[0].author || 'Community Member'}
              role={voices[0].role || undefined}
              photoUrl={voices[0].photo_url || undefined}
              color={VOICE_TYPE_COLORS[voices[0].type] || C.ocean}
              variant="large"
            />
          </View>
        )}

        {/* Remaining voices in 2-column cards */}
        <View style={{ flexDirection: 'row', flexWrap: 'wrap', justifyContent: 'space-between' }}>
          {voices.slice(1).map((voice, i) => {
            const color = VOICE_TYPE_COLORS[voice.type] || C.ocean
            const typeLabel = VOICE_TYPE_LABELS[voice.type] || 'Community'
            return (
              <View key={voice.id || i} wrap={false} style={[ls.voiceCard, { borderLeft: `3pt solid ${color}` }]}>
                <Text style={[ls.voiceType, { color }]}>{typeLabel}</Text>
                {voice.photo_url && (
                  <Image
                    src={voice.photo_url}
                    style={{ width: 40, height: 40, borderRadius: 20, objectFit: 'cover', marginBottom: 8 }}
                  />
                )}
                <Text style={ls.voiceText}>&ldquo;{voice.text}&rdquo;</Text>
                <View style={{ flexDirection: 'row', alignItems: 'center' }}>
                  {!voice.photo_url && (
                    <PersonAvatar photoUrl={null} name={voice.author || 'A'} size={20} color={color} />
                  )}
                  <Text style={[ls.voiceAuthor, { marginLeft: voice.photo_url ? 0 : 6 }]}>
                    — {voice.author || 'Anonymous'}{voice.role ? `, ${voice.role}` : ''}
                  </Text>
                </View>
              </View>
            )
          })}
        </View>

        <PageNumber />
      </Page>
    )
  }

  // ── 8. YouthVoicesPage ─────────────────────────────
  // Energetic — bolder colors, larger quotes, ConstellationPattern
  const YouthVoicesPage = () => {
    const voices = va.youthVoices.voices.length > 0 ? va.youthVoices.voices : allVoices.filter((v) => v.category === 'youth' || v.type === 'story').slice(0, 3)
    if (voices.length === 0) return null

    return (
      <Page size="A4" style={s.page}>
        <RunningHeader left={headerLeft} right={headerRight} />
        <ConstellationPattern seed={8} opacity={0.06} color={C.reef} />

        <Text style={s.sectionLabel}>Youth Voices</Text>
        <Text style={s.h1}>Our Young People Speak</Text>
        <WaveLine width={60} marginVertical={6} color={C.coral} />
        <Text style={[s.lead, { marginBottom: 10 }]}>
          32% of Palm Island is youth. Their voices shape our future.
        </Text>

        {/* Youth photo — real photo or AI fallback */}
        <Image
          src={pp.youthVoices?.hero || assetPath('youth-programs.jpg')}
          style={{ width: '100%', height: 130, objectFit: 'cover', borderRadius: 10, marginBottom: 14 }}
        />

        {voices.map((voice, i) => (
          <View key={voice.id || i} wrap={false} style={{ marginBottom: 16 }}>
            <QuoteBlock
              text={voice.text}
              author={voice.author || 'Young Person'}
              role={voice.role || 'Palm Island Youth'}
              photoUrl={voice.photo_url || undefined}
              color={[C.reef, C.coral, C.starGold][i % 3]}
              variant={i === 0 ? 'large' : 'default'}
            />
          </View>
        ))}

        {/* Youth stats callout — bolder treatment */}
        <View wrap={false} style={{ flexDirection: 'row', justifyContent: 'space-between', marginTop: 8 }}>
          <StatBox
            value={data.statistics.find(st => st.stat_label.toLowerCase().includes('youth population'))?.stat_value || '32%'}
            label="Youth Population"
            color={C.reef}
          />
          <StatBox
            value={data.statistics.find(st => st.stat_label.toLowerCase().includes('digital') && st.stat_label.toLowerCase().includes('youth'))?.stat_value || String(STAFF.digitalCentreStaff)}
            label="Youth at Digital Centre"
            color={C.ocean}
          />
          <StatBox
            value={data.statistics.find(st => st.stat_label.toLowerCase().includes('diversionary'))?.stat_value || '1,253'}
            label="Diversionary Referrals"
            color={C.mangrove}
          />
        </View>

        <PageNumber />
      </Page>
    )
  }

  // ── 9. ResiliencePage ─────────────────────────────
  const ResiliencePage = () => {
    const rs = data.resilienceStories
    if (!rs) return null

    return (
      <Page size="A4" style={s.pageSand}>
        <RunningHeader left={headerLeft} right={headerRight} />
        <ConstellationPattern seed={9} opacity={0.04} color={C.starGold} />

        <Text style={s.sectionLabel}>Community Resilience</Text>
        <Text style={s.h1}>13,000 Years of Flood Knowledge</Text>
        <WaveLine width={60} marginVertical={6} color={C.starGold} />
        <Text style={[s.lead, { marginBottom: 10 }]}>
          {rs.subtitle}
        </Text>

        {/* Resilience photo — real photo or AI fallback */}
        <Image
          src={pp.resilience?.hero || assetPath('hull-river-history.jpg')}
          style={{ width: '100%', height: 120, objectFit: 'cover', borderRadius: 10, marginBottom: 14 }}
        />

        {/* Gubbal creation story — editorial quote */}
        <View wrap={false} style={{ marginBottom: 16 }}>
          <QuoteBlock
            text={rs.gubbal.text}
            author={rs.gubbal.attribution}
            color={C.starGold}
            variant="editorial"
          />
          <Text style={{ fontSize: 7, color: C.muted, fontStyle: 'italic', textAlign: 'center', marginTop: 4 }}>
            {rs.gubbal.culturalNote}
          </Text>
        </View>

        {/* Traditional wisdom */}
        <View wrap={false} style={{ padding: 16, backgroundColor: C.white, borderRadius: 10, marginBottom: 16, borderLeft: `4pt solid ${C.starGold}` }}>
          <Text style={[s.h4, { marginBottom: 8, color: C.starGold }]}>Manbarra Weather Wisdom</Text>
          {rs.traditionalWisdom.map((w, i) => (
            <Text key={i} style={{ fontSize: 8.5, color: C.driftwood, lineHeight: 1.6, paddingLeft: 8, marginBottom: 3 }}>
              {w}
            </Text>
          ))}
        </View>

        {/* Resilience timeline */}
        <Text style={[s.h4, { marginBottom: 10 }]}>A Timeline of Resilience</Text>
        {rs.timeline.map((t, i) => (
          <View key={i} wrap={false} style={{ flexDirection: 'row', marginBottom: 8 }}>
            <View style={{ width: 60 }}>
              <Text style={{ fontSize: 8, fontWeight: 'bold', color: ERA_COLORS[i % ERA_COLORS.length] }}>{t.year}</Text>
            </View>
            <View style={{ flex: 1, borderLeft: `2pt solid ${ERA_COLORS[i % ERA_COLORS.length]}`, paddingLeft: 10 }}>
              <Text style={{ fontSize: 9, fontWeight: 'bold', color: C.ocean, marginBottom: 1 }}>{t.event}</Text>
              <Text style={{ fontSize: 8, color: C.driftwood, lineHeight: 1.4 }}>{t.detail}</Text>
            </View>
          </View>
        ))}

        <PageNumber />
      </Page>
    )
  }

  // ── 9b. FloodStoriesPage ─────────────────────────
  const FloodStoriesPage = () => {
    const rs = data.resilienceStories
    if (!rs) return null

    const resilienceVoices = va.floodStories.voices.length > 0 ? va.floodStories.voices : allVoices.filter((v) => v.category === 'resilience').slice(0, 4)
    if (resilienceVoices.length === 0) return null

    return (
      <Page size="A4" style={s.page}>
        <RunningHeader left={headerLeft} right={headerRight} />
        <ConstellationPattern seed={10} opacity={0.04} color={C.ocean} />

        <Text style={s.sectionLabel}>Flood Stories</Text>
        <Text style={s.h1}>Many Tribes, One People</Text>
        <WaveLine width={60} marginVertical={6} color={C.ochre} />
        <Text style={[s.lead, { marginBottom: 14 }]}>
          Community voices from Palm Island&apos;s ongoing relationship with water, weather, and resilience.
        </Text>

        {/* Community voices about floods/resilience */}
        {resilienceVoices.map((voice, i) => (
          <View key={voice.id || i} wrap={false} style={{ marginBottom: 14 }}>
            <QuoteBlock
              text={voice.text}
              author={voice.author || 'Community Voice'}
              role={voice.role || undefined}
              photoUrl={voice.photo_url || undefined}
              color={ERA_COLORS[i % ERA_COLORS.length]}
              variant={i === 0 ? 'large' : 'default'}
            />
          </View>
        ))}

        {/* The Magnificent Seven */}
        <View wrap={false} style={{ padding: 16, backgroundColor: C.shell, borderRadius: 10, marginTop: 4, borderBottom: `3pt solid ${C.ocean}` }}>
          <Text style={[s.h4, { marginBottom: 8 }]}>The Magnificent Seven — 1957 Strike Leaders</Text>
          <Text style={{ fontSize: 8.5, color: C.driftwood, lineHeight: 1.5, marginBottom: 10 }}>
            The same organizing capacity shown in the 1957 strike now mobilises flood response across Palm Island.
          </Text>
          <View style={{ flexDirection: 'row', flexWrap: 'wrap', justifyContent: 'space-between' }}>
            {rs.magnificentSeven.map((person, i) => (
              <View key={i} style={{ width: '48%', flexDirection: 'row', alignItems: 'center', marginBottom: 6 }}>
                <PersonAvatar photoUrl={null} name={person.name} size={22} color={ERA_COLORS[i % ERA_COLORS.length]} />
                <View style={{ marginLeft: 8 }}>
                  <Text style={{ fontSize: 8, fontWeight: 'bold', color: C.ocean }}>{person.name}</Text>
                  <Text style={{ fontSize: 7, color: C.muted }}>{person.role}</Text>
                </View>
              </View>
            ))}
          </View>
        </View>

        <PageNumber />
      </Page>
    )
  }

  // ── 10. GovernancePage ──────────────────────────────
  const GovernancePage = () => {
    const sortedBoard = [...data.boardMembers].sort(
      (a, b) => a.display_order - b.display_order
    )

    return (
      <Page size="A4" style={s.page}>
        <RunningHeader left={headerLeft} right={headerRight} />
        <CornerBrackets inset={30} opacity={0.1} />

        <Text style={s.sectionLabel}>Governance</Text>
        <Text style={s.h1}>Board of Directors</Text>
        <WaveLine width={60} marginVertical={6} color={C.ochre} />

        {/* Governance photo — real board photo or AI fallback */}
        <Image
          src={pp.governance?.hero || assetPath('governance-circle.jpg')}
          style={{ width: '100%', height: 130, objectFit: 'cover', borderRadius: 10, marginBottom: 12 }}
        />

        <View style={ls.boardGrid}>
          {sortedBoard.map((member, i) => (
            <View key={member.id || i} wrap={false} style={ls.boardCard}>
              <PersonAvatar
                photoUrl={member.photo_url}
                name={member.full_name}
                size={44}
                color={C.ocean}
              />
              <Text style={ls.boardName}>{member.full_name}</Text>
              <Text style={ls.boardPosition}>{member.position}</Text>
            </View>
          ))}
        </View>

        {/* Governance statement */}
        {comp.board_meetings_held && (
          <View wrap={false} style={{ marginTop: 16, padding: 16, backgroundColor: C.shell, borderRadius: 10, borderLeft: `4pt solid ${C.ocean}` }}>
            <Text style={[s.h4, { marginBottom: 4 }]}>Governance Statement</Text>
            <Text style={{ fontSize: 9, color: C.driftwood, lineHeight: 1.6 }}>
              The Board met {comp.board_meetings_held} times during {yearRange}. All directors are Aboriginal and/or Torres Strait Islander people. The Board maintains compliance with ORIC, ACNC, and ASIC regulatory requirements.
            </Text>
          </View>
        )}

        <PageNumber />
      </Page>
    )
  }

  // ── 10b. CompliancePage ─────────────────────────────
  const CompliancePage = () => (
    <Page size="A4" style={s.page}>
      <RunningHeader left={headerLeft} right={headerRight} />
      <CornerBrackets inset={30} opacity={0.08} corners={['tl', 'br']} />

      <Text style={s.sectionLabel}>Regulatory</Text>
      <Text style={s.h1}>Compliance &amp; Registration</Text>
      <WaveLine width={60} marginVertical={6} color={C.ochre} />
      <Text style={[s.lead, { marginBottom: 20 }]}>
        Palm Island Community Company operates under the Corporations (Aboriginal and Torres Strait Islander) Act 2006 (CATSI Act).
      </Text>

      {/* Key compliance details */}
      <View style={{ marginBottom: 20 }}>
        <View style={ls.complianceRow}>
          <Text style={ls.complianceLabel}>ICN (Indigenous Corporation Number)</Text>
          <Text style={ls.complianceValue}>{comp.icn_number || 'ICN 7438'}</Text>
        </View>
        <View style={ls.complianceRow}>
          <Text style={ls.complianceLabel}>ABN</Text>
          <Text style={ls.complianceValue}>11 154 579 565</Text>
        </View>
        <View style={ls.complianceRow}>
          <Text style={ls.complianceLabel}>Registered Under</Text>
          <Text style={ls.complianceValue}>CATSI Act 2006 (ORIC)</Text>
        </View>
        <View style={ls.complianceRow}>
          <Text style={ls.complianceLabel}>Also Registered With</Text>
          <Text style={ls.complianceValue}>ACNC, ASIC</Text>
        </View>
        <View style={ls.complianceRow}>
          <Text style={ls.complianceLabel}>Corporation Size</Text>
          <Text style={ls.complianceValue}>Large</Text>
        </View>
        {comp.members_count && (
          <View style={ls.complianceRow}>
            <Text style={ls.complianceLabel}>Members</Text>
            <Text style={ls.complianceValue}>{comp.members_count}</Text>
          </View>
        )}
        {comp.agm_date && (
          <View style={ls.complianceRow}>
            <Text style={ls.complianceLabel}>AGM Date</Text>
            <Text style={ls.complianceValue}>{new Date(comp.agm_date).toLocaleDateString('en-AU', { day: 'numeric', month: 'long', year: 'numeric' })}</Text>
          </View>
        )}
        {comp.board_meetings_held && (
          <View style={ls.complianceRow}>
            <Text style={ls.complianceLabel}>Board Meetings Held</Text>
            <Text style={ls.complianceValue}>{comp.board_meetings_held}</Text>
          </View>
        )}
      </View>

      {/* Auditor reference */}
      <View wrap={false} style={{ padding: 16, backgroundColor: C.shell, borderRadius: 10, marginBottom: 16, borderLeft: `4pt solid ${C.ocean}` }}>
        <Text style={[s.h4, { marginBottom: 6 }]}>Auditor&apos;s Report</Text>
        <Text style={{ fontSize: 9, color: C.driftwood, lineHeight: 1.6 }}>
          {comp.auditor_firm
            ? `The financial statements for ${yearRange} have been audited by ${comp.auditor_firm}${comp.auditor_name ? ` (${comp.auditor_name})` : ''}. The auditor issued an ${comp.audit_opinion || 'unqualified'} opinion.`
            : `The financial statements for ${yearRange} have been independently audited in accordance with Australian Auditing Standards. A full copy of the auditor's report is available from the PICC office.`
          }
        </Text>
      </View>

      {/* CATSI Act compliance statement */}
      <View wrap={false} style={{ padding: 16, backgroundColor: C.sand, borderRadius: 10 }}>
        <Text style={[s.h4, { marginBottom: 6, color: C.ochre }]}>CATSI Act Compliance</Text>
        <Text style={{ fontSize: 9, color: C.driftwood, lineHeight: 1.6 }}>
          Palm Island Community Company Ltd confirms compliance with the reporting requirements of the Corporations (Aboriginal and Torres Strait Islander) Act 2006. This annual report has been prepared in accordance with the CATSI Act and lodged with the Office of the Registrar of Indigenous Corporations (ORIC).
        </Text>
      </View>

      <PageNumber />
    </Page>
  )

  // ── 11. DirectorsReportPage ────────────────────────
  const DirectorsReportPage = () => (
    <Page size="A4" style={s.page}>
      <RunningHeader left={headerLeft} right={headerRight} />
      <CornerBrackets inset={30} opacity={0.08} corners={['tl', 'br']} />

      <Text style={s.sectionLabel}>Directors&apos; Report</Text>
      <Text style={s.h1}>Directors&apos; Declaration</Text>
      <WaveLine width={60} marginVertical={6} color={C.ochre} />

      <View style={{ marginTop: 16, padding: 24, backgroundColor: C.shell, borderRadius: 10, borderTop: `4pt solid ${C.ocean}` }}>
        <Text style={{ fontSize: 10, color: C.driftwood, lineHeight: 1.8 }}>
          {comp.directors_declaration ||
            `The directors of Palm Island Community Company Ltd declare that:\n\n1. The financial statements and notes are in accordance with the Corporations (Aboriginal and Torres Strait Islander) Act 2006 and:\n   (a) comply with Australian Accounting Standards; and\n   (b) give a true and fair view of the financial position as at 30 June ${year} and of the performance for the year ended on that date.\n\n2. In the directors' opinion there are reasonable grounds to believe that the corporation will be able to pay its debts as and when they become due and payable.\n\nThis declaration is made in accordance with a resolution of the Board of Directors.`
          }
        </Text>
      </View>

      {/* Signatories */}
      <View style={{ marginTop: 36, flexDirection: 'row', justifyContent: 'space-between' }}>
        <View style={{ width: '45%' }}>
          <View style={{ borderTop: `1pt solid ${C.ocean}`, paddingTop: 10, marginTop: 40 }}>
            <Text style={{ fontSize: 10, fontWeight: 'bold', color: C.ocean }}>
              {data.boardMembers.find((m) => m.position === 'Chair')?.full_name || 'Luella Bligh'}
            </Text>
            <Text style={{ fontSize: 8.5, color: C.muted }}>Chair</Text>
          </View>
        </View>
        <View style={{ width: '45%' }}>
          <View style={{ borderTop: `1pt solid ${C.ocean}`, paddingTop: 10, marginTop: 40 }}>
            <Text style={{ fontSize: 10, fontWeight: 'bold', color: C.ocean }}>
              {data.leadershipMessages.find((m) => m.person_title?.toLowerCase().includes('ceo') || m.person_title?.toLowerCase().includes('chief executive'))?.person_name || 'Rachel Atkinson'}
            </Text>
            <Text style={{ fontSize: 8.5, color: C.muted }}>Chief Executive Officer</Text>
          </View>
        </View>
      </View>

      <PageNumber />
    </Page>
  )

  // ── 12. ServicesPage ────────────────────────────────
  const ServicesPage = () => (
    <Page size="A4" style={s.page}>
      <RunningHeader left={headerLeft} right={headerRight} />
      <ConstellationPattern seed={12} opacity={0.04} color={C.ocean} />

      <Text style={s.sectionLabel}>Year {yearNumber} — Our Services</Text>
      <Text style={s.h1}>Programs &amp; Services</Text>
      <WaveLine width={60} marginVertical={6} color={C.ochre} />

      {/* Services photo — real healthcare photo or AI fallback */}
      <View wrap={false} style={{ flexDirection: 'row', marginBottom: 12 }}>
        <Image
          src={pp.services?.hero || assetPath('health-wellbeing.jpg')}
          style={{ width: 80, height: 80, objectFit: 'contain', marginRight: 14 }}
        />
        <View style={{ flex: 1, justifyContent: 'center' }}>
          <Text style={[s.lead, { marginBottom: 0 }]}>
            Delivering essential services to the Palm Island community across health, family, justice, crisis, digital, and economic development.
          </Text>
        </View>
      </View>

      {Object.entries(serviceGroups).map(([category, services]) => (
        <View key={category} wrap={false}>
          <Text style={[ls.serviceCategoryTitle, { color: categoryColor(category) }]}>
            {category}
          </Text>
          <View style={{ flexDirection: 'row', flexWrap: 'wrap', justifyContent: 'space-between' }}>
            {services.map((svc, i) => {
              const badges: string[] = []
              if (svc.staff_count) badges.push(`${svc.staff_count} staff`)
              if (svc.clients_served_annual)
                badges.push(`${svc.clients_served_annual} clients/year`)

              return (
                <Card
                  key={svc.id || i}
                  title={svc.name}
                  description={svc.description}
                  badge={badges.join(' | ') || undefined}
                  color={categoryColor(category)}
                  width="48%"
                  variant="compact"
                />
              )
            })}
          </View>
        </View>
      ))}

      <PageNumber />
    </Page>
  )

  // ── 13. InnovationOverviewPage ─────────────────────
  const InnovationOverviewPage = () => {
    const projects = data.innovationProjects
    if (projects.length === 0) return null

    const activeCount = projects.filter((p) => p.status === 'active' || p.status === 'Active').length

    return (
      <Page size="A4" style={s.pageShell}>
        <RunningHeader left={headerLeft} right={headerRight} />
        <ConstellationPattern seed={13} opacity={0.05} color={C.reef} />

        <Text style={s.sectionLabel}>Year {yearNumber} — Innovation</Text>
        <Text style={s.h1}>Innovation Projects</Text>
        <WaveLine width={60} marginVertical={6} color={C.ochre} />
        <Text style={[s.lead, { marginBottom: 14 }]}>
          Community-led initiatives creating new pathways for Palm Island.
        </Text>

        {/* Overview stats */}
        <View wrap={false} style={{ flexDirection: 'row', justifyContent: 'space-between', marginBottom: 20 }}>
          <StatBox value={String(projects.length)} label="Total Projects" color={C.reef} variant="inline" width="31%" />
          <StatBox value={String(activeCount)} label="Active Projects" color={C.mangrove} variant="inline" width="31%" />
          <StatBox value={String(STAFF.socialEnterprisesStaff)} label="Enterprise Staff" color={C.ochre} variant="inline" width="31%" />
        </View>

        {/* Project cards — with images */}
        <View style={{ flexDirection: 'row', flexWrap: 'wrap', justifyContent: 'space-between' }}>
          {projects.map((project, i) => (
            <View key={project.id || i} wrap={false} style={ls.innovationCard}>
              {project.hero_image_url && (
                <Image
                  src={project.hero_image_url}
                  style={{
                    width: '100%',
                    height: 80,
                    objectFit: 'cover',
                  }}
                />
              )}
              <View style={ls.innovationBody}>
                <Text style={ls.innovationBadge}>{project.status}</Text>
                <Text style={ls.innovationTitle}>{project.title}</Text>
                <Text style={ls.innovationDesc}>
                  {project.impact_summary || project.description}
                </Text>
              </View>
            </View>
          ))}
        </View>

        <PageNumber />
      </Page>
    )
  }

  // ── 14. FinancialsPage ─────────────────────────────
  const FinancialsPage = () => {
    const maxAmount = Math.max(...fin.breakdown.map((b) => b.amount), 1)
    const priorYear = comp.prior_year_financials

    return (
      <Page size="A4" style={s.page}>
        <RunningHeader left={headerLeft} right={headerRight} />
        <CornerBrackets inset={30} opacity={0.08} corners={['tl', 'br']} />

        <Text style={s.sectionLabel}>Financial Summary</Text>
        <Text style={s.h1}>Income &amp; Expenditure</Text>
        <WaveLine width={60} marginVertical={6} color={C.ochre} />
        <Text style={[s.lead, { marginBottom: 20 }]}>
          Financial overview for the {yearRange} fiscal year.
        </Text>

        {/* Income / Expenditure / Net — three cards */}
        <View style={{ flexDirection: 'row', justifyContent: 'space-between', marginBottom: 24 }}>
          <View wrap={false} style={{ width: '31%', padding: 14, backgroundColor: C.white, borderRadius: 10, borderTop: `4pt solid ${C.mangrove}` }}>
            <Text style={{ fontFamily: 'PlayfairDisplay', fontSize: 26, fontWeight: 'bold', color: C.mangrove, lineHeight: 0.9 }}>{fmtCurrency(fin.total_income)}</Text>
            <Text style={{ fontSize: 9, color: C.driftwood, marginTop: 6 }}>Total Income</Text>
            {priorYear && (
              <Text style={{ fontSize: 7.5, color: C.muted, marginTop: 4 }}>
                Prior: {fmtCurrency(priorYear.total_income)}
              </Text>
            )}
          </View>
          <View wrap={false} style={{ width: '31%', padding: 14, backgroundColor: C.white, borderRadius: 10, borderTop: `4pt solid ${C.starGold}` }}>
            <Text style={{ fontFamily: 'PlayfairDisplay', fontSize: 26, fontWeight: 'bold', color: C.starGold, lineHeight: 0.9 }}>{fmtCurrency(fin.total_expenditure)}</Text>
            <Text style={{ fontSize: 9, color: C.driftwood, marginTop: 6 }}>Total Expenditure</Text>
            {priorYear && (
              <Text style={{ fontSize: 7.5, color: C.muted, marginTop: 4 }}>
                Prior: {fmtCurrency(priorYear.total_expenditure)}
              </Text>
            )}
          </View>
          <View wrap={false} style={{ width: '31%', padding: 14, backgroundColor: fin.net_result >= 0 ? C.white : C.shell, borderRadius: 10, borderTop: `4pt solid ${fin.net_result >= 0 ? C.mangrove : C.muted}` }}>
            <Text style={{ fontFamily: 'PlayfairDisplay', fontSize: 26, fontWeight: 'bold', color: fin.net_result >= 0 ? C.mangrove : C.driftwood, lineHeight: 0.9 }}>{fmtFullCurrency(fin.net_result)}</Text>
            <Text style={{ fontSize: 9, color: C.driftwood, marginTop: 6 }}>Net Result</Text>
            {priorYear && (
              <Text style={{ fontSize: 7.5, color: C.muted, marginTop: 4 }}>
                Prior: {fmtFullCurrency(priorYear.net_result)}
              </Text>
            )}
          </View>
        </View>

        {/* Gemini expenditure donut chart */}
        <View wrap={false} style={{ alignItems: 'center', marginBottom: 16 }}>
          <Image
            src={assetPath('expenditure-donut.jpg')}
            style={{ width: 160, height: 160, objectFit: 'contain' }}
          />
        </View>

        {/* Expenditure breakdown with visual bars */}
        <Text style={[s.h3, { marginBottom: 12 }]}>Expenditure Breakdown</Text>
        {fin.breakdown.map((item, i) => (
          <View key={i} wrap={false} style={{ marginBottom: 10 }}>
            <View style={ls.finRow}>
              <Text style={ls.finLabel}>{item.category}</Text>
              <Text style={ls.finValue}>{fmtFullCurrency(item.amount)} ({item.percentage}%)</Text>
            </View>
            <ReefGradientBar
              width={`${Math.round((item.amount / maxAmount) * 100)}%`}
              height={10}
              radius={5}
              color={STAT_COLORS[i % STAT_COLORS.length]}
            />
          </View>
        ))}

        <PageNumber />
      </Page>
    )
  }

  // ── 15. FinancialDetailPage (Revenue by Funder) ────
  const FinancialDetailPage = () => {
    const funders = comp.revenue_by_funder
    if (!funders || funders.length === 0) return null

    const maxFunderAmount = Math.max(...funders.map((f) => f.amount), 1)

    return (
      <Page size="A4" style={s.page}>
        <RunningHeader left={headerLeft} right={headerRight} />
        <CornerBrackets inset={30} opacity={0.08} corners={['tl', 'br']} />

        <Text style={s.sectionLabel}>Revenue Detail</Text>
        <Text style={s.h1}>Revenue by Funder</Text>
        <WaveLine width={60} marginVertical={6} color={C.ochre} />
        <Text style={[s.lead, { marginBottom: 20 }]}>
          Funding sources for the {yearRange} fiscal year.
        </Text>

        {funders.map((funder, i) => (
          <View key={i} wrap={false} style={{ marginBottom: 12 }}>
            <View style={ls.finRow}>
              <Text style={ls.finLabel}>{funder.funder}</Text>
              <Text style={ls.finValue}>{fmtFullCurrency(funder.amount)} ({funder.percentage}%)</Text>
            </View>
            <ReefGradientBar
              width={`${Math.round((funder.amount / maxFunderAmount) * 100)}%`}
              height={14}
              radius={7}
              color={STAT_COLORS[i % STAT_COLORS.length]}
            />
          </View>
        ))}

        {/* Prior year comparison table */}
        {comp.prior_year_financials && (
          <View wrap={false} style={{ marginTop: 20, padding: 16, backgroundColor: C.shell, borderRadius: 10 }}>
            <Text style={[s.h4, { marginBottom: 10 }]}>Year-on-Year Comparison</Text>
            <View style={{ flexDirection: 'row', justifyContent: 'space-between', marginBottom: 6 }}>
              <Text style={{ fontSize: 9, color: C.muted, width: '40%' }}></Text>
              <Text style={{ fontSize: 8, fontWeight: 'bold', color: C.muted, width: '28%', textAlign: 'right' }}>Prior Year</Text>
              <Text style={{ fontSize: 8, fontWeight: 'bold', color: C.ocean, width: '28%', textAlign: 'right' }}>{yearRange}</Text>
            </View>
            {[
              { label: 'Total Income', prior: comp.prior_year_financials.total_income, current: fin.total_income },
              { label: 'Total Expenditure', prior: comp.prior_year_financials.total_expenditure, current: fin.total_expenditure },
              { label: 'Net Result', prior: comp.prior_year_financials.net_result, current: fin.net_result },
            ].map((row, i) => (
              <View key={i} style={{ flexDirection: 'row', justifyContent: 'space-between', paddingVertical: 5, borderBottom: `0.5pt solid ${C.border}` }}>
                <Text style={{ fontSize: 9, color: C.driftwood, width: '40%' }}>{row.label}</Text>
                <Text style={{ fontSize: 9, color: C.muted, width: '28%', textAlign: 'right' }}>{fmtFullCurrency(row.prior)}</Text>
                <Text style={{ fontSize: 9, fontWeight: 'bold', color: C.ocean, width: '28%', textAlign: 'right' }}>{fmtFullCurrency(row.current)}</Text>
              </View>
            ))}
          </View>
        )}

        <PageNumber />
      </Page>
    )
  }

  // ── 16. JourneyTimelinePage ────────────────────────
  const JourneyTimelinePage = () => {
    if (eras.length === 0) return null

    return (
      <Page size="A4" style={s.pageSand}>
        <RunningHeader left={headerLeft} right={headerRight} />
        <ConstellationPattern seed={16} opacity={0.04} color={C.starGold} />

        <Text style={s.sectionLabel}>Our Journey</Text>
        <Text style={s.h1}>Year {yearNumber} of 20</Text>
        <WaveLine width={60} marginVertical={6} color={C.starGold} />
        <Text style={[s.lead, { marginBottom: 10 }]}>
          From foundation to community control — Palm Island&apos;s journey of self-determination.
        </Text>

        {/* Journey photo — real aerial photo or AI fallback */}
        <Image
          src={pp.journey?.hero || assetPath('journey-timeline-art.jpg')}
          style={{ width: '100%', height: 160, objectFit: 'cover', borderRadius: 10, marginBottom: 14 }}
        />

        {/* Year progress indicator */}
        <View wrap={false} style={{ marginBottom: 20, padding: 14, backgroundColor: C.white, borderRadius: 10 }}>
          <View style={{ flexDirection: 'row', justifyContent: 'space-between', marginBottom: 6 }}>
            <Text style={{ fontSize: 8, color: C.muted }}>2009 — Founded</Text>
            <Text style={{ fontSize: 9, fontWeight: 'bold', color: C.ocean }}>Year {yearNumber}</Text>
            <Text style={{ fontSize: 8, color: C.muted }}>2029 — 20 Years</Text>
          </View>
          <View style={{ width: '100%', height: 10, backgroundColor: C.shell, borderRadius: 5 }}>
            <View style={{ width: `${Math.min((yearNumber / 20) * 100, 100)}%`, height: 10, backgroundColor: C.ocean, borderRadius: 5 }} />
          </View>
        </View>

        {/* Era blocks */}
        {eras.map((era, i) => (
          <View key={i} wrap={false} style={ls.eraBlock}>
            <View style={[ls.eraIndicator, { backgroundColor: ERA_COLORS[i % ERA_COLORS.length] }]} />
            <View style={{ flex: 1 }}>
              <Text style={ls.eraName}>{era.name}</Text>
              <Text style={ls.eraYears}>
                {era.year_start}–{era.year_end || 'Present'}
              </Text>
              <Text style={ls.eraDesc}>{era.description}</Text>
              {era.milestones.slice(0, 3).map((milestone, j) => (
                <Text key={j} style={ls.milestone}>{milestone}</Text>
              ))}
            </View>
          </View>
        ))}

        <PageNumber />
      </Page>
    )
  }

  // ── 17. NextTwentyPage ─────────────────────────────
  const NextTwentyPage = () => {
    const goals = [
      { label: 'Total Staff', current: STAFF.total, target: 300, unit: 'people', color: C.ocean },
      { label: 'Integrated Services', current: SERVICES.total, target: SERVICES.target2029, unit: 'services', color: C.reef },
      { label: 'Annual Income', current: Math.round(FINANCIALS.totalIncome / 100_000) / 10, target: 40, unit: '$M', color: C.mangrove },
      { label: 'Social Enterprises', current: 3, target: 8, unit: 'enterprises', color: C.ochre },
    ]

    const visions = va.nextTwenty.voices.length > 0 ? va.nextTwenty.voices : allVoices.filter((v) => v.type === 'community_vision').slice(0, 2)

    return (
      <Page size="A4" style={s.page}>
        <RunningHeader left={headerLeft} right={headerRight} />
        <ConstellationPattern seed={17} opacity={0.05} color={C.ocean} />

        <Text style={s.sectionLabel}>Year {yearNumber} — Looking Forward</Text>
        <Text style={s.h1}>The Next 20 Years</Text>
        <WaveLine width={60} marginVertical={6} color={C.ochre} />

        {/* Gemini vision illustration — sunrise, stepping stones, Palm Island silhouette */}
        <Image
          src={assetPath('next-20-vision.jpg')}
          style={{ width: '100%', height: 120, objectFit: 'cover', borderRadius: 10, marginBottom: 14 }}
        />

        <Text style={[s.lead, { marginBottom: 16 }]}>
          Our targets for PICC&apos;s 20-year milestone in 2029 — and what the community wants for the next 20.
        </Text>

        {goals.map((goal, i) => {
          const pct = Math.min(Math.round((goal.current / goal.target) * 100), 100)
          return (
            <View key={i} wrap={false} style={[ls.goalRow, { borderLeftColor: goal.color }]}>
              <View style={{ flex: 1 }}>
                <Text style={[ls.goalLabel, { color: goal.color }]}>{goal.label}</Text>
                <Text style={ls.goalSubtext}>
                  {goal.current} {goal.unit} → {goal.target} {goal.unit} by 2029
                </Text>
              </View>
              <View style={{ alignItems: 'flex-end' }}>
                <Text style={{ fontSize: 11, fontWeight: 'bold', color: goal.color, marginBottom: 4 }}>
                  {pct}%
                </Text>
                <View style={ls.progressBarOuter}>
                  <View
                    style={[
                      ls.progressBarInner,
                      { width: `${pct}%`, backgroundColor: goal.color },
                    ]}
                  />
                </View>
              </View>
            </View>
          )
        })}

        {/* Community visions */}
        {visions.length > 0 && (
          <View style={{ marginTop: 8 }}>
            <Text style={[s.h4, { marginBottom: 10, color: C.ocean }]}>What Our Community Wants</Text>
            {visions.map((vision, i) => (
              <View key={vision.id || i} wrap={false} style={{ marginBottom: 10 }}>
                <QuoteBlock
                  text={vision.text}
                  author={vision.author || 'Community Member'}
                  role={vision.role || undefined}
                  color={C.ocean}
                  variant={i === 0 ? 'editorial' : 'default'}
                />
              </View>
            ))}
          </View>
        )}

        {data.report.looking_forward && (
          <View wrap={false} style={{ marginTop: 8, padding: 16, backgroundColor: C.shell, borderRadius: 10, borderLeft: `4pt solid ${C.ocean}` }}>
            <Text style={[s.h4, { marginBottom: 6 }]}>From Our CEO</Text>
            <Text style={{ fontSize: 9, color: C.driftwood, lineHeight: 1.7 }}>
              {data.report.looking_forward}
            </Text>
          </View>
        )}

        <PageNumber />
      </Page>
    )
  }

  // ── 18. BackCoverPage ──────────────────────────────
  // Midnight background, ArcDots decoration, Caveat mission
  const BackCoverPage = () => (
    <Page size="A4" style={ls.backCover}>
      <ConstellationPattern color={C.starGold} opacity={0.1} count={24} seed={99} />

      {/* Decorative arcs */}
      <ArcDots
        x={60}
        y={80}
        radius={40}
        startAngle={0}
        endAngle={90}
        dotCount={8}
        color={C.starGold}
        opacity={0.15}
        dotSize={2}
        trails={2}
        trailGap={10}
      />
      <ArcDots
        x={A4_W - 60}
        y={A4_H - 80}
        radius={40}
        startAngle={180}
        endAngle={270}
        dotCount={8}
        color={C.starGold}
        opacity={0.15}
        dotSize={2}
        trails={2}
        trailGap={10}
      />

      {/* Gemini partners turtle — sea turtle with reef ecosystem */}
      <Image
        src={assetPath('partners-turtle.jpg')}
        style={{ width: 280, height: 100, objectFit: 'cover', borderRadius: 10, marginBottom: 20, opacity: 0.7 }}
      />

      <Image src="/logo/picc-logo-full.png" style={ls.backLogo} />

      <Text style={ls.backMission}>
        Empowering the Palm Island community through self-determination, culture, and service
        excellence.
      </Text>

      {/* Ochre accent line */}
      <View style={{ width: 48, height: 3, backgroundColor: C.ochre, borderRadius: 1.5, marginBottom: 24 }} />

      <Text style={ls.backContact}>
        Palm Island Community Company Ltd{'\n'}
        ABN 11 154 579 565{'\n'}
        {comp.icn_number ? `${comp.icn_number}\n` : ''}
        PO Box 86, Palm Island QLD 4816{'\n'}
        www.palmislandcc.com.au
      </Text>

      <View style={{ position: 'absolute', bottom: 30, left: 0, right: 0 }}>
        <Text style={{ fontSize: 7, color: C.white, textAlign: 'center', opacity: 0.5 }}>
          Annual Report {yearRange} — Year {yearNumber}
        </Text>
      </View>
    </Page>
  )

  // ── Document Assembly ──────────────────────────────
  return (
    <Document
      title={`PICC Annual Report ${data.report.title}`}
      author="Palm Island Community Company"
      language="en-AU"
    >
      {shouldShow('cover', audience) && <CoverPage />}
      {shouldShow('acknowledgement', audience) && <AcknowledgementPage />}
      <ContentsPage />
      {shouldShow('messages', audience) && <MessagesPage />}
      {shouldShow('numbers', audience) && <YearInNumbersPage />}
      {shouldShow('photos', audience) && <PhotoSpreadPage />}
      {shouldShow('highlights', audience) && <HighlightsPage />}
      {shouldShow('communityVoices', audience) && <CommunityVoicesPage />}
      {shouldShow('youthVoices', audience) && <YouthVoicesPage />}
      {shouldShow('resilience', audience) && <ResiliencePage />}
      {shouldShow('floodStories', audience) && <FloodStoriesPage />}
      {shouldShow('governance', audience) && <GovernancePage />}
      {shouldShow('compliance', audience) && <CompliancePage />}
      {shouldShow('directorsReport', audience) && <DirectorsReportPage />}
      {shouldShow('services', audience) && <ServicesPage />}
      {shouldShow('innovation', audience) && <InnovationOverviewPage />}
      {shouldShow('financials', audience) && <FinancialsPage />}
      {shouldShow('financialDetail', audience) && <FinancialDetailPage />}
      {shouldShow('journey', audience) && <JourneyTimelinePage />}
      {shouldShow('nextTwenty', audience) && <NextTwentyPage />}
      <PartnersPage />
      {shouldShow('backCover', audience) && <BackCoverPage />}
    </Document>
  )
}
