# PICC Digital Platform Overview
## Public Website & Backend Management System

---

# Part 1: The Public Website
## What the Community & World Can See

---

## Homepage (`/`)
**The front door to PICC's digital presence**

| What Visitors See | Backend That Powers It |
|-------------------|----------------------|
| Hero video/image | `/admin/media` - upload and tag for home page |
| Impact stats (197 staff, 16+ services) | Database - organization_stats table |
| Featured stories carousel | `/picc/dashboard` - mark stories as featured |
| Elder wisdom quotes | Stories tagged as elder stories |
| Photo gallery | `/admin/media` - tagged for home gallery |
| Call-to-action sections | `/admin/media` - CTA background images |

---

## Stories Section

### Stories Browser (`/stories`)
**Browse all community stories**

| What Visitors See | Backend That Powers It |
|-------------------|----------------------|
| Featured stories (3) | `/picc/dashboard` - toggle featured flag |
| Elder wisdom stories (6) | Stories where storyteller is marked as elder |
| Recent stories (12) | Auto-sorted by publish date |
| Story categories | Set when story is created/edited |
| Hero section images | `/admin/media` - page_context='stories' |

### Individual Story (`/stories/[id]`)
**Full story experience**

| What Visitors See | Backend That Powers It |
|-------------------|----------------------|
| Full story content | `/picc/projects/[slug]/story-builder` or story form |
| Storyteller photo & info | `/picc/storytellers` - profile management |
| Related stories | Automatic placement rules based on category |
| Story images/media | Attached during story creation |

### Share Your Voice (`/share-voice`)
**Community members submit their stories**

| What Visitors See | Backend That Powers It |
|-------------------|----------------------|
| Text story form | Goes to `/picc/submissions` for review |
| Audio recording | Transcribed by AI, saved as draft |
| Video upload | Uploaded to media library |
| Anonymous option | Controlled in `/picc/settings` |

---

## About & Impact

### About PICC (`/about`)
**Organization story and leadership**

| What Visitors See | Backend That Powers It |
|-------------------|----------------------|
| Vision statement | Hardcoded (could be database) |
| Impact numbers | Database - organization_stats |
| CEO quote & video | `/admin/media` - ceo-video section |
| Historical timeline | `/picc/knowledge/timeline` |
| Leadership team photos | `/admin/media` - leadership photos |
| Services showcase | `/picc/knowledge` - service data |
| Elder stories | Stories with elder tag |

### Impact Page (`/impact`)
**Quantified community outcomes**

| What Visitors See | Backend That Powers It |
|-------------------|----------------------|
| Impact statistics | Database - calculated metrics |
| Cost savings data | `/picc/knowledge/financial` |
| Innovation projects | `/picc/projects` - marked as innovation |
| Transparent reporting | `/picc/annual-reports` |
| Community stories | Featured stories selection |

---

## Community Engagement

### Community Hub (`/community`)
**Invitation to participate**

| What Visitors See | Backend That Powers It |
|-------------------|----------------------|
| Story count | Auto-calculated from database |
| Latest stories | Newest 3 published stories |
| Ways to share (text/audio/video) | Form options in share-voice |
| Storyteller count (28+) | Count of profiles with stories |
| Storyteller photos | `/picc/storytellers` - uploaded photos |

### Storytellers Gallery (`/storytellers`)
**Meet the community voices**

| What Visitors See | Backend That Powers It |
|-------------------|----------------------|
| Storyteller profiles | `/picc/storytellers` - full management |
| Profile photos | Upload via storyteller edit page |
| Story counts per person | Auto-calculated from stories table |
| Search by name/location | Uses profile data fields |
| Elder badges | Elder flag in profile |

---

## Annual Reports

### Timeline (`/annual-reports`)
**15+ years of PICC history**

