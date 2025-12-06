#!/usr/bin/env tsx
/**
 * Add Featured Video to Media Library
 * Adds the Descript community story video
 */

import { supabase } from './lib/supabase';

async function main() {
  console.log('\n🎥 Adding Featured Video to Media Library\n');

  const videoData = {
    filename: 'community-story-featured.mp4',
    file_path: 'featured/community-story-featured.mp4',
    bucket_name: 'story-media',
    title: 'Palm Island Community Story',
    description: 'Featured community story showcasing Palm Islander voices and experiences',
    file_type: 'video',
    public_url: 'https://share.descript.com/view/hKKOfLKaapn',
    is_public: true,
    is_featured: true,
    page_context: 'home',
    page_section: 'hero',
    display_order: 0,
    tags: ['community', 'storytelling', 'featured', 'voices'],
  };

  const { data, error } = await supabase
    .from('media_files')
    .insert([videoData])
    .select()
    .single();

  if (error) {
    console.error('❌ Error adding video:', error.message);
    process.exit(1);
  }

  console.log('✅ Video added successfully!');
  console.log('\n📋 Video Details:');
  console.log(`   Title: ${data.title}`);
  console.log(`   URL: ${data.public_url}`);
  console.log(`   Page: ${data.page_context} > ${data.page_section}`);
  console.log(`   Featured: ${data.is_featured}`);
  console.log(`   Tags: ${data.tags?.join(', ')}`);

  console.log('\n🎬 Video will now appear on the home page!');
  console.log('   Visit: http://localhost:4000\n');
}

main().catch(err => {
  console.error('\n❌ Error:', err.message);
  process.exit(1);
});
