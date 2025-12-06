# Quick Guide: Story Review & Thematic Analysis

## ✅ What's Working Now

### 1. Story Submission & Collection
- ✅ Public form at `/share-voice` - anyone can submit anonymously
- ✅ Staff form at `/stories/new` or `/picc/create` - full story creation
- ✅ Community Voice system - 6 standard profiles for anonymous/group stories
- ✅ Individual storyteller profiles - for named contributors with consent

### 2. Review & Approval
- ✅ View all community stories at `/picc/community-voice`
- ✅ Filter by status: pending_review, draft, published, archived
- ✅ Search by title/content
- ✅ Approve/publish stories with one click
- ✅ Move between statuses easily

### 3. Current Workflow

```
Community Member → /share-voice → Story (status: submitted)
                                         ↓
                        PICC Staff Reviews at /picc/community-voice
                                         ↓
                            Review for appropriateness
                                         ↓
                        Approve → (status: published) → Live on site
                        or
                        Draft → (status: draft) → Needs work
                        or
                        Archive → (status: archived) → Hidden
```

## 🎯 Understanding the Approval Process

### Current Status Options

**submitted** - New story from public form
- Action: Review and decide

**pending_review** - Story ready for approval
- Actions: Approve → published OR Send to draft

**draft** - Story needs work or waiting
- Actions: Publish when ready

**published** - Live on public website
- Actions: Archive if needed

**archived** - Removed from public view
- Kept in database for records

### Where to Review

**Option 1: Community Voice Page** (`/picc/community-voice`)
- Shows ONLY Community Voice & Group stories
- Filters by the 6 special community profiles
- Best for: Anonymous submissions, group discussions

**Option 2: Submissions Page** (`/picc/submissions`)
- Shows ALL pending stories (currently basic)
- Best for: All story types needing review

## 🔒 Privacy & De-identification Strategy

### The Key Concept

**You can use stories in two ways:**

1. **Individual Story Publication** (needs consent/caution)
   - Full story with attribution
   - Requires consent if identifiable
   - Use "Community Voice" for anonymous

2. **Thematic Summary** (always safe)
   - Multiple stories → One theme
   - Remove ALL personal details
   - No individual attribution
   - Perfect for reports

### Example: Thematic Approach

**12 Individual Stories About Storm Recovery**
↓ Extract themes, remove details ↓

**Thematic Summary:**
```
Community Resilience During Storm Recovery
- 12 stories collected
- Common theme: Family & community support
- Key insight: Traditional knowledge helped recovery
- Representative quote: "We came together like family"
- NO names, NO specific incidents, NO identifying details
```

### What to Remove for Themes

❌ Remove:
- Names (Uncle Frank → "An Elder")
- Dates (March 15 → "During the storm")
- Addresses (12 Beach St → "In the community")
- Unique events (Only house with blue roof → omit)
- Photos (unless consent for public use)

✅ Keep:
- Emotions ("felt scared", "proud of community")
- General themes ("family support", "resilience")
- Non-identifying quotes
- Overall outcomes
- Cultural practices (if appropriate)

## 📊 Thematic Analysis System (Proposed)

### Database Structure Needed

You already have these fields in stories:
- ✅ `category` - community, cultural, health, etc.
- ✅ `tags` - Array of keywords
- ✅ `story_type` - Type of story
- ✅ `report_section` - Which section of annual report
- ✅ `quality_score` - 0-100 rating
- ✅ `report_worthy` - Boolean flag
- ✅ `access_level` - public, community, restricted, private

### Using These for Themes

**Step 1: Tag stories as they come in**
```
Story: "Storm Recovery Experience"
↓
Tags: ["storm recovery", "community support", "resilience"]
Category: "community"
Report Section: "community_resilience"
Quality Score: 85
Report Worthy: true
Access Level: public
```

**Step 2: Query by theme**
```sql
-- Get all storm recovery stories
SELECT * FROM stories
WHERE 'storm recovery' = ANY(tags)
AND report_worthy = true;
```

**Step 3: Generate summary**
- Count stories
- Extract common themes
- Create de-identified narrative
- No personal details

## 🛠️ How to Use the System Today

### For Anonymous Submissions

1. Direct people to: **`/share-voice`**
2. They submit anonymously
3. Story auto-assigned to "Community Voice"
4. Status: `submitted`
5. You review at: **`/picc/community-voice`**
6. Approve → `published` (appears on public site)

### For Group Discussions

1. Hold a community meeting (Council of Elders, Youth Group, etc.)
2. Go to: **`/stories/new`**
3. Select storyteller: "Council of Elders" (or other group)
4. Write summary of discussion
5. Set status: `pending_review` or `published`
6. Story attributed to the group

### For Individual Stories

1. Get consent from person
2. Create profile at: **`/picc/storytellers/new`**
3. Create story at: **`/stories/new`**
4. Select their profile from dropdown
5. Set appropriate access level
6. Publish when approved

## 📈 Metrics You Can Track Now

### Simple Queries

**Count by status:**
```sql
SELECT status, COUNT(*)
FROM stories
GROUP BY status;
```

**Count by category:**
```sql
SELECT category, COUNT(*)
FROM stories
WHERE status = 'published'
GROUP BY category;
```

