/**
 * PICC FY24-25 Annual Report — Content Source (TypeScript mirror).
 *
 * Single source of truth in code. Mirrors PICC-2024-25-BRAND-BOOK.md.
 *
 * Both the digital experience (`app/(public)/annual-report-2024-25/`) and
 * any future React-PDF render path consume this file. Edit once, render twice.
 *
 * When content changes:
 *   1. Update the brand book .md
 *   2. Update this file
 *   3. Both renders pick up the change at next build
 */

import type { SectionKey } from '@/lib/pdf/theme'

// ─────────────────────────────────────────────────────────────────────────────
// Types
// ─────────────────────────────────────────────────────────────────────────────

export type VoiceRegister = 'elder' | 'community' | 'vision'

export interface Quote {
  id: string
  text: string
  speaker: string
  role: string
  source: string
  validated: 'public' | 'derived' | 'pending'
  register: VoiceRegister
  /** Page slot IDs where this quote can appear */
  slots: string[]
  date?: string
  consent?: string
}

export interface Stat {
  id: string
  value: string
  label: string
  source: string
  year: string
  caption?: string
  slots: string[]
}

export interface Story {
  id: string
  title: string
  text: string
  slots: string[]
}

export interface ForwardCommitment {
  id: string
  year: string
  title: string
  statement: string
  detail: string
  section: SectionKey
}

export interface PageSpec {
  /** Slot ID matches the folder name in `public/report-assets/2024-25-pool/<slot>/` */
  slot: string
  /** Print page number range, e.g. "00", "02-03", "07-08" */
  pages: string
  /** Element type from the 12-element grammar */
  element:
    | 'cover'
    | 'acknowledgement'
    | 'cartouche'
    | 'reliquary'
    | 'songline'
    | 'lantern'
    | 'hearth'
    | 'horizon'
    | 'atlas'
    | 'specimen'
    | 'kulingField'
    | 'vitrine'
    | 'fold'
    | 'marginNote'
    | 'compose' /* a page that composes multiple elements */
  section: SectionKey | 'all' | 'governance'
  title: string
  subtitle?: string
  promise?: string
  /** Audience variants this page appears in */
  audiences: ReadonlyArray<'community' | 'funder' | 'supporter' | 'board' | 'government'>
  /** Quote IDs to draw from the quote library */
  quotes: string[]
  /** Stat IDs to draw from the number library */
  stats: string[]
  /** Story IDs */
  stories: string[]
  /** Photo filenames (relative to slot folder) — recommended primary first */
  photos: string[]
  /** Generated-image filenames (relative to slot folder) */
  generated: string[]
  /** Optional Roman numeral for Cartouche pages */
  numeral?: string
  /** Notes / gaps / TODOs */
  notes?: string
}

// ─────────────────────────────────────────────────────────────────────────────
// §5.1 Quote Library
// ─────────────────────────────────────────────────────────────────────────────

