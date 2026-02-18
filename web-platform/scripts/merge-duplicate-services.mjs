/**
 * Merge duplicate services: preserve the best content from both copies,
 * move references to the canonical (active) service, then delete the duplicate.
 */
import { createClient } from '@supabase/supabase-js';
import { config } from 'dotenv';

config({ path: '.env.local' });

const supabase = createClient(process.env.NEXT_PUBLIC_SUPABASE_URL, process.env.SUPABASE_SERVICE_ROLE_KEY);

// Define merge plan: [keepId, mergeId, strategy]
// strategy: 'prefer-merge' means the inactive copy has better content
const MERGE_PLAN = [
  {
    keepId: 'caeea230-5121-4f19-a388-c6efb7b68322', // Bwgcolman Healing Service (active)
    mergeId: 'c0000000-0000-0000-0000-000000000001', // Bwgcolman Healing Service (inactive, richer)
    label: 'Bwgcolman Healing Service',
  },
  {
    keepId: 'c509138f-d8b2-4ada-80c0-51e2e19c0ada', // Digital Service Centre (active)
    mergeId: 'c0000000-0000-0000-0000-000000000003', // Digital Service Centre (inactive, richer)
    label: 'Digital Service Centre',
  },
  {
    keepId: '4fe57414-ab35-4a1b-903d-6c0a374db358', // Family Wellbeing Centre (active)
    mergeId: 'c0000000-0000-0000-0000-000000000008', // Family Wellbeing Centre (inactive, richer)
    label: 'Family Wellbeing Centre',
  },
  {
    keepId: 'e9447f4b-6241-4cb6-89c5-ee91bf71c3c1', // Community Justice (active)
    mergeId: 'c0000000-0000-0000-0000-000000000002', // Community Justice Group (inactive, richer)
    label: 'Community Justice / Community Justice Group',
  },
  {
    keepId: 'ea8c1d4b-b643-41bf-9c42-8e882423ade4', // Women's Services (active)
    mergeId: 'c0000000-0000-0000-0000-000000000015', // Women's Service (inactive, has metrics)
    label: "Women's Services / Women's Service",
  },
  {
    keepId: 'ea8c1d4b-b643-41bf-9c42-8e882423ade4', // Women's Services (active)
    mergeId: 'c0000000-0000-0000-0000-000000000014', // Women's Healing Service (inactive, has programs)
    label: "Women's Services / Women's Healing Service",
  },
  {
    keepId: '0f763e1d-bd5b-47a1-90bc-62e56ed802ac', // Youth Services (active)
    mergeId: 'c0000000-0000-0000-0000-000000000016', // Youth Service (inactive, richer)
    label: 'Youth Services / Youth Service',
  },
];

// Tables that might reference service_id
const REF_TABLES = ['stories', 'profiles', 'organization_members', 'data_snapshots'];

async function mergeOne(plan) {
  console.log(`\n--- Merging: ${plan.label} ---`);

  // 1. Fetch both services
  const { data: keepSvc } = await supabase.from('organization_services').select('*').eq('id', plan.keepId).single();
  const { data: mergeSvc } = await supabase.from('organization_services').select('*').eq('id', plan.mergeId).single();

  if (!keepSvc) { console.log(`  SKIP: keep service ${plan.keepId} not found`); return; }
  if (!mergeSvc) { console.log(`  SKIP: merge service ${plan.mergeId} not found`); return; }

  // 2. Merge content: take the longer description, merge metadata
  const keepDesc = keepSvc.description || '';
  const mergeDesc = mergeSvc.description || '';
  const bestDescription = mergeDesc.length > keepDesc.length ? mergeDesc : keepDesc;

  // Deep merge metadata: keep all keys from both, merge-side wins for conflicts
  const keepMeta = keepSvc.metadata || {};
  const mergeMeta = mergeSvc.metadata || {};
  const mergedMetadata = { ...keepMeta, ...mergeMeta };
  // But preserve keep's lat/long if merge doesn't have them
  if (keepMeta.latitude && !mergeMeta.latitude) mergedMetadata.latitude = keepMeta.latitude;
  if (keepMeta.longitude && !mergeMeta.longitude) mergedMetadata.longitude = keepMeta.longitude;

  console.log(`  Keep: "${keepSvc.name}" (${keepSvc.slug}) desc_len=${keepDesc.length}`);
  console.log(`  Merge: "${mergeSvc.name}" (${mergeSvc.slug}) desc_len=${mergeDesc.length}`);
  console.log(`  Best desc length: ${bestDescription.length}`);
  console.log(`  Merged metadata keys: ${Object.keys(mergedMetadata).join(', ')}`);

  // 3. Update the keep service with merged content
  const { error: updateErr } = await supabase
    .from('organization_services')
    .update({
      description: bestDescription,
      metadata: mergedMetadata,
    })
    .eq('id', plan.keepId);

  if (updateErr) {
    console.log(`  ERROR updating keep service: ${updateErr.message}`);
    return;
  }
  console.log(`  Updated keep service with merged content`);

  // 4. Move references from merge service to keep service
  for (const table of REF_TABLES) {
    try {
      const { data: refs, error: refErr } = await supabase
        .from(table)
        .update({ service_id: plan.keepId })
        .eq('service_id', plan.mergeId)
        .select('id');

      if (refErr) {
        // Table might not exist or not have service_id column - that's OK
        if (!refErr.message.includes('does not exist') && !refErr.message.includes('column')) {
          console.log(`  Warning: ${table} - ${refErr.message}`);
        }
        continue;
      }
      if (refs && refs.length > 0) {
        console.log(`  Moved ${refs.length} references from ${table}`);
      }
    } catch (e) {
      // Ignore tables that don't exist
    }
  }

  // 5. Delete the duplicate service
  const { error: deleteErr } = await supabase
    .from('organization_services')
    .delete()
    .eq('id', plan.mergeId);

  if (deleteErr) {
    console.log(`  ERROR deleting merge service: ${deleteErr.message}`);
    // Fallback: just deactivate it
    await supabase.from('organization_services').update({ is_active: false }).eq('id', plan.mergeId);
    console.log(`  Deactivated instead`);
    return;
  }
  console.log(`  Deleted duplicate: "${mergeSvc.name}" (${mergeSvc.slug})`);
}

async function main() {
  console.log('=== Service Duplicate Merger ===');
  console.log(`Processing ${MERGE_PLAN.length} merge operations...\n`);

  // Snapshot before
  const { data: before } = await supabase.from('organization_services').select('id').order('name');
  console.log(`Services before: ${before.length}`);

  for (const plan of MERGE_PLAN) {
    await mergeOne(plan);
  }

  // Count after
  const { data: after } = await supabase.from('organization_services').select('id').order('name');
  console.log(`\n=== DONE ===`);
  console.log(`Services before: ${before.length}`);
  console.log(`Services after: ${after.length}`);
  console.log(`Removed: ${before.length - after.length} duplicates`);
}

main().catch(e => { console.error('Fatal:', e.message); process.exit(1); });
