/**
 * Find good candidates for featured stories
 * - Elder stories
 * - Different storytellers
 * - High quality content
 */

import { createClient } from '@supabase/supabase-js';
import * as dotenv from 'dotenv';
import * as path from 'path';

dotenv.config({ path: path.resolve(process.cwd(), '.env.local') });

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!;

const supabase = createClient(supabaseUrl, supabaseKey);

async function findCandidates() {
  console.log('\n=== FINDING FEATURED STORY CANDIDATES ===\n');

  // Get all public stories with storyteller info
  const { data: stories, error } = await supabase
    .from('stories')
    .select(`
      id,
      title,
      is_featured,
      is_public,
      storyteller:storyteller_id (
        id,
        full_name,
        preferred_name,
        is_elder,
        profile_image_url
      )
    `)
    .eq('is_public', true)
    .order('created_at', { ascending: false })
    .limit(50);

  if (error) {
    console.error('Error:', error);
    return;
  }

  console.log(`Found ${stories?.length || 0} public stories\n`);

  // Filter for elder stories not yet featured
  const elderStories = stories?.filter(s =>
    s.storyteller?.is_elder === true && s.is_featured !== true
  );

  console.log('=== ELDER STORIES (Not yet featured) ===\n');
  elderStories?.slice(0, 5).forEach((story, i) => {
    console.log(`${i + 1}. "${story.title}"`);
    console.log(`   ID: ${story.id}`);
    console.log(`   Storyteller: ${story.storyteller?.preferred_name || story.storyteller?.full_name}`);
    console.log(`   Has profile image: ${story.storyteller?.profile_image_url ? 'YES' : 'NO'}`);
    console.log('');
  });

  // Group stories by storyteller
  const storytellerMap = new Map();
  stories?.forEach(story => {
    const storytellerId = story.storyteller?.id;
    if (storytellerId) {
      if (!storytellerMap.has(storytellerId)) {
        storytellerMap.set(storytellerId, {
          storyteller: story.storyteller,
          stories: []
        });
      }
      storytellerMap.get(storytellerId).stories.push(story);
    }
  });

  console.log('\n=== STORYTELLERS WITH MULTIPLE STORIES ===\n');
  const sortedStorytellers = Array.from(storytellerMap.entries())
    .filter(([_, data]) => data.stories.length > 1)
    .sort((a, b) => b[1].stories.length - a[1].stories.length);

  sortedStorytellers.slice(0, 10).forEach(([id, data]) => {
    console.log(`${data.storyteller.preferred_name || data.storyteller.full_name}`);
    console.log(`  - ${data.stories.length} stories`);
    console.log(`  - Elder: ${data.storyteller.is_elder ? 'YES' : 'NO'}`);
    console.log(`  - Has profile image: ${data.storyteller.profile_image_url ? 'YES' : 'NO'}`);
    console.log(`  - Featured stories: ${data.stories.filter(s => s.is_featured).length}`);
    console.log('');
  });

  console.log('\n=== RECOMMENDED ACTIONS ===\n');

  // Find 3 elder stories with different storytellers
  const recommendedElders = elderStories
    ?.filter(s => s.storyteller?.profile_image_url) // Must have profile image
    ?.slice(0, 3);

  if (recommendedElders && recommendedElders.length > 0) {
    console.log('Mark these elder stories as featured:\n');
    recommendedElders.forEach((story, i) => {
      console.log(`${i + 1}. UPDATE stories SET is_featured = true WHERE id = '${story.id}';`);
      console.log(`   -- "${story.title}" by ${story.storyteller?.preferred_name || story.storyteller?.full_name}\n`);
    });
  }

  console.log('\n=== COMPLETE ===\n');
}

findCandidates().catch(console.error);
