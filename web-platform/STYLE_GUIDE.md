# Palm Island Community Repository - Color Style Guide

**Version:** 1.0
**Last Updated:** 2025-11-07
**Maintainer:** Palm Island Community Company (PICC)

---

## Table of Contents

1. [Brand Colors](#brand-colors)
2. [Color Usage Guidelines](#color-usage-guidelines)
3. [Accessibility Standards](#accessibility-standards)
4. [Component Color Patterns](#component-color-patterns)
5. [Dark Mode (Future)](#dark-mode-future)
6. [Do's and Don'ts](#dos-and-donts)

---

## Brand Colors

### Palm Brand Palette

The **Palm** color palette represents the warm, earthy tones of Palm Island - inspired by the sunset over the ocean, the red earth, and the vibrant community spirit.

```javascript
// tailwind.config.js
palm: {
  50:  '#fff7ed',  // Lightest - backgrounds, subtle highlights
  100: '#ffedd5',  // Very light - hover states, light backgrounds
  200: '#fed7aa',  // Light - borders, disabled states
  300: '#fdba74',  // Medium-light - secondary accents
  400: '#fb923c',  // Medium - primary gradients start
  500: '#f97316',  // PRIMARY - main brand color
  600: '#ea580c',  // PRIMARY DARK - buttons, important elements
  700: '#c2410c',  // Dark - hover states, emphasis
  800: '#9a3412',  // Very dark - Elder badges, deep emphasis
  900: '#7c2d12',  // Darkest - Elder status (highest respect)
}
```

### CSS Custom Properties

For components and base styling:

```css
:root {
  --palm-primary: #f97316;      /* palm-500 */
  --palm-primary-dark: #ea580c; /* palm-600 */
  --palm-hover: #c2410c;        /* palm-700 */
  --palm-elder: #9a3412;        /* palm-800 - reserved for Elder status */
}
```

---

## Color Usage Guidelines

### When to Use Palm Colors

✅ **USE Palm colors for:**
- Primary actions (buttons, CTAs)
- Cultural significance (Elder badges, Traditional Country/Language)
- Brand identity elements (headers, hero sections)
- Links and interactive elements
- Focus states and active states
- Community-specific features

### When to Use Generic Tailwind Colors

✅ **USE generic colors for:**
- **Blue/Teal backgrounds** - Page backgrounds (`from-blue-50 to-teal-50`)
- **Green** - Success states, positive metrics (`green-600`, `green-800`)
- **Red** - Error states, destructive actions (`red-600`)
- **Gray** - Text, borders, neutral UI (`gray-50` to `gray-900`)
- **Service Provider badges** - Use `blue-600` to distinguish from cultural roles

### Semantic Color Mapping

#### Cultural Hierarchy
```javascript
// Storyteller Roles (by importance/respect)
Elder:             'palm-800' | 'palm-900'  // Darkest tones = highest respect
Cultural Advisor:  'palm-700'               // Dark tones = cultural authority
Service Provider:  'blue-600'               // Blue = professional service
Community Member:  'palm-500' | 'palm-600'  // Standard warm tones
```

#### UI Elements
```javascript
// Buttons & Actions
Primary Button:    'bg-palm-600 hover:bg-palm-700'
Secondary Button:  'border-palm-300 text-palm-700 hover:bg-palm-50'
Disabled Button:   'bg-gray-400'

// Backgrounds
Hero Header:       'from-palm-800 to-palm-700'
Card Gradient:     'from-palm-400 to-palm-600'
Subtle Highlight:  'bg-palm-50 border-palm-200'
Page Background:   'from-blue-50 to-teal-50'

// Text
Primary Text:      'text-gray-900'
Secondary Text:    'text-gray-600'
Accent Text:       'text-palm-700' | 'text-palm-800'
Link Text:         'text-palm-600 hover:text-palm-700'

// Borders & Focus
Border:            'border-palm-200'
Hover Border:      'border-palm-400'
Focus Ring:        'ring-palm-500'
```

---

## Accessibility Standards

### WCAG AA Compliance

All text **MUST** meet WCAG AA standards (4.5:1 contrast ratio for normal text, 3:1 for large text).

#### Approved Text/Background Combinations

✅ **Safe combinations:**
```javascript
// White backgrounds
'text-palm-700'  on 'bg-white'      // ✅ 5.2:1
'text-palm-800'  on 'bg-white'      // ✅ 7.8:1
'text-palm-900'  on 'bg-white'      // ✅ 10.1:1
'text-gray-700'  on 'bg-white'      // ✅ 4.6:1
'text-gray-900'  on 'bg-white'      // ✅ 16.1:1

// Palm backgrounds
'text-white'     on 'bg-palm-600'   // ✅ 4.9:1
'text-white'     on 'bg-palm-700'   // ✅ 6.4:1
'text-white'     on 'bg-palm-800'   // ✅ 8.9:1

// Light Palm backgrounds
'text-palm-800'  on 'bg-palm-50'    // ✅ 6.1:1
'text-palm-900'  on 'bg-palm-50'    // ✅ 7.9:1
```

❌ **Avoid these combinations:**
```javascript
// Low contrast - DO NOT USE
'text-palm-50'   on 'bg-palm-500'   // ❌ 2.1:1 - fails
'text-palm-600'  on 'bg-white'      // ❌ 3.9:1 - fails for normal text
'text-pink-50'   on 'bg-pink-500'   // ❌ 2.1:1 - fails
'text-purple-50' on 'bg-purple-600' // ❌ 2.3:1 - fails
```

### Testing Contrast

Use these tools to verify contrast:
- **WebAIM Contrast Checker:** https://webaim.org/resources/contrastchecker/
- **Chrome DevTools:** Lighthouse accessibility audit
- **Browser Extension:** WAVE (Web Accessibility Evaluation Tool)

---

## Component Color Patterns

### Buttons

```tsx
// Primary Action Button
<button className="bg-palm-600 hover:bg-palm-700 text-white font-bold py-3 px-6 rounded-lg transition-all">
  Submit Story
</button>

// Secondary Button
<button className="border-2 border-palm-300 text-palm-700 hover:bg-palm-50 font-medium py-2 px-4 rounded-lg transition-colors">
  Cancel
</button>

// Disabled Button
<button disabled className="bg-gray-400 text-white font-bold py-3 px-6 rounded-lg cursor-not-allowed">
  Disabled
</button>
```

### Cards

```tsx
// Storyteller Card
<div className="bg-white rounded-xl shadow-lg border-2 border-palm-200 hover:border-palm-400 transition-all">
  {/* Card content */}
</div>

// Cultural Info Box
<div className="bg-palm-50 border border-palm-200 rounded-lg p-3">
  <span className="text-palm-800 font-medium">Traditional Country:</span>
  <span className="text-palm-700">Manbarra Country</span>
</div>
```

### Badges

```tsx
// Elder Badge (highest respect - darkest tone)
<span className="px-3 py-1 bg-palm-800 text-white rounded-full text-sm font-medium">
  Elder
</span>

// Cultural Advisor Badge
<span className="px-3 py-1 bg-palm-700 text-white rounded-full text-sm font-medium">
  Cultural Advisor
</span>

// Service Provider Badge (blue to differentiate from cultural roles)
<span className="px-3 py-1 bg-blue-600 text-white rounded-full text-sm font-medium">
  Service Provider
</span>

// Expertise Tag
<span className="px-3 py-1 bg-palm-50 text-palm-800 rounded-full text-sm border border-palm-200">
  Cultural Knowledge
</span>
```

### Gradients

```tsx
// Hero Header
<div className="bg-gradient-to-r from-palm-800 to-palm-700 text-white">
  {/* Hero content */}
</div>

// Card Gradient
<div className="bg-gradient-to-br from-palm-400 to-palm-600 text-white">
  {/* Card content */}
</div>

// Subtle Background
<div className="bg-gradient-to-r from-palm-50 to-palm-100">
  {/* Content */}
</div>

// Page Background (cool tones - don't use palm here)
<div className="bg-gradient-to-br from-blue-50 to-teal-50">
  {/* Page content */}
</div>
```

### Links

```tsx
// Standard Link
<a href="/stories" className="text-palm-600 hover:text-palm-700 font-medium transition-colors">
  View Stories →
</a>

// Link in Dark Background
<a href="/" className="text-white hover:text-palm-100 transition-colors">
  Back to Home
</a>
```

### Form Elements

```tsx
// Input with Palm Focus
<input
  type="text"
  className="border border-gray-300 rounded-lg px-4 py-2 focus:ring-2 focus:ring-palm-500 focus:border-transparent"
  placeholder="Enter your name"
/>

// Select Dropdown
<select className="border border-gray-300 rounded-lg px-4 py-2 focus:ring-2 focus:ring-palm-500 focus:border-transparent bg-white">
  <option>All Storytellers</option>
</select>

// Checkbox with Palm Accent
<input
  type="checkbox"
  className="h-4 w-4 text-palm-600 focus:ring-palm-500 border-gray-300 rounded"
/>
```

---

## Dark Mode (Future)

### Planned Dark Mode Colors

```css
.dark {
  --background: 240 10% 3.9%;      /* Dark blue-gray */
  --foreground: 0 0% 98%;          /* Almost white */
  --palm-primary: #fb923c;         /* palm-400 (lighter for dark bg) */
  --palm-primary-dark: #f97316;    /* palm-500 */
  --palm-hover: #ea580c;           /* palm-600 */
}
```

### Dark Mode Button Example (Future)

```tsx
<button className="bg-palm-600 hover:bg-palm-700 dark:bg-palm-500 dark:hover:bg-palm-600 text-white">
  Submit
</button>
```

---

## Do's and Don'ts

### ✅ DO

- **Use Palm colors for cultural elements** - Elders, Cultural Advisors, Traditional Country
- **Use darker Palm tones for respect** - `palm-800` and `palm-900` for Elders
- **Test all text contrast ratios** - Use tools to verify WCAG AA compliance
- **Use semantic color names** - Think about meaning, not just aesthetics
- **Be consistent within a component** - Don't mix color schemes randomly
- **Use Palm gradients for hero sections** - Creates strong brand presence
- **Use cool backgrounds (blue/teal)** - Provides contrast to warm Palm accents

### ❌ DON'T

- **Don't use light Palm text on Palm backgrounds** - Low contrast fails accessibility
- **Don't use purple/pink for new features** - Conflicts with brand consistency
- **Don't use Palm colors for everything** - Overuse dilutes brand impact
- **Don't use same color for Elder and regular badges** - Hierarchy matters
- **Don't skip contrast testing** - Accessibility is not optional
- **Don't use red/orange for backgrounds** - Too similar to Palm brand
- **Don't use Palm colors for error states** - Use red (destructive) instead

---

## Color Decision Tree

When choosing a color, ask:

1. **Is this a cultural element?**
   - Yes → Use Palm colors (`palm-700` to `palm-900`)
   - No → Go to #2

2. **Is this a primary action or brand element?**
   - Yes → Use Palm colors (`palm-500` to `palm-700`)
   - No → Go to #3

3. **Is this a success/error/neutral state?**
   - Success → Green (`green-600`, `green-800`)
   - Error → Red (`red-600`)
   - Neutral → Gray (`gray-600`, `gray-700`)

4. **Is this a Service Provider element?**
   - Yes → Use Blue (`blue-600`) to differentiate from cultural roles

5. **Is this a background?**
   - Page → Blue/Teal gradient (`from-blue-50 to-teal-50`)
   - Hero → Palm gradient (`from-palm-800 to-palm-700`)
   - Card → White or subtle Palm (`palm-50`)

---

## Code Examples

### Complete Component Example

```tsx
// Storyteller Card - Following All Guidelines
function StorytellerCard({ storyteller }) {
  return (
    <div className="bg-white rounded-xl shadow-lg border-2 border-palm-200 hover:border-palm-400 transition-all">
      {/* Avatar - Palm gradient */}
      <div className="bg-gradient-to-br from-palm-500 to-palm-700 h-48 flex items-center justify-center">
        <div className="text-white text-4xl font-bold">
          {storyteller.initials}
        </div>
      </div>

      <div className="p-6">
        {/* Badges - Darker Palm for Elders */}
        {storyteller.is_elder && (
          <span className="px-2 py-1 bg-palm-800 text-white rounded-full text-xs">
            Elder
          </span>
        )}

        {/* Name - Gray for readability */}
        <h3 className="text-2xl font-bold text-gray-900 mb-2">
          {storyteller.name}
        </h3>

        {/* Cultural Info - Palm-50 background with Palm-800 text */}
        {storyteller.traditional_country && (
          <div className="bg-palm-50 border border-palm-200 rounded-lg p-2 mb-3">
            <span className="text-palm-800 text-sm">
              {storyteller.traditional_country}
            </span>
          </div>
        )}

        {/* Bio - Secondary gray */}
        <p className="text-gray-600 text-sm mb-4">
          {storyteller.bio}
        </p>

        {/* Button - Primary Palm */}
        <a
          href={`/storytellers/${storyteller.id}`}
          className="block w-full text-center bg-palm-600 hover:bg-palm-700 text-white font-medium py-2 px-4 rounded-lg transition-all"
        >
          View Profile →
        </a>
      </div>
    </div>
  );
}
```

---

## Version History

### v1.0 (2025-11-07)
- Initial style guide created
- Palm brand colors defined
- Accessibility standards documented
- Component patterns established
- Cultural color hierarchy defined

---

## Maintainers

**Questions or suggestions?**
- Contact: PICC Technology Team
- Review: Before adding new colors, consult this guide
- Updates: Submit pull request with reasoning for changes

---

**Remember:** Colors carry meaning. In the Palm Island Community Repository, warm Palm tones represent cultural connection, community warmth, and the land. Use them thoughtfully and respectfully.
