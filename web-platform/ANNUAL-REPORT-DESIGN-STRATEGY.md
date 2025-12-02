# Annual Report Design Strategy
## Palm Island Community Company - Unified Report System

*A comprehensive design approach for management dashboards and public-facing annual reports*

---

## Executive Summary

This document outlines a refined design strategy that creates two distinct but cohesive experiences:

1. **Management Dashboard** (PICC Staff) - Data-rich, functional, efficient
2. **Public Annual Report** (External) - Beautiful, story-driven, immersive

Both share a unified design language while serving different purposes.

---

## Part 1: Design Philosophy

### Inspired by DevTalk Template Principles

The DevTalk template emphasizes:
- **Content over decoration** - Let stories and data speak for themselves
- **Speed and clarity** - No unnecessary visual noise
- **Reading experience** - Comparable to physical books
- **Minimal interactions** - Only essential hover states, no distracting animations

### Adapted for Palm Island Context

We blend this minimalist foundation with:
- **Cultural respect** - Earth tones, organic shapes, space for contemplation
- **Community warmth** - Human faces, quotes, personal stories
- **Data accessibility** - Visual financials anyone can understand
- **Mobile-first** - Many community members access via phones

---

## Part 2: Management Dashboard Design

### Purpose
Enable PICC staff to efficiently manage, generate, and monitor annual reports and related content.

### Design Principles

```
┌─────────────────────────────────────────────────────────────┐
│  EFFICIENCY > AESTHETICS                                     │
│  Information density, quick actions, clear status indicators │
└─────────────────────────────────────────────────────────────┘
```

### Color System (Dashboard)

```css
/* Primary Actions */
--dashboard-primary: #6366F1;      /* Indigo - primary actions */
--dashboard-primary-hover: #4F46E5;

/* Status Colors */
--status-draft: #F59E0B;           /* Amber */
--status-review: #3B82F6;          /* Blue */
--status-published: #10B981;       /* Emerald */
--status-archived: #6B7280;        /* Gray */

/* Background Layers */
--bg-base: #F9FAFB;                /* Light gray base */
--bg-card: #FFFFFF;                /* White cards */
--bg-elevated: #FFFFFF;            /* Elevated elements */

/* Text Hierarchy */
--text-primary: #111827;           /* Near black */
--text-secondary: #6B7280;         /* Medium gray */
--text-muted: #9CA3AF;             /* Light gray */
```

### Dashboard Layout Structure

```
┌──────────────────────────────────────────────────────────────────┐
│ HEADER: Breadcrumbs | Page Title                    [Actions]    │
├──────────────────────────────────────────────────────────────────┤
│                                                                  │
│  ┌─────────┐ ┌─────────┐ ┌─────────┐ ┌─────────┐                │
│  │ METRIC  │ │ METRIC  │ │ METRIC  │ │ METRIC  │   <- Key Stats │
│  │  Card   │ │  Card   │ │  Card   │ │  Card   │                │
│  └─────────┘ └─────────┘ └─────────┘ └─────────┘                │
│                                                                  │
│  ┌────────────────────────────────┐ ┌──────────────────────────┐│
│  │                                │ │                          ││
│  │     MAIN CONTENT AREA          │ │    SIDEBAR               ││
│  │     (Tables, Lists, Forms)     │ │    (Quick Actions,       ││
│  │                                │ │     Filters, Help)       ││
│  │                                │ │                          ││
│  └────────────────────────────────┘ └──────────────────────────┘│
│                                                                  │
└──────────────────────────────────────────────────────────────────┘
```

### Key Dashboard Components

#### 1. Report Status Cards
```tsx
// Compact, scannable status indicators
<div className="grid grid-cols-4 gap-4">
  <StatusCard
    label="Draft Reports"
    count={3}
    icon={FileEdit}
    color="amber"
    action="/picc/reports?status=draft"
  />
  <StatusCard
    label="In Review"
    count={1}
    icon={Eye}
    color="blue"
  />
  <StatusCard
    label="Published"
    count={5}
    icon={CheckCircle}
    color="emerald"
  />
  <StatusCard
    label="This Year's Stories"
    count={34}
    icon={BookOpen}
    color="purple"
  />
</div>
```

