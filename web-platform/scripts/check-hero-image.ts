import { createClient } from '@supabase/supabase-js';
import * as dotenv from 'dotenv';
import * as path from 'path';

dotenv.config({ path: path.resolve(process.cwd(), '.env.local') });

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
);

async function checkHeroImage() {
  console.log('\n=== CHECKING HOME PAGE HERO IMAGE ===\n');

  // Check for hero images
  const { data, error } = await supabase
    .from('media_files')
    .select('id, title, public_url, page_context, page_section, is_featured, display_order')
    .eq('page_context', 'home')
    .eq('page_section', 'hero')
    .eq('file_type', 'image')
    .eq('is_public', true)
    .is('deleted_at', null)
    .order('display_order', { ascending: true })
    .order('created_at', { ascending: false });

  console.log('Hero images for home page:');
  console.log('Found:', data?.length || 0, 'images\n');

  if (data && data.length > 0) {
    data.forEach((img, i) => {
      console.log(`${i + 1}. ${img.title}`);
      console.log(`   Featured: ${img.is_featured}`);
      console.log(`   Display order: ${img.display_order}`);
      console.log(`   URL: ${img.public_url}`);
      console.log('');
    });
  } else {
    console.log('❌ No hero images found!\n');
    console.log('Checking if ANY images exist for home page...\n');

    const { data: anyHomeImages } = await supabase
      .from('media_files')
      .select('id, title, page_context, page_section, file_type, is_featured')
      .eq('page_context', 'home')
      .eq('file_type', 'image')
      .limit(20);

    console.log('Total home page images:', anyHomeImages?.length || 0, '\n');

    if (anyHomeImages && anyHomeImages.length > 0) {
      const sections = new Map<string, any[]>();
      anyHomeImages.forEach((img) => {
        if (!sections.has(img.page_section)) {
          sections.set(img.page_section, []);
        }
        sections.get(img.page_section)!.push(img);
      });

      sections.forEach((images, section) => {
        console.log(`Section: ${section} (${images.length} images)`);
        images.forEach((img) => {
          console.log(`  - ${img.title}${img.is_featured ? ' ⭐ FEATURED' : ''}`);
        });
        console.log('');
      });
    }

    // Check for featured images
    const { data: featuredImages } = await supabase
      .from('media_files')
      .select('id, title, page_context, page_section, public_url')
      .eq('is_featured', true)
      .eq('file_type', 'image')
      .limit(10);

    console.log('Featured images (any page):', featuredImages?.length || 0, '\n');
    featuredImages?.forEach((img) => {
      console.log(`  - ${img.title} (${img.page_context}/${img.page_section})`);
    });
  }
}

checkHeroImage().catch(console.error);
