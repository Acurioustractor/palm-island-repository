import React from 'react'
import { Document, Page, Text, View, Image } from '@react-pdf/renderer'
import { C, A4_W, A4_H, MARGIN, CONTENT_W, baseStyles } from '../theme'
import { RunningHeader, PageNumber, GradientBar, StatBox, Card } from '../components'
import { registerFonts } from '../register-fonts'

// ── Types ────────────────────────────────────────────
export interface Service {
  id: string
  name: string
  description: string
  service_category: string
  staff_count: number | null
  clients_served_annual: number | null
}

export interface ServicesPDFProps {
  services: Service[]
}

// ── Category Colors ──────────────────────────────────
const categoryColors: Record<string, { label: string; color: string }> = {
  health: { label: 'Health & Healing', color: C.green },
  family: { label: 'Family & Children', color: C.blue },
  justice: { label: 'Justice & Diversionary', color: C.purple },
  crisis: { label: 'Crisis & Safety', color: C.orange },
  youth: { label: 'Youth', color: C.teal },
  disability: { label: 'Disability', color: C.amber },
  community: { label: 'Community', color: C.blueDark },
}

function getCategoryInfo(key: string) {
  return categoryColors[key] ?? { label: key, color: C.blue }
}

// ── Cover Page ───────────────────────────────────────
const CoverPage = ({ count }: { count: number }) => (
  <Page size="A4" style={baseStyles.pageBleed}>
    <View
      style={{
        width: A4_W,
        height: A4_H,
        backgroundColor: C.blue,
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
        Our Services
      </Text>
      <Text
        style={{
          fontSize: 14,
          color: C.white,
          textAlign: 'center',
          lineHeight: 1.6,
          opacity: 0.85,
        }}
      >
        {count} Services for Our Community
      </Text>
    </View>
  </Page>
)

// ── Stats Page ───────────────────────────────────────
const StatsPage = ({ services }: { services: Service[] }) => {
  const s = baseStyles
  const totalStaff = services.reduce((sum, svc) => sum + (svc.staff_count ?? 0), 0)
  const totalClients = services.reduce((sum, svc) => sum + (svc.clients_served_annual ?? 0), 0)
  const categories = new Set(services.map((svc) => svc.service_category))

  return (
    <Page size="A4" style={s.page}>
      <RunningHeader left="Palm Island Community Company" right="Our Services" />
      <PageNumber />

      <GradientBar width={80} />
      <Text style={s.sectionLabel}>At a Glance</Text>
      <Text style={s.h1}>Service Overview</Text>

      <View style={{ flexDirection: 'row', flexWrap: 'wrap', justifyContent: 'space-between', marginTop: 16 }}>
        <StatBox value={String(services.length)} label="Total Services" color={C.blue} />
        <StatBox value={String(totalStaff)} label="Total Staff" color={C.green} />
        <StatBox value={totalClients.toLocaleString()} label="Clients Served Annually" color={C.purple} />
        <StatBox value={String(categories.size)} label="Service Categories" color={C.orange} />
      </View>
    </Page>
  )
}

// ── Category Page ────────────────────────────────────
const CategoryPage = ({
  categoryKey,
  services,
}: {
  categoryKey: string
  services: Service[]
}) => {
  const s = baseStyles
  const info = getCategoryInfo(categoryKey)

  return (
    <Page size="A4" style={s.page}>
      <RunningHeader left="Palm Island Community Company" right="Our Services" />
      <PageNumber />

      <View style={{ flexDirection: 'row', alignItems: 'center', marginBottom: 12 }}>
        <View
          style={{
            width: 12,
            height: 12,
            borderRadius: 6,
            backgroundColor: info.color,
            marginRight: 8,
          }}
        />
        <Text style={s.h2}>{info.label}</Text>
      </View>

      <Text style={{ ...s.bodySmall, marginBottom: 16 }}>
        {services.length} {services.length === 1 ? 'service' : 'services'} in this category
      </Text>

      <View style={{ flexDirection: 'row', flexWrap: 'wrap', justifyContent: 'space-between' }}>
        {services.map((svc) => (
          <Card
            key={svc.id}
            title={svc.name}
            description={svc.description}
            badge={svc.staff_count ? `${svc.staff_count} staff` : undefined}
            color={info.color}
          />
        ))}
      </View>
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
export default function ServicesPDF({ services }: ServicesPDFProps) {
  registerFonts()
  const s = baseStyles

  // Group services by category
  const grouped = new Map<string, Service[]>()
  for (const svc of services) {
    const key = svc.service_category
    if (!grouped.has(key)) grouped.set(key, [])
    grouped.get(key)!.push(svc)
  }

  // Sort categories by the order they appear in categoryColors, then alphabetically
  const categoryOrder = Object.keys(categoryColors)
  const sortedCategories = Array.from(grouped.entries()).sort(([a], [b]) => {
    const idxA = categoryOrder.indexOf(a)
    const idxB = categoryOrder.indexOf(b)
    if (idxA !== -1 && idxB !== -1) return idxA - idxB
    if (idxA !== -1) return -1
    if (idxB !== -1) return 1
    return a.localeCompare(b)
  })

  return (
    <Document title="Our Services - Palm Island Community Company" author="PICC">
      <CoverPage count={services.length} />
      <StatsPage services={services} />

      {sortedCategories.map(([categoryKey, categoryServices]) => (
        <CategoryPage key={categoryKey} categoryKey={categoryKey} services={categoryServices} />
      ))}

      <BackCover />
    </Document>
  )
}
