#!/usr/bin/env npx tsx
/**
 * Database Enrichment Script
 *
 * Uses the existing AI framework to:
 * 1. Backup current data
 * 2. Catalog media from storage → story_media table
 * 3. Analyze images with vision AI → alt text, people detection, cultural analysis
 * 4. Generate story embeddings → story_embeddings table
 * 5. Extract themes and quotes → themes, story_themes, story_quotes tables
 *
 * Run with: npx tsx scripts/enrich-database.ts
 *
 * Options:
 *   --dry-run       Preview changes without writing to database
 *   --phase=N       Run specific phase (1-5)
 *   --skip-backup   Skip the backup phase
 *   --limit=N       Limit items processed per phase
 */

import { createClient } from '@supabase/supabase-js';
import * as fs from 'fs';
import * as path from 'path';

// Import AI modules
import { analyzeImage, analyzeCulturalContent } from '../lib/ai/vision';
import { generateEmbedding } from '../lib/ai/embeddings';
import { summarizeContent, extractMetadata } from '../lib/ai/summarization';

// Configuration
const CONFIG = {
  supabaseUrl: process.env.NEXT_PUBLIC_SUPABASE_URL!,
  supabaseKey: process.env.SUPABASE_SERVICE_ROLE_KEY!,
  batchSize: 5,
  delayBetweenBatches: 1000, // ms
  backupDir: './scripts/backups',
};

// Parse CLI args
const args = process.argv.slice(2);
const DRY_RUN = args.includes('--dry-run');
const SKIP_BACKUP = args.includes('--skip-backup');
const PHASE = args.find(a => a.startsWith('--phase='))?.split('=')[1];
const LIMIT = parseInt(args.find(a => a.startsWith('--limit='))?.split('=')[1] || '0') || Infinity;

// Initialize Supabase client
const supabase = createClient(CONFIG.supabaseUrl, CONFIG.supabaseKey);

// Logging utilities
const log = {
  info: (msg: string) => console.log(`ℹ️  ${msg}`),
  success: (msg: string) => console.log(`✅ ${msg}`),
  warning: (msg: string) => console.log(`⚠️  ${msg}`),
  error: (msg: string) => console.log(`❌ ${msg}`),
  progress: (current: number, total: number, msg: string) =>
    console.log(`📊 [${current}/${total}] ${msg}`),
  section: (title: string) => {
    console.log('\n' + '═'.repeat(60));
    console.log(`  ${title}`);
    console.log('═'.repeat(60) + '\n');
  }
};

// Stats tracking
const stats = {
  phase1: { backups: 0 },
  phase2: { mediaFound: 0, mediaCreated: 0, errors: 0 },
  phase3: { imagesAnalyzed: 0, errors: 0 },
  phase4: { embeddingsCreated: 0, errors: 0 },
  phase5: { themesCreated: 0, quotesExtracted: 0, errors: 0 },
};

/**
 * Phase 1: Backup existing data
 */
async function phase1Backup(): Promise<void> {
  log.section('PHASE 1: Backup Existing Data');

  if (SKIP_BACKUP) {
    log.warning('Skipping backup (--skip-backup flag)');
    return;
  }

  const timestamp = new Date().toISOString().replace(/[:.]/g, '-');
  const backupDir = path.join(CONFIG.backupDir, timestamp);

  if (!DRY_RUN) {
    fs.mkdirSync(backupDir, { recursive: true });
  }

  const tables = [
    'profiles',
    'stories',
    'story_media',
    'story_quotes',
    'story_themes',
    'story_embeddings',
    'themes',
    'organizations',
  ];

  for (const table of tables) {
    log.info(`Backing up ${table}...`);
    const { data, error } = await supabase.from(table).select('*');

    if (error) {
      log.error(`Failed to backup ${table}: ${error.message}`);
      continue;
    }

    if (!DRY_RUN) {
      const filePath = path.join(backupDir, `${table}.json`);
      fs.writeFileSync(filePath, JSON.stringify(data, null, 2));
    }

    log.success(`Backed up ${table}: ${data?.length || 0} rows`);
    stats.phase1.backups++;
  }

  log.success(`Backup complete: ${backupDir}`);
}

