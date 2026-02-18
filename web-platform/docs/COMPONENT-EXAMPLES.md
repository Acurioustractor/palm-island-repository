# PICC Component Examples - Quick Reference

This document provides ready-to-use code examples for common UI patterns following the PICC Brand Style Guide.

---

## Buttons

### Primary Button (Main CTAs)
```tsx
<Link
  href="/annual-reports"
  className="inline-flex items-center gap-2 px-8 py-4 bg-gradient-to-r from-blue-600 to-purple-600 text-white rounded-lg hover:from-blue-700 hover:to-purple-700 transition-all font-semibold text-lg shadow-lg hover:shadow-xl"
>
  <Calendar className="w-6 h-6" />
  Explore Timeline
</Link>
```

### Secondary Button (Alternative Actions)
```tsx
<button className="inline-flex items-center gap-2 px-6 py-3 bg-white text-blue-600 border-2 border-blue-600 rounded-lg hover:bg-blue-50 transition-colors font-semibold">
  <BookOpen className="w-5 h-5" />
  Learn More
</button>
```

### Ghost Button (Subtle Actions)
```tsx
<button className="inline-flex items-center gap-2 px-6 py-3 text-gray-700 hover:bg-gray-100 rounded-lg transition-colors font-medium">
  View Details →
</button>
```

### Icon Button
```tsx
<button className="p-2 text-gray-600 hover:bg-gray-100 rounded-lg transition-colors" aria-label="Close">
  <X className="w-5 h-5" />
</button>
```

---

## Cards

### Standard Feature Card
```tsx
<Link href="/annual-reports" className="group">
  <div className="bg-white rounded-2xl shadow-lg overflow-hidden hover:shadow-2xl transition-all h-full flex flex-col">
    <div className="aspect-video bg-gradient-to-br from-blue-500 to-purple-600 relative flex items-center justify-center">
      <div className="text-white text-center z-10">
        <Calendar className="w-16 h-16 mx-auto mb-4" />
        <div className="text-5xl font-bold">15</div>
        <div className="text-xl">Annual Reports</div>
      </div>
    </div>
    <div className="p-6 flex-1 flex flex-col">
      <h3 className="text-2xl font-bold text-gray-900 mb-2 group-hover:text-blue-600 transition-colors">
        Interactive Timeline
      </h3>
      <p className="text-gray-600 mb-4 flex-1">
        Navigate 15 years of growth, achievements, and community control with full-text search and AI-powered insights.
      </p>
      <div className="flex items-center text-blue-600 font-semibold">
        Explore Timeline →
      </div>
    </div>
  </div>
</Link>
```

### Stat Card
```tsx
<div className="text-center bg-white rounded-xl p-6 shadow-md hover:shadow-lg transition-shadow">
  <div className="text-4xl font-bold text-blue-600">264</div>
  <div className="text-sm text-gray-600 mt-2">Images Catalogued</div>
</div>
```

### Info Card (with border)
```tsx
<div className="bg-gray-50 rounded-lg p-6 border-2 border-gray-200">
  <h3 className="text-lg font-semibold text-gray-900 mb-3 flex items-center gap-2">
    <Info className="w-5 h-5 text-blue-600" />
    About This Report
  </h3>
  <div className="space-y-2 text-sm text-gray-700">
    <p>
      <span className="font-medium">Fiscal Year:</span> 2023-24
    </p>
    <p>
      <span className="font-medium">Theme:</span> Community Led Future
    </p>
  </div>
</div>
```

### Image Card (Gallery)
```tsx
<div className="relative aspect-square rounded-lg overflow-hidden bg-gray-200 group cursor-pointer hover:shadow-xl transition-all">
  <img
    src="/path/to/image.jpg"
    alt="Descriptive alt text"
    className="absolute inset-0 w-full h-full object-cover group-hover:scale-110 transition-transform duration-300"
  />
  <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent opacity-0 group-hover:opacity-100 transition-opacity flex items-end">
    <div className="p-4 text-white">
      <div className="text-sm font-medium">Page 5</div>
    </div>
  </div>
</div>
```

---

## Section Layouts

### Full-Width Colored Section
```tsx
<section className="w-full py-20 bg-gradient-to-br from-blue-600 to-purple-600">
  <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
    <div className="text-center text-white">
      <h1 className="text-4xl md:text-5xl lg:text-6xl font-bold mb-6">
        Your Headline Here
      </h1>
      <p className="text-lg md:text-xl max-w-3xl mx-auto">
        Supporting text that provides context and encourages action.
      </p>
    </div>
  </div>
</section>
```

