# Palm Island Story Server - Design System & Style Guide

## 🎨 Design Philosophy

**Mission**: Create a dignified, modern platform that honors Palm Island voices and stories with world-class design.

**Inspiration Sources**:
- **Medium** - Beautiful reading experience, typography-first
- **The Moth** - Story-centric, emotional design
- **Linear** - Clean, fast, modern dashboard UX
- **Notion** - Sidebar navigation, intuitive hierarchy
- **National Geographic** - Powerful imagery, respectful storytelling

---

## 🎯 Core Design Principles

1. **Dignity First** - Every story deserves premium presentation
2. **Voice Over Noise** - Minimal UI, maximum story
3. **Cultural Respect** - Warm, earthy, authentic
4. **Modern & Fast** - Clean lines, instant interactions
5. **Accessible Always** - WCAG AAA standards

---

## 🌈 Color Palette

### Primary Colors
```css
--ocean-deep:     #0A2540;  /* Deep navy - authority, trust */
--ocean-medium:   #1E3A5F;  /* Medium blue - navigation */
--ocean-light:    #3B5B7F;  /* Light blue - accents */
```

### Accent Colors
```css
--coral-warm:     #FF6B6B;  /* Warm coral - calls to action */
--sunset-orange:  #FFA07A;  /* Sunset - highlights */
--sand-gold:      #F5D76E;  /* Golden sand - success states */
```

### Earth Tones
```css
--earth-dark:     #2D3436;  /* Almost black - primary text */
--earth-medium:   #636E72;  /* Gray - secondary text */
--earth-light:    #DFE6E9;  /* Light gray - borders */
--earth-bg:       #F8F9FA;  /* Off-white - backgrounds */
```

### Semantic Colors
```css
--success:        #10B981;  /* Green */
--warning:        #F59E0B;  /* Amber */
--error:          #EF4444;  /* Red */
--info:           #3B82F6;  /* Blue */
```

---

## 📝 Typography

### Font Stack
```css
/* Display & Headings */
--font-display: 'Cal Sans', 'Inter', -apple-system, sans-serif;

/* Body Text */
--font-body: 'Inter', -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif;

/* Mono/Code */
--font-mono: 'JetBrains Mono', 'Fira Code', monospace;
```

### Type Scale
```css
--text-xs:    0.75rem;   /* 12px */
--text-sm:    0.875rem;  /* 14px */
--text-base:  1rem;      /* 16px */
--text-lg:    1.125rem;  /* 18px */
--text-xl:    1.25rem;   /* 20px */
--text-2xl:   1.5rem;    /* 24px */
--text-3xl:   1.875rem;  /* 30px */
--text-4xl:   2.25rem;   /* 36px */
--text-5xl:   3rem;      /* 48px */
--text-6xl:   3.75rem;   /* 60px */
```

### Font Weights
```css
--font-normal:    400;
--font-medium:    500;
--font-semibold:  600;
--font-bold:      700;
```

### Line Heights
```css
--leading-tight:   1.25;
--leading-snug:    1.375;
--leading-normal:  1.5;
--leading-relaxed: 1.625;
--leading-loose:   2;
```

---

## 📏 Spacing System

Based on 4px base unit:

```css
--space-0:   0;
--space-1:   0.25rem;  /* 4px */
--space-2:   0.5rem;   /* 8px */
--space-3:   0.75rem;  /* 12px */
--space-4:   1rem;     /* 16px */
--space-5:   1.25rem;  /* 20px */
--space-6:   1.5rem;   /* 24px */
--space-8:   2rem;     /* 32px */
--space-10:  2.5rem;   /* 40px */
--space-12:  3rem;     /* 48px */
--space-16:  4rem;     /* 64px */
--space-20:  5rem;     /* 80px */
--space-24:  6rem;     /* 96px */
```

---

## 🎭 Component Patterns

### Sidebar Navigation
```
- Fixed left sidebar (280px wide)
- Dark background (ocean-deep)
- Logo at top
- Navigation groups with icons
- Active state: coral-warm left border
- Hover: subtle ocean-light background
- Collapsed state on mobile
```

### Story Cards
```
- Large featured image (16:9 ratio)
- Storyteller avatar overlay (bottom-left)
- Category tag (top-right)
- Title: text-2xl, font-bold
- Excerpt: text-base, earth-medium
- Read time + date (text-sm)
- Hover: Subtle lift + shadow
```

### Story Reading View
```
- Max width: 680px (optimal reading)
- Text: text-lg, leading-relaxed
- Hero image: Full-width, 60vh
- Pull quotes: Larger text, coral-warm accent
- Author card: Fixed right sidebar (desktop)
- Progress indicator: Top bar
```

