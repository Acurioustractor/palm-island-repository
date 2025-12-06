/**
 * Test extraction for a single PDF to verify the process works
 */

import { createClient } from '@supabase/supabase-js'
import * as dotenv from 'dotenv'
import { resolve } from 'path'
import { pdf } from 'pdf-to-img'
import { existsSync } from 'fs'

// Load environment variables
dotenv.config({ path: resolve(process.cwd(), '.env.local') })

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY!

if (!supabaseUrl || !supabaseServiceKey) {
  console.error('❌ Missing Supabase credentials')
  process.exit(1)
}

const supabase = createClient(supabaseUrl, supabaseServiceKey)

async function testSingleExtraction() {
  const fiscalYear = '2009-10'
  const pdfFileName = `picc-annual-report-${fiscalYear}.pdf`
  const pdfPath = resolve(process.cwd(), 'public', 'documents', 'annual-reports', pdfFileName)

  console.log(`🔍 Testing extraction for ${fiscalYear}\n`)
  console.log(`PDF path: ${pdfPath}`)

  if (!existsSync(pdfPath)) {
    console.error(`❌ PDF file not found`)
    return
  }

  console.log(`✅ PDF file exists\n`)

  try {
    console.log(`📄 Extracting pages from PDF...`)
    const document = await pdf(pdfPath, { scale: 2.0 })

    let pageCount = 0
    for await (const page of document) {
      pageCount++

      // pdf-to-img returns the page object itself as the image buffer
      console.log(`  Page ${pageCount}:`, {
        type: typeof page,
        isBuffer: Buffer.isBuffer(page),
        keys: Object.keys(page).slice(0, 10)
      })

      if (pageCount >= 3) {
        console.log(`  ... (stopping after 3 pages for test)`)
        break
      }
    }

    console.log(`\n✅ Successfully extracted ${pageCount} page(s)`)

    // Check database records
    console.log(`\n📊 Checking database records for ${fiscalYear}...`)

    const { data: records, error } = await supabase
      .from('media_files')
      .select('id, filename, metadata->page_number, metadata->image_index')
      .contains('tags', ['annual-report'])
      .ilike('tags', `%${fiscalYear}%`)
      .is('deleted_at', null)
      .limit(10)

    if (error) {
      console.error(`❌ Error fetching records:`, error)
    } else {
      console.log(`Found ${records?.length || 0} database records (showing first 10)`)
      records?.forEach(r => {
        console.log(`  - ${r.filename} (page ${r.page_number}, img ${r.image_index})`)
      })
    }

  } catch (error) {
    console.error(`❌ Error:`, error)
  }
}

testSingleExtraction()
  .then(() => {
    console.log('\n✅ Test complete')
    process.exit(0)
  })
  .catch((error) => {
    console.error('❌ Fatal error:', error)
    process.exit(1)
  })
