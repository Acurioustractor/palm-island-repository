#!/usr/bin/env npx tsx
/**
 * Migrate static assets from public/ to Supabase Storage.
 *
 * Reusable for each migration phase. Uploads files, optionally registers
 * them in media_files for search/tagging.
 *
 * Usage:
 *   npx tsx scripts/migrate-assets-to-storage.ts \
 *     --source public/documents \
 *     --bucket platform-documents \
 *     --prefix documents \
 *     --dry-run
 *
 *   npx tsx scripts/migrate-assets-to-storage.ts \
 *     --source public/hero-assets \
 *     --bucket platform-media \
 *     --prefix hero-assets \
 *     --register-media
 *
 * Options:
 *   --source          Local directory to upload (relative to web-platform/)
 *   --bucket          Supabase Storage bucket name
 *   --prefix          Storage path prefix (usually matches dir name)
 *   --register-media  Also insert records into media_files table
 *   --dry-run         Show what would be uploaded without uploading
 *   --concurrency N   Parallel uploads (default: 5)
 */

import fs from 'fs';
import path from 'path';
import { createClient } from '@supabase/supabase-js';

// ── CLI args ──────────────────────────────────────────

function getArg(name: string): string | undefined {
  const idx = process.argv.indexOf(`--${name}`);
  if (idx === -1) return undefined;
  return process.argv[idx + 1];
}

const SOURCE = getArg('source');
const BUCKET = getArg('bucket');
const PREFIX = getArg('prefix');
const DRY_RUN = process.argv.includes('--dry-run');
const REGISTER_MEDIA = process.argv.includes('--register-media');
const CONCURRENCY = parseInt(getArg('concurrency') || '5', 10);

if (!SOURCE || !BUCKET || !PREFIX) {
  console.error('Usage: npx tsx scripts/migrate-assets-to-storage.ts --source <dir> --bucket <bucket> --prefix <prefix> [--register-media] [--dry-run]');
  process.exit(1);
}

const SUPABASE_URL = process.env.NEXT_PUBLIC_SUPABASE_URL;
const SUPABASE_KEY = process.env.SUPABASE_SERVICE_ROLE_KEY;

if (!SUPABASE_URL || !SUPABASE_KEY) {
  console.error('Missing NEXT_PUBLIC_SUPABASE_URL or SUPABASE_SERVICE_ROLE_KEY env vars');
  process.exit(1);
}

const supabase = createClient(SUPABASE_URL, SUPABASE_KEY, {
  auth: { autoRefreshToken: false, persistSession: false },
});

// ── MIME type detection ───────────────────────────────

const MIME_MAP: Record<string, string> = {
  '.jpg': 'image/jpeg',
  '.jpeg': 'image/jpeg',
  '.png': 'image/png',
  '.webp': 'image/webp',
  '.svg': 'image/svg+xml',
  '.mp4': 'video/mp4',
  '.webm': 'video/webm',
  '.pdf': 'application/pdf',
  '.gif': 'image/gif',
};

function getMimeType(filePath: string): string {
  const ext = path.extname(filePath).toLowerCase();
  return MIME_MAP[ext] || 'application/octet-stream';
}

// ── Recursive file listing ────────────────────────────

function listFiles(dir: string): string[] {
  const results: string[] = [];
  if (!fs.existsSync(dir)) return results;

  const entries = fs.readdirSync(dir, { withFileTypes: true });
  for (const entry of entries) {
    const fullPath = path.join(dir, entry.name);
    if (entry.isDirectory()) {
      results.push(...listFiles(fullPath));
    } else if (entry.isFile() && !entry.name.startsWith('.')) {
      results.push(fullPath);
    }
  }
  return results;
}

// ── Upload with concurrency control ───────────────────

async function uploadFile(localPath: string, storagePath: string): Promise<{ success: boolean; error?: string }> {
  const fileBuffer = fs.readFileSync(localPath);
  const contentType = getMimeType(localPath);

  const { error } = await supabase.storage
    .from(BUCKET)
    .upload(storagePath, fileBuffer, {
      contentType,
      upsert: true,
    });

  if (error) {
    return { success: false, error: error.message };
  }
  return { success: true };
}

async function processInBatches<T>(
  items: T[],
  concurrency: number,
  fn: (item: T) => Promise<void>
): Promise<void> {
  for (let i = 0; i < items.length; i += concurrency) {
    const batch = items.slice(i, i + concurrency);
    await Promise.all(batch.map(fn));
  }
}

// ── Main ──────────────────────────────────────────────

