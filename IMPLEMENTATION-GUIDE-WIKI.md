# Implementation Guide: Wiki-Style Knowledge Management System
## Palm Island Community Repository

---

## 🎯 Overview

This guide provides step-by-step instructions for implementing the world-class wiki-style knowledge management system designed for the Palm Island Community Repository.

---

## 📋 Phase 1: Core Wiki Infrastructure (Weeks 1-3)

### Week 1: Navigation & Information Architecture

#### 1.1 Install Wiki Navigation Components

**Files created:**
- `web-platform/components/wiki/WikiNavigation.tsx` ✅
- `web-platform/components/wiki/Breadcrumbs.tsx` ✅
- `web-platform/components/wiki/TableOfContents.tsx` ✅

**Implementation steps:**

```bash
# 1. The components are already created - integrate them into your layout

# 2. Update the main layout to include wiki navigation
```

**Update `web-platform/app/layout.tsx`:**

```typescript
import WikiNavigation from '@/components/wiki/WikiNavigation';
import './globals.css';

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <body>
        <WikiNavigation />
        <main className="lg:ml-72 min-h-screen">
          {children}
        </main>
      </body>
    </html>
  );
}
```

**Test:**
- Navigate to any page and verify the sidebar appears
- Test mobile responsiveness
- Verify all navigation links work

#### 1.2 Implement Breadcrumbs

**Update story page to include breadcrumbs:**

```typescript
// web-platform/app/stories/[id]/page.tsx
import Breadcrumbs from '@/components/wiki/Breadcrumbs';

export default function StoryPage({ params }: { params: { id: string } }) {
  const breadcrumbs = [
    { label: 'Stories', href: '/stories' },
    { label: 'Health & Wellbeing', href: '/wiki/categories/health' },
    { label: story.title, href: `/stories/${params.id}` },
  ];

  return (
    <div className="container mx-auto px-4 py-8">
      <Breadcrumbs items={breadcrumbs} className="mb-6" />
      {/* Rest of story page */}
    </div>
  );
}
```

#### 1.3 Add Table of Contents

**For long content pages:**

```typescript
import TableOfContents from '@/components/wiki/TableOfContents';

export default function StoryPage() {
  return (
    <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
      {/* Main content */}
      <div className="lg:col-span-3">
        <article>
          <h2 id="overview">Overview</h2>
          <p>...</p>

          <h2 id="story">The Story</h2>
          <p>...</p>

          <h3 id="key-moments">Key Moments</h3>
          <p>...</p>
        </article>
      </div>

      {/* Sidebar with TOC */}
      <aside className="lg:col-span-1">
        <TableOfContents sticky />
      </aside>
    </div>
  );
}
```

### Week 2: Rich Metadata & Infoboxes

#### 2.1 Install Infobox Components

**Files created:**
- `web-platform/components/wiki/StoryInfobox.tsx` ✅
- `web-platform/components/wiki/RelatedContent.tsx` ✅

**Integrate into story page:**

```typescript
// web-platform/app/stories/[id]/page.tsx
import StoryInfobox from '@/components/wiki/StoryInfobox';
import RelatedContent from '@/components/wiki/RelatedContent';

export default async function StoryPage({ params }: { params: { id: string } }) {
  const story = await getStory(params.id);
  const relatedStories = await getRelatedStories(params.id);

  const infoboxData = {
    storyteller: story.storyteller,
    date_shared: story.created_at,
    story_date: story.story_date,
    location: story.location,
    categories: story.categories,
    services: story.services,
    people_affected: story.people_affected,
    views: story.views,
    cultural_sensitivity: story.cultural_sensitivity_level,
    access_level: story.access_level,
    elder_approved: story.elder_approval_given,
  };

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Main Content */}
        <div className="lg:col-span-2">
          <h1 className="text-4xl font-bold mb-6">{story.title}</h1>
          <div className="prose max-w-none">
            {story.content}
          </div>
        </div>

        {/* Sidebar */}
        <aside className="space-y-6">
          <StoryInfobox data={infoboxData} />
          <RelatedContent
            items={relatedStories}
            title="Related Stories"
          />
        </aside>
      </div>
    </div>
  );
}
```

### Week 3: Knowledge Graph Foundation

#### 3.1 Database Schema Updates

**Run this migration:**

