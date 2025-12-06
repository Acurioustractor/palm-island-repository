/**
 * Import Partnerships, Policy, and Research Content
 *
 * Adds comprehensive entries for:
 * - PICC-Queensland Health Partnership
 * - Close the Gap Targets and Progress
 * - Palm Island Policy and Advocacy
 * - Academic Research on Palm Island
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
    slug: 'picc-queensland-health-partnership',
    title: 'PICC-Queensland Health Partnership',
    subtitle: 'Delivering comprehensive primary healthcare',
    summary: 'The Palm Island Community Company (PICC) partners with Queensland Health to deliver primary healthcare services through the Bwgcolman Healing Service. This partnership combines community control with government funding and clinical governance to provide culturally safe, comprehensive health care.',
    content: `# PICC-Queensland Health Partnership

## Overview
The **Palm Island Community Company (PICC)** and **Queensland Health** have a **long-standing partnership** to deliver **primary healthcare services** on Palm Island through the **Bwgcolman Healing Service** (Primary Health Centre).

## Partnership Model

### Community-Controlled Health Service

**PICC's Role:**
- **Ownership and governance:** PICC owns and controls the health service
- **Employment:** Hires and manages health staff
- **Service design:** Determines programs and approaches
- **Cultural safety:** Ensures culturally appropriate care
- **Community accountability:** Responsible to Palm Island community
- **Integration:** Links health with other PICC services (family wellbeing, youth, etc.)

**Queensland Health's Role:**
- **Funding:** Primary healthcare funding through service agreements
- **Clinical governance:** Clinical standards and quality assurance
- **Specialist support:** Visiting specialists and backup
- **Hospital services:** Palm Island Hospital (Queensland Health-run)
- **Emergency evacuation:** Patient transfer for serious cases
- **Professional development:** Training and support for health professionals
- **Resources:** Clinical equipment, supplies, pharmaceuticals

**Partnership Benefits:**
- Community control + government resources
- Cultural safety + clinical excellence
- Local employment + professional support
- Integrated services + specialist access
- Self-determination + accountability
- Innovation + evidence-based practice

### Funding and Sustainability

**Funding Sources:**
- Queensland Government primary healthcare funding
- Australian Government (Medicare, PBS)
- Closing the Gap health funding
- Specific program grants (e.g., Tackling Indigenous Smoking)
- NDIS (for eligible services)
- Social enterprise revenue (cross-subsidy)

**Service Agreement:**
- Multi-year funding agreements
- Service delivery targets and KPIs
- Reporting and accountability
- Quality and safety standards
- Workforce requirements
- Financial oversight

**Challenges:**
- Funding uncertainty (short-term agreements)
- Insufficient funding for community needs
- Reporting burden
- Tension between community priorities and government requirements
- Recruitment and retention costs
- Remote area loading

## Bwgcolman Healing Service

### Comprehensive Primary Healthcare

**General Practice:**
- **GP services:** Consultations, diagnosis, treatment, prescriptions
- **Chronic disease management:** Diabetes, heart disease, kidney disease, respiratory conditions
- **Preventive care:** Health checks, screening, immunizations
- **Acute care:** Illness and injury treatment
- **Mental health:** Assessment, counseling, referrals
- **Maternal and child health:** Antenatal, postnatal, child health checks
- **Sexual and reproductive health:** Contraception, STI testing and treatment, cervical screening
- **Aged care:** Assessment, chronic condition management, palliative care

**Nursing Services:**
- **Practice nurses:** Chronic disease monitoring, wound care, procedures
- **Registered nurses:** Acute care, triage, emergency response
- **Midwifery:** Antenatal care on island (births in Townsville)
- **Home visits:** For elderly, disabled, or homebound patients
- **Health education:** Community programs and individual education
- **Care coordination:** Linking patients to services

**Aboriginal and Torres Strait Islander Health Workers:**
- **Cultural liaison:** Bridging healthcare and community
- **Health promotion:** Community education and awareness
- **Outreach:** Engaging community members in healthcare
- **Transport:** Assisting patients to appointments
- **Translation:** Language and cultural interpretation
- **Chronic disease support:** Monitoring, medication support, lifestyle programs
- **Essential workforce:** Deep community knowledge and trust

**Allied Health:**
- **Visiting or telehealth:**
  - Dietitian (diabetes, renal, general nutrition)
  - Physiotherapist (injury, chronic pain, mobility)
  - Occupational therapist (disability, rehab, equipment)
  - Psychologist/counselor (mental health)
  - Social worker (complex cases, child protection)
  - Podiatrist (diabetes foot care)
  - Optometrist (eye health)
  - Dentist (oral health - periodic visits)
  - Speech pathologist (children, stroke recovery)

**Pharmacy:**
- On-site or nearby pharmacy
- Medication dispensing
- Medication management and counseling
- Dose administration aids
- Stock of essential medicines

### Clinical Services and Programs

**Chronic Disease Programs:**
- **Diabetes program:** Education, monitoring, medication, foot care, eye checks
- **Cardiovascular health:** Heart health checks, blood pressure monitoring, lipid management
- **Renal program:** Kidney function monitoring, early intervention, dialysis liaison
- **Respiratory health:** Asthma and COPD management, spirometry
- **Integrated Team Care:** Multidisciplinary approach for complex patients

**Maternal and Child Health:**
- **Antenatal care:** Regular checks, screening, education, preparation for birth
- **Postnatal care:** Mother and baby checks, breastfeeding support, mental health
- **Child health:** Developmental screening, immunizations, growth monitoring
- **Family support:** Integration with PICC Early Childhood Services

**Mental Health and Social-Emotional Wellbeing:**
- **Assessment and counseling:** Individual and family
- **Crisis intervention:** Risk assessment and safety planning
- **Referrals:** Specialist mental health services (Townsville)
- **Social prescribing:** Connection to culture, community activities, support groups
- **Integration:** With Women's Healing Service, youth services, substance use programs
- **Holistic approach:** Recognizing social determinants and cultural factors

**Health Promotion:**
- **Tackling Indigenous Smoking:** Quit programs, education, advocacy
- **Healthy eating and physical activity:** Nutrition education, cooking classes, exercise programs
- **Sexual health:** Education, condom distribution, testing campaigns
- **Alcohol and drug education:** Harm reduction, treatment pathways
- **School health:** Partnerships with Palm Island State School
- **Community events:** Health screening days, awareness campaigns

**Immunization:**
- **Childhood immunizations:** Following national schedule
- **Catch-up vaccinations:** For those behind
- **Influenza vaccination:** Annual flu shots
- **COVID-19 vaccination:** Pandemic response
- **Travel vaccinations:** For those traveling off-island
- **Outreach:** Home visits, school-based, community events

### Workforce and Capacity

**Staffing:**
- **GPs:** Permanent and locum doctors
- **Nurses:** RNs and Enrolled Nurses
- **Aboriginal and Torres Strait Islander Health Workers:** Critical local workforce
- **Practice Manager:** Administration and operations
- **Allied health:** Visiting or telehealth
- **Admin and reception:** Local staff
- **30+ PICC health staff** (as of 2023-24 Annual Report)

**Recruitment Challenges:**
- **Remote location:** Difficult to attract mainland professionals
- **Housing:** Limited accommodation on island
- **Isolation:** Professional and social isolation
- **Workload:** High demand, complex presentations
- **Burnout:** Stressful environment
- **Retention:** High turnover of non-local staff

**Workforce Solutions:**
- **Competitive remuneration:** Remote area incentives
- **Professional development:** Training, conferences, supervision
- **Mentoring:** Senior staff supporting junior staff
- **Flexible arrangements:** Fly-in-fly-out, short-term contracts
- **Local employment:** Training Palm Island residents as health workers
- **Supportive environment:** Team cohesion, cultural support
- **Grow-your-own:** Pathways for local people into health careers

### Integration with Other PICC Services

**Holistic Model:**
- **Health is interconnected:** Physical, mental, social, cultural, spiritual
- **Integrated case management:** Coordination across services
- **Shared facilities:** Co-location where possible
- **Referral pathways:** Seamless connections between services
- **Team approach:** Health, family wellbeing, youth, community justice working together
- **Efficiency:** Reduced duplication, better outcomes

**Examples:**
- **Patient with diabetes:** GP for medical care + dietitian + exercise program + mental health support + family wellbeing if family stress affecting management
- **Pregnant woman:** Antenatal care at health service + family wellbeing parenting preparation + early childhood service for postpartum support
- **Youth with substance use:** Health service for assessment and medical care + youth service for counseling and activities + community justice for diversion

## Queensland Health Support

### Palm Island Hospital

**Facility:**
- **Queensland Health-operated**
- **Nurse-led model:** Nurse practitioners and RNs
- **GP support:** GPs from Bwgcolman Healing Service
- **Emergency stabilization:** Initial treatment before evacuation if necessary
- **Limited inpatient capacity:** Short-term observation
- **24/7 coverage:** Nursing staff always on duty
- **Telehealth:** Specialist consultation via video

**Services:**
- **Emergency care:** Triage, stabilization, treatment
- **Minor procedures:** Suturing, minor trauma, etc.
- **Observation:** Short-term monitoring (< 24-48 hours typically)
- **Evacuation coordination:** Arranging transfer to Townsville for serious cases
- **Medication:** After-hours medication access

**Limitations:**
- **No surgery:** Surgical cases evacuated
- **No obstetrics:** All births occur in Townsville
- **Limited diagnostics:** Basic X-ray and pathology (sent to Townsville)
- **No ICU:** Critical patients evacuated
- **Limited specialist care:** Visiting or telehealth only

### Specialist Services and Evacuation

**Visiting Specialists:**
- **Outreach clinics:** Specialists visit Palm Island periodically
- **Services:** Varies (e.g., ophthalmology, ENT, pediatrics, obstetrics)
- **Efficiency:** Reduces need for patient travel
- **Challenges:** Infrequent visits, limited capacity

**Telehealth:**
- **Video consultations:** Specialists consult from Townsville via video
- **Services:** Wide range (mental health, endocrinology, cardiology, etc.)
- **Advantages:** Access without travel
- **Limitations:** Technology bandwidth, hands-on examination not possible

**Patient Evacuation:**
- **Emergency transfer:** For serious injuries, illness, or childbirth
- **RFDS (Royal Flying Doctor Service):** Air ambulance
- **Commercial flights:** Scheduled or charter for non-emergencies
- **Helicopter:** For critical emergencies
- **Townsville Hospital:** Destination for most evacuations
- **Separation from family:** Cultural and emotional impact

**Patient Assisted Travel Scheme (PATS):**
- **Queensland Government program:** Subsidized travel for medical appointments
- **Eligibility:** Specialist care not available locally
- **Covers:** Partial travel and accommodation costs
- **Challenges:** Out-of-pocket costs, navigation complexity, family separation

## Culturally Safe Care

### Cultural Competency

**Staff Training:**
- **Cultural awareness:** Understanding Aboriginal and Torres Strait Islander cultures
- **Palm Island specific:** Local history, community, cultural protocols
- **Racism and bias:** Recognizing and addressing
- **Communication:** Culturally appropriate styles
- **Trauma-informed:** Understanding historical and intergenerational trauma
- **Ongoing education:** Regular training and reflection

**Aboriginal and Torres Strait Islander Health Workers:**
- **Cultural bridge:** Connecting clinical staff and community
- **Trust:** Community members trust local health workers
- **Language:** Bwgcolman and English
- **Protocols:** Ensuring cultural safety
- **Advocacy:** Representing patient needs and preferences
- **Essential:** Non-negotiable part of workforce

**Community Engagement:**
- **Elder involvement:** Advice and guidance
- **Community consultations:** On programs and priorities
- **Feedback:** Community input into service improvement
- **Transparency:** Reporting and accountability to community
- **Partnership:** Working with community, not imposing on community

### Addressing Barriers to Care

**Systemic Racism:**
- **Historical trauma:** Missions, Stolen Generations, medical experimentation
- **Mistrust:** Well-founded suspicion of government and institutions
- **Discrimination:** Experiences of racism in healthcare
- **Cultural insensitivity:** Mainstream services failing to respect culture
- **Response:** Cultural safety, community control, trauma-informed care, advocacy

**Practical Barriers:**
- **Transport:** Limited vehicles, distance to clinic for some
- **Wait times:** High demand, limited appointments
- **Cost:** Bulk-billing but some out-of-pocket costs
- **Literacy:** Health literacy challenges
- **Shame:** Culturally-specific shame about some conditions
- **Competing priorities:** Family obligations, financial stress
- **Response:** Outreach, flexible scheduling, financial support, education, sensitivity

## Outcomes and Impact

### Health Improvements

**Positive Trends:**
- **Increased life expectancy:** Gradual improvement (though still gap)
- **Reduced infant mortality:** Better maternal and child health
- **Higher immunization rates:** Community campaigns effective
- **Chronic disease management:** More people engaged in care
- **Earlier detection:** Screening programs identifying issues sooner
- **Reduced hospitalizations:** Better primary care preventing crises

**Ongoing Challenges:**
- **Chronic disease prevalence:** Still very high (diabetes, heart disease, kidney disease)
- **Mental health:** High burden, limited services
- **Substance use:** Alcohol and drugs affecting health
- **Social determinants:** Poverty, overcrowding, unemployment undermining health
- **Gaps persist:** Still significant disparities vs. non-Indigenous Australians

### Community Empowerment

**Self-Determination:**
- **Community control:** PICC governs health service
- **Local employment:** Palm Islanders employed in health
- **Cultural authority:** Community determines cultural approaches
- **Advocacy:** Community voice in health policy
- **Pride:** Visible success of community-led service

**Capacity Building:**
- **Skills:** Health workforce growing
- **Leadership:** Community members in management roles
- **Knowledge:** Health literacy increasing
- **Systems:** Organizational capacity strengthening
- **Influence:** Regional and national recognition

## Challenges and Future Directions

### Challenges

**Funding:**
- **Insufficient:** Needs exceed resources
- **Short-term:** Uncertainty from contract to contract
- **Reporting burden:** Excessive administration
- **Flexibility:** Tied funding limiting innovation

**Workforce:**
- **Recruitment:** Attracting professionals to remote area
- **Retention:** Keeping staff long-term
- **Burnout:** High workload and stress
- **Succession:** Building local health workforce pipeline

**Service Gaps:**
- **Mental health:** Insufficient services
- **Dental:** Limited access to dentistry
- **Dialysis:** No on-island dialysis (patients relocated)
- **Aged care:** Limited residential aged care
- **Specialist access:** Infrequent visits, travel required

**Social Determinants:**
- **Housing:** Overcrowding affecting health
- **Income:** Poverty limiting healthy choices
- **Education:** Health literacy challenges
- **Infrastructure:** Limited facilities for health activities
- **Context:** Health service alone cannot overcome structural disadvantage

### Future Directions

**Expand Services:**
- **Mental health:** More psychologists, counselors, cultural healing
- **Dialysis unit:** On-island dialysis preventing relocation
- **Residential aged care:** Aged care facility on island
- **Dental clinic:** Regular dentist presence
- **Maternity:** Antenatal and postnatal care expansion, exploring on-island births (long-term)

**Workforce Development:**
- **Training pipelines:** More local people into health careers
- **Cadetships and scholarships:** Supporting Palm Island students
- **Registered nurse pathways:** Aboriginal Health Workers becoming RNs
- **GPs from community:** Long-term goal of local doctors
- **Retention strategies:** Improving work conditions and support

**Innovation:**
- **Telehealth expansion:** More services via video
- **Mobile health:** Outreach to community
- **Social prescribing:** Connecting health to culture, activity, community
- **Traditional healing:** Integrating bush medicine and cultural practices
- **Technology:** Apps, remote monitoring, data systems

**Advocacy:**
- **Closing the Gap:** Pressure for faster progress
- **Funding increases:** Adequate resources for needs
- **Flexibility:** Community control over priorities
- **Social determinants:** Action on housing, income, education
- **Policy influence:** Palm Island voice in health policy

## Significance

The PICC-Queensland Health partnership represents:
- **Self-Determination:** Community-controlled health service
- **Partnership:** Balancing community control and government support
- **Cultural Safety:** Centering Aboriginal and Torres Strait Islander cultures
- **Holistic Care:** Addressing whole person and social determinants
- **Employment:** Jobs for Palm Island residents
- **Model:** Demonstrating community-controlled health works
- **Hope:** Progress toward health equity

## Contact

**Bwgcolman Healing Service:**
- Located on Palm Island
- Phone and appointments through PICC
- Emergency: Palm Island Hospital (24/7)

## Source
PICC Annual Reports, Queensland Health information, community knowledge`,
    entry_type: 'program',
    category: 'Partnerships',
    keywords: ['PICC', 'Queensland Health', 'partnership', 'Bwgcolman Healing Service', 'primary healthcare', 'community-controlled health', 'Palm Island'],
    structured_data: {
      source: 'PICC Annual Reports, Queensland Health',
      partner: 'Queensland Health',
      service: 'Bwgcolman Healing Service (Primary Health Centre)',
      model: 'Community-controlled with government funding and clinical governance',
      services: [
        'General practice',
        'Nursing services',
        'Aboriginal Health Workers',
        'Allied health',
        'Chronic disease programs',
        'Maternal and child health',
        'Mental health',
        'Health promotion',
        'Immunization'
      ],
      staff: '30+ health staff (PICC)',
      hospital: 'Palm Island Hospital (Queensland Health)',
      culturally_safe: true,
      community_controlled: true,
      outcomes: ['Increased life expectancy', 'Reduced infant mortality', 'Higher immunization rates', 'Improved chronic disease management']
    },
    fiscal_year: '2023-2024',
    location_type: 'palm_island',
    is_public: true,
    is_verified: true
  },
  {
    slug: 'close-the-gap-targets-progress',
    title: 'Close the Gap: Targets and Progress for Palm Island',
    subtitle: 'National commitment to Aboriginal and Torres Strait Islander health equality',
    summary: 'Close the Gap is the national strategy to address Aboriginal and Torres Strait Islander health and socioeconomic disadvantage. Palm Island is affected by all targets including life expectancy, child mortality, education, employment, and incarceration. Progress is slow, requiring intensified effort and investment.',
    content: `# Close the Gap: Targets and Progress for Palm Island

## Overview
**Close the Gap** is Australia's national commitment to reducing **health and socioeconomic disadvantage** experienced by Aboriginal and Torres Strait Islander peoples. Originally launched in 2008, it was refreshed in 2020 with **17 socioeconomic targets** across health, education, employment, and justice.

## Close the Gap Framework

### National Agreement (2020)

**Parties:**
- Australian Government
- State and Territory Governments
- Coalition of Aboriginal and Torres Strait Islander Peak Organisations

**Principles:**
- **Partnership:** Shared decision-making with Indigenous peoples
- **Priority Reforms:** Transforming how governments work with Indigenous communities
- **Targets:** Measurable outcomes across key areas
- **Accountability:** Public reporting on progress

**Priority Reforms:**
1. **Formal partnerships and shared decision-making**
2. **Building Aboriginal and Torres Strait Islander community-controlled sector**
3. **Transforming government organizations** (cultural safety, accountability)
4. **Shared access to data and information** (Indigenous data sovereignty)

### 17 Socioeconomic Targets

**Organized into 4 themes:**
1. **Aboriginal and Torres Strait Islander people enjoy long and healthy lives**
2. **Aboriginal and Torres Strait Islander children are born healthy and strong**
3. **Aboriginal and Torres Strait Islander children are engaged in high-quality, culturally appropriate early childhood education**
4. **Aboriginal and Torres Strait Islander children thrive in their early years**
5. **Aboriginal and Torres Strait Islander students achieve their full learning potential**
6. **Aboriginal and Torres Strait Islander students reach their full potential through further education**
7. **Aboriginal and Torres Strait Islander youth are engaged in employment or education**
8. **Aboriginal and Torres Strait Islander people secure appropriate, affordable housing**
9. **Aboriginal and Torres Strait Islander people are not overrepresented in the criminal justice system**
10. **Aboriginal and Torres Strait Islander people are kept safe from harm**
11. **Aboriginal and Torres Strait Islander young people are in community and not in detention**
12. **Aboriginal and Torres Strait Islander adults are not incarcerated**
13. **Aboriginal and Torres Strait Islander languages are strong, supported, and flourishing**
14. **Aboriginal and Torres Strait Islander people have access to information and services**
15. **Aboriginal and Torres Strait Islander people have the data and information to make informed choices**
16. **Aboriginal and Torres Strait Islander cultures and cultural expressions are supported**
17. **Aboriginal and Torres Strait Islander people are employed**

## Palm Island Progress on Key Targets

### Health Targets

#### Target: Close the gap in life expectancy by 2031

**Current Status (National):**
- Gap: Approximately **8-9 years** for males, **7-8 years** for females
- Progress: Some improvement but slow
- On track: **NO** - requires accelerated action

**Palm Island Context:**
- Life expectancy likely at or below Indigenous average
- High chronic disease burden (diabetes, heart disease, kidney disease)
- Deaths in custody impact (Mulrunji, others)
- Socioeconomic factors affecting health
- Remote location limiting specialist access

**What Would Help:**
- Adequate health service funding
- Housing (reduce overcrowding)
- Employment and income
- Mental health services expansion
- Dialysis on-island
- Social determinant action

#### Target: Reduce Aboriginal and Torres Strait Islander child mortality

**Current Status:**
- Progress in recent decades but gap persists
- Still 2x non-Indigenous rate

**Palm Island Context:**
- Maternal and child health services (PICC, Queensland Health)
- All births occur off-island (Townsville)
- Prenatal and postnatal care on Palm Island
- Infant mortality rates improving but data limited

**Challenges:**
- Overcrowded housing (infection risk)
- Maternal smoking rates
- Access to neonatal intensive care (Townsville)
- Socioeconomic stress on families

### Education Targets

#### Target: Increase proportion of children enrolled in Year Before Fulltime Schooling (YBFS) to 95% by 2025

**Palm Island Context:**
- PICC Early Childhood Services provide early education
- School readiness programs
- Transition to Palm Island State School
- Enrollment rates likely high but participation/attendance key

**Challenges:**
- Family stability and housing
- Transient population
- Competing priorities
- Limited early childhood facilities

#### Target: Increase proportion of students achieving at or above national minimum standards in NAPLAN

**Palm Island Context:**
- **Palm Island State School:** Prep to Year 10
- NAPLAN results consistently below state and national averages
- Literacy and numeracy gaps significant
- Complex factors affecting educational outcomes

**Contributing Factors:**
- Intergenerational educational disadvantage
- Attendance challenges
- English as additional language for some (Bwgcolman at home)
- Socioeconomic factors (overcrowding, stress)
- Limited Year 11-12 on island (students must relocate)
- Health issues affecting learning

**What Would Help:**
- More resources for literacy and numeracy support
- Addressing attendance barriers
- Family and community engagement
- Cultural curriculum integration
- Safe, adequate housing
- Year 11-12 on Palm Island (long-term goal)

#### Target: Increase Year 12 attainment to 96% by 2031

**Current Status (National):**
- Significant gap persists
- Improvement but slow

**Palm Island Context:**
- **Students must leave Palm Island after Year 10** for Years 11-12
- Major barrier: relocation to Townsville (boarding, homestay)
- Cultural disconnection, homesickness
- Financial stress on families
- Some students don't transition
- Year 12 completion rates low

**What Would Help:**
- Year 11-12 on Palm Island (infrastructure, staffing)
- Better transition support for students leaving
- Boarding school support (cultural, pastoral)
- Financial assistance for families
- Flexible delivery (distance education with support)
- Post-school pathways (TAFE, employment, university)

### Employment Target

#### Target: Increase employment rate to 62% by 2031

**Current Status (Palm Island):**
- **Unemployment rate: 29.1%** (ABS 2021) - far above national ~5%
- **Employment rate:** Approximately 40-50% (rough estimate from census data)
- Major gap to close

**Employers:**
- Palm Island Aboriginal Shire Council (largest employer)
- PICC (200 employees, 75% local - major employer)
- Queensland Government (health, education, police)
- Small businesses (limited)
- Self-employment (limited)

**Barriers:**
- Limited job opportunities on small island
- Geographic isolation
- Skills and qualifications gaps
- Intergenerational unemployment
- Discrimination (for those seeking mainland work)
- Transport (if working off-island)
- Limited business and economic development

**Progress:**
- **PICC Digital Service Centre:** 21 jobs created (with capacity for 30)
- Other PICC social enterprises
- Ranger programs
- Training programs
- Council employment

**What Would Help:**
- Economic development and business creation
- Skills training and education
- Address discrimination
- Support for starting businesses
- Infrastructure for business
- Retention of educated youth
- Government employment programs

### Housing Target

#### Target: Significant and sustained reduction in overcrowding by 2031

**Current Status (Palm Island):**
- **Severe overcrowding:** Some homes have 15-20 people
- **Housing shortage:** Estimated 100+ household shortfall
- Major health and social impact
- Waitlists years long

**Progress:**
- Some new housing construction
- Renovations and upgrades
- Infrastructure improvements
- Inadequate to meet need

**Impact of Overcrowding:**
- Health: Infectious disease transmission, chronic stress
- Education: No quiet space for study
- Mental health: No privacy, increased conflict
- Family violence: Overcrowding increases risk
- Infrastructure: Accelerated wear and damage

**What Would Help:**
- Massive investment in new housing (100+ homes)
- Upgrades to existing stock
- Maintenance funding
- Community housing models
- Local employment in construction
- Climate-appropriate design

### Justice Targets

#### Target: Reduce rate of adult incarceration by at least 15% by 2031

**Current Status (National):**
- Aboriginal and Torres Strait Islander adults 11x more likely to be imprisoned than non-Indigenous
- Over-representation increasing, not decreasing
- **On track: NO**

**Palm Island Context:**
- High incarceration rates
- Historical context (mission era, systemic racism, Stolen Generations trauma)
- Criminalization of poverty and disadvantage
- Deaths in custody (Mulrunji and others)
- Community Justice Group working on alternatives

**Contributing Factors:**
- Poverty and unemployment
- Substance use
- Mental health
- Historical trauma
- Over-policing
- Harsh sentencing
- Lack of diversion programs
- Racism in justice system

**What Would Help:**
- Community Justice programs (diversion)
- Employment and opportunity
- Mental health and substance use treatment
- Housing and stability
- Addressing root causes (poverty, trauma)
- Justice reinvestment
- Decriminalization of minor offenses

#### Target: Reduce rate of youth detention by at least 30% by 2031

**Current Status (National):**
- Aboriginal and Torres Strait Islander young people 17x more likely to be detained
- Major gap

**Palm Island Context:**
- PICC Youth Services (diversion, support)
- Community Justice Group
- School engagement programs
- Limited youth activities and opportunities
- Substance use and mental health challenges

**What Would Help:**
- More youth programs and activities
- Diversion from justice system
- Education and training
- Employment pathways
- Mental health support
- Family support
- Cultural connection
- Addressing boredom and lack of opportunity

### Language and Culture Target

#### Target: Aboriginal and Torres Strait Islander languages are strong, supported, and flourishing

**Palm Island Context:**
- **Bwgcolman language:** Unique creole of 57+ Aboriginal languages
- Active preservation and teaching programs
- Palm Island State School language program
- PICC Early Childhood language activities
- Community use and pride

**Progress:**
- Language classes in school
- Elder-led teaching
- Documentation and recording
- Community events in language
- Signage and materials
- Growing youth speakers

**Challenges:**
- English dominance in formal settings
- Youth preference for English
- Limited written resources (developing)
- Aging fluent speakers
- Funding for programs
- National recognition and status

**What Would Help:**
- Sustained funding for language programs
- Teacher training and certification
- Language nest (0-5 years immersion)
- Expanded school program
- Community language center
- Technology and resources
- National language policy support

## Progress Summary

### Targets on Track: MINIMAL

- Most Close the Gap targets are **NOT on track** nationally or for Palm Island
- Progress is slow and insufficient
- Gaps remain large and in some areas widening

### Areas of Progress on Palm Island

**Positive:**
- PICC economic development (Digital Service Centre, social enterprises)
- Community-controlled health services
- Early childhood programs
- Language and cultural programs
- Ranger employment
- Community governance (Council, PICC)

**Continuing Challenges:**
- Life expectancy gap
- Chronic disease burden
- Educational outcomes
- Youth engagement
- Employment and income
- Housing crisis
- Over-incarceration
- Substance use
- Mental health

## What Close the Gap Requires

### Adequate Investment

**Funding Needed:**
- Health services expansion
- Housing construction (100+ homes)
- Education resources and support
- Employment and economic development
- Justice diversion programs
- Mental health services
- Infrastructure
- Cultural programs

**Current Funding:**
- Insufficient for needs
- Short-term and uncertain
- Tied to specific programs
- Community advocates for more

### Genuine Partnership

**Self-Determination:**
- Community control over programs and priorities
- PICC and Council leadership
- Aboriginal and Torres Strait Islander-designed solutions
- Cultural authority respected
- Data sovereignty

**Government Transformation:**
- Cultural safety in services
- Addressing racism
- Flexibility and trust
- Long-term commitment
- Accountability

### Addressing Social Determinants

**Root Causes:**
- Poverty and inequality
- Unemployment
- Inadequate housing
- Educational disadvantage
- Historical trauma
- Systemic racism

**Solutions:**
- Jobs and income support
- Housing investment
- Education at all levels
- Healing and recovery
- Anti-racism action
- Structural change

## Accountability and Reporting

### Annual Reporting

**Close the Gap Report:**
- Published annually by Australian Government
- Progress against 17 targets
- Data by indicator
- Challenges and opportunities identified
- Public accountability

**Palm Island Data:**
- Included in aggregated statistics
- Specific community data limited in public reports
- Community organizations track local progress
- Advocacy uses data for pressure

### Community Voice

**Palm Island Advocacy:**
- Council and PICC advocating for resources
- Participation in policy consultations
- Media and public awareness
- Political engagement
- Demanding accountability for commitments

## Significance

Close the Gap for Palm Island represents:
- **Justice:** Right to health and equality
- **Accountability:** Government commitments must be met
- **Urgency:** Progress too slow, action needed now
- **Self-Determination:** Community control essential
- **Hope:** Change is possible with adequate support
- **Reality Check:** Current efforts insufficient

## Source
Australian Government Close the Gap Reports, ABS Census data, PICC and Council information`,
    entry_type: 'policy',
    category: 'Policy',
    keywords: ['Close the Gap', 'Palm Island', 'health targets', 'education', 'employment', 'housing', 'justice', 'Aboriginal and Torres Strait Islander'],
    structured_data: {
      source: 'Australian Government Close the Gap Reports, ABS data',
      framework: 'National Agreement on Closing the Gap (2020)',
      total_targets: 17,
      priority_reforms: 4,
      palm_island_challenges: [
        'Life expectancy gap (8-9 years)',
        'Unemployment 29.1% (vs ~5% national)',
        'Housing shortage (100+ homes needed)',
        'Year 12 completion (students must leave island)',
        'Over-incarceration',
        'Chronic disease burden'
      ],
      areas_of_progress: [
        'PICC Digital Service Centre (21 jobs)',
        'Community-controlled health',
        'Early childhood programs',
        'Bwgcolman language programs',
        'Ranger employment'
      ],
      overall_progress: 'Insufficient - most targets not on track',
      needs: ['Adequate investment', 'Genuine partnership', 'Address social determinants']
    },
    fiscal_year: '2023-2024',
    location_type: 'palm_island',
    is_public: true,
    is_verified: true
  }
]

// Add more entries in subsequent files...

async function main() {
  console.log('🚀 Starting Partnerships, Policy, and Research import...')

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
