/**
 * Seed Annual Report Content
 *
 * Fills gaps for next year's annual report:
 * 1. Extract quotes from stories' metadata.key_quotes → quote_text
 * 2. Assign featured_image_url to stories from media library
 * 3. Mark stories as annual_report_eligible with fiscal_year
 * 4. Link stories to services based on category/tags
 * 5. Populate elder_quotes table from story quotes
 */

import { config } from 'dotenv'
import { resolve } from 'path'
import { createClient } from '@supabase/supabase-js'

config({ path: resolve(__dirname, '../.env.local') })

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY!
const supabase = createClient(supabaseUrl, supabaseServiceKey)

// ── Service mapping from category/tags to service IDs ──
const SERVICE_CATEGORY_MAP: Record<string, string[]> = {
  health: ['health-services', 'bwgcolman-healing'],
  family: ['family-care', 'children-family-centre', 'family-wellbeing-centre'],
  culture: ['social-emotional-wellbeing'],
  justice: ['community-justice-group', 'diversionary-services'],
  housing: ['housing-services'],
  youth: ['youth-services'],
  education: ['early-childhood-services', 'digital-service-centre'],
  economic: ['economic-development', 'social-enterprises'],
  safety: ['safe-haven', 'safe-house', 'specialist-dfv'],
  elder_wisdom: ['social-emotional-wellbeing'],
  community: ['community-hub'],
  resilience: ['social-emotional-wellbeing'],
}

// ── Media tag mapping for story categories ──
const CATEGORY_MEDIA_TAGS: Record<string, string[]> = {
  culture: ['content:elders', 'subject:culture', 'subject:first-nations'],
  health: ['service:health-services', 'service:bwgcolman-healing'],
  family: ['service:family-care', 'content:group'],
  community: ['content:outdoor', 'content:documentary', 'subject:on-country'],
  justice: ['service:community-justice-group'],
  housing: ['service:housing-services'],
  youth: ['service:youth-services', 'content:group'],
  elder_wisdom: ['content:elders', 'content:portrait'],
  resilience: ['content:outdoor', 'subject:first-nations'],
  education: ['service:early-childhood-services'],
  economic: ['service:economic-development'],
  safety: ['service:safe-haven'],
}

// ══════════════════════════════════════════════════════════
// 1. EXTRACT QUOTES FROM STORY METADATA
// ══════════════════════════════════════════════════════════

async function extractQuotesFromStories(): Promise<number> {
  console.log('\n╔══════════════════════════════════════════════╗')
  console.log('║  1. Extract Quotes from Stories              ║')
  console.log('╚══════════════════════════════════════════════╝')

  const { data: stories, error } = await supabase
    .from('stories')
    .select('id, title, metadata, quote_text, storyteller_id, story_type, category, tags')
    .eq('status', 'published')
    .is('quote_text', null)

  if (error || !stories) {
    console.error(`  Error: ${error?.message}`)
    return 0
  }

  let updated = 0
  for (const story of stories) {
    const keyQuotes = (story.metadata as any)?.key_quotes as string[] | undefined
    if (!keyQuotes || keyQuotes.length === 0) continue

    // Pick the best quote (longest, most impactful)
    const bestQuote = keyQuotes.reduce((best, q) =>
      q.length > best.length && q.length < 300 ? q : best
    , keyQuotes[0])

    // Get storyteller name for attribution
    let attribution = story.title?.split(':')[0]?.trim() || 'Community Member'
    if (story.storyteller_id) {
      const { data: profile } = await supabase
        .from('profiles')
        .select('display_name, full_name')
        .eq('id', story.storyteller_id)
        .single()
      if (profile) {
        attribution = profile.display_name || profile.full_name || attribution
      }
    }

    const { error: updateError } = await supabase
      .from('stories')
      .update({
        quote_text: bestQuote,
        quote_attribution: attribution,
        updated_at: new Date().toISOString(),
      })
      .eq('id', story.id)

    if (!updateError) {
      updated++
      console.log(`  ✓ "${bestQuote.substring(0, 60)}..." — ${attribution}`)
    }
  }

  console.log(`  Stories with quotes extracted: ${updated}`)
  return updated
}