/**
 * Phase 2: Catalog media from storage to database
 */
async function phase2CatalogMedia(): Promise<void> {
  log.section('PHASE 2: Catalog Media from Storage');

  const buckets = ['profile-images', 'story-images', 'story-media'];

  for (const bucket of buckets) {
    log.info(`Scanning bucket: ${bucket}`);

    // List all files in bucket
    const { data: files, error } = await supabase.storage
      .from(bucket)
      .list('', { limit: 1000 });

    if (error) {
      log.error(`Failed to list ${bucket}: ${error.message}`);
      continue;
    }

    // Also check subfolders for story-media
    let allFiles: Array<{ name: string; path: string; bucket: string; metadata?: any }> = [];

    for (const file of files || []) {
      if (file.id) {
        // It's a file
        allFiles.push({
          name: file.name,
          path: file.name,
          bucket,
          metadata: file.metadata
        });
      } else {
        // It's a folder, list contents
        const { data: subFiles } = await supabase.storage
          .from(bucket)
          .list(file.name, { limit: 500 });

        for (const subFile of subFiles || []) {
          if (subFile.id) {
            allFiles.push({
              name: subFile.name,
              path: `${file.name}/${subFile.name}`,
              bucket,
              metadata: subFile.metadata
            });
          } else {
            // Nested folder (e.g., annual-reports/2009-10/)
            const { data: nestedFiles } = await supabase.storage
              .from(bucket)
              .list(`${file.name}/${subFile.name}`, { limit: 500 });

            for (const nested of nestedFiles || []) {
              if (nested.id) {
                allFiles.push({
                  name: nested.name,
                  path: `${file.name}/${subFile.name}/${nested.name}`,
                  bucket,
                  metadata: nested.metadata
                });
              }
            }
          }
        }
      }
    }

    stats.phase2.mediaFound += allFiles.length;
    log.info(`Found ${allFiles.length} files in ${bucket}`);

    // Check which files already exist in story_media
    const { data: existingMedia } = await supabase
      .from('story_media')
      .select('file_path, supabase_bucket');

    const existingPaths = new Set(
      (existingMedia || []).map(m => `${m.supabase_bucket}:${m.file_path}`)
    );

    // Filter to new files only
    const newFiles = allFiles.filter(f =>
      !existingPaths.has(`${f.bucket}:${f.path}`) &&
      /\.(jpg|jpeg|png|gif|webp|mp4|mov)$/i.test(f.name)
    );

    log.info(`${newFiles.length} new media files to catalog`);

    // Insert new media records
    let processed = 0;
    for (const file of newFiles.slice(0, LIMIT)) {
      const mediaType = /\.(mp4|mov)$/i.test(file.name) ? 'video' : 'image';

      const record = {
        file_name: file.name,
        file_path: file.path,
        supabase_bucket: file.bucket,
        media_type: mediaType,
        file_size: file.metadata?.size || null,
        // story_id will be linked later if we can match
        metadata: {
          source: 'storage-scan',
          scanned_at: new Date().toISOString(),
          original_metadata: file.metadata
        }
      };

      if (!DRY_RUN) {
        const { error: insertError } = await supabase
          .from('story_media')
          .insert(record);

        if (insertError) {
          log.error(`Failed to insert ${file.path}: ${insertError.message}`);
          stats.phase2.errors++;
          continue;
        }
      }

      stats.phase2.mediaCreated++;
      processed++;
      log.progress(processed, Math.min(newFiles.length, LIMIT), `Cataloged: ${file.name}`);
    }
  }

  log.success(`Phase 2 complete: ${stats.phase2.mediaCreated} media records created`);
}

/**
 * Phase 3: Analyze images with Vision AI
 */
