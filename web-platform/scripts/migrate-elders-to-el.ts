/**
 * Migrate PICC Elder profiles and their stories to Empathy Ledger v2.
 *
 * The organisation in Empathy Ledger is "Palm Island CC".
 *
 * Usage:
 *   npx tsx scripts/migrate-elders-to-el.ts              # live run
 *   npx tsx scripts/migrate-elders-to-el.ts --dry-run    # preview only
 *
 * Requires .env.local (or .env) with:
 *   NEXT_PUBLIC_SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY,
 *   EMPATHY_LEDGER_API_URL, EMPATHY_LEDGER_INTAKE_KEY
 */

import { config } from 'dotenv';
config({ path: '.env.local' });
config(); // fallback to .env

import { createClient } from '@supabase/supabase-js';
import * as fs from 'fs';
import * as path from 'path';

import {
  EmpathyLedgerClient,
  EmpathyLedgerError,
  ImportMediaItem,
} from '../lib/empathy-ledger/el-api-client';

// ---------------------------------------------------------------------------
// Config
// ---------------------------------------------------------------------------

const DRY_RUN = process.argv.includes('--dry-run');
const MAPPING_FILE = path.join(__dirname, '.elder-migration-map.json');

interface MigrationMap {
  /** PICC profile ID → EL storyteller ID */
  storytellers: Record<string, string>;
  /** PICC story ID → EL story ID */
  stories: Record<string, string>;
  /** PICC media_file ID → EL media_asset ID */
  media: Record<string, string>;
}

function loadMapping(): MigrationMap {
  try {
    const raw = fs.readFileSync(MAPPING_FILE, 'utf-8');
    const parsed = JSON.parse(raw) as MigrationMap;
    // Ensure media key exists for older mapping files
    if (!parsed.media) {
      parsed.media = {};
    }
    return parsed;
  } catch {
    return { storytellers: {}, stories: {}, media: {} };
  }
}

function saveMapping(map: MigrationMap): void {
  fs.writeFileSync(MAPPING_FILE, JSON.stringify(map, null, 2));
}

// ---------------------------------------------------------------------------
// Supabase client (service role)
// ---------------------------------------------------------------------------

function getSupabase() {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const key = process.env.SUPABASE_SERVICE_ROLE_KEY;
  if (!url || !key) {
    throw new Error('Missing NEXT_PUBLIC_SUPABASE_URL or SUPABASE_SERVICE_ROLE_KEY');
  }
  return createClient(url, key, {
    auth: { autoRefreshToken: false, persistSession: false },
  });
}

// ---------------------------------------------------------------------------
// Data fetching
// ---------------------------------------------------------------------------

interface ElderProfile {
  id: string;
  full_name: string;
  preferred_name?: string;
  location?: string;
  language_group?: string;
  traditional_country?: string;
  bio?: string;
  profile_image_url?: string;
}

interface ElderStory {
  id: string;
  title: string;
  content?: string;
  cultural_sensitivity_level?: string;
  access_level?: string;
}

interface ElderQuote {
  id: string;
  quote_text: string;
  context?: string;
}

async function fetchElders(supabase: ReturnType<typeof getSupabase>) {
  const { data, error } = await supabase
    .from('profiles')
    .select('id, full_name, preferred_name, location, language_group, traditional_country, bio, profile_image_url')
    .eq('is_elder', true)
    .eq('show_in_directory', true)
    .order('full_name');

  if (error) throw new Error(`Failed to fetch elders: ${error.message}`);
  return (data ?? []) as ElderProfile[];
}

async function fetchElderStories(
  supabase: ReturnType<typeof getSupabase>,
  profileId: string
) {
  const { data, error } = await supabase
    .from('stories')
    .select('id, title, content, cultural_sensitivity_level, access_level')
    .eq('storyteller_id', profileId)
    .eq('is_public', true);

  if (error) throw new Error(`Failed to fetch stories for ${profileId}: ${error.message}`);
  return (data ?? []) as ElderStory[];
}

