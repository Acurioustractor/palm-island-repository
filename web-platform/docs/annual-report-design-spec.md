# PICC Annual Report 2024-25 — Page-by-Page Design Spec

**Purpose**: Figma-ready layout specifications for all 20 pages
**Format**: A4 portrait (595 x 842pt / 210 x 297mm)
**Margins**: 50pt (17.6mm) all sides — content area 495pt wide
**Fonts**: Inter (body), Caveat (display headings)
**Brand Colors**: Blue `#2563eb` / Purple `#9333ea` / Green `#16a34a` / Orange `#ea580c` / Teal `#0f766e`

---

## Page 1: COVER

**Layout**: Full-bleed photograph with overlay gradient
**Current**: PhotoCover component — full-page image with gradient bottom-third overlay, white title text

### Design Direction
- **Hero image**: Full-bleed community group photograph — vibrant, celebratory, outdoor
- **Recommended photos**: Professional photography collection (Oct 2025 shoot — 323 images). Look for: group shots, community gathering, daycare opening ceremony, Elders together
- **Alternative**: Spring Festival hero shots (512 images) — colorful, community energy
- **Overlay**: Bottom gradient (transparent → dark blue `#1e3a8a` at 80% opacity)
- **Typography**:
  - `PALM ISLAND COMMUNITY COMPANY` — Inter 7.5pt, uppercase, letterSpacing 3, white, top area
  - Subtitle line — Caveat 32pt bold, white (e.g. "Year 17 — Celebrating Community Voice")
  - Year range — Inter 11pt, white opacity 0.8
- **Decorative**: None — let the photo speak

### Figma Notes
- Create as full-bleed frame (no margin)
- Photo should feel warm, alive, inclusive
- Avoid logos on front cover — this is a people-first document
- Audience variants change subtitle only (community = celebratory, funder = formal "Annual Report 2024-25")

---

## Page 2: ACKNOWLEDGEMENT OF COUNTRY

**Layout**: Centered single content block with decorative border
**Current**: Purple 2pt border with 12pt radius, centered text, DotPattern in bottom-right

### Design Direction
- **Structure**: Generous whitespace — single purple-bordered box centered vertically
- **Image opportunity**: Subtle watermark or faded background of Palm Island landscape/water
- **Typography**:
  - Title: Caveat 26pt bold, purple `#9333ea`, centered
  - Body: Inter 10pt, gray-600 `#4b5563`, centered, lineHeight 1.8
- **Decorative**: DotPattern (5x5 grid) bottom-right in purple at 10% opacity
- **No photos** — respectful blank space communicates gravity

### Figma Notes
- The border box should have comfortable padding (30pt internal)
- Consider a faint topographic/country map texture at 3-5% opacity behind the text
- This page sets the tone — quiet, respectful, spacious

---

## Page 3: LEADERSHIP MESSAGES (Chair + CEO)

**Layout**: Stacked message blocks with avatar + name/role header
**Current**: Alternating blue50/purple50 background blocks, PersonAvatar circles, featured quotes

### Design Direction
- **Photo needs**: Headshots for Chair (Luella Bligh) and CEO (Rachel Atkinson)
  - Check: `photo_url` field in `leadership_messages` table
  - Fallback: PersonAvatar generates colored initial circles
- **Structure per message**:
  - Row: 48px avatar circle | Name (Inter 12pt bold, blueDark) + Title (Inter 8.5pt, muted)
  - Optional title: Inter 11pt bold
  - Body: Inter 9pt, gray-600, lineHeight 1.65
  - Featured quote: QuoteBlock with colored left border
- **Alternating backgrounds**: Message 1 = `#eff6ff` (blue50), Message 2 = `#faf5ff` (purple50)

### Figma Notes
- If we get professional headshots, these should be circular with a subtle shadow
- Featured quotes should visually pop — consider pulling them out as callout cards
- May need to split across 2 pages if messages are long — react-pdf handles `wrap`

---

## Page 4: YEAR IN NUMBERS

**Layout**: 6 stat boxes in 2-column grid (3 rows x 2 cols)
**Current**: StatBox components (48% width each) with Caveat 32pt values, colored accents

### Design Direction
- **No photos** — this is a data page, numbers speak
- **Structure**:
  - Section label: "IMPACT" — Inter 7.5pt uppercase purple, letterSpacing 2
  - Gradient bar: 80pt wide blue→purple
  - Heading: Caveat 32pt "Year 17 in Numbers"
  - Lead text: Inter 11pt gray-600
  - 6 stat cards in 2-col layout
