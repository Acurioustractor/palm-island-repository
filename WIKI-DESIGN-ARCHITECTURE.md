# Palm Island Community Wiki - World-Class Information Management Architecture
## *Transforming Community Storytelling into a Living Knowledge Base*

---

## 🎯 Vision: Wiki-Style Knowledge Management

Transform the Palm Island Community Repository into a **world-class wiki-style knowledge base** that combines:
- **Wikipedia's** information architecture and discoverability
- **Notion's** collaborative editing and rich content
- **Obsidian's** knowledge graphs and bi-directional linking
- **Indigenous data sovereignty** with cultural protocols embedded
- **Advanced analytics** for impact measurement and insights

---

## 📚 Core Wiki Principles Applied

### 1. **Rich Information Architecture**
```
Hierarchical Organization:
┌─────────────────────────────────────────────────────────┐
│                     Knowledge Base                       │
├──────────────┬──────────────┬───────────────────────────┤
│   Stories    │   People     │    Knowledge Areas        │
├──────────────┼──────────────┼───────────────────────────┤
│ • Community  │ • Elders     │ • History & Heritage      │
│ • Elder      │ • Leaders    │ • Culture & Language      │
│ • Youth      │ • Service    │ • Health & Wellbeing      │
│ • Service    │   Providers  │ • Environment & Land      │
│   Stories    │ • Community  │ • Services & Programs     │
│              │   Members    │ • Achievements & Milestones│
└──────────────┴──────────────┴───────────────────────────┘

Cross-Cutting Dimensions:
- Time: Historical periods, decades, years, seasons
- Place: Locations, cultural sites, buildings
- Topic: Tags, categories, themes
- Impact: Services, outcomes, beneficiaries
```

### 2. **Knowledge Graph & Relationships**
Every entity (story, person, place, topic) has:
- **Backlinks**: "What links here" - all content referencing this item
- **Related content**: Semantically similar items
- **Category membership**: Multiple taxonomy paths
- **Timeline connections**: Temporal relationships
- **Geographic links**: Spatial relationships
- **People connections**: Who's involved, mentioned, affected
- **Service links**: Related programs and initiatives

### 3. **Rich Metadata & Infoboxes**
Every page includes structured metadata panels:

#### Story Infobox
```typescript
interface StoryInfobox {
  // Core Info
  title: string;
  storyteller: Person;
  date_shared: Date;
  story_date?: Date;

  // Classification
  category: Category[];
  topics: Topic[];
  emotional_themes: EmotionalTheme[];

  // Context
  location?: Place;
  people_involved?: Person[];
  organizations?: Organization[];
  services?: Service[];

  // Impact
  people_affected?: number;
  impact_areas?: ImpactArea[];
  outcomes?: Outcome[];

  // Media
  photos?: number;
  videos?: number;
  audio?: number;

  // Engagement
  views: number;
  shares: number;
  related_stories: number;

  // Cultural
  cultural_sensitivity: SensitivityLevel;
  elder_approved?: boolean;
  access_level: AccessLevel;
}
```

#### Person (Storyteller) Infobox
```typescript
interface PersonInfobox {
  // Identity
  name: string;
  preferred_name?: string;
  photo?: string;

  // Role
  community_roles: string[];
  storyteller_type: StorytellerType;
  expertise_areas: string[];

  // Connections
  stories_shared: number;
  collaborations?: Person[];
  services_connected: Service[];

  // Contributions
  first_story: Date;
  latest_story: Date;
  total_impact: number;

  // Location
  location: string;
  traditional_country?: string;
  language_group?: string;

  // Timeline
  key_milestones: Milestone[];
  contribution_graph: Graph;
}
```

---

## 🌿 Enhanced Navigation System

### Global Navigation Structure
```typescript
interface WikiNavigation {
  // Primary Navigation
  mainMenu: {
    explore: {
      allStories: '/wiki/stories',
      byCategory: '/wiki/categories',
      byPeople: '/wiki/people',
      byPlace: '/wiki/places',
      byTime: '/wiki/timeline',
      byTopic: '/wiki/topics'
    },
    contribute: {
      shareStory: '/stories/submit',
      editProfile: '/profile/edit',
      uploadMedia: '/media/upload',
      reviewContent: '/review'
    },
    knowledge: {
      history: '/wiki/history',
      culture: '/wiki/culture',
      services: '/wiki/services',
      achievements: '/wiki/achievements'
    },
    insights: {
      dashboard: '/analytics',
      patterns: '/insights/patterns',
      impact: '/insights/impact',
      reports: '/reports'
    }
  };

  // Contextual Navigation
  breadcrumbs: Breadcrumb[];
  tableOfContents: TOCItem[];
  relatedContent: RelatedItem[];
  categoryTree: Category[];

  // Discovery
  recentChanges: RecentChange[];
  trending: TrendingTopic[];
  featured: FeaturedContent[];
  randomPage: () => Page;
}
```

