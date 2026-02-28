/**
 * FALLBACK: Static data for the 2023-24 PICC Annual Report
 *
 * This file serves as a fallback when Supabase is unavailable.
 * The primary data source is now the consolidated Supabase schema.
 * See: fetch-report-data.ts for the Supabase-first fetcher.
 *
 * Use `getStaticReportData()` to get all data at once (fallback only).
 * Use `getReportData()` from fetch-report-data.ts for production use.
 */

import { getPagePhotos } from './page-photos';
import { assignVoicesToPages } from './voice-assignments';

export function getStaticReportData() {
  const communityVoices = COMMUNITY_VOICES;
  return {
    report: REPORT,
    statistics: STATISTICS,
    sections: SECTIONS,
    boardMembers: BOARD_MEMBERS,
    leadershipMessages: LEADERSHIP_MESSAGES,
    highlights: HIGHLIGHTS,
    services: SERVICES,
    coverPhoto: { url: "https://uaxhjzqrdotoahjnxmbj.supabase.co/storage/v1/object/public/story-media/annual-report-2024/1771305448200-t2zjnm-img-001.jpg", caption: "Palm Island beach panorama" },
    galleryPhotos: [
      { url: "https://uaxhjzqrdotoahjnxmbj.supabase.co/storage/v1/object/public/story-media/annual-report-2024/1771305447350-emxlt7-img-000.jpg", caption: "Community members walking along the Palm Island shoreline" },
      { url: "https://uaxhjzqrdotoahjnxmbj.supabase.co/storage/v1/object/public/story-media/annual-report-2024/1771305451442-q0l049-img-007.jpg", caption: "Cultural dance performance by Palm Island youth" },
      { url: "https://uaxhjzqrdotoahjnxmbj.supabase.co/storage/v1/object/public/story-media/annual-report-2024/1771305450691-m9jo1y-img-006.jpg", caption: "Palm Valley waterhole, Palm Island" },
      { url: "https://uaxhjzqrdotoahjnxmbj.supabase.co/storage/v1/object/public/story-media/annual-report-2024/1771305449992-cdgofo-img-005.jpg", caption: "PICC Board of Directors 2023-24" },
      { url: "https://uaxhjzqrdotoahjnxmbj.supabase.co/storage/v1/object/public/story-media/annual-report-2024/1771305453570-w0ez8k-img-012.jpg", caption: "Mural by Peter Gullumbah Prior" },
      { url: "https://uaxhjzqrdotoahjnxmbj.supabase.co/storage/v1/object/public/story-media/annual-report-2024/1771305454495-0gauce-img-014.jpg", caption: "Palm Island beach" },
    ],
    financials: null,
    innovationProjects: INNOVATION_PROJECTS,
    communityVoices,
    compliance: COMPLIANCE_DATA,
    historyEras: HISTORY_ERAS,
    resilienceStories: RESILIENCE_STORIES,
    pagePhotos: getPagePhotos('2023-24'),
    voiceAssignments: assignVoicesToPages(communityVoices),
  };
}

// ============================================================================
// Annual Report Record
// ============================================================================

export const REPORT = {
  id: "26774d54-3c21-413f-ba8c-e156c3fd9ff9",
  report_year: 2024,
  title: "Palm Island Community Company Annual Report 2023-2024",
  status: "published",
  executive_summary: "The pace at which PICC has been evolving is nothing short of remarkable. Our expanded investment in services has significantly strengthened and enhanced them, making them more robust and effective than ever before. We now employ three times the number of people compared to ten years ago and our turnover has quadrupled. This substantial growth is directly benefiting Palm Islanders, either through the services we provide or the jobs we offer. The number of staff and trainees we employ has increased by a third since last year, with nearly two hundred people now working for PICC. Impressively, three-quarters of our workforce are Palm Islanders.",
  looking_forward: "Despite our progress, we are acutely aware that we still have a long way to go. Palm Island continues to lag behind mainland communities in many areas of wellbeing. However, PICC is here to stay and to fight for Palm Islanders to have the services they deserve. Everything we do is for, with, and because of the people of this beautiful community.",
  acknowledgments: "The Palm Island Community Company acknowledges the Traditional Owners of Palm Island, the Manbarra people. We also acknowledge the many First Nations persons who were forcibly removed to Palm Island, and we recognise these persons and their descendants as the historical Bwgcolman people. We recognise the continued connection of the Manbarra and Bwgcolman peoples to the land and waters of this beautiful island. We pay respect to Manbarra and Bwgcolman Elders, their ancestors, all First Nations peoples, and our ancestors who walk in the Dreamtime.",
};

// ============================================================================
// Statistics (20 records)
// ============================================================================

