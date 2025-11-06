#!/usr/bin/env tsx
/**
 * SCHEMA INSPECTOR
 *
 * Checks what columns actually exist in the database tables.
 */

import { createClient } from '@supabase/supabase-js';
import * as dotenv from 'dotenv';
import * as path from 'path';

dotenv.config({ path: path.resolve(__dirname, '../.env.local') });

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY!;

const supabase = createClient(supabaseUrl, supabaseServiceKey, {
  auth: { autoRefreshToken: false, persistSession: false }
});

async function checkSchema() {
  console.log('🔍 Inspecting Database Schema...\n');

  // Check organization_services table
  console.log('📋 organization_services table:');
  const { data: services, error: servicesError } = await supabase
    .from('organization_services')
    .select('*')
    .limit(1);

  if (servicesError) {
    console.error('❌ Error querying organization_services:');
    console.error(servicesError);
  } else if (services && services.length > 0) {
    console.log('✅ Columns found:');
    Object.keys(services[0]).forEach(col => console.log(`   - ${col}`));
  } else {
    console.log('⚠️  No data in organization_services table');
  }

  console.log('\n📋 organizations table:');
  const { data: orgs, error: orgsError } = await supabase
    .from('organizations')
    .select('*')
    .limit(1);

  if (orgsError) {
    console.error('❌ Error querying organizations:');
    console.error(orgsError);
  } else if (orgs && orgs.length > 0) {
    console.log('✅ Columns found:');
    Object.keys(orgs[0]).forEach(col => console.log(`   - ${col}`));
  }

  console.log('\n📋 profiles table:');
  const { data: profiles, error: profilesError } = await supabase
    .from('profiles')
    .select('*')
    .limit(1);

  if (profilesError) {
    console.error('❌ Error querying profiles:');
    console.error(profilesError);
  } else if (profiles && profiles.length > 0) {
    console.log('✅ Columns found:');
    Object.keys(profiles[0]).forEach(col => console.log(`   - ${col}`));
  }

  console.log('\n📋 stories table:');
  const { data: stories, error: storiesError } = await supabase
    .from('stories')
    .select('*')
    .limit(1);

  if (storiesError) {
    console.error('❌ Error querying stories:');
    console.error(storiesError);
  } else if (stories && stories.length > 0) {
    console.log('✅ Columns found:');
    Object.keys(stories[0]).forEach(col => console.log(`   - ${col}`));
  }
}

checkSchema();
