import { createClient } from '@supabase/supabase-js';
import * as dotenv from 'dotenv';

dotenv.config({ path: '.env.local' });

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY!;

const supabase = createClient(supabaseUrl, supabaseServiceKey);

async function seedPublications() {
  console.log('Creating publications table if not exists...');

  // Create table
  const { error: tableError } = await supabase.rpc('exec_sql', {
    sql: `
      CREATE TABLE IF NOT EXISTS publications (
        id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
        slug TEXT UNIQUE NOT NULL,
        title TEXT NOT NULL,
        subtitle TEXT,
        description TEXT,
        category TEXT NOT NULL DEFAULT 'report',
        tags TEXT[] DEFAULT '{}',
        author TEXT,
        published_date DATE,
        pdf_url TEXT,
        cover_image_url TEXT,
        content JSONB DEFAULT '[]',
        status TEXT DEFAULT 'draft' CHECK (status IN ('draft', 'published', 'archived')),
        is_featured BOOLEAN DEFAULT false,
        view_count INTEGER DEFAULT 0,
        created_at TIMESTAMPTZ DEFAULT NOW(),
        updated_at TIMESTAMPTZ DEFAULT NOW()
      );
    `
  });

  if (tableError) {
    console.log('Table might already exist or RPC not available, trying direct insert...');
  }

  console.log('Inserting Palm Island Health History publication...');

  const publication = {
    slug: 'palm-island-health-wellbeing-history',
    title: 'Palm Island and PICC: A Comprehensive History',
    subtitle: 'Focus on Health and Wellbeing Outcomes',
    description: 'A comprehensive account of Palm Island\'s journey from colonial control to community self-determination, with particular emphasis on health outcomes, healthy eating initiatives, and programs serving diverse demographics.',
    category: 'health',
    tags: ['health', 'history', 'PICC', 'community', 'wellbeing', 'demographics', 'closing-the-gap'],
    author: 'Palm Island Community Company',
    published_date: '2024-12-07',
    status: 'published',
    is_featured: true,
    content: [
      {
        type: 'stats',
        title: 'Key Health Indicators',
        stats: [
          { value: '~11 years', label: 'Life Expectancy Gap', description: 'vs non-Indigenous Australians' },
          { value: '20-30%', label: 'Type 2 Diabetes', description: 'Adult prevalence (vs 5.3% nationally)' },
          { value: '100+', label: 'Housing Shortfall', description: 'Households needing homes' },
          { value: '$306/wk', label: 'Median Income', description: 'vs $660 Queensland average' }
        ]
      },
      {
        type: 'section',
        title: 'Executive Summary',
        content: `Palm Island, located 65 kilometers off the coast of Townsville in Queensland, Australia, represents one of the nation's most compelling narratives of Indigenous resistance, survival, and contemporary resurgence. Home to approximately 2,138 people (89.7% Indigenous), the island's journey from colonial "punishment reserve" to community-controlled self-determination offers critical lessons in health equity, cultural preservation, and Indigenous-led development.

The Palm Island Community Company (PICC), established in 2007 and achieving full community control in September 2021, has emerged as a model for Indigenous-led health and social service delivery. Under CEO Rachel Atkinson's leadership, PICC has grown from a single employee to approximately 197 staff (95% local Palm Islanders), generating $5.8 million in wages and $9.75 million in economic output annually.

**PICC delivers integrated services including:**
- Primary health care through Bwgcolman Healing Service
- Early childhood services (0-8 years)
- Family wellbeing and domestic violence response
- Youth services and mental health support
- Social enterprises creating employment`
      },
      {
        type: 'section',
        title: 'Traditional Ownership: The Manbarra People',
        content: `The Manbarra people (also known as Wulgurukaba) are the traditional owners of Great Palm Island and the surrounding island group. According to Manbarra Dreamtime stories, the Palm Island group was formed from fragments of the Rainbow Serpent, establishing a sacred connection to Country that predates European arrival by tens of thousands of years.

When Captain Cook sailed past in 1770, approximately 200 Manbarra people lived on the islands, maintaining their traditional way of life, speaking two dialects (Buluguyban and Mulgu) of the Nyawaygic language family. Their traditional territory included the Palm Island group and mainland areas around present-day Townsville.

By the 1890s, most Manbarra had been forcibly removed to the mainland through colonial policies, setting the stage for Palm Island's transformation into a place of exile for Aboriginal peoples from across Queensland.`
      },
      {
        type: 'timeline',
        title: 'Historical Timeline',
        events: [
          { year: '1918', title: 'Hull River Tragedy', description: 'Cyclone destroys Hull River Mission; survivors forcibly relocated to Palm Island' },
          { year: '1930s', title: 'Multi-Tribal Community', description: 'Population grows to 1,630+ representing 57 different language groups' },
          { year: '1957', title: 'The Magnificent Seven', description: 'Seven men lead five-day strike demanding fair wages instead of rations' },
          { year: '1984', title: 'Protection Act Abolished', description: 'Last vestiges of colonial control removed' },
          { year: '1985', title: 'Self-Governance Begins', description: 'Deed of Grant in Trust transfers land to community' },
          { year: '2007', title: 'PICC Established', description: 'Palm Island Community Company founded with single employee' },
          { year: '2021', title: 'Community Control', description: 'PICC achieves full community ownership' },
          { year: '2023', title: 'Digital Service Centre', description: "Australia's first Indigenous community-owned call centre opens" }
        ]
      },
      {
        type: 'quote',
        quote: 'A hard-won achievement for the Palm Island community... The community, its elders, and leaders have worked for decades for self-determination.',
        author: 'Mayor Mislam Sam',
        context: 'On PICC achieving community control, September 2021'
      },
      {
        type: 'section',
        title: 'The Colonial Era: "Punishment Reserve" (1918-1984)',
        content: `On March 10, 1918, a devastating cyclone destroyed the Hull River Mission near Mission Beach, killing approximately 100 people. In April 1918, survivors were forcibly relocated to Palm Island, marking the beginning of the island's role as Queensland's primary Aboriginal settlement.

Under Queensland's 1897 Aboriginal Protection Act, Palm Island was officially designated as "a penitentiary for troublesome cases" by Chief Protector J.W. Bleakley. Over the following decades, Aboriginal and Torres Strait Islander peoples from across Queensland were forcibly removed to the island, often as punishment for "infractions" against restrictive colonial policies.

By the 1930s, Palm Island's population had grown from 200 to over 1,630 people representing at least 57 different language groups. This extraordinary convergence of displaced peoples created an unprecedented situation—and from this trauma emerged a new collective identity: Bwgcolman (meaning "many tribes, one people"), a term coined by Manbarra Elder Dick Palm Island to unite these disparate communities.

**Living Conditions:**
- Tin sheds and substandard housing
- Lack of running water in many homes
- Outdoor toilets and minimal electricity
- Overcrowding (10+ people in small dwellings)
- Inadequate food rations instead of wages
- Morning roll calls and nightly curfews`
      },
      {
        type: 'section',
        title: 'The Magnificent Seven (1957)',
        content: `The most significant act of resistance came on June 10, 1957, when seven men led a five-day strike demanding fair wages instead of rations:

1. Albert "Albie" Geia
2. Willie Thaiday
3. Eric Lymburner
4. Sonny Sibley
5. Bill Congoo
6. George Watson
7. Gordon Tapau

Superintendent Roy Bartlam had threatened to deport Geia for allegedly disobeying a European overseer. The strike spread community-wide, with residents refusing to work under exploitative conditions.

After five days, armed police from Townsville conducted dawn raids. The "Magnificent Seven" were arrested at gunpoint with their families, shackled, and forcibly deported to different Aboriginal settlements across Queensland—never to return together.

Their courage sparked a movement that eventually led to wage justice for Indigenous workers across Australia. June 9 is now commemorated annually on Palm Island.`
      },
      {
        type: 'stats',
        title: 'Current Demographics (Census 2021)',
        stats: [
          { value: '2,138', label: 'Total Population', description: '89.7% Indigenous' },
          { value: '32%', label: 'Under 15 Years', description: 'vs 19.3% Queensland average' },
          { value: '29.1%', label: 'Unemployment', description: 'vs 5.1% Queensland' },
          { value: '15%', label: 'Year 12 Completion', description: 'vs ~60% Queensland' }
        ]
      },
      {
        type: 'section',
        title: 'PICC Formation and Growth (2007-2021)',
        content: `The Palm Island Community Company (PICC) was established in 2007 through a dual shareholder model: Queensland Government (50%) and Palm Island Aboriginal Shire Council (50%).

Rachel Atkinson, a proud Yorta Yorta woman with deep connections to her Aboriginal heritage, was appointed as the first CEO—and the organization's only employee.

**PICC's Mission:**
1. Deliver human and social services
2. Build community capacity
3. Stimulate economic development

**Growth Achievements:**
- From 1 employee to ~197 staff (95% local Palm Islanders)
- Assumed responsibility for 16+ services
- Created "no wrong door" integrated service approach
- Generated $5.8 million in local wages annually
- $9.75 million total economic output

**Community Control Achievement (September 2021):**
On September 30, 2021, after years of lobbying, all services, workforce, and assets were transferred to a new company fully owned by Palm Islanders. This was a watershed moment for self-determination.`
      },
      {
        type: 'section',
        title: 'Health and Wellbeing Outcomes',
        content: `Palm Island faces profound health disparities rooted in historical trauma and ongoing social determinants:

**Life Expectancy:**
- National Indigenous average: 71.9 years (vs 83.2 non-Indigenous)
- Palm Island likely at or below this average
- ~11 year gap persists

**Chronic Disease Burden:**
- Type 2 Diabetes: 20-30% of adults (vs 5.3% nationally)
- Earlier onset (30s-40s vs 50s+)
- High cardiovascular disease rates
- Kidney disease requiring dialysis
- Respiratory conditions

**Mental Health Challenges:**
- Depression and anxiety very common
- Post-traumatic stress disorder from historical and ongoing trauma
- Suicide risk, especially among young men
- Intergenerational trauma impacts

**Social Determinants:**
- Housing overcrowding: up to 15-20 people per house
- Housing shortfall: 100+ households
- High food costs due to remote location
- Limited cooking facilities
- Poverty affecting nutrition choices`
      },
      {
        type: 'section',
        title: 'Healthy Eating Initiatives',
        content: `**Challenges to Healthy Eating:**
- High food costs (remote barge transport)
- Limited fresh fruit and vegetables availability
- Poverty limiting healthy food purchases
- Overcrowded cooking facilities
- Processed food prevalence (longer shelf life, lower cost)
- Lost connection to traditional bush tucker

**Programs Implemented:**

**Early Childhood Nutrition (PICC):**
- Breastfeeding support and education
- Infant feeding guidance
- Healthy food in playgroups
- Cooking skills training for parents

**School-Based Nutrition:**
- Free breakfast program at Palm Island State School
- Nutrition education in curriculum
- Growth monitoring and health screening

**Community Initiatives:**
- PICC Community Shop (social enterprise)
- Storm Recovery Food Distribution (2024 floods)
- Bush tucker education programs
- Elder-led cultural food knowledge sharing`
      },
      {
        type: 'section',
        title: 'Programs for Children and Families (0-8 years)',
        content: `**PICC Early Childhood Services:**

**Supported Playgroups:**
- Baby and Toddler Groups (0-3 years): Sensory play, parent-child bonding
- Preschool Playgroups (3-5 years): School readiness, social skills
- Cultural Playgroups: Bush tucker, traditional stories, language

**Parenting Programs:**
- First Time Parents: Newborn care, safe sleep, bonding
- Positive Parenting: Evidence-based strategies
- Family Literacy: Reading, storytelling traditions

**School Readiness (Age 4-5):**
- Pre-literacy and pre-numeracy skills
- Social and emotional readiness
- Self-care and independence

**Child Development Services:**
- Regular developmental screening
- Early identification of delays
- NDIS navigation and advocacy
- Specialist referrals (speech, OT)`
      },
      {
        type: 'section',
        title: 'Youth Programs',
        content: `**Palm Island State School:**
- Prep to Year 10 (ages 5-16)
- ~200 students, 98%+ Indigenous
- Bwgcolman language program with elder teachers
- Cultural education (bush tucker, craft, dance)
- Breakfast program and wellbeing services

**Transition Challenge:**
Students completing Year 10 must move to Townsville for Years 11-12, requiring separation from family and community.

**PICC Youth Services:**
- After-school and holiday programs
- Sport and recreation (rugby league, basketball)
- Mental health support and counseling
- Peer support networks
- Adult mentorship programs`
      },
      {
        type: 'section',
        title: 'Women\'s Services',
        content: `**Women's Healing Service:**
- Temporary accommodation for women experiencing domestic violence
- Safe, secure environment
- Case management and support
- Connection to legal, housing, and health services

**Safe House:**
- 24/7 emergency shelter
- Immediate safety from violence
- Crisis support and pathway planning

**Perinatal Mental Health:**
- Screening for postnatal depression and anxiety
- Counseling and treatment
- Peer support groups
- Trauma-informed care`
      },
      {
        type: 'section',
        title: 'Men\'s Programs',
        content: `**Men's Gathering:**
- Mental health support in culturally safe environment
- Cultural connection and identity work
- Peer support networks
- Addressing trauma and building positive masculinity

**Movember Partnership (2024):**
- $1.9 million secured over five years
- Men's mental health and recovery programs
- Cultural healing approaches
- Crisis response capacity

**Storm Recovery Men's Programs:**
- Structured activities providing purpose during 2024 floods
- Elder men leading younger men
- Cultural connection during trauma`
      },
      {
        type: 'section',
        title: 'Elders Programs',
        content: `**Elders Advisory Group:**
- Cultural guidance to PICC Board
- Traditional knowledge transmission
- Decision-making input
- Cultural protocols oversight

**Elder-Led Programs:**
- Bwgcolman language teaching in schools
- Cultural knowledge sharing with youth
- Bush tucker and medicine knowledge
- Story and ceremony preservation

**Elder Welfare:**
- Home visiting programs
- Health monitoring
- Food security checks
- Isolation prevention

**Elder-Led Recovery Governance:**
During 2024 storm recovery, elders directed priorities using traditional decision-making processes.`
      },
      {
        type: 'section',
        title: 'Key Innovations',
        content: `**Integrated Service Delivery Model:**
- "No wrong door" approach—any entry connects to all services
- 95% local workforce
- Cultural safety built in
- Key outcome: Significant reduction in child removals

**Palm Island Digital Service Centre (June 2023):**
Australia's first Indigenous community-owned digital service centre:
- Partnership with Telstra
- 21 employees (capacity 30)
- Customer service call centre
- 50+ languages supported
- Employment reduces poverty and improves mental health

**Storm Recovery Innovation (February 2024):**
Seven documented innovation programs:
1. Movember Men's Recovery Program ($1.9M)
2. Experimental Collapsible Beds
3. Community-led Washing Machine Distribution
4. Orange Sky Mobile Laundry Partnership
5. Quality Food Distribution Network (Woolworths)
6. Elder-Led Recovery Governance
7. Systematic Story Documentation (26 stories)`
      },
      {
        type: 'stats',
        title: 'PICC Impact (2024)',
        stats: [
          { value: '~197', label: 'Total Staff', description: '95% local Palm Islanders' },
          { value: '$5.8M', label: 'Annual Wages', description: 'Paid to local community' },
          { value: '$9.75M', label: 'Economic Output', description: 'Annual contribution' },
          { value: '16+', label: 'Services Delivered', description: 'Health, family, youth, enterprise' }
        ]
      },
      {
        type: 'section',
        title: 'Current State of the Island',
        content: `**Governance:**
- Palm Island Aboriginal Shire Council (Mayor Alf Lacey)
- PICC as community-controlled organization (CEO Rachel Atkinson)
- Manbarra Traditional Owner representation

**Services Delivered by PICC (16+):**
- Health: Bwgcolman Healing Service, social and emotional wellbeing
- Child and Family: Family Wellbeing Centre, Safe House, Early Childhood
- Community Support: Women's Service, Men's Gathering, Youth Services
- Social Enterprise: Bakery, Fuel Station, Digital Service Centre

**Infrastructure Challenges:**
- Housing: 300-350 dwellings; 100+ shortfall; severe overcrowding
- Transport: Barge, small airport, passenger ferry
- Power: Diesel generators; solar emerging
- Communications: Telstra mobile; NBN satellite

**Cultural Strength:**
- Bwgcolman language revival in schools
- Elder language teachers
- Bush tucker and cultural education
- Land and Sea Rangers program`
      },
      {
        type: 'section',
        title: 'Closing the Gap Progress',
        content: `**Relevant Targets:**
- Life Expectancy: ~11 year gap persists
- Year 12 Completion: 15% (target 96%)
- Employment: 29.1% unemployment
- Housing: 100+ household shortfall

**Community-Led Progress:**
While statistical gaps remain significant, Palm Island demonstrates approaches that address root causes:

- PICC's transition to full community control (2021)
- Local employment strategy (95% Palm Islanders)
- Community-controlled health services
- Comprehensive 0-8 years investment
- Cultural strength and language revival
- Economic development through social enterprises`
      },
      {
        type: 'section',
        title: 'Future Directions',
        content: `**Health Priorities:**
- Chronic disease prevention (diabetes, heart disease)
- Smoking cessation programs
- Mental health and trauma healing
- Food security and nutrition
- Housing and overcrowding reduction

**PICC Strategic Goals:**
- Expand Digital Service Centre to 30 staff
- New social enterprises (renewable energy, tourism, aquaculture)
- Enhanced early childhood facilities
- Aged care development

**Long-Term Aspirations:**
- Year 11-12 education on Palm Island
- Full secondary education without leaving community
- Economic self-sufficiency through diversified enterprises
- Model for other Indigenous communities`
      },
      {
        type: 'quote',
        quote: 'Self-determination itself improves health outcomes through empowerment. When communities control their own services, they can design them to meet cultural needs and local priorities.',
        author: 'Rachel Atkinson',
        context: 'CEO, Palm Island Community Company'
      }
    ]
  };

  // Try to upsert
  const { data, error } = await supabase
    .from('publications')
    .upsert(publication, { onConflict: 'slug' })
    .select();

  if (error) {
    console.error('Error inserting publication:', error);

    // If table doesn't exist, we need to create it first
    if (error.message.includes('does not exist')) {
      console.log('\nThe publications table does not exist yet.');
      console.log('Please run the following SQL in Supabase dashboard:\n');
      console.log('https://supabase.com/dashboard/project/uaxhjzqrdotoahjnxmbj/sql/new\n');
      console.log('Copy from: web-platform/supabase/migrations/20251207120000_publications.sql');
    }
    return;
  }

  console.log('Publication seeded successfully!');
  console.log('Visit http://localhost:3000/publications to view');
}

seedPublications();
