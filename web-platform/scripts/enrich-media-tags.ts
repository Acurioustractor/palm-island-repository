/**
 * Enrich Media Tags - Three-in-one:
 *
 * 1. SERVICE-SPECIFIC TAGS for event photos
 *    - Daycare opening → service:child-care, service:early-childhood-services
 *    - Community visit → service tags based on documented activities
 *    - Photo shoot → service tags for elder/cultural programs
 *    - Spring festival → community event (no specific service)
 *    - Elders conference → service tags for elder programs
 *
 * 2. FACE TAGGING for known people
 *    - CEO (Rachel Atkinson) appears in: CEO message pages, board pages, some event photos
 *    - Chair (Luella Bligh) appears in: Chair message pages, board pages
 *    - Board members appear in: board pages
 *
 * 3. ANNUAL REPORT PAGE ENRICHMENT
 *    - CEO message pages → person:rachel-atkinson, role:ceo
 *    - Chair message pages → person:luella-bligh, role:chair
 *    - Board pages → all board member names
 *    - Service report pages → specific service tags
 */

import { config } from 'dotenv'
import { resolve } from 'path'
import { createClient } from '@supabase/supabase-js'

config({ path: resolve(__dirname, '../.env.local') })

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY!
const supabase = createClient(supabaseUrl, supabaseServiceKey)

// ── Helpers ──

async function addTagsToPhotos(
  filter: { tags?: string[]; titleLike?: string },
  newTags: string[],
  opts?: { faces?: string[]; description?: string }
): Promise<number> {
  let query = supabase
    .from('media_files')
    .select('id, tags, faces_detected')
    .is('deleted_at', null)

  if (filter.tags) query = query.contains('tags', filter.tags)
  if (filter.titleLike) query = query.like('title', filter.titleLike)

  const { data: photos, error } = await query
  if (error || !photos) {
    console.error(`  Query error: ${error?.message}`)
    return 0
  }

  let updated = 0
  for (const photo of photos) {
    const existing = photo.tags || []
    const merged = [...new Set([...existing, ...newTags])]
    if (merged.length === existing.length && !opts?.faces) continue

    const updateData: any = {
      tags: merged,
      updated_at: new Date().toISOString(),
    }

    if (opts?.faces) {
      const existingFaces = photo.faces_detected || []
      const mergedFaces = [...new Set([...existingFaces, ...opts.faces])]
      if (mergedFaces.length > existingFaces.length) {
        updateData.faces_detected = mergedFaces
      }
    }

    if (opts?.description) {
      updateData.description = opts.description
    }

    const { error: updateError } = await supabase
      .from('media_files')
      .update(updateData)
      .eq('id', photo.id)

    if (updateError) {
      console.error(`  Update error: ${updateError.message}`)
    } else {
      updated++
    }
  }
  return updated
}

// ══════════════════════════════════════════════════════════
// 1. SERVICE-SPECIFIC TAGS FOR EVENT PHOTOS
// ══════════════════════════════════════════════════════════

async function addServiceTagsToEvents() {
  console.log('\n╔══════════════════════════════════════════════╗')
  console.log('║  1. Service Tags for Event Photos            ║')
  console.log('╚══════════════════════════════════════════════╝')

  // Daycare Opening → early childhood and child care services
  let n = await addTagsToPhotos(
    { tags: ['event:daycare-opening-2025'] },
    ['service:early-childhood-services', 'service:child-care', 'service:family-wellbeing-centre'],
  )
  console.log(`  Daycare Opening → service tags: ${n} photos`)

  // Community Visit Jun 2025 → general community services
  n = await addTagsToPhotos(
    { tags: ['event:community-visit-jun-2025'] },
    ['service:community-hub', 'subject:daily-life', 'subject:on-country'],
  )
  console.log(`  Community Visit → service tags: ${n} photos`)

  // October Photo Shoot → elder/cultural programs
  n = await addTagsToPhotos(
    { tags: ['event:photo-shoot-oct-2025'] },
    ['service:social-emotional-wellbeing', 'subject:culture', 'subject:elders-program'],
  )
  console.log(`  Photo Shoot → service tags: ${n} photos`)

  // Spring Festival → community event, youth programs
  n = await addTagsToPhotos(
    { tags: ['event:spring-festival-2025'] },
    ['service:youth-services', 'subject:community-event', 'subject:celebration'],
  )
  console.log(`  Spring Festival → service tags: ${n} photos`)

  // Elders Conference → elder services
  n = await addTagsToPhotos(
    { tags: ['event:elders-conference'] },
    ['service:social-emotional-wellbeing', 'subject:elders-program', 'subject:naidoc'],
  )
  console.log(`  Elders Conference → service tags: ${n} photos`)
}

