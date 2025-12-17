# Storyteller & Story Management System Redesign

## Overview

Redesign the PICC admin storyteller gallery to be a comprehensive content management system with:
- **Tagging system** for storytellers and stories to control site placement
- **Bulk operations** for efficient management of large collections
- **Story editing system** with full CRUD capabilities
- **WordPress-like UX** with multiple views, filters, and inline editing

## Current State Analysis

### Existing Infrastructure
- `profiles` table stores storytellers with `storyteller_type`, `is_elder`, `show_in_directory` fields
- `stories` table has `tags[]`, `category`, `story_type`, `status`, `access_level`
- Media gallery already has excellent bulk selection/tagging patterns to reuse
- `themes` table exists for hierarchical categorization

### Key Gaps
- No bulk operations for storytellers
- Stories table has tags but no admin UI to manage them
- No way to tag storytellers for specific site sections
- Story editing is fragmented across multiple pages

---

## Implementation Plan

### Phase 1: Database Schema Updates

**1.1 Add site placement tags schema**

Create migration to add storyteller and story placement capabilities:

```sql
-- Add placement_tags to profiles for controlling where storytellers appear
ALTER TABLE profiles ADD COLUMN IF NOT EXISTS placement_tags text[] DEFAULT '{}';
-- e.g. ['homepage-featured', 'elders-page', 'about-team', 'annual-report-2024']

-- Ensure stories.tags exists (already does) but document standard tags:
-- Site placement: 'homepage', 'annual-report', 'featured'
-- FY tags: 'fy:2024-25', 'fy:2023-24'
-- Category: 'community', 'health', 'education', 'culture'

-- Add index for tag queries
CREATE INDEX IF NOT EXISTS idx_profiles_placement_tags ON profiles USING GIN (placement_tags);
CREATE INDEX IF NOT EXISTS idx_stories_tags ON stories USING GIN (tags);
```

**1.2 Define standard tag taxonomy**

Create `lib/taxonomy/placement-tags.ts`:
```typescript
export const STORYTELLER_PLACEMENT_TAGS = {
  site_sections: [
    { id: 'homepage-featured', label: 'Homepage Featured', description: 'Show on homepage hero section' },
    { id: 'elders-page', label: 'Elders Page', description: 'Show on public elders page' },
    { id: 'about-team', label: 'About/Team', description: 'Show on about page team section' },
    { id: 'wiki-featured', label: 'Wiki Featured', description: 'Featured on wiki pages' },
  ],
  annual_reports: [
    { id: 'ar:2024-25', label: 'Annual Report 2024-25' },
    { id: 'ar:2023-24', label: 'Annual Report 2023-24' },
  ],
  roles: [
    { id: 'role:board-member', label: 'Board Member' },
    { id: 'role:staff', label: 'Staff' },
    { id: 'role:volunteer', label: 'Volunteer' },
  ]
};

export const STORY_PLACEMENT_TAGS = {
  site_sections: [
    { id: 'homepage', label: 'Homepage' },
    { id: 'featured', label: 'Featured Stories' },
    { id: 'annual-report', label: 'Annual Report' },
  ],
  categories: [
    { id: 'community', label: 'Community' },
    { id: 'health', label: 'Health & Wellbeing' },
    { id: 'education', label: 'Education' },
    { id: 'culture', label: 'Culture & Heritage' },
    { id: 'environment', label: 'Environment' },
  ],
  fiscal_years: generateFiscalYears(5), // Last 5 FYs
};
```

---

### Phase 2: Enhanced Storyteller Management Page

**2.1 Rewrite `/app/picc/storytellers/page.tsx`**

Key features (following media gallery patterns):

**Selection System:**
- Checkbox column for multi-select
- "Select All" header checkbox
- Selection counter in toolbar
- Shift-click for range selection

**Bulk Actions Toolbar (appears when items selected):**
- "Add Tags" - Opens modal with tag picker
- "Remove Tags" - Remove specific tags from selection
- "Set Type" - Bulk change storyteller_type
- "Toggle Elder" - Bulk set/unset is_elder
- "Toggle Directory" - Bulk show/hide from public pages
- "Export CSV" - Export selected to spreadsheet

**View Modes:**
- Table view (default) - Sortable columns
- Grid view - Card layout with photos
- Compact view - Dense list for quick scanning

**Filters:**
- Search (name, bio)
- Type dropdown (elder, community_member, staff, etc.)
- Placement tags multi-select
- Has stories (yes/no/any)
- Has photos (yes/no/any)
- Date range (joined)

**Sorting:**
- Name (A-Z, Z-A)
- Stories contributed
- Date added
- Last updated

**Table Columns:**
```
[checkbox] | Photo | Name | Type | Tags | Stories | Interviews | Actions
```

**2.2 Create Bulk Tag Modal Component**

