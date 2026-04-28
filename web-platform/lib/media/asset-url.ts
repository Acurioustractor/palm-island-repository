/**
 * Central URL resolver for migrated static assets.
 *
 * Assets are being moved from public/ to Supabase Storage in phases.
 * Uncomment each prefix below as its directory is uploaded and verified.
 *
 * Usage:
 *   import { assetUrl } from '@/lib/media/asset-url';
 *   <img src={assetUrl('/hero-assets/clips/beach.jpg')} />
 */

const SUPABASE_URL = process.env.NEXT_PUBLIC_SUPABASE_URL;

/**
 * Map of public/ path prefixes → Supabase Storage bucket names.
 * Uncomment each line after the corresponding directory has been
 * uploaded to storage and verified working.
 */
const MIGRATED_PREFIXES: Record<string, string> = {
  // Phase 1: Documents (774MB)
  '/documents/': 'platform-documents',

  // Phase 2: Videos + Hero Assets (256MB)
  '/hero-assets/': 'platform-media',
  '/video/': 'platform-media',

  // Phase 3: Photo Archives (112MB)
  '/annual-report-photos/': 'platform-media',
  '/archive-photos/': 'platform-media',

  // Phase 4: Report Assets + Icons (14MB)
  '/report-assets/': 'platform-media',
  '/service-icons/': 'platform-media',
  '/icons/bespoke-white/': 'platform-icons',
  '/icons/bespoke/': 'platform-icons',

  // Phase 5: PICC bespoke iconography + infographics + motifs (~36MB PNG)
  // Uploaded 2026-04-28. Contents:
  //   /icons/picc/NN-name.png         — 10 SECTION room icons
  //   /icons/picc/infographics/*.png  — 8 infographic concept renders
  //   /icons/picc/motifs/*.png        — 5 ambient brand motifs
  '/icons/picc/': 'platform-icons',

  // Phase 5: PICC photo library (24MB JPG)
  // Uploaded 2026-04-28 from public/icons/picc/photos/. Subdirs:
  //   board/ · eoc/ (Elders on Country) · voices/ · feature-bwgcolman-healing/
  //   feature-first-1000-days/ · feature-beai/
  // Plus top-level cover candidates + leadership portraits.
  '/picc-photos/': 'platform-media',
};

/**
 * Resolve an asset path to its current URL.
 *
 * If the asset's directory has been migrated to Supabase Storage,
 * returns the storage URL. Otherwise returns the original path
 * (served from public/).
 *
 * @param path - Path starting with / (e.g. '/documents/annual-reports/2024.pdf')
 * @returns Full URL for migrated assets, or original path for local assets
 */
export function assetUrl(path: string): string {
  if (!SUPABASE_URL) return path;

  for (const [prefix, bucket] of Object.entries(MIGRATED_PREFIXES)) {
    if (path.startsWith(prefix)) {
      // Strip leading slash — storage paths don't use it
      const storagePath = path.slice(1);
      return `${SUPABASE_URL}/storage/v1/object/public/${bucket}/${storagePath}`;
    }
  }

  // Not yet migrated — serve from public/
  return path;
}
