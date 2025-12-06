# Interactive Annual Reports Experience - Implementation Plan

## Executive Summary
Create a world-class interactive experience for browsing and exploring PICC's 15 annual reports (2009-2024) with:
1. **Semantic search interface** using existing vector embeddings
2. **Timeline storytelling view** - horizontal scrolling timeline with visual storytelling
3. **PDF image extraction** - extract images from all PDFs and add to media library
4. **Interactive image gallery** - browseable gallery of all report images with context
5. **Deep linking** - images link back to their source reports and pages

## Current State Analysis

### Existing Infrastructure ✅
- **86 knowledge entries** with vector embeddings (OpenAI text-embedding-3-small, 1536 dimensions)
- **15 annual report PDFs** downloaded to `/public/documents/annual-reports/` (73.7MB total)
- **Media library system** with:
  - `media_files` table for photos/images
  - `photo_collections` for manual albums
  - `smart_folders` for dynamic collections
  - Tags, metadata, and GIN indexes
- **Knowledge base pages** at `/picc/knowledge/`:
  - Main search page
  - Timeline page (currently shows stories, not reports)
  - API routes for search, timeline, etc.
- **Tech stack**: Next.js 14 (App Router), React, TypeScript, Tailwind CSS, Supabase, pgvector
- **Existing search API**: `/api/knowledge/search` with semantic vector search

### Database Schema
```sql
-- Knowledge entries (already exists)
knowledge_entries (
  id, slug, title, subtitle, content, summary,
  entry_type, category, fiscal_year,
  embedding VECTOR(1536),  -- For semantic search
  structured_data JSONB,    -- Flexible metadata
  keywords TEXT[]
)

-- Media files (already exists)
media_files (
  id, file_name, file_path, file_type,
  storage_path, s3_url, file_size,
  tags TEXT[],  -- For categorization
  metadata JSONB,  -- Custom metadata
  created_at
)

-- Photo collections (already exists)
photo_collections (
  id, name, slug, description,
  cover_image_id, item_count
)

-- Collection items (already exists)
collection_items (
  collection_id, media_id, sort_order
)
```

## Implementation Plan

### Phase 1: PDF Image Extraction 🎯
**Goal:** Extract all images from 15 annual report PDFs and save them with metadata

**Tasks:**
1. **Install PDF processing library**
   - Use `pdf-lib` or `pdfjs-dist` for image extraction
   - May also need `canvas` and `sharp` for image processing

2. **Create extraction script** (`scripts/extract-annual-report-images.ts`)
   - For each PDF in `/public/documents/annual-reports/`:
     - Extract all images (JPG, PNG)
     - Save to `/public/documents/annual-reports/images/[year]/page-[num]-img-[idx].jpg`
     - Create metadata JSON file with:
       - Source PDF, year, page number, image dimensions
       - Extracted text context (surrounding text)
       - Image hash for deduplication

3. **Import images to media library**
   - Batch upload to `media_files` table
   - Generate thumbnails if needed
   - Tag with: `annual-report`, `annual-report-[year]`, page number, etc.
   - Store source metadata in `metadata` JSONB field:
     ```json
     {
       "source": "annual-report",
       "fiscal_year": "2020-21",
       "pdf_path": "/documents/annual-reports/picc-annual-report-2020-21.pdf",
       "page_number": 5,
       "image_index": 2,
       "context_text": "...",
       "knowledge_entry_slug": "picc-annual-report-2020-21-full-pdf"
     }
     ```

4. **Create "Annual Reports Images" collection**
   - Create a photo collection specifically for annual report images
   - Automatically add all extracted images
   - This provides a dedicated gallery view

**Estimated images:** ~50-200 images across 15 reports (estimate 3-15 per report)

**Technical challenges:**
- Some PDFs might have embedded images vs inline images
- Image quality/resolution variations
- Deduplication (same logo/footer on multiple pages)
- Large file sizes (11MB PDFs)

### Phase 2: Enhanced Timeline Page 📅
**Goal:** Create an immersive horizontal scrolling timeline showing PICC's evolution

**Design inspiration:**
- Apple's product timeline
- The Pudding's interactive articles
- Google's material timeline components

**Features:**
1. **Horizontal scroll layout**
   - Each year = card with expansion
   - Smooth scroll snapping
   - Mini-map showing position in timeline

2. **Year cards contain:**
   - Fiscal year badge (large)
   - Key stats (employees, revenue, major milestones)
   - 1-3 hero images from that year's report
   - Major achievements (bullet points)
   - Download PDF link
   - "Expand" button for full report view

3. **Expanded view (modal or slide-out):**
   - Full report content
   - All images from that year
   - Complete text extraction
   - Download PDF
   - Navigate to next/previous year