```sql
-- File: web-platform/migrations/001_wiki_infrastructure.sql

-- Version Control
CREATE TABLE IF NOT EXISTS content_versions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  content_type TEXT NOT NULL, -- 'story', 'profile', etc.
  content_id UUID NOT NULL,
  version_number INTEGER NOT NULL,
  edited_by UUID REFERENCES profiles(id),
  edited_at TIMESTAMP DEFAULT NOW(),
  edit_summary TEXT,
  content_snapshot JSONB,
  diff_from_previous JSONB,
  is_minor_edit BOOLEAN DEFAULT false,
  cultural_advisor_approved BOOLEAN DEFAULT false
);

CREATE INDEX idx_content_versions ON content_versions(content_type, content_id);

-- Backlinks (automatically maintained)
CREATE TABLE IF NOT EXISTS content_links (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  source_type TEXT NOT NULL,
  source_id UUID NOT NULL,
  target_type TEXT NOT NULL,
  target_id UUID NOT NULL,
  link_type TEXT NOT NULL, -- 'mention', 'related', 'category', etc.
  created_at TIMESTAMP DEFAULT NOW()
);

CREATE INDEX idx_backlinks ON content_links(target_type, target_id);
CREATE INDEX idx_forward_links ON content_links(source_type, source_id);

-- Categories & Taxonomy
CREATE TABLE IF NOT EXISTS categories (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL,
  slug TEXT UNIQUE NOT NULL,
  parent_category_id UUID REFERENCES categories(id),
  description TEXT,
  icon TEXT,
  color TEXT,
  sort_order INTEGER DEFAULT 0
);

CREATE TABLE IF NOT EXISTS content_categories (
  content_type TEXT NOT NULL,
  content_id UUID NOT NULL,
  category_id UUID REFERENCES categories(id),
  PRIMARY KEY (content_type, content_id, category_id)
);

-- Knowledge Graph Edges
CREATE TABLE IF NOT EXISTS knowledge_graph_edges (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  from_type TEXT NOT NULL,
  from_id UUID NOT NULL,
  to_type TEXT NOT NULL,
  to_id UUID NOT NULL,
  edge_type TEXT NOT NULL,
  strength FLOAT DEFAULT 1.0, -- 0-1
  metadata JSONB,
  created_at TIMESTAMP DEFAULT NOW()
);

CREATE INDEX idx_kg_from ON knowledge_graph_edges(from_type, from_id);
CREATE INDEX idx_kg_to ON knowledge_graph_edges(to_type, to_id);
```

**Run the migration:**

```bash
cd web-platform
psql "$DATABASE_URL" < migrations/001_wiki_infrastructure.sql
```

#### 3.2 Install Knowledge Graph Component

**File created:**
- `web-platform/components/wiki/KnowledgeGraph.tsx` ✅

**Create a knowledge graph page:**

```typescript
// web-platform/app/wiki/graph/page.tsx
'use client';

import { useState, useEffect } from 'react';
import KnowledgeGraph from '@/components/wiki/KnowledgeGraph';
import { createClient } from '@/lib/supabase/client';

export default function KnowledgeGraphPage() {
  const [graphData, setGraphData] = useState({ nodes: [], edges: [] });

  useEffect(() => {
    async function loadGraph() {
      const supabase = createClient();

      // Fetch graph edges
      const { data: edges } = await supabase
        .from('knowledge_graph_edges')
        .select('*')
        .limit(100);

      // Build nodes from edges
      const nodeMap = new Map();
      edges?.forEach(edge => {
        if (!nodeMap.has(edge.from_id)) {
          nodeMap.set(edge.from_id, {
            id: edge.from_id,
            label: edge.from_id.substring(0, 8),
            type: edge.from_type
          });
        }
        if (!nodeMap.has(edge.to_id)) {
          nodeMap.set(edge.to_id, {
            id: edge.to_id,
            label: edge.to_id.substring(0, 8),
            type: edge.to_type
          });
        }
      });

      setGraphData({
        nodes: Array.from(nodeMap.values()),
        edges: edges || []
      });
    }

    loadGraph();
  }, []);

  return (
    <div className="container mx-auto px-4 py-8">
      <h1 className="text-4xl font-bold mb-8">Knowledge Graph</h1>
      <KnowledgeGraph
        nodes={graphData.nodes}
        edges={graphData.edges}
        height={600}
        onNodeClick={(node) => {
          console.log('Clicked node:', node);
          // Navigate to node detail page
        }}
      />
    </div>
  );
}
```