export const STATISTICS = [
  { id: "22c5d8cb", category: "workforce", stat_label: "Total Staff Members", stat_value: "197", stat_unit: "people", stat_description: "Total staff as at June 2024 (up from 151 in June 2023)", comparison_previous_year: "151", comparison_type: "increase", icon_name: "Users", is_key_metric: true, display_order: 1 },
  { id: "2605e273", category: "workforce", stat_label: "Staff Growth Since Last Year", stat_value: "30%", stat_unit: "percentage", stat_description: "Growth from 151 staff (June 2023) to 197 (June 2024)", icon_name: "TrendingUp", is_key_metric: true, display_order: 2 },
  { id: "cd2b6a8b", category: "workforce", stat_label: "Aboriginal & Torres Strait Islander Staff", stat_value: "80%+", stat_unit: "percentage", stat_description: "Over 80% of PICC staff identify as Aboriginal and/or Torres Strait Islander, with 70%+ living on Palm Island", icon_name: "Heart", is_key_metric: true, display_order: 3 },
  { id: "0e81c744", category: "workforce", stat_label: "10-Year Staff Growth", stat_value: "3x", stat_unit: "multiplier", stat_description: "From approximately 60 staff in 2014 to 197 in 2024", icon_name: "Rocket", is_key_metric: false, display_order: 4 },
  { id: "4fe4e5b1", category: "service_delivery", stat_label: "Services Offered", stat_value: "16", stat_unit: "services", stat_description: "Comprehensive range of community services", icon_name: null, is_key_metric: false, display_order: 5 },
  { id: "26563ffd", category: "health", stat_label: "Medical Clients Seen", stat_value: "2,283", stat_unit: "people", stat_description: "Patients at Bwgcolman Healing Service", icon_name: null, is_key_metric: false, display_order: 6 },
  { id: "5814db38", category: "health", stat_label: "Health Check (715) Completed", stat_value: "779", stat_unit: "checks", stat_description: "Annual health assessments", icon_name: null, is_key_metric: false, display_order: 7 },
  { id: "3a2c1699", category: "community_engagement", stat_label: "Families Supported", stat_value: "2,500+", stat_unit: "families", stat_description: "Through various family support programs", icon_name: null, is_key_metric: false, display_order: 8 },
  { id: "80e895c7", category: "health", stat_label: "Child Health Checks", stat_value: "128", stat_unit: "checks", stat_description: "Child health checks completed through Bwgcolman Healing Service", icon_name: "Baby", is_key_metric: true, display_order: 9 },
  { id: "c3228ffc", category: "health", stat_label: "Episodes of Care", stat_value: "17,488", stat_unit: "episodes", stat_description: "Total episodes of care delivered by primary health services", icon_name: "Activity", is_key_metric: true, display_order: 10 },
  { id: "b34bbc73", category: "health", stat_label: "Chronic Disease Clients", stat_value: "803", stat_unit: "clients", stat_description: "Clients managed through chronic disease programs (GP Management Plans)", icon_name: "Stethoscope", is_key_metric: false, display_order: 11 },
  { id: "02a1946c", category: "financial", stat_label: "Total Income", stat_value: "$23.4M", stat_unit: "AUD", stat_description: "Total revenue for the 2023-2024 financial year", icon_name: "DollarSign", is_key_metric: true, display_order: 12 },
  { id: "5d173873", category: "financial", stat_label: "Total Expenditure", stat_value: "$23.7M", stat_unit: "AUD", stat_description: "Total expenditure for the 2023-2024 financial year", icon_name: "Receipt", is_key_metric: true, display_order: 13 },
  { id: "b54ec37b", category: "financial", stat_label: "Total Assets", stat_value: "$10.9M", stat_unit: "AUD", stat_description: "Total assets as at 30 June 2024 (up from $10.3M prior year)", icon_name: "Building2", is_key_metric: false, display_order: 14 },
  { id: "080a1d06", category: "financial", stat_label: "Net Assets", stat_value: "$3.5M", stat_unit: "AUD", stat_description: "Net asset position as at 30 June 2024", icon_name: "Landmark", is_key_metric: false, display_order: 15 },
  { id: "1b18314e", category: "service_delivery", stat_label: "Family Care Placement Nights", stat_value: "6,698", stat_unit: "nights", stat_description: "Total placement nights provided by Family Care service in 2023-24", icon_name: "Home", is_key_metric: true, display_order: 16 },
  { id: "a71143bd", category: "service_delivery", stat_label: "Safe House Nights of Care", stat_value: "1,439", stat_unit: "nights", stat_description: "Total nights of care at PICC Safe House", icon_name: "Shield", is_key_metric: true, display_order: 17 },
  { id: "dcca274c", category: "workforce", stat_label: "Social Enterprises Staff", stat_value: "44", stat_unit: "staff", stat_description: "Record number of staff across PICC social enterprises \u2014 approximately 25% of all PICC staff", icon_name: "Briefcase", is_key_metric: true, display_order: 18 },
  { id: "9c67ac9f", category: "outcomes", stat_label: "Partners & Collaborators", stat_value: "40+", stat_unit: "organisations", stat_description: "Government, corporate, and community partners supporting PICC programs", icon_name: "Handshake", is_key_metric: false, display_order: 19 },
  { id: "f17d4ea2", category: "outcomes", stat_label: "Digital Service Centre Workers", stat_value: "21", stat_unit: "workers", stat_description: "Palm Islanders employed at the Digital Service Centre in partnership with Telstra", icon_name: "Headphones", is_key_metric: true, display_order: 20 },
];

// ============================================================================
// Board Members (7)
// ============================================================================

const BOARD_PHOTO_BASE = "https://uaxhjzqrdotoahjnxmbj.supabase.co/storage/v1/object/public/story-media/picc-website/board-members/";

export const BOARD_MEMBERS = [
  { id: "e046dec2", full_name: "Luella Bligh", position: "Chair", bio: null, photo_url: BOARD_PHOTO_BASE + "01-luella-bligh.jpg", display_order: 1 },
  { id: "0e933ee8", full_name: "Rhonda Phillips", position: "Director", bio: null, photo_url: BOARD_PHOTO_BASE + "04-rhonda-phillips.jpg", display_order: 2 },
  { id: "65f8a60f", full_name: "Allan Palm Island", position: "Director", bio: null, photo_url: BOARD_PHOTO_BASE + "03-allan-palm-island.jpg", display_order: 3 },
  { id: "1b08ddf7", full_name: "Matthew Lindsay", position: "Company Secretary", bio: null, photo_url: BOARD_PHOTO_BASE + "06-matthew-lindsay.jpg", display_order: 4 },
  { id: "2b084b72", full_name: "Harriet Hulthen", position: "Director", bio: null, photo_url: BOARD_PHOTO_BASE + "02-harriet-hulthen.jpg", display_order: 5 },
  { id: "0a1b9bf7", full_name: "Raymond W. Palmer Snr", position: "Director", bio: null, photo_url: BOARD_PHOTO_BASE + "07-raymond-palmer.jpg", display_order: 6 },
  { id: "46071cf1", full_name: "Cassie Lang", position: "Director", bio: null, photo_url: BOARD_PHOTO_BASE + "05-cassie-lang.jpg", display_order: 7 },
];

// ============================================================================
// Leadership Messages (2)
// ============================================================================

