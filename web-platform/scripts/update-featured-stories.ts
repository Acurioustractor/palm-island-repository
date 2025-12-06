/**
 * Update featured stories for better diversity
 * - Unmark duplicate Rachel stories
 * - Mark elder stories from different storytellers
 */

import { createClient } from '@supabase/supabase-js';
import * as dotenv from 'dotenv';
import * as path from 'path';

dotenv.config({ path: path.resolve(process.cwd(), '.env.local') });

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY! || process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!;

const supabase = createClient(supabaseUrl, supabaseKey);

async function updateFeaturedStories() {
  console.log('\n=== UPDATING FEATURED STORIES ===\n');

  // 1. Unmark Rachel's duplicate stories (keep only the first one)
  console.log('1. Unmarking duplicate Rachel stories...\n');

  const rachelStoriesToUnmark = [
    'e0000000-0000-0000-0000-000000000003', // Bwgcolman Healing Service
    'e0000000-0000-0000-0000-000000000004'  // Nearly 200 Strong
  ];

  for (const id of rachelStoriesToUnmark) {
    const { error } = await supabase
      .from('stories')
      .update({ is_featured: false })
      .eq('id', id);

    if (error) {
      console.error(`   Error unmarking ${id}:`, error);
    } else {
      console.log(`   ✓ Unmarked story ${id}`);
    }
  }

  // 2. Mark elder stories
  console.log('\n2. Marking elder stories as featured...\n');

  const elderStoriesToMark = [
    {
      id: '356f1297-ab46-4298-b0ce-5c710fe50f7b',
      title: 'Elder Ethel Robertson: Stories of Strength and Survival',
      storyteller: 'Aunty Ethel'
    },
    {
      id: '833d3629-3c0a-4904-929a-88a116536dda',
      title: 'Elder Frank Landers: A Journey of Resilience and Community',
      storyteller: 'Uncle Frank'
    }
  ];

  for (const story of elderStoriesToMark) {
    const { error } = await supabase
      .from('stories')
      .update({ is_featured: true })
      .eq('id', story.id);

    if (error) {
      console.error(`   Error marking ${story.id}:`, error);
    } else {
      console.log(`   ✓ Marked "${story.title}" by ${story.storyteller}`);
    }
  }

  // 3. Verify the new featured stories
  console.log('\n3. Verifying new featured stories...\n');

  const { data: featured, error: featuredError } = await supabase
    .from('stories')
    .select(`
      id,
      title,
      storyteller:storyteller_id (
        preferred_name,
        full_name,
        is_elder
      )
    `)
    .eq('is_featured', true)
    .eq('is_public', true)
    .order('created_at', { ascending: false });

  if (featuredError) {
    console.error('Error fetching featured stories:', featuredError);
  } else {
    console.log(`Found ${featured?.length || 0} featured stories:\n`);
    featured?.forEach((story, i) => {
      const storyteller = story.storyteller as any;
      console.log(`${i + 1}. "${story.title}"`);
      console.log(`   By: ${storyteller?.preferred_name || storyteller?.full_name}`);
      console.log(`   Elder: ${storyteller?.is_elder ? 'YES' : 'NO'}`);
      console.log('');
    });
  }

  console.log('=== UPDATE COMPLETE ===\n');
}

updateFeaturedStories().catch(console.error);
