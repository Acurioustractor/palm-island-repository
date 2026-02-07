import { config } from 'dotenv';
import { resolve } from 'path';
import { createClient } from '@supabase/supabase-js';

config({ path: resolve(process.cwd(), '.env.local') });

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
);

async function getStorytellers() {
  console.log('\n📊 COMPLETE STORYTELLING SYSTEM ANALYSIS');
  console.log('============================================================\n');

  // Get stories with their storyteller profiles
  console.log('📖 STORIES WITH STORYTELLERS:');
  console.log('------------------------------------------------------------');
  const { data: stories, error: storiesError } = await supabase
    .from('stories')
    .select(`
      id,
      title,
      story_type,
      storyteller_id,
      embedding,
      quality_score,
      engagement_score,
      views,
      shares,
      likes,
      contains_traditional_knowledge,
      elder_approval_given,
      cultural_sensitivity_level,
      storyteller:storyteller_id (
        id,
        full_name,
        preferred_name,
        is_elder,
        is_cultural_advisor,
        storyteller_type,
        stories_contributed,
        traditional_country,
        language_group
      )
    `)
    .order('created_at', { ascending: false });

  if (storiesError) {
    console.log('❌ Error:', storiesError.message);
  } else if (stories) {
    console.log(`\nTotal Stories: ${stories.length}`);
    console.log(`Stories with embeddings: ${stories.filter(s => s.embedding).length}`);
    console.log(`Stories with quality_score: ${stories.filter(s => s.quality_score).length}`);
    console.log(`Stories with engagement data: ${stories.filter(s => s.views || s.shares || s.likes).length}`);

    // Count unique storytellers
    const uniqueStorytellers = new Set(stories.map(s => s.storyteller_id).filter(Boolean));
    console.log(`\nUnique Storytellers: ${uniqueStorytellers.size}`);

    // Group by story type
    const typeCount: Record<string, number> = {};
    stories.forEach(s => {
      if (s.story_type) {
        typeCount[s.story_type] = (typeCount[s.story_type] || 0) + 1;
      }
    });
    console.log('\nStories by Type:');
    Object.entries(typeCount).forEach(([type, count]) => {
      console.log(`  - ${type}: ${count}`);
    });

    // Show sample stories with storyteller info
    console.log('\nSample Stories with Storyteller Info:');
    stories.slice(0, 10).forEach((story, i) => {
      console.log(`\n${i + 1}. ${story.title}`);
      console.log(`   Type: ${story.story_type || 'N/A'}`);
      console.log(`   Storyteller: ${story.storyteller?.preferred_name || story.storyteller?.full_name || 'N/A'}`);
      console.log(`   Is Elder: ${story.storyteller?.is_elder ? 'Yes' : 'No'}`);
      console.log(`   Traditional Knowledge: ${story.contains_traditional_knowledge ? 'Yes' : 'No'}`);
      console.log(`   Engagement: ${story.views || 0} views, ${story.shares || 0} shares, ${story.likes || 0} likes`);
    });
  }

  // Get all elders
  console.log('\n\n👴 ELDERS IN SYSTEM:');
  console.log('------------------------------------------------------------');
  const { data: elders, error: eldersError } = await supabase
    .from('profiles')
    .select('id, full_name, preferred_name, traditional_country, language_group, stories_contributed')
    .eq('is_elder', true);

  if (!eldersError && elders) {
    console.log(`Total Elders: ${elders.length}\n`);
    elders.forEach((elder, i) => {
      console.log(`${i + 1}. ${elder.preferred_name || elder.full_name}`);
      console.log(`   Traditional Country: ${elder.traditional_country || 'N/A'}`);
      console.log(`   Language Group: ${elder.language_group || 'N/A'}`);
      console.log(`   Stories: ${elder.stories_contributed || 0}`);
    });
  }

  // Get all cultural advisors
  console.log('\n\n🌟 CULTURAL ADVISORS:');
  console.log('------------------------------------------------------------');
  const { data: advisors, error: advisorsError } = await supabase
    .from('profiles')
    .select('id, full_name, preferred_name, can_share_traditional_knowledge')
    .eq('is_cultural_advisor', true);

  if (!advisorsError && advisors) {
    console.log(`Total Cultural Advisors: ${advisors.length}\n`);
    advisors.forEach((advisor, i) => {
      console.log(`${i + 1}. ${advisor.preferred_name || advisor.full_name}`);
      console.log(`   Can share traditional knowledge: ${advisor.can_share_traditional_knowledge ? 'Yes' : 'No'}`);
    });
  }

  // Get interviews with storytellers
  console.log('\n\n🎙️ INTERVIEWS WITH TRANSCRIPTS:');
  console.log('------------------------------------------------------------');
  const { data: interviews, error: interviewsError } = await supabase
    .from('interviews')
    .select(`
      id,
      interview_title,
      storyteller_id,
      raw_transcript,
      transcription_complete,
      key_themes,
      storyteller:storyteller_id (
        full_name,
        preferred_name,
        is_elder
      )
    `)
    .not('raw_transcript', 'is', null)
    .limit(10);

  if (!interviewsError && interviews) {
    console.log(`Total interviews with transcripts: ${interviews.length}`);
    console.log(`\nSample interviews:`);
    interviews.forEach((interview, i) => {
      console.log(`\n${i + 1}. ${interview.interview_title || 'Untitled Interview'}`);
      console.log(`   Storyteller: ${interview.storyteller?.preferred_name || interview.storyteller?.full_name || 'N/A'}`);
      console.log(`   Is Elder: ${interview.storyteller?.is_elder ? 'Yes' : 'No'}`);
      console.log(`   Has transcript: ${interview.raw_transcript ? 'Yes' : 'No'}`);
      console.log(`   Transcription complete: ${interview.transcription_complete ? 'Yes' : 'No'}`);
      console.log(`   Has themes: ${interview.key_themes ? 'Yes' : 'No'}`);
    });
  }

  console.log('\n\n✅ Analysis Complete\n');
}

getStorytellers().catch(err => {
  console.error('\n❌ ERROR:', err.message);
  console.error(err);
  process.exit(1);
});
