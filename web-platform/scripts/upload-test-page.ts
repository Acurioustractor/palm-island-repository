/**
 * Test uploading a single page to Supabase to verify the full workflow
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

async function uploadTestPage() {
  const fiscalYear = '2009-10'
  const pdfFileName = `picc-annual-report-${fiscalYear}.pdf`
  const pdfPath = resolve(process.cwd(), 'public', 'documents', 'annual-reports', pdfFileName)

  console.log(`🧪 Testing full upload workflow for ${fiscalYear}\n`)

  if (!existsSync(pdfPath)) {
    console.error(`❌ PDF not found`)
    return
  }

  try {
    console.log(`📄 Extracting first page...`)
    const document = await pdf(pdfPath, { scale: 2.0 })

    let uploaded = false
    for await (const page of document) {
      // The page is already a Buffer
      const imageBuffer = page as Buffer

      console.log(`✅ Extracted page 1: ${Math.round(imageBuffer.length / 1024)}KB`)

      // Generate filename
      const filename = `annual-report-${fiscalYear}-page-01-TEST.jpg`
      const storagePath = `annual-reports/${fiscalYear}/${filename}`

      console.log(`\n📤 Uploading to Supabase...`)
      console.log(`   Bucket: story-media`)
      console.log(`   Path: ${storagePath}`)

      // Upload to Supabase storage
      const { data: uploadData, error: uploadError } = await supabase.storage
        .from('story-media')
        .upload(storagePath, imageBuffer, {
          contentType: 'image/jpeg',
          upsert: true
        })

      if (uploadError) {
        console.error(`❌ Upload failed:`, uploadError)
        return
      }

      console.log(`✅ Upload successful!`)
      console.log(`   Storage path: ${uploadData.path}`)

      // Get public URL
      const { data: urlData } = supabase.storage
        .from('story-media')
        .getPublicUrl(storagePath)

      const publicUrl = urlData.publicUrl

      console.log(`\n🔗 Public URL: ${publicUrl}`)

      // Test if URL is accessible
      console.log(`\n🌐 Testing URL accessibility...`)
      const response = await fetch(publicUrl, { method: 'HEAD' })
      console.log(`   Status: ${response.status} ${response.statusText}`)
      console.log(`   Content-Type: ${response.headers.get('content-type')}`)
      console.log(`   Content-Length: ${response.headers.get('content-length')} bytes`)

      if (response.ok) {
        console.log(`\n✅ SUCCESS! Image is accessible via public URL`)
        console.log(`\nYou can view it here: ${publicUrl}`)
      } else {
        console.log(`\n❌ Image not accessible`)
      }

      uploaded = true
      break // Only test first page
    }

    if (!uploaded) {
      console.error(`❌ No pages were processed`)
    }

  } catch (error) {
    console.error(`❌ Error:`, error)
  }
}

uploadTestPage()
  .then(() => {
    console.log('\n✅ Test complete')
    process.exit(0)
  })
  .catch((error) => {
    console.error('❌ Fatal error:', error)
    process.exit(1)
  })
