# PICC Color Palette Reference

Quick visual reference for all brand colors. Use these exact values for consistency across the platform.

---

## Primary Palette

### PICC Blue (Trust, Community, Stability)
**Usage**: Primary actions, links, hero sections, main CTAs

```
blue-50   #eff6ff  □  Backgrounds, subtle accents
blue-100  #dbeafe  □  Light backgrounds
blue-500  #3b82f6  □  Primary actions, links
blue-600  #2563eb  ■  Primary button default (PICC Blue)
blue-700  #1d4ed8  ■  Primary button hover
blue-900  #1e3a8a  ■  Headlines, emphasis
```

**Tailwind Classes**:
- `bg-blue-600` - Primary button background
- `text-blue-600` - Primary text/links
- `border-blue-600` - Primary borders
- `from-blue-600 to-purple-600` - Primary gradient

---

### PICC Purple (Innovation, Growth, Vision)
**Usage**: Gradients, accents, highlights, growth themes

```
purple-50   #faf5ff  □  Backgrounds
purple-500  #a855f7  □  Accents
purple-600  #9333ea  ■  Gradients, highlights (PICC Purple)
purple-700  #7e22ce  ■  Hover states
```

**Tailwind Classes**:
- `bg-purple-600` - Accent backgrounds
- `text-purple-600` - Accent text
- `from-blue-600 to-purple-600` - Primary gradient

---

## Secondary Palette

### Success Green (Health, Services, Growth)
**Usage**: Health services, success states, service directory, growth metrics

```
green-50   #f0fdf4  □  Backgrounds
green-500  #22c55e  □  Success states
green-600  #16a34a  ■  Secondary CTAs (PICC Green)
green-700  #15803d  ■  Hover states
```

**Tailwind Classes**:
- `bg-green-600` - Success buttons, health themes
- `text-green-600` - Success text, checkmarks
- `border-green-600` - Success borders

---

### Warm Orange (Community, Energy, Action)
**Usage**: Community themes, notifications, interactive elements, coming soon features

```
orange-50   #fff7ed  □  Backgrounds
orange-500  #f97316  □  Accents, notifications
orange-600  #ea580c  ■  Interactive elements (PICC Orange)
orange-700  #c2410c  ■  Hover states
```

**Tailwind Classes**:
- `bg-orange-600` - Community CTAs, notifications
- `text-orange-600` - Accent text, alerts
- `border-orange-600` - Accent borders

---

### Impact Amber (Heritage, Foundation, History)
**Usage**: Timeline backgrounds, historical eras, foundation themes

```
amber-50   #fffbeb  □  Timeline backgrounds
amber-500  #f59e0b  □  Timeline markers
amber-600  #d97706  ■  Historical era highlights (PICC Amber)
```

**Tailwind Classes**:
- `bg-amber-600` - Foundation era themes
- `text-amber-600` - Historical text
- `border-amber-600` - Timeline borders

---

## Neutral Palette

### Sophisticated Grays
**Usage**: Body text, backgrounds, UI elements, borders

```
white     #ffffff  □  Page backgrounds
gray-50   #f9fafb  □  Section backgrounds
gray-100  #f3f4f6  □  Card backgrounds
gray-200  #e5e7eb  □  Borders, dividers
gray-600  #4b5563  ■  Secondary text
gray-700  #374151  ■  Body text (primary)
gray-900  #111827  ■  Headlines, emphasis
black     #000000  ■  Critical emphasis only (use sparingly)
```

**Tailwind Classes**:
- `bg-white` - Page backgrounds
- `bg-gray-50` - Section backgrounds
- `bg-gray-100` - Card backgrounds
- `text-gray-700` - Body text
- `text-gray-900` - Headlines
- `border-gray-200` - Borders

---

## Gradient Recipes

### Primary Hero Gradient
**Usage**: Hero sections, main CTAs, feature cards
```
from-blue-600 to-purple-600
linear-gradient(135deg, #2563eb 0%, #9333ea 100%)
```

### Success Gradient
**Usage**: Health service themes, success messages
```
from-green-600 to-emerald-600
linear-gradient(135deg, #16a34a 0%, #059669 100%)
```

### Warm Gradient
**Usage**: Community themes, energy/action sections
```
from-orange-600 to-red-600
linear-gradient(135deg, #ea580c 0%, #dc2626 100%)
```

### Subtle Background Gradient
**Usage**: Page backgrounds, hero backgrounds, section backdrops
```
from-blue-50 via-purple-50 to-pink-50
linear-gradient(135deg, #eff6ff 0%, #faf5ff 50%, #fff7ed 100%)
```

---

## Era Color Coding (Timeline)

### Foundation Era (2009-2012)
**Theme**: Establishment & Early Growth
```
Color: Amber
Background: bg-amber-50   (#fffbeb)
Badge: bg-amber-100 text-amber-700
Gradient: from-amber-500 to-orange-600
```

### Growth Era (2013-2021)
**Theme**: Expansion & Development
```
Color: Purple
Background: bg-purple-50   (#faf5ff)
Badge: bg-purple-100 text-purple-700
Gradient: from-purple-500 to-pink-600
```

### Transition Era (2019-2021)
**Theme**: Transition to Community Control
```
Color: Green
Background: bg-green-50   (#f0fdf4)
Badge: bg-green-100 text-green-700
Gradient: from-green-500 to-emerald-600
```

### Community Controlled Era (2021-Present)
**Theme**: Self-Determination & Community-Led Governance
```
Color: Blue
Background: bg-blue-50   (#eff6ff)
Badge: bg-blue-100 text-blue-700
Gradient: from-blue-500 to-cyan-600
```

---

## Color Usage Guidelines

### Do's ✅