| What Visitors See | Backend That Powers It |
|-------------------|----------------------|
| Horizontal year timeline | `/api/knowledge/annual-reports` |
| Era filters | Defined in knowledge base |
| Total reports (15+) | Count from database |
| Total images (346+) | Extracted from PDF reports |
| PDF downloads | `/admin/annual-reports` - uploaded PDFs |

### Gallery (`/annual-reports/gallery`)
**Visual archive from all years**

| What Visitors See | Backend That Powers It |
|-------------------|----------------------|
| Images from all years | Extracted from PDFs via scripts |
| Year filtering | Fiscal year metadata on images |
| Page number info | Extracted during PDF processing |

### Live Report (`/annual-report/live`)
**Real-time current year dashboard**

| What Visitors See | Backend That Powers It |
|-------------------|----------------------|
| Current staff count | organization_stats table |
| All 16 services | organization_services table |
| Featured stories | Stories marked featured |
| Innovation projects | `/picc/projects` - innovation flag |
| Leadership info | profiles + organization_members |
| Financial documents | Uploaded document links |

### Historical Reports (`/annual-report/[year]`)
**Completed annual reports**

| What Visitors See | Backend That Powers It |
|-------------------|----------------------|
| Executive summary | annual_reports table |
| CEO/Chair messages | report_leadership_messages |
| Year highlights | annual_reports.year_highlights |
| Financial breakdown | annual_reports.statistics |
| Community stories | annual_report_stories junction |
| Photo gallery | Images tagged to fiscal year |

---

## Publications & Knowledge

### Publications (`/publications`)
**Reports, research, community documents**

| What Visitors See | Backend That Powers It |
|-------------------|----------------------|
| Category filters | publication.category field |
| Featured publication | is_featured flag |
| PDF downloads | pdf_url field |
| Publication dates | published_date field |

### Calendar (`/calendar`)
**Important community dates**

| What Visitors See | Backend That Powers It |
|-------------------|----------------------|
| Upcoming events | `/api/calendar` endpoint |
| Event types (cultural, health, etc) | Event type categorization |
| Today's significance | Auto-detected cultural dates |
| NAIDOC, Sorry Day, etc | Pre-populated important dates |

### Search (`/search`)
**Find content across the platform**

| What Visitors See | Backend That Powers It |
|-------------------|----------------------|
| Full-text search results | Searches stories table |
| Category filtering | story.category field |
| Date range filtering | story.created_at field |
| Storyteller info | Joined from profiles table |

---

# Part 2: The Backend
## What PICC Staff Use to Manage Everything

---

## Content Management Hub (`/picc/*`)

### Dashboard (`/picc/dashboard`)
**Command center for content**
- Total/published/pending story counts
- Quick actions for story management
- Pending review queue
- Links to all management functions

### Story Management
| Page | Purpose |
|------|---------|
| `/picc/submissions` | Review incoming community stories |
| `/picc/drafts` | Work on unpublished stories |
| `/picc/published` | Manage live stories |
| `/picc/archived` | Store older content |

### Storyteller Management (`/picc/storytellers`)
| Page | Purpose |
|------|---------|
| `/picc/storytellers` | Browse all storytellers |
| `/picc/storytellers/new` | Add new storyteller profile |
| `/picc/storytellers/[id]/edit` | Edit profile details |
| `/picc/storytellers/[id]/upload` | Upload photos |
| `/picc/storytellers/[id]/interviews` | Track interview sessions |

### Project Management (`/picc/projects`)
| Page | Purpose |
|------|---------|
| `/picc/projects` | View all innovation projects |
| `/picc/projects/new` | Create new project |
| `/picc/projects/[slug]` | Project details |
| `/picc/projects/[slug]/edit` | Edit project |
| `/picc/projects/[slug]/story-builder` | Build stories for project |
| `/picc/projects/[slug]/updates/new` | Post project updates |

---

## Media Management

