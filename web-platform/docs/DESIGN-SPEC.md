# PICC Annual Report Design Specification

## Overview

This document defines the visual design system for the PICC Annual Report PDF generator, based on analysis of the official 2023-24 annual report design.

---

## Color Palette

### Primary Colors
```
PICC_PURPLE      = #5B2D8E    # Primary brand purple
PICC_LAVENDER    = #D4B8E8    # Light lavender/pink
PICC_BLUE        = #4A90B8    # Ocean blue
PICC_DARK_BLUE   = #3A5F8A    # Deep blue for headers
PICC_TEAL        = #5BA8B0    # Teal accent
```

### Secondary Colors
```
PICC_PINK        = #E8A4C4    # Pink accent
PICC_GREEN       = #6B9B7A    # Green for nature sections
PICC_GOLD        = #D4A855    # Gold from turtle logo
PICC_ORANGE      = #E07840    # Orange accent
```

### Neutral Colors
```
WHITE            = #FFFFFF
OFF_WHITE        = #F5F5F5
LIGHT_GRAY       = #E8E8E8
DARK_GRAY        = #333333
BLACK            = #1A1A1A
```

---

## Typography

### Headings (Hand-Drawn Style)
- **Main Titles**: Custom brush-stroke style font (simulated with bold condensed serif)
- **Fallback**: Georgia Bold, Playfair Display Bold, or similar serif
- **Size**: 36-48pt for main titles, 24-32pt for section headers

