#!/usr/bin/env tsx
/**
 * DATABASE CONNECTION TEST
 *
 * Tests your Supabase connection and checks if tables exist before importing.
 *
 * Usage:
 *   npx tsx scripts/test-db-connection.ts
 */

import { createClient } from '@supabase/supabase-js';
import * as dotenv from 'dotenv';
import * as path from 'path';

// Load environment variables
dotenv.config({ path: path.resolve(__dirname, '../.env.local') });

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY!;

console.log('🔍 Testing Supabase Connection...\n');

// Check if credentials are configured
if (!supabaseUrl || supabaseUrl.includes('your-project-id')) {
  console.error('❌ NEXT_PUBLIC_SUPABASE_URL not configured');
  console.error('   Check web-platform/.env.local\n');
  process.exit(1);
}

if (!supabaseServiceKey || supabaseServiceKey === 'YOUR_SERVICE_ROLE_KEY_HERE') {
  console.error('❌ SUPABASE_SERVICE_ROLE_KEY not configured');
  console.error('   Check web-platform/.env.local\n');
  process.exit(1);
}

console.log('✅ Environment variables configured');
console.log(`   URL: ${supabaseUrl}`);
console.log(`   Service Key: ${supabaseServiceKey.substring(0, 20)}...`);
console.log('');

// Create Supabase client
const supabase = createClient(supabaseUrl, supabaseServiceKey, {
  auth: {
    autoRefreshToken: false,
    persistSession: false
  }
});

async function testConnection() {
  try {
    // Test 1: Check if we can query the database
    console.log('🔌 Test 1: Testing database connection...');
    const { data: testData, error: testError } = await supabase
      .from('profiles')
      .select('id')
      .limit(1);

    if (testError) {
      if (testError.message.includes('relation') || testError.message.includes('does not exist')) {
        console.error('❌ Database tables do not exist yet!');
        console.error('   You need to run migrations first.\n');
        console.error('📋 TO FIX:');
        console.error('   1. Go to: https://supabase.com/dashboard/project/uaxhjzqrdotoahjnxmbj/editor');
        console.error('   2. Run these SQL files in order:');
        console.error('      - web-platform/lib/empathy-ledger/migrations/01_extensions.sql');
        console.error('      - web-platform/lib/empathy-ledger/migrations/02_profiles.sql');
        console.error('      - web-platform/lib/empathy-ledger/migrations/03_organizations_and_annual_reports.sql');
        console.error('   3. Then run this test again\n');
        process.exit(1);
      } else {
        throw testError;
      }
    }

    console.log('✅ Database connection successful!\n');

    // Test 2: Check required tables
    console.log('📋 Test 2: Checking required tables...');
    const requiredTables = [
      'profiles',
      'stories',
      'organizations',
      'organization_services'
    ];

    for (const tableName of requiredTables) {
      const { error } = await supabase
        .from(tableName)
        .select('id')
        .limit(1);

      if (error) {
        console.error(`❌ Table '${tableName}' not found`);
        console.error('   Run migrations first (see above)\n');
        process.exit(1);
      } else {
        console.log(`   ✓ ${tableName} exists`);
      }
    }

    console.log('✅ All required tables exist!\n');

    // Test 3: Check if PICC organization exists
    console.log('🏢 Test 3: Checking PICC organization...');
    const { data: piccOrg, error: orgError } = await supabase
      .from('organizations')
      .select('id, name')
      .eq('id', '3c2011b9-f80d-4289-b300-0cd383cff479')
      .single();

    if (orgError || !piccOrg) {
      console.error('❌ PICC organization not found in database');
      console.error('   You need to run migration 03_organizations_and_annual_reports.sql\n');
      process.exit(1);
    }

    console.log(`✅ Found: ${piccOrg.name}\n`);

    // Test 4: Check PICC services
    console.log('🔧 Test 4: Checking PICC services...');
    const { data: services, error: servicesError } = await supabase
      .from('organization_services')
      .select('service_name, service_slug')
      .eq('organization_id', '3c2011b9-f80d-4289-b300-0cd383cff479');

    if (servicesError) {
      console.error('❌ Could not query services');
      console.error(servicesError);
      process.exit(1);
    }

    if (!services || services.length === 0) {
      console.error('❌ No PICC services found in database');
      console.error('   You need to run migration 03_organizations_and_annual_reports.sql\n');
      process.exit(1);
    }

    console.log(`✅ Found ${services.length} PICC services:`);
    const importantServices = ['mens_programs', 'bwgcolman_healing', 'elder_support', 'early_learning'];
    importantServices.forEach(slug => {
      const service = services.find(s => s.service_slug === slug);
      if (service) {
        console.log(`   ✓ ${service.service_name}`);
      } else {
        console.log(`   ⚠ ${slug} not found (optional)`);
      }
    });
    console.log('');

    // Test 5: Check existing stories
    console.log('📚 Test 5: Checking existing stories...');
    const { data: existingStories, count } = await supabase
      .from('stories')
      .select('id', { count: 'exact' });

    console.log(`✅ Current story count: ${count || 0}\n`);

    // Summary
    console.log('================================================');
    console.log('✅ ALL TESTS PASSED!');
    console.log('================================================\n');
    console.log('Your database is ready for storm stories import!');
    console.log('\nNext step:');
    console.log('   npm run import:storm-stories\n');

  } catch (error) {
    console.error('\n❌ UNEXPECTED ERROR:');
    console.error(error);
    console.error('\nPlease share this error message for troubleshooting.\n');
    process.exit(1);
  }
}

testConnection();