export const LEADERSHIP_MESSAGES = [
  {
    id: "84da80cd",
    role: "ceo",
    person_name: "Rachel Atkinson",
    person_title: "Chief Executive Officer",
    message_title: "CEO's Report",
    message_content: `This year, I am so proud to introduce our Annual Report, published by our own PICC Communications and Design team. 2023-24 has been a year of remarkable growth for Palm Island Community Company.

We now employ 197 staff \u2014 a 30% increase from the previous year \u2014 with over 80% identifying as Aboriginal and/or Torres Strait Islander and more than 70% living on Palm Island. This growth reflects the community\u2019s trust in PICC and the quality of services we provide.

A landmark achievement this year was receiving Delegated Authority through our Bwgcolman Way service. PICC is now one of the first Aboriginal and Torres Strait Islander community-controlled organisations in Queensland to hold this responsibility. Decisions about Palm Island children and families are now being made by Palm Island people \u2014 this is self-determination in action.

Our health services continue to deliver outstanding results, with the Bwgcolman Healing Service seeing 2,283 clients and completing 779 health checks. Our community services provided critical support including 6,698 placement nights through Family Care and 1,439 nights of care at our Safe House.

Our social enterprises have reached a record 44 staff. The Digital Service Centre, in partnership with Telstra, now employs 21 Palm Islanders taking calls from across Australia \u2014 proving that remote Indigenous communities can participate fully in the national economy.

I want to thank our Board, our staff, our partners, and most importantly the Palm Island community for their continued trust and engagement. Together, we are building a stronger future for Bwgcolman.`,
    message_excerpt: "Decisions about Palm Island children and families are now being made by Palm Island people \u2014 this is self-determination in action.",
    featured_quote: "We are building a stronger future for Bwgcolman.",
    photo_url: "https://uaxhjzqrdotoahjnxmbj.supabase.co/storage/v1/object/public/story-media/1764215451340-cif9ut.jpg",
    display_order: 1,
  },
  {
    id: "20be9bbe",
    role: "chair",
    person_name: "Luella Bligh",
    person_title: "Chair of the Board",
    message_title: "Chair's Report",
    message_content: `On behalf of the Board of Directors, I am pleased to present the Palm Island Community Company Annual Report for 2023-24.

This has been an exceptional year for our organisation. The Board is proud of the growth PICC has achieved \u2014 not just in numbers, but in the depth and quality of services we deliver to our community.

The granting of Delegated Authority through the Bwgcolman Way service is a historic moment for Palm Island. For the first time, decisions about the safety and wellbeing of our children are being made here, by our people, in our community. This is what self-determination looks like in practice.

The Board has maintained strong governance throughout this period of growth, ensuring that PICC operates with transparency, accountability, and always in the best interests of the Palm Island community. We continue to meet all regulatory requirements under ORIC, ACNC, and ASIC.

I want to acknowledge our CEO Rachel Atkinson and the entire PICC leadership team for their dedication. I also want to thank my fellow Board members \u2014 Rhonda Phillips, Allan Palm Island, Matthew Lindsay, Harriet Hulthen, Raymond W. Palmer Snr, and Cassie Lang \u2014 for their service and commitment.

Most importantly, I want to thank the Palm Island community. Everything we do is for you, and because of you.`,
    message_excerpt: "For the first time, decisions about the safety and wellbeing of our children are being made here, by our people, in our community.",
    featured_quote: "This is what self-determination looks like in practice.",
    photo_url: "https://uaxhjzqrdotoahjnxmbj.supabase.co/storage/v1/object/public/story-media/annual-report-2024/1771305449592-s3f0u0-img-004.jpg",
    display_order: 2,
  },
];

// ============================================================================
// Key Highlights (6)
// ============================================================================

export const HIGHLIGHTS = [
  {
    id: "32833d5b",
    highlight_type: "major_initiative",
    title: "Palm Island Digital Service Centre",
    subtitle: "Telstra Partnership Creating Real Jobs",
    description: "21 Palm Islanders employed at the Digital Service Centre, taking customer service calls for Telstra from across Australia. This flagship social enterprise demonstrates that remote Indigenous communities can compete in the national economy.",
    impact_achieved: "Created 21 jobs on Palm Island with career progression pathways. Workers handle the same customer inquiries as any Telstra call centre nationally.",
    metrics: { sector: "Social Enterprise", partner: "Telstra", workers: 21 },
    is_featured: true,
    display_order: 1,
    display_style: "hero",
  },
  {
    id: "89a42aca",
    highlight_type: "major_initiative",
    title: "Delegated Authority - Bwgcolman Way",
    subtitle: "First-of-its-kind in Queensland",
    description: "PICC became one of the first Aboriginal and Torres Strait Islander community-controlled organisations in Queensland to receive Delegated Authority for child protection decisions. Palm Island people now make decisions about Palm Island families.",
    impact_achieved: "Child protection decisions for Palm Island children and families are now made locally by trained Aboriginal workers, embedding cultural authority alongside statutory compliance.",
    metrics: { conference: "SNAICC National Conference 2023", achievement: "First ATSICCO in QLD with Delegated Authority" },
    is_featured: true,
    display_order: 2,
    display_style: "hero",
  },
  {
    id: "8fdd8f46",
    highlight_type: "service_expansion",
    title: "Women's Healing Service Restructured",
    subtitle: "Three Dedicated Streams for Better Support",
    description: "The Women\u2019s Healing Service was restructured into three dedicated streams: healing, DFV crisis response, and community education. This ensures women can access the right support at the right time \u2014 separating crisis response from longer-term healing work.",
    impact_achieved: "1,110 women accessed DFV services. Clearer pathways mean women get crisis support immediately and healing support when they are ready.",
    metrics: { streams: 3, women_served: 1110 },
    is_featured: true,
    display_order: 3,
    display_style: "card",
  },
  {
    id: "a3eecd85",
    highlight_type: "milestone",
    title: "Record Social Enterprise Employment",
    subtitle: "44 Staff Across PICC Social Enterprises",
    description: "PICC social enterprises reached a record 44 staff members \u2014 approximately 25% of the entire PICC workforce. This includes the Digital Service Centre (21), Construction & Maintenance, and Store/Retail operations.",
    impact_achieved: "Demonstrated that community-owned social enterprises can create sustainable employment in a remote community. 44 jobs created through enterprise, not grants.",
    metrics: { total_enterprise_staff: 44, percentage_of_workforce: 25 },
    is_featured: true,
    display_order: 4,
    display_style: "card",
  },
  {
    id: "8318c44a",
    highlight_type: "achievement",
    title: "SNAICC National Conference Presentation",
    subtitle: "Sharing the Palm Island Model Nationally",
    description: "PICC presented at the SNAICC National Conference in 2023, sharing the Bwgcolman Way Delegated Authority model and PICC\u2019s approach to Aboriginal community-controlled service delivery. The presentation attracted significant interest from organisations across Australia.",
    impact_achieved: "National recognition of PICC as a leader in Aboriginal community-controlled child protection. Other communities now exploring similar models based on PICC\u2019s experience.",
    metrics: { topic: "Delegated Authority", conference: "SNAICC National 2023" },
    is_featured: false,
    display_order: 5,
    display_style: "card",
  },
  {
    id: "a1df529c",
    highlight_type: "milestone",
    title: "197 Staff \u2014 30% Growth in One Year",
    subtitle: "Largest Employer on Palm Island",
    description: "PICC grew from 151 staff (June 2023) to 197 staff (June 2024) \u2014 a 30% increase in a single year, and a threefold increase over the past decade. Over 80% of staff identify as Aboriginal and/or Torres Strait Islander.",
    impact_achieved: "PICC is the largest employer on Palm Island, creating meaningful careers that allow community members to serve their own people while earning a livelihood.",
    metrics: { staff_2023: 151, staff_2024: 197, growth_percent: 30, indigenous_percent: 80 },
    is_featured: true,
    display_order: 6,
    display_style: "stat",
  },
];

// ============================================================================
// Report Sections (16)
// ============================================================================

