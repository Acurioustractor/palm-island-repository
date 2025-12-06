#!/usr/bin/env tsx
import { supabase } from './lib/supabase';

async function main() {
  const { data } = await supabase
    .from('media_files')
    .select('filename, title, page_context, page_section, display_order, public_url, file_type')
    .not('page_context', 'is', null)
    .order('page_context')
    .order('page_section')
    .order('display_order')
    .limit(100);

  console.log('\n📸 Currently Assigned Media:\n');
  console.table(data?.map(d => ({
    page: (d.page_context + ' > ' + d.page_section).padEnd(30),
    order: d.display_order,
    type: d.file_type,
    title: (d.title || d.filename).substring(0, 60)
  })));

  console.log(`\n Total: ${data?.length} photos assigned\n`);
}

main();