### Page-Level Navigation Components

#### 1. **Breadcrumb Trail**
```
Home > Knowledge Areas > Health & Wellbeing > Women's Health > "Sarah's Journey to Wellness"
```

#### 2. **Table of Contents** (auto-generated)
```
Contents
1. Overview
2. Story Background
3. Key Moments
4. Impact & Outcomes
5. Related Stories
6. References
7. Discussion
```

#### 3. **Sidebar Navigation**
```
┌─────────────────────────┐
│ STORY NAVIGATION        │
├─────────────────────────┤
│ ✓ View Story            │
│ ✏️ Edit (if authorized) │
│ 📜 History              │
│ 💬 Discussion           │
│ 🔗 What Links Here      │
│ 🏷️ Categories           │
│ 📊 Analytics            │
└─────────────────────────┘

┌─────────────────────────┐
│ RELATED CONTENT         │
├─────────────────────────┤
│ By Same Storyteller     │
│ Similar Stories         │
│ Same Category           │
│ Same Time Period        │
│ Same Location           │
└─────────────────────────┘

┌─────────────────────────┐
│ CATEGORIES              │
├─────────────────────────┤
│ • Health & Wellbeing    │
│   └ Women's Health      │
│ • Resilience Stories    │
│ • 2024 Stories          │
│ • Community Pride       │
└─────────────────────────┘
```

---

## 🔥 Wiki-Style Content Features

### 1. **Version History & Editing**
```typescript
interface VersionControl {
  // Version History
  versions: Version[];
  currentVersion: Version;

  // Editing
  editMode: 'view' | 'edit' | 'preview';
  autosave: boolean;
  collaborators: User[];

  // Change Tracking
  changes: Change[];
  diff: (v1: Version, v2: Version) => Diff;

  // Rollback
  restore: (versionId: string) => void;

  // Attribution
  contributors: Contributor[];
  editSummary: string;
}

interface Version {
  id: string;
  version_number: number;
  edited_by: User;
  edited_at: Date;
  edit_summary: string;
  changes_description: string;
  diff_from_previous: Diff;
  is_minor_edit: boolean;
  cultural_advisor_approved?: boolean;
}
```

**Version History View:**
```
┌─────────────────────────────────────────────────────────┐
│ Version History for "Sarah's Journey to Wellness"       │
├─────────────────────────────────────────────────────────┤
│ Current → v5 (Latest)                                    │
│  ├─ 8 Nov 2025, 10:30 AM                                │
│  ├─ Edited by: Rachel Atkinson                          │
│  ├─ Summary: "Added outcome metrics and impact data"    │
│  └─ [View] [Compare] [Restore]                          │
│                                                          │
│ v4                                                       │
│  ├─ 5 Nov 2025, 2:15 PM                                 │
│  ├─ Edited by: Sarah (storyteller)                      │
│  ├─ Summary: "Updated personal reflection section"      │
│  └─ [View] [Compare] [Restore]                          │
│                                                          │
│ v3                                                       │
│  ├─ 1 Nov 2025, 9:00 AM                                 │
│  ├─ Edited by: Cultural Advisor Team                    │
│  ├─ Summary: "Cultural protocol review - approved"      │
│  └─ [View] [Compare] [Restore]                          │
└─────────────────────────────────────────────────────────┘
```

### 2. **Bi-Directional Linking**
```markdown
# Example Story Content with Wiki-Style Links

Sarah first connected with [[Women's Health Service]] in March 2024
after being referred by [[Dr. Mary Johnson]]. The journey began at
[[Palm Island Community Health Centre]] and involved collaboration
with [[PICC Social Services]].

This story demonstrates the [[Holistic Care Model]] and connects to
the broader [[Community Control Movement]] that has defined PICC's
approach since [[2021 Full Community Control Transition]].

## Impact
Sarah's journey has inspired [[Related: 12 other women's health stories]]
and contributed to the development of [[Culturally-Safe Health Protocols]].

See also:
- [[Women's Circles Program]]
- [[Traditional Healing Practices]]
- [[Community Health Outcomes 2024]]
```

