/**
 * Fetch Storyteller Data from GitHub
 * Downloads the 25 storytellers with transcripts from the external repo
 *
 * Usage: npx tsx fetch-storyteller-data.ts
 */

import * as fs from 'fs'
import * as path from 'path'

const STORYTELLERS_URL = 'https://raw.githubusercontent.com/Acurioustractor/Great-Palm-Island-PICC/main/data/storytellers.json'

console.log('\n📥 Fetching Storyteller Data from GitHub...')
console.log('================================================\n')
console.log(`Source: ${STORYTELLERS_URL}\n`)

async function fetchStorytellerData() {
  try {
    const response = await fetch(STORYTELLERS_URL)

    if (!response.ok) {
      throw new Error(`HTTP ${response.status}: ${response.statusText}`)
    }

    const storytellers = await response.json()

    console.log(`✅ Successfully fetched ${storytellers.length} storytellers\n`)

    // Analyze the data
    console.log('📊 Data Summary:')
    console.log('================================================\n')

    let withTranscripts = 0
    let withImages = 0
    let withBios = 0
    let totalTranscriptLength = 0

    storytellers.forEach((s: any) => {
      if (s.metadata?.['Transcript (from Media)']) {
        withTranscripts++
        const transcript = Array.isArray(s.metadata['Transcript (from Media)'])
          ? s.metadata['Transcript (from Media)'].join(' ')
          : s.metadata['Transcript (from Media)']
        totalTranscriptLength += transcript.length
      }
      if (s.profileImage) withImages++
      if (s.bio) withBios++
    })

    console.log(`Total storytellers: ${storytellers.length}`)
    console.log(`With transcripts: ${withTranscripts}`)
    console.log(`With profile images: ${withImages}`)
    console.log(`With biographies: ${withBios}`)
    console.log(`Average transcript length: ${Math.round(totalTranscriptLength / withTranscripts)} characters\n`)

    // Show sample storytellers
    console.log('📋 Sample Storytellers:')
    console.log('================================================\n')

    storytellers.slice(0, 5).forEach((s: any) => {
      console.log(`✨ ${s.name}`)
      console.log(`   Airtable ID: ${s.id}`)
      console.log(`   Location: ${s.location || 'Palm Island'}`)
      if (s.bio) {
        console.log(`   Bio: ${s.bio.substring(0, 80)}...`)
      }
      if (s.metadata?.['Personal Quote']) {
        console.log(`   Quote: "${s.metadata['Personal Quote'].substring(0, 60)}..."`)
      }
      if (s.metadata?.['Transcript (from Media)']) {
        const transcript = Array.isArray(s.metadata['Transcript (from Media)'])
          ? s.metadata['Transcript (from Media)'].join(' ')
          : s.metadata['Transcript (from Media)']
        console.log(`   Transcript: ${transcript.length} characters`)
      }
      console.log()
    })

    console.log(`... and ${storytellers.length - 5} more\n`)

    // Save to local file
    const outputPath = path.join(__dirname, 'data', 'storytellers.json')
    const outputDir = path.dirname(outputPath)

    if (!fs.existsSync(outputDir)) {
      fs.mkdirSync(outputDir, { recursive: true })
    }

    fs.writeFileSync(outputPath, JSON.stringify(storytellers, null, 2))
    console.log(`💾 Saved to: ${outputPath}\n`)

    // Check for Airtable IDs that match migration script
    console.log('🔍 Verifying against migration script...')
    console.log('================================================\n')

    const expectedIds = [
      { id: 'recWvX38lmm9goNjC', name: 'Jason' },
      { id: 'rece8jgHe7f45MnVD', name: 'Alfred Johnson' },
      { id: 'recJrIHCNCoMjr9cu', name: 'Daniel Patrick Noble' },
      { id: 'recyKePRb9W51gMjN', name: 'Ivy' },
      { id: 'rec8IGe1Affcw4T2V', name: 'Roy Prior' },
      { id: 'recBSWEWggDSMc6nJ', name: 'Uncle Frank Daniel Landers' }
    ]

    expectedIds.forEach(expected => {
      const found = storytellers.find((s: any) => s.id === expected.id)
      if (found) {
        console.log(`✅ ${expected.name}: Found (${found.name})`)
      } else {
        console.log(`❌ ${expected.name}: Not found`)
      }
    })

    console.log('\n================================================')
    console.log('✅ Data fetch complete!')
    console.log('================================================\n')

    console.log('📋 Next steps:')
    console.log('   1. Review the data in web-platform/data/storytellers.json')
    console.log('   2. Set up Supabase (follow SUPABASE-SETUP-GUIDE.md)')
    console.log('   3. Run migrate_airtable_storytellers.sql')
    console.log('   4. Import transcripts as stories\n')

    // Export summary
    const summary = {
      fetched_at: new Date().toISOString(),
      total_storytellers: storytellers.length,
      with_transcripts: withTranscripts,
      with_images: withImages,
      with_bios: withBios,
      avg_transcript_length: Math.round(totalTranscriptLength / withTranscripts),
      storytellers: storytellers.map((s: any) => ({
        name: s.name,
        airtable_id: s.id,
        has_transcript: !!s.metadata?.['Transcript (from Media)'],
        has_image: !!s.profileImage,
        has_bio: !!s.bio,
        consent: s.metadata?.['Consent Status'] || 'Unknown'
      }))
    }

    fs.writeFileSync(
      path.join(outputDir, 'storytellers-summary.json'),
      JSON.stringify(summary, null, 2)
    )

  } catch (error) {
    console.error('\n❌ Failed to fetch storyteller data!')
    console.error(error)
    process.exit(1)
  }
}

fetchStorytellerData()
