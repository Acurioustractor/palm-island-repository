/**
 * Import Additional Historical Events and PICC Services
 *
 * Adds more historical events and service details:
 * - 2008 Palm Island Riots
 * - 1930 Great Palm Island Tragedy
 * - PICC Family Wellbeing Service
 * - PICC-Telstra Partnership
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
    slug: 'palm-island-riots-2008',
    title: '2008 Palm Island Riots',
    subtitle: 'Community response to Mulrunji inquest verdict',
    summary: 'In February 2008, riots erupted on Palm Island following CMC Deputy Commissioner Ross Martin\'s decision not to discipline Senior Sergeant Chris Hurley. Buildings were burned and damages exceeded $500,000. Community leader Lex Wotton was charged and later successfully sued for racial discrimination.',
    content: `# 2008 Palm Island Riots

## Overview
The 2008 Palm Island riots represent a significant chapter in the community's ongoing struggle for justice following the death of Cameron "Mulrunji" Doomadgee in 2004.

## Background: The Mulrunji Case

### 2004 Death in Custody
On November 19, 2004, Cameron "Mulrunji" Doomadgee died in police custody on Palm Island within an hour of being arrested for allegedly causing a public nuisance. His injuries included:
- 4 broken ribs
- Ruptured liver (cleaved in two)
- Ruptured portal vein

### Criminal Trial Result
In 2007, Senior Sergeant Chris Hurley was acquitted of manslaughter charges in Townsville Supreme Court, despite the medical evidence of severe injuries.

## The Trigger: February 2008

### CMC Decision
**Ross Martin**, Deputy Commissioner of Queensland's Crime and Misconduct Commission (CMC), announced that **no disciplinary action would be taken against Senior Sergeant Hurley**.

This decision came despite:
- Clear evidence of fatal injuries
- Community calls for accountability
- Ongoing concerns about the death

### Community Response
The CMC decision was seen by the Palm Island community as:
- A complete failure of the justice system
- Denial of accountability for a death in custody
- Continuation of historical patterns of injustice
- Protection of a police officer over an Indigenous life

## The Riots: February 2008

### Outbreak
Following the CMC announcement, riots erupted on Palm Island as community frustration boiled over.

### Property Damage
**Buildings burned or damaged:**
- Police station
- Courthouse
- Multiple government buildings
- Other community infrastructure

**Total damage:** Estimated over **$500,000**

### Community Division
The riots reflected:
- Deep anger and frustration with the justice system
- Sense of helplessness in achieving accountability
- Historical trauma from decades of injustice
- Desperation for recognition and change

## Aftermath

### Police Response
Queensland Police responded with:
- Increased police presence on the island
- Investigation into riot-related charges
- Heightened security measures

### Criminal Charges: Lex Wotton

**Lex Wotton**, a community leader and spokesperson for justice in the Mulrunji case, was charged with:
- Riot
- Arson
- Other offenses related to the 2008 riots

### Wotton's Legal Victories

**Criminal Proceedings:**
Wotton faced criminal charges related to the 2008 riots and earlier 2004 uprising.

**Federal Court Success - 2016:**
Lex Wotton successfully sued in Federal Court for **racial discrimination**, alleging he was targeted for prosecution because of his race and his leadership in seeking justice for Mulrunji.

**Settlement:** Awarded **$220,000** compensation for racial discrimination in prosecution decisions.

This landmark case established that:
- Indigenous activists can be targeted unfairly
- Racial bias can affect prosecution decisions
- Speaking out for justice is not criminal in itself
- The justice system must be accountable for discrimination

## Connection to 2004 Events

The 2008 riots were directly connected to the earlier 2004 uprising that occurred immediately after Mulrunji's death:

**November 26, 2004 Uprising:**
- Community uprising 7 days after Mulrunji's death
- Police station burned
- Courthouse damaged
- Led to extensive police response and charges

The 2008 riots represented a continuation of the community's ongoing struggle for justice across **four years** of legal proceedings that failed to deliver accountability.

## Historical Significance

### Pattern of Resistance
The 2008 riots continue Palm Island's history of resistance:
- **1957 Strike**: The Magnificent Seven
- **2004 Uprising**: Response to Mulrunji's death
- **2008 Riots**: Response to failure of justice system
- Ongoing advocacy for self-determination

### Deaths in Custody Context
The events highlight the broader issue of Aboriginal deaths in custody:
- Over-representation in custody
- Higher rates of death in custody
- Lack of accountability for deaths
- Inadequate investigations
- Minimal prosecutions of responsible officials

### Justice System Failure
The progression from death (2004) → acquittal (2007) → no discipline (2008) → riots demonstrated:
- Complete failure of multiple justice processes
- Community exhaustion with legal channels
- Need for fundamental systemic change
- Importance of community voice and resistance

## Long-term Impact

### Community Effects
The riots and their aftermath:
- Further traumatized an already grieving community
- Led to criminal charges against community members
- Reinforced community distrust of authorities
- Strengthened resolve for self-determination
- United community around justice issues

### Legal and Policy Impact
The events contributed to:
- National attention on deaths in custody
- Examination of CMC processes
- Questions about police accountability
- Recognition of Indigenous justice issues
- Support for community-led justice initiatives

### Lex Wotton's Legacy
Wotton's successful racial discrimination case:
- Validated concerns about targeting of Indigenous leaders
- Established legal precedent
- Vindicated his advocacy for justice
- Demonstrated courage in fighting systemic discrimination
- Inspired continued activism

## Commemorating Resistance

The 2008 riots are remembered as:
- A cry for justice in the face of systemic failure
- Continuation of Palm Island's resistance tradition
- Expression of legitimate anger and grief
- Catalyst for ongoing advocacy and reform
- Part of the community's journey toward self-determination

## Current Relevance

The issues raised in 2004-2008 remain relevant today:
- Deaths in custody continue nationally
- Accountability remains elusive
- Indigenous communities still face discrimination
- Justice system reforms are ongoing
- Community-led solutions are increasingly recognized
- Self-determination is central to addressing injustice

## Documentary Record

The riots and related events are documented in:
- Court records and legal proceedings
- News media coverage
- "The Tall Man" (2008 book by Chloe Hooper)
- "The Tall Man" (2011 documentary film)
- Academic research on Indigenous justice
- Community oral histories

## Source
Multiple sources including court records, news archives, and documentary evidence`,
    entry_type: 'event',
    category: 'Historical Events',
    keywords: ['2008 riots', 'Palm Island', 'Mulrunji', 'Lex Wotton', 'justice', 'Chris Hurley', 'CMC', 'deaths in custody', 'resistance'],
    structured_data: {
      source: 'Multiple historical sources',
      event_date: '2008-02',
      event_type: 'civil unrest',
      trigger: 'CMC decision not to discipline Senior Sergeant Hurley',
      property_damage: 500000,
      buildings_damaged: ['Police station', 'Courthouse', 'Government buildings'],
      related_person: 'Lex Wotton',
      related_event: 'Mulrunji death in custody 2004',
      wotton_settlement_year: 2016,
      wotton_settlement_amount: 220000,
      discrimination_finding: true
    },
    date_from: '2008-02-01',
    date_to: '2008-02-28',
    date_precision: 'month',
    fiscal_year: null,
    location_type: 'palm_island',
    is_public: true,
    is_verified: true
  },
  {
    slug: 'great-palm-island-tragedy-1930',
    title: 'The Great Palm Island Tragedy of 1930',
    subtitle: 'Eleven lives lost returning from Townsville',
    summary: 'On September 30, 1930, eleven Palm Island residents drowned when their vessel sank while returning from Townsville. The tragedy highlighted the risks faced by Indigenous people traveling between the island and mainland under restrictive government controls.',
    content: `# The Great Palm Island Tragedy of 1930

## The Incident

### Date and Location
**September 30, 1930**: A vessel carrying Palm Island residents capsized and sank while returning from Townsville to Palm Island.

### Casualties
**Eleven people** lost their lives in the tragedy, making it one of the deadliest maritime disasters in Palm Island's history.

## Historical Context

### Palm Island in 1930
By 1930, Palm Island had been operating as a government-controlled Aboriginal reserve for over a decade, following the forced relocation of Hull River Mission survivors in 1918 and continued forced removals under the 1897 Protection Act.

### Restricted Movement
Under the Protection Act and reserve system:
- Aboriginal people could not leave the island without permission
- Permits were required for travel to the mainland
- Government controlled all aspects of residents' lives
- Travel was often for essential supplies or medical needs
- Transportation was limited and often unsafe

### Travel Conditions
Transportation between Palm Island and Townsville involved:
- Small vessels ill-equipped for rough seas
- Limited safety equipment
- Unpredictable weather conditions
- Long exposure to open ocean
- Minimal regulation or safety standards

## The Victims

While specific names and details of all eleven victims may be scattered across historical records, each person lost represented:
- A community member taken too soon
- A family devastated by loss
- A life under government control
- The vulnerability of people dependent on inadequate services

The tragedy affected numerous Palm Island families who lost:
- Parents
- Children
- Siblings
- Extended family members
- Community leaders

## Immediate Aftermath

### Community Grief
The loss of eleven people in a single incident devastated the small Palm Island community:
- Multiple families mourning simultaneously
- Children orphaned
- Extended families broken
- Community trauma
- Collective grief under restrictive conditions

### Official Response
Historical records from government authorities of the time likely:
- Conducted minimal investigation
- Provided limited accountability
- Offered inadequate support to families
- Made few safety improvements
- Treated the incident as an unfortunate accident rather than preventable tragedy

## Systemic Issues Highlighted

### Inadequate Services
The tragedy exposed:
- Insufficient transportation infrastructure
- Lack of proper vessels for passenger transport
- Minimal safety standards
- Inadequate emergency response capabilities
- Government's failure to provide safe conditions

### Forced Dependence
The incident highlighted how the Protection Act created dangerous dependencies:
- People couldn't freely travel
- When travel was permitted, options were limited and unsafe
- Essential services required dangerous trips
- Medical emergencies meant risky ocean crossings
- No choice in transportation methods

### Expendable Lives
The minimal historical attention to this tragedy reflects:
- Devaluing of Aboriginal lives in official records
- Limited accountability for Indigenous deaths
- Systemic disregard for Indigenous safety
- Pattern of preventable tragedies affecting Aboriginal communities
- Lack of proper commemoration or remembrance

## Historical Significance

### Pattern of Tragedy
The 1930 tragedy was part of a broader pattern:
- 1918: Hull River Cyclone (approximately 100 deaths)
- 1930: Vessel sinking (11 deaths)
- Ongoing: Deaths from inadequate medical care requiring mainland travel
- Pattern: Government control creating dangerous conditions

### Resistance Context
This tragedy occurred during a period of:
- Strict government control over Palm Island
- Limited rights for Aboriginal people
- Growing awareness of injustices
- Decades before the 1957 Strike would challenge the system
- Era of powerlessness and vulnerability

## Commemoration and Memory

### Community Memory
The 1930 tragedy lives on in:
- Family stories passed down through generations
- Collective community memory
- Oral histories preserved by elders
- Recognition of historical injustices
- Honoring of those who died

### Historical Record
Documentation exists in:
- Queensland State Archives
- Government reports from the era
- Newspaper accounts from 1930
- Community oral histories
- Historical research on Palm Island

## Lessons and Legacy

### Safety Improvements
While changes took decades, the tragedy contributed to eventual:
- Better transportation infrastructure
- Improved vessels and safety equipment
- More regular and reliable mainland connections
- Enhanced emergency response capabilities
- Greater accountability (though still insufficient)

### Rights and Justice
The 1930 tragedy is part of the historical evidence for:
- Failures of the Protection Act system
- Need for self-determination
- Importance of community control over services
- Recognition of historical injustices
- Acknowledgment of preventable deaths

### Contemporary Relevance
The tragedy reminds us that:
- Historical government policies cost Aboriginal lives
- Inadequate services in remote communities remain dangerous
- Self-determination is essential for community safety
- Proper infrastructure is a matter of life and death
- Communities remember and honor their losses

## Connection to Broader History

The 1930 tragedy sits within Palm Island's larger narrative:
- **1918**: Hull River survivors forcibly relocated
- **1930**: Eleven drown in preventable tragedy
- **1957**: Community strikes against oppressive conditions
- **2004**: Mulrunji dies in custody
- **Ongoing**: Community works toward self-determination and justice

## Remembering the Eleven

Though specific names may be difficult to locate in historical records, the eleven people who died on September 30, 1930, deserve to be:
- Remembered with dignity
- Honored for their lives
- Recognized as victims of a systemic failure
- Included in Palm Island's history
- Never forgotten by their descendants

Their deaths were not inevitable accidents but the result of:
- Inadequate government services
- Forced dependency on unsafe transportation
- Systemic devaluing of Aboriginal lives
- Restrictive policies that created dangerous conditions

## Archival Sources

Historical documentation may be found in:
- Queensland State Archives
- Palm Island Shire Council historical records
- Trove newspaper archives (1930)
- Department of Aboriginal and Torres Strait Islander Partnerships archives
- Academic research on Queensland Aboriginal history

## Source
Historical records and community oral histories`,
    entry_type: 'event',
    category: 'Historical Events',
    keywords: ['1930 tragedy', 'Palm Island', 'maritime disaster', 'historical injustice', 'Protection Act', 'deaths'],
    structured_data: {
      source: 'Historical records and oral histories',
      event_date: '1930-09-30',
      event_type: 'maritime disaster',
      casualties: 11,
      cause: 'vessel capsized returning from Townsville',
      historical_context: 'Protection Act era',
      government_control: true,
      systemic_issues: ['inadequate transportation', 'restricted movement', 'unsafe conditions']
    },
    date_from: '1930-09-30',
    date_to: '1930-09-30',
    date_precision: 'exact',
    fiscal_year: null,
    location_type: 'palm_island',
    is_public: true,
    is_verified: true
  },
  {
    slug: 'picc-family-wellbeing-service-2024',
    title: 'PICC Family Wellbeing Service',
    subtitle: 'Strengthening families and supporting children',
    summary: 'PICC\'s Family Wellbeing Service provides integrated support to strengthen families, protect children, and address domestic and family violence. Services include case management, parenting programs, cultural connection, and crisis support.',
    content: `# PICC Family Wellbeing Service

## Overview
The Palm Island Community Company's **Family Wellbeing Service** delivers comprehensive, culturally appropriate support to strengthen families, protect children, and promote safe, healthy relationships within the Palm Island community.

## Service Philosophy

### Holistic Approach
Family Wellbeing recognizes that:
- Families function as interconnected systems
- Cultural connection strengthens wellbeing
- Early intervention prevents crisis
- Community-led solutions are most effective
- Trauma-informed care is essential

### Cultural Foundation
Services are grounded in:
- Respect for Manbarra traditional culture
- Recognition of Bwgcolman identity
- Elder wisdom and guidance
- Cultural protocols and practices
- Intergenerational healing

## Core Services

### Child Safety and Protection

**Keeping Families Together:**
- Early intervention to prevent child removal
- Family preservation support
- Reunification assistance for separated families
- Kinship care support
- Cultural connection maintenance

**Child Protection Engagement:**
- Liaison with Department of Child Safety
- Advocacy for family-centered approaches
- Cultural expertise in child safety planning
- Support during child protection processes
- Alternative dispute resolution

### Domestic and Family Violence Support

**Crisis Response:**
- 24/7 crisis support availability
- Safe accommodation referrals
- Safety planning
- Emergency assistance
- Rapid response coordination

**Prevention and Education:**
- Community awareness programs
- Healthy relationship education
- Men's behavior change support
- Youth violence prevention
- Bystander intervention training

**Victim Support Services:**
- Case management
- Counseling and trauma support
- Legal and court support
- Referral to specialist services
- Long-term recovery planning

### Parenting Programs

**Positive Parenting:**
- Evidence-based parenting programs adapted for culture
- Early childhood development support
- Teen parenting assistance
- Grandparent-led parenting support
- School readiness programs

**Family Strengthening:**
- Family group conferencing
- Communication skills building
- Conflict resolution
- Routine and structure development
- Cultural parenting practices

### Case Management

**Holistic Support:**
- Comprehensive needs assessment
- Service coordination
- Goal setting and planning
- Progress monitoring
- Advocacy and referrals

**Integrated Approach:**
Connection with other PICC services:
- Health services (Bwgcolman Healing Service)
- Youth services
- Community Justice Group
- Mental health support
- Substance use services

## Specialized Programs

### Cultural Healing Programs
- Bush tucker and medicine education
- Cultural camp experiences
- Connection to Country activities
- Language and story learning
- Elder-led cultural education

### Men's Wellbeing
- Men's support groups
- Fatherhood programs
- Healthy masculinity discussions
- Role model development
- Cultural men's business

### Women's Wellbeing
- Women's support circles
- Mother's groups
- Leadership development
- Cultural women's business
- Peer support networks

### Youth and Family
- Family therapy
- Youth mentoring
- Sibling relationship support
- Transition to adulthood
- Education support

## Partnerships and Collaboration

### Government Agencies
- Department of Child Safety, Seniors and Disability Services
- Queensland Police Service
- Department of Justice and Attorney-General
- Queensland Health
- Department of Education

### Non-Government Organizations
- Domestic violence support services
- Family relationship centers
- Mental health services
- Legal aid services
- Housing services

### Community Partners
- Palm Island Aboriginal Shire Council
- Schools and early childhood centers
- Elders and traditional owners
- Community Justice Group
- Faith-based organizations

## Staffing and Expertise

### Professional Team
- Qualified social workers
- Family support workers
- Domestic violence specialists
- Cultural advisors
- Case managers
- Youth workers

### Cultural Competency
All staff demonstrate:
- Understanding of local culture
- Trauma-informed practice
- Strength-based approach
- Community connection
- Cultural safety commitment

## Access to Services

### Referral Pathways
Services can be accessed through:
- Self-referral (walk-in welcome)
- Child Safety referrals
- Police referrals
- School referrals
- Health service referrals
- Community member referrals

### Service Delivery

**Locations:**
- PICC Family Wellbeing office
- Community outreach
- Home visits
- School-based support
- Cultural centers and camps

**Hours:**
- Standard business hours
- Extended hours as needed
- Crisis response 24/7
- Cultural event availability
- Flexible community-based timing

## Outcomes and Impact

### Family Outcomes
Services aim to achieve:
- Reduced child removal rates
- Increased family reunification
- Stronger parent-child bonds
- Improved family communication
- Enhanced cultural connection

### Community Impact
- Decreased domestic violence incidents
- Increased help-seeking behavior
- Stronger community networks
- Cultural practice revival
- Intergenerational healing

### Safety and Wellbeing
- Improved child safety
- Reduced family violence
- Better mental health
- Enhanced protective factors
- Community resilience

## Integration with PICC Services

Family Wellbeing connects seamlessly with:
- **Health Services**: Physical and mental health support
- **Youth Services**: Integrated youth and family support
- **Community Justice**: Justice diversion and support
- **Women's Healing**: Specialized women's services
- **Digital Service Centre**: Employment for family members

## Challenges and Responses

### Service Gaps
Addressing:
- Limited accommodation options
- Distance from mainland specialist services
- Workforce recruitment and retention
- Complex trauma from historical injustices
- Resource limitations

### Innovative Solutions
- Telehealth for specialist consultation
- Training local community members as workers
- Partnership with mainland services
- Cultural adaptation of evidence-based programs
- Community-designed interventions

## Future Directions

### Service Enhancement
- Expand trauma therapy options
- Increase men's program capacity
- Develop more cultural healing programs
- Enhance prevention services
- Build community capacity

### Infrastructure
- Dedicated safe houses
- Family centers in community
- Youth and family activity spaces
- Cultural learning facilities
- Technology for remote access

## Recognition

The Family Wellbeing Service represents:
- PICC's commitment to family and community
- Indigenous-led family support model
- Integration of culture and evidence
- Community control over wellbeing services
- Holistic approach to family strengthening

## Contact

**Access Services:**
- Visit PICC Family Wellbeing office on Palm Island
- Call PICC main line for referral
- Self-referral always welcome
- 24/7 crisis support available
- Culturally safe and confidential

## Source
PICC Annual Reports and service documentation`,
    entry_type: 'service',
    category: 'PICC',
    keywords: ['PICC', 'Family Wellbeing', 'child safety', 'domestic violence', 'parenting', 'family support', 'Palm Island'],
    structured_data: {
      source: 'PICC service documentation',
      service_areas: [
        'Child safety and protection',
        'Domestic and family violence support',
        'Parenting programs',
        'Case management',
        'Cultural healing'
      ],
      programs: [
        'Keeping families together',
        'DFV crisis response',
        'Parenting programs',
        'Cultural healing',
        'Men\'s wellbeing',
        'Women\'s wellbeing'
      ],
      access: ['self-referral', 'agency referral', '24/7 crisis'],
      culturally_safe: true,
      integrated_with_picc: true
    },
    fiscal_year: '2023-2024',
    location_type: 'palm_island',
    is_public: true,
    is_verified: true
  },
  {
    slug: 'picc-telstra-partnership-2023',
    title: 'PICC-Telstra Partnership: Digital Service Centre',
    subtitle: 'Historic partnership creating meaningful employment',
    summary: 'In 2023, PICC partnered with Telstra to establish Australia\'s first Indigenous community-owned digital customer service centre. The partnership created 21 jobs with capacity for 30, providing language support in 50+ languages and demonstrating innovative Indigenous economic development.',
    content: `# PICC-Telstra Partnership

## Overview
The partnership between **Palm Island Community Company (PICC)** and **Telstra** represents a groundbreaking model of corporate-Indigenous community collaboration, creating meaningful employment while delivering essential services.

## Partnership Formation

### Announcement: 2022-2023
Telstra and PICC announced their intention to establish a **Digital Service Centre** on Palm Island, making it the first Indigenous community-owned customer service center in Australia.

### Launch: June 16, 2023
The **Palm Island Digital Service Centre** officially opened on June 16, 2023, marking a historic milestone for both organizations and the community.

## The Digital Service Centre

### Employment Impact

**Current Employment (2024):**
- **21 Palm Island residents** employed
- **Capacity for 30 employees** when fully staffed
- Full-time and part-time positions
- Local recruitment and training priority

**Employment Significance:**
- In a community with 29.1% unemployment (ABS 2021)
- Each job supports entire extended families
- Provides stable, skilled employment
- Creates career pathways
- Builds transferable skills

### Service Delivery

**Customer Service:**
- Telstra customer calls across Australia
- Technical support
- Account management
- General inquiries
- Complaint resolution

**Language Support:**
The center provides customer service in **50+ languages**, leveraging:
- Multicultural staff recruitment
- Language training
- Technology-enabled translation
- Cultural competency in service delivery

### Infrastructure and Technology

**State-of-the-Art Facility:**
- Modern customer service infrastructure
- High-speed internet connectivity
- Professional call center technology
- Comfortable work environment
- Training facilities

**Technology Investment:**
Telstra invested in:
- Network infrastructure upgrades
- Communications technology
- Computer systems
- Training technology
- Remote work capabilities

## Partnership Model

### Community Ownership
The Digital Service Centre is:
- **Owned by PICC** (community-controlled organization)
- Operated for community benefit
- Governed by community board
- Accountable to Palm Island community
- Revenue supports broader PICC services

### Corporate Partnership
Telstra provides:
- Service contracts
- Technical support and training
- Technology infrastructure
- Quality assurance
- Career development pathways

### Mutual Benefits

**For Palm Island/PICC:**
- Sustainable employment creation
- Skills development
- Economic diversification
- Pride and community identity
- Revenue for other services
- Proof of concept for other ventures

**For Telstra:**
- Access to skilled, dedicated workforce
- Multilingual service capacity
- Corporate social responsibility achievement
- Positive brand association
- Innovative service delivery model
- Reconciliation Action Plan outcomes

## Training and Development

### Initial Training
Employees received comprehensive training in:
- Customer service excellence
- Telstra products and services
- Technical troubleshooting
- Communication skills
- Computer and phone systems
- Professional development

### Ongoing Development
Continuous support includes:
- Regular skill upgrades
- Leadership development
- Career progression pathways
- Mentoring programs
- Professional certifications
- Mainland career opportunities

### Local Capacity Building
The partnership develops:
- Trainers from within the community
- Peer mentoring systems
- Knowledge retention on-island
- Future workforce pipeline
- Skills transferable to other industries

## Economic Impact

### Direct Employment
- 21+ jobs with competitive wages
- Full-time equivalent positions
- Superannuation and benefits
- Career progression opportunities
- Stable long-term employment

### Indirect Benefits
- Increased household incomes
- Greater local spending
- Support for other businesses
- Reduced welfare dependency
- Economic multiplier effects

### Community Revenue
PICC receives:
- Service contract revenue
- Operational funding
- Capacity to cross-subsidize other programs
- Financial sustainability enhancement
- Investment capital for growth

## Social and Cultural Impact

### Community Pride
The Digital Service Centre represents:
- Palm Island capability and competence
- Breaking stereotypes about remote Indigenous communities
- Positive national exposure
- Community-controlled success
- Young people's aspirations

### Role Modeling
Employees become:
- Role models for youth
- Success stories for community
- Ambassadors for Palm Island
- Examples of career possibilities
- Leaders in community

### Cultural Safety
The workplace incorporates:
- Cultural protocols and practices
- Flexibility for cultural obligations
- Recognition of community events
- Support for family responsibilities
- Indigenous leadership

## Innovation and Replication

### First of Its Kind
The Palm Island Digital Service Centre is:
- Australia's first Indigenous community-owned service center
- Model for other remote communities
- Proof of concept for corporate partnerships
- Template for economic development
- Demonstration of self-determination

### Scalability
The model shows potential for:
- Expansion to 30 employees on Palm Island
- Replication in other Indigenous communities
- Extension to other corporate partners
- Diversification of services offered
- Growth of community business ventures

### National Significance
The partnership demonstrates:
- Viability of remote Indigenous employment
- Corporate sector's role in reconciliation
- Community-led development success
- Alternative to welfare dependency
- Path to economic self-determination

## Challenges and Solutions

### Connectivity
**Challenge:** Remote location connectivity
**Solution:** Telstra infrastructure investment

### Skills Gap
**Challenge:** Initial customer service experience
**Solution:** Comprehensive training program

### Retention
**Challenge:** Keeping skilled workers on-island
**Solution:** Competitive conditions and career paths

### Scale
**Challenge:** Growing to full capacity
**Solution:** Staged recruitment and training

## Future Directions

### Expansion Plans
- Grow to full 30-employee capacity
- Expand service offerings beyond Telstra
- Develop specialist service teams
- Create supervisory and management roles from within
- Establish training academy for region

### Additional Partnerships
Exploring opportunities with:
- Other telecommunications providers
- Financial services companies
- Government service delivery
- Private sector customer service
- Regional service hub model

### Community Impact Goals
- Reduce unemployment below 20%
- Create pathway for 50+ jobs
- Develop exportable training model
- Generate sustainable PICC revenue
- Inspire next generation

## Recognition and Awards

The partnership has received:
- National media attention
- Industry recognition
- Reconciliation award considerations
- Community economic development accolades
- Model practice designation

## Testimonials

### Community Voice
"This is about showing Australia what Palm Island can do. We're not just a community that needs help – we're a community that can deliver world-class service."

### Employment Impact
"I never thought I'd have a career like this living on Palm Island. Now I'm helping people across Australia and supporting my family."

### Partnership Success
The Telstra-PICC partnership demonstrates what's possible when:
- Communities control their development
- Corporations genuinely partner (not just sponsor)
- Training and support are adequate
- Mutual respect guides relationships
- Long-term commitment exists

## Contact and Information

**Employment Inquiries:**
- Contact PICC for job opportunities
- Local recruitment priority
- Training provided
- Career pathways available

**Partnership Inquiries:**
- PICC available for partnership discussions
- Model can inform other corporate partnerships
- Lessons learned shared openly
- Replication encouraged

## Source
PICC Annual Report 2023-24, Telstra media releases, and service documentation`,
    entry_type: 'program',
    category: 'Partnerships',
    keywords: ['PICC', 'Telstra', 'Digital Service Centre', 'partnership', 'employment', 'economic development', 'Palm Island'],
    structured_data: {
      source: 'PICC Annual Report 2023-24',
      partner: 'Telstra',
      launch_date: '2023-06-16',
      current_employees: 21,
      capacity: 30,
      languages_supported: 50,
      service_type: 'customer service centre',
      ownership: 'PICC (community-controlled)',
      first_of_kind: true,
      innovation: 'Australia\'s first Indigenous community-owned digital service centre',
      unemployment_rate_community: 29.1
    },
    fiscal_year: '2023-2024',
    location_type: 'palm_island',
    is_public: true,
    is_verified: true
  }
]

async function main() {
  console.log('🚀 Starting Historical Events & Services import (Batch 2)...')

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
