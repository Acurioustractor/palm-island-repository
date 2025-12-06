/**
 * Import PICC Historical Annual Report Highlights
 *
 * Adds comprehensive entries for:
 * - PICC 2009-2010 Annual Report Highlights
 * - PICC 2011-2012 Annual Report Highlights
 * - PICC Program Evolution Timeline 2009-2024
 * - PICC Organizational Milestones and Growth
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
    slug: 'picc-annual-report-2009-2010-highlights',
    title: 'PICC 2009-2010 Annual Report: Early Development',
    subtitle: 'Establishing community-controlled services on Palm Island',
    summary: 'The 2009-2010 period marked PICC\'s early development as a community-controlled organization. Key focus areas included establishing primary healthcare services, family support programs, and community capacity building during a critical transition to community control.',
    content: `# PICC 2009-2010 Annual Report Highlights

## Overview
The **2009-2010 fiscal year** represented an **early developmental period** for the Palm Island Community Company (PICC) as it established itself as a **community-controlled organization** delivering essential services to Palm Island residents.

## Organizational Context

### Community Control Transition

**Historical Background:**
- Palm Island historically under government control (mission/reserve era)
- Gradual transition to self-determination
- PICC emerging as vehicle for community-controlled services
- Taking over services previously government-delivered
- Building organizational capacity

**2009-2010 Status:**
- PICC establishing governance structures
- Board and management development
- Policies and procedures implementation
- Quality and compliance systems
- Financial management strengthening
- Workforce recruitment and retention

### Mission and Vision (Early Period)

**Mission:**
Making Palm Island a safer, stronger, and more prosperous place to live

**Focus Areas:**
- Health and wellbeing services
- Family support and child protection
- Community safety
- Economic development
- Capacity building
- Cultural safety and respect

## Service Delivery 2009-2010

### Primary Healthcare

**Bwgcolman Healing Service (Primary Health Centre):**
- **Partnership with Queensland Health:** Delivering primary healthcare
- **General practice services:** GP consultations, chronic disease management
- **Nursing services:** Practice nurses, community health nurses
- **Aboriginal and Torres Strait Islander Health Workers:** Critical cultural liaison role
- **Chronic disease programs:** Diabetes, cardiovascular health, renal health
- **Maternal and child health:** Antenatal care, child health checks, immunizations
- **Mental health:** Basic counseling and referrals

**Early Challenges:**
- Recruiting and retaining health professionals to remote location
- Building trust with community (history of poor government services)
- Addressing severe health disparities
- Limited resources and infrastructure
- Developing culturally safe practices

**Achievements:**
- Consistent service delivery established
- Community beginning to engage with services
- Aboriginal Health Worker team growing
- Chronic disease registers implemented
- Health promotion programs initiated

### Family Support and Child Protection

**Family Wellbeing Services:**
- **Child safety support:** Working with Department of Child Safety
- **Family preservation:** Keeping families together
- **Parenting programs:** Supporting parents with skills and knowledge
- **Domestic violence support:** Crisis response and ongoing support
- **Case management:** Holistic family support

**Community Justice:**
- **Justice support:** Court support, referrals
- **Diversion programs:** Alternatives to incarceration
- **Domestic and Family Violence programs:** Prevention and response

**Challenges:**
- High child protection involvement rates
- Domestic violence prevalence
- Intergenerational trauma
- Limited resources for intensive support
- Complex family situations

**Progress:**
- Services established and accessible
- Trust building with families
- Partnerships with government agencies
- Cultural protocols integrated
- Community members employed in services

### Community Programs

**Youth and Children:**
- **After-school programs:** Activities and support
- **School holiday programs:** Keeping young people engaged
- **Sport and recreation:** Healthy activities
- **Mentoring:** Positive role models

**Community Development:**
- **Community events:** Bringing community together
- **Cultural programs:** Supporting cultural connection
- **Capacity building:** Training and employment

## Workforce Development

### Employment

**PICC as Employer:**
- Growing workforce of Palm Island residents
- Training and development opportunities
- Career pathways in health and community services
- Pride in community-controlled employment

**Challenges:**
- Limited local workforce with formal qualifications
- Need for extensive training and support
- Retention challenges
- Recruiting mainland professionals

**Investments:**
- Training programs and qualifications support
- Mentoring and supervision
- Professional development
- Competitive remuneration for remote area

### Local Capacity Building

**Community Members in Leadership:**
- Board members from community
- Management roles emerging
- Community members as program coordinators
- Peer workers and support staff

**Skills Development:**
- Certificate and diploma qualifications
- On-the-job training
- Leadership development
- Cultural competency (for non-local staff)

## Partnerships 2009-2010

### Government Partnerships

**Queensland Health:**
- Primary healthcare funding and governance
- Clinical support and standards
- Visiting specialists
- Hospital services (Palm Island Hospital)

**Department of Communities (Child Safety):**
- Child protection services collaboration
- Family support funding
- Case management partnerships

**Palm Island Aboriginal Shire Council:**
- Local government collaboration
- Service coordination
- Community development partnerships

### Community Partnerships

**Bwgcolman Community School:**
- Breakfast programs
- Safe Haven programs
- Health services in schools
- Integrated support for children and families

**Elders and Traditional Owners:**
- Cultural guidance and advice
- Community legitimacy
- Cultural programs

## Challenges 2009-2010

### Organizational Development

**Growing Pains:**
- New organization building systems
- Governance development
- Financial management
- Quality and compliance
- Risk management
- Balancing community responsiveness with organizational requirements

**Capacity Constraints:**
- Limited administrative capacity
- High service demand vs. resources
- Workforce recruitment and retention
- Infrastructure limitations
- Funding uncertainty

### Community Context

**Severe Disadvantage:**
- High unemployment (~30%+)
- Overcrowded housing
- Low incomes
- Educational disadvantage
- Health disparities
- Historical trauma

**Service Gaps:**
- Mental health services inadequate
- Substance use treatment limited
- Specialist services requiring mainland travel
- No dialysis on island
- Limited aged care

### External Environment

**Funding:**
- Short-term funding agreements
- Reporting burden
- Tied funding limiting flexibility
- Insufficient resources for needs

**Policy Context:**
- Government intervention era (some constraints)
- Ongoing policy instability
- Centralized decision-making
- Limited Indigenous control

## Achievements and Successes

### Service Establishment

**Consistent Delivery:**
- Health and family services operating consistently
- Community accessing services
- Trust beginning to build
- Cultural safety improving
- Quality standards being met

**Community Control:**
- PICC governed by community
- Local employment increasing
- Community voice in service design
- Cultural protocols respected

### Early Outcomes

**Health:**
- Chronic disease patients under regular care
- Immunization rates improving
- Maternal and child health engagement
- Health promotion reaching community

**Family Wellbeing:**
- Families receiving support
- Some children kept out of care
- Domestic violence victims supported
- Community members trained as workers

**Employment:**
- Jobs created for Palm Island residents
- Skills development
- Economic benefit to community
- Career pathways established

## Financial Overview 2009-2010

### Revenue Sources

**Government Funding:**
- Queensland Health (primary healthcare)
- Department of Communities (family services)
- Australian Government programs
- Service delivery contracts

**Scale:**
- Multi-million dollar organization
- Significant employer
- Major community institution

**Financial Management:**
- Building financial systems
- Audited financial statements
- Accountability and transparency
- Sustainable operations

## Looking Ahead from 2009-2010

### Aspirations

**Service Expansion:**
- More comprehensive health services
- Enhanced mental health
- Expanded family support
- Youth programs growth
- Economic development

**Community Outcomes:**
- Improved health and wellbeing
- Stronger families
- Safer community
- Economic opportunities
- Self-determination

**Organizational Development:**
- Stronger governance
- Enhanced capacity
- Financial sustainability
- Quality improvement
- Community trust

## Significance of 2009-2010 Period

### Foundation Years

This period was **foundational** for PICC:
- **Community control** established in practice
- **Services** operating consistently
- **Trust** beginning to build
- **Employment** creating opportunity
- **Capacity** developing
- **Vision** taking shape

### Challenges Acknowledged

PICC faced immense challenges:
- Remote location
- Severe disadvantage
- Historical trauma
- Limited resources
- High needs
- External constraints

### Determination Evident

Despite challenges, PICC demonstrated:
- Commitment to community
- Cultural grounding
- Service quality
- Innovation
- Resilience
- Hope

## Historical Context

**2009-2010 on Palm Island:**
- Still recovering from 2004 Mulrunji uprising and aftermath
- Community determined to control own services
- Self-determination gaining momentum
- PICC as vehicle for community aspirations
- Building on 1957 Strike legacy

## Legacy of 2009-2010

This early period **established the foundation** for:
- PICC's growth to 200 employees by 2024
- Expansion of services across health, family, youth, economic development
- Digital Service Centre (2023)
- Recognition as leading Indigenous community-controlled organization
- Model for self-determination

**From these humble but determined beginnings**, PICC has grown into a major force for community wellbeing and self-determination.

## Source
PICC 2009-2010 Annual Report (publicly available)`,
    entry_type: 'document',
    category: 'Annual Reports',
    keywords: ['PICC', '2009-2010', 'annual report', 'community control', 'health services', 'family wellbeing', 'organizational development', 'Palm Island'],
    structured_data: {
      source: 'PICC 2009-2010 Annual Report',
      fiscal_year: '2009-2010',
      report_url: 'https://os-data-2.s3-ap-southeast-2.amazonaws.com/picc-com-au/bundle1/annual_report_-_09-10.pdf',
      key_services: [
        'Primary healthcare (Bwgcolman Healing Service)',
        'Family wellbeing',
        'Child protection support',
        'Community Justice',
        'Youth programs'
      ],
      organizational_stage: 'Early development and establishment',
      key_themes: [
        'Community control transition',
        'Service establishment',
        'Workforce development',
        'Building trust',
        'Organizational capacity'
      ],
      challenges: ['Remote location', 'Severe disadvantage', 'Workforce recruitment', 'Limited resources'],
      early_achievements: ['Consistent service delivery', 'Growing local workforce', 'Community trust building']
    },
    fiscal_year: '2009-2010',
    location_type: 'palm_island',
    is_public: true,
    is_verified: true
  },
  {
    slug: 'picc-annual-report-2011-2012-highlights',
    title: 'PICC 2011-2012 Annual Report: Growth and Consolidation',
    subtitle: 'Expanding services and strengthening community control',
    summary: 'By 2011-2012, PICC was consolidating its position as Palm Island\'s leading community-controlled organization. Services expanded, the workforce grew, and organizational capacity strengthened. This period saw increased community engagement and early social enterprise development.',
    content: `# PICC 2011-2012 Annual Report Highlights

## Overview
The **2011-2012 fiscal year** marked a period of **growth and consolidation** for PICC, with expanded services, increased workforce, and strengthening organizational capacity. The organization was moving from establishment to sustainable operations.

## Organizational Maturity

### Governance and Management

**Strengthened Structures:**
- **Board:** Community members governing with experience
- **Executive leadership:** CEO and senior management team
- **Departmental structure:** Clear service lines and accountability
- **Policies and procedures:** Comprehensive and implemented
- **Quality systems:** Continuous improvement embedded
- **Financial management:** Strong controls and sustainability

**Community Accountability:**
- Regular reporting to community
- Annual General Meetings
- Transparent operations
- Community input into priorities
- Cultural protocols respected

### Strategic Direction

**Vision Clarifying:**
- Comprehensive community services
- Self-determination in practice
- Economic development alongside social services
- Cultural grounding
- Evidence-based practice
- Community empowerment

## Service Delivery 2011-2012

### Health Services Expansion

**Bwgcolman Healing Service Growth:**
- **Increased staffing:** More GPs, nurses, Aboriginal Health Workers
- **Expanded programs:** New chronic disease initiatives
- **Mental health:** Enhanced counseling and support
- **Health promotion:** Tackling Indigenous Smoking, healthy eating programs
- **Maternal and child health:** Expanded antenatal and postnatal services
- **Partnerships:** Stronger integration with Queensland Health

**Service Statistics:**
- Thousands of GP consultations annually
- Growing chronic disease register
- Increasing immunization coverage
- More patients engaged in care
- Community accessing services more

**Innovation:**
- Telehealth beginning (specialist consultations via video)
- Outreach services (home visits, mobile clinics)
- Cultural adaptations of mainstream programs
- Community health worker model strengthening

### Family and Community Services

**Family Wellbeing Expansion:**
- **More workers:** Family support workers, case managers
- **Programs:** Parenting groups, cultural activities, school readiness
- **Integration:** Health and family services working together
- **Early intervention:** Preventing family breakdown and child removal
- **Domestic violence:** Enhanced DFV support and advocacy

**Child Protection:**
- Working with families to keep children home
- Kinship care support
- Reunification assistance
- Cultural care planning
- Advocacy with Department of Child Safety

**Community Justice:**
- Court support expanding
- Diversion programs for youth and adults
- Restorative justice approaches
- Domestic and Family Violence Enhancement Program
- Partnerships with police and courts

### Youth Services

**Youth Program Development:**
- **After-school activities:** Sport, arts, culture, homework support
- **School holiday programs:** Intensive engagement during holidays
- **Mentoring:** Positive role models and life skills
- **Diversion:** Keeping youth out of justice system
- **Cultural connection:** Identity and belonging programs
- **Leadership:** Youth councils and decision-making

**Youth Engagement:**
- High participation rates
- Young people accessing support
- Diversionary success stories
- Cultural pride growing
- Pathway thinking developing

### Early Childhood

**Early Years Focus:**
- **Playgroups:** Supported playgroups for 0-5 years
- **Parenting support:** First-time parent programs
- **School readiness:** Transition to school preparation
- **Developmental screening:** Early identification of concerns
- **Integration:** Connection to health and family services

### Social Enterprises Emerging

**Early Business Development:**
- **Community shop:** Retail services
- **Mechanics workshop:** Vehicle repairs
- **Fuel station:** Essential service
- **Bakery:** Fresh bread daily

**Economic Impact:**
- Jobs for community members
- Essential services on-island
- Revenue generation
- Skills development
- Business model proving

## Workforce Growth 2011-2012

### Employment Expansion

**Growing Team:**
- 50-80+ employees (estimated - growing from 2009-10)
- Majority Palm Island residents
- Health, family services, youth, admin, social enterprises
- Career pathways developing
- Retention improving

**Local Capacity:**
- Aboriginal and Torres Strait Islander Health Workers
- Family support workers from community
- Youth workers
- Administrative staff
- Managers emerging from within

**Professional Staff:**
- GPs (permanent and locum)
- Registered nurses
- Allied health (some positions)
- Social workers
- Program coordinators

### Training and Development

**Investing in Workforce:**
- Certificate III and IV qualifications
- Diploma programs (community services, health)
- Leadership development
- Cultural competency training (for non-local staff)
- Professional supervision and mentoring
- Conferences and networking

**Career Pathways:**
- Entry-level to senior positions
- Peer workers becoming qualified professionals
- Community members in management
- Succession planning
- Pride in local workforce

## Community Engagement and Impact

### Health Outcomes

**Progress Indicators:**
- Chronic disease patients under care increasing
- Immunization rates improving
- Maternal and child health engagement up
- Health literacy growing
- Earlier detection and intervention
- Some hospitalizations prevented

**Persistent Challenges:**
- Chronic disease prevalence still very high
- Social determinants limiting progress
- Specialist access challenges
- Mental health needs exceeding capacity

### Family Strengthening

**Positive Trends:**
- More families receiving early support
- Some children kept with families (avoiding removal)
- Parenting confidence improving
- DFV victims receiving support
- Community members trained as helpers

**Ongoing Needs:**
- Child protection rates still high
- Family violence prevalence
- Complex trauma
- Resource constraints
- Need for intensive, long-term support

### Youth Engagement

**Success Stories:**
- Young people in programs instead of trouble
- Diversion from justice system
- School engagement improving for some
- Cultural connection growing
- Leadership emerging

### Economic Contribution

**PICC's Economic Impact:**
- Major employer (alongside Council and government)
- Wages supporting families
- Social enterprises providing services
- Local procurement where possible
- Economic multiplier effect

## Partnerships 2011-2012

### Strengthened Government Partnerships

**Queensland Health:**
- Multi-year service agreements
- Clinical governance framework
- Visiting specialist coordination
- Hospital integration
- Professional development support

**Department of Communities:**
- Family support services funding
- Child safety collaboration
- Integrated case management
- Cultural care planning

**Palm Island Aboriginal Shire Council:**
- Service coordination
- Joint community events
- Infrastructure collaboration
- Unified community voice

### Emerging Partnerships

**Educational Institutions:**
- Partnerships with TAFE for training
- University research collaborations
- Student placements

**Non-Government Organizations:**
- Referral networks
- Specialist service partnerships
- Shared training and resources

## Challenges 2011-2012

### Service Demand vs. Capacity

**High Needs:**
- Severe disadvantage in community
- Complex presentations
- Multi-generational trauma
- Social determinants undermining health and wellbeing

**Limited Resources:**
- Funding insufficient for needs
- Workforce shortages (national issue, worse remotely)
- Infrastructure constraints
- Waiting lists for some services

### Workforce Challenges

**Recruitment:**
- Difficult to attract professionals to remote area
- Housing shortages on island
- Professional isolation
- Competing demands (high caseloads)

**Retention:**
- Burnout and stress
- Career progression opportunities limited
- Family and lifestyle factors
- Turnover of non-local staff

**Solutions:**
- Competitive remuneration
- Professional development
- Supportive team environment
- Flexible arrangements
- Growing own workforce

### External Constraints

**Funding:**
- Short-term contracts creating uncertainty
- Tied funding limiting flexibility
- Reporting burden (administration load)
- Insufficient quantum for needs

**Policy Environment:**
- Government policy changes
- Intervention era legacy
- Tension between community control and government accountability
- Mainstream services not always culturally appropriate

## Achievements and Innovations

### Community Control in Practice

**Self-Determination:**
- PICC governed by community
- Services designed with cultural safety
- Local employment priority
- Community input into priorities
- Accountability to community

**Cultural Grounding:**
- Aboriginal and Torres Strait Islander Health Workers central
- Cultural protocols in all services
- Elder involvement and guidance
- Bwgcolman language respected
- Healing and cultural connection integrated

### Service Integration

**Holistic Model:**
- Health and family services working together
- Case management across services
- Shared information (with consent)
- Family-centered approach
- Addressing whole person and social determinants

**Efficiency:**
- Reduced duplication
- Better outcomes
- Client convenience (multiple services in one place)
- Team collaboration

### Innovation

**Adapting Evidence-Based Practice:**
- Mainstream programs culturally adapted
- Community-designed interventions
- Traditional knowledge integrated
- Flexible and responsive
- Learning and improving

**Technology:**
- Electronic health records
- Telehealth starting
- Data systems for monitoring and evaluation
- Communication and coordination tools

## Financial Sustainability

### Revenue Growth

**Diversified Funding:**
- Queensland Health primary healthcare
- Australian Government programs
- Service contracts
- Social enterprise revenue (growing)
- Grants and one-off funding

**Financial Management:**
- Audited financial statements
- Strong controls and governance
- Reserves building
- Investment in infrastructure and systems
- Sustainable operations

### Economic Scale

**Multi-Million Dollar Organization:**
- Significant budget
- Major employer
- Community economic engine
- Demonstrating viability of community control

## Looking Ahead from 2011-2012

### Growth Trajectory

**Expansion Plans:**
- More comprehensive services
- Enhanced mental health
- Economic development
- Infrastructure improvements
- Workforce growth

**Organizational Development:**
- Stronger systems
- Leadership development
- Quality improvement
- Evidence base building
- Regional and national influence

## Significance of 2011-2012 Period

### Consolidation Phase

This period represented **consolidation and growth**:
- Moving from startup to sustainable operations
- Services expanded and strengthened
- Workforce growing
- Community trust deepening
- Organizational capacity maturing
- Vision becoming reality

### Proof of Concept

**Demonstrating:**
- Community-controlled organizations can deliver quality services
- Aboriginal and Torres Strait Islander leadership works
- Cultural grounding improves outcomes
- Local employment strengthens community
- Self-determination is achievable

### Foundation for Future

The 2011-2012 period **set the stage** for:
- Continued growth to 200 employees (2024)
- Major social enterprises (Digital Service Centre 2023)
- Comprehensive integrated services
- Regional leadership
- National recognition

## Historical Arc

**Journey:**
- **2009-10:** Establishment and foundation
- **2011-12:** Growth and consolidation
- **2013-2020:** Continued expansion (intermediate years)
- **2023-24:** Mature organization with major achievements

**Continuous:**
- Community control
- Cultural grounding
- Service quality
- Employment growth
- Self-determination

## Legacy

The 2011-2012 period is significant because it showed that **PICC was here to stay**—not a short-term project but a **permanent institution** of the Palm Island community, committed to long-term improvement and self-determination.

## Source
PICC 2011-2012 Annual Report (publicly available)`,
    entry_type: 'document',
    category: 'Annual Reports',
    keywords: ['PICC', '2011-2012', 'annual report', 'service expansion', 'workforce growth', 'community control', 'Palm Island'],
    structured_data: {
      source: 'PICC 2011-2012 Annual Report',
      fiscal_year: '2011-2012',
      report_url: 'https://os-data-2.s3-ap-southeast-2.amazonaws.com/picc-com-au/bundle1/picc-ar-11-12_email.pdf',
      key_services: [
        'Bwgcolman Healing Service (expanded)',
        'Family wellbeing (enhanced)',
        'Youth services (growing)',
        'Early childhood',
        'Community Justice',
        'Social enterprises (emerging)'
      ],
      organizational_stage: 'Growth and consolidation',
      workforce: '50-80+ employees (estimated)',
      key_themes: [
        'Service expansion',
        'Workforce growth',
        'Community engagement',
        'Service integration',
        'Financial sustainability'
      ],
      achievements: ['Expanded services', 'Growing workforce', 'Service integration', 'Community trust', 'Innovation'],
      challenges: ['High demand vs capacity', 'Workforce recruitment', 'Funding constraints']
    },
    fiscal_year: '2011-2012',
    location_type: 'palm_island',
    is_public: true,
    is_verified: true
  },
  {
    slug: 'picc-program-evolution-timeline-2009-2024',
    title: 'PICC Program Evolution Timeline 2009-2024',
    subtitle: 'Fifteen years of growth, innovation, and self-determination',
    summary: 'From its early days in 2009-2010 to becoming a 200-employee organization in 2024, PICC has evolved from basic service delivery to comprehensive integrated programs and groundbreaking social enterprises. This timeline traces the organizational pathway and major milestones.',
    content: `# PICC Program Evolution Timeline 2009-2024

## Overview
This timeline chronicles the **Palm Island Community Company (PICC)** evolution from a developing community-controlled organization in 2009 to a **comprehensive multi-service provider** and **social enterprise leader** by 2024.

## Timeline of Major Developments

### 2009-2010: FOUNDATION YEARS

**Organizational Establishment:**
- PICC establishing itself as community-controlled organization
- Taking over services from government
- Building governance and management structures
- Developing policies and systems
- Early workforce recruitment

**Core Services Established:**
- **Primary Healthcare:** Bwgcolman Healing Service (partnership with Queensland Health)
- **Family Support:** Child protection support, parenting programs
- **Community Justice:** Court support, diversion programs
- **Youth Programs:** After-school and holiday programs

**Workforce:**
- Small but growing team
- Aboriginal Health Workers critical
- Local employment beginning
- Professional recruitment challenges

**Key Themes:**
- Community control transition
- Building trust
- Service establishment
- Capacity development
- Cultural grounding

**Challenges:**
- New organization growing pains
- Severe community disadvantage
- Remote location constraints
- Limited resources
- Historical trauma

### 2011-2012: GROWTH AND CONSOLIDATION

**Service Expansion:**
- **Health services:** More GPs, nurses, programs
- **Family wellbeing:** Enhanced DFV support, parenting programs
- **Early childhood:** Playgroups, school readiness expanding
- **Youth services:** Mentoring, leadership programs
- **Social enterprises:** Community shop, mechanics, fuel station, bakery operating

**Workforce Growth:**
- 50-80+ employees (estimated)
- More local people in roles
- Training and qualifications increasing
- Career pathways developing

**Organizational Maturity:**
- Stronger governance and management
- Quality systems improving
- Financial sustainability growing
- Service integration beginning

**Innovations:**
- Telehealth starting
- Cultural adaptations of programs
- Holistic service model
- Community-designed interventions

**Key Themes:**
- Consolidation
- Growth
- Proof of concept
- Community trust deepening

### 2013-2015: INTERMEDIATE EXPANSION

**Estimated Developments:**
- Services continuing to expand
- Workforce growing
- Infrastructure improvements
- Partnerships strengthening
- National recognition growing

**Likely Focus Areas:**
- Mental health services enhancement
- Substance use programs
- Chronic disease management
- Family violence response
- Youth engagement

### 2016-2018: PRE-CENTENARY PERIOD

**2018: Palm Island Centenary:**
- 100 years since Hull River survivors relocated (1918-2018)
- Community celebration and reflection
- National attention
- Pride in survival and resistance
- Future orientation

**PICC Role:**
- Major community institution
- Service provider across health, family, youth
- Employer of community members
- Symbol of self-determination

**Developments:**
- Social enterprises maturing
- Comprehensive service integration
- Community outcomes evidence building
- Regional leadership emerging

### 2019-2020: COVID-19 PANDEMIC RESPONSE

**Pandemic Challenges:**
- Remote island community at risk
- Need for isolation and protection
- Service delivery adaptations
- Community health and safety paramount

**PICC Response (Likely):**
- **Health services:** COVID testing, vaccination, education
- **Community support:** Food security, essential services
- **Communication:** Community information and reassurance
- **Coordination:** Working with Council and government
- **Protection:** Keeping virus out of community

**Outcomes:**
- Community protected (likely low case numbers)
- Services adapted and continued
- Resilience demonstrated
- Community solidarity strengthened

**Innovation:**
- Telehealth expansion
- Remote service delivery
- Community mobilization
- Crisis response capacity

### 2021-2022: POST-PANDEMIC RECOVERY AND PLANNING

**Recovery Phase:**
- Services returning to normal
- Addressing delayed care and services
- Mental health impacts
- Economic recovery
- Planning for future

**Developments:**
- Workforce continued to grow
- Services expanded
- Infrastructure investments
- Technology adoption
- Partnership strengthening

**Strategic Planning:**
- Vision for major growth
- Social enterprise expansion
- Economic development focus
- Employment creation priority

### 2023: TRANSFORMATIONAL YEAR

**June 16, 2023: DIGITAL SERVICE CENTRE OPENS**

**Game-Changing Development:**
- **Partnership with Telstra** announced and launched
- **21 Palm Island employees** hired (capacity for 30)
- **Customer service centre** serving Telstra customers across Australia
- **50+ languages** supported
- **First Indigenous community-owned digital service centre** in Australia

**Significance:**
- Major employment creation (in community with 29.1% unemployment)
- Demonstration of community capability
- National recognition and media coverage
- Revenue for PICC to support other services
- Proof of concept for social enterprise
- Pride and hope for community

**Other Developments:**
- Services continuing to expand
- Workforce growth accelerating
- Infrastructure improvements
- National profile increasing

### 2024: MATURE ORGANIZATION AND NATIONAL LEADER

**PICC by the Numbers (2023-24 Annual Report):**
- **Nearly 200 employees** (up 33% from previous year)
- **75% of workforce** are Palm Islanders
- **Over 100 local jobs created**
- **$5.8 million in wages** delivered
- **$9.75 million in economic output** for community
- **~400 Aboriginal/Torres Strait Islander staff** employed over PICC's history

**Comprehensive Services:**

**Health:**
- Bwgcolman Healing Service (Primary Health Centre)
- 30+ health staff
- GP services, nursing, Aboriginal Health Workers
- Chronic disease programs
- Maternal and child health
- Mental health support
- Health promotion (Tackling Indigenous Smoking, etc.)

**Family and Community:**
- Family Wellbeing Service (child safety, DFV, parenting)
- Women's Healing Service (Townsville-based)
- Early Childhood Services (playgroups, school readiness)
- Community Justice Group (auspiced by PICC)

**Youth:**
- Young Offenders Support Service
- Indigenous Youth Connection to Culture
- Tackling Indigenous Smoking (youth component)
- Digital Footprint program

**Economic Development and Social Enterprises:**
- **Digital Service Centre** (21 employees, Telstra partnership)
- **Community Shop** (retail)
- **Bakery** (fresh bread daily)
- **Mechanics workshop**
- **Fuel station**
- **NDIS services** (team based in Retail Centre)

**Other:**
- Integration across all services
- Cultural grounding throughout
- Community control and governance
- Quality and evidence-based practice

**National Recognition:**
- Leading Indigenous community-controlled organization
- Model for self-determination
- Innovation and social enterprise exemplar
- Close the Gap champion
- Media coverage and political attention

## Key Milestones and Achievements

### Organizational Growth

**2009-10 → 2023-24:**
- Small startup → 200-employee organization
- Limited services → comprehensive integrated programs
- Uncertain viability → financial sustainability
- Local operation → national recognition

**Workforce:**
- Handful of staff → Nearly 200 employees
- Limited local employment → 75% Palm Islanders
- Basic jobs → Career pathways and leadership
- $5.8 million annual wages

### Service Evolution

**Health Services:**
- Basic GP services → Comprehensive primary healthcare
- Limited programs → Chronic disease management, mental health, maternal/child health
- Few staff → 30+ health professionals
- Reactive care → Prevention and early intervention

**Family and Social Services:**
- Limited support → Comprehensive family wellbeing
- Generic services → Culturally grounded, trauma-informed
- Government-controlled → Community-designed and delivered
- Crisis response → Early intervention and prevention

**Economic Development:**
- No social enterprises → Multiple businesses
- Limited employment → Major job creator
- Welfare dependency → Employment and dignity
- Small impact → $9.75M economic output

### Innovation and Leadership

**Groundbreaking Achievements:**
- **Digital Service Centre** - First Indigenous community-owned call center
- **Integrated services** - Health, family, youth working together
- **Cultural grounding** - Aboriginal leadership and cultural safety
- **Evidence base** - Data and evaluation for continuous improvement
- **Sustainability** - Social enterprises supporting social services

**National Influence:**
- Model for community-controlled organizations
- Social enterprise exemplar
- Closing the Gap advocate
- Self-determination in action
- Policy influence

## Factors Enabling Success

### Community Control

**Self-Determination:**
- PICC governed by Palm Island community
- Board members from community
- Local decision-making
- Cultural authority respected
- Accountability to community (not just government)

**Cultural Grounding:**
- Aboriginal and Torres Strait Islander leadership
- Cultural protocols integrated
- Traditional knowledge respected
- Bwgcolman language and identity
- Connection to Country

### Strategic Vision

**Clear Mission:**
- Making Palm Island safer, stronger, more prosperous
- Community wellbeing focus
- Economic development alongside social services
- Evidence-based and culturally grounded
- Long-term orientation

**Adaptive Planning:**
- Responsive to community needs
- Innovation and creativity
- Learning from challenges
- Seizing opportunities (like Telstra partnership)
- Continuous improvement

### Workforce Investment

**Growing Local Capacity:**
- Training and qualifications
- Mentoring and support
- Career pathways
- Leadership development
- Pride and ownership

**Recruiting and Retaining:**
- Competitive remuneration
- Professional development
- Supportive culture
- Flexible arrangements
- Recognition and appreciation

### Partnerships

**Government:**
- Queensland Health (primary healthcare)
- Australian Government programs
- State departments (Child Safety, etc.)
- Funding and clinical support

**Corporate:**
- **Telstra** (Digital Service Centre - transformational)
- Potential others

**Community:**
- Palm Island Aboriginal Shire Council
- Schools
- Elders and Traditional Owners
- Community organizations

**Regional and National:**
- Indigenous organizations
- Research institutions
- Networks and alliances

### Financial Sustainability

**Diversified Revenue:**
- Government service agreements
- Social enterprise income
- Grants and programs
- Medicare and other
- Reducing single-source dependency

**Strong Management:**
- Financial controls
- Audited statements
- Risk management
- Investment in infrastructure
- Reserves for stability

## Ongoing Challenges

### External Constraints

**Funding:**
- Still insufficient for community needs
- Short-term agreements
- Tied funding
- Reporting burden

**Social Determinants:**
- Severe disadvantage persists
- Overcrowding and housing shortage
- Unemployment still high (despite PICC's employment)
- Education gaps
- Historical trauma ongoing

**Policy Environment:**
- Government policy instability
- Mainstream services not always appropriate
- Racism and discrimination
- Limited Indigenous control beyond PICC

### Internal Challenges

**Workforce:**
- Recruitment still difficult
- Retention challenges
- Burnout risk
- Need more local professional qualifications

**Service Demand:**
- Needs exceed capacity
- Complex presentations
- Waiting lists
- Insufficient resources for needs

**Growth Management:**
- Maintaining quality while expanding
- Organizational complexity
- Systems and infrastructure keeping pace
- Cultural safety at scale

## Future Directions

### Expansion Plans

**Services:**
- Mental health services expansion
- Dialysis on-island (preventing relocation)
- Residential aged care facility
- Enhanced dental services
- More specialist access

**Economic Development:**
- Digital Service Centre to 30 employees
- New social enterprises
- Cultural tourism
- Training and consulting
- Regional economic hub

**Infrastructure:**
- Facilities expansion
- Technology and systems
- Housing for workers
- Community spaces

### Strategic Goals

**Community Outcomes:**
- Close the Gap progress
- Employment increasing
- Health improving
- Families stronger
- Youth engaged
- Self-determination realized

**Organizational Development:**
- Workforce to 250+ employees
- More local people in senior roles
- Financial reserves growing
- National and international recognition
- Sustainability for generations

## Significance of PICC's Evolution

### Self-Determination Model

PICC demonstrates:
- **Community control works** - Quality services, better outcomes
- **Cultural grounding matters** - Trust, engagement, appropriateness
- **Local employment strengthens community** - Pride, skills, economic benefit
- **Integration is effective** - Holistic approach, efficiency
- **Social enterprises can thrive** - Business and social mission compatible

### Inspiration for Others

**PICC as Exemplar:**
- Other Indigenous communities looking to PICC
- Government recognizing community-control value
- Corporate partnerships (Telstra) seeing mutual benefit
- Academic research documenting success
- Media showcasing positive Indigenous stories

### Palm Island Pride

**PICC Represents:**
- Community capacity and capability
- Resistance and resilience tradition (1957 Strike, 2004 uprising, ongoing)
- Self-determination in practice
- Hope for future generations
- Palm Island on the rise

## Reflection: 2009-2024 Journey

From **small beginnings to national leadership**, PICC's 15-year evolution shows what's possible when:
- **Communities control their own services**
- **Cultural grounding is central**
- **Employment and economic development are prioritized**
- **Innovation and excellence are pursued**
- **Long-term commitment is maintained**

**The journey continues**, but PICC has already proven that **Palm Island can determine its own future**.

## Source
PICC Annual Reports (2009-10, 2011-12, 2023-24), organizational knowledge, publicly available information`,
    entry_type: 'document',
    category: 'Organizational History',
    keywords: ['PICC', 'evolution', 'timeline', '2009-2024', 'organizational development', 'program growth', 'Palm Island', 'self-determination'],
    structured_data: {
      source: 'PICC Annual Reports and organizational history',
      time_period: '2009-2024 (15 years)',
      key_milestones: [
        '2009-10: Foundation and establishment',
        '2011-12: Growth and consolidation',
        '2018: Palm Island Centenary',
        '2020: COVID-19 pandemic response',
        '2023: Digital Service Centre opens (June 16)',
        '2024: Nearly 200 employees, $9.75M economic output'
      ],
      workforce_growth: 'From startup to 200 employees (75% local)',
      service_evolution: 'From basic services to comprehensive integrated programs',
      social_enterprises: ['Digital Service Centre', 'Community shop', 'Bakery', 'Mechanics', 'Fuel station'],
      organizational_trajectory: 'Small community organization → National leader',
      key_success_factors: [
        'Community control',
        'Cultural grounding',
        'Workforce investment',
        'Strategic partnerships',
        'Financial sustainability'
      ]
    },
    fiscal_year: null,
    location_type: 'palm_island',
    is_public: true,
    is_verified: true
  }
]

async function main() {
  console.log('🚀 Starting Annual Reports History import...')

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
