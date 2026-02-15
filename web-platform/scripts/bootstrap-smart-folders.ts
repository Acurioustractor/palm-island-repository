/**
 * Bootstrap smart folders for all services, projects, fiscal years, and events.
 * Run: npx tsx scripts/bootstrap-smart-folders.ts
 */
import { createClient } from '@supabase/supabase-js';
import * as dotenv from 'dotenv';
import { resolve } from 'path';

dotenv.config({ path: resolve(__dirname, '../.env.local') });

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL as string,
  process.env.SUPABASE_SERVICE_ROLE_KEY as string
);

function slugify(input: string) {
  return input.toLowerCase().trim().replace(/[^a-z0-9]+/g, '-').replace(/^-+|-+$/g, '');
}

function getFiscalYearOptions(count = 10) {
  const now = new Date();
  const start = now.getMonth() >= 6 ? now.getFullYear() : now.getFullYear() - 1;
  return Array.from({ length: count }).map((_, i) => {
    const fyStart = start - i;
    const fyEnd = fyStart + 1;
    return `${fyStart}-${String(fyEnd).slice(-2)}`;
  });
}

async function main() {
  const [servicesResult, projectsResult] = await Promise.all([
    supabase
      .from('organization_services')
      .select('name, slug, service_category')
      .eq('is_active', true)
      .order('name', { ascending: true })
      .limit(300),
    supabase
      .from('projects')
      .select('name, slug, project_type')
      .order('featured', { ascending: false })
      .order('name', { ascending: true })
      .limit(300),
  ]);

  if (servicesResult.error) throw servicesResult.error;
  if (projectsResult.error) throw projectsResult.error;

  const years = getFiscalYearOptions(10);

  const serviceFolders = (servicesResult.data || []).map((s: any) => {
    const category = String(s.service_category || '').toLowerCase();
    const icon = category === 'health' ? 'Heart' : category === 'culture' ? 'Star' : category === 'youth' || category === 'family' ? 'Users' : 'Folder';
    const color = category === 'health' ? 'green' : category === 'culture' ? 'purple' : category === 'youth' ? 'blue' : category === 'family' ? 'pink' : 'amber';
    return {
      name: `Service: ${s.name}`,
      slug: `service-${slugify(s.slug || s.name)}`,
      description: `All media tagged to the ${s.name} service.`,
      icon, color, is_system: true,
      query_rules: { filters: [{ field: 'tags', operator: 'contains', value: `service:${s.slug}` }] },
    };
  });

  const projectFolders = (projectsResult.data || []).map((p: any) => ({
    name: `Project: ${p.name}`,
    slug: `project-${slugify(p.slug || p.name)}`,
    description: `All media tagged to the ${p.name} innovation project.`,
    icon: 'Folder', color: 'amber', is_system: true,
    query_rules: { filters: [{ field: 'tags', operator: 'contains', value: `project:${p.slug}` }] },
  }));

  const yearFolders = years.map((fy) => ({
    name: `FY ${fy}`,
    slug: `fy-${slugify(fy)}`,
    description: `All media tagged for fiscal year ${fy}.`,
    icon: 'Calendar', color: 'blue', is_system: true,
    query_rules: { filters: [{ field: 'tags', operator: 'contains', value: `fy:${fy}` }] },
  }));

  const annualReportFolders = years.map((fy) => ({
    name: `Annual Report FY ${fy}`,
    slug: `annual-report-${slugify(fy)}`,
    description: `Annual report media for ${fy}.`,
    icon: 'FileText', color: 'purple', is_system: true,
    query_rules: {
      filters: [
        { field: 'tags', operator: 'contains', value: 'annual-report' },
        { field: 'tags', operator: 'contains', value: `fy:${fy}` },
      ],
    },
  }));

  const utilityFolders = [
    {
      name: 'Profile Photos', slug: 'profile-photos',
      description: 'Staff and storyteller profile photos.',
      icon: 'Users', color: 'green', is_system: true,
      query_rules: { filters: [{ field: 'tags', operator: 'contains', value: 'profile-image' }] },
    },
    {
      name: 'Untagged Media', slug: 'untagged',
      description: 'Media without any tags — needs triage.',
      icon: 'AlertCircle', color: 'red', is_system: true,
      query_rules: { filters: [{ field: 'tags', operator: 'empty', value: true }] },
    },
    {
      name: 'Needs Review (Junk)', slug: 'audit-junk',
      description: 'Small PDF extracts and page renders flagged for cleanup.',
      icon: 'AlertCircle', color: 'red', is_system: true,
      query_rules: { filters: [{ field: 'tags', operator: 'contains', value: 'audit:junk' }] },
    },
  ];

  const folders = [...utilityFolders, ...serviceFolders, ...projectFolders, ...yearFolders, ...annualReportFolders];

  const { error, count } = await supabase
    .from('smart_folders')
    .upsert(folders, { onConflict: 'slug' });

  if (error) throw error;

  console.log(`Bootstrapped ${folders.length} smart folders:`);
  console.log(`  Services: ${serviceFolders.length}`);
  console.log(`  Projects: ${projectFolders.length}`);
  console.log(`  Fiscal Years: ${yearFolders.length}`);
  console.log(`  Annual Reports: ${annualReportFolders.length}`);
  console.log(`  Utility: ${utilityFolders.length}`);
}

main().catch(console.error);
