import { createClient } from '@supabase/supabase-js';
import * as dotenv from 'dotenv';
import * as path from 'path';

dotenv.config({ path: path.resolve(process.cwd(), '.env.local') });

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL || '',
  process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || ''
);

interface MediaFile {
  id: string;
  title: string | null;
  tags: string[] | null;
  rating: number;
}

async function rateStationPhotos() {
  console.log('Fetching Station photos...');

  // Fetch all media_files with tag project:the-centre-the-station and file_type image
  const { data: photos, error } = await supabase
    .from('media_files')
    .select('id, title, tags, rating')
    .eq('file_type', 'image')
    .contains('tags', ['project:the-centre-the-station']);

  if (error) {
    console.error('Error fetching photos:', error);
    return;
  }

  if (!photos || photos.length === 0) {
    console.log('No Station photos found.');
    return;
  }

  console.log(`Found ${photos.length} Station photos. Analyzing...`);

  const updates: { id: string; rating: number; reason: string }[] = [];

  for (const photo of photos as MediaFile[]) {
    const title = photo.title?.toLowerCase() || '';
    const tags = photo.tags || [];
    let newRating = 0;
    let reason = 'default';

    // Rating logic
    if (tags.includes('hero-quality')) {
      newRating = 5;
      reason = 'hero-quality tag';
    } else if (tags.some(tag => ['aerial', 'drone'].includes(tag))) {
      newRating = 4;
      reason = 'aerial/drone tag';
    } else if (
      title.includes('youth') ||
      title.includes('landscaping') ||
      title.includes('cleaning') ||
      title.includes('sweeping') ||
      title.includes('work')
    ) {
      newRating = 4;
      reason = 'youth activity in title';
    } else if (tags.some(tag => ['community', 'group'].includes(tag))) {
      newRating = 3;
      reason = 'community/group tag';
    } else if (
      title.includes('new drawing') ||
      title.includes('new sketch') ||
      title.includes('new-photo')
    ) {
      newRating = 1;
      reason = 'draft/placeholder content';
    } else if (title.match(/station photo \d+/i)) {
      newRating = 0;
      reason = 'generic station photo';
    }

    // Only update if rating changed
    if (newRating !== photo.rating) {
      updates.push({ id: photo.id, rating: newRating, reason });
    }
  }

  console.log(`\nUpdating ${updates.length} photo ratings...`);

  // Update ratings
  for (const update of updates) {
    const { error: updateError } = await supabase
      .from('media_files')
      .update({ rating: update.rating })
      .eq('id', update.id);

    if (updateError) {
      console.error(`Error updating ${update.id}:`, updateError);
    } else {
      console.log(`✓ Updated ${update.id}: rating ${update.rating} (${update.reason})`);
    }
  }

  console.log(`\nComplete! Updated ${updates.length} photos.`);

  // Summary by rating
  const summary = updates.reduce((acc, u) => {
    acc[u.rating] = (acc[u.rating] || 0) + 1;
    return acc;
  }, {} as Record<number, number>);

  console.log('\nRating distribution:');
  Object.entries(summary)
    .sort(([a], [b]) => Number(b) - Number(a))
    .forEach(([rating, count]) => {
      console.log(`  Rating ${rating}: ${count} photos`);
    });
}

rateStationPhotos();
