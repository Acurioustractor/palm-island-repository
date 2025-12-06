import { createClient } from '@supabase/supabase-js';
import * as dotenv from 'dotenv';
import * as path from 'path';

dotenv.config({ path: path.resolve(process.cwd(), '.env.local') });

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY! || process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
);

async function checkElderImages() {
  console.log('\n=== CHECKING ELDER PROFILE IMAGES ===\n');

  // Get elder stories with storyteller info
  const { data: stories, error } = await supabase
    .from('stories')
    .select(`
      id,
      title,
      storyteller:storyteller_id!inner (
        id,
        full_name,
        preferred_name,
        is_elder,
        profile_image_url
      )
    `)
    .eq('is_public', true)
    .eq('storyteller.is_elder', true)
    .order('created_at', { ascending: false })
    .limit(10);

  if (error) {
    console.error('Error:', error);
    return;
  }

  console.log(`Found ${stories?.length || 0} elder stories\n`);

  if (stories && stories.length > 0) {
    stories.forEach((story: any, i: number) => {
      console.log(`${i + 1}. ${story.storyteller?.preferred_name || story.storyteller?.full_name}`);
      console.log(`   Story: ${story.title}`);
      console.log(`   Profile Image URL: ${story.storyteller?.profile_image_url || 'MISSING ❌'}`);
      console.log('');
    });
  } else {
    console.log('No elder stories found');
  }
}

checkElderImages().catch(console.error);
