import { Image, StyleSheet, Text, View } from '@react-pdf/renderer'
import { tokens } from '@/lib/design-tokens/pdf-tokens'
import { C, SP, TYPE } from '@/lib/pdf/theme'
import type { StatHeroProps } from './types'

const styles = StyleSheet.create({
  rootFixed: {
    width: 300,
    height: 240,
    padding: SP.xl,
    flexDirection: 'column',
    alignItems: 'center',
    justifyContent: 'center',
    gap: SP.sm,
    borderRadius: 8,
  },
  rootFluid: {
    width: '100%',
    minHeight: 240,
    padding: SP.xl,
    flexDirection: 'column',
    alignItems: 'center',
    justifyContent: 'center',
    gap: SP.sm,
    borderRadius: 8,
  },
  icon: { width: 48, height: 48, objectFit: 'contain' },
  value: {
    fontFamily: TYPE.display,
    fontSize: tokens.typography.fontSize.display,
    fontWeight: 700,
    lineHeight: 1,
  },
  label: {
    fontFamily: TYPE.body,
    fontSize: tokens.typography.fontSize.eyebrow,
    fontWeight: 700,
    color: C.earth,
    letterSpacing: 2,
    textTransform: 'uppercase',
  },
  caption: {
    fontFamily: TYPE.body,
    fontSize: tokens.typography.fontSize.eyebrow,
    color: C.muted,
    textAlign: 'center',
    lineHeight: 1.4,
  },
})

export function StatHeroPdf({ value, label, caption, iconUrl, tint = 'mangrove', size = 'fixed' }: StatHeroProps) {
  const tintColor =
    (tokens.color.section as Record<string, string>)[tint] ??
    (tokens.color.brand as Record<string, string>)[tint] ??
    C.mangrove

  return (
    <View style={size === 'fixed' ? styles.rootFixed : styles.rootFluid}>
      {iconUrl && <Image src={iconUrl} style={styles.icon} />}
      <Text style={[styles.value, { color: tintColor }]}>{value}</Text>
      <Text style={styles.label}>{label}</Text>
      {caption && <Text style={styles.caption}>{caption}</Text>}
    </View>
  )
}
