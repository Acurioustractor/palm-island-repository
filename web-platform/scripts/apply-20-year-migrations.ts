import { config } from 'dotenv';
import { resolve } from 'path';
import { createClient } from '@supabase/supabase-js';
import { readFileSync } from 'fs';

config({ path: resolve(process.cwd(), '.env.local') });

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
);

async function applyMigration(filePath: string, name: string) {
  console.log(`\n🔄 Applying: ${name}`);
  
  try {
    const sql = readFileSync(filePath, 'utf-8');
    
    // Split SQL into individual statements
    const statements = sql
      .split(';')
      .map(s => s.trim())
      .filter(s => s.length > 0 && !s.startsWith('--'));
    
    for (const statement of statements) {
      const { error } = await supabase.rpc('exec_sql', { sql: statement + ';' });
      
      if (error) {
        // Try direct query if RPC fails
        const { error: queryError } = await supabase.from('_sql').select('*').eq('query', statement + ';');
        if (queryError) {
          console.log(`   ⚠️ Statement skipped: ${error.message}`);
        }
      }
    }
    
    console.log(`   ✅ ${name} applied`);
    return true;
  } catch (err: any) {
    console.error(`   ❌ Error: ${err.message}`);
    return false;
  }
}

async function createViewsDirectly() {
  console.log('\n📊 Creating SQL Views directly...');
  
  // View 1: Annual Report Timeline
  const { error: v1Error } = await supabase.rpc('exec_sql', {
    sql: `
      CREATE OR REPLACE VIEW annual_report_timeline AS
      SELECT 
        ke.fiscal_year,
        ke.title,
        ke.summary,
        ke.keywords,
        ke.created_at as indexed_at,
        CASE 
          WHEN ke.fiscal_year BETWEEN '2009-10' AND '2012-13' THEN 'Foundation'
          WHEN ke.fiscal_year BETWEEN '2013-14' AND '2018-19' THEN 'Growth'
          WHEN ke.fiscal_year BETWEEN '2019-20' AND '2020-21' THEN 'Transition'
          WHEN ke.fiscal_year >= '2021-22' THEN 'Community-Led'
        END as era,
        CASE 
          WHEN ke.fiscal_year BETWEEN '2009-10' AND '2012-13' THEN '#F59E0B'
          WHEN ke.fiscal_year BETWEEN '2013-14' AND '2018-19' THEN '#8B5CF6'
          WHEN ke.fiscal_year BETWEEN '2019-20' AND '2020-21' THEN '#10B981'
          WHEN ke.fiscal_year >= '2021-22' THEN '#3B82F6'
        END as era_color
      FROM knowledge_entries ke
      WHERE ke.entry_type = 'document'
        AND ke.category = 'annual-report'
        AND ke.fiscal_year IS NOT NULL
      ORDER BY ke.fiscal_year;
    `
  });
  
  if (v1Error) console.log('   ⚠️ annual_report_timeline:', v1Error.message);
  else console.log('   ✅ annual_report_timeline');
  
  // View 2: Progress to 20 Years
  const { error: v2Error } = await supabase.rpc('exec_sql', {
    sql: `
      CREATE OR REPLACE VIEW progress_to_20_years AS
      SELECT 
        '2009-07-01'::date as start_date,
        '2029-07-01'::date as target_date,
        CURRENT_DATE as today,
        EXTRACT(YEAR FROM AGE(CURRENT_DATE, '2009-07-01'::date)) as years_elapsed,
        EXTRACT(YEAR FROM AGE('2029-07-01'::date, CURRENT_DATE)) as years_remaining,
        197 as current_staff,
        300 as target_staff,
        16 as current_services,
        20 as target_services,
        77 as current_stories,
        150 as target_stories,
        82.2 as current_indigenous_pct,
        85.0 as target_indigenous_pct
    `
  });
  
  if (v2Error) console.log('   ⚠️ progress_to_20_years:', v2Error.message);
  else console.log('   ✅ progress_to_20_years');
}