### Admin Media Hub (`/admin/media`)
**Central control for all images/videos**
- Upload images with AI analysis
- Tag by page context (home, about, stories, etc.)
- Tag by section (hero, gallery, testimonials, etc.)
- Set featured/public flags
- Control display order
- Manage alt text for accessibility

### PICC Media Routes (`/picc/media/*`)
| Page | Purpose |
|------|---------|
| `/picc/media` | Media library hub |
| `/picc/media/gallery` | Visual gallery view |
| `/picc/media/collections` | Organize into collections |
| `/picc/media/smart-folders` | Auto-organized folders |
| `/picc/media/upload` | Single upload |
| `/picc/media/upload-bulk` | Bulk upload |
| `/picc/media/images` | Image management |
| `/picc/media/videos` | Video management |
| `/picc/media/audio` | Audio management |
| `/picc/media/external-videos` | YouTube/Vimeo links |

---

## Knowledge & Research (`/picc/knowledge/*`)

| Page | Purpose |
|------|---------|
| `/picc/knowledge` | Knowledge base search |
| `/picc/knowledge/new` | Add new entries |
| `/picc/knowledge/sources` | Research sources |
| `/picc/knowledge/timeline` | Historical timeline |
| `/picc/knowledge/financial` | Financial data |
| `/picc/knowledge/annual-reports` | Annual report archive |

---

## Analytics & Insights (`/picc/analytics`)
**Understand community engagement**
- Story counts and trends
- Storyteller participation
- Category breakdown
- Service impact metrics
- Top storytellers leaderboard
- Monthly trends charts

---

## Content Creation Tools

### Content Studio (`/picc/content-studio`)
**AI-powered social media content**
- Select a story
- Generate posts for Instagram, Facebook, LinkedIn, Twitter
- Edit and copy to clipboard
- Platform-specific formatting

### Quote Cards (`/picc/quote-cards`)
**Visual quote graphics**
- Create shareable quote graphics
- Export for social media

### Newsletter (`/picc/newsletter`)
**Community updates**
- Build email newsletters
- Include story highlights
- Send to subscribers

---

## Reporting & Export (`/picc/reports/*`)

| Page | Purpose |
|------|---------|
| `/picc/reports` | Report hub |
| `/picc/reports/demo` | Demo/example report |
| `/picc/report-generator` | Custom report builder |

**Export formats:** PDF, DOCX, CSV, XLSX

**Report types:**
- Impact summary reports
- Storyteller reports
- Story category breakdowns
- Monthly activity reports
- Funder-ready reports

---

## Settings & Administration

### Platform Settings (`/picc/settings`)
- Enable/disable public submissions
- Approval workflows
- Anonymous story settings
- Cultural safety protocols
- Notification preferences
- Storage limits

### Team Management (`/picc/team`)
- Staff profiles
- Role assignments
- Permission levels

### AI Services (`/admin/ai`)
- Cache management
- Rate limiting
- AI endpoint monitoring

---

# Part 3: The Value
## What This Platform Delivers

---

## For the Community

| Value | How It's Delivered |
|-------|-------------------|
| **Voices are heard** | Anyone can share stories via text, audio, or video |
| **History is preserved** | 15+ years of annual reports, 346+ images archived |
| **Culture is celebrated** | Elder wisdom section, cultural protocols, traditional knowledge |
| **Achievements are visible** | Impact statistics, innovation projects, service highlights |
| **Access is easy** | Mobile-friendly, searchable, always available |

## For PICC Staff

| Value | How It's Delivered |
|-------|-------------------|
| **Efficient workflow** | Central dashboard for all content management |
| **Easy updates** | No coding needed - just forms and uploads |
| **Automated reporting** | Reports generate from collected data |
| **Social media made easy** | AI generates platform-specific posts |
| **Quality control** | Review/approve workflow for submissions |

## For Funders & Stakeholders

