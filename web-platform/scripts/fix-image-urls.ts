/**
 * Fix image URLs to point to actual Supabase storage files
 */

import { createClient } from '@supabase/supabase-js'
import * as dotenv from 'dotenv'
import { resolve } from 'path'

// Load environment variables
dotenv.config({ path: resolve(process.cwd(), '.env.local') })

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY!

if (!supabaseUrl || !supabaseServiceKey) {
  console.error('❌ Missing Supabase credentials in .env.local')
  process.exit(1)
}

const supabase = createClient(supabaseUrl, supabaseServiceKey)

async function investigateAndFixImageUrls() {
  console.log('🔍 Investigating media_files table...\n')

  // 1. Get all annual report image records from database
  const { data: dbRecords, error: dbError } = await supabase
    .from('media_files')
    .select('id, filename, file_path, public_url, bucket_name, metadata, tags, created_at, description, title')
    .contains('tags', ['annual-report'])
    .is('deleted_at', null)
    .order('created_at', { ascending: true })

  if (dbError) {
    console.error('❌ Error fetching database records:', dbError)
    return
  }

  console.log(`📊 Found ${dbRecords?.length || 0} annual report image records in database\n`)

  if (dbRecords && dbRecords.length > 0) {
    console.log('Sample records:')
    dbRecords.slice(0, 5).forEach((record, i) => {
      console.log(`\n${i + 1}. ID: ${record.id}`)
      console.log(`   Filename: ${record.filename}`)
      console.log(`   File path: ${record.file_path}`)
      console.log(`   Public URL: ${record.public_url}`)
      console.log(`   Bucket: ${record.bucket_name}`)
      console.log(`   Title: ${record.title}`)
      console.log(`   Description: ${record.description}`)
      console.log(`   Tags: ${record.tags?.join(', ')}`)
      console.log(`   Created: ${record.created_at}`)
      console.log(`   Metadata:`, record.metadata)
    })
  }

  // 2. Get all files from Supabase storage
  console.log('\n\n🗄️ Checking Supabase storage buckets...\n')

  const { data: buckets, error: bucketsError } = await supabase.storage.listBuckets()

  if (bucketsError) {
    console.error('❌ Error listing buckets:', bucketsError)
    return
  }

  console.log(`Found ${buckets?.length || 0} buckets:`, buckets?.map(b => b.name).join(', '))

  // Check each bucket for annual report images
  for (const bucket of buckets || []) {
    console.log(`\n📦 Checking bucket: ${bucket.name}`)

    const { data: files, error: filesError } = await supabase.storage
      .from(bucket.name)
      .list('', { limit: 1000 })

    if (filesError) {
      console.error(`   ❌ Error listing files:`, filesError)
      continue
    }

    const jpgFiles = files?.filter(f => f.name.toLowerCase().endsWith('.jpg') || f.name.toLowerCase().endsWith('.jpeg')) || []
    console.log(`   Found ${jpgFiles.length} JPEG files`)

    if (jpgFiles.length > 0 && jpgFiles.length < 20) {
      console.log('   Files:')
      jpgFiles.forEach(f => {
        console.log(`   - ${f.name} (${Math.round(f.metadata.size / 1024)}KB, ${f.created_at})`)
      })
    } else if (jpgFiles.length >= 20) {
      console.log('   Sample files:')
      jpgFiles.slice(0, 5).forEach(f => {
        console.log(`   - ${f.name} (${Math.round(f.metadata.size / 1024)}KB)`)
      })
      console.log(`   ... and ${jpgFiles.length - 5} more`)
    }

    // Check for organized folders
    console.log('   Checking for folders...')
    const { data: folders, error: foldersError } = await supabase.storage
      .from(bucket.name)
      .list('documents/annual-reports/images', { limit: 100 })

    if (!foldersError && folders && folders.length > 0) {
      console.log(`   ✅ Found organized folder structure with ${folders.length} items`)
      folders.slice(0, 5).forEach(f => {
        console.log(`   - ${f.name}`)
      })
    } else {
      console.log(`   ❌ No organized folder structure found`)
    }
  }

  // 3. Try to match database records to actual storage files
  console.log('\n\n🔗 Attempting to match database records to storage files...\n')

  if (!dbRecords || dbRecords.length === 0) {
    console.log('⚠️ No database records to match')
    return
  }

  // Get story-media files (most likely location based on previous investigation)
  const { data: storageFiles, error: storageError } = await supabase.storage
    .from('story-media')
    .list('', { limit: 1000 })

  if (storageError) {
    console.error('❌ Error listing story-media files:', storageError)
    return
  }

  const jpgStorageFiles = storageFiles?.filter(f =>
    f.name.toLowerCase().endsWith('.jpg') || f.name.toLowerCase().endsWith('.jpeg')
  ) || []

  console.log(`Found ${jpgStorageFiles.length} JPEG files in story-media bucket`)

  // Create a map of storage files by created_at timestamp
  const storageFilesByTimestamp = new Map()
  jpgStorageFiles.forEach(file => {
    const timestamp = new Date(file.created_at).getTime()
    storageFilesByTimestamp.set(timestamp, file)
  })

  console.log('\n📝 Matching database records to storage files by timestamp...\n')

  const matches: Array<{
    dbRecord: typeof dbRecords[0],
    storageFile: typeof jpgStorageFiles[0] | null,
    correctUrl: string | null
  }> = []

  for (const record of dbRecords.slice(0, 20)) { // Process first 20 for now
    const dbTimestamp = new Date(record.created_at).getTime()

    // Look for storage file created within 5 seconds of database record
    let matchedFile = null
    let closestDiff = Infinity

    for (const [timestamp, file] of storageFilesByTimestamp.entries()) {
      const diff = Math.abs(timestamp - dbTimestamp)
      if (diff < closestDiff && diff < 5000) { // Within 5 seconds
        closestDiff = diff
        matchedFile = file
      }
    }

    const correctUrl = matchedFile
      ? supabase.storage.from('story-media').getPublicUrl(matchedFile.name).data.publicUrl
      : null

    matches.push({
      dbRecord: record,
      storageFile: matchedFile,
      correctUrl
    })

    if (matchedFile) {
      console.log(`✅ Match found:`)
      console.log(`   DB: ${record.filename} (${record.created_at})`)
      console.log(`   Storage: ${matchedFile.name} (${matchedFile.created_at})`)
      console.log(`   Current URL: ${record.public_url}`)
      console.log(`   Correct URL: ${correctUrl}`)
      console.log(`   Time diff: ${closestDiff}ms\n`)
    } else {
      console.log(`❌ No match for: ${record.filename} (${record.created_at})\n`)
    }
  }

  // 4. Update database records with correct URLs
  const successfulMatches = matches.filter(m => m.correctUrl)
  console.log(`\n\n🔧 Ready to update ${successfulMatches.length} records with correct URLs\n`)

  if (successfulMatches.length === 0) {
    console.log('⚠️ No matches found to update')
    return
  }

  console.log('Sample updates:')
  successfulMatches.slice(0, 3).forEach((match, i) => {
    console.log(`${i + 1}. ${match.dbRecord.id}`)
    console.log(`   Old: ${match.dbRecord.public_url}`)
    console.log(`   New: ${match.correctUrl}\n`)
  })

  // Ask for confirmation (commented out for script execution)
  console.log('Proceeding with updates...\n')

  let updateCount = 0
  let errorCount = 0

  for (const match of successfulMatches) {
    const { error } = await supabase
      .from('media_files')
      .update({
        public_url: match.correctUrl,
        bucket_name: 'story-media',
        file_path: match.storageFile!.name
      })
      .eq('id', match.dbRecord.id)

    if (error) {
      console.error(`❌ Error updating ${match.dbRecord.id}:`, error)
      errorCount++
    } else {
      updateCount++
      console.log(`✅ Updated ${match.dbRecord.id}`)
    }
  }

  console.log(`\n\n📊 Update Summary:`)
  console.log(`   ✅ Successfully updated: ${updateCount}`)
  console.log(`   ❌ Errors: ${errorCount}`)
  console.log(`   📝 Total matches: ${successfulMatches.length}`)
  console.log(`   ⏭️ Remaining records: ${dbRecords.length - successfulMatches.length}`)
}

investigateAndFixImageUrls()
  .then(() => {
    console.log('\n✅ Investigation and fix complete')
    process.exit(0)
  })
  .catch((error) => {
    console.error('❌ Fatal error:', error)
    process.exit(1)
  })
