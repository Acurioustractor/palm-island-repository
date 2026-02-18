/**
 * Backfill GPS coordinates for existing media_files by extracting EXIF data.
 *
 * Usage:
 *   npx tsx scripts/backfill-exif-gps.ts           # dry-run (shows what would be updated)
 *   npx tsx scripts/backfill-exif-gps.ts --apply    # actually update records
 */

import { createClient } from '@supabase/supabase-js';
import { extractGpsFromBuffer } from '../lib/media/extract-exif';
import { resolve } from 'path';
import { config } from 'dotenv';

config({ path: resolve(__dirname, '../.env.local') });

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

async function main() {
  console.log(dryRun ? '=== DRY RUN (pass --apply to update) ===' : '=== APPLYING UPDATES ===');

  // Fetch images without GPS data
  const { data: images, error } = await supabase
    .from('media_files')
    .select('id, filename, original_filename, public_url, bucket_name')
    .eq('file_type', 'image')
    .is('latitude', null)
    .is('deleted_at', null)
    .order('created_at', { ascending: false })
    .limit(500);

  if (error) {
    console.error('Failed to query media_files:', error.message);
    process.exit(1);
  }

  console.log(`Found ${images.length} images without GPS data\n`);

  let updated = 0;
  let skipped = 0;
  let failed = 0;

  for (const img of images) {
    const storagePath = img.file_path || img.filename;
    const bucket = img.bucket_name || 'story-media';

    try {
      // Download from Supabase storage
      const { data: blob, error: dlError } = await supabase.storage
        .from(bucket)
        .download(storagePath);

      if (dlError || !blob) {
        console.log(`  SKIP ${img.original_filename || storagePath} — download failed: ${dlError?.message}`);
        skipped++;
        continue;
      }

      const buffer = Buffer.from(await blob.arrayBuffer());
      const gps = await extractGpsFromBuffer(buffer);

      if (!gps) {
        skipped++;
        continue;
      }

      console.log(`  GPS  ${img.original_filename || storagePath} → ${gps.latitude.toFixed(6)}, ${gps.longitude.toFixed(6)}`);

      if (!dryRun) {
        const { error: updateError } = await supabase
          .from('media_files')
          .update({ latitude: gps.latitude, longitude: gps.longitude })
          .eq('id', img.id);

        if (updateError) {
          console.log(`  FAIL update: ${updateError.message}`);
          failed++;
          continue;
        }
      }

      updated++;
    } catch (err: any) {
      console.log(`  ERR  ${img.original_filename || storagePath}: ${err.message}`);
      failed++;
    }
  }

  console.log(`\n--- Summary ---`);
  console.log(`Total scanned: ${images.length}`);
  console.log(`With GPS:      ${updated}`);
  console.log(`No GPS:        ${skipped}`);
  console.log(`Errors:        ${failed}`);
  if (dryRun) console.log(`\nRun with --apply to actually update records.`);
}

main().catch((err) => {
  console.error('Fatal:', err);
  process.exit(1);
});
