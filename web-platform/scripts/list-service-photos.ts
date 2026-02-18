/**
 * List all "PICC Services & People" photos to see what we can use for service covers.
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
  const { data } = await supabase
    .from('media_files')
    .select('id, title, tags, width, height, page_context, page_section, public_url')
    .eq('file_type', 'image')
    .is('deleted_at', null)
    .ilike('title', '%Services & People%')
    .order('title');

  console.log(`=== PICC Services & People Photos (${(data || []).length}) ===\n`);
  for (const m of data || []) {
    const assigned = m.page_context ? `→ ${m.page_context}/${m.page_section}` : '(unassigned)';
    console.log(`  [${m.id.slice(0, 8)}] "${m.title}" ${assigned}`);
    console.log(`           ${m.public_url}`);
  }

  // Also show the spring festival / photobooth photos count
  const { count: springCount } = await supabase
    .from('media_files')
    .select('*', { count: 'exact', head: true })
    .contains('tags', ['event:spring-festival-2025'])
    .is('deleted_at', null);

  const { count: photoShootCount } = await supabase
    .from('media_files')
    .select('*', { count: 'exact', head: true })
    .contains('tags', ['event:photo-shoot-oct-2025'])
    .is('deleted_at', null);

  const { count: communityVisitCount } = await supabase
    .from('media_files')
    .select('*', { count: 'exact', head: true })
    .contains('tags', ['event:community-visit-jun-2025'])
    .is('deleted_at', null);

  console.log(`\n=== Photo Collections ===`);
  console.log(`  Spring Festival 2025: ${springCount} photos`);
  console.log(`  Photo Shoot Oct 2025: ${photoShootCount} photos`);
  console.log(`  Community Visit Jun 2025: ${communityVisitCount} photos`);
}

main().catch(console.error);
