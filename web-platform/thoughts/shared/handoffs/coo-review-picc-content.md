# 2024-25 Annual Report Content Dossier
## COO Review Document — PICC

**Prepared for:** Chief Operating Officer Review & Approval  
**Prepared from:** PICC Web Platform exploration  
**Date:** 14 April 2026  
**Status:** Draft for internal review  

---

## 1. SERVICES — All 30 Active PICC Services

### Overview
PICC operates approximately **30-31 active services** across health, child and family safety, justice, disability, aged care, youth, and social enterprise. The complete service registry lives in `organization_services` table in Supabase. 

**Note:** Narelle services review flagged that 3 services may be missing from the current ledger (31 reported vs. 28 in system). This is Part A3 of the Narelle interview framework — needs resolution before final reporting.

### Service Metadata Available
- Service name and slug
- Full description
- Service category / domain
- Is_active status
- Metadata: funding, launched date, blueprint reference, legislation basis, staff count

### Services Referenced Across Platform

**Bwgcolman Way (Child Safety Anchor)**
- Full name: "Bwgcolman Way: Community Control for Our Children"  
- Meaning: "Bwgcolman means many tribes, one people"
- Status: **Implemented 2024**  
- Funding: $107.8M over 4 years (2023-2028) from Queensland Government
- Legal basis: Part 2A, Child Protection Act 1999 (Qld)
- Significance: First ATSICCO in Queensland granted Delegated Authority for child protection decisions
- Connected services: Safe House, Family Care Service, Family Participation Program, Children and Family Centre, SEWB Service, Bwgcolman Healing Service

