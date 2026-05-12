/**
 * Atlas whitelist — the single source of truth for what shows on the
 * /living-atlas hero. EL v2 (and PICC supabase) remain the canonical
 * data backends; this file just controls which of their rows appear
 * on the workshop demo surface.
 *
 *  ┌────────────────────────────────────────────────────────────────┐
 *  │ EDIT THIS FILE to add/remove featured entities. Push, and the  │
 *  │ atlas updates on the next request. No other edits needed.      │
 *  └────────────────────────────────────────────────────────────────┘
 *
 * Behaviour rules
 * ────────────────
 *  • Live data from EL is fetched as today (no snapshots, no mocks).
 *  • If a featured slug is missing from EL, the entity is silently
 *    skipped — never crashes the render.
 *  • If a featured slug is present BUT a photo / description field
 *    is broken, the override maps below patch it.
 *  • Anything NOT in a FEATURED_* list is hidden from the hero, even
 *    if EL returns it.
 *  • Anything in a HIDDEN_* set is hidden even if it's an active
 *    featured entity (used for "data drift" rejection like Freddy
 *    Wai who is not a PICC storyteller).
 */

/* ─── ELDERS ──────────────────────────────────────────────────────── */
/** The 10 named Elders to feature on the Elders Council strip. Order
 *  here is preserved — top of the list shows first. */
export const FEATURED_ELDER_SLUGS: ReadonlyArray<string> = [
  'allan-palm-island',
  'uncle-frank-daniel-anderson',
  'aunty-ethel-taylor-robertson',
  'winifred-obah',
  'cyndel-louise-pryor',
  'marjoyie-burns',
  'aunty-iris-may-whitey',
  'elsa-watson',
  'gurtrude-grace-richardson',
  'raymond-w-palmer-snr',
]

/* ─── SERVICES ────────────────────────────────────────────────────── */
/** 26 active PICC services. Order here drives the grid display order
 *  on the hero — most prominent first. */
export const FEATURED_SERVICE_SLUGS: ReadonlyArray<string> = [
  // Strong photos + many linked voices
  'hub',
  'bhs',
  'cfc',
  'whs',
  'shelter',
  'sewb',
  'youth',
  'bwg-way',
  // Healing + family services
  'fc',
  'fwc',
  'fpp',
  'safe-house',
  'safe-haven',
  '1000d',
  'ferdys',
  // Education + justice
  'beai',
  'cjg',
  'dfv',
  'divers',
  // Economic / enterprise
  'enterprises',
  'retail',
  'dsc',
  'logistics',
  // Newer / specialist
  'aged',
  'blue-card',
  'ndis',
]

/* ─── PROJECTS ────────────────────────────────────────────────────── */
/**
 * Curation is EL-driven (preferred, edit-anywhere):
 *
 *   In EL admin / EL Supabase, set on the project row:
 *     external_references.picc.themes = ['atlas-featured']
 *
 *   EL v2's PICC API surfaces this as project.themes[]. lib/constellation/
 *   queries.ts filters projects where themes includes 'atlas-featured'.
 *
 *   SQL (when EL admin doesn't expose a checkbox yet):
 *     UPDATE projects
 *     SET external_references = COALESCE(external_references, '{}'::jsonb)
 *       || jsonb_build_object('picc',
 *         COALESCE(external_references->'picc', '{}'::jsonb)
 *           || jsonb_build_object('themes', '["atlas-featured"]'::jsonb))
 *     WHERE slug = '<slug>';
 *
 * Fallback (only used if EL returns zero atlas-featured projects):
 *
 *   The list below is the "if EL is down or untagged, show these"
 *   safety net. Order here drives display order in both paths.
 */
export const FEATURED_PROJECT_SLUGS: ReadonlyArray<string> = [
  'picc-elders',
  'picc-photo',
  'picc-community-voices',
  'picc-annual-report',
  'picc-centre-precinct',
]

/* ─── DENIED / HIDDEN ─────────────────────────────────────────────── */
/** Storyteller slugs that EL still has but PICC has removed in spirit.
 *  Edit this when EL data is cleaned up. */
export const HIDDEN_STORYTELLER_SLUGS = new Set<string>([
  'freddy-wai', // Not a PICC storyteller — verified 2026-05-12
])

/** Storyteller slugs whose EL photo_url points to a missing file.
 *  Either fix in EL admin or add a PHOTO_OVERRIDE entry below. */
export const MISSING_PHOTO_SLUGS = new Set<string>([
  'ida-richardson',
  'jeanie-sam',
  'patricia-doyle',
])

/* ─── PHOTO OVERRIDES ─────────────────────────────────────────────── */
/** When EL's storyteller photo_url is broken or wrong, map slug →
 *  correct URL here. Takes precedence over EL canonical. */
export const STORYTELLER_PHOTO_OVERRIDES: Record<string, string> = {
  'dee-ann-sailor':
    'https://uaxhjzqrdotoahjnxmbj.supabase.co/storage/v1/object/public/story-media/picc-website/service-photos/20240410-IMG_6281.jpg',
}

/* ─── FEATURED VOICE-WALL QUOTES ──────────────────────────────────── */
/** Empty = auto-pick by impact_score (current behaviour). To pin
 *  specific quotes, add their EL extracted_quotes.id values here. */
export const FEATURED_QUOTE_IDS: ReadonlyArray<string> = [
  // Leave empty for auto-curation by impact_score. Add ids if you
  // want a specific quote locked into the wall.
]

/* ─── DERIVED HELPERS ─────────────────────────────────────────────── */
export const FEATURED_ELDER_SLUG_SET = new Set(FEATURED_ELDER_SLUGS)
export const FEATURED_SERVICE_SLUG_SET = new Set(FEATURED_SERVICE_SLUGS)
export const FEATURED_PROJECT_SLUG_SET = new Set(FEATURED_PROJECT_SLUGS)

/** Used to sort entities by their position in the FEATURED list. */
export function whitelistOrder(
  slug: string,
  list: ReadonlyArray<string>,
): number {
  const idx = list.indexOf(slug)
  return idx === -1 ? 9999 : idx
}
