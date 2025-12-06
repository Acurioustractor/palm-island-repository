# PICC Public Website - Brand & Style Guide

## Design Philosophy

**"Community Stories Through Elegant Design"**

Our design system embodies clarity, respect, and accessibility. Inspired by minimalist principles, we let PICC's powerful community stories and achievements shine through generous whitespace, purposeful motion, and content-first layouts.

### Core Principles

1. **Clarity Over Complexity** - Every element serves the content
2. **Generous Whitespace** - Breathing room creates focus and elegance
3. **Content-First** - Design supports, never overpowers, community stories
4. **Purposeful Motion** - Animations guide attention, never distract
5. **Accessible by Default** - WCAG 2.1 AA compliance minimum
6. **Mobile-First** - Responsive design that works beautifully on all devices

---

## Color System

### Primary Palette

**PICC Blue** - Trust, Community, Stability
- `blue-50`: #eff6ff - Backgrounds, subtle accents
- `blue-100`: #dbeafe - Light backgrounds
- `blue-500`: #3b82f6 - Primary actions, links
- `blue-600`: #2563eb - Primary button default
- `blue-700`: #1d4ed8 - Primary button hover
- `blue-900`: #1e3a8a - Headlines, emphasis

**PICC Purple** - Innovation, Growth, Vision
- `purple-50`: #faf5ff - Backgrounds
- `purple-500`: #a855f7 - Accents
- `purple-600`: #9333ea - Gradients, highlights
- `purple-700`: #7e22ce - Hover states

**Usage**: Primary gradient `from-blue-600 to-purple-600` for hero sections and CTAs

### Secondary Palette

**Success Green** - Health, Services, Growth
- `green-50`: #f0fdf4 - Backgrounds
- `green-500`: #22c55e - Success states
- `green-600`: #16a34a - Secondary CTAs
- `green-700`: #15803d - Hover states

**Warm Orange** - Community, Energy, Action
- `orange-50`: #fff7ed - Backgrounds
- `orange-500`: #f97316 - Accents, notifications
- `orange-600`: #ea580c - Interactive elements
- `orange-700`: #c2410c - Hover states

**Impact Amber** - Heritage, Foundation, History
- `amber-50`: #fffbeb - Timeline backgrounds
- `amber-500`: #f59e0b - Timeline markers
- `amber-600`: #d97706 - Historical era highlights

### Neutral Palette

**Sophisticated Grays** - Body text, backgrounds, UI elements
- `white`: #ffffff - Page backgrounds
- `gray-50`: #f9fafb - Section backgrounds
- `gray-100`: #f3f4f6 - Card backgrounds
- `gray-200`: #e5e7eb - Borders, dividers
- `gray-600`: #4b5563 - Secondary text
- `gray-700`: #374151 - Body text
- `gray-900`: #111827 - Headlines, emphasis
- `black`: #000000 - Reserved for critical emphasis only

### Gradient Recipes

```css
/* Primary Hero Gradient */
.hero-gradient {
  background: linear-gradient(135deg, #2563eb 0%, #9333ea 100%);
}

/* Success Gradient */
.success-gradient {
  background: linear-gradient(135deg, #16a34a 0%, #059669 100%);
}

/* Warm Gradient */
.warm-gradient {
  background: linear-gradient(135deg, #ea580c 0%, #dc2626 100%);
}

/* Subtle Background Gradient */
.subtle-bg {
  background: linear-gradient(135deg, #eff6ff 0%, #faf5ff 50%, #fff7ed 100%);
}
```

---

## Typography

### Font Families

**Primary**: System font stack for optimal performance
```css
font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, "Helvetica Neue", Arial, sans-serif;
```

**Fallback**: Tailwind's `font-sans` utility class

### Type Scale

| Element | Size | Weight | Line Height | Letter Spacing | Usage |
|---------|------|--------|-------------|----------------|-------|
| **Hero H1** | 4xl-6xl (36-60px) | Bold (700) | 1.1 | -0.02em | Homepage hero, major landing pages |
| **Section H2** | 3xl-4xl (30-36px) | Bold (700) | 1.2 | -0.01em | Section headings |
| **Card H3** | xl-2xl (20-24px) | Bold (700) | 1.3 | Normal | Card titles, subsections |
| **Body Large** | lg (18px) | Normal (400) | 1.7 | Normal | Intro paragraphs, important text |
| **Body** | base (16px) | Normal (400) | 1.75 | Normal | Standard body copy |
| **Body Small** | sm (14px) | Normal (400) | 1.6 | Normal | Captions, metadata |
| **Label** | sm (14px) | Medium (500) | 1.4 | 0.025em | Form labels, tags |
| **Button** | base (16px) | Semibold (600) | 1.5 | 0.01em | CTAs, buttons |

