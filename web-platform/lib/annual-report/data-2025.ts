/**
 * PICC Annual Report FY24-25 — verified data source.
 *
 * Single source of truth for the 2024-25 report.
 *
 * Reconciled from:
 *   - PICC-2024-25-Services-Overview-FINAL.md (Narelle walkthrough 28 Apr 2026, 24 services)
 *   - PICC-2024-25-BRAND-BOOK.md (vision, grammar, libraries)
 *   - PICC-2024-25-CEO-Message-DRAFT.md (Rachel)
 *   - PICC-2024-25-Chair-Message-DRAFT.md (Luella)
 *   - PICC-2024-25-MASTER-REPORT.md
 *   - PICC-2024-25-STORIES-AND-VISUAL-PACK.md
 *
 * Use `getReportData2025()` to get the full report data shape.
 */

import type { ReportData } from './fetch-report-data'

const POOL = '/report-assets/2024-25-pool'
const SHARED = `${POOL}/_shared`
const VIDEO = '/hero-assets/clips'

// ============================================================================
// Statistics — FY24-25 (preliminary; FY23-24 audited where marked)
// ============================================================================

export const STATS_2025 = [
  { id: 'st-001', category: 'workforce', stat_label: 'Total Staff', stat_value: '~210', stat_unit: 'people', stat_description: 'Across 24 services. 75% Indigenous, 70% Palm Island resident. (FY24-25 preliminary, pending audit)', icon_name: 'Users', is_key_metric: true, display_order: 1 },
  { id: 'st-002', category: 'service_delivery', stat_label: 'Active Services', stat_value: '24', stat_unit: 'services', stat_description: 'Across 8 categories — Children & Families, Health & Wellbeing, Justice & Safety, Youth, Economic, Education & Community.', icon_name: 'Layers', is_key_metric: true, display_order: 2 },
  { id: 'st-003', category: 'governance', stat_label: 'In Queensland', stat_value: '1st', stat_unit: '', stat_description: 'PICC granted Delegated Authority for child protection — first ATSICCO in Queensland under Child Protection Act 1999, Part 2A.', icon_name: 'Award', is_key_metric: true, display_order: 3 },
  { id: 'st-004', category: 'health', stat_label: 'Episodes of Care', stat_value: '17,488', stat_unit: 'episodes', stat_description: 'Bwgcolman Healing Service · FY23-24 audited (FY24-25 figures pending)', icon_name: 'Activity', is_key_metric: true, display_order: 4 },
  { id: 'st-005', category: 'family', stat_label: 'Placement Nights', stat_value: '6,698', stat_unit: 'nights', stat_description: 'Family Care Service · kept with kin, on Country · FY23-24 audited', icon_name: 'Home', is_key_metric: true, display_order: 5 },
  { id: 'st-006', category: 'service_delivery', stat_label: 'NDIS Service Growth', stat_value: '3×', stat_unit: 'multiplier', stat_description: 'NDIS Services tripled in FY24-25 — ~15 staff across Townsville and Palm. Includes home care + elder care.', icon_name: 'TrendingUp', is_key_metric: true, display_order: 6 },
  { id: 'st-007', category: 'financial', stat_label: 'Total Income', stat_value: '~$23.4M', stat_unit: 'AUD', stat_description: 'FY24-25 preliminary, pending Mark sign-off. Audited figures land before print.', icon_name: 'DollarSign', is_key_metric: true, display_order: 7 },
  { id: 'st-008', category: 'service_delivery', stat_label: 'Blue Card Notices', stat_value: '~20', stat_unit: 'per month', stat_description: 'Blue Card Liaison Service — pilot launched July 2024. Funding cliff 30 June 2026.', icon_name: 'KeyRound', is_key_metric: true, display_order: 8 },
  // Secondary stats
  { id: 'st-009', category: 'health', stat_label: 'Clients Served', stat_value: '2,283', stat_unit: 'people', stat_description: 'Bwgcolman Healing Service · 1,935 First Nations clients · FY23-24 audited', icon_name: 'Users', is_key_metric: false, display_order: 9 },
  { id: 'st-010', category: 'service_delivery', stat_label: 'DSC Operators', stat_value: '21', stat_unit: 'Palm Islanders', stat_description: 'Digital Service Centre with Telstra · ~50 First Nations languages supported. Pilot ended Jan 2025.', icon_name: 'Headphones', is_key_metric: false, display_order: 10 },
  { id: 'st-011', category: 'family', stat_label: 'Safe House Nights', stat_value: '1,439', stat_unit: 'nights', stat_description: 'On-Country, family-staffed residential out-of-home care · FY23-24 audited', icon_name: 'Shield', is_key_metric: false, display_order: 11 },
  { id: 'st-012', category: 'youth', stat_label: 'Young People Supported', stat_value: '~380', stat_unit: 'people', stat_description: 'Youth Services + Safe Haven combined. 15 staff. Christmas Cup under-15s.', icon_name: 'Sparkles', is_key_metric: false, display_order: 12 },
] as const

// ============================================================================
// Board Members — historical roster + recent (will need post-Nov-2025 AGM confirmation)
// ============================================================================

