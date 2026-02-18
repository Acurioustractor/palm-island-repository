/**
 * Update service coordinates from geotagged photos.
 *
 * For each service, finds all photos tagged with service:{slug} that have GPS coords,
 * computes the centroid, and updates organization_services.metadata.
 *
 * Usage:
 *   npx tsx scripts/update-service-coords-from-photos.ts           # dry-run
 *   npx tsx scripts/update-service-coords-from-photos.ts --apply    # apply updates
 */

import { createClient } from '@supabase/supabase-js';

const SUPABASE_URL = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const SUPABASE_KEY = process.env.SUPABASE_SERVICE_ROLE_KEY!;

if (!SUPABASE_URL || !SUPABASE_KEY) {
  console.error('Missing NEXT_PUBLIC_SUPABASE_URL or SUPABASE_SERVICE_ROLE_KEY');
  process.exit(1);
}

const supabase = createClient(SUPABASE_URL, SUPABASE_KEY, {
  auth: { autoRefreshToken: false, persistSession: false },
});

const dryRun = !process.argv.includes('--apply');

// Palm Island bounds for sanity check
const BOUNDS = {
  latMin: -18.76,
  latMax: -18.70,
  lngMin: 146.55,
  lngMax: 146.62,
};

function inBounds(lat: number, lng: number): boolean {
  return (
    lat >= BOUNDS.latMin &&
    lat <= BOUNDS.latMax &&
    lng >= BOUNDS.lngMin &&
    lng <= BOUNDS.lngMax
  );
}

async function main() {
  console.log(dryRun ? '=== DRY RUN (pass --apply to update) ===' : '=== APPLYING UPDATES ===\n');

  // Fetch all active services
  const { data: services, error } = await supabase
    .from('organization_services')
    .select('id, name, slug, metadata')
    .eq('is_active', true)
    .order('name');

  if (error || !services) {
    console.error('Failed to fetch services:', error?.message);
    process.exit(1);
  }

  let updated = 0;
  let skipped = 0;

  for (const service of services) {
    const tag = `service:${service.slug}`;

    // Find geotagged photos for this service
    const { data: photos } = await supabase
      .from('media_files')
      .select('latitude, longitude, original_filename')
      .eq('file_type', 'image')
      .is('deleted_at', null)
      .overlaps('tags', [tag])
      .not('latitude', 'is', null)
      .not('longitude', 'is', null)
      .limit(50);

    if (!photos || photos.length === 0) {
      console.log(`  ${service.name} — no geotagged photos, skipping`);
      skipped++;
      continue;
    }

    // Compute centroid
    const sumLat = photos.reduce((acc, p) => acc + p.latitude, 0);
    const sumLng = photos.reduce((acc, p) => acc + p.longitude, 0);
    const avgLat = sumLat / photos.length;
    const avgLng = sumLng / photos.length;

    // Current coords
    const oldLat = Number(service.metadata?.latitude ?? service.metadata?.lat);
    const oldLng = Number(service.metadata?.longitude ?? service.metadata?.lng);
    const hasOld = Number.isFinite(oldLat) && Number.isFinite(oldLng);

    if (!inBounds(avgLat, avgLng)) {
      console.log(`  ${service.name} — centroid ${avgLat.toFixed(6)}, ${avgLng.toFixed(6)} OUT OF BOUNDS, skipping`);
      skipped++;
      continue;
    }

    console.log(`  ${service.name} (${photos.length} photos)`);
    if (hasOld) {
      console.log(`    OLD: ${oldLat.toFixed(6)}, ${oldLng.toFixed(6)}`);
    }
    console.log(`    NEW: ${avgLat.toFixed(6)}, ${avgLng.toFixed(6)}`);

    if (!dryRun) {
      const newMetadata = {
        ...(service.metadata || {}),
        latitude: avgLat,
        longitude: avgLng,
      };

      const { error: updateError } = await supabase
        .from('organization_services')
        .update({ metadata: newMetadata })
        .eq('id', service.id);

      if (updateError) {
        console.log(`    FAIL: ${updateError.message}`);
        continue;
      }
      console.log(`    UPDATED`);
    }

    updated++;
  }

  console.log(`\n--- Summary ---`);
  console.log(`Services:  ${services.length}`);
  console.log(`Updated:   ${updated}`);
  console.log(`Skipped:   ${skipped}`);
  if (dryRun) console.log(`\nRun with --apply to actually update.`);
}

main().catch((err) => {
  console.error('Fatal:', err);
  process.exit(1);
});
