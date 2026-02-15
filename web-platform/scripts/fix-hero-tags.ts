/**
 * Fix: Add 'hero' tag to existing service covers that are missing it.
 * The services page queries: contains('tags', ['service:{slug}', 'hero'])
 * But existing covers only have page_context/page_section/is_featured set.
 */
import { createClient } from '@supabase/supabase-js';
import * as dotenv from 'dotenv';
import { resolve } from 'path';

dotenv.config({ path: resolve(__dirname, '../.env.local') });

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL as string,
  process.env.SUPABASE_SERVICE_ROLE_KEY as string
);

async function main() {
  // Find all service covers assigned via page_context
  const { data: covers } = await supabase
    .from('media_files')
    .select('id, tags, page_section, title')
    .eq('page_context', 'home')
    .like('page_section', 'service-%')
    .eq('is_featured', true)
    .is('deleted_at', null);

  let fixed = 0;
  for (const c of (covers || [])) {
    const tags: string[] = c.tags || [];
    const hasHero = tags.includes('hero');
    if (hasHero) {
      console.log(`  [OK] ${c.page_section} already has hero tag`);
      continue;
    }

    const slug = c.page_section.replace('service-', '');
    const serviceTag = `service:${slug}`;
    const newTags = [...new Set([...tags, 'hero', serviceTag])];

    await supabase.from('media_files').update({ tags: newTags }).eq('id', c.id);
    console.log(`  [FIXED] ${c.page_section} → added hero + ${serviceTag} tags (${c.title || 'untitled'})`);
    fixed++;
  }

  console.log(`\nFixed ${fixed} of ${(covers || []).length} covers`);
}

main().catch(console.error);