const BOARD_PHOTO_BASE = '/icons/picc/photos/board/'

export const BOARD_MEMBERS_2025 = [
  { id: 'bd-01', full_name: 'Luella Bligh', position: 'Chair · Member-elected · Bwgcolman', bio: 'Chair of the Board. Long-standing Bwgcolman leader.', photo_url: '/icons/picc/photos/luella-bligh.jpg', display_order: 1 },
  { id: 'bd-02', full_name: 'Rhonda Phillips', position: 'Director · Member-elected', bio: null, photo_url: BOARD_PHOTO_BASE + 'rhonda-phillips.jpg', display_order: 2 },
  { id: 'bd-03', full_name: 'Allan Palm Island', position: 'Director · Traditional Owner-nominated · Manbarra', bio: 'Manbarra Traditional Owner.', photo_url: '/icons/picc/photos/voices/allan-palm-island.jpg', display_order: 3 },
  { id: 'bd-04', full_name: 'Matthew Lindsay', position: 'Director · Company Secretary', bio: null, photo_url: BOARD_PHOTO_BASE + 'matthew-lindsay.jpg', display_order: 4 },
  { id: 'bd-05', full_name: 'Harriet Hulthen', position: 'Director · Skills-appointed', bio: null, photo_url: BOARD_PHOTO_BASE + 'harriet-hulthen.jpg', display_order: 5 },
  { id: 'bd-06', full_name: 'Raymond W. Palmer Snr', position: 'Director · Member-elected', bio: null, photo_url: '/icons/picc/photos/voices/raymond-w-palmer-snr.jpg', display_order: 6 },
  { id: 'bd-07', full_name: 'Cassie Lang', position: 'Director · Member-elected', bio: null, photo_url: '/icons/picc/photos/voices/cassie-lang.jpg', display_order: 7 },
] as const

// ============================================================================
// Leadership Messages — from CEO + Chair drafts (28 April 2026)
// ============================================================================

export const LEADERSHIP_2025 = [
  {
    id: 'ldr-ceo',
    role: 'ceo',
    person_name: 'Rachel Atkinson',
    person_title: 'Chief Executive Officer',
    message_title: "A message from our CEO",
    message_content: `This year, for the first time in Queensland, decisions about Palm Island children sit with Palm Island people.

Bwgcolman Way went live. The Child Protection Act now lets our community make the calls — through our Bwgcolman blueprint, Reclaiming our Storyline. Decades of work behind it. Our team standing in front of it. And our children, finally, at the centre of it.

It is a moment I have been waiting for since 2007.

Eighteen years ago I started in this role with one belief: that PICC has to be of Palm Island, not just on it. That has not changed. What has changed is the size of what we can now do because of it.

This year we are 24 services. About 210 staff. Three out of four are Indigenous. Seven out of ten live on Palm. That is not a statistic to me — that is what community control actually looks like when you let it grow. Most of every PICC dollar pays a Palm Islander to deliver a service to another Palm Islander. That is how generational change happens. Not in a single budget cycle. In thousands of small, daily acts of work.

The First 1,000 Days Program opened its doors in April 2024 — a child health nurse, an Aboriginal health worker, and a GP, walking alongside families from before a baby is born to age two. The Blue Card Liaison Service ran its first full year as a pilot — around twenty positive notices a month. Doors that were shut, opening.

Bwgcolman Healing Service — the name our Elders chose — held its accreditation, ran 17,488 episodes of care, and kept doing what it does best: meeting people where they are.

Our daycare team rebuilt the Children and Family Centre after the floods took the equipment and damaged the building. Not "rebuilt" as in restored. Rebuilt as in came back stronger. Hailey and her team are the reason. Our NDIS service has tripled. The Digital Service Centre finished its pilot with Telstra and twenty-one Palm Islanders on the floor. Ferdy's Haven has, for the first time in over thirty years, opened its men's groups alongside its women's groups.

In May we launch our own PIC Leadership Program — designed by our staff, for our staff. The most important investment Year 17 made.

In October 2027 PICC turns twenty. Our children are our future. They are our ancestors of tomorrow. We've gotta make it right for them.`,
    message_excerpt: "This year, for the first time in Queensland, decisions about Palm Island children sit with Palm Island people.",
    featured_quote: "Working with the community, not for the community.",
    photo_url: '/icons/picc/photos/rachel-atkinson.jpg',
    display_order: 1,
  },
  {
    id: 'ldr-chair',
    role: 'chair',
    person_name: 'Luella Bligh',
    person_title: 'Chair of the Board',
    message_title: "A message from our Chair",
    message_content: `PICC belongs to the community.

That sentence is the whole of it, and the whole of why this year matters. In 2021 the community took ownership of this organisation in full. In 2024-25 the community took ownership of decisions about our own children. Bwgcolman Way is now law on Palm Island — the first time in Queensland that an Aboriginal and Torres Strait Islander Community Controlled Organisation has been granted Delegated Authority for child protection.

Distant governments telling Palm Island what to do and how to do it has never worked and will never work. This year is the proof.

The Board's job is to keep PICC sharp, accountable, and ours. This year that meant standing behind Bwgcolman Way as it went live. Holding the line on local employment — three out of four PICC staff are Indigenous, seven out of ten live on Palm. We do not move on these numbers. They are the point.

The Board backed two new launches: the First 1,000 Days Program in April 2024, and the Blue Card Liaison Service pilot in July 2024. Both are about removing the barriers that have stopped Palm Island families from being able to look after Palm Island children. The Board approved the PIC Leadership Program that begins next month — designed by our own people, for our own people. The next twenty years of PICC leadership starts here.

The positive changes we strive for are becoming evident — particularly among our young people, who are beginning to feel a sense of optimism about the future of Palm Island. I see it at the Daycare. I see it in the boys playing organised footy for the first time. I see it in the women coming back to Country with our Elders.

In October 2027, PICC turns twenty. We will mark that milestone honestly. Twenty years of work. Twenty years of community control fought for and earned. And twenty more ahead.`,
    message_excerpt: "PICC belongs to the community.",
    featured_quote: "We do not move on these numbers. They are the point.",
    photo_url: '/icons/picc/photos/luella-bligh.jpg',
    display_order: 2,
  },
] as const