- **Stat box design**:
  - Width: 48% of content area (~238pt)
  - Value: Caveat 32pt bold in accent color
  - Label: Inter 9pt gray-600
  - Left border: 4pt colored accent
  - Background: white with subtle shadow or border
- **Color rotation**: Blue, Purple, Green, Orange, Teal, Amber (one per stat)
- **Decorative**: DotPattern top-right, WaveDecoration bottom

### Figma Notes
- Stats should feel bold and celebratory — big numbers, warm colors
- Consider making the top 2 stats (e.g. staff count, clients served) visually larger
- For funder audience: emphasize financial stats. For community: emphasize people stats

---

## Page 5: PHOTO SPREAD — "Life on Palm Island"

**Layout**: 1 large hero + 4 smaller in 2x2 grid
**Current**: 1 full-width photo (100% x 220pt) + 4 half-width photos (48% x 160pt)

### Design Direction
- **Photo sources** (priority order):
  1. Professional photography (Oct 2025) — 323 images, highest quality
  2. Spring Festival — 512 images, vibrant community energy
  3. Community visit photos — 241 images, authentic moments
  4. Daycare opening — 148 images, celebration/milestone
- **Image selection criteria**:
  - Hero (top): Wide community scene, outdoor, multiple people, warm lighting
  - Grid photos: Mix of services, events, people, places
  - Include: children, elders, staff at work, cultural moments
  - Avoid: repetitive group shots, low-light indoor, sensitive content
- **Captions**: Inter 7.5pt muted, centered below each photo
- **Layout math**: Hero = 495pt wide x 220pt tall, Grid = 238pt wide x 160pt tall each

### Figma Notes
- All photos need 8pt borderRadius
- Consider a masonry variant for visual interest (unequal heights)
- This is the most visually impactful page — choose photos that make people feel something
- Tag system: query `media` table for `tags` containing `hero`, `annual-report`, `community`

---

## Page 6: HIGHLIGHTS

**Layout**: Card grid — 2 columns of highlight cards
**Current**: Card components (48% width) with colored left border, title, description, badge

### Design Direction
- **No photos** (text cards) — but consider adding small thumbnail per highlight
- **Image opportunity**: If highlights have associated media, show 40x40 thumbnail in card header
- **Card design**:
  - Width: 48% content area
  - Colored left border (3pt)
  - Featured highlights get purple border; others rotate through palette
  - Title: Inter 11pt bold blueDark
  - Description: Inter 8.5pt gray-600
  - Badge (optional): Impact metric in colored pill

### Figma Notes
- Featured highlights should be visually distinct (maybe larger or spanning full width)
- Consider a numbered list format instead for cleaner reading
- Badge format: small colored pill with white text (e.g. "200+ participants")

---

## Page 7: COMMUNITY VOICES

**Layout**: 6 voice cards in 2-column grid
**Current**: voiceCard (48% width) with colored top border by type, italic quote, avatar + attribution

### Design Direction
- **Photo needs**: Community member photos from `stories.storyteller_photo_url` or PersonAvatar fallback
- **Voice types with color coding**:
  - Elder Wisdom (purple `#9333ea`) — validated elder quotes
  - Community Story (blue `#2563eb`) — report-worthy stories
  - Community Vision (green `#16a34a`) — approved aspirations
  - Feedback (teal `#0f766e`) — what you said / what we did
- **Card structure**:
  - Type label: Inter 7pt uppercase bold, colored
  - Photo: 36x36 circle (if available)
  - Quote: Inter 9pt italic, primary text color
  - Attribution: Inter 8pt gray-600, "— Name, Role"
- **Decorative**: DotPattern bottom-right purple 8% opacity

### Figma Notes
- Each card should feel like a distinct voice — the color coding helps
- Consider pull-quote treatment for the strongest quote (larger, centered, different layout)
- Voices are the heart of Report 2.0 — this page should feel warm and personal

---

## Page 8: YOUTH VOICES

**Layout**: Stacked QuoteBlocks + 3 stat boxes at bottom
**Current**: QuoteBlock per youth voice, 3 StatBox row at bottom

### Design Direction
- **Content**: Youth-tagged stories and quotes (32% of Palm Island is youth)
- **Stats** (currently hardcoded — need to make dynamic):
  - "32%" — Youth Population (purple)
  - "21" — Youth at Digital Service Centre (blue)
  - "1,253" — Diversionary Referrals (green)