4. **Interactive elements:**
   - Filter by theme (health, services, governance, community)
   - Search within timeline
   - Jump to specific year
   - Compare two years side-by-side

**Component structure:**
```
/app/picc/knowledge/annual-reports/
  page.tsx              - Main timeline page
  components/
    TimelineCard.tsx    - Individual year card
    TimelineNavigation.tsx - Mini-map and controls
    YearExpanded.tsx    - Expanded year view
    YearComparison.tsx  - Side-by-side comparison
```

**API endpoint:**
```
/api/knowledge/annual-reports
- Returns all 15 report entries with structured data
- Includes image URLs for each year
- Aggregated stats for visualization
```

### Phase 3: Enhanced Search Interface 🔍
**Goal:** Powerful semantic search across all reports with visual results

**Features:**
1. **Main search bar** (enhance existing `/picc/knowledge/page.tsx`):
   - Large, prominent search input
   - Autocomplete suggestions
   - Advanced filters:
     - Year range slider
     - Content type (stats, programs, governance, etc.)
     - Has images toggle

2. **Results display:**
   - **Visual cards** with:
     - Report year badge
     - Matching snippet with highlights
     - Associated image (if any)
     - Relevance score
     - Page number in PDF
   - **Sort options:**
     - Relevance (default - vector similarity)
     - Year (newest first / oldest first)
     - Most images

3. **Result interaction:**
   - Click to expand full context
   - "View in timeline" - jumps to timeline page at that year
   - "Open PDF at page" - opens PDF directly to relevant page
   - "See all images from this year"

4. **AI-powered features:**
   - **Ask a question** - natural language queries
     - "How many employees in 2020?"
     - "When did Digital Service Centre open?"
     - "Show me all mentions of community control"
   - **Summary generation** - LLM-generated summaries of search results
   - **Related searches** - "People also searched for..."

**Technical implementation:**
- Use existing `/api/knowledge/search` endpoint
- Enhance to include image associations
- Add `/api/knowledge/ask` endpoint for Q&A
- Use streaming responses for LLM summaries

### Phase 4: Interactive Image Gallery 🖼️
**Goal:** Beautiful, filterable gallery of all annual report images

**Page:** `/picc/media/annual-reports` or `/picc/knowledge/annual-reports/images`

**Features:**
1. **Masonry grid layout**
   - Pinterest-style responsive grid
   - Lazy loading for performance
   - Smooth transitions

2. **Filters:**
   - Year selector (dropdown or buttons)
   - Content type (people, facilities, graphics, charts, etc.)
   - Sort: newest, oldest, most referenced

3. **Image cards show:**
   - Thumbnail
   - Year badge overlay
   - Page number overlay
   - Hover: shows context text

4. **Lightbox view:**
   - Full-size image
   - Metadata sidebar:
     - Source report and year
     - Page number
     - Context text from PDF
     - "View full report" link
   - Navigate between images (arrows)

5. **Bulk actions:**
   - Select multiple images
   - Add to collection
   - Download ZIP

6. **Image metadata enrichment:**
   - Auto-tag using vision AI (OpenAI Vision API)
   - Extract text from charts (OCR)
   - Identify people/places (optional)

### Phase 5: Deep Linking & Navigation 🔗
**Goal:** Seamless navigation between all views

**Implementation:**
1. **URL structure:**
   - `/picc/knowledge/annual-reports` - Timeline view
   - `/picc/knowledge/annual-reports/2020-21` - Single year view
   - `/picc/knowledge/annual-reports/images` - Image gallery
   - `/picc/knowledge/annual-reports/search?q=...` - Search results
   - `/picc/media/annual-reports` - Media library view

2. **Cross-linking:**
   - Knowledge entry pages link to timeline position
   - Images link back to source PDF page
   - Search results link to timeline and images
   - Media gallery links to knowledge entries

3. **Smart breadcrumbs:**
   - Always show current context
   - Easy navigation back to parent views

## Technical Architecture

### New Components
```
/app/picc/knowledge/annual-reports/
  page.tsx                          - Timeline main page
  [year]/page.tsx                   - Single year detail page
  images/page.tsx                   - Image gallery page
  search/page.tsx                   - Enhanced search page

/app/picc/knowledge/annual-reports/components/
  TimelineCard.tsx                  - Year card component
  TimelineNavigation.tsx            - Timeline controls
  YearExpanded.tsx                  - Expanded year modal
  YearComparison.tsx                - Compare years
  ImageGallery.tsx                  - Masonry image grid
  ImageLightbox.tsx                 - Full-size image view
  SearchFilters.tsx                 - Advanced search filters
  SemanticSearch.tsx                - Vector search interface
  AskQuestionInput.tsx              - Q&A interface
```