**Backlinks Panel** (auto-generated):
```
What Links Here (23 pages):
- Women's Health Service Overview
- 2024 Community Health Report
- Dr. Mary Johnson - Contributions
- Holistic Care Model Success Stories
- Community Control Impact Analysis
... [view all 23 pages]
```

### 3. **Rich Content Blocks**
```typescript
interface ContentBlock {
  type: 'text' | 'quote' | 'callout' | 'timeline' | 'gallery' | 'map' | 'chart' | 'table' | 'embed';
  content: any;
  metadata?: Record<string, any>;
}

// Example: Timeline Block
{
  type: 'timeline',
  content: {
    events: [
      {
        date: '2024-03-15',
        title: 'First Visit to Health Centre',
        description: 'Initial consultation with Dr. Johnson',
        icon: 'hospital'
      },
      {
        date: '2024-04-20',
        title: 'Cultural Healing Session',
        description: 'Connected with Elder Aunty Rose',
        icon: 'heart'
      },
      {
        date: '2024-06-10',
        title: 'Wellness Milestone Achieved',
        description: 'Completed program, now mentor for others',
        icon: 'star'
      }
    ]
  }
}

// Example: Callout Block
{
  type: 'callout',
  content: {
    style: 'info' | 'success' | 'warning' | 'cultural-note',
    title: 'Cultural Context',
    text: 'This story references women's business. Please respect cultural protocols.',
    icon: 'info-circle'
  }
}
```

### 4. **Discussion & Collaboration**
```typescript
interface DiscussionSystem {
  // Comments
  comments: Comment[];
  addComment: (text: string, replyTo?: string) => void;

  // Annotations
  annotations: Annotation[];
  highlightText: (range: Range, note: string) => void;

  // Cultural Review
  culturalReviewThread: ReviewThread;
  elderApproval: ApprovalStatus;

  // Suggestions
  suggestions: EditSuggestion[];
  proposedChanges: Change[];
}

interface Comment {
  id: string;
  author: User;
  text: string;
  created_at: Date;
  replies: Comment[];
  resolved: boolean;
  cultural_advisor_comment: boolean;
}
```

---

## 📊 Advanced Profile Editing

### Rich Profile Interface
```typescript
interface EnhancedProfile {
  // Basic Info (editable)
  personalInfo: {
    full_name: string;
    preferred_name: string;
    profile_photo: Media;
    bio_short: string; // 280 chars
    bio_long: string; // Full biography with wiki-style formatting
    pronouns?: string;
  };

  // Community Identity
  community: {
    roles: CommunityRole[];
    storyteller_type: StorytellerType;
    expertise_areas: ExpertiseArea[];
    languages_spoken: Language[];
    traditional_connections: {
      country?: string;
      language_group?: string;
      clan?: string;
    };
  };

  // Contributions (auto-generated)
  contributions: {
    stories: {
      total: number;
      by_category: Record<Category, number>;
      featured: Story[];
      recent: Story[];
    };
    edits: {
      total: number;
      to_own_stories: number;
      collaborative_edits: number;
    };
    engagement: {
      stories_read: number;
      comments_made: number;
      connections_made: number;
    };
    impact: {
      total_views: number;
      people_reached: number;
      stories_inspired: number;
    };
  };

  // Knowledge Graph
  connections: {
    people: Person[];
    places: Place[];
    topics: Topic[];
    services: Service[];
    stories_connected: Story[];
  };

  // Timeline
  timeline: {
    milestones: Milestone[];
    contribution_history: ContributionGraph;
    journey_visualization: Timeline;
  };

  // Privacy & Permissions
  privacy: {
    visibility: ProfileVisibility;
    show_in_directory: boolean;
    cultural_permissions: CulturalPermission[];
    access_controls: AccessControl[];
  };
}
```

### Profile Editor UI Components

#### 1. **Split-View Editor**
```
┌─────────────────────────┬─────────────────────────┐
│       EDIT MODE         │      LIVE PREVIEW       │
├─────────────────────────┼─────────────────────────┤
│                         │                         │
│ # My Bio                │   [Rendered Bio]        │
│                         │                         │
│ I'm a proud Bwgcolman   │   Shows formatted       │
│ woman and [[Elder]] in  │   text with links       │
│ our community...        │   and styling           │
│                         │                         │
│ **Expertise:**          │                         │
│ - [[Cultural Healing]]  │                         │
│ - [[Women's Business]]  │                         │
│                         │                         │
└─────────────────────────┴─────────────────────────┘
```

