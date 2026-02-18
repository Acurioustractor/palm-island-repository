import React from 'react'
import {
  Document,
  Page,
  Text,
  View,
  Image,
  Svg,
  Defs,
  LinearGradient,
  Stop,
  Rect,
} from '@react-pdf/renderer'
import { C, A4_W, A4_H, MARGIN, CONTENT_W, baseStyles } from '@/lib/pdf/theme'
import { PageNumber, GradientBar } from '@/lib/pdf/components'

const s = baseStyles

interface ProjectExportProps {
  project: {
    title: string
    description: string
    status: string
    hero_image_url?: string | null
    impact_summary?: string | null
    timeline?: string | null
    created_at: string
  }
  photos: Array<{ url: string; caption?: string }>
  goals: Array<{ label: string; contribution: string }>
}

export default function ProjectExportPDF({ project, photos, goals }: ProjectExportProps) {
  return (
    <Document
      title={`${project.title} — PICC Innovation Project`}
      author="Palm Island Community Company"
      language="en-AU"
    >
      {/* Cover page */}
      <Page size="A4" style={s.pageBleed}>
        {project.hero_image_url ? (
          <>
            <Image
              src={project.hero_image_url}
              style={{
                position: 'absolute',
                top: 0,
                left: 0,
                width: A4_W,
                height: A4_H,
                objectFit: 'cover',
              }}
            />
            <Svg
              width={String(A4_W)}
              height={String(A4_H)}
              style={{ position: 'absolute', top: 0, left: 0 }}
            >
              <Defs>
                <LinearGradient id="overlay" x1="0%" y1="0%" x2="0%" y2="100%">
                  <Stop offset="0%" stopColor="#000" stopOpacity={0.2} />
                  <Stop offset="60%" stopColor="#000" stopOpacity={0.4} />
                  <Stop offset="100%" stopColor="#000" stopOpacity={0.85} />
                </LinearGradient>
              </Defs>
              <Rect x="0" y="0" width={String(A4_W)} height={String(A4_H)} fill="url(#overlay)" />
            </Svg>
          </>
        ) : (
          <Svg
            width={String(A4_W)}
            height={String(A4_H)}
            style={{ position: 'absolute', top: 0, left: 0 }}
          >
            <Defs>
              <LinearGradient id="bg" x1="0%" y1="0%" x2="100%" y2="100%">
                <Stop offset="0%" stopColor={C.blueDark} />
                <Stop offset="100%" stopColor={C.purpleDark} />
              </LinearGradient>
            </Defs>
            <Rect x="0" y="0" width={String(A4_W)} height={String(A4_H)} fill="url(#bg)" />
          </Svg>
        )}

        {/* Logo */}
        <Image
          src="/logo/picc-logo-full.png"
          style={{ position: 'absolute', top: 50, left: MARGIN, width: 120, height: 60 }}
        />

        {/* Title block */}
        <View style={{ position: 'absolute', bottom: 120, left: MARGIN, right: MARGIN }}>
          <Text style={{ fontSize: 10, color: C.white, opacity: 0.8, letterSpacing: 2, textTransform: 'uppercase', marginBottom: 8 }}>
            PICC Innovation Project
          </Text>
          <Text style={{ fontFamily: 'Caveat', fontSize: 40, fontWeight: 'bold', color: C.white, lineHeight: 1.1, marginBottom: 12 }}>
            {project.title}
          </Text>
          <Text style={{ fontSize: 12, color: C.white, opacity: 0.85 }}>
            Palm Island Community Company
          </Text>
        </View>
        <PageNumber />
      </Page>

      {/* Content page */}
      <Page size="A4" style={s.page}>
        <Text style={s.sectionLabel}>Project Overview</Text>
        <GradientBar width={100} />
        <Text style={s.h1}>{project.title}</Text>

        <Text style={[s.body, { marginBottom: 20 }]}>
          {project.description}
        </Text>

        {project.impact_summary && (
          <View style={{ padding: 16, backgroundColor: C.blue50, borderRadius: 8, borderLeft: `3pt solid ${C.blue}`, marginBottom: 20 }}>
            <Text style={{ fontSize: 10, fontWeight: 'bold', color: C.blueDark, marginBottom: 4 }}>Impact</Text>
            <Text style={s.body}>{project.impact_summary}</Text>
          </View>
        )}

        {/* Photos grid */}
        {photos.length > 0 && (
          <View style={{ marginTop: 16 }}>
            <Text style={[s.h3, { marginBottom: 10 }]}>In Action</Text>
            <View style={{ flexDirection: 'row', flexWrap: 'wrap', justifyContent: 'space-between' }}>
              {photos.map((photo, i) => (
                <View key={i} style={{ width: '48%', marginBottom: 8 }}>
                  <Image
                    src={photo.url}
                    style={{ width: '100%', height: 120, borderRadius: 6, objectFit: 'cover' }}
                  />
                  {photo.caption && (
                    <Text style={{ fontSize: 7, color: C.textMuted, marginTop: 2 }}>{photo.caption}</Text>
                  )}
                </View>
              ))}
            </View>
          </View>
        )}

        {/* Goals alignment */}
        {goals.length > 0 && (
          <View style={{ marginTop: 20 }}>
            <Text style={[s.h3, { marginBottom: 10 }]}>Strategic Alignment</Text>
            {goals.map((goal, i) => (
              <View key={i} style={{ flexDirection: 'row', marginBottom: 8, padding: 10, backgroundColor: C.bgLight, borderRadius: 6 }}>
                <View style={{ width: 6, backgroundColor: C.purple, borderRadius: 3, marginRight: 10 }} />
                <View style={{ flex: 1 }}>
                  <Text style={{ fontSize: 9, fontWeight: 'bold', color: C.blueDark }}>{goal.label}</Text>
                  <Text style={{ fontSize: 8.5, color: C.textSecondary }}>{goal.contribution}</Text>
                </View>
              </View>
            ))}
          </View>
        )}

        {/* Footer with contact */}
        <View style={{ position: 'absolute', bottom: 30, left: MARGIN, right: MARGIN }}>
          <Svg width={String(CONTENT_W)} height="1">
            <Rect x="0" y="0" width={String(CONTENT_W)} height="1" fill={C.border} />
          </Svg>
          <Text style={{ fontSize: 7.5, color: C.textMuted, marginTop: 8, textAlign: 'center' }}>
            Palm Island Community Company Ltd | ABN 11 154 579 565 | www.palmislandcc.com.au
          </Text>
        </View>

        <PageNumber />
      </Page>
    </Document>
  )
}