export const SECTIONS = [
  {
    id: "51bfc152",
    section_type: "leadership_message",
    section_title: "Message from the CEO",
    display_order: 1,
    section_content: `This year, I am so proud to introduce our Annual Report, published by our own PICC Communications and Design team. In 2023-24, PICC has continued to grow, reflecting the community\u2019s trust and the quality of services we provide. We now employ 197 staff \u2014 a 30% increase from the prior year \u2014 with over 80% identifying as Aboriginal and/or Torres Strait Islander, and more than 70% living on Palm Island.

Our health services have expanded significantly with the Bwgcolman Healing Service seeing 2,283 clients and completing 779 health checks. Our community services continue to provide critical support \u2014 Family Care managed 6,698 placement nights, and our Safe House provided 1,439 nights of care.

A landmark achievement this year was receiving Delegated Authority through our Bwgcolman Way service, making PICC one of the first Aboriginal and Torres Strait Islander community-controlled organisations in Queensland to receive this responsibility. This means decisions about Palm Island children and families are now being made by Palm Island people.

Our social enterprises have reached a record 44 staff \u2014 approximately 25% of all PICC employees \u2014 demonstrating that community-owned businesses can create meaningful employment. The Digital Service Centre, in partnership with Telstra, now employs 21 Palm Islanders taking calls from across Australia.

I would also like to acknowledge our 40+ partners across government, corporate, and community sectors who make this work possible.`,
    featured_quote: "Decisions about Palm Island children and families are now being made by Palm Island people.",
    quote_author: "Rachel Atkinson",
    quote_author_title: "Chief Executive Officer",
  },
  {
    id: "dd09b2c5",
    section_type: "about_picc",
    section_title: "About Palm Island Community Company",
    display_order: 2,
    section_content: `Palm Island Community Company (PICC) is the largest employer on Palm Island, operating 16 services across health, community services, family support, social enterprises, and cultural programs. PICC is a not-for-profit, Aboriginal and Torres Strait Islander community-controlled organisation governed by a Board of Directors, all of whom are Aboriginal and/or Torres Strait Islander people.

PICC was established to deliver services that strengthen families, improve health outcomes, and create economic opportunities for Palm Island people. Our approach is grounded in self-determination \u2014 the belief that Palm Island people are best placed to design and deliver services for their own community.

In 2023-24, PICC employed 197 staff members, with over 80% identifying as Aboriginal and/or Torres Strait Islander. More than 70% of our workforce lives on Palm Island, ensuring that services are delivered by people who understand the community.

Our 16 services include: Bwgcolman Healing Service (primary health), Family Care, Safe House, Family Wellbeing, Diversionary Service, Women\u2019s Service, Family Participation Program, Safe Haven, Women\u2019s Healing Service, Early Childhood Service, NDIS, Bwgcolman Way (Delegated Authority), Digital Service Centre, Construction & Maintenance, Store/Retail, and the Communications & Design team.`,
    featured_quote: null,
    quote_author: null,
    quote_author_title: null,
  },
  {
    id: "70bdbd8a",
    section_type: "history",
    section_title: "Our History",
    display_order: 3,
    section_content: `Palm Island Community Company (PICC) has grown from a small community organisation into the largest employer on Palm Island, delivering 16 services and employing 197 staff.

Key Milestones:
- Establishment: PICC was established as a not-for-profit Aboriginal and Torres Strait Islander community-controlled organisation to deliver services on Palm Island
- Early Growth: Started with a handful of services focused on family support and community development
- Health Services: Took on management of primary health care through the Bwgcolman Healing Service
- Social Enterprises: Launched innovative employment-creating businesses including the Digital Service Centre (Telstra partnership) and Construction & Maintenance
- Workforce Growth: Grew from approximately 60 staff (2014) to 197 staff (2024) \u2014 a threefold increase in 10 years
- Delegated Authority (2023-24): Became one of the first Aboriginal and Torres Strait Islander community-controlled organisations in Queensland to hold Delegated Authority for child protection decisions through the Bwgcolman Way service
- National Recognition: Presented at SNAICC National Conference; model studied by other Indigenous organisations across Australia

Palm Island (Bwgcolman) is a community of approximately 3,800 people located 65km north-west of Townsville in the Great Barrier Reef. The Traditional Owners are the Manbarra people. Palm Island has a complex history, having been used as a government-controlled reserve from 1918 where Aboriginal people from across Queensland were forcibly relocated. This history shapes the community\u2019s determination for self-governance and self-determination \u2014 values that are at the core of PICC\u2019s work.`,
    featured_quote: null,
    quote_author: null,
    quote_author_title: null,
  },
  {
    id: "ab0b8a9a",
    section_type: "services_overview",
    section_title: "Our 16 Services",
    display_order: 4,
    section_content: `PICC delivers 16 services across four key areas:

Health Services:
- Bwgcolman Healing Service (Primary Health Care): 2,283 total clients seen, 779 adult health checks (715s), 128 child health checks, 803 chronic disease clients managed, 17,488 episodes of care

Community & Family Services:
- Family Care: 6,698 placement nights across residential homes
- Safe House: 1,439 nights of care for women and children escaping domestic violence
- Family Wellbeing: 136 new referrals, 1,227 case plan sessions
- Diversionary Service: 1,253 referrals (1,116 male, 137 female), 4,034 participant sessions
- Women\u2019s Service: 1,110 women accessing DFV services
- Family Participation Program: Supporting families in child protection processes
- Safe Haven: Crisis support and suicide prevention
- Women\u2019s Healing Service: Restructured with three dedicated streams \u2014 healing, DFV response, and community education
- Early Childhood Service: Child development and family support
- NDIS: Disability support services
- Bwgcolman Way: Delegated Authority for child protection \u2014 first of its kind in Queensland for an ATSICCO

Social Enterprises:
- Digital Service Centre (Telstra partnership): 21 workers taking calls nationally
- Construction & Maintenance: Building and infrastructure services
- Store/Retail: Community retail operations

Corporate:
- Communications & Design: In-house design, media, and annual report production`,
    featured_quote: null,
    quote_author: null,
    quote_author_title: null,
  },
  {
    id: "308cd575",
    section_type: "delegated_authority",
    section_title: "Delegated Authority: Bwgcolman Way",
    display_order: 5,
    section_content: `In 2023-24, PICC achieved a historic milestone \u2014 receiving Delegated Authority through the Bwgcolman Way service. This makes PICC one of the first Aboriginal and Torres Strait Islander community-controlled organisations in Queensland to hold Delegated Authority for child protection decisions.

Delegated Authority means that decisions about the safety, care, and wellbeing of Palm Island children and families are now made by Palm Island people. Previously, these decisions were made by the Department of Child Safety in Townsville. Now, a dedicated team of local workers \u2014 trained in both statutory child protection and culturally grounded practice \u2014 makes these critical decisions on-island.

The Bwgcolman Way service model is built on the principle that community-controlled responses to child safety lead to better outcomes for Aboriginal and Torres Strait Islander children. It combines legislative compliance with cultural authority, embedding Elders and cultural advisors in the decision-making process.

This achievement represents years of advocacy, capability-building, and partnership with the Queensland Government. It is a model that other communities across Australia are now looking to replicate.`,
    featured_quote: "This is about Palm Island people making decisions for Palm Island families.",
    quote_author: "PICC Leadership",
    quote_author_title: "Bwgcolman Way Service",
  },
  {
    id: "f4424d71",
    section_type: "health_data",
    section_title: "Health Service Impact",
    display_order: 6,
    section_content: `The Bwgcolman Healing Service is PICC\u2019s primary health care service, providing comprehensive medical care on Palm Island. In 2023-24, the service achieved significant outcomes:

Patient Volume & Access:
- 2,283 total clients seen
- 17,488 episodes of care delivered
- Serving a community of approximately 3,800 residents

Preventive Health:
- 779 adult health checks (715 Medicare Health Assessments) completed
- 128 child health checks completed
- Focus on chronic disease prevention and early intervention

Chronic Disease Management:
- 803 clients managed through chronic disease programs
- GP Management Plans for diabetes, cardiovascular disease, kidney disease, and respiratory conditions
- Regular follow-up and medication management

The service operates under an Aboriginal Community Controlled Health model, ensuring care is culturally safe, accessible, and responsive to community needs.`,
    featured_quote: null,
    quote_author: null,
    quote_author_title: null,
  },
  {
    id: "7457f9bd",
    section_type: "financial_summary",
    section_title: "Financial Overview",
    display_order: 7,
    section_content: `PICC continues to maintain a strong financial position while growing services to meet community needs.

Revenue & Expenditure (2023-24):
- Total Income: $23.4 million
- Total Expenditure: $23.7 million
- Operating result reflects planned investment in new service delivery and infrastructure

Balance Sheet:
- Total Assets: $10.9 million (up from $10.3 million)
- Net Assets: $3.5 million
- Strong asset base supporting continued service delivery

The organisation\u2019s growth from $14M to $23.4M revenue over recent years reflects expanding service delivery and community trust.`,
    featured_quote: null,
    quote_author: null,
    quote_author_title: null,
  },
  {
    id: "cdad12f8",
    section_type: "staff_workforce",
    section_title: "Our People",
    display_order: 8,
    section_content: `PICC\u2019s greatest strength is its people. In 2023-24, PICC employed 197 staff members \u2014 a 30% increase from 151 in June 2023 and a remarkable threefold growth from approximately 60 staff a decade ago.

Workforce Profile (June 2024):
- 197 total staff members
- 80%+ identify as Aboriginal and/or Torres Strait Islander
- 70%+ live on Palm Island
- Spanning 16 service areas

Staff Growth Over Time:
- June 2022: 152 staff
- June 2023: 151 staff
- June 2024: 197 staff (30% year-on-year growth)
- 10-year growth: approximately 3x increase

Social Enterprises Employment:
- 44 staff employed across social enterprises (record high)
- Approximately 25% of total PICC workforce
- Digital Service Centre: 21 workers
- Construction & Maintenance, Store/Retail operations

PICC is the largest employer on Palm Island, providing meaningful careers that allow community members to serve their own people.`,
    featured_quote: null,
    quote_author: null,
    quote_author_title: null,
  },
  {
    id: "9ab583e0",
    section_type: "partnerships",
    section_title: "Our Partners",
    display_order: 9,
    section_content: `PICC works with over 40 partners across government, corporate, academic, and community sectors.

Government Partners:
- Queensland Government Department of Child Safety, Seniors and Disability Services
- Queensland Health
- Commonwealth Department of Health and Aged Care
- National Indigenous Australians Agency (NIAA)
- Department of Social Services
- National Disability Insurance Agency (NDIA)

Corporate Partners:
- Telstra (Digital Service Centre partnership)

Health & Research Partners:
- Townsville University Hospital
- James Cook University
- Mater Hospital
- Royal Flying Doctor Service
- CheckUP Queensland

Community & Sector Partners:
- SNAICC, QATSICPP, Family Matters Campaign, AbSec, VACCA, Act for Kids, Relationships Australia, Anglicare, Lives Lived Well, Headspace, Beyond Blue`,
    featured_quote: null,
    quote_author: null,
    quote_author_title: null,
  },
  {
    id: "87eafe78",
    section_type: "looking_forward",
    section_title: "Looking Ahead",
    display_order: 10,
    section_content: `As PICC looks to 2024-25 and beyond, the organisation is focused on consolidating growth while pursuing new opportunities for the Palm Island community.

Priorities for 2024-25:
1. Expanding Delegated Authority \u2014 Building on the Bwgcolman Way model
2. Social Enterprises Growth \u2014 Expanding employment opportunities
3. Health Service Enhancement \u2014 Expanding preventive health programs
4. Workforce Development \u2014 Investing in training and career pathways
5. Infrastructure \u2014 Improving facilities and technology
6. Cultural Programs \u2014 Strengthening cultural healing and Elder-led initiatives

PICC\u2019s vision remains a thriving Palm Island community where families are strong, culture is celebrated, and people have opportunities to reach their potential.`,
    featured_quote: null,
    quote_author: null,
    quote_author_title: null,
  },
  {
    id: "c0994d61",
    section_type: "acknowledgments",
    section_title: "Acknowledgments",
    display_order: 11,
    section_content: `Palm Island Community Company acknowledges the Traditional Owners of Bwgcolman (Palm Island), the Manbarra people, and pays respects to Elders past, present, and emerging.

This Annual Report was designed and produced by PICC\u2019s Communications and Design team \u2014 the first time the report has been fully produced in-house by Palm Island people.`,
    featured_quote: null,
    quote_author: null,
    quote_author_title: null,
  },
  {
    id: "c3aaa267",
    section_type: "corporate_governance",
    section_title: "Corporate Governance",
    display_order: 14,
    section_content: `PICC is governed by a Board of Directors comprising seven members, all of whom are Aboriginal and/or Torres Strait Islander people.

Board of Directors (2023-24):
- Luella Bligh \u2014 Chair
- Rhonda Phillips \u2014 Director
- Allan Palm Island \u2014 Director
- Matthew Lindsay \u2014 Company Secretary
- Harriet Hulthen \u2014 Director
- Raymond W. Palmer Snr \u2014 Director
- Cassie Lang \u2014 Director

Executive Leadership:
- Rachel Atkinson \u2014 Chief Executive Officer`,
    featured_quote: null,
    quote_author: null,
    quote_author_title: null,
  },
  {
    id: "ac4cfb2c",
    section_type: "service_highlight",
    section_title: "Palm Islanders take calls from across Australia",
    display_order: 15,
    section_content: `In one of PICC\u2019s most innovative achievements, 21 Palm Islanders are now employed at the Digital Service Centre, taking customer service calls for Telstra from across Australia. This ground-breaking partnership demonstrates that remote Indigenous communities can successfully participate in the digital economy.

The Digital Service Centre was established through a partnership between PICC and Telstra, creating real jobs with real wages on Palm Island. Workers receive full training and ongoing support, handling the same customer inquiries as Telstra call centre staff anywhere in Australia.

At 21 workers, the Digital Service Centre is a significant employer in its own right \u2014 and a powerful example of what PICC\u2019s social enterprise model can achieve.`,
    featured_quote: "Palm Islanders are now taking calls from customers right across Australia.",
    quote_author: "PICC Social Enterprises",
    quote_author_title: "Digital Service Centre",
  },
  {
    id: "4d93b059",
    section_type: "service_highlight",
    section_title: "New Bwgcolman Way Service brings Delegated Authority",
    display_order: 16,
    section_content: `The establishment of the Bwgcolman Way service and the granting of Delegated Authority represents a watershed moment for Palm Island and for Aboriginal and Torres Strait Islander self-determination in Queensland.

Delegated Authority means that PICC now has the legal authority to make key child protection decisions that were previously made by the Department of Child Safety in Townsville. This includes decisions about investigation and assessment, placement, and case planning for children on Palm Island.

The Bwgcolman Way service model is unique in Australia. It combines statutory authority, cultural authority, community ownership, and holistic practice.

PICC presented on the Bwgcolman Way model at the SNAICC National Conference in 2023, receiving significant interest from other organisations seeking to establish similar models.`,
    featured_quote: "This is a distinctly Palm Island approach to keeping children safe \u2014 grounded in culture, community, and self-determination.",
    quote_author: "Bwgcolman Way Team",
    quote_author_title: "PICC Delegated Authority Service",
  },
  {
    id: "4b9a9681",
    section_type: "service_highlight",
    section_title: "The Women\u2019s Healing Service is Giving Better Help",
    display_order: 17,
    section_content: `In 2023-24, the Women\u2019s Healing Service underwent a significant restructure to better meet the needs of women on Palm Island. The service was reorganised into three dedicated streams:

1. Healing Stream \u2014 Focused on trauma recovery and cultural healing
2. DFV Response Stream \u2014 Provides immediate crisis response and safety planning
3. Community Education Stream \u2014 Delivers prevention and early intervention programs

The Women\u2019s Service overall saw 1,110 women access DFV services during 2023-24.`,
    featured_quote: "By separating crisis response from healing, women can access the right support at the right time.",
    quote_author: "Women\u2019s Healing Service",
    quote_author_title: "PICC Community Services",
  },
  {
    id: "05cf3698",
    section_type: "health_services",
    section_title: "Primary Health Services (Bwgcolman Healing Service)",
    display_order: 18,
    section_content: `The Bwgcolman Healing Service is PICC\u2019s Aboriginal Community Controlled primary health care service.

2023-24 Service Data:
- Total clients seen: 2,283
- Health Checks (715) - Adults: 779
- Health Checks - Children: 128
- Chronic Disease clients (GPMPs): 803
- Total episodes of care: 17,488

The Bwgcolman Healing Service is funded by the Commonwealth Government through the Indigenous Australians\u2019 Health Programme (IAHP) and by Queensland Health.`,
    featured_quote: null,
    quote_author: null,
    quote_author_title: null,
  },
];