async function fetchExtractedQuotes(
  supabase: ReturnType<typeof getSupabase>,
  profileId: string
) {
  const { data, error } = await supabase
    .from('extracted_quotes')
    .select('id, quote_text, context')
    .eq('profile_id', profileId)
    .eq('is_validated', true);

  if (error) throw new Error(`Failed to fetch extracted_quotes for ${profileId}: ${error.message}`);
  return (data ?? []) as ElderQuote[];
}

interface ElderMedia {
  id: string;
  public_url: string;
  file_type: string;
  title?: string;
  description?: string;
  tags?: string[];
  story_id?: string;
  is_public?: boolean;
}

/** Fetch media personally linked to this elder (not shared project media) */
async function fetchElderPersonalMedia(
  supabase: ReturnType<typeof getSupabase>,
  profileId: string
): Promise<ElderMedia[]> {
  const seen = new Set<string>();
  const results: ElderMedia[] = [];

  function addUnique(item: ElderMedia) {
    if (!seen.has(item.id)) {
      seen.add(item.id);
      results.push(item);
    }
  }

  // Media files where storyteller_id matches the profile
  const { data: storytellerMedia } = await supabase
    .from('media_files')
    .select('id, public_url, file_type, title, description, tags, is_public')
    .eq('storyteller_id', profileId)
    .eq('is_public', true)
    .is('deleted_at', null);

  for (const mf of storytellerMedia ?? []) {
    if (mf.id && mf.public_url) {
      addUnique({
        id: mf.id,
        public_url: mf.public_url,
        file_type: mf.file_type || 'image',
        title: mf.title,
        description: mf.description,
        tags: mf.tags,
        is_public: mf.is_public,
      });
    }
  }

  // Media tagged with this elder's profile ID
  const { data: taggedMedia } = await supabase
    .from('media_files')
    .select('id, public_url, file_type, title, description, tags, is_public')
    .contains('tags', [profileId])
    .eq('is_public', true)
    .is('deleted_at', null);

  for (const mf of taggedMedia ?? []) {
    if (mf.id && mf.public_url) {
      addUnique({
        id: mf.id,
        public_url: mf.public_url,
        file_type: mf.file_type || 'image',
        title: mf.title,
        description: mf.description,
        tags: mf.tags,
        is_public: mf.is_public,
      });
    }
  }

  return results;
}

/** Fetch shared project media (elders-trips photos/videos) — called once, not per-elder */
async function fetchSharedProjectMedia(
  supabase: ReturnType<typeof getSupabase>
): Promise<ElderMedia[]> {
  const { data } = await supabase
    .from('media_files')
    .select('id, public_url, file_type, title, description, tags, is_public')
    .contains('tags', ['project:elders-trips'])
    .eq('is_public', true)
    .is('deleted_at', null)
    .order('created_at', { ascending: false })
    .limit(500);

  return (data ?? [])
    .filter((mf: any) => mf.id && mf.public_url)
    .map((mf: any) => ({
      id: mf.id,
      public_url: mf.public_url,
      file_type: mf.file_type || 'image',
      title: mf.title,
      description: mf.description,
      tags: mf.tags,
      is_public: mf.is_public,
    }));
}

async function fetchElderQuotes(
  supabase: ReturnType<typeof getSupabase>,
  elderName: string
) {
  // elder_quotes uses `text` column and `speaker_name` (not profile_id)
  const { data, error } = await supabase
    .from('elder_quotes')
    .select('id, text, speaker_name')
    .eq('is_validated', true)
    .eq('permission_level', 'public')
    .ilike('speaker_name', `%${elderName}%`);

  if (error) throw new Error(`Failed to fetch elder_quotes for ${elderName}: ${error.message}`);
  return (data ?? []).map((q: any) => ({
    id: q.id,
    quote_text: q.text,
    context: null,
  })) as ElderQuote[];
}

