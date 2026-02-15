/**
 * Smart Cover Photo Matcher
 *
 * For each service without a cover, searches the photo library using
 * titles, tags, descriptions, and AI metadata, then uses Claude to
 * pick the best match from candidates.
 *
 * Usage:
 *   npx tsx scripts/smart-cover-matcher.ts              # Dry run
 *   npx tsx scripts/smart-cover-matcher.ts --apply       # Apply matches
 */
import { createClient } from '@supabase/supabase-js';
import Anthropic from '@anthropic-ai/sdk';
import * as dotenv from 'dotenv';
import { resolve } from 'path';

dotenv.config({ path: resolve(__dirname, '../.env.local') });

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL as string,
  process.env.SUPABASE_SERVICE_ROLE_KEY as string
);

const anthropic = new Anthropic({
  apiKey: process.env.ANTHROPIC_API_KEY as string,
});

const APPLY = process.argv.includes('--apply');

// Keywords to search for each service category + specific services
const SEARCH_KEYWORDS: Record<string, string[]> = {
  'community-development': ['community', 'meeting', 'gathering', 'group', 'development', 'planning'],
  'community_justice': ['justice', 'court', 'legal', 'community justice', 'mediation'],
  'digital_services': ['digital', 'computer', 'telstra', 'call centre', 'technology', 'office'],
  'diversionary-service': ['diversionary', 'diversion', 'activity', 'program'],
  'early_learning': ['early learning', 'childcare', 'children', 'playgroup', 'toddler', 'kindergarten'],
  'economic_development': ['economic', 'business', 'enterprise', 'bakery', 'shop', 'fuel'],
  'education-support': ['education', 'school', 'learning', 'classroom', 'student', 'study'],
  'family-care-service': ['family', 'care', 'child protection', 'kinship'],
  'family-participation-program': ['family', 'participation', 'parent', 'children'],
  'family-support': ['family', 'support', 'counseling', 'wellbeing'],
  'family_wellbeing': ['family', 'wellbeing', 'centre', 'counseling', 'support'],
  'food_security': ['food', 'garden', 'kitchen', 'nutrition', 'cooking', 'bush tucker'],
  'housing_services': ['housing', 'house', 'home', 'building', 'construction'],
  'language-culture': ['language', 'culture', 'traditional', 'ceremony', 'dance', 'art'],
  'mens_programs': ['men', 'mens', 'gathering', 'group', 'healing'],
  'mental-health': ['mental health', 'counseling', 'wellbeing', 'therapy', 'healing'],
  'ndis-service': ['ndis', 'disability', 'support', 'care', 'wheelchair'],
  'sewb-service': ['wellbeing', 'social', 'emotional', 'counseling', 'healing'],
  'dfv-service': ['domestic', 'family violence', 'women', 'support', 'safety'],
  'sport-recreation': ['sport', 'recreation', 'football', 'rugby', 'basketball', 'oval', 'game', 'playing'],
  'transport': ['transport', 'bus', 'vehicle', 'van', 'driving'],
  'youth_services': ['youth', 'young', 'teen', 'adolescent', 'kids'],
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
}

async function findCandidates(slug: string, serviceName: string): Promise<Candidate[]> {
  const candidates: Candidate[] = [];
  const seenIds = new Set<string>();

  const addUnique = (items: any[]) => {
    for (const item of items) {
      if (!seenIds.has(item.id)) {
        seenIds.add(item.id);
        candidates.push({
          id: item.id,
          title: item.title,
          description: item.description,
          alt_text: item.alt_text,
          tags: item.tags || [],
          width: item.width,
          height: item.height,
          public_url: item.public_url,
        });
      }
    }
  };

  // Strategy 1: Photos already tagged with this service
  const { data: tagged } = await supabase
    .from('media_files')
    .select('id, title, description, alt_text, tags, width, height, public_url')
    .contains('tags', [`service:${slug}`])
    .eq('file_type', 'image')
    .is('deleted_at', null)
    .limit(20);
  addUnique(tagged || []);

  // Strategy 2: Keyword search in title/description
  const keywords = SEARCH_KEYWORDS[slug] || serviceName.toLowerCase().split(/\s+/);
  for (const kw of keywords.slice(0, 4)) {
    const like = `%${kw}%`;
    const { data: matches } = await supabase
      .from('media_files')
      .select('id, title, description, alt_text, tags, width, height, public_url')
      .eq('file_type', 'image')
      .is('deleted_at', null)
      .or(`title.ilike.${like},description.ilike.${like},alt_text.ilike.${like}`)
      .limit(10);
    addUnique(matches || []);
    if (candidates.length >= 30) break;
  }

  // Strategy 3: Photos from about/home context (professional photography pool)
  if (candidates.length < 10) {
    const { data: aboutPhotos } = await supabase
      .from('media_files')
      .select('id, title, description, alt_text, tags, width, height, public_url')
      .eq('page_context', 'about')
      .eq('file_type', 'image')
      .is('deleted_at', null)
      .order('width', { ascending: false })
      .limit(30);
    addUnique(aboutPhotos || []);
  }

  // Filter out tiny images, PDFs, profiles
  return candidates.filter(c => {
    const tags = c.tags || [];
    if (tags.includes('audit:junk')) return false;
    if (tags.includes('hero')) return false; // Already used as cover
    if (tags.some(t => t.startsWith('profile:'))) return false;
    const pixels = (c.width || 0) * (c.height || 0);
    if (pixels > 0 && pixels < 50000) return false; // Too small
    return true;
  });
}