- **Image opportunity**: Youth-focused photos from:
  - Digital Service Centre images
  - Spring Festival youth participants
  - Sports/recreation moments
- **Layout**:
  - Full-width QuoteBlocks (stacked, not gridded — gives each voice space)
  - Each quote: colored left border, Inter 9pt italic, bold attribution
  - Bottom row: 3 stat boxes evenly spaced

### Figma Notes
- Consider a different background color for this page (light blue or light green) to differentiate from general community voices
- Youth voices should feel energetic — bolder colors, slightly larger type
- The "32%" stat should be the visual anchor of the page

---

## Page 9: RESILIENCE — "13,000 Years of Flood Knowledge"

**Layout**: Quote + wisdom box + vertical timeline
**Current**: QuoteBlock (Gubbal creation story), purple-bg wisdom box, left-bordered timeline events

### Design Direction
- **Content pillars**:
  1. Gubbal creation story quote (cultural centerpiece)
  2. Manbarra Weather Wisdom (traditional knowledge bullets)
  3. Resilience Timeline (flood events across decades)
- **Image opportunity**:
  - Storm recovery photos (59 images — `storm-recovery` tag)
  - Cyclone Kirrily photos (in `public/cyclone-kirrily-temp/`)
  - Historical flooding imagery (if available)
- **Cultural note**: Gubbal story has a cultural sensitivity note — display in italic 7pt muted below quote
- **Timeline design**: Left-aligned vertical, colored dots/lines per event, year + title + detail

### Figma Notes
- This page bridges ancient wisdom with modern resilience — visual tone should be reverent but strong
- The Gubbal quote is the centerpiece — larger type, purple accent
- Timeline could use a continuous vertical line with branching event nodes
- Consider water/wave motifs in decorative elements

---

## Page 10: FLOOD STORIES — "Many Tribes, One People"

**Layout**: Stacked QuoteBlocks + footer box for Magnificent Seven
**Current**: Resilience-tagged voices as QuoteBlocks, gray footer box with avatar grid for 1957 strike leaders

### Design Direction
- **Content**: Community voices about floods/water/resilience (from curated-voices API)
- **Photo needs**: Storm storyteller photos (Clay, Agnes, Patricia, Thomas, etc.)
  - Check: `stories` table where category contains 'storm' or 'resilience'
- **Magnificent Seven section**:
  - 2-column grid of 7 historical figures with initials avatars
  - Name (Inter 8pt bold) + Role (Inter 7pt muted)
  - Contextual intro connecting 1957 organizing to modern flood response
- **Image opportunity**: Pre/post flood comparison photos, community organizing images

### Figma Notes
- This page should feel like living history — connecting past to present
- QuoteBlocks should be generous with whitespace between them
- Magnificent Seven box is a distinct section — consider a different background tone
- Could include a small map or water imagery as subtle background element

---

## Page 11: GOVERNANCE — Board of Directors

**Layout**: 3-column grid of board member cards + governance statement box
**Current**: boardCard (31% width, 3-col) with avatar, name, position. Purple box for governance statement.

### Design Direction
- **Photo needs**: Board member headshots from `board_members.photo_url`
  - Fallback: PersonAvatar circles with initials
  - Professional photos would elevate this page significantly
- **Card design**:
  - Width: 31% (3 per row)
  - Centered layout: avatar (40px circle) → name → position
  - White background, 1pt border, 8pt radius
- **Governance statement**: Purple50 background box with meeting frequency, compliance note
- **Decorative**: DotPattern bottom-left purple 8%

### Figma Notes
- Board photos should be consistently styled (same background, similar lighting)
- If no photos, the initial circles should use the same brand color (purple)
- This page should feel authoritative but approachable
- Consider: Chair and Deputy Chair cards slightly larger than others

---

## Page 12: COMPLIANCE & REGISTRATION

**Layout**: Label-value rows + 2 info boxes (Auditor + CATSI)
**Current**: complianceRow pairs (40%/58% split), bgSection box for auditor, purple50 box for CATSI

### Design Direction
- **No photos** — formal regulatory page
- **Data rows**:
  - ICN (Indigenous Corporation Number): ICN 7438
  - ABN: 11 154 579 565
  - Registered Under: CATSI Act 2006 (ORIC)
  - Also Registered: ACNC, ASIC
  - Corporation Size: Large
  - Members, AGM Date, Board Meetings (from compliance data)
- **Auditor box**: Gray background, formal tone
- **CATSI box**: Purple50 background, compliance declaration

