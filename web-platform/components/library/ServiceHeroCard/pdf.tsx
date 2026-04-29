import { Image, StyleSheet, Text, View } from '@react-pdf/renderer'
import { tokens } from '@/lib/design-tokens/pdf-tokens'
import { C, SP, TYPE } from '@/lib/pdf/theme'
import type { ServiceHeroCardProps } from './types'

const styles = StyleSheet.create({
  root: {
    width: '100%',
    minHeight: 380,
    flexDirection: 'row',
    borderRadius: 8,
    overflow: 'hidden',
    backgroundColor: tokens.color.brand.shell,
  },
  imageBlock: {
    width: '50%',
    minHeight: 380,
  },
  image: {
    width: '100%',
    height: '100%',
    objectFit: 'cover',
  },
  placeholder: {
    width: '100%',
    height: '100%',
    alignItems: 'center',
    justifyContent: 'center',
  },
  initials: {
    fontFamily: TYPE.display,
    fontSize: 96,
    fontWeight: 700,
    opacity: 0.45,
  },
  body: {
    width: '50%',
    flexDirection: 'column',
    justifyContent: 'center',
    padding: SP.xxxl,
    gap: SP.lg,
  },
  eyebrow: {
    fontFamily: TYPE.body,
    fontSize: tokens.typography.fontSize.eyebrow,
    fontWeight: 700,
    letterSpacing: 3,
    textTransform: 'uppercase',
  },
  name: {
    fontFamily: TYPE.display,
    fontSize: 42,
    fontWeight: 700,
    color: C.ocean,
    lineHeight: 1.05,
  },
  description: {
    fontFamily: TYPE.body,
    fontSize: 14,
    color: C.driftwood,
    lineHeight: 1.6,
  },
  fact: {
    fontFamily: TYPE.hand,
    fontSize: 16,
    fontStyle: 'italic',
    color: C.muted,
  },
})

export function ServiceHeroCardPdf({
  categoryLabel,
  name,
  description,
  factStrap,
  imageUrl,
  tint = 'family',
}: ServiceHeroCardProps) {
  const tintColor = tokens.color.section[tint]
  const initials = name
    .split(/\s+/)
    .map((p) => p[0])
    .slice(0, 2)
    .join('')

  return (
    <View style={styles.root}>
      <View style={imageUrl ? styles.imageBlock : [styles.imageBlock, { backgroundColor: `${tintColor}26` }]}>
        {imageUrl ? (
          <Image src={imageUrl} style={styles.image} />
        ) : (
          <View style={styles.placeholder}>
            <Text style={[styles.initials, { color: tintColor }]}>{initials}</Text>
          </View>
        )}
      </View>
      <View style={styles.body}>
        <Text style={[styles.eyebrow, { color: tintColor }]}>{categoryLabel}</Text>
        <Text style={styles.name}>{name}</Text>
        {description && <Text style={styles.description}>{description}</Text>}
        {factStrap && <Text style={styles.fact}>{factStrap}</Text>}
      </View>
    </View>
  )
}
