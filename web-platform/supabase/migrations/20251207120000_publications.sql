-- Publications table for interactive reports and documents
-- Enables regular publishing of community reports, research, and documentation

CREATE TABLE IF NOT EXISTS publications (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),

  -- Basic info
  slug TEXT UNIQUE NOT NULL,
  title TEXT NOT NULL,
  subtitle TEXT,
  description TEXT,

  -- Categorization
  category TEXT NOT NULL DEFAULT 'report', -- report, research, community, policy, health
  tags TEXT[] DEFAULT '{}',

  -- Media
  featured_image_url TEXT,
  thumbnail_url TEXT,
  pdf_url TEXT,

  -- Content (structured sections for interactive display)
  content JSONB DEFAULT '[]', -- Array of section objects

  -- Metadata
  author TEXT,
  published_date TIMESTAMP WITH TIME ZONE,
  fiscal_year TEXT,

  -- Status
  status TEXT DEFAULT 'draft' CHECK (status IN ('draft', 'published', 'archived')),
  is_featured BOOLEAN DEFAULT false,
  view_count INTEGER DEFAULT 0,

  -- Timestamps
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create index for faster lookups
CREATE INDEX IF NOT EXISTS idx_publications_slug ON publications(slug);
CREATE INDEX IF NOT EXISTS idx_publications_category ON publications(category);
CREATE INDEX IF NOT EXISTS idx_publications_status ON publications(status);
CREATE INDEX IF NOT EXISTS idx_publications_published_date ON publications(published_date DESC);
CREATE INDEX IF NOT EXISTS idx_publications_featured ON publications(is_featured) WHERE is_featured = true;

-- Enable RLS
ALTER TABLE publications ENABLE ROW LEVEL SECURITY;

-- Drop existing policies if they exist
DROP POLICY IF EXISTS "Published publications are viewable by everyone" ON publications;
DROP POLICY IF EXISTS "Admins can manage all publications" ON publications;

-- Public read access for published publications
CREATE POLICY "Published publications are viewable by everyone"
  ON publications
  FOR SELECT
  USING (status = 'published');

-- Admin full access (adjust role as needed)
CREATE POLICY "Admins can manage all publications"
  ON publications
  FOR ALL
  USING (auth.role() = 'authenticated');

-- Update trigger for updated_at
CREATE OR REPLACE FUNCTION update_publications_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS publications_updated_at ON publications;
CREATE TRIGGER publications_updated_at
  BEFORE UPDATE ON publications
  FOR EACH ROW
  EXECUTE FUNCTION update_publications_updated_at();

-- Delete existing publication if it exists (for re-running migration)
DELETE FROM publications WHERE slug = 'palm-island-health-wellbeing-history';

