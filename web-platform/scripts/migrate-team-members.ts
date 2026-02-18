/**
 * Migrate service_team_members from profiles.metadata.linked_services
 *
 * Reads linked_services JSONB arrays from profiles, resolves service slugs
 * to UUIDs via organization_services, and inserts into service_team_members
 * with ON CONFLICT DO NOTHING.
 *
 * Usage:
 *   npx tsx scripts/migrate-team-members.ts
 */

import { supabase } from './lib/supabase';

interface LinkedService {
  slug?: string;
  service_id?: string;
  role?: string;
}

async function migrate() {
  console.log('=== Migrate service_team_members from metadata.linked_services ===\n');

  // 1. Fetch all profiles that have linked_services in metadata
  const { data: profiles, error: profileErr } = await supabase
    .from('profiles')
    .select('id, full_name, metadata')
    .not('metadata->linked_services', 'is', null);

  if (profileErr) {
    console.error('Failed to query profiles:', profileErr.message);
    process.exit(1);
  }

  // Filter to only those with non-empty arrays
  const profilesWithLinks = (profiles || []).filter((p) => {
    const ls = p.metadata?.linked_services;
    return Array.isArray(ls) && ls.length > 0;
  });

  console.log(`Found ${profilesWithLinks.length} profiles with linked_services\n`);

  if (profilesWithLinks.length === 0) {
    console.log('Nothing to migrate.');
    return;
  }

  // 2. Fetch all organization_services for slug -> id lookup
  const { data: services, error: svcErr } = await supabase
    .from('organization_services')
    .select('id, slug, name');

  if (svcErr) {
    console.error('Failed to query organization_services:', svcErr.message);
    process.exit(1);
  }

  const slugToId = new Map<string, string>();
  for (const svc of services || []) {
    if (svc.slug) {
      slugToId.set(svc.slug, svc.id);
    }
  }

  console.log(`Loaded ${slugToId.size} services for slug lookup\n`);

  // Build a set of valid service IDs for verification
  const allServiceIds = new Set([...slugToId.values()]);

  // 3. Build insert rows
  const rows: Array<{
    service_id: string;
    profile_id: string;
    role: string;
  }> = [];

  const skipped: string[] = [];

  for (const profile of profilesWithLinks) {
    const linkedServices: LinkedService[] = profile.metadata.linked_services;

    for (const ls of linkedServices) {
      // Try direct service_id first, then fall back to slug lookup
      let serviceId = ls.service_id;
      if (!serviceId && ls.slug) {
        serviceId = slugToId.get(ls.slug);
      }
      if (!serviceId) {
        skipped.push(`${profile.full_name}: slug "${ls.slug}" not found, no service_id`);
        continue;
      }
      // Verify the service_id actually exists in our services map
      if (!allServiceIds.has(serviceId)) {
        skipped.push(`${profile.full_name}: service_id "${serviceId}" not in organization_services`);
        continue;
      }

      rows.push({
        service_id: serviceId,
        profile_id: profile.id,
        role: ls.role || 'team_member',
      });
    }
  }

  console.log(`Prepared ${rows.length} rows to insert`);
  if (skipped.length > 0) {
    console.log(`\nSkipped ${skipped.length} entries (slug not found):`);
    for (const s of skipped) {
      console.log(`  - ${s}`);
    }
  }

  if (rows.length === 0) {
    console.log('\nNo rows to insert.');
    return;
  }

  // 4. Check for existing rows to avoid duplicates
  const { data: existing } = await supabase
    .from('service_team_members')
    .select('service_id, profile_id');

  const existingSet = new Set(
    (existing || []).map((r) => `${r.service_id}:${r.profile_id}`)
  );

  const newRows = rows.filter(
    (r) => !existingSet.has(`${r.service_id}:${r.profile_id}`)
  );

  console.log(`${rows.length - newRows.length} already exist, ${newRows.length} new rows to insert`);

  if (newRows.length === 0) {
    console.log('\nAll rows already exist. Nothing to insert.');
  } else {
    const { data: inserted, error: insertErr } = await supabase
      .from('service_team_members')
      .insert(newRows)
      .select('service_id, profile_id, role');

    if (insertErr) {
      console.error('\nInsert error:', insertErr.message);
      process.exit(1);
    }

    console.log(`\nMigrated ${inserted?.length ?? 0} rows into service_team_members`);
  }

  // 5. Verify final count
  const { count } = await supabase
    .from('service_team_members')
    .select('*', { count: 'exact', head: true });

  console.log(`Total rows in service_team_members: ${count}`);
  console.log('\nDone.');
}

migrate().catch((err) => {
  console.error('Unexpected error:', err);
  process.exit(1);
});