#### 2. **Rich Media Gallery**
```
Profile Media Manager
┌────────────────────────────────────────────────────┐
│  [Photo] [Video] [Audio] [Documents]               │
├────────────────────────────────────────────────────┤
│  ┌──────┐ ┌──────┐ ┌──────┐ ┌──────┐             │
│  │Photo │ │Photo │ │Photo │ │ Add  │             │
│  │  1   │ │  2   │ │  3   │ │ New  │             │
│  └──────┘ └──────┘ └──────┘ └──────┘             │
│                                                     │
│  Each photo:                                        │
│  - Caption & description                           │
│  - Cultural permissions                            │
│  - Usage contexts                                  │
│  - People tagging (with consent)                   │
└────────────────────────────────────────────────────┘
```

#### 3. **Contribution Visualization**
```
Your Impact Timeline
┌────────────────────────────────────────────────────┐
│    Stories Shared Over Time                         │
│  10│     ●                                          │
│    │              ●                                 │
│   5│    ●            ●                              │
│    │ ●                 ●●                           │
│   0│─────────────────────────────────               │
│     J  F  M  A  M  J  J  A  S  O  N  D             │
│                                                     │
│  Categories Contributed To:                         │
│  ████████████████ Women's Health (12)              │
│  ████████ Culture (6)                               │
│  ████ Elder Wisdom (3)                              │
└────────────────────────────────────────────────────┘
```

---

## 🌐 Knowledge Graph Visualization

### Interactive Knowledge Map
```typescript
interface KnowledgeGraph {
  nodes: {
    stories: StoryNode[];
    people: PersonNode[];
    places: PlaceNode[];
    topics: TopicNode[];
    services: ServiceNode[];
    events: EventNode[];
  };

  edges: {
    mentions: Edge[];
    collaborations: Edge[];
    influences: Edge[];
    impacts: Edge[];
    temporal: Edge[];
    spatial: Edge[];
  };

  visualizations: {
    networkGraph: NetworkViz;
    timeline: TimelineViz;
    geographic: MapViz;
    hierarchical: TreeViz;
  };
}
```

### Knowledge Graph Views

#### 1. **Network View**
```
                    [Palm Island History]
                            │
                ┌───────────┼───────────┐
                │           │           │
         [1957 Strike] [Community] [Land Rights]
                │       Control       │
                │           │           │
         [Magnificent] [PICC Story] [Traditional]
            [Seven]    [2007-2024]   [Country]
                │           │           │
             [Strike]  [197 Staff] [Manbarra]
             [Stories] [16 Services] [People]
```

#### 2. **Timeline View**
```
1918 ──────── 1957 ──────── 2007 ──────── 2021 ──────── 2024
│             │             │             │             │
Forced        Strike 57     PICC          Full          Storm
Relocation    Movement      Founded       Control       Stories
│             │             │             │             │
├─ 26 stories ├─ 15 stories ├─ 45 stories ├─ 30 stories ├─ 26 stories
```

#### 3. **Geographic View**
```
Interactive Map showing:
- Story locations (clustered)
- Cultural sites (with protocols)
- Service locations
- Historical places
- Event locations
- Click any location to see all connected content
```

---

## 📈 Analytics & Insights Dashboard

### Community Analytics Interface
```typescript
interface AnalyticsDashboard {
  // Overview
  summary: {
    total_stories: number;
    active_storytellers: number;
    monthly_growth: number;
    engagement_rate: number;
  };

  // Content Analytics
  content: {
    stories_by_category: Chart;
    stories_over_time: Chart;
    popular_topics: TopicCloud;
    trending_stories: Story[];
  };

  // Impact Metrics
  impact: {
    people_reached: number;
    services_documented: number;
    cultural_knowledge_preserved: number;
    community_connections: number;
  };

  // Engagement
  engagement: {
    views_over_time: Chart;
    shares_by_story: Chart;
    comment_activity: Chart;
    contributor_activity: Chart;
  };

  // Knowledge Graph Analytics
  graph: {
    most_connected_stories: Story[];
    influential_storytellers: Person[];
    topic_clusters: Cluster[];
    knowledge_gaps: Gap[];
  };

  // Cultural Insights
  cultural: {
    elder_wisdom_count: number;
    traditional_knowledge: number;
    language_preservation: number;
    cultural_practices: number;
  };
}
```