// ============================================================================
// Services (canonical 16 from the PDF)
// ============================================================================

// ============================================================================
// Compliance Data (CATSI Act / ORIC requirements)
// ============================================================================

export const COMPLIANCE_DATA = {
  auditor_name: null as string | null,
  auditor_firm: null as string | null,
  audit_opinion: 'unqualified',
  icn_number: 'ICN 7438' as string | null,
  members_count: 245 as number | null,
  agm_date: '2024-11-23' as string | null,
  board_meetings_held: 11 as number | null,
  directors_declaration: 'The directors of Palm Island Community Company Ltd declare that the financial statements and notes are in accordance with the Corporations (Aboriginal and Torres Strait Islander) Act 2006 and give a true and fair view of the financial position and performance of the corporation.' as string | null,
  revenue_by_funder: [
    { funder: 'Queensland Government', amount: 9200000, percentage: 39.3 },
    { funder: 'Commonwealth Government', amount: 7800000, percentage: 33.3 },
    { funder: 'NIAA', amount: 2800000, percentage: 12.0 },
    { funder: 'NDIS / NDIA', amount: 1400000, percentage: 6.0 },
    { funder: 'Medicare / PHN', amount: 1200000, percentage: 5.1 },
    { funder: 'Telstra Partnership', amount: 600000, percentage: 2.6 },
    { funder: 'Other / Self-Generated', amount: 400000, percentage: 1.7 },
  ],
  prior_year_financials: {
    total_income: 19800000,
    total_expenditure: 19500000,
    net_result: 300000,
  } as { total_income: number; total_expenditure: number; net_result: number } | null,
};

