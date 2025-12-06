/**
 * Check media_files table schema
 */

import { createClient } from '@supabase/supabase-js'
import * as dotenv from 'dotenv'
import { resolve } from 'path'

// Load environment variables
dotenv.config({ path: resolve(process.cwd(), '.env.local') })

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY!

const supabase = createClient(supabaseUrl, supabaseServiceKey)

async function checkSchema() {
  console.log('🔍 Checking media_files table schema...\n')

  // Get a sample record to see available columns
  const { data, error } = await supabase
    .from('media_files')
    .select('*')
    .limit(1)

  if (error) {
    console.error('❌ Error:', error)
    return
  }

  if (data && data.length > 0) {
    console.log('Available columns:')
    Object.keys(data[0]).forEach(key => {
      console.log(`  - ${key}: ${typeof data[0][key]}`)
    })
    console.log('\nSample record:')
    console.log(JSON.stringify(data[0], null, 2))
  }
}

checkSchema()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error('❌ Fatal error:', error)
    process.exit(1)
  })
