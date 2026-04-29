import { StyleSheet, Text, View } from '@react-pdf/renderer'
import { tokens } from '@/lib/design-tokens/pdf-tokens'
import { C, SP, TYPE } from '@/lib/pdf/theme'
import type { MilestoneCalloutProps } from './types'

const resolve = (key: string) =>
  (tokens.color.section as Record<string, string>)[key] ??
  (tokens.color.brand as Record<string, string>)[key] ??
  C.ocean

const styles = StyleSheet.create({
  root: { flexDirection: 'column', padding: SP.xxxl, gap: SP.lg, borderRadius: 12 },
  value: { fontFamily: TYPE.display, fontWeight: 700, fontSize: tokens.typography.fontSize.hero, lineHeight: 0.9 },
  description: { fontFamily: TYPE.body, fontSize: tokens.typography.fontSize.body, lineHeight: 1.5, color: C.white, opacity: 0.9 },
})

export function MilestoneCalloutPdf({
  value, description, background = 'ocean', valueTint = 'starGold',
}: MilestoneCalloutProps) {
  return (
    <View style={[styles.root, { backgroundColor: resolve(background) }]}>
      <Text style={[styles.value, { color: resolve(valueTint) }]}>{value}</Text>
      <Text style={styles.description}>{description}</Text>
    </View>
  )
}
