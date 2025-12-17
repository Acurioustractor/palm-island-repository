# PICC Administration Functions
## Complete Guide to Backend Management

**Total Admin Pages: 68**
**Base URL:** `/picc/`

---

## Quick Navigation

| Section | Pages | Purpose |
|---------|-------|---------|
| [Dashboard](#dashboard) | 1 | Central command |
| [Stories & Content](#stories--content-management) | 8 | Manage community stories |
| [Storytellers](#storyteller-management) | 8 | Manage profiles |
| [Media](#media-management) | 12 | Photos, videos, audio |
| [Projects](#innovation-projects) | 6 | Innovation initiatives |
| [Knowledge](#knowledge-base) | 8 | Facts, history, research |
| [Annual Reports](#annual-reports) | 2 | Report management |
| [Analytics & Insights](#analytics--insights) | 4 | Data visualization |
| [Content Creation](#content-creation-tools) | 5 | Social media, quotes |
| [Reports & Export](#reports--export) | 4 | Generate reports |
| [Communications](#communications) | 2 | Newsletter, notifications |
| [Settings](#settings--administration) | 4 | Configuration |
| [AI Tools](#ai-tools) | 2 | Assistant, scraper |

---

## Dashboard

### `/picc/dashboard`
**The command center for PICC staff**

| Feature | Description |
|---------|-------------|
| Story Counts | Total, published, pending |
| Storyteller Metrics | Active contributors |
| Quick Actions | Links to common tasks |
| Pending Queue | Stories awaiting review |
| Recent Activity | Latest submissions |

**Use for:** Daily overview, quick navigation, task prioritization

---

## Stories & Content Management

### `/picc/submissions`
**Review incoming community stories**
- View all submitted stories
- Approve or reject submissions
- Add editorial notes
- Assign to categories

### `/picc/drafts`
**Work on unpublished stories**
- Edit story content
- Add media attachments
- Preview before publishing
- Save progress

### `/picc/published`
**Manage live stories**
- View all published stories
- Edit published content
- Feature/unfeature stories
- Archive old content

### `/picc/archived`
**Store older content**
- Access archived stories
- Restore if needed
- Permanent deletion

### `/picc/community-voice`
**Community feedback collection**
- View community input
- Categorize feedback
- Track themes

### `/picc/content-hub`
**Central content coordination**
- Overview of all content
- Release management
- Data entries

### `/picc/content-hub/releases/[id]` | `/picc/content-hub/releases/new`
**Manage content releases**
- Schedule releases
- Coordinate publications
- Track release status

### `/picc/content-hub/we-heard-you`
**"We Heard You" section management**
- Community voice responses
- Feedback acknowledgment

---

## Storyteller Management

### `/picc/storytellers`
**Browse all storytellers**
- Search by name/location
- Filter by type (elder, community, staff)
- View story counts
- Quick profile access

### `/picc/storytellers/new`
**Add new storyteller**
- Full name, preferred name
- Bio and background
- Location
- Storyteller type
- Elder designation

### `/picc/storytellers/[id]`
**View storyteller profile**
- Full profile details
- All their stories
- Interview history
- Media gallery

### `/picc/storytellers/[id]/edit`
**Edit storyteller profile**
- Update details
- Change type/status
- Add/remove permissions

### `/picc/storytellers/[id]/upload`
**Upload storyteller photo**
- Profile image upload
- Crop and adjust
- Set as primary photo

### `/picc/storytellers/[id]/interviews`
**Track interviews**
- Log interview sessions
- Add notes
- Link to resulting stories

### `/picc/admin/storytellers` | `/picc/admin/storytellers/new`
**Legacy admin interface**
- Alternative storyteller management
- Bulk operations

### `/picc/admin/upload-photos`
**Bulk photo upload**
- Upload multiple photos
- Batch assign to profiles

---

## Media Management

### `/picc/media`
**Media library hub**
- Central access point
- Overview of all media
- Quick navigation

### `/picc/media/gallery`
**Visual gallery view**
- Grid of all images
- Filter by type/date
- Preview mode

### `/picc/media/images`
**Image management**
- All image files
- Tag and organize
- Set page context

### `/picc/media/videos`
**Video management**
- Uploaded videos
- Video metadata
- Thumbnail management

### `/picc/media/audio`
**Audio file management**
- Voice recordings
- Audio stories
- Transcription links

### `/picc/media/external-videos`
**YouTube/Vimeo links**
- Add external video URLs
- Embed management
- Thumbnail fetching

### `/picc/media/upload`
**Single file upload**
- Upload one file
- Add metadata
- Set permissions

### `/picc/media/upload-bulk`
**Bulk upload**
- Multiple file upload
- Batch tagging
- Progress tracking

### `/picc/media/collections`
**Organize into collections**
- Create collections
- Group related media
- Name and describe

### `/picc/media/smart-folders`
**Auto-organized folders**
- AI-suggested groupings
- Automatic categorization

### `/picc/media/smart-folders/[slug]`
**View specific smart folder**
- Contents of folder
- Edit grouping rules

---

## Innovation Projects

### `/picc/projects`
**All innovation projects**
- Photo Studio
- The Station
- Elders Cultural Trips
- On-Country Server
- Annual Report System

### `/picc/projects/new`
**Create new project**
- Project name and description
- Status (planning, in_progress, completed)
- Hero image
- Team members

### `/picc/projects/[slug]`
**Project details**
- Full project info
- Updates timeline
- Related stories
- Media gallery

### `/picc/projects/[slug]/edit`
**Edit project**
- Update details
- Change status
- Add hero image

### `/picc/projects/[slug]/story-builder`
**Build stories for project**
- Create project-related stories
- Link storytellers
- Add media

### `/picc/projects/[slug]/updates/new`
**Post project update**
- Add progress updates
- Milestone announcements
- Photos/videos

---

## Knowledge Base

### `/picc/knowledge`
**Knowledge base search**
- Search all entries
- Browse by category
- Quick access

### `/picc/knowledge/new`
**Add knowledge entry**
- Facts, statistics, history
- Source attribution
- Category assignment

### `/picc/knowledge/[slug]`
**View knowledge entry**
- Full entry content
- Related entries
- Source links

### `/picc/knowledge/sources`
**Research sources**
- Bibliography
- Document links
- Citation management

### `/picc/knowledge/timeline`
**Historical timeline**
- PICC history
- Palm Island history
- Milestone events

### `/picc/knowledge/financial`
**Financial data**
- Budget information
- Expenditure breakdown
- Funding sources

### `/picc/knowledge/annual-reports`
**Annual report archive**
- All historical reports
- PDF links
- Extracted data

---

## Annual Reports

### `/picc/annual-reports`
**Annual report management**
- Create/edit reports
- Link stories
- Set statistics

### `/picc/annual-reports/[id]/quotes`
**Manage report quotes**
- Extract quotes from stories
- Feature quotes in report
- Attribution management

---

## Analytics & Insights

### `/picc/analytics`
**Community analytics dashboard**

| Metric | Description |
|--------|-------------|
| Story Counts | Total, by category, by month |
| Storyteller Rankings | Top contributors |
| Category Breakdown | Distribution charts |
| Service Impact | Stories per service |
| Elder Stories | Traditional knowledge count |
| Recent Activity | Activity feed |

### `/picc/insights/patterns`
**Pattern analysis**
- Trending themes
- Common topics
- Sentiment analysis

### `/picc/insights/impact`
**Impact measurement**
- Community outcomes
- Service utilization
- Success metrics

### `/picc/insights/timeline`
**Historical timeline view**
- Activity over time
- Growth trends
- Milestone markers

---

## Content Creation Tools

### `/picc/content-studio`
**AI-powered social media content**

| Platform | Generated Content |
|----------|------------------|
| Instagram | Visual posts, captions, hashtags |
| Facebook | Shareable posts |
| LinkedIn | Professional updates |
| Twitter/X | Short-form content |

**Workflow:**
1. Select a story
2. Click "Generate"
3. AI creates platform-specific content
4. Edit if needed
5. Copy to clipboard

### `/picc/quote-cards`
**Generate quote graphics**
- Select quote from story
- Choose template
- Add attribution
- Download image

### `/picc/quotes`
**Quote management**
- Browse all quotes
- Extract from stories
- Categorize by theme

### `/picc/create`
**Content creation hub**
- Central creation point
- Links to all creation tools

### `/picc/conversations` | `/picc/conversations/new`
**Conversation/interview management**
- Record conversations
- Link to storytellers
- Convert to stories

---

## Reports & Export

### `/picc/reports`
**Report generation hub**
- Select report type
- Choose date range
- Generate and download

### `/picc/reports/[id]`
**View specific report**
- Full report content
- Download options

### `/picc/reports/demo`
**Demo/example report**
- Sample report format
- Template reference

### `/picc/report-generator`
**Advanced report builder**
- Custom report configuration
- Multiple export formats

**Export Formats:**
| Format | Use Case |
|--------|----------|
| PDF | Formal reports, funders |
| DOCX | Editable documents |
| CSV | Data analysis |
| XLSX | Spreadsheet data |

---

## Communications

### `/picc/newsletter`
**Newsletter builder**
- Create email newsletters
- Include story highlights
- Add images
- Preview and send

### `/picc/notifications`
**Notification management**
- System notifications
- User alerts
- Announcement settings

---

## Settings & Administration

### `/picc/settings`
**Platform configuration**

| Setting | Options |
|---------|---------|
| Public Submissions | Enable/disable |
| Approval Workflow | Required/optional |
| Anonymous Stories | Allow/disallow |
| Cultural Protocols | Enabled |
| Face Recognition Warning | On/off |
| Storage Limits | Configure |
| Backups | Schedule |

### `/picc/permissions`
**User permissions**
- Role assignment
- Access levels
- Feature restrictions

### `/picc/team`
**Team management**
- Staff profiles
- Role assignments
- Contact info

### `/picc/database`
**Direct database access**
- Advanced content management
- Raw data queries
- Bulk operations

---

## AI Tools

### `/picc/assistant`
**AI Chat Assistant**
- Natural language queries
- Search across all content
- Answer questions about PICC
- RAG-powered responses

**Example queries:**
- "How many stories do we have about health?"
- "What are our staff numbers for 2024?"
- "Find stories mentioning the storm"

### `/picc/scraper`
**Web scraping tool**
- Import external content
- Extract from websites
- Add to knowledge base

---

## Page Count Summary

| Category | Pages |
|----------|-------|
| Dashboard | 1 |
| Stories & Content | 8 |
| Storytellers | 8 |
| Media | 12 |
| Projects | 6 |
| Knowledge | 8 |
| Annual Reports | 2 |
| Analytics | 4 |
| Content Creation | 5 |
| Reports | 4 |
| Communications | 2 |
| Settings | 4 |
| AI Tools | 2 |
| **TOTAL** | **68** |

---

## Quick Access URLs

| Function | URL |
|----------|-----|
| Dashboard | `/picc/dashboard` |
| Review Stories | `/picc/submissions` |
| Add Storyteller | `/picc/storytellers/new` |
| Upload Media | `/picc/media/upload` |
| View Analytics | `/picc/analytics` |
| Generate Report | `/picc/reports` |
| Create Social Content | `/picc/content-studio` |
| AI Assistant | `/picc/assistant` |
| Settings | `/picc/settings` |

---

## Common Workflows

### Publishing a Story
1. `/picc/submissions` - Review submitted story
2. Edit content if needed
3. Add to category
4. Click "Publish"
5. Story appears on `/stories`

### Adding a New Storyteller
1. `/picc/storytellers/new` - Create profile
2. Fill in details
3. `/picc/storytellers/[id]/upload` - Add photo
4. Profile appears on `/storytellers`

### Creating Social Media Content
1. `/picc/content-studio` - Open studio
2. Select a published story
3. Click "Generate for Instagram"
4. Edit if needed
5. Copy and paste to Instagram

### Generating a Funder Report
1. `/picc/reports` - Open reports
2. Select "Impact Report"
3. Choose date range
4. Click "Generate PDF"
5. Download and send

---

*This represents the complete PICC administration system - 68 pages of functionality to manage community content, storytellers, media, and reporting.*