// ============================================================================
// Highlights — FY24-25 verified from master report + brand book
// ============================================================================

export const HIGHLIGHTS_2025 = [
  {
    id: 'hl-bwgcolman-way',
    highlight_type: 'historic_milestone',
    title: 'Bwgcolman Way · Delegated Authority went live',
    subtitle: 'First ATSICCO in Queensland',
    description: 'In 2024-25, the Child Protection Act 1999 was used in a way it has never been used on Palm Island before. Under Part 2A — prescribed delegates for Aboriginal or Torres Strait Islander children — the Queensland Government delegated statutory child-protection functions to the Chief Executive of an Aboriginal and Torres Strait Islander Community Controlled Organisation. PICC became the first ATSICCO in Queensland to receive that authority. Decisions about whether a Palm Island child is removed, where they are placed, and how their family stays connected to them are no longer made by the state director of child safety in Brisbane. They are made on Palm Island. By Palm Islanders.',
    impact_achieved: 'Without DA: child to mainland residential care. With DA: child stays with grandmother on Palm. Cultural authority embedded alongside statutory compliance. PICC named as a Promising Practice case study by the Centre of Excellence at QATSICPP.',
    metrics: { authority: 'first in Queensland', funding_context: '$107.8M statewide commitment', legislation: 'Child Protection Act 1999, Part 2A', team_size: 10 },
    is_featured: true,
    display_order: 1,
    display_style: 'hero',
    section: 'childrenFamilies',
    video_url: `${VIDEO}/daycare-celebration.mp4`,
    photo_url: '/hero-assets/stills/kids-beach-palm.jpg',
  },
  {
    id: 'hl-cfc-rebuild',
    highlight_type: 'community_resilience',
    title: 'CFC daycare rebuild after the floods',
    subtitle: 'The team is the building',
    description: 'The Children and Family Centre arrived on Palm Island by barge in June 2012. The CFC is the front door of PICC family services — early childhood, primary health, family support, all under one roof. In late 2023 and early 2024, severe weather and flooding damaged the building and destroyed equipment. The rebuild is the story of FY24-25. The team came back. Not "rebuilt" as in restored. Rebuilt as in came back stronger.',
    impact_achieved: 'CFC reopened fully equipped, fully staffed. Local employment is what made the rebuild possible. Outside contractors would not have been on hand the day the water dropped.',
    metrics: { lead: 'Hailey Jane Wetzel · CFC Manager', services_held: 'Early childhood + family support + primary health' },
    is_featured: true,
    display_order: 2,
    display_style: 'card',
    section: 'childrenFamilies',
    video_url: `${VIDEO}/daycare-playground.mp4`,
    photo_url: '/hero-assets/stills/daycare-graduation.jpg',
  },
  {
    id: 'hl-first-1000-days',
    highlight_type: 'service_launch',
    title: 'First 1,000 Days Program launched',
    subtitle: 'From conception to age two — wraparound, on Palm',
    description: 'In April 2024, just before this fiscal year began, PICC opened the doors on the First 1,000 Days Program. A child health nurse, an Aboriginal health worker, and a GP, working alongside the Bwgcolman Healing Service, walking with families through the most formative period of a child\'s life. The framing comes from Professor Kerry Arabena\'s 2014 Medical Journal of Australia paper — the founding text of First 1000 Days Australia. We adopted the model and built the Palm Island version.',
    impact_achieved: 'First full year of operation. Wraparound model from antenatal through age 2. Linked into Bwgcolman Healing for clinical care, immunisation, child health checks. Linked into the CFC for warm-handover to early childhood education.',
    metrics: { launched: 'April 2024', team: 'Child Health Nurse + AHW + GP', linked: 'BHS + CFC' },
    is_featured: true,
    display_order: 3,
    display_style: 'card',
    section: 'healthWellbeing',
    photo_url: '/icons/picc/photos/feature-first-1000-days/01.jpg',
  },
  {
    id: 'hl-bhs-rename',
    highlight_type: 'community_naming',
    title: 'Bwgcolman Healing Service · the name our Elders chose',
    subtitle: 'Renamed January 2024 after community consultation',
    description: 'In January 2024, after extensive consultation with the Elders\' Advisory Group, the Primary Health Centre was renamed the Bwgcolman Healing Service. Bwgcolman — many tribes, one people. Healing — what we do, in the way our people understand the word. The renaming was symbolic. The work behind it is not. RACGP Quality Practice accreditation held to 2027.',
    impact_achieved: 'A name is not cosmetic. The name our Elders chose changed how the clinic is felt by community.',
    metrics: { renamed: 'January 2024', accreditation: 'RACGP to 2027', staff: 35, episodes_FY23_24: '17,488' },
    is_featured: true,
    display_order: 4,
    display_style: 'card',
    section: 'healthWellbeing',
    photo_url: '/icons/picc/photos/feature-bwgcolman-healing/01.jpg',
  },
  {
    id: 'hl-blue-card',
    highlight_type: 'pilot_launch',
    title: 'Blue Card Liaison Service · pilot first full year',
    subtitle: 'Doors that were shut, opening',
    description: 'Pilot launched in July 2024 in partnership with Blue Card Services (Qld Govt). Walk-in and virtual support to navigate the Working with Children Check. Around twenty positive notices a month — twenty community members each month walking out with the right to work with kids, take on kinship care, volunteer. Funding cliff 30 June 2026.',
    impact_achieved: '~240 positive notices across the pilot year. Critical barrier-reduction service for community members previously deterred by the eligibility assessment process.',
    metrics: { launched: 'July 2024', notices_per_month: '~20', funding_cliff: '30 June 2026' },
    is_featured: true,
    display_order: 5,
    display_style: 'card',
    section: 'educationCommunity',
  },
  {
    id: 'hl-ndis-tripled',
    highlight_type: 'service_expansion',
    title: 'NDIS Services tripled',
    subtitle: 'Closer to clients, more meaningful access',
    description: 'NDIS service grew threefold in FY24-25. ~15 staff across Townsville and Palm. Aitkenvale office opened February 2024 supporting Townsville-based clients. Service now includes home care packages and elder care support — a real bridge into the missing aged-care piece on Palm.',
    impact_achieved: 'Q2→Q3 access support went from 70 to 209 — tripling of meaningful access in two quarters.',
    metrics: { growth: '3×', staff: 15, locations: 'Townsville + Palm', new_office: 'Aitkenvale Feb 2024' },
    is_featured: true,
    display_order: 6,
    display_style: 'card',
    section: 'educationCommunity',
  },
  {
    id: 'hl-leadership-program',
    highlight_type: 'design_milestone',
    title: 'PIC Leadership Program designed',
    subtitle: 'Designed by us, for us',
    description: "PICC's own, in-house, accredited leadership program — designed by PICC staff, for PICC staff. Initiated in 2024-25 by the existing leadership group. Co-designed with staff across services. Funded by DSS. First cohort begins May 2026, running across two to three years with multiple cohorts of emerging leaders.",
    impact_achieved: "The most important investment Year 17 made. Strictly, the program launches in May 2026 — but every hour of design, every conversation that produced it, happened in FY24-25.",
    metrics: { funder: 'DSS', cohort_1_starts: 'May 2026', duration: '2-3 years', co_designed: 'PICC staff' },
    is_featured: true,
    display_order: 7,
    display_style: 'card',
    section: 'all',
  },
  {
    id: 'hl-mens-groups',
    highlight_type: 'service_first',
    title: "Ferdy's Haven opened men's groups",
    subtitle: 'For the first time in 30+ years',
    description: "Originally established in 1993 as a drug and alcohol rehabilitation centre, Ferdy's Haven has run women's groups since 2014. In FY24-25, after recruiting male staff, Ferdy's opened its men's groups for the first time in over thirty years. Day-based social and emotional wellbeing service for women and men 18+.",
    impact_achieved: 'Men now have a place of healing on Palm. Women\'s groups continue Tuesday + Wednesday. Both running in parallel.',
    metrics: { established: 1993, womens_groups_since: 2014, mens_groups_since: 'FY24-25' },
    is_featured: false,
    display_order: 8,
    display_style: 'card',
    section: 'healthWellbeing',
  },
] as const

