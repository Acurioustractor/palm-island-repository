/**
 * Import PICC 2023-24 Annual Report Content
 *
 * Adds structured knowledge entries from the PICC Annual Report to the knowledge base
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
    slug: 'picc-overview-mission-2024',
    title: 'Palm Island Community Company Overview',
    subtitle: 'Making Palm Island a safer, stronger and more prosperous place to live',
    summary: 'PICC is a community-controlled not-for-profit delivering human services, community capacity building, economic development, and social enterprises on Palm Island.',
    content: `# Palm Island Community Company

## Mission
Making Palm Island a safer, stronger and more prosperous place to live.

## Model
PICC operates as a community-controlled not-for-profit organization delivering:
- Human services
- Community capacity building
- Economic development
- Social enterprises

## Key Statistics (2023-24)
- **197 employees** (up 33% from previous year)
- **75% of workforce are Palm Islanders**
- Over **100 local jobs created**
- **$5.8 million in wages delivered** to the community
- **$9.75 million in economic output** for the community
- Approximately **400 Aboriginal and Torres Strait Islander staff** employed over time

## Governance
PICC continues to maintain over **80% of staff members identifying as Aboriginal, Torres Strait Islander, or both**. The proportion of staff members living on Palm Island remains above **70%**, continuing a long-term average that contributes to effective service delivery.

## Community Control Principles
PICC is deeply committed to the principles of community control and self-determination. The organization upholds the spirit of community control by consistently adhering to these principles, ensuring that actions reflect dedication to empowering Palm Islanders.

## Financial Overview (2023-24)
- **Total Income**: $23,400,335
- **Total Expenditure**: $23,678,058
- **Net Result**: -$277,723 (small deficit)
- **Total Assets**: $10,858,764
- **Net Assets**: $3,538,241

The turnover has **quadrupled over the past decade**, demonstrating substantial growth that directly benefits Palm Islanders through services provided and employment opportunities offered.

## Source
PICC Annual Report 2023-2024`,
    entry_type: 'organization',
    category: 'PICC',
    keywords: ['PICC', 'community services', 'employment', 'economic development', 'Indigenous employment'],
    structured_data: {
      source: 'PICC Annual Report 2023-24',
      year: 2024,
      pages: [2,3,4,5,18,19],
      url: 'https://os-data-2.s3-ap-southeast-2.amazonaws.com/picc-com-au/bundle1/picc-2023-24-annual-report.pdf'
    },
    fiscal_year: '2023-2024',
    location_type: 'palm_island',
    is_public: true,
    is_verified: true
  },
  {
    slug: 'picc-leadership-2023-24',
    title: 'PICC Leadership 2023-24',
    subtitle: 'Board of Directors and Executive Leadership',
    summary: 'PICC is led by CEO Rachel Atkinson and Board Chair Luella Bligh, with a Board of Directors providing governance and strategic direction.',
    content: `# PICC Leadership 2023-24

## Board of Directors
- **Luella Bligh** - Chair (5th year as Chair)
- **Rhonda Phillips** - Director
- **Allan Palm Island** - Director
- **Matthew Lindsay** - Company Secretary
- **Harriet Hulthen** - Director
- **Raymond W. Palmer Snr** - Director
- **Cassie Lang** - Director

## Executive Leadership

### Rachel Atkinson - Chief Executive Officer
Rachel Atkinson leads PICC with a strong commitment to community empowerment and self-determination. In her 2023-24 message, she noted:

> "The pace at which PICC has been evolving is nothing short of remarkable. Our expanded investment in services has significantly strengthened and enhanced them, making them more robust and effective than ever before."

Key leadership achievements:
- Three times the number of employees compared to ten years ago
- Turnover quadrupled over the decade
- Led successful implementation of delegated authority
- Fought for decades for community control of child protection decisions
- Continues to address racist barriers to change while improving services

### Luella Bligh - Board Chair
In her fifth year as Chair, Luella Bligh emphasizes:

> "I am deeply conscious of the responsibility I hold to the people of Palm Island, ensuring that our company is not only well-managed and sustainable but also progressing in the right direction."

She notes that positive changes are becoming evident in the community, particularly among young people who are beginning to feel optimistic about Palm Island's future.

## Leadership Philosophy
Both leaders emphasize that **everything PICC does is for, with, and because of the people of Palm Island**. Despite progress, they acknowledge Palm Island continues to lag behind mainland communities in many areas of wellbeing, and PICC remains committed to fighting for Palm Islanders to have the services they deserve.

## Source
PICC Annual Report 2023-2024, pages 2-3`,
    entry_type: 'person',
    category: 'PICC',
    keywords: ['PICC', 'leadership', 'governance', 'Rachel Atkinson', 'Luella Bligh'],
    structured_data: {
      source: 'PICC Annual Report 2023-24',
      year: 2024,
      pages: [2,3,4]
    },
    fiscal_year: '2023-2024',
    location_type: 'palm_island',
    is_public: true,
    is_verified: true
  },
  {
    slug: 'picc-digital-service-centre-2023',
    title: 'Palm Island Digital Service Centre',
    subtitle: 'Palm Islanders taking calls from across Australia',
    summary: 'Opened in 2023, the Digital Service Centre employs 21 Palm Islanders providing Telstra customer service with interpreter support for 50 First Nations languages.',
    content: `# Palm Island Digital Service Centre

## Overview
Opened in 2023, the Palm Island Digital Service Centre has been a great success for PICC and the community of Palm Island. The Centre provides sales and customer service for Telstra landline, mobile and Internet products and services for Aboriginal and Torres Strait Islander customers.

## Language Support
The Centre can connect callers with interpreters for about **fifty First Nations languages**, making it an essential service for Indigenous Australians across the country.

## Employment Impact
- **21 full-time workers** at the end of 2023/24
- **Capacity for 30 full-time equivalent workers** if caller demand requires
- Located in the new Retail Centre on Main Street
- All workers receive wages during training to support themselves and their families

## Training Pathway
1. **12-week intensive course** at Palm Island TAFE
2. **5-week introduction** to call centre and customer service work from Telstra
3. **Certificate III in Business** while working
4. All training provided at **no cost to workers**

## Partnership Model
The Centre is a partnership between:
- Palm Island Community Company (PICC)
- Telstra
- Palm Island Aboriginal Shire Council
- State of Queensland

Being operated by PICC, it is another service **fully owned by the community**.

## Timeline
- **16 June 2023**: Official pilot launch
- **July 2023**: First cohort training begins
- **23 October 2023**: Centre takes first calls
- **November 2023**: Second cohort training begins
- **February 2024**: Second cohort starts taking calls
- **31 January 2025**: Pilot phase ends (renegotiation for permanent funding planned)

## Future Plans
- Continue to grow footprint and improve capacity
- Develop local leadership within the team
- Potential to expand First Nations digital service centre operations on Palm Island and elsewhere

## National Context
The Palm Island Centre is the **second of its kind in Australia**, following the Cherbourg centre opened in 2022. These centres are an initiative of the First Nations Connect scheme from Telstra in partnership with Advance Queensland's Deadly Innovation Strategy and the State of Queensland's Digital Economy Strategy.

## Source
PICC Annual Report 2023-2024, pages 6-7`,
    entry_type: 'service',
    category: 'PICC',
    keywords: ['PICC', 'Digital Service Centre', 'Telstra', 'employment', 'First Nations languages', 'customer service', 'training'],
    structured_data: {
      source: 'PICC Annual Report 2023-24',
      year: 2024,
      pages: [6, 7],
      employees: 21,
      capacity: 30,
      launch_date: '2023-06-16',
      first_calls_date: '2023-10-23',
      pilot_end_date: '2025-01-31',
      languages_supported: 50,
      partners: ['Telstra', 'Palm Island Aboriginal Shire Council', 'Queensland Government']
    },
    fiscal_year: '2023-2024',
    location_type: 'palm_island',
    is_public: true,
    is_verified: true
  },
  {
    slug: 'picc-bwgcolman-way-delegated-authority-2024',
    title: 'Bwgcolman Way: Delegated Authority for Child Protection',
    subtitle: 'Empowered and Resilient - Palm Island mob leading change for children',
    summary: 'A major change to child protection on Palm Island - the PICC CEO now has delegated authority to make decisions about children in care, ensuring community-led care arrangements.',
    content: `# Bwgcolman Way: Delegated Authority

## What is Bwgcolman Way?
"Bwgcolman" meaning **"many tribes, one people"**. PICC has chosen to name the delegated authority approach Bwgcolman Way: Empowered and Resilient.

## Vision
All Manbarra and Bwgcolman children are safe and cared for by family, nurtured by strong and enduring connections to their community, culture and Country. **Palm Island mob leading and creating change for Palm Island children, young people and families.**

## Delegated Authority Explained
Delegated authority is being progressively introduced in communities throughout Queensland by the Department of Child Safety, Seniors and Disability Services.

For Palm Island, there is **only one person** whom the Director-General has delegated the authority to make decisions concerning children in care: **the Chief Executive Officer of PICC**.

PICC and the PICC CEO meet the legislative requirements of prescribed delegates for Aboriginal and Torres Strait Islander children, as outlined in Sections 148BA and 148BB(3) of the Child Protection Act 1999 (Qld).

## Focus Areas
- **Family and cultural connection** where the CEO of PICC will collaboratively make decisions under the Child Protection Act with children and families in partnership with Child Safety Services
- **Genuine participation** for Elders, traditional owner groups and community in implementation and development of service delivery
- **Strongly place-based and community-led** approach

## Complementary Services
Bwgcolman Way will complement and enhance the existing system of supports provided by PICC to Palm Island children, young people and families in contact with the child protection system:
- Family Wellbeing Service
- Safe Haven
- Family Participation Program
- Family Care Services
- Safe House

## Community Investment
PICC has invested its own resources in this exploration phase, growing a network of collaborators and champions who will support PICC as it moves towards a new approach to ensuring children are safe and cared for on Palm Island.

## National Goals
This initiative supports:
- **Target 12 of the National Agreement on Closing the Gap**: Reduce the disproportionate rate of Aboriginal and Torres Strait Islander children in out-of-home care by 45% by 2030
- **Queensland Department goal**: Eliminate the disproportionate number of Aboriginal and Torres Strait Islander children in out-of-home care by 2037

## The Challenge
As of 30 June 2022, Aboriginal and Torres Strait Islander children made up **45.2% of all children in out-of-home care in Queensland**, despite being only 8% of all children in the state.

## CEO Message
Manager Jeanie Sam reiterates how she and others are empowered by their grandparents, the struggles and hardships they faced, and that they continue to be resilient because they're still here, fighting for a better future for our kids.

## Source
PICC Annual Report 2023-2024, pages 8-9`,
    entry_type: 'service',
    category: 'PICC',
    keywords: ['PICC', 'Bwgcolman Way', 'delegated authority', 'child protection', 'community control', 'self-determination', 'Closing the Gap'],
    structured_data: {
      source: 'PICC Annual Report 2023-24',
      year: 2024,
      pages: [8, 9],
      legislation: 'Child Protection Act 1999 (Qld), Sections 148BA and 148BB(3)',
      delegate: 'PICC CEO',
      closing_gap_target: 12,
      target_reduction: '45% by 2030'
    },
    fiscal_year: '2023-2024',
    location_type: 'palm_island',
    is_public: true,
    is_verified: true
  },
  {
    slug: 'picc-womens-healing-service-2024',
    title: "Women's Healing Service - Restructured Model",
    subtitle: 'Supporting women in and at risk of incarceration',
    summary: 'PICC restructured its Women\'s Healing Service in 2024 with three programs: Re-entry, Women on Remand, and Early Intervention, plus a new Aitkenvale office.',
    content: `# Women's Healing Service

## Overview
PICC has remodelled its Women's Healing Service to provide better services to women resident, or at risk of being resident, in the Townsville Women's Correctional Centre.

## Background
In 2023, funding ended for the women's healing pilot programs in prison across Queensland. While PICC and the state government considered the service a broad success, it was clear from three years' experience that there was much more work to be done. COVID-19 restrictions had hindered the Service by preventing all services from being delivered in the prison for many months during 2020 and 2021.

## Restructured Model (2024)
PICC negotiated for a new Women's Healing Service contract with an improved structure:

### Three Regular Programs:
1. **Re-entry Program** - For women soon to leave custody
2. **Women on Remand Program** - For women in custody awaiting trial
3. **Early Intervention Program** - For women on Palm Island at risk of entering prison

## New Service Centre
- **Office location**: Aitkenvale, Townsville
- **Purpose**: Service centre for clients in the community
- **Strategic placement**: Conveniently close to other services with which the Women's Healing Service collaborates and which many clients use
- **Co-location**: Shares space with the PICC NDIS team

## Service Philosophy
The restructured service strengthens its **critical goal of preventing women from entering prison**, and gives better assistance to women before and after their stays at the Townsville Women's Correctional Centre, in addition to its ongoing work with women currently incarcerated.

## Funding
Funded by the **Department of Justice and the Attorney-General**.

## Success Metrics
Despite the challenges, PICC and the state government considered the Women's Healing Service to be a broad success compared to others in the pilot program across Queensland, demonstrating the value of such services for women in, or at risk of being in, the Townsville Women's Correctional Centre, and the lack of alternative services for such women in north Queensland.

## Source
PICC Annual Report 2023-2024, page 9`,
    entry_type: 'service',
    category: 'PICC',
    keywords: ['PICC', 'Women\'s Healing Service', 'justice', 'incarceration', 'women', 'Townsville', 'rehabilitation', 'prevention'],
    structured_data: {
      source: 'PICC Annual Report 2023-24',
      year: 2024,
      pages: [9],
      programs: ['Re-entry Program', 'Women on Remand Program', 'Early Intervention Program'],
      office_location: 'Aitkenvale, Townsville',
      funder: 'Department of Justice and Attorney-General',
      restructure_year: 2024
    },
    fiscal_year: '2023-2024',
    location_type: 'palm_island',
    is_public: true,
    is_verified: true
  },
  {
    slug: 'picc-bwgcolman-healing-service-2024',
    title: 'Bwgcolman Healing Service (Primary Health)',
    subtitle: 'RACGP accredited primary health centre serving 2,283 clients',
    summary: 'Renamed in 2024 after community consultation, the Bwgcolman Healing Service provides comprehensive primary healthcare with specialist and allied health services, serving over 2,200 clients.',
    content: `# Bwgcolman Healing Service

## Name Change
In early 2024, PICC officially changed the name of the Primary Health Centre to the **Bwgcolman Healing Service**, with new signage installed. This name change occurred after extensive consultation with the Palm Island community and the Elders' Advisory Group.

## Accreditation
In early 2024, the Bwgcolman Healing Service passed the Quality Practice Accreditation assessment by the **Royal Australian College of General Practitioners (RACGP)** to renew its accreditation as a general-practice medical clinic.

### Assessor Comments
The assessors made special mention of:
- Outstanding cleanliness of the clinic
- High standards of documentation and record-keeping
- Excellent professional standards and friendliness of staff members

Next full accreditation assessment: **2027**

## Client Statistics (2023-24)
- **Total clients**: 2,283
  - Aboriginal, Torres Strait Islander, or both: 1,935
  - Neither Aboriginal nor Torres Strait Islander: 108
  - Indigenous identity unknown: 30
- **Total episodes of care**: 17,488

## Comprehensive Healthcare Services
Wide range of health services available at the medical service, catering to almost all healthcare needs locally, including specialist and allied health services.

## Specialized Programs

### Integrated Team Care (ITC)
Helps patients access equipment to manage chronic conditions.

### Communicable Infections Program
Supports timely access to treatment and through education and contact tracing aims to prevent transmissible infections.

### ARF/RHD Program
Provides tailored support to people diagnosed with Acute Rheumatic Fever/Rheumatic Heart Disease, with the aim of enhancing quality of life and improving healthcare outcomes.

### Eldercare Connector Program
Supports Elders to register with My Aged Care and access homecare packages. **Coming in 2025**: PICC will provide in-home nursing services to support Elders to remain living at home.

### Growing Deadly Families (GDF)
Supports access for women and children to timely healthcare:
- Immunisation
- Psychosocial support
- Paediatricians
- Paediatric cardiology
- Obstetric care
- Gynaecological care

### GP After Hours
Operates Monday to Thursday from **5pm to 9pm**. The after-hours clinic helps to reduce and prevent avoidable JPHS ED presentation and hospital admissions.

## Health Checks (2023-24)
- **715 Health Checks**: 779
- **Child Health Checks**: 128
- **Team Care Arrangements**: 308
- **GP Management Plans**: 293

## 2025 Priority
**Make your healthcare your priority! PLEASE make an appointment with a PICC Doctor to have your 715.**

The medical team encourages all Palm Islanders to have an Annual 715 health check to help improve and maintain the health of all people on Palm Island. People with chronic conditions should book regular appointments with their Doctor every 3 to 6 months to monitor health and update care plans.

## Source
PICC Annual Report 2023-2024, pages 14-17`,
    entry_type: 'service',
    category: 'PICC',
    keywords: ['PICC', 'Bwgcolman Healing Service', 'primary health', 'healthcare', 'RACGP', 'medical clinic', 'health checks'],
    structured_data: {
      source: 'PICC Annual Report 2023-24',
      year: 2024,
      pages: [14, 15, 16, 17],
      clients_2024: 2283,
      episodes_of_care_2024: 17488,
      accreditation: 'RACGP',
      accreditation_year: 2024,
      next_accreditation: 2027,
      health_checks_715: 779,
      child_health_checks: 128,
      after_hours: 'Monday-Thursday 5pm-9pm'
    },
    fiscal_year: '2023-2024',
    location_type: 'palm_island',
    is_public: true,
    is_verified: true
  },
  {
    slug: 'picc-ndis-services-2024',
    title: 'PICC NDIS Services',
    subtitle: 'Support coordination, community connection and access',
    summary: 'PICC NDIS services focus on support coordination with a new Aitkenvale office opened in February 2024, co-located with the Women\'s Healing Service.',
    content: `# PICC NDIS Services

## Overview
The PICC NDIS services continue to grow, with the majority of services focused on:
- Support coordination
- Community connection
- Access to NDIS services

## New Townsville Office
In **February 2024**, the NDIS team moved to a new office in **Aitkenvale, Townsville**, to offer better service to clients in the Townsville region.

### Office Details
- **Location**: Aitkenvale, Townsville
- **Co-location**: Shares space with the Women's Healing Service office
- **Purpose**: Better serve clients in the Townsville region

## Palm Island Services
On Palm Island, the NDIS team is based upstairs in the new Retail Centre, although it services most of its clients in the community.

## Service Statistics (2023-24)

### NDIS Community Connector Program
- **Jul-Sep 2023**: 116 occasions of support
- **Oct-Dec 2023**: 70 occasions of support
- **Jan-Mar 2024**: 209 occasions of support
- **Apr-Jun 2024**: 173 occasions of support

### Initial Planning Meetings Supported
- **Jul-Sep 2023**: 3 meetings
- **Oct-Dec 2023**: 8 meetings
- **Jan-Mar 2024**: 3 meetings
- **Apr-Jun 2024**: 12 meetings

## Service Model
The service helps community members:
- Navigate the NDIS system
- Access NDIS services
- Attend initial planning meetings
- Connect with community resources
- Coordinate support services

## Source
PICC Annual Report 2023-2024, pages 10-11, 13`,
    entry_type: 'service',
    category: 'PICC',
    keywords: ['PICC', 'NDIS', 'disability services', 'support coordination', 'community connection', 'Townsville', 'Aitkenvale'],
    structured_data: {
      source: 'PICC Annual Report 2023-24',
      year: 2024,
      pages: [10, 11, 13],
      townsville_office_opened: '2024-02',
      townsville_location: 'Aitkenvale',
      palm_island_location: 'Retail Centre (upstairs)',
      services: ['support coordination', 'community connection', 'access support']
    },
    fiscal_year: '2023-2024',
    location_type: 'palm_island',
    is_public: true,
    is_verified: true
  },
  {
    slug: 'picc-social-enterprises-2024',
    title: 'PICC Social Enterprises',
    subtitle: 'Community Coffee Shop, Variety Store and Community Member Purchasing',
    summary: 'PICC Social Enterprises employs 44 staff (a quarter of all PICC employees) operating the Community Coffee Shop, Variety Store, and Community Member Purchasing service.',
    content: `# PICC Social Enterprises

## Employment Impact
On 30 June 2024, Social Enterprises had **44 staff members**, a record high and comprising almost **one-quarter of all PICC staff members**.

## Services Offered

### Community Coffee Shop and Variety Store
Provides Palm Islanders with the option to purchase a wide range of products on Palm Island.

#### Product Range Includes:
- Food and coffee
- Clothing
- Household goods
- Phones
- Televisions
- Electronics
- And much more

### Community Member Purchasing (Expanded 2023)
A new service that procures items for special order that are not sold on Palm Island, such as:
- Furniture
- Home appliances

#### Benefits:
- Removes the need for community members to travel to the mainland
- Eliminates the need to organise delivery of large household goods themselves
- Makes purchasing accessible for all community members

## Community Pride
There is a great sense of pride in the people working at the Social Enterprises, which has extended across the broader community. Getting the operations up and running was an enormous task, and the success is visible throughout Palm Island.

## Strategic Importance
Social Enterprises represents a significant portion of PICC's workforce and demonstrates the organisation's commitment to:
- Local employment
- Community economic development
- Accessible services for Palm Islanders
- Building community capacity

## Source
PICC Annual Report 2023-2024, pages 16-17`,
    entry_type: 'service',
    category: 'PICC',
    keywords: ['PICC', 'social enterprises', 'employment', 'coffee shop', 'variety store', 'retail', 'community purchasing'],
    structured_data: {
      source: 'PICC Annual Report 2023-24',
      year: 2024,
      pages: [16, 17],
      employees: 44,
      percentage_of_picc_staff: 25,
      services: ['Community Coffee Shop', 'Variety Store', 'Community Member Purchasing'],
      expansion_year: 2023
    },
    fiscal_year: '2023-2024',
    location_type: 'palm_island',
    is_public: true,
    is_verified: true
  }
]

async function main() {
  console.log('🚀 Starting PICC Annual Report import...')

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
