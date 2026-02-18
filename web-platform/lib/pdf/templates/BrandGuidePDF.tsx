import React from 'react'
import { Document, Page, Text, View, Image } from '@react-pdf/renderer'
import { C, A4_W, A4_H, MARGIN, CONTENT_W, baseStyles } from '../theme'
import { GradientBar, PageNumber } from '../components'
import { registerFonts } from '../register-fonts'

registerFonts()

const colors: { name: string; hex: string; group: string }[] = [
  { name: 'Blue', hex: C.blue, group: 'Primary' },
  { name: 'Blue Dark', hex: C.blueDark, group: 'Primary' },
  { name: 'Blue Deep', hex: C.blueDeep, group: 'Primary' },
  { name: 'Purple', hex: C.purple, group: 'Accent' },
  { name: 'Purple Dark', hex: C.purpleDark, group: 'Accent' },
  { name: 'Green', hex: C.green, group: 'Status' },
  { name: 'Amber', hex: C.amber, group: 'Status' },
  { name: 'Orange', hex: C.orange, group: 'Status' },
  { name: 'Teal', hex: C.teal, group: 'Status' },
]

const serviceCategories = [
  { name: 'Health', hex: '#16a34a' },
  { name: 'Family', hex: '#2563eb' },
  { name: 'Justice', hex: '#9333ea' },
  { name: 'Crisis', hex: '#ea580c' },
  { name: 'Digital', hex: '#0f766e' },
  { name: 'Economic', hex: '#d97706' },
  { name: 'Children', hex: '#ec4899' },
  { name: 'Culture', hex: '#1e3a8a' },
]

const ColorSwatch = ({ hex, name }: { hex: string; name: string }) => (
  <View style={{ width: 52, marginRight: 8, marginBottom: 10 }}>
    <View style={{ width: 52, height: 52, backgroundColor: hex, borderRadius: 6 }} />
    <Text style={{ fontSize: 6.5, color: C.textSecondary, marginTop: 3 }}>{name}</Text>
    <Text style={{ fontSize: 5.5, color: C.textMuted, fontFamily: 'Inter' }}>{hex}</Text>
  </View>
)

export default function BrandGuidePDF() {
  return (
    <Document
      title="PICC Brand Guide"
      author="Palm Island Community Company"
    >
      {/* Cover Page */}
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
            src="logo/picc-logo-full.png"
            style={{ width: 140, height: 140, marginBottom: 30 }}
          />
          <Text
            style={{
              fontFamily: 'Caveat',
              fontSize: 44,
              fontWeight: 'bold',
              color: C.white,
              marginBottom: 12,
              textAlign: 'center',
            }}
          >
            Brand Guide
          </Text>
          <Text
            style={{
              fontSize: 12,
              color: C.textLight,
              textAlign: 'center',
              lineHeight: 1.6,
            }}
          >
            Palm Island Community Company
          </Text>
        </View>
      </Page>

      {/* Colors + Typography Page */}
      <Page size="A4" style={baseStyles.page}>
        <GradientBar width={CONTENT_W} />
        <Text style={baseStyles.h1}>Brand Colors</Text>
        <Text style={[baseStyles.body, { marginBottom: 16 }]}>
          Our color palette reflects the spirit of Palm Island — bold blues for ocean and sky,
          warm accents for community, and rich purples for culture and innovation.
        </Text>

        {/* Primary + Accent + Status */}
        <View style={{ flexDirection: 'row', flexWrap: 'wrap', marginBottom: 20 }}>
          {colors.map(c => (
            <ColorSwatch key={c.hex + c.name} hex={c.hex} name={c.name} />
          ))}
        </View>

        {/* Service Category Colors */}
        <Text style={baseStyles.h2}>Service Categories</Text>
        <View style={{ flexDirection: 'row', flexWrap: 'wrap', marginBottom: 20 }}>
          {serviceCategories.map(sc => (
            <View key={sc.name} style={{ flexDirection: 'row', alignItems: 'center', width: '50%', marginBottom: 8 }}>
              <View style={{ width: 20, height: 20, backgroundColor: sc.hex, borderRadius: 4, marginRight: 8 }} />
              <View>
                <Text style={{ fontSize: 9, fontWeight: 'bold', color: C.textPrimary }}>{sc.name}</Text>
                <Text style={{ fontSize: 7, color: C.textMuted }}>{sc.hex}</Text>
              </View>
            </View>
          ))}
        </View>

        {/* Typography */}
        <GradientBar width={CONTENT_W} />
        <Text style={baseStyles.h1}>Typography</Text>

        <View style={{ marginBottom: 16 }}>
          <Text style={{ fontFamily: 'Caveat', fontSize: 28, fontWeight: 'bold', color: C.blueDark, marginBottom: 4 }}>
            Caveat Bold — Display Font
          </Text>
          <Text style={[baseStyles.bodySmall, { marginBottom: 12 }]}>
            Used for headings (H1, H2), hero text, and stat values. Brings warmth and personality.
          </Text>
        </View>

        <View style={{ marginBottom: 16 }}>
          <Text style={{ fontSize: 16, fontWeight: 'bold', color: C.blueDark, marginBottom: 2 }}>
            Inter Bold — Heading Font
          </Text>
          <Text style={{ fontSize: 13, fontWeight: 'semibold', color: C.textSecondary, marginBottom: 2 }}>
            Inter SemiBold — Sub-headings
          </Text>
          <Text style={{ fontSize: 10, color: C.textSecondary, marginBottom: 4 }}>
            Inter Regular — Body copy, descriptions, and UI text
          </Text>
          <Text style={[baseStyles.bodySmall, { marginBottom: 8 }]}>
            Inter is the primary sans-serif typeface for all body content, UI, and data labels.
          </Text>
        </View>

        {/* Usage Rules */}
        <View style={{ backgroundColor: C.bgSection, borderRadius: 8, padding: 14 }}>
          <Text style={{ fontSize: 9, fontWeight: 'bold', color: C.blueDark, marginBottom: 6 }}>Usage Rules</Text>
          <Text style={{ fontSize: 8, color: C.textSecondary, lineHeight: 1.8 }}>
            {'\u2022'} Caveat for display only — never for body text or small sizes{'\n'}
            {'\u2022'} Inter for all body copy, captions, labels, and data{'\n'}
            {'\u2022'} Minimum body size: 9pt (PDF), 14px (web){'\n'}
            {'\u2022'} Section labels: uppercase, letter-spacing 2, purple color{'\n'}
            {'\u2022'} Maintain consistent hierarchy: H1 → H2 → H3 → Body
          </Text>
        </View>

        <PageNumber />
      </Page>
    </Document>
  )
}
