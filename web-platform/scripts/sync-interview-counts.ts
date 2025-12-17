/**
 * Sync Interview Counts
 *
 * This script syncs the interviews_completed count on profiles
 * with the actual count of interviews in the interviews table.
 *
 * Run with: npx tsx scripts/sync-interview-counts.ts
 */

import { config } from 'dotenv';
import { resolve } from 'path';
import { createClient } from '@supabase/supabase-js';

config({ path: resolve(process.cwd(), '.env.local') });

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
);

async function syncInterviewCounts() {
  console.log('\n🔄 SYNC INTERVIEW COUNTS');
  console.log('============================================================\n');

  // First, let's see what interviews exist
  const { data: interviews, error: interviewError } = await supabase
    .from('interviews')
    .select('id, storyteller_id, interview_title, interview_date');

  if (interviewError) {
    console.error('❌ Error fetching interviews:', interviewError.message);
    console.log('\n   The interviews table may not exist or may not be accessible.');
    return;
  }

  console.log(`📊 Found ${interviews?.length || 0} total interviews\n`);

  if (!interviews || interviews.length === 0) {
    console.log('⚠️  No interviews found in the database.');
    console.log('   Interviews may need to be imported or created.');
    return;
  }

  // Group interviews by storyteller_id
  const countsByStoryteller: Record<string, number> = {};
  const interviewsByStoryteller: Record<string, any[]> = {};

  for (const interview of interviews) {
    if (interview.storyteller_id) {
      countsByStoryteller[interview.storyteller_id] = (countsByStoryteller[interview.storyteller_id] || 0) + 1;
      if (!interviewsByStoryteller[interview.storyteller_id]) {
        interviewsByStoryteller[interview.storyteller_id] = [];
      }
      interviewsByStoryteller[interview.storyteller_id].push(interview);
    }
  }

  const storytellerIds = Object.keys(countsByStoryteller);
  console.log(`👥 ${storytellerIds.length} storytellers have interviews\n`);

  // Get current profile counts
  const { data: profiles, error: profileError } = await supabase
    .from('profiles')
    .select('id, full_name, preferred_name, interviews_completed')
    .in('id', storytellerIds);

  if (profileError) {
    console.error('❌ Error fetching profiles:', profileError.message);
    return;
  }

  console.log('📋 Syncing counts:\n');

  let updated = 0;
  let alreadyCorrect = 0;

  for (const storytellerId of storytellerIds) {
    const actualCount = countsByStoryteller[storytellerId];
    const profile = profiles?.find(p => p.id === storytellerId);
    const currentCount = profile?.interviews_completed || 0;
    const name = profile?.preferred_name || profile?.full_name || 'Unknown';

    if (currentCount !== actualCount) {
      // Update the count
      const { error: updateError } = await supabase
        .from('profiles')
        .update({ interviews_completed: actualCount })
        .eq('id', storytellerId);

      if (updateError) {
        console.log(`   ❌ ${name}: Failed to update - ${updateError.message}`);
      } else {
        console.log(`   ✅ ${name}: ${currentCount} → ${actualCount}`);
        updated++;
      }
    } else {
      console.log(`   ✓ ${name}: ${actualCount} (already correct)`);
      alreadyCorrect++;
    }
  }

  console.log('\n============================================================');
  console.log('📊 SUMMARY');
  console.log('============================================================');
  console.log(`✅ Updated: ${updated}`);
  console.log(`✓ Already correct: ${alreadyCorrect}`);
  console.log(`📚 Total interviews: ${interviews.length}`);
  console.log(`👥 Storytellers with interviews: ${storytellerIds.length}\n`);

  // Show top storytellers by interview count
  const sortedStorytellers = Object.entries(countsByStoryteller)
    .sort(([, a], [, b]) => b - a)
    .slice(0, 10);

  if (sortedStorytellers.length > 0) {
    console.log('🏆 TOP STORYTELLERS BY INTERVIEWS:');
    for (const [id, count] of sortedStorytellers) {
      const profile = profiles?.find(p => p.id === id);
      const name = profile?.preferred_name || profile?.full_name || id;
      console.log(`   ${count} interviews: ${name}`);
    }
    console.log();
  }

  // Also reset profiles with interviews_completed > 0 but no actual interviews
  const { data: profilesWithCounts, error: checkError } = await supabase
    .from('profiles')
    .select('id, full_name, preferred_name, interviews_completed')
    .gt('interviews_completed', 0);

  if (!checkError && profilesWithCounts) {
    const orphanedCounts = profilesWithCounts.filter(p => !countsByStoryteller[p.id]);

    if (orphanedCounts.length > 0) {
      console.log(`⚠️  Found ${orphanedCounts.length} profiles with counts but no interviews:`);
      for (const profile of orphanedCounts) {
        const name = profile.preferred_name || profile.full_name;
        console.log(`   - ${name}: ${profile.interviews_completed} (resetting to 0)`);

        await supabase
          .from('profiles')
          .update({ interviews_completed: 0 })
          .eq('id', profile.id);
      }
      console.log();
    }
  }

  console.log('✅ Sync complete!\n');
}

syncInterviewCounts()
  .then(() => process.exit(0))
  .catch(err => {
    console.error('\n❌ FATAL ERROR:', err.message);
    process.exit(1);
  });
