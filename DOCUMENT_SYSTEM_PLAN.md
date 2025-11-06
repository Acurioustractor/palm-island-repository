# Document System - Implementation Plan

## Overview
Build a comprehensive document management system for Palm Island to store, organize, view, and search community documents, reports, photos, and other media files.

---

## Features

### 1. Document Library
- Browse all community documents
- Filter by type (PDF, images, reports, photos, historical)
- Sort by date, title, category
- Search by title, description, tags
- Grid/List view options
- Pagination for large collections

### 2. PDF Viewer
- In-browser PDF viewing
- Navigation controls (zoom, page navigation)
- Download option
- Print option
- Full-screen mode
- Mobile-responsive

### 3. Document Upload
- Drag & drop interface
- Multiple file upload
- Progress indicators
- File type validation
- Metadata capture (title, description, category, tags, date)
- Thumbnail generation for PDFs
- Access control settings

### 4. Document Organization
- Categories: Reports, Photos, Historical Documents, Community News, Meeting Minutes, etc.
- Tags for cross-referencing
- Collections/Folders
- Related documents linking
- Chronological organization

### 5. Document Management
- Edit metadata
- Delete documents
- Archive/Restore
- Version history
- Access permissions (public, members-only, admin-only)

---

## Database Schema

```sql
-- Documents table
CREATE TABLE IF NOT EXISTS documents (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  title TEXT NOT NULL,
  description TEXT,
  file_path TEXT NOT NULL,
  file_name TEXT NOT NULL,
  file_type TEXT NOT NULL, -- 'pdf', 'image', 'doc', 'video', etc.
  file_size INTEGER, -- in bytes
  mime_type TEXT,
  supabase_bucket TEXT DEFAULT 'community-documents',

  -- Organization
  category TEXT NOT NULL, -- 'report', 'photo', 'historical', 'meeting_minutes', 'news', etc.
  tags TEXT[], -- Array of tags
  document_date DATE, -- The date the document relates to (not upload date)

  -- Metadata
  author TEXT,
  source TEXT, -- Where the document came from
  related_storyteller_id UUID REFERENCES profiles(id),
  related_story_id UUID REFERENCES stories(id),

  -- Access control
  access_level TEXT DEFAULT 'public', -- 'public', 'members', 'admin'
  is_featured BOOLEAN DEFAULT false,
  is_archived BOOLEAN DEFAULT false,

  -- Audit fields
  uploaded_by UUID REFERENCES profiles(id),
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW(),

  -- Search optimization
  search_vector tsvector GENERATED ALWAYS AS (
    to_tsvector('english', coalesce(title, '') || ' ' || coalesce(description, '') || ' ' || coalesce(author, ''))
  ) STORED
);

-- Indexes
CREATE INDEX idx_documents_category ON documents(category);
CREATE INDEX idx_documents_tags ON documents USING GIN(tags);
CREATE INDEX idx_documents_date ON documents(document_date);
CREATE INDEX idx_documents_search ON documents USING GIN(search_vector);
CREATE INDEX idx_documents_storyteller ON documents(related_storyteller_id);
CREATE INDEX idx_documents_story ON documents(related_story_id);
CREATE INDEX idx_documents_access ON documents(access_level);

-- Document thumbnails (for PDFs and images)
CREATE TABLE IF NOT EXISTS document_thumbnails (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  document_id UUID REFERENCES documents(id) ON DELETE CASCADE,
  thumbnail_path TEXT NOT NULL,
  page_number INTEGER DEFAULT 1, -- For multi-page PDFs
  width INTEGER,
  height INTEGER,
  created_at TIMESTAMP DEFAULT NOW()
);

CREATE INDEX idx_document_thumbnails_document ON document_thumbnails(document_id);

-- Document collections (for grouping related documents)
CREATE TABLE IF NOT EXISTS document_collections (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  name TEXT NOT NULL,
  description TEXT,
  created_by UUID REFERENCES profiles(id),
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW()
);

-- Many-to-many relationship between documents and collections
CREATE TABLE IF NOT EXISTS document_collection_items (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  collection_id UUID REFERENCES document_collections(id) ON DELETE CASCADE,
  document_id UUID REFERENCES documents(id) ON DELETE CASCADE,
  display_order INTEGER DEFAULT 0,
  added_at TIMESTAMP DEFAULT NOW(),
  CONSTRAINT unique_collection_document UNIQUE(collection_id, document_id)
);

-- Document views tracking (analytics)
CREATE TABLE IF NOT EXISTS document_views (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  document_id UUID REFERENCES documents(id) ON DELETE CASCADE,
  viewer_id UUID REFERENCES profiles(id), -- NULL for anonymous views
  viewed_at TIMESTAMP DEFAULT NOW(),
  view_duration_seconds INTEGER
);

CREATE INDEX idx_document_views_document ON document_views(document_id);
CREATE INDEX idx_document_views_date ON document_views(viewed_at);

-- Update timestamp trigger
CREATE OR REPLACE FUNCTION update_document_timestamp()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER update_documents_timestamp
BEFORE UPDATE ON documents
FOR EACH ROW
EXECUTE FUNCTION update_document_timestamp();

-- Function to get document statistics
CREATE OR REPLACE FUNCTION get_document_stats(p_document_id UUID)
RETURNS JSON AS $$
DECLARE
  result JSON;
BEGIN
  SELECT json_build_object(
    'total_views', COUNT(*),
    'unique_viewers', COUNT(DISTINCT viewer_id),
    'avg_duration_seconds', AVG(view_duration_seconds)
  )
  INTO result
  FROM document_views
  WHERE document_id = p_document_id;

  RETURN result;
END;
$$ LANGUAGE plpgsql;
```

