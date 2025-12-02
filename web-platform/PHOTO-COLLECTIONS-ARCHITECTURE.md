# Photo Collections & Smart Folders Architecture

## 📊 Current Status
- **Total Photos**: 1,214 (and growing)
- **Current Limit**: Now loads 200 at a time with "Load More"
- **Problem**: Getting unwieldy, need organization

## 🎯 Solution: 3-Layer Organization System

### Layer 1: **Collections** (Manual Folders)
Manual organization like traditional folders

**Examples:**
- 2024 Storm Recovery
- Elders Trip to Brisbane
- Community Basketball Tournament
- Palm Island Festival 2024

**Database Schema:**
```sql
CREATE TABLE photo_collections (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL,
  slug TEXT UNIQUE NOT NULL,
  description TEXT,
  cover_image_id UUID REFERENCES media_files(id),
  created_at TIMESTAMPTZ DEFAULT NOW(),
  created_by UUID REFERENCES profiles(id),
  item_count INTEGER DEFAULT 0,
  is_public BOOLEAN DEFAULT false
);

CREATE TABLE collection_items (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  collection_id UUID REFERENCES photo_collections(id) ON DELETE CASCADE,
  media_id UUID REFERENCES media_files(id) ON DELETE CASCADE,
  added_at TIMESTAMPTZ DEFAULT NOW(),
  sort_order INTEGER DEFAULT 0,
  UNIQUE(collection_id, media_id)
);
```

### Layer 2: **Smart Folders** (Auto-Generated)
Dynamic collections that auto-update based on rules

**Examples:**
- **By Tag**: "Elder Stories", "Cultural Events", "Youth Activities"
- **By Location**: "Community Hall", "Beach", "School"
- **By Date**: "This Month", "Last Year", "2024 Photos"
- **By Person**: "Uncle Frank's Photos", "Auntie Mary's Photos"
- **By Project**: "Photo Studio Project", "Innovation Lab"

**Database Schema:**
```sql
CREATE TABLE smart_folders (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL,
  slug TEXT UNIQUE NOT NULL,
  description TEXT,
  icon TEXT, -- lucide icon name
  color TEXT, -- badge color
  query_rules JSONB NOT NULL, -- Filter rules
  is_system BOOLEAN DEFAULT false, -- Pre-built vs user-created
  created_at TIMESTAMPTZ DEFAULT NOW(),
  created_by UUID REFERENCES profiles(id)
);

-- Example query_rules:
{
  "filters": [
    { "field": "tags", "operator": "contains", "value": "elder" },
    { "field": "created_at", "operator": ">=", "value": "2024-01-01" }
  ],
  "match": "all" // or "any"
}
```

### Layer 3: **Quick Filters** (Top Bar)
Fast filters for the gallery view (already partially implemented)

- All Photos
- Images Only
- Videos Only
- Needs Tagging
- Elder Review Required
- High Quality (quality_score > 80)

---

## 🚀 Implementation Plan

### Phase 1: Collections (Manual Folders) - 2-3 hours

**1. Create Collections Page** `/picc/media/collections`
```typescript
// Features:
- Grid of collections with cover image
- Create new collection button
- Edit collection (name, description, cover)
- Delete collection
- View collection contents
```

**2. Add Photos to Collection**
```typescript
// From gallery:
- Select multiple photos → "Add to Collection" button
- Shows dropdown of existing collections
- Option to create new collection
```

**3. Collection Detail Page** `/picc/media/collections/[slug]`
```typescript
// Shows:
- All photos in this collection
- Can add/remove photos
- Can reorder photos (drag and drop)
- Can set cover photo
- Can share collection (public link)
```

### Phase 2: Smart Folders - 3-4 hours

**1. Pre-Built Smart Folders** (System)
```typescript
const SYSTEM_SMART_FOLDERS = [
  {
    name: "Elder Stories",
    icon: "Users",
    color: "amber",
    rules: { filters: [{ field: "tags", operator: "contains", value: "elder" }] }
  },
  {
    name: "This Month",
    icon: "Calendar",
    color: "blue",
    rules: {
      filters: [{
        field: "created_at",
        operator: ">=",
        value: startOfMonth(new Date()).toISOString()
      }]
    }
  },
  {
    name: "Needs Tagging",
    icon: "AlertCircle",
    color: "red",
    rules: { filters: [{ field: "tags", operator: "empty" }] }
  },
  {
    name: "High Quality",
    icon: "Star",
    color: "purple",
    rules: { filters: [{ field: "quality_score", operator: ">=", value: 80 }] }
  }
];
```