async function phase3AnalyzeImages(): Promise<void> {
  log.section('PHASE 3: Analyze Images with Vision AI');

  // Get all story_media without ml_analysis
  const { data: unanalyzedMedia, error } = await supabase
    .from('story_media')
    .select('id, file_path, supabase_bucket, media_type')
    .is('ml_analysis', null)
    .eq('media_type', 'image')
    .limit(LIMIT);

  if (error) {
    log.error(`Failed to fetch media: ${error.message}`);
    return;
  }

  log.info(`Found ${unanalyzedMedia?.length || 0} images to analyze`);

  const batches = [];
  for (let i = 0; i < (unanalyzedMedia?.length || 0); i += CONFIG.batchSize) {
    batches.push(unanalyzedMedia!.slice(i, i + CONFIG.batchSize));
  }

  let processed = 0;
  for (const batch of batches) {
    await Promise.all(batch.map(async (media) => {
      try {
        // Get public URL
        const { data: urlData } = supabase.storage
          .from(media.supabase_bucket)
          .getPublicUrl(media.file_path);

        const imageUrl = urlData.publicUrl;

        log.info(`Analyzing: ${media.file_path}`);

        // Run vision analysis
        const [imageAnalysis, culturalAnalysis] = await Promise.all([
          analyzeImage(imageUrl, {
            generateAltText: true,
            detectCulturalContent: true,
            detailed: true
          }),
          analyzeCulturalContent(imageUrl)
        ]);

        // Prepare update
        // Note: people_in_media expects UUIDs (profile IDs), so we store descriptions in ml_analysis
        const update = {
          alt_text: imageAnalysis.altText,
          caption: imageAnalysis.description,
          ml_analysis: {
            ...imageAnalysis,
            cultural: culturalAnalysis,
            analyzed_at: new Date().toISOString(),
            people_detected: imageAnalysis.people // Store people descriptions here
          },
          // people_in_media will be populated later when we match to actual profiles
          metadata: {
            tags: imageAnalysis.tags,
            colors: imageAnalysis.colors,
            mood: imageAnalysis.mood,
            sensitivity_level: culturalAnalysis.sensitivityLevel,
            people_count: imageAnalysis.people.count
          }
        };

        if (!DRY_RUN) {
          const { error: updateError } = await supabase
            .from('story_media')
            .update(update)
            .eq('id', media.id);

          if (updateError) {
            throw updateError;
          }
        }

        stats.phase3.imagesAnalyzed++;
        processed++;
        log.progress(processed, unanalyzedMedia!.length, `Analyzed: ${media.file_path}`);

      } catch (err: any) {
        log.error(`Failed to analyze ${media.file_path}: ${err.message}`);
        stats.phase3.errors++;
      }
    }));

    // Delay between batches
    await new Promise(resolve => setTimeout(resolve, CONFIG.delayBetweenBatches));
  }

  log.success(`Phase 3 complete: ${stats.phase3.imagesAnalyzed} images analyzed`);
}

/**
 * Phase 4: Generate story embeddings
 */
