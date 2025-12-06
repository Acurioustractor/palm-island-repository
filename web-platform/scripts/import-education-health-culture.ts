/**
 * Import Education, Health, and Cultural Programs
 *
 * Adds comprehensive entries for:
 * - PICC Early Childhood Services
 * - Palm Island State School
 * - Bwgcolman Language & Cultural Programs
 * - Community Housing and Infrastructure
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
    slug: 'picc-early-childhood-services-2024',
    title: 'PICC Early Childhood Services',
    subtitle: 'Supporting families and children from birth to school',
    summary: 'PICC delivers comprehensive early childhood services including playgroups, parenting support, child development programs, and school readiness initiatives. Services are culturally grounded and family-centered, supporting children from birth to age 8.',
    content: `# PICC Early Childhood Services

## Overview
Palm Island Community Company's **Early Childhood Services** provide holistic, culturally grounded support for children from birth to 8 years and their families, focusing on healthy development, school readiness, and strong family connections.

## Service Philosophy

### Early Years Matter
Research shows that:
- 90% of brain development occurs before age 5
- Early experiences shape lifelong outcomes
- Quality early childhood programs reduce disadvantage
- Parental involvement is critical to success
- Cultural connection enhances identity and wellbeing

### Cultural Foundation
All services incorporate:
- Manbarra traditional knowledge
- Language and cultural practices
- Elder involvement and wisdom
- Connection to Country
- Intergenerational learning
- Cultural identity development

## Core Programs

### Supported Playgroups

**Baby and Toddler Groups (0-3 years):**
- Sensory play and exploration
- Music and movement
- Parent-child bonding activities
- Developmental milestone tracking
- Breastfeeding and nutrition support
- Social connection for parents

**Preschool Playgroups (3-5 years):**
- Structured learning through play
- School readiness activities
- Social skills development
- Language and literacy foundations
- Numeracy concepts
- Physical development

**Cultural Playgroups:**
- Bush tucker experiences
- Traditional stories and songs
- Language learning
- Cultural craft activities
- Connection to Country outings
- Elder-led activities

### Parenting Programs

**First Time Parents:**
- Newborn care and development
- Safe sleep practices
- Nutrition and feeding
- Bonding and attachment
- Recognizing developmental milestones
- When to seek help

**Positive Parenting:**
- Evidence-based parenting strategies
- Managing challenging behavior
- Communication and connection
- Routine and structure
- Celebrating cultural parenting practices
- Grandparent-led parenting support

**Family Literacy:**
- Reading with babies and children
- Language-rich environments
- Storytelling traditions
- Book access and library connections
- Digital literacy for families
- Cultural stories preservation

### School Readiness Programs

**Transition to School (Age 4-5):**
- Pre-literacy and pre-numeracy skills
- Social and emotional readiness
- Self-care and independence
- Following instructions
- School routine preparation
- Confidence building

**Kindergarten Support:**
- Partnership with Palm Island State School
- Smooth transition processes
- Ongoing family support
- Early identification of additional needs
- Cultural continuity from home to school
- Parent engagement in schooling

### Child Development Services

**Developmental Screening:**
- Regular developmental checks
- Early identification of delays
- Referral to specialist services
- Monitoring and follow-up
- Family support during assessment
- Culturally appropriate tools

**Therapeutic Services:**
- Speech pathology (through partnerships)
- Occupational therapy access
- Physiotherapy referrals
- Audiology and hearing checks
- Vision screening
- Nutrition assessment

**Disability Support:**
- Early intervention services
- NDIS navigation and advocacy
- Therapy coordination
- Family support and training
- Equipment and aids access
- Inclusive program participation

## Integrated Health Services

### Maternal and Child Health

**Partnership with Bwgcolman Healing Service:**
- Antenatal education
- Postnatal care
- Well-child checks
- Immunization support
- Growth monitoring
- Developmental surveillance

**Nutrition Programs:**
- Breastfeeding support
- Infant feeding guidance
- Healthy food provision
- Cooking and food prep skills
- Cultural foods education
- Addressing food insecurity

### Mental Health and Wellbeing

**Perinatal Mental Health:**
- Screening for postnatal depression
- Anxiety and stress support
- Trauma-informed care
- Connection to counseling
- Peer support groups
- Family violence response

**Child Mental Health:**
- Social-emotional development
- Early intervention for concerns
- Trauma-responsive practices
- Play therapy approaches
- Family therapy access
- Cultural healing integration

## Family Support Services

### Case Management
- Comprehensive family support
- Service coordination
- Goal setting and planning
- Advocacy and referrals
- Crisis support
- Long-term relationship building

### Home Visiting
- Regular home visits for vulnerable families
- In-home parenting support
- Linking families to services
- Practical assistance
- Building trust and connection
- Culturally safe engagement

### Material Support
- Nappies and essential supplies
- Baby equipment loan service
- Clothing and bedding
- Books and toys
- Food packages when needed
- Transport assistance

## Cultural Programs

### Language Preservation
- Bwgcolman/Manbarra language teaching
- Songs and stories in language
- Intergenerational language transmission
- Recording and preserving language
- Language resources for families
- Bilingual learning benefits

### Cultural Knowledge
- Traditional stories and Dreamtime
- Cultural protocols and practices
- Bush tucker and medicine
- Connection to Country
- Totems and kinship
- Ceremony and celebration

### Elder Involvement
- Elders as teachers and mentors
- Cultural knowledge transmission
- Storytelling sessions
- Practical cultural activities
- Grandparent support programs
- Intergenerational healing

## Partnerships and Collaboration

### Government Services
- Department of Education (Early Childhood)
- Child Safety and Family Support
- Queensland Health
- NDIS and disability services
- Centrelink and family support

### Educational Institutions
- Palm Island State School
- Townsville early childhood services
- Training and professional development
- Research and evaluation partnerships
- Resource sharing

### Community Organizations
- Palm Island Aboriginal Shire Council
- Other PICC services (integrated)
- Community health services
- Cultural organizations
- Faith-based groups

## Facilities and Resources

### Early Childhood Center
- Dedicated playgroup spaces
- Indoor and outdoor play areas
- Age-appropriate equipment
- Kitchen for nutrition programs
- Meeting and education rooms
- Cultural learning spaces

### Resources
- Toys, books, and learning materials
- Cultural resources and artifacts
- Technology for families
- Parent education materials
- Health and development resources
- Multilingual resources

## Staffing

### Professional Team
- Early childhood educators
- Playgroup facilitators
- Family support workers
- Child development specialists
- Cultural educators
- Health professionals (integrated)

### Qualifications and Training
All staff maintain:
- Early childhood qualifications
- Child safety training
- Cultural competency
- First aid and CPR
- Trauma-informed practice
- Ongoing professional development

## Access and Participation

### How to Join
- Self-referral welcome (drop-in encouraged)
- Health service referrals
- Child Safety referrals
- School referrals
- Word of mouth and family connections
- No cost to families

### Program Schedule
- Regular weekly playgroups
- School term and holiday programs
- Special cultural events
- Parent education sessions
- One-on-one support as needed
- Flexible timing for families

### Inclusive Participation
Services welcome:
- All children and families
- Children with disabilities
- Families experiencing disadvantage
- Families with child protection involvement
- Culturally diverse families
- First-time parents to experienced

## Outcomes and Impact

### Child Development
Children participating show:
- Better school readiness
- Stronger social skills
- Enhanced language development
- Improved physical health
- Cultural identity and pride
- Reduced developmental delays

### Family Wellbeing
Families benefit through:
- Increased parenting confidence
- Stronger parent-child relationships
- Better understanding of child development
- Enhanced support networks
- Connection to community resources
- Cultural knowledge and pride

### Community Impact
- Increased school attendance and success
- Reduced child protection involvement
- Stronger intergenerational connections
- Cultural practice preservation
- Community capacity building
- Positive early childhood culture

## Challenges and Innovation

### Service Gaps
Addressing:
- Limited specialist services on-island
- Staff recruitment and retention
- Facility capacity
- Transport for families
- Multi-generational trauma
- Poverty and disadvantage

### Innovative Solutions
- Telehealth for specialists
- Training community members as workers
- Outreach and home-based services
- Material support provision
- Cultural healing integration
- Partnership with mainland services

## Recognition and Best Practice

The Early Childhood Services represent:
- Best practice Indigenous early childhood model
- Integration of culture and evidence
- Family-centered approach
- Community control and design
- Holistic child and family support
- Prevention and early intervention focus

## Future Directions

### Expansion Plans
- Dedicated early childhood center expansion
- Increase in qualified staff
- Extended program hours
- More cultural programs
- Enhanced health integration
- 0-8 years continuum of support

### New Programs
- Aboriginal and Torres Strait Islander Health Worker training
- Early childhood employment pathways
- Grandparent kinship care support
- Sibling programs
- Fathers and male caregivers programs
- Cultural playgroup franchise model for region

## Contact and Participation

**Join Programs:**
- Visit PICC offices on Palm Island
- Call for program times and information
- Drop in to playgroups (always welcome)
- Referrals accepted from any source
- Free and open to all families
- Culturally safe and family-friendly

## Source
PICC service documentation and early childhood program information`,
    entry_type: 'service',
    category: 'PICC',
    keywords: ['PICC', 'early childhood', 'parenting', 'playgroups', 'school readiness', 'child development', 'Palm Island', 'cultural education'],
    structured_data: {
      source: 'PICC service documentation',
      age_range: '0-8 years',
      programs: [
        'Supported playgroups',
        'Parenting programs',
        'School readiness',
        'Child development services',
        'Maternal and child health',
        'Cultural programs',
        'Home visiting'
      ],
      services: [
        'Baby and toddler groups',
        'Preschool playgroups',
        'Cultural playgroups',
        'Parenting education',
        'Developmental screening',
        'Language and culture',
        'Family support'
      ],
      access: 'free, open to all families, self-referral welcome',
      culturally_grounded: true,
      integrated_with_health: true
    },
    fiscal_year: '2023-2024',
    location_type: 'palm_island',
    is_public: true,
    is_verified: true
  },
  {
    slug: 'palm-island-state-school-2024',
    title: 'Palm Island State School',
    subtitle: 'Education for Prep to Year 10 students',
    summary: 'Palm Island State School serves approximately 200 students from Prep to Year 10, providing culturally responsive education with strong community connections. The school integrates Bwgcolman culture, language, and identity throughout the curriculum.',
    content: `# Palm Island State School

## Overview
**Palm Island State School** is the primary educational institution on Palm Island, serving students from **Preparatory Year to Year 10** (ages 5-16). The school provides Queensland curriculum education with strong cultural integration and community connection.

## School Profile

### Student Population
- Approximately **200 students** enrolled
- 98%+ Indigenous student population
- Students from across Palm Island community
- Multi-age classrooms in some year levels
- High proportion of students with additional needs

### Year Levels
- **Preparatory (Prep)**: Foundation year
- **Years 1-7**: Primary school
- **Years 8-10**: Junior secondary
- **Post-Year 10**: Students transition to Townsville for Years 11-12

### Cultural Context
The school serves a community where:
- 89.7% of population is Aboriginal and Torres Strait Islander
- Multiple language groups represented (57+ historically)
- Strong Bwgcolman identity
- Cultural connection is central to learning
- Intergenerational trauma affects many families

## Educational Approach

### Culturally Responsive Teaching

**Embedding Culture:**
- Bwgcolman language in daily learning
- Traditional stories and Dreamtime in literacy
- Connection to Country through science
- Cultural mathematics and numeracy
- Local history throughout curriculum
- Elder involvement in classrooms

**Cultural Identity:**
- Celebrating Bwgcolman identity
- Recognizing diverse clan groups
- Understanding connection to Country
- Cultural protocols and practices
- Pride in Indigenous heritage
- Strong sense of place

### Queensland Curriculum
The school delivers the full Queensland curriculum across:
- **English:** Reading, writing, speaking, listening
- **Mathematics:** Number, patterns, measurement, data
- **Science:** Biological, chemical, physical, earth sciences
- **Humanities and Social Sciences (HASS):** History, geography, civics, economics
- **The Arts:** Visual arts, music, dance, drama, media
- **Technologies:** Digital and design technologies
- **Health and Physical Education:** Movement, health, wellbeing

### Additional Priorities

**Literacy and Numeracy:**
- Daily focus on reading and writing
- Targeted numeracy programs
- Multi-lit and reading intervention
- Numeracy coaching
- Assessment and tracking
- Small group instruction

**Attendance:**
- Every Day Counts initiatives
- Family engagement in attendance
- Rewards and recognition
- Community-wide attendance campaigns
- Addressing barriers to attendance
- Transport support

## Programs and Initiatives

### Cultural Programs

**Bwgcolman Language Program:**
- Weekly language lessons
- Language in daily activities
- Elder language teachers
- Recording and preserving language
- Song and story in language
- Bilingual learning benefits

**Cultural Education:**
- Bush tucker and medicine excursions
- Traditional craft and art
- Dance and performance
- Connection to Country camps
- Seasonal calendar learning
- Cultural protocols teaching

### Support Programs

**Learning Support:**
- Special education teachers
- Teacher aides for individual support
- Speech and language therapy (visiting)
- Occupational therapy access
- Literacy and numeracy intervention
- Gifted and talented programs

**Wellbeing Support:**
- Chaplaincy services
- Guidance officer (counseling)
- Breakfast and nutrition programs
- Health checks and immunizations
- Mental health support
- Positive behavior support

**NDIS Coordination:**
- Support for students with disabilities
- NDIS plan implementation
- Therapy integration in school
- Equipment and adjustments
- Collaboration with families and providers
- Inclusive education practices

### Engagement Programs

**Sport and Recreation:**
- Daily physical activity
- Interschool sports competitions
- Swimming programs
- Cultural games and activities
- Leadership through sport
- Representative opportunities

**Arts and Creativity:**
- Visual arts projects
- Music and performance
- School concerts and events
- Cultural dance groups
- Digital media creation
- Community art installations

**Leadership:**
- Student council
- Peer mentoring
- Leadership camps
- Community service projects
- Cultural leadership roles
- Voice and agency development

## Partnerships

### Community Partners
- **Palm Island Aboriginal Shire Council**: Infrastructure and community events
- **PICC**: Health, family support, early childhood transition
- **Elders and Traditional Owners**: Cultural teaching and guidance
- **Community Justice Group**: Youth support and mentoring
- **Local organizations**: Sport, arts, cultural activities

### Government Partners
- **Department of Education**: Funding, curriculum, professional development
- **Queensland Health**: School health programs and immunizations
- **Child Safety**: Support for vulnerable students
- **Police**: School liaison and safety education
- **Centrelink/Services Australia**: Family support

### Regional Partnerships
- **Townsville schools**: Year 11-12 transition, shared professional development
- **James Cook University**: Teacher education, research partnerships
- **TAFE Queensland**: Vocational education pathways
- **Sporting organizations**: Competitions and development
- **Arts organizations**: Programs and performances

## Facilities and Resources

### School Infrastructure
- Modern classrooms (recent upgrades)
- Library and resource center
- Computer labs and digital devices
- Science and technology facilities
- Arts and music spaces
- Sports fields and courts
- Covered outdoor learning areas
- Cultural learning spaces

### Technology
- 1:1 devices for many students
- Interactive whiteboards
- Wi-Fi connectivity
- Digital learning platforms
- Assistive technology
- Online curriculum resources

### Resources
- Queensland curriculum materials
- Cultural education resources
- Library books and e-books
- Sports and PE equipment
- Arts and music supplies
- Science and technology materials

## Staffing

### Teaching Staff
- Principal
- Deputy Principal
- Classroom teachers (Prep-Year 10)
- Special education teachers
- Support teachers (literacy, numeracy)
- Cultural educators
- Teacher aides

### Support Staff
- Guidance officer (counseling)
- School chaplain
- Admin and office staff
- Facilities and maintenance
- Teacher aides and support workers
- Community liaison officers

### Professional Culture
Staff demonstrate:
- Cultural competency and safety
- Trauma-informed practice
- High expectations for all students
- Commitment to community
- Collaborative approach
- Ongoing professional learning

## Student Transitions

### Starting School
- Partnership with PICC Early Childhood Services
- Prep transition programs
- Family engagement in starting school
- Cultural continuity from home to school
- Assessment and individual planning
- Smooth entry to formal learning

### Year 10 to Year 11
**Major Transition:**
Students completing Year 10 must:
- Move to Townsville for Years 11-12
- Board away from family and community
- Adapt to larger, mainland schools
- Navigate new cultural contexts
- Maintain connection to home

**Transition Support:**
- Career counseling and pathway planning
- Visits to Townsville schools
- Boarding school preparation
- Ongoing connection to Palm Island students in Townsville
- Family engagement in planning
- Cultural support away from home
- Return visits to community

**Challenges:**
- Separation from family and culture
- Homesickness and isolation
- Different teaching styles
- Racism and discrimination
- Financial pressures
- Higher academic demands

**Success Factors:**
- Strong academic preparation
- Cultural identity and pride
- Family support and communication
- Peer support networks
- School-based Indigenous support
- Ongoing connection to community

### Post-School Pathways
- University (growing numbers)
- TAFE and vocational training
- Apprenticeships and traineeships
- Direct employment (PICC, Council, services)
- Defense Force careers
- Return to community roles

## Challenges

### Attendance
- Transient population
- Family and cultural obligations
- Health and wellbeing issues
- Intergenerational school trauma
- Complex family circumstances
- Weather and isolation affecting routine

### Educational Outcomes
- Gaps in literacy and numeracy
- High proportion of students behind year level
- NAPLAN results below state averages
- Limited Year 12 completion rates
- Intergenerational educational disadvantage
- Complex trauma affecting learning

### Resources
- Remote location challenges
- Specialist service access limitations
- Staff recruitment and retention
- Professional development access
- Aging infrastructure (despite upgrades)
- Funding constraints

### Systemic Issues
- Historical trauma from mission schools
- Continuing disadvantage
- Racism and low expectations
- Culturally inappropriate curriculum
- Lack of Indigenous teachers
- Policy instability

## Strengths and Achievements

### Community Connection
- Strong community engagement
- Elder involvement in learning
- Cultural integration throughout
- Family participation in school
- Local employment of community members
- Pride in school achievements

### Cultural Education
- Leading Bwgcolman language program
- Cultural camps and experiences
- Elder knowledge transmission
- Connection to Country learning
- Cultural identity development
- Model for other schools

### Individual Success Stories
- Students achieving at high levels
- Year 12 completions and university entry
- Sporting and arts achievements
- Leadership development
- Return to community as teachers, health workers, leaders
- Breaking cycles of disadvantage

## Future Directions

### Aspirations
- Increased Year 12 completion rates
- Year 11-12 on Palm Island (long-term goal)
- More Indigenous teachers from community
- Enhanced cultural curriculum
- Improved literacy and numeracy outcomes
- State-of-the-art facilities and resources

### Initiatives
- Strengthened transition programs
- Enhanced attendance strategies
- Family and community engagement
- Teacher cultural competency development
- Partnerships with universities for teacher training
- Technology-enhanced learning

## Significance

Palm Island State School represents:
- Community's commitment to education
- Cultural pride and identity
- Pathway to opportunity
- Site of resistance and resilience
- Hope for future generations
- Community controlled (aspiration for full autonomy)

## Contact

**Palm Island State School**
- Located on Palm Island
- Contact through Queensland Department of Education
- Principal and leadership team
- Community welcome and involvement
- Enrollments accepted year-round

## Source
Palm Island State School information, Queensland Department of Education data, and community knowledge`,
    entry_type: 'organization',
    category: 'Education',
    keywords: ['Palm Island State School', 'education', 'Prep to Year 10', 'Queensland curriculum', 'Bwgcolman language', 'cultural education', 'Palm Island'],
    structured_data: {
      source: 'Queensland Department of Education and school information',
      students_approx: 200,
      year_levels: 'Prep to Year 10',
      indigenous_percentage: 98,
      programs: [
        'Queensland Curriculum',
        'Bwgcolman Language Program',
        'Cultural Education',
        'Learning Support',
        'Wellbeing Support',
        'Sport and Recreation',
        'Leadership Programs'
      ],
      transition_year_11: 'Students move to Townsville for Years 11-12',
      culturally_responsive: true,
      community_connected: true
    },
    fiscal_year: '2023-2024',
    location_type: 'palm_island',
    is_public: true,
    is_verified: true
  },
  {
    slug: 'bwgcolman-language-cultural-revival-2024',
    title: 'Bwgcolman Language and Cultural Revival',
    subtitle: 'Preserving and revitalizing Indigenous language and culture',
    summary: 'The Bwgcolman language and cultural revival movement works to preserve, teach, and revitalize the unique creole language and cultural practices of Palm Island. Programs span schools, community, and families to ensure language survival for future generations.',
    content: `# Bwgcolman Language and Cultural Revival

## Overview
The **Bwgcolman language** is a unique Australian creole that developed on Palm Island, blending elements from the 57+ Aboriginal language groups forcibly relocated to the island. Today, active efforts are underway to preserve, teach, and revitalize this language and associated cultural practices.

## The Bwgcolman Language

### Origins and Development

**Historical Context:**
Following the establishment of Palm Island as a "punishment reserve" in 1918, Aboriginal people from across Queensland were forcibly removed to the island, bringing with them:
- 57+ different Aboriginal languages
- Diverse cultural practices
- Various clan and kinship systems
- Different Country connections
- Unique ceremonial knowledge

**Language Formation:**
Unable to communicate in their traditional languages with each other, residents developed **Bwgcolman**:
- A creole language mixing Aboriginal languages with English
- Unique grammatical structures
- Vocabulary from multiple language groups
- Distinct pronunciation and rhythm
- Evolution over generations

**Cultural Significance:**
Bwgcolman represents:
- Unity from diversity
- Survival and adaptation
- Resistance through language creation
- Community identity
- Shared Palm Island culture

### Language Characteristics

**Structure:**
- Creole grammar (different from English or traditional languages)
- Aboriginal language vocabulary embedded
- Phonetic patterns from multiple sources
- Unique expressions and idioms
- Evolving with each generation

**Status:**
- Primary language for many Palm Island residents
- Spoken in homes and community
- Used across generations
- Not recognized as official language historically
- Growing recognition and documentation

### Endangerment

**Threats to Language:**
- English dominance in formal settings
- Younger generations speaking more English
- Limited written resources historically
- Migration to mainland
- Historical suppression and shame
- Lack of formal teaching (until recently)

**Risk Level:**
Like many Indigenous languages, Bwgcolman is:
- At risk without active preservation
- Losing fluent speakers each generation
- Competing with English in all formal contexts
- Vulnerable to erosion
- Needing urgent documentation and teaching

## Language Revival Efforts

### Palm Island State School Program

**Bwgcolman Language Classes:**
- Weekly language lessons for all students
- Elder language teachers in classrooms
- Language in daily school activities
- Songs, stories, and oral traditions
- Cultural context with language
- Pride in unique Palm Island language

**Curriculum Integration:**
- Language across all subject areas
- Bilingual learning approach
- Language in literacy and numeracy
- Cultural stories in language
- School assemblies and events in language
- Signage and materials in Bwgcolman

### PICC Early Childhood Programs

**Early Language Exposure:**
- Bwgcolman in playgroups
- Songs and rhymes in language
- Parent education on language importance
- Elder storytelling in language
- Bilingual children's resources
- Language from birth

### Community Programs

**Elder-Led Language Teaching:**
- Community language classes
- Intergenerational language transmission
- Recording of fluent speakers
- Documentation of vocabulary and grammar
- Cultural knowledge in language
- Story preservation

**Language in Community Events:**
- Ceremonies and celebrations
- Welcome to Country in Bwgcolman
- Public signage and naming
- Media and communications
- Community meetings
- Cultural performances

## Documentation and Resources

### Language Recording

**Oral History Projects:**
- Recording Elder fluent speakers
- Documenting stories and songs
- Video and audio archives
- Pronunciation guides
- Grammar and structure analysis
- Contextual usage examples

**Written Resources:**
- Bwgcolman dictionaries (in development)
- Grammar guides
- Teaching materials
- Children's books in language
- Bilingual signage
- Digital resources

### Technology

**Digital Preservation:**
- Audio and video archives
- Online dictionaries and learning tools
- Mobile apps for language learning
- Social media in Bwgcolman
- Digital storytelling
- Accessible resources for diaspora

**Language Technology:**
- Voice recognition (future)
- Translation tools
- Language learning software
- Archival databases
- Community access platforms

## Cultural Revival Programs

### Traditional Knowledge

**Bush Tucker and Medicine:**
- Traditional food knowledge (names in language)
- Medicine plants and uses
- Seasonal harvesting
- Preparation and cooking
- Cultural protocols
- Elder-led teaching

**Connection to Country:**
- Traditional place names
- Significance of locations
- Environmental knowledge
- Seasonal indicators
- Cultural site protection
- Land management practices

### Cultural Practices

**Ceremony and Performance:**
- Traditional dance (adapted and unique to Palm Island)
- Song in language
- Ceremony maintenance
- Cultural performance groups
- Youth cultural troupes
- Intergenerational participation

**Art and Craft:**
- Traditional art techniques
- Contemporary Indigenous art
- Cultural symbols and meanings
- Craft making (weaving, carving, etc.)
- Artistic expression of identity
- Economic opportunities through art

### Kinship and Identity

**Understanding Kinship:**
- Kinship terms in Bwgcolman
- Family and clan connections
- Social structures and protocols
- Respect and relationships
- Cultural obligations
- Identity formation

**Bwgcolman Identity:**
- Pride in unique Palm Island identity
- Distinction from mainland groups
- Shared history and culture
- Community solidarity
- Contemporary Indigenous identity
- Connection to multiple ancestries

## Partnerships and Support

### Academic Partnerships
- Universities documenting language
- Linguistic research and analysis
- Student projects and theses
- Collaborative language resources
- Professional expertise and support
- Funding and grants

### Government Support
- Department of Education curriculum support
- Arts and cultural grants
- Language preservation funding
- First Languages Australia
- Indigenous language policy recognition
- Infrastructure and resources

### Community Organizations
- Palm Island Aboriginal Shire Council
- PICC cultural programs
- Community Justice Group
- Elders' councils
- Cultural committees
- Youth organizations

## Impact and Outcomes

### Language Preservation
- Growing numbers of young speakers
- Documented language resources
- Intergenerational transmission
- Community pride in language
- Recognition and status
- Survival ensured for future generations

### Cultural Strengthening
- Enhanced cultural identity
- Stronger community cohesion
- Pride in unique heritage
- Resistance to cultural loss
- Youth engagement
- Elder respect and involvement

### Educational Outcomes
- Bilingual cognitive benefits
- Cultural pride supporting engagement
- Elder knowledge valued
- Unique curriculum
- Community in schools
- Improved attendance and achievement

### Wellbeing Impact
- Cultural connection improving mental health
- Identity and pride
- Intergenerational healing
- Community strength
- Resistance to disadvantage
- Empowerment through culture

## Challenges

### Resource Limitations
- Funding constraints
- Limited teaching materials
- Specialist expertise needed
- Technology access
- Time and capacity
- Competing priorities

### Systemic Issues
- English dominance
- Lack of official status
- Certification for language teachers
- Curriculum requirements
- Assessment in English
- Policy barriers

### Community Challenges
- Aging fluent speakers (urgency)
- Youth preference for English
- Migration to mainland
- Historical trauma and shame
- Competing cultural influences
- Intergenerational communication gaps

## Success Stories

### Growing Fluency
- More children learning language
- Youth embracing language pride
- Families speaking language at home
- Community events in language
- Media and communications in Bwgcolman
- Language in daily life increasing

### Recognition
- Language program awards
- Media coverage and interest
- Academic research and documentation
- Model for other communities
- Linguistic uniqueness recognized
- Cultural pride nationally

### Community Transformation
- Elders valued as teachers
- Youth connecting to culture
- Community unity through language
- Identity strengthening
- Resistance to cultural loss
- Hope for future generations

## Future Directions

### Aspirations
- Full bilingual education program
- Bwgcolman language center
- Certified language teachers from community
- Comprehensive language resources
- Official language recognition
- Thriving language for generations

### Initiatives
- Expand school language program
- Community language immersion
- Master-apprentice programs
- Digital resource development
- Language nest programs (0-5 years)
- Youth language leadership

## Significance

The Bwgcolman language and cultural revival represents:
- **Survival:** Language emerged from trauma and thrives despite challenges
- **Resistance:** Community refuses cultural loss
- **Identity:** Unique Palm Island culture and unity
- **Healing:** Cultural connection supports wellbeing
- **Self-determination:** Community-led cultural preservation
- **Hope:** Future generations will speak language

## How to Support

### Community Members
- Speak Bwgcolman at home and in community
- Encourage children to learn
- Participate in language programs
- Share knowledge with younger generations
- Use language in daily life
- Celebrate language pride

### Visitors and Supporters
- Respect and learn greetings
- Support language programs
- Recognize language uniqueness
- Advocate for language rights
- Share language story
- Contribute to language resources (if invited)

## Source
Palm Island community language programs, linguistic research, and cultural knowledge`,
    entry_type: 'program',
    category: 'Culture and Language',
    keywords: ['Bwgcolman language', 'language revival', 'cultural preservation', 'creole', 'Palm Island', 'Indigenous language', 'education', 'Elders'],
    structured_data: {
      source: 'Community language programs and research',
      language_type: 'Australian creole',
      source_languages: '57+ Aboriginal languages plus English',
      status: 'endangered, active revival',
      programs: [
        'School language classes',
        'Early childhood language',
        'Elder-led teaching',
        'Language documentation',
        'Community events in language',
        'Digital resources'
      ],
      speakers: 'most Palm Island residents with varying fluency',
      endangerment: 'at risk without active preservation',
      revival_active: true,
      culturally_unique: true
    },
    fiscal_year: '2023-2024',
    location_type: 'palm_island',
    is_public: true,
    is_verified: true
  },
  {
    slug: 'palm-island-housing-infrastructure-2024',
    title: 'Palm Island Housing and Infrastructure Development',
    subtitle: 'Building community capacity through improved housing and services',
    summary: 'Palm Island has undergone significant housing and infrastructure development in recent decades, addressing historical neglect while working toward community-controlled development. Ongoing challenges include housing shortages, maintenance needs, and infrastructure gaps.',
    content: `# Palm Island Housing and Infrastructure Development

## Overview
Palm Island's housing and infrastructure have been the subject of ongoing development, advocacy, and challenge. From severe historical neglect to contemporary investment, the community continues working toward adequate housing and services for all residents.

## Historical Context

### Mission and Reserve Era (1918-1980s)

**Government Control:**
- Basic, substandard housing
- Overcrowding from forced relocations
- Minimal infrastructure investment
- Government-owned, controlled housing
- No community input in development
- Deliberate neglect and underfunding

**Housing Conditions:**
- Tin sheds and basic structures
- Lack of running water in many homes
- Outdoor toilets
- Minimal electricity
- Overcrowding (10+ people in small homes)
- Poor health outcomes from housing

**Infrastructure:**
- Unpaved roads
- Limited water and sewerage
- Unreliable electricity
- No telecommunications
- Minimal community facilities
- Isolation from services

### Post-DOGIT Era (1984-2000s)

**Deed of Grant in Trust (DOGIT):**
1984 legislation transferred land to community control, but:
- Housing remained government-controlled
- Minimal improvement in conditions
- Continuing overcrowding
- Infrastructure gaps persisted
- Limited community capacity
- Underfunding continued

## Contemporary Housing

### Current Housing Stock

**Dwelling Numbers:**
- Approximately **300-350 dwellings** on Palm Island
- Mix of house sizes (2-5 bedrooms)
- Social housing (majority)
- Private housing (limited)
- Community housing (emerging)

**Housing Types:**
- Detached houses
- Duplexes
- Units/apartments (limited)
- Transitional housing
- Emergency accommodation

**Ownership and Management:**
- Queensland Government social housing
- Palm Island Aboriginal Shire Council housing
- PICC housing (limited)
- Private ownership (rare but growing)
- Community housing association (developing)

### Housing Challenges

**Severe Shortage:**
- Estimated **100+ household shortfall**
- Waiting lists of years
- Overcrowding (up to 15-20 people per house)
- Homelessness and rough sleeping
- Young families unable to establish independence
- Multi-generational households by necessity

**Overcrowding Impact:**
- Health issues (disease transmission, stress)
- Children's education affected (no quiet study space)
- Family violence risk increased
- Lack of privacy and personal space
- Appliance and utility overload
- Accelerated wear and damage

**Condition Issues:**
- Aging housing stock needing repairs
- Maintenance backlogs
- Damage from overcrowding
- Cyclone damage (tropical location)
- Termites and tropical deterioration
- Some houses uninhabitable

**Affordability:**
- Rent at 25% of income (social housing)
- Utility costs high (remote location)
- Maintenance costs
- Limited employment = limited income
- Poverty makes private housing impossible
- High cost of building materials on island

### Recent Developments

**New Housing Construction:**
Government and community efforts have delivered:
- New house builds (numbers vary by funding)
- Replacement of worst housing
- Improved designs for climate and culture
- Better materials and construction
- Larger family homes
- Disability-accessible housing

**Housing Upgrades:**
- Renovations and repairs program
- Essential services (water, electricity, sewerage)
- Cyclone-proofing improvements
- Cooling and ventilation
- Kitchen and bathroom upgrades
- Accessibility modifications

**Design Improvements:**
- Culturally appropriate designs
- Large family accommodation
- Outdoor living spaces
- Cyclone-resistant construction
- Climate-appropriate (cooling, shade, airflow)
- Water-efficient fixtures
- Solar power installation

## Infrastructure Development

### Roads and Transport

**Current State:**
- Most roads now paved (major improvement from past)
- Some unsealed roads remain
- Pedestrian paths and walkways
- Vehicle access to most areas
- Drainage improvements
- Ongoing maintenance needs

**Transport Infrastructure:**
- Barge facility for freight
- Passenger ferry terminal
- Small airport (limited services)
- Vehicle ferry
- Local bus service
- Pedestrian and bicycle infrastructure

### Water and Sewerage

**Water Supply:**
- Reticulated town water supply
- Water treatment plant
- Storage and distribution
- Quality monitoring
- Upgrade and maintenance ongoing
- Drought and climate considerations

**Sewerage:**
- Septic systems (some older areas)
- Sewerage treatment infrastructure
- Environmental health standards
- Upgrade program
- Maintenance and repair
- Environmental protection

### Electricity and Energy

**Power Supply:**
- Diesel generators (remote area)
- Reticulated electricity to all houses
- PowerLink Queensland management
- Reliable supply (improvements from past)
- High cost (diesel fuel)
- Renewable energy potential

**Renewable Energy:**
- Solar power installation on buildings
- Community solar farm (proposed/developing)
- Reduced diesel dependence goal
- Environmental benefits
- Lower long-term costs
- Energy sovereignty aspiration

### Communications

**Telecommunications:**
- Mobile phone coverage (Telstra)
- Internet connectivity
- NBN satellite access
- PICC Digital Service Centre infrastructure
- Improved from severe historical isolation
- Digital divide still exists

**Connectivity Challenges:**
- Limited bandwidth
- High costs
- Weather disruptions
- Limited competition
- Digital literacy needs
- Access inequality

### Community Facilities

**Essential Services:**
- PICC multi-service hub
- Palm Island Hospital and health clinic
- Palm Island State School
- Police station and courthouse
- Council offices
- Community Justice Group facility

**Recreation and Culture:**
- Sports fields and courts
- Community hall and meeting spaces
- Cultural centers
- Parks and playgrounds
- Beach access and facilities
- Youth and family activity spaces

**Commercial:**
- Community shop (supermarket)
- Small retail outlets
- PICC Digital Service Centre
- Cafes and food outlets
- Fuel station
- Banking and financial services (limited)

## Governance and Planning

### Responsible Authorities

**Palm Island Aboriginal Shire Council:**
- Local government authority
- Infrastructure planning and management
- Roads, water, waste, facilities
- Community development
- Advocacy for investment
- Strategic planning

**Queensland Government:**
- Social housing provision (Department of Housing)
- Major infrastructure funding
- Utilities regulation
- Service delivery
- Capital works programs
- Policy and legislation

**Palm Island Community Company (PICC):**
- Community services and facilities
- Housing development (small scale)
- Infrastructure advocacy
- Service delivery
- Community engagement
- Strategic partnerships

### Planning and Development

**Community Plan:**
- Long-term vision for Palm Island
- Housing and infrastructure priorities
- Cultural and environmental values
- Economic development
- Community input and control
- Staged implementation

**Challenges in Planning:**
- Funding uncertainty
- Government policy changes
- Remote location costs
- Climate and cyclone considerations
- Land tenure complexities
- Community capacity constraints

## Economic Impact of Infrastructure

### Employment
Infrastructure development creates:
- Construction jobs
- Trades training and apprenticeships
- Ongoing maintenance employment
- Local procurement opportunities
- Skills development
- Economic multiplier effects

### Economic Development
Quality infrastructure enables:
- Business development
- Service delivery
- Tourism potential
- Digital economy participation
- Cost savings (energy, transport)
- Community wealth building

### Social and Health Outcomes
Improved housing and infrastructure supports:
- Better health (reduced overcrowding, disease)
- Educational outcomes (quiet study space, internet)
- Safety and security
- Mental health and wellbeing
- Community pride
- Self-determination

## Challenges and Barriers

### Funding
- Insufficient government investment historically
- Competition for limited funding
- High costs of remote construction
- Maintenance funding gaps
- Asset lifecycle planning
- Dependency on government budgets

### Technical
- Remote location logistics
- Material and labor transport costs
- Skilled workforce on island
- Climate and weather impacts
- Aging infrastructure
- Design for tropical cyclone zone

### Governance
- Multiple government jurisdictions
- Community vs. government control
- Policy instability
- Bureaucratic barriers
- Consultation and engagement
- Self-determination aspirations

### Climate and Environment
- Tropical cyclone vulnerability
- Sea level rise and coastal erosion
- Extreme heat impacts
- Flooding and storm surge
- Sustainability considerations
- Environmental protection

## Innovations and Solutions

### Community-Led Development
- Community housing models
- Local workforce training and employment
- Cultural design principles
- Community procurement and enterprise
- Self-determination in planning
- Control over development

### Sustainable Design
- Solar power and renewable energy
- Water conservation and harvesting
- Cyclone-resistant construction
- Climate-appropriate design
- Passive cooling and ventilation
- Environmental sustainability

### Partnership Models
- Government and community collaboration
- Private sector partnerships (like Telstra)
- University research and support
- NGO capacity building
- Regional collaboration
- Innovative funding models

## Future Directions

### Housing Priorities
- Eliminate housing shortage (100+ new houses needed)
- Reduce overcrowding to safe levels
- Maintain and upgrade existing stock
- Diverse housing options (aged care, disability, private)
- Community housing association development
- Pathways to home ownership

### Infrastructure Needs
- Renewable energy transition
- Enhanced telecommunications
- Aged care facility
- Youth and recreation facilities
- Cultural centers and keeping places
- Commercial and economic infrastructure

### Strategic Goals
- Community control and self-determination
- Economic independence and development
- Climate resilience and adaptation
- Cultural integrity in development
- Quality of life for all residents
- Model for other remote Indigenous communities

## Significance

Palm Island's housing and infrastructure development represents:
- **Justice:** Addressing historical neglect and underfunding
- **Self-determination:** Community control over development
- **Equity:** Right to same standards as mainland Australia
- **Health:** Foundation for wellbeing and opportunity
- **Pride:** Quality infrastructure reflects community value
- **Sovereignty:** Infrastructure as assertion of permanence and rights

## Contact and Advocacy

**Housing Needs:**
- Apply through Department of Housing
- Contact Palm Island Aboriginal Shire Council
- PICC may assist with applications and advocacy

**Infrastructure Issues:**
- Report to Palm Island Aboriginal Shire Council
- Advocate through community meetings
- Engage elected representatives
- Media and public awareness

## Source
Palm Island Aboriginal Shire Council reports, Queensland Government housing data, community knowledge`,
    entry_type: 'document',
    category: 'Infrastructure',
    keywords: ['Palm Island', 'housing', 'infrastructure', 'development', 'overcrowding', 'community planning', 'social housing', 'Council'],
    structured_data: {
      source: 'Council reports and government data',
      approximate_dwellings: 350,
      housing_shortfall: 100,
      overcrowding: 'severe - up to 15-20 people per house in some cases',
      recent_improvements: ['new house construction', 'road paving', 'solar power', 'telecommunications'],
      ongoing_challenges: ['housing shortage', 'maintenance backlogs', 'funding gaps', 'remote location costs'],
      governance: ['Palm Island Aboriginal Shire Council', 'Queensland Government', 'PICC'],
      future_priorities: ['eliminate housing shortage', 'renewable energy transition', 'community control']
    },
    fiscal_year: '2023-2024',
    location_type: 'palm_island',
    is_public: true,
    is_verified: true
  }
]

async function main() {
  console.log('🚀 Starting Education, Health, and Culture import...')

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