#### 2. Financial Alignment Widget
```tsx
// Visual budget tracker aligned with report sections
<FinancialAlignmentWidget>
  <BudgetBar
    category="Youth Programs"
    allocated={150000}
    spent={142500}
    stories={12}  // Stories in this category
  />
  <BudgetBar
    category="Elder Services"
    allocated={200000}
    spent={198000}
    stories={8}
  />
  <BudgetBar
    category="Community Events"
    allocated={75000}
    spent={71200}
    stories={15}
  />
</FinancialAlignmentWidget>
```

#### 3. Report Builder Interface
```
┌─────────────────────────────────────────────────────────────┐
│ REPORT BUILDER                                              │
├─────────────────────────────────────────────────────────────┤
│                                                             │
│ [Sections]  [Stories]  [Financials]  [Preview]              │
│                                                             │
│ ┌─────────────────────┐  ┌────────────────────────────────┐│
│ │ AVAILABLE SECTIONS  │  │ REPORT STRUCTURE               ││
│ │                     │  │                                ││
│ │ ☐ Executive Summary │  │ 1. Cover Page          [drag]  ││
│ │ ☐ Financial Overview│  │ 2. Executive Summary   [drag]  ││
│ │ ☐ Program Highlights│  │ 3. Our Impact          [drag]  ││
│ │ ☐ Community Stories │  │ 4. Community Voices    [drag]  ││
│ │ ☐ Looking Forward   │  │ 5. Financial Summary   [drag]  ││
│ │                     │  │ 6. Acknowledgments     [drag]  ││
│ └─────────────────────┘  └────────────────────────────────┘│
│                                                             │
└─────────────────────────────────────────────────────────────┘
```

---

## Part 3: Public Annual Report Design

### Purpose
Tell the story of Palm Island's year in an engaging, accessible, beautiful format that honors community voices.

### Design Principles

```
┌─────────────────────────────────────────────────────────────┐
│  STORY > DATA  |  PEOPLE > PROCESS  |  EMOTION > INFORMATION│
└─────────────────────────────────────────────────────────────┘
```

### Color System (Public Report)

```css
/* Primary Palette - Earth & Ocean */
--report-earth: #8B5A2B;           /* Warm brown - connection to land */
--report-ocean: #1E3A5F;           /* Deep blue - Torres Strait waters */
--report-sky: #87CEEB;             /* Light blue - hope, openness */
--report-sand: #F5E6D3;            /* Warm sand - warmth, welcome */

/* Accent Colors */
--accent-sunrise: #E85D04;         /* Orange - energy, new beginnings */
--accent-growth: #2D6A4F;          /* Forest green - growth, healing */
--accent-coral: #FF6B6B;           /* Coral - community, heart */

/* Neutral Backgrounds */
--bg-light: #FEFDFB;               /* Warm white */
--bg-section: #F8F6F3;             /* Off-white sections */
--bg-dark: #1A1A1A;                /* Rich black for contrast */

/* Typography */
--text-heading: #1A1A1A;           /* Near black */
--text-body: #4A4A4A;              /* Soft black - easier reading */
--text-caption: #7A7A7A;           /* Gray for metadata */
```

### Typography Scale

```css
/* Headings - Clean, authoritative */
font-family: 'Inter', system-ui, sans-serif;

--h1: 3.5rem / 1.1;    /* Hero titles */
--h2: 2.5rem / 1.2;    /* Section titles */
--h3: 1.75rem / 1.3;   /* Subsections */
--h4: 1.25rem / 1.4;   /* Card titles */

/* Body - Optimized for reading */
--body-large: 1.25rem / 1.7;   /* Featured paragraphs */
--body: 1.125rem / 1.8;        /* Standard content */
--body-small: 1rem / 1.6;      /* Captions, metadata */

/* Special */
--quote: 1.5rem / 1.5;         /* Pull quotes - italic */
--stat: 4rem / 1;              /* Big numbers */
```

### Public Report Page Structure

