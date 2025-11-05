/**
 * Import Stories from Transcripts
 * Fetches storytellers with transcripts and imports them as stories
 *
 * Usage: npx tsx import-stories.ts
 */

import { createClient } from '@supabase/supabase-js'
import * as dotenv from 'dotenv'
import * as path from 'path'

dotenv.config({ path: path.resolve(__dirname, '.env.local') })

const STORYTELLERS_URL = 'https://raw.githubusercontent.com/Acurioustractor/Great-Palm-Island-PICC/main/data/storytellers.json'

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY!

if (!supabaseUrl || !supabaseServiceKey) {
  console.error('❌ Missing Supabase environment variables!')
  process.exit(1)
}

const supabase = createClient(supabaseUrl, supabaseServiceKey, {
  auth: {
    autoRefreshToken: false,
    persistSession: false
  }
})

interface AirtableStoryteller {
  id: string; // Airtable ID
  name: string;
  location?: string;
  bio?: string;
  profileImage?: string;
  metadata?: {
    'Transcript (from Media)'?: string | string[];
    'Personal Quote'?: string;
    'Consent Status'?: string;
    [key: string]: any;
  };
}

async function importStories() {
  console.log('\n📥 Fetching Storytellers with Transcripts...')
  console.log('================================================\n')

  try {
    // 1. Fetch storytellers from GitHub
    const response = await fetch(STORYTELLERS_URL)
    if (!response.ok) {
      throw new Error(`HTTP ${response.status}: ${response.statusText}`)
    }

    const storytellers: AirtableStoryteller[] = await response.json()
    console.log(`✅ Fetched ${storytellers.length} storytellers\n`)

    // 2. Filter those with transcripts
    const withTranscripts = storytellers.filter(s => {
      const transcript = s.metadata?.['Transcript (from Media)']
      return transcript && transcript.length > 0
    })

    console.log(`📝 Found ${withTranscripts.length} storytellers with transcripts\n`)

    if (withTranscripts.length === 0) {
      console.log('❌ No transcripts to import!')
      return
    }

    // 3. Match Airtable IDs to Supabase profiles
    let imported = 0
    let skipped = 0
    let errors = 0

    for (const storyteller of withTranscripts) {
      try {
        // Find profile by Airtable ID
        const { data: profile, error: profileError } = await supabase
          .from('profiles')
          .select('id, full_name')
          .eq('metadata->>airtable_id', storyteller.id)
          .single()

        if (profileError || !profile) {
          console.log(`⚠️  ${storyteller.name}: No matching profile (Airtable ID: ${storyteller.id})`)
          skipped++
          continue
        }

        // Get transcript
        const transcript = Array.isArray(storyteller.metadata!['Transcript (from Media)'])
          ? storyteller.metadata!['Transcript (from Media)'].join('\n\n')
          : storyteller.metadata!['Transcript (from Media)']!

        // Check if story already exists
        const { data: existingStory } = await supabase
          .from('stories')
          .select('id')
          .eq('storyteller_id', profile.id)
          .eq('metadata->>source', 'airtable_transcript')
          .eq('metadata->>airtable_id', storyteller.id)
          .single()

        if (existingStory) {
          console.log(`⏭️  ${storyteller.name}: Story already imported`)
          skipped++
          continue
        }

        // Create story
        const { error: storyError } = await supabase
          .from('stories')
          .insert({
            storyteller_id: profile.id,
            title: `${storyteller.name}'s Story`,
            content: transcript,
            media_type: 'text',
            access_level: 'public',
            status: 'published',
            metadata: {
              source: 'airtable_transcript',
              airtable_id: storyteller.id,
              personal_quote: storyteller.metadata?.['Personal Quote'],
              consent_status: storyteller.metadata?.['Consent Status'],
              imported_at: new Date().toISOString(),
            }
          })

        if (storyError) {
          console.log(`❌ ${storyteller.name}: Failed to import - ${storyError.message}`)
          errors++
        } else {
          console.log(`✅ ${storyteller.name}: Story imported (${transcript.length} characters)`)
          imported++
        }

      } catch (error) {
        console.log(`❌ ${storyteller.name}: Error - ${error}`)
        errors++
      }
    }

    // 4. Summary
    console.log('\n================================================')
    console.log('📊 Import Summary:')
    console.log('================================================\n')
    console.log(`✅ Imported: ${imported} stories`)
    console.log(`⏭️  Skipped: ${skipped} (no profile or already imported)`)
    console.log(`❌ Errors: ${errors}`)
    console.log(`\n📝 Total storytellers with transcripts: ${withTranscripts.length}\n`)

    // 5. Verify in database
    const { count } = await supabase
      .from('stories')
      .select('*', { count: 'exact', head: true })

    console.log(`📚 Total stories in database: ${count}\n`)

    console.log('================================================')
    console.log('✅ Import complete!')
    console.log('================================================\n')

  } catch (error) {
    console.error('\n❌ Import failed!')
    console.error(error)
    process.exit(1)
  }
}

importStories()
