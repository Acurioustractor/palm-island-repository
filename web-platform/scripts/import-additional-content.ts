/**
 * Import Additional Historical and Service Content
 *
 * Adds:
 * - 2004 Mulrunji death in custody and aftermath
 * - Additional PICC services (Youth, Family Wellbeing, Community Justice)
 * - Early childhood services details
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
    slug: 'mulrunji-death-in-custody-2004',
    title: '2004 Death in Custody: Cameron "Mulrunji" Doomadgee',
    subtitle: 'A tragedy that sparked national reckoning and $30M settlement',
    summary: 'On November 19, 2004, Cameron "Mulrunji" Doomadgee, 36, died in Palm Island police custody with massive internal injuries. The community uprising led by Lex Wotton resulted in a 2018 class action settlement of $30 million to 447 community members.',
    content: `# 2004 Death in Custody: Cameron "Mulrunji" Doomadgee

## The Death: November 19, 2004

On **November 19, 2004**, Cameron "Mulrunji" Doomadgee, a 36-year-old Palm Island man, died while in police custody at the Palm Island police station.

### Circumstances
Mulrunji was arrested by Senior Sergeant Chris Hurley for public nuisance. Within 45 minutes of being taken into custody, he was found dead in his cell.

### Autopsy Findings
The autopsy revealed devastating injuries:
- **Four broken ribs**
- **Ruptured liver** (described as "cleaved in two")
- **Ruptured portal vein**
- Injuries consistent with severe blunt force trauma

The pathologist stated the injuries were similar to those from a high-speed car crash or a fall from a great height.

## Community Response

### November 26, 2004 - Community Uprising
One week after Mulrunji's death, the Palm Island community, led by **Lex Wotton**, staged a protest that escalated into an uprising.

**What Happened:**
- Palm Island police station burned
- Courthouse burned
- Police residential quarters burned
- Community members expressed decades of frustration and grief
- Queensland Government declared a state of emergency

### Police Response
A massive police presence was deployed to Palm Island, with riot police arriving from the mainland. The response was criticized as heavy-handed and militaristic.

## Legal Proceedings

### Criminal Case Against Chris Hurley
**Senior Sergeant Chris Hurley** was charged with manslaughter and assault - the first time in Australian history a police officer was charged over an Aboriginal death in custody.

**Outcome:**
- **June 20, 2007**: Found **not guilty** by an all-white jury in Townsville
- Decision caused outrage in Indigenous communities across Australia
- Seen as failure of justice system

### Charges Against Lex Wotton
Lex Wotton was arrested and charged with riot and arson for his role in leading the community uprising.

**Outcome:**
- Found guilty of rioting
- Served prison time
- Later became a symbol of Aboriginal resistance

## Justice Victories

### 2018 Class Action Settlement
After years of legal battles, the community achieved significant victories:

**$30 Million Settlement**
- Paid to **447 Palm Island community members**
- Compensated for unlawful police actions during the 2004 uprising response
- Acknowledged excessive force and wrongful arrests
- One of the largest settlements of its kind in Australian history

### Lex Wotton Racial Discrimination Case
**2016**: Federal Court ruled Queensland Police racially discriminated against Lex Wotton

**Compensation:**
- **$220,000** awarded to Lex Wotton
- Recognition that his treatment was motivated by racial discrimination
- Vindication of his claims of injustice

## National Significance

### Death in Custody Statistics
Mulrunji's death highlighted the ongoing crisis of Aboriginal deaths in custody in Australia:
- Over 470 Aboriginal deaths in custody since 1991 Royal Commission
- Continuing failure to implement Royal Commission recommendations
- Systemic issues in police accountability

### 1991 Royal Commission
The **Royal Commission into Aboriginal Deaths in Custody** (1991) made 339 recommendations to prevent such deaths. Mulrunji's death demonstrated that many recommendations remained unimplemented nearly 15 years later.

### Media and Documentary Coverage
The case received extensive coverage:
- **"The Tall Man" (2008)** - Book by Chloe Hooper
- **"The Tall Man" (2011)** - Documentary film directed by Tony Krawitz
- Broadcast on SBS Television (2012) and NITV (2021)
- Ongoing media coverage and analysis

## Long-term Impact

### Community Healing
The events of 2004 profoundly affected Palm Island:
- Trauma from Mulrunji's death
- Trauma from police response
- Years of legal battles
- Eventual recognition through settlements
- Ongoing work toward healing and justice

### Police-Community Relations
The case exposed deep problems in police-community relations:
- Lack of accountability for police actions
- Racial discrimination in policing
- Need for Indigenous-led solutions
- Importance of community control

### Self-Determination Movement
The uprising and its aftermath strengthened calls for:
- Aboriginal community control of services
- Indigenous decision-making authority
- Recognition of systemic racism
- Implementation of Royal Commission recommendations

## PICC's Response
In the years following 2004, Palm Island Community Company (PICC) has:
- Expanded community-controlled services
- Implemented delegated authority for child protection (Bwgcolman Way)
- Built local capacity and employment
- Created alternatives to justice system involvement
- Strengthened community resilience

## Commemoration

### Annual Recognition
The Palm Island community commemorates November 19 each year, remembering Mulrunji and renewing commitment to justice.

### Ongoing Advocacy
Lex Wotton and others continue to advocate for:
- Justice for all Aboriginal deaths in custody
- Police accountability
- Implementation of Royal Commission recommendations
- Community healing and empowerment

## Legacy

### What Changed:
- Increased awareness of Aboriginal deaths in custody
- Recognition of systemic racism in justice system
- Community empowerment through legal victories
- National conversation about police accountability

### What Remains:
- Aboriginal people still die in custody at disproportionate rates
- Many Royal Commission recommendations unimplemented
- Ongoing need for systemic change
- Continued community advocacy for justice

## Family and Community
Mulrunji left behind family members who continue to grieve his loss and advocate for justice. The Palm Island community honors his memory while working toward a future where such tragedies don't occur.

## Sources
- Wikipedia: 2004 Palm Island death in custody
- National Museum of Australia - Defining Moments
- SBS NITV coverage and documentaries
- Court records and legal documents
- Community records and testimonies

## Cultural Note
This content discusses a death in custody and may be distressing to Aboriginal and Torres Strait Islander peoples, particularly family members and community members affected by these events.`,
    entry_type: 'event',
    category: 'Historical Events',
    keywords: ['Mulrunji', 'death in custody', 'Palm Island', '2004', 'Lex Wotton', 'class action', 'justice', 'Aboriginal rights', 'police accountability'],
    structured_data: {
      source: 'Multiple sources including Wikipedia, NMA, SBS NITV',
      event_date: '2004-11-19',
      deceased: 'Cameron "Mulrunji" Doomadgee',
      age: 36,
      uprising_date: '2004-11-26',
      class_action_settlement_year: 2018,
      settlement_amount: 30000000,
      settlement_recipients: 447,
      wotton_compensation: 220000,
      wotton_compensation_year: 2016,
      officer: 'Senior Sergeant Chris Hurley',
      verdict: 'not guilty',
      verdict_date: '2007-06-20'
    },
    date_from: '2004-11-19',
    date_to: '2018-12-31',
    date_precision: 'exact',
    fiscal_year: null,
    location_type: 'palm_island',
    is_public: true,
    is_verified: true
  },
  {
    slug: 'picc-youth-services-2024',
    title: 'PICC Youth Services',
    subtitle: 'Supporting young people through culture, health and justice programs',
    summary: 'PICC Youth Services delivers three programs: Young Offenders Support Service, Indigenous Youth Connection to Culture, and Tackling Indigenous Smoking, plus a Digital Footprint subprogram promoting positive social media use.',
    content: `# PICC Youth Services

## Overview
PICC Youth Services offers comprehensive support for young people on Palm Island through three integrated programs working together to address the needs of youth, particularly in preventing interactions with the criminal justice system and promoting healthy lifestyles.

## Core Programs

### 1. Young Offenders Support Service
Provides support to young people who have been involved with or are at risk of involvement with the justice system.

**Focus Areas:**
- Diversion from criminal justice system
- Support for young people on court orders
- Reconnection with education and training
- Family engagement and support
- Cultural connection and identity

**Approach:**
- Culturally appropriate interventions
- Strength-based support
- Collaboration with families and community
- Connection to other PICC services

### 2. Indigenous Youth Connection to Culture Program
Strengthens cultural identity and connection for Palm Island young people.

**Activities:**
- Traditional cultural practices and knowledge
- Connection with Elders and knowledge holders
- Learning about Country and traditional lands
- Cultural ceremonies and events
- Language and storytelling
- Connection to Manbarra and Bwgcolman heritage

**Outcomes:**
- Strong cultural identity
- Intergenerational knowledge transfer
- Pride in Indigenous heritage
- Protective factors against negative influences
- Community connection and belonging

### 3. Tackling Indigenous Smoking Program
Addresses tobacco use among young people through education and support.

**Key Elements:**
- Education about health impacts of smoking
- Support to quit or reduce smoking
- Prevention programs for non-smokers
- Community awareness campaigns
- Promotion of healthy lifestyles
- Alternative activities and supports

**Target Groups:**
- Young smokers seeking to quit
- At-risk youth (prevention)
- Pregnant women and new mothers
- Families affected by smoking

## Digital Footprint Subprogram

A specialized program encouraging young people to use social media constructively.

**Purpose:**
- Capture and promote Palm Island culture
- Showcase community activities and people
- Document positive stories from the island
- Build digital literacy skills
- Create positive online presence

**Activities:**
- Photography and videography training
- Social media content creation
- Storytelling through digital media
- Sharing cultural knowledge online
- Promoting community achievements

**Benefits:**
- Positive representation of Palm Island
- Youth engagement through technology
- Skills development (digital literacy, media)
- Community pride and visibility
- Counter negative stereotypes

## Integration with Other Services

Youth Services works closely with other PICC programs:
- **Safe Haven**: Support for at-risk young people
- **Family Wellbeing Service**: Family engagement
- **Bwgcolman Way**: Child protection support
- **Education partnerships**: School engagement
- **Community Justice Group**: Diversion and support

## Community Engagement

### Working with Families
- Family-centered approach
- Parent and caregiver support
- Strengthening family connections
- Cultural family practices

### Collaboration with Community
- Elder involvement and guidance
- Community events and activities
- Partnerships with local organizations
- Cultural authority consultation

## Prevention Focus

A core philosophy of Youth Services is **prevention**:
- Early intervention before justice system involvement
- Positive activities and alternatives
- Skill building and capacity development
- Cultural protective factors
- Supportive relationships and mentoring

## Outcomes and Impact

**Positive Changes:**
- Young people connected to culture
- Reduced offending behaviors
- Improved health outcomes
- Enhanced family relationships
- Stronger community connections
- Increased pride and self-esteem

**Success Indicators:**
- Youth engaged in cultural programs
- Reduction in smoking rates
- Diversion from justice system
- Positive social media content created
- Strong Elder-youth connections

## Culturally Grounded Approach

All Youth Services programs are:
- **Culturally safe**: Respecting Indigenous identity
- **Community-led**: Palm Islander staff and leadership
- **Strength-based**: Building on cultural assets
- **Holistic**: Addressing whole person and family
- **Self-determination**: Supporting youth agency

## Future Directions

Youth Services continues to:
- Expand cultural programming
- Develop youth leadership
- Create employment pathways
- Strengthen family engagement
- Build partnerships
- Innovate service delivery

## Source
PICC Annual Report 2023-2024, page 14`,
    entry_type: 'service',
    category: 'PICC',
    keywords: ['PICC', 'youth services', 'young people', 'culture', 'justice', 'smoking prevention', 'digital media', 'cultural connection'],
    structured_data: {
      source: 'PICC Annual Report 2023-24',
      year: 2024,
      pages: [14],
      programs: [
        'Young Offenders Support Service',
        'Indigenous Youth Connection to Culture Program',
        'Tackling Indigenous Smoking',
        'Digital Footprint Program'
      ],
      focus_areas: ['justice diversion', 'cultural connection', 'health promotion', 'digital literacy']
    },
    fiscal_year: '2023-2024',
    location_type: 'palm_island',
    is_public: true,
    is_verified: true
  },
  {
    slug: 'picc-community-justice-group-2024',
    title: 'Palm Island Community Justice Group',
    subtitle: 'Supporting community members through the criminal justice system',
    summary: 'Auspiced by PICC since 2008, the Community Justice Group employs 4 part-time staff providing support through the criminal justice system, including a Domestic and Family Violence Enhancement Program.',
    content: `# Palm Island Community Justice Group

## Overview
Since **2008**, the Palm Island Community Company (PICC) has auspiced the **Community Justice Group**, which provides essential support to community members dealing with the criminal justice system.

## Auspicing Arrangement
As the auspicing organization, PICC:
- Provides organizational infrastructure and support
- Employs Community Justice Group staff
- Manages funding and reporting
- Ensures program accountability
- Supports service delivery
- Maintains community governance

## Staffing

PICC directly employs **four part-time staff members** for the Community Justice Group:

1. **Coordinator** - Oversees program operations and staff
2. **Administration Assistant** - Provides administrative support
3. **Domestic and Family Violence Support Worker** (2 positions) - Specialized DFV support

All positions are designed to be filled by community members with cultural knowledge and community connections.

## Core Program

### General Community Justice Support
The Community Justice Group assists community members who are:
- Involved in the criminal justice system
- Appearing in court
- On probation or parole
- Dealing with police matters
- Navigating legal processes
- Seeking alternatives to incarceration

**Support Provided:**
- Information about legal processes
- Court support and accompaniment
- Connection to legal services
- Liaison with justice authorities
- Referrals to other services
- Cultural support and advocacy

### Community-Based Approach
The program operates on principles of:
- Cultural respect and safety
- Community ownership
- Restorative justice values
- Connection to Elders and community
- Holistic support
- Self-determination

## Domestic and Family Violence Enhancement Program

A specialized component of the Community Justice Group focusing on domestic and family violence.

### Two Dedicated Support Workers
The program employs two **Domestic and Family Violence Support Workers** who provide:

**Direct Support:**
- Crisis intervention and safety planning
- Emotional support and counseling
- Information about protection orders
- Court support for DFV matters
- Connection to safe accommodation
- Ongoing case management

**Community Engagement:**
- DFV awareness and education
- Prevention programs
- Community capacity building
- Cultural approaches to family violence
- Men's behavior change support
- Bystander intervention training

**Collaboration:**
- Work with Women's Service and Women's Healing Service
- Coordinate with police and courts
- Connect with mainland DFV services
- Partner with community organizations
- Engage with Elders and leaders

### Cultural Safety in DFV Work
The program recognizes:
- Impact of colonization and trauma
- Cultural dimensions of family violence
- Importance of community-led solutions
- Need for culturally safe services
- Role of healing and culture in prevention

## Integration with PICC Services

The Community Justice Group works alongside other PICC services:
- **Youth Services**: Support for young people in justice system
- **Family Wellbeing Service**: Family support and intervention
- **Women's Service**: Support for women experiencing violence
- **Women's Healing Service**: Support for women in/leaving custody
- **Safe Haven**: Accommodation and support

## Community Governance

While auspiced by PICC, the Community Justice Group maintains:
- Community advisory input
- Elder guidance and wisdom
- Cultural authority in decision-making
- Local knowledge and expertise
- Community accountability

## Importance to Community

The Community Justice Group is vital because:
- Palm Island has high rates of justice system involvement
- Cultural support improves outcomes
- Community-based alternatives to incarceration
- Addresses underlying causes of offending
- Supports families affected by justice involvement
- Reduces recidivism through connection and support

## Historical Context

The need for Community Justice Groups stems from:
- Over-policing of Aboriginal communities
- High rates of incarceration
- Aboriginal deaths in custody (including Mulrunji 2004)
- Failure of mainstream justice system
- Community desire for self-determination
- Recognition of cultural approaches to justice

## Outcomes

Through Community Justice Group support:
- Community members navigate justice system more effectively
- Cultural support reduces trauma of justice involvement
- Families stay connected during court processes
- Alternative outcomes to incarceration achieved
- DFV victims access culturally safe support
- Community develops capacity to address justice issues

## Future Directions

The Community Justice Group aims to:
- Expand diversion programs
- Strengthen cultural components
- Enhance DFV prevention and response
- Build community capacity
- Advocate for justice system reform
- Support self-determination in justice

## Source
PICC Annual Report 2023-2024, page 14`,
    entry_type: 'service',
    category: 'PICC',
    keywords: ['PICC', 'Community Justice Group', 'criminal justice', 'domestic violence', 'family violence', 'court support', 'legal support'],
    structured_data: {
      source: 'PICC Annual Report 2023-24',
      year: 2024,
      pages: [14],
      auspice_start_year: 2008,
      staff_count: 4,
      staff_positions: [
        'Coordinator',
        'Administration Assistant',
        'DFV Support Worker (2)'
      ],
      programs: [
        'General Justice Support',
        'Domestic and Family Violence Enhancement Program'
      ]
    },
    fiscal_year: '2023-2024',
    location_type: 'palm_island',
    is_public: true,
    is_verified: true
  }
]

async function main() {
  console.log('🚀 Starting Additional Content import...')

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