### Typography Guidelines

1. **Headlines**:
   - Use `font-bold` (700) for all headings
   - Add generous bottom margin: `mb-4` for H3, `mb-6` for H2, `mb-8` for H1
   - Text color: `text-gray-900` default, `text-white` on colored backgrounds

2. **Body Text**:
   - Use `text-gray-700` for primary body text
   - Use `text-gray-600` for secondary/supporting text
   - Line height minimum `leading-relaxed` (1.75) for readability
   - Max width `max-w-3xl` for long-form content (prevents eye strain)

3. **Links**:
   - Color: `text-blue-600 hover:text-blue-700`
   - Underline on hover: `hover:underline`
   - Visited: No special styling (maintains consistency)

4. **Emphasis**:
   - Bold: `font-semibold` (600) for inline emphasis
   - Strong: `font-bold` (700) for critical emphasis
   - Avoid italics for long text (accessibility)

---

## Spacing System

### Scale

Based on Tailwind's default scale (multiples of 0.25rem = 4px):

| Token | Value | Usage |
|-------|-------|-------|
| `space-0` | 0 | No spacing |
| `space-2` | 0.5rem (8px) | Tight spacing (icon + text) |
| `space-3` | 0.75rem (12px) | Small gaps |
| `space-4` | 1rem (16px) | Default component padding |
| `space-6` | 1.5rem (24px) | Card internal padding |
| `space-8` | 2rem (32px) | Section element spacing |
| `space-12` | 3rem (48px) | Section top/bottom padding |
| `space-16` | 4rem (64px) | Major section spacing |
| `space-20` | 5rem (80px) | Extra large section spacing |
| `space-24` | 6rem (96px) | Hero section padding |

### Spacing Recipes

**Card Padding**: `p-6` (24px) for standard cards, `p-8` (32px) for feature cards

**Section Padding**:
- Vertical: `py-16` (64px) desktop, `py-12` (48px) mobile
- Horizontal: `px-4 sm:px-6 lg:px-8` (responsive container padding)

**Element Spacing**:
- Between paragraphs: `space-y-4` (16px)
- Between sections: `space-y-16` (64px)
- Between cards in grid: `gap-8` (32px)

**Container Max Width**: `max-w-7xl` (1280px) for content, `max-w-3xl` (768px) for text

---

## Layout Patterns

### Container System

```tsx
// Full-width section with contained content
<section className="w-full py-16 bg-gray-50">
  <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
    {/* Content */}
  </div>
</section>

// Full-width colored background with gradient
<section className="w-full py-20 bg-gradient-to-br from-blue-600 to-purple-600">
  <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
    {/* Content */}
  </div>
</section>

// Text-focused narrow container
<div className="max-w-3xl mx-auto px-6">
  {/* Long-form text content */}
</div>
```

### Grid Patterns

**2-Column Content**:
```tsx
<div className="grid md:grid-cols-2 gap-8 items-center">
  <div>{/* Text content */}</div>
  <div>{/* Image or visual */}</div>
</div>
```

**3-Column Cards**:
```tsx
<div className="grid md:grid-cols-3 gap-8">
  {/* Card components */}
</div>
```

**4-Column Stats**:
```tsx
<div className="grid grid-cols-2 md:grid-cols-4 gap-6">
  {/* Stat components */}
</div>
```

**Masonry Gallery** (for images):
```tsx
<div className="columns-2 md:columns-3 lg:columns-4 gap-4">
  {/* Image cards with automatic flow */}
</div>
```

---

## Component Library

### Buttons

**Primary Button** (Main CTAs):
```tsx
<button className="px-8 py-4 bg-gradient-to-r from-blue-600 to-purple-600 text-white rounded-lg hover:from-blue-700 hover:to-purple-700 transition-all font-semibold text-lg shadow-lg hover:shadow-xl">
  Explore Timeline
</button>
```

**Secondary Button** (Alternative actions):
```tsx
<button className="px-6 py-3 bg-white text-blue-600 border-2 border-blue-600 rounded-lg hover:bg-blue-50 transition-colors font-semibold">
  Learn More
</button>
```

