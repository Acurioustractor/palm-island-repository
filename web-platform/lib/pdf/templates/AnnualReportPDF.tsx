/**
 * PICC Annual Report PDF Template — Saltwater Country Design System
 *
 * Modular React PDF document for generating the annual report.
 * Each page is an inline component consuming ReportData via closure.
 *
 * Pages: Cover, Acknowledgement, Messages, Year in Numbers, Photo Spread,
 *        Highlights, Community Voices, Youth Voices, Governance, Compliance,
 *        Directors Report, Services, Innovation (2-page spread),
 *        Financials (enhanced), Journey Timeline, Next Twenty / Looking Forward,
 *        Back Cover
 *
 * Supports audience-targeted generation via `audience` prop.
 */
import React from 'react'
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

import { C, A4_W, A4_H, MARGIN, CONTENT_W, baseStyles, fmtCurrency, fmtFullCurrency } from '../theme'
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
} from '../components'
import { registerFonts } from '../register-fonts'
import type { ReportData, CommunityVoice } from '@/lib/annual-report/fetch-report-data'
import { FINANCIALS, STAFF, SERVICES } from '@/lib/stats/current-stats'

const s = baseStyles

// ── Audience type for targeted reports ──────────────────
export type ReportAudience = 'community' | 'funder' | 'board' | 'supporter' | 'government' | null

