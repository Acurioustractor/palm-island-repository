/**
 * Import Community Leaders and Environmental Programs
 *
 * Adds comprehensive entries for:
 * - Lex Wotton (community leader and activist)
 * - Mayor Alf Lacey (Palm Island Aboriginal Shire Council)
 * - The Magnificent Seven (1957 Strike Leaders)
 * - Minggamingga Land and Sea Rangers (detailed)
 * - Climate Change and Environmental Challenges
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
    slug: 'lex-wotton-community-leader',
    title: 'Lex Wotton: Community Leader and Activist',
    subtitle: 'Elder, activist, and advocate for justice',
    summary: 'Lex Wotton is an Aboriginal elder, two-time Palm Island councillor, and prominent activist who led the 2004 community uprising following Mulrunji Doomadgee\'s death in custody. After facing criminal charges, he successfully sued for racial discrimination, winning $220K and helping secure a $30M class action settlement for 447 community members.',
    content: `# Lex Wotton: Community Leader and Activist

## Overview
**Lex Wotton** is one of Palm Island's most prominent contemporary leaders—an **Aboriginal elder**, **activist**, **plumber by trade**, and **two-time Palm Island Aboriginal Shire Council councillor**. He is best known for leading the 2004 community response to the death of Cameron "Mulrunji" Doomadgee in police custody and his subsequent fight for justice.

## Personal Background

### Early Life
- **Born:** 1967/1968
- **Trade:** Qualified plumber
- **Community:** Lifelong Palm Island resident
- **Family:** Father, grandfather, community member

### Community Leadership
- **Palm Island Aboriginal Shire Council:** Elected councillor (two terms)
- **Community Elder:** Recognized leadership role
- **Activist:** Advocate for Indigenous rights and justice
- **Work:** Currently Work Supervisor at Palm Island Aboriginal Shire Council (as of recent years)

## The Mulrunji Case and 2004 Uprising

### November 19, 2004: Death in Custody

**Cameron "Mulrunji" Doomadgee**, age 36, died in police custody within an hour of being arrested for allegedly causing a public nuisance. Autopsy revealed:
- 4 broken ribs
- Ruptured liver (cleaved in two)
- Ruptured portal vein
- Injuries consistent with severe assault

**Police Version:** Senior Sergeant Chris Hurley claimed Mulrunji fell and suffered accidental injuries.

**Community Response:** Disbelief, anger, and demands for accountability.

### November 26, 2004: Community Uprising

**Seven days after Mulrunji's death**, Lex Wotton emerged as a spokesperson for community anger and grief.

**The Uprising:**
- Community gathered at police station demanding answers
- Frustration escalated into civil unrest
- Police station burned
- Courthouse damaged
- Police barracks set on fire
- Estimated damage: significant property destruction

**Wotton's Role:**
- Spoke for community's pain and anger
- Demanded justice and accountability
- Became face of community resistance
- Led calls for independent investigation

**Aftermath:**
- Queensland Police and riot squad deployed
- Community members arrested
- Lex Wotton charged with riot and inciting others

## Criminal Prosecution

### Charges Against Wotton

**Criminal Charges:**
- Riot
- Arson
- Inciting others to violence
- Additional offenses related to uprising

**Prosecution Strategy:**
- Wotton portrayed as ringleader
- Targeted for prosecution more severely than others
- Described by prosecutors as instigator
- Faced potential lengthy imprisonment

### 2008: Conviction and Imprisonment

**Trial Outcome:**
- Found guilty of riot-related charges
- **Sentenced:** 7 years imprisonment
- Served time in Queensland prison system
- Separated from family and community
- Prison term controversial and seen by many as unjust

**Community and Wider Support:**
- Supporters argued he was scapegoated
- Described as "political prisoner" by some
- Compared to Nelson Mandela by supporters
- National and international attention
- Rallies and campaigns for his release

## The Fight for Justice: Racial Discrimination Case

### Federal Court Action

**Legal Strategy:**
Wotton's legal team argued he was **targeted for prosecution because of his race** and his **prominent role in seeking justice** for Mulrunji.

**Racial Discrimination Claim:**
- Decisions to charge and prosecute motivated by racial bias
- More severe treatment than non-Indigenous defendants would receive
- Targeting of Indigenous community leader
- Disproportionate prosecution given circumstances
- Violation of Racial Discrimination Act 1975

### 2016-2018: Legal Victory

**Federal Court Finding:**
- Court found **racial discrimination** in prosecution decisions
- Wotton's treatment was influenced by his Aboriginality
- Targeting of community leader was unjust
- Landmark case for Indigenous justice

**Compensation:**
- Lex Wotton awarded **$220,000** in compensation
- Recognition of injustice suffered
- Vindication after years of fighting
- Validation of community's claims of discrimination

**National Significance:**
- Established precedent for racial discrimination in prosecution
- Demonstrated bias in justice system toward Indigenous Australians
- Validated Indigenous community concerns about policing
- Showed courage in fighting systemic discrimination

## Class Action Settlement

### $30 Million for 447 Community Members

**Broader Legal Action:**
Beyond his personal case, Wotton's leadership helped achieve:

**2018 Class Action Settlement:**
- **$30 million** settlement for Palm Island community
- **447 community members** received compensation
- Recognition of collective trauma and harm
- Damages for property destruction, trauma, and civil rights violations
- One of largest settlements for an Indigenous community

**Impact:**
- Financial compensation for those harmed
- Recognition of community pain
- Acknowledgment of failures in justice system
- Partial accountability achieved
- Community healing support

## Leadership and Legacy

### Community Leader

**Described as:**
- "Leader and saviour" by community members
- "Australia's Nelson Mandela" by supporters
- "Hero of Palm Island"
- "Champion for justice"
- "Fearless activist"

**Leadership Qualities:**
- Willingness to speak truth to power
- Courage in face of criminal prosecution
- Persistence through imprisonment and legal battles
- Advocacy for community over personal safety
- Inspiration to younger generation

### Ongoing Advocacy

**Current Work:**
- Work Supervisor, Palm Island Aboriginal Shire Council
- Continued community leadership
- Mentoring young people
- Advocating for justice and self-determination
- Speaking about experience when appropriate

**Issues Championed:**
- Deaths in custody (ongoing national issue)
- Police accountability
- Indigenous justice
- Community self-determination
- Healing and recovery
- Youth leadership

## Significance and Impact

### Deaths in Custody Awareness

Wotton's leadership brought **national and international attention** to:
- Aboriginal deaths in custody
- Lack of police accountability
- Racism in justice system
- Need for fundamental reform
- Community-led solutions

**Context:**
Since 1991 Royal Commission into Aboriginal Deaths in Custody:
- Over 500 Indigenous deaths in custody
- Minimal prosecutions or accountability
- Continued over-representation in incarceration
- Systemic failures unaddressed

Mulrunji's case and Wotton's advocacy **forced national conversation** about these issues.

### Palm Island Resistance Tradition

Wotton stands in **proud tradition** of Palm Island resistance:
- **1957 Strike:** The Magnificent Seven challenge oppressive regime
- **2004 Uprising:** Lex Wotton leads demand for justice
- **Ongoing:** Community continues self-determination struggle

### Inspiration to Others

**Impact on:**
- **Palm Island youth:** Role model for activism and courage
- **Indigenous communities nationally:** Example of fighting injustice
- **Justice advocates:** Demonstration that persistence can achieve results
- **General public:** Education about Indigenous experiences

## Controversies and Criticism

### Different Perspectives

**Supporters View Wotton as:**
- Hero and freedom fighter
- Scapegoat for systemic injustice
- Leader who stood up when silence would have been complicit
- Victim of racial discrimination
- Champion for accountability

**Critics Argued:**
- Property destruction was inexcusable
- Inciting riot endangered lives
- Law and order must be maintained
- Criminal conviction was appropriate
- Community uprising counterproductive

**Wotton's Position:**
- Grief and anger were legitimate responses
- Systemic injustice provoked uprising
- Community exhausted all other avenues
- Peaceful means had repeatedly failed
- Speaking out was moral imperative

### Complex Legacy

Wotton's story reflects:
- Moral complexity of resistance
- Injustice of a system that causes suffering then criminalizes response
- Courage required to challenge power
- Personal costs of activism
- Ultimate vindication through legal victory

## Personal Costs

### What Wotton Sacrificed

**Imprisonment:**
- 7 years away from family
- Separation from children during growth
- Loss of freedom and dignity
- Prison hardship and danger
- Ongoing criminal record

**Ongoing Impact:**
- Trauma from prosecution and imprisonment
- Financial costs of legal battles
- Personal relationships affected
- Health impacts from stress
- Years of life consumed by fight

**Yet:**
- Achieved justice and accountability
- Won racial discrimination case
- Helped community receive $30M
- Established legal precedent
- Inspired next generation

## Lessons from Lex Wotton's Story

### For Palm Island

- Leadership requires courage
- Justice is worth fighting for
- Community strength can overcome adversity
- Self-determination is achievable
- Resistance tradition continues

### For Australia

- Racial discrimination persists in justice system
- Deaths in custody require urgent action
- Indigenous voices must be heard
- Accountability matters
- Systemic change is necessary

### Universal Lessons

- Speaking truth to power is dangerous but necessary
- Justice delayed is justice denied
- Persistence can overcome injustice
- Individual courage can spark collective change
- Redemption and vindication are possible

## Current Status

**Today, Lex Wotton:**
- Lives and works on Palm Island
- Continues community leadership
- Elder and role model
- Advocate for justice
- Symbol of resistance and resilience

**Recognition:**
- Vindicated by Federal Court
- Respected community leader
- National profile
- Part of Indigenous justice history
- Ongoing influence

## How Lex Wotton Changed Palm Island

**Before 2004:**
- Deaths in custody rarely challenged
- Police accountability minimal
- Community voice suppressed
- National ignorance of conditions

**After Wotton's Leadership:**
- National attention on Palm Island
- Deaths in custody debates revitalized
- Racial discrimination in justice system exposed
- Community empowerment and pride
- Legal precedents established
- $30M in compensation achieved

## Honoring Lex Wotton

**Community Recognition:**
- Elder status
- Ongoing leadership respect
- Inclusion in community decisions
- Mentorship of youth
- Story part of community history

**Broader Recognition:**
- Subject of documentaries and media
- Academic research on case
- Legal precedent studied
- International human rights discussions
- Indigenous resistance canon

## Contact and Engagement

**Respecting Privacy:**
While Lex Wotton is a public figure due to his advocacy, he is entitled to privacy and respect. Any media, research, or content involving him should:
- Seek his permission and input
- Respect his perspective and voice
- Acknowledge his ongoing leadership
- Recognize community context
- Avoid exploitation or sensationalism

## Source
Wikipedia, court documents, news coverage, community knowledge`,
    entry_type: 'person',
    category: 'Community Leaders',
    keywords: ['Lex Wotton', 'Palm Island', 'activist', 'elder', 'Mulrunji', '2004 uprising', 'racial discrimination', 'justice', 'deaths in custody'],
    structured_data: {
      source: 'Public records, court documents, news coverage',
      birth_year: '1967-1968',
      occupation: 'Work Supervisor, Palm Island Aboriginal Shire Council',
      roles: ['Aboriginal elder', 'Community activist', 'Former councillor', 'Plumber'],
      major_events: [
        'Led 2004 uprising after Mulrunji death',
        'Convicted and imprisoned 2008 (7 years)',
        'Won racial discrimination case 2016-2018',
        'Awarded $220,000 compensation',
        'Helped achieve $30M class action for community'
      ],
      significance: 'Prominent Indigenous rights activist and community leader',
      federal_court_victory: true,
      compensation: 220000,
      class_action_achievement: 30000000,
      class_action_recipients: 447,
      living_person: true
    },
    fiscal_year: null,
    location_type: 'palm_island',
    is_public: true,
    is_verified: true
  },
  {
    slug: 'mayor-alf-lacey-palm-island-council',
    title: 'Mayor Alf Lacey and Palm Island Aboriginal Shire Council',
    subtitle: 'Local government leadership and community governance',
    summary: 'Mayor Alf Lacey leads the Palm Island Aboriginal Shire Council, established in 2005 under the Local Government Act. The Council provides local government services, advocates for community needs, and works toward self-determination and community development.',
    content: `# Mayor Alf Lacey and Palm Island Aboriginal Shire Council

## Overview
**Mayor Alf Lacey** leads the **Palm Island Aboriginal Shire Council**, the local government authority for Palm Island established January 1, 2005 under the Queensland Local Government (Community Government Areas) Act 2004.

## Palm Island Aboriginal Shire Council

### Establishment and Status

**Formation:**
- **January 1, 2005:** Palm Island Aboriginal Shire Council established
- **Legislation:** Local Government (Community Government Areas) Act 2004
- **Status:** Local government authority under Queensland law
- **Jurisdiction:** Palm Island and surrounding waters

**Historical Context:**
- Replaced earlier government structures
- Part of Queensland's Indigenous local government reform
- Transition from mission/reserve to self-government
- Milestone in self-determination journey

### Council Composition

**Current Leadership (as of recent years):**
- **Mayor:** Alf Lacey
- **Deputy Mayor:** Mersane Oui
- **Councillors:**
  - Telstan Sibley
  - Germaine Bulsey
  - Ebanese Oui
  - Mersane Oui (Deputy Mayor)
  - Others (roster changes with elections)

**Elections:**
- Held under Queensland local government election schedule
- Community members vote for Mayor and councillors
- Democratic representation
- Contested elections

### Council Responsibilities

**Local Government Services:**
- **Infrastructure:** Roads, water, waste, facilities
- **Community Services:** Libraries, parks, recreation
- **Planning:** Land use and development
- **Regulation:** Local laws and compliance
- **Economic Development:** Business support and job creation
- **Emergency Management:** Disaster preparedness and response

**Advocacy:**
- Represent community to State and Federal governments
- Negotiate funding and services
- Policy advocacy
- Partnership development
- Media and public relations

**Service Delivery:**
- Direct service provision
- Contract management
- Partnership coordination
- Community engagement
- Reporting and accountability

## Mayor Alf Lacey

### Leadership Role

**Responsibilities:**
- Chair Council meetings
- Community spokesperson
- Regional and state representation
- Partnership negotiations
- Strategic leadership
- Community engagement

**Regional Leadership:**
- **Deputy Chair:** North Queensland Regional Organisation of Councils (NQROC)
- **Regional Advocacy:** Part of 10-council regional body
- **Influence:** Voice for Palm Island in regional planning
- **Networks:** Connections with other councils and levels of government

### Key Initiatives Under Mayor Lacey's Leadership

**Tourism Development:**
- **Tourism Masterplan:** Secured $4.9M commitment from LNP government
- **Vision:** Sustainable cultural and environmental tourism
- **Community Benefit:** Employment and economic development
- **Cultural Control:** Community-led tourism models

**Centenary Celebrations (2018):**
- **100 Years:** Commemoration of Palm Island establishment (1918-2018)
- **Deadly Didge 'n' Dance Festival:** Cultural celebration
- **Community Pride:** Recognition of survival and resilience
- **National Attention:** Media coverage and visitor engagement

**Infrastructure Improvements:**
- Road paving and upgrades
- Water and sewerage improvements
- Community facilities enhancement
- Housing advocacy
- Renewable energy exploration

**Service Partnerships:**
- Queensland Government departments
- PICC (Palm Island Community Company)
- Health services
- Education providers
- Private sector partners

### Challenges Faced

**Resource Limitations:**
- Small rate base (limited local revenue)
- Dependence on government funding
- Infrastructure backlog
- Service delivery costs in remote location
- Limited staffing and capacity

**Complex Community Needs:**
- High unemployment
- Housing shortage and overcrowding
- Health disparities
- Social challenges
- Historical trauma
- Expectations for support and advocacy

**Government Relations:**
- Navigating State and Federal bureaucracy
- Funding uncertainty
- Policy changes and instability
- Service delivery gaps
- Balancing community needs with government requirements

**Climate and Environment:**
- Cyclone vulnerability
- Climate change impacts
- Infrastructure resilience
- Environmental protection
- Disaster preparedness

## Council Achievements

### Infrastructure Development

**Recent Improvements:**
- Majority of roads now paved (significant improvement)
- Water supply and sewerage upgrades
- Community facilities renovations
- Solar power installation (some facilities)
- Telecommunications improvements

**Ongoing Projects:**
- Housing development
- Renewable energy transition
- Recreation facilities
- Cultural centers
- Youth spaces

### Economic Development

**Employment:**
- Council is major employer on island
- Local procurement priorities
- Training and apprenticeships
- Business support
- Partnership facilitation

**Initiatives:**
- Support for PICC Digital Service Centre
- Small business development
- Cultural tourism planning
- Social enterprise support
- Regional economic collaboration

### Community Programs

**Service Delivery:**
- Sport and recreation programs
- Youth activities
- School holiday programs
- Community events
- Cultural celebrations
- Emergency response

**Partnerships:**
- PICC health and social services
- Education (Palm Island State School)
- Police and emergency services
- Cultural organizations
- Regional bodies

## North Queensland Regional Organisation of Councils (NQROC)

### Regional Collaboration

**NQROC Membership:**
- 10 member councils from North Queensland
- Regional planning and advocacy
- Resource sharing
- Joint projects
- Collective voice

**Mayor Lacey as Deputy Chair:**
- Leadership role beyond Palm Island
- Regional influence
- Policy development
- Advocacy platform
- Network building

**Benefits for Palm Island:**
- Access to regional resources
- Partnership opportunities
- Shared expertise
- Political influence
- Service improvements

## Community Governance Challenges

### Self-Determination vs. State Control

**Tensions:**
- Council has authority but limited resources
- State government retains significant control
- Funding tied to compliance
- Policy made off-island
- Balancing autonomy and partnership

**Progress:**
- Increasing community control over time
- Local decision-making capacity building
- Indigenous leadership development
- Community-designed programs
- Cultural governance integration

### Accountability

**To Community:**
- Elections every 4 years
- Community meetings and consultations
- Transparency and reporting
- Addressing community concerns
- Cultural protocols

**To Government:**
- Financial reporting and audits
- Service delivery standards
- Compliance with legislation
- Grant acquittals
- Performance monitoring

## Vision and Future Directions

### Community Aspirations

**Economic:**
- Full employment
- Thriving businesses
- Self-sufficiency
- Wealth creation
- Reduced welfare dependency

**Social:**
- Strong families and community
- Cultural pride and identity
- Health and wellbeing
- Education and opportunity
- Safety and justice

**Infrastructure:**
- Modern facilities and services
- Housing for all
- Sustainable energy
- Climate resilience
- Digital connectivity

**Governance:**
- Greater autonomy
- Community-controlled services
- Cultural governance
- Regional leadership
- National influence

### Strategic Planning

**Council Priorities:**
- Economic development and employment
- Housing and infrastructure
- Health and wellbeing
- Education and training
- Cultural preservation and celebration
- Environmental sustainability
- Climate adaptation

**Partnerships for Success:**
- State and Federal governments
- PICC and community organizations
- Private sector
- Academic institutions
- Regional councils
- Indigenous organizations nationally

## Significance

The Palm Island Aboriginal Shire Council and Mayor Lacey's leadership represent:
- **Self-Determination:** Community governing itself
- **Democracy:** Indigenous people voting and leading
- **Capacity:** Demonstrating governance competence
- **Advocacy:** Voice for community needs
- **Vision:** Working toward prosperous future
- **Resilience:** Overcoming historical oppression to self-govern

## Contact

**Palm Island Aboriginal Shire Council:**
- Website: www.palmcouncil.qld.gov.au
- Located on Palm Island
- Public inquiries welcome
- Community meetings and consultations
- Democratic and accountable

## Source
Palm Island Aboriginal Shire Council website, NQROC information, public records`,
    entry_type: 'person',
    category: 'Community Leaders',
    keywords: ['Alf Lacey', 'Mayor', 'Palm Island Aboriginal Shire Council', 'local government', 'NQROC', 'leadership', 'governance'],
    structured_data: {
      source: 'Palm Island Aboriginal Shire Council, NQROC',
      position: 'Mayor of Palm Island Aboriginal Shire Council',
      council_established: '2005-01-01',
      regional_role: 'Deputy Chair, NQROC',
      council_responsibilities: [
        'Infrastructure',
        'Community services',
        'Planning',
        'Economic development',
        'Advocacy',
        'Emergency management'
      ],
      major_initiatives: [
        'Tourism Masterplan ($4.9M)',
        '2018 Centenary celebrations',
        'Infrastructure improvements',
        'Regional collaboration'
      ],
      nqroc_member: true,
      living_person: true
    },
    fiscal_year: null,
    location_type: 'palm_island',
    is_public: true,
    is_verified: true
  },
  {
    slug: 'magnificent-seven-1957-strike-leaders',
    title: 'The Magnificent Seven: 1957 Strike Leaders',
    subtitle: 'Heroes who challenged oppression and inspired generations',
    summary: 'Willie Thaiday, Albie Geia, Eric Lymburner, Sonny Sibley, Bill Congoo, George Watson, and Gordon Tapau led the historic 1957 Palm Island Strike. Their courageous stand against oppressive conditions is now commemorated annually on June 9, a public holiday celebrating their resistance and legacy.',
    content: `# The Magnificent Seven: 1957 Strike Leaders

## Overview
**The Magnificent Seven** are the seven Aboriginal men who led the historic **1957 Palm Island Strike** (June 10-14, 1957), challenging the oppressive regime of Superintendent Roy Bartlam and demanding better treatment and conditions for Palm Island residents.

## The Seven Leaders

### 1. Willie Thaiday
**Role:** Strike leader and spokesperson
**Significance:** One of the primary organizers and voices of the strike
**Legacy:** Remembered as a fearless leader who stood up to authority

### 2. Albie Geia
**Role:** Strike organizer
**Significance:** Key figure in mobilizing community
**Legacy:** Symbol of collective resistance

### 3. Eric Lymburner
**Role:** Strike participant and leader
**Significance:** Demonstrated courage in face of consequences
**Legacy:** Inspiration to future generations

### 4. Sonny Sibley
**Role:** Strike leader
**Significance:** Active in organizing and maintaining strike
**Legacy:** Family name continues in Palm Island leadership

### 5. Bill Congoo
**Role:** Strike participant
**Significance:** Part of leadership collective
**Legacy:** Remembered for bravery and commitment

### 6. George Watson
**Role:** Strike leader
**Significance:** Contributed to strike organization and execution
**Legacy:** Hero of Palm Island resistance

### 7. Gordon Tapau
**Role:** Strike participant and leader
**Significance:** One of the seven who faced punishment
**Legacy:** Part of honored tradition of resistance

## The 1957 Palm Island Strike

### Context: Life Under Superintendent Bartlam

**Palm Island in 1957:**
- Government-controlled "Aboriginal Reserve"
- Residents had no rights or freedoms
- Superintendent Roy Bartlam ruled with absolute authority
- Oppressive conditions and harsh punishments
- Forced labor
- Families could be separated at will
- No wages or minimal wages for work
- Inadequate food, housing, and medical care
- Children removed without parent consent
- Degrading and racist treatment

**Bartlam's Regime:**
- Described as authoritarian and cruel
- Arbitrary punishments
- Controlling all aspects of residents' lives
- Abuse of power
- Creating atmosphere of fear and oppression

### The Strike: June 10-14, 1957

**Beginning:**
- **June 10, 1957:** Strike declared
- Community members refused to work
- Demanded better conditions and treatment
- Challenged Superintendent's authority
- Peaceful but defiant

**Duration:** 5 days of sustained resistance

**Demands:**
- End to oppressive treatment
- Better wages
- Improved food and rations
- Respect and dignity
- Fair treatment
- End to arbitrary punishments

**Community Support:**
- Broad community participation
- Men, women, and children standing together
- Unified resistance
- Collective courage

### Government Response

**Immediate:**
- Police and government officials deployed
- Strike broken by force and intimidation
- Leaders identified for punishment
- Threats of further reprisals

**Punishment of the Leaders:**
- **The Magnificent Seven and their families were forcibly removed from Palm Island**
- Exiled to different reserves and missions across Queensland
- Families separated and scattered
- Homes and possessions left behind
- Collective punishment designed to break community spirit

**Message to Community:**
- Resistance will be punished severely
- Leaders will be made examples
- Families will suffer for standing up
- Attempt to crush future resistance

## Legacy and Impact

### Immediate Impact

**Despite Defeat:**
- Strike was broken and leaders exiled
- Conditions did not immediately improve
- Government control remained absolute
- Fear and oppression continued

**But Seeds Were Planted:**
- Community demonstrated capacity for collective action
- Leadership and courage were shown
- Resistance was possible
- Unity and strength were proven

### Long-Term Significance

**Inspiring Future Resistance:**
- The 1957 Strike became legendary
- Story passed down through generations
- Inspired later activism and advocacy
- Demonstrated that Palm Island people would not accept oppression forever

**Connection to Later Events:**
- **2004 Uprising:** Echoes of 1957 in community response to Mulrunji's death
- Continuous tradition of resistance
- Community memory of standing up to injustice
- Pride in resistance heritage

**Path to Self-Determination:**
- Strike part of long journey from government control to self-government
- Contributed to changing attitudes and policies
- Evidence used in advocacy for rights and freedoms
- Symbol of journey from oppression to autonomy

## Commemoration

### June 9 Public Holiday

**Annual Recognition:**
- **June 9** is now a **public holiday on Palm Island**
- Commemorates the Magnificent Seven and 1957 Strike
- Day of remembrance and celebration
- Community events and gatherings
- Education for younger generations
- Honoring resistance and resilience

**Significance:**
- One of few Indigenous-specific public holidays in Australia
- Official recognition by Queensland Government
- Palm Island community's choice to honor this history
- Ongoing reminder of importance of standing up for rights

### Community Celebrations

**Annual Events:**
- Community gatherings on June 9
- Storytelling and history sharing
- Cultural performances
- Recognition of descendants
- Education programs for youth
- Media coverage and awareness

**Elders' Role:**
- Sharing memories and stories
- Connecting past to present
- Teaching younger generations
- Keeping history alive
- Honoring the Seven and their families

## The Magnificent Seven in Context

### Palm Island Resistance Tradition

**Before 1957:**
- Countless individual acts of resistance
- Escape attempts
- Refusal to comply
- Subtle and covert resistance
- Survival itself as resistance

**1957 Strike:**
- **First major collective organized resistance**
- Public and defiant
- Leadership and unity
- Risk and sacrifice
- National attention

**After 1957:**
- Continuing advocacy and activism
- 2004 Uprising (Mulrunji)
- Ongoing self-determination struggle
- Pride in resistance legacy

### National Indigenous Resistance

**Part of Broader Movement:**
- 1960s: Wave Hill Walk-Off (1966)
- 1970s: Aboriginal Tent Embassy (1972)
- 1980s-90s: Land rights and native title campaigns
- 2000s: Apology and reconciliation movements
- Ongoing: Self-determination and treaty discussions

**Significance:**
- Palm Island Strike predates many famous Indigenous rights moments
- Early example of organized collective resistance
- Influenced broader movements
- Demonstrated Indigenous people's refusal to accept oppression

## Descendants and Family Legacy

### Family Pride

**Descendants of the Magnificent Seven:**
- Carry family names with pride
- Stories told and retold in families
- Inspiration to continue advocacy
- Connection to heroic legacy
- Responsibility to honor sacrifice

**Community Recognition:**
- Families respected and honored
- Descendants often in leadership roles
- Continuing tradition of service
- Living legacy of courage

### Passing Down the Story

**Intergenerational Transmission:**
- Elders telling grandchildren
- School education programs
- Community events
- Documentaries and media
- Written histories
- Oral tradition preservation

## Lessons from the Magnificent Seven

### For Palm Island

**Community Lessons:**
- Unity and collective action are powerful
- Standing up to injustice is necessary
- Courage can come from ordinary people
- Resistance has costs but is worthwhile
- History shapes identity
- Pride in ancestors' bravery

### For Australia

**National Lessons:**
- Indigenous people resisted oppression throughout history
- Government policies caused immense suffering
- Courage and leadership existed even under extreme oppression
- Recognition and commemoration matter
- Historical truth must be acknowledged
- Resistance is part of Australian history

## The Price of Resistance

### What the Magnificent Seven Lost

**Immediate Costs:**
- Exile from home and community
- Separation from extended family
- Loss of homes and possessions
- Dispersal to different locations
- Ongoing surveillance and punishment
- Years away from Palm Island

**Long-Term Impact:**
- Families separated for extended periods (or permanently)
- Children growing up away from culture
- Lost time in community
- Trauma from punishment
- Ongoing disadvantage from displacement

**What They Gained:**
- Historical significance and honor
- Inspiration to community
- Symbol of resistance
- Pride in standing up
- Legacy for descendants
- Part of social justice history

## Recognition and Honors

### Official Recognition

**Queensland Government:**
- June 9 public holiday established
- Statements honoring the Seven
- Educational materials
- Historical markers
- Public commemoration support

**Palm Island Community:**
- Annual celebrations
- Storytelling and education
- Naming of buildings and places
- Artistic representations
- Continuing honors

### Cultural Representations

**Media and Arts:**
- Documentaries featuring the strike
- Academic research and publications
- News articles and historical accounts
- Community artworks
- Musical tributes
- Theatrical performances (potential)

## Historical Significance

### Why the 1957 Strike Matters

**Labor History:**
- Early example of Indigenous strike action
- Resistance to exploitative labor conditions
- Collective bargaining even without legal rights
- Trade union solidarity (later)

**Indigenous Rights:**
- Assertion of dignity and humanity
- Rejection of racist oppression
- Demand for respect and fair treatment
- Part of long struggle for recognition

**Palm Island Identity:**
- Defining moment in community history
- Source of collective pride
- Resistance tradition established
- Identity as people who won't be oppressed

**Australian History:**
- Evidence of Indigenous agency and resistance
- Challenge to historical narratives of passive victimhood
- Reminder of oppressive government policies
- Part of journey toward reconciliation

## The Magnificent Seven Today

**Living Memory:**
- Some descendants and community members alive who remember
- Oral histories preserved
- Elders share firsthand or second-hand accounts
- Living connection to history

**Contemporary Relevance:**
- Inspiration for current activism
- Model for standing up to injustice
- Pride in resistance heritage
- Ongoing fight for self-determination
- Connection between past and present struggles

## Honoring the Magnificent Seven

### How Community Honors Them

**Annual June 9:**
- Public holiday
- Community gatherings
- Storytelling and education
- Cultural performances
- Family recognitions
- Reflection and celebration

**Ongoing Recognition:**
- Names spoken with respect
- Stories told to children
- Included in community history
- Artistic representations
- Educational curricula
- Pride in legacy

### How Visitors Can Show Respect

**Respectful Engagement:**
- Learn the history
- Recognize the sacrifice
- Acknowledge the courage
- Understand the context
- Respect the community's commemoration
- Support ongoing self-determination

## Conclusion: The Enduring Legacy

**The Magnificent Seven** represent:
- **Courage:** Standing up despite knowing the cost
- **Unity:** Collective action for collective good
- **Resistance:** Refusing to accept oppression
- **Sacrifice:** Paying the price for principle
- **Inspiration:** Motivating future generations
- **Pride:** Source of community identity
- **Hope:** Evidence that resistance is possible

Their story is **Palm Island's story**—survival, resistance, resilience, and the ongoing journey toward justice and self-determination.

## Source
Australian Trade Union Institute, Queensland Government records, community oral histories, academic research`,
    entry_type: 'person',
    category: 'Historical Figures',
    keywords: ['Magnificent Seven', '1957 strike', 'Palm Island', 'Willie Thaiday', 'resistance', 'June 9', 'public holiday', 'Aboriginal rights', 'Roy Bartlam'],
    structured_data: {
      source: 'Historical records and community oral histories',
      leaders: [
        'Willie Thaiday',
        'Albie Geia',
        'Eric Lymburner',
        'Sonny Sibley',
        'Bill Congoo',
        'George Watson',
        'Gordon Tapau'
      ],
      event_date: '1957-06-10',
      event_end_date: '1957-06-14',
      duration_days: 5,
      outcome: 'Strike broken, leaders exiled',
      commemoration: 'June 9 public holiday',
      significance: 'First major organized resistance on Palm Island',
      legacy: 'Inspiration for future resistance and self-determination',
      public_holiday: true
    },
    date_from: '1957-06-10',
    date_to: '1957-06-14',
    date_precision: 'exact',
    fiscal_year: null,
    location_type: 'palm_island',
    is_public: true,
    is_verified: true
  }
]

// Continue in next file...

async function main() {
  console.log('🚀 Starting Leaders and Environment import...')

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