export const QUOTES: Quote[] = [
  // Elder Wisdom
  {
    id: 'EQ-001',
    text: 'Our mother was one of the stolen generation. You can just imagine the hardship that we had to go through. We carry her, and we carry the next ones.',
    speaker: 'Aunty Ethel Robertson',
    role: 'Bwgcolman Elder · Stolen Generations descendant',
    source: 'EL transcript Nov 2024',
    validated: 'public',
    register: 'elder',
    slots: ['18-elder-lanterns'],
    date: 'Nov 2024',
    consent: 'Recorded with consent · Cultural review complete · Empathy Ledger',
  },
  {
    id: 'EQ-002',
    text: 'My name is Alan Palm Island. We are here on Spoongeman Barra, Great Palm Island.',
    speaker: 'Uncle Allan Palm Island',
    role: 'Manbarra Traditional Owner',
    source: 'EL elders-trip Oct 2025',
    validated: 'public',
    register: 'elder',
    slots: ['18-elder-lanterns', '05-elders'],
  },
  {
    id: 'EQ-003',
    text: 'We are the descendants of the IRI Manga Island.',
    speaker: 'Aunty Ethel Robertson',
    role: 'Bwgcolman Elder',
    source: 'EL transcript Nov 2024',
    validated: 'public',
    register: 'elder',
    slots: ['05-elders'],
  },
  {
    id: 'EQ-004',
    text: 'Family is everything.',
    speaker: 'Aunty Iris May Whitey',
    role: 'Bwgcolman Elder',
    source: 'EL transcript',
    validated: 'public',
    register: 'elder',
    slots: ['18-elder-lanterns'],
  },
  {
    id: 'EQ-005',
    text: "She didn't want us to be lonely like she did.",
    speaker: 'Aunty Cyndel Louise Pryor',
    role: 'Bwgcolman Elder',
    source: 'EL elders-trip 2025',
    validated: 'public',
    register: 'elder',
    slots: ['18-elder-lanterns'],
  },
  {
    id: 'EQ-006',
    text: "Mum's never known her history.",
    speaker: 'Aunty Cyndel Louise Pryor',
    role: 'Bwgcolman Elder',
    source: 'EL elders-trip 2025',
    validated: 'public',
    register: 'elder',
    slots: ['06-hull-river-songline'],
  },
  {
    id: 'EQ-007',
    text: 'Many old people said that our family were sent up there.',
    speaker: 'Uncle Allan Palm Island',
    role: 'Manbarra Traditional Owner',
    source: 'EL elders-trip 2025',
    validated: 'public',
    register: 'elder',
    slots: ['06-hull-river-songline'],
  },
  {
    id: 'EQ-008',
    text: 'We are on our way up to Mission Beach to uncover a scenery that would happen back in 1918.',
    speaker: 'Uncle Allan Palm Island',
    role: 'Manbarra TO',
    source: 'EL elders-trip 2025',
    validated: 'public',
    register: 'elder',
    slots: ['06-hull-river-songline'],
  },

  // Community Story
  {
    id: 'CQ-001',
    text: 'We are working with the community, not for the community.',
    speaker: 'Rachel Atkinson',
    role: 'CEO · Palm Island Community Company',
    source: 'EL CEO Legacy interview Aug 2024',
    validated: 'public',
    register: 'community',
    slots: ['02-rachel-message', '19-staff-hearths'],
    date: 'Aug 2024',
  },
  {
    id: 'CQ-002',
    text: 'Most of every PICC dollar pays a Palm Islander to deliver a service to another Palm Islander.',
    speaker: 'Rachel Atkinson',
    role: 'CEO',
    source: 'CEO message draft (echoing Ipsos 2019)',
    validated: 'derived',
    register: 'community',
    slots: ['02-rachel-message', '22-financials'],
  },
  {
    id: 'CQ-003',
    text: 'Every child has a right to feel safe. Every child has a right to access early childhood services. Every family has a right to have a sense of belonging and ownership of their future.',
    speaker: 'Rachel Atkinson',
    role: 'CEO',
    source: 'EL CEO Legacy interview',
    validated: 'public',
    register: 'community',
    slots: ['02-rachel-message', '19-staff-hearths'],
  },
  {
    id: 'CQ-004',
    text: "Our children are our future. They are our ancestors of tomorrow. We've gotta make it right for them.",
    speaker: 'Rachel Atkinson',
    role: 'CEO',
    source: 'EL CEO Legacy interview',
    validated: 'public',
    register: 'community',
    slots: ['24-back-cover', '02-rachel-message'],
  },
  {
    id: 'CQ-005',
    text: 'It was really hard, because we flooded out, we lost all of our equipment.',
    speaker: 'Hailey Jane Wetzel',
    role: 'CFC Manager',
    source: 'EL daycare flood interview',
    validated: 'public',
    register: 'community',
    slots: ['19-staff-hearths', '09-cartouche-children-families'],
    date: '2024',
  },
  {
    id: 'CQ-006',
    text: 'We flooded out, we lost all of our equipment. We came together as a team — but as a community as well.',
    speaker: 'CFC childcare staff',
    role: 'Children and Family Centre team',
    source: 'EL childcare workers interview',
    validated: 'public',
    register: 'community',
    slots: ['09-cartouche-children-families'],
  },
  {
    id: 'CQ-007',
    text: 'As a local returning to work on Palm Island, I am proud to be part of the PICC team that is helping to close the gap for Indigenous Australians.',
    speaker: 'Dr Raymond Blackman',
    role: 'PICC Health Doctor · Bwgcolman Healing Service',
    source: 'curated quote (validated, public)',
    validated: 'public',
    register: 'community',
    slots: ['12-reliquary-bhs', '19-staff-hearths'],
  },
  {
    id: 'CQ-008',
    text: 'I have found that being at the CFC was like being with family. It is very family friendly especially when you have kids and we have built a rapport with the Doctors and staff.',
    speaker: 'Donnaleece Obah',
    role: 'community member',
    source: 'curated quote (validated, public)',
    validated: 'public',
    register: 'community',
    slots: ['09-cartouche-children-families'],
  },
  {
    id: 'CQ-009',
    text: 'What I do for work is youth services. So I work with disengaged kids or kids not going to school. They come here and we create programs with them.',
    speaker: 'Henry Doyle',
    role: 'Youth worker · PICC Youth Services',
    source: 'EL flood/youth interview',
    validated: 'public',
    register: 'community',
    slots: ['19-staff-hearths', '14-cartouche-youth'],
  },
  {
    id: 'CQ-010',
    text: 'My time is not done here on Palm so I see myself coming back in a different capacity each couple of years sort of like a boomerang — you cannot get rid of me.',
    speaker: 'Jess Smit',
    role: 'Youth worker',
    source: 'EL',
    validated: 'public',
    register: 'community',
    slots: ['19-staff-hearths', '14-cartouche-youth'],
  },
  {
    id: 'CQ-011',
    text: "We have to become independent, where we can decide what kind of a day we're gonna have.",
    speaker: 'Clay Alfred',
    role: "Men's Pathway to Healing · Specialist DFV Service",
    source: "EL men's group interview",
    validated: 'public',
    register: 'community',
    slots: ['19-staff-hearths'],
  },
  {
    id: 'CQ-016',
    text: 'Indigenous data sovereignty. That is what we are building, alongside everything else.',
    speaker: 'Tammy',
    role: 'BEAI Program Lead',
    source: 'EL BEAI interview',
    validated: 'public',
    register: 'community',
    slots: ['19-staff-hearths', '16-cartouche-education'],
  },

  // Community Vision (Luella + Bwgcolman Way blueprint)
  {
    id: 'VQ-001',
    text: 'PICC belongs to the community.',
    speaker: 'Luella Bligh',
    role: 'Chair',
    source: 'Chair message draft',
    validated: 'derived',
    register: 'vision',
    slots: ['03-luella-message'],
  },
  {
    id: 'VQ-002',
    text: 'Distant governments telling Palm Island what to do and how to do it has never worked and will never work.',
    speaker: 'Luella Bligh',
    role: 'Chair',
    source: 'curated quote (validated, public)',
    validated: 'public',
    register: 'vision',
    slots: ['03-luella-message'],
  },
  {
    id: 'VQ-003',
    text: 'We do not move on these numbers. They are the point.',
    speaker: 'Luella Bligh',
    role: 'Chair',
    source: 'Chair message draft',
    validated: 'derived',
    register: 'vision',
    slots: ['03-luella-message'],
  },
  {
    id: 'VQ-006',
    text: 'The positive changes we strive for are becoming evident — particularly among our young people, who are beginning to feel a sense of optimism about the future of Palm Island.',
    speaker: 'Luella Bligh',
    role: 'Chair',
    source: 'curated quote (validated, public)',
    validated: 'public',
    register: 'vision',
    slots: ['03-luella-message'],
  },
  {
    id: 'BQ-001',
    text: 'Bwgcolman means many tribes, one people.',
    speaker: 'Bwgcolman Way blueprint',
    role: 'Reclaiming our Storyline (April 2023)',
    source: 'QATSICPP + DCSSDS blueprint',
    validated: 'public',
    register: 'vision',
    slots: ['10-reliquary-bwgcolman-way'],
  },
  {
    id: 'BQ-002',
    text: 'Our vision is that all Manbarra and Bwgcolman children are safe and cared for by family, nurtured by strong and enduring connections to their community, culture and Country.',
    speaker: 'Bwgcolman Way blueprint',
    role: 'Vision statement',
    source: 'Reclaiming our Storyline',
    validated: 'public',
    register: 'vision',
    slots: ['10-reliquary-bwgcolman-way'],
  },
  {
    id: 'BQ-003',
    text: 'Palm Island mob leading and creating change for Palm Island children, young people and families.',
    speaker: 'Bwgcolman Way blueprint',
    role: 'Blueprint principle',
    source: 'Reclaiming our Storyline',
    validated: 'public',
    register: 'vision',
    slots: ['10-reliquary-bwgcolman-way'],
  },
  {
    id: 'BQ-004',
    text: 'This change has been decades in the making.',
    speaker: 'Bwgcolman Way blueprint',
    role: 'Blueprint',
    source: 'Reclaiming our Storyline',
    validated: 'public',
    register: 'vision',
    slots: ['10-reliquary-bwgcolman-way'],
  },
]

