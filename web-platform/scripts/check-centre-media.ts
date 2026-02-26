import { createClient } from '@supabase/supabase-js';
import * as dotenv from 'dotenv';
import * as path from 'path';
dotenv.config({ path: path.resolve(process.cwd(), '.env.local') });

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL || '',
  process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || ''
);

async function main() {
  // 1. Current photos tagged with this project
  const tag = 'project:the-centre-the-station';
  const { data: currentMedia } = await supabase
    .from('media_files')
    .select('id, title, file_type, public_url, tags, rating')
    .contains('tags', [tag])
    .is('deleted_at', null)
    .order('rating', { ascending: false, nullsFirst: false });

  console.log('=== Currently tagged with project:the-centre-the-station ===');
  console.log(`Total: ${currentMedia?.length || 0}`);
  (currentMedia || []).forEach(m => {
    console.log(`  [${m.file_type}] "${m.title}" (rating: ${m.rating}) ${m.public_url?.slice(0, 80)}`);
  });

  // 2. Search for centre/station related media by title/description
  const { data: byName } = await supabase
    .from('media_files')
    .select('id, title, file_type, public_url, tags, description')
    .is('deleted_at', null)
    .or('title.ilike.%centre%,title.ilike.%station%,description.ilike.%centre%,description.ilike.%station%')
    .limit(20);

  console.log('\n=== Media mentioning "centre" or "station" in title/description ===');
  console.log(`Total: ${byName?.length || 0}`);
  (byName || []).forEach(m => {
    console.log(`  [${m.file_type}] "${m.title}" tags: ${JSON.stringify(m.tags?.slice(0, 5))}`);
  });

  // 3. Search for Descript videos
  const { data: descript } = await supabase
    .from('media_files')
    .select('id, title, file_type, public_url, tags, description')
    .is('deleted_at', null)
    .or('title.ilike.%descript%,public_url.ilike.%descript%,description.ilike.%descript%')
    .limit(10);

  console.log('\n=== Descript-related media ===');
  console.log(`Total: ${descript?.length || 0}`);
  (descript || []).forEach(m => {
    console.log(`  [${m.file_type}] "${m.title}" url: ${m.public_url}`);
  });

  // 4. Search for Townsville-related media
  const { data: townsville } = await supabase
    .from('media_files')
    .select('id, title, file_type, public_url, tags')
    .is('deleted_at', null)
    .or('title.ilike.%townsville%,tags.cs.{townsville}')
    .limit(20);

  console.log('\n=== Townsville-related media ===');
  console.log(`Total: ${townsville?.length || 0}`);
  (townsville || []).forEach(m => {
    console.log(`  [${m.file_type}] "${m.title}" tags: ${JSON.stringify(m.tags?.slice(0, 5))}`);
  });

  // 5. Check the project hero image and description
  const { data: proj } = await supabase
    .from('projects')
    .select('*')
    .eq('slug', 'the-centre-the-station')
    .single();

  console.log('\n=== Project record ===');
  if (proj) {
    console.log(`Name: ${proj.name}`);
    console.log(`Hero: ${proj.hero_image_url}`);
    console.log(`Gallery: ${JSON.stringify(proj.gallery_images)}`);
    console.log(`Description: ${proj.description?.slice(0, 200)}`);
  }

  // 6. Check media with youth/rjed/centre tags
  const { data: youthMedia } = await supabase
    .from('media_files')
    .select('id, title, file_type, public_url, tags')
    .is('deleted_at', null)
    .or('title.ilike.%youth%,title.ilike.%rjed%')
    .limit(20);

  console.log('\n=== Youth/RJED media ===');
  console.log(`Total: ${youthMedia?.length || 0}`);
  (youthMedia || []).forEach(m => {
    console.log(`  [${m.file_type}] "${m.title}" tags: ${JSON.stringify(m.tags?.slice(0, 5))}`);
  });
}

main().catch(console.error);
