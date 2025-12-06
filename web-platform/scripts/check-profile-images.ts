/**
 * Check which storytellers have profile images
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
  process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseKey);

async function checkProfileImages() {
  console.log('\n=== CHECKING STORYTELLER PROFILE IMAGES ===\n');

  // Check profiles table
  console.log('1. Checking profiles table:');
  const { data: profiles, error: e1 } = await supabase
    .from('profiles')
    .select('id, full_name, preferred_name, profile_image_url, is_elder')
    .not('profile_image_url', 'is', null);

  console.log(`   Profiles with images: ${profiles?.length || 0}`);
  if (e1) console.error('   Error:', e1);

  if (profiles && profiles.length > 0) {
    profiles.forEach((p, i) => {
      console.log(`\n   Profile ${i + 1}:`);
      console.log(`   - Name: ${p.preferred_name || p.full_name}`);
      console.log(`   - Is Elder: ${p.is_elder}`);
      console.log(`   - Image URL: ${p.profile_image_url}`);
    });
  }

  // Check stories with storytellers
  console.log('\n2. Checking stories with storyteller profile images:');
  const { data: stories, error: e2 } = await supabase
    .from('stories')
    .select(`
      id,
      title,
      storyteller:storyteller_id (
        id,
        full_name,
        preferred_name,
        is_elder,
        profile_image_url
      )
    `)
    .eq('is_public', true)
    .limit(10);

  console.log(`   Public stories checked: ${stories?.length || 0}`);
  if (e2) console.error('   Error:', e2);

  if (stories) {
    const withImages = stories.filter(s => (s.storyteller as any)?.profile_image_url);
    const withoutImages = stories.filter(s => !(s.storyteller as any)?.profile_image_url);

    console.log(`   Stories with storyteller images: ${withImages.length}`);
    console.log(`   Stories without storyteller images: ${withoutImages.length}`);

    if (withImages.length > 0) {
      console.log('\n   Stories WITH images:');
      withImages.forEach((s, i) => {
        const storyteller = s.storyteller as any;
        console.log(`\n   ${i + 1}. "${s.title}"`);
        console.log(`      - Storyteller: ${storyteller?.preferred_name || storyteller?.full_name}`);
        console.log(`      - Is Elder: ${storyteller?.is_elder}`);
        console.log(`      - Image URL: ${storyteller?.profile_image_url}`);
      });
    }
  }

  console.log('\n=== CHECK COMPLETE ===\n');
}

checkProfileImages().catch(console.error);
