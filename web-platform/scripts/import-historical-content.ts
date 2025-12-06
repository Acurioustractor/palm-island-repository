/**
 * Import Historical Content for Palm Island
 *
 * Adds structured knowledge entries for major historical events:
 * - Hull River Mission and 1918 Cyclone
 * - 1957 Palm Island Strike
 * - Traditional Manbarra ownership
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
    slug: 'hull-river-mission-1918-cyclone',
    title: 'Hull River Mission and the 1918 Cyclone',
    subtitle: 'The tragedy that led to Palm Island\'s founding',
    summary: 'On March 10, 1918, a devastating cyclone destroyed Hull River Mission near Mission Beach, killing approximately 100 people. Survivors were forcibly relocated to Palm Island in April 1918, marking the beginning of Palm Island as a settlement.',
    content: `# Hull River Mission and the 1918 Cyclone

## Hull River Aboriginal Settlement
The Hull River Aboriginal Settlement was established in **1914** near Mission Beach in Far North Queensland. The mission was created as part of Queensland's policy of segregating Aboriginal people onto government-controlled reserves.

## The 1918 Cyclone Disaster

### March 10, 1918
On this day, a powerful cyclone struck the Hull River Mission with devastating force. The cyclone and accompanying storm surge caused massive destruction and loss of life.

### Casualties
Approximately **100 people** died in the disaster, making it one of the deadliest cyclones in Queensland's history. The victims included Aboriginal residents of the mission and staff members.

### Destruction
The cyclone completely destroyed the mission infrastructure:
- Buildings demolished
- Crops destroyed
- Essential supplies lost
- Safe shelter eliminated

## Forced Relocation to Palm Island

### April 1918
Following the cyclone disaster, the Queensland Government made the decision to relocate the surviving Hull River Mission residents to Palm Island.

**Starting in April 1918**, survivors began arriving on Palm Island, marking the beginning of the island's use as a major Aboriginal settlement and reserve.

### Significance
This forced relocation is a foundational moment in Palm Island's history:
- **Hull River survivors** formed part of the original Palm Island community
- The trauma of the cyclone and forced relocation affected generations
- Connection between Hull River descendants and Palm Island persists to this day
- Many Palm Island families trace their ancestry to Hull River

## Historical Context

### Government Policy
The relocation occurred under Queensland's **1897 Protection Act**, which gave authorities extensive powers to control Aboriginal people's lives and movement. Palm Island became a central location where Aboriginal people from across Queensland were forcibly relocated.

### Mission to Reserve
What began as emergency relocation after a natural disaster became part of Queensland's broader policy of:
- Segregation of Aboriginal peoples
- Government control over Aboriginal lives
- Forced separation from traditional lands
- Concentration of different tribal groups in one location

## Legacy

### Cultural Connections
Hull River descendants on Palm Island maintain:
- Family stories about the cyclone
- Memories of Hull River country
- Cultural practices from the Mission Beach region
- Ongoing connection to traditional lands

### Bwgcolman Identity
The Hull River survivors joined people from many other tribal groups on Palm Island, contributing to the development of the **Bwgcolman identity** - "one people from many groups."

### Commemoration
The 1918 cyclone and Hull River connection remain important in Palm Island's collective memory, representing both tragedy and resilience.

## Primary Sources
- Queensland State Archives hold records of Hull River Mission
- Trove newspaper archives document the 1918 cyclone
- Oral histories from Hull River descendants preserve family memories
- Mission Beach and Palm Island communities share this history

## Source
Multiple historical sources including Wikipedia, Queensland State Archives, and historical research`,
    entry_type: 'history',
    category: 'Historical Events',
    keywords: ['Hull River', 'Palm Island', '1918 cyclone', 'Mission Beach', 'forced relocation', 'historical tragedy'],
    structured_data: {
      source: 'Multiple historical sources',
      event_date: '1918-03-10',
      event_type: 'natural disaster',
      casualties: 100,
      relocation_start: '1918-04',
      origin_location: 'Hull River Mission, Mission Beach',
      destination: 'Palm Island'
    },
    date_from: '1918-03-10',
    date_to: '1918-04-30',
    date_precision: 'month',
    fiscal_year: null,
    location_type: 'palm_island',
    is_public: true,
    is_verified: true
  },
  {
    slug: 'palm-island-strike-1957',
    title: 'The 1957 Palm Island Strike',
    subtitle: 'Five days that changed history - The Magnificent Seven',
    summary: 'On June 10, 1957, Palm Island workers launched a historic 5-day strike against Superintendent Roy Bartlam\'s oppressive regime, led by Willie Thaiday, Albie Geia, Eric Lymburner, Sonny Sibley, Bill Congoo, George Watson, and Gordon Tapau. Now commemorated annually on June 9.',
    content: `# The 1957 Palm Island Strike

## Overview
The Palm Island Strike of 1957 stands as one of the most significant acts of resistance in Australian Aboriginal history. For five days in June 1957, the workers of Palm Island withdrew their labor in protest against the oppressive regime of Superintendent Roy Bartlam.

## The Strike

### Declaration: June 10, 1957
The strike was formally declared on **June 10, 1957**, marking the beginning of organized mass resistance to the harsh conditions on Palm Island.

### Duration
The strike lasted **five days** - from June 10-14, 1957 - during which Palm Island workers refused to work under the existing conditions.

## The Magnificent Seven

The strike was led by seven courageous men, remembered as **"The Magnificent Seven"**:

1. **Willie Thaiday**
2. **Albie Geia**
3. **Eric Lymburner**
4. **Sonny Sibley**
5. **Bill Congoo**
6. **George Watson**
7. **Gordon Tapau**

These men showed extraordinary courage in standing up to government authority at a time when Aboriginal people had virtually no legal rights and faced severe consequences for resistance.

## Context: Superintendent Roy Bartlam's Regime

### Oppressive Conditions
Under Superintendent Roy Bartlam, Palm Island operated under extremely harsh conditions:
- Strict control over residents' lives
- Limited freedom of movement
- Poor working conditions
- Inadequate housing and services
- Authoritarian rule with little accountability

### No Legal Rights
At this time, Aboriginal people on Palm Island:
- Could not vote
- Could not leave without permission
- Could not manage their own wages
- Faced strict punishment for minor infractions
- Had no legal recourse against mistreatment

## The Strike Demands
Workers demanded:
- Better working conditions
- Fair treatment
- Improved living standards
- Respect for human dignity
- End to arbitrary punishments

## Government Response

### Forced Removal
Rather than address the legitimate grievances, the Queensland Government responded with harsh retribution:
- Strike leaders and their families were forcibly removed from Palm Island
- Families were separated and sent to different locations
- No improvements were made to conditions
- The action was intended to intimidate others from resisting

### Punitive Measures
The government's response demonstrated:
- Refusal to recognize Aboriginal people's rights
- Use of forced removal as punishment for protest
- Prioritization of control over justice
- Continuation of oppressive policies

## Historical Significance

### First Major Strike
The 1957 Palm Island Strike was one of the first major organized Aboriginal strikes in Australian history, predating the famous Wave Hill Walk-Off by nearly a decade.

### Inspiration for Change
While the immediate outcome appeared to be defeat, the strike:
- Demonstrated Aboriginal people's capacity for organized resistance
- Showed courage in the face of overwhelming power
- Inspired future generations of activists
- Contributed to growing awareness of Aboriginal rights

### Part of Broader Movement
The strike occurred during a crucial period:
- Pre-1967 Referendum (Aboriginal people not yet counted in census)
- Growing international awareness of Indigenous rights
- Emergence of Aboriginal political consciousness
- Beginning of the modern Aboriginal rights movement

## Modern Commemoration

### June 9 Public Holiday
Palm Island now commemorates the strike annually on **June 9** (the day before the strike's anniversary) as a public holiday.

### Recognition
- Community remembers the courage of The Magnificent Seven
- Educational programs teach strike history to young people
- Annual events honor the strikers and their families
- The strike is recognized as a pivotal moment in Palm Island's history

### Living Memory
Descendants of The Magnificent Seven still live on Palm Island, keeping the memory and significance of the strike alive for new generations.

## Legacy

### Symbol of Resistance
The 1957 Strike symbolizes:
- Aboriginal resistance to oppression
- Courage in the face of overwhelming odds
- Community solidarity
- Demand for human dignity and rights
- Willingness to sacrifice for future generations

### Continuing Relevance
The strike's themes remain relevant:
- Self-determination
- Community control
- Fair treatment
- Recognition of rights
- Standing up against injustice

## Documentary Record
The strike is documented in:
- "Protected: The Truth About Palm Island" (1975 documentary)
- Oral histories from strike participants
- Government archival records
- Academic research
- Community memory

## Sources
- Australian Trade Union Institute historical article
- Queensland Government 60th Anniversary Statement
- QTU Journal - Remembering the 1957 Palm Island Strike
- Oral histories and community records

## Source
Multiple historical sources including labor history archives and community records`,
    entry_type: 'event',
    category: 'Historical Events',
    keywords: ['1957 strike', 'Palm Island', 'The Magnificent Seven', 'Willie Thaiday', 'Albie Geia', 'Aboriginal rights', 'resistance', 'labor history'],
    structured_data: {
      source: 'Multiple historical sources',
      event_date: '1957-06-10',
      event_end_date: '1957-06-14',
      event_type: 'strike',
      duration_days: 5,
      leaders: ['Willie Thaiday', 'Albie Geia', 'Eric Lymburner', 'Sonny Sibley', 'Bill Congoo', 'George Watson', 'Gordon Tapau'],
      commemoration_date: '06-09',
      public_holiday: true,
      superintendent: 'Roy Bartlam'
    },
    date_from: '1957-06-10',
    date_to: '1957-06-14',
    date_precision: 'exact',
    fiscal_year: null,
    location_type: 'palm_island',
    is_public: true,
    is_verified: true
  },
  {
    slug: 'manbarra-traditional-owners',
    title: 'Manbarra People: Traditional Owners of Palm Island',
    subtitle: 'Thousands of years of connection to Country',
    summary: 'The Manbarra people are the traditional owners of Palm Island (and Magnetic Island), with a continuous connection to Country spanning over 10,000 years, maintaining cultural practices, language, and spiritual connection to the land and sea.',
    content: `# Manbarra People: Traditional Owners

## Who Are the Manbarra?
The **Manbarra people** are the traditional custodians and owners of Palm Island, Magnetic Island, and the surrounding waters. Their connection to this Country spans thousands of years of continuous occupation and cultural practice.

## Traditional Territory

### Islands and Waters
The Manbarra people's traditional lands include:
- **Palm Islands** (Great Palm Island and surrounding smaller islands)
- **Magnetic Island** (Yunbenun)
- **Surrounding sea country** and reefs
- **Coastal areas** of the mainland

### Gurrumbilbarra
The traditional territory is known as **"Gurrumbilbarra"** in the Manbarra language.

## Ancient History

### Archaeological Evidence
Archaeological sites in the region have been dated to over **10,000 years**, demonstrating the long and continuous occupation of the area by Aboriginal people.

### Pre-European Population
At the time of European contact in 1770, the Manbarra population was estimated at approximately **200 people**, living sustainably on the islands and managing the land through traditional practices.

## Cultural Connection to Country

### Spiritual Connection
The Manbarra people maintain deep spiritual connections to:
- Sacred sites throughout the islands
- Totemic relationships with animals and plants
- Dreamtime stories specific to the landscape
- Ceremonial grounds and places of significance

### Creation Stories
**The Rainbow Serpent/Carpet Snake (Gabul)** features prominently in Manbarra creation stories, connecting the people to the land through spiritual and cultural narratives passed down through generations.

### Land Management
Traditional Manbarra land management practices included:
- Controlled burning for landscape management
- Sustainable hunting and gathering
- Protection of sacred sites
- Seasonal movement patterns
- Resource conservation

## Language and Culture

### Manbarra Language
The Manbarra people had their own distinct language, part of the broader Aboriginal language family of North Queensland. Language revitalization efforts continue today to preserve and teach Manbarra words and cultural knowledge.

### Connection to Wulgurukaba
The Manbarra people are closely related to the **Wulgurukaba people** (meaning "canoe people"), who are traditional owners of Magnetic Island, the Palm Islands, and parts of the Townsville region.

## Impact of Colonization

### Dispossession
European colonization brought devastating changes:
- Loss of traditional lands
- Disruption of cultural practices
- Introduction of diseases
- Violent conflicts
- Forced removal to missions and reserves

### Survival and Resilience
Despite these challenges, Manbarra people:
- Maintained cultural knowledge
- Preserved stories and traditions
- Continued connection to Country
- Passed knowledge to younger generations
- Advocated for recognition of rights

## Contemporary Manbarra Community

### Recognition as Traditional Owners
Today, the Manbarra people are formally recognized as the traditional owners of Palm Island. This recognition acknowledges:
- Continuous connection to Country
- Cultural authority over the land
- Right to be consulted on land use
- Custodial responsibility for cultural sites

### Cultural Revival
The Manbarra community is actively engaged in:
- Language preservation and teaching
- Cultural practice revival
- Educating younger generations
- Protecting sacred sites
- Sharing knowledge appropriately

### Dual Identity
Palm Island today honors both:
- **Manbarra traditional ownership** - recognizing the original custodians
- **Bwgcolman identity** - acknowledging the community formed from many groups through forced relocation

This dual acknowledgment respects both the ancient heritage of the traditional owners and the more recent history of the diverse community.

## Land and Sea Caring

### Minggamingga Rangers
Manbarra traditional knowledge informs the work of the **Minggamingga Land and Sea Rangers**, who:
- Apply traditional burning practices
- Protect cultural heritage sites
- Manage Country using both Indigenous and Western knowledge
- Care for sacred sites and significant areas
- Share knowledge with youth

### Cultural Authority
Manbarra Elders and knowledge holders provide:
- Guidance on cultural protocols
- Permission for use of cultural knowledge
- Teaching about significant sites
- Leadership in cultural matters
- Connection to ancient traditions

## Acknowledgment
Any engagement with Palm Island must begin with acknowledgment of the Manbarra people as traditional owners, recognizing their:
- Ancient and ongoing connection to Country
- Cultural authority
- Ancestral heritage
- Custodial responsibility
- Right to self-determination

## Continuing Connection
The Manbarra people's connection to Palm Island and surrounding Country remains strong:
- Elders hold traditional knowledge
- Cultural practices continue
- Language is being revitalized
- Younger generations learn traditional ways
- Spiritual connection to land remains central

## Source
Multiple sources including Queensland State Library, Wikipedia, and cultural heritage records`,
    entry_type: 'history',
    category: 'Traditional Owners',
    keywords: ['Manbarra', 'traditional owners', 'Palm Island', 'Indigenous history', 'Wulgurukaba', 'Gurrumbilbarra', 'cultural heritage'],
    structured_data: {
      source: 'Multiple cultural heritage sources',
      traditional_owners: 'Manbarra people',
      also_known_as: 'Wulgurukaba',
      territory_name: 'Gurrumbilbarra',
      archaeological_age_years: 10000,
      pre_contact_population: 200,
      contact_year: 1770,
      traditional_lands: ['Palm Islands', 'Magnetic Island', 'Surrounding sea country']
    },
    date_from: null,
    date_to: null,
    date_precision: null,
    fiscal_year: null,
    location_type: 'palm_island',
    is_public: true,
    is_verified: true
  }
]

async function main() {
  console.log('🚀 Starting Historical Content import...')

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