async function phase4GenerateEmbeddings(): Promise<void> {
  log.section('PHASE 4: Generate Story Embeddings');

  // Get stories without embeddings
  const { data: stories, error } = await supabase
    .from('stories')
    .select('id, title, content')
    .limit(LIMIT);

  if (error) {
    log.error(`Failed to fetch stories: ${error.message}`);
    return;
  }

  // Check which already have embeddings
  const { data: existingEmbeddings } = await supabase
    .from('story_embeddings')
    .select('story_id');

  const existingIds = new Set((existingEmbeddings || []).map(e => e.story_id));
  const storiesNeedingEmbeddings = (stories || []).filter(s => !existingIds.has(s.id));

  log.info(`Found ${storiesNeedingEmbeddings.length} stories needing embeddings`);

  let processed = 0;
  for (const story of storiesNeedingEmbeddings) {
    try {
      const text = `${story.title}. ${story.content}`;
      const { embedding, tokens } = await generateEmbedding(text);

      const record = {
        story_id: story.id,
        embedding: JSON.stringify(embedding),
        model_version: 'text-embedding-3-small',
        token_count: tokens
      };

      if (!DRY_RUN) {
        const { error: insertError } = await supabase
          .from('story_embeddings')
          .upsert(record, { onConflict: 'story_id' });

        if (insertError) {
          throw insertError;
        }
      }

      stats.phase4.embeddingsCreated++;
      processed++;
      log.progress(processed, storiesNeedingEmbeddings.length, `Embedded: ${story.title.substring(0, 40)}...`);

      // Small delay to respect rate limits
      await new Promise(resolve => setTimeout(resolve, 200));

    } catch (err: any) {
      log.error(`Failed to embed ${story.id}: ${err.message}`);
      stats.phase4.errors++;
    }
  }

  log.success(`Phase 4 complete: ${stats.phase4.embeddingsCreated} embeddings created`);
}

/**
 * Phase 5: Extract themes and quotes
 */
async function phase5ExtractThemesAndQuotes(): Promise<void> {
  log.section('PHASE 5: Extract Themes and Quotes');

  // First, ensure we have base themes
  await ensureBaseThemes();

  // Get stories
  const { data: stories, error } = await supabase
    .from('stories')
    .select('id, title, content, category')
    .limit(LIMIT);

  if (error) {
    log.error(`Failed to fetch stories: ${error.message}`);
    return;
  }

  // Get existing story_themes to avoid duplicates
  const { data: existingThemes } = await supabase
    .from('story_themes')
    .select('story_id');

  const storiesWithThemes = new Set((existingThemes || []).map(t => t.story_id));
  const storiesNeedingAnalysis = (stories || []).filter(s => !storiesWithThemes.has(s.id));

  log.info(`Found ${storiesNeedingAnalysis.length} stories needing theme/quote extraction`);

  // Get theme lookup
  const { data: themes } = await supabase.from('themes').select('id, name');
  const themeLookup = new Map((themes || []).map(t => [t.name.toLowerCase(), t.id]));

  let processed = 0;
  for (const story of storiesNeedingAnalysis) {
    try {
      // Extract metadata using summarization
      const metadata = await extractMetadata(story.content, story.title);

      // Link themes
      for (const themeName of metadata.themes) {
        const themeId = themeLookup.get(themeName.toLowerCase());
        if (themeId && !DRY_RUN) {
          await supabase.from('story_themes').upsert({
            story_id: story.id,
            theme_id: themeId,
            confidence: 0.8,
            extracted_by: 'ai-enrichment'
          }, { onConflict: 'story_id,theme_id' });
        }
      }

      // Also link category as theme
      const categoryThemeId = themeLookup.get(story.category?.toLowerCase());
      if (categoryThemeId && !DRY_RUN) {
        await supabase.from('story_themes').upsert({
          story_id: story.id,
          theme_id: categoryThemeId,
          confidence: 1.0,
          extracted_by: 'category-match'
        }, { onConflict: 'story_id,theme_id' });
      }

      // Extract quotes (look for quoted text in content)
      const quoteMatches = story.content.match(/"([^"]{20,200})"/g) || [];
      for (const quote of quoteMatches.slice(0, 3)) {
        const cleanQuote = quote.replace(/"/g, '');
        if (!DRY_RUN) {
          await supabase.from('story_quotes').insert({
            story_id: story.id,
            quote_text: cleanQuote,
            extracted_by: 'ai-enrichment',
            is_featured: quoteMatches.indexOf(quote) === 0
          });
        }
        stats.phase5.quotesExtracted++;
      }

      stats.phase5.themesCreated += metadata.themes.length;
      processed++;
      log.progress(processed, storiesNeedingAnalysis.length, `Processed: ${story.title.substring(0, 40)}...`);

      await new Promise(resolve => setTimeout(resolve, 500));

    } catch (err: any) {
      log.error(`Failed to process ${story.id}: ${err.message}`);
      stats.phase5.errors++;
    }
  }

  log.success(`Phase 5 complete: ${stats.phase5.themesCreated} theme links, ${stats.phase5.quotesExtracted} quotes`);
}

