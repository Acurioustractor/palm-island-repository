import React from 'react'
import { Document, Page, Text, View, Image } from '@react-pdf/renderer'
import { C, A4_W, A4_H, MARGIN, CONTENT_W, baseStyles } from '../theme'
import { RunningHeader, PageNumber, GradientBar, QuoteBlock } from '../components'
import { registerFonts } from '../register-fonts'

// ── Types ────────────────────────────────────────────
export interface Story {
  id: string
  title: string
  body: string
  featured_image?: string
  storyteller_name?: string
  storyteller_role?: string
  quote?: string
  category?: string
  services?: string[]
}

export interface StoriesPDFProps {
  stories: Story[]
}

// ── Cover Page ───────────────────────────────────────
const CoverPage = ({ count }: { count: number }) => (
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
        Our Stories
      </Text>
      <Text
        style={{
          fontSize: 14,
          color: C.textLight,
          textAlign: 'center',
          lineHeight: 1.6,
          marginBottom: 8,
        }}
      >
        Community voices from Palm Island
      </Text>
      <Text
        style={{
          fontSize: 10,
          color: C.textMuted,
          textAlign: 'center',
        }}
      >
        {count} {count === 1 ? 'story' : 'stories'}
      </Text>
    </View>
  </Page>
)

// ── Story Page ───────────────────────────────────────
const StoryPage = ({ story }: { story: Story }) => {
  const s = baseStyles
  const bodyText = story.body.length > 800 ? story.body.slice(0, 800) + '...' : story.body

  return (
    <Page size="A4" style={s.page}>
      <RunningHeader left="Palm Island Community Company" right="Our Stories" />
      <PageNumber />

      {story.featured_image && (
        <Image
          src={story.featured_image}
          style={{
            width: CONTENT_W,
            height: 180,
            objectFit: 'cover',
            borderRadius: 8,
            marginBottom: 16,
          }}
        />
      )}

      <GradientBar width={80} />

      {story.category && (
        <Text style={s.sectionLabel}>{story.category}</Text>
      )}

      <Text style={s.h1}>{story.title}</Text>

      {story.storyteller_name && (
        <Text style={{ fontSize: 10, color: C.textSecondary, marginBottom: 16 }}>
          By {story.storyteller_name}
          {story.storyteller_role ? ` | ${story.storyteller_role}` : ''}
        </Text>
      )}

      {story.quote && (
        <QuoteBlock
          text={story.quote}
          author={story.storyteller_name}
          role={story.storyteller_role}
          color={C.blue}
        />
      )}

      <Text style={s.body}>{bodyText}</Text>

      {story.services && story.services.length > 0 && (
        <View style={{ flexDirection: 'row', flexWrap: 'wrap', marginTop: 16, gap: 6 }}>
          {story.services.map((service, i) => (
            <View
              key={i}
              style={{
                backgroundColor: C.blue50,
                borderRadius: 4,
                paddingVertical: 3,
                paddingHorizontal: 8,
              }}
            >
              <Text style={{ fontSize: 7.5, fontWeight: 'semibold', color: C.blue }}>
                {service}
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
        }}
      >
        www.palmislandcc.com.au
      </Text>
    </View>
  </Page>
)

// ── Document ─────────────────────────────────────────
export default function StoriesPDF({ stories }: StoriesPDFProps) {
  registerFonts()

  return (
    <Document title="Our Stories - Palm Island Community Company" author="PICC">
      <CoverPage count={stories.length} />

      {stories.map((story) => (
        <StoryPage key={story.id} story={story} />
      ))}

      <BackCover />
    </Document>
  )
}