### Figma Notes
- Clean, structured, no-nonsense layout
- Consider a small ORIC logo or CATSI Act emblem if available
- This page exists for funders and government audiences — must be precise and complete
- Hidden from community audience by default

---

## Page 13: DIRECTORS' DECLARATION

**Layout**: Large text block + dual signature lines
**Current**: bgSection box with declaration text, two signature blocks at bottom

### Design Direction
- **No photos** — legal document page
- **Declaration text**: Inter 10pt, gray-600, lineHeight 1.8, in a gray background box
- **Signature area**:
  - Two columns (45% width each)
  - Signature line (1pt border-top)
  - Name: Inter 10pt bold blueDark
  - Title: Inter 8.5pt muted
  - Chair (left) and CEO (right)
- **Names**: Pulled dynamically from `boardMembers` (Chair) and `leadershipMessages` (CEO)

### Figma Notes
- Most formal page in the document — clean, minimal, authoritative
- Generous vertical space between declaration text and signatures
- The signature lines need enough space above them for actual signatures (physical copies)
- Consider a watermark of the PICC logo at very low opacity behind the declaration

---

## Page 14: PROGRAMS & SERVICES

**Layout**: Grouped by category — category header + 2-column card grid per group
**Current**: serviceCategoryTitle (colored, bottom-border) + 48% Card components per service

### Design Direction
- **Service categories with colors**:
  - Health (green `#16a34a`) — Bwgcolman Healing, Women's Shelter, etc.
  - Family (purple `#9333ea`) — Family Care, Children & Family Centre
  - Justice (orange `#ea580c`) — Justice Services, Night Patrol
  - Community (blue `#2563eb`) — Digital Service Centre, The Centre
  - Economic (teal `#0f766e`) — Social enterprises
- **Card content**: Service name + description + badges (staff count, clients/year)
- **Image opportunity**: Service-specific photos
  - Query: `media` table with tags matching service names
  - 40-60px thumbnails in cards would add visual interest
- **25 services** — this will need 2 pages. React-pdf handles page breaks with `wrap`

### Figma Notes
- Category headers should feel like section dividers — bold color, bottom border
- Cards should be scannable — bold title, concise description, metric badges
- Consider icon system per category instead of/alongside color coding
- For funder audience: emphasize funding attribution per service

---

## Page 15: INNOVATION PROJECTS

**Layout**: 3 stat boxes top + 2-column project cards
**Current**: StatBox row (projects/active/staff), innovationCard (48%) with hero image, status badge, title, description

### Design Direction
- **Stats** (top row):
  - Total Projects: 8 (purple)
  - Active Projects: dynamic count (green)
  - "44 Enterprise Staff" (teal) — **currently hardcoded, needs to be dynamic**
- **Project cards**:
  - Each has a hero image (80pt tall, 6pt radius, objectFit cover)
  - Status badge: Inter 7pt uppercase bold purple
  - Title: Inter 11pt bold blueDark
  - Description: Inter 8.5pt gray-600
  - Purple top border (3pt)
- **Photo sources**: All 8 projects have `hero_image_url` in database:
  - Palm Island Photo Studio, Healthy Meals Kitchen, Walking Country Together (Elders Trip)
  - The Centre, Movember Project, Youth Enterprise, Recycling Program, Secondhand Goods Shop
- **Decorative**: DotPattern bottom-right purple 8%

### Figma Notes
- Project hero images are the visual hook — ensure they're high quality
- Status badges should be color-coded (in_progress = blue, planning = amber, active = green)
- Consider 2-page spread: overview stats on page 1, project cards on page 2
- The "44 Enterprise Staff" stat should come from data, not hardcode

---

## Page 16: FINANCIALS — Income & Expenditure

**Layout**: 3 summary cards (income/expenditure/net) + expenditure bar chart
**Current**: 3 colored cards (green/amber/conditional), horizontal bar chart for breakdown

### Design Direction
- **No photos** — data visualization page
- **Summary cards** (31% width each):
  - Total Income: Green accent, Caveat 28pt value
  - Total Expenditure: Amber accent, Caveat 28pt value
  - Net Result: Green (surplus) or gray (deficit), Caveat 28pt value
  - Each shows prior year comparison if available
- **Bar chart**:
  - Category label (Inter 9pt gray-600) left
  - Value + percentage (Inter 9pt bold blueDark) right
  - Horizontal bar: colored, proportional to max amount
  - 10pt tall bars, 5pt borderRadius
- **Color rotation** on bars: Blue, Purple, Green, Orange, Teal, Amber

