import { Image, StyleSheet, Text, View } from '@react-pdf/renderer'
import { tokens } from '@/lib/design-tokens/pdf-tokens'
import { C, SP, TYPE } from '@/lib/pdf/theme'
import type { ServiceCompactTileProps } from './types'

const styles = StyleSheet.create({
  root: {
    width: '100%',
    height: 280,
    flexDirection: 'column',
    borderRadius: 8,
    overflow: 'hidden',
  },
  imageBlock: {
    width: '100%',
    height: 160,
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
    fontSize: 56,
    fontWeight: 700,
    opacity: 0.5,
  },
  body: {
    flexDirection: 'column',
    padding: SP.md,
    gap: SP.sm,
    flexGrow: 1,
  },
  name: {
    fontFamily: TYPE.display,
    fontSize: 18,
    fontWeight: 700,
    color: C.ocean,
    lineHeight: 1.2,
  },
  description: {
    fontFamily: TYPE.body,
    fontSize: 13,
    color: C.driftwood,
    lineHeight: 1.4,
  },
  strap: {
    flexDirection: 'row',
    gap: SP.md,
    marginTop: 'auto',
    paddingTop: SP.sm,
  },
  strapText: {
    fontFamily: TYPE.body,
    fontSize: 12,
    color: C.muted,
  },
})

export function ServiceCompactTilePdf({
  name,
  description,
  imageUrl,
  tint = 'family',
  staffCount,
  clientsCount,
}: ServiceCompactTileProps) {
  const tintColor = tokens.color.section[tint]
  const initials = name
    .split(/\s+/)
    .map((p) => p[0])
    .slice(0, 2)
    .join('')

  return (
    <View style={[styles.root, { backgroundColor: tokens.color.brand.shell }]}>
      <View style={imageUrl ? styles.imageBlock : [styles.imageBlock, { backgroundColor: `${tintColor}33` }]}>
        {imageUrl ? (
          <Image src={imageUrl} style={styles.image} />
        ) : (
          <View style={styles.placeholder}>
            <Text style={[styles.initials, { color: tintColor }]}>{initials}</Text>
          </View>
        )}
      </View>
      <View style={styles.body}>
        <Text style={styles.name}>{name}</Text>
        {description && <Text style={styles.description}>{description}</Text>}
        {(staffCount != null || clientsCount != null) && (
          <View style={styles.strap}>
            {staffCount != null && (
              <Text style={styles.strapText}>
                <Text style={{ color: tintColor, fontWeight: 700 }}>{staffCount}</Text> staff
              </Text>
            )}
            {clientsCount != null && (
              <Text style={styles.strapText}>
                <Text style={{ color: tintColor, fontWeight: 700 }}>
                  {clientsCount.toLocaleString()}
                </Text>{' '}
                clients/yr
              </Text>
            )}
          </View>
        )}
      </View>
    </View>
  )
}
