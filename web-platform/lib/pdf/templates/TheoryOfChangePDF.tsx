/**
 * Theory of Change PDF -Mannifera 2026 Grant Attachment
 * Clean professional layout for grant submissions.
 */
import React from 'react'
import { Document, Page, Text, View, StyleSheet } from '@react-pdf/renderer'
import { A4_W, MARGIN, CONTENT_W, SP } from '../theme'
import { registerFonts } from '../register-fonts'

registerFonts()

// ── ACT Palette (neutral, professional) ──────────────
const P = {
  navy: '#1B2A4A',
  accent: '#C8963E',
  text: '#2D2D2D',
  body: '#444444',
  muted: '#888888',
  light: '#F5F4F2',
  border: '#D4D2CE',
  white: '#FFFFFF',
  green: '#2D6A4F',
  tableHead: '#1B2A4A',
  tableStripe: '#F8F7F5',
}

// ── Styles ───────────────────────────────────────────
const s = StyleSheet.create({
  page: {
    flexDirection: 'column',
    backgroundColor: P.white,
    fontFamily: 'Inter',
    fontSize: 9,
    color: P.text,
    paddingTop: 56,
    paddingBottom: 48,
    paddingHorizontal: MARGIN,
  },
  coverPage: {
    flexDirection: 'column',
    backgroundColor: P.navy,
    fontFamily: 'Inter',
    paddingHorizontal: MARGIN,
    justifyContent: 'center',
    alignItems: 'flex-start',
  },
  pageNum: {
    position: 'absolute',
    bottom: 20,
    right: MARGIN,
    fontSize: 7.5,
    color: P.muted,
  },
  runningHead: {
    position: 'absolute',
    top: 22,
    left: MARGIN,
    right: MARGIN,
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  runningHeadText: {
    fontSize: 6.5,
    fontWeight: 'semibold',
    textTransform: 'uppercase',
    letterSpacing: 2,
    color: P.muted,
  },

  // Section heading
  sectionLabel: {
    fontSize: 7,
    fontWeight: 'bold',
    textTransform: 'uppercase',
    letterSpacing: 3,
    color: P.accent,
    marginBottom: 6,
  },
  h1: {
    fontFamily: 'Caveat',
    fontSize: 32,
    fontWeight: 'bold',
    color: P.navy,
    marginBottom: 10,
    lineHeight: 1.15,
  },
  h2: {
    fontFamily: 'Caveat',
    fontSize: 20,
    fontWeight: 'bold',
    color: P.navy,
    marginBottom: 8,
    lineHeight: 1.2,
  },
  h3: {
    fontSize: 12,
    fontWeight: 'bold',
    color: P.navy,
    marginBottom: 5,
  },
  h4: {
    fontSize: 10,
    fontWeight: 'bold',
    color: P.navy,
    marginBottom: 4,
  },

  body: {
    fontSize: 9,
    color: P.body,
    lineHeight: 1.7,
    marginBottom: 8,
  },
  lead: {
    fontSize: 10.5,
    color: P.body,
    lineHeight: 1.7,
    marginBottom: 12,
  },
  bold: {
    fontWeight: 'bold',
    color: P.text,
  },

  // Bullet list
  bulletRow: {
    flexDirection: 'row',
    marginBottom: 4,
    paddingLeft: 4,
  },
  bulletDot: {
    width: 12,
    fontSize: 9,
    color: P.accent,
  },
  bulletText: {
    flex: 1,
    fontSize: 9,
    color: P.body,
    lineHeight: 1.6,
  },

  // Numbered list
  numRow: {
    flexDirection: 'row',
    marginBottom: 10,
    paddingLeft: 4,
  },
  numDot: {
    width: 18,
    fontSize: 9,
    fontWeight: 'bold',
    color: P.accent,
  },
  numText: {
    flex: 1,
    fontSize: 9,
    color: P.body,
    lineHeight: 1.6,
  },

  // Callout box
  callout: {
    backgroundColor: P.light,
    borderLeftWidth: 3,
    borderLeftColor: P.accent,
    padding: 12,
    marginTop: 8,
    marginBottom: 12,
  },
  calloutText: {
    fontSize: 9.5,
    fontWeight: 'bold',
    color: P.navy,
    lineHeight: 1.5,
  },

  // Table
  tableContainer: {
    marginBottom: 12,
  },
  tableHeader: {
    flexDirection: 'row',
    backgroundColor: P.tableHead,
    paddingVertical: 6,
    paddingHorizontal: 8,
  },
  tableHeaderText: {
    fontSize: 7.5,
    fontWeight: 'bold',
    color: P.white,
    textTransform: 'uppercase',
    letterSpacing: 1,
  },
  tableRow: {
    flexDirection: 'row',
    paddingVertical: 5,
    paddingHorizontal: 8,
    borderBottomWidth: 0.5,
    borderBottomColor: P.border,
  },
  tableRowStripe: {
    flexDirection: 'row',
    paddingVertical: 5,
    paddingHorizontal: 8,
    backgroundColor: P.tableStripe,
    borderBottomWidth: 0.5,
    borderBottomColor: P.border,
  },
  tableCell: {
    fontSize: 8.5,
    color: P.body,
    lineHeight: 1.5,
  },
  tableCellBold: {
    fontSize: 8.5,
    fontWeight: 'bold',
    color: P.text,
    lineHeight: 1.5,
  },

  // Divider
  divider: {
    borderBottomWidth: 1,
    borderBottomColor: P.border,
    marginTop: 16,
    marginBottom: 20,
  },
  dividerAccent: {
    borderBottomWidth: 2,
    borderBottomColor: P.accent,
    marginTop: 16,
    marginBottom: 20,
    width: 60,
  },

  // Step card
  stepCard: {
    backgroundColor: P.light,
    padding: 12,
    marginBottom: 10,
    borderRadius: 2,
  },
  stepNumber: {
    fontSize: 8,
    fontWeight: 'bold',
    color: P.accent,
    textTransform: 'uppercase',
    letterSpacing: 2,
    marginBottom: 4,
  },

  // Platform box
  platformBox: {
    backgroundColor: P.navy,
    padding: 14,
    marginBottom: 6,
    borderRadius: 2,
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  platformItem: {
    width: '48%',
    marginBottom: 8,
  },
  platformName: {
    fontSize: 10,
    fontWeight: 'bold',
    color: P.white,
    marginBottom: 3,
  },
  platformDesc: {
    fontSize: 8,
    color: 'rgba(255,255,255,0.7)',
    lineHeight: 1.5,
  },

  // Bio
  bioBlock: {
    marginBottom: 8,
  },
  bioName: {
    fontSize: 9.5,
    fontWeight: 'bold',
    color: P.navy,
    marginBottom: 2,
  },
  bioRole: {
    fontSize: 8.5,
    color: P.body,
    lineHeight: 1.6,
  },

  // Pathway columns
  pathwayCols: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 12,
  },
  pathwayCol: {
    width: '31%',
    backgroundColor: P.light,
    padding: 10,
    borderRadius: 2,
  },
  pathwayLabel: {
    fontSize: 7,
    fontWeight: 'bold',
    color: P.accent,
    textTransform: 'uppercase',
    letterSpacing: 2,
    marginBottom: 6,
  },
  pathwayText: {
    fontSize: 8,
    color: P.body,
    lineHeight: 1.6,
  },

  // Design principles
  principleRow: {
    flexDirection: 'row',
    marginBottom: 6,
    paddingLeft: 4,
  },
  principleIcon: {
    width: 14,
    fontSize: 9,
    color: P.green,
  },
  principleText: {
    flex: 1,
    fontSize: 8.5,
    color: P.body,
    lineHeight: 1.6,
  },
})

// ── Helper components ────────────────────────────────
const RunHead = ({ fixed }: { fixed?: boolean }) => (
  <View style={s.runningHead} fixed={fixed}>
    <Text style={s.runningHeadText}>Theory of Change</Text>
    <Text style={s.runningHeadText}>Community Intelligence</Text>
  </View>
)

const Num = ({ n }: { n: number }) => (
  <Text render={({ pageNumber }) => `${pageNumber}`} style={s.pageNum} fixed />
)

const Bullet = ({ bold, text }: { bold?: string; text: string }) => (
  <View style={s.bulletRow}>
    <Text style={s.bulletDot}>{'\u2022'}</Text>
    <Text style={s.bulletText}>
      {bold && <Text style={s.bold}>{bold}</Text>}
      {text}
    </Text>
  </View>
)

const Divider = () => <View style={s.divider} />

const EvidenceTable = ({
  title,
  rows,
}: {
  title: string
  rows: { indicator: string; evidence: string }[]
}) => (
  <View style={s.tableContainer}>
    <Text style={s.h4}>{title}</Text>
    <View style={{ marginTop: 4 }}>
      <View style={s.tableHeader}>
        <Text style={[s.tableHeaderText, { width: '28%' }]}>Indicator</Text>
        <Text style={[s.tableHeaderText, { width: '72%' }]}>Evidence</Text>
      </View>
      {rows.map((r, i) => (
        <View
          key={i}
          style={i % 2 === 1 ? s.tableRowStripe : s.tableRow}
        >
          <Text style={[s.tableCellBold, { width: '28%' }]}>
            {r.indicator}
          </Text>
          <Text style={[s.tableCell, { width: '72%' }]}>{r.evidence}</Text>
        </View>
      ))}
    </View>
  </View>
)

// ── Main Document ────────────────────────────────────
export default function TheoryOfChangePDF() {
  return (
    <Document
      title="Theory of Change -Community Intelligence"
      author="ACT (Acknowledge, Connect, Transform)"
    >
      {/* ──────── COVER ──────── */}
      <Page size="A4" style={s.coverPage}>
        <View style={{ marginBottom: 40 }}>
          <Text
            style={{
              fontSize: 7,
              fontWeight: 'bold',
              textTransform: 'uppercase',
              letterSpacing: 4,
              color: P.accent,
              marginBottom: 20,
            }}
          >
            Theory of Change
          </Text>
          <Text
            style={{
              fontFamily: 'Caveat',
              fontSize: 38,
              fontWeight: 'bold',
              color: P.white,
              lineHeight: 1.2,
              marginBottom: 16,
            }}
          >
            Community Intelligence
          </Text>
          <Text
            style={{
              fontSize: 14,
              color: 'rgba(255,255,255,0.75)',
              lineHeight: 1.6,
              maxWidth: 380,
            }}
          >
            Sovereign Civic Infrastructure{'\n'}for Excluded Communities
          </Text>
        </View>
        <View
          style={{
            position: 'absolute',
            bottom: 50,
            left: MARGIN,
            right: MARGIN,
            flexDirection: 'row',
            justifyContent: 'space-between',
            alignItems: 'flex-end',
          }}
        >
          <Text style={{ fontSize: 8, color: 'rgba(255,255,255,0.5)' }}>
            ACT (Acknowledge, Connect, Transform)
          </Text>
          <Text style={{ fontSize: 8, color: 'rgba(255,255,255,0.5)' }}>
            2026
          </Text>
        </View>
        {/* Accent bar at bottom */}
        <View
          style={{
            position: 'absolute',
            bottom: 0,
            left: 0,
            right: 0,
            height: 4,
            backgroundColor: P.accent,
          }}
        />
      </Page>

      {/* ──────── THE PROBLEM ──────── */}
      <Page size="A4" style={s.page}>
        <RunHead fixed />
        <Text render={({ pageNumber }) => `${pageNumber}`} style={s.pageNum} fixed />

        <Text style={s.sectionLabel}>The Problem</Text>
        <Text style={s.h1}>Why This Matters</Text>
        <Text style={s.lead}>
          Communities most affected by government policy have the least capacity
          to participate in the democratic processes that shape that policy.
        </Text>

        <Text style={[s.h3, { marginTop: 4 }]}>
          Three structural exclusions lock communities out:
        </Text>

        <View style={s.numRow}>
          <Text style={s.numDot}>1.</Text>
          <Text style={s.numText}>
            <Text style={s.bold}>Data extraction without agency</Text> -
            Indigenous communities, youth in detention, and people in crisis are
            over-represented in government data systems but these systems serve
            institutions, not communities. Communities generate data but don't
            own it, can't control it, and can't use it to advocate.
          </Text>
        </View>
        <View style={s.numRow}>
          <Text style={s.numDot}>2.</Text>
          <Text style={s.numText}>
            <Text style={s.bold}>Invisible generational wealth</Text> -
            Cultural knowledge, language, Country connection, and community
            governance represent generational wealth that existing systems don't
            recognise. When this wealth is invisible, communities can't protect
            it or leverage it for democratic participation.
          </Text>
        </View>
        <View style={s.numRow}>
          <Text style={s.numDot}>3.</Text>
          <Text style={s.numText}>
            <Text style={s.bold}>Funding opacity</Text> -94% of philanthropic
            funding goes to 10% of organisations. First Nations communities
            receive 0.5%. Without visibility into who gets funded and why,
            excluded communities can't access the resources that should serve
            them.
          </Text>
        </View>

        <View style={s.callout}>
          <Text style={s.calloutText}>
            The result: Communities with the most at stake in democratic
            decisions have the least infrastructure to participate in them.
          </Text>
        </View>

        <Divider />

        {/* ──────── THE INSIGHT ──────── */}
        <Text style={s.sectionLabel}>The Insight</Text>
        <Text style={s.h2}>Civic Participation Is Infrastructure</Text>
        <Text style={s.body}>
          Civic participation isn't just voting. It's the capacity to:
        </Text>

        <Bullet bold="Generate and control evidence " text="about your own community" />
        <Bullet bold="Tell your story " text="on your terms, not through institutional filters" />
        <Bullet bold="See where money goes " text="and whether it works" />
        <Bullet bold="Protect generational wealth " text=" - cultural knowledge, language, Country" />
        <Bullet bold="Connect across geography and culture " text="to build collective power" />

        <View style={[s.callout, { marginTop: 12 }]}>
          <Text style={s.calloutText}>
            When communities have this infrastructure, they don't need to be
            taught about democracy. They practice it.
          </Text>
        </View>
      </Page>

      {/* ──────── THE INTERVENTION ──────── */}
      <Page size="A4" style={s.page}>
        <RunHead fixed />
        <Text render={({ pageNumber }) => `${pageNumber}`} style={s.pageNum} fixed />

        <Text style={s.sectionLabel}>The Intervention</Text>
        <Text style={s.h1}>Sovereign Civic Infrastructure</Text>
        <Text style={s.body}>
          Build community-controlled platforms that give excluded communities
          the tools for democratic participation:
        </Text>

        {/* Platform grid */}
        <View style={s.platformBox}>
          <View style={s.platformItem}>
            <Text style={s.platformName}>Empathy Ledger</Text>
            <Text style={s.platformDesc}>
              Consent-first storytelling{'\n'}Sovereign data{'\n'}Cultural protocols
            </Text>
          </View>
          <View style={s.platformItem}>
            <Text style={s.platformName}>JusticeHub</Text>
            <Text style={s.platformDesc}>
              Government spending transparency{'\n'}Evidence-based accountability
            </Text>
          </View>
        </View>
        <View style={s.platformBox}>
          <View style={s.platformItem}>
            <Text style={s.platformName}>GrantScope</Text>
            <Text style={s.platformDesc}>
              Funding transparency{'\n'}Access to resources{'\n'}Power flow visibility
            </Text>
          </View>
          <View style={s.platformItem}>
            <Text style={s.platformName}>Community Repos</Text>
            <Text style={s.platformDesc}>
              Voice capture (SMS, WhatsApp, voice){'\n'}Community ownership
            </Text>
          </View>
        </View>

        <View style={{ marginTop: 4, marginBottom: 8 }}>
          <View
            style={{
              backgroundColor: P.light,
              padding: 10,
              alignItems: 'center',
            }}
          >
            <Text style={{ fontSize: 8, fontWeight: 'bold', color: P.navy, textTransform: 'uppercase', letterSpacing: 2, marginBottom: 3 }}>
              Community Intelligence Layer
            </Text>
            <Text style={{ fontSize: 8.5, color: P.body }}>
              My data. My story. My advocacy. My future.
            </Text>
          </View>
        </View>

        <Text style={[s.h3, { marginTop: 10 }]}>Key Design Principles</Text>
        <View style={s.principleRow}>
          <Text style={s.principleIcon}>{'\u2713'}</Text>
          <Text style={s.principleText}>
            <Text style={s.bold}>Data sovereignty enforced in architecture</Text> (364 database security policies), not policy documents
          </Text>
        </View>
        <View style={s.principleRow}>
          <Text style={s.principleIcon}>{'\u2713'}</Text>
          <Text style={s.principleText}>
            <Text style={s.bold}>Communities own and operate independently</Text> -designed for ACT's obsolescence
          </Text>
        </View>
        <View style={s.principleRow}>
          <Text style={s.principleIcon}>{'\u2713'}</Text>
          <Text style={s.principleText}>
            <Text style={s.bold}>Cultural protocols embedded in code</Text> -Elder review, tiered access (public/community/family/sacred)
          </Text>
        </View>
        <View style={s.principleRow}>
          <Text style={s.principleIcon}>{'\u2713'}</Text>
          <Text style={s.principleText}>
            <Text style={s.bold}>Cross-cultural connection with sovereign separation</Text> -communities share infrastructure without sharing private data
          </Text>
        </View>

      </Page>

      {/* ──────── THE MECHANISM + EVIDENCE ──────── */}
      <Page size="A4" style={s.page}>
        <RunHead fixed />
        <Text render={({ pageNumber }) => `${pageNumber}`} style={s.pageNum} fixed />

        <Text style={s.sectionLabel}>The Mechanism</Text>
        <Text style={s.h1}>How Change Happens</Text>

        <View style={s.stepCard}>
          <Text style={s.stepNumber}>Step 1 - Sovereign Voice</Text>
          <Text style={s.body}>
            Communities capture their own stories, knowledge, and evidence through everyday
            channels (SMS, WhatsApp, on Country, conversations). Cultural authorities control
            what's shared and with whom. Generational wealth - language, cultural knowledge,
            Country connection - is documented and protected.
          </Text>
        </View>
        <View style={s.stepCard}>
          <Text style={s.stepNumber}>Step 2 - Evidence That Counts</Text>
          <Text style={s.body}>
            Community-controlled data becomes evidence institutions must respond to. Not
            compliance data extracted by government - sovereign evidence generated by
            communities about their own impact, needs, and solutions.
          </Text>
        </View>
        <View style={s.stepCard}>
          <Text style={s.stepNumber}>Step 3 - Accountability Infrastructure</Text>
          <Text style={s.body}>
            JusticeHub makes government spending transparent ($1.5B youth justice, detention
            costs 19x community programs). GrantScope reveals funding flows (94% to 10% of
            orgs, 0.5% to First Nations). Communities can see where money goes and advocate
            with evidence.
          </Text>
        </View>
        <View style={s.stepCard}>
          <Text style={s.stepNumber}>Step 4 - Cross-Cultural Civic Power</Text>
          <Text style={s.body}>
            Communities connect across geography - Palm Island (QLD) and Central Australian
            homelands (NT), 3,000km apart - through shared sovereign infrastructure. Cultural
            exchange, collective advocacy, shared learning. Each community's data stays
            sovereign; the connection amplifies voice.
          </Text>
        </View>
        <View style={s.stepCard}>
          <Text style={s.stepNumber}>Step 5 - Replication and Sector Change</Text>
          <Text style={s.body}>
            Open-source playbook and training materials mean any community can adopt the model.
            The proof of concept (Palm Island, 18 years; Oonchiumpa, active deployment)
            demonstrates viability. More communities adopting means sector standard and systemic change.
          </Text>
        </View>

      </Page>

      {/* ──────── THE EVIDENCE ──────── */}
      <Page size="A4" style={s.page}>
        <RunHead fixed />
        <Text render={({ pageNumber }) => `${pageNumber}`} style={s.pageNum} fixed />

        <Text style={s.sectionLabel}>The Evidence</Text>
        <Text style={s.h1}>Proven in Practice</Text>

        <EvidenceTable
          title="Palm Island Community Company -18 Years of Sovereign Democratic Agency"
          rows={[
            { indicator: 'Community control', evidence: '100% since 2021; 197 staff, 95% local Indigenous employment' },
            { indicator: 'Elder governance', evidence: 'Traditional Owner board representation; Elders group meeting since 2016' },
            { indicator: 'Sovereign data', evidence: 'Four-tier cultural access system designed by Elders' },
            { indicator: 'Economic agency', evidence: '$4.9M tourism masterplan developed and managed by community' },
            { indicator: 'Cultural preservation', evidence: 'Mission Beach heritage journey: 12 filmed Elder interviews, 148 documented quotes' },
            { indicator: 'Sector recognition', evidence: 'SNAICC national conference presentations' },
          ]}
        />

        <EvidenceTable
          title="Oonchiumpa -Aboriginal-Led Youth Civic Agency in Central Australia"
          rows={[
            { indicator: 'Aboriginal leadership', evidence: 'Led by Kristy Bloomfield (Traditional Owner) and Tanya Turner' },
            { indicator: 'Community reach', evidence: '7 language groups, 150km radius of homeland communities around Alice Springs' },
            { indicator: 'Youth outcomes', evidence: '21 active young people, 90% retention, 95% school re-engagement' },
            { indicator: 'On-Country healing', evidence: 'Cultural camps at Atnarpa homestead (Bloomfield family\'s reclaimed ancestral Country)' },
            { indicator: 'Cross-sector influence', evidence: 'True Justice program with ANU -law students doing deep listening on Country' },
            { indicator: 'Cultural governance', evidence: 'Aunty Bev and Uncle Terry provide Elder authority; cultural sensitivity protocols' },
          ]}
        />

        <EvidenceTable
          title="JusticeHub + National Justice Project - Transparent Accountability"
          rows={[
            { indicator: 'Scale', evidence: '1,000+ interventions catalogued nationally' },
            { indicator: 'Cost evidence', evidence: 'Detention: $3,320/day, 84.5% recidivism. Community: $150/day, 78% success' },
            { indicator: 'Democratic failure', evidence: '24x Indigenous overrepresentation in detention' },
            { indicator: 'Economic argument', evidence: 'Every diversion saves $570,000/year' },
            { indicator: 'NJP collaboration', evidence: 'Integrating Call It Out, Hear Me Out, CopWatch -community-reported incidents become systemic evidence' },
            { indicator: 'Civic advocacy', evidence: 'Communities report \u2192 data aggregates \u2192 patterns visible \u2192 systemic advocacy with evidence' },
          ]}
        />

        <EvidenceTable
          title="GrantScope -Funding Power Made Visible"
          rows={[
            { indicator: 'Scale', evidence: '14,000+ grants, 9,800+ foundations, 360,000 ACNC records' },
            { indicator: 'Inequality revealed', evidence: '94% of donations to 10% of orgs; First Nations receive 0.5%' },
            { indicator: 'Access created', evidence: 'Searchable, AI-enriched, open to all -no gatekeepers' },
          ]}
        />

      </Page>

      {/* ──────── SYSTEMIC CHANGE PATHWAY + WHY + BUDGET + TEAM ──────── */}
      <Page size="A4" style={s.page}>
        <RunHead fixed />
        <Text render={({ pageNumber }) => `${pageNumber}`} style={s.pageNum} fixed />

        <Text style={s.sectionLabel}>Systemic Change Pathway</Text>
        <Text style={s.h1}>From Proof to Sector Standard</Text>

        <View style={s.pathwayCols}>
          <View style={s.pathwayCol}>
            <Text style={s.pathwayLabel}>Year 1 (This Grant)</Text>
            <Text style={s.pathwayText}>
              Document model{'\n'}
              Strengthen Palm Island + Oonchiumpa connection{'\n'}
              Onboard 2-3 new communities{'\n'}
              Publish open-source playbook
            </Text>
          </View>
          <View style={s.pathwayCol}>
            <Text style={s.pathwayLabel}>Year 2-3</Text>
            <Text style={s.pathwayText}>
              5-10 communities adopt{'\n'}
              National advocacy coalition forms{'\n'}
              GrantScope national coverage complete{'\n'}
              Policy submissions using sovereign evidence
            </Text>
          </View>
          <View style={s.pathwayCol}>
            <Text style={s.pathwayLabel}>Year 4+</Text>
            <Text style={s.pathwayText}>
              Sector standard for community-controlled civic infrastructure{'\n'}
              Communities across Australia exercise democratic agency with their own infrastructure
            </Text>
          </View>
        </View>

        <View style={s.callout}>
          <Text style={s.calloutText}>
            Scaling economics: The technology costs ~$100/month per community to operate. The
            barrier to adoption isn't cost - it's documentation, training, and community
            trust-building. This grant funds exactly that bridge.
          </Text>
        </View>

        <View style={s.dividerAccent} />

        <Text style={s.sectionLabel}>Why This Is Civic Participation</Text>
        <Text style={s.h2}>Democracy Is a Practice</Text>
        <Text style={s.body}>
          Traditional civic engagement assumes people need to be educated about democracy. Our
          work starts from a different premise: excluded communities already understand power -
          they experience its absence every day. What they lack is infrastructure.
        </Text>
        <Text style={s.body}>
          When Palm Island Elders control a sovereign digital archive of cultural knowledge from
          52+ nations, that's civic participation -protecting generational wealth that
          government policy tried to destroy.
        </Text>
        <Text style={s.body}>
          When Oonchiumpa documents youth mentorship outcomes in Central Australian homelands,
          proving community programs outperform detention, that's civic knowledge -evidence
          that should shape policy.
        </Text>
        <Text style={s.body}>
          When JusticeHub shows $1.5B in annual spending with 84.5% failure rates, that's
          democratic accountability -information every citizen should have.
        </Text>
        <Text style={s.body}>
          When GrantScope reveals that First Nations communities receive 0.5% of philanthropic
          funding, that's civic transparency -making the invisible visible.
        </Text>

        <View style={[s.callout, { marginTop: 4 }]}>
          <Text style={s.calloutText}>
            Democracy isn't a lesson. It's a practice. Our tools enable that practice for
            communities who've been structurally excluded from it.
          </Text>
        </View>

      </Page>

      {/* ──────── BUDGET + TEAM ──────── */}
      <Page size="A4" style={s.page}>
        <RunHead fixed />
        <Text render={({ pageNumber }) => `${pageNumber}`} style={s.pageNum} fixed />

        <Text style={s.sectionLabel}>Budget Overview</Text>
        <Text style={s.h1}>$75,000</Text>

        <View style={s.tableContainer}>
          <View style={s.tableHeader}>
            <Text style={[s.tableHeaderText, { width: '40%' }]}>Phase</Text>
            <Text style={[s.tableHeaderText, { width: '15%' }]}>Amount</Text>
            <Text style={[s.tableHeaderText, { width: '45%' }]}>Focus</Text>
          </View>
          <View style={s.tableRow}>
            <Text style={[s.tableCellBold, { width: '40%' }]}>Documentation & Packaging (M1-3)</Text>
            <Text style={[s.tableCell, { width: '15%' }]}>$15,000</Text>
            <Text style={[s.tableCell, { width: '45%' }]}>Open-source playbook, case studies, training materials</Text>
          </View>
          <View style={s.tableRowStripe}>
            <Text style={[s.tableCellBold, { width: '40%' }]}>Platform Interoperability (M3-6)</Text>
            <Text style={[s.tableCell, { width: '15%' }]}>$25,000</Text>
            <Text style={[s.tableCell, { width: '45%' }]}>Cross-platform civic dashboard, data portability, GrantScope integration</Text>
          </View>
          <View style={s.tableRow}>
            <Text style={[s.tableCellBold, { width: '40%' }]}>Community Onboarding (M6-10)</Text>
            <Text style={[s.tableCell, { width: '15%' }]}>$25,000</Text>
            <Text style={[s.tableCell, { width: '45%' }]}>2-3 new communities, training, first advocacy cycles</Text>
          </View>
          <View style={s.tableRowStripe}>
            <Text style={[s.tableCellBold, { width: '40%' }]}>Evaluation & Sharing (M10-12)</Text>
            <Text style={[s.tableCell, { width: '15%' }]}>$10,000</Text>
            <Text style={[s.tableCell, { width: '45%' }]}>Impact evaluation, sector conferences, playbook publication</Text>
          </View>
        </View>

        <View style={s.dividerAccent} />

        {/* ──────── THE TEAM ──────── */}
        <Text style={s.sectionLabel}>The Team</Text>

        <View style={s.bioBlock}>
          <Text style={s.bioName}>Benjamin Knight</Text>
          <Text style={s.bioRole}>Systems designer, ACT co-founder. Built all four platforms. Background in community-controlled technology and data sovereignty architecture.</Text>
        </View>
        <View style={s.bioBlock}>
          <Text style={s.bioName}>Nicholas Marchesi OAM</Text>
          <Text style={s.bioRole}>ACT co-founder. 2016 Young Australian of the Year. Deep experience designing with and for marginalised communities and operational scaling.</Text>
        </View>
        <View style={s.bioBlock}>
          <Text style={s.bioName}>Rachel Atkinson, CEO PICC</Text>
          <Text style={s.bioRole}>Yorta Yorta, 25+ years leading Indigenous organisations, SNAICC Board Director, Co-Chair Family Matters Queensland.</Text>
        </View>
        <View style={s.bioBlock}>
          <Text style={s.bioName}>Allan Palm Island, PICC Director</Text>
          <Text style={s.bioRole}>Manbarra Traditional Owner, cultural authority for Palm Island.</Text>
        </View>
        <View style={s.bioBlock}>
          <Text style={s.bioName}>Kristy Bloomfield, Co-Director Oonchiumpa</Text>
          <Text style={s.bioRole}>Central Arrernte, Eastern Arrernte & Alyawarra Traditional Owner. Leads youth programs and cross-cultural work across Central Australian homelands.</Text>
        </View>
        <View style={s.bioBlock}>
          <Text style={s.bioName}>Tanya Turner, Co-Director Oonchiumpa</Text>
          <Text style={s.bioRole}>Aboriginal leader from Central Australia, community program design and delivery.</Text>
        </View>
        <View style={s.bioBlock}>
          <Text style={s.bioName}>National Justice Project (justice.org.au)</Text>
          <Text style={s.bioRole}>National legal advocacy organisation. Collaboration partner integrating NJP's community tools (Call It Out, Hear Me Out, CopWatch) with JusticeHub's evidence platform, enabling communities to turn individual incidents into systemic advocacy.</Text>
        </View>
      </Page>
    </Document>
  )
}