/**
 * Ensure base themes exist
 */
async function ensureBaseThemes(): Promise<void> {
  const baseThemes = [
    { name: 'Health', description: 'Health and wellbeing stories', color: '#10B981' },
    { name: 'Culture', description: 'Cultural heritage and traditions', color: '#8B5CF6' },
    { name: 'Community', description: 'Community life and events', color: '#3B82F6' },
    { name: 'Elders', description: 'Elder wisdom and stories', color: '#F59E0B' },
    { name: 'Youth', description: 'Youth programs and achievements', color: '#EC4899' },
    { name: 'Education', description: 'Learning and education', color: '#06B6D4' },
    { name: 'Family', description: 'Family and kinship', color: '#EF4444' },
    { name: 'Economic Development', description: 'Economic and employment', color: '#84CC16' },
    { name: 'Environment', description: 'Land and sea country', color: '#22C55E' },
    { name: 'Sports', description: 'Sports and recreation', color: '#F97316' },
    { name: 'Arts', description: 'Arts and creative expression', color: '#A855F7' },
    { name: 'History', description: 'Historical events and memories', color: '#6B7280' },
  ];

  log.info('Ensuring base themes exist...');

  for (const theme of baseThemes) {
    if (!DRY_RUN) {
      await supabase.from('themes').upsert(theme, {
        onConflict: 'name',
        ignoreDuplicates: true
      });
    }
  }

  log.success(`Base themes ready`);
}

/**
 * Print final summary
 */
function printSummary(): void {
  log.section('ENRICHMENT SUMMARY');

  if (DRY_RUN) {
    log.warning('DRY RUN - No changes were made to the database');
  }

  console.log(`
Phase 1 - Backup:
  • Tables backed up: ${stats.phase1.backups}

Phase 2 - Media Cataloging:
  • Media found in storage: ${stats.phase2.mediaFound}
  • New records created: ${stats.phase2.mediaCreated}
  • Errors: ${stats.phase2.errors}

Phase 3 - Image Analysis:
  • Images analyzed: ${stats.phase3.imagesAnalyzed}
  • Errors: ${stats.phase3.errors}

Phase 4 - Embeddings:
  • Embeddings created: ${stats.phase4.embeddingsCreated}
  • Errors: ${stats.phase4.errors}

Phase 5 - Themes & Quotes:
  • Theme links created: ${stats.phase5.themesCreated}
  • Quotes extracted: ${stats.phase5.quotesExtracted}
  • Errors: ${stats.phase5.errors}
`);
}

/**
 * Main execution
 */
async function main(): Promise<void> {
  console.log('\n🚀 Palm Island Database Enrichment Script\n');

  if (DRY_RUN) {
    log.warning('Running in DRY RUN mode - no changes will be made\n');
  }

  if (!CONFIG.supabaseUrl || !CONFIG.supabaseKey) {
    log.error('Missing NEXT_PUBLIC_SUPABASE_URL or SUPABASE_SERVICE_ROLE_KEY');
    process.exit(1);
  }

  try {
    const phases = PHASE ? [parseInt(PHASE)] : [1, 2, 3, 4, 5];

    for (const phase of phases) {
      switch (phase) {
        case 1:
          await phase1Backup();
          break;
        case 2:
          await phase2CatalogMedia();
          break;
        case 3:
          await phase3AnalyzeImages();
          break;
        case 4:
          await phase4GenerateEmbeddings();
          break;
        case 5:
          await phase5ExtractThemesAndQuotes();
          break;
      }
    }

    printSummary();
    log.success('Enrichment complete!');

  } catch (err: any) {
    log.error(`Fatal error: ${err.message}`);
    console.error(err);
    process.exit(1);
  }
}

main();
