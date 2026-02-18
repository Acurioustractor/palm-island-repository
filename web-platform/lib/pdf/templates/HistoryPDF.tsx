import React from 'react'
import { Document, Page, Text, View, Image } from '@react-pdf/renderer'
import { C, A4_W, A4_H, MARGIN, CONTENT_W, baseStyles, fmtCurrency } from '../theme'
import { RunningHeader, PageNumber, GradientBar, StatBox, QuoteBlock } from '../components'
import { registerFonts } from '../register-fonts'

// ── Types ────────────────────────────────────────────
export interface Era {
  id: string
  name: string
  subtitle: string
  years: string
  description: string
  color: string
  latestStats?: {
    staff: number | null
    services: number | null
    budget: number | null
  }
  quotes: Array<{ text: string; speaker_name: string; speaker_role?: string }>
  boardMembers: Array<{ name: string; role: string }>
}

export interface HistorySummary {
  totalYears: number
  latestStaff: number | null
  latestBudget: number | null
  latestServices: number | null
}

export interface HistoryPDFProps {
  eras: Era[]
  summary: HistorySummary
}

// ── Cover Page ───────────────────────────────────────
const CoverPage = ({ totalYears }: { totalYears: number }) => (
  <Page size="A4" style={baseStyles.pageBleed}>
    <View
      style={{
        width: A4_W,
        height: A4_H,
        backgroundColor: C.blueDark,
        justifyContent: 'center',
        alignItems: 'center',
        padding: MARGIN,
      }}
    >
      <Image
        src="/logo/picc-logo-full.png"
        style={{ width: 120, height: 120, marginBottom: 24 }}
      />
      <Text
        style={{
          fontFamily: 'Caveat',
          fontSize: 48,
          fontWeight: 'bold',
          color: C.white,
          marginBottom: 12,
          textAlign: 'center',
        }}
      >
        Our History
      </Text>
      <Text
        style={{
          fontSize: 14,
          color: C.textLight,
          textAlign: 'center',
          lineHeight: 1.6,
        }}
      >
        {totalYears} Years of Community
      </Text>
    </View>
  </Page>
)

// ── Overview Page ────────────────────────────────────
const OverviewPage = ({ summary }: { summary: HistorySummary }) => {
  const s = baseStyles

  return (
    <Page size="A4" style={s.page}>
      <RunningHeader left="Palm Island Community Company" right="Our History" />
      <PageNumber />

      <GradientBar width={80} />
      <Text style={s.sectionLabel}>Overview</Text>
      <Text style={s.h1}>Our Journey</Text>

      <Text style={{ ...s.lead, marginBottom: 24 }}>
        Palm Island Community Company has grown from humble beginnings into a
        cornerstone of community services, supporting families, elders, and young
        people across Palm Island for {summary.totalYears} years.
      </Text>

      <View style={{ flexDirection: 'row', flexWrap: 'wrap', justifyContent: 'space-between' }}>
        <StatBox
          value={`${summary.totalYears}`}
          label="Years Operating"
          color={C.blue}
        />
        <StatBox
          value={summary.latestStaff != null ? String(summary.latestStaff) : '--'}
          label="Latest Staff Count"
          color={C.green}
        />
        <StatBox
          value={summary.latestServices != null ? String(summary.latestServices) : '--'}
          label="Latest Services"
          color={C.purple}
        />
        <StatBox
          value={summary.latestBudget != null ? fmtCurrency(summary.latestBudget) : '--'}
          label="Latest Budget"
          color={C.orange}
        />
      </View>
    </Page>
  )
}

// ── Era Page ─────────────────────────────────────────
const EraPage = ({ era }: { era: Era }) => {
  const s = baseStyles
  const hasStats = era.latestStats && (
    era.latestStats.staff != null ||
    era.latestStats.services != null ||
    era.latestStats.budget != null
  )

  return (
    <Page size="A4" style={s.page}>
      <RunningHeader left="Palm Island Community Company" right="Our History" />
      <PageNumber />

      <View style={{ borderLeft: `3pt solid ${era.color}`, paddingLeft: 16, marginBottom: 16 }}>
        <Text style={{ ...s.h1, color: era.color }}>{era.name}</Text>
        <Text style={{ fontSize: 12, color: C.textSecondary, marginBottom: 4 }}>
          {era.years}
        </Text>
        {era.subtitle && (
          <Text style={{ fontSize: 10, fontStyle: 'italic', color: C.textMuted }}>
            {era.subtitle}
          </Text>
        )}
      </View>

      <Text style={{ ...s.body, marginBottom: 16 }}>{era.description}</Text>

      {hasStats && (
        <View wrap={false} style={{ flexDirection: 'row', flexWrap: 'wrap', justifyContent: 'space-between', marginBottom: 16 }}>
          {era.latestStats!.staff != null && (
            <StatBox value={String(era.latestStats!.staff)} label="Staff" color={era.color} />
          )}
          {era.latestStats!.budget != null && (
            <StatBox value={fmtCurrency(era.latestStats!.budget)} label="Budget" color={era.color} />
          )}
          {era.latestStats!.services != null && (
            <StatBox value={String(era.latestStats!.services)} label="Services" color={era.color} />
          )}
        </View>
      )}

      {era.quotes.length > 0 && (
        <QuoteBlock
          text={era.quotes[0].text}
          author={era.quotes[0].speaker_name}
          role={era.quotes[0].speaker_role}
          color={era.color}
        />
      )}

      {era.boardMembers.length > 0 && (
        <View wrap={false} style={{ marginTop: 8 }}>
          <Text style={{ ...s.h4, marginBottom: 8 }}>Board Members</Text>
          {era.boardMembers.map((member, i) => (
            <View key={i} style={{ flexDirection: 'row', marginBottom: 4 }}>
              <Text style={{ fontSize: 9, fontWeight: 'bold', color: C.textPrimary }}>
                {member.name}
              </Text>
              <Text style={{ fontSize: 9, color: C.textSecondary }}>
                {' '} - {member.role}
              </Text>
            </View>
          ))}
        </View>
      )}
    </Page>
  )
}

// ── Back Cover ───────────────────────────────────────
const BackCover = () => (
  <Page size="A4" style={baseStyles.pageBleed}>
    <View
      style={{
        width: A4_W,
        height: A4_H,
        backgroundColor: C.blueDark,
        justifyContent: 'center',
        alignItems: 'center',
        padding: MARGIN,
      }}
    >
      <Image
        src="/logo/picc-logo-full.png"
        style={{ width: 100, height: 100, marginBottom: 20 }}
      />
      <Text
        style={{
          fontFamily: 'Caveat',
          fontSize: 24,
          fontWeight: 'bold',
          color: C.white,
          marginBottom: 8,
          textAlign: 'center',
        }}
      >
        Palm Island Community Company
      </Text>
      <Text
        style={{
          fontSize: 10,
          color: C.textLight,
          textAlign: 'center',
          marginBottom: 4,
        }}
      >
        www.palmislandcc.com.au
      </Text>
    </View>
  </Page>
)

// ── Document ─────────────────────────────────────────
export default function HistoryPDF({ eras, summary }: HistoryPDFProps) {
  registerFonts()

  return (
    <Document title="Our History - Palm Island Community Company" author="PICC">
      <CoverPage totalYears={summary.totalYears} />
      <OverviewPage summary={summary} />

      {eras.map((era) => (
        <EraPage key={era.id} era={era} />
      ))}

      <BackCover />
    </Document>
  )
}