// ============================================================================
// Services — Narelle's verified 24 (28 April 2026)
// ============================================================================

export const SERVICES_2025 = [
  // Children & Families (7)
  { id: 'svc-bwg-way', name: 'Bwgcolman Way', description: 'Delegated Authority for child protection. First ATSICCO in Queensland under Part 2A. Decisions about Palm Island children, made by Palm Island people. 10 staff, integrated with Family Care, Family Wellbeing, Safe House, BHS.', service_category: 'family', staff_count: 10, clients_served_annual: null },
  { id: 'svc-cfc', name: 'CFC Early Childhood Service', description: 'Quality early childhood education and care from the Children and Family Centre. Rebuilt by community after the 2024 floods. Presented "Storyline of the Palm Island CFC" at SNAICC \'23 Darwin.', service_category: 'family', staff_count: null, clients_served_annual: null },
  { id: 'svc-1000d', name: 'First 1,000 Days Program', description: 'Wraparound from conception to age 2. Launched April 2024. Child Health Nurse + Aboriginal Health Worker + GP, integrated with BHS and CFC.', service_category: 'family', staff_count: 3, clients_served_annual: null },
  { id: 'svc-fc', name: 'Family Care Service', description: "PICC's kinship care program. Family and cultural support for kinship and home care arrangements. 6,698 placement nights FY23-24.", service_category: 'family', staff_count: null, clients_served_annual: null },
  { id: 'svc-fpp', name: 'Family Participation Program', description: 'Supports families to participate in decisions about their children in the child protection system. Maintains cultural connections through care.', service_category: 'family', staff_count: null, clients_served_annual: null },
  { id: 'svc-fwc', name: 'Family Wellbeing Centre', description: 'Comprehensive family support — child safety, DFV response, parenting, family strengthening. Co-located with Women\'s Shelter.', service_category: 'family', staff_count: 7, clients_served_annual: 450 },
  { id: 'svc-safe-house', name: 'Safe House', description: 'Residential out-of-home care for up to 6 children at a time. On-Country, family-staffed, culturally grounded. 1,439 placement nights FY23-24.', service_category: 'family', staff_count: null, clients_served_annual: null },

  // Health & Wellbeing (5)
  { id: 'svc-bhs', name: 'Bwgcolman Healing Service', description: 'RACGP-accredited primary health (to 2027). 35 staff. 2,283 clients · 17,488 episodes of care (FY23-24). Renamed Jan 2024 after Elders\' consultation. Programs: ITC, ARF/RHD, Eldercare Connector, Growing Deadly Families, GP After Hours.', service_category: 'health', staff_count: 35, clients_served_annual: 2283 },
  { id: 'svc-sewb', name: 'Social and Emotional Wellbeing (SEWB)', description: 'Culturally appropriate mental health, counselling, crisis intervention. Trauma, grief, psychological health.', service_category: 'health', staff_count: null, clients_served_annual: null },
  { id: 'svc-whs', name: "Women's Healing Service", description: "Supports First Nations women at risk of or involved in the criminal justice system. Three streams — healing, DFV response, community education. Operates across Palm Island, Aitkenvale (Townsville), and Townsville Women's Correctional Centre.", service_category: 'health', staff_count: 10, clients_served_annual: null },
  { id: 'svc-ferdys', name: "Ferdy's Haven", description: "Day-based SEWB for women and men 18+. Originally established 1993. Women's groups since 2014. Men's groups added FY24-25 after recruiting male staff.", service_category: 'health', staff_count: null, clients_served_annual: null },
  { id: 'svc-shelter', name: "Women's Shelter", description: 'Emergency accommodation for women and children escaping domestic and family violence. 4 self-contained units (one disability-accessible). 12 staff. ~300 women a year. Remodelled 2024.', service_category: 'health', staff_count: 12, clients_served_annual: 300 },

  // Justice & Safety (3)
  { id: 'svc-dfv', name: 'Specialist Domestic and Family Violence Service', description: "Specialist DFV support — crisis intervention, safety planning, court support, counselling, prevention education. Houses the Men's Pathway to Healing program.", service_category: 'justice', staff_count: null, clients_served_annual: null },
  { id: 'svc-cjg', name: 'Community Justice Group', description: 'Auspiced by PICC since 2008. General Program + DFV Enhancement Program. 6 part-time staff. ~120 community members supported each year. Works alongside, not under, the Diversionary Program.', service_category: 'justice', staff_count: 6, clients_served_annual: 120 },
  { id: 'svc-divers', name: 'Diversionary Program', description: "Community-based men's and women's programs and outreach (~95% male clientele). Weekly programs: goal-setting, fishing, bushwalking, gym, men's gathering, haircuts, cemetery maintenance.", service_category: 'justice', staff_count: null, clients_served_annual: null },

  // Youth (2)
  { id: 'svc-safe-haven', name: 'Safe Haven', description: 'Youth patrol, night café, school holiday programs, tuck shop and breakfast program at Bwgcolman Community School. ~1,187 instances of support across FY23-24. Run by Jeannie.', service_category: 'youth', staff_count: null, clients_served_annual: 1187 },
  { id: 'svc-youth', name: 'Youth Services', description: 'Combined Youth Offender Support Service (YOSS), Indigenous Youth Connection to Culture, Tackling Indigenous Smoking, Digital Footprint Program. 15 staff, ~380 young people. Managed by Dee. Bakery-to-youth-hub conversion.', service_category: 'youth', staff_count: 15, clients_served_annual: 380 },

  // Economic (3)
  { id: 'svc-dsc', name: 'Digital Service Centre', description: 'Sales and customer service for Telstra products. 21 Palm Islanders trained, ~50 First Nations languages supported. 12-week TAFE course + 5-week Telstra induction + Cert III in Business. Pilot ended Jan 2025; continuation pending.', service_category: 'economic', staff_count: 21, clients_served_annual: 800 },
  { id: 'svc-retail', name: 'Retail Community Shop', description: 'PICC social enterprise — coffee shop, goods and services. Local employment. Not based in the new Palm Island Retail Centre.', service_category: 'economic', staff_count: null, clients_served_annual: null },
  { id: 'svc-logistics', name: 'Logistics', description: 'Operations across Townsville and Palm. Movement of goods, catering, events, deliveries, supply chain for PICC programs.', service_category: 'economic', staff_count: null, clients_served_annual: null },

  // Education & Community (4)
  { id: 'svc-beai', name: 'Bwgcolman Education and Training Service (BEAI)', description: 'NIAA-funded. Four streams: in-school support, community engagement, communications, rewards & recognition. Holistic pathway from CFC through Bwgcolman Community School to YOSS and PCYC.', service_category: 'education', staff_count: null, clients_served_annual: null },
  { id: 'svc-blue-card', name: 'Blue Card Liaison Service', description: 'Pilot launched July 2024 with Blue Card Services (Qld Govt). Walk-in + virtual support. ~20 positive notices/month. Funding cliff 30 June 2026.', service_category: 'community', staff_count: null, clients_served_annual: null },
  { id: 'svc-hub', name: 'Community Hub', description: 'Central community gathering and coordination point. Major community events, food hampers, RJED-supported, mowing program partnership with Youth Justice. Led by Jacinta Gaia.', service_category: 'community', staff_count: null, clients_served_annual: null },
  { id: 'svc-ndis', name: 'NDIS Services', description: 'Tripled in FY24-25. ~15 staff across Townsville and Palm. Includes home care packages and elder care support. Aitkenvale office opened Feb 2024.', service_category: 'community', staff_count: 15, clients_served_annual: null },
] as const