**2. Custom Smart Folders**
```typescript
// Users can create their own:
interface SmartFolderBuilder {
  name: string;
  filters: Array<{
    field: 'tags' | 'location' | 'created_at' | 'file_type' | 'faces_detected' | 'quality_score';
    operator: 'equals' | 'contains' | 'greater_than' | 'less_than' | 'between';
    value: any;
  }>;
  matchAll: boolean; // AND vs OR
}
```

**3. Smart Folder UI**
```
📁 Collections
   → Storm Recovery 2024 (45 photos)
   → Elders Trip Brisbane (23 photos)
   → Basketball Tournament (67 photos)

⚡ Smart Folders
   → 📅 This Month (12 photos)
   → 👥 Elder Stories (89 photos)
   → 📍 Community Hall (234 photos)
   → ⭐ High Quality (156 photos)
   → ⚠️ Needs Tagging (34 photos)

🔍 Quick Filters
   → All Photos (1,214)
   → Images (1,201)
   → Videos (13)
```

### Phase 3: Performance Optimizations - 1-2 hours

**1. Virtual Scrolling**
```bash
npm install react-window
```

```typescript
import { FixedSizeGrid } from 'react-window';

// Renders only visible photos (100x faster for large collections)
<FixedSizeGrid
  columnCount={5}
  columnWidth={200}
  height={800}
  rowCount={Math.ceil(media.length / 5)}
  rowHeight={200}
  width={1000}
>
  {({ columnIndex, rowIndex, style }) => (
    <PhotoCard item={media[rowIndex * 5 + columnIndex]} style={style} />
  )}
</FixedSizeGrid>
```

**2. Image Lazy Loading** (already done with `loading="lazy"`)

**3. Thumbnail Generation**
```sql
-- Add thumbnail URLs to media_files
ALTER TABLE media_files
ADD COLUMN thumbnail_url TEXT,
ADD COLUMN thumbnail_small_url TEXT; -- For grid view

-- Generate on upload using Supabase Image Transformations
const thumbnailUrl = `${publicUrl}/thumbnail`;
```

---

## 📱 UI/UX Design

### Sidebar Navigation (New)
```
┌─────────────────────┬────────────────────────┐
│ 📁 Collections      │  Photo Gallery         │
│   Storm Recovery    │  [Grid of photos]      │
│   Elders Trip       │                        │
│   Basketball        │  [Load More button]    │
│                     │                        │
│ ⚡ Smart Folders    │                        │
│   This Month        │                        │
│   Elder Stories     │                        │
│   Needs Tagging     │                        │
│   High Quality      │                        │
│                     │                        │
│ 🔍 Quick Filters    │                        │
│   All Photos        │                        │
│   Images Only       │                        │
│   Videos Only       │                        │
└─────────────────────┴────────────────────────┘
```

### Collection Card Design
```
┌────────────────────────┐
│  [Cover Photo]         │
│                        │
│  Storm Recovery 2024   │
│  45 photos · Public    │
│  Created Mar 15, 2024  │
└────────────────────────┘
```

---

## 🎨 Benefits

### For Users:
✅ **Fast Loading**: 200 photos at a time (2-3 seconds)
✅ **Easy Organization**: Drag photos into collections
✅ **Auto-Organization**: Smart folders update automatically
✅ **Quick Access**: Find photos by tag, location, person
✅ **No Manual Work**: Smart folders do the sorting

### For Performance:
✅ **Scalable**: Works with 10,000+ photos
✅ **Fast Queries**: Indexed by tags, location, date
✅ **Lazy Loading**: Only loads visible images
✅ **Cached**: Collections cache their counts

---

## 📋 Next Steps

### Immediate (This Session):
1. ✅ Add infinite scroll with "Load More" button
2. ✅ Fix 1,000 photo limit

### Short Term (Next 1-2 days):
1. Create `photo_collections` and `collection_items` tables
2. Build Collections page UI
3. Add "Add to Collection" feature in gallery

### Medium Term (Next week):
1. Create `smart_folders` table
2. Build Smart Folder engine (query builder)
3. Add pre-built system smart folders

### Long Term (Future):
1. Virtual scrolling for 10,000+ photos
2. AI-generated collections (e.g., "Beach Photos", "People Smiling")
3. Shared collections (public links)
4. Collection exports (PDF, slideshow)

