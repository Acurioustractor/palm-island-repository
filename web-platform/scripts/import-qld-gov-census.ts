/**
 * Import Queensland Government Community History and ABS Census Data
 *
 * Adds structured knowledge entries from:
 * - Queensland Government Community Histories
 * - ABS Census 2021 data
 * - Government environmental and community programs
 */

// Load environment variables
import { config } from 'dotenv'
import { resolve } from 'path'
config({ path: resolve(__dirname, '../.env.local') })

import { createClient } from '@supabase/supabase-js'

// Supabase Client
function getSupabase() {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL
  const key = process.env.SUPABASE_SERVICE_ROLE_KEY

  if (!url || !key) {
    throw new Error('Missing Supabase credentials')
  }

  return createClient(url, key, {
    auth: { autoRefreshToken: false, persistSession: false }
  })
}

const knowledgeEntries = [
  {
    slug: 'qld-gov-palm-island-community-history',
    title: 'Queensland Government: Palm Island Community History',
    subtitle: 'Official government community history and cultural heritage',
    summary: 'Official Queensland Government community history covering Manbarra traditional ownership, Hull River relocation, forced removal history, and Bwgcolman identity representing 57+ language groups.',
    content: `# Palm Island Community History

## Traditional Owners
The **Manbarra people** are the traditional owners of Palm Island. For thousands of years, the Manbarra people have maintained a deep connection to the land, sea, and surrounding islands of this area.

## European Contact and Early History
Palm Island's modern history began with European contact and subsequent colonization. The island's current community has complex origins stemming from Queensland's colonial policies.

## Hull River to Palm Island (1918)
On **March 10, 1918**, a devastating cyclone destroyed the Hull River Mission near Mission Beach, resulting in approximately 100 deaths. Following this tragedy, the survivors were forcibly relocated to Palm Island starting in **April 1918**, marking a significant moment in the island's history.

## Forced Removal History
Under the **1897 Protection Act**, Palm Island became a destination for forced removals of Aboriginal and Torres Strait Islander peoples from across Queensland. This policy resulted in people from many different tribal groups and language groups being brought to the island against their will.

### Penal Settlement Characteristics
During much of the 20th century, Palm Island operated under restrictive policies that gave it characteristics of a penal settlement, with:
- Strict government control over residents' lives
- Limited freedom of movement
- Segregation from mainland society
- Superintendents with extensive powers over residents

## Bwgcolman Identity
Out of this history of forced removal and hardship emerged a new collective identity: **Bwgcolman**, meaning **"one people from many groups"** or **"many tribes, one people."**

### Language Diversity
Palm Island represents extraordinary cultural diversity, with residents descended from people of **57+ different language groups** across Queensland. This makes Palm Island one of the most linguistically diverse Aboriginal communities in Australia.

## Governance Evolution
**2005**: A significant milestone occurred when governance transitioned from an Aboriginal Council to an **Aboriginal Shire Council**, providing greater local government powers and self-determination for the community.

## Contemporary Recognition
Today, Palm Island is recognized both for its:
- **Traditional Manbarra heritage** - honoring the original custodians of the land
- **Bwgcolman identity** - celebrating the resilience and unity of descendants from many groups who now call Palm Island home

The community continues to work towards self-determination, cultural revival, and improved social and economic outcomes for all residents.

## Source
Queensland Government - First Nations Cultural Heritage
https://www.qld.gov.au/firstnations/cultural-awareness-heritage-arts/community-histories/community-histories-n-p/community-histories-palm-island`,
    entry_type: 'history',
    category: 'Community History',
    keywords: ['Palm Island', 'Manbarra', 'Bwgcolman', 'Queensland Government', 'Hull River', 'traditional owners', 'forced removal', '1897 Protection Act', 'community history'],
    structured_data: {
      source: 'Queensland Government - First Nations',
      url: 'https://www.qld.gov.au/firstnations/cultural-awareness-heritage-arts/community-histories/community-histories-n-p/community-histories-palm-island',
      traditional_owners: 'Manbarra people',
      language_groups: 57,
      bwgcolman_meaning: 'one people from many groups',
      hull_river_cyclone_date: '1918-03-10',
      governance_change: 2005
    },
    fiscal_year: null,
    location_type: 'palm_island',
    is_public: true,
    is_verified: true
  },
  {
    slug: 'abs-census-2021-palm-island',
    title: 'ABS Census 2021: Palm Island Statistics',
    subtitle: 'Official census data for Palm Island Aboriginal Shire',
    summary: 'Australian Bureau of Statistics Census 2021 data for Palm Island: population 2,138 (89.7% Indigenous), labour force 702, median weekly income $306, with detailed demographic and socioeconomic indicators.',
    content: `# Palm Island - Census 2021 Statistics

## Population Overview
- **Total Population**: 2,138 people
- **Indigenous Identification**: 1,918 people (89.7% of population)
  - Aboriginal: Majority
  - Torres Strait Islander: Significant population
  - Both Aboriginal and Torres Strait Islander: Present

## Labour Force Statistics
**Total in Labour Force**: 702 people

### Employment Status
- **Full-time employment**: 38.6%
- **Part-time employment**: 28.3%
- **Unemployed**: 29.1%
- **Participation rate**: Significantly engaged in workforce despite challenges

## Income Statistics
- **Median weekly personal income**: $306
- **Queensland average**: $660
- **Income gap**: $354 per week below state average
- **Context**: Reflects ongoing economic disparities in remote Indigenous communities

## Education Attainment

### School Completion
- **Year 12 or equivalent completion**: 15.0%
- **Reflects**: Historical barriers to education access and retention

### Post-Secondary Qualifications
- **Certificate III/IV**: 10.4%
- **Advanced Diploma/Diploma**: 2.6%
- **Bachelor degree or higher**: Lower percentage
- **Vocational training**: Growing through PICC programs and partnerships

## Housing and Dwellings
Census data includes information on:
- Dwelling types (separate houses, semi-detached, apartments)
- Dwelling tenure (owned, rented, social housing)
- Number of bedrooms
- Household composition

## Comparative Context
These statistics reflect the unique circumstances of Palm Island as:
- A remote Indigenous community
- A settlement with origins in forced removal policies
- A community working towards economic self-determination
- An area with ongoing infrastructure and service challenges

## Positive Indicators
Despite statistical challenges, the data shows:
- High Indigenous population retention (89.7%)
- Engaged labour force participation
- Growing skills through training programs
- Strong community identity and cohesion

## Data Notes
- Census date: **August 10, 2021**
- Local Government Area (LGA): **Palm Island Aboriginal Shire Council**
- Geographic classification: **Very Remote Australia**
- Indigenous Region: **Townsville - Thuringowa**

## Trends (Comparison with 2016 Census)
**2016 Population**: 2,455 people
**2021 Population**: 2,138 people
**Change**: Decrease of 317 people (-12.9%)

This population change may reflect:
- Outmigration for employment or education
- Improved census methodology
- Demographic changes in the community

## Using This Data
This census data provides essential context for:
- Service planning and delivery
- Economic development initiatives
- Education and training program design
- Health and wellbeing strategies
- Infrastructure investment decisions
- Community advocacy and representation

## Source
Australian Bureau of Statistics - Census 2021
https://abs.gov.au/census/find-census-data/quickstats/2021/LGA35790`,
    entry_type: 'statistic',
    category: 'Demographics',
    keywords: ['Palm Island', 'Census 2021', 'ABS', 'population', 'statistics', 'demographics', 'employment', 'education', 'income'],
    structured_data: {
      source: 'Australian Bureau of Statistics',
      census_year: 2021,
      census_date: '2021-08-10',
      url: 'https://abs.gov.au/census/find-census-data/quickstats/2021/LGA35790',
      population: 2138,
      indigenous_population: 1918,
      indigenous_percentage: 89.7,
      labour_force: 702,
      full_time_employment_pct: 38.6,
      part_time_employment_pct: 28.3,
      unemployment_pct: 29.1,
      median_weekly_income: 306,
      qld_median_weekly_income: 660,
      year_12_completion_pct: 15.0,
      cert_iii_iv_pct: 10.4,
      diploma_pct: 2.6,
      population_2016: 2455,
      population_change: -317
    },
    fiscal_year: null,
    location_type: 'palm_island',
    is_public: true,
    is_verified: true
  },
  {
    slug: 'minggamingga-land-sea-rangers',
    title: 'Minggamingga Land and Sea Rangers Program',
    subtitle: 'Combining traditional knowledge with environmental management',
    summary: 'Palm Islands Land and Sea Rangers protect Great Palm and Orpheus islands in the Great Barrier Reef World Heritage Area through monitoring, fire management, feral animal control, and cultural heritage preservation.',
    content: `# Minggamingga Land and Sea Rangers

## Overview
The **Minggamingga Land and Sea Rangers** program operates across the Palm Islands, combining traditional Indigenous knowledge with contemporary environmental management practices to protect Country.

## Territory
**Coverage Area:**
- Great Palm Island
- Orpheus Island
- Surrounding waters within the **Great Barrier Reef World Heritage Area**

## Key Activities

### Marine and Coastal Monitoring
**Partnership with Researchers:**
- Monitoring seagrass beds
- Coral reef health assessments
- Fish species surveys and population monitoring
- Beach cleanup operations
- Coastal ecosystem protection

### Fire Management
**Partnerships:**
- Queensland Parks and Wildlife Service (QPWS)
- Queensland Fire and Emergency Services (QFES)

**Activities:**
- Traditional burning practices
- Bushfire prevention and management
- Landscape management for biodiversity
- Cultural burning for land health

### Feral Animal Management
**Target Species:**
- Feral pigs
- Feral cats
- Feral horses
- Feral dogs
- Cane toads

**Purpose:**
- Protecting native wildlife
- Preserving ecosystems
- Reducing environmental damage
- Protecting cultural sites from damage

### Cultural Heritage Management
**Core Activities:**
- Surveying cultural heritage sites
- Recording cultural heritage data
- Managing and protecting significant sites
- Documenting traditional knowledge
- Sharing knowledge with younger generations

## Knowledge Transfer
A critical component of the Rangers program is **traditional knowledge sharing with youth**:
- Training young Palm Islanders in environmental management
- Passing down cultural knowledge about Country
- Building capacity for future ranger cohorts
- Connecting youth to culture and land

## Partnerships
The Minggamingga Rangers work with:
- Queensland Government
- Queensland Parks and Wildlife Service
- Queensland Fire and Emergency Services
- Research institutions
- Marine science organizations
- Great Barrier Reef Marine Park Authority

## Significance
This program represents:
- **Indigenous-led conservation**: Palm Island community managing their Country
- **Two-way knowledge**: Combining traditional and Western environmental practices
- **Economic opportunity**: Employment in caring for Country
- **Cultural connection**: Maintaining relationship with traditional lands and seas
- **Environmental protection**: Active stewardship of World Heritage Area

## Employment and Training
Rangers program provides:
- Full-time employment opportunities for Palm Islanders
- Training in environmental monitoring techniques
- Certifications in land management
- Cultural authority development
- Leadership opportunities

## Environmental Outcomes
Through ranger activities:
- Protected marine ecosystems in reef waters
- Managed fire regimes reducing uncontrolled bushfires
- Controlled feral animal populations threatening native species
- Preserved cultural heritage sites for future generations
- Maintained traditional ecological knowledge

## Source
Queensland Government - Land and Sea Rangers
https://www.qld.gov.au/environment/plants-animals/conservation/community/land-sea-rangers/locations/palm-islands`,
    entry_type: 'program',
    category: 'Environment',
    keywords: ['Palm Island', 'Land and Sea Rangers', 'Minggamingga', 'environmental management', 'traditional knowledge', 'Great Barrier Reef', 'cultural heritage', 'conservation'],
    structured_data: {
      source: 'Queensland Government - Department of Environment',
      url: 'https://www.qld.gov.au/environment/plants-animals/conservation/community/land-sea-rangers/locations/palm-islands',
      program_name: 'Minggamingga Land and Sea Rangers',
      coverage_areas: ['Great Palm Island', 'Orpheus Island', 'Great Barrier Reef World Heritage Area'],
      activities: [
        'Seagrass monitoring',
        'Coral reef monitoring',
        'Fish surveys',
        'Beach cleanups',
        'Fire management',
        'Feral animal control',
        'Cultural heritage surveying',
        'Traditional knowledge sharing'
      ],
      partners: ['QPWS', 'QFES', 'Research institutions']
    },
    fiscal_year: null,
    location_type: 'palm_island',
    is_public: true,
    is_verified: true
  }
]

async function main() {
  console.log('🚀 Starting Queensland Government & Census Data import...')

  const supabase = getSupabase()
  let inserted = 0
  let errors = 0

  for (const entry of knowledgeEntries) {
    try {
      const { data, error } = await supabase
        .from('knowledge_entries')
        .insert(entry)
        .select()

      if (error) {
        console.error(`❌ Failed to insert ${entry.slug}:`, error)
        errors++
      } else {
        console.log(`✅ Inserted: ${entry.slug}`)
        inserted++
      }
    } catch (err) {
      console.error(`❌ Error inserting ${entry.slug}:`, err)
      errors++
    }
  }

  console.log('\n' + '='.repeat(50))
  console.log(`📊 Import Complete`)
  console.log(`✅ Inserted: ${inserted}`)
  console.log(`❌ Errors: ${errors}`)
  console.log('='.repeat(50))

  if (errors > 0) {
    process.exit(1)
  }
}

main()
