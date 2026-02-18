/**
 * Check which services have cover images and which need them.
 */
import { createClient } from '@supabase/supabase-js';
import * as dotenv from 'dotenv';
import { resolve } from 'path';

dotenv.config({ path: resolve(__dirname, '../.env.local') });

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL as string,
  process.env.SUPABASE_SERVICE_ROLE_KEY as string
);

const INNOVATION_SLUGS = ['the-centre', 'photo-studio', 'on-country-photo-studio'];

async function main() {
  const { data: services } = await supabase
    .from('organization_services')
    .select('name, slug')
    .eq('is_active', true)
    .order('name');

  const regular = (services || []).filter((s: any) => !INNOVATION_SLUGS.includes(s.slug));

  console.log(`=== SERVICE COVER IMAGE STATUS (${regular.length} services) ===\n`);

  let hasCover = 0;
  let noCover = 0;

  for (const s of regular as any[]) {
    const { count: coverCount } = await supabase
      .from('media_files')
      .select('*', { count: 'exact', head: true })
      .eq('page_context', 'home')
      .eq('page_section', `service-${s.slug}`)
      .is('deleted_at', null);

    const { count: taggedCount } = await supabase
      .from('media_files')
      .select('*', { count: 'exact', head: true })
      .contains('tags', [`service:${s.slug}`])
      .is('deleted_at', null);

    const cover = (coverCount || 0) > 0;
    const tagged = taggedCount || 0;
    const status = cover ? 'HAS COVER' : 'NO COVER';
    const icon = cover ? '  ' : '  ';

    console.log(`${icon} ${status.padEnd(12)} tagged:${String(tagged).padStart(3)}  ${s.name} (${s.slug})`);

    if (cover) hasCover++;
    else noCover++;
  }

  console.log(`\n--- Summary ---`);
  console.log(`  With cover image: ${hasCover}`);
  console.log(`  Missing cover: ${noCover}`);
  console.log(`  Total: ${regular.length}`);
}

main().catch(console.error);
