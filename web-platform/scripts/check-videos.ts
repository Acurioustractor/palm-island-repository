import { createClient } from '@supabase/supabase-js';
import * as dotenv from 'dotenv';
import * as path from 'path';
dotenv.config({ path: path.resolve(process.cwd(), '.env.local') });

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL || '',
  process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || ''
);

async function main() {
  // Check media_files for videos
  const { data: videos1 } = await supabase.from('media_files').select('id, file_url, title, file_type').ilike('file_type', '%video%').limit(10);
  console.log('media_files video type:', videos1?.length || 0);
  if (videos1?.length) videos1.forEach(v => console.log(JSON.stringify(v)));

  // Check for video URLs
  const { data: videos2 } = await supabase.from('media_files').select('id, file_url, title, file_type').or('file_url.ilike.%youtube%,file_url.ilike.%vimeo%,file_url.ilike.%.mp4%').limit(10);
  console.log('\nmedia_files video URLs:', videos2?.length || 0);
  if (videos2?.length) videos2.forEach(v => console.log(JSON.stringify(v)));

  // Check innovation_projects columns
  const { data: cols } = await supabase.rpc('exec_sql', { sql: "SELECT column_name FROM information_schema.columns WHERE table_name = 'innovation_projects' ORDER BY ordinal_position" });
  console.log('\ninnovation_projects columns:', cols);

  // Check innovation_projects data
  const { data: projects } = await supabase.from('innovation_projects').select('*').limit(3);
  console.log('\ninnovation_projects sample:');
  if (projects?.length) projects.forEach(p => console.log(JSON.stringify(Object.keys(p)), '\n  name:', p.name));

  // Check innovation_project_media if it exists
  const { data: mediaLinks, error: mediaErr } = await supabase.from('innovation_project_media').select('*').limit(10);
  if (mediaErr) {
    console.log('\ninnovation_project_media: table may not exist -', mediaErr.message);
  } else {
    console.log('\ninnovation_project_media:', mediaLinks?.length || 0, 'records');
    if (mediaLinks?.length) mediaLinks.forEach(m => console.log(JSON.stringify(m)));
  }

  // Look at the getInnovationProjects tool to see how it fetches videos
  // Check media_files tags for innovation project references
  const { data: taggedMedia } = await supabase.from('media_files').select('id, file_url, title, file_type, tags').contains('tags', ['the-centre']).limit(10);
  console.log('\nmedia_files tagged "the-centre":', taggedMedia?.length || 0);
  if (taggedMedia?.length) taggedMedia.forEach(m => console.log(JSON.stringify({ title: m.title, type: m.file_type, url: m.file_url?.slice(0, 80) })));

  // Broader tag search
  const { data: anyTagged } = await supabase.from('media_files').select('id, file_url, title, file_type, tags').not('tags', 'is', null).limit(20);
  const videoTagged = (anyTagged || []).filter((m: any) => m.file_type === 'video' || m.file_url?.includes('.mp4') || m.file_url?.includes('youtube') || m.file_url?.includes('vimeo'));
  console.log('\nAny video-like tagged media:', videoTagged.length);
  if (videoTagged.length) videoTagged.forEach(m => console.log(JSON.stringify({ title: m.title, type: m.file_type, url: m.file_url?.slice(0, 80), tags: m.tags })));
}

main().catch(console.error);