`components/admin/BulkTagModal.tsx`:
- Tabs for different tag categories (Site Sections, Annual Reports, Roles)
- Checkbox list with current tag counts
- "Add to selected" / "Remove from selected" toggle
- Preview of affected items
- Apply button with confirmation

**2.3 Create API endpoints**

`/api/storytellers/bulk` (POST):
```typescript
{
  profileIds: string[],
  action: 'add_tags' | 'remove_tags' | 'set_type' | 'set_elder' | 'set_directory',
  tags?: string[],
  type?: string,
  value?: boolean
}
```

---

### Phase 3: Story Management System

**3.1 Create `/app/picc/stories/page.tsx` - Story Library**

WordPress-like story management:

**Layout:**
- Left sidebar with filters/saved searches
- Main content area with story list
- Quick preview panel (optional right sidebar)

**Views:**
- All Stories
- Published
- Drafts
- Pending Review
- My Stories
- Archived/Trash

**Bulk Actions:**
- Add tags
- Change status (draft/published/archived)
- Change access level (public/community/restricted)
- Assign to storyteller
- Delete (soft delete)
- Feature/unfeature

**Filters:**
- Status dropdown
- Category dropdown
- Story type dropdown
- Storyteller picker
- Tags multi-select
- Date range
- Has media (yes/no)
- Access level

**Table Columns:**
```
[checkbox] | Title | Storyteller | Category | Status | Tags | Date | Actions
```

**Quick Actions per row:**
- Edit
- Preview
- Duplicate
- Delete

**3.2 Create `/app/picc/stories/[id]/edit/page.tsx` - Story Editor**

Full-featured story editor:

**Left Panel - Content:**
- Title field
- Rich text editor (content)
- Excerpt/summary field

**Right Panel - Settings:**
- Status (draft/published/archived)
- Access level
- Category picker
- Story type picker
- Tags (add/remove with autocomplete)
- Featured image picker
- Media gallery (add photos/videos)

**Bottom Panel - Metadata:**
- Storyteller picker (searchable dropdown)
- Story date
- Location
- Cultural sensitivity settings
- Elder approval checkbox

**Media Section:**
- Drag-drop image upload
- Gallery grid of attached media
- Reorder with drag-drop
- Remove individual items
- Set featured image

**3.3 API Endpoints**

`/api/stories/bulk` (POST):
```typescript
{
  storyIds: string[],
  action: 'add_tags' | 'remove_tags' | 'set_status' | 'set_category' | 'delete',
  tags?: string[],
  status?: string,
  category?: string
}
```

`/api/stories/[id]` (PUT):
- Full story update endpoint

`/api/stories/[id]/media` (POST/DELETE):
- Manage story media attachments

---

### Phase 4: Shared Components

**4.1 `components/admin/SelectableTable.tsx`**
Reusable table component with:
- Row selection (checkboxes)
- Sortable columns
- Pagination
- Loading states
- Empty states
- Custom cell renderers

**4.2 `components/admin/TagPicker.tsx`**
Tag management component:
- Multi-select with checkboxes
- Search/filter
- Grouped by category
- "Create new tag" option
- Shows tag usage count

**4.3 `components/admin/BulkActionsBar.tsx`**
Sticky toolbar when items selected:
- Selection count
- Available actions (contextual)
- Clear selection button

**4.4 `components/admin/QuickFilters.tsx`**
Filter bar component:
- Collapsible filter sections
- Saved filter presets
- Clear all filters
- Filter count badge

---

### Phase 5: Navigation Updates

**5.1 Update PICC Navigation**

Add new menu items:
```
Content
  - Storytellers (enhanced)
  - Stories (new)
  - Media Gallery (existing)
  - Collections (existing)
```

**5.2 Quick Actions Dashboard**

Add to `/app/picc/dashboard`:
- Recent storytellers widget
- Stories needing review widget
- Quick stats (total stories, published, drafts)
- Recent activity feed

---

## File Structure

```
app/picc/
  storytellers/
    page.tsx (redesigned)
    [id]/
      page.tsx (profile view)
      edit/page.tsx (existing)
    new/page.tsx (existing)
  stories/
    page.tsx (new - story library)
    [id]/
      page.tsx (story preview)
      edit/page.tsx (new - story editor)
    new/page.tsx (new - create story)

components/admin/
  SelectableTable.tsx
  BulkActionsBar.tsx
  TagPicker.tsx
  QuickFilters.tsx
  BulkTagModal.tsx
  StoryEditor.tsx

lib/taxonomy/
  placement-tags.ts
  story-categories.ts

app/api/
  storytellers/
    bulk/route.ts
  stories/
    bulk/route.ts
    [id]/
      route.ts
      media/route.ts
```

---

## Implementation Order