// ============================================================================
// Innovation Projects — what was active in FY24-25 vs deferred
// ============================================================================

export const INNOVATION_PROJECTS_2025 = [
  {
    id: 'inv-ai-report',
    title: 'AI-Powered Annual Report System',
    description: '15 years of PICC reporting digitised, indexed, and searchable in seconds. The system that wrote this report drew on 270 pages of historical material, 117 transcripts, 162 Elder quotes, and 33 interviews — all community-controlled. Made on Palm Island. Owned on Palm Island.',
    status: 'active',
    impact_summary: '270 pages digitised · 117 transcripts indexed · 162 Elder quotes curated · 33 interviews catalogued.',
    hero_image_url: '/icons/picc/07-digital.png',
  },
  {
    id: 'inv-photo-studio',
    title: 'On-Country Professional Photography Studio',
    description: 'Three local photographers. Hundreds of images. 20+ Elder portraits. Studio used by community members at no cost — Mother\'s Day photos, family portraits, service portraits. Captures the visual archive of PICC.',
    status: 'active',
    impact_summary: '~323 images captured · 20+ Elder portraits · community-accessible studio space.',
    hero_image_url: '/hero-assets/stills/centre-youth-landscaping.jpg',
  },
  {
    id: 'inv-leadership',
    title: 'PIC Leadership Program (designed FY24-25, launches May 2026)',
    description: "PICC's own in-house accredited leadership program. Designed by PICC staff, for PICC staff. Funded by DSS. Cohort 1 begins May 2026 across 2-3 years.",
    status: 'designed',
    impact_summary: 'The most important investment Year 17 made. Building current leaders, growing the next ones.',
    hero_image_url: '/icons/picc/05-community.png',
  },
  {
    id: 'inv-el-photo',
    title: 'Empathy Ledger v2 photo pipeline',
    description: 'Community-controlled digital archive. ~122 photos approved, slot-tagged, served via /api/photos under per-storyteller consent. PICC consumes; EL is the source of truth.',
    status: 'active',
    impact_summary: '122 photos · slot-tagged · per-storyteller consent · sovereign archive.',
    hero_image_url: '/icons/picc/motifs/05-constellation.png',
  },
  {
    id: 'inv-hull-river',
    title: 'Elders Hull River On-Country Journey',
    description: 'September–November 2025 — Elders return to Hull River, near Mission Beach. For some, return to family stories told but never seen. For others, first time setting foot on land their ancestors had been forcibly removed from a hundred years before. Featured here as the natural epilogue to FY24-25, not a year-17 deliverable.',
    status: 'since the year ended',
    impact_summary: 'Elder-led, Elder-paced, Elder-recorded. Photos and language archived under restricted Elder access.',
    hero_image_url: '/icons/picc/photos/eoc/01-480347ea.jpg',
  },
] as const

