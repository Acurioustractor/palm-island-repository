/**
 * Specimen — a scientific-feeling comparative panel.
 *
 * Anatomy:
 *   - before-after-hull OR reef-layers wash as substrate
 *   - Two states side-by-side
 *   - A thin vertical GradientBar dividing them
 *   - Inter caps labels ("2019 / 2025")
 *   - A single Caveat annotation arrowing to the change
 *
 * Used at pages 9 (CFC water receding), 15 (BHS reef cross-section), 17
 * (blue card key).
 *
 * Variants:
 *   - 'infrastructure' — uses before-after-hull substrate
 *   - 'cultural' — uses reef-layers substrate (health/cultural)
 */
import { View, Text, Image } from '@react-pdf/renderer'
import { C, TYPE, SECTION, type SectionKey } from '../../theme'
import { resolveAsset } from '../../asset-resolver'

interface SpecimenSide {
  /** Big label — "2019" or "Before" or whatever. Uppercase. */
  label: string
  /** The headline figure or short phrase. */
  value: string
  /** Optional sub-line describing the state. */
  detail?: string
  /** Optional photo — overrides the substrate for this side. */
  photoUrl?: string
}

interface SpecimenProps {
  /** Section the specimen sits in — drives accent colour. */
  section: SectionKey
  /** Substrate variant. */
  variant?: 'infrastructure' | 'cultural'
  /** The two states. */
  before: SpecimenSide
  after: SpecimenSide
  /** The annotation — Caveat hand, "the change you can see". */
  annotation?: string
  /** Optional title above the specimen. */
  title?: string
}

export function Specimen({
  section,
  variant = 'infrastructure',
  before,
  after,
  annotation,
  title,
}: SpecimenProps) {
  const accent = SECTION[section].color
  const substrateUrl =
    variant === 'infrastructure'
      ? '/icons/picc/infographics/05-before-after-hull.png'
      : '/icons/picc/infographics/03-reef-layers.png'

  return (
    <View style={{ marginVertical: 18 }}>
      {title && (
        <View style={{ marginBottom: 10 }}>
          <Text
            style={{
              fontFamily: TYPE.body,
              fontSize: 7.5,
              fontWeight: 'bold',
              color: accent,
              textTransform: 'uppercase',
              letterSpacing: 2,
              marginBottom: 3,
            }}
          >
            Specimen
          </Text>
          <Text
            style={{
              fontFamily: TYPE.display,
              fontSize: 18,
              fontWeight: 'bold',
              color: C.ocean,
              lineHeight: 1.2,
            }}
          >
            {title}
          </Text>
        </View>
      )}

      <View
        style={{
          flexDirection: 'row',
          backgroundColor: C.shell,
          borderRadius: 4,
          minHeight: 200,
          overflow: 'hidden',
          position: 'relative',
        }}
      >
        {/* Substrate behind both sides at low opacity */}
        <View
          style={{
            position: 'absolute',
            top: 0,
            left: 0,
            right: 0,
            bottom: 0,
            opacity: 0.15,
          }}
        >
          <Image
            src={resolveAsset(substrateUrl)}
            style={{ width: '100%', height: '100%', objectFit: 'cover' }}
          />
        </View>

        {/* Before side */}
        <SpecimenColumn
          side="before"
          data={before}
          accent={accent}
        />

        {/* Vertical divider — thin gradient bar */}
        <View
          style={{
            width: 1,
            backgroundColor: accent,
            opacity: 0.4,
            marginVertical: 16,
          }}
        />

        {/* After side */}
        <SpecimenColumn
          side="after"
          data={after}
          accent={accent}
        />
      </View>

      {/* Caveat annotation beneath — the curator points at the change */}
      {annotation && (
        <View
          style={{
            flexDirection: 'row',
            alignItems: 'flex-start',
            marginTop: 10,
            paddingLeft: 14,
          }}
        >
          {/* Arrow mark — three diminishing dots forming a pointer */}
          <View
            style={{
              flexDirection: 'row',
              alignItems: 'center',
              marginRight: 10,
              marginTop: 4,
            }}
          >
            <View
              style={{
                width: 14,
                height: 0.5,
                backgroundColor: accent,
                opacity: 0.7,
              }}
            />
            <View
              style={{
                width: 0,
                height: 0,
                borderTopWidth: 3,
                borderBottomWidth: 3,
                borderLeftWidth: 5,
                borderTopColor: 'transparent',
                borderBottomColor: 'transparent',
                borderLeftColor: accent,
                opacity: 0.7,
              }}
            />
          </View>

          <Text
            style={{
              fontFamily: TYPE.hand,
              fontSize: 13,
              color: C.earth,
              opacity: 0.85,
              flex: 1,
              lineHeight: 1.3,
            }}
          >
            {annotation}
          </Text>
        </View>
      )}
    </View>
  )
}

function SpecimenColumn({
  side,
  data,
  accent,
}: {
  side: 'before' | 'after'
  data: SpecimenSide
  accent: string
}) {
  return (
    <View
      style={{
        flex: 1,
        padding: 18,
        position: 'relative',
        zIndex: 1,
      }}
    >
      {/* Side photo if provided */}
      {data.photoUrl && (
        <View
          style={{
            width: '100%',
            height: 90,
            marginBottom: 10,
            overflow: 'hidden',
            borderRadius: 2,
          }}
        >
          <Image
            src={resolveAsset(data.photoUrl)}
            style={{ width: '100%', height: '100%', objectFit: 'cover' }}
          />
        </View>
      )}

      {/* Label — uppercase, small */}
      <Text
        style={{
          fontFamily: TYPE.body,
          fontSize: 8,
          fontWeight: 'bold',
          color: side === 'before' ? C.driftwood : accent,
          textTransform: 'uppercase',
          letterSpacing: 2,
          marginBottom: 8,
        }}
      >
        {data.label}
      </Text>

      {/* Value — big */}
      <Text
        style={{
          fontFamily: TYPE.display,
          fontSize: 26,
          fontWeight: 'bold',
          color: side === 'before' ? C.driftwood : accent,
          lineHeight: 1.05,
        }}
      >
        {data.value}
      </Text>

      {/* Detail line */}
      {data.detail && (
        <Text
          style={{
            fontFamily: TYPE.body,
            fontSize: 9,
            color: C.driftwood,
            lineHeight: 1.55,
            marginTop: 6,
          }}
        >
          {data.detail}
        </Text>
      )}
    </View>
  )
}