### Body Text
- **Font**: Clean sans-serif (Helvetica, Arial, Open Sans)
- **Size**: 10-11pt for body text
- **Line Height**: 1.4-1.5
- **Color**: Dark gray (#333333) on light backgrounds, white on dark backgrounds

### Signatures
- **Style**: Script/cursive (simulated italic serif)
- **Size**: 14-16pt

---

## Layout Grid

### Page Size
- A4 Portrait: 210mm x 297mm (595pt x 842pt)

### Margins
- **Cover/Back Cover**: Full bleed (0mm)
- **Content Pages**: 20mm left/right, 25mm top, 30mm bottom
- **Gutter**: 10mm for two-column layouts

### Two-Column Layout
- Column width: 85mm each
- Gutter: 10mm
- Used for: Leadership pages, content spreads

---

## Design Elements

### 1. Circular Photo Frames
```
- Diameter: 120-150pt
- Border: 2pt white or matching background
- Decorative dots: White circles (4pt diameter) arranged in arc above frame
- Spacing: 15-20 dots, 8pt apart
```

### 2. Wave Patterns (Bottom Decoration)
```
Three layered waves:
- Top wave: Lavender (#D4B8E8) with dot pattern
- Middle wave: Purple/blue (#5B8FB9) with dot pattern
- Bottom wave: Dark blue (#3A5F8A) with dot pattern

Wave characteristics:
- Organic curved shapes
- Dots: 6pt white circles, scattered irregularly
- Height: ~80-100pt total
```

### 3. White Circle Container
```
- Used for: Cover title, back cover contact info
- Diameter: 280-320pt
- Background: White (#FFFFFF)
- Shadow: Subtle drop shadow (optional)
- Position: Center of page, slightly above middle
```

### 4. Dot Patterns
```
- Cultural motif representing connection to land/sea
- Size: 4-6pt diameter
- Color: White or light tint of background
- Spacing: Irregular, organic placement
- Density: 20-40 dots per decorative area
```

---

## Page Templates

### Cover Page
```
Layout:
┌─────────────────────────────────┐
│     [Full-bleed beach photo]    │
│                                 │
│         [Turtle Logo]           │
│    "Palm Island"                │
│    COMMUNITY COMPANY            │
│                                 │
│      ┌───────────────┐          │
│      │  2023 - 2024  │          │
│      │    ANNUAL     │          │
│      │    REPORT     │          │
│      └───────────────┘          │
│                                 │
│  ~~~~~~~~~~~~ Waves ~~~~~~~~~~~~│
└─────────────────────────────────┘
```

### Leadership Pages (Spread)
```
┌─────────────────┬─────────────────┐
│ [Beach Photo]   │ [Beach Photo]   │
│                 │                 │
│   (○) CEO Photo │   (○) Chair     │
│    ....dots.... │    ....dots.... │
│                 │                 │
│ Message from    │ Message from    │
│ the CEO         │ the Chair       │
│                 │                 │
│ [Body text]     │ [Body text]     │
│                 │                 │
│ Rachel Atkinson │ Luella Bligh    │
│ ~~~~~~~~~~~~~   │ ~~~~~~~~~~~~    │
└─────────────────┴─────────────────┘
```

### Content Page
```
┌─────────────────────────────────┐
│ PICC ANNUAL REPORT 2023-2024   │
├─────────────────────────────────┤
│                                 │
│  Section Title                  │
│  ══════════════                 │
│                                 │
│  [Body text in columns]         │
│                                 │
│  ┌─────────┐  ┌─────────┐      │
│  │ Stat    │  │ Stat    │      │
│  │ Card    │  │ Card    │      │
│  └─────────┘  └─────────┘      │
│                                 │
│  [Photo or chart area]          │
│                                 │
├─────────────────────────────────┤
│             [Page #]            │
└─────────────────────────────────┘
```

### Data Page
```
┌─────────────────────────────────┐
│ PICC ANNUAL REPORT 2023-2024   │
├─────────────────────────────────┤
│                                 │
│  Report Card                    │
│  ═══════════                    │
│                                 │
│  ┌─────────────────────────────┐│
│  │ Table Header (Blue)         ││
│  ├─────────────────────────────┤│
│  │ Row 1                       ││
│  │ Row 2 (alt color)           ││
│  │ Row 3                       ││
│  └─────────────────────────────┘│
│                                 │
│  [Bar Chart]                    │
│                                 │
├─────────────────────────────────┤
│             [Page #]            │
└─────────────────────────────────┘
```

### Back Cover
```
┌─────────────────────────────────┐
│     [Full-bleed beach photo]    │
│                                 │
│                                 │
│      ┌───────────────┐          │
│      │ PALM ISLAND   │          │
│      │ COMMUNITY     │          │
│      │ COMPANY       │          │
│      │               │          │
│      │ 61-73 Sturt St│          │
│      │ Townsville    │          │
│      │ 07 4421 4300  │          │
│      │ picc.com.au   │          │
│      └───────────────┘          │
│                                 │
│  ~~~~~~~~~~~~ Waves ~~~~~~~~~~~~│
└─────────────────────────────────┘
```

---

## Chart Styles

### Bar Charts
```
Colors (in order):
- 2023/24: Pink (#E8A4C4)
- 2022/23: Blue (#4A90B8)
- 2021/22: Purple (#5B2D8E)

Bar styling:
- Width: 20-25pt
- Spacing: 8pt between bars
- Labels: 9pt sans-serif
```

### Pie Charts
```
Colors (clockwise):
- Purple (#5B2D8E)
- Blue (#4A90B8)
- Teal (#5BA8B0)
- Pink (#E8A4C4)
- Green (#6B9B7A)

Styling:
- No outline
- 2pt white separator between segments
- Legend: Right side, 10pt text
```

### Tables
```
Header row:
- Background: Dark blue (#3A5F8A)
- Text: White, bold, 10pt

Body rows:
- Alternating: White / Light lavender (#F5F0F8)
- Text: Dark gray, 10pt
- Padding: 8pt vertical, 12pt horizontal

Border:
- None or 0.5pt light gray
```

---

## Implementation Notes

### Image Handling
- Cover/back cover: Require beach photography (provided separately)
- Fallback: Gradient backgrounds in brand colors
- Photo frames: Circular mask with feathered edge

### Font Embedding
- Embed all fonts for consistent rendering
- Use PDF standard fonts as fallback (Helvetica, Times)

### Print Considerations
- CMYK color mode for print production
- 3mm bleed on full-bleed pages
- 300dpi minimum for images

### Accessibility
- Alt text for all images
- Tagged PDF structure
- Sufficient color contrast (4.5:1 minimum)

---

## File Dependencies

### Required Assets
```
web-platform/public/images/
├── picc-turtle-logo.png
├── picc-beach-cover.jpg (or gradient fallback)
├── picc-beach-back.jpg (or gradient fallback)
├── ceo-photo.jpg
├── chair-photo.jpg
└── palm-valley.jpg
```

### Generated Assets (SVG patterns)
```
web-platform/scripts/assets/
├── wave-pattern.svg
├── dot-pattern.svg
└── decorative-arc.svg
```
