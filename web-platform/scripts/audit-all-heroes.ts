import { createClient } from '@supabase/supabase-js';
import * as dotenv from 'dotenv';
dotenv.config({ path: '.env.local' });

async function main() {
  const supabase = createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!
  );

  const { data: services } = await supabase
    .from('organization_services')
    .select('id, name, slug')
    .eq('is_active', true)
    .order('name');

  let fixCount = 0;

  for (const s of services || []) {
    const tag = `service:${s.slug}`;

    const { data: heroes } = await supabase
      .from('media_files')
      .select('id, title, public_url, tags, is_featured, original_filename')
      .contains('tags', [tag, 'hero'])
      .eq('file_type', 'image')
      .is('deleted_at', null)
      .order('is_featured', { ascending: false })
      .order('created_at', { ascending: false });

    if (!heroes || heroes.length === 0) continue;

    // Check for bad hero images (annual-report path or generic IMG_ without hero-assets path)
    const bad = heroes.filter(h =>
      h.public_url?.includes('annual-report') ||
      ((h.title || h.original_filename || '').startsWith('2025') && !h.public_url?.includes('hero-assets'))
    );

    // Only report if there are issues
    const goodHeroes = heroes.filter(h => !bad.some(b => b.id === h.id));
    const hasFeatured = goodHeroes.some(h => h.is_featured);

    if (bad.length > 0 || (!hasFeatured && goodHeroes.length > 0)) {
      console.log(`\n${s.name} (${s.slug})`);
      console.log(`  Total heroes: ${heroes.length}, Bad: ${bad.length}, Good: ${goodHeroes.length}, Has featured: ${hasFeatured}`);

      // Remove hero tag from bad images
      for (const b of bad) {
        const newTags = (b.tags || []).filter((t: string) => t !== 'hero');
        await supabase.from('media_files').update({ tags: newTags }).eq('id', b.id);
        console.log(`  Removed hero from: ${b.title || b.original_filename || b.id}`);
        fixCount++;
      }

      // If no featured good hero, mark the first good one
      if (!hasFeatured && goodHeroes.length > 0) {
        await supabase.from('media_files').update({ is_featured: true }).eq('id', goodHeroes[0].id);
        console.log(`  Set featured: ${goodHeroes[0].title || goodHeroes[0].original_filename || goodHeroes[0].id}`);
        fixCount++;
      }
    }
  }

  console.log(`\nDone. ${fixCount} fixes applied.`);
}
main().catch(console.error);