### Admin Dashboard
```
- Stat cards: 4-column grid
- Big numbers: text-4xl, font-bold
- Trend indicators: Arrows + percentages
- Recent activity: Timeline design
- Quick actions: Icon + label buttons
```

---

## 🎨 UI Elements

### Buttons
```css
/* Primary */
background: coral-warm
color: white
padding: 12px 24px
border-radius: 8px
font-weight: 600
transition: all 150ms

/* Secondary */
background: transparent
border: 2px solid ocean-medium
color: ocean-medium

/* Ghost */
background: transparent
color: earth-medium
hover: background earth-light
```

### Input Fields
```css
background: white
border: 1.5px solid earth-light
border-radius: 8px
padding: 12px 16px
font-size: 16px
focus: border-color ocean-medium, ring coral-warm
```

### Cards
```css
background: white
border-radius: 12px
box-shadow: 0 1px 3px rgba(0,0,0,0.1)
padding: 24px
hover: box-shadow 0 4px 12px rgba(0,0,0,0.15)
transition: all 200ms
```

---

## 📐 Layout System

### Dashboard Layout
```
┌────────────────────────────────────┐
│  SIDEBAR │  MAIN CONTENT          │
│  (280px) │                        │
│          │  HEADER                │
│  Nav     │  ────────────────────  │
│  Items   │                        │
│          │  PAGE CONTENT          │
│          │                        │
│          │                        │
└────────────────────────────────────┘
```

### Story Reading Layout
```
┌────────────────────────────────────┐
│         HERO IMAGE (Full width)    │
├────────────────────────────────────┤
│  ┌──────────────┐  ┌──────────┐   │
│  │   CONTENT    │  │ AUTHOR   │   │
│  │   (680px)    │  │ SIDEBAR  │   │
│  │              │  │ (280px)  │   │
│  │   Story      │  │          │   │
│  │   Text       │  │ Related  │   │
│  │              │  │ Stories  │   │
│  └──────────────┘  └──────────┘   │
└────────────────────────────────────┘
```

---

## 🎬 Animations

### Micro-interactions
```css
/* Page transitions */
transition: opacity 200ms, transform 200ms

/* Card hover */
transform: translateY(-4px)
transition: all 200ms ease-out

/* Button press */
transform: scale(0.98)
transition: transform 100ms

/* Sidebar toggle */
transform: translateX(-280px)
transition: transform 300ms cubic-bezier(0.4, 0, 0.2, 1)
```

---

## 🌊 Inspiration Examples

### Homepage
- **Hero**: Full-screen story grid, masonry layout
- **Search**: Prominent, always accessible
- **Featured**: Large carousel with storyteller quotes

### Story Page
- **Hero Image**: 70vh, storyteller portrait
- **Typography**: Large, readable (20px body)
- **Media**: Audio player, image galleries inline
- **Related**: Sidebar with 3-4 related stories

### Admin
- **Dashboard**: Stats at top, activity timeline
- **Forms**: Single column, clear labels, helpful hints
- **Tables**: Clean, sortable, with quick actions

---

## 🎯 Implementation Priority

### Phase 1: Foundation (Week 1)
1. Install Tailwind + Custom CSS variables
2. Create layout components (Sidebar, Header, Container)
3. Build component library (Button, Card, Input)
4. Typography system

### Phase 2: Core Pages (Week 2)
1. Homepage redesign
2. Story reading experience
3. Storyteller profiles
4. Search results page

### Phase 3: Admin (Week 3)
1. Dashboard redesign
2. Admin forms
3. Data tables
4. Upload interfaces

### Phase 4: Polish (Week 4)
1. Animations & transitions
2. Loading states
3. Empty states
4. Error handling
5. Mobile responsive refinements

---

## 📱 Responsive Breakpoints

```css
--screen-sm:  640px;   /* Mobile landscape */
--screen-md:  768px;   /* Tablet */
--screen-lg:  1024px;  /* Desktop */
--screen-xl:  1280px;  /* Large desktop */
--screen-2xl: 1536px;  /* Extra large */
```

### Mobile Adaptations
- Sidebar: Collapsible overlay
- Story cards: Single column
- Reading view: Full-width, no sidebar
- Admin: Stacked stats, simplified tables

---

## ♿ Accessibility

- Minimum contrast ratio: 4.5:1 (WCAG AA)
- Focus indicators: 3px coral-warm outline
- Keyboard navigation: Logical tab order
- ARIA labels: All interactive elements
- Alt text: All images (storyteller names)
- Screen reader: Semantic HTML

---

## 🚀 Performance Budget

- First Contentful Paint: < 1.5s
- Time to Interactive: < 3s
- Largest Contentful Paint: < 2.5s
- Cumulative Layout Shift: < 0.1
- Image formats: WebP with JPEG fallback
- Font loading: Swap strategy

---

This is a **living document** - update as design evolves!