### Figma Notes
- The three summary cards should be the visual anchor — big numbers in Caveat font
- Bar chart should be clean and easy to scan
- Green for surplus, careful with deficit styling — don't make it alarming
- Prior year comparison in subtle 7.5pt muted text

---

## Page 17: FINANCIAL DETAIL — Revenue by Funder

**Layout**: Funder breakdown bars + year-on-year comparison table
**Current**: Horizontal bars per funder (14pt tall), optional prior-year comparison table

### Design Direction
- **Funder bars**: Same visual language as expenditure bars but taller (14pt)
- **Comparison table**: 3-column (label / prior year / current year)
  - Row items: Total Income, Total Expenditure, Net Result
  - bgSection background, 8pt radius
  - Current year values in bold blueDark, prior year in muted
- **Only shows when**: `revenue_by_funder` data exists AND is populated

### Figma Notes
- This page is funder-specific — it's in funder, board, and government audiences but not community
- Clean data presentation — no decorative elements needed
- Consider pie/donut chart as alternative to bars for funder mix
- The comparison table should make year-over-year movement immediately clear

---

## Page 18: OUR JOURNEY — Timeline

**Layout**: Progress bar + era blocks with vertical indicator
**Current**: Year progress bar (0-20), era blocks with colored left indicator, milestones as bullet lists

### Design Direction
- **Progress indicator**: Full-width bar showing Year 17 of 20
  - Labels: "2009 — Founded" (left), "Year 17" (center, bold purple), "2029 — 20 Years" (right)
  - Bar: 8pt tall, gray background, purple fill to 85%
- **4 Eras** with assigned colors:
  1. Foundation (blue) — 2009-2013
  2. Growth (purple) — 2013-2017
  3. Transition (green) — 2017-2021
  4. Community Controlled (teal) — 2021-present
- **Era block design**:
  - Left: 4pt colored vertical indicator bar
  - Content: Era name (Inter 11pt bold), years (Inter 8pt muted), description, 3 milestone bullets
  - White background, 1pt border, 8pt radius
- **Image opportunity**: Historical photos per era (from history API / media library)
  - Foundation era: early PICC photos
  - Growth era: expansion moments
  - Consider small thumbnails in era blocks

### Figma Notes
- The progress bar is a powerful visual — "we're 85% of the way to 20 years"
- Era blocks should cascade downward like a timeline
- Consider a true vertical timeline with alternating left/right blocks for Figma exploration
- This page connects identity to narrative — it should feel like a story

---

## Page 19: THE NEXT 20 YEARS

**Layout**: 4 goal rows with progress bars + community vision quotes
**Current**: goalRow cards with label/progress, QuoteBlock for community visions, CEO forward box

### Design Direction
- **4 Goals** (currently hardcoded — make dynamic):
  1. Total Staff: 197 → 300 (blue) — 66%
  2. Integrated Services: 20 → 50 (purple) — 40%
  3. Annual Income: $23.4M → $40M (green) — 59%
  4. Social Enterprises: 3 → 8 (teal) — 38%
- **Goal row design**:
  - Left: Label (Inter 10pt bold) + "current → target by 2029" (Inter 8pt muted)
  - Right: Percentage (Inter 10pt bold colored) + progress bar (160pt wide, 12pt tall)
- **Community Visions**: 2 QuoteBlocks from `community_vision` type voices
  - Header: "What Our Community Wants" in purple
- **CEO Forward**: Optional blue50 box with CEO's looking-forward text

### Figma Notes
- Progress bars are the visual centerpiece — they tell the growth story at a glance
- Community visions humanize the targets — "this isn't just numbers, it's what people want"
- Consider circular progress indicators as an alternative to linear bars
- The 38% social enterprises bar is the lowest — this is where the growth opportunity is

---

## Page 20: BACK COVER

**Layout**: Full-bleed dark blue background, centered content
**Current**: blueDark background, centered logo, mission statement in Caveat, contact details

### Design Direction
- **Background**: Solid `#1e3a8a` (blueDark)
- **Content stack** (vertically centered):
  - PICC logo: 140 x 70pt (white version)
  - Mission: Caveat 22pt white, centered, maxWidth 380pt, lineHeight 1.4
  - Divider: 60pt white line at 40% opacity
  - Contact: Inter 9pt, `#d1d5db` (textLight), centered
    - Company name, ABN, ICN, PO Box, website
- **Footer**: Year + "Year 17" in 7pt, very low opacity