// ══════════════════════════════════════════════════════════
// 2. FACE TAGGING FOR KNOWN PEOPLE
// ══════════════════════════════════════════════════════════

async function faceTagKnownPeople() {
  console.log('\n╔══════════════════════════════════════════════╗')
  console.log('║  2. Face Tagging for Known People            ║')
  console.log('╚══════════════════════════════════════════════╝')

  // Board members (from existing data)
  const BOARD_MEMBERS = [
    'Luella Bligh', 'Rhonda Phillips', 'Allan Palm Island',
    'Matthew Lindsay', 'Harriet Hulthen', 'Raymond Palmer',
  ]

  // Tag all board-tagged photos with board member faces
  let n = await addTagsToPhotos(
    { tags: ['board'] },
    [
      'person:luella-bligh', 'person:rhonda-phillips', 'person:allan-palm-island',
      'person:matthew-lindsay', 'person:harriet-hulthen', 'person:raymond-palmer',
    ],
    { faces: BOARD_MEMBERS },
  )
  console.log(`  Board photos → all board members: ${n} photos`)

  // CEO pages in annual reports
  n = await addTagsToPhotos(
    { tags: ['annual-report', 'section:ceo-message'] },
    ['person:rachel-atkinson', 'role:ceo'],
    { faces: ['Rachel Atkinson'] },
  )
  console.log(`  CEO message pages → Rachel Atkinson: ${n} pages`)

  // Chair pages in annual reports
  n = await addTagsToPhotos(
    { tags: ['annual-report', 'section:chair-message'] },
    ['person:luella-bligh', 'role:chair'],
    { faces: ['Luella Bligh'] },
  )
  console.log(`  Chair message pages → Luella Bligh: ${n} pages`)

  // Board pages in annual reports
  n = await addTagsToPhotos(
    { tags: ['annual-report', 'section:board'] },
    [
      'person:luella-bligh', 'person:rhonda-phillips', 'person:allan-palm-island',
      'person:matthew-lindsay', 'person:harriet-hulthen', 'person:raymond-palmer',
      'role:board-member',
    ],
    { faces: BOARD_MEMBERS },
  )
  console.log(`  Board pages → all board members: ${n} pages`)
}

// ══════════════════════════════════════════════════════════
// 3. ANNUAL REPORT PAGE ENRICHMENT
// ══════════════════════════════════════════════════════════

// Map of service report pages to specific services
// Based on common PICC service order across annual reports
const SERVICE_PAGE_KEYWORDS: { keyword: string; serviceTags: string[] }[] = [
  { keyword: 'health', serviceTags: ['service:health-services', 'service:bwgcolman-healing'] },
  { keyword: 'healing', serviceTags: ['service:health-services', 'service:bwgcolman-healing'] },
  { keyword: 'safe haven', serviceTags: ['service:safe-haven'] },
  { keyword: 'safe house', serviceTags: ['service:safe-house'] },
  { keyword: 'family care', serviceTags: ['service:family-care'] },
  { keyword: 'family wellbeing', serviceTags: ['service:family-wellbeing-centre'] },
  { keyword: 'child', serviceTags: ['service:child-care', 'service:early-childhood-services'] },
  { keyword: 'early childhood', serviceTags: ['service:early-childhood-services'] },
  { keyword: 'youth', serviceTags: ['service:youth-services'] },
  { keyword: 'justice', serviceTags: ['service:community-justice-group'] },
  { keyword: 'diversionary', serviceTags: ['service:diversionary-services'] },
  { keyword: 'housing', serviceTags: ['service:housing-services'] },
  { keyword: 'ndis', serviceTags: ['service:ndis'] },
  { keyword: 'digital', serviceTags: ['service:digital-service-centre'] },
  { keyword: 'women', serviceTags: ['service:womens-service', 'service:womens-healing'] },
  { keyword: 'domestic', serviceTags: ['service:specialist-dfv'] },
  { keyword: 'enterprise', serviceTags: ['service:social-enterprises'] },
  { keyword: 'economic', serviceTags: ['service:economic-development'] },
  { keyword: 'elder', serviceTags: ['service:social-emotional-wellbeing', 'subject:elders-program'] },
  { keyword: 'sewb', serviceTags: ['service:social-emotional-wellbeing'] },
  { keyword: 'wellbeing', serviceTags: ['service:social-emotional-wellbeing'] },
  { keyword: 'blue card', serviceTags: ['service:blue-card-liaison'] },
  { keyword: 'telstra', serviceTags: ['service:telstra-call-centre'] },
  { keyword: 'community hub', serviceTags: ['service:community-hub'] },
]

