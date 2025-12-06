#!/usr/bin/env tsx
/**
 * Verify Media Systems Integration
 *
 * Checks:
 * 1. Migration status (are new columns in media_files table?)
 * 2. Media count in database
 * 3. How many photos are already assigned to pages
 * 4. Suggestions for quick wins
 */

import { supabase, queries, verifyConnection } from './lib/supabase';

async function main() {
  console.log('\n🔍 VERIFYING MEDIA SYSTEMS INTEGRATION\n');
  console.log('='.repeat(60));

  // 0. Verify connection first
  console.log('\n📡 Step 0: Verifying Supabase connection...\n');
  const connected = await verifyConnection();
  if (!connected) {
    console.log('❌ Cannot connect to Supabase. Check your credentials.');
    process.exit(1);
  }

  // 1. Check if migration columns exist
  console.log('\n📊 Step 1: Checking database schema...\n');

  const { data: sampleMedia, error: schemaError } = await supabase
    .from('media_files')
    .select('id, page_context, page_section, display_order')
    .limit(1)
    .maybeSingle();

  if (schemaError) {
    console.log('❌ SCHEMA ERROR');
    console.log('   Error:', schemaError.message);
    console.log('\n📝 Action required:');
    console.log('   The new columns may not exist. Run migration:');
    console.log('   psql $DATABASE_URL -f lib/empathy-ledger/migrations/07_media_page_context.sql');
    return;
  }

  console.log('✅ MIGRATION COMPLETE');
  console.log('   New columns exist in media_files table');
  console.log('   - page_context ✓');
  console.log('   - page_section ✓');
  console.log('   - display_order ✓');

  // 2. Count total media
  console.log('\n📸 Step 2: Counting media files...\n');

  const totalMedia = await queries.getMediaCount();
  console.log(`✅ Total media files: ${totalMedia.toLocaleString()}`);

  // 3. Count by file type
  const { data: byType } = await supabase
    .from('media_files')
    .select('file_type')
    .is('deleted_at', null);

  if (byType) {
    const typeCounts = byType.reduce((acc: any, item: any) => {
      acc[item.file_type] = (acc[item.file_type] || 0) + 1;
      return acc;
    }, {});

    console.log('\n   By type:');
    Object.entries(typeCounts)
      .sort(([, a]: any, [, b]: any) => (b as number) - (a as number))
      .forEach(([type, count]) => {
        console.log(`   - ${type}: ${count}`);
      });
  }

  // 4. Check page assignments
  console.log('\n🔗 Step 3: Checking page assignments...\n');

  const { data: assigned } = await supabase
    .from('media_files')
    .select('page_context, page_section, id')
    .not('page_context', 'is', null)
    .is('deleted_at', null);

  if (assigned && assigned.length > 0) {
    const pageAssignments = assigned.reduce((acc: any, item: any) => {
      const key = `${item.page_context} > ${item.page_section || 'general'}`;
      acc[key] = (acc[key] || 0) + 1;
      return acc;
    }, {});

    console.log(`✅ ${assigned.length} media files assigned to pages:`);
    console.log('');
    Object.entries(pageAssignments)
      .sort(([, a]: any, [, b]: any) => (b as number) - (a as number))
      .forEach(([assignment, count]) => {
        console.log(`   - ${assignment}: ${count}`);
      });
  } else {
    console.log('⚠️  NO media assigned to pages yet');
    console.log(`   All ${totalMedia.toLocaleString()} photos are available for assignment!`);
  }

  // 5. Check for good hero candidates
  console.log('\n🌟 Step 4: Finding hero image candidates...\n');

  const { data: heroCandidates } = await supabase
    .from('media_files')
    .select('filename, title, tags, public_url, id')
    .eq('file_type', 'image')
    .contains('tags', ['aerial'])
    .is('deleted_at', null)
    .limit(5);

  const { data: landscapeCandidates } = await supabase
    .from('media_files')
    .select('filename, title, tags, public_url, id')
    .eq('file_type', 'image')
    .contains('tags', ['landscape'])
    .is('deleted_at', null)
    .limit(5);

  const candidates = [...(heroCandidates || []), ...(landscapeCandidates || [])];

  if (candidates.length > 0) {
    console.log(`✅ Found ${candidates.length} potential hero images:`);
    candidates.slice(0, 5).forEach((img: any, idx: number) => {
      console.log(`   ${idx + 1}. ${img.title || img.filename}`);
      if (img.tags) {
        console.log(`      Tags: ${img.tags.join(', ')}`);
      }
    });
  } else {
    console.log('⚠️  No obvious hero candidates found');
    console.log('   Tip: Tag photos with "aerial", "landscape", or "palm-island"');
  }

  // 6. Check collections
  console.log('\n📁 Step 5: Checking collections system...\n');

  const { data: collections } = await queries.getCollections();
  const { data: smartFolders } = await queries.getSmartFolders();

  console.log(`✅ Photo collections: ${collections?.length || 0}`);
  if (collections && collections.length > 0) {
    collections.slice(0, 5).forEach((col: any) => {
      console.log(`   - ${col.name} (${col.item_count || 0} items)`);
    });
  }

  console.log(`✅ Smart folders: ${smartFolders?.length || 0}`);
  if (smartFolders && smartFolders.length > 0) {
    smartFolders.slice(0, 5).forEach((folder: any) => {
      console.log(`   - ${folder.name}`);
    });
  }

  // 7. Check for media with good tags for auto-assignment
  console.log('\n🏷️  Step 6: Analyzing tags for smart assignment...\n');

  const tagSuggestions = [
    { tags: ['leadership', 'rachel-atkinson', 'board'], suggest: 'about > leadership' },
    { tags: ['health', 'clinic', 'healing'], suggest: 'about > services' },
    { tags: ['aerial', 'landscape'], suggest: 'home > hero' },
    { tags: ['community', 'event'], suggest: 'community > hero' },
    { tags: ['innovation', 'digital'], suggest: 'impact > innovation' },
  ];

  for (const { tags, suggest } of tagSuggestions) {
    const { count } = await supabase
      .from('media_files')
      .select('*', { count: 'exact', head: true })
      .overlaps('tags', tags)
      .is('deleted_at', null)
      .is('page_context', null);

    if (count && count > 0) {
      console.log(`   📌 ${count} photos with ${tags.join('/')} → ${suggest}`);
    }
  }

  // 8. Recommendations
  console.log('\n💡 RECOMMENDATIONS:\n');
  console.log('='.repeat(60));

  if (!assigned || assigned.length === 0) {
    console.log('\n🎯 QUICK WINS (Priority actions):');
    console.log('\n1️⃣  Assign Hero Images (15 minutes)');
    console.log('   Go to: /picc/media/gallery');
    console.log('   Search for: aerial OR landscape photos');
    console.log('   Edit and assign to:');
    console.log('     - Home page hero');
    console.log('     - About page hero');
    console.log('     - Impact page hero');
    console.log('     - Community page hero');

    console.log('\n2️⃣  Use the Admin Interface (/admin/media)');
    console.log('   - Filter by tags');
    console.log('   - Quick assign to pages');
    console.log('   - Set featured status');

    console.log('\n3️⃣  Verify on Public Pages');
    console.log('   Visit these URLs to check:');
    console.log('     - http://localhost:3000/');
    console.log('     - http://localhost:3000/about');
    console.log('     - http://localhost:3000/impact');
    console.log('     - http://localhost:3000/community');
  } else {
    console.log('\n✅ Great progress! You have ' + assigned.length + ' photos assigned.');
    console.log('\n📈 Next steps:');
    console.log('   - Continue assigning photos to fill all sections');
    console.log('   - Check public pages for any gaps');
    console.log('   - Consider creating smart folders for each page context');
  }

  console.log('\n📚 HELPFUL LINKS:');
  console.log('   PICC Media System:');
  console.log('   - Main hub: /picc/media');
  console.log('   - Gallery: /picc/media/gallery');
  console.log('   - Collections: /picc/media/collections');
  console.log('   - Smart Folders: /picc/media/smart-folders');
  console.log('   - Upload: /picc/media/upload');
  console.log('\n   Admin Tools:');
  console.log('   - Media Manager: /admin/media');
  console.log('\n   Documentation:');
  console.log('   - Integration Plan: MEDIA-SYSTEMS-INTEGRATION-PLAN.md');

  console.log('\n' + '='.repeat(60));
  console.log(`✅ Verification complete! (${totalMedia.toLocaleString()} media files ready)\n`);
}

main().catch(err => {
  console.error('\n❌ Error:', err.message);
  process.exit(1);
});
