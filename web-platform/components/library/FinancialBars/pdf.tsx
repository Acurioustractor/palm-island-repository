import { StyleSheet, Text, View } from '@react-pdf/renderer'
import { tokens } from '@/lib/design-tokens/pdf-tokens'
import { C, SP, TYPE } from '@/lib/pdf/theme'
import type { FinancialBarsProps } from './types'

const resolve = (key?: string) =>
  (key && (tokens.color.section as Record<string, string>)[key]) ??
  (key && (tokens.color.brand as Record<string, string>)[key]) ??
  C.ochre

const styles = StyleSheet.create({
  root: { flexDirection: 'column', backgroundColor: C.shell, padding: SP.xxl, gap: SP.xl, borderRadius: 8 },
  header: {
    fontFamily: TYPE.body, fontWeight: 700,
    fontSize: tokens.typography.fontSize.eyebrow,
    letterSpacing: 2, textTransform: 'uppercase', color: C.earth,
  },
  rows: { flexDirection: 'column', gap: SP.lg },
  row: { flexDirection: 'column', gap: 6 },
  rowHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
  label: { fontFamily: TYPE.body, fontSize: tokens.typography.fontSize.body, color: C.earth },
  display: { fontFamily: TYPE.display, fontWeight: 700, fontSize: tokens.typography.fontSize.body, color: C.earth },
  track: { height: 12, borderRadius: 6, backgroundColor: C.border, width: '100%' },
  fill: { height: 12, borderRadius: 6 },
})

export function FinancialBarsPdf({ header, rows }: FinancialBarsProps) {
  return (
    <View style={styles.root}>
      <Text style={styles.header}>{header}</Text>
      <View style={styles.rows}>
        {rows.map((r, i) => (
          <View key={`${r.label}-${i}`} style={styles.row}>
            <View style={styles.rowHeader}>
              <Text style={styles.label}>{r.label}</Text>
              <Text style={styles.display}>{r.display}</Text>
            </View>
            <View style={styles.track}>
              <View style={[styles.fill, { width: `${Math.max(0, Math.min(1, r.ratio)) * 100}%`, backgroundColor: resolve(r.tint) }]} />
            </View>
          </View>
        ))}
      </View>
    </View>
  )
}
