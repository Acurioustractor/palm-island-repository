/**
 * Hearth — where community voices gather.
 *
 * Anatomy:
 *   - Sand-tone background, warmer than the page paper
 *   - A consented, named photograph anchored top
 *   - A Community quote in PlayfairDisplay (Canela)
 *   - A PersonAvatar inset
 *   - StarMarker beside the name
 *
 * Always paired with a service or program — the hearth is where stories
 * meet evidence. Pages 6, 12, 18, 21 (4 hearths).
 *
 * Section colour tints the sand background by 4%. Youth section adds a
 * second StarMarker (the constellation thickens for young voices).
 */
import { View, Text, Image } from '@react-pdf/renderer'
import { C, TYPE, SECTION, VOICE, type SectionKey } from '../../theme'
import { StarMarker } from '../StarMarker'

interface HearthProps {
  /** The community member's quote. Verbatim, with consent. */
  quote: string
  /** Speaker's name. */
  name: string
  /** Speaker's role/relationship to PICC. */
  role: string
  /** Path to portrait image. PersonAvatar fallback if not present. */
  photoUrl?: string
  /** Section the hearth sits in. */
  section: SectionKey
  /** Date of the recording, optional small footer. */
  date?: string
  /** Consent line — small footer noting validated/consent state. */
  consent?: string
}

export function Hearth({
  quote,
  name,
  role,
  photoUrl,
  section,
  date,
  consent = 'Recorded with consent · Empathy Ledger',
}: HearthProps) {
  const sectionAccent = SECTION[section].color
  const isYouth = section === 'youth'

  return (
    <View
      style={{
        position: 'relative',
        backgroundColor: VOICE.community.bg,
        paddingHorizontal: 22,
        paddingTop: 18,
        paddingBottom: 14,
        marginVertical: 10,
        borderRadius: 4,
        // Section colour tint as a top-edge accent
        borderTopWidth: 2,
        borderTopColor: sectionAccent,
      }}
    >
      {/* Photo anchor top-left, quote flowing right */}
      <View style={{ flexDirection: 'row', alignItems: 'flex-start' }}>
        {/* Portrait — square, modest size */}
        {photoUrl ? (
          <View
            style={{
              width: 72,
              height: 72,
              marginRight: 18,
              overflow: 'hidden',
              borderRadius: 2,
            }}
          >
            <Image
              src={photoUrl}
              style={{ width: '100%', height: '100%', objectFit: 'cover' }}
            />
          </View>
        ) : (
          <View
            style={{
              width: 72,
              height: 72,
              marginRight: 18,
              backgroundColor: C.shell,
              alignItems: 'center',
              justifyContent: 'center',
              borderRadius: 2,
            }}
          >
            <Text
              style={{
                fontFamily: TYPE.display,
                fontSize: 32,
                color: sectionAccent,
                opacity: 0.6,
              }}
            >
              {name
                .split(' ')
                .map((n) => n[0])
                .slice(0, 2)
                .join('')}
            </Text>
          </View>
        )}

        {/* Quote + attribution */}
        <View style={{ flex: 1 }}>
          {/* Opening quote mark — large, decorative */}
          <Text
            style={{
              fontFamily: TYPE.display,
              fontSize: 28,
              color: sectionAccent,
              opacity: 0.5,
              lineHeight: 1,
              marginBottom: -10,
            }}
          >
            “
          </Text>

          {/* The quote */}
          <Text
            style={{
              fontFamily: TYPE.display,
              fontSize: 13,
              color: VOICE.community.text,
              lineHeight: 1.45,
              fontStyle: 'italic',
            }}
          >
            {quote}
          </Text>

          {/* Attribution row */}
          <View
            style={{
              flexDirection: 'row',
              alignItems: 'center',
              marginTop: 14,
            }}
          >
            <StarMarker size={6} color={sectionAccent} />
            {isYouth && (
              <View style={{ marginLeft: 4 }}>
                <StarMarker size={6} color={sectionAccent} />
              </View>
            )}

            <View style={{ marginLeft: 8 }}>
              <Text
                style={{
                  fontFamily: TYPE.body,
                  fontSize: 10,
                  fontWeight: 'bold',
                  color: VOICE.community.text,
                }}
              >
                {name}
              </Text>
              <Text
                style={{
                  fontFamily: TYPE.body,
                  fontSize: 8,
                  color: C.driftwood,
                  marginTop: 1,
                }}
              >
                {role}
                {date && ` · ${date}`}
              </Text>
            </View>
          </View>
        </View>
      </View>

      {/* Consent footer — very quiet */}
      <Text
        style={{
          fontFamily: TYPE.body,
          fontSize: 6.5,
          color: C.muted,
          marginTop: 14,
          letterSpacing: 0.5,
        }}
      >
        {consent}
      </Text>
    </View>
  )
}
