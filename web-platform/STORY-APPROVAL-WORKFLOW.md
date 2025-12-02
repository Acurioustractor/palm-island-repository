# Story Approval & Thematic Analysis Workflow

## Current Story Status Flow

### 1. Story Statuses

Stories move through these states:

```
┌──────────────┐
│  submitted   │  ← Public submission via /share-voice
└──────┬───────┘
       │
       ▼
┌──────────────┐
│    draft     │  ← Staff creates story via /stories/new or /picc/create
└──────┬───────┘
       │
       ▼
┌──────────────┐
│pending_review│  ← Ready for approval (can set on create)
└──────┬───────┘
       │
       ▼
┌──────────────┐
│  published   │  ← Approved and live on public site
└──────┬───────┘
       │
       ▼
┌──────────────┐
│   archived   │  ← Removed from public view but kept in database
└──────────────┘
```

### 2. Current Approval Interface

**Location:** `/picc/community-voice`

**What it does:**
- Shows all stories from Community Voices and Groups
- Filter by status (all, pending_review, draft, published, archived)
- Search by title/content

**Available Actions:**
- **Pending Review** → Can approve (publish) or move to draft
- **Published** → Can archive
- **Draft** → Can publish

## Privacy & Anonymization Strategy

### Current Privacy Levels

Stories have an `access_level` field:
- `public` - Visible to everyone
- `community` - Only community members (requires login)
- `restricted` - Only PICC staff
- `private` - Specific permissions required

### Personal Information to Strip

When creating thematic summaries, remove:
1. **Names** - People, family members, specific individuals
2. **Locations** - Specific addresses, house numbers
3. **Dates** - Exact dates (keep year/season if relevant)
4. **Identifying Details** - Unique events, rare characteristics
5. **Photos** - Unless consent given for thematic use

### What to Keep for Themes

Preserve:
1. **Emotions** - How people felt
2. **Topics** - What the story is about
3. **Outcomes** - What happened (de-identified)
4. **Quotes** - General quotes without attribution
5. **Themes** - Cultural practices, community values, shared experiences

## Thematic Analysis Framework

### Step 1: Story Collection & Tagging

**Fields to use:**
- `category` - community, cultural, health, education, etc.
- `tags` - Array of keywords
- `story_type` - elder_story, youth_story, community_story, etc.
- `report_section` - For annual reports (community_resilience, cultural_preservation, etc.)
- `quality_score` - 0-100 rating
- `report_worthy` - Boolean flag

**Example:**
```json
{
  "title": "Storm Recovery Experience",
  "category": "community",
  "tags": ["storm recovery", "community support", "resilience"],
  "story_type": "community_story",
  "report_section": "community_resilience",
  "quality_score": 85,
  "report_worthy": true
}
```

### Step 2: Thematic Grouping

**Create theme categories:**

```sql
-- Example themes table structure
CREATE TABLE story_themes (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  theme_name TEXT NOT NULL,
  theme_category TEXT,
  description TEXT,
  color TEXT,
  created_at TIMESTAMP DEFAULT NOW()
);

CREATE TABLE story_theme_assignments (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  story_id UUID REFERENCES stories(id),
  theme_id UUID REFERENCES story_themes(id),
  relevance_score INTEGER, -- 0-100
  notes TEXT,
  created_at TIMESTAMP DEFAULT NOW()
);
```

**Common Themes:**
- Community Resilience
- Cultural Preservation
- Intergenerational Knowledge
- Environmental Connection
- Health & Wellbeing
- Education & Youth
- Leadership & Governance
- Economic Development

### Step 3: Anonymized Summary Generation

**Process:**
1. Collect all stories with same theme
2. Extract common patterns, quotes, sentiments
3. Remove identifying information
4. Create aggregate summary

**Example Summary Structure:**
```markdown
## Theme: Community Resilience During Storm Recovery

**Stories Collected:** 12
**Time Period:** 2024-2025
**Community Voices:** Anonymous community members, Council of Elders, Youth Voices

### Key Themes
- Strong family and community support networks
- Elders providing guidance and traditional knowledge
- Young people stepping up to help
- Community coming together despite challenges

### Representative Quotes (De-identified)
> "We lost everything, but we had each other. That's what matters."

> "The old ways of looking after each other - that's what got us through."

> "Young ones helping Elders first - that's how we do things here."

### Impact Metrics
- 12 unique stories
- 85% mentioned community support
- 60% referenced traditional knowledge
- 75% highlighted intergenerational cooperation

### Sentiment Analysis
- Overall: Positive (70%)
- Themes: Resilience, Hope, Community Strength
- Challenges: Loss, Trauma, Recovery needs
```