**Other Key Services (from governance & voices pages):**
- Safe House (women's healing/domestic violence)
- Family Care Service
- Family Participation Program
- Children and Family Centre (flood recovery highlight: rebuilt post-cyclone)
- SEWB (Social and Emotional Wellbeing) Service (staffing for workforce)
- Bwgcolman Healing Service (renamed from women's healing service, restructured for better support)
- Blue Card Liaison Service (2-year pilot, ~20 positive notices/month, **funding cliff 30 June 2026**)
- Aged Care Services (**flagged URGENT** — no dedicated facility on Palm; Elders meeting 10 April 2026)
- Daycare / Early Childhood Services (flooded in 2024, reopened with strong community rebuild narrative)
- Digital Service Centre (social enterprise)
- Playgroup
- Men's Diversionary Service
- Mechanics Workshop
- Justice group services
- Retail (social enterprise)
- Logistics (social enterprise)
- Health services (coordinated with Queensland Health primary centre)

**Service Metrics Data**
- Each service has `service_metrics` records with: fiscal_year, clients_served, sessions_delivered, events_held, staff_count, key_achievement, headline_stat
- Activity logs available: `service_activity_logs` with monthly period_start data
- Service notes table captures updates from interviews and conversations

### Service Categories (from platform)
- Health & Primary Care
- Child & Family Safety
- Justice & Diversionary  
- Disability & Aged Care
- Youth Services
- Social & Emotional Wellbeing
- Enterprise & Employment
- Community Development

**Data Source:** `/lib/explore/tools/services.ts` tool queries; live data from Supabase

---

## 2. GOVERNANCE — Board, Membership, Leadership

### Legal Form & Registration
- **Entity:** Active Australian public company limited by guarantee
- **ABN:** 14 640 793 728
- **Charity Status:** Registered with ACNC (Australian Charities and Not-for-profits Commission); DGR (Deductible Gift Recipient) endorsed
- **NDIS Status:** Approved NDIS provider, registration current to **6 February 2029**
- **My Aged Care:** Listed with CHSP and NATSIFAC registration through **28 January 2029**

### 2007-2021 Transition
- **2007 Model:** Hybrid public company limited by shares; shareholders: Queensland Government, Palm Island Aboriginal Shire Council, Traditional Owners
- **2021 Transition:** Community control achieved 30 September 2021. Services, workforce, assets transferred to new community-controlled entity. Primary health merged with Queensland Health on 1 July 2021. Renamed Palm Island Community Company Ltd in October 2021. Members are now Manbarra and Bwgcolman people only (18+).

### Membership & Democracy
- Open to: Manbarra and Bwgcolman people aged 18+  
- Voting: One member = one vote
- Staff can be members but cannot vote on director elections
- 2024 and 2025 AGM cycles were active — nominations for member-elected directors called publicly on PICC news page
- Next AGM scheduled: **25 November 2025**

### Board Design (Constitution-Based)
**Composition: 5-7 directors across three categories**
- **Up to 4:** Member-elected directors (elected by community at AGM) — the democratic majority
- **1:** Traditional Owner director (reserved seat nominated by Manbarra Corporation) — recognises Manbarra as Traditional Owners
- **Up to 2:** Board-appointed directors (appointed by the rest of the board for skills gaps) — typically governance, legal, finance, sector expertise

### Current Board (2023-24 Annual Report)
1. **Luella Bligh** — Chair
2. **Rhonda Phillips** — Director
3. **Allan Palm Island** — Director
4. **Matthew Lindsay** — Director
5. **Harriet Hulthen** — Director
6. **Raymond W. Palmer Snr** — Director
7. **Cassie Lang** — Director

**Note:** Board composition may change after the 25 November 2025 AGM cycle.

### Skills the Board Holds
- Aboriginal culture  
- Community aspirations  
- Governance  
- Social policy  
- Primary health  
- Business  
- Law  
- Finance

### Guardrails — Who Cannot Sit on the Board
- ❌ PICC staff (separates operational accountability from governance oversight)
- ❌ Government elected officials — council and parliamentary roles create conflict
- ❌ Senior government and council employees (avoids 2007 hybrid model conflicts flagged in 2019 Ipsos evaluation)
- ❌ More than one family member at a time (spreads representation)

### CEO & Peak Body Roles
- **CEO:** Rachel Atkinson (only CEO since 2007 founding)
- **QAIHC (Queensland Aboriginal and Islander Health Council):** Deputy Chair
- **NACCHO (National Aboriginal Community Controlled Health Organisation):** Board member
- **SNAICC (Secretariat of National Aboriginal and Islander Child Care):** Deputy Chair

**Sector Position:**  
PICC is an ACCO (Aboriginal Community Controlled Organisation) with ACCHO (Aboriginal Community Controlled Health Organisation) core. Multi-service entity combining health, child/family safety, justice, disability, aged care, youth, and social enterprise — uncommon for a remote place-based organisation.

**Data Source:** `/picc/governance/page.tsx`; sourced from PICC constitution and 2026 sector-context research

---

## 3. FINANCES — 16-Year Growth Curve & 2023-24 Position

### Latest Audited Year: 2023-24 (FY2024)
- **Total Income:** ~$24.5M (exact figure from Supabase `annual_financials` table)
- **Labour Costs:** ~$15.0M
- **Total Expenses:** ~$25.0M (labour + administration + property/energy + motor vehicle + travel/training + client-related)
- **Surplus/Deficit:** Operating deficit characteristic of labour-intensive community service model
- **Labour as % of Total Expenses:** ~60% — consistent with 2019 Ipsos finding  
  *"Most of every PICC dollar pays a Palm Islander to deliver a service to another Palm Islander."*

### Expense Breakdown (2023-24 proportions)
- **Labour costs:** ~60% (largest category)
- **Administration:** ~15-20%
- **Client-related costs:** ~10-15%
- **Travel & training:** ~5-10%
- **Property & energy:** ~5-10%
- **Motor vehicles:** ~5%

### 16-Year Growth Trajectory (FY2009 → FY2024)
- **Starting point (earliest in DB):** ~$3M (FY2009 estimate)
- **Latest (FY2024):** ~$24.5M
- **Growth multiple:** ~8.2x increase over 15 years
- **Key growth driver:** Post-2019 expansion + 2021 community-control transition stabilised funder confidence

### 2024-25 Status (PRELIMINARY — AWAITING NARELLE PART C)
- **Income estimate:** $23.4M (held flat from 2023-24 in draft)
- **Labour estimate:** ~3% increase on prior year
- **Status:** NOT FINAL — audit sign-off pending; must not be quoted externally until verified
- **What Narelle Part C unlocks:**
  - Auditor sign-off date
  - Confirmed total income vs. preliminary $23.4M
  - Total expenditure (six categories audited)
  - Total assets and net assets
  - Updated staff count (currently 197 in 2023-24)

**Critical Note:** 2024-25 figures are preliminary draft estimates stored in `annual_financials` table. Treat as working assumptions only. The 2023-24 row is the only audited position suitable for external report quoting.

### Funding Complexity (Risk Register Item)
- **Number of funders:** 11+ (largely unchanged since 2019 Ipsos evaluation)
- **Number of active contracts:** 17+ (each with different cycle, reporting framework, compliance, renewal cliff)
- **Funding cliff examples:**
  - Blue Card Liaison Service: 30 June 2026
  - Various contract renewals throughout FY2024-25
- **Mitigation:** Multi-year contracts where possible; social enterprises (Digital Service Centre, Retail, Logistics) built to reduce single-funder reliance

**Data Source:** `/picc/finances/page.tsx`; live from `annual_financials` Supabase table

---

## 4. PROJECTS & FORWARD COMMITMENTS

### Launchpad 20-Year Plan (M2 — Forward Commitments)
Three strategic commitments for the next 20 years (sourced from PICC-20-Year-Launchpad-Plan.md, last sync 10 April 2026):

**BY 2028: Aged Care on Palm**
- Dedicated aged care facility on Palm Island so Elders never have to leave Country
- **Status:** URGENT flag in ledger; Elders meeting 10 April 2026; council and mayor being advocated
- **Significance:** Linked to Narelle services review — Aged Care Services flagged as priority

**BY 2030: Bwgcolman Way Expanded**
- Delegated Authority extended beyond child safety into health and justice
- Target: First Indigenous-led delegated authority across THREE domains in Australia
- **Current state:** Child safety delegation implemented and operational (2024)

**BY 2045: Sovereign Story Archive**
- Every Palm Island story captured, consented, and sovereign
- The Empathy Ledger as permanent home for community voice
- "Invisible plumbing, never the hero"

### Urgent Asks (Narelle Services Review — 10 April 2026)

**#1 Aged Care Services — Outcome of Elders Meeting**
- Flagged URGENT; no dedicated facility
- Elders met 10 April 2026 to discuss aged care and relocation
- Council and mayor being pushed for action  
- Question: Should this be a feature of the 20-year celebration?

**#2 Blue Card Liaison Service — Funding Cliff 30 June 2026**
- 2-year pilot averaging ~20 positive notices per month
- Decision needed: extension secured or planning for the cliff?

**#3 Three Missing Services**
- Narelle reported ~31 services; ledger holds 28
- Need to identify which 3 are missing (Part A3 of Narelle interview framework)

**Data Source:** `/picc/next-20/page.tsx`; `/picc/projects/` ecosystem

---

## 5. COMMUNITY VOICES & STORIES

### Overall Voice Inventory
- **Curated Elder Quotes:** ~162 (public + community level, validated, with permission levels)
- **AI-Extracted Quotes:** ~290 (from PICC local); EL canonical holds ~1,128 total  
- **Extracted Interview Transcripts:** 34 interviews with 2,036 total segments
- **Published Stories:** 53 (in `stories` table)
- **Unique storytellers:** tracked across annual reports

### Voice Categories (Priority Dimensions)
- Community (highest count)
- Culture (high count)
- Elders (high count, priority for celebration)
- Youth (flagged GAP — only ~<10 captured; Narelle Part F3 asks for young person voice)
- Education
- Family
- Governance
- Employment
- Ai-extraction-v2 categories (auto-generated from annual report extraction pipeline, ~50 across 2009-10 to 2023-24)

### Cultural Protocol for Voices
- **Restricted content filtered:** Voices marked `cultural_sensitivity='restricted'` filtered from all views including admin
- **Permission levels:** Public / Community / Internal  
- **Elder approval required:** `is_validated=true` and `permission_level='public'` for celebration narratives
- **No rewriting:** Story bodies are PICC's own words — never rewritten for reports

### 20 Voices for 20 Years Sprint (Launchpad Plan E1)
**Target:** 60 voices captured and approved before celebration
- Specification: 1 Elder + 1 staff + 1 young person per year (2005-2025)
- Each with: photo, short video, written quote, tied to specific year
- **Current status:** Capture pending; awaiting Narelle priority list (Parts E5-E7)
- **Priority gaps:** Youth voices severely under-represented

### Key Voice Sources
- `elder_quotes` table (PICC local, curated)
- `extracted_quotes` table (AI from transcripts, EL canonical)
- `stories` table (published PICC narratives)
- Empathy Ledger (EL) — canonical 1,128+ quote archive
- Interview transcripts vault (picc-vault/transcripts/ — 70+ transcript files)

### Recent Story Examples (from vault)
Notable interview transcripts available:
- "Nearly 200 strong: PICC's workforce growth"
- "Ruby Sibley: Resilience in the heart of Palm Island"
- "Iris Forfoot: [Journey narrative]"
- "Elder Allan: Celebrating new beginnings on Palm Island"
- "Womens healing service staff conversation: Restructured for better support"
- "Daycare opening interview: Resilience in the wake of the storm"
- "Bwgcolman Healing Service: A name that reflects our community"
- "Mens diversionary service staff conversation"
- "Justice group interview"
- "From exemption cards to cyclones: Remembering, surviving, rebuilding on Palm"

**Data Source:** `/picc/voices/page.tsx`; live from `elder_quotes`, `extracted_quotes`, `stories` tables; EL canonical via `getELQuotes()` function

---

## 6. ORGANIZATIONAL HISTORY & TIMELINE

### 1914-1972: The History That Made This Necessary
- Palm Island gazetted as Aboriginal reserve
- People forcibly removed from more than 70 Nations
- Children taken from families
- Decisions made by people who never set foot on Palm Island

### 2005-2007: Design & Launch
- 2005: Queensland Government begins design process
- **17 October 2007:** PICC launches as hybrid public company limited by shares
  - Shareholders: Queensland Government, Palm Island Aboriginal Shire Council, Traditional Owners
  - CEO Rachel Atkinson appointed (only CEO to this day)
  - Early roles: service provision, community capacity building, business development

### 2019: The Ipsos Evaluation
- Independent evaluation found:
  - Hybrid governance helped PICC scale and stabilise funding
  - BUT created distrust: "Is PICC truly community-led?"
  - Named risks: succession planning, trust, scope/complexity, lateral violence, compliance burden
  - This evaluation directly justified the 2021 restructure

### 2021: Community Control Achieved (30 September)
- New entity registered June 2020
- Services, workforce, assets transferred 30 September 2021
- Primary health merged with Queensland Health-run centre (1 July 2021) → Palm Island Primary Health Centre
- Entity renamed: Palm Island Community Company Ltd (October 2021)
- Members: Manbarra and Bwgcolman people only (18+)

### 2023: Delegated Authority Project Commences
- April 2023: Bwgcolman Way blueprint "Reclaiming our Storyline" launched
- Co-developed with QATSICPP and Queensland department

### 2024: Bwgcolman Way Implemented
- Delegated Authority goes live
- PICC becomes **first ATSICCO in Queensland** with legal power to decide care arrangements
- $107.8M committed over 4 years (2023-2028)
- Statewide context: 16 ATSICCO entities, 21 DA services, 439 First Nations children supported (Dec 2025)

### 2024-Present: 20-Year Celebration & Next-20 Planning
- 17-year history publicly available as walking timeline
- Launchpad 20-year plan drafted for Rachel workshop
- Next-20 canvas shows community visions, forward commitments, urgent asks side-by-side

**Data Source:** Governance page; Bwgcolman case study; `/picc/next-20/`; `/20-years/` public timeline

---

## 7. RISKS & STRUCTURAL PRESSURE POINTS

### Risk Register (8 Total — From 2019 Ipsos + 2026 Sector Research)

**1. Funding Fragmentation** [FUNDING]
- 11+ funders; 17+ contracts each with different cycles, compliance, renewal cliffs
- Mitigation: Multi-year contracts; social enterprises to reduce single-funder reliance
- Owner: CEO + Finance + Service leads

**2. Compliance Burden** [FUNDING]
- HSQF, RACGP, ACNC, NDIS, My Aged Care, ORIC requirements
- Annual report is multi-month effort + audited financials + governance docs + public evaluation
- Mitigation: In-house annual report production (since 2024); Empathy Ledger architecture; audience-targeted PDF generator
- Owner: COO + Quality + Finance

**3. Trust & Reputation** [TRUST]
- Community-controlled org lives by legitimacy; lost quickly
- 2019 Ipsos: "created distrust about whether PICC was truly community-led" (hybrid model finding)
- Mitigation: 2021 restructure; AGMs with member-director elections; public accountability
- Owner: Board + CEO + community

**4. Succession Planning** [PEOPLE]
- Rachel Atkinson only CEO since 2007 — key-person risk
- 2019 Ipsos recommended stronger succession planning
- Mitigation: Launchpad Part E14 names "internal PICC second-in-command" as non-negotiable
- Owner: Board + CEO

**5. Scope & Governance Depth** [SCOPE]
- Health + child/family + justice + disability + aged care + youth + enterprise = hardest to govern
- Single 5-7 board must provide oversight across multiple regulators, funders, peer bodies
- Mitigation: Skills-based board appointments; Manbarra Traditional Owner seat; operational structure; Empathy Ledger visibility
- Owner: Board + Executive

**6. Colonial Trauma & Lateral Violence** [CULTURAL]
- 70+ nations forced removal; Hull River cyclone; 2004 death in custody; intergenerational trauma
- Workplace conflict, family disputes, distrust between groups, vicarious trauma
- Mitigation: Cultural safety; SEWB service for staff; Elder approval cycles; Bwgcolman Way philosophy
- Owner: CEO + HR + Cultural leads

**7. Coordination Load** [GOVERNANCE]
- **#1 risk to 20-year celebration** (per Launchpad plan)
- 10 workstreams, multiple owners, hard deadlines, celebration date non-negotiable
- Voices capture, Bwgcolman case study, Hull River piece, rebrand, ceremony, funder briefing, platform launch converge
- Mitigation: Internal second-in-command (Launchpad decision #9); Ben + Nic behind curtain principle; weekly data check-in
- Owner: Rachel + Ben + internal 2IC

**8. Data Sovereignty & Outcome Measurement** [GOVERNANCE]
- 2,508 media files, 290 extracted quotes, 162 elder quotes, 53 stories, 34 interviews, 8 highlights for 2024-25
- Ipsos recommended community dashboard with Indigenous data sovereignty — partially built, not fully institutionalised
- Mitigation: Empathy Ledger architecture (long-term answer); 24/25 data capture (Narelle Part C); /picc/finances dashboard
- Owner: CEO + Data + EL team

### Framing
"Naming a risk is not admitting failure. It is the precondition for navigating one. PICC is unusually well documented precisely because it has been willing to say what is hard."

**Data Source:** `/picc/risks/page.tsx`; sourced from 2019 Ipsos evaluation and 2026 sector-context research

---

## 8. SECTOR POSITION & PEAK BODY ROLES

### PICC in the Sector Ecosystem
- **National Agreement on Closing the Gap criteria:** PICC meets all (incorporated, not-for-profit, Aboriginal/Torres Strait Islander controlled, connected to communities, majority governing body)
- **Goes broader:** ACCO (Aboriginal Community Controlled Organisation) + ACCHO (Health Organisation) core, with health + child/family + justice + disability + aged care + youth + enterprise scope

### CEO Peak Body Presence
- **QAIHC:** Deputy Chair  
- **NACCHO:** Board member  
- **SNAICC:** Deputy Chair

**Significance:** Three peak bodies across health and child safety — PICC reaches beyond its geographic location into national policy conversations.

### Statewide Delegated Authority Movement
- By December 2025: 16 ATSICCO entities delivering 21 DA services
- 439 First Nations children supported across Queensland
- Bwgcolman Way is PICC's expression — shaped by Palm Island history and community infrastructure

**Data Source:** Governance page; Bwgcolman case study

---

## 9. EXISTING ANNUAL REPORT INFRASTRUCTURE

### Available Tools & Pages
- **Report Generator:** `/picc/report-generator` — create PDF reports from collected data
- **Report Builder:** `/picc/reports/builder` — audience-targeted (community, funder, supporter, board) on-demand generation
- **PDF Templates:** `lib/pdf/templates/annual-report/` — theme, components, layouts  
- **API:** `GET /api/pdf/generate?type=annual-report|stories|services|history&audience=`

### 2024-25 Annual Report (In Progress)
- **Status:** Drafting/data entry phase (per annual-reports page)
- **Location:** `/app/(public)/annual-report/2024-25/` (public URL)
- **Current state:** AnnualReportContent.tsx, layout.tsx, page.tsx exist; content being populated
- **Data entry point:** `/picc/annual-report-data/` — structured input for current fiscal year

### Historical Archive
- **18 years of reports** (2006-2024) searchable at `/picc/knowledge/annual-reports`
- **Timeline view:** Year-by-year gallery with extracted data
- **Available metrics per year:** Stories, storytellers, themes, impacts

### API Routes for Report Content
- `/api/annual-report-data/overview` — high-level statistics
- `/api/annual-report-data/curated-voices` — community stories, elder quotes, visions
- `/api/annual-report-data/highlights` — key achievements for year
- `/api/annual-report-data/metrics` — service-level numbers
- `/api/annual-report-data/board` — governance section
- `/api/annual-report-data/financials` — financial summary
- `/api/annual-report-data/stories` — published stories for inclusion
- `/api/annual-report-data/media` — photos, videos, assets
- `/api/annual-report-data/projects` — completed and active projects
- `/api/annual-report-data/trends` — patterns across data

**Data Source:** `/app/picc/annual-reports/` and `/api/annual-report-data/` routes

---

## 10. KEY GAPS & MISSING CONTENT

### Critical Gaps for 2024-25 Report

1. **2024-25 Audited Financials**
   - Status: Preliminary only ($23.4M estimate)
   - Missing: Auditor sign-off, confirmed total income, total assets/net assets, final staff count
   - Action: Narelle interview Part C required

2. **Three Missing Services**
   - Narelle reported ~31 services; ledger holds 28
   - Missing: Identity of 3 unrecorded services
   - Action: Part A3 of Narelle interview framework

3. **Youth Voice Capture**
   - Gap: Only <10 youth quotes vs. 40+ community/culture/elder quotes
   - Missing: Young person voice for celebration narrative
   - Action: Narelle Part F3; identify 5+ youth from The Centre or Digital Service Centre

4. **Aged Care Forward Narrative**
   - Status: Flagged URGENT by Narelle
   - Missing: Elders meeting outcome (10 April 2026); facility plans; forward commitment detail
   - Action: Elders meeting debrief; council/mayor engagement narrative

5. **Blue Card Liaison Decision**
   - Status: Funding cliff 30 June 2026
   - Missing: Extension secured or wind-down plan?
   - Action: Service lead decision before report publication

6. **20 Voices Sprint Detail**
   - Status: Capture specification exists; no captures yet
   - Missing: Prioritised capture list by year and role (Elder/staff/youth)
   - Action: Narelle Parts E5-E7 produces priority list

7. **2024-25 Service-Level Data**
   - Status: Framework exists; numbers not yet captured
   - Missing: Clients served, sessions delivered, events, key achievements per service
   - Action: Narelle Part C numbers round (services, projects, financials check)

---

## 11. COMPLIANCE & REGULATORY CONTENT

### Current Registrations & Accreditations
- **ACNC:** Registered charity, DGR-endorsed
- **NDIS:** Approved provider, registration current to 6 February 2029
- **My Aged Care:** Listed with CHSP and NATSIFAC registration through 28 January 2029
- **RACGP:** Quality accreditation for primary health
- **HSQF:** Health services accreditation

### Governance Achievement Record
- `governance_achievements` table tracks all major milestones, policy changes, delegations across fiscal years
- Examples: 
  - Delegated Authority implementation (2024)
  - Community-control transition (2021)
  - 2021 restructure completion (30 Sept 2021)
  - Bwgcolman Way blueprint launch (April 2023)

### Data Sovereignty & CATSI Principles
- PICC's Empathy Ledger architecture designed around Indigenous data sovereignty
- Elder quotes require `is_validated=true` and permission_level review
- Cultural sensitivity flags on all restricted content
- Narelle interview Part C addresses outcome measurement institutionalisation

---

## 12. CONTENT PRODUCTION STATUS & READINESS

### What's Ready for COO Review
- ✅ Governance framework (complete, current to April 2026)
- ✅ Risk register (complete, documented)
- ✅ 2023-24 audited financials (final from annual_financials table)
- ✅ Bwgcolman Way case study (live, full narrative)
- ✅ Board composition (2023-24 baseline)
- ✅ Historical timeline (17-year walk available)
- ✅ Service inventory (28 confirmed; 3 missing)
- ✅ Voice counts (162 elder + 290 EL + 53 stories)
- ✅ Peak body positioning (Rachel's three roles documented)

### What's Preliminary / Awaiting Input
- 🟡 2024-25 Financials (preliminary $23.4M estimate; auditor sign-off pending)
- 🟡 Service metrics for 2024-25 (data capture framework exists; numbers awaiting Narelle Part C)
- 🟡 Aged Care forward plan (awaiting Elders meeting outcome, 10 April 2026)
- 🟡 Blue Card Liaison decision (funding cliff 30 June 2026; extension status unknown)
- 🟡 20 Voices sprint detail (specification exists; capture list pending Narelle Parts E5-E7)
- 🟡 Youth voice samples (framework exists; voices to be captured)
- 🟡 Identified missing services (3 services unaccounted for; Part A3 of interview)

### What's Not Yet Collected
- 🔴 Celebration ceremony details (date, location, program)
- 🔴 Funder briefing narrative (forward commitment storytelling)
- 🔴 Hull River long-form history piece (comprehensive origin story)
- 🔴 Rebrand announcement content (if applicable to 2024-25 report)
- 🔴 Specific media/photo captions tied to stories (high-quality image selection pending)

---

## 13. RECOMMENDED STRUCTURE FOR 2024-25 ANNUAL REPORT

### Suggested Sections (for COO approval)
1. **Acknowledgements & Framing** — Hull River → PICC → Next 20
2. **CEO Statement** — Rachel's voice on the year and next-20 vision
3. **At a Glance** — Key metrics, highlights, by-the-numbers
4. **Governance** — Board, membership, 2021 transition, democratic legitimacy
5. **Bwgcolman Way** — Anchor story + related services (Safe House, Family Care, etc.)
6. **Services Overview** — Snapshot of 28+ services, clients served, highlights
7. **Community Voices** — 20 featured stories/quotes (elder + staff + youth mix)
8. **Financial Position** — 2023-24 audited + 2024-25 preliminary context
9. **Risks & Resilience** — Named pressure points + mitigations
10. **Next 20 Years** — Forward commitments (Aged Care 2028, Bwgcolman expansion 2030, Sovereign archive 2045)
11. **Appendices** — Board list, service directory, governance achievements, media gallery

---

## 14. DATA QUALITY NOTES FOR COO

### Verified / Audit-Ready
- Governance structure (constitution-based, current AGM cycle)
- 2023-24 audited financials (signed off)
- Bwgcolman Way implementation (documented in governance_achievements)
- Board composition (2023-24 baseline)

### Needs Verification Before External Quoting
- 2024-25 figures (preliminary until auditor sign-off)
- Statewide DA numbers (16 entities, 439 children — December 2025, quoted from QFCC reporting)
- Missing services count (said 31, ledger 28 — clarify before report)
- Youth voice sample size (flagged as gap, numbers needed)

### Known Missing Elements
- Blue Card Liaison funding status (30 June 2026 cliff)
- Aged Care facility plan (awaiting Elders meeting output)
- Three unidentified services
- Narelle interview Part C outputs (services, financials, voice priorities)

---

## 15. HANDOFF CHECKLIST FOR COO REVIEW

**Before approving 2024-25 Annual Report, confirm:**

- [ ] 2023-24 audited financial numbers verified and approved for external use
- [ ] 2024-25 preliminary figures flagged as "subject to audit" throughout document
- [ ] Bwgcolman Way narrative matches official governance_achievements record
- [ ] Board composition reflects 2023-24 or indicates expected 2025-26 changes
- [ ] Governance risks register is acceptable for public disclosure
- [ ] Service count issue (28 vs. 31) resolved or noted as "under review"
- [ ] Youth voice gap acknowledged or resolved via Narelle sprint
- [ ] Blue Card Liaison funding status clarified (extension or wind-down)
- [ ] Aged Care forward commitment reflects Elders meeting outcome
- [ ] Bwgcolman case study reflects latest statewide DA context (16 entities as of Dec 2025)
- [ ] 20-voices-for-20-years sprint is positioned as "in progress" or "completed" per actual status
- [ ] All quoted stakeholder voices verified as published + public-access permission confirmed
- [ ] PDF generator template updated with 2024-25 color/brand guidelines
- [ ] Audience-targeted versions (community, funder, board) have distinct narratives prepared
- [ ] Media gallery curated and alt-text written for accessibility

---

## Document Metadata

**Web Platform Directories Explored**
- `/app/picc/` (30+ subdirectories)
- `/app/(public)/bwgcolman/` (Bwgcolman case study)
- `/app/picc/governance/`, `/picc/finances/`, `/picc/risks/`, `/picc/next-20/`, `/picc/voices/`
- `/app/picc/annual-reports/` (historical archive)
- `/app/picc/annual-report-data/` (2024-25 data entry framework)
- `/api/annual-report-data/` (10+ content routes)
- `picc-vault/transcripts/` (70+ interview transcript files)

**Data Sources**
- Supabase tables: `annual_financials`, `organization_services`, `stories`, `elder_quotes`, `extracted_quotes`, `governance_achievements`, `community_visions`, `service_metrics`, `service_activity_logs`, `service_notes`, `media_files`
- Source documents: PICC-20-Year-Launchpad-Plan.md, PICC-Sector-Context-Deep-Research.md, Ipsos 2019 evaluation
- Interview framework: PICC-Narelle-Interview-Framework.md (Parts A-F define content collection)

**Last Updated**
- Exploration date: 14 April 2026
- Platform sync dates: Mostly current to 10 April 2026 (some pages)
- Financial data: Live from annual_financials table
- Governance: Constitution-based, last update October 2021 (community control transition)

---

## Contact & Questions

For clarification on any section:
- **Governance / Board:** Check `/picc/governance/` page; consult Luella Bligh (Chair)
- **Finances:** Check `/picc/finances/` page; escalate to Narelle for Part C numbers
- **Services:** Query `organization_services` table; service leads for metrics
- **Voices / Stories:** Check `/picc/voices/` page; Narelle interview Parts E-F for sprint details
- **Risks / Forward Plan:** Check `/picc/risks/` and `/picc/next-20/`; Rachel workshop for vision rewrites

---

**END OF DOSSIER**
