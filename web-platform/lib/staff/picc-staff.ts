/**
 * PICC staff overrides — people who are regular meeting attendees but
 * aren't yet surfaced by the EL `/api/picc/storytellers` endpoint
 * (typically because they don't have a published story scoped to PICC).
 *
 * Each entry merges into the AttendeesPanel storyteller list so:
 *   - their name renders as a rich card with photo + role
 *   - aliases match against attendees text (so "Ben" matches "Benjamin Knight")
 *   - link sends users to a real profile (EL slug if they have one,
 *     otherwise mailto: or external)
 *
 * When a person eventually appears in the EL endpoint, delete their
 * entry here. Source-of-truth always wins; this file is a bridge.
 */

export interface StaffOverride {
  id: string
  /** Canonical display name. Shown in cards. */
  name: string
  /** Other strings that should match against meeting attendees. */
  aliases: string[]
  /** EL slug if they have a profile (link target). */
  slug?: string
  /** Free-text role. */
  role: string | null
  /** Public photo URL. */
  photo_url: string | null
  /** Optional location. */
  location?: string | null
  /** External link target if no EL slug — e.g. `mailto:x@y.com`. */
  link?: string
}

export const PICC_STAFF_OVERRIDES: StaffOverride[] = [
  {
    id: 'staff:benjamin-knight',
    name: 'Benjamin Knight',
    aliases: ['Ben', 'Ben Knight', 'Benjamin', 'Benjamin Knight'],
    slug: 'benjamin-knight',
    role: 'Field producer · Empathy Ledger',
    photo_url: null, // upload to Supabase Storage when available
    location: 'Sunshine Coast, QLD',
    link: 'mailto:benjamin@act.place',
  },
]

/** Quick lookup by any alias. Case-insensitive trim. */
export function findStaffOverride(name: string): StaffOverride | null {
  const q = name.trim().toLowerCase()
  if (!q) return null
  for (const s of PICC_STAFF_OVERRIDES) {
    if (s.aliases.some((a) => a.toLowerCase().trim() === q)) return s
    if (s.name.toLowerCase().trim() === q) return s
  }
  return null
}
