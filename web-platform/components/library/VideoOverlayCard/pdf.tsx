import { Image, StyleSheet, Text, View } from '@react-pdf/renderer'
import { tokens } from '@/lib/design-tokens/pdf-tokens'
import { C, SP, TYPE } from '@/lib/pdf/theme'
import type { VideoOverlayCardProps } from './types'

const ASPECT_HEIGHT: Record<NonNullable<VideoOverlayCardProps['aspect']>, number> = {
  '16:9': 240,
  '1:1': 360,
  '9:16': 600,
  '4:3': 320,
}

const styles = StyleSheet.create({
  root: {
    width: '100%',
    flexDirection: 'column',
    borderRadius: 8,
    overflow: 'hidden',
  },
  mediaBlock: {
    width: '100%',
    position: 'relative',
  },
  mediaImage: {
    width: '100%',
    height: '100%',
    objectFit: 'cover',
  },
  body: {
    flexDirection: 'column',
    padding: SP.md,
    gap: SP.sm,
  },
  eyebrow: {
    fontFamily: TYPE.body,
    fontSize: tokens.typography.fontSize.eyebrow,
    fontWeight: 700,
    letterSpacing: 3,
    textTransform: 'uppercase',
  },
  caption: {
    fontFamily: TYPE.display,
    fontSize: 22,
    fontWeight: 700,
    fontStyle: 'italic',
    lineHeight: 1.2,
  },
  subcaption: {
    fontFamily: TYPE.body,
    fontSize: 13,
  },
})

export function VideoOverlayCardPdf({
  eyebrow,
  caption,
  subcaption,
  posterUrl,
  surface = 'shell',
  tint,
  aspect = '16:9',
}: VideoOverlayCardProps) {
  // PDF can't play video — render the poster only. Falls back to the
  // section-tint placeholder when neither poster nor tint is provided.
  const surfaceBg =
    surface === 'midnight' ? C.midnight : surface === 'ocean' ? C.ocean : C.shell
  const isDark = surface === 'midnight' || surface === 'ocean'
  const eyebrowColor = isDark ? tokens.color.brand.starGold : tokens.color.brand.turtleRed
  const captionColor = isDark ? '#FFFFFF' : C.earth
  const subcaptionColor = isDark ? '#FFFFFFB3' : C.driftwood
  const placeholderTint = tint ? tokens.color.section[tint] : C.midnight

  return (
    <View style={[styles.root, { backgroundColor: surfaceBg }]}>
      <View
        style={
          posterUrl
            ? [styles.mediaBlock, { height: ASPECT_HEIGHT[aspect] }]
            : [styles.mediaBlock, { height: ASPECT_HEIGHT[aspect], backgroundColor: `${placeholderTint}40` }]
        }
      >
        {posterUrl && <Image src={posterUrl} style={styles.mediaImage} />}
      </View>
      <View style={styles.body}>
        <Text style={[styles.eyebrow, { color: eyebrowColor }]}>{eyebrow}</Text>
        <Text style={[styles.caption, { color: captionColor }]}>{caption}</Text>
        {subcaption && (
          <Text style={[styles.subcaption, { color: subcaptionColor }]}>{subcaption}</Text>
        )}
      </View>
    </View>
  )
}