---

## 📋 Phase 2: Enhanced Profiles (Weeks 4-5)

### Week 4: Advanced Profile Editor

#### 4.1 Install Profile Editor Component

**File created:**
- `web-platform/components/wiki/EnhancedProfileEditor.tsx` ✅

**Create profile edit page:**

```typescript
// web-platform/app/profile/edit/page.tsx
'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import EnhancedProfileEditor from '@/components/wiki/EnhancedProfileEditor';
import { createClient } from '@/lib/supabase/client';

export default function ProfileEditPage() {
  const router = useRouter();
  const [profileData, setProfileData] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function loadProfile() {
      const supabase = createClient();
      const { data: { user } } = await supabase.auth.getUser();

      if (!user) {
        router.push('/login');
        return;
      }

      const { data: profile } = await supabase
        .from('profiles')
        .select('*')
        .eq('user_id', user.id)
        .single();

      setProfileData(profile);
      setLoading(false);
    }

    loadProfile();
  }, [router]);

  const handleSave = async (data: any) => {
    const supabase = createClient();
    const { data: { user } } = await supabase.auth.getUser();

    const { error } = await supabase
      .from('profiles')
      .update(data)
      .eq('user_id', user!.id);

    if (error) throw error;

    router.push('/profile');
  };

  if (loading) {
    return <div className="container mx-auto px-4 py-8">Loading...</div>;
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <EnhancedProfileEditor
        initialData={profileData!}
        onSave={handleSave}
        onCancel={() => router.push('/profile')}
      />
    </div>
  );
}
```

### Week 5: Profile Visualization & Analytics

**Create contribution graph helper:**

```typescript
// web-platform/lib/analytics/contributions.ts

export interface ContributionData {
  date: string;
  count: number;
  level: 0 | 1 | 2 | 3 | 4; // Intensity level
}

export async function getContributionData(userId: string): Promise<ContributionData[]> {
  const supabase = createClient();

  // Get last 365 days of activity
  const endDate = new Date();
  const startDate = new Date();
  startDate.setDate(startDate.getDate() - 365);

  const { data: stories } = await supabase
    .from('stories')
    .select('created_at')
    .eq('storyteller_id', userId)
    .gte('created_at', startDate.toISOString())
    .lte('created_at', endDate.toISOString());

  // Group by date
  const contributionMap = new Map<string, number>();
  stories?.forEach(story => {
    const date = story.created_at.split('T')[0];
    contributionMap.set(date, (contributionMap.get(date) || 0) + 1);
  });

  // Convert to array with levels
  const contributions: ContributionData[] = [];
  for (let d = new Date(startDate); d <= endDate; d.setDate(d.getDate() + 1)) {
    const dateStr = d.toISOString().split('T')[0];
    const count = contributionMap.get(dateStr) || 0;
    const level = count === 0 ? 0 : count <= 2 ? 1 : count <= 4 ? 2 : count <= 6 ? 3 : 4;
    contributions.push({ date: dateStr, count, level });
  }

  return contributions;
}
```

---

## 📋 Phase 3: Wiki Features (Weeks 6-8)

### Week 6: Version History

**Create version tracking service:**

```typescript
// web-platform/lib/wiki/versions.ts

export async function createVersion(
  contentType: string,
  contentId: string,
  editedBy: string,
  editSummary: string,
  contentSnapshot: any
) {
  const supabase = createClient();

  // Get current version number
  const { data: versions } = await supabase
    .from('content_versions')
    .select('version_number')
    .eq('content_type', contentType)
    .eq('content_id', contentId)
    .order('version_number', { ascending: false })
    .limit(1);

  const newVersionNumber = (versions?.[0]?.version_number || 0) + 1;

  // Create new version
  await supabase
    .from('content_versions')
    .insert({
      content_type: contentType,
      content_id: contentId,
      version_number: newVersionNumber,
      edited_by: editedBy,
      edit_summary: editSummary,
      content_snapshot: contentSnapshot,
    });
}
```

### Week 7: Bi-Directional Linking

**Create link parser:**