// ══════════════════════════════════════════════════════════
// 2. ASSIGN FEATURED IMAGES TO STORIES
// ══════════════════════════════════════════════════════════

async function assignFeaturedImages(): Promise<number> {
  console.log('\n╔══════════════════════════════════════════════╗')
  console.log('║  2. Assign Featured Images to Stories        ║')
  console.log('╚══════════════════════════════════════════════╝')

  // Get all stories missing featured images
  const { data: stories, error } = await supabase
    .from('stories')
    .select('id, title, category, sub_category, story_type, tags')
    .eq('status', 'published')
    .is('featured_image_url', null)

  if (error || !stories) {
    console.error(`  Error: ${error?.message}`)
    return 0
  }

  console.log(`  Stories needing images: ${stories.length}`)

  // Get all featured images
  const { data: allMedia, error: mediaError } = await supabase
    .from('media_files')
    .select('id, public_url, tags, title')
    .eq('file_type', 'image')
    .eq('is_featured', true)
    .is('deleted_at', null)

  if (mediaError || !allMedia) {
    console.error(`  Media error: ${mediaError?.message}`)
    return 0
  }

  console.log(`  Available featured images: ${allMedia.length}`)

  // Track which images have been assigned to avoid duplicates
  const usedImageIds = new Set<string>()
  let assigned = 0

  for (const story of stories) {
    const category = story.category || story.story_type || 'community'
    const mediaTags = CATEGORY_MEDIA_TAGS[category] || CATEGORY_MEDIA_TAGS['community']

    // Find a matching image by tags
    let bestMatch = allMedia.find(m => {
      if (usedImageIds.has(m.id)) return false
      const mTags = m.tags || []
      return mediaTags.some(t => mTags.includes(t))
    })

    // Fallback: any featured image not yet used
    if (!bestMatch) {
      bestMatch = allMedia.find(m => !usedImageIds.has(m.id))
    }

    if (!bestMatch) {
      console.log(`  ✗ No image available for: ${story.title?.substring(0, 50)}`)
      continue
    }

    usedImageIds.add(bestMatch.id)

    const { error: updateError } = await supabase
      .from('stories')
      .update({
        featured_image_url: bestMatch.public_url,
        updated_at: new Date().toISOString(),
      })
      .eq('id', story.id)

    if (!updateError) {
      assigned++
      console.log(`  ✓ ${story.title?.substring(0, 40)} → ${bestMatch.title?.substring(0, 30) || 'image'}`)
    }
  }

  console.log(`  Stories assigned images: ${assigned}`)
  return assigned
}

// ══════════════════════════════════════════════════════════
// 3. MARK STORIES AS ANNUAL REPORT ELIGIBLE
// ══════════════════════════════════════════════════════════

async function markReportEligible(): Promise<number> {
  console.log('\n╔══════════════════════════════════════════════╗')
  console.log('║  3. Mark Stories as Report-Eligible           ║')
  console.log('╚══════════════════════════════════════════════╝')

  const { data: stories, error } = await supabase
    .from('stories')
    .select('id, title, status, quality_score, elder_approval_given, story_type, category, created_at, fiscal_year')
    .eq('status', 'published')

  if (error || !stories) {
    console.error(`  Error: ${error?.message}`)
    return 0
  }

  let updated = 0
  for (const story of stories) {
    // Eligible if published + quality >= 60
    const isEligible = (story.quality_score || 0) >= 60
    const fy = story.fiscal_year || determineFiscalYear(story.created_at)

    // Set featured_priority based on quality + elder approval
    let priority = 1
    if ((story.quality_score || 0) >= 90) priority = 5
    else if ((story.quality_score || 0) >= 80) priority = 4
    else if ((story.quality_score || 0) >= 70) priority = 3
    else if ((story.quality_score || 0) >= 60) priority = 2

    if (story.elder_approval_given) priority = Math.min(5, priority + 1)

    const { error: updateError } = await supabase
      .from('stories')
      .update({
        annual_report_eligible: isEligible,
        fiscal_year: fy,
        featured_priority: priority,
        report_worthy: isEligible,
        updated_at: new Date().toISOString(),
      })
      .eq('id', story.id)

    if (!updateError) updated++
  }

  console.log(`  Stories marked eligible: ${updated}`)
  return updated
}