1. **Database migration** - Add placement_tags column, indexes
2. **Taxonomy definitions** - Create tag constants and types
3. **API endpoints** - Bulk operations for storytellers and stories
4. **Shared components** - SelectableTable, TagPicker, BulkActionsBar
5. **Storyteller page redesign** - Full rewrite with bulk operations
6. **Story library page** - New page with WordPress-like list management
7. **Story editor page** - Full CRUD story editor
8. **Navigation updates** - Add new menu items
9. **Testing & refinement** - E2E testing of bulk operations

---

## Key UX Patterns (WordPress-inspired)

1. **Persistent selection** - Selection persists across pagination/filtering
2. **Inline editing** - Quick edit fields without leaving list view
3. **Bulk actions confirmation** - Preview affected items before applying
4. **Undo support** - Toast notifications with undo for destructive actions
5. **Keyboard shortcuts** - Select all (Ctrl+A), Delete (Del), etc.
6. **Saved searches** - Save frequently used filter combinations
7. **Column customization** - Show/hide columns per user preference

---

## Mockup: Storyteller Management Page

```
+------------------------------------------------------------------+
| Storyteller Management                        [+ Add Storyteller] |
+------------------------------------------------------------------+
| [Search...] | Type: [All v] | Tags: [Select v] | View: [=] [#]   |
+------------------------------------------------------------------+
| 3 selected                    [Add Tags] [Set Type] [Delete]      |
+------------------------------------------------------------------+
| [x] | Photo | Name           | Type     | Tags        | Stories  |
+------------------------------------------------------------------+
| [x] | [img] | Aunty Mary     | Elder    | homepage,   | 12       |
|     |       |                |          | ar:2024-25  |          |
+------------------------------------------------------------------+
| [x] | [img] | Uncle Bob      | Elder    | elders-page | 8        |
+------------------------------------------------------------------+
| [ ] | [img] | Sarah Johnson  | Staff    | about-team  | 3        |
+------------------------------------------------------------------+
| [ ] | [img] | Tom Williams   | Community| -           | 5        |
+------------------------------------------------------------------+
|                          [Load More]                              |
+------------------------------------------------------------------+
```

---

## Mockup: Story Library Page

```
+------------------------------------------------------------------+
| Stories                                           [+ New Story]   |
+------------------------------------------------------------------+
| All (45) | Published (32) | Drafts (8) | Pending (5) | Trash (0) |
+------------------------------------------------------------------+
| [Search stories...]                                               |
+------------------------------------------------------------------+
| Category: [All v] | Storyteller: [All v] | Tags: [Select v]      |
+------------------------------------------------------------------+
| 2 selected                        [Publish] [Add Tags] [Delete]   |
+------------------------------------------------------------------+
| [x] | Title                | Storyteller  | Status    | Date     |
+------------------------------------------------------------------+
| [x] | The Storm Recovery   | Aunty Mary   | Published | Dec 10   |
|     | Story                |              |           |          |
+------------------------------------------------------------------+
| [ ] | Healing Through      | Uncle Bob    | Draft     | Dec 8    |
|     | Culture              |              |           |          |
+------------------------------------------------------------------+
| [ ] | Youth Leadership     | Sarah J.     | Pending   | Dec 5    |
|     | Program              |              |           |          |
+------------------------------------------------------------------+
```

---

## Mockup: Story Editor Page

```
+------------------------------------------------------------------+
| < Back to Stories           [Preview] [Save Draft] [Publish]      |
+------------------------------------------------------------------+
| +------------------------+  +----------------------------------+  |
| | CONTENT                |  | SETTINGS                         |  |
| |                        |  |                                  |  |
| | Title                  |  | Status: [Draft v]                |  |
| | [The Storm Recovery]   |  | Access: [Public v]               |  |
| |                        |  |                                  |  |
| | Content                |  | Category: [Community v]          |  |
| | [Rich text editor...]  |  | Type: [community_story v]        |  |
| |                        |  |                                  |  |
| |                        |  | Tags:                            |  |
| |                        |  | [x] homepage                     |  |
| |                        |  | [x] featured                     |  |
| |                        |  | [ ] annual-report                |  |
| |                        |  |                                  |  |
| |                        |  | Featured Image:                  |  |
| |                        |  | [img] [Change]                   |  |
| +------------------------+  +----------------------------------+  |
|                                                                   |
| +---------------------------------------------------------------+ |
| | MEDIA GALLERY                                  [+ Add Media]  | |
| | [img1] [img2] [img3] [video1]                                 | |
| +---------------------------------------------------------------+ |
|                                                                   |
| +---------------------------------------------------------------+ |
| | METADATA                                                      | |
| | Storyteller: [Aunty Mary v]  | Date: [2024-12-10]            | |
| | Location: [Palm Island]      | Elder Approval: [x]           | |
| +---------------------------------------------------------------+ |
+------------------------------------------------------------------+
```
