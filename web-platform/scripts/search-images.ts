import { createClient } from '@supabase/supabase-js';
const supabase = createClient(process.env.NEXT_PUBLIC_SUPABASE_URL || '', process.env.SUPABASE_SERVICE_ROLE_KEY || '');

async function search() {
  const { data } = await supabase
    .from('media_files')
    .select('id, title, alt_text, caption, tags, public_url, rating')
    .eq('file_type', 'image')
    .is('deleted_at', null)
    .order('rating', { ascending: false, nullsFirst: false })
    .limit(500);

  const byFolder: Record<string, any[]> = {};
  for (const img of data || []) {
    const url = img.public_url || '';
    const match = url.match(/story-media\/([^/]+)\//);
    const folder = match ? match[1] : 'other';
    if (byFolder[folder] === undefined) byFolder[folder] = [];
    byFolder[folder].push(img);
  }

  for (const [folder, images] of Object.entries(byFolder).sort()) {
    console.log(`\n=== ${folder} (${images.length} images) ===`);
    for (const img of images.slice(0, 15)) {
      console.log(JSON.stringify({
        title: img.title || img.alt_text || '(untitled)',
        tags: (img.tags || []).slice(0, 6),
        rating: img.rating,
        file: img.public_url.split('/').pop(),
      }));
    }
    if (images.length > 15) console.log(`  ... +${images.length - 15} more`);
  }
}
search();
