import { Image, StyleSheet, Text, View } from '@react-pdf/renderer'
import { C, SP, TYPE } from '@/lib/pdf/theme'
import type { PhotoBlockProps } from './types'

const styles = StyleSheet.create({
  root: { flexDirection: 'column', gap: SP.md },
  img: { width: '100%', objectFit: 'cover', borderRadius: 8 },
  caption: { fontFamily: TYPE.display, fontStyle: 'italic', fontSize: 18, color: C.driftwood, lineHeight: 1.4 },
})

export function PhotoBlockPdf({ src, caption, height = 520 }: PhotoBlockProps) {
  return (
    <View style={styles.root}>
      <Image src={src} style={[styles.img, { height }]} />
      {caption && <Text style={styles.caption}>{caption}</Text>}
    </View>
  )
}
