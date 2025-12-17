// @ts-nocheck
/**
 * Re-extract images from annual report PDFs and upload to Supabase storage
 * This fixes the corrupt local files and updates database with correct URLs
 */

import { createClient } from '@supabase/supabase-js'
import * as dotenv from 'dotenv'
import { resolve } from 'path'
import { pdf } from 'pdf-to-img'
import fs from 'fs/promises'
import { existsSync } from 'fs'
import path from 'path'

// Load environment variables
dotenv.config({ path: resolve(process.cwd(), '.env.local') })

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY!

if (!supabaseUrl || !supabaseServiceKey) {
  console.error('❌ Missing Supabase credentials in .env.local')
  process.exit(1)
}

const supabase = createClient(supabaseUrl, supabaseServiceKey)

// Fiscal years to process
const FISCAL_YEARS = [
  '2009-10', '2010-11', '2011-12', '2012-13', '2013-14', '2014-15',
  '2015-16', '2016-17', '2017-18', '2018-19', '2019-20', '2020-21',
  '2021-22', '2022-23', '2023-24'
]

interface ExtractionResult {
  fiscalYear: string
  pdfPath: string
  imagesProcessed: number
  imagesUploaded: number
  recordsUpdated: number
  errors: string[]
}

async function reextractAndUploadImages() {
  console.log('🚀 Starting image re-extraction and upload process...\n')
  console.log(`Processing ${FISCAL_YEARS.length} annual reports\n`)

  const results: ExtractionResult[] = []

  for (const fiscalYear of FISCAL_YEARS) {
    console.log(`\n${'='.repeat(60)}`)
    console.log(`📅 Processing ${fiscalYear}`)
    console.log('='.repeat(60))

    const result: ExtractionResult = {
      fiscalYear,
      pdfPath: '',
      imagesProcessed: 0,
      imagesUploaded: 0,
      recordsUpdated: 0,
      errors: []
    }

    try {
      // Find PDF file
      const pdfFileName = `picc-annual-report-${fiscalYear}.pdf`
      const pdfPath = resolve(process.cwd(), 'public', 'documents', 'annual-reports', pdfFileName)
      result.pdfPath = pdfPath

      if (!existsSync(pdfPath)) {
        result.errors.push(`PDF file not found: ${pdfPath}`)
        console.error(`❌ PDF file not found: ${pdfPath}`)
        results.push(result)
        continue
      }

      console.log(`✅ Found PDF: ${pdfFileName}`)
      console.log(`📄 Extracting images from PDF...`)

      // Get existing database records for this year
      const { data: existingRecords, error: fetchError } = await supabase
        .from('media_files')
        .select('id, filename, metadata')
        .contains('tags', ['annual-report'])
        .eq('metadata->>fiscal_year', fiscalYear)
        .is('deleted_at', null)
        .order('metadata->page_number', { ascending: true })
        .order('metadata->image_index', { ascending: true })

      if (fetchError) {
        result.errors.push(`Error fetching records: ${fetchError.message}`)
        console.error(`❌ Error fetching existing records:`, fetchError)
        results.push(result)
        continue
      }

      console.log(`📊 Found ${existingRecords?.length || 0} existing database records`)

      // Extract images from PDF
      const document = await pdf(pdfPath, { scale: 2.0 })
      let imageIndex = 0

      for await (const page of document) {
        result.imagesProcessed++
        const pageNumber = page.pageNumber

        console.log(`\n  📄 Page ${pageNumber}:`)

        // Convert page to buffer
        const imageBuffer = Buffer.from(await page.arrayBuffer())

        // Generate filename
        const filename = `annual-report-${fiscalYear}-page-${String(pageNumber).padStart(2, '0')}.jpg`
        const storagePath = `annual-reports/${fiscalYear}/${filename}`

        console.log(`    📤 Uploading: ${filename}`)

        // Upload to Supabase storage
        const { data: uploadData, error: uploadError } = await supabase.storage
          .from('story-media')
          .upload(storagePath, imageBuffer, {
            contentType: 'image/jpeg',
            upsert: true
          })

        if (uploadError) {
          result.errors.push(`Upload failed for ${filename}: ${uploadError.message}`)
          console.error(`    ❌ Upload failed:`, uploadError.message)
          continue
        }

        result.imagesUploaded++

        // Get public URL
        const { data: urlData } = supabase.storage
          .from('story-media')
          .getPublicUrl(storagePath)

        const publicUrl = urlData.publicUrl

        console.log(`    ✅ Uploaded successfully`)
        console.log(`    🔗 URL: ${publicUrl}`)

        // Find corresponding database record
        const dbRecord = existingRecords?.find(r =>
          r.metadata?.page_number === pageNumber &&
          r.metadata?.image_index === imageIndex
        )

        if (dbRecord) {
          // Update database record with correct URL
          const { error: updateError } = await supabase
            .from('media_files')
            .update({
              public_url: publicUrl,
              bucket_name: 'story-media',
              file_path: storagePath,
              filename: filename
            })
            .eq('id', dbRecord.id)

          if (updateError) {
            result.errors.push(`Database update failed for ${filename}: ${updateError.message}`)
            console.error(`    ❌ Database update failed:`, updateError.message)
          } else {
            result.recordsUpdated++
            console.log(`    📝 Updated database record ${dbRecord.id}`)
          }
        } else {
          console.log(`    ⚠️ No matching database record found (will keep as is)`)
        }

        imageIndex++
      }

      console.log(`\n✅ Completed ${fiscalYear}:`)
      console.log(`   Images processed: ${result.imagesProcessed}`)
      console.log(`   Images uploaded: ${result.imagesUploaded}`)
      console.log(`   Records updated: ${result.recordsUpdated}`)
      if (result.errors.length > 0) {
        console.log(`   ⚠️ Errors: ${result.errors.length}`)
      }

    } catch (error) {
      const errorMsg = error instanceof Error ? error.message : String(error)
      result.errors.push(`Fatal error: ${errorMsg}`)
      console.error(`❌ Fatal error processing ${fiscalYear}:`, error)
    }

    results.push(result)
  }

  // Print summary
  console.log(`\n\n${'='.repeat(60)}`)
  console.log('📊 FINAL SUMMARY')
  console.log('='.repeat(60))

  let totalProcessed = 0
  let totalUploaded = 0
  let totalUpdated = 0
  let totalErrors = 0

  results.forEach(result => {
    totalProcessed += result.imagesProcessed
    totalUploaded += result.imagesUploaded
    totalUpdated += result.recordsUpdated
    totalErrors += result.errors.length

    if (result.errors.length > 0) {
      console.log(`\n❌ ${result.fiscalYear}: ${result.errors.length} errors`)
      result.errors.forEach(err => console.log(`   - ${err}`))
    }
  })

  console.log(`\n✅ Total images processed: ${totalProcessed}`)
  console.log(`✅ Total images uploaded: ${totalUploaded}`)
  console.log(`✅ Total records updated: ${totalUpdated}`)
  if (totalErrors > 0) {
    console.log(`❌ Total errors: ${totalErrors}`)
  }

  console.log(`\n${'='.repeat(60)}`)
  console.log('Results by year:')
  results.forEach(result => {
    console.log(`  ${result.fiscalYear}: ${result.imagesProcessed} pages, ${result.imagesUploaded} uploaded, ${result.recordsUpdated} updated`)
  })
}

reextractAndUploadImages()
  .then(() => {
    console.log('\n✅ Re-extraction and upload complete!')
    process.exit(0)
  })
  .catch((error) => {
    console.error('❌ Fatal error:', error)
    process.exit(1)
  })
