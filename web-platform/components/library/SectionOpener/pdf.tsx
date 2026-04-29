import { Image, StyleSheet, Text, View } from '@react-pdf/renderer'
import { tokens } from '@/lib/design-tokens/pdf-tokens'
import { C, SP, TYPE } from '@/lib/pdf/theme'
import type { SectionOpenerProps } from './types'

const styles = StyleSheet.create({
  root: {
    flexDirection: 'column',
    alignItems: 'center',
    backgroundColor: C.shell,
    padding: SP.xxxl,
    gap: SP.xl,
    borderRadius: 8,
  },
  icon: { width: 140, height: 140, objectFit: 'contain' },
  eyebrow: {
    fontFamily: TYPE.body, fontWeight: 700,
    fontSize: tokens.typography.fontSize.eyebrow,
    letterSpacing: 3, textTransform: 'uppercase',
  },
  title: {
    fontFamily: TYPE.display, fontWeight: 700,
    fontSize: tokens.typography.fontSize.display, lineHeight: 1.05,
  },
  subtitle: {
    fontFamily: TYPE.body, color: C.driftwood,
    fontSize: tokens.typography.fontSize.body, lineHeight: 1.5,
    textAlign: 'center',
  },
})

export function SectionOpenerPdf({ eyebrow, title, subtitle, section = 'family', iconUrl }: SectionOpenerProps) {
  const tint = tokens.color.section[section]
  return (
    <View style={styles.root}>
      {iconUrl && <Image src={iconUrl} style={styles.icon} />}
      <Text style={[styles.eyebrow, { color: tint }]}>{eyebrow}</Text>
      <Text style={[styles.title, { color: tint }]}>{title}</Text>
      {subtitle && <Text style={styles.subtitle}>{subtitle}</Text>}
    </View>
  )
}
