/**
 * AI-assisted rewrite of raw interview transcripts (Tier 1 stories)
 * into readable first-person narratives.
 *
 * Uses Claude Haiku for cost efficiency.
 * Preserves authentic voice, key quotes, and cultural content.
 *
 * Usage: npx tsx scripts/rewrite-raw-transcripts.ts [--dry-run] [--id=PARTIAL_ID]
 */

import { createClient } from '@supabase/supabase-js';
import Anthropic from '@anthropic-ai/sdk';
import * as dotenv from 'dotenv';
import * as path from 'path';

dotenv.config({ path: path.resolve(process.cwd(), '.env.local') });

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY! || process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!;
const supabase = createClient(supabaseUrl, supabaseKey);

const anthropic = new Anthropic({
  apiKey: process.env.ANTHROPIC_API_KEY!,
});

const args = process.argv.slice(2);
const dryRun = args.includes('--dry-run');
const idArg = args.find(a => a.startsWith('--id='));
const onlyId = idArg ? idArg.split('=')[1] : null;

const TIER_1_IDS = ['74e05337', 'ed342ea3', '9aac5294', 'd9743bbf', 'a53b2e8f'];
const idsToProcess = onlyId ? [onlyId] : TIER_1_IDS;

const REWRITE_PROMPT = `You are editing raw interview transcripts from Palm Island, an Aboriginal community in Queensland, Australia. These are real community voices recorded by Palm Island Community Company (PICC).

Your task: Transform the raw transcript into a readable narrative story while preserving the authentic voice and meaning.

RULES:
1. PRESERVE all authentic quotes, phrases, and expressions exactly as spoken
2. PRESERVE all names, places, dates, and cultural references exactly
3. REMOVE interviewer questions and prompts (e.g., "What was that like?", "Can you tell me about...")
4. REMOVE speech artifacts: "um", "uh", "you know", "like" (as filler), "yeah", stutters, false starts
5. REMOVE transcription errors and garbled text (only if clearly garbled)
6. REMOVE "Speaker 25/26/27" labels — use actual names when known
7. CONVERT from Q&A format to flowing narrative paragraphs
8. ADD paragraph breaks between distinct topics or themes
9. Use first person where the speaker is narrating their own experience
10. For group conversations, use "Name said:" or "As Name explained:" to attribute quotes
11. Keep the storyteller's natural speech patterns — don't make it sound formal or academic
12. Keep the story's original title as the first line
13. Aim for the story to be roughly 40-60% of the original length
14. Do NOT add any content, facts, or interpretation that isn't in the original transcript
15. Do NOT add editorial commentary or "this story is about..." framing

OUTPUT: Just the cleaned story text. No preamble, no "Here is the rewritten story:", just the story itself.`;

async function fetchStory(partialId: string) {
  const { data } = await supabase
    .from('stories')
    .select('id, title, content, storyteller_id')
    .limit(500);

  return (data || []).find((s: any) => s.id.startsWith(partialId));
}

async function rewriteStory(title: string, content: string): Promise<string> {
  const message = await anthropic.messages.create({
    model: 'claude-haiku-4-5-20251001',
    max_tokens: 8192,
    messages: [
      {
        role: 'user',
        content: `Here is the raw interview transcript to rewrite:\n\nTitle: ${title}\n\n<transcript>\n${content}\n</transcript>`,
      },
    ],
    system: REWRITE_PROMPT,
  });

  const textBlock = message.content.find((b) => b.type === 'text');
  return textBlock?.text || '';
}

async function main() {
  console.log(`\n${'*'.repeat(60)}`);
  console.log(`TIER 1: AI-ASSISTED TRANSCRIPT REWRITE${dryRun ? ' (DRY RUN)' : ''}`);
  console.log(`${'*'.repeat(60)}\n`);

  for (const partialId of idsToProcess) {
    const story = await fetchStory(partialId);
    if (!story) {
      console.warn(`Story not found: ${partialId}`);
      continue;
    }

    console.log(`\n${'='.repeat(60)}`);
    console.log(`"${story.title}" (${partialId})`);
    console.log(`Original: ${story.content.length} chars`);
    console.log('='.repeat(60));

    if (dryRun) {
      console.log(`[DRY RUN] Would rewrite this story`);
      console.log(`First 200 chars: ${story.content.slice(0, 200)}`);
      continue;
    }

    console.log('Rewriting with Claude Haiku...');
    const rewritten = await rewriteStory(story.title, story.content);

    if (!rewritten || rewritten.length < 200) {
      console.error(`  ✗ Rewrite too short or empty (${rewritten.length} chars) — skipping`);
      continue;
    }

    const reduction = Math.round((1 - rewritten.length / story.content.length) * 100);
    console.log(`Rewritten: ${rewritten.length} chars (${reduction}% reduction)`);
    console.log(`\nFirst 500 chars of rewrite:`);
    console.log(rewritten.slice(0, 500));
    console.log('...\n');

    // Save to database
    const { error } = await supabase
      .from('stories')
      .update({ content: rewritten })
      .eq('id', story.id);

    if (error) {
      console.error(`  ✗ Error saving: ${error.message}`);
    } else {
      console.log(`  ✓ Saved rewritten story`);
    }
  }

  console.log(`\n${'*'.repeat(60)}`);
  console.log(`DONE${dryRun ? ' (DRY RUN)' : ''}`);
  console.log(`${'*'.repeat(60)}\n`);
}

main().catch(console.error);
