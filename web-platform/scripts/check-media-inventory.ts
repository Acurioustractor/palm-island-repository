/**
 * Check what photos are available and where gaps exist.
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
  // 1. Count unassigned images
  const { count: unassigned } = await supabase
    .from('media_files')
    .select('*', { count: 'exact', head: true })
    .is('page_context', null)
    .eq('file_type', 'image')
    .is('deleted_at', null);
  console.log(`Unassigned images (no page_context): ${unassigned}`);

  // 2. Sample titles of unassigned images
  const { data: samples } = await supabase
    .from('media_files')
    .select('title, tags')
    .is('page_context', null)
    .eq('file_type', 'image')
    .is('deleted_at', null)
    .order('created_at', { ascending: false })
    .limit(30);

  console.log('\nRecent unassigned image titles:');
  for (const s of (samples || [])) {
    const tagStr = (s.tags || []).slice(0, 5).join(', ');
    console.log(`  ${s.title || '(no title)'} | [${tagStr}]`);
  }

  // 3. Count by page_context
  const { data: contexts } = await supabase
    .from('media_files')
    .select('page_context')
    .eq('file_type', 'image')
    .is('deleted_at', null);

  const contextCounts: Record<string, number> = {};
  for (const c of (contexts || [])) {
    const key = c.page_context || '(none)';
    contextCounts[key] = (contextCounts[key] || 0) + 1;
  }
  console.log('\nImages by page_context:');
  for (const [ctx, count] of Object.entries(contextCounts).sort((a, b) => b[1] - a[1])) {
    console.log(`  ${ctx}: ${count}`);
  }

  // 4. Check about-context images for potential reuse
  const { data: aboutImages } = await supabase
    .from('media_files')
    .select('title, tags, page_section, width, height')
    .eq('page_context', 'about')
    .eq('file_type', 'image')
    .is('deleted_at', null)
    .order('width', { ascending: false })
    .limit(20);

  console.log('\nTop about-context images (by size):');
  for (const s of (aboutImages || [])) {
    const tagStr = (s.tags || []).filter((t: string) => t.startsWith('service:') || t === 'professional-photography' || t === 'event').join(', ');
    console.log(`  [${s.page_section || '?'}] ${s.title || '(no title)'} ${s.width || '?'}x${s.height || '?'} | [${tagStr}]`);
  }

  // 5. Search for community/family/youth/health keywords in ALL unassigned images
  const searchTerms = ['community', 'family', 'youth', 'health', 'sport', 'housing', 'education', 'justice', 'mental', 'employment'];
  console.log('\nKeyword matches in unassigned images:');
  for (const term of searchTerms) {
    const { count } = await supabase
      .from('media_files')
      .select('*', { count: 'exact', head: true })
      .eq('file_type', 'image')
      .is('page_context', null)
      .is('deleted_at', null)
      .ilike('title', `%${term}%`);
    if ((count || 0) > 0) {
      console.log(`  "${term}": ${count} matches`);
    }
  }

  // 6. Also search in tags (not just title)
  console.log('\nService-tagged images without page_context:');
  const { data: serviceTagged } = await supabase
    .from('media_files')
    .select('title, tags')
    .is('page_context', null)
    .eq('file_type', 'image')
    .is('deleted_at', null)
    .not('tags', 'is', null);

  const serviceTagCounts: Record<string, number> = {};
  for (const img of (serviceTagged || [])) {
    for (const tag of (img.tags || [])) {
      if (tag.startsWith('service:')) {
        serviceTagCounts[tag] = (serviceTagCounts[tag] || 0) + 1;
      }
    }
  }
  for (const [tag, count] of Object.entries(serviceTagCounts).sort((a, b) => b[1] - a[1])) {
    console.log(`  ${tag}: ${count}`);
  }
}

main().catch(console.error);