**Stories by community voice type:**
```sql
SELECT
  profiles.full_name,
  COUNT(stories.id) as story_count
FROM stories
JOIN profiles ON stories.storyteller_id = profiles.id
WHERE profiles.id LIKE 'c0000000-%'
GROUP BY profiles.full_name;
```

## 🎨 Thematic Analysis Component

I created: **`components/story-review/ThematicAnalysisPanel.tsx`**

**Features:**
- Privacy warning detector (names, dates, addresses)
- Theme assignment (10 common themes)
- Custom tag input
- Access level selector
- Quality score slider
- Report-worthy flag
- De-identified summary field

**To use:** Add to your story review pages
```tsx
import ThematicAnalysisPanel from '@/components/story-review/ThematicAnalysisPanel';

<ThematicAnalysisPanel
  story={currentStory}
  onUpdate={(updates) => updateStory(currentStory.id, updates)}
/>
```

## 🚀 Next Steps to Implement

### Immediate (Can do today)

1. **Start tagging existing stories**
   - Open each story
   - Add relevant tags manually
   - Set report_worthy flag
   - Assign report_section

2. **Test the workflow**
   - Submit test story via `/share-voice`
   - Review at `/picc/community-voice`
   - Approve and publish
   - Check it appears on public site

3. **Document your themes**
   - List the themes you care about
   - What topics come up repeatedly?
   - What matters for annual report?

### Short-term (This week)

1. **Add ThematicAnalysisPanel to review pages**
   - Update `/picc/community-voice/page.tsx`
   - Add panel when viewing/editing story
   - Test the privacy warnings

2. **Create theme tracking spreadsheet**
   - Column: Theme name
   - Column: Story count
   - Column: Key insights
   - Column: Representative quotes (de-identified)

### Medium-term (Next few weeks)

1. **Build thematic summary page**
   - New page: `/picc/themes`
   - Show all themes
   - Count stories per theme
   - Generate aggregated summaries

2. **Create export function**
   - Export thematic summaries
   - For annual report
   - No personal details included

## 💡 Key Insights

### Why This Approach Works

1. **Protects Privacy**
   - Stories stay anonymous via "Community Voice"
   - Thematic summaries remove identifying details
   - Access levels control who sees what

2. **Builds Trust**
   - Community knows their voice is heard
   - Stories collected respectfully
   - No surprise publications

3. **Creates Impact**
   - Show patterns across multiple stories
   - Demonstrate community themes
   - Evidence for funding/advocacy
   - WITHOUT exposing individuals

4. **Sustainable**
   - Simple workflow
   - Staff can manage
   - Scales with volume
   - Flexible for different uses

### Common Questions

**Q: Can we publish individual anonymous stories?**
A: Yes! Stories from "Community Voice" can be published anonymously. No personal details attached.

**Q: What if someone shares a sensitive personal story?**
A: Set `access_level: restricted` and `report_worthy: false`. Use only for internal understanding, NOT for publication or reports.

**Q: Can we quote from stories in reports?**
A: Yes, if:
- De-identified (no names/details)
- Part of thematic summary
- General enough not to identify anyone

**Q: How do we handle Elder stories with cultural knowledge?**
A: Get explicit consent. Use their name if they want attribution. Set appropriate access level. Consider if suitable for public reports.

**Q: What about photos/videos?**
A: Need separate consent. Different form. Link to story record but don't auto-publish.

## 📝 Example Thematic Report

```markdown
# Quarterly Community Voice Summary
## Q2 2025 - Storm Recovery Theme

### Overview
During Q2 2025, we collected 12 stories from community members about
their experiences with storm recovery. These stories highlight the
strength and resilience of the Palm Island community.

### Key Themes

**1. Community Support Networks (10/12 stories)**
Community members consistently emphasized the importance of looking
after each other. Families and neighbors came together to help those
most affected.

> "We lost a lot, but we had each other. That's what got us through."

**2. Traditional Knowledge (7/12 stories)**
Elders' knowledge about reading weather signs and community preparation
proved valuable during and after the storm.

> "The old ways of looking after country helped us know what to do."

**3. Intergenerational Cooperation (9/12 stories)**
Young people stepped up to help Elders and vulnerable community members,
demonstrating strong cultural values.

> "Young ones helped the old people first. That's how we do things."

### Impact & Insights
- Strong sense of community identity
- Cultural practices remained relevant during crisis
- Need for better preparation resources
- Desire for youth engagement programs

### Next Steps
- Continue collecting recovery stories
- Develop community resilience programs
- Document traditional knowledge for future generations

---
*Based on 12 anonymous community contributions collected through
Community Voice platform. All identifying details removed to protect
privacy while preserving community insights.*
```

## ✅ Current System Status

- ✅ API routes working (GET, POST, PATCH, DELETE)
- ✅ Community Voice profiles created
- ✅ Public submission form working
- ✅ Review interface functional
- ✅ Status workflow in place
- ✅ Privacy levels available
- ✅ Thematic fields in database
- ⏳ Thematic analysis UI (component created, needs integration)
- ⏳ Automated summary generation (planned)
- ⏳ Theme management page (planned)

**You have a working foundation. Now you can start using it and refine as you go!**