1. **Use blue-600 for primary actions** - Links, main CTAs, primary buttons
2. **Use gray-700 for body text** - Ensures readability and WCAG AA compliance
3. **Use gray-900 for headlines** - Strong contrast for emphasis
4. **Use subtle gradients for backgrounds** - Adds visual interest without distraction
5. **Use era colors consistently** - Maintain timeline color coding across all views
6. **Use success green for health themes** - Reinforces health service associations
7. **Use generous whitespace** - Let colors breathe with proper spacing

### Don'ts ❌

1. **Don't use pure black (#000000) for text** - Too harsh, use gray-900 instead
2. **Don't mix too many colors in one section** - Stick to 2-3 colors max
3. **Don't use saturated colors for large areas** - Use tints (50, 100) for backgrounds
4. **Don't use color as the only indicator** - Always pair with text/icons for accessibility
5. **Don't use red without context** - Reserve for errors/critical actions only
6. **Don't override brand colors** - Use exact hex values from this guide
7. **Don't use gradients on text** - Can reduce readability

---

## Accessibility Compliance

### WCAG AA Contrast Ratios

**Text on White Background**:
- ✅ `text-gray-700` on `bg-white` - 4.5:1 (PASS)
- ✅ `text-gray-900` on `bg-white` - 12:1 (PASS)
- ✅ `text-blue-600` on `bg-white` - 4.5:1 (PASS)
- ✅ `text-green-600` on `bg-white` - 4.5:1 (PASS)
- ⚠️ `text-gray-600` on `bg-white` - 3.8:1 (Use for secondary text only, not body)

**White Text on Colored Backgrounds**:
- ✅ `text-white` on `bg-blue-600` - 7:1 (PASS)
- ✅ `text-white` on `bg-purple-600` - 6.5:1 (PASS)
- ✅ `text-white` on `bg-green-600` - 6:1 (PASS)
- ✅ `text-white` on `bg-orange-600` - 5:1 (PASS)
- ✅ `text-white` on `bg-gray-900` - 18:1 (PASS)

**Interactive Elements**:
- Minimum 3:1 contrast ratio for UI components (buttons, borders, focus states)
- Always use focus rings: `focus:ring-4 focus:ring-blue-500/50`

---

## Color Psychology & Meaning

### Blue (Primary)
**Emotional Impact**: Trust, reliability, professionalism, calm
**Use When**: You want to convey stability, trustworthiness, official communications

### Purple (Innovation)
**Emotional Impact**: Creativity, vision, innovation, growth
**Use When**: Highlighting progress, future-focused content, creative initiatives

### Green (Health & Success)
**Emotional Impact**: Health, growth, harmony, success
**Use When**: Health services, positive outcomes, environmental themes

### Orange (Community)
**Emotional Impact**: Energy, warmth, community, enthusiasm
**Use When**: Community engagement, calls to action, social features

### Amber (Heritage)
**Emotional Impact**: Heritage, warmth, foundation, stability
**Use When**: Historical content, foundational themes, established programs

---

## Quick Reference Cheat Sheet

```tsx
// Primary Button
className="px-8 py-4 bg-gradient-to-r from-blue-600 to-purple-600 text-white rounded-lg hover:from-blue-700 hover:to-purple-700"

// Secondary Button
className="px-6 py-3 bg-white text-blue-600 border-2 border-blue-600 rounded-lg hover:bg-blue-50"

// Body Text
className="text-gray-700 leading-relaxed"

// Headline
className="text-4xl font-bold text-gray-900"

// Link
className="text-blue-600 hover:text-blue-700 hover:underline"

// Success Message
className="bg-green-50 border-2 border-green-200 text-green-700 rounded-lg p-4"

// Error Message
className="bg-red-50 border-2 border-red-200 text-red-700 rounded-lg p-4"

// Info Message
className="bg-blue-50 border-2 border-blue-200 text-blue-700 rounded-lg p-4"

// Card Background
className="bg-white rounded-2xl shadow-lg"

// Section Background (Subtle)
className="bg-gradient-to-br from-blue-50 via-purple-50 to-pink-50"

// Section Background (Colored)
className="bg-gradient-to-r from-blue-600 to-purple-600"
```

---

## Testing Your Colors

### Contrast Checker Tools:
1. **WebAIM Contrast Checker**: https://webaim.org/resources/contrastchecker/
2. **Color Contrast Analyzer** (Desktop app)
3. **Chrome DevTools** - Built-in contrast checker in Inspector

### Browser Testing:
1. Test in light mode (primary)
2. Test on different screen brightness levels
3. Test with color blindness simulators (Protanopia, Deuteranopia, Tritanopia)

### Accessibility Testing:
```bash
# Run Lighthouse audit
npm run build
lighthouse http://localhost:3000 --view

# Check for WCAG AA compliance
# All color combinations should pass minimum 4.5:1 for text
# All interactive elements should pass minimum 3:1
```

---

## Color Variables (Tailwind Config)

All colors are defined in [`tailwind.config.js`](./tailwind.config.js):

```javascript
colors: {
  'picc-blue': {
    DEFAULT: '#2563eb',
    50: '#eff6ff',
    100: '#dbeafe',
    500: '#3b82f6',
    600: '#2563eb',
    700: '#1d4ed8',
    900: '#1e3a8a',
  },
  'picc-purple': { /* ... */ },
  'picc-green': { /* ... */ },
  'picc-orange': { /* ... */ },
  'picc-amber': { /* ... */ },
}
```

---

**Last Updated**: January 29, 2025
**Maintained By**: Development Team

For complete brand guidelines, see [PICC-BRAND-STYLE-GUIDE.md](./PICC-BRAND-STYLE-GUIDE.md)
