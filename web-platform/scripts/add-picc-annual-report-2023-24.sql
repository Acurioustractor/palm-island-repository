-- ============================================================================
-- Add PICC 2023-24 Annual Report Content to Knowledge Base
-- Source: PICC 2023-24 Annual Report (publicly available)
-- Date: December 2, 2025
-- ============================================================================

-- PICC Overview and Mission
INSERT INTO knowledge_entries (
  slug,
  title,
  subtitle,
  summary,
  content,
  entry_type,
  category,
  tags,
  metadata
) VALUES (
  'picc-overview-mission-2024',
  'Palm Island Community Company Overview',
  'Making Palm Island a safer, stronger and more prosperous place to live',
  'PICC is a community-controlled not-for-profit delivering human services, community capacity building, economic development, and social enterprises on Palm Island.',
  E'# Palm Island Community Company

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
PICC Annual Report 2023-2024',
  'organization',
  'PICC',
  ARRAY['PICC', 'community services', 'employment', 'economic development', 'Indigenous employment'],
  '{"source": "PICC Annual Report 2023-24", "year": 2024, "pages": [2,3,4,5,18,19], "url": "https://os-data-2.s3-ap-southeast-2.amazonaws.com/picc-com-au/bundle1/picc-2023-24-annual-report.pdf"}'::jsonb
);

-- PICC Leadership 2023-24
INSERT INTO knowledge_entries (
  slug,
  title,
  subtitle,
  summary,
  content,
  entry_type,
  category,
  tags,
  metadata
) VALUES (
  'picc-leadership-2023-24',
  'PICC Leadership 2023-24',
  'Board of Directors and Executive Leadership',
  'PICC is led by CEO Rachel Atkinson and Board Chair Luella Bligh, with a Board of Directors providing governance and strategic direction.',
  E'# PICC Leadership 2023-24

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

She notes that positive changes are becoming evident in the community, particularly among young people who are beginning to feel optimistic about Palm Island\'s future.

## Leadership Philosophy
Both leaders emphasize that **everything PICC does is for, with, and because of the people of Palm Island**. Despite progress, they acknowledge Palm Island continues to lag behind mainland communities in many areas of wellbeing, and PICC remains committed to fighting for Palm Islanders to have the services they deserve.

## Source
PICC Annual Report 2023-2024, pages 2-3',
  'people',
  'PICC',
  ARRAY['PICC', 'leadership', 'governance', 'Rachel Atkinson', 'Luella Bligh'],
  '{"source": "PICC Annual Report 2023-24", "year": 2024, "pages": [2,3,4]}'::jsonb
);