// ─────────────────────────────────────────────────────────────────────────────
// §5.2 Number Library
// ─────────────────────────────────────────────────────────────────────────────

export const STATS: Stat[] = [
  // Headline
  { id: 'N-001', value: '~210', label: 'staff', source: 'operations team', year: 'FY24-25', slots: ['07-year-in-numbers'] },
  { id: 'N-002', value: '75%', label: 'of staff Indigenous', source: 'operations team', year: 'FY24-25', slots: ['07-year-in-numbers'] },
  { id: 'N-003', value: '70%', label: 'of staff Palm Island resident', source: 'operations team', year: 'FY24-25', slots: ['07-year-in-numbers'] },
  { id: 'N-004', value: '17,488', label: 'episodes of primary health care', source: 'BHS audited', year: 'FY23-24', caption: 'FY24-25 pending Mark sign-off', slots: ['07-year-in-numbers', '12-reliquary-bhs'] },
  { id: 'N-005', value: '~24', label: 'active services across 8 categories', source: 'Narelle verified 28 Apr 2026', year: 'FY24-25', slots: ['07-year-in-numbers'] },
  { id: 'N-006', value: '6,698', label: 'placement nights', source: 'Family Care audited', year: 'FY23-24', caption: 'kept with kin, on Country', slots: ['07-year-in-numbers'] },
  { id: 'N-007', value: '~$23.4M', label: 'total income', source: 'preliminary, pending Mark', year: 'FY24-25', slots: ['07-year-in-numbers', '22-financials'] },
  { id: 'N-008', value: '3×', label: 'NDIS service growth in 12 months', source: 'NDIS team', year: 'FY24-25', slots: ['07-year-in-numbers'] },

  // Anchor stats
  { id: 'N-101', value: '1st', label: 'in Queensland', source: 'DCSSDS public · QATSICPP confirmed', year: 'FY24-25', caption: 'Bwgcolman Way · Delegated Authority · Child Protection Act 1999, Part 2A', slots: ['10-reliquary-bwgcolman-way'] },
  { id: 'N-102', value: '$107.8M', label: 'over four years', source: 'Queensland Government 2023', year: '2023-2028', caption: 'Statewide DA commitment, not PICC-only', slots: ['10-reliquary-bwgcolman-way'] },
  { id: 'N-103', value: '2,283', label: 'clients served', source: 'BHS audited', year: 'FY23-24', slots: ['12-reliquary-bhs'] },
  { id: 'N-104', value: '1,935', label: 'First Nations clients', source: 'BHS audited', year: 'FY23-24', slots: ['12-reliquary-bhs'] },
  { id: 'N-109', value: '35', label: 'BHS staff', source: 'operations', year: 'FY24-25', slots: ['12-reliquary-bhs'] },
  { id: 'N-110', value: '10', label: 'Bwgcolman Way team staff', source: 'operations', year: 'FY24-25', slots: ['09-cartouche-children-families', '10-reliquary-bwgcolman-way'] },
  { id: 'N-111', value: '21', label: 'Palm Islanders at Digital Service Centre', source: 'Telstra contract', year: 'FY24-25', slots: ['15-cartouche-economic'] },
  { id: 'N-112', value: '~50', label: 'First Nations languages supported', source: 'Telstra', year: 'FY24-25', slots: ['15-cartouche-economic'] },
  { id: 'N-113', value: '~20', label: 'positive Blue Cards per month', source: 'Blue Card Liaison ops (pilot avg)', year: 'FY24-25', slots: ['16-cartouche-education'] },
  { id: 'N-120', value: '~1,187', label: 'Safe Haven instances of support', source: 'audited', year: 'FY23-24', slots: ['14-cartouche-youth'] },
  { id: 'N-121', value: '15', label: 'Youth Services staff', source: 'operations', year: 'FY24-25', slots: ['14-cartouche-youth'] },
  { id: 'N-122', value: '~380', label: 'young people supported', source: 'operations', year: 'FY24-25', slots: ['14-cartouche-youth'] },
  { id: 'N-123', value: '~120', label: 'Community Justice Group clients', source: 'operations', year: 'FY24-25', slots: ['13-cartouche-justice'] },
  { id: 'N-124', value: '6', label: 'Community Justice Group part-time staff', source: 'operations', year: 'FY24-25', slots: ['13-cartouche-justice'] },
]