```
┌─────────────────────────────────────────────────────────────────┐
│                                                                 │
│                        HERO SECTION                             │
│                                                                 │
│              Palm Island Community Company                      │
│                   Annual Report 2024                            │
│                                                                 │
│              "Our Community, Our Future, Our Way"               │
│                                                                 │
│                    [↓ Scroll to explore]                        │
│                                                                 │
├─────────────────────────────────────────────────────────────────┤
│                                                                 │
│  ┌─────────────────────────────────────────────────────────┐   │
│  │                  IMPACT AT A GLANCE                      │   │
│  │                                                          │   │
│  │    ┌────┐    ┌────┐    ┌────┐    ┌────┐                 │   │
│  │    │850+│    │ 45 │    │ 48 │    │2.4K│                 │   │
│  │    │    │    │    │    │    │    │    │                 │   │
│  │    │ppl │    │team│    │svcs│    │hrs │                 │   │
│  │    └────┘    └────┘    └────┘    └────┘                 │   │
│  └─────────────────────────────────────────────────────────┘   │
│                                                                 │
├─────────────────────────────────────────────────────────────────┤
│                                                                 │
│  MESSAGE FROM OUR LEADERS                                       │
│                                                                 │
│  ┌──────────────────────┐  ┌──────────────────────┐            │
│  │  [Photo]             │  │                      │            │
│  │                      │  │  "This year showed   │            │
│  │  Rachel Atkinson     │  │   what our community │            │
│  │  CEO                 │  │   can achieve..."    │            │
│  └──────────────────────┘  └──────────────────────┘            │
│                                                                 │
├─────────────────────────────────────────────────────────────────┤
│                                                                 │
│  OUR YEAR IN STORIES                                            │
│                                                                 │
│  ┌─────────────────────────────────────────────────────────┐   │
│  │                                                          │   │
│  │  "When the cyclone hit, we lost everything.             │   │
│  │   But this community - we came together like            │   │
│  │   family always does."                                   │   │
│  │                                                          │   │
│  │                           — Aunty Mary, Elder           │   │
│  │                                                          │   │
│  └─────────────────────────────────────────────────────────┘   │
│                                                                 │
│  [Story cards in masonry grid...]                               │
│                                                                 │
├─────────────────────────────────────────────────────────────────┤
│                                                                 │
│  WHERE YOUR SUPPORT GOES                                        │
│                                                                 │
│  ┌─────────────────────────────────────────────────────────┐   │
│  │                                                          │   │
│  │     [Interactive pie/donut chart]                       │   │
│  │                                                          │   │
│  │  If you gave $1, here's how it was spent:               │   │
│  │                                                          │   │
│  │  ████████░░  Youth Programs         42¢                 │   │
│  │  ██████░░░░  Elder Services         28¢                 │   │
│  │  ████░░░░░░  Community Events       18¢                 │   │
│  │  ██░░░░░░░░  Administration         12¢                 │   │
│  │                                                          │   │
│  └─────────────────────────────────────────────────────────┘   │
│                                                                 │
├─────────────────────────────────────────────────────────────────┤
│                                                                 │
│  LOOKING FORWARD                                                │
│                                                                 │
│  [Timeline of upcoming initiatives...]                          │
│                                                                 │
├─────────────────────────────────────────────────────────────────┤
│                                                                 │
│  THANK YOU                                                      │
│                                                                 │
│  [Acknowledgments, partners, funders...]                        │
│                                                                 │
└─────────────────────────────────────────────────────────────────┘
```

---

## Part 4: Financial Alignment Strategy

### The Problem
Financial data often feels disconnected from impact stories.

### The Solution
**Contextual Financials** - Every dollar tells a story.

### Implementation Approaches

#### 1. The Dollar Breakdown
```tsx
// Show where each dollar goes - highly accessible
<DollarBreakdown>
  <Segment
    label="Youth Programs"
    cents={42}
    color="var(--accent-growth)"
    story="This funded 12 youth leadership workshops"
  />
  <Segment
    label="Elder Services"
    cents={28}
    color="var(--report-earth)"
    story="Including weekly Elder gatherings"
  />
  {/* ... */}
</DollarBreakdown>
```

#### 2. Story-Linked Budgets
```tsx
// Connect spending to actual stories
<BudgetStoryLink
  category="Youth Programs"
  spent={142500}
  impact={
    <div>
      <p>This funding enabled:</p>
      <ul>
        <li>12 leadership workshops (340 participants)</li>
        <li>Summer camp program (85 youth)</li>
        <li>School support program (120 students)</li>
      </ul>
      <LinkedStory id="youth-camp-story" />
    </div>
  }
/>
```

