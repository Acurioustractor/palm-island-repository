import React from 'react'
import { Document, Page, Text, View, Image } from '@react-pdf/renderer'
import { C, A4_W, A4_H, MARGIN, CONTENT_W, baseStyles } from '../theme'
import { RunningHeader, PageNumber, GradientBar, StatBox, QuoteBlock, Card } from '../components'
import { PhotoCover } from '../components/PhotoCover'
import { registerFonts } from '../register-fonts'

registerFonts()

// ── Types ────────────────────────────────────────────
export interface FocusStory {
  id: string
  title: string
  body: string
  featured_image?: string | null
  storyteller_name?: string | null
  storyteller_role?: string | null
  quote?: string | null
}

export interface FocusNote {
  id: string
  content: string
  note_type?: string | null
  created_at: string
}

export interface FocusReportProps {
  focus: {
    type: 'service' | 'project' | 'theme'
    id: string
    name: string
  }
  year?: string
  coverPhoto?: string | null
  data: {
    description: string
    stats: { label: string; value: string }[]
    stories: FocusStory[]
    photos: string[]
    notes?: FocusNote[]
    milestones?: FocusNote[]
  }
}

// ── Stat colors by focus type ────────────────────────
const focusColor: Record<string, string> = {
  service: C.blue,
  project: C.purple,
  theme: C.teal,
}

// ── Overview Page ────────────────────────────────────
const OverviewPage = ({ focus, data }: { focus: FocusReportProps['focus']; data: FocusReportProps['data'] }) => {
  const color = focusColor[focus.type] || C.blue
  return (
    <Page size="A4" style={baseStyles.page}>
      <RunningHeader left="PICC" right={focus.name.toUpperCase()} />
      <GradientBar width={CONTENT_W} />
      <Text style={baseStyles.sectionLabel}>{focus.type === 'theme' ? 'Theme' : focus.type === 'project' ? 'Innovation Project' : 'Service'}</Text>
      <Text style={baseStyles.h1}>{focus.name}</Text>
      <Text style={[baseStyles.lead, { marginBottom: 24 }]}>{data.description}</Text>

      {data.stats.length > 0 && (
        <View style={{ flexDirection: 'row', flexWrap: 'wrap', justifyContent: 'space-between', marginBottom: 20 }}>
          {data.stats.map((s, i) => (
            <StatBox key={i} value={s.value} label={s.label} color={color} />
          ))}
        </View>
      )}

      <PageNumber />
    </Page>
  )
}

// ── Story Page ───────────────────────────────────────
const StoryPage = ({ story, focusName }: { story: FocusStory; focusName: string }) => (
  <Page size="A4" style={baseStyles.page}>
    <RunningHeader left="PICC" right={focusName.toUpperCase()} />

    {story.featured_image && (
      <Image
        src={story.featured_image}
        style={{
          width: CONTENT_W,
          height: 200,
          objectFit: 'cover',
          borderRadius: 8,
          marginBottom: 16,
        }}
      />
    )}

    <Text style={baseStyles.h2}>{story.title}</Text>

    {story.storyteller_name && (
      <Text style={[baseStyles.bodySmall, { color: C.textMuted, marginBottom: 12 }]}>
        By {story.storyteller_name}{story.storyteller_role ? ` — ${story.storyteller_role}` : ''}
      </Text>
    )}

    {story.quote && (
      <QuoteBlock text={story.quote} author={story.storyteller_name || undefined} />
    )}

    <Text style={[baseStyles.body, { marginBottom: 16 }]}>
      {story.body.length > 1200 ? story.body.slice(0, 1200) + '...' : story.body}
    </Text>

    <PageNumber />
  </Page>
)

// ── Photo Spread ─────────────────────────────────────
const PhotoSpread = ({ photos, focusName }: { photos: string[]; focusName: string }) => {
  const displayPhotos = photos.slice(0, 6)
  if (displayPhotos.length === 0) return null

  return (
    <Page size="A4" style={baseStyles.page}>
      <RunningHeader left="PICC" right={focusName.toUpperCase()} />
      <Text style={baseStyles.sectionLabel}>Gallery</Text>
      <Text style={[baseStyles.h2, { marginBottom: 16 }]}>Photo Highlights</Text>
      <View style={{ flexDirection: 'row', flexWrap: 'wrap', gap: 8 }}>
        {displayPhotos.map((url, i) => (
          <Image
            key={i}
            src={url}
            style={{
              width: i < 2 ? '48%' : '31%',
              height: i < 2 ? 180 : 120,
              objectFit: 'cover',
              borderRadius: 6,
            }}
          />
        ))}
      </View>
      <PageNumber />
    </Page>
  )
}

// ── Notes/Journey Page ───────────────────────────────
const NotesPage = ({ notes, title, focusName }: { notes: FocusNote[]; title: string; focusName: string }) => {
  if (notes.length === 0) return null
  return (
    <Page size="A4" style={baseStyles.page}>
      <RunningHeader left="PICC" right={focusName.toUpperCase()} />
      <Text style={baseStyles.sectionLabel}>{title}</Text>
      <Text style={[baseStyles.h2, { marginBottom: 16 }]}>{title}</Text>
      {notes.slice(0, 8).map((note) => {
        const firstLine = note.content.split('\n')[0].slice(0, 80)
        const rest = note.content.slice(firstLine.length).trim()
        return (
          <Card
            key={note.id}
            title={firstLine}
            description={rest.length > 200 ? rest.slice(0, 200) + '...' : rest || ''}
            badge={note.note_type || undefined}
            width="100%"
          />
        )
      })}
      <PageNumber />
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
        backgroundColor: C.bgDark,
        justifyContent: 'center',
        alignItems: 'center',
        padding: MARGIN,
      }}
    >
      <Image src="logo/picc-logo-full.png" style={{ width: 80, height: 80, marginBottom: 20, opacity: 0.8 }} />
      <Text style={{ fontSize: 11, color: C.textLight, textAlign: 'center', lineHeight: 1.6 }}>
        Palm Island Community Company
      </Text>
      <Text style={{ fontSize: 9, color: C.textMuted, textAlign: 'center', marginTop: 8 }}>
        picc.org.au
      </Text>
    </View>
  </Page>
)

// ── Main Document ────────────────────────────────────
export default function FocusReportPDF({ focus, year, coverPhoto, data }: FocusReportProps) {
  const subtitle = focus.type === 'service'
    ? 'Service Report'
    : focus.type === 'project'
      ? 'Innovation Project Report'
      : 'Themed Report'

  return (
    <Document
      title={`PICC — ${focus.name} Report`}
      author="Palm Island Community Company"
    >
      {/* Cover */}
      <PhotoCover
        photoUrl={coverPhoto || null}
        title={focus.name}
        subtitle={subtitle}
        year={year || new Date().getFullYear().toString()}
      />

      {/* Overview + Stats */}
      <OverviewPage focus={focus} data={data} />

      {/* Stories */}
      {data.stories.slice(0, 10).map(story => (
        <StoryPage key={story.id} story={story} focusName={focus.name} />
      ))}

      {/* Photo Spread */}
      {data.photos.length > 0 && (
        <PhotoSpread photos={data.photos} focusName={focus.name} />
      )}

      {/* Notes / Journey */}
      {data.notes && data.notes.length > 0 && (
        <NotesPage notes={data.notes} title="Notes & Journey" focusName={focus.name} />
      )}

      {/* Milestones */}
      {data.milestones && data.milestones.length > 0 && (
        <NotesPage notes={data.milestones} title="Milestones" focusName={focus.name} />
      )}

      {/* Back Cover */}
      <BackCover />
    </Document>
  )
}
