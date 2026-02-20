import { createClient } from '@supabase/supabase-js';
import * as dotenv from 'dotenv';
dotenv.config({ path: '.env.local' });

async function main() {
  const s = createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!
  );

  // Check hero-assets images
  const { data } = await s.from('media_files')
    .select('id, title, public_url, tags, is_featured')
    .like('public_url', '%hero-assets%')
    .is('deleted_at', null);
  console.log('=== HERO-ASSETS IMAGES ===');
  for (const d of data || []) {
    const serviceTags = (d.tags || []).filter((t: string) => t.startsWith('service:'));
    console.log(
      d.is_featured ? 'F' : ' ',
      serviceTags.join(',') || 'NO SERVICE TAG',
      '|', d.title || '(untitled)',
      '|', d.public_url.split('/').pop()
    );
  }

  // Services with zero hero-tagged images now
  const { data: services } = await s.from('organization_services')
    .select('name, slug').eq('is_active', true).order('name');

  console.log('\n=== SERVICES WITH NO HERO IMAGE ===');
  for (const svc of services || []) {
    const { data: heroes } = await s.from('media_files')
      .select('id')
      .contains('tags', [`service:${svc.slug}`, 'hero'])
      .eq('file_type', 'image')
      .is('deleted_at', null);
    if (heroes === null || heroes.length === 0) {
      // Check if they have ANY featured image
      const { data: featured } = await s.from('media_files')
        .select('id, title, public_url')
        .contains('tags', [`service:${svc.slug}`])
        .eq('file_type', 'image')
        .eq('is_featured', true)
        .is('deleted_at', null)
        .limit(1);
      const hasFeatured = featured && featured.length > 0;
      console.log(`${svc.name} (${svc.slug}) — ${hasFeatured ? 'has featured: ' + featured![0].title : 'NO images at all'}`);
    }
  }
}
main().catch(console.error);
