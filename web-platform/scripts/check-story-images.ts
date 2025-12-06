import { createClient } from '@supabase/supabase-js';
import { config } from 'dotenv';
import { resolve } from 'path';

config({ path: resolve(process.cwd(), '.env.local') });

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
);

async function checkStoryImages() {
  // First check stories table for featured_image_url
  const { data, error } = await supabase
    .from('stories')
    .select('id, title, featured_image_url')
    .eq('is_public', true)
    .limit(15);

  if (error) {
    console.error('Error:', error);
    process.exit(1);
  }

  console.log('\n📸 IMAGE CHECK FOR STORIES\n');
  console.log('=' .repeat(60));

  let withImages = 0;
  let withoutImages = 0;

  for (const story of data) {
    const hasImage = !!story.featured_image_url;

    if (hasImage) withImages++;
    else withoutImages++;

    const idx = data.indexOf(story) + 1;
    console.log(`\n${idx}. ${story.title.substring(0, 50)}${story.title.length > 50 ? '...' : ''}`);
    console.log(`   Featured Image: ${story.featured_image_url || 'None'}`);
    console.log(`   Status: ${hasImage ? '✅ HAS IMAGE' : '❌ NO IMAGE'}`);
  }

  console.log('\n' + '='.repeat(60));
  console.log(`\n📊 SUMMARY:`);
  console.log(`   Stories with images: ${withImages}`);
  console.log(`   Stories without images: ${withoutImages}`);
  console.log(`   Total checked: ${data.length}\n`);

  // Check if there are any images in media_files with story context
  console.log('\n📂 CHECKING MEDIA_FILES FOR STORY IMAGES...\n');

  const { data: mediaFiles, error: mediaError } = await supabase
    .from('media_files')
    .select('id, filename, public_url, page_context, page_section')
    .eq('page_context', 'stories')
    .limit(10);

  if (mediaError) {
    console.error('Error checking media files:', mediaError);
  } else {
    console.log(`Found ${mediaFiles?.length || 0} media files with page_context='stories'`);
    if (mediaFiles && mediaFiles.length > 0) {
      mediaFiles.forEach((m, i) => {
        console.log(`  ${i+1}. ${m.filename} (${m.page_section || 'no section'})`);
        console.log(`     URL: ${m.public_url?.substring(0, 60)}...`);
      });
    }
  }

  console.log('\n');
}

checkStoryImages()
  .then(() => process.exit(0))
  .catch(err => {
    console.error('Fatal error:', err);
    process.exit(1);
  });
