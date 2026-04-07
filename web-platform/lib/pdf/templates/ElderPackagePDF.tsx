import React from 'react'
import { Document, Page, Text, View } from '@react-pdf/renderer'
import { C, MARGIN } from '../theme'

// ---------------------------------------------------------------------------
// Types
// ---------------------------------------------------------------------------

export type PackageType = 'grant' | 'cultural' | 'travel' | 'community_report'

interface QuoteItem {
  quote_text: string
  theme?: string | null
}

interface StoryItem {
  title: string
  excerpt: string
  created_at: string
}

interface MilestoneItem {
  label: string
  achieved: boolean
  date?: string | null
}

export interface ElderPackageData {
  packageType: PackageType
  elder: {
    name: string
    role?: string | null
    bio?: string | null
    traditionalCountry?: string | null
    languageGroup?: string | null
  }
  stories: StoryItem[]
  quotes: QuoteItem[]
  milestones: MilestoneItem[]
  generatedAt: string
}

// ---------------------------------------------------------------------------
// Titles & section lists per package type
// ---------------------------------------------------------------------------

const TITLES: Record<PackageType, string> = {
  grant: 'Grant Support Package',
  cultural: 'Cultural Sharing Package',
  travel: 'Travel Funding Proposal',
  community_report: 'Community Impact Report',
}

// ---------------------------------------------------------------------------
// Helpers
// ---------------------------------------------------------------------------

function SectionTitle({ children }: { children: string }) {
  return (
    <Text
      style={{
        fontSize: 14,
        fontWeight: 700,
        color: C.ocean,
        marginBottom: 8,
        marginTop: 16,
        borderBottom: `1px solid ${C.border}`,
        paddingBottom: 4,
      }}
    >
      {children}
    </Text>
  )
}

// ---------------------------------------------------------------------------
// Document
// ---------------------------------------------------------------------------