// ─────────────────────────────────────────────────────────────────────────────
// §5.3 Story Library
// ─────────────────────────────────────────────────────────────────────────────

export const STORIES: Story[] = [
  {
    id: 'S-001',
    title: 'Cover narrative',
    text: 'A small museum about a place. Not an annual report in the usual sense. A curated exhibition that walks the reader through Year 17 of Palm Island Community Company.',
    slots: ['00-cover'],
  },
  {
    id: 'S-002',
    title: 'Acknowledgement of Country',
    text: 'We acknowledge the Manbarra people as the Traditional Custodians of Palm Island, and the Bwgcolman people — the descendants of the more than forty First Nations forcibly relocated here from across Queensland between 1914 and 1972. We pay our respects to Elders past, present, and emerging. We honour the strength of those who came before us, the wisdom of those who walk with us today, and the future we are building with our children.\n\nBwgcolman — many tribes, one people.',
    slots: ['01-acknowledgement'],
  },
  {
    id: 'S-003',
    title: 'Bwgcolman Way anchor',
    text: 'In 2024-25, the Child Protection Act 1999 was used in a way it has never been used on Palm Island before. Under Part 2A — prescribed delegates for Aboriginal or Torres Strait Islander children — the Queensland Government delegated statutory child-protection functions to the Chief Executive of an Aboriginal and Torres Strait Islander Community Controlled Organisation. PICC became the first ATSICCO in Queensland to receive that authority.\n\nDecisions about whether a Palm Island child is removed, where they are placed, and how their family stays connected to them are no longer made by the state director of child safety in Brisbane. They are made on Palm Island. By Palm Islanders. Guided by our blueprint, Reclaiming our Storyline (April 2023), which the Queensland Aboriginal and Torres Strait Islander Child Protection Peak co-developed with the Department of Child Safety, Seniors and Disability Services.',
    slots: ['10-reliquary-bwgcolman-way', '02-rachel-message'],
  },
  {
    id: 'S-004',
    title: 'CFC daycare rebuild',
    text: 'The Children and Family Centre arrived on Palm Island by barge in June 2012. The CFC is the front door of PICC family services — early childhood, primary health, family support, all under one roof. In late 2023 and early 2024, severe weather and flooding damaged the building and destroyed equipment. The rebuild is the story of FY24-25.\n\nThe team came back. Not "rebuilt" as in restored. Rebuilt as in came back stronger. Hailey Jane Wetzel and her team are the reason. Local employment is what made the rebuild possible. The CFC is more than a building. The team is the building.',
    slots: ['09-cartouche-children-families'],
  },
  {
    id: 'S-005',
    title: 'Bwgcolman Healing Service rename',
    text: "In January 2024, after extensive consultation with the Elders' Advisory Group, the Primary Health Centre was renamed the Bwgcolman Healing Service. Bwgcolman — many tribes, one people. Healing — what we do, in the way our people understand the word. The renaming was symbolic. The work behind it is not.",
    slots: ['12-reliquary-bhs'],
  },
  {
    id: 'S-007',
    title: 'Hull River journey (epilogue)',
    text: 'In late 2025, after the close of the fiscal year this report covers, a group of Elders travelled from Palm Island back to the Hull River, near Mission Beach. We include the journey here because it is the natural epilogue to FY24-25 — the work the year was building toward. For some, it was a return to family stories told but never seen. For others, it was the first time setting foot on land their ancestors had been forcibly removed from a hundred years before.',
    slots: ['06-hull-river-songline'],
  },
  {
    id: 'S-008',
    title: 'PIC Leadership Program',
    text: 'The PIC Leadership Program is PICC own, in-house, accredited leadership program — designed by PICC staff, for PICC staff, building on the lived experience of running 24 services in a remote community. It does what no off-the-shelf program does: it teaches leadership in PICC specific terms.\n\nInitiated in 2024-25 by the existing leadership group. Co-designed with staff across services. Funded by DSS. First cohort begins May 2026. It is the most important investment Year 17 made.',
    slots: ['21-leadership-program'],
  },
  {
    id: 'S-009',
    title: 'Risks acknowledgement',
    text: 'Naming a risk is not admitting failure. It is the precondition for navigating one. Publishing them publicly is an act of accountability to community, members, and partners.',
    slots: ['23-governance'],
  },
  {
    id: 'S-010',
    title: 'Innovation panel',
    text: '15 years of PICC reporting, digitised, indexed, and searchable in seconds. Three local photographers. Hundreds of images. A community-controlled digital archive making the Empathy Ledger work for everyone. Made on Palm Island. Owned on Palm Island.',
    slots: ['20-innovation'],
  },
  {
    id: 'S-011',
    title: 'Closing reflection',
    text: 'Three commitments. Three generations. Aged Care on Palm Island so our Elders never have to leave Country. Bwgcolman Way expanded into health and justice. Every Palm Island story captured, consented, and held by us.\n\nOur children are our future. They are our ancestors of tomorrow. Each of them have a role in growing our community and keeping our culture strong. We have gotta make it right for them.',
    slots: ['24-back-cover', '20-innovation'],
  },
]

