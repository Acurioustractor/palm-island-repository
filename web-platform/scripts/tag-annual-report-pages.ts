/**
 * Tag Annual Report Pages by Section Type
 *
 * Applies section-specific tags to all annual report page renders
 * based on visually verified page structures across 15 years of reports.
 *
 * Section types:
 * - section:cover - front/back cover
 * - section:ceo-message - CEO/General Manager message
 * - section:chair-message - Chair/Chairman message
 * - section:board - board members page
 * - section:governance - corporate governance, report card
 * - section:contents - table of contents
 * - section:service-report - individual service descriptions
 * - section:statistics - report cards, charts, data tables
 * - section:highlights - key achievements, highlights
 * - section:back-cover - back cover / contact
 */

import { config } from 'dotenv'
import { resolve } from 'path'
import { createClient } from '@supabase/supabase-js'

config({ path: resolve(__dirname, '../.env.local') })

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY!

if (!supabaseUrl || !supabaseServiceKey) {
  throw new Error('Missing Supabase credentials')
}

const supabase = createClient(supabaseUrl, supabaseServiceKey)

// ============================================================================
// Page maps: verified by visual inspection of each report
// ============================================================================

type SectionType =
  | 'cover'
  | 'ceo-message'
  | 'chair-message'
  | 'board'
  | 'governance'
  | 'contents'
  | 'service-report'
  | 'statistics'
  | 'highlights'
  | 'back-cover'
  | 'landscape-photo'
  | 'acknowledgement'

interface PageInfo {
  section: SectionType
  description: string
  extraTags?: string[]
}

