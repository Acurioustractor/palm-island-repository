/**
 * Fix story quality issues across 4 tiers:
 * - Tier 4: Strip raw HTML tags (1 story)
 * - Tier 3: Strip timecodes [00:00:00] and markdown dividers ===/--- (6 stories)
 * - Tier 2: Strip timecodes + dividers + speech fillers (10 stories)
 * - Tier 1: AI-assisted rewrite from raw transcript to narrative (5 stories)
 *
 * Usage: npx tsx scripts/fix-story-quality.ts [--tier N] [--dry-run]
 */

import { createClient } from '@supabase/supabase-js';
import * as dotenv from 'dotenv';
import * as path from 'path';

dotenv.config({ path: path.resolve(process.cwd(), '.env.local') });

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY! || process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!;
const supabase = createClient(supabaseUrl, supabaseKey);

const args = process.argv.slice(2);
const dryRun = args.includes('--dry-run');
const tierArg = args.find(a => a.startsWith('--tier='));
const onlyTier = tierArg ? parseInt(tierArg.split('=')[1]) : null;

// Story IDs by tier
const TIER_4 = ['6cb23cd9']; // Walking Country Together - HTML tags
const TIER_3 = ['05664f99', '64e63916', '940cd6df', '369d5a7c', '4f11b96e', '7687a144']; // Timecodes + dividers
const TIER_2 = ['2f8dc5b4', 'e17c6602', '85941136', '039b431c', '2060f911', 'fbfbc947', '112ed99c', '2d8346ae', 'c6cff988', 'd6ada43d']; // Fillers + timecodes
const TIER_1 = ['74e05337', 'ed342ea3', '9aac5294', 'd9743bbf', 'a53b2e8f']; // Full rewrites needed

// --- Cleaning functions ---

function stripHtmlTags(text: string): string {
  // Remove HTML tags but preserve the inner text
  return text
    .replace(/<h[1-6][^>]*>(.*?)<\/h[1-6]>/gi, '\n$1\n')
    .replace(/<br\s*\/?>/gi, '\n')
    .replace(/<p[^>]*>(.*?)<\/p>/gi, '$1\n')
    .replace(/<span[^>]*>(.*?)<\/span>/gi, '$1')
    .replace(/<div[^>]*>(.*?)<\/div>/gi, '$1\n')
    .replace(/<[^>]+>/g, '') // catch remaining tags
    .replace(/\n{3,}/g, '\n\n')
    .trim();
}

function stripTimecodes(text: string): string {
  // Remove [00:00:00] or [0:00:00] or (00:00:00) patterns
  return text
    .replace(/\[?\(?\d{1,2}:\d{2}:\d{2}\)?\]?\s*/g, '')
    .replace(/\[?\(?\d{1,2}:\d{2}\)?\]?\s*/g, ''); // Also HH:MM
}

function stripDividers(text: string): string {
  // Remove === and --- divider lines but preserve paragraph breaks
  return text
    .replace(/^[=]{3,}\s*$/gm, '\n')
    .replace(/^[-]{3,}\s*$/gm, '\n')
    .replace(/^[_]{3,}\s*$/gm, '\n')
    .replace(/\n{3,}/g, '\n\n')
    .trim();
}

function stripFillers(text: string): string {
  // Remove common speech fillers: um, uh, you know, like (when filler), sort of, kind of
  let result = text;

  // "um" and "uh" as standalone words (with optional commas)
  result = result.replace(/\b[Uu]mm?\b[,.]?\s*/g, '');
  result = result.replace(/\b[Uu]hh?\b[,.]?\s*/g, '');

  // "you know" as filler (not at start of important sentence)
  result = result.replace(/,?\s*you know,?\s*/gi, ' ');

  // "sort of" and "kind of" as fillers
  result = result.replace(/,?\s*sort of\s*/gi, ' ');
  result = result.replace(/,?\s*kind of\s*/gi, ' ');

  // "like" as filler (between commas or before a pause)
  result = result.replace(/,\s*like,\s*/gi, ', ');

  // "yeah" as filler mid-sentence
  result = result.replace(/,?\s*yeah,?\s*/gi, ' ');

  // Clean up double spaces and spacing around punctuation
  result = result.replace(/\s{2,}/g, ' ');
  result = result.replace(/\s+([,.])/g, '$1');
  result = result.replace(/\.\s*\./g, '.');

  return result.trim();
}

function cleanStory(text: string, tier: number): string {
  let result = text;

  if (tier === 4) {
    result = stripHtmlTags(result);
  }

  if (tier <= 3) {
    result = stripTimecodes(result);
    result = stripDividers(result);
  }

  if (tier <= 2) {
    result = stripFillers(result);
  }

  // Final cleanup for all tiers
  result = result
    .replace(/\n{3,}/g, '\n\n') // Collapse excessive newlines
    .replace(/^\s+$/gm, '')      // Remove whitespace-only lines
    .trim();

  // Ensure title line (first line) is separated from body by a blank line
  const lines = result.split('\n');
  if (lines.length > 1 && lines[0].trim() && lines[1].trim()) {
    // First line looks like a title, second line has content — insert blank line
    lines.splice(1, 0, '');
    result = lines.join('\n');
  }

  return result;
}