### Dashboard Visualizations

#### 1. **Community Activity Heatmap**
```
       Mon  Tue  Wed  Thu  Fri  Sat  Sun
Week 1  ██   ███  ██   ████ ███  █    ██
Week 2  ███  ████ ████ ███  ██   ███  █
Week 3  ██   ███  ████ ████ ███  ██   ███
Week 4  ████ ███  ██   ███  ████ ███  ██

Legend: Stories Shared
█ = 1-2  ██ = 3-5  ███ = 6-10  ████ = 10+
```

#### 2. **Topic Clustering**
```
                [Health & Wellbeing]
                        │
        ┌───────────────┼───────────────┐
        │               │               │
   [Physical]      [Mental]        [Cultural]
    [Health]       [Health]         [Healing]
        │               │               │
  [26 stories]    [18 stories]    [35 stories]
        │               │               │
  Popular tags:   Popular tags:   Popular tags:
  - Diabetes      - Resilience    - Traditional
  - Exercise      - Community     - Connection
  - Nutrition     - Support       - Ceremony
```

#### 3. **Storyteller Contributions**
```
Top Contributors This Month
┌────────────────────────────────────────┐
│ 1. Aunty Rose ██████████████████ 18    │
│ 2. Rachel A.  █████████████ 13         │
│ 3. Uncle Joe  ██████████ 10             │
│ 4. Mary J.    ████████ 8                │
│ 5. Sarah M.   ██████ 6                  │
└────────────────────────────────────────┘
```

---

## 🔍 Advanced Search & Discovery

### Multi-Modal Search Interface
```typescript
interface AdvancedSearch {
  // Search Methods
  methods: {
    semantic: (query: string) => Results;
    keyword: (terms: string[]) => Results;
    faceted: (filters: Filters) => Results;
    graph: (relationships: Relationship[]) => Results;
    temporal: (timeRange: DateRange) => Results;
    spatial: (location: Location, radius?: number) => Results;
  };

  // Search Filters
  filters: {
    content_type: ContentType[];
    categories: Category[];
    date_range: DateRange;
    people: Person[];
    places: Place[];
    services: Service[];
    topics: Topic[];
    access_level: AccessLevel[];
    has_media: boolean;
    cultural_sensitivity: SensitivityLevel[];
  };

  // Search Results
  results: {
    items: SearchResult[];
    facets: Facet[];
    suggestions: Suggestion[];
    related_searches: Query[];
  };

  // Saved Searches
  saved: SavedSearch[];
  alerts: SearchAlert[];
}
```

### Search Interface Features

#### 1. **Smart Search Bar**
```
┌─────────────────────────────────────────────────────┐
│ 🔍  Find stories, people, topics, places...         │
│                                                     │
│     As you type: "women's health"                   │
│                                                     │
│     💡 Suggestions:                                 │
│     → Women's Health Stories (23)                   │
│     → Women's Health Service                        │
│     → Dr. Mary Johnson (Women's Health)             │
│     → Women's Circles Program                       │
│                                                     │
│     📊 Related Topics:                              │
│     → Holistic Care • Cultural Healing • Wellbeing  │
└─────────────────────────────────────────────────────┘
```

#### 2. **Faceted Search Results**
```
Search: "health stories 2024"  [152 results]

┌─ Filters ─────────────┐  ┌─ Results ────────────────┐
│                       │  │                          │
│ CATEGORY              │  │ 1. Sarah's Journey...    │
│ ☑ Health (89)         │  │    Women's Health • 2024 │
│ ☐ Mental Health (45)  │  │    ⭐ 4.8 • 👁 1.2k      │
│ ☐ Youth (23)          │  │                          │
│                       │  │ 2. Diabetes Program...   │
│ TIME                  │  │    Men's Health • 2024   │
│ ☑ 2024 (152)          │  │    ⭐ 4.9 • 👁 980       │
│ ☐ 2023 (134)          │  │                          │
│                       │  │ 3. Cultural Healing...   │
│ SERVICE               │  │    Elder Care • 2024     │
│ ☑ Women's Health (34) │  │    ⭐ 5.0 • 👁 1.5k      │
│ ☐ Men's Health (28)   │  │                          │
│                       │  │ [Load More]              │
└───────────────────────┘  └──────────────────────────┘
```

