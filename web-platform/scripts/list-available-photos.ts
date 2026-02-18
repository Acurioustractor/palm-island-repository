/**
 * List unassigned non-PDF photos available for service covers.
 */
import { createClient } from '@supabase/supabase-js';
import * as dotenv from 'dotenv';
import { resolve } from 'path';

dotenv.config({ path: resolve(__dirname, '../.env.local') });

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL as string,
  process.env.SUPABASE_SERVICE_ROLE_KEY as string
);

const COMMON_TAGS = new Set(['picc', 'photo', 'community', 'event', 'annual-report', 'people']);

async function main() {
  // Get ALL real photos (not just unassigned) to see what exists
  const { data } = await supabase
    .from('media_files')
    .select('id, title, tags, width, height, public_url, page_context, page_section')
    .eq('file_type', 'image')
    .is('deleted_at', null)
    .order('created_at', { ascending: false })
    .limit(1000);

  const nonPdf = (data || []).filter((m: any) => {
    const tags = m.tags || [];
    return !tags.includes('pdf-extract') && !tags.includes('page-render');
  });

  console.log(`=== UNASSIGNED REAL PHOTOS (${nonPdf.length}) ===\n`);

  // Group by event/tag
  const groups: Record<string, any[]> = {};
  for (const m of nonPdf) {
    const tags = (m.tags || []).filter((t: string) => !COMMON_TAGS.has(t));
    const group = tags.find((t: string) => t.startsWith('event:')) || tags[0] || 'untagged';
    if (!groups[group]) groups[group] = [];
    groups[group].push(m);
  }

  for (const [group, items] of Object.entries(groups).sort((a, b) => b[1].length - a[1].length)) {
    console.log(`--- ${group} (${items.length} photos) ---`);
    for (const m of items.slice(0, 5)) {
      const tags = (m.tags || []).filter((t: string) => !COMMON_TAGS.has(t)).slice(0, 4);
      console.log(`  [${m.id.slice(0, 8)}] "${(m.title || 'untitled').substring(0, 50)}" ${m.width || '?'}x${m.height || '?'}  ${tags.join(', ')}`);
    }
    if (items.length > 5) console.log(`  ... and ${items.length - 5} more`);
    console.log();
  }
}

main().catch(console.error);
