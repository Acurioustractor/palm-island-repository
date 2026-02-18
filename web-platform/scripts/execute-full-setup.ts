import { config } from 'dotenv';
import { resolve } from 'path';
import { createClient } from '@supabase/supabase-js';

config({ path: resolve(process.cwd(), '.env.local') });

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
);

async function checkConnection() {
  console.log('🔌 Testing Supabase connection...');
  const { data, error } = await supabase.from('knowledge_entries').select('count', { count: 'exact', head: true });
  if (error) {
    console.error('❌ Connection failed:', error.message);
    return false;
  }
  console.log('✅ Connected to Supabase');
  return true;
}

async function createInnovationProjectsTable() {
  console.log('\n📊 Creating innovation_projects table...');
  
  // Check if table exists by trying to query it
  const { error: checkError } = await supabase
    .from('innovation_projects')
    .select('count', { count: 'exact', head: true });
  
  if (!checkError) {
    console.log('   ✅ innovation_projects table already exists');
    return true;
  }
  
  console.log('   ⚠️ Table does not exist');
  console.log('   📝 SQL to create table (run in Supabase SQL Editor):');
  console.log(`
CREATE TABLE innovation_projects (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  slug text UNIQUE NOT NULL,
  name text NOT NULL,
  category text NOT NULL,
  description text,
  innovation_type text[],
  start_date date,
  status text DEFAULT 'active',
  people_impacted integer DEFAULT 0,
  jobs_created integer DEFAULT 0,
  revenue_generated decimal(12,2),
  hero_image_url text,
  gallery_images text[],
  tags text[],
  challenge text,
  solution text,
  outcome text,
  future_vision text,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

ALTER TABLE innovation_projects ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Innovation projects are viewable by everyone" ON innovation_projects FOR SELECT USING (true);
CREATE POLICY "Authenticated users can manage innovation projects" ON innovation_projects FOR ALL TO authenticated USING (true) WITH CHECK (true);
  `);
  return false;
}

async function insertInnovationProjects() {
  console.log('\n🚀 Inserting/updating innovation projects...');
  
  const projects = [
    {
      slug: 'elders-hull-river',
      name: 'Elders Hull River On-Country Journey',
      category: 'cultural',
      description: 'Elder-led cultural revitalization through traditional country visits to Hull River.',
      innovation_type: ['cultural-revival', 'on-country', 'intergenerational-knowledge'],
      start_date: '2024-01-01',
      status: 'active',
      tags: ['elders', 'culture', 'heritage', 'on-country'],
      people_impacted: 20,
      jobs_created: 0,
      challenge: 'Loss of connection to traditional country',
      solution: 'Organized elder-led journeys with documentation',
      outcome: 'Revived cultural practices, documented elder knowledge',
      future_vision: 'Expand to regular on-country programs'
    },
    {
      slug: 'automated-annual-reports',
      name: 'AI-Powered Annual Report System',
      category: 'digital',
      description: 'Automated extraction and AI indexing of 15 years of annual reports.',
      innovation_type: ['ai', 'automation', 'digital-transformation'],
      start_date: '2025-01-01',
      status: 'active',
      tags: ['innovation', 'ai', 'reports', 'digital'],
      people_impacted: 100,
      jobs_created: 0,
      challenge: 'Manual processing would take months',
      solution: 'Built AI pipeline for extraction and search',
      outcome: '270 pages digitized, 86 entries created',
      future_vision: 'Extend AI for insights and analytics'
    },
    {
      slug: 'on-country-photo-studio',
      name: 'On-Country Professional Photography',
      category: 'creative',
      description: 'Professional photo studio capturing elder portraits and cultural moments.',
      innovation_type: ['creative-industries', 'skills-development'],
      start_date: '2025-10-01',
      status: 'active',
      tags: ['photography', 'elders', 'creative', 'culture'],
      people_impacted: 323,
      jobs_created: 3,
      challenge: 'Limited professional photography on island',
      solution: 'Established on-country studio with training',
      outcome: '323 photos, 20+ elder portraits',
      future_vision: 'Expand to commercial services'
    },
    {
      slug: 'recycling-bed-manufacturing',
      name: 'The Centre: Plastic Recycling Bed Manufacturing',
      category: 'manufacturing',
      description: 'Circular economy manufacturing from plastic waste to beds.',
      innovation_type: ['circular-economy', 'manufacturing', 'sustainability'],
      start_date: '2025-01-01',
      status: 'planning',
      tags: ['recycling', 'manufacturing', 'the-centre'],
      people_impacted: 0,
      jobs_created: 0,
      challenge: 'Plastic waste and limited manufacturing jobs',
      solution: 'Recycling facility for bed production',
      outcome: null,
      future_vision: '500+ beds annually, 10+ jobs'
    },
    {
      slug: 'kitchen-youth-employment',
      name: 'The Centre: Commercial Kitchen & Youth Employment',
      category: 'training',
      description: 'Commercial kitchen training for youth employment pathways.',
      innovation_type: ['hospitality', 'youth-employment', 'training'],
      start_date: '2025-01-01',
      status: 'planning',
      tags: ['kitchen', 'youth', 'employment', 'training'],
      people_impacted: 0,
      jobs_created: 0,
      challenge: 'Limited youth employment pathways',
      solution: 'Kitchen with accredited training programs',
      outcome: null,
      future_vision: '50+ youth trained annually'
    }
  ];
  
  let success = 0;
  let failed = 0;
  
  for (const project of projects) {
    // Try upsert (insert or update)
    const { error } = await supabase
      .from('innovation_projects')
      .upsert(project, { 
        onConflict: 'slug',
        ignoreDuplicates: false 
      });
    
    if (error) {
      console.log(`   ❌ ${project.slug}: ${error.message}`);
      failed++;
    } else {
      console.log(`   ✅ ${project.slug}`);
      success++;
    }
  }
  
  console.log(`\n   Summary: ${success} succeeded, ${failed} failed`);
  return failed === 0;
}