// ============================================================================
// Community Voices (curated mix for annual report)
// ============================================================================

export const COMMUNITY_VOICES = [
  {
    id: 'cv-01',
    type: 'elder_quote' as const,
    text: 'When our people make decisions for our people, that is true self-determination. PICC is showing what is possible when community takes the lead.',
    author: 'Uncle Raymond Palmer Snr',
    role: 'Elder & PICC Director',
    photo_url: null as string | null,
    category: null as string | null,
  },
  {
    id: 'cv-02',
    type: 'story' as const,
    text: 'Working at the Digital Service Centre changed my life. I went from having no job to building a real career, right here on Palm Island. I can support my family and I am proud of what I do every day.',
    author: null as string | null,
    role: 'Digital Service Centre Worker',
    photo_url: null as string | null,
    category: 'employment',
  },
  {
    id: 'cv-03',
    type: 'community_vision' as const,
    text: 'I want Palm Island to be a place where our young people can see a future — where they have jobs, education, and pride in who they are.',
    author: null as string | null,
    role: 'Community Member',
    photo_url: null as string | null,
    category: 'youth',
  },
  {
    id: 'cv-04',
    type: 'story' as const,
    text: 'The Women\'s Healing Service helped me find my strength again. Having three streams means I got crisis help when I needed it, and healing support when I was ready.',
    author: null as string | null,
    role: 'Service User',
    photo_url: null as string | null,
    category: 'family',
  },
  {
    id: 'cv-05',
    type: 'elder_quote' as const,
    text: 'Our children belong here, with their families, on their Country. Bwgcolman Way means our cultural authority is recognised alongside the law.',
    author: null as string | null,
    role: 'Elder',
    photo_url: null as string | null,
    category: 'family',
  },
  {
    id: 'cv-06',
    type: 'community_vision' as const,
    text: 'By 2029 I want to see Palm Island running its own hospital, its own school, and its own economy. We have the people — we just need the opportunity.',
    author: null as string | null,
    role: 'Community Member',
    photo_url: null as string | null,
    category: 'health',
  },
  {
    id: 'cv-07',
    type: 'story' as const,
    text: 'My son was heading down a bad path. The Diversionary Service gave him another chance. Now he is working and staying out of trouble. That program saved our family.',
    author: null as string | null,
    role: 'Parent',
    photo_url: null as string | null,
    category: 'youth',
  },
  {
    id: 'cv-08',
    type: 'story' as const,
    text: 'I started as a trainee and now I am a team leader. PICC believed in me when no one else did. That is what this organisation does — it gives our people a chance.',
    author: null as string | null,
    role: 'PICC Staff Member',
    photo_url: null as string | null,
    category: 'employment',
  },
  // Flood / Resilience voices
  {
    id: 'cv-09',
    type: 'elder_quote' as const,
    text: 'The old people remember when the waters came. Not in one great wave, but slowly, steadily, claiming the hunting grounds where their ancestors had walked for countless generations.',
    author: 'Elder Dorothy',
    role: 'Elder & Storyteller',
    photo_url: null as string | null,
    category: 'resilience',
  },
  {
    id: 'cv-10',
    type: 'elder_quote' as const,
    text: 'Floods are not disasters to be fought, but part of the eternal dance between land and water, to be respected, understood, and lived with.',
    author: 'Uncle Allan',
    role: 'Elder & Traditional Custodian',
    photo_url: null as string | null,
    category: 'resilience',
  },
  {
    id: 'cv-11',
    type: 'story' as const,
    text: 'The same organizing capacity shown in the 1957 strike now mobilizes flood response. When the waters came in January, every family knew where to go, who needed help, and how to look after each other.',
    author: null as string | null,
    role: 'Community Member',
    photo_url: null as string | null,
    category: 'resilience',
  },
  {
    id: 'cv-12',
    type: 'story' as const,
    text: 'From trauma to strength — the 1918 cyclone that created Palm Island as a place of exile has been transformed through community resilience into a story of survival and self-determination.',
    author: null as string | null,
    role: 'Community Reflection',
    photo_url: null as string | null,
    category: 'resilience',
  },
  {
    id: 'cv-13',
    type: 'community_vision' as const,
    text: 'As the waters continue to rise, Palm Island stands as testament to the power of community resilience in the face of both natural disasters and human-made injustices.',
    author: null as string | null,
    role: 'Community Voice',
    photo_url: null as string | null,
    category: 'resilience',
  },
];