| Value | How It's Delivered |
|-------|-------------------|
| **Transparency** | Live annual report shows real-time impact |
| **Accountability** | Financial breakdowns, service statistics |
| **Evidence of impact** | Community stories linked to services |
| **Professional presentation** | Polished reports exportable to PDF |
| **Historical context** | 15 years of documented progress |

## For the Broader Community

| Value | How It's Delivered |
|-------|-------------------|
| **Model for others** | First Nations organizations can learn from approach |
| **Searchable knowledge** | AI-powered search across all content |
| **Shareable content** | Quote cards, social posts, downloadable reports |
| **Cultural education** | Calendar of important dates, historical timeline |

---

# Part 4: System Architecture
## How It All Connects

```
┌─────────────────────────────────────────────────────────────────────────┐
│                         PUBLIC WEBSITE                                   │
│  ┌──────────┐ ┌──────────┐ ┌──────────┐ ┌──────────┐ ┌──────────┐      │
│  │   Home   │ │  Stories │ │  About   │ │ Annual   │ │ Community│      │
│  │    /     │ │ /stories │ │  /about  │ │ Reports  │ │/community│      │
│  └────┬─────┘ └────┬─────┘ └────┬─────┘ └────┬─────┘ └────┬─────┘      │
└───────┼────────────┼────────────┼────────────┼────────────┼─────────────┘
        │            │            │            │            │
        ▼            ▼            ▼            ▼            ▼
┌─────────────────────────────────────────────────────────────────────────┐
│                           DATABASE                                       │
│  ┌──────────┐ ┌──────────┐ ┌──────────┐ ┌──────────┐ ┌──────────┐      │
│  │  stories │ │ profiles │ │  media   │ │ annual   │ │ knowledge│      │
│  │          │ │          │ │  files   │ │ reports  │ │ entries  │      │
│  └────┬─────┘ └────┬─────┘ └────┬─────┘ └────┬─────┘ └────┬─────┘      │
└───────┼────────────┼────────────┼────────────┼────────────┼─────────────┘
        │            │            │            │            │
        ▼            ▼            ▼            ▼            ▼
┌─────────────────────────────────────────────────────────────────────────┐
│                         PICC BACKEND                                     │
│  ┌──────────┐ ┌──────────┐ ┌──────────┐ ┌──────────┐ ┌──────────┐      │
│  │Dashboard │ │Storytell │ │  Media   │ │ Annual   │ │Knowledge │      │
│  │  /picc   │ │   ers    │ │  Admin   │ │ Reports  │ │   Base   │      │
│  └──────────┘ └──────────┘ └──────────┘ └──────────┘ └──────────┘      │
└─────────────────────────────────────────────────────────────────────────┘
```

---

## Content Flow

```
Community Member                    PICC Staff                      Public Website
      │                                 │                                │
      │  Submits story via              │                                │
      │  /share-voice                   │                                │
      ├────────────────────────────────►│                                │
      │                                 │  Reviews in                    │
      │                                 │  /picc/submissions             │
      │                                 │         │                      │
      │                                 │         │ Approves             │
      │                                 │         ▼                      │
      │                                 │  Story marked                  │
      │                                 │  'published'                   │
      │                                 │         │                      │
      │                                 │         └─────────────────────►│  Appears on
      │                                 │                                │  /stories
      │                                 │                                │
      │                                 │  Marks as 'featured'           │
      │                                 │         │                      │
      │                                 │         └─────────────────────►│  Appears on
      │                                 │                                │  homepage
```

---

## Page-to-Backend Quick Reference

