/**
 * Assign Service Cover Images
 * For each service, find the best tagged image and assign it as the homepage cover.
 *
 * Strategy:
 * 1. If service has images tagged `service:{slug}`, pick the largest one
 * 2. If not, try keyword matching against title/tags of all unassigned images
 * 3. Mark as page_context='home', page_section='service-{slug}', is_featured=true
 *
 * Usage:
 *   npx tsx scripts/assign-service-covers.ts              # Dry run
 *   npx tsx scripts/assign-service-covers.ts --execute     # Apply
 */

import { createClient } from '@supabase/supabase-js';
import * as dotenv from 'dotenv';
import { resolve } from 'path';

dotenv.config({ path: resolve(__dirname, '../.env.local') });

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL as string,
  process.env.SUPABASE_SERVICE_ROLE_KEY as string
);

const EXECUTE = process.argv.includes('--execute');
const INNOVATION_SLUGS = ['the-centre', 'photo-studio', 'on-country-photo-studio'];

// Keyword mapping: service slug → search terms to find photos
const KEYWORD_MAP: Record<string, string[]> = {
  'bwgcolman-healing': ['health', 'healing', 'medical', 'clinic', 'nurse', 'doctor'],
  'child-care': ['child', 'children', 'daycare', 'kids', 'childcare'],
  'community-development': ['community', 'development', 'meeting', 'planning'],
  'community_justice': ['justice', 'court', 'community-justice', 'legal'],
  'cultural_centre': ['cultural', 'culture', 'art', 'centre', 'museum'],
  'cultural-programs': ['cultural', 'ceremony', 'dance', 'art', 'program'],
  'digital_services': ['digital', 'computer', 'technology', 'office', 'service-centre'],
  'diversionary-service': ['diversionary', 'youth', 'program', 'activity'],
  'early-childhood-services': ['early-childhood', 'children', 'learning', 'play', 'toddler'],
  'early_learning': ['learning', 'early', 'education', 'children', 'classroom'],
  'economic_development': ['economic', 'business', 'enterprise', 'bakery', 'fuel'],
  'education-support': ['education', 'school', 'learning', 'study', 'training'],
  'elder_support': ['elder', 'elders', 'aged', 'senior', 'wisdom'],
  'employment-services': ['employment', 'job', 'work', 'career', 'training'],
  'family-care-service': ['family', 'care', 'support', 'parent'],
  'family-participation-program': ['family', 'participation', 'parent', 'together'],
  'family-support': ['family', 'support', 'wellbeing', 'home'],
  'family_wellbeing': ['family', 'wellbeing', 'centre', 'counselling'],
  'food_security': ['food', 'garden', 'kitchen', 'nutrition', 'cooking'],
  'housing_services': ['housing', 'house', 'home', 'accommodation'],
  'language-culture': ['language', 'culture', 'traditional', 'indigenous'],
  'mens_programs': ['men', 'mens', 'program', 'group', 'gathering'],
  'mental-health': ['mental', 'health', 'wellbeing', 'counselling', 'therapy'],
  'ndis-service': ['ndis', 'disability', 'support', 'care'],
  'ranger_program': ['ranger', 'land', 'country', 'environment', 'bush'],
  'safe-haven': ['safe', 'haven', 'shelter', 'refuge', 'crisis'],
  'safe-house': ['safe', 'house', 'domestic', 'violence', 'refuge'],
  'sewb-service': ['wellbeing', 'social', 'emotional', 'sewb', 'counselling'],
  'dfv-service': ['domestic', 'family', 'violence', 'specialist', 'support'],
  'sport-recreation': ['sport', 'recreation', 'fitness', 'oval', 'game', 'playing'],
  'transport': ['transport', 'bus', 'vehicle', 'travel', 'drive'],
  'womens_services': ['women', 'womens', 'service', 'support', 'healing'],
  'youth_services': ['youth', 'young', 'teen', 'adolescent', 'program'],
};

