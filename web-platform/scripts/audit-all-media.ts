/**
 * Full Media Audit
 * Categorize every image in media_files as: real photo, pdf-extract-useful,
 * pdf-extract-junk, page-render, profile-photo, or unknown.
 *
 * Outputs a summary + writes a JSON manifest for cleanup.
 *
 * Usage:
 *   npx tsx scripts/audit-all-media.ts
 *   npx tsx scripts/audit-all-media.ts --tag-junk --execute   # Tag junk as needs-review
 */

import { createClient } from '@supabase/supabase-js';
import * as dotenv from 'dotenv';
import { resolve } from 'path';
import { writeFileSync } from 'fs';

dotenv.config({ path: resolve(__dirname, '../.env.local') });

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL as string,
  process.env.SUPABASE_SERVICE_ROLE_KEY as string
);

const TAG_JUNK = process.argv.includes('--tag-junk');
const EXECUTE = process.argv.includes('--execute');

// Minimum dimensions to be considered a "real" useful photo
const MIN_USEFUL_WIDTH = 400;
const MIN_USEFUL_HEIGHT = 300;
const MIN_USEFUL_PIXELS = 200000; // ~450x450

type Category =
  | 'real-photo-professional'  // From photo shoots, events
  | 'real-photo-website'       // From PICC website scrape
  | 'real-photo-upload'        // User uploads with decent size
  | 'profile-photo'            // Storyteller/staff profiles
  | 'pdf-useful'               // PDF extract but decent size, likely a real photo
  | 'pdf-junk'                 // PDF extract, tiny or page render
  | 'page-render'              // Full page renders from annual reports
  | 'annual-report-cover'      // Report cover pages
  | 'video'                    // Video files
  | 'unknown';                 // Can't categorize

interface AuditResult {
  id: string;
  title: string | null;
  category: Category;
  width: number | null;
  height: number | null;
  pixels: number;
  tags: string[];
  page_context: string | null;
  page_section: string | null;
  public_url: string;
  reason: string;
}

function categorize(m: any): { category: Category; reason: string } {
  const tags: string[] = m.tags || [];
  const title: string = (m.title || '').toLowerCase();
  const w = m.width || 0;
  const h = m.height || 0;
  const pixels = w * h;

  // Videos
  if (m.file_type === 'video') {
    return { category: 'video', reason: 'video file' };
  }

  // Profile photos
  if (tags.includes('profile-image') || title.startsWith('profile photo')) {
    return { category: 'profile-photo', reason: 'profile image tag/title' };
  }

  // Professional event photos (no pdf-extract tag)
  if (tags.includes('professional-photography') || tags.includes('event:photo-shoot-oct-2025')) {
    return { category: 'real-photo-professional', reason: 'professional photography' };
  }
  if (tags.includes('event:community-visit-jun-2025')) {
    return { category: 'real-photo-professional', reason: 'community visit photos' };
  }
  if (tags.includes('event:spring-festival-2025') || tags.includes('photobooth')) {
    return { category: 'real-photo-professional', reason: 'spring festival / photobooth' };
  }
  if (tags.includes('event:elders-conference')) {
    return { category: 'real-photo-professional', reason: 'elders conference' };
  }
  if (tags.includes('event:daycare-opening-2025')) {
    return { category: 'real-photo-professional', reason: 'daycare opening' };
  }

  // PICC website photos
  if (tags.includes('source:picc-website') || title.includes('picc services & people')) {
    return { category: 'real-photo-website', reason: 'from PICC website' };
  }

  // Annual report covers
  if (tags.includes('section:cover') || (tags.includes('page-1') && tags.includes('annual-report'))) {
    return { category: 'annual-report-cover', reason: 'report cover page' };
  }

  // Page renders (full page images from PDFs)
  if (tags.includes('page-render')) {
    return { category: 'page-render', reason: 'page-render tag' };
  }

  // PDF extracts — check if they're useful photos or junk
  if (tags.includes('pdf-extract')) {
    // Check dimensions
    if (pixels === 0) {
      // No dimensions recorded — likely small/junk
      return { category: 'pdf-junk', reason: 'pdf-extract, no dimensions' };
    }
    if (pixels >= MIN_USEFUL_PIXELS && w >= MIN_USEFUL_WIDTH && h >= MIN_USEFUL_HEIGHT) {
      return { category: 'pdf-useful', reason: `pdf-extract but decent size (${w}x${h})` };
    }
    // Tiny images — logos, icons, decorative elements
    return { category: 'pdf-junk', reason: `pdf-extract, too small (${w}x${h} = ${pixels}px)` };
  }

  // Annual report tagged but not pdf-extract — likely data/chart renders
  if (tags.includes('annual-report') && (tags.includes('charts') || tags.includes('data') || tags.includes('section:statistics'))) {
    return { category: 'page-render', reason: 'annual report data/chart render' };
  }

  // Large user uploads without specific tags
  if (pixels >= MIN_USEFUL_PIXELS || (w === 0 && h === 0 && !tags.includes('pdf-extract'))) {
    // No dimensions but not pdf-extract — could be a real upload
    if (title.includes('img_') || title.includes('img-') || title.match(/\d{8}-/)) {
      return { category: 'real-photo-upload', reason: 'camera filename pattern' };
    }
    if (pixels >= MIN_USEFUL_PIXELS) {
      return { category: 'real-photo-upload', reason: `decent size (${w}x${h})` };
    }
  }

  return { category: 'unknown', reason: 'could not categorize' };
}