-- PICC Services
INSERT INTO knowledge_entries (
  slug,
  title,
  subtitle,
  summary,
  content,
  entry_type,
  category,
  tags,
  metadata
) VALUES (
  'picc-services-2023-24',
  'PICC Services and Programs',
  'Comprehensive community services delivered by PICC',
  'PICC delivers 16 distinct services spanning community services, healthcare, youth support, family wellbeing, and social enterprises.',
  E'# PICC Services and Programs

PICC delivers a comprehensive range of services to the Palm Island community:

## Community Services
1. **Bwgcolman Healing Service** (Primary Health Centre)
2. **Community Justice Group**
3. **Diversionary Service**
4. **Early Childhood Services (CFC)** - Children and Family Centre
5. **Family Care Service**
6. **Family Participation Program**
7. **Family Wellbeing Centre**
8. **NDIS Service**
9. **Safe Haven**
10. **Safe House**
11. **Social and Emotional Wellbeing Service**
12. **Specialist Domestic and Family Violence Service**
13. **Women\'s Healing Service**
14. **Women\'s Service**
15. **Youth Service**

## Digital Services
16. **Digital Service Centre** - Partnership with Telstra providing customer service for First Nations customers across Australia

## Social Enterprises
- **Community Coffee Shop and Variety Store**
- **Mechanics workshop**
- **Fuel station**
- **Bakery** (providing daily fresh bread)

## Healthcare Services Detail

### Bwgcolman Healing Service
Renamed from "Primary Health Centre" in 2024 after extensive consultation with the community and Elders\' Advisory Group.

**Specialized Programs:**
- **Integrated Team Care (ITC)** - Helps patients access equipment for chronic conditions
- **Communicable Infections Program** - Timely treatment access, education, contact tracing
- **ARF/RHD Program** - Tailored support for ARF/RHD patients
- **Eldercare Connector Program** - Supports Elders with My Aged Care registration and homecare packages
- **Growing Deadly Families (GDF)** - Supports women and children with healthcare access, immunization, psychosocial support
- **GP After Hours** - Monday to Thursday, 5pm-9pm (reduces avoidable JPHS ED presentations)

### Healthcare Statistics (2023-24)
- **2,283 total clients** (up from 2,050 in 2022-23)
- **1,935 Aboriginal and/or Torres Strait Islander clients**
- **17,488 episodes of care**
- **779 "715" Health Checks** performed
- **128 Child Health Checks**
- **308 Team Care Arrangements**
- **293 GP Management Plans**

## Community Services Statistics (2023-24)

### Family Care Services
- 81 service users across the year
- **6,698 total placement nights** (up from 5,656 previous year)

### Safe House
- 24 service users
- **1,439 placement nights** (up from 1,069)

### Family Wellbeing Services
- Served **20-23 families per quarter**
- Total annual reach: ~80 families

### Diversionary Services
- **175-182 service users per quarter** (Q1-Q3 2023-24)

### Women\'s Service
- **21 women and children staying at service** per quarter (average)
- **35-51 women and children receiving support** (not staying) per quarter

### Safe Haven
- **255-355 children and young people supported** per quarter

### Early Childhood Services
- **405 individual children** attending CFC programs (Q1 2023-24)
- **306 children** (Q2 2023-24)

### NDIS Community Connector Program
- **568 total occasions** of support (2023-24)
- **26 initial planning meetings** supported

## Education Partnership
**Breakfast Club and Safe Haven Program** - Partnership with Bwgcolman Community School

## Accreditation
- Passed Human Services Quality Framework interim audit (November 2023)
- Next full audit due first half of 2025
- Bwgcolman Healing Service passed Quality Practice Accreditation (RACGP) in early 2024
- Assessors noted: "outstanding cleanliness," "high standards of documentation," "excellent professional standards"
- Next full accreditation: 2027

## Source
PICC Annual Report 2023-2024, pages 4-17',
  'services',
  'PICC',
  ARRAY['PICC', 'services', 'healthcare', 'community services', 'family support', 'youth services', 'NDIS'],
  '{"source": "PICC Annual Report 2023-24", "year": 2024, "pages": [4,5,10,11,12,13,14,15,16,17]}'::jsonb
);

-- Digital Service Centre
INSERT INTO knowledge_entries (
  slug,
  title,
  subtitle,
  summary,
  content,
  entry_type,
  category,
  tags,
  metadata
) VALUES (
  'picc-digital-service-centre-2023',
  'Palm Island Digital Service Centre',
  'Palm Islanders taking calls from across Australia',
  'Opened in 2023, the Digital Service Centre employs 21 Palm Islanders to provide Telstra customer service for Aboriginal and Torres Strait Islander customers nationwide.',
  E'# Palm Island Digital Service Centre

## Overview
Opened in 2023, the Palm Island Digital Service Centre has been a great success for PICC and the community. The Centre provides sales and customer service for Telstra landline, mobile, and Internet products and services for Aboriginal and Torres Strait Islander customers across Australia.

## Key Features
- **21 full-time workers** employed (as of end 2023-24)
- **Capacity for 30 full-time equivalent workers** if demand requires
- **Located in the new Retail Centre on Main Street**
- **Can connect callers with interpreters for about 50 First Nations languages**

## Partnership
The Centre is a partnership between:
- Palm Island Community Company (PICC) - operator
- Telstra
- Palm Island Aboriginal Shire Council
- State of Queensland

Being operated by PICC, it is **another service fully owned by the community**.

## Timeline
- **16 June 2023**: Official pilot project launch
- **July 2023**: First cohort training started
- **October 2023**: First cohort completed training
- **23 October 2023**: Centre took its first calls
- **November 2023**: Second cohort began training
- **February 2024**: Second cohort started taking calls
- **Pilot phase ends**: 31 January 2025

## Training Program
Workers receive comprehensive training at no cost:

1. **12-week intensive course** at Palm Island TAFE
2. **5-week introduction** to call centre and customer service work from Telstra
3. **Certificate III in Business** (studied while working)

Throughout training, all trainees receive wages to support themselves and their families before formal employment begins.

## Community Impact
> "There is a great sense of pride in the people working at the digital service centre which has extended across the broader community. Getting the centre up and running was an enormous task."

The centre represents:
- **New industry** for Palm Island
- **Exciting career pathway** in information technology
- **Local employment** in a remote community
- **Improved support** for First Nations customers of Telstra throughout Australia

## Future Plans
- Continue to grow footprint and improve capacity
- Support Digital Service Centre staff development
- Develop local leadership within the team
- Potential to expand First Nations digital service centre operations on Palm Island and elsewhere

## National Context
The Palm Island Centre is the **second of its kind in Australia**, following the Cherbourg centre opened in 2022. These Centres are part of the **First Nations Connect scheme** from Telstra, in partnership with:
- **Advance Queensland** (Department of Tourism, Innovation and Sport)
- **Deadly Innovation Strategy**
- **State of Queensland Digital Economy Strategy**

## Next Steps
By 31 January 2025, PICC intends to renegotiate the service agreement and establish a **permanently funded Centre**.

## Significance
PICC is enormously proud to be involved in this pioneering effort to provide local employment and training in information technology in a remote community.

## Source
PICC Annual Report 2023-2024, pages 6-7',
  'innovation',
  'PICC',
  ARRAY['PICC', 'Digital Service Centre', 'Telstra', 'employment', 'training', 'technology', 'First Nations'],
  '{"source": "PICC Annual Report 2023-24", "year": 2024, "pages": [6,7]}'::jsonb
);