### Standard Content Section
```tsx
<section className="py-16 bg-white">
  <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
    <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-8">
      Section Title
    </h2>
    {/* Content here */}
  </div>
</section>
```

### Subtle Gradient Background
```tsx
<section className="py-16 bg-gradient-to-br from-blue-50 via-purple-50 to-pink-50">
  <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
    {/* Content with natural breathing room */}
  </div>
</section>
```

### Two-Column Layout
```tsx
<section className="py-16 bg-white">
  <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
    <div className="grid md:grid-cols-2 gap-12 items-center">
      <div>
        <h2 className="text-4xl font-bold text-gray-900 mb-6">
          Transparent Reporting
        </h2>
        <p className="text-xl text-gray-600 mb-6">
          We believe in complete transparency. Every year since 2009...
        </p>
        <Link
          href="/annual-reports"
          className="inline-flex items-center gap-2 px-8 py-4 bg-gradient-to-r from-blue-600 to-purple-600 text-white rounded-lg hover:from-blue-700 hover:to-purple-700 transition-all font-semibold shadow-lg"
        >
          <FileText className="w-6 h-6" />
          Explore Annual Reports
        </Link>
      </div>
      <div>
        {/* Image or visual content */}
        <img
          src="/path/to/image.jpg"
          alt="Description"
          className="rounded-2xl shadow-2xl"
        />
      </div>
    </div>
  </div>
</section>
```

---

## Grid Layouts

### 3-Column Card Grid
```tsx
<div className="grid md:grid-cols-3 gap-8">
  {/* Card components */}
  <div className="bg-white rounded-2xl shadow-lg p-6">
    {/* Card content */}
  </div>
  <div className="bg-white rounded-2xl shadow-lg p-6">
    {/* Card content */}
  </div>
  <div className="bg-white rounded-2xl shadow-lg p-6">
    {/* Card content */}
  </div>
</div>
```

### 4-Column Stats Grid
```tsx
<div className="grid grid-cols-2 md:grid-cols-4 gap-6">
  <div className="text-center bg-white rounded-xl p-6 shadow-md">
    <div className="text-4xl font-bold text-blue-600">264</div>
    <div className="text-sm text-gray-600 mt-2">Images</div>
  </div>
  <div className="text-center bg-white rounded-xl p-6 shadow-md">
    <div className="text-4xl font-bold text-green-600">86</div>
    <div className="text-sm text-gray-600 mt-2">Knowledge Entries</div>
  </div>
  <div className="text-center bg-white rounded-xl p-6 shadow-md">
    <div className="text-4xl font-bold text-purple-600">31+</div>
    <div className="text-sm text-gray-600 mt-2">Stories</div>
  </div>
  <div className="text-center bg-white rounded-xl p-6 shadow-md">
    <div className="text-4xl font-bold text-orange-600">15</div>
    <div className="text-sm text-gray-600 mt-2">Years</div>
  </div>
</div>
```

### Masonry Gallery (Images)
```tsx
<div className="columns-2 md:columns-3 lg:columns-4 gap-4">
  {images.map((img) => (
    <div key={img.id} className="mb-4 break-inside-avoid">
      <img
        src={img.url}
        alt={img.alt}
        className="w-full rounded-lg shadow-lg hover:shadow-2xl transition-shadow cursor-pointer"
      />
    </div>
  ))}
</div>
```

---

## Badges & Tags

### Year Badge
```tsx
<span className="inline-flex items-center px-3 py-1 rounded-full text-sm font-semibold bg-blue-100 text-blue-700">
  2023-24
</span>
```

### Status Badge (Success)
```tsx
<span className="inline-flex items-center gap-1 px-3 py-1 rounded-full text-sm font-semibold bg-green-100 text-green-700">
  <CheckCircle className="w-4 h-4" />
  Published
</span>
```

### Category Tag
```tsx
<span className="text-xs bg-gray-100 text-gray-700 px-3 py-1 rounded-full">
  Health Services
</span>
```