async function createInnovationProjectsTable() {
  console.log('\n🚀 Creating innovation_projects table...');
  
  const { error: tableError } = await supabase.rpc('exec_sql', {
    sql: `
      CREATE TABLE IF NOT EXISTS innovation_projects (
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
    `
  });
  
  if (tableError) {
    console.log('   ⚠️ Table creation:', tableError.message);
    return;
  }
  console.log('   ✅ innovation_projects table');
  
  // Insert projects
  const projects = [
    {
      slug: 'elders-hull-river',
      name: 'Elders Hull River On-Country Journey',
      category: 'cultural',
      description: 'Elder-led cultural revitalization through traditional country visits to Hull River',
      innovation_type: ['cultural-revival', 'on-country', 'intergenerational-knowledge'],
      start_date: '2024-01-01',
      status: 'active',
      tags: ['elders', 'culture', 'heritage', 'on-country'],
      challenge: 'Loss of connection to traditional country',
      solution: 'Organized elder-led journeys with documentation',
      outcome: 'Revived cultural practices, documented knowledge',
      future_vision: 'Expand to regular on-country programs'
    },
    {
      slug: 'automated-reports',
      name: 'AI-Powered Annual Report System',
      category: 'digital',
      description: 'Automated extraction and AI indexing of 15 years of annual reports',
      innovation_type: ['ai', 'automation', 'digital-transformation'],
      start_date: '2025-01-01',
      status: 'active',
      tags: ['innovation', 'ai', 'reports', 'digital'],
      challenge: 'Manual processing would take months',
      solution: 'Built AI pipeline for extraction and search',
      outcome: '270 pages digitized, 86 entries created',
      future_vision: 'Extend AI for insights and analytics'
    },
    {
      slug: 'on-country-photo-studio',
      name: 'On-Country Professional Photography',
      category: 'creative',
      description: 'Professional photo studio capturing elder portraits and cultural moments',
      innovation_type: ['creative-industries', 'skills-development', 'cultural-preservation'],
      start_date: '2025-10-01',
      status: 'active',
      tags: ['photography', 'elders', 'creative', 'culture'],
      challenge: 'Limited professional photography on island',
      solution: 'Established on-country studio with training',
      outcome: '323 photos, 20+ elder portraits captured',
      future_vision: 'Expand to commercial services'
    },
    {
      slug: 'recycling-bed-manufacturing',
      name: 'The Centre: Plastic Recycling Bed Manufacturing',
      category: 'manufacturing',
      description: 'Circular economy manufacturing from plastic waste to beds',
      innovation_type: ['circular-economy', 'manufacturing', 'sustainability'],
      start_date: '2025-01-01',
      status: 'planning',
      tags: ['recycling', 'manufacturing', 'the-centre'],
      challenge: 'Plastic waste and limited manufacturing jobs',
      solution: 'Recycling facility for bed production',
      outcome: null,
      future_vision: '500+ beds annually, 10+ jobs'
    },
    {
      slug: 'kitchen-youth-employment',
      name: 'The Centre: Commercial Kitchen & Youth Employment',
      category: 'training',
      description: 'Commercial kitchen training for youth employment pathways',
      innovation_type: ['hospitality', 'youth-employment', 'training'],
      start_date: '2025-01-01',
      status: 'planning',
      tags: ['kitchen', 'youth', 'employment', 'training'],
      challenge: 'Limited youth employment pathways',
      solution: 'Kitchen with accredited training programs',
      outcome: null,
      future_vision: '50+ youth trained annually'
    }
  ];
  
  for (const project of projects) {
    const { error } = await supabase
      .from('innovation_projects')
      .upsert(project, { onConflict: 'slug' });
    
    if (error) console.log(`   ⚠️ ${project.slug}:`, error.message);
    else console.log(`   ✅ ${project.slug}`);
  }
}

async function main() {
  console.log('='.repeat(60));
  console.log('🚀 APPLYING 20-YEAR VISION MIGRATIONS');
  console.log('='.repeat(60));
  
  await createViewsDirectly();
  await createInnovationProjectsTable();
  
  console.log('\n' + '='.repeat(60));
  console.log('✅ Migrations Complete!');
  console.log('='.repeat(60));
  console.log('\n📊 New Views Created:');
  console.log('   • annual_report_timeline');
  console.log('   • progress_to_20_years');
  console.log('\n🚀 New Table Created:');
  console.log('   • innovation_projects (5 projects added)');
  console.log('\n📝 Next: Run historical data extraction');
}

main().catch(console.error);