## Proposed Workflow Enhancement

### Phase 1: Intake & Initial Review

1. **Story Submitted** (`status: submitted`)
   - Via public form `/share-voice`
   - Auto-assigned to "Community Voice" if anonymous
   - Notification sent to PICC staff

2. **Initial Screening** (`status: pending_review`)
   - Staff reviews for:
     - Appropriateness
     - Cultural sensitivity
     - Privacy concerns
     - Quality/clarity
   - Add initial tags and categorization

### Phase 2: Thematic Coding

3. **Theme Assignment**
   - Assign to one or more themes
   - Add relevance score (0-100)
   - Extract key quotes (if appropriate)
   - Mark `report_worthy` if suitable for annual report

4. **Privacy Review**
   - Identify any personal information
   - Create de-identified version for thematic use
   - Set appropriate `access_level`

### Phase 3: Publication Decision

5. **Publish Individual Story** (Optional)
   - `status: published`
   - Full story visible with attribution
   - Requires consent for named storytellers
   - Anonymous stories can be published as "Community Voice"

6. **Include in Thematic Summary** (Always possible)
   - Add to theme collection
   - Use de-identified content only
   - Contribute to aggregate metrics
   - No individual attribution needed

### Phase 4: Reporting & Analysis

7. **Generate Thematic Reports**
   - Quarterly summaries by theme
   - Annual report sections
   - Community presentations
   - No personal details included

## Implementation Plan

### A. Create Thematic Analysis Page

**Location:** `/picc/themes` or `/picc/analytics/themes`

**Features:**
- List all defined themes
- Show story count per theme
- View aggregated summaries
- Generate reports
- Export de-identified data

### B. Enhanced Story Review Interface

**Update:** `/picc/community-voice` and `/picc/submissions`

**Add:**
- [ ] Theme assignment dropdown
- [ ] Privacy review checklist
- [ ] De-identification tools
- [ ] Report-worthy flag toggle
- [ ] Quality score slider
- [ ] Quick quote extraction

### C. Create Theme Management

**New page:** `/picc/themes/manage`

**Features:**
- Create/edit themes
- Set theme categories
- Define colors/icons
- View assigned stories
- Generate summaries

### D. Automated De-identification Tools

**Helper Functions:**
```typescript
// Remove names
function stripNames(text: string): string {
  // Replace names with [Name], [Family Member], etc.
}

// Remove dates
function generalizedDates(text: string): string {
  // Replace specific dates with seasons/years
}

// Extract themes
function extractThemes(text: string): string[] {
  // AI-powered theme extraction
}

// Generate summary
function generateThematicSummary(stories: Story[]): Summary {
  // Aggregate de-identified content
}
```

## Privacy Best Practices

### ✅ DO:
- Always ask for consent when using identifiable stories
- Use "Community Voice" for sensitive topics
- Create thematic summaries from multiple stories
- Remove all personal identifiers from aggregated data
- Set appropriate access levels
- Mark stories as `report_worthy` only if suitable for public reports

### ❌ DON'T:
- Publish individual sensitive stories without consent
- Include identifying details in thematic summaries
- Use unique/rare experiences that could identify someone
- Share draft/pending stories publicly
- Mix consented and non-consented content

## Metrics to Track

### Story Metrics
- Total submissions per month
- Stories by status
- Stories by category
- Average quality score
- Report-worthy percentage

### Theme Metrics
- Most common themes
- Stories per theme
- Sentiment by theme
- Theme trends over time

### Community Voice Metrics
- Anonymous vs. named submissions
- Group vs. individual contributions
- Review time (submitted → published)
- Community engagement

## Next Steps

1. **Immediate:**
   - [ ] Review current stories for themes
   - [ ] Manually tag existing stories
   - [ ] Test approval workflow

2. **Short-term (1-2 weeks):**
   - [ ] Create theme management interface
   - [ ] Build thematic summary generator
   - [ ] Add de-identification helpers

3. **Medium-term (1-2 months):**
   - [ ] AI-powered theme extraction
   - [ ] Automated privacy scanning
   - [ ] Quarterly thematic reports
   - [ ] Community feedback integration

4. **Long-term (3-6 months):**
   - [ ] Interactive theme explorer
   - [ ] Sentiment analysis
   - [ ] Trend visualization
   - [ ] Impact measurement dashboard
