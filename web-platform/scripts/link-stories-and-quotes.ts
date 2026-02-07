/**
 * Link Stories & Quotes to Annual Reports
 *
 * 1. Link unlinked published stories to their fiscal year report
 * 2. Assign extracted_quotes to reports based on their story's fiscal year
 * 3. Add photo_url to extracted_quotes from storyteller profiles and media
 */

import { config } from 'dotenv'
import { resolve } from 'path'
import { createClient } from '@supabase/supabase-js'

config({ path: resolve(__dirname, '../.env.local') })

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
)

// Report IDs by fiscal year
const REPORTS: Record<string, string> = {
  '2024': '26774d54-3c21-413f-ba8c-e156c3fd9ff9', // FY 2023-24 (published)
  '2025': '82bf5440-9df4-41dc-a886-d530265e16d6', // FY 2024-25 (drafting)
  '2026': '9f356f78-6d4b-4ff2-b910-e0e6df4d66ac', // FY 2025-26 (drafting)
}

// ══════════════════════════════════════════════════════════
// 1. LINK STORIES TO ANNUAL REPORTS
// ══════════════════════════════════════════════════════════

async function linkStoriesToReports(): Promise<number> {
  console.log('\n╔══════════════════════════════════════════════╗')
  console.log('║  1. Link Stories to Annual Reports            ║')
  console.log('╚══════════════════════════════════════════════╝')

  // Get already linked story IDs
  const { data: existing } = await supabase
    .from('annual_report_stories')
    .select('story_id')

  const linkedIds = new Set((existing || []).map(e => e.story_id))

  // Get all published stories
  const { data: stories, error } = await supabase
    .from('stories')
    .select('id, title, fiscal_year, quality_score, category, story_type')
    .eq('status', 'published')
    .order('quality_score', { ascending: false })

  if (error || !stories) {
    console.error(`  Error: ${error?.message}`)
    return 0
  }

  const unlinked = stories.filter(s => !linkedIds.has(s.id))
  console.log(`  Unlinked stories: ${unlinked.length}`)

  let linked = 0
  for (const story of unlinked) {
    const fy = story.fiscal_year || '2026'
    const reportId = REPORTS[fy]
    if (!reportId) {
      console.log(`  ✗ No report for FY ${fy}: ${story.title?.substring(0, 40)}`)
      continue
    }

    // Get current max display_order for this report
    const { data: maxOrder } = await supabase
      .from('annual_report_stories')
      .select('display_order')
      .eq('report_id', reportId)
      .order('display_order', { ascending: false })
      .limit(1)

    const nextOrder = ((maxOrder?.[0]?.display_order || 0) + 1)

    // Determine section placement based on story type/category
    let section = 'community_stories'
    if (story.story_type === 'elder_wisdom' || story.category === 'culture') {
      section = 'elder_voices'
    } else if (story.category === 'health') {
      section = 'health_services'
    } else if (story.category === 'family') {
      section = 'family_services'
    }

    const isFeatured = (story.quality_score || 0) >= 80

    const { error: insertError } = await supabase
      .from('annual_report_stories')
      .insert({
        report_id: reportId,
        story_id: story.id,
        inclusion_reason: 'auto_eligible',
        section_placement: section,
        display_order: nextOrder,
        is_featured: isFeatured,
        include_full_text: isFeatured,
        metadata: { quality_score: story.quality_score },
      })

    if (insertError) {
      console.error(`  Insert error: ${insertError.message}`)
    } else {
      linked++
      console.log(`  ✓ ${story.title?.substring(0, 45)} → FY${fy} (${section})`)
    }
  }

  console.log(`  Stories linked: ${linked}`)
  return linked
}

// ══════════════════════════════════════════════════════════
// 2. ASSIGN QUOTES TO REPORTS
// ══════════════════════════════════════════════════════════

async function assignQuotesToReports(): Promise<number> {
  console.log('\n╔══════════════════════════════════════════════╗')
  console.log('║  2. Assign Quotes to Reports                 ║')
  console.log('╚══════════════════════════════════════════════╝')

  // Get unassigned quotes
  const { data: quotes, error } = await supabase
    .from('extracted_quotes')
    .select('id, story_id, quote_text, attribution')
    .is('used_in_report_id', null)

  if (error || !quotes) {
    console.error(`  Error: ${error?.message}`)
    return 0
  }

  console.log(`  Unassigned quotes: ${quotes.length}`)

  // Get stories to determine fiscal year
  const storyIds = [...new Set(quotes.map(q => q.story_id).filter(Boolean))]
  const { data: stories } = await supabase
    .from('stories')
    .select('id, fiscal_year')
    .in('id', storyIds.length > 0 ? storyIds : ['none'])

  const storyFYMap = new Map((stories || []).map(s => [s.id, s.fiscal_year || '2026']))

  let assigned = 0
  // Batch by report to use display_order properly
  const quotesByReport = new Map<string, typeof quotes>()

  for (const quote of quotes) {
    const fy = storyFYMap.get(quote.story_id) || '2026'
    const reportId = REPORTS[fy]
    if (!reportId) continue

    if (!quotesByReport.has(reportId)) quotesByReport.set(reportId, [])
    quotesByReport.get(reportId)!.push(quote)
  }

  for (const [reportId, reportQuotes] of quotesByReport) {
    // Get current max display_order
    const { data: maxOrder } = await supabase
      .from('extracted_quotes')
      .select('display_order')
      .eq('used_in_report_id', reportId)
      .order('display_order', { ascending: false })
      .limit(1)

    let nextOrder = (maxOrder?.[0]?.display_order || 0) + 1

    for (const quote of reportQuotes) {
      const { error: updateError } = await supabase
        .from('extracted_quotes')
        .update({
          used_in_report_id: reportId,
          display_order: nextOrder++,
          updated_at: new Date().toISOString(),
        })
        .eq('id', quote.id)

      if (!updateError) assigned++
    }
  }

  console.log(`  Quotes assigned to reports: ${assigned}`)
  return assigned
}

