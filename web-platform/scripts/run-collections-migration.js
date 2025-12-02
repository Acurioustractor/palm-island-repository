#!/usr/bin/env node

const fs = require('fs');
const path = require('path');

// Read environment variables
require('dotenv').config({ path: path.join(__dirname, '../.env.local') });

const { createClient } = require('@supabase/supabase-js');

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

if (!supabaseUrl || !supabaseServiceKey) {
  console.error('❌ Missing Supabase credentials in .env.local');
  process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseServiceKey);

async function runMigration() {
  console.log('=== Running Photo Collections & Smart Folders Migration ===\n');

  try {
    // Read the SQL file
    const sqlPath = path.join(__dirname, '../migrations/photo_collections_and_smart_folders.sql');
    const sql = fs.readFileSync(sqlPath, 'utf8');

    console.log('📄 Loaded SQL file:', sqlPath);
    console.log('📏 SQL length:', sql.length, 'characters\n');

    // The Supabase client doesn't support direct SQL execution
    // So we'll need to use the REST API directly
    console.log('⚠️  Note: Complex SQL migrations must be run via Supabase Dashboard');
    console.log('');
    console.log('To run this migration:');
    console.log('1. Go to: https://supabase.com/dashboard/project/uaxhjzqrdotoahjnxmbj/sql/new');
    console.log('2. Copy the contents of: migrations/photo_collections_and_smart_folders.sql');
    console.log('3. Paste and click "Run"');
    console.log('');
    console.log('Alternatively, copy this path to find the SQL file:');
    console.log(sqlPath);
    console.log('');

    // Check if tables exist using a timeout-protected fetch
    const checkTable = async (tableName) => {
      try {
        const response = await Promise.race([
          fetch(`${supabaseUrl}/rest/v1/${tableName}?limit=0`, {
            headers: {
              'apikey': supabaseServiceKey,
              'Authorization': `Bearer ${supabaseServiceKey}`,
            }
          }),
          new Promise((_, reject) => setTimeout(() => reject(new Error('Timeout')), 3000))
        ]);

        return response.ok;
      } catch (err) {
        return false;
      }
    };

    console.log('Checking if tables already exist...\n');

    const collections = await checkTable('photo_collections');
    const items = await checkTable('collection_items');
    const folders = await checkTable('smart_folders');

    console.log(`photo_collections: ${collections ? '✅ EXISTS' : '❌ NOT FOUND'}`);
    console.log(`collection_items: ${items ? '✅ EXISTS' : '❌ NOT FOUND'}`);
    console.log(`smart_folders: ${folders ? '✅ EXISTS' : '❌ NOT FOUND'}`);
    console.log('');

    if (collections && items && folders) {
      console.log('✅ All tables exist! Migration already complete.');
      return;
    }

    console.log('❌ Tables not found. Please run the SQL manually in Supabase Dashboard.');
    process.exit(1);

  } catch (error) {
    console.error('❌ Error:', error.message);
    process.exit(1);
  }
}

runMigration();
