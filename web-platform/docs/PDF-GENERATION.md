# PICC Annual Report PDF Generation

## Overview

Two methods are available for generating the PICC Annual Report 2023-24 PDF:

1. **Python Script (Recommended)** - Programmatic generation using reportlab
2. **Browser Print** - Manual print-to-PDF from Next.js page

---

## Method 1: Python Script (Recommended)

### Quick Start

```bash
cd web-platform
npm run pdf:annual-report
```

Or directly:

```bash
python scripts/generate-annual-report-pdf.py
```

### Output

```
public/reports/picc-annual-report-2023-24.pdf
```

### Features

- 18 professionally formatted pages
- PICC brand colors (#5B2D8E purple, #E8DEFF lavender)
- Custom statistics cards with lavender backgrounds
- Professional tables with alternating row colors
- Quote blocks with attribution
- Cover and back cover pages
- Automatic page footers

### Technical Details

- Uses `reportlab` for PDF generation
- Uses `pypdf` to merge the back cover page
- Custom `StatCard` flowable class
- A4 page size with proper margins

### Dependencies

```bash
pip install reportlab pypdf
```

---

## Method 2: Browser Print

### Quick Start

```bash
npm run dev
# Then open: http://localhost:3000/annual-report/print
```

Or use the npm script:

```bash
npm run reports:print
```

### Steps to Generate PDF

1. Open `http://localhost:3000/annual-report/print` in Chrome
2. Press `Cmd+P` (Mac) or `Ctrl+P` (Windows)
3. Configure print settings:
   - **Destination**: Save as PDF
   - **Paper size**: A4
   - **Margins**: None
   - **Background graphics**: ✓ ON (important!)
4. Click "Save"

### Features

- Same content as Python script
- Uses CSS `@media print` rules
- Inline styles for consistent rendering
- Page breaks between sections

---

## Data Source

All report data is stored in:

```
lib/annual-report/data-2024.ts
```

This file contains:

| Export | Description |
|--------|-------------|
| `REPORT` | Title, executive summary, looking forward, acknowledgments |
| `STATISTICS` | 20 key statistics with values and labels |
| `BOARD_MEMBERS` | 7 board member names and positions |
| `LEADERSHIP_MESSAGES` | CEO and Chair full messages |
| `HIGHLIGHTS` | 6 key achievements with impact descriptions |
| `SECTIONS` | 16 report sections with content and quotes |
| `SERVICES` | 16 PICC services list |
| `PICC_COLORS` | Brand color palette |
| `getStaticReportData()` | Helper returning all data |

---

## File Structure

```
web-platform/
├── lib/annual-report/
│   └── data-2024.ts              # Static report data
├── app/(public)/annual-report/
│   ├── print/
│   │   └── page.tsx              # Browser print page
│   └── live/
│       └── page.tsx              # Live dashboard
├── scripts/
│   └── generate-annual-report-pdf.py  # Python generator
├── public/reports/
│   └── picc-annual-report-2023-24.pdf # Generated PDF
└── docs/
    └── PDF-GENERATION.md         # This file
```

---

## NPM Scripts

| Command | Description |
|---------|-------------|
| `npm run pdf:annual-report` | Generate PDF via Python |
| `npm run reports:print` | Open browser print page |
| `npm run reports:live` | Open live dashboard |
| `npm run reports:hub` | Open reports hub |

---

## Report Contents (18 Pages)

| Page | Section |
|------|---------|
| 1 | Cover Page |
| 2 | Table of Contents |
| 3 | Message from the Chair |
| 4 | Message from the CEO |
| 5 | Executive Summary |
| 6 | Year at a Glance |
| 7 | Key Highlights |
| 8 | Governance & Leadership |
| 9 | Delegated Authority |
| 10 | Health Services |
| 11 | Family Services |
| 12 | Economic Development |
| 13 | Our People |
| 14 | Financial Summary |
| 15 | Our 16 Services |
| 16 | Looking Forward |
| 17 | Acknowledgments |
| 18 | Back Cover |

---

## Customization

### Updating Content

Edit `lib/annual-report/data-2024.ts` to update:

- Statistics values
- Leadership messages
- Executive summary
- Program descriptions
- Board members

### Changing Colors

Update the `PICC_COLORS` object in `data-2024.ts`:

```typescript
export const PICC_COLORS = {
  purple: '#5B2D8E',    // Primary brand color
  lavender: '#E8DEFF',  // Secondary/highlight
  blue: '#2563EB',      // Accent
  dark: '#1A202C',      // Text/dark backgrounds
  // ...
};
```

### Adding New Sections

1. Add data to `SECTIONS` array in `data-2024.ts`
2. Update Python script `build_pdf()` function
3. Update browser print page with new section component

---

## Troubleshooting

### Python Script Issues

**Error: Module not found**
```bash
pip install reportlab pypdf
```

**Error: Permission denied**
```bash
chmod +x scripts/generate-annual-report-pdf.py
```

### Browser Print Issues

**Background colors not printing**
- Ensure "Background graphics" is enabled in print dialog

**Page breaks in wrong places**
- Check CSS `page-break-after: always` rules

**Fonts look different**
- The page uses system fonts (Georgia, Helvetica)
