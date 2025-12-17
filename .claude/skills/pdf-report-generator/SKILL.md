# PDF Report Generator Skill

Generate publication-quality PDF annual reports with professional layouts, images, icons, and branding.

## When to Use This Skill

- Creating downloadable PDF versions of annual reports
- Generating print-ready documents with PICC branding
- Converting web report content to professional PDF format
- Exporting reports with proper page breaks, headers, and footers

## Key Features

- **Professional Cover Page**: Full-bleed hero image with title overlay
- **Print-Optimized Layout**: A4 format with proper margins, page breaks
- **Image Handling**: Embedded images with captions, proper sizing
- **Icon Support**: Lucide icons rendered as SVG for crisp printing
- **Quote Styling**: Pull quotes with decorative styling
- **Service Cards**: Grid layouts that break properly across pages
- **Financial Charts**: Donut charts and breakdowns rendered for print
- **Table of Contents**: Auto-generated with page numbers

## File Structure

```
.claude/skills/pdf-report-generator/
├── SKILL.md                    # This file
├── templates/
│   └── annual-report.html      # Main PDF template
├── styles/
│   └── print.css               # Print-optimized styles
└── scripts/
    └── generate-pdf.ts         # PDF generation script
```

## Usage

### Generate PDF via API

```bash
# Generate PDF for a specific year
curl "http://localhost:3000/api/annual-reports/2024/export-pdf" -o report.pdf

# Generate and upload to storage
curl "http://localhost:3000/api/annual-reports/2024/export-pdf?upload=1"
```

### Generate PDF via Script

```bash
cd web-platform
npx tsx .claude/skills/pdf-report-generator/scripts/generate-pdf.ts --year 2024
```

## Template Sections

The PDF template includes these sections in order:

1. **Cover Page** - Full-page hero with organization branding
2. **Table of Contents** - Auto-generated section links
3. **Executive Summary** - Key message from leadership
4. **Impact Statistics** - Key numbers in visual grid
5. **CEO Message** - Full leadership message with photo
6. **Year Highlights** - Numbered achievement list
7. **Services Overview** - Service cards in grid layout
8. **Community Stories** - Story cards with images
9. **Innovation Projects** - Project showcase
10. **Financial Summary** - Donut chart and breakdown
11. **Community Voices** - Quotes with photos
12. **Leadership & Board** - Team photos and bios
13. **Acknowledgments** - Thank you section
14. **Back Cover** - Contact info and branding

## Print CSS Guidelines

The print stylesheet handles:

- **Page Breaks**: `break-before: page` for major sections
- **Avoid Breaks**: `break-inside: avoid` for cards and quotes
- **Hide Elements**: Navigation, buttons, animations hidden
- **Color Adjustments**: Print-safe colors, no transparency issues
- **Font Sizing**: Optimized for A4 print at 300dpi
- **Image Sizing**: Max dimensions to prevent overflow
- **Headers/Footers**: Page numbers, report title

## Customization

### Branding Colors

```css
:root {
  --picc-navy: #1e3a5f;
  --picc-green: #2d6a4f;
  --picc-gold: #d4a574;
  --picc-earth: #8b7355;
}
```

### Page Setup

```css
@page {
  size: A4 portrait;
  margin: 15mm 12mm 20mm 12mm;
}

@page :first {
  margin: 0; /* Full bleed cover */
}
```

## Dependencies

The PDF generation uses Playwright (already installed):

```json
{
  "devDependencies": {
    "@playwright/test": "^1.57.0"
  }
}
```

## Troubleshooting

### Images Not Loading

- Ensure images use absolute URLs or base64 encoding
- Wait for `document.fonts.ready` and image load events
- Use `networkidle` wait condition in Playwright

### Page Breaks Wrong

- Add `break-before: page` to section headers
- Use `break-inside: avoid` on cards
- Avoid breaking inside figures with captions

### Fonts Not Rendering

- Use web-safe fonts or embed via base64
- Ensure `@font-face` declarations load before PDF generation
- Wait for fonts with `document.fonts.ready`

## API Reference

### GET /api/annual-reports/[id]/export-pdf

| Parameter | Type | Description |
|-----------|------|-------------|
| id | string | Report ID (UUID) or year (2024) |
| upload | string | Set to "1" to upload to Supabase storage |
| token | string | Auth token (if ANNUAL_REPORT_EXPORT_TOKEN set) |

### Response

- Success: PDF file with `application/pdf` content type
- Error: JSON with `{ error: string }` and appropriate status code
