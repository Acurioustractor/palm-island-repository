/**
 * Cartouche — the wall plaque at the entrance of each museum room.
 *
 * Anatomy:
 *   - Full A4 page in section colour @ 12% saturation
 *   - Section name in PlayfairDisplay 64pt (Canela substitute)
 *   - Caveat sub-line beneath
 *   - Thematic icon at 280pt in section colour @ 30%
 *   - CornerBrackets framing the icon
 *   - Single line of body Inter giving the section's promise
 *
 * Used once per section — pages 4, 7, 10, 13, 16, 19.
 * The orphaned thematic icons (03-family.png … 10-country.png) finally find
 * their job here; one icon, one section, permanently.
 *
 * Pass `bare` to AmbientPage when using a Cartouche — the cartouche provides
 * its own colour wash and does NOT participate in the constellation seed or
 * water grain ambient layers (this is the pacing pause between rooms).
 */
import { Page, View, Text, Image } from '@react-pdf/renderer'
import { AMBIENT, C, SECTION, TYPE, type SectionKey } from '../../theme'
import { CornerBrackets } from '../CornerBrackets'
import { resolveAsset } from '../../asset-resolver'

interface CartoucheProps {
  section: SectionKey
  /** Caveat sub-line beneath the section name. e.g. "Where every story begins." */
  subline: string
  /** Single line of body type — the section's promise. */
  promise: string
  /** Optional Roman numeral for the room (i, ii, iii, iv, v, vi). Quiet typographic flourish. */
  numeral?: string
  /**
   * Optional hero photo as a band across the upper portion of the cartouche.
   * If provided, the photo replaces the centred icon — cartouche becomes
   * photo-led rather than symbol-led. Useful for sections where a real
   * portrait or place carries more weight than the icon.
   */
  heroPhotoUrl?: string
  /** Photo opacity tint. 0.0-1.0. Default 1.0 (full). */
  photoOpacity?: number
  /** Override the icon to a custom path (e.g. when section default doesn't fit). */
  iconOverride?: string
}

export function Cartouche({
  section,
  subline,
  promise,
  numeral,
  heroPhotoUrl,
  photoOpacity = 1,
  iconOverride,
}: CartoucheProps) {
  const def = SECTION[section]
  // Section colour at 12% — the page's wall colour
  const wallColor = hexAtAlphaOnCream(def.color, 0.12)
  const iconPath = iconOverride ?? `/icons/picc/${def.icon}.png`

  return (
    <Page
      size="A4"
      style={{
        flexDirection: 'column',
        backgroundColor: wallColor,
        fontFamily: TYPE.body,
        padding: 0,
      }}
    >
      {/* CornerBrackets — full-page, in section colour at full saturation but low opacity */}
      <CornerBrackets
        size={48}
        thickness={1}
        color={def.color}
        opacity={0.6}
        inset={AMBIENT.cornerBracketInset}
      />

      {/* Roman numeral — top centre, very quiet */}
      {numeral && (
        <View
          style={{
            position: 'absolute',
            top: 60,
            left: 0,
            right: 0,
            alignItems: 'center',
          }}
        >
          <Text
            style={{
              fontFamily: TYPE.body,
              fontSize: 8,
              color: def.color,
              letterSpacing: 6,
              textTransform: 'uppercase',
              opacity: 0.55,
            }}
          >
            Room {numeral}
          </Text>
        </View>
      )}

      {/* Hero band — if a photoUrl is provided, this is the upper-half visual.
          Otherwise the centred icon at low opacity sits behind the type. */}
      {heroPhotoUrl ? (
        <View
          style={{
            position: 'absolute',
            top: 100,
            left: 60,
            right: 60,
            height: 280,
            overflow: 'hidden',
            borderRadius: 4,
            opacity: photoOpacity,
          }}
        >
          <Image
            src={resolveAsset(heroPhotoUrl)}
            style={{ width: '100%', height: '100%', objectFit: 'cover' }}
          />
          {/* Subtle section-colour wash over the photo to integrate it */}
          <View
            style={{
              position: 'absolute',
              top: 0,
              left: 0,
              right: 0,
              bottom: 0,
              backgroundColor: def.color,
              opacity: 0.10,
            }}
          />
        </View>
      ) : (
        <View
          style={{
            position: 'absolute',
            top: '22%',
            left: 0,
            right: 0,
            alignItems: 'center',
            justifyContent: 'center',
          }}
        >
          <View style={{ width: 280, height: 280, opacity: 0.30 }}>
            <Image
              src={resolveAsset(iconPath)}
              style={{ width: '100%', height: '100%', objectFit: 'contain' }}
            />
          </View>
        </View>
      )}

      {/* Type stack — section name + sub-line + promise. Lower third. */}
      <View
        style={{
          position: 'absolute',
          bottom: 120,
          left: 60,
          right: 60,
          alignItems: 'center',
        }}
      >
        <Text
          style={{
            fontFamily: TYPE.display,
            fontSize: 56,
            fontWeight: 'bold',
            color: def.color,
            textAlign: 'center',
            lineHeight: 1.05,
          }}
        >
          {def.name}
        </Text>

        {/* Hairline rule */}
        <View
          style={{
            width: 60,
            height: 1,
            backgroundColor: def.color,
            opacity: 0.6,
            marginTop: 18,
            marginBottom: 14,
          }}
        />

        <Text
          style={{
            fontFamily: TYPE.hand,
            fontSize: 22,
            color: C.earth,
            textAlign: 'center',
            opacity: 0.85,
            lineHeight: 1.25,
          }}
        >
          {subline}
        </Text>

        <Text
          style={{
            fontFamily: TYPE.body,
            fontSize: 10,
            color: C.driftwood,
            textAlign: 'center',
            marginTop: 22,
            maxWidth: 360,
            lineHeight: 1.65,
          }}
        >
          {promise}
        </Text>
      </View>

      {/* Bottom hairline — section colour, full width but with margin */}
      <View
        style={{
          position: 'absolute',
          bottom: 50,
          left: 80,
          right: 80,
          height: 0.5,
          backgroundColor: def.color,
          opacity: 0.4,
        }}
      />
    </Page>
  )
}

/**
 * Mix a hex colour with cream paper at given alpha to produce the wall tone.
 */
function hexAtAlphaOnCream(hex: string, alpha: number): string {
  const cleaned = hex.replace('#', '')
  const r = parseInt(cleaned.slice(0, 2), 16)
  const g = parseInt(cleaned.slice(2, 4), 16)
  const b = parseInt(cleaned.slice(4, 6), 16)

  // Cream base
  const cr = 0xfb
  const cg = 0xfa
  const cb = 0xf6

  const mr = Math.round(cr * (1 - alpha) + r * alpha)
  const mg = Math.round(cg * (1 - alpha) + g * alpha)
  const mb = Math.round(cb * (1 - alpha) + b * alpha)

  return `#${mr.toString(16).padStart(2, '0')}${mg.toString(16).padStart(2, '0')}${mb.toString(16).padStart(2, '0')}`
}