---

## 🔧 Database Migration

Run this SQL in Supabase SQL Editor:

```sql
-- Photo Collections
CREATE TABLE photo_collections (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL,
  slug TEXT UNIQUE NOT NULL,
  description TEXT,
  cover_image_id UUID REFERENCES media_files(id),
  created_at TIMESTAMPTZ DEFAULT NOW(),
  created_by UUID REFERENCES profiles(id),
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  item_count INTEGER DEFAULT 0,
  is_public BOOLEAN DEFAULT false,
  tenant_id UUID REFERENCES tenants(id)
);

CREATE TABLE collection_items (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  collection_id UUID REFERENCES photo_collections(id) ON DELETE CASCADE,
  media_id UUID REFERENCES media_files(id) ON DELETE CASCADE,
  added_at TIMESTAMPTZ DEFAULT NOW(),
  added_by UUID REFERENCES profiles(id),
  sort_order INTEGER DEFAULT 0,
  UNIQUE(collection_id, media_id)
);

-- Smart Folders
CREATE TABLE smart_folders (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL,
  slug TEXT UNIQUE NOT NULL,
  description TEXT,
  icon TEXT DEFAULT 'Folder',
  color TEXT DEFAULT 'blue',
  query_rules JSONB NOT NULL,
  is_system BOOLEAN DEFAULT false,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  created_by UUID REFERENCES profiles(id),
  tenant_id UUID REFERENCES tenants(id)
);

-- Indexes for performance
CREATE INDEX idx_collection_items_collection ON collection_items(collection_id);
CREATE INDEX idx_collection_items_media ON collection_items(media_id);
CREATE INDEX idx_media_files_tags ON media_files USING GIN(tags);
CREATE INDEX idx_media_files_location ON media_files(location);
CREATE INDEX idx_media_files_created_at ON media_files(created_at DESC);

-- Update collection counts trigger
CREATE OR REPLACE FUNCTION update_collection_count()
RETURNS TRIGGER AS $$
BEGIN
  IF TG_OP = 'INSERT' THEN
    UPDATE photo_collections
    SET item_count = item_count + 1
    WHERE id = NEW.collection_id;
  ELSIF TG_OP = 'DELETE' THEN
    UPDATE photo_collections
    SET item_count = item_count - 1
    WHERE id = OLD.collection_id;
  END IF;
  RETURN NULL;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER collection_count_trigger
AFTER INSERT OR DELETE ON collection_items
FOR EACH ROW EXECUTE FUNCTION update_collection_count();

-- RLS Policies
ALTER TABLE photo_collections ENABLE ROW LEVEL SECURITY;
ALTER TABLE collection_items ENABLE ROW LEVEL SECURITY;
ALTER TABLE smart_folders ENABLE ROW LEVEL SECURITY;

-- Anyone can view public collections
CREATE POLICY "Public collections are viewable by all"
ON photo_collections FOR SELECT
USING (is_public = true OR auth.role() = 'authenticated');

-- Anyone can view collection items
CREATE POLICY "Collection items viewable"
ON collection_items FOR SELECT
USING (true);

-- Service role full access
CREATE POLICY "Service role full access to collections"
ON photo_collections FOR ALL
USING (auth.role() = 'service_role');

CREATE POLICY "Service role full access to collection items"
ON collection_items FOR ALL
USING (auth.role() = 'service_role');

CREATE POLICY "Service role full access to smart folders"
ON smart_folders FOR ALL
USING (auth.role() = 'service_role');
```

---

## 💡 Example Use Cases

### Use Case 1: "Find all Elder photos from last year"
```
Smart Folder: "Elder Stories 2024"
Rules:
- tags contains "elder"
- created_at >= 2024-01-01
- created_at < 2025-01-01
Result: Auto-updates as new elder photos are added
```

### Use Case 2: "Create collection for annual report"
```
Manual Collection: "2024 Annual Report"
1. Browse smart folders (Elder Stories, High Quality, Community Events)
2. Select best photos from each
3. Add to "2024 Annual Report" collection
4. Reorder for narrative flow
5. Export as PDF
```

### Use Case 3: "Photos that need work"
```
Smart Folder: "Needs Attention"
Rules:
- tags is empty OR
- faces_detected is null OR
- quality_score < 50
Result: To-do list for photo tagging/curation
```

---

This architecture gives you both **flexibility** (manual collections) and **automation** (smart folders) while maintaining **performance** at scale!