// ============================================================================
// Sections — full long-form content
// ============================================================================

export const SECTIONS_2025 = [
  {
    id: 'sec-bwg-way',
    section_type: 'anchor_story',
    section_title: 'Bwgcolman Way · the year decisions came home',
    section_content: `In 2024-25, the Child Protection Act 1999 was used in a way it has never been used on Palm Island before. Under Part 2A — prescribed delegates for Aboriginal or Torres Strait Islander children — the Queensland Government delegated statutory child-protection functions to the Chief Executive of an Aboriginal and Torres Strait Islander Community Controlled Organisation. PICC became the first ATSICCO in Queensland to receive that authority.

What does that mean in practice? Decisions about whether a Palm Island child is removed, where they are placed, and how their family stays connected to them are no longer made by the state director of child safety in Brisbane. They are made on Palm Island. By Palm Islanders. Guided by our blueprint, Reclaiming our Storyline (April 2023), which the Queensland Aboriginal and Torres Strait Islander Child Protection Peak (QATSICPP) co-developed with the Department of Child Safety, Seniors and Disability Services.

Without DA: child to mainland residential care. With DA: child stays with grandmother on Palm.

Funded as part of Queensland's $107.8 million four-year statewide Delegated Authority commitment (2023-2028). PICC is one of the first ATSICCOs to go live; the funding is statewide, not PICC-only.`,
    display_order: 1,
    featured_quote: 'Bwgcolman means many tribes, one people.',
    quote_author: 'Bwgcolman Way blueprint',
    quote_author_title: 'Reclaiming our Storyline (April 2023)',
  },
  {
    id: 'sec-cfc-rebuild',
    section_type: 'anchor_story',
    section_title: 'The CFC daycare came back stronger',
    section_content: `The Children and Family Centre arrived on Palm Island by barge in June 2012. The CFC is the front door of PICC family services — early childhood, primary health, family support, all under one roof.

In late 2023 and early 2024, severe weather and flooding damaged the building and destroyed equipment. The rebuild is the story of FY24-25.

Daycare was relocated temporarily during repair. Playgroup was closed for weeks while floors and furniture were replaced. Equipment was sourced through Logistics, with help from staff personal networks across Palm and Townsville. The Centre reopened for the new fiscal year — fully equipped, fully staffed.

What it taught us:
Local employment is what made the rebuild possible. Outside contractors would not have been on hand the day the water dropped.
The CFC is more than a building. The team is the building.
Community resilience is not a metaphor. It is paid work, done by named people, on the days it is hardest.`,
    display_order: 2,
    featured_quote: 'It was really hard, because we flooded out, we lost all of our equipment.',
    quote_author: 'Hailey Jane Wetzel',
    quote_author_title: 'CFC Manager',
  },
  {
    id: 'sec-bhs-rename',
    section_type: 'anchor_story',
    section_title: 'A name our Elders chose',
    section_content: `In January 2024, after extensive consultation with the Elders' Advisory Group, the Primary Health Centre was renamed the Bwgcolman Healing Service.

Bwgcolman — many tribes, one people. Healing — what we do, in the way our people understand the word.

The renaming was symbolic. The work behind it is not. RACGP Quality Practice Accreditation held to 2027. 35 staff. 2,283 clients in FY23-24, 1,935 of them Aboriginal and Torres Strait Islander. 17,488 episodes of care.

Programs running:
Integrated Team Care for chronic conditions
Communicable Infections — STI screening, hepatitis, COVID continuity
ARF/RHD — acute rheumatic fever and rheumatic heart disease
Eldercare Connector — bridging primary health and aged-care needs
Growing Deadly Families — maternal and infant health
GP After Hours — Monday to Thursday, 5pm to 9pm`,
    display_order: 3,
    featured_quote: 'As a local returning to work on Palm Island, I am proud to be part of the PICC team that is helping to close the gap for Indigenous Australians.',
    quote_author: 'Dr Raymond Blackman',
    quote_author_title: 'PICC Health Doctor',
  },
] as const