| Public Page | Primary Backend | Secondary Backend |
|-------------|-----------------|-------------------|
| `/` (Home) | `/admin/media` | `/picc/dashboard` |
| `/stories` | `/picc/submissions` | `/picc/storytellers` |
| `/stories/[id]` | Story data | Profile data |
| `/about` | `/picc/knowledge` | `/admin/media` |
| `/impact` | `/picc/analytics` | `/picc/projects` |
| `/community` | `/picc/storytellers` | `/picc/submissions` |
| `/storytellers` | `/picc/storytellers` | - |
| `/annual-reports` | `/picc/knowledge/annual-reports` | `/admin/annual-reports` |
| `/annual-report/live` | Database stats | `/picc/projects` |
| `/annual-report/[year]` | `annual_reports` table | `report_sections` table |
| `/publications` | `publications` table | - |
| `/calendar` | `/api/calendar` | - |
| `/search` | `stories` table | - |
| `/share-voice` | Creates draft story | - |

---

# Part 5: Quick Start Guide
## For New Staff

### To add a story:
1. Go to `/picc/submissions` to review community submissions, OR
2. Go to `/picc/projects/[project]/story-builder` to create from a project

### To add a photo:
1. Go to `/admin/media`
2. Click "Upload"
3. Tag with page context (home, about, stories, etc.)
4. Tag with section (hero, gallery, etc.)
5. Mark as public

### To update the homepage:
1. Go to `/admin/media`
2. Filter by `page_context = 'home'`
3. Update hero images, gallery photos, etc.
4. Featured stories: Go to `/picc/dashboard` and toggle featured flag

### To manage storytellers:
1. Go to `/picc/storytellers`
2. Add new profiles, upload photos, track interviews
3. Public profiles appear at `/storytellers`

### To generate reports:
1. Go to `/picc/reports`
2. Select report type
3. Choose date range
4. Export to PDF/DOCX/CSV

---

---

# Part 6: Current Content in the System
## What's Ready to Display

---

## Stories Available

### From `picc_complete_setup.sql` (6 foundational stories)
| Story | Storyteller | Category |
|-------|-------------|----------|
| Building Youth Leadership on Palm Island | Roy Prior | Youth Development |
| Keeping Language and Culture Strong | Uncle Frank | Culture |
| Caring for Our Elders with Respect | Uncle Alan | Elder Care |
| Women's Healing and Empowerment | Ruby Sibley | Women's Health |
| Strengthening Families Through Culture | Ferdys | Family Support |
| Healing Body and Spirit Together | Goonyun | Health |

### From `import_storm_stories.sql` (26 storm recovery stories)

**Men's Programs & Recovery (4 stories)**
- Finding Purpose Beyond Addiction - Men's Group
- Clay Alfred: Prepared for the Storm
- Rodney, Daniel & George: 24 Hours Without Power
- Gregory: Worse Rain Than 50 Years of Cyclones

**Infrastructure & Housing Damage (7 stories)**
- Agnes Watten: $5,000 in Storm Damage
- Ellen Friday: Still Waiting for a Fridge
- Catherine (66): Still No Repairs
- Playgroup Closed for Weeks: Staff Team
- James, Jordan & Stanley: PIC Emergency Response
- Community Innovation: Beds, Washing Machines, and Orange Sky
- Craig: Walking Palm Island Through the Storm

**Elder Wisdom & Governance (4 stories)**
- Elders Speak: "We Should Have Been Consulted"
- Storm, History, and Healing: Breaking Generational Trauma
- Margaret Rose Parker (75): Justice, DV Support & Storm Response
- Sisters Patricia and Kranjus: Community Strength During the Storm

**Historical Trauma & Systemic Issues (4 stories)**
- Christopher: The Storm Revealed Government Failures
- Thomas the Tanker, Margaret & Venus: Storm Veterans
- Storytelling, Data Sovereignty, and Community Recovery
- Gunnamaru and Bugumanbara: Reclaiming Traditional Names

**Cultural Preservation & Land Rights (4 stories)**
- Preserving History: The Centenary Exhibition
- Gail Larry: Artist Calls for Stronger Infrastructure
- Technology Challenges: Drones and Documentation
- At the Mountain During the Storm: A Story of Fear

