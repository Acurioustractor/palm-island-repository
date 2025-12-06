# PICC Design System - Quick Start Guide

**For developers who need to start building immediately.**

---

## 🎨 The Essentials

### Primary Gradient (Your Signature Look)
```tsx
className="bg-gradient-to-r from-blue-600 to-purple-600"
```
Use for: Hero sections, primary CTAs, feature cards

### Body Text
```tsx
className="text-gray-700 leading-relaxed"
```

### Headlines
```tsx
// H1
className="text-4xl md:text-5xl lg:text-6xl font-bold text-gray-900"

// H2
className="text-3xl md:text-4xl font-bold text-gray-900"

// H3
className="text-2xl font-bold text-gray-900"
```

---

## 🔘 Buttons (Copy/Paste Ready)

### Primary Button
```tsx
<Link
  href="/path"
  className="inline-flex items-center gap-2 px-8 py-4 bg-gradient-to-r from-blue-600 to-purple-600 text-white rounded-lg hover:from-blue-700 hover:to-purple-700 transition-all font-semibold shadow-lg hover:shadow-xl focus:outline-none focus:ring-4 focus:ring-blue-500/50"
>
  Button Text
</Link>
```

### Secondary Button
```tsx
<button className="inline-flex items-center gap-2 px-6 py-3 bg-white text-blue-600 border-2 border-blue-600 rounded-lg hover:bg-blue-50 transition-colors font-semibold focus:outline-none focus:ring-4 focus:ring-blue-500/50">
  Button Text
</button>
```

---

## 📦 Cards (Copy/Paste Ready)

### Feature Card
```tsx
<div className="bg-white rounded-2xl shadow-lg overflow-hidden hover:shadow-2xl transition-all">
  <div className="aspect-video bg-gradient-to-br from-blue-500 to-purple-600 flex items-center justify-center">
    <div className="text-white text-center">
      {/* Visual content */}
    </div>
  </div>
  <div className="p-6">
    <h3 className="text-2xl font-bold text-gray-900 mb-2">Card Title</h3>
    <p className="text-gray-600 mb-4">Card description text...</p>
    <div className="flex items-center text-blue-600 font-semibold">
      Learn More →
    </div>
  </div>
</div>
```

### Stat Card
```tsx
<div className="text-center bg-white rounded-xl p-6 shadow-md hover:shadow-lg transition-shadow">
  <div className="text-4xl font-bold text-blue-600">264</div>
  <div className="text-sm text-gray-600 mt-2">Label Text</div>
</div>
```

---

## 📄 Page Template

```tsx
export default function PageName() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-purple-50 to-pink-50">
      {/* Hero Section */}
      <section className="bg-gradient-to-r from-blue-600 to-purple-600 text-white py-20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <h1 className="text-4xl md:text-5xl lg:text-6xl font-bold mb-6">
            Your Page Title
          </h1>
          <p className="text-lg md:text-xl max-w-3xl mx-auto mb-8">
            Supporting description text
          </p>
          <Link
            href="/action"
            className="inline-flex items-center gap-2 px-8 py-4 bg-white text-blue-600 rounded-lg hover:bg-gray-100 transition-all font-semibold shadow-lg"
          >
            Primary Action
          </Link>
        </div>
      </section>

      {/* Content Section */}
      <section className="py-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-8">
            Section Title
          </h2>

          {/* 3-Column Card Grid */}
          <div className="grid md:grid-cols-3 gap-8">
            {/* Cards here */}
          </div>
        </div>
      </section>
    </div>
  );
}
```

---

## 🎨 Colors (Most Used)

### Backgrounds
- Page: `bg-gradient-to-br from-blue-50 via-purple-50 to-pink-50`
- Section: `bg-white`
- Card: `bg-white`
- Hero: `bg-gradient-to-r from-blue-600 to-purple-600`

### Text
- Body: `text-gray-700`
- Headline: `text-gray-900`
- Secondary: `text-gray-600`
- On colored bg: `text-white`

### Interactive
- Link: `text-blue-600 hover:text-blue-700`
- Button: `bg-gradient-to-r from-blue-600 to-purple-600`
- Border: `border-gray-200`

---

## 📏 Spacing (Most Used)

### Padding
- Card: `p-6` (24px) or `p-8` (32px)
- Section: `py-16` (64px desktop), `py-12` (48px mobile)
- Container: `px-4 sm:px-6 lg:px-8`

### Gaps
- Between cards: `gap-8` (32px)
- Between sections: `space-y-16` (64px)
- Small gaps: `gap-4` (16px)

### Margins
- Below H1: `mb-6` (24px)
- Below H2: `mb-8` (32px)
- Below paragraphs: `mb-4` (16px)

---

## 📱 Responsive Grid

### 3-Column (Most Common)
```tsx
<div className="grid md:grid-cols-3 gap-8">
  {/* Cards */}
</div>
```

### 2-Column
```tsx
<div className="grid md:grid-cols-2 gap-8 items-center">
  {/* Content */}
</div>
```

### 4-Column Stats
```tsx
<div className="grid grid-cols-2 md:grid-cols-4 gap-6">
  {/* Stat cards */}
</div>
```

---

## ✅ Accessibility Checklist

Every component needs:
- [ ] `focus:outline-none focus:ring-4 focus:ring-blue-500/50` on interactive elements
- [ ] Proper heading hierarchy (H1 → H2 → H3)
- [ ] Alt text on images
- [ ] Semantic HTML (`<nav>`, `<main>`, `<section>`)

---

## 🚀 Start Building

1. Copy the **Page Template** above
2. Add **Cards** from the examples
3. Use **Primary Gradient** for CTAs
4. Apply **Spacing** rules (py-16, gap-8, p-6)
5. Test on mobile first
6. Check accessibility

**For complete examples**: See [COMPONENT-EXAMPLES.md](./COMPONENT-EXAMPLES.md)
**For color reference**: See [COLOR-PALETTE.md](./COLOR-PALETTE.md)
**For full guidelines**: See [PICC-BRAND-STYLE-GUIDE.md](./PICC-BRAND-STYLE-GUIDE.md)

---

**Last Updated**: January 29, 2025
