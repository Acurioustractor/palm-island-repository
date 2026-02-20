import { createClient } from '@supabase/supabase-js';
import * as dotenv from 'dotenv';
dotenv.config({ path: '.env.local' });

async function main() {
  const supabase = createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!
  );

  // Get all CFC hero images
  const { data: heroes } = await supabase
    .from('media_files')
    .select('id, title, public_url, tags, is_featured, original_filename')
    .contains('tags', ['service:early-childhood-services', 'hero'])
    .eq('file_type', 'image')
    .is('deleted_at', null);

  // Remove hero tag from annual-report path images (wrong images)
  const badOnes = (heroes || []).filter(h => h.public_url?.includes('annual-report'));
  console.log('Bad hero images for CFC:', badOnes.length);
  for (const b of badOnes) {
    const newTags = (b.tags || []).filter((t: string) => t !== 'hero');
    const { error } = await supabase
      .from('media_files')
      .update({ tags: newTags })
      .eq('id', b.id);
    console.log(error ? `FAILED: ${b.id}` : `Removed hero tag from ${b.id} (${b.title || b.original_filename})`);
  }

  // Remove hero tag from generic IMG_ photos (not curated hero assets)
  const genericHeroes = (heroes || []).filter(h =>
    (h.title || h.original_filename || '').startsWith('2025') &&
    !h.public_url?.includes('hero-assets')
  );
  console.log('\nGeneric IMG_ hero images for CFC:', genericHeroes.length);
  for (const g of genericHeroes) {
    const newTags = (g.tags || []).filter((t: string) => t !== 'hero');
    const { error } = await supabase
      .from('media_files')
      .update({ tags: newTags })
      .eq('id', g.id);
    console.log(error ? `FAILED: ${g.id}` : `Removed hero tag from ${g.id} (${g.title || g.original_filename})`);
  }

  // Set Daycare Graduation as THE featured hero
  const graduation = (heroes || []).find(h => h.title === 'Daycare Graduation Celebration');
  if (graduation) {
    // Unfeatured all CFC hero images first
    const remainingHeroes = (heroes || [])
      .filter(h => !badOnes.some(b => b.id === h.id) && !genericHeroes.some(g => g.id === h.id));
    for (const rh of remainingHeroes) {
      await supabase.from('media_files').update({ is_featured: false }).eq('id', rh.id);
    }
    // Feature the graduation photo
    await supabase.from('media_files').update({ is_featured: true }).eq('id', graduation.id);
    console.log('\nSet "Daycare Graduation Celebration" as featured hero for CFC');
  }

  // Verify final state
  const { data: final } = await supabase
    .from('media_files')
    .select('id, title, is_featured')
    .contains('tags', ['service:early-childhood-services', 'hero'])
    .eq('file_type', 'image')
    .is('deleted_at', null)
    .order('is_featured', { ascending: false });
  console.log('\nFinal CFC heroes:');
  for (const f of final || []) {
    console.log(f.is_featured ? '★' : ' ', f.title || '(untitled)');
  }
}
main().catch(console.error);
