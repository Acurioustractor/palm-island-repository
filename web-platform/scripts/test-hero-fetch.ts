import { createClient } from '@supabase/supabase-js';
import * as dotenv from 'dotenv';
import * as path from 'path';

dotenv.config({ path: path.resolve(process.cwd(), '.env.local') });

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
);

async function testHeroFetch() {
  console.log('\n=== TESTING HERO IMAGE FETCH (Like getFeaturedPageMedia) ===\n');

  // Simulate what getFeaturedPageMedia('home', 'hero', 'image') does
  let queryBuilder = supabase
    .from('media_files')
    .select('id, public_url, title, alt_text, context_metadata')
    .eq('page_context', 'home')
    .eq('is_public', true)
    .eq('is_featured', true)
    .is('deleted_at', null);

  // Add page_section filter
  queryBuilder = queryBuilder.eq('page_section', 'hero');

  // Add file_type filter
  queryBuilder = queryBuilder.eq('file_type', 'image');

  queryBuilder = queryBuilder
    .order('display_order', { ascending: true })
    .limit(1)
    .single();

  const { data, error } = await queryBuilder;

  if (error) {
    if (error.code !== 'PGRST116') {
      console.error('ERROR:', error);
    } else {
      console.log('No hero image found (PGRST116 - no rows)');
    }
    return null;
  }

  console.log('✅ Hero image found!');
  console.log('Title:', data.title);
  console.log('URL:', data.public_url);
  console.log('\nFull data:', JSON.stringify(data, null, 2));

  return data;
}

testHeroFetch().catch(console.error);