// ---------------------------------------------------------------------------
// Migration logic
// ---------------------------------------------------------------------------

async function migrateElder(
  el: EmpathyLedgerClient,
  supabase: ReturnType<typeof getSupabase>,
  elder: ElderProfile,
  map: MigrationMap
): Promise<{ storiesCreated: number; skippedStories: number; mediaCreated: number }> {
  let storytellerId = map.storytellers[elder.id];
  let storiesCreated = 0;
  let skippedStories = 0;

  // 1. Create storyteller (or skip if already mapped)
  if (!storytellerId) {
    const culturalBackground = [elder.language_group, elder.traditional_country]
      .filter(Boolean)
      .join(' — ') || undefined;

    const res = await el.createStoryteller({
      profile_id: elder.id,
      display_name: elder.preferred_name || elder.full_name,
      location: elder.location ?? undefined,
      cultural_background: culturalBackground,
      bio: elder.bio ?? undefined,
      public_avatar_url: elder.profile_image_url ?? undefined,
    });

    storytellerId = res.storyteller.id;
    map.storytellers[elder.id] = storytellerId;
    console.log(`  ✓ Created storyteller ${storytellerId} for "${elder.full_name}"`);
  } else {
    console.log(`  → Storyteller already exists (${storytellerId}), skipping creation`);
  }

  // 2. Fetch stories + quotes
  const [stories, extractedQuotes, elderQuotes] = await Promise.all([
    fetchElderStories(supabase, elder.id),
    fetchExtractedQuotes(supabase, elder.id),
    fetchElderQuotes(supabase, elder.full_name),
  ]);

  // 3. Migrate stories
  for (const story of stories) {
    if (map.stories[story.id]) {
      skippedStories++;
      continue;
    }

    const storyRes = await el.createStory({
      storyteller_id: storytellerId,
      title: story.title,
      content: story.content ?? undefined,
      cultural_sensitivity_level: story.cultural_sensitivity_level ?? 'standard',
      has_explicit_consent: true,
      privacy_level: story.access_level ?? 'public',
    });

    map.stories[story.id] = storyRes.story.id;
    storiesCreated++;
  }

  // 4. Migrate quotes as micro-stories
  const allQuotes = [
    ...extractedQuotes.map((q) => ({ ...q, source: 'extracted' as const })),
    ...elderQuotes.map((q) => ({ ...q, source: 'elder' as const })),
  ];

  for (const quote of allQuotes) {
    const quoteKey = `quote:${quote.source}:${quote.id}`;
    if (map.stories[quoteKey]) {
      skippedStories++;
      continue;
    }

    const title = quote.quote_text.length > 60
      ? quote.quote_text.slice(0, 57) + '...'
      : quote.quote_text;

    const storyRes = await el.createStory({
      storyteller_id: storytellerId,
      title,
      content: quote.context
        ? `"${quote.quote_text}"\n\nContext: ${quote.context}`
        : `"${quote.quote_text}"`,
      cultural_sensitivity_level: 'standard',
      has_explicit_consent: true,
      privacy_level: 'public',
    });

    map.stories[quoteKey] = storyRes.story.id;
    storiesCreated++;
  }

  // 5. Migrate personal media (shared project media is handled separately in main())
  const elderMedia = await fetchElderPersonalMedia(supabase, elder.id);
  let mediaCreated = 0;

  // Filter to only unmapped media
  const unmappedMedia = elderMedia.filter((m) => !map.media[m.id]);

  // Batch in groups of 50
  const MEDIA_BATCH_SIZE = 50;
  for (let i = 0; i < unmappedMedia.length; i += MEDIA_BATCH_SIZE) {
    const batch = unmappedMedia.slice(i, i + MEDIA_BATCH_SIZE);

    const items: ImportMediaItem[] = batch.map((m) => ({
      external_id: m.id,
      source_url: m.public_url,
      file_type: m.file_type,
      title: m.title,
      description: m.description,
      storyteller_id: storytellerId,
      story_id: m.story_id ? map.stories[m.story_id] : undefined,
      tags: m.tags,
      cultural_sensitivity_level: 'standard',
      consent_status: m.is_public ? 'granted' : 'pending',
      metadata: { picc_media_file_id: m.id },
    }));

    try {
      const res = await el.importMedia({
        items,
        source_platform: 'picc-web-platform',
      });

      // Save mappings
      for (let j = 0; j < batch.length; j++) {
        if (res.media_ids[j]) {
          map.media[batch[j].id] = res.media_ids[j];
          mediaCreated++;
        }
      }

      if (res.errors.length > 0) {
        console.warn(`    ⚠ Media import batch errors:`, res.errors.slice(0, 3).join('; '));
      }
    } catch (err) {
      console.warn(`    ⚠ Failed to import media batch:`, err instanceof Error ? err.message : err);
    }
  }

  if (mediaCreated > 0 || unmappedMedia.length > 0) {
    console.log(`  → ${mediaCreated} media imported, ${elderMedia.length - unmappedMedia.length} skipped (already migrated)`);
  }

  return { storiesCreated, skippedStories, mediaCreated };
}

