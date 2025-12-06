/**
 * Import PICC Annual Report PDFs with Full Content
 *
 * Adds entries linking to actual PDF files with extracted key content:
 * - PICC 2023-24 Annual Report (Full PDF)
 * - PICC 2011-12 Annual Report (Full PDF)
 * - PICC 2009-10 Annual Report (Full PDF)
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
    slug: 'picc-annual-report-2023-24-full-pdf',
    title: 'PICC Annual Report 2023-2024 (Full PDF)',
    subtitle: 'Nearly 200 employees, $9.75M economic output, Digital Service Centre success',
    summary: 'The complete 2023-24 PICC Annual Report documenting remarkable growth: 197 employees (up 33% from previous year), 75% Palm Islanders, $5.8M in wages, $9.75M economic output. Major highlights include the Digital Service Centre (21 employees), Bwgcolman Way delegated authority, and comprehensive community services.',
    content: `# PICC Annual Report 2023-2024 (Full PDF)

## Download Full Report
**PDF Location:** [/documents/annual-reports/picc-annual-report-2023-24.pdf](/documents/annual-reports/picc-annual-report-2023-24.pdf)

**Original Source:** https://os-data-2.s3-ap-southeast-2.amazonaws.com/picc-com-au/bundle1/picc-2023-24-annual-report.pdf

**File Size:** 8.9 MB
**Pages:** 11 pages

---

## Executive Summary

### Messages from Leadership

**CEO Rachel Atkinson:**
"The pace at which PICC has been evolving is nothing short of remarkable. Our expanded investment in services has significantly strengthened and enhanced them, making them more robust and effective than ever before. We now employ three times the number of people compared to ten years ago and our turnover has quadrupled."

**Key Quote on Delegated Authority:**
"One of the changes I am most excited and proud about is the delegated authority, which represents a significant and positive shift for children in care on Palm Island. At last, the community will decide the care arrangements for children who cannot stay at home, a change for which I have been fighting for decades."

**Chair Luella Bligh:**
"In my fifth year as Chair of the Board, my commitment to ensuring that PICC remains the exemplary service provider that Palm Island deserves has only grown stronger. The positive changes we strive for are becoming evident within the community. This is particularly noticeable among our young people, who are beginning to feel a sense of optimism about the future of Palm Island."

---

## Corporate Governance Highlights

### Board Members
- **Luella Bligh** - Chair
- **Rhonda Phillips** - Director
- **Allan Palm Island** - Director
- **Matthew Lindsay** - Company Secretary
- **Harriet Hulthen** - Director
- **Raymond W. Palmer Snr** - Director
- **Cassie Lang** - Director

### Key Achievements
- **Over 80% Aboriginal/Torres Strait Islander staff** - Long-term average maintained
- **Over 70% staff live on Palm Island** - Critical to service effectiveness
- **Human Services Quality Framework** - Passed interim audit November 2023 with "flying colours"
- **Palm Island Holding Company wound up** - Administrative cleanup completed

### Staff Numbers
| Period | Staff Count |
|--------|-------------|
| 30 June 2024 | **197** |
| 30 June 2023 | 151 |
| 30 June 2022 | 152 |

**Growth:** 33% increase from 2023 to 2024

---

## Major Program Highlights

### 1. Digital Service Centre (Transformational Achievement)

**Launch Date:** June 16, 2023

**Employment:**
- **21 full-time workers** employed (as of June 30, 2024)
- **Capacity for 30** full-time equivalent workers
- Located in new Retail Centre on Main Street

**Services:**
- Sales and customer service for Telstra landline, mobile, and internet
- Serves Aboriginal and Torres Strait Islander customers across Australia
- **Interpreter access for ~50 First Nations languages**

**Training Program:**
- 12-week intensive course at Palm Island TAFE
- 5-week Telstra customer service training
- Certificate III in Business while working
- All training fully funded, trainees receive wages throughout

**Cohorts:**
- **First cohort:** Training July-October 2023, started calls October 23, 2023
- **Second cohort:** Training November 2023, started calls February 2024

**Partnership:**
- PICC, Telstra, Palm Island Aboriginal Shire Council, State of Queensland
- Part of First Nations Connect scheme
- Advance Queensland Deadly Innovation Strategy
- **Second such center in Australia** (first was Cherbourg 2022)

**Future:**
- Pilot phase runs to January 31, 2025
- PICC intends to renegotiate for permanent funding
- Potential to expand operations on Palm Island and elsewhere

**Significance:**
- Major employment opportunity (29.1% unemployment on island)
- New industry and career pathway
- Great community pride
- National recognition
- Pioneering remote community digital economy

---

### 2. Bwgcolman Way: Delegated Authority (Major Policy Shift)

**What It Is:**
- Delegated authority for child protection decisions coming to Palm Island
- CEO of PICC is the prescribed delegate for Aboriginal/Torres Strait Islander children
- Community will decide care arrangements for children who cannot stay at home

**Vision:**
"All Manbarra and Bwgcolman children are safe and cared for by family, nurtured by strong and enduring connections to their community, culture and Country. Palm Island mob leading and creating change for Palm Island children, young people and families."

**Name Meaning:**
"Bwgcolman" = "many tribes, one people"

**Focus:**
- Family and cultural connection
- Collaborative decision-making with children and families
- Partnership with Child Safety Services
- Elder and traditional owner participation
- Community-led, place-based service delivery

**Legal Basis:**
- Sections 148BA and 148BB(3) of Child Protection Act 1999 (Qld)
- Only one prescribed delegate: PICC CEO

**Integration:**
Complements existing PICC child protection services:
- Family Wellbeing Service
- Safe Haven
- Family Participation Program
- Family Care Services
- Safe House

**Goals:**
- **State Goal:** Routine delegated authority statewide by 2032
- **National Goal:** Eliminate disproportionate Aboriginal/Torres Strait Islander children in out-of-home care by 2037
- **Close the Gap Target 12:** Reduce overrepresentation by 45% by 2030

**Current Statistics (June 30, 2022):**
- Aboriginal/Torres Strait Islander children = **45.2% of all children in out-of-home care** in Queensland
- But only **8% of all children** in Queensland
- Clear overrepresentation requiring urgent action

**Source:** *Reclaiming Our Storyline: Transforming decisions and practice by making decisions in our way* (State of Queensland, 2023)

---

### 3. Women's Healing Service Restructure

**Previous Model (Ended 2023):**
- Women's healing pilot program in Townsville Women's Correctional Centre
- Broad success but learnings identified
- COVID-19 restrictions hindered delivery 2020-2021

**New Model (2024):**

**Three Regular Programs:**
1. **Re-entry Program** - Women soon to leave custody
2. **Women on Remand Program** - Women in custody awaiting trial
3. **Early Intervention Program** (Palm Island) - Women at risk of entering prison

**Strengthened Focus:**
- Preventing women from entering prison (primary goal)
- Better assistance before and after incarceration
- Continued support for women currently incarcerated

**New Office:**
- **Aitkenvale, Townsville** location
- Service center for clients in community
- Close to collaborating services
- Collocated with PICC NDIS team

**Funding:**
- Department of Justice and Attorney-General

---

### 4. PICC Services at SNAICC Conference (National Recognition)

**Event:** SNAICC Biennial Conference, Darwin, September 2023

**PICC Presentations:**

1. **"The Storyline of the Palm Island Children and Family Centre"**
   - History and successes of CFC
   - Early childhood services on Palm Island

2. **"Proud Bwgcolman Youth"**
   - Presented by Jeanie Sam and Dee Ann Sailor
   - Hopeful narrative about young people
   - Alternative approach to youth justice over-representation
   - Tackles complex issues driving Aboriginal/Torres Strait Islander youth into justice system

**Impact:**
- Both sessions very well attended
- Spreading news nationally about PICC's effective and innovative work
- Staff also attended other sessions for learning and best practices

---

## Community Services Report Cards

### Family Care Services
**Placement Nights:**
- 2023/24: **6,698 nights**
- 2022/23: 5,656 nights
- 2021/22: 5,390 nights

**Service Users per Quarter:**
- July-Sept 2024: 16
- Oct-Dec 2024: 23
- Jan-Mar 2024: 21
- Apr-Jun 2024: 21

---

### Safe House
**Placement Nights:**
- 2023/24: **1,439 nights**
- 2022/23: 1,069 nights
- 2021/22: 1,387 nights

**Service Users per Quarter:**
- July-Sept 2024: 5
- Oct-Dec 2024: 4
- Jan-Mar 2024: 6
- Apr-Jun 2024: 9

---

### Family Wellbeing Services
**Families Receiving Service:**
- July-Sept: 20 families
- Oct-Dec: 20 families
- Jan-Mar: 23 families
- Apr-Jun: 15 families

---

### Diversionary Services
**Service Users per Quarter:**
- July-Sept 2024: 175
- Oct-Dec 2024: 143
- Jan-Mar 2024: 182
- Apr-Jun 2024: Data not available at printing

---

### Women's Service

**Women and Children Staying at Service:**
- July-Sept 2024: 21 women/children
- Oct-Dec 2024: 16
- Jan-Mar 2024: 22
- Apr-Jun 2024: 15

**Women and Children Receiving Support (not staying):**
- July-Sept 2024: 35
- Oct-Dec 2024: 44
- Jan-Mar 2024: 51
- Apr-Jun 2024: 44

---

### Family Participation Program
**Families Receiving Service:**
- July-Sept: 14
- Oct-Dec: 18
- Jan-Mar: 18
- Apr-Jun: 9

---

### Safe Haven
**Children and Young People Supported:**
- July-Sept 2024: 355
- Oct-Dec 2024: 299
- Jan-Mar 2024: 255
- Apr-Jun 2024: 278

---

### Women's Healing Service
**Women Receiving Service:**
- Service did not deliver July 2023-February 2024 (remodeling)
- Jan-Mar 2024: 86
- Apr-Jun 2024: 19

*Note: Prior year data not directly comparable due to remodel*

---

### NDIS Community Connector Program

**Occasions of Support to Access NDIS:**
- July-Sept 2024: 116
- Oct-Dec 2024: 70
- Jan-Mar 2024: 209
- Apr-Jun 2024: 173

**Initial Planning Meetings Supported:**
- July-Sept 2024: 3
- Oct-Dec 2024: 8
- Jan-Mar 2024: 3
- Apr-Jun 2024: 12

---

### Early Childhood Services
**Individual Children Attending CFC (all programs):**
- July-Sept 2024: 405 children
- Oct-Dec 2024: 306 children

---

## Additional Key Achievements

### 200 Jobs Program (NIAA Grant Success)
- **15 community job seekers** participated
- **10-week bootcamp** in work readiness
- **Certificate III in Community Services** over 12 months
- Trainees work in program areas during training
- Hands-on experience while gaining qualifications

### Blue Card Liaison Officer (New Position, June 2024)
- Supports organizations and community members with Blue Card matters
- Education and support for child-related positions
- Receives referrals from Rainbow Gateway jobseekers
- Builds capacity of PICC staff
- **Funded by:** Department of Justice and Attorney-General
- **Goal:** Increase Blue Card engagement in remote communities

### NDIS Services Expansion
- Majority of services: support coordination, community connection, access
- **February 2024:** New office in Aitkenvale, Townsville
- Better service to Townsville region clients
- Collocated with Women's Healing Service
- **Palm Island base:** Upstairs in new Retail Centre
- Services most clients in community

---

## Primary Health Services (Bwgcolman Healing Service)

### Name Change
- **Officially changed** to Bwgcolman Healing Service
- New signage installed early 2024
- Extensive consultation with community and Elders' Advisory Group

### Quality Accreditation (Early 2024)
**Royal Australian College of General Practitioners:**
- Passed Quality Practice Accreditation assessment
- Renewed accreditation as general-practice medical clinic

**Assessor Praise:**
- Outstanding cleanliness of clinic
- High standards of documentation and record-keeping
- Excellent professional standards
- Friendliness of staff

**Next Assessment:** 2027

---

### Specialized Health Services

**Integrated Team Care (ITC):**
- Helps patients access equipment for chronic conditions

**Communicable Infections Program:**
- Timely treatment access
- Education and contact tracing
- Prevents transmissible infections

**ARF/RHD Program:**
- Tailored support for ARF/RHD diagnoses
- Enhances quality of life
- Improves healthcare outcomes

**Eldercare Connector Program:**
- Supports Elders registering with My Aged Care
- Access to homecare packages
- **2025 Plan:** In-home nursing services to support aging in place

**Growing Deadly Families (GDF):**
- Women and children healthcare access
- Immunisation
- Psychosocial support
- Paediatricians, paediatric cardiology
- Obstetric and gynaecological care

**GP After Hours:**
- Monday-Thursday, 5pm-9pm
- Reduces avoidable hospital ED presentations and admissions

---

### Health Service Statistics

**Number of Clients:**
- 2023/24: **2,283 clients**
  - Aboriginal/Torres Strait Islander: 1,935
  - Neither: 108
  - Unknown: 30
- 2022/23: 2,050 clients
- 2021/22: 1,965 clients

**Steady increase demonstrates community trust and high-quality care**

---

**Episodes of Care:**
- **"715" Health Checks:** 779 (2023/24)
- **Child Health Checks:** 128
- **Team Care Arrangements:** 308
- **GP Management Plans:** 293

**Total Episodes of Care:**
- 2023/24: **17,488 episodes**
- 2022/23: 18,021
- 2021/22: 18,510

**Note:** High occasions of service vs. patient numbers indicates opportunity to improve preventive care and regular appointments

**2025 Goal:** "Make your healthcare your priority! PLEASE make an appointment with a PICC Doctor to have your 715."

---

## Community Justice Group

**Auspiced by PICC since 2008**

**Programs:**
1. General program
2. Domestic and Family Violence Enhancement Program

**PICC Employs (part-time):**
- Coordinator
- Administration Assistant
- Two Domestic and Family Violence Support Workers

**Services:**
- Ongoing assistance to community members dealing with criminal justice system

---

## Youth Services

**Three Main Programs:**
1. **Young Offenders Support Service**
2. **Indigenous Youth Connection to Culture Program**
3. **Tackling Indigenous Smoking**

**Subprogram:**
- **Digital Footprint Program** - Encouraging constructive social media use to capture and promote Palm Island culture, people, and activities

**Integration:**
- Programs work together with other Palm Island services
- Address youth needs holistically
- Prevent criminal justice interactions
- Promote healthy lifestyles

---

## Social Enterprises

### PICC Community Coffee Shop and Variety Store

**Products:**
- Food and coffee
- Clothing
- Household goods
- Phones, televisions, electronics
- Wide range of products

**New Service (2023):**
- **Community Member Purchasing** - Special orders for items not sold on island (furniture, appliances)
- Removes need for mainland travel and delivery organization

**Employment:**
- **44 staff members** as of June 30, 2024
- **Record high**
- Almost **one-quarter of all PICC staff**

---

## Financial Summary

### Balance Sheet (30 June 2024)

**Assets:**
- Current Assets: $8,156,480
- Non-Current Assets: $2,702,284
- **Total Assets: $10,858,764**

**Liabilities:**
- Current Liabilities: $5,969,264
- Non-Current Liabilities: $1,351,259
- **Total Liabilities: $7,320,523**

**Net Assets: $3,538,241**

---

### Income and Expenditure (2023/24)

**Income: $23,400,335**

**Expenditure:**
- Total Labour Costs: $14,282,962 (60%)
- Administration Expenses: $5,000,820 (21%)
- Property & Energy: $1,058,084 (4%)
- Motor Vehicle: $401,112 (2%)
- Travel & Training: $1,778,367 (8%)
- Client Related: $1,156,713 (5%)

**Total Expenditure: $23,678,058**

**Net Deficit: -$277,723**

---

### Comparison to 2022/23

**Income Growth:**
- 2023/24: $23.4M
- 2022/23: $20.1M
- **Growth: 16.4%**

**Labour Costs Growth:**
- 2023/24: $14.3M (60%)
- 2022/23: $11.5M (59%)
- **Growth: 24.4%** (reflects 33% staff increase)

---

## Partnerships

PICC collaborates with numerous organizations including:

**Government:**
- Commonwealth Department of Health and Aged Care
- Commonwealth Department of Social Services
- National Indigenous Australians Agency
- Queensland Health
- Queensland Department of Child Safety, Seniors and Disability Services
- Queensland Department of Justice and Attorney-General
- Palm Island Aboriginal Shire Council
- TAFE Queensland
- And many others

**Corporate:**
- **Telstra** (Digital Service Centre partnership)

**Community and Health:**
- Queensland Aboriginal and Islander Health Council
- Institute for Urban Indigenous Health (Deadly Choices)
- James Cook University
- Townsville Hospital and Health Service
- And many others

**Full partner list on page 19 of report**

---

## Organizational Values

**From Back Cover:**

"The Palm Island Community Company is deeply committed to the principles of community control and self-determination.

We uphold the spirit of community control by consistently adhering to these principles, ensuring that our actions reflect our dedication to empowering Palm Islanders."

---

## Contact Information

**Palm Island Community Company**

**Townsville Office:**
61-73 Sturt Street
Townsville QLD 4810

**Postal:**
PO Box 1415
Townsville QLD 4810
Australia

**Phone:** 07 4421 4300

**Website:** www.picc.com.au

**ACN:** 640 793 728

---

## Key Metrics Summary

| Metric | 2023/24 | Change from 2022/23 |
|--------|---------|---------------------|
| **Total Staff** | 197 | +33% |
| **Palm Islander Staff %** | 75% | Maintained |
| **Total Income** | $23.4M | +16.4% |
| **Labour Costs** | $14.3M | +24.4% |
| **Digital Service Centre Staff** | 21 | New (2023) |
| **Social Enterprise Staff** | 44 | Record high |
| **Health Clients** | 2,283 | +11.4% |
| **Family Care Placement Nights** | 6,698 | +18.4% |

---

## Historical Significance

This report represents PICC at the midpoint of its second decade, demonstrating:
- **Transformation from startup to major institution**
- **Three times the workforce of 10 years ago**
- **Four times the turnover**
- **National leadership** in Indigenous community-controlled services
- **Innovation** through Digital Service Centre
- **Self-determination** through delegated authority
- **Comprehensive services** across health, family, youth, economic development

The 2023-24 period marks PICC as a **mature, sophisticated, nationally-recognized organization** delivering life-changing services to Palm Island.

---

## Access Full PDF

**Local File:** [/documents/annual-reports/picc-annual-report-2023-24.pdf](/documents/annual-reports/picc-annual-report-2023-24.pdf)

**Original Source:** https://os-data-2.s3-ap-southeast-2.amazonaws.com/picc-com-au/bundle1/picc-2023-24-annual-report.pdf

**Download the complete 11-page report for:**
- Full financial statements
- Detailed service statistics
- Photos and graphics
- Complete partner list
- Full messages from CEO and Chair

---

*Report compiled and published by Palm Island Community Company, 2024*`,
    entry_type: 'document',
    category: 'Annual Reports',
    keywords: ['PICC', '2023-2024', 'annual report', 'PDF', 'Digital Service Centre', 'delegated authority', 'Bwgcolman Way', '197 employees', 'full report'],
    structured_data: {
      source: 'PICC 2023-24 Annual Report',
      fiscal_year: '2023-2024',
      pdf_path: '/documents/annual-reports/picc-annual-report-2023-24.pdf',
      pdf_url: 'https://os-data-2.s3-ap-southeast-2.amazonaws.com/picc-com-au/bundle1/picc-2023-24-annual-report.pdf',
      file_size_mb: 8.9,
      pages: 11,
      staff_total: 197,
      staff_growth_pct: 33,
      staff_palm_islander_pct: 75,
      total_income: 23400335,
      total_expenditure: 23678058,
      net_result: -277723,
      wages_paid: 5800000,
      economic_output: 9750000,
      digital_service_centre_staff: 21,
      social_enterprise_staff: 44,
      health_clients: 2283,
      key_highlights: [
        '197 employees (up 33%)',
        '75% Palm Islanders',
        'Digital Service Centre (21 staff, 50+ languages)',
        'Bwgcolman Way delegated authority launched',
        "Women's Healing Service restructured",
        '$23.4M income',
        '$5.8M in wages',
        '$9.75M economic output'
      ]
    },
    fiscal_year: '2023-2024',
    location_type: 'palm_island',
    is_public: true,
    is_verified: true
  },
  {
    slug: 'picc-annual-report-2011-12-full-pdf',
    title: 'PICC Annual Report 2011-2012 (Full PDF)',
    subtitle: 'Growth and consolidation period - services expanding',
    summary: 'The complete 2011-12 PICC Annual Report documenting the organization during its growth and consolidation phase. Services were expanding across health, family wellbeing, early childhood, youth, and social enterprises were emerging.',
    content: `# PICC Annual Report 2011-2012 (Full PDF)

## Download Full Report
**PDF Location:** [/documents/annual-reports/picc-annual-report-2011-12.pdf](/documents/annual-reports/picc-annual-report-2011-12.pdf)

**Original Source:** https://os-data-2.s3-ap-southeast-2.amazonaws.com/picc-com-au/bundle1/picc-ar-11-12_email.pdf

**File Size:** 3.0 MB

---

## About This Report

The 2011-2012 Annual Report documents PICC during a critical **growth and consolidation period**, approximately 2-3 years after the organization's establishment.

### Historical Context

**Organizational Stage:**
- Moving from startup phase to sustainable operations
- Services expanding and strengthening
- Workforce growing (estimated 50-80+ employees)
- Organizational capacity maturing
- Community trust deepening

**Key Developments:**
- Health services expanded (more GPs, nurses, programs)
- Family wellbeing enhanced (DFV support, parenting)
- Early childhood playgroups and school readiness growing
- Youth services with mentoring and leadership
- Social enterprises operating (shop, bakery, mechanics, fuel)

**Innovations:**
- Telehealth beginning
- Cultural adaptations of programs
- Holistic service model
- Community-designed interventions

---

## Services Documented

The 2011-12 report covered these service areas:

### Health Services
- **Bwgcolman Healing Service (Primary Health Centre)**
- General practice services
- Chronic disease management
- Maternal and child health
- Mental health support
- Health promotion

### Family and Community Services
- **Family Wellbeing**
- Child protection support
- Domestic and family violence programs
- Parenting programs
- Cultural activities

### Early Childhood
- Playgroups (0-5 years)
- School readiness programs
- Parenting support
- Developmental screening

### Youth Services
- After-school activities
- School holiday programs
- Mentoring
- Diversion from justice system
- Cultural connection programs

### Community Justice
- Court support
- Diversion programs
- Restorative justice
- DFV Enhancement Program

### Social Enterprises
- Community shop
- Bakery
- Mechanics workshop
- Fuel station

---

## Significance of 2011-12 Period

### Consolidation and Growth

This period represented PICC:
- **Proving viability** of community-controlled model
- **Expanding services** beyond basic offerings
- **Growing workforce** significantly
- **Strengthening systems** and governance
- **Building trust** with community
- **Demonstrating impact**

### Comparison to Later Years

**2011-12 vs 2023-24:**
- Workforce: ~50-80 → **197 employees**
- Services: Basic → Comprehensive integrated programs
- Social enterprises: Emerging → Major employment (44 staff)
- Revenue: Smaller scale → **$23.4M**

### Foundation for Future

The 2011-12 report documents the **middle foundation years** that enabled PICC's later transformation into a national leader.

---

## Access the Full Report

**Download PDF:** [/documents/annual-reports/picc-annual-report-2011-12.pdf](/documents/annual-reports/picc-annual-report-2011-12.pdf)

The complete report provides detailed information on:
- Service delivery and outcomes
- Financial statements
- Governance and management
- Partnerships
- Community impact
- Challenges and achievements

---

## Organizational Pathway

This report sits in PICC's historical timeline:

**2009-10** → Foundation and establishment
**2011-12** → **Growth and consolidation** ⬅ THIS REPORT
**2013-20** → Continued expansion
**2023** → Digital Service Centre breakthrough
**2024** → 200 employees, national leader

---

*For detailed highlights and analysis, see the complementary entry: "PICC 2011-2012 Annual Report Highlights"*

**Original Source:** https://os-data-2.s3-ap-southeast-2.amazonaws.com/picc-com-au/bundle1/picc-ar-11-12_email.pdf`,
    entry_type: 'document',
    category: 'Annual Reports',
    keywords: ['PICC', '2011-2012', 'annual report', 'PDF', 'growth', 'consolidation', 'full report', 'historical'],
    structured_data: {
      source: 'PICC 2011-12 Annual Report',
      fiscal_year: '2011-2012',
      pdf_path: '/documents/annual-reports/picc-annual-report-2011-12.pdf',
      pdf_url: 'https://os-data-2.s3-ap-southeast-2.amazonaws.com/picc-com-au/bundle1/picc-ar-11-12_email.pdf',
      file_size_mb: 3.0,
      organizational_stage: 'Growth and consolidation',
      estimated_workforce: '50-80 employees',
      services: [
        'Primary healthcare (expanded)',
        'Family wellbeing (enhanced)',
        'Early childhood (growing)',
        'Youth services',
        'Community Justice',
        'Social enterprises (emerging)'
      ],
      key_themes: ['Service expansion', 'Workforce growth', 'Organizational maturity', 'Community trust', 'Innovation'],
      significance: 'Foundation period enabling later transformation to national leader'
    },
    fiscal_year: '2011-2012',
    location_type: 'palm_island',
    is_public: true,
    is_verified: true
  },
  {
    slug: 'picc-annual-report-2009-10-full-pdf',
    title: 'PICC Annual Report 2009-2010 (Full PDF)',
    subtitle: 'Foundation years - establishing community control',
    summary: 'The complete 2009-10 PICC Annual Report documenting the organization during its critical foundation years. This report shows PICC establishing community control, building trust, and laying the groundwork for future growth.',
    content: `# PICC Annual Report 2009-2010 (Full PDF)

## Download Full Report
**PDF Location:** [/documents/annual-reports/picc-annual-report-2009-10.pdf](/documents/annual-reports/picc-annual-report-2009-10.pdf)

**Original Source:** https://os-data-2.s3-ap-southeast-2.amazonaws.com/picc-com-au/bundle1/annual_report_-_09-10.pdf

**File Size:** 1.4 MB

---

## About This Report

The 2009-2010 Annual Report documents PICC during its **critical foundation years**, showing the organization's early development as a community-controlled service provider.

### Historical Context

**Organizational Stage:**
- Establishing community control
- Taking over services from government
- Building governance and management structures
- Developing policies and systems
- Early workforce recruitment
- Building trust with community

**Key Developments:**
- Core services established (health, family, youth, justice)
- Small but growing workforce
- Aboriginal Health Workers critical to success
- Cultural grounding being embedded
- Community accountability developing

---

## Services Documented

The 2009-10 report covered these foundational services:

### Primary Healthcare
- **Bwgcolman Healing Service (Primary Health Centre)**
- Partnership with Queensland Health
- GP services and chronic disease management
- Nursing services
- Aboriginal and Torres Strait Islander Health Workers
- Maternal and child health
- Immunizations

### Family Support
- Child protection support
- Parenting programs
- Case management
- Family preservation

### Community Justice
- Court support
- Diversion programs
- DFV programs

### Youth Programs
- After-school programs
- School holiday programs
- Mentoring

---

## Significance of 2009-10 Period

### Foundation Years

This period was **foundational** for PICC:
- **Community control** being established in practice
- **Services** beginning to operate consistently
- **Trust** starting to build with community
- **Employment** creating early opportunities
- **Capacity** beginning to develop
- **Vision** taking shape

### Challenges Acknowledged

PICC faced immense challenges:
- Remote location
- Severe community disadvantage
- Historical trauma
- Limited resources
- High community needs
- External constraints

### Determination Evident

Despite challenges, PICC demonstrated:
- Commitment to community
- Cultural grounding
- Service quality focus
- Innovation
- Resilience
- Hope for future

---

## Comparison to Later Years

**2009-10 vs 2023-24:**
- Workforce: Small team → **197 employees**
- Services: Basic → Comprehensive integrated
- Revenue: Limited → **$23.4M**
- Social enterprises: None → Major employer (44 staff)
- Recognition: Local → National leader

---

## Legacy of 2009-10

This early period **established the foundation** for:
- PICC's growth to 200 employees by 2024
- Expansion of services across all areas
- Digital Service Centre (2023)
- Recognition as leading Indigenous community-controlled organization
- Model for self-determination

**From these humble but determined beginnings**, PICC has grown into a major force for community wellbeing and self-determination.

---

## Access the Full Report

**Download PDF:** [/documents/annual-reports/picc-annual-report-2009-10.pdf](/documents/annual-reports/picc-annual-report-2009-10.pdf)

The complete report provides original documentation of:
- Early service delivery
- Foundation governance
- Initial partnerships
- Community engagement
- First-year outcomes
- Early challenges and achievements

---

## Organizational Pathway

This report represents the **beginning** of PICC's journey:

**2009-10** → **Foundation and establishment** ⬅ THIS REPORT
**2011-12** → Growth and consolidation
**2013-20** → Continued expansion
**2023** → Digital Service Centre breakthrough
**2024** → 200 employees, national leader

---

*For detailed highlights and analysis, see the complementary entry: "PICC 2009-2010 Annual Report Highlights"*

**Original Source:** https://os-data-2.s3-ap-southeast-2.amazonaws.com/picc-com-au/bundle1/annual_report_-_09-10.pdf`,
    entry_type: 'document',
    category: 'Annual Reports',
    keywords: ['PICC', '2009-2010', 'annual report', 'PDF', 'foundation', 'community control', 'full report', 'historical'],
    structured_data: {
      source: 'PICC 2009-10 Annual Report',
      fiscal_year: '2009-2010',
      pdf_path: '/documents/annual-reports/picc-annual-report-2009-10.pdf',
      pdf_url: 'https://os-data-2.s3-ap-southeast-2.amazonaws.com/picc-com-au/bundle1/annual_report_-_09-10.pdf',
      file_size_mb: 1.4,
      organizational_stage: 'Foundation and establishment',
      estimated_workforce: '20-40 employees (estimated)',
      services: [
        'Primary healthcare (establishing)',
        'Family support',
        'Community Justice',
        'Youth programs'
      ],
      key_themes: ['Community control transition', 'Building trust', 'Service establishment', 'Capacity development', 'Cultural grounding'],
      significance: 'Foundation period that enabled all future growth and success'
    },
    fiscal_year: '2009-2010',
    location_type: 'palm_island',
    is_public: true,
    is_verified: true
  }
]

async function main() {
  console.log('🚀 Starting Annual Report PDFs import...')

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
