#!/usr/bin/env node

/**
 * Supabase Database Review Script
 *
 * Shows everything in your database:
 * - All tables and their row counts
 * - Sample data from each table
 * - Storage buckets and file counts
 * - Missing data
 */

const { createClient } = require('@supabase/supabase-js');
require('dotenv').config({ path: '.env.local' });

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL,
  process.env.SUPABASE_SERVICE_ROLE_KEY
);

const colors = {
  reset: '\x1b[0m',
  red: '\x1b[31m',
  green: '\x1b[32m',
  yellow: '\x1b[33m',
  blue: '\x1b[34m',
  cyan: '\x1b[36m',
  gray: '\x1b[90m',
};

const icons = {
  table: '📊',
  data: '📝',
  empty: '⚠️',
  bucket: '🗂️',
  check: '✅',
  warning: '⚠️',
};

// All tables we expect
const EXPECTED_TABLES = [
  'profiles',
  'stories',
  'story_media',
  'impact_indicators',
  'engagement_activities',
  'service_story_links',
  'cultural_permissions',
  'story_patterns',
];

// Storage buckets we expect
const EXPECTED_BUCKETS = [
  'profile-images',
  'story-images',
  'story-videos',
];

async function checkTable(tableName) {
  try {
    const { data, error, count } = await supabase
      .from(tableName)
      .select('*', { count: 'exact', head: false })
      .limit(3);

    if (error) {
      console.log(`  ${colors.red}${icons.warning} ${tableName}${colors.reset} - Error: ${error.message}`);
      return { exists: false, count: 0 };
    }

    const rowCount = count || 0;
    const status = rowCount === 0 ? colors.yellow : colors.green;
    const icon = rowCount === 0 ? icons.empty : icons.check;

    console.log(`  ${status}${icon} ${tableName}${colors.reset} - ${rowCount} rows`);

    if (rowCount > 0 && data.length > 0) {
      console.log(`${colors.gray}     Sample: ${JSON.stringify(data[0]).substring(0, 80)}...${colors.reset}`);
    }

    return { exists: true, count: rowCount, data };
  } catch (err) {
    console.log(`  ${colors.red}${icons.warning} ${tableName}${colors.reset} - ${err.message}`);
    return { exists: false, count: 0 };
  }
}

async function checkStorageBucket(bucketName) {
  try {
    const { data, error } = await supabase.storage
      .from(bucketName)
      .list();

    if (error) {
      console.log(`  ${colors.red}${icons.warning} ${bucketName}${colors.reset} - Error: ${error.message}`);
      return { exists: false, fileCount: 0 };
    }

    const fileCount = data ? data.length : 0;
    const status = fileCount === 0 ? colors.yellow : colors.green;
    const icon = fileCount === 0 ? icons.empty : icons.check;

    console.log(`  ${status}${icon} ${bucketName}${colors.reset} - ${fileCount} files`);

    return { exists: true, fileCount };
  } catch (err) {
    console.log(`  ${colors.red}${icons.warning} ${bucketName}${colors.reset} - ${err.message}`);
    return { exists: false, fileCount: 0 };
  }
}

async function main() {
  console.log(`\n${colors.blue}${'='.repeat(60)}`);
  console.log(`  Supabase Database Review`);
  console.log(`  Project: uaxhjzqrdotoahjnxmbj`);
  console.log(`${'='.repeat(60)}${colors.reset}\n`);

  // Check tables
  console.log(`${colors.cyan}${icons.table} Database Tables:${colors.reset}\n`);

  const tableResults = {};
  for (const table of EXPECTED_TABLES) {
    tableResults[table] = await checkTable(table);
  }

  // Check storage buckets
  console.log(`\n${colors.cyan}${icons.bucket} Storage Buckets:${colors.reset}\n`);

  const bucketResults = {};
  for (const bucket of EXPECTED_BUCKETS) {
    bucketResults[bucket] = await checkStorageBucket(bucket);
  }

  // Summary
  console.log(`\n${colors.blue}${'='.repeat(60)}${colors.reset}`);
  console.log(`${colors.cyan}Summary:${colors.reset}\n`);

  const totalRows = Object.values(tableResults).reduce((sum, r) => sum + r.count, 0);
  const emptyTables = Object.entries(tableResults)
    .filter(([_, r]) => r.count === 0)
    .map(([name, _]) => name);

  console.log(`  Total Rows: ${totalRows}`);
  console.log(`  Empty Tables: ${emptyTables.length}/${EXPECTED_TABLES.length}`);

  if (emptyTables.length > 0) {
    console.log(`\n${colors.yellow}${icons.warning} Empty Tables:${colors.reset}`);
    emptyTables.forEach(table => {
      console.log(`  - ${table}`);
    });
  }

  // Specific recommendations
  console.log(`\n${colors.cyan}${icons.data} What You Need to Add:${colors.reset}\n`);

  if (tableResults.profiles.count === 0) {
    console.log(`  ${colors.yellow}1. Add Storytellers (profiles table)${colors.reset}`);
    console.log(`     → Go to: http://localhost:3000/admin/storytellers`);
    console.log(`     → Click "Quick Add" to create storytellers\n`);
  } else {
    console.log(`  ${colors.green}✅ ${tableResults.profiles.count} storytellers found${colors.reset}\n`);
  }

  if (tableResults.stories.count === 0) {
    console.log(`  ${colors.yellow}2. Add Stories (stories table)${colors.reset}`);
    console.log(`     → Go to: http://localhost:3000/stories/new`);
    console.log(`     → Create stories and set status='published'\n`);
  } else {
    console.log(`  ${colors.green}✅ ${tableResults.stories.count} stories found${colors.reset}\n`);
  }

  if (bucketResults['story-images'].fileCount === 0) {
    console.log(`  ${colors.yellow}3. Add Photos (story-images bucket)${colors.reset}`);
    console.log(`     → Upload photos when creating stories\n`);
  }

  // Pages affected
  console.log(`\n${colors.cyan}Pages That Will Show 0s:${colors.reset}\n`);

  if (tableResults.profiles.count === 0) {
    console.log(`  ${colors.red}⚠️  /admin/storytellers${colors.reset} - No storytellers`);
    console.log(`  ${colors.red}⚠️  /wiki/people${colors.reset} - No storytellers`);
  }

  if (tableResults.stories.count === 0) {
    console.log(`  ${colors.red}⚠️  /stories${colors.reset} - No stories`);
    console.log(`  ${colors.red}⚠️  /analytics${colors.reset} - No data`);
    console.log(`  ${colors.red}⚠️  /insights/patterns${colors.reset} - No patterns`);
  }

  console.log(`\n${colors.blue}${'='.repeat(60)}${colors.reset}\n`);

  // Quick links
  console.log(`${colors.cyan}Quick Links:${colors.reset}\n`);
  console.log(`  Supabase Dashboard:`);
  console.log(`  ${colors.gray}https://supabase.com/dashboard/project/uaxhjzqrdotoahjnxmbj${colors.reset}\n`);
  console.log(`  Table Editor:`);
  console.log(`  ${colors.gray}https://supabase.com/dashboard/project/uaxhjzqrdotoahjnxmbj/editor${colors.reset}\n`);
  console.log(`  Storage:`);
  console.log(`  ${colors.gray}https://supabase.com/dashboard/project/uaxhjzqrdotoahjnxmbj/storage/buckets${colors.reset}\n`);
}

main().catch(console.error);