---

## Storage Buckets

### Supabase Storage Buckets Needed:

1. **community-documents** - Main document storage
   - PDF files
   - Word documents
   - Text files
   - Other document types

2. **community-photos** - Photo storage (if not using storyteller-photos)
   - High-resolution images
   - Historical photos
   - Event photos

3. **document-thumbnails** - Generated thumbnails
   - PDF preview images
   - Document cover images

---

## Component Structure

```
components/
├── documents/
│   ├── DocumentLibrary.tsx        # Main document browser
│   ├── DocumentGrid.tsx           # Grid view of documents
│   ├── DocumentList.tsx           # List view of documents
│   ├── DocumentCard.tsx           # Single document card
│   ├── DocumentViewer.tsx         # PDF viewer modal
│   ├── DocumentUpload.tsx         # Upload interface
│   ├── DocumentFilters.tsx        # Filter sidebar
│   ├── DocumentSearch.tsx         # Search input
│   ├── CollectionBrowser.tsx      # Browse collections
│   └── DocumentMetadataForm.tsx   # Edit document metadata
```

---

## Pages to Create/Update

### New Pages:

1. **`/documents`** - Main document library
2. **`/documents/[id]`** - Individual document viewer
3. **`/documents/upload`** - Upload new documents (admin)
4. **`/documents/collections`** - Browse document collections
5. **`/documents/collections/[id]`** - View specific collection

### Pages to Update:

- **Dashboard** - Add "Recent Documents" section
- **Admin Panel** - Add document management link
- **Storyteller Profiles** - Link related documents

---

## UI Mockup - Document Library

```
╔═══════════════════════════════════════════════════════════╗
║  📚 Community Documents                                    ║
║                                                            ║
║  [Search documents...] 🔍              [+ Upload] [Grid⬛] ║
╠═══════════════════════════════════════════════════════════╣
║                                                            ║
║  Filters          │  Documents (124)                      ║
║  ───────────      │  ─────────────────────────────        ║
║  Category         │  ┌──────────┬──────────┬──────────┐  ║
║  ☑ All            │  │ [PDF]    │ [IMG]    │ [PDF]    │  ║
║  ☐ Reports (45)   │  │ Annual   │ Historic │ Meeting  │  ║
║  ☐ Photos (38)    │  │ Report   │ Photo    │ Minutes  │  ║
║  ☐ Historical(21) │  │ 2024     │ 1985     │ Mar 2024 │  ║
║  ☐ Minutes (20)   │  └──────────┴──────────┴──────────┘  ║
║                   │  ┌──────────┬──────────┬──────────┐  ║
║  Date Range       │  │ [PDF]    │ [IMG]    │ [DOC]    │  ║
║  [2020] to [2024] │  │ ...      │ ...      │ ...      │  ║
║                   │  └──────────┴──────────┴──────────┘  ║
║  Tags             │                                       ║
║  #housing         │  [Load More] [1] 2 3 4 5 ...         ║
║  #health          │                                       ║
║  #community       │                                       ║
╚═══════════════════════════════════════════════════════════╝
```