-- Insert the Palm Island Health & Wellbeing History - FULL COMPREHENSIVE VERSION
INSERT INTO publications (
  slug,
  title,
  subtitle,
  description,
  category,
  tags,
  author,
  published_date,
  status,
  is_featured,
  content
) VALUES (
  'palm-island-health-wellbeing-history',
  'Palm Island and PICC: A Comprehensive History',
  'Health and Wellbeing Outcomes Focus',
  'A comprehensive account of Palm Island''s journey from colonial control to community self-determination, with particular emphasis on health outcomes, healthy eating initiatives, and programs serving diverse demographics. This document traces the community''s history through a health and wellbeing lens, documenting the challenges, initiatives, and outcomes that characterize their journey toward self-determination.',
  'health',
  ARRAY['health', 'history', 'wellbeing', 'demographics', 'PICC', 'community', 'self-determination', 'Indigenous health'],
  'PICC Documentation Team',
  NOW(),
  'published',
  true,
  $JSON$[
    {
      "type": "hero",
      "title": "Palm Island and PICC: A Comprehensive History",
      "subtitle": "Health and Wellbeing Outcomes Focus",
      "description": "A comprehensive account of Palm Island's journey from colonial control to community self-determination, with particular emphasis on health outcomes, healthy eating initiatives, and programs serving diverse demographics."
    },
    {
      "type": "stats",
      "title": "Key Statistics at a Glance",
      "stats": [
        {"label": "Population", "value": "2,138", "description": "Census 2021"},
        {"label": "Indigenous %", "value": "89.7%", "description": "Community strength"},
        {"label": "PICC Staff", "value": "197", "description": "95% local employment"},
        {"label": "Life Expectancy Gap", "value": "~11 years", "description": "Critical health priority"}
      ]
    },
    {
      "type": "section",
      "title": "Executive Summary",
      "content": "Palm Island, located 65 kilometers off the coast of Townsville in Queensland, Australia, represents one of the nation's most compelling narratives of Indigenous resistance, survival, and contemporary resurgence. Home to approximately 2,138 people (89.7% Indigenous), the island's journey from colonial \"punishment reserve\" to community-controlled self-determination offers critical lessons in health equity, cultural preservation, and Indigenous-led development.\n\n**The Health Challenge**\n\nPalm Island faces profound health disparities rooted in historical trauma and ongoing social determinants of health:\n\n• Life expectancy gap: Approximately 11 years lower than non-Indigenous Australians\n• Chronic disease burden: Type 2 diabetes affects an estimated 20-30% of adults (vs. 5.3% nationally)\n• Housing crisis: Over 100 households in need, with overcrowding reaching 15-20 people per dwelling\n• Economic disadvantage: Median weekly income of $306 (less than half the Queensland average of $660)\n\n**The Community Response**\n\nThe Palm Island Community Company (PICC), established in 2007 and achieving full community control in September 2021, has emerged as a model for Indigenous-led health and social service delivery. Under CEO Rachel Atkinson's leadership, PICC has grown from a single employee to approximately 197 staff (95% local Palm Islanders), generating $5.8 million in wages and $9.75 million in economic output annually.\n\nPICC delivers integrated services including:\n• Primary health care through Bwgcolman Healing Service\n• Early childhood services (0-8 years)\n• Family wellbeing and domestic violence response\n• Youth services and mental health support\n• Social enterprises creating employment"
    },
    {
      "type": "section",
      "title": "Traditional Ownership: The Manbarra People",
      "content": "The Manbarra people (also known as Wulgurukaba) are the traditional owners of Great Palm Island and the surrounding island group. According to Manbarra Dreamtime stories, the Palm Island group was formed from fragments of the Rainbow Serpent, establishing a sacred connection to Country that predates European arrival by tens of thousands of years.\n\nWhen Captain Cook sailed past in 1770, approximately 200 Manbarra people lived on the islands, maintaining their traditional way of life, speaking two dialects (Buluguyban and Mulgu) of the Nyawaygic language family. Their traditional territory included the Palm Island group and mainland areas around present-day Townsville.\n\nBy the 1890s, most Manbarra had been forcibly removed to the mainland through colonial policies, setting the stage for Palm Island's transformation into a place of exile for Aboriginal peoples from across Queensland."
    },
    {
      "type": "section",
      "title": "Colonial Era: The \"Punishment Reserve\" (1918-1984)",
      "content": "**The Hull River Tragedy (1918)**\n\nOn March 10, 1918, a devastating cyclone destroyed the Hull River Mission near Mission Beach, killing approximately 100 people. In April 1918, survivors were forcibly relocated to Palm Island, marking the beginning of the island's role as Queensland's primary Aboriginal settlement.\n\nUnder Queensland's 1897 Aboriginal Protection Act, Palm Island was officially designated as \"a penitentiary for troublesome cases\" by Chief Protector J.W. Bleakley. Over the following decades, Aboriginal and Torres Strait Islander peoples from across Queensland were forcibly removed to the island, often as punishment for \"infractions\" against restrictive colonial policies.\n\n**The Multi-Tribal Community**\n\nBy the 1930s, Palm Island's population had grown from 200 to over 1,630 people representing at least 57 different language groups. This extraordinary convergence of displaced peoples created an unprecedented situation—and from this trauma emerged a new collective identity: Bwgcolman (meaning \"many tribes, one people\"), a term coined by Manbarra Elder Dick Palm Island to unite these disparate communities."
    },
    {
      "type": "section",
      "title": "Living Conditions and Health Impacts (Mission Era)",
      "content": "The mission era (1918-1970s) was characterized by severe conditions that created lasting health impacts:\n\n**Physical Conditions:**\n• Tin sheds and substandard housing\n• Lack of running water in many homes\n• Outdoor toilets and minimal electricity\n• Overcrowding (10+ people in small dwellings)\n• Inadequate food rations instead of wages\n\n**Health Consequences:**\n• High rates of infectious disease due to overcrowding\n• Malnutrition from inadequate rations\n• Dental disease from poor diet\n• Mental health impacts from trauma and control\n• Intergenerational health disadvantage\n\n**Governance Control:**\n• Morning roll calls and nightly curfews\n• Bell tower signaling daily routines\n• Superintendents with extensive powers\n• Strict limits on movement and freedom\n• Forced labor without wages\n\n**Health Legacy of the Mission Era:**\n\nThe mission era left lasting health impacts that continue to affect the community:\n• Intergenerational trauma from family separations, forced labor, and abuse\n• Educational disadvantage limiting health literacy\n• Economic poverty restricting access to healthy food and housing\n• Cultural disruption severing connections to traditional health practices\n• Distrust of government services affecting health-seeking behavior"
    },
    {
      "type": "section",
      "title": "The Magnificent Seven and Resistance (1957)",
      "content": "The most significant act of resistance came on June 10, 1957, when seven men—Albert \"Albie\" Geia, Willie Thaiday, Eric Lymburner, Sonny Sibley, Bill Congoo, George Watson, and Gordon Tapau—led a five-day strike demanding fair wages instead of rations.\n\nSuperintendent Roy Bartlam had threatened to deport Geia for allegedly disobeying a European overseer. The strike spread community-wide, with residents refusing to work under exploitative conditions.\n\nAfter five days, armed police from Townsville conducted dawn raids. The \"Magnificent Seven\" were arrested at gunpoint with their families, shackled, and forcibly deported to different Aboriginal settlements across Queensland—never to return together.\n\nTheir courage sparked a movement that eventually led to wage justice for Indigenous workers across Australia. June 9 is now commemorated annually on Palm Island."
    },
    {
      "type": "timeline",
      "title": "Path to Self-Governance",
      "events": [
        {"year": "1918", "title": "Hull River Tragedy", "description": "Cyclone destroys Hull River Mission; survivors forcibly relocated to Palm Island in April"},
        {"year": "1957", "title": "The Magnificent Seven", "description": "Five-day strike for wage justice led by seven brave community members"},
        {"year": "1975", "title": "Dormitories Closed", "description": "Children's dormitories closed (operating since 1922)"},
        {"year": "1984", "title": "Protection Act Abolished", "description": "Last vestiges of the 1897 Protection Act abolished"},
        {"year": "1985", "title": "DOGIT Transfer", "description": "Queensland Government relinquished control; Deed of Grant in Trust transferred land to community. Palm Island Aboriginal Council established March 30."},
        {"year": "2005", "title": "Shire Council", "description": "Council became Palm Island Aboriginal Shire Council with full local government powers"},
        {"year": "2007", "title": "PICC Established", "description": "Palm Island Community Company formed with Rachel Atkinson as sole employee and CEO"},
        {"year": "2021", "title": "Community Control", "description": "PICC achieves full community ownership on September 30, 2021"}
      ]
    },
    {
      "type": "section",
      "title": "PICC Formation and Evolution (2007-Present)",
      "content": "**Establishment (2007)**\n\nThe Palm Island Community Company (PICC) was established in 2007 through a dual shareholder model:\n• Queensland Government: 50% ownership\n• Palm Island Aboriginal Shire Council: 50% ownership\n\nRachel Atkinson, a proud Yorta Yorta woman with deep connections to her Aboriginal heritage, was appointed as the first CEO—and the organization's only employee.\n\nRachel's leadership philosophy stemmed from her family lineage of tireless activists, including her great uncle William Cooper and Sir Douglas Nicholls (Australia's first Indigenous Governor of South Australia). Her professional background included nearly a decade (1996-2006) leading the Townsville Aboriginal and Islander Health Service (TAIHS).\n\n**PICC's Mission:**\n1. Deliver human and social services\n2. Build community capacity\n3. Stimulate economic development\n\n**Growth Phase (2007-2021)**\n\nFrom that single-employee beginning, PICC embarked on steady expansion:\n\n*Service Integration:*\n• Assumed responsibility for multiple government-funded programs\n• Developed integrated health, family, and early childhood services\n• Created \"no wrong door\" approach—any entry point connects to all services\n\n*Local Employment Strategy:*\n• Prioritized hiring Palm Islanders for all positions\n• Invested in training and professional development\n• Built career pathways within the organization\n• Achieved 95% local workforce\n\n*Economic Impact by 2021:*\n• Approximately 180 employees\n• $5.8 million in local wages annually\n• $9.75 million in economic output for community\n\n**Health Services Expansion (August 2021):**\n\nPICC took a major step by assuming responsibility for Palm Island primary health services, amalgamating their existing health center with the Townsville Hospital and Health Service primary health center to create an integrated community-controlled Aboriginal Medical Service—Bwgcolman Healing Service."
    },
    {
      "type": "quote",
      "quote": "A hard-won achievement for the Palm Island community... The community, its elders, and leaders have worked for decades for self-determination.",
      "author": "Mayor Mislam Sam",
      "context": "On PICC achieving community control, September 30, 2021"
    },
    {
      "type": "section",
      "title": "Community Control Achievement (September 2021)",
      "content": "On September 30, 2021, after years of lobbying by CEO Rachel Atkinson and the PICC Board, all services, workforce, and assets were transferred to a new company that maintained the Palm Island Community Company name but was now fully owned by Palm Islanders.\n\n**Significance for Health and Wellbeing:**\n• Community now controls its own health service design and delivery\n• Services can be tailored to cultural needs and priorities\n• Local employment in health services creates economic benefit\n• Health workforce reflects community it serves\n• Self-determination itself improves health outcomes through empowerment\n\n**Current Leadership Structure:**\n\n*CEO:* Rachel Atkinson (since 2007)\n• Co-Chair, Queensland First Children and Families Board\n• Co-Chair, Family Matters Queensland\n• Board Director, SNAICC\n• Deputy Chairperson, Queensland Aboriginal and Islander Health Council\n\n*Chairperson:* Luella Bligh\n• Led transition to community control\n• Emphasizes strong professional governance\n\n*Traditional Owner Director:* Allan Palm Island\n• Manbarra representative\n• Cultural knowledge holder\n• Master of Fine Arts (RMIT University Melbourne, 1999)\n\nBoard Members include community members with professional expertise in Indigenous governance, legal matters, finance, and education."
    },
    {
      "type": "stats",
      "title": "Current Demographics (Census 2021)",
      "stats": [
        {"label": "Total Population", "value": "2,138", "description": "Down from 2,455 in 2016"},
        {"label": "Indigenous", "value": "89.7%", "description": "1,918 people"},
        {"label": "Under 15 years", "value": "32.0%", "description": "vs 19.3% QLD average"},
        {"label": "Median Age", "value": "~24 years", "description": "vs 38 years QLD average"}
      ]
    },
    {
      "type": "section",
      "title": "Demographics: Labour Force and Income",
      "content": "**Labour Force Statistics:**\n• Labour Force: 702 people\n• Full-time Employment: 38.6% (vs ~60% QLD)\n• Part-time Employment: 28.3% (vs ~30% QLD)\n• Unemployment Rate: 29.1% (vs 5.1% QLD)\n• Median Weekly Income: $306 (vs $660 QLD)\n\n**Income Gap:** Palm Islanders earn less than half the Queensland median—$354 per week less.\n\n**Education Attainment:**\n• Year 12 Completion: 15.0% (vs ~60% QLD)\n• Certificate III/IV: 10.4% (vs ~20% QLD)\n• Diploma/Advanced Diploma: 2.6% (vs ~10% QLD)\n• Bachelor Degree or Higher: <3% (vs ~25% QLD)\n\n**Population Trends:**\n• 2016: 2,455 people\n• 2021: 2,138 people\n• Change: -317 (-12.9%)\n\nThe population decrease may reflect outmigration for employment or education (especially Year 11-12 students), improved census methodology, or demographic changes.\n\n**Housing Overview:**\n• Approximate dwellings: 300-350\n• Housing shortfall: 100+ households\n• Overcrowding: Up to 15-20 people per house (some cases)\n• Tenure: Predominantly social housing; private ownership rare"
    },
    {
      "type": "section",
      "title": "Life Expectancy and Chronic Disease Burden",
      "content": "**Life Expectancy Gap**\n\nNational Comparison (2020-2022):\n• Australian average: 83.2 years\n• Aboriginal and Torres Strait Islander average: 71.9 years\n• Gap: Approximately 11 years\n\nPalm Island's life expectancy is likely at or below the Indigenous average due to remote location limiting access to specialist services, concentrated socioeconomic disadvantage, higher chronic disease burden, and historical trauma impacts.\n\n**Diabetes**\n\n• Type 2 Diabetes Prevalence: 20-30% of adults (vs 5.3% national)\n• Age of Onset: 30s-40s (vs 50s+ national)\n\nComplications prevalent in Palm Island:\n• Cardiovascular disease\n• Kidney disease (requiring dialysis)\n• Diabetic retinopathy (blindness)\n• Peripheral neuropathy\n• Foot ulcers and amputation\n• Premature death\n\nManagement Challenges:\n• Limited endocrinology access on island\n• High cost of healthy food\n• Medication compliance barriers\n• Complications requiring mainland treatment\n• Multi-morbidity (multiple conditions)\n\n**Cardiovascular Disease**\n• Leading cause of death for Indigenous Australians\n• High rates of rheumatic heart disease (legacy of overcrowding and untreated infections)\n• Hypertension common\n• Earlier onset than non-Indigenous population\n• Risk factors: smoking, diabetes, obesity, stress\n\n**Kidney Disease**\n• High prevalence linked to diabetes and hypertension\n• Progression to end-stage renal disease requiring dialysis\n• Limited dialysis facilities on Palm Island\n• Patients often must relocate to Townsville\n• Significant family and cultural disconnection\n\n**Respiratory Disease**\nHigh rates of asthma (children and adults), COPD, bronchiectasis, and acute respiratory infections. Contributing factors include overcrowded housing, high smoking rates, and limited specialist access."
    },
    {
      "type": "section",
      "title": "Mental Health",
      "content": "**High Burden:**\n• Depression and anxiety very common\n• Post-traumatic stress disorder (PTSD) from historical and ongoing trauma\n• Substance use disorders\n• Suicide risk (especially young men)\n• Complex trauma from intergenerational experiences\n\n**Contributing Factors:**\n• Intergenerational trauma: Stolen Generations, mission era, forced family separations\n• Ongoing racism and discrimination\n• Poverty and socioeconomic disadvantage\n• Overcrowding and lack of privacy\n• Unemployment and lack of opportunity\n• Family violence exposure\n• Grief and loss from premature deaths\n• Incarceration impacts\n\n**Protective Factors:**\n• Cultural connection and identity\n• Family and community support\n• Employment and purpose\n• Hope and opportunity\n• Access to timely, culturally appropriate support\n• Community-led prevention programs"
    },
    {
      "type": "section",
      "title": "Social and Environmental Determinants of Health",
      "content": "**Housing Crisis**\n\n• Overcrowding (15-20 per house): Leads to infection transmission, sleep disruption, mental health impacts, family violence risk\n• 100+ household shortfall: Multi-generational forced co-residence, young families unable to establish independence\n• Aging housing stock: Maintenance backlogs, cyclone damage, termites\n\n**Income and Employment**\n• Median weekly income: $306 (vs. $805 nationally)\n• Unemployment: 29.1% (vs. 5.1% nationally)\n• Many reliant on Centrelink payments\n• Limited job opportunities on island\n• Poverty affects nutrition, health-seeking, and stress levels\n\n**Food Security Challenges:**\n• High cost of food (remote location): Limited purchasing of healthy options\n• Limited fresh fruit/vegetables: Obesity, diabetes, cardiovascular disease\n• Poverty: Reliance on cheaper processed foods\n• Overcrowded cooking facilities: Inability to prepare healthy meals\n• Bush tucker less accessible: Lost connection to traditional healthy foods\n\n**Substance Use**\n\n*Tobacco:*\n• Adult Smoking Rate: 40-50% (vs ~10% national)\n• Pregnancy Smoking: Higher than average\n• Health impacts: Cardiovascular disease, respiratory disease, cancer, diabetes complications, pregnancy complications\n\n*Alcohol:*\n• Palm Island has had alcohol restrictions and bans\n• \"Sly grogging\" (illegal alcohol sales) remains an issue\n• Binge drinking patterns when alcohol available\n• Association with family violence\n• Health impacts: liver disease, injury, mental health"
    },
    {
      "type": "section",
      "title": "Maternal and Child Health",
      "content": "**Challenges:**\n• Limited obstetric services on island\n• Must travel to Townsville for births\n• Separation from family and culture during birth\n• Higher rates of smoking during pregnancy\n• Gestational diabetes\n\n**Outcomes:**\n• Higher rates of low birth weight babies\n• Prematurity\n• Neonatal complications\n\n**Child Health Issues:**\n• Ear infections (leading to hearing loss and developmental delays)\n• Skin infections\n• Respiratory infections\n• Dental disease (\"bottle caries\")\n• Failure to thrive\n• Developmental delays\n\n**Health Services Response: Bwgcolman Healing Service**\n\n*Comprehensive Primary Care:*\n• General practice (GP services)\n• Nursing and allied health\n• Chronic disease management\n• Maternal and child health\n• Mental health support\n• Health promotion and prevention\n\n*Culturally Safe Care:*\n• Aboriginal Health Workers\n• Cultural protocols respected\n• Language services\n• Community engagement\n• Trauma-informed practice\n• Holistic approach integrating Western medicine with cultural practices\n\n*Integration with PICC Services:*\n• Primary health through Bwgcolman Healing Service\n• Mental health and counseling\n• Family violence response (Women's Healing Service)\n• Youth services\n• Early childhood programs\n• Social services and case management\n• Tackling Indigenous Smoking program"
    },
    {
      "type": "section",
      "title": "Healthy Eating Initiatives: Challenges",
      "content": "**Challenges to Healthy Eating on Palm Island:**\n\n• High food costs: Remote location requires barge transport; prices significantly higher than mainland\n• Limited availability: Fresh fruit, vegetables, and dairy have short shelf life; often unavailable\n• Poverty: Low incomes ($306/week median) limit purchasing healthy options\n• Overcrowded kitchens: Limited cooking facilities shared by 15-20 people; meal preparation difficult\n• Processed food prevalence: Longer shelf life, lower cost, and availability make processed foods default\n• Lost cultural foods: Bush tucker knowledge declining; access to traditional foods limited\n• Health literacy: Gaps in nutrition education and understanding"
    },
    {
      "type": "section",
      "title": "Healthy Eating Initiatives: Programs Implemented",
      "content": "**1. Early Childhood Nutrition Programs (PICC Early Childhood Services)**\n\n*Breastfeeding Support:*\n• Education and encouragement during pregnancy\n• Postnatal support and troubleshooting\n• Peer support networks\n• Integration with maternal health services\n\n*Infant Feeding Guidance:*\n• Introduction of solid foods education\n• Age-appropriate nutrition advice\n• Cultural foods for babies\n• Avoiding \"bottle caries\" (dental decay)\n\n*Playgroup Nutrition:*\n• Healthy food provided at playgroups\n• Modeling healthy eating for children\n• Parent education during sessions\n• Cultural foods incorporated\n\n*Cooking Skills Programs:*\n• Food preparation training for parents\n• Budget-friendly healthy cooking\n• Using limited facilities effectively\n• Cultural cooking practices\n\n**2. School-Based Nutrition (Palm Island State School)**\n\n*Breakfast Programs:*\n• Free breakfast for students\n• Ensures children start day with nutrition\n• Improves concentration and learning\n• Addresses food insecurity at home\n\n*Nutrition Education:*\n• Health and Physical Education curriculum\n• Practical food preparation skills\n• Understanding nutritional needs\n• Bush tucker education\n\n*Health Screening:*\n• Growth monitoring\n• Nutritional assessment\n• Early intervention for failure to thrive\n• Connection to health services\n\n**3. Community Food Initiatives**\n\n*PICC Community Shop:*\n• Only full-service supermarket on island\n• Essential groceries accessible locally\n• Social enterprise (profits support services)\n• Employment for local residents\n\n*Storm Recovery Food Distribution (February 2024):*\nDuring the devastating February 2024 floods, PICC implemented a Quality Food Distribution Network in partnership with Woolworths:\n• Organized food deliveries to affected families\n• Prioritized nutrition during crisis\n• Elder welfare checks included food security\n• Documented as innovation for replication\n\n*Bush Tucker Programs:*\n• Cultural playgroups incorporate traditional foods\n• School bush tucker excursions\n• Elder-led knowledge sharing\n• Connection to Country through food\n• Nutrition benefits of traditional diet\n\n**4. Maternal and Child Health Nutrition**\n\n*Antenatal Nutrition:*\n• Education during pregnancy\n• Folic acid and supplements\n• Managing gestational diabetes\n• Healthy weight during pregnancy\n\n*Postnatal Support:*\n• Breastfeeding support\n• Infant nutrition guidance\n• Maternal nutrition for recovery\n• Connection to ongoing services\n\n*Growth Monitoring:*\n• Regular well-child checks\n• Height, weight, and development tracking\n• Early identification of nutritional concerns\n• Intervention and referral"
    },
    {
      "type": "section",
      "title": "Healthy Eating: Outcomes and Ongoing Challenges",
      "content": "**Outcomes and Impact:**\n\nWhile comprehensive outcome data is limited, observed improvements include:\n• Increased breastfeeding initiation and duration\n• Better-nourished children in early childhood programs\n• Improved school attendance (breakfast programs)\n• Community awareness of nutrition importance\n• Cultural connection through traditional foods\n• Crisis response capacity (demonstrated in 2024 floods)\n\n**Ongoing Challenges:**\n• Structural cost issues: Freight costs remain fundamental barrier\n• Poverty: Income levels limit food choices regardless of knowledge\n• Housing: Overcrowding limits meal preparation capacity\n• Supply chain: Reliance on barge transport vulnerable to weather/disruption\n• Sustainability: Programs depend on ongoing funding"
    },
    {
      "type": "section",
      "title": "Programs for Children and Families (0-8 years)",
      "content": "**PICC Early Childhood Services**\n\n*Supported Playgroups:*\n• Baby and Toddler Groups (0-3 years): Sensory play, parent-child bonding, developmental milestones\n• Preschool Playgroups (3-5 years): School readiness, social skills, language development\n• Cultural Playgroups (All ages): Bush tucker, traditional stories, language, elder involvement\n\n*Parenting Programs:*\n• First Time Parents: Newborn care, safe sleep, bonding, recognizing developmental milestones\n• Positive Parenting: Evidence-based strategies, managing behavior, communication\n• Family Literacy: Reading with children, storytelling traditions, digital literacy\n\n*School Readiness (Age 4-5):*\n• Pre-literacy and pre-numeracy skills\n• Social and emotional readiness\n• Self-care and independence\n• School routine preparation\n\n*Child Development Services:*\n• Regular developmental screening\n• Early identification of delays\n• Referral to specialists (speech pathology, occupational therapy)\n• NDIS navigation and advocacy\n• Family support during assessment\n\n*Integrated Health Services:*\n• Partnership with Bwgcolman Healing Service\n• Maternal and child health checks\n• Immunization support\n• Growth monitoring\n• Nutrition programs\n• Mental health and wellbeing"
    },
    {
      "type": "section",
      "title": "Programs for Youth",
      "content": "**Palm Island State School**\n\n*Profile:*\n• Prep to Year 10 (ages 5-16)\n• Approximately 200 students\n• 98%+ Indigenous student population\n\n*Programs:*\n• Queensland curriculum with cultural integration\n• Bwgcolman language program (weekly lessons with elder teachers)\n• Cultural education (bush tucker, traditional craft, dance)\n• Learning support and special education\n• Wellbeing services (chaplaincy, guidance officer, breakfast program)\n\n*Transition Challenge:*\nStudents completing Year 10 must move to Townsville for Years 11-12, requiring:\n• Separation from family and community\n• Boarding school adaptation\n• Navigation of different cultural contexts\n• Ongoing connection support\n\n**PICC Youth Services**\n\n*Youth Engagement:*\n• After-school programs\n• School holiday activities\n• Positive peer groups\n• Adult mentorship\n\n*Sport and Recreation:*\n• Rugby league (dominant sport)\n• Basketball programs\n• Athletics and swimming\n• Cultural games\n• Leadership through sport\n\n*Mental Health Support:*\n• Counseling services\n• Peer support networks\n• Suicide prevention\n• Cultural healing integration"
    },
    {
      "type": "section",
      "title": "Programs for Women",
      "content": "**Women's Healing Service**\n\n*Services:*\n• Temporary accommodation for women experiencing domestic violence\n• Safe, secure environment\n• Case management and support\n• Connection to legal, housing, and health services\n• Children's needs addressed\n\n**Safe House**\n\n*Emergency Response:*\n• 24/7 emergency shelter\n• Immediate safety from violence\n• Crisis support\n• Pathway planning\n\n**Perinatal Mental Health**\n\n*Support Services:*\n• Screening for postnatal depression and anxiety\n• Counseling and treatment\n• Peer support groups\n• Trauma-informed care\n• Integration with maternal health"
    },
    {
      "type": "section",
      "title": "Programs for Men",
      "content": "**Men's Gathering**\n\n*Focus Areas:*\n• Mental health support in culturally safe environment\n• Cultural connection and identity\n• Peer support networks\n• Addressing trauma\n• Building positive masculinity\n\n**Movember Partnership**\n\nIn 2024, PICC secured a landmark $1.9 million, five-year partnership with Movember Foundation for men's mental health programs, developed during the February 2024 storm recovery response.\n\n*Program Elements:*\n• Men's recovery and mental health support\n• Cultural healing approaches\n• Peer support training\n• Employment and purpose\n• Crisis response capacity\n\n**Storm Recovery Men's Programs**\n\nDuring the February 2024 floods, PICC documented innovative approaches to engaging men:\n• Structured activities providing purpose during crisis\n• Elder men leading younger men\n• Cultural connection during trauma\n• Model for disaster response"
    },
    {
      "type": "section",
      "title": "Programs for Elders",
      "content": "**Elders Advisory Group**\n\n*Role:*\n• Cultural guidance to PICC Board and programs\n• Traditional knowledge transmission\n• Community leadership\n• Decision-making input\n• Cultural protocols oversight\n\n**Elder-Led Programs**\n\n*Cultural Education:*\n• Bwgcolman language teaching in schools\n• Cultural knowledge sharing with youth\n• Story and ceremony preservation\n• Bush tucker and medicine knowledge\n\n*Elder Welfare:*\n• Home visiting programs\n• Health monitoring\n• Food security checks\n• Connection to services\n• Isolation prevention\n\n**Elder-Led Recovery Governance**\n\nDuring the 2024 storm recovery, an innovative model emerged:\n• Elders directing recovery priorities\n• Traditional decision-making processes\n• Intergenerational respect maintained\n• Community cohesion during crisis"
    },
    {
      "type": "section",
      "title": "Key Innovation: Integrated Service Delivery Model",
      "content": "PICC's most significant innovation is the integration of health, family, and social services under one community-controlled organization:\n\n**\"No Wrong Door\" Approach:**\n• Entry through any service connects to all services\n• Case coordination across programs\n• Holistic family support\n• Reduced duplication and gaps\n\n**Local Workforce (95% Palm Islanders):**\n• Services delivered by community members\n• Cultural safety built in\n• Employment creates economic benefit\n• Knowledge stays in community\n• Trust and relationships\n\n**Key Outcome:** Significant reduction in the number of Aboriginal children being removed from families on Palm Island—demonstrating that community-controlled, integrated services can address child safety while keeping families together."
    },
    {
      "type": "stats",
      "title": "Digital Service Centre (June 2023)",
      "stats": [
        {"label": "Partner", "value": "Telstra", "description": "Major partnership"},
        {"label": "Current Staff", "value": "21", "description": "Capacity for 30"},
        {"label": "Languages", "value": "50+", "description": "Supported"},
        {"label": "Launch", "value": "June 16, 2023", "description": "Australia's first Indigenous community-owned call center"}
      ]
    },
    {
      "type": "section",
      "title": "Key Innovation: Digital Service Centre",
      "content": "**Australia's first Indigenous community-owned digital service centre**\n\n*Health and Wellbeing Impact:*\n• Employment reduces poverty (a key health determinant)\n• Household incomes increased\n• Purpose and routine support mental health\n• Skills development and career pathways\n• Community pride and confidence\n• Breaking stereotypes about remote Indigenous capability\n\n*Economic Model:*\n• Contract revenue from Telstra\n• Surplus supports other PICC services\n• Self-sustaining enterprise\n• Replicable model for other communities"
    },
    {
      "type": "section",
      "title": "Key Innovation: Storm Recovery Model (February 2024)",
      "content": "The February 2024 floods devastated Palm Island, destroying homes and displacing families. PICC's response became a documented innovation model:\n\n**Seven Innovation Programs:**\n\n1. Movember Men's Recovery Program - $1.9M secured for five years\n2. Experimental Collapsible Beds - Innovative emergency housing solutions\n3. Community-led Washing Machine Distribution - Practical support coordination\n4. Orange Sky Mobile Laundry Partnership - External partnership integration\n5. Quality Food Distribution Network (Woolworths) - Food security during crisis\n6. Elder-Led Recovery Governance - Traditional decision-making in emergency\n7. Systematic Story Documentation - 26 stories captured for learning\n\n**Policy Impact:**\n• Queensland Government disaster response protocols influenced\n• Replication by other Indigenous communities\n• Academic recognition and case study usage\n• Demonstration of community capacity"
    },
    {
      "type": "section",
      "title": "Current State: Governance and Services",
      "content": "**Governance Structure**\n\n*Palm Island Aboriginal Shire Council:*\n• Local government authority\n• Mayor: Alf Lacey\n• Deputy Mayor: Mersane Oui\n• Councillors include: Telstan Sibley, Germaine Bulsey, Ebanese Oui\n• Responsibilities: Infrastructure, roads, water, waste, community facilities\n\n*Palm Island Community Company (PICC):*\n• Community-controlled organization (since September 2021)\n• CEO: Rachel Atkinson\n• Chair: Luella Bligh\n• Largest employer on island (alongside Council and government services)\n• Delivers 16+ health and social services\n\n*Traditional Owner Representation:*\n• Manbarra people recognized as Traditional Owners\n• Wulgurukaba Yunbenun Aboriginal Corporation manages native title\n• Cultural authority maintained alongside contemporary governance\n\n**Services Delivered by PICC (16+):**\n\n*Health:* Bwgcolman Healing Service (primary health care), social and emotional wellbeing\n*Child and Family:* Family Wellbeing Centre, Safe House, Family Participation Program, Early Childhood Services\n*Community Support:* Women's Service, Men's Gathering, Youth Services, Elders Advisory Group\n*Social Enterprise:* Bakery, Fuel Station, Mechanics Workshop, Digital Service Centre (June 2023)"
    },
    {
      "type": "section",
      "title": "Current State: Infrastructure and Cultural Strength",
      "content": "**Infrastructure Challenges:**\n\n• Housing: 300-350 dwellings; 100+ shortfall; severe overcrowding\n• Transport: Barge facility, small airport (limited services), passenger ferry\n• Water: Reticulated supply; treatment plant; ongoing upgrade\n• Power: Diesel generators; solar installations emerging\n• Communications: Mobile coverage (Telstra); NBN satellite; digital divide remains\n\n**Cultural Strength**\n\n*Bwgcolman Language Revival:*\n• Weekly language lessons in schools\n• Elder language teachers\n• Community language classes\n• Documentation and preservation projects\n• Growing fluency among young people\n\n*Cultural Education:*\n• Integrated throughout school curriculum\n• Cultural playgroups for early childhood\n• Bush tucker and traditional medicine programs\n• Dance and performance groups\n\n*Land and Sea Rangers (Minggamingga):*\n• Environmental management combining traditional and Western knowledge\n• Marine monitoring in Great Barrier Reef World Heritage Area\n• Fire management using traditional burning\n• Feral animal control\n• Cultural heritage site protection\n• Employment and training for local residents"
    },
    {
      "type": "section",
      "title": "Closing the Gap: Progress and Challenges",
      "content": "**Relevant Targets from the National Agreement:**\n\n• Life Expectancy: Close gap → ~11 year gap persists\n• Child Mortality: Reduce deaths → Higher than average\n• Health Outcomes: Achieve parity → Significant disparities\n• Year 12 Completion: Increase to 96% → 15% completion rate\n• Employment: Increase rate → 29.1% unemployment\n• Housing: Eliminate overcrowding → 100+ household shortfall\n\n**Community-Led Progress:**\n\nWhile statistical gaps remain significant, Palm Island demonstrates community-led approaches that address root causes:\n\n*Self-Determination:*\n• PICC's transition to full community control (2021)\n• Community designing and delivering own services\n• Cultural authority in decision-making\n• Local employment strategy\n\n*Economic Development:*\n• Digital Service Centre creating jobs\n• Social enterprises building wealth\n• $5.8M in local wages annually\n• $9.75M economic output\n\n*Health System Transformation:*\n• Community-controlled primary health (Bwgcolman Healing Service)\n• Integration of health with social services\n• Cultural healing approaches\n• Aboriginal Health Workers from community\n\n*Early Investment:*\n• Comprehensive 0-8 years services\n• School readiness programs\n• Developmental screening and early intervention\n• Reduced child protection involvement\n\n*Cultural Strength:*\n• Language revival programs\n• Elder-led knowledge transmission\n• Connection to Country programs\n• Cultural identity development\n\n**The Challenge Ahead:**\n\nClosing the Gap on Palm Island requires sustained investment in:\n1. Housing: Eliminating the 100+ household shortfall\n2. Economic opportunity: More employment beyond current services\n3. Education: Pathways to Year 12 completion and beyond\n4. Health services: Specialist access, chronic disease management\n5. Infrastructure: Renewable energy, improved transport, digital access\n6. Cultural programs: Continued support for language and cultural revival"
    },
    {
      "type": "section",
      "title": "Future Directions: Health Priorities",
      "content": "**Chronic Disease Prevention:**\n• Diabetes prevention through nutrition and activity programs\n• Cardiovascular risk reduction\n• Early screening and intervention\n• Chronic disease management in community\n\n**Smoking Cessation:**\n• Tackling Indigenous Smoking program continuation\n• Community-wide campaigns\n• Support for pregnant women\n• Youth prevention\n\n**Mental Health and Trauma Healing:**\n• Expanded counseling services\n• Men's mental health programs (Movember partnership)\n• Youth suicide prevention\n• Intergenerational healing\n• Cultural approaches to wellbeing\n\n**Food Security and Nutrition:**\n• Advocacy for reduced food costs\n• Community garden development\n• Bush tucker programs expansion\n• School nutrition programs\n\n**Housing and Overcrowding:**\n• 100+ new homes needed\n• Renovation and maintenance\n• Pathways to home ownership\n• Design for climate and culture"
    },
    {
      "type": "section",
      "title": "Future Directions: PICC Strategic Goals",
      "content": "**Digital Service Centre Expansion:**\n• Grow from 21 to 30 employees\n• Add service contracts beyond Telstra\n• Training hub for region\n• Export model to other communities\n\n**New Social Enterprises:**\n• Renewable energy (solar farm, microgrid)\n• Cultural tourism ventures\n• Aquaculture and fishing enterprise\n• Construction and maintenance services\n• Creative industries and media production\n\n**Service Enhancement:**\n• Enhanced early childhood facilities\n• Expanded mental health services\n• Aged care development\n• Youth leadership programs\n\n**Infrastructure Development:**\n• Renewable energy transition\n• Digital infrastructure expansion\n• Community facilities upgrade\n\n**Long-Term Aspirations:**\n\n*Year 11-12 on Palm Island:*\n• Students currently must leave for secondary completion\n• Long-term goal: full secondary education on island\n• Maintaining family and cultural connection\n• Reducing education-related out-migration\n\n*Economic Self-Sufficiency:*\n• Diversified enterprise portfolio\n• Reduced dependence on government funding\n• Community wealth building\n• Local investment and ownership\n\n*Model for Other Communities:*\n• Share learnings and innovations\n• Support replication of successful programs\n• Advocate for policy change\n• Build regional Indigenous economy"
    },
    {
      "type": "stats",
      "title": "PICC Impact Summary (2024)",
      "stats": [
        {"label": "Total Staff", "value": "~197", "description": "Community employment"},
        {"label": "Local Workforce", "value": "95%", "description": "Palm Islanders"},
        {"label": "Annual Wages", "value": "$5.8M", "description": "Community wealth"},
        {"label": "Economic Output", "value": "$9.75M", "description": "Annual impact"}
      ]
    },
    {
      "type": "section",
      "title": "Source References",
      "content": "**Primary Documents in Repository:**\n• Palm Island History (Docs/Palm Island history.md): Traditional ownership, colonial history, resistance\n• PICC Leadership (Docs/PICC leadership.md): Organization history, governance, leadership profiles\n• Annual Reports 2009-2024: 15 years of organizational documentation\n• Knowledge Base Scripts: Health statistics, programs, census data\n\n**Government Sources:**\n• ABS Census 2021 (abs.gov.au): Demographics, income, education, housing\n• Queensland Government (qld.gov.au/firstnations): Community history, cultural heritage\n• Land and Sea Rangers (qld.gov.au/environment): Environmental programs\n\n**Health Data Sources:**\n• Australian Institute of Health and Welfare (AIHW)\n• Queensland Health\n• Closing the Gap Reports\n• PICC Service Data\n\n**Web Platform Resources:**\n• Services Directory (/wiki/services/): Current PICC services\n• Storm Recovery (/wiki/innovation/storm-recovery/): 2024 flood response innovations\n• Stories Collection (/stories/): Community narratives\n• Knowledge Graph (/wiki/graph/): Connected knowledge visualization\n\n*Document prepared: December 2024*\n\nThis document draws on community knowledge, official records, and organizational documentation to provide a comprehensive account of Palm Island's health and wellbeing journey. It is intended as a resource for community members, stakeholders, researchers, and policymakers committed to supporting Palm Island's continued path toward self-determination and improved health outcomes."
    }
  ]$JSON$::jsonb
);

COMMENT ON TABLE publications IS 'Interactive reports and publications for public viewing';
COMMENT ON COLUMN publications.content IS 'JSONB array of section objects for interactive display. Types: hero, section, stats, timeline, quote, image';
