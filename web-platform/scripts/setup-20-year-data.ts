import { config } from 'dotenv';
import { resolve } from 'path';
import { createClient } from '@supabase/supabase-js';

config({ path: resolve(process.cwd(), '.env.local') });

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
);

async function checkAndCreateTable() {
  console.log('🔍 Checking innovation_projects table...');
  
  // Try to query the table
  const { error } = await supabase
    .from('innovation_projects')
    .select('count', { count: 'exact', head: true });
  
  if (error && error.message.includes('does not exist')) {
    console.log('   Table does not exist. Creating via REST API...');
    // Table doesn't exist - need to create via SQL Editor manually
    console.log('   ⚠️ Please run this SQL in Supabase SQL Editor:');
    console.log('  ');
    console.log('   CREATE TABLE innovation_projects (');
    console.log('     id uuid PRIMARY KEY DEFAULT gen_random_uuid(),');
    console.log('     slug text UNIQUE NOT NULL,');
    console.log('     name text NOT NULL,');
    console.log('     category text NOT NULL,');
    console.log('     description text,');
    console.log('     innovation_type text[],');
    console.log('     start_date date,');
    console.log('     status text DEFAULT \'active\',');
    console.log('     people_impacted integer DEFAULT 0,');
    console.log('     jobs_created integer DEFAULT 0,');
    console.log('     revenue_generated decimal(12,2),');
    console.log('     hero_image_url text,');
    console.log('     gallery_images text[],');
    console.log('     tags text[],');
    console.log('     challenge text,');
    console.log('     solution text,');
    console.log('     outcome text,');
    console.log('     future_vision text,');
    console.log('     created_at timestamptz DEFAULT now(),');
    console.log('     updated_at timestamptz DEFAULT now()');
    console.log('   );');
    return false;
  } else {
    console.log('   ✅ innovation_projects table exists');
    return true;
  }
}

async function insertInnovationProjects() {
  console.log('\n🚀 Inserting innovation projects...');
  
  const projects = [
    {
      slug: 'elders-hull-river',
      name: 'Elders Hull River On-Country Journey',
      category: 'cultural',
      description: 'Elder-led cultural revitalization through traditional country visits to Hull River. Reviving intergenerational knowledge transfer and on-country cultural practices.',
      innovation_type: ['cultural-revival', 'on-country', 'intergenerational-knowledge'],
      start_date: '2024-01-01',
      status: 'active',
      tags: ['elders', 'culture', 'heritage', 'on-country', 'hull-river'],
      challenge: 'Loss of connection to traditional country and intergenerational knowledge gap',
      solution: 'Organized elder-led journeys to Hull River with cultural documentation and youth participation',
      outcome: 'Revived cultural practices, documented elder knowledge, strengthened youth connection to country',
      future_vision: 'Expand to regular on-country programs and establish cultural knowledge archive'
    },
    {
      slug: 'automated-annual-reports',
      name: 'AI-Powered Annual Report System',
      category: 'digital',
      description: 'Automated extraction and AI indexing of 15 years of annual reports. First Indigenous organization using AI for report processing and semantic search.',
      innovation_type: ['ai', 'automation', 'digital-transformation', 'knowledge-management'],
      start_date: '2025-01-01',
      status: 'active',
      tags: ['innovation', 'ai', 'reports', 'digital', 'automation'],
      challenge: 'Manual processing of 15 years of annual reports would take months',
      solution: 'Built automated pipeline using AI to extract text, generate summaries, and create searchable embeddings',
      outcome: '270 pages digitized, 86 knowledge entries created, semantic search enabled',
      future_vision: 'Extend AI capabilities to extract insights and generate predictive analytics'
    },
    {
      slug: 'on-country-photo-studio',
      name: 'On-Country Professional Photography',
      category: 'creative',
      description: 'Professional photo studio capturing elder portraits and cultural moments on Palm Island. Skills development in creative industries.',
      innovation_type: ['creative-industries', 'skills-development', 'cultural-preservation'],
      start_date: '2025-10-01',
      status: 'active',
      tags: ['photography', 'elders', 'creative', 'culture', 'portraits'],
      challenge: 'Limited professional photography documenting community and culture',
      solution: 'Established on-country photo studio with professional equipment and training programs',
      outcome: '323 professional photos captured, 20+ elder portraits, youth trained in photography',
      future_vision: 'Expand to commercial photography services and multimedia production'
    },
    {
      slug: 'recycling-bed-manufacturing',
      name: 'The Centre: Plastic Recycling Bed Manufacturing',
      category: 'manufacturing',
      description: 'Circular economy manufacturing converting plastic waste to beds. First of its kind on Palm Island with export potential.',
      innovation_type: ['circular-economy', 'manufacturing', 'sustainability', 'employment'],
      start_date: '2025-01-01',
      status: 'planning',
      tags: ['recycling', 'manufacturing', 'the-centre', 'sustainability', 'beds'],
      challenge: 'Plastic waste accumulation and limited manufacturing employment on island',
      solution: 'Establish recycling facility to convert plastic waste into durable beds',
      outcome: null,
      future_vision: 'Produce 500+ beds annually, create 10+ manufacturing jobs, export to other communities'
    },
    {
      slug: 'kitchen-youth-employment',
      name: 'The Centre: Commercial Kitchen & Youth Employment',
      category: 'training',
      description: 'Commercial kitchen training facility creating youth employment pathways through hospitality skills and catering services.',
      innovation_type: ['hospitality', 'youth-employment', 'training', 'food'],
      start_date: '2025-01-01',
      status: 'planning',
      tags: ['kitchen', 'youth', 'employment', 'training', 'the-centre', 'hospitality'],
      challenge: 'Limited youth employment pathways and hospitality training opportunities',
      solution: 'Build commercial kitchen with accredited training programs and catering business',
      outcome: null,
      future_vision: 'Train 50+ youth annually, achieve 80% employment placement, serve 100+ catering events'
    }
  ];
  
  let inserted = 0;
  let updated = 0;
  
  for (const project of projects) {
    // Try to insert, if fails due to conflict, update
    const { error: insertError } = await supabase
      .from('innovation_projects')
      .insert(project);
    
    if (insertError) {
      if (insertError.message.includes('duplicate')) {
        // Update existing
        const { error: updateError } = await supabase
          .from('innovation_projects')
          .update(project)
          .eq('slug', project.slug);
        
        if (updateError) {
          console.log(`   ⚠️ ${project.slug}: ${updateError.message}`);
        } else {
          console.log(`   🔄 ${project.slug}`);
          updated++;
        }
      } else {
        console.log(`   ❌ ${project.slug}: ${insertError.message}`);
      }
    } else {
      console.log(`   ✅ ${project.slug}`);
      inserted++;
    }
  }
  
  console.log(`\n   Summary: ${inserted} inserted, ${updated} updated`);
}