---

## 🎨 Wiki-Style Page Templates

### Story Page Template
```markdown
# [Story Title]
[Breadcrumb: Home > Stories > Category > Title]

┌─ STORY INFOBOX ──────────────┐
│ 📖 Shared by: [Storyteller]  │
│ 📅 Date: [Date]               │
│ 📍 Location: [Place]          │
│ 🏷️ Category: [Categories]     │
│ 👥 People: [People Involved]  │
│ 🎯 Impact: [Impact Areas]     │
│ 📊 Views: [View Count]        │
└───────────────────────────────┘

## Contents
1. Overview
2. Story
3. Impact & Outcomes
4. Related Stories
5. References
6. Discussion

## Overview
[Story summary in 2-3 sentences]

## Story
[Full story content with wiki-style links]

### Key Moments
- [Timeline component]

### People Involved
- [[Person 1]] - [Role]
- [[Person 2]] - [Role]

## Impact & Outcomes
[Impact indicators and measurements]

### Outcomes Achieved
- [Outcome 1]
- [Outcome 2]

### People Affected
[Number and description]

## Related Stories
- [[Similar Story 1]]
- [[Similar Story 2]]
- [[Story by Same Author]]

## Categories
[[Category:Health & Wellbeing]]
[[Category:Women's Health]]
[[Category:2024 Stories]]
[[Category:Resilience Stories]]

## See Also
- [[Women's Health Service]]
- [[Holistic Care Model]]
- [[Community Health Outcomes 2024]]

---
← [Previous Story] | [Next Story] →

[Edit] [History] [Discussion] [What Links Here]
```

### Person (Storyteller) Page Template
```markdown
# [Person Name]
[Breadcrumb: Home > People > Name]

┌─ PERSON INFOBOX ─────────────┐
│ 👤 Name: [Full Name]          │
│ 🌟 Preferred: [Preferred]     │
│ 📍 Location: [Location]       │
│ 🎭 Role: [Community Roles]    │
│ 🗣️ Languages: [Languages]      │
│ 📚 Stories: [Story Count]     │
│ 🌊 Expertise: [Areas]         │
└───────────────────────────────┘

[Profile Photo or Avatar]

## Biography
[Personal bio with wiki-style links]

## Contributions
### Stories Shared ([X] total)
[Grid of story cards]

### Areas of Expertise
- [[Expertise Area 1]]
- [[Expertise Area 2]]

### Impact Timeline
[Contribution graph visualization]

## Connections
### Collaborated With
- [[Person 1]]
- [[Person 2]]

### Services Connected
- [[Service 1]]
- [[Service 2]]

### Topics Contributed To
- [[Topic 1]] (X stories)
- [[Topic 2]] (Y stories)

## Knowledge Graph
[Interactive graph showing this person's connections]

---
[View All Stories] [Send Message] [Follow]
```

---

## 🛠️ Technical Implementation

