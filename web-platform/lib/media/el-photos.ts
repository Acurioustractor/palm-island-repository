/**
 * Empathy Ledger v2 photo client.
 *
 * EL v2 is the source of truth for PICC media + consent. This module is the
 * only place the PICC web platform talks to EL v2's photo feed. Consent
 * filtering happens server-side in EL v2; anything returned here is safe to
 * render publicly.
 *
 * Requires two env vars:
 *   EL_V2_API_URL   — e.g. https://empathy-ledger-v2.vercel.app
 *   EL_V2_API_KEY   — shared secret matching EL v2 PICC_API_KEY
 */

export interface ELPhoto {
  id: string;
  url: string;
  thumbnail_url: string | null;
  alt_text: string | null;
  caption: string | null;
  attribution: string | null;
  taken_at: string | null;
  storyteller_id: string | null;
  slot: string | null;
}

const base = () => process.env.EL_V2_API_URL?.replace(/\/$/, '');
const key = () => process.env.EL_V2_API_KEY;

async function call<T>(path: string): Promise<T | null> {
  const b = base();
  const k = key();
  if (!b || !k) return null;
  const controller = new AbortController();
  const timer = setTimeout(() => controller.abort(), 15_000);
  try {
    const res = await fetch(`${b}${path}`, {
      headers: { 'x-picc-api-key': k },
      cache: 'no-store',
      signal: controller.signal,
    });
    if (!res.ok) return null;
    return (await res.json()) as T;
  } catch {
    return null;
  } finally {
    clearTimeout(timer);
  }
}

export async function getPhotoForSlot(slot: string): Promise<ELPhoto | null> {
  const r = await call<{ hero: ELPhoto | null }>(`/api/photos?slot=${encodeURIComponent(slot)}`);
  return r?.hero ?? null;
}

export async function getPhotosForSlot(slot: string, limit = 20): Promise<ELPhoto[]> {
  const r = await call<{ photos: ELPhoto[] }>(
    `/api/photos?slot=${encodeURIComponent(slot)}&limit=${limit}`,
  );
  return r?.photos ?? [];
}

export async function getPhotosBySlot(): Promise<Record<string, ELPhoto[]>> {
  const r = await call<{ bySlot: Record<string, ELPhoto[]> }>(`/api/photos?limit=200`);
  return r?.bySlot ?? {};
}

// ─────────────────────────────────────────────────────────────────────
// Service photos — convention: tag with `picc:slot:service-<slug>` in
// EL v2 admin (/admin/photos), then PICC fetches per service. First
// photo becomes hero/cover, rest fill the gallery.
// ─────────────────────────────────────────────────────────────────────

export interface ServicePhotos {
  /** Hero / cover — first photo tagged for this service. */
  hero: ELPhoto | null;
  /** Remaining photos for the gallery (cover excluded). */
  gallery: ELPhoto[];
  /** All photos including the cover. */
  all: ELPhoto[];
}

/**
 * Pull every photo tagged for a given PICC service slug. Convention:
 *   tag = `picc:slot:service-<slug>` in EL v2 admin.
 *
 * Returns hero (first) + gallery (rest) split, plus `all` for callers
 * that want the full strip.
 */
export async function getPhotosForService(slug: string, limit = 24): Promise<ServicePhotos> {
  const all = await getPhotosForSlot(`service-${slug}`, limit);
  return {
    hero: all[0] ?? null,
    gallery: all.slice(1),
    all,
  };
}

// ─────────────────────────────────────────────────────────────────────
// Video overlays — EL v2 stores videos in media_assets too. Convention:
// `picc:slot:video-<scene>` for transition / overlay videos. The same
// /api/photos endpoint serves them (EL v2 doesn't differentiate by
// media_type at the slot level).
// ─────────────────────────────────────────────────────────────────────

export interface VideoOverlay {
  /** Direct CDN URL of the video file. */
  url: string;
  /** Optional poster / fallback still. */
  poster_url: string | null;
  /** Optional caption / overlay text. */
  caption: string | null;
  /** Aspect ratio hint (16:9, 1:1, 9:16). Defaults to 16:9 if absent. */
  aspect_ratio: string | null;
  /** Slot key it was tagged with. */
  slot: string;
}

/**
 * Pull a video overlay for a scene. Convention:
 *   tag = `picc:slot:video-<scene>` in EL v2 admin.
 *
 * Returns null if no video is tagged for that scene yet — caller can
 * fall back to a still or a coloured placeholder.
 */