-- Delegated Authority / Bwgcolman Way
INSERT INTO knowledge_entries (
  slug,
  title,
  subtitle,
  summary,
  content,
  entry_type,
  category,
  tags,
  metadata
) VALUES (
  'picc-delegated-authority-bwgcolman-way',
  'Delegated Authority: Bwgcolman Way Service',
  'At last, the community will decide care arrangements for children',
  'A major change to child protection on Palm Island: delegated authority allows PICC CEO to make decisions about children in care, ensuring community-led, culturally appropriate care arrangements.',
  E'# Delegated Authority: Bwgcolman Way

## Historic Change
> "At last, the community will decide the care arrangements for children who cannot stay at home, a change for which I have been fighting for decades." - Rachel Atkinson, CEO

## What is Delegated Authority?
Delegated authority is being progressively introduced in communities throughout Queensland by the Department of Child Safety, Seniors and Disability Services.

For Palm Island, there is **only one person** whom the Director-General has delegated authority to make decisions concerning children in care: **the Chief Executive Officer of PICC**.

## The Bwgcolman Way Approach
PICC has named this approach **"Bwgcolman Way: Empowered and Resilient"**
- **"Bwgcolman"** means "many tribes, one people"
- Emphasizes empowerment from grandparents and ancestors
- Reflects resilience through continued struggle for better future for children

## Vision
> "All Manbarra and Bwgcolman children are safe and cared for by family, nurtured by strong and enduring connections to their community, culture and Country. Palm Island mob leading and creating change for Palm Island children, young people and families."

## How It Works
**Bwgcolman Way will focus on family and cultural connection** where the CEO of PICC will collaboratively make decisions under the Child Protection Act with children and families in partnership with Child Safety Services.

### Key Features
- **Elders, traditional owner groups, and community** have genuine participation in implementation and development
- **Strongly place-based and community-led**
- **Complements existing PICC services**: Family Wellbeing Service, Safe Haven, Family Participation Program, Family Care Services, Safe House

## Legislative Requirements
PICC and the PICC CEO meet the legislative requirements of prescribed delegates for Aboriginal and Torres Strait Islander children, as outlined in **Sections 148BA and 148BB(3) of the Child Protection Act 1999 (Qld)**.

## Investment
PICC has invested its own resources in this exploration phase, growing a network of collaborators and champions who will support PICC as it moves towards this new approach.

## National and State Context

### State Goal (Queensland)
According to *Reclaiming Our Storyline: Transforming decisions and practice by making decisions in our way* (State of Queensland, 2023):
- Introduce "routine access to delegated authority across a range of functions and powers" statewide by **2032**
- **Eliminate the disproportionate number** of Aboriginal and Torres Strait Islander children in out-of-home care by **2037**

### National Goal
Achieve **target 12 of the National Agreement on Closing the Gap**:
- **Reduce the disproportionate rate** of Aboriginal and Torres Strait Islander children in out-of-home care by **45% by 2030**

### Current Statistics
As of 30 June 2022:
- Aboriginal and Torres Strait Islander children made up **45.2% of all children in out-of-home care** in Queensland
- Yet they were only **8% of all children** in the state at that time

## Future Reporting
More information about delegated authority and how it operates on Palm Island will be available in future annual reports when the Bwgcolman Way service is operational.

## Significance
This represents a **significant and positive shift** for children in care on Palm Island, moving decision-making power from government to community, ensuring care arrangements respect family connections, culture, and Country.

## Source
PICC Annual Report 2023-2024, pages 8-9',
  'child_protection',
  'PICC',
  ARRAY['PICC', 'delegated authority', 'Bwgcolman Way', 'child protection', 'self-determination', 'Closing the Gap'],
  '{"source": "PICC Annual Report 2023-24", "year": 2024, "pages": [8,9]}'::jsonb
);

