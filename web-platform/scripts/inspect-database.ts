import { config } from 'dotenv';
import { resolve } from 'path';
import { createClient } from '@supabase/supabase-js';

// Load environment variables
config({ path: resolve(process.cwd(), '.env.local') });

if (!process.env.NEXT_PUBLIC_SUPABASE_URL || !process.env.SUPABASE_SERVICE_ROLE_KEY) {
  console.error('❌ Missing Supabase credentials in .env.local');
  console.error('NEXT_PUBLIC_SUPABASE_URL:', process.env.NEXT_PUBLIC_SUPABASE_URL ? 'Set' : 'Missing');
  console.error('SUPABASE_SERVICE_ROLE_KEY:', process.env.SUPABASE_SERVICE_ROLE_KEY ? 'Set' : 'Missing');
  process.exit(1);
}

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL,
  process.env.SUPABASE_SERVICE_ROLE_KEY
);

async function inspectDatabase() {
  console.log('🔍 INSPECTING ACTUAL SUPABASE DATABASE');
  console.log('============================================================\n');

  console.log('📋 CHECKING KEY TABLES:');
  console.log('------------------------------------------------------------');

  const tablesToCheck = [
    'stories',
    'profiles',
    'people',
    'storytellers',
    'interviews',
    'community_members',
    'users'
  ];

  for (const table of tablesToCheck) {
    const { count, error } = await supabase
      .from(table)
      .select('*', { count: 'exact', head: true });

    if (!error) {
      console.log(`✓ ${table.padEnd(25)} - ${count || 0} rows`);
    } else {
      console.log(`✗ ${table.padEnd(25)} - Table not found or error`);
    }
  }

  console.log('\n📖 STORIES TABLE DETAILS:');
  console.log('------------------------------------------------------------');
  const { data: storiesData, error: storiesError, count: storiesCount } = await supabase
    .from('stories')
    .select('*', { count: 'exact' })
    .limit(5);

  if (storiesError) {
    console.log('❌ Error:', storiesError.message);
  } else {
    console.log(`Total stories: ${storiesCount}`);
    if (storiesData && storiesData.length > 0) {
      console.log('\nColumns:', Object.keys(storiesData[0]).sort().join(', '));
      console.log('\nFirst 5 stories:');
      storiesData.forEach((story, i) => {
        console.log(`  ${i + 1}. ${story.title}`);
        console.log(`     ID: ${story.id}`);
        console.log(`     Storyteller ID: ${story.storyteller_id || 'None'}`);
        console.log(`     Story Type: ${story.story_type || 'None'}`);
        console.log(`     Has Embedding: ${story.embedding ? 'Yes' : 'No'}`);
        console.log('');
      });
    }
  }

  console.log('\n👥 PROFILES TABLE DETAILS:');
  console.log('------------------------------------------------------------');
  const { data: profilesData, error: profilesError, count: profilesCount } = await supabase
    .from('profiles')
    .select('*', { count: 'exact' })
    .limit(5);

  if (profilesError) {
    console.log('❌ Error:', profilesError.message);
  } else {
    console.log(`Total profiles: ${profilesCount}`);
    if (profilesData && profilesData.length > 0) {
      console.log('\nColumns:', Object.keys(profilesData[0]).sort().join(', '));
      console.log('\nFirst 5 profiles:');
      profilesData.forEach((profile, i) => {
        console.log(`  ${i + 1}. ${profile.full_name || profile.email || 'Unnamed'}`);
        console.log(`     ID: ${profile.id}`);
        console.log(`     Is Storyteller: ${profile.is_storyteller || 'N/A'}`);
        console.log(`     Is Elder: ${profile.is_elder || 'N/A'}`);
        console.log('');
      });

      // Count storytellers
      const { count: storytellerCount } = await supabase
        .from('profiles')
        .select('*', { count: 'exact', head: true })
        .eq('is_storyteller', true);

      console.log(`\n📊 Storytellers in profiles: ${storytellerCount || 0}`);

      // Count elders
      const { count: elderCount } = await supabase
        .from('profiles')
        .select('*', { count: 'exact', head: true })
        .eq('is_elder', true);

      console.log(`📊 Elders in profiles: ${elderCount || 0}`);
    }
  }

  console.log('\n🎙️ INTERVIEWS TABLE DETAILS:');
  console.log('------------------------------------------------------------');
  const { data: interviewsData, error: interviewsError, count: interviewsCount } = await supabase
    .from('interviews')
    .select('*', { count: 'exact' })
    .limit(5);

  if (interviewsError) {
    console.log('❌ Error:', interviewsError.message);
  } else {
    console.log(`Total interviews: ${interviewsCount}`);
    if (interviewsData && interviewsData.length > 0) {
      console.log('\nColumns:', Object.keys(interviewsData[0]).sort().join(', '));
      console.log('\nFirst 5 interviews:');
      interviewsData.forEach((interview, i) => {
        console.log(`  ${i + 1}. Interview ${interview.id.substring(0, 8)}...`);
        console.log(`     Interviewee ID: ${interview.interviewee_id || 'None'}`);
        console.log(`     Has raw transcript: ${interview.raw_transcript ? 'Yes' : 'No'}`);
        console.log(`     Has edited transcript: ${interview.edited_transcript ? 'Yes' : 'No'}`);
        console.log(`     Has themes: ${interview.themes_identified ? 'Yes' : 'No'}`);
        console.log('');
      });

      // Count interviews with transcripts
      const { count: withTranscripts } = await supabase
        .from('interviews')
        .select('*', { count: 'exact', head: true })
        .not('raw_transcript', 'is', null);

      console.log(`\n📊 Interviews with transcripts: ${withTranscripts || 0}`);
    }
  }

  console.log('\n✅ Database inspection complete\n');
}

inspectDatabase().catch(err => {
  console.error('\n❌ ERROR:', err.message);
  console.error(err);
  process.exit(1);
});
