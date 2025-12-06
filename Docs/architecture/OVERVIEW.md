# Architecture Overview

## System Architecture

```
┌─────────────────────────────────────────────────────────────┐
│                        FRONTEND                              │
│                    Next.js 14 (App Router)                   │
├─────────────────────────────────────────────────────────────┤
│  (public)/     │  wiki/        │  picc/        │  api/      │
│  - Home        │  - Stories    │  - Dashboard  │  - REST    │
│  - Stories     │  - People     │  - Media      │  - AI Chat │
│  - About       │  - Timeline   │  - Reports    │  - Upload  │
│  - Search      │  - Services   │  - Analytics  │            │
└─────────────────────────────────────────────────────────────┘
                              │
                              ▼
┌─────────────────────────────────────────────────────────────┐
│                        BACKEND                               │
│                       Supabase                               │
├─────────────┬─────────────┬─────────────┬───────────────────┤
│  PostgreSQL │    Auth     │   Storage   │  Edge Functions   │
│  - Stories  │  - Users    │  - Images   │  - AI Processing  │
│  - Profiles │  - Sessions │  - Videos   │  - Webhooks       │
│  - Media    │  - Roles    │  - Audio    │                   │
│  - Reports  │             │  - PDFs     │                   │
└─────────────┴─────────────┴─────────────┴───────────────────┘
                              │
                              ▼
┌─────────────────────────────────────────────────────────────┐
│                     AI SERVICES                              │
├─────────────────────────────────────────────────────────────┤
│  OpenAI GPT-4         │  Vector Embeddings                  │
│  - Story generation   │  - Semantic search                  │
│  - Q&A Assistant      │  - Related content                  │
│  - Content analysis   │  - Smart recommendations            │
└─────────────────────────────────────────────────────────────┘
```

## Key Components

### Public Pages (`app/(public)/`)
- Visitor-facing content
- Stories, about, community pages
- SEO optimized, server-rendered

### Wiki (`app/wiki/`)
- Knowledge base
- Categorized content (people, places, services, history)
- Search and navigation

### Admin Dashboard (`app/picc/`)
- Content management
- Media uploads
- Report generation
- Analytics

### API Routes (`app/api/`)
- RESTful endpoints
- AI chat integration
- Media processing
- Data operations

## Database Schema

### Core Tables
- `profiles` - Community members/storytellers
- `stories` - First-person narratives
- `media_files` - Photos, videos, audio
- `knowledge_entries` - Wiki content
- `annual_reports` - Report data

### Relationships
```
profiles ──┬── stories (storyteller)
           └── media_files (uploaded_by)

stories ──┬── media_files (story_media)
          └── knowledge_entries (related)

annual_reports ── media_files (report_images)
```

## Data Flow

1. **Content Creation**: Admin creates/imports content via `/picc`
2. **Storage**: Data stored in Supabase PostgreSQL, files in Storage
3. **Processing**: AI generates embeddings for search
4. **Delivery**: Next.js serves content via SSR/SSG
5. **Interaction**: Users can search, browse, interact with AI

## Security

- Row-level security (RLS) on all tables
- Authentication via Supabase Auth
- Role-based access control
- API rate limiting