// ── Local styles — Saltwater Country palette ────────────
const ls = StyleSheet.create({
  // Acknowledgement
  ackBorder: {
    borderTop: `2pt solid ${C.reefDeep}`,
    borderBottom: `2pt solid ${C.reefDeep}`,
    padding: 30,
    marginTop: 40,
  },
  ackTitle: {
    fontFamily: 'PlayfairDisplay',
    fontSize: 26,
    fontWeight: 'bold',
    color: C.reefDeep,
    marginBottom: 16,
    textAlign: 'center',
  },
  ackText: {
    fontSize: 10,
    color: C.driftwood,
    lineHeight: 1.8,
    textAlign: 'center',
  },

  // Messages
  messageBlock: {
    marginBottom: 24,
    padding: 20,
    borderRadius: 10,
    backgroundColor: C.shellWhite,
  },
  messageName: {
    fontSize: 12,
    fontWeight: 'bold',
    color: C.reefDeep,
    marginBottom: 2,
  },
  messageRole: {
    fontSize: 8.5,
    color: C.textMuted,
    marginBottom: 10,
  },
  messageBody: {
    fontSize: 9,
    color: C.driftwood,
    lineHeight: 1.65,
  },

  // Stats
  statsRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
  },

  // Highlights
  highlightRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
  },

  // Governance
  boardGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
  },
  boardCard: {
    width: '31%',
    backgroundColor: C.shellWhite,
    borderRadius: 8,
    padding: 12,
    marginBottom: 10,
    alignItems: 'center',
  },
  boardName: {
    fontSize: 9,
    fontWeight: 'bold',
    color: C.reefDeep,
    textAlign: 'center',
    marginTop: 6,
    marginBottom: 2,
  },
  boardPosition: {
    fontSize: 7.5,
    color: C.textMuted,
    textAlign: 'center',
  },

  // Services
  serviceCategoryTitle: {
    fontSize: 12,
    fontWeight: 'bold',
    color: C.reefDeep,
    marginTop: 14,
    marginBottom: 8,
    borderBottom: `1pt solid ${C.border}`,
    paddingBottom: 4,
  },
  serviceRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
  },

  // Photo spread
  photoGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
    gap: 8,
  },
  photoLarge: {
    width: '100%',
    height: 220,
    borderRadius: 8,
    objectFit: 'cover',
    marginBottom: 8,
  },
  photoSmall: {
    width: '48%',
    height: 160,
    borderRadius: 8,
    objectFit: 'cover',
  },
  photoCaption: {
    fontSize: 7.5,
    color: C.textMuted,
    marginTop: 4,
    textAlign: 'center',
  },

  // Innovation
  innovationCard: {
    width: '48%',
    backgroundColor: C.white,
    border: `1pt solid ${C.border}`,
    borderRadius: 10,
    padding: 14,
    marginBottom: 10,
    borderTop: `3pt solid ${C.lagoon}`,
  },
  innovationTitle: {
    fontSize: 11,
    fontWeight: 'bold',
    color: C.reefDeep,
    marginBottom: 4,
  },
  innovationDesc: {
    fontSize: 8.5,
    color: C.driftwood,
    lineHeight: 1.5,
  },
  innovationBadge: {
    fontSize: 7,
    color: C.lagoon,
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
    color: C.reefDeep,
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
    padding: 12,
    backgroundColor: C.white,
    border: `1pt solid ${C.border}`,
    borderRadius: 8,
  },
  goalLabel: {
    fontSize: 10,
    fontWeight: 'bold',
    color: C.reefDeep,
    marginBottom: 2,
  },
  goalSubtext: {
    fontSize: 8,
    color: C.textMuted,
  },
  progressBarOuter: {
    width: 160,
    height: 12,
    backgroundColor: C.bgLight,
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
    fontFamily: 'PlayfairDisplay',
    fontSize: 22,
    color: C.white,
    textAlign: 'center',
    marginBottom: 24,
    lineHeight: 1.4,
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
    borderBottom: `0.5pt solid ${C.borderLight}`,
  },
  complianceLabel: {
    fontSize: 9,
    color: C.textMuted,
    width: '40%',
  },
  complianceValue: {
    fontSize: 9,
    fontWeight: 'bold',
    color: C.reefDeep,
    width: '58%',
  },

  // Community Voices
  voiceCard: {
    width: '48%',
    backgroundColor: C.white,
    borderRadius: 10,
    padding: 14,
    marginBottom: 10,
  },
  voiceType: {
    fontSize: 7,
    fontWeight: 'bold',
    textTransform: 'uppercase',
    letterSpacing: 1,
    marginBottom: 6,
  },
  voiceText: {
    fontSize: 9,
    fontStyle: 'italic',
    color: C.rock,
    lineHeight: 1.6,
    marginBottom: 8,
  },
  voiceAuthor: {
    fontSize: 8,
    color: C.driftwood,
  },

  // Timeline
  eraBlock: {
    flexDirection: 'row',
    marginBottom: 16,
    padding: 12,
    backgroundColor: C.white,
    border: `1pt solid ${C.border}`,
    borderRadius: 8,
  },
  eraIndicator: {
    width: 4,
    borderRadius: 2,
    marginRight: 12,
  },
  eraName: {
    fontSize: 11,
    fontWeight: 'bold',
    color: C.reefDeep,
    marginBottom: 2,
  },
  eraYears: {
    fontSize: 8,
    color: C.textMuted,
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
const STAT_COLORS = [C.reefDeep, C.reefBright, C.mangrove, C.coral, C.lagoon, C.starGold]

// ── Era colors for timeline ───────────────────────────
const ERA_COLORS = [C.reefDeep, C.reefBright, C.mangrove, C.lagoon]

// ── Voice type colors ─────────────────────────────────
const VOICE_TYPE_COLORS: Record<string, string> = {
  elder_quote: C.starGold,
  story: C.reefDeep,
  community_vision: C.mangrove,
  feedback: C.lagoon,
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
  family: C.reefBright,
  justice: C.coral,
  community: C.reefDeep,
  economic: C.lagoon,
  digital: C.starGold,
}

function categoryColor(cat: string): string {
  const key = cat.toLowerCase()
  for (const [k, v] of Object.entries(CATEGORY_COLORS)) {
    if (key.includes(k)) return v
  }
  return C.reefDeep
}

// ── Audience page configuration ───────────────────────
interface AudienceConfig {
  coverSubtitle: string
  pages: string[]
  statEmphasis: 'people' | 'money' | 'balanced'
}

const AUDIENCE_CONFIGS: Record<string, AudienceConfig> = {
  community: {
    coverSubtitle: 'Year 17 — Saltwater Country, One People',
    pages: [
      'cover', 'acknowledgement', 'messages', 'numbers', 'photos',
      'highlights', 'communityVoices', 'youthVoices', 'resilience', 'floodStories',
      'services', 'innovation', 'journey', 'nextTwenty', 'backCover',
    ],
    statEmphasis: 'people',
  },
  funder: {
    coverSubtitle: `Annual Report`,
    pages: [
      'cover', 'acknowledgement', 'messages', 'numbers',
      'highlights', 'services', 'innovation', 'governance',
      'compliance', 'directorsReport', 'financials', 'financialDetail',
      'nextTwenty', 'backCover',
    ],
    statEmphasis: 'money',
  },
  supporter: {
    coverSubtitle: 'Year 17 — Our Impact & Innovation',
    pages: [
      'cover', 'acknowledgement', 'messages', 'numbers', 'photos',
      'highlights', 'communityVoices', 'resilience', 'floodStories',
      'innovation', 'journey', 'nextTwenty', 'backCover',
    ],
    statEmphasis: 'balanced',
  },
  board: {
    coverSubtitle: `Annual Report`,
    pages: [
      'cover', 'acknowledgement', 'messages', 'numbers',
      'highlights', 'governance', 'compliance', 'directorsReport',
      'services', 'innovation', 'financials', 'financialDetail',
      'communityVoices', 'journey', 'nextTwenty', 'backCover',
    ],
    statEmphasis: 'balanced',
  },
  government: {
    coverSubtitle: `Annual Report`,
    pages: [
      'cover', 'acknowledgement', 'messages', 'numbers',
      'highlights', 'services', 'governance', 'compliance',
      'directorsReport', 'financials', 'financialDetail',
      'innovation', 'nextTwenty', 'backCover',
    ],
    statEmphasis: 'money',
  },
}

const DEFAULT_PAGES = [
  'cover', 'acknowledgement', 'messages', 'numbers', 'photos',
  'highlights', 'communityVoices', 'youthVoices', 'resilience', 'floodStories',
  'governance', 'compliance', 'directorsReport', 'services', 'innovation',
  'financials', 'financialDetail', 'journey', 'nextTwenty', 'backCover',
]

function shouldShow(page: string, audience: ReportAudience): boolean {
  if (!audience) return DEFAULT_PAGES.includes(page)
  const config = AUDIENCE_CONFIGS[audience]
  return config ? config.pages.includes(page) : DEFAULT_PAGES.includes(page)
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

  // Community voices split
  const allVoices = data.communityVoices || []
  const elderVoices = allVoices.filter((v) => v.type === 'elder_quote')
  const youthVoices = allVoices.filter((v) => v.category === 'youth')
  const generalVoices = allVoices.filter((v) => v.type !== 'elder_quote' && v.category !== 'youth')

  // History eras
  const eras = data.historyEras || []

  // ── 1. CoverPage ───────────────────────────────────
  const CoverPage = () => (
    <PhotoCover
      photoUrl={data.coverPhoto?.url || null}
      title={coverSubtitle}
      subtitle="PALM ISLAND COMMUNITY COMPANY"
      year={yearRange}
    />
  )

  // ── 2. AcknowledgementPage ─────────────────────────
  const AcknowledgementPage = () => (
    <Page size="A4" style={s.page}>
      <RunningHeader left={headerLeft} right={headerRight} />
      <ConstellationPattern seed={1} opacity={0.04} />

      <WaveLine width={60} marginVertical={12} align="center" />
      <View style={ls.ackBorder}>
        <Text style={ls.ackTitle}>Acknowledgement of Country</Text>
        <Text style={ls.ackText}>
          {data.report.acknowledgments ||
            'Palm Island Community Company acknowledges the Traditional Owners of the land on which we work and live, and recognises their continuing connection to land, water and community. We pay our respects to Elders past, present and emerging.'}
        </Text>
      </View>
      <WaveLine width={60} marginVertical={12} align="center" />

      <PageNumber />
    </Page>
  )

  // ── 3. MessagesPage ────────────────────────────────
  const MessagesPage = () => {
    const messages = [...data.leadershipMessages].sort(
      (a, b) => a.display_order - b.display_order
    )

    return (
      <Page size="A4" style={s.page}>
        <RunningHeader left={headerLeft} right={headerRight} />
        <CornerBrackets inset={40} opacity={0.15} corners={['tl', 'br']} />

        <Text style={s.sectionLabel}>Leadership Messages</Text>
        <WaveLine width={80} marginVertical={8} />
        <Text style={s.h1}>From Our Leaders</Text>

        {messages.map((msg, i) => {
          const bgColor = i % 2 === 0 ? C.shellWhite : C.sand
          const accentColor = i % 2 === 0 ? C.reefDeep : C.reefBright
          return (
            <View
              key={msg.id || i}
              wrap={false}
              style={[ls.messageBlock, { backgroundColor: bgColor }]}
            >
              <View style={{ flexDirection: 'row', alignItems: 'center', marginBottom: 10 }}>
                <PersonAvatar
                  photoUrl={msg.photo_url}
                  name={msg.person_name}
                  size={48}
                  color={accentColor}
                />
                <View style={{ marginLeft: 12 }}>
                  <Text style={ls.messageName}>{msg.person_name}</Text>
                  <Text style={ls.messageRole}>{msg.person_title}</Text>
                </View>
              </View>

              {msg.message_title && (
                <Text style={[s.h4, { marginBottom: 6 }]}>{msg.message_title}</Text>
              )}

              <Text style={ls.messageBody}>
                {msg.message_excerpt || msg.message_content}
              </Text>

              {msg.featured_quote && (
                <View style={{ marginTop: 10 }}>
                  <QuoteBlock
                    text={msg.featured_quote}
                    author={msg.person_name}
                    role={msg.person_title}
                    color={accentColor}
                  />
                </View>
              )}
            </View>
          )
        })}

        <PageNumber />
      </Page>
    )
  }

  // ── 4. YearInNumbersPage ───────────────────────────
  const YearInNumbersPage = () => (
    <Page size="A4" style={s.page}>
      <RunningHeader left={headerLeft} right={headerRight} />
      <ConstellationPattern seed={4} opacity={0.04} />

      <Text style={s.sectionLabel}>Impact</Text>
      <WaveLine width={60} marginVertical={8} />
      <Text style={s.h1}>Year {yearNumber} in Numbers</Text>
      <Text style={[s.lead, { marginBottom: 16 }]}>
        Key achievements and impact metrics for {yearRange}.
      </Text>

      {/* Hero stat — 197 Staff overlay */}
      <StatHero
        value="197"
        label="Passionate Staff Members"
        description="A diverse team dedicated to delivering excellence across Palm Island."
        variant="overlay"
        photo={data.galleryPhotos[0]?.url}
        valueSize={96}
        height={220}
      />

      {/* Stat grid */}
      <View style={{ flexDirection: 'row', flexWrap: 'wrap', justifyContent: 'space-between', marginTop: 12 }}>
        <View style={{ width: '48%', marginBottom: 10 }}>
          <StatHero value="$23.4M" label="Annual Revenue" variant="plain" valueSize={42} accentColor={C.reefBright} />
        </View>
        <View style={{ width: '48%', marginBottom: 10 }}>
          <StatHero value="82%" label="Indigenous Employment" variant="plain" valueSize={42} accentColor={C.mangrove} bgColor={C.sand} />
        </View>
        <View style={{ width: '48%', marginBottom: 10 }}>
          <StatHero value="20" label="Integrated Services" variant="plain" valueSize={42} accentColor={C.lagoon} />
        </View>
        <View style={{ width: '48%', marginBottom: 10 }}>
          <StatHero value="3,200+" label="Community Members Served" variant="plain" valueSize={36} accentColor={C.coral} bgColor={C.sand} />
        </View>
      </View>

      {/* Dynamic stats fallback — show any additional key stats from data */}
      {keyStats.length > 0 && (
        <View style={[ls.statsRow, { marginTop: 8 }]}>
          {keyStats.map((stat, i) => (
            <StatBox
              key={stat.id || i}
              value={stat.stat_unit ? `${stat.stat_value}${stat.stat_unit}` : stat.stat_value}
              label={stat.stat_label}
              color={STAT_COLORS[i % STAT_COLORS.length]}
            />
          ))}
        </View>
      )}

      <PageNumber />
    </Page>
  )

  // ── 5. PhotoSpreadPage ─────────────────────────────
  const PhotoSpreadPage = () => {
    const photos = data.galleryPhotos
    if (photos.length === 0) return null

    return (
      <Page size="A4" style={s.page}>
        <RunningHeader left={headerLeft} right={headerRight} />
        <CornerBrackets inset={40} opacity={0.12} corners={['tl', 'br']} />

        <Text style={s.sectionLabel}>Our Community</Text>
        <WaveLine width={90} marginVertical={8} />
        <Text style={s.h1}>Life on Palm Island</Text>
        <Text style={[s.lead, { marginBottom: 16 }]}>
          Moments from across our community and services.
        </Text>

        {/* First photo large */}
        {photos[0] && (
          <View wrap={false} style={{ marginBottom: 8 }}>
            <Image src={photos[0].url} style={ls.photoLarge} />
            {photos[0].caption && (
              <Text style={ls.photoCaption}>{photos[0].caption}</Text>
            )}
          </View>
        )}

        {/* Remaining photos in a 2-column grid */}
        <View style={ls.photoGrid}>
          {photos.slice(1, 5).map((photo, i) => (
            <View key={i} wrap={false} style={{ width: '48%', marginBottom: 8 }}>
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
  const HighlightsPage = () => (
    <Page size="A4" style={s.page}>
      <RunningHeader left={headerLeft} right={headerRight} />
      <CornerBrackets inset={40} opacity={0.12} corners={['tl', 'br']} />

      <Text style={s.sectionLabel}>Highlights</Text>
      <WaveLine width={90} marginVertical={8} />
      <Text style={s.h1}>Year {yearNumber} Highlights</Text>
      <Text style={[s.lead, { marginBottom: 16 }]}>
        The stories, achievements, and milestones that defined our year.
      </Text>

      <View style={ls.highlightRow}>
        {sortedHighlights.map((hl, i) => (
          <Card
            key={hl.id || i}
            title={hl.title}
            description={hl.description || hl.subtitle}
            badge={hl.impact_achieved || undefined}
            color={hl.is_featured ? C.reefBright : STAT_COLORS[i % STAT_COLORS.length]}
            width="48%"
          />
        ))}
      </View>

      <PageNumber />
    </Page>
  )

  // ── 7. CommunityVoicesPage ─────────────────────────
  const CommunityVoicesPage = () => {
    // Mix of elder quotes, stories, and visions (exclude youth-only for separate page)
    const voices = generalVoices.slice(0, 6)
    if (voices.length === 0) return null

    return (
      <Page size="A4" style={[s.page, { backgroundColor: C.sand }]}>
        <RunningHeader left={headerLeft} right={headerRight} />
        <ConstellationPattern seed={7} color={C.reefDeep} opacity={0.03} />

        <Text style={s.sectionLabel}>Community Voices</Text>
        <WaveLine width={100} marginVertical={8} />
        <Text style={s.h1}>What Our Community Says</Text>
        <Text style={[s.lead, { marginBottom: 16 }]}>
          Real voices from the people at the heart of everything we do.
        </Text>

        <View style={{ flexDirection: 'row', flexWrap: 'wrap', justifyContent: 'space-between' }}>
          {voices.map((voice, i) => {
            const color = VOICE_TYPE_COLORS[voice.type] || C.reefDeep
            const typeLabel = VOICE_TYPE_LABELS[voice.type] || 'Community'
            return (
              <View key={voice.id || i} wrap={false} style={[ls.voiceCard, { borderLeft: `3pt solid ${color}` }]}>
                <Text style={[ls.voiceType, { color }]}>{typeLabel}</Text>
                {voice.photo_url && (
                  <Image
                    src={voice.photo_url}
                    style={{ width: 36, height: 36, borderRadius: 18, objectFit: 'cover', marginBottom: 8 }}
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
  const YouthVoicesPage = () => {
    const voices = youthVoices.length > 0 ? youthVoices : allVoices.filter((v) => v.type === 'story').slice(0, 3)
    if (voices.length === 0) return null

    return (
      <Page size="A4" style={s.page}>
        <RunningHeader left={headerLeft} right={headerRight} />
        <ConstellationPattern seed={8} opacity={0.04} />

        <Text style={s.sectionLabel}>Youth Voices</Text>
        <WaveLine width={90} marginVertical={8} />
        <Text style={s.h1}>Our Young People Speak</Text>
        <Text style={[s.lead, { marginBottom: 16 }]}>
          32% of Palm Island is youth. Their voices shape our future.
        </Text>

        {voices.map((voice, i) => (
          <View key={voice.id || i} wrap={false} style={{ marginBottom: 16 }}>
            <QuoteBlock
              text={voice.text}
              author={voice.author || 'Young Person'}
              role={voice.role || 'Palm Island Youth'}
              color={STAT_COLORS[i % STAT_COLORS.length]}
            />
          </View>
        ))}

        {/* Youth stats callout — pull from report statistics or fallback to known values */}
        <View wrap={false} style={{ flexDirection: 'row', justifyContent: 'space-between', marginTop: 8 }}>
          <StatBox
            value={data.statistics.find(s => s.stat_label.toLowerCase().includes('youth population'))?.stat_value || '32%'}
            label="Youth Population"
            color={C.reefBright}
          />
          <StatBox
            value={data.statistics.find(s => s.stat_label.toLowerCase().includes('digital') && s.stat_label.toLowerCase().includes('youth'))?.stat_value || String(STAFF.digitalCentreStaff)}
            label="Youth at Digital Service Centre"
            color={C.reefDeep}
          />
          <StatBox
            value={data.statistics.find(s => s.stat_label.toLowerCase().includes('diversionary'))?.stat_value || '1,253'}
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
      <Page size="A4" style={s.page}>
        <RunningHeader left={headerLeft} right={headerRight} />
        <ConstellationPattern seed={9} opacity={0.04} />

        <Text style={s.sectionLabel}>Community Resilience</Text>
        <WaveLine width={100} marginVertical={8} />
        <Text style={s.h1}>13,000 Years of Flood Knowledge</Text>
        <Text style={[s.lead, { marginBottom: 16 }]}>
          {rs.subtitle}
        </Text>

        {/* Gubbal creation story */}
        <View wrap={false} style={{ marginBottom: 16 }}>
          <QuoteBlock
            text={rs.gubbal.text}
            author={rs.gubbal.attribution}
            color={C.starGold}
          />
          <Text style={{ fontSize: 7, color: C.textMuted, fontStyle: 'italic', marginTop: 4 }}>
            {rs.gubbal.culturalNote}
          </Text>
        </View>

        {/* Traditional wisdom */}
        <View wrap={false} style={{ padding: 14, backgroundColor: C.sand, borderRadius: 8, marginBottom: 16 }}>
          <Text style={[s.h4, { marginBottom: 8, color: C.reefDeep }]}>Manbarra Weather Wisdom</Text>
          {rs.traditionalWisdom.map((w, i) => (
            <Text key={i} style={{ fontSize: 8.5, color: C.driftwood, lineHeight: 1.6, paddingLeft: 8, marginBottom: 3 }}>
              {w}
            </Text>
          ))}
        </View>

        {/* Resilience timeline */}
        <Text style={[s.h4, { marginBottom: 8 }]}>A Timeline of Resilience</Text>
        {rs.timeline.map((t, i) => (
          <View key={i} wrap={false} style={{ flexDirection: 'row', marginBottom: 8 }}>
            <View style={{ width: 60 }}>
              <Text style={{ fontSize: 8, fontWeight: 'bold', color: ERA_COLORS[i % ERA_COLORS.length] }}>{t.year}</Text>
            </View>
            <View style={{ flex: 1, borderLeft: `2pt solid ${ERA_COLORS[i % ERA_COLORS.length]}`, paddingLeft: 10 }}>
              <Text style={{ fontSize: 9, fontWeight: 'bold', color: C.reefDeep, marginBottom: 1 }}>{t.event}</Text>
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

    // Get resilience-tagged voices
    const resilienceVoices = allVoices.filter((v) => v.category === 'resilience').slice(0, 4)
    if (resilienceVoices.length === 0) return null

    return (
      <Page size="A4" style={s.page}>
        <RunningHeader left={headerLeft} right={headerRight} />
        <ConstellationPattern seed={10} opacity={0.04} />

        <Text style={s.sectionLabel}>Flood Stories</Text>
        <WaveLine width={90} marginVertical={8} />
        <Text style={s.h1}>Many Tribes, One People</Text>
        <Text style={[s.lead, { marginBottom: 16 }]}>
          Community voices from Palm Island&apos;s ongoing relationship with water, weather, and resilience.
        </Text>

        {/* Community voices about floods/resilience */}
        {resilienceVoices.map((voice, i) => (
          <View key={voice.id || i} wrap={false} style={{ marginBottom: 14 }}>
            <QuoteBlock
              text={voice.text}
              author={voice.author || 'Community Voice'}
              role={voice.role || undefined}
              color={ERA_COLORS[i % ERA_COLORS.length]}
            />
          </View>
        ))}

        {/* The Magnificent Seven */}
        <View wrap={false} style={{ padding: 14, backgroundColor: C.bgLight, borderRadius: 8, marginTop: 4 }}>
          <Text style={[s.h4, { marginBottom: 8 }]}>The Magnificent Seven — 1957 Strike Leaders</Text>
          <Text style={{ fontSize: 8.5, color: C.driftwood, lineHeight: 1.5, marginBottom: 8 }}>
            The same organizing capacity shown in the 1957 strike now mobilises flood response across Palm Island.
          </Text>
          <View style={{ flexDirection: 'row', flexWrap: 'wrap', justifyContent: 'space-between' }}>
            {rs.magnificentSeven.map((person, i) => (
              <View key={i} style={{ width: '48%', flexDirection: 'row', alignItems: 'center', marginBottom: 6 }}>
                <PersonAvatar photoUrl={null} name={person.name} size={20} color={ERA_COLORS[i % ERA_COLORS.length]} />
                <View style={{ marginLeft: 6 }}>
                  <Text style={{ fontSize: 8, fontWeight: 'bold', color: C.reefDeep }}>{person.name}</Text>
                  <Text style={{ fontSize: 7, color: C.textMuted }}>{person.role}</Text>
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
        <WaveLine width={90} marginVertical={8} />
        <Text style={s.h1}>Board of Directors</Text>
        <Text style={[s.lead, { marginBottom: 16 }]}>
          Guiding the organisation with experience, vision and community commitment.
        </Text>

        <View style={ls.boardGrid}>
          {sortedBoard.map((member, i) => (
            <View key={member.id || i} wrap={false} style={ls.boardCard}>
              <PersonAvatar
                photoUrl={member.photo_url}
                name={member.full_name}
                size={40}
                color={C.reefDeep}
              />
              <Text style={ls.boardName}>{member.full_name}</Text>
              <Text style={ls.boardPosition}>{member.position}</Text>
            </View>
          ))}
        </View>

        {/* Governance statement */}
        {comp.board_meetings_held && (
          <View wrap={false} style={{ marginTop: 16, padding: 14, backgroundColor: C.sand, borderRadius: 8 }}>
            <Text style={[s.h4, { marginBottom: 4 }]}>Governance Statement</Text>
            <Text style={{ fontSize: 9, color: C.driftwood, lineHeight: 1.5 }}>
              The Board met {comp.board_meetings_held} times during {yearRange}. All directors are Aboriginal and/or Torres Strait Islander people. The Board maintains compliance with ORIC, ACNC, and ASIC regulatory requirements.
            </Text>
          </View>
        )}

        <PageNumber />
      </Page>
    )
  }

  // ── 10. CompliancePage ─────────────────────────────
  const CompliancePage = () => (
    <Page size="A4" style={s.page}>
      <RunningHeader left={headerLeft} right={headerRight} />
      <CornerBrackets inset={40} opacity={0.12} corners={['tl', 'br']} />

      <Text style={s.sectionLabel}>Regulatory Compliance</Text>
      <WaveLine width={100} marginVertical={8} />
      <Text style={s.h1}>Compliance &amp; Registration</Text>
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
      <View wrap={false} style={{ padding: 16, backgroundColor: C.bgLight, borderRadius: 8, marginBottom: 16 }}>
        <Text style={[s.h4, { marginBottom: 6 }]}>Auditor&apos;s Report</Text>
        <Text style={{ fontSize: 9, color: C.driftwood, lineHeight: 1.6 }}>
          {comp.auditor_firm
            ? `The financial statements for ${yearRange} have been audited by ${comp.auditor_firm}${comp.auditor_name ? ` (${comp.auditor_name})` : ''}. The auditor issued an ${comp.audit_opinion || 'unqualified'} opinion.`
            : `The financial statements for ${yearRange} have been independently audited in accordance with Australian Auditing Standards. A full copy of the auditor's report is available from the PICC office.`
          }
        </Text>
      </View>

      {/* CATSI Act compliance statement */}
      <View wrap={false} style={{ padding: 16, backgroundColor: C.sand, borderRadius: 8 }}>
        <Text style={[s.h4, { marginBottom: 6 }]}>CATSI Act Compliance</Text>
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
      <CornerBrackets inset={40} opacity={0.12} corners={['tl', 'br']} />

      <Text style={s.sectionLabel}>Directors&apos; Report</Text>
      <WaveLine width={100} marginVertical={8} />
      <Text style={s.h1}>Directors&apos; Declaration</Text>

      <View style={{ marginTop: 16, padding: 20, backgroundColor: C.bgLight, borderRadius: 8 }}>
        <Text style={{ fontSize: 10, color: C.driftwood, lineHeight: 1.8 }}>
          {comp.directors_declaration ||
            `The directors of Palm Island Community Company Ltd declare that:\n\n1. The financial statements and notes are in accordance with the Corporations (Aboriginal and Torres Strait Islander) Act 2006 and:\n   (a) comply with Australian Accounting Standards; and\n   (b) give a true and fair view of the financial position as at 30 June ${year} and of the performance for the year ended on that date.\n\n2. In the directors' opinion there are reasonable grounds to believe that the corporation will be able to pay its debts as and when they become due and payable.\n\nThis declaration is made in accordance with a resolution of the Board of Directors.`
          }
        </Text>
      </View>

      {/* Signatories */}
      <View style={{ marginTop: 30, flexDirection: 'row', justifyContent: 'space-between' }}>
        <View style={{ width: '45%' }}>
          <View style={{ borderTop: `1pt solid ${C.textMuted}`, paddingTop: 8, marginTop: 40 }}>
            <Text style={{ fontSize: 10, fontWeight: 'bold', color: C.reefDeep }}>
              {data.boardMembers.find((m) => m.position === 'Chair')?.full_name || 'Luella Bligh'}
            </Text>
            <Text style={{ fontSize: 8.5, color: C.textMuted }}>Chair</Text>
          </View>
        </View>
        <View style={{ width: '45%' }}>
          <View style={{ borderTop: `1pt solid ${C.textMuted}`, paddingTop: 8, marginTop: 40 }}>
            <Text style={{ fontSize: 10, fontWeight: 'bold', color: C.reefDeep }}>
              {data.leadershipMessages.find((m) => m.person_title?.toLowerCase().includes('ceo') || m.person_title?.toLowerCase().includes('chief executive'))?.person_name || 'Rachel Atkinson'}
            </Text>
            <Text style={{ fontSize: 8.5, color: C.textMuted }}>Chief Executive Officer</Text>
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
      <ConstellationPattern seed={12} opacity={0.04} />

      <Text style={s.sectionLabel}>Year {yearNumber} — Our Services</Text>
      <WaveLine width={90} marginVertical={8} />
      <Text style={s.h1}>Programs &amp; Services</Text>
      <Text style={[s.lead, { marginBottom: 12 }]}>
        Delivering essential services to the Palm Island community.
      </Text>

      {Object.entries(serviceGroups).map(([category, services]) => (
        <View key={category} wrap={false}>
          <Text style={[ls.serviceCategoryTitle, { color: categoryColor(category) }]}>
            {category}
          </Text>
          <View style={ls.serviceRow}>
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
      <Page size="A4" style={s.page}>
        <RunningHeader left={headerLeft} right={headerRight} />
        <ConstellationPattern seed={13} opacity={0.04} />

        <Text style={s.sectionLabel}>Year {yearNumber} — Innovation</Text>
        <WaveLine width={90} marginVertical={8} />
        <Text style={s.h1}>Innovation Projects</Text>
        <Text style={[s.lead, { marginBottom: 16 }]}>
          Community-led initiatives creating new pathways for Palm Island.
        </Text>

        {/* Overview stats */}
        <View wrap={false} style={{ flexDirection: 'row', justifyContent: 'space-between', marginBottom: 20 }}>
          <StatBox value={String(projects.length)} label="Total Projects" color={C.reefBright} />
          <StatBox value={String(activeCount)} label="Active Projects" color={C.mangrove} />
          <StatBox value={String(STAFF.socialEnterprisesStaff)} label="Enterprise Staff" color={C.lagoon} />
        </View>

        {/* Project cards */}
        <View style={{ flexDirection: 'row', flexWrap: 'wrap', justifyContent: 'space-between' }}>
          {projects.map((project, i) => (
            <View key={project.id || i} wrap={false} style={ls.innovationCard}>
              {project.hero_image_url && (
                <Image
                  src={project.hero_image_url}
                  style={{
                    width: '100%',
                    height: 80,
                    borderRadius: 6,
                    objectFit: 'cover',
                    marginBottom: 8,
                  }}
                />
              )}
              <Text style={ls.innovationBadge}>{project.status}</Text>
              <Text style={ls.innovationTitle}>{project.title}</Text>
              <Text style={ls.innovationDesc}>
                {project.impact_summary || project.description}
              </Text>
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
        <CornerBrackets inset={40} opacity={0.12} corners={['tl', 'br']} />

        <Text style={s.sectionLabel}>Financial Summary</Text>
        <WaveLine width={90} marginVertical={8} />
        <Text style={s.h1}>Income &amp; Expenditure</Text>
        <Text style={[s.lead, { marginBottom: 20 }]}>
          Financial overview for the {yearRange} fiscal year.
        </Text>

        {/* Income / Expenditure / Net summary */}
        <View style={{ flexDirection: 'row', justifyContent: 'space-between', marginBottom: 24 }}>
          <View wrap={false} style={{ width: '31%', padding: 14, backgroundColor: C.shellWhite, borderRadius: 8, borderTop: `3pt solid ${C.mangrove}` }}>
            <Text style={{ fontFamily: 'PlayfairDisplay', fontSize: 28, fontWeight: 'bold', color: C.mangrove }}>{fmtCurrency(fin.total_income)}</Text>
            <Text style={{ fontSize: 9, color: C.driftwood }}>Total Income</Text>
            {priorYear && (
              <Text style={{ fontSize: 7.5, color: C.textMuted, marginTop: 2 }}>
                Prior year: {fmtCurrency(priorYear.total_income)}
              </Text>
            )}
          </View>
          <View wrap={false} style={{ width: '31%', padding: 14, backgroundColor: C.shellWhite, borderRadius: 8, borderTop: `3pt solid ${C.starGold}` }}>
            <Text style={{ fontFamily: 'PlayfairDisplay', fontSize: 28, fontWeight: 'bold', color: C.starGold }}>{fmtCurrency(fin.total_expenditure)}</Text>
            <Text style={{ fontSize: 9, color: C.driftwood }}>Total Expenditure</Text>
            {priorYear && (
              <Text style={{ fontSize: 7.5, color: C.textMuted, marginTop: 2 }}>
                Prior year: {fmtCurrency(priorYear.total_expenditure)}
              </Text>
            )}
          </View>
          <View wrap={false} style={{ width: '31%', padding: 14, backgroundColor: fin.net_result >= 0 ? C.shellWhite : C.bgLight, borderRadius: 8, borderTop: `3pt solid ${fin.net_result >= 0 ? C.mangrove : C.textMuted}` }}>
            <Text style={{ fontFamily: 'PlayfairDisplay', fontSize: 28, fontWeight: 'bold', color: fin.net_result >= 0 ? C.mangrove : C.driftwood }}>{fmtFullCurrency(fin.net_result)}</Text>
            <Text style={{ fontSize: 9, color: C.driftwood }}>Net Result</Text>
            {priorYear && (
              <Text style={{ fontSize: 7.5, color: C.textMuted, marginTop: 2 }}>
                Prior year: {fmtFullCurrency(priorYear.net_result)}
              </Text>
            )}
          </View>
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
        <CornerBrackets inset={40} opacity={0.12} corners={['tl', 'br']} />

        <Text style={s.sectionLabel}>Revenue Detail</Text>
        <WaveLine width={90} marginVertical={8} />
        <Text style={s.h1}>Revenue by Funder</Text>
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
          <View wrap={false} style={{ marginTop: 20, padding: 16, backgroundColor: C.bgLight, borderRadius: 8 }}>
            <Text style={[s.h4, { marginBottom: 10 }]}>Year-on-Year Comparison</Text>
            <View style={{ flexDirection: 'row', justifyContent: 'space-between', marginBottom: 6 }}>
              <Text style={{ fontSize: 9, color: C.textMuted, width: '40%' }}></Text>
              <Text style={{ fontSize: 8, fontWeight: 'bold', color: C.textMuted, width: '28%', textAlign: 'right' }}>Prior Year</Text>
              <Text style={{ fontSize: 8, fontWeight: 'bold', color: C.reefDeep, width: '28%', textAlign: 'right' }}>{yearRange}</Text>
            </View>
            {[
              { label: 'Total Income', prior: comp.prior_year_financials.total_income, current: fin.total_income },
              { label: 'Total Expenditure', prior: comp.prior_year_financials.total_expenditure, current: fin.total_expenditure },
              { label: 'Net Result', prior: comp.prior_year_financials.net_result, current: fin.net_result },
            ].map((row, i) => (
              <View key={i} style={{ flexDirection: 'row', justifyContent: 'space-between', paddingVertical: 4, borderBottom: `0.5pt solid ${C.borderLight}` }}>
                <Text style={{ fontSize: 9, color: C.driftwood, width: '40%' }}>{row.label}</Text>
                <Text style={{ fontSize: 9, color: C.textMuted, width: '28%', textAlign: 'right' }}>{fmtFullCurrency(row.prior)}</Text>
                <Text style={{ fontSize: 9, fontWeight: 'bold', color: C.reefDeep, width: '28%', textAlign: 'right' }}>{fmtFullCurrency(row.current)}</Text>
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
      <Page size="A4" style={s.page}>
        <RunningHeader left={headerLeft} right={headerRight} />
        <ConstellationPattern seed={16} opacity={0.04} />

        <Text style={s.sectionLabel}>Our Journey</Text>
        <WaveLine width={90} marginVertical={8} />
        <Text style={s.h1}>Year {yearNumber} of 20</Text>
        <Text style={[s.lead, { marginBottom: 8 }]}>
          From foundation to community control — Palm Island&apos;s journey of self-determination.
        </Text>

        {/* Year progress indicator */}
        <View wrap={false} style={{ marginBottom: 20 }}>
          <View style={{ flexDirection: 'row', justifyContent: 'space-between', marginBottom: 4 }}>
            <Text style={{ fontSize: 8, color: C.textMuted }}>2009 — Founded</Text>
            <Text style={{ fontSize: 8, fontWeight: 'bold', color: C.reefDeep }}>Year {yearNumber}</Text>
            <Text style={{ fontSize: 8, color: C.textMuted }}>2029 — 20 Years</Text>
          </View>
          <View style={{ width: '100%', height: 8, backgroundColor: C.bgLight, borderRadius: 4 }}>
            <View style={{ width: `${Math.min((yearNumber / 20) * 100, 100)}%`, height: 8, backgroundColor: C.reefDeep, borderRadius: 4 }} />
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

  // ── 17. NextTwentyPage (replaces LookingForward) ──
  const NextTwentyPage = () => {
    const goals = [
      { label: 'Total Staff', current: STAFF.total, target: 300, unit: 'people', color: C.reefDeep },
      { label: 'Integrated Services', current: SERVICES.total, target: SERVICES.target2029, unit: 'services', color: C.reefBright },
      { label: 'Annual Income', current: Math.round(FINANCIALS.totalIncome / 100_000) / 10, target: 40, unit: '$M', color: C.mangrove },
      { label: 'Social Enterprises', current: 3, target: 8, unit: 'enterprises', color: C.lagoon },
    ]

    // Community visions for this section
    const visions = allVoices.filter((v) => v.type === 'community_vision').slice(0, 2)

    return (
      <Page size="A4" style={s.page}>
        <RunningHeader left={headerLeft} right={headerRight} />
        <ConstellationPattern seed={17} opacity={0.04} />

        <Text style={s.sectionLabel}>Year {yearNumber} — Looking Forward</Text>
        <WaveLine width={90} marginVertical={8} />
        <Text style={s.h1}>The Next 20 Years</Text>
        <Text style={[s.lead, { marginBottom: 20 }]}>
          Our targets for PICC&apos;s 20-year milestone in 2029 — and what the community wants for the next 20.
        </Text>

        {goals.map((goal, i) => {
          const pct = Math.min(Math.round((goal.current / goal.target) * 100), 100)
          return (
            <View key={i} wrap={false} style={ls.goalRow}>
              <View style={{ flex: 1 }}>
                <Text style={ls.goalLabel}>{goal.label}</Text>
                <Text style={ls.goalSubtext}>
                  {goal.current} {goal.unit} → {goal.target} {goal.unit} by 2029
                </Text>
              </View>
              <View style={{ alignItems: 'flex-end' }}>
                <Text style={{ fontSize: 10, fontWeight: 'bold', color: goal.color, marginBottom: 4 }}>
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

        {/* Community visions alongside targets */}
        {visions.length > 0 && (
          <View style={{ marginTop: 8 }}>
            <Text style={[s.h4, { marginBottom: 8, color: C.reefDeep }]}>What Our Community Wants</Text>
            {visions.map((vision, i) => (
              <View key={vision.id || i} wrap={false} style={{ marginBottom: 8 }}>
                <QuoteBlock
                  text={vision.text}
                  author={vision.author || 'Community Member'}
                  role={vision.role || undefined}
                  color={C.reefDeep}
                />
              </View>
            ))}
          </View>
        )}

        {data.report.looking_forward && (
          <View wrap={false} style={{ marginTop: 8, padding: 16, backgroundColor: C.shellWhite, borderRadius: 8 }}>
            <Text style={[s.h4, { marginBottom: 6 }]}>From Our CEO</Text>
            <Text style={{ fontSize: 9, color: C.driftwood, lineHeight: 1.65 }}>
              {data.report.looking_forward}
            </Text>
          </View>
        )}

        <PageNumber />
      </Page>
    )
  }

  // ── 18. BackCoverPage ──────────────────────────────
  const BackCoverPage = () => (
    <Page size="A4" style={ls.backCover}>
      <ConstellationPattern color={C.starGold} opacity={0.08} count={20} seed={99} />

      <Image src="/logo/picc-logo-full.png" style={ls.backLogo} />

      <Text style={ls.backMission}>
        Empowering the Palm Island community through self-determination, culture, and service
        excellence.
      </Text>

      <Svg width="60" height="3" style={{ marginBottom: 20 }}>
        <Rect x="0" y="0" width="60" height="3" rx="1.5" fill={C.white} opacity="0.4" />
      </Svg>

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
      {shouldShow('backCover', audience) && <BackCoverPage />}
    </Document>
  )
}