```typescript
// web-platform/lib/wiki/links.ts

export function parseWikiLinks(content: string): string[] {
  const linkRegex = /\[\[([^\]]+)\]\]/g;
  const links: string[] = [];
  let match;

  while ((match = linkRegex.exec(content)) !== null) {
    links.push(match[1]);
  }

  return links;
}

export function renderWikiLinks(content: string): string {
  return content.replace(/\[\[([^\]]+)\]\]/g, (match, linkText) => {
    const [text, displayText] = linkText.split('|');
    const href = `/wiki/${text.toLowerCase().replace(/\s+/g, '-')}`;
    return `<a href="${href}" class="text-blue-600 hover:text-blue-800 underline">${displayText || text}</a>`;
  });
}

export async function updateContentLinks(
  sourceType: string,
  sourceId: string,
  content: string
) {
  const links = parseWikiLinks(content);
  const supabase = createClient();

  // Delete old links
  await supabase
    .from('content_links')
    .delete()
    .eq('source_type', sourceType)
    .eq('source_id', sourceId);

  // Insert new links
  const linkInserts = links.map(link => ({
    source_type: sourceType,
    source_id: sourceId,
    target_type: 'page',
    target_id: link.toLowerCase().replace(/\s+/g, '-'),
    link_type: 'mention',
  }));

  if (linkInserts.length > 0) {
    await supabase.from('content_links').insert(linkInserts);
  }
}
```

### Week 8: Search Integration

**Create advanced search page:**

```typescript
// web-platform/app/search/page.tsx
'use client';

import { useState } from 'react';
import { Search, Filter } from 'lucide-react';
import { createClient } from '@/lib/supabase/client';

export default function SearchPage() {
  const [query, setQuery] = useState('');
  const [results, setResults] = useState([]);
  const [filters, setFilters] = useState({
    type: 'all',
    category: 'all',
    dateFrom: '',
    dateTo: '',
  });

  const handleSearch = async () => {
    const supabase = createClient();

    let queryBuilder = supabase
      .from('stories')
      .select('*, storyteller:storyteller_id(*)')
      .textSearch('content', query);

    if (filters.category !== 'all') {
      queryBuilder = queryBuilder.eq('story_category', filters.category);
    }

    const { data } = await queryBuilder;
    setResults(data || []);
  };

  return (
    <div className="container mx-auto px-4 py-8">
      {/* Search interface */}
    </div>
  );
}
```

---

## 📋 Phase 4: Analytics Dashboard (Weeks 9-10)

### Week 9: Analytics Database

**Add analytics tracking:**

```sql
-- web-platform/migrations/002_analytics.sql

CREATE TABLE IF NOT EXISTS content_analytics (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  content_type TEXT NOT NULL,
  content_id UUID NOT NULL,
  event_type TEXT NOT NULL, -- 'view', 'share', 'edit', 'comment'
  user_id UUID REFERENCES profiles(id),
  session_id TEXT,
  metadata JSONB,
  created_at TIMESTAMP DEFAULT NOW()
);

CREATE INDEX idx_analytics_content ON content_analytics(content_type, content_id);
CREATE INDEX idx_analytics_event ON content_analytics(event_type);
CREATE INDEX idx_analytics_time ON content_analytics(created_at);
```

### Week 10: Dashboard UI

**Create analytics dashboard:**

```typescript
// web-platform/app/analytics/page.tsx
// Implementation of analytics dashboard with charts
```

---

## 🚀 Deployment Checklist

- [ ] All database migrations run successfully
- [ ] Wiki navigation tested on mobile and desktop
- [ ] Breadcrumbs working on all pages
- [ ] Table of contents auto-generating
- [ ] Infoboxes displaying correct data
- [ ] Knowledge graph rendering
- [ ] Profile editor saving correctly
- [ ] Version history tracking
- [ ] Wiki links parsing and rendering
- [ ] Analytics tracking events
- [ ] Dashboard showing data

---

## 📚 Additional Resources

### Documentation
- See `WIKI-DESIGN-ARCHITECTURE.md` for full design specifications
- See component files for detailed props and usage examples

### Support
- Check GitHub issues for common problems
- Review the architecture document for design decisions

---

**This wiki-style system transforms the Palm Island Community Repository into a world-class knowledge management platform while maintaining Indigenous data sovereignty and cultural protocols.**