### Database Enhancements
```sql
-- Version Control
CREATE TABLE content_versions (
  id UUID PRIMARY KEY,
  content_type TEXT, -- 'story', 'profile', etc.
  content_id UUID,
  version_number INTEGER,
  edited_by UUID REFERENCES profiles(id),
  edited_at TIMESTAMP,
  edit_summary TEXT,
  content_snapshot JSONB,
  diff_from_previous JSONB,
  is_minor_edit BOOLEAN DEFAULT false,
  cultural_advisor_approved BOOLEAN
);

-- Backlinks (automatically maintained)
CREATE TABLE content_links (
  id UUID PRIMARY KEY,
  source_type TEXT,
  source_id UUID,
  target_type TEXT,
  target_id UUID,
  link_type TEXT, -- 'mention', 'related', 'category', etc.
  created_at TIMESTAMP
);

CREATE INDEX idx_backlinks ON content_links(target_type, target_id);

-- Categories & Taxonomy
CREATE TABLE categories (
  id UUID PRIMARY KEY,
  name TEXT,
  slug TEXT UNIQUE,
  parent_category_id UUID REFERENCES categories(id),
  description TEXT,
  icon TEXT,
  color TEXT,
  sort_order INTEGER
);

CREATE TABLE content_categories (
  content_type TEXT,
  content_id UUID,
  category_id UUID REFERENCES categories(id),
  PRIMARY KEY (content_type, content_id, category_id)
);

-- Discussion & Comments
CREATE TABLE discussions (
  id UUID PRIMARY KEY,
  content_type TEXT,
  content_id UUID,
  author_id UUID REFERENCES profiles(id),
  comment_text TEXT,
  parent_comment_id UUID REFERENCES discussions(id),
  created_at TIMESTAMP,
  updated_at TIMESTAMP,
  resolved BOOLEAN DEFAULT false,
  cultural_advisor_comment BOOLEAN DEFAULT false
);

-- Annotations
CREATE TABLE annotations (
  id UUID PRIMARY KEY,
  content_type TEXT,
  content_id UUID,
  author_id UUID REFERENCES profiles(id),
  text_range JSONB, -- { start: number, end: number }
  annotation_text TEXT,
  annotation_type TEXT, -- 'note', 'question', 'cultural-note'
  created_at TIMESTAMP
);

-- Knowledge Graph
CREATE TABLE knowledge_graph_edges (
  id UUID PRIMARY KEY,
  from_type TEXT,
  from_id UUID,
  to_type TEXT,
  to_id UUID,
  edge_type TEXT,
  strength FLOAT, -- 0-1
  metadata JSONB,
  created_at TIMESTAMP
);

-- Analytics
CREATE TABLE content_analytics (
  id UUID PRIMARY KEY,
  content_type TEXT,
  content_id UUID,
  event_type TEXT, -- 'view', 'share', 'edit', 'comment'
  user_id UUID REFERENCES profiles(id),
  metadata JSONB,
  created_at TIMESTAMP
);
```

---

## 📱 User Experience Enhancements

### 1. **Contextual Actions**
Every page includes quick actions based on user permissions:
- **View Mode**: Read, share, bookmark, print
- **Edit Mode**: Edit, suggest change, add note
- **Admin Mode**: Approve, feature, categorize, archive

### 2. **Keyboard Shortcuts** (Wikipedia-style)
```
/ or Ctrl+K : Focus search
E : Edit current page
H : View history
D : Discussion
T : Table of contents
R : Recent changes
S : Random story
```

### 3. **Mobile-First Design**
- Collapsible navigation
- Touch-friendly editing
- Offline reading mode
- Progressive image loading

### 4. **Accessibility**
- WCAG 2.1 AA compliance
- Screen reader optimized
- Keyboard navigation
- High contrast modes
- Text-to-speech integration

---

## 🎯 Implementation Roadmap

### Phase 1: Core Wiki Infrastructure (Weeks 1-3)
- [ ] Version control system
- [ ] Bi-directional linking
- [ ] Category system
- [ ] Breadcrumb navigation
- [ ] Table of contents

### Phase 2: Enhanced Profiles (Weeks 4-5)
- [ ] Rich profile editor
- [ ] Contribution graphs
- [ ] Media gallery
- [ ] Timeline visualization

### Phase 3: Knowledge Graph (Weeks 6-8)
- [ ] Backlinks system
- [ ] Knowledge graph database
- [ ] Network visualization
- [ ] Related content engine

### Phase 4: Analytics & Insights (Weeks 9-10)
- [ ] Analytics dashboard
- [ ] Impact metrics
- [ ] Trend analysis
- [ ] Export reports

### Phase 5: Advanced Features (Weeks 11-12)
- [ ] Discussion system
- [ ] Annotations
- [ ] Advanced search
- [ ] Cultural review workflows

---

## 🌊 Success Metrics

### Knowledge Management
- **Discoverability**: Average time to find related content < 30 seconds
- **Connections**: Average 5+ related items per story
- **Navigation**: 3-click access to any content
- **Search Success**: >90% successful searches

### Community Engagement
- **Edit Rate**: >20% of stories receive community edits
- **Cross-linking**: >80% of stories have wiki-style links
- **Discussions**: >50% of stories have comments
- **Collaboration**: >30% of content has multiple contributors

### Information Quality
- **Completeness**: >90% of stories have full metadata
- **Accuracy**: <5% content requires correction
- **Cultural Safety**: 100% elder-approved content properly marked
- **Accessibility**: WCAG 2.1 AA compliance

---

**This wiki-style architecture transforms the Palm Island Community Repository from a story collection into a living, interconnected knowledge base that honors Indigenous data sovereignty while providing world-class information management capabilities.**