async function main() {
  console.log('=== FULL MEDIA AUDIT ===\n');

  // Paginate to get ALL media (Supabase limits to 1000 per request)
  const allMedia: any[] = [];
  let offset = 0;
  const PAGE_SIZE = 1000;
  while (true) {
    const { data, error: pageErr } = await supabase
      .from('media_files')
      .select('id, title, file_type, tags, width, height, page_context, page_section, public_url, created_at')
      .is('deleted_at', null)
      .order('created_at', { ascending: false })
      .range(offset, offset + PAGE_SIZE - 1);

    if (pageErr) {
      console.error('Error fetching page:', pageErr);
      break;
    }
    if (!data || data.length === 0) break;
    allMedia.push(...data);
    console.log(`  Fetched ${allMedia.length} media files...`);
    if (data.length < PAGE_SIZE) break;
    offset += PAGE_SIZE;
  }
  const error = null;

  if (error) {
    console.error('Error:', error);
    return;
  }

  const results: AuditResult[] = [];
  const categoryCounts: Record<string, number> = {};

  for (const m of allMedia || []) {
    const { category, reason } = categorize(m);
    categoryCounts[category] = (categoryCounts[category] || 0) + 1;

    results.push({
      id: m.id,
      title: m.title,
      category,
      width: m.width,
      height: m.height,
      pixels: (m.width || 0) * (m.height || 0),
      tags: m.tags || [],
      page_context: m.page_context,
      page_section: m.page_section,
      public_url: m.public_url,
      reason,
    });
  }

  // Print summary
  console.log('--- Category Breakdown ---');
  const order: Category[] = [
    'real-photo-professional', 'real-photo-website', 'real-photo-upload',
    'profile-photo', 'pdf-useful', 'annual-report-cover',
    'page-render', 'pdf-junk', 'video', 'unknown'
  ];
  for (const cat of order) {
    const count = categoryCounts[cat] || 0;
    const pct = ((count / results.length) * 100).toFixed(1);
    const icon = ['real-photo-professional', 'real-photo-website', 'real-photo-upload'].includes(cat) ? ' KEEP'
      : ['pdf-junk', 'page-render'].includes(cat) ? ' JUNK'
      : '     ';
    console.log(`  ${icon} ${cat.padEnd(28)} ${String(count).padStart(4)} (${pct}%)`);
  }
  console.log(`  ${''.padEnd(5)} ${'TOTAL'.padEnd(28)} ${String(results.length).padStart(4)}`);

  // Real photos breakdown
  const realPhotos = results.filter(r =>
    r.category.startsWith('real-photo') || r.category === 'profile-photo'
  );
  const junk = results.filter(r =>
    r.category === 'pdf-junk' || r.category === 'page-render'
  );
  const useful = results.filter(r =>
    !['pdf-junk', 'page-render'].includes(r.category)
  );

  console.log(`\n--- Summary ---`);
  console.log(`  Real photos:     ${realPhotos.length}`);
  console.log(`  Useful total:    ${useful.length}`);
  console.log(`  Junk (hide):     ${junk.length}`);

  // Show junk samples
  console.log(`\n--- Sample Junk (first 10) ---`);
  for (const j of junk.slice(0, 10)) {
    console.log(`  [${j.id.slice(0, 8)}] "${(j.title || '').substring(0, 50)}" ${j.width}x${j.height} — ${j.reason}`);
  }

  // Proposed smart folders from real photos
  console.log(`\n--- Proposed Smart Folders ---`);
  const folderMap: Record<string, number> = {};

  for (const r of realPhotos) {
    // Assign to folder based on event tag or source
    const eventTag = r.tags.find(t => t.startsWith('event:'));
    if (eventTag) {
      folderMap[eventTag] = (folderMap[eventTag] || 0) + 1;
    } else if (r.category === 'real-photo-website') {
      folderMap['source:picc-website'] = (folderMap['source:picc-website'] || 0) + 1;
    } else if (r.category === 'profile-photo') {
      folderMap['profiles'] = (folderMap['profiles'] || 0) + 1;
    } else {
      folderMap['uncategorized'] = (folderMap['uncategorized'] || 0) + 1;
    }
  }

  for (const [folder, count] of Object.entries(folderMap).sort((a, b) => b[1] - a[1])) {
    console.log(`  ${folder}: ${count} photos`);
  }

  // PDF useful photos — could be rescued
  const pdfUseful = results.filter(r => r.category === 'pdf-useful');
  console.log(`\n--- PDF Extracts Worth Keeping (${pdfUseful.length}) ---`);
  // Group by fiscal year
  const byFy: Record<string, number> = {};
  for (const p of pdfUseful) {
    const fy = p.tags.find(t => t.startsWith('fy:')) || 'unknown';
    byFy[fy] = (byFy[fy] || 0) + 1;
  }
  for (const [fy, count] of Object.entries(byFy).sort()) {
    console.log(`  ${fy}: ${count} usable photos`);
  }

  // Write manifest
  const manifest = {
    audited_at: new Date().toISOString(),
    total: results.length,
    categories: categoryCounts,
    junk_ids: junk.map(j => j.id),
    useful_ids: useful.map(u => u.id),
    real_photo_ids: realPhotos.map(r => r.id),
    proposed_folders: folderMap,
  };

  const manifestPath = resolve(__dirname, '../.audit-manifest.json');
  writeFileSync(manifestPath, JSON.stringify(manifest, null, 2));
  console.log(`\nManifest written to ${manifestPath}`);

  // Tag junk if requested
  if (TAG_JUNK) {
    console.log(`\n--- Tagging ${junk.length} junk items ---`);
    if (!EXECUTE) {
      console.log('  [DRY RUN] Would add "audit:junk" tag to all junk. Pass --execute to apply.');
    } else {
      let tagged = 0;
      for (const j of junk) {
        const newTags = [...new Set([...j.tags, 'audit:junk'])];
        const { error: tagErr } = await supabase
          .from('media_files')
          .update({ tags: newTags })
          .eq('id', j.id);
        if (!tagErr) tagged++;
      }
      console.log(`  Tagged ${tagged}/${junk.length} items with "audit:junk"`);
    }
  }
}

main().catch(console.error);
