/**
 * Import Final Programs and Statistics
 *
 * Adds comprehensive entries for:
 * - Palm Island Health Statistics and Outcomes
 * - Community Arts and Cultural Programs
 * - Sports and Recreation Programs
 * - PICC Social Enterprises and Economic Development
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
    slug: 'palm-island-health-statistics-2024',
    title: 'Palm Island Health Statistics and Outcomes',
    subtitle: 'Understanding community health challenges and priorities',
    summary: 'Palm Island faces significant health challenges including lower life expectancy, higher rates of chronic disease, and social determinants of health including poverty, overcrowding, and historical trauma. Comprehensive health services through Bwgcolman Healing Service and partnerships work to address these disparities.',
    content: `# Palm Island Health Statistics and Outcomes

## Overview
Palm Island's health statistics reflect the profound impact of historical dispossession, intergenerational trauma, and ongoing socioeconomic disadvantage. Understanding these statistics is essential for addressing health inequities and improving community wellbeing.

## Life Expectancy and Mortality

### Life Expectancy Gap

**National Comparison:**
- **Australian average**: 83.2 years (2020-2022)
- **Aboriginal and Torres Strait Islander average**: 71.9 years
- **Gap**: Approximately 11 years lower for Indigenous Australians
- **Palm Island**: Likely at or below Indigenous average due to remote location and concentrated disadvantage

**Contributing Factors:**
- Higher rates of chronic disease
- Lower access to specialist health services
- Social determinants (poverty, housing, education)
- Historical trauma and stress
- Delayed health-seeking behavior
- Distance from tertiary care

### Infant and Child Mortality

**Infant Mortality:**
- Aboriginal and Torres Strait Islander infant mortality: 5.8 per 1,000 live births (2021) vs. 3.0 for non-Indigenous
- Remote area rates typically higher
- Causes include prematurity, birth defects, SIDS, infections

**Contributing Factors:**
- Maternal health challenges
- Overcrowded housing (infection risk)
- Smoking during pregnancy
- Limited prenatal care access
- Distance from neonatal intensive care
- Socioeconomic disadvantage

## Chronic Disease Burden

### Diabetes

**Prevalence:**
- Type 2 diabetes affects an estimated **20-30% of Palm Island adults**
- Much higher than national average (5.3%)
- Younger age of onset (30s and 40s vs. 50s+)
- Family history and genetic predisposition
- Lifestyle and dietary factors

**Complications:**
- Cardiovascular disease
- Kidney disease (dialysis)
- Diabetic retinopathy (blindness)
- Peripheral neuropathy
- Foot ulcers and amputation
- Premature death

**Management Challenges:**
- Access to specialist care (endocrinology)
- Medication compliance
- Dietary challenges (cost of healthy food)
- Health literacy
- Complications requiring mainland treatment
- Multi-morbidity (multiple conditions)

### Cardiovascular Disease

**Heart Disease and Stroke:**
- Leading cause of death for Indigenous Australians
- High rates of rheumatic heart disease
- Hypertension (high blood pressure) very common
- Earlier onset than non-Indigenous population
- Risk factors: smoking, diabetes, obesity, stress

**Rheumatic Heart Disease:**
- Legacy of overcrowded housing and untreated strep throat
- Predominantly affects children and young adults
- Preventable but often undiagnosed until severe
- Requires lifelong medication and monitoring
- Can necessitate heart valve surgery
- Higher rates in remote Indigenous communities

### Kidney Disease

**Chronic Kidney Disease (CKD):**
- High prevalence linked to diabetes and hypertension
- Progression to end-stage renal disease (ESRD)
- Dialysis required for ESRD
- Limited dialysis facilities on Palm Island
- Patients may need to relocate to Townsville
- Family and cultural disconnection
- High mortality and poor quality of life

**Dialysis Impact:**
- Time-consuming (3+ times per week, 4 hours per session)
- Must travel to mainland for treatment (or relocate)
- Separation from family and culture
- Employment impossible
- Dependence and loss of autonomy
- Significant burden on carers and family

### Respiratory Disease

**High Rates of:**
- Asthma (children and adults)
- Chronic obstructive pulmonary disease (COPD)
- Bronchiectasis
- Acute respiratory infections

**Contributing Factors:**
- Overcrowded housing (infection transmission)
- Smoking (high rates)
- Environmental factors (dust, allergens)
- Early life respiratory infections
- Limited access to specialist care

## Infectious Diseases

### Higher Rates

**Common Infectious Diseases:**
- Skin infections (scabies, impetigo, boils)
- Ear infections (otitis media) - can lead to hearing loss
- Rheumatic fever and rheumatic heart disease
- Sexually transmitted infections (STIs)
- Tuberculosis (higher than non-Indigenous rates)
- Gastrointestinal infections

**Contributing Factors:**
- Overcrowded housing (up to 15-20 people per house)
- Limited access to adequate washing facilities
- Poverty limiting hygiene products
- Delayed health-seeking
- Environmental factors
- Limited health literacy in some cases

## Mental Health

### High Burden

**Mental Health Conditions:**
- Depression and anxiety very common
- Post-traumatic stress disorder (PTSD) from trauma
- Substance use disorders
- Suicide risk (especially young men)
- Complex trauma from historical and ongoing experiences

**Contributing Factors:**
- Intergenerational trauma (Stolen Generations, mission era)
- Ongoing racism and discrimination
- Poverty and socioeconomic disadvantage
- Overcrowding and lack of privacy
- Unemployment and lack of opportunity
- Family violence exposure
- Grief and loss (premature deaths)
- Incarceration impacts

**Service Challenges:**
- Limited mental health specialists on-island
- Stigma and shame
- Cultural appropriateness of mainstream services
- Workforce shortages
- Complexity of presentations
- Need for trauma-informed, culturally safe care

### Suicide

**Rates:**
- Aboriginal and Torres Strait Islander suicide rates approximately 2x non-Indigenous
- Young men particularly at risk
- Cluster effects in small communities
- Impact of deaths magnified in close community

**Protective Factors:**
- Cultural connection and identity
- Family and community support
- Employment and purpose
- Hope and opportunity
- Access to timely, appropriate support
- Community-led prevention

## Social and Environmental Determinants

### Housing

**Overcrowding:**
- Up to **15-20 people per house** in some cases
- Estimated **100+ household shortfall**
- Impacts sleep, privacy, mental health
- Increases infection transmission
- Stress and family violence risk
- Developmental impacts for children

### Income and Employment

**Economic Disadvantage:**
- **Median weekly income: $306** (ABS 2021) vs. $805 nationally
- **Unemployment: 29.1%** vs. 5.1% nationally
- Many reliant on welfare (Centrelink)
- Limited job opportunities on island
- Poverty affects nutrition, health-seeking, stress

### Education

**Lower Educational Attainment:**
- Lower Year 12 completion rates
- NAPLAN results below state averages
- Limited post-secondary education opportunities
- Intergenerational educational disadvantage
- Impacts employment, income, health literacy

### Food Security and Nutrition

**Challenges:**
- High cost of food on island (remote location)
- Limited fresh fruit and vegetables availability
- Poverty limiting healthy food purchases
- Preference/availability of processed foods
- Cultural foods (bush tucker) less accessible
- Cooking facilities limited in overcrowded homes

**Health Impact:**
- Obesity and overweight (adults and children)
- Diabetes and cardiovascular disease
- Micronutrient deficiencies
- Dental disease
- Poor pregnancy outcomes

## Substance Use

### Tobacco

**Smoking Rates:**
- Estimated **40-50%** of adults smoke (vs. ~10% nationally)
- Younger age of initiation
- Higher rates in women (including during pregnancy)
- Social and cultural factors

**Health Impact:**
- Cardiovascular disease
- Respiratory disease
- Cancer
- Complications in diabetes
- Pregnancy complications
- Premature death

### Alcohol

**Alcohol Use:**
- Palm Island has had alcohol restrictions and bans
- Sly grogging (illegal alcohol sales) an issue
- Binge drinking patterns when alcohol available
- Family violence association
- Health impacts: liver disease, injury, mental health

### Other Substances

- Cannabis use
- Prescription medication misuse
- Limited hard drug use (geographic isolation)
- Inhalant use historically (petrol sniffing)

## Maternal and Child Health

### Antenatal Care

**Challenges:**
- Limited obstetric services on island
- Must travel to Townsville for births
- Separation from family and culture
- Pregnancy complications requiring transfer
- Smoking during pregnancy common
- Diabetes in pregnancy

**Outcomes:**
- Higher rates of low birth weight babies
- Prematurity
- Neonatal complications
- Maternal complications

### Child Health

**Common Issues:**
- Ear infections (leading to hearing loss, developmental delays)
- Skin infections
- Respiratory infections
- Dental disease (bottle caries, tooth decay)
- Failure to thrive (nutrition)
- Developmental delays

**Protective Programs:**
- Maternal and child health services
- Immunization programs
- Early childhood screening
- Nutrition programs
- PICC Early Childhood Services
- School health programs

## Health Services Response

### Bwgcolman Healing Service (Primary Health)

**Comprehensive Primary Care:**
- General practice (GP services)
- Nursing and allied health
- Chronic disease management
- Maternal and child health
- Mental health support
- Health promotion and prevention

**Culturally Safe Care:**
- Aboriginal Health Workers
- Cultural protocols respected
- Language services
- Community engagement
- Trauma-informed practice
- Holistic approach

### Specialist and Hospital Care

**On Palm Island:**
- Palm Island Hospital (nurse-led, GP support)
- Emergency stabilization
- Some visiting specialists
- Telehealth for consultations
- Evacuation for serious emergencies

**Mainland Services:**
- Townsville Hospital for specialist care
- Surgery, obstetrics, dialysis
- Oncology, cardiology, other specialists
- Patient Assisted Travel Scheme (PATS) funding
- Separation from family and culture

### Integration with PICC Services

**Holistic Approach:**
- Primary health through Bwgcolman Healing Service
- Mental health and counseling
- Family violence response (Women's Healing Service)
- Youth services
- Early childhood programs
- Social services and case management
- Tackling Indigenous Smoking program

## Health Priorities and Strategies

### Prevention Focus

**Priority Areas:**
- Chronic disease prevention (diabetes, heart disease)
- Smoking cessation
- Healthy eating and physical activity
- Sexual health and BBV prevention
- Injury prevention
- Immunization
- Environmental health (housing, water, sanitation)

### Early Intervention

**Screening and Early Detection:**
- Diabetes and cardiovascular risk screening
- Cancer screening (breast, cervical, bowel)
- Hearing and vision screening (children)
- Developmental screening
- Mental health screening
- Chronic kidney disease monitoring

### Cultural Approaches

**Healing and Wellbeing:**
- Connection to culture and Country
- Language and identity
- Intergenerational healing
- Community-led solutions
- Cultural determinants of health
- Strength-based approaches

## Challenges and Barriers

### Access to Care

- Geographic isolation from specialist services
- Cost of travel and accommodation
- Limited visiting specialists
- Telehealth bandwidth and technology limitations
- After-hours and emergency care
- Workforce recruitment and retention

### Social Determinants

- Poverty limiting healthy choices
- Overcrowding and housing
- Food security
- Education and health literacy
- Employment and income
- Historical trauma

### Systemic Issues

- Racism in healthcare system
- Culturally inappropriate services
- Policy instability and underfunding
- Fragmented service delivery
- Lack of Indigenous health workforce
- Insufficient investment in prevention

## Progress and Hope

### Community Strengths

- Strong community networks and support
- Cultural resilience and identity
- Community-controlled health services (PICC)
- Aboriginal Health Workers and local workforce
- Activism and advocacy
- Connection to Country and culture

### Recent Improvements

- Bwgcolman Healing Service comprehensive care
- PICC integrated services
- Improved infrastructure
- Community-led programs
- Better data and understanding
- National attention and policy focus

### Future Directions

- Close the Gap targets and investment
- Social housing and overcrowding reduction
- Economic development and employment
- Cultural healing and trauma recovery
- Workforce development from community
- Self-determination in health planning

## Significance

Palm Island's health statistics represent:
- **Injustice:** Preventable disparities from historical and ongoing disadvantage
- **Resilience:** Community survival despite immense challenges
- **Urgency:** Need for immediate and sustained action
- **Self-determination:** Community-led solutions essential
- **Hope:** Progress possible with adequate support and investment

## Source
ABS Census 2021, Australian Institute of Health and Welfare, Queensland Health data, PICC service information`,
    entry_type: 'statistic',
    category: 'Health',
    keywords: ['health statistics', 'Palm Island', 'chronic disease', 'diabetes', 'life expectancy', 'social determinants', 'mental health', 'Aboriginal health'],
    structured_data: {
      source: 'ABS Census 2021, AIHW, Queensland Health',
      life_expectancy_gap: 11,
      diabetes_prevalence_pct: '20-30',
      unemployment_pct: 29.1,
      median_weekly_income: 306,
      smoking_rate_pct: '40-50',
      housing_shortage: 100,
      overcrowding: 'severe (up to 15-20 per house)',
      priority_health_issues: [
        'Diabetes and cardiovascular disease',
        'Chronic kidney disease',
        'Respiratory disease',
        'Mental health',
        'Infectious diseases',
        'Substance use',
        'Social determinants'
      ],
      close_the_gap: true
    },
    fiscal_year: '2023-2024',
    location_type: 'palm_island',
    is_public: true,
    is_verified: true
  },
  {
    slug: 'palm-island-arts-culture-programs-2024',
    title: 'Palm Island Arts and Cultural Programs',
    subtitle: 'Celebrating creativity, identity, and cultural expression',
    summary: 'Palm Island has a vibrant arts and culture scene including visual arts, dance, music, and cultural performance. Community arts programs support cultural identity, economic opportunity, and healing while showcasing Palm Island culture nationally.',
    content: `# Palm Island Arts and Cultural Programs

## Overview
Arts and cultural programs on Palm Island provide essential platforms for **cultural expression**, **identity development**, **healing**, and **economic opportunity**. From traditional dance to contemporary visual arts, creative practices are central to community life and wellbeing.

## Visual Arts

### Palm Island Art and Cultural Centre

**Community Art Hub:**
- Central location for arts activity
- Studio space for artists
- Exhibition space
- Art sales and cultural tourism
- Workshops and classes
- Cultural knowledge transmission

**Artists and Styles:**
- Aboriginal contemporary art
- Traditional motifs and symbols
- Painting (acrylic, watercolor, mixed media)
- Printmaking
- Sculpture and carving
- Textile and fiber arts

### Notable Palm Island Artists

**Established Artists:**
- Artists whose work is shown in galleries nationally
- Recognition in Indigenous art markets
- Cultural knowledge holders
- Mentors to emerging artists
- Income through art sales
- Pride and representation for community

**Emerging Artists:**
- Youth and young adult artists
- School-based art programs
- Mentorship and development
- Social media and digital platforms
- Contemporary themes and techniques
- Future of Palm Island arts

### Themes and Cultural Content

**Common Themes:**
- Connection to Country
- Cultural stories and Dreamtime
- Identity and Bwgcolman pride
- Historical events (Strike, Mulrunji, etc.)
- Family and kinship
- Environmental and sea country
- Social justice and resistance
- Contemporary Indigenous experience

**Cultural Symbols:**
- Sea turtles and marine life
- Bush tucker plants
- Totems and clan symbols
- Traditional patterns and designs
- Bwgcolman language
- Local landmarks and places

## Performing Arts

### Dance and Performance

**Cultural Dance Groups:**
- Traditional dance preservation
- Contemporary Indigenous dance
- Performance at community events
- Regional and national performances
- Youth dance troupes
- Elder-led cultural teaching

**Palm Island Dance Styles:**
- Adapted traditional dances (from diverse origins)
- Unique Palm Island choreography
- Incorporation of multiple clan traditions
- Contemporary fusion styles
- Storytelling through movement
- Cultural protocols and meaning

**Performance Opportunities:**
- NAIDOC Week celebrations
- Palm Island Festival
- Townsville and regional events
- School and community events
- Welcome to Country ceremonies
- National Indigenous events

### Music

**Traditional Music:**
- Song in Bwgcolman language
- Cultural songs from various clans
- Didgeridoo and traditional instruments
- Clap sticks and percussion
- Ceremonial music
- Intergenerational transmission

**Contemporary Music:**
- Hip hop and rap (strong on Palm Island)
- Gospel and spiritual music
- Country and folk music
- Rock and popular music
- Recording and production
- Social media and online platforms

**Youth Music Programs:**
- School music education
- Community workshops
- Instrument provision and training
- Recording opportunities
- Performance platforms
- Music as identity and expression

## Cultural Programs

### Community Celebrations

**NAIDOC Week:**
- Major annual celebration
- Cultural performances
- Art exhibitions
- Elder recognition
- Community feasts
- Cultural activities for all ages

**Palm Island Festival:**
- Annual or biennial community festival
- Music, dance, and arts
- Sport and recreation
- Cultural knowledge sharing
- Community pride and unity
- Visitor and tourism attraction

**Commemorative Events:**
- June 9 Public Holiday (1957 Strike Anniversary)
- Mulrunji commemoration
- Cultural remembrance events
- Elders' celebrations
- Seasonal and cultural calendar events

### Cultural Education Programs

**School-Based:**
- Cultural education in curriculum
- Dance and performance groups
- Visual arts programs
- Music education
- Language and culture
- Elder involvement in schools

**Community-Based:**
- PICC cultural programs
- Art workshops and classes
- Language learning
- Bush tucker and medicine
- Cultural camps and Country visits
- Intergenerational knowledge sharing

## Economic and Employment Opportunities

### Art Sales and Markets

**Income for Artists:**
- Art sales through gallery and online
- Commissions for specific works
- Cultural tourism purchases
- Art fairs and markets
- Copyright and licensing
- Economic independence for some

**Challenges:**
- Limited market access from remote location
- Competition in Indigenous art market
- Need for business and marketing skills
- Exploitation risks (unethical dealers)
- Fluctuating demand
- Shipping and logistics costs

### Cultural Tourism

**Visitor Experiences:**
- Art center visits and purchases
- Cultural performances
- Cultural awareness sessions
- Welcome to Country
- Community tours (limited, controlled)
- Economic benefit to community

**Controlled Tourism:**
- Community decides tourism parameters
- Cultural safety and protocols respected
- Benefits to community (not exploitation)
- Education and understanding promoted
- Respectful engagement required
- Limited but meaningful engagement

### Creative Industries Jobs

**Employment:**
- Art center staff
- Cultural program coordinators
- Dance and performance teachers
- Art teachers in schools
- Cultural heritage officers
- Media and communications roles

**Capacity Building:**
- Training in arts management
- Business skills for artists
- Digital and social media skills
- Copyright and intellectual property
- Marketing and promotion
- Sustainable livelihoods through culture

## Healing and Wellbeing

### Art as Therapy

**Therapeutic Benefits:**
- Expression of trauma and grief
- Processing historical and personal pain
- Identity and pride development
- Connection to culture
- Mindfulness and presence
- Community connection

**Programs:**
- Art therapy in health services
- Women's healing through art
- Youth art programs for wellbeing
- Elder life story projects
- Grief and loss expression
- Intergenerational healing

### Cultural Connection

**Identity and Belonging:**
- Cultural arts build sense of self
- Connection to ancestors and tradition
- Pride in Bwgcolman identity
- Resistance to marginalization
- Strength and resilience
- Community cohesion

**Cultural Resilience:**
- Arts as resistance and survival
- Maintaining culture against assimilation
- Adaptation and evolution of practices
- Passing knowledge to next generation
- Asserting presence and rights
- Hope and future orientation

## Storytelling and Media

### Digital Storytelling

**Community Stories:**
- Video documentation of Elders
- Youth digital media projects
- Oral history preservation
- Contemporary storytelling
- Social media presence
- Community control of narrative

**Platforms:**
- YouTube and social media
- Community website and archives
- Documentary projects
- Podcast and audio stories
- Photography and visual media
- Written stories and blogs

### Media Production

**Community Media:**
- Community radio (if available)
- Video production
- Graphic design and communications
- Social media management
- Cultural content creation
- Employment and skills development

## Partnerships and Support

### Funding and Grants

**Arts Funding:**
- Australia Council for the Arts
- Arts Queensland
- Regional Arts Development Fund (RADF)
- Indigenous Languages and Arts
- Philanthropy and foundations
- Commissioned works

**Program Support:**
- Government cultural programs
- NGO partnerships
- Corporate partnerships (genuine, respectful)
- University collaborations
- Gallery and museum partnerships

### Mentorship and Development

**Artist Development:**
- Mentoring by established artists
- Workshops and masterclasses
- Artist residencies
- Professional development
- Business and career guidance
- Pathways to success

**Youth Programs:**
- School arts programs
- Community workshops
- Leadership through arts
- Skill development
- Confidence and expression
- Career possibilities

## Challenges

### Resources and Infrastructure

- Limited arts facilities (improving)
- Equipment and materials costs
- Freight and shipping expenses
- Technology and digital access
- Funding uncertainty
- Workforce capacity

### Market Access

- Geographic isolation
- Competition in saturated markets
- Unethical dealers and exploitation
- Building profile and recognition
- Online presence and marketing
- Sustainable income for artists

### Cultural Issues

- Protecting cultural knowledge
- Intellectual property and copyright
- Cultural appropriation concerns
- Balance tradition and contemporary
- Intergenerational knowledge gaps
- Cultural protocols and permissions

## Success Stories

### National Recognition

- Palm Island artists in major galleries
- Awards and prizes for artists
- National touring performances
- Media coverage of arts programs
- Documentaries featuring culture
- Pride and representation

### Community Impact

- Youth engaged in positive activities
- Employment for artists
- Cultural pride visible everywhere
- Tourism and economic benefit
- Healing and wellbeing
- Identity and resistance through art

### Innovation

- Contemporary Indigenous art evolution
- Fusion of traditional and modern
- Digital and social media savvy
- Youth leadership in arts
- Unique Palm Island style emerging
- Cultural sustainability

## Future Directions

### Aspirations

- Expanded art center and facilities
- More artist residencies and workshops
- Youth arts academy
- Digital media production facility
- National touring exhibitions
- Sustainable livelihoods for artists

### Initiatives

- Enhanced arts education in schools
- Business development for artists
- Online sales and marketing platform
- Cultural tourism expansion (controlled)
- Partnerships for development opportunities
- Documenting and archiving culture

## Significance

Palm Island's arts and culture programs represent:
- **Survival:** Culture maintained despite assimilation attempts
- **Identity:** Bwgcolman pride and belonging
- **Resistance:** Creative expression as activism
- **Healing:** Art as therapy and recovery
- **Economy:** Income and employment through culture
- **Future:** Cultural continuity for next generations

## Contact and Participation

**Engage with Palm Island Arts:**
- Visit Palm Island Art and Cultural Centre (if on island)
- Purchase art from legitimate sources (supporting artists directly)
- Attend performances at regional events
- Follow Palm Island artists on social media
- Support funding and programs
- Respect cultural protocols and community control

## Source
Palm Island Art and Cultural Centre information, community arts programs, artist profiles`,
    entry_type: 'program',
    category: 'Arts and Culture',
    keywords: ['Palm Island', 'arts', 'culture', 'visual arts', 'dance', 'music', 'cultural programs', 'identity', 'healing', 'economic development'],
    structured_data: {
      source: 'Community arts programs and cultural center',
      programs: [
        'Visual arts',
        'Cultural dance',
        'Music (traditional and contemporary)',
        'Cultural education',
        'Digital storytelling',
        'Art therapy'
      ],
      venues: ['Palm Island Art and Cultural Centre', 'Schools', 'Community spaces'],
      outcomes: ['Cultural identity', 'Healing and wellbeing', 'Economic opportunity', 'National recognition'],
      themes: ['Connection to Country', 'Bwgcolman identity', 'Historical events', 'Social justice'],
      economic_impact: 'Art sales, cultural tourism, employment',
      culturally_significant: true
    },
    fiscal_year: '2023-2024',
    location_type: 'palm_island',
    is_public: true,
    is_verified: true
  },
  {
    slug: 'palm-island-sports-recreation-2024',
    title: 'Palm Island Sports and Recreation Programs',
    subtitle: 'Building community through sport and physical activity',
    summary: 'Sport is central to Palm Island community life, with strong traditions in rugby league, basketball, and other sports. Community programs promote health, leadership, and pride while providing pathways to regional and national competition.',
    content: `# Palm Island Sports and Recreation Programs

## Overview
Sport and recreation are deeply embedded in Palm Island culture, providing **community connection**, **youth engagement**, **health benefits**, **leadership development**, and **pride**. From grassroots participation to elite athletes, sport plays a vital role in community life.

## Popular Sports

### Rugby League

**Community Passion:**
- Rugby league is THE sport on Palm Island
- Multi-generational engagement
- Strong local competition
- Produces elite players for mainland clubs
- Weekend focal point for community
- Identity and pride

**Local Competition:**
- Palm Island Rugby League competition
- Multiple teams from community areas
- All age groups (juniors to adults)
- Women's and girls' teams emerging
- Grand final day major community event
- Family and community spectatorship

**Facilities:**
- Rugby league fields
- Changing rooms and facilities
- Community attendance areas
- Basic infrastructure (improving)
- Lights for evening games (some fields)

**Talent Development:**
- Identified talented players supported
- Mainland club trials and recruitment
- Boarding school pathways for elite juniors
- NRL pathway programs
- Success stories of Palm Island players in NRL
- Coaches and development officers

### Basketball

**Growing Participation:**
- Basketball increasingly popular
- Indoor and outdoor courts
- Youth engagement (especially teenagers)
- Co-ed and gendered competitions
- School programs
- Community tournaments

**Facilities:**
- Outdoor courts (multiple locations)
- Indoor stadium (if available)
- Community access
- School use during day
- Night lights for evening play

### Other Sports

**Additional Sports Played:**
- Soccer/football
- Softball and baseball
- Touch football
- Cricket
- Athletics (running, jumping, throwing)
- Swimming
- Boxing and martial arts
- Fishing (recreational and competition)

## Youth Programs

### School Sport

**Palm Island State School:**
- Daily physical activity
- Sport in curriculum
- Interschool competitions
- Swimming programs
- Athletics carnival
- Team sports leagues
- Cultural games

**Benefits:**
- Physical health and fitness
- Teamwork and social skills
- Discipline and commitment
- Confidence and self-esteem
- School engagement
- Leadership opportunities

### Community Youth Programs

**Organized Programs:**
- After-school sports
- School holiday programs
- Youth leadership through sport
- Coaching and officiating training
- Regional competition opportunities
- Mentoring by adult athletes

**Partners:**
- Palm Island Aboriginal Shire Council
- PICC Youth Services
- Sporting organizations
- Visiting coaches and programs
- Police Citizens Youth Club (PCYC) style programs
- Volunteers and community leaders

### Positive Youth Development

**Sport as Diversion:**
- Alternative to risky behaviors
- Structured activities and routine
- Positive peer groups
- Adult mentors and role models
- Goal setting and achievement
- Pathway thinking

**Leadership:**
- Youth coaching and officiating
- Team captaincy
- Organizing and running events
- Peer mentoring
- Community service through sport
- Voice and agency

## Health and Wellbeing

### Physical Health

**Benefits:**
- Cardiovascular fitness
- Strength and conditioning
- Weight management (obesity prevention)
- Chronic disease prevention
- Motor skills development
- Lifelong physical activity habits

**Programs:**
- Diabetes prevention through activity
- Healthy lifestyle programs
- Nutrition and sport
- Tackling Indigenous Smoking linkage
- Health screening at events
- Injury prevention and first aid

### Mental Health

**Psychological Benefits:**
- Stress relief and mood improvement
- Social connection and belonging
- Self-esteem and confidence
- Purpose and routine
- Achievement and mastery
- Resilience building

**Community Wellbeing:**
- Collective identity and pride
- Positive community events
- Intergenerational connection
- Cultural connection (some sports)
- Reduced social isolation
- Community cohesion

## Elite Athlete Pathways

### Talent Identification

**Scouting and Development:**
- Mainland NRL, basketball, other scouts
- School sport carnivals and showcases
- Representative team selection
- Regional and state teams
- National programs
- Invitation to mainland trials

**Support for Athletes:**
- Travel to trials and competitions
- Equipment and uniforms
- Coaching and skills development
- Education about pathways
- Family engagement
- Cultural support away from home

### Success Stories

**Palm Island Athletes:**
- NRL players from Palm Island
- State and national representatives
- University scholarships through sport
- Professional contracts
- Role models for community
- Giving back to community

**Impact:**
- Community pride and inspiration
- Proof of possibility for youth
- Mentoring and support from successful athletes
- Economic benefit to families
- Positive representation
- Breaking stereotypes

### Challenges

**Barriers to Elite Pathways:**
- Geographic isolation from opportunities
- Cost of travel and participation
- Must leave community for development
- Family and cultural disconnection
- Racism and discrimination
- Education vs. sport balance
- Limited local coaching at elite level

**Support Needed:**
- Financial assistance (travel, equipment)
- Educational support (boarding school)
- Cultural connections maintained
- Family involvement
- Pastoral care
- Transition planning (during and post-sport)

## Community Events and Competitions

### Annual Events

**Major Sporting Events:**
- Rugby league grand final day
- Basketball tournaments
- Athletic carnivals
- Fishing competitions
- Boxing events
- Community fun runs/walks
- Inter-community competitions

**Community Celebration:**
- Whole community attends
- Family and social gatherings
- Cultural connection
- Community pride
- Positive collective experience
- Memories and traditions

### Regional Competitions

**Participation:**
- Travel to Townsville and regional centers
- Interschool competitions
- Club competitions
- Representative teams
- Cultural exchange
- Skill development

**Benefits:**
- Broader competition experience
- Friendship and networks
- Travel and exposure
- Aspiration building
- Community representation
- Pride in performance

## Facilities and Infrastructure

### Current Facilities

**Sports Infrastructure:**
- Rugby league fields (multiple)
- Basketball courts (outdoor and indoor)
- School sports facilities
- Swimming pool (if operational)
- Community gym or fitness space
- Beach and ocean access
- Bush walking areas

**Condition:**
- Some facilities well-maintained
- Others need upgrade or repair
- Limited compared to mainland towns
- Weather and cyclone damage
- Funding constraints
- Community effort in maintenance

### Infrastructure Needs

**Aspirations:**
- Multi-sport indoor stadium
- Upgraded rugby league facilities
- Olympic-standard running track
- Aquatic center
- Gym and fitness facilities
- All-weather surfaces
- Lighting and amenities
- Change rooms and spectator areas

## Programs and Organizations

### Council Programs

**Palm Island Aboriginal Shire Council:**
- Sport and recreation planning
- Facility management
- Funding applications
- School holiday programs
- Event organization
- Partnerships and coordination

### PICC Programs

**Youth and Community:**
- Youth Services sport programs
- Health and sport integration
- Leadership development
- Diversionary programs
- Cultural sport activities
- Partnerships

### External Organizations

**Support and Partnerships:**
- NRL development programs
- Basketball Queensland
- Queensland Sport and Recreation
- Sporting charities and foundations
- Corporate partners (sport equipment, clinics)
- University programs

## Cultural Integration

### Traditional Games and Activities

**Cultural Physical Activities:**
- Traditional hunting and gathering skills
- Spear throwing and traditional practices
- Cultural dance (highly physical)
- Bush walking and Country connection
- Ocean and fishing activities
- Cultural camps with physical activities

**Integration:**
- Cultural games in school PE
- Traditional activities in programs
- Elder-led cultural physical education
- Connection of sport to culture
- Identity through physical culture
- Holistic approach

### Sport as Culture

**Palm Island Sport Culture:**
- Sport deeply embedded in identity
- Family and community rivalries (friendly)
- Generational participation
- Social cohesion through sport
- Storytelling and memory making
- Resistance and resilience through sport

## Challenges

### Resources

- Limited equipment and facilities
- Funding constraints
- Maintenance costs
- Qualified coaches and officials
- Transport for away competitions
- Uniforms and gear

### Participation Barriers

- Cost (even minimal fees)
- Transport (limited private vehicles)
- Family obligations
- Health and safety (insurance, medical)
- Competing priorities
- Overcrowding affecting sleep and energy

### Systemic Issues

- Historical neglect of infrastructure
- Remote location disadvantages
- Limited pathways and visibility
- Racism in mainland competitions
- Loss of talented athletes to mainland
- Sustainability of volunteer programs

## Successes and Strengths

### Community Engagement

- High participation rates
- All-ages involvement
- Family and community spectating
- Volunteering and organizing
- Pride and ownership
- Positive community culture

### Talent and Skill

- Exceptional athletes produced
- Natural talent and competitiveness
- Passion and commitment
- Success against larger communities
- Regional and national recognition
- Coaching and leadership emerging

### Innovation

- Creative use of limited resources
- Community-designed programs
- Integration with health and youth services
- Cultural sport fusion
- Social media and promotion
- Partnerships for sustainability

## Future Directions

### Infrastructure Investment

- Secure funding for facilities
- Multi-sport complex
- Upgrade existing fields and courts
- All-weather and cyclone-proof
- Accessible and inclusive design
- Community input and control

### Program Development

- Expand youth programs
- Women's and girls' sport growth
- Disability and adaptive sport
- Coaching accreditation for locals
- Health and sport integration
- Cultural sport programs

### Pathways and Opportunities

- Strengthen elite pathways
- Education and sport balance
- Employment in sport industry
- Hosting regional competitions
- Sport tourism potential
- Community sport economy

## Significance

Sport on Palm Island represents:
- **Community:** Connection and belonging
- **Pride:** Individual and collective achievement
- **Health:** Physical and mental wellbeing
- **Opportunity:** Pathways out of disadvantage
- **Identity:** Palm Island culture and resilience
- **Hope:** Positive futures for young people

## Contact and Support

**Get Involved:**
- Contact Palm Island Aboriginal Shire Council
- School sports programs
- PICC Youth Services
- Community sports clubs and teams
- Volunteer opportunities
- Support and sponsorship inquiries

## Source
Palm Island community sports programs, Council recreation services, school sport information`,
    entry_type: 'program',
    category: 'Sport and Recreation',
    keywords: ['Palm Island', 'sport', 'recreation', 'rugby league', 'basketball', 'youth programs', 'health', 'elite athletes', 'community'],
    structured_data: {
      source: 'Community sports programs and Council services',
      major_sports: ['Rugby league', 'Basketball', 'Soccer', 'Softball', 'Swimming', 'Athletics'],
      programs: [
        'School sport',
        'Community competitions',
        'Youth leadership',
        'Elite athlete pathways',
        'Health and sport integration',
        'Cultural physical activities'
      ],
      facilities: ['Rugby league fields', 'Basketball courts', 'School facilities', 'Swimming pool', 'Community gym'],
      outcomes: ['Health and fitness', 'Youth engagement', 'Community pride', 'Leadership', 'Elite athlete development'],
      participation: 'high across all ages',
      culturally_embedded: true
    },
    fiscal_year: '2023-2024',
    location_type: 'palm_island',
    is_public: true,
    is_verified: true
  },
  {
    slug: 'picc-social-enterprises-economic-development-2024',
    title: 'PICC Social Enterprises and Economic Development',
    subtitle: 'Building economic independence and employment opportunities',
    summary: 'PICC operates multiple social enterprises including the Digital Service Centre, community shop, and other ventures that create employment, generate revenue, and build community economic capacity. These enterprises demonstrate innovative Indigenous economic development models.',
    content: `# PICC Social Enterprises and Economic Development

## Overview
The **Palm Island Community Company (PICC)** operates several **social enterprises**—businesses that generate revenue while pursuing social and community benefits. These enterprises create **employment**, build **economic capacity**, and demonstrate **self-determination** in action.

## The Social Enterprise Model

### What is a Social Enterprise?

**Definition:**
A social enterprise is a business that:
- Operates commercially (sells goods/services)
- Generates profit or surplus
- Reinvests profits for social/community benefit
- Balances financial and social outcomes
- Serves community mission

**PICC Approach:**
- Community-controlled organization
- Businesses owned by PICC
- Employment of Palm Island residents prioritized
- Revenue supports health and social services
- Community benefit is primary goal
- Financial sustainability enables service delivery

### Why Social Enterprise for Palm Island?

**Economic Benefits:**
- Creates employment (scarce on island)
- Keeps money circulating locally
- Builds business skills in community
- Reduces welfare dependency
- Generates income for PICC services
- Economic multiplier effects

**Social Benefits:**
- Pride and dignity through employment
- Role modeling for young people
- Community control and self-determination
- Proof of concept for Indigenous business
- Resistance to disadvantage
- Hope and opportunity

## PICC Social Enterprises

### 1. Palm Island Digital Service Centre

**Overview:**
- Partnership with Telstra (launched June 2023)
- Customer service call center
- Australia's first Indigenous community-owned digital service center
- **21 employees** (capacity for 30)
- **50+ languages** supported

**Business Model:**
- Service contract with Telstra
- PICC owns and operates center
- Revenue from customer service delivery
- Telstra provides technology and training
- Long-term partnership agreement

**Employment Impact:**
- 21 full-time equivalent jobs
- Competitive wages and conditions
- Training and skills development
- Career pathways (supervision, management)
- Transferable skills (customer service, IT)
- In community with 29.1% unemployment, this is transformative

**Community Impact:**
- Household incomes increased
- Families supported
- Role models for youth
- Community pride and confidence
- Breaking stereotypes
- National recognition

**Revenue for PICC:**
- Contract revenue covers costs plus margin
- Surplus supports other PICC services
- Financial sustainability enhanced
- Capacity to invest in growth
- Proof of concept for expansion

**Future Plans:**
- Grow to 30 employees
- Expand services beyond Telstra
- Training academy for region
- Additional corporate partnerships
- Export model to other communities

### 2. Community Shop

**Overview:**
- Supermarket serving Palm Island
- Essential goods and groceries
- Only full-service shop on island
- PICC-owned and operated
- Community employment

**Business Model:**
- Retail sales of groceries and essentials
- Pricing reflects remote location costs
- Competition limited (monopoly position)
- Social mission (access to food)
- Commercial operation

**Employment:**
- Shop staff (cashiers, stock, management)
- Local residents employed
- Training in retail
- Career pathways
- Economic contribution to families

**Community Service:**
- Ensures food security
- Accessible location
- Credit and payment flexibility
- Community needs considered
- Essential service provision

**Challenges:**
- High costs (freight, logistics)
- Limited economies of scale
- Stock management (perishables, distance)
- Theft and security
- Balancing commercial and social goals
- Competition from informal economy

**Revenue:**
- Sales revenue
- Modest margins
- Surplus supports PICC services
- Financial sustainability
- Essential enterprise

### 3. Other Potential Enterprises

**Under Development or Consideration:**
- Accommodation for visiting workers
- Catering and food services
- Construction and maintenance services
- Cultural tourism experiences
- Aquaculture or fishing enterprise
- Land management and environmental services
- Training and employment services
- Transport and logistics

## Economic Development Strategy

### PICC's Economic Vision

**Goals:**
- Increase local employment
- Build community wealth
- Reduce welfare dependency
- Diversify island economy
- Community economic control
- Sustainable service funding

**Approach:**
- Identify viable business opportunities
- Leverage community and location assets
- Partner with ethical external organizations
- Prioritize local employment and procurement
- Reinvest profits in community
- Build long-term sustainability

### Employment Creation

**Current Impact:**
- **Digital Service Centre:** 21 jobs
- **Community Shop:** Multiple jobs
- **Health Services:** 30+ employees
- **Other PICC Services:** Additional staff
- **Total:** PICC is largest employer on island (alongside Council and government services)

**Employment Priorities:**
- Hire locally first
- Training and support for employees
- Career pathways and progression
- Competitive wages and conditions
- Cultural safety and flexibility
- Retention and loyalty

### Skills and Capacity Building

**Workforce Development:**
- On-the-job training
- Formal qualifications (Cert III, IV, etc.)
- Leadership and management development
- Mentoring and coaching
- Technology and digital skills
- Business and entrepreneurship

**Community Capacity:**
- More skilled workforce
- Increased confidence and aspiration
- Role models and mentors
- Business knowledge diffusion
- Innovation and creativity
- Self-determination capacity

## Partnerships for Economic Development

### Corporate Partnerships

**Telstra-PICC Model:**
- Genuine partnership (not just sponsorship)
- Mutual benefit (service delivery + community employment)
- Long-term commitment
- Knowledge and technology transfer
- Respect for community control
- Model for other corporations

**Other Partnership Opportunities:**
- Banking and financial services
- Energy companies (renewable energy)
- Tourism operators
- Technology companies
- Retail and logistics
- Professional services

**Principles for Partnerships:**
- Community benefit primary
- Community control maintained
- Fair and ethical terms
- Long-term commitment
- Cultural safety and respect
- Mutual benefit

### Government Support

**Funding and Programs:**
- Indigenous Business Australia (IBA) support
- Department of Employment and Workplace Relations
- Indigenous Procurement Policy (government contracting)
- Regional economic development grants
- Skills and training funding
- Infrastructure investment

**Policy Environment:**
- Closing the Gap economic targets
- Indigenous self-determination policy
- Remote area economic development
- Tax incentives (Remote Area concessions)
- Regulatory support (e.g., NDIS, aged care)

### Regional Collaboration

**Partnerships:**
- Townsville and regional businesses
- Other Aboriginal and Torres Strait Islander communities
- Regional economic development bodies
- Universities and TAFE
- Industry associations
- Supply chain partners

## Challenges and Barriers

### Remote Location

**Disadvantages:**
- High freight and logistics costs
- Limited market size (small population)
- Distance from mainland markets
- Recruitment of specialized staff
- Limited infrastructure
- Connectivity and technology

**Overcoming:**
- Digital economy (call center model)
- Niche markets (cultural tourism, products)
- Remote area advantages (space, environment)
- Technology enabling connection
- Partnerships bridging distance
- Innovation and creativity

### Limited Capital

**Challenge:**
- Starting businesses requires capital
- Limited community wealth
- Difficulty accessing mainstream finance
- Collateral and asset constraints
- Risk aversion from lenders

**Solutions:**
- Indigenous Business Australia support
- Grant funding for start-up
- Partnership capital (e.g., Telstra investment)
- Reinvestment of PICC surpluses
- Philanthropic support
- Innovative financing models

### Workforce Challenges

**Issues:**
- Limited skilled workforce on island
- Recruitment difficulties
- Retention of staff
- Training costs and time
- Competing employers (Council, government)
- Limited labor pool

**Addressing:**
- Invest heavily in training
- Competitive wages and conditions
- Career pathways and development
- Flexible and culturally safe workplace
- Loyalty and community connection
- Succession planning

### Market Limitations

**Constraints:**
- Small local market (2,100 people)
- Limited income and spending
- Competition from informal economy
- Seasonal fluctuations
- Distance from export markets

**Strategies:**
- Serve mainland markets (Digital Centre model)
- Essential services with guaranteed demand (shop)
- Niche and unique products (cultural tourism, arts)
- Online and digital markets
- Regional service hub model
- Innovation and differentiation

## Success Factors

### Community Control

- PICC is community-controlled
- Decisions made locally
- Accountability to community
- Cultural safety ensured
- Profits stay in community
- Self-determination in practice

### Integration with Services

- Enterprises support health and social services
- Revenue cross-subsidizes essential programs
- Employment supports wellbeing
- Holistic community development
- Synergies and efficiencies
- Mission-aligned business

### Innovation and Adaptability

- Digital Service Centre unprecedented
- Creative problem solving
- Learning from failure
- Continuous improvement
- Embracing technology
- Future-focused

### External Support

- Government funding and policy
- Corporate partnerships
- Technical expertise and advice
- Networks and connections
- Advocacy and champions
- Respect and genuine partnership

## Impact and Outcomes

### Economic Outcomes

- Jobs created (21+ at Digital Centre alone)
- Household incomes increased
- Local spending and circulation
- PICC revenue for services
- Reduced welfare dependency
- Economic growth and development

### Social Outcomes

- Pride and dignity
- Role models for youth
- Skills and capacity building
- Community confidence
- Breaking disadvantage cycles
- Hope and aspiration

### Cultural Outcomes

- Self-determination demonstrated
- Resistance to dependency
- Community control visible
- Cultural values in business
- Indigenous economic sovereignty
- Decolonizing economy

## Future Directions

### Enterprise Expansion

**Digital Service Centre:**
- Grow to 30 staff
- Add service contracts (beyond Telstra)
- Training hub for region
- Technology and digital services expansion

**New Enterprises:**
- Renewable energy (solar farm, microgrid)
- Cultural tourism ventures
- Aquaculture and fishing
- Construction and maintenance
- Creative industries and media production
- Land and sea management services

### Economic Diversification

**Strategy:**
- Multiple enterprises reduce risk
- Leverage different community assets
- Serve local and external markets
- Create diverse employment
- Build resilient economy
- Sustainable and growing

### Regional Leadership

**Palm Island as Model:**
- Demonstrate what's possible
- Share learnings with other communities
- Advocate for policy change
- Partner with other Indigenous organizations
- Build regional Indigenous economy
- Inspire and support others

## Significance

PICC's social enterprises represent:
- **Self-Determination:** Community controlling economy
- **Resistance:** Rejecting welfare dependency
- **Innovation:** Creative Indigenous economic development
- **Pride:** Demonstrating capability and competence
- **Justice:** Addressing economic disadvantage
- **Hope:** Proving alternative futures possible

## Contact and Opportunities

**Employment:**
- Check PICC website and social media for job postings
- Local recruitment priority
- Training and support provided

**Partnership:**
- Contact PICC for partnership discussions
- Ethical and community-benefiting partnerships welcomed
- Corporate social responsibility opportunities
- Innovation and collaboration

**Support:**
- Advocate for Indigenous economic development policy
- Support Indigenous businesses and procurement
- Share PICC's story and success
- Philanthropic and grant support
- Capacity building and technical assistance

## Source
PICC Annual Report 2023-24, Digital Service Centre documentation, social enterprise information`,
    entry_type: 'program',
    category: 'Economic Development',
    keywords: ['PICC', 'social enterprise', 'economic development', 'Digital Service Centre', 'employment', 'Telstra', 'community shop', 'Palm Island', 'self-determination'],
    structured_data: {
      source: 'PICC Annual Report 2023-24',
      enterprises: [
        'Palm Island Digital Service Centre (21 employees)',
        'Community Shop',
        'Other potential ventures in development'
      ],
      digital_service_centre: {
        employees: 21,
        capacity: 30,
        partner: 'Telstra',
        launch_date: '2023-06-16',
        first_of_kind: true,
        languages: 50
      },
      economic_impact: 'Largest community employer, revenue for services, reduced unemployment',
      model: 'Social enterprise - profit reinvested in community',
      outcomes: ['Employment creation', 'Skills development', 'Economic independence', 'Community pride'],
      future: ['Expand Digital Centre to 30 staff', 'New enterprises', 'Regional model']
    },
    fiscal_year: '2023-2024',
    location_type: 'palm_island',
    is_public: true,
    is_verified: true
  }
]

async function main() {
  console.log('🚀 Starting Final Programs import...')

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