### New API Routes
```
/app/api/knowledge/annual-reports/
  route.ts                          - List all reports with stats
  [year]/route.ts                   - Single year data
  images/route.ts                   - All report images
  extract-images/route.ts           - Trigger image extraction
  ask/route.ts                      - Q&A endpoint (streaming)
```

### New Scripts
```
/scripts/
  extract-annual-report-images.ts   - Extract images from PDFs
  import-report-images.ts           - Import to media library
  enrich-image-metadata.ts          - AI tagging and OCR
  generate-report-previews.ts       - Create preview images
```

### Database Migrations
No new tables needed! Use existing:
- `media_files` for extracted images
- `photo_collections` for "Annual Reports" collection
- `knowledge_entries` already has reports with embeddings

## Design System

### Color Scheme
Use existing Tailwind colors with themed accents:
- **Timeline cards:** Blue gradient (matches PICC brand)
- **Year badges:** Color-coded by era:
  - 2009-2012: Amber (foundation)
  - 2013-2018: Purple (growth)
  - 2019-2021: Green (transition to community control)
  - 2021-2024: Blue (community controlled)

### Typography
- **Headlines:** Bold, large Tailwind font classes
- **Body:** Readable 16px base
- **Stats:** Extra large, bold numbers
- **Context text:** Smaller, muted gray

### Interactive Elements
- **Smooth animations:** Use Tailwind transitions and `motion` library
- **Scroll effects:** Intersection Observer for animations
- **Hover states:** Subtle shadows and transforms
- **Loading states:** Skeleton screens and spinners

## Performance Considerations

### Image Optimization
- Generate thumbnails at multiple sizes (150px, 300px, 600px, original)
- Use WebP format where possible
- Lazy load below fold
- Progressive JPEGs for large images

### Data Loading
- Paginate timeline (load 3-5 years initially)
- Infinite scroll for image gallery
- Cache API responses (SWR or React Query)
- Prefetch adjacent years on timeline

### Bundle Size
- Code split by route
- Lazy load heavy components (Lightbox, PDF viewer)
- Tree-shake unused Lucide icons

## Implementation Timeline

### Week 1: Foundation
- [ ] Install PDF libraries
- [ ] Create image extraction script
- [ ] Test extraction on 2-3 PDFs
- [ ] Import images to media library
- [ ] Create "Annual Reports" collection

### Week 2: Timeline
- [ ] Build timeline page layout
- [ ] Create TimelineCard component
- [ ] Add horizontal scroll and navigation
- [ ] Implement expand/collapse
- [ ] Add year comparison feature

### Week 3: Search & Images
- [ ] Enhance search interface
- [ ] Add advanced filters
- [ ] Build image gallery page
- [ ] Implement lightbox view
- [ ] Add AI tagging

### Week 4: Polish & Launch
- [ ] Cross-linking and navigation
- [ ] Performance optimization
- [ ] Mobile responsiveness
- [ ] User testing
- [ ] Documentation
- [ ] Launch! 🚀

## Open Questions for User

1. **Image extraction priority:**
   - Do all 15 reports first, or start with most recent (2023-24) to test?

2. **AI features:**
   - Should we implement Q&A immediately or start with basic search?
   - Do you want auto-tagging of images (costs OpenAI API calls)?

3. **Design preferences:**
   - Any specific brand colors or design inspirations?
   - Do you want dark mode support?

4. **Mobile experience:**
   - Horizontal scroll on mobile or vertical list?
   - Simplified mobile view or full features?

5. **Access control:**
   - Should any reports/images be private/member-only?
   - Public access to all content?

## Success Metrics

### User Engagement
- Time spent on timeline page
- Number of searches performed
- Images clicked/viewed
- PDFs downloaded
- Return visitors

### Technical Performance
- Page load time < 2 seconds
- Image load time < 500ms
- Search response time < 300ms
- 90+ Lighthouse score

### Content Metrics
- Total images extracted: target 100+
- Search coverage: 100% of report content
- Cross-link density: every entry has 3+ related links

## Conclusion

This plan creates a comprehensive, world-class experience for exploring PICC's annual reports. The combination of semantic search, visual timeline, and interactive gallery provides multiple engaging ways to discover and understand PICC's 15-year journey.

**Key differentiators:**
✨ Semantic search with AI-powered Q&A
📅 Immersive timeline storytelling
🖼️ Visual-first image gallery
🔗 Deep linking between all views
📱 Responsive and performant
♿ Accessible (WCAG 2.1 AA)

This transforms static PDFs into an interactive, searchable, visual knowledge base that tells the story of PICC's growth and community control journey.