#### 3. Visual Budget Flow
```
INCOME                           PROGRAMS                    IMPACT
────────                         ────────                    ──────

Government    ─────┐
Grants              │
$450,000            │
                    │──► Youth Programs ────► 340 young people
Donations     ─────┤    $142,500              supported
$125,000            │
                    │──► Elder Services ────► 52 weekly
Corporate     ─────┤    $198,000              gatherings
Partners            │
$85,000             │──► Community ─────────► 15 major events
                    │    Events               hosted
                    │    $71,200
                    │
                    └──► Operations ────────► 45 staff
                         $248,300              employed
```

#### 4. Interactive Financial Dashboard (Public)
```tsx
<PublicFinancialExplorer>
  {/* Clickable categories reveal stories */}
  <CategoryRing
    data={financialData}
    onCategoryClick={(category) => {
      // Show stories funded by this category
      showStoriesModal(category);
    }}
  />

  {/* Animated counters */}
  <AnimatedStat
    value={660000}
    label="Total Budget"
    prefix="$"
    duration={2000}
  />
</PublicFinancialExplorer>
```

---

## Part 5: Component Library

### Shared Components (Both Contexts)

```tsx
// Base button variants
<Button variant="primary">Primary Action</Button>
<Button variant="secondary">Secondary</Button>
<Button variant="ghost">Ghost Button</Button>

// Status badges
<StatusBadge status="draft" />
<StatusBadge status="published" />

// Cards
<Card padding="lg" shadow="md">
  <CardHeader>Title</CardHeader>
  <CardContent>Content</CardContent>
</Card>
```

### Dashboard-Specific Components

```tsx
// Data tables with sorting/filtering
<DataTable
  data={reports}
  columns={columns}
  sortable
  filterable
  pagination
/>

// Metric cards
<MetricCard
  icon={Users}
  value={850}
  label="Community Members"
  trend={+12}
  trendLabel="vs last year"
/>

// Quick action buttons
<QuickActions>
  <QuickAction icon={Plus} label="New Report" href="/new" />
  <QuickAction icon={Upload} label="Import" onClick={handleImport} />
</QuickActions>
```

### Public Report Components

```tsx
// Hero section with parallax
<ReportHero
  title="Annual Report 2024"
  subtitle="Our Community, Our Future, Our Way"
  backgroundImage="/images/palm-island-aerial.jpg"
  scrollIndicator
/>

// Quote showcase
<QuoteShowcase
  quote="This year showed what our community can achieve when we work together."
  author="Rachel Atkinson"
  role="CEO"
  image="/images/rachel.jpg"
/>

// Impact stat with animation
<ImpactStat
  value={850}
  suffix="+"
  label="Community members served"
  icon={Users}
  animateOnScroll
/>

// Story card
<StoryCard
  title="Aunty Mary's Story"
  excerpt="When the cyclone hit, we lost everything..."
  author="Aunty Mary"
  category="Elder Story"
  image="/images/aunty-mary.jpg"
  featured
/>

// Financial visual
<FinancialDonut
  data={budgetCategories}
  interactive
  showLegend
  centerLabel="$660K Total"
/>
```

---

## Part 6: Animation & Interaction Guidelines

### Dashboard (Minimal)
- **Transitions**: 150ms ease-out for all state changes
- **Loading**: Skeleton screens, no spinners for < 300ms loads
- **Feedback**: Subtle color/shadow changes on hover
- **No scroll animations** - Information should be immediately accessible

### Public Report (Purposeful)
- **Scroll reveals**: Fade-in + subtle slide-up (300ms, staggered)
- **Number counters**: Animate to final value over 2 seconds
- **Parallax**: Subtle (0.1-0.3 ratio) on hero images only
- **Charts**: Draw-in animation on scroll into view
- **Quotes**: Fade in with slight scale (1.02 → 1)

```tsx
// Scroll reveal wrapper
<ScrollReveal
  animation="fadeUp"
  delay={index * 100}
  threshold={0.2}
>
  <StoryCard {...story} />
</ScrollReveal>

// Animated counter
<AnimatedCounter
  from={0}
  to={850}
  duration={2000}
  easing="easeOut"
  formatValue={(v) => `${v}+`}
/>
```

---

## Part 7: Accessibility Requirements

### WCAG 2.2 AA Compliance

```css
/* Minimum contrast ratios */
--contrast-text: 4.5:1;           /* Normal text */
--contrast-large: 3:1;            /* Large text (18px+) */
--contrast-ui: 3:1;               /* UI components */

/* Focus indicators */
--focus-ring: 3px solid #4F46E5;
--focus-offset: 2px;
```