async function main() {
  console.log(`=== ASSIGN SERVICE COVERS (${EXECUTE ? 'EXECUTE' : 'DRY RUN'}) ===\n`);

  if (!EXECUTE) {
    console.log('Pass --execute to apply. This is a dry run.\n');
  }

  const { data: services } = await supabase
    .from('organization_services')
    .select('name, slug')
    .eq('is_active', true)
    .order('name');

  const regular = (services || []).filter((s: any) => !INNOVATION_SLUGS.includes(s.slug));

  let assigned = 0;
  let alreadyHas = 0;
  let noMatch = 0;
  const usedIds = new Set<string>(); // Prevent same image on two services

  // Scoring: prefer real photos over PDF extracts, prefer larger images
  function pickBest(candidates: any[]): any | null {
    if (!candidates || candidates.length === 0) return null;

    // Filter out already-used images
    const available = candidates.filter((c: any) => !usedIds.has(c.id));
    if (available.length === 0) return null;

    // Score each candidate
    const scored = available.map((img: any) => {
      let score = 0;
      const tags = img.tags || [];

      // Prefer event/professional photos over pdf-extract
      if (tags.includes('pdf-extract') || tags.includes('page-render')) score -= 50;
      if (tags.includes('professional-photography')) score += 30;
      if (tags.includes('event')) score += 20;
      if (tags.includes('photo')) score += 10;

      // Prefer larger images
      const pixels = (img.width || 0) * (img.height || 0);
      score += Math.min(pixels / 10000, 20); // cap at 20 points

      // Avoid profile photos as service covers
      if (tags.some((t: string) => t.startsWith('profile:'))) score -= 40;

      return { img, score };
    });

    scored.sort((a: any, b: any) => b.score - a.score);
    return scored[0]?.img || null;
  }

  for (const s of regular as any[]) {
    // Check if already has a cover
    const { count: existing } = await supabase
      .from('media_files')
      .select('*', { count: 'exact', head: true })
      .eq('page_context', 'home')
      .eq('page_section', `service-${s.slug}`)
      .eq('is_featured', true)
      .is('deleted_at', null);

    if ((existing || 0) > 0) {
      alreadyHas++;
      continue;
    }

    // Strategy 1: Find by service tag (get several, pick best)
    const { data: tagged } = await supabase
      .from('media_files')
      .select('id, title, public_url, width, height, tags')
      .contains('tags', [`service:${s.slug}`])
      .eq('file_type', 'image')
      .is('deleted_at', null)
      .limit(20);

    const bestTagged = pickBest(tagged || []);
    if (bestTagged) {
      usedIds.add(bestTagged.id);
      if (EXECUTE) {
        // Ensure both service tag and hero tag are present for /services page query
        const currentTags: string[] = bestTagged.tags || [];
        const newTags = [...new Set([...currentTags, `service:${s.slug}`, 'hero'])];

        await supabase
          .from('media_files')
          .update({
            tags: newTags,
            page_context: 'home',
            page_section: `service-${s.slug}`,
            is_featured: true,
            display_order: 0,
          })
          .eq('id', bestTagged.id);
        console.log(`  [ASSIGNED] ${s.name} ← tagged "${bestTagged.title || bestTagged.id.slice(0, 8)}" (${bestTagged.width}x${bestTagged.height})`);
      } else {
        console.log(`  [DRY RUN] ${s.name} ← tagged "${bestTagged.title || bestTagged.id.slice(0, 8)}" (${bestTagged.width}x${bestTagged.height})`);
      }
      assigned++;
      continue;
    }

    // Strategy 2: Keyword search in title of unassigned images
    const keywords = KEYWORD_MAP[s.slug] || [];
    let found = false;

    for (const kw of keywords) {
      if (found) break;

      const { data: matches } = await supabase
        .from('media_files')
        .select('id, title, public_url, width, height, tags')
        .eq('file_type', 'image')
        .is('page_context', null)
        .is('deleted_at', null)
        .ilike('title', `%${kw}%`)
        .limit(10);

      const best = pickBest(matches || []);
      if (best) {
        usedIds.add(best.id);
        if (EXECUTE) {
          // Add service tag + hero tag for /services page query
          const currentTags: string[] = best.tags || [];
          const newTags = [...new Set([...currentTags, `service:${s.slug}`, 'hero'])];

          await supabase
            .from('media_files')
            .update({
              tags: newTags,
              page_context: 'home',
              page_section: `service-${s.slug}`,
              is_featured: true,
              display_order: 0,
            })
            .eq('id', best.id);
          console.log(`  [ASSIGNED] ${s.name} ← keyword "${kw}" → "${best.title || best.id.slice(0, 8)}" (${best.width}x${best.height})`);
        } else {
          console.log(`  [DRY RUN] ${s.name} ← keyword "${kw}" → "${best.title || best.id.slice(0, 8)}" (${best.width}x${best.height})`);
        }
        assigned++;
        found = true;
      }
    }

    if (!found) {
      console.log(`  [NO MATCH] ${s.name} (${s.slug}) — needs manual photo`);
      noMatch++;
    }
  }

  console.log(`\n=== SUMMARY ===`);
  console.log(`  Assigned: ${assigned}`);
  console.log(`  Already had cover: ${alreadyHas}`);
  console.log(`  No match (need upload): ${noMatch}`);

  if (!EXECUTE && assigned > 0) {
    console.log(`\nRun with --execute to apply ${assigned} assignments.`);
  }
}

main().catch(console.error);
