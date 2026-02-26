import { createClient } from '@supabase/supabase-js';
import * as dotenv from 'dotenv';
import * as path from 'path';

dotenv.config({ path: path.resolve(process.cwd(), '.env.local') });
const supabase = createClient(process.env.NEXT_PUBLIC_SUPABASE_URL!, process.env.SUPABASE_SERVICE_ROLE_KEY! || process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!);

const ALL_IDS = [
  '6cb23cd9',
  '05664f99','64e63916','940cd6df','369d5a7c','4f11b96e','7687a144',
  '2f8dc5b4','e17c6602','85941136','039b431c','2060f911','fbfbc947','112ed99c','2d8346ae','c6cff988','d6ada43d',
  '74e05337','ed342ea3','9aac5294','d9743bbf','a53b2e8f'
];

async function main() {
  const { data } = await supabase.from('stories').select('id, title, content').limit(500);
  if (!data) { console.log('No data'); return; }

  let clean = 0;
  let issues = 0;

  for (const pid of ALL_IDS) {
    const story = data.find((s: any) => s.id.startsWith(pid));
    if (!story) { console.log(`NOT FOUND: ${pid}`); continue; }

    const c = story.content || '';
    const hasTimecodes = /\[\d{1,2}:\d{2}/.test(c);
    const hasHtml = /<[a-z][^>]*>/i.test(c);
    const hasDividers = /^={3,}$/m.test(c);
    const hasTitleMerge = c.split('\n')[0].length > 120;

    const flags = [];
    if (hasTimecodes) flags.push('timecodes');
    if (hasHtml) flags.push('html');
    if (hasDividers) flags.push('dividers');
    if (hasTitleMerge) flags.push('title-merge');

    const status = flags.length > 0 ? '⚠' : '✓';
    if (flags.length > 0) issues++;
    else clean++;

    console.log(`${status} ${pid} (${c.length} chars) "${story.title}"${flags.length ? ' [' + flags.join(', ') + ']' : ''}`);
  }

  console.log(`\n${clean} clean, ${issues} with remaining issues out of ${ALL_IDS.length} total`);
}

main().catch(console.error);