async function main() {
  const sourceDir = path.resolve(process.cwd(), SOURCE);

  if (!fs.existsSync(sourceDir)) {
    console.error(`Source directory not found: ${sourceDir}`);
    process.exit(1);
  }

  const files = listFiles(sourceDir);
  console.log(`\nMigrate assets to Supabase Storage${DRY_RUN ? ' (DRY RUN)' : ''}`);
  console.log(`  Source:  ${sourceDir}`);
  console.log(`  Bucket:  ${BUCKET}`);
  console.log(`  Prefix:  ${PREFIX}`);
  console.log(`  Files:   ${files.length}`);
  console.log(`  Register in media_files: ${REGISTER_MEDIA}`);
  console.log();

  if (files.length === 0) {
    console.log('No files found. Exiting.');
    return;
  }

  // Show size summary
  let totalBytes = 0;
  const extCounts: Record<string, number> = {};
  for (const f of files) {
    totalBytes += fs.statSync(f).size;
    const ext = path.extname(f).toLowerCase();
    extCounts[ext] = (extCounts[ext] || 0) + 1;
  }
  console.log(`  Total size: ${(totalBytes / 1024 / 1024).toFixed(1)} MB`);
  console.log(`  File types: ${Object.entries(extCounts).map(([ext, n]) => `${ext}(${n})`).join(', ')}`);
  console.log();

  if (DRY_RUN) {
    console.log('Sample files to upload:');
    for (const f of files.slice(0, 10)) {
      const relativePath = path.relative(sourceDir, f);
      const storagePath = `${PREFIX}/${relativePath}`;
      const size = (fs.statSync(f).size / 1024).toFixed(0);
      console.log(`  ${storagePath} (${size} KB)`);
    }
    if (files.length > 10) {
      console.log(`  ... and ${files.length - 10} more`);
    }
    console.log(`\nWould upload ${files.length} files (${(totalBytes / 1024 / 1024).toFixed(1)} MB). Run without --dry-run to execute.`);
    return;
  }

  // Upload files
  let uploaded = 0;
  let failed = 0;
  const failures: Array<{ path: string; error: string }> = [];

  await processInBatches(files, CONCURRENCY, async (localPath) => {
    const relativePath = path.relative(sourceDir, localPath);
    const storagePath = `${PREFIX}/${relativePath}`;

    const result = await uploadFile(localPath, storagePath);
    if (result.success) {
      uploaded++;
      if (uploaded % 10 === 0 || uploaded === files.length) {
        console.log(`  Uploaded ${uploaded}/${files.length} files`);
      }
    } else {
      failed++;
      failures.push({ path: storagePath, error: result.error || 'Unknown error' });
      console.error(`  FAILED: ${storagePath} — ${result.error}`);
    }
  });

  console.log(`\nUpload complete: ${uploaded} succeeded, ${failed} failed`);

  // Register in media_files if requested
  if (REGISTER_MEDIA && uploaded > 0) {
    console.log('\nRegistering in media_files...');
    const BATCH_SIZE = 50;
    let registered = 0;

    const mediaRecords = files
      .filter((f) => {
        const relativePath = path.relative(sourceDir, f);
        const storagePath = `${PREFIX}/${relativePath}`;
        return !failures.some((fail) => fail.path === storagePath);
      })
      .map((f) => {
        const relativePath = path.relative(sourceDir, f);
        const fileName = path.basename(f);
        const storagePath = `${PREFIX}/${relativePath}`;
        const publicUrl = `${SUPABASE_URL}/storage/v1/object/public/${BUCKET}/${storagePath}`;
        const mime = getMimeType(f);
        const fileType = mime.startsWith('video/') ? 'video' : mime === 'application/pdf' ? 'document' : 'image';

        return {
          file_name: fileName,
          storage_url: publicUrl,
          public_url: publicUrl,
          file_type: fileType,
          media_type: mime,
          source: `migration-${PREFIX}`,
          tags: [PREFIX.split('/')[0]],
          is_public: true,
          is_featured: false,
        };
      });

    for (let i = 0; i < mediaRecords.length; i += BATCH_SIZE) {
      const batch = mediaRecords.slice(i, i + BATCH_SIZE);
      const { error } = await supabase.from('media_files').upsert(batch, {
        onConflict: 'file_name',
        ignoreDuplicates: true,
      });
      if (error) {
        console.error(`  Batch ${Math.floor(i / BATCH_SIZE) + 1} failed: ${error.message}`);
      } else {
        registered += batch.length;
        console.log(`  Registered ${registered}/${mediaRecords.length}`);
      }
    }
    console.log(`Registered ${registered} records in media_files`);
  }

  // Summary
  if (failures.length > 0) {
    console.log('\nFailed uploads:');
    for (const f of failures) {
      console.log(`  ${f.path}: ${f.error}`);
    }
  }

  console.log('\nDone!');
}

main().catch((err) => {
  console.error('Fatal error:', err);
  process.exit(1);
});
