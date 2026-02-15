/**
 * Auto Cover Photo Matcher (no AI required)
 *
 * Scores candidate photos for each service using keyword matching,
 * image quality metrics, and tag relevance. Picks the best match.
 *
 * Usage:
 *   npx tsx scripts/auto-cover-matcher.ts              # Dry run
 *   npx tsx scripts/auto-cover-matcher.ts --apply       # Apply matches
 */
import { createClient } from '@supabase/supabase-js';
import * as dotenv from 'dotenv';
import { resolve } from 'path';

dotenv.config({ path: resolve(__dirname, '../.env.local') });

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL as string,
  process.env.SUPABASE_SERVICE_ROLE_KEY as string
);

const APPLY = process.argv.includes('--apply');

// Keywords per service — ordered by relevance (first = best match)
const SERVICE_KEYWORDS: Record<string, string[]> = {
  'community-development': ['community development', 'community meeting', 'community gathering', 'community', 'development', 'planning', 'meeting'],
  'community_justice': ['justice', 'community justice', 'court', 'mediation', 'legal', 'law'],
  'digital_services': ['digital', 'telstra', 'call centre', 'computer', 'technology', 'office', 'service centre'],
  'diversionary-service': ['diversionary', 'diversion', 'intervention', 'youth program', 'activity'],
  'early_learning': ['early learning', 'childcare', 'playgroup', 'children playing', 'kindergarten', 'toddler', 'early childhood'],
  'economic_development': ['economic', 'business', 'enterprise', 'shop', 'bakery', 'fuel', 'commercial'],
  'education-support': ['education', 'school', 'classroom', 'student', 'learning', 'study', 'tutoring'],
  'family-care-service': ['family care', 'child protection', 'kinship', 'foster', 'out-of-home', 'family'],
  'family-participation-program': ['family participation', 'parent', 'family meeting', 'family decision', 'family'],
  'family-support': ['family support', 'family counseling', 'family wellbeing', 'family', 'counseling'],
  'family_wellbeing': ['family wellbeing', 'wellbeing centre', 'family centre', 'wellbeing', 'family'],
  'food_security': ['food', 'garden', 'nutrition', 'kitchen', 'cooking', 'bush tucker', 'vegetables'],
  'housing_services': ['housing', 'house', 'home', 'building', 'accommodation', 'construction'],
  'language-culture': ['language', 'culture', 'ceremony', 'dance', 'traditional', 'art', 'cultural'],
  'mens_programs': ['men', 'mens group', 'mens program', 'fatherhood', 'men gathering'],
  'mental-health': ['mental health', 'counseling', 'therapy', 'wellbeing', 'psychology', 'healing'],
  'ndis-service': ['ndis', 'disability', 'wheelchair', 'support worker', 'care'],
  'sewb-service': ['wellbeing', 'social emotional', 'sewb', 'counseling', 'healing', 'support'],
  'dfv-service': ['domestic violence', 'family violence', 'dfv', 'women safety', 'refuge'],
  'sport-recreation': ['sport', 'football', 'rugby', 'basketball', 'recreation', 'oval', 'playing', 'game', 'fitness'],
  'transport': ['transport', 'bus', 'vehicle', 'van', 'driving', 'car'],
  'youth_services': ['youth', 'young people', 'teen', 'adolescent', 'youth program', 'youth centre'],
};

interface Candidate {
  id: string;
  title: string | null;
  description: string | null;
  alt_text: string | null;
  tags: string[];
  width: number | null;
  height: number | null;
  public_url: string;
  original_filename: string | null;
}

function scoreCandidate(c: Candidate, slug: string, keywords: string[]): number {
  let score = 0;
  const tags = c.tags || [];
  const text = [c.title, c.description, c.alt_text, c.original_filename]
    .filter(Boolean)
    .join(' ')
    .toLowerCase();

  // Tag-based scoring
  if (tags.includes(`service:${slug}`)) score += 100; // Already tagged for this service
  if (tags.includes('professional-photography')) score += 40;
  if (tags.includes('event')) score += 20;
  if (tags.includes('photo')) score += 10;
  if (tags.includes('pdf-extract')) score -= 30;
  if (tags.includes('page-render')) score -= 50;
  if (tags.includes('audit:junk')) score -= 200;
  if (tags.some(t => t.startsWith('profile:'))) score -= 60; // Portraits aren't good covers

  // Keyword matching (earlier keywords = more relevant)
  for (let i = 0; i < keywords.length; i++) {
    const kw = keywords[i].toLowerCase();
    if (text.includes(kw)) {
      score += Math.max(50 - i * 8, 5); // First keyword = +50, declining
    }
  }

  // Image quality
  const pixels = (c.width || 0) * (c.height || 0);
  if (pixels > 0) {
    score += Math.min(pixels / 50000, 30); // Up to 30 points for large images
    if (pixels < 50000) score -= 20; // Penalize tiny images
  }

  // Aspect ratio bonus — prefer landscape (better for 16:9 hero)
  if (c.width && c.height && c.width > c.height) {
    score += 15;
  }

  // Penalize already-used heroes
  if (tags.includes('hero')) score -= 100;

  return score;
}

