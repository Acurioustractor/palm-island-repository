/**
 * Tag Media Script
 * Search media by title/filename/tags and add or remove tags in bulk.
 *
 * Usage:
 *   npx tsx scripts/tag-media.ts --search "daycare" --add-tag "service:early-childhood"
 *   npx tsx scripts/tag-media.ts --search "board" --add-tag "leadership" --add-tag "board"
 *   npx tsx scripts/tag-media.ts --search "placeholder" --remove-tag "featured"
 *   npx tsx scripts/tag-media.ts --id "abc123" --add-tag "hero"
 *   npx tsx scripts/tag-media.ts --untagged --add-tag "needs-review"
 *   npx tsx scripts/tag-media.ts --tag "pdf-extract" --add-tag "annual-report"
 *
 * Flags:
 *   --search <term>      Search title, filename, description (ILIKE)
 *   --tag <tag>           Find media that already has this tag
 *   --id <uuid>           Target a single media file by ID (partial OK)
 *   --untagged            Find media with no tags
 *   --add-tag <tag>       Tag(s) to add (repeatable)
 *   --remove-tag <tag>    Tag(s) to remove (repeatable)
 *   --execute             Apply changes (default is dry run)
 *   --limit <n>           Max files to process (default 50)
 */

import { createClient } from '@supabase/supabase-js';
import * as dotenv from 'dotenv';
import { resolve } from 'path';

dotenv.config({ path: resolve(__dirname, '../.env.local') });

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
);

function parseArgs() {
  const args = process.argv.slice(2);
  const parsed: {
    search?: string;
    tag?: string;
    id?: string;
    untagged: boolean;
    addTags: string[];
    removeTags: string[];
    execute: boolean;
    limit: number;
  } = {
    untagged: false,
    addTags: [],
    removeTags: [],
    execute: false,
    limit: 50,
  };

  for (let i = 0; i < args.length; i++) {
    switch (args[i]) {
      case '--search':
        parsed.search = args[++i];
        break;
      case '--tag':
        parsed.tag = args[++i];
        break;
      case '--id':
        parsed.id = args[++i];
        break;
      case '--untagged':
        parsed.untagged = true;
        break;
      case '--add-tag':
        parsed.addTags.push(args[++i]);
        break;
      case '--remove-tag':
        parsed.removeTags.push(args[++i]);
        break;
      case '--execute':
        parsed.execute = true;
        break;
      case '--limit':
        parsed.limit = parseInt(args[++i], 10);
        break;
    }
  }

  return parsed;
}

async function run() {
  const opts = parseArgs();

  if (!opts.search && !opts.tag && !opts.id && !opts.untagged) {
    console.log('Usage: npx tsx scripts/tag-media.ts --search <term> --add-tag <tag> [--execute]');
    console.log('       npx tsx scripts/tag-media.ts --tag <existing-tag> --add-tag <new-tag>');
    console.log('       npx tsx scripts/tag-media.ts --id <uuid> --add-tag <tag>');
    console.log('       npx tsx scripts/tag-media.ts --untagged --add-tag <tag>');
    console.log('\nPass --execute to apply. Default is dry run.');
    return;
  }

  if (opts.addTags.length === 0 && opts.removeTags.length === 0) {
    console.log('Nothing to do — provide --add-tag or --remove-tag');
    return;
  }

  const mode = opts.execute ? 'EXECUTE' : 'DRY RUN';
  console.log(`=== TAG MEDIA (${mode}) ===\n`);

  // Build query
  let query = supabase
    .from('media_files')
    .select('id, title, original_filename, tags, public_url, file_type')
    .is('deleted_at', null)
    .limit(opts.limit);

  if (opts.id) {
    // Partial ID match
    query = query.ilike('id', `${opts.id}%`);
  }

  if (opts.search) {
    const like = `%${opts.search}%`;
    query = query.or(`title.ilike.${like},original_filename.ilike.${like},description.ilike.${like}`);
  }

  if (opts.tag) {
    query = query.contains('tags', [opts.tag]);
  }

  if (opts.untagged) {
    // Postgres: tags IS NULL OR tags = '{}'
    query = query.or('tags.is.null,tags.eq.{}');
  }

  const { data: media, error } = await query;

  if (error) {
    console.error('Query error:', error.message);
    return;
  }

  if (!media || media.length === 0) {
    console.log('No matching media found.');
    return;
  }

  console.log(`Found ${media.length} matching file(s)\n`);

  let updated = 0;
  let skipped = 0;

  for (const file of media) {
    const existing = new Set<string>(file.tags || []);
    const before = existing.size;

    // Add tags
    for (const t of opts.addTags) {
      existing.add(t);
    }

    // Remove tags
    for (const t of opts.removeTags) {
      existing.delete(t);
    }

    const newTags = Array.from(existing);
    const changed = newTags.length !== before ||
      newTags.some(t => !(file.tags || []).includes(t));

    const label = file.title || file.original_filename || file.id.slice(0, 8);

    if (!changed) {
      console.log(`  [SKIP] "${label}" — already has requested tags`);
      skipped++;
      continue;
    }

    const added = opts.addTags.filter(t => !(file.tags || []).includes(t));
    const removed = opts.removeTags.filter(t => (file.tags || []).includes(t));

    if (!opts.execute) {
      console.log(`  [DRY RUN] "${label}"`);
      if (added.length) console.log(`           + ${added.join(', ')}`);
      if (removed.length) console.log(`           - ${removed.join(', ')}`);
      updated++;
      continue;
    }

    const { error: updateErr } = await supabase
      .from('media_files')
      .update({ tags: newTags, updated_at: new Date().toISOString() })
      .eq('id', file.id);

    if (updateErr) {
      console.log(`  [ERROR] "${label}": ${updateErr.message}`);
    } else {
      console.log(`  [TAGGED] "${label}"`);
      if (added.length) console.log(`           + ${added.join(', ')}`);
      if (removed.length) console.log(`           - ${removed.join(', ')}`);
      updated++;
    }
  }

  console.log(`\n=== SUMMARY ===`);
  console.log(`  Updated: ${updated}`);
  console.log(`  Skipped: ${skipped}`);
  console.log(`  Total matched: ${media.length}`);

  if (!opts.execute && updated > 0) {
    console.log(`\nRun with --execute to apply ${updated} tag changes.`);
  }
}

run().catch(console.error);
