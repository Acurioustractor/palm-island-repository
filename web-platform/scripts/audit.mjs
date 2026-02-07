import { createClient } from '@supabase/supabase-js';
import { config } from 'dotenv';
import { resolve, dirname } from 'path';
import { fileURLToPath } from 'url';

const __dirname = dirname(fileURLToPath(import.meta.url));
config({ path: resolve(__dirname, '../.env.local') });

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL,
  process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY
);

async function run() {
  console.log('='.repeat(80));
  console.log('PICC WEB PLATFORM COMPREHENSIVE CONTENT AUDIT');
  console.log('='.repeat(80));

  // 1. STORIES
  console.log('\n📖 STORIES\n');
  
  let { count: totalStories } = await supabase
    .from('stories')
    .select('*', { count: 'exact', head: true });
  
  let { data: storiesByCategory } = await supabase
    .from('stories')
    .select('category');
  
  const categoryCounts = {};
  storiesByCategory?.forEach(s => {
    if (s.category) categoryCounts[s.category] = (categoryCounts[s.category] || 0) + 1;
  });
  
  let { data: storiesByType } = await supabase
    .from('stories')
    .select('story_type');
  
  const typeCounts = {};
  storiesByType?.forEach(s => {
    if (s.story_type) typeCounts[s.story_type] = (typeCounts[s.story_type] || 0) + 1;
  });
  
  let { data: storiesByStatus } = await supabase
    .from('stories')
    .select('status');
  
  const statusCounts = {};
  storiesByStatus?.forEach(s => {
    if (s.status) statusCounts[s.status] = (statusCounts[s.status] || 0) + 1;
  });
  
  let { count: storiesWithImages } = await supabase
    .from('stories')
    .select('*', { count: 'exact', head: true })
    .not('hero_image_url', 'is', null);
  
  let { data: reportStories } = await supabase
    .from('annual_report_stories')
    .select('story_id');
  
  const linkedStoriesCount = new Set(reportStories?.map(r => r.story_id)).size;
  
  console.log('Total:', totalStories);
  console.log('\nBy Category:');
  Object.entries(categoryCounts).forEach(([k, v]) => console.log('  ' + k + ':', v));
  console.log('\nBy Type:');
  Object.entries(typeCounts).forEach(([k, v]) => console.log('  ' + k + ':', v));
  console.log('\nBy Status:');
  Object.entries(statusCounts).forEach(([k, v]) => console.log('  ' + k + ':', v));
  console.log('\nWith Hero Images:', storiesWithImages);
  console.log('Linked to Annual Reports:', linkedStoriesCount);

  // 2. SERVICES
  console.log('\n\n🏥 SERVICES\n');
  
  let { data: services } = await supabase
    .from('organization_services')
    .select('id, service_name, staff_count, clients_served_annual')
    .order('service_name');
  
  console.log('Total:', services?.length || 0);
  console.log('');
  
  services?.forEach(s => {
    console.log(s.service_name);
    console.log('  Staff:', s.staff_count || 0);
    console.log('  Clients:', s.clients_served_annual || 0);
  });
  
  let { data: serviceMetrics } = await supabase
    .from('service_metrics')
    .select('service_id');
  
  const servicesWithMetrics = new Set(serviceMetrics?.map(m => m.service_id)).size;
  console.log('\nWith Metrics:', servicesWithMetrics);

  // 3. PROJECTS
  console.log('\n\n🚀 PROJECTS\n');
  
  let { count: totalProjects } = await supabase
    .from('projects')
    .select('*', { count: 'exact', head: true });
  
  let { data: projectsByType } = await supabase
    .from('projects')
    .select('project_type');
  
  const projectTypeCounts = {};
  projectsByType?.forEach(p => {
    if (p.project_type) projectTypeCounts[p.project_type] = (projectTypeCounts[p.project_type] || 0) + 1;
  });
  
  let { data: projectsByStatus } = await supabase
    .from('projects')
    .select('status');
  
  const projectStatusCounts = {};
  projectsByStatus?.forEach(p => {
    if (p.status) projectStatusCounts[p.status] = (projectStatusCounts[p.status] || 0) + 1;
  });
  
  let { count: projectsWithHero } = await supabase
    .from('projects')
    .select('*', { count: 'exact', head: true })
    .not('hero_image', 'is', null);
  
  console.log('Total:', totalProjects);
  console.log('\nBy Type:');
  Object.entries(projectTypeCounts).forEach(([k, v]) => console.log('  ' + k + ':', v));
  console.log('\nBy Status:');
  Object.entries(projectStatusCounts).forEach(([k, v]) => console.log('  ' + k + ':', v));
  console.log('\nWith Hero Images:', projectsWithHero);

  // 4. MEDIA
  console.log('\n\n📸 MEDIA\n');
  
  let { count: totalMedia } = await supabase
    .from('media_files')
    .select('*', { count: 'exact', head: true })
    .is('deleted_at', null);
  
  let { data: mediaByType } = await supabase
    .from('media_files')
    .select('file_type')
    .is('deleted_at', null);
  
  const fileTypeCounts = {};
  mediaByType?.forEach(m => {
    const type = m.file_type || 'unknown';
    fileTypeCounts[type] = (fileTypeCounts[type] || 0) + 1;
  });
  
  let { data: allMediaTags } = await supabase
    .from('media_files')
    .select('tags')
    .is('deleted_at', null)
    .not('tags', 'is', null);
  
  const sourceCounts = {};
  const eventCounts = {};
  
  allMediaTags?.forEach(m => {
    const tags = m.tags || [];
    tags.forEach(tag => {
      if (tag.startsWith('source:')) {
        sourceCounts[tag] = (sourceCounts[tag] || 0) + 1;
      }
      if (tag.startsWith('event:')) {
        eventCounts[tag] = (eventCounts[tag] || 0) + 1;
      }
    });
  });
  
  let { count: featuredMedia } = await supabase
    .from('media_files')
    .select('*', { count: 'exact', head: true })
    .eq('is_featured', true)
    .is('deleted_at', null);
  
  let { count: mediaWithFaces } = await supabase
    .from('media_files')
    .select('*', { count: 'exact', head: true })
    .not('faces_detected', 'is', null)
    .is('deleted_at', null);
  
  console.log('Total:', totalMedia);
  console.log('\nBy File Type:');
  Object.entries(fileTypeCounts).forEach(([k, v]) => console.log('  ' + k + ':', v));
  console.log('\nBy Source:');
  Object.entries(sourceCounts).forEach(([k, v]) => console.log('  ' + k + ':', v));
  console.log('\nFeatured:', featuredMedia);
  console.log('With Faces:', mediaWithFaces);
  console.log('\nTop 10 Event Tags:');
  Object.entries(eventCounts)
    .sort((a, b) => b[1] - a[1])
    .slice(0, 10)
    .forEach(([k, v]) => console.log('  ' + k + ':', v));

  // 5. ANNUAL REPORTS
  console.log('\n\n📊 ANNUAL REPORTS\n');
  
  let { data: reports } = await supabase
    .from('annual_reports')
    .select('id, report_year, status, title')
    .order('report_year', { ascending: false });
  
  console.log('Total:', reports?.length || 0);
  console.log('');
  
  for (const report of reports || []) {
    console.log(report.title, '(' + report.report_year + ') -', report.status);
    console.log('  ID:', report.id);
    
    let { count: linkedStories } = await supabase
      .from('annual_report_stories')
      .select('*', { count: 'exact', head: true })
      .eq('report_id', report.id);
    
    let { count: sections } = await supabase
      .from('report_sections')
      .select('*', { count: 'exact', head: true })
      .eq('report_id', report.id);
    
    let { count: quotes } = await supabase
      .from('extracted_quotes')
      .select('*', { count: 'exact', head: true })
      .eq('report_id', report.id);
    
    console.log('  Stories:', linkedStories, '| Sections:', sections, '| Quotes:', quotes);
    console.log('');
  }

  // 6. BOARD MEMBERS
  console.log('\n👔 BOARD MEMBERS\n');
  
  let { data: board } = await supabase
    .from('board_members')
    .select('name, position, is_active')
    .order('name');
  
  console.log('Total:', board?.length || 0);
  console.log('Active:', board?.filter(m => m.is_active).length || 0);
  console.log('');
  
  board?.forEach(m => {
    console.log(m.name, '-', m.position, m.is_active ? '✓' : '✗');
  });

  // 7. LEADERSHIP
  console.log('\n\n👥 LEADERSHIP\n');
  
  let { data: leaders } = await supabase
    .from('leadership')
    .select('name, role, is_active')
    .order('name');
  
  console.log('Total:', leaders?.length || 0);
  console.log('Active:', leaders?.filter(l => l.is_active).length || 0);
  console.log('');
  
  leaders?.forEach(l => {
    console.log(l.name, '-', l.role, l.is_active ? '✓' : '✗');
  });

  // 8. STATISTICS
  console.log('\n\n📈 STATISTICS\n');
  
  let { count: totalStats } = await supabase
    .from('report_statistics')
    .select('*', { count: 'exact', head: true });
  
  let { data: statsByCategory } = await supabase
    .from('report_statistics')
    .select('category');
  
  const statCategoryCounts = {};
  statsByCategory?.forEach(s => {
    if (s.category) statCategoryCounts[s.category] = (statCategoryCounts[s.category] || 0) + 1;
  });
  
  console.log('Total:', totalStats);
  console.log('\nBy Category:');
  Object.entries(statCategoryCounts).forEach(([k, v]) => console.log('  ' + k + ':', v));

  // 9. GAPS
  console.log('\n\n🔍 CONTENT GAPS\n');
  
  const gaps = [];
  
  const storiesNoImages = (totalStories || 0) - (storiesWithImages || 0);
  if (storiesNoImages > 0) {
    gaps.push(storiesNoImages + ' stories missing hero images');
  }
  
  const servicesNoMetrics = (services?.length || 0) - servicesWithMetrics;
  if (servicesNoMetrics > 0) {
    gaps.push(servicesNoMetrics + ' services missing metrics');
  }
  
  let { count: mediaNoDesc } = await supabase
    .from('media_files')
    .select('*', { count: 'exact', head: true })
    .is('description', null)
    .is('deleted_at', null);
  
  if (mediaNoDesc && mediaNoDesc > 0) {
    gaps.push(mediaNoDesc + ' media files missing descriptions');
  }
  
  let { count: mediaNoTags } = await supabase
    .from('media_files')
    .select('*', { count: 'exact', head: true })
    .is('tags', null)
    .is('deleted_at', null);
  
  if (mediaNoTags && mediaNoTags > 0) {
    gaps.push(mediaNoTags + ' media files missing tags');
  }
  
  for (const report of reports || []) {
    let { count: reportStoryCount } = await supabase
      .from('annual_report_stories')
      .select('*', { count: 'exact', head: true })
      .eq('report_id', report.id);
    
    if (reportStoryCount === 0) {
      gaps.push('Report "' + report.title + '" has no linked stories');
    }
  }
  
  gaps.forEach(gap => console.log('❌', gap));
  
  if (gaps.length === 0) {
    console.log('✅ No significant content gaps found!');
  }

  console.log('\n' + '='.repeat(80));
  console.log('AUDIT COMPLETE');
  console.log('='.repeat(80));
}

run().catch(console.error);