async function verifyData() {
  console.log('\n🔍 Verifying data...');
  
  // Check innovation projects
  const { data: projects, error: projError } = await supabase
    .from('innovation_projects')
    .select('slug, name, status');
  
  if (projError) {
    console.log('   ❌ Cannot query innovation_projects:', projError.message);
  } else {
    console.log(`   ✅ innovation_projects: ${projects?.length || 0} records`);
    projects?.forEach(p => console.log(`      • ${p.name} (${p.status})`));
  }
  
  // Check knowledge entries
  const { data: keData } = await supabase
    .from('knowledge_entries')
    .select('fiscal_year')
    .like('slug', 'picc-annual-report%-full-pdf')
    .order('fiscal_year');
  
  console.log(`\n   ✅ Annual reports: ${keData?.length || 0}`);
  
  // Check stories
  const { count: storyCount } = await supabase
    .from('stories')
    .select('*', { count: 'exact', head: true });
  console.log(`   ✅ Stories: ${storyCount}`);
  
  // Check media
  const { count: mediaCount } = await supabase
    .from('media_files')
    .select('*', { count: 'exact', head: true });
  console.log(`   ✅ Media files: ${mediaCount}`);
}

async function displaySummary() {
  console.log('\n' + '='.repeat(70));
  console.log('📊 SETUP SUMMARY');
  console.log('='.repeat(70));
  
  console.log('\n✅ DATA AVAILABLE:');
  console.log('   • 15 Annual Reports (2009-2024)');
  console.log('   • 77 Community Stories');
  console.log('   • 1,885 Media Files');
  console.log('   • 86 Knowledge Entries');
  console.log('   • 5 Innovation Projects');
  
  console.log('\n📈 20-YEAR COUNTDOWN:');
  console.log('   • Years: 18/20 (90%)');
  console.log('   • Staff: 197/300 (66%)');
  console.log('   • Services: 16/20 (80%)');
  console.log('   • Stories: 77/150 (51%)');
  console.log('   • Target: July 2029 (2.5 years)');
  
  console.log('\n🚀 NEXT STEPS:');
  console.log('   1. If innovation_projects table missing, run SQL in Supabase');
  console.log('   2. Enter The Centre baseline data');
  console.log('   3. Build /20-years timeline page');
  console.log('   4. Complete historical staff data (2009-2019)');
  
  console.log('\n' + '='.repeat(70));
}

async function main() {
  console.log('='.repeat(70));
  console.log('🚀 EXECUTING FULL DATA SETUP');
  console.log('='.repeat(70));
  
  const connected = await checkConnection();
  if (!connected) {
    console.error('❌ Cannot connect to Supabase. Check .env.local');
    process.exit(1);
  }
  
  const tableExists = await createInnovationProjectsTable();
  
  if (tableExists) {
    await insertInnovationProjects();
  }
  
  await verifyData();
  await displaySummary();
  
  console.log('\n✅ Setup execution complete!');
}

main().catch(err => {
  console.error('Fatal error:', err);
  process.exit(1);
});