function determineFiscalYear(createdAt: string): string {
  const date = new Date(createdAt)
  const year = date.getFullYear()
  const month = date.getMonth() + 1
  // PICC fiscal year: July-June. If July+ it's that year, if Jan-June it's previous year
  if (month >= 7) return `${year}`
  return `${year - 1}`
}

// ══════════════════════════════════════════════════════════
// 4. LINK STORIES TO SERVICES
// ══════════════════════════════════════════════════════════

async function linkStoriesToServices(): Promise<number> {
  console.log('\n╔══════════════════════════════════════════════╗')
  console.log('║  4. Link Stories to Services                 ║')
  console.log('╚══════════════════════════════════════════════╝')

  // Get services
  const { data: services, error: svcError } = await supabase
    .from('services')
    .select('id, name, slug')

  if (svcError) {
    console.log(`  Services table error: ${svcError.message}`)
    console.log('  Skipping service linking (table may not exist)')
    return 0
  }

  if (!services || services.length === 0) {
    console.log('  No services found in DB, skipping')
    return 0
  }

  const serviceBySlug = new Map(services.map(s => [s.slug, s.id]))
  console.log(`  Found ${services.length} services`)

  // Get stories without service_id
  const { data: stories, error } = await supabase
    .from('stories')
    .select('id, title, category, sub_category, story_type, tags, related_service')
    .eq('status', 'published')
    .is('service_id', null)

  if (error || !stories) {
    console.error(`  Error: ${error?.message}`)
    return 0
  }

  let linked = 0
  for (const story of stories) {
    const category = story.category || story.story_type || ''
    const slugs = SERVICE_CATEGORY_MAP[category]
    if (!slugs) continue

    // Find matching service
    let serviceId: string | null = null
    for (const slug of slugs) {
      if (serviceBySlug.has(slug)) {
        serviceId = serviceBySlug.get(slug)!
        break
      }
    }

    if (!serviceId) continue

    const { error: updateError } = await supabase
      .from('stories')
      .update({
        service_id: serviceId,
        updated_at: new Date().toISOString(),
      })
      .eq('id', story.id)

    if (!updateError) {
      linked++
      console.log(`  ✓ ${story.title?.substring(0, 50)} → ${slugs[0]}`)
    }
  }

  console.log(`  Stories linked to services: ${linked}`)
  return linked
}

// ══════════════════════════════════════════════════════════
// 5. POPULATE ELDER QUOTES TABLE
// ══════════════════════════════════════════════════════════