-- Women's Healing Service
INSERT INTO knowledge_entries (
  slug,
  title,
  subtitle,
  summary,
  content,
  entry_type,
  category,
  tags,
  metadata
) VALUES (
  'picc-womens-healing-service-2024',
  'Women\'s Healing Service Restructure',
  'Giving better help to women at risk of, or in, custody',
  'PICC restructured its Women\'s Healing Service in 2024 to provide better services to women resident, or at risk of being resident, in Townsville Women\'s Correctional Centre.',
  E'# Women\'s Healing Service Restructure 2024

## Background
In 2023, funding ended for women\'s healing pilot programs in prison across Queensland. While PICC and the state government considered the service a broad success, COVID-19 restrictions had hindered delivery, preventing services from being delivered in prison for many months during 2020-2021.

## New Model (2024)
PICC negotiated for a new Women\'s Healing Service contract and restructured the service to **strengthen its critical goal of preventing women from entering prison**, and to give better assistance before and after prison stays.

## Three Core Programs

### 1. Re-entry Program
**For women soon to leave custody**
- Preparation for release
- Connection to community services
- Reintegration support

### 2. Women on Remand Program
**For women in custody awaiting trial**
- Support during remand period
- Legal process navigation
- Mental health and wellbeing support

### 3. Early Intervention Program (Palm Island)
**For women at risk of entering prison**
- **Preventative focus**
- Community-based support
- Addressing underlying issues before incarceration

## Expanded Service Delivery
The restructured service now provides assistance to women:
- **Before custody** (Early Intervention Program)
- **During custody** (Women on Remand Program)
- **After custody** (Re-entry Program)

## New Aitkenvale Office
The Service now has an office in **Aitkenvale, Townsville** as a service centre for clients in the community:
- **Conveniently close** to other services with which the Women\'s Healing Service collaborates
- **Accessible** to many clients who use other services in the area
- **Collocated with PICC NDIS team**

## Pilot Program Learnings
From the 2020-2023 pilot experience, PICC learned:
- There was **much more work to be done** to help and support target clients
- COVID-19 restrictions significantly impacted service delivery
- Despite challenges, the Service was considered **successful compared to others** in the pilot program across Queensland
- There was **necessity for such a service** for women in, or at risk of being in, Townsville Women\'s Correctional Centre
- There was **lack of alternative service** for such women in north Queensland

## Funding
The restructured Women\'s Healing Service is funded by the **Department of Justice and the Attorney-General**.

## Significance
This restructure represents PICC\'s commitment to:
- **Prevention over incarceration**
- **Holistic support** across the justice system continuum
- **Accessible services** for women in both remote and urban settings
- **Learning and improving** from pilot program experiences

## Service Model Evolution
The 2024 restructure positions the Women\'s Healing Service to be more effective in:
- Preventing women from entering the justice system
- Supporting women during court processes
- Facilitating successful reintegration into community
- Providing ongoing support to reduce recidivism

## Source
PICC Annual Report 2023-2024, pages 9',
  'services',
  'PICC',
  ARRAY['PICC', 'Women\'s Healing Service', 'justice', 'incarceration', 'women\'s services', 'prevention'],
  '{"source": "PICC Annual Report 2023-24", "year": 2024, "pages": [9]}'::jsonb
);

