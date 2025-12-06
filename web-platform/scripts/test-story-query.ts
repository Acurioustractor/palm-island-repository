/**
 * Test story detail query
 */

import { createClient } from '@supabase/supabase-js';
import * as dotenv from 'dotenv';
import * as path from 'path';

dotenv.config({ path: path.resolve(process.cwd(), '.env.local') });

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!;

const supabase = createClient(supabaseUrl, supabaseKey);

async function testQuery() {
  console.log('\n=== TESTING STORY DETAIL QUERY ===\n');

  const storyId = 'e0000000-0000-0000-0000-000000000001';

  console.log(`Testing story ID: ${storyId}\n`);

  const { data, error } = await supabase
    .from('stories')
    .select(`
      *,
      storyteller:storyteller_id (
        id,
        full_name,
        preferred_name,
        profile_image_url
      ),
      organization:organization_id (
        id,
        name,
        short_name
      ),
      service:service_id (
        id,
        name,
        service_color
      ),
      story_media (
        id,
        media_type,
        file_path,
        supabase_bucket,
        caption
      )
    `)
    .eq('id', storyId)
    .single();

  if (error) {
    console.error('ERROR:', error);
    console.error('Error details:', JSON.stringify(error, null, 2));
  } else {
    console.log('SUCCESS!');
    console.log('Story found:', data.title);
    console.log('Storyteller:', data.storyteller?.preferred_name || data.storyteller?.full_name);
    console.log('Category:', data.category);
    console.log('Has content:', !!data.content);
  }
}

testQuery().catch(console.error);
