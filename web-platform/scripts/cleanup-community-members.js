/**
 * Cleanup Script: Delete all "Community Member X" placeholder profiles
 *
 * This script removes all profiles with names like "Community Member 1", "Community Member 2", etc.
 * Run this BEFORE importing the new storytellers from CSV.
 *
 * Usage: node scripts/cleanup-community-members.js
 */

const { createClient } = require('@supabase/supabase-js');
require('dotenv').config({ path: '.env.local' });

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

if (!supabaseUrl || !supabaseServiceKey) {
  console.error('❌ Missing Supabase credentials in .env.local');
  process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseServiceKey);

async function cleanupCommunityMembers() {
  console.log('🔍 Finding Community Member profiles...\n');

  try {
    // Find all profiles that match "Community Member" pattern
    const { data: profiles, error: fetchError } = await supabase
      .from('profiles')
      .select('id, full_name, stories_contributed, interviews_completed')
      .like('full_name', 'Community Member%')
      .order('full_name');

    if (fetchError) {
      throw new Error(`Failed to fetch profiles: ${fetchError.message}`);
    }

    if (!profiles || profiles.length === 0) {
      console.log('✓ No Community Member profiles found. Nothing to clean up.');
      return;
    }

    console.log(`Found ${profiles.length} Community Member profiles:\n`);
    profiles.forEach((p, i) => {
      console.log(`  ${i + 1}. ${p.full_name} (ID: ${p.id})`);
      console.log(`     Stories: ${p.stories_contributed || 0}, Interviews: ${p.interviews_completed || 0}`);
    });

    console.log('\n⚠️  WARNING: This will DELETE all the profiles listed above.');
    console.log('⚠️  Related stories and interviews will also be deleted (cascade).\n');

    // In a real scenario, you'd want user confirmation here
    // For now, we'll proceed automatically

    console.log('🗑️  Deleting profiles...\n');

    const profileIds = profiles.map(p => p.id);

    // Delete all Community Member profiles
    // Note: CASCADE deletes will handle related records (stories, interviews, etc.)
    const { error: deleteError } = await supabase
      .from('profiles')
      .delete()
      .in('id', profileIds);

    if (deleteError) {
      throw new Error(`Failed to delete profiles: ${deleteError.message}`);
    }

    console.log(`✅ Successfully deleted ${profiles.length} Community Member profiles\n`);
    console.log('Next step: Run the import script to add new storytellers from CSV');

  } catch (error) {
    console.error('❌ Error:', error.message);
    process.exit(1);
  }
}

// Run the cleanup
cleanupCommunityMembers()
  .then(() => {
    console.log('\n✓ Cleanup complete');
    process.exit(0);
  })
  .catch((error) => {
    console.error('Fatal error:', error);
    process.exit(1);
  });