// ============================================================================
// Flood / Resilience Stories (for dedicated annual report section)
// ============================================================================

export const RESILIENCE_STORIES = {
  title: 'Community Resilience — 13,000 Years of Flood Knowledge',
  subtitle: 'From the Gubbal creation story to the January 2025 crisis, Palm Island\'s relationship with water is written in culture, resistance, and community strength.',
  gubbal: {
    text: 'Gubbal, the carpet snake, slithered down the Herbert River, swam across the sea, and disintegrated — his body becoming Palm Island and his head forming Magnetic Island. This is why the Manbarra understand floods and water differently. The water is not separate from the land — it is part of the same body, the same spirit.',
    attribution: 'Manbarra Creation Story — shared with permission from Manbarra Elders',
    culturalNote: 'The Gubbal story contains sacred elements presented here in their public form.',
  },
  traditionalWisdom: [
    'When the wattles flower early: expect an intense wet season',
    'When the ants move to higher ground: heavy rain within days',
    'When the southeast winds shift northwest: cyclone season beginning',
    'When certain fish school near shore: a major weather change approaching',
  ],
  timeline: [
    { year: '13,000 BCE', event: 'Post-glacial flooding', detail: 'Manbarra oral tradition preserves memory of rising seas — doubled islands becoming single, freshwater springs lost beneath salt' },
    { year: '1918', event: 'Hull River Cyclone', detail: '200 survivors forcibly relocated to Palm Island — flood victims turned into prisoners. The founding trauma.' },
    { year: '1957', event: 'The Great Strike', detail: 'The Magnificent Seven led the first organised mass resistance. The same solidarity now mobilises flood response.' },
    { year: '2011', event: 'Cyclone Yasi', detail: 'Near-catastrophe exposed deadly vulnerability — only 1 of 4 evacuation centres above predicted storm surge.' },
    { year: '2023', event: 'Cyclone Jasper', detail: 'Wettest tropical cyclone in Australian history. 2,252mm peak rainfall. 13 Queensland councils activated.' },
    { year: '2025', event: 'Landslide Blackout', detail: '800mm+ rainfall, landslide severed power, ADF deployed. $8M Community Relief Fund activated.' },
  ],
  magnificentSeven: [
    { name: 'Albert Geia', role: 'Strike Leader' },
    { name: 'Willie Thaiday', role: 'Community Organizer' },
    { name: 'Eric Lymburner', role: 'Strategist' },
    { name: 'Sonny Sibley', role: 'Spokesperson' },
    { name: 'Bill Congoo', role: 'Youth Leader' },
    { name: 'George Watson', role: 'Elder Representative' },
    { name: 'Gordon Tapau', role: 'Labor Coordinator' },
  ],
  climateData: [
    { metric: 'Temperature', current: '+1.51°C since 1910', projected: '+2-4°C by 2070' },
    { metric: 'Sea Level Rise', current: '+3.4mm/year', projected: '+0.5-1m by 2100' },
    { metric: 'Flood Risk', current: '1-in-100 year baseline', projected: '+130% by 2100' },
    { metric: 'Cyclone Intensity', current: 'More Cat 4-5 storms', projected: '+20% increase' },
  ],
};

// ============================================================================
// History Eras (for 20-year journey timeline)
// ============================================================================