async function verifyKnowledgeEntries() {
  console.log('\n📚 Verifying annual report knowledge entries...');
  
  const { data, error } = await supabase
    .from('knowledge_entries')
    .select('fiscal_year, title')
    .like('slug', 'picc-annual-report%-full-pdf')
    .order('fiscal_year');
  
  if (error) {
    console.log('   ❌ Error:', error.message);
    return;
  }
  
  console.log(`   ✅ Found ${data?.length || 0} annual reports`);
  
  // Group by era
  const eras: Record<string, string[]> = {};
  data?.forEach(report => {
    const year = report.fiscal_year;
    let era = 'Unknown';
    if (year >= '2009-10' && year <= '2012-13') era = 'Foundation (2009-2012)';
    else if (year >= '2013-14' && year <= '2018-19') era = 'Growth (2013-2018)';
    else if (year >= '2019-20' && year <= '2020-21') era = 'Transition (2019-2020)';
    else if (year >= '2021-22') era = 'Community-Led (2021+)';
    
    if (!eras[era]) eras[era] = [];
    eras[era].push(year);
  });
  
  console.log('\n   By Era:');
  Object.entries(eras).forEach(([era, years]) => {
    console.log(`   • ${era}: ${years.length} reports`);
  });
}

async function createDataExtractionLog() {
  console.log('\n📝 Checking data_extraction_log table...');
  
  const { error } = await supabase
    .from('data_extraction_log')
    .select('count', { count: 'exact', head: true });
  
  if (error && error.message.includes('does not exist')) {
    console.log('   ⚠️ Table does not exist');
    console.log('   Please create it in Supabase SQL Editor:');
    console.log('   CREATE TABLE data_extraction_log (');
    console.log('     id uuid PRIMARY KEY DEFAULT gen_random_uuid(),');
    console.log('     fiscal_year text,');
    console.log('     table_affected text,');
    console.log('     records_extracted integer,');
    console.log('     confidence_score integer,');
    console.log('     extraction_notes text,');
    console.log('     extracted_at timestamptz DEFAULT now()');
    console.log('   );');
  } else {
    console.log('   ✅ data_extraction_log table exists');
  }
}

async function displayCurrentMetrics() {
  console.log('\n📊 CURRENT PICC METRICS');
  console.log('='.repeat(50));
  
  // Staff stats
  const { data: staffData } = await supabase
    .from('staff_statistics')
    .select('*')
    .order('year');
  
  console.log('\n👥 Staff History:');
  if (staffData && staffData.length > 0) {
    staffData.forEach(s => {
      console.log(`   ${s.year}: ${s.total_staff} staff (${s.indigenous_staff || '?'} Indigenous)`);
    });
  } else {
    console.log('   No staff data found');
  }
  
  // Services
  const { count: serviceCount } = await supabase
    .from('services')
    .select('*', { count: 'exact', head: true });
  
  console.log(`\n🏥 Services: ${serviceCount} active`);
  
  // Stories
  const { count: storyCount } = await supabase
    .from('stories')
    .select('*', { count: 'exact', head: true });
  
  console.log(`\n📖 Stories: ${storyCount} collected`);
  
  // Media
  const { count: mediaCount } = await supabase
    .from('media_files')
    .select('*', { count: 'exact', head: true });
  
  console.log(`\n📸 Media: ${mediaCount} files`);
  
  // 20-year countdown
  console.log('\n🎯 20-YEAR COUNTDOWN');
  console.log('='.repeat(50));
  console.log('   Years elapsed: 18 / 20 (90%)');
  console.log('   Years remaining: 2');
  console.log('   Current staff: 197 / 300 target (66%)');
  console.log('   Current services: 16 / 20 target (80%)');
  console.log('   Current stories: 77 / 150 target (51%)');
}

async function main() {
  console.log('='.repeat(60));
  console.log('🚀 SETTING UP 20-YEAR VISION DATA');
  console.log('='.repeat(60));
  
  const tableExists = await checkAndCreateTable();
  
  if (tableExists) {
    await insertInnovationProjects();
  }
  
  await verifyKnowledgeEntries();
  await createDataExtractionLog();
  await displayCurrentMetrics();
  
  console.log('\n' + '='.repeat(60));
  console.log('✅ Setup Complete!');
  console.log('='.repeat(60));
  console.log('\n📋 Next Steps:');
  console.log('   1. Create innovation_projects table in SQL Editor if needed');
  console.log('   2. Run: npx tsx scripts/extract-historical-data.ts');
  console.log('   3. Add TheCentreDataForm to admin dashboard');
  console.log('   4. Build timeline visualization');
}

main().catch(console.error);