function candidateToString(c: Candidate, idx: number): string {
  const tags = (c.tags || []).slice(0, 8).join(', ');
  const size = c.width && c.height ? `${c.width}x${c.height}` : 'unknown size';
  return `${idx + 1}. "${c.title || '(no title)'}" [${size}] tags:[${tags}] desc:"${(c.description || c.alt_text || '').slice(0, 100)}"`;
}

async function main() {
  console.log(`=== SMART COVER MATCHER (${APPLY ? 'APPLY' : 'DRY RUN'}) ===\n`);

  // Load services without covers
  const { data: services } = await supabase
    .from('organization_services')
    .select('id, name, slug, description, service_category')
    .eq('is_active', true)
    .order('name');

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

  // Process in batches of 5 for the AI call
  const batchSize = 5;
  let matched = 0;
  let noMatch = 0;

  for (let i = 0; i < needsCover.length; i += batchSize) {
    const batch = needsCover.slice(i, i + batchSize);

    // Find candidates for each service in this batch
    const batchData: Array<{ service: any; candidates: Candidate[] }> = [];
    for (const svc of batch) {
      const candidates = await findCandidates(svc.slug, svc.name);
      batchData.push({ service: svc, candidates });
      console.log(`  Found ${candidates.length} candidates for ${svc.name}`);
    }

    // Build the AI prompt
    const serviceBlocks = batchData.map(({ service, candidates }) => {
      if (candidates.length === 0) return `### ${service.name} (${service.slug})\nCategory: ${service.service_category}\nDescription: ${service.description}\nCANDIDATES: NONE FOUND\n`;
      const candidateList = candidates.slice(0, 15).map(candidateToString).join('\n');
      return `### ${service.name} (${service.slug})\nCategory: ${service.service_category}\nDescription: ${service.description}\nCANDIDATES:\n${candidateList}\n`;
    }).join('\n---\n\n');

    console.log(`\n  Asking Claude to pick best matches for batch ${Math.floor(i / batchSize) + 1}...\n`);

    const response = await anthropic.messages.create({
      model: 'claude-sonnet-4-5-20250929',
      max_tokens: 2000,
      messages: [{
        role: 'user',
        content: `You are selecting cover photos for services on the Palm Island Community Company website. For each service, pick the BEST photo from the candidates that would work as a hero/cover image (16:9 aspect ratio, displayed on the services page).

## Selection Criteria
- Prefer LARGER images (higher resolution = better for hero display)
- Prefer photos showing PEOPLE engaged in the service (not empty buildings or documents)
- Prefer professional photography over PDF extracts
- The photo should visually represent what the service does
- Avoid generic/abstract images if there's something specific
- If a photo has relevant service tags, that's a strong signal
- If NO candidate is a good match, say "none"

## Services and Their Candidates

${serviceBlocks}

## Output Format
Return ONLY a JSON array:
[
  { "slug": "service-slug", "pick": 1, "reason": "brief reason" },
  { "slug": "other-slug", "pick": "none", "reason": "no good match" }
]

Where "pick" is the candidate number (1-indexed) or "none". No markdown wrapping.`
      }],
    });

    const text = response.content[0].type === 'text' ? response.content[0].text : '';
    let picks: Array<{ slug: string; pick: number | string; reason: string }>;
    try {
      const jsonMatch = text.match(/\[[\s\S]*\]/);
      if (!jsonMatch) throw new Error('No JSON found');
      picks = JSON.parse(jsonMatch[0]);
    } catch (e) {
      console.error('  Failed to parse AI response:', text.slice(0, 300));
      continue;
    }

    // Apply picks
    for (const pick of picks) {
      const bd = batchData.find(b => b.service.slug === pick.slug);
      if (!bd) continue;

      if (pick.pick === 'none' || pick.pick === null) {
        console.log(`  [NO MATCH] ${bd.service.name} — ${pick.reason}`);
        noMatch++;
        continue;
      }

      const idx = (typeof pick.pick === 'number' ? pick.pick : parseInt(pick.pick)) - 1;
      const candidate = bd.candidates[idx];
      if (!candidate) {
        console.log(`  [ERROR] ${bd.service.name} — invalid pick index ${pick.pick}`);
        noMatch++;
        continue;
      }

      console.log(`  [MATCH] ${bd.service.name}`);
      console.log(`    Photo: "${candidate.title || candidate.id.slice(0, 8)}" (${candidate.width}x${candidate.height})`);
      console.log(`    Reason: ${pick.reason}`);

      if (APPLY) {
        // Set as cover: add tags + page_context
        const currentTags: string[] = candidate.tags || [];
        const newTags = [...new Set([...currentTags, `service:${bd.service.slug}`, 'hero'])];

        // Remove hero from any existing cover for this service
        const { data: oldHeroes } = await supabase
          .from('media_files')
          .select('id, tags')
          .contains('tags', [`service:${bd.service.slug}`, 'hero']);
        for (const old of (oldHeroes || [])) {
          if (old.id === candidate.id) continue;
          await supabase.from('media_files').update({
            tags: (old.tags as string[]).filter((t: string) => t !== 'hero'),
          }).eq('id', old.id);
        }

        await supabase.from('media_files').update({
          tags: newTags,
          page_context: 'home',
          page_section: `service-${bd.service.slug}`,
          is_featured: true,
          display_order: 0,
        }).eq('id', candidate.id);

        console.log(`    [APPLIED]`);
      }
      matched++;
      console.log();
    }
  }

  console.log(`\n=== SUMMARY ===`);
  console.log(`  Matched: ${matched}`);
  console.log(`  No match: ${noMatch}`);
  if (!APPLY && matched > 0) {
    console.log(`\n  Run with --apply to set ${matched} cover photos.`);
  }
}

main().catch(console.error);
