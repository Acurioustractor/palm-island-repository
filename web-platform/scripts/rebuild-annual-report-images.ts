/**
 * Rebuild annual report images from scratch:
 * 1. Delete old corrupt database records
 * 2. Extract full-page screenshots from all PDFs
 * 3. Upload to Supabase with proper URLs
 * 4. Create new clean database records
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

const FISCAL_YEARS = [
  '2009-10', '2010-11', '2011-12', '2012-13', '2013-14', '2014-15',
  '2015-16', '2016-17', '2017-18', '2018-19', '2019-20', '2020-21',
  '2021-22', '2022-23', '2023-24'
]

interface YearResult {
  fiscalYear: string
  pagesProcessed: number
  imagesUploaded: number
  recordsCreated: number
  errors: string[]
}

async function rebuildAnnualReportImages() {
  console.log('🚀 Rebuilding Annual Report Images\n')
  console.log('This script will:')
  console.log('  1. Delete old corrupt database records')
  console.log('  2. Extract full-page screenshots from PDFs')
  console.log('  3. Upload to Supabase storage')
  console.log('  4. Create new clean database records\n')

  // Step 1: Delete old records
  console.log('🗑️  Step 1: Deleting old corrupt records...\n')

  const { data: oldRecords, error: fetchError } = await supabase
    .from('media_files')
    .select('id')
    .contains('tags', ['annual-report'])
    .is('deleted_at', null)

  if (fetchError) {
    console.error('❌ Error fetching old records:', fetchError)
    process.exit(1)
  }

  console.log(`Found ${oldRecords?.length || 0} old records to delete`)

  if (oldRecords && oldRecords.length > 0) {
    // Soft delete by setting deleted_at
    const { error: deleteError } = await supabase
      .from('media_files')
      .update({ deleted_at: new Date().toISOString() })
      .contains('tags', ['annual-report'])
      .is('deleted_at', null)

    if (deleteError) {
      console.error('❌ Error deleting old records:', deleteError)
      process.exit(1)
    }

    console.log(`✅ Soft-deleted ${oldRecords.length} old records\n`)
  }

  // Step 2-4: Process each fiscal year
  console.log('📄 Step 2-4: Processing annual reports...\n')

  const results: YearResult[] = []

  for (const fiscalYear of FISCAL_YEARS) {
    console.log(`\n${'='.repeat(60)}`)
    console.log(`📅 ${fiscalYear}`)
    console.log('='.repeat(60))

    const result: YearResult = {
      fiscalYear,
      pagesProcessed: 0,
      imagesUploaded: 0,
      recordsCreated: 0,
      errors: []
    }

    try {
      // Find PDF
      const pdfFileName = `picc-annual-report-${fiscalYear}.pdf`
      const pdfPath = resolve(process.cwd(), 'public', 'documents', 'annual-reports', pdfFileName)

      if (!existsSync(pdfPath)) {
        result.errors.push(`PDF not found: ${pdfPath}`)
        console.error(`❌ PDF not found`)
        results.push(result)
        continue
      }

      console.log(`✅ Found PDF`)

      // Extract pages
      console.log(`📄 Extracting pages...`)
      const document = await pdf(pdfPath, { scale: 2.0 })

      for await (const page of document) {
        result.pagesProcessed++
        const imageBuffer = page as Buffer
        const pageNum = result.pagesProcessed

        console.log(`\n  Page ${pageNum}: ${Math.round(imageBuffer.length / 1024)}KB`)

        // Generate filename and path
        const filename = `annual-report-${fiscalYear}-page-${String(pageNum).padStart(2, '0')}.jpg`
        const storagePath = `annual-reports/${fiscalYear}/${filename}`

        // Upload to Supabase
        console.log(`    📤 Uploading...`)
        const { data: uploadData, error: uploadError } = await supabase.storage
          .from('story-media')
          .upload(storagePath, imageBuffer, {
            contentType: 'image/jpeg',
            upsert: true
          })

        if (uploadError) {
          result.errors.push(`Upload failed for page ${pageNum}: ${uploadError.message}`)
          console.error(`    ❌ Upload failed:`, uploadError.message)
          continue
        }

        result.imagesUploaded++

        // Get public URL
        const { data: urlData } = supabase.storage
          .from('story-media')
          .getPublicUrl(storagePath)

        const publicUrl = urlData.publicUrl

        console.log(`    ✅ Uploaded to: ${storagePath}`)

        // Create database record
        const decade = fiscalYear.startsWith('200') ? '2000s' : '2020s'
        const { error: insertError } = await supabase
          .from('media_files')
          .insert({
            filename: filename,
            original_filename: filename,
            file_path: storagePath,
            bucket_name: 'story-media',
            public_url: publicUrl,
            file_type: 'image',
            mime_type: 'image/jpeg',
            file_size: imageBuffer.length,
            title: `PICC Annual Report ${fiscalYear} - Page ${pageNum}`,
            description: `Full page screenshot from Palm Island Community Company (PICC) Annual Report ${fiscalYear}, page ${pageNum}.`,
            tags: ['annual-report', `annual-report-${fiscalYear}`, `page-${pageNum}`, 'picc', 'historical', decade],
            is_public: true,
            metadata: {
              source: 'annual-report',
              pdf_path: `/documents/annual-reports/${pdfFileName}`,
              fiscal_year: fiscalYear,
              page_number: pageNum,
              extracted_at: new Date().toISOString(),
              knowledge_entry_slug: `picc-annual-report-${fiscalYear}-full-pdf`,
              extraction_method: 'pdf-to-img-fullpage'
            }
          })

        if (insertError) {
          result.errors.push(`Database insert failed for page ${pageNum}: ${insertError.message}`)
          console.error(`    ❌ Database insert failed:`, insertError.message)
        } else {
          result.recordsCreated++
          console.log(`    📝 Created database record`)
        }
      }

      console.log(`\n✅ Completed ${fiscalYear}:`)
      console.log(`   Pages processed: ${result.pagesProcessed}`)
      console.log(`   Images uploaded: ${result.imagesUploaded}`)
      console.log(`   Records created: ${result.recordsCreated}`)
      if (result.errors.length > 0) {
        console.log(`   ⚠️  Errors: ${result.errors.length}`)
      }

    } catch (error) {
      const errorMsg = error instanceof Error ? error.message : String(error)
      result.errors.push(`Fatal error: ${errorMsg}`)
      console.error(`❌ Fatal error:`, error)
    }

    results.push(result)
  }

  // Final summary
  console.log(`\n\n${'='.repeat(60)}`)
  console.log('📊 FINAL SUMMARY')
  console.log('='.repeat(60))

  let totalPages = 0
  let totalUploaded = 0
  let totalRecords = 0
  let totalErrors = 0

  results.forEach(result => {
    totalPages += result.pagesProcessed
    totalUploaded += result.imagesUploaded
    totalRecords += result.recordsCreated
    totalErrors += result.errors.length
  })

  console.log(`\n✅ Total pages processed: ${totalPages}`)
  console.log(`✅ Total images uploaded: ${totalUploaded}`)
  console.log(`✅ Total database records created: ${totalRecords}`)
  if (totalErrors > 0) {
    console.log(`❌ Total errors: ${totalErrors}`)
  }

  console.log(`\n📋 Breakdown by year:`)
  results.forEach(result => {
    const status = result.errors.length > 0 ? '⚠️' : '✅'
    console.log(`  ${status} ${result.fiscalYear}: ${result.pagesProcessed} pages, ${result.recordsCreated} records`)
  })

  if (totalErrors > 0) {
    console.log(`\n⚠️  Errors encountered:`)
    results.forEach(result => {
      if (result.errors.length > 0) {
        console.log(`\n  ${result.fiscalYear}:`)
        result.errors.forEach(err => console.log(`    - ${err}`))
      }
    })
  }
}

rebuildAnnualReportImages()
  .then(() => {
    console.log('\n✅ Rebuild complete!')
    process.exit(0)
  })
  .catch((error) => {
    console.error('❌ Fatal error:', error)
    process.exit(1)
  })