export async function getVideoOverlay(scene: string): Promise<VideoOverlay | null> {
  const slot = `video-${scene}`;
  const photo = await getPhotoForSlot(slot);
  if (!photo) return null;
  return {
    url: photo.url,
    poster_url: photo.thumbnail_url,
    caption: photo.caption,
    // Aspect ratio isn't yet exposed on /api/photos; default to 16:9
    // and let callers override per slot if needed.
    aspect_ratio: '16:9',
    slot,
  };
}

// ─────────────────────────────────────────────────────────────────────
// Service-canonical photos — uses EL v2's service_galleries join (not
// the slot-tag mechanism). Endpoint:
//   GET /api/picc/services/<slug>/photos
// Returns photos linked to the service via gallery_media_associations.
// Cover photo is the gallery's is_cover_image=true row, or first.
// ─────────────────────────────────────────────────────────────────────

/**
 * Pull every photo linked to a PICC service via EL v2's
 * service_galleries → gallery_media_associations chain.
 *
 * This is the CANONICAL service-photo path (preferred over the
 * slot-tag approach in getPhotosForService). Falls back to the
 * slot-tag version if the service-galleries endpoint isn't deployed
 * yet on EL v2.
 */
export async function getCanonicalPhotosForService(
  slug: string,
  limit = 24,
): Promise<ServicePhotos> {
  const r = await call<{ hero: ELPhoto | null; gallery: ELPhoto[]; all: ELPhoto[] }>(
    `/api/picc/services/${encodeURIComponent(slug)}/photos?limit=${limit}`,
  );
  if (r) return { hero: r.hero, gallery: r.gallery, all: r.all };
  // Fallback to the slot-tag mechanism
  return getPhotosForService(slug, limit);
}

// ─────────────────────────────────────────────────────────────────────
// Storyteller (people) photos — via media_storytellers join table.
// Endpoint:
//   GET /api/picc/storytellers/<id>/photos
// Returns photos where the storyteller appears, consent-cleared.
// ─────────────────────────────────────────────────────────────────────

export async function getPhotosForStoryteller(
  storytellerId: string,
  limit = 12,
): Promise<ELPhoto[]> {
  const r = await call<{ photos: ELPhoto[] }>(
    `/api/picc/storytellers/${encodeURIComponent(storytellerId)}/photos?limit=${limit}`,
  );
  return r?.photos ?? [];
}

// ─────────────────────────────────────────────────────────────────────
// Priority photos — flagged is_featured=true on the EL v2 side.
// Editors star the GO-TO photos in /admin/photos and PICC pulls those
// when it needs a "best photo for this slot/service/person" pick.
//   GET /api/photos?priority=true
// ─────────────────────────────────────────────────────────────────────

export async function getPriorityPhotos(opts: { slot?: string; limit?: number } = {}): Promise<ELPhoto[]> {
  const params = new URLSearchParams();
  params.set('priority', 'true');
  if (opts.slot) params.set('slot', opts.slot);
  params.set('limit', String(opts.limit ?? 24));
  const r = await call<{ photos: ELPhoto[] }>(`/api/photos?${params.toString()}`);
  return r?.photos ?? [];
}

// ─────────────────────────────────────────────────────────────────────
// Storyteller connections — who has been named beside this person in
// the same photographs. Source: EL v2's public connections endpoint
// (no auth required, only public storytellers surface):
//   GET /api/public/storytellers/<id>/connections
// ─────────────────────────────────────────────────────────────────────

export interface ELConnection {
  storyteller_id: string
  display_name: string | null
  public_avatar_url: string | null
  organization_id: string | null
  shared_photos: number
}

export async function getStorytellerConnections(
  storytellerId: string,
): Promise<ELConnection[]> {
  const b = base()
  if (!b) return []
  const controller = new AbortController()
  const timer = setTimeout(() => controller.abort(), 15_000)
  try {
    const res = await fetch(`${b}/api/public/storytellers/${encodeURIComponent(storytellerId)}/connections`, {
      cache: 'no-store',
      signal: controller.signal,
    })
    if (!res.ok) return []
    const data = (await res.json()) as { connections?: ELConnection[] }
    return data.connections ?? []
  } catch {
    return []
  } finally {
    clearTimeout(timer)
  }
}