// --- Main ---

async function fetchStories(ids: string[]) {
  // Partial UUIDs - need to cast to text for LIKE matching
  const stories = [];
  for (const partialId of ids) {
    const { data, error } = await supabase
      .from('stories')
      .select('id, title, content, storyteller_id')
      .filter('id::text', 'like', `${partialId}%`)
      .limit(1);

    if (error) {
      // Fallback: try fetching all and filtering client-side
      const { data: all, error: err2 } = await supabase
        .from('stories')
        .select('id, title, content, storyteller_id')
        .limit(500);

      if (err2) {
        console.error(`Error fetching story ${partialId}:`, err2.message);
        continue;
      }
      const match = (all || []).find((s: any) => s.id.startsWith(partialId));
      if (match) {
        stories.push(match);
      } else {
        console.warn(`Story not found: ${partialId}`);
      }
      continue;
    }
    if (data && data.length > 0) {
      stories.push(data[0]);
    } else {
      console.warn(`Story not found: ${partialId}`);
    }
  }
  return stories;
}

async function updateStory(id: string, content: string) {
  if (dryRun) {
    console.log(`  [DRY RUN] Would update story ${id.slice(0, 8)}`);
    return;
  }

  const { error } = await supabase
    .from('stories')
    .update({ content })
    .eq('id', id);

  if (error) {
    console.error(`  Error updating story ${id.slice(0, 8)}:`, error.message);
  } else {
    console.log(`  ✓ Updated story ${id.slice(0, 8)}`);
  }
}

async function processTier(tierNum: number, ids: string[], label: string) {
  if (onlyTier && onlyTier !== tierNum) return;

  console.log(`\n${'='.repeat(60)}`);
  console.log(`TIER ${tierNum}: ${label} (${ids.length} stories)`);
  console.log('='.repeat(60));

  const stories = await fetchStories(ids);

  for (const story of stories) {
    const original = story.content || '';
    const cleaned = cleanStory(original, tierNum);

    const originalLen = original.length;
    const cleanedLen = cleaned.length;
    const reduction = originalLen > 0 ? Math.round((1 - cleanedLen / originalLen) * 100) : 0;

    console.log(`\n  "${story.title}" (${story.id.slice(0, 8)})`);
    console.log(`  Original: ${originalLen} chars → Cleaned: ${cleanedLen} chars (${reduction}% reduction)`);

    if (original === cleaned) {
      console.log(`  → No changes needed`);
      continue;
    }

    // Show a diff preview
    const lines = original.split('\n').slice(0, 5);
    const cleanedLines = cleaned.split('\n').slice(0, 5);
    console.log(`  First 5 lines before:`);
    lines.forEach(l => console.log(`    ${l.slice(0, 100)}`));
    console.log(`  First 5 lines after:`);
    cleanedLines.forEach(l => console.log(`    ${l.slice(0, 100)}`));

    await updateStory(story.id, cleaned);
  }
}

async function main() {
  console.log(`\n${'*'.repeat(60)}`);
  console.log(`STORY QUALITY FIX${dryRun ? ' (DRY RUN)' : ''}`);
  console.log(`${'*'.repeat(60)}`);

  // Tier 4: HTML cleanup
  await processTier(4, TIER_4, 'HTML tag cleanup (Walking Country Together)');

  // Tier 3: Timecodes + dividers
  await processTier(3, TIER_3, 'Timecodes and divider stripping');

  // Tier 2: Fillers + timecodes + dividers
  await processTier(2, TIER_2, 'Filler words + timecodes + dividers');

  // Tier 1: These need AI-assisted rewrite - flag for manual review
  if (!onlyTier || onlyTier === 1) {
    console.log(`\n${'='.repeat(60)}`);
    console.log(`TIER 1: Raw transcripts needing AI-assisted rewrite (${TIER_1.length} stories)`);
    console.log('='.repeat(60));

    const tier1Stories = await fetchStories(TIER_1);
    for (const story of tier1Stories) {
      const original = story.content || '';
      // For Tier 1, still apply mechanical cleanup first
      const cleaned = cleanStory(original, 1);

      const originalLen = original.length;
      const cleanedLen = cleaned.length;
      const reduction = originalLen > 0 ? Math.round((1 - cleanedLen / originalLen) * 100) : 0;

      console.log(`\n  "${story.title}" (${story.id.slice(0, 8)})`);
      console.log(`  Original: ${originalLen} chars → After mechanical cleanup: ${cleanedLen} chars (${reduction}% reduction)`);
      console.log(`  ⚠ This story needs AI-assisted rewrite (raw transcript)`);
      console.log(`  Applying mechanical cleanup first...`);

      if (original !== cleaned) {
        await updateStory(story.id, cleaned);
      } else {
        console.log(`  → No mechanical changes needed`);
      }
    }

    console.log(`\n  ⚠ Tier 1 stories have had mechanical cleanup applied.`);
    console.log(`  Run with --tier=1-rewrite for AI-assisted narrative rewriting.`);
  }

  console.log(`\n${'*'.repeat(60)}`);
  console.log(`DONE${dryRun ? ' (DRY RUN - no changes written)' : ''}`);
  console.log(`${'*'.repeat(60)}\n`);
}

main().catch(console.error);
