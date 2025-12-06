import { config } from 'dotenv';
import { resolve } from 'path';
import { createClient } from '@supabase/supabase-js';
import { readFileSync } from 'fs';

config({ path: resolve(process.cwd(), '.env.local') });

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
);

async function applyFix() {
  console.log('\n🔧 APPLYING match_stories() FUNCTION FIX');
  console.log('============================================================\n');

  // Read the migration SQL
  const migrationPath = resolve(process.cwd(), 'lib/empathy-ledger/migrations/08_fix_match_stories_function.sql');
  const migrationSQL = readFileSync(migrationPath, 'utf-8');

  console.log('📄 Migration file loaded');
  console.log(`   File: ${migrationPath}`);
  console.log(`   Size: ${migrationSQL.length} characters\n`);

  // Split SQL into individual statements (simple split by semicolon)
  const statements = migrationSQL
    .split(';')
    .map(s => s.trim())
    .filter(s => s.length > 0 && !s.startsWith('--') && !s.startsWith('/*'));

  console.log(`📋 Found ${statements.length} SQL statements to execute\n`);

  let successCount = 0;
  let errorCount = 0;

  for (let i = 0; i < statements.length; i++) {
    const statement = statements[i];

    // Skip empty statements and comments
    if (!statement || statement.startsWith('--') || statement.startsWith('/*')) {
      continue;
    }

    // Get the first line for logging (usually DROP/CREATE/SELECT)
    const firstLine = statement.split('\n')[0].substring(0, 60);
    console.log(`${i + 1}. Executing: ${firstLine}...`);

    try {
      const { data, error } = await supabase.rpc('exec_sql', {
        sql: statement + ';'
      });

      if (error) {
        // If exec_sql doesn't exist, try direct execution
        if (error.message.includes('exec_sql')) {
          console.log('   ⚠️  exec_sql RPC not available - migration needs to be run in Supabase Dashboard');
          console.log('   Copy the SQL from:');
          console.log(`   ${migrationPath}`);
          console.log('   And run it in: Supabase Dashboard > SQL Editor\n');
          return false;
        }

        console.log(`   ❌ Error: ${error.message}`);
        errorCount++;
      } else {
        console.log('   ✓ Success');
        successCount++;
      }
    } catch (err: any) {
      console.log(`   ❌ Exception: ${err.message}`);
      errorCount++;
    }
  }

  console.log('\n============================================================');
  console.log(`✅ ${successCount} statements succeeded`);
  if (errorCount > 0) {
    console.log(`❌ ${errorCount} statements failed`);
    console.log('\nPlease run the migration manually in Supabase Dashboard:');
    console.log('1. Open Supabase Dashboard');
    console.log('2. Go to SQL Editor');
    console.log('3. Paste the contents of:');
    console.log(`   ${migrationPath}`);
    console.log('4. Click RUN\n');
    return false;
  }

  console.log('\n✅ Migration applied successfully!\n');
  return true;
}

applyFix()
  .then(success => {
    if (!success) {
      console.log('\n⚠️  MANUAL MIGRATION REQUIRED');
      console.log('Run the SQL manually in Supabase Dashboard\n');
    }
    process.exit(success ? 0 : 1);
  })
  .catch(err => {
    console.error('\n❌ FATAL ERROR:', err.message);
    console.error(err);
    process.exit(1);
  });