### Era Badge (Color-coded)
```tsx
{/* Foundation Era */}
<span className="inline-flex items-center px-3 py-1 rounded-full text-sm font-semibold bg-amber-100 text-amber-700">
  Foundation Era
</span>

{/* Growth Era */}
<span className="inline-flex items-center px-3 py-1 rounded-full text-sm font-semibold bg-purple-100 text-purple-700">
  Growth Era
</span>

{/* Transition Era */}
<span className="inline-flex items-center px-3 py-1 rounded-full text-sm font-semibold bg-green-100 text-green-700">
  Transition Era
</span>

{/* Community Controlled Era */}
<span className="inline-flex items-center px-3 py-1 rounded-full text-sm font-semibold bg-blue-100 text-blue-700">
  Community Controlled
</span>
```

---

## Typography

### Hero Headline
```tsx
<h1 className="text-4xl md:text-5xl lg:text-6xl font-bold text-gray-900 mb-6">
  15 Years of Community-Led Impact
</h1>
```

### Section Heading
```tsx
<h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-8">
  Transparent Reporting
</h2>
```

### Card Title
```tsx
<h3 className="text-2xl font-bold text-gray-900 mb-2">
  Interactive Timeline
</h3>
```

### Body Text (Large)
```tsx
<p className="text-lg md:text-xl text-gray-600 max-w-3xl mx-auto">
  This is a larger introductory paragraph that draws the reader in.
</p>
```

### Body Text (Standard)
```tsx
<p className="text-gray-700 leading-relaxed">
  Standard body text for general content with good readability.
</p>
```

### Small Text (Metadata)
```tsx
<p className="text-sm text-gray-600">
  Last updated: January 29, 2025
</p>
```

---

## Loading States

### Spinner
```tsx
<div className="flex items-center justify-center py-12">
  <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
</div>
```

### Skeleton Card
```tsx
<div className="bg-white rounded-2xl shadow-lg p-6 animate-pulse">
  <div className="h-4 bg-gray-200 rounded w-3/4 mb-4"></div>
  <div className="h-4 bg-gray-200 rounded w-1/2 mb-4"></div>
  <div className="h-20 bg-gray-200 rounded"></div>
</div>
```

### Loading Text
```tsx
<div className="text-center py-12">
  <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
  <p className="text-gray-600">Loading images...</p>
</div>
```

---

## Empty States

### No Results
```tsx
<div className="text-center py-12">
  <SearchX className="w-16 h-16 text-gray-400 mx-auto mb-4" />
  <h3 className="text-xl font-semibold text-gray-900 mb-2">
    No results found
  </h3>
  <p className="text-gray-600 mb-6">
    Try adjusting your search or filters to find what you're looking for.
  </p>
  <button className="px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors font-semibold">
    Clear Filters
  </button>
</div>
```

### Coming Soon
```tsx
<div className="bg-white rounded-2xl shadow-lg overflow-hidden h-full flex flex-col opacity-75">
  <div className="aspect-video bg-gradient-to-br from-orange-500 to-red-600 flex items-center justify-center relative">
    <div className="absolute inset-0 bg-black/20 flex items-center justify-center">
      <div className="bg-white px-6 py-3 rounded-full shadow-lg">
        <span className="text-orange-600 font-bold text-sm uppercase tracking-wide">
          Coming Soon
        </span>
      </div>
    </div>
  </div>
  <div className="p-6">
    <h3 className="text-2xl font-bold text-gray-900 mb-2">
      AI Chat Assistant
    </h3>
    <p className="text-gray-600">
      Ask questions about PICC's history, services, and community programs.
    </p>
  </div>
</div>
```

---

## Search & Filters

### Search Bar
```tsx
<div className="relative max-w-3xl mx-auto">
  <input
    type="text"
    placeholder="Search 86 knowledge entries..."
    className="w-full px-6 py-4 pl-12 border-2 border-gray-300 rounded-lg focus:border-blue-500 focus:outline-none text-lg"
  />
  <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
</div>
```

### Filter Buttons
```tsx
<div className="flex flex-wrap gap-3">
  <button className="px-6 py-3 bg-white rounded-lg border-2 border-blue-500 text-blue-700 font-semibold">
    All Services
  </button>
  <button className="px-6 py-3 bg-white rounded-lg border-2 border-gray-200 text-gray-700 hover:border-blue-500 hover:text-blue-700 transition-colors font-medium">
    Health
  </button>
  <button className="px-6 py-3 bg-white rounded-lg border-2 border-gray-200 text-gray-700 hover:border-blue-500 hover:text-blue-700 transition-colors font-medium">
    Social Services
  </button>
  <button className="px-6 py-3 bg-white rounded-lg border-2 border-gray-200 text-gray-700 hover:border-blue-500 hover:text-blue-700 transition-colors font-medium">
    Community
  </button>
</div>
```