---

## UI Mockup - PDF Viewer

```
╔═══════════════════════════════════════════════════════════╗
║  ← Back to Documents                                       ║
║                                                            ║
║  Annual Report 2024                           [↓] [Print] ║
║  Community Development • Report • Jan 15, 2024             ║
║  ───────────────────────────────────────────────────────  ║
║                                                            ║
║  ┌────────────────────────────────────────────────────┐  ║
║  │                                                     │  ║
║  │                                                     │  ║
║  │            [PDF PREVIEW WINDOW]                    │  ║
║  │                                                     │  ║
║  │                                                     │  ║
║  │                                                     │  ║
║  └────────────────────────────────────────────────────┘  ║
║                                                            ║
║  [◀] Page 1 of 45 [▶]  [-] 100% [+]  [⛶ Fullscreen]     ║
║                                                            ║
║  ───────────────────────────────────────────────────────  ║
║  Description:                                              ║
║  Comprehensive annual report covering community            ║
║  development initiatives throughout 2024...                ║
║                                                            ║
║  Tags: #annual-report #2024 #community-development         ║
║  Author: Palm Island Community Company                     ║
║  Date: January 15, 2024                                    ║
║  124 views • Uploaded by Admin on Jan 15, 2024            ║
╚═══════════════════════════════════════════════════════════╝
```

---

## Implementation Steps

### Step 1: Database Setup (30 min)
- [ ] Create documents table
- [ ] Create document_thumbnails table
- [ ] Create document_collections tables
- [ ] Create document_views tracking table
- [ ] Create indexes for search optimization
- [ ] Set up Supabase storage buckets

### Step 2: Document Upload (2 hours)
- [ ] Create DocumentUpload component with drag & drop
- [ ] Add file validation (type, size)
- [ ] Implement metadata form
- [ ] Add progress indicators
- [ ] Test upload flow with different file types
- [ ] Generate thumbnails for PDFs

### Step 3: Document Library (2.5 hours)
- [ ] Create DocumentLibrary page
- [ ] Build DocumentCard component
- [ ] Implement grid/list view toggle
- [ ] Add filtering (category, date, tags)
- [ ] Add search functionality
- [ ] Implement pagination
- [ ] Test with various document types

### Step 4: PDF Viewer (2 hours)
- [ ] Install PDF viewer library (react-pdf or similar)
- [ ] Create DocumentViewer component
- [ ] Add navigation controls (zoom, pages)
- [ ] Implement download/print
- [ ] Add fullscreen mode
- [ ] Test on mobile devices

### Step 5: Document Management (1.5 hours)
- [ ] Create admin page for document management
- [ ] Add edit metadata functionality
- [ ] Implement delete with confirmation
- [ ] Add archive/restore capability
- [ ] Create collections management
- [ ] Test permissions and access control

### Step 6: Integration & Polish (1 hour)
- [ ] Add documents section to dashboard
- [ ] Link documents to storyteller profiles
- [ ] Add recent documents widget
- [ ] Optimize search performance
- [ ] Mobile responsive testing
- [ ] Deploy

**Total Estimated Time: 9-10 hours**

---

## Technologies

### PDF Viewing:
- **react-pdf** - React component for PDF viewing
- **pdfjs-dist** - PDF.js library (powers Firefox PDF viewer)

### File Upload:
- **react-dropzone** - Drag & drop file upload
- Supabase Storage API

### Search:
- PostgreSQL full-text search (tsvector)
- Future: Algolia or Meilisearch for advanced search

---

## Success Criteria

- [ ] Users can upload documents with metadata
- [ ] Documents display in grid and list views
- [ ] PDF viewer works on desktop and mobile
- [ ] Search returns relevant results
- [ ] Filtering works correctly
- [ ] Download and print functions work
- [ ] Admin can manage document metadata
- [ ] Page loads in < 2 seconds
- [ ] Mobile responsive
- [ ] Access control enforced

---

## Future Enhancements

- OCR for scanned documents
- Document annotations/comments
- Version control for documents
- Batch upload
- Advanced search with AI
- Document sharing links with expiry
- Download as ZIP for collections
- Document workflows (approval process)
- Integration with AI features for semantic search

---

Ready to start implementation!