**Ghost Button** (Subtle actions):
```tsx
<button className="px-6 py-3 text-gray-700 hover:bg-gray-100 rounded-lg transition-colors font-medium">
  View Details
</button>
```

**Icon Button** (Navigation, close):
```tsx
<button className="p-2 text-gray-600 hover:bg-gray-100 rounded-lg transition-colors">
  <Icon className="w-5 h-5" />
</button>
```

### Cards

**Standard Card**:
```tsx
<div className="bg-white rounded-2xl shadow-lg overflow-hidden hover:shadow-2xl transition-all">
  <div className="aspect-video bg-gradient-to-br from-blue-500 to-purple-600">
    {/* Visual content */}
  </div>
  <div className="p-6">
    <h3 className="text-2xl font-bold text-gray-900 mb-2">Title</h3>
    <p className="text-gray-600 mb-4">Description text...</p>
    <div className="flex items-center text-blue-600 font-semibold">
      Action →
    </div>
  </div>
</div>
```

**Stat Card**:
```tsx
<div className="text-center bg-white rounded-xl p-6 shadow-md">
  <div className="text-4xl font-bold text-blue-600">264</div>
  <div className="text-sm text-gray-600 mt-2">Images Catalogued</div>
</div>
```

**Info Card** (with border):
```tsx
<div className="bg-gray-50 rounded-lg p-6 border-2 border-gray-200">
  <h3 className="text-lg font-semibold text-gray-900 mb-3">Title</h3>
  <p className="text-gray-700">Content...</p>
</div>
```

### Navigation

**Header** (simplified structure):
```tsx
<header className="sticky top-0 z-50 bg-white border-b border-gray-200 shadow-sm">
  <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
    <div className="flex items-center justify-between h-16">
      <Logo />
      <Navigation />
      <ActionButtons />
    </div>
  </div>
</header>
```

**Footer** (5-column grid):
```tsx
<footer className="bg-gray-900 text-white py-12">
  <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
    <div className="grid md:grid-cols-5 gap-8">
      {/* Column content */}
    </div>
  </div>
</footer>
```

### Badges & Tags

**Year Badge**:
```tsx
<span className="inline-flex items-center px-3 py-1 rounded-full text-sm font-semibold bg-blue-100 text-blue-700">
  2023-24
</span>
```

**Status Badge**:
```tsx
<span className="inline-flex items-center px-3 py-1 rounded-full text-sm font-semibold bg-green-100 text-green-700">
  Published
</span>
```

**Category Tag**:
```tsx
<span className="text-xs bg-gray-100 text-gray-700 px-3 py-1 rounded-full">
  Health Services
</span>
```

---

## Animation Principles

### Guiding Rules

1. **Purposeful, Not Decorative** - Animations should guide attention or provide feedback
2. **Fast & Smooth** - 200-300ms for most transitions, 150ms for micro-interactions
3. **Respect Motion Preferences** - Honor `prefers-reduced-motion` media query
4. **Progressive Enhancement** - Core functionality works without animation

### Standard Transitions

**Hover Effects**:
```css
transition-all duration-300 ease-in-out
```

**Button Hover**:
```tsx
<button className="... hover:shadow-xl hover:scale-105 transition-all duration-200">
```

**Card Hover**:
```tsx
<div className="... hover:shadow-2xl transition-all duration-300">
```

**Link Hover**:
```tsx
<Link className="text-blue-600 hover:text-blue-700 hover:underline transition-colors duration-150">
```

### Scroll Animations (Future: GSAP Integration)

**Fade In on Scroll**:
- Opacity 0 → 1
- Translate Y: 20px → 0
- Duration: 600ms
- Easing: ease-out

**Stagger Animation** (for grids):
- Each item delays by 100ms after previous
- Creates cascading reveal effect

---

## Accessibility Standards

### WCAG 2.1 AA Compliance

**Color Contrast**:
- Text on white: Minimum `gray-700` (4.5:1 ratio)
- Text on colored backgrounds: Always white text on dark backgrounds
- Interactive elements: 3:1 contrast ratio minimum

**Focus States**:
```tsx
<button className="... focus:outline-none focus:ring-4 focus:ring-blue-500/50">
```

**Keyboard Navigation**:
- All interactive elements must be keyboard accessible
- Tab order follows visual order
- Skip links for navigation bypass

**Screen Reader Support**:
- Semantic HTML (`<nav>`, `<main>`, `<section>`, `<article>`)
- ARIA labels where needed: `aria-label`, `aria-describedby`
- Alt text for all images (descriptive, not decorative)

