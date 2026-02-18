/**
 * Media Inventory Script
 * Read-only audit of media_files table — shows what exists, what's assigned, and what's unassigned.
 *
 * Usage:
 *   npx tsx scripts/media-inventory.ts
 */

import { createClient } from '@supabase/supabase-js';
import * as dotenv from 'dotenv';
import { resolve } from 'path';

dotenv.config({ path: resolve(__dirname, '../.env.local') });

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
);

async function runInventory() {
  console.log('=== MEDIA INVENTORY ===\n');

  // 1. Total media by file type
  console.log('--- Total Media by File Type ---');
  const { data: allMedia, error: allErr } = await supabase
    .from('media_files')
    .select('id, file_type, page_context, page_section, tags, title, public_url, is_featured, is_public, width, height')
    .is('deleted_at', null);

  if (allErr) {
    console.error('Error fetching media:', allErr);
    return;
  }

  const byType: Record<string, number> = {};
  for (const m of allMedia || []) {
    byType[m.file_type] = (byType[m.file_type] || 0) + 1;
  }
  for (const [type, count] of Object.entries(byType)) {
    console.log(`  ${type}: ${count}`);
  }
  console.log(`  TOTAL: ${allMedia?.length || 0}\n`);

  // 2. Distinct page_context values already assigned
  console.log('--- Assigned Page Contexts ---');
  const assigned = (allMedia || []).filter(m => m.page_context);
  const contextCounts: Record<string, number> = {};
  for (const m of assigned) {
    const key = `${m.page_context}/${m.page_section || '(none)'}`;
    contextCounts[key] = (contextCounts[key] || 0) + 1;
  }
  if (Object.keys(contextCounts).length === 0) {
    console.log('  (no media has page_context assigned)');
  } else {
    for (const [ctx, count] of Object.entries(contextCounts).sort()) {
      console.log(`  ${ctx}: ${count}`);
    }
  }
  console.log(`  Total assigned: ${assigned.length}\n`);

  // 3. Distinct tags
  console.log('--- All Tags (with counts) ---');
  const tagCounts: Record<string, number> = {};
  for (const m of allMedia || []) {
    if (m.tags && Array.isArray(m.tags)) {
      for (const tag of m.tags) {
        tagCounts[tag] = (tagCounts[tag] || 0) + 1;
      }
    }
  }
  if (Object.keys(tagCounts).length === 0) {
    console.log('  (no tags found)');
  } else {
    for (const [tag, count] of Object.entries(tagCounts).sort((a, b) => b[1] - a[1])) {
      console.log(`  ${tag}: ${count}`);
    }
  }
  console.log();

  // 4. Unassigned images (page_context IS NULL) grouped by tags
  console.log('--- Unassigned Images (no page_context) ---');
  const unassignedImages = (allMedia || []).filter(
    m => !m.page_context && m.file_type === 'image'
  );
  console.log(`  Total unassigned images: ${unassignedImages.length}`);

  const unassignedByTag: Record<string, number> = {};
  let untaggedCount = 0;
  for (const m of unassignedImages) {
    if (m.tags && Array.isArray(m.tags) && m.tags.length > 0) {
      for (const tag of m.tags) {
        unassignedByTag[tag] = (unassignedByTag[tag] || 0) + 1;
      }
    } else {
      untaggedCount++;
    }
  }
  if (Object.keys(unassignedByTag).length > 0) {
    console.log('  By tag:');
    for (const [tag, count] of Object.entries(unassignedByTag).sort((a, b) => b[1] - a[1])) {
      console.log(`    ${tag}: ${count}`);
    }
  }
  if (untaggedCount > 0) {
    console.log(`  Untagged: ${untaggedCount}`);
  }
  console.log();

  // 5. Images with service tags
  console.log('--- Images with service:* Tags ---');
  const serviceTags = Object.entries(tagCounts)
    .filter(([tag]) => tag.startsWith('service:'))
    .sort((a, b) => b[1] - a[1]);
  if (serviceTags.length === 0) {
    console.log('  (no service-tagged media found)');
  } else {
    for (const [tag, count] of serviceTags) {
      console.log(`  ${tag}: ${count}`);
    }
  }
  console.log();

  // 6. Page gap analysis
  console.log('--- Page Gap Analysis ---');
  const requiredSlots = [
    { context: 'home', section: 'hero', needed: 1 },
    { context: 'home', section: 'gallery', needed: 8 },
    { context: 'about', section: 'hero', needed: 1 },
    { context: 'about', section: 'vision', needed: 1 },
    { context: 'about', section: 'leadership', needed: 7 },
    { context: 'about', section: 'timeline', needed: 6 },
    { context: 'about', section: 'services', needed: 7 },
    { context: 'about', section: 'testimonials', needed: 4 },
    { context: 'stories', section: 'hero', needed: 1 },
    { context: 'community', section: 'hero', needed: 1 },
    { context: 'community', section: 'programs', needed: 3 },
    { context: 'community', section: 'storytellers', needed: 1 },
  ];

  for (const slot of requiredSlots) {
    const key = `${slot.context}/${slot.section}`;
    const filled = contextCounts[key] || 0;
    const status = filled >= slot.needed ? 'OK' : `NEED ${slot.needed - filled} more`;
    console.log(`  ${key}: ${filled}/${slot.needed} — ${status}`);
  }
  console.log();

  // 7. Sample unassigned images (first 10)
  console.log('--- Sample Unassigned Images (first 10) ---');
  for (const m of unassignedImages.slice(0, 10)) {
    console.log(`  [${m.id.slice(0, 8)}] "${m.title || m.public_url?.split('/').pop()}" tags=${JSON.stringify(m.tags || [])} ${m.width ? `${m.width}x${m.height}` : ''}`);
  }

  console.log('\n=== INVENTORY COMPLETE ===');
}

runInventory().catch(console.error);
