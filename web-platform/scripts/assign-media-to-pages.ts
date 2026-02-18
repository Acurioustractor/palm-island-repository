/**
 * Assign Media to Pages Script
 * Matches unassigned media in Supabase to page contexts based on tags/metadata.
 *
 * Usage:
 *   npx tsx scripts/assign-media-to-pages.ts          # Dry run (default)
 *   npx tsx scripts/assign-media-to-pages.ts --execute # Actually apply changes
 */

import { createClient } from '@supabase/supabase-js';
import * as dotenv from 'dotenv';
import { resolve } from 'path';

dotenv.config({ path: resolve(__dirname, '../.env.local') });

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
);

const EXECUTE = process.argv.includes('--execute');

interface MediaFile {
  id: string;
  title: string | null;
  tags: string[] | null;
  file_type: string;
  page_context: string | null;
  page_section: string | null;
  is_featured: boolean;
  is_public: boolean;
  width: number | null;
  height: number | null;
  public_url: string;
  display_order: number;
}

// Track stats
let assigned = 0;
let skipped = 0;
let noMatch = 0;

/**
 * Assign a media file to a page context/section
 */
async function assignMedia(
  media: MediaFile,
  pageContext: string,
  pageSection: string,
  isFeatured: boolean = false,
  displayOrder: number = 0
): Promise<boolean> {
  const label = `${media.id.slice(0, 8)} "${media.title || 'untitled'}" → ${pageContext}/${pageSection}`;

  if (!EXECUTE) {
    console.log(`  [DRY RUN] Would assign ${label} (featured=${isFeatured}, order=${displayOrder})`);
    assigned++;
    return true;
  }

  const { error } = await supabase
    .from('media_files')
    .update({
      page_context: pageContext,
      page_section: pageSection,
      is_featured: isFeatured,
      display_order: displayOrder,
    })
    .eq('id', media.id);

  if (error) {
    console.error(`  [ERROR] Failed to assign ${label}:`, error.message);
    return false;
  }

  console.log(`  [ASSIGNED] ${label}`);
  assigned++;
  return true;
}

/**
 * Check if a slot already has media assigned
 */
async function getExistingCount(pageContext: string, pageSection: string): Promise<number> {
  const { count } = await supabase
    .from('media_files')
    .select('*', { count: 'exact', head: true })
    .eq('page_context', pageContext)
    .eq('page_section', pageSection)
    .is('deleted_at', null);

  return count || 0;
}

/**
 * Find unassigned images matching any of the given tags
 */
function findByTags(pool: MediaFile[], tags: string[], limit: number = 1): MediaFile[] {
  const matches = pool.filter(
    m => m.tags && m.tags.some(t => tags.includes(t))
  );
  // Prefer larger images (likely higher quality)
  matches.sort((a, b) => ((b.width || 0) * (b.height || 0)) - ((a.width || 0) * (a.height || 0)));
  return matches.slice(0, limit);
}

/**
 * Find unassigned images matching a tag prefix (e.g., "service:")
 */
function findByTagPrefix(pool: MediaFile[], prefix: string): MediaFile[] {
  return pool.filter(
    m => m.tags && m.tags.some(t => t.startsWith(prefix))
  );
}

/**
 * Remove items from pool after assignment (to avoid double-assigning)
 */
function removeFromPool(pool: MediaFile[], used: MediaFile[]): MediaFile[] {
  const usedIds = new Set(used.map(m => m.id));
  return pool.filter(m => !usedIds.has(m.id));
}

