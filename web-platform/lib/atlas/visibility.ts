/**
 * Atlas visibility bands — protocol-first access control.
 *
 * Four bands as first-class architecture (not just UI styling). Every
 * Atlas query passes through this helper so cultural protocols are
 * enforced at the data layer, not at the render layer.
 *
 *   public                — TV / kiosk / anonymous web visitor
 *   community-general     — authenticated community member (Stage 6+)
 *   culturally-restricted — Elders + cultural advisors only
 *   staff-admin           — PICC staff inbox / capture review
 *
 * Restricted content stays in the archive — counted in the Permissions
 * panel, hidden from the public surface. The point: sovereignty made
 * legible, not erased.
 */

export type VisibilityBand =
  | 'public'
  | 'community-general'
  | 'culturally-restricted'
  | 'staff-admin'

export interface VisibilityContext {
  /** Acting band — defaults to 'public' for anonymous Atlas visitors. */
  band: VisibilityBand
}

/** Default visibility for any Atlas surface that doesn't override. */
export const PUBLIC: VisibilityContext = { band: 'public' }

/** Predicate: should a row with this cultural_sensitivity tag be shown? */
export function canSeeSensitivity(
  band: VisibilityBand,
  sensitivity: string | null | undefined,
): boolean {
  if (!sensitivity) return true
  const s = sensitivity.toLowerCase()
  // Restricted content is hidden from public + community-general; only
  // surfaced to the restricted band (Elders) and staff-admin.
  if (s === 'restricted' || s === 'sacred') {
    return band === 'culturally-restricted' || band === 'staff-admin'
  }
  // Community-level content is hidden from anonymous public visitors but
  // visible to anyone signed in.
  if (s === 'community' || s === 'community-only') {
    return band !== 'public'
  }
  // Default (public, standard, etc.) — everyone sees.
  return true
}

/** Predicate: should this is_public=false row appear on this surface? */
export function canSeeUnpublished(band: VisibilityBand): boolean {
  return band === 'staff-admin'
}

/** Predicate: should we display the speaker name on a quote? */
export function canSeeAttribution(
  band: VisibilityBand,
  permission_level: string | null | undefined,
): boolean {
  if (!permission_level) return true
  const p = permission_level.toLowerCase()
  if (p === 'staff' || p === 'private') return band === 'staff-admin'
  if (p === 'community') return band !== 'public'
  return true // 'public' or other
}

/**
 * Snapshot for the Permissions panel — restricted content stays counted
 * but not displayed.
 */
export interface VisibilitySnapshot {
  /** How many items the current band can see. */
  visible: number
  /** How many items exist but are restricted to higher bands. */
  restricted: number
  /** Total — for cultural-protocol legibility. */
  total: number
}

export function makeSnapshot(
  rows: Array<{ cultural_sensitivity?: string | null }>,
  band: VisibilityBand,
): VisibilitySnapshot {
  let visible = 0
  let restricted = 0
  for (const r of rows) {
    if (canSeeSensitivity(band, r.cultural_sensitivity)) {
      visible += 1
    } else {
      restricted += 1
    }
  }
  return { visible, restricted, total: rows.length }
}