export default function ElderPackagePDF({ data }: { data: ElderPackageData }) {
  const { elder, stories, quotes, milestones, packageType, generatedAt } = data

  return (
    <Document>
      {/* Cover */}
      <Page size="A4" style={{ padding: MARGIN, fontFamily: 'Inter' }}>
        <View style={{ marginBottom: 40, paddingBottom: 20, borderBottom: `2px solid ${C.ocean}` }}>
          <Text style={{ fontSize: 10, color: C.ochre, fontWeight: 600, marginBottom: 4, textTransform: 'uppercase', letterSpacing: 1 }}>
            Palm Island Community Company
          </Text>
          <Text style={{ fontSize: 26, fontWeight: 700, color: C.ocean, marginBottom: 6 }}>
            {TITLES[packageType]}
          </Text>
          <Text style={{ fontSize: 16, color: C.driftwood }}>
            {elder.name}
          </Text>
          <Text style={{ fontSize: 10, color: C.muted, marginTop: 4 }}>
            Generated {new Date(generatedAt).toLocaleDateString('en-AU', { day: 'numeric', month: 'long', year: 'numeric' })}
          </Text>
        </View>

        {/* Elder Profile */}
        <SectionTitle>Elder Profile</SectionTitle>
        <View style={{ marginBottom: 12, padding: 12, backgroundColor: C.shell, borderRadius: 4 }}>
          <Text style={{ fontSize: 14, fontWeight: 700, color: C.rock, marginBottom: 4 }}>
            {elder.name}
          </Text>
          {elder.role && (
            <Text style={{ fontSize: 10, color: C.driftwood, marginBottom: 2 }}>
              Role: {elder.role}
            </Text>
          )}
          {elder.traditionalCountry && (
            <Text style={{ fontSize: 10, color: C.driftwood, marginBottom: 2 }}>
              Traditional Country: {elder.traditionalCountry}
            </Text>
          )}
          {elder.languageGroup && (
            <Text style={{ fontSize: 10, color: C.driftwood, marginBottom: 2 }}>
              Language Group: {elder.languageGroup}
            </Text>
          )}
          {elder.bio && (
            <Text style={{ fontSize: 10, color: C.rock, marginTop: 6, lineHeight: 1.5 }}>
              {elder.bio}
            </Text>
          )}
        </View>

        {/* Impact summary */}
        <View style={{ flexDirection: 'row', gap: 12, marginBottom: 16 }}>
          <View style={{ flex: 1, padding: 10, backgroundColor: C.ocean10, borderRadius: 4, alignItems: 'center' }}>
            <Text style={{ fontSize: 20, fontWeight: 700, color: C.ocean }}>{stories.length}</Text>
            <Text style={{ fontSize: 9, color: C.driftwood }}>Stories</Text>
          </View>
          <View style={{ flex: 1, padding: 10, backgroundColor: C.ochre10, borderRadius: 4, alignItems: 'center' }}>
            <Text style={{ fontSize: 20, fontWeight: 700, color: C.ochre }}>{quotes.length}</Text>
            <Text style={{ fontSize: 9, color: C.driftwood }}>Quotes</Text>
          </View>
          <View style={{ flex: 1, padding: 10, backgroundColor: C.ocean10, borderRadius: 4, alignItems: 'center' }}>
            <Text style={{ fontSize: 20, fontWeight: 700, color: C.ocean }}>
              {milestones.filter((m) => m.achieved).length}
            </Text>
            <Text style={{ fontSize: 9, color: C.driftwood }}>Milestones</Text>
          </View>
        </View>

        {/* Quotes */}
        {quotes.length > 0 && (
          <>
            <SectionTitle>Wisdom &amp; Quotes</SectionTitle>
            {quotes.slice(0, 8).map((q, i) => (
              <View key={i} style={{ marginBottom: 8, paddingLeft: 10, borderLeft: `2px solid ${C.ochre}` }}>
                <Text style={{ fontSize: 10, color: C.rock, fontStyle: 'italic', lineHeight: 1.5 }}>
                  &ldquo;{q.quote_text}&rdquo;
                </Text>
                {q.theme && (
                  <Text style={{ fontSize: 8, color: C.muted, marginTop: 2 }}>
                    Theme: {q.theme}
                  </Text>
                )}
              </View>
            ))}
          </>
        )}
      </Page>

      {/* Stories page */}
      {stories.length > 0 && (
        <Page size="A4" style={{ padding: MARGIN, fontFamily: 'Inter' }}>
          <SectionTitle>Story Contributions</SectionTitle>
          {stories.slice(0, 10).map((s, i) => (
            <View key={i} style={{ marginBottom: 12, paddingBottom: 8, borderBottom: `1px solid ${C.border}` }}>
              <Text style={{ fontSize: 12, fontWeight: 700, color: C.rock, marginBottom: 2 }}>
                {s.title || 'Untitled Story'}
              </Text>
              <Text style={{ fontSize: 8, color: C.muted, marginBottom: 4 }}>
                {new Date(s.created_at).toLocaleDateString('en-AU')}
              </Text>
              <Text style={{ fontSize: 10, color: C.driftwood, lineHeight: 1.5 }}>
                {s.excerpt}
              </Text>
            </View>
          ))}
        </Page>
      )}

      {/* Milestones page */}
      {milestones.length > 0 && (
        <Page size="A4" style={{ padding: MARGIN, fontFamily: 'Inter' }}>
          <SectionTitle>Milestones &amp; Achievements</SectionTitle>
          {milestones.map((m, i) => (
            <View
              key={i}
              style={{
                flexDirection: 'row',
                alignItems: 'center',
                gap: 8,
                marginBottom: 8,
                padding: 8,
                backgroundColor: m.achieved ? C.shell : C.white,
                borderRadius: 4,
                borderLeft: `3px solid ${m.achieved ? C.mangrove : C.border}`,
              }}
            >
              <Text style={{ fontSize: 10, color: m.achieved ? C.mangrove : C.muted }}>
                {m.achieved ? '●' : '○'}
              </Text>
              <View style={{ flex: 1 }}>
                <Text style={{ fontSize: 10, fontWeight: 600, color: C.rock }}>
                  {m.label}
                </Text>
                {m.date && (
                  <Text style={{ fontSize: 8, color: C.muted }}>
                    {new Date(m.date).toLocaleDateString('en-AU')}
                  </Text>
                )}
              </View>
            </View>
          ))}

          {/* Footer */}
          <View style={{ marginTop: 'auto', paddingTop: 20, borderTop: `1px solid ${C.border}` }}>
            <Text style={{ fontSize: 8, color: C.muted, textAlign: 'center' }}>
              Palm Island Community Company | Powered by Empathy Ledger
            </Text>
          </View>
        </Page>
      )}
    </Document>
  )
}
