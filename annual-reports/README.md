# PICC Annual Report Generation System

## Overview

This system enables Palm Island Community Company to generate professional, storytelling-focused annual reports through an "always-on" content collection process. Instead of scrambling at year-end, stories flow continuously into a central database and are curated into beautiful PDF and web reports.

**Philosophy:** "Our Stories, Our Data, Our Report"

---

## Quick Start

### 1. Prerequisites

```bash
# Install Python dependencies
pip install weasyprint jinja2 pypdf supabase python-dotenv --break-system-packages

# macOS: Install system dependencies for WeasyPrint
brew install pango cairo libffi

# Ubuntu/Debian: Install system dependencies
sudo apt-get install python3-cffi python3-brotli libpango-1.0-0 libharfbuzz0b libpangoft2-1.0-0
```

### 2. Environment Setup

Create a `.env` file in the `scripts/` directory:

```env
SUPABASE_URL=https://your-project.supabase.co
SUPABASE_SERVICE_KEY=your-service-key
```

### 3. Assemble Content

```bash
cd scripts

# Pull approved stories from Supabase for 2025
python assemble_content.py --year 2025 --output ../output/report-2025-assembled.json
```

### 4. Generate PDF

```bash
# Generate PDF (and HTML preview)
python generate_pdf.py --input ../output/report-2025-assembled.json

# Generate print-ready PDF with bleeds
python generate_pdf.py --input ../output/report-2025-assembled.json --print-ready
```

### 5. Review Output

- **PDF**: `output/picc-annual-report-2025.pdf`
- **HTML Preview**: `output/picc-annual-report-2025.html`
- **Print-Ready**: `output/picc-annual-report-2025-PRINT.pdf`

---

## Directory Structure

```
annual-reports/
├── README.md                    # This file
├── templates/
│   ├── annual-report.html       # Main Jinja2 template
│   └── styles/
│       ├── picc-brand.css       # Brand colors, typography
│       └── report-layout.css    # Page layout, sections
├── scripts/
│   ├── assemble_content.py      # Pull content from Supabase
│   └── generate_pdf.py          # Generate PDF from content
├── assets/                      # Photos, logos (add your own)
│   └── photos/
└── output/                      # Generated reports
    ├── report-2025-assembled.json
    ├── picc-annual-report-2025.html
    └── picc-annual-report-2025.pdf
```

---

## Full Process Documentation

For the complete always-on content collection process, see:
**[ALWAYS-ON-ANNUAL-REPORT-PROCESS.md](../ALWAYS-ON-ANNUAL-REPORT-PROCESS.md)**

This covers:
- Year-round content collection workflow
- Monthly/quarterly review schedules
- Story submission templates
- Supabase schema requirements
- Semi-automated curation process
- PDF generation pipeline details
- Web version generation
- Print specifications

---

## Workflow Summary

```
Year-Round Collection          Semi-Automated Generation
─────────────────────          ─────────────────────────

Services submit stories  ────► Stories in Supabase
Community submissions   ────►   (approved, tagged)
Youth/Elder programs    ────►         │
                                      │
                               ┌──────▼──────┐
                               │  Selection  │
                               │   Meeting   │ ◄── May each year
                               └──────┬──────┘
                                      │
                               ┌──────▼──────┐
                               │  Assemble   │
                               │   Content   │
                               └──────┬──────┘
                                      │
                               ┌──────▼──────┐
                               │  Generate   │
                               │    PDF      │
                               └──────┬──────┘
                                      │
                               ┌──────▼──────┐
                               │   Review    │
                               │  & Refine   │
                               └──────┬──────┘
                                      │
                               ┌──────▼──────┐
                               │   Publish   │ ────► PDF, Web, Print
                               └─────────────┘
```

---

## Customization

### Adding Stories Manually

If you need to add stories without the database, edit the assembled JSON file directly:

```json
{
  "stories": [
    {
      "title": "Youth Program Wins Award",
      "subtitle": "Palm Island young people recognized nationally",
      "body": "<p>Story content here...</p>",
      "category": "Youth Story",
      "featured_image": "assets/photos/youth-award.jpg",
      "quote": {
        "text": "This award belongs to the whole community.",
        "attribution": "Youth Program Coordinator"
      },
      "services": ["Youth Service"]
    }
  ]
}
```

### Modifying the Template

Edit `templates/annual-report.html` to change the report structure. Key sections:

- `.cover-page` - Cover design
- `.leadership-spread` - CEO/Chair messages
- `.story-page` - Individual story layout
- `.financial-spread` - Financial tables and charts
- `.back-cover` - Contact information

### Adjusting Branding

Edit `templates/styles/picc-brand.css` to modify:

- Colors (CSS variables at top)
- Typography
- Decorative elements (waves, dots)
- Quote styling

---

## Troubleshooting

### WeasyPrint Installation Issues

**macOS:**
```bash
brew install pango cairo libffi
export LDFLAGS="-L/opt/homebrew/opt/libffi/lib"
export CPPFLAGS="-I/opt/homebrew/opt/libffi/include"
pip install weasyprint --break-system-packages
```

**Linux:**
```bash
sudo apt-get update
sudo apt-get install python3-cffi python3-brotli libpango-1.0-0 libharfbuzz0b libpangoft2-1.0-0 libffi-dev
```

### Fonts Not Rendering

Install the Permanent Marker font for handwritten headers:
```bash
# Download and install to system fonts
# Or use a fallback in picc-brand.css
```

### Images Not Showing

Ensure the `assets/` directory contains all referenced images, or update paths in the assembled JSON.

---

## Support

For questions about this system, see the main documentation or contact the PICC development team.

**Related Documentation:**
- [ALWAYS-ON-ANNUAL-REPORT-PROCESS.md](../ALWAYS-ON-ANNUAL-REPORT-PROCESS.md) - Full process guide
- [ANNUAL-REPORT-DESIGN-STRATEGY.md](../web-platform/ANNUAL-REPORT-DESIGN-STRATEGY.md) - Design approach
- [COLOR-PALETTE.md](../web-platform/COLOR-PALETTE.md) - Brand colors
