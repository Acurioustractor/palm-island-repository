import { createClient } from '@supabase/supabase-js';
import * as dotenv from 'dotenv';
import * as path from 'path';
dotenv.config({ path: path.resolve(process.cwd(), '.env.local') });

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL || '',
  process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || ''
);

async function main() {
  // Check media_files with project tag
  const tag = 'project:the-centre-the-station';
  const { data: tagged, error } = await supabase
    .from('media_files')
    .select('id, file_url, public_url, file_path, bucket_name, title, alt_text, file_type, tags')
    .contains('tags', [tag])
    .is('deleted_at', null)
    .limit(20);

  console.log('Tagged with', tag, ':', tagged?.length || 0, error?.message || '');
  if (tagged?.length) tagged.forEach(m => console.log(JSON.stringify({ title: m.title, type: m.file_type, url: (m.public_url || m.file_url || '')?.slice(0, 100), tags: m.tags })));

  // Also check with 'centre' in tags
  const { data: centreTagged } = await supabase
    .from('media_files')
    .select('id, title, file_type, tags')
    .not('tags', 'is', null)
    .limit(100);

  const centreMatches = (centreTagged || []).filter((m: any) =>
    m.tags?.some((t: string) => t.toLowerCase().includes('centre') || t.toLowerCase().includes('station'))
  );
  console.log('\nMedia with centre/station tags:', centreMatches.length);
  centreMatches.forEach(m => console.log(JSON.stringify({ title: m.title, type: m.file_type, tags: m.tags })));

  // Check all unique file_types
  const { data: allMedia } = await supabase.from('media_files').select('file_type').is('deleted_at', null).limit(1000);
  const types = new Set((allMedia || []).map((m: any) => m.file_type));
  console.log('\nAll file_types in media_files:', Array.from(types));

  // Check for any Supabase storage videos
  const { data: storageVideos } = await supabase.from('media_files').select('id, title, file_path, public_url, file_type, tags').ilike('file_path', '%.mp4%').limit(10);
  console.log('\n.mp4 in file_path:', storageVideos?.length || 0);
  if (storageVideos?.length) storageVideos.forEach(m => console.log(JSON.stringify(m)));

  // What about the page itself? Check how the innovation page renders
  const { data: proj } = await supabase.from('projects').select('*').eq('slug', 'the-centre-the-station').single();
  if (proj) {
    console.log('\nThe Centre project:', JSON.stringify({ gallery_images: proj.gallery_images, tags: proj.tags }));
  }
}

main().catch(console.error);
