import { createClient } from '@supabase/supabase-js';
import * as dotenv from 'dotenv';
import * as path from 'path';

dotenv.config({ path: path.resolve(process.cwd(), '.env.local') });

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!;

const supabase = createClient(supabaseUrl, supabaseKey);

async function main() {
  console.log('\n=== CHECKING FEATURED STORIES ===\n');

  const { data, error } = await supabase
    .from('stories')
    .select('id, title, is_featured, is_public, storyteller_id')
    .eq('is_featured', true)
    .eq('is_public', true)
    .order('total_score', { ascending: false });

  if (error) {
    console.error('Error:', error);
    return;
  }

  console.log(`Found ${data?.length || 0} featured stories:\n`);

  data?.forEach((story, i) => {
    console.log(`${i + 1}. ${story.title}`);
    console.log(`   ID: ${story.id}`);
    console.log(`   Storyteller ID: ${story.storyteller_id}`);
    console.log('');
  });
}

main();
