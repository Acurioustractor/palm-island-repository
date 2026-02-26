/**
 * Fix stories where the title merged with the first paragraph
 * after timecode/divider stripping. Uses the story's title field
 * to find and separate the inline title from body text.
 */

import { createClient } from '@supabase/supabase-js';
import * as dotenv from 'dotenv';
import * as path from 'path';

dotenv.config({ path: path.resolve(process.cwd(), '.env.local') });

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY! || process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!;
const supabase = createClient(supabaseUrl, supabaseKey);

// All Tier 2 + Tier 3 stories that had the title merge issue
const STORY_IDS = [
  // Tier 3
  '05664f99', '64e63916', '940cd6df', '369d5a7c', '4f11b96e', '7687a144',
  // Tier 2
  '2f8dc5b4', 'e17c6602', '85941136', '039b431c', '2060f911', 'fbfbc947',
  '112ed99c', '2d8346ae', 'c6cff988', 'd6ada43d',
  // Tier 1 (also had this format)
  '74e05337', 'ed342ea3', '9aac5294', 'd9743bbf', 'a53b2e8f',
];

async function main() {
  console.log('Fixing title/body separation...\n');

  for (const partialId of STORY_IDS) {
    let story: any = null;
    const { data, error } = await supabase
      .from('stories')
      .select('id, title, content')
      .filter('id::text', 'like', `${partialId}%`)
      .limit(1);

    if (!error && data?.length) {
      story = data[0];
    } else {
      // Fallback: fetch all and filter client-side
      const { data: all } = await supabase
        .from('stories')
        .select('id, title, content')
        .limit(500);
      story = (all || []).find((s: any) => s.id.startsWith(partialId));
      if (!story) { console.warn(`  Not found: ${partialId}`); continue; }
    }
    const content = story.content || '';

    // Check if content starts with a title-like prefix that matches the story title
    // The content might start with "Name - Title Body..." or "Title Body..."
    // We need to find where the title ends and body starts

    // Strategy: The first line should be the title. If the first line contains
    // the story title (or a variant with storyteller prefix), split after the title.
    const firstNewline = content.indexOf('\n');
    const firstLine = firstNewline > 0 ? content.slice(0, firstNewline) : content;

    // If first line already has a blank line after it, skip
    if (firstNewline > 0 && content[firstNewline + 1] === '\n') {
      console.log(`  "${story.title}" (${partialId}) — already has title separation`);
      continue;
    }

    // Find the title in the content. It could be:
    // "Story Title" or "Storyteller - Story Title" or "Storyteller: Story Title"
    // The actual story title field is stored in story.title
    const titleInContent = findTitleEnd(content, story.title);

    if (titleInContent > 0) {
      const newContent = content.slice(0, titleInContent).trimEnd() + '\n\n' + content.slice(titleInContent).trimStart();

      const { error: updateErr } = await supabase
        .from('stories')
        .update({ content: newContent })
        .eq('id', story.id);

      if (updateErr) {
        console.error(`  Error updating ${partialId}: ${updateErr.message}`);
      } else {
        console.log(`  ✓ "${story.title}" (${partialId}) — separated title from body`);
        console.log(`    Title: "${newContent.split('\n')[0].slice(0, 80)}"`);
        console.log(`    Body starts: "${newContent.split('\n\n')[1]?.slice(0, 60)}..."`);
      }
    } else {
      console.log(`  ⚠ "${story.title}" (${partialId}) — could not find title boundary`);
    }
  }

  console.log('\nDone.');
}

function findTitleEnd(content: string, storyTitle: string): number {
  // Try to find the story title (or a recognizable variant) at the start of content
  // Common patterns:
  // "Storyteller Name - Story Title Body starts here..."
  // "Story Title Body starts here..."

  // Normalize the title for matching
  const normalizedTitle = storyTitle.trim();

  // Direct match: content starts with the exact title
  if (content.startsWith(normalizedTitle)) {
    return normalizedTitle.length;
  }

  // Check for "Name - Title" or "Name: Title" prefix patterns
  // Look for common title patterns in the first 200 chars
  const head = content.slice(0, 300);

  // Try to find the title text within the head
  const titleIdx = head.indexOf(normalizedTitle);
  if (titleIdx >= 0) {
    return titleIdx + normalizedTitle.length;
  }

  // Try matching without special characters (quotes, apostrophes)
  const simplifyStr = (s: string) => s.replace(/[''"""':,\-–—]/g, '').replace(/\s+/g, ' ').trim().toLowerCase();
  const simpleTitle = simplifyStr(normalizedTitle);

  // Find where the simplified title ends in the simplified content
  const simpleHead = simplifyStr(head);
  const simpleIdx = simpleHead.indexOf(simpleTitle);
  if (simpleIdx >= 0) {
    // Map back to original position - approximate by counting chars
    // Find the actual end position in original content
    let origPos = 0;
    let simplePos = 0;
    const simpleEnd = simpleIdx + simpleTitle.length;

    for (let i = 0; i < head.length && simplePos < simpleEnd; i++) {
      const simplified = simplifyStr(head[i]);
      if (simplified.length > 0) {
        simplePos++;
      }
      origPos = i + 1;
    }
    return origPos;
  }

  // Fallback: look for where the first sentence-like content starts
  // (after any "Title - Subtitle" pattern)
  // Heuristic: title lines don't usually have periods mid-sentence
  const firstPeriod = head.indexOf('. ');
  if (firstPeriod > 20 && firstPeriod < 200) {
    // Check if everything before the period looks like a title
    const beforePeriod = head.slice(0, firstPeriod);
    if (!beforePeriod.includes('\n')) {
      // Single line with no period = likely title + start of body
      // Try to find a natural break - capital letter after lowercase
      for (let i = normalizedTitle.length; i < firstPeriod; i++) {
        if (head[i] === ' ' && head[i + 1] && head[i + 1] === head[i + 1].toUpperCase() && head[i + 1] !== head[i + 1].toLowerCase()) {
          // Found "lowercase UPPERCASE" boundary - likely title/body break
          return i;
        }
      }
    }
  }

  return -1;
}

main().catch(console.error);