### Key Requirements

1. **Color Independence**
   - Never use color alone to convey meaning
   - Add icons, patterns, or text labels

2. **Keyboard Navigation**
   - All interactive elements focusable
   - Visible focus indicators
   - Logical tab order

3. **Screen Readers**
   - Semantic HTML structure
   - ARIA labels where needed
   - Alt text for all images
   - Chart data in accessible tables

4. **Motion Preferences**
   ```css
   @media (prefers-reduced-motion: reduce) {
     * {
       animation-duration: 0.01ms !important;
       transition-duration: 0.01ms !important;
     }
   }
   ```

---

## Part 8: Implementation Roadmap

### Phase 1: Foundation (Week 1-2)
- [ ] Create shared design tokens (colors, typography, spacing)
- [ ] Build base component library
- [ ] Set up Tailwind theme configuration
- [ ] Create layout templates

### Phase 2: Dashboard Enhancement (Week 3-4)
- [ ] Redesign report management pages
- [ ] Build financial alignment widgets
- [ ] Create report builder interface
- [ ] Add quick action patterns

### Phase 3: Public Report Templates (Week 5-6)
- [ ] Design hero section variants
- [ ] Build story showcase components
- [ ] Create financial visualization components
- [ ] Implement scroll animations

### Phase 4: Financial Integration (Week 7-8)
- [ ] Connect budget data to stories
- [ ] Build dollar breakdown component
- [ ] Create interactive financial explorer
- [ ] Add contextual story links

### Phase 5: Polish & Testing (Week 9-10)
- [ ] Accessibility audit and fixes
- [ ] Mobile optimization
- [ ] Performance optimization
- [ ] User testing with PICC staff

---

## Part 9: Example Page Implementations

### Dashboard: Report Overview Page

```tsx
export default function ReportsOverviewPage() {
  return (
    <DashboardLayout>
      {/* Header */}
      <PageHeader
        title="Annual Reports"
        description="Manage and generate community reports"
        actions={
          <Button href="/picc/report-generator">
            <Plus className="w-4 h-4 mr-2" />
            New Report
          </Button>
        }
      />

      {/* Status Overview */}
      <div className="grid grid-cols-4 gap-4 mb-8">
        <MetricCard icon={FileEdit} value={3} label="Drafts" color="amber" />
        <MetricCard icon={Eye} value={1} label="In Review" color="blue" />
        <MetricCard icon={CheckCircle} value={5} label="Published" color="green" />
        <MetricCard icon={BookOpen} value={34} label="Stories Ready" color="purple" />
      </div>

      {/* Financial Alignment */}
      <Card className="mb-8">
        <CardHeader>
          <h2>Budget & Story Alignment</h2>
          <p className="text-sm text-gray-500">
            Ensure each program area has representative stories
          </p>
        </CardHeader>
        <CardContent>
          <FinancialAlignmentWidget data={budgetData} stories={storyData} />
        </CardContent>
      </Card>

      {/* Reports Table */}
      <Card>
        <DataTable
          data={reports}
          columns={[
            { key: 'title', label: 'Report' },
            { key: 'year', label: 'Year' },
            { key: 'status', label: 'Status', render: StatusBadge },
            { key: 'stories', label: 'Stories' },
            { key: 'actions', label: '', render: ActionMenu },
          ]}
        />
      </Card>
    </DashboardLayout>
  );
}
```

### Public: Annual Report Page

