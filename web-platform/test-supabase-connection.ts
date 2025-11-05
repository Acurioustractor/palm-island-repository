/**
 * Test Supabase Connection
 * Run this to verify your API keys are working
 *
 * Usage: npx tsx test-supabase-connection.ts
 */

import { createClient } from '@supabase/supabase-js'
import * as dotenv from 'dotenv'
import * as path from 'path'

// Load environment variables
dotenv.config({ path: path.resolve(__dirname, '.env.local') })

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY

console.log('\n🔍 Testing Supabase Connection...')
console.log('================================================\n')

// Check environment variables
console.log('📋 Environment Variables:')
console.log(`   URL: ${supabaseUrl}`)
console.log(`   Anon Key: ${supabaseAnonKey ? '✅ Set (' + supabaseAnonKey.substring(0, 20) + '...)' : '❌ Missing'}`)
console.log(`   Service Key: ${supabaseServiceKey ? '✅ Set (' + supabaseServiceKey.substring(0, 20) + '...)' : '❌ Missing'}`)
console.log()

if (!supabaseUrl || !supabaseAnonKey || !supabaseServiceKey) {
  console.error('❌ ERROR: Missing required environment variables!')
  console.error('   Update .env.local with your Supabase credentials')
  console.error('   Get them from: https://supabase.com/dashboard/project/uaxhjzqrdotoahjnxmbj/settings/api')
  process.exit(1)
}

// Check for placeholder values
if (supabaseAnonKey.includes('YOUR_') || supabaseServiceKey.includes('YOUR_')) {
  console.error('❌ ERROR: Environment variables still have placeholder values!')
  console.error('   Replace YOUR_ANON_KEY_HERE and YOUR_SERVICE_ROLE_KEY_HERE with real keys')
  process.exit(1)
}

async function testConnection() {
  try {
    // Test with anon key
    console.log('🔑 Testing anon key connection...')
    const supabase = createClient(supabaseUrl!, supabaseAnonKey!)

    const { data, error } = await supabase.from('profiles').select('count').single()

    if (error && error.code !== 'PGRST116') { // PGRST116 = no rows, which is fine
      console.log(`   ⚠️  Query result: ${error.message}`)
      if (error.message.includes('relation "profiles" does not exist')) {
        console.log('   ℹ️  This means the schema hasn\'t been deployed yet')
        console.log('   ℹ️  Run the SQL migrations from SUPABASE-SETUP-GUIDE.md')
      }
    } else {
      console.log('   ✅ Anon key working!')
    }

    // Test with service key
    console.log('\n🔐 Testing service role key connection...')
    const supabaseAdmin = createClient(supabaseUrl!, supabaseServiceKey!)

    const { data: adminData, error: adminError } = await supabaseAdmin
      .from('profiles')
      .select('count')
      .single()

    if (adminError && adminError.code !== 'PGRST116') {
      console.log(`   ⚠️  Query result: ${adminError.message}`)
    } else {
      console.log('   ✅ Service role key working!')
    }

    // Test storage
    console.log('\n🪣 Testing storage buckets...')
    const { data: buckets, error: bucketError } = await supabaseAdmin.storage.listBuckets()

    if (bucketError) {
      console.log(`   ⚠️  Storage error: ${bucketError.message}`)
    } else {
      console.log(`   ✅ Storage accessible! Found ${buckets?.length || 0} buckets:`)
      buckets?.forEach(bucket => {
        console.log(`      - ${bucket.name} (${bucket.public ? 'public' : 'private'})`)
      })

      // Check for expected buckets
      const expectedBuckets = ['profile-images', 'story-media', 'documents']
      const missingBuckets = expectedBuckets.filter(
        name => !buckets?.find(b => b.name === name)
      )

      if (missingBuckets.length > 0) {
        console.log(`\n   ⚠️  Missing buckets: ${missingBuckets.join(', ')}`)
        console.log('   ℹ️  Create them in the Supabase Dashboard > Storage')
      } else {
        console.log('\n   ✅ All required buckets created!')
      }
    }

    // Check for tables
    console.log('\n📊 Checking database tables...')
    const { data: tables, error: tableError } = await supabaseAdmin.rpc('get_table_list')
      .catch(() => ({ data: null, error: null })) // Function might not exist yet

    // Try alternate method
    const { data: profiles, error: profileError } = await supabaseAdmin
      .from('profiles')
      .select('id')
      .limit(1)

    const { data: stories, error: storyError } = await supabaseAdmin
      .from('stories')
      .select('id')
      .limit(1)

    const { data: orgs, error: orgError } = await supabaseAdmin
      .from('organizations')
      .select('id')
      .limit(1)

    const tableStatus = {
      profiles: !profileError || profileError.code === 'PGRST116',
      stories: !storyError || storyError.code === 'PGRST116',
      organizations: !orgError || orgError.code === 'PGRST116'
    }

    console.log(`   profiles: ${tableStatus.profiles ? '✅' : '❌'}`)
    console.log(`   stories: ${tableStatus.stories ? '✅' : '❌'}`)
    console.log(`   organizations: ${tableStatus.organizations ? '✅' : '❌'}`)

    if (!tableStatus.profiles || !tableStatus.stories || !tableStatus.organizations) {
      console.log('\n   ℹ️  Some tables missing - run the schema migrations from SUPABASE-SETUP-GUIDE.md')
    }

    // Final summary
    console.log('\n================================================')
    console.log('✅ Connection test complete!')
    console.log('================================================\n')

    if (!tableStatus.profiles || !tableStatus.stories) {
      console.log('📋 Next steps:')
      console.log('   1. Go to https://supabase.com/dashboard/project/uaxhjzqrdotoahjnxmbj/sql')
      console.log('   2. Run the schema migrations from SUPABASE-SETUP-GUIDE.md')
      console.log('   3. Create the storage buckets')
      console.log('   4. Run this test again\n')
    } else {
      console.log('🚀 All systems go! Ready to migrate data.\n')
    }

  } catch (error) {
    console.error('\n❌ Connection test failed!')
    console.error(error)
    process.exit(1)
  }
}

testConnection()