---

## Modals & Overlays

### Modal Container
```tsx
<div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm p-4">
  <div className="bg-white rounded-2xl shadow-2xl max-w-5xl w-full max-h-[90vh] overflow-hidden flex flex-col">
    {/* Header */}
    <div className="bg-gradient-to-r from-blue-600 to-purple-600 text-white p-6">
      <div className="flex items-center justify-between">
        <h2 className="text-3xl font-bold">Modal Title</h2>
        <button
          onClick={onClose}
          className="p-2 bg-white/20 hover:bg-white/30 rounded-lg transition-colors"
          aria-label="Close"
        >
          <X className="w-5 h-5" />
        </button>
      </div>
    </div>

    {/* Content */}
    <div className="flex-1 overflow-y-auto p-6">
      {/* Modal content */}
    </div>

    {/* Footer (optional) */}
    <div className="border-t border-gray-200 p-4 bg-gray-50 flex justify-end gap-3">
      <button className="px-6 py-2 bg-white border-2 border-gray-300 rounded-lg hover:bg-gray-100 transition-colors font-medium">
        Cancel
      </button>
      <button className="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors font-semibold">
        Confirm
      </button>
    </div>
  </div>
</div>
```

---

## Navigation

### Header
```tsx
<header className="sticky top-0 z-50 bg-white border-b border-gray-200 shadow-sm">
  <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
    <div className="flex items-center justify-between h-16">
      {/* Logo */}
      <Link href="/" className="flex items-center gap-3">
        <img src="/logo.svg" alt="PICC" className="h-10 w-auto" />
        <span className="font-bold text-xl text-gray-900">PICC</span>
      </Link>

      {/* Navigation */}
      <nav className="hidden md:flex items-center gap-8">
        <Link href="/about" className="text-gray-700 hover:text-blue-600 transition-colors font-medium">
          About
        </Link>
        <Link href="/stories" className="text-gray-700 hover:text-blue-600 transition-colors font-medium">
          Stories
        </Link>
        <Link href="/annual-reports" className="text-gray-700 hover:text-blue-600 transition-colors font-medium">
          Annual Reports
        </Link>
      </nav>

      {/* CTA Button */}
      <Link
        href="/share-voice"
        className="px-6 py-2 bg-gradient-to-r from-blue-600 to-purple-600 text-white rounded-lg hover:from-blue-700 hover:to-purple-700 transition-all font-semibold"
      >
        Share Your Voice
      </Link>
    </div>
  </div>
</header>
```

### Footer
```tsx
<footer className="bg-gray-900 text-white py-12">
  <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
    <div className="grid md:grid-cols-5 gap-8">
      {/* Column 1 - About */}
      <div>
        <h3 className="font-bold text-lg mb-4">About PICC</h3>
        <ul className="space-y-2 text-gray-400">
          <li><Link href="/about" className="hover:text-white transition-colors">Our Story</Link></li>
          <li><Link href="/about#services" className="hover:text-white transition-colors">Services</Link></li>
          <li><Link href="/impact" className="hover:text-white transition-colors">Impact</Link></li>
        </ul>
      </div>

      {/* Column 2 - Resources */}
      <div>
        <h3 className="font-bold text-lg mb-4">Resources</h3>
        <ul className="space-y-2 text-gray-400">
          <li><Link href="/annual-reports" className="hover:text-white transition-colors">Annual Reports</Link></li>
          <li><Link href="/knowledge" className="hover:text-white transition-colors">Knowledge Library</Link></li>
          <li><Link href="/services" className="hover:text-white transition-colors">Service Directory</Link></li>
        </ul>
      </div>

      {/* Column 3 - Community */}
      <div>
        <h3 className="font-bold text-lg mb-4">Community</h3>
        <ul className="space-y-2 text-gray-400">
          <li><Link href="/stories" className="hover:text-white transition-colors">Stories</Link></li>
          <li><Link href="/share-voice" className="hover:text-white transition-colors">Share Your Voice</Link></li>
          <li><Link href="/community" className="hover:text-white transition-colors">Community Hub</Link></li>
        </ul>
      </div>

      {/* Column 4 - Connect */}
      <div>
        <h3 className="font-bold text-lg mb-4">Connect</h3>
        <ul className="space-y-2 text-gray-400">
          <li><a href="tel:+61747701177" className="hover:text-white transition-colors">(07) 4770 1177</a></li>
          <li><a href="mailto:info@picc.com.au" className="hover:text-white transition-colors">info@picc.com.au</a></li>
        </ul>
      </div>

      {/* Column 5 - Social */}
      <div>
        <h3 className="font-bold text-lg mb-4">Follow Us</h3>
        <div className="flex gap-3">
          <a href="#" className="w-10 h-10 bg-gray-800 hover:bg-blue-600 rounded-lg flex items-center justify-center transition-colors">
            <Facebook className="w-5 h-5" />
          </a>
          <a href="#" className="w-10 h-10 bg-gray-800 hover:bg-blue-600 rounded-lg flex items-center justify-center transition-colors">
            <Instagram className="w-5 h-5" />
          </a>
        </div>
      </div>
    </div>

    <div className="border-t border-gray-800 mt-8 pt-8 text-center text-gray-400 text-sm">
      <p>&copy; {new Date().getFullYear()} Palm Island Community Company. All rights reserved.</p>
    </div>
  </div>
</footer>
```