// ══════════════════════════════════════════════════════════
// 3. ADD PHOTOS TO QUOTES
// ══════════════════════════════════════════════════════════

async function addPhotosToQuotes(): Promise<number> {
  console.log('\n╔══════════════════════════════════════════════╗')
  console.log('║  3. Add Photos to Quotes                     ║')
  console.log('╚══════════════════════════════════════════════╝')

  // Get quotes missing photos
  const { data: quotes, error } = await supabase
    .from('extracted_quotes')
    .select('id, story_id, profile_id, attribution')
    .is('photo_url', null)

  if (error || !quotes) {
    console.error(`  Error: ${error?.message}`)
    return 0
  }

  console.log(`  Quotes needing photos: ${quotes.length}`)

  // Get profiles with images
  const profileIds = [...new Set(quotes.map(q => q.profile_id).filter(Boolean))]
  const { data: profiles } = await supabase
    .from('profiles')
    .select('id, profile_image_url, display_name')
    .in('id', profileIds.length > 0 ? profileIds : ['none'])

  const profilePhotoMap = new Map(
    (profiles || [])
      .filter(p => p.profile_image_url)
      .map(p => [p.id, p.profile_image_url])
  )

  // Get stories with featured images
  const storyIds = [...new Set(quotes.map(q => q.story_id).filter(Boolean))]
  const { data: stories } = await supabase
    .from('stories')
    .select('id, featured_image_url')
    .in('id', storyIds.length > 0 ? storyIds : ['none'])

  const storyImageMap = new Map(
    (stories || [])
      .filter(s => s.featured_image_url)
      .map(s => [s.id, s.featured_image_url])
  )

  // Get elder/portrait photos as fallback
  const { data: elderMedia } = await supabase
    .from('media_files')
    .select('id, public_url')
    .overlaps('tags', ['content:elders', 'content:portrait'])
    .eq('is_featured', true)
    .eq('file_type', 'image')
    .is('deleted_at', null)
    .limit(50)

  const elderPhotos = (elderMedia || []).map(m => m.public_url)
  let elderIdx = 0

  let updated = 0
  for (const quote of quotes) {
    // Try profile photo first
    let photoUrl = profilePhotoMap.get(quote.profile_id)

    // Then story featured image
    if (!photoUrl) {
      photoUrl = storyImageMap.get(quote.story_id)
    }

    // Fallback to elder photos
    if (!photoUrl && elderPhotos.length > 0) {
      photoUrl = elderPhotos[elderIdx % elderPhotos.length]
      elderIdx++
    }

    if (!photoUrl) continue

    const { error: updateError } = await supabase
      .from('extracted_quotes')
      .update({
        photo_url: photoUrl,
        updated_at: new Date().toISOString(),
      })
      .eq('id', quote.id)

    if (!updateError) updated++
  }

  console.log(`  Quotes with photos added: ${updated}`)
  return updated
}

// ══════════════════════════════════════════════════════════
// MAIN
// ══════════════════════════════════════════════════════════

async function main() {
  console.log('╔══════════════════════════════════════════════════════════╗')
  console.log('║   Link Stories & Quotes to Annual Reports               ║')
  console.log('╚══════════════════════════════════════════════════════════╝')

  const storiesLinked = await linkStoriesToReports()
  const quotesAssigned = await assignQuotesToReports()
  const photosAdded = await addPhotosToQuotes()

  // Final counts
  const { count: totalLinked } = await supabase
    .from('annual_report_stories')
    .select('id', { count: 'exact', head: true })

  const { count: quotesWithReport } = await supabase
    .from('extracted_quotes')
    .select('id', { count: 'exact', head: true })
    .not('used_in_report_id', 'is', null)

  const { count: quotesWithPhoto } = await supabase
    .from('extracted_quotes')
    .select('id', { count: 'exact', head: true })
    .not('photo_url', 'is', null)

  console.log('\n' + '='.repeat(60))
  console.log('SUMMARY')
  console.log('='.repeat(60))
  console.log(`  Stories linked this run: ${storiesLinked}`)
  console.log(`  Quotes assigned this run: ${quotesAssigned}`)
  console.log(`  Photos added this run: ${photosAdded}`)
  console.log(`\n  FINAL STATE:`)
  console.log(`  Total story-report links: ${totalLinked}`)
  console.log(`  Quotes with report: ${quotesWithReport}`)
  console.log(`  Quotes with photo: ${quotesWithPhoto}`)
  console.log('='.repeat(60))
}

main().catch(console.error)
