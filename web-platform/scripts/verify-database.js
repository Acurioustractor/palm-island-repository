#!/usr/bin/env node

/**
 * Database Verification Script
 *
 * This script checks your Supabase connection and shows what data you currently have.
 *
 * Usage:
 *   node scripts/verify-database.js
 *
 * Make sure you have .env.local file with:
 *   NEXT_PUBLIC_SUPABASE_URL=your_url
 *   NEXT_PUBLIC_SUPABASE_ANON_KEY=your_key
 */

require('dotenv').config({ path: '.env.local' });
const { createClient } = require('@supabase/supabase-js');

// ANSI colors for terminal output
const colors = {
  reset: '\x1b[0m',
  bright: '\x1b[1m',
  green: '\x1b[32m',
  red: '\x1b[31m',
  yellow: '\x1b[33m',
  blue: '\x1b[34m',
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

async function verifyDatabase() {
  section('🔍 PALM ISLAND DATABASE VERIFICATION');

  // Check environment variables
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

  if (!supabaseUrl || !supabaseKey) {
    log('\n❌ ERROR: Missing Supabase credentials!', 'red');
    log('\nPlease create .env.local file with:', 'yellow');
    log('  NEXT_PUBLIC_SUPABASE_URL=https://yvnuayzslukamizrlhwb.supabase.co');
    log('  NEXT_PUBLIC_SUPABASE_ANON_KEY=your_anon_key_here');
    process.exit(1);
  }

  log('\n✓ Environment variables found', 'green');
  log(`  URL: ${supabaseUrl}`, 'cyan');
  log(`  Key: ${supabaseKey.substring(0, 20)}...`, 'cyan');

  // Create Supabase client
  const supabase = createClient(supabaseUrl, supabaseKey);

  try {
    // Test connection
    section('📡 TESTING CONNECTION');
    const { error: connectionError } = await supabase.from('profiles').select('count', { count: 'exact', head: true });

    if (connectionError) {
      log(`\n❌ Connection failed: ${connectionError.message}`, 'red');
      process.exit(1);
    }

    log('\n✓ Successfully connected to Supabase!', 'green');

    // Check tables and counts
    section('📊 DATABASE STATISTICS');

    // Stories
    const { count: storyCount, error: storyError } = await supabase
      .from('stories')
      .select('*', { count: 'exact', head: true });

    if (!storyError) {
      log(`\n📖 Stories: ${storyCount}`, 'cyan');
    }

    // Profiles/Storytellers
    const { count: profileCount, error: profileError } = await supabase
      .from('profiles')
      .select('*', { count: 'exact', head: true });

    if (!profileError) {
      log(`👥 Storytellers: ${profileCount}`, 'cyan');
    }

    // Organizations
    const { count: orgCount, error: orgError } = await supabase
      .from('organizations')
      .select('*', { count: 'exact', head: true });

    if (!orgError) {
      log(`🏢 Organizations: ${orgCount}`, 'cyan');
    }

    // Services
    const { count: serviceCount, error: serviceError } = await supabase
      .from('services')
      .select('*', { count: 'exact', head: true });

    if (!serviceError) {
      log(`🛠️  Services: ${serviceCount}`, 'cyan');
    }

    // Categories (may not exist yet)
    const { count: categoryCount, error: categoryError } = await supabase
      .from('categories')
      .select('*', { count: 'exact', head: true });

    if (!categoryError && categoryCount > 0) {
      log(`📁 Categories: ${categoryCount}`, 'cyan');
    } else if (categoryError) {
      log(`⚠️  Categories table not found (run wiki migration)`, 'yellow');
    }

    // Recent Stories
    section('📚 RECENT STORIES');
    const { data: recentStories, error: recentError } = await supabase
      .from('stories')
      .select(`
        id,
        title,
        created_at,
        story_category,
        storyteller:storyteller_id(full_name, preferred_name)
      `)
      .order('created_at', { ascending: false })
      .limit(10);

    if (!recentError && recentStories.length > 0) {
      recentStories.forEach((story, index) => {
        const storyteller = story.storyteller?.preferred_name || story.storyteller?.full_name || 'Unknown';
        const date = new Date(story.created_at).toLocaleDateString();
        log(`\n${index + 1}. ${story.title}`, 'bright');
        log(`   By: ${storyteller} | Category: ${story.story_category || 'None'} | ${date}`, 'cyan');
      });
    } else if (recentStories.length === 0) {
      log('\n⚠️  No stories found in database', 'yellow');
      log('   You may need to import your data!', 'yellow');
    }

    // Storytellers
    section('👥 STORYTELLERS');
    const { data: storytellers, error: storytellerError } = await supabase
      .from('profiles')
      .select(`
        id,
        full_name,
        preferred_name,
        storyteller_type,
        is_elder,
        location
      `)
      .order('full_name');

    if (!storytellerError && storytellers.length > 0) {
      storytellers.forEach((person, index) => {
        const name = person.preferred_name || person.full_name;
        const elder = person.is_elder ? '👴' : '';
        const type = person.storyteller_type || 'community';
        const location = person.location || '';
        log(`\n${index + 1}. ${name} ${elder}`, 'bright');
        log(`   Type: ${type} | Location: ${location}`, 'cyan');
      });
    } else if (storytellers.length === 0) {
      log('\n⚠️  No storytellers found in database', 'yellow');
    }

    // Story counts by category
    section('📊 STORIES BY CATEGORY');
    const { data: categoryStats, error: categoryStatsError } = await supabase
      .from('stories')
      .select('story_category');

    if (!categoryStatsError && categoryStats) {
      const categoryCounts = {};
      categoryStats.forEach(story => {
        const cat = story.story_category || 'Uncategorized';
        categoryCounts[cat] = (categoryCounts[cat] || 0) + 1;
      });

      const sorted = Object.entries(categoryCounts).sort((a, b) => b[1] - a[1]);
      sorted.forEach(([category, count]) => {
        log(`\n${category}: ${count} stories`, 'cyan');
      });
    }

    // Summary
    section('✅ SUMMARY');
    log('\nYour database is connected and working!', 'green');
    log('\nNext steps:', 'bright');

    if (storyCount === 0) {
      log('  1. Import your storm stories: see import_storm_stories.sql', 'yellow');
      log('  2. Add your 8 elder stories: see ELDER-STORIES-IMPORT-TEMPLATE.md', 'yellow');
    } else {
      log(`  1. You have ${storyCount} stories - looking good!`, 'green');
      log('  2. Add your 8 elder stories: see ELDER-STORIES-IMPORT-TEMPLATE.md', 'cyan');
    }

    if (!categoryError && categoryCount === 0) {
      log('  3. Run wiki migration: migrations/001_wiki_infrastructure.sql', 'yellow');
    } else if (categoryError) {
      log('  3. Run wiki migration: migrations/001_wiki_infrastructure.sql', 'yellow');
    } else {
      log('  3. Wiki categories are set up!', 'green');
    }

    log('  4. Start the dev server: npm run dev', 'cyan');
    log('  5. View your stories at: http://localhost:3000/stories', 'cyan');
    log('  6. View storytellers at: http://localhost:3000/wiki/people', 'cyan');
    log('  7. View analytics at: http://localhost:3000/analytics', 'cyan');

  } catch (error) {
    log(`\n❌ Error: ${error.message}`, 'red');
    console.error(error);
    process.exit(1);
  }
}

// Run the verification
verifyDatabase().catch(console.error);
