import { createClient } from '@supabase/supabase-js';
import { config } from 'dotenv';

config({ path: '.env.local' });

const supabase = createClient(process.env.NEXT_PUBLIC_SUPABASE_URL, process.env.SUPABASE_SERVICE_ROLE_KEY);

const { data, error } = await supabase.from('organization_services').select('id, name, slug, is_active, service_category, description, metadata').order('name');
if (error) { console.error(error.message); process.exit(1); }

const byName = {};
for (const s of data) {
  const key = s.name.toLowerCase().trim();
  if (!(key in byName)) byName[key] = [];
  byName[key].push(s);
}

console.log('=== EXACT DUPLICATES ===');
for (const [, group] of Object.entries(byName)) {
  if (group.length > 1) {
    console.log('');
    for (const s of group) {
      const dl = s.description ? s.description.length : 0;
      const dp = s.description ? s.description.substring(0, 120) : '(none)';
      console.log(`id=${s.id} name="${s.name}" slug=${s.slug} active=${s.is_active} cat=${s.service_category} desc_len=${dl}`);
      console.log(`  desc: ${dp}`);
      console.log(`  meta: ${JSON.stringify(s.metadata || {})}`);
    }
  }
}

// Near dupes
console.log('\n=== NEAR DUPLICATES ===');
const nearPairs = [
  ['Community Justice', 'Community Justice Group'],
  ["Women's Services", "Women's Service"],
  ["Women's Services", "Women's Healing Service"],
  ['Youth Services', 'Youth Service'],
];
for (const [a, b] of nearPairs) {
  const sa = data.find(s => s.name === a);
  const sb = data.find(s => s.name === b);
  if (sa && sb) {
    console.log('');
    console.log(`KEEP: "${sa.name}" id=${sa.id} active=${sa.is_active} desc_len=${(sa.description||'').length}`);
    console.log(`  desc: ${(sa.description || '(none)').substring(0, 150)}`);
    console.log(`  meta: ${JSON.stringify(sa.metadata || {})}`);
    console.log(`MERGE: "${sb.name}" id=${sb.id} active=${sb.is_active} desc_len=${(sb.description||'').length}`);
    console.log(`  desc: ${(sb.description || '(none)').substring(0, 150)}`);
    console.log(`  meta: ${JSON.stringify(sb.metadata || {})}`);
  }
}

console.log(`\nTotal: ${data.length}`);
