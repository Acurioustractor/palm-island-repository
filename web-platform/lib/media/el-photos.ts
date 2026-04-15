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
