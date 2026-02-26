import { createClient } from '@supabase/supabase-js';
import * as dotenv from 'dotenv';
import * as path from 'path';
dotenv.config({ path: path.resolve(process.cwd(), '.env.local') });

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL || '',
  process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || ''
);

async function main() {
  // Find the Descript video "Young People Helping at The Centre"
  const { data } = await supabase
    .from('media_files')
    .select('id, title, public_url, tags, rating')
    .ilike('title', '%Young People Helping%')
    .limit(1);

  if (!data?.length) {
    console.log('Video not found');
    return;
  }

  const video = data[0];
  console.log('Found:', video.title, video.public_url);
  console.log('Current tags:', video.tags);
  console.log('Current rating:', video.rating);

  // Add project tag and bump rating
  const newTags = [...new Set([...(video.tags || []), 'project:the-centre-the-station', 'featured'])];

  const { error } = await supabase
    .from('media_files')
    .update({ tags: newTags, rating: 5 })
    .eq('id', video.id);

  if (error) {
    console.error('Error:', error.message);
  } else {
    console.log('Updated tags:', newTags);
    console.log('Updated rating: 5');
  }
}

main().catch(console.error);