// ============================================================================
// Video tag map — connect themed clips to sections
// ============================================================================

export const VIDEO_TAGS_2025: Record<string, string> = {
  'cover': `${VIDEO}/palm-island-aerial.mp4`,
  'acknowledgement': `${VIDEO}/palm-island-sunset.mp4`,
  'children-families': `${VIDEO}/daycare-celebration.mp4`,
  'cfc-rebuild': `${VIDEO}/daycare-playground.mp4`,
  'bwgcolman-way': `${VIDEO}/kids-beach.mp4`,
  'health-wellbeing': `${VIDEO}/country-waterfall.mp4`,
  'justice-safety': `${VIDEO}/centre-youth-work.mp4`,
  'youth': `${VIDEO}/youth-team-group.mp4`,
  'economic': `${VIDEO}/youth-cleaning-corridor.mp4`,
  'education-community': `${VIDEO}/youth-sweeping.mp4`,
  'elders': `${VIDEO}/elders-on-country.mp4`,
  'forward-commitments': `${VIDEO}/mountain-panorama.mp4`,
  'back-cover': `${VIDEO}/palm-island-sunset.mp4`,
}

// ============================================================================
// Compose ReportData
// ============================================================================

export function getStaticReportData2025(): ReportData {
  return {
    report: {
      id: 'report-2024-25',
      report_year: 2025,
      title: 'Palm Island Community Company Annual Report 2024-25 · Year 17',
      status: 'in_progress',
      executive_summary:
        'Year 17 of 20. The first year decisions about Palm Island children were made by Palm Island people. 24 services. About 210 staff. 75% Indigenous, 70% Palm Island resident.',
      looking_forward:
        'Three commitments, three generations: Aged Care on Palm Island by 2028. Bwgcolman Way Expanded by 2030. Sovereign Story Archive by 2045.',
      acknowledgments:
        'We acknowledge the Manbarra people as the Traditional Custodians of Palm Island, and the Bwgcolman people — the descendants of the more than forty First Nations forcibly relocated here from across Queensland between 1914 and 1972. We pay our respects to Elders past, present, and emerging. We honour the strength of those who came before us, the wisdom of those who walk with us today, and the future we are building with our children. Bwgcolman — many tribes, one people. This report was prepared on Country, with Elder guidance. All named voices, photographs, and stories appear with explicit consent.',
    },
    compliance: {
      icn_number: 'TBC · pending Mark sign-off',
      members_count: null,
      agm_date: '25 November 2025',
      board_meetings_held: null,
      auditor_name: null,
      auditor_firm: null,
      audit_opinion: 'Pending Mark sign-off · FY24-25 audit in progress',
      directors_declaration:
        'In accordance with the CATSI Act, the directors of Palm Island Community Company Ltd declare that the financial statements presented give a true and fair view of the financial position of the company, and that the company is able to pay its debts as and when they fall due.',
      revenue_by_funder: [],
      prior_year_financials: null,
    },
    statistics: STATS_2025 as any,
    sections: SECTIONS_2025 as any,
    boardMembers: BOARD_MEMBERS_2025 as any,
    leadershipMessages: LEADERSHIP_2025 as any,
    highlights: HIGHLIGHTS_2025 as any,
    services: SERVICES_2025 as any,
    coverPhoto: { url: '/hero-assets/stills/kids-beach-palm.jpg', caption: 'Children on Country' },
    galleryPhotos: [
      { url: '/hero-assets/stills/daycare-graduation.jpg', caption: 'CFC daycare graduation, post-rebuild' },
      { url: '/hero-assets/stills/youth-team-photo.jpg', caption: 'Christmas Cup under-15s' },
      { url: '/hero-assets/stills/group-dinner.jpg', caption: 'Community gathering' },
      { url: '/hero-assets/stills/centre-youth-landscaping.jpg', caption: 'The Centre · youth landscaping crew' },
      { url: '/hero-assets/stills/memorial-gathering.jpg', caption: 'Held in community' },
      { url: '/hero-assets/stills/mountain-valley.jpg', caption: 'Country' },
      { url: '/hero-assets/stills/pier-turquoise.jpg', caption: 'The jetty — arrivals and departures' },
      { url: '/hero-assets/stills/palm-sunset-pier.jpg', caption: 'A day closing' },
    ],
    financials: {
      total_income: 23_400_000, // ~$23.4M preliminary FY24-25
      total_expenditure: 23_700_000, // pending Mark sign-off
      net_result: -300_000, // pending
      breakdown: [
        { category: 'Children & Families', amount: 8_200_000, percentage: 34.6 },
        { category: 'Health & Wellbeing', amount: 6_100_000, percentage: 25.7 },
        { category: 'Justice & Safety', amount: 1_800_000, percentage: 7.6 },
        { category: 'Youth', amount: 1_500_000, percentage: 6.3 },
        { category: 'Economic / Social Enterprise', amount: 2_400_000, percentage: 10.1 },
        { category: 'Education & Community', amount: 2_100_000, percentage: 8.9 },
        { category: 'Operations & Governance', amount: 1_600_000, percentage: 6.8 },
      ],
    },
    innovationProjects: INNOVATION_PROJECTS_2025 as any,
    communityVoices: [],
    historyEras: [
      { name: 'Foundation', year_start: 2007, year_end: 2013, description: 'PICC launched 17 October 2007. CFC established 2011, facility arrives by barge 2012. Health expansion 2013-14.', milestones: ['2007 — PICC launched', '2008 — Community Justice Group auspiced', '2011 — CFC established', '2012 — CFC facility by barge'] },
      { name: 'Growth', year_start: 2014, year_end: 2018, description: 'Service expansion. Workforce growth.', milestones: ['~60 staff in 2014 → growing'] },
      { name: 'Transition to Community Control', year_start: 2019, year_end: 2021, description: 'Ipsos evaluation 2019. New entity registered June 2020. Community control achieved 30 September 2021. Renamed Palm Island Community Company Ltd October 2021.', milestones: ['2019 Ipsos evaluation', '2020 new entity', '2021 community control'] },
      { name: 'Community-Controlled Era · Year 17 of 20', year_start: 2022, year_end: null, description: 'SNAICC \'23 Darwin presentation. DSC opens 2023. Bwgcolman Way blueprint April 2023. BHS renamed January 2024. First 1,000 Days April 2024. Bwgcolman Way Delegated Authority goes live 2024. Blue Card Liaison July 2024.', milestones: ['2023 — SNAICC Darwin', '2023 — DSC opens', '2024 — Bwgcolman Way live', '2024 — First 1,000 Days', '2024 — Blue Card pilot'] },
    ],
    resilienceStories: null,
    pagePhotos: {} as any,
    voiceAssignments: {} as any,
  }
}

export { getStaticReportData2025 as default }
