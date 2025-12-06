import { config } from 'dotenv'
import { resolve } from 'path'
config({ path: resolve(__dirname, '../.env.local') })
import { createClient } from '@supabase/supabase-js'

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
  // 2010-11
  {
    slug: 'picc-annual-report-2010-11-full-pdf',
    title: 'PICC Annual Report 2010-2011 (Full PDF)',
    subtitle: 'Early organizational development and service expansion',
    summary: 'The 2010-11 PICC Annual Report documenting the early years of organizational development as PICC expanded its service offerings to Palm Island.',
    content: `# PICC Annual Report 2010-2011 (Full PDF)

## Download Full Report
**PDF Location:** [/documents/annual-reports/picc-annual-report-2010-11.pdf](/documents/annual-reports/picc-annual-report-2010-11.pdf)

**Original Source:** https://os-data-2.s3-ap-southeast-2.amazonaws.com/picc-com-au/bundle1/picc_ar_10-11.pdf

**File Size:** 1.7MB

## Overview
This annual report covers the 2010-2011 financial year, representing the early development phase of the Palm Island Community Company as it established and grew its service offerings to the Palm Island community.

## Key Focus Areas
- Organizational development and growth
- Service delivery expansion
- Building partnerships with government and community organizations
- Staff recruitment and capacity building
- Financial sustainability initiatives

## Significance
This report captures PICC during its formative years, showing the foundation being laid for the comprehensive service provider it would become. The document provides insights into the challenges and achievements of establishing a community-controlled organization on Palm Island.

## Download
Access the full PDF report to see detailed information about programs, services, financial statements, and community impact during this period.
`,
    entry_type: 'document',
    category: 'Annual Reports',
    fiscal_year: '2010-11',
    keywords: ['annual report', 'PICC', '2010-11', 'organizational development', 'early years', 'PDF'],
    is_public: true,
    is_verified: true,
    structured_data: {
      pdf_path: '/documents/annual-reports/picc-annual-report-2010-11.pdf',
      pdf_url: 'https://os-data-2.s3-ap-southeast-2.amazonaws.com/picc-com-au/bundle1/picc_ar_10-11.pdf',
      file_size_mb: 1.7,
      fiscal_year: '2010-11',
      period: 'July 1, 2010 - June 30, 2011'
    }
  },

  // 2012-13
  {
    slug: 'picc-annual-report-2012-13-full-pdf',
    title: 'PICC Annual Report 2012-2013 (Full PDF)',
    subtitle: 'Continuing growth and service consolidation',
    summary: 'The 2012-13 PICC Annual Report showing continued organizational growth and consolidation of community services on Palm Island.',
    content: `# PICC Annual Report 2012-2013 (Full PDF)

## Download Full Report
**PDF Location:** [/documents/annual-reports/picc-annual-report-2012-13.pdf](/documents/annual-reports/picc-annual-report-2012-13.pdf)

**Original Source:** https://os-data-2.s3-ap-southeast-2.amazonaws.com/picc-com-au/bundle1/picc-annual-report_web.pdf

**File Size:** 2.5MB

## Overview
The 2012-13 annual report documents PICC's continued growth trajectory as the organization consolidated its position as Palm Island's primary community service provider.

## Key Focus Areas
- Service consolidation and improvement
- Workforce development
- Community engagement initiatives
- Financial management and sustainability
- Partnership development

## Significance
This period marks PICC's transition from early-stage development to an established, multi-service organization providing essential services to Palm Island residents.

## Download
Access the full PDF report for comprehensive details on all programs, services, financials, and community outcomes.
`,
    entry_type: 'document',
    category: 'Annual Reports',
    fiscal_year: '2012-13',
    keywords: ['annual report', 'PICC', '2012-13', 'service consolidation', 'growth', 'PDF'],
    is_public: true,
    is_verified: true,
    structured_data: {
      pdf_path: '/documents/annual-reports/picc-annual-report-2012-13.pdf',
      pdf_url: 'https://os-data-2.s3-ap-southeast-2.amazonaws.com/picc-com-au/bundle1/picc-annual-report_web.pdf',
      file_size_mb: 2.5,
      fiscal_year: '2012-13',
      period: 'July 1, 2012 - June 30, 2013'
    }
  },

  // 2013-14
  {
    slug: 'picc-annual-report-2013-14-full-pdf',
    title: 'PICC Annual Report 2013-2014 (Full PDF)',
    subtitle: 'Expanding service delivery and community impact',
    summary: 'The 2013-14 PICC Annual Report documenting expanded service delivery across health, community services, and social enterprises.',
    content: `# PICC Annual Report 2013-2014 (Full PDF)

## Download Full Report
**PDF Location:** [/documents/annual-reports/picc-annual-report-2013-14.pdf](/documents/annual-reports/picc-annual-report-2013-14.pdf)

**Original Source:** https://os-data-2.s3-ap-southeast-2.amazonaws.com/picc-com-au/bundle1/picc_annual-report_2014_web.pdf

**File Size:** 3.0MB

## Overview
This annual report covers the 2013-14 financial year, showcasing PICC's continued expansion of services and deepening community impact.

## Key Focus Areas
- Health service delivery expansion
- Community and family services
- Youth and children's programs
- Social enterprise development
- Community safety and justice initiatives

## Significance
The 2013-14 period represents PICC's maturation as a comprehensive service provider, with diversified programs addressing multiple community needs.

## Download
Download the full PDF for detailed program outcomes, financial statements, and community impact data.
`,
    entry_type: 'document',
    category: 'Annual Reports',
    fiscal_year: '2013-14',
    keywords: ['annual report', 'PICC', '2013-14', 'service expansion', 'community impact', 'PDF'],
    is_public: true,
    is_verified: true,
    structured_data: {
      pdf_path: '/documents/annual-reports/picc-annual-report-2013-14.pdf',
      pdf_url: 'https://os-data-2.s3-ap-southeast-2.amazonaws.com/picc-com-au/bundle1/picc_annual-report_2014_web.pdf',
      file_size_mb: 3.0,
      fiscal_year: '2013-14',
      period: 'July 1, 2013 - June 30, 2014'
    }
  },

  // 2014-15
  {
    slug: 'picc-annual-report-2014-15-full-pdf',
    title: 'PICC Annual Report 2014-2015 (Full PDF)',
    subtitle: 'Strengthening community services and partnerships',
    summary: 'The 2014-15 PICC Annual Report highlighting strengthened community services, expanded partnerships, and organizational development.',
    content: `# PICC Annual Report 2014-2015 (Full PDF)

## Download Full Report
**PDF Location:** [/documents/annual-reports/picc-annual-report-2014-15.pdf](/documents/annual-reports/picc-annual-report-2014-15.pdf)

**Original Source:** https://os-data-2.s3-ap-southeast-2.amazonaws.com/picc-com-au/bundle1/picc_2014-15_annual-report.pdf

**File Size:** 7.1MB

## Overview
The 2014-15 annual report documents PICC's continued strengthening of service delivery and expansion of community partnerships.

## Key Focus Areas
- Enhanced health service delivery
- Family wellbeing and child protection
- Youth diversion and community justice
- Social enterprises and economic development
- Partnership expansion and collaboration

## Significance
This year represents consolidation of PICC's role as the primary community service provider and advocate for Palm Island.

## Download
Access the full PDF report for comprehensive program details, outcomes, and financial information.
`,
    entry_type: 'document',
    category: 'Annual Reports',
    fiscal_year: '2014-15',
    keywords: ['annual report', 'PICC', '2014-15', 'partnerships', 'community services', 'PDF'],
    is_public: true,
    is_verified: true,
    structured_data: {
      pdf_path: '/documents/annual-reports/picc-annual-report-2014-15.pdf',
      pdf_url: 'https://os-data-2.s3-ap-southeast-2.amazonaws.com/picc-com-au/bundle1/picc_2014-15_annual-report.pdf',
      file_size_mb: 7.1,
      fiscal_year: '2014-15',
      period: 'July 1, 2014 - June 30, 2015'
    }
  },

  // 2015-16
  {
    slug: 'picc-annual-report-2015-16-full-pdf',
    title: 'PICC Annual Report 2015-2016 (Full PDF)',
    subtitle: 'Comprehensive service delivery and community empowerment',
    summary: 'The 2015-16 PICC Annual Report showcasing comprehensive service delivery across health, community services, and social enterprises.',
    content: `# PICC Annual Report 2015-2016 (Full PDF)

## Download Full Report
**PDF Location:** [/documents/annual-reports/picc-annual-report-2015-16.pdf](/documents/annual-reports/picc-annual-report-2015-16.pdf)

**Original Source:** https://os-data-2.s3-ap-southeast-2.amazonaws.com/picc-com-au/bundle1/picc_2015-16_annual-report_web.pdf

**File Size:** 1.8MB

## Overview
This report covers 2015-16, a year of comprehensive service delivery and continued organizational maturation.

## Key Focus Areas
- Integrated health and wellbeing services
- Child and family support programs
- Community safety initiatives
- Economic participation through social enterprises
- Advocacy for self-determination

## Significance
The 2015-16 period demonstrates PICC's comprehensive approach to community wellbeing and self-determination.

## Download
View the full PDF for detailed service outcomes, case studies, and financial reports.
`,
    entry_type: 'document',
    category: 'Annual Reports',
    fiscal_year: '2015-16',
    keywords: ['annual report', 'PICC', '2015-16', 'service delivery', 'empowerment', 'PDF'],
    is_public: true,
    is_verified: true,
    structured_data: {
      pdf_path: '/documents/annual-reports/picc-annual-report-2015-16.pdf',
      pdf_url: 'https://os-data-2.s3-ap-southeast-2.amazonaws.com/picc-com-au/bundle1/picc_2015-16_annual-report_web.pdf',
      file_size_mb: 1.8,
      fiscal_year: '2015-16',
      period: 'July 1, 2015 - June 30, 2016'
    }
  },

  // 2016-17
  {
    slug: 'picc-annual-report-2016-17-full-pdf',
    title: 'PICC Annual Report 2016-2017 (Full PDF)',
    subtitle: 'Building capacity and improving outcomes',
    summary: 'The 2016-17 PICC Annual Report focusing on capacity building, improved service outcomes, and community engagement.',
    content: `# PICC Annual Report 2016-2017 (Full PDF)

## Download Full Report
**PDF Location:** [/documents/annual-reports/picc-annual-report-2016-17.pdf](/documents/annual-reports/picc-annual-report-2016-17.pdf)

**Original Source:** https://os-data-2.s3-ap-southeast-2.amazonaws.com/picc-com-au/bundle1/picc-2016-17-annual-report_web.pdf

**File Size:** 2.5MB

## Overview
The 2016-17 annual report highlights PICC's focus on building organizational and community capacity while improving service outcomes.

## Key Focus Areas
- Workforce development and training
- Service quality improvement
- Community engagement and consultation
- Financial sustainability
- Strategic planning and development

## Significance
This year marks continued organizational development and refinement of service delivery models.

## Download
Access the complete PDF for full program details and performance data.
`,
    entry_type: 'document',
    category: 'Annual Reports',
    fiscal_year: '2016-17',
    keywords: ['annual report', 'PICC', '2016-17', 'capacity building', 'outcomes', 'PDF'],
    is_public: true,
    is_verified: true,
    structured_data: {
      pdf_path: '/documents/annual-reports/picc-annual-report-2016-17.pdf',
      pdf_url: 'https://os-data-2.s3-ap-southeast-2.amazonaws.com/picc-com-au/bundle1/picc-2016-17-annual-report_web.pdf',
      file_size_mb: 2.5,
      fiscal_year: '2016-17',
      period: 'July 1, 2016 - June 30, 2017'
    }
  },

  // 2017-18
  {
    slug: 'picc-annual-report-2017-18-full-pdf',
    title: 'PICC Annual Report 2017-2018 (Full PDF)',
    subtitle: 'Strategic growth and service innovation',
    summary: 'The 2017-18 PICC Annual Report documenting strategic growth initiatives and innovative service delivery approaches.',
    content: `# PICC Annual Report 2017-2018 (Full PDF)

## Download Full Report
**PDF Location:** [/documents/annual-reports/picc-annual-report-2017-18.pdf](/documents/annual-reports/picc-annual-report-2017-18.pdf)

**Original Source:** https://os-data-2.s3-ap-southeast-2.amazonaws.com/picc-com-au/bundle1/picc_annual_report_2017-2018_v2.pdf

**File Size:** 6.7MB

## Overview
This report covers 2017-18, a year focused on strategic growth and developing innovative approaches to service delivery.

## Key Focus Areas
- Service model innovation
- Strategic planning and direction
- Community-led program design
- Partnership strengthening
- Advocacy and representation

## Significance
The 2017-18 period represents PICC's evolution toward more innovative and community-driven service models.

## Download
Download the full PDF report for comprehensive program information and strategic initiatives.
`,
    entry_type: 'document',
    category: 'Annual Reports',
    fiscal_year: '2017-18',
    keywords: ['annual report', 'PICC', '2017-18', 'strategic growth', 'innovation', 'PDF'],
    is_public: true,
    is_verified: true,
    structured_data: {
      pdf_path: '/documents/annual-reports/picc-annual-report-2017-18.pdf',
      pdf_url: 'https://os-data-2.s3-ap-southeast-2.amazonaws.com/picc-com-au/bundle1/picc_annual_report_2017-2018_v2.pdf',
      file_size_mb: 6.7,
      fiscal_year: '2017-18',
      period: 'July 1, 2017 - June 30, 2018'
    }
  },

  // 2018-19
  {
    slug: 'picc-annual-report-2018-19-full-pdf',
    title: 'PICC Annual Report 2018-2019 (Full PDF)',
    subtitle: 'Preparing for community control transition',
    summary: 'The 2018-19 PICC Annual Report documenting preparations for community control and the PICC Evaluation Report findings.',
    content: `# PICC Annual Report 2018-2019 (Full PDF)

## Download Full Report
**PDF Location:** [/documents/annual-reports/picc-annual-report-2018-19.pdf](/documents/annual-reports/picc-annual-report-2018-19.pdf)

**Original Source:** https://os-data-2.s3-ap-southeast-2.amazonaws.com/picc-com-au/bundle1/picc_annual_report_2018-2019.pdf

**File Size:** 11.6MB

## Overview
The 2018-19 annual report marks a pivotal year as PICC commissioned the Ipsos PICC Evaluation Report (released May 2019) and began planning for community control.

## Key Focus Areas
- Independent evaluation and assessment
- Community control planning
- Governance review and reform
- Service delivery excellence
- Stakeholder engagement

## Significance
This year is crucial in PICC's history as it identified the need for community control to achieve self-determination and further organizational development. The evaluation found that government partial ownership was a "challenge" that didn't fit community expectations.

## Download
Access the full PDF for details on the evaluation findings and transition planning.
`,
    entry_type: 'document',
    category: 'Annual Reports',
    fiscal_year: '2018-19',
    keywords: ['annual report', 'PICC', '2018-19', 'community control', 'evaluation', 'transition', 'PDF'],
    is_public: true,
    is_verified: true,
    structured_data: {
      pdf_path: '/documents/annual-reports/picc-annual-report-2018-19.pdf',
      pdf_url: 'https://os-data-2.s3-ap-southeast-2.amazonaws.com/picc-com-au/bundle1/picc_annual_report_2018-2019.pdf',
      file_size_mb: 11.6,
      fiscal_year: '2018-19',
      period: 'July 1, 2018 - June 30, 2019',
      key_events: [
        'PICC Evaluation Report commissioned (2018)',
        'Ipsos released evaluation findings (May 2019)',
        'Community control planning commenced'
      ]
    }
  },

  // 2019-20
  {
    slug: 'picc-annual-report-2019-20-full-pdf',
    title: 'PICC Annual Report 2019-2020 (Full PDF)',
    subtitle: 'Establishing Palm Island New Company and COVID-19 response',
    summary: 'The 2019-20 PICC Annual Report documenting the establishment of the new community-controlled entity and initial COVID-19 pandemic response.',
    content: `# PICC Annual Report 2019-2020 (Full PDF)

## Download Full Report
**PDF Location:** [/documents/annual-reports/picc-annual-report-2019-20.pdf](/documents/annual-reports/picc-annual-report-2019-20.pdf)

**Original Source:** https://os-data-2.s3-ap-southeast-2.amazonaws.com/picc-com-au/bundle1/picc-2019-20-annual-report.pdf

**File Size:** 3.6MB

## Overview
This report covers 2019-20, a transformational year when PICC established Palm Island New Company Ltd (PINCL) in May 2020 as the new community-controlled entity, and began responding to the COVID-19 pandemic.

## Key Events
- **May 2020**: Palm Island New Company Ltd established
- **COVID-19 Response**: Initial pandemic response and community safety measures
- **Governance Transition**: Preparation for community control model

## Key Focus Areas
- Community control transition planning
- New governance structure development
- COVID-19 pandemic response
- Service continuity and adaptation
- Community consultation and engagement

## Significance
This year represents a historic milestone in PICC's journey toward true self-determination and community control. The establishment of PINCL set the foundation for the governance transition completed in 2021-22.

## Download
View the complete PDF for details on the transition process and pandemic response.
`,
    entry_type: 'document',
    category: 'Annual Reports',
    fiscal_year: '2019-20',
    keywords: ['annual report', 'PICC', '2019-20', 'community control', 'COVID-19', 'governance', 'PINCL', 'PDF'],
    is_public: true,
    is_verified: true,
    structured_data: {
      pdf_path: '/documents/annual-reports/picc-annual-report-2019-20.pdf',
      pdf_url: 'https://os-data-2.s3-ap-southeast-2.amazonaws.com/picc-com-au/bundle1/picc-2019-20-annual-report.pdf',
      file_size_mb: 3.6,
      fiscal_year: '2019-20',
      period: 'July 1, 2019 - June 30, 2020',
      key_events: [
        'Palm Island New Company Ltd established (May 2020)',
        'COVID-19 pandemic response initiated',
        'Community control transition planning',
        'New governance structure development'
      ]
    }
  },

  // 2020-21
  {
    slug: 'picc-annual-report-2020-21-full-pdf',
    title: 'PICC Annual Report 2020-2021 (Full PDF)',
    subtitle: '129 staff, community control preparation, ACCHO transition planning',
    summary: 'The 2020-21 PICC Annual Report documenting final preparations for community control, ACCHO planning, COVID-19 vaccination rollout, and 129 employees ($12.97M income).',
    content: `# PICC Annual Report 2020-2021 (Full PDF)

## Download Full Report
**PDF Location:** [/documents/annual-reports/picc-annual-report-2020-21.pdf](/documents/annual-reports/picc-annual-report-2020-21.pdf)

**Original Source:** https://os-data-2.s3-ap-southeast-2.amazonaws.com/picc-com-au/bundle1/picc-2020-21-annual-report.pdf

**File Size:** 11.0MB | **Pages:** 20

## Executive Summary
The 2020-21 financial year represents the final preparatory year before PICC's historic transition to full community control in July 2021. CEO Rachel Atkinson and Chair Luella Bligh led the organization through preparations for taking over primary health services from THHS and establishing PICC as an Aboriginal Community Controlled Health Organisation (ACCHO).

**Key Stats:**
- **129 employees** as of June 30, 2021
- **$12.97M income**, $12.16M expenditure
- **$803,784 net surplus**
- **13,662 episodes of health care**
- **1,803 total health clients**

## Major Achievements

### 1. Community Control Transition Preparation
- Finalized groundwork for transition (completed July 1, 2021)
- Developed new constitution allowing Manbarra and Bwgcolman people to become members
- Prepared Palm Island New Company Ltd (PINCL) to take on programs, services, staff, and assets
- New governance model: members elect up to 4 board members, traditional owners nominate 1, board nominates up to 2

### 2. Health Service Transition Planning
- Prepared to take over THHS primary health services (transition July 1, 2021)
- Developed clinical governance framework and model of care
- Negotiated continuation of visiting specialist and allied health services
- Became first ACCHO on Palm Island (2021-22)

### 3. COVID-19 Vaccination Program
- Vaccination rollout started Palm Island May 2020
- PICC prepared to commence vaccinating in 2021-22 (taking over from THHS)

### 4. New Services Added
- **Family Care Services (Foster & Kinship Care)**: Launched December 1, 2020
  - Transitioned from TAIHS
  - 19 service users by June 2021
  - 2,339 total placement nights
  - Keeps Palm Island children on Palm Island with family/community carers
- **Women's Healing Service**: Pilot at Townsville Women's Correctional Centre
  - First cultural healing group program held early 2021
  - 81 women received services (Feb-June 2021)
  - 34 group sessions, 166 individual sessions

### 5. Elders' Conferences
- **First Conference**: September 2020 (Palm Island Motel)
- **Second Conference**: June 2021 (Townsville)
- Formalized Elders' Advisory Group (EAG) relationship with PICC
- Finalized Terms of Reference and MOU
- Developed Statement of Key Priorities for Palm Island
- Funded by Dept of Seniors, Disability Services, and Aboriginal and Torres Strait Islander Partnerships

### 6. New Programs Established
- **Pathway to Healing Men's Behaviour Change Program**: Culturally appropriate program developed collaboratively by DFV Service, Diversionary Service, and Community Justice Group DFV Enhancement Program

### 7. Organizational Development
- Developed Strategic Plan 2021-2026
- Implemented new integrated payroll and HR system
- Introduced annual staff survey (58 responses):
  - 53.45% strongly agree working for PICC makes positive community difference
  - 36.21% agree
- Achieved recertification against Human Service Quality Standards (HSQF)
- Early Childhood Services reviewed staffing structure for expanded space

## Service Statistics

### Primary Health Services
- **285** "715" Health Checks
- **67** Child Health Checks
- **119** Team Care Arrangements
- **129** GP Management Plans
- **13,662** total episodes of care
- **1,803** total clients (1,656 Aboriginal/TSI)

### Community Services Report Cards
- **Family Wellbeing**: 14-46 families per quarter
- **Diversionary Services**: 286-462 service users per quarter
- **Family Care Services**: 13-19 service users (Jan-June 2021)
- **Early Childhood Services**: 78-108 individual children
- **Safe House**: 6-20 service users per quarter, 1,789 placement nights
- **Safe Haven (Youth)**: 214-260 children/young people per quarter
- **Women's Services**: 60-120 women and children per quarter
- **Women's Healing Service**: 55-81 women (Feb-June 2021)
- **NDIS Community Connector**: 11-19 community members supported
- **Family Participation Program**: 10-18 families per quarter

### Community Justice Group
- Renewed funding agreement to June 30, 2023
- CJG Coordinator plus male and female DFV Support Workers
- Developed new logo and Strategic Plan 2021-2023

## Financial Performance
**Balance Sheet:**
- Total Assets: $3,387,296
- Total Liabilities: $2,024,785
- Net Assets: $1,362,511

**Income & Expenditure:**
- Income: $12,965,924
- Total Expenditure: $12,162,140
  - Labour Costs: $8,420,526 (69%)
  - Administration: $1,582,714 (13%)
  - Property & Energy: $416,322 (3%)
  - Motor Vehicles: $236,530 (2%)
  - Travel & Training: $662,101 (6%)
  - Client Related: $843,947 (7%)
- **Net Surplus: $803,784**

## Leadership
- **CEO**: Rachel Atkinson
- **Board Chair**: Luella Bligh
- **Directors**: Harriet Hulthen, Mark Johnston, Allan Palm Island, Rhonda Phillips
- **Company Secretary**: Ian Jessup

## Social Enterprises
- Major fuel system upgrade (October 2020) - 24/7 supply
- Expanded Community Shop products (barista coffee, fresh food)
- Added Project Services (transportation, cleaning, maintenance)

## Significance
2020-21 was the final year before PICC's transition to full community control - a historic milestone toward self-determination. As Chair Luella Bligh stated: "With community control, we get one step closer to what we have been fighting for for decades: self-determination for Palm Island."

The year's preparations ensured smooth transition of governance, health services, and accountability to the Palm Island community.

## Partners
Palm Island Aboriginal Shire Council, TAIHS, Queensland Aboriginal and Torres Strait Islander Child Protection Peak, SNAICC, QAIHC, North Queensland PHN, Townsville Hospital & Health Service, Queensland Health, Child Safety Services, Griffith University, James Cook University, and many others.

## Download
Access the complete 20-page PDF report with detailed program descriptions, financial statements, and service data.
`,
    entry_type: 'document',
    category: 'Annual Reports',
    fiscal_year: '2020-21',
    keywords: ['annual report', 'PICC', '2020-21', 'community control', 'ACCHO', 'health transition', 'Rachel Atkinson', 'Luella Bligh', 'PDF'],
    is_public: true,
    is_verified: true,
    structured_data: {
      pdf_path: '/documents/annual-reports/picc-annual-report-2020-21.pdf',
      pdf_url: 'https://os-data-2.s3-ap-southeast-2.amazonaws.com/picc-com-au/bundle1/picc-2020-21-annual-report.pdf',
      file_size_mb: 11.0,
      pages: 20,
      fiscal_year: '2020-21',
      period: 'July 1, 2020 - June 30, 2021',
      staff_total: 129,
      income: 12965924,
      expenditure: 12162140,
      net_surplus: 803784,
      health_episodes: 13662,
      health_clients: 1803,
      ceo: 'Rachel Atkinson',
      chair: 'Luella Bligh',
      key_highlights: [
        '129 employees',
        'Prepared for community control transition (completed July 2021)',
        'Prepared to become first ACCHO on Palm Island',
        'Added Family Care Services (Foster & Kinship)',
        'Inaugural Elders\' Conferences',
        'COVID-19 vaccination program preparation',
        '$803,784 net surplus'
      ]
    }
  },

  // 2021-22
  {
    slug: 'picc-annual-report-2021-22-full-pdf',
    title: 'PICC Annual Report 2021-2022 (Full PDF)',
    subtitle: 'Historic community control transition and ACCHO establishment',
    summary: 'The 2021-22 PICC Annual Report documenting the historic transition to full community control and establishment as an ACCHO.',
    content: `# PICC Annual Report 2021-2022 (Full PDF)

## Download Full Report
**PDF Location:** [/documents/annual-reports/picc-annual-report-2021-22.pdf](/documents/annual-reports/picc-annual-report-2021-22.pdf)

**Original Source:** https://os-data-2.s3-ap-southeast-2.amazonaws.com/picc-com-au/bundle1/picc-2021-22-annual-report.pdf

**File Size:** 6.4MB

## Overview
This report covers 2021-22, the most significant year in PICC's history as the organization completed its transition to full community control on July 1, 2021, and took over primary health services from THHS to become Palm Island's first Aboriginal Community Controlled Health Organisation (ACCHO).

## Key Events
- **July 1, 2021**: Community control transition completed
- **ACCHO Established**: First ACCHO on Palm Island
- **Health Services Transfer**: THHS primary health services merged with PICC
- **COVID-19 Vaccination**: PICC took over vaccination program from THHS

## Key Focus Areas
- Community control governance implementation
- ACCHO service delivery commencement
- Member recruitment and engagement
- Health service integration
- COVID-19 response and vaccination

## Significance
July 1, 2021 marks a historic milestone - true community control and self-determination for Palm Island. Palm Island New Company Ltd (PINCL) took on the name Palm Island Community Company (PICC), with Manbarra and Bwgcolman people now having direct ownership and decision-making power through membership.

## Download
Access the full PDF for the complete story of this transformational year.
`,
    entry_type: 'document',
    category: 'Annual Reports',
    fiscal_year: '2021-22',
    keywords: ['annual report', 'PICC', '2021-22', 'community control', 'ACCHO', 'transition', 'historic', 'PDF'],
    is_public: true,
    is_verified: true,
    structured_data: {
      pdf_path: '/documents/annual-reports/picc-annual-report-2021-22.pdf',
      pdf_url: 'https://os-data-2.s3-ap-southeast-2.amazonaws.com/picc-com-au/bundle1/picc-2021-22-annual-report.pdf',
      file_size_mb: 6.4,
      fiscal_year: '2021-22',
      period: 'July 1, 2021 - June 30, 2022',
      key_events: [
        'Community control transition completed (July 1, 2021)',
        'Became first ACCHO on Palm Island',
        'THHS primary health services transferred to PICC',
        'COVID-19 vaccination program commenced',
        'PINCL assumed PICC name'
      ]
    }
  },

  // 2022-23
  {
    slug: 'picc-annual-report-2022-23-full-pdf',
    title: 'PICC Annual Report 2022-2023 (Full PDF)',
    subtitle: 'First full year under community control and ACCHO operation',
    summary: 'The 2022-23 PICC Annual Report documenting the first complete year of community-controlled governance and ACCHO health service delivery.',
    content: `# PICC Annual Report 2022-2023 (Full PDF)

## Download Full Report
**PDF Location:** [/documents/annual-reports/picc-annual-report-2022-23.pdf](/documents/annual-reports/picc-annual-report-2022-23.pdf)

**Original Source:** https://os-data-2.s3-ap-southeast-2.amazonaws.com/picc-com-au/bundle1/picc-2022-23-annual-report_1.pdf

**File Size:** 3.4MB

## Overview
This report covers 2022-23, the first complete financial year under full community control, with PICC operating as an established ACCHO and continuing to expand services.

## Key Focus Areas
- Community control governance in action
- ACCHO health service maturation
- Member engagement and participation
- Service expansion and improvement
- Strategic planning for future growth

## Significance
This year demonstrates the success of community control, with PICC now fully accountable to Palm Island community members and delivering comprehensive health and social services.

## Download
View the full PDF report for complete program details and first-year community control outcomes.
`,
    entry_type: 'document',
    category: 'Annual Reports',
    fiscal_year: '2022-23',
    keywords: ['annual report', 'PICC', '2022-23', 'community control', 'ACCHO', 'governance', 'PDF'],
    is_public: true,
    is_verified: true,
    structured_data: {
      pdf_path: '/documents/annual-reports/picc-annual-report-2022-23.pdf',
      pdf_url: 'https://os-data-2.s3-ap-southeast-2.amazonaws.com/picc-com-au/bundle1/picc-2022-23-annual-report_1.pdf',
      file_size_mb: 3.4,
      fiscal_year: '2022-23',
      period: 'July 1, 2022 - June 30, 2023'
    }
  }
]

async function main() {
  console.log('🚀 Starting Annual Reports import...')

  const supabase = getSupabase()

  let inserted = 0
  let errors = 0

  for (const entry of knowledgeEntries) {
    try {
      const { error } = await supabase
        .from('knowledge_entries')
        .insert(entry)

      if (error) {
        if (error.code === '23505') { // Unique constraint violation
          console.log(`⏭️  Skipped (already exists): ${entry.slug}`)
        } else {
          console.error(`❌ Error inserting ${entry.slug}:`, error)
          errors++
        }
      } else {
        console.log(`✅ Inserted: ${entry.slug}`)
        inserted++
      }
    } catch (err) {
      console.error(`❌ Error processing ${entry.slug}:`, err)
      errors++
    }
  }

  console.log('\n==================================================')
  console.log('📊 Import Complete')
  console.log(`✅ Inserted: ${inserted}`)
  console.log(`❌ Errors: ${errors}`)
  console.log('==================================================')
}

main().then(() => process.exit(0)).catch(err => {
  console.error('Fatal error:', err)
  process.exit(1)
})