async function findCandidates(slug: string, serviceName: string): Promise<Candidate[]> {
  const candidates: Candidate[] = [];
  const seenIds = new Set<string>();
  const keywords = SERVICE_KEYWORDS[slug] || serviceName.toLowerCase().split(/\s+/);

  const addUnique = (items: any[]) => {
    for (const item of items) {
      if (!seenIds.has(item.id)) {
        seenIds.add(item.id);
        candidates.push(item);
      }
    }
  };

  // Strategy 1: Photos tagged with this service
  const { data: tagged } = await supabase
    .from('media_files')
    .select('id, title, description, alt_text, tags, width, height, public_url, original_filename')
    .contains('tags', [`service:${slug}`])
    .eq('file_type', 'image')
    .is('deleted_at', null)
    .limit(20);
  addUnique(tagged || []);

  // Strategy 2: Keyword search
  for (const kw of keywords.slice(0, 5)) {
    if (candidates.length >= 40) break;
    const like = `%${kw}%`;
    const { data } = await supabase
      .from('media_files')
      .select('id, title, description, alt_text, tags, width, height, public_url, original_filename')
      .eq('file_type', 'image')
      .is('deleted_at', null)
      .or(`title.ilike.${like},description.ilike.${like},alt_text.ilike.${like}`)
      .limit(15);
    addUnique(data || []);
  }

  // Strategy 3: Professional photos pool (about context)
  if (candidates.length < 15) {
    const { data } = await supabase
      .from('media_files')
      .select('id, title, description, alt_text, tags, width, height, public_url, original_filename')
      .eq('page_context', 'about')
      .eq('file_type', 'image')
      .is('deleted_at', null)
      .order('width', { ascending: false })
      .limit(30);
    addUnique(data || []);
  }

  // Score and sort
  return candidates
    .map(c => ({ ...c, score: scoreCandidate(c, slug, keywords) }))
    .sort((a, b) => b.score - a.score);
}

async function main() {
  console.log(`=== AUTO COVER MATCHER (${APPLY ? 'APPLY' : 'DRY RUN'}) ===\n`);

  const { data: services } = await supabase
    .from('organization_services')
    .select('id, name, slug, service_category')
    .eq('is_active', true)
    .order('name');

  // Find services without covers
  const needsCover: any[] = [];
  for (const s of (services || [])) {
    const { count } = await supabase
      .from('media_files')
      .select('id', { count: 'exact', head: true })
      .contains('tags', [`service:${s.slug}`, 'hero'])
      .is('deleted_at', null);
    if ((count || 0) === 0) needsCover.push(s);
  }

  console.log(`Services needing covers: ${needsCover.length}\n`);

  let matched = 0;
  let noMatch = 0;
  const usedIds = new Set<string>();

  for (const svc of needsCover) {
    const candidates = await findCandidates(svc.slug, svc.name);

    // Filter out already-used photos
    const available = candidates.filter((c: any) => !usedIds.has(c.id));
    const best = available[0] as any;

    if (!best || best.score < 10) {
      console.log(`[NO MATCH] ${svc.name} (${svc.slug})`);
      console.log(`  Best score: ${best ? best.score : 'none'}`);
      console.log(`  Candidates found: ${candidates.length}`);
      noMatch++;
      console.log();
      continue;
    }

    usedIds.add(best.id);
    const tags = (best.tags || []).slice(0, 5).join(', ');
    console.log(`[MATCH] ${svc.name}`);
    console.log(`  Photo: "${best.title || best.original_filename || best.id.slice(0, 8)}"`);
    console.log(`  Size: ${best.width}x${best.height} | Score: ${best.score} | Tags: [${tags}]`);
    console.log(`  URL: ${best.public_url.slice(0, 80)}...`);

    if (APPLY) {
      const currentTags: string[] = best.tags || [];
      const newTags = [...new Set([...currentTags, `service:${svc.slug}`, 'hero'])];

      await supabase.from('media_files').update({
        tags: newTags,
        page_context: 'home',
        page_section: `service-${svc.slug}`,
        is_featured: true,
        display_order: 0,
      }).eq('id', best.id);

      console.log(`  [APPLIED]`);
    }
    matched++;
    console.log();
  }

  console.log(`=== SUMMARY ===`);
  console.log(`  Matched: ${matched}`);
  console.log(`  No match: ${noMatch}`);
  if (!APPLY && matched > 0) {
    console.log(`\n  Run with --apply to set ${matched} cover photos.`);
  }
}

main().catch(console.error);
