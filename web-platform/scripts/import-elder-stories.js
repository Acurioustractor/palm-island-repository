#!/usr/bin/env node

/**
 * Elder Stories Import Script
 *
 * This script imports elder stories from a JSON file into Supabase.
 *
 * Usage:
 *   node scripts/import-elder-stories.js [path-to-json-file]
 *
 * Default file: scripts/elder-stories-data.json
 *
 * See ELDER-STORIES-IMPORT-TEMPLATE.md for JSON format examples.
 */

require('dotenv').config({ path: '.env.local' });
const { createClient } = require('@supabase/supabase-js');
const fs = require('fs');
const path = require('path');

// ANSI colors
const colors = {
  reset: '\x1b[0m',
  bright: '\x1b[1m',
  green: '\x1b[32m',
  red: '\x1b[31m',
  yellow: '\x1b[33m',
  cyan: '\x1b[36m',
};

function log(message, color = 'reset') {
  console.log(`${colors[color]}${message}${colors.reset}`);
}

function section(title) {
  console.log('\n' + '='.repeat(60));
  log(title, 'bright');
  console.log('='.repeat(60));
}

async function importElderStories() {
  section('📖 ELDER STORIES IMPORT');

  // Check environment
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

  if (!supabaseUrl || !supabaseKey) {
    log('\n❌ ERROR: Missing Supabase credentials!', 'red');
    log('\nCreate .env.local with your Supabase credentials.', 'yellow');
    process.exit(1);
  }

  const supabase = createClient(supabaseUrl, supabaseKey);

  // Get JSON file path
  const jsonFilePath = process.argv[2] || path.join(__dirname, 'elder-stories-data.json');

  if (!fs.existsSync(jsonFilePath)) {
    log(`\n❌ ERROR: File not found: ${jsonFilePath}`, 'red');
    log('\nCreate a JSON file with your elder stories.', 'yellow');
    log('See ELDER-STORIES-IMPORT-TEMPLATE.md for format.', 'yellow');
    log('\nExample:', 'cyan');
    log('  node scripts/import-elder-stories.js path/to/your/stories.json', 'cyan');
    process.exit(1);
  }

  // Read and parse JSON
  let storiesData;
  try {
    const fileContent = fs.readFileSync(jsonFilePath, 'utf8');
    storiesData = JSON.parse(fileContent);
  } catch (error) {
    log(`\n❌ ERROR: Failed to parse JSON: ${error.message}`, 'red');
    process.exit(1);
  }

  if (!Array.isArray(storiesData)) {
    log('\n❌ ERROR: JSON file must contain an array of stories', 'red');
    process.exit(1);
  }

  log(`\n✓ Found ${storiesData.length} stories to import`, 'green');

  // Get organization ID (PICC)
  const { data: orgs, error: orgError } = await supabase
    .from('organizations')
    .select('id, organization_name')
    .eq('organization_name', 'Palm Island Community Company')
    .single();

  let organizationId = orgs?.id;

  if (!organizationId) {
    log('\n⚠️  PICC organization not found, creating...', 'yellow');
    const { data: newOrg, error: createOrgError } = await supabase
      .from('organizations')
      .insert([{
        organization_name: 'Palm Island Community Company',
        description: 'Palm Island Community Company',
        location: 'Palm Island'
      }])
      .select()
      .single();

    if (createOrgError) {
      log(`\n❌ Failed to create organization: ${createOrgError.message}`, 'red');
      process.exit(1);
    }

    organizationId = newOrg.id;
    log('✓ Created PICC organization', 'green');
  }

  section('👥 PROCESSING STORYTELLERS');

  const storytellerMap = new Map();

  // Process each story to ensure storytellers exist
  for (const storyData of storiesData) {
    if (!storyData.storyteller_name) {
      log(`\n⚠️  Story "${storyData.title}" has no storyteller_name, skipping storyteller creation`, 'yellow');
      continue;
    }

    if (storytellerMap.has(storyData.storyteller_name)) {
      continue; // Already processed
    }

    // Check if storyteller exists
    const email = storyData.storyteller_email || `${storyData.storyteller_name.toLowerCase().replace(/\s+/g, '.')}@picc.com.au`;

    const { data: existingProfile } = await supabase
      .from('profiles')
      .select('id, full_name')
      .eq('email', email)
      .single();

    if (existingProfile) {
      log(`✓ Found existing storyteller: ${existingProfile.full_name}`, 'green');
      storytellerMap.set(storyData.storyteller_name, existingProfile.id);
    } else {
      // Create new profile
      log(`\n📝 Creating storyteller: ${storyData.storyteller_name}`, 'cyan');

      const { data: newProfile, error: profileError } = await supabase
        .from('profiles')
        .insert([{
          full_name: storyData.storyteller_name,
          preferred_name: storyData.storyteller_name,
          email: email,
          storyteller_type: 'elder',
          is_elder: true,
          location: storyData.location || 'Palm Island',
          organization_id: organizationId,
          bio: storyData.storyteller_bio || `Elder storyteller from ${storyData.location || 'Palm Island'}`
        }])
        .select()
        .single();

      if (profileError) {
        log(`❌ Failed to create storyteller: ${profileError.message}`, 'red');
        log(`   Using anonymous storyteller instead`, 'yellow');
        storytellerMap.set(storyData.storyteller_name, null);
      } else {
        log(`✓ Created storyteller: ${newProfile.full_name}`, 'green');
        storytellerMap.set(storyData.storyteller_name, newProfile.id);
      }
    }
  }

  section('📚 IMPORTING STORIES');

  let successCount = 0;
  let failCount = 0;

  for (const storyData of storiesData) {
    const storytellerId = storytellerMap.get(storyData.storyteller_name);

    log(`\n📖 Importing: ${storyData.title}`, 'cyan');

    const storyRecord = {
      title: storyData.title,
      content: storyData.content,
      summary: storyData.summary || storyData.content.substring(0, 200),
      story_category: storyData.story_category || 'elder_care',
      emotional_theme: storyData.emotional_theme,
      cultural_sensitivity_level: storyData.cultural_sensitivity_level || 'medium',
      elder_approval_given: storyData.elder_approval_given !== false, // default true
      access_level: storyData.access_level || 'public',
      story_date: storyData.story_date,
      location: storyData.location || 'Palm Island',
      is_public: storyData.access_level !== 'restricted',
      organization_id: organizationId,
      storyteller_id: storytellerId,
      traditional_knowledge: storyData.traditional_knowledge || false,
      language_used: storyData.language_used,
    };

    const { data: newStory, error: storyError } = await supabase
      .from('stories')
      .insert([storyRecord])
      .select()
      .single();

    if (storyError) {
      log(`   ❌ Failed: ${storyError.message}`, 'red');
      failCount++;
    } else {
      log(`   ✓ Imported successfully (ID: ${newStory.id})`, 'green');
      successCount++;

      // Add tags if provided
      if (storyData.tags && Array.isArray(storyData.tags)) {
        // Note: This assumes you have a tags table and story_tags junction table
        // If not, we'll skip this step
        log(`   📌 Tags: ${storyData.tags.join(', ')}`, 'cyan');
      }
    }
  }

  section('✅ IMPORT COMPLETE');
  log(`\n✓ Successfully imported: ${successCount} stories`, 'green');
  if (failCount > 0) {
    log(`❌ Failed: ${failCount} stories`, 'red');
  }

  log('\nNext steps:', 'bright');
  log('  1. View your stories: http://localhost:3000/stories', 'cyan');
  log('  2. View storytellers: http://localhost:3000/wiki/people', 'cyan');
  log('  3. Run analytics: http://localhost:3000/analytics', 'cyan');
}

// Run the import
importElderStories().catch(error => {
  log(`\n❌ Fatal error: ${error.message}`, 'red');
  console.error(error);
  process.exit(1);
});