**Motion Sensitivity**:
```css
@media (prefers-reduced-motion: reduce) {
  * {
    animation-duration: 0.01ms !important;
    transition-duration: 0.01ms !important;
  }
}
```

---

## Responsive Design

### Breakpoints

Following Tailwind defaults:

| Prefix | Min Width | Typical Usage |
|--------|-----------|---------------|
| `sm:` | 640px | Small tablets (landscape phones) |
| `md:` | 768px | Tablets |
| `lg:` | 1024px | Desktops |
| `xl:` | 1280px | Large desktops |
| `2xl:` | 1536px | Extra large screens |

### Mobile-First Approach

Always style for mobile first, then enhance with breakpoints:

```tsx
// ✅ Good (mobile-first)
<div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 md:gap-8">

// ❌ Bad (desktop-first)
<div className="grid grid-cols-3 md:grid-cols-1 gap-8 md:gap-4">
```

### Responsive Typography

```tsx
<h1 className="text-3xl md:text-4xl lg:text-5xl font-bold">
<p className="text-base md:text-lg">
```

### Responsive Spacing

```tsx
<section className="py-12 md:py-16 lg:py-20">
<div className="px-4 sm:px-6 lg:px-8">
```

---

## Image Guidelines

### Image Optimization

**Formats**:
- WebP for photographs (with JPG fallback)
- SVG for logos and icons
- PNG for images requiring transparency

**Sizing**:
- Hero images: 1920x1080px (16:9)
- Card images: 600x400px (3:2)
- Thumbnails: 300x300px (1:1)
- Gallery images: 800x600px (4:3)

**Loading**:
```tsx
<img
  src="..."
  alt="Descriptive text"
  loading="lazy"
  className="w-full h-full object-cover"
/>
```

### Aspect Ratios

```tsx
// 16:9 (hero images)
<div className="aspect-video">

// 4:3 (content images)
<div className="aspect-[4/3]">

// 3:2 (cards)
<div className="aspect-[3/2]">

// Square (avatars, icons)
<div className="aspect-square">
```

---

## Implementation Checklist

### Every Public Page Should Have:

- [ ] Semantic HTML5 structure (`<main>`, `<section>`, `<article>`)
- [ ] Proper heading hierarchy (H1 → H2 → H3)
- [ ] Responsive container (`max-w-7xl mx-auto px-4 sm:px-6 lg:px-8`)
- [ ] Mobile-first responsive design
- [ ] Generous whitespace (minimum `py-12` on sections)
- [ ] Accessible color contrast (WCAG AA)
- [ ] Focus states on all interactive elements
- [ ] Alt text on all images
- [ ] Loading states for async content
- [ ] Error handling with user-friendly messages
- [ ] Consistent button and link styling
- [ ] Smooth transitions on interactive elements

### Performance Targets:

- Lighthouse Performance Score: 90+
- First Contentful Paint: < 1.5s
- Largest Contentful Paint: < 2.5s
- Cumulative Layout Shift: < 0.1
- Time to Interactive: < 3.5s

---

## Examples & References

### Exemplary Pages (Current):

1. **Homepage** (`/app/(public)/page.tsx`) - "15 Years of Impact" section
   - Demonstrates: Gradient backgrounds, card layouts, stats display, responsive grid

2. **Annual Reports Timeline** (`/app/annual-reports/page.tsx`)
   - Demonstrates: Horizontal scroll, year cards, color-coded eras, modal overlays

3. **Individual Report Detail** (`/app/annual-reports/[year]/page.tsx`)
   - Demonstrates: Hero section, image gallery, metadata display, download CTA

### Design Inspiration:

- **Creovox** (https://creovox.webflow.io/) - Minimalism, whitespace, purposeful motion
- **Apple** (product pages) - Clean typography, generous spacing, product focus
- **Stripe** (docs) - Clear information hierarchy, accessible design
- **The Pudding** (articles) - Data storytelling, scroll-driven narratives

---

## Version History

**v1.0** (2025-01-29) - Initial brand & style guide established
- Defined color system inspired by Creovox minimalism
- Established typography scale and spacing system
- Documented component library and layout patterns
- Set accessibility and performance standards

---

## Questions or Updates?

This is a living document. As the PICC public website evolves, this guide should be updated to reflect new patterns, components, and design decisions.

**Maintained by**: Development Team
**Last Updated**: 2025-01-29
