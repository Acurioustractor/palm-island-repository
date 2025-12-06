/**
 * Debug why story queries return empty arrays
 */

import { createClient } from '@supabase/supabase-js';
import * as dotenv from 'dotenv';
import * as path from 'path';

// Load environment variables from .env.local
dotenv.config({ path: path.resolve(process.cwd(), '.env.local') });

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!;

if (!supabaseUrl || !supabaseKey) {
  console.error('Missing Supabase credentials!');
  console.error('NEXT_PUBLIC_SUPABASE_URL:', supabaseUrl ? 'Set' : 'Missing');
  console.error('NEXT_PUBLIC_SUPABASE_ANON_KEY:', supabaseKey ? 'Set' : 'Missing');
  process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseKey);

async function debugStoryQueries() {
  console.log('\n=== DEBUGGING STORY QUERIES ===\n');

  // 1. Check total public stories
  console.log('1. Total public stories:');
  const { data: allPublic, error: e1 } = await supabase
    .from('stories')
    .select('id, title, is_public, is_featured, status, storyteller_id')
    .eq('is_public', true);

  console.log(`   Found: ${allPublic?.length || 0} stories`);
  if (e1) console.error('   Error:', e1);

  // 2. Check is_featured field
  console.log('\n2. Stories with is_featured = true:');
  const { data: featured, error: e2 } = await supabase
    .from('stories')
    .select('id, title, is_featured')
    .eq('is_public', true)
    .eq('is_featured', true);

  console.log(`   Found: ${featured?.length || 0} stories`);
  if (e2) console.error('   Error:', e2);

  // 3. Check is_featured field distribution
  console.log('\n3. is_featured field distribution in public stories:');
  const featuredTrue = allPublic?.filter(s => s.is_featured === true).length || 0;
  const featuredFalse = allPublic?.filter(s => s.is_featured === false).length || 0;
  const featuredNull = allPublic?.filter(s => s.is_featured === null || s.is_featured === undefined).length || 0;
  console.log(`   is_featured = true: ${featuredTrue}`);
  console.log(`   is_featured = false: ${featuredFalse}`);
  console.log(`   is_featured = null/undefined: ${featuredNull}`);

  // 4. Check storyteller_id field
  console.log('\n4. Stories with storyteller_id:');
  const withStoryteller = allPublic?.filter(s => s.storyteller_id !== null).length || 0;
  const withoutStoryteller = allPublic?.filter(s => s.storyteller_id === null).length || 0;
  console.log(`   With storyteller_id: ${withStoryteller}`);
  console.log(`   Without storyteller_id: ${withoutStoryteller}`);

  // 5. Try the getFeaturedStories query with join
  console.log('\n5. Testing getFeaturedStories() query with join:');
  const { data: featuredWithJoin, error: e3 } = await supabase
    .from('stories')
    .select(`
      *,
      storyteller:storyteller_id (
        id,
        full_name,
        preferred_name,
        is_elder,
        is_cultural_advisor
      ),
      story_media (
        id,
        media_url,
        media_type,
        caption
      )
    `)
    .eq('is_featured', true)
    .eq('is_public', true)
    .order('total_score', { ascending: false })
    .limit(6);

  console.log(`   Found: ${featuredWithJoin?.length || 0} stories`);
  if (e3) console.error('   Error:', e3);

  // 6. Try getRecentStories query
  console.log('\n6. Testing getRecentStories() query:');
  const { data: recent, error: e4 } = await supabase
    .from('stories')
    .select(`
      *,
      storyteller:storyteller_id (
        id,
        full_name,
        preferred_name,
        is_elder,
        is_cultural_advisor
      ),
      story_media (
        id,
        media_url,
        media_type,
        caption
      )
    `)
    .eq('is_public', true)
    .order('created_at', { ascending: false })
    .limit(12);

  console.log(`   Found: ${recent?.length || 0} stories`);
  if (e4) console.error('   Error:', e4);

  // 7. Try getElderStories query
  console.log('\n7. Testing getElderStories() query:');
  const { data: elder, error: e5 } = await supabase
    .from('stories')
    .select(`
      *,
      storyteller:storyteller_id!inner (
        id,
        full_name,
        preferred_name,
        is_elder,
        is_cultural_advisor
      ),
      story_media (
        id,
        media_url,
        media_type,
        caption
      )
    `)
    .eq('is_public', true)
    .eq('storyteller.is_elder', true)
    .order('cultural_score', { ascending: false })
    .limit(6);

  console.log(`   Found: ${elder?.length || 0} stories`);
  if (e5) console.error('   Error:', e5);

  // 8. Sample a few stories to see their structure
  console.log('\n8. Sample story structure (first 3):');
  const sample = allPublic?.slice(0, 3);
  sample?.forEach((story, i) => {
    console.log(`\n   Story ${i + 1}:`);
    console.log(`   - ID: ${story.id}`);
    console.log(`   - Title: ${story.title}`);
    console.log(`   - is_public: ${story.is_public}`);
    console.log(`   - is_featured: ${story.is_featured}`);
    console.log(`   - status: ${story.status}`);
    console.log(`   - storyteller_id: ${story.storyteller_id}`);
  });

  console.log('\n=== DEBUGGING COMPLETE ===\n');
}

debugStoryQueries().catch(console.error);