---

## Accessibility Patterns

### Focus Ring (All Interactive Elements)
```tsx
<button className="... focus:outline-none focus:ring-4 focus:ring-blue-500/50">
```

### Skip Link (For Keyboard Navigation)
```tsx
<a
  href="#main-content"
  className="sr-only focus:not-sr-only focus:absolute focus:top-4 focus:left-4 px-4 py-2 bg-blue-600 text-white rounded-lg z-50"
>
  Skip to main content
</a>
```

### Screen Reader Only Text
```tsx
<span className="sr-only">Loading content, please wait</span>
```

---

## Animation Examples

### Fade In on Scroll (Manual)
```tsx
<div className="opacity-0 animate-fade-in">
  {/* Content that fades in */}
</div>
```

### Slide Up on Scroll
```tsx
<div className="opacity-0 animate-slide-up" style={{ animationDelay: '100ms' }}>
  {/* Content that slides up */}
</div>
```

### Stagger Animation (Grid)
```tsx
{items.map((item, index) => (
  <div
    key={item.id}
    className="opacity-0 animate-fade-in-up"
    style={{ animationDelay: `${index * 100}ms` }}
  >
    {/* Card content */}
  </div>
))}
```

---

## Responsive Patterns

### Show/Hide by Breakpoint
```tsx
{/* Hidden on mobile, visible on desktop */}
<div className="hidden md:block">
  Desktop only content
</div>

{/* Visible on mobile, hidden on desktop */}
<div className="md:hidden">
  Mobile only content
</div>
```

### Responsive Grid
```tsx
<div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 md:gap-8">
  {/* Responsive card grid */}
</div>
```

### Responsive Typography
```tsx
<h1 className="text-3xl md:text-4xl lg:text-5xl xl:text-6xl font-bold">
  Responsive Heading
</h1>
```

### Responsive Spacing
```tsx
<section className="py-12 md:py-16 lg:py-20">
  <div className="px-4 sm:px-6 lg:px-8">
    {/* Responsive section */}
  </div>
</section>
```

---

## Usage Notes

1. **Always include focus states** for accessibility
2. **Use semantic HTML** (`<nav>`, `<main>`, `<section>`, `<article>`)
3. **Provide alt text** for all images
4. **Test on mobile** - all components should be mobile-first
5. **Generous whitespace** - don't be afraid of empty space
6. **Consistent spacing** - use the spacing scale (4, 6, 8, 12, 16, 20, 24)
7. **Color contrast** - ensure WCAG AA compliance
8. **Loading states** - always show feedback for async operations

---

## Quick Copy Checklist

When creating a new public page:

```tsx
// Page structure template
export default function PageName() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-purple-50 to-pink-50">
      {/* Hero Section */}
      <section className="bg-gradient-to-r from-blue-600 to-purple-600 text-white py-20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <h1 className="text-4xl md:text-5xl lg:text-6xl font-bold mb-6">
            Page Title
          </h1>
          <p className="text-lg md:text-xl max-w-3xl mx-auto">
            Supporting description
          </p>
        </div>
      </section>

      {/* Content Section */}
      <section className="py-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          {/* Your content */}
        </div>
      </section>
    </div>
  );
}
```

---

**Last Updated**: January 29, 2025
**Maintained By**: Development Team

For the complete brand guidelines, see [PICC-BRAND-STYLE-GUIDE.md](./PICC-BRAND-STYLE-GUIDE.md)