async function run() {
  console.log(`=== MEDIA ASSIGNMENT ${EXECUTE ? '(EXECUTE MODE)' : '(DRY RUN)'} ===\n`);

  if (!EXECUTE) {
    console.log('Pass --execute to apply changes. This is a dry run.\n');
  }

  // Fetch all unassigned images
  const { data: unassigned, error } = await supabase
    .from('media_files')
    .select('id, title, tags, file_type, page_context, page_section, is_featured, is_public, width, height, public_url, display_order')
    .is('page_context', null)
    .eq('file_type', 'image')
    .eq('is_public', true)
    .is('deleted_at', null)
    .order('created_at', { ascending: false });

  if (error) {
    console.error('Error fetching unassigned media:', error);
    return;
  }

  let pool: MediaFile[] = (unassigned || []) as MediaFile[];
  console.log(`Found ${pool.length} unassigned public images\n`);

  if (pool.length === 0) {
    console.log('No unassigned images to work with. Run media-inventory.ts to see current state.');
    return;
  }

  // ─── STORIES HERO ───
  console.log('--- Stories Hero ---');
  const existingStoriesHero = await getExistingCount('stories', 'hero');
  if (existingStoriesHero > 0) {
    console.log(`  Skipped (already has ${existingStoriesHero} media)`);
    skipped++;
  } else {
    const candidates = findByTags(pool, ['storytelling', 'community', 'story', 'stories', 'gathering'], 1);
    if (candidates.length > 0) {
      await assignMedia(candidates[0], 'stories', 'hero', true, 0);
      pool = removeFromPool(pool, candidates);
    } else {
      console.log('  No match found');
      noMatch++;
    }
  }

  // ─── COMMUNITY HERO ───
  console.log('\n--- Community Hero ---');
  const existingCommunityHero = await getExistingCount('community', 'hero');
  if (existingCommunityHero > 0) {
    console.log(`  Skipped (already has ${existingCommunityHero} media)`);
    skipped++;
  } else {
    const candidates = findByTags(pool, ['community', 'gathering', 'group', 'event', 'people'], 1);
    if (candidates.length > 0) {
      await assignMedia(candidates[0], 'community', 'hero', true, 0);
      pool = removeFromPool(pool, candidates);
    } else {
      console.log('  No match found');
      noMatch++;
    }
  }

  // ─── COMMUNITY PROGRAMS (3 slots) ───
  console.log('\n--- Community Programs ---');
  const existingPrograms = await getExistingCount('community', 'programs');
  if (existingPrograms >= 3) {
    console.log(`  Skipped (already has ${existingPrograms} media)`);
    skipped++;
  } else {
    const needed = 3 - existingPrograms;
    const candidates = findByTags(pool, ['storytelling', 'writing', 'recording', 'voice', 'community', 'workshop'], needed);
    for (let i = 0; i < candidates.length; i++) {
      await assignMedia(candidates[i], 'community', 'programs', false, existingPrograms + i);
    }
    if (candidates.length === 0) {
      console.log('  No match found');
      noMatch++;
    }
    pool = removeFromPool(pool, candidates);
  }

  // ─── ABOUT HERO ───
  console.log('\n--- About Hero ---');
  const existingAboutHero = await getExistingCount('about', 'hero');
  if (existingAboutHero > 0) {
    console.log(`  Skipped (already has ${existingAboutHero} media)`);
    skipped++;
  } else {
    const candidates = findByTags(pool, ['picc', 'building', 'palm-island', 'community', 'aerial', 'landscape'], 1);
    if (candidates.length > 0) {
      await assignMedia(candidates[0], 'about', 'hero', true, 0);
      pool = removeFromPool(pool, candidates);
    } else {
      console.log('  No match found');
      noMatch++;
    }
  }

  // ─── ABOUT VISION ───
  console.log('\n--- About Vision ---');
  const existingVision = await getExistingCount('about', 'vision');
  if (existingVision > 0) {
    console.log(`  Skipped (already has ${existingVision} media)`);
    skipped++;
  } else {
    const candidates = findByTags(pool, ['picc', 'building', 'office', 'palm-island', 'landscape'], 1);
    if (candidates.length > 0) {
      await assignMedia(candidates[0], 'about', 'vision', false, 0);
      pool = removeFromPool(pool, candidates);
    } else {
      console.log('  No match found');
      noMatch++;
    }
  }

  // ─── ABOUT LEADERSHIP (up to 7) ───
  console.log('\n--- About Leadership ---');
  const existingLeadership = await getExistingCount('about', 'leadership');
  if (existingLeadership >= 7) {
    console.log(`  Skipped (already has ${existingLeadership} media)`);
    skipped++;
  } else {
    const needed = 7 - existingLeadership;
    const candidates = findByTags(pool, ['board', 'leadership', 'director', 'ceo', 'rachel', 'portrait', 'headshot', 'staff'], needed);
    for (let i = 0; i < candidates.length; i++) {
      await assignMedia(candidates[i], 'about', 'leadership', i === 0, existingLeadership + i);
    }
    if (candidates.length === 0) {
      console.log('  No match found');
      noMatch++;
    }
    pool = removeFromPool(pool, candidates);
  }

  // ─── ABOUT TIMELINE (up to 6) ───
  console.log('\n--- About Timeline ---');
  const existingTimeline = await getExistingCount('about', 'timeline');
  if (existingTimeline >= 6) {
    console.log(`  Skipped (already has ${existingTimeline} media)`);
    skipped++;
  } else {
    const needed = 6 - existingTimeline;
    const candidates = findByTags(pool, ['history', 'timeline', 'historical', 'archive', 'heritage', 'palm-island', 'old'], needed);
    for (let i = 0; i < candidates.length; i++) {
      await assignMedia(candidates[i], 'about', 'timeline', false, existingTimeline + i);
    }
    if (candidates.length === 0) {
      console.log('  No match found');
      noMatch++;
    }
    pool = removeFromPool(pool, candidates);
  }

  // ─── ABOUT SERVICES (up to 7) ───
  console.log('\n--- About Services ---');
  const existingServices = await getExistingCount('about', 'services');
  if (existingServices >= 7) {
    console.log(`  Skipped (already has ${existingServices} media)`);
    skipped++;
  } else {
    const needed = 7 - existingServices;
    // Try to get one per service category
    const serviceTagPriority = [
      'service:health-services',
      'service:family-services',
      'service:children-family-centre',
      'service:digital-service-centre',
      'service:economic-development',
      'service:justice-services',
      'service:crisis-services',
    ];
    const selectedServices: MediaFile[] = [];
    for (const tag of serviceTagPriority) {
      if (selectedServices.length >= needed) break;
      const match = findByTags(pool, [tag], 1);
      if (match.length > 0 && !selectedServices.find(s => s.id === match[0].id)) {
        selectedServices.push(match[0]);
      }
    }
    // Fill remaining from any service-tagged images
    if (selectedServices.length < needed) {
      const remaining = findByTags(pool, ['service', 'health', 'family', 'children', 'digital', 'enterprise'], needed - selectedServices.length);
      for (const m of remaining) {
        if (!selectedServices.find(s => s.id === m.id)) {
          selectedServices.push(m);
          if (selectedServices.length >= needed) break;
        }
      }
    }

    for (let i = 0; i < selectedServices.length; i++) {
      await assignMedia(selectedServices[i], 'about', 'services', false, existingServices + i);
    }
    if (selectedServices.length === 0) {
      console.log('  No match found');
      noMatch++;
    }
    pool = removeFromPool(pool, selectedServices);
  }

  // ─── ABOUT TESTIMONIALS (up to 4) ───
  console.log('\n--- About Testimonials ---');
  const existingTestimonials = await getExistingCount('about', 'testimonials');
  if (existingTestimonials >= 4) {
    console.log(`  Skipped (already has ${existingTestimonials} media)`);
    skipped++;
  } else {
    const needed = 4 - existingTestimonials;
    const candidates = findByTags(pool, ['portrait', 'headshot', 'people', 'staff', 'community', 'testimonial', 'face'], needed);
    for (let i = 0; i < candidates.length; i++) {
      await assignMedia(candidates[i], 'about', 'testimonials', false, existingTestimonials + i);
    }
    if (candidates.length === 0) {
      console.log('  No match found');
      noMatch++;
    }
    pool = removeFromPool(pool, candidates);
  }

  // ─── HOME GALLERY (up to 8) ───
  console.log('\n--- Home Gallery ---');
  const existingGallery = await getExistingCount('home', 'gallery');
  if (existingGallery >= 8) {
    console.log(`  Skipped (already has ${existingGallery} media)`);
    skipped++;
  } else {
    const needed = 8 - existingGallery;
    // Pick diverse service images
    const serviceImages = findByTagPrefix(pool, 'service:');
    const diversePicks: MediaFile[] = [];
    const usedServiceTags = new Set<string>();

    for (const img of serviceImages) {
      if (diversePicks.length >= needed) break;
      const serviceTags = (img.tags || []).filter(t => t.startsWith('service:'));
      const isNewService = serviceTags.some(t => !usedServiceTags.has(t));
      if (isNewService) {
        diversePicks.push(img);
        serviceTags.forEach(t => usedServiceTags.add(t));
      }
    }
    // Fill remaining with any good images
    if (diversePicks.length < needed) {
      const remaining = pool.filter(m => !diversePicks.find(d => d.id === m.id));
      remaining.sort((a, b) => ((b.width || 0) * (b.height || 0)) - ((a.width || 0) * (a.height || 0)));
      for (const m of remaining) {
        if (diversePicks.length >= needed) break;
        diversePicks.push(m);
      }
    }

    for (let i = 0; i < diversePicks.length; i++) {
      await assignMedia(diversePicks[i], 'home', 'gallery', false, existingGallery + i);
    }
    if (diversePicks.length === 0) {
      console.log('  No match found');
      noMatch++;
    }
    pool = removeFromPool(pool, diversePicks);
  }

  // ─── COMMUNITY STORYTELLERS ───
  console.log('\n--- Community Storytellers ---');
  const existingStorytellers = await getExistingCount('community', 'storytellers');
  if (existingStorytellers > 0) {
    console.log(`  Skipped (already has ${existingStorytellers} media)`);
    skipped++;
  } else {
    const candidates = findByTags(pool, ['storyteller', 'storytelling', 'elder', 'community', 'group'], 1);
    if (candidates.length > 0) {
      await assignMedia(candidates[0], 'community', 'storytellers', false, 0);
      pool = removeFromPool(pool, candidates);
    } else {
      console.log('  No match found');
      noMatch++;
    }
  }

  // ─── SUMMARY ───
  console.log('\n=== SUMMARY ===');
  console.log(`  Assigned: ${assigned}`);
  console.log(`  Skipped (already filled): ${skipped}`);
  console.log(`  No match found: ${noMatch}`);
  console.log(`  Remaining unassigned pool: ${pool.length}`);

  if (!EXECUTE && assigned > 0) {
    console.log(`\nRun with --execute to apply ${assigned} assignments.`);
  }
}

run().catch(console.error);