-- Key Achievements 2023-24
INSERT INTO knowledge_entries (
  slug,
  title,
  subtitle,
  summary,
  content,
  entry_type,
  category,
  tags,
  metadata
) VALUES (
  'picc-key-achievements-2023-24',
  'PICC Key Achievements 2023-24',
  'Major milestones and successes across all service areas',
  'PICC achieved significant milestones in 2023-24 including 197 employees, Digital Service Centre launch, 200 Jobs Program success, and delegated authority implementation.',
  E'# PICC Key Achievements 2023-24

## Corporate Governance
- **80%+ of staff** identify as Aboriginal, Torres Strait Islander, or both
- **70%+ of staff** live on Palm Island
- **197 total staff members** (up from 151 in 2022-23)
- **33% increase in staff** year-over-year
- **75% of workforce are Palm Islanders**
- Palm Island Holding Company Ltd officially wound up after completion of final reporting

### Quality Accreditation
- **November 2023**: Passed Human Services Quality Framework interim audit "with flying colours"
- Next full audit due first half of 2025

## Community Services Achievements

### 200 Jobs Program (NIAA Grant Success)
- **15 community job seekers** participated in ten-week work readiness bootcamp
- Upon completion, participants embark on **Certificate III in Community Services** over 12 months
- Participants work in PICC program areas during training, gaining hands-on experience

### Blue Card Liaison Officer (June 2024)
- New position created to support organizations and community members with Blue Card matters
- Offers education and support for child-related positions
- Receives referrals from Rainbow Gateway jobseekers
- Builds capacity of PICC staff members
- Funded by Department of Justice and Attorney General

### NDIS Services Growth
- **February 2024**: NDIS moved to new office in Aitkenvale, Townsville
- Collocated with Women\'s Healing Service office
- Majority of services: support coordination, community connection, and access
- Based upstairs in new Retail Centre on Palm Island
- Services most clients in the community

## Primary Health Services

### Bwgcolman Healing Service Renamed
- Official name change from "Primary Health Centre" in 2024
- New signage installed early 2024
- Name change after **extensive consultation** with Palm Island community and Elders\' Advisory Group

### RACGP Accreditation (Early 2024)
- Passed Quality Practice Accreditation assessment
- Assessors praised:
  - **"Outstanding cleanliness"** of clinic
  - **"High standards of documentation and record-keeping"**
  - **"Excellent professional standards and friendliness"** of staff
- Next full accreditation: 2027

### Expanded Healthcare Services
Wide range of services now available locally:
- Specialist and allied health services
- Integrated Team Care (ITC)
- Communicable Infections Program
- ARF/RHD Program
- Eldercare Connector Program
- Growing Deadly Families (GDF)
- GP After Hours (Monday-Thursday, 5pm-9pm)

## Social Enterprises

### Product Range Expansion (2023)
- PICC Community Coffee Shop and Variety Store expanded services
- **Community Member Purchasing** launched: procuring special order items not sold on Palm Island (furniture, appliances)
- Removes need for community members to travel to mainland for large household goods

### Record Employment
- **44 staff members** on 30 June 2024 (record high)
- Comprises almost **one-quarter of all PICC staff members**

## National Profile

### SNAICC Conference Presentations (September 2023, Darwin)
PICC presented twice at the biennial SNAICC Conference:

1. **"The Storyline of the Palm Island Children and Family Centre"**
   - History and successes of CFC and early childhood services

2. **"Proud Bwgcolman Youth"** (Jeanie Sam and Dee Ann Sailor)
   - Hopeful narrative about young people
   - Alternative approach to youth justice system over-representation
   - Both sessions very well attended

### Professional Development
PICC staff attended other conferences and events throughout the year to:
- Learn from similar organizations
- Bring modern knowledge and best practices to Palm Island

## Service Growth Trends
Year-over-year comparison shows consistent growth:
- Family Care Services: 6,698 placement nights (up from 5,656)
- Safe House: 1,439 placement nights (up from 1,069)
- Bwgcolman Healing Service: 2,283 clients (up from 2,050)

## Community Impact
- **$5.8 million in wages** delivered to community
- **$9.75 million in economic output** for community
- **Over 100 local jobs created**
- **400 Aboriginal/Torres Strait Islander staff** employed over time

## Significance
These achievements demonstrate PICC\'s commitment to:
- Local employment and economic development
- Quality service delivery with proper accreditation
- Community control and self-determination
- Innovation in service models
- National leadership in Indigenous community services

## Source
PICC Annual Report 2023-2024, pages 4-17',
  'achievements',
  'PICC',
  ARRAY['PICC', 'achievements', 'employment', 'services', 'growth', 'community development'],
  '{"source": "PICC Annual Report 2023-24", "year": 2024, "pages": [4,5,6,7,8,9,10,15,16,17,18]}'::jsonb
);

-- Run with: psql -d your_database -f add-picc-annual-report-2023-24.sql
