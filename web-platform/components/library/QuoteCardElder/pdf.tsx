import { Image, StyleSheet, Text, View } from '@react-pdf/renderer'
import { tokens } from '@/lib/design-tokens/pdf-tokens'
import { C, SP, TYPE } from '@/lib/pdf/theme'
import type { QuoteCardElderProps } from './types'

const styles = StyleSheet.create({
  root: { flexDirection: 'column', backgroundColor: C.sand, padding: 40, gap: 20, borderRadius: 8 },
  mark: { fontFamily: TYPE.display, fontSize: 28, color: C.turtleRed, lineHeight: 1 },
  quote: {
    fontFamily: TYPE.display, fontStyle: 'italic', fontWeight: 500,
    fontSize: 32, color: C.earth, lineHeight: 1.3,
  },
  caption: { flexDirection: 'row', alignItems: 'center', gap: SP.md },
  portrait: { width: 48, height: 48, borderRadius: 24, objectFit: 'cover' },
  name: { fontFamily: TYPE.body, fontSize: tokens.typography.fontSize.body, fontWeight: 600, color: C.earth },
  role: { fontFamily: TYPE.body, fontSize: tokens.typography.fontSize.caption, color: C.driftwood },
})

export function QuoteCardElderPdf({ quote, speakerName, speakerRole, portraitUrl }: QuoteCardElderProps) {
  return (
    <View style={styles.root}>
      <Text style={styles.mark}>&ldquo;</Text>
      <Text style={styles.quote}>{quote}</Text>
      <View style={styles.caption}>
        {portraitUrl && <Image src={portraitUrl} style={styles.portrait} />}
        <View style={{ flexDirection: 'column' }}>
          <Text style={styles.name}>{speakerName}</Text>
          {speakerRole && <Text style={styles.role}>{speakerRole}</Text>}
        </View>
      </View>
    </View>
  )
}