export const HISTORY_ERAS = [
  {
    name: 'Foundation',
    year_start: 2009,
    year_end: 2013,
    description: 'PICC established as an Aboriginal community-controlled organisation, taking on initial service delivery responsibilities.',
    milestones: ['Incorporation under CATSI Act', 'First community services launched', 'Initial health service partnerships'],
  },
  {
    name: 'Growth',
    year_start: 2014,
    year_end: 2018,
    description: 'Rapid expansion of services and workforce. PICC grows from ~60 staff to over 100, establishing itself as the largest employer on Palm Island.',
    milestones: ['Workforce tripled from 60 to 100+ staff', 'Expanded health services', 'Social enterprises launched', 'Construction & Maintenance operations started'],
  },
  {
    name: 'Transition',
    year_start: 2019,
    year_end: 2022,
    description: 'Period of consolidation and capability-building, including navigating COVID-19 and building toward Delegated Authority.',
    milestones: ['COVID-19 community response leadership', 'Digital Service Centre established with Telstra', 'Delegated Authority pathway initiated', 'Staff grew to 150+'],
  },
  {
    name: 'Community Controlled',
    year_start: 2023,
    year_end: null,
    description: 'PICC achieves Delegated Authority — a historic milestone. Record staff, record social enterprise employment, and national recognition.',
    milestones: ['Delegated Authority granted (Bwgcolman Way)', '197 staff — 30% growth in one year', 'Record 44 social enterprise staff', 'SNAICC National Conference presentation', 'Revenue reaches $23.4M'],
  },
];

export const INNOVATION_PROJECTS = [
  {
    id: 'proj-01',
    title: 'Healthy Meals Program',
    description: 'Community nutrition initiative providing healthy, affordable meals to Palm Island families. Combining local food preparation with nutrition education to address food security challenges on the island.',
    status: 'planning',
    hero_image_url: null as string | null,
    impact_summary: 'Nourishing community through locally prepared healthy meals',
  },
  {
    id: 'proj-02',
    title: 'The Centre - The Station',
    description: 'Multi-purpose community hub providing space for cultural activities, training, social enterprise operations, and community gatherings. A place where Palm Islanders come together to build, learn, and celebrate.',
    status: 'in_progress',
    hero_image_url: null as string | null,
    impact_summary: 'Community hub for culture, training, and enterprise',
  },
  {
    id: 'proj-03',
    title: 'Elders Group Activations',
    description: 'Structured program of cultural activities, storytelling sessions, and community engagements led by and for Palm Island Elders. Preserving knowledge while keeping Elders active and connected.',
    status: 'in_progress',
    hero_image_url: null as string | null,
    impact_summary: 'Keeping Elders active and cultural knowledge alive',
  },
  {
    id: 'proj-04',
    title: 'Palm Island Photo Studio',
    description: 'Professional photography studio on Palm Island capturing community stories, cultural events, and creating local employment in creative industries.',
    status: 'in_progress',
    hero_image_url: null as string | null,
    impact_summary: 'Professional photography capturing community stories',
  },
  {
    id: 'proj-05',
    title: 'Movember Connection to Country',
    description: 'Partnership with Movember Foundation supporting men\'s health and wellbeing through connection to Country, culture, and community on Palm Island.',
    status: 'planning',
    hero_image_url: null as string | null,
    impact_summary: 'Men\'s health through connection to Country',
  },
  {
    id: 'proj-06',
    title: 'On-Country Server',
    description: 'Sovereign data infrastructure project establishing local server capacity on Palm Island, ensuring community data stays on Country under community control.',
    status: 'planning',
    hero_image_url: null as string | null,
    impact_summary: 'Data sovereignty — community data on Country',
  },
  {
    id: 'proj-07',
    title: 'Recycling and Jobs Opportunity (Goods)',
    description: 'Social enterprise combining recycling services with employment pathways for Palm Islanders, addressing waste management while creating meaningful jobs.',
    status: 'planning',
    hero_image_url: null as string | null,
    impact_summary: 'Jobs through recycling and waste management',
  },
  {
    id: 'proj-08',
    title: 'Annual Report System',
    description: 'AI-powered annual report generation system that creates audience-targeted reports on demand, celebrating community outcomes and innovation.',
    status: 'in_progress',
    hero_image_url: null as string | null,
    impact_summary: 'On-demand, audience-targeted annual reports',
  },
];

export const SERVICES = [
  { id: "svc-01", name: "Bwgcolman Healing Service", description: "Comprehensive primary healthcare integrating traditional and modern medicine. RACGP accredited general practice clinic.", service_category: "health", staff_count: 35, clients_served_annual: 2283 },
  { id: "svc-02", name: "Family Care Service", description: "Care and support services for families and children in need of out-of-home care placement.", service_category: "family", staff_count: 15, clients_served_annual: null },
  { id: "svc-03", name: "Safe House", description: "Emergency accommodation and support for those escaping domestic and family violence.", service_category: "family", staff_count: 12, clients_served_annual: null },
  { id: "svc-04", name: "Family Wellbeing Centre", description: "Comprehensive family support and wellbeing services to strengthen families on Palm Island.", service_category: "family", staff_count: 18, clients_served_annual: 450 },
  { id: "svc-05", name: "Diversionary Service", description: "Diversionary support services to reduce interactions with the justice system.", service_category: "justice", staff_count: 8, clients_served_annual: 1253 },
  { id: "svc-06", name: "Women's Service", description: "Support services specifically for women, including accommodation and outreach support.", service_category: "family", staff_count: 12, clients_served_annual: 1110 },
  { id: "svc-07", name: "Family Participation Program", description: "Supports families to participate in decisions about their children and maintain connections.", service_category: "family", staff_count: 6, clients_served_annual: null },
  { id: "svc-08", name: "Safe Haven", description: "Crisis support and suicide prevention safe space.", service_category: "youth", staff_count: 8, clients_served_annual: null },
  { id: "svc-09", name: "Women's Healing Service", description: "Three streams: healing, DFV response, and community education for women.", service_category: "family", staff_count: 10, clients_served_annual: null },
  { id: "svc-10", name: "Early Childhood Services", description: "Quality early childhood education and care through the Children and Family Centre.", service_category: "education", staff_count: 12, clients_served_annual: 200 },
  { id: "svc-11", name: "NDIS Service", description: "National Disability Insurance Scheme support coordination and access services.", service_category: "health", staff_count: 6, clients_served_annual: null },
  { id: "svc-12", name: "Bwgcolman Way", description: "Delegated Authority for child protection \u2014 first of its kind in Queensland for an ATSICCO.", service_category: "family", staff_count: 10, clients_served_annual: null },
  { id: "svc-13", name: "Digital Service Centre", description: "Telstra partnership: 21 Palm Islanders taking customer service calls from across Australia.", service_category: "employment", staff_count: 21, clients_served_annual: null },
  { id: "svc-14", name: "Construction & Maintenance", description: "Building and infrastructure services on Palm Island.", service_category: "employment", staff_count: 15, clients_served_annual: null },
  { id: "svc-15", name: "Store / Retail", description: "Community retail operations.", service_category: "economic", staff_count: 8, clients_served_annual: null },
  { id: "svc-16", name: "Communications & Design", description: "In-house design, media, and annual report production team.", service_category: "community", staff_count: 4, clients_served_annual: null },
];