// ─────────────────────────────────────────────────────────────────────────────
// Forward commitments (3 Horizons)
// ─────────────────────────────────────────────────────────────────────────────

export const FORWARD_COMMITMENTS: ForwardCommitment[] = [
  {
    id: 'F-001',
    year: '2028',
    title: 'Aged Care on Palm Island',
    statement: 'Our Elders never have to leave Country to be cared for.',
    detail: 'A dedicated facility on Palm. The forward commitment that anchors the next twenty years.',
    section: 'childrenFamilies',
  },
  {
    id: 'F-002',
    year: '2030',
    title: 'Bwgcolman Way Expanded',
    statement: 'Delegated Authority extended into health and justice.',
    detail: 'The first Indigenous-led delegated authority across three domains in Australia.',
    section: 'healthWellbeing',
  },
  {
    id: 'F-003',
    year: '2045',
    title: 'Sovereign Story Archive',
    statement: 'Every Palm Island story captured, consented, and held by us.',
    detail: 'The Empathy Ledger as community-owned cultural infrastructure.',
    section: 'educationCommunity',
  },
]

// ─────────────────────────────────────────────────────────────────────────────
// §6 Page Map — drives both Pencil layout AND digital experience
// ─────────────────────────────────────────────────────────────────────────────

export const PAGE_MAP: PageSpec[] = [
  {
    slot: '00-cover',
    pages: '00',
    element: 'cover',
    section: 'all',
    title: 'Many tribes, one people.',
    subtitle: 'Palm Island Community Company Annual Report 2024–25',
    audiences: ['community', 'funder', 'supporter', 'board', 'government'],
    quotes: [],
    stats: [],
    stories: ['S-001'],
    photos: ['cover-youth-beach.jpg', 'cover-kirrily-2024.jpg'],
    generated: ['T1-1-cover-wash-v1.png', 'T1-1-cover-wash-v2.png'],
  },
  {
    slot: '01-acknowledgement',
    pages: '01',
    element: 'acknowledgement',
    section: 'all',
    title: 'Acknowledgement of Country',
    audiences: ['community', 'funder', 'supporter', 'board', 'government'],
    quotes: [],
    stats: [],
    stories: ['S-002'],
    photos: ['01-concentric-corner.png'],
    generated: [],
  },
  {
    slot: '02-rachel-message',
    pages: '02-03',
    element: 'compose',
    section: 'all',
    title: 'A message from our CEO',
    audiences: ['community', 'funder', 'supporter', 'board', 'government'],
    quotes: ['CQ-001', 'CQ-002', 'CQ-003', 'CQ-004'],
    stats: ['N-001', 'N-005'],
    stories: ['S-003'],
    photos: ['rachel-atkinson.jpg'],
    generated: [],
  },
  {
    slot: '03-luella-message',
    pages: '04',
    element: 'compose',
    section: 'all',
    title: 'A message from our Chair',
    audiences: ['community', 'funder', 'supporter', 'board', 'government'],
    quotes: ['VQ-001', 'VQ-002', 'VQ-003', 'VQ-006'],
    stats: [],
    stories: [],
    photos: ['luella-bligh.jpg'],
    generated: [],
  },
  {
    slot: '04-board',
    pages: '05',
    element: 'compose',
    section: 'governance',
    title: 'Our Board',
    subtitle: 'Community-elected, Traditional-Owner-nominated, skills-appointed.',
    audiences: ['community', 'funder', 'supporter', 'board', 'government'],
    quotes: [],
    stats: [],
    stories: [],
    photos: ['harriet-hulthen.jpg', 'matthew-lindsay.jpg', 'rhonda-phillips.jpg'],
    generated: [],
    notes: 'Group photo MISSING — capture during May 11–13 visit',
  },
  {
    slot: '05-elders',
    pages: '06',
    element: 'compose',
    section: 'governance',
    title: 'Our Elders Group',
    subtitle: 'The conscience and the compass of this organisation.',
    audiences: ['community', 'funder', 'supporter', 'board', 'government'],
    quotes: ['EQ-002', 'EQ-003'],
    stats: [],
    stories: [],
    photos: [
      'allan-palm-island.jpg',
      'aunty-ethel-robertson.jpg',
      'aunty-iris-may-whitey.jpg',
      'cyndel-louise-pryor.jpg',
      'elsa-mortoa.jpg',
      'gurtrude-grace-richardson.jpg',
      'marjoyie-burns.jpg',
      'raymond-w-palmer-snr.jpg',
      'uncle-frank-daniel-landers.jpg',
      'winifred-obah.jpg',
    ],
    generated: [],
    notes: 'Group photo MISSING — capture during May visit',
  },
  {
    slot: '06-hull-river-songline',
    pages: '07-08',
    element: 'songline',
    section: 'educationCommunity',
    title: 'Walking Country Together',
    subtitle: 'Elders return to Hull River — since the year ended',
    audiences: ['community', 'supporter'],
    quotes: ['EQ-006', 'EQ-007', 'EQ-008'],
    stats: [],
    stories: ['S-007'],
    photos: ['eoc-01.jpg', 'eoc-02.jpg', 'eoc-03.jpg', 'eoc-04.jpg', 'eoc-05.jpg', 'eoc-06.jpg', 'eoc-07.jpg', 'eoc-08.jpg'],
    generated: ['T1-2-hull-river-v1.png', 'T2-3-river-timeline-v1.png', 'T2-3-river-timeline-v2.png', 'T2-3-river-timeline-v3.png'],
  },
  {
    slot: '07-year-in-numbers',
    pages: '09',
    element: 'kulingField',
    section: 'all',
    title: 'Year 17 in Numbers',
    audiences: ['community', 'funder', 'supporter', 'board', 'government'],
    quotes: ['CQ-002'],
    stats: ['N-001', 'N-002', 'N-003', 'N-004', 'N-005', 'N-006', 'N-007', 'N-008'],
    stories: [],
    photos: [],
    generated: [],
  },
  {
    slot: '09-cartouche-children-families',
    pages: '11',
    element: 'cartouche',
    section: 'childrenFamilies',
    title: 'Children & Families',
    subtitle: 'Where every story begins.',
    promise:
      'Decisions about Palm Island children, made by Palm Island people. Early learning, kinship care, and the wraparound that holds families together — across seven services, on Country.',
    numeral: 'i',
    audiences: ['community', 'funder', 'supporter', 'board', 'government'],
    quotes: [],
    stats: ['N-110'],
    stories: [],
    photos: ['daycare-graduation.jpg', 'daycare-playground.jpg', 'kids-beach-palm.jpg'],
    generated: ['T3-2-first-1000-days-arc-v1.png'],
  },
  {
    slot: '10-reliquary-bwgcolman-way',
    pages: '12',
    element: 'reliquary',
    section: 'childrenFamilies',
    title: '1st in Queensland',
    audiences: ['community', 'funder', 'supporter', 'board', 'government'],
    quotes: ['BQ-001', 'BQ-002', 'BQ-003', 'BQ-004'],
    stats: ['N-101', 'N-102', 'N-110'],
    stories: ['S-003'],
    photos: ['kids-beach-palm.jpg'],
    generated: ['T3-1-bwgcolman-rings-v1.png'],
  },
  {
    slot: '11-cartouche-health',
    pages: '13',
    element: 'cartouche',
    section: 'healthWellbeing',
    title: 'Health & Wellbeing',
    subtitle: 'Healing in our way.',
    promise:
      "Bwgcolman Healing Service, Women's Healing, Ferdy's Haven, the First 1,000 Days. Five services holding the body, mind, and spirit of our community.",
    numeral: 'ii',
    audiences: ['community', 'funder', 'supporter', 'board', 'government'],
    quotes: [],
    stats: [],
    stories: [],
    photos: ['group-dinner.jpg'],
    generated: [],
  },
  {
    slot: '12-reliquary-bhs',
    pages: '14',
    element: 'reliquary',
    section: 'healthWellbeing',
    title: '17,488 episodes of care',
    audiences: ['community', 'funder', 'supporter', 'board', 'government'],
    quotes: ['CQ-007'],
    stats: ['N-004', 'N-103', 'N-104', 'N-109'],
    stories: ['S-005'],
    photos: [],
    generated: ['T3-4-bhs-reef-cross-section-v1.png'],
    notes: 'Dr Raymond Blackman portrait MISSING — capture May visit',
  },
  {
    slot: '13-cartouche-justice',
    pages: '15',
    element: 'cartouche',
    section: 'justiceSafety',
    title: 'Justice & Safety',
    subtitle: 'The work that holds the safe community.',
    promise:
      'Specialist DFV, the Community Justice Group, the Diversionary Program. Three services that meet people in life, not only in crisis.',
    numeral: 'iii',
    audiences: ['community', 'funder', 'supporter', 'board', 'government'],
    quotes: [],
    stats: ['N-123', 'N-124'],
    stories: [],
    photos: ['memorial-gathering.jpg'],
    generated: [],
  },
  {
    slot: '14-cartouche-youth',
    pages: '16',
    element: 'cartouche',
    section: 'youth',
    title: 'Youth',
    subtitle: 'The next ones, growing up here.',
    promise:
      'Safe Haven and Youth Services — combining YOSS, Indigenous Youth Connection to Culture, and Tackling Indigenous Smoking. Fifteen staff, 380 young people.',
    numeral: 'iv',
    audiences: ['community', 'funder', 'supporter', 'board', 'government'],
    quotes: ['CQ-009', 'CQ-010'],
    stats: ['N-120', 'N-121', 'N-122'],
    stories: [],
    photos: ['youth-team-photo.jpg', 'youth-sweeping-centre.jpg', 'centre-youth-landscaping.jpg', 'henry-doyle.jpg', 'jess-smit.jpg'],
    generated: [],
  },
  {
    slot: '15-cartouche-economic',
    pages: '17',
    element: 'cartouche',
    section: 'economic',
    title: 'Economic',
    subtitle: 'Built by us, owned by us.',
    promise:
      'The Digital Service Centre, the Retail Community Shop, Logistics. Twenty-one Palm Islanders on the Telstra floor; goods and services across two locations.',
    numeral: 'v',
    audiences: ['community', 'funder', 'supporter', 'board', 'government'],
    quotes: [],
    stats: ['N-111', 'N-112'],
    stories: [],
    photos: [],
    generated: [],
    notes: 'DSC + Retail + Logistics service photos MISSING — capture May visit',
  },
  {
    slot: '16-cartouche-education',
    pages: '18',
    element: 'cartouche',
    section: 'educationCommunity',
    title: 'Education & Community',
    subtitle: 'Where the work meets daily life.',
    promise:
      'BEAI, Blue Card Liaison, the Community Hub, NDIS. Education engagement to tripled NDIS — the services that hold daily life on Palm together.',
    numeral: 'vi',
    audiences: ['community', 'funder', 'supporter', 'board', 'government'],
    quotes: ['CQ-016'],
    stats: ['N-113'],
    stories: [],
    photos: [],
    generated: [],
  },
  {
    slot: '17-services-atlas',
    pages: '19-20',
    element: 'atlas',
    section: 'all',
    title: 'Orientation',
    subtitle: '24 services around one island.',
    audiences: ['community', 'funder', 'supporter', 'board', 'government'],
    quotes: [],
    stats: ['N-005'],
    stories: [],
    photos: ['island-aerial-golden.jpg', 'palm-island-map.jpg'],
    generated: ['T3-5-services-island-v1.png'],
  },
  {
    slot: '18-elder-lanterns',
    pages: '21',
    element: 'lantern',
    section: 'all',
    title: 'Elder voices',
    audiences: ['community', 'supporter'],
    quotes: ['EQ-001', 'EQ-002', 'EQ-004', 'EQ-005'],
    stats: [],
    stories: [],
    photos: [
      'aunty-ethel-robertson.jpg',
      'allan-palm-island.jpg',
      'uncle-frank-daniel-landers.jpg',
      'cyndel-louise-pryor.jpg',
      'winifred-obah.jpg',
      'marjoyie-burns.jpg',
    ],
    generated: ['T2-5-elder-quote-panel-v1.png'],
  },
  {
    slot: '19-staff-hearths',
    pages: '22',
    element: 'hearth',
    section: 'all',
    title: 'The voices behind the work',
    audiences: ['community', 'supporter'],
    quotes: ['CQ-001', 'CQ-005', 'CQ-007', 'CQ-009', 'CQ-011', 'CQ-016'],
    stats: [],
    stories: [],
    photos: [
      'rachel-atkinson.jpg',
      'henry-doyle.jpg',
      'jess-smit.jpg',
      'cassie-lang.jpg',
      'elsa-mortoa.jpg',
      'natalie-friday.jpg',
      'playgroup-staff.jpg',
    ],
    generated: ['T2-6-community-quote-panel-v1.png'],
    notes: 'Hailey, Clay, Tammy, Dr Blackman portraits MISSING — capture May visit',
  },
  {
    slot: '20-innovation',
    pages: '23',
    element: 'compose',
    section: 'all',
    title: 'Innovation in FY24-25',
    audiences: ['community', 'funder', 'supporter', 'board', 'government'],
    quotes: [],
    stats: [],
    stories: ['S-010', 'S-011'],
    photos: ['youth-sweeping-centre.jpg', 'centre-youth-landscaping.jpg'],
    generated: ['T2-4-three-commitments-bands-v1.png'],
  },
  {
    slot: '21-leadership-program',
    pages: '24',
    element: 'compose',
    section: 'all',
    title: 'PIC Leadership Program',
    subtitle: 'Designed by us, for us.',
    audiences: ['community', 'funder', 'supporter', 'board', 'government'],
    quotes: [],
    stats: [],
    stories: ['S-008'],
    photos: ['staff-team-placeholder.jpg'],
    generated: [],
    notes: 'Cohort photo MISSING — capture once Cohort 1 forms',
  },
  {
    slot: '22-financials',
    pages: '25',
    element: 'compose',
    section: 'all',
    title: 'Financials',
    audiences: ['funder', 'board', 'government'],
    quotes: ['CQ-002'],
    stats: ['N-007'],
    stories: [],
    photos: [],
    generated: [],
    notes: 'Final figures pending Mark sign-off',
  },
  {
    slot: '23-governance',
    pages: '26',
    element: 'compose',
    section: 'governance',
    title: 'Governance, Compliance, Risks',
    audiences: ['funder', 'board', 'government'],
    quotes: [],
    stats: [],
    stories: ['S-009'],
    photos: ['harriet-hulthen.jpg', 'matthew-lindsay.jpg', 'rhonda-phillips.jpg'],
    generated: [],
  },
  {
    slot: '24-back-cover',
    pages: '27',
    element: 'compose',
    section: 'all',
    title: 'Next 20 Years',
    audiences: ['community', 'funder', 'supporter', 'board', 'government'],
    quotes: ['CQ-004'],
    stats: [],
    stories: ['S-011'],
    photos: ['palm-sunset-pier.jpg'],
    generated: ['T1-3-constellation-v1.png', 'T3-6-horizon-v1.png'],
  },
]

// ─────────────────────────────────────────────────────────────────────────────
// Selectors — convenient lookups
// ─────────────────────────────────────────────────────────────────────────────

export function quoteById(id: string): Quote | undefined {
  return QUOTES.find((q) => q.id === id)
}

export function statById(id: string): Stat | undefined {
  return STATS.find((s) => s.id === id)
}

export function storyById(id: string): Story | undefined {
  return STORIES.find((s) => s.id === id)
}

export function pagesByAudience(audience: 'community' | 'funder' | 'supporter' | 'board' | 'government') {
  return PAGE_MAP.filter((p) => p.audiences.includes(audience))
}

export function pagesBySection(section: SectionKey | 'all' | 'governance') {
  return PAGE_MAP.filter((p) => p.section === section)
}

/** Resolve photo path: prefix with the slot's pool folder URL */
export function resolvePoolPhoto(slot: string, filename: string): string {
  return `/report-assets/2024-25-pool/${slot}/${filename}`
}

/** Resolve a shared asset path */
export function resolveSharedAsset(category: 'motifs' | 'infographics' | 'thematic-icons' | 'service-motifs', filename: string): string {
  return `/report-assets/2024-25-pool/_shared/${category}/${filename}`
}