### From `populate_picc_2023_24_annual_report.sql` (7 annual report stories)
| Story | Category |
|-------|----------|
| Palm Island Digital Service Centre: A New Industry | Economic Development |
| Bwgcolman Way: Community Control for Our Children | Family |
| Bwgcolman Healing Service: A Name That Reflects Our Community | Health |
| Nearly 200 Strong: PICC's Workforce Growth | Economic Development |
| Women's Healing Service: Restructured for Better Support | Family |
| PICC Shares Our Story at National Conference | Culture |
| Safe Haven: Supporting Our Young People | Youth |

**TOTAL: ~39 stories ready in the system**

---

## Storyteller Profiles

| Name | Type | Role |
|------|------|------|
| Roy Prior | Youth Services Coordinator | Can approve stories |
| Ferdys | Family Wellbeing Staff | Staff member |
| Goonyun Anderson | Cultural Centre Contributor | Contributor |
| Uncle Alan | Elder & Cultural Advisor | Elder, Can approve stories |
| Uncle Frank | Cultural Advisor | Can approve stories |
| Ruby Sibley | Women's Services Contributor | Contributor |
| Men's Group | Group Profile | Storm stories |
| Elders Group | Group Profile | Storm stories |
| Community Voice | Anonymous/Collective | Unidentified speakers |
| Playgroup Staff | Group Profile | Early learning team |
| Rachel Atkinson | CEO | Leadership message |
| Luella Bligh | Board Chair | Leadership message |
| + 7 Board Members | Directors | Governance |

---

## Services Defined (16 services)

| Service | Category | Color |
|---------|----------|-------|
| Bwgcolman Healing Service | Health | Red |
| Family Wellbeing Centre | Family | Purple |
| Youth Services | Youth | Blue |
| Early Learning Centre | Education | Orange |
| Cultural Centre | Culture | Teal |
| Ranger Program | Environment | Green |
| Digital Service Centre | Education | Dark Gray |
| Economic Development | Economic | Orange |
| Housing Services | Housing | Gray |
| Elder Support Services | Family | Purple |
| Community Justice | Justice | Dark Red |
| Women's Services | Family | Pink |
| Men's Programs | Family | Blue |
| Food Security | Health | Teal |
| Sports & Recreation | Youth | Yellow |
| Transport Services | Other | Gray |

---

## Annual Report Data (2023-24)

**Key Statistics Ready:**
- Staff: 197 (up from 151)
- Income: $23.4M
- Health clients: 2,283
- Episodes of care: 17,488
- Safe Haven children: 1,187
- 715 Health Checks: 779
- Child Health Checks: 128

**Financial Breakdown:**
- Labour: 60% ($14.3M)
- Administration: 21% ($5.0M)
- Travel & Training: 8% ($1.8M)
- Client Costs: 5% ($1.2M)
- Property & Energy: 4% ($1.1M)
- Motor Vehicle: 2% ($0.4M)

---

## What's Still Needed

### To make the public site fully populated:

| Area | Status | Action Needed |
|------|--------|---------------|
| Stories | 39 ready | Review & mark as published |
| Photos | Templates only | Upload real community photos |
| Videos | Placeholder URLs | Upload/link real videos |
| Hero images | Demo images | Upload per-page hero images |
| Storyteller photos | Missing | Upload profile photos |
| Leadership photos | Missing | Upload board/staff photos |
| Service images | Missing | Upload per-service images |

### Quick wins to populate:
1. Run `picc_complete_setup.sql` if not already run
2. Run `import_storm_stories.sql` to add storm stories
3. Run `populate_picc_2023_24_annual_report.sql` for annual report data
4. Upload photos via `/admin/media` with proper page context tags

---

*This platform represents a significant investment in community-controlled digital infrastructure. Every story, photo, and data point contributes to a living record of Palm Island's journey.*

---

**Platform developed by:** Ben Knight
**For:** Palm Island Community Company
**Version:** December 2025
