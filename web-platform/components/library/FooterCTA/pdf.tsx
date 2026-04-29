import { StyleSheet, Text, View } from '@react-pdf/renderer'
import { tokens } from '@/lib/design-tokens/pdf-tokens'
import { C, SP, TYPE } from '@/lib/pdf/theme'
import type { FooterCTAProps } from './types'

const styles = StyleSheet.create({
  root: {
    flexDirection: 'column', alignItems: 'center',
    backgroundColor: C.midnight, padding: SP.xxxl, gap: SP.lg, borderRadius: 8,
  },
  title: { fontFamily: TYPE.display, fontWeight: 700, fontSize: tokens.typography.fontSize.stat, color: C.starGold },
  body: { fontFamily: TYPE.body, fontSize: tokens.typography.fontSize.body, color: C.white, opacity: 0.85, lineHeight: 1.5, textAlign: 'center', maxWidth: 520 },
})

export function FooterCTAPdf({ title, body }: FooterCTAProps) {
  return (
    <View style={styles.root}>
      <Text style={styles.title}>{title}</Text>
      <Text style={styles.body}>{body}</Text>
    </View>
  )
}