// ---------------------------------------------------------------------------
// Main
// ---------------------------------------------------------------------------

async function main() {
  console.log(`\n${'='.repeat(60)}`);
  console.log(`  PICC → Empathy Ledger Elder Migration`);
  console.log(`  Mode: ${DRY_RUN ? 'DRY RUN (no changes)' : 'LIVE'}`);
  console.log(`${'='.repeat(60)}\n`);

  const supabase = getSupabase();
  const map = loadMapping();

  console.log(`Loaded mapping: ${Object.keys(map.storytellers).length} storytellers, ${Object.keys(map.stories).length} stories, ${Object.keys(map.media).length} media already migrated.\n`);

  // Fetch all eligible elders
  const elders = await fetchElders(supabase);
  console.log(`Found ${elders.length} eligible elder(s) in PICC.\n`);

  if (elders.length === 0) {
    console.log('Nothing to migrate.');
    return;
  }

  // Fetch shared project media (once, not per-elder)
  const sharedMedia = await fetchSharedProjectMedia(supabase);
  const unmappedShared = sharedMedia.filter((m) => !map.media[m.id]);
  console.log(`Shared project media: ${sharedMedia.length} total, ${unmappedShared.length} new\n`);

  // Dry-run: report what would be migrated
  if (DRY_RUN) {
    for (const elder of elders) {
      const alreadyMapped = !!map.storytellers[elder.id];
      const [stories, extractedQuotes, elderQuotes, personalMedia] = await Promise.all([
        fetchElderStories(supabase, elder.id),
        fetchExtractedQuotes(supabase, elder.id),
        fetchElderQuotes(supabase, elder.full_name),
        fetchElderPersonalMedia(supabase, elder.id),
      ]);

      const unmappedStories = stories.filter((s) => !map.stories[s.id]);
      const unmappedExtracted = extractedQuotes.filter((q) => !map.stories[`quote:extracted:${q.id}`]);
      const unmappedElder = elderQuotes.filter((q) => !map.stories[`quote:elder:${q.id}`]);
      const unmappedPersonalMedia = personalMedia.filter((m) => !map.media[m.id]);

      console.log(`${alreadyMapped ? '→' : '+'} ${elder.full_name} (${elder.id})`);
      console.log(`    Stories: ${stories.length} total, ${unmappedStories.length} new`);
      console.log(`    Extracted quotes: ${extractedQuotes.length} total, ${unmappedExtracted.length} new`);
      console.log(`    Elder quotes: ${elderQuotes.length} total, ${unmappedElder.length} new`);
      console.log(`    Personal media: ${personalMedia.length} total, ${unmappedPersonalMedia.length} new`);
      console.log();
    }
    console.log('Dry run complete. No changes made.');
    return;
  }

  // Live run
  const el = new EmpathyLedgerClient();
  let totalStorytellers = 0;
  let totalStories = 0;
  let totalMedia = 0;
  let totalSkipped = 0;
  let totalErrors = 0;

  // Step 1: Import shared project media (once for all elders)
  if (unmappedShared.length > 0) {
    console.log(`\nImporting ${unmappedShared.length} shared project media...`);
    const MEDIA_BATCH_SIZE = 50;
    for (let i = 0; i < unmappedShared.length; i += MEDIA_BATCH_SIZE) {
      const batch = unmappedShared.slice(i, i + MEDIA_BATCH_SIZE);
      const items: ImportMediaItem[] = batch.map((m) => ({
        external_id: m.id,
        source_url: m.public_url,
        file_type: m.file_type,
        title: m.title,
        description: m.description,
        tags: m.tags,
        cultural_sensitivity_level: 'standard',
        consent_status: m.is_public ? 'granted' : 'pending',
        metadata: { picc_media_file_id: m.id, shared_project: 'elders-trips' },
      }));

      try {
        const res = await el.importMedia({ items, source_platform: 'picc-web-platform' });
        for (let j = 0; j < batch.length; j++) {
          if (res.media_ids[j]) {
            map.media[batch[j].id] = res.media_ids[j];
            totalMedia++;
          }
        }
        if (res.errors.length > 0) {
          console.warn(`  ⚠ Shared media batch errors:`, res.errors.slice(0, 3).join('; '));
        }
      } catch (err) {
        console.warn(`  ⚠ Failed to import shared media batch:`, err instanceof Error ? err.message : err);
      }
    }
    saveMapping(map);
    console.log(`  → ${totalMedia} shared media imported\n`);
  }

  // Step 2: Migrate each elder (profile + stories + quotes + personal media)
  for (const elder of elders) {
    console.log(`\nMigrating: ${elder.full_name} (${elder.id})`);

    try {
      const wasNew = !map.storytellers[elder.id];
      const { storiesCreated, skippedStories, mediaCreated } = await migrateElder(el, supabase, elder, map);

      if (wasNew) totalStorytellers++;
      totalStories += storiesCreated;
      totalMedia += mediaCreated;
      totalSkipped += skippedStories;

      console.log(`  → ${storiesCreated} stories/quotes created, ${mediaCreated} personal media, ${skippedStories} skipped`);

      // Save mapping after each elder so partial progress is preserved
      saveMapping(map);
    } catch (err) {
      totalErrors++;
      if (err instanceof EmpathyLedgerError) {
        console.error(`  ✗ EL API error (${err.status}): ${err.message}`);
        if (err.body) console.error(`    Body:`, JSON.stringify(err.body).slice(0, 200));
      } else {
        console.error(`  ✗ Error: ${err instanceof Error ? err.message : err}`);
      }
    }
  }

  // Final summary
  console.log(`\n${'='.repeat(60)}`);
  console.log('  Migration Summary');
  console.log(`${'='.repeat(60)}`);
  console.log(`  Elders processed:      ${elders.length}`);
  console.log(`  Storytellers created:   ${totalStorytellers}`);
  console.log(`  Stories/quotes created: ${totalStories}`);
  console.log(`  Media imported:         ${totalMedia} (${unmappedShared.length} shared + personal)`);
  console.log(`  Skipped (idempotent):   ${totalSkipped}`);
  console.log(`  Errors:                 ${totalErrors}`);
  console.log(`  Mapping file:           ${MAPPING_FILE}`);
  console.log(`${'='.repeat(60)}\n`);
}

main().catch((err) => {
  console.error('\nFatal error:', err);
  process.exit(1);
});