async function populateElderQuotes(): Promise<number> {
  console.log('\n╔══════════════════════════════════════════════╗')
  console.log('║  5. Populate Elder Quotes Table              ║')
  console.log('╚══════════════════════════════════════════════╝')

  // Get elder/cultural stories with quotes
  const { data: stories, error } = await supabase
    .from('stories')
    .select('id, title, metadata, storyteller_id, category, story_type, tags, quote_text, quote_attribution')
    .eq('status', 'published')
    .not('quote_text', 'is', null)

  if (error || !stories) {
    console.error(`  Error: ${error?.message}`)
    return 0
  }

  // Check existing elder_quotes to avoid duplicates
  const { data: existing } = await supabase
    .from('elder_quotes')
    .select('source_story_id')

  const existingStoryIds = new Set((existing || []).map(e => e.source_story_id))

  // Get organization ID
  const { data: orgs } = await supabase
    .from('organizations')
    .select('id')
    .limit(1)

  const orgId = orgs?.[0]?.id

  let inserted = 0
  for (const story of stories) {
    if (existingStoryIds.has(story.id)) continue

    const keyQuotes = (story.metadata as any)?.key_quotes as string[] | undefined
    if (!keyQuotes || keyQuotes.length === 0) continue

    // Determine theme from category
    const theme = story.category || story.story_type || 'community'
    const isElder = story.story_type === 'elder_wisdom' ||
      story.tags?.includes('cultural identity') ||
      story.category === 'culture'

    // Insert all key quotes (up to 3 per story)
    for (const quoteText of keyQuotes.slice(0, 3)) {
      if (quoteText.length < 15) continue // Skip very short quotes

      const { error: insertError } = await supabase
        .from('elder_quotes')
        .insert({
          organization_id: orgId,
          text: quoteText,
          speaker_name: story.quote_attribution || story.title?.split(':')[0]?.trim() || 'Community Member',
          speaker_role: isElder ? 'Elder' : 'Community Member',
          theme,
          category: story.category || 'general',
          is_validated: story.story_type === 'elder_wisdom',
          source_story_id: story.id,
          cultural_sensitivity: 'standard',
          permission_level: 'public',
        })

      if (!insertError) {
        inserted++
      }
    }
  }

  console.log(`  Elder quotes inserted: ${inserted}`)
  return inserted
}

// ══════════════════════════════════════════════════════════
// MAIN
// ══════════════════════════════════════════════════════════

async function main() {
  console.log('╔══════════════════════════════════════════════════════════╗')
  console.log('║   Annual Report Content Seeding                         ║')
  console.log('╚══════════════════════════════════════════════════════════╝')

  const quotesExtracted = await extractQuotesFromStories()
  const imagesAssigned = await assignFeaturedImages()
  const eligible = await markReportEligible()
  const servicesLinked = await linkStoriesToServices()
  const elderQuotes = await populateElderQuotes()

  // Final summary
  console.log('\n' + '='.repeat(60))
  console.log('SUMMARY')
  console.log('='.repeat(60))
  console.log(`  Quotes extracted from stories: ${quotesExtracted}`)
  console.log(`  Featured images assigned: ${imagesAssigned}`)
  console.log(`  Stories marked report-eligible: ${eligible}`)
  console.log(`  Stories linked to services: ${servicesLinked}`)
  console.log(`  Elder quotes populated: ${elderQuotes}`)

  // Check final counts
  const { count: totalStories } = await supabase
    .from('stories')
    .select('id', { count: 'exact', head: true })
    .eq('status', 'published')

  const { count: withQuotes } = await supabase
    .from('stories')
    .select('id', { count: 'exact', head: true })
    .eq('status', 'published')
    .not('quote_text', 'is', null)

  const { count: withImages } = await supabase
    .from('stories')
    .select('id', { count: 'exact', head: true })
    .eq('status', 'published')
    .not('featured_image_url', 'is', null)

  const { count: arEligible } = await supabase
    .from('stories')
    .select('id', { count: 'exact', head: true })
    .eq('annual_report_eligible', true)

  const { count: totalElderQuotes } = await supabase
    .from('elder_quotes')
    .select('id', { count: 'exact', head: true })

  console.log('\n  FINAL STATE:')
  console.log(`  Published stories: ${totalStories}`)
  console.log(`  With quotes: ${withQuotes}`)
  console.log(`  With featured images: ${withImages}`)
  console.log(`  AR eligible: ${arEligible}`)
  console.log(`  Elder quotes in DB: ${totalElderQuotes}`)
  console.log('='.repeat(60))
}

main().catch(console.error)
