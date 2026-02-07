# Brand Skill

Load PICC brand constraints before any UI or design work.

## When to Use

- Before creating or modifying any UI component
- When designing new pages or layouts
- When working on annual report templates (web or PDF)
- When choosing colors, typography, or spacing

## Before Writing Any Code

1. Read `web-platform/PICC-BRAND-STYLE-GUIDE.md` for full reference
2. Apply the constraints below

## Color System

### Primary Palette
- **PICC Blue**: `blue-600` (#2563eb) for primary actions, `blue-900` (#1e3a8a) for headlines
- **PICC Purple**: `purple-600` (#9333ea) for gradients and highlights
- **Primary gradient**: `from-blue-600 to-purple-600` for hero sections and CTAs

### Secondary Palette
- **Success Green**: `green-600` (#16a34a) for health/services
- **Warm Orange**: `orange-600` (#ea580c) for community/energy
- **Impact Amber**: `amber-600` (#d97706) for heritage/history

### Neutrals
- Body text: `gray-700` (#374151)
- Headlines: `gray-900` (#111827)
- Backgrounds: `white`, `gray-50`, `gray-100`
- Borders: `gray-200` (#e5e7eb)

## Rules

- NEVER introduce new colors without asking
- NEVER use raw hex values — use Tailwind classes
- ALWAYS maintain WCAG 2.1 AA contrast ratios (4.5:1 for text, 3:1 for large text)
- Use the primary gradient sparingly — hero sections and primary CTAs only
- Body text is always `gray-700`, never lighter
- Black (#000000) is reserved for critical emphasis only

## Typography

- Headlines: `font-bold` with appropriate size scale
- Body: Base size, `leading-relaxed` for readability
- Generous whitespace — breathing room creates focus
- Mobile-first responsive design

## Component Patterns

Before creating new components, check existing ones in:
- `components/story-scroll/` - Scroll-based storytelling
- `components/annual-reports/` - Report-specific layouts
- `components/report/` - Interactive report elements
- `components/navigation/` - Nav patterns

Reuse existing patterns. Don't reinvent.

## PDF-Specific Branding

For WeasyPrint PDF templates:
- Use CSS variables from `annual-reports/templates/styles/picc-brand.css`
- A4 portrait, 15mm margins (12mm sides)
- Full-bleed cover page (margin: 0 on first page)
- Print-safe colors — no transparency
- Optimized for 300dpi print
