import { createClient } from '@supabase/supabase-js';
import * as dotenv from 'dotenv';
import * as path from 'path';

dotenv.config({ path: path.resolve(process.cwd(), '.env.local') });

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY! || process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
);

async function removeHeroVideo() {
  console.log('\n=== REMOVING HERO VIDEO TO SHOW HERO IMAGE ===\n');

  // Find hero videos
  const { data: videos, error: findError } = await supabase
    .from('media_files')
    .select('id, title, public_url')
    .eq('page_context', 'home')
    .eq('page_section', 'hero')
    .eq('file_type', 'video');

  if (findError) {
    console.error('Error finding videos:', findError);
    return;
  }

  console.log(`Found ${videos?.length || 0} hero videos\n`);

  if (videos && videos.length > 0) {
    for (const video of videos) {
      console.log(`Removing: ${video.title}`);
      console.log(`URL: ${video.public_url}\n`);

      // Change page_section to something else so it won't interfere
      const { error } = await supabase
        .from('media_files')
        .update({ page_section: 'archive' })
        .eq('id', video.id);

      if (error) {
        console.error('Error updating:', error);
      } else {
        console.log('✅ Moved to archive section\n');
      }
    }
  } else {
    console.log('No hero videos found');
  }

  console.log('\n=== COMPLETE ===');
  console.log('Hero image should now display on home page!');
  console.log('Refresh your browser: http://localhost:4000\n');
}

removeHeroVideo().catch(console.error);