### Figma Notes
- Logo must be white/light version for dark background
- The mission statement should be the emotional close — warm, aspirational
- Contact details are practical — smaller, lighter
- Consider subtle starfield or dot pattern at very low opacity for texture

---

## Cross-Page Design Elements

### Running Header (pages 2-19)
- Position: absolute top 20pt
- Left: "Palm Island Community Company" — Inter 6.5pt semibold uppercase, letterSpacing 2, muted
- Right: "Annual Report 2024-25" — same style

### Page Numbers (pages 2-19)
- Position: absolute bottom 20pt, centered
- Inter 8pt muted

### Section Labels
- Inter 7.5pt bold uppercase, letterSpacing 2, purple
- Appears above each section heading

### Gradient Bar
- Small decorative bar (80-100pt wide) below section label
- Blue → Purple gradient

### DotPattern
- Decorative 3x3 to 5x5 dot grids
- Purple or blue at 8-10% opacity
- Positioned in corners as subtle texture

### WaveDecoration
- Subtle wave SVG element on data-heavy pages
- Blue, positioned at bottom

---

## Photo Strategy Summary

| Page | Photo Need | Best Source | Tag/Query |
|------|-----------|------------|-----------|
| Cover | Hero group photo | Professional shoot (Oct 2025) | `hero`, `community` |
| Photo Spread | 5 diverse community photos | Professional + Festival + Visit | `annual-report`, `hero` |
| Community Voices | Storyteller headshots | `stories.storyteller_photo_url` | Individual lookups |
| Youth Voices | Youth activity photos | Digital Service Centre, Festival | `youth`, `digital-service` |
| Resilience | Storm/water imagery | Storm recovery (59 imgs) | `storm-recovery` |
| Flood Stories | Storyteller photos | Storm stories contributors | Individual lookups |
| Governance | Board headshots | `board_members.photo_url` | Individual lookups |
| Services | Service thumbnails | Media by service tag | Service name tags |
| Innovation | Project hero images | `projects.hero_image_url` | Per-project |
| Journey | Historical era photos | History collection | `history`, era tags |

**Total photo needs**: ~40-50 unique images across the full report

---

## Audience Variants

| Page | Community | Funder | Supporter | Board | Government |
|------|-----------|--------|-----------|-------|------------|
| Cover | Y | Y | Y | Y | Y |
| Acknowledgement | Y | Y | Y | Y | Y |
| Messages | Y | Y | Y | Y | Y |
| Numbers | Y | Y | Y | Y | Y |
| Photos | Y | - | Y | - | - |
| Highlights | Y | Y | Y | Y | Y |
| Community Voices | Y | - | Y | Y | - |
| Youth Voices | Y | - | - | - | - |
| Resilience | Y | - | Y | - | - |
| Flood Stories | Y | - | Y | - | - |
| Governance | - | Y | - | Y | Y |
| Compliance | - | Y | - | Y | Y |
| Directors Report | - | Y | - | Y | Y |
| Services | Y | Y | - | Y | Y |
| Innovation | Y | Y | Y | Y | Y |
| Financials | - | Y | - | Y | Y |
| Financial Detail | - | Y | - | Y | Y |
| Journey | Y | - | Y | Y | - |
| Next Twenty | Y | Y | Y | Y | Y |
| Back Cover | Y | Y | Y | Y | Y |
| **Total pages** | **15** | **14** | **13** | **16** | **14** |

---

## Hardcoded Values to Fix

| Page | Current Hardcode | Should Be |
|------|-----------------|-----------|
| Youth Voices | "32%" Youth Population | Dynamic from stats |
| Youth Voices | "21" Youth at DSC | Dynamic from stats |
| Youth Voices | "1,253" Diversionary Referrals | Dynamic from stats |
| Innovation | "44" Enterprise Staff | Dynamic from data |
| Next Twenty | Staff 197→300, Services 20→50, Income $23.4M→$40M, Enterprises 3→8 | Dynamic from `organization_goals` table or report data |
| Acknowledgement | Fallback acknowledgement text | Should come from `annual_reports.acknowledgments` |

---

## Figma Setup Recommendations

1. **Create component library first**: StatBox, Card, QuoteBlock, PersonAvatar, RunningHeader, GradientBar
2. **Set up color styles**: All brand colors from theme.ts
3. **Set up text styles**: All typography variants from baseStyles
4. **Create A4 frame template**: 595x842pt with 50pt margin guides
5. **Build 5 master pages** (one per audience), then generate variants
6. **Photo placeholders**: Use actual Supabase media URLs for realistic mockups
