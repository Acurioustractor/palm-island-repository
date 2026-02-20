import { createClient } from '@supabase/supabase-js';
import * as dotenv from 'dotenv';
dotenv.config({ path: '.env.local' });

async function main() {
  const s = createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!
  );

  const { data: services } = await s.from('organization_services')
    .select('name, slug').eq('is_active', true).order('name');

  let fixed = 0;

  for (const svc of services || []) {
    const serviceTag = `service:${svc.slug}`;

    // Check if service already has a hero
    const { data: heroes } = await s.from('media_files')
      .select('id')
      .contains('tags', [serviceTag, 'hero'])
      .eq('file_type', 'image')
      .is('deleted_at', null);

    if (heroes && heroes.length > 0) continue; // already has hero

    // Find the best candidate: featured image for this service
    const { data: featured } = await s.from('media_files')
      .select('id, title, tags, is_featured, original_filename')
      .contains('tags', [serviceTag])
      .eq('file_type', 'image')
      .is('deleted_at', null)
      .order('is_featured', { ascending: false })
      .order('created_at', { ascending: false })
      .limit(1);

    if (featured && featured.length > 0) {
      const img = featured[0];
      const currentTags: string[] = img.tags || [];
      if (!currentTags.includes('hero')) {
        currentTags.push('hero');
      }
      await s.from('media_files')
        .update({ tags: currentTags, is_featured: true })
        .eq('id', img.id);
      console.log(`✓ ${svc.name} — restored hero: ${img.title || img.original_filename || img.id}`);
      fixed++;
    } else {
      console.log(`✗ ${svc.name} — NO images tagged with ${serviceTag}`);
    }
  }

  console.log(`\nDone. Restored ${fixed} hero images.`);
}
main().catch(console.error);