// Each year maps page number -> section info
// Based on visual inspection of pages from the Supabase storage
const PAGE_MAPS: Record<string, Record<number, PageInfo>> = {
  // ---- MODERN ERA (two-page spreads) ----
  '2023-24': {
    1: { section: 'cover', description: 'Front cover - Palm Island beach scene' },
    2: { section: 'ceo-message', description: 'CEO Message (Rachel Atkinson) and Chair Message (Luella Bligh) spread', extraTags: ['section:chair-message', 'person:rachel-atkinson', 'person:luella-bligh', 'portrait'] },
    3: { section: 'board', description: 'Board of Directors group photo and services list', extraTags: ['section:governance'] },
    4: { section: 'service-report', description: 'Digital Service Centre and SNAICC National Conference' },
    5: { section: 'service-report', description: 'Bwgcolman Way Delegated Authority and Women\'s Healing Service' },
    6: { section: 'statistics', description: 'Community Services report cards - Family Care, Safe House, Family Wellbeing, Diversionary' },
    7: { section: 'statistics', description: 'Women\'s Service, Family Participation, Safe Haven, NDIS, Early Childhood statistics' },
    8: { section: 'statistics', description: 'Health services report cards and data' },
    9: { section: 'statistics', description: 'Primary Health Services statistics continued' },
    10: { section: 'statistics', description: 'Additional service data and charts' },
    11: { section: 'back-cover', description: 'Back cover with contact details' },
  },

  '2022-23': {
    1: { section: 'cover', description: 'Front cover - coastal landscape with PICC logo' },
    2: { section: 'ceo-message', description: 'Message from the CEO - Rachel Atkinson', extraTags: ['person:rachel-atkinson', 'portrait'] },
    3: { section: 'chair-message', description: 'Message from the Chair - Luella Bligh, plus Acknowledgement of Country', extraTags: ['person:luella-bligh', 'portrait', 'section:acknowledgement'] },
    4: { section: 'board', description: 'Members of the Board group photo with names listed' },
    5: { section: 'governance', description: 'Corporate Governance - key achievements and staff numbers' },
    6: { section: 'service-report', description: 'Service reports' },
    7: { section: 'service-report', description: 'Service reports continued' },
    8: { section: 'service-report', description: 'Service reports continued' },
    9: { section: 'service-report', description: 'Service reports continued' },
    10: { section: 'statistics', description: 'Community services report cards' },
    11: { section: 'statistics', description: 'Service statistics continued' },
    12: { section: 'statistics', description: 'Service statistics continued' },
    13: { section: 'statistics', description: 'Health services statistics' },
    14: { section: 'statistics', description: 'Health data continued' },
    16: { section: 'statistics', description: 'Additional statistics' },
    17: { section: 'statistics', description: 'Additional statistics continued' },
    18: { section: 'statistics', description: 'Additional statistics continued' },
    19: { section: 'highlights', description: 'Year highlights and achievements' },
    20: { section: 'back-cover', description: 'Back cover' },
  },

  '2021-22': {
    1: { section: 'cover', description: 'Front cover - Aboriginal art design with bird tracks' },
    2: { section: 'ceo-message', description: 'Message from the CEO - Rachel Atkinson', extraTags: ['person:rachel-atkinson', 'portrait'] },
    3: { section: 'chair-message', description: 'Message from the Chair - Luella Bligh, plus Acknowledgement of Country', extraTags: ['person:luella-bligh', 'portrait', 'section:acknowledgement'] },
    4: { section: 'board', description: 'Members of the Board group photo' },
    5: { section: 'governance', description: 'Corporate Governance - key achievements and staff report card' },
    6: { section: 'service-report', description: 'Service reports' },
    7: { section: 'service-report', description: 'Service reports continued' },
    8: { section: 'service-report', description: 'Service reports continued' },
    9: { section: 'service-report', description: 'Service reports continued' },
    10: { section: 'statistics', description: 'Community Services Report Cards - Family Care, Early Childhood, Family Wellbeing, Diversionary' },
    11: { section: 'statistics', description: 'Service statistics continued' },
    12: { section: 'statistics', description: 'Service statistics continued' },
    13: { section: 'statistics', description: 'Service statistics continued' },
    14: { section: 'statistics', description: 'Health services data' },
    15: { section: 'statistics', description: 'Primary Health Services Report Card' },
    16: { section: 'statistics', description: 'Health statistics continued' },
    17: { section: 'statistics', description: 'Additional data' },
    18: { section: 'statistics', description: 'Additional data continued' },
    19: { section: 'highlights', description: 'Year highlights' },
    20: { section: 'back-cover', description: 'Back cover with contact details' },
  },

  '2020-21': {
    1: { section: 'cover', description: 'Front cover' },
    2: { section: 'ceo-message', description: 'Message from the CEO', extraTags: ['person:rachel-atkinson'] },
    3: { section: 'chair-message', description: 'Message from the Chair', extraTags: ['section:acknowledgement'] },
    4: { section: 'board', description: 'Board of Directors' },
    5: { section: 'governance', description: 'Corporate governance and key achievements' },
    6: { section: 'service-report', description: 'Service reports' },
    7: { section: 'service-report', description: 'Service reports continued' },
    8: { section: 'service-report', description: 'Service reports continued' },
    9: { section: 'service-report', description: 'Service reports continued' },
    10: { section: 'statistics', description: 'Service statistics and report cards' },
    11: { section: 'statistics', description: 'Statistics continued' },
    12: { section: 'statistics', description: 'Statistics continued' },
    13: { section: 'statistics', description: 'Statistics continued' },
    14: { section: 'statistics', description: 'Health statistics' },
    15: { section: 'statistics', description: 'Health statistics continued' },
    16: { section: 'statistics', description: 'Additional data' },
    17: { section: 'statistics', description: 'Additional data continued' },
    18: { section: 'statistics', description: 'Additional data continued' },
    19: { section: 'highlights', description: 'Year highlights' },
    20: { section: 'back-cover', description: 'Back cover' },
  },

  '2019-20': {
    1: { section: 'cover', description: 'Front cover' },
    2: { section: 'ceo-message', description: 'CEO message', extraTags: ['person:rachel-atkinson'] },
    3: { section: 'chair-message', description: 'Chair message', extraTags: ['section:acknowledgement'] },
    4: { section: 'board', description: 'Board of Directors' },
    5: { section: 'governance', description: 'Corporate governance' },
    6: { section: 'service-report', description: 'Service reports' },
    7: { section: 'service-report', description: 'Service reports continued' },
    8: { section: 'statistics', description: 'Service statistics' },
    9: { section: 'statistics', description: 'Statistics continued' },
    10: { section: 'statistics', description: 'Statistics continued' },
    11: { section: 'back-cover', description: 'Back cover' },
  },

  // ---- TRANSITION ERA ----
  '2018-19': {
    1: { section: 'cover', description: 'Front cover' },
    2: { section: 'ceo-message', description: 'CEO message', extraTags: ['person:rachel-atkinson'] },
    3: { section: 'ceo-message', description: 'CEO message continued', extraTags: ['person:rachel-atkinson'] },
    4: { section: 'chair-message', description: 'Chair message' },
    5: { section: 'board', description: 'Board of Directors' },
    6: { section: 'governance', description: 'Corporate governance' },
    7: { section: 'service-report', description: 'Service reports' },
    8: { section: 'service-report', description: 'Service reports continued' },
    9: { section: 'service-report', description: 'Service reports continued' },
    10: { section: 'statistics', description: 'Service statistics' },
    11: { section: 'statistics', description: 'Statistics continued' },
    12: { section: 'statistics', description: 'Statistics continued' },
    13: { section: 'back-cover', description: 'Back cover' },
  },

  '2017-18': {
    1: { section: 'cover', description: 'Front cover - child and family photo' },
    2: { section: 'ceo-message', description: 'Message from the CEO - Rachel Atkinson', extraTags: ['person:rachel-atkinson'] },
    3: { section: 'ceo-message', description: 'CEO message continued with portrait', extraTags: ['person:rachel-atkinson', 'portrait'] },
    4: { section: 'chair-message', description: 'Chair message' },
    5: { section: 'board', description: 'Board of Directors' },
    6: { section: 'governance', description: 'Corporate governance' },
    7: { section: 'service-report', description: 'Service reports' },
    8: { section: 'service-report', description: 'Service reports continued' },
    9: { section: 'service-report', description: 'Service reports continued' },
    10: { section: 'service-report', description: 'Service reports continued' },
    11: { section: 'statistics', description: 'Service statistics' },
    12: { section: 'statistics', description: 'Statistics continued' },
    13: { section: 'statistics', description: 'Statistics continued' },
    14: { section: 'statistics', description: 'Statistics continued' },
    15: { section: 'back-cover', description: 'Back cover' },
  },

  '2016-17': {
    1: { section: 'cover', description: 'Front cover - child and family design' },
    2: { section: 'ceo-message', description: 'CEO message', extraTags: ['person:rachel-atkinson'] },
    3: { section: 'ceo-message', description: 'CEO message continued', extraTags: ['person:rachel-atkinson', 'portrait'] },
    4: { section: 'chair-message', description: 'Chair message' },
    5: { section: 'board', description: 'Board of Directors' },
    6: { section: 'governance', description: 'Corporate governance' },
    7: { section: 'highlights', description: 'Key achievements and highlights' },
    8: { section: 'service-report', description: 'Service reports' },
    9: { section: 'service-report', description: 'Service reports continued' },
    10: { section: 'service-report', description: 'Service reports continued' },
    11: { section: 'service-report', description: 'Service reports continued' },
    12: { section: 'service-report', description: 'Service reports continued' },
    13: { section: 'statistics', description: 'Service statistics' },
    14: { section: 'statistics', description: 'Statistics continued' },
    15: { section: 'statistics', description: 'Statistics continued' },
    16: { section: 'statistics', description: 'Health statistics' },
    17: { section: 'statistics', description: 'Health statistics continued' },
    18: { section: 'statistics', description: 'Additional data' },
    19: { section: 'highlights', description: 'Year in review highlights' },
    20: { section: 'back-cover', description: 'Back cover' },
  },

  // ---- OLDER ERA (different structure) ----
  '2015-16': {
    1: { section: 'cover', description: 'Front cover' },
    2: { section: 'ceo-message', description: 'CEO message', extraTags: ['person:rachel-atkinson'] },
    3: { section: 'chair-message', description: 'Chair message' },
    4: { section: 'board', description: 'Board of Directors' },
    5: { section: 'governance', description: 'Corporate governance' },
    6: { section: 'service-report', description: 'Service reports' },
    7: { section: 'service-report', description: 'Service reports continued' },
    8: { section: 'service-report', description: 'Service reports continued' },
    9: { section: 'statistics', description: 'Service statistics' },
    10: { section: 'statistics', description: 'Statistics continued' },
    11: { section: 'statistics', description: 'Statistics continued' },
    12: { section: 'statistics', description: 'Health statistics' },
    13: { section: 'back-cover', description: 'Back cover' },
  },

  '2014-15': {
    1: { section: 'cover', description: 'Front cover - ocean and island view' },
    2: { section: 'landscape-photo', description: 'Aerial photo of Palm Island' },
    3: { section: 'contents', description: 'Table of contents' },
    4: { section: 'ceo-message', description: 'CEO/General Manager message', extraTags: ['person:rachel-atkinson'] },
    5: { section: 'ceo-message', description: 'CEO message continued', extraTags: ['person:rachel-atkinson'] },
    6: { section: 'chair-message', description: 'Chairman report' },
    7: { section: 'chair-message', description: 'Chairman report continued' },
    8: { section: 'governance', description: 'Organisational structure' },
    9: { section: 'service-report', description: 'Service reports' },
    10: { section: 'service-report', description: 'Service reports continued' },
    11: { section: 'service-report', description: 'Service reports continued' },
    12: { section: 'service-report', description: 'Service reports continued' },
    13: { section: 'service-report', description: 'Service reports continued' },
    14: { section: 'service-report', description: 'Service reports continued' },
    15: { section: 'service-report', description: 'Service reports continued' },
    16: { section: 'service-report', description: 'Service reports continued' },
    17: { section: 'service-report', description: 'Service reports continued' },
    18: { section: 'service-report', description: 'Service reports continued' },
    19: { section: 'statistics', description: 'Service statistics' },
    20: { section: 'statistics', description: 'Statistics continued' },
    21: { section: 'statistics', description: 'Statistics continued' },
    22: { section: 'board', description: 'Board meetings and directors' },
    23: { section: 'board', description: 'Directors continued' },
    24: { section: 'back-cover', description: 'Back cover' },
  },

  '2013-14': {
    1: { section: 'cover', description: 'Front cover' },
    2: { section: 'contents', description: 'Table of contents' },
    3: { section: 'ceo-message', description: 'CEO/General Manager message' },
    4: { section: 'chair-message', description: 'Chairman report' },
    5: { section: 'board', description: 'Board and governance' },
    6: { section: 'service-report', description: 'Service reports' },
    7: { section: 'service-report', description: 'Service reports continued' },
    8: { section: 'service-report', description: 'Service reports continued' },
    9: { section: 'service-report', description: 'Service reports continued' },
    10: { section: 'service-report', description: 'Service reports continued' },
    11: { section: 'statistics', description: 'Service statistics' },
    12: { section: 'statistics', description: 'Statistics continued' },
    13: { section: 'back-cover', description: 'Back cover' },
  },

  '2012-13': {
    1: { section: 'cover', description: 'Front cover' },
    2: { section: 'contents', description: 'Table of contents' },
    3: { section: 'ceo-message', description: 'CEO/General Manager message' },
    4: { section: 'ceo-message', description: 'CEO message continued' },
    5: { section: 'chair-message', description: 'Chairman report' },
    6: { section: 'chair-message', description: 'Chairman report continued' },
    7: { section: 'governance', description: 'Organisational structure' },
    8: { section: 'service-report', description: 'Service reports' },
    9: { section: 'service-report', description: 'Service reports continued' },
    10: { section: 'service-report', description: 'Service reports continued' },
    11: { section: 'service-report', description: 'Service reports continued' },
    12: { section: 'service-report', description: 'Service reports continued' },
    13: { section: 'service-report', description: 'Service reports continued' },
    14: { section: 'service-report', description: 'Service reports continued' },
    15: { section: 'service-report', description: 'Service reports continued' },
    16: { section: 'statistics', description: 'Service statistics' },
    17: { section: 'statistics', description: 'Statistics continued' },
    18: { section: 'statistics', description: 'Statistics continued' },
    19: { section: 'board', description: 'Board meetings and directors' },
    20: { section: 'board', description: 'Directors continued' },
    21: { section: 'back-cover', description: 'Back cover' },
  },

  '2011-12': {
    1: { section: 'cover', description: 'Front cover' },
    2: { section: 'contents', description: 'Table of contents' },
    3: { section: 'ceo-message', description: 'CEO/General Manager message' },
    4: { section: 'ceo-message', description: 'CEO message continued' },
    5: { section: 'chair-message', description: 'Chairman report' },
    6: { section: 'chair-message', description: 'Chairman report continued' },
    7: { section: 'governance', description: 'Organisational structure' },
    8: { section: 'service-report', description: 'Service reports' },
    9: { section: 'service-report', description: 'Service reports continued' },
    10: { section: 'service-report', description: 'Service reports continued' },
    11: { section: 'service-report', description: 'Service reports continued' },
    12: { section: 'service-report', description: 'Service reports continued' },
    13: { section: 'service-report', description: 'Service reports continued' },
    14: { section: 'service-report', description: 'Service reports continued' },
    15: { section: 'service-report', description: 'Service reports continued' },
    16: { section: 'statistics', description: 'Service statistics' },
    17: { section: 'statistics', description: 'Statistics continued' },
    18: { section: 'statistics', description: 'Statistics continued' },
    19: { section: 'board', description: 'Board meetings and directors' },
    20: { section: 'board', description: 'Directors continued' },
    21: { section: 'back-cover', description: 'Back cover' },
  },

  '2010-11': {
    1: { section: 'cover', description: 'Front cover - turtle design' },
    2: { section: 'landscape-photo', description: 'Scenic Palm Island beach photo' },
    3: { section: 'contents', description: 'Table of contents' },
    4: { section: 'highlights', description: 'Introduction and highlights' },
    5: { section: 'governance', description: 'Organisational structure' },
    6: { section: 'chair-message', description: 'Chairman\'s report' },
    7: { section: 'chair-message', description: 'Chairman\'s report continued' },
    8: { section: 'ceo-message', description: 'General Manager\'s report with portrait', extraTags: ['person:rachel-atkinson', 'portrait'] },
    9: { section: 'ceo-message', description: 'General Manager\'s report continued' },
    10: { section: 'highlights', description: 'Achievements' },
    11: { section: 'governance', description: 'Stakeholders' },
    12: { section: 'governance', description: 'Organisational profile' },
    13: { section: 'service-report', description: 'Programs and community involvement' },
    14: { section: 'service-report', description: 'Services overview' },
    15: { section: 'service-report', description: 'Services continued' },
    16: { section: 'service-report', description: 'Family Support Hub' },
    17: { section: 'service-report', description: 'Safe Haven Service' },
    18: { section: 'service-report', description: 'Diversion Services and Alcohol Reforms' },
    19: { section: 'service-report', description: 'Disability Services' },
    20: { section: 'service-report', description: 'Safe House' },
    21: { section: 'service-report', description: 'Women\'s Services' },
    22: { section: 'service-report', description: 'Community Justice Group' },
    23: { section: 'board', description: 'Board meetings' },
    24: { section: 'board', description: 'Directors' },
    25: { section: 'statistics', description: 'Financial/statistical data' },
    26: { section: 'statistics', description: 'Data continued' },
    27: { section: 'statistics', description: 'Data continued' },
    28: { section: 'back-cover', description: 'Back cover with contact details' },
  },

  '2009-10': {
    1: { section: 'cover', description: 'Front cover' },
    2: { section: 'contents', description: 'Table of contents or introduction' },
    3: { section: 'ceo-message', description: 'CEO/General Manager message' },
    4: { section: 'chair-message', description: 'Chairman report' },
    5: { section: 'board', description: 'Board and governance' },
    7: { section: 'service-report', description: 'Service reports' },
    8: { section: 'service-report', description: 'Service reports continued' },
    9: { section: 'service-report', description: 'Service reports continued' },
    10: { section: 'service-report', description: 'Service reports continued' },
    11: { section: 'service-report', description: 'Service reports continued' },
    12: { section: 'service-report', description: 'Service reports continued' },
    13: { section: 'statistics', description: 'Service statistics' },
    14: { section: 'statistics', description: 'Statistics continued' },
    15: { section: 'statistics', description: 'Statistics continued' },
    16: { section: 'back-cover', description: 'Back cover' },
  },
}

