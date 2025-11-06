# Enhanced Storyteller Profiles - Implementation Plan

## Overview
Transform storyteller profiles from basic info pages to rich, engaging multimedia experiences.

---

## Phase 1: Enhanced Profile Features

### 1.1 Photo Gallery
**Goal:** Display all photos associated with a storyteller

**Features:**
- Grid layout of all storyteller photos
- Lightbox viewer for full-size images
- Photo captions and dates
- Upload multiple photos at once
- Photo categories (portrait, events, family, etc.)

**Technical:**
- New table: `storyteller_photos`
- Supabase Storage bucket: `storyteller-photos`
- React component: `PhotoGallery.tsx`
- Lightbox library: react-image-lightbox or similar

**Schema:**
```sql
CREATE TABLE storyteller_photos (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  storyteller_id UUID REFERENCES profiles(id) ON DELETE CASCADE,
  file_path TEXT NOT NULL,
  supabase_bucket TEXT DEFAULT 'storyteller-photos',
  caption TEXT,
  photo_type TEXT, -- 'portrait', 'event', 'family', 'historical'
  taken_date DATE,
  uploaded_by UUID REFERENCES profiles(id),
  is_primary BOOLEAN DEFAULT false,
  display_order INTEGER,
  created_at TIMESTAMP DEFAULT NOW()
);

CREATE INDEX idx_storyteller_photos_storyteller ON storyteller_photos(storyteller_id);
```

---

### 1.2 Story Timeline View
**Goal:** Chronological view of all storyteller's stories

**Features:**
- Timeline visualization with dates
- Story cards with thumbnails
- Filter by category/theme
- Sort by date (newest/oldest)
- Total reading time estimate
- Story count by category breakdown

**UI Design:**
```
Timeline View:
  ├── 2024
  │   ├── March - "Cyclone Story" (5 min read)
  │   └── January - "Elder Wisdom" (8 min read)
  └── 2023
      ├── December - "Community Gathering" (3 min read)
      └── June - "Fishing Traditions" (10 min read)
```

---

### 1.3 Profile Statistics
**Goal:** Show storyteller's contribution metrics

**Stats to Display:**
- Total stories shared
- Total words contributed
- First story date
- Most recent story date
- Most common themes
- Total views (future)
- Average reading time
- Stories by category (pie chart)

**UI Component:**
```typescript
interface ProfileStats {
  totalStories: number;
  totalWords: number;
  firstStoryDate: string;
  lastStoryDate: string;
  topThemes: string[];
  categoryBreakdown: { category: string; count: number }[];
  averageReadingTime: number;
}
```

---

### 1.4 Share Profile Functionality
**Goal:** Easy sharing of storyteller profiles

**Features:**
- Copy profile link
- Generate QR code for profile
- Social media share buttons (Facebook, Twitter)
- Print-friendly view
- Download profile as PDF (future)

**Implementation:**
- Share button with dropdown menu
- QR code generation: `qrcode.react` library
- Print CSS: `@media print` styles
- Copy to clipboard: Browser API

---

### 1.5 Elder Badge & Honors
**Goal:** Highlight elders and honored community members

**Features:**
- Prominent elder badge
- Honorific titles (Uncle, Aunty, etc.)
- Community roles display
- Years of service badge
- Special recognition section

---

### 1.6 Related Storytellers
**Goal:** Connect storytellers by relationships

**Features:**
- Family connections
- Mentorship relationships
- Collaborative stories
- "You might also like" suggestions

---

## Database Schema Updates

### New Tables:

```sql
-- Photo gallery
CREATE TABLE storyteller_photos (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  storyteller_id UUID REFERENCES profiles(id) ON DELETE CASCADE,
  file_path TEXT NOT NULL,
  supabase_bucket TEXT DEFAULT 'storyteller-photos',
  caption TEXT,
  photo_type TEXT,
  taken_date DATE,
  uploaded_by UUID REFERENCES profiles(id),
  is_primary BOOLEAN DEFAULT false,
  display_order INTEGER,
  created_at TIMESTAMP DEFAULT NOW()
);

-- Storyteller relationships
CREATE TABLE storyteller_relationships (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  storyteller_a_id UUID REFERENCES profiles(id),
  storyteller_b_id UUID REFERENCES profiles(id),
  relationship_type TEXT, -- 'family', 'mentor', 'colleague', 'collaborator'
  relationship_description TEXT,
  created_at TIMESTAMP DEFAULT NOW(),
  CONSTRAINT unique_relationship UNIQUE(storyteller_a_id, storyteller_b_id, relationship_type)
);

-- Profile statistics cache (for performance)
CREATE TABLE storyteller_stats (
  storyteller_id UUID PRIMARY KEY REFERENCES profiles(id),
  total_stories INTEGER DEFAULT 0,
  total_words INTEGER DEFAULT 0,
  first_story_date TIMESTAMP,
  last_story_date TIMESTAMP,
  top_themes TEXT[],
  category_breakdown JSONB,
  last_updated TIMESTAMP DEFAULT NOW()
);

-- Create function to update stats
CREATE OR REPLACE FUNCTION update_storyteller_stats(p_storyteller_id UUID)
RETURNS VOID AS $$
BEGIN
  INSERT INTO storyteller_stats (
    storyteller_id,
    total_stories,
    total_words,
    first_story_date,
    last_story_date,
    last_updated
  )
  SELECT
    p_storyteller_id,
    COUNT(*),
    SUM(LENGTH(content)),
    MIN(created_at),
    MAX(created_at),
    NOW()
  FROM stories
  WHERE storyteller_id = p_storyteller_id
  ON CONFLICT (storyteller_id)
  DO UPDATE SET
    total_stories = EXCLUDED.total_stories,
    total_words = EXCLUDED.total_words,
    first_story_date = EXCLUDED.first_story_date,
    last_story_date = EXCLUDED.last_story_date,
    last_updated = NOW();
END;
$$ LANGUAGE plpgsql;
```