```tsx
export default function PublicAnnualReport({ report }) {
  return (
    <PublicReportLayout>
      {/* Hero */}
      <ReportHero
        title={report.title}
        subtitle={report.theme}
        year={report.year}
        backgroundImage={report.coverImage}
      />

      {/* Impact Stats - Animated on scroll */}
      <Section background="gradient" className="py-24">
        <div className="grid grid-cols-4 gap-8 max-w-5xl mx-auto">
          {report.impactStats.map((stat, i) => (
            <ScrollReveal key={stat.label} delay={i * 150}>
              <ImpactStat
                value={stat.value}
                label={stat.label}
                icon={stat.icon}
                animateOnScroll
              />
            </ScrollReveal>
          ))}
        </div>
      </Section>

      {/* Leadership Message */}
      <Section className="py-20">
        <LeadershipMessage
          leader={report.ceoMessage}
          image="/images/rachel-atkinson.jpg"
        />
      </Section>

      {/* Featured Stories */}
      <Section background="light" className="py-20">
        <SectionHeader
          title="Community Voices"
          subtitle="Stories from our year"
        />
        <div className="space-y-16">
          {report.featuredStories.map((story, i) => (
            <ScrollReveal key={story.id} delay={i * 200}>
              <FeaturedStoryBlock story={story} reverse={i % 2 === 1} />
            </ScrollReveal>
          ))}
        </div>
      </Section>

      {/* Financial Section */}
      <Section className="py-20">
        <SectionHeader
          title="Where Your Support Goes"
          subtitle="Every dollar makes a difference"
        />
        <div className="grid md:grid-cols-2 gap-12 items-center">
          <FinancialDonut data={report.financials} interactive />
          <DollarBreakdown data={report.financials} />
        </div>
      </Section>

      {/* More Stories Grid */}
      <Section background="light" className="py-20">
        <SectionHeader title="More Stories" />
        <div className="grid md:grid-cols-3 gap-6">
          {report.moreStories.map((story, i) => (
            <ScrollReveal key={story.id} delay={i * 100}>
              <StoryCard story={story} />
            </ScrollReveal>
          ))}
        </div>
      </Section>

      {/* Looking Forward */}
      <Section background="dark" className="py-24 text-white">
        <SectionHeader
          title="Looking Forward"
          subtitle="Our vision for the coming year"
          light
        />
        <FutureTimeline items={report.futureInitiatives} />
      </Section>

      {/* Thank You */}
      <Section className="py-20 text-center">
        <h2 className="text-4xl font-bold mb-8">Thank You</h2>
        <p className="text-xl text-gray-600 max-w-2xl mx-auto mb-12">
          {report.acknowledgments}
        </p>
        <PartnerLogos partners={report.partners} />
      </Section>
    </PublicReportLayout>
  );
}
```

---

## Part 10: File Structure

```
app/
├── picc/                           # Management Dashboard
│   ├── annual-reports/
│   │   ├── page.tsx               # Reports list/overview
│   │   ├── [id]/
│   │   │   ├── page.tsx           # Report detail/edit
│   │   │   ├── preview/page.tsx   # Preview before publish
│   │   │   └── financials/page.tsx # Financial alignment
│   │   └── new/page.tsx           # Create new report
│   ├── report-generator/
│   │   └── page.tsx               # Report builder wizard
│   └── layout.tsx                 # Dashboard layout
│
├── reports/                        # Public Annual Reports
│   ├── page.tsx                   # Public reports archive
│   ├── [year]/
│   │   └── page.tsx               # Public report view
│   └── layout.tsx                 # Public report layout
│
components/
├── dashboard/                      # Dashboard-specific
│   ├── MetricCard.tsx
│   ├── DataTable.tsx
│   ├── StatusBadge.tsx
│   ├── FinancialAlignmentWidget.tsx
│   └── QuickActions.tsx
│
├── report/                         # Public report components
│   ├── ReportHero.tsx
│   ├── ImpactStat.tsx
│   ├── StoryCard.tsx
│   ├── QuoteShowcase.tsx
│   ├── FinancialDonut.tsx
│   ├── DollarBreakdown.tsx
│   ├── ScrollReveal.tsx
│   └── LeadershipMessage.tsx
│
├── shared/                         # Shared components
│   ├── Button.tsx
│   ├── Card.tsx
│   ├── Section.tsx
│   └── AnimatedCounter.tsx
│
lib/
├── design-tokens.ts               # Shared design values
├── animations.ts                  # Animation configs
└── hooks/
    ├── useScrollReveal.ts
    └── useAnimatedCounter.ts
```

---

## Conclusion

This design strategy creates a clear separation between:

1. **Management Experience** - Efficient, data-dense, action-oriented
2. **Public Experience** - Beautiful, story-driven, emotionally engaging

Both share foundational design tokens and accessibility standards while serving their distinct purposes. The financial alignment strategy ensures that budget data is always connected to human impact stories, making reports both accountable and compelling.

The key innovation is **contextual financials** - every dollar shown is linked to stories and outcomes, making financial reporting accessible and meaningful to all audiences.

---

*Document Version: 1.0*
*Created: November 2024*
*For: Palm Island Community Company*