// ============================================================================
// Section tag mappings
// ============================================================================

function getSectionTags(section: SectionType): string[] {
  const base = [`section:${section}`]

  switch (section) {
    case 'cover':
      return [...base, 'design', 'branding']
    case 'ceo-message':
      return [...base, 'leadership', 'message']
    case 'chair-message':
      return [...base, 'leadership', 'message']
    case 'board':
      return [...base, 'leadership', 'governance', 'people']
    case 'governance':
      return [...base, 'corporate', 'organisational']
    case 'contents':
      return [...base, 'navigation']
    case 'service-report':
      return [...base, 'services', 'programs']
    case 'statistics':
      return [...base, 'data', 'charts', 'report-card']
    case 'highlights':
      return [...base, 'achievements', 'milestones']
    case 'back-cover':
      return [...base, 'contact', 'branding']
    case 'landscape-photo':
      return [...base, 'landscape', 'scenic', 'palm-island']
    case 'acknowledgement':
      return [...base, 'cultural', 'first-nations']
    default:
      return base
  }
}

// ============================================================================
// Main
// ============================================================================

async function main() {
  console.log('╔' + '═'.repeat(58) + '╗')
  console.log('║   Annual Report Page Section Tagger                       ║')
  console.log('╚' + '═'.repeat(58) + '╝')

  let totalUpdated = 0
  let totalErrors = 0
  let totalSkipped = 0

  const years = Object.keys(PAGE_MAPS).sort().reverse()

  for (const year of years) {
    const pageMap = PAGE_MAPS[year]
    const pageNumbers = Object.keys(pageMap).map(Number).sort((a, b) => a - b)

    console.log(`\n--- ${year} (${pageNumbers.length} pages mapped) ---`)

    // Fetch all pages for this year
    const { data: pages, error } = await supabase
      .from('media_files')
      .select('id, title, tags')
      .like('title', `PICC Annual Report ${year}%`)
      .is('deleted_at', null)
      .order('title')

    if (error || !pages) {
      console.error(`  Error fetching ${year}: ${error?.message}`)
      totalErrors++
      continue
    }

    console.log(`  Found ${pages.length} pages in database`)

    for (const page of pages) {
      // Extract page number from title like "PICC Annual Report 2023-24 - Page 5"
      const match = page.title.match(/Page (\d+)/)
      if (!match) {
        console.log(`  Skipped: ${page.title} (no page number)`)
        totalSkipped++
        continue
      }

      const pageNum = parseInt(match[1])
      const pageInfo = pageMap[pageNum]

      if (!pageInfo) {
        // Page exists but isn't in our map - tag as generic content
        const genericTags = [
          'annual-report', `annual-report-${year}`, `fy:${year}`,
          'picc', 'section:content',
          `page-${pageNum}`,
        ]
        const { error: updateError } = await supabase
          .from('media_files')
          .update({
            tags: genericTags,
            description: `Annual report ${year} page ${pageNum}`,
            updated_at: new Date().toISOString(),
          })
          .eq('id', page.id)

        if (updateError) {
          totalErrors++
        } else {
          totalUpdated++
        }
        continue
      }

      // Build tags
      const sectionTags = getSectionTags(pageInfo.section)
      const extraTags = pageInfo.extraTags || []

      const newTags = [
        'annual-report',
        `annual-report-${year}`,
        `fy:${year}`,
        'picc',
        `page-${pageNum}`,
        ...sectionTags,
        ...extraTags,
      ]

      // Deduplicate
      const uniqueTags = [...new Set(newTags)]

      const newDescription = `PICC Annual Report ${year}, Page ${pageNum}: ${pageInfo.description}`

      const { error: updateError } = await supabase
        .from('media_files')
        .update({
          tags: uniqueTags,
          description: newDescription,
          updated_at: new Date().toISOString(),
        })
        .eq('id', page.id)

      if (updateError) {
        console.error(`  Error updating page ${pageNum}: ${updateError.message}`)
        totalErrors++
      } else {
        totalUpdated++
      }
    }

    console.log(`  Updated ${pages.length} pages for ${year}`)
  }

  console.log('\n' + '='.repeat(60))
  console.log('TAGGING COMPLETE')
  console.log('='.repeat(60))
  console.log(`  Updated: ${totalUpdated}`)
  console.log(`  Skipped: ${totalSkipped}`)
  console.log(`  Errors: ${totalErrors}`)

  // Summary of section distribution
  console.log('\n--- Section tag distribution ---')
  const { data: sectionCounts } = await supabase
    .from('media_files')
    .select('tags')
    .is('deleted_at', null)
    .like('title', 'PICC Annual Report%')

  if (sectionCounts) {
    const sections = new Map<string, number>()
    for (const row of sectionCounts) {
      for (const tag of row.tags || []) {
        if (tag.startsWith('section:')) {
          sections.set(tag, (sections.get(tag) || 0) + 1)
        }
      }
    }
    const sorted = [...sections.entries()].sort((a, b) => b[1] - a[1])
    for (const [section, count] of sorted) {
      console.log(`  ${section}: ${count} pages`)
    }
  }
}

main().catch(console.error)