---

## Component Structure

### New Components to Create:

```
components/
├── profile/
│   ├── PhotoGallery.tsx          # Photo grid with lightbox
│   ├── StoryTimeline.tsx         # Chronological story view
│   ├── ProfileStats.tsx          # Statistics dashboard
│   ├── ShareProfile.tsx          # Share functionality
│   ├── ElderBadge.tsx            # Elder/honor badges
│   ├── RelatedStorytellers.tsx   # Connections
│   └── ProfileHeader.tsx         # Enhanced header
```

---

## UI Mockup - Enhanced Profile

```
╔═══════════════════════════════════════════════════╗
║  ← Back to Storytellers                            ║
║                                                    ║
║  [LARGE PORTRAIT PHOTO]        📊 Statistics      ║
║                                • 12 Stories        ║
║  Uncle Frank Daniel Landers   • 8,450 words       ║
║  [Elder Badge] [Share Button]  • Member since 2023║
║                                                    ║
║  📍 Palm Island                                    ║
║  "Keeper of Fishing Knowledge"                    ║
║                                                    ║
╠═══════════════════════════════════════════════════╣
║  [Photos Tab] [Stories Tab] [About Tab]           ║
╠═══════════════════════════════════════════════════╣
║                                                    ║
║  📸 Photo Gallery (24 photos)                     ║
║  ┌──────┬──────┬──────┬──────┐                   ║
║  │ img  │ img  │ img  │ img  │                   ║
║  ├──────┼──────┼──────┼──────┤                   ║
║  │ img  │ img  │ img  │ img  │                   ║
║  └──────┴──────┴──────┴──────┘                   ║
║                                                    ║
║  📖 Story Timeline (12 stories)                   ║
║  ━━━━━━━━━━━━━━━━━━━━━━━━━━━━                   ║
║  2024 ─●─────────●──────── Now                    ║
║      Mar      Jan                                  ║
║  ┌─────────────────────────┐                      ║
║  │ Cyclone 2019 Memory     │                      ║
║  │ 5 min read • Mar 2024   │                      ║
║  └─────────────────────────┘                      ║
║                                                    ║
║  👥 Related Storytellers                          ║
║  [Aunty Mary]  [Uncle Joe]  [Sister Ruth]         ║
║                                                    ║
╚═══════════════════════════════════════════════════╝
```

---

## Implementation Steps

### Step 1: Database Setup (30 min)
- [ ] Create storyteller_photos table
- [ ] Create storyteller_relationships table
- [ ] Create storyteller_stats table
- [ ] Create update function for stats
- [ ] Set up Supabase storage bucket

### Step 2: Photo Gallery (2 hours)
- [ ] Create PhotoGallery component
- [ ] Add photo upload to admin panel
- [ ] Implement lightbox viewer
- [ ] Add photo management (delete, reorder)
- [ ] Test photo upload flow

### Step 3: Story Timeline (2 hours)
- [ ] Create StoryTimeline component
- [ ] Build timeline visualization
- [ ] Add filtering by date/category
- [ ] Calculate reading times
- [ ] Test with real data

### Step 4: Profile Statistics (1.5 hours)
- [ ] Create ProfileStats component
- [ ] Calculate statistics from stories
- [ ] Create charts (pie chart for categories)
- [ ] Cache stats in database
- [ ] Display stats on profile

### Step 5: Share Functionality (1 hour)
- [ ] Create ShareProfile component
- [ ] Implement copy link
- [ ] Add QR code generation
- [ ] Create print styles
- [ ] Test sharing

### Step 6: Integration & Polish (1 hour)
- [ ] Integrate all components into profile page
- [ ] Add loading states
- [ ] Mobile responsive design
- [ ] Test performance
- [ ] Deploy

**Total Estimated Time: 8-9 hours**

---

## Success Criteria

- [ ] Photo gallery displays all storyteller photos
- [ ] Timeline shows all stories chronologically
- [ ] Statistics are accurate and update automatically
- [ ] Share functionality works (copy, QR code)
- [ ] Elder badges display correctly
- [ ] Page loads in < 2 seconds
- [ ] Mobile responsive
- [ ] All features accessible via sidebar

---

## Future Enhancements

- Video gallery
- Audio recordings section
- Interactive family tree
- Collaborative story annotations
- Community comments/tributes
- Profile editing by storytellers themselves
- Achievement badges
- Storyteller rankings (most stories, longest member, etc.)

---

Ready to start implementation!