async function enrichAnnualReportPages() {
  console.log('\n╔══════════════════════════════════════════════╗')
  console.log('║  3. Annual Report Page Enrichment            ║')
  console.log('╚══════════════════════════════════════════════╝')

  // Get all annual report service-report pages
  const { data: servicePages, error } = await supabase
    .from('media_files')
    .select('id, title, tags, description')
    .contains('tags', ['annual-report', 'section:service-report'])
    .is('deleted_at', null)

  if (error || !servicePages) {
    console.error(`  Error: ${error?.message}`)
    return
  }

  console.log(`  Found ${servicePages.length} service report pages`)

  let enriched = 0
  for (const page of servicePages) {
    const titleLower = (page.title || '').toLowerCase()
    const descLower = (page.description || '').toLowerCase()
    const searchText = titleLower + ' ' + descLower

    const newTags: string[] = []
    for (const rule of SERVICE_PAGE_KEYWORDS) {
      if (searchText.includes(rule.keyword)) {
        newTags.push(...rule.serviceTags)
      }
    }

    if (newTags.length === 0) continue

    const existing = page.tags || []
    const merged = [...new Set([...existing, ...newTags])]
    if (merged.length === existing.length) continue

    const { error: updateError } = await supabase
      .from('media_files')
      .update({ tags: merged, updated_at: new Date().toISOString() })
      .eq('id', page.id)

    if (!updateError) enriched++
  }

  console.log(`  Service pages enriched with service tags: ${enriched}`)

  // Add cover page tags
  let n = await addTagsToPhotos(
    { tags: ['annual-report', 'section:cover'] },
    ['subject:branding', 'content:design'],
  )
  console.log(`  Cover pages enriched: ${n}`)

  // Statistics pages
  n = await addTagsToPhotos(
    { tags: ['annual-report', 'section:statistics'] },
    ['subject:data', 'content:infographic'],
  )
  console.log(`  Statistics pages enriched: ${n}`)

  // Governance pages
  n = await addTagsToPhotos(
    { tags: ['annual-report', 'section:governance'] },
    ['subject:corporate-governance', 'subject:compliance'],
  )
  console.log(`  Governance pages enriched: ${n}`)
}

// ══════════════════════════════════════════════════════════
// MAIN
// ══════════════════════════════════════════════════════════

async function main() {
  console.log('╔══════════════════════════════════════════════════════════╗')
  console.log('║   Media Tag Enrichment - Services + Faces + AR Pages    ║')
  console.log('╚══════════════════════════════════════════════════════════╝')

  await addServiceTagsToEvents()
  await faceTagKnownPeople()
  await enrichAnnualReportPages()

  // Final stats
  console.log('\n' + '='.repeat(60))
  console.log('TAG DISTRIBUTION SUMMARY')
  console.log('='.repeat(60))

  const { data: allMedia } = await supabase
    .from('media_files')
    .select('tags, faces_detected')
    .is('deleted_at', null)

  if (allMedia) {
    const tagCounts = new Map<string, number>()
    let withFaces = 0

    for (const row of allMedia) {
      for (const tag of (row.tags || [])) {
        if (tag.startsWith('service:') || tag.startsWith('person:') || tag.startsWith('role:') || tag.startsWith('subject:')) {
          tagCounts.set(tag, (tagCounts.get(tag) || 0) + 1)
        }
      }
      if (row.faces_detected && row.faces_detected.length > 0) withFaces++
    }

    const sorted = [...tagCounts.entries()].sort((a, b) => b[1] - a[1])

    console.log('\n  Service tags:')
    for (const [tag, count] of sorted.filter(([t]) => t.startsWith('service:'))) {
      console.log(`    ${tag}: ${count}`)
    }

    console.log('\n  Person tags:')
    for (const [tag, count] of sorted.filter(([t]) => t.startsWith('person:') || t.startsWith('role:'))) {
      console.log(`    ${tag}: ${count}`)
    }

    console.log('\n  Subject tags:')
    for (const [tag, count] of sorted.filter(([t]) => t.startsWith('subject:')).slice(0, 15)) {
      console.log(`    ${tag}: ${count}`)
    }

    console.log(`\n  Photos with faces_detected: ${withFaces}`)
    console.log(`  Total media files: ${allMedia.length}`)
  }

  console.log('\n' + '='.repeat(60))
  console.log('COMPLETE')
  console.log('='.repeat(60))
}

main().catch(console.error)
